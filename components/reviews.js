import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useContext } from 'react';
import { TouchableNativeFeedback } from 'react-native';
import { StyleSheet, Text, View, RefreshControl, ScrollView, SafeAreaView, Image, Button, TouchableOpacity, TextInput } from 'react-native';
import { AntDesign } from "@expo/vector-icons";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { UserContext } from './context';



export default function Reviews({ route, navigation }) {

    const [reviews, setReviews] = useState([]);
    const [respStatus, setRespStatus] = useState(0);

    const [ratingItems, setRatingItems] = useState([]);
    const [highlight, setHighlight] = useState(0);

    const { rateItem, action } = route.params;


    useEffect(() => {
        (async () => {
            const token = await AsyncStorage.getItem('USER_TOKEN')
            if (token) {
                fetch('http://192.168.0.156:8000/store/createrating/',{
                    method: 'GET',
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-type': 'application/json'
                    }
                })
                .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                .then(resp => (setReviews(resp.json.rating), setRespStatus(resp.status)))
                .catch(error => console.log(error))
            } else {
                navigation.navigate('Auth')
            }
        })().catch(error => setError(error))
          
      
  }, [])


  useEffect(() => {
    if (rateItem && action === 'create') {
        var arr = rateItem
        var filteredarray = arr.filter(function(item, pos){
            return arr.indexOf(item)== pos; 
        });

        
        return setRatingItems(filteredarray);
    }
    
  }, [])


    const createRating = (item) => async evt => {
        const token = await AsyncStorage.getItem('USER_TOKEN')
            if (token) {
                    fetch('http://192.168.0.156:8000/store/createrating/',{
                        method: 'POST',
                        headers: {
                            'Authorization': `Token ${token}`,
                            'Content-type': 'application/json'
                        },
                        body: JSON.stringify({ordereditem: item, stars: 5, review: 'something'})
                    })
                    .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                    .catch(error => console.log(error))
                
            } else {
                navigation.navigate('Auth')
            }
    }



    if (action === 'create')
    return (
        <View style={styles.container}>
                {ratingItems ? ratingItems.map((item, index) => {
                    return (
                        <View key={index}>
                            <Text>{item}</Text>
                            <View style={{flexDirection: 'row'}}>
                                <AntDesign name="star" size={24} style={highlight > 0 ? {color: '#99b898'}: {color: 'grey'}} onPress={() => setHighlight(1)} />
                                <AntDesign name="star" size={24} style={highlight > 1 ? {color: '#99b898'}: {color: 'grey'}} onPress={() => setHighlight(2)} />
                                <AntDesign name="star" size={24} style={highlight > 2 ? {color: '#99b898'}: {color: 'grey'}} onPress={() => setHighlight(3)} />
                                <AntDesign name="star" size={24} style={highlight > 3 ? {color: '#99b898'}: {color: 'grey'}} onPress={() => setHighlight(4)} />
                                <AntDesign name="star" size={24} style={highlight > 4 ? {color: '#99b898'}: {color: 'grey'}} onPress={() => setHighlight(5)} />
                            </View>
                            <TouchableOpacity onPress={createRating(item)}>
                                <Text>rate</Text>
                            </TouchableOpacity>
                        </View>
                    )
                }): null}
        
        </View>
    )

    if (action === 'view')
    return (
        <View style={styles.container}>
            <ScrollView bounces={false}>
                {respStatus === 200 ? reviews.map((item) => {
                    return (
                        <View key={item.id}>
                            <Text>{item.stars}</Text>
                            <Text>{item.review}</Text>
                            <Text>{item.item}</Text>
                        </View>
                    )
                }): <Text>No reviews found!</Text>}
                
            </ScrollView>
        </View>
    )
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        
    },
  });