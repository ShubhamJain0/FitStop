import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'react-native';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image, ScrollView, ImageBackground } from 'react-native';
import Carousel, {ParallaxImage, Pagination} from 'react-native-snap-carousel';
import { LinearGradient } from 'expo-linear-gradient';
import Modal from 'react-native-modal';
import { FontAwesome5, AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import ModalDropdown from 'react-native-modal-dropdown';



export default function Details({ route, navigation }) {

    const detailItem = route.params;

    const [item, setItem] = useState(null);
    const [cartData, setCartData] = useState([]);
    const [cartStatus, setCartStatus] = useState(401);
    const [images, setImages] = useState([]);

    const [custom, setCustom] = useState([{item: 'default', value: 'default'}]);

    const carouselRef = useRef(null);
    const [activeSlide, setactiveSlide] = useState(0);

    const [mounted, setMounted] = useState(true);


    useEffect(() => {
        if (detailItem) {
            fetch(`http://192.168.0.107:8000/store/storelist/${detailItem.detailItem.id}/get_details/`,{
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json'
                    }
                })
            .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
            .then(resp => {if (mounted) {setItem(resp.json.details), setImages(resp.json.images)}})
            .catch(error => console.log(error))
        }

        return () => {
            setMounted(false);
        }
    }, [])


    useEffect(() => {
        const getCart = navigation.addListener('focus', () => {
            (async () => {
                const token = await AsyncStorage.getItem('USER_TOKEN')
                if (token) {
                    fetch('http://192.168.0.107:8000/store/cart/',{
                        method: 'GET',
                        headers: {
                            'Authorization': `Token ${token}`,
                            'Content-type': 'application/json'
                        }
                    })
                    .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                    .then(resp => {if (mounted) {setCartData(resp.json), setCartStatus(resp.status)}})
                    .catch(error => console.log(error))
                } else {
                    setCartData([]);
                }
                

            })().catch(error => console.log(error))
        });

        return (getCart, setMounted(false));
        
    }, [navigation])


    const buildCart = (item) => async evt  => {
        const token =  await AsyncStorage.getItem('USER_TOKEN')
        if (token) {
            const check = exists(item);
            if (check !== undefined){
                return fetch('http://192.168.0.107:8000/store/cart/',{
                    method: 'POST',
                    headers: {
                    'Authorization': `Token ${token}`,
                    'Content-type': 'application/json'
                    },
                    body: JSON.stringify({ ordereditem: item, quantity:  check })
                })
                .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                .then(resp => setCartData(resp.json.cart))
                .catch(error => console.log(error))
            } else {
                return fetch('http://192.168.0.107:8000/store/cart/',{
                    method: 'POST',
                    headers: {
                    'Authorization': `Token ${token}`,
                    'Content-type': 'application/json'
                    },
                    body: JSON.stringify({ ordereditem: item, quantity:  item.detail[0].quantity })
                })
                .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                .then(resp => setCartData(resp.json.cart))
                .catch(error => console.log(error))
                
            }
        } else {
            navigation.navigate('Register')
        }
    }


    const reduceItem = (item) => async evt => {
        const token = await AsyncStorage.getItem('USER_TOKEN')
        if (token) {
        return fetch('http://192.168.0.107:8000/store/reduceordelete/',{
            method: 'POST',
            headers: {
            'Authorization': `Token ${token}`,
            'Content-type': 'application/json'
            },
            body: JSON.stringify({ reduceitem: item })
        })
        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => setCartData(resp.json.cart))
        .catch(error => console.log(error))
        } else {
            navigation.navigate('Register')
        }
    }


    const search = (item) => {
        if (cartStatus !== 401) {
            for (var i=0; i < cartData.length; i++) {
                if (cartData[i].ordereditem === item.name) {
                    return cartData[i];
                }
            }
        }
    }


    const pagination = () => {
        return (
            <Pagination
              dotsLength={images.length}
              activeDotIndex={activeSlide}
              dotStyle={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  marginHorizontal: 8,
                  backgroundColor: '#11999e'
              }}
              inactiveDotStyle={{
                  // Define styles for inactive dots here
                  backgroundColor: 'white'
              }}
              inactiveDotOpacity={1}
              inactiveDotScale={0.6}
            />
        );
      }


      const updateList = (item, index) => {
        for (var i=0; i < custom.length; i++) {
            if (custom[i].item === item.name) {
               return custom[i].value = index;
            }
        }
          
      }


      const exists = (item) => {
        for (var i=0; i < custom.length; i++) {
            if (custom[i].item === item.name) {
               return custom[i].value;
            }
        }
      }


    return (
        <View style={styles.container}>
            <Carousel
                    layout={'tinder'}
                    ref={carouselRef}
                    sliderHeight={hp(100)}
                    sliderWidth={wp(100)}
                    itemWidth={wp(100)}
                    onSnapToItem={(index) => setactiveSlide(index)}
                    data={images}
                    renderItem={({item, index}) => {
                        return (
                            <View>
                                <Image source={{uri: item.image}} style={{width: 'auto', height: '100%'}} />
                                <LinearGradient colors={['rgba(255,255,255,0)', 'black']} start={{x: 0.1, y:0.5}} style={{position: 'absolute', top: 0, bottom: 0, left: 0,right: 0}} ></LinearGradient>
                            </View>
                        )
                    }}
            />
            <Text style={{position: 'absolute', bottom: hp(15), alignSelf: 'center'}}>{pagination()}</Text>
            {item ? 
            <View>
                <View style={styles.details}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <View style={{flex: 1}}>
                            <Text style={{fontFamily: 'sf-semi', marginLeft: 10, fontSize: wp(6), marginTop: 10}}>{item.name}</Text>
                            <Text style={{fontFamily: 'sf', marginLeft: 10, fontSize: wp(3.5)}}>{item.description}</Text>
                        </View>
                        {item.avg_ratings > 0 ? 
                            <View>
                                <View style={{flexDirection:'row', marginTop: 10, marginRight: 10}}>
                                    <AntDesign name="star" size={15} style={item.avg_ratings > 0 ? {color: '#99b898'}: {color: 'grey'}} />
                                    <AntDesign name="star" size={15} style={item.avg_ratings > 1 ? {color: '#99b898'}: {color: 'grey'}} />
                                    <AntDesign name="star" size={15} style={item.avg_ratings > 2 ? {color: '#99b898'}: {color: 'grey'}} />
                                    <AntDesign name="star" size={15} style={item.avg_ratings > 3 ? {color: '#99b898'}: {color: 'grey'}} />
                                    <AntDesign name="star" size={15} style={item.avg_ratings > 4 ? {color: '#99b898'}: {color: 'grey'}} />
                                </View>
                                <Text style={{textAlign: 'center', fontFamily: 'sf', marginRight: 10}}>({item.no_of_ratings} review)</Text>
                            </View>
                            : <View style={{margin: wp(4)}}></View>}
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        {exists(item) ? 
                            item.detail.map((item2) => {
                                return item2.quantity === exists(item) ?
                                item2.previous_price > 0 ? 
                                <View key={item2.id} style={{flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: 10, marginTop: 10}}>
                                    <Text style={{fontFamily: 'sofia-medium', textDecorationLine: 'line-through', marginRight: wp(4)}}>&#8377; {item2.previous_price}</Text>
                                    <Text style={{fontFamily: 'sofia-bold', fontSize: wp(6)}}>&#8377; {item2.price}</Text>
                                </View>:
                                <Text key={item2.id} style={{fontFamily: 'sofia-bold', fontSize: wp(6), flex: 1, marginLeft: 10, marginTop: 10}}>&#8377; {item2.price}</Text> : null
                                
                            }):  
                            
                            item.detail[0].previous_price > 0 ?
                            <View style={{flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: 10, marginTop: 10}}>
                                <Text style={{fontFamily: 'sofia-medium', textDecorationLine: 'line-through', marginRight: wp(4)}}>&#8377; {item.detail[0].previous_price}</Text>
                                <Text style={{fontFamily: 'sofia-bold', fontSize: wp(6)}}>&#8377; {item.detail[0].price}</Text>
                            </View>
                            : <Text style={{fontFamily: 'sofia-bold', fontSize: wp(6), flex: 1, marginLeft: 10, marginTop: 10}}>&#8377; {item.detail[0].price}</Text>
                        }
                        <ModalDropdown defaultValue={item.detail[0].quantity} options={item.detail.map(item1 => item1.quantity)} style={{alignSelf: 'center', position: 'absolute', top: 0, left: wp(40)}} dropdownStyle={{right: 150, left: 150, alignItems: 'center'}} dropdownTextStyle={{fontSize: wp(4), fontFamily: 'sf'}} textStyle={{fontSize: wp(4)}} onSelect={(value, index) => updateList(item, index) ? setCustom([...custom]): setCustom([...custom, {item: item.name, value: index}])} />
                        {item.availability === 'In stock' ? 
                            search(item) ? cartData.map((item1) => {
                                return item1.ordereditem  === item.name ? 
                                    
                                <View key={item1.id} style={{flexDirection: 'row', justifyContent: 'center', alignSelf: 'center', marginTop: hp(2), marginRight: 30, alignItems: 'center', backgroundColor: '#99b898', borderRadius: 5, width: '30%', elevation: 5, shadowOffset: {width: 1, height: 1}, shadowRadius: 2, shadowOpacity: 0.5, height: 30, padding: wp(1)}}>                        
                                    <TouchableOpacity onPress={buildCart(item)} style={{justifyContent: 'center'}}>
                                        <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(7)}}>+ </Text>
                                    </TouchableOpacity>
                                    <View style={{justifyContent: 'center'}}>
                                        <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(5.5)}}> {item1.item_count} </Text> 
                                    </View>
                                    <TouchableOpacity onPress={reduceItem(item)} style={{justifyContent: 'center'}}>
                                        <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(7)}}> -</Text>
                                    </TouchableOpacity>
                                </View>
                                    : null
                                }): 
                                <TouchableOpacity onPress={buildCart(item)} style={{alignSelf: 'center', justifyContent: 'center',  marginTop: hp(2), marginRight: 30, backgroundColor: '#99b898', width: '30%', height: 30, borderRadius: 5, shadowOffset: {width: 1, height: 1}, shadowRadius: 2, shadowOpacity: 0.5, elevation: 5}} activeOpacity={1}>
                                    <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(5)}}>Add &#43;</Text>
                                </TouchableOpacity>
                        :  <Text style={{color: 'red', textAlign: 'center'}}>Out of stock!</Text>}
                    </View>
                </View>
            </View>: null}
        </View>
    )
}



const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'white',
    },
    details: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'white',
        height: hp(18),
        justifyContent: 'flex-start',
        marginHorizontal: wp(2),
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
      },
})