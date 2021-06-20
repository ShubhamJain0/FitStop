import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'react-native';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import Modal from 'react-native-modal';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import Svg, { Path, Rect, Circle, G, Polygon, LinearGradient, Defs, Stop, Ellipse } from 'react-native-svg';


export default function ActiveOrders({ navigation }) {

    const [msg, setMsg] = useState('');
    const socket = useRef(null);
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
                        return (
                            <View key={item.id} style={{width: '85%', alignSelf: 'center', marginTop: 25, backgroundColor: 'white', elevation: 10, shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.34, shadowRadius: 6.27, padding: 25, borderRadius: 20}} >   
                                {getStatus(item) === 'Order Placed' ? 
                                    <View style={{marginTop: 25}}>
                                        <LottieView source={require('../assets/animations/40101-waiting-pigeon.json')} loop={true} autoPlay={true} style={{alignSelf: 'center', width: 175, height: 175}} />
                                        <Text style={{fontFamily: 'sf-semi', fontSize: wp(4), textAlign: 'center', marginTop: 25}}>Order placed successfully ! Please bear with us while we confirm your order !</Text>
                                    </View>
                                    :
                                    getStatus(item) === 'Order Confirmed' ? 
                                    <View style={{marginTop: 25}}>
                                        <LottieView source={require('../assets/animations/64289-jiji.json')} loop={true} autoPlay={true} style={{alignSelf: 'center', width: 175, height: 175}} />
                                        <Text style={{fontFamily: 'sf-semi', fontSize: wp(4), textAlign: 'center', marginTop: 25}}>Thanks for your patience. We are packing your healthy box of happiness and will be delivered soon !</Text>
                                    </View>:
                                    getStatus(item) === 'Out for delivery' ? 
                                    <View style={{marginTop: 0}}>
                                        <LottieView source={require('../assets/animations/lf30_editor_nh0dezle.json')} loop={true} autoPlay={true} style={{alignSelf: 'center', width: 175, height: 175}} />
                                        <Text style={{fontFamily: 'sf-semi', fontSize: wp(4), textAlign: 'center', marginTop: 25}}>Your order is out for delivery. Yes ! Finally !</Text>
                                    </View>
                                    : null
                                }
                                <Text style={{fontFamily: 'sofia-bold', fontSize: wp(5), marginTop: 35, textAlign: 'center'}} >Order Details</Text>
                                <Text style={{fontFamily: 'sf-semi', fontWeight: 'bold', marginTop: 25, fontSize: wp(4)}}>Items </Text>
                                <Text style={{fontFamily: 'sf-semi', fontSize: wp(3.5), marginTop: 10}}>{item.ordereditems.replace(/', '/g, '').replace(/, ']/g, '').replace(/[[']/g, '').replace(/w/g, ' ').replace(/, /g, '\n')}</Text>
                                <Text style={{fontFamily: 'sf-semi', fontWeight: 'bold', marginTop: 25, fontSize: wp(4)}}>Delivering to - </Text>
                                <Text style={{fontFamily: 'sf-semi', marginTop: 5, fontSize: wp(3.5)}}>{item.ordered_address}, {item.ordered_locality}, {item.ordered_city}</Text>
                                <Text style={{backgroundColor: '#cccccc', height: 1, marginTop: 35}}></Text>
                                <View style={{flexDirection: 'row', alignItems: 'center',  marginTop: 15}}>
                                    <Text style={{fontFamily: 'sofia-bold', fontSize: wp(4), flex: 1}}>Total: &#8377; {item.total_price}</Text>
                                    {item.payment_mode === 'Cash On Delivery' ? <Text style={{fontFamily: 'sofia-bold', fontSize: wp(4), color: '#FF847C'}}>Cash On Delivery</Text> : <Text style={{fontFamily: 'sofia-bold', fontSize: wp(4), color: 'green'}}>Paid with {item.payment_mode}</Text>}
                                </View>
                            </View>
                        )
                    })
                : respStatus === 404 ?
                    <View style={{marginTop: 100}}>
                        <Svg width="100%" height={hp(35)} viewBox="0 0 647.63626 632.17383"><Path d="M687.3279,276.08691H512.81813a15.01828,15.01828,0,0,0-15,15v387.85l-2,.61005-42.81006,13.11a8.00676,8.00676,0,0,1-9.98974-5.31L315.678,271.39691a8.00313,8.00313,0,0,1,5.31006-9.99l65.97022-20.2,191.25-58.54,65.96972-20.2a7.98927,7.98927,0,0,1,9.99024,5.3l32.5498,106.32Z" transform="translate(-276.18187 -133.91309)" fill="#f2f2f2"/><Path d="M725.408,274.08691l-39.23-128.14a16.99368,16.99368,0,0,0-21.23-11.28l-92.75,28.39L380.95827,221.60693l-92.75,28.4a17.0152,17.0152,0,0,0-11.28028,21.23l134.08008,437.93a17.02661,17.02661,0,0,0,16.26026,12.03,16.78926,16.78926,0,0,0,4.96972-.75l63.58008-19.46,2-.62v-2.09l-2,.61-64.16992,19.65a15.01489,15.01489,0,0,1-18.73-9.95l-134.06983-437.94a14.97935,14.97935,0,0,1,9.94971-18.73l92.75-28.4,191.24024-58.54,92.75-28.4a15.15551,15.15551,0,0,1,4.40966-.66,15.01461,15.01461,0,0,1,14.32032,10.61l39.0498,127.56.62012,2h2.08008Z" transform="translate(-276.18187 -133.91309)" fill="#3f3d56"/><Path d="M398.86279,261.73389a9.0157,9.0157,0,0,1-8.61133-6.3667l-12.88037-42.07178a8.99884,8.99884,0,0,1,5.9712-11.24023l175.939-53.86377a9.00867,9.00867,0,0,1,11.24072,5.9707l12.88037,42.07227a9.01029,9.01029,0,0,1-5.9707,11.24072L401.49219,261.33887A8.976,8.976,0,0,1,398.86279,261.73389Z" transform="translate(-276.18187 -133.91309)" fill="#99b898"/><Circle cx="190.15351" cy="24.95465" r="20" fill="#99b898"/><Circle cx="190.15351" cy="24.95465" r="12.66462" fill="#fff"/><Path d="M878.81836,716.08691h-338a8.50981,8.50981,0,0,1-8.5-8.5v-405a8.50951,8.50951,0,0,1,8.5-8.5h338a8.50982,8.50982,0,0,1,8.5,8.5v405A8.51013,8.51013,0,0,1,878.81836,716.08691Z" transform="translate(-276.18187 -133.91309)" fill="#e6e6e6"/><Path d="M723.31813,274.08691h-210.5a17.02411,17.02411,0,0,0-17,17v407.8l2-.61v-407.19a15.01828,15.01828,0,0,1,15-15H723.93825Zm183.5,0h-394a17.02411,17.02411,0,0,0-17,17v458a17.0241,17.0241,0,0,0,17,17h394a17.0241,17.0241,0,0,0,17-17v-458A17.02411,17.02411,0,0,0,906.81813,274.08691Zm15,475a15.01828,15.01828,0,0,1-15,15h-394a15.01828,15.01828,0,0,1-15-15v-458a15.01828,15.01828,0,0,1,15-15h394a15.01828,15.01828,0,0,1,15,15Z" transform="translate(-276.18187 -133.91309)" fill="#3f3d56"/><Path d="M801.81836,318.08691h-184a9.01015,9.01015,0,0,1-9-9v-44a9.01016,9.01016,0,0,1,9-9h184a9.01016,9.01016,0,0,1,9,9v44A9.01015,9.01015,0,0,1,801.81836,318.08691Z" transform="translate(-276.18187 -133.91309)" fill="#99b898"/><Circle cx="433.63626" cy="105.17383" r="20" fill="#99b898"/><Circle cx="433.63626" cy="105.17383" r="12.18187" fill="#fff"/></Svg>
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