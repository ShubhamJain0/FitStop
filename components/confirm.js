import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useContext } from 'react';
import { TouchableNativeFeedback } from 'react-native';
import { StyleSheet, Text, View, RefreshControl, ScrollView, SafeAreaView, Image, Button, TouchableOpacity, TextInput, FlatList, ActivityIndicator } from 'react-native';
import Modal from 'react-native-modal';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { UserContext, PushTokenContext } from './context';



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
  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState('Cash On Delivery');
  const [couponModal, setCouponModal] = useState(false);
  const [couponList, setCouponList] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [onPlaceModal, setOnPlaceModal] = useState(false);

  const [loading, setLoading] = useState('true');
  const [refreshing, setRefreshing] = useState(false);

  const [location, setLocation] = useState(null);
  const [reverseGeoLocation, setReverseGeoLocation] = useState(null);

  const [error, setError] = useState('');

  const [conlocation] = useContext(UserContext);
  const [conPushToken] = useContext(PushTokenContext);

  useEffect(() => {
        (async () => {
            const token = await AsyncStorage.getItem('USER_TOKEN')
            if (token) {
                fetch('http://192.168.29.234:8000/store/confirm/',{
                    method: 'GET',
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-type': 'application/json'
                    }
                })
                .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                .then(resp => (setCartList(resp.json.items), setTotal(resp.json.total), setCartStatus(resp.status)))
                .then(() => setLoading('false'))
                .catch(error => console.log(error))
            } else {
                navigation.navigate('Auth')
            }
        })().catch(error => setError(error))
          
      
  }, [])


  useEffect(() => {
    (async () => {
        const token = await AsyncStorage.getItem('USER_TOKEN')
        if (token) {
            fetch('http://192.168.29.234:8000/store/myaddress/',{
                method: 'GET',
                headers: {
                'Authorization': `Token ${token}`,
                'Content-type': 'application/json'
                }
            })
            .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
            .then(resp => (setMyAddresses(resp.json), setMyAddressesStatus(resp.status)))
            .catch(error => console.log(error))
        } else {
            navigation.navigate('Auth')
        }
    })().catch(error => setError(error))

    

}, [])


useEffect(() => {
    (async () => {
        const token = await AsyncStorage.getItem('USER_TOKEN')
        if (token) {
            fetch('http://192.168.29.234:8000/store/getdeliveryaddress/',{
                method: 'GET',
                headers: {
                'Authorization': `Token ${token}`,
                'Content-type': 'application/json'
                }
            })
            .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
            .then(resp => (setDeliveryAddress(resp.json.address), setDeliveryAddressStatus(resp.status)))
            .catch(error => console.log(error))
        } else {
            navigation.navigate('Auth')
        }
    })().catch(error => setError(error))

}, [])



useEffect(() => {
    (async () => {
        const token = await AsyncStorage.getItem('USER_TOKEN')
        if (token) {
            fetch('http://192.168.29.234:8000/store/coupons/',{
                method: 'GET',
                headers: {
                'Authorization': `Token ${token}`,
                'Content-type': 'application/json'
                }
            })
            .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
            .then(resp => setCouponList(resp.json.data))
            .catch(error => console.log(error))
        } else {
            navigation.navigate('Auth')
        }
    })().catch(error => setError(error))

}, [])


