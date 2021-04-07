import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons, FontAwesome, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen'; 
import AppLoading from 'expo-app-loading';
import * as Font from 'expo-font';
import Home from './components/Home';
import Profile from './components/Profile';
import Fruits from './components/fruits';
import DriedFruits from './components/driedfruits';
import Exotics from './components/exotics';
import Cart from './components/cart';
import Confirm from './components/confirm';


const Tab = createBottomTabNavigator();

const Stack = createStackNavigator();


function FruitsStackNavigator() {


  return (
    <Stack.Navigator>
      <Stack.Screen name="Fruits" component={Fruits} options={({ navigation }) => ({
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



export default function App() {

  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [errorMsg, setErrormsg] = useState(null);


  const getFonts = () => {
    return Font.loadAsync({
      'sofia-black' : require('./assets/fonts/Sofia-Pro-Black-Az.otf'),
      'sofia-medium': require('./assets/fonts/Sofia-Pro-Medium-Az.otf'),
      'sofia-bold': require('./assets/fonts/Sofia-Pro-Black-Az.otf'),
      'pro-regular': require('./assets/fonts/Font-Awesome-5-Pro-Regular-400.otf'),
      'pro-solid': require('./assets/fonts/Font-Awesome-5-Pro-Solid-900.otf'),
    });
  };






  if (!fontsLoaded) {
    return <AppLoading
            startAsync={getFonts}
            onFinish={() => setFontsLoaded(true)}
            onError={(error) => setErrormsg(error)}
          />
  }
  

      return (
        <NavigationContainer>
          <Tab.Navigator 
            tabBarOptions={{
              showLabel: true,
              activeTintColor: '#11999e',
              inactiveTintColor: '#40514e',
            }}
          >
            <Tab.Screen name="Home" component={Home} options={{
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;
                let iconSize;

                iconName = focused ? 'home' : 'home-outline'
                iconSize = focused ? wp(9.5) : wp(9.5)

                 return <MaterialCommunityIcons name={iconName} size={iconSize} color={color} />
              },
            }} />
            <Tab.Screen name="Fruits" component={FruitsStackNavigator} options={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;
                let iconSize;

                iconName = focused ? 'food-apple' : 'food-apple-outline'
                iconSize = focused ? wp(9) : wp(9)

                return <MaterialCommunityIcons name={iconName} size={iconSize} color={color} />
              },
              tabBarVisible: ((route) => {
                const routename = getFocusedRouteNameFromRoute(route);

                if (routename === 'cart' || routename === 'confirm'){
                  return false
                }
                return true
              })(route),
            })}/>
            <Tab.Screen name="Dried-Fruits" component={DriedFruitsStackNavigator} options={({ route}) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;
                let iconSize;

                iconName = focused ? 'seed' : 'seed-outline'
                iconSize = focused ? wp(8.3) : wp(8.3)

                return <MaterialCommunityIcons name={iconName} size={iconSize} color={color} />
              },
              tabBarVisible: ((route) => {
                const routename = getFocusedRouteNameFromRoute(route);

                if (routename === 'cart' || routename === 'confirm'){
                  return false
                }
                return true
              })(route),
            })}/>
            <Tab.Screen name="Exotics" component={Exotics} options={{
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;
                let iconSize;

                iconName = focused ? 'tree' : 'tree-outline'
                iconSize = focused ? wp(9.5) : wp(9.5)

                return <MaterialCommunityIcons name={iconName} size={iconSize} color={color} />
              }
            }}/>
            <Tab.Screen name="Profile" component={Profile} options={() => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;
                let iconSize;

                iconName = focused ? 'account' : 'account-outline'
                iconSize = focused ? wp(9) : wp(9)

                return <MaterialCommunityIcons name={iconName} size={iconSize} color={color} />
              }
            })}/>
          </Tab.Navigator>
        </NavigationContainer>
      )
}


