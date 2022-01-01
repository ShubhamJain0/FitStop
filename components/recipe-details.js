import React, { useState, useEffect, useContext, useRef } from 'react';
import { TouchableOpacity } from 'react-native';
import { StyleSheet, Text, View, RefreshControl, ScrollView, SafeAreaView, Image, Button, Animated, Dimensions, FlatList, TextInput } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { Ionicons, FontAwesome, FontAwesome5, MaterialCommunityIcons, MaterialIcons, Entypo } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import LottieView from 'lottie-react-native';
import { showMessage } from 'react-native-flash-message';
import * as SecureStore from 'expo-secure-store';
import { UserContext } from './context';
import NetInfo from "@react-native-community/netinfo";
import Ripple from 'react-native-material-ripple';

const {width: screenWidth} = Dimensions.get('window');

export default function RecipeDetails({ navigation, route }){

    const [recipeDetails, setRecipeDetails] = useState([]);
    const { recipe_id } = route.params;
    const { recipe_ingredients } = route.params;
    const [loading, setLoading] = useState('true');
    const [mounted, setMounted] = useState(true);
    const [isOffline, setIsOffline] = useState(false);
    const [showIndic, setShowInidc] = useState(false);

    const [error, setError] = useState(null);


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

        return () => {
          unsubscribe();
        }
    }, [])


    useEffect(() => {
        fetch(`http://192.168.0.156:8000/store/recipedetail/${recipe_id}/`,{
          method: 'GET',
          headers: {
            'Content-type': 'application/json'
          }
        })
        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => {if (mounted) {setRecipeDetails(resp.json)}})
        .then(() => {if (mounted) setLoading('false')})
        .catch(error => setError(error))
    
        return () => {
          setMounted(false);
        }
      }, []);



    const addCart = (item) => async evt => {
        const token =  await SecureStore.getItemAsync('USER_TOKEN')
        if (token) {
            fetch('http://192.168.0.156:8000/store/recipecart/',{
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-type': 'application/json'
            },
            body: JSON.stringify({ id: item.id })
            })
            .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
            .then(resp => {if (resp.status === 404) {showMessage({
                message: 'Some items are out of stock, sorry for inconvenience !',
                position: 'top',
                floating: true,
                titleStyle: {fontFamily: 'Maven-sem', fontSize: wp(3.5)},
                style: {alignItems: 'center'},
                icon: 'auto',
                type: 'warning',
                statusBarHeight: hp(3),
                duration: 5000
            })}
            if (resp.json.data.length > 0) {
              navigation.navigate('cart');
            }
            })
            .catch(error => setError(error))
        } else {
            navigation.navigate('Register')
        }
        
    }


    const retry = async () => {
      setShowInidc(true);
      const token = await SecureStore.getItemAsync('USER_TOKEN')
      try {
          if (mounted) {
            fetch(`http://192.168.0.156:8000/store/recipedetail/${recipe_id}/`,{
              method: 'GET',
              headers: {
                'Content-type': 'application/json'
              }
            })
            .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
            .then(resp => {if (mounted) {setRecipeDetails(resp.json)}})
            .then(() => {if (mounted) setLoading('false')})
            .then(() => setShowInidc(false))
            .then(() => setIsOffline(false))
            .catch(error => setError(error))
          }
      } catch (error) {
          setError(error)
      } finally {
          NetInfo.fetch().then(state => {
              if (!state.isConnected) {
                setTimeout(() => setShowInidc(false), 3000)
              }
          })
      }
  }


  if (isOffline) {
      return (
          <View style={{flex: 1, backgroundColor: '#fcfcfc'}}>
              <StatusBar style="inverted" />
              <Image source={require('../assets/offline.png')} style={{width: '95%', height: 1939*(screenWidth/3300), marginTop: wp(30), alignSelf: 'center'}} />
              <View style={{width: '80%', alignSelf: 'center'}}>
              <Text style={{fontFamily: 'Maven-bold', fontSize: wp(6), marginTop: 50, textAlign: 'center', color: 'black'}}>Uh oh! Seems like you are disconnected !</Text>
              {!showIndic ? <TouchableOpacity style={{alignSelf: 'center', marginTop: 25}} onPress={retry} activeOpacity={1}>
                  <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: '#249c86'}}>RETRY</Text>
              </TouchableOpacity>: <LottieView source={require('../assets/animations/connecting.json')} autoPlay={true} loop={true} style={{height: 100, alignSelf: 'center'}} />}
              </View>
          </View>
      )
  }


    if (loading === 'true') {
      return (
        <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
            <StatusBar style="inverted" />
            <LottieView source={require('../assets/animations/9258-bouncing-fruits.json')} style={{width: 200}} loop={true} autoPlay={true} />
        </View>
      )
    }

    return (
        <View style={styles.container}>
          <StatusBar style="inverted" />
          <ScrollView showsVerticalScrollIndicator={false} bounces={false} contentContainerStyle={{padding: 25, paddingTop: 0}} overScrollMode={'never'}>
          <Text style={{fontFamily: 'Maven-sem', fontSize: wp(7), color: 'black'}}>{recipeDetails.name}</Text>
            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 1}}>
              <MaterialIcons name="local-fire-department" size={wp(4)} color="#249C86" />
              <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), marginLeft: 2, color: 'grey'}}>{recipeDetails.value1}</Text>
              <Text style={{fontFamily: 'Maven-sem', fontSize: wp(5), color: 'grey'}}>  |  </Text>
              <Ionicons name="ios-people" size={wp(5)} color="#249c86" />
              <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), textAlign: 'center', color: 'grey'}}>   Serves {recipeDetails.servings} </Text>
            </View>
            <View style={{flexDirection: 'row', marginTop: 50, alignItems:'center'}}>
              <View style={{flex: 1}}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <View style={{flex: 1}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                      {recipeDetails.name2 === 'Protein' ? <MaterialCommunityIcons name="arm-flex" size={wp(4)} color="#c58c85" />: 
                      recipeDetails.name2 === 'Carbs' ? <MaterialCommunityIcons name="barley" size={wp(4)} color="green" />:
                      recipeDetails.name2 === 'Sugar' ? <FontAwesome name="cubes" size={wp(4)} color="grey" />:
                      recipeDetails.name2 === 'Fat' ? <Entypo name="drop" size={wp(4)} color="#8B8000" />: null}
                      <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), marginLeft: 2, color: 'black'}}>{recipeDetails.name2}</Text>
                    </View>
                    <Text style={{fontFamily: 'Maven-med', fontSize: wp(3.5), textAlign: 'center', color: 'grey', marginTop: 2}}>{recipeDetails.value2}</Text>
                  </View>
                  <View style={{flex: 1}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                      {recipeDetails.name3 === 'Protein' ? <MaterialCommunityIcons name="arm-flex" size={wp(4)} color="#c58c85" />: 
                      recipeDetails.name3 === 'Carbs' ? <MaterialCommunityIcons name="barley" size={wp(4)} color="green" />:
                      recipeDetails.name3 === 'Sugar' ? <FontAwesome name="cubes" size={wp(4)} color="grey" />:
                      recipeDetails.name3 === 'Fat' ? <Entypo name="drop" size={wp(4)} color="#8B8000" />: null}
                      <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), marginLeft: 2, color: 'black'}}>{recipeDetails.name3}</Text>
                    </View>
                    <Text style={{fontFamily: 'Maven-med', fontSize: wp(3.5), textAlign: 'center', color: 'grey', marginTop: 2}}>{recipeDetails.value3}</Text>
                  </View>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
                  <View style={{flex: 1}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                      {recipeDetails.name4 === 'Protein' ? <MaterialCommunityIcons name="arm-flex" size={wp(4)} color="#c58c85" />: 
                      recipeDetails.name4 === 'Carbs' ? <MaterialCommunityIcons name="barley" size={wp(4)} color="green" />:
                      recipeDetails.name4 === 'Sugar' ? <FontAwesome name="cubes" size={wp(4)} color="grey" />:
                      recipeDetails.name4 === 'Fat' ? <Entypo name="drop" size={wp(4)} color="#8B8000" />: null}
                      <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), marginLeft: 2, color: 'black'}}>{recipeDetails.name4}</Text>
                    </View>
                    <Text style={{fontFamily: 'Maven-med', fontSize: wp(3.5), textAlign: 'center', color: 'grey', marginTop: 2}}>{recipeDetails.value4}</Text>
                  </View>
                  <View style={{flex: 1}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                      {recipeDetails.name5 === 'Protein' ? <MaterialCommunityIcons name="arm-flex" size={wp(4)} color="#c58c85" />: 
                      recipeDetails.name5 === 'Carbs' ? <MaterialCommunityIcons name="barley" size={wp(4)} color="green" />:
                      recipeDetails.name5 === 'Sugar' ? <FontAwesome name="cubes" size={wp(4)} color="grey" />:
                      recipeDetails.name5 === 'Fat (Sat.)' || recipeDetails.name5 === 'Fat (Unsat.)' || recipeDetails.name5 === 'Fat (trans)' ? <Entypo name="drop" size={wp(4)} color="#8B8000" />: null}
                      <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), marginLeft: 2, color: 'black'}}>{recipeDetails.name5}</Text>
                    </View>
                    <Text style={{fontFamily: 'Maven-med', fontSize: wp(3.5), textAlign: 'center', color: 'grey', marginTop: 2}}>{recipeDetails.value5}</Text>
                  </View>
                </View>
              </View>
              <View style={{flex: 1}}>
                <View style={{backgroundColor: 'white', alignSelf: 'flex-end', borderRadius: 200, height: wp(40), width: wp(40), elevation: 10, shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.34, shadowRadius: 6.27, shadowColor: '#000'}}>
                  <Image source={{uri: recipeDetails.image}} style={{width: wp(40), height: wp(40), borderRadius: 200}} />
                </View>
              </View>
            </View>
            <Text style={{fontFamily: 'Maven-med', fontSize: wp(3.5), marginTop: 55, color: 'black'}}>{recipeDetails.description}</Text>
            <Text style={{backgroundColor: '#ebebeb', height: 1, marginTop: 35}}></Text>
            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 35, marginBottom: 20}}>
              <Text style={{flex: 1, fontFamily: 'Maven-sem', fontSize: wp(6), color: 'black'}}>Ingredients</Text>
              <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3.5), color: 'grey'}}>{recipeDetails.ingredient_count} items</Text>
            </View>
            <ScrollView horizontal={true} contentContainerStyle={{paddingRight: 25}}>
              {recipe_ingredients.map(item => {
                return item.id_of_recipe === recipe_id ?
                  <View key={item.id} style={{marginRight: 40, width: '30%', marginTop: 15}}>
                    <View style={{borderRadius: 15, alignSelf: 'flex-start'}}>
                      <Image source={{uri: item.image}} style={{width: 30, height: 30}} />
                    </View>
                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3.5), marginTop: 10, color: 'black'}}>{item.name}</Text>
                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3), color: 'grey'}}>{item.show_weight_in_recipe}</Text>
                  </View>: null
              })}
            </ScrollView>
            <Ripple style={{marginTop: 50, backgroundColor: '#6aab9e', alignSelf: 'center', padding: 15, borderRadius: 10, elevation: 5, shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.25, shadowRadius: 3.84, shadowColor: '#000'}} onPress={addCart(recipeDetails)} rippleDuration={600} rippleContainerBorderRadius={10} rippleOpacity={0.5} onLongPress={{}}>
                <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3.5), color: 'black'}}>Add Ingredients to cart  &rarr;</Text>
            </Ripple>
            <Text style={{backgroundColor: '#ebebeb', height: 1, marginTop: 35}}></Text>
            <Text style={{fontFamily: 'Maven-sem', fontSize: wp(6), marginTop: 35, color: 'black'}}>Directions</Text>
            <Text  style={{fontFamily: 'Maven-sem', fontSize: wp(4), marginTop: 15, color: 'black'}}>{recipeDetails.steps}</Text>
          </ScrollView>
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      paddingTop: 100
    }
})