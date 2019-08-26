import React, { Component } from 'react';
import {
    View, StyleSheet, Text, TouchableOpacity, Alert, AsyncStorage,
    Image, ScrollView, FlatList, ImageBackground, Modal, TextInput
} from 'react-native';
import { NavigationProp, NavigationEvents, SafeAreaView } from 'react-navigation';
import firebase from 'react-native-firebase';
import Octicons from 'react-native-vector-icons/Octicons';
import Meticon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PagerTabIndicator, IndicatorViewPager, PagerTitleIndicator, PagerDotIndicator } from 'rn-viewpager';
import Switch from 'react-native-switch-pro'
import Ionicon from 'react-native-vector-icons/Ionicons';
import { db, fbStorage } from '../../Database/db';
import ListItem from '../../component/listItemComponent'
import AntDesign from 'react-native-vector-icons/AntDesign';

let PropRef = db.ref('/PropertyType');

type Props = {
    navigation: NavigationProp;
};

export default class ProfileScreen extends Component<Props> {

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
            contactNumber: '',
            address: '',

            editModalVisible: false
        };
    }

    componentDidMount() {

        firebase.auth().onAuthStateChanged(user => {
            this.fetchUser(user);
            console.log("USER: " + user);
        });
    }

    componentWillUnmount() {
        // TODO: Add event disposing (.off) here.
    }

    fetchUser(user) {
        console.log("UUUSER:", user);

        if (user) {
            if (this.userProperties) {

                this.getMyProperties(user);
                this.getUserDetails(user);
            }

            this.setState({
                userEmail: user.email,
                loggedIn: true,
                uid: user.uid
            });
        }
        else {
            this.setState({
                userEmail: '',
                loggedIn: false,
                uid: ''
            });
        }
    }

    getUserDetails(user) {
        if (user) {
            db.ref(`Users/${user.uid}/UserDetails`).once('value', (snapshot) => {
                const userdetails = snapshot.val();
                console.log('userdetails', userdetails);

                this.setState({
                    userName: userdetails.UserName,
                    profilePic: userdetails.ProfilePicUrl,
                    contactNumber: userdetails.ContactNumber,
                    address: userdetails.Address
                });
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


    switchLocationEnable(value) {
        this.setState({
            isLocationEnable: value
        });
    }

    switchNotificationEnable(value) {
        this.setState({
            receiveNotification: value
        });
    }

    onPressProfileEditButton(visible) {
        this.setState({
            editModalVisible: visible
        });
    }


    onPressSignOutButton() {

        Alert.alert(
            'Sign Out',
            'Are you sure to want sign out?',
            [
                {
                    text: 'No',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {
                    text: 'Yes', onPress: () => {
                        firebase.auth().signOut()
                            .then(() => {
                                this.setState({ loggedIn: false });
                                this.loginReset();
                                this.props.navigation.navigate('Search');
                                this.clearAsyncStorage();
                            });
                    }
                },
            ],
            { cancelable: false },
        );
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

    clearAsyncStorage = async () => {
        AsyncStorage.clear();
    }

    loginReset() {
        this.setState({
            userEmail: '',
            loggedIn: false
        })
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

    renderEditProfileModal() {

        return (
            <Modal
                animationType="slide"
                transparent={false}
                visible={this.state.editModalVisible}
                onRequestClose={() => {
                    Alert.alert('Modal has been closed.');
                }}>
                {/* <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 }}> */}
                <SafeAreaView>
                    <View style={{
                        backgroundColor: '#e0e0e0', width: '90%', height: '90%', margin: 20, justifyContent: 'center',
                        borderRadius: 15, padding: 10
                    }}>

                        <TouchableOpacity style={{ alignSelf: 'flex-end', padding: 10 }} onPress={() => {
                            this.onPressProfileEditButton(false);
                        }}>
                            <Text>Close</Text>
                        </TouchableOpacity>

                        <ScrollView style={{}}>

                            <TouchableOpacity
                            // onPress={this.pickProfilePicture.bind(this)}
                            >
                                <View style={{
                                    width: 100, height: 100, alignSelf: 'center', backgroundColor: '#ffffff', marginBottom: 15,
                                    borderRadius: 50
                                }}>
                                    <Image source={{ uri: this.state.profilePic }} style={{ width: 100, height: 100, borderRadius: 50, borderColor: '#ffffff', }} />
                                    {/* {this.state.profilePic ? <View style={{
                                        width: 100, height: 100, alignSelf: 'center', backgroundColor: '#ffffff', marginBottom: 10,
                                        borderRadius: 50
                                    }}>{this.renderImage(this.state.profilePic)}</View> :
                                        null
                                    } */}
                                </View>
                            </TouchableOpacity>

                            <View>
                                <Text style={{ color: 'grey', marginBottom: 5 }}>Username</Text>
                                {/* <Text style={{ fontSize: 15 }}>{this.state.userName}</Text> */}
                                <TextInput
                                    label="UserName"
                                    value={this.state.userName}
                                    style={[styles.textinput, { backgroundColor: 'white', padding: 5 }]}
                                    secureTextEntry={false}
                                    onChangeText={userName => this.setState({ userName })}
                                    editable={true}
                                    maxLength={40}
                                    placeholder='User Name' />

                            </View>

                            <View style={{ marginTop: 20 }}>
                                <Text style={{ color: 'grey', marginBottom: 5 }}>Contact Number</Text>
                                {/* <Text style={{ fontSize: 15 }}>{this.state.contactNumber}</Text> */}
                                <TextInput
                                    label="ContactNumber"
                                    value={this.state.contactNumber}
                                    style={[styles.textinput, { backgroundColor: 'white', padding: 5 }]}
                                    secureTextEntry={false}
                                    onChangeText={contactNumber => this.setState({ contactNumber })}
                                    editable={true}
                                    maxLength={40}
                                    placeholder='Contact Number' />
                            </View>

                            <View style={{ marginTop: 20 }}>
                                <Text style={{ color: 'grey', marginBottom: 5 }}>Address</Text>
                                {/* <Text style={{ fontSize: 15 }}>{this.state.address}</Text> */}
                                <TextInput
                                    label="address"
                                    value={this.state.address}
                                    style={[styles.textinput, { backgroundColor: 'white', padding: 5 }]}
                                    secureTextEntry={false}
                                    onChangeText={address => this.setState({ address })}
                                    editable={true}
                                    maxLength={40}
                                    placeholder='Address' />

                            </View>

                        </ScrollView>
                        <TouchableOpacity style={{height: 30, width:'50%', backgroundColor:'#000000', alignSelf:'center', justifyContent:'center', borderRadius:4}}>
                                    <Text style={{color:'white', fontSize:17, textAlign:'center'}}>Save</Text>
                        </TouchableOpacity>
                    </View>
                    {/* </View> */}
                </SafeAreaView>

            </Modal>
        );

    }

    renderProfileView() {
        if (!this.state.loggedIn) {
            return (
                <View style={[styles.buttonContainer, { justifyContent: 'center', backgroundColor: '#ffffff' }]}>
                    <Text style={{ textAlign: 'center', fontWeight: '400', fontSize: 15, color: '#000000' }}>
                        Please Login to see user details
                        </Text>

                    <View style={{ justifyContent: 'center', alignContent: 'center' }}>
                        <TouchableOpacity onPress={() => {
                            this.props.navigation.navigate('Search');
                        }}>
                            {/* <View style={[styles.buttons, {width: '25%', height: 30, alignContent:'center',  backgroundColor: '#f3d500',}]}> */}
                            <View style={[styles.buttons, { width: '25%', height: 30, alignContent: 'center', backgroundColor: '#212121', }]}>
                                <Text style={[styles.buttonText, { fontSize: 15 }]}>
                                    Home
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        else if (this.state.loggedIn) {
            // console.log("list: ", this.state.myProperties);

            return (
                <View style={styles.buttonContainer}>
                    <ImageBackground source={require('../../assets/images/sky7.jpg')} style={{}}>
                        <View style={{ justifyContent: 'flex-start' }}>
                            <View style={{
                                width: 120, height: 120, borderRadius: 60, alignSelf: 'center', marginTop: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20,
                                backgroundColor: '#ffffff', padding: 0
                            }}>
                                <Image source={{ uri: this.state.profilePic }} style={{ width: 110, height: 110, borderRadius: 55, borderColor: '#ffffff', }} />
                            </View>
                            <Text style={{ color: '#212121', fontSize: 20, fontWeight: '600', textAlign: 'center', marginBottom: 20 }}>{this.state.userName}</Text>

                        </View>
                    </ImageBackground>

                    <View style={{ backgroundColor: '#ffffff', flex: 1, justifyContent: 'center' }}>

                        <IndicatorViewPager
                            style={{ flex: 1, backgroundColor: '#ffffff', flexDirection: 'column-reverse' }}
                            indicator={this.renderTabIndicator()}
                        >
                            <View style={{ backgroundColor: '#ffffff', justifyContent: 'center', alignContent: 'center', paddingLeft: 30 }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ width: 50, height: 50, justifyContent: 'center', alignItems: 'center' }}>
                                        <Meticon name="email-outline" size={25} style={{ color: '#212121' }} />
                                    </View>
                                    <Text style={{ fontSize: 15, fontWeight: '400', color: 'grey', alignSelf: 'center' }}>{this.state.userEmail}</Text>

                                </View>

                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ width: 50, height: 50, justifyContent: 'center', alignItems: 'center' }}>
                                        <Meticon name="phone" size={25} style={{ color: '#212121' }} />
                                    </View>
                                    <Text style={{ fontSize: 15, fontWeight: '400', color: 'grey', alignSelf: 'center' }}>{this.state.contactNumber}</Text>

                                </View>

                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ width: 50, height: 50, justifyContent: 'center', alignItems: 'center' }}>
                                        <Octicons name="location" size={25} style={{ color: '#212121' }} />
                                    </View>
                                    <Text style={{ fontSize: 15, fontWeight: '400', justifyContent: 'center', color: 'grey', alignSelf: 'center' }}>{this.state.address}</Text>

                                </View>
                            </View>


                            <View style={{ padding: 10, paddingHorizontal: 30, backgroundColor: '#ffffff', }}>

                                <TouchableOpacity style={{ alignSelf: 'flex-end' }} onPress={() => {
                                    this.onPressProfileEditButton(true);
                                }}>
                                    <View>
                                        {/* <Text>Edit</Text> */}
                                        <AntDesign
                                            name="edit"
                                            size={20}
                                            style={{ marginRight: 0 }}
                                        />
                                    </View>
                                </TouchableOpacity>

                                <ScrollView style={{ paddingTop: 20 }}>

                                    <View>
                                        <Text style={{ color: 'grey', marginBottom: 5 }}>Username</Text>
                                        <Text style={{ fontSize: 15 }}>{this.state.userName}</Text>

                                    </View>

                                    <View style={{ marginTop: 20 }}>
                                        <Text style={{ color: 'grey', marginBottom: 5 }}>Email</Text>
                                        <Text style={{ fontSize: 15 }}>{this.state.userEmail}</Text>

                                    </View>

                                    <View style={{ marginTop: 20 }}>
                                        <Text style={{ color: 'grey', marginBottom: 5 }}>Contact Number</Text>
                                        <Text style={{ fontSize: 15 }}>{this.state.contactNumber}</Text>
                                    </View>

                                    <View style={{ marginTop: 20 }}>
                                        <Text style={{ color: 'grey', marginBottom: 5 }}>Address</Text>
                                        <Text style={{ fontSize: 15 }}>{this.state.address}</Text>
                                    </View>

                                    <View style={{ marginTop: 20 }}>
                                        <Text style={{ color: 'grey', marginBottom: 5 }}>Get Current Location</Text>
                                        <View style={{ flexDirection: 'row' }}>

                                            <Text style={{ fontSize: 15 }}>{this.state.isLocationEnable ? 'Enable' : 'Disable'}</Text>
                                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                                <Switch
                                                    value={this.state.isLocationEnable}
                                                    onSyncPress={() => { this.switchLocationEnable(!this.state.isLocationEnable) }}
                                                    style={{}}
                                                />

                                            </View>
                                        </View>
                                    </View>

                                    <View style={{ marginTop: 20 }}>
                                        <Text style={{ color: 'grey', marginBottom: 5 }}>Receive Notifications</Text>
                                        <View style={{ flexDirection: 'row' }}>

                                            <Text style={{ fontSize: 15 }}>{this.state.receiveNotification ? 'Enable' : 'Disable'}</Text>
                                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                                <Switch
                                                    value={this.state.receiveNotification}
                                                    onSyncPress={() => { this.switchNotificationEnable(!this.state.receiveNotification) }}
                                                    style={{}}
                                                />

                                            </View>
                                        </View>
                                    </View>

                                </ScrollView>

                            </View>

                            {
                                // (this.state.uid == 'DuRUxztWlbUGW7Oeq6blmY0BwIw2') ?
                                (this.state.uid == 'dSVKhiZ2rTUjp8Wghlnt7Ap9QX13') ?
                                    <View style={{}}>
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

                                        <View style={{ flex: 1 }}>
                                            <FlatList
                                                data={this.state.myProperties}
                                                // extraData={this.state}
                                                renderItem={item => this.renderMyProperties(item)}
                                                keyExtractor={(item, index) => {
                                                    return "" + index;
                                                }}
                                            />
                                        </View>
                                    </View>
                                    :
                                    null
                            }

                        </IndicatorViewPager>
                    </View>


                    <TouchableOpacity style={{ backgroundColor: '#ffffff' }} onPress={() => {
                        this.onPressSignOutButton();
                    }}>
                        <View style={[styles.buttons, { backgroundColor: '#bdbdbd' }]}>
                            <Text style={[styles.buttonText, { color: '#212121' }]}>
                                Sign Out
                                </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            );
        }
    }

    renderTabIndicator() {

        if (this.state.uid == 'dSVKhiZ2rTUjp8Wghlnt7Ap9QX13') {
            let tabs = [{
                text: 'About',
                // iconSource: require('../imgs/ic_tab_home_normal.png'),
                // selectedIconSource: require('../imgs/ic_tab_home_click.png')
            }, {
                text: 'Settings',
                // iconSource: require('../imgs/ic_tab_task_normal.png'),
                // selectedIconSource: require('../imgs/ic_tab_task_click.png')
            }, {
                text: 'My Properties',
                // iconSource: require('../imgs/ic_tab_my_normal.png'),
                // selectedIconSource: require('../imgs/ic_tab_my_click.png')
            }];
            return <PagerTabIndicator tabs={tabs}
                // style={{ backgroundColor: '#49141E', borderTopWidth: 0 }}
                style={{ backgroundColor: '#212121', borderTopWidth: 0 }}
                textStyle={{ fontSize: 15, color: '#9e9e9e', paddingBottom: 10 }}
                // selectedTextStyle={{ fontSize: 15, color: '#f3d500' }}
                selectedTextStyle={{ fontSize: 15, color: '#ffffff' }}
            />;
        }

        else {
            let tabs = [{
                text: 'About',
            }, {
                text: 'Settings',
            }];
            return <PagerTabIndicator tabs={tabs}
                style={{ backgroundColor: '#212121', borderTopWidth: 0 }}
                textStyle={{ fontSize: 15, color: '#9e9e9e', paddingBottom: 10 }}
                // selectedTextStyle={{ fontSize: 15, color: '#f3d500' }}
                selectedTextStyle={{ fontSize: 15, color: '#ffffff' }}
            />;
        }
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
        return (
            <View style={styles.container}>
                {this.renderProfileView()}
                {this.renderEditProfileModal()}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    buttons: {
        // backgroundColor: '#49141E',
        // backgroundColor: '#f3d500',
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        paddingVertical: 7,
        margin: 10,
        marginBottom: 0,
        paddingHorizontal: 15,
        width: '100%',
        alignSelf: 'center',
        height: 40,
        justifyContent: 'center',

    },
    buttonContainer: {
        flex: 1,
        alignContent: 'center',
        // backgroundColor: '#e0e0e0',
        // justifyContent: 'center',
        // backgroundColor:'green'
    },
    buttonText: {
        // color: '#49141E',
        color: '#ffffff',
        fontWeight: '500',
        textAlign: 'center',
        fontSize: 17
    }
})