import React, { Component } from 'react';
import {
    View, StyleSheet, Text, Image, TouchableOpacity, SafeAreaView,
    Linking, Alert, FlatList
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Icon } from 'react-native-elements';
import Ionicon from 'react-native-vector-icons/Ionicons';
import Meticon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { Marker } from 'react-native-maps';
import ReadMore from 'react-native-read-more-text';
import ImageSlider from 'react-native-image-slider';
import Accounting from 'accounting-js';
import AntDesign from 'react-native-vector-icons/AntDesign';
import ModalSelector from 'react-native-modal-selector';
import firebase from 'react-native-firebase';
import Dialog from "react-native-dialog";
import { db } from '../../Database/db';
import getDirections from 'react-native-google-maps-directions'
import Modal from "react-native-modal";

export default class ExpandedView extends Component {

    /**
     * @type {Marker}
     */
    refMarker = null;

    static navigationOptions = ({ navigation }) => {
        // header: null,
        return {
            headerRight: <TouchableOpacity onPress={() => {
                navigation.navigate('Search');
            }}>
                {/* <Text>Home</Text> */}
                <AntDesign
                    name="home"
                    size={24}
                    style={{ marginRight: 10 }}
                // color='gray'
                />
            </TouchableOpacity>
        };
    };

    constructor(props) {
        super(props);

        this.state = {
            mapModalVisible: false,
            modalVisible: false,
            createNewCollectionDialogVisible: false,
            collectionName: '',
            propertyID: '',
            propProperties: [],
            collectionList: [],
            loggedUser: '',
            isFavourite: false,
            propertyLat: null,
            propertyLon: null,
            currentlon: null,
            currentLat: null,
            currentLocation: false
        };

        this.onValueCollection = this.onValueCollection.bind(this);
    }

    componentDidMount() {
        const user = firebase.auth().currentUser;

        const { navigation } = this.props;
        const property = navigation.getParam('PropertyData');
        const favIDs = navigation.getParam('favIDs');

        console.log('property', property);
        console.log('favIDs', favIDs);

        if (user) {
            this.getCollectionNames(user);

            this.setState({
                loggedUser: user,
                propertyID: property.PropId
            });
            this.getFavouritePropertyId();
        }

        this.setState({
            propertyLat: property.lat,
            propertyLon: property.lon
        });

    }

    componentWillUnmount() {
        const user = firebase.auth().currentUser;

        if (user) {
            db.ref(`Users/${user.uid}/Collections`).off('value', this.onValueCollection);
        }
    }

    getFavouritePropertyId() {
        const { navigation } = this.props;
        const favIDs = navigation.getParam('favIDs');
        const property = navigation.getParam('PropertyData');

        for (const favProp in favIDs) {
            const favID = favIDs[favProp]
            console.log('favPropId', favID.favPropId);
            console.log("property.PropId", property.PropId);

            if (favID.favPropId == property.PropId) {
                this.setState({
                    isFavourite: true
                })
            }
        }

    }

    getCollectionNames(user) {
        db.ref(`Users/${user.uid}/Collections`).on('value', this.onValueCollection);
    }


    /**
     * @param {firebase.database.DataSnapshot} snapshot
     */
    onValueCollection(snapshot) {
        const collections = snapshot.val();
        console.log(collections);

        const arrColl = [];
        const arrCollPropList = []
        for (const collectionId in collections) {
            // console.log('collections[collectionId]', collections[collectionId]);
            arrColl.push(collectionId);

            console.log('arrColl', arrColl);
            console.log('collectionId', collectionId);
        }

        this.setState({
            collectionList: arrColl,
            // collectionListProperties: arrCollPropList
        });
    }

    setModalVisible(visible) {
        this.setState({ mapModalVisible: visible });
    }

    renderModal() {
        console.log('render modal')
        this.setState({
            modalVisible: !this.state.modalVisible
        });
    }

    renderCollectionListItem({ item, index }) {
        return (

            <View style={{
                padding: 9, borderBottomColor: '#e0e0e0', borderBottomWidth: 1, backgroundColor: '#ffffff', flex: 1,
                alignItems: 'center', borderRadius: 5
            }}>
                <TouchableOpacity onPress={() => {
                    console.log(item.label);
                    // this.addToCollection(option.label);
                    this.renderModal();
                    this.renderModalSelectedItem(item);
                }}
                    style={{}}
                >
                    <Text>{item.label}</Text>
                </TouchableOpacity>

            </View>

        );
    }

