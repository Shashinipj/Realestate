import React, { Component } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import Ionicon from 'react-native-vector-icons/Ionicons';
import Meticon from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Accounting from 'accounting-js';
import { db } from '../Database/db';
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view';


type Props = {
    data1: any;

    renderFavouriteIcon: (state, props) => any;

    showFavouriteIcon: boolean;
    enableFavouriteIcon: boolean;
    favouriteMarked: boolean;

    showDeleteIcon: boolean;
    enableDeleteIcon: boolean;
    deleted: boolean;

    showPauseIcon: boolean;
    enablePauseIcon: boolean;
    paused: boolean;
    show: boolean;

    showEditIcon: boolean;
    enableEditIcon: boolean;
    edited: boolean;

    onPressItem: (item: any) => void;
    onPressFavourite: (item: any, isMarked: boolean) => void;
    onPressRemoveFavourite: (item: any) => void;
    onPressDelete: (item: any, isMarked: boolean) => void;
    onPressPause: (item: any, isMarked: boolean) => void;
    onPressShow: (item: any, isMarked: boolean) => void;
    onPressEdit: (item: any, isMarked: boolean) => void;
};

export default class ListItem extends Component<Props> {

    static propTypes = {

    };

    static defaultProps = {
        favouriteMarked: false,
        showFavouriteIcon: false,
        enableFavouriteIcon: true,

        showDeleteIcon: false,
        enableDeleteIcon: true,
        deleted: false,

        showPauseIcon: false,
        enablePauseIcon: true,
        paused: false,
        show: false,

        showEditIcon: false,
        enableEditIcon: true,
        edited: false,

        onPressItem: () => null,
        onPressFavourite: () => null,
        onPressRemoveFavourite: () => null,
        onPressDelete: () => null,
        onPressPause: () => null,
        onPressShow: () => null,
        onPressEdit: () => null
    };

    static navigationOptions = {
        header: null
    };

