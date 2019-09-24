import React, { Component } from 'react';
import { View, Text, TouchableOpacity, AsyncStorage } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import RangeSlider from 'rn-range-slider';

export default class SearchBarScreen extends Component {

    static navigationOptions = {
        header: null,
    };

    /**
     * @type {RangeSlider}
     */
    _rangeSlider = null;

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
            isSelectAll: true,

            propertyType: null,
            location: '',

            bedRooms: -1,
            bathRooms: -1,
            carSpace: -1,

            rangeLow: 0,
            rangeHigh: 0,

            landSize: 0,
            keyWords: '',
            keyWordsArr: [],

            sortOderTextViewVisible: true,
            sortOrder: -1,

            loading: true,
            recentSearchList: [],
            viewport: null
        };
    }

    async componentDidMount() {
        this.getMyValue();
    }

    ResetFilters() {

        this.setState({
            agreementType: 1,

            isSelectedHouse: false,
            isSelectedApartment: false,
            isSelectedTownhouse: false,
            isSelectedVilla: false,
            isSelectAll: true,

            propertyType: null,
            bedRooms: -1,
            bathRooms: -1,
            carSpace: -1,

            rangeLow: 0,
            rangeHigh: 0,

            landSize: 0,
            keyWords: '',
            keyWordsArr: [],

            sortOderTextViewVisible: true,
            sortOrder: -1,
        });

        if (this._rangeSlider) {
            this._rangeSlider.setHighValue(10000000);
            this._rangeSlider.setLowValue(100000);
        }
    }

    async setValue(location, details) {

        try {
            // console.log('location');
            // console.log(location.description);
            const value = await AsyncStorage.getItem('@LocationSearchList')

            let locationFound = false;

            // let arrayLocation = JSON.parse(value);

            /**
             * @type {Array}
             */
            let arr = [];
            if (value) {
                try {
                    arr = JSON.parse(value);
                } catch (error) {
                    console.log(error);
                }
            }

            for (let i = 0; i < arr.length; i++) {
                const obj = arr[i];

                // console.log('loc.description');
                // console.log(obj.description);
                console.log('location.name', location);
                console.log('obj.description', obj);

                if (location.description == obj.description) {
                    locationFound = true;
                    arr.splice(i, 1);
                    break
                }
            }

            if (arr.length >= 4) {
                arr.splice(arr.length - 1, 1);
                console.log(arr.length);

            }
            // arr.splice(arr.length - 1, 1);
            // console.log(arr.length);
            // }

            // arr = [
            //     location,
            //     ...arr
            // ];
            arr = [
                {
                    description: location.description,
                    geometry: details.geometry
                },
                ...arr
            ];

            this.state.recentSearchList = arr;
            console.log('this.state.recentSearchList', this.state.recentSearchList);

            // for (const i in this.state.recentSearchList) {
            //     const loc = this.state.recentSearchList[i];
            //     console.log('loc.name', loc.name);
            // }

            await AsyncStorage.setItem('@LocationSearchList', JSON.stringify(arr));

        } catch (e) {
            console.log(e);
        }
    }

    async getMyValue() {

        try {
            const value = await AsyncStorage.getItem('@LocationSearchList')
            console.log('value', value);
            if (value) {
                this.setState({
                    recentSearchList: JSON.parse(value)
                });
            }

        } catch (e) {
            console.log(e);
        }

        console.log('Done')
        console.log(this.state.recentSearchList.length);
    }


    GooglePlacesInput() {

        const { search } = this.state;
        let locationTempList = [];

        return (
            <GooglePlacesAutocomplete
                placeholder='Search suburb, postcode, state'
                minLength={2} // minimum length of text to search
                autoFocus={true}
                value={search}
                returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
                listViewDisplayed='true'    // true/false/undefined
                fetchDetails={true}
                // renderDescription={row => row.description} // custom description render
                renderDescription={row => row.description || row.formatted_address || row.name}
                // renderDescription={row =>  row.formatted_address}
                onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true

                    console.log(data, details);
                    console.log(data.description);
                    // console.log('details.geometry.viewport',details.geometry.viewport);
                    // console.log('details', details.geometry.location.lat);
                    // console.log('details', details.geometry.location.lng);
                    // console.log('ViewPortnortheast', details.geometry.viewport.northeast);
                    // console.log('ViewPortsouthwest', details.geometry.viewport.southwest);

                    // this.setFilterModalVisible();
                    this.setState({
                        location: data.description,
                        viewport: details.geometry.viewport
                    });
                    this.setValue(data, details);
                    this.ResetFilters();

                    // this.props.navigation.navigate('FilterScreen', {location: data.description});
                    this.props.navigation.navigate('FilterScreen', { location: data.description, viewport: details.geometry.viewport });
                }}

                getDefaultValue={() => ''}

                query={{
                    // available options: https://developers.google.com/places/web-service/autocomplete
                    key: 'AIzaSyBMtFjgIpHg7Eu44iugytPzRYoG_1V7pOA',
                    language: 'en', // language of the results
                    types: '(cities)', // default: 'geocode'
                    // region: "LK",
                    // components: 'country:lk'
                    // region: "Canada",
                    // components: 'country:ca'
                }}

                styles={{
                    textInputContainer: {
                        width: '100%',
                        backgroundColor: '#EEEEEE',
                    },
                    description: {
                        fontWeight: 'bold',
                    },
                    predefinedPlacesDescription: {
                        color: '#757575'
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
                    rankby: 'distance'
                }}

                filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities
                // predefinedPlaces={[homePlace, workPlace]}
                predefinedPlaces={this.state.recentSearchList}

                debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
                // renderLeftButton={()  => <Image source={require('path/custom/left-icon')} />}
                renderRightButton={() => <View style={{ alignSelf: 'center', marginRight: 10 }}>
                    <TouchableOpacity onPress={() => {
                        // this.setSearchModalVisible(!this.state.searchModalVisible);
                        this.props.navigation.navigate('Search');
                    }}>
                        <Text>cancel</Text>
                    </TouchableOpacity>
                </View>}
            />
        );
    }

    render() {
        return (
            <View style={{ flex: 1, paddingTop: 40 }}>
                {this.GooglePlacesInput()}
                {/* {this.showFilterModal()} */}
            </View>
        );
    }
}
