import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { Button } from 'react-native';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';



export default function PreviousOrders({ navigation }) {

    const [items, setItems] = useState([]);
    const [status, setStatus] = useState(0);

    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            const token = await AsyncStorage.getItem('USER_TOKEN')
            if (token) {
              fetch('http://192.168.29.234:8000/store/previousorders/',{
                  method: 'GET',
                  headers: {
                  'Authorization': `Token ${token}`,
                  'Content-type': 'application/json'
                  }
              })
              .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
              .then(resp => (setItems(resp.json), setStatus(resp.status)))
              .catch(error => console.log(error))
            } else {
              navigation.navigate('Auth')
            }
          })().catch(error => setError(error))
    }, [])


    const repeatOrder = (item) => async evt => {
        const token = await AsyncStorage.getItem('USER_TOKEN')
            if (token) {
              fetch('http://192.168.0.156:8000/store/repeatorder/',{
                  method: 'POST',
                  headers: {
                  'Authorization': `Token ${token}`,
                  'Content-type': 'application/json'
                  },
                  body: JSON.stringify({ordereditem: item.ordereditem})
              })
              .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
              .then(() => navigation.navigate('Store'))
              .then(() => navigation.goBack())
              .catch(error => console.log(error))
            } else {
              navigation.navigate('Auth')
            }
    }


    const filter = (item) => {
        var arr = item.ordereditem
        var filteredarray = arr.filter(function(item, pos){
            return arr.indexOf(item)== pos; 
          });

          return filteredarray;
    }

    const count = (item) => {
        const array = item.ordereditem
        var duplicateCount = {};
        array.forEach(e => duplicateCount[e] = duplicateCount[e] ? duplicateCount[e] + 1 : 1);
        var result = Object.keys(duplicateCount).map(e => {return {key:e, count:duplicateCount[e]}});
          
        return result.map((item1, index) => {
            return <Text key={index}>{item1.key} x{item1.count}</Text>
        })
    }

    return (
        <ScrollView bounces={false} style={styles.container}>
            {status === 200 ? items.map(item => {
                return(
                    <View key={item.id}>
                        <Text>{item.ordereddate}</Text>
                        {count(item)}
                        <TouchableOpacity onPress={repeatOrder(item)}>
                            <Text>Repeat Order</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('Reviews', {rateItem: item.ordereditem, action: 'create'})}>
                            <Text>Rate now!</Text>
                        </TouchableOpacity>
                    </View>
                )
            }): <Text>No orders found!</Text>}
        </ScrollView>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        
    },
})