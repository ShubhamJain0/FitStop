import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { TouchableNativeFeedback } from 'react-native';
import { StyleSheet, Text, View, RefreshControl, ScrollView, SafeAreaView, Image, Button, TouchableOpacity, TextInput } from 'react-native';
import Modal from 'react-native-modal';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';


export default function Confirm({ navigation }) {
  const [cartList, setCartList] = useState([]);
  const [cartStatus, setCartStatus] = useState(401);
  const [total, setTotal] = useState(0);

  const [myAddresses, setMyAddresses] = useState([]);
  const [myAddressesStatus, setMyAddressesStatus] = useState(401);
  const [deliveryAddress, setDeliveryAddress] = useState([]);
  const [deliveryAddressStatus, setDeliveryAddressStatus] = useState(401);
  const [addressModal, setAddressModal] = useState(false);
  const [inputAddress, setInputAddress] = useState('');
  const [inputLocality, setInputLocality] = useState('');
  const [inputCity, setInputCity] = useState('Hyderabad');
  const [inputAddressType, setInputAddressType] = useState('');

  const [loading, setLoading] = useState('true');
  const [refreshing, setRefreshing] = useState(false);


  useEffect(() => {

          fetch('http://192.168.29.234:8000/store/confirm/',{
          method: 'GET',
          headers: {
            'Authorization': 'Token 9b309283a29535f32c28fabbd3be4e08ee3b3f76',
            'Content-type': 'application/json'
          }
          })
          .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
          .then(resp => (setCartList(resp.json.items), setTotal(resp.json.total), setCartStatus(resp.status)))
          .then(() => setLoading('false'))
          .catch(error => console.log(error))
      
  }, [])


  useEffect(() => {

    fetch('http://192.168.29.234:8000/store/myaddress/',{
    method: 'GET',
    headers: {
      'Authorization': 'Token 9b309283a29535f32c28fabbd3be4e08ee3b3f76',
      'Content-type': 'application/json'
    }
    })
    .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
    .then(resp => (setMyAddresses(resp.json), setMyAddressesStatus(resp.status)))
    .catch(error => console.log(error))

}, [])


useEffect(() => {

    fetch('http://192.168.29.234:8000/store/getdeliveryaddress/',{
    method: 'GET',
    headers: {
      'Authorization': 'Token 9b309283a29535f32c28fabbd3be4e08ee3b3f76',
      'Content-type': 'application/json'
    }
    })
    .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
    .then(resp => (setDeliveryAddress(resp.json.address), setDeliveryAddressStatus(resp.status)))
    .catch(error => console.log(error))

}, [])


  const wait = timeout => {
      return new Promise(resolve => {
        setTimeout(resolve, timeout);
      });
  };


  const onRefresh = React.useCallback(() => {
      setRefreshing(true);
  
      wait(2000).then(() => setRefreshing(false))
  
      fetch('http://192.168.29.234:8000/store/confirm/',{
          method: 'GET',
          headers: {
          'Content-type': 'application/json'
          }
      })
      .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
      .then(resp => console.log(resp.json))
      .then(() => setLoading('false'))
      .catch(error => console.log(error))
  
      
  }, []);


  const addAddress = () => {
        fetch('http://192.168.29.234:8000/store/myaddress/',{
            method: 'POST',
            headers: {
                'Authorization': 'Token 9b309283a29535f32c28fabbd3be4e08ee3b3f76',
                'Content-type': 'application/json'
            },
            body: JSON.stringify({ address: inputAddress, locality: inputLocality, city: inputCity, type_of_address: inputAddressType })
        })
        .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => setMyAddresses(resp.json.data))
        .then(() => setMyAddressesStatus(200))
        .then(() => (setInputAddress(''), setInputLocality(''), setInputAddressType('')))
        .catch(error => console.log(error))
  }


  const deleteAddress = (item) => evt => {
    fetch('http://192.168.29.234:8000/store/myaddress/',{
            method: 'DELETE',
            headers: {
                'Authorization': 'Token 9b309283a29535f32c28fabbd3be4e08ee3b3f76',
                'Content-type': 'application/json'
            },
            body: JSON.stringify({ address_id: item.id })
        })
        .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => (setMyAddresses(resp.json.data),  setMyAddressesStatus(resp.status), setDeliveryAddressStatus(resp.json.deliveryaddstatus)))
        .catch(error => console.log(error))
  }


  const setDeliveryAdrress = (item) => evt => {
    fetch('http://192.168.29.234:8000/store/deliveryaddress/',{
        method: 'POST',
        headers: {
          'Authorization': 'Token 9b309283a29535f32c28fabbd3be4e08ee3b3f76',
          'Content-type': 'application/json'
        },
        body: JSON.stringify({ address_id: item.id })
    })
    .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
    .then(() => setDeliveryAddress([item]))
    .then(() => setDeliveryAddressStatus(200))
    .then(() => setAddressModal(false))
    .then(() => (setInputAddress(''), setInputLocality(''), setInputAddressType('')))
    .catch(error => console.log(error))
  }


  const placeOrder = () => {
    fetch('http://192.168.29.234:8000/store/order/',{
        method: 'GET',
        headers: {
          'Authorization': 'Token 9b309283a29535f32c28fabbd3be4e08ee3b3f76',
          'Content-type': 'application/json'
        }
    })
    .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
    .then(resp => console.log(resp.json))
    .catch(error => console.log(error))
  }



  if (loading == 'true') {
      return (
          <SafeAreaView style={styles.refreshcontainer}>
              <ScrollView
                  contentContainerStyle={styles.refreshscrollview}
                  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              >
                  <Text style={{color: 'black', fontSize: 20}}>Loading....</Text>
                  <Text style={{color: 'black', marginTop: 10}}>Pull down to refresh</Text>
              </ScrollView>
          </SafeAreaView>
      )
  }


  return (
      <ScrollView style={styles.container}>
          <StatusBar style="auto" />
          {cartStatus === 200 ? cartList.map((item) => {
              return (
                    <View key={item.id}>
                        <Text>{item.ordereditem}</Text>
                        <Text>x{item.count}</Text>
                        <Text>{item.items_price['price__sum']}</Text>
                    </View>
              )
          }): cartStatus === 404 ? <Text>Cart is empty!</Text>: <Text>Please login to continue</Text>}
        <Text>{total}</Text>
        <View style={{flex: 1}}>
            {deliveryAddressStatus === 200 ? deliveryAddress.map((item) => {
                return (
                    <View key={item.id}>
                        <Text>Items will be delivered to this location:</Text>
                        <Text>{item.address}, {item.locality}, {item.city}, {item.type_of_address}</Text>
                    </View>
                )
            }):<Text>You haven't set your delivery address yet!</Text>}
            <TouchableOpacity onPress={() => setAddressModal(true)}>
                {deliveryAddressStatus === 200 ? <Text>Change delivery address</Text>: <Text>Add delivery address</Text>}
            </TouchableOpacity>
            <SafeAreaView>
                <Modal
                    isVisible={addressModal}
                    backdropColor={'white'}
                    backdropOpacity={1}
                    onBackdropPress={() => (setAddressModal(false), setInputAddress(''), setInputLocality(''), setInputAddressType(''))}
                    
                    transparent={true}
                >   
                    <View style={{height: hp(50), marginTop: 'auto'}}>
                    <View>
                        <Text>Choose delivery address:</Text>
                        {myAddressesStatus === 200 ? myAddresses.map((item) => {
                            return (
                                <View key={item.id}>
                                    <TouchableOpacity onPress={setDeliveryAdrress(item)}>
                                        <Text>{item.address}, {item.locality}, {item.city}, {item.type_of_address}</Text>
                                        <TouchableOpacity onPress={deleteAddress(item)}>
                                            <Text>Delete Address</Text>
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                </View>
                            )
                        }):<Text>You don't have any saved addresses!</Text>}
                    </View>
                    <View style={{marginTop: hp(15)}}>
                        <TextInput style={{ height: 30, borderColor: 'gray', borderBottomWidth: 1, marginBottom: hp(1) }} placeholder={'Address'} onChangeText={(text) => setInputAddress(text)} />
                        <TextInput style={{ height: 30, borderColor: 'gray', borderBottomWidth: 1, marginBottom: hp(1) }} placeholder={'Locality'} onChangeText={(text) => setInputLocality(text)} />
                        <TextInput style={{ height: 30, borderColor: 'gray', borderBottomWidth: 1, marginBottom: hp(1) }} placeholder={'City'} value={inputCity} />
                        <TextInput style={{ height: 30, borderColor: 'gray', borderBottomWidth: 1, marginBottom: hp(1) }} placeholder={'Address type'} onChangeText={(text) => setInputAddressType(text)} />
                        {inputAddress === '' || inputLocality === '' || inputCity === '' || inputAddressType === '' ? 
                            <TouchableOpacity disabled={true}>
                                <Text style={{opacity: 0.1}}>Save address</Text>
                            </TouchableOpacity>:
                            <TouchableOpacity disabled={false} onPress={addAddress}>
                                <Text style={{opacity: 1}}>Save address</Text>
                            </TouchableOpacity>
                        }
                    </View>
                    </View>
                </Modal>
            </SafeAreaView>
            {myAddressesStatus === 200 && deliveryAddressStatus === 200 ? <TouchableOpacity onPress={placeOrder} style={{opacity: 1}}>
                <Text>Place</Text>
            </TouchableOpacity>:
            <TouchableOpacity disabled={true} style={{opacity: 0.1}}>
                <Text>Place</Text>
            </TouchableOpacity>
            }
            
        </View>
      </ScrollView>
  )
}


const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#fff',
      
  },
  refreshcontainer: {
        flex: 1,
        backgroundColor: 'white'
  },
  refreshscrollview: {
        flex: 1,
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
  },
});