import React, { Component } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { NavigationProp, NavigationEvents } from 'react-navigation';
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
        else {
            this.setState({
                userEmail: '',
                loggedIn: false
            });
        }
    }

    renderProfileView() {
        if (!this.state.loggedIn) {
            return (
                <View style={styles.buttonContainer}>
                    <Text style={{ textAlign: 'center', fontWeight: '400', fontSize: 15 }}>
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
            return (
                <View style={styles.buttonContainer}>

                    <TouchableOpacity onPress={() => {
                        this.onPressSignOutButton();
                    }}>
                        <View style={styles.buttons}>
                            <Text style={styles.buttonText}>
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
                                this.loginReset();
                                this.props.navigation.navigate('Search');
                            });
                    }
                },
            ],
            { cancelable: false },
        );
    }

    loginReset() {
        this.setState({
            userEmail: '',
            loggedIn: false
        })
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
        backgroundColor: '#f3d500'
    },
    buttons: {
        backgroundColor: '#49141E',
        borderRadius: 4,
        paddingVertical: 7,
        margin: 10,
        paddingHorizontal: 15,
        width: '25%',
        alignSelf: 'center'
    },
    buttonContainer: {
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        color: 'white',
        fontWeight: '500',
        textAlign: 'center'
    }
})