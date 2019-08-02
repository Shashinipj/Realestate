import React, { Component } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import Ionicon from 'react-native-vector-icons/Ionicons';
import Meticon from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Accounting from 'accounting-js';


type Props = {
    data1: any;
    showFavouriteIcon: boolean;
    enableFavouriteIcon: boolean;
    favouriteMarked: boolean;


    onPressItem: (item: any) => void;
    onPressFavourite: (item: any, isMarked: boolean) => void;
};

export default class ListItem extends Component<Props> {

    static propTypes = {

    };

    static defaultProps = {
        favouriteMarked: false,
        showFavouriteIcon: false,
        enableFavouriteIcon: true,

        onPressItem: () => null,
        onPressFavourite: () => null
    };



    static navigationOptions = {
        header: null
    };


    constructor() {
        super();

        this.onPress_Item = this.onPress_Item.bind(this);
        this.onPress_Heart = this.onPress_Heart.bind(this);
    }


    onPress_Item() {
        const { data1 } = this.props;
        // this.props.navigation.navigate("ExpandedView", { PropertyData: data.item });

        if (this.props.onPressItem) {
            this.props.onPressItem(data1);
        }
    }

    onPress_Heart() {
        const { data1, favouriteMarked } = this.props;

        if (this.props.onPressFavourite) {
            this.props.onPressFavourite(data1, favouriteMarked);
        }
    }



    renderIcon_Heart() {
        const { data1, showFavouriteIcon, enableFavouriteIcon } = this.props;

        if (!showFavouriteIcon) {
            return null;
        }

        return (
            <TouchableOpacity
                disabled={!enableFavouriteIcon}
                onPress={this.onPress_Heart}

            // onPress={
            //     ((data) => {
            //     this.setState({
            //         propertyID: data.item.PropId
            //     });

            //     if (this.state.loggedUser) {
            //         this.renderModal();
            //     }
            //     else {
            //         this.pleaseLoginInAlert();
            //     }


            // }).bind(this, data)}
            >

                <Meticon
                    name="heart-outline"
                    size={25}
                    style={{ marginRight: 0 }}
                />
            </TouchableOpacity>
        );
    }

    render() {
        const { data1, enableFavouriteIcon } = this.props;


        return (
            <TouchableOpacity style={styles.listView} onPress={this.onPress_Item}>

                <Text style={{ marginVertical: 3, fontSize: 17, fontWeight: '600', marginBottom: 10 }}>Luxury House in Colombo</Text>


                <View style={{ flexDirection: 'row' }}>
                    <Image source={require('../assets/images/house.jpg')} style={[styles.imageTop, { marginRight: 10 }]} />

                    <View style={{ flex: 1 }}>

                        <View style={{ flexDirection: 'row' }}>

                            <View>
                                <Text style={{ fontSize: 20, fontWeight: '600', marginTop: 5, marginBottom: 5, color: '#F57C00' }}>
                                    {Accounting.formatMoney(this.props.data1.Price)}
                                </Text>
                                <Text style={{ fontSize: 15, color: 'gray', marginBottom: 5 }}>
                                    {this.props.data1.Address}
                                </Text>

                                <View style={{ flexDirection: 'row' }}>

                                    <Ionicon name="ios-bed" size={17} />
                                    <Text style={styles.subDetailsText}>{this.props.data1.Bedrooms}</Text>

                                    <Meticon name="shower" size={17} />
                                    <Text style={styles.subDetailsText}>{this.props.data1.Bathrooms}</Text>

                                    <Ionicon name="ios-car" size={17} />
                                    <Text style={styles.subDetailsText}>{this.props.data1.CarPark}</Text>

                                    <View style={{ borderLeftWidth: 1, marginHorizontal: 10 }}></View>

                                    <Text style={styles.subDetailsText}>{this.props.data1.PropType}</Text>
                                </View>
                            </View>

                            <View style={styles.sideButtons}>

                                {this.renderIcon_Heart()}

                            </View>

                        </View>
                    </View>

                </View>

            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    imageTop: {
        // marginTop: 40,
        // marginTop:10,
        width: 80,
        height: 80,
        resizeMode: 'cover'
    },
    subDetailsText: {
        marginLeft: 5,
        marginRight: 10,
        fontSize: 14
    },
    sideButtons: {
        alignItems: 'flex-end',
        position: 'absolute',
        right: -5,
        top: 15,
        flexDirection: 'row',
        flex: 1,
        // backgroundColor:'blue'
    },
    listView: {
        backgroundColor: 'white',
        // borderBottomWidth: 1,
        // paddingBottom: 10,
        marginBottom: 5,
        padding: 10,
        paddingHorizontal: 25
    },

});
