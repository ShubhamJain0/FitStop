import React, { useState, useEffect, useContext, useRef } from 'react';
import { TouchableOpacity } from 'react-native';
import { StyleSheet, Text, View, Image, Button, Animated, Dimensions, Easing, FlatList, TextInput, SafeAreaView } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons, FontAwesome, FontAwesome5, MaterialCommunityIcons, MaterialIcons, Feather, SimpleLineIcons, Fontisto, createIconSetFromIcoMoon } from "@expo/vector-icons";
import Svg, { Path, G, Rect, Circle, Polygon, Ellipse, Defs } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import NetInfo from "@react-native-community/netinfo";
import LottieView from 'lottie-react-native';
import { copilot, walkthroughable, CopilotStep } from "react-native-copilot";
import icoMoonConfig from '../selection.json';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';

function Recipe(props){


    const CustomIcon = createIconSetFromIcoMoon(icoMoonConfig, 'IcoMoon');

    const navigation = props.navigation;

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

    const [isOffline, setIsOffline] = useState(false);
    const [showIndic, setShowInidc] = useState(false);

    const [error, setError] = useState(null);

    //Copilot Variables
  
    const CoPilotTouchableOpacity = walkthroughable(TouchableOpacity)
    const CoPilotView = walkthroughable(View)


    //Checks for first time and launches co pilot
    useEffect(() => {
        (async () => {
        const isFirstTime = await AsyncStorage.getItem('isFirstTimeRecipe')
        if (isFirstTime === null && mounted && loading === 'true') {
            await AsyncStorage.setItem('isFirstTimeRecipe', 'false')
            props.start();
        }
        })().catch(error => setError(error))

        return () => {
          setMounted(false);
          props.copilotEvents.off("stop");
        }
        
    }, [])


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

    unsubscribe();
    }, [])


    useEffect(() => {
        fetch('http://192.168.0.105:8000/store/recipes/',{
          method: 'GET',
          headers: {
            'Content-type': 'application/json'
          }
        })
        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => {if (mounted) {setRecipesList(resp.json.qs), setFilteredList(resp.json.qs), setIngredients(resp.json.ingredients)}})
        .catch(error => setError(error))
    
        return () => {
          setMounted(false);
        }
      }, []);


      //Favourite Recipe Functions

      useEffect(() => {

        (async () => {
          const token = await SecureStore.getItemAsync('USER_TOKEN')
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
            .then(() => {if (mounted) {setLoading('false'); setIsOffline(false);}})
            .catch(error => setError(error))
          } else {
            if (mounted) {
              setLoading('false'); 
              setIsOffline(false);
            }
          }
        })().catch(error => setError(error))
    
        return () => {
          setMounted(false);
        }
      }, []);


    const addFavRecipe = async (item) => {
      const token = await SecureStore.getItemAsync('USER_TOKEN')
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
        .catch(error => setError(error))
      }
    }


    const deleteFavRecipe = async (item) => {
      const token = await SecureStore.getItemAsync('USER_TOKEN')
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
        .catch(error => setError(error))
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


    //Retry

    const retry = async () => {
      setShowInidc(true);
      const token = await SecureStore.getItemAsync('USER_TOKEN')
      try {
        
        //Recipes
        fetch('http://192.168.0.105:8000/store/recipes/',{
          method: 'GET',
          headers: {
            'Content-type': 'application/json'
          }
        })
        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => (setRecipesList(resp.json.qs), setFilteredList(resp.json.qs), setIngredients(resp.json.ingredients)))
        .catch(error => setError(error))

        //Fav Recipes
        if (token) {
          fetch('http://192.168.0.105:8000/store/favrecipes/',{
            method: 'GET',
            headers: {
              'Content-type': 'application/json',
              'Authorization': `Token ${token}`
            }
          })
          .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
          .then(resp => setFavRecipes(resp.json.data))
          .then(() => (setLoading('false'), setIsOffline(false), setShowInidc(false)))
          .catch(error => setError(error))
        } else {
          setLoading('false');
          setIsOffline(false);
          setShowInidc(false);
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
        <View style={{flex: 1, backgroundColor: '#fafafa'}}>
          <Image source={require('../assets/offline.png')} style={{width: '95%', height: 1939*(screenWidth/3300), marginTop: wp(30), alignSelf: 'center'}} />
          <View style={{width: '80%', alignSelf: 'center'}}>
            <Text style={{fontFamily: 'sofia-black', fontSize: wp(6), marginTop: 50, textAlign: 'center', color: 'black'}}>Uh oh! Seems like you are disconnected !</Text>
            {!showIndic ? <TouchableOpacity style={{alignSelf: 'center', marginTop: 25}} onPress={retry}>
              <Text style={{fontFamily: 'sofia-bold', fontSize: wp(4), color: '#249c86'}}>RETRY</Text>
            </TouchableOpacity>: <LottieView source={require('../assets/animations/connecting.json')} autoPlay={true} loop={true} style={{height: 100, alignSelf: 'center'}} />}
          </View>
        </View>
      )
    }



    if (loading === 'true') {
      return (
        <View style={{flex: 1, backgroundColor: '#fafafa', justifyContent: 'center', alignItems: 'center'}}>
          <LottieView source={require('../assets/animations/9258-bouncing-fruits.json')} style={{width: 200}} loop={true} autoPlay={true} />
        </View>
      )
    }

    return (
        <View style={styles.container}>
          <StatusBar style="inverted" />
            <View style={{flexDirection: 'row', alignItems: 'center', padding: 25, paddingBottom: 0}}>
              <View style={{flex: 1}}>
                <CopilotStep text={'You can find your favorite recipes here.'} order={5} name={'Favorites'}>
                  <CoPilotTouchableOpacity style={{alignSelf: 'flex-start'}} onPress={() => navigation.navigate('FavRecipe')}>
                    <MaterialIcons name="favorite-outline" size={wp(6)} color="black" />
                  </CoPilotTouchableOpacity>
                </CopilotStep>
              </View>
              <View style={{flex: 1}}>
                <CopilotStep text={'Search recipes....'} order={6} name={'Search'}>
                  <CoPilotTouchableOpacity style={{alignSelf: 'flex-end'}} onPress={() => tiDisplay === 'none' ? (setTiDisplay('flex')): (setTiDisplay('none'), searchRef.current.blur())}>
                    <Feather name="search" size={wp(6)} color="black" />
                  </CoPilotTouchableOpacity>
                </CopilotStep>
              </View>
              <View style={{width: '50%', display: tiDisplay, marginLeft: 10}}>
                <TextInput ref={searchRef} style={{ }} placeholder="search" value={query} onChangeText={(text) => searchFilterFunction(text)} />
              </View>
            </View>
            <View style={{padding: 25, paddingLeft: 25, paddingTop: 20}}>
              <Text style={{fontFamily: 'sofia-black', fontSize: wp(7), color: 'black'}}>{category} Recipes</Text>
            </View>
            <View style={{flex: 1, flexDirection: 'row'}}>
              <View style={{flex: 0.5, marginTop: hp(13)}}>
                <CopilotStep text={'Start you day with healthy and delicious breakfast !'} order={1} name={'Breakfast'}>
                  <CoPilotTouchableOpacity style={{marginBottom: 100, transform: [{rotate: '-90deg'}]}} onPress={() => setCategory('Break Fast')} activeOpacity={0.8}>
                    <Text style={{fontFamily: 'Maison-bold', fontSize: wp(4), textAlign: 'center', opacity: category === 'Break Fast' ? 1 : 0.2, color: 'black'}}>Break Fast</Text>
                    {category === 'Break Fast' ? <Text style={{backgroundColor: '#249C86', height: 2, width: '50%', marginTop: 5, alignSelf: 'center'}}></Text> : <Text style={{ height: 2, marginTop: 5}}></Text>}
                  </CoPilotTouchableOpacity>
                </CopilotStep>
                <CopilotStep text={'Never miss your mid-day meal !'} order={2} name={'Lunch'}>
                  <CoPilotTouchableOpacity style={{marginBottom: 100, transform: [{rotate: '-90deg'}]}} onPress={() => setCategory('Lunch')} activeOpacity={0.8}>
                    <Text style={{fontFamily: 'Maison-bold', fontSize: wp(4), textAlign: 'center', opacity: category === 'Lunch' ? 1 : 0.2, color: 'black'}}>Lunch</Text>
                    {category === 'Lunch' ? <Text style={{backgroundColor: '#249C86', height: 2, width: '35%', marginTop: 5, alignSelf: 'center'}}></Text> : <Text style={{ height: 2, marginTop: 5}}></Text>}
                  </CoPilotTouchableOpacity>
                </CopilotStep>
                <CopilotStep text={'End your day with a healthy dinner !'} order={3} name={'Dinner'}>
                  <CoPilotTouchableOpacity style={{marginBottom: 100, transform: [{rotate: '-90deg'}]}} onPress={() => setCategory('Dinner')} activeOpacity={0.8}>
                    <Text style={{fontFamily: 'Maison-bold', fontSize: wp(4), textAlign: 'center', opacity: category === 'Dinner' ? 1 : 0.2, color: 'black'}}>Dinner</Text>
                    {category === 'Dinner' ? <Text style={{backgroundColor: '#249C86', height: 2, width: '35%', marginTop: 5, alignSelf: 'center'}}></Text> : <Text style={{ height: 2, marginTop: 5}}></Text>}
                  </CoPilotTouchableOpacity>
                </CopilotStep>
              </View>
              <View style={{flex: 1.5}}>
                {category === 'Break Fast' ? 
                  <FlatList 
                    data={filteredList}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{paddingLeft: 20, paddingBottom: 100}}
                    ListEmptyComponent={() => (!filteredList.length ? <Text style={{fontFamily: 'Maison-bold', textAlign: 'center', fontSize: wp(5), color: 'grey', marginTop: 25}}>No recipes found !</Text>: null)}
                    renderItem={({ item, index }) => (
                      item.category === 'Breakfast' ?
                        <View style={{backgroundColor: 'white', marginTop: 15, marginBottom: 35, width: '90%', padding: 25, borderRadius: 25, elevation: 15, shadowOffset: {width: 0, height: 7}, shadowRadius: 9.51, shadowOpacity: 0.43, shadowColor: '#000'}} >
                            <View style={{backgroundColor: 'white', borderRadius: 100, width: 125, height: 125, alignSelf: 'center', elevation: 15, shadowOffset: {width: 0, height: 7}, shadowRadius: 9.51, shadowOpacity: 0.43, shadowColor: '#000'}}>
                              <Image source={{uri: item.image}} style={{width: 125, height: 125, alignSelf: 'center', borderRadius: 100}} />
                            </View>
                            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center',  marginTop: 15, justifyContent: 'center'}}>
                              <MaterialIcons name="local-fire-department" size={wp(4.5)} color="#249C86" />
                              <Text style={{fontFamily: 'Maison-bold', fontSize: wp(4), textAlign: 'center', color: 'grey'}}> {item.value1} </Text>
                              <Text style={{fontFamily: 'Maison-bold', fontSize: wp(5), textAlign: 'center', color: 'grey'}}> | </Text>
                              <Ionicons name="ios-people" size={wp(4)} color="#249c86" />
                              <Text style={{fontFamily: 'Maison-bold', fontSize: wp(4), textAlign: 'center', color: 'grey'}}>  Serves {item.servings}</Text>
                            </View>
                            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 5}}>
                              <View style={{ flex: 1, alignItems: 'flex-end'}}>
                                <MaterialIcons name="favorite" size={wp(4)} color="#249C86" />
                              </View>
                              <Text style={{fontFamily: 'Maison-bold', fontSize: wp(4), textAlign: 'left', color: 'grey', flex: 1}}> {item.count} </Text>
                            </View>
                            <Text style={{fontFamily: 'sofia-bold', fontSize: wp(5), marginTop: 15, color: 'black'}}>{item.name}</Text>
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
                                  index === 0 ?
                                  <CopilotStep text={'Like the recipe ? Show your love !'} order={4} name={'Love'}>
                                    <CoPilotTouchableOpacity style={{alignSelf: 'flex-start'}} onPress={() => addFavRecipe(item)}>
                                      <MaterialIcons name="favorite-outline" size={wp(5)} color="black" />
                                    </CoPilotTouchableOpacity>
                                  </CopilotStep> :
                                  <TouchableOpacity style={{alignSelf: 'flex-start'}} onPress={() => addFavRecipe(item)}>
                                    <MaterialIcons name="favorite-outline" size={wp(5)} color="black" />
                                  </TouchableOpacity>
                                }
                              </View>
                              <TouchableOpacity style={{flex: 1}} onPress={() => navigation.navigate('RecipeDetails', {recipe_id: item.id, recipe_ingredients: ingredients})}>
                                <Text style={{textAlign: 'right', fontFamily: 'Maison-bold', fontSize: wp(3.5), color: '#249c86'}}>VIEW RECIPE</Text>
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
                    ListEmptyComponent={() => (!filteredList.length ? <Text style={{fontFamily: 'Maison-bold', textAlign: 'center', fontSize: wp(5), color: 'grey', marginTop: 25}}>No recipes found !</Text>: null)}
                    renderItem={({ item }) => (
                      item.category === 'Lunch' ?
                        <View style={{backgroundColor: 'white', marginTop: 15, marginBottom: 35, width: '90%', padding: 25, borderRadius: 25, elevation: 15, shadowOffset: {width: 0, height: 7}, shadowRadius: 9.51, shadowOpacity: 0.43, shadowColor: '#000'}} >
                            <View style={{backgroundColor: 'white', borderRadius: 100, width: 125, height: 125, alignSelf: 'center', elevation: 15, shadowOffset: {width: 0, height: 7}, shadowRadius: 9.51, shadowOpacity: 0.43, shadowColor: '#000'}}>
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
                            <Text style={{fontFamily: 'sofia-bold', fontSize: wp(5), marginTop: 15, color: 'black'}}>{item.name}</Text>
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
                                <Text style={{textAlign: 'right', fontFamily: 'Maison-bold', fontSize: wp(3.5), color: '#249c86'}}>VIEW RECIPE</Text>
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
                    ListEmptyComponent={() => (!filteredList.length ? <Text style={{fontFamily: 'Maison-bold', textAlign: 'center', fontSize: wp(5), color: 'grey', marginTop: 25}}>No recipes found !</Text>: null)}
                    renderItem={({ item }) => (
                      item.category === 'Dinner' ?
                        <View style={{backgroundColor: 'white', marginTop: 15, marginBottom: 35, width: '90%', padding: 25, borderRadius: 25, elevation: 15, shadowOffset: {width: 0, height: 7}, shadowRadius: 9.51, shadowOpacity: 0.43, shadowColor: '#000'}} >
                            <View style={{backgroundColor: 'white', borderRadius: 100, width: 125, height: 125, alignSelf: 'center', elevation: 15, shadowOffset: {width: 0, height: 7}, shadowRadius: 9.51, shadowOpacity: 0.43, shadowColor: '#000'}}>
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
                            <Text style={{fontFamily: 'sofia-bold', fontSize: wp(5), marginTop: 15, color: 'black'}}>{item.name}</Text>
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
                                <Text style={{textAlign: 'right', fontFamily: 'Maison-bold', fontSize: wp(3.5), color: '#249c86'}}>VIEW RECIPE</Text>
                              </TouchableOpacity>
                            </View>
                        </View>
                      : null
                    )}
                />
                }
              </View>
            </View>
            <View style={{width: '100%', bottom: 0, backgroundColor: '#fafafa', padding: 5, paddingTop: 10, flexDirection: 'row', alignItems: 'center', elevation: 15, shadowOffset: {width: 0, height: 7}, shadowOpacity: 0.43, shadowRadius: 9.51, shadowColor: '#000'}}>
                <View style={{flex: 1}}>
                    <TouchableOpacity onPress={() => navigation.navigate('Home')} activeOpacity={1}>
                      <CustomIcon name="home-1" size={wp(6)} style={{color: 'black', alignSelf: 'center'}} />
                      <Text style={{fontFamily: 'Maison-bold', fontSize: wp(3), color: 'black', textAlign: 'center'}}>Home</Text>
                    </TouchableOpacity>         
                </View>
                <View style={{flex: 1}}>
                  <TouchableOpacity onPress={() => navigation.navigate('Fruits')} activeOpacity={1}>
                  <CustomIcon name="store-1" size={wp(6)} style={{color: 'black', alignSelf: 'center'}} />
                    <Text style={{fontFamily: 'Maison-bold', fontSize: wp(3), color: 'black', textAlign: 'center'}}>Store</Text>
                  </TouchableOpacity>
                </View>
                <View style={{flex: 1}}>
                    <CustomIcon name="salad" size={wp(6.5)} style={{color: '#249c86', alignSelf: 'center'}} />
                    <Text style={{fontFamily: 'Maison-bold', fontSize: wp(3), color: '#249c86', textAlign: 'center'}}>Recipes</Text>
                </View>          
            </View>
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fafafa',
      paddingTop: 25,
    }
})



