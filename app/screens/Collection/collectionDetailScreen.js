import React, { Component } from 'react';
import { View, StyleSheet, Text, TextInputProps, FlatList, TouchableOpacity, Image, ImageBackground, Alert } from 'react-native';
import Ionicon from 'react-native-vector-icons/Ionicons';
import Meticon from 'react-native-vector-icons/MaterialCommunityIcons';
import { db } from '../../Database/db';
import Accounting from 'accounting-js';

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
            <TouchableOpacity style={styles.list_item} onPress={() => {
                this.props.navigation.navigate("ExpandedView", { PropertyData: data.item });
            }}>
                <View style={styles.listView}>
                    <View style={styles.listViewTop}>
                        <Text style={styles.ownerName}> {data.item.Owner}</Text>
                        <View style={styles.userProfileView}>

                            <Image source={require('../../assets/images/owner.jpg')} style={{ width: 40, height: 40, borderRadius: 20 }} />
                        </View>
                    </View>
                    {/* <ImageBackground style={styles.imageBackground}> */}
                    <Image source={require('../../assets/images/house.jpg')} style={styles.imageTop} />
                    {/* </ImageBackground> */}

                    <View style={{ flexDirection: 'row' }}>

                        <View style={{ marginLeft: 10 }}>
                            <Text style={{ fontSize: 15, fontWeight: '600', marginTop: 10, marginBottom: 5 }}>{Accounting.formatMoney(data.item.Price)}</Text>
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
                    </View>
                </View>
            </TouchableOpacity>

        );
    }


    render() {
        return (
            <View style={{ backgroundColor: '#E0E0E0', flex: 1 }}>
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