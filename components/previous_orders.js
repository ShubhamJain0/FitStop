import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from 'react-native';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image, ScrollView, Platform, ActivityIndicator, Dimensions, FlatList } from 'react-native';
import Modal from 'react-native-modal';
import { FontAwesome5, Ionicons, FontAwesome, AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Svg, { Path, Rect, Circle, G, Polygon, LinearGradient, Defs, Stop, Ellipse } from 'react-native-svg';
import LottieView from 'lottie-react-native';


const {width: screenWidth} = Dimensions.get('window');


export default function PreviousOrders({ navigation, route }) {

    const [mounted, setMounted] = useState(true);

    const [list, setList] = useState([]);
    const [items, setItems] = useState([]);
    const [images, setImages] = useState([]);
    const [status, setStatus] = useState(0);

    const [orderStatus, setOrderStatus] = useState([]);
    const [respStatus, setRespStatus] = useState(0);

    const [detailsModal, setDetailsModal] = useState(false);
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



    useEffect(() => {
        (async () => {
            const token = await AsyncStorage.getItem('USER_TOKEN')
            if (token) {
              fetch('http://192.168.0.105:8000/store/previousorders/',{
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
              navigation.navigate('Register')
            }
          })().catch(error => setError(error))
    }, [])


    useEffect(() => {
        const get = navigation.addListener('focus', () => {
            (async () => {
                const token = await AsyncStorage.getItem('USER_TOKEN')
                if (token) {
                fetch('http://192.168.0.105:8000/store/previousorders/',{
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
                navigation.navigate('Register')
                }
            })().catch(error => setError(error))
        });
    }, [navigation])


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
                    setOrderStatus(resp.json.orderstatus);
                    setRespStatus(resp.status);
                }})
                .catch(error => setError(error))
            } else {
                navigation.navigate('Register');
            }
        })().catch(error => setError(error))

        return () => {
            setMounted(false);
        }
    }, [])


    const repeatOrder = (item) => async evt => {
        const token = await AsyncStorage.getItem('USER_TOKEN')
            if (token) {
              fetch('http://192.168.0.105:8000/store/repeatorder/',{
                  method: 'POST',
                  headers: {
                  'Authorization': `Token ${token}`,
                  'Content-type': 'application/json'
                  },
                  body: JSON.stringify({id: item.id})
              })
              .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
              .then(resp => {if (resp.status === 404) {alert('Some items are out of stock, sorry for inconvenience!')}})
              .then(() => navigation.navigate('Fruits'))
              .then(() => navigation.popToTop())
              .catch(error => setError(error))
            } else {
              navigation.navigate('Register')
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



    return (
        <View style={styles.container}>
            <StatusBar style="inverted" />
            {status === 200 ? 
                <View>
                    <FlatList 
                        ref={flRef} 
                        data={list}
                        keyExtractor={(item, index) => index.toString()}
                        contentContainerStyle={{paddingTop: 15, paddingBottom: 50}}
                        onScrollToIndexFailed={(info) => console.log(info)}
                        ListHeaderComponent={() => (<View style={{width: '85%', alignSelf: 'center', marginBottom: 25}}>
                        <Text style={{fontFamily: 'sofia-bold', fontSize: wp(6), color: 'black'}}>Previous orders</Text>
                    </View>)}
                        renderItem={({ item }) => (
                            <View style={{marginBottom: 50, backgroundColor: 'white', width: '85%', padding: 25, paddingTop: 15, paddingBottom: 15, borderRadius: 10, alignSelf: 'center', elevation: 10, shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.34, shadowRadius: 6.27}}>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <View style={{flex: 1}}>
                                        <Text style={{fontFamily: 'Maison-bold', fontSize: wp(4)}}>Order #{item.id}</Text>
                                        <Text style={{fontFamily: 'Maison-bold', fontSize: wp(3), color: 'grey', marginTop: 2}}>{item.ordereddate}</Text>
                                    </View>
                                    <Text style={{fontFamily: 'Maison-bold', fontSize: wp(4), color: 'black'}}>&#8377; {item.total_price}</Text>
                                </View>
                                
                                {items.map(item1 => {
                                    return item1.items.map((x,index) => {
                                        return x.id_of_order === item.id ?
                                        <View key={x.id} style={{marginTop: 10}}>
                                            {index !== 0 ? <Text style={{backgroundColor: '#ebebeb', height: 1, marginBottom: 10, width: '75%', alignSelf: 'flex-end'}}></Text>: null}
                                            <View style={{flexDirection: 'row'}}>
                                                {images.length > 0 ? 
                                                    images.map(y => {
                                                        return x.item_name === y.name ? 
                                                        <Image key={y.id} source={{uri: y.image}} style={{width: 55, height: 55, borderRadius: 20}} />
                                                        : null
                                                    })
                                                : null}
                                                <View style={{marginLeft: 25, marginTop: 5}}>
                                                    <Text style={{fontFamily: 'Maison-bold', fontSize: wp(4), color: 'black'}}>{x.item_name} </Text>
                                                    <Text style={{marginRight: 25, fontFamily: 'sf', fontSize: wp(3.5), marginTop: 5, color: 'black'}}>{x.item_weight}     x{x.item_count}</Text>
                                                </View>
                                            </View>
                                        </View>: null
                                    })
                                })}
                                <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
                                    <TouchableOpacity style={{alignSelf: 'flex-start'}} onPress={() => (setDetailsModal(true), setDetails(item))}>
                                        <Text style={{fontFamily: 'sofia-medium', fontSize: wp(3.5), color: 'black'}}>View Details &raquo;</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={{backgroundColor: '#ebebeb', height: 1, marginTop: 15}}></Text>
                                <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
                                    <TouchableOpacity style={{alignSelf: 'flex-start', flex: 1}} onPress={repeatOrder(item)}>
                                        <Text style={{fontSize: wp(4), color: '#249C86', fontFamily: 'Maison-bold'}}> Repeat Order</Text>
                                    </TouchableOpacity>
                                    {getStatus(item) ? <Text style={{fontFamily: 'Maison-bold', color: 'blue', backgroundColor: '#f0f0ff', padding: 3, fontSize: wp(3)}}>{getStatus(item)}</Text>: item.delivery_and_package_rating > 0 ? <View style={{flexDirection: 'row', alignItems: 'center'}}><Text style={{fontFamily: 'Maison-bold', fontSize: wp(4)}}>{item.delivery_and_package_rating} </Text><FontAwesome name="star" size={wp(3.5)} color="#249C86" /></View>: <TouchableOpacity onPress={() => navigation.navigate('Reviews', {rateItem: item})}><Text style={{fontFamily: 'Maison-bold', textDecorationLine: 'underline', fontSize: wp(3.5), color: 'black'}}>Rate order</Text></TouchableOpacity>}
                                </View>
                            </View>
                            
                        )}
                    
                />
            </View>
            : status === 404 ? 
                    <View style={{flex: 1, justifyContent: 'center'}}>
                        <Image source={require('../assets/not-found.png')} style={{width: '85%', height: 2071*(screenWidth/3994), alignSelf: 'center'}} />
                        <Text style={{marginTop: 50, fontFamily: 'Maison-bold', fontSize: wp(5), textAlign: 'center', color: 'black'}}>You haven't placed any order yet.</Text>
                        <TouchableOpacity activeOpacity={0.8} style={{marginTop: 15, alignSelf: 'center'}} onPress={() => (navigation.popToTop(), navigation.navigate('Fruits'))}>
                            <Text style={{fontFamily: 'Maison-bold', fontSize: wp(4), textAlign: 'center', color: '#249c86'}}>ORDER NOW</Text>
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
            >
                <View style={{flex: 1, alignSelf: 'center', width: '90%', padding: 25, backgroundColor: 'white'}}>
                    <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                        <Text style={{fontFamily: 'sofia-black', fontSize: wp(7), marginBottom: 20, color: 'black'}}>Details</Text>
                        <Text style={{fontFamily: 'sofia-bold', fontSize: wp(4.5), marginBottom: 10, color: 'black'}}>Ordered Items</Text>
                        {details ? items.map(item1 => {
                            return item1.items.map(x => {
                                return x.id_of_order === details.id ?
                                <View key={x.id} style={{flexDirection: 'row', alignItems: 'center', marginBottom: 3}}>
                                    <Text style={{flex: 1, fontFamily: 'Maison-bold', fontSize: wp(3.5), color: 'black'}}>{x.item_name} </Text>
                                    <Text style={{marginRight: 25, fontFamily: 'sf', fontSize: wp(3.5), color: 'black'}}>{x.item_weight}</Text>
                                    <Text style={{fontFamily: 'sf', fontSize: wp(3.5), color: 'black'}}>x{x.item_count}</Text>
                                </View>: null
                            })
                        }): 'null'}
                        <Text style={{backgroundColor: '#cccccc', height: 1, marginTop: 15}}></Text>
                        <Text style={{fontFamily: 'sofia-bold', fontSize: wp(4.5), marginTop: 10, marginBottom: 10, color: 'black'}}>Bill Break-up</Text>
                        {details ? 
                            <View>
                                <View style={{flexDirection: 'row', marginBottom: 5}}>
                                    <Text style={{flex: 1, fontFamily: 'sf', fontSize: wp(3.5), color: 'black'}}>Item subtotal</Text>
                                    <Text style={{flex: 1, textAlign: 'right', fontFamily: 'Maison-bold', fontSize: wp(3.5), color: 'black'}}>&#8377; {details.cart_total}</Text>
                                </View>
                                <View style={{flexDirection: 'row', marginBottom: 5}}>
                                    <Text style={{flex: 1, fontFamily: 'sf', fontSize: wp(3.5), color: 'black'}}>Delivery Charges</Text>
                                    <Text style={{flex: 1, textAlign: 'right', fontFamily: 'Maison-bold', fontSize: wp(3.5), color: 'black'}}>&#8377; {details.delivery_charges}</Text>
                                </View>
                                <View style={{flexDirection: 'row', marginBottom: 5}}>
                                    <Text style={{flex: 1, fontFamily: 'sf', fontSize: wp(3.5), color: 'black'}}>Taxes</Text>
                                    <Text style={{flex: 1, textAlign: 'right', fontFamily: 'Maison-bold', fontSize: wp(3.5), color: 'black'}}>&#8377; {details.taxes}</Text>
                                </View>
                                {details.coupon !== 0 ? 
                                    <View style={{flexDirection: 'row', marginBottom: 5}}>
                                        <Text style={{flex: 1, fontFamily: 'sf', fontSize: wp(3.5), color: 'black'}}>Offer Applied</Text>
                                        <Text style={{flex: 1, textAlign: 'right', fontFamily: 'Maison-bold', fontSize: wp(3.5), color: 'black'}}>- &#8377; {details.coupon}</Text>
                                    </View>: null
                                }
                                <View style={{flexDirection: 'row', marginBottom: 5}}>
                                    <Text style={{flex: 1, fontFamily: 'sofia-bold', fontSize: wp(4.5), color: 'black'}}>Total</Text>
                                    <Text style={{flex: 1, textAlign: 'right', fontFamily: 'sofia-bold', fontSize: wp(4.5), color: 'black'}}>&#8377; {details.total_price}</Text>
                                </View>
                            </View>
                        : 'null'
                        }
                        <Text style={{backgroundColor: '#cccccc', height: 1, marginTop: 15}}></Text>
                        <Text style={{fontFamily: 'sofia-bold', fontSize: wp(4.5), marginTop: 10, marginBottom: 10, color: 'black'}}>Status</Text>
                        {details && getStatus(details) ? <Text style={{fontFamily: 'Maison-bold', color: 'blue', backgroundColor: '#f0f0ff', padding: 3, fontSize: wp(3), alignSelf: 'flex-start'}}>{getStatus(details)}</Text>: <Text style={{fontFamily: 'Maison-bold', color: 'green', backgroundColor: '#e8ffe8', padding: 3, fontSize: wp(3), alignSelf: 'flex-start'}}>&#10003; Delivered</Text>}
                        <Text style={{backgroundColor: '#cccccc', height: 1, marginTop: 15}}></Text>
                        <Text style={{fontFamily: 'sofia-bold', fontSize: wp(4.5), marginTop: 10, marginBottom: 10, color: 'black'}}>{details && getStatus(details) ? 'Delivering to:': 'Delivered to:'}</Text>
                        {details ? <Text style={{fontFamily: 'Maison-bold', fontSize: wp(3.5), color: 'black'}}>{details.ordered_address}, {details.ordered_locality}, {details.ordered_city}</Text>: 'null'}
                        <Text style={{backgroundColor: '#cccccc', height: 1, marginTop: 15}}></Text>
                        <Text style={{fontFamily: 'sofia-bold', fontSize: wp(4.5), marginTop: 10, marginBottom: 10, color: 'black'}}>Payment</Text>
                        {details ? <Text style={{fontFamily: 'Maison-bold', fontSize: wp(3.5), color: 'black'}}>{details.payment_mode === 'Cash On Delivery' ? 'Cash On Delivery' : details.payment_mode}</Text>: 'null'}
                        <Text style={{backgroundColor: '#cccccc', height: 1, marginTop: 15}}></Text>
                        <Text style={{fontFamily: 'sofia-bold', fontSize: wp(4.5), marginTop: 10, marginBottom: 10, color: 'black'}}>Ordered Date</Text>
                        {details ? 
                            <Text style={{fontFamily: 'Maison-bold', fontSize: wp(3.5), color: 'black'}}>{details.ordereddate}</Text>
                        : 'null'}
                        <Text style={{backgroundColor: '#cccccc', height: 1, marginTop: 15}}></Text>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
        paddingTop: 75
    },
})