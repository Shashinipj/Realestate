import React, { Component } from 'react';
import {
    View, StyleSheet, TextInput, Image, Text, TouchableOpacity,
    Dimensions, Animated, Modal, AsyncStorage, Alert, FlatList, ActivityIndicator, SafeAreaView,
    RefreshControl, NativeSyntheticEvent, NativeScrollEvent, ImageBackground
} from 'react-native';
import { ScrollView, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Icon } from 'react-native-elements';
import { db } from '../../Database/db'
import firebase from 'react-native-firebase';
import { PagerTabIndicator, IndicatorViewPager, PagerTitleIndicator, PagerDotIndicator } from 'rn-viewpager';
import Accounting from 'accounting-js';
import Ionicon from 'react-native-vector-icons/Ionicons';
import FeaturedListItem from '../../component/featuredListItemComponent';
// import FeaturedListItem from "../../component/featuredListItemComponent";

let PropRef = db.ref('/PropertyType');

export default class SearchScreen extends Component {

    static navigationOptions = {
        header: null,

    };

    arrayholder = [];

    constructor(props) {
        super(props);

        this.state = {
            checked: true,
            propertiesBuy: [],
            propertiesRent: [],
            featuredList: [],
            search: '',
            modalVisible: false,
            forgotPasswordModal: false,

            signUpVisible: false,

            email: '',
            password: '',
            error: '',
            success: '',
            loginState: false,

            loading: true,
            scroll: false,
            uid: '',

            refreshing: false
        };

        // this.forgotPassword_Modal = this.forgotPassword_Modal.bind(this);
    }

    componentDidMount() {

        firebase.auth().onAuthStateChanged(user => {
            this.fetchUser(user);
            console.log("USER: " + user);

        });

        this.loadData();
    }

    loadData() {

        return new Promise((resolve, reject) => {
            let buyProperties = [];
            let rentProperties = [];
            let featuredProps = [];

            PropRef.once('value', (snapshot) => {
                // console.log("VAL ", snapshot);

                const propTypes = snapshot.val();

                for (const propTypeId in propTypes) {
                    const propTypeObj = propTypes[propTypeId];

                    if (propTypeObj.Property) {
                        for (const propId in propTypeObj.Property) {
                            const propObj = propTypeObj.Property[propId];
                            if (propObj.PropAction == 1) {
                                buyProperties.push(propObj);
                                // console.log(buyProperties);
                            }
                            if (propObj.PropAction == 2) {
                                rentProperties.push(propObj);
                                // console.log(rentProperties);
                            }
                            if (propObj.isFeatured == true) {
                                featuredProps.push(propObj);
                            }
                        }

                    }
                }

                this.setState({
                    propertiesBuy: buyProperties,
                    propertiesRent: rentProperties,
                    featuredList: featuredProps,
                    loading: false
                }, () => {
                    resolve();
                });

            });
        });


    }

    fetchUser(user) {
        if (user) {
            this.setState({
                email: user.email,
                loginState: true,
                uid: user.uid
            });
        }
        else {
            this.setState({
                email: '',
                loginState: false,
                password: '',
                error: '',
                success: '',
            });
        }
    }

    setModalVisible(visible) {
        this.setState({ modalVisible: visible });
    }

    // handleChange(checked) {
    //     this.setState({ checked });
    // }

    onPress_Register() {
        this.setState({
            signUpVisible: !this.state.signUpVisible,
            email: '',
            password: '',
            error: '',
            success: ''
        });
    }

    forgotPassword_Modal(visible) {
        // Alert.alert(
        //     'Forgot password',
        //     'Open web browser to reset your password via our mobile website?',
        //     [
        //         {
        //             text: 'Cancel',
        //             onPress: () => console.log('Cancel Pressed'),
        //             style: 'cancel',
        //         },
        //         { text: 'OK', onPress: () => console.log('OK Pressed') },
        //     ],
        //     { cancelable: false },
        // );


        this.setState({ forgotPasswordModal: visible });

    }

