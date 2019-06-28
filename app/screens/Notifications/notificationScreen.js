import React, { Component } from 'react';
import { View, StyleSheet, Text, TextInputProps } from 'react-native';

export default class NotificationScreen extends Component {

    static navigationOptions = {
        header: null,
    };

    render() {
        return (
            <View style={{ backgroundColor: 'blue', flex: 1  }}>
                <Text>
                    NotificationScreen
                </Text>
            </View>
        );
    }
}