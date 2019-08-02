import React, { Component } from 'react';
import { View, StyleSheet, Text, TextInputProps, FlatList, TouchableOpacity, Image, ImageBackground, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { NavigationProp } from 'react-navigation';
import Ionicon from 'react-native-vector-icons/Ionicons';
import Meticon from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Accounting from 'accounting-js';
import { db } from '../../Database/db';
import Dialog from "react-native-dialog";
import firebase from 'react-native-firebase';
import ModalSelector from 'react-native-modal-selector';
import ImageSlider from 'react-native-image-slider';
import ListItem from '../../component/listItemComponent'

let PropRef = db.ref('/PropertyType');

type Props = {
    navigation: NavigationProp;
}

export default class SearchResultView extends Component<Props> {

    static navigationOptions({ navigation }) {
        return {
            headerRight: <TouchableOpacity onPress={() => {
                navigation.navigate('Search');
            }}>
                <AntDesign
                    name="home"
                    size={24}
                    style={{ marginRight: 10 }}
                />
            </TouchableOpacity>
        };

    };

    constructor(props) {
        super(props);
        this.state = {
            propertyID: '',
            propProperties: [],
            createNewCollectionDialogVisible: false,
            modalVisible: false,
            collectionName: '',
            collectionList: [],
            loggedUser: '',
            loading: true
        };

        this.onValueCollection = this.onValueCollection.bind(this);
    }


    renderModal() {
        console.log('render modal')
        this.setState({
            modalVisible: !this.state.modalVisible
        });
    }

    showCreateNewCollectionDialog() {
        console.log("show dialog")
        this.setState({
            createNewCollectionDialogVisible: true,
            collectionName: ''
        });
    };

    handleCreateNewCollectionCancel() {

        this.setState({
            createNewCollectionDialogVisible: false,
            propertyID: ''
        });
    };

    renderModalView() {

        const data = [];

        data.push({
            key: 0,
            label: '+ Add new...'
        })

        for (let i = 1; i < this.state.collectionList.length; i++) {
            const colName = this.state.collectionList[i];
            data.push({
                key: i,
                label: colName
            });
        }


        if (this.state.modalVisible) {
            return (
                <ModalSelector
                    data={data}
                    visible={this.state.modalVisible}
                    onChange={(option) => {

                        console.log(option.label);
                        // this.addToCollection(option.label);
                        this.renderModal();
                        this.RenderModalSelectedItem(option);

                    }}
                    closeOnChange={true}
                    onModalClose={() => {
                        // this.renderModal();
                    }}

                />
            );
        }
    }

    RenderModalSelectedItem(option) {
        if (option.key == 0) {

            if (this.state.loggedUser) {
                this.showCreateNewCollectionDialog();
                console.log(option.key);
                console.log('create new 11111');
            }
            else {
                this.pleaseLoginInAlert();
                console.log('pleaseLoginInAlert');

            }
        }
        else {
            this.addToCollection(option.label);
            console.log(option.label);
        }
    }

    componentDidMount() {
        let propData = this.props.navigation.state.params.data;
        console.log(propData);

        let propType = propData.propertyType;
        let actionType = propData.agreementType;
        let bedRooms = propData.bedRooms;
        let bathRooms = propData.bathRooms;
        let carSpace = propData.carSpace;
        let location = propData.location;
        let minPrice = propData.rangeLow;
        let maxPrice = propData.rangeHigh;
        let priceRange = maxPrice - minPrice;
        let landSize = propData.landSize;
        let featureKeywords = propData.keyWords;

        // console.log(this.props.navigation.state.params.data);

        let filteredProperties = [];

        PropRef.on('value', (snapshot) => {
            console.log("VAL ", snapshot);

            const propTypes = snapshot.val();

            for (const propTypeId in propTypes) {
                const propTypeObj = propTypes[propTypeId];

                if (propTypeObj.Property) {
                    for (const propId in propTypeObj.Property) {
                        const propObj = propTypeObj.Property[propId];

                        if (location == '' || propObj.Address == location) {

                            if (actionType == null || propObj.PropAction == actionType) {
                                console.log("test");

                                if (propType == null || propType[propObj.PropTypeId]) {

                                    if (bedRooms == -1 || propObj.Bedrooms >= bedRooms) {

                                        if (bathRooms == -1 || propObj.Bathrooms >= bathRooms) {

                                            if (carSpace == -1 || propObj.CarPark >= bathRooms) {

                                                if (landSize == 0 || propObj.LandSize >= landSize) {

                                                    if (priceRange == 0 || ((maxPrice >= propObj.Price) && (propObj.Price >= minPrice))) {

                                                        let hasKeyword = false;
                                                        if (featureKeywords != "") {
                                                            const arrFeatureKeywords = featureKeywords.split(",");

                                                            // loopKeyword:
                                                            for (let i = 0; i < arrFeatureKeywords.length; i++) {
                                                                const keyWord = arrFeatureKeywords[i];

                                                                let keywordFound = false;
                                                                if (propObj.Features) {
                                                                    for (let j = 0; j < propObj.Features.length; j++) {
                                                                        const featureName = propObj.Features[j];

                                                                        const reg = new RegExp(featureName, "gi");
                                                                        if (reg.test(keyWord)) {
                                                                            keywordFound = true;
                                                                            break;
                                                                            // break loopKeyword;
                                                                        }
                                                                    }
                                                                }

                                                                if (keywordFound) {
                                                                    hasKeyword = true;
                                                                } else {
                                                                    hasKeyword = false;
                                                                    break;
                                                                }
                                                            }
                                                        }

                                                        if (featureKeywords == "" || hasKeyword) {

                                                            filteredProperties.push(propObj);
                                                            console.log(filteredProperties);
                                                            console.log(maxPrice >= (propObj.Price >= minPrice))
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            const sortType = propData.sortOrder;

            if (sortType == 1) {

                filteredProperties.sort((a, b) => {

                    if (a.Price < b.Price) {
                        return 1;
                    } else if (a.Price > b.Price) {
                        return -1;
                    }

                    return 0;
                });
            }

            else if (sortType == 2) {

                filteredProperties.sort((a, b) => {

                    if (a.Price < b.Price) {
                        return -1;
                    } else if (a.Price > b.Price) {
                        return 1;
                    }

                    return 0;
                });
            }

            this.setState({
                propProperties: filteredProperties,
                loading: false
            });
        });

        const user = firebase.auth().currentUser;
        if (user) {
            this.getCollectionNames(user);
            this.setState({
                loggedUser: user
            })
        }

    }

    componentWillUnmount() {
        const user = firebase.auth().currentUser;

        if (user) {
            db.ref('Collections/').child(user.uid).off('value', this.onValueCollection);
        }
    }

    getCollectionNames(user) {
        db.ref('Collections/').child(user.uid).on('value', this.onValueCollection);
    }

    /**
     * @param {firebase.database.DataSnapshot} snapshot
     */
    onValueCollection(snapshot) {
        const collections = snapshot.val();
        console.log(collections);

        const arrColl = [];
        for (const collectionId in collections) {
            console.log(collectionId);
            arrColl.push(collectionId);
            // console.log(this.state.collectionList);
        }

        this.setState({
            collectionList: arrColl
        });
    }

    createCollection() {
        console.log(this.state.collectionName);
        const user = firebase.auth().currentUser;

        db.ref('Collections/').child(user.uid).child(this.state.collectionName).child(this.state.propertyID).set(true)
            .then(() => {
                console.log('Inserted!');
                this.handleCreateNewCollectionCancel();
            }).catch((error) => {
                console.log(error)
            });
    }

    addToCollection(collectionName) {
        const user = firebase.auth().currentUser;

        db.ref('Collections/').child(user.uid).child(collectionName).child(this.state.propertyID).set(true)
            .then(() => {
                console.log('Inserted!');
                this.handleCreateNewCollectionCancel();
            }).catch((error) => {
                console.log(error)
            });
    }

    renderCreateNewCollectionDialog() {

        return (

            <Dialog.Container visible={this.state.createNewCollectionDialogVisible}>
                {/* <Dialog.Container visible={this.state.createNewCollectionDialogVisible}></Dialog.Container> */}
                <Dialog.Title>Create a Collection</Dialog.Title>
                <Dialog.Description>
                    Please enter a name for the collection
          </Dialog.Description>
                <Dialog.Input
                    value={this.state.collectionName}
                    onChangeText={collectionName => this.setState({ collectionName })}
                ></Dialog.Input>
                <Dialog.Button label="Create" onPress={this.createCollection.bind(this)} />
                <Dialog.Button label="Cancel" onPress={() => { this.handleCreateNewCollectionCancel() }} />
            </Dialog.Container>
        );
    }

    pleaseLoginInAlert() {

        Alert.alert(
            'Please Login',
            'Do you want to login?',
            [
                {
                    text: 'Home', onPress: () => {
                        this.props.navigation.navigate('Search');
                    }
                },
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
            ],
            { cancelable: true },
        );
    }


    renderItem({ item, index }) {

        return (

            <ListItem
                data1={item}
                favouriteMarked={false}
                showFavouriteIcon={true}
                onPressItem={(item) => {
                    this.props.navigation.navigate("ExpandedView", { PropertyData: item });
                }}
                onPressFavourite={(item, isMarked) => {
                    if (this.state.loggedUser) {
                        this.state.propertyID = item.PropId;
    
                        this.renderModal();
                    }
                    else {
                        this.pleaseLoginInAlert();
                    }
                }}
            />
        );
    }


    renderResultView() {
        if (this.state.loading) {
            return (
                <View style={styles.loader}>
                    <ActivityIndicator
                        size='large'
                        color="#757575"
                    />
                </View>
            );
        }
        else
            return (
                (this.state.propProperties.length == 0) ?
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 17 }}>No data to show!</Text>
                        <TouchableOpacity onPress={() => {
                            this.props.navigation.navigate('Search');
                        }}>
                            <View style={{ height: 30, alignItems: 'center', borderRadius: 10, backgroundColor: '#f3d500', justifyContent: 'center', paddingHorizontal: 10, marginTop: 20 }}>
                                <Text>
                                    Back to home
                            </Text>

                            </View>
                        </TouchableOpacity>
                    </View>
                    :

                    <FlatList
                        data={this.state.propProperties}
                        renderItem={item => this.renderItem(item)}
                        keyExtractor={(item, index) => {
                            return "" + index;
                        }}
                    />
            );

    }


    render() {
        return (
            <View style={styles.container}>

                {this.renderResultView()}
                {this.renderCreateNewCollectionDialog()}
                {this.renderModalView()}

            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 0,
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff"
    },

});