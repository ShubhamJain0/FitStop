import React, { useState, useEffect, useContext, useRef } from 'react';
import { TouchableOpacity } from 'react-native';
import { StyleSheet, Text, View, Image, Button, Animated, Dimensions, Easing, FlatList, TextInput, SafeAreaView } from 'react-native';
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
import { UserContext, CartContext, IsLoginContext } from './context';
import Ripple from 'react-native-material-ripple';

const {width: screenWidth} = Dimensions.get('window');
function Recipe(props){


    const CustomIcon = createIconSetFromIcoMoon(icoMoonConfig, 'IcoMoon');

    const navigation = props.navigation;

    const [recipesList, setRecipesList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState('true');
    const [mounted, setMounted] = useState(true);
    const [category, setCategory] = useState('Breakfast');

    const [cartStatus, setCartStatus] = useState(401);
    const [cartData, setCartData] = useState([]);
    const [query, setQuery] = useState('');

    const [isOffline, setIsOffline] = useState(false);
    const [showIndic, setShowInidc] = useState(false);

    const [error, setError] = useState(null);

    const [conIsLogin, setConIsLogin] = useContext(IsLoginContext);

    const [isLogin, setIsLogin] = useState(true);
    const [userData, setUserData] = useState({});

    const scaleAnimation1 = new Animated.Value(1);
    const scaleAnimation2 = new Animated.Value(1);
    const scaleAnimation3 = new Animated.Value(1);
    const [scrollY] = useState(new Animated.Value(0));

    const searchInputRef = useRef(null);

    const [cartBadge, setCartBadge] = useState('');
    const [ordersBadge, setOrdersBadge] = useState('');

    //Custom scroll indicator
    const [completeScrollBarWidth, setcompleteScrollBarWidth] = useState(1);
    const [visibleScrollBarWidth, setvisibleScrollBarWidth] = useState(0);
    const scrollIndicator = useRef(new Animated.Value(0)).current;

    


    //Copilot Variables
  
    const CoPilotTouchableOpacity = walkthroughable(TouchableOpacity)
    const CoPilotView = walkthroughable(View)


    //Checks for first time and launches co pilot
    useEffect(() => {
        (async () => {
        const isFirstTime = await AsyncStorage.getItem('isFirstTimeRecipe')
        if (isFirstTime === null && mounted && loading === 'true') {
            await AsyncStorage.setItem('isFirstTimeRecipe', 'false')
            props.start();
        }
        })().catch(error => setError(error))

        return () => {
          setMounted(false);
          props.copilotEvents.off("stop");
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
        fetch('http://192.168.0.156:8000/api/me/',{
              method: 'GET',
              headers: {
              'Authorization': `Token ${token}`,
              'Content-type': 'application/json'
              }
          })
          .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
          .then(resp => {if (mounted) {setUserData(resp.json)}})
          .then(() => {if (mounted) {setIsLogin(true)}})
          .then(() => {if (mounted) {setLoading('false'); setIsOffline(false);}})
          .catch(error => setError(error));
      } else {
        if (mounted) {
          setLoading('false'); 
          setIsOffline(false);
          setIsLogin(false);
        }
      }
    })().catch(error => setError(error))

  }, [conIsLogin])


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
                  return fetch('http://192.168.0.156:8000/store/cart/',{
                      method: 'GET',
                      headers: {
                      'Authorization': `Token ${token}`,
                      'Content-type': 'application/json'
                      },
                  })
                  .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                  .then(resp => {if (mounted) {setCartData(resp.json), setCartStatus(resp.status); if(resp.json.length > 0){setCartBadge(true)} else {setCartBadge(false)}}})
                  .then(() => setLoading('false'))
                  .catch(error => setError(error))
              } else {
                  setCartData([]);
              }
          })().catch(error => setError(error))
      })

      return () => {
          getCart;
      }
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
              if (cartData[i].ordereditem === item.name) {
                  return cartData[i];
              }
          }
      }
  }


  const addRecipe = (item) => async evt => {
      const token =  await SecureStore.getItemAsync('USER_TOKEN')
          if (token) {
              return fetch('http://192.168.0.156:8000/store/cart/',{
                  method: 'POST',
                  headers: {
                  'Authorization': `Token ${token}`,
                  'Content-type': 'application/json'
                  },
                  body: JSON.stringify({ ordereditem: item, item_type: 'Recipes' })
              })
              .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
              .then(resp => {setCartData(resp.json.cart); if(resp.json.cart.length > 0){setCartBadge(true)} else {setCartBadge(false)}})
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
                  duration: 2500
              })
              navigation.navigate('Register')
          }
  }



  const removeRecipe = (item) => async evt => {
      const token =  await SecureStore.getItemAsync('USER_TOKEN')
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
              .then(resp => {setCartData(resp.json.cart); if(resp.json.cart.length > 0){setCartBadge(true)} else {setCartBadge(false)}})
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


  //Cart button animation

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

              fetch('http://192.168.0.156:8000/store/cart/',{
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
        
          <View style={{flex: 1, marginTop: 175}}>
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
            <View style={{flexDirection: 'row', alignItems: 'center', padding: 25, paddingTop: 35, paddingBottom: 0}}>
                <View style={{flex: 1}}>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{alignSelf: 'flex-start'}} activeOpacity={1}>
                    {isLogin ? userData.image ? <Image source={{uri: userData.image}} style={{width: 40, height: 40, borderRadius: 100}} />: <LottieView source={require('../assets/animations/43110-male-avatar.json')} autoPlay={true} loop={true} style={{width: 60}}  />: <LottieView source={require('../assets/animations/43110-male-avatar.json')} autoPlay={true} loop={true} style={{width: 60}}  />}
                </TouchableOpacity>
                </View>
                <View style={{flex: 1}}>
                        <Text style={{fontFamily: 'Maven-bold', fontSize: wp(5.5), textAlign: 'center'}}>Recipes</Text>
                    </View>
                <View style={{flex: 1}}>
                    <TouchableOpacity onPress={() => navigation.navigate('cart')} style={{alignSelf: 'flex-end'}} activeOpacity={1}><CustomIcon name="cart" size={wp(6)} color="black" style={{alignSelf: 'center'}} /></TouchableOpacity>
                    {cartBadge ? <View style={{position: 'absolute', borderRadius: 100, backgroundColor: '#249c86', width: 15, height: 15, right: -10, top: -8}}>
                    </View> : null}
                </View>
            </View>
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
          {/* <View style={{width: '100%', position: 'absolute', bottom: 0, backgroundColor: '#fcfcfc', padding: 5, paddingTop: 15, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 15, shadowOffset: {width: 0, height: 7}, shadowOpacity: 0.43, shadowRadius: 9.51, shadowColor: '#000'}}>
                <View style={{flex: 1, alignItems: 'center'}}>
                    <TouchableOpacity onPress={() => navigation.navigate('Home')} activeOpacity={1}>
                        <CustomIcon name="home" size={wp(6)} style={{color: 'black', alignSelf: 'center'}} />
                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3), color: 'black', textAlign: 'center'}}>Home</Text>
                    </TouchableOpacity>         
                </View>
                <View style={{flex: 1}}>
                    <TouchableOpacity onPress={() => navigation.navigate('Fruits')} activeOpacity={1} style={{alignSelf: 'center'}}>
                        <CustomIcon name="store" size={wp(6)} color="black" style={{alignSelf: 'center'}} />
                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3), color: 'black', textAlign: 'center'}}>Store</Text>
                    </TouchableOpacity>
                </View>
                <View style={{flex: 1}}>
                    <TouchableOpacity style={{backgroundColor: '#fcfcfc', borderRadius: 50, elevation: 5, position: 'absolute', padding: 20, top: -70, left: 0, right: 0 }} onPress={() => navigation.navigate('Subscription')} activeOpacity={1}>
                        <CustomIcon name="cart" size={wp(6.5)} color="black" style={{alignSelf: 'center'}} />
                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3), color: 'black', textAlign: 'center'}}>cart</Text>
                    </TouchableOpacity>
                </View>    
                <View style={{flex: 1}}>
                    <TouchableOpacity onPress={() => navigation.navigate('Recipes')} activeOpacity={1}>
                        <CustomIcon name="card" size={wp(6.5)} color="black" style={{alignSelf: 'center'}} />
                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3), color: 'black', textAlign: 'center'}}>Recipes</Text>
                    </TouchableOpacity>
                </View>    
                <View style={{flex: 1}}>
                    <TouchableOpacity onPress={() => navigation.navigate('Subscription')} activeOpacity={1}>
                        <CustomIcon name="subscription-b" size={wp(6.5)} color="#249c86" style={{alignSelf: 'center'}} />
                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3), color: '#249c86', textAlign: 'center'}}>Subscription</Text>
                    </TouchableOpacity>
                </View>        
            </View> */}
      </View>
    )
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fafafa'
    },
})



