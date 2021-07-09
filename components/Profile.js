import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef, useContext } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image, SafeAreaView, ActivityIndicator, Platform, Button, Animated } from 'react-native';
import Modal from 'react-native-modal';
import { FontAwesome5, MaterialIcons, AntDesign, MaterialCommunityIcons, Entypo, FontAwesome, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { ScrollView } from 'react-native';
import LottieView from 'lottie-react-native';
import * as Location from 'expo-location';
import MapView, {Marker, AnimatedRegion, Callout, MarkerAnimated} from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';


export default function Profile({ navigation }) {

  const [mounted, setMounted] = useState(true);

  const [userData, setUserData] = useState({});
  const [respStatus, setRespStatus] = useState(0);
  const [changeName, setChangeName] = useState('');
  const [changeEmail, setChangeEmail] = useState('');
  const [changePhoto, setChangePhoto] = useState(null);
  const [image, setImage] = useState(null);
  const [profileIndic, setProfileIndic] = useState('relative')

  const [error, setError] = useState('');

  const [modalVisible, setModalVisible] = useState(false);

  const [addressModal, setAddressModal] = useState(false);
  const [myAddresses, setMyAddresses] = useState([]);
  const [myAddressesStatus, setMyAddressesStatus] = useState(401);
  const [inputAddress, setInputAddress] = useState('');
  const [inputLocality, setInputLocality] = useState('');
  const [inputCity, setInputCity] = useState('');
  const [inputAddressType, setInputAddressType] = useState('');
  const [indicPos, setIndicPos] = useState('relative');
  

  const [mapDefLocation, setMapDefLocation] = useState({latitude: 17.4217697, longitude: 78.4749875, latitudeDelta: 0.1, longitudeDelta: 0.1});
  const [markerData, setMarkerData] = useState(new AnimatedRegion({ latitude: 17.4217697, longitude: 78.4749875, latitudeDelta:  0.1,
    longitudeDelta: 0.1 }));
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const [errorMsg, setErrormsg] = useState('');

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
            .then(resp => (setUserData(resp.json), setRespStatus(resp.status)))
            .catch(error => console.log(error));
        } else {
          return setRespStatus(401);
        }
      })().catch(error => console.log(error))
    });

  }, [navigation])



  useEffect(() => {
    (async () => {
        const token = await AsyncStorage.getItem('USER_TOKEN')
        if (token) {
            fetch('http://192.168.0.105:8000/store/myaddress/',{
                method: 'GET',
                headers: {
                'Authorization': `Token ${token}`,
                'Content-type': 'application/json'
                }
            })
            .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
            .then(resp => {if (mounted) {setMyAddresses(resp.json), setMyAddressesStatus(resp.status)}})
            .catch(error => console.log(error))
        }
    })().catch(error => setError(error))


    return () => {
        setMounted(false);
    }
    

  }, [])



  const logout = async () => {
    await AsyncStorage.removeItem('USER_TOKEN')
    .then(() => navigation.goBack())
    .then(() => setRespStatus(401))
  }


  const editProfile = async () => {
    setProfileIndic('absolute');
    const token = await AsyncStorage.getItem('USER_TOKEN')
    if (token) {
      fetch('http://192.168.0.105:8000/api/me/',{
            method: 'PATCH',
            headers: {
            'Authorization': `Token ${token}`,
            'Content-type': 'multipart/form-data'
            },
            body: changePhoto
        })
      .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
      .then(resp => {if (resp.status !== 200) {alert('There was an error in uploading image, please try again!')}})
      .then(() => fetch('http://192.168.0.105:8000/api/me/',{
                      method: 'PATCH',
                      headers: {
                      'Authorization': `Token ${token}`,
                      'Content-type': 'application/json'
                      },
                      body: JSON.stringify({name: changeName ? changeName: userData.name, email: changeEmail ? changeEmail: userData.email})
                  })
                .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
                .then(resp => {if (resp.status === 200) 
                                {setUserData(resp.json);
                                setProfileIndic('relative');
                                setModalVisible(false);
                                setChangeName('');
                                setChangeEmail('');
                                setChangePhoto(null);
                                setImage(null);
                                } else {
                                  alert('Please enter valid information!');
                                  setProfileIndic('relative')
                                }
                  })
                .catch(error => console.log(error)))
      .catch(error => console.log(error))
      
    }
  }


  //Address

  const addAddress = async () => {
    const token = await AsyncStorage.getItem('USER_TOKEN')
    if (token) {
        setIndicPos('absolute');
        fetch('http://192.168.0.105:8000/store/myaddress/',{
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-type': 'application/json'
            },
            body: JSON.stringify({ address: inputAddress, locality: inputLocality, city: inputCity, type_of_address: inputAddressType })
        })
        .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => (setMyAddresses(resp.json.data)))
        .then(() => (setMyAddressesStatus(200)))
        .then(() => (setInputAddress(''), setInputLocality(''), setInputAddressType('')))
        .then(() => setIndicPos('relative'))
        .catch(error => console.log(error))
    } else {
        navigation.navigate('Register')
    }
    
  }


  const deleteAddress = (item) => async evt => {
  const token = await AsyncStorage.getItem('USER_TOKEN')
  if (token) {
      fetch('http://192.168.0.105:8000/store/myaddress/',{
          method: 'DELETE',
          headers: {
              'Authorization': `Token ${token}`,
              'Content-type': 'application/json'
          },
          body: JSON.stringify({ address_id: item.id })
      })
      .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
      .then(resp => (setMyAddresses(resp.json.data),  setMyAddressesStatus(resp.status)))
      .catch(error => console.log(error))
  } else {
      navigation.navigate('Register')
  }
  }


  const setDeliveryAdrress = (item) => async evt => {
      const token = await AsyncStorage.getItem('USER_TOKEN')
      if (token) {
          fetch('http://192.168.0.105:8000/store/deliveryaddress/',{
              method: 'POST',
              headers: {
              'Authorization': `Token ${token}`,
              'Content-type': 'application/json'
              },
              body: JSON.stringify({ address_id: item.id })
          })
          .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
          .then(() => setAddressModal(false))
          .then(() => (setInputAddress(''), setInputLocality(''), setInputAddressType('')))
          .catch(error => console.log(error))
      } else {
          navigation.navigate('Register')
      }
  }



  //Location

  const handleRegionChange = async (mapData) => {

    if(mounted){
      markerData.timing({latitude: mapData.latitude, longitude: mapData.longitude, duration: 1, useNativeDriver: false}).start();
      setMapDefLocation({latitude: mapData.latitude, longitude: mapData.longitude, latitudeDelta: mapData.latitudeDelta, longitudeDelta: mapData.longitudeDelta});
    }

    let geolocation = await Location.reverseGeocodeAsync({latitude: mapData.latitude, longitude: mapData.longitude})
    if (mounted) {
      setInputAddress(geolocation[0].name !== 'Unnamed Road' ? geolocation[0].name : '');
      setInputCity(geolocation[0].district ? geolocation[0].district + ', Hyderabad' : geolocation[0].postalCode ? geolocation[0].postalCode + ', Hyderabad' : 'Hyderabad')
    }

  }


  const getLocation = () => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        return;
      }
      
      let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
      mapRef.current.animateToRegion({latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.006, longitudeDelta: 0.006}, 1500)
      
      let geolocation = await Location.reverseGeocodeAsync({latitude: location.coords.latitude, longitude: location.coords.longitude})
      if (mounted) {
        setInputAddress(geolocation[0].name !== 'Unnamed Road' ? geolocation[0].name : '');
        setInputCity(geolocation[0].district ? geolocation[0].district + ', Hyderabad' : geolocation[0].postalCode ? geolocation[0].postalCode + ', Hyderabad' : 'Hyderabad')
        markerData.timing({latitude: location.coords.latitude, longitude: location.coords.longitude, duration: 1, useNativeDriver: false}).start();
        setMapDefLocation({latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.006, longitudeDelta: 0.006}) 
      }

    })().catch(error => setErrormsg(error))
  }


  const choosePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need gallery permissions to make this work!');
    } else {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [2, 2],
        quality: 1,
        base64: false
      });

      if (!result.cancelled) {
        let localuri = result.uri;
        let filename = localuri.split('/').pop();

        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;

        let formData = new FormData();
        formData.append('image', {uri: localuri, name: filename, type})
        setChangePhoto(formData);
        setImage(localuri);
      }
    } 
  }

  




    if (respStatus === 401) { 
      return (
        <View style={styles.container}>
          <Image source={require('../assets/eCommerce_solid.png')} style={{width: '100%', height: '50%'}} />
          <View style={{width: '70%', alignSelf: 'center'}}>
            <Text style={{fontFamily: 'sofia-black', textAlign: 'center', fontSize: wp(12)}}>EatFrut</Text>
            <Text style={{fontFamily: 'sf', marginTop: hp(2), textAlign: 'center', fontSize: wp(3.5)}}>Lorem ipsum, or lipsum as it is sometimes known, is dummy text used in laying out print, graphic or web designs.</Text>
              <TouchableOpacity style={Platform.OS === 'android' ? {alignSelf: 'flex-end', backgroundColor: '#99b898', paddingLeft: 20, paddingRight: 20, paddingBottom: 15, paddingTop: 10, borderRadius: 20, marginTop: hp(10), elevation: 10, shadowOffset: {width: 0.5, height: 2}, shadowRadius: 3, shadowOpacity: 0.3}: {alignSelf: 'flex-end', backgroundColor: '#99b898', paddingLeft: 20, paddingRight: 20, paddingBottom: 15, paddingTop: 15, borderRadius: 20, marginTop: hp(10), elevation: 10, shadowOffset: {width: 0.5, height: 2}, shadowRadius: 3, shadowOpacity: 0.3}} onPress={() => navigation.navigate('Register')} activeOpacity={0.8} >
                <Text style={{fontFamily: 'sofia-bold', fontSize: wp(5)}}>&#x27F6;</Text>
              </TouchableOpacity>
          </View>
        </View>
      )
      
    }


    if (respStatus === 0){
      return (
        <View style={{backgroundColor: 'white', flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <LottieView source={require('../assets/animations/9258-bouncing-fruits.json')} style={{width: 200}} loop={true} autoPlay={true} />
        </View>
      )
    }


    if (respStatus === 200){
      return (
        <View style={styles.container}>
          <View style={{marginLeft: wp(10), flexDirection: 'row', alignItems: 'center'}}>
            <View style={{flex: 1}}>
              {userData.image ? <Image source={{uri: userData.image}} style={{width: wp(35), height: wp(35), borderRadius: 100}} /> : <LottieView source={require('../assets/animations/43110-male-avatar.json')} autoPlay={true} loop={true} style={{height: wp(35)}}  />}
            </View>
            <Text style={{ backgroundColor: '#f0f0f0', height: '80%', width: 1.5}}></Text>
            <View style={{flex: 1}}>
              <TouchableOpacity style={{alignSelf: 'center'}} onPress={() => {setModalVisible(true); userData.name ? setChangeName(userData.name): setChangeName(''); userData.email ? setChangeEmail(userData.email): setChangeEmail('')}} activeOpacity={0.5}>
                <Text style={{fontFamily: 'sf-semi', fontSize: wp(4), marginLeft: 10}}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={{marginLeft: wp(16), marginTop: 10, fontFamily: 'sofia-black', fontSize: wp(7), marginBottom: 50}}>{userData.name ? userData.name.replace(' ', '\n') : ''}</Text>

          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: wp(10)}}>
              <View style={{backgroundColor: '#edf0ff', borderRadius: 10, paddingLeft: wp(2), paddingRight: wp(2), paddingTop: wp(1), paddingBottom: wp(1)}}>
                <FontAwesome5 name="list" size={wp(4)} color="#5e72eb" />
              </View>
              <Text style={{fontFamily: 'sf-semi', fontSize: wp(4.5), marginLeft: 25, flex: 1}}>My Orders</Text>
              <View style={{flex: 1}}>
                <TouchableOpacity style={{alignSelf: 'center', backgroundColor: '#99b898', paddingLeft: wp(2), paddingRight: wp(2), paddingTop: wp(1), paddingBottom: wp(1), borderRadius: 10, elevation: 10, shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.34, shadowRadius: 6.27}} onPress={() => navigation.navigate('PreviousOrders')}>
                  <Text style={{fontFamily: 'sf-semi', fontSize: wp(5)}}>&rarr;</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={{backgroundColor: '#f0f0f0', width: '80%', height: 1, alignSelf: 'center', marginTop: 30}}></Text>

            <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: wp(10), marginTop: 30}}>
              <View style={{backgroundColor: '#f0f0f0', borderRadius: 10, paddingLeft: wp(2), paddingRight: wp(2), paddingTop: wp(1), paddingBottom: wp(1)}}>
                <FontAwesome5 name="address-book" size={wp(4.5)} color="#041b2d" />
              </View>
              <Text style={{fontFamily: 'sf-semi', fontSize: wp(4.5), marginLeft: 25, flex: 1}}>Address Book</Text>
              <View style={{flex: 1}}>
                <TouchableOpacity style={{alignSelf: 'center', backgroundColor: '#99b898', paddingLeft: wp(2), paddingRight: wp(2), paddingTop: wp(1), paddingBottom: wp(1), borderRadius: 10, elevation: 10, shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.34, shadowRadius: 6.27}} onPress={() => setAddressModal(true)}>
                  <Text style={{fontFamily: 'sf-semi', fontSize: wp(5)}}>&rarr;</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={{backgroundColor: '#f0f0f0', width: '80%', height: 1, alignSelf: 'center', marginTop: 30}}></Text>


            <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: wp(10), marginTop: 30}}>
              <View style={{backgroundColor: '#fff2ed', borderRadius: 10, paddingLeft: wp(2), paddingRight: wp(2), paddingTop: wp(1), paddingBottom: wp(1)}}>
                <MaterialCommunityIcons name="clipboard-list-outline" size={wp(4.5)} color="#ff8e61" />
              </View>
              <Text style={{fontFamily: 'sf-semi', fontSize: wp(4.5), marginLeft: 25, flex: 1}}>Terms and Conditions</Text>
              <View style={{flex: 1}}>
                <TouchableOpacity style={{alignSelf: 'center', backgroundColor: '#99b898', paddingLeft: wp(2), paddingRight: wp(2), paddingTop: wp(1), paddingBottom: wp(1), borderRadius: 10, elevation: 10, shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.34, shadowRadius: 6.27}} onPress={() => navigation.navigate('TermsandConditions')}>
                  <Text style={{fontFamily: 'sf-semi', fontSize: wp(5)}}>&rarr;</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={{backgroundColor: '#f0f0f0', width: '80%', height: 1, alignSelf: 'center', marginTop: 30}}></Text>

            <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: wp(10), marginTop: 30}}>
              <View style={{backgroundColor: '#fffade', borderRadius: 10, paddingLeft: wp(2), paddingRight: wp(2), paddingTop: wp(1), paddingBottom: wp(1)}}>
                <FontAwesome5 name="star-half-alt" size={wp(4)} color="#f0c23e" />
              </View>
              <Text style={{fontFamily: 'sf-semi', fontSize: wp(4.5), marginLeft: 25, flex: 1}}>Rate us !</Text>
              <View style={{flex: 1}}>
                <TouchableOpacity style={{alignSelf: 'center', backgroundColor: '#99b898', paddingLeft: wp(2), paddingRight: wp(2), paddingTop: wp(1), paddingBottom: wp(1), borderRadius: 10, elevation: 10, shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.34, shadowRadius: 6.27}}>
                  <Text style={{fontFamily: 'sf-semi', fontSize: wp(5)}}>&rarr;</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={{backgroundColor: '#f0f0f0', width: '80%', height: 1, alignSelf: 'center', marginTop: 30}}></Text>

            <TouchableOpacity style={{marginBottom: 25, flexDirection: 'row', alignItems: 'center', marginLeft: wp(10), marginTop: 50, backgroundColor: '#fff5f7', width: wp(35), padding: 10, borderRadius: 10, justifyContent: 'center'}} onPress={logout}>
              <MaterialCommunityIcons name="logout" size={wp(5)} color="red" />
              <Text style={{fontFamily: 'sf-semi', marginLeft: 15, fontSize: wp(4)}}>Sign Out</Text>
            </TouchableOpacity>
          </ScrollView>
          
          <Modal
            isVisible={modalVisible}
            backdropOpacity={0.5}
            backdropColor={'white'}
            onBackButtonPress={() => (setModalVisible(false))}
            onBackdropPress={() => setModalVisible(false)}
            style={{margin: 0}}
            backdropTransitionInTiming={600}
            backdropTransitionOutTiming={600}
            animationInTiming={600}
            animationOutTiming={600}
            useNativeDriver={true}
          >
            <View style={{flex: 1, backgroundColor: 'white', height: '100%', marginTop: hp(40), elevation: 25, shadowOffset: {width: 0, height: 12}, shadowRadius: 16, shadowOpacity: 0.58, borderTopLeftRadius: 50, borderTopRightRadius: 50}}>
              <ActivityIndicator size={45} color={'#99b898'} style={{position: profileIndic, display: 'none', alignSelf: 'center', top: 0, bottom: 0}}  />
              <ScrollView contentContainerStyle={{paddingBottom: 50, padding: 50, paddingTop: 25}} showsVerticalScrollIndicator={false} bounces={false}>
                <Text style={{fontFamily: 'sofia-black', fontSize: wp(7), marginBottom: 35}}>Edit Profile</Text>
                <TextInput style={{ height: 30, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginBottom: hp(2), fontFamily: 'sf' }} 
                    placeholder={'Name'} value={changeName} onChangeText={(text) => setChangeName(text)} />
                <TextInput style={{ height: 30, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginBottom: hp(2), fontFamily: 'sf' }} 
                    placeholder={'Email'} value={changeEmail} onChangeText={(text) => setChangeEmail(text)} keyboardType={'email-address'} />
                <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
                  {Platform.OS === 'android' ? <MaterialIcons name="monochrome-photos" size={wp(5)} color="#11999e" /> : <Ionicons name="ios-camera-outline" size={wp(5)} color="#11999e" />}
                  <TouchableOpacity style={{flex: 1}} onPress={choosePhoto} activeOpacity={0.5} >
                    <Text style={{fontFamily: 'sf-semi', fontSize: wp(3.5)}}> Edit Photo</Text>
                  </TouchableOpacity>
                  {image && 
                  <View>
                    <Image source={{uri : image}} style={{width: wp(35), height: wp(35), borderRadius: 100}} />
                    <TouchableOpacity style={{position: 'absolute', top: 0, right: 0}} onPress={() => (setImage(null), setChangePhoto(null))}>
                      <Entypo name="circle-with-cross" size={15} color="#F67280" />
                    </TouchableOpacity>
                  </View>
                  }                
                </View>
                {changeName === '' && changeEmail === '' && changePhoto === null ?
                  <TouchableOpacity disabled={true} style={{opacity: 0.2, marginTop: 25, backgroundColor: '#99b898', padding: 10, borderRadius: 10}}>
                    <Text style={{textAlign: 'center', fontFamily: 'sf', fontSize: wp(3)}}>Update</Text>
                  </TouchableOpacity> :
                  <TouchableOpacity disabled={profileIndic === 'absolute' ? true: false} style={profileIndic === 'absolute' ? {opacity: 0.2, marginTop: 25, backgroundColor: '#99b898', padding: 10, borderRadius: 10} : {opacity: 1, marginTop: 25, backgroundColor: '#99b898', padding: 10, borderRadius: 10}} onPress={editProfile} activeOpacity={0.6}>
                    <Text style={{textAlign: 'center', fontFamily: 'sf', fontSize: wp(3)}}>Update</Text>
                  </TouchableOpacity>
                }
              </ScrollView>
            </View>

            
          </Modal>
          
          <Modal
              isVisible={addressModal}
              backdropColor={'white'}
              backdropOpacity={1}
              animationIn={'slideInLeft'}
              animationOut={'slideOutRight'}
              backdropTransitionInTiming={600}
              backdropTransitionOutTiming={600}
              animationInTiming={600}
              animationOutTiming={600}
              useNativeDriver={true}
              style={{margin: 0}}
              onBackButtonPress={() => (setAddressModal(false), setInputAddress(''), setInputLocality(''), setInputAddressType(''))}
          >   
                  <View style={{marginBottom: hp(40)}}>
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        initialRegion={mapDefLocation}
                        showsUserLocation={true}
                        showsMyLocationButton={false}
                        onRegionChangeComplete={handleRegionChange}
                        customMapStyle={mapStyle}
                        onRegionChange={(mapData) => markerData.timing({latitude: mapData.latitude, longitude: mapData.longitude, duration: 0, useNativeDriver: false}).start()}
                      >
                        <MarkerAnimated
                          coordinate={markerData}
                        />
                    </MapView>
                    
                    <TouchableOpacity style={{position: 'absolute', top: 5, left: 5}} onPress={() => (setAddressModal(false), setInputAddress(''), setInputLocality(''), setInputAddressType(''))}>
                        <Entypo name="circle-with-cross" size={wp(6)} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity style={{position: 'absolute', top: 15, right: 5, backgroundColor: '#f0f0f0', padding: wp(2), elevation: 25, shadowOffset: {width: 0.5, height: 2}, shadowRadius: 5, shadowOpacity: 0.3}} onPress={getLocation}>
                      {Platform.OS === 'android' ? <MaterialIcons name="my-location" size={wp(8)} color="black" />: <Ionicons name="ios-location" size={wp(6.5)} color="black" />}
                    </TouchableOpacity>
                  </View>
                  <View style={{backgroundColor: '#fafafa', elevation: 25, shadowOffset: {width: 0, height: 12}, shadowRadius: 16, shadowOpacity: 0.58, borderTopLeftRadius: 50, borderTopRightRadius: 50, flex: 1, paddingTop: 5}}>
                    <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={{padding: 35, paddingBottom: 10}} >
                      <View>
                          <Text style={{fontFamily: 'sofia-bold', fontSize: wp(5), marginBottom: 25}}>Choose delivery address</Text>
                          {myAddressesStatus === 200 ? myAddresses.map((item, index) => {
                              return (
                                  <View key={item.id}>
                                      <TouchableOpacity onPress={setDeliveryAdrress(item)}>
                                          <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                              {item.type_of_address === 'Home' ?  <MaterialIcons name="home" size={wp(4)} color="#249c86" />: <MaterialIcons name="work" size={wp(3)} color="#249c86" />}
                                              <Text style={{fontFamily: 'sf-semi', fontSize: wp(4), color: '#249c86'}}> {item.type_of_address}</Text>
                                          </View>
                                          <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
                                              <Text style={{fontFamily: 'sf', flex: 1, fontSize: wp(3.5)}}>{item.address}, {item.locality}, {item.city}</Text>
                                              <TouchableOpacity onPress={deleteAddress(item)}>
                                                  <Text style={{fontFamily: 'sf', color: 'red'}}>Remove</Text>
                                              </TouchableOpacity>
                                          </View>
                                      </TouchableOpacity>
                                      {myAddresses && index !== (myAddresses.length - 1) ?<Text style={{borderBottomWidth: 1, marginBottom: 20, borderBottomColor: '#f0f0f0'}}></Text> : null}
                                  </View>
                              )
                          }):<Text style={{fontFamily: 'sf'}}>You don't have any saved addresses. Add one now!</Text>}
                      </View>
                      <Text style={{borderBottomWidth: 1, borderBottomColor: '#ebebeb', marginTop: 25}}></Text>
                      <View style={{marginTop: 25}} >
                          <Text style={{fontFamily: 'sofia-bold', fontSize: wp(5), marginBottom: 25}}>Add an address</Text>
                          <Text style={{fontFamily: 'sf-semi', fontSize: wp(3), marginBottom: 25}}>(Use the map to auto-fill)</Text>
                          <ActivityIndicator size={50} color="#99b898" style={{position: indicPos, display: 'none', alignSelf: 'center', top: 0, bottom: 0}} />
                          <TextInput style={{ height: 30, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginBottom: 10, fontFamily: 'sf' }} placeholder={'House/Colony'} value={inputAddress} onChangeText={(text) => setInputAddress(text)} />
                          <TextInput style={{ height: 30, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginBottom: 10, fontFamily: 'sf' }} placeholder={'Road Number, Road Name'} value={inputLocality} onChangeText={(text) => setInputLocality(text)} />
                          <TextInput style={{ height: 30, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginBottom: 10, fontFamily: 'sf' }} placeholder={'City'} value={inputCity} />
                          <View style={{flexDirection: 'row', alignItems: 'center'}}>
                              <TouchableOpacity style={{backgroundColor: inputAddressType === 'Home' ? '#249c86' :'white', padding: 10, borderRadius: 5, borderWidth: 0.3, borderColor: inputAddressType === 'Home' ? '#249c86': 'black'}} onPress={() => setInputAddressType('Home')} activeOpacity={1}>
                                  <Text style={{fontFamily: 'sf', fontSize: wp(3), textAlign: 'center', color: inputAddressType === 'Home' ? 'white': 'black'}}>Home</Text>
                              </TouchableOpacity>
                              <TouchableOpacity style={{marginLeft: 25, backgroundColor: inputAddressType === 'Work' ? '#249c86' :'white', padding: 10, borderRadius: 5, borderWidth: 0.3, borderColor: inputAddressType === 'Work' ? '#249c86': 'black'}} onPress={() => setInputAddressType('Work')} activeOpacity={1}>
                              <Text style={{fontFamily: 'sf', fontSize: wp(3), textAlign: 'center', color: inputAddressType === 'Work' ? 'white': 'black'}}>Work</Text>
                              </TouchableOpacity>
                          </View>
                          {inputAddress === '' || inputLocality === '' || inputCity === '' || inputAddressType === '' ? 
                              <TouchableOpacity style={{marginTop: 25, opacity: 0.2, backgroundColor: '#99b898', padding: 10, borderRadius: 10}} disabled={true}>
                                  <Text style={{fontFamily: 'sf-semi', fontSize: wp(3), textAlign: 'center'}}>Save address</Text>
                              </TouchableOpacity>:
                              <TouchableOpacity style={{marginTop: 25, opacity: 1, backgroundColor: '#99b898', padding: 10, borderRadius: 10}} disabled={false} onPress={addAddress}>
                                  <Text style={{fontFamily: 'sf-semi', fontSize: wp(3), textAlign: 'center'}}>Save address</Text>
                              </TouchableOpacity>
                          }
                      </View>
                    </ScrollView>
                  </View>
                </Modal>
        </View>
      );
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      paddingTop: hp(15)
    },
    map: {
      width: '100%',
      height: hp(50),
      top: 0,
      marginBottom: 1,
      position: 'absolute'
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