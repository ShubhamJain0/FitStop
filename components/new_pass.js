import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import Modal from 'react-native-modal';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';



export default function ResetPassForm({route, navigation }) {

    const { phone, action } = route.params;
    const [password, setPassword] = useState('');

    const [disabled, setDisabled] = useState(false);
    const [verifyOTPDisabled, setVerifyOTPDisabled] = useState(false);

    const [verifyAccountOTP, setVerifyAccountOTP] = useState(0);

    const [counter, setCounter] = useState(60);

    useEffect(() => {
        const timer = counter > 0 && setInterval(() => setCounter(counter - 1), 1000); 
        return () => clearInterval(timer);
    }, [counter])


    const resetPass = () => {
        setDisabled(true);
        fetch('http://192.168.0.156:8000/api/reset-pass/',{
          method: 'PATCH',
          headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({phone: phone, password: password})
        })
        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
        .then(() => navigation.navigate('Auth'))
        .catch(error => console.log(error))
    }


    const verifyAccountOtp = () => {
        setVerifyOTPDisabled(true);
        fetch(`http://192.168.0.156:8000/api/verify_phone/${verifyAccountOTP}`,{
          method: 'POST',
          headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({phone: phone})
        })
        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => {if (resp.status === 201 ){
                        navigation.navigate('Auth')
                        } else if (resp.status === 406) {
                            alert("Provided OTP didn't match")
                            setVerifyOTPDisabled(false);
                        } else if (resp.status === 200) {
                            alert('Provided OTP has been expired or not matched')
                            setVerifyOTPDisabled(false);
                        }
        })
        .catch(error => console.log(error))
    }


    const resendOTP = () => {
        setCounter(60);
        fetch('http://192.168.0.156:8000/api/send_sms_code/',{
          method: 'POST',
          headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({phone: phone})
        })
        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
        .catch(error => console.log(error))
    }


    if (action === 'verify account')
    return (
        <View style={styles.container}>
            <TextInput style={{ height: 30, borderColor: 'gray', borderBottomWidth: 1, marginBottom: hp(2), width: wp(50),  alignSelf: 'center' }} placeholder={'Enter OTP'} 
                onChangeText={(text) => setVerifyAccountOTP(text)} maxLength={6} />
            {verifyAccountOTP.toString().length < 6 ? 
                <TouchableOpacity disabled={true} style={{opacity: 0.2}}>
                    <Text>Verify OTP</Text>
                </TouchableOpacity> :
                <TouchableOpacity disabled={verifyOTPDisabled} style={verifyOTPDisabled ?{opacity: 0.2}: {opacity: 1}} onPress={verifyAccountOtp}>
                    <Text>Verify OTP</Text>
                </TouchableOpacity>
            }

            <TouchableOpacity disabled={counter === 0 ? false: true} style={counter === 0 ? {opacity: 1}: {opacity: 0.2}} onPress={resendOTP}>
                <Text>Resend OTP</Text>
            </TouchableOpacity>
            <Text>in {counter}</Text>
        </View>
    )




    if (action === 'reset password')
    return (
        <View style={styles.container}>
            <TextInput style={{ height: 30, borderColor: 'gray', borderBottomWidth: 1, marginBottom: hp(2), width: wp(50),  alignSelf: 'center' }} placeholder={'New Password'} 
                onChangeText={(text) => setPassword(text)} autoCapitalize={'none'} secureTextEntry={true} />
            {password === '' ? 
                <TouchableOpacity disabled={true} style={{opacity: 0.2}}>
                    <Text>Set Password</Text>
                </TouchableOpacity> :
                <TouchableOpacity disabled={disabled} style={disabled ?{opacity: 0.2}: {opacity: 1}} onPress={resetPass}>
                    <Text>Set Password</Text>
                </TouchableOpacity>
            }
        </View>
    )
}



const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center'
    },
});