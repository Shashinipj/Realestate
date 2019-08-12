import React, { Component } from 'react';
import { View, StyleSheet, Text, TouchableWithoutFeedback, NativeModules, ScrollView, TouchableOpacity, Image, ImageBackground, TextInput, Modal } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';
import ImagePicker from 'react-native-image-crop-picker';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { Icon, ListItem } from 'react-native-elements';
import Meticon from 'react-native-vector-icons/MaterialCommunityIcons';
import Switch from 'react-native-switch-pro';
import firebase from 'react-native-firebase';
import RNFetchBlob from 'react-native-fetch-blob';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

import { db } from '../../Database/db';
import { placeholder } from '@babel/types';
let PropRef = db.ref('/PropertyType');

const PropertyTypes = {
    House: 1,
    Apartment: 2,
    Townhouse: 3,
    Villa: 4,
    All: -1
}

type Props = {
    navigation: NavigationScreenProp;
};

export default class AddPropertyScreen extends Component<Props> {

    static navigationOptions = {
        // header: null,
        title: 'Add Property'
    };


    constructor() {
        super();
        this.state = {
            image: null,
            images: [],
            // imagesBase64: null,
            defaultImage: null,
            title: '',
            description: '',
            price: '',

            advertisementType: 1,
            propertyType: 1,

            bedrooms: 0,
            bathrooms: 0,
            parkingSlots: 0,
            location: '',

            keyWords: '',
            keyWordsArr: [''],

            contactNumber: '',
            isFeatured: false,
            isVisible: false,
            houseCondition: '',
            landSize: 0,
            owner: '',
            PropId: null,
            search: '',
            locationModal: false

        };

        this.imageTest = null;
    }

    // pickSingleWithCamera(cropping, mediaType = 'photo') {
    //     ImagePicker.openCamera({
    //         cropping: cropping,
    //         width: 500,
    //         height: 500,
    //         includeExif: true,
    //         mediaType,
    //     }).then(image => {
    //         console.log('received image', image);
    //         this.setState({
    //             image: { uri: image.path, width: image.width, height: image.height, mime: image.mime },
    //             images: null
    //         });
    //     }).catch(e => console.log(e));
    // }



    cleanupImages() {
        ImagePicker.clean().then(() => {
            console.log('removed tmp images from tmp directory');
        }).catch(e => {
            console.log(e);
        });
    }

    // cleanupSingleImage() {
    //     let image = this.state.image || (this.state.images && this.state.images.length ? this.state.images[0] : null);
    //     console.log('will cleanup image', image);

    //     ImagePicker.cleanSingle(image ? image.uri : null).then(() => {
    //         console.log(`removed tmp image ${image.uri} from tmp directory`);
    //     }).catch(e => {
    //         console.log(e);
    //     })
    // }

    // cropLast() {
    //     if (!this.state.image) {
    //         return Alert.alert('No image', 'Before open cropping only, please select image');
    //     }

    //     ImagePicker.openCropper({
    //         path: this.state.image.uri,
    //         width: 200,
    //         height: 200
    //     }).then(image => {
    //         console.log('received cropped image', image);
    //         this.setState({
    //             image: { uri: image.path, width: image.width, height: image.height, mime: image.mime },
    //             images: null
    //         });
    //     }).catch(e => {
    //         console.log(e);
    //         Alert.alert(e.message ? e.message : e);
    //     });
    // }

    pickSingle() {
        ImagePicker.openPicker({
            width: 500,
            height: 500,
            // cropping: cropit,
            // cropperCircleOverlay: circular,
            compressImageMaxWidth: 1000,
            compressImageMaxHeight: 1000,
            compressImageQuality: 1,
            // compressVideoPreset: 'MediumQuality',
            includeExif: true,
        }).then(image => {
            console.log('received image', image);
            this.setState({
                image: { uri: image.path, width: image.width, height: image.height, mime: image.mime },
                images: null
            });

            console.log('image', this.state.image.uri);
        }).catch(e => {
            console.log(e);
            Alert.alert(e.message ? e.message : e);
        });
    }

    // pickSingleBase64(cropit) {
    //     ImagePicker.openPicker({
    //         width: 300,
    //         height: 300,
    //         cropping: cropit,
    //         includeBase64: true,
    //         includeExif: true,
    //     }).then(image => {
    //         console.log('received base64 image');
    //         this.setState({
    //             image: { uri: `data:${image.mime};base64,` + image.data, width: image.width, height: image.height },
    //             images: null
    //         });
    //     }).catch(e => console.log(e));
    // }

