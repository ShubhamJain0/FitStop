import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Button } from 'react-native';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import Modal from 'react-native-modal';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';


Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
});


export default function Register({ navigation }) {

    const [phone, setPhone] = useState(0);
    const [password, setPassword] = useState('');
    const [registerStatus, setRegisterStatus] = useState(0);

    const [otpModal, setOtpModal] = useState(false);
    const [OTP, setOTP] = useState(0);
    const [verifyOTPDisabled, setVerifyOTPDisabled] = useState(false);

    const [disabled, setDisabled] = useState(false);

    const [counter, setCounter] = useState(0);

    const [userDetailsModal, setUserDetailsModal] = useState(false);
    const [changeName, setChangeName] = useState('');
    const [changeEmail, setChangeEmail] = useState('');

    useEffect(() => {
        const timer = counter > 0 && setInterval(() => setCounter(counter - 1), 1000); 
        return () => clearInterval(timer);
    }, [counter])


    const Register = () => {
        if (phone.length <= 9){
            return alert('Please enter 10 digit number')
        }
        setDisabled(true);
        fetch('http://192.168.29.234:8000/api/createuser/',{
          method: 'POST',
          headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({phone: phone, password: password})
        })
        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => {
                        if (resp.status === 201) {
                            setOtpModal(true);
                            setCounter(60);
                        
                        } else if (resp.status === 400) {
                            alert('User with this number already exists!')
                            setDisabled(false);
                        } else if (resp.status === 500) {
                            alert('Provided number is not valid or there was an error in sending OTP. Please check the number.')
                            setDisabled(false);
                        }
                    })
        .catch(error => (console.log(error), alert('Provided number is not valid or there was an error in sending OTP. Please check the number.')))
    }


    const verifyOTP = () => {
        setVerifyOTPDisabled(true);
        fetch(`http://192.168.29.234:8000/api/verify_phone/${OTP}`,{
          method: 'POST',
          headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({phone: phone})
        })
        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => {if (resp.status === 201 ){
                        fetch('http://192.168.29.234:8000/api/auth/',{
                            method: 'POST',
                            headers: {
                                'Content-type': 'application/json'
                            },
                            body: JSON.stringify({username: phone, password: password})
                            })
                        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                        .then(resp => {return (resp.json.token ? (saveToken(resp.json.token), setOtpModal(false), setUserDetailsModal(true)): alert('User not found!'))})
                        .catch(error => console.log(error))
                        } else if (resp.status === 406) {
                            alert("Provided OTP didn't match")
                            setVerifyOTPDisabled(false);
                        } else if (resp.status === 404) {
                            alert('Provided OTP has been expired or not matched')
                            setVerifyOTPDisabled(false);
                        }
        })
        .catch(error => console.log(error))
    }


    const resendOTP = () => {
        setCounter(60);
        fetch('http://192.168.29.234:8000/api/send_sms_code/',{
          method: 'POST',
          headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({phone: phone})
        })
        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
        .catch(error => console.log(error))
    }



    const editProfile = async () => {
        const token = await AsyncStorage.getItem('USER_TOKEN')
        if (token) {
          fetch('http://192.168.29.234:8000/api/me/',{
                method: 'PATCH',
                headers: {
                'Authorization': `Token ${token}`,
                'Content-type': 'application/json'
                },
                body: JSON.stringify({name: changeName ? changeName: null, email: changeEmail ? changeEmail: null})
            })
          .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
          .then(() => navigation.popToTop())//navigates to top stack which in our case is tab navigator
          .then(() => setUserDetailsModal(false))
          .catch(error => console.log(error))
        }
      }




    const saveToken = async (token) => {
        await AsyncStorage.setItem('USER_TOKEN', token);
    }




    return (
      <View style={styles.container}>
        <TextInput style={{ height: 30, borderColor: 'gray', borderBottomWidth: 1, marginBottom: hp(2), width: wp(50),  alignSelf: 'center' }} placeholder={'Phone'} 
            onChangeText={(text) => setPhone(text)} keyboardType={'numeric'} maxLength={10} />
        <TextInput style={{ height: 30, borderColor: 'gray', borderBottomWidth: 1, marginBottom: hp(2), width: wp(50),  alignSelf: 'center'}} placeholder={'Password'} 
            onChangeText={(text) => setPassword(text)} autoCapitalize={'none'} secureTextEntry={true} />
        {phone === 0 || password === '' ?
            <TouchableOpacity disabled={true} onPress={Register}>
                <Text style={{opacity: 0.2}}>Register</Text>
            </TouchableOpacity>: 
            <TouchableOpacity disabled={disabled} onPress={Register}>
                <Text style={disabled ? {opacity: 0.2}: {opacity: 1}}>Register</Text>
            </TouchableOpacity>
        }
        
        <TouchableOpacity onPress={() => navigation.navigate('Auth')}>
            <Text>Already have an account? Login now</Text>
        </TouchableOpacity>

        
        
        <Modal isVisible={otpModal} backdropColor={'white'} backdropOpacity={1}>
            <TextInput style={{ height: 30, borderColor: 'gray', borderBottomWidth: 1, marginBottom: hp(2), width: wp(50),  alignSelf: 'center' }} placeholder={'Enter OTP'} 
                onChangeText={(text) => setOTP(text)} keyboardType={'numeric'} maxLength={6} />
            {OTP.toString().length < 6 ? 
                <TouchableOpacity disabled={true} style={{opacity: 0.2}}>
                    <Text>Verify OTP</Text>
                </TouchableOpacity> :
                <TouchableOpacity disabled={verifyOTPDisabled} style={verifyOTPDisabled ? {opacity: 0.2}: {opacity: 1}} onPress={verifyOTP}>
                    <Text>Verify OTP</Text>
                </TouchableOpacity>
                }
            <TouchableOpacity disabled={counter === 0 ? false: true} style={counter === 0 ? {opacity: 1}: {opacity: 0.2}} onPress={resendOTP}>
                <Text>Resend OTP</Text>
            </TouchableOpacity>
            <Text>in {counter}</Text>
        </Modal>


        <Modal
          isVisible={userDetailsModal}
          backdropColor={'white'}
          backdropOpacity={1}
        >
        <Text>Personal Information</Text>
          <TextInput style={{ height: 30, borderColor: 'gray', borderBottomWidth: 1, marginBottom: hp(1) }} 
              placeholder={'Name'} onChangeText={(text) => setChangeName(text)} />
          <TextInput style={{ height: 30, borderColor: 'gray', borderBottomWidth: 1, marginBottom: hp(1) }} 
              placeholder={'Email'} onChangeText={(text) => setChangeEmail(text)} keyboardType={'email-address'} />
          {changeName === '' && changeEmail === '' ?
            <TouchableOpacity disabled={true} style={{opacity: 0.2}}>
              <Text>Save</Text>
            </TouchableOpacity> :
            <TouchableOpacity disabled={false} style={{opacity: 1}} onPress={editProfile}>
              <Text>Save</Text>
            </TouchableOpacity>
            }
            <TouchableOpacity onPress={() => navigation.popToTop()}>
                <Text>Skip</Text>
            </TouchableOpacity>
          
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