import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, SafeAreaView, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
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
import Payments from './components/payments';
import TermsandConditions from './components/terms_conditions';
import NutritionCalculator from './components/nutrition-calculator';
import { UserContext, PushTokenContext } from './components/context';
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { StripeProvider, initStripe } from '@stripe/stripe-react-native';
import Svg, { Path, Rect, Circle, G, Polygon, LinearGradient as SvgLinearGradient, Defs, Stop, Ellipse, Image as SvgImage, Pattern, Use } from 'react-native-svg';
import NetInfo from "@react-native-community/netinfo";
import AppIntroSlider from 'react-native-app-intro-slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';

const Tab = createBottomTabNavigator();

const Stack = createStackNavigator();

const {width: screenWidth} = Dimensions.get('window');

function ShopStackNavigator({ navigation }) {


  return (
    <Stack.Navigator>
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
      <Stack.Screen name="ActiveOrders" component={ActiveOrders} options={({ navigation }) => ({title: '', headerTransparent: true, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, headerLeft: () => {return <TouchableOpacity onPress={() => navigation.pop()}><Text style={{marginLeft: 25, fontSize: wp(7), fontWeight:'bold'}}>&#x27F5;</Text></TouchableOpacity>}})} />
      <Stack.Screen name="Details" component={Details} options={({ navigation }) => ({title: '', 
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        headerTransparent: true,
        headerLeft: () => {
          return <HeaderBackButton style={{backgroundColor: 'white', borderRadius: 50}} onPress={() => navigation.pop()} />
        },
        })} />
      <Stack.Screen name="Register" component={Register} options={{title: '', cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, headerTransparent: true}} />
      <Stack.Screen name="OtpComponent" component={OtpComponent} options={{title: '', cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, headerTransparent: true}} />
    </Stack.Navigator>
  )
}


function HomeStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={Home} options={{headerShown: false}} />
      <Stack.Screen name="ActiveOrders" component={ActiveOrders} options={({ navigation }) => ({title: '', headerTransparent: true, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, headerLeft: () => {return <TouchableOpacity onPress={() => navigation.pop()}><Text style={{marginLeft: 25, fontSize: wp(7), fontWeight:'bold'}}>&#x27F5;</Text></TouchableOpacity>}})} />
      <Stack.Screen name="HomeProducts" component={HomeProducts} options={({ navigation }) => ({
        title: '',
        headerTransparent: true,
        headerLeft: () => {
          return <TouchableOpacity onPress={() => navigation.pop()}><Text style={{marginLeft: 25, fontSize: wp(7), fontWeight:'bold'}}>&#x27F5;</Text></TouchableOpacity>
        },
      })} />
      <Stack.Screen name="cart" component={Cart} options={({ navigation }) => ({
        title: '',
        headerTransparent: true,
        headerLeft: () => {
          return <TouchableOpacity onPress={() => navigation.pop()}><Text style={{marginLeft: 25, fontSize: wp(7),  fontWeight:'bold'}}>&#x27F5;</Text></TouchableOpacity>
        },
        cardStyleInterpolator: CardStyleInterpolators.forRevealFromBottomAndroid
      })} />
      <Stack.Screen name="Details" component={Details} options={({ navigation }) => ({title: '', 
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        headerTransparent: true,
        headerLeft: () => {
          return <HeaderBackButton style={{backgroundColor: 'white', borderRadius: 50}} onPress={() => navigation.pop()} />
        },
        })} />
        <Stack.Screen name="Profile" component={Profile} options={({ navigation }) => ({title: '', headerTransparent: true, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, headerLeft: () => {return <TouchableOpacity onPress={() => navigation.pop()}><Text style={{marginLeft: 25, fontSize: wp(7), fontWeight:'bold'}}>&#x27F5;</Text></TouchableOpacity>}})} />
        <Stack.Screen name="PreviousOrders" component={PreviousOrders} options={({ navigation }) => ({title: '', headerTransparent: true, headerLeft: () => {return <TouchableOpacity onPress={() => navigation.pop()}><Text style={{marginLeft: 25, fontSize: wp(7), fontWeight:'bold'}}>&#x27F5;</Text></TouchableOpacity>}})} />
        <Stack.Screen name="Reviews" component={Reviews} options={({ navigation }) => ({title: '', headerTransparent: true, headerLeft: () => {return <TouchableOpacity onPress={() => navigation.pop()}><Text style={{marginLeft: 25, fontSize: wp(7), fontWeight:'bold'}}>&#x27F5;</Text></TouchableOpacity>}})} />
        <Stack.Screen name="Register" component={Register} options={{title: '', cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, headerTransparent: true}} />
        <Stack.Screen name="OtpComponent" component={OtpComponent} options={{title: '', cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, headerTransparent: true}} />
        <Stack.Screen name="RecipeDetails" component={RecipeDetails}  options={({ navigation }) => ({title: '', headerTransparent: true, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, headerLeft: () => {return <TouchableOpacity onPress={() => navigation.pop()}><Text style={{marginLeft: 25, fontSize: wp(7), fontWeight:'bold'}}>&#x27F5;</Text></TouchableOpacity>}})} />
        <Stack.Screen name="Payments" component={Payments}  options={({ navigation }) => ({title: '', headerTransparent: true, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, headerLeft: () => {return <TouchableOpacity onPress={() => navigation.pop()}><Text style={{marginLeft: 25, fontSize: wp(7), fontWeight:'bold'}}>&#x27F5;</Text></TouchableOpacity>}})} />
   </Stack.Navigator>
  )
}



function RecipeStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Recipes" component={Recipe} options={{headerShown: false}} />
      <Stack.Screen name="RecipeDetails" component={RecipeDetails}  options={({ navigation }) => ({title: '', headerTransparent: true, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, headerLeft: () => {return <TouchableOpacity onPress={() => navigation.pop()}><Text style={{marginLeft: 25, fontSize: wp(7), fontWeight:'bold'}}>&#x27F5;</Text></TouchableOpacity>}})} />
      <Stack.Screen name="FavRecipe" component={FavRecipe} options={({ navigation }) => ({title: '', headerTransparent: true, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, headerLeft: () => {return <TouchableOpacity onPress={() => navigation.pop()}><Text style={{marginLeft: 25, fontSize: wp(7), fontWeight:'bold'}}>&#x27F5;</Text></TouchableOpacity>}})} />
      <Stack.Screen name="ActiveOrders" component={ActiveOrders} options={({ navigation }) => ({title: '', headerTransparent: true, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, headerLeft: () => {return <TouchableOpacity onPress={() => navigation.pop()}><Text style={{marginLeft: 25, fontSize: wp(7), fontWeight:'bold'}}>&#x27F5;</Text></TouchableOpacity>}})} />
      <Stack.Screen name="HomeProducts" component={HomeProducts} options={({ navigation }) => ({
        title: '',
        headerTransparent: true,
        headerLeft: () => {
          return <HeaderBackButton style={{backgroundColor: 'white', borderRadius: 50}} onPress={() => navigation.pop()} />
        },
      })} />
      <Stack.Screen name="cart" component={Cart} options={({ navigation }) => ({
        headerTransparent: true,
        headerLeft: () => {
          return <HeaderBackButton style={{backgroundColor: 'white', borderRadius: 50}} onPress={() => navigation.pop()} />
        },
        cardStyleInterpolator: CardStyleInterpolators.forRevealFromBottomAndroid
      })} />
      <Stack.Screen name="Details" component={Details} options={({ navigation }) => ({title: '', 
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        headerTransparent: true,
        headerLeft: () => {
          return <HeaderBackButton style={{backgroundColor: 'white', borderRadius: 50}} onPress={() => navigation.pop()} />
        },
        })} />
        <Stack.Screen name="Register" component={Register} options={{title: '', cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, headerTransparent: true}} />
        <Stack.Screen name="OtpComponent" component={OtpComponent} options={{title: '', cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, headerTransparent: true}} />
    </Stack.Navigator>
  )
}


export default function App() {

  const [showRealApp, setShowRealApp] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [errorMsg, setErrormsg] = useState(null);

  const [conLocation, setConLocation] = useState({'name': '', 'district': ''});
  const [conPushToken, setConPushToken] = useState('');

  const [isOffline, setIsOffline] = useState(false);
  const [showIndic, setShowInidc] = useState(false);


  useEffect(() => {
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
          'IcoMoon': require('./assets/fonts/icomoon.ttf'),
        });
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        setErrormsg(error);
      } finally {
        setFontsLoaded(true);
        await SplashScreen.hideAsync();
      }
    }

    load();
  }, []);



  useEffect(() => {
    NetInfo.fetch().then(state => {
      if (!state.isConnected) {
        setIsOffline(true);
      }
    })
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
    (async () => {
      const isFirstTime = await AsyncStorage.getItem('isFirstTime')
      if (isFirstTime === null) {
        setShowRealApp(false);
        await AsyncStorage.setItem('isFirstTime', 'false')
      }
    })().catch(error => console.log(error))
    
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
                <Text style={{fontFamily: 'sf-semi', fontSize: wp(4), textAlign: 'center', marginTop: 25}}>{item.text}</Text>
              </View>
            )
          }}
        />
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
            <Stack.Screen name="Payments" component={Payments}  options={({ navigation }) => ({title: '', headerTransparent: true, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, headerLeft: () => {return <TouchableOpacity onPress={() => navigation.pop()}><Text style={{marginLeft: 25, fontSize: wp(7), fontWeight:'bold'}}>&#x27F5;</Text></TouchableOpacity>}})} />
            <Stack.Screen name="TermsandConditions" component={TermsandConditions}  options={({ navigation }) => ({title: '', headerTransparent: true, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, headerLeft: () => {return <TouchableOpacity onPress={() => navigation.pop()}><Text style={{marginLeft: 25, fontSize: wp(7), fontWeight:'bold'}}>&#x27F5;</Text></TouchableOpacity>}})} />
            <Stack.Screen name="NutritionCalculator" component={NutritionCalculator}  options={({ navigation }) => ({title: '', headerTransparent: true, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, headerLeft: () => {return <TouchableOpacity onPress={() => navigation.pop()}><Text style={{marginLeft: 25, fontSize: wp(7), fontWeight:'bold'}}>&#x27F5;</Text></TouchableOpacity>}})} />
          </Stack.Navigator>
          </UserContext.Provider>
        </PushTokenContext.Provider>
      </NavigationContainer>
    )
}


