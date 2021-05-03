import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { Button } from 'react-native';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image } from 'react-native';
import Modal from 'react-native-modal';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';


export default function Profile({ navigation }) {

  const [isLogin, setIsLogin] = useState(false);
  const [userData, setUserData] = useState({});
  const [changeName, setChangeName] = useState('');
  const [changeEmail, setChangeEmail] = useState('');

  const [error, setError] = useState('');

  const [modalVisible, setModalVisible] = useState(false);


  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('USER_TOKEN')
      if (token) {
        fetch('http://192.168.0.156:8000/api/me/',{
            method: 'GET',
            headers: {
            'Authorization': `Token ${token}`,
            'Content-type': 'application/json'
            }
        })
        .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => setUserData(resp.json))
        .then(() => setIsLogin(true))
        .catch(error => console.log(error))
      } else {
        setIsLogin(false);
      }
    })().catch(error => setError(error))
  }, [isLogin])


  useEffect(() => {
    const getToken = navigation.addListener('focus', () => {
      obtainToken();
    });

    getToken;

  }, [navigation])



  const obtainToken = async () => {
    const token = await AsyncStorage.getItem('USER_TOKEN')
    if (token) {
      return setIsLogin(true);
    }
    return setIsLogin(false);
  }


  const logout = async () => {
    await AsyncStorage.removeItem('USER_TOKEN')
    .then(() => setIsLogin(false))
    .then(() => navigation.navigate('Home'))
  }


  const editProfile = async () => {
    const token = await AsyncStorage.getItem('USER_TOKEN')
    if (token) {
      fetch('http://192.168.0.156:8000/api/me/',{
            method: 'PATCH',
            headers: {
            'Authorization': `Token ${token}`,
            'Content-type': 'application/json'
            },
            body: JSON.stringify({name: changeName ? changeName: userData.name, email: changeEmail ? changeEmail: userData.email})
        })
      .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
      .then(resp => {if (resp.status === 200) 
                      {setUserData(resp.json)
                      } else {
                        alert('Please enter valid information!')
                      }
        })
      .then(() => (setChangeName(''), setChangeEmail('')))
      .then(() => setModalVisible(false))
      .catch(error => console.log(error))
    }
  }

    if (isLogin === false) { 
      return (
        <View style={styles.container}>
          <TouchableOpacity onPress={() => navigation.navigate('Auth')}>
            <Text>Login Now</Text>
          </TouchableOpacity>
        </View>
      )
      
    }
    return (
      <View style={styles.container}>
        <Text>{userData.image ? <Image source={{uri: userData.image}} style={{width: 100, height: 80}} /> : <FontAwesome5 name="user-circle" size={50} color="black" />}</Text>
        <Text>{userData.name ? userData.name : 'guest'}</Text>
        <Text>{userData.email ? userData.email : 'No email address found'}</Text>

        <TouchableOpacity onPress={() => navigation.navigate('PreviousOrders')}>
          <Text>Previous Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Reviews', {action: 'view'})}>
          <Text>My reviews</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text>Edit Profile</Text>
        </TouchableOpacity>
        
        <Modal
          isVisible={modalVisible}
          backdropColor={'white'}
          onBackButtonPress={() => (setModalVisible(false), setChangeName(''), setChangeEmail(''))}
        >
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
          
        </Modal>
        
        <TouchableOpacity onPress={logout}>
          <Text>Logout</Text>
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
      justifyContent: 'center',
    },
});