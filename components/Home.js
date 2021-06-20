import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef, isValidElement, useContext } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Image, Dimensions, TouchableHighlight, Platform, ScrollView, 
  TouchableOpacity, RefreshControl, Animated, Easing, Linking, Button, FlatList } from 'react-native';
import Modal from 'react-native-modal';
import Carousel, {ParallaxImage, Pagination} from 'react-native-snap-carousel';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen'; 
import * as Location from 'expo-location';
import { MaterialCommunityIcons, MaterialIcons, FontAwesome, Ionicons, AntDesign } from '@expo/vector-icons';
import MapView, {Marker, AnimatedRegion, Callout, MarkerAnimated} from 'react-native-maps';
import Svg, { Path } from 'react-native-svg';
import { UserContext, PushTokenContext} from './context';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';


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



export default function Home({ navigation }){

  const [mounted, setMounted] = useState(true);
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

  const [conLocation, setConLocation] = useContext(UserContext);
  const [conPushToken, setConPushToken] = useContext(PushTokenContext);

  const [isLogin, setIsLogin] = useState(true);
  const [userData, setUserData] = useState({});

  const [scrollY] = useState(new Animated.Value(0));
  const [activeOrderLen, setActiveOrderLen] = useState(0);

  const [previousOrderList, setPreviousOrderList] = useState([]);
  const [previousOrderItems, setPreviousOrderItems] = useState([]);
  const [previousOrderStatus, setPreviousOrderStatus] = useState(0);

  const [recipesList, setRecipesList] = useState([]);
  const [ingredients, setIngredients] = useState([]);

  //component mounts

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
          .then(resp => {if (mounted) {setPreviousOrderList(resp.json.qs), setPreviousOrderItems(resp.json.data), setPreviousOrderStatus(resp.status)}})
          .catch(error => console.log(error))
        }
      })().catch(error => setError(error))
  }, [])


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
            } else if (mounted && resp.status === 404) {
              setActiveOrderLen(0);
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
            .then(resp => setUserData(resp.json))
            .then(() => setIsLogin(true))
            .then(() => {if (mounted) setLoading('false')})
            .catch(error => console.log(error));
        } else {
          return setIsLogin(false), setLoading('false');
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
    .then((pushToken) => {if (mounted) {savePushToken(pushToken), setConPushToken(pushToken)}})
    .catch(error => console.log(error))

    return () => {
      setMounted(false);
    }
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
        if (url === 'Home') {
          navigation.navigate(url);
          setOrderReceivedModal(true);
        }
        navigation.navigate(url);
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
      if (lastNotificationResponse.notification.request.content.data.screen === 'Home'){
        navigation.navigate(lastNotificationResponse.notification.request.content.data.screen);
        setOrderReceivedModal(true)
      } else{
        navigation.navigate(lastNotificationResponse.notification.request.content.data.screen)
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



  useEffect(() => {
    if (loading === 'false' && mounted) {
      setTimeout(() => (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrormsg('Permission to access location was denied');
          setConLocation('rejected');
          return;
        }
        
        setConLocation('granted');
        let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
        setLocation(location.coords);
  
        let geolocation = await Location.reverseGeocodeAsync({latitude: location.coords.latitude, longitude: location.coords.longitude})
        setReversegeolocation(geolocation);
        
        
        setMarkerData(location.coords)
        setMapDefLocation({latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.006, longitudeDelta: 0.006})
      })().catch(error => setErrormsg(error))
          .then(() => setlocationPermission('Permission to access location was denied'))
      , 1000)
    }    

    return () => {
      setMounted(false);
    }
  }, [loading]);



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
          containerStyle={{ backgroundColor: 'white', alignSelf: 'flex-end' }}
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
  const diffClamp = Animated.diffClamp(scrollY, 0, 75)
  const slideUp = diffClamp.interpolate({
    inputRange: [0, 75],
    outputRange: [0, 80],
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
  

  
  
    if (loading == 'true') return (

      <SafeAreaView style={styles.refreshcontainer}>
        <View style={{marginTop: hp(10), paddingBottom: hp(1)}}>
          <SkeletonPlaceholder>
              <SkeletonPlaceholder.Item alignItems="center" justifyContent="center">
                <SkeletonPlaceholder.Item
                  marginTop={6}
                  width={wp(90)}
                  height={hp(2)}
                  borderRadius={4}
                />
              </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder>
        </View>
        <ScrollView bounces={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
      
        </ScrollView>
      </SafeAreaView>
    )



    return (
      <View style={{backgroundColor: 'white', flex: 1}}>
        <View style={{backgroundColor: 'white', paddingBottom: 25}}>
          <Text></Text>
        </View>
        <ScrollView bounces={false}// for ios 
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {y: scrollY}}}],
            {useNativeDriver: false}
            
          )}
          >
          <StatusBar style="auto" />
          
          <View style={styles.container}>
            <View style={{flexDirection: 'row', alignItems: 'center', padding: 25, paddingTop: 0, paddingBottom: 10}}>
              <View style={{flex: 1}}>
              <Text style={{fontFamily: 'sofia-bold', fontSize: wp(5.5), color: '#249C86'}}> {isLogin ? userData.name ? 'Hello, ' + userData.name + ' !' : 'Welcome Back.': 'Login to place order!'}</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                {isLogin ? userData.image ? <Image source={{uri: userData.image}} style={{width: 40, height: 40, borderRadius: 50}} />: <LottieView source={require('../assets/animations/43110-male-avatar.json')} autoPlay={true} loop={true} style={{width: 60}}  />: <LottieView source={require('../assets/animations/10152-login-animation.json')} autoPlay={true} loop={true} style={{width: 30, height: 30}} />}
              </TouchableOpacity>
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
          
          <View style={{backgroundColor: 'white', padding: 25, paddingTop: 0, paddingBottom: 0}}>
            <Text style={{fontFamily: 'sofia-black',fontSize: wp(4), color: 'grey'}}>IMMUNITY BOOSTERS</Text>
          </View>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{paddingLeft: 25}}
          >
            {homeProductImages.map((item) => {
              
                return (
                  <TouchableOpacity key={item.id} style={{ margin: 15, marginLeft: 0, marginRight: 30}} onPress={() => navigation.navigate('HomeProducts', {from: item.category})} activeOpacity={0.9}>
                    <View style={{alignSelf: 'center', elevation: 5, borderRadius: 10, shadowOffset: {width: 1, height: 1}, shadowRadius: 2, shadowOpacity: 0.5}}>
                      <Image source={{uri: item.image}} style={{width: 250, height: 250, borderRadius: 10}} />
                      <LinearGradient colors={['rgba(255,255,255,0)', 'black']} start={{x: 0, y:0.3}} style={{position: 'absolute', top: 0, bottom: 0, left: 0,right: 0, borderRadius: 10}} ></LinearGradient>
                      <View style={{position: 'absolute', left: 25, right: 25,bottom: 0, height: '40%'}}>
                        <Text style={{fontFamily: 'sofia-bold', fontSize: wp(7),  color: 'white'}}>Number One</Text>
                        <Text style={{fontFamily: 'sf-semi', fontSize: wp(3.5),  color: 'white', marginTop: 10}} numberOfLines={2}>It is good for health</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )
              
            })}
          </ScrollView>
          <View style={{backgroundColor: 'white', padding: 25, paddingTop: 0, paddingBottom: 0, marginTop: 50, flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{fontFamily: 'sofia-black',fontSize: wp(4), color: 'grey', flex: 1}}>RECENT RECIPES</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Recipes')}>
              <Text style={{fontFamily: 'sofia-black',fontSize: wp(3.5), color: '#249C86'}}>SEE ALL</Text>
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
                    <Text style={{fontFamily: 'sf-semi', fontSize: wp(4), textAlign: 'center', color: 'grey'}}> {item.value1} </Text>
                    <Text style={{fontFamily: 'sf-semi', fontSize: wp(5), textAlign: 'center', color: 'grey'}}> | </Text>
                    <Ionicons name="ios-people" size={wp(4)} color="#249c86" />
                    <Text style={{fontFamily: 'sf-semi', fontSize: wp(4), textAlign: 'center', color: 'grey'}}>  Serves {item.servings}</Text>
                  </View>
                  <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 5}}>
                    <View style={{ flex: 1, alignItems: 'flex-end'}}>
                      <MaterialIcons name="favorite" size={wp(4)} color="#249C86" />
                    </View>
                    <Text style={{fontFamily: 'sf-semi', fontSize: wp(4), textAlign: 'left', color: 'grey', flex: 1}}> {item.count} </Text>
                  </View>
                  <Text style={{fontFamily: 'sofia-bold', fontSize: wp(6), marginTop: 15}}>{item.name}</Text>
                  <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 25}}>
                    <TouchableOpacity style={{flex: 1}} onPress={() => navigation.navigate('RecipeDetails', {recipe_id: item.id, recipe_ingredients: ingredients})}>
                      <Text style={{textAlign: 'right', fontFamily: 'sf-semi', fontSize: wp(3.5), color: '#249c86'}}>VIEW RECIPE</Text>
                    </TouchableOpacity>
                </View>
            </View>
              )}
            />
          {previousOrderList.length > 0 ? <View style={{backgroundColor: 'white', padding: 25, paddingTop: 0, paddingBottom: 0, marginTop: 50, flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{fontFamily: 'sofia-black',fontSize: wp(4), color: 'grey', flex: 1}}>ORDER AGAIN</Text>
            <TouchableOpacity onPress={() => navigation.navigate('PreviousOrders')}>
              <Text style={{fontFamily: 'sofia-black',fontSize: wp(3.5), color: '#249C86'}}>SEE ALL</Text>
            </TouchableOpacity>
          </View>: null}
            <ScrollView bounces={false} showsHorizontalScrollIndicator={false} horizontal={true} contentContainerStyle={{paddingTop: 15, paddingLeft: 25, paddingBottom: 25}}>
                {previousOrderStatus === 200 ? previousOrderList.slice(0, 5).map(item => {
                    return(
                        <View key={item.id} style={{marginRight: 50, backgroundColor: '#f9f9f9', padding: 25, paddingTop: 15, paddingBottom: 15, borderRadius: 10, elevation: 10, shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.34, shadowRadius: 6.27}}>
                            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
                                <Text style={{flex: 1, fontFamily: 'sofia-black', fontSize: wp(4.5)}}>Order Summary</Text>
                            </View>
                            {previousOrderItems.map(item1 => {
                                return item1.items.map(x => {
                                    return x.id_of_order === item.id ?
                                    <View key={x.id} style={{flexDirection: 'row', alignItems: 'center', marginBottom: 3}}>
                                        <Text style={{flex: 1, fontFamily: 'sf-semi', fontSize: wp(3.5)}}>{x.item_name} </Text>
                                        <Text style={{marginRight: 25, fontFamily: 'sf', fontSize: wp(3.5)}}>{x.item_weight}</Text>
                                        <Text style={{fontFamily: 'sf', fontSize: wp(3.5)}}>x{x.item_count}</Text>
                                    </View>: null
                                })
                            })}
                            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
                                <Text style={{flex: 1, fontFamily: 'sf-semi', fontSize: wp(4)}}>&#8377; {item.total_price}</Text>
                            </View>
                            <Text style={{backgroundColor: '#cccccc', height: 1, marginTop: 15, marginBottom: 20}}></Text>
                            <TouchableOpacity style={{alignSelf: 'center', position: 'absolute', bottom: 10}} onPress={repeatOrder(item)} activeOpacity={0.9} >
                                <Text style={{fontSize: wp(3.5), color: '#249C86', fontFamily: 'sf-semi'}}>Order Again</Text>
                            </TouchableOpacity>
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
        <View style={{position: 'absolute', bottom: 0, width: '100%', height: activeOrderLen > 0 ? 75: 0}}>
          <Animated.View style={{backgroundColor: 'white', padding: 15, elevation: 25, shadowOffset: {width: 0, height: 12}, shadowOpacity: 0.58, shadowRadius: 16, transform: [{translateY: slideUp}]}}>
            {activeOrderLen > 0 ? <LottieView source={require('../assets/animations/64632-order-delivery-to-home.json')} autoPlay={true} loop={true} style={{width: 300, alignSelf: 'center'}} />: null}
            <View style={{flexDirection: 'row', alignItems: 'center', alignSelf: 'center'}}>
              {activeOrderLen === 1 ? <Text style={{fontFamily: 'sf-semi', fontSize: wp(4)}}>You have {activeOrderLen} active order</Text>: <Text style={{fontFamily: 'sf-semi', fontSize: wp(3.5)}}>You have {activeOrderLen} active orders</Text>}
              <TouchableOpacity style={{marginLeft: 10}} onPress={() => navigation.navigate('ActiveOrders')}>
                <Text style={{fontFamily: 'sf-semi', fontSize: wp(4), textDecorationLine: 'underline'}}>View</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
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
              "color": "#f0f0f0"
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