import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
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
import { UserContext, PushTokenContext } from './components/context';
import SkeletonPlaceholder from "react-native-skeleton-placeholder";

const Tab = createBottomTabNavigator();

const Stack = createStackNavigator();



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

  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [errorMsg, setErrormsg] = useState(null);

  const [conLocation, setConLocation] = useState({'name': '', 'district': ''});
  const [conPushToken, setConPushToken] = useState('');


  useEffect(() => {
    async function load() {
      try {
        await Font.loadAsync({
          'sofia-black' : require('./assets/fonts/Sofia-Pro-Black-Az.otf'),
          'sofia-medium': require('./assets/fonts/Sofia-Pro-Medium-Az.otf'),
          'sofia-bold': require('./assets/fonts/Sofia-Pro-Bold-Az.otf'),
          'sf': require('./assets/fonts/SF-Compact-Text-Medium.otf'),
          'sf-semi': require('./assets/fonts/SF-Compact-Text-Semibold.otf'),
          'pro-light': require('./assets/fonts/Font-Awesome-5-Pro-Light-300.otf'),
          'pro-regular': require('./assets/fonts/Font-Awesome-5-Pro-Regular-400.otf'),
          'pro-solid': require('./assets/fonts/Font-Awesome-5-Pro-Solid-900.otf'),
        });
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        setErrormsg(error);
      } finally {
        setFontsLoaded(true);
        
      }
    }

    load();
  }, []);




  if (!fontsLoaded) {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
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
          >
            <View style={{flex: 1, paddingTop: hp(5)}}>
              <SkeletonPlaceholder>
                <SkeletonPlaceholder.Item alignItems="center" justifyContent="center">
                  <SkeletonPlaceholder.Item
                    width={wp(100)}
                    height={wp(100)}
                    borderRadius={4}
                  />
                </SkeletonPlaceholder.Item>
              </SkeletonPlaceholder>
            </View>
            <View style={{margin: wp(5)}}>
              <SkeletonPlaceholder>
                <SkeletonPlaceholder.Item>
                  <SkeletonPlaceholder.Item
                    width={wp(40)}
                    height={hp(2)}
                    borderRadius={4}
                  />
                </SkeletonPlaceholder.Item>
              </SkeletonPlaceholder>
            </View>
            <View style={{paddingTop: hp(5), flexDirection: 'row', flex: 1}}>
              <View style={{flex: 1, alignItems: 'center'}}>
                <SkeletonPlaceholder>
                  <SkeletonPlaceholder.Item>
                    <SkeletonPlaceholder.Item
                      width={100}
                      height={100}
                      borderRadius={50}
                    />
                  </SkeletonPlaceholder.Item>
                </SkeletonPlaceholder>
              </View>
              <View style={{flex: 1, alignItems: 'center'}}>
                <SkeletonPlaceholder>
                  <SkeletonPlaceholder.Item>
                    <SkeletonPlaceholder.Item
                      width={100}
                      height={100}
                      borderRadius={50}
                    />
                  </SkeletonPlaceholder.Item>
                </SkeletonPlaceholder>
              </View>
            </View>
            <View style={{paddingTop: hp(5), flexDirection: 'row', flex: 1}}>
              <View style={{flex: 1, alignItems: 'center'}}>
                <SkeletonPlaceholder>
                  <SkeletonPlaceholder.Item>
                    <SkeletonPlaceholder.Item
                      width={100}
                      height={100}
                      borderRadius={50}
                    />
                  </SkeletonPlaceholder.Item>
                </SkeletonPlaceholder>
              </View>
              <View style={{flex: 1, alignItems: 'center'}}>
                <SkeletonPlaceholder>
                  <SkeletonPlaceholder.Item>
                    <SkeletonPlaceholder.Item
                      width={100}
                      height={100}
                      borderRadius={50}
                    />
                  </SkeletonPlaceholder.Item>
                </SkeletonPlaceholder>
              </View>
            </View>
        </ScrollView>
      </SafeAreaView>
    )
  }
  

      return (
        <NavigationContainer>
          <PushTokenContext.Provider value={[conPushToken, setConPushToken]}>
            <UserContext.Provider value={[conLocation, setConLocation]} >
              <Tab.Navigator
                tabBarOptions={{
                  showLabel: true,
                  activeTintColor: '#249C86',
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

                    if (routename === 'Register' || routename === 'ActiveOrders' || routename === 'HomeProducts' || routename === 'cart' || routename === 'confirm' || routename === 'Details' || routename === 'PreviousOrders' || routename === 'Reviews' || routename === 'Profile' || routename === 'OtpComponent' || routename === 'RecipeDetails'){
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

                    if (routename === 'cart' || routename === 'confirm' || routename === 'OtpComponent' || routename === 'Register' || routename === 'Details' || routename === 'ActiveOrders'){
                      return false
                    }
                    return true
                  })(route),
                })}/>
                <Tab.Screen name="Recipes" component={RecipeStackNavigator} options={({ route }) => ({
                  tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    let iconSize;

                    iconName = focused ? 'bowl-mix' : 'bowl-mix-outline'
                    iconSize = focused ? wp(8.5) : wp(8.5)

                    return <MaterialCommunityIcons name={iconName} size={iconSize} color={color} />
                  },
                  tabBarVisible: ((route) => {
                    const routename = getFocusedRouteNameFromRoute(route);

                    if (routename === 'cart' || routename === 'confirm' || routename === 'OtpComponent' || routename === 'Register' || routename === 'Details' || routename === 'ActiveOrders' || routename === 'RecipeDetails' || routename === 'FavRecipe'){
                      return false
                    }
                    return true
                  })(route),
                })}/>
              </Tab.Navigator>
            </UserContext.Provider>
          </PushTokenContext.Provider>
        </NavigationContainer>
      )
}


