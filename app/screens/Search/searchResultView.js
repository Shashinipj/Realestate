import React, { Component } from 'react';
import { View, StyleSheet, Text, TextInputProps, FlatList, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { NavigationProp } from 'react-navigation';
// import firebase from 'react-native-firebase';
import { Icon } from 'react-native-elements';
import Ionicon from 'react-native-vector-icons/Ionicons';
import Meticon from 'react-native-vector-icons/MaterialCommunityIcons';

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
                                                            this.setState({
                                                                propProperties: filteredProperties
                                                            });
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
        });

        console.log(this.state.filteredProperties)
    }

    renderItem = (data) =>
        <TouchableOpacity style={styles.list_item} onPress={() => {
            this.props.navigation.navigate("ExpandedView", { PropertyData: data.item });
        }}>
            <View style={styles.listView}>
                <View style={styles.listViewTop}>
                    <Text style={styles.ownerName}> {data.item.Owner}</Text>
                    <View style={styles.userProfileView}>
                        {/* <Meticon
                            name="account-outline"
                            size={25}
                            color='gray'
                        /> */}

                        <Image source={require('../../assets/images/owner.jpg')} style={{ width: 40, height: 40, borderRadius: 20 }} />
                    </View>
                </View>
                {/* <ImageBackground style={styles.imageBackground}> */}
                <Image source={require('../../assets/images/house.jpg')} style={styles.imageTop} />

                {/* </ImageBackground> */}

                <View style={{ flexDirection: 'row' }}>

                    <View style={{ marginLeft: 10 }}>
                        <Text style={{ fontSize: 15, fontWeight: '600', marginTop: 10, marginBottom: 5 }}>{data.item.Price}/=</Text>
                        <Text style={{ fontSize: 12, color: 'gray' }}>{data.item.Address}</Text>

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
                        <TouchableOpacity>

                            <Meticon
                                name="square-edit-outline"
                                size={25}
                                style={{ marginRight: 10 }}
                            // color='gray'
                            />

                        </TouchableOpacity>

                        <TouchableOpacity>
                            <Ionicon
                                name="ios-star-outline"
                                size={25}
                                // color='gray'
                                style={{ marginRight: 10 }}
                            />
                            {/* <Text> jhsgdjhasgd</Text> */}
                        </TouchableOpacity>

                    </View>
                </View>
            </View>
        </TouchableOpacity>


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
                        keyExtractor={item => "" + item.propId}
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
        backgroundColor: '#E0E0E0'
    },
    list_item: {
        // flexDirection: "row",
        borderRadius: 5,
        // padding: 5,
        paddingTop: 5
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
        paddingBottom: 10,
        marginBottom: 10
    },
    ownerName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#E0E0E0'
    },
    imageTop: {
        marginTop: 40,
        width: '100%',
        height: 300,
    },
    sideButtons: {
        alignItems: 'flex-end',
        position: 'absolute',
        right: 5,
        top: 15,
        flexDirection: 'row',
        flex: 1,
        // backgroundColor:'blue'
    }

});