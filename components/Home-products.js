import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, RefreshControl, ScrollView, SafeAreaView, Image, Button, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { Ionicons, FontAwesome, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Path, G, Rect } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function HomeProducts({ navigation, route }) {

    const { from } = route.params;

    const [storeList, setStoreList] = useState([]);
    const [cartStatus, setCartStatus] = useState(401);
    const [cartData, setCartData] = useState([]);

    const [loading, setLoading] = useState('true');
    const [refreshing, setRefreshing] = useState(false);

    const animation = new Animated.Value(0);
    const screenHeight = Dimensions.get("window").height;

    const [error, setError] = useState('');


    useEffect(() => {
        let mounted = true
        fetch('http://192.168.29.234:8000/store/storelist/',{
        method: 'GET',
        headers: {
            'Content-type': 'application/json'
        }
        })
        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => {if (mounted) {setStoreList(resp.json)}})
        .then(() => {if (mounted) {setTimeout(() => setLoading(false), 500)}})
        .catch(error => console.log(error))

        return () => {
            mounted = false;
        }
    }, [])


    useEffect(() => {
        let mounted = true
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
                    .then(resp => {if (mounted) {
                        setCartData(resp.json);
                        setCartStatus(resp.status);
                    }})
                    .catch(error => console.log(error))
                } else {
                    if (mounted) {
                        setCartData([]);
                    }
                }
                

            })().catch(error => console.log(error))
        });


        return () => {
            mounted = false;
        };
        
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
            navigation.navigate('Auth');
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
            navigation.navigate('Auth');
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


    const handleOpen = () => {
        Animated.timing(animation, {
        toValue: 1,
        duration: 1,
        useNativeDriver: true,
        }).start();
    };


    const handleClose = () => {
        Animated.timing(animation, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
        }).start();
        
    };


    const slideUp = {
        transform: [
        {
            translateY: animation.interpolate({
            inputRange: [0.01, 1],
            outputRange: [0, -1 * screenHeight],
            }),
        },
        ],
    };







    if (from === 'Banner1')
    return (
        <View style={styles.container}>
            <ScrollView bounces={false}>
                <View style={styles.container}>
                    {storeList.map((item) => {
                        if (item.category === 'Banner1') {
                            return (
                                <TouchableOpacity key={item.id} onPress={() => navigation.navigate('Details', {detailItem: item})} activeOpacity={1}>
                                    <View style={{flexDirection: 'row', marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 1.5, height: 1.5}, elevation: 1.5, margin: wp(2), padding: wp(6), borderRadius: 10}}>
                                        <View style={{flex: 1}}>
                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-black'}}>{item.name}</Text>
                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-medium'}}>{item.description}</Text>
                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-bold'}}>{item.price}</Text>
                                                    
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
                                        <View style={{flex: 1}}>
                                            <Image source={{uri: item.image}} style={{width: 100, height: 80, borderRadius: 5}}  />
                                            
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )
                        } else {
                            return null;
                        }
                    })}
                </View>
            </ScrollView>

            {cartStatus !==401 ? cartData.length > 0 ? handleOpen(): handleClose(): null}
            <View style={[styles.sheet]}>
                <Animated.View style={[styles.popup, slideUp]}>
                    <Text style={{flex: 1, textAlign: 'center'}}>Items added to your cart!</Text>
                    <TouchableOpacity style={{flex: 1}} onPress={() => navigation.navigate('cart')}>
                    <Text style={{textAlign: 'center'}}>View Cart</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    )



    if (from === 'Banner2')
    return (
        <View style={styles.container}>
            <ScrollView bounces={false}>
                <View style={styles.container}>
                    {storeList.map((item) => {
                        if (item.category === 'Banner2') {
                            return (
                                <TouchableOpacity key={item.id} onPress={() => navigation.navigate('Details', {detailItem: item})} activeOpacity={1}>
                                    <View style={{flexDirection: 'row', marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 1.5, height: 1.5}, elevation: 1.5, margin: wp(2), padding: wp(6), borderRadius: 10}}>
                                        <View style={{flex: 1}}>
                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-black'}}>{item.name}</Text>
                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-medium'}}>{item.description}</Text>
                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-bold'}}>{item.price}</Text>
                                                    
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
                                        <View style={{flex: 1}}>
                                            <Image source={{uri: item.image}} style={{width: 100, height: 80, borderRadius: 5}}  />
                                            
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )
                        } else {
                            return null;
                        }
                    })}
                </View>
            </ScrollView>

            {cartStatus !==401 ? cartData.length > 0 ? handleOpen(): handleClose(): null}
            <View style={[styles.sheet]}>
                <Animated.View style={[styles.popup, slideUp]}>
                    <Text style={{flex: 1, textAlign: 'center'}}>Items added to your cart!</Text>
                    <TouchableOpacity style={{flex: 1}} onPress={() => navigation.navigate('cart')}>
                    <Text style={{textAlign: 'center'}}>View Cart</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    )







    if (from === 'Custom1')
    return (
        <View style={styles.container}>
            <ScrollView bounces={false}>
                <View style={styles.container}>
                    {storeList.map((item) => {
                        if (item.category === 'Custom1') {
                            return (
                                <TouchableOpacity key={item.id} onPress={() => navigation.navigate('Details', {detailItem: item})} activeOpacity={1}>
                                    <View style={{flexDirection: 'row', marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 1.5, height: 1.5}, elevation: 1.5, margin: wp(2), padding: wp(6), borderRadius: 10}}>
                                        <View style={{flex: 1}}>
                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-black'}}>{item.name}</Text>
                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-medium'}}>{item.description}</Text>
                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-bold'}}>{item.price}</Text>
                                                    
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
                                        <View style={{flex: 1}}>
                                            <Image source={{uri: item.image}} style={{width: 100, height: 80, borderRadius: 5}}  />
                                            
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )
                        } else {
                            return null;
                        }
                    })}
                </View>
            </ScrollView>

            {cartStatus !==401 ? cartData.length > 0 ? handleOpen(): handleClose(): null}
            <View style={[styles.sheet]}>
                <Animated.View style={[styles.popup, slideUp]}>
                    <Text style={{flex: 1, textAlign: 'center'}}>Items added to your cart!</Text>
                    <TouchableOpacity style={{flex: 1}} onPress={() => navigation.navigate('cart')}>
                    <Text style={{textAlign: 'center'}}>View Cart</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    )

    

    if (from === 'Custom2')
    return (
        <View style={styles.container}>
            <ScrollView bounces={false}>
                <View style={styles.container}>
                    {storeList.map((item) => {
                        if (item.category === 'Custom2') {
                            return (
                                <TouchableOpacity key={item.id} onPress={() => navigation.navigate('Details', {detailItem: item})} activeOpacity={1}>
                                    <View style={{flexDirection: 'row', marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 1.5, height: 1.5}, elevation: 1.5, margin: wp(2), padding: wp(6), borderRadius: 10}}>
                                        <View style={{flex: 1}}>
                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-black'}}>{item.name}</Text>
                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-medium'}}>{item.description}</Text>
                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-bold'}}>{item.price}</Text>
                                                    
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
                                        <View style={{flex: 1}}>
                                            <Image source={{uri: item.image}} style={{width: 100, height: 80, borderRadius: 5}}  />
                                            
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )
                        } else {
                            return null;
                        }
                    })}
                </View>
            </ScrollView>

            {cartStatus !==401 ? cartData.length > 0 ? handleOpen(): handleClose(): null}
            <View style={[styles.sheet]}>
                <Animated.View style={[styles.popup, slideUp]}>
                    <Text style={{flex: 1, textAlign: 'center'}}>Items added to your cart!</Text>
                    <TouchableOpacity style={{flex: 1}} onPress={() => navigation.navigate('cart')}>
                    <Text style={{textAlign: 'center'}}>View Cart</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    )



    if (from === 'Custom3')
    return (
        <View style={styles.container}>
            <ScrollView bounces={false}>
                <View style={styles.container}>
                    {storeList.map((item) => {
                        if (item.category === 'Custom3') {
                            return (
                                <TouchableOpacity key={item.id} onPress={() => navigation.navigate('Details', {detailItem: item})} activeOpacity={1}>
                                    <View style={{flexDirection: 'row', marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 1.5, height: 1.5}, elevation: 1.5, margin: wp(2), padding: wp(6), borderRadius: 10}}>
                                        <View style={{flex: 1}}>
                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-black'}}>{item.name}</Text>
                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-medium'}}>{item.description}</Text>
                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-bold'}}>{item.price}</Text>
                                                    
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
                                        <View style={{flex: 1}}>
                                            <Image source={{uri: item.image}} style={{width: 100, height: 80, borderRadius: 5}}  />
                                            
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )
                        } else {
                            return null;
                        }
                    })}
                </View>
            </ScrollView>

            {cartStatus !==401 ? cartData.length > 0 ? handleOpen(): handleClose(): null}
            <View style={[styles.sheet]}>
                <Animated.View style={[styles.popup, slideUp]}>
                    <Text style={{flex: 1, textAlign: 'center'}}>Items added to your cart!</Text>
                    <TouchableOpacity style={{flex: 1}} onPress={() => navigation.navigate('cart')}>
                    <Text style={{textAlign: 'center'}}>View Cart</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    )



    if (from === 'Custom4')
    return (
        <View style={styles.container}>
            <ScrollView bounces={false}>
                <View style={styles.container}>
                    {storeList.map((item) => {
                        if (item.category === 'Custom4') {
                            return (
                                <TouchableOpacity key={item.id} onPress={() => navigation.navigate('Details', {detailItem: item})} activeOpacity={1}>
                                    <View style={{flexDirection: 'row', marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 1.5, height: 1.5}, elevation: 1.5, margin: wp(2), padding: wp(6), borderRadius: 10}}>
                                        <View style={{flex: 1}}>
                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-black'}}>{item.name}</Text>
                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-medium'}}>{item.description}</Text>
                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-bold'}}>{item.price}</Text>
                                                    
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
                                        <View style={{flex: 1}}>
                                            <Image source={{uri: item.image}} style={{width: 100, height: 80, borderRadius: 5}}  />
                                            
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )
                        } else {
                            return null;
                        }
                    })}
                </View>
            </ScrollView>

            {cartStatus !==401 ? cartData.length > 0 ? handleOpen(): handleClose(): null}
            <View style={[styles.sheet]}>
                <Animated.View style={[styles.popup, slideUp]}>
                    <Text style={{flex: 1, textAlign: 'center'}}>Items added to your cart!</Text>
                    <TouchableOpacity style={{flex: 1}} onPress={() => navigation.navigate('cart')}>
                    <Text style={{textAlign: 'center'}}>View Cart</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    )




}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: hp(5),
    },
    sheet: {
        position: "absolute",
        top: Dimensions.get('window').height,
        left: 0,
        right: 0,
        height: "100%",
        justifyContent: "flex-end",
    },
    popup: {
        backgroundColor: "#99b898",
        elevation: 3,
        shadowOffset: {width: 3, height: 3},
        marginHorizontal: 15,
        marginBottom: 5,
        borderRadius: 10,
        minHeight: 60,
        flexDirection: 'row',
        alignItems: 'center'
    },
})