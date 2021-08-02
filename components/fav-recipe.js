import React, { useState, useEffect, useContext, useRef } from 'react';
import { TouchableOpacity } from 'react-native';
import { StyleSheet, Text, View, Image, Button, Animated, Dimensions, Easing, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons, FontAwesome, FontAwesome5, MaterialCommunityIcons, MaterialIcons, Feather } from "@expo/vector-icons";
import Svg, { Path, G, Rect, Circle } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { StatusBar } from 'expo-status-bar';
import LottieView from 'lottie-react-native';



export default function FavRecipe({ navigation }){

    const [recipesList, setRecipesList] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [favRecipes, setFavRecipes] = useState([]);
    const [respStatus, setRespStatus] = useState(0);
    const [loading, setLoading] = useState('true');
    const [mounted, setMounted] = useState(true);

    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('http://192.168.0.105:8000/store/recipes/',{
          method: 'GET',
          headers: {
            'Content-type': 'application/json'
          }
        })
        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => {if (mounted) {setRecipesList(resp.json.qs), setIngredients(resp.json.ingredients)}})
        .catch(error => setError(error))
    
        return () => {
          setMounted(false);
        }
      }, []);


      //Favourite Recipe Functions

      useEffect(() => {

        (async () => {
          const token = await AsyncStorage.getItem('USER_TOKEN')
          if (token) {
            fetch('http://192.168.0.105:8000/store/favrecipes/',{
              method: 'GET',
              headers: {
                'Content-type': 'application/json',
                'Authorization': `Token ${token}`
              }
            })
            .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
            .then(resp => {if (mounted) {setFavRecipes(resp.json.data)}})
            .then(() => {if (mounted) setLoading('false')})
            .catch(error => setError(error))
          }
        })().catch(error => setError(error))
    
        return () => {
          setMounted(false);
        }
      }, []);



    const search = (item) => {
        if (favRecipes && favRecipes.length > 0) {
            for (var i=0; i < favRecipes.length; i++) {
                if (favRecipes[i].id_of_recipe === item.id) {
                    return favRecipes[i];
                }
            }
        }
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
            {favRecipes && favRecipes.length > 0 ? 
                <FlatList 
                data={recipesList}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={{paddingLeft: 50, paddingBottom: 100, paddingTop: 25}}
                ListEmptyComponent={() => (!recipesList.length ? <Text style={{fontFamily: 'Maison-bold', textAlign: 'center', fontSize: wp(5), color: 'grey', marginTop: 25}}>No recipes found !</Text>: null)}
                renderItem={({ item }) => (
                    search(item) ?
                    <View style={{backgroundColor: 'white', marginTop: 15, marginBottom: 35, width: '90%', padding: 25, borderRadius: 25, elevation: 25, shadowOffset: {width: 0, height: 12}, shadowRadius: 16, shadowOpacity: 0.58}} >
                            <View style={{backgroundColor: 'white', borderRadius: 100, width: 125, height: 125, alignSelf: 'center', elevation: 15, shadowOffset: {width: 0, height: 7}, shadowRadius: 9.51, shadowOpacity: 0.43}}>
                              <Image source={{uri: item.image}} style={{width: 125, height: 125, alignSelf: 'center', borderRadius: 100}} />
                            </View>
                            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center',  marginTop: 15, justifyContent: 'center'}}>
                              <MaterialIcons name="local-fire-department" size={wp(4.5)} color="#249C86" />
                              <Text style={{fontFamily: 'Maison-bold', fontSize: wp(4), textAlign: 'center', color: 'grey'}}> {item.value1} </Text>
                              <Text style={{fontFamily: 'Maison-bold', fontSize: wp(5), textAlign: 'center', color: 'grey'}}> | </Text>
                              <Ionicons name="ios-people" size={wp(4)} color="#249c86" />
                              <Text style={{fontFamily: 'Maison-bold', fontSize: wp(4), textAlign: 'center', color: 'grey'}}>  Serves {item.servings} </Text>
                            </View>
                            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 5}}>
                              <View style={{ flex: 1, alignItems: 'flex-end'}}>
                                <MaterialIcons name="favorite" size={wp(4)} color="#249C86" />
                              </View>
                              <Text style={{fontFamily: 'Maison-bold', fontSize: wp(4), textAlign: 'left', color: 'grey', flex: 1}}> {item.count} </Text>
                            </View>
                            <Text style={{fontFamily: 'sofia-bold', fontSize: wp(6), marginTop: 15, color: 'black'}}>{item.name}</Text>
                            <Text style={{fontFamily: 'sf', fontSize: wp(3.5), marginTop: 15, color: '#525252'}} numberOfLines={5} ellipsizeMode={'tail'}>{item.description}</Text>
                            
                            <TouchableOpacity style={{alignSelf: 'center', marginTop: 25}} onPress={() => navigation.navigate('RecipeDetails', {recipe_id: item.id, recipe_ingredients: ingredients})}>
                                <Text style={{textAlign: 'right', fontFamily: 'Maison-bold', fontSize: wp(3.5), color: '#249c86'}}>VIEW RECIPE</Text>
                            </TouchableOpacity>
                        </View>
                    : null
                    )}
                />:
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{fontFamily: 'Maison-bold', fontSize: wp(5), color: 'black'}}>No favorites added !</Text>
                </View>
            }
            </View>
    )
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      paddingTop: 100,
    }
})