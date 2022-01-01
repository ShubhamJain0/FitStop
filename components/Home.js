import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef, isValidElement, useContext, useLayoutEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Image, Dimensions, TouchableHighlight, Platform, ScrollView, 
  TouchableOpacity, RefreshControl, Animated, Easing, Linking, Button, FlatList, ActivityIndicator } from 'react-native';
import Modal from 'react-native-modal';
import Carousel, {ParallaxImage, Pagination} from 'react-native-snap-carousel';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen'; 
import * as Location from 'expo-location';
import { MaterialCommunityIcons, MaterialIcons, FontAwesome, Ionicons, AntDesign, createIconSetFromIcoMoon, FontAwesome5, Feather } from '@expo/vector-icons';
import { UserContext, PushTokenContext, CartContext, IsLoginContext} from './context';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import NetInfo from "@react-native-community/netinfo";
import Svg, { Path, Rect, Circle, G, Polygon, Ellipse, Use } from 'react-native-svg';
import { copilot, walkthroughable, CopilotStep } from "react-native-copilot";
import icoMoonConfig from '../selection.json';
import * as SecureStore from 'expo-secure-store';
import { showMessage } from 'react-native-flash-message';
import moment from 'moment';


const {width: screenWidth} = Dimensions.get('window');
const screenHeight = Dimensions.get('window').height;


const HEADER_MAX_HEIGHT = 30;
const HEADER_MIN_HEIGHT = 20;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});



function Home(props){

  const CustomIcon = createIconSetFromIcoMoon(icoMoonConfig, 'IcoMoon');

  const navigation = props.navigation;
  const [mounted, setMounted] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [showIndic, setShowInidc] = useState(false);

  const [bannerImages, setbannerImages] = useState([]);
  const carouselRef = useRef(null);
  const [activeSlide, setactiveSlide] = useState(0);

  const [homeProductImages, setHomeProductImages] = useState([]);


  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [reversegeolocation, setReversegeolocation] = useState(null);
  const [mapDefLocation, setMapDefLocation] = useState({latitude: 17.4217697, longitude: 78.4749875, latitudeDelta: 0.1, longitudeDelta: 0.1});
  const [markerData, setMarkerData] = useState({latitude: 17.4217697, longitude: 78.4749875 });
  const [locationPermission, setlocationPermission] = useState('Detecting Location....');

  const[loading, setLoading] = useState('true');
  const [refreshing, setRefreshing] = useState(false);
  const [refreshOpacity, setRefreshOpacity] = useState(0);
  
  const [modalVisible, setmodalVisible] = useState(false);
  const [locationModal, setLocationModal] = useState(false);

  const [orderReceivedModal, setOrderReceivedModal] = useState(false);

  const [confirmDisabled, setConfirmDisabled] = useState(false);


  const [conPushToken, setConPushToken] = useContext(PushTokenContext);
  const [conIsLogin, setConIsLogin] = useContext(IsLoginContext);

  const [isLogin, setIsLogin] = useState(true);
  const [userData, setUserData] = useState({});

  const [animation] = useState(new Animated.Value(0));
  const [scrollY] = useState(new Animated.Value(0));

  const [previousOrderList, setPreviousOrderList] = useState([]);
  const [previousOrderItems, setPreviousOrderItems] = useState([]);
  const [images, setImages] = useState([]);
  const [previousOrderStatus, setPreviousOrderStatus] = useState(0);

  const [recipesList, setRecipesList] = useState([]);
  const [ingredients, setIngredients] = useState([]);

  const [headerShadow, setHeaderShadow] = useState(false);
  
  const [cartBadge, setCartBadge] = useState('');
  const [ordersBadge, setOrdersBadge] = useState('');

  var re = /([^\s]+)/;

  //Copilot Variables
  
  const CoPilotTouchableOpacity = walkthroughable(TouchableOpacity)
  const CoPilotScrollView = walkthroughable(ScrollView)

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

  //Checks for first time and launches co pilot
  useEffect(() => {
    (async () => {
      const isFirstTime = await AsyncStorage.getItem('isFirstTimeHome')
      if (isFirstTime === null && mounted) {
        await AsyncStorage.setItem('isFirstTimeHome', 'false')
        props.start();
      }
    })().catch(error => setError(error))

    return () => {
      setMounted(false);
      props.copilotEvents.off("stop");
    }
    
  }, [])

  useEffect(() => {
    let timeOut = setTimeout(() => setRefreshOpacity(1), 8000);
    fetch('http://192.168.0.156:8000/store/homebanner/',{
      method: 'GET',
      headers: {
        'Content-type': 'application/json'
      }
    })
    .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
    .then(resp => {if (mounted) {setbannerImages(resp.json)}})
    .catch(error => setError(error))

    return () => {
      setMounted(false);
      clearTimeout(timeOut);
    }
  }, []);


  useEffect(() => {
    fetch('http://192.168.0.156:8000/store/homeproducts/',{
      method: 'GET',
      headers: {
        'Content-type': 'application/json'
      }
    })
    .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
    .then(resp => {if (mounted) {setHomeProductImages(resp.json)}})
    .catch(error => setError(error))

    return () => {
      setMounted(false);
    }
  }, []);


  useEffect(() => {
    const getpreviousorders = navigation.addListener('focus', () => {
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
          .then(resp => {if (mounted) {setPreviousOrderList(resp.json.qs), setPreviousOrderItems(resp.json.data), setImages(resp.json.images), setPreviousOrderStatus(resp.status)}})
          .catch(error => setError(error))
        } else {
          setPreviousOrderList([]);
          setPreviousOrderItems([]);
        }
      })().catch(error => setError(error))
    })
  }, [navigation])



  useEffect(() => {
    fetch('http://192.168.0.156:8000/store/recipes/',{
      method: 'GET',
      headers: {
        'Content-type': 'application/json'
      }
    })
    .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
    .then(resp => {if (mounted) {setRecipesList(resp.json.qs), setIngredients(resp.json.ingredients)}})
    .catch(error => setError(error))

    return () => {
      setMounted(false);
    }
  }, []);


