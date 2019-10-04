import React, { Component } from 'react';
import {
    View, StyleSheet, Text, TouchableOpacity, Alert, AsyncStorage, Dimensions, Platform,
    Image, ScrollView, FlatList, ImageBackground, ListView, TextInput, ActivityIndicator, KeyboardAvoidingView
} from 'react-native';
import { NavigationScreenProp, NavigationActions, SafeAreaView, StackActions } from 'react-navigation';
import firebase from 'react-native-firebase';
import Octicons from 'react-native-vector-icons/Octicons';
import Meticon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PagerTabIndicator, IndicatorViewPager, PagerTitleIndicator, PagerDotIndicator } from 'rn-viewpager';
import Switch from 'react-native-switch-pro'
import Ionicon from 'react-native-vector-icons/Ionicons';
import { db, fbStorage } from '../../Database/db';
import ListItem from '../../component/listItemComponent'
import AntDesign from 'react-native-vector-icons/AntDesign';
import RNFetchBlob from 'react-native-fetch-blob';
import ImagePicker from 'react-native-image-crop-picker';
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view';

type Props = {
    navigation: NavigationScreenProp;
};

export default class MyProperties extends Component {

    static navigationOptions = {
        header: null,
    };

    userProperties = {};

    constructor(props) {
        super(props);

        this.state = {

            userEmail: '',
            loggedIn: false,
            isLocationEnable: false,
            receiveNotification: false,
            myProperties: [],
            uid: '',
            propertyID: '',
            visibleAd: false,
            userName: '',
            profilePic: '',
            profilePicUrl: '',
            contactNumber: '',
            address: '',

            editModalVisible: false,
            loading: true,

            orientation: '',
            userRole: null,

        };
    }

    componentDidMount() {


        firebase.auth().onAuthStateChanged(user => {
            this.fetchUser(user);
            console.log("USER: " + user);
        });

    }

    fetchUser(user) {
        console.log("UUUSER:", user);

        if (user) {
            this.getMyProperties(user);
            this.getUserDetails(user);

            this.setState({
                userEmail: user.email,
                loggedIn: true,
                uid: user.uid,
                loading: false
            });
        }
        else {
            this.setState({
                userEmail: '',
                loggedIn: false,
                uid: '',
                loading: false
            });
        }
    }

    getUserDetails(user) {
        if (user) {
            db.ref(`Users/${user.uid}/UserDetails`).on('value', (snapshot) => {
                const userdetails = snapshot.val();
                console.log('userdetails', userdetails);
                if (userdetails) {
                    this.setState({
                        userName: userdetails.UserName,
                        // profilePic: userdetails.ProfilePicUrl,
                        profilePicUrl: userdetails.ProfilePicUrl,
                        contactNumber: userdetails.ContactNumber,
                        address: userdetails.Address,
                        userRole: userdetails.Role
                    });
                }
            });
        }
    }

    getMyProperties(user) {
        if (user) {
            db.ref(`Users/${user.uid}/UserProperties`).on('value', (snapshot) => {
                this.userProperties = snapshot.val();
                console.log(this.userProperties);

                // this.setState({
                //     myProperties: arrCont,
                //     // loading: false
                // });

                db.ref('/PropertyType').on('value', (snapshot) => {
                    const propTypes = snapshot.val();

                    /**
                     * @type {arrCont[]}
                     */
                    const arrCont = [];
                    let propVisible = ''
                    for (const i in this.userProperties) {
                        for (const propTypeId in propTypes) {
                            const propTypeObj = propTypes[propTypeId];

                            if (propTypeObj.Property) {
                                for (const propId in propTypeObj.Property) {
                                    const propObj = propTypeObj.Property[propId];
                                    propVisible = propObj.Visible;
                                    // console.log('propObj.Visible',propObj.Visible);

                                    if (propId == i) {
                                        // console.log("propObj", propObj);
                                        arrCont.push(propObj);
                                        // console.log('propObjNew.isVisible',propObjNew.isVisible);
                                        // console.log('arrCont.', arrCont);

                                    }
                                }
                            }
                        }
                    }
                    this.setState({
                        myProperties: arrCont,
                        // loading: false
                    });

                });
            });
        }
    }

    deleteProperty(propertyID, adType) {

        db.ref(`PropertyType/${adType}/Property/${propertyID}`).remove()
            .then(() => {
                console.log('successfully removed!');

                const user = firebase.auth().currentUser;

                // firebase.storage().ref(`PropImages/${propertyID}`).delete().then(() => {

                db.ref(`Users/${user.uid}/UserProperties/${propertyID}`).remove()
                    .then(() => {
                        if (this.userProperties[propertyID] != undefined) {
                            delete this.userProperties[propertyID];
                        }

                        let imagePathArr = [];

                        fbStorage.ref(`PropImages/${propertyID}`).listAll()
                            .then((list) => {
                                console.log(list);
                                imagePathArr = list.items;
                                for (const i in imagePathArr) {
                                    console.log(imagePathArr[i].fullPath);

                                    fbStorage.ref(imagePathArr[i].fullPath)
                                        .delete()
                                        .then((tt) => {
                                            // deleted
                                            console.log('Deleted!!', tt);
                                            alert('successfully removed!');
                                        })
                                        .catch((deleteError) => {
                                            // deletion error
                                            console.log('deletion error', deleteError);
                                        });
                                }
                            })

                    }).catch((error) => {
                        console.log(error)
                    });
            });
    }


