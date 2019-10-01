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
import ListItem from '../../component/listItemComponent';
import RNFetchBlob from 'react-native-fetch-blob';
import Modal from 'react-native-modal';
import { Icon } from 'react-native-elements';
import RNPickerSelect from 'react-native-picker-select';

let PropRef = db.ref('/PropertyType');

type Props = {
    navigation: NavigationProp;
}

const sortList = [
    {
      label: 'Sort',
      value: -1,
    },
    {
      label: 'Price (High-Low)',
      value: 1,
    },
    {
      label: 'Price (Low-High)',
      value: 2,
    },
    {
      label: 'Date (Newest-Oldest)',
      value: 3,
    },
    {
      label: 'Date (Oldest-Newest)',
      value: 4,
    },
  ];

export default class SearchResultView extends Component<Props> {

    static navigationOptions({ navigation }) {
        return {
            headerLeft: <TouchableOpacity onPress={() => {
                navigation.navigate('Search');
            }}>
                <AntDesign
                    name="home"
                    size={24}
                    style={{ marginHorizontal: 20 }}
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
            // collectionListProperties:[],

            loggedUser: '',
            loading: true,

            // isFavourite: false,
            favPropIds: [],
            sortModalVisible: false,
            sortOrder: -1,
            displayPickerView: false
        };

        this.onValueCollection = this.onValueCollection.bind(this);
    }

    async componentDidMount() {

        const user = firebase.auth().currentUser;
        if (user) {
            await this.getCollectionNames(user);
            // await this.getFavouritePropertyId(user);
            this.setState({
                loggedUser: user
            });
        }
        else {
            this.getSearchResults();
        }
    }

    componentWillUnmount() {
        const user = firebase.auth().currentUser;

        if (user) {
            db.ref(`Users/${user.uid}/Collections`).off('value', this.onValueCollection);
        }
    }

    renderModal() {
        // console.log('render modal')
        this.setState({
            modalVisible: !this.state.modalVisible
        });
    }

    // renderSortModal(visible) {
    //     this.setState({
    //         sortModalVisible: visible
    //     });
    // }

    showCreateNewCollectionDialog() {
        // console.log("show dialog")
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

    getSortType(sortType) {
        this.setState({
            sortOrder: sortType
        });
        this.sortSearchResults(sortType);
    }

    sortSearchResults(sortType) {

        const searchResults = this.state.propProperties;

        if (sortType == 1) {

            searchResults.sort((a, b) => {

                const priceA = parseFloat(a.Price);
                const priceB = parseFloat(b.Price);

                console.log('a.Price', a.Price)
                console.log('b.Price', b.Price)

                if (priceA < priceB) {
                    return 1;
                } else if (priceA > priceB) {
                    return -1;
                }

                return 0;
            });
        }

        else if (sortType == 2) {

            searchResults.sort((a, b) => {

                const priceA = parseFloat(a.Price);
                const priceB = parseFloat(b.Price);

                if (priceA < priceB) {
                    return -1;
                } else if (priceA > priceB) {
                    return 1;
                }

                return 0;
            });

        }

        else if (sortType == 3) {

            searchResults.sort((a, b) => {

                console.log("a.AddedDate", a.AddedDate);
                console.log("b.AddedDate", b.AddedDate);

                if (a.AddedDate < b.AddedDate) {
                    return 1;
                } else if (a.AddedDate > b.AddedDate) {
                    return -1;
                }

                return 0;
            });

        }

        else if (sortType == 4) {

            searchResults.sort((a, b) => {

                // console.log("a.AddedDate", a.AddedDate);
                // console.log("b.AddedDate", b.AddedDate);

                if (a.AddedDate < b.AddedDate) {
                    return -1;
                } else if (a.AddedDate > b.AddedDate) {
                    return 1;
                }
                return 0;
            });
        }

        this.setState({
            propProperties: searchResults,
            // loading: false
        });
    }

    setTextForSortFilter() {
        const no = this.state.sortOrder;

        if (no == -1) {
            return (
                <Text style={{ fontSize: 12 }}>Sort</Text>
            )
        }
        else if (no == 1) {
            return (
                <Text style={{ fontSize: 12 }}>Price (High - Low)</Text>
            )
        }
        else if (no == 2) {
            return (
                <Text style={{ fontSize: 12 }}>Price (Low - High)</Text>
            )
        }
        else if (no == 3) {
            return (
                <Text style={{ fontSize: 12 }}>Date (Newest - Oldest)</Text>
            )
        }
        else if (no == 4) {
            return (
                <Text style={{ fontSize: 12 }}>Date (Oldest - Newest)</Text>
            )
        }
    }

    renderModalView() {

        const data = [];

        data.push({
            key: 0,
            label: '+ Add new...'
        })

        for (let i = 0; i < this.state.collectionList.length; i++) {
            const colName = this.state.collectionList[i];
            data.push({
                key: i + 1,
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
                        this.renderModalSelectedItem(option);

                    }}
                    closeOnChange={true}
                    onModalClose={() => {
                        // this.renderModal();
                    }}
                />
            );
        }
    }

