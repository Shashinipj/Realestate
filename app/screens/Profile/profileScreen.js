import React, { Component } from 'react';
import { View, StyleSheet, Text, TextInputProps } from 'react-native';

export default class ProfileScreen extends Component {

    static navigationOptions = {
        header: null,
    };

    render() {
        return (
            <View style={{ backgroundColor: 'yellow', flex: 1  }}>
                <Text>
                    MeScreen
                </Text>
            </View>
        );
    }
}