import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useContext, useRef } from 'react';
import { TouchableNativeFeedback } from 'react-native';
import { StyleSheet, Text, View, RefreshControl, ScrollView, SafeAreaView, Image, Button, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import { AntDesign, FontAwesome, MaterialIcons, Entypo, Ionicons, EvilIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext, PushTokenContext } from './context';
import * as Location from 'expo-location';
import MapView, {Marker, AnimatedRegion, Callout, MarkerAnimated} from 'react-native-maps';



export default function Cart({ navigation }) {

  const [mounted, setMounted] = useState(true);

  const [cartList, setCartList] = useState([]);
  const [itemPhotos, setItemPhotos] = useState([]);
  const [test, setTest] = useState([]);
  const [test1, setTest1] = useState([]);
  const [cartStatus, setCartStatus] = useState(0);
  const [total, setTotal] = useState(0);
  const [deliveryCharges, setDeliveryCharges] = useState(0);
  const [taxes, setTaxes] = useState(0);

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
  const couponAppliedRef = useRef(null);
  const [animationModal, setAnimationModal] = useState(false);
  const [onPlaceModal, setOnPlaceModal] = useState(false);
  const [indicPos, setIndicPos] = useState('relative');


  const [mapDefLocation, setMapDefLocation] = useState({latitude: 17.4217697, longitude: 78.4749875, latitudeDelta: 0.1, longitudeDelta: 0.1});
  const [markerData, setMarkerData] = useState({latitude: 17.4217697, longitude: 78.4749875 });
  const mapRef = useRef(null);


  const [error, setError] = useState('');

  const [conPushToken] = useContext(PushTokenContext);

    useEffect(() => {
            (async () => {
                const token = await AsyncStorage.getItem('USER_TOKEN')
                if (token) {
                    fetch('http://192.168.0.105:8000/store/confirm/',{
                        method: 'GET',
                        headers: {
                            'Authorization': `Token ${token}`,
                            'Content-type': 'application/json'
                        }
                    })
                    .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                    .then(resp => {if (mounted) {setCartList(resp.json.items), setTotal(resp.json.total), setCartStatus(resp.status), setItemPhotos(resp.json.photos), setTest(resp.json.custom_count)}})
                    .catch(error => console.log(error))
                } else {
                    setCartStatus(401);
                }
            })().catch(error => setError(error))


            return () => {
                setMounted(false);
            }
        
    }, [])


    useEffect(() => {
        (async () => {
            const token = await AsyncStorage.getItem('USER_TOKEN')
            if (token) {
                fetch('http://192.168.0.105:8000/store/myaddress/',{
                    method: 'GET',
                    headers: {
                    'Authorization': `Token ${token}`,
                    'Content-type': 'application/json'
                    }
                })
                .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                .then(resp => {if (mounted) {setMyAddresses(resp.json), setMyAddressesStatus(resp.status)}})
                .catch(error => console.log(error))
            } else {
                setCartStatus(401);
            }
        })().catch(error => setError(error))


        return () => {
            setMounted(false);
        }
    

    }, [])


    useEffect(() => {
        (async () => {
            const token = await AsyncStorage.getItem('USER_TOKEN')
            if (token) {
                fetch('http://192.168.0.105:8000/store/getdeliveryaddress/',{
                    method: 'GET',
                    headers: {
                    'Authorization': `Token ${token}`,
                    'Content-type': 'application/json'
                    }
                })
                .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                .then(resp => {if (mounted) {setDeliveryAddress(resp.json.address), setDeliveryAddressStatus(resp.status)}})
                .catch(error => console.log(error))
            } else {
                setCartStatus(401);
            }
        })().catch(error => setError(error))


        return () => {
            setMounted(false);
        }

    }, [])



    useEffect(() => {
        (async () => {
            const token = await AsyncStorage.getItem('USER_TOKEN')
            if (token) {
                fetch('http://192.168.0.105:8000/store/coupons/',{
                    method: 'GET',
                    headers: {
                    'Authorization': `Token ${token}`,
                    'Content-type': 'application/json'
                    }
                })
                .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                .then(resp => {if (mounted) {setCouponList(resp.json.data)}})
                .catch(error => console.log(error))
            } else {
                setCartStatus(401);
            }
        })().catch(error => setError(error))

        return () => {
            setMounted(false);
        }

    }, [])


    useEffect(() => {
        setDeliveryCharges(25);
        let gst = 0.05;
        setTaxes(Math.round(total * gst));
    }, [total])



  const wait = timeout => {
      return new Promise(resolve => {
        setTimeout(resolve, timeout);
      });
  };



  const addAddress = async () => {
        const token = await AsyncStorage.getItem('USER_TOKEN')
        if (token) {
            setIndicPos('absolute');
            fetch('http://192.168.0.105:8000/store/myaddress/',{
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
            .then(() => setIndicPos('relative'))
            .catch(error => console.log(error))
        } else {
            navigation.navigate('Register')
        }
        
  }


  const deleteAddress = (item) => async evt => {
    const token = await AsyncStorage.getItem('USER_TOKEN')
    if (token) {
        fetch('http://192.168.0.105:8000/store/myaddress/',{
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
        navigation.navigate('Register')
    }
  }


    const setDeliveryAdrress = (item) => async evt => {
        const token = await AsyncStorage.getItem('USER_TOKEN')
        if (token) {
            fetch('http://192.168.0.105:8000/store/deliveryaddress/',{
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
            navigation.navigate('Register')
        }
    }



    //Location

  const handleRegionChange = async (mapData) => {

    if(mounted){
      setMarkerData({latitude: mapData.latitude, longitude: mapData.longitude});
      setMapDefLocation({latitude: mapData.latitude, longitude: mapData.longitude, latitudeDelta: 0.006, longitudeDelta: 0.006});
    }

    let geolocation = await Location.reverseGeocodeAsync({latitude: mapData.latitude, longitude: mapData.longitude})
    if (mounted) {
      setInputAddress(geolocation[0].name !== 'Unnamed Road' ? geolocation[0].name : '');
      setInputCity(geolocation[0].district ? geolocation[0].district + ', Hyderabad' : geolocation[0].postalCode ? geolocation[0].postalCode + ', Hyderabad' : 'Hyderabad')
    }

  }


  const getLocation = () => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        return;
      }
      
      let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
      mapRef.current.animateToRegion({latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.006, longitudeDelta: 0.006}, 1500)
      
      let geolocation = await Location.reverseGeocodeAsync({latitude: location.coords.latitude, longitude: location.coords.longitude})
      if (mounted) {
        setInputAddress(geolocation[0].name !== 'Unnamed Road' ? geolocation[0].name : '');
        setInputCity(geolocation[0].district ? geolocation[0].district + ', Hyderabad' : geolocation[0].postalCode ? geolocation[0].postalCode + ', Hyderabad' : 'Hyderabad')
        setMarkerData({latitude: location.coords.latitude, longitude: location.coords.longitude});
        setMapDefLocation({latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.006, longitudeDelta: 0.006}) 
      }

    })().catch(error => setErrormsg(error))
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
            fetch('http://192.168.0.105:8000/store/order/',{
                method: 'POST',
                headers: {
                'Authorization': `Token ${token}`,
                'Content-type': 'application/json'
                },
                body: JSON.stringify({pushToken: conPushToken === null ? null: conPushToken.data, total_price: appliedCoupon ? total + deliveryCharges + taxes - appliedCoupon.discount: total + deliveryCharges + taxes, cart_total: total, coupon: appliedCoupon ? appliedCoupon.discount: 0, delivery_charges: deliveryCharges, taxes: taxes, payment: paymentType})
            })
            .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
            .then(resp => {
                if (resp.status === 201) {
                    navigation.pop();
                    navigation.navigate('ActiveOrders');
                } else {
                    setOnPlaceModal(false);
                }
            })
            .catch(error => console.log(error))
        } else {
            navigation.navigate('Register')
        }
    } catch(error) {
        if (error) {
            setOnPlaceModal(false);
            console.log(error);
        }
    }
  }



  const deleteCart = () => async evt=>  {
    const token = await AsyncStorage.getItem('USER_TOKEN')
    if (token)
        fetch('http://192.168.0.105:8000/store/cart/',{
            method: 'DELETE',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-type': 'application/json'
            }
        })
        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
        .then(() => navigation.goBack())
        .catch(error => console.log(error))
    }


    const deleteItem = async (item) => {
        const token = await AsyncStorage.getItem('USER_TOKEN')
        if (token)
            fetch('http://192.168.0.105:8000/store/reduceordelete/',{
                method: 'DELETE',
                headers: {
                'Authorization': `Token ${token}`,
                'Content-type': 'application/json'
                },
                body: JSON.stringify({ item: item })
            })
            .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
            .then(resp => {
                setCartList(resp.json.items);
                setTotal(resp.json.total);
                setItemPhotos(resp.json.photos);
                if (resp.json.items.length === 0){
                    setCartStatus(404);
                }
                if (appliedCoupon && resp.json.total < appliedCoupon.min_items_price) {
                    setAppliedCoupon(null);
                }
            })
            .then(() => {})
            .catch(error => console.log(error))
    }



    const animationModalShow = () => {
        wait(400).then(() => setAnimationModal(true));
    }




  if (cartStatus === 0) {
      return (
          <View style={[styles.container, {justifyContent: 'center'}]}>
              <ActivityIndicator color={'#99b898'} size={30} />
          </View>
      )
  }

  
  if (cartStatus === 404){
      return (
          <View style={styles.container}>
              <Text style={{textAlign: 'center', fontFamily: 'sofia-medium'}}>Your cart is empty!</Text>
          </View>
      )
  }


  if (cartStatus === 401){
        return (
            <View style={[styles.container, {flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}]}>
                <Text style={{fontFamily: 'sofia-medium', fontSize: wp(5)}}>Please</Text>
                <TouchableOpacity onPress={() => (navigation.goBack(), navigation.navigate('Register'))}>
                    <Text style={{color: '#99b898', fontFamily: 'sofia-bold', fontSize: wp(5)}}> login </Text>
                </TouchableOpacity> 
                <Text style={{fontFamily: 'sofia-medium', fontSize: wp(5)}}>to continue!</Text>
            </View>
        )
    }

  return (
      <View style={styles.container}>
          <TouchableOpacity style={{marginRight: hp(5), marginBottom: hp(5), alignSelf: 'flex-end'}} disabled={cartStatus === 200 ? false: true} onPress={deleteCart()}>
                <Text style={cartStatus === 200 ? {opacity: 1, fontFamily: 'sofia-medium', color: "#F67280", textDecorationLine: 'underline'} : {opacity: 0.1, fontFamily: 'sofia-medium', color: "#F67280", textDecorationLine: 'underline'}}>Empty cart</Text>
            </TouchableOpacity>
            <View>
                <ScrollView contentContainerStyle={cartList.length > 2 ? {backgroundColor: 'white'}: {backgroundColor: 'white', flex: 1, justifyContent: 'center'}} horizontal={true} showsHorizontalScrollIndicator={false}>
                {cartStatus === 200 ? cartList.map((item) => {
                    return (
                        <View style={{backgroundColor: 'white', maxWidth: '40%', elevation: 5, shadowOffset: {width: 0.5, height: 2}, shadowRadius: 3, shadowOpacity: 0.3, marginBottom: 15, marginRight: 25, margin: 10, padding: 20, paddingBottom: 30, borderRadius: 10}} key={item.id}>
                            {itemPhotos.map((item1) => {
                                return item1.name === item.ordereditem ? 
                                <View key={item1.id}>
                                    <Image source={{uri: item1.image}} style={{width: 100, height: 80}} />
                                </View>
                                : null
                            })}
                            <Text style={{fontFamily: 'sf-semi', textAlign: 'center', marginTop: 5, fontSize: wp(4)}}>{item.ordereditem}</Text>
                            {test.map(w => {
                                return w.get_count.map(x => {
                                    return x.ordereditem === item.ordereditem ?
                                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}} key={x.weight}>
                                        <Text style={{fontFamily: 'sf', textAlign: 'center', marginTop: 5, fontSize: wp(3.5)}}>{x.weight}  x{x.cou}</Text>
                                    </View>: null
                                })
                            })}
                            <Text style={{fontFamily: 'sofia-medium', fontSize: wp(3.5), position: 'absolute', bottom: 5, alignSelf: 'center', marginTop: 10}}> &#8377; {item.items_price['price__sum']} </Text>
                            <TouchableOpacity style={{position: 'absolute', top: 2, right: 2}} onPress={() => deleteItem(item)}>
                                <Entypo name="circle-with-cross" size={15} color="#F67280" />
                            </TouchableOpacity>
                        </View>
                    )
                }): cartStatus === 404 ? <Text style={{textAlign: 'center', fontFamily: 'sofia-medium'}}>Your cart is empty!</Text>: <Text>Please Login to build your cart!</Text>}
                </ScrollView>
            </View>
            <Text style={{borderTopWidth: 1, width: '90%', alignSelf: 'center', marginTop: 25, borderColor: 'grey'}}></Text>
        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            <View style={{flex: 1, marginTop: 10}}>
                {deliveryAddressStatus === 200 ? deliveryAddress.map((item) => {
                    return (
                        <View key={item.id} style={{marginLeft: wp(10)}}>
                            <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: wp(-8)}}>
                                <LottieView source={require('../assets/animations/lf30_editor_sotlhn4y.json')} autoPlay={true} loop={true} style={{width: 30, height: 30}} />
                                <Text style={{fontFamily: 'sf-semi', fontSize: wp(4.5)}}>Items will be delivered at:</Text>
                            </View>
                            <Text style={{flex: 1, fontFamily: 'sf', fontSize: wp(4)}}>{item.address}, {item.locality}, {item.city}</Text>
                            <TouchableOpacity style={{marginTop: 5, alignSelf: 'flex-start'}} onPress={() => setAddressModal(true)}>
                                <Text style={{textDecorationLine: 'underline', fontFamily: 'sf'}}>Change delivery address</Text>
                            </TouchableOpacity>
                        </View>
                    )
                }):
                <View style={{marginLeft: wp(10)}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: wp(-8)}}>
                        <LottieView source={require('../assets/animations/lf30_editor_sotlhn4y.json')} autoPlay={true} loop={true} style={{width: 30, height: 30}} />
                        <Text style={{fontFamily: 'sf-semi', fontSize: wp(4), color: 'red'}}>You haven't set your delivery address yet!</Text>
                    </View>
                    <TouchableOpacity style={{marginTop: 5}} onPress={() => setAddressModal(true)}>
                        <Text style={{textDecorationLine: 'underline', fontFamily: 'sf'}}>Add delivery address</Text>
                    </TouchableOpacity>
                </View>}
                <View style={{marginLeft: wp(6), marginTop: 40, backgroundColor: '#f0f0f0', width: '90%', padding: 10, paddingBottom: 20, borderRadius: 10}}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <LottieView source={require('../assets/animations/48974-offer-animation.json')} autoPlay={true} loop={true} style={{width: 30, height: 30}} />
                        <Text style={{fontFamily: 'sofia-bold', fontSize: wp(4.5)}}>Offers</Text>
                    </View>
                    <View style={{flexDirection: 'row', marginTop: 5}}>
                        {appliedCoupon ? <Text style={{fontFamily: 'sf', flex: 1}}>&#8377; {appliedCoupon.discount} off applied on your order!</Text> : <Text style={{fontFamily: 'sf', flex: 1, marginLeft: 25}}>No offer applied!</Text>}
                        {appliedCoupon ? 
                            <TouchableOpacity style={{flex: 0.2, justifyContent: 'center'}} onPress={() => setAppliedCoupon(null)}>
                                <FontAwesome name="remove" size={15} color="black" />
                            </TouchableOpacity>:
                            <TouchableOpacity style={{flex: 0.5}} onPress={() => setCouponModal(true)}>
                                <Text style={{fontFamily: 'sf-semi', color: '#249C86'}}>View offers</Text>
                            </TouchableOpacity>
                        }
                    </View>
                </View>
                <View style={{marginLeft: wp(6), marginTop: 35, width: '90%', padding: 15, backgroundColor: 'white', elevation: 5, shadowOffset: {width: 0.5, height: 2}, shadowRadius: 3, shadowOpacity: 0.3, borderRadius: 10, marginBottom: 50}}>
                    <Ionicons name="receipt-outline" size={30} color="black" />
                    <Text></Text>
                    <View style={{flexDirection: 'row', marginBottom: 5}}>
                        <Text style={{flex: 1, fontFamily: 'sf'}}>Item subtotal</Text>
                        <Text style={{flex: 1, textAlign: 'right', fontFamily: 'sf-semi'}}>&#8377; {total}</Text>
                    </View>
                    <View style={{flexDirection: 'row', marginBottom: 5}}>
                        <Text style={{flex: 1, fontFamily: 'sf'}}>Delivery Charges</Text>
                        <Text style={{flex: 1, textAlign: 'right', fontFamily: 'sf-semi'}}>&#8377; {deliveryCharges}</Text>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                        <Text style={{flex: 1, fontFamily: 'sf', marginBottom: 5}}>Taxes</Text>
                        <Text style={{flex: 1, textAlign: 'right', fontFamily: 'sf-semi'}}>&#8377; {taxes}</Text>
                    </View>
                    {appliedCoupon ? 
                        <View style={{flexDirection: 'row'}}>
                            <Text style={{flex: 1, fontFamily: 'sf-semi', marginBottom: 5}}>Coupon Applied</Text>
                            <Text style={{flex: 1, textAlign: 'right', fontFamily: 'sf-semi'}}>- &#8377; {appliedCoupon.discount}</Text>
                        </View>: null
                    }
                    <View style={{flexDirection: 'row'}}>
                        <Text style={{flex: 1, fontFamily: 'sofia-bold', fontSize: wp(4.5)}}>Grand Total</Text>
                        {appliedCoupon ? <Text style={{flex: 1, textAlign: 'right', fontFamily: 'sofia-bold', fontSize: wp(4.5)}}>&#8377; {total + deliveryCharges + taxes - appliedCoupon.discount}</Text>: <Text style={{flex: 1, textAlign: 'right', fontFamily: 'sofia-bold', fontSize: wp(4.5)}}>&#8377; {total + deliveryCharges + taxes}</Text>}
                    </View>
                </View>

                <Modal
                    isVisible={addressModal}
                    backdropColor={'white'}
                    backdropOpacity={1}
                    animationIn={'slideInLeft'}
                    animationOut={'slideOutRight'}
                    backdropTransitionInTiming={600}
                    backdropTransitionOutTiming={600}
                    animationInTiming={600}
                    animationOutTiming={600}
                    useNativeDriver={true}
                    style={{margin: 0}}
                    onBackButtonPress={() => (setAddressModal(false), setInputAddress(''), setInputLocality(''), setInputAddressType(''))}
                >
                    <View style={{marginBottom: hp(40)}}>
                        <MapView
                            ref={mapRef}
                            style={styles.map}
                            initialRegion={mapDefLocation}
                            showsUserLocation={true}
                            showsMyLocationButton={false}
                            onRegionChangeComplete={handleRegionChange}
                            customMapStyle={mapStyle}
                        >
                            <Marker.Animated draggable
                            coordinate={markerData}
                            onDragEnd={(e) => handleRegionChange(e.nativeEvent.coordinate)}
                            />
                        </MapView>
                        
                        <TouchableOpacity style={{position: 'absolute', top: 5, left: 5}} onPress={() => (setAddressModal(false), setInputAddress(''), setInputLocality(''), setInputAddressType(''))}>
                            <Entypo name="circle-with-cross" size={wp(6)} color="black" />
                        </TouchableOpacity>
                        <TouchableOpacity style={{position: 'absolute', top: 15, right: 5, backgroundColor: '#f0f0f0', padding: wp(2), elevation: 25, shadowOffset: {width: 0, height: 12}, shadowRadius: 16, shadowOpacity: 0.58}} onPress={getLocation}>
                        {Platform.OS === 'android' ? <MaterialIcons name="my-location" size={wp(8)} color="black" />: <Ionicons name="ios-location" size={wp(6.5)} color="black" />}
                        </TouchableOpacity>
                    </View>
                    <View style={{backgroundColor: 'white', elevation: 25, shadowOffset: {width: 0, height: 12}, shadowRadius: 16, shadowOpacity: 0.58, borderTopLeftRadius: 50, borderTopRightRadius: 50, flex: 1, paddingTop: 5}}>
                        <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={{padding: 35, paddingBottom: 10}} >
                            <Text style={{fontFamily: 'sofia-black', fontSize: wp(8)}}>Address</Text>
                            <Text style={{fontFamily: 'sf', fontSize: wp(3.5)}}>Add new address where the order should be delivered or choose from below saved addresses.</Text>
                            <View style={{marginTop: hp(5)}} >
                                <ActivityIndicator size={50} color="#99b898" style={{position: indicPos, display: 'none', alignSelf: 'center', top: 0, bottom: 0}} />
                                <TextInput style={{ height: 30, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginBottom: 10, fontFamily: 'sf' }} placeholder={'House/Colony'} value={inputAddress} onChangeText={(text) => setInputAddress(text)} />
                                <TextInput style={{ height: 30, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginBottom: 10, fontFamily: 'sf' }} placeholder={'Road Number, Road Name'} value={inputLocality} onChangeText={(text) => setInputLocality(text)} />
                                <TextInput style={{ height: 30, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginBottom: 10, fontFamily: 'sf' }} placeholder={'City'} value={inputCity} />
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <TouchableOpacity style={{backgroundColor: inputAddressType === 'Home' ? '#11999e' :'white', padding: 10, borderRadius: 5, borderWidth: 0.3}} onPress={() => setInputAddressType('Home')} activeOpacity={1}>
                                        <Text style={{fontFamily: 'sf', fontSize: wp(3), textAlign: 'center', color: inputAddressType === 'Home' ? 'white': 'black'}}>Home</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{marginLeft: 25, backgroundColor: inputAddressType === 'Work' ? '#11999e' :'white', padding: 10, borderRadius: 5, borderWidth: 0.3}} onPress={() => setInputAddressType('Work')} activeOpacity={1}>
                                    <Text style={{fontFamily: 'sf', fontSize: wp(3), textAlign: 'center', color: inputAddressType === 'Work' ? 'white': 'black'}}>Work</Text>
                                    </TouchableOpacity>
                                </View>
                                {inputAddress === '' || inputLocality === '' || inputCity === '' || inputAddressType === '' ? 
                                    <TouchableOpacity style={{marginTop: 25, opacity: 0.2, backgroundColor: '#99b898', padding: 10, borderRadius: 10}} disabled={true}>
                                        <Text style={{fontFamily: 'sf-semi', fontSize: wp(3), textAlign: 'center'}}>Save address</Text>
                                    </TouchableOpacity>:
                                    <TouchableOpacity style={{marginTop: 25, opacity: 1, backgroundColor: '#99b898', padding: 10, borderRadius: 10}} disabled={false} onPress={addAddress}>
                                        <Text style={{fontFamily: 'sf-semi', fontSize: wp(3), textAlign: 'center'}}>Save address</Text>
                                    </TouchableOpacity>
                                }
                            </View>
                            <View style={{marginTop: 50}}>
                            <Text style={{fontFamily: 'sf-semi', fontSize: wp(5), marginBottom: 25}}>Choose delivery address</Text>
                                {myAddressesStatus === 200 ? myAddresses.map((item) => {
                                    return (
                                        <View key={item.id}>
                                            <TouchableOpacity onPress={setDeliveryAdrress(item)}>
                                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                                    {item.type_of_address === 'Home' ?  <MaterialIcons name="home" size={wp(6)} color="black" />: <MaterialIcons name="work" size={wp(5)} color="black" />}
                                                    <Text style={{fontFamily: 'sf-semi', fontSize: wp(4)}}> {item.type_of_address}</Text>
                                                </View>
                                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                                    <Text style={{fontFamily: 'sf', flex: 1}}>{item.address}, {item.locality}, {item.city}</Text>
                                                    <TouchableOpacity onPress={deleteAddress(item)}>
                                                        <Text style={{fontFamily: 'sf', color: 'red'}}>Remove</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </TouchableOpacity>
                                            <Text style={{borderBottomWidth: 2, marginBottom: 20, borderBottomColor: '#f0f0f0'}}></Text>
                                        </View>
                                    )
                                }):<Text style={{fontFamily: 'sf'}}>You don't have any saved addresses. Add one now!</Text>}
                            </View>
                        </ScrollView>    
                    </View>     
                </Modal>

                <Modal 
                    isVisible={paymentModal}
                    backdropColor={'white'}
                    backdropOpacity={1} 
                    backdropTransitionInTiming={600}
                    backdropTransitionOutTiming={600}
                    animationInTiming={600}
                    animationOutTiming={600}
                    useNativeDriver={true}
                >
                    <View style={{flex: 1}}>
                        <Text style={{fontFamily: 'sofia-black', fontSize: wp(6), marginTop: hp(4), marginBottom: hp(4)}}>Choose payment method</Text>
                        <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => (setPaymentType('Cash On Delivery'), setPaymentModal(false))}>
                            <MaterialCommunityIcons name="cash" size={20} color="green"/>
                            <Text style={{fontFamily: 'sf', fontSize: wp(4)}}> Cash On Delivery</Text>
                        </TouchableOpacity>
                        <Text style={{borderTopWidth: 2, borderColor: '#f0f0f0', marginTop: 25}}></Text>
                        <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => (setPaymentType('Card'), setPaymentModal(false))}>
                            <Entypo name="credit-card" size={20} color="black" />
                            <Text style={{fontFamily: 'sf', fontSize: wp(4)}}> Card</Text>
                        </TouchableOpacity>
                        <Text style={{borderTopWidth: 2, borderColor: '#f0f0f0', marginTop: 25}}></Text>
                        <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => (setPaymentType('Wallet'), setPaymentModal(false))}>
                            <FontAwesome name="google-wallet" size={20} color="blue" />
                            <Text style={{fontFamily: 'sf', fontSize: wp(4)}}> Wallet</Text>
                        </TouchableOpacity>
                        <Text style={{borderTopWidth: 2, borderColor: '#f0f0f0', marginTop: 25}}></Text>
                    </View>
                    
                </Modal>


                <Modal
                    isVisible={couponModal}
                    backdropOpacity={0.3}
                    backdropColor={'white'}
                    animationIn={'zoomIn'}
                    animationOut={'zoomOut'}
                    onBackButtonPress={() => setCouponModal(false)}
                    onBackdropPress={() => setCouponModal(false)}
                    useNativeDriver={true}
                >
                    <View style={{backgroundColor: 'white', padding: 20, maxHeight: '30%', borderRadius: 10, elevation: 25, shadowOffset: {width: 0, height: 12}, shadowOpacity: 0.58, shadowRadius: 16.00}}>
                        {couponList.length > 0 ? <Text style={{fontFamily: 'sofia-black', marginBottom: 25, fontSize: wp(5), textAlign: 'center'}}>Available Offers</Text>: <LottieView source={require('../assets/animations/823-crying.json')} autoPlay={true} loop={true} style={{width: 80, height: 80, alignSelf: 'center'}} />}
                        <FlatList 
                            data={couponList}
                            keyExtractor={(item, index) => index.toString()}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={() => (!couponList.length ? <Text style={{textAlign: 'center', fontFamily: 'sf-semi'}}>No offers available right now!</Text>: null)}
                            renderItem={({ item }) => (
                                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 20, borderWidth: 0.7, borderStyle: 'dashed', borderRadius: 1, padding: 10}}>
                                    <View style={{flex: 1}}>
                                        <Text style={{fontFamily: 'sf'}}>{item.name}</Text>
                                        <Text style={{fontFamily: 'sf-semi', textDecorationLine: 'underline'}}>{item.description}</Text>
                                    </View>
                                    <TouchableOpacity disabled={total > item.min_items_price ? false : true} onPress={() => (setAppliedCoupon(item), setCouponModal(false), animationModalShow())}>
                                        <Text style={total > item.min_items_price ? {opacity: 1, fontFamily: 'sf-semi', color: '#99b898'}: {opacity: 0.2, fontFamily: 'sf-semi', color: '#99b898'}}>Apply</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                    </View>
                </Modal>

                <Modal 
                    isVisible={onPlaceModal}
                    backdropColor={'white'}
                    backdropOpacity={0.5}
                >
                    <ActivityIndicator color="#99b898" size={50} />
                </Modal>
                <Modal isVisible={animationModal} backdropOpacity={0}>
                    <LottieView source={require('../assets/animations/55150-confetti.json')} autoPlay={true} loop={false} onAnimationFinish={() => setAnimationModal(false)} />
                </Modal>
            </View>
        </ScrollView>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{fontFamily: 'sf-semi', position: 'absolute', top: 0, left: 50, fontSize: wp(2.5)}}>Payment type</Text>
            <TouchableOpacity style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}} onPress={() => setPaymentModal(true)}>
                {paymentType === 'Cash On Delivery' ? <MaterialCommunityIcons name="cash" size={20} color="green"/> : paymentType === 'Card' ? <Entypo name="credit-card" size={20} color="black" />: <FontAwesome name="google-wallet" size={20} color="blue" />}
                <Text style={{textAlign: 'center', fontFamily: 'sf-semi'}}> {paymentType}</Text>
            </TouchableOpacity>
            {myAddressesStatus === 200 && deliveryAddressStatus === 200 && cartStatus === 200 ? 
            <TouchableOpacity onPress={paymentMethod} style={{flex: 1, opacity: 1, backgroundColor: '#99b898', borderColor: '#99b898', borderWidth: 1, padding: 15}}>
                <Text style={{textAlign: 'center', fontFamily: 'sf-semi'}}>Place Order &raquo;</Text>
            </TouchableOpacity>:
            <TouchableOpacity disabled={true} style={{flex: 1, opacity: 0.1, backgroundColor: '#99b898', borderColor: '#99b898', borderWidth: 1, padding: 15}}>
                <Text style={{textAlign: 'center', fontFamily: 'sf-semi'}}>Place Order &raquo;</Text>
            </TouchableOpacity>
            }
        </View>
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#fff',
      paddingTop: hp(10)
      
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
  map: {
    width: '100%',
    height: hp(50),
    top: 0,
    marginBottom: 1,
    position: 'absolute'
  },
});