const StepNumberComponent = ({
  isFirstStep,
  isLastStep,
  currentStep,
  currentStepNumber,
}) => {
  return (
    <View style={{backgroundColor: '#249c86', flex: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderRadius: 14, borderColor: 'white'}}>
      <Text style={{fontFamily: 'Maven-med', fontSize: wp(4)}}>{currentStepNumber}</Text>
    </View>
  )
}

const TooltipComponent = ({
  isFirstStep,
  isLastStep,
  handleNext,
  handlePrev,
  handleStop,
  currentStep,
  labels,
}) => {
  return (
    <View>
    <View style={{flex: 1}}>
      <Text testID="stepDescription" style={{fontFamily: 'Maison-bold', fontSize: wp(3.5), color: 'black'}}>{currentStep.text}</Text>
    </View>
    <View style={{marginTop: 10, flexDirection: 'row', justifyContent: 'flex-end'}}>
      {
        !isLastStep ?
          <TouchableOpacity onPress={handleStop}>
            <Text style={{padding: 10, fontFamily: 'Maison-bold', color: '#249c86'}}>{labels.skip || 'Skip'}</Text>
          </TouchableOpacity>
          : null
      }
      {
        !isFirstStep ?
          <TouchableOpacity onPress={handlePrev}>
            <Text style={{padding: 10, fontFamily: 'Maison-bold', color: '#249c86'}}>{labels.previous || 'Previous'}</Text>
          </TouchableOpacity>
          : null
      }
      {
        !isLastStep ?
          <TouchableOpacity onPress={handleNext}>
            <Text style={{padding: 10, fontFamily: 'Maison-bold', color: '#249c86'}}>{labels.next || 'Next'}</Text>
          </TouchableOpacity> :
          <TouchableOpacity onPress={handleStop}>
            <Text style={{padding: 10, fontFamily: 'Maison-bold', color: '#249c86'}}>{labels.finish || 'Done'}</Text>
          </TouchableOpacity>
      }
    </View>
  </View>
  )
};




export default copilot({
  overlay: 'view', 
  animated: true, 
  backdropColor: 'rgba(0, 0, 0, 0.8)', 
  stepNumberComponent: StepNumberComponent,
  tooltipComponent: TooltipComponent,
})(Recipe);