    pickMultiple() {
        const { images: savedImages } = this.state;

        ImagePicker.openPicker({
            multiple: true,
            waitAnimationEnd: false,
            includeExif: true,
            forceJpg: true,
            // includeBase64: true,
            maxFiles: 8 - (savedImages ? savedImages.length : 0)
        }).then(images => {
            this.setState({
                image: null,
                images: [
                    ...(savedImages || []),
                    ...(images.map(i => {
                        console.log('received image', i);
                        return { uri: i.path, width: i.width, height: i.height, mime: i.mime };
                        // return { uri: `data:${images.mime};base64,`+images.data, width: images.width, height: images.height};
                    }))
                ],
                // defaultImage: this.state.images[1]

            });

            console.log('this.state.images', this.state.images);
        }).catch(e => console.log(e));

    }

    // scaledHeight(oldW, oldH, newW) {
    //     return (oldH / oldW) * newW;
    // }


    uploadImages(imgarr, index, userUID, propID, callback) {
        if (index >= imgarr.length) {
            if (callback) {
                callback();
            }
        } else {
            const currentImage = imgarr[index];

            this.getSelectedImages(currentImage, userUID, propID)
                .then(() => {
                    this.uploadImages(imgarr, index + 1, userUID, propID, callback);
                });
        }
    }

    getSelectedImages(currentImage, uid, propID) {

        return new Promise((resolve, reject) => {

            console.log('currentImage', currentImage);

            const image = currentImage.uri

            const Blob = RNFetchBlob.polyfill.Blob
            const fs = RNFetchBlob.fs
            window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
            window.Blob = Blob


            let uploadBlob = null
            const imageRef = firebase.storage().ref(`PropImages/${uid}/${propID}/${(new Date().getTime())}`);
            let mime = 'image/jpg'
            fs.readFile(image, 'base64')
                .then((data) => {
                    return Blob.build(data, { type: `${mime};BASE64` })
                })
                .then((blob) => {
                    uploadBlob = blob
                    // return imageRef.put(blob, { contentType: mime })
                    return imageRef.put(blob._ref, { contentType: mime });
                })
                .then(() => {
                    uploadBlob.close()
                    return imageRef.getDownloadURL()
                })
                .then((url) => {
                    // URL of the image uploaded on Firebase storage
                    console.log(url);

                    resolve(true);
                })
                .catch((error) => {
                    console.log(error);

                    reject(error);
                });

        });

        // let photo = currentImage.map(img => img.image);
        // photo.forEach((image, i) => {
        //     const sessionId = new Date().getTime();
        //     const Blob = RNFetchBlob.polyfill.Blob;
        //     const fs = RNFetchBlob.fs;
        //     window.XMLHttpRequest =
        //         RNFetchBlob.polyfill.XMLHttpRequest;
        //     window.Blob = Blob;
        //     let uploadBlob = null;
        //     let mime = 'image/jpg';
        //     // const imageRef = this.image.child(`${sessionId}${i}`);
        //     const imageRef = firebase.storage().ref(`PropImages/${uid}/${propID}/${sessionId}${i}`);
        //     fs.readFile(image, 'base64')
        //         //     .then((data) => {
        //         //         return Blob.build(data, { type: `${mime};BASE64` })
        //         //     })
        //         //     .then((blob) => {
        //         //         uploadBlob = blob;
        //         //         return imageRef.put(blob, { contentType: mime })
        //         //     })
        //         //     .then(() => {
        //         //         uploadBlob.close();
        //         //         return imageRef.getDownloadURL()
        //         //     })
        //         //     .then((url) => {
        //         //     console.log(url)                                        
        //         //    })
        //         //     .catch((error) => {

        //         //     });

        //         .then((data) => {
        //             return Blob.build(data, { type: `${mime};BASE64` })
        //         })
        //         .then((blob) => {
        //             uploadBlob = blob
        //             // return imageRef.put(blob, { contentType: mime })
        //             return imageRef.put(blob._ref, { contentType: mime });
        //         })
        //         .then(() => {
        //             uploadBlob.close()
        //             return imageRef.getDownloadURL()
        //         })
        //         .then((url) => {
        //             // URL of the image uploaded on Firebase storage
        //             console.log(url);

        //         })
        //         .catch((error) => {
        //             console.log(error);
        //         })

        // })

    }

