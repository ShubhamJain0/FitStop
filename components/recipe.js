import React, { useState, useEffect, useContext, useRef } from 'react';
import { TouchableOpacity } from 'react-native';
import { StyleSheet, Text, View, Image, Button, Animated, Dimensions, Easing, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons, FontAwesome, FontAwesome5, MaterialCommunityIcons, MaterialIcons, Feather, SimpleLineIcons, Fontisto } from "@expo/vector-icons";
import Svg, { Path, G, Rect, Circle } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { DevSettings } from 'react-native';



export default function Recipe({ navigation }){

    const [recipesList, setRecipesList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [favRecipes, setFavRecipes] = useState([]);
    const [respStatus, setRespStatus] = useState(0);
    const [loading, setLoading] = useState('true');
    const [mounted, setMounted] = useState(true);
    const [category, setCategory] = useState('Break Fast');

    const [tiDisplay, setTiDisplay] = useState('none');
    const [query, setQuery] = useState('');
    const searchRef = useRef(null);

    useEffect(() => {
        fetch('http://192.168.0.105:8000/store/recipes/',{
          method: 'GET',
          headers: {
            'Content-type': 'application/json'
          }
        })
        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => {if (mounted) {setRecipesList(resp.json.qs), setFilteredList(resp.json.qs), setIngredients(resp.json.ingredients)}})
        .catch(error => console.log(error))
    
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
            .catch(error => console.log(error))
          }
        })().catch(error => console.log(error))
    
        return () => {
          setMounted(false);
        }
      }, []);


    const addFavRecipe = async (item) => {
      const token = await AsyncStorage.getItem('USER_TOKEN')
      if (token) {
        fetch('http://192.168.0.105:8000/store/favrecipes/',{
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
            'Authorization': `Token ${token}`
          },
          body: JSON.stringify({id: item.id})
        })
        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => {if (mounted) {setFavRecipes(resp.json.data); setRecipesList(resp.json.data1); setFilteredList(resp.json.data1)}})
        .catch(error => console.log(error))
      }
    }


    const deleteFavRecipe = async (item) => {
      const token = await AsyncStorage.getItem('USER_TOKEN')
      if (token) {
        fetch('http://192.168.0.105:8000/store/favrecipes/',{
          method: 'DELETE',
          headers: {
            'Content-type': 'application/json',
            'Authorization': `Token ${token}`
          },
          body: JSON.stringify({id: item.id})
        })
        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => {if (mounted) {setFavRecipes(resp.json.data); setRecipesList(resp.json.data1); setFilteredList(resp.json.data1)}})
        .catch(error => console.log(error))
      }
    }



    const search = (item) => {
      if (favRecipes && favRecipes.length > 0) {
          for (var i=0; i < favRecipes.length; i++) {
              if (favRecipes[i].id_of_recipe === item.id) {
                  return favRecipes[i];
              }
          }
      }
    }
    


      //Search
      const searchFilterFunction = (text) => {
        // Check if searched text is not blank
        if (text) {
          // Inserted text is not blank
          // Filter the masterDataSource
          // Update FilteredDataSource
          const newData = recipesList.filter(
            function (item) {
              const itemData = item.name
                ? item.name.toUpperCase()
                : ''.toUpperCase();
              const textData = text.toUpperCase();
              return itemData.indexOf(textData) > -1;
          });
          setFilteredList(newData);
          setQuery(text);
        } else {
          // Inserted text is blank
          // Update FilteredDataSource with masterDataSource
          setFilteredList(recipesList);
          setQuery(text);
        }
      };



    if (loading === 'true') return null;

    return (
        <View style={styles.container}>
            <View style={{flexDirection: 'row', alignItems: 'center', padding: 25, paddingBottom: 0}}>
              <View style={{flex: 1}}>
                <TouchableOpacity onPress={() => navigation.navigate('FavRecipe')}>
                  <MaterialIcons name="favorite-outline" size={wp(6)} color="black" />
                </TouchableOpacity>
              </View>
              <View style={{flex: 1}}>
                <TouchableOpacity onPress={() => tiDisplay === 'none' ? (setTiDisplay('flex')): (setTiDisplay('none'), searchRef.current.blur())}>
                  <Feather name="search" size={wp(6)} color="black" style={{alignSelf: 'flex-end'}} />
                </TouchableOpacity>
              </View>
              <View style={{width: '50%', display: tiDisplay, height: 25, marginLeft: 10}}>
                <TextInput ref={searchRef} style={{ }} placeholder="search" value={query} onChangeText={(text) => searchFilterFunction(text)} />
              </View>
            </View>
            <View style={{padding: 25, paddingLeft: 25, paddingTop: 20}}>
              <Text style={{fontFamily: 'sofia-black', fontSize: wp(7)}}>{category} Recipes</Text>
            </View>
            <View style={{flex: 1, flexDirection: 'row'}}>
              <View style={{flex: 0.5, marginTop: 75}}>
                <TouchableOpacity style={{marginBottom: 100, transform: [{rotate: '-90deg'}]}} onPress={() => setCategory('Break Fast')} activeOpacity={0.8}>
                  <Text style={{fontFamily: 'sf-semi', fontSize: wp(4), textAlign: 'center', opacity: category === 'Break Fast' ? 1 : 0.2}}>Break Fast</Text>
                  {category === 'Break Fast' ? <Text style={{backgroundColor: '#249C86', height: 2, width: '50%', marginTop: 5, alignSelf: 'center'}}></Text> : <Text style={{ height: 2, marginTop: 5}}></Text>}
                </TouchableOpacity>
                <TouchableOpacity style={{marginBottom: 100, transform: [{rotate: '-90deg'}]}} onPress={() => setCategory('Lunch')} activeOpacity={0.8}>
                  <Text style={{fontFamily: 'sf-semi', fontSize: wp(4), textAlign: 'center', opacity: category === 'Lunch' ? 1 : 0.2}}>Lunch</Text>
                  {category === 'Lunch' ? <Text style={{backgroundColor: '#249C86', height: 2, width: '35%', marginTop: 5, alignSelf: 'center'}}></Text> : <Text style={{ height: 2, marginTop: 5}}></Text>}
                </TouchableOpacity>
                <TouchableOpacity style={{marginBottom: 100, transform: [{rotate: '-90deg'}]}} onPress={() => setCategory('Dinner')} activeOpacity={0.8}>
                  <Text style={{fontFamily: 'sf-semi', fontSize: wp(4), textAlign: 'center', opacity: category === 'Dinner' ? 1 : 0.2}}>Dinner</Text>
                  {category === 'Dinner' ? <Text style={{backgroundColor: '#249C86', height: 2, width: '35%', marginTop: 5, alignSelf: 'center'}}></Text> : <Text style={{ height: 2, marginTop: 5}}></Text>}
                </TouchableOpacity>
              </View>
              <View style={{flex: 1.5}}>
                {category === 'Break Fast' ? 
                  <FlatList 
                    data={filteredList}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{paddingLeft: 20, paddingBottom: 100}}
                    ListEmptyComponent={() => (!filteredList.length ? <Text style={{fontFamily: 'sf-semi', textAlign: 'center', fontSize: wp(5), color: 'grey', marginTop: 25}}>No recipes found !</Text>: null)}
                    renderItem={({ item }) => (
                      item.category === 'Breakfast' ?
                        <View style={{backgroundColor: 'white', marginTop: 15, marginBottom: 35, width: '90%', padding: 25, borderRadius: 25, elevation: 15, shadowOffset: {width: 0, height: 7}, shadowRadius: 9.51, shadowOpacity: 0.43}} >
                            <View style={{backgroundColor: 'white', borderRadius: 100, width: 125, height: 125, alignSelf: 'center', elevation: 15, shadowOffset: {width: 0, height: 7}, shadowRadius: 9.51, shadowOpacity: 0.43}}>
                              <Image source={{uri: item.image}} style={{width: 125, height: 125, alignSelf: 'center', borderRadius: 100}} />
                            </View>
                            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center',  marginTop: 15, justifyContent: 'center'}}>
                              <MaterialIcons name="local-fire-department" size={wp(4.5)} color="#249C86" />
                              <Text style={{fontFamily: 'sf-semi', fontSize: wp(4), textAlign: 'center', color: 'grey'}}> {item.value1} </Text>
                              <Text style={{fontFamily: 'sf-semi', fontSize: wp(5), textAlign: 'center', color: 'grey'}}> | </Text>
                              <Ionicons name="ios-people" size={wp(4)} color="#249c86" />
                              <Text style={{fontFamily: 'sf-semi', fontSize: wp(4), textAlign: 'center', color: 'grey'}}>  Serves {item.servings}</Text>
                            </View>
                            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 5}}>
                              <View style={{ flex: 1, alignItems: 'flex-end'}}>
                                <MaterialIcons name="favorite" size={wp(4)} color="#249C86" />
                              </View>
                              <Text style={{fontFamily: 'sf-semi', fontSize: wp(4), textAlign: 'left', color: 'grey', flex: 1}}> {item.count} </Text>
                            </View>
                            <Text style={{fontFamily: 'sofia-bold', fontSize: wp(6), marginTop: 15}}>{item.name}</Text>
                            <Text style={{fontFamily: 'sf', fontSize: wp(3.5), marginTop: 15, color: '#525252'}} numberOfLines={5} ellipsizeMode={'tail'}>{item.description}</Text>
                            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 25}}>
                              <View style={{flex: 1}}>
                                {search(item) ?
                                  favRecipes.map(item1 => {
                                    return item.id === item1.id_of_recipe ?
                                    <TouchableOpacity key={item1.id} onPress={() => deleteFavRecipe(item)}>
                                      <MaterialIcons name="favorite" size={wp(5)} color="#249c86" />
                                    </TouchableOpacity>
                                    :
                                    null
                                  }): 
                                  <TouchableOpacity onPress={() => addFavRecipe(item)}>
                                    <MaterialIcons name="favorite-outline" size={wp(5)} color="black" />
                                  </TouchableOpacity>
                                }
                              </View>
                              <TouchableOpacity style={{flex: 1}} onPress={() => navigation.navigate('RecipeDetails', {recipe_id: item.id, recipe_ingredients: ingredients})}>
                                <Text style={{textAlign: 'right', fontFamily: 'sf-semi', fontSize: wp(3.5), color: '#249c86'}}>VIEW RECIPE</Text>
                              </TouchableOpacity>
                            </View>
                        </View>
                      : null
                    )}
                />: 
                category === 'Lunch' ? 
                <FlatList 
                    data={filteredList}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{paddingLeft: 20, paddingBottom: 100}}
                    ListEmptyComponent={() => (!filteredList.length ? <Text style={{fontFamily: 'sf-semi', textAlign: 'center', fontSize: wp(5), color: 'grey', marginTop: 25}}>No recipes found !</Text>: null)}
                    renderItem={({ item }) => (
                      item.category === 'Lunch' ?
                        <View style={{backgroundColor: 'white', marginTop: 15, marginBottom: 35, width: '90%', padding: 25, borderRadius: 25, elevation: 15, shadowOffset: {width: 0, height: 7}, shadowRadius: 9.51, shadowOpacity: 0.43}} >
                            <View style={{backgroundColor: 'white', borderRadius: 100, width: 125, height: 125, alignSelf: 'center', elevation: 15, shadowOffset: {width: 0, height: 7}, shadowRadius: 9.51, shadowOpacity: 0.43}}>
                              <Image source={{uri: item.image}} style={{width: 125, height: 125, alignSelf: 'center', borderRadius: 100}} />
                            </View>
                            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center',  marginTop: 15, justifyContent: 'center'}}>
                              <MaterialIcons name="local-fire-department" size={wp(4.5)} color="#249C86" />
                              <Text style={{fontFamily: 'sf-semi', fontSize: wp(4), textAlign: 'center', color: 'grey'}}> {item.value1} </Text>
                              <Text style={{fontFamily: 'sf-semi', fontSize: wp(5), textAlign: 'center', color: 'grey'}}> | </Text>
                              <Ionicons name="ios-people" size={wp(4)} color="#249c86" />
                              <Text style={{fontFamily: 'sf-semi', fontSize: wp(4), textAlign: 'center', color: 'grey'}}>  Serves {item.servings} </Text>
                            </View>
                            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 5}}>
                              <View style={{ flex: 1, alignItems: 'flex-end'}}>
                                <MaterialIcons name="favorite" size={wp(4)} color="#249C86" />
                              </View>
                              <Text style={{fontFamily: 'sf-semi', fontSize: wp(4), textAlign: 'left', color: 'grey', flex: 1}}> {item.count} </Text>
                            </View>
                            <Text style={{fontFamily: 'sofia-bold', fontSize: wp(6), marginTop: 15}}>{item.name}</Text>
                            <Text style={{fontFamily: 'sf', fontSize: wp(3.5), marginTop: 15, color: '#525252'}} numberOfLines={5} ellipsizeMode={'tail'}>{item.description}</Text>
                            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 25}}>
                              <View style={{flex: 1}}>
                                {search(item) ?
                                  favRecipes.map(item1 => {
                                    return item.id === item1.id_of_recipe ?
                                    <TouchableOpacity key={item1.id} onPress={() => deleteFavRecipe(item)}>
                                      <MaterialIcons name="favorite" size={wp(5)} color="#249c86" />
                                    </TouchableOpacity>
                                    :
                                    null
                                  }): 
                                  <TouchableOpacity onPress={() => addFavRecipe(item)}>
                                    <MaterialIcons name="favorite-outline" size={wp(5)} color="black" />
                                  </TouchableOpacity>
                                }
                              </View>
                              <TouchableOpacity style={{flex: 1}} onPress={() => navigation.navigate('RecipeDetails', {recipe_id: item.id, recipe_ingredients: ingredients})}>
                                <Text style={{textAlign: 'right', fontFamily: 'sf-semi', fontSize: wp(3.5), color: '#249c86'}}>VIEW RECIPE</Text>
                              </TouchableOpacity>
                            </View>
                        </View>
                      : null
                    )}
                />: 
                <FlatList 
                    data={filteredList}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{paddingLeft: 20, paddingBottom: 100}}
                    ListEmptyComponent={() => (!filteredList.length ? <Text style={{fontFamily: 'sf-semi', textAlign: 'center', fontSize: wp(5), color: 'grey', marginTop: 25}}>No recipes found !</Text>: null)}
                    renderItem={({ item }) => (
                      item.category === 'Dinner' ?
                        <View style={{backgroundColor: 'white', marginTop: 15, marginBottom: 35, width: '90%', padding: 25, borderRadius: 25, elevation: 15, shadowOffset: {width: 0, height: 7}, shadowRadius: 9.51, shadowOpacity: 0.43}} >
                            <View style={{backgroundColor: 'white', borderRadius: 100, width: 125, height: 125, alignSelf: 'center', elevation: 15, shadowOffset: {width: 0, height: 7}, shadowRadius: 9.51, shadowOpacity: 0.43}}>
                              <Image source={{uri: item.image}} style={{width: 125, height: 125, alignSelf: 'center', borderRadius: 100}} />
                            </View>
                            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center',  marginTop: 15, justifyContent: 'center'}}>
                              <MaterialIcons name="local-fire-department" size={wp(4.5)} color="#249C86" />
                              <Text style={{fontFamily: 'sf-semi', fontSize: wp(4), textAlign: 'center', color: 'grey'}}> {item.value1} </Text>
                              <Text style={{fontFamily: 'sf-semi', fontSize: wp(5), textAlign: 'center', color: 'grey'}}> | </Text>
                              <Ionicons name="ios-people" size={wp(4)} color="#249c86" />
                              <Text style={{fontFamily: 'sf-semi', fontSize: wp(4), textAlign: 'center', color: 'grey'}}>  Serves {item.servings} </Text>
                            </View>
                            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 5}}>
                              <View style={{ flex: 1, alignItems: 'flex-end'}}>
                                <MaterialIcons name="favorite" size={wp(4)} color="#249C86" />
                              </View>
                              <Text style={{fontFamily: 'sf-semi', fontSize: wp(4), textAlign: 'left', color: 'grey', flex: 1}}> {item.count} </Text>
                            </View>
                            <Text style={{fontFamily: 'sofia-bold', fontSize: wp(6), marginTop: 15}}>{item.name}</Text>
                            <Text style={{fontFamily: 'sf', fontSize: wp(3.5), marginTop: 15, color: '#525252'}} numberOfLines={5} ellipsizeMode={'tail'}>{item.description}</Text>
                            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 25}}>
                              <View style={{flex: 1}}>
                                {search(item) ?
                                  favRecipes.map(item1 => {
                                    return item.id === item1.id_of_recipe ?
                                    <TouchableOpacity key={item1.id} onPress={() => deleteFavRecipe(item)}>
                                      <MaterialIcons name="favorite" size={wp(5)} color="#249c86" />
                                    </TouchableOpacity>
                                    :
                                    null
                                  }): 
                                  <TouchableOpacity onPress={() => addFavRecipe(item)}>
                                    <MaterialIcons name="favorite-outline" size={wp(5)} color="black" />
                                  </TouchableOpacity>
                                }
                              </View>
                              <TouchableOpacity style={{flex: 1}} onPress={() => navigation.navigate('RecipeDetails', {recipe_id: item.id, recipe_ingredients: ingredients})}>
                                <Text style={{textAlign: 'right', fontFamily: 'sf-semi', fontSize: wp(3.5), color: '#249c86'}}>VIEW RECIPE</Text>
                              </TouchableOpacity>
                            </View>
                        </View>
                      : null
                    )}
                />
                }
              </View>
            </View>
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      paddingTop: 25,
    }
})