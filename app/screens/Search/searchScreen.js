import React, { Component } from 'react';
import { View, StyleSheet, TextInput, TextInputProps, Image, Text, TouchableOpacity, Switch, Modal, ActivityIndicator, Button, Alert } from 'react-native';
import { SearchBar } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';
import { Icon } from 'react-native-elements';

import firebase from 'react-native-firebase';

export default class SearchScreen extends Component {

    static navigationOptions = {
        header: null,

    };

    arrayholder = [];

    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);

        this.state = {
            checked: true,
            dataSource: [],
            search: '',
            modalVisible: false,

            // loginButton: 'Sign in',
            signUpVisible: false,

            email: '',
            password: '',
            error: '',
            success: '',
            loginState: false
        };

        this.forgotPassword_Alert = this.forgotPassword_Alert.bind(this);
    }


    setModalVisible(visible) {
        this.setState({ modalVisible: visible });
    }

    updateSearch = search => {
        this.setState({ search });
    };

    handleChange(checked) {
        this.setState({ checked });
    }

    onPress_Register() {
        this.setState({
            signUpVisible: !this.state.signUpVisible,
            email: '',
            password: '',
            error: '',
            success: ''
        });
    }

    forgotPassword_Alert() {
        Alert.alert(
            'Forgot password',
            'Open web browser to reset your password via our mobile website?',
            [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                { text: 'OK', onPress: () => console.log('OK Pressed') },
            ],
            { cancelable: false },
        );

    }


    // SearchFilterFunction(text) {
    //     //passing the inserted text in textinput
    //     const newData = this.arrayholder.filter(function (item) {
    //         //applying filter for the inserted text in search bar
    //         const itemData = item.trackName ? item.trackName.toUpperCase() : ''.toUpperCase();
    //         const textData = text.toUpperCase();
    //         return itemData.indexOf(textData) > -1;
    //     });
    //     this.setState({
    //         //setting the filtered newData on datasource
    //         //After setting the data it will automatically re-render the view
    //         dataSource: newData,
    //         search: text,
    //     });
    // }


    onSignUPButtonPress = () => {

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
            })
            .catch((error) => {
                let errorCode = error.code
                let errorMessage = error.message;
                this.onLoginFailure(errorMessage)
            });

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
                        this.setState({ loginState: false });
                        this.loginReset();
                    }
                },
            ],
            { cancelable: false },
        );
    }

    loginReset() {
        this.setState({
            email: '', password: '', error: '', success: '', loading: false
        })
    }

    onLoginFailure(errorMessage) {
        this.setState({ error: errorMessage, loading: false, success: '' })
    }

    renderJoinButton() {
        if (!this.state.loginState) {
            return (
                <TouchableOpacity style={styles.joinButton}
                    // onPress={this.onPress_LoginButton.bind(this)}
                    onPress={() => {
                        // this.setModalVisible(true);
                        this.setModalVisible(!this.state.modalVisible);
                        // this.loginReset();
                    }}
                >
                    <Text style={{ textAlign: 'center', color: '#49141E' }}>Join</Text>

                </TouchableOpacity>
            );
        }

        else {
            return (
                <TouchableOpacity style={styles.joinButton}
                    onPress={() => {
                        firebase.auth().signOut();
                        this.onPressSignOutButton();
                    }}
                >
                    <Text style={{ textAlign: 'center', color: '#49141E' }}>Sign Out</Text>

                </TouchableOpacity>
            );
        }
    }

    renderView() {
        if (!this.state.signUpVisible) {

            return (
                <View style={{ alignItems: "center" }} >
                    <View style={{ width: '100%' }}>
                        <TouchableOpacity style={styles.loginButton}
                            // onPress={this.onButtonPress.bind(this) || this.renderButton()}
                            onPress={this.onSignInButtonPress.bind(this)}
                        // onPress={this.onSignUPButtonPress.bind(this)}
                        >
                            <Text style={{ textAlign: 'center', color: '#ffffff' }}>Sign in</Text>

                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={{ margin: 20 }} onPress={this.forgotPassword_Alert}>
                        <Text style={{ color: '#49141E', fontSize: 12 }}>Forgot your password?</Text>
                    </TouchableOpacity>

                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ color: '#616161', fontSize: 12 }}>Don't have an account? {' '}</Text>
                        <TouchableOpacity onPress={this.onPress_Register.bind(this)}>
                            <Text style={{ color: '#49141E', fontSize: 12, fontWeight: 500 }}>Register</Text>
                        </TouchableOpacity>
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

                    <TouchableOpacity style={{ margin: 20 }} onPress={this.forgotPassword_Alert}>
                        {/* <Text style={{ color: '#49141E', fontSize: 12 }}>Forgot your password?</Text> */}
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ color: '#616161', fontSize: 12 }}>Already have an account? {' '}</Text>
                            <TouchableOpacity onPress={this.onPress_Register.bind(this)}>
                                <Text style={{ color: '#49141E', fontSize: 12, fontWeight: 500 }}>Sign in</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>

                </View>
            );
        }
    }

    render() {


        const { search } = this.state;

        return (
            <View style={styles.container}>
                <ScrollView>

                    <View style={{ paddingTop: 20, padding: 5 }}>
                        <View style={styles.searchBarView}>

                            <SearchBar
                                // round
                                // style={{borderRadius:4}}
                                placeholder="Search suburb, postcode, state"
                                onChangeText={this.updateSearch}
                                value={search}
                                lightTheme='true'
                                containerStyle={{
                                    height: 50,
                                    backgroundColor: '#ffffff',
                                    // borderRadius:4
                                    // borderTopWidth: 0,
                                }}
                                inputContainerStyle={{
                                    height: 30,
                                    backgroundColor: '#ffffff'
                                }}
                                inputStyle={{
                                    fontSize: 14,
                                }}
                            // onChangeText={text => this.SearchFilterFunction(text)}
                            // onClear={text => this.SearchFilterFunction('')}
                            />
                        </View>

                        <Image source={require('../../assets/images/search-home.jpg')} style={styles.imageTop} />

                    </View>

                    <View style={styles.bottomContainer}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ fontSize: 12, color: 'gray', marginVertical: 10 }}> Saved Searches</Text>
                            <Switch
                                style={{ position: 'absolute', right: 5 }}
                                onChange={this.handleChange}
                                checked={this.state.checked}
                                height={10}
                                width={48}

                            />
                            {/* <Switch style={{ position: 'absolute', right: 5 }}></Switch> */}
                            {/* <Switch></Switch> */}
                        </View>

                        <View style={styles.textContainer}>

                            <Text style={{ fontSize: 18, fontWeight: 400 }}>Never miss a property again</Text>

                            <View style={{ marginVertical: 20 }}>
                                <Text style={{ textAlign: 'center', color: 'gray', fontSize: 13 }}>
                                    Save your searches and be notified when {"\n"}new matching properties hit the market
                                </Text>
                            </View>

                            {this.renderJoinButton()}

                        </View>

                    </View>

                </ScrollView>


                {/* s;dlj;lasdasasdasdasdasdasdasdasdasdasd */}

                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {
                        Alert.alert('Modal has been closed.');
                    }}>
                    <View style={{ marginTop: 22, backgroundColor: '#f3d500' }}>

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
                            // color='gray'
                            />


                        </TouchableOpacity>
                    </View>


                    {/* login modal view */}

                    <View style={styles.modalContainer}>
                        <Image source={require('../../assets/images/rtcl.png')} style={styles.image} />
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

                                {/* {this.renderButton()} */}

                                {/* <Text style={styles.errorTextStyle}>
                                    {this.state.error}
                                </Text> */}
                            </View>
                        </View>

                        <View style={{ width: "70%" }}>
                            {this.renderView()}
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

                    {/* login modal view */}


                </Modal>

                {/* s;dlj;lasdasasdasdasdasdasdasdasdasdasd */}



                <TouchableOpacity style={styles.footer}>

                    <Image source={require('../../assets/icons/marker.png')} style={styles.homeIcon} />

                    <View style={{ flexDirection: 'column', marginVertical: 5 }}>
                        <Text style={{ fontSize: 13, fontWeight: 400 }}>Track your home</Text>
                        <Text style={{ fontSize: 12, color: "gray" }}>Track its value against local sales</Text>
                    </View>

                    <View style={{ position: 'absolute', right: 5 }}>
                        <Icon
                            name="chevron-right"
                            // type="FontAwesome"
                            size={25}
                            color='gray'
                        />
                    </View>

                </TouchableOpacity>



            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E0E0E0',
        // backgroundColor: 'blue',
        // paddingTop: 10
    },
    imageTop: {
        // flex: 1,
        width: '100%',
        height: 300,
        marginTop: 5,
        borderRadius: 5,
    },
    bottomContainer: {
        backgroundColor: "#ffffff",
        padding: 6
    },
    textContainer: {
        // backgroundColor: 'gray',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15
    },
    homeIcon: {
        height: 25,
        width: 25,
        margin: 10
    },
    joinButton: {
        // backgroundColor: '#C62828',
        backgroundColor: '#f3d500',
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
        backgroundColor: '#f3d500',
        flex: 1,
        alignItems: 'center',
        paddingTop: 100
        // justifyContent: 'center'
    },
    image: {
        width: 200,
        height: 100,
        resizeMode: 'contain',
        // marginBottom: -5,

    },
    textinput: {
        height: 40,
        width: '90%',
        // flex:1,
        // marginVertical: 5,
        paddingHorizontal: 5,
        // color: 'white'
        // backgroundColor: 'green'
    },
    loginButton: {
        // backgroundColor: '#C62828',
        backgroundColor: '#49141E',
        width: '100%',
        height: 30,
        borderRadius: 4,
        justifyContent: 'center',
        marginTop: 15,
        // flex: 1
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
        fontSize: 13,
        alignSelf: 'center',
        justifyContent: 'flex-end',
        color: 'red',
        // textAlign: 'bottom'
    }

});