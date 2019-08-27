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
import MetComIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FeaturedListItem from '../../component/featuredListItemComponent';
import RNFetchBlob from 'react-native-fetch-blob';
import ImagePicker from 'react-native-image-crop-picker';
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
            confirmPassword: '',
            error: '',
            success: '',
            userName: '',
            contactNumber: '',
            address: '',
            loginState: false,

            loading: true,
            scroll: false,
            uid: '',

            refreshing: false,
            profilePic: null,
            profilePicUrl: null
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
                confirmPassword: '',
                error: '',
                success: '',
                userName: '',
                contactNumber: '',
                address: '',
                profilePic: null,
                profilePicUrl: null,
            });
        }
    }

    setModalVisible(visible) {
        this.setState({ modalVisible: visible });
    }

    clearStateData() {
        this.setState({
            signUpVisible: !this.state.signUpVisible,
            email: '',
            password: '',
            confirmPassword: '',
            error: '',
            success: '',
            userName: '',
            contactNumber: '',
            address: '',
            profilePic: null,
            profilePicUrl: null,
        });
    }

    forgotPassword_Modal(visible) {
        this.setState({ forgotPasswordModal: visible });
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
                this.saveUserDetails().then(() => {
                    this.onSignInButtonPress();
                })
                    //   .catch(error => this.setState({ errorMessage: error.message }))
                    .catch((error) => {
                        let errorCode = error.code
                        let errorMessage = error.message;
                        if (errorCode == 'auth/weak-password') {
                            this.onLoginFailure('Weak password!')
                        } else {
                            this.onLoginFailure(errorMessage)
                        }
                    });
            }).catch((error) => {
                console.log("save user data error: ", error);
            })
    }

    validateSignUpForm() {
        const { userName, email, password, confirmPassword, contactNumber, address } = this.state;

        if (userName != '') {
            if (password != '') {
                if (confirmPassword != '') {
                    if (contactNumber != '') {
                        if (password == confirmPassword) {
                            this.onSignUPButtonPress();
                        }
                        else {
                            alert('Passwords do not match!');
                        }
                    }
                    else {
                        alert('Please enter your contact number')
                    }
                }
                else {
                    alert('Please confirm your Password');
                }
            }
            else {
                alert('Please enter a password ');
            }
        }
        else {
            alert('Please enter a user name');
        }
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

    saveUserDetails() {

        return new Promise((resolve, reject) => {
            const user = firebase.auth().currentUser;

            this.saveProfilePicture(this.state.profilePic, user.uid)
                .then(() => {
                    db.ref(`Users/${user.uid}/UserDetails`)
                        .set(
                            {
                                UserName: this.state.userName,
                                Email: this.state.email,
                                ContactNumber: this.state.contactNumber,
                                Address: this.state.address,
                                ProfilePicUrl: this.state.profilePicUrl

                            })
                        .then(() => {

                            console.log('Saved User Details!!!');
                            // console.log('image1', this.state.images);
                            // alert("Succefully created a account!");
                            // this.setModalVisible(false);
                            // this.resetPropertyView();

                            // this.props.navigation.pop();
                            resolve(true);
                        }).catch((error) => {
                            console.log(error);
                            reject(error);
                        });

                }).catch((error) => {
                    console.log(error);
                    reject(error);
                });

        });
    }

    saveProfilePicture(profilePic, uid) {

        return new Promise((resolve, reject) => {

            console.log('profilePic', profilePic);

            const image = profilePic.uri

            const Blob = RNFetchBlob.polyfill.Blob
            const fs = RNFetchBlob.fs
            window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
            window.Blob = Blob

            let imageUrl = [];
            let uploadBlob = null
            const imgName = new Date().getTime();

            console.log('imgName', imgName);
            const imageRef = firebase.storage().ref(`ProfilePictures/${uid}`);
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
                    this.setState({
                        profilePicUrl: url
                    });
                    console.log('profilePicUrl', this.state.profilePicUrl);
                    resolve(true);
                })
                .catch((error) => {
                    console.log(error);

                    reject(error);
                });
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
            // modalVisible: false,
            modalVisible: !this.state.modalVisible,
            loginState: true
        })
    }

    loginReset() {
        this.setState({
            email: '',
            password: '',
            confirmPassword: '',
            error: '',
            success: '',
            userName: '',
            contactNumber: '',
            address: '',
            profilePic: null,
            profilePicUrl: null,
            loading: false
        })
    }

    /**
   * 
   * @param {NativeSyntheticEvent<NativeScrollEvent>} event 
   */
    onScroll(event) {

        if (event && event.nativeEvent) {
            const offset = event.nativeEvent.contentOffset;

            // console.log(offset);

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

    onLoginFailure(errorMessage) {
        this.setState({ error: errorMessage, loading: false, success: '' })
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

    pickProfilePicture() {
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
                // profilePic: {  width: image.width, height: image.height, mime: image.mime },
                profilePic: { uri: image.path, width: image.width, height: image.height, mime: image.mime },
                // images: null
            });

            // console.log('image', this.state.image.uri);
        }).catch(e => {
            console.log(e);
            Alert.alert(e.message ? e.message : e);
        });
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
                            data={this.state.featuredList.reverse()}
                            renderItem={item => this.renderItem(item)}
                            keyExtractor={(item, index) => {
                                return "" + index;
                            }}
                            horizontal={true}
                        />
                    }

                    <Text style={{ fontSize: 15, fontWeight: '600', marginVertical: 10, marginHorizontal: 5 }}>Properties for Sale </Text>
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


                    <Text style={{ fontSize: 15, fontWeight: '600', marginVertical: 10, marginHorizontal: 5 }}>Properties for Rent </Text>

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

    renderImage(image) {
        return (
            <TouchableOpacity style={{}} onPress={this.pickProfilePicture.bind(this)} >
                <Image style={{ width: 100, height: 100, resizeMode: 'cover', borderRadius: 50 }} source={image} >
                    {/* <TouchableOpacity style={{ alignItems: 'flex-end', marginRight: -7, marginTop: -7 }} onPress={() => this.removeImages(image)}>
                        <Ionicon name="md-close-circle-outline" size={20} color={'grey'} />
                    </TouchableOpacity> */}

                </Image>
            </TouchableOpacity>

        );
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

    renderItem({ item, index }) {
        return (
            <FeaturedListItem
                propertyData={item}
                onPressItem={(item) => {
                    this.props.navigation.navigate("ExpandedView", { PropertyData: item });
                }} />
        );
    }

    renderLoginScreenImage() {
        if (!this.state.loginState) {
            return (
                <Image source={require('../../assets/images/search-home.jpg')} style={styles.imageTop} />
            );
        }

        else {
            // if (this.state.uid == 'DuRUxztWlbUGW7Oeq6blmY0BwIw2') {
            if (this.state.uid == 'dSVKhiZ2rTUjp8Wghlnt7Ap9QX13') {
                return (
                    <View style={{}}>
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
                        }}>
                            <Text style={{ color: '#212121', fontSize: 12, fontWeight: '600' }}>Forgot your password?</Text>
                        </TouchableOpacity>

                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ color: '#eeeeee', fontSize: 12, fontWeight: '700' }}>Don't have an account? {' '}</Text>
                            <TouchableOpacity onPress={this.clearStateData.bind(this)}>
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
                        <TouchableOpacity style={styles.loginButton} onPress={this.validateSignUpForm.bind(this)}>
                            <Text style={{ textAlign: 'center', color: '#ffffff' }}>Create account</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: 'row', margin: 20 }}>
                        <Text style={{ color: '#eeeeee', fontSize: 12, fontWeight: '700' }}>Already have an account? {' '}</Text>
                        <TouchableOpacity onPress={this.clearStateData.bind(this)}>
                            <Text style={{ color: '#212121', fontSize: 12, fontWeight: '500' }}>Sign in</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }
    }

    renderJoinModal() {

        return (

            <Modal
                animationType="slide"
                transparent={false}
                visible={this.state.modalVisible}
                onRequestClose={() => {
                    Alert.alert('Modal has been closed.');
                }}>

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
                                this.loginReset();
                            }}>

                            <Icon
                                name="close"
                                type='MaterialIcons'
                                size={20}
                            />

                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalContainer}>

                        {this.renderForms()}

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

    renderForms() {

        if (!this.state.signUpVisible) {
            return (
                <View>
                    <Image source={require('../../assets/images/muthu.png')} style={styles.image} />
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
                </View>
            );
        }
        else {
            return (
                <View style={{}}>
                    <Image source={require('../../assets/images/muthu.png')} style={[styles.image, { marginBottom: 10 }]} />

                    <TouchableOpacity onPress={this.pickProfilePicture.bind(this)}>
                        <View style={{
                            width: 100, height: 100, alignSelf: 'center', backgroundColor: '#ffffff', marginBottom: 15,
                            borderRadius: 50
                        }}>
                            {this.state.profilePic ? <View style={{
                                width: 100, height: 100, alignSelf: 'center', backgroundColor: '#ffffff', marginBottom: 10,
                                borderRadius: 50
                            }}>{this.renderImage(this.state.profilePic)}</View> :
                                null
                            }
                        </View>
                    </TouchableOpacity>

                    <View style={{ width: '70%', alignItems: 'center', borderWidth: 1, borderRadius: 4, borderColor: '#E0E0E0', backgroundColor: '#F5F5F5' }}>

                        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 5 }}>
                            <Icon
                                name="person"
                                type='MaterialIcons'
                                size={25}
                                color='gray'
                            />
                            <TextInput
                                label="UserName"
                                value={this.state.userName}
                                style={styles.textinput}
                                secureTextEntry={false}
                                onChangeText={userName => this.setState({ userName })}
                                editable={true}
                                maxLength={40}
                                placeholder='User Name' />
                        </View>

                        <View style={{ height: 1, backgroundColor: '#E0E0E0', width: '100%' }}></View>

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

                        <View style={{ height: 1, backgroundColor: '#E0E0E0', width: '100%' }}></View>

                        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 5 }}>

                            <Icon
                                name="lock"
                                type='MaterialIcons'
                                size={20}
                                color='gray'
                            />
                            <TextInput
                                label="ConfirmPassword"
                                value={this.state.confirmPassword}
                                style={styles.textinput}
                                onChangeText={confirmPassword => this.setState({ confirmPassword })}
                                editable={true}
                                maxLength={40}
                                placeholder='Confirm Password'
                                secureTextEntry={true} />

                        </View>

                        <View style={{ height: 1, backgroundColor: '#E0E0E0', width: '100%' }}></View>

                        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 5 }}>
                            <Icon
                                name="phone"
                                type='MaterialIcons'
                                size={20}
                                color='gray'
                            />
                            <TextInput
                                label="ContactNumber"
                                value={this.state.contactNumber}
                                style={styles.textinput}
                                secureTextEntry={false}
                                onChangeText={contactNumber => this.setState({ contactNumber })}
                                editable={true}
                                maxLength={40}
                                placeholder='Contact Number' />
                        </View>

                        <View style={{ height: 1, backgroundColor: '#E0E0E0', width: '100%' }}></View>

                        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 5 }}>
                            <MetComIcon
                                name="home-map-marker"
                                type='MaterialCommunityIcons'
                                size={25}
                                color='gray'
                            />
                            <TextInput
                                label="address"
                                value={this.state.address}
                                style={styles.textinput}
                                secureTextEntry={false}
                                onChangeText={address => this.setState({ address })}
                                editable={true}
                                maxLength={40}
                                placeholder='Address' />
                        </View>
                    </View>
                </View>
            );
        }
    }

    renderAddNewProperty() {
        if (this.state.refreshing) {
            return null;
        }

        if (this.state.loginState && this.state.uid == 'dSVKhiZ2rTUjp8Wghlnt7Ap9QX13') {
            // if (this.state.loginState && this.state.uid == 'DuRUxztWlbUGW7Oeq6blmY0BwIw2') {

            return (
                <TouchableOpacity
                    style={{ backgroundColor: 'green', flex: 1, width: '100%' }}
                    onPress={() => {
                        this.props.navigation.navigate('AddPropertyScreen');
                        console.log("touchableOpacity test add new");
                    }}>
                    <View style={[styles.addNewPropertyView, {}]}>
                        <Ionicon name="md-add-circle" size={30} color='#ffffff' />
                        <Text style={{ fontWeight: '500', fontSize: 16, marginLeft: 10, color: '#ffffff' }}>Add Property</Text>
                    </View>
                </TouchableOpacity>);

        }

        return null;
    }

    renderAddNewProperty2() {
        if (this.state.refreshing) {
            return null;
        }

        if (this.state.loginState && this.state.uid == 'dSVKhiZ2rTUjp8Wghlnt7Ap9QX13') {
            // if (this.state.loginState && this.state.uid == 'DuRUxztWlbUGW7Oeq6blmY0BwIw2') {

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
                    {this.renderLoginScreenImage()}

                    <View style={styles.bottomContainer}>

                        {this.renderJoinButton()}

                    </View>
                </ScrollView>

                {this.renderAddNewProperty2()}
                {this.renderJoinModal()}

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
        // paddingTop: 30
    },
    image: {
        width: 200,
        height: 100,
        resizeMode: 'contain',
        marginBottom: 50,
        alignSelf: 'center'

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
        // position: 'absolute',
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