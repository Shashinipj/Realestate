import React, { Component } from 'react';
import { View, StyleSheet, Text, TextInputProps, FlatList, TouchableOpacity, Image, ImageBackground, Alert } from 'react-native';
import Ionicon from 'react-native-vector-icons/Ionicons';
import Meticon from 'react-native-vector-icons/MaterialCommunityIcons';
import { db } from '../../Database/db';
import Accounting from 'accounting-js';
import ImageSlider from 'react-native-image-slider';
import ListItem from '../../component/listItemComponent';
import firebase from 'react-native-firebase';

let PropRef = db.ref('/PropertyType');

export default class CollectionDetailScreen extends Component {

    static navigationOptions({ navigation }) {

        const collection = navigation.getParam('CollectionData');


        return {
            title: collection.name
        };

    };

    userProperties = {};

    constructor(props) {
        super(props);

        this.state = {
            propProperties: [],
            collectionName: ''
        };
    }

    componentDidMount() {
        const { navigation } = this.props;
        const collection = navigation.getParam('CollectionData');

        let propIDs = collection.propIds;

        this.loadProps(propIDs);
    }

    loadProps(propIDs) {
        db.ref('/PropertyType').once('value', (snapshot) => {
            this.userProperties = snapshot.val();

            let filteredProperties = [];
            for (const collectPropId in propIDs) {
                console.log('collectPropId', collectPropId);

                console.log("VAL ", snapshot);


                for (const propTypeId in this.userProperties) {
                    const propTypeObj = this.userProperties[propTypeId];
                    console.log("propTypeObj", propTypeObj);

                    if (propTypeObj.Property) {
                        for (const propId in propTypeObj.Property) {
                            const propObj = propTypeObj.Property[propId];

                            if (propObj.PropId == collectPropId) {
                                filteredProperties.push(propObj);
                                console.log("filteredProperties", filteredProperties);
                            }
                        }
                    }
                }


            }
            this.setState({
                propProperties: filteredProperties
            });
        });
    }

    deleteCollectionItem(propertyID) {

        const { navigation } = this.props;
        const collection = navigation.getParam('CollectionData');
        let propIDs = collection.propIds;

        const user = firebase.auth().currentUser;

        db.ref(`Users/${user.uid}/Collections/${collection.name}/${propertyID}`).remove()
            .then(() => {
                if (this.userProperties[propertyID] != undefined) {
                    delete this.userProperties[propertyID];
                }

                if (propIDs[propertyID] != undefined) {
                    delete propIDs[propertyID];
                }

                this.loadProps(propIDs);

                // console.log(collection.name);
                console.log('Deleted!!');
            }).catch((error) => {
                console.log(error)
            });
    }

    onPressDeleteButton(propertyID) {

        Alert.alert(
            'Delete',
            'Do you really want to delete this property?',
            [
                {
                    text: 'No',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {
                    text: 'Yes',
                    onPress: () => {
                        this.deleteCollectionItem(propertyID);
                    }
                },
            ],
            { cancelable: false },
        );
    }


    renderItem({ item, index }) {

        return (

            <ListItem
                data1={item}
                favouriteMarked={false}
                showFavouriteIcon={false}
                showDeleteIcon={true}

                onPressItem={(item) => {
                    this.props.navigation.navigate("ExpandedView", { PropertyData: item });
                }}

                onPressDelete={(item, isMarked) => {
                    // this.state.propertyID = item.propId;
                    console.log(item.PropId);
                    this.onPressDeleteButton(item.PropId);

                }}
            />
        );
    }


    render() {
        return (

            <View style={{ flex: 1 }}>
                {/* {(this.state.propProperties.length == -1) ?
                    this.props.navigation.navigate("Collections")
                    : */}
                <FlatList
                    data={this.state.propProperties}
                    renderItem={item => this.renderItem(item)}
                    keyExtractor={(item, index) => {
                        return "" + index;
                    }}
                />
                {/* } */}

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