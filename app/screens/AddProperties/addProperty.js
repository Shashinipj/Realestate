import React, { Component } from 'react';
import {
    View, StyleSheet, Text, TouchableWithoutFeedback, NativeModules, ScrollView, TouchableOpacity,
    Image, ImageBackground, TextInput, Modal, ActivityIndicator, KeyboardAvoidingView, SafeAreaView,
    Linking
} from 'react-native';
import { NavigationScreenProp } from 'react-navigation';
import ImagePicker from 'react-native-image-crop-picker';
import Ionicon from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Entypo from 'react-native-vector-icons/Entypo';
import { Icon, ListItem } from 'react-native-elements';
import Meticon from 'react-native-vector-icons/MaterialCommunityIcons';
import Switch from 'react-native-switch-pro';
import firebase from 'react-native-firebase';
import RNFetchBlob from 'react-native-fetch-blob';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { Marker } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import { PagerTabIndicator, IndicatorViewPager, PagerTitleIndicator, PagerDotIndicator } from 'rn-viewpager';
import RNPickerSelect from 'react-native-picker-select';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Octicons from 'react-native-vector-icons/Octicons';

import { db } from '../../Database/db';
let PropRef = db.ref('/PropertyType');

type Props = {
    navigation: NavigationScreenProp;
};

Geocoder.init("AIzaSyBMtFjgIpHg7Eu44iugytPzRYoG_1V7pOA", { language: "en" });

const imagePickerList = [
    {
        label: 'Open Camera',
        value: 1,
    },
    {
        label: 'Open Gallery',
        value: 2,
    }
];

const PAGE_INDEX = {
    PROPERTY_DETAILS: 0,
    OWNER_DETAILS: 1
};

export default class AddPropertyScreen extends Component<Props> {

    static navigationOptions = {
        // header: null,
        title: 'Add Property'
    };

    /**
     * @type {Marker}
     */
    refMarker = null;

    /**
     * @type {IndicatorViewPager}
     */
    refViewPager = null;

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
            lat: '',
            lon: '',

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
            locationModal: false,

            imgUrlArr: [],
            loading: false,

            mapModalVisible: false,

            mapCenter: null,

            currentLat: null,
            currentLon: null,
            currentLocation: false,

            streetNo: null,
            street: null,
            area: null,