    renderModalSelectedItem(option) {
        if (option.key == 0) {

            if (this.state.loggedUser) {
                this.showCreateNewCollectionDialog();
                // console.log(option.key);
                // console.log('create new 11111');
            }
            else {
                this.pleaseLoginInAlert();
                // console.log('pleaseLoginInAlert');
            }
        }
        else {
            this.addToCollection(option.label);
            console.log(option.label);
        }
    }

    renderSortModalView() {

        return(
            <RNPickerSelect
            placeholder={'placeholder'}
            // disabled={!this.state.sortModalVisible}
            items={sortList}
            onValueChange={value => {
                this.getSortType(value);
            }}
            style={pickerSelectStyles}
            value={this.state.sortOrder}
         
          />
        );

    }


    getSearchResults() {
        let propData = this.props.navigation.state.params.data;
        // console.log(propData);

        let propType = propData.propertyType;
        let actionType = propData.agreementType;
        let bedRooms = propData.bedRooms;
        let bathRooms = propData.bathRooms;
        let carSpace = propData.carSpace;
        let location = propData.location;
        let minPrice = parseFloat(propData.rangeLow);
        let maxPrice = parseFloat(propData.rangeHigh);
        let priceRange = maxPrice - minPrice;
        let landSize = propData.landSize;
        let featureKeywords = propData.keyWords;
        let viewport = propData.viewport;

        // console.log(this.props.navigation.state.params.data);

        let filteredProperties = [];
        // console.log("pricerange1", priceRange);
        // console.log("maxPrice1", maxPrice);
        // console.log("minPrice1", minPrice);


        PropRef.once('value', (snapshot) => {
            // console.log("VAL ", snapshot);

            const propTypes = snapshot.val();

            for (const propTypeId in propTypes) {
                const propTypeObj = propTypes[propTypeId];

                if (propTypeObj.Property) {
                    for (const propId in propTypeObj.Property) {
                        const propObj = propTypeObj.Property[propId];

                        // if (location == '' || propObj.Address == location) {
                        if (viewport == null || (propObj.lat <= viewport.northeast.lat + 0.04) && (propObj.lat >= viewport.southwest.lat - 0.04)) {

                            if (viewport == null || (propObj.lon <= viewport.northeast.lng + 0.04) && (propObj.lon >= viewport.southwest.lng - 0.04)) {

                                if (actionType == null || propObj.PropAction == actionType) {
                                    // console.log("test");
                                    // console.log('propObj.lat', propObj.lat);
                                    // console.log('viewport.northeast.lat', viewport.northeast.lat);
                                    // console.log('viewport.southwest.lat', viewport.southwest.lat);
                                    // console.log('viewport.northeast.lat + 0.04', viewport.northeast.lat + 0.04);
                                    // console.log('viewport.southwest.lat - 0.04', viewport.southwest.lat - 0.04);

                                    if (propType == null || propType[propObj.PropTypeId]) {

                                        if (bedRooms == -1 || propObj.Bedrooms >= bedRooms) {

                                            if (bathRooms == -1 || propObj.Bathrooms >= bathRooms) {

                                                if (carSpace == -1 || propObj.CarPark >= carSpace) {

                                                    if (landSize == 0 || propObj.LandSize >= landSize) {

                                                        if (priceRange == 0 || (propObj.Price <= maxPrice && propObj.Price >= minPrice)) {
                                                            // console.log("pricerange", priceRange);
                                                            // console.log("maxPrice", maxPrice);
                                                            // console.log("minPrice", minPrice);

                                                            if (propObj.Visible == true) {

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

                                                                    const propObjNew = {
                                                                        ...propObj,

                                                                        isFavourite: false,
                                                                        collectionName: null
                                                                    };

                                                                    for (const i in this.state.favPropIds) {
                                                                        const favProp = this.state.favPropIds[i];
                                                                        // console.log('favProp', favProp);

                                                                        if (favProp.favPropId == propObj.PropId) {
                                                                            // console.log('matched');

                                                                            propObjNew.isFavourite = true;
                                                                            propObjNew.collectionName = favProp.collName;
                                                                            // console.log('propObjNew.collectionName', propObjNew.collectionName);
                                                                            break;
                                                                        }
                                                                    }
                                                                    // console.log('this.state.collectionList',this.state.collectionList);

                                                                    filteredProperties.push(propObjNew);
                                                                    // console.log('filteredProperties', filteredProperties);
                                                                    // console.log("propId:", propObjNew.PropId);
                                                                }
                                                            }
                                                        }
                                                    }
                                                    // }
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

            // const sortType = propData.sortOrder;
            // // const sortType = this.state.sortOrder

            // if (sortType == 1) {

            //     filteredProperties.sort((a, b) => {

            //         if (a.Price < b.Price) {
            //             return 1;
            //         } else if (a.Price > b.Price) {
            //             return -1;
            //         }
            //         return 0;
            //     });
            // }

            // else if (sortType == 2) {

            //     filteredProperties.sort((a, b) => {

            //         if (a.Price < b.Price) {
            //             return -1;
            //         } else if (a.Price > b.Price) {
            //             return 1;
            //         }
            //         return 0;
            //     });

            // }

            // else if (sortType == 3) {

            //     filteredProperties.sort((a, b) => {

            //         // console.log("a.AddedDate", a.AddedDate);
            //         // console.log("b.AddedDate", b.AddedDate);

            //         if (a.AddedDate < b.AddedDate) {
            //             return 1;
            //         } else if (a.AddedDate > b.AddedDate) {
            //             return -1;
            //         }

            //         return 0;
            //     });

            // }

            // else if (sortType == 4) {

            //     filteredProperties.sort((a, b) => {

            //         // console.log("a.AddedDate", a.AddedDate);
            //         // console.log("b.AddedDate", b.AddedDate);

            //         if (a.AddedDate < b.AddedDate) {
            //             return -1;
            //         } else if (a.AddedDate > b.AddedDate) {
            //             return 1;
            //         }
            //         return 0;
            //     });
            // }


            this.setState({
                propProperties: filteredProperties,
                loading: false
            });
        });
    }


    getCollectionNames(user) {
        return new Promise((resolve, reject) => {

            db.ref(`Users/${user.uid}/Collections`).on('value', this.onValueCollection.bind(this, resolve, reject));
        });
    }

    getFavouritePropertyId(user) {

        return new Promise((resolve, reject) => {
            // console.log('user', user.uid);

            const listFavProps = []

            db.ref(`Users/${user.uid}/Collections`).on('value', (snapshot) => {
                const collections = snapshot.val();
                // console.log('favoutiteProps', collections);
                for (const collName in collections) {
                    // console.log('favoutiteProps[i]', collections[collName]);
                    const favProps = collections[collName]

                    for (const favPropId in favProps) {
                        // const oProp = favProps[favPropId];
                        // console.log('favPropId', favPropId);
                        listFavProps.push({
                            favPropId,
                            collName
                        });
                        // console.log('listFavProps', listFavProps);
                    }
                }

                this.setState({
                    favPropIds: listFavProps
                });
                // console.log('favProps', listFavProps);
                resolve(true);
            });
        });
    }


    /**
     * @param {firebase.database.DataSnapshot} snapshot
     */
    onValueCollection(resolve, reject, snapshot) {
        const collections = snapshot.val();
        // console.log(collections);

        const arrColl = [];
        const listFavProps = []
        for (const collName in collections) {
            // console.log('collections[collectionId]', collections[collectionId]);
            arrColl.push(collName);

            // console.log('arrColl', arrColl);
            // console.log('collectionId', collName);
            // console.log('favoutiteProps[i]', collections[collName]);
            const favProps = collections[collName]

            for (const favPropId in favProps) {

                // console.log('favPropId', favPropId);
                listFavProps.push({
                    favPropId,
                    collName
                });
                // console.log('listFavProps', listFavProps);
            }
        }

        //here


        this.setState({
            collectionList: arrColl,
            favPropIds: listFavProps
            // collectionListProperties: arrCollPropList
        });
        this.getSearchResults();
        resolve(true);
    }

    createCollection() {
        console.log(this.state.collectionName);
        const user = firebase.auth().currentUser;

        // db.ref('Collections/').child(user.uid).child(this.state.collectionName).child(this.state.propertyID).set(true)
        db.ref(`Users/${user.uid}/Collections/${this.state.collectionName}/${this.state.propertyID}`).set(true)
            .then(() => {
                const oProp = this.state.propProperties.find((val, index) => {
                    return val.PropId == this.state.propertyID;
                });

                if (oProp) {
                    oProp.isFavourite = true;
                }
                console.log('Inserted!');
                this.handleCreateNewCollectionCancel();
            }).catch((error) => {
                console.log(error)
            });
    }

    addToCollection(collectionName) {
        const user = firebase.auth().currentUser;

        db.ref(`Users/${user.uid}/Collections/${collectionName}/${this.state.propertyID}`).set(true)
            .then(() => {
                const oProp = this.state.propProperties.find((val, index) => {
                    return val.PropId == this.state.propertyID;
                });

                if (oProp) {
                    oProp.isFavourite = true;
                }

                console.log('Inserted!');
                // this.changefavouriteIcon(true);
                this.handleCreateNewCollectionCancel();
                // console.log(this.state.isFavourite);
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

                <Dialog.Button label="Cancel" onPress={() => {
                    this.handleCreateNewCollectionCancel();
                }} />
                <Dialog.Button label="Create" onPress={this.createCollection.bind(this)} />
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

    deleteCollectionItem(propertyID, colName) {

        const user = firebase.auth().currentUser;

        db.ref(`Users/${user.uid}/Collections/${colName}/${propertyID}`).remove()
            .then(() => {

                const oProp = this.state.propProperties.find((val, index) => {
                    return val.PropId == propertyID;
                });

                if (oProp) {
                    oProp.isFavourite = false;
                }
                this.setState({});

                console.log('Deleted!!');
            }).catch((error) => {
                console.log(error)
            });
    }

    onPressRemoveFavourite(propertyID, collName) {

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
                        this.deleteCollectionItem(propertyID, collName);
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
                favouriteMarked={item.isFavourite}
                showFavouriteIcon={true}
                showDeleteIcon={false}
                onPressItem={(item) => {
                    this.props.navigation.navigate("ExpandedView", { PropertyData: item, favIDs: this.state.favPropIds });
                }}

                onPressFavourite={(item, isMarked) => {
                    if (this.state.loggedUser) {
                        this.state.propertyID = item.PropId;

                        // this.getFavouritePropertyId(item);
                        this.renderModal();
                    }
                    else {
                        this.pleaseLoginInAlert();
                    }
                }}

                onPressRemoveFavourite={(item) => {
                    console.log(item.collectionName);

                    this.onPressRemoveFavourite(item.PropId, item.collectionName);
                }
                }
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
                            // this.props.navigation.navigate('Search');
                            this.props.navigation.navigate('FilterScreen');
                        }}>
                            <View style={{ height: 30, alignItems: 'center', borderRadius: 10, backgroundColor: '#212121', justifyContent: 'center', paddingHorizontal: 10, marginTop: 20 }}>
                                <Text style={{ textAlign: 'center', color: '#ffffff', fontWeight: '600' }}>
                                    Back to filters
                            </Text>

                            </View>
                        </TouchableOpacity>
                    </View>
                    :
                    <FlatList
                        data={this.state.propProperties}
                        extraData={this.state}
                        renderItem={item => this.renderItem(item)}
                        keyExtractor={(item, index) => {
                            return "" + index;
                        }}
                    />
            );
    }

    render() {

        let propData = this.props.navigation.state.params.data;

        return (
            <View style={styles.container}>

                <View style={{
                    position: "absolute",
                    // top: 30,
                    left: 0,
                    zIndex: 2,
                    width: "100%",
                    // marginTop: 40,
                    backgroundColor: 'rgba(244, 244, 244, .97)',
                    flexDirection: 'row',
                }}>

                    <View style={{ flex: 1}}>
                        <View style={{ position: 'relative', alignSelf: 'flex-start' }}>
                            <TouchableOpacity style={[styles.resetFilterButton, { marginRight: 0 }]}
                                onPress={() => {
                                    // this.props.navigation.navigate('FilterScreen', { propData: propData });
                                    // this.renderSortModal(true);
                                    
                                }}
                            >
                              
                              {this.renderSortModalView()}

                                {/* {this.setTextForSortFilter()} */}
                                
                                  {/* <Text style={{ fontSize: 10 }}>SORT</Text> */}
                                

                            </TouchableOpacity>
                        </View>

                    </View>

                    <View style={{ flex: 1 }}>
                        <View style={{ position: 'relative', alignSelf: 'flex-end' }}>
                            <TouchableOpacity style={styles.resetFilterButton}
                                onPress={() => {
                                    this.props.navigation.navigate('FilterScreen', { propData: propData });
                                }}
                            >
                                <Text style={{ fontSize: 10 }}>SHOW FILTERS</Text>

                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {this.renderResultView()}
                {this.renderCreateNewCollectionDialog()}
                {this.renderModalView()}
                {/* {this.renderSortModalView()} */}

            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff"
    },
    resetFilterButton: {
        backgroundColor: "white",
        margin: 12,
        padding: 5,
        borderRadius: 15,
        paddingHorizontal: 10
    },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
      fontSize: 12,
      paddingVertical: 0,
      paddingHorizontal: 0,
    //   borderWidth: 1,
      borderColor: 'gray',
      borderRadius: 15,
      color: 'black',
    //   paddingRight: 30, // to ensure the text is never behind the icon
    },
    inputAndroid: {
      fontSize: 12,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderWidth: 0.5,
      borderColor: 'purple',
      borderRadius: 8,
      color: 'black',
      paddingRight: 30, // to ensure the text is never behind the icon
    },
  });