useEffect(() => {
    setInputAddress(conlocation.name);
    setInputLocality(conlocation.district);
}, [conlocation])



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


  const addAddress = async () => {
        const token = await AsyncStorage.getItem('USER_TOKEN')
        if (token) {
            fetch('http://192.168.29.234:8000/store/myaddress/',{
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({ address: inputAddress, locality: inputLocality, city: inputCity, type_of_address: inputAddressType })
            })
            .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
            .then(resp => (setMyAddresses(resp.json.data), setDeliveryAddress(resp.json.delivery_address)))
            .then(() => (setMyAddressesStatus(200), setDeliveryAddressStatus(200)))
            .then(() => (setInputAddress(''), setInputLocality(''), setInputAddressType('')))
            .then(() => setAddressModal(false))
            .catch(error => console.log(error))
        } else {
            navigation.navigate('Auth')
        }
        
  }


  const deleteAddress = (item) => async evt => {
    const token = await AsyncStorage.getItem('USER_TOKEN')
    if (token) {
        fetch('http://192.168.29.234:8000/store/myaddress/',{
            method: 'DELETE',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-type': 'application/json'
            },
            body: JSON.stringify({ address_id: item.id })
        })
        .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => (setMyAddresses(resp.json.data),  setMyAddressesStatus(resp.status), setDeliveryAddressStatus(resp.json.deliveryaddstatus)))
        .catch(error => console.log(error))
    } else {
        navigation.navigate('Auth')
    }
  }


    const setDeliveryAdrress = (item) => async evt => {
        const token = await AsyncStorage.getItem('USER_TOKEN')
        if (token) {
            fetch('http://192.168.29.234:8000/store/deliveryaddress/',{
                method: 'POST',
                headers: {
                'Authorization': `Token ${token}`,
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
        } else {
            navigation.navigate('Auth')
        }
    }


    const paymentMethod = () => {
        if (paymentType === 'Cash On Delivery'){
            console.log('Cash');
            placeOrder();
        } else if(paymentType === 'Card'){
            console.log('Card');
            placeOrder();
        } else if(paymentType === 'Wallet'){
            console.log('Wallet')
            placeOrder();
        }
    }



  const placeOrder = async () => {
    setOnPlaceModal(true);
    try {
        const token = await AsyncStorage.getItem('USER_TOKEN')
        if (token) {
            fetch('http://192.168.29.234:8000/store/order/',{
                method: 'POST',
                headers: {
                'Authorization': `Token ${token}`,
                'Content-type': 'application/json'
                },
                body: JSON.stringify({pushToken: conPushToken === null ? null: conPushToken.data, total_price: appliedCoupon ? total - appliedCoupon: total})
            })
            .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
            .then(resp => {
                if (resp.status === 201) {
                    navigation.navigate('Fruits');
                    navigation.navigate('ActiveOrders');
                } else {
                    setOnPlaceModal(false);
                }
            })
            .catch(error => console.log(error))
        } else {
            navigation.navigate('Auth')
        }
    } catch(error) {
        if (error) {
            setOnPlaceModal(false);
            console.log(error);
        }
    }
  }



  if (loading == 'true') {
      return (
          <SafeAreaView style={styles.refreshcontainer}>
              <ScrollView bounces={false}
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
      <ScrollView bounces={false} style={styles.container}>
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
        {appliedCoupon ? <Text>{total - appliedCoupon}</Text>: <Text>{total}</Text>}
        <View style={{flex: 1}}>
            {deliveryAddressStatus === 200 ? deliveryAddress.map((item) => {
                return (
                    <View key={item.id}>
                        <Text>Items will be delivered to this location:</Text>
                        <Text>{item.address}, {item.locality}, {item.city}</Text>
                    </View>
                )
            }):<Text>You haven't set your delivery address yet!</Text>}
            <TouchableOpacity onPress={() => setAddressModal(true)}>
                {deliveryAddressStatus === 200 ? <Text>Change delivery address</Text>: <Text>Add delivery address</Text>}
            </TouchableOpacity>
            <Text>{paymentType}</Text>
            <TouchableOpacity onPress={() => setCouponModal(true)}>
                <Text>Apply Coupon</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPaymentModal(true)}>
                <Text>Change Payment Method</Text>
            </TouchableOpacity>
            {myAddressesStatus === 200 && deliveryAddressStatus === 200 && cartStatus === 200 ? 
            <TouchableOpacity onPress={paymentMethod} style={{opacity: 1}}>
                <Text>Place</Text>
            </TouchableOpacity>:
            <TouchableOpacity disabled={true} style={{opacity: 0.1}}>
                <Text>Place</Text>
            </TouchableOpacity>
            }

            <Modal
                isVisible={addressModal}
                backdropColor={'white'}
                backdropOpacity={1}
            >   
                    
                    <ScrollView bounces={false}>
                        <TouchableOpacity style={{alignSelf: 'flex-end'}} onPress={() => (setAddressModal(false), setInputAddress(''), setInputLocality(''), setInputAddressType(''))}>
                            <Text>Close</Text>
                        </TouchableOpacity>
                        <View style={{marginTop: hp(15)}} >
                            <TextInput style={{ height: 30, borderColor: 'gray', borderBottomWidth: 1, marginBottom: hp(1) }} placeholder={'H.no, street'} value={inputAddress} onChangeText={(text) => setInputAddress(text)} />
                            <TextInput style={{ height: 30, borderColor: 'gray', borderBottomWidth: 1, marginBottom: hp(1) }} placeholder={'Locality'} value={inputLocality} onChangeText={(text) => setInputLocality(text)} />
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
                    </ScrollView>
                    
            </Modal>

            <Modal 
                isVisible={paymentModal}
                backdropColor={'white'}
                backdropOpacity={1} 
            >
                <TouchableOpacity style={paymentType === 'Cash On Delivery' ? {opacity: 1}: {opacity: 0.2}} onPress={() => (setPaymentType('Cash On Delivery'), setPaymentModal(false))}>
                    <Text>Cash On Delivery</Text>
                </TouchableOpacity>
                <TouchableOpacity style={paymentType === 'Card' ? {opacity: 1}: {opacity: 0.2}} onPress={() => (setPaymentType('Card'), setPaymentModal(false))}>
                    <Text>Card</Text>
                </TouchableOpacity>
                <TouchableOpacity style={paymentType === 'Wallet' ? {opacity: 1}: {opacity: 0.2}} onPress={() => (setPaymentType('Wallet'), setPaymentModal(false))}>
                    <Text>Wallet</Text>
                </TouchableOpacity>
                
            </Modal>


            <Modal
                isVisible={couponModal}
                backdropColor={'white'}
                backdropOpacity={1}
                onBackButtonPress={() => setCouponModal(false)}
            >
                <FlatList 
                    data={couponList}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View>
                            <Text>{item.name}</Text>
                            <Text>{item.description}</Text>
                            <TouchableOpacity disabled={total - 20 > item.min_items_price ? false : true} onPress={() => (setAppliedCoupon(item.discount), setCouponModal(false))}>
                                <Text style={total - 20 > item.min_items_price ? {opacity: 1}: {opacity: 0.2}}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </Modal>

            <Modal 
                isVisible={onPlaceModal}
                backdropColor={'white'}
                backdropOpacity={0.5}
            >
                <ActivityIndicator color="red" size={50} />
            </Modal>
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