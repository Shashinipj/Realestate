import React, { Component } from 'react';
import { View, StyleSheet, Text, TextInputProps, TouchableOpacity, Image } from 'react-native';
import Accounting from 'accounting-js';

type Props = {
    propertyData: any;

    onPressItem: (item: any) => void;

};

export default class FeaturedListItem extends Component<Props> {

    static navigationOptions = {
        header: null,
    };

    static defaultProps = {

        onPressItem: () => null,
    };


    constructor() {
        super();

        this.onPress_Item = this.onPress_Item.bind(this);
    }


    onPress_Item() {
        const { propertyData } = this.props;

        if (this.props.onPressItem) {
            this.props.onPressItem(propertyData);
        }
    }
    render() {

        const { propertyData } = this.props;

        return (
            // <View>

            // </View>

            <View style={{ flex: 1 }}>

                <TouchableOpacity onPress={this.onPress_Item}>

                    <View style={{ borderRadius: 4, margin: 5, width: 100, height: 120 }}>
                        <Image source={require('../assets/images/house.jpg')} style={{ height: 70, width: 100, borderRadius: 4, marginBottom: 5 }} />
                        {
                            (propertyData.Title) ? <Text style={{ fontSize: 11, fontWeight: '600' }}>{propertyData.Title}</Text> :
                                <Text style={{ fontSize: 11, fontWeight: '600' }}>Property Title </Text>
                        }
                        <Text style={{ fontSize: 10, fontWeight: '600', color: '#424242' }}>{Accounting.formatMoney(propertyData.Price)} </Text>
                        <Text style={{ fontSize: 10, color: 'gray', marginTop: 2 }}>{propertyData.Address} | {propertyData.PropType}</Text>

                    </View>
                </TouchableOpacity>

            </View>
        );
    }
}