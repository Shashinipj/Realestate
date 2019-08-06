import React, { Component } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, AsyncStorage, Image, ScrollView, FlatList } from 'react-native';
import { NavigationProp, NavigationEvents } from 'react-navigation';
import firebase from 'react-native-firebase';
import Octicons from 'react-native-vector-icons/Octicons';
import Meticon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PagerTabIndicator, IndicatorViewPager, PagerTitleIndicator, PagerDotIndicator } from 'rn-viewpager';
import Switch from 'react-native-switch-pro'
import Ionicon from 'react-native-vector-icons/Ionicons';
import { db } from '../../Database/db';

let PropRef = db.ref('/PropertyType');

type Props = {
    navigation: NavigationProp;
};

export default class ProfileScreen extends Component<Props> {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);

        this.state = {
            userEmail: '',
            loggedIn: false,
            isLocationEnable: false,
            receiveNotification: false,
            myProperties: [],
            uid: ''
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


    getMyProperties(user) {
        if (user) {
            db.ref(`Users/${user.uid}/UserProperties`).on('value', (snapshot) => {
                const UserProperties = snapshot.val();
                console.log(UserProperties);

                /**
                 * @type {CollectionItem[]}
                 */
                const arrCont = [];
                for (const i in UserProperties) {
                    const coll = UserProperties[i];

  
                    console.log(i);
                    arrCont.push({
                        name: i,
                        propIds: coll
                    });
                    // console.log(this.state.collectionList);
                }

                this.setState({
                    myProperties: arrCont,
                    // loading: false
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

    clearAsyncStorage = async () => {
        AsyncStorage.clear();
    }

    loginReset() {
        this.setState({
            userEmail: '',
            loggedIn: false
        })
    }

    renderProfileView() {
        if (!this.state.loggedIn) {
            return (
                <View style={[styles.buttonContainer, { justifyContent: 'center' }]}>
                    <Text style={{ textAlign: 'center', fontWeight: '400', fontSize: 15, color: 'white' }}>
                        Please Login to see user details
                        </Text>

                    <View style={{ justifyContent: 'center', alignContent: 'center' }}>
                        {/* {this.checkUserLogin()} */}
                        <TouchableOpacity onPress={() => {
                            // this.setFilterModalVisible();
                            this.props.navigation.navigate('Search');
                        }}>
                            <View style={styles.buttons}>
                                <Text style={styles.buttonText}>
                                    Home
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                </View>
            );
        }

        else if (this.state.loggedIn) {
            console.log("list: ", this.state.myProperties);

            return (
                <View style={styles.buttonContainer}>
                    <View style={{ justifyContent: 'flex-start', backgroundColor: '#49141E' }}>
                        <View style={{ width: 120, height: 120, borderRadius: 60, alignSelf: 'center', marginTop: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                            <Image source={require('../../assets/images/owner.jpg')} style={{ width: 120, height: 120, borderRadius: 60, borderColor: '#ffffff', borderWidth: 2, }} />
                        </View>

                        <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: '600', textAlign: 'center', marginBottom: 20 }}>Robin Peiterson</Text>

                    </View>


                    <View style={{ backgroundColor: '#ffffff', flex: 1, justifyContent: 'center' }}>

                        <IndicatorViewPager
                            style={{ flex: 1, backgroundColor: '#ffffff', flexDirection: 'column-reverse' }}
                            indicator={this.renderTabIndicator()}
                        >
                            <View style={{ backgroundColor: '#ffffff', justifyContent: 'center', padding: 100 }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ width: 50, height: 50, justifyContent: 'center', alignItems: 'center' }}>
                                        <Meticon name="email-outline" size={25} style={{ color: '#49141E' }} />
                                    </View>
                                    <Text style={{ fontSize: 15, fontWeight: '400', color: 'grey', alignSelf: 'center' }}>{this.state.userEmail}</Text>
                                    {/* <Text style={{ fontSize: 15, fontWeight: '400', color: 'grey', alignSelf: 'center' }}>robinpeiter@gmail.com</Text> */}

                                </View>

                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ width: 50, height: 50, justifyContent: 'center', alignItems: 'center' }}>
                                        <Meticon name="phone" size={25} style={{ color: '#49141E' }} />
                                    </View>
                                    <Text style={{ fontSize: 15, fontWeight: '400', color: 'grey', alignSelf: 'center' }}>+94 77 1111111</Text>

                                </View>

                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ width: 50, height: 50, justifyContent: 'center', alignItems: 'center' }}>
                                        <Octicons name="location" size={25} style={{ color: '#49141E' }} />
                                    </View>
                                    <Text style={{ fontSize: 15, fontWeight: '400', justifyContent: 'center', color: 'grey', alignSelf: 'center' }}>Colombo</Text>

                                </View>
                            </View>


                            <View style={{ padding: 10, paddingHorizontal: 30, backgroundColor: '#ffffff', }}>
                                <ScrollView style={{ paddingTop: 10 }}>

                                    <View>
                                        <Text style={{ color: 'grey', marginBottom: 5 }}>Username</Text>
                                        <Text style={{ fontSize: 15 }}>Robin Peiterson</Text>

                                    </View>

                                    <View style={{ marginTop: 20 }}>
                                        <Text style={{ color: 'grey', marginBottom: 5 }}>Email</Text>
                                        {/* <Text style={{ fontSize: 15 }}>{this.state.userEmail}</Text> */}
                                        <Text style={{ fontSize: 15 }}>robinpeiter@gmail.com</Text>

                                    </View>

                                    <View style={{ marginTop: 20 }}>
                                        <Text style={{ color: 'grey', marginBottom: 5 }}>Location</Text>
                                        <Text style={{ fontSize: 15 }}>Colombo</Text>
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
                            <View style={{}}>
                                <TouchableOpacity onPress={() => {
                                    this.props.navigation.navigate('AddPropertyScreen');
                                }}>

                                    <View style={{ height: 50, backgroundColor: '#f3d500', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                                        <Ionicon name="md-add-circle" size={30} color='#49141E' />
                                        <Text style={{ fontWeight: '500', fontSize: 16, marginLeft: 10, color: '#49141E' }}>Add my property</Text>
                                    </View>
                                </TouchableOpacity>

                                <View style={{  flex: 1}}>
                                    <FlatList
                                        data={this.state.myProperties}
                                        extraData={this.state}
                                        renderItem={item => this.renderMyProperties(item)}
                                        keyExtractor={(item, index) => {
                                            return "" + index;
                                        }}
                                    />
                                </View>
                            </View>
                        </IndicatorViewPager>
                    </View>


                    <TouchableOpacity style={{ backgroundColor: '#ffffff' }} onPress={() => {
                        this.onPressSignOutButton();
                    }}>
                        <View style={styles.buttons}>
                            <Text style={styles.buttonText}>
                                Sign Out
                                </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            );
        }
    }

    renderTabIndicator() {
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
            style={{ backgroundColor: '#49141E', borderTopWidth: 0 }}
            textStyle={{ fontSize: 15, color: 'white', paddingBottom: 10 }}
            selectedTextStyle={{ fontSize: 15, color: '#f3d500' }}
        />;
    }

    renderMyProperties({ item, index }) {
        return (
            <View style={{padding: 10 }}>
                <Text>{item.name}</Text>
                <Text>item.name</Text>

            </View>
        );
    }

    render() {
        return (
            <View style={styles.container}>
                {this.renderProfileView()}

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
        height: 50,
        justifyContent: 'center'
    },
    buttonContainer: {
        flex: 1,
        alignContent: 'center',
        backgroundColor: '#49141E',
        // justifyContent: 'center',
        // backgroundColor:'green'
    },
    buttonText: {
        color: '#49141E',
        fontWeight: '500',
        textAlign: 'center',
        fontSize: 17
    }
})