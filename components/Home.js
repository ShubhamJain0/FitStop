import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef, isValidElement, useContext } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Image, Dimensions, TouchableHighlight, Platform, ScrollView, 
  TouchableOpacity, RefreshControl, Animated, Easing, Linking } from 'react-native';
import Modal from 'react-native-modal';
import Carousel, {ParallaxImage, Pagination} from 'react-native-snap-carousel';
import BouncingPreloader from 'react-native-bouncing-preloaders';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen'; 
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons'; 
import { FontAwesome5 } from '@expo/vector-icons';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import MapView, {Marker, AnimatedRegion, Callout, MarkerAnimated} from 'react-native-maps';
import Svg, { Path } from 'react-native-svg';
import { UserContext, PushTokenContext} from './context';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';


const {width: screenWidth} = Dimensions.get('window');
const screenHeight = Dimensions.get('window').height;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});



export default function Home({ navigation }){

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

  const [confirmDisabled, setConfirmDisabled] = useState(false);

  const [scrollViewScroll, setScrollViewScroll] = useState(0);

  const [conLocation, setConLocation] = useContext(UserContext);
  const [conPushToken, setConPushToken] = useContext(PushTokenContext);

  //component mounts

  useEffect(() => {
    let mounted = true;
    let timeOut = setTimeout(() => setRefreshOpacity(1), 8000);
    fetch('http://192.168.29.234:8000/store/homebanner/',{
      method: 'GET',
      headers: {
        'Content-type': 'application/json'
      }
    })
    .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
    .then(resp => {if (mounted) {setbannerImages(resp.json)}})
    .then(() => {if (mounted) setLoading('false')})
    .catch(error => console.log(error))

    return () => {
      mounted = false;
      clearTimeout(timeOut);
    }
  }, []);


  useEffect(() => {
    let mounted = true;
    fetch('http://192.168.29.234:8000/store/homeproducts/',{
      method: 'GET',
      headers: {
        'Content-type': 'application/json'
      }
    })
    .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
    .then(resp => {if (mounted) {setHomeProductImages(resp.json)}})
    .catch(error => console.log(error))

    return () => {
      mounted = false;
    }
  }, []);



  ///Push Notifications

  useEffect(() => {
    registerPushNotificationPermissions();
  }, [])


  const registerPushNotificationPermissions = async () => {
    let mounted = true;
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
      mounted = false;
    }
  }


  const savePushToken = async (pushToken) => {
    const token = await AsyncStorage.getItem('USER_TOKEN')
    if (token){
      fetch('http://192.168.29.234:8000/store/pushnotificationtoken/',{
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
      fetch('http://192.168.29.234:8000/store/pushnotificationtoken/',{
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
        navigation.navigate(url);
      } else {
        null;
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
      navigation.navigate(lastNotificationResponse.notification.request.content.data.screen);
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

    fetch('http://192.168.29.234:8000/store/homebanner/',{
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
    let mounted = true;
    if (loading === 'false' && mounted) {
      setTimeout(() => (async () => {
        let { status } = await Location.requestPermissionsAsync();
        if (status !== 'granted') {
          setErrormsg('Permission to access location was denied');
          return;
        }
  
        let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
        setLocation(location.coords);
  
        let geolocation = await Location.reverseGeocodeAsync({latitude: location.coords.latitude, longitude: location.coords.longitude})
        setReversegeolocation(geolocation);
        setConLocation(geolocation[0]);
        
        setMarkerData(location.coords)
        setMapDefLocation({latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.006, longitudeDelta: 0.006})
      })().catch(error => setErrormsg(error))
          .then(() => setlocationPermission('Permission to access location was denied'))
      , 1000)
    }    

    return () => {
      mounted = false;
    }
  }, [loading]);



  const getLocation = () => {
    (async () => {
      let { status } = await Location.requestPermissionsAsync();
      
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
      setConLocation(geolocation[0]);
      
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
      setConLocation(geolocation[0]);

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
          containerStyle={{ backgroundColor: 'white' }}
          dotStyle={{
              width: 10,
              height: 10,
              borderRadius: 5,
              marginHorizontal: 8,
              backgroundColor: '#11999e'
          }}
          inactiveDotStyle={{
              // Define styles for inactive dots here
              backgroundColor: 'black'
          }}
          inactiveDotOpacity={0.4}
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

  
  const handleScroll = () => evt => {
    setScrollViewScroll(evt.nativeEvent.contentOffset.y);
  }

  
  
    if (loading == 'true') return (

      <SafeAreaView style={styles.refreshcontainer}>
        <ScrollView bounces={false}
          contentContainerStyle={styles.refreshscrollview}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
              <BouncingPreloader
                  icons={[ require('../assets/apple.png'), require('../assets/food.png'), 
                  null, require('../assets/broccoli.png'),
                  require('../assets/nut.png'), require('../assets/mango.png')]}
                  leftRotation="-680deg"
                  rightRotation="360deg"
                  leftDistance={-80}
                  rightDistance={-200}
                  speed={1000}
                  size={40}
              />
            <Text style={{color: 'black', marginTop: 50, opacity: refreshOpacity}}>Pull down to refresh</Text>
        </ScrollView>
      </SafeAreaView>
    )



    return (
      <React.Fragment>

        <View style={Platform.OS == "android" ? {backgroundColor: 'white', elevation: 20} : {backgroundColor: 'white', 
        shadowOffset: {width: 1, height: 1}, shadowColor: '#000', shadowRadius: 7, shadowOpacity: 0.3, borderBottomWidth: 0.29} }>

          <TouchableOpacity onPress={() => setmodalVisible(true)} style={{flexDirection: 'row', marginTop: hp(10), paddingBottom: hp(1)}}>
            {Platform.OS == "android" ? <Ionicons name="location-outline" size={27} color="#11999e" />
              : <FontAwesome5 name="location-arrow" size={25} color="#11999e" />}
            <Text style={{textAlign:'left', fontSize: 18, fontFamily: 'sofia-black'}}  numberOfLines={1} ellipsizeMode='tail'>
              {(location && reversegeolocation) ? reversegeolocation.map((item) =>{
                return <Text key={item} numberOfLines={1} ellipsizeMode='tail'> {item.name}, {item.district ? item.district : <Text>Unnamed Area</Text> }, {item.city ? item.city : <Text>Unnamed</Text>}</Text>
              })
              : <Text>{locationPermission}</Text> } 
            </Text>
          </TouchableOpacity>
          
          <SafeAreaView>
            <Modal 
              isVisible={modalVisible}
              animationIn={'zoomInUp'}
              animationOut={'zoomOutUp'}
              animationInTiming={1000}
              animationOutTiming={1000}
              backdropColor={'white'}
              backdropOpacity={0.95}
              backdropTransitionInTiming={1000}
              backdropTransitionOutTiming={1000}
              useNativeDriver={true}
              statusBarTranslucent={false}
            >
        
                <TouchableOpacity 
                  style={{flexDirection: 'row', borderBottomWidth: 1, paddingBottom: hp(2)}}  
                  onPress={getLocation}
                  >
                  {Platform.OS === 'android' ? <MaterialIcons name="my-location" size={wp(8)} color="#11999e" />: <Ionicons name="ios-location" size={wp(6.5)} color="black" />}
                  <Text style={styles.modalContent}> Get my location &raquo;</Text>
                </TouchableOpacity>
                <Text style={{fontFamily: 'sofia-medium', marginTop: hp(2), fontSize: wp(4.2), color: '#40514e' }}>Or update manually (Drag the marker or move map!)</Text>
                  
                <View style={{alignItems: 'center', marginTop: hp(1)}}>
                  
                    <MapView
                      style={styles.map} 
                      initialRegion={mapDefLocation}
                      showsUserLocation={true}
                      showsMyLocationButton={false}
                      onRegionChangeComplete={handleRegionChange}
                      customMapStyle={mapStyle}
                    >
                      <Marker.Animated draggable
                      coordinate={markerData}
                      onDragEnd={(e) => setLocation(e.nativeEvent.coordinate)}
                      />
                    </MapView>
                  <TouchableOpacity disabled={confirmDisabled} onPress={confirmLocation} 
                    style={confirmDisabled ? {padding: hp(1.6), borderColor: '#40514e', borderWidth: 2, marginTop: hp(4), opacity: 0.1} : {padding: hp(1.6), borderColor: '#40514e', borderWidth: 2, marginTop: hp(4), opacity: 1}}
                  >
                    <Text style={{fontFamily: 'sofia-medium', fontSize: wp(4)}}>Confirm location &rarr;</Text>
                  </TouchableOpacity>
                </View>
            </Modal>
          </SafeAreaView>
          <Modal
            isVisible={locationModal}
            animationIn={'slideInLeft'}
            animationOut={'slideOutRight'}
            animationInTiming={10}
            animationOutTiming={100}
            backdropColor={'white'}
            backdropOpacity={0.1}
            backdropTransitionInTiming={100}
            backdropTransitionOutTiming={100}
            useNativeDriver={true}
            statusBarTranslucent={true}
          >
            <Text style={{textAlign: 'center', fontFamily: 'sofia-black', backgroundColor: 'black', color: 'white', borderRadius: 50}}>Detecting your location....</Text>
          </Modal>

        </View>

        <ScrollView bounces={false}// for ios 
          backgroundColor={'white'} >
          <StatusBar style="auto" />
          
          <View style={styles.container}>
            <TouchableOpacity onPress={goForward}>
              <Text style={styles.text}>go to next slide</Text>
            </TouchableOpacity>
            <Carousel
              ref={carouselRef}
              sliderWidth={screenWidth}
              sliderHeight={screenWidth}
              itemWidth={screenWidth - 60}
              data={bannerImages}
              renderItem={({item, index}, parallaxProps) => {
                  return (
                    <TouchableOpacity onPress={touched(index)} activeOpacity={0.9}>
                      <View style={styles.item}>
                          <ParallaxImage
                            source={{uri: item.image}}
                            containerStyle={styles.imageContainer}
                            style={styles.image}
                            parallaxFactor={0.1}
                            showSpinner={true}
                            spinnerColor={'#11999e'}
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
          
          <View style={{backgroundColor: 'white', marginLeft: wp(2)}}>
            <Text style={{fontFamily: 'sofia-black',fontSize: wp(6), color: '#2a363b'}}>Immunity Boosters</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ActiveOrders')}>
              <Text>now</Text>
            </TouchableOpacity>
          </View>
          
          <View style={{textAlign: 'center', paddingTop: hp(5), justifyContent: 'center', alignItems: 'center', flex: 1, flexDirection: 'row'}}>
            {homeProductImages.map((item) => {
              if (item.category === 'Custom1' || item.category === 'Custom2') {
                return (
                  <View key={item.id} style={{flex: 1, alignItems: 'center'}}>
                    <TouchableOpacity style={{elevation: 5, borderRadius: 50, shadowOffset: {width: 1, height: 1}, shadowRadius: 2, shadowOpacity: 0.5}} onPress={() => navigation.navigate('HomeProducts', {from: item.category})}>
                      <Image source={{uri: item.image}} style={{width: 100, height: 100, borderRadius: 50}} />
                    </TouchableOpacity>
                  </View>
                )
              } else {
                return null
              }
            })}
          </View>

          <View style={{textAlign: 'center', paddingTop: hp(5), justifyContent: 'center', alignItems: 'center', flex: 1, flexDirection: 'row'}}>
            {homeProductImages.map((item) => {
              if (item.category === 'Custom3' || item.category === 'Custom4') {
                return (
                  <View key={item.id} style={{flex: 1, alignItems: 'center'}}>
                    <TouchableOpacity style={{elevation: 5, borderRadius: 50, shadowOffset: {width: 1, height: 1}, shadowRadius: 2, shadowOpacity: 0.5}} onPress={() => navigation.navigate('HomeProducts', {from: item.category})}>
                      <Image source={{uri: item.image}} style={{width: 100, height: 100, borderRadius: 50}} />
                    </TouchableOpacity>
                  </View>
                )
              } else {
                return null
              }
            })}
          </View>
        </ScrollView>
      </React.Fragment>
    )
}




const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: hp(5),
    },
    item: {
      width: screenWidth -60,
      height: wp(75),
    },
    imageContainer: {
      flex: 1,
      marginBottom: Platform.select({ios: 0, android: 1}), // Prevent a random Android rendering issue
      backgroundColor: 'white',
      borderRadius: 8,
    },
    image: {
      ...StyleSheet.absoluteFillObject,
      resizeMode: 'cover',
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