useEffect(() => {
  const getCart = navigation.addListener('focus', () => {
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
            .then(resp => {if (mounted && resp.json.length > 0) {setCartBadge(true)} else {setCartBadge(false)}})
            .catch(error => setError(error))
        }
      })().catch(error => setError(error))
  })

  return () => {
    setMounted(false);
  }
}, [navigation])


  ////Profile related


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
            .catch(error => setError(error));
        } else {
          return setIsLogin(false);
        }
      })().catch(error => setError(error))

  }, [conIsLogin])



  ///Push Notifications

  useEffect(() => {
    if (!isOffline) {
      registerPushNotificationPermissions();
    }
  }, [])


  const registerPushNotificationPermissions = async () => {
    let pushToken;
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // only ask if permissions have not already been determined, because
    // iOS won't necessarily prompt the user a second time.
    if (existingStatus !== 'granted') {
      // Android remote notification permissions are granted during the app
      // install, so this will only ask on iOS
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // Stop here if the user did not grant permissions
    if (finalStatus !== 'granted') {
      return setConPushToken(null);
    }

    // Get the token that uniquely identifies this device
    pushToken = await Notifications.getExpoPushTokenAsync()
    .then((pushToken) => (savePushToken(pushToken), setConPushToken(pushToken)))
    .catch(error => setError(error))
  }


  const savePushToken = async (pushToken) => {
    const token = await SecureStore.getItemAsync('USER_TOKEN')
    if (token){
      fetch('http://192.168.0.156:8000/store/pushnotificationtoken/',{
              method: 'POST',
              headers: {
                'Authorization': `Token ${token}`,
                'Content-type': 'application/json'
              },
              body: JSON.stringify({pushToken: pushToken.data})
          })
      .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
      .then(() => setLoading('false'))
      .then(() => setIsOffline(false))
      .then(() => setShowInidc(false))
      .catch(error => setError(error))
    } else {
      fetch('http://192.168.0.156:8000/store/pushnotificationtoken/',{
              method: 'POST',
              headers: {
              'Content-type': 'application/json'
              },
              body: JSON.stringify({pushToken: pushToken.data})
          })
      .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
      .then(() => setLoading('false'))
      .then(() => setIsOffline(false)) 
      .then(() => setShowInidc(false))
      .catch(error => setError(error))
    }
  }




  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      if (response.notification.request.content.data.screen){
        const url = response.notification.request.content.data.screen;
        if (response.notification.request.content.data.params) {
          const param = response.notification.request.content.data.params
          navigation.navigate(url, {from: param});
        }
        else if (url === 'Home') {
          navigation.navigate(url);
          setOrderReceivedModal(true);
        } else if (url === 'ActiveOrders') {
          const param = response.notification.request.content.data.item_id
          navigation.navigate(url, {activeOrder: param})
        } else {
          navigation.navigate(url);
        }
      }
    });
    return () => subscription.remove();
  }, [])


  const lastNotificationResponse = Notifications.useLastNotificationResponse();
  useEffect(() => {
    if (
      lastNotificationResponse &&
      lastNotificationResponse.notification.request.content.data.screen &&
      lastNotificationResponse.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER
    ) {
      const url = lastNotificationResponse.notification.request.content.data.screen;
      if (lastNotificationResponse.notification.request.content.data.params){
        const param = lastNotificationResponse.notification.request.content.data.params
        navigation.navigate(url, {from: param});
      } else if (url === 'Home') {
        navigation.navigate(url);
        setOrderReceivedModal(true);
      } else if (url === 'ActiveOrders') {
        const param = lastNotificationResponse.notification.request.content.data.item_id
        navigation.navigate(url, {activeOrder: param})
      } else {
        navigation.navigate(url);
      }
    }
  }, [lastNotificationResponse]);


  //component refresh functions


  const wait = timeout => {
    return new Promise(resolve => {
      setTimeout(resolve, timeout);
    });
  };


  const onRefresh = React.useCallback(() => {
    setRefreshing(true);

    wait(2000).then(() => setRefreshing(false))

    fetch('http://192.168.0.156:8000/store/homebanner/',{
      method: 'GET',
      headers: {
        'Content-type': 'application/json'
      }
    })
    .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
    .then(resp => setbannerImages(resp.json))
    .then(() => setLoading('false'))
    .catch(error => setError(error))

    
  }, []);



  ///location related functions



  



  const getLocation = () => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setErrormsg('Permission to access location was denied');
        setmodalVisible(false);
        return;
      }

      
      setConfirmDisabled(true);
      setLocationModal(true);
      
      let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
      setLocation(location.coords);
      

      let geolocation = await Location.reverseGeocodeAsync({latitude: location.coords.latitude, longitude: location.coords.longitude})
      setReversegeolocation(geolocation);
      
      setLocationModal(false);
      setmodalVisible(false);
      setMarkerData(location.coords)
      setMapDefLocation({latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.006, longitudeDelta: 0.006})
    })().catch(error => setError(error))
        .then(() => {setConfirmDisabled(false); setLocationModal(false);});
  }


  if (location){
    let text;
    text = JSON.stringify(location)
  }

  

  //positions the marker and also updates the map position
  const handleRegionChange = (mapData) => {
    setMarkerData({latitude: mapData.latitude, longitude: mapData.longitude});
    setMapDefLocation(mapData);
    setLocation({latitude: mapData.latitude, longitude: mapData.longitude});

  }



  const confirmLocation = () => {
    
    (async () => {

      setMarkerData({latitude: location.latitude, longitude: location.longitude});
      setMapDefLocation({latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.006, longitudeDelta: 0.006});

      let geolocation = await Location.reverseGeocodeAsync({latitude: location.latitude, longitude: location.longitude})
      setReversegeolocation(geolocation);

      setmodalVisible(false);      
    })().catch(error => setError(error));

  }




  //Carousel functions


  const goForward = () => {
    carouselRef.current.snapToNext();
  };


  const pagination = () => {
    return (
        <Pagination
          dotsLength={bannerImages.length}
          activeDotIndex={activeSlide}
          containerStyle={{ backgroundColor: '#fcfcfc', alignSelf: 'center', paddingVertical: 0}}
          dotStyle={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: '#249C86'
          }}
          inactiveDotStyle={{
              // Define styles for inactive dots here
              backgroundColor: 'grey'
          }}
          inactiveDotOpacity={1}
          inactiveDotScale={0.6}
        />
    );
  }


  const touched = (index) => evt => {
    if (index === 0) {
      navigation.navigate('HomeProducts', {from: 'Banner1'});
    } else if (index === 1){
      navigation.navigate('HomeProducts', {from: 'Banner2'});
    }
  }

  //Animations
  const diffClamp = Animated.diffClamp(scrollY, 0, 100)

  const headerHide = scrollY.interpolate({
    inputRange: [0, 125],
    outputRange: [0, -20],
    extrapolate: 'clamp',
  })


  const hideGreet = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -400],
    extrapolate: 'clamp',
  })

  useEffect(() => {
    scrollY.addListener((value) => {
      if (value.value > 50){
        setHeaderShadow(true);
      } else {
        setHeaderShadow(false);
      }
    })
  }, [])

  useEffect(() => {
    scrollY.addListener(value => {
      if (value.value > 25){
        Animated.timing(animation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start()
      } else {
        Animated.timing(animation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        }).start()
      }
    })
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
            navigation.navigate('cart');
          }
          })
          .catch(error => setError(error))
        } else {
          navigation.navigate('Register')
        }
  }


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
    outputRange: [0, difference - wp(40)],
  });
    

  const onLayout = ({
    nativeEvent: {
    layout: { width },
    },
  }) => {
    setvisibleScrollBarWidth(width);
  };



  //Retry

  const retry = async () => {
    setShowInidc(true);
    const token = await SecureStore.getItemAsync('USER_TOKEN')
    try {

      //Banners
      fetch('http://192.168.0.156:8000/store/homebanner/',{
        method: 'GET',
        headers: {
          'Content-type': 'application/json'
        }
      })
      .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
      .then(resp => setbannerImages(resp.json))
      .catch(error => setError(error))

      //Home Products
      fetch('http://192.168.0.156:8000/store/homeproducts/',{
        method: 'GET',
        headers: {
          'Content-type': 'application/json'
        }
      })
      .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
      .then(resp => setHomeProductImages(resp.json))
      .catch(error => setError(error))

      //Recipes
      fetch('http://192.168.0.156:8000/store/recipes/',{
        method: 'GET',
        headers: {
          'Content-type': 'application/json'
        }
      })
      .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
      .then(resp => (setRecipesList(resp.json.qs), setIngredients(resp.json.ingredients)))
      .catch(error => setError(error))

      
      if (token) {

        //Previous orders
        fetch('http://192.168.0.156:8000/store/previousorders/',{
            method: 'GET',
            headers: {
            'Authorization': `Token ${token}`,
            'Content-type': 'application/json'
            }
        })
        .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => (setPreviousOrderList(resp.json.qs), setPreviousOrderItems(resp.json.data), setImages(resp.json.images), setPreviousOrderStatus(resp.status)))
        .catch(error => setError(error))


        //Cart
        fetch('http://192.168.0.156:8000/store/cart/',{
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-type': 'application/json'
            }
        })
        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => {if (mounted && resp.json.length > 0) {setCartBadge(true)} else {setCartBadge(false)}})
        .catch(error => setError(error))


        //Profile
        fetch('http://192.168.0.156:8000/api/me/',{
            method: 'GET',
            headers: {
            'Authorization': `Token ${token}`,
            'Content-type': 'application/json'
            }
        })
        .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => setUserData(resp.json))
        .then(() => setIsLogin(true))
        .catch(error => setError(error));

        registerPushNotificationPermissions();
      } else {
        if (mounted){
          registerPushNotificationPermissions();
          setIsLogin(false);
          setOrdersBadge(false);
          setCartBadge(false);
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
          <Text style={{fontFamily: 'Maven-sem', fontSize: wp(6), marginTop: 50, textAlign: 'center'}}>Uh oh! Seems like you are disconnected !</Text>
          {!showIndic ? <TouchableOpacity style={{alignSelf: 'center', marginTop: 25}} onPress={retry} activeOpacity={1}>
            <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: '#249c86'}}>RETRY</Text>
          </TouchableOpacity>: <LottieView source={require('../assets/animations/connecting.json')} autoPlay={true} loop={true} style={{height: 100, alignSelf: 'center'}} />}
        </View>
      </View>
    )
  }

  
  
    if (loading == 'true') {
      return (
        <View style={{flex: 1, backgroundColor: '#fafafa', justifyContent: 'center', alignItems: 'center'}}>
          <StatusBar style="inverted" />
          <LottieView source={require('../assets/animations/9258-bouncing-fruits.json')} style={{width: 200}} loop={true} autoPlay={true} />
        </View>
      )
    }



    return (
      <View style={{backgroundColor: '#fcfcfc', flex: 1}}>
        <StatusBar style="inverted" />
        <View style={{backgroundColor: '#fcfcfc', paddingBottom: 25}}>
        <Text></Text>
        </View>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          overScrollMode={'never'}
          bounces={false}// for ios 
          scrollEventThrottle={16}
          contentContainerStyle={{paddingTop: 60, paddingBottom: 75}}
          onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {y: scrollY}}}],
            {useNativeDriver: true}
            
          )}
          >
          <StatusBar style="inverted" />
          
          <View>
            <Carousel
              ref={carouselRef}
              sliderWidth={screenWidth}
              itemWidth={screenWidth}
              data={bannerImages}
              onContentSizeChange={(w, h) => {
                setcompleteScrollBarWidth(w);
              }}
              onLayout={onLayout}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollIndicator } } }],
                { useNativeDriver: true },
              )}
              renderItem={({item, index}, parallaxProps) => {
                  return (
                    <TouchableOpacity onPress={touched(index)} activeOpacity={0.9}>
                      <View>
                          <ParallaxImage
                            source={{uri: item.image}}
                            containerStyle={styles.imageContainer}
                            style={styles.image}
                            parallaxFactor={0.1}
                            showSpinner={true}
                            spinnerColor={'#6aab9e'}
                            {...parallaxProps}
                          />
                      </View>
                    </TouchableOpacity>
                  );
              }}
              hasParallaxImages={true}
              keyExtractor={(item, index) => index.toString()}
              onSnapToItem={(index) => setactiveSlide(index)}
              autoplay={true}
              autoplayDelay={10}
              autoplayInterval={2500}
              pagingEnabled={true}
            />
            <View style={{width: wp(20), backgroundColor: '#ebebeb', borderRadius: 3, height: 4, alignSelf: 'center', marginBottom: 15}}>
              <Animated.View
              style={{
                  width: scrollIndicatorSize - wp(40),
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

          </View>
          
          <View style={{backgroundColor: '#fcfcfc', padding: 25, paddingBottom: 0, marginTop: 50, paddingTop: 0}}>
            <Text style={{fontFamily: 'Maven-bold',fontSize: wp(4.5), color: 'black'}}>CATEGORIES</Text>
          </View>
          <View style={{marginLeft: 25, flexDirection: 'row', alignItems: 'center', marginTop: 10, marginRight: 25, borderBottomWidth: 1, borderBottomColor: '#ebebeb'}}>
            <TouchableOpacity onPress={() => navigation.navigate('Fruits', {category: 'Fruits'})} style={{flex: 1, paddingBottom: 25, margin: 25, marginLeft: 0, marginBottom: 0}} activeOpacity={1}>
              <Image source={require('../assets/fruits.png')} style={{width: 60, height: 60, alignSelf: 'center'}} />
              <Text style={{fontFamily: 'Maven-sem',fontSize: wp(4), color: 'black', textAlign: 'center', marginTop: 25}}>Fruits</Text>
            </TouchableOpacity>
            <Text style={{width: 1.3, height: '100%', backgroundColor: '#ebebeb', marginRight: 15}}></Text>
            <TouchableOpacity onPress={() => navigation.navigate('Fruits', {category: 'Dried-fruits'})} style={{flex: 1, paddingBottom: 25, margin: 25, marginLeft: 0, marginBottom: 0}} activeOpacity={1}>
              <Image source={require('../assets/dried-fruits.png')} style={{width: 60, height: 60, alignSelf: 'center'}} />
              <Text style={{fontFamily: 'Maven-sem',fontSize: wp(4), color: 'black', textAlign: 'center', marginTop: 25}}>Dried-Fruits</Text>
            </TouchableOpacity>
          </View>
          <View style={{marginLeft: 25, flexDirection: 'row', alignItems: 'center', marginRight: 25, borderBottomWidth: 1, borderBottomColor: '#ebebeb'}}>
            <TouchableOpacity onPress={() => navigation.navigate('Fruits', {category: 'Exotics'})} style={{flex: 1, paddingBottom: 25, margin: 25, marginLeft: 0, marginBottom: 0}} activeOpacity={1}>
              <Image source={require('../assets/broccoli.png')} style={{width: 60, height: 60, alignSelf: 'center'}} />
              <Text style={{fontFamily: 'Maven-sem',fontSize: wp(4), color: 'black', textAlign: 'center', marginTop: 25}}>Exotics</Text>
            </TouchableOpacity>
            <Text style={{width: 1.3, height: '100%', backgroundColor: '#ebebeb', marginRight: 15}}></Text>
            <TouchableOpacity onPress={() => navigation.navigate('Fruits', {category: 'Immunity-Boosters'})} style={{flex: 1, paddingBottom: 25, margin: 25, marginLeft: 0, marginBottom: 0}} activeOpacity={1}>
              <Image source={require('../assets/imb.png')} style={{width: 60, height: 60, alignSelf: 'center'}} />
              <Text style={{fontFamily: 'Maven-sem',fontSize: wp(4), color: 'black', textAlign: 'center', marginTop: 25}}>Immunity-Boosters</Text>
            </TouchableOpacity>
          </View>
          <View style={{marginLeft: 25, flexDirection: 'row', alignItems: 'center', marginRight: 25, borderBottomWidth: 0, borderBottomColor: '#ebebeb'}}>
            <TouchableOpacity onPress={() => navigation.navigate('Fruits', {category: 'Other'})} style={{flex: 1, paddingBottom: 25, margin: 25, marginLeft: 0, marginBottom: 0}} activeOpacity={1}>
              <Image source={require('../assets/other.png')} style={{width: 60, height: 60, alignSelf: 'center'}} />
              <Text style={{fontFamily: 'Maven-sem',fontSize: wp(4), color: 'black', textAlign: 'center', marginTop: 25}}>Other</Text>
            </TouchableOpacity>
            <Text style={{width: 1.3, height: '100%', backgroundColor: '#ebebeb', marginRight: 15}}></Text>
            <TouchableOpacity onPress={() => navigation.navigate('Recipes')} style={{flex: 1, paddingBottom: 25, margin: 25, marginLeft: 0, marginBottom: 0}} activeOpacity={1}>
              <Image source={require('../assets/recipes.png')} style={{width: 75, height: 75, alignSelf: 'center'}} />
              <Text style={{fontFamily: 'Maven-sem',fontSize: wp(4), color: 'black', textAlign: 'center', marginTop: 25}}>Recipes</Text>
            </TouchableOpacity>
          </View>

          {/* <View style={{marginTop: 50, paddingLeft: 25, paddingRight: 25, padding: 30, backgroundColor: '#ffffff', marginLeft: 25, marginRight: 25, borderRadius: 15, flexDirection: 'row', elevation: 5, shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.25, shadowRadius: 3.84, shadowColor: '#000'}}>
            <Image source={require('../assets/shopping-history.png')} style={{width: 100, height: 100}} />
            <View style={{flex: 1, marginLeft: 10}}>
              <Text style={{fontFamily: 'Maven-sem',fontSize: wp(5), color: 'black', textAlign: 'center'}}>Choose from your past orders!</Text>
              <TouchableOpacity onPress={() => navigation.navigate('PreviousOrders')} activeOpacity={1}>
                <Text style={{fontFamily: 'Maven-sem',fontSize: wp(4), color: '#249c86', textAlign: 'center', marginTop: 10}}>View &rarr;</Text>
              </TouchableOpacity>
            </View>
          </View> */}
          {/* <FlatList 
              data={recipesList.slice(0, 2)}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={{paddingTop: 15, paddingLeft: 25, paddingBottom: 25}}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={{backgroundColor: 'white', marginTop: 15, marginBottom: 35, marginRight: 50, padding: 25, borderRadius: 25, elevation: 15, shadowOffset: {width: 0, height: 7}, shadowRadius: 9.51, shadowOpacity: 0.43, shadowColor: '#000'}} >
                  <View style={{backgroundColor: 'white', borderRadius: 100, width: 125, height: 125, alignSelf: 'center', elevation: 15, shadowOffset: {width: 0, height: 7}, shadowRadius: 9.51, shadowOpacity: 0.43, shadowColor: '#000'}}>
                    <Image source={{uri: item.image}} style={{width: 125, height: 125, alignSelf: 'center', borderRadius: 100}} />
                  </View>
                  <View style={{flex: 1, flexDirection: 'row', alignItems: 'center',  marginTop: 15, justifyContent: 'center'}}>
                    <MaterialIcons name="local-fire-department" size={wp(4.5)} color="#249C86" />
                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), textAlign: 'center', color: 'grey'}}> {item.value1} </Text>
                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(5), textAlign: 'center', color: 'grey'}}> | </Text>
                    <Ionicons name="ios-people" size={wp(4)} color="#249c86" />
                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), textAlign: 'center', color: 'grey'}}>  Serves {item.servings}</Text>
                  </View>
                  <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 5}}>
                    <View style={{ flex: 1, alignItems: 'flex-end'}}>
                      <MaterialIcons name="favorite" size={wp(4)} color="#249C86" />
                    </View>
                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), textAlign: 'left', color: 'grey', flex: 1}}> {item.count} </Text>
                  </View>
                  <Text style={{fontFamily: 'Maven-sem', fontSize: wp(5), marginTop: 15, color: 'black'}}>{item.name}</Text>
                  <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 25}}>
                    <View style={{flex: 1}}>
                      <TouchableOpacity style={{alignSelf: 'center'}} onPress={() => navigation.navigate('RecipeDetails', {recipe_id: item.id, recipe_ingredients: ingredients})}>
                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3.5), color: '#249c86'}}>VIEW RECIPE</Text>
                      </TouchableOpacity>
                    </View>
                </View>
            </View>
              )}
            /> */}
          {/* {previousOrderList !== undefined ? previousOrderList.length > 0 ? <View style={{backgroundColor: '#fcfcfc', padding: 25, paddingTop: 0, paddingBottom: 0, marginTop: 50, flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{fontFamily: 'Maven-bold',fontSize: wp(4), color: 'grey', flex: 1}}>ORDER AGAIN</Text>
            <TouchableOpacity onPress={() => navigation.navigate('PreviousOrders')} activeOpacity={1}>
              <Text style={{fontFamily: 'Maven-bold',fontSize: wp(4), color: '#249C86'}}>SEE ALL</Text>
            </TouchableOpacity>
          </View>: null: null}
            <ScrollView bounces={false} showsHorizontalScrollIndicator={false} horizontal={true} contentContainerStyle={{paddingTop: 15, paddingLeft: 25, paddingBottom: 25}}>
                {previousOrderStatus === 200 ? previousOrderList.slice(0, 5).map((item, index) => {
                    return(
                        <View key={item.id} style={{marginRight: 50, backgroundColor: 'white', padding: 25, paddingTop: 15, paddingBottom: 15, borderRadius: 10, elevation: 10, shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.34, shadowRadius: 6.27, shadowColor: '#000'}}>
                            <View style={{flex: 1}}>
                                <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4)}}>Order #{item.id}</Text>
                                <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3), color: 'grey', marginTop: 2}}>{item.ordereddate}</Text>
                            </View>
                            <ScrollView>
                              {previousOrderItems.map(item1 => {
                                  return item1.items.slice(0, 2).map((x, index) => {
                                      return x.id_of_order === item.id ?
                                      <View key={x.id} style={{marginTop: 10}}>
                                          {index === 1 ? <Text style={{backgroundColor: '#ebebeb', height: 1, marginBottom: 10, width: '60%', alignSelf: 'flex-end'}}></Text>: null}
                                          <View style={{flexDirection: 'row'}}>
                                              {images.length > 0 ? 
                                                  images.map(y => {
                                                      return x.item_name === y.name ? 
                                                      <Image key={y.id} source={{uri: y.image}} style={{width: 55, height: 55, borderRadius: 20}} />
                                                      : null
                                                  })
                                              : null}
                                              <View style={{marginLeft: 25, marginTop: 5}}>
                                                  <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>{x.item_name} </Text>
                                                  <Text style={{marginRight: 25, fontFamily: 'Maven-med', fontSize: wp(3.5), marginTop: 5, color: 'black'}}>{x.item_weight}     x{x.item_count}</Text>
                                              </View>
                                          </View>
                                      </View>: null
                                  })
                              })}
                            </ScrollView>
                            <Text style={{backgroundColor: '#ebebeb', height: 1, marginTop: 25, marginBottom: 20}}></Text>
                            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
                              <View style={{flex: 1, alignItems: 'flex-start'}}>
                                <TouchableOpacity onPress={repeatOrder(item)} activeOpacity={1} >
                                    <Text style={{fontSize: wp(3.5), color: '#249C86', fontFamily: 'Maven-sem'}}>Order Again</Text>
                                </TouchableOpacity>
                              </View>
                              <View>
                                <TouchableOpacity  onPress={() => navigation.navigate('PreviousOrders', {index: index})} activeOpacity={1}>
                                    <Text style={{fontFamily: 'sofia-medium', fontSize: wp(3.5), color: 'black' }}>View &rarr;</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                        </View>
                    )
                }): null
              }
            </ScrollView> */}
        </Animated.ScrollView>

        <Modal
          isVisible={orderReceivedModal}
          backdropColor={'white'}
          backdropOpacity={1}
          animationInTiming={0}
          animationOutTiming={0.1}
          animationOut={'slideOutRight'}        
        >
          <LottieView source={require('../assets/animations/23211-receive-order.json')} autoPlay={true} loop={false} style={{alignSelf: 'center', width: '100%'}} onAnimationFinish={() => setOrderReceivedModal(false)} />
          <Text style={{fontFamily: 'Maven-bold', fontSize: wp(6), textAlign: 'center', position: 'absolute', bottom: 100, alignSelf: 'center', color: 'black'}}>Order delivered successfully !</Text>
        </Modal>
        <Animated.View style={{transform: [{translateY: headerHide}], position: 'absolute', left: 0, right: 0, backgroundColor: '#fcfcfc', elevation: headerShadow ? 5 : 0, paddingTop: 25, shadowColor: "#000", shadowOffset: headerShadow ? {width: 0, height: 2} : {width: 0, height: 0}, shadowOpacity: headerShadow ? 0.25 : 0, shadowRadius: headerShadow ? 3.84 : 0}}>
          <View style={{flexDirection: 'row', alignItems: 'center', paddingRight: 25, paddingTop: 25, paddingBottom: 20}}>
            <View style={{flex: 1}}><View style={{flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start'}} activeOpacity={1}>
              <CopilotStep text={isLogin ? "Manage your profile" : 'Manage your profile'} order={4} name={'Profile'}>
                  <CoPilotTouchableOpacity onPress={() => navigation.navigate('Profile')} style={{elevation: 1, shadowColor: '#fcfcfc', backgroundColor: '#fcfcfc', paddingLeft: 25}} activeOpacity={1}>
                    {isLogin ? userData.image ? <Image source={{uri: userData.image}} style={{width: 40, height: 40, borderRadius: 50}} />: <LottieView source={require('../assets/animations/43110-male-avatar.json')} autoPlay={true} loop={true} style={{width: 60}}  />: <LottieView source={require('../assets/animations/43110-male-avatar.json')} autoPlay={true} loop={true} style={{width: 60}}  />}
                  </CoPilotTouchableOpacity>
              </CopilotStep>
              <Animated.Text style={{fontFamily: 'Maven-bold', fontSize: wp(5), color: '#228f7b', marginLeft: 10, transform: [{translateX: hideGreet}]}}> {isLogin ? userData.name ? moment().format('HH') >= '0' && moment().format('HH') < '12' ? 'Good morning, ' + userData.name.match(/^\S*/) + '.' : moment().format('HH') >= '12' && moment().format('HH') < '17' ? 'Good afternoon, ' + userData.name.match(/^\S*/) + '.' : 'Good evening, ' + userData.name.match(/^\S*/) + '.' : moment().format('HH') >= '0' && moment().format('HH') < '12' ? 'Good morning.': moment().format('HH') >= '12' && moment().format('HH') < '17' ? 'Good afternoon.' : 'Good evening.' : moment().format('HH') >= '0' && moment().format('HH') < '12' ? 'Good morning.': moment().format('HH') >= '12' && moment().format('HH') < '17' ? 'Good afternoon.' : 'Good evening.'}</Animated.Text>
            </View>
            </View>
            <View>
              <TouchableOpacity onPress={() => navigation.navigate('cart')} style={{}} activeOpacity={1}><CustomIcon name="cart" size={wp(6)} color="black" style={{alignSelf: 'center'}} /></TouchableOpacity>
              {cartBadge ? <View style={{position: 'absolute', borderRadius: 50, backgroundColor: '#249c86', width: 15, height: 15, right: -10, top: -8}}>
              </View> : null}
            </View>
            
          </View>
        </Animated.View>
        {/* <View style={{width: '100%', backgroundColor: '#fcfcfc', padding: 5, paddingTop: 10, flexDirection: 'row', alignItems: 'center', elevation: 15, shadowOffset: {width: 0, height: 7}, shadowOpacity: 0.43, shadowRadius: 9.51, shadowColor: '#000'}}>
          <View style={{flex: 1}}>
            <CopilotStep text="View offers of the day and other information " order={1} name={'Home'}>
              <CoPilotTouchableOpacity activeOpacity={1} style={{alignSelf: 'center'}}>
                <CustomIcon name="home-b" size={wp(6)} color="#249c86" style={{alignSelf: 'center'}} />
                <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3), color: '#249c86', textAlign: 'center'}}>Home</Text>
              </CoPilotTouchableOpacity>
            </CopilotStep>
          </View>
          <View style={{flex: 1}}>
            <CopilotStep text="Explore all items and add to cart !" order={2} name={"Store"}>
              <CoPilotTouchableOpacity onPress={() => navigation.navigate('Fruits')} activeOpacity={1} style={{alignSelf: 'center'}}>
                <CustomIcon name="store" size={wp(6)} color="black" style={{alignSelf: 'center'}} />
                <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3), color: 'black', textAlign: 'center'}}>Store</Text>
              </CoPilotTouchableOpacity>
            </CopilotStep>            
          </View>
          <View style={{flex: 1}}>
            <CopilotStep text="Start your subscription" order={3} name={"Recipes"}>
              <CoPilotTouchableOpacity onPress={() => navigation.navigate('Subscription')} activeOpacity={1} style={{alignSelf: 'center'}}>
                <CustomIcon name="subscription" size={wp(6.5)} color="black" style={{alignSelf: 'center'}} />
                <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3), color: 'black', textAlign: 'center'}}>Subscription</Text>
              </CoPilotTouchableOpacity>
            </CopilotStep>
          </View>          
        </View> */}
      </View>
    )
}




const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: hp(0)
    },
    imageContainer: {
      alignSelf: 'center',
      width: '90%',
      height: 700*(screenWidth/1334),
      backgroundColor: 'white',
      borderRadius: 10,
      marginBottom: 30,
      marginTop: 25,
      elevation: 15,
      shadowOffset: {width: 0, height: 7},
      shadowOpacity: 0.43,
      shadowRadius: 9.51,
      shadowColor: '#000'
    },
    image: {
      ...StyleSheet.absoluteFillObject,
      resizeMode: 'cover',
      aspectRatio: 1215/700
    },
    refreshcontainer: {
      flex: 1,
      backgroundColor: 'white'
    },
    refreshscrollview: {
      flex: 1,
      textAlign: 'center',
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      fontFamily: 'Maven-bold',
    },
    modalContent: {
      fontFamily: 'Maven-bold',
      fontSize: wp(6),
      color: 'black',
    },
    map: {
      width: wp(90),
      height: hp(60),
      opacity: 1,
      marginBottom: 1,
    },
    myLocationButton: {
      top: 20,
      right: 10,
      padding: 15,
      elevation: 3,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 50
    },
});


