import React, { Component } from 'react';
import { View, StyleSheet, Text, TextInputProps, FlatList, TouchableOpacity, Image, ImageBackground, Alert } from 'react-native';
import Ionicon from 'react-native-vector-icons/Ionicons';
import Meticon from 'react-native-vector-icons/MaterialCommunityIcons';
import { db } from '../../Database/db';
import Accounting from 'accounting-js';
import ImageSlider from 'react-native-image-slider';
import ListItem from '../../component/listItemComponent'

let PropRef = db.ref('/PropertyType');

export default class CollectionDetailScreen extends Component {

    static navigationOptions({ navigation }) {

        const collection = navigation.getParam('CollectionData');

        return {
            title: collection.name
        };

    };

    constructor(props) {
        super(props);

        this.state = {
            propProperties: []
        };
    }

    componentDidMount() {
        const { navigation } = this.props;
        const collection = navigation.getParam('CollectionData');

        let propID = collection.propIds;

        let filteredProperties = [];

        for (const collectPropId in propID) {
            console.log(collectPropId);

            PropRef.on('value', (snapshot) => {
                console.log("VAL ", snapshot);

                const propTypes = snapshot.val();

                for (const propTypeId in propTypes) {
                    const propTypeObj = propTypes[propTypeId];

                    if (propTypeObj.Property) {
                        for (const propId in propTypeObj.Property) {
                            const propObj = propTypeObj.Property[propId];

                            if (propObj.PropId == collectPropId) {
                                filteredProperties.push(propObj);
                                // console.log(filteredProperties);
                            }
                        }
                    }
                }

                this.setState({
                    propProperties: filteredProperties
                });

            });
        }
    }


    renderItem({ item, index }) {

        return (

            <ListItem
                data1={item}
                favouriteMarked={false}
                showFavouriteIcon={false}
                onPressItem={(item) => {
                    this.props.navigation.navigate("ExpandedView", { PropertyData: item });
                }}
            />
        );
    }


    render() {
        return (
            <View style={{ flex: 1 }}>
                <FlatList
                    data={this.state.propProperties}
                    renderItem={item => this.renderItem(item)}
                    keyExtractor={(item, index) => {
                        return "" + index;
                    }}
                />
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        // padding: 10,
        paddingTop: 0,
        // backgroundColor: '#E0E0E0'
    },

});