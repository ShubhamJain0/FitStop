import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useContext, useRef } from 'react';
import { StyleSheet, Text, View, RefreshControl, ScrollView, SafeAreaView, Image, Button, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import { AntDesign, FontAwesome, MaterialIcons, Entypo, Ionicons, EvilIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';



export default function Payments({ navigation }){
    return (
        <View style={styles.container}>
            <WebView source={{uri: 'https://stripe.com/docs/payments/checkout/'}} style={{marginTop: hp(15)}} />
            <Text>lol</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
})