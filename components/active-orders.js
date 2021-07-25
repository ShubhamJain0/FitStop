import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'react-native';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import Modal from 'react-native-modal';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import Svg, { Path, Rect, Circle, G, Polygon, LinearGradient, Defs, Stop, Ellipse } from 'react-native-svg';
import StepIndicator from 'react-native-step-indicator';
import { Feather } from '@expo/vector-icons';


export default function ActiveOrders({ navigation, route }) {

    const { activeOrder } = route.params;
    const [mounted, setMounted] = useState(true);

    const [activeOrders, setActiveOrders] = useState([]);
    const [orderStatus, setOrderStatus] = useState([]);
    const [respStatus, setRespStatus] = useState(0);

    const [showModal, setShowModal] = useState(false);


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
                {respStatus === 200 ? 
                    activeOrders.map((item) => {
                        return item.id === activeOrder ? (
                            <View key={item.id} style={{width: '85%', alignSelf: 'center', flex: 1, justifyContent: 'center'}} >
                                <Text style={{fontFamily: 'sofia-bold', fontSize: wp(6), marginTop: 25, marginBottom: 25}}>Order Details</Text>
                                <StepIndicator
                                    stepCount={3}
                                    direction='vertical'
                                    currentPosition={getStatus(item) === 'Order Placed' ? 0 : getStatus(item) === 'Order Confirmed' ? 1 : 2}
                                    labels={[getStatus(item) === 'Order Placed' || getStatus(item) === 'Order Confirmed' || getStatus(item) === 'Out for delivery' ? 'Order placed successfully ! Please bear with us while we confirm your order !': null, 
                                            getStatus(item) === 'Order Confirmed' || getStatus(item) === 'Out for delivery' ? 'Thanks for your patience. We are packing your healthy box of happiness and will be delivered soon !' : null,
                                            getStatus(item) === 'Out for delivery' ? 'Your order is out for delivery !' : null]}
                                    customStyles={{
                                        stepIndicatorSize: 25,
                                        currentStepIndicatorSize:30,
                                        separatorStrokeWidth: 2,
                                        currentStepStrokeWidth: 3,
                                        stepStrokeCurrentColor: '#249c86',
                                        stepStrokeWidth: 3,
                                        stepStrokeFinishedColor: '#249c86',
                                        stepStrokeUnFinishedColor: '#ebebeb',
                                        separatorFinishedColor: '#249c86',
                                        separatorUnFinishedColor: '#ebebeb',
                                        stepIndicatorFinishedColor: '#249c86',
                                        stepIndicatorUnFinishedColor: '#ffffff',
                                        stepIndicatorLabelFontSize: 13,
                                        currentStepIndicatorLabelFontSize: 13,
                                        stepIndicatorLabelCurrentColor: '#249c86',
                                        stepIndicatorLabelUnFinishedColor: '#ebebeb',
                                        labelSize: wp(3.5),
                                        currentStepLabelColor: '#249c86',
                                        labelFontFamily: 'sf',
                                        labelColor: '#ebebeb'
                                    }}
                                />
                                 <TouchableOpacity style={{alignSelf: 'flex-start', marginTop: 25, flexDirection: 'row', alignItems: 'center'}} onPress={() => setShowModal(true)}>
                                    <Feather name="info" size={wp(4)} color="#249c86" />
                                    <Text style={{fontFamily: 'Maison-bold', fontSize: wp(4), color: '#249c86', marginLeft: 10}}>Order details</Text>
                                </TouchableOpacity>
                                {getStatus(item) === 'Order Placed' ? 
                                    <View style={{marginBottom: hp(10), marginTop: hp(5)}}>
                                        <LottieView source={require('../assets/animations/40101-waiting-pigeon.json')} loop={true} autoPlay={true} style={{alignSelf: 'center', width: 150}} />
                                        
                                    </View>
                                    :
                                    getStatus(item) === 'Order Confirmed' ? 
                                    <View style={{marginBottom: hp(10), marginTop: hp(5)}}>
                                        <LottieView source={require('../assets/animations/64289-jiji.json')} loop={true} autoPlay={true} style={{alignSelf: 'center', width: 150}} />                                        
                                    </View>:
                                    getStatus(item) === 'Out for delivery' ? 
                                    <View style={{marginBottom: hp(10), marginTop: hp(5)}}>
                                        <LottieView source={require('../assets/animations/delivery.json')} loop={true} autoPlay={true} style={{alignSelf: 'center', width: 200}} />
                                        
                                    </View>
                                    : null
                                }
                                <Modal 
                                    isVisible={showModal} 
                                    backdropOpacity={0.5} 
                                    backdropColor={'white'}
                                    animationInTiming={500}
                                    animationOutTiming={500}
                                    backdropTransitionInTiming={500}
                                    backdropTransitionOutTiming={500}
                                    style={{margin: 0}} 
                                    onBackdropPress={() => setShowModal(false)}
                                    onBackButtonPress={() => setShowModal(false)}
                                    useNativeDriver={true}
                                    useNativeDriverForBackdrop={true}
                                >
                                    <View style={{backgroundColor: 'white', height: '50%', position: 'absolute', bottom: 0, width: '100%', elevation: 25, shadowOffset: {width: 0, height: 12}, shadowRadius: 16, shadowOpacity: 0.58, padding: 25, paddingBottom: 5}}>
                                        <ScrollView showsVerticalScrollIndicator={false}>
                                            <Text style={{fontFamily: 'Maison-bold', marginTop: 25, fontSize: wp(4)}}>Ordered Items -</Text>
                                            <Text style={{fontFamily: 'sf', fontSize: wp(3.5), marginTop: 5}}>{item.ordereditems.replace(/', '/g, '').replace(/, ']/g, '').replace(/[[']/g, '').replace(/w/g, ' ').replace(/, /g, '\n')}</Text>
                                            <Text style={{fontFamily: 'Maison-bold', marginTop: 50, fontSize: wp(4)}}>Delivering to - </Text>
                                            <Text style={{fontFamily: 'sf', marginTop: 5, fontSize: wp(3.5)}}>{item.ordered_address}, {item.ordered_locality}, {item.ordered_city}</Text>   
                                            
                                            <View style={{ marginTop: 50}}>
                                                <Text style={{fontFamily: 'sofia-bold', fontSize: wp(4), marginBottom: 5}}>Total - &#8377; {item.total_price}</Text>
                                                {item.payment_mode === 'Cash On Delivery' ? <Text style={{fontFamily: 'sofia-bold', fontSize: wp(4), color: '#FF847C'}}>Cash On Delivery</Text> : <Text style={{fontFamily: 'sofia-bold', fontSize: wp(4), color: 'green'}}>Paid with {item.payment_mode}</Text>}
                                            </View>
                                        </ScrollView>
                                    </View>
                                </Modal>
                            </View>
                        ) : null
                    })
                : respStatus === 404 ?
                    <View style={{flex: 1, justifyContent: 'center'}}>
                        <Image source={require('../assets/not-found.png')} style={{width: '85%', height: 2071*(screenWidth/3994), alignSelf: 'center'}} />
                        <Text style={{marginTop: 50, fontFamily: 'Maison-bold', fontSize: wp(5), textAlign: 'center'}}>You don't have any active orders !</Text>
                    </View>
                : <ActivityIndicator size={40} color={'#99b898'} style={{marginTop: wp(50)}} />}
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      paddingTop: hp(10),
    },
});