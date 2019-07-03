import React, { Component } from 'react';
import {
    View, StyleSheet, Text, TextInputProps, TouchableOpacity, Modal, ScrollView,
    Switch, TextInput, TouchableHighlight
} from 'react-native';

import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

import RangeSlider from 'rn-range-slider';


const PropertyTypes = {
    House: 1,
    Apartment: 2,
    Townhouse: 3,
    Villa: 4,
    All: -1
}

export default class SearchBarScreen extends Component {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);

        this.state = {
            search: '',
            filterModalVisible: false,
            agreementType: 1,
            pressStatus: false,
            priceTopic: '',

            isSelectedHouse: false,
            isSelectedApartment: false,
            isSelectedTownhouse: false,
            isSelectedVilla: false,
            isSelectAll: false
        };

    }

    Onpress_PropertyTypeFilter(type) {
        if (type == PropertyTypes.All) {
            this.setState({
                isSelectedHouse: false,
                isSelectedApartment: false,
                isSelectedTownhouse: false,
                isSelectedVilla: false,
                isSelectAll: true

            });
        } else {

            switch (type) {
                case PropertyTypes.House:
                    this.setState({
                        isSelectedHouse: !this.state.isSelectedHouse,
                        isSelectAll: false
                    });
                    break;
                case PropertyTypes.Apartment:
                    this.setState({
                        isSelectedApartment: !this.state.isSelectedApartment,
                        isSelectAll: false
                    });
                    break;
                case PropertyTypes.Townhouse:
                    this.setState({
                        isSelectedTownhouse: !this.state.isSelectedTownhouse,
                        isSelectAll: false
                    });
                    break;
                case PropertyTypes.Villa:
                    this.setState({
                        isSelectedVilla: !this.state.isSelectedVilla,
                        isSelectAll: false
                    });
                    break;

            }

        }


    }

    isAgreementTypeButtonPress(buttonNo) {
        this.setState({
            agreementType: buttonNo
        });
    }

    setFilterModalVisible() {
        this.setState({ filterModalVisible: !this.state.filterModalVisible });
        console.log("modal visible")
    }

    showFilterModal() {

        return (
            <View style={{ flex: 1 }}>
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.filterModalVisible}
                    onRequestClose={() => {
                        Alert.alert('Modal has been closed.');
                    }}>
                    <View style={{ flex: 1 }}>
                        {this.showFilters()}
                    </View>

                </Modal>
            </View>
        );

    }

    renderPriceDetails() {

        if (this.state.agreementType == 1) {
            return (

                <View>

                    <View style={{ marginHorizontal: 5 }}>
                        <Text style={styles.mainCategoryText}>Price range</Text>
                    </View>

                    <Text style={{ textAlign: 'center', fontSize: 15 }}>Any Price</Text>
                    <View style={{ backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }}>
                        <RangeSlider
                            style={{ width: '50%', height: 80 }}
                            gravity={'center'}
                            min={200}
                            max={1000}
                            step={20}
                            selectionColor="#000000"
                            blankColor='blue'
                        // onValueChanged={(low, high, fromUser) => {
                        //     this.setState({ rangeLow: low, rangeHigh: high })
                        // }} 
                        />
                    </View>
                </View>
            );

        }

        else if (this.state.agreementType == 2) {
            return (

                <View>
                    <View style={{ marginHorizontal: 5 }}>
                        <Text style={styles.mainCategoryText}>Price per week</Text>
                    </View>

                    <Text style={{ textAlign: 'center', fontSize: 15 }}>Any Price</Text>
                    <View style={{ backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }}>
                        <RangeSlider
                            style={{ width: 160, height: 80 }}
                            gravity={'center'}
                            min={200}
                            max={1000}
                            step={20}
                            selectionColor="#000000"
                            blankColor='blue'
                        // onValueChanged={(low, high, fromUser) => {
                        //     this.setState({ rangeLow: low, rangeHigh: high })
                        // }} 
                        />
                    </View>
                </View>
            );

        }

        else if (this.state.agreementType == 3) {
            return (

                <View>
                    <View style={{ marginHorizontal: 5 }}>
                        <Text style={styles.mainCategoryText}>Price range</Text>
                    </View>

                    <Text style={{ textAlign: 'center', fontSize: 15 }}>Any Price</Text>
                    <View style={{ backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }}>
                        <RangeSlider
                            style={{ width: 160, height: 80 }}
                            gravity={'center'}
                            min={200}
                            max={1000}
                            step={20}
                            selectionColor="#000000"
                            blankColor='blue'
                        // onValueChanged={(low, high, fromUser) => {
                        //     this.setState({ rangeLow: low, rangeHigh: high })
                        // }} 
                        />
                    </View>
                </View>
            );

        }

    }

    showFilters() {

        return (
            <View style={{ flex: 1 }}>
                <View style={styles.searchBarView}>
                    {/* {this.GooglePlacesInput()} */}
                </View>

                <View style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    zIndex: 2,
                    width: "100%",
                    marginTop: 40, backgroundColor: 'rgba(244, 244, 244, .97)'
                }}>

                    <View style={{ position: 'relative', alignSelf: 'flex-end' }}>
                        <TouchableOpacity style={styles.resetFilterButton}>

                            <Text style={{ fontSize: 10 }}>RESET FILTERS</Text>

                        </TouchableOpacity>
                    </View>
                </View>
                <ScrollView style={{ padding: 10, marginTop: 40 }}>
                    <View style={styles.buttonSetView}>
                        <TouchableOpacity
                            style={
                                this.state.agreementType == 1
                                    ? { flex: 1, backgroundColor: '#424242', borderTopLeftRadius: 5, borderBottomLeftRadius: 5 } : { flex: 1 }
                            }
                            onPress={() => this.isAgreementTypeButtonPress(1)}
                        >
                            <View style={[styles.subButtonView, { borderRightWidth: 1, height: 30 }]}>
                                <Text style={
                                    this.state.agreementType == 1 ?
                                        [styles.propertyTypeText, { color: 'white' }] : styles.propertyTypeText}>BUY</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={
                                this.state.agreementType == 2
                                    ? { flex: 1, backgroundColor: '#424242' } : { flex: 1 }
                            }

                            onPress={() => this.isAgreementTypeButtonPress(2)}
                        >
                            <View style={styles.subButtonView}>
                                <Text style={
                                    this.state.agreementType == 2 ?
                                        [styles.propertyTypeText, { color: 'white' }] : styles.propertyTypeText}>RENT</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={
                                this.state.agreementType == 3
                                    ? { flex: 1, backgroundColor: '#424242', borderTopRightRadius: 5, borderBottomRightRadius: 5 } : { flex: 1 }
                            }
                            onPress={() => this.isAgreementTypeButtonPress(3)}
                        >
                            <View style={[styles.subButtonView, { borderLeftWidth: 1 }]}>
                                <Text style={
                                    this.state.agreementType == 3 ?
                                        [styles.propertyTypeText, { color: 'white' }] : styles.propertyTypeText}>SOLD</Text>
                            </View>
                        </TouchableOpacity>

                    </View>

                    <View style={{ marginHorizontal: 5 }}>
                        <Text style={styles.mainCategoryText}>Property type</Text>
                    </View>

                    <View style={{
                        marginHorizontal: 5,
                        // flexDirection: 'row',
                        // justifyContent: 'space-between',
                        marginVertical: 15
                    }}>
                        <ScrollView horizontal={true} >
                            <View style={styles.propertyTypeView}>
                                <TouchableOpacity onPress={this.Onpress_PropertyTypeFilter.bind(this, PropertyTypes.All)}>
                                    {/* <View style={styles.propertTypeButtons}> */}
                                    <View style={
                                        this.state.isSelectAll ? [styles.propertTypeButtons, { backgroundColor: 'red' }]
                                            : styles.propertTypeButtons
                                    }>

                                    </View>
                                </TouchableOpacity>
                                <Text>All Types</Text>
                            </View>

                            <View style={styles.propertyTypeView}>
                                <TouchableOpacity onPress={this.Onpress_PropertyTypeFilter.bind(this, PropertyTypes.House)}>
                                    <View style={
                                        this.state.isSelectedHouse ? [styles.propertTypeButtons, { backgroundColor: 'red' }]
                                            : styles.propertTypeButtons
                                    }>

                                    </View>
                                </TouchableOpacity>
                                <Text>House</Text>
                            </View>

                            <View style={styles.propertyTypeView}>
                                <TouchableOpacity onPress={this.Onpress_PropertyTypeFilter.bind(this, PropertyTypes.Apartment)}>
                                    <View style={
                                        this.state.isSelectedApartment ? [styles.propertTypeButtons, { backgroundColor: 'red' }]
                                            : styles.propertTypeButtons
                                    }>

                                    </View>
                                </TouchableOpacity>
                                <Text style={{ textAlign: 'center' }}>Apartment{"\n&"} house </Text>
                            </View>

                            <View style={styles.propertyTypeView}>
                                <TouchableOpacity onPress={this.Onpress_PropertyTypeFilter.bind(this, PropertyTypes.Townhouse)}>
                                    <View style={
                                        this.state.isSelectedTownhouse ? [styles.propertTypeButtons, { backgroundColor: 'red' }]
                                            : styles.propertTypeButtons
                                    }>

                                    </View>
                                </TouchableOpacity>
                                <Text>Townhouse</Text>
                            </View>

                            <View style={styles.propertyTypeView}>
                                <TouchableOpacity onPress={this.Onpress_PropertyTypeFilter.bind(this, PropertyTypes.Villa)}>
                                    <View style={
                                        this.state.isSelectedVilla ? [styles.propertTypeButtons, { backgroundColor: 'red' }]
                                            : styles.propertTypeButtons
                                    }>

                                    </View>
                                </TouchableOpacity>
                                <Text>Villa</Text>
                            </View>
                        </ScrollView>
                    </View>

                    <View style={styles.separatorView}></View>

                    {this.renderPriceDetails()}

                    <View style={styles.separatorView}></View>

                    <View style={{ marginHorizontal: 5 }}>
                        <Text style={styles.mainCategoryText}>(icon) Bedrooms</Text>
                    </View>

                    <View style={{ marginVertical: 10 }}>
                        <View style={styles.buttonSetView}>
                            <TouchableOpacity style={{ flex: 1 }}>
                                <View style={[styles.subButtonView, { borderRightWidth: 1, height: 30 }]}>
                                    <Text style={styles.propertyTypeText}>All</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={{ flex: 1 }}>
                                <View style={styles.subButtonView}>
                                    <Text style={{ fontSize: 10 }}>STUDIO+</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={{ flex: 1 }}>
                                <View style={[styles.subButtonView, { borderLeftWidth: 1 }]}>
                                    <Text style={styles.propertyTypeText}>1+</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={{ flex: 1 }}>
                                <View style={[styles.subButtonView, { borderLeftWidth: 1 }]}>
                                    <Text style={styles.propertyTypeText}>2+</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={{ flex: 1 }}>
                                <View style={[styles.subButtonView, { borderLeftWidth: 1 }]}>
                                    <Text style={styles.propertyTypeText}>3+</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={{ flex: 1 }}>
                                <View style={[styles.subButtonView, { borderLeftWidth: 1 }]}>
                                    <Text style={styles.propertyTypeText}>4+</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={{ flex: 1 }}>
                                <View style={[styles.subButtonView, { borderLeftWidth: 1 }]}>
                                    <Text style={styles.propertyTypeText}>5+</Text>
                                </View>
                            </TouchableOpacity>

                        </View>

                        <View style={{ flexDirection: 'row' }}>
                            <Text>Select bedroom range</Text>
                            <Switch
                                style={{ position: 'absolute', right: 5 }}
                                onChange={this.handleChange}
                                checked={this.state.checked}
                                height={5}
                                width={20}

                            />

                        </View>
                    </View>

                    <View style={styles.separatorView}></View>

                    <View style={styles.mainCategoryView}>
                        <Text style={styles.mainCategoryText}>(icon) Bathrooms</Text>
                    </View>


                    <View style={styles.buttonSetView}>
                        <TouchableOpacity style={{ flex: 1 }}>
                            <View style={[styles.subButtonView, { borderRightWidth: 1, height: 30 }]}>
                                <Text style={styles.propertyTypeText}>All</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={{ flex: 1 }}>
                            <View style={styles.subButtonView}>
                                <Text style={styles.propertyTypeText}>1+</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={{ flex: 1 }}>
                            <View style={[styles.subButtonView, { borderLeftWidth: 1 }]}>
                                <Text style={styles.propertyTypeText}>2+</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={{ flex: 1 }}>
                            <View style={[styles.subButtonView, { borderLeftWidth: 1 }]}>
                                <Text style={styles.propertyTypeText}>3+</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={{ flex: 1 }}>
                            <View style={[styles.subButtonView, { borderLeftWidth: 1 }]}>
                                <Text style={styles.propertyTypeText}>4+</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={{ flex: 1 }}>
                            <View style={[styles.subButtonView, { borderLeftWidth: 1 }]}>
                                <Text style={styles.propertyTypeText}>5+</Text>
                            </View>
                        </TouchableOpacity>

                    </View>


                    <View style={styles.separatorView}></View>

                    <View style={styles.mainCategoryView}>
                        <Text style={styles.mainCategoryText}>(icon) Car apaces</Text>
                    </View>


                    <View style={styles.buttonSetView}>
                        <TouchableOpacity style={{ flex: 1 }}>
                            <View style={[styles.subButtonView, { borderRightWidth: 1, height: 30 }]}>
                                <Text style={styles.propertyTypeText}>All</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={{ flex: 1 }}>
                            <View style={styles.subButtonView}>
                                <Text style={styles.propertyTypeText}>1+</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={{ flex: 1 }}>
                            <View style={[styles.subButtonView, { borderLeftWidth: 1 }]}>
                                <Text style={styles.propertyTypeText}>2+</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={{ flex: 1 }}>
                            <View style={[styles.subButtonView, { borderLeftWidth: 1 }]}>
                                <Text style={styles.propertyTypeText}>3+</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={{ flex: 1 }}>
                            <View style={[styles.subButtonView, { borderLeftWidth: 1 }]}>
                                <Text style={styles.propertyTypeText}>4+</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={{ flex: 1 }}>
                            <View style={[styles.subButtonView, { borderLeftWidth: 1 }]}>
                                <Text style={styles.propertyTypeText}>5+</Text>
                            </View>
                        </TouchableOpacity>

                    </View>


                    <View style={styles.separatorView}></View>

                    <View style={styles.mainCategoryView}>
                        <Text style={styles.mainCategoryText}>Land size</Text>
                    </View>
                    <View style={{ justifyContent: 'center', flexDirection: 'row', marginVertical: 20 }}>
                        <Text style={{ fontSize: 15 }}>At leaset </Text>
                        <TextInput
                            style={{ borderColor: 'black', borderBottomWidth: 1, width: 70 }}
                        // onChangeText={(text) => this.setState({ text })}
                        // value={this.state.text}
                        />
                        <Text style={{ fontSize: 15 }}>(m2)</Text>
                    </View>

                    <View style={[styles.buttonSetView, { marginHorizontal: 80 }]}>
                        <TouchableOpacity style={{ flex: 1 }}>
                            <View style={[styles.subButtonView, { borderRightWidth: 1, height: 20 }]}>
                                <Text style={styles.propertyTypeText}>Metres(2)</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={{ flex: 1 }}>
                            <View style={styles.subButtonView}>
                                <Text style={styles.propertyTypeText}>Acres</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={{ flex: 1 }}>
                            <View style={[styles.subButtonView, { borderLeftWidth: 1 }]}>
                                <Text style={styles.propertyTypeText}>Hectares</Text>
                            </View>
                        </TouchableOpacity>

                    </View>

                    <View style={styles.separatorView}></View>

                    <View style={styles.mainCategoryView}>
                        <Text style={styles.mainCategoryText}>Keywords</Text>
                    </View>

                    <TextInput
                        style={{ marginHorizontal: 5 }}
                        placeholder='e.g Pool, garage'
                    // onChangeText={(text) => this.setState({ text })}
                    // value={this.state.text}
                    />

                    <View style={styles.separatorView}></View>

                    <View style={styles.mainCategoryView}>
                        <Text style={styles.mainCategoryText}>Sort order</Text>
                    </View>

                    <View style={styles.separatorView}></View>

                    <Text> Exclude under contract/offer</Text>

                    <View style={styles.separatorView}></View>

                </ScrollView>
                <View style={{ height: 50, backgroundColor: 'gray', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => {
                        this.setFilterModalVisible();
                        this.props.navigation.navigate('SearchResultView');
                        console.log('search button clicked');
                    }}>
                        <View style={{
                            backgroundColor: 'red', marginVertical: 7, flex: 1, marginHorizontal: 10, width: 300,
                            borderRadius: 7, alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Text>Search</Text>
                        </View>
                    </TouchableOpacity>


                </View>
            </View>
        );

    }


    GooglePlacesInput() {

        const { search } = this.state;

        return (
            <GooglePlacesAutocomplete
                placeholder='Search suburb, postcode, state'
                minLength={2} // minimum length of text to search
                autoFocus={false}
                value={search}
                returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
                listViewDisplayed='auto'    // true/false/undefined
                fetchDetails={true}
                renderDescription={row => row.description} // custom description render
                onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
                    console.log(data, details);
                    // console.log(data.description);
                    // this.props.navigation.navigate('FilterSearchResults', { location: data });
                    this.setFilterModalVisible();
                }}

                getDefaultValue={() => ''}

                query={{
                    // available options: https://developers.google.com/places/web-service/autocomplete
                    key: 'AIzaSyBMtFjgIpHg7Eu44iugytPzRYoG_1V7pOA',
                    language: 'en', // language of the results
                    types: '(cities)', // default: 'geocode'
                    region: "LK",
                    components: 'country:lk'
                }}

                styles={{
                    textInputContainer: {
                        width: '100%',
                        backgroundColor: '#ffffff'
                    },
                    description: {
                        fontWeight: 'bold'
                    },
                    predefinedPlacesDescription: {
                        color: '#1faadb'
                    }
                }}

                currentLocation={true} // Will add a 'Current location' button at the top of the predefined places list
                currentLocationLabel="Current location"
                nearbyPlacesAPI='GooglePlacesSearch' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
                GoogleReverseGeocodingQuery={{
                    // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
                }}
                GooglePlacesSearchQuery={{
                    // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
                    rankby: 'distance',
                    types: 'food'
                }}

                filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities
                // predefinedPlaces={[homePlace, workPlace]}

                debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
                // renderLeftButton={()  => <Image source={require('path/custom/left-icon')} />}
                renderRightButton={() => <View style={{ alignSelf: 'center', marginRight: 10 }}>
                    <TouchableOpacity onPress={() => {
                        // this.setSearchModalVisible(!this.state.searchModalVisible);
                        this.props.navigation.navigate('Search');
                    }}>
                        <Text >cancel</Text>
                    </TouchableOpacity>
                </View>}
            />
        );
    }


    render() {
        return (
            <View style={{ flex: 1, paddingTop: 20 }}>
                {this.GooglePlacesInput()}
                {this.showFilterModal()}

            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,

    },
    searchBarView: {
        // borderRadius: 4,
        // paddingHorizontal: 5,
        // backgroundColor: '#ffffff',
        backgroundColor: 'yellow',
        margin: 5,
        height: 40
    },
    buttonSetView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderRadius: 5,
        borderWidth: 1,
        marginTop: 5,
        marginBottom: 15,
        borderColor: '#424242'
    },
    propertTypeButtons: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 1,
        marginBottom: 5
    },
    propertyTypeMainView: {
        marginHorizontal: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 15
    },
    propertyTypeView: {
        alignItems: 'center',
        marginHorizontal: 10
    },
    propertyTypeText: {
        fontSize: 12
    },
    mainCategoryText: {
        fontWeight: '500',
        fontSize: 16
    },
    mainCategoryView: {
        marginHorizontal: 5,
        marginBottom: 10
    },
    subButtonView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    resetFilterButton: {
        backgroundColor: "white",
        margin: 12,
        padding: 5,
        borderRadius: 15,
        paddingHorizontal: 10
    },
    separatorView: {
        borderBottomWidth: 1,
        borderBottomColor: 'gray',
        marginVertical: 15
    },
    landSizeButtonText: {
        fontSize: 10
    }

});