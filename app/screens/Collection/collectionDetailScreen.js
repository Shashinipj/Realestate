import React, { Component } from 'react';
import { View, StyleSheet, Text, TextInputProps, FlatList, TouchableOpacity, Image, ImageBackground, Alert } from 'react-native';
import Ionicon from 'react-native-vector-icons/Ionicons';
import Meticon from 'react-native-vector-icons/MaterialCommunityIcons';
import { db } from '../../Database/db';
import Accounting from 'accounting-js';
import ImageSlider from 'react-native-image-slider';

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


    renderItem(data) {

        return (
            <View style={styles.list_item}>

                <View style={styles.listView}>

                    <TouchableOpacity style={{}} onPress={() => {
                        this.props.navigation.navigate("ExpandedView", { PropertyData: data.item });
                    }}>
                        <Text style={{ marginVertical: 3, fontSize: 15, fontWeight: '600' }}>Text Title</Text>

                    </TouchableOpacity>

                    <ImageSlider
                        style={styles.imageTop}
                        images={[
                            // url('https://firebasestorage.googleapis.com/v0/b/realestate-be70e.appspot.com/o/index.jpg?alt=media&token=3ba7172f-9e37-4eab-a082-f84cd17e16bb'),
                            { uri: 'https://firebasestorage.googleapis.com/v0/b/realestate-be70e.appspot.com/o/house.jpg?alt=media&token=6f42610b-51b1-4ee1-bdca-32984e41694c' },
                            { uri: 'https://firebasestorage.googleapis.com/v0/b/realestate-be70e.appspot.com/o/house2.jpg?alt=media&token=0ccbf59c-2358-4aa1-89d6-b1d3b7e620a8' },
                            { uri: 'https://firebasestorage.googleapis.com/v0/b/realestate-be70e.appspot.com/o/house3.jpg?alt=media&token=dc364972-504f-452b-a9a3-f2e96e37e5e5' },
                            { uri: 'https://firebasestorage.googleapis.com/v0/b/realestate-be70e.appspot.com/o/house4.jpg?alt=media&token=850bf1ef-a0d3-42bd-8e76-745cbbcc7055' },
                        ]} />

                    <TouchableOpacity onPress={() => {
                        this.props.navigation.navigate("ExpandedView", { PropertyData: data.item });
                    }}>

                        <View style={{ flexDirection: 'row' }}>

                            <View >
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
                        </View>
                    </TouchableOpacity>

                </View>

            </View>
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
        height: 200,
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