    locationModalVisible(visible) {
        this.setState({
            locationModal: visible
        });
    }

    renderLocationModal() {

        return (
            <Modal
                // animationType="slide"

                transparent={false}
                visible={this.state.locationModal}
                onRequestClose={() => {
                    Alert.alert('Modal has been closed.');
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    {/* <View style={{ width: '90%',backgroundColor:'gray' }}> */}

                    <GooglePlacesAutocomplete
                        placeholder='enter the property location'
                        minLength={2} // minimum length of text to search
                        autoFocus={true}
                        value={this.state.location}
                        returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
                        listViewDisplayed={true}   // true/false/undefined
                        fetchDetails={true}
                        // renderDescription={row => row.description} // custom description render
                        renderDescription={row => row.description || row.formatted_address || row.name}
                        // renderDescription={row =>  row.formatted_address}
                        onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
                            console.log(data, details);
                            console.log(data.description);
                            // this.setFilterModalVisible();
                            this.setState({
                                location: data.description
                            });
                            this.locationModalVisible(false);
                            // this.setValue(data);
                        }}

                        getDefaultValue={() => ''}

                        query={{
                            // available options: https://developers.google.com/places/web-service/autocomplete
                            key: 'AIzaSyBMtFjgIpHg7Eu44iugytPzRYoG_1V7pOA',
                            language: 'en', // language of the results
                            types: '(cities)', // default: 'geocode'
                            region: "LK",
                            components: 'country:lk'
                        }}

                        styles={{
                            textInputContainer: {
                                width: '100%',
                                backgroundColor: '#bdbdbd',
                                borderTopWidth: 0,
                                // borderBottomWidth: 1,
                                // borderBottomColor: "#000",
                                marginTop: 20
                            },
                            description: {
                                fontWeight: 'bold',
                            },
                            predefinedPlacesDescription: {
                                color: '#757575'
                            },


                        }}

                        currentLocation={true} // Will add a 'Current location' button at the top of the predefined places list
                        currentLocationLabel="Current location"
                        nearbyPlacesAPI='GooglePlacesSearch' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
                        GoogleReverseGeocodingQuery={{
                            // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
                        }}
                        GooglePlacesSearchQuery={{
                            // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
                            rankby: 'distance'
                        }}

                        filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities
                        // predefinedPlaces={[homePlace, workPlace]}
                        // predefinedPlaces={this.state.recentSearchList}

                        debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
                        // renderLeftButton={()  => <Image source={require('path/custom/left-icon')} />}
                        renderRightButton={() => <View style={{ alignSelf: 'center', marginRight: 10 }}>
                            <TouchableOpacity onPress={() => {
                                this.locationModalVisible(false);
                                // this.props.navigation.navigate('Search');
                            }}>
                                <Text >cancel</Text>
                            </TouchableOpacity>
                        </View>}
                    />
                </View>

                {/* </View> */}

            </Modal>
        );
    }

    resetPropertyView() {

        return new Promise((resolve, reject) => {

            this.setState({
                image: null,
                images: null,
                // imagesBase64: null,
                defaultImage: null,
                title: '',
                description: '',
                price: '',

                advertisementType: 1,
                propertyType: 1,

                bedrooms: null,
                bathrooms: null,
                parkingSlots: null,
                location: '',

                keyWords: '',
                keyWordsArr: [],

                contactNumber: null,
                isFeatured: false,
                houseCondition: '',
                landSize: 0,
                owner: '',
                PropId: null

            }, () => {
                resolve();
            });
        });
    }

    renderImage(image) {
        return (
            <TouchableOpacity style={{}} onPress={() => {
                this.setState({
                    defaultImage: image
                })
            }} >
                <ImageBackground style={{ width: 100, height: 100, resizeMode: 'cover', margin: 5 }} source={image} >
                    <TouchableOpacity style={{ alignItems: 'flex-end', marginRight: -7, marginTop: -7 }} onPress={() => this.removeImages(image)}>
                        <Ionicon name="md-close-circle-outline" size={20} color={'grey'} />
                    </TouchableOpacity>

                </ImageBackground>
            </TouchableOpacity>

        );
    }

    removeImages(image) {
        let arr = this.state.images;
        arr.splice(image, 1);

        this.setState({
            images: arr
        });

    }

    renderInitialImage(i) {
        return (
            <View>
                <Image style={{ width: 300, height: 200, resizeMode: 'cover', margin: 5 }} source={i} />
            </View>
        );
    }