    constructor() {
        super();

        this.onPress_Item = this.onPress_Item.bind(this);
        this.onPress_Heart = this.onPress_Heart.bind(this);
        this.onPress_ColoredHeart = this.onPress_ColoredHeart.bind(this);
        this.onPress_Delete = this.onPress_Delete.bind(this);
        this.onPress_Pause = this.onPress_Pause.bind(this);
        this.onPress_Show = this.onPress_Show.bind(this);
        this.onPress_Edit = this.onPress_Edit.bind(this);
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

    onPress_ColoredHeart() {
        const { data1 } = this.props;

        if (this.props.onPressRemoveFavourite) {
            this.props.onPressRemoveFavourite(data1);
        }
    }

    onPress_Delete() {
        const { data1, deleted } = this.props;

        if (this.props.onPressDelete) {
            this.props.onPressDelete(data1, deleted);
        }
    }

    onPress_Pause() {
        const { data1, paused } = this.props;

        if (this.props.onPressPause) {
            this.props.onPressPause(data1, paused);
        }
    }

    onPress_Show() {
        const { data1, show } = this.props;

        if (this.props.onPressShow) {
            this.props.onPressShow(data1, show);
        }
    }

    onPress_Edit() {
        const { data1, edit } = this.props;

        if (this.props.onPressEdit) {
            this.props.onPressEdit(data1, edit);
        }
    }

    renderIcon_Heart() {
        const { data1, showFavouriteIcon, enableFavouriteIcon, favouriteMarked } = this.props;

        if (!showFavouriteIcon) {
            return null;
        }

        // if () {

        // }

        if (!favouriteMarked) {
            return (
                <TouchableOpacity
                    disabled={!enableFavouriteIcon}
                    onPress={this.onPress_Heart}
                    style={{ padding: 3 }}
                >
                    <Meticon
                        name="heart-outline"
                        size={25}
                        style={{ marginRight: 0 }}
                    />
                </TouchableOpacity>
            );
        }

        else {
            return (
                <TouchableOpacity
                    disabled={!enableFavouriteIcon}
                    onPress={this.onPress_ColoredHeart}
                    style={{ padding: 3 }}
                >

                    <Meticon
                        name="heart"
                        size={25}
                        style={{ marginRight: 0 }}
                    />
                </TouchableOpacity>
            );
        }
    }

    renderIcon_Delete() {
        const { data1, enableDeleteIcon, showDeleteIcon } = this.props;

        if (!showDeleteIcon) {
            return null;
        }

        return (
            <TouchableOpacity
                disabled={!enableDeleteIcon}
                onPress={this.onPress_Delete}
                style={{ padding: 3 }}
            >

                <AntDesign
                    name="delete"
                    size={20}
                    style={{ marginRight: 0 }}
                />

                {/* <Text style={{}}>delete</Text> */}
            </TouchableOpacity>

        );
    }

    renderIcon_Pause() {
        const { data1, enablePauseIcon, showPauseIcon } = this.props;

        if (!showPauseIcon) {
            return null;
        }

        if (enablePauseIcon) {
            return (
                <TouchableOpacity
                    disabled={!enablePauseIcon}
                    onPress={this.onPress_Pause}
                    style={{ padding: 3 }}
                >

                    <AntDesign
                        name="pause"
                        size={20}
                        style={{ marginRight: 0 }}
                    />

                    {/* <Text style={{}}>pause</Text> */}
                </TouchableOpacity>
            );
        }

        else {
            return (
                <TouchableOpacity
                    // disabled={!enablePauseIcon}
                    onPress={this.onPress_Show}
                    style={{ padding: 3 }}
                >
                    <AntDesign
                        name="caretright"
                        size={20}
                        style={{ marginRight: 0 }}
                    />
                    {/* <Text style={{}}>Play</Text> */}
                </TouchableOpacity>
            );
        }
    }

    renderIcon_Edit() {
        const { data1, enableEditIcon, showEditIcon } = this.props;

        if (!showEditIcon) {
            return null;
        }

        return (
            <TouchableOpacity
                // disabled={!enableEditIcon}
                onPress={this.onPress_Edit}
                style={{ padding: 3 }}
            >
                <AntDesign
                    name="edit"
                    size={20}
                    style={{ marginRight: 0 }}
                />

                {/* <Text style={{}}>Edit</Text> */}
            </TouchableOpacity>
        );
    }

    render() {
        const { data1, enableFavouriteIcon } = this.props;


        return (
            <View style={styles.listView} 
            // onPress={this.onPress_Item}
            >
                <SwipeRow
                    // leftOpenValue={75}
                    rightOpenValue={-75}
                    disableRightSwipe={true}
                    // closeOnRowPress={true}
                >

                    <View style={styles.standaloneRowBack}>
                    
                            {this.renderIcon_Pause()}
                            {this.renderIcon_Edit()}
                            {this.renderIcon_Delete()}

                    </View>

                    <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5' }}  onPress={this.onPress_Item}>
                        <Text style={{ marginVertical: 3, fontSize: 17, fontWeight: '600', marginBottom: 10, alignSelf:'flex-start'}}>{this.props.data1.Title}</Text>

                        <View style={{ flexDirection: 'row', }}>
                            {/* <Image source={require('../assets/images/house.jpg')} style={[styles.imageTop, { marginRight: 10 }]} /> */}
                            {
                                (!this.props.data1.images) ?
                                    <Image source={require('../assets/images/house.jpg')} style={[styles.imageTop, { marginRight: 10 }]} /> :

                                    <Image source={this.props.data1.images} style={[styles.imageTop, { marginRight: 10 }]} />
                            }

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

                                            {/* <View style={{ borderLeftWidth: 1, marginHorizontal: 10 }}></View> */}

                                            {/* <Text style={styles.subDetailsText}>{this.props.data1.PropType}</Text> */}
                                        </View>
                                    </View>

                                    <View style={styles.sideButtons}>

                                        {this.renderIcon_Heart()}
                                        {/* {this.renderIcon_Pause()}
                                        {this.renderIcon_Edit()}
                                        {this.renderIcon_Delete()} */}

                                    </View>

                                </View>
                            </View>

                        </View>
                    </TouchableOpacity>
                    <View style={{ borderBottomColor: '#757575', borderBottomWidth: 1, width: '100%', marginTop: 15 }}></View>
                    {/* </View> */}
                </SwipeRow>
            </View>
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
        // top: 15,
        // flexDirection: 'row',
        flex: 1,
        // backgroundColor:'blue'
    },
    listView: {
        backgroundColor: 'white',
        // borderBottomWidth: 1,
        // paddingBottom: 10,
        marginBottom: 0,
        padding: 5,
        paddingHorizontal: 10
    },
    standaloneRowBack: {
        alignItems: 'flex-end',
        backgroundColor: '#bdbdbd',
        flex: 1,
        // flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15
    },
    backTextWhite: {
        color: '#FFF'
    },

});
