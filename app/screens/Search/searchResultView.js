import React, { Component } from 'react';
import { View, StyleSheet, Text, TextInputProps, FlatList, TouchableOpacity } from 'react-native';
import { NavigationProp } from 'react-navigation';
// import firebase from 'react-native-firebase';
import firebase from 'firebase';

import { db } from '../../Database/db'

let PropRef = db.ref('/PropertyType');

type Props = {
    navigation: NavigationProp;
}

export default class SearchResultView extends Component<Props> {

    static navigationOptions = {
        // header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            propId: '',
            propProperties: []
        };
    }

    componentDidMount() {
        let propData = this.props.navigation.state.params.data;
        console.log(propData);

        let propType = propData.propertyType;
        let actionType = propData.agreementType;

        console.log(this.props.navigation.state.params.data);

        let filteredProperties = [];

        // firebase.storage().refFromURL()

        PropRef.on('value', (snapshot) => {
            console.log("VAL ", snapshot);

            const propTypes = snapshot.val();

            for (const propTypeId in propTypes) {
                const propTypeObj = propTypes[propTypeId];

                if (propTypeObj.Property) {
                    for (const propId in propTypeObj.Property) {
                        const propObj = propTypeObj.Property[propId];

                        if (actionType == null || propObj.PropAction == actionType) {
                            console.log("test");

                            if (propType == null || propType[propObj.PropTypeId]) {
                                filteredProperties.push(propObj);
                                console.log(filteredProperties);

                                this.setState({
                                    propProperties: filteredProperties
                                });
                            }
                        }
                    }
                }
            }
        });

        console.log(this.state.filteredProperties)
    }

    renderItem = (data) =>
        <TouchableOpacity style={styles.list_item} onPress={() => {

        }}>
            <View style={{ backgroundColor: 'white', borderBottomWidth: 1, paddingBottom: 10 }}>
                <Text>Property ID: {data.item.PropId}</Text>
                <Text>Property Type: {data.item.PropType}</Text>
                <Text>Owner: {data.item.Owner}</Text>
                <Text>Bedrooms: {data.item.Bedrooms}</Text>
                <Text>Bathrooms: {data.item.Bathrooms}</Text>
                <Text>Location: {data.item.Address}</Text>
                <Text>Price: {data.item.Price}</Text>
            </View>

        </TouchableOpacity>

    render() {
        return (
            <View style={{ flex: 1, padding: 10 }}>
                <Text>
                    {/* {this.state.propId} */}
                </Text>

                <FlatList
                    data={this.state.propProperties}
                    // numColumns={2}
                    // ItemSeparatorComponent={this.FlatListItemSeparator}
                    renderItem={item => this.renderItem(item)}
                    keyExtractor={item => "" + item.propId}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    list_item: {
        // flexDirection: "row",
        borderRadius: 5,
        padding: 5,
    },
});