import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'react-native';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';


export default function ActiveOrders({ navigation }) {

    const [msg, setMsg] = useState('');
    const socket = useRef(null);
    const [mounted, setMounted] = useState(true);

    const [activeOrders, setActiveOrders] = useState([]);
    const [orderStatus, setOrderStatus] = useState([]);
    const [respStatus, setRespStatus] = useState(404);


    useEffect(() => {
        (async () => {
            const token = await AsyncStorage.getItem('USER_TOKEN')
            if (token) {
                fetch('http://192.168.29.234:8000/store/activeorders/',{
                    method: 'GET',
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-type': 'application/json'
                    }
                })
                .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                .then(resp => {if(mounted) {
                    setActiveOrders(resp.json.data);
                    setOrderStatus(resp.json.orderstatus);
                    setRespStatus(resp.status);
                }})
                .catch(error => console.log(error))
            } else {
                navigation.navigate('Auth');
            }
        })().catch(error => setError(error))

        return () => {
            setMounted(false);
        }
    }, [])


    const count = (item) => {
        const array = item.ordereditem
        var duplicateCount = {};
        array.forEach(e => duplicateCount[e] = duplicateCount[e] ? duplicateCount[e] + 1 : 1);
        var result = Object.keys(duplicateCount).map(e => {return {key:e, count:duplicateCount[e]}});
          
        return result.map((item1, index) => {
            return <Text key={index}>{item1.key} x{item1.count}</Text>
        })
    }


    const getStatus = (item) => {
        if (respStatus === 200) {
            for (var i=0; i < orderStatus.length; i++) {
                if (orderStatus[i].order_number === item.id) {
                    return orderStatus[i].order_status;
                }
            }
        }
    }


    return (
        <ScrollView style={styles.container}>
            <Text>Active Orders Screen</Text>

            {respStatus === 200 ? 
                activeOrders.map((item) => {
                    return (
                        <View key={item.id}>
                            {count(item)}
                            <Text>{item.total_price}</Text>
                            <Text>{getStatus(item)}</Text>
                        </View>
                    )
                })
            : <Text>No active orders!</Text>}
            
        </ScrollView>
    )
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
});