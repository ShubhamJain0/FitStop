import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState, useRef } from 'react';
import { Button } from 'react-native';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Keyboard, Platform, Image, Dimensions, Animated } from 'react-native';
import Modal from 'react-native-modal';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Rect, Circle, G, Polygon, LinearGradient, Defs, Stop, Ellipse } from 'react-native-svg';
import { showMessage } from 'react-native-flash-message';
import NetInfo from "@react-native-community/netinfo";
import Ripple from 'react-native-material-ripple';

const {width: screenWidth} = Dimensions.get('window');

export default function Register({ navigation }) {

    const [mounted, setMounted] = useState(true);
    const [isOffline, setIsOffline] = useState(false);
    const [showIndic, setShowInidc] = useState(false);

    const [phone, setPhone] = useState(0);
    const [disabled, setDisabled] = useState(false);

    const [error, setError] = useState(null);

    const [animation] = useState(new Animated.Value(0));
    const onKeyboardShow = event => showAnim();
    const onKeyboardHide = () => closeAnim();
    const keyboardDidShowListener = useRef();
    const keyboardDidHideListener = useRef();
    

    useEffect(() => {
        keyboardDidShowListener.current = Keyboard.addListener('keyboardDidShow', onKeyboardShow);
        keyboardDidHideListener.current = Keyboard.addListener('keyboardDidHide', onKeyboardHide);

        return () => {
            keyboardDidShowListener.current.remove();
            keyboardDidHideListener.current.remove();
        };
    }, []);

    //Checks for internet connection
    useEffect(() => {
        NetInfo.fetch().then(state => {
        if (!state.isConnected) {
            setIsOffline(true);
        }
        })

        return () => {
            setMounted(false);
        }
    }, [])

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
        if (!state.isConnected || !state.isInternetReachable) {
            setIsOffline(true);
        } 
        })

        unsubscribe();
    }, [])


    //Animations
    const showAnim = () => {
        Animated.timing(animation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true
        }).start();
    }

    const closeAnim = () => {
        Animated.timing(animation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true
        }).start();
    }

    const keyboardOffset = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [hp(45), hp(25)],
        extrapolate: 'clamp',
    })



    const Register = () => {
        setDisabled(true);
        fetch('http://192.168.0.156:8000/api/send_sms_code/',{
          method: 'POST',
          headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({phone: phone})
        })
        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => {
                        if (resp.status === 200) {
                            navigation.navigate('OtpComponent', {phone: phone, action: resp.json.action})
                        } else if (resp.status === 500) {
                            showMessage({
                                message: 'Provided number is not valid or there was an error in sending OTP to the number. Please check the number.',
                                position: 'top',
                                floating: true,
                                titleStyle: {fontFamily: 'Maven-sem', fontSize: wp(3.5)},
                                style: {alignItems: 'center'},
                                icon: 'auto',
                                type: 'danger',
                                statusBarHeight: hp(3),
                                duration: 5000
                            })
                            setDisabled(false);
                        }
                    })
        .catch(error => (setError(error), showMessage({
            message: 'Provided number is not valid or there was an error in sending OTP to the number. Please check the number.',
            position: 'top',
            floating: true,
            titleStyle: {fontFamily: 'Maven-sem', fontSize: wp(3.5)},
            style: {alignItems: 'center'},
            icon: 'auto',
            type: 'danger',
            statusBarHeight: hp(3),
            duration: 5000
          }), setDisabled(false)))
    }


    const retry = async () => {
        setShowInidc(true);
        const token = await SecureStore.getItemAsync('USER_TOKEN')
        try {
            if (mounted) {
                setShowInidc(false);
                setIsOffline(false);
            }
        } catch (error) {
            setError(error)
        } finally {
            NetInfo.fetch().then(state => {
                if (!state.isConnected) {
                  setTimeout(() => setShowInidc(false), 3000)
                }
            })
        }
    }


    if (isOffline) {
        return (
            <View style={{flex: 1, backgroundColor: '#fcfcfc'}}>
                <StatusBar style="inverted" />
                <Image source={require('../assets/offline.png')} style={{width: '95%', height: 1939*(screenWidth/3300), marginTop: wp(30), alignSelf: 'center'}} />
                <View style={{width: '80%', alignSelf: 'center'}}>
                <Text style={{fontFamily: 'Maven-bold', fontSize: wp(6), marginTop: 50, textAlign: 'center', color: 'black'}}>Uh oh! Seems like you are disconnected !</Text>
                {!showIndic ? <TouchableOpacity style={{alignSelf: 'center', marginTop: 25}} onPress={retry} activeOpacity={1}>
                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: '#249c86'}}>RETRY</Text>
                </TouchableOpacity>: <LottieView source={require('../assets/animations/connecting.json')} autoPlay={true} loop={true} style={{height: 100, alignSelf: 'center'}} />}
                </View>
            </View>
        )
    }


    return (
        <View style={styles.container}>
            <StatusBar style="inverted" />
            <Image source={require('../assets/register.png')} style={{width: '100%', height: 2185*(screenWidth/3505), alignSelf: 'center'}} />
            <Animated.View style={{backgroundColor: 'white', width: '100%', height: '100%', position: 'absolute', transform: [{translateY: keyboardOffset}], borderTopLeftRadius: 50, borderTopRightRadius: 50, elevation: 25, shadowOffset: {width: 0, height: 12}, shadowRadius: 16, shadowOpacity: 0.58, shadowColor: '#000'}}>
                <Text style={{fontFamily: 'Maven-sem', fontSize: wp(8), paddingTop: wp(8), paddingLeft: wp(15), color: 'black'}} >Enter your{'\n'}mobile number.</Text>
                <Text style={{fontFamily: 'Maven-med', marginBottom: 35, paddingLeft: wp(15), fontSize: wp(4), color: 'black'}}>We will send you a verification code.</Text>
                <View style={{flexDirection: 'row', alignItems: 'center', marginTop: hp(5), paddingLeft: wp(15)}}>
                <Svg width={wp(8)} height={wp(8)} viewBox="0 0 512 512"><Path fill="#FAB446" d="M473.655,88.276H38.345C17.167,88.276,0,105.443,0,126.621v73.471h512v-73.471  C512,105.443,494.833,88.276,473.655,88.276z"/><Path fill="#73AF00" d="M0,385.379c0,21.177,17.167,38.345,38.345,38.345h435.31c21.177,0,38.345-17.167,38.345-38.345  v-73.471H0V385.379z"/><Rect y="200.09" style="fill:#F5F5F5;" width="512" height="111.81"/><G><Path style="fill:#41479B;" d="M256,303.448c-26.164,0-47.448-21.284-47.448-47.448s21.284-47.448,47.448-47.448   s47.448,21.284,47.448,47.448S282.164,303.448,256,303.448z M256,217.379c-21.298,0-38.621,17.323-38.621,38.621   s17.323,38.621,38.621,38.621s38.621-17.323,38.621-38.621S277.298,217.379,256,217.379z"/><Circle fill="#41479B" cx="256" cy="256" r="5.379"/>
                    <Polygon fill="#41479B" points="256,256.807 242.33,258.187 212.966,256.807 212.966,255.193 242.33,253.813 256,255.193     "/>
                    <Polygon fill="#41479B"  points="256,256.807 269.67,258.187 299.034,256.807 299.034,255.193 269.67,253.813 256,255.193     "/>
                    <Polygon fill="#41479B"  points="255.193,256 253.813,242.33 255.193,212.966 256.807,212.966 258.187,242.33 256.807,256     "/>
                    <Polygon fill="#41479B"  points="255.193,256 253.813,269.67 255.193,299.034 256.807,299.034 258.187,269.67 256.807,256     "/>
                    <Polygon fill="#41479B"  points="255.43,256.57 244.788,247.881 225,226.141 226.141,225 247.881,244.788 256.57,255.43  "/>
                    <Polygon fill="#41479B"  points="255.43,256.57 264.119,267.212 285.859,287 287,285.859 267.212,264.119 256.57,255.43  "/>
                    <Polygon fill="#41479B"  points="255.43,255.43 264.119,244.788 285.859,225 287,226.141 267.212,247.881 256.57,256.57  "/>
                    <Polygon fill="#41479B"  points="255.43,255.43 244.788,264.119 225,285.859 226.141,287 247.881,267.212 256.57,256.57  "/>
                    <Polygon fill="#41479B"  points="256.309,256.746 244.207,263.252 216.551,273.214 215.933,271.723 242.534,259.211    255.691,255.254  "/>
                    <Polygon fill="#41479B"  points="256.309,256.746 269.466,252.789 296.067,240.277 295.449,238.786 267.793,248.748    255.691,255.254  "/>
                    <Polygon fill="#41479B"  points="255.254,256.309 248.748,244.207 238.786,216.551 240.277,215.933 252.789,242.534    256.746,255.691  "/>
                    <Polygon fill="#41479B"  points="255.254,256.309 259.211,269.466 271.723,296.067 273.214,295.449 263.252,267.793    256.746,255.691  "/>
                    <Polygon fill="#41479B"  points="255.691,256.746 242.534,252.789 215.933,240.277 216.551,238.786 244.207,248.748    256.309,255.254  "/>
                    <Polygon fill="#41479B"  points="255.691,256.746 267.793,263.252 295.449,273.214 296.067,271.723 269.466,259.211    256.309,255.254  "/>
                    <Polygon fill="#41479B"  points="255.254,255.691 259.211,242.534 271.723,215.933 273.214,216.551 263.252,244.207    256.746,256.309  "/>
                    <Polygon fill="#41479B"  points="255.254,255.691 248.748,267.793 238.786,295.449 240.277,296.067 252.789,269.466    256.746,256.309  "/></G><Circle fill="#F5F5F5" cx="256" cy="256" r="7.256"/><Circle fill="#41479B" cx="256" cy="256" r="4.351"/><G></G><G></G><G></G><G></G><G></G><G></G><G></G><G></G><G></G><G></G><G></G><G></G><G></G><G></G><G></G></Svg>
                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}> +91 </Text>
                    <TextInput style={{ color: 'black', width: wp(50), marginLeft: 10, fontFamily: 'Maven-med', fontSize: wp(4), borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }} placeholder={'Mobile number'} 
                    onChangeText={(text) => setPhone(text)} keyboardType={'numeric'} maxLength={10} />               
                </View>
                {phone.length <= 9 || phone === 0 || disabled ? 
                    <TouchableOpacity disabled={true} style={Platform.OS === 'android' ? {alignSelf: 'flex-end', marginRight: 50, opacity: 0.2, backgroundColor: '#6aab9e', paddingLeft: 20, paddingRight: 20, paddingBottom: 15, paddingTop: 10, borderRadius: 20, marginTop: hp(7), elevation: 10, shadowOffset: {width: 0, height: 5}, shadowRadius: 6.27, shadowOpacity: 0.34, shadowColor: '#000'}: {alignSelf: 'flex-end', marginRight: 50, opacity: 0.2, backgroundColor: '#6aab9e', paddingLeft: 20, paddingRight: 20, paddingBottom: 15, paddingTop: 15, borderRadius: 20, marginTop: hp(7), elevation: 10, shadowOffset: {width: 0, height: 5}, shadowRadius: 6.27, shadowOpacity: 0.34, shadowColor: '#000'}} >
                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(5), color: 'black'}}>&#x27F6;</Text>
                    </TouchableOpacity>:
                    <Ripple style={Platform.OS === 'android' ? {alignSelf: 'flex-end', marginRight: 50, backgroundColor: '#6aab9e', paddingLeft: 20, paddingRight: 20, paddingBottom: 15, paddingTop: 10, borderRadius: 20, marginTop: hp(7), elevation: 10, shadowOffset: {width: 0, height: 5}, shadowRadius: 6.27, shadowOpacity: 0.34, shadowColor: '#000'}: {alignSelf: 'flex-end', marginRight: 50, backgroundColor: '#6aab9e', paddingLeft: 20, paddingRight: 20, paddingBottom: 15, paddingTop: 15, borderRadius: 20, marginTop: hp(7), elevation: 10, shadowOffset: {width: 0, height: 5}, shadowRadius: 6.27, shadowOpacity: 0.34, shadowColor: '#000'}} onPress={Register} rippleDuration={600} rippleContainerBorderRadius={10} rippleOpacity={0.5} onLongPress={{}} >
                        <Text style={{opacity: 1, fontFamily: 'Maven-sem', fontSize: wp(5), textAlign: 'center', color: 'black'}}>&#x27F6;</Text>
                    </Ripple>
                }
            </Animated.View>
      </View>
    );
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      paddingTop: hp(15)
    },
});