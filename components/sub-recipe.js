import React, { useState, useEffect, useContext, useRef } from 'react';
import { TouchableOpacity } from 'react-native';
import { StyleSheet, Text, View, Image, Button, Animated, Dimensions, Easing, FlatList, TextInput, SafeAreaView, ScrollView } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons, FontAwesome, FontAwesome5, MaterialCommunityIcons, MaterialIcons, Feather, SimpleLineIcons, Fontisto, createIconSetFromIcoMoon } from "@expo/vector-icons";
import Svg, { Path, G, Rect, Circle, Polygon, Ellipse, Defs } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from "@react-native-community/netinfo";
import LottieView from 'lottie-react-native';
import { copilot, walkthroughable, CopilotStep } from "react-native-copilot";
import icoMoonConfig from '../selection.json';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import { UserContext, CartContext, IsLoginContext, SubDayContext, SubPlanContext } from './context';
import { showMessage } from 'react-native-flash-message';
import Modal from 'react-native-modal';
import Carousel from 'react-native-snap-carousel';
import {Calendar, CalendarList, Agenda} from 'react-native-calendars';
import moment from 'moment';
import Ripple from 'react-native-material-ripple';

const screenWidth = Dimensions.get("window").width;

export default function SubRecipe(props){


    const CustomIcon = createIconSetFromIcoMoon(icoMoonConfig, 'IcoMoon');

    const navigation = props.navigation;

    const [mounted, setMounted] = useState(true);
    const [isOffline, setIsOffline] = useState(false);
    const [showIndic, setShowInidc] = useState(false);
    
    const [recipesList, setRecipesList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState('true');
    const [category, setCategory] = useState('Breakfast');

    const [tiDisplay, setTiDisplay] = useState('none');
    const [query, setQuery] = useState('');
    const searchInputRef = useRef(null);

    const [error, setError] = useState(null);

    const [cartData, setCartData] = useState([]);
    const [cartStatus, setCartStatus] = useState(0);

    const scaleAnimation1 = new Animated.Value(1);
    const scaleAnimation2 = new Animated.Value(1);
    const scaleAnimation3 = new Animated.Value(1);
    const [scrollY] = useState(new Animated.Value(0));

    //Carousel, Modal, Calendar, date and time related

    const [choosenDay, setChoosenDay] = useContext(SubDayContext);
    var currentDate = new Date()
    currentDate.setDate(currentDate.getDate() + 1)

    const [showModal, setShowModal] = useState(false);
    const [choosenPlan, setChoosenPlan] = useContext(SubPlanContext);

    const carouselRef = useRef(null);
    const [carouselData] = useState([1, 2]);


    //Custom scroll indicator
    const [completeScrollBarWidth, setcompleteScrollBarWidth] = useState(1);
    const [visibleScrollBarWidth, setvisibleScrollBarWidth] = useState(0);
    const scrollIndicator = useRef(new Animated.Value(0)).current;



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
        fetch('http://192.168.0.156:8000/store/recipes/',{
          method: 'GET',
          headers: {
            'Content-type': 'application/json'
          }
        })
        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => {if (mounted) {setRecipesList(resp.json.qs), setFilteredList(resp.json.qs), setIngredients(resp.json.ingredients)}})
        .catch(error => setError(error))
    
        return () => {
          setMounted(false);
        }
      }, []);


      useEffect(() => {
        const getCart = navigation.addListener('focus', () => {
            (async () => {
                const token =  await SecureStore.getItemAsync('USER_TOKEN')
                if (token) {
                    return fetch('http://192.168.0.156:8000/store/recipesubscart/',{
                        method: 'GET',
                        headers: {
                        'Authorization': `Token ${token}`,
                        'Content-type': 'application/json'
                        },
                    })
                    .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                    .then(resp => {if (mounted) {setCartData(resp.json), setCartStatus(resp.status)}})
                    .then(() => setLoading('false'))
                    .catch(error => setError(error))
                } else {
                    setCartData([]);
                    setLoading('false')
                }
            })().catch(error => setError(error))
        })

      }, [navigation])
    


      //Search
      const searchFilterFunction = (text) => {
        // Check if searched text is not blank
        if (text) {
          // Inserted text is not blank
          // Filter the masterDataSource
          // Update FilteredDataSource
          const newData = recipesList.filter(
            function (item) {
              const itemData = item.name
                ? item.name.toUpperCase()
                : ''.toUpperCase();
              const textData = text.toUpperCase();
              return itemData.indexOf(textData) > -1;
          });
          setFilteredList(newData);
          setQuery(text);
        } else {
          // Inserted text is blank
          // Update FilteredDataSource with masterDataSource
          setFilteredList(recipesList);
          setQuery(text);
        }
      };


    const search = (item) => {
        if (cartStatus !== 401) {
            for (var i=0; i < cartData.length; i++) {
                if (cartData[i].recipe_name === item.name) {
                    return cartData[i];
                }
            }
        }
    }


    const addRecipe = (item) => async evt => {
        const token =  await SecureStore.getItemAsync('USER_TOKEN')
            if (token) {
                return fetch('http://192.168.0.156:8000/store/recipesubscart/',{
                    method: 'POST',
                    headers: {
                    'Authorization': `Token ${token}`,
                    'Content-type': 'application/json'
                    },
                    body: JSON.stringify({ ordereditem: item })
                })
                .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                .then(resp => {setCartData(resp.json.cart)})
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
                navigation.navigate('Register')
            }
    }



    const removeRecipe = (item) => async evt => {
        const token =  await SecureStore.getItemAsync('USER_TOKEN')
            if (token) {
                return fetch('http://192.168.0.156:8000/store/recipesubsreduceordelete/',{
                    method: 'POST',
                    headers: {
                    'Authorization': `Token ${token}`,
                    'Content-type': 'application/json'
                    },
                    body: JSON.stringify({ reduceitem: item })
                })
                .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                .then(resp => {setCartData(resp.json.cart)})
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
                navigation.navigate('Register')
            }
    }


    //animation


    const hideCategory = Animated.diffClamp(scrollY, 0, 125).interpolate({
        inputRange: [0, 250],
        outputRange: [0, -275],
        extrapolate: 'clamp'
    })


    const startScale1 = () => {
        Animated.spring(scaleAnimation1, {
            toValue: 0.8,
            friction: 5,
            useNativeDriver: true,
        }).start();
    };

    const startScale2 = () => {
        Animated.spring(scaleAnimation2, {
            toValue: 0.8,
            friction: 5,
            useNativeDriver: true,
        }).start();
    };

    const startScale3 = () => {
        Animated.spring(scaleAnimation3, {
            toValue: 0.8,
            friction: 5,
            useNativeDriver: true,
        }).start();
    };
    
    const stopScale1 = () => {
        Animated.spring(scaleAnimation1, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
        }).start();
        
    };

    const stopScale2 = () => {
        Animated.spring(scaleAnimation2, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
        }).start();
        
    };

    const stopScale3 = () => {
        Animated.spring(scaleAnimation3, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
        }).start();
        
    };


    //Custom scroll indicator
    const scrollIndicatorSize =
        completeScrollBarWidth > visibleScrollBarWidth
        ? (visibleScrollBarWidth * visibleScrollBarWidth)
            / completeScrollBarWidth
        : visibleScrollBarWidth;

    const difference =
        visibleScrollBarWidth > scrollIndicatorSize
        ? visibleScrollBarWidth - scrollIndicatorSize
        : 1;

    const scrollIndicatorPosition = Animated.multiply(
        scrollIndicator,
        visibleScrollBarWidth / completeScrollBarWidth,
    ).interpolate({
        extrapolate: 'clamp',
        inputRange: [0, difference],
        outputRange: [0, difference + wp(5)],
    });
        

    const onLayout = ({
        nativeEvent: {
        layout: { width },
        },
    }) => {
        setvisibleScrollBarWidth(width);
    };


    const retry = async () => {
        setShowInidc(true);
        const token = await SecureStore.getItemAsync('USER_TOKEN')
        try {
            if (token) {
                fetch('http://192.168.0.156:8000/store/recipes/',{
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json'
                    }
                })
                .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                .then(resp => {if (mounted) {setRecipesList(resp.json.qs), setFilteredList(resp.json.qs), setIngredients(resp.json.ingredients)}})
                .catch(error => setError(error))

                fetch('http://192.168.0.156:8000/store/recipesubscart/',{
                    method: 'GET',
                    headers: {
                    'Authorization': `Token ${token}`,
                    'Content-type': 'application/json'
                    },
                })
                .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                .then(resp => {if (mounted) {setCartData(resp.json), setCartStatus(resp.status)}})
                .then(() => setLoading('false'))
                .then(() => setShowInidc(false))
                .then(() => setIsOffline(false))
                .catch(error => setError(error))
            } else {
                if (mounted) {
                    setCartData([]);
                    setShowInidc(false);
                    setIsOffline(false);
                    setLoading('false');
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
                <Text style={{fontFamily: 'Maven-sem', fontSize: wp(6), marginTop: 50, textAlign: 'center', color: 'black'}}>Uh oh! Seems like you are disconnected !</Text>
                {!showIndic ? <TouchableOpacity style={{alignSelf: 'center', marginTop: 25}} onPress={retry} activeOpacity={1}>
                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: '#249c86'}}>RETRY</Text>
                </TouchableOpacity>: <LottieView source={require('../assets/animations/connecting.json')} autoPlay={true} loop={true} style={{height: 100, alignSelf: 'center'}} />}
                </View>
            </View>
        )
    }



    if (loading === 'true') {
      return (
        <View style={{flex: 1, backgroundColor: '#fafafa', justifyContent: 'center', alignItems: 'center'}}>
          <LottieView source={require('../assets/animations/9258-bouncing-fruits.json')} style={{width: 200}} loop={true} autoPlay={true} />
        </View>
      )
    }

    return (
        <View style={styles.container}>
          <StatusBar style="inverted" />
          
            <View style={{flex: 1, marginTop: 75}}>
              {category === 'Breakfast' ? 
                <Animated.FlatList 
                  data={filteredList}
                  keyExtractor={(item, index) => index.toString()}
                  contentContainerStyle={{padding: 25, paddingBottom: 150, paddingTop: 175}}
                  onScroll={Animated.event(
                    [{nativeEvent: {contentOffset: {y: scrollY}}}],
                    {useNativeDriver: true}
                    
                  )}
                  ListEmptyComponent={() => (!filteredList.length ? <Text style={{fontFamily: 'Maven-sem', textAlign: 'center', fontSize: wp(5), color: 'grey', marginTop: 25}}>No recipes found !</Text>: null)}
                  renderItem={({ item, index }) => (
                    item.category === 'Breakfast' ?
                      <View style={{backgroundColor: 'white', flexDirection: 'row',  marginBottom: 35, padding: 15, paddingBottom: 15, paddingTop: 25, borderRadius: 10, elevation: 5, shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000'}} >
                          <View style={{flex: 1}}>
                              <View style={{backgroundColor: 'white', borderRadius: 100, width: 100, height: 100, elevation: 15, shadowOffset: {width: 0, height: 7}, shadowRadius: 9.51, shadowOpacity: 0.43, shadowColor: '#000'}}>
                                  <Image source={{uri: item.image}} style={{width: 100, height: 100, borderRadius: 100}} />
                              </View>
                          </View>
                          <View style={{flex: 1}}>
                              <Text style={{fontFamily: 'Maven-sem', fontSize: wp(5), color: 'black', textAlign: 'center', marginBottom: 5}}>{item.name}</Text>
                              <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black', textAlign: 'center', marginBottom: 10}}>&#8377; {item.price}</Text>
                              {search(item) ? cartData.map((item1) => {
                                      return item1.ordereditem === item.name ?
                                      <View key={item1.id} style={{flexDirection: 'row', justifyContent: 'space-around',  alignSelf: 'center', marginTop: 10, backgroundColor: '#fff', borderRadius: 10, width: '60%', elevation: 1, shadowOffset: {width: 0, height: 1}, shadowRadius: 1.00, shadowOpacity: 0.18, shadowColor: '#000'}}>
                                                                      
                                          <Ripple onPress={addRecipe(item)} style={{flex: 1, padding: 7, backgroundColor: '#6aab9e', borderRadius: 10, elevation: 5, shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000'}} rippleDuration={600} rippleContainerBorderRadius={10} rippleOpacity={0.5} onLongPress={{}}>
                                              <Text style={{textAlign: 'center',fontFamily: 'Maven-med', color: '#2A363B', fontSize: wp(4)}}>+</Text>
                                          </Ripple>
                                          <View style={{justifyContent: 'center', flex: 1, padding: 7}}>
                                              <Text style={{textAlign: 'center', fontFamily: 'Maven-med', color: '#2A363B', fontSize: wp(4)}}>{item1.item_count}</Text> 
                                          </View>
                                          <Ripple onPress={removeRecipe(item)} style={{flex: 1, padding: 7, backgroundColor: '#6aab9e', borderRadius: 10, elevation: 5, shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000'}} rippleDuration={600} rippleContainerBorderRadius={10} rippleOpacity={0.5} onLongPress={{}}>
                                              <Text style={{textAlign: 'center',fontFamily: 'Maven-med', color: '#2A363B', fontSize: wp(4)}}>-</Text>
                                          </Ripple>
                                      </View>: null
                                  })
                                   :
                                  <Ripple onPress={addRecipe(item)} style={{alignSelf: 'center',  marginTop: 10, backgroundColor: '#6aab9e', width: '60%', padding: 7, borderRadius: 10, shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000', elevation: 5}} rippleDuration={600} rippleContainerBorderRadius={10} rippleOpacity={0.5} onLongPress={{}}>
                                      <Text style={{textAlign: 'center', fontFamily: 'Maven-med', color: '#2A363B', fontSize: wp(4)}}>Add &#43;</Text>
                                  </Ripple>
                              }
                              <TouchableOpacity style={{marginTop: 15}} onPress={() => navigation.navigate('RecipeDetails', {recipe_id: item.id, recipe_ingredients: ingredients})} activeOpacity={1}>
                                  <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(3.5), color: '#249c86'}}>VIEW RECIPE</Text>
                              </TouchableOpacity>
                          </View>
                      </View>
                    : null
                  )}
              />: 
              category === 'Lunch' ? 
              <Animated.FlatList 
                  data={filteredList}
                  keyExtractor={(item, index) => index.toString()}
                  contentContainerStyle={{padding: 25, paddingBottom: 150, paddingTop: 175}}
                  onScroll={Animated.event(
                    [{nativeEvent: {contentOffset: {y: scrollY}}}],
                    {useNativeDriver: true}
                    
                  )}
                  ListEmptyComponent={() => (!filteredList.length ? <Text style={{fontFamily: 'Maven-sem', textAlign: 'center', fontSize: wp(5), color: 'grey', marginTop: 25}}>No recipes found !</Text>: null)}
                  renderItem={({ item }) => (
                    item.category === 'Lunch' ?
                      <View style={{backgroundColor: 'white', flexDirection: 'row',  marginBottom: 35, padding: 15, paddingBottom: 15, paddingTop: wp(6), borderRadius: 10, elevation: 5, shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000'}} >
                          <View style={{flex: 1}}>
                              <View style={{backgroundColor: 'white', borderRadius: 100, width: 100, height: 100, elevation: 15, shadowOffset: {width: 0, height: 7}, shadowRadius: 9.51, shadowOpacity: 0.43, shadowColor: '#000'}}>
                                  <Image source={{uri: item.image}} style={{width: 100, height: 100, borderRadius: 100}} />
                              </View>
                          </View>
                          <View style={{flex: 1}}>
                              <Text style={{fontFamily: 'Maven-sem', fontSize: wp(5), color: 'black', textAlign: 'center', marginBottom: 5}}>{item.name}</Text>
                              <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black', textAlign: 'center', marginBottom: 10}}>&#8377; {item.price}</Text>
                              {search(item) ? cartData.map((item1) => {
                                      return item1.ordereditem === item.name ?
                                      <View key={item1.id} style={{flexDirection: 'row', justifyContent: 'space-around',  alignSelf: 'center', marginTop: 10, backgroundColor: '#fff', borderRadius: 10, width: '60%', elevation: 1, shadowOffset: {width: 0, height: 1}, shadowRadius: 1.00, shadowOpacity: 0.18, shadowColor: '#000'}}>
                                                                      
                                          <Ripple onPress={addRecipe(item)} style={{flex: 1, padding: 7, backgroundColor: '#6aab9e', borderRadius: 10, elevation: 5, shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000'}} rippleDuration={600} rippleContainerBorderRadius={10} rippleOpacity={0.5} onLongPress={{}}>
                                              <Text style={{textAlign: 'center',fontFamily: 'Maven-med', color: '#2A363B', fontSize: wp(4)}}>+</Text>
                                          </Ripple>
                                          <View style={{justifyContent: 'center', flex: 1, padding: 7}}>
                                              <Text style={{textAlign: 'center', fontFamily: 'Maven-med', color: '#2A363B', fontSize: wp(4)}}>{item1.item_count}</Text> 
                                          </View>
                                          <Ripple onPress={removeRecipe(item)} style={{flex: 1, padding: 7, backgroundColor: '#6aab9e', borderRadius: 10, elevation: 5, shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000'}} rippleDuration={600} rippleContainerBorderRadius={10} rippleOpacity={0.5} onLongPress={{}}>
                                              <Text style={{textAlign: 'center',fontFamily: 'Maven-med', color: '#2A363B', fontSize: wp(4)}}>-</Text>
                                          </Ripple>
                                      </View>: null
                                  })
                                   :
                                  <Ripple onPress={addRecipe(item)} style={{alignSelf: 'center',  marginTop: 10, backgroundColor: '#6aab9e', width: '60%', padding: 7, borderRadius: 10, shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000', elevation: 5}} rippleDuration={600} rippleContainerBorderRadius={10} rippleOpacity={0.5} onLongPress={{}}>
                                      <Text style={{textAlign: 'center', fontFamily: 'Maven-med', color: '#2A363B', fontSize: wp(4)}}>Add &#43;</Text>
                                  </Ripple>
                              }
                              <TouchableOpacity style={{marginTop: 15}} onPress={() => navigation.navigate('RecipeDetails', {recipe_id: item.id, recipe_ingredients: ingredients})} activeOpacity={1}>
                                  <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(3.5), color: '#249c86'}}>VIEW RECIPE</Text>
                              </TouchableOpacity>
                          </View>
                      </View>
                    : null
                  )}
              />: 
              <Animated.FlatList 
                  data={filteredList}
                  keyExtractor={(item, index) => index.toString()}
                  contentContainerStyle={{paddingLeft: 25, paddingBottom: 150, paddingTop: 175}}
                  onScroll={Animated.event(
                    [{nativeEvent: {contentOffset: {y: scrollY}}}],
                    {useNativeDriver: true}
                    
                  )}
                  ListEmptyComponent={() => (!filteredList.length ? <Text style={{fontFamily: 'Maven-sem', textAlign: 'center', fontSize: wp(5), color: 'grey', marginTop: 25}}>No recipes found !</Text>: null)}
                  renderItem={({ item }) => (
                    item.category === 'Dinner' ?
                      <View style={{backgroundColor: 'white', flexDirection: 'row',  marginBottom: 35, padding: 15, paddingBottom: 15, paddingTop: 25, borderRadius: 10, elevation: 5, shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000'}} >
                          <View style={{flex: 1}}>
                              <View style={{backgroundColor: 'white', borderRadius: 100, width: 100, height: 100, elevation: 15, shadowOffset: {width: 0, height: 7}, shadowRadius: 9.51, shadowOpacity: 0.43, shadowColor: '#000'}}>
                                  <Image source={{uri: item.image}} style={{width: 100, height: 100, borderRadius: 100}} />
                              </View>
                          </View>
                          <View style={{flex: 1}}>
                              <Text style={{fontFamily: 'Maven-sem', fontSize: wp(5), color: 'black', textAlign: 'center', marginBottom: 5}}>{item.name}</Text>
                              <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black', textAlign: 'center', marginBottom: 10}}>&#8377; {item.price}</Text>
                              {search(item) ? cartData.map((item1) => {
                                      return item1.ordereditem === item.name ?
                                      <View key={item1.id} style={{flexDirection: 'row', justifyContent: 'space-around',  alignSelf: 'center', marginTop: 10, backgroundColor: '#fff', borderRadius: 10, width: '60%', elevation: 1, shadowOffset: {width: 0, height: 1}, shadowRadius: 1.00, shadowOpacity: 0.18, shadowColor: '#000'}}>
                                                                      
                                          <Ripple onPress={addRecipe(item)} style={{flex: 1, padding: 7, backgroundColor: '#6aab9e', borderRadius: 10, elevation: 5, shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000'}} rippleDuration={600} rippleContainerBorderRadius={10} rippleOpacity={0.5} onLongPress={{}}>
                                              <Text style={{textAlign: 'center',fontFamily: 'Maven-med', color: '#2A363B', fontSize: wp(4)}}>+</Text>
                                          </Ripple>
                                          <View style={{justifyContent: 'center', flex: 1, padding: 7}}>
                                              <Text style={{textAlign: 'center', fontFamily: 'Maven-med', color: '#2A363B', fontSize: wp(4)}}>{item1.item_count}</Text> 
                                          </View>
                                          <Ripple onPress={removeRecipe(item)} style={{flex: 1, padding: 7, backgroundColor: '#6aab9e', borderRadius: 10, elevation: 5, shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000'}} rippleDuration={600} rippleContainerBorderRadius={10} rippleOpacity={0.5} onLongPress={{}}>
                                              <Text style={{textAlign: 'center',fontFamily: 'Maven-med', color: '#2A363B', fontSize: wp(4)}}>-</Text>
                                          </Ripple>
                                      </View>: null
                                  })
                                   :
                                  <Ripple onPress={addRecipe(item)} style={{alignSelf: 'center',  marginTop: 10, backgroundColor: '#6aab9e', width: '60%', padding: 7, borderRadius: 10, shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000', elevation: 5}} rippleDuration={600} rippleContainerBorderRadius={10} rippleOpacity={0.5} onLongPress={{}}>
                                      <Text style={{textAlign: 'center', fontFamily: 'Maven-med', color: '#2A363B', fontSize: wp(4)}}>Add &#43;</Text>
                                  </Ripple>
                              }
                              <TouchableOpacity style={{marginTop: 15}} onPress={() => navigation.navigate('RecipeDetails', {recipe_id: item.id, recipe_ingredients: ingredients})} activeOpacity={1}>
                                  <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(3.5), color: '#249c86'}}>VIEW RECIPE</Text>
                              </TouchableOpacity>
                          </View>
                      </View>
                    : null
                  )}
              />
              }
              <Animated.View style={{ transform: [{translateY: hideCategory}], position: 'absolute', backgroundColor: '#fcfcfc'}}>
                <Animated.FlatList
                    data={[1, 2, 3]}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{padding: 25}}
                    overScrollMode={'never'}
                    onContentSizeChange={(w, h) => {
                    setcompleteScrollBarWidth(w);
                    }}
                    scrollEventThrottle={16}
                    onLayout={onLayout}
                    onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollIndicator } } }],
                    { useNativeDriver: true },
                    )}
                    renderItem={({index, item}) => {
                        if (index === 0) {
                            return (
                                <Animated.View style={{transform: [{scale: scaleAnimation1}], flex: 1}}>
                                    <TouchableOpacity style={{borderRadius: 10, backgroundColor: category === 'Breakfast' ? '#e1f0ed' : '#fcfcfc', elevation: 2, padding: 15, paddingLeft: 30, paddingRight: 30, marginRight: 25, shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.20, shadowRadius: 1.41, shadowColor: '#000'}} activeOpacity={1} onPress={() => setCategory('Breakfast')} onPressIn={() => startScale1()} onPressOut={() => stopScale1()}>
                                        <Image source={require('../assets/breakfast.png')} style={{width: 25, height: 25, alignSelf: 'center'}} />
                                        <Text style={{textAlign: 'center', fontFamily: 'Maven-med', marginTop: 10, fontSize: wp(3.5)}}>Breakfast</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            )
                        } else if (index === 1){
                            return (
                                <Animated.View style={{transform: [{scale: scaleAnimation2}], flex: 1}}>
                                    <TouchableOpacity style={{borderRadius: 10, backgroundColor: category === 'Lunch' ? '#e1f0ed' : '#fcfcfc', elevation: 2, padding: 15, paddingLeft: 30, paddingRight: 30, marginRight: 25, shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.20, shadowRadius: 1.41, shadowColor: '#000'}} activeOpacity={1} onPress={() => setCategory('Lunch')}  onPressIn={() => startScale2()} onPressOut={() => stopScale2()}>
                                        <Image source={require('../assets/lunch.png')} style={{width: 25, height: 25, alignSelf: 'center'}} />
                                        <Text style={{textAlign: 'center', fontFamily: 'Maven-med', marginTop: 10, fontSize: wp(3.5)}}>Lunch</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            )
                        } else if (index === 2) {
                            return (
                                <Animated.View style={{transform: [{scale: scaleAnimation3}], flex: 1}}>
                                    <TouchableOpacity style={{borderRadius: 10, backgroundColor: category === 'Dinner' ? '#e1f0ed' : '#fcfcfc', elevation: 2, padding: 15, paddingLeft: 30, paddingRight: 30, marginRight: 25, shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.20, shadowRadius: 1.41, shadowColor: '#000'}} activeOpacity={1} onPress={() => setCategory('Dinner')}  onPressIn={() => startScale3()} onPressOut={() => stopScale3()}>
                                        <Image source={require('../assets/dinner.png')} style={{width: 25, height: 25, alignSelf: 'center'}} />
                                        <Text style={{textAlign: 'center', fontFamily: 'Maven-med', marginTop: 10, fontSize: wp(3.5)}}>Dinner</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            )
                        }
                    }}
                />
                <View style={{width: wp(20), backgroundColor: '#ebebeb', borderRadius: 3, height: 4, alignSelf: 'center', marginBottom: 15}}>
                    <Animated.View
                    style={{
                        width: scrollIndicatorSize - wp(85),
                        transform: [{ translateX: scrollIndicatorPosition }],
                        backgroundColor: '#249c86',
                        borderRadius: 3,
                        height: 4,
                        elevation: 5,
                        shadowColor: '#249c86',
                        shadowOffset: {
                            width: 0,
                            height: 2,
                        },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        }}
                    />
                </View>
              </Animated.View>
          </View>
          <View style={{backgroundColor: '#fcfcfc', position: 'absolute', top: 0, left: 0, right: 0}}>
                
                <View
                    style={{
                    backgroundColor: '#fcfcfc',
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#fcfcfc', 
                    padding: 10, 
                    borderRadius: 10,
                    marginLeft: 25,
                    marginRight: 25,
                    paddingLeft: 5,
                    marginTop: 15,
                    elevation: 3,
                    shadowOffset: {
                        width: 0,
                        height: 1,
                    },
                    shadowOpacity: 0.22,
                    shadowRadius: 2.22
                    }}
                >
                    <View style={{flex: 0.1, justifyContent: 'flex-end', alignItems: 'flex-end', marginRight: 5}}>
                        <TouchableOpacity onPress={() => searchInputRef.current.focus()} activeOpacity={1}>
                            <CustomIcon name="search" size={20} color="black"  />
                        </TouchableOpacity>
                    </View>
                    <View style={{flex: 1}}>
                        <TextInput
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={query}
                            onChangeText={(text) => searchFilterFunction(text)}
                            ref={searchInputRef}
                            placeholder="Search..."
                            style={{fontFamily: 'Maven-med', fontSize: wp(3.5)}}
                        />
                    </View>
                </View>
            </View>
            <View style={{padding: 10, width: '100%', position: 'absolute', bottom: 0, backgroundColor: '#fcfcfc', elevation: 10, flexDirection: 'row', alignItems: 'center'}}>
                <View style={{flex: 1, marginRight: 25}}>
                    {choosenDay ? 
                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3.5), textAlign: 'center'}}>You selected {choosenPlan} plan, starting from {choosenDay.dateString}. You may edit this at checkout.</Text>:
                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3.5), textAlign: 'center'}}>No plan selected. You may select again during checkout.</Text>
                    }
                </View>
                <View style={{flex: 1}}>
                    {cartData.length > 0 ?
                        <Ripple style={{alignSelf: 'flex-end', width: '100%', padding: 15, backgroundColor: '#6aab9e', borderRadius: 10, elevation: 5, shadowColor: "#000",shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.25, shadowRadius: 3.84}} onPress={() => {choosenDay ? navigation.navigate('SubRecipeCart') : setShowModal(true)}} rippleDuration={600} rippleContainerBorderRadius={10} rippleOpacity={0.5} onLongPress={{}}>
                            <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), textAlign: 'center'}}>Checkout</Text>
                        </Ripple>:
                        <TouchableOpacity disabled={true} style={{opacity: 0.2, alignSelf: 'flex-end', width: '100%', padding: 15, backgroundColor: '#6aab9e', borderRadius: 10, elevation: 5, shadowColor: "#000",shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.25, shadowRadius: 3.84}} onPress={() => {choosenDay ? navigation.navigate('SubRecipeCart') : setShowModal(true)}} activeOpacity={1}>
                            <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), textAlign: 'center'}}>Checkout</Text>
                        </TouchableOpacity>    
                    }
                </View>
            </View>

            <Modal
                isVisible={showModal}
                onBackdropPress={() => setShowModal(false)}
                onBackButtonPress={() => setShowModal(false)}
                backdropOpacity={0.8}
                backdropColor={'white'}
                style={{margin: 0}}
                useNativeDriver={true}
                useNativeDriverForBackdrop={true}
                animationInTiming={300}
                animationOutTiming={300}
                backdropTransitionInTiming={300}
                backdropTransitionOutTiming={300}
                animationIn={'slideInUp'}
            >
                <View style={{backgroundColor: 'white', marginTop: hp(10), height: '100%', flex: 1, elevation: 25, borderTopLeftRadius: 25, borderTopRightRadius: 25}}>
                    <TouchableOpacity style={{alignSelf: 'flex-end', padding: 25, paddingBottom: 0}} onPress={() => (setShowModal(false), setChoosenPlan(null), setChoosenDay(null))} activeOpacity={1}>
                        <Text style={{color: '#249c86', fontSize: wp(4), fontFamily: 'Maven-sem', marginBottom: 25}}>Do it later</Text>
                    </TouchableOpacity>
                    <Carousel 
                        ref={carouselRef}
                        data={carouselData}
                        sliderWidth={screenWidth}
                        itemWidth={screenWidth}
                        inactiveSlideScale={1}
                        scrollEnabled={false}
                        containerCustomStyle={{alignSelf: 'center'}}
                        renderItem={({item, index}) => {
                            return (
                                <View style={{flex: 1, padding: 25, paddingTop: 0}}>
                                    {index === 0 ?
                                    <View style={{flex: 1}}>
                                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(5.5)}}>Choose your plan</Text>
                                        <Text style={{fontFamily: 'Maven-med', fontSize: wp(4), color: 'black', marginTop: 10}}>Items will be delivered daily</Text>
                                        <TouchableOpacity style={{flex: 0.5, borderWidth: 1.5, borderRadius: 10, borderColor: choosenPlan === '2-week' ? '#249c86' : 'grey', marginTop: 25, padding: 25, justifyContent: 'center'}} activeOpacity={1} onPress={() => setChoosenPlan('2-week')}>
                                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                                {choosenPlan === '2-week' ? 
                                                    <MaterialCommunityIcons name="checkbox-marked-circle" size={24} color="#249c86" />
                                                :
                                                    <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={24} color="grey" />
                                                }
                                                <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4.5), marginLeft: 15}}>2-week plan</Text>
                                            </View>
                                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                                <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={24} color="white" />
                                                <Text style={{fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'grey', marginLeft: 15}}>14 total deliveries</Text>
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={{flex: 0.5, borderWidth: 1.5, borderRadius: 10, borderColor: choosenPlan === 'Monthly' ? '#249c86' : 'grey', marginTop: 25, padding: 25, justifyContent: 'center'}} activeOpacity={1} onPress={() => setChoosenPlan('Monthly')}>
                                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                                {choosenPlan === 'Monthly' ? 
                                                    <MaterialCommunityIcons name="checkbox-marked-circle" size={24} color="#249c86" />
                                                :
                                                    <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={24} color="grey" />
                                                }
                                                <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4.5), marginLeft: 15}}>Monthly plan</Text>
                                            </View>
                                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                                <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={24} color="white" />
                                                <Text style={{fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'grey', marginLeft: 15}}>Full month delivery</Text>
                                            </View>
                                        </TouchableOpacity>
                                        <View style={{flex: 1, marginTop: 50}}>
                                            <Ripple style={{width: '50%', alignSelf: 'center', padding: 15, backgroundColor: '#6aab9e', borderRadius: 10, elevation: 5, shadowColor: "#000",shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.25, shadowRadius: 3.84, opacity: choosenPlan ? 1 : 0.2}} disabled={choosenPlan ? false : true} onPress={() => carouselRef.current.snapToNext()} rippleDuration={600} rippleContainerBorderRadius={10} rippleOpacity={0.5} onLongPress={{}}>
                                                <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), textAlign: 'center'}}>Next</Text>
                                            </Ripple>
                                        </View>
                                    </View> :
                                    <View style={{flex: 1}}>
                                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(5.5), paddingBottom: 25}}>
                                            Choose the day to start your plan
                                        </Text>
                                        <ScrollView contentContainerStyle={{padding: 5, paddingTop: 0, paddingBottom: 15}} showsVerticalScrollIndicator={false} overScrollMode={'never'}>
                                            {choosenPlan === '2-week' ? 
                                            <Calendar
                                                style={{elevation: 5, marginTop: 5, borderRadius: 10, padding: 15, shadowColor: "#000", shadowOffset: {width: 0,height: 2,}, shadowOpacity: 0.25, shadowRadius: 3.84}}
                                                onDayPress={(result) => setChoosenDay(result)}
                                                minDate={currentDate}
                                                disableAllTouchEventsForDisabledDays={true}
                                                displayLoadingIndicator={true}
                                                markingType={'period'}
                                                markedDates={choosenDay ? 
                                                {
                                                    [choosenDay.dateString]: {startingDay: true, color: '#6aab9e', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(1, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(2, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(3, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(4, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(5, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(6, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(7, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(8, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(9, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(10, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(11, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(12, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(13, 'days').format('YYYY-MM-DD')]: {endingDay: true, color: '#6aab9e', textColor: 'black', dotColor: 'black', marked: true},
                                                } 
                                                :
                                                {}}
                                                theme={{
                                                    arrowColor: '#249c86',
                                                    textMonthFontFamily: 'Maven-sem',
                                                    textDayFontFamily: 'Maven-med',
                                                    textDayHeaderFontFamily: 'Maven-sem',
                                                    indicatorColor: '#249c86',
                                                }}
                                            />:
                                            <Calendar
                                                style={{elevation: 5, marginTop: 5, borderRadius: 10, padding: 15, shadowColor: "#000", shadowOffset: {width: 0,height: 2,}, shadowOpacity: 0.25, shadowRadius: 3.84}}
                                                onDayPress={(result) => setChoosenDay(result)}
                                                minDate={currentDate}
                                                disableAllTouchEventsForDisabledDays={true}
                                                displayLoadingIndicator={true}
                                                markingType={'period'}
                                                markedDates={choosenDay ?
                                                {
                                                    [choosenDay.dateString]: {startingDay: true, color: '#6aab9e', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(1, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(2, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(3, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(4, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(5, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(6, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(7, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(8, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(9, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(10, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(11, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(12, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(13, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(14, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(15, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(16, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(17, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(18, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(19, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(20, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(21, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(22, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(23, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(24, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(25, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(26, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(27, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(28, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(29, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(30, 'days').format('YYYY-MM-DD')]: {endingDay: true, color: '#6aab9e', textColor: 'black', dotColor: 'black', marked: true},
                                                }
                                                :
                                                {}}
                                                theme={{
                                                    arrowColor: '#249c86',
                                                    textMonthFontFamily: 'Maven-sem',
                                                    textDayFontFamily: 'Maven-med',
                                                    textDayHeaderFontFamily: 'Maven-sem',
                                                    indicatorColor: '#249c86',
                                                }}
                                            />}
                                            {choosenDay ? choosenPlan === '2-week' ?
                                            <View style={{marginTop: 50}}> 
                                                <Text style={{fontFamily: 'Maven-med', fontSize: wp(4)}}>&#9679;  Products will be delivered for 14 days</Text>
                                                <Text style={{fontFamily: 'Maven-med', fontSize: wp(4), marginTop: 25}}>&#9679;  Your subscription will end on <Text style={{fontFamily: 'Maven-sem'}}>{moment(choosenDay.dateString).add(13, 'days').format('YYYY-MM-DD')}</Text></Text>
                                                <Ripple style={{backgroundColor: '#6aab9e', padding: 15, borderRadius: 10, width: '50%', alignSelf: 'center', marginTop: 25,  elevation: 5, shadowColor: "#000",shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.25, shadowRadius: 3.84}} onPress={() => (setShowModal(false), navigation.navigate('SubRecipeCart'))} rippleDuration={600} rippleContainerBorderRadius={10} rippleOpacity={0.5} onLongPress={{}}>
                                                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), textAlign: 'center'}}>Confirm</Text>
                                                </Ripple>
                                            </View>
                                            :
                                            <View style={{marginTop: 50}}> 
                                                <Text style={{fontFamily: 'Maven-med', fontSize: wp(4)}}>&#9679;  Products will be delivered for the entire month</Text>
                                                <Text style={{fontFamily: 'Maven-med', fontSize: wp(4), marginTop: 25}}>&#9679;  Your subscription will end on <Text style={{fontFamily: 'Maven-sem'}}>{moment(choosenDay.dateString).add(1, 'month').format('YYYY-MM-DD')}</Text></Text>
                                                <Ripple style={{backgroundColor: '#6aab9e', padding: 15, borderRadius: 10, width: '50%', alignSelf: 'center', marginTop: 25,  elevation: 5, shadowColor: "#000",shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.25, shadowRadius: 3.84}} onPress={() => (setShowModal(false), navigation.navigate('SubRecipeCart'))} rippleDuration={600} rippleContainerBorderRadius={10} rippleOpacity={0.5} onLongPress={{}}>
                                                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), textAlign: 'center'}}>Confirm</Text>
                                                </Ripple>
                                            </View>
                                            :
                                            null}
                                        </ScrollView>
                                    </View>
                                    }
                                </View>
                            ) 
                            
                        }} 
                    />
                    
                </View>
            </Modal>
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fcfcfc',
    }
})