    renderModalView() {

        const data = [];

        data.push({
            key: 0,
            label: '+ Add new...'
        })

        for (let i = 0; i < this.state.collectionList.length; i++) {
            const colName = this.state.collectionList[i];
            data.push({
                key: i + 1,
                label: colName
            });
        }


        // if (this.state.modalVisible) {
        return (
            // <ModalSelector
            //     data={data}
            //     visible={this.state.modalVisible}
            //     onChange={(option) => {

            //         console.log(option.label);
            //         // this.addToCollection(option.label);
            //         this.renderModal();
            //         this.renderModalSelectedItem(option);

            //     }}
            //     closeOnChange={true}
            //     onModalClose={() => {
            //         // this.renderModal();
            //     }}

            // />

            <Modal
                transparent={true}
                onBackdropPress={() => {
                    this.renderModal();
                }}
                // hasBackdrop={true}
                // backdropColor='yellow'
                // backdropOpacity={1}
                coverScreen={true}
                // hasBackdrop={true}
                // presentationStyle='pageSheet'

                style={{
                    padding: 0,
                    margin: 0,
                    alignItems: 'center'
                }}
                visible={this.state.modalVisible}
                onRequestClose={() => {
                    Alert.alert('Modal has been closed.');
                }}
            >
                <View style={{
                    justifyContent: 'center', width: '100%', height: '100%', position: 'absolute',
                    backgroundColor: 'rgba(95, 95, 95, .8)', alignContent:'center'
                }}>

                    <View style={{
                        alignContent: "center", padding: 20,
                        backgroundColor: '#e0e0e0', marginHorizontal: 30
                    }}>
                        <View style={{
                            backgroundColor: '#ffffff', justifyContent: 'center',
                            borderRadius: 5, paddingTop: 10, borderRadius: 5
                        }}>

                            <FlatList
                                data={data}
                                // style={{flex:1}}
                                extraData={this.state}
                                renderItem={item => this.renderCollectionListItem(item)}
                                keyExtractor={(item, index) => {
                                    return "" + index;
                                }}
                            />

                        </View>

                        <TouchableOpacity onPress={() => {
                            this.renderModal();
                        }}
                            style={{ backgroundColor: '#ffffff', marginTop: 10, padding: 5, alignItems: 'center', borderRadius: 5 }}
                        >
                            <Text style={{ color: '#212121', fontWeight: '600' }}>Close</Text>
                        </TouchableOpacity>

                    </View>

                </View>

            </Modal>
        );
        // }
    }

    createCollection() {

        console.log(this.state.collectionName);
        const user = firebase.auth().currentUser;

        // db.ref('Collections/').child(user.uid).child(this.state.collectionName).child(this.state.propertyID).set(true)
        db.ref(`Users/${user.uid}/Collections/${this.state.collectionName}/${this.state.propertyID}`).set(true)
            .then(() => {
                // const oProp = this.state.propProperties.find((val, index) => {
                //     return val.PropId == this.state.propertyID;
                // });

                // if (oProp) {
                //     oProp.isFavourite = true;
                // }
                this.setState({
                    isFavourite: true
                });
                console.log('Inserted!');
                this.handleCreateNewCollectionCancel();
            }).catch((error) => {
                console.log(error)
            });
    }


    renderCreateNewCollectionDialog() {

        return (

            <Dialog.Container visible={this.state.createNewCollectionDialogVisible}>
                {/* <Dialog.Container visible={this.state.createNewCollectionDialogVisible}></Dialog.Container> */}
                <Dialog.Title>Create a Collection</Dialog.Title>
                <Dialog.Description>
                    Please enter a name for the collection
          </Dialog.Description>
                <Dialog.Input
                    value={this.state.collectionName}
                    onChangeText={collectionName => this.setState({ collectionName })}
                ></Dialog.Input>
                <Dialog.Button label="Cancel" onPress={() => {
                    this.handleCreateNewCollectionCancel();
                }} />
                <Dialog.Button label="Create" onPress={this.createCollection.bind(this)} />
            </Dialog.Container>
        );
    }

    renderModalSelectedItem(option) {
        if (option.key == 0) {

            if (this.state.loggedUser) {
                this.showCreateNewCollectionDialog();
                // console.log(option.key);
                // console.log('create new 11111');
            }
            else {
                this.pleaseLoginInAlert();
                console.log('pleaseLoginInAlert');

            }
        }
        else {
            this.addToCollection(option.label);
            console.log(option.label);
        }
    }

