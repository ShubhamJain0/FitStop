import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { Button } from 'react-native';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image, ScrollView, Platform, ActivityIndicator, Dimensions, FlatList } from 'react-native';
import Modal from 'react-native-modal';
import { FontAwesome5, Ionicons, FontAwesome, AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Svg, { Path, Rect, Circle, G, Polygon, LinearGradient, Defs, Stop, Ellipse } from 'react-native-svg';
import LottieView from 'lottie-react-native';
import { showMessage } from 'react-native-flash-message';
import * as SecureStore from 'expo-secure-store';
import { UserContext } from './context';
import NetInfo from "@react-native-community/netinfo";

const {width: screenWidth} = Dimensions.get('window');


export default function PreviousOrders({ navigation, route }) {

    const [mounted, setMounted] = useState(true);
    const [isOffline, setIsOffline] = useState(false);
    const [showIndic, setShowInidc] = useState(false);

    const [list, setList] = useState([]);
    const [items, setItems] = useState([]);
    const [images, setImages] = useState([]);
    const [status, setStatus] = useState(0);

    const [orderStatus, setOrderStatus] = useState([]);
    const [respStatus, setRespStatus] = useState(0);

    const [detailsModal, setDetailsModal] = useState(false);
    const [trackingModal, setTrackingModal] = useState(false);
    const [details, setDetails] = useState(null);

    const [error, setError] = useState('');

    //Scroll to item
    const getIndex = route.params;
    const flRef = useCallback((node) => {
        if (node) {
            if (getIndex === undefined || getIndex === null){
                return;
            } else {
                setTimeout(() => node.scrollToIndex({index: getIndex.index}), 200)
            }
        }
        
    }, [])


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
              fetch('http://192.168.0.156:8000/store/previousorders/',{
                  method: 'GET',
                  headers: {
                  'Authorization': `Token ${token}`,
                  'Content-type': 'application/json'
                  }
              })
              .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
              .then(resp => {if (mounted) {setList(resp.json.qs), setItems(resp.json.data), setImages(resp.json.images), setStatus(resp.status)}})
              .catch(error => setError(error))
            } else {
              setStatus(401)
            }
          })().catch(error => setError(error))
    }, [])


    useEffect(() => {
        const get = navigation.addListener('focus', () => {
            (async () => {
                const token = await SecureStore.getItemAsync('USER_TOKEN')
                if (token) {
                fetch('http://192.168.0.156:8000/store/previousorders/',{
                    method: 'GET',
                    headers: {
                    'Authorization': `Token ${token}`,
                    'Content-type': 'application/json'
                    }
                })
                .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
                .then(resp => {if (mounted) {setList(resp.json.qs)}})
                .catch(error => setError(error))
                } else {
                    setStatus(401)
                }
            })().catch(error => setError(error))
        });
    }, [navigation])


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
                    setOrderStatus(resp.json.active_list);
                    setRespStatus(resp.status);
                }})
                .catch(error => setError(error))
            } else {
                setStatus(401)
            }
        })().catch(error => setError(error))

        return () => {
            setMounted(false);
        }
    }, [])


    const repeatOrder = (item) => async evt => {
        const token = await SecureStore.getItemAsync('USER_TOKEN')
            if (token) {
              fetch('http://192.168.0.156:8000/store/repeatorder/',{
                  method: 'POST',
                  headers: {
                  'Authorization': `Token ${token}`,
                  'Content-type': 'application/json'
                  },
                  body: JSON.stringify({id: item.id})
              })
              .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
              .then(resp => {if (resp.status === 404) {
                showMessage({
                    message: 'Some items are out of stock, sorry for inconvenience !',
                    position: 'top',
                    floating: true,
                    titleStyle: {fontFamily: 'Maven-sem', fontSize: wp(3.5)},
                    style: {alignItems: 'center'},
                    icon: 'auto',
                    type: 'warning',
                    statusBarHeight: hp(3),
                    duration: 5000
                })
              }
              if (resp.json.cart.length > 0) {
                navigation.popToTop();
                navigation.navigate('cart');
              }    
              })
              .catch(error => setError(error))
            } else {
                setStatus(401)
            }
    }


    const getStatus = (item) => {
        if (respStatus === 200) {
            for (var i=0; i < orderStatus.length; i++) {
                if (orderStatus[i].order_number === item.id) {
                    return orderStatus[i].order_status;
                }
            }
        }
    }


    const retry = async () => {
        setShowInidc(true);
        const token = await SecureStore.getItemAsync('USER_TOKEN')
        try {
            if (token) {
                fetch('http://192.168.0.156:8000/store/previousorders/',{
                  method: 'GET',
                  headers: {
                  'Authorization': `Token ${token}`,
                  'Content-type': 'application/json'
                  }
              })
              .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
              .then(resp => {if (mounted) {setList(resp.json.qs), setItems(resp.json.data), setImages(resp.json.images), setStatus(resp.status)}})
              .catch(error => setError(error))

              fetch('http://192.168.0.156:8000/store/activeorders/',{
                    method: 'GET',
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-type': 'application/json'
                    }
                })
                .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                .then(resp => {if(mounted) {
                    setOrderStatus(resp.json.active_list);
                    setRespStatus(resp.status);
                }})
                .then(() => setIsOffline(false))
                .then(() => setShowInidc(false))
                .catch(error => setError(error))
            } else {
                if (mounted) {
                    setStatus(401);
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
            {status === 200 ? 
                <View>
                    <FlatList 
                        ref={flRef} 
                        data={list}
                        keyExtractor={(item, index) => index.toString()}
                        contentContainerStyle={{paddingBottom: 50, paddingTop: 25}}
                        onScrollToIndexFailed={(info) => console.log(info)}
                        renderItem={({ item }) => (
                            <View style={{marginBottom: 50, backgroundColor: 'white', width: '85%', padding: 25, paddingTop: 15, paddingBottom: 15, borderRadius: 10, alignSelf: 'center', elevation: 10, shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.34, shadowRadius: 6.27, shadowColor: '#000'}}>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <View style={{flex: 1}}>
                                        <Text style={{fontFamily: 'Maven-bold', fontSize: wp(5)}}>Order #{item.id}</Text>
                                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3), color: 'grey', marginTop: 2}}>{item.ordereddate}</Text>
                                    </View>
                                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>&#8377; {item.total_price}</Text>
                                </View>
                                <Text style={{fontFamily: 'Maven-sem', marginTop: 15, fontSize: wp(4), color: 'black', marginBottom: 5}}>Ordered Items</Text>
                                {items.map(item1 => {
                                    return item1.items.map((x,index) => {
                                        return x.id_of_order === item.id ?
                                        <View key={x.id} style={{marginTop: 0}}>
                                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                                {images.length > 0 ? 
                                                    images.map(y => {
                                                        return x.item_name === y.name ? 
                                                        <Image key={y.id} source={{uri: y.image}} style={{width: 25, height: 25, borderRadius: 20}} />
                                                        : null
                                                    })
                                                : null}
                                                <Text style={{fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'black', flex: 1, marginLeft: 10}}>{x.item_name} </Text>
                                                <Text style={{marginRight: 25, fontFamily: 'Maven-med', fontSize: wp(3), marginTop: 5, color: 'black', flex: 1}}>{x.item_weight}     x{x.item_count}</Text>
                                            </View>
                                        </View>: null
                                    })
                                })}
                                <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
                                    <TouchableOpacity style={{alignSelf: 'flex-start'}} onPress={() => (setDetailsModal(true), setDetails(item))} activeOpacity={1}>
                                        <Text style={{fontFamily: 'Maven-medium', fontSize: wp(3.5), color: 'black'}}>View all details &raquo;</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={{backgroundColor: '#ebebeb', height: 1, marginTop: 15}}></Text>
                                <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
                                    {getStatus(item) ? 
                                    <TouchableOpacity style={{alignSelf: 'flex-start', flex: 1}} onPress={() => (setDetails(item), setTrackingModal(true))} activeOpacity={1}>
                                        <Text style={{fontSize: wp(4), color: '#249C86', fontFamily: 'Maven-sem'}}>Order status &raquo;</Text>
                                    </TouchableOpacity>:
                                    <TouchableOpacity style={{alignSelf: 'flex-start', flex: 1}} onPress={repeatOrder(item)} activeOpacity={1}>
                                        <Text style={{fontSize: wp(4), color: '#249C86', fontFamily: 'Maven-sem'}}>Repeat order</Text>
                                    </TouchableOpacity>
                                    }
                                    {getStatus(item) ? <Text style={{fontFamily: 'Maven-sem', color: 'blue', backgroundColor: '#f0f0ff', padding: 3, fontSize: wp(3)}}>{getStatus(item)}</Text>: item.delivery_and_package_rating > 0 ? <View style={{flexDirection: 'row', alignItems: 'center'}}><Text style={{fontFamily: 'Maven-sem', fontSize: wp(4)}}>{item.delivery_and_package_rating} </Text><FontAwesome name="star" size={wp(3.5)} color="#249C86" /></View>: <TouchableOpacity onPress={() => navigation.navigate('Reviews', {rateItem: item})} activeOpacity={1}><Text style={{fontFamily: 'Maven-sem', textDecorationLine: 'underline', fontSize: wp(3.5), color: 'black'}}>Rate order</Text></TouchableOpacity>}
                                </View>
                            </View>
                            
                        )}
                    
                />
            </View>
            : status === 404 || status === 401 ? 
                    <View style={{flex: 1, justifyContent: 'center'}}>
                        <Image source={require('../assets/not-found.png')} style={{width: '85%', height: 2071*(screenWidth/3994), alignSelf: 'center'}} />
                        <Text style={{marginTop: 50, fontFamily: 'Maven-sem', fontSize: wp(5), textAlign: 'center', color: 'black'}}>You haven't placed any order yet.</Text>
                        <TouchableOpacity activeOpacity={1} style={{marginTop: 15, alignSelf: 'center'}} onPress={() => (navigation.popToTop(), navigation.navigate('Fruits'))}>
                            <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), textAlign: 'center', color: '#249c86'}}>ORDER NOW</Text>
                        </TouchableOpacity>
                    </View>
                    
                    : <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><LottieView source={require('../assets/animations/9258-bouncing-fruits.json')} style={{width: 200}} loop={true} autoPlay={true} /></View>}
            <Modal 
                isVisible={detailsModal}
                backdropOpacity={0.3}
                backdropColor={'black'}
                onBackdropPress={() => setDetailsModal(false)}
                onBackButtonPress={() => setDetailsModal(false)}
                backdropTransitionInTiming={600}
                backdropTransitionOutTiming={600}
                animationInTiming={600}
                animationOutTiming={600}
                useNativeDriver={true}
                useNativeDriverForBackdrop={true}
                style={{margin: 0}}
            >
                <View style={{flex: 1, alignSelf: 'center', width: '100%', backgroundColor: 'white', marginTop: hp(20), paddingTop: 40, elevation: 25, shadowOffset: {width: 0, height: 12}, shadowRadius: 16, shadowOpacity: 0.58, shadowColor: '#000', borderTopLeftRadius: 25, borderTopRightRadius: 25}}>
                    <ScrollView bounces={false} showsVerticalScrollIndicator={false} overScrollMode='never' contentContainerStyle={{padding: 30, paddingBottom: 25, paddingTop: 0}}>
                        <Text style={{fontFamily: 'Maven-bold', fontSize: wp(7), marginBottom: 20, color: 'black'}}>Details</Text>
                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4.5), marginBottom: 10, color: 'black'}}>Ordered Items</Text>
                        {details ? items.map(item1 => {
                            return item1.items.map(x => {
                                return x.id_of_order === details.id ?
                                <View key={x.id} style={{flexDirection: 'row', marginBottom: 10}}>
                                    <View style={{}}>
                                        {images.length > 0 ? 
                                            images.map(y => {
                                                return x.item_name === y.name ? 
                                                <Image key={y.id} source={{uri: y.image}} style={{width: 40, height: 40, borderRadius: 20}} />
                                                : null
                                            })
                                        : null}
                                    </View>
                                    <View style={{marginLeft: 25, flex: 1}}>
                                        <Text style={{flex: 1, fontFamily: 'Maven-med', fontSize: wp(4), color: 'black'}}>{x.item_name} </Text>
                                        <Text style={{marginRight: 25, fontFamily: 'Maven-med', fontSize: wp(3), color: 'black'}}>{x.item_weight}   x{x.item_count}</Text>
                                    </View>
                                    <Text style={{fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'black', flex: 1, textAlign: 'center'}}>&#8377; {x.item_price}</Text>
                                </View>: null
                            })
                        }): 'null'}
                        <Text style={{backgroundColor: '#cccccc', height: 1, marginTop: 15}}></Text>
                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4.5), marginTop: 10, marginBottom: 10, color: 'black'}}>Bill Break-up</Text>
                        {details ? 
                            <View>
                                <View style={{flexDirection: 'row', marginBottom: 5}}>
                                    <Text style={{flex: 1, fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'black'}}>Item subtotal</Text>
                                    <Text style={{flex: 1, textAlign: 'right', fontFamily: 'Maven-sem', fontSize: wp(3.5), color: 'black'}}>&#8377; {details.cart_total}</Text>
                                </View>
                                <View style={{flexDirection: 'row', marginBottom: 5}}>
                                    <Text style={{flex: 1, fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'black'}}>Delivery Charges</Text>
                                    <Text style={{flex: 1, textAlign: 'right', fontFamily: 'Maven-sem', fontSize: wp(3.5), color: 'black'}}>&#8377; {details.delivery_charges}</Text>
                                </View>
                                <View style={{flexDirection: 'row', marginBottom: 5}}>
                                    <Text style={{flex: 1, fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'black'}}>Taxes</Text>
                                    <Text style={{flex: 1, textAlign: 'right', fontFamily: 'Maven-sem', fontSize: wp(3.5), color: 'black'}}>&#8377; {details.taxes}</Text>
                                </View>
                                {details.coupon !== 0 ? 
                                    <View style={{flexDirection: 'row', marginBottom: 5}}>
                                        <Text style={{flex: 1, fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'black'}}>Offer Applied</Text>
                                        <Text style={{flex: 1, textAlign: 'right', fontFamily: 'Maven-sem', fontSize: wp(3.5), color: 'black'}}>- &#8377; {details.coupon}</Text>
                                    </View>: null
                                }
                                <View style={{flexDirection: 'row', marginBottom: 5}}>
                                    <Text style={{flex: 1, fontFamily: 'Maven-sem', fontSize: wp(4.5), color: 'black'}}>Total</Text>
                                    <Text style={{flex: 1, textAlign: 'right', fontFamily: 'Maven-sem', fontSize: wp(4.5), color: 'black'}}>&#8377; {details.total_price}</Text>
                                </View>
                            </View>
                        : 'null'
                        }
                        <Text style={{backgroundColor: '#cccccc', height: 1, marginTop: 15}}></Text>
                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4.5), marginTop: 10, marginBottom: 10, color: 'black'}}>Status</Text>
                        {details && getStatus(details) ? <Text style={{fontFamily: 'Maven-sem', color: 'blue', backgroundColor: '#f0f0ff', padding: 3, fontSize: wp(3), alignSelf: 'flex-start'}}>{getStatus(details)}</Text>: <Text style={{fontFamily: 'Maven-sem', color: 'green', backgroundColor: '#e8ffe8', padding: 3, fontSize: wp(3), alignSelf: 'flex-start'}}>&#10003; Delivered</Text>}
                        <Text style={{backgroundColor: '#cccccc', height: 1, marginTop: 15}}></Text>
                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4.5), marginTop: 10, marginBottom: 10, color: 'black'}}>{details && getStatus(details) ? 'Delivering to:': 'Delivered to:'}</Text>
                        {details ? <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3.5), color: 'black'}}>{details.ordered_address}, {details.ordered_locality}, {details.ordered_city}</Text>: 'null'}
                        <Text style={{backgroundColor: '#cccccc', height: 1, marginTop: 15}}></Text>
                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4.5), marginTop: 10, marginBottom: 10, color: 'black'}}>Payment</Text>
                        {details ? <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3.5), color: 'black'}}>{details.payment_mode === 'Cash On Delivery' ? 'Cash On Delivery' : details.payment_mode}</Text>: 'null'}
                        <Text style={{backgroundColor: '#cccccc', height: 1, marginTop: 15}}></Text>
                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4.5), marginTop: 10, marginBottom: 10, color: 'black'}}>Ordered Date</Text>
                        {details ? 
                            <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3.5), color: 'black'}}>{details.ordereddate}</Text>
                        : 'null'}
                        <Text style={{backgroundColor: '#cccccc', height: 1, marginTop: 15}}></Text>
                    </ScrollView>
                </View>
            </Modal>
            <Modal 
                isVisible={trackingModal}
                backdropOpacity={0.3}
                backdropColor={'black'}
                onBackdropPress={() => setTrackingModal(false)}
                onBackButtonPress={() => setTrackingModal(false)}
                backdropTransitionInTiming={600}
                backdropTransitionOutTiming={600}
                animationInTiming={600}
                animationOutTiming={600}
                useNativeDriver={true}
                useNativeDriverForBackdrop={true}
                style={{margin: 0}}
            >
                <View style={{flex: 1, alignSelf: 'center', width: '100%', padding: 25, backgroundColor: 'white', justifyContent: 'center', marginTop: hp(70), elevation: 25, shadowOffset: {width: 0, height: 12}, shadowRadius: 16, shadowOpacity: 0.58, shadowColor: '#000'}}>
                            {details && getStatus(details) ? 
                                        <View style={{}}>
                                            {getStatus(details) === 'Order Placed' ? 
                                                <View style={{alignSelf: 'center'}}>
                                                    <LottieView source={require('../assets/animations/40101-waiting-pigeon.json')} loop={true} autoPlay={true} style={{width: 75}} />
                                                    
                                                </View>
                                                :
                                                getStatus(details) === 'Order Confirmed' ? 
                                                <View style={{alignSelf: 'center'}}>
                                                    <LottieView source={require('../assets/animations/64289-jiji.json')} loop={true} autoPlay={true} style={{width: 75}} />                                        
                                                </View>:
                                                getStatus(details) === 'Out for delivery' ? 
                                                <View style={{alignSelf: 'center'}}>
                                                    <LottieView source={require('../assets/animations/delivery.json')} loop={true} autoPlay={true} style={{width: 125}} />
                                                    
                                                </View>
                                                : null
                                            }
                                            <Text style={{fontFamily: 'Maven-med', fontSize: wp(3.3), color: 'black', textAlign: 'center', marginTop: 15}}>{getStatus(details) === 'Order Placed' ? 'Order placed successfully ! Please bear with us while we confirm your order !': 
                                                            getStatus(details) === 'Order Confirmed' ? 'Thanks for your patience. We are packing your healthy box of happiness and will be delivered soon !' :
                                                            getStatus(details) === 'Out for delivery' ? 'Your order is out for delivery !' : null}</Text>
                                        
                                    </View>
                            : null}
                </View>
            </Modal>
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fcfcfc',
        paddingTop: 25
    },
})