var mapStyle = 
[
  {
      "featureType": "landscape",
      "elementType": "geometry",
      "stylers": [
          {
              "saturation": "-100"
          }
      ]
  },
  {
      "featureType": "poi",
      "elementType": "labels",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "poi",
      "elementType": "labels.text.stroke",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "road",
      "elementType": "labels.text",
      "stylers": [
          {
              "color": "black"
          }
      ]
  },
  {
      "featureType": "road",
      "elementType": "labels.text.stroke",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "road.highway",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "saturation": "-87"
          },
          {
              "lightness": "-40"
          },
          {
              "color": "#ffffff"
          }
      ]
  },
  {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "road.highway.controlled_access",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "color": "#fcfcfc"
          },
          {
              "saturation": "-22"
          },
          {
              "lightness": "-16"
          }
      ]
  },
  {
      "featureType": "road.highway.controlled_access",
      "elementType": "geometry.stroke",
      "stylers": [
          {
              "visibility": "simplified"
          }
      ]
  },
  {
      "featureType": "road.highway.controlled_access",
      "elementType": "labels.icon",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "road.arterial",
      "elementType": "geometry.stroke",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "road.local",
      "elementType": "geometry.stroke",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "water",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "saturation": "-52"
          },
          {
              "hue": "#30e3ca"
          },
          {
              "lightness": "-16"
          }
      ]
  }
]


