import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';
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
import Confirm from './components/confirm';
import Auth from './components/login';
import Register from './components/register';
import Reset from './components/reset_pass';
import ResetPassForm from './components/new_pass';
import PreviousOrders from './components/previous_orders';
import Reviews from './components/reviews';
import Details from './components/details';
import ActiveOrders from './components/active-orders';
import { UserContext, PushTokenContext } from './components/context';

const Tab = createBottomTabNavigator();

const Stack = createStackNavigator();


function ProfileStackNavigator({ navigation }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={Profile} options={{headerShown: false}} />
      <Stack.Screen name="PreviousOrders" component={PreviousOrders} options={{title: 'Your Orders'}} />
      <Stack.Screen name="Reviews" component={Reviews} options={{title: ''}} />
      <Stack.Screen name="Auth" component={Auth} options={{title: 'Login', cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS}} />
      <Stack.Screen name="Register" component={Register} options={{title: 'Sign Up', cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}} />
      <Stack.Screen name="Reset" component={Reset} options={{title: 'Reset Password', cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}} />
      <Stack.Screen name="ResetPassForm" component={ResetPassForm} options={{title: 'Reset Password', headerLeft: null, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}} />
    </Stack.Navigator>
  )
}



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
        headerRight: () => (
          <MaterialCommunityIcons name={'cart'} size={35} />
        ),
        cardStyleInterpolator: CardStyleInterpolators.forRevealFromBottomAndroid
      })} />
      <Stack.Screen name="confirm" component={Confirm} options={{
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
      }} />
      <Stack.Screen name="ActiveOrders" component={ActiveOrders} options={{
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
      }} />
      <Stack.Screen name="Details" component={Details} options={({ navigation }) => ({title: '', 
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        headerTransparent: true,
        headerLeft: () => {
          return <HeaderBackButton style={{backgroundColor: 'white', borderRadius: 50}} onPress={() => navigation.pop()} />
        },
        })} />
      <Stack.Screen name="Auth" component={Auth} options={{title: 'Login', cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS}} />
      <Stack.Screen name="Register" component={Register} options={{title: 'Sign Up', cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}} />
      <Stack.Screen name="Reset" component={Reset} options={{title: 'Reset Password', cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}} />
      <Stack.Screen name="ResetPassForm" component={ResetPassForm} options={{title: 'Reset Password', headerLeft: null, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}} />
    </Stack.Navigator>
  )
}


function DriedFruitsStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Dried-Fruits" component={DriedFruits} options={({ navigation }) => ({
        title: '',
        headerRight: () => (
          <MaterialCommunityIcons name={'cart-outline'} size={35} onPress={() => navigation.navigate('cart')} />
        )
      })} />
      <Stack.Screen name="cart" component={Cart} options={({ navigation }) => ({
        headerRight: () => (
          <MaterialCommunityIcons name={'cart'} size={35} />
        )
      })} />
      <Stack.Screen name="confirm" component={Confirm} />
    </Stack.Navigator>
  )
}



function HomeStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={Home} options={{headerShown: false}} />
      <Stack.Screen name="ActiveOrders" component={ActiveOrders} options={{
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
      }} />
      <Stack.Screen name="HomeProducts" component={HomeProducts} options={({ navigation }) => ({
        title: '',
        headerRight: () => (
          <MaterialCommunityIcons name={'cart-outline'} size={35} onPress={() => navigation.navigate('cart')} />
        )
      })} />
      <Stack.Screen name="cart" component={Cart} options={({ navigation }) => ({
        headerRight: () => (
          <MaterialCommunityIcons name={'cart'} size={35} />
        )
      })} />
      <Stack.Screen name="confirm" component={Confirm} />
      <Stack.Screen name="Details" component={Details} options={({ navigation }) => ({title: '', 
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        headerTransparent: true,
        headerLeft: () => {
          return <HeaderBackButton style={{backgroundColor: 'white', borderRadius: 50}} onPress={() => navigation.pop()} />
        },
        })} />
        <Stack.Screen name="Auth" component={Auth} options={{title: 'Login', cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS}} />
        <Stack.Screen name="Register" component={Register} options={{title: 'Sign Up', cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}} />
        <Stack.Screen name="Reset" component={Reset} options={{title: 'Reset Password', cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}} />
        <Stack.Screen name="ResetPassForm" component={ResetPassForm} options={{title: 'Reset Password', headerLeft: null, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}} />
    </Stack.Navigator>
  )
}