            addressConfirmationModalVisible: false,
            selectedImagePicker: null
        };

        this.imageTest = null;
    }

    componentDidMount() {

        this.getCurrentLocation().then(() => {
            console.log("successfully leaded data!");
            // this.loadData().then(() => {
            //     console.log("successfully leaded data!");
            // }).catch((error) => {
            //     console.log("data loading error", error);
            // })
        }).catch((error) => {
            // Alert.alert(error.message);

            Alert.alert(
                'RealEstate does not have access to your location. To enable access, tap Settings > Location',
                '',
                [
                    {
                        text: 'Cancel',
                        // onPress: () => this.loadData(),
                        style: 'cancel',

                    },
                    {
                        text: 'Settings',
                        onPress: () => {
                            Linking.openURL('app-settings:');
                        }
                    },
                ],
                { cancelable: true },
            );
        });
    }

    getCurrentLocation() {

        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                position => {

                    const latitude = Number(position.coords.latitude.toFixed(6));
                    const longitude = Number(position.coords.longitude.toFixed(6));

                    console.log("latitudeaaaa", latitude);
                    console.log("longitudeaaaa", longitude);

                    this.setState({
                        currentLat: latitude,
                        currentLon: longitude,
                        currentLocation: true
                    });

                    resolve(true);

                },
                (error) => {
                    reject(error);
                },
                { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
            );

        });
    }


    showAddressConfirmationModal(visible) {
        this.setState({
            addressConfirmationModalVisible: visible
        });
    }



    // cleanupImages() {
    //     ImagePicker.clean().then(() => {
    //         console.log('removed tmp images from tmp directory');
    //     }).catch(e => {
    //         console.log(e);
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

    pickSingleWithCamera(cropping, mediaType = 'photo') {

        const { images: savedImages } = this.state;

        ImagePicker.openCamera({
            cropping: cropping,
            width: 500,
            height: 500,
            includeExif: true,
            mediaType,
        }).then(image => {
            console.log('received image', image);
            this.setState({
                images: [
                    ...(savedImages || []),
                    { uri: image.path, width: image.width, height: image.height, mime: image.mime }
                ],
            });
        }).catch(e => console.log(e));
    }


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
                }).catch((error) => {
                    console.log("error", error);
                })
        }
    }

    getSelectedImages(currentImage, uid, propID) {

        return new Promise((resolve, reject) => {

            console.log('currentImage', currentImage);

            const image = currentImage.uri

            const Blob = RNFetchBlob.polyfill.Blob
            const fs = RNFetchBlob.fs
            // window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
            // window.Blob = Blob

            let imageUrl = [];
            let uploadBlob = null
            const imgName = new Date().getTime();

            console.log('imgName', imgName);
            const imageRef = firebase.storage().ref(`PropImages/${propID}/${imgName}`);
            let mime = 'image/jpg'
            fs.readFile(image, 'base64')
                .then((data) => {
                    return Blob.build(data, { type: `${mime};BASE64` })
                })
                .then((blob) => {
                    uploadBlob = blob
                    return imageRef.put(blob._ref, { contentType: mime });
                })
                .then(() => {
                    uploadBlob.close()
                    return imageRef.getDownloadURL()
                })
                .then((url) => {
                    // URL of the image uploaded on Firebase storage
                    console.log(url);
                    this.state.imgUrlArr.push(url);
                    console.log('imgUrlArr', this.state.imgUrlArr);
                    resolve(true);
                })
                .catch((error) => {
                    console.log(error);

                    reject(error);
                });
        });
    }

    renderDotIndicator() {
        return <PagerDotIndicator pageCount={2}
            // dotStyle={{ backgroundColor: '#212121' }}
            // selectedDotStyle={{ backgroundColor: '#bdbdbd' }} 
            ref={(ref) => {
                this.refs = ref;
            }}

        />;
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
                resolve(true);
            });
        });
    }


    // locationModalVisible(visible) {
    //     this.setState({
    //         locationModal: visible
    //     });
    // }

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

        this.setState({
            loading: true
        });

        db.ref(`PropertyType/${this.state.advertisementType}/Property`).push(
            {

            }
        ).then((fbRef) => {

            const user = firebase.auth().currentUser;

            this.setState({
                PropId: fbRef.key
            })
            this.uploadImages(this.state.images, 0, user.uid, fbRef.key, () => {
                console.log('Upload DONE: ');
                this.addToFirebaseDB(fbRef)
            });

            console.log('Inserted!', fbRef.key)

        }).catch((error) => {
            console.log(error)
        });
    }


    addToFirebaseDB(fbRef) {

        const user = firebase.auth().currentUser;
        const addedDate = new Date().getTime();

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
                            Visible: this.state.isVisible,
                            images: this.state.imgUrlArr,
                            lat: this.state.lat,
                            lon: this.state.lon,
                            AddedDate: addedDate,
                        })
                    .then(() => {
                        console.log('Inserted!!!');
                        // console.log('image1', this.state.images);
                        this.setState({
                            loading: false
                        });
                        alert("Succefully Added!");
                        this.resetPropertyView();

                        this.props.navigation.pop();
                    }).catch((error) => {
                        console.log(error)
                    });
            });
    }

    openImagePickerMethod() {
        console.log("done pressed", this.state.selectedImagePicker)
        if (this.state.selectedImagePicker == 1) {
            this.pickSingleWithCamera(true);
        }
        else if (this.state.selectedImagePicker == 2) {
            this.pickMultiple();
        }
        else
            null;
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

    setMapModalVisible(visible) {
        // return new Promise((resolve, reject) => {
        this.setState({
            mapModalVisible: visible
        });
        //     resolve(true);
        // });
    }

    checkEmptyFields() {
        const { title, description, price, owner, location, images, contactNumber } = this.state

        if (images.length > 0) {
            if (title != '') {
                if (description != '') {
                    if (price != '') {
                        if (location != '') {
                            if (owner != '') {
                                if (contactNumber != '') {
                                    // alert('success');
                                    this.addNewProperty();
                                } else {
                                    alert('Please enter contact number');
                                }
                            } else {
                                alert('Please enter the owner');
                            }
                        } else {
                            alert('Please enter the location for the property');
                        }
                    } else {
                        alert('Please enter price for the property');
                    }
                } else {
                    alert('Please enter a description for the property');
                }
            } else {
                alert('Please enter a title for the property');
            }
        } else {
            alert('Please upload images of the property');
        }
    }

    showMapModal() {
        console.log('map modal visible');

        // const { navigation } = this.props;
        // const property = navigation.getParam('PropertyData');

        return (
            <View style={{ flex: 1 }}>
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.mapModalVisible}
                    onRequestClose={() => {
                        Alert.alert('Modal has been closed.');
                    }}>

                    <SafeAreaView>

                        <View style={{ marginTop: 10, backgroundColor: 'white', justifyContent: 'center' }}>

                            <TouchableOpacity
                                style={{
                                    // backgroundColor: "red",
                                    alignSelf: "flex-start",
                                    padding: 10
                                }}
                                onPress={() => {
                                    this.setMapModalVisible(false);
                                    // this.onLoginSuccess.bind(this);
                                }}>

                                <Icon
                                    name="close"
                                    type='MaterialIcons'
                                    size={20}
                                />

                            </TouchableOpacity>
                        </View>

                        <View>
                            <MapView
                                ref={(ref) => {
                                    this.refMapView = ref;
                                }}
                                style={styles.mapViewExpand}
                                initialRegion={{
                                    latitude: this.state.currentLat,
                                    longitude: this.state.currentLon,
                                    // latitude: 6.92,
                                    // longitude: 79.86,
                                    latitudeDelta: 0.0922,
                                    longitudeDelta: 0.0421,
                                }}
                                onMapReady={() => {
                                    if (this.refMarker) {
                                        this.refMarker.showCallout();
                                    }
                                }}
                                onRegionChange={(region) => {

                                    if (this.refMapView) {
                                        this.refMapView.getCamera()
                                            .then((cam) => {

                                                console.log("Map CENTER: ", cam.center);

                                                this.setState({
                                                    mapCenter: cam.center
                                                });

                                            });
                                    }
                                }}
                            >

                                {
                                    this.state.mapCenter ? (
                                        <Marker
                                            // draggable

                                            ref={(ref) => {
                                                this.refMarker = ref;
                                            }}
                                            coordinate={this.state.mapCenter}
                                            // title={property.Owner}
                                            // description={property.PropType}


                                            onSelect={() => console.log('onSelect', arguments)}
                                            onDrag={() => console.log('onDrag', arguments)}
                                            onDragStart={() => console.log('onDragStart', arguments)}
                                            onDragEnd={() => console.log('onDragEnd', arguments)}
                                        />
                                    ) : null
                                }

                                {/* <View style={{ flex: 1, justifyContent:'flex-end', marginBottom: 150}}> */}
                                <TouchableOpacity style={{
                                    backgroundColor: '#212121', padding: 5, width: '90%', borderRadius: 5, alignSelf: 'center', alignItems: 'center'
                                    // bottom: 150, alignSelf: 'center', 
                                }}
                                    onPress={() => {
                                        // this.setMapModalVisible(false);
                                        console.log("this.state.mapCenter", this.state.mapCenter);
                                        this.getLocationFromGeocoder().then(() => {
                                            // this.showAddressConfirmationModal(true);
                                            this.setMapModalVisible(false);
                                            // this.setState({
                                            //     loading: false
                                            // });
                                        }).catch((e) => {
                                            console.log("error", e);
                                        })
                                        // this.locationModalVisible(false);

                                        // this.locationModalVisible(false);
                                    }}
                                >
                                    <Text style={{ color: '#e0e0e0', fontWeight: '500', fontSize: 15 }}>Set location</Text>
                                </TouchableOpacity>

                                {/* </View> */}

                            </MapView>

                        </View>
                    </SafeAreaView>
                    {this.renderAddressConfirmationModal()}

                </Modal>

            </View>

        );
    }

    getLocationFromGeocoder() {

        const mapcenter = this.state.mapCenter;
        // this.setState({
        //     loading: true
        // });

        return new Promise((resolve, reject) => {

            Geocoder.from(mapcenter.latitude, mapcenter.longitude)
                .then(json => {
                    var addressComponent0 = json.results[0].address_components[0];
                    var addressComponent1 = json.results[0].address_components[1];
                    var addressComponent2 = json.results[0].address_components[2];
                    this.setState({
                        location: addressComponent0.long_name + ', ' + addressComponent1.long_name + ', ' + addressComponent2.long_name,
                        streetNo: addressComponent0.long_name,
                        street: addressComponent1.long_name,
                        area: addressComponent2.long_name,
                        lat: mapcenter.latitude,
                        lon: mapcenter.longitude,
                    });
                    console.log('aaaaa', addressComponent0, addressComponent1, addressComponent2);
                    resolve(true);
                })
                .catch(error => {
                    console.log(error);
                    reject(error);
                });

            console.log('full location', this.state.location);
        });

    }

    renderAddressConfirmationModal() {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={this.state.addressConfirmationModalVisible}
                onRequestClose={() => {
                    Alert.alert('Modal has been closed.');
                }}>

                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    <View style={{
                        width: '80%', backgroundColor: '#e0e0e0'
                    }}>

                        <TouchableOpacity onPress={() => {
                            this.showAddressConfirmationModal(false);
                        }}
                            style={{ alignSelf: 'flex-start', backgroundColor: 'blue', justifyContent: 'flex-start' }}
                        >
                            <Text>Close</Text>
                        </TouchableOpacity>

                        <View style={{ margin: 10, backgroundColor: 'orange', alignItems: 'center', justifyContent: 'center' }}>
                            {/* <TextInput
                                style={{
                                    borderColor: 'black', borderWidth: 1, fontSize: 14, height: 30, margin: 2,
                                    backgroundColor: 'white', paddingHorizontal: 5, width: '90%', borderRadius: 6
                                }}
                                // maxLength={300}
                                placeholder='House No'
                                onChangeText={(streetNo) => this.setState({ streetNo })}
                                value={this.state.streetNo}
                            />

                            <TextInput
                                style={{
                                    borderColor: 'black', borderWidth: 1, fontSize: 14, height: 30, margin: 2,
                                    backgroundColor: 'white', paddingHorizontal: 5, width: '90%', borderRadius: 6
                                }}
                                // maxLength={300}
                                placeholder='Street'
                                onChangeText={(street) => this.setState({ street })}
                                value={this.state.street}
                            />

                            <TextInput
                                style={{
                                    borderColor: 'black', borderWidth: 1, fontSize: 14, height: 30, margin: 2,
                                    backgroundColor: 'white', paddingHorizontal: 5, width: '90%', borderRadius: 6
                                }}
                                // maxLength={300}
                                placeholder='City'
                                onChangeText={(area) => this.setState({ area })}
                                value={this.state.area}
                            /> */}

                        </View>

                    </View>
                </View>

            </Modal>
        );
    }


    removeImages(imgIndex) {
        /**
         * @type {any[]}
         */
        let arr = this.state.images;

        arr.splice(imgIndex, 1);

        this.setState({
            images: arr
        });

    }

    renderImage(image, index) {
        return (
            <TouchableOpacity style={{}} onPress={() => {
                this.setState({
                    defaultImage: image
                })
            }} >
                <ImageBackground style={{ width: 100, height: 100, resizeMode: 'cover', margin: 5 }} source={image} >
                    <TouchableOpacity style={{ alignItems: 'flex-end', marginRight: -7, marginTop: -7 }} onPress={() => this.removeImages(index)}>
                        <Ionicon name="md-close-circle-outline" size={20} color={'grey'} />
                    </TouchableOpacity>

                </ImageBackground>
            </TouchableOpacity>

        );
    }

    renderInitialImage(i) {
        return (
            <View>
                <Image style={{ width: 300, height: 200, resizeMode: 'cover', margin: 5 }} source={i} />
            </View>
        );
    }

    renderPickerSelectPicker() {
        return (
            <RNPickerSelect
                placeholder={'placeholder'}
                // disabled={!this.state.sortModalVisible}
                items={imagePickerList}
                onValueChange={value => {
                    // this.getSortType(value);
                    this.setState({
                        selectedImagePicker: value
                    });
                    console.log(value);

                }}
                onDonePress={() => {
                    // this.pickMultiple();
                    this.openImagePickerMethod();
                }}
                style={pickerSelectStyles}
                value={this.state.selectedImagePicker}
            // ref={el => {
            //   this.inputRefs.favSport0 = el;
            // }}
            >

                <View style={{
                    backgroundColor: '#ffffff', width: 100, height: 100, alignItems: 'center', justifyContent: 'center', margin: 5
                }}>
                    <Icon
                        name="add-a-photo"
                        type='MaterialIcons'
                        size={30}
                    />
                    {/* {this.renderPickerSelectPicker()} */}
                </View>
                {console.log("pickervisible")}
            </RNPickerSelect>

        );
    }


    render() {

        const { images: savedImages } = this.state;
        arrLength = savedImages ? savedImages.length : 0

        return (

            <KeyboardAvoidingView style={styles.container} behavior={'padding'}>
                {(this.state.loading) ?
                    <View style={{ flex: 1 }}>
                        <ActivityIndicator
                            size='small'
                            color="#757575"
                            style={styles.activityIndicator}
                        />
                    </View>

                    :

                    // <ScrollView style={{}}>

                    <IndicatorViewPager
                        style={{ height: '100%' }}
                        autoPlayEnable={false}
                        ref={(ref) => {
                            this.refViewPager = ref;
                        }}
                        
                    // indicator={this.renderDotIndicator()}
                    // horizontalScroll={false}
                    
                    >
                        <View style={{ backgroundColor: '#eeeeee' }}>
                            <ScrollView>
                                <KeyboardAvoidingView behavior={'padding'}>
                                    <View style={{ alignItems: 'center' }} >

                                        {/* <View style={{ backgroundColor: 'grey', width: 300, height: 200, alignItems: 'center', justifyContent: 'center' }}>

                                        {this.state.defaultImage ? <Image source={this.state.defaultImage} style={{ width: 300, height: 200, alignItems: 'center' }} />
                                            : <Text style={{ fontWeight: '600', color: 'white' }}>Select a default image</Text>
                                        }

                                    </View> */}

                                        <View style={{ height: 130 }}>

                                            <ScrollView horizontal={true}
                                                style={{ marginHorizontal: 20, flex: 1 }}
                                            >

                                                {arrLength == 0 ?

                                                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                                        {/* <TouchableOpacity onPress={this.pickMultiple.bind(this)}> */}
                                                        {/* <TouchableOpacity
                                                            // onPress={this.pickMultiple.bind(this)}
                                                            onPress={() => {
                                                                // this.renderPickerSelectPicker();
                                                                this.setState({
                                                                    displayPickerView: !this.state.displayPickerView
                                                                });
                                                            }}
                                                        > */}
                                                        {/* <View style={{ backgroundColor: '#ffffff', width: 100, height: 100, alignItems: 'center', justifyContent: 'center', margin: 5 }}>
                                                                <Icon
                                                                    name="add-a-photo"
                                                                    type='MaterialIcons'
                                                                    size={30}
                                                                /> */}
                                                        {this.renderPickerSelectPicker()}
                                                        {/* </View> */}



                                                        {/* </TouchableOpacity> */}

                                                    </View>

                                                    :

                                                    (
                                                        (arrLength < 8 ?
                                                            // <TouchableOpacity onPress={this.pickMultiple.bind(this)}>
                                                            // <TouchableOpacity onPress={this.pickMultiple.bind(this)}>
                                                            //     <View style={{ backgroundColor: '#ffffff', width: 100, height: 100, alignItems: 'center', justifyContent: 'center', margin: 5 }}>
                                                            //         <Icon
                                                            //             name="add-a-photo"
                                                            //             type='MaterialIcons'
                                                            //             size={30}
                                                            //         />
                                                            //     </View>

                                                            // </TouchableOpacity>
                                                            <View>
                                                                {this.renderPickerSelectPicker()}
                                                            </View>

                                                            : null))

                                                    // )
                                                }

                                                {this.state.images && this.state.images.length ? this.state.images.map((v, i) => {
                                                    return (
                                                        <View key={"" + i} style={{}}>{this.renderImage(v, i)}</View>
                                                    );
                                                }) :
                                                    null
                                                }

                                            </ScrollView>
                                        </View>

                                    </View>

                                    <View style={{ alignItems: 'flex-start', margin: 10, backgroundColor: '#ffffff' }}>
                                        <View style={{ margin: 10, width: '90%' }}>
                                            <Text style={{ textAlign: 'left', fontWeight: '500', fontSize: 15, color: 'grey' }}>Title</Text>
                                            <TextInput
                                                style={{ borderColor: 'black', borderBottomWidth: 1, fontSize: 14, height: 30 }}
                                                // maxLength={300}
                                                onChangeText={(title) => this.setState({ title })}
                                                value={this.state.title}
                                            />
                                        </View>

                                        <View style={{ margin: 10, width: '90%' }}>
                                            <Text style={{ textAlign: 'left', fontWeight: '500', fontSize: 15, color: 'grey' }}>Description</Text>
                                            <TextInput
                                                style={{ borderColor: 'black', borderBottomWidth: 1, fontSize: 14, height: 30 }}
                                                multiline={true}
                                                onChangeText={(description) => this.setState({ description })}
                                                value={this.state.description}
                                            />
                                        </View>

                                        <View style={{ margin: 10, width: '90%' }}>
                                            <Text style={{ textAlign: 'left', fontWeight: '500', fontSize: 15, color: 'grey' }}>Price</Text>
                                            <TextInput
                                                style={{ borderColor: 'black', borderBottomWidth: 1, fontSize: 14, height: 30 }}
                                                onChangeText={(price) => this.setState({ price })}
                                                value={this.state.price}
                                                keyboardType='numeric'
                                                contextMenuHidden={true}
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

                                                            <Meticon
                                                                name='home-outline'
                                                                size={30}
                                                                color={this.state.propertyType == 1 ? 'white' : 'gray'} />

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
                                                            <FontAwesome5
                                                                name='building'
                                                                size={30}
                                                                color={this.state.propertyType == 2 ? 'white' : 'gray'} />

                                                        </View>
                                                    </TouchableOpacity>
                                                    <Text style={{ textAlign: 'center' }}>Apartment</Text>
                                                </View>

                                                <View style={styles.propertyTypeView}>
                                                    <TouchableOpacity onPress={() => this.isPropertyTypeButtonPressed(3)}>
                                                        <View style={
                                                            this.state.propertyType == 3 ? [styles.propertTypeButtons, { backgroundColor: '#424242' }]
                                                                : styles.propertTypeButtons
                                                        }>

                                                            <MaterialIcons
                                                                name='location-city'
                                                                size={30}
                                                                color={this.state.propertyType == 3 ? 'white' : 'gray'} />

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
                                                            <Octicons
                                                                name='home'
                                                                // type="Fontisto"
                                                                size={30}
                                                                color={this.state.propertyType == 4 ? 'white' : 'gray'} />

                                                        </View>
                                                    </TouchableOpacity>
                                                    <Text>Villa</Text>
                                                </View>
                                            </ScrollView>
                                        </View>

                                        <View style={{ margin: 10, width: '90%' }}>
                                            <Text style={{ textAlign: 'left', fontWeight: '500', fontSize: 15, color: 'grey' }}>Number Of Bedrooms</Text>
                                            <TextInput
                                                style={{ borderColor: 'black', borderBottomWidth: 1, fontSize: 14, height: 30 }}
                                                onChangeText={(bedrooms) => this.setState({ bedrooms })}
                                                value={this.state.bedrooms}
                                                keyboardType='numeric'
                                                contextMenuHidden={true}
                                            />
                                        </View>

                                        <View style={{ margin: 10, width: '90%' }}>
                                            <Text style={{ textAlign: 'left', fontWeight: '500', fontSize: 15, color: 'grey' }}>Number Of Bathrooms</Text>
                                            <TextInput
                                                style={{ borderColor: 'black', borderBottomWidth: 1, fontSize: 14, height: 30 }}
                                                onChangeText={(bathrooms) => this.setState({ bathrooms })}
                                                value={this.state.bathrooms}
                                                keyboardType='numeric'
                                                contextMenuHidden={true}
                                            />
                                        </View>

                                        <View style={{ margin: 10, width: '90%' }}>
                                            <Text style={{ textAlign: 'left', fontWeight: '500', fontSize: 15, color: 'grey' }}>Parking Slots</Text>
                                            <TextInput
                                                style={{ borderColor: 'black', borderBottomWidth: 1, fontSize: 14, height: 30 }}
                                                onChangeText={(parkingSlots) => this.setState({ parkingSlots })}
                                                value={this.state.parkingSlots}
                                                keyboardType='numeric'
                                                contextMenuHidden={true}
                                            />
                                        </View>

                                        <View style={{ margin: 10, width: '90%' }}>
                                            <Text style={{ textAlign: 'left', fontWeight: '500', fontSize: 15, color: 'grey' }}>Land Size (Square Feet)</Text>
                                            <TextInput
                                                style={{ borderColor: 'black', borderBottomWidth: 1, fontSize: 14, height: 30 }}
                                                onChangeText={(landSize) => this.setState({ landSize })}
                                                value={this.state.landSize}
                                                keyboardType='numeric'
                                                contextMenuHidden={true}
                                            />
                                        </View>

                                        <View style={{ margin: 10, width: '90%' }}>
                                            <Text style={{ textAlign: 'left', fontWeight: '500', fontSize: 15, color: 'grey' }}>Keywords</Text>
                                            <TextInput
                                                style={{ borderColor: 'black', borderBottomWidth: 1, fontSize: 14, paddingBottom: 5, height: 30 }}
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
                                                style={{ borderColor: 'black', borderBottomWidth: 1, fontSize: 14, height: 30 }}
                                                onChangeText={(houseCondition) => this.setState({ houseCondition })}
                                                value={this.state.houseCondition}
                                            />
                                        </View>

                                        <TouchableOpacity style={{ backgroundColor:'#212121', alignSelf:'flex-end',
                                        alignContent:'center', paddingHorizontal: 15,paddingVertical: 5, margin: 10, borderRadius: 5 }}
                                        onPress={()=>{
                                            this.refViewPager.setPage(PAGE_INDEX.OWNER_DETAILS);
                                        }}>
                                            <Text style={{color:'#e0e0e0', fontWeight:'600'}}>Next</Text>

                                        </TouchableOpacity>

                                    </View>
                                </KeyboardAvoidingView>
                            </ScrollView>

                        </View>


                        <View style={{ backgroundColor: '#eeeeee' }}>
                            <ScrollView>
                                <View style={{ alignItems: 'flex-start', margin: 10, backgroundColor: '#ffffff' }}>
                                    <View style={{ margin: 10, width: '90%' }}>
                                        <Text style={{ textAlign: 'left', fontWeight: '500', fontSize: 15, color: 'grey' }}>Property Address</Text>
                                        {/* <TextInput
                                style={{ borderColor: 'black', borderBottomWidth: 1, fontSize: 14 }}
                                onChangeText={(location) => this.setState({ location })}
                                value={this.state.location}
                            /> */}

                                        <View style={{ paddingVertical: 10 }}>
                                            {/* <Text>{this.state.location}</Text> */}
                                            {/* <TextInput
                                            style={{ borderColor: 'black', borderBottomWidth: 1, fontSize: 14, height: 30 }}
                                            onChangeText={(location) => this.setState({ location })}
                                            value={this.state.location}
                                        // keyboardType='numeric'
                                        /> */}

                                            <TextInput
                                                style={{ borderColor: 'black', borderBottomWidth: 1, fontSize: 14, height: 30 }}
                                                // maxLength={300}
                                                placeholder='House No'
                                                onChangeText={(streetNo) => this.setState({ streetNo })}
                                                value={this.state.streetNo}
                                            />

                                            <TextInput
                                                style={{ borderColor: 'black', borderBottomWidth: 1, fontSize: 14, height: 30, marginTop: 10 }}
                                                // maxLength={300}
                                                placeholder='Street'
                                                onChangeText={(street) => this.setState({ street })}
                                                value={this.state.street}
                                            />

                                            <TextInput
                                                style={{ borderColor: 'black', borderBottomWidth: 1, fontSize: 14, height: 30, marginTop: 10 }}
                                                // maxLength={300}
                                                placeholder='City'
                                                onChangeText={(area) => this.setState({ area })}
                                                value={this.state.area}
                                            />

                                        </View>

                                        <TouchableOpacity onPress={() => {
                                            // this.locationModalVisible(true);
                                            this.setMapModalVisible(true);
                                        }}>

                                            <View style={{ height: 30, marginTop: 20 }}>
                                                <Text style={{ color: '#212121' }}>Set location on map</Text>
                                            </View>

                                        </TouchableOpacity>

                                    </View>
                                </View>

                                <View style={{ alignItems: 'flex-start', margin: 10, backgroundColor: '#ffffff' }}>

                                    <View style={{ margin: 10, width: '90%' }}>
                                        <Text style={{ textAlign: 'left', fontWeight: '500', fontSize: 15, color: 'grey' }}>Property Owner</Text>
                                        <TextInput
                                            style={{ borderColor: 'black', borderBottomWidth: 1, fontSize: 14, height: 30 }}
                                            // maxLength={300}
                                            onChangeText={(owner) => this.setState({ owner })}
                                            value={this.state.owner}
                                        />
                                    </View>

                                    <View style={{ margin: 10, width: '90%' }}>
                                        <Text style={{ textAlign: 'left', fontWeight: '500', fontSize: 15, color: 'grey' }}>Contact Number</Text>
                                        <TextInput
                                            style={{ borderColor: 'black', borderBottomWidth: 1, fontSize: 14, height: 30 }}
                                            onChangeText={(contactNumber) => this.setState({ contactNumber })}
                                            value={this.state.contactNumber}
                                            keyboardType='numeric'
                                            contextMenuHidden={true}
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

                                </View>

                                <TouchableOpacity style={{ backgroundColor:'#212121', alignSelf:'flex-start',
                                        alignContent:'center', paddingHorizontal: 15,paddingVertical: 5, margin: 10, borderRadius: 5 }}
                                        onPress={()=>{
                                            this.refViewPager.setPage(PAGE_INDEX.PROPERTY_DETAILS);
                                        }}>
                                            <Text style={{color:'#e0e0e0', fontWeight:'600'}}>Back</Text>

                                        </TouchableOpacity>

                            </ScrollView>

                            <View style={{ height: 50, backgroundColor: 'rgba(244, 244, 244, .97)', alignItems: 'center', flex: 1, justifyContent: 'flex-end', marginBottom: 30 }}>
                                <TouchableOpacity
                                    onPress={() => {
                                        console.log('Add button clicked');
                                        // this.addNewProperty();
                                        this.checkEmptyFields();
                                    }}

                                >
                                    <View style={{
                                        backgroundColor: '#212121', marginVertical: 7, marginHorizontal: 10, width: 300, height: 30,
                                        borderRadius: 7, alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Text style={{ color: '#e0e0e0', fontWeight: '600' }}>Add</Text>
                                    </View>
                                </TouchableOpacity>

                            </View>

                        </View>

                        {/* 
                        <View style={{ backgroundColor: '#eeeeee' }}>
                            <View style={{ alignItems: 'flex-start', margin: 10, backgroundColor: '#ffffff' }}>

                                <View style={{ margin: 10, width: '90%' }}>
                                    <Text style={{ textAlign: 'left', fontWeight: '500', fontSize: 15, color: 'grey' }}>Property Owner</Text>
                                    <TextInput
                                        style={{ borderColor: 'black', borderBottomWidth: 1, fontSize: 14, height: 30 }}
                                        // maxLength={300}
                                        onChangeText={(owner) => this.setState({ owner })}
                                        value={this.state.owner}
                                    />
                                </View>

                                <View style={{ margin: 10, width: '90%' }}>
                                    <Text style={{ textAlign: 'left', fontWeight: '500', fontSize: 15, color: 'grey' }}>Contact Number</Text>
                                    <TextInput
                                        style={{ borderColor: 'black', borderBottomWidth: 1, fontSize: 14, height: 30 }}
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

                            </View>

                            <View style={{ height: 50, backgroundColor: 'rgba(244, 244, 244, .97)', alignItems: 'center', flex: 1, justifyContent: 'flex-end', marginBottom: 30 }}>
                                <TouchableOpacity
                                    onPress={() => {
                                        console.log('Add button clicked');
                                        // this.addNewProperty();
                                        this.checkEmptyFields();
                                    }}

                                >
                                    <View style={{
                                        backgroundColor: '#49141E', marginVertical: 7, marginHorizontal: 10, width: 300, height: 30,
                                        borderRadius: 7, alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Text style={{ color: 'white', fontWeight: '600' }}>Add</Text>
                                    </View>
                                </TouchableOpacity>

                            </View>

                        </View> */}
                    </IndicatorViewPager>

                    //  {/* </ScrollView> */}
                }

                {/* {this.renderLocationModal()} */}
                {this.showMapModal()}
                {/* {this.state.displayPickerView ? this.renderPickerSelectPicker() : null} */}


            </KeyboardAvoidingView>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
        paddingTop: 0
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
    activityIndicator: {
        flex: 1,
        height: 120
    },
    mapViewExpand: {
        width: '100%',
        height: '100%',
        // marginTop: 50
    }
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 12,
        paddingVertical: 0,
        paddingHorizontal: 0,
        //   borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 15,
        color: 'black',
        backgroundColor: 'red'
        //   paddingRight: 30, // to ensure the text is never behind the icon
    },
    inputAndroid: {
        fontSize: 12,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 0.5,
        borderColor: 'purple',
        borderRadius: 8,
        color: 'black',
        paddingRight: 30, // to ensure the text is never behind the icon
    },
});
