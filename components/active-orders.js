import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'react-native';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import Modal from 'react-native-modal';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import Svg, { Path, Rect, Circle, G, Polygon, LinearGradient, Defs, Stop, Ellipse } from 'react-native-svg';


export default function ActiveOrders({ navigation, route }) {

    const { activeOrder } = route.params;
    const [mounted, setMounted] = useState(true);

    const [activeOrders, setActiveOrders] = useState([]);
    const [orderStatus, setOrderStatus] = useState([]);
    const [respStatus, setRespStatus] = useState(0);


    useEffect(() => {
        (async () => {
            const token = await AsyncStorage.getItem('USER_TOKEN')
            if (token) {
                fetch('http://192.168.0.105:8000/store/activeorders/',{
                    method: 'GET',
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-type': 'application/json'
                    }
                })
                .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                .then(resp => {if(mounted) {
                    setActiveOrders(resp.json.data);
                    setOrderStatus(resp.json.orderstatus);
                    setRespStatus(resp.status);
                }})
                .catch(error => console.log(error))
            } else {
                navigation.navigate('Register');
            }
        })().catch(error => setError(error))

        return () => {
            setMounted(false);
        }
    }, [])


    const getStatus = (item) => {
        if (respStatus === 200) {
            for (var i=0; i < orderStatus.length; i++) {
                if (orderStatus[i].order_number === item.id) {
                    return orderStatus[i].order_status;
                }
            }
        }
    }


    return (
        <View style={styles.container}>
            <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 50, marginTop: 25}}>
                {respStatus === 200 ? 
                    activeOrders.map((item) => {
                        return item.id === activeOrder ? (
                            <View key={item.id} style={{width: '85%', alignSelf: 'center'}} >
                                <Text style={{fontFamily: 'sofia-bold', fontSize: wp(6)}} >Order Details</Text>
                                {getStatus(item) === 'Order Placed' ? 
                                    <View style={{marginTop: 50, flexDirection: 'row', alignItems: 'center'}}>
                                        <LottieView source={require('../assets/animations/40101-waiting-pigeon.json')} loop={true} autoPlay={true} style={{alignSelf: 'center', width: 75, height: 75}} />
                                        <Text style={{fontFamily: 'sf-semi', fontSize: wp(4), textAlign: 'center', flex: 1}}>Order placed successfully ! Please bear with us while we confirm your order !</Text>
                                    </View>
                                    :
                                    getStatus(item) === 'Order Confirmed' ? 
                                    <View style={{marginTop: 50, flexDirection: 'row', alignItems: 'center'}}>
                                        <LottieView source={require('../assets/animations/64289-jiji.json')} loop={true} autoPlay={true} style={{alignSelf: 'center', width: 75, height: 75}} />
                                        <Text style={{fontFamily: 'sf-semi', fontSize: wp(4), textAlign: 'center', flex: 1}}>Thanks for your patience. We are packing your healthy box of happiness and will be delivered soon !</Text>
                                    </View>:
                                    getStatus(item) === 'Out for delivery' ? 
                                    <View style={{marginTop: 50, flexDirection: 'row', alignItems: 'center'}}>
                                        <LottieView source={require('../assets/animations/lf30_editor_nh0dezle.json')} loop={true} autoPlay={true} style={{alignSelf: 'center', width: 75, height: 75}} />
                                        <Text style={{fontFamily: 'sf-semi', fontSize: wp(4), textAlign: 'center', flex: 1}}>Your order is out for delivery. Yes ! Finally !</Text>
                                    </View>
                                    : null
                                }
                                <Text style={{fontFamily: 'sf-semi', fontWeight: 'bold', marginTop: 50, fontSize: wp(4)}}>Items </Text>
                                <Text style={{fontFamily: 'sf-semi', fontSize: wp(3.5), marginTop: 10}}>{item.ordereditems.replace(/', '/g, '').replace(/, ']/g, '').replace(/[[']/g, '').replace(/w/g, ' ').replace(/, /g, '\n')}</Text>
                                <Text style={{backgroundColor: '#ebebeb', height: 1, marginTop: 35}}></Text>
                                <Text style={{fontFamily: 'sf-semi', fontWeight: 'bold', marginTop: 25, fontSize: wp(4)}}>Delivering to - </Text>
                                <Text style={{fontFamily: 'sf-semi', marginTop: 5, fontSize: wp(3.5)}}>{item.ordered_address}, {item.ordered_locality}, {item.ordered_city}</Text>   
                                <Text style={{backgroundColor: '#ebebeb', height: 1, marginTop: 35}}></Text>
                                <View style={{flexDirection: 'row', alignItems: 'center',  marginTop: 25}}>
                                    <Text style={{fontFamily: 'sofia-bold', fontSize: wp(4), flex: 1}}>Total: &#8377; {item.total_price}</Text>
                                    {item.payment_mode === 'Cash On Delivery' ? <Text style={{fontFamily: 'sofia-bold', fontSize: wp(4), color: '#FF847C'}}>Cash On Delivery</Text> : <Text style={{fontFamily: 'sofia-bold', fontSize: wp(4), color: 'green'}}>Paid with {item.payment_mode}</Text>}
                                </View>
                            </View>
                        ) : null
                    })
                : respStatus === 404 ?
                    <View style={{flex: 1, justifyContent: 'center'}}>
                        <Image source={require('../assets/not-found.png')} style={{width: '85%', height: 2071*(screenWidth/3994), alignSelf: 'center'}} />
                        <Text style={{marginTop: 50, fontFamily: 'sf-semi', fontSize: wp(5), textAlign: 'center'}}>You don't have any active orders !</Text>
                    </View>
                : <ActivityIndicator size={40} color={'#99b898'} style={{marginTop: wp(50)}} />}
            </ScrollView>
            
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      paddingTop: hp(10)
    },
});