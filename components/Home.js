import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef, isValidElement } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Image, Dimensions, TouchableHighlight, Platform, ScrollView, 
  TouchableOpacity, RefreshControl, Animated, Easing } from 'react-native';
import Modal from 'react-native-modal';
import Carousel, {ParallaxImage, Pagination} from 'react-native-snap-carousel';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen'; 
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons'; 
import { FontAwesome5 } from '@expo/vector-icons';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import AppLoading from 'expo-app-loading';
import MapView, {Marker, AnimatedRegion, Callout, MarkerAnimated} from 'react-native-maps';
import Svg, { Path } from 'react-native-svg';

const {width: screenWidth} = Dimensions.get('window');
const screenHeight = Dimensions.get('window').height;


export default function Home(props){

  const [bannerImages, setbannerImages] = useState([]);
  const carouselRef = useRef(null);
  const [activeSlide, setactiveSlide] = useState(0);

  

  const [location, setLocation] = useState(null);
  const [errormsg, setErrormsg] = useState(null);
  const [reversegeolocation, setReversegeolocation] = useState(null);
  const [mapDefLocation, setMapDefLocation] = useState({latitude: 17.4217697, longitude: 78.4749875, latitudeDelta: 0.1, longitudeDelta: 0.1});
  const [markerData, setMarkerData] = useState({latitude: 17.4217697, longitude: 78.4749875 });
  const [locationPermission, setlocationPermission] = useState('Detecting Location....');

  const[loading, setLoading] = useState('true');
  const [refreshing, setRefreshing] = useState(false);
  const[fontsLoaded, setFontsLoaded] = useState(false);
  
  const [modalVisible, setmodalVisible] = useState(false);
  const [locationModal, setLocationModal] = useState(false);

  const [confirmDisabled, setConfirmDisabled] = useState(false);

  const [scrollViewScroll, setScrollViewScroll] = useState(0);







  useEffect(() => {
    (async () => {
      let { status } = await Location.requestPermissionsAsync();
      if (status !== 'granted') {
        setErrormsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
      setLocation(location.coords);

      let geolocation = await Location.reverseGeocodeAsync({latitude: location.coords.latitude, longitude: location.coords.longitude})
      setReversegeolocation(geolocation);
      setMarkerData(location.coords)
      setMapDefLocation({latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.006, longitudeDelta: 0.006})
    })().catch(error => setErrormsg(error))
        .then(() => setlocationPermission('Permission to access location was denied'));
  }, []);




  useEffect(() => {

    fetch('http://192.168.29.234:8000/store/homebanner/',{
      method: 'GET',
      headers: {
        'Content-type': 'application/json'
      }
    })
    .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
    .then(resp => setbannerImages(resp.json))
    .then(() => setLoading('false'))
    .catch(error => console.log(error))
  }, []);


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


  const touched = () => {
    return (console.log('clicked'))
  }




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
      
      setLocationModal(false);
      setmodalVisible(false);
      setMarkerData(location.coords)
      setMapDefLocation({latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.006, longitudeDelta: 0.006})
    })().catch(error => setErrormsg(error))
        .then(() => {setConfirmDisabled(false); setLocationModal(false);});
  }


  const getFonts = () => {
    return Font.loadAsync({
      'sofia-black' : require('../assets/fonts/Sofia-Pro-Black-Az.otf'),
      'sofia-medium': require('../assets/fonts/Sofia-Pro-Medium-Az.otf'),
      'sofia-bold': require('../assets/fonts/Sofia-Pro-Black-Az.otf'),
      'pro-light': require('../assets/fonts/Font-Awesome-5-Pro-Light-300.otf'),
      'pro-regular': require('../assets/fonts/Font-Awesome-5-Pro-Regular-400.otf'),
      'pro-solid': require('../assets/fonts/Font-Awesome-5-Pro-Solid-900.otf'),
    });
  };

  let text = 'w'

  if (location){
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

  
  const handleScroll = () => evt => {
    setScrollViewScroll(evt.nativeEvent.contentOffset.y);
  }

  
  
    if (loading == 'true') return (

      <SafeAreaView style={styles.refreshcontainer}>
        <ScrollView
          contentContainerStyle={styles.refreshscrollview}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
            <Text style={{color: 'black', fontSize: 20}}>Loading....</Text>
            <Text style={{color: 'black', marginTop: 10}}>Pull down to refresh</Text>
        </ScrollView>
      </SafeAreaView>
    )

    if (!fontsLoaded) {
      return <AppLoading
        startAsync={getFonts}
        onFinish={() => setFontsLoaded(true)}
        onError={(error) => setErrormsg(error)}
      />
    }


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
                    <TouchableOpacity onPress={touched} activeOpacity={0.9}>
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
            
          </View>
          
          <View style={{textAlign: 'center', paddingTop: hp(5), justifyContent: 'center', alignItems: 'center', flex: 1, flexDirection: 'row'}}>
             <View style={{flex: 1, alignItems: 'center'}}>
               <View  style={{backgroundColor: 'white', elevation: 5, padding: 10, borderRadius: 15, width: wp(45), alignItems: 'center' }}>
                  <Svg viewBox="0 0 448 512" height="80" width="100" fillOpacity="1">
                    <Path d="M416 96c2.65 0 5.12.62 7.73.78C406.14 76.87 380.69 64 352 64a95.2 95.2 0 0 0-25.15 3.75 111.94 111.94 0 0 0-205.7 0A95.2 95.2 0 0 0 96 64a96 96 0 0 0 0 192h73.37l-87-87a8 8 0 0 1 0-11.31l11.32-11.29a8 8 0 0 1 11.31 0l103 103V104a8 8 0 0 1 8-8h16a8 8 0 0 1 8 8v152h52.54a126.78 126.78 0 0 1-4.54-32A128.14 128.14 0 0 1 416 96zm33.25 38a95.3 95.3 0 0 0-123.37 122h169.29a48.23 48.23 0 0 1 10.57 1.24A95.86 95.86 0 0 0 449.25 134z" fill="#99b898" />
                    <Path d="M384 468.52V480a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32v-11.28C58.27 444.26 6.69 381.24.06 304.87-.74 295.75 7 288 16.17 288h479c9.15 0 16.89 7.72 16.1 16.84C504.66 381 453.4 443.9 384 468.52z" fill="#2a363b" />
                  </Svg>
                  <Text style={{fontFamily: 'sofia-medium', textAlign: 'center', fontSize: wp(4)}}>Immune power</Text>
                </View>
              </View>
              <View style={{flex: 1, alignItems: 'center'}}>
                <View  style={{backgroundColor: 'white', elevation: 5, padding: 10, borderRadius: 15, width: wp(45), alignItems: 'center' }}>
                  <Svg viewBox="0 0 448 512" height="80" width="100" fillOpacity="1">
                    <Path d="M416 96c2.65 0 5.12.62 7.73.78C406.14 76.87 380.69 64 352 64a95.2 95.2 0 0 0-25.15 3.75 111.94 111.94 0 0 0-205.7 0A95.2 95.2 0 0 0 96 64a96 96 0 0 0 0 192h73.37l-87-87a8 8 0 0 1 0-11.31l11.32-11.29a8 8 0 0 1 11.31 0l103 103V104a8 8 0 0 1 8-8h16a8 8 0 0 1 8 8v152h52.54a126.78 126.78 0 0 1-4.54-32A128.14 128.14 0 0 1 416 96zm33.25 38a95.3 95.3 0 0 0-123.37 122h169.29a48.23 48.23 0 0 1 10.57 1.24A95.86 95.86 0 0 0 449.25 134z" fill="#99b898" />
                    <Path d="M384 468.52V480a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32v-11.28C58.27 444.26 6.69 381.24.06 304.87-.74 295.75 7 288 16.17 288h479c9.15 0 16.89 7.72 16.1 16.84C504.66 381 453.4 443.9 384 468.52z" fill="#2a363b" />
                  </Svg>
                  <Text style={{fontFamily: 'sofia-medium', textAlign: 'center', fontSize: wp(4)}}>Immune power</Text>
                </View>
              </View>
          </View>

          <View style={{textAlign: 'center', paddingTop: hp(5), justifyContent: 'center', alignItems: 'center', flex: 1, flexDirection: 'row'}}>
             <View style={{flex: 1, alignItems: 'center'}}>
                <View  style={{backgroundColor: 'white', elevation: 5, padding: 10, borderRadius: 15, width: wp(45), alignItems: 'center' }}>
                  <Svg viewBox="0 0 448 512" height="80" width="100" fillOpacity="1">
                    <Path d="M416 96c2.65 0 5.12.62 7.73.78C406.14 76.87 380.69 64 352 64a95.2 95.2 0 0 0-25.15 3.75 111.94 111.94 0 0 0-205.7 0A95.2 95.2 0 0 0 96 64a96 96 0 0 0 0 192h73.37l-87-87a8 8 0 0 1 0-11.31l11.32-11.29a8 8 0 0 1 11.31 0l103 103V104a8 8 0 0 1 8-8h16a8 8 0 0 1 8 8v152h52.54a126.78 126.78 0 0 1-4.54-32A128.14 128.14 0 0 1 416 96zm33.25 38a95.3 95.3 0 0 0-123.37 122h169.29a48.23 48.23 0 0 1 10.57 1.24A95.86 95.86 0 0 0 449.25 134z" fill="#99b898" />
                    <Path d="M384 468.52V480a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32v-11.28C58.27 444.26 6.69 381.24.06 304.87-.74 295.75 7 288 16.17 288h479c9.15 0 16.89 7.72 16.1 16.84C504.66 381 453.4 443.9 384 468.52z" fill="#2a363b" />
                  </Svg>
                  <Text style={{fontFamily: 'sofia-medium', textAlign: 'center', fontSize: wp(4)}}>Immune power</Text>
                </View>
              </View>
              <View style={{flex: 1, alignItems: 'center'}}>
                <View  style={{backgroundColor: 'white', elevation: 5, padding: 10, borderRadius: 15, width: wp(45), alignItems: 'center' }}>
                  <Svg viewBox="0 0 448 512" height="80" width="100" fillOpacity="1">
                    <Path d="M416 96c2.65 0 5.12.62 7.73.78C406.14 76.87 380.69 64 352 64a95.2 95.2 0 0 0-25.15 3.75 111.94 111.94 0 0 0-205.7 0A95.2 95.2 0 0 0 96 64a96 96 0 0 0 0 192h73.37l-87-87a8 8 0 0 1 0-11.31l11.32-11.29a8 8 0 0 1 11.31 0l103 103V104a8 8 0 0 1 8-8h16a8 8 0 0 1 8 8v152h52.54a126.78 126.78 0 0 1-4.54-32A128.14 128.14 0 0 1 416 96zm33.25 38a95.3 95.3 0 0 0-123.37 122h169.29a48.23 48.23 0 0 1 10.57 1.24A95.86 95.86 0 0 0 449.25 134z" fill="#99b898" />
                    <Path d="M384 468.52V480a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32v-11.28C58.27 444.26 6.69 381.24.06 304.87-.74 295.75 7 288 16.17 288h479c9.15 0 16.89 7.72 16.1 16.84C504.66 381 453.4 443.9 384 468.52z" fill="#2a363b" />
                  </Svg>
                  <Text style={{fontFamily: 'sofia-medium', textAlign: 'center', fontSize: wp(4)}}>Immune power</Text>
                </View>
              </View>
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