import React, { Component } from 'react';
import { View, StyleSheet, Text, TextInputProps, FlatList, TouchableOpacity, Image, ImageBackground, Alert } from 'react-native';
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
            loggedUser: ''
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
                propProperties: filteredProperties
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


    renderItem = (data) =>
        // <TouchableOpacity style={styles.list_item} onPress={() => {
        //     this.props.navigation.navigate("ExpandedView", { PropertyData: data.item });
        // }}>

        <View style={styles.list_item}>

            <View style={styles.listView}>
                {/* 
                <View style={styles.listViewTop}>
                    <Text style={styles.ownerName}> {data.item.Owner}</Text>
                    <View style={styles.userProfileView}>

                        <Image source={require('../../assets/images/owner.jpg')} style={{ width: 40, height: 40, borderRadius: 20 }} />
                    </View>
                </View> */}


                {/* <ImageBackground style={styles.imageBackground}> */}

                <TouchableOpacity style={{}} onPress={() => {
                    this.props.navigation.navigate("ExpandedView", { PropertyData: data.item });
                }}>
                    <Text style={{ marginVertical: 3, fontSize: 15, fontWeight: '600' }}>Text Title</Text>

                </TouchableOpacity>


                {/* <Image source={require('../../assets/images/house.jpg')} style={styles.imageTop} /> */}
                <ImageSlider
                    style={styles.imageTop}
                    images={[
                        // url('https://firebasestorage.googleapis.com/v0/b/realestate-be70e.appspot.com/o/index.jpg?alt=media&token=3ba7172f-9e37-4eab-a082-f84cd17e16bb'),
                        { uri: 'https://firebasestorage.googleapis.com/v0/b/realestate-be70e.appspot.com/o/house.jpg?alt=media&token=6f42610b-51b1-4ee1-bdca-32984e41694c' },
                        { uri: 'https://firebasestorage.googleapis.com/v0/b/realestate-be70e.appspot.com/o/house2.jpg?alt=media&token=0ccbf59c-2358-4aa1-89d6-b1d3b7e620a8' },
                        { uri: 'https://firebasestorage.googleapis.com/v0/b/realestate-be70e.appspot.com/o/house3.jpg?alt=media&token=dc364972-504f-452b-a9a3-f2e96e37e5e5' },
                        { uri: 'https://firebasestorage.googleapis.com/v0/b/realestate-be70e.appspot.com/o/house4.jpg?alt=media&token=850bf1ef-a0d3-42bd-8e76-745cbbcc7055' },
                    ]} />

                {/* </ImageBackground> */}

                <TouchableOpacity onPress={() => {
                    this.props.navigation.navigate("ExpandedView", { PropertyData: data.item });
                }}>



                    <View style={{ flexDirection: 'row' }}>

                        <View style={{
                            // marginLeft: 10 
                        }}>
                            <Text style={{ fontSize: 15, fontWeight: '600', marginTop: 10, marginBottom: 5 }}>{Accounting.formatMoney(data.item.Price)}</Text>
                            <Text style={{ fontSize: 12, color: 'gray', marginBottom: 5 }}>{data.item.Address}</Text>

                            <View style={{ flexDirection: 'row' }}>

                                <Ionicon name="ios-bed" size={15} />
                                <Text style={styles.subDetailsText}>{data.item.Bedrooms}</Text>

                                <Meticon name="shower" size={15} />
                                <Text style={styles.subDetailsText}>{data.item.Bathrooms}</Text>

                                <Ionicon name="ios-car" size={15} />
                                <Text style={styles.subDetailsText}>{data.item.CarPark}</Text>

                                <View style={{ borderLeftWidth: 1, marginHorizontal: 10 }}></View>

                                <Text style={styles.subDetailsText}>{data.item.PropType}</Text>
                            </View>
                        </View>

                        <View style={styles.sideButtons}>


                            {/* create new folder */}
                            {/* <TouchableOpacity onPress={((data) => {
                            this.setState({
                                propertyID: data.item.PropId
                            });

                            if (this.state.loggedUser) {
                                this.showCreateNewCollectionDialog();
                            }
                            else {
                                this.pleaseLoginInAlert();
                            }

                        }).bind(this, data)}>

                            <AntDesign
                                name="addfolder"
                                size={24}
                                style={{ marginRight: 10 }}
                            />

                        </TouchableOpacity> */}



                            <TouchableOpacity onPress={((data) => {
                                this.setState({
                                    propertyID: data.item.PropId
                                });

                                if (this.state.loggedUser) {
                                    this.renderModal();
                                }
                                else {
                                    this.pleaseLoginInAlert();
                                }


                            }).bind(this, data)}>
                                <Meticon
                                    name="heart-outline"
                                    size={25}
                                    // color='gray'
                                    style={{ marginRight: 10 }}
                                />
                                {/* <Text> jhsgdjhasgd</Text> */}
                            </TouchableOpacity>

                        </View>

                        {/* sadasd */}
                    </View>
                </TouchableOpacity>

            </View>

        </View>
    // {/* </TouchableOpacity> */}


    render() {
        return (
            <View style={styles.container}>
                {(this.state.propProperties.length == 0) ?
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
                }

                {this.renderCreateNewCollectionDialog()}
                {this.renderModalView()}

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
    list_item: {
        // flexDirection: "row",
        borderRadius: 5,
        // padding: 5,
        paddingTop: 5,
        padding: 10
    },
    userProfileView: {
        width: 40,
        height: 40,
        borderRadius: 20,
        // backgroundColor: 'white',
        marginBottom: -20,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
        borderColor: 'white'
        // position: "absolute",
    },
    listViewTop: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: 40,
        zIndex: 2,

        backgroundColor: '#49141E',
        padding: 5,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        overflow: "visible"
    },
    imageBackground: {
        height: 100,
        width: '90%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    subDetailsText: {
        marginLeft: 5,
        marginRight: 10,
        fontSize: 12
    },
    listView: {
        backgroundColor: 'white',
        // borderBottomWidth: 1,
        // paddingBottom: 10,
        marginBottom: 5,
        padding: 10
    },
    ownerName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#E0E0E0'
    },
    imageTop: {
        // marginTop: 40,
        // marginTop:10,
        width: '100%',
        height: 300,
    },
    sideButtons: {
        alignItems: 'flex-end',
        position: 'absolute',
        right: -5,
        top: 15,
        flexDirection: 'row',
        flex: 1,
        // backgroundColor:'blue'
    }

});