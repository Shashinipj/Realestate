import React, { Component } from 'react';
import {
    View, StyleSheet, Text, TextInputProps, FlatList,
    TouchableOpacity, Image, ImageBackground, Alert
} from 'react-native';
import Ionicon from 'react-native-vector-icons/Ionicons';
import Meticon from 'react-native-vector-icons/MaterialCommunityIcons';
import { db } from '../../Database/db';
import Accounting from 'accounting-js';
import ImageSlider from 'react-native-image-slider';
import ListItem from '../../component/listItemComponent';
import firebase from 'react-native-firebase';
import { SearchBar } from 'react-native-elements';

let PropRef = db.ref('/PropertyType');

export default class CollectionDetailScreen extends Component {

    static navigationOptions({ navigation }) {

        const collection = navigation.getParam('CollectionData');

        return {
            title: collection.name
        };
    };

    arrayholder = [];

    userProperties = {};

    constructor(props) {
        super(props);

        this.state = {
            propProperties: [],
            collectionName: '',
            search: '',
            loginStatus: false
        };

        this.onValueCollection = this.onValueCollection.bind(this);
    }

    componentDidMount() {

        firebase.auth().onAuthStateChanged(user => {
            this.fetchUser(user);
            // console.log("CollectionUSER: " + user);
        });
    }

    componentWillUnmount() {
        const user = firebase.auth().currentUser;

        if (user) {
            db.ref('/PropertyType').off('value', this.onValueCollection);
        }
    }

    fetchUser(user) {

        const { navigation } = this.props;
        const collection = navigation.getParam('CollectionData');

        let propIDs = collection.propIds;
        if (user) {
            this.loadProps(propIDs);
            this.setState({
                loginStatus: true
            });
        }
        else {

        }
    }

    /**
      * @param {firebase.database.DataSnapshot} snapshot
      */
    onValueCollection(snapshot) {

        const { navigation } = this.props;
        const collection = navigation.getParam('CollectionData');

        let propIDs = collection.propIds;

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
        this.arrayholder = filteredProperties;
    }

    loadProps(propIDs) {
        // db.ref('/PropertyType').once('value', (snapshot) => {
        //     this.userProperties = snapshot.val();

        //     let filteredProperties = [];
        //     for (const collectPropId in propIDs) {
        //         console.log('collectPropId', collectPropId);

        //         console.log("VAL ", snapshot);


        //         for (const propTypeId in this.userProperties) {
        //             const propTypeObj = this.userProperties[propTypeId];
        //             console.log("propTypeObj", propTypeObj);

        //             if (propTypeObj.Property) {
        //                 for (const propId in propTypeObj.Property) {
        //                     const propObj = propTypeObj.Property[propId];

        //                     if (propObj.PropId == collectPropId) {
        //                         filteredProperties.push(propObj);
        //                         console.log("filteredProperties", filteredProperties);
        //                     }
        //                 }
        //             }
        //         }


        //     }
        //     this.setState({
        //         propProperties: filteredProperties
        //     });
        //     this.arrayholder = filteredProperties;
        // });

        db.ref('/PropertyType').once('value', this.onValueCollection);
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

    updateSearch(search) {
        this.setState({ search });
    };

    SearchFilterFunction(text) {
        //passing the inserted text in textinput
        const newData = this.arrayholder.filter(function (item) {
            //applying filter for the inserted text in search bar
            const itemData = item.Address ? item.Address.toUpperCase() : ''.toUpperCase();
            const textData = text.toUpperCase();
            return itemData.indexOf(textData) > -1;
        });
        this.setState({
            //setting the filtered newData on datasource
            //After setting the data it will automatically re-render the view
            propProperties: newData,
            search: text,
        });
    }

    onPressDeleteButton(propertyID) {

        Alert.alert(
            'Remove',
            'Do you want to remove this property in saved collection?',
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

        const { search } = this.state;
        return (

            <View style={{ flex: 1 }}>

                <SearchBar
                    round
                    placeholder="Type Here..."
                    onChangeText={this.updateSearch}
                    value={search}
                    lightTheme='true'
                    containerStyle={{
                        height: 50,
                        backgroundColor: '#bdbdbd',
                        // borderTopWidth: 0,
                    }}
                    inputContainerStyle={{
                        height: 30,
                        backgroundColor: '#e0e0e0'
                    }}
                    inputStyle={{
                        fontSize: 14,
                    }}
                    onChangeText={text => this.SearchFilterFunction(text)}
                    onClear={text => this.SearchFilterFunction('')}
                />
                {(!this.state.loginStatus) ?
                    // this.props.navigation.navigate("Collections")
                    <View style={{ backgroundColor: 'red' }}>
                    </View>
                    :
                    <FlatList
                        data={this.state.propProperties}
                        renderItem={item => this.renderItem(item)}
                        keyExtractor={(item, index) => {
                            return "" + index;
                        }}
                    />
                }

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