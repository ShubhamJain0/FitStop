import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { Touchable } from 'react-native';
import { StyleSheet, Text, View, Button, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function Cart({ navigation }) {

    const [cart, setCart] = useState([]);
    const [cartStatus, setCartStatus] = useState(0);

    const [disabled, setDisabled] = useState(false);

    const [error, setError] = useState('');


    useEffect(() => {
          (async () => {
            const token = await AsyncStorage.getItem('USER_TOKEN')
            if (token) { 
                fetch('http://192.168.29.234:8000/store/cart/',{
                    method: 'GET',
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-type': 'application/json'
                    }
                })
                .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                .then(resp => (setCart(resp.json), setCartStatus(resp.status)))
                .catch(error => console.log(error))
            } else {
                setCartStatus(401);
            }
          })().catch(error => setError(error))
      }, [])



    const deleteCart = () => async evt=>  {
        const token = await AsyncStorage.getItem('USER_TOKEN')
        if (token)
            fetch('http://192.168.29.234:8000/store/cart/',{
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-type': 'application/json'
                }
            })
            .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
            .then(() => navigation.goBack())
            .catch(error => console.log(error))
    }


    const deleteItem = async (item) => {
        const token = await AsyncStorage.getItem('USER_TOKEN')
        if (token)
            fetch('http://192.168.29.234:8000/store/reduceordelete/',{
                method: 'DELETE',
                headers: {
                'Authorization': `Token ${token}`,
                'Content-type': 'application/json'
                },
                body: JSON.stringify({ item: item })
            })
            .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
            .then(resp => {
                setCart(resp.json.data);
                if (resp.json.data.length === 0){
                    setCartStatus(404);
                }
            })
            .catch(error => console.log(error))
    }
    

    return (
      <View style={styles.container}>
        <Text>Cart Screen</Text>
        {cartStatus === 200 ? cart.map((item) => {
            return (
                <View style={{alignItems: 'center'}} key={item.id}>
                    <Text>{item.ordereditem}</Text>
                    <Text>{item.price}</Text>
                    <Text>x{item.item_count}</Text>
                    <TouchableOpacity onPress={() => deleteItem(item)}>
                        <Text>Delete Item</Text>
                    </TouchableOpacity>
                </View>
            )
        }): cartStatus === 404 ? <Text>Your cart is empty!</Text>: <Text>Please Login to build your cart!</Text>}
        <TouchableOpacity disabled={cartStatus === 200 ? false: true} onPress={() => navigation.navigate('confirm')}>
            <Text style={cartStatus === 200 ? {textAlign: 'center', opacity: 1} : {textAlign: 'center', opacity: 0.1}}>Confirm</Text>
        </TouchableOpacity>
        <TouchableOpacity disabled={cartStatus === 200 ? false: true} onPress={deleteCart()}>
            <Text style={cartStatus === 200 ? {textAlign: 'center', opacity: 1} : {textAlign: 'center', opacity: 0.1}}>Delete</Text>
        </TouchableOpacity>
        <StatusBar style="auto" />
      </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
});