    isAdvertisementTypeButtonPress(buttonNo) {
        this.setState({
            advertisementType: buttonNo
        });
    }

    isPropertyTypeButtonPressed(btnNo) {
        this.setState({
            propertyType: btnNo
        });
    }

    isFeaturedEnable(value) {

        this.setState({
            isFeatured: value
        });
    }

    isVisibleEnable(value) {

        this.setState({
            isVisible: value
        });
    }

    addNewProperty() {

        db.ref(`PropertyType/${this.state.advertisementType}/Property`).push(
            {

            }
        ).then((fbRef) => {
            console.log('Inserted!', fbRef.key)

            this.setState({
                PropId: fbRef.key
            })

            const user = firebase.auth().currentUser;

            db.ref(`Users/${user.uid}/UserProperties/${fbRef.key}`).set(true)
                .then(() => {
                    db.ref(`PropertyType/${this.state.advertisementType}/Property/${fbRef.key}`)
                        .set(
                            {
                                Title: this.state.title,
                                Address: this.state.location,
                                Bathrooms: this.state.bathrooms,
                                Bedrooms: this.state.bedrooms,
                                CarPark: this.state.parkingSlots,
                                Description: this.state.description,
                                Features: this.state.keyWordsArr,
                                LandSize: this.state.landSize,
                                Owner: this.state.owner,
                                ContactNumber: this.state.contactNumber,
                                Price: this.state.price,
                                PropAction: this.state.advertisementType,
                                PropId: fbRef.key,
                                PropTypeId: this.state.propertyType,
                                isFeatured: this.state.isFeatured,
                                Condition: this.state.houseCondition,
                                Visible: this.state.isVisible
                            })
                        .then(() => {
                            console.log('Inserted!');
                            console.log('image1', this.state.images);
                            // this.getSelectedImages(this.state.images, user.uid, fbRef.key);
                            this.uploadImages(this.state.images, 0, user.uid, fbRef.key, () => {
                                console.log('Upload DONE: ');
                            });
                            this.resetPropertyView();

                            // if (this.state.images && this.state.images.length ) {


                            // }

                            this.props.navigation.pop();
                        }).catch((error) => {
                            console.log(error)
                        });
                });

        }).catch((error) => {
            console.log(error)
        });

        // const user = firebase.auth().currentUser;
        // this. getSelectedImages( this.state.images, user.uid, fbRef.key);
    }

    returnImageScrollView() {

        const { images: savedImages } = this.state;
        let arrLength = savedImages ? savedImages.length : 0

        if (arrLength < 8) {
            return (

                // <TouchableOpacity onPress={this.pickMultiple.bind(this)}>
                <TouchableOpacity onPress={this.pickMultiple.bind(this)}>
                    <View style={{ backgroundColor: '#e0e0e0', width: 100, height: 100, alignItems: 'center', justifyContent: 'center', margin: 5 }}>
                        <Icon
                            name="add-a-photo"
                            type='MaterialIcons'
                            size={30}
                        />
                    </View>

                </TouchableOpacity>

            );
        }
        else {
            return null
        }
    }

    getKeyWords(text) {

        this.setState({
            keyWords: text,
            keyWordsArr: text.split(",")
        });
        // console.log(this.state.keyWordsArr)
    }

