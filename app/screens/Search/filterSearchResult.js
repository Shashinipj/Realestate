import React, { Component } from 'react';
import { View, StyleSheet, Text, TextInputProps } from 'react-native';

import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { TouchableOpacity, ScrollView } from 'react-native-gesture-handler';

export default class FilterSearchResults extends Component {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);

        this.state = {
            search: '',
            defaultLocation: ''

        };

    }

    componentDidMount() {
        const { navigation } = this.props;
        const id = navigation.getParam('location');

        this.setState({
            defaultLocation: id.description,
        },
            () => {
                console.log(id.description);
                console.log(this.state.defaultLocation);
            });

    }

    GooglePlacesInput = () => {

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
                    // this.props.navigation.navigate('FilterSearchResults');
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
            // renderRightButton={() => <Text>Custom text after the input</Text>}
            />
        );
    }


    render() {
        return (
            <View style={{ backgroundColor: 'red', flex: 1 }}>
                <View style={styles.searchBarView}>
                    {this.GooglePlacesInput()}
                </View>

                <View style={{ backgroundColor: 'blue', marginTop: 40 }}>
                    <View style={{ position: 'relative', alignSelf: 'flex-end'}}>
                        <TouchableOpacity style={{ backgroundColor: "green", margin: 12, padding: 5, borderRadius:15, paddingHorizontal: 10  }}>

                            <Text style={{ fontSize: 10 }}>RESET FILTERS</Text>

                        </TouchableOpacity>
                    </View>
                </View>
                <ScrollView>
                    <View style={{margin: 10, flexDirection:'row', justifyContent:'space-between'}}>
                        <View style={{borderWidth:1, backgroundColor:'yellow', marginLeft: 10, flex:1}}></View>
                        <View style={{borderWidth:1, backgroundColor:'green', marginLeft: 10, flex:1}}></View>
                        <View style={{borderWidth:1, backgroundColor:'blue', marginLeft: 10, flex:1}}></View>

                    </View>
                </ScrollView>
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
        backgroundColor: '#ffffff',
        margin: 5
    },
});