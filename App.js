/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, Button } from 'react-native';
// import AppNavigator from "./app/route/route"
import AppContainer from './app/route/route'

// import firebase from 'firebase'
import firebase from 'react-native-firebase';



export default class App extends Component {

  state = { loggedIn: null };


  componentDidMount() {
    let config = {
      apiKey: "AIzaSyAZoqObbC8SQeJ1uPjxLPfgk_AvF-E_MFc",
      authDomain: "realestate-be70e.firebaseapp.com",
      databaseURL: "https://realestate-be70e.firebaseio.com",
      projectId: "realestate-be70e",
      storageBucket: "",
      messagingSenderId: "1093883421506",
    };
    firebase.initializeApp(config);
    // firebase.auth().onAuthStateChanged((user) => {
    //   if (user) {
    //     this.setState({ loggedIn: true })
    //   } else {
    //     this.setState({ loggedIn: false })
    //   }
    // })
  }


  render() {
    return (

      <AppContainer />
  
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
