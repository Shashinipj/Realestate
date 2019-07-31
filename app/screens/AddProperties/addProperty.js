import React, { Component } from 'react';
import { View, StyleSheet, Text, TextInputProps, NativeModules, ScrollView, TouchableOpacity, Image, ImageBackground } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import Ionicon from 'react-native-vector-icons/Ionicons';

// var ImagePicker = NativeModules.ImageCropPicker;

export default class AddPropertyScreen extends Component {

    static navigationOptions = {
        // header: null,
    };

    constructor() {
        super();
        this.state = {
            image: null,
            images: null,
            defaultImage: null
        };
    }

    pickSingleWithCamera(cropping, mediaType = 'photo') {
        ImagePicker.openCamera({
            cropping: cropping,
            width: 500,
            height: 500,
            includeExif: true,
            mediaType,
        }).then(image => {
            console.log('received image', image);
            this.setState({
                image: { uri: image.path, width: image.width, height: image.height, mime: image.mime },
                images: null
            });
        }).catch(e => console.log(e));
    }

    pickSingleBase64(cropit) {
        ImagePicker.openPicker({
            width: 300,
            height: 300,
            cropping: cropit,
            includeBase64: true,
            includeExif: true,
        }).then(image => {
            console.log('received base64 image');
            this.setState({
                image: { uri: `data:${image.mime};base64,` + image.data, width: image.width, height: image.height },
                images: null
            });
        }).catch(e => console.log(e));
    }

    cleanupImages() {
        ImagePicker.clean().then(() => {
            console.log('removed tmp images from tmp directory');
        }).catch(e => {
            console.log(e);
        });
    }

    cleanupSingleImage() {
        let image = this.state.image || (this.state.images && this.state.images.length ? this.state.images[0] : null);
        console.log('will cleanup image', image);

        ImagePicker.cleanSingle(image ? image.uri : null).then(() => {
            console.log(`removed tmp image ${image.uri} from tmp directory`);
        }).catch(e => {
            console.log(e);
        })
    }

    cropLast() {
        if (!this.state.image) {
            return Alert.alert('No image', 'Before open cropping only, please select image');
        }

        ImagePicker.openCropper({
            path: this.state.image.uri,
            width: 200,
            height: 200
        }).then(image => {
            console.log('received cropped image', image);
            this.setState({
                image: { uri: image.path, width: image.width, height: image.height, mime: image.mime },
                images: null
            });
        }).catch(e => {
            console.log(e);
            Alert.alert(e.message ? e.message : e);
        });
    }

    pickSingle(cropit, circular = false, mediaType) {
        ImagePicker.openPicker({
            width: 500,
            height: 500,
            cropping: cropit,
            cropperCircleOverlay: circular,
            compressImageMaxWidth: 1000,
            compressImageMaxHeight: 1000,
            compressImageQuality: 1,
            // compressVideoPreset: 'MediumQuality',
            includeExif: true,
        }).then(image => {
            console.log('received image', image);
            this.setState({
                image: { uri: image.path, width: image.width, height: image.height, mime: image.mime },
                images: null
            });
        }).catch(e => {
            console.log(e);
            Alert.alert(e.message ? e.message : e);
        });
    }

    pickMultiple() {
        ImagePicker.openPicker({
            multiple: true,
            waitAnimationEnd: false,
            includeExif: true,
            forceJpg: true,
        }).then(images => {
            this.setState({
                image: null,
                images: images.map(i => {
                    console.log('received image', i);
                    return { uri: i.path, width: i.width, height: i.height, mime: i.mime };
                })
            });
        }).catch(e => console.log(e));

    }

    scaledHeight(oldW, oldH, newW) {
        return (oldH / oldW) * newW;
    }



    renderImage(image) {
        return (
            <TouchableOpacity style={{}} onPress={() => {
                this.setState({
                    defaultImage: image
                })
            }} >
                <ImageBackground style={{ width: 100, height: 100, resizeMode: 'cover', margin: 5 }} source={image} >
                    <TouchableOpacity style={{ alignItems: 'flex-end', marginRight: -7, marginTop: -7 }}>
                        <Ionicon name="md-close-circle-outline" size={20} color={'grey'} />
                    </TouchableOpacity>

                </ImageBackground>
            </TouchableOpacity>

        );
    }

    renderInitialImage(i) {
        return (
            <View>
                <Image style={{ width: 300, height: 200, resizeMode: 'cover', margin: 5 }} source={i} />
            </View>
        );
    }



    render() {
        return (

            <View style={styles.container}>

                <View style={{ backgroundColor: 'grey', width: 300, height: 200 }}>
                    
                    {this.state.defaultImage ? <Image source={this.state.defaultImage} style={{ width: 300, height: 200 }} />
                        : null
                    }

                </View>

                <View style={{ height: 140 }}>

                    <ScrollView horizontal={true}
                        style={{ marginTop: 10 }}

                    >
                        {/* {this.state.image ? this.renderImage(this.state.image) :
                            <TouchableOpacity onPress={this.pickMultiple.bind(this)}>
                                <View style={{ height: 50, backgroundColor: 'grey', width: '100%' }}>
                                    <Text>Click here to add images</Text>
                                </View>

                            </TouchableOpacity>
                        } */}
                        {this.state.images ? this.state.images.map(i => <View key={i.uri} style={{}}>{this.renderImage(i)}</View>) :
                            <TouchableOpacity onPress={this.pickMultiple.bind(this)}>
                                <View style={{ height: 50, backgroundColor: 'grey', width: '100%' }}>
                                    <Text>Click here to add images</Text>
                                </View>

                            </TouchableOpacity>
                        }
                    </ScrollView>
                </View>

                <View>

                    {/* <TouchableOpacity onPress={() => this.pickSingleWithCamera(false)} style={styles.button}>
                        <Text style={styles.text}>Select Single Image With Camera</Text>
                    </TouchableOpacity> */}
                    {/* <TouchableOpacity onPress={() => this.pickSingleWithCamera(true)} style={styles.button}>
                        <Text style={styles.text}>Select Single With Camera With Cropping</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.pickSingle(false)} style={styles.button}>
                        <Text style={styles.text}>Select Single</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.cropLast()} style={styles.button}>
                        <Text style={styles.text}>Crop Last Selected Image</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.pickSingleBase64(false)} style={styles.button}>
                        <Text style={styles.text}>Select Single Returning Base64</Text>
                    </TouchableOpacity> */}
                    {/* <TouchableOpacity onPress={() => this.pickSingle(true)} style={styles.button}>
                        <Text style={styles.text}>Select Single With Cropping</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.pickSingle(true, true)} style={styles.button}>
                        <Text style={styles.text}>Select Single With Circular Cropping</Text>
                    </TouchableOpacity> */}
                    {/* <TouchableOpacity onPress={this.pickMultiple.bind(this)} style={styles.button}>
                        <Text style={styles.text}>*Select Multiple*</Text>
                    </TouchableOpacity> */}
                    {/* <TouchableOpacity onPress={this.cleanupImages.bind(this)} style={styles.button}>
                        <Text style={styles.text}>Cleanup All Images</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.cleanupSingleImage.bind(this)} style={styles.button}>
                        <Text style={styles.text}>Cleanup Single Image</Text>
                    </TouchableOpacity> */}

                </View>

            </View>);
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20
    },
    button: {
        backgroundColor: 'blue',
        marginBottom: 10
    },
    text: {
        color: 'white',
        fontSize: 20,
        textAlign: 'center'
    }
});