export default function App() {

  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [errorMsg, setErrormsg] = useState(null);

  const [conLocation, setConLocation] = useState({'name': '', 'district': ''});
  const [conPushToken, setConPushToken] = useState([]);


  useEffect(() => {
    async function load() {
      try {
      
        await SplashScreen.preventAutoHideAsync();
        await Font.loadAsync({
          'sofia-black' : require('./assets/fonts/Sofia-Pro-Black-Az.otf'),
          'sofia-medium': require('./assets/fonts/Sofia-Pro-Medium-Az.otf'),
          'sofia-bold': require('./assets/fonts/Sofia-Pro-Bold-Az.otf'),
          'pro-light': require('./assets/fonts/Font-Awesome-5-Pro-Light-300.otf'),
          'pro-regular': require('./assets/fonts/Font-Awesome-5-Pro-Regular-400.otf'),
          'pro-solid': require('./assets/fonts/Font-Awesome-5-Pro-Solid-900.otf'),
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




  if (!fontsLoaded) return null;
  

      return (
        <NavigationContainer>
          <PushTokenContext.Provider value={[conPushToken, setConPushToken]}>
            <UserContext.Provider value={[conLocation, setConLocation]} >
              <Tab.Navigator 
                tabBarOptions={{
                  showLabel: true,
                  activeTintColor: '#11999e',
                  inactiveTintColor: '#40514e',
                  style: {
                    elevation: 0,   // for Android
                    shadowOffset: {
                      width: 0, height: 0 // for iOS
                    },
                    borderTopWidth: 0,
                  },
                }}
              >
                <Tab.Screen name="Home" component={HomeStackNavigator} options={({ route }) => ({
                  tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    let iconSize;

                    iconName = focused ? 'home' : 'home-outline'
                    iconSize = focused ? wp(10) : wp(10)

                    return <MaterialCommunityIcons name={iconName} size={iconSize} color={color} />
                  },
                  tabBarVisible: ((route) => {
                    const routename = getFocusedRouteNameFromRoute(route);

                    if (routename === 'Auth' || routename === 'Register' || routename === 'Reset' || routename === 'ResetPassForm' ||  routename === 'ActiveOrders' || routename === 'HomeProducts' || routename === 'cart' || routename === 'confirm' || routename === 'Details'){
                      return false
                    }
                    return true
                  })(route),
                })} />
                <Tab.Screen name="Store" component={ShopStackNavigator} options={({ route }) => ({
                  tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    let iconSize;

                    iconName = focused ? 'storefront' : 'storefront-outline'
                    iconSize = focused ? wp(8.5) : wp(8.5)

                    return <MaterialCommunityIcons name={iconName} size={iconSize} color={color} />
                  },
                  tabBarVisible: ((route) => {
                    const routename = getFocusedRouteNameFromRoute(route);

                    if (routename === 'cart' || routename === 'confirm' || routename === 'Auth' || routename === 'Register' || routename === 'Reset' || routename === 'ResetPassForm' || routename === 'Details' || routename === 'ActiveOrders'){
                      return false
                    }
                    return true
                  })(route),
                })}/>
                <Tab.Screen name="Profile" component={ProfileStackNavigator} options={({ route }) => ({
                  tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    let iconSize;

                    iconName = focused ? 'account' : 'account-outline'
                    iconSize = focused ? wp(9) : wp(9)

                    return <MaterialCommunityIcons name={iconName} size={iconSize} color={color} />
                  },
                  tabBarVisible: ((route) => {
                    const routename = getFocusedRouteNameFromRoute(route);

                    if (routename === 'Auth' || routename === 'Register' || routename === 'Reset' || routename === 'ResetPassForm' || routename === 'PreviousOrders' || routename === 'Reviews'){
                      return false;
                    }
                    return true;
                  })(route),
                })}/>
              </Tab.Navigator>
            </UserContext.Provider>
          </PushTokenContext.Provider>
        </NavigationContainer>
      )
}


