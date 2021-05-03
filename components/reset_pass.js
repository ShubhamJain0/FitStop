import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { Button } from 'react-native';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import Modal from 'react-native-modal';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Reset({ navigation }) {

    const [phone, setPhone] = useState(0);
    const [respStatus, setRespStatus] = useState(404);

    const [disabled, setDisabled] = useState(false);
    const [verificationDisabled, setVerificationDisabled] = useState(false);
    const [verifyOTPDisabled, setVerifyOTPDisabled] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const [resetOTP, setResetOTP] = useState(0);



    const resetOtp = () => {
        if (phone.length <= 9){
            return alert('Please enter 10 digit number')
        }
        setDisabled(true);
        fetch('http://192.168.0.156:8000/api/reset/',{
          method: 'POST',
          headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({phone: phone})
        })
        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => setRespStatus(resp.status))
        .then(() => setModalVisible(true))
        .catch(error => console.log(error))
    }


    const verifyOTP = () => {
        setVerifyOTPDisabled(true);
        fetch(`http://192.168.0.156:8000/api/reset_pass_verify/${resetOTP}`,{
          method: 'POST',
          headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({phone: phone})
        })
        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => {if (resp.status === 200 ){
                        setModalVisible(false);
                        navigation.navigate('ResetPassForm', {phone: phone, action: 'reset password'})
                        } else if (resp.status === 406) {
                            alert("Provided OTP didn't match")
                            setVerifyOTPDisabled(false);
                        } else if (resp.status === 401) {
                            alert('Provided OTP has been expired or not matched')
                            setVerifyOTPDisabled(false);
                        }
        })
        .catch(error => console.log(error))
    }
    



    const verifyAccount = () => {
        setVerificationDisabled(true);
        fetch('http://192.168.0.156:8000/api/send_sms_code/',{
          method: 'POST',
          headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({phone: phone})
        })
        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
        .then(() => (setModalVisible(false), navigation.navigate('ResetPassForm', {phone: phone, action: 'verify account'})))
        .catch(error => console.log(error))
    }



    return (
      <View style={styles.container}>
        <TextInput style={{ height: 30, borderColor: 'gray', borderBottomWidth: 1, marginBottom: hp(2), width: wp(50),  alignSelf: 'center' }} placeholder={'Phone'} 
            onChangeText={(text) => setPhone(text)} keyboardType={'numeric'} maxLength={10} />
        {phone === 0 || phone === '' ? 
            <TouchableOpacity disabled={true}>
                <Text style={{opacity: 0.2}}>Send OTP</Text>
            </TouchableOpacity>:
            <TouchableOpacity disabled={disabled} onPress={resetOtp}>
                <Text style={disabled ? {opacity: 0.2}: {opacity: 1}}>Send OTP</Text>
            </TouchableOpacity>
        }


        <Modal isVisible={modalVisible} backdropColor={'white'} backdropOpacity={1} animationIn={'lightSpeedIn'} animationOut={'lightSpeedOut'}>
            {respStatus === 200 ? 
                <View>
                    <TextInput style={{ height: 30, borderColor: 'gray', borderBottomWidth: 1, marginBottom: hp(2), width: wp(50),  alignSelf: 'center' }} placeholder={'Enter OTP'} 
                        onChangeText={(text) => setResetOTP(text)} keyboardType={'numeric'} maxLength={6} />
                    {resetOTP.toString().length < 6 ? 
                        <TouchableOpacity disabled={true} style={{opacity: 0.2}}>
                            <Text>Verify OTP</Text>
                        </TouchableOpacity> :
                        <TouchableOpacity disabled={verifyOTPDisabled} style={verifyOTPDisabled ? {opacity: 0.2}: {opacity: 1}} onPress={verifyOTP}>
                            <Text>Verify OTP</Text>
                        </TouchableOpacity>
                    }
                </View>
        
            : respStatus === 401 ? 
                    <View>
                        <Text>Looks like you already have an account, but you haven't verified your phone number</Text>
                        <TouchableOpacity disabled={verificationDisabled} onPress={verifyAccount}>
                            <Text style={verificationDisabled ? {opacity: 0.2}: {opacity: 1}}>Verify now!</Text>
                        </TouchableOpacity>
                    </View>
            : <TouchableOpacity onPress={() => (setModalVisible(false), navigation.navigate('Register'))}><Text>There's no account associated with this number. Please create an account now! &raquo;</Text></TouchableOpacity>}
        </Modal>
        
        <StatusBar style="auto" />
      </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center'
    },
});