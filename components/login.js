import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { Button } from 'react-native';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Auth({ navigation }) {

    const [phone, setPhone] = useState(0);
    const [password, setPassword] = useState('');
    const [loginStatus, setLoginStatus] = useState(0);

    const [disabled, setDisabled] = useState(false);


    const Login = () => {
        if (phone.length <= 9){
            return alert('Please enter 10 digit number')
        }
        setDisabled(true);
        fetch('http://192.168.29.234:8000/api/auth/',{
          method: 'POST',
          headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({username: phone, password: password})
        })
        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => {return (resp.json.token ? (saveToken(resp.json.token), navigation.goBack()): alert('Provided credentials are not valid! If you forgot your password try reset the password!'), setDisabled(false))})
        .catch(error => console.log(error))
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
            <TouchableOpacity disabled={true} onPress={Login}>
                <Text style={{opacity: 0.2}}>Login</Text>
            </TouchableOpacity>:
            <TouchableOpacity disabled={disabled} onPress={Login}>
                <Text style={disabled ? {opacity: 0.2}: {opacity: 1}}>Login</Text>
            </TouchableOpacity>
        }
        

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text>Dont have an account? SignUp now</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Reset')}>
            <Text>Reset password</Text>
        </TouchableOpacity>
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