const StepNumberComponent = ({
  isFirstStep,
  isLastStep,
  currentStep,
  currentStepNumber,
}) => {
  return (
    <View style={{backgroundColor: '#249c86', flex: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderRadius: 14, borderColor: 'white'}}>
      <Text style={{fontFamily: 'sofia-medium', fontSize: wp(4)}}>{currentStepNumber}</Text>
    </View>
  )
}

const TooltipComponent = ({
  isFirstStep,
  isLastStep,
  handleNext,
  handlePrev,
  handleStop,
  currentStep,
  labels,
}) => {
  return (
    <View>
    <View style={{flex: 1}}>
      <Text testID="stepDescription" style={{fontFamily: 'Maison-bold', fontSize: wp(3.5), color: 'black'}}>{currentStep.text}</Text>
    </View>
    <View style={{marginTop: 10, flexDirection: 'row', justifyContent: 'flex-end'}}>
      {
        !isLastStep ?
          <TouchableOpacity onPress={handleStop}>
            <Text style={{padding: 10, fontFamily: 'Maison-bold', color: '#249c86'}}>{labels.skip || 'Skip'}</Text>
          </TouchableOpacity>
          : null
      }
      {
        !isFirstStep ?
          <TouchableOpacity onPress={handlePrev}>
            <Text style={{padding: 10, fontFamily: 'Maison-bold', color: '#249c86'}}>{labels.previous || 'Previous'}</Text>
          </TouchableOpacity>
          : null
      }
      {
        !isLastStep ?
          <TouchableOpacity onPress={handleNext}>
            <Text style={{padding: 10, fontFamily: 'Maison-bold', color: '#249c86'}}>{labels.next || 'Next'}</Text>
          </TouchableOpacity> :
          <TouchableOpacity onPress={handleStop}>
            <Text style={{padding: 10, fontFamily: 'Maison-bold', color: '#249c86'}}>{labels.finish || 'Done'}</Text>
          </TouchableOpacity>
      }
    </View>
  </View>
  )
};




export default copilot({
  overlay: 'view', 
  animated: true, 
  backdropColor: 'rgba(0, 0, 0, 0.8)', 
  stepNumberComponent: StepNumberComponent,
  tooltipComponent: TooltipComponent,
})(Recipe);