import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, RefreshControl, ScrollView, SafeAreaView, Image, Button, TouchableOpacity, Animated, Dimensions, FlatList } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { Ionicons, FontAwesome, FontAwesome5, MaterialCommunityIcons, Feather, Entypo, MaterialIcons, AntDesign } from "@expo/vector-icons";
import Svg, { Path, G, Rect } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ModalDropdown from 'react-native-modal-dropdown';
import FlipCard from 'react-native-flip-card';


export default function HomeProducts({ navigation, route }) {

    const { from } = route.params;

    const [storeList, setStoreList] = useState([]);
    const [cartStatus, setCartStatus] = useState(401);
    const [cartData, setCartData] = useState([]);

    const [loading, setLoading] = useState('true');
    const [refreshing, setRefreshing] = useState(false);

    const [hideButton, setHideButton] = useState('flex');
    const [custom, setCustom] = useState([{item: 'default', value: 'default'}]);
    const dropDownRef = useRef([]);

    const animation = new Animated.Value(0);
    const screenHeight = Dimensions.get("window").height;

    const [error, setError] = useState('');


    useEffect(() => {
        let mounted = true
        fetch('http://192.168.0.105:8000/store/storelist/',{
        method: 'GET',
        headers: {
            'Content-type': 'application/json'
        }
        })
        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => {if (mounted) {setStoreList(resp.json); dropDownRef.current = new Array(resp.json.length);}})
        .then(() => {if (mounted) {setTimeout(() => setLoading(false), 500)}})
        .catch(error => console.log(error))

        return () => {
            mounted = false;
        }
    }, [])


    useEffect(() => {
        dropDownRef.current = new Array(storeList.length)
    }, [storeList])


    useEffect(() => {
        let mounted = true;
        const getCart = navigation.addListener('focus', () => {
            if (mounted) {
                setHideButton('flex')
            };
            (async () => {
                const token = await AsyncStorage.getItem('USER_TOKEN')
                if (token) {
                    fetch('http://192.168.0.105:8000/store/cart/',{
                        method: 'GET',
                        headers: {
                            'Authorization': `Token ${token}`,
                            'Content-type': 'application/json'
                        }
                    })
                    .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                    .then(resp => {if (mounted) {setCartData(resp.json), setCartStatus(resp.status)}})
                    .then(() => setHideButton('none'))
                    .catch(error => console.log(error))
                } else {
                    if (mounted) {
                        setCartData([]);
                        setHideButton('none');
                    }
                }
                

            })().catch(error => console.log(error))
        });
        
        return () => {
            mounted = false;
        }
        
    }, [navigation])



    const buildCart = (item) => async evt  => {
        const token =  await AsyncStorage.getItem('USER_TOKEN')
        if (token) {
            const check = exists(item);
            if (check !== undefined){
                return fetch('http://192.168.0.105:8000/store/cart/',{
                    method: 'POST',
                    headers: {
                    'Authorization': `Token ${token}`,
                    'Content-type': 'application/json'
                    },
                    body: JSON.stringify({ ordereditem: item, quantity:  check })
                })
                .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                .then(resp => setCartData(resp.json.cart))
                .then(() => console.log(check))
                .catch(error => console.log(error))
            } else {
                return fetch('http://192.168.0.105:8000/store/cart/',{
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
        return fetch('http://192.168.0.105:8000/store/reduceordelete/',{
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






    if (from === 'Banner1')
    return (
        <View style={styles.container}>
            <FlatList 
                data={storeList}
                contentContainerStyle={{paddingBottom: 100, marginTop: hp(10)}}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                ListEmptyComponent={() => (!storeList.length ? <Text style={{fontFamily: 'sf-semi', textAlign: 'center', fontSize: wp(4), color: 'grey'}}>Nothing found! Try something different.</Text>: null)}
                renderItem={({ item }) => {
                    return item.category === 'Banner1' ?
                        <FlipCard friction={50} flip={false} flipHorizontal={true} flipVertical={false} useNativeDriver={true} style={{width: '85%', alignSelf: 'center'}}>
                            <View key={item.id} style={{flexDirection: 'row', marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 1, height: 1}, shadowRadius: 1.5, shadowOpacity: 0.3, elevation: 2, paddingTop: wp(6), paddingBottom: wp(8), paddingLeft: wp(5), borderRadius: 10}}>
                                <ModalDropdown 
                                    ref={el => dropDownRef.current[item.id] = el}
                                    defaultValue={item.detail[0].quantity}
                                    options={item.detail.map(item1 => item1.quantity)} 
                                    style={{alignSelf: 'center', marginTop: 5, position: 'absolute', bottom: 2, left: 20, padding: 5}}
                                    dropdownStyle={{marginTop: -15, marginLeft: -10, width: '20%', alignItems: 'center', backgroundColor: 'white', elevation: 10, shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.34, shadowRadius: 6.27}} 
                                    dropdownTextStyle={{fontSize: wp(4), fontFamily: 'sf', textAlign: 'center', color: 'black'}} 
                                    renderSeparator={() => (<Text style={{backgroundColor: '#ebebeb', height: 1}}></Text>)}
                                    onSelect={(value, index) => updateList(item, index) ? setCustom([...custom]): setCustom([...custom, {item: item.name, value: index}])}
                                >
                                    <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => dropDownRef.current[item.id].show()}>
                                        {exists(item) ?
                                            item.detail.map((item2) => {
                                                return item2.quantity === exists(item) ?
                                                <Text key={item2.id} style={{fontFamily: 'sf-semi', fontSize: wp(3.5), color: '#249c86', fontWeight: 'bold'}}>{item2.quantity}</Text>: null 
                                            })
                                            : <Text style={{fontFamily: 'sf-semi', fontSize: wp(3.5), color: '#249c86', fontWeight: 'bold'}}>{item.detail[0].quantity}</Text>
                                        }
                                        <Text style={{fontFamily: 'sf', color: '#249c86', fontSize: wp(3.5)}}> ▼</Text>
                                    </TouchableOpacity>
                                </ModalDropdown>
                                <View style={{flex: 1}}>
                                    <Image source={{uri: item.image}} style={{width: 100, height: 80, borderRadius: 5}}  />
                                </View>
                                <View style={{flex: 1}}>
                                    <Text style={{textAlign: 'center', fontFamily: 'sofia-bold', fontSize: wp(4.5), marginBottom: 5}}>{item.name}</Text>
                                    {exists(item) ? 
                                        item.detail.map((item2) => {
                                            return item2.quantity === exists(item) ?
                                            item2.previous_price > 0 ? 
                                            <View key={item2.id} style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                                <Text style={{textAlign: 'center', fontFamily: 'sf', textDecorationLine: 'line-through', marginRight: wp(2)}}>&#8377; {item2.previous_price}</Text>
                                                <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}>&#8377; {item2.price}</Text>
                                            </View>:
                                            <Text key={item2.id} style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}>&#8377; {item2.price}</Text> : null
                                            
                                        }):  
                                        
                                        item.detail[0].previous_price > 0 ?
                                        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                            <Text style={{textAlign: 'center', fontFamily: 'sf', textDecorationLine: 'line-through', marginRight: wp(2)}}>&#8377; {item.detail[0].previous_price}</Text>
                                            <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}>&#8377; {item.detail[0].price}</Text>
                                        </View>
                                        : <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}>&#8377; {item.detail[0].price}</Text>
                                    }
                                    
                                        {hideButton === 'none' ? item.availability === 'In stock' ? 
                                            search(item) ? cartData.map((item1) => {
                                                return item1.ordereditem  === item.name ? 
                                                    
                                                <View key={item1.id} style={{flexDirection: 'row', justifyContent: 'center', alignSelf: 'center', marginTop: 10, alignItems: 'center', backgroundColor: '#99b898', borderRadius: 5, width: '60%', elevation: 5, shadowOffset: {width: 1, height: 1}, shadowRadius: 2, shadowOpacity: 0.5, height: 30, padding: wp(1), flex: 0.1}}>
                                                        
                                                        <TouchableOpacity onPress={buildCart(item)} style={{justifyContent: 'center'}}>
                                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(6)}}>+ </Text>
                                                        </TouchableOpacity>
                                                        <View style={{justifyContent: 'center'}}>
                                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(4.5)}}> {item1.item_count} </Text> 
                                                        </View>
                                                        <TouchableOpacity onPress={reduceItem(item)} style={{justifyContent: 'center'}}>
                                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(6)}}> -</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                    : null
                                                }): 
                                                <TouchableOpacity onPress={buildCart(item)} style={{flex: 0.1, alignSelf: 'center', justifyContent: 'center',  marginTop: 10, backgroundColor: '#99b898', width: '60%', height: 30, borderRadius: 5, shadowOffset: {width: 1, height: 1}, shadowRadius: 2, shadowOpacity: 0.5, elevation: 5}} activeOpacity={1}>
                                                    <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(4)}}>Add &#43;</Text>
                                                </TouchableOpacity>
                                        :  <Text style={{color: 'red', textAlign: 'center'}}>Out of stock!</Text>: <ActivityIndicator size={30} color="#99b898" style={{display: hideButton, alignSelf: 'center', marginTop: 10}} />}
                                    
                                </View>
                            </View>
                            <View key={item.id} style={{marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 1, height: 1}, shadowRadius: 1.5, shadowOpacity: 0.3, elevation: 2, margin: wp(1), paddingTop: wp(1), paddingBottom: wp(6), borderRadius: 10}}>
                                
                                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
                                    <Text style={{flex: 1, marginLeft: 15, fontFamily: 'sofia-black', fontSize: wp(5.5)}}>Details</Text>
                                    {item.avg_ratings > 0 ? 
                                        <View style={{flex: 1}}>
                                            <View style={{flexDirection:'row', justifyContent: 'center', alignItems: 'center'}}>
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 0 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 1 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 2 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 3 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 4 ? {color: '#249C86'}: {color: 'grey'}} />
                                                
                                                <Text style={{textAlign: 'center', fontFamily: 'sf'}}> (<FontAwesome name="user" size={wp(3)} color="black" /> {item.no_of_ratings}) </Text>
                                            </View>
                                        </View>
                                    : null}
                                </View>
                                <Text style={{marginLeft: 15, fontFamily: 'sf', fontSize: wp(3.5), flex: 1}}>{item.description}</Text>
                                <View style={{flex: 1, marginTop: 5}}>
                                    <Text style={{fontFamily: 'sofia-bold', fontSize: wp(4.5), marginLeft: 15}}>Nutrition per 100 g</Text>
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
                                        {item.nutritional_values.slice(0, 3).map((x, index) => {
                                            return  <View key={x.id} style={{flex: 1, borderRightWidth: index === 2 ? 0: 1, borderColor: '#b5b5b5'}}>
                                                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                                            {x.name === 'Protein' ? <MaterialCommunityIcons name="arm-flex" size={wp(4)} color="#c58c85" />: 
                                                            x.name === 'Carbs' ? <MaterialCommunityIcons name="barley" size={wp(4)} color="green" />:
                                                            x.name === 'Sugar' ? <FontAwesome name="cubes" size={wp(4)} color="grey" />:
                                                            x.name === 'Fat (Sat.)' || x.name === 'Fat (Unsat.)' || x.name === 'Fat (trans)' ? <Entypo name="drop" size={wp(4)} color="#8B8000" />: 
                                                            x.name === 'Calories' ? <MaterialIcons name="local-fire-department" size={wp(4)} color="#249C86" /> : null}
                                                            <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}> {x.name}</Text>
                                                        </View>
                                                        <Text style={{textAlign: 'center', fontFamily: 'sf', fontSize: wp(3.5), color: 'grey', marginTop: 3}}>{x.value}</Text>
                                                    </View>
                                        })}
                                    </View>
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
                                        {item.nutritional_values.slice(3, 5).map((x, index) => {
                                            return  <View key={x.id} style={{flex: 1, borderRightWidth: index === 1 ? 0: 1, borderColor: '#b5b5b5'}}>
                                                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                                            {x.name === 'Protein' ? <MaterialCommunityIcons name="arm-flex" size={wp(4)} color="brown" />: 
                                                            x.name === 'Carbs' ? <MaterialCommunityIcons name="barley" size={wp(4)} color="green" />:
                                                            x.name === 'Sugar' ? <FontAwesome name="cubes" size={wp(4)} color="grey" />:
                                                            x.name === 'Fat (Sat.)' || x.name === 'Fat (Unsat.)' || x.name === 'Fat (trans)' ? <Entypo name="drop" size={wp(4)} color="#8B8000" />: 
                                                            x.name === 'Calories' ? <MaterialIcons name="local-fire-department" size={wp(4)} color="#249C86" /> : null}
                                                            <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}> {x.name}</Text>
                                                        </View>
                                                        <Text style={{textAlign: 'center', fontFamily: 'sf', fontSize: wp(3.5), color: 'grey'}}>{x.value}</Text>
                                                    </View>
                                        })}
                                    </View>
                                </View>
                            </View>
                        </FlipCard>: null
                }}
            />

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
            <FlatList 
                data={storeList}
                contentContainerStyle={{paddingBottom: 100, marginTop: hp(10)}}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                ListEmptyComponent={() => (!storeList.length ? <Text style={{fontFamily: 'sf-semi', textAlign: 'center', fontSize: wp(4), color: 'grey'}}>Nothing found! Try something different.</Text>: null)}
                renderItem={({ item }) => {
                    return item.category === 'Banner2' ?
                        <FlipCard friction={50} flip={false} flipHorizontal={true} flipVertical={false} useNativeDriver={true} style={{width: '85%', alignSelf: 'center'}}>
                            <View key={item.id} style={{flexDirection: 'row', marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 1, height: 1}, shadowRadius: 1.5, shadowOpacity: 0.3, elevation: 2, paddingTop: wp(6), paddingBottom: wp(8), paddingLeft: wp(5), borderRadius: 10}}>
                                <ModalDropdown 
                                    ref={el => dropDownRef.current[item.id] = el}
                                    defaultValue={item.detail[0].quantity}
                                    options={item.detail.map(item1 => item1.quantity)} 
                                    style={{alignSelf: 'center', marginTop: 5, position: 'absolute', bottom: 2, left: 20, padding: 5}}
                                    dropdownStyle={{marginTop: -15, marginLeft: -10, width: '20%', alignItems: 'center', backgroundColor: 'white', elevation: 10, shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.34, shadowRadius: 6.27}} 
                                    dropdownTextStyle={{fontSize: wp(4), fontFamily: 'sf', textAlign: 'center', color: 'black'}} 
                                    renderSeparator={() => (<Text style={{backgroundColor: '#ebebeb', height: 1}}></Text>)}
                                    onSelect={(value, index) => updateList(item, index) ? setCustom([...custom]): setCustom([...custom, {item: item.name, value: index}])}
                                >
                                    <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => dropDownRef.current[item.id].show()}>
                                        {exists(item) ?
                                            item.detail.map((item2) => {
                                                return item2.quantity === exists(item) ?
                                                <Text key={item2.id} style={{fontFamily: 'sf-semi', fontSize: wp(3.5), color: '#249c86', fontWeight: 'bold'}}>{item2.quantity}</Text>: null 
                                            })
                                            : <Text style={{fontFamily: 'sf-semi', fontSize: wp(3.5), color: '#249c86', fontWeight: 'bold'}}>{item.detail[0].quantity}</Text>
                                        }
                                        <Text style={{fontFamily: 'sf', color: '#249c86', fontSize: wp(3.5)}}> ▼</Text>
                                    </TouchableOpacity>
                                </ModalDropdown>
                                <View style={{flex: 1}}>
                                    <Image source={{uri: item.image}} style={{width: 100, height: 80, borderRadius: 5}}  />
                                </View>
                                <View style={{flex: 1}}>
                                    <Text style={{textAlign: 'center', fontFamily: 'sofia-bold', fontSize: wp(4.5), marginBottom: 5}}>{item.name}</Text>
                                    {exists(item) ? 
                                        item.detail.map((item2) => {
                                            return item2.quantity === exists(item) ?
                                            item2.previous_price > 0 ? 
                                            <View key={item2.id} style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                                <Text style={{textAlign: 'center', fontFamily: 'sf', textDecorationLine: 'line-through', marginRight: wp(2)}}>&#8377; {item2.previous_price}</Text>
                                                <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}>&#8377; {item2.price}</Text>
                                            </View>:
                                            <Text key={item2.id} style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}>&#8377; {item2.price}</Text> : null
                                            
                                        }):  
                                        
                                        item.detail[0].previous_price > 0 ?
                                        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                            <Text style={{textAlign: 'center', fontFamily: 'sf', textDecorationLine: 'line-through', marginRight: wp(2)}}>&#8377; {item.detail[0].previous_price}</Text>
                                            <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}>&#8377; {item.detail[0].price}</Text>
                                        </View>
                                        : <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}>&#8377; {item.detail[0].price}</Text>
                                    }
                                    
                                        {hideButton === 'none' ? item.availability === 'In stock' ? 
                                            search(item) ? cartData.map((item1) => {
                                                return item1.ordereditem  === item.name ? 
                                                    
                                                <View key={item1.id} style={{flexDirection: 'row', justifyContent: 'center', alignSelf: 'center', marginTop: 10, alignItems: 'center', backgroundColor: '#99b898', borderRadius: 5, width: '60%', elevation: 5, shadowOffset: {width: 1, height: 1}, shadowRadius: 2, shadowOpacity: 0.5, height: 30, padding: wp(1), flex: 0.1}}>
                                                        
                                                        <TouchableOpacity onPress={buildCart(item)} style={{justifyContent: 'center'}}>
                                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(6)}}>+ </Text>
                                                        </TouchableOpacity>
                                                        <View style={{justifyContent: 'center'}}>
                                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(4.5)}}> {item1.item_count} </Text> 
                                                        </View>
                                                        <TouchableOpacity onPress={reduceItem(item)} style={{justifyContent: 'center'}}>
                                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(6)}}> -</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                    : null
                                                }): 
                                                <TouchableOpacity onPress={buildCart(item)} style={{flex: 0.1, alignSelf: 'center', justifyContent: 'center',  marginTop: 10, backgroundColor: '#99b898', width: '60%', height: 30, borderRadius: 5, shadowOffset: {width: 1, height: 1}, shadowRadius: 2, shadowOpacity: 0.5, elevation: 5}} activeOpacity={1}>
                                                    <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(4)}}>Add &#43;</Text>
                                                </TouchableOpacity>
                                        :  <Text style={{color: 'red', textAlign: 'center'}}>Out of stock!</Text>: <ActivityIndicator size={30} color="#99b898" style={{display: hideButton, alignSelf: 'center', marginTop: 10}} />}
                                    
                                </View>
                            </View>
                            <View key={item.id} style={{marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 1, height: 1}, shadowRadius: 1.5, shadowOpacity: 0.3, elevation: 2, margin: wp(1), paddingTop: wp(1), paddingBottom: wp(6), borderRadius: 10}}>
                                
                                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
                                    <Text style={{flex: 1, marginLeft: 15, fontFamily: 'sofia-black', fontSize: wp(5.5)}}>Details</Text>
                                    {item.avg_ratings > 0 ? 
                                        <View style={{flex: 1}}>
                                            <View style={{flexDirection:'row', justifyContent: 'center', alignItems: 'center'}}>
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 0 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 1 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 2 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 3 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 4 ? {color: '#249C86'}: {color: 'grey'}} />
                                                
                                                <Text style={{textAlign: 'center', fontFamily: 'sf'}}> (<FontAwesome name="user" size={wp(3)} color="black" /> {item.no_of_ratings}) </Text>
                                            </View>
                                        </View>
                                    : null}
                                </View>
                                <Text style={{marginLeft: 15, fontFamily: 'sf', fontSize: wp(3.5), flex: 1}}>{item.description}</Text>
                                <View style={{flex: 1, marginTop: 5}}>
                                    <Text style={{fontFamily: 'sofia-bold', fontSize: wp(4.5), marginLeft: 15}}>Nutrition per 100 g</Text>
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
                                        {item.nutritional_values.slice(0, 3).map((x, index) => {
                                            return  <View key={x.id} style={{flex: 1, borderRightWidth: index === 2 ? 0: 1, borderColor: '#b5b5b5'}}>
                                                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                                            {x.name === 'Protein' ? <MaterialCommunityIcons name="arm-flex" size={wp(4)} color="#c58c85" />: 
                                                            x.name === 'Carbs' ? <MaterialCommunityIcons name="barley" size={wp(4)} color="green" />:
                                                            x.name === 'Sugar' ? <FontAwesome name="cubes" size={wp(4)} color="grey" />:
                                                            x.name === 'Fat (Sat.)' || x.name === 'Fat (Unsat.)' || x.name === 'Fat (trans)' ? <Entypo name="drop" size={wp(4)} color="#8B8000" />: 
                                                            x.name === 'Calories' ? <MaterialIcons name="local-fire-department" size={wp(4)} color="#249C86" /> : null}
                                                            <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}> {x.name}</Text>
                                                        </View>
                                                        <Text style={{textAlign: 'center', fontFamily: 'sf', fontSize: wp(3.5), color: 'grey', marginTop: 3}}>{x.value}</Text>
                                                    </View>
                                        })}
                                    </View>
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
                                        {item.nutritional_values.slice(3, 5).map((x, index) => {
                                            return  <View key={x.id} style={{flex: 1, borderRightWidth: index === 1 ? 0: 1, borderColor: '#b5b5b5'}}>
                                                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                                            {x.name === 'Protein' ? <MaterialCommunityIcons name="arm-flex" size={wp(4)} color="brown" />: 
                                                            x.name === 'Carbs' ? <MaterialCommunityIcons name="barley" size={wp(4)} color="green" />:
                                                            x.name === 'Sugar' ? <FontAwesome name="cubes" size={wp(4)} color="grey" />:
                                                            x.name === 'Fat (Sat.)' || x.name === 'Fat (Unsat.)' || x.name === 'Fat (trans)' ? <Entypo name="drop" size={wp(4)} color="#8B8000" />: 
                                                            x.name === 'Calories' ? <MaterialIcons name="local-fire-department" size={wp(4)} color="#249C86" /> : null}
                                                            <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}> {x.name}</Text>
                                                        </View>
                                                        <Text style={{textAlign: 'center', fontFamily: 'sf', fontSize: wp(3.5), color: 'grey'}}>{x.value}</Text>
                                                    </View>
                                        })}
                                    </View>
                                </View>
                            </View>
                        </FlipCard>: null
                }}
            />

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
            <FlatList 
                data={storeList}
                contentContainerStyle={{paddingBottom: 100, marginTop: hp(10)}}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                ListEmptyComponent={() => (!storeList.length ? <Text style={{fontFamily: 'sf-semi', textAlign: 'center', fontSize: wp(4), color: 'grey'}}>Nothing found! Try something different.</Text>: null)}
                renderItem={({ item }) => {
                    return item.category === 'Custom1' ?
                        <FlipCard friction={50} flip={false} flipHorizontal={true} flipVertical={false} useNativeDriver={true} style={{width: '85%', alignSelf: 'center'}}>
                            <View key={item.id} style={{flexDirection: 'row', marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 1, height: 1}, shadowRadius: 1.5, shadowOpacity: 0.3, elevation: 2, paddingTop: wp(6), paddingBottom: wp(8), paddingLeft: wp(5), borderRadius: 10}}>
                                <ModalDropdown 
                                    ref={el => dropDownRef.current[item.id] = el}
                                    defaultValue={item.detail[0].quantity}
                                    options={item.detail.map(item1 => item1.quantity)} 
                                    style={{alignSelf: 'center', marginTop: 5, position: 'absolute', bottom: 2, left: 20, padding: 5}}
                                    dropdownStyle={{marginTop: -15, marginLeft: -10, width: '20%', alignItems: 'center', backgroundColor: 'white', elevation: 10, shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.34, shadowRadius: 6.27}} 
                                    dropdownTextStyle={{fontSize: wp(4), fontFamily: 'sf', textAlign: 'center', color: 'black'}} 
                                    renderSeparator={() => (<Text style={{backgroundColor: '#ebebeb', height: 1}}></Text>)}
                                    onSelect={(value, index) => updateList(item, index) ? setCustom([...custom]): setCustom([...custom, {item: item.name, value: index}])}
                                >
                                    <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => dropDownRef.current[item.id].show()}>
                                        {exists(item) ?
                                            item.detail.map((item2) => {
                                                return item2.quantity === exists(item) ?
                                                <Text key={item2.id} style={{fontFamily: 'sf-semi', fontSize: wp(3.5), color: '#249c86', fontWeight: 'bold'}}>{item2.quantity}</Text>: null 
                                            })
                                            : <Text style={{fontFamily: 'sf-semi', fontSize: wp(3.5), color: '#249c86', fontWeight: 'bold'}}>{item.detail[0].quantity}</Text>
                                        }
                                        <Text style={{fontFamily: 'sf', color: '#249c86', fontSize: wp(3.5)}}> ▼</Text>
                                    </TouchableOpacity>
                                </ModalDropdown>
                                <View style={{flex: 1}}>
                                    <Image source={{uri: item.image}} style={{width: 100, height: 80, borderRadius: 5}}  />
                                </View>
                                <View style={{flex: 1}}>
                                    <Text style={{textAlign: 'center', fontFamily: 'sofia-bold', fontSize: wp(4.5), marginBottom: 5}}>{item.name}</Text>
                                    {exists(item) ? 
                                        item.detail.map((item2) => {
                                            return item2.quantity === exists(item) ?
                                            item2.previous_price > 0 ? 
                                            <View key={item2.id} style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                                <Text style={{textAlign: 'center', fontFamily: 'sf', textDecorationLine: 'line-through', marginRight: wp(2)}}>&#8377; {item2.previous_price}</Text>
                                                <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}>&#8377; {item2.price}</Text>
                                            </View>:
                                            <Text key={item2.id} style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}>&#8377; {item2.price}</Text> : null
                                            
                                        }):  
                                        
                                        item.detail[0].previous_price > 0 ?
                                        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                            <Text style={{textAlign: 'center', fontFamily: 'sf', textDecorationLine: 'line-through', marginRight: wp(2)}}>&#8377; {item.detail[0].previous_price}</Text>
                                            <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}>&#8377; {item.detail[0].price}</Text>
                                        </View>
                                        : <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}>&#8377; {item.detail[0].price}</Text>
                                    }
                                    
                                        {hideButton === 'none' ? item.availability === 'In stock' ? 
                                            search(item) ? cartData.map((item1) => {
                                                return item1.ordereditem  === item.name ? 
                                                    
                                                <View key={item1.id} style={{flexDirection: 'row', justifyContent: 'center', alignSelf: 'center', marginTop: 10, alignItems: 'center', backgroundColor: '#99b898', borderRadius: 5, width: '60%', elevation: 5, shadowOffset: {width: 1, height: 1}, shadowRadius: 2, shadowOpacity: 0.5, height: 30, padding: wp(1), flex: 0.1}}>
                                                        
                                                        <TouchableOpacity onPress={buildCart(item)} style={{justifyContent: 'center'}}>
                                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(6)}}>+ </Text>
                                                        </TouchableOpacity>
                                                        <View style={{justifyContent: 'center'}}>
                                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(4.5)}}> {item1.item_count} </Text> 
                                                        </View>
                                                        <TouchableOpacity onPress={reduceItem(item)} style={{justifyContent: 'center'}}>
                                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(6)}}> -</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                    : null
                                                }): 
                                                <TouchableOpacity onPress={buildCart(item)} style={{flex: 0.1, alignSelf: 'center', justifyContent: 'center',  marginTop: 10, backgroundColor: '#99b898', width: '60%', height: 30, borderRadius: 5, shadowOffset: {width: 1, height: 1}, shadowRadius: 2, shadowOpacity: 0.5, elevation: 5}} activeOpacity={1}>
                                                    <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(4)}}>Add &#43;</Text>
                                                </TouchableOpacity>
                                        :  <Text style={{color: 'red', textAlign: 'center'}}>Out of stock!</Text>: <ActivityIndicator size={30} color="#99b898" style={{display: hideButton, alignSelf: 'center', marginTop: 10}} />}
                                    
                                </View>
                            </View>
                            <View key={item.id} style={{marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 1, height: 1}, shadowRadius: 1.5, shadowOpacity: 0.3, elevation: 2, margin: wp(1), paddingTop: wp(1), paddingBottom: wp(6), borderRadius: 10}}>
                                
                                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
                                    <Text style={{flex: 1, marginLeft: 15, fontFamily: 'sofia-black', fontSize: wp(5.5)}}>Details</Text>
                                    {item.avg_ratings > 0 ? 
                                        <View style={{flex: 1}}>
                                            <View style={{flexDirection:'row', justifyContent: 'center', alignItems: 'center'}}>
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 0 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 1 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 2 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 3 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 4 ? {color: '#249C86'}: {color: 'grey'}} />
                                                
                                                <Text style={{textAlign: 'center', fontFamily: 'sf'}}> (<FontAwesome name="user" size={wp(3)} color="black" /> {item.no_of_ratings}) </Text>
                                            </View>
                                        </View>
                                    : null}
                                </View>
                                <Text style={{marginLeft: 15, fontFamily: 'sf', fontSize: wp(3.5), flex: 1}}>{item.description}</Text>
                                <View style={{flex: 1, marginTop: 5}}>
                                    <Text style={{fontFamily: 'sofia-bold', fontSize: wp(4.5), marginLeft: 15}}>Nutrition per 100 g</Text>
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
                                        {item.nutritional_values.slice(0, 3).map((x, index) => {
                                            return  <View key={x.id} style={{flex: 1, borderRightWidth: index === 2 ? 0: 1, borderColor: '#b5b5b5'}}>
                                                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                                            {x.name === 'Protein' ? <MaterialCommunityIcons name="arm-flex" size={wp(4)} color="#c58c85" />: 
                                                            x.name === 'Carbs' ? <MaterialCommunityIcons name="barley" size={wp(4)} color="green" />:
                                                            x.name === 'Sugar' ? <FontAwesome name="cubes" size={wp(4)} color="grey" />:
                                                            x.name === 'Fat (Sat.)' || x.name === 'Fat (Unsat.)' || x.name === 'Fat (trans)' ? <Entypo name="drop" size={wp(4)} color="#8B8000" />: 
                                                            x.name === 'Calories' ? <MaterialIcons name="local-fire-department" size={wp(4)} color="#249C86" /> : null}
                                                            <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}> {x.name}</Text>
                                                        </View>
                                                        <Text style={{textAlign: 'center', fontFamily: 'sf', fontSize: wp(3.5), color: 'grey', marginTop: 3}}>{x.value}</Text>
                                                    </View>
                                        })}
                                    </View>
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
                                        {item.nutritional_values.slice(3, 5).map((x, index) => {
                                            return  <View key={x.id} style={{flex: 1, borderRightWidth: index === 1 ? 0: 1, borderColor: '#b5b5b5'}}>
                                                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                                            {x.name === 'Protein' ? <MaterialCommunityIcons name="arm-flex" size={wp(4)} color="brown" />: 
                                                            x.name === 'Carbs' ? <MaterialCommunityIcons name="barley" size={wp(4)} color="green" />:
                                                            x.name === 'Sugar' ? <FontAwesome name="cubes" size={wp(4)} color="grey" />:
                                                            x.name === 'Fat (Sat.)' || x.name === 'Fat (Unsat.)' || x.name === 'Fat (trans)' ? <Entypo name="drop" size={wp(4)} color="#8B8000" />: 
                                                            x.name === 'Calories' ? <MaterialIcons name="local-fire-department" size={wp(4)} color="#249C86" /> : null}
                                                            <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}> {x.name}</Text>
                                                        </View>
                                                        <Text style={{textAlign: 'center', fontFamily: 'sf', fontSize: wp(3.5), color: 'grey'}}>{x.value}</Text>
                                                    </View>
                                        })}
                                    </View>
                                </View>
                            </View>
                        </FlipCard>: null
                }}
            />

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
            <FlatList 
                data={storeList}
                contentContainerStyle={{paddingBottom: 100, marginTop: hp(10)}}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                ListEmptyComponent={() => (!storeList.length ? <Text style={{fontFamily: 'sf-semi', textAlign: 'center', fontSize: wp(4), color: 'grey'}}>Nothing found! Try something different.</Text>: null)}
                renderItem={({ item }) => {
                    return item.category === 'Custom2' ?
                        <FlipCard friction={50} flip={false} flipHorizontal={true} flipVertical={false} useNativeDriver={true} style={{width: '85%', alignSelf: 'center'}}>
                            <View key={item.id} style={{flexDirection: 'row', marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 1, height: 1}, shadowRadius: 1.5, shadowOpacity: 0.3, elevation: 2, paddingTop: wp(6), paddingBottom: wp(8), paddingLeft: wp(5), borderRadius: 10}}>
                                <ModalDropdown 
                                    ref={el => dropDownRef.current[item.id] = el}
                                    defaultValue={item.detail[0].quantity}
                                    options={item.detail.map(item1 => item1.quantity)} 
                                    style={{alignSelf: 'center', marginTop: 5, position: 'absolute', bottom: 2, left: 20, padding: 5}}
                                    dropdownStyle={{marginTop: -15, marginLeft: -10, width: '20%', alignItems: 'center', backgroundColor: 'white', elevation: 10, shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.34, shadowRadius: 6.27}} 
                                    dropdownTextStyle={{fontSize: wp(4), fontFamily: 'sf', textAlign: 'center', color: 'black'}} 
                                    renderSeparator={() => (<Text style={{backgroundColor: '#ebebeb', height: 1}}></Text>)}
                                    onSelect={(value, index) => updateList(item, index) ? setCustom([...custom]): setCustom([...custom, {item: item.name, value: index}])}
                                >
                                    <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => dropDownRef.current[item.id].show()}>
                                        {exists(item) ?
                                            item.detail.map((item2) => {
                                                return item2.quantity === exists(item) ?
                                                <Text key={item2.id} style={{fontFamily: 'sf-semi', fontSize: wp(3.5), color: '#249c86', fontWeight: 'bold'}}>{item2.quantity}</Text>: null 
                                            })
                                            : <Text style={{fontFamily: 'sf-semi', fontSize: wp(3.5), color: '#249c86', fontWeight: 'bold'}}>{item.detail[0].quantity}</Text>
                                        }
                                        <Text style={{fontFamily: 'sf', color: '#249c86', fontSize: wp(3.5)}}> ▼</Text>
                                    </TouchableOpacity>
                                </ModalDropdown>
                                <View style={{flex: 1}}>
                                    <Image source={{uri: item.image}} style={{width: 100, height: 80, borderRadius: 5}}  />
                                </View>
                                <View style={{flex: 1}}>
                                    <Text style={{textAlign: 'center', fontFamily: 'sofia-bold', fontSize: wp(4.5), marginBottom: 5}}>{item.name}</Text>
                                    {exists(item) ? 
                                        item.detail.map((item2) => {
                                            return item2.quantity === exists(item) ?
                                            item2.previous_price > 0 ? 
                                            <View key={item2.id} style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                                <Text style={{textAlign: 'center', fontFamily: 'sf', textDecorationLine: 'line-through', marginRight: wp(2)}}>&#8377; {item2.previous_price}</Text>
                                                <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}>&#8377; {item2.price}</Text>
                                            </View>:
                                            <Text key={item2.id} style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}>&#8377; {item2.price}</Text> : null
                                            
                                        }):  
                                        
                                        item.detail[0].previous_price > 0 ?
                                        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                            <Text style={{textAlign: 'center', fontFamily: 'sf', textDecorationLine: 'line-through', marginRight: wp(2)}}>&#8377; {item.detail[0].previous_price}</Text>
                                            <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}>&#8377; {item.detail[0].price}</Text>
                                        </View>
                                        : <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}>&#8377; {item.detail[0].price}</Text>
                                    }
                                    
                                        {hideButton === 'none' ? item.availability === 'In stock' ? 
                                            search(item) ? cartData.map((item1) => {
                                                return item1.ordereditem  === item.name ? 
                                                    
                                                <View key={item1.id} style={{flexDirection: 'row', justifyContent: 'center', alignSelf: 'center', marginTop: 10, alignItems: 'center', backgroundColor: '#99b898', borderRadius: 5, width: '60%', elevation: 5, shadowOffset: {width: 1, height: 1}, shadowRadius: 2, shadowOpacity: 0.5, height: 30, padding: wp(1), flex: 0.1}}>
                                                        
                                                        <TouchableOpacity onPress={buildCart(item)} style={{justifyContent: 'center'}}>
                                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(6)}}>+ </Text>
                                                        </TouchableOpacity>
                                                        <View style={{justifyContent: 'center'}}>
                                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(4.5)}}> {item1.item_count} </Text> 
                                                        </View>
                                                        <TouchableOpacity onPress={reduceItem(item)} style={{justifyContent: 'center'}}>
                                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(6)}}> -</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                    : null
                                                }): 
                                                <TouchableOpacity onPress={buildCart(item)} style={{flex: 0.1, alignSelf: 'center', justifyContent: 'center',  marginTop: 10, backgroundColor: '#99b898', width: '60%', height: 30, borderRadius: 5, shadowOffset: {width: 1, height: 1}, shadowRadius: 2, shadowOpacity: 0.5, elevation: 5}} activeOpacity={1}>
                                                    <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(4)}}>Add &#43;</Text>
                                                </TouchableOpacity>
                                        :  <Text style={{color: 'red', textAlign: 'center'}}>Out of stock!</Text>: <ActivityIndicator size={30} color="#99b898" style={{display: hideButton, alignSelf: 'center', marginTop: 10}} />}
                                    
                                </View>
                            </View>
                            <View key={item.id} style={{marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 1, height: 1}, shadowRadius: 1.5, shadowOpacity: 0.3, elevation: 2, margin: wp(1), paddingTop: wp(1), paddingBottom: wp(6), borderRadius: 10}}>
                                
                                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
                                    <Text style={{flex: 1, marginLeft: 15, fontFamily: 'sofia-black', fontSize: wp(5.5)}}>Details</Text>
                                    {item.avg_ratings > 0 ? 
                                        <View style={{flex: 1}}>
                                            <View style={{flexDirection:'row', justifyContent: 'center', alignItems: 'center'}}>
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 0 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 1 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 2 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 3 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 4 ? {color: '#249C86'}: {color: 'grey'}} />
                                                
                                                <Text style={{textAlign: 'center', fontFamily: 'sf'}}> (<FontAwesome name="user" size={wp(3)} color="black" /> {item.no_of_ratings}) </Text>
                                            </View>
                                        </View>
                                    : null}
                                </View>
                                <Text style={{marginLeft: 15, fontFamily: 'sf', fontSize: wp(3.5), flex: 1}}>{item.description}</Text>
                                <View style={{flex: 1, marginTop: 5}}>
                                    <Text style={{fontFamily: 'sofia-bold', fontSize: wp(4.5), marginLeft: 15}}>Nutrition per 100 g</Text>
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
                                        {item.nutritional_values.slice(0, 3).map((x, index) => {
                                            return  <View key={x.id} style={{flex: 1, borderRightWidth: index === 2 ? 0: 1, borderColor: '#b5b5b5'}}>
                                                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                                            {x.name === 'Protein' ? <MaterialCommunityIcons name="arm-flex" size={wp(4)} color="#c58c85" />: 
                                                            x.name === 'Carbs' ? <MaterialCommunityIcons name="barley" size={wp(4)} color="green" />:
                                                            x.name === 'Sugar' ? <FontAwesome name="cubes" size={wp(4)} color="grey" />:
                                                            x.name === 'Fat (Sat.)' || x.name === 'Fat (Unsat.)' || x.name === 'Fat (trans)' ? <Entypo name="drop" size={wp(4)} color="#8B8000" />: 
                                                            x.name === 'Calories' ? <MaterialIcons name="local-fire-department" size={wp(4)} color="#249C86" /> : null}
                                                            <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}> {x.name}</Text>
                                                        </View>
                                                        <Text style={{textAlign: 'center', fontFamily: 'sf', fontSize: wp(3.5), color: 'grey', marginTop: 3}}>{x.value}</Text>
                                                    </View>
                                        })}
                                    </View>
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
                                        {item.nutritional_values.slice(3, 5).map((x, index) => {
                                            return  <View key={x.id} style={{flex: 1, borderRightWidth: index === 1 ? 0: 1, borderColor: '#b5b5b5'}}>
                                                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                                            {x.name === 'Protein' ? <MaterialCommunityIcons name="arm-flex" size={wp(4)} color="brown" />: 
                                                            x.name === 'Carbs' ? <MaterialCommunityIcons name="barley" size={wp(4)} color="green" />:
                                                            x.name === 'Sugar' ? <FontAwesome name="cubes" size={wp(4)} color="grey" />:
                                                            x.name === 'Fat (Sat.)' || x.name === 'Fat (Unsat.)' || x.name === 'Fat (trans)' ? <Entypo name="drop" size={wp(4)} color="#8B8000" />: 
                                                            x.name === 'Calories' ? <MaterialIcons name="local-fire-department" size={wp(4)} color="#249C86" /> : null}
                                                            <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}> {x.name}</Text>
                                                        </View>
                                                        <Text style={{textAlign: 'center', fontFamily: 'sf', fontSize: wp(3.5), color: 'grey'}}>{x.value}</Text>
                                                    </View>
                                        })}
                                    </View>
                                </View>
                            </View>
                        </FlipCard>: null
                }}
            />

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
            <FlatList 
                data={storeList}
                contentContainerStyle={{paddingBottom: 100, marginTop: hp(10)}}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                ListEmptyComponent={() => (!storeList.length ? <Text style={{fontFamily: 'sf-semi', textAlign: 'center', fontSize: wp(4), color: 'grey'}}>Nothing found! Try something different.</Text>: null)}
                renderItem={({ item }) => {
                    return item.category === 'Custom3' ?
                        <FlipCard friction={50} flip={false} flipHorizontal={true} flipVertical={false} useNativeDriver={true} style={{width: '85%', alignSelf: 'center'}}>
                            <View key={item.id} style={{flexDirection: 'row', marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 1, height: 1}, shadowRadius: 1.5, shadowOpacity: 0.3, elevation: 2, paddingTop: wp(6), paddingBottom: wp(8), paddingLeft: wp(5), borderRadius: 10}}>
                                <ModalDropdown 
                                    ref={el => dropDownRef.current[item.id] = el}
                                    defaultValue={item.detail[0].quantity}
                                    options={item.detail.map(item1 => item1.quantity)} 
                                    style={{alignSelf: 'center', marginTop: 5, position: 'absolute', bottom: 2, left: 20, padding: 5}}
                                    dropdownStyle={{marginTop: -15, marginLeft: -10, width: '20%', alignItems: 'center', backgroundColor: 'white', elevation: 10, shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.34, shadowRadius: 6.27}} 
                                    dropdownTextStyle={{fontSize: wp(4), fontFamily: 'sf', textAlign: 'center', color: 'black'}} 
                                    renderSeparator={() => (<Text style={{backgroundColor: '#ebebeb', height: 1}}></Text>)}
                                    onSelect={(value, index) => updateList(item, index) ? setCustom([...custom]): setCustom([...custom, {item: item.name, value: index}])}
                                >
                                    <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => dropDownRef.current[item.id].show()}>
                                        {exists(item) ?
                                            item.detail.map((item2) => {
                                                return item2.quantity === exists(item) ?
                                                <Text key={item2.id} style={{fontFamily: 'sf-semi', fontSize: wp(3.5), color: '#249c86', fontWeight: 'bold'}}>{item2.quantity}</Text>: null 
                                            })
                                            : <Text style={{fontFamily: 'sf-semi', fontSize: wp(3.5), color: '#249c86', fontWeight: 'bold'}}>{item.detail[0].quantity}</Text>
                                        }
                                        <Text style={{fontFamily: 'sf', color: '#249c86', fontSize: wp(3.5)}}> ▼</Text>
                                    </TouchableOpacity>
                                </ModalDropdown>
                                <View style={{flex: 1}}>
                                    <Image source={{uri: item.image}} style={{width: 100, height: 80, borderRadius: 5}}  />
                                </View>
                                <View style={{flex: 1}}>
                                    <Text style={{textAlign: 'center', fontFamily: 'sofia-bold', fontSize: wp(4.5), marginBottom: 5}}>{item.name}</Text>
                                    {exists(item) ? 
                                        item.detail.map((item2) => {
                                            return item2.quantity === exists(item) ?
                                            item2.previous_price > 0 ? 
                                            <View key={item2.id} style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                                <Text style={{textAlign: 'center', fontFamily: 'sf', textDecorationLine: 'line-through', marginRight: wp(2)}}>&#8377; {item2.previous_price}</Text>
                                                <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}>&#8377; {item2.price}</Text>
                                            </View>:
                                            <Text key={item2.id} style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}>&#8377; {item2.price}</Text> : null
                                            
                                        }):  
                                        
                                        item.detail[0].previous_price > 0 ?
                                        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                            <Text style={{textAlign: 'center', fontFamily: 'sf', textDecorationLine: 'line-through', marginRight: wp(2)}}>&#8377; {item.detail[0].previous_price}</Text>
                                            <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}>&#8377; {item.detail[0].price}</Text>
                                        </View>
                                        : <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}>&#8377; {item.detail[0].price}</Text>
                                    }
                                    
                                        {hideButton === 'none' ? item.availability === 'In stock' ? 
                                            search(item) ? cartData.map((item1) => {
                                                return item1.ordereditem  === item.name ? 
                                                    
                                                <View key={item1.id} style={{flexDirection: 'row', justifyContent: 'center', alignSelf: 'center', marginTop: 10, alignItems: 'center', backgroundColor: '#99b898', borderRadius: 5, width: '60%', elevation: 5, shadowOffset: {width: 1, height: 1}, shadowRadius: 2, shadowOpacity: 0.5, height: 30, padding: wp(1), flex: 0.1}}>
                                                        
                                                        <TouchableOpacity onPress={buildCart(item)} style={{justifyContent: 'center'}}>
                                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(6)}}>+ </Text>
                                                        </TouchableOpacity>
                                                        <View style={{justifyContent: 'center'}}>
                                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(4.5)}}> {item1.item_count} </Text> 
                                                        </View>
                                                        <TouchableOpacity onPress={reduceItem(item)} style={{justifyContent: 'center'}}>
                                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(6)}}> -</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                    : null
                                                }): 
                                                <TouchableOpacity onPress={buildCart(item)} style={{flex: 0.1, alignSelf: 'center', justifyContent: 'center',  marginTop: 10, backgroundColor: '#99b898', width: '60%', height: 30, borderRadius: 5, shadowOffset: {width: 1, height: 1}, shadowRadius: 2, shadowOpacity: 0.5, elevation: 5}} activeOpacity={1}>
                                                    <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(4)}}>Add &#43;</Text>
                                                </TouchableOpacity>
                                        :  <Text style={{color: 'red', textAlign: 'center'}}>Out of stock!</Text>: <ActivityIndicator size={30} color="#99b898" style={{display: hideButton, alignSelf: 'center', marginTop: 10}} />}
                                    
                                </View>
                            </View>
                            <View key={item.id} style={{marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 1, height: 1}, shadowRadius: 1.5, shadowOpacity: 0.3, elevation: 2, margin: wp(1), paddingTop: wp(1), paddingBottom: wp(6), borderRadius: 10}}>
                                
                                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
                                    <Text style={{flex: 1, marginLeft: 15, fontFamily: 'sofia-black', fontSize: wp(5.5)}}>Details</Text>
                                    {item.avg_ratings > 0 ? 
                                        <View style={{flex: 1}}>
                                            <View style={{flexDirection:'row', justifyContent: 'center', alignItems: 'center'}}>
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 0 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 1 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 2 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 3 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 4 ? {color: '#249C86'}: {color: 'grey'}} />
                                                
                                                <Text style={{textAlign: 'center', fontFamily: 'sf'}}> (<FontAwesome name="user" size={wp(3)} color="black" /> {item.no_of_ratings}) </Text>
                                            </View>
                                        </View>
                                    : null}
                                </View>
                                <Text style={{marginLeft: 15, fontFamily: 'sf', fontSize: wp(3.5), flex: 1}}>{item.description}</Text>
                                <View style={{flex: 1, marginTop: 5}}>
                                    <Text style={{fontFamily: 'sofia-bold', fontSize: wp(4.5), marginLeft: 15}}>Nutrition per 100 g</Text>
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
                                        {item.nutritional_values.slice(0, 3).map((x, index) => {
                                            return  <View key={x.id} style={{flex: 1, borderRightWidth: index === 2 ? 0: 1, borderColor: '#b5b5b5'}}>
                                                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                                            {x.name === 'Protein' ? <MaterialCommunityIcons name="arm-flex" size={wp(4)} color="#c58c85" />: 
                                                            x.name === 'Carbs' ? <MaterialCommunityIcons name="barley" size={wp(4)} color="green" />:
                                                            x.name === 'Sugar' ? <FontAwesome name="cubes" size={wp(4)} color="grey" />:
                                                            x.name === 'Fat (Sat.)' || x.name === 'Fat (Unsat.)' || x.name === 'Fat (trans)' ? <Entypo name="drop" size={wp(4)} color="#8B8000" />: 
                                                            x.name === 'Calories' ? <MaterialIcons name="local-fire-department" size={wp(4)} color="#249C86" /> : null}
                                                            <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}> {x.name}</Text>
                                                        </View>
                                                        <Text style={{textAlign: 'center', fontFamily: 'sf', fontSize: wp(3.5), color: 'grey', marginTop: 3}}>{x.value}</Text>
                                                    </View>
                                        })}
                                    </View>
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
                                        {item.nutritional_values.slice(3, 5).map((x, index) => {
                                            return  <View key={x.id} style={{flex: 1, borderRightWidth: index === 1 ? 0: 1, borderColor: '#b5b5b5'}}>
                                                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                                            {x.name === 'Protein' ? <MaterialCommunityIcons name="arm-flex" size={wp(4)} color="brown" />: 
                                                            x.name === 'Carbs' ? <MaterialCommunityIcons name="barley" size={wp(4)} color="green" />:
                                                            x.name === 'Sugar' ? <FontAwesome name="cubes" size={wp(4)} color="grey" />:
                                                            x.name === 'Fat (Sat.)' || x.name === 'Fat (Unsat.)' || x.name === 'Fat (trans)' ? <Entypo name="drop" size={wp(4)} color="#8B8000" />: 
                                                            x.name === 'Calories' ? <MaterialIcons name="local-fire-department" size={wp(4)} color="#249C86" /> : null}
                                                            <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}> {x.name}</Text>
                                                        </View>
                                                        <Text style={{textAlign: 'center', fontFamily: 'sf', fontSize: wp(3.5), color: 'grey'}}>{x.value}</Text>
                                                    </View>
                                        })}
                                    </View>
                                </View>
                            </View>
                        </FlipCard>: null
                }}
            />

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
            <FlatList 
                data={storeList}
                contentContainerStyle={{paddingBottom: 100, marginTop: hp(10)}}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                ListEmptyComponent={() => (!storeList.length ? <Text style={{fontFamily: 'sf-semi', textAlign: 'center', fontSize: wp(4), color: 'grey'}}>Nothing found! Try something different.</Text>: null)}
                renderItem={({ item }) => {
                    return item.category === 'Custom4' ?
                        <FlipCard friction={50} flip={false} flipHorizontal={true} flipVertical={false} useNativeDriver={true} style={{width: '85%', alignSelf: 'center'}}>
                            <View key={item.id} style={{flexDirection: 'row', marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 1, height: 1}, shadowRadius: 1.5, shadowOpacity: 0.3, elevation: 2, paddingTop: wp(6), paddingBottom: wp(8), paddingLeft: wp(5), borderRadius: 10}}>
                                <ModalDropdown 
                                    ref={el => dropDownRef.current[item.id] = el}
                                    defaultValue={item.detail[0].quantity}
                                    options={item.detail.map(item1 => item1.quantity)} 
                                    style={{alignSelf: 'center', marginTop: 5, position: 'absolute', bottom: 2, left: 20, padding: 5}}
                                    dropdownStyle={{marginTop: -15, marginLeft: -10, width: '20%', alignItems: 'center', backgroundColor: 'white', elevation: 10, shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.34, shadowRadius: 6.27}} 
                                    dropdownTextStyle={{fontSize: wp(4), fontFamily: 'sf', textAlign: 'center', color: 'black'}} 
                                    renderSeparator={() => (<Text style={{backgroundColor: '#ebebeb', height: 1}}></Text>)}
                                    onSelect={(value, index) => updateList(item, index) ? setCustom([...custom]): setCustom([...custom, {item: item.name, value: index}])}
                                >
                                    <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => dropDownRef.current[item.id].show()}>
                                        {exists(item) ?
                                            item.detail.map((item2) => {
                                                return item2.quantity === exists(item) ?
                                                <Text key={item2.id} style={{fontFamily: 'sf-semi', fontSize: wp(3.5), color: '#249c86', fontWeight: 'bold'}}>{item2.quantity}</Text>: null 
                                            })
                                            : <Text style={{fontFamily: 'sf-semi', fontSize: wp(3.5), color: '#249c86', fontWeight: 'bold'}}>{item.detail[0].quantity}</Text>
                                        }
                                        <Text style={{fontFamily: 'sf', color: '#249c86', fontSize: wp(3.5)}}> ▼</Text>
                                    </TouchableOpacity>
                                </ModalDropdown>
                                <View style={{flex: 1}}>
                                    <Image source={{uri: item.image}} style={{width: 100, height: 80, borderRadius: 5}}  />
                                </View>
                                <View style={{flex: 1}}>
                                    <Text style={{textAlign: 'center', fontFamily: 'sofia-bold', fontSize: wp(4.5), marginBottom: 5}}>{item.name}</Text>
                                    {exists(item) ? 
                                        item.detail.map((item2) => {
                                            return item2.quantity === exists(item) ?
                                            item2.previous_price > 0 ? 
                                            <View key={item2.id} style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                                <Text style={{textAlign: 'center', fontFamily: 'sf', textDecorationLine: 'line-through', marginRight: wp(2)}}>&#8377; {item2.previous_price}</Text>
                                                <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}>&#8377; {item2.price}</Text>
                                            </View>:
                                            <Text key={item2.id} style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}>&#8377; {item2.price}</Text> : null
                                            
                                        }):  
                                        
                                        item.detail[0].previous_price > 0 ?
                                        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                            <Text style={{textAlign: 'center', fontFamily: 'sf', textDecorationLine: 'line-through', marginRight: wp(2)}}>&#8377; {item.detail[0].previous_price}</Text>
                                            <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}>&#8377; {item.detail[0].price}</Text>
                                        </View>
                                        : <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}>&#8377; {item.detail[0].price}</Text>
                                    }
                                    
                                        {hideButton === 'none' ? item.availability === 'In stock' ? 
                                            search(item) ? cartData.map((item1) => {
                                                return item1.ordereditem  === item.name ? 
                                                    
                                                <View key={item1.id} style={{flexDirection: 'row', justifyContent: 'center', alignSelf: 'center', marginTop: 10, alignItems: 'center', backgroundColor: '#99b898', borderRadius: 5, width: '60%', elevation: 5, shadowOffset: {width: 1, height: 1}, shadowRadius: 2, shadowOpacity: 0.5, height: 30, padding: wp(1), flex: 0.1}}>
                                                        
                                                        <TouchableOpacity onPress={buildCart(item)} style={{justifyContent: 'center'}}>
                                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(6)}}>+ </Text>
                                                        </TouchableOpacity>
                                                        <View style={{justifyContent: 'center'}}>
                                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(4.5)}}> {item1.item_count} </Text> 
                                                        </View>
                                                        <TouchableOpacity onPress={reduceItem(item)} style={{justifyContent: 'center'}}>
                                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(6)}}> -</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                    : null
                                                }): 
                                                <TouchableOpacity onPress={buildCart(item)} style={{flex: 0.1, alignSelf: 'center', justifyContent: 'center',  marginTop: 10, backgroundColor: '#99b898', width: '60%', height: 30, borderRadius: 5, shadowOffset: {width: 1, height: 1}, shadowRadius: 2, shadowOpacity: 0.5, elevation: 5}} activeOpacity={1}>
                                                    <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(4)}}>Add &#43;</Text>
                                                </TouchableOpacity>
                                        :  <Text style={{color: 'red', textAlign: 'center'}}>Out of stock!</Text>: <ActivityIndicator size={30} color="#99b898" style={{display: hideButton, alignSelf: 'center', marginTop: 10}} />}
                                    
                                </View>
                            </View>
                            <View key={item.id} style={{marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 1, height: 1}, shadowRadius: 1.5, shadowOpacity: 0.3, elevation: 2, margin: wp(1), paddingTop: wp(1), paddingBottom: wp(6), borderRadius: 10}}>
                                
                                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
                                    <Text style={{flex: 1, marginLeft: 15, fontFamily: 'sofia-black', fontSize: wp(5.5)}}>Details</Text>
                                    {item.avg_ratings > 0 ? 
                                        <View style={{flex: 1}}>
                                            <View style={{flexDirection:'row', justifyContent: 'center', alignItems: 'center'}}>
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 0 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 1 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 2 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 3 ? {color: '#249C86'}: {color: 'grey'}} />
                                                <AntDesign name="star" size={15} style={item.avg_ratings > 4 ? {color: '#249C86'}: {color: 'grey'}} />
                                                
                                                <Text style={{textAlign: 'center', fontFamily: 'sf'}}> (<FontAwesome name="user" size={wp(3)} color="black" /> {item.no_of_ratings}) </Text>
                                            </View>
                                        </View>
                                    : null}
                                </View>
                                <Text style={{marginLeft: 15, fontFamily: 'sf', fontSize: wp(3.5), flex: 1}}>{item.description}</Text>
                                <View style={{flex: 1, marginTop: 5}}>
                                    <Text style={{fontFamily: 'sofia-bold', fontSize: wp(4.5), marginLeft: 15}}>Nutrition per 100 g</Text>
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
                                        {item.nutritional_values.slice(0, 3).map((x, index) => {
                                            return  <View key={x.id} style={{flex: 1, borderRightWidth: index === 2 ? 0: 1, borderColor: '#b5b5b5'}}>
                                                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                                            {x.name === 'Protein' ? <MaterialCommunityIcons name="arm-flex" size={wp(4)} color="#c58c85" />: 
                                                            x.name === 'Carbs' ? <MaterialCommunityIcons name="barley" size={wp(4)} color="green" />:
                                                            x.name === 'Sugar' ? <FontAwesome name="cubes" size={wp(4)} color="grey" />:
                                                            x.name === 'Fat (Sat.)' || x.name === 'Fat (Unsat.)' || x.name === 'Fat (trans)' ? <Entypo name="drop" size={wp(4)} color="#8B8000" />: 
                                                            x.name === 'Calories' ? <MaterialIcons name="local-fire-department" size={wp(4)} color="#249C86" /> : null}
                                                            <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}> {x.name}</Text>
                                                        </View>
                                                        <Text style={{textAlign: 'center', fontFamily: 'sf', fontSize: wp(3.5), color: 'grey', marginTop: 3}}>{x.value}</Text>
                                                    </View>
                                        })}
                                    </View>
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
                                        {item.nutritional_values.slice(3, 5).map((x, index) => {
                                            return  <View key={x.id} style={{flex: 1, borderRightWidth: index === 1 ? 0: 1, borderColor: '#b5b5b5'}}>
                                                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                                            {x.name === 'Protein' ? <MaterialCommunityIcons name="arm-flex" size={wp(4)} color="brown" />: 
                                                            x.name === 'Carbs' ? <MaterialCommunityIcons name="barley" size={wp(4)} color="green" />:
                                                            x.name === 'Sugar' ? <FontAwesome name="cubes" size={wp(4)} color="grey" />:
                                                            x.name === 'Fat (Sat.)' || x.name === 'Fat (Unsat.)' || x.name === 'Fat (trans)' ? <Entypo name="drop" size={wp(4)} color="#8B8000" />: 
                                                            x.name === 'Calories' ? <MaterialIcons name="local-fire-department" size={wp(4)} color="#249C86" /> : null}
                                                            <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}> {x.name}</Text>
                                                        </View>
                                                        <Text style={{textAlign: 'center', fontFamily: 'sf', fontSize: wp(3.5), color: 'grey'}}>{x.value}</Text>
                                                    </View>
                                        })}
                                    </View>
                                </View>
                            </View>
                        </FlipCard>: null
                }}
            />

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