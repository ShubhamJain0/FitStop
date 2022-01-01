import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Image, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import { Feather } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import NetInfo from "@react-native-community/netinfo";

const {width: screenWidth} = Dimensions.get('window');

export default function ActiveOrders({ navigation, route }) {

    const [mounted, setMounted] = useState(true);
    const [isOffline, setIsOffline] = useState(false);
    const [showIndic, setShowInidc] = useState(false);

    const [activeOrders, setActiveOrders] = useState([]);
    const [itemsList, setItemsList] = useState([]);
    const [orderDetails, setOrderDetails] = useState([]);
    const [respStatus, setRespStatus] = useState(0);

    const [error, setError] = useState(null);

    //Checks for internet connection
    useEffect(() => {
        NetInfo.fetch().then(state => {
        if (!state.isConnected) {
            setIsOffline(true);
        }
        })
    }, [])

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
        if (!state.isConnected || !state.isInternetReachable) {
            setIsOffline(true);
        } 
        })

        return () => {
            unsubscribe();
        }
    }, [])

    useEffect(() => {
        (async () => {
            const token = await SecureStore.getItemAsync('USER_TOKEN')
            if (token) {
                fetch('http://192.168.0.156:8000/store/activeorders/',{
                    method: 'GET',
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-type': 'application/json'
                    }
                })
                .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                .then(resp => {if(mounted) {
                    setActiveOrders(resp.json.active_list);
                    setItemsList(resp.json.items_list);
                    setOrderDetails(resp.json.order_data);
                    setRespStatus(resp.status);
                }})
                .catch(error => setError(error))
            } else {
                setRespStatus(404);
            }
        })().catch(error => setError(error))

        return () => {
            setMounted(false);
        }
    }, [])



    const retry = async () => {
        setShowInidc(true);
        const token = await SecureStore.getItemAsync('USER_TOKEN')
        try {
            if (token) {
                fetch('http://192.168.0.156:8000/store/activeorders/',{
                    method: 'GET',
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-type': 'application/json'
                    }
                })
                .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                .then(resp => {if(mounted) {
                    setActiveOrders(resp.json.active_list);
                    setItemsList(resp.json.items_list);
                    setOrderDetails(resp.json.order_data);
                    setRespStatus(resp.status);
                }})
                .then(() => setIsOffline(false))
                .catch(error => setError(error))
            } else {
                if (mounted) {
                    setRespStatus(404);
                    setShowInidc(false);
                    setIsOffline(false);
                }
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
            {respStatus === 200 ? 
                <ScrollView
                showsVerticalScrollIndicator={false}>
                    
                        {activeOrders.map((item, index) => {
                            return (
                                <View key={item.id} style={{flex: 1, padding: 25, paddingTop: 0}} >
                                    <Text style={{fontFamily: 'Maven-bold', marginBottom: 10, fontSize: wp(5.5), color: 'black'}}>Order #{item.order_number}</Text>
                                    <View style={{marginBottom: 50}} >
                                        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 25}}>
                                            {item.order_status === 'Order Placed' ? 
                                                <View style={{flex: 0.5}}>
                                                    <LottieView source={require('../assets/animations/40101-waiting-pigeon.json')} loop={true} autoPlay={true} style={{width: 75}} />
                                                    
                                                </View>
                                                :
                                                item.order_status === 'Order Confirmed' ? 
                                                <View style={{flex: 0.5}}>
                                                    <LottieView source={require('../assets/animations/64289-jiji.json')} loop={true} autoPlay={true} style={{width: 75}} />                                        
                                                </View>:
                                                item.order_status === 'Out for delivery' ? 
                                                <View style={{flex: 0.5}}>
                                                    <LottieView source={require('../assets/animations/delivery.json')} loop={true} autoPlay={true} style={{width: 125}} />
                                                    
                                                </View>
                                                : null
                                            }
                                            <Text style={{fontFamily: 'Maven-med', fontSize: wp(3.3), color: 'black', flex: 1}}>{item.order_status === 'Order Placed' ? 'Order placed successfully ! Please bear with us while we confirm your order !': 
                                                            item.order_status === 'Order Confirmed' ? 'Thanks for your patience. We are packing your healthy box of happiness and will be delivered soon !' :
                                                            item.order_status === 'Out for delivery' ? 'Your order is out for delivery !' : null}</Text>
                                            
                                        </View>
                                        <View style={{flex: 1}}>
                                            <Text style={{fontFamily: 'Maven-sem', marginBottom: 0, fontSize: wp(4.5), color: 'black'}}>Ordered Items</Text>
                                            {itemsList.map((item1) => {
                                                        return item1.id_of_order === item.order_number ? (
                                                            <View key={item1.id} style={{flexDirection: 'row'}}>
                                                                <Text style={{fontFamily: 'Maven-med', fontSize: wp(3.5), marginTop: 5, color: 'black', flex: 1}}>{item1.item_name}</Text>
                                                                <Text style={{fontFamily: 'Maven-med', fontSize: wp(3.5), marginTop: 5, color: 'black', flex: 1}}>{item1.item_weight}  x{item1.item_count}</Text>
                                                                <Text style={{fontFamily: 'Maven-med', fontSize: wp(3.5), marginTop: 5, color: 'black', flex: 1}}>&#8377; {item1.item_price}</Text>
                                                            </View>
                                                        ): null
                                            })}
                                            {orderDetails.map((item2) => {
                                                    return item2.id === item.order_number ? (
                                                        <View key={item2.id} style={{}}>
                                                            <View style={{ marginTop: 10, flexDirection: 'row'}}>
                                                                <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3.5), color: 'black', flex: 1}}>Total (paid using {item2.payment_mode})</Text>
                                                                <Text style={{flex: 1}}></Text>
                                                                {item2.payment_mode === 'Cash On Delivery' ? <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>Cash On Delivery</Text> : <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3.5), color: 'black', flex: 1}}>&#8377; {item2.total_price}</Text>}
                                                            </View>
                                                            <Text style={{fontFamily: 'Maven-sem', marginTop: 35, fontSize: wp(4.5), color: 'black'}}>Delivery address</Text>
                                                            <Text style={{fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'black'}}>{item2.ordered_address}, {item2.ordered_locality}, {item2.ordered_city}</Text>   
                                                            
                                                            
                                                        </View>
                                                    ): null
                                            })}
                                        </View>
                                        
                                    </View>
                                    {activeOrders.length - 1 === index ? null : <Text style={{width: '100%', height: 1, backgroundColor: '#ebebeb', marginBottom: 25}}></Text>}
                                    
                                </View>
                            )
                        })}
                </ScrollView>
                : respStatus === 404 ?
                <View style={{flex: 1, justifyContent: 'center'}}>
                    <Image source={require('../assets/not-found.png')} style={{width: '85%', height: 2071*(screenWidth/3994), alignSelf: 'center'}} />
                    <Text style={{marginTop: 50, fontFamily: 'Maven-sem', fontSize: wp(5), textAlign: 'center'}}>You don't have any active orders !</Text>
                </View>
            :   <View style={{flex: 1, backgroundColor: '#fcfcfc', justifyContent: 'center', alignItems: 'center'}}>
                    <LottieView source={require('../assets/animations/9258-bouncing-fruits.json')} style={{width: 200}} loop={true} autoPlay={true} />
                </View>
        }
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fcfcfc',
      paddingTop: 25,
    },
});