    addToCollection(collectionName) {
        const user = firebase.auth().currentUser;

        db.ref(`Users/${user.uid}/Collections/${collectionName}/${this.state.propertyID}`).set(true)
            .then(() => {
                // const oProp = this.state.propProperties.find((val, index) => {
                //     return val.PropId == this.state.propertyID;
                // });

                // if (oProp) {
                //     oProp.isFavourite = true;
                // }
                this.setState({
                    isFavourite: true
                });

                console.log('Inserted!');
                // this.changefavouriteIcon(true);
                this.handleCreateNewCollectionCancel();
                // console.log(this.state.isFavourite);
            }).catch((error) => {
                console.log(error)
            });
    }

    handleCreateNewCollectionCancel() {

        this.setState({
            createNewCollectionDialogVisible: false,
            propertyID: ''
        });
    };

    pleaseLoginInAlert() {

        Alert.alert(
            'Please Login',
            'Do you want to login?',
            [
                {
                    text: 'Home', onPress: () => {
                        this.props.navigation.navigate('Search');
                    }
                },
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
            ],
            { cancelable: true },
        );
    }

    onPressRemoveFavourite(propertyID, collName) {

        Alert.alert(
            'Remove',
            'Do you really want to remove this property in saved collections?',
            [
                {
                    text: 'No',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {
                    text: 'Yes',
                    onPress: () => {
                        this.deleteCollectionItem(propertyID, collName);
                    }
                },
            ],
            { cancelable: false },
        );
    }

    deleteCollectionItem(propertyID, colName) {

        const user = firebase.auth().currentUser;

        db.ref(`Users/${user.uid}/Collections/${colName}/${propertyID}`).remove()
            .then(() => {

                // const oProp = this.state.propProperties.find((val, index) => {
                //     return val.PropId == propertyID;
                // });

                // if (oProp) {
                //     oProp.isFavourite = false;
                // }
                this.setState({
                    isFavourite: false
                });

                console.log('Deleted!!');
            }).catch((error) => {
                console.log(error)
            });
    }

    showCreateNewCollectionDialog() {
        console.log("show dialog")
        this.setState({
            createNewCollectionDialogVisible: true,
            collectionName: ''
        });
    };


    showMapModal() {
        console.log('map modal visible');

        const { navigation } = this.props;
        const property = navigation.getParam('PropertyData');

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
                                    this.setModalVisible(!this.state.mapModalVisible);
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
                                style={styles.mapViewExpand}
                                initialRegion={{
                                    latitude: property.lat,
                                    longitude: property.lon,
                                    latitudeDelta: 0.0922,
                                    longitudeDelta: 0.0421,
                                }}
                                onMapReady={() => {
                                    if (this.refMarker) {
                                        this.refMarker.showCallout();
                                    }
                                }}
                            >

                                <MapView.Marker
                                    // draggable

                                    ref={(ref) => {
                                        this.refMarker = ref;
                                    }}
                                    coordinate={{
                                        latitude: property.lat,
                                        longitude: property.lon
                                    }}
                                    title={property.Owner}
                                    description={property.PropType}


                                // onSelect={() => console.log('onSelect', arguments)}
                                // onDrag={() => console.log('onDrag', arguments)}
                                // onDragStart={() => console.log('onDragStart', arguments)}
                                // draggable

                                />

                                {/* <TouchableOpacity style={{ flex: 1}}>
                                    <View style={{ borderRadius: 4, alignContent: 'center', height: 35, justifyContent: 'center', marginHorizontal: 5, backgroundColor: '#49141E' }}>
                                        <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: '600', color: 'white' }}>Get Directions</Text>
                                    </View>
                                </TouchableOpacity> */}
                            </MapView>

                            {/* <View style={{ flexDirection: 'row', padding: 10, backgroundColor: 'white', justifyContent: 'center',  zIndex: 1, bottom: 50 }}>

                                <TouchableOpacity style={{ flex: 1, }}>
                                    <View style={{ borderRadius: 4, alignContent: 'center', height: 35, justifyContent: 'center', marginHorizontal: 5, backgroundColor: '#49141E' }}>
                                        <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: '600', color: 'white' }}>Street View</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity style={{ flex: 1, }}>
                                    <View style={{ borderRadius: 4, alignContent: 'center', height: 35, justifyContent: 'center', marginHorizontal: 5, backgroundColor: '#49141E' }}>
                                        <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: '600', color: 'white' }}>Get Directions</Text>
                                    </View>
                                </TouchableOpacity>

                            </View> */}

                        </View>
                    </SafeAreaView>

                </Modal>

            </View>

        );
    }

