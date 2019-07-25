import React, { Component } from 'react';
import { View, StyleSheet, Text, FlatList, Alert } from 'react-native';
import { db } from '../../Database/db';
import firebase from 'react-native-firebase';
import { TouchableOpacity } from 'react-native-gesture-handler';

type CollectionItem = {
    name: string;
    propIds: {
        [propId: string]: boolean;
    };
}

export default class CollectionScreen extends Component {

    static navigationOptions = {
        title: 'Collections',
        headerTitleStyle: { textAlign: 'center', alignSelf: 'center' },
        headerStyle: {
            backgroundColor: 'white',
        },

    };

    constructor(props) {
        super(props);
        this.state = {
            collectionName: '',

            /**
             * @type {CollectionItem[]}
             */
            collectionList: [],
            loggedUser: ''
        };
    }

    componentDidMount() {

        firebase.auth().onAuthStateChanged(user => {
            this.fetchUser(user);

            console.log("USER: " + user);
        });
    }

    fetchUser(user) {
        if (user) {
            this.getCollectionNames(user);
            this.setState({
                loggedUser: user.uid
            });
        }
        else {
            this.setState({
                loggedUser: ''
            });
        }
    }

    pleaseLoginInAlert() {

        Alert.alert(
            'Please Login',
            'Do you want to login?',
            [
                {
                    text: 'Home', onPress: () => {
                        this.props.navigation.navigate('Search');
                    }
                },
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
            ],
            { cancelable: true },
        );
    }

    getCollectionNames(user) {
        const currentUser = firebase.auth().currentUser;

        if (user) {
            db.ref('Collections/').child(currentUser.uid).on('value', (snapshot) => {
                const collections = snapshot.val();
                console.log(collections);

                /**
                 * @type {CollectionItem[]}
                 */
                const arrCont = [];
                for (const collectionId in collections) {
                    const coll = collections[collectionId];
                    console.log(collectionId);
                    arrCont.push({
                        name: collectionId,
                        propIds: coll
                    });
                    // console.log(this.state.collectionList);
                }

                this.setState({
                    collectionList: arrCont
                });
            });

        }
    }

    /**
     * 
     * @param {{ item: CollectionItem; index: number; }} param0
     */
    renderItem({ item, index }) {

        return (
            <TouchableOpacity onPress={() => {
                this.props.navigation.navigate("CollectionDetailScreen", { CollectionData: item });
            }}>

                <View style={{ backgroundColor: '#e0e0e0', margin: 5, padding: 10 }}>
                    <Text style={{ fontWeight: '500' }}> {item.name}</Text>
                </View>

            </TouchableOpacity>
        );
    }

    renderCollectionView() {
        if (!this.state.loggedUser) {
            return (
                <View style={styles.buttonContainer}>
                    <Text style={{ textAlign: 'center', fontWeight: '400', fontSize: 15 }}>
                        Please Login to see your collections
            </Text>

                    <View style={{ justifyContent: 'center', alignContent: 'center' }}>
                        <TouchableOpacity onPress={() => {
                            this.props.navigation.navigate('Search');
                        }}>
                            <View style={styles.buttons}>
                                <Text style={styles.buttonText}>
                                    Home
                    </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                </View>
            );
        }

        else {
            return (
                <View style={{ flex: 1 }}>
                    <FlatList
                        data={this.state.collectionList}
                        extraData={this.state}
                        renderItem={item => this.renderItem(item)}
                        keyExtractor={(item, index) => {
                            return "" + index;
                        }}
                    />

                </View>
            );
        }
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                {this.renderCollectionView()}

            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3d500'
    },
    buttons: {
        backgroundColor: '#f3d500',
        borderRadius: 4,
        paddingVertical: 7,
        margin: 10,
        paddingHorizontal: 15,
        width: '25%',
        alignSelf: 'center'
    },
    buttonContainer: {
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        color: '#49141E',
        fontWeight: '500',
        textAlign: 'center'
    }
})