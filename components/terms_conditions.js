import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef, useContext } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image, SafeAreaView, ActivityIndicator, Platform, Button, Animated } from 'react-native';
import Modal from 'react-native-modal';
import { FontAwesome5, MaterialIcons, AntDesign, MaterialCommunityIcons, Entypo, FontAwesome, Ionicons } from '@expo/vector-icons';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { ScrollView } from 'react-native';
import LottieView from 'lottie-react-native';



export default function TermsandConditions() {

    const [option, setOption] = useState('');
    const animation = new Animated.Value(0);

    const tc = () => {
        Animated.timing(animation,{
            toValue: 1,
            duration: 1000,
            useNativeDriver: true
        }).start();
    }

    const Opacity = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.9],
    })

    return (
        <View style={{flex: 1, backgroundColor: 'white', paddingTop: 100, padding: 50, paddingBottom: 10}}>
            <StatusBar style="inverted" />
            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                <Text style={{fontFamily: 'Maven-sem', fontSize: wp(7), color: 'black'}}>Terms and Conditions</Text>
                <TouchableOpacity style={{marginTop: 50}} onPress={() => setOption('Terms')} activeOpacity={1}>
                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>Terms of use</Text>
                </TouchableOpacity>
                {option === 'Terms' ? <Text style={{fontFamily: 'Maven-med', fontSize: wp(4), color: 'black'}}>Terms of use sdnjbd sdksdnn sdijdibhd bnpaidadanhubd aadamd adoad nabdiadnowpkiqbd dqdknqdn qdoj </Text>: null}
                <Text style={{backgroundColor: '#ebebeb', width: '100%', height: 1, marginTop: 25}}></Text>
                <TouchableOpacity style={{marginTop: 25}} onPress={() => setOption('Privacy Policy')} activeOpacity={1}>
                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>Privacy Policy</Text>
                </TouchableOpacity>
                {option === 'Privacy Policy' ? <Text style={{fontFamily: 'Maven-med', fontSize: wp(4), color: 'black'}}>adandabdb dnjbd sdksdnn sdijdibhd bnpaidadanhubd aadamd adoad nabdiadnowpkiqbd dqdknqdn qdoj </Text>: null}
                <Text style={{backgroundColor: '#ebebeb', width: '100%', height: 1, marginTop: 25}}></Text>
                <TouchableOpacity style={{marginTop: 25}} onPress={() => setOption('Refund')} activeOpacity={1}>
                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>Payments and Refunds</Text>
                </TouchableOpacity>
                {option === 'Refund' ? <Text style={{fontFamily: 'Maven-med', fontSize: wp(4), color: 'black'}}>adandabdb dnjbd sdksdnn sdijdibhd bnpaidadanhubd aadamd adoad nabdiadnowpkiqbd dqdknqdn qdoj </Text>: null}
                <Text style={{backgroundColor: '#ebebeb', width: '100%', height: 1, marginTop: 25}}></Text>
                <TouchableOpacity style={{marginTop: 25}} onPress={() => setOption('Attributions')} activeOpacity={1}>
                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>Attributions</Text>
                </TouchableOpacity>
                {option === 'Attributions' ? <Text style={{fontFamily: 'Maven-med', fontSize: wp(4), color: 'black'}}>adandabdb dnjbd sdksdnn sdijdibhd bnpaidadanhubd aadamd adoad nabdiadnowpkiqbd dqdknqdn qdoj </Text>: null}
                <Text style={{backgroundColor: '#ebebeb', width: '100%', height: 1, marginTop: 25}}></Text>
            </ScrollView>
        </View>
    )
}