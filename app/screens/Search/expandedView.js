import React, { Component } from 'react';
import { View, StyleSheet, Text, TextInputProps, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Icon } from 'react-native-elements';

export default class ExpandedView extends Component {


    render() {
        const { navigation } = this.props;
        const id = navigation.getParam('PropertyData');
        return (
            <View style={{ flex: 1 }}>

                <ScrollView>
                    <Text>
                        {id.Price}
                    </Text>
                    <Text>
                        {id.Owner}
                    </Text>
                </ScrollView>

                <View style={{ height: 50, backgroundColor: 'rgba(244, 244, 244, .97)', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <TouchableOpacity onPress={() => {
                        // this.setFilterModalVisible();
                        // this.props.navigation.navigate('SearchResultView', {
                        //     data: {
                        //         ...this.state
                        //     }
                        // });
                        console.log('search button clicked');
                    }}>
                        <View style={{
                            backgroundColor: '#49141E', marginVertical: 7, flex: 1, marginHorizontal: 10, width: 300,
                            borderRadius: 7, alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Text style={{ color: 'white', fontWeight: 600 }}>Email agent</Text>
                            {/* <Icon
                                name="search"
                                type='MaterialIcons'
                                size={30}
                                color='white'
                            /> */}
                        </View>
                    </TouchableOpacity>


                </View>

            </View>
        );
    }
}