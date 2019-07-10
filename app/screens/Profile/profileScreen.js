import React, { Component } from 'react';
import { View, StyleSheet, Text, TextInputProps, TouchableOpacity } from 'react-native';
import { NavigationProp, NavigationEvents, Alert } from 'react-navigation';
import firebase from 'react-native-firebase';

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
            loggedIn: false
        };

    }

    componentDidMount() {

        firebase.auth().onAuthStateChanged(user => {
            this.fetchUser(user);
            console.log("USER: " + user);
        });
    }

    fetchUser(user) {
        if (user) {
            this.setState({
                userEmail: user.email,
                loggedIn: true
            });
        }

    }

    renderProfileView() {
        if (this.state.loggedIn) {
            return (
                <View style={{ flex: 1, alignContent: 'center', justifyContent: 'center' }}>
                    <Text style={{ backgroundColor: 'red', textAlign: 'center' }}>
                        Please Login to see user details
                </Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        {/* {this.checkUserLogin()} */}
                        <TouchableOpacity onPress={() => {
                            // this.setFilterModalVisible();
                            this.props.navigation.navigate('Search');
                        }}>
                            <View style={{ backgroundColor: 'blue', borderRadius: 4, padding: 5, margin: 10 }}>
                                <Text>
                                    Home
                        </Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <View style={{ backgroundColor: 'blue', borderRadius: 4, padding: 5, margin: 10 }}>
                                <Text>
                                    Login
                        </Text>
                            </View>
                        </TouchableOpacity>

                    </View>

                </View>
            );
        }

        else if (!this.state.loggedIn) {
            return (
                <View style={{ flex: 1, alignContent: 'center', justifyContent: 'center' }}>
                    <Text style={{ backgroundColor: 'blue', textAlign: 'center' }}>
                        user
                </Text>
                    <TouchableOpacity onPress={() => {
                        this.onPressSignOutButton();
                    }}>
                        <View style={{ backgroundColor: 'blue', borderRadius: 4, padding: 5, margin: 10 }}>
                            <Text>
                                SignOut
                        </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            );
        }

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
                            });
                    }
                },
            ],
            { cancelable: false },
        );
    }

    render() {
        return (
            <View style={{ backgroundColor: 'green', flex: 1 }}>
                {this.renderProfileView()}

            </View>
        );
    }
}