    render() {

        const { images: savedImages } = this.state;
        arrLength = savedImages ? savedImages.length : 0

        return (

            <View style={styles.container}>
                <ScrollView style={{}}>
                    <View style={{ alignItems: 'center' }}>

                        <View style={{ backgroundColor: 'grey', width: 300, height: 200, alignItems: 'center', justifyContent: 'center' }}>

                            {this.state.defaultImage ? <Image source={this.state.defaultImage} style={{ width: 300, height: 200, alignItems: 'center' }} />
                                : <Text style={{ fontWeight: '600', color: 'white' }}>Select a default image</Text>
                            }

                        </View>

                        <View style={{ height: 130 }}>

                            <ScrollView horizontal={true}
                                style={{ marginTop: 10, flex: 1 }}
                            >

                                {/* {this.state.images ? this.state.images.map(i => <View key={i.uri} style={{}}>{this.renderImage(i)}</View>) :
                                    null
                                } */}

                                {/* {this.returnImageScrollView.bind(this)} */}

                                {arrLength == 0 ?

                                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                        {/* <TouchableOpacity onPress={this.pickMultiple.bind(this)}> */}
                                        <TouchableOpacity onPress={this.pickMultiple.bind(this)}>
                                            <View style={{ backgroundColor: '#e0e0e0', width: 100, height: 100, alignItems: 'center', justifyContent: 'center', margin: 5 }}>
                                                <Icon
                                                    name="add-a-photo"
                                                    type='MaterialIcons'
                                                    size={30}
                                                />
                                            </View>

                                        </TouchableOpacity>


                                        {/* <TouchableOpacity onPress={this.pickMultiple.bind(this)}>
                                            <View style={{ backgroundColor: '#e0e0e0', width: 90, height: 90, alignItems: 'center', justifyContent: 'center', margin: 5 }}>
                                                
                                            </View>

                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={this.pickMultiple.bind(this)}>
                                            <View style={{ backgroundColor: '#e0e0e0', width: 90, height: 90, alignItems: 'center', justifyContent: 'center', margin: 5 }}>
                                              
                                            </View>

                                        </TouchableOpacity> */}

                                    </View>

                                    :

                                    // (arrLength == 1 ?
                                    //     <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                    //         <TouchableOpacity onPress={this.pickMultiple.bind(this)}>
                                    //             <View style={{ backgroundColor: '#e0e0e0', width: 100, height: 100, alignItems: 'center', justifyContent: 'center', margin: 5 }}>
                                    //                 <Icon
                                    //                     name="add-a-photo"
                                    //                     type='MaterialIcons'
                                    //                     size={30}
                                    //                 />
                                    //             </View>

                                    //         </TouchableOpacity>

                                    //         <TouchableOpacity onPress={this.pickMultiple.bind(this)}>
                                    //             <View style={{ backgroundColor: '#e0e0e0', width: 90, height: 90, alignItems: 'center', justifyContent: 'center', margin: 5 }}>
                                    //                 {/* <Icon
                                    //                 name="add-a-photo"
                                    //                 type='MaterialIcons'
                                    //                 size={30}
                                    //             /> */}
                                    //             </View>

                                    //         </TouchableOpacity>

                                    //     </View>

                                    //     :

                                    (
                                        (arrLength < 8 ?
                                            // <TouchableOpacity onPress={this.pickMultiple.bind(this)}>
                                            <TouchableOpacity onPress={this.pickMultiple.bind(this)}>
                                                <View style={{ backgroundColor: '#e0e0e0', width: 100, height: 100, alignItems: 'center', justifyContent: 'center', margin: 5 }}>
                                                    <Icon
                                                        name="add-a-photo"
                                                        type='MaterialIcons'
                                                        size={30}
                                                    />
                                                </View>

                                            </TouchableOpacity>

                                            : null))

                                    // )
                                }

                                {this.state.images ? this.state.images.map(i => <View key={i.uri} style={{}}>{this.renderImage(i)}</View>) :
                                    null
                                }

                                {/* {this.state.image ? <View style={{}}>{this.renderImage(this.state.image)}</View> :
                                    null
                                } */}

                            </ScrollView>
                        </View>

                    </View>


                    <View style={{ alignItems: 'flex-start', margin: 10, backgroundColor: '#ffffff' }}>
                        <View style={{ margin: 10, width: '90%' }}>
                            <Text style={{ textAlign: 'left', fontWeight: '500', fontSize: 15, color: 'grey' }}>Title</Text>
                            <TextInput
                                style={{ borderColor: 'black', borderBottomWidth: 1, fontSize: 14 }}
                                // maxLength={300}
                                onChangeText={(title) => this.setState({ title })}
                                value={this.state.title}
                            />
                        </View>

                        <View style={{ margin: 10, width: '90%' }}>
                            <Text style={{ textAlign: 'left', fontWeight: '500', fontSize: 15, color: 'grey' }}>Description</Text>
                            <TextInput
                                style={{ borderColor: 'black', borderBottomWidth: 1, fontSize: 14 }}
                                multiline={true}
                                onChangeText={(description) => this.setState({ description })}
                                value={this.state.description}
                            />
                        </View>

                        <View style={{ margin: 10, width: '90%' }}>
                            <Text style={{ textAlign: 'left', fontWeight: '500', fontSize: 15, color: 'grey' }}>Price</Text>
                            <TextInput
                                style={{ borderColor: 'black', borderBottomWidth: 1, fontSize: 14 }}
                                onChangeText={(price) => this.setState({ price })}
                                value={this.state.price}
                                keyboardType='numeric'
                            />
                        </View>

                        <View style={{ margin: 10 }}>
                            <Text style={{ textAlign: 'left', fontWeight: '500', fontSize: 15, color: 'grey' }}>Type of Advertisement</Text>
                            <View style={styles.buttonSetView}>
                                <TouchableOpacity
                                    style={
                                        this.state.advertisementType == 1
                                            ? { flex: 1, backgroundColor: '#424242', borderTopLeftRadius: 5, borderBottomLeftRadius: 5 } : { flex: 1 }
                                    }
                                    onPress={() => this.isAdvertisementTypeButtonPress(1)}
                                >
                                    <View style={[styles.subButtonView, { borderRightWidth: 1, height: 30 }]}>
                                        <Text style={
                                            this.state.advertisementType == 1 ?
                                                [styles.propertyTypeText, { color: 'white' }] : styles.propertyTypeText}>TO SELL</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={
                                        this.state.advertisementType == 2
                                            ? { flex: 1, backgroundColor: '#424242' } : { flex: 1 }
                                    }

                                    onPress={() => this.isAdvertisementTypeButtonPress(2)}
                                >
                                    <View style={styles.subButtonView}>
                                        <Text style={
                                            this.state.advertisementType == 2 ?
                                                [styles.propertyTypeText, { color: 'white' }] : styles.propertyTypeText}>TO RENT</Text>
                                    </View>
                                </TouchableOpacity>

                            </View>
                        </View>

                        <View style={{ margin: 10, height: 150 }}>
                            <Text style={{ textAlign: 'left', fontWeight: '500', fontSize: 15, color: 'grey' }}>Property Type</Text>
                            <ScrollView horizontal={true} >

                                <View style={styles.propertyTypeView}>
                                    <TouchableOpacity onPress={() => this.isPropertyTypeButtonPressed(1)}>
                                        <View style={
                                            this.state.propertyType == 1 ? [styles.propertTypeButtons, { backgroundColor: '#424242' }]
                                                : styles.propertTypeButtons
                                        }>

                                            <Meticon name='home-outline' size={30} color={this.state.propertyType == 1 ? 'white' : 'gray'} />

                                        </View>
                                    </TouchableOpacity>
                                    <Text>House</Text>
                                </View>

                                <View style={styles.propertyTypeView}>
                                    <TouchableOpacity onPress={() => this.isPropertyTypeButtonPressed(2)}>
                                        <View style={
                                            this.state.propertyType == 2 ? [styles.propertTypeButtons, { backgroundColor: '#424242' }]
                                                : styles.propertTypeButtons
                                        }>
                                            <Meticon name='home-outline' size={30} color={this.state.propertyType == 2 ? 'white' : 'gray'} />

                                        </View>
                                    </TouchableOpacity>
                                    <Text style={{ textAlign: 'center' }}>Apartment{"\n&"} house </Text>
                                </View>

                                <View style={styles.propertyTypeView}>
                                    <TouchableOpacity onPress={() => this.isPropertyTypeButtonPressed(3)}>
                                        <View style={
                                            this.state.propertyType == 3 ? [styles.propertTypeButtons, { backgroundColor: '#424242' }]
                                                : styles.propertTypeButtons
                                        }>

                                            <Meticon name='home-outline' size={30} color={this.state.propertyType == 3 ? 'white' : 'gray'} />

                                        </View>
                                    </TouchableOpacity>
                                    <Text>Townhouse</Text>
                                </View>

                                <View style={styles.propertyTypeView}>
                                    <TouchableOpacity onPress={() => this.isPropertyTypeButtonPressed(4)}>
                                        <View style={
                                            this.state.propertyType == 4 ? [styles.propertTypeButtons, { backgroundColor: '#424242' }]
                                                : styles.propertTypeButtons
                                        }>
                                            <Meticon name='home-outline' size={30} color={this.state.propertyType == 4 ? 'white' : 'gray'} />

                                        </View>
                                    </TouchableOpacity>
                                    <Text>Villa</Text>
                                </View>
                            </ScrollView>
                        </View>

                        <View style={{ margin: 10, width: '90%' }}>
                            <Text style={{ textAlign: 'left', fontWeight: '500', fontSize: 15, color: 'grey' }}>Number Of Bedrooms</Text>
                            <TextInput
                                style={{ borderColor: 'black', borderBottomWidth: 1, fontSize: 14 }}
                                onChangeText={(bedrooms) => this.setState({ bedrooms })}
                                value={this.state.bedrooms}
                                keyboardType='numeric'
                            />
                        </View>

                        <View style={{ margin: 10, width: '90%' }}>
                            <Text style={{ textAlign: 'left', fontWeight: '500', fontSize: 15, color: 'grey' }}>Number Of Bathrooms</Text>
                            <TextInput
                                style={{ borderColor: 'black', borderBottomWidth: 1, fontSize: 14 }}
                                onChangeText={(bathrooms) => this.setState({ bathrooms })}
                                value={this.state.bathrooms}
                                keyboardType='numeric'
                            />
                        </View>

                        <View style={{ margin: 10, width: '90%' }}>
                            <Text style={{ textAlign: 'left', fontWeight: '500', fontSize: 15, color: 'grey' }}>Parking Slots</Text>
                            <TextInput
                                style={{ borderColor: 'black', borderBottomWidth: 1, fontSize: 14 }}
                                onChangeText={(parkingSlots) => this.setState({ parkingSlots })}
                                value={this.state.parkingSlots}
                                keyboardType='numeric'
                            />
                        </View>
                        <View style={{ margin: 10, width: '90%' }}>
                            <Text style={{ textAlign: 'left', fontWeight: '500', fontSize: 15, color: 'grey' }}>Location</Text>
                            {/* <TextInput
                                style={{ borderColor: 'black', borderBottomWidth: 1, fontSize: 14 }}
                                onChangeText={(location) => this.setState({ location })}
                                value={this.state.location}
                            /> */}

                            <TouchableWithoutFeedback onPress={() => {
                                this.locationModalVisible(true);
                            }}>

                                <View style={{ height: 20, borderBottomWidth: 1 }}>
                                    <Text>{this.state.location}</Text>
                                </View>

                            </TouchableWithoutFeedback>


                        </View>

                        <View style={{ margin: 10, width: '90%' }}>
                            <Text style={{ textAlign: 'left', fontWeight: '500', fontSize: 15, color: 'grey' }}>Land Size</Text>
                            <TextInput
                                style={{ borderColor: 'black', borderBottomWidth: 1, fontSize: 14 }}
                                onChangeText={(landSize) => this.setState({ landSize })}
                                value={this.state.landSize}
                                keyboardType='numeric'
                            />
                        </View>

                        <View style={{ margin: 10, width: '90%' }}>
                            <Text style={{ textAlign: 'left', fontWeight: '500', fontSize: 15, color: 'grey' }}>Keywords</Text>
                            <TextInput
                                style={{ borderColor: 'black', borderBottomWidth: 1, fontSize: 14, paddingBottom: 5 }}
                                multiline={true}
                                placeholder='e.g Pool, garage'
                                onChangeText={
                                    (keyWords) => this.getKeyWords(keyWords)
                                }
                                value={this.state.keyWords}
                            />
                        </View>

                        <View style={{ margin: 10, width: '90%' }}>
                            <Text style={{ textAlign: 'left', fontWeight: '500', fontSize: 15, color: 'grey' }}>Condition of the House</Text>
                            <TextInput
                                style={{ borderColor: 'black', borderBottomWidth: 1, fontSize: 14 }}
                                onChangeText={(houseCondition) => this.setState({ houseCondition })}
                                value={this.state.houseCondition}
                            />
                        </View>

                        <View style={{ margin: 10, width: '90%' }}>
                            <Text style={{ textAlign: 'left', fontWeight: '500', fontSize: 15, color: 'grey' }}>Property Owner</Text>
                            <TextInput
                                style={{ borderColor: 'black', borderBottomWidth: 1, fontSize: 14 }}
                                // maxLength={300}
                                onChangeText={(owner) => this.setState({ owner })}
                                value={this.state.owner}
                            />
                        </View>

                        <View style={{ margin: 10, width: '90%' }}>
                            <Text style={{ textAlign: 'left', fontWeight: '500', fontSize: 15, color: 'grey' }}>Contact Number</Text>
                            <TextInput
                                style={{ borderColor: 'black', borderBottomWidth: 1, fontSize: 14 }}
                                onChangeText={(contactNumber) => this.setState({ contactNumber })}
                                value={this.state.contactNumber}
                                keyboardType='numeric'
                            />
                        </View>



                        <View style={{ margin: 10, width: '90%', flexDirection: 'row' }}>
                            <Text style={{ textAlign: 'left', fontWeight: '500', fontSize: 15, color: 'grey' }}>is Featured</Text>
                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                <Switch
                                    value={this.state.isFeatured}
                                    onSyncPress={() => { this.isFeaturedEnable(!this.state.isFeatured) }}
                                    style={{}}
                                />

                            </View>
                        </View>

                        <View style={{ margin: 10, width: '90%', flexDirection: 'row' }}>
                            <Text style={{ textAlign: 'left', fontWeight: '500', fontSize: 15, color: 'grey' }}>Display Property</Text>
                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                <Switch
                                    value={this.state.isVisible}
                                    onSyncPress={() => { this.isVisibleEnable(!this.state.isVisible) }}
                                    style={{}}
                                />

                            </View>
                        </View>


                        {/* <View> */}

                        {/* <TouchableOpacity onPress={() => this.pickSingleWithCamera(false)} style={styles.button}>
                        <Text style={styles.text}>Select Single Image With Camera</Text>
                    </TouchableOpacity> */}
                        {/* <TouchableOpacity onPress={() => this.pickSingleWithCamera(true)} style={styles.button}>
                        <Text style={styles.text}>Select Single With Camera With Cropping</Text>
                    </TouchableOpacity> */}
                        {/* <TouchableOpacity onPress={() => this.pickSingle(false)} style={styles.button}>
                                <Text style={styles.text}>Select Single</Text>
                            </TouchableOpacity> */}
                        {/* <TouchableOpacity onPress={() => this.cropLast()} style={styles.button}>
                        <Text style={styles.text}>Crop Last Selected Image</Text>
                    </TouchableOpacity> */}
                        {/* <TouchableOpacity onPress={() => this.pickSingleBase64(false)} style={styles.button}>
                        <Text style={styles.text}>Select Single Returning Base64</Text>
                    </TouchableOpacity> */}
                        {/* <TouchableOpacity onPress={() => this.pickSingle(true)} style={styles.button}>
                        <Text style={styles.text}>Select Single With Cropping</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.pickSingle(true, true)} style={styles.button}>
                        <Text style={styles.text}>Select Single With Circular Cropping</Text>
                    </TouchableOpacity> */}
                        {/* <TouchableOpacity onPress={this.pickMultiple.bind(this)} style={styles.button}>
                        <Text style={styles.text}>*Select Multiple*</Text>
                    </TouchableOpacity> */}
                        {/* <TouchableOpacity onPress={this.cleanupImages.bind(this)} style={styles.button}>
                        <Text style={styles.text}>Cleanup All Images</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.cleanupSingleImage.bind(this)} style={styles.button}>
                        <Text style={styles.text}>Cleanup Single Image</Text>
                    </TouchableOpacity> */}
                        {/* </View> */}

                    </View>

                </ScrollView>


                <View style={{ height: 50, backgroundColor: 'rgba(244, 244, 244, .97)', alignItems: 'center' }}>
                    <TouchableOpacity
                        onPress={() => {
                            // this.setFilterModalVisible();
                            // this.props.navigation.navigate('SearchResultView', {
                            //     data: {
                            //         ...this.state
                            //     }
                            // });
                            console.log('Add button clicked');
                            this.addNewProperty();

                            // this.props.navigation.navigate('ProfileScreen');
                        }}

                    >
                        <View style={{
                            backgroundColor: '#49141E', marginVertical: 7, flex: 1, marginHorizontal: 10, width: 300,
                            borderRadius: 7, alignItems: 'center', justifyContent: 'center'
                        }}>
                            {/* <Icon
                                name="search"
                                type='MaterialIcons'
                                size={30}
                                color='white'
                            /> */}
                            <Text style={{ color: 'white', fontWeight: '600' }}>Add</Text>
                        </View>
                    </TouchableOpacity>

                </View>

                {this.renderLocationModal()}

            </View>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
        paddingTop: 20
    },
    button: {
        backgroundColor: 'blue',
        marginBottom: 10
    },
    text: {
        color: 'white',
        fontSize: 20,
        textAlign: 'center'
    },
    buttonSetView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderRadius: 5,
        borderWidth: 1,
        marginTop: 15,
        // marginBottom: 15,
        borderColor: '#424242',
        alignSelf: 'center',
        // backgroundColor:'green'
    },
    propertyTypeText: {
        fontSize: 12
    },
    subButtonView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    propertyTypeView: {
        alignItems: 'center',
        marginHorizontal: 10,
        paddingTop: 10
    },
    propertTypeButtons: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 1,
        marginBottom: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },
});
