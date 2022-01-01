import React, { useState, useEffect, useRef, useContext } from 'react';
import { StyleSheet, Text, View, RefreshControl, ScrollView, SafeAreaView, Image, Button, TouchableOpacity, Animated, Dimensions, FlatList, ActivityIndicator } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { Ionicons, FontAwesome, FontAwesome5, MaterialCommunityIcons, Feather, Entypo, MaterialIcons, AntDesign } from "@expo/vector-icons";
import Svg, { Path, G, Rect } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ModalDropdown from 'react-native-modal-dropdown';
import FlipCard from 'react-native-flip-card';
import { StatusBar } from 'expo-status-bar';
import { showMessage } from 'react-native-flash-message';
import * as SecureStore from 'expo-secure-store';
import { UserContext, CartContext } from './context';
import NetInfo from "@react-native-community/netinfo";
import LottieView from 'lottie-react-native';

const {width: screenWidth} = Dimensions.get('window');
export default function HomeProducts({ navigation, route }) {

    const { from } = route.params;

    const [mounted, setMounted] = useState(true);
    const [isOffline, setIsOffline] = useState(false);
    const [showIndic, setShowInidc] = useState(false);

    const [storeList, setStoreList] = useState([]);
    const [cartStatus, setCartStatus] = useState(401);
    const [cartData, setCartData] = useState([]);

    const [loading, setLoading] = useState('true');
    const [refreshing, setRefreshing] = useState(false);

    const [hideButton, setHideButton] = useState('flex');
    const [custom, setCustom] = useState([{item: 'default', value: 'default'}]);
    const dropDownRef = useRef([]);

    const [scrollY] = useState(new Animated.Value(0));
    const screenHeight = Dimensions.get("window").height;

    const [error, setError] = useState('');

    const [conCart, setConCart] = useContext(CartContext);

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

        unsubscribe();
    }, [])

    useEffect(() => {
        fetch('http://192.168.0.156:8000/store/storelist/',{
        method: 'GET',
        headers: {
            'Content-type': 'application/json'
        }
        })
        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => {if (mounted) {setStoreList(resp.json); dropDownRef.current = new Array(resp.json.length);}})
        .then(() => {if (mounted) {setTimeout(() => setLoading(false), 500)}})
        .catch(error => setError(error))

        return () => {
            setMounted(false);
        }
    }, [])


    useEffect(() => {
        dropDownRef.current = new Array(storeList.length)
    }, [storeList])


    useEffect(() => {
        const getCart = navigation.addListener('focus', () => {
            if (mounted) {
                setHideButton('flex')
            };
            (async () => {
                const token = await SecureStore.getItemAsync('USER_TOKEN')
                if (token) {
                    fetch('http://192.168.0.156:8000/store/cart/',{
                        method: 'GET',
                        headers: {
                            'Authorization': `Token ${token}`,
                            'Content-type': 'application/json'
                        }
                    })
                    .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                    .then(resp => {if (mounted) {setCartData(resp.json), setCartStatus(resp.status)}})
                    .then(() => setHideButton('none'))
                    .catch(error => setError(error))
                } else {
                    if (mounted) {
                        setCartData([]);
                        setHideButton('none');
                    }
                }
                

            })().catch(error => setError(error))
        });
        
        return () => {
            setMounted(false);
        }
        
    }, [navigation])



    const buildCart = (item) => async evt  => {
        const token =  await SecureStore.getItemAsync('USER_TOKEN')
        if (token) {
            const check = exists(item);
            if (check !== undefined){
                return fetch('http://192.168.0.156:8000/store/cart/',{
                    method: 'POST',
                    headers: {
                    'Authorization': `Token ${token}`,
                    'Content-type': 'application/json'
                    },
                    body: JSON.stringify({ ordereditem: item, quantity:  check })
                })
                .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                .then(resp => {setCartData(resp.json.cart); if (resp.json.cart.length === 1) {setConCart(true)}})
                .catch(error => setError(error))
            } else {
                return fetch('http://192.168.0.156:8000/store/cart/',{
                    method: 'POST',
                    headers: {
                    'Authorization': `Token ${token}`,
                    'Content-type': 'application/json'
                    },
                    body: JSON.stringify({ ordereditem: item, quantity:  item.detail[0].quantity })
                })
                .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                .then(resp => {setCartData(resp.json.cart); if (resp.json.cart.length === 1) {setConCart(true)}})
                .catch(error => setError(error))
                
            }
        } else {
            showMessage({
                message: 'You need to be logged-in to edit cart !',
                position: 'top',
                floating: true,
                titleStyle: {fontFamily: 'Maven-sem', fontSize: wp(3.5)},
                style: {alignItems: 'center'},
                icon: 'auto',
                type: 'warning',
                statusBarHeight: hp(3),
                duration: 5000
            })
            navigation.navigate('Register')
        }
    }


    const reduceItem = (item) => async evt => {
        const token = await SecureStore.getItemAsync('USER_TOKEN')
        if (token) {
        return fetch('http://192.168.0.156:8000/store/reduceordelete/',{
            method: 'POST',
            headers: {
            'Authorization': `Token ${token}`,
            'Content-type': 'application/json'
            },
            body: JSON.stringify({ reduceitem: item })
        })
        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => {setCartData(resp.json.cart); if (resp.json.cart.length < 1) {setConCart(false)}})
        .catch(error => setError(error))
        } else {
            showMessage({
                message: 'You need to be logged-in to edit cart !',
                position: 'top',
                floating: true,
                titleStyle: {fontFamily: 'Maven-sem', fontSize: wp(3.5)},
                style: {alignItems: 'center'},
                icon: 'auto',
                type: 'warning',
                statusBarHeight: hp(3),
                duration: 5000
            })
            navigation.navigate('Register');
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
        Animated.timing(scrollY, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true
        }).start();
    }

    const handleClose = () => {
        Animated.timing(scrollY, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true
        }).start();
    }

    const slideUp = scrollY.interpolate({
        inputRange: [0, 1],
        outputRange: [200, 0],
        extrapolate: 'clamp',
    })


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


      const retry = async () => {
        setShowInidc(true);
        const token = await SecureStore.getItemAsync('USER_TOKEN')
        try {
            fetch('http://192.168.0.156:8000/store/storelist/',{
                method: 'GET',
                headers: {
                    'Content-type': 'application/json'
                }
            })
            .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
            .then(resp => {if (mounted) {setStoreList(resp.json); dropDownRef.current = new Array(resp.json.length);}})
            .then(() => {if (mounted) {setTimeout(() => setLoading(false), 500)}})
            .catch(error => setError(error))
            
            if (token) {
                fetch('http://192.168.0.156:8000/store/cart/',{
                        method: 'GET',
                        headers: {
                            'Authorization': `Token ${token}`,
                            'Content-type': 'application/json'
                        }
                    })
                    .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                    .then(resp => {if (mounted) {setCartData(resp.json), setCartStatus(resp.status)}})
                    .then(() => setHideButton('none'))
                    .then(() => setIsOffline(false))
                    .catch(error => setError(error))
            } else {
                if (mounted){setCartData([]);
                setShowInidc(false);
                setIsOffline(false);}
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





    if (from === 'Banner1')
    return (
        <View style={styles.container}>
            <StatusBar style="inverted" />
            <FlatList 
                data={storeList}
                contentContainerStyle={{paddingBottom: 100}}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                ListEmptyComponent={() => (!storeList.length ? <Text style={{fontFamily: 'Maven-sem', textAlign: 'center', fontSize: wp(4), color: 'grey'}}>Nothing found! Try something different.</Text>: null)}
                renderItem={({ item }) => {
                    return item.category === 'Banner1' ?
                        <FlipCard friction={50} flip={false} flipHorizontal={true} flipVertical={false} useNativeDriver={true} style={{width: '85%', alignSelf: 'center'}}>
                            <View key={item.id} style={{flexDirection: 'row', marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000', elevation: 5, paddingTop: wp(6), paddingBottom: wp(8), paddingLeft: wp(5), borderRadius: 10, margin: wp(1)}}>
                                <ModalDropdown 
                                    ref={el => dropDownRef.current[item.id] = el}
                                    defaultValue={item.detail[0].quantity}
                                    options={item.detail.map(item1 => item1.quantity)} 
                                    style={{alignSelf: 'center', marginTop: 5, position: 'absolute', bottom: 2, left: 20, padding: 5}}
                                    dropdownStyle={{marginTop: -15, marginLeft: -10, width: '20%', alignItems: 'center', backgroundColor: 'white', elevation: 10, shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.34, shadowRadius: 6.27, shadowColor: '#000'}} 
                                    dropdownTextStyle={{fontSize: wp(4), fontFamily: 'Maven-med', textAlign: 'center', color: 'black'}} 
                                    renderSeparator={() => (<Text style={{backgroundColor: '#ebebeb', height: 1}}></Text>)}
                                    onSelect={(value, index) => updateList(item, index) ? setCustom([...custom]): setCustom([...custom, {item: item.name, value: index}])}
                                >
                                    <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => dropDownRef.current[item.id].show()}>
                                        {exists(item) ?
                                            item.detail.map((item2) => {
                                                return item2.quantity === exists(item) ?
                                                <Text key={item2.id} style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: '#249c86', }}>{item2.quantity}</Text>: null 
                                            })
                                            : <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: '#249c86', }}>{item.detail[0].quantity}</Text>
                                        }
                                        <Text style={{fontFamily: 'Maven-med', color: '#249c86', fontSize: wp(4)}}> ▼</Text>
                                    </TouchableOpacity>
                                </ModalDropdown>
                                <View style={{flex: 1}}>
                                    <Image source={{uri: item.image}} style={{width: 100, height: 80, borderRadius: 5}}  />
                                </View>
                                <View style={{flex: 1}}>
                                    <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4.5), marginBottom: 5, color: 'black'}}>{item.name}</Text>
                                    {exists(item) ? 
                                        item.detail.map((item2) => {
                                            return item2.quantity === exists(item) ?
                                            item2.previous_price > 0 ? 
                                            <View key={item2.id} style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                                <Text style={{textAlign: 'center', fontFamily: 'Maven-med', textDecorationLine: 'line-through', marginRight: wp(2.5), color: 'black'}}>&#8377; {item2.previous_price}</Text>
                                                <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>&#8377; {item2.price}</Text>
                                            </View>:
                                            <Text key={item2.id} style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>&#8377; {item2.price}</Text> : null
                                            
                                        }):  
                                        
                                        item.detail[0].previous_price > 0 ?
                                        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                            <Text style={{textAlign: 'center', fontFamily: 'Maven-med', textDecorationLine: 'line-through', marginRight: wp(2.5), color: 'black'}}>&#8377; {item.detail[0].previous_price}</Text>
                                            <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>&#8377; {item.detail[0].price}</Text>
                                        </View>
                                        : <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>&#8377; {item.detail[0].price}</Text>
                                    }
                                    
                                        {hideButton === 'none' ? item.availability === 'In stock' ? 
                                            search(item) ? cartData.map((item1) => {
                                                return item1.ordereditem  === item.name ? 
                                                    
                                                <View key={item1.id} style={{flexDirection: 'row', justifyContent: 'space-around', minHeight: wp(8.5), alignSelf: 'center', marginTop: 10, backgroundColor: '#fff', borderRadius: 5, width: '80%', elevation: 1, shadowOffset: {width: 0, height: 1}, shadowRadius: 1.00, shadowOpacity: 0.18, shadowColor: '#000'}}>
                                                
                                                <TouchableOpacity onPress={buildCart(item)} style={{flex: 1, backgroundColor: '#6aab9e', borderRadius: 5, elevation: 5, shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000'}} activeOpacity={1}>
                                                    <Text style={{textAlign: 'center',fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(6.5)}}>+</Text>
                                                </TouchableOpacity>
                                                <View style={{justifyContent: 'center', flex: 1}}>
                                                    <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(5)}}>{item1.item_count}</Text> 
                                                </View>
                                                <TouchableOpacity onPress={reduceItem(item)} style={{flex: 1, backgroundColor: '#6aab9e', borderRadius: 5, elevation: 5, shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000'}} activeOpacity={1}>
                                                    <Text style={{textAlign: 'center',fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(6.5)}}>-</Text>
                                                </TouchableOpacity>
                                            </View>
                                            : null
                                        }): 
                                        <TouchableOpacity onPress={buildCart(item)} style={{alignSelf: 'center', justifyContent: 'center',  marginTop: 10, backgroundColor: '#6aab9e', width: '80%', height: wp(8.5), borderRadius: 5, shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000', elevation: 5}} activeOpacity={1}>
                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(4.3)}}>Add &#43;</Text>
                                        </TouchableOpacity>
                                        :  <Text style={{color: 'red', textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), marginTop: 10, height: wp(8.5)}}>Out of stock !</Text>: <ActivityIndicator size={30} color="#6aab9e" style={{display: hideButton, alignSelf: 'center', marginTop: 10, height: wp(8.5)}} />}
                                    
                                </View>
                            </View>
                            <View key={item.id} style={{marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000', elevation: 5, margin: wp(1), paddingTop: wp(1), paddingBottom: wp(6), borderRadius: 10}}>
                                
                                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
                                    <Text style={{flex: 1, marginLeft: 15, fontFamily: 'sofia-black', fontSize: wp(5.5), color: 'black'}}>Details</Text>
                                    {item.avg_ratings > 0 ? 
                                        <View style={{flex: 1}}>
                                            <View style={{flexDirection:'row', justifyContent: 'center', alignItems: 'center'}}>
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 0 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 1 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 2 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 3 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 4 ? {color: '#249C86'}: {color: 'grey'}} />
                                                
                                                <Text style={{textAlign: 'center', fontFamily: 'Maven-med', color: 'black'}}> (<FontAwesome name="user" size={wp(3)} color="black" /> {item.no_of_ratings}) </Text>
                                            </View>
                                        </View>
                                    : null}
                                </View>
                                <Text style={{marginLeft: 15, fontFamily: 'Maven-med', fontSize: wp(3.5), flex: 1, color: 'black'}}>{item.description}</Text>
                                <Text style={{backgroundColor: '#ebebeb', height: 1, width: '90%', alignSelf: 'center', marginTop: 10}}></Text>
                                <View style={{flex: 1, marginTop: 5}}>
                                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), marginLeft: 15, color: 'black'}}>Nutrition per 100 g</Text>
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
                                        {item.nutritional_values.slice(0, 3).map((x, index) => {
                                            return  <View key={x.id} style={{flex: 1, borderRightWidth: index === 2 ? 0: 1, borderColor: '#b5b5b5'}}>
                                                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                                            {x.name === 'Protein' ? <MaterialCommunityIcons name="arm-flex" size={wp(4)} color="#c58c85" />: 
                                                            x.name === 'Carbs' ? <MaterialCommunityIcons name="barley" size={wp(4)} color="green" />:
                                                            x.name === 'Sugar' ? <FontAwesome name="cubes" size={wp(4)} color="grey" />:
                                                            x.name === 'Fat (Sat.)' || x.name === 'Fat (Unsat.)' || x.name === 'Fat (trans)' ? <Entypo name="drop" size={wp(4)} color="#8B8000" />: 
                                                            x.name === 'Calories' ? <MaterialIcons name="local-fire-department" size={wp(4)} color="#249C86" /> : null}
                                                            <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}> {x.name}</Text>
                                                        </View>
                                                        <Text style={{textAlign: 'center', fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'grey', marginTop: 3}}>{x.value}</Text>
                                                    </View>
                                        })}
                                    </View>
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
                                        {item.nutritional_values.slice(3, 5).map((x, index) => {
                                            return  <View key={x.id} style={{flex: 1, borderRightWidth: index === 1 ? 0: 1, borderColor: '#b5b5b5'}}>
                                                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                                            {x.name === 'Protein' ? <MaterialCommunityIcons name="arm-flex" size={wp(4)} color="#c58c85" />: 
                                                            x.name === 'Carbs' ? <MaterialCommunityIcons name="barley" size={wp(4)} color="green" />:
                                                            x.name === 'Sugar' ? <FontAwesome name="cubes" size={wp(4)} color="grey" />:
                                                            x.name === 'Fat (Sat.)' || x.name === 'Fat (Unsat.)' || x.name === 'Fat (trans)' ? <Entypo name="drop" size={wp(4)} color="#8B8000" />: 
                                                            x.name === 'Calories' ? <MaterialIcons name="local-fire-department" size={wp(4)} color="#249C86" /> : null}
                                                            <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}> {x.name}</Text>
                                                        </View>
                                                        <Text style={{textAlign: 'center', fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'grey'}}>{x.value}</Text>
                                                    </View>
                                        })}
                                    </View>
                                </View>
                                <TouchableOpacity style={{marginTop: 15, marginLeft: 15, alignSelf: 'flex-start'}} onPress={() => navigation.navigate('NutritionCalculator', {Item: item, values: item.nutritional_values})}>
                                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3.5), color: '#249c86'}}>Calculate how much you intake ! &rarr;</Text>
                                </TouchableOpacity>
                            </View>
                        </FlipCard>: null
                }}
            />
            {conCart ? handleOpen() : handleClose()}
                <Animated.View style={{padding: 15, position: 'absolute', bottom: 60, width: '50%', left: '25%', right: '25%', transform: [{translateY: slideUp}]}}>
                    <TouchableOpacity style={{alignSelf: 'center', padding: 15, backgroundColor: '#6aab9e', borderRadius: 50, elevation: 5, shadowColor: "#000",shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.25, shadowRadius: 3.84}} onPress={() => navigation.navigate('cart')} activeOpacity={1}>
                        <MaterialCommunityIcons name="cart-outline" size={wp(6)} color="black" />
                    </TouchableOpacity>
                </Animated.View>
        </View>
    )



    if (from === 'Banner2')
    return (
        <View style={styles.container}>
            <StatusBar style="inverted" />
            <FlatList 
                data={storeList}
                contentContainerStyle={{paddingBottom: 100}}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                ListEmptyComponent={() => (!storeList.length ? <Text style={{fontFamily: 'Maven-sem', textAlign: 'center', fontSize: wp(4), color: 'grey'}}>Nothing found! Try something different.</Text>: null)}
                renderItem={({ item }) => {
                    return item.category === 'Banner2' ?
                        <FlipCard friction={50} flip={false} flipHorizontal={true} flipVertical={false} useNativeDriver={true} style={{width: '85%', alignSelf: 'center'}}>
                            <View key={item.id} style={{flexDirection: 'row', marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000', elevation: 5, paddingTop: wp(6), paddingBottom: wp(8), paddingLeft: wp(5), borderRadius: 10, margin: wp(1)}}>
                                <ModalDropdown 
                                    ref={el => dropDownRef.current[item.id] = el}
                                    defaultValue={item.detail[0].quantity}
                                    options={item.detail.map(item1 => item1.quantity)} 
                                    style={{alignSelf: 'center', marginTop: 5, position: 'absolute', bottom: 2, left: 20, padding: 5}}
                                    dropdownStyle={{marginTop: -15, marginLeft: -10, width: '20%', alignItems: 'center', backgroundColor: 'white', elevation: 10, shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.34, shadowRadius: 6.27, shadowColor: '#000'}} 
                                    dropdownTextStyle={{fontSize: wp(4), fontFamily: 'Maven-med', textAlign: 'center', color: 'black'}} 
                                    renderSeparator={() => (<Text style={{backgroundColor: '#ebebeb', height: 1}}></Text>)}
                                    onSelect={(value, index) => updateList(item, index) ? setCustom([...custom]): setCustom([...custom, {item: item.name, value: index}])}
                                >
                                    <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => dropDownRef.current[item.id].show()}>
                                        {exists(item) ?
                                            item.detail.map((item2) => {
                                                return item2.quantity === exists(item) ?
                                                <Text key={item2.id} style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: '#249c86', }}>{item2.quantity}</Text>: null 
                                            })
                                            : <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: '#249c86', }}>{item.detail[0].quantity}</Text>
                                        }
                                        <Text style={{fontFamily: 'Maven-med', color: '#249c86', fontSize: wp(4)}}> ▼</Text>
                                    </TouchableOpacity>
                                </ModalDropdown>
                                <View style={{flex: 1}}>
                                    <Image source={{uri: item.image}} style={{width: 100, height: 80, borderRadius: 5}}  />
                                </View>
                                <View style={{flex: 1}}>
                                    <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4.5), marginBottom: 5, color: 'black'}}>{item.name}</Text>
                                    {exists(item) ? 
                                        item.detail.map((item2) => {
                                            return item2.quantity === exists(item) ?
                                            item2.previous_price > 0 ? 
                                            <View key={item2.id} style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                                <Text style={{textAlign: 'center', fontFamily: 'Maven-med', textDecorationLine: 'line-through', marginRight: wp(2.5), color: 'black'}}>&#8377; {item2.previous_price}</Text>
                                                <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>&#8377; {item2.price}</Text>
                                            </View>:
                                            <Text key={item2.id} style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>&#8377; {item2.price}</Text> : null
                                            
                                        }):  
                                        
                                        item.detail[0].previous_price > 0 ?
                                        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                            <Text style={{textAlign: 'center', fontFamily: 'Maven-med', textDecorationLine: 'line-through', marginRight: wp(2.5), color: 'black'}}>&#8377; {item.detail[0].previous_price}</Text>
                                            <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>&#8377; {item.detail[0].price}</Text>
                                        </View>
                                        : <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>&#8377; {item.detail[0].price}</Text>
                                    }
                                    
                                        {hideButton === 'none' ? item.availability === 'In stock' ? 
                                            search(item) ? cartData.map((item1) => {
                                                return item1.ordereditem  === item.name ? 
                                                    
                                                <View key={item1.id} style={{flexDirection: 'row', justifyContent: 'space-around', minHeight: wp(8.5), alignSelf: 'center', marginTop: 10, backgroundColor: '#fff', borderRadius: 5, width: '80%', elevation: 1, shadowOffset: {width: 0, height: 1}, shadowRadius: 1.00, shadowOpacity: 0.18, shadowColor: '#000'}}>
                                                
                                                <TouchableOpacity onPress={buildCart(item)} style={{flex: 1, backgroundColor: '#6aab9e', borderRadius: 5, elevation: 5, shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000'}} activeOpacity={1}>
                                                    <Text style={{textAlign: 'center',fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(6.5)}}>+</Text>
                                                </TouchableOpacity>
                                                <View style={{justifyContent: 'center', flex: 1}}>
                                                    <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(5)}}>{item1.item_count}</Text> 
                                                </View>
                                                <TouchableOpacity onPress={reduceItem(item)} style={{flex: 1, backgroundColor: '#6aab9e', borderRadius: 5, elevation: 5, shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000'}} activeOpacity={1}>
                                                    <Text style={{textAlign: 'center',fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(6.5)}}>-</Text>
                                                </TouchableOpacity>
                                            </View>
                                            : null
                                        }): 
                                        <TouchableOpacity onPress={buildCart(item)} style={{alignSelf: 'center', justifyContent: 'center',  marginTop: 10, backgroundColor: '#6aab9e', width: '80%', height: wp(8.5), borderRadius: 5, shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000', elevation: 5}} activeOpacity={1}>
                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(4.3)}}>Add &#43;</Text>
                                        </TouchableOpacity>
                                        :  <Text style={{color: 'red', textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), marginTop: 10, height: wp(8.5)}}>Out of stock !</Text>: <ActivityIndicator size={30} color="#6aab9e" style={{display: hideButton, alignSelf: 'center', marginTop: 10, height: wp(8.5)}} />}
                                    
                                </View>
                            </View>
                            <View key={item.id} style={{marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000', elevation: 5, margin: wp(1), paddingTop: wp(1), paddingBottom: wp(6), borderRadius: 10}}>
                                
                                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
                                    <Text style={{flex: 1, marginLeft: 15, fontFamily: 'sofia-black', fontSize: wp(5.5), color: 'black'}}>Details</Text>
                                    {item.avg_ratings > 0 ? 
                                        <View style={{flex: 1}}>
                                            <View style={{flexDirection:'row', justifyContent: 'center', alignItems: 'center'}}>
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 0 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 1 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 2 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 3 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 4 ? {color: '#249C86'}: {color: 'grey'}} />
                                                
                                                <Text style={{textAlign: 'center', fontFamily: 'Maven-med', color: 'black'}}> (<FontAwesome name="user" size={wp(3)} color="black" /> {item.no_of_ratings}) </Text>
                                            </View>
                                        </View>
                                    : null}
                                </View>
                                <Text style={{marginLeft: 15, fontFamily: 'Maven-med', fontSize: wp(3.5), flex: 1, color: 'black'}}>{item.description}</Text>
                                <Text style={{backgroundColor: '#ebebeb', height: 1, width: '90%', alignSelf: 'center', marginTop: 10}}></Text>
                                <View style={{flex: 1, marginTop: 5}}>
                                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), marginLeft: 15, color: 'black'}}>Nutrition per 100 g</Text>
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
                                        {item.nutritional_values.slice(0, 3).map((x, index) => {
                                            return  <View key={x.id} style={{flex: 1, borderRightWidth: index === 2 ? 0: 1, borderColor: '#b5b5b5'}}>
                                                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                                            {x.name === 'Protein' ? <MaterialCommunityIcons name="arm-flex" size={wp(4)} color="#c58c85" />: 
                                                            x.name === 'Carbs' ? <MaterialCommunityIcons name="barley" size={wp(4)} color="green" />:
                                                            x.name === 'Sugar' ? <FontAwesome name="cubes" size={wp(4)} color="grey" />:
                                                            x.name === 'Fat (Sat.)' || x.name === 'Fat (Unsat.)' || x.name === 'Fat (trans)' ? <Entypo name="drop" size={wp(4)} color="#8B8000" />: 
                                                            x.name === 'Calories' ? <MaterialIcons name="local-fire-department" size={wp(4)} color="#249C86" /> : null}
                                                            <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}> {x.name}</Text>
                                                        </View>
                                                        <Text style={{textAlign: 'center', fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'grey', marginTop: 3}}>{x.value}</Text>
                                                    </View>
                                        })}
                                    </View>
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
                                        {item.nutritional_values.slice(3, 5).map((x, index) => {
                                            return  <View key={x.id} style={{flex: 1, borderRightWidth: index === 1 ? 0: 1, borderColor: '#b5b5b5'}}>
                                                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                                            {x.name === 'Protein' ? <MaterialCommunityIcons name="arm-flex" size={wp(4)} color="#c58c85" />: 
                                                            x.name === 'Carbs' ? <MaterialCommunityIcons name="barley" size={wp(4)} color="green" />:
                                                            x.name === 'Sugar' ? <FontAwesome name="cubes" size={wp(4)} color="grey" />:
                                                            x.name === 'Fat (Sat.)' || x.name === 'Fat (Unsat.)' || x.name === 'Fat (trans)' ? <Entypo name="drop" size={wp(4)} color="#8B8000" />: 
                                                            x.name === 'Calories' ? <MaterialIcons name="local-fire-department" size={wp(4)} color="#249C86" /> : null}
                                                            <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}> {x.name}</Text>
                                                        </View>
                                                        <Text style={{textAlign: 'center', fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'grey'}}>{x.value}</Text>
                                                    </View>
                                        })}
                                    </View>
                                </View>
                                <TouchableOpacity style={{marginTop: 15, marginLeft: 15, alignSelf: 'flex-start'}} onPress={() => navigation.navigate('NutritionCalculator', {Item: item, values: item.nutritional_values})}>
                                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3.5), color: '#249c86'}}>Calculate how much you intake ! &rarr;</Text>
                                </TouchableOpacity>
                            </View>
                        </FlipCard>: null
                }}
            />
            {conCart ? handleOpen() : handleClose()}
                    <Animated.View style={{padding: 15, position: 'absolute', bottom: 60, width: '50%', left: '25%', right: '25%', transform: [{translateY: slideUp}]}}>
                        <TouchableOpacity style={{alignSelf: 'center', padding: 15, backgroundColor: '#6aab9e', borderRadius: 50, elevation: 5, shadowColor: "#000",shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.25, shadowRadius: 3.84}} onPress={() => navigation.navigate('cart')} activeOpacity={1}>
                            <MaterialCommunityIcons name="cart-outline" size={wp(6)} color="black" />
                        </TouchableOpacity>
                    </Animated.View>
        </View>
    )







    if (from === 'Custom1')
    return (
        <View style={styles.container}>
            <StatusBar style="inverted" />
            <FlatList 
                data={storeList}
                contentContainerStyle={{paddingBottom: 100}}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                ListEmptyComponent={() => (!storeList.length ? <Text style={{fontFamily: 'Maven-sem', textAlign: 'center', fontSize: wp(4), color: 'grey'}}>Nothing found! Try something different.</Text>: null)}
                renderItem={({ item }) => {
                    return item.category === 'Custom1' ?
                        <FlipCard friction={50} flip={false} flipHorizontal={true} flipVertical={false} useNativeDriver={true} style={{width: '85%', alignSelf: 'center'}}>
                            <View key={item.id} style={{flexDirection: 'row', marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000', elevation: 5, paddingTop: wp(6), paddingBottom: wp(8), paddingLeft: wp(5), borderRadius: 10, margin: wp(1)}}>
                                <ModalDropdown 
                                    ref={el => dropDownRef.current[item.id] = el}
                                    defaultValue={item.detail[0].quantity}
                                    options={item.detail.map(item1 => item1.quantity)} 
                                    style={{alignSelf: 'center', marginTop: 5, position: 'absolute', bottom: 2, left: 20, padding: 5}}
                                    dropdownStyle={{marginTop: -15, marginLeft: -10, width: '20%', alignItems: 'center', backgroundColor: 'white', elevation: 10, shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.34, shadowRadius: 6.27, shadowColor: '#000'}} 
                                    dropdownTextStyle={{fontSize: wp(4), fontFamily: 'Maven-med', textAlign: 'center', color: 'black'}} 
                                    renderSeparator={() => (<Text style={{backgroundColor: '#ebebeb', height: 1}}></Text>)}
                                    onSelect={(value, index) => updateList(item, index) ? setCustom([...custom]): setCustom([...custom, {item: item.name, value: index}])}
                                >
                                    <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => dropDownRef.current[item.id].show()}>
                                        {exists(item) ?
                                            item.detail.map((item2) => {
                                                return item2.quantity === exists(item) ?
                                                <Text key={item2.id} style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: '#249c86', }}>{item2.quantity}</Text>: null 
                                            })
                                            : <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: '#249c86', }}>{item.detail[0].quantity}</Text>
                                        }
                                        <Text style={{fontFamily: 'Maven-med', color: '#249c86', fontSize: wp(4)}}> ▼</Text>
                                    </TouchableOpacity>
                                </ModalDropdown>
                                <View style={{flex: 1}}>
                                    <Image source={{uri: item.image}} style={{width: 100, height: 80, borderRadius: 5}}  />
                                </View>
                                <View style={{flex: 1}}>
                                    <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4.5), marginBottom: 5, color: 'black'}}>{item.name}</Text>
                                    {exists(item) ? 
                                        item.detail.map((item2) => {
                                            return item2.quantity === exists(item) ?
                                            item2.previous_price > 0 ? 
                                            <View key={item2.id} style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                                <Text style={{textAlign: 'center', fontFamily: 'Maven-med', textDecorationLine: 'line-through', marginRight: wp(2.5), color: 'black'}}>&#8377; {item2.previous_price}</Text>
                                                <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>&#8377; {item2.price}</Text>
                                            </View>:
                                            <Text key={item2.id} style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>&#8377; {item2.price}</Text> : null
                                            
                                        }):  
                                        
                                        item.detail[0].previous_price > 0 ?
                                        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                            <Text style={{textAlign: 'center', fontFamily: 'Maven-med', textDecorationLine: 'line-through', marginRight: wp(2.5), color: 'black'}}>&#8377; {item.detail[0].previous_price}</Text>
                                            <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>&#8377; {item.detail[0].price}</Text>
                                        </View>
                                        : <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>&#8377; {item.detail[0].price}</Text>
                                    }
                                    
                                        {hideButton === 'none' ? item.availability === 'In stock' ? 
                                            search(item) ? cartData.map((item1) => {
                                                return item1.ordereditem  === item.name ? 
                                                    
                                                <View key={item1.id} style={{flexDirection: 'row', justifyContent: 'space-around', minHeight: wp(8.5), alignSelf: 'center', marginTop: 10, backgroundColor: '#fff', borderRadius: 5, width: '80%', elevation: 1, shadowOffset: {width: 0, height: 1}, shadowRadius: 1.00, shadowOpacity: 0.18, shadowColor: '#000'}}>
                                                
                                                <TouchableOpacity onPress={buildCart(item)} style={{flex: 1, backgroundColor: '#6aab9e', borderRadius: 5, elevation: 5, shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000'}} activeOpacity={1}>
                                                    <Text style={{textAlign: 'center',fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(6.5)}}>+</Text>
                                                </TouchableOpacity>
                                                <View style={{justifyContent: 'center', flex: 1}}>
                                                    <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(5)}}>{item1.item_count}</Text> 
                                                </View>
                                                <TouchableOpacity onPress={reduceItem(item)} style={{flex: 1, backgroundColor: '#6aab9e', borderRadius: 5, elevation: 5, shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000'}} activeOpacity={1}>
                                                    <Text style={{textAlign: 'center',fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(6.5)}}>-</Text>
                                                </TouchableOpacity>
                                            </View>
                                            : null
                                        }): 
                                        <TouchableOpacity onPress={buildCart(item)} style={{alignSelf: 'center', justifyContent: 'center',  marginTop: 10, backgroundColor: '#6aab9e', width: '80%', height: wp(8.5), borderRadius: 5, shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000', elevation: 5}} activeOpacity={1}>
                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(4.3)}}>Add &#43;</Text>
                                        </TouchableOpacity>
                                        :  <Text style={{color: 'red', textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), marginTop: 10, height: wp(8.5)}}>Out of stock !</Text>: <ActivityIndicator size={30} color="#6aab9e" style={{display: hideButton, alignSelf: 'center', marginTop: 10, height: wp(8.5)}} />}
                                    
                                </View>
                            </View>
                            <View key={item.id} style={{marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000', elevation: 5, margin: wp(1), paddingTop: wp(1), paddingBottom: wp(6), borderRadius: 10}}>
                                
                                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
                                    <Text style={{flex: 1, marginLeft: 15, fontFamily: 'sofia-black', fontSize: wp(5.5), color: 'black'}}>Details</Text>
                                    {item.avg_ratings > 0 ? 
                                        <View style={{flex: 1}}>
                                            <View style={{flexDirection:'row', justifyContent: 'center', alignItems: 'center'}}>
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 0 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 1 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 2 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 3 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 4 ? {color: '#249C86'}: {color: 'grey'}} />
                                                
                                                <Text style={{textAlign: 'center', fontFamily: 'Maven-med', color: 'black'}}> (<FontAwesome name="user" size={wp(3)} color="black" /> {item.no_of_ratings}) </Text>
                                            </View>
                                        </View>
                                    : null}
                                </View>
                                <Text style={{marginLeft: 15, fontFamily: 'Maven-med', fontSize: wp(3.5), flex: 1, color: 'black'}}>{item.description}</Text>
                                <Text style={{backgroundColor: '#ebebeb', height: 1, width: '90%', alignSelf: 'center', marginTop: 10}}></Text>
                                <View style={{flex: 1, marginTop: 5}}>
                                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), marginLeft: 15, color: 'black'}}>Nutrition per 100 g</Text>
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
                                        {item.nutritional_values.slice(0, 3).map((x, index) => {
                                            return  <View key={x.id} style={{flex: 1, borderRightWidth: index === 2 ? 0: 1, borderColor: '#b5b5b5'}}>
                                                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                                            {x.name === 'Protein' ? <MaterialCommunityIcons name="arm-flex" size={wp(4)} color="#c58c85" />: 
                                                            x.name === 'Carbs' ? <MaterialCommunityIcons name="barley" size={wp(4)} color="green" />:
                                                            x.name === 'Sugar' ? <FontAwesome name="cubes" size={wp(4)} color="grey" />:
                                                            x.name === 'Fat (Sat.)' || x.name === 'Fat (Unsat.)' || x.name === 'Fat (trans)' ? <Entypo name="drop" size={wp(4)} color="#8B8000" />: 
                                                            x.name === 'Calories' ? <MaterialIcons name="local-fire-department" size={wp(4)} color="#249C86" /> : null}
                                                            <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}> {x.name}</Text>
                                                        </View>
                                                        <Text style={{textAlign: 'center', fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'grey', marginTop: 3}}>{x.value}</Text>
                                                    </View>
                                        })}
                                    </View>
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
                                        {item.nutritional_values.slice(3, 5).map((x, index) => {
                                            return  <View key={x.id} style={{flex: 1, borderRightWidth: index === 1 ? 0: 1, borderColor: '#b5b5b5'}}>
                                                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                                            {x.name === 'Protein' ? <MaterialCommunityIcons name="arm-flex" size={wp(4)} color="#c58c85" />: 
                                                            x.name === 'Carbs' ? <MaterialCommunityIcons name="barley" size={wp(4)} color="green" />:
                                                            x.name === 'Sugar' ? <FontAwesome name="cubes" size={wp(4)} color="grey" />:
                                                            x.name === 'Fat (Sat.)' || x.name === 'Fat (Unsat.)' || x.name === 'Fat (trans)' ? <Entypo name="drop" size={wp(4)} color="#8B8000" />: 
                                                            x.name === 'Calories' ? <MaterialIcons name="local-fire-department" size={wp(4)} color="#249C86" /> : null}
                                                            <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}> {x.name}</Text>
                                                        </View>
                                                        <Text style={{textAlign: 'center', fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'grey'}}>{x.value}</Text>
                                                    </View>
                                        })}
                                    </View>
                                </View>
                                <TouchableOpacity style={{marginTop: 15, marginLeft: 15, alignSelf: 'flex-start'}} onPress={() => navigation.navigate('NutritionCalculator', {Item: item, values: item.nutritional_values})}>
                                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3.5), color: '#249c86'}}>Calculate how much you intake ! &rarr;</Text>
                                </TouchableOpacity>
                            </View>
                        </FlipCard>: null
                }}
            />
            {conCart ? handleOpen() : handleClose()}
                    <Animated.View style={{padding: 15, position: 'absolute', bottom: 60, width: '50%', left: '25%', right: '25%', transform: [{translateY: slideUp}]}}>
                        <TouchableOpacity style={{alignSelf: 'center', padding: 15, backgroundColor: '#6aab9e', borderRadius: 50, elevation: 5, shadowColor: "#000",shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.25, shadowRadius: 3.84}} onPress={() => navigation.navigate('cart')} activeOpacity={1}>
                            <MaterialCommunityIcons name="cart-outline" size={wp(6)} color="black" />
                        </TouchableOpacity>
                    </Animated.View>
        </View>
    )

    

    if (from === 'Custom2')
    return (
        <View style={styles.container}>
            <StatusBar style="inverted" />
            <FlatList 
                data={storeList}
                contentContainerStyle={{paddingBottom: 100}}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                ListEmptyComponent={() => (!storeList.length ? <Text style={{fontFamily: 'Maven-sem', textAlign: 'center', fontSize: wp(4), color: 'grey'}}>Nothing found! Try something different.</Text>: null)}
                renderItem={({ item }) => {
                    return item.category === 'Custom2' ?
                        <FlipCard friction={50} flip={false} flipHorizontal={true} flipVertical={false} useNativeDriver={true} style={{width: '85%', alignSelf: 'center'}}>
                            <View key={item.id} style={{flexDirection: 'row', marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000', elevation: 5, paddingTop: wp(6), paddingBottom: wp(8), paddingLeft: wp(5), borderRadius: 10, margin: wp(1)}}>
                                <ModalDropdown 
                                    ref={el => dropDownRef.current[item.id] = el}
                                    defaultValue={item.detail[0].quantity}
                                    options={item.detail.map(item1 => item1.quantity)} 
                                    style={{alignSelf: 'center', marginTop: 5, position: 'absolute', bottom: 2, left: 20, padding: 5}}
                                    dropdownStyle={{marginTop: -15, marginLeft: -10, width: '20%', alignItems: 'center', backgroundColor: 'white', elevation: 10, shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.34, shadowRadius: 6.27, shadowColor: '#000'}} 
                                    dropdownTextStyle={{fontSize: wp(4), fontFamily: 'Maven-med', textAlign: 'center', color: 'black'}} 
                                    renderSeparator={() => (<Text style={{backgroundColor: '#ebebeb', height: 1}}></Text>)}
                                    onSelect={(value, index) => updateList(item, index) ? setCustom([...custom]): setCustom([...custom, {item: item.name, value: index}])}
                                >
                                    <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => dropDownRef.current[item.id].show()}>
                                        {exists(item) ?
                                            item.detail.map((item2) => {
                                                return item2.quantity === exists(item) ?
                                                <Text key={item2.id} style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: '#249c86', }}>{item2.quantity}</Text>: null 
                                            })
                                            : <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: '#249c86', }}>{item.detail[0].quantity}</Text>
                                        }
                                        <Text style={{fontFamily: 'Maven-med', color: '#249c86', fontSize: wp(4)}}> ▼</Text>
                                    </TouchableOpacity>
                                </ModalDropdown>
                                <View style={{flex: 1}}>
                                    <Image source={{uri: item.image}} style={{width: 100, height: 80, borderRadius: 5}}  />
                                </View>
                                <View style={{flex: 1}}>
                                    <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4.5), marginBottom: 5, color: 'black'}}>{item.name}</Text>
                                    {exists(item) ? 
                                        item.detail.map((item2) => {
                                            return item2.quantity === exists(item) ?
                                            item2.previous_price > 0 ? 
                                            <View key={item2.id} style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                                <Text style={{textAlign: 'center', fontFamily: 'Maven-med', textDecorationLine: 'line-through', marginRight: wp(2.5), color: 'black'}}>&#8377; {item2.previous_price}</Text>
                                                <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>&#8377; {item2.price}</Text>
                                            </View>:
                                            <Text key={item2.id} style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>&#8377; {item2.price}</Text> : null
                                            
                                        }):  
                                        
                                        item.detail[0].previous_price > 0 ?
                                        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                            <Text style={{textAlign: 'center', fontFamily: 'Maven-med', textDecorationLine: 'line-through', marginRight: wp(2.5), color: 'black'}}>&#8377; {item.detail[0].previous_price}</Text>
                                            <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>&#8377; {item.detail[0].price}</Text>
                                        </View>
                                        : <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>&#8377; {item.detail[0].price}</Text>
                                    }
                                    
                                        {hideButton === 'none' ? item.availability === 'In stock' ? 
                                            search(item) ? cartData.map((item1) => {
                                                return item1.ordereditem  === item.name ? 
                                                    
                                                <View key={item1.id} style={{flexDirection: 'row', justifyContent: 'space-around', minHeight: wp(8.5), alignSelf: 'center', marginTop: 10, backgroundColor: '#fff', borderRadius: 5, width: '80%', elevation: 1, shadowOffset: {width: 0, height: 1}, shadowRadius: 1.00, shadowOpacity: 0.18, shadowColor: '#000'}}>
                                                
                                                <TouchableOpacity onPress={buildCart(item)} style={{flex: 1, backgroundColor: '#6aab9e', borderRadius: 5, elevation: 5, shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000'}} activeOpacity={1}>
                                                    <Text style={{textAlign: 'center',fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(6.5)}}>+</Text>
                                                </TouchableOpacity>
                                                <View style={{justifyContent: 'center', flex: 1}}>
                                                    <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(5)}}>{item1.item_count}</Text> 
                                                </View>
                                                <TouchableOpacity onPress={reduceItem(item)} style={{flex: 1, backgroundColor: '#6aab9e', borderRadius: 5, elevation: 5, shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000'}} activeOpacity={1}>
                                                    <Text style={{textAlign: 'center',fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(6.5)}}>-</Text>
                                                </TouchableOpacity>
                                            </View>
                                            : null
                                        }): 
                                        <TouchableOpacity onPress={buildCart(item)} style={{alignSelf: 'center', justifyContent: 'center',  marginTop: 10, backgroundColor: '#6aab9e', width: '80%', height: wp(8.5), borderRadius: 5, shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000', elevation: 5}} activeOpacity={1}>
                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(4.3)}}>Add &#43;</Text>
                                        </TouchableOpacity>
                                        :  <Text style={{color: 'red', textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), marginTop: 10, height: wp(8.5)}}>Out of stock !</Text>: <ActivityIndicator size={30} color="#6aab9e" style={{display: hideButton, alignSelf: 'center', marginTop: 10, height: wp(8.5)}} />}
                                    
                                </View>
                            </View>
                            <View key={item.id} style={{marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000', elevation: 5, margin: wp(1), paddingTop: wp(1), paddingBottom: wp(6), borderRadius: 10}}>
                                
                                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
                                    <Text style={{flex: 1, marginLeft: 15, fontFamily: 'sofia-black', fontSize: wp(5.5), color: 'black'}}>Details</Text>
                                    {item.avg_ratings > 0 ? 
                                        <View style={{flex: 1}}>
                                            <View style={{flexDirection:'row', justifyContent: 'center', alignItems: 'center'}}>
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 0 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 1 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 2 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 3 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 4 ? {color: '#249C86'}: {color: 'grey'}} />
                                                
                                                <Text style={{textAlign: 'center', fontFamily: 'Maven-med', color: 'black'}}> (<FontAwesome name="user" size={wp(3)} color="black" /> {item.no_of_ratings}) </Text>
                                            </View>
                                        </View>
                                    : null}
                                </View>
                                <Text style={{marginLeft: 15, fontFamily: 'Maven-med', fontSize: wp(3.5), flex: 1, color: 'black'}}>{item.description}</Text>
                                <Text style={{backgroundColor: '#ebebeb', height: 1, width: '90%', alignSelf: 'center', marginTop: 10}}></Text>
                                <View style={{flex: 1, marginTop: 5}}>
                                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), marginLeft: 15, color: 'black'}}>Nutrition per 100 g</Text>
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
                                        {item.nutritional_values.slice(0, 3).map((x, index) => {
                                            return  <View key={x.id} style={{flex: 1, borderRightWidth: index === 2 ? 0: 1, borderColor: '#b5b5b5'}}>
                                                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                                            {x.name === 'Protein' ? <MaterialCommunityIcons name="arm-flex" size={wp(4)} color="#c58c85" />: 
                                                            x.name === 'Carbs' ? <MaterialCommunityIcons name="barley" size={wp(4)} color="green" />:
                                                            x.name === 'Sugar' ? <FontAwesome name="cubes" size={wp(4)} color="grey" />:
                                                            x.name === 'Fat (Sat.)' || x.name === 'Fat (Unsat.)' || x.name === 'Fat (trans)' ? <Entypo name="drop" size={wp(4)} color="#8B8000" />: 
                                                            x.name === 'Calories' ? <MaterialIcons name="local-fire-department" size={wp(4)} color="#249C86" /> : null}
                                                            <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}> {x.name}</Text>
                                                        </View>
                                                        <Text style={{textAlign: 'center', fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'grey', marginTop: 3}}>{x.value}</Text>
                                                    </View>
                                        })}
                                    </View>
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
                                        {item.nutritional_values.slice(3, 5).map((x, index) => {
                                            return  <View key={x.id} style={{flex: 1, borderRightWidth: index === 1 ? 0: 1, borderColor: '#b5b5b5'}}>
                                                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                                            {x.name === 'Protein' ? <MaterialCommunityIcons name="arm-flex" size={wp(4)} color="#c58c85" />: 
                                                            x.name === 'Carbs' ? <MaterialCommunityIcons name="barley" size={wp(4)} color="green" />:
                                                            x.name === 'Sugar' ? <FontAwesome name="cubes" size={wp(4)} color="grey" />:
                                                            x.name === 'Fat (Sat.)' || x.name === 'Fat (Unsat.)' || x.name === 'Fat (trans)' ? <Entypo name="drop" size={wp(4)} color="#8B8000" />: 
                                                            x.name === 'Calories' ? <MaterialIcons name="local-fire-department" size={wp(4)} color="#249C86" /> : null}
                                                            <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}> {x.name}</Text>
                                                        </View>
                                                        <Text style={{textAlign: 'center', fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'grey'}}>{x.value}</Text>
                                                    </View>
                                        })}
                                    </View>
                                </View>
                                <TouchableOpacity style={{marginTop: 15, marginLeft: 15, alignSelf: 'flex-start'}} onPress={() => navigation.navigate('NutritionCalculator', {Item: item, values: item.nutritional_values})}>
                                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3.5), color: '#249c86'}}>Calculate how much you intake ! &rarr;</Text>
                                </TouchableOpacity>
                            </View>
                        </FlipCard>: null
                }}
            />
            {conCart ? handleOpen() : handleClose()}
                    <Animated.View style={{padding: 15, position: 'absolute', bottom: 60, width: '50%', left: '25%', right: '25%', transform: [{translateY: slideUp}]}}>
                        <TouchableOpacity style={{alignSelf: 'center', padding: 15, backgroundColor: '#6aab9e', borderRadius: 50, elevation: 5, shadowColor: "#000",shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.25, shadowRadius: 3.84}} onPress={() => navigation.navigate('cart')} activeOpacity={1}>
                            <MaterialCommunityIcons name="cart-outline" size={wp(6)} color="black" />
                        </TouchableOpacity>
                    </Animated.View>
        </View>
    )



    if (from === 'Custom3')
    return (
        <View style={styles.container}>
            <StatusBar style="inverted" />
            <FlatList 
                data={storeList}
                contentContainerStyle={{paddingBottom: 100}}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                ListEmptyComponent={() => (!storeList.length ? <Text style={{fontFamily: 'Maven-sem', textAlign: 'center', fontSize: wp(4), color: 'grey'}}>Nothing found! Try something different.</Text>: null)}
                renderItem={({ item }) => {
                    return item.category === 'Custom3' ?
                        <FlipCard friction={50} flip={false} flipHorizontal={true} flipVertical={false} useNativeDriver={true} style={{width: '85%', alignSelf: 'center'}}>
                            <View key={item.id} style={{flexDirection: 'row', marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000', elevation: 5, paddingTop: wp(6), paddingBottom: wp(8), paddingLeft: wp(5), borderRadius: 10, margin: wp(1)}}>
                                <ModalDropdown 
                                    ref={el => dropDownRef.current[item.id] = el}
                                    defaultValue={item.detail[0].quantity}
                                    options={item.detail.map(item1 => item1.quantity)} 
                                    style={{alignSelf: 'center', marginTop: 5, position: 'absolute', bottom: 2, left: 20, padding: 5}}
                                    dropdownStyle={{marginTop: -15, marginLeft: -10, width: '20%', alignItems: 'center', backgroundColor: 'white', elevation: 10, shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.34, shadowRadius: 6.27, shadowColor: '#000'}} 
                                    dropdownTextStyle={{fontSize: wp(4), fontFamily: 'Maven-med', textAlign: 'center', color: 'black'}} 
                                    renderSeparator={() => (<Text style={{backgroundColor: '#ebebeb', height: 1}}></Text>)}
                                    onSelect={(value, index) => updateList(item, index) ? setCustom([...custom]): setCustom([...custom, {item: item.name, value: index}])}
                                >
                                    <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => dropDownRef.current[item.id].show()}>
                                        {exists(item) ?
                                            item.detail.map((item2) => {
                                                return item2.quantity === exists(item) ?
                                                <Text key={item2.id} style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: '#249c86', }}>{item2.quantity}</Text>: null 
                                            })
                                            : <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: '#249c86', }}>{item.detail[0].quantity}</Text>
                                        }
                                        <Text style={{fontFamily: 'Maven-med', color: '#249c86', fontSize: wp(4)}}> ▼</Text>
                                    </TouchableOpacity>
                                </ModalDropdown>
                                <View style={{flex: 1}}>
                                    <Image source={{uri: item.image}} style={{width: 100, height: 80, borderRadius: 5}}  />
                                </View>
                                <View style={{flex: 1}}>
                                    <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4.5), marginBottom: 5, color: 'black'}}>{item.name}</Text>
                                    {exists(item) ? 
                                        item.detail.map((item2) => {
                                            return item2.quantity === exists(item) ?
                                            item2.previous_price > 0 ? 
                                            <View key={item2.id} style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                                <Text style={{textAlign: 'center', fontFamily: 'Maven-med', textDecorationLine: 'line-through', marginRight: wp(2.5), color: 'black'}}>&#8377; {item2.previous_price}</Text>
                                                <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>&#8377; {item2.price}</Text>
                                            </View>:
                                            <Text key={item2.id} style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>&#8377; {item2.price}</Text> : null
                                            
                                        }):  
                                        
                                        item.detail[0].previous_price > 0 ?
                                        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                            <Text style={{textAlign: 'center', fontFamily: 'Maven-med', textDecorationLine: 'line-through', marginRight: wp(2.5), color: 'black'}}>&#8377; {item.detail[0].previous_price}</Text>
                                            <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>&#8377; {item.detail[0].price}</Text>
                                        </View>
                                        : <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>&#8377; {item.detail[0].price}</Text>
                                    }
                                    
                                        {hideButton === 'none' ? item.availability === 'In stock' ? 
                                            search(item) ? cartData.map((item1) => {
                                                return item1.ordereditem  === item.name ? 
                                                    
                                                <View key={item1.id} style={{flexDirection: 'row', justifyContent: 'space-around', minHeight: wp(8.5), alignSelf: 'center', marginTop: 10, backgroundColor: '#fff', borderRadius: 5, width: '80%', elevation: 1, shadowOffset: {width: 0, height: 1}, shadowRadius: 1.00, shadowOpacity: 0.18, shadowColor: '#000'}}>
                                                
                                                <TouchableOpacity onPress={buildCart(item)} style={{flex: 1, backgroundColor: '#6aab9e', borderRadius: 5, elevation: 5, shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000'}} activeOpacity={1}>
                                                    <Text style={{textAlign: 'center',fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(6.5)}}>+</Text>
                                                </TouchableOpacity>
                                                <View style={{justifyContent: 'center', flex: 1}}>
                                                    <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(5)}}>{item1.item_count}</Text> 
                                                </View>
                                                <TouchableOpacity onPress={reduceItem(item)} style={{flex: 1, backgroundColor: '#6aab9e', borderRadius: 5, elevation: 5, shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000'}} activeOpacity={1}>
                                                    <Text style={{textAlign: 'center',fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(6.5)}}>-</Text>
                                                </TouchableOpacity>
                                            </View>
                                            : null
                                        }): 
                                        <TouchableOpacity onPress={buildCart(item)} style={{alignSelf: 'center', justifyContent: 'center',  marginTop: 10, backgroundColor: '#6aab9e', width: '80%', height: wp(8.5), borderRadius: 5, shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000', elevation: 5}} activeOpacity={1}>
                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(4.3)}}>Add &#43;</Text>
                                        </TouchableOpacity>
                                        :  <Text style={{color: 'red', textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), marginTop: 10, height: wp(8.5)}}>Out of stock !</Text>: <ActivityIndicator size={30} color="#6aab9e" style={{display: hideButton, alignSelf: 'center', marginTop: 10, height: wp(8.5)}} />}
                                    
                                </View>
                            </View>
                            <View key={item.id} style={{marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000', elevation: 5, margin: wp(1), paddingTop: wp(1), paddingBottom: wp(6), borderRadius: 10}}>
                                
                                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
                                    <Text style={{flex: 1, marginLeft: 15, fontFamily: 'sofia-black', fontSize: wp(5.5), color: 'black'}}>Details</Text>
                                    {item.avg_ratings > 0 ? 
                                        <View style={{flex: 1}}>
                                            <View style={{flexDirection:'row', justifyContent: 'center', alignItems: 'center'}}>
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 0 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 1 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 2 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 3 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 4 ? {color: '#249C86'}: {color: 'grey'}} />
                                                
                                                <Text style={{textAlign: 'center', fontFamily: 'Maven-med', color: 'black'}}> (<FontAwesome name="user" size={wp(3)} color="black" /> {item.no_of_ratings}) </Text>
                                            </View>
                                        </View>
                                    : null}
                                </View>
                                <Text style={{marginLeft: 15, fontFamily: 'Maven-med', fontSize: wp(3.5), flex: 1, color: 'black'}}>{item.description}</Text>
                                <Text style={{backgroundColor: '#ebebeb', height: 1, width: '90%', alignSelf: 'center', marginTop: 10}}></Text>
                                <View style={{flex: 1, marginTop: 5}}>
                                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), marginLeft: 15, color: 'black'}}>Nutrition per 100 g</Text>
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
                                        {item.nutritional_values.slice(0, 3).map((x, index) => {
                                            return  <View key={x.id} style={{flex: 1, borderRightWidth: index === 2 ? 0: 1, borderColor: '#b5b5b5'}}>
                                                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                                            {x.name === 'Protein' ? <MaterialCommunityIcons name="arm-flex" size={wp(4)} color="#c58c85" />: 
                                                            x.name === 'Carbs' ? <MaterialCommunityIcons name="barley" size={wp(4)} color="green" />:
                                                            x.name === 'Sugar' ? <FontAwesome name="cubes" size={wp(4)} color="grey" />:
                                                            x.name === 'Fat (Sat.)' || x.name === 'Fat (Unsat.)' || x.name === 'Fat (trans)' ? <Entypo name="drop" size={wp(4)} color="#8B8000" />: 
                                                            x.name === 'Calories' ? <MaterialIcons name="local-fire-department" size={wp(4)} color="#249C86" /> : null}
                                                            <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}> {x.name}</Text>
                                                        </View>
                                                        <Text style={{textAlign: 'center', fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'grey', marginTop: 3}}>{x.value}</Text>
                                                    </View>
                                        })}
                                    </View>
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
                                        {item.nutritional_values.slice(3, 5).map((x, index) => {
                                            return  <View key={x.id} style={{flex: 1, borderRightWidth: index === 1 ? 0: 1, borderColor: '#b5b5b5'}}>
                                                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                                            {x.name === 'Protein' ? <MaterialCommunityIcons name="arm-flex" size={wp(4)} color="#c58c85" />: 
                                                            x.name === 'Carbs' ? <MaterialCommunityIcons name="barley" size={wp(4)} color="green" />:
                                                            x.name === 'Sugar' ? <FontAwesome name="cubes" size={wp(4)} color="grey" />:
                                                            x.name === 'Fat (Sat.)' || x.name === 'Fat (Unsat.)' || x.name === 'Fat (trans)' ? <Entypo name="drop" size={wp(4)} color="#8B8000" />: 
                                                            x.name === 'Calories' ? <MaterialIcons name="local-fire-department" size={wp(4)} color="#249C86" /> : null}
                                                            <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}> {x.name}</Text>
                                                        </View>
                                                        <Text style={{textAlign: 'center', fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'grey'}}>{x.value}</Text>
                                                    </View>
                                        })}
                                    </View>
                                </View>
                                <TouchableOpacity style={{marginTop: 15, marginLeft: 15, alignSelf: 'flex-start'}} onPress={() => navigation.navigate('NutritionCalculator', {Item: item, values: item.nutritional_values})}>
                                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3.5), color: '#249c86'}}>Calculate how much you intake ! &rarr;</Text>
                                </TouchableOpacity>
                            </View>
                        </FlipCard>: null
                }}
            />
            {conCart ? handleOpen() : handleClose()}
                    <Animated.View style={{padding: 15, position: 'absolute', bottom: 60, width: '50%', left: '25%', right: '25%', transform: [{translateY: slideUp}]}}>
                        <TouchableOpacity style={{alignSelf: 'center', padding: 15, backgroundColor: '#6aab9e', borderRadius: 50, elevation: 5, shadowColor: "#000",shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.25, shadowRadius: 3.84}} onPress={() => navigation.navigate('cart')} activeOpacity={1}>
                            <MaterialCommunityIcons name="cart-outline" size={wp(6)} color="black" />
                        </TouchableOpacity>
                    </Animated.View>
        </View>
    )



    if (from === 'Custom4')
    return (
        <View style={styles.container}>
            <StatusBar style="inverted" />
            <FlatList 
                data={storeList}
                contentContainerStyle={{paddingBottom: 100}}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                ListEmptyComponent={() => (!storeList.length ? <Text style={{fontFamily: 'Maven-sem', textAlign: 'center', fontSize: wp(4), color: 'grey'}}>Nothing found! Try something different.</Text>: null)}
                renderItem={({ item }) => {
                    return item.category === 'Custom4' ?
                        <FlipCard friction={50} flip={false} flipHorizontal={true} flipVertical={false} useNativeDriver={true} style={{width: '85%', alignSelf: 'center'}}>
                            <View key={item.id} style={{flexDirection: 'row', marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000', elevation: 5, paddingTop: wp(6), paddingBottom: wp(8), paddingLeft: wp(5), borderRadius: 10, margin: wp(1)}}>
                                <ModalDropdown 
                                    ref={el => dropDownRef.current[item.id] = el}
                                    defaultValue={item.detail[0].quantity}
                                    options={item.detail.map(item1 => item1.quantity)} 
                                    style={{alignSelf: 'center', marginTop: 5, position: 'absolute', bottom: 2, left: 20, padding: 5}}
                                    dropdownStyle={{marginTop: -15, marginLeft: -10, width: '20%', alignItems: 'center', backgroundColor: 'white', elevation: 10, shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.34, shadowRadius: 6.27, shadowColor: '#000'}} 
                                    dropdownTextStyle={{fontSize: wp(4), fontFamily: 'Maven-med', textAlign: 'center', color: 'black'}} 
                                    renderSeparator={() => (<Text style={{backgroundColor: '#ebebeb', height: 1}}></Text>)}
                                    onSelect={(value, index) => updateList(item, index) ? setCustom([...custom]): setCustom([...custom, {item: item.name, value: index}])}
                                >
                                    <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => dropDownRef.current[item.id].show()}>
                                        {exists(item) ?
                                            item.detail.map((item2) => {
                                                return item2.quantity === exists(item) ?
                                                <Text key={item2.id} style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: '#249c86', }}>{item2.quantity}</Text>: null 
                                            })
                                            : <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: '#249c86', }}>{item.detail[0].quantity}</Text>
                                        }
                                        <Text style={{fontFamily: 'Maven-med', color: '#249c86', fontSize: wp(4)}}> ▼</Text>
                                    </TouchableOpacity>
                                </ModalDropdown>
                                <View style={{flex: 1}}>
                                    <Image source={{uri: item.image}} style={{width: 100, height: 80, borderRadius: 5}}  />
                                </View>
                                <View style={{flex: 1}}>
                                    <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4.5), marginBottom: 5, color: 'black'}}>{item.name}</Text>
                                    {exists(item) ? 
                                        item.detail.map((item2) => {
                                            return item2.quantity === exists(item) ?
                                            item2.previous_price > 0 ? 
                                            <View key={item2.id} style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                                <Text style={{textAlign: 'center', fontFamily: 'Maven-med', textDecorationLine: 'line-through', marginRight: wp(2.5), color: 'black'}}>&#8377; {item2.previous_price}</Text>
                                                <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>&#8377; {item2.price}</Text>
                                            </View>:
                                            <Text key={item2.id} style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>&#8377; {item2.price}</Text> : null
                                            
                                        }):  
                                        
                                        item.detail[0].previous_price > 0 ?
                                        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                            <Text style={{textAlign: 'center', fontFamily: 'Maven-med', textDecorationLine: 'line-through', marginRight: wp(2.5), color: 'black'}}>&#8377; {item.detail[0].previous_price}</Text>
                                            <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>&#8377; {item.detail[0].price}</Text>
                                        </View>
                                        : <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>&#8377; {item.detail[0].price}</Text>
                                    }
                                    
                                        {hideButton === 'none' ? item.availability === 'In stock' ? 
                                            search(item) ? cartData.map((item1) => {
                                                return item1.ordereditem  === item.name ? 
                                                    
                                                <View key={item1.id} style={{flexDirection: 'row', justifyContent: 'space-around', minHeight: wp(8.5), alignSelf: 'center', marginTop: 10, backgroundColor: '#fff', borderRadius: 5, width: '80%', elevation: 1, shadowOffset: {width: 0, height: 1}, shadowRadius: 1.00, shadowOpacity: 0.18, shadowColor: '#000'}}>
                                                
                                                <TouchableOpacity onPress={buildCart(item)} style={{flex: 1, backgroundColor: '#6aab9e', borderRadius: 5, elevation: 5, shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000'}} activeOpacity={1}>
                                                    <Text style={{textAlign: 'center',fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(6.5)}}>+</Text>
                                                </TouchableOpacity>
                                                <View style={{justifyContent: 'center', flex: 1}}>
                                                    <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(5)}}>{item1.item_count}</Text> 
                                                </View>
                                                <TouchableOpacity onPress={reduceItem(item)} style={{flex: 1, backgroundColor: '#6aab9e', borderRadius: 5, elevation: 5, shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000'}} activeOpacity={1}>
                                                    <Text style={{textAlign: 'center',fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(6.5)}}>-</Text>
                                                </TouchableOpacity>
                                            </View>
                                            : null
                                        }): 
                                        <TouchableOpacity onPress={buildCart(item)} style={{alignSelf: 'center', justifyContent: 'center',  marginTop: 10, backgroundColor: '#6aab9e', width: '80%', height: wp(8.5), borderRadius: 5, shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000', elevation: 5}} activeOpacity={1}>
                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(4.3)}}>Add &#43;</Text>
                                        </TouchableOpacity>
                                        :  <Text style={{color: 'red', textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), marginTop: 10, height: wp(8.5)}}>Out of stock !</Text>: <ActivityIndicator size={30} color="#6aab9e" style={{display: hideButton, alignSelf: 'center', marginTop: 10, height: wp(8.5)}} />}
                                    
                                </View>
                            </View>
                            <View key={item.id} style={{marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000', elevation: 5, margin: wp(1), paddingTop: wp(1), paddingBottom: wp(6), borderRadius: 10}}>
                                
                                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
                                    <Text style={{flex: 1, marginLeft: 15, fontFamily: 'sofia-black', fontSize: wp(5.5), color: 'black'}}>Details</Text>
                                    {item.avg_ratings > 0 ? 
                                        <View style={{flex: 1}}>
                                            <View style={{flexDirection:'row', justifyContent: 'center', alignItems: 'center'}}>
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 0 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 1 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 2 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 3 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 4 ? {color: '#249C86'}: {color: 'grey'}} />
                                                
                                                <Text style={{textAlign: 'center', fontFamily: 'Maven-med', color: 'black'}}> (<FontAwesome name="user" size={wp(3)} color="black" /> {item.no_of_ratings}) </Text>
                                            </View>
                                        </View>
                                    : null}
                                </View>
                                <Text style={{marginLeft: 15, fontFamily: 'Maven-med', fontSize: wp(3.5), flex: 1, color: 'black'}}>{item.description}</Text>
                                <Text style={{backgroundColor: '#ebebeb', height: 1, width: '90%', alignSelf: 'center', marginTop: 10}}></Text>
                                <View style={{flex: 1, marginTop: 5}}>
                                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), marginLeft: 15, color: 'black'}}>Nutrition per 100 g</Text>
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
                                        {item.nutritional_values.slice(0, 3).map((x, index) => {
                                            return  <View key={x.id} style={{flex: 1, borderRightWidth: index === 2 ? 0: 1, borderColor: '#b5b5b5'}}>
                                                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                                            {x.name === 'Protein' ? <MaterialCommunityIcons name="arm-flex" size={wp(4)} color="#c58c85" />: 
                                                            x.name === 'Carbs' ? <MaterialCommunityIcons name="barley" size={wp(4)} color="green" />:
                                                            x.name === 'Sugar' ? <FontAwesome name="cubes" size={wp(4)} color="grey" />:
                                                            x.name === 'Fat (Sat.)' || x.name === 'Fat (Unsat.)' || x.name === 'Fat (trans)' ? <Entypo name="drop" size={wp(4)} color="#8B8000" />: 
                                                            x.name === 'Calories' ? <MaterialIcons name="local-fire-department" size={wp(4)} color="#249C86" /> : null}
                                                            <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}> {x.name}</Text>
                                                        </View>
                                                        <Text style={{textAlign: 'center', fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'grey', marginTop: 3}}>{x.value}</Text>
                                                    </View>
                                        })}
                                    </View>
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
                                        {item.nutritional_values.slice(3, 5).map((x, index) => {
                                            return  <View key={x.id} style={{flex: 1, borderRightWidth: index === 1 ? 0: 1, borderColor: '#b5b5b5'}}>
                                                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                                            {x.name === 'Protein' ? <MaterialCommunityIcons name="arm-flex" size={wp(4)} color="#c58c85" />: 
                                                            x.name === 'Carbs' ? <MaterialCommunityIcons name="barley" size={wp(4)} color="green" />:
                                                            x.name === 'Sugar' ? <FontAwesome name="cubes" size={wp(4)} color="grey" />:
                                                            x.name === 'Fat (Sat.)' || x.name === 'Fat (Unsat.)' || x.name === 'Fat (trans)' ? <Entypo name="drop" size={wp(4)} color="#8B8000" />: 
                                                            x.name === 'Calories' ? <MaterialIcons name="local-fire-department" size={wp(4)} color="#249C86" /> : null}
                                                            <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}> {x.name}</Text>
                                                        </View>
                                                        <Text style={{textAlign: 'center', fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'grey'}}>{x.value}</Text>
                                                    </View>
                                        })}
                                    </View>
                                </View>
                                <TouchableOpacity style={{marginTop: 15, marginLeft: 15, alignSelf: 'flex-start'}} onPress={() => navigation.navigate('NutritionCalculator', {Item: item, values: item.nutritional_values})}>
                                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3.5), color: '#249c86'}}>Calculate how much you intake ! &rarr;</Text>
                                </TouchableOpacity>
                            </View>
                        </FlipCard>: null
                }}
            />
            {conCart ? handleOpen() : handleClose()}
                    <Animated.View style={{padding: 15, position: 'absolute', bottom: 60, width: '50%', left: '25%', right: '25%', transform: [{translateY: slideUp}]}}>
                        <TouchableOpacity style={{alignSelf: 'center', padding: 15, backgroundColor: '#6aab9e', borderRadius: 50, elevation: 5, shadowColor: "#000",shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.25, shadowRadius: 3.84}} onPress={() => navigation.navigate('cart')} activeOpacity={1}>
                            <MaterialCommunityIcons name="cart-outline" size={wp(6)} color="black" />
                        </TouchableOpacity>
                    </Animated.View>
        </View>
    )




}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
        paddingTop: 100,
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
        backgroundColor: "#6aab9e",
        elevation: 3,
        shadowOffset: {width: 0, height: 1},
        shadowRadius: 2.22,
        shadowOpacity: 0.22,
        shadowColor: '#000',
        marginHorizontal: 15,
        marginBottom: 5,
        borderRadius: 10,
        minHeight: 60,
        flexDirection: 'row',
        alignItems: 'center'
    },
})