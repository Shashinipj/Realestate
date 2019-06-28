import React, { Component } from 'react';
import { View, StyleSheet, TextInput, TextInputProps, Image, Text, TouchableOpacity, Switch } from 'react-native';
import { SearchBar } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';
import { Icon } from 'react-native-elements';
// import Switch from "react-switch";

export default class SearchScreen extends Component {

    static navigationOptions = {
        header: null,
        // headerTitleStyle: { textAlign: 'center', alignSelf: 'center' },
        // headerStyle: {
        //   backgroundColor: 'white',
        // },
    };

    arrayholder = [];

    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);

        this.state = {
            checked: true,
            dataSource: [],
            search: '',
        };
    }

    updateSearch = search => {
        this.setState({ search });
    };

    handleChange(checked) {
        this.setState({ checked });
    }


    // SearchFilterFunction(text) {
    //     //passing the inserted text in textinput
    //     const newData = this.arrayholder.filter(function (item) {
    //         //applying filter for the inserted text in search bar
    //         const itemData = item.trackName ? item.trackName.toUpperCase() : ''.toUpperCase();
    //         const textData = text.toUpperCase();
    //         return itemData.indexOf(textData) > -1;
    //     });
    //     this.setState({
    //         //setting the filtered newData on datasource
    //         //After setting the data it will automatically re-render the view
    //         dataSource: newData,
    //         search: text,
    //     });
    // }


    onPress_LoginButton() {
        this.props.navigation.navigate('Login');
    }

    render() {

        const { search } = this.state;

        return (
            <View style={styles.container}>
                <ScrollView>

                    <View style={{ paddingTop: 20, padding: 5 }}>
                        <View style={styles.searchBarView}>

                            <SearchBar
                                // round
                                // style={{borderRadius:4}}
                                placeholder="Search suburb, postcode, state"
                                onChangeText={this.updateSearch}
                                value={search}
                                lightTheme='true'
                                containerStyle={{
                                    height: 50,
                                    backgroundColor: '#ffffff',
                                    // borderRadius:4
                                    // borderTopWidth: 0,
                                }}
                                inputContainerStyle={{
                                    height: 30,
                                    backgroundColor: '#ffffff'
                                }}
                                inputStyle={{
                                    fontSize: 14,
                                }}
                            // onChangeText={text => this.SearchFilterFunction(text)}
                            // onClear={text => this.SearchFilterFunction('')}
                            />
                        </View>

                        <Image source={require('../../assets/images/search-home.jpg')} style={styles.image} />

                    </View>


                    <View style={styles.bottomContainer}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ fontSize: 12, color: 'gray', marginVertical: 10 }}> Saved Searches</Text>
                            <Switch
                                style={{ position: 'absolute', right: 5 }}
                                onChange={this.handleChange}
                                checked={this.state.checked}
                                height={10}
                                width={48}

                            />
                            {/* <Switch style={{ position: 'absolute', right: 5 }}></Switch> */}
                            {/* <Switch></Switch> */}
                        </View>

                        <View style={styles.textContainer}>

                            <Text style={{ fontSize: 18, fontWeight: 400 }}>Never miss a property again</Text>

                            <View style={{ marginVertical: 20 }}>
                                <Text style={{ textAlign: 'center', color: 'gray', fontSize: 13 }}>
                                    Save your searches and be notified when {"\n"}new matching properties hit the market
                                </Text>
                            </View>

                            <TouchableOpacity style={styles.joinButton} onPress={this.onPress_LoginButton.bind(this)}>
                                <Text style={{ textAlign: 'center', color: '#ffffff' }}>Join</Text>

                            </TouchableOpacity>

                        </View>

                    </View>

                </ScrollView>


                <TouchableOpacity style={styles.footer}>

                    <Image source={require('../../assets/icons/marker.png')} style={styles.homeIcon} />

                    <View style={{ flexDirection: 'column', marginVertical: 5 }}>
                        <Text style={{ fontSize: 13, fontWeight: 400 }}>Track your home</Text>
                        <Text style={{ fontSize: 12, color: "gray" }}>Track its value against local sales</Text>
                    </View>

                    <View style={{ position: 'absolute', right: 5 }}>
                        <Icon
                            name="chevron-right"
                            // type="FontAwesome"
                            size={25}
                            color='gray'
                        />
                    </View>

                </TouchableOpacity>

            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E0E0E0',
        // backgroundColor: 'blue',
        // paddingTop: 10
    },
    image: {
        // flex: 1,
        width: '100%',
        height: 300,
        marginTop: 5,
        borderRadius: 5,
    },
    bottomContainer: {
        backgroundColor: "#ffffff",
        padding: 6
    },
    textContainer: {
        // backgroundColor: 'gray',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15
    },
    homeIcon: {
        height: 25,
        width: 25,
        margin: 10
    },
    joinButton: {
        backgroundColor: '#C62828',
        width: '40%',
        height: 30,
        borderRadius: 4,
        justifyContent: 'center',
        marginVertical: 10
    },
    footer: {
        backgroundColor: 'white',
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 0.5,
        borderColor: '#E0E0E0'
    },
    searchBarView: {
        borderRadius: 4,
        paddingHorizontal: 5,
        backgroundColor: '#ffffff'
    }

});