    renderForgotPasswordModal() {
        return (

            <Modal
                // animationType="slide"

                transparent={true}
                visible={this.state.forgotPasswordModal}
                onRequestClose={() => {
                    Alert.alert('Modal has been closed.');
                }}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 }}>

                    <View style={{
                        backgroundColor: '#ffffff', width: '90%', height: '25%', margin: 20, alignItems: 'center', justifyContent: 'center',
                        borderRadius: 15
                    }}>
                        {/* <Text>Please enter your email</Text> */}
                        <View style={{ borderBottomWidth: 1, width: '90%', backgroundColor: '#ffffff' }}>
                            <TextInput
                                label="Email"
                                value={this.state.email}
                                style={styles.textinput}
                                secureTextEntry={false}
                                onChangeText={email => this.setState({ email })}
                                editable={true}
                                maxLength={40}
                                placeholder='Please enter your email'
                            />

                        </View>
                        <View style={{ flexDirection: 'row', padding: 10, marginTop: 20 }}>

                            <View style={{ alignContent: 'flex-start', flex: 1, alignItems: 'center' }}>
                                <TouchableOpacity onPress={() => this.forgotPassword_Modal(false)} >
                                    <Text style={{ fontSize: 17, fontWeight: '500' }}>Cancel</Text>
                                </TouchableOpacity>

                            </View>

                            <View style={{ alignContent: 'flex-start', flex: 1, alignItems: 'center' }}>
                                <TouchableOpacity onPress={() => {
                                    this.forgotPassword(this.state.email);
                                }}>
                                    <Text style={{ fontSize: 17, fontWeight: '500' }}>OK</Text>
                                </TouchableOpacity>
                            </View>

                        </View>

                    </View>
                </View>

