import React, { useState, useEffect, useContext, useRef } from 'react';
import { TouchableOpacity } from 'react-native';
import { StyleSheet, Text, View, RefreshControl, ScrollView, SafeAreaView, Image, Button, Animated, Dimensions, FlatList, TextInput } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons, FontAwesome, FontAwesome5, MaterialCommunityIcons, MaterialIcons, Entypo } from "@expo/vector-icons";
import Svg, { Path, G, Rect, Circle } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SkeletonPlaceholder from "react-native-skeleton-placeholder";


const {width: screenWidth} = Dimensions.get('window');

export default function RecipeDetails({ navigation, route }){

    const [recipeDetails, setRecipeDetails] = useState([]);
    const { recipe_id } = route.params;
    const { recipe_ingredients } = route.params;
    const [loading, setLoading] = useState('true');
    const [mounted, setMounted] = useState(true);

    useEffect(() => {
        fetch(`http://192.168.0.105:8000/store/recipedetail/${recipe_id}/`,{
          method: 'GET',
          headers: {
            'Content-type': 'application/json'
          }
        })
        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => {if (mounted) {setRecipeDetails(resp.json)}})
        .then(() => {if (mounted) setLoading('false')})
        .catch(error => console.log(error))
    
        return () => {
          setMounted(false);
        }
      }, []);



    const addCart = (item) => async evt => {
        const token =  await AsyncStorage.getItem('USER_TOKEN')
        if (token) {
            fetch('http://192.168.0.105:8000/store/recipecart/',{
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-type': 'application/json'
            },
            body: JSON.stringify({ id: item.id })
            })
            .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
            .then(resp => {if (resp.status === 404) {alert('Some items are out of stock, sorry for inconvenience!')}})
            .catch(error => console.log(error))
        } else {
            navigation.navigate('Register')
        }
        
    }


    if (loading === 'true') return null;

    return (
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false} bounces={false} contentContainerStyle={{padding: 25}}>
          <Text style={{fontFamily: 'sofia-black', fontSize: wp(7)}}>{recipeDetails.name}</Text>
            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 1}}>
              <MaterialIcons name="local-fire-department" size={wp(4)} color="#249C86" />
              <Text style={{fontFamily: 'sf-semi', fontSize: wp(4), marginLeft: 2}}>{recipeDetails.value1}</Text>
              <Text style={{fontFamily: 'sf-semi', fontSize: wp(5), color: 'grey'}}>  |  </Text>
              <Ionicons name="ios-people" size={wp(5)} color="#249c86" />
              <Text style={{fontFamily: 'sf-semi', fontSize: wp(4), textAlign: 'center'}}>   Serves {recipeDetails.servings} </Text>
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
                      <Text style={{fontFamily: 'sf-semi', fontSize: wp(4), marginLeft: 2}}>{recipeDetails.name2}</Text>
                    </View>
                    <Text style={{fontFamily: 'sf-semi', fontSize: wp(3.5), textAlign: 'center', color: 'grey', marginTop: 2}}>{recipeDetails.value2}</Text>
                  </View>
                  <View style={{flex: 1}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                      {recipeDetails.name3 === 'Protein' ? <MaterialCommunityIcons name="arm-flex" size={wp(4)} color="#c58c85" />: 
                      recipeDetails.name3 === 'Carbs' ? <MaterialCommunityIcons name="barley" size={wp(4)} color="green" />:
                      recipeDetails.name3 === 'Sugar' ? <FontAwesome name="cubes" size={wp(4)} color="grey" />:
                      recipeDetails.name3 === 'Fat' ? <Entypo name="drop" size={wp(4)} color="#8B8000" />: null}
                      <Text style={{fontFamily: 'sf-semi', fontSize: wp(4), marginLeft: 2}}>{recipeDetails.name3}</Text>
                    </View>
                    <Text style={{fontFamily: 'sf-semi', fontSize: wp(3.5), textAlign: 'center', color: 'grey', marginTop: 2}}>{recipeDetails.value3}</Text>
                  </View>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
                  <View style={{flex: 1}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                      {recipeDetails.name4 === 'Protein' ? <MaterialCommunityIcons name="arm-flex" size={wp(4)} color="#c58c85" />: 
                      recipeDetails.name4 === 'Carbs' ? <MaterialCommunityIcons name="barley" size={wp(4)} color="green" />:
                      recipeDetails.name4 === 'Sugar' ? <FontAwesome name="cubes" size={wp(4)} color="grey" />:
                      recipeDetails.name4 === 'Fat' ? <Entypo name="drop" size={wp(4)} color="#8B8000" />: null}
                      <Text style={{fontFamily: 'sf-semi', fontSize: wp(4), marginLeft: 2}}>{recipeDetails.name4}</Text>
                    </View>
                    <Text style={{fontFamily: 'sf-semi', fontSize: wp(3.5), textAlign: 'center', color: 'grey', marginTop: 2}}>{recipeDetails.value4}</Text>
                  </View>
                  <View style={{flex: 1}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                      {recipeDetails.name5 === 'Protein' ? <MaterialCommunityIcons name="arm-flex" size={wp(4)} color="#c58c85" />: 
                      recipeDetails.name5 === 'Carbs' ? <MaterialCommunityIcons name="barley" size={wp(4)} color="green" />:
                      recipeDetails.name5 === 'Sugar' ? <FontAwesome name="cubes" size={wp(4)} color="grey" />:
                      recipeDetails.name5 === 'Fat (Sat.)' || recipeDetails.name5 === 'Fat (Unsat.)' || recipeDetails.name5 === 'Fat (trans)' ? <Entypo name="drop" size={wp(4)} color="#8B8000" />: null}
                      <Text style={{fontFamily: 'sf-semi', fontSize: wp(4), marginLeft: 2}}>{recipeDetails.name5}</Text>
                    </View>
                    <Text style={{fontFamily: 'sf-semi', fontSize: wp(3.5), textAlign: 'center', color: 'grey', marginTop: 2}}>{recipeDetails.value5}</Text>
                  </View>
                </View>
              </View>
              <View style={{flex: 1}}>
                <View style={{backgroundColor: 'white', alignSelf: 'flex-end', borderRadius: 200, height: wp(40), width: wp(40), elevation: 10, shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.34, shadowRadius: 6.27}}>
                  <Image source={{uri: recipeDetails.image}} style={{width: wp(40), height: wp(40), borderRadius: 200}} />
                </View>
              </View>
            </View>
            <Text style={{fontFamily: 'sf', fontSize: wp(3.5), marginTop: 55}}>{recipeDetails.description}</Text>
            <Text style={{backgroundColor: '#ebebeb', height: 1, marginTop: 35}}></Text>
            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 35, marginBottom: 20}}>
              <Text style={{flex: 1, fontFamily: 'sofia-bold', fontSize: wp(6)}}>Ingredients</Text>
              <Text style={{fontFamily: 'sf-semi', fontSize: wp(3.5), color: 'grey'}}>{recipeDetails.ingredient_count} items</Text>
            </View>
            <ScrollView horizontal={true} contentContainerStyle={{paddingRight: 25}}>
              {recipe_ingredients.map(item => {
                return item.id_of_recipe === recipe_id ?
                  <View key={item.id} style={{marginRight: 40, width: '30%'}}>
                    <View style={{backgroundColor: '#f9f9f9', padding: 15, borderRadius: 15, alignSelf: 'flex-start'}}>
                      <Image source={{uri: item.image}} style={{width: 30, height: 30}} />
                    </View>
                    <Text style={{fontFamily: 'sf-semi', fontSize: wp(3.5), marginTop: 10}}>{item.name}</Text>
                    <Text style={{fontFamily: 'sf-semi', fontSize: wp(3), color: 'grey'}}>{item.show_weight_in_recipe}</Text>
                  </View>: null
              })}
            </ScrollView>
            <TouchableOpacity style={{marginTop: 50, backgroundColor: '#99b898', alignSelf: 'center', padding: 15, borderRadius: 10}} onPress={addCart(recipeDetails)} activeOpacity={0.8}>
                <Text style={{fontFamily: 'sf-semi', fontSize: wp(3.5)}}>Add Ingredients to cart  &rarr;</Text>
            </TouchableOpacity>
            <Text style={{backgroundColor: '#ebebeb', height: 1, marginTop: 35}}></Text>
            <Text style={{fontFamily: 'sofia-bold', fontSize: wp(6), marginTop: 35}}>Directions</Text>
            <Text  style={{fontFamily: 'sf-semi', fontSize: wp(4), marginTop: 15}}>{recipeDetails.steps}</Text>
          </ScrollView>
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      paddingTop: hp(10)
    }
})