const StepNumberComponent = ({
  isFirstStep,
  isLastStep,
  currentStep,
  currentStepNumber,
}) => {
  return (
    <View style={{backgroundColor: '#249c86', flex: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderRadius: 14, borderColor: 'white'}}>
      <Text style={{fontFamily: 'sofia-medium', fontSize: wp(4)}}>{currentStepNumber}</Text>
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
      <Text testID="stepDescription" style={{fontFamily: 'Maven-sem', fontSize: wp(3.5), color: 'black'}}>{currentStep.text}</Text>
    </View>
    <View style={{marginTop: 10, flexDirection: 'row', justifyContent: 'flex-end'}}>
      {
        !isLastStep ?
          <TouchableOpacity onPress={handleStop} activeOpacity={1}>
            <Text style={{padding: 10, fontFamily: 'Maven-sem', color: '#249c86'}}>{labels.skip || 'Skip'}</Text>
          </TouchableOpacity>
          : null
      }
      {
        !isFirstStep ?
          <TouchableOpacity onPress={handlePrev} activeOpacity={1}>
            <Text style={{padding: 10, fontFamily: 'Maven-sem', color: '#249c86'}}>{labels.previous || 'Previous'}</Text>
          </TouchableOpacity>
          : null
      }
      {
        !isLastStep ?
          <TouchableOpacity onPress={handleNext} activeOpacity={1}>
            <Text style={{padding: 10, fontFamily: 'Maven-sem', color: '#249c86'}}>{labels.next || 'Next'}</Text>
          </TouchableOpacity> :
          <TouchableOpacity onPress={handleStop} activeOpacity={1}>
            <Text style={{padding: 10, fontFamily: 'Maven-sem', color: '#249c86'}}>{labels.finish || 'Done'}</Text>
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
  tooltipComponent: TooltipComponent
})(Home);