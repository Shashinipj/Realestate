import React, { Component } from 'react';
import { View, StyleSheet, TextInput, TextInputProps, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { Icon } from 'react-native-elements';

export default class Login extends Component {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);

        this.state = {
            loginButton: 'Sign in'
        };

        this.forgotPassword_Alert = this.forgotPassword_Alert.bind(this);
    }

    onPress_Register() {
        this.setState({
            loginButton: 'Create Account'
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

    render() {
        return (
            <View style={styles.modalContainer}>
                <Image source={require('../../assets/images/realestatelogo.jpg')} style={styles.image} />
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
                            style={styles.textinput}
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
                            style={styles.textinput}
                            editable={true}
                            maxLength={40}
                            placeholder='Password'
                            secureTextEntry={true} />
                    </View>
                </View>

                <TouchableOpacity style={styles.loginButton}>
                    <Text style={{ textAlign: 'center', color: '#ffffff' }}>{this.state.loginButton}</Text>

                </TouchableOpacity>

                <TouchableOpacity style={{ margin: 20 }} onPress={this.forgotPassword_Alert}>
                    <Text style={{ color: '#C62828', fontSize: 12 }}>Forgot your password?</Text>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ color: 'gray', fontSize: 12 }}>Don't have an account? {' '}</Text>
                    <TouchableOpacity onPress={this.onPress_Register.bind(this)}>
                        <Text style={{ color: '#C62828', fontSize: 12, fontWeight: 500 }}>Register</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footerView}>
                    <TouchableOpacity>
                        <Text style={{ fontSize: 12, color:'#616161' }}> Personal information collection statement</Text>
                    </TouchableOpacity>
                </View>

            </View>
        );
    }
}

const styles = StyleSheet.create({
    modalContainer: {
        // backgroundColor: 'green',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    image: {
        width: 600,
        height: 100,
        resizeMode: 'contain',
        // marginBottom: -5,

    },
    textinput: {
        height: 40,
        // borderBottomColor: 'gray',
        // borderWidth: 1,
        // borderRadius: 4,
        width: '90%',
        // flex:1,
        // marginVertical: 5,
        paddingHorizontal: 5,
        // color: 'white'
        // backgroundColor: 'green'
    },
    loginButton: {
        backgroundColor: '#C62828',
        width: '70%',
        height: 30,
        borderRadius: 4,
        justifyContent: 'center',
        marginTop: 15
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
        borderColor: '#E0E0E0'
    }
});