import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef, isValidElement, useContext, useLayoutEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Image, Dimensions, TouchableHighlight, Platform, ScrollView, 
  TouchableOpacity, RefreshControl, Animated, Easing, Linking, Button, FlatList, ActivityIndicator } from 'react-native';
import Modal from 'react-native-modal';
import Carousel, {ParallaxImage, Pagination} from 'react-native-snap-carousel';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen'; 
import * as Location from 'expo-location';
import { MaterialCommunityIcons, MaterialIcons, FontAwesome, Ionicons, AntDesign, createIconSetFromIcoMoon, FontAwesome5 } from '@expo/vector-icons';
import { UserContext, PushTokenContext} from './context';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import NetInfo from "@react-native-community/netinfo";
import Svg, { Path, Rect, Circle, G, Polygon, Ellipse } from 'react-native-svg';
import { copilot, walkthroughable, CopilotStep } from "react-native-copilot";
import icoMoonConfig from '../selection.json';



const {width: screenWidth} = Dimensions.get('window');
const screenHeight = Dimensions.get('window').height;


const HEADER_MAX_HEIGHT = 30;
const HEADER_MIN_HEIGHT = 20;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
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
  const [errormsg, setErrormsg] = useState(null);
  const [reversegeolocation, setReversegeolocation] = useState(null);
  const [mapDefLocation, setMapDefLocation] = useState({latitude: 17.4217697, longitude: 78.4749875, latitudeDelta: 0.1, longitudeDelta: 0.1});
  const [markerData, setMarkerData] = useState({latitude: 17.4217697, longitude: 78.4749875 });
  const [locationPermission, setlocationPermission] = useState('Detecting Location....');

  const[loading, setLoading] = useState('true');
  const [refreshing, setRefreshing] = useState(false);
  const[fontsLoaded, setFontsLoaded] = useState(false);
  const [refreshOpacity, setRefreshOpacity] = useState(0);
  
  const [modalVisible, setmodalVisible] = useState(false);
  const [locationModal, setLocationModal] = useState(false);

  const [orderReceivedModal, setOrderReceivedModal] = useState(false);

  const [confirmDisabled, setConfirmDisabled] = useState(false);

  const [scrollViewScroll, setScrollViewScroll] = useState(0);

  const [conPushToken, setConPushToken] = useContext(PushTokenContext);

  const [isLogin, setIsLogin] = useState(true);
  const [userData, setUserData] = useState({});

  const [scrollY] = useState(new Animated.Value(0));
  const [activeOrderLen, setActiveOrderLen] = useState(0);
  const [activeOrders, setActiveOrders] = useState([]);
  const [activeOrderStatus, setActiveOrderStatus] = useState([]);
  const [activeOrderRespStatus, setActiveOrderRespStatus] = useState(0);
  const [activeSlide1, setactiveSlide1] = useState(0);

  const [previousOrderList, setPreviousOrderList] = useState([]);
  const [previousOrderItems, setPreviousOrderItems] = useState([]);
  const [images, setImages] = useState([]);
  const [previousOrderStatus, setPreviousOrderStatus] = useState(0);

  const [recipesList, setRecipesList] = useState([]);
  const [ingredients, setIngredients] = useState([]);


  //Copilot Variables
  
  const CoPilotTouchableOpacity = walkthroughable(TouchableOpacity)
  const CoPilotScrollView = walkthroughable(ScrollView)

  //Component mounts

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

  //Checks for first time and launches co pilot
  useEffect(() => {
    (async () => {
      const isFirstTime = await AsyncStorage.getItem('isFirstTimeHome')
      if (isFirstTime === null && mounted) {
        await AsyncStorage.setItem('isFirstTimeHome', 'false')
        props.start();
      }
    })().catch(error => console.log(error))

    return () => {
      setMounted(false);
      props.copilotEvents.off("stop");
    }
    
  }, [])

  useEffect(() => {
    let timeOut = setTimeout(() => setRefreshOpacity(1), 8000);
    fetch('http://192.168.0.105:8000/store/homebanner/',{
      method: 'GET',
      headers: {
        'Content-type': 'application/json'
      }
    })
    .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
    .then(resp => {if (mounted) {setbannerImages(resp.json)}})
    .catch(error => console.log(error))

    return () => {
      setMounted(false);
      clearTimeout(timeOut);
    }
  }, []);


  useEffect(() => {
    fetch('http://192.168.0.105:8000/store/homeproducts/',{
      method: 'GET',
      headers: {
        'Content-type': 'application/json'
      }
    })
    .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
    .then(resp => {if (mounted) {setHomeProductImages(resp.json)}})
    .catch(error => console.log(error))

    return () => {
      setMounted(false);
    }
  }, []);


  useEffect(() => {
    const getpreviousorders = navigation.addListener('focus', () => {
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
          .then(resp => {if (mounted) {setPreviousOrderList(resp.json.qs), setPreviousOrderItems(resp.json.data), setImages(resp.json.images), setPreviousOrderStatus(resp.status)}})
          .catch(error => console.log(error))
        } else {
          setPreviousOrderList([]);
          setPreviousOrderItems([]);
        }
      })().catch(error => setError(error))
    })
  }, [navigation])




  useEffect(() => {
    const getToken = navigation.addListener('focus', () => {
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
          .then(resp => {if(mounted && resp.status === 200) {
            setActiveOrderLen(resp.json.data.length);
            setActiveOrders(resp.json.data);
            setActiveOrderStatus(resp.json.orderstatus);
            setActiveOrderRespStatus(resp.status);
            } else if (mounted && resp.status === 404) {
              setActiveOrderLen(0);
              setActiveOrders([]);
              setActiveOrderStatus([]);
              setActiveOrderRespStatus(404);
            }
          }) 
          .catch(error => console.log(error))
        } else {
          setActiveOrderLen(0);
        }
      })().catch(error => console.log(error))
    });

    return () => {
      setMounted(false);
    }

  }, [navigation])


  useEffect(() => {
    fetch('http://192.168.0.105:8000/store/recipes/',{
      method: 'GET',
      headers: {
        'Content-type': 'application/json'
      }
    })
    .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
    .then(resp => {if (mounted) {setRecipesList(resp.json.qs), setIngredients(resp.json.ingredients)}})
    .catch(error => console.log(error))

    return () => {
      setMounted(false);
    }
  }, []);


  ////Profile related


  useEffect(() => {
    const getToken = navigation.addListener('focus', () => {
      (async () => {
        const token = await AsyncStorage.getItem('USER_TOKEN')
        if (token) {
          fetch('http://192.168.0.105:8000/api/me/',{
                method: 'GET',
                headers: {
                'Authorization': `Token ${token}`,
                'Content-type': 'application/json'
                }
            })
            .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
            .then(resp => {if (mounted) {setUserData(resp.json)}})
            .then(() => {if (mounted) {setIsLogin(true)}})
            .catch(error => console.log(error));
        } else {
          return setIsLogin(false);
        }
      })().catch(error => console.log(error))
    });

  }, [navigation])



  ///Push Notifications

  useEffect(() => {
    registerPushNotificationPermissions();
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
    .catch(error => console.log(error))
  }


  const savePushToken = async (pushToken) => {
    const token = await AsyncStorage.getItem('USER_TOKEN')
    if (token){
      fetch('http://192.168.0.105:8000/store/pushnotificationtoken/',{
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
      .catch(error => console.log(error))
    } else {
      fetch('http://192.168.0.105:8000/store/pushnotificationtoken/',{
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
      .catch(error => console.log(error))
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

    fetch('http://192.168.0.105:8000/store/homebanner/',{
      method: 'GET',
      headers: {
        'Content-type': 'application/json'
      }
    })
    .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
    .then(resp => setbannerImages(resp.json))
    .then(() => setLoading('false'))
    .catch(error => console.log(error))

    
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
    })().catch(error => setErrormsg(error))
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
    })().catch(error => setErrormsg(error));

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
          containerStyle={{ backgroundColor: '#fafafa', alignSelf: 'flex-end', paddingVertical: 0, marginTop: 2}}
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
  const slideUp = diffClamp.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 120],
    extrapolate: 'clamp',
  })


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
          .then(() => navigation.navigate('cart'))
          .catch(error => console.log(error))
        } else {
          navigation.navigate('Register')
        }
  }


  //Retry

  const retry = async () => {
    setShowInidc(true);
    const token = await AsyncStorage.getItem('USER_TOKEN')
    try {

      //Banners
      fetch('http://192.168.0.105:8000/store/homebanner/',{
        method: 'GET',
        headers: {
          'Content-type': 'application/json'
        }
      })
      .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
      .then(resp => setbannerImages(resp.json))
      .catch(error => console.log(error))

      //Home Products
      fetch('http://192.168.0.105:8000/store/homeproducts/',{
        method: 'GET',
        headers: {
          'Content-type': 'application/json'
        }
      })
      .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
      .then(resp => setHomeProductImages(resp.json))
      .catch(error => console.log(error))

      //Recipes
      fetch('http://192.168.0.105:8000/store/recipes/',{
        method: 'GET',
        headers: {
          'Content-type': 'application/json'
        }
      })
      .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
      .then(resp => (setRecipesList(resp.json.qs), setIngredients(resp.json.ingredients)))
      .catch(error => console.log(error))

      
      if (token) {

        //Previous orders
        fetch('http://192.168.0.105:8000/store/previousorders/',{
            method: 'GET',
            headers: {
            'Authorization': `Token ${token}`,
            'Content-type': 'application/json'
            }
        })
        .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => (setPreviousOrderList(resp.json.qs), setPreviousOrderItems(resp.json.data), setImages(resp.json.images), setPreviousOrderStatus(resp.status)))
        .catch(error => console.log(error))

        //Active orders
        fetch('http://192.168.0.105:8000/store/activeorders/',{
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-type': 'application/json'
            }
        })
        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => {if(resp.status === 200) {
          setActiveOrderLen(resp.json.data.length);
          setActiveOrders(resp.json.data);
          setActiveOrderStatus(resp.json.orderstatus);
          setActiveOrderRespStatus(resp.status);
          } else if (resp.status === 404) {
            setActiveOrderLen(0);
            setActiveOrders([]);
            setActiveOrderStatus([]);
            setActiveOrderRespStatus(404);
          }
        }) 
        .catch(error => console.log(error))


        //Profile
        fetch('http://192.168.0.105:8000/api/me/',{
            method: 'GET',
            headers: {
            'Authorization': `Token ${token}`,
            'Content-type': 'application/json'
            }
        })
        .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => setUserData(resp.json))
        .then(() => setIsLogin(true))
        .catch(error => console.log(error));

        registerPushNotificationPermissions();
      } else {
        registerPushNotificationPermissions();
        setIsLogin(false);
      }

    } catch (error) {
      console.log(error)
    } finally {
      NetInfo.fetch().then(state => {
        if (!state.isConnected) {
          setTimeout(() => setShowInidc(false), 3000)
        }
      })
    }
      
  }

  const getStatus = (item) => {
    if (activeOrderRespStatus === 200) {
        for (var i=0; i < activeOrderStatus.length; i++) {
            if (activeOrderStatus[i].order_number === item.id) {
                return activeOrderStatus[i].order_status;
            }
        }
    }
  }

  
  if (isOffline) {
    return (
      <View style={{flex: 1, backgroundColor: '#fafafa'}}>
        <Image source={require('../assets/offline.png')} style={{width: '95%', height: 1939*(screenWidth/3300), marginTop: wp(30), alignSelf: 'center'}} />
        <View style={{width: '80%', alignSelf: 'center'}}>
          <Text style={{fontFamily: 'sofia-black', fontSize: wp(6), marginTop: 50, textAlign: 'center'}}>Uh oh! Seems like you are disconnected !</Text>
          {!showIndic ? <TouchableOpacity style={{alignSelf: 'center', marginTop: 25}} onPress={retry}>
            <Text style={{fontFamily: 'sofia-bold', fontSize: wp(4), color: '#249c86'}}>RETRY</Text>
          </TouchableOpacity>: <LottieView source={require('../assets/animations/connecting.json')} autoPlay={true} loop={true} style={{height: 100, alignSelf: 'center'}} />}
        </View>
      </View>
    )
  }

  
  
    if (loading == 'true') return (

      <View style={{flex: 1, backgroundColor: '#fafafa'}}>
        <SkeletonPlaceholder>
          <SkeletonPlaceholder.Item height={hp(99)}>
            <SkeletonPlaceholder.Item marginTop={25} padding={25} flexDirection={'row'} alignItems={'center'} justifyContent={'space-between'}>
              <SkeletonPlaceholder.Item
                width={wp(50)}
                height={20}
                borderRadius={5}
              />
              <SkeletonPlaceholder.Item
                width={wp(12)}
                height={wp(12)}
                borderRadius={100}
              />
            </SkeletonPlaceholder.Item>
            <SkeletonPlaceholder.Item padding={25}>
              <SkeletonPlaceholder.Item 
                width={wp(85)}
                height={wp(50)}
                borderRadius={10}
              />
            </SkeletonPlaceholder.Item>
            <SkeletonPlaceholder.Item padding={25}>
              <SkeletonPlaceholder.Item 
                width={wp(40)}
                height={20}
                borderRadius={5}
              />
            </SkeletonPlaceholder.Item>
            <SkeletonPlaceholder.Item padding={25} flexDirection={'row'} alignItems={'center'}>
              <SkeletonPlaceholder.Item 
                width={wp(50)}
                height={wp(50)}
                borderRadius={10}
              />
              <SkeletonPlaceholder.Item 
                width={wp(50)}
                height={wp(50)}
                borderRadius={10}
                marginLeft={wp(10)}
              />
            </SkeletonPlaceholder.Item>
            <SkeletonPlaceholder.Item padding={25}>
              <SkeletonPlaceholder.Item 
                width={wp(40)}
                height={20}
                borderRadius={5}
              />
            </SkeletonPlaceholder.Item>
            <SkeletonPlaceholder.Item padding={25} flexDirection={'row'} alignItems={'center'}>
              <SkeletonPlaceholder.Item 
                width={wp(50)}
                height={wp(60)}
                borderRadius={10}
              />
              <SkeletonPlaceholder.Item 
                width={wp(50)}
                height={wp(60)}
                borderRadius={10}
                marginLeft={wp(10)}
              />
            </SkeletonPlaceholder.Item>
            <SkeletonPlaceholder.Item padding={25}>
              <SkeletonPlaceholder.Item 
                width={wp(40)}
                height={20}
                borderRadius={5}
              />
            </SkeletonPlaceholder.Item>
            <SkeletonPlaceholder.Item padding={25} flexDirection={'row'} alignItems={'center'}>
              <SkeletonPlaceholder.Item 
                width={wp(50)}
                height={wp(60)}
                borderRadius={10}
              />
              <SkeletonPlaceholder.Item 
                width={wp(50)}
                height={wp(60)}
                borderRadius={10}
                marginLeft={wp(10)}
              />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder>
        <View style={{position: 'absolute', bottom: 0, backgroundColor: '#fafafa', width: '100%'}}>
            <SkeletonPlaceholder>
              <SkeletonPlaceholder.Item paddingTop={15} padding={10} flexDirection={'row'} alignItems={'center'}>
                  <SkeletonPlaceholder.Item 
                    width={wp(9)}
                    height={wp(9)}
                    marginLeft={wp(11)}
                    borderRadius={10}
                  />
                  <SkeletonPlaceholder.Item 
                    width={wp(9)}
                    height={wp(9)}
                    marginLeft={wp(23)}
                    borderRadius={10}
                  />
                  <SkeletonPlaceholder.Item 
                    width={wp(9)}
                    height={wp(9)}
                    marginLeft={wp(23)}
                    borderRadius={10}
                  />
              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder>
        </View>
      </View>
    )



    return (
      <View style={{backgroundColor: '#fafafa', flex: 1}}>
        <View style={{backgroundColor: '#fafafa', paddingBottom: 25}}>
          <Text></Text>
        </View>
        <ScrollView
          bounces={false}// for ios 
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {y: scrollY}}}],
            {useNativeDriver: false}
            
          )}
          >
          <StatusBar style="auto" />
          
          <View style={styles.container}>
            <View style={{flexDirection: 'row', alignItems: 'center', padding: 25, paddingTop: 15}}>
              <View style={{flex: 1}}>
                <Text style={{fontFamily: 'sofia-black', fontSize: wp(6), color: '#228f7b'}}> {isLogin ? userData.name ? 'Hello, ' + userData.name + ' !' : 'Hello !': 'Login to place order!'}</Text>
              </View>
              <CopilotStep text={isLogin ? "Manage your profile" : 'Login Here'} order={4} name={'Profile'}>
                <CoPilotTouchableOpacity onPress={() => navigation.navigate('Profile')}>
                  {isLogin ? userData.image ? <Image source={{uri: userData.image}} style={{width: 40, height: 40, borderRadius: 50}} />: <LottieView source={require('../assets/animations/43110-male-avatar.json')} autoPlay={true} loop={true} style={{width: 60}}  />: <FontAwesome5 name="sign-in-alt" size={wp(6)} color="black" />}
                </CoPilotTouchableOpacity>
              </CopilotStep>
            </View>
            <Carousel
              ref={carouselRef}
              sliderWidth={screenWidth}
              itemWidth={screenWidth}
              data={bannerImages}
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
                            spinnerColor={'#99b898'}
                            {...parallaxProps}
                          />
                      </View>
                    </TouchableOpacity>
                  );
              }}
              hasParallaxImages={true}
              keyExtractor={(item, index) => index.toString()}
              onSnapToItem={(index) => setactiveSlide(index)}
              enableMomentum={false}
              autoplay={true}
              autoplayDelay={10}
              autoplayInterval={2500}
            />
            {pagination()}

          </View>
          
          <View style={{backgroundColor: '#fafafa', padding: 25, paddingBottom: 0, marginTop: 50, paddingTop: 0}}>
            <Text style={{fontFamily: 'sofia-black',fontSize: wp(4), color: 'grey'}}>IMMUNITY BOOSTERS</Text>
          </View>
          <View
            style={{paddingLeft: 25, flexDirection: 'row', alignItems: 'center', paddingRight: 25}}
          >
            {homeProductImages.slice(0, 2).map((item, index) => {
              
                return (
                  <View key={item.id} style={{flex: 1, marginTop: 15}}>
                    <TouchableOpacity  onPress={() => navigation.navigate('HomeProducts', {from: item.category})} activeOpacity={0.9}>
                      <View style={{alignSelf: index === 0 ? 'flex-start': 'flex-end', elevation: 5, borderRadius: 10, shadowOffset: {width: 1, height: 1}, shadowRadius: 2, shadowOpacity: 0.5}}>
                        <Image source={{uri: item.image}} style={{width: wp(40), height: wp(40), borderRadius: 10}} />
                        <LinearGradient colors={['rgba(255,255,255,0)', 'black']} start={{x: 0, y:0.3}} style={{position: 'absolute', top: 0, bottom: 0, left: 0,right: 0, borderRadius: 10}} ></LinearGradient>
                        <View style={{position: 'absolute', left: 15, right: 15,bottom: 10}}>
                          <Text style={{fontFamily: 'sofia-bold', fontSize: wp(5),  color: 'white'}}>{item.title}</Text>
                          <Text style={{fontFamily: 'Maison-bold', fontSize: wp(3),  color: 'white', marginTop: 5}} numberOfLines={2}>{item.description}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                )
              
            })}
          </View>
          <View
            style={{paddingLeft: 25, flexDirection: 'row', alignItems: 'center', paddingRight: 25}}
          >
            {homeProductImages.slice(2, 4).map((item, index) => {
              
                return (
                  <View key={item.id} style={{flex: 1, marginTop: 45}}>
                    <TouchableOpacity  onPress={() => navigation.navigate('HomeProducts', {from: item.category})} activeOpacity={0.9}>
                      <View style={{alignSelf: index === 0 ? 'flex-start': 'flex-end', elevation: 5, borderRadius: 10, shadowOffset: {width: 1, height: 1}, shadowRadius: 2, shadowOpacity: 0.5}}>
                        <Image source={{uri: item.image}} style={{width: wp(40), height: wp(40), borderRadius: 10}} />
                        <LinearGradient colors={['rgba(255,255,255,0)', 'black']} start={{x: 0, y:0.2}} style={{position: 'absolute', top: 0, bottom: 0, left: 0,right: 0, borderRadius: 10}} ></LinearGradient>
                        <View style={{position: 'absolute', left: 15, right: 15,bottom: 10}}>
                          <Text style={{fontFamily: 'sofia-bold', fontSize: wp(5),  color: 'white'}}>{item.title}</Text>
                          <Text style={{fontFamily: 'Maison-bold', fontSize: wp(3),  color: 'white', marginTop: 5}} numberOfLines={2}>{item.description}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                )
              
            })}
          </View>
          <View style={{backgroundColor: '#fafafa', padding: 25, paddingTop: 0, paddingBottom: 0, marginTop: 50, flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{fontFamily: 'sofia-black',fontSize: wp(4), color: 'grey', flex: 1}}>RECENT RECIPES</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Recipes')}>
              <Text style={{fontFamily: 'sofia-black',fontSize: wp(4), color: '#249C86'}}>SEE ALL</Text>
            </TouchableOpacity>
          </View>
          <FlatList 
              data={recipesList.slice(0, 2)}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={{paddingTop: 15, paddingLeft: 25, paddingBottom: 25}}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={{backgroundColor: 'white', marginTop: 15, marginBottom: 35, marginRight: 50, padding: 25, borderRadius: 25, elevation: 15, shadowOffset: {width: 0, height: 7}, shadowRadius: 9.51, shadowOpacity: 0.43}} >
                  <View style={{backgroundColor: 'white', borderRadius: 100, width: 125, height: 125, alignSelf: 'center', elevation: 15, shadowOffset: {width: 0, height: 7}, shadowRadius: 9.51, shadowOpacity: 0.43}}>
                    <Image source={{uri: item.image}} style={{width: 125, height: 125, alignSelf: 'center', borderRadius: 100}} />
                  </View>
                  <View style={{flex: 1, flexDirection: 'row', alignItems: 'center',  marginTop: 15, justifyContent: 'center'}}>
                    <MaterialIcons name="local-fire-department" size={wp(4.5)} color="#249C86" />
                    <Text style={{fontFamily: 'Maison-bold', fontSize: wp(4), textAlign: 'center', color: 'grey'}}> {item.value1} </Text>
                    <Text style={{fontFamily: 'Maison-bold', fontSize: wp(5), textAlign: 'center', color: 'grey'}}> | </Text>
                    <Ionicons name="ios-people" size={wp(4)} color="#249c86" />
                    <Text style={{fontFamily: 'Maison-bold', fontSize: wp(4), textAlign: 'center', color: 'grey'}}>  Serves {item.servings}</Text>
                  </View>
                  <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 5}}>
                    <View style={{ flex: 1, alignItems: 'flex-end'}}>
                      <MaterialIcons name="favorite" size={wp(4)} color="#249C86" />
                    </View>
                    <Text style={{fontFamily: 'Maison-bold', fontSize: wp(4), textAlign: 'left', color: 'grey', flex: 1}}> {item.count} </Text>
                  </View>
                  <Text style={{fontFamily: 'sofia-bold', fontSize: wp(5), marginTop: 15}}>{item.name}</Text>
                  <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 25}}>
                    <View style={{flex: 1}}>
                      <TouchableOpacity style={{alignSelf: 'center'}} onPress={() => navigation.navigate('RecipeDetails', {recipe_id: item.id, recipe_ingredients: ingredients})}>
                        <Text style={{fontFamily: 'Maison-bold', fontSize: wp(3.5), color: '#249c86'}}>VIEW RECIPE</Text>
                      </TouchableOpacity>
                    </View>
                </View>
            </View>
              )}
            />
          {previousOrderList !== undefined ? previousOrderList.length > 0 ? <View style={{backgroundColor: '#fafafa', padding: 25, paddingTop: 0, paddingBottom: 0, marginTop: 50, flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{fontFamily: 'sofia-black',fontSize: wp(4), color: 'grey', flex: 1}}>ORDER AGAIN</Text>
            <TouchableOpacity onPress={() => navigation.navigate('PreviousOrders')}>
              <Text style={{fontFamily: 'sofia-black',fontSize: wp(4), color: '#249C86'}}>SEE ALL</Text>
            </TouchableOpacity>
          </View>: null: null}
            <ScrollView bounces={false} showsHorizontalScrollIndicator={false} horizontal={true} contentContainerStyle={{paddingTop: 15, paddingLeft: 25, paddingBottom: 25}}>
                {previousOrderStatus === 200 ? previousOrderList.slice(0, 5).map((item, index) => {
                    return(
                        <View key={item.id} style={{marginRight: 50, backgroundColor: 'white', padding: 25, paddingTop: 15, paddingBottom: 15, borderRadius: 10, elevation: 10, shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.34, shadowRadius: 6.27}}>
                            <View style={{flex: 1}}>
                                <Text style={{fontFamily: 'Maison-bold', fontSize: wp(4)}}>Order #{item.id}</Text>
                                <Text style={{fontFamily: 'Maison-bold', fontSize: wp(3), color: 'grey', marginTop: 2}}>{item.ordereddate}</Text>
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
                                                  <Text style={{fontFamily: 'Maison-bold', fontSize: wp(4), fontWeight: 'bold'}}>{x.item_name} </Text>
                                                  <Text style={{marginRight: 25, fontFamily: 'sf', fontSize: wp(3.5), marginTop: 5}}>{x.item_weight}     x{x.item_count}</Text>
                                              </View>
                                          </View>
                                      </View>: null
                                  })
                              })}
                            </ScrollView>
                            <Text style={{backgroundColor: '#ebebeb', height: 1, marginTop: 25, marginBottom: 20}}></Text>
                            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
                              <View style={{flex: 1, alignItems: 'flex-start'}}>
                                <TouchableOpacity onPress={repeatOrder(item)} activeOpacity={0.5} >
                                    <Text style={{fontSize: wp(3.5), color: '#249C86', fontFamily: 'Maison-bold'}}>Order Again</Text>
                                </TouchableOpacity>
                              </View>
                              <View>
                                <TouchableOpacity  onPress={() => navigation.navigate('PreviousOrders', {index: index})}>
                                    <Text style={{fontFamily: 'sofia-medium', fontSize: wp(3.5) }}>View &rarr;</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                        </View>
                    )
                }): null
              }
            </ScrollView>
        </ScrollView>

        <Modal
          isVisible={orderReceivedModal}
          backdropColor={'white'}
          backdropOpacity={1}
          animationInTiming={0}
          animationOutTiming={0.1}
          animationOut={'slideOutRight'}        
        >
          <LottieView source={require('../assets/animations/23211-receive-order.json')} autoPlay={true} loop={false} style={{alignSelf: 'center', width: '100%'}} onAnimationFinish={() => setOrderReceivedModal(false)} />
          <Text style={{fontFamily: 'sofia-black', fontSize: wp(6), textAlign: 'center', position: 'absolute', bottom: 100, alignSelf: 'center'}}>Order delivered successfully !</Text>
        </Modal>
        <Animated.View style={{backgroundColor: 'rgba(235,235,235,0.95)', padding: 15, paddingLeft: 0, position: 'absolute', bottom: 50, width: '100%', transform: [{translateY: activeOrderLen > 0 ? slideUp : 150}]}}>
          <View>
            {activeOrderRespStatus === 200 ?
              <Carousel 
                itemWidth={wp(95)}
                sliderWidth={screenWidth}
                containerCustomStyle={{alignSelf: 'center'}}
                data={activeOrders}
                onSnapToItem={(index) => setactiveSlide1(index)}
                renderItem={({item, index}) => {
                  return (
                    <View key={item.id} style={{flexDirection: 'row', alignItems: 'center'}}>
                      {getStatus(item) === 'Order Placed' ?  
                        <LottieView source={require('../assets/animations/40101-waiting-pigeon.json')} loop={true} autoPlay={true} style={{width: 50}} />
                        : getStatus(item) === 'Order Confirmed' ? 
                          <LottieView source={require('../assets/animations/64289-jiji.json')} loop={true} autoPlay={true} style={{width: 50}} />
                        : getStatus(item) === 'Out for delivery' ? 
                          <LottieView source={require('../assets/animations/delivery.json')} loop={true} autoPlay={true} style={{width: 70}} />
                        : null}
                      <Text style={{fontFamily: 'sf', textAlign: 'center', fontSize: wp(3), flex: 1, marginLeft: 5, marginRight: 10}}>
                        {getStatus(item) === 'Order Placed' ? 
                          'Order placed successfully ! Please bear with us while we confirm your order !'
                          : getStatus(item) === 'Order Confirmed' ? 
                            'Thanks for your patience. We are packing your healthy box of happiness and will be delivered soon !'
                          : getStatus(item) === 'Out for delivery' ? 
                            'Your order is out for delivery !'
                          : null}
                      </Text>
                      <TouchableOpacity style={{alignSelf: 'center'}} onPress={() => navigation.navigate('ActiveOrders', {activeOrder: item.id})}>
                        <Text style={{fontFamily: 'Maison-bold', fontSize: wp(3.5), color: '#249c86'}}>View</Text>
                      </TouchableOpacity>
                    </View>
                  )
                }}
              />
            : null}
            {activeOrderRespStatus === 200 ? 
              activeOrders.length > 1 ?
              <Pagination
                dotsLength={activeOrders.length}
                activeDotIndex={activeSlide1}
                containerStyle={{alignSelf: 'center', paddingVertical: 0, marginTop: 10, marginBottom: 5}}
                dotStyle={{
                    width: 20,
                    height: 2,
                    borderRadius: 0,
                    backgroundColor: '#249C86'
                }}
                inactiveDotStyle={{
                    // Define styles for inactive dots here
                    backgroundColor: '#fff'
                }}
                inactiveDotOpacity={1}
                inactiveDotScale={1}
              />
            : null
            : null}
          </View>
        </Animated.View>
        <View style={{width: '100%', backgroundColor: '#fafafa', padding: 5, paddingTop: 10, flexDirection: 'row', alignItems: 'center', elevation: 15, shadowOffset: {width: 0, height: 7}, shadowOpacity: 0.43, shadowRadius: 9.51}}>
          <View style={{flex: 1}}>
            <CopilotStep text="View offers of the day and other information " order={1} name={'Home'}>
              <CoPilotTouchableOpacity activeOpacity={1} style={{alignSelf: 'center'}}>
                <CustomIcon name="home" size={wp(6)} color="#249c86" style={{alignSelf: 'center'}} />
                <Text style={{fontFamily: 'Maison-bold', fontSize: wp(3), color: '#249c86', textAlign: 'center'}}>Home</Text>
              </CoPilotTouchableOpacity>
            </CopilotStep>
          </View>
          <View style={{flex: 1}}>
            <CopilotStep text="Explore all items and add to cart !" order={2} name={"Store"}>
              <CoPilotTouchableOpacity onPress={() => navigation.navigate('Fruits')} activeOpacity={1} style={{alignSelf: 'center'}}>
                <CustomIcon name="store-1" size={wp(6)} color="black" style={{alignSelf: 'center'}} />
                <Text style={{fontFamily: 'Maison-bold', fontSize: wp(3), color: 'black', textAlign: 'center'}}>Store</Text>
              </CoPilotTouchableOpacity>
            </CopilotStep>            
          </View>
          <View style={{flex: 1}}>
            <CopilotStep text="View all the recipes here" order={3} name={"Recipes"}>
              <CoPilotTouchableOpacity onPress={() => navigation.navigate('Recipes')} activeOpacity={1} style={{alignSelf: 'center'}}>
                <CustomIcon name="salad-1" size={wp(6.5)} color="black" style={{alignSelf: 'center'}} />
                <Text style={{fontFamily: 'Maison-bold', fontSize: wp(3), color: 'black', textAlign: 'center'}}>Recipes</Text>
              </CoPilotTouchableOpacity>
            </CopilotStep>
          </View>          
        </View>
      </View>
    )
}




const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: hp(0)
    },
    imageContainer: {
      flex: 1,
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
      fontFamily: 'sofia-black',
    },
    modalContent: {
      fontFamily: 'sofia-black',
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
              "color": "#fafafa"
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
      <Text testID="stepDescription" style={{fontFamily: 'sofia-medium', fontSize: wp(4)}}>{currentStep.text}</Text>
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
  tooltipComponent: TooltipComponent
})(Home);