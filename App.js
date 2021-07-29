import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, SafeAreaView, ScrollView, TouchableOpacity, Image, Dimensions, Keyboard, ActivityIndicator } from 'react-native';
import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator, CardStyleInterpolators, HeaderStyleInterpolators, HeaderBackButton } from '@react-navigation/stack';
import { Ionicons, FontAwesome, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen'; 
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import Home from './components/Home';
import HomeProducts from './components/Home-products';
import Profile from './components/Profile';
import Fruits from './components/fruits';
import DriedFruits from './components/driedfruits';
import Exotics from './components/exotics';
import Cart from './components/cart';
import Register from './components/register';
import OtpComponent from './components/otp-component';
import PreviousOrders from './components/previous_orders';
import Reviews from './components/reviews';
import Details from './components/details';
import ActiveOrders from './components/active-orders';
import Recipe from './components/recipe';
import RecipeDetails from './components/recipe-details';
import FavRecipe from './components/fav-recipe';
import TermsandConditions from './components/terms_conditions';
import NutritionCalculator from './components/nutrition-calculator';
import { UserContext, PushTokenContext } from './components/context';
import Svg, { Path, Rect, Circle, G, Polygon, LinearGradient, Defs, Stop, Ellipse } from 'react-native-svg';
import Modal from 'react-native-modal';
import Carousel, {ParallaxImage, Pagination} from 'react-native-snap-carousel';
import Clipboard from 'expo-clipboard';
import NetInfo from "@react-native-community/netinfo";
import AppIntroSlider from 'react-native-app-intro-slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';


const Stack = createStackNavigator();
const {width: screenWidth} = Dimensions.get('window');


export default function App() {

  const [showRealApp, setShowRealApp] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [errorMsg, setErrormsg] = useState(null);

  const [conLocation, setConLocation] = useState({'name': '', 'district': ''});
  const [conPushToken, setConPushToken] = useState('');

  const [isOffline, setIsOffline] = useState(false);
  const [showIndic, setShowInidc] = useState(false);

  //Register
  const [phone, setPhone] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [action, setAction] = useState('');
  const [keyboardOffset, setKeyboardOffset] = useState(hp(45));
  const onKeyboardShow = event => setKeyboardOffset(hp(15));
  const onKeyboardHide = () => setKeyboardOffset(hp(45));
  const keyboardDidShowListener = useRef();
  const keyboardDidHideListener = useRef();

  //Otp component
  const [verifyOTPDisabled, setVerifyOTPDisabled] = useState(false);

  const [counter, setCounter] = useState(60);

  const [changeName, setChangeName] = useState('');
  const [changeEmail, setChangeEmail] = useState('');

  const [OTP, setOTP] = useState('');
  const [OTP1, setOTP1] = useState('');
  const [OTP2, setOTP2] = useState('');
  const [OTP3, setOTP3] = useState('');
  const [OTP4, setOTP4] = useState('');
  const [OTP5, setOTP5] = useState('');
  const [OTP6, setOTP6] = useState('');

  const ti1 = useRef(null);
  const ti2 = useRef(null);
  const ti3 = useRef(null);
  const ti4 = useRef(null);
  const ti5 = useRef(null);
  const ti6 = useRef(null);

  const carouselRef = useRef(null);


  useEffect(() => {
      keyboardDidShowListener.current = Keyboard.addListener('keyboardDidShow', onKeyboardShow);
      keyboardDidHideListener.current = Keyboard.addListener('keyboardDidHide', onKeyboardHide);

      return () => {
          keyboardDidShowListener.current.remove();
          keyboardDidHideListener.current.remove();
      };
  }, []);


  useEffect(() => {
    let mounted = true;
    (async () => {
      const token = await AsyncStorage.getItem('USER_TOKEN')
      if (token === null || token === undefined && mounted) {
        setIsLogin(false);
      }
    })().catch(error => console.log(error))

    return () => mounted = false;
  }, [])


  const SignUp = () => {
    setDisabled(true);
    fetch('http://192.168.0.105:8000/api/send_sms_code/',{
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
    },
    body: JSON.stringify({phone: phone})
    })
    .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
    .then(resp => {
                    if (resp.status === 200) {
                        setAction(resp.json.action);
                        carouselRef.current.snapToNext();
                        setCounter(60);
                    } else if (resp.status === 500) {
                        alert('Provided number is not valid or there was an error in sending OTP. Please check the number.')
                        setDisabled(false);
                    }
                })
    .catch(error => (console.log(error), alert('Provided number is not valid or there was an error in sending OTP. Please check the number.'), setDisabled(false)))
  }

  useEffect(() => {
    let mounted = true;
    const timer = counter > 0 && setInterval(() => {if (mounted) setCounter(counter - 1)}, 1000); 
    return () => {clearInterval(timer), mounted = false}
  }, [counter])


  useEffect(() => {
    let mounted = true;
      if (OTP.toString().length === 6 && mounted) {
          SignIn()
      }

      return () => mounted = false;
  }, [OTP])



  //Sign In
  const SignIn = () => {
      setVerifyOTPDisabled(true);
      fetch('http://192.168.0.105:8000/api/customauth/',{
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
      },
      body: JSON.stringify({username: phone, password: OTP})
      })
      .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
      .then(resp => {return resp.json.token ? saveToken(resp.json.token): (alert('OTP did not match or has expired'), setVerifyOTPDisabled(false))})
      .catch(error => console.log(error))
  }



  const editProfile = async () => {
      const token = await AsyncStorage.getItem('USER_TOKEN')
      if (token) {
        fetch('http://192.168.0.105:8000/api/me/',{
              method: 'PATCH',
              headers: {
              'Authorization': `Token ${token}`,
              'Content-type': 'application/json'
              },
              body: JSON.stringify({name: changeName ? changeName: null, email: changeEmail ? changeEmail: null})
          })
        .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
        .then(() => setIsLogin(true))
        .catch(error => console.log(error))
      }
    }


  const resendOTP = () => {
      setCounter(60);
      fetch('http://192.168.0.105:8000/api/send_sms_code/',{
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
      },
      body: JSON.stringify({phone: phone})
      })
      .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
      .catch(error => console.log(error))
  }




  const saveToken = async (token) => {
      let mounted = true;
      await AsyncStorage.setItem('USER_TOKEN', token);
      if (action === 'create' && mounted) {
        setVerifyOTPDisabled(false)
        carouselRef.current.snapToNext();
      } else if (action === 'Login' && mounted){
        setVerifyOTPDisabled(false)
        setIsLogin(true);
      }
  }


  const copyFromClipboard = async (text) => {
      const text1 = await Clipboard.getStringAsync();
      if (text === text1[0]) {
          setOTP1(text1[0]);
          setOTP2(text1[1]);
          setOTP3(text1[2]);
          setOTP4(text1[3]);
          setOTP5(text1[4]);
          setOTP6(text1[5]);
          setOTP(text1);
      }
  }


  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        await SplashScreen.preventAutoHideAsync();
        await Font.loadAsync({
          'sofia-black' : require('./assets/fonts/Sofia-Pro-Black-Az.otf'),
          'sofia-medium': require('./assets/fonts/Sofia-Pro-Medium-Az.otf'),
          'sofia-bold': require('./assets/fonts/Sofia-Pro-Bold-Az.otf'),
          'sf': require('./assets/fonts/SF-Compact-Text-Medium.otf'),
          'sf-semi': require('./assets/fonts/SF-Compact-Text-Semibold.otf'),
          'pro-light': require('./assets/fonts/Font-Awesome-5-Pro-Light-300.otf'),
          'pro-regular': require('./assets/fonts/Font-Awesome-5-Pro-Regular-400.otf'),
          'pro-solid': require('./assets/fonts/Font-Awesome-5-Pro-Solid-900.otf'),
          'Maison-bold': require('./assets/fonts/MaisonNeue-Bold.ttf'),
          'Maison-medium': require('./assets/fonts/MaisonNeue-Medium.ttf'),
          'IcoMoon': require('./assets/fonts/icomoon.ttf'),
        });
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        if (mounted) {
          setErrormsg(error);
        }
      } finally {
        setFontsLoaded(true);
        await SplashScreen.hideAsync();
      }
    }

    load();
  }, []);



  useEffect(() => {
    let mounted = true;
    NetInfo.fetch().then(state => {
      if (!state.isConnected && mounted) {
        setIsOffline(true);
      }
    })

    return () => mounted = false;
  }, [])


  const check = () => {
    setShowInidc(true);
    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        setIsOffline(false);
        setShowInidc(false);
      } else {
        setTimeout(() => setShowInidc(false), 3000);
      }
    })
  }

  //App Intro Related

  useEffect(() => {
    let mounted = true;
    (async () => {
      const isFirstTime = await AsyncStorage.getItem('isFirstTime')
      if (isFirstTime === null && mounted) {
        setShowRealApp(false);
        await AsyncStorage.setItem('isFirstTime', 'false')
      }
    })().catch(error => console.log(error))

    return () => mounted = false;
    
  }, [])


  const slides = [
    {
      key: 1,
      title: 'Explore',
      text: 'Simple description.',
      image: require('./assets/explore.png'),
      backgroundColor: '#59b2ab',
    },
    {
      key: 2,
      title: 'Delivery at ease !',
      text: 'Simple description for the second step.',
      image: require('./assets/delivery.png'),
      backgroundColor: '#59b2ab',
    }
  ]


  const nextButton = () => {
    return (
      <View style={{width: 50, height: 50, backgroundColor: '#249c86', borderRadius: 50, justifyContent: 'center', alignItems: 'center',}}>
        <Ionicons name="arrow-forward" size={24} color="rgba(255, 255, 255, .9)" />
      </View>
    )
  }


  const doneButton = () => {
    return (
      <View style={{width: 50, height: 50, backgroundColor: '#249c86', borderRadius: 50, justifyContent: 'center', alignItems: 'center',}}>
        <Ionicons name="md-checkmark-sharp" size={24} color="rgba(255, 255, 255, .9)" />
      </View>
    )
  }



  if (!fontsLoaded) {
    return null;
  }

  if (isOffline) {
    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <Image source={require('./assets/offline.png')} style={{width: '95%', height: 1939*(screenWidth/3300), marginTop: wp(30), alignSelf: 'center'}} />
        <View style={{width: '80%', alignSelf: 'center'}}>
          <Text style={{fontFamily: 'sofia-black', fontSize: wp(6), marginTop: 50, textAlign: 'center'}}>Uh oh! Seems like you are disconnected !</Text>
          {!showIndic ? <TouchableOpacity style={{alignSelf: 'center', marginTop: 25}} onPress={check}>
            <Text style={{fontFamily: 'sofia-bold', fontSize: wp(4), color: '#249c86'}}>RETRY</Text>
          </TouchableOpacity>: <LottieView source={require('./assets/animations/connecting.json')} autoPlay={true} loop={true} style={{height: 100, alignSelf: 'center'}} />}
        </View>
      </View>
    )
  }


  if (!showRealApp){
    return (
      <AppIntroSlider  
          data={slides}
          keyExtractor={(item, index) => index.toString()}
          onDone={() => setShowRealApp(true)}
          renderNextButton={nextButton}
          renderDoneButton={doneButton}
          activeDotStyle={{backgroundColor: '#249c86'}}
          renderItem={({item, index}) => {
            return (
              <View style={{paddingTop: 50, flex: 1, backgroundColor: '#f9f9f9'}}>
                <Image source={item.image} style={{width: '90%', height: index === 0 ? 2130*(screenWidth/3420) : 2236*(screenWidth/3766), alignSelf: 'center', marginTop: 50}} />
                <Text style={{fontFamily: 'sofia-bold', fontSize: wp(7), textAlign: 'center', marginTop: 50}}>{item.title}</Text>
                <Text style={{fontFamily: 'sf', fontSize: wp(4), textAlign: 'center', marginTop: 25}}>{item.text}</Text>
              </View>
            )
          }}
        />
    )
  }


  if (!isLogin) {
    return (
      <View style={{flex: 1, backgroundColor: '#fafafa'}}>
        <Carousel 
          ref={carouselRef}
          itemWidth={screenWidth}
          sliderWidth={screenWidth}
          data={['one', 'two', 'three']}
          scrollEnabled={false}
          renderItem={({item, index}) => {
            return (
              index === 0 ? 

              <View style={{flex: 1, paddingTop: hp(15)}}>
                <Image source={require('./assets/register.png')} style={{width: '100%', height: 2185*(screenWidth/3505), alignSelf: 'center'}} />
                <View style={{backgroundColor: 'white', width: '100%', height: '100%', position: 'absolute', top: keyboardOffset, borderTopLeftRadius: 50, borderTopRightRadius: 50, elevation: 25, shadowOffset: {width: 0.5, height: 2}, shadowRadius: 5, shadowOpacity: 0.3}}>
                    <Text style={{fontFamily: 'sofia-black', fontSize: wp(8), paddingTop: wp(8), paddingLeft: wp(15)}} >Enter your{'\n'}mobile number.</Text>
                    <Text style={{fontFamily: 'sf', marginBottom: 35, paddingLeft: wp(15), fontSize: wp(4)}}>We will send you a verification code.</Text>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: hp(5), paddingLeft: wp(15)}}>
                    <Svg width={wp(8)} height={wp(8)} viewBox="0 0 512 512"><Path fill="#FAB446" d="M473.655,88.276H38.345C17.167,88.276,0,105.443,0,126.621v73.471h512v-73.471  C512,105.443,494.833,88.276,473.655,88.276z"/><Path fill="#73AF00" d="M0,385.379c0,21.177,17.167,38.345,38.345,38.345h435.31c21.177,0,38.345-17.167,38.345-38.345  v-73.471H0V385.379z"/><Rect y="200.09" style="fill:#F5F5F5;" width="512" height="111.81"/><G><Path style="fill:#41479B;" d="M256,303.448c-26.164,0-47.448-21.284-47.448-47.448s21.284-47.448,47.448-47.448   s47.448,21.284,47.448,47.448S282.164,303.448,256,303.448z M256,217.379c-21.298,0-38.621,17.323-38.621,38.621   s17.323,38.621,38.621,38.621s38.621-17.323,38.621-38.621S277.298,217.379,256,217.379z"/><Circle fill="#41479B" cx="256" cy="256" r="5.379"/>
                        <Polygon fill="#41479B" points="256,256.807 242.33,258.187 212.966,256.807 212.966,255.193 242.33,253.813 256,255.193     "/>
                        <Polygon fill="#41479B"  points="256,256.807 269.67,258.187 299.034,256.807 299.034,255.193 269.67,253.813 256,255.193     "/>
                        <Polygon fill="#41479B"  points="255.193,256 253.813,242.33 255.193,212.966 256.807,212.966 258.187,242.33 256.807,256     "/>
                        <Polygon fill="#41479B"  points="255.193,256 253.813,269.67 255.193,299.034 256.807,299.034 258.187,269.67 256.807,256     "/>
                        <Polygon fill="#41479B"  points="255.43,256.57 244.788,247.881 225,226.141 226.141,225 247.881,244.788 256.57,255.43  "/>
                        <Polygon fill="#41479B"  points="255.43,256.57 264.119,267.212 285.859,287 287,285.859 267.212,264.119 256.57,255.43  "/>
                        <Polygon fill="#41479B"  points="255.43,255.43 264.119,244.788 285.859,225 287,226.141 267.212,247.881 256.57,256.57  "/>
                        <Polygon fill="#41479B"  points="255.43,255.43 244.788,264.119 225,285.859 226.141,287 247.881,267.212 256.57,256.57  "/>
                        <Polygon fill="#41479B"  points="256.309,256.746 244.207,263.252 216.551,273.214 215.933,271.723 242.534,259.211    255.691,255.254  "/>
                        <Polygon fill="#41479B"  points="256.309,256.746 269.466,252.789 296.067,240.277 295.449,238.786 267.793,248.748    255.691,255.254  "/>
                        <Polygon fill="#41479B"  points="255.254,256.309 248.748,244.207 238.786,216.551 240.277,215.933 252.789,242.534    256.746,255.691  "/>
                        <Polygon fill="#41479B"  points="255.254,256.309 259.211,269.466 271.723,296.067 273.214,295.449 263.252,267.793    256.746,255.691  "/>
                        <Polygon fill="#41479B"  points="255.691,256.746 242.534,252.789 215.933,240.277 216.551,238.786 244.207,248.748    256.309,255.254  "/>
                        <Polygon fill="#41479B"  points="255.691,256.746 267.793,263.252 295.449,273.214 296.067,271.723 269.466,259.211    256.309,255.254  "/>
                        <Polygon fill="#41479B"  points="255.254,255.691 259.211,242.534 271.723,215.933 273.214,216.551 263.252,244.207    256.746,256.309  "/>
                        <Polygon fill="#41479B"  points="255.254,255.691 248.748,267.793 238.786,295.449 240.277,296.067 252.789,269.466    256.746,256.309  "/></G><Circle fill="#F5F5F5" cx="256" cy="256" r="7.256"/><Circle fill="#41479B" cx="256" cy="256" r="4.351"/><G></G><G></G><G></G><G></G><G></G><G></G><G></G><G></G><G></G><G></G><G></G><G></G><G></G><G></G><G></G></Svg>
                        <Text style={{fontFamily: 'Maison-bold', fontSize: wp(4)}}> +91 </Text>
                        <TextInput style={{ height: 30, width: wp(50), marginLeft: 10, fontFamily: 'sf', fontSize: wp(4), borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }} placeholder={'Mobile number'} 
                        onChangeText={(text) => setPhone(text)} keyboardType={'numeric'} maxLength={10} />               
                    </View>
                    {phone.length <= 9 || phone === 0 || !(/\d{10}/g.test(phone)) || disabled ? 
                        <TouchableOpacity disabled={true} style={Platform.OS === 'android' ? {alignSelf: 'flex-end', marginRight: 50, opacity: 0.2, backgroundColor: '#99b898', paddingLeft: 20, paddingRight: 20, paddingBottom: 15, paddingTop: 10, borderRadius: 20, marginTop: hp(7), elevation: 10, shadowOffset: {width: 0.5, height: 2}, shadowRadius: 3, shadowOpacity: 0.3}: {alignSelf: 'flex-end', marginRight: 50, opacity: 0.2, backgroundColor: '#99b898', paddingLeft: 20, paddingRight: 20, paddingBottom: 15, paddingTop: 15, borderRadius: 20, marginTop: hp(7), elevation: 10, shadowOffset: {width: 0.5, height: 2}, shadowRadius: 3, shadowOpacity: 0.3}} >
                            <Text style={{fontFamily: 'Maison-bold', fontSize: wp(5)}}>&#x27F6;</Text>
                        </TouchableOpacity>:
                        <TouchableOpacity style={Platform.OS === 'android' ? {alignSelf: 'flex-end', marginRight: 50, backgroundColor: '#99b898', paddingLeft: 20, paddingRight: 20, paddingBottom: 15, paddingTop: 10, borderRadius: 20, marginTop: hp(7), elevation: 10, shadowOffset: {width: 0.5, height: 2}, shadowRadius: 3, shadowOpacity: 0.3}: {alignSelf: 'flex-end', marginRight: 50, backgroundColor: '#99b898', paddingLeft: 20, paddingRight: 20, paddingBottom: 15, paddingTop: 15, borderRadius: 20, marginTop: hp(7), elevation: 10, shadowOffset: {width: 0.5, height: 2}, shadowRadius: 3, shadowOpacity: 0.3}} onPress={SignUp} activeOpacity={0.8} >
                            <Text style={{opacity: 1, fontFamily: 'Maison-bold', fontSize: wp(5), textAlign: 'center'}}>&#x27F6;</Text>
                        </TouchableOpacity>
                    }
                </View>
                <TouchableOpacity style={{position: 'absolute', top: 45, right: 15}} onPress={() => setIsLogin(true)}>
                  <Text style={{fontFamily: 'Maison-bold', color: '#249c86', fontSize: wp(4)}}>Skip for now</Text>
                </TouchableOpacity>
              </View>
              : index === 1 ?
              <View style={{flex: 1, paddingTop: hp(15)}}>
                <Image source={require('./assets/message-sent.png')} style={{width: '100%', height: 2073*(screenWidth/3381), alignSelf: 'center'}} />
                <View style={{width: '100%', height: '100%', backgroundColor: 'white', position:'absolute', top: keyboardOffset, borderTopLeftRadius: 50, borderTopRightRadius: 50, elevation: 25, shadowOffset: {width: 0.5, height: 2}, shadowRadius: 5, shadowOpacity: 0.3}}>
                    <Text style={{fontFamily: 'Maison-bold', fontSize: wp(4), paddingTop: wp(8), textAlign: 'center'}} >We have sent the verification code to{'\n'}+91 {phone}.</Text>
                    <View style={{flexDirection: 'row', marginTop: 40, alignSelf: 'center', alignItems: 'center'}}>
                    <TextInput ref={ti1} style={{ height: wp(10), textAlign: 'center', fontFamily: 'sf', fontSize: wp(6), marginRight: 15, alignSelf: 'center', width: '10%', borderWidth: 1, borderStyle: 'dotted', borderRadius: 1}}
                            value={OTP1} onChangeText={(text) => {setOTP1(text); if (text) {copyFromClipboard(text), ti2.current.focus()} }} keyboardType={'numeric'} maxLength={1} onSubmitEditing={() => {if (OTP.toString().length === 6) SignIn()}} />
                        <TextInput ref={ti2} style={{ height: wp(10), textAlign: 'center', fontFamily: 'sf', fontSize: wp(6), marginRight: 15, alignSelf: 'center', width: '10%', borderWidth: 1, borderStyle: 'dotted', borderRadius: 1}}
                            value={OTP2} onChangeText={(text) => {setOTP2(text); if (text) {ti3.current.focus()} }} keyboardType={'numeric'} maxLength={1} onSubmitEditing={() => {if (OTP.toString().length === 6) SignIn()}}
                            onKeyPress={({ nativeEvent }) => {nativeEvent.key === 'Backspace' ? ti1.current.focus(): null}} />
                        <TextInput ref={ti3} style={{ height: wp(10), textAlign: 'center', fontFamily: 'sf', fontSize: wp(6), marginRight: 15, alignSelf: 'center', width: '10%', borderWidth: 1, borderStyle: 'dotted', borderRadius: 1}}
                            value={OTP3} onChangeText={(text) => {setOTP3(text); if (text) {ti4.current.focus()} }} keyboardType={'numeric'} maxLength={1} onSubmitEditing={() => {if (OTP.toString().length === 6) SignIn()}}
                            onKeyPress={({ nativeEvent }) => {nativeEvent.key === 'Backspace' ? ti2.current.focus(): null}} />
                        <TextInput ref={ti4} style={{ height: wp(10), textAlign: 'center', fontFamily: 'sf', fontSize: wp(6), marginRight: 15, alignSelf: 'center', width: '10%', borderWidth: 1, borderStyle: 'dotted', borderRadius: 1}}
                            value={OTP4} onChangeText={(text) => {setOTP4(text); if (text) {ti5.current.focus()} }} keyboardType={'numeric'} maxLength={1} onSubmitEditing={() => {if (OTP.toString().length === 6) SignIn()}}
                            onKeyPress={({ nativeEvent }) => {nativeEvent.key === 'Backspace' ? ti3.current.focus(): null}} />
                        <TextInput ref={ti5} style={{ height: wp(10), textAlign: 'center', fontFamily: 'sf', fontSize: wp(6), marginRight: 15, alignSelf: 'center', width: '10%', borderWidth: 1, borderStyle: 'dotted', borderRadius: 1}}
                            value={OTP5} onChangeText={(text) => {setOTP5(text); if (text) {ti6.current.focus()} }} keyboardType={'numeric'} maxLength={1} onSubmitEditing={() => {if (OTP.toString().length === 6) SignIn()}}
                            onKeyPress={({ nativeEvent }) => {nativeEvent.key === 'Backspace' ? ti4.current.focus(): null}} />
                        <TextInput ref={ti6} style={{ height: wp(10), textAlign: 'center', fontFamily: 'sf', fontSize: wp(6), marginRight: 15, alignSelf: 'center', width: '10%', borderWidth: 1, borderStyle: 'dotted', borderRadius: 1}}
                            value={OTP6} onChangeText={(text) => (setOTP6(text), setOTP(OTP1 + OTP2 + OTP3 + OTP4 + OTP5 + text))} keyboardType={'numeric'} maxLength={1} onSubmitEditing={() => {if (OTP.toString().length === 6) SignIn()}}
                            onKeyPress={({ nativeEvent }) => {nativeEvent.key === 'Backspace' ? ti5.current.focus(): null}} />
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'center', alignSelf: 'center', marginTop: 40}}>
                        <Text style={{fontFamily: 'sf', fontSize: wp(4)}}>Didn't received code? </Text>
                        <TouchableOpacity disabled={counter === 0 ? false: true} style={counter === 0 ? {opacity: 1}: {opacity: 0.3}} onPress={resendOTP}>
                            <Text style={{fontFamily: 'Maison-bold', color: '#99b898', textDecorationLine: 'underline', fontSize: wp(3.5)}}> Resend code </Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={{fontFamily: 'sf', fontSize: wp(4), textAlign: 'center'}}> in {counter}s</Text>
                </View>
                
                <Modal isVisible={verifyOTPDisabled} backdropOpacity={0.1} animationIn={'lightSpeedIn'} animationOut={'lightSpeedOut'}>
                    <View style={{alignSelf: 'center', backgroundColor: 'white', padding: 25}}>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <ActivityIndicator size={40} color={'#99b898'}  />
                            <Text style={{fontFamily: 'Maison-bold', marginLeft: 20}}>Verifying code...</Text>
                        </View>
                    </View>
                </Modal>
              </View>

              : 

              <View style={{flex: 1, backgroundColor: '#fafafa', justifyContent: 'center', padding: 25}}>
                  <TouchableOpacity style={{alignSelf: 'flex-end'}} onPress={() => setIsLogin(true)}>
                      <Text style={{fontFamily: 'Maison-bold', textDecorationLine: 'underline', fontSize: wp(3)}}>Do it later &#187;</Text>
                  </TouchableOpacity>
                  <Text style={{fontFamily: 'sofia-black', fontSize: wp(8), marginBottom: 50}}>Enter your{'\n'}Personal Information.</Text>
                  <TextInput style={{ height: 30, borderColor: '#f0f0f0', borderBottomWidth: 2, marginBottom: 25, width: '80%' }} 
                      placeholder={'Name'} onChangeText={(text) => setChangeName(text)} />
                  <TextInput style={{ height: 30, borderColor: '#f0f0f0', borderBottomWidth: 2, marginBottom: 25, width: '80%' }} 
                      placeholder={'Email'} onChangeText={(text) => setChangeEmail(text)} keyboardType={'email-address'} />
                  {changeName === '' && changeEmail === '' ?
                      <TouchableOpacity disabled={true} style={{opacity: 0.2, backgroundColor: '#99b898', padding: 10, paddingLeft: 20, paddingRight: 20, borderRadius: 10, alignSelf: 'flex-start'}}>
                      <Text style={{fontFamily: 'sf'}}>Save</Text>
                      </TouchableOpacity> :
                      <TouchableOpacity disabled={false} style={{opacity: 1, backgroundColor: '#99b898', padding: 10, paddingLeft: 20, paddingRight: 20, borderRadius: 10, alignSelf: 'flex-start'}} onPress={editProfile}>
                      <Text style={{fontFamily: 'sf'}}>Save</Text>
                      </TouchableOpacity>
                  }
              </View>
              
            )
          }}
        />
        
      </View>
    )
  }
  

    return (
      <NavigationContainer>
        <PushTokenContext.Provider value={[conPushToken, setConPushToken]}>
          <UserContext.Provider value={[conLocation, setConLocation]} >
          <Stack.Navigator>
            <Stack.Screen name="Home" component={Home} options={{headerShown: false}} />
            <Stack.Screen name="ActiveOrders" component={ActiveOrders} options={({ navigation }) => ({title: '', headerTransparent: true, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, headerLeft: () => {return <TouchableOpacity onPress={() => navigation.pop()}><Text style={{marginLeft: 25, fontSize: wp(7), fontWeight:'bold'}}>&#x27F5;</Text></TouchableOpacity>}})} />
            <Stack.Screen name="HomeProducts" component={HomeProducts} options={({ navigation }) => ({
              title: '',
              headerTransparent: true,
              headerLeft: () => {
                return <TouchableOpacity onPress={() => navigation.pop()}><Text style={{marginLeft: 25, fontSize: wp(7), fontWeight:'bold'}}>&#x27F5;</Text></TouchableOpacity>
              },
              cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            })} />
            <Stack.Screen name="Fruits" component={Fruits} options={({ navigation }) => ({
              title: '',
              animationEnabled: false,
              headerShown: false
            })} />
            <Stack.Screen name="Dried-Fruits" component={DriedFruits} options={({ navigation }) => ({
              title: '',
              animationEnabled: false,
              headerShown: false
            })} />
            <Stack.Screen name="Exotics" component={Exotics} options={({ navigation }) => ({
              title: '',
              animationEnabled: false,
              headerShown: false
            })} />
            <Stack.Screen name="cart" component={Cart} options={({ navigation }) => ({
              title: '',
              headerTransparent: true,
              headerLeft: () => {
                return <TouchableOpacity onPress={() => navigation.pop()}><Text style={{marginLeft: 25, fontSize: wp(7),  fontWeight:'bold'}}>&#x27F5;</Text></TouchableOpacity>
              },
              cardStyleInterpolator: CardStyleInterpolators.forRevealFromBottomAndroid
            })} />
            <Stack.Screen name="Recipes" component={Recipe} options={{headerShown: false, animationEnabled: false}} />
            <Stack.Screen name="RecipeDetails" component={RecipeDetails}  options={({ navigation }) => ({title: '', headerTransparent: true, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, headerLeft: () => {return <TouchableOpacity onPress={() => navigation.pop()}><Text style={{marginLeft: 25, fontSize: wp(7), fontWeight:'bold'}}>&#x27F5;</Text></TouchableOpacity>}})} />
            <Stack.Screen name="FavRecipe" component={FavRecipe} options={({ navigation }) => ({title: '', headerTransparent: true, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, headerLeft: () => {return <TouchableOpacity onPress={() => navigation.pop()}><Text style={{marginLeft: 25, fontSize: wp(7), fontWeight:'bold'}}>&#x27F5;</Text></TouchableOpacity>}})} />
            <Stack.Screen name="Profile" component={Profile} options={({ navigation }) => ({title: '', headerTransparent: true, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, headerLeft: () => {return <TouchableOpacity onPress={() => navigation.pop()}><Text style={{marginLeft: 25, fontSize: wp(7), fontWeight:'bold'}}>&#x27F5;</Text></TouchableOpacity>}})} />
            <Stack.Screen name="PreviousOrders" component={PreviousOrders} options={({ navigation }) => ({title: '', headerTransparent: true, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, headerLeft: () => {return <TouchableOpacity onPress={() => navigation.pop()}><Text style={{marginLeft: 25, fontSize: wp(7), fontWeight:'bold'}}>&#x27F5;</Text></TouchableOpacity>}})} />
            <Stack.Screen name="Reviews" component={Reviews} options={({ navigation }) => ({title: '', headerTransparent: true, headerLeft: () => {return <TouchableOpacity onPress={() => navigation.pop()}><Text style={{marginLeft: 25, fontSize: wp(7), fontWeight:'bold'}}>&#x27F5;</Text></TouchableOpacity>}})} />
            <Stack.Screen name="Register" component={Register} options={({ navigation }) => ({title: '', headerTransparent: true, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, headerLeft: () => {return <TouchableOpacity onPress={() => navigation.pop()}><Text style={{marginLeft: 25, fontSize: wp(7), fontWeight:'bold'}}>&#x27F5;</Text></TouchableOpacity>}})} />
            <Stack.Screen name="OtpComponent" component={OtpComponent} options={({ navigation }) => ({title: '', headerTransparent: true, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, headerLeft: () => {return <TouchableOpacity onPress={() => navigation.pop()}><Text style={{marginLeft: 25, fontSize: wp(7), fontWeight:'bold'}}>&#x27F5;</Text></TouchableOpacity>}})} />
            <Stack.Screen name="TermsandConditions" component={TermsandConditions}  options={({ navigation }) => ({title: '', headerTransparent: true, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, headerLeft: () => {return <TouchableOpacity onPress={() => navigation.pop()}><Text style={{marginLeft: 25, fontSize: wp(7), fontWeight:'bold'}}>&#x27F5;</Text></TouchableOpacity>}})} />
            <Stack.Screen name="NutritionCalculator" component={NutritionCalculator}  options={({ navigation }) => ({title: '', headerTransparent: true, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, headerLeft: () => {return <TouchableOpacity onPress={() => navigation.pop()}><Text style={{marginLeft: 25, fontSize: wp(7), fontWeight:'bold'}}>&#x27F5;</Text></TouchableOpacity>}})} />
          </Stack.Navigator>
          </UserContext.Provider>
        </PushTokenContext.Provider>
      </NavigationContainer>
    )
}