    pauseAdvertisement(propertyID, adType) {
        db.ref(`PropertyType/${adType}/Property/${propertyID}`)
            .update(
                {
                    Visible: false
                }).then({

                }).catch((error) => {
                    console.log(error)
                });
    }

    showAdvertisement(propertyID, adType) {
        db.ref(`PropertyType/${adType}/Property/${propertyID}`)
            .update(
                {
                    Visible: true
                }).then({

                }).catch((error) => {
                    console.log(error)
                });

    }

    onPressDeleteButton(propertyID, adType) {

        Alert.alert(
            'Delete',
            'Do you really want to delete this property?',
            [
                {
                    text: 'No',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {
                    text: 'Yes',
                    onPress: () => {
                        this.deleteProperty(propertyID, adType);
                    }
                },
            ],
            { cancelable: false },
        );
    }

    onPressPauseButton(PropId, PropAction) {
        Alert.alert(
            'Pause',
            'Do you really want to Pause this advertisement?',
            [
                {
                    text: 'No',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {
                    text: 'Yes',
                    onPress: () => {
                        this.pauseAdvertisement(PropId, PropAction);
                    }
                },
            ],
            { cancelable: false },
        );
    }

    onPressShowButton(PropId, PropAction) {
        Alert.alert(
            'Show',
            'Do you really want to Show this advertisement?',
            [
                {
                    text: 'No',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {
                    text: 'Yes',
                    onPress: () => {
                        this.showAdvertisement(PropId, PropAction);
                    }
                },
            ],
            { cancelable: false },
        );
    }

    renderMyProperties({ item, index }) {
        return (

            <ListItem
                data1={item}
                favouriteMarked={false}
                showFavouriteIcon={false}
                showDeleteIcon={true}
                showPauseIcon={true}
                enablePauseIcon={item.Visible}
                showEditIcon={true}

                onPressItem={(item) => {
                    this.props.navigation.navigate("ExpandedView", { PropertyData: item });
                }}

                onPressDelete={(item, isMarked) => {
                    this.state.propertyID = item.propId;
                    console.log(item.PropId);
                    this.onPressDeleteButton(item.PropId, item.PropAction);

                }}

                onPressPause={(item, isMarked) => {
                    this.state.propertyID = item.propId;
                    console.log(item.PropId);
                    console.log(this.state.visibleAd);
                    this.onPressPauseButton(item.PropId, item.PropAction);

                }}

                onPressShow={(item, isMarked) => {
                    this.state.propertyID = item.propId;
                    console.log(item.PropId);
                    console.log(this.state.visibleAd);
                    this.onPressShowButton(item.PropId, item.PropAction);
                }}

                onPressEdit={(item, isMarked) => {
                    // this.state.propertyID = item.propId;
                    console.log(item.PropId);
                    console.log(item);
                    // console.log(this.state.visibleAd);
                    // this.onPressShowButton(item.PropId, item.PropAction);
                    this.props.navigation.navigate("EditPropertyScreen", { PropertyData: item });
                }}
            />

        );
    }

    render() {

        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

        return (
            // <View style={{ flex: 1, backgroundColor: 'red' }}>
            <SafeAreaView style={{}}>
                {/* <KeyboardAvoidingView style={{}} behavior={'padding'}> */}
                    {(this.state.userRole == 'Admin') ?
                        <View style={{paddingBottom: 100}}>
                            <TouchableOpacity onPress={() => {
                                this.props.navigation.navigate('AddPropertyScreen');
                            }}>

                                {/* <View style={{ height: 50, backgroundColor: '#f3d500', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}> */}
                                <View style={{ height: 50, backgroundColor: '#bdbdbd', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                                    {/* <Ionicon name="md-add-circle" size={30} color='#49141E' /> */}
                                    <Ionicon name="md-add-circle" size={30} color='#212121' />
                                    {/* <Text style={{ fontWeight: '500', fontSize: 16, marginLeft: 10, color: '#49141E' }}>Add new property</Text> */}
                                    <Text style={{ fontWeight: '500', fontSize: 16, marginLeft: 10, color: '#212121' }}>Add new property</Text>
                                </View>
                            </TouchableOpacity>

                            <ScrollView style={{}}>

                                <SwipeListView
                                    data={this.state.myProperties}
                                    renderItem={(item) => this.renderMyProperties(item)}
                                    keyExtractor={(item, index) => {
                                        return "" + index;
                                    }}
                                    // leftOpenValue={75}
                                    rightOpenValue={-75}
                                />
                            </ScrollView>
                        </View>
                        :
                        null
                    }
                {/* </KeyboardAvoidingView> */}
            </SafeAreaView>
            // </View>
        );
    }
}