    handleTextReady() {
        console.log('ready!');
    }

    renderTruncatedFooter(handlePress) {
        return (
            <View style={{ backgroundColor: '#EEEEEE', borderRadius: 4, flex: 1, alignContent: 'center', justifyContent: 'center', margin: 10 }}>
                <Text style={{ alignSelf: 'center', margin: 5, fontSize: 13, fontWeight: '500' }} onPress={handlePress}>
                    Read more
          </Text>
            </View>

        );
    }

    renderRevealedFooter(handlePress) {
        return (
            <View style={{ backgroundColor: '#EEEEEE', borderRadius: 4, flex: 1, alignContent: 'center', justifyContent: 'center', margin: 10 }}>

                <Text style={{ alignSelf: 'center', margin: 5, fontSize: 13, fontWeight: '500' }} onPress={handlePress}>
                    Show less
          </Text>
            </View>

        );
    }

    renderHeartIcon(propID, collectionName) {
        if (!this.state.isFavourite) {
            return (
                <TouchableOpacity style={{ flex: 1, padding: 10 }}
                    onPress={() => {
                        if (this.state.loggedUser) {
                            this.renderModal();
                        }
                        else {
                            this.pleaseLoginInAlert();
                        }

                    }}
                >
                    <Meticon
                        name="heart-outline"
                        size={25}
                        style={{ marginRight: 0 }}
                    />
                </TouchableOpacity>
            );
        }
        else {
            return (
                <TouchableOpacity style={{ flex: 1, padding: 10 }}
                    onPress={() => {
                        // if (this.state.loggedUser) {
                        //     this.renderModal();
                        // }
                        // else {
                        //     this.pleaseLoginInAlert();
                        // }

                        this.onPressRemoveFavourite(propID, collectionName);

                    }}
                >
                    <Meticon
                        name="heart"
                        size={25}
                        style={{ marginRight: 0 }}
                    />
                </TouchableOpacity>
            );
        }
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

    handleGetDirections() {
        const data = {
            source: {
                latitude: this.state.currentLat,
                longitude: this.state.currentlon
                // latitude: this.state.propertyLat,
                // longitude: this.state.propertyLon
            },
            destination: {
                latitude: this.state.propertyLat,
                longitude: this.state.propertyLon
            },
            params: [
                {
                    key: "travelmode",
                    value: "driving"        // may be "walking", "bicycling" or "transit" as well
                },
                // {
                //     key: "dir_action",
                //     value: "navigate"       // this instantly initializes navigation using the given travel mode
                // }
            ],
        }

        getDirections(data)
    }


    render() {
        const { navigation } = this.props;
        const property = navigation.getParam('PropertyData');
        return (
            <React.Fragment>
                <SafeAreaView style={{ flex: 1, backgroundColor: '#EEEEEE' }}>

                    <ScrollView style={{ flex: 1, paddingBottom: 60 }}>

                        <View style={styles.listView}>
                            <View style={styles.listViewTop}>
                                <Text style={styles.ownerName}> {property.Owner}</Text>
                                <View style={styles.userProfileView}>

                                    {/* <Image source={require('../../assets/images/owner2.jpg')} style={{ width: 40, height: 40, borderRadius: 20 }} /> */}
                                    <Image source={require('../../assets/images/owner2.png')} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#ffffff' }} />
                                </View>
                            </View>
                            {/* <ImageBackground style={styles.imageBackground}> */}
                            {/* <Image source={{uri:'https://firebasestorage.googleapis.com/v0/b/realestate-be70e.appspot.com/o/index.jpg?alt=media&token=3ba7172f-9e37-4eab-a082-f84cd17e16bb'}} style={styles.imageTop} /> */}

                            <ImageSlider
                                style={styles.imageTop}
                                // images={[
                                //     // url('https://firebasestorage.googleapis.com/v0/b/realestate-be70e.appspot.com/o/index.jpg?alt=media&token=3ba7172f-9e37-4eab-a082-f84cd17e16bb'),
                                //     { uri: 'https://firebasestorage.googleapis.com/v0/b/realestate-be70e.appspot.com/o/house.jpg?alt=media&token=6f42610b-51b1-4ee1-bdca-32984e41694c' },
                                //     { uri: 'https://firebasestorage.googleapis.com/v0/b/realestate-be70e.appspot.com/o/house2.jpg?alt=media&token=0ccbf59c-2358-4aa1-89d6-b1d3b7e620a8' },
                                //     { uri: 'https://firebasestorage.googleapis.com/v0/b/realestate-be70e.appspot.com/o/house3.jpg?alt=media&token=dc364972-504f-452b-a9a3-f2e96e37e5e5' },
                                //     { uri: 'https://firebasestorage.googleapis.com/v0/b/realestate-be70e.appspot.com/o/house4.jpg?alt=media&token=850bf1ef-a0d3-42bd-8e76-745cbbcc7055' },
                                // ]} 
                                images={property.images}

                            />

                            {/* </ImageBackground> */}

                            <View style={{ marginHorizontal: 10 }}>
                                <View style={{ flexDirection: 'row', flex: 1 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 15, fontWeight: '600', marginTop: 10, marginBottom: 5 }}>{Accounting.formatMoney(property.Price)}</Text>
                                        <Text style={{ fontSize: 12, color: 'gray' }}>{property.Address}</Text>
                                    </View>
                                    <View style={{ alignContent: 'center', justifyContent: 'center' }}>
                                        {this.renderHeartIcon(property.PropId, property.collectionName)}
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', marginTop: 5 }}>

                                    <Ionicon name="ios-bed" size={15} />
                                    <Text style={styles.subDetailsText}>{property.Bedrooms}</Text>

                                    <Meticon name="shower" size={15} />
                                    <Text style={styles.subDetailsText}>{property.Bathrooms}</Text>

                                    <Ionicon name="ios-car" size={15} />
                                    <Text style={styles.subDetailsText}>{property.CarPark}</Text>

                                    <Image source={require('../../assets/images/land-size.png')} style={{ width: 15, height: 15 }} />
                                    <Text style={[styles.subDetailsText, { marginRight: 0 }]}>{property.LandSize} m</Text>
                                    <Text style={{ fontSize: 10, lineHeight: 10 }}>2</Text>

                                    {/* <View style={{ borderLeftWidth: 1, marginHorizontal: 10 }}></View>

                                <Text style={styles.subDetailsText}>{property.PropType}</Text> */}
                                </View>
                            </View>

                            {/* <View style={{ borderTopWidth: 1, marginVertical: 10 }}></View>

                        <TouchableOpacity >
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ marginLeft: 10, flex: 1 }}>
                                    <Text style={{ fontWeight: '600' }}>Home Loan Calculator</Text>
                                    <Text style={{ marginTop: 5 }}>{property.Price / 100}/month</Text>
                                    <Text style={{ fontSize: 12, color: 'gray' }}>estimated repayment</Text>
                                </View>

                                <View style={{ justifyContent: 'center', marginHorizontal: 10 }}>
                                    <TouchableOpacity>
                                        <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderRadius: 4 }}>
                                            <Text>Calculate</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>

                            </View>
                        </TouchableOpacity> */}

                            {/* <View style={{ borderTopWidth: 1, marginVertical: 10 }}></View>

                        <TouchableOpacity >
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ marginLeft: 10, flex: 1 }}>
                                    <Text style={{ fontWeight: '600' }}>Home Loan Calculator</Text>
                                    <Text style={{ marginTop: 5, fontSize: 13, color: '#424242' }}>Apply for conditional approval</Text>
                                </View>

                                <View style={{ justifyContent: 'center', marginHorizontal: 10 }}>
                                    <TouchableOpacity>
                                        <View style={{ paddingHorizontal: 10, paddingVertical: 5 }}>
                                            <Meticon
                                                name="chevron-right"
                                                size={25}
                                                color='gray'
                                            />
                                        </View>
                                    </TouchableOpacity>
                                </View>

                            </View>
                        </TouchableOpacity> */}

                        </View>

                        <View style={{ marginVertical: 7, backgroundColor: '#ffffff' }}>

                            <TouchableOpacity onPress={() => {
                                this.setModalVisible(!this.state.mapModalVisible);
                            }}>
                                <MapView
                                    style={styles.mapView}
                                    initialRegion={{
                                        latitude: property.lat,
                                        longitude: property.lon,
                                        latitudeDelta: 0.0922,
                                        longitudeDelta: 0.0421,
                                    }}
                                >

                                    <View style={{}}>
                                        <TouchableOpacity style={{ alignContent: 'flex-start', width: '10%', alignItems: 'center', justifyContent: 'center' }} onPress={() => {
                                            this.setModalVisible(!this.state.mapModalVisible);
                                        }}>
                                            <Meticon
                                                name="arrow-expand"
                                                size={25}
                                                color='gray'
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    <MapView.Marker
                                        coordinate={{
                                            latitude: property.lat,
                                            longitude: property.lon
                                        }}
                                    />

                                </MapView>

                            </TouchableOpacity>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
                                {/* <TouchableOpacity style={{ flex: 1 }}>
                                <View style={{ borderWidth: 1, borderRadius: 4, alignContent: 'center', height: 35, justifyContent: 'center', marginHorizontal: 5 }}>
                                    <Text style={{ textAlign: 'center' }}>Street View</Text>
                                </View>
                            </TouchableOpacity> */}
                                <TouchableOpacity style={{ flex: 1 }} onPress={() => {

                                    this.getCurrentLocation().then(() => {
                                        this.handleGetDirections();
                                    }).catch((error) => {

                                        Alert.alert(
                                            'RealEstate does not have access to your location. To enable access, tap Settings > Location',
                                            '',
                                            [
                                                {
                                                    text: 'Cancel',
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



                                }}>
                                    <View style={{ borderWidth: 1, borderRadius: 4, alignContent: 'center', height: 35, justifyContent: 'center', marginHorizontal: 5 }}>
                                        <Text style={{ textAlign: 'center' }}>Get Directions</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            {this.showMapModal()}

                        </View>

                        <View style={{ backgroundColor: 'white', padding: 10 }}>
                            <Text style={{ fontSize: 15, fontWeight: '600', marginTop: 10, marginBottom: 5 }}>Description</Text>
                            <View style={{}}>
                                <ReadMore
                                    numberOfLines={4}
                                    renderTruncatedFooter={this.renderTruncatedFooter}
                                    renderRevealedFooter={this.renderRevealedFooter}
                                // onReady={this.handleTextReady}
                                >
                                    <Text style={{ textAlign: 'justify' }}>
                                        {property.Description}
                                    </Text>
                                </ReadMore>
                            </View>
                        </View>

                    </ScrollView>
                    {/* {this.showMapModal()} */}

                    <View style={{ height: 60, backgroundColor: 'white', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <TouchableOpacity onPress={() => Linking.openURL('mailto:realestateadmin@gmail.com')} style={{ flex: 1 }}>

                            <View style={{
                                backgroundColor: '#49141E', marginVertical: 12, flex: 1, marginHorizontal: 10,
                                borderRadius: 7, alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Text style={{ color: 'white', fontWeight: '600' }}>Email agent</Text>
                            </View>

                        </TouchableOpacity>

                        {/* <TouchableOpacity
                        // onPress={() => Linking.openURL('mailto:realestateadmin@gmail.com')} 
                        style={{ flex: 1 }}>

                        <View style={{
                            backgroundColor: '#49141E', marginVertical: 12, flex: 1, marginHorizontal: 10,
                            borderRadius: 7, alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Text style={{ color: 'white', fontWeight: '600' }}>Make an Appoinment</Text>
                        </View>

                    </TouchableOpacity> */}
                    </View>
                    {this.renderCreateNewCollectionDialog()}
                </SafeAreaView >

                {this.renderModalView()}
            </React.Fragment>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // padding: 10,
        paddingTop: 0,
        backgroundColor: '#E0E0E0'
    },
    subDetailsText: {
        marginLeft: 5,
        marginRight: 10,
        fontSize: 12
    },
    list_item: {
        // flexDirection: "row",
        borderRadius: 5,
        // padding: 5,
        paddingTop: 5
    },
    userProfileView: {
        width: 40,
        height: 40,
        borderRadius: 20,
        // backgroundColor: 'white',
        marginBottom: -20,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
        borderColor: 'white'
        // position: "absolute",
    },
    listViewTop: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: 40,
        zIndex: 2,

        backgroundColor: '#49141E',
        padding: 5,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        overflow: "visible"
    },
    imageBackground: {
        height: 100,
        width: '90%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    listView: {
        backgroundColor: 'white',
        // borderBottomWidth: 1,
        paddingBottom: 10,
        // marginBottom: 10
    },
    ownerName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#E0E0E0'
    },
    imageTop: {
        marginTop: 20,
        width: '100%',
        height: 300,
    },
    mapView: {
        width: '100%',
        height: 150
    },
    mapViewExpand: {
        width: '100%',
        height: '100%',
        // marginTop: 50
    }
})