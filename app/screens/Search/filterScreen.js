import React, { Component } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, ScrollView, KeyboardAvoidingView, TextInput, LayoutAnimation, AsyncStorage } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Icon, ListItem } from 'react-native-elements';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import RangeSlider from 'rn-range-slider';
import Ionicon from 'react-native-vector-icons/Ionicons';
import Meticon from 'react-native-vector-icons/MaterialCommunityIcons';
import Accounting from 'accounting-js';

const PropertyTypes = {
    House: 1,
    Apartment: 2,
    Townhouse: 3,
    Villa: 4,
    All: -1
}

export default class FilterScreen extends Component {

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

    componentDidMount() {
        const { navigation } = this.props;
        const location = navigation.getParam('location');
        const viewport = navigation.getParam('viewport');

        this.setState({
            location,
            viewport
        });

        const filters = navigation.getParam('propData');
        if(filters){
            
        }
    }


    // setTextForSortFilter() {
    //     const no = this.state.sortOrder;

    //     if (no == -1) {
    //         return (
    //             <Text style={styles.sortText}>None</Text>
    //         )
    //     }
    //     else if (no == 1) {
    //         return (
    //             <Text style={styles.sortText}>Price (High - Low)</Text>
    //         )
    //     }
    //     else if (no == 2) {
    //         return (
    //             <Text style={styles.sortText}>Price (Low - High)</Text>
    //         )
    //     }
    //     else if (no == 3) {
    //         return (
    //             <Text style={styles.sortText}>Date (Newest - Oldest)</Text>
    //         )
    //     }
    //     else if (no == 4) {
    //         return (
    //             <Text style={styles.sortText}>Date (Oldest - Newest)</Text>
    //         )
    //     }
    // }

    Onpress_PropertyTypeFilter(type) {
        if (type == PropertyTypes.All) {
            this.setState({
                propertyType: null,

                isSelectedHouse: false,
                isSelectedApartment: false,
                isSelectedTownhouse: false,
                isSelectedVilla: false,
                isSelectAll: true
            }, () => {
                console.log("FILTER PROPTYPE: ", this.state.propertyType);
            });
        } else {
            if (!this.state.propertyType) {
                this.state.propertyType = {};
            }

            switch (type) {
                case PropertyTypes.House:
                    if (!this.state.isSelectedHouse) {
                        this.state.propertyType[type] = true;
                    } else {
                        delete this.state.propertyType[type];
                    }

                    this.state.isSelectedHouse = !this.state.isSelectedHouse;
                    break;

                case PropertyTypes.Apartment:
                    if (!this.state.isSelectedApartment) {
                        this.state.propertyType[type] = true;
                    } else {
                        delete this.state.propertyType[type];
                    }

                    this.state.isSelectedApartment = !this.state.isSelectedApartment;
                    // propertyType: 2
                    break;

                case PropertyTypes.Townhouse:
                    if (!this.state.isSelectedTownhouse) {
                        this.state.propertyType[type] = true;
                    } else {
                        delete this.state.propertyType[type];
                    }

                    this.state.isSelectedTownhouse = !this.state.isSelectedTownhouse;
                    // propertyType: 3
                    break;

                case PropertyTypes.Villa:
                    if (!this.state.isSelectedVilla) {
                        this.state.propertyType[type] = true;
                    } else {
                        delete this.state.propertyType[type];
                    }

                    this.state.isSelectedVilla = !this.state.isSelectedVilla;
                    // propertyType: 4
                    break;
            }

            let hasFilters = false;
            for (const key in this.state.propertyType) {
                hasFilters = true;
                break;
            }

            if (!hasFilters) {
                this.state.propertyType = null;
            }

            this.setState({
                isSelectAll: hasFilters ? false : true
            });

            console.log("FILTER PROPTYPE: ", this.state.propertyType);
        }
    }

    isAgreementTypeButtonPress(buttonNo) {
        this.setState({
            agreementType: buttonNo
        });
    }

    sortOrderSelected(sortType) {
        this.setState({
            sortOrder: sortType
        });
    }