            </Modal>
        );
    }

    forgotPassword(yourEmail) {
        firebase.auth().sendPasswordResetEmail(yourEmail)
            .then(() => {
                alert('Please check your email...');
                this.forgotPassword_Modal(false);
            }).catch((e) => {
                console.log(e);
                console.log(e.code);
                if (e.code == 'auth/user-not-found') {
                    alert('You are not a registered user');
                }
                else if (e.code == 'auth/invalid-email') {
                    alert('The email address is badly formatted');
                }
            })
    }

    onSignUPButtonPress() {

        firebase
            .auth()
            .createUserWithEmailAndPassword(this.state.email, this.state.password)
            .then(() => {
                this.onSignInButtonPress();
            })
            //   .catch(error => this.setState({ errorMessage: error.message }))
            .catch((error) => {
                let errorCode = error.code
                let errorMessage = error.message;
                if (errorCode == 'auth/weak-password') {
                    this.onLoginFailure.bind(this)('Weak password!')
                } else {
                    this.onLoginFailure.bind(this)(errorMessage)
                }
            });
    }

    onSignInButtonPress() {
        console.log('sign in button pressed');

        const { email, password } = this.state
        firebase
            .auth()
            .signInWithEmailAndPassword(email, password)
            .then(() => {
                this.onLoginSuccess();
                this.clearAsyncStorage();
            })
            .catch((error) => {
                let errorCode = error.code
                let errorMessage = error.message;
                this.onLoginFailure(errorMessage)
            });
    }

    clearAsyncStorage = async () => {
        AsyncStorage.clear();
    }

    onLoginSuccess() {
        console.log(this.state.email);

        this.setState({
            error: '',
            success: 'Successfully login',
            modalVisible: !this.state.modalVisible,
            loginState: true
        })
    }

    loginReset() {
        this.setState({
            email: '',
            password: '',
            error: '',
            success: '',
            loading: false
        })
    }

    onLoginFailure(errorMessage) {
        this.setState({ error: errorMessage, loading: false, success: '' })
    }

    renderJoinButton() {
        if (!this.state.loginState) {
            return (
                <View style={styles.textContainer}>

                    <Text style={{ fontSize: 18, fontWeight: '400' }}>Never miss a property again</Text>

                    <View style={{ marginVertical: 20 }}>
                        <Text style={{ textAlign: 'center', color: 'gray', fontSize: 13 }}>
                            Save your searches and be notified when {"\n"}new matching properties hit the market
                                </Text>
                    </View>



                    <TouchableOpacity style={styles.joinButton}
                        onPress={() => {
                            this.setModalVisible(!this.state.modalVisible);
                        }}
                    >
                        {/* <Text style={{ textAlign: 'center', color: '#49141E', fontWeight: '600' }}>Login</Text> */}
                        <Text style={{ textAlign: 'center', color: '#ffffff', fontWeight: '600' }}>Login</Text>

                    </TouchableOpacity>
                </View>
            );
        }

        else if (this.state.loginState) {
            return (

                <View style={{ flex: 1 }}>

                    <Text style={{ fontSize: 15, fontWeight: '600', marginVertical: 10, marginHorizontal: 5 }}>Featured Properties</Text>
                    {(this.state.loading) ?
                        <View style={styles.loader}>
                            <ActivityIndicator
                                size='small'
                                color="#757575"
                                style={styles.activityIndicator}
                            />
                        </View>
                        :
                        <FlatList
                            data={this.state.featuredList}
                            renderItem={item => this.renderItem(item)}
                            keyExtractor={(item, index) => {
                                return "" + index;
                            }}
                            horizontal={true}
                        />
                    }

                    <Text style={{ fontSize: 15, fontWeight: '600', marginVertical: 10, marginHorizontal: 5 }}>Properties to Buy in Sri Lanka</Text>
                    {(this.state.loading) ?
                        <View style={styles.loader}>
                            <ActivityIndicator
                                size='small'
                                color="#757575"
                                style={styles.activityIndicator}
                            />
                        </View>
                        :
                        <FlatList
                            data={this.state.propertiesBuy}
                            renderItem={item => this.renderItem(item)}
                            keyExtractor={(item, index) => {
                                return "" + index;
                            }}
                            horizontal={true}
                        />
                    }


                    <Text style={{ fontSize: 15, fontWeight: '600', marginVertical: 10, marginHorizontal: 5 }}>Properties for Rent in Sri Lanka</Text>

                    {(this.state.loading) ?
                        <View style={styles.loader}>
                            <ActivityIndicator
                                size='small'
                                color="#757575"
                                style={styles.activityIndicator}
                            />
                        </View>
                        :
                        <FlatList
                            data={this.state.propertiesRent}
                            renderItem={item => this.renderItem(item)}
                            keyExtractor={(item, index) => {
                                return "" + index;
                            }}
                            horizontal={true}
                        />
                    }
                </View>
            );
        }

    }

    renderItem({ item, index }) {
        return (
            <FeaturedListItem
                propertyData={item}
                onPressItem={(item) => {
                    this.props.navigation.navigate("ExpandedView", { PropertyData: item });
                }} />
        );
    }


    loginScreenImage() {
        if (!this.state.loginState) {
            return (
                <Image source={require('../../assets/images/search-home.jpg')} style={styles.imageTop} />
            );
        }

        else {
            if (this.state.uid == 'DuRUxztWlbUGW7Oeq6blmY0BwIw2') {
                return (
                    <View style={{ paddingTop: 50 }}>
                        <Image source={require('../../assets/images/family.jpg')} style={styles.imageTop} />
                    </View>
                );
            }
            else {
                return (
                    <View style={{}}>
                        <Image source={require('../../assets/images/family.jpg')} style={styles.imageTop} />
                    </View>
                );
            }
        }
    }

    onRefresh() {
        this.setState({
            refreshing: true,
            // loading: false
        });
        this.loadData()
            .then(() => {
                this.setState({
                    refreshing: false,
                    // loading: false
                });
            });


    }

    renderSignUpSignInView() {
        if (!this.state.signUpVisible) {

            return (
                <View style={{ alignItems: "center", }} >
                    <View style={{ width: '100%' }}>
                        <TouchableOpacity style={styles.loginButton}
                            onPress={this.onSignInButtonPress.bind(this)}
                        >
                            <Text style={{ textAlign: 'center', color: '#ffffff' }}>Sign in</Text>

                        </TouchableOpacity>
                    </View>


                    <View style={{}}>
                        <TouchableOpacity style={{ margin: 20 }} onPress={() => {
                            this.forgotPassword_Modal(true);
                            // this.setModalVisible(false);
                        }
                        }>
                            {/* <Text style={{ color: '#49141E', fontSize: 12 }}>Forgot your password?</Text> */}
                            <Text style={{ color: '#212121', fontSize: 12, fontWeight: '600' }}>Forgot your password?</Text>
                        </TouchableOpacity>

                        <View style={{ flexDirection: 'row' }}>
                            {/* <Text style={{ color: '#616161', fontSize: 12 }}>Don't have an account? {' '}</Text> */}
                            <Text style={{ color: '#eeeeee', fontSize: 12, fontWeight: '700' }}>Don't have an account? {' '}</Text>
                            <TouchableOpacity onPress={this.onPress_Register.bind(this)}>
                                {/* <Text style={{ color: '#49141E', fontSize: 12, fontWeight: '500' }}>Register</Text> */}
                                <Text style={{ color: '#212121', fontSize: 12, fontWeight: '600' }}>Register</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>
            );
        }
        else {
            return (
                <View style={{ alignItems: "center" }} >
                    <View style={{ alignSelf: 'center', width: '100%' }}>
                        <TouchableOpacity style={styles.loginButton} onPress={this.onSignUPButtonPress.bind(this)}>
                            <Text style={{ textAlign: 'center', color: '#ffffff' }}>Create account</Text>

                        </TouchableOpacity>
                    </View>

                    {/* <TouchableOpacity style={{ margin: 20 }} onPress={this.forgotPassword_Alert}> */}
                    {/* <Text style={{ color: '#49141E', fontSize: 12 }}>Forgot your password?</Text> */}

                    <View style={{ flexDirection: 'row', margin: 20 }}>
                        {/* <Text style={{ color: '#616161', fontSize: 12 }}>Already have an account? {' '}</Text> */}
                        <Text style={{ color: '#eeeeee', fontSize: 12, fontWeight: '700'  }}>Already have an account? {' '}</Text>
                        <TouchableOpacity onPress={this.onPress_Register.bind(this)}>
                            {/* <Text style={{ color: '#49141E', fontSize: 12, fontWeight: '500' }}>Sign in</Text> */}
                            <Text style={{ color: '#212121', fontSize: 12, fontWeight: '500' }}>Sign in</Text>
                        </TouchableOpacity>
                    </View>

                    {/* </TouchableOpacity> */}

                </View>
            );
        }
    }

    showJoinModal() {

        return (

            <Modal
                animationType="slide"
                transparent={false}
                visible={this.state.modalVisible}
                onRequestClose={() => {
                    Alert.alert('Modal has been closed.');
                }}>
                {/* <View style={{ marginTop: 22, backgroundColor: '#f3d500' }}> */}

                {/* <ImageBackground source={require('../../assets/images/skycraper.jpg')} style={{height:'100%', width:'100%'}}> */}
                <ImageBackground source={require('../../assets/images/sky7.jpg')} style={{ height: '100%', width: '100%' }}>

                    <View style={{ marginTop: 22 }}>

                        <TouchableOpacity
                            style={{
                                // backgroundColor: "red",
                                alignSelf: "flex-start",
                                padding: 10
                            }}
                            onPress={() => {
                                this.setModalVisible(!this.state.modalVisible);
                                // this.onLoginSuccess.bind(this);
                                this.loginReset.bind(this)();
                            }}>

                            <Icon
                                name="close"
                                type='MaterialIcons'
                                size={20}
                            />

                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalContainer}>
                        <Image source={require('../../assets/images/muthu.png')} style={styles.image} />
                        {/* <View style={{backgroundColor:'yellow', marginVertical: 5}}> */}
                        <View style={{ width: '70%', alignItems: 'center', borderWidth: 1, borderRadius: 4, borderColor: '#E0E0E0', backgroundColor: '#F5F5F5' }}>
                            <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 5 }}>
                                <Icon
                                    name="email"
                                    type='MaterialIcons'
                                    size={20}
                                    color='gray'
                                />
                                <TextInput
                                    label="Email"
                                    value={this.state.email}
                                    style={styles.textinput}
                                    secureTextEntry={false}
                                    onChangeText={email => this.setState({ email })}
                                    editable={true}
                                    maxLength={40}
                                    placeholder='Email address' />
                            </View>

                            <View style={{ height: 1, backgroundColor: '#E0E0E0', width: '100%' }}></View>

                            <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 5 }}>

                                <Icon
                                    name="lock"
                                    type='MaterialIcons'
                                    size={20}
                                    color='gray'
                                />
                                <TextInput
                                    label="Password"
                                    value={this.state.password}
                                    style={styles.textinput}
                                    onChangeText={password => this.setState({ password })}
                                    editable={true}
                                    maxLength={40}
                                    placeholder='Password'
                                    secureTextEntry={true} />

                            </View>
                        </View>

                        <View style={{ width: "70%" }}>
                            {this.renderSignUpSignInView()}
                        </View>

                        <Text style={styles.errorTextStyle} >
                            {this.state.error}
                        </Text>

                        <Text style={styles.errorTextStyle} >
                            {this.state.success}
                        </Text>

                        <View style={styles.footerView}>
                            <TouchableOpacity>
                                <Text style={{ fontSize: 12, color: '#616161' }}> Personal information collection statement</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                    {this.renderForgotPasswordModal()}

                </ImageBackground>
            </Modal>
        );
    }

    /**
     * 
     * @param {NativeSyntheticEvent<NativeScrollEvent>} event 
     */
    onScroll(event) {

        if (event && event.nativeEvent) {
            const offset = event.nativeEvent.contentOffset;

            console.log(offset);

            // if (offset.y <= 10) {
            //     if (this.state.scroll) {
            //         this.setState({
            //             scroll: false
            //         });
            //     }
            // }
            // else if (offset.y > 0) {
            //     if (!this.state.scroll) {
            //         this.setState({
            //             scroll: true
            //         });
            //     }
            // }


            if (offset.y > 10) {
                if (!this.state.scroll) {
                    this.setState({
                        scroll: true
                    });
                }
            }
            else {
                this.setState({
                    scroll: false
                });
            }
        }
    }

    renderAddNewProperty() {
        if (this.state.refreshing) {
            return null;
        }

        if (this.state.loginState && this.state.uid == 'DuRUxztWlbUGW7Oeq6blmY0BwIw2') {

            // if (!this.state.scroll) {
            return (
                <TouchableOpacity
                    // style={{ backgroundColor: 'green', position: 'absolute', flex: 1, width: '100%', top: 105 }}
                    style={{ backgroundColor: 'green', flex: 1, width: '100%' }}
                    onPress={() => {
                        this.props.navigation.navigate('AddPropertyScreen');
                    }}>

                    <View style={styles.addNewPropertyView}>
                        {/* <Ionicon name="md-add-circle" size={30} color='#49141E' /> */}
                        <Ionicon name="md-add-circle" size={30} color='#ffffff' />
                        {/* <Text style={{ fontWeight: '500', fontSize: 16, marginLeft: 10, color: '#49141E' }}>Add Property</Text> */}
                        <Text style={{ fontWeight: '500', fontSize: 16, marginLeft: 10, color: '#ffffff' }}>Add Property</Text>
                    </View>
                </TouchableOpacity>);
            // }

            // else {
            //     return (
            //         <TouchableOpacity
            //             style={styles.addNewSubButton}
            //             onPress={() => {
            //                 this.props.navigation.navigate('AddPropertyScreen');
            //             }}
            //         >
            //             <Ionicon name="md-add" size={20} color='#000000' />
            //             <Text style={{ marginLeft: 5, fontWeight: '600' }}>Add</Text>
            //         </TouchableOpacity>
            //     );
            // }

        }

        return null;
    }

    renderAddNewProperty2() {
        if (this.state.refreshing) {
            return null;
        }

        if (this.state.loginState && this.state.uid == 'DuRUxztWlbUGW7Oeq6blmY0BwIw2') {

            if (this.state.scroll) {
                return (
                    <TouchableOpacity
                        style={styles.addNewSubButton}
                        onPress={() => {
                            this.props.navigation.navigate('AddPropertyScreen');
                        }}
                    >
                        <Ionicon name="md-add" size={20} color='#000000' />
                        <Text style={{ marginLeft: 5, fontWeight: '600' }}>Add</Text>
                    </TouchableOpacity>
                );
            }

        }

        return null;
    }

    render() {

        return (
            <SafeAreaView style={styles.container}>

                {/* <ScrollView> */}

                <View style={{}}>
                    <View style={styles.searchBarView}>

                        <TouchableWithoutFeedback style={{ padding: 5 }} onPress={() => {
                            this.props.navigation.navigate('SearchBarScreen');
                        }}>

                            <View style={{ height: 30, alignItems: 'center', flexDirection: 'row' }}>
                                <Icon
                                    name="search"
                                    type='MaterialIcons'
                                    size={20}
                                    color='gray'
                                />
                                <Text style={{ color: 'gray', marginLeft: 10 }}>Search suburb, postcode, state</Text>
                            </View>

                        </TouchableWithoutFeedback>
                    </View>
                </View>

                <ScrollView onScroll={this.onScroll.bind(this)} style={{}}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={() => {
                                this.onRefresh();
                            }}
                        />
                    }
                >

                    {this.renderAddNewProperty()}
                    {this.loginScreenImage()}

                    <View style={styles.bottomContainer}>

                        {this.renderJoinButton()}

                    </View>

                </ScrollView>


                {this.renderAddNewProperty2()}

                {this.showJoinModal()}


            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: '#E0E0E0',
        // paddingTop: 30
    },
    imageTop: {
        width: '100%',
        height: 300,
        marginTop: 5,
        borderRadius: 5,
    },
    bottomContainer: {
        backgroundColor: "#ffffff",
        // backgroundColor:'#FFFDE7',
        padding: 5
    },
    textContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15
    },
    joinButton: {
        // backgroundColor: '#f3d500',
        backgroundColor: '#212121',
        width: '40%',
        height: 30,
        borderRadius: 4,
        justifyContent: 'center',
        marginVertical: 10
    },
    footer: {
        backgroundColor: 'white',
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 0.5,
        borderColor: '#E0E0E0'
    },
    searchBarView: {
        borderRadius: 4,
        paddingHorizontal: 5,
        backgroundColor: '#ffffff'
    },

    //modal styles
    modalContainer: {
        // backgroundColor: '#f3d500',
        // backgroundColor: '#757575',
        flex: 1,
        alignItems: 'center',
        paddingTop: 50
    },
    image: {
        width: 200,
        height: 100,
        resizeMode: 'contain',
        marginBottom: 50

    },
    textinput: {
        height: 40,
        width: '90%',
        paddingHorizontal: 5,
    },
    loginButton: {
        // backgroundColor: '#C62828',
        // backgroundColor: '#49141E',
        backgroundColor: '#212121',
        width: '100%',
        height: 30,
        borderRadius: 4,
        justifyContent: 'center',
        marginTop: 15,
    },
    footerView: {
        position: 'absolute',
        bottom: 0,
        height: 30,
        // backgroundColor:'green', 
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 1,
        borderColor: 'gray'
    },
    errorTextStyle: {
        textAlign: 'justify',
        fontSize: 13,
        alignSelf: 'center',
        justifyContent: 'center',
        color: 'red',
        padding: 10,
        paddingHorizontal: 50
    },
    activityIndicator: {
        flex: 1,
        height: 120
    },
    addNewPropertyView: {
        height: 50,
        // backgroundColor: '#f3d500',
        backgroundColor: '#757575',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        position: 'absolute',
        width: '100%'
    },
    addNewSubButton: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: '#BDBDBD',
        position: 'absolute',
        height: 30,
        width: 70,
        borderRadius: 15,
        right: 15,
        top: 130,
        zIndex: 5,
    }

});