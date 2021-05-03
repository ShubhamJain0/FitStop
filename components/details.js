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



export default function Details({ route, navigation }) {

    const detailItem = route.params;

    const [item, setItem] = useState(null);
    const [cartData, setCartData] = useState([]);
    const [cartStatus, setCartStatus] = useState(401);
    const [images, setImages] = useState([]);

    const carouselRef = useRef(null);
    const [activeSlide, setactiveSlide] = useState(0);


    useEffect(() => {
        if (detailItem) {
            fetch(`http://192.168.29.234:8000/store/storelist/${detailItem.detailItem.id}/get_details/`,{
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json'
                    }
                })
            .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
            .then(resp => (setItem(resp.json.details), setImages(resp.json.images)))
            .catch(error => console.log(error))
        }
    }, [])


    useEffect(() => {
        const getCart = navigation.addListener('focus', () => {
            (async () => {
                const token = await AsyncStorage.getItem('USER_TOKEN')
                if (token) {
                    fetch('http://192.168.29.234:8000/store/cart/',{
                        method: 'GET',
                        headers: {
                            'Authorization': `Token ${token}`,
                            'Content-type': 'application/json'
                        }
                    })
                    .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                    .then(resp => (setCartData(resp.json), setCartStatus(resp.status)))
                    .catch(error => console.log(error))
                } else {
                    setCartData([]);
                }
                

            })().catch(error => console.log(error))
        });

        return getCart;
        
    }, [navigation])


    const buildCart = (item) => async evt  => {
        const token =  await AsyncStorage.getItem('USER_TOKEN')
        if (token) {
            return fetch('http://192.168.29.234:8000/store/cart/',{
                method: 'POST',
                headers: {
                'Authorization': `Token ${token}`,
                'Content-type': 'application/json'
                },
                body: JSON.stringify({ ordereditem: item })
            })
            .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
            .then(resp => setCartData(resp.json.cart))
            .catch(error => console.log(error))
        } else {
            navigation.navigate('Auth')
        }
    }


    const reduceItem = (item) => async evt => {
        const token = await AsyncStorage.getItem('USER_TOKEN')
        if (token) {
        return fetch('http://192.168.29.234:8000/store/reduceordelete/',{
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
            navigation.navigate('Auth')
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
                    <Text>{item.name}</Text>
                    <Text>{item.description}</Text>
                    {item.avg_ratings > 0 ? 
                    <View style={{flexDirection:'row'}}>
                        <AntDesign name="star" size={15} style={item.avg_ratings > 0 ? {color: '#99b898'}: {color: 'grey'}} />
                        <AntDesign name="star" size={15} style={item.avg_ratings > 1 ? {color: '#99b898'}: {color: 'grey'}} />
                        <AntDesign name="star" size={15} style={item.avg_ratings > 2 ? {color: '#99b898'}: {color: 'grey'}} />
                        <AntDesign name="star" size={15} style={item.avg_ratings > 3 ? {color: '#99b898'}: {color: 'grey'}} />
                        <AntDesign name="star" size={15} style={item.avg_ratings > 4 ? {color: '#99b898'}: {color: 'grey'}} />
                        <Text>({item.no_of_ratings})</Text>
                    </View>: null}
                    {search(item) ? cartData.map((item1) => {
                        return item1.ordereditem  === item.name ? 
                                                            
                        <View key={item1.id} style={{flexDirection: 'row', justifyContent: 'center'}}>
                            
                            <TouchableOpacity onPress={buildCart(item)}>
                                <Text>+ </Text>
                            </TouchableOpacity>
                            <Text> {item1.item_count} </Text> 
                            <TouchableOpacity onPress={reduceItem(item)}>
                                <Text> -</Text>
                            </TouchableOpacity>
                        </View>
                        : null
                        }): 
                        <TouchableOpacity onPress={buildCart(item)}>
                            <Text style={{textAlign: 'center', fontFamily: 'sofia-medium'}}>Add to cart</Text>
                        </TouchableOpacity>
                    }
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
        height: hp(15),
        justifyContent: 'flex-start',
        marginHorizontal: wp(2),
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
      },
})