    bedRoomsButtonPress(buttonNo) {
        this.setState({
            bedRooms: buttonNo
        });
    }

    bathRoomsButtonPress(buttonNo) {
        this.setState({
            bathRooms: buttonNo
        });
    }

    carSpaceButtonPress(buttonNo) {
        this.setState({
            carSpace: buttonNo
        });
    }

    OnPress_SortOrder() {

        LayoutAnimation.configureNext({
            update: {
                type: LayoutAnimation.Types.linear,
                duration: 200
            }
        });

        this.setState({
            sortOderTextViewVisible: !this.state.sortOderTextViewVisible
        })
    }

    getKeyWords(text) {

        this.setState({
            keyWords: text,
            keyWordsArr: text.split(",")
        });
        // console.log(this.state.keyWordsArr)
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

    // RenderSortOrderTextView() {
    //     if (this.state.sortOderTextViewVisible) {
    //         return (
    //             <TouchableOpacity onPress={() => {
    //                 this.RenderSortOrder();
    //                 this.OnPress_SortOrder();
    //             }}>
    //                 <View style={{ marginLeft: 10 }}>
    //                     {this.setTextForSortFilter()}
    //                 </View>
    //             </TouchableOpacity>
    //         );
    //     }

    //     return null;
    // }

    
    // RenderSortOrder() {

    //     if (!this.state.sortOderTextViewVisible) {
    //         return (
    //             <View style={{ marginLeft: 10 }}>
    //                 <TouchableOpacity
    //                     onPress={() => {
    //                         this.sortOrderSelected(-1);
    //                         this.OnPress_SortOrder();
    //                     }}
    //                 >
    //                     <Text style={
    //                         this.state.sortOrder == -1 ? styles.sortTextSelected : styles.sortText
    //                     }>None</Text>
    //                 </TouchableOpacity>

    //                 <TouchableOpacity
    //                     onPress={() => {
    //                         this.sortOrderSelected(1);
    //                         this.OnPress_SortOrder();
    //                     }}
    //                 >
    //                     <Text style={
    //                         this.state.sortOrder == 1 ? styles.sortTextSelected : styles.sortText
    //                     }>Price (High - Low)</Text>
    //                 </TouchableOpacity>

    //                 <TouchableOpacity
    //                     onPress={() => {
    //                         this.sortOrderSelected(2);
    //                         this.OnPress_SortOrder();
    //                     }}
    //                 >
    //                     <Text style={
    //                         this.state.sortOrder == 2 ? styles.sortTextSelected : styles.sortText
    //                     }>Price (Low - High)</Text>
    //                 </TouchableOpacity>

    //                 <TouchableOpacity
    //                     onPress={() => {
    //                         this.sortOrderSelected(3);
    //                         this.OnPress_SortOrder();
    //                     }}
    //                 >
    //                     <Text style={
    //                         this.state.sortOrder == 3 ? styles.sortTextSelected : styles.sortText
    //                     }>Date (Newest - Oldest)</Text>
    //                 </TouchableOpacity>

    //                 <TouchableOpacity
    //                     onPress={() => {
    //                         this.sortOrderSelected(4);
    //                         this.OnPress_SortOrder();
    //                     }}
    //                 >
    //                     <Text style={
    //                         this.state.sortOrder == 4 ? styles.sortTextSelected : styles.sortText
    //                     }>Date (Oldest - Newest)</Text>
    //                 </TouchableOpacity>

    //             </View>

    //         );
    //     }

    //     return null;
    // }

    render() {
        const { navigation } = this.props;
        const property = navigation.getParam('PropertyData');

        return (

            // <View style={{ flex: 1, paddingTop: 20 }}>
            <KeyboardAvoidingView style={styles.container} behavior={'padding'}>
                <View style={[styles.searchBarView, { flexDirection: 'row', width: "100%" }]}>

                    <TouchableWithoutFeedback style={{ padding: 5, flex: 1 }} onPress={() => {
                        this.props.navigation.navigate('SearchBarScreen');
                        // this.setFilterModalVisible();
                    }}>

                        <View style={{ height: 30, alignItems: 'center', flexDirection: 'row', width: "100%" }}>
                            <Icon
                                name="search"
                                type='MaterialIcons'
                                size={20}
                                color='gray'
                            />
                            <Text style={{ color: '#000000', marginLeft: 10, width: '75%' }}>{this.state.location}</Text>

                        </View>

                    </TouchableWithoutFeedback>

                    <TouchableOpacity style={{ justifyContent: 'center' }} onPress={() => {
                        // this.setFilterModalVisible();
                        this.props.navigation.navigate('Search');
                    }}>
                        <Text style={{ textAlign: 'right', fontSize: 12 }}>Cancel</Text>
                    </TouchableOpacity>

                </View>

                <View style={{
                    position: "absolute",
                    top: 30,
                    left: 0,
                    zIndex: 2,
                    width: "100%",
                    marginTop: 40,
                    backgroundColor: 'rgba(244, 244, 244, .97)'
                }}>

                    <View style={{ position: 'relative', alignSelf: 'flex-end' }}>
                        <TouchableOpacity style={styles.resetFilterButton}
                            onPress={() => this.ResetFilters()}
                        >

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
                        marginVertical: 15
                    }}>
                        <ScrollView horizontal={true} >
                            <View style={styles.propertyTypeView}>
                                <TouchableOpacity onPress={this.Onpress_PropertyTypeFilter.bind(this, PropertyTypes.All)}>
                                    <View style={
                                        this.state.isSelectAll ? [styles.propertTypeButtons, { backgroundColor: '#424242' }]
                                            : styles.propertTypeButtons
                                    }>
                                        <Text style={
                                            this.state.isSelectAll ? [{ color: 'white', fontSize: 16 }] : { fontSize: 16 }}>ALL</Text>

                                    </View>
                                </TouchableOpacity>
                                <Text>All Types</Text>
                            </View>

                            <View style={styles.propertyTypeView}>
                                <TouchableOpacity onPress={this.Onpress_PropertyTypeFilter.bind(this, PropertyTypes.House)}>
                                    <View style={
                                        this.state.isSelectedHouse ? [styles.propertTypeButtons, { backgroundColor: '#424242' }]
                                            : styles.propertTypeButtons
                                    }>

                                        <Meticon name='home-outline' size={30} color={this.state.isSelectedHouse ? 'white' : 'gray'} />

                                    </View>
                                </TouchableOpacity>
                                <Text>House</Text>
                            </View>

                            <View style={styles.propertyTypeView}>
                                <TouchableOpacity onPress={this.Onpress_PropertyTypeFilter.bind(this, PropertyTypes.Apartment)}>
                                    <View style={
                                        this.state.isSelectedApartment ? [styles.propertTypeButtons, { backgroundColor: '#424242' }]
                                            : styles.propertTypeButtons
                                    }>
                                        <Meticon name='home-outline' size={30} color={this.state.isSelectedApartment ? 'white' : 'gray'} />

                                    </View>
                                </TouchableOpacity>
                                <Text style={{ textAlign: 'center' }}>Apartment{"\n&"} house </Text>
                            </View>

                            <View style={styles.propertyTypeView}>
                                <TouchableOpacity onPress={this.Onpress_PropertyTypeFilter.bind(this, PropertyTypes.Townhouse)}>
                                    <View style={
                                        this.state.isSelectedTownhouse ? [styles.propertTypeButtons, { backgroundColor: '#424242' }]
                                            : styles.propertTypeButtons
                                    }>

                                        <Meticon name='home-outline' size={30} color={this.state.isSelectedTownhouse ? 'white' : 'gray'} />

                                    </View>
                                </TouchableOpacity>
                                <Text>Townhouse</Text>
                            </View>

                            <View style={styles.propertyTypeView}>
                                <TouchableOpacity onPress={this.Onpress_PropertyTypeFilter.bind(this, PropertyTypes.Villa)}>
                                    <View style={
                                        this.state.isSelectedVilla ? [styles.propertTypeButtons, { backgroundColor: '#424242' }]
                                            : styles.propertTypeButtons
                                    }>
                                        <Meticon name='home-outline' size={30} color={this.state.isSelectedVilla ? 'white' : 'gray'} />

                                    </View>
                                </TouchableOpacity>
                                <Text>Villa</Text>
                            </View>
                        </ScrollView>
                    </View>

                    <View style={styles.separatorView}></View>

                    {/* {this.renderPriceDetails()} */}
                    <View style={{ marginHorizontal: 5 }}>
                        <Text style={styles.mainCategoryText}>Price range</Text>
                        <View style={{ flexDirection: 'row', paddingHorizontal: 20, marginTop: 20 }}>
                            <View style={{ flex: 1, flexDirection: 'column' }}>
                                <Text style={{ fontSize: 12, marginBottom: 5 }}>From</Text>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={{ fontSize: 15, marginBottom: 5 }}>$</Text>
                                    <TextInput
                                        placeholder='Min'
                                        style={{ borderColor: 'black', backgroundColor: '#e0e0e0', width: 70, textAlign: 'center', marginLeft: 10 }}
                                        value={this.state.rangeLow}
                                        onChangeText={rangeLow => this.setState({ rangeLow })}
                                        keyboardType='numeric'
                                    />
                                </View>
                            </View>

                            <View style={{ flex: 1, flexDirection: 'column' }}>
                                <Text style={{ fontSize: 12, marginBottom: 5 }}>To</Text>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={{ fontSize: 15, marginBottom: 5 }}>$</Text>
                                    <TextInput
                                        placeholder='Max'
                                        style={{ borderColor: 'black', backgroundColor: '#e0e0e0', width: 70, textAlign: 'center', marginLeft: 10 }}
                                        value={this.state.rangeHigh}
                                        onChangeText={rangeHigh => this.setState({ rangeHigh })}
                                        keyboardType='numeric'
                                    />
                                </View>
                            </View>

                        </View>
                    </View>

                    <View style={styles.separatorView}></View>

                    <View style={[styles.mainCategoryView, { flexDirection: 'row' }]}>
                        <Ionicon name="ios-bed" size={20} />
                        <Text style={[styles.mainCategoryText, { marginLeft: 10 }]}>Bedrooms</Text>
                    </View>

                    <View style={{ marginBottom: 10 }}>
                        <View style={styles.buttonSetView}>
                            <TouchableOpacity
                                style={
                                    this.state.bedRooms == -1 ? { flex: 1, backgroundColor: '#424242' } : { flex: 1 }
                                }
                                onPress={() => this.bedRoomsButtonPress(-1)}
                            >

                                <View style={[styles.subButtonView, { borderRightWidth: 1, height: 30 }]}>
                                    <Text style={
                                        this.state.bedRooms == -1 ? [styles.propertyTypeText, { color: 'white' }] : styles.propertyTypeText}>All</Text>
                                </View>

                            </TouchableOpacity>

                            <TouchableOpacity
                                style={
                                    this.state.bedRooms == 0 ? { flex: 1, backgroundColor: '#424242' } : { flex: 1 }
                                }
                                onPress={() => this.bedRoomsButtonPress(0)}
                            >

                                <View style={styles.subButtonView}>
                                    <Text style={
                                        this.state.bedRooms == 0 ? { color: 'white', fontSize: 9 } : { fontSize: 9 }}>STUDIO+</Text>
                                </View>

                            </TouchableOpacity>

                            <TouchableOpacity
                                style={
                                    this.state.bedRooms == 1 ? { flex: 1, backgroundColor: '#424242' } : { flex: 1 }
                                }
                                onPress={() => this.bedRoomsButtonPress(1)}
                            >

                                <View style={[styles.subButtonView, { borderLeftWidth: 1 }]}>
                                    <Text style={
                                        this.state.bedRooms == 1 ? [styles.propertyTypeText, { color: 'white' }] : styles.propertyTypeText}>1+</Text>
                                </View>

                            </TouchableOpacity>

                            <TouchableOpacity
                                style={
                                    this.state.bedRooms == 2 ? { flex: 1, backgroundColor: '#424242' } : { flex: 1 }
                                }
                                onPress={() => this.bedRoomsButtonPress(2)}
                            >

                                <View style={[styles.subButtonView, { borderLeftWidth: 1 }]}>
                                    <Text style={
                                        this.state.bedRooms == 2 ? [styles.propertyTypeText, { color: 'white' }] : styles.propertyTypeText}>2+</Text>
                                </View>

                            </TouchableOpacity>

                            <TouchableOpacity
                                style={
                                    this.state.bedRooms == 3 ? { flex: 1, backgroundColor: '#424242' } : { flex: 1 }
                                }
                                onPress={() => this.bedRoomsButtonPress(3)}
                            >

                                <View style={[styles.subButtonView, { borderLeftWidth: 1 }]}>
                                    <Text style={
                                        this.state.bedRooms == 3 ? [styles.propertyTypeText, { color: 'white' }] : styles.propertyTypeText}>3+</Text>
                                </View>

                            </TouchableOpacity>

                            <TouchableOpacity
                                style={
                                    this.state.bedRooms == 4 ? { flex: 1, backgroundColor: '#424242' } : { flex: 1 }
                                }
                                onPress={() => this.bedRoomsButtonPress(4)}
                            >

                                <View style={[styles.subButtonView, { borderLeftWidth: 1 }]}>
                                    <Text style={
                                        this.state.bedRooms == 4 ? [styles.propertyTypeText, { color: 'white' }] : styles.propertyTypeText}>4+</Text>
                                </View>

                            </TouchableOpacity>

                            <TouchableOpacity
                                style={
                                    this.state.bedRooms == 5 ? { flex: 1, backgroundColor: '#424242' } : { flex: 1 }
                                }
                                onPress={() => this.bedRoomsButtonPress(5)}
                            >

                                <View style={[styles.subButtonView, { borderLeftWidth: 1 }]}>
                                    <Text style={
                                        this.state.bedRooms == 5 ? [styles.propertyTypeText, { color: 'white' }] : styles.propertyTypeText}>5+</Text>
                                </View>

                            </TouchableOpacity>

                        </View>

                    </View>

                    <View style={styles.separatorView}></View>

                    <View style={[styles.mainCategoryView, { flexDirection: 'row' }]}>
                        <Meticon name="shower" size={20} />
                        <Text style={[styles.mainCategoryText, { marginLeft: 10 }]}>Bathrooms</Text>
                    </View>


                    <View style={styles.buttonSetView}>

                        <TouchableOpacity
                            style={
                                this.state.bathRooms == -1 ? { flex: 1, backgroundColor: '#424242' } : { flex: 1 }
                            }
                            onPress={() => this.bathRoomsButtonPress(-1)}
                        >

                            <View style={[styles.subButtonView, { borderRightWidth: 1, height: 30 }]}>
                                <Text style={
                                    this.state.bathRooms == -1 ? [styles.propertyTypeText, { color: 'white' }] : styles.propertyTypeText}>All</Text>
                            </View>

                        </TouchableOpacity>

                        <TouchableOpacity
                            style={
                                this.state.bathRooms == 1 ? { flex: 1, backgroundColor: '#424242' } : { flex: 1 }
                            }
                            onPress={() => this.bathRoomsButtonPress(1)}
                        >

                            <View style={styles.subButtonView}>
                                <Text style={
                                    this.state.bathRooms == 1 ? [styles.propertyTypeText, { color: 'white' }] : styles.propertyTypeText}>1+</Text>
                            </View>

                        </TouchableOpacity>

                        <TouchableOpacity
                            style={
                                this.state.bathRooms == 2 ? { flex: 1, backgroundColor: '#424242' } : { flex: 1 }
                            }
                            onPress={() => this.bathRoomsButtonPress(2)}
                        >

                            <View style={[styles.subButtonView, { borderLeftWidth: 1 }]}>
                                <Text style={
                                    this.state.bathRooms == 2 ? [styles.propertyTypeText, { color: 'white' }] : styles.propertyTypeText}>2+</Text>
                            </View>

                        </TouchableOpacity>

                        <TouchableOpacity
                            style={
                                this.state.bathRooms == 3 ? { flex: 1, backgroundColor: '#424242' } : { flex: 1 }
                            }
                            onPress={() => this.bathRoomsButtonPress(3)}
                        >
                            <View style={[styles.subButtonView, { borderLeftWidth: 1 }]}>
                                <Text style={
                                    this.state.bathRooms == 3 ? [styles.propertyTypeText, { color: 'white' }] : styles.propertyTypeText}>3+</Text>
                            </View>

                        </TouchableOpacity>

                        <TouchableOpacity
                            style={
                                this.state.bathRooms == 4 ? { flex: 1, backgroundColor: '#424242' } : { flex: 1 }
                            }
                            onPress={() => this.bathRoomsButtonPress(4)}
                        >

                            <View style={[styles.subButtonView, { borderLeftWidth: 1 }]}>
                                <Text style={
                                    this.state.bathRooms == 4 ? [styles.propertyTypeText, { color: 'white' }] : styles.propertyTypeText}>4+</Text>
                            </View>

                        </TouchableOpacity>

                        <TouchableOpacity
                            style={
                                this.state.bathRooms == 5 ? { flex: 1, backgroundColor: '#424242' } : { flex: 1 }
                            }
                            onPress={() => this.bathRoomsButtonPress(5)}
                        >
                            <View style={[styles.subButtonView, { borderLeftWidth: 1 }]}>
                                <Text style={
                                    this.state.bathRooms == 5 ? [styles.propertyTypeText, { color: 'white' }] : styles.propertyTypeText}>5+</Text>
                            </View>

                        </TouchableOpacity>

                    </View>

                    <View style={styles.separatorView}></View>

                    <View style={[styles.mainCategoryView, { flexDirection: 'row' }]}>
                        <Ionicon name="ios-car" size={20} />
                        <Text style={[styles.mainCategoryText, { marginLeft: 10 }]}>Car Spaces</Text>
                    </View>

                    <View style={styles.buttonSetView}>

                        <TouchableOpacity
                            style={
                                this.state.carSpace == -1 ? { flex: 1, backgroundColor: '#424242' } : { flex: 1 }
                            }
                            onPress={() => this.carSpaceButtonPress(-1)}
                        >

                            <View style={[styles.subButtonView, { borderRightWidth: 1, height: 30 }]}>
                                <Text style={
                                    this.state.carSpace == -1 ? [styles.propertyTypeText, { color: 'white' }] : styles.propertyTypeText}>All</Text>
                            </View>

                        </TouchableOpacity>

                        <TouchableOpacity
                            style={
                                this.state.carSpace == 1 ? { flex: 1, backgroundColor: '#424242' } : { flex: 1 }
                            }
                            onPress={() => this.carSpaceButtonPress(1)}
                        >

                            <View style={styles.subButtonView}>
                                <Text style={
                                    this.state.carSpace == 1 ? [styles.propertyTypeText, { color: 'white' }] : styles.propertyTypeText}>1+</Text>
                            </View>

                        </TouchableOpacity>

                        <TouchableOpacity
                            style={
                                this.state.carSpace == 2 ? { flex: 1, backgroundColor: '#424242' } : { flex: 1 }
                            }
                            onPress={() => this.carSpaceButtonPress(2)}
                        >

                            <View style={[styles.subButtonView, { borderLeftWidth: 1 }]}>
                                <Text style={
                                    this.state.carSpace == 2 ? [styles.propertyTypeText, { color: 'white' }] : styles.propertyTypeText}>2+</Text>
                            </View>

                        </TouchableOpacity>

                        <TouchableOpacity
                            style={
                                this.state.carSpace == 3 ? { flex: 1, backgroundColor: '#424242' } : { flex: 1 }
                            }
                            onPress={() => this.carSpaceButtonPress(3)}
                        >
                            <View style={[styles.subButtonView, { borderLeftWidth: 1 }]}>
                                <Text style={
                                    this.state.carSpace == 3 ? [styles.propertyTypeText, { color: 'white' }] : styles.propertyTypeText}>3+</Text>
                            </View>

                        </TouchableOpacity>

                        <TouchableOpacity
                            style={
                                this.state.carSpace == 4 ? { flex: 1, backgroundColor: '#424242' } : { flex: 1 }
                            }
                            onPress={() => this.carSpaceButtonPress(4)}
                        >

                            <View style={[styles.subButtonView, { borderLeftWidth: 1 }]}>
                                <Text style={
                                    this.state.carSpace == 4 ? [styles.propertyTypeText, { color: 'white' }] : styles.propertyTypeText}>4+</Text>
                            </View>

                        </TouchableOpacity>

                        <TouchableOpacity
                            style={
                                this.state.carSpace == 5 ? { flex: 1, backgroundColor: '#424242' } : { flex: 1 }
                            }
                            onPress={() => this.carSpaceButtonPress(5)}
                        >
                            <View style={[styles.subButtonView, { borderLeftWidth: 1 }]}>
                                <Text style={
                                    this.state.carSpace == 5 ? [styles.propertyTypeText, { color: 'white' }] : styles.propertyTypeText}>5+</Text>
                            </View>

                        </TouchableOpacity>

                    </View>

                    <View style={styles.separatorView}></View>

                    <View style={styles.mainCategoryView}>
                        <Text style={styles.mainCategoryText}>Land size (Square Feet)</Text>
                    </View>
                    <View style={{ justifyContent: 'center', flexDirection: 'row', marginVertical: 20 }}>
                        <Text style={{ fontSize: 15 }}>At leaset </Text>
                        <TextInput
                            style={{ borderColor: 'black', borderBottomWidth: 1, width: 70, textAlign: 'center' }}
                            value={this.state.landSize + ''}
                            onChangeText={landSize => this.setState({ landSize })}
                            keyboardType='numeric'
                        />
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ fontSize: 15 }}>m</Text>
                            <Text style={{ fontSize: 10, lineHeight: 12 }}>2</Text>
                        </View>

                    </View>

                    <View style={styles.separatorView}></View>

                    <View style={styles.mainCategoryView}>
                        <Text style={styles.mainCategoryText}>Keywords</Text>
                    </View>

                    <TextInput
                        style={{ marginHorizontal: 5 }}
                        placeholder='e.g Pool, garage'
                        onChangeText={
                            (keyWords) => this.getKeyWords(keyWords)
                        }
                        value={this.state.keyWords}
                    />

                    <View style={styles.separatorView}></View>
{/* 
                    <View style={styles.mainCategoryView}>
                        <Text style={styles.mainCategoryText}>Sort order</Text>
                    </View>

                    {this.RenderSortOrderTextView()}
                    {this.RenderSortOrder()}

                    <View style={styles.separatorView}></View> */}

                </ScrollView>
                <View style={{ height: 50, backgroundColor: 'rgba(244, 244, 244, .97)', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => {
                        // this.setFilterModalVisible();
                        this.props.navigation.navigate('SearchResultView', {
                            data: {
                                ...this.state
                            }
                        });
                        console.log('search button clicked');
                    }}>
                        <View style={{
                            backgroundColor: '#49141E', marginVertical: 7, flex: 1, marginHorizontal: 10, width: 300,
                            borderRadius: 7, alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Icon
                                name="search"
                                type='MaterialIcons'
                                size={30}
                                color='white'
                            />
                        </View>
                    </TouchableOpacity>

                </View>
            {/* </View> */}
            </KeyboardAvoidingView>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor:'red',
        paddingTop: 20
    },
    searchBarView: {
        marginTop: 15,
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
        marginBottom: 5,
        alignItems: 'center',
        justifyContent: 'center'
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
    },
    sortTextSelected: {
        color: '#49141E',
        marginVertical: 5
    },
    sortText: {
        color: '#616161',
        marginVertical: 5
    },
    priceDetailView: {
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center'
    },
    displayPriceRangeText: {
        textAlign: 'center',
        fontSize: 15
    }

});
