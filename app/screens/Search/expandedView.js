import React, { Component } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Icon } from 'react-native-elements';
import Ionicon from 'react-native-vector-icons/Ionicons';
import Meticon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { Marker } from 'react-native-maps';
import ReadMore from 'react-native-read-more-text';
import ImageSlider from 'react-native-image-slider';
import Accounting from 'accounting-js';
import AntDesign from 'react-native-vector-icons/AntDesign';


export default class ExpandedView extends Component {

    /**
     * @type {Marker}
     */
    refMarker = null;

    static navigationOptions = ({ navigation }) => {
        // header: null,
        return {
            headerRight: <TouchableOpacity onPress={() => {
                navigation.navigate('Search');
            }}>
                {/* <Text>Home</Text> */}
                <AntDesign
                    name="home"
                    size={24}
                    style={{ marginRight: 10 }}
                // color='gray'
                />
            </TouchableOpacity>
        };
    };

    constructor(props) {
        super(props);

        this.state = {
            mapModalVisible: false,
        };
    }

    setModalVisible(visible) {
        this.setState({ mapModalVisible: visible });
    }

    showMapModal() {
        console.log('map modal visible');

        const { navigation } = this.props;
        const property = navigation.getParam('PropertyData');

        return (
            <View style={{ flex: 1 }}>
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.mapModalVisible}
                    onRequestClose={() => {
                        Alert.alert('Modal has been closed.');
                    }}>

                    <SafeAreaView>

                        <View style={{ marginTop: 10, backgroundColor: 'white', justifyContent: 'center' }}>

                            <TouchableOpacity
                                style={{
                                    // backgroundColor: "red",
                                    alignSelf: "flex-start",
                                    padding: 10
                                }}
                                onPress={() => {
                                    this.setModalVisible(!this.state.mapModalVisible);
                                    // this.onLoginSuccess.bind(this);
                                }}>

                                <Icon
                                    name="close"
                                    type='MaterialIcons'
                                    size={20}
                                />

                            </TouchableOpacity>
                        </View>

                        <View>
                            <MapView
                                style={styles.mapViewExpand}
                                initialRegion={{
                                    latitude: property.lat,
                                    longitude: property.lon,
                                    latitudeDelta: 0.0922,
                                    longitudeDelta: 0.0421,
                                }}
                                onMapReady={() => {
                                    if (this.refMarker) {
                                        this.refMarker.showCallout();
                                    }
                                }}
                            >

                                <MapView.Marker
                                    ref={(ref) => {
                                        this.refMarker = ref;
                                    }}
                                    coordinate={{
                                        latitude: property.lat,
                                        longitude: property.lon
                                    }}
                                    title={property.Owner}
                                    description={property.PropType}

                                />
                            </MapView>

                            {/* <View style={{ flexDirection: 'row', padding: 10, backgroundColor: 'white', justifyContent: 'center', position: 'absolute', zIndex: 2, bottom: 50 }}>

                                <TouchableOpacity style={{ flex: 1, }}>
                                    <View style={{ borderRadius: 4, alignContent: 'center', height: 35, justifyContent: 'center', marginHorizontal: 5, backgroundColor: '#49141E' }}>
                                        <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: '600', color: 'white' }}>Street View</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity style={{ flex: 1, }}>
                                    <View style={{ borderRadius: 4, alignContent: 'center', height: 35, justifyContent: 'center', marginHorizontal: 5, backgroundColor: '#49141E' }}>
                                        <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: '600', color: 'white' }}>Get Directions</Text>
                                    </View>
                                </TouchableOpacity>

                            </View> */}

                        </View>
                    </SafeAreaView>

                </Modal>

            </View>

        );
    }

    handleTextReady() {
        console.log('ready!');
    }

    renderTruncatedFooter(handlePress) {
        return (
            <View style={{ backgroundColor: '#EEEEEE', borderRadius: 4, flex: 1, alignContent: 'center', justifyContent: 'center', margin: 10 }}>
                <Text style={{ alignSelf: 'center', margin: 5, fontSize: 13, fontWeight: '500' }} onPress={handlePress}>
                    Read more
          </Text>
            </View>

        );
    }

    renderRevealedFooter(handlePress) {
        return (
            <View style={{ backgroundColor: '#EEEEEE', borderRadius: 4, flex: 1, alignContent: 'center', justifyContent: 'center', margin: 10 }}>

                <Text style={{ alignSelf: 'center', margin: 5, fontSize: 13, fontWeight: '500' }} onPress={handlePress}>
                    Show less
          </Text>
            </View>

        );
    }


    render() {
        const { navigation } = this.props;
        const property = navigation.getParam('PropertyData');
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#EEEEEE' }}>

                <ScrollView style={{ flex: 1, paddingBottom: 60 }}>

                    <View style={styles.listView}>
                        <View style={styles.listViewTop}>
                            <Text style={styles.ownerName}> {property.Owner}</Text>
                            <View style={styles.userProfileView}>

                                {/* <Image source={require('../../assets/images/owner2.jpg')} style={{ width: 40, height: 40, borderRadius: 20 }} /> */}
                                <Image source={require('../../assets/images/owner2.png')} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor:'#ffffff' }} />
                            </View>
                        </View>
                        {/* <ImageBackground style={styles.imageBackground}> */}
                        {/* <Image source={{uri:'https://firebasestorage.googleapis.com/v0/b/realestate-be70e.appspot.com/o/index.jpg?alt=media&token=3ba7172f-9e37-4eab-a082-f84cd17e16bb'}} style={styles.imageTop} /> */}

                        <ImageSlider
                            style={styles.imageTop}
                            // images={[
                            //     // url('https://firebasestorage.googleapis.com/v0/b/realestate-be70e.appspot.com/o/index.jpg?alt=media&token=3ba7172f-9e37-4eab-a082-f84cd17e16bb'),
                            //     { uri: 'https://firebasestorage.googleapis.com/v0/b/realestate-be70e.appspot.com/o/house.jpg?alt=media&token=6f42610b-51b1-4ee1-bdca-32984e41694c' },
                            //     { uri: 'https://firebasestorage.googleapis.com/v0/b/realestate-be70e.appspot.com/o/house2.jpg?alt=media&token=0ccbf59c-2358-4aa1-89d6-b1d3b7e620a8' },
                            //     { uri: 'https://firebasestorage.googleapis.com/v0/b/realestate-be70e.appspot.com/o/house3.jpg?alt=media&token=dc364972-504f-452b-a9a3-f2e96e37e5e5' },
                            //     { uri: 'https://firebasestorage.googleapis.com/v0/b/realestate-be70e.appspot.com/o/house4.jpg?alt=media&token=850bf1ef-a0d3-42bd-8e76-745cbbcc7055' },
                            // ]} 
                            images={property.images}

                        />

                        {/* </ImageBackground> */}

                        <View style={{ marginLeft: 10 }}>
                            <Text style={{ fontSize: 15, fontWeight: '600', marginTop: 10, marginBottom: 5 }}>{Accounting.formatMoney(property.Price)}</Text>
                            <Text style={{ fontSize: 12, color: 'gray' }}>{property.Address}</Text>

                            <View style={{ flexDirection: 'row', marginTop: 5 }}>

                                <Ionicon name="ios-bed" size={15} />
                                <Text style={styles.subDetailsText}>{property.Bedrooms}</Text>

                                <Meticon name="shower" size={15} />
                                <Text style={styles.subDetailsText}>{property.Bathrooms}</Text>

                                <Ionicon name="ios-car" size={15} />
                                <Text style={styles.subDetailsText}>{property.CarPark}</Text>

                                <Image source={require('../../assets/images/land-size.png')} style={{ width: 15, height: 15 }} />
                                <Text style={[styles.subDetailsText, { marginRight: 0 }]}>{property.LandSize} m</Text>
                                <Text style={{ fontSize: 10, lineHeight: 10 }}>2</Text>

                                <View style={{ borderLeftWidth: 1, marginHorizontal: 10 }}></View>

                                <Text style={styles.subDetailsText}>{property.PropType}</Text>
                            </View>
                        </View>

                        <View style={{ borderTopWidth: 1, marginVertical: 10 }}></View>

                        <TouchableOpacity >
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ marginLeft: 10, flex: 1 }}>
                                    <Text style={{ fontWeight: '600' }}>Home Loan Calculator</Text>
                                    <Text style={{ marginTop: 5 }}>{property.Price / 100}/month</Text>
                                    <Text style={{ fontSize: 12, color: 'gray' }}>estimated repayment</Text>
                                </View>

                                <View style={{ justifyContent: 'center', marginHorizontal: 10 }}>
                                    <TouchableOpacity>
                                        <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderRadius: 4 }}>
                                            <Text>Calculate</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>

                            </View>
                        </TouchableOpacity>

                        <View style={{ borderTopWidth: 1, marginVertical: 10 }}></View>

                        <TouchableOpacity >
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ marginLeft: 10, flex: 1 }}>
                                    <Text style={{ fontWeight: '600' }}>Home Loan Calculator</Text>
                                    <Text style={{ marginTop: 5, fontSize: 13, color: '#424242' }}>Apply for conditional approval</Text>
                                </View>

                                <View style={{ justifyContent: 'center', marginHorizontal: 10 }}>
                                    <TouchableOpacity>
                                        <View style={{ paddingHorizontal: 10, paddingVertical: 5 }}>
                                            <Meticon
                                                name="chevron-right"
                                                size={25}
                                                color='gray'
                                            />
                                        </View>
                                    </TouchableOpacity>
                                </View>

                            </View>
                        </TouchableOpacity>

                    </View>

                    <View style={{ marginVertical: 7, backgroundColor: '#ffffff' }}>

                        <TouchableOpacity onPress={() => {
                            this.setModalVisible(!this.state.mapModalVisible);
                        }}>
                            <MapView
                                style={styles.mapView}
                                initialRegion={{
                                    latitude: property.lat,
                                    longitude: property.lon,
                                    latitudeDelta: 0.0922,
                                    longitudeDelta: 0.0421,
                                }}
                            >

                                <View style={{}}>
                                    <TouchableOpacity style={{ alignContent: 'flex-start', width: '10%', alignItems: 'center', justifyContent: 'center' }} onPress={() => {
                                        this.setModalVisible(!this.state.mapModalVisible);
                                    }}>
                                        <Meticon
                                            name="arrow-expand"
                                            size={25}
                                            color='gray'
                                        />
                                    </TouchableOpacity>
                                </View>

                                <MapView.Marker
                                    coordinate={{
                                        latitude: property.lat,
                                        longitude: property.lon
                                    }}
                                />

                            </MapView>

                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
                            <TouchableOpacity style={{ flex: 1 }}>
                                <View style={{ borderWidth: 1, borderRadius: 4, alignContent: 'center', height: 35, justifyContent: 'center', marginHorizontal: 5 }}>
                                    <Text style={{ textAlign: 'center' }}>Street View</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flex: 1 }}>
                                <View style={{ borderWidth: 1, borderRadius: 4, alignContent: 'center', height: 35, justifyContent: 'center', marginHorizontal: 5 }}>
                                    <Text style={{ textAlign: 'center' }}>Get Directions</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {this.showMapModal()}

                    </View>

                    <View style={{ backgroundColor: 'white', padding: 10 }}>
                        <Text style={{ fontSize: 15, fontWeight: '600', marginTop: 10, marginBottom: 5 }}>Description</Text>
                        <View style={{}}>
                            <ReadMore
                                numberOfLines={4}
                                renderTruncatedFooter={this.renderTruncatedFooter}
                                renderRevealedFooter={this.renderRevealedFooter}
                            // onReady={this.handleTextReady}
                            >
                                <Text style={{ textAlign: 'justify' }}>
                                    {property.Description}
                                </Text>
                            </ReadMore>
                        </View>
                    </View>

                </ScrollView>
                {/* {this.showMapModal()} */}

                <View style={{ height: 60, backgroundColor: 'white', alignItems: 'center' }}>
                    <TouchableOpacity>

                        <View style={{
                            backgroundColor: '#49141E', marginVertical: 12, flex: 1, marginHorizontal: 10, width: 300,
                            borderRadius: 7, alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Text style={{ color: 'white', fontWeight: '600' }}>Email agent</Text>
                        </View>

                    </TouchableOpacity>
                </View>
            </SafeAreaView >
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
    subDetailsText: {
        marginLeft: 5,
        marginRight: 10,
        fontSize: 12
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
    listView: {
        backgroundColor: 'white',
        // borderBottomWidth: 1,
        paddingBottom: 10,
        // marginBottom: 10
    },
    ownerName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#E0E0E0'
    },
    imageTop: {
        marginTop: 20,
        width: '100%',
        height: 300,
    },
    mapView: {
        width: '100%',
        height: 150
    },
    mapViewExpand: {
        width: '100%',
        height: '100%',
        // marginTop: 50
    }
})