var mapStyle = 
[
  {
      "featureType": "landscape",
      "elementType": "geometry",
      "stylers": [
          {
              "saturation": "-100"
          }
      ]
  },
  {
      "featureType": "poi",
      "elementType": "labels",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "poi",
      "elementType": "labels.text.stroke",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "road",
      "elementType": "labels.text",
      "stylers": [
          {
              "color": "black"
          }
      ]
  },
  {
      "featureType": "road",
      "elementType": "labels.text.stroke",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "road.highway",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "saturation": "-87"
          },
          {
              "lightness": "-40"
          },
          {
              "color": "#ffffff"
          }
      ]
  },
  {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "road.highway.controlled_access",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "color": "#f0f0f0"
          },
          {
              "saturation": "-22"
          },
          {
              "lightness": "-16"
          }
      ]
  },
  {
      "featureType": "road.highway.controlled_access",
      "elementType": "geometry.stroke",
      "stylers": [
          {
              "visibility": "simplified"
          }
      ]
  },
  {
      "featureType": "road.highway.controlled_access",
      "elementType": "labels.icon",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "road.arterial",
      "elementType": "geometry.stroke",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "road.local",
      "elementType": "geometry.stroke",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "water",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "saturation": "-52"
          },
          {
              "hue": "#30e3ca"
          },
          {
              "lightness": "-16"
          }
      ]
  }
]