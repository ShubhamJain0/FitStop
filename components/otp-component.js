import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState, useRef } from 'react';
import { Button } from 'react-native';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Keyboard, Image, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import Svg, { Path, Rect, Circle, G, Polygon, Ellipse, Defs, Stop } from 'react-native-svg';
import Clipboard from 'expo-clipboard';

const { width: screenWidth } = Dimensions.get('window');

export default function OtpComponent({ navigation, route }){

    const { phone } = route.params;
    const { action } = route.params;

    const [verifyOTPDisabled, setVerifyOTPDisabled] = useState(false);

    const [counter, setCounter] = useState(60);

    const [userDetailsModal, setUserDetailsModal] = useState(false);
    const [changeName, setChangeName] = useState('');
    const [changeEmail, setChangeEmail] = useState('');

    const [OTP, setOTP] = useState('');
    const [OTP1, setOTP1] = useState('');
    const [OTP2, setOTP2] = useState('');
    const [OTP3, setOTP3] = useState('');
    const [OTP4, setOTP4] = useState('');
    const [OTP5, setOTP5] = useState('');
    const [OTP6, setOTP6] = useState('');

    const ti1 = useRef(null);
    const ti2 = useRef(null);
    const ti3 = useRef(null);
    const ti4 = useRef(null);
    const ti5 = useRef(null);
    const ti6 = useRef(null);

    const [keyboardOffset, setKeyboardOffset] = useState(hp(45));
    const onKeyboardShow = event => setKeyboardOffset(hp(25));
    const onKeyboardHide = () => setKeyboardOffset(hp(45));
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


    useEffect(() => {
        const timer = counter > 0 && setInterval(() => setCounter(counter - 1), 1000); 
        return () => clearInterval(timer);
    }, [counter])


    useEffect(() => {
        if (OTP.toString().length === 6) {
            Login()
        }
    }, [OTP])



    //Sign In
    const Login = () => {
        setVerifyOTPDisabled(true);
        fetch('http://192.168.0.105:8000/api/customauth/',{
          method: 'POST',
          headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({username: phone, password: OTP})
        })
        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => {return (resp.json.token && action === 'create' ? (saveToken(resp.json.token), setVerifyOTPDisabled(false), setTimeout(() => setUserDetailsModal(true), 200)): resp.json.token && action === 'Login' ? (saveToken(resp.json.token), setVerifyOTPDisabled(false), navigation.pop(2)): alert('OTP did not match or has expired'), setVerifyOTPDisabled(false))})
        .catch(error => console.log(error))
    }



    const editProfile = async () => {
        const token = await AsyncStorage.getItem('USER_TOKEN')
        if (token) {
          fetch('http://192.168.0.105:8000/api/me/',{
                method: 'PATCH',
                headers: {
                'Authorization': `Token ${token}`,
                'Content-type': 'application/json'
                },
                body: JSON.stringify({name: changeName ? changeName: null, email: changeEmail ? changeEmail: null})
            })
          .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
          .then(() => navigation.pop(2))//navigates to top stack which in our case is tab navigator
          .then(() => setUserDetailsModal(false))
          .catch(error => console.log(error))
        }
      }


    const resendOTP = () => {
        setCounter(60);
        fetch('http://192.168.0.105:8000/api/send_sms_code/',{
          method: 'POST',
          headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({phone: phone})
        })
        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
        .catch(error => console.log(error))
    }




    const saveToken = async (token) => {
        await AsyncStorage.setItem('USER_TOKEN', token);
    }


    const wait = timeout => {
        return new Promise(resolve => {
          setTimeout(resolve, timeout);
        });
    };


    const copyFromClipboard = async (text) => {
        const text1 = await Clipboard.getStringAsync();
        if (text === text1[0]) {
            setOTP1(text1[0]);
            setOTP2(text1[1]);
            setOTP3(text1[2]);
            setOTP4(text1[3]);
            setOTP5(text1[4]);
            setOTP6(text1[5]);
            setOTP(text1);
        }
    }

    
    return (
        <View style={styles.container}>
            <Image source={require('../assets/message-sent.png')} style={{width: '100%', height: 2073*(screenWidth/3381), alignSelf: 'center'}} />
            <View style={{width: '100%', height: '100%', backgroundColor: 'white', position:'absolute', top: keyboardOffset, borderTopLeftRadius: 50, borderTopRightRadius: 50, elevation: 25, shadowOffset: {width: 0.5, height: 2}, shadowRadius: 5, shadowOpacity: 0.3}}>
                <Text style={{fontFamily: 'Maison-bold', fontSize: wp(4), paddingTop: wp(8), textAlign: 'center'}} >We have sent the verification code to{'\n'}+91 {phone}.</Text>
                <View style={{flexDirection: 'row', marginTop: 40, alignSelf: 'center', alignItems: 'center'}}>
                <TextInput ref={ti1} style={{ height: wp(10), textAlign: 'center', fontFamily: 'sf', fontSize: wp(6), marginRight: 15, alignSelf: 'center', width: '10%', borderWidth: 1, borderStyle: 'dotted', borderRadius: 1}}
                        value={OTP1} onChangeText={(text) => {setOTP1(text); if (text) {copyFromClipboard(text), ti2.current.focus()} }} keyboardType={'numeric'} maxLength={1} onSubmitEditing={() => {if (OTP.toString().length === 6) Login()}} />
                    <TextInput ref={ti2} style={{ height: wp(10), textAlign: 'center', fontFamily: 'sf', fontSize: wp(6), marginRight: 15, alignSelf: 'center', width: '10%', borderWidth: 1, borderStyle: 'dotted', borderRadius: 1}}
                        value={OTP2} onChangeText={(text) => {setOTP2(text); if (text) {ti3.current.focus()} }} keyboardType={'numeric'} maxLength={1} onSubmitEditing={() => {if (OTP.toString().length === 6) Login()}}
                        onKeyPress={({ nativeEvent }) => {nativeEvent.key === 'Backspace' ? ti1.current.focus(): null}} />
                    <TextInput ref={ti3} style={{ height: wp(10), textAlign: 'center', fontFamily: 'sf', fontSize: wp(6), marginRight: 15, alignSelf: 'center', width: '10%', borderWidth: 1, borderStyle: 'dotted', borderRadius: 1}}
                        value={OTP3} onChangeText={(text) => {setOTP3(text); if (text) {ti4.current.focus()} }} keyboardType={'numeric'} maxLength={1} onSubmitEditing={() => {if (OTP.toString().length === 6) Login()}}
                        onKeyPress={({ nativeEvent }) => {nativeEvent.key === 'Backspace' ? ti2.current.focus(): null}} />
                    <TextInput ref={ti4} style={{ height: wp(10), textAlign: 'center', fontFamily: 'sf', fontSize: wp(6), marginRight: 15, alignSelf: 'center', width: '10%', borderWidth: 1, borderStyle: 'dotted', borderRadius: 1}}
                        value={OTP4} onChangeText={(text) => {setOTP4(text); if (text) {ti5.current.focus()} }} keyboardType={'numeric'} maxLength={1} onSubmitEditing={() => {if (OTP.toString().length === 6) Login()}}
                        onKeyPress={({ nativeEvent }) => {nativeEvent.key === 'Backspace' ? ti3.current.focus(): null}} />
                    <TextInput ref={ti5} style={{ height: wp(10), textAlign: 'center', fontFamily: 'sf', fontSize: wp(6), marginRight: 15, alignSelf: 'center', width: '10%', borderWidth: 1, borderStyle: 'dotted', borderRadius: 1}}
                        value={OTP5} onChangeText={(text) => {setOTP5(text); if (text) {ti6.current.focus()} }} keyboardType={'numeric'} maxLength={1} onSubmitEditing={() => {if (OTP.toString().length === 6) Login()}}
                        onKeyPress={({ nativeEvent }) => {nativeEvent.key === 'Backspace' ? ti4.current.focus(): null}} />
                    <TextInput ref={ti6} style={{ height: wp(10), textAlign: 'center', fontFamily: 'sf', fontSize: wp(6), marginRight: 15, alignSelf: 'center', width: '10%', borderWidth: 1, borderStyle: 'dotted', borderRadius: 1}}
                        value={OTP6} onChangeText={(text) => (setOTP6(text), setOTP(OTP1 + OTP2 + OTP3 + OTP4 + OTP5 + text))} keyboardType={'numeric'} maxLength={1} onSubmitEditing={() => {if (OTP.toString().length === 6) Login()}}
                        onKeyPress={({ nativeEvent }) => {nativeEvent.key === 'Backspace' ? ti5.current.focus(): null}} />
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center', alignSelf: 'center', marginTop: 40}}>
                    <Text style={{fontFamily: 'sf', fontSize: wp(4)}}>Didn't received code? </Text>
                    <TouchableOpacity disabled={counter === 0 ? false: true} style={counter === 0 ? {opacity: 1}: {opacity: 0.3}} onPress={resendOTP}>
                        <Text style={{fontFamily: 'Maison-bold', color: '#99b898', textDecorationLine: 'underline', fontSize: wp(3.5)}}> Resend code </Text>
                    </TouchableOpacity>
                </View>
                <Text style={{fontFamily: 'sf', fontSize: wp(4), textAlign: 'center'}}> in {counter}s</Text>
            </View>

            <Modal
                isVisible={userDetailsModal}
                backdropColor={'white'}
                backdropOpacity={1}
                >
                    <Text style={{borderTopWidth: 0.3}}></Text>
                    <TouchableOpacity style={{alignSelf: 'flex-end'}} onPress={() => navigation.pop(2)}>
                        <Text style={{fontFamily: 'Maison-bold', textDecorationLine: 'underline', fontSize: wp(3)}}>Do it later &#187;</Text>
                    </TouchableOpacity>
                    <Text style={{fontFamily: 'sofia-black', fontSize: wp(8), marginBottom: 50}}>Enter your{'\n'}Personal Information.</Text>
                    <TextInput style={{ height: 30, borderColor: '#f0f0f0', borderBottomWidth: 2, marginBottom: 25, width: '80%' }} 
                        placeholder={'Name'} onChangeText={(text) => setChangeName(text)} />
                    <TextInput style={{ height: 30, borderColor: '#f0f0f0', borderBottomWidth: 2, marginBottom: 25, width: '80%' }} 
                        placeholder={'Email'} onChangeText={(text) => setChangeEmail(text)} keyboardType={'email-address'} />
                    {changeName === '' && changeEmail === '' ?
                        <TouchableOpacity disabled={true} style={{opacity: 0.2, backgroundColor: '#99b898', padding: 10, paddingLeft: 20, paddingRight: 20, borderRadius: 10, alignSelf: 'flex-start'}}>
                        <Text style={{fontFamily: 'sf'}}>Save</Text>
                        </TouchableOpacity> :
                        <TouchableOpacity disabled={false} style={{opacity: 1, backgroundColor: '#99b898', padding: 10, paddingLeft: 20, paddingRight: 20, borderRadius: 10, alignSelf: 'flex-start'}} onPress={editProfile}>
                        <Text style={{fontFamily: 'sf'}}>Save</Text>
                        </TouchableOpacity>
                    }
            </Modal>
            
            <Modal isVisible={verifyOTPDisabled} backdropOpacity={0.1} animationIn={'lightSpeedIn'} animationOut={'lightSpeedOut'}>
                <View style={{alignSelf: 'center', backgroundColor: 'white', padding: 25}}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <ActivityIndicator size={40} color={'#99b898'}  />
                        <Text style={{fontFamily: 'Maison-bold', marginLeft: 20}}>Verifying code...</Text>
                    </View>
                </View>
            </Modal>
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      paddingTop: hp(15)
    },
});