import React, { Component } from 'react';
import { createStackNavigator, createBottomTabNavigator, createAppContainer, createSwitchNavigator } from 'react-navigation';
import CollectionScreen from '../screens/Collection/collectionScreen';
import SearchScreen from '../screens/Search/searchScreen';
import NotificationScreen from '../screens/Notifications/notificationScreen';
import ProfileScreen from '../screens/Profile/profileScreen';
import TabNavigatorScreen from '../tabNavigator/tabNavigatorScreen';
import { Icon } from 'react-native-elements';
import Icon2 from 'react-native-vector-icons/FontAwesome';
import Login from '../screens/login/loginScreen'



const searchStack = createStackNavigator({
    Search: {
        screen: SearchScreen,
    }

});

const collectionStack = createStackNavigator({
    Collections: {
        screen: CollectionScreen
    },

});

const notificationStack = createStackNavigator({
    Notifications: {
        screen: NotificationScreen
    },

});

const profileStack = createStackNavigator({
    Profile: {
        screen: ProfileScreen
    },

});

const loginStack = createStackNavigator({
    Login: {
        screen: Login
    },

});


const TabNavigator = createBottomTabNavigator({

    Search: {
        screen: searchStack,
        navigationOptions: {
            // tabBarLabel:"Home Page",
            tabBarIcon: ({ tintColor }) => (
                <Icon
                    name="search"
                    type="Feather"
                    size={25}
                    color='gray' />
            )
        },
    },
    Collections: {
        screen: collectionStack,

        navigationOptions: {
            // tabBarLabel:"Home Page",
            tabBarIcon: ({ tintColor }) => (
                <Icon
                    name="collections"
                    type='MaterialIcons'
                    size={25}
                    color='gray' />
            )
        },
    },
    Notifications: {
        screen: notificationStack,

        navigationOptions: {
            // tabBarLabel:"Home Page",
            tabBarIcon: ({ tintColor }) => (
                <Icon
                    name="notifications"
                    type='MaterialIcons'
                    size={25}
                    color='gray'
                />
            )
        },
    },
    Me: {
        screen: profileStack,

        navigationOptions: {
            // tabBarLabel:"Home Page",
            tabBarIcon: ({ tintColor }) => (
                <Icon2
                    name="user-circle-o"
                    type='FontAwesome'
                    size={25}
                    color='gray'
                />
            )
        },
    },

});

const mainStack = createStackNavigator(
    {
        App: TabNavigator,
        login: loginStack
    },
    {
        headerMode: 'none',
        navigationOptions: {
            headerVisible: false,
        }
    }
);

const AppContainer = createAppContainer(mainStack);

export default createAppContainer(AppContainer)
