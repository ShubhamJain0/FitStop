import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, RefreshControl, ScrollView, SafeAreaView, Image, Button, TouchableOpacity } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';


export default function DriedFruits({ navigation }) {

    const [driedfruitslist, setDriedFruitsList] = useState([]);
    const [cartStatus, setCartStatus] = useState(401);
    const [cartData, setCartData] = useState([]);

    const [loading, setLoading] = useState('true');
    const [refreshing, setRefreshing] = useState(false);


    useEffect(() => {
            fetch('http://192.168.29.234:8000/store/dried-fruitslist/',{
            method: 'GET',
            headers: {
                'Content-type': 'application/json'
            }
            })
            .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
            .then(resp => setDriedFruitsList(resp.json))
            .then(() => setLoading('false'))
            .catch(error => console.log(error))
        
    }, [])


    useEffect(() => {
        const getCart = navigation.addListener('focus', () => {
            fetch('http://192.168.29.234:8000/store/cart/',{
                method: 'GET',
                headers: {
                    'Authorization': 'Token 9b309283a29535f32c28fabbd3be4e08ee3b3f76',
                    'Content-type': 'application/json'
                }
            })
            .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
            .then(resp => (setCartData(resp.json), setCartStatus(resp.status)))
            .catch(error => console.log(error))
        });

        return getCart;
        
    }, [navigation])



    const wait = timeout => {
        return new Promise(resolve => {
          setTimeout(resolve, timeout);
        });
    };


    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
    
        wait(2000).then(() => setRefreshing(false))
    
        fetch('http://192.168.29.234:8000/store/dried-fruitslist/',{
            method: 'GET',
            headers: {
            'Content-type': 'application/json'
            }
        })
        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => setDriedFruitsList(resp.json))
        .then(() => setLoading('false'))
        .catch(error => console.log(error))
    
        
    }, []);


    const buildCart = (item) => evt => {
        fetch('http://192.168.29.234:8000/store/cart/',{
            method: 'POST',
            headers: {
            'Authorization': 'Token 9b309283a29535f32c28fabbd3be4e08ee3b3f76',
            'Content-type': 'application/json'
            },
            body: JSON.stringify({ ordereditem: item })
        })
        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => setCartData(resp.json.cart))
        .catch(error => console.log(error))
    }


    const reduceItem = (item) => evt => {
        fetch('http://192.168.29.234:8000/store/reduceordelete/',{
            method: 'POST',
            headers: {
            'Authorization': 'Token 9b309283a29535f32c28fabbd3be4e08ee3b3f76',
            'Content-type': 'application/json'
            },
            body: JSON.stringify({ reduceitem: item })
        })
        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => setCartData(resp.json.cart))
        .catch(error => console.log(error))
    }


    const search = (item) => {
        for (var i=0; i < cartData.length; i++) {
            if (cartData[i].ordereditem === item.name) {
                return cartData[i];
            }
        }
    }



    if (loading == 'true') {
        return (
            <SafeAreaView style={styles.refreshcontainer}>
                <ScrollView
                    contentContainerStyle={styles.refreshscrollview}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    <Text style={{color: 'black', fontSize: 20}}>Loading....</Text>
                    <Text style={{color: 'black', marginTop: 10}}>Pull down to refresh</Text>
                </ScrollView>
            </SafeAreaView>
        )
    }


    return (
        <ScrollView style={styles.container}>
            <StatusBar style="auto" />
            {driedfruitslist.map((item) => {
                return (
                    <View key={item.id} style={{flexDirection: 'row', marginBottom: hp(3)}}>
                        <View style={{flex: 2}}>
                            <Text style={{textAlign: 'center'}}>{item.name}</Text>
                            <Text style={{textAlign: 'center'}}>{item.description}</Text>
                            <Text style={{textAlign: 'center'}}>{item.price}</Text>
                                <View style={{flexDirection: 'row'}}>
                                        
                                        {search(item) ? cartData.map((item1) => {
                                            return item1.ordereditem  === item.name ? 
                                                
                                                <View key={item1.id} style={{flexDirection: 'row'}}>
                                                    
                                                    <TouchableOpacity onPress={buildCart(item)}>
                                                        <Text>+ </Text>
                                                    </TouchableOpacity>
                                                     <Text> {item1.item_count} </Text> 
                                                    <TouchableOpacity onPress={reduceItem(item)}>
                                                        <Text> -</Text>
                                                    </TouchableOpacity>
                                                </View>
                                                : null
                                            }): 
                                            <TouchableOpacity onPress={buildCart(item)}>
                                                <Text>Add to cart</Text>
                                            </TouchableOpacity>
                                        }
                                        
                                        
                                </View>
                        </View>
                        <View style={{flex: 1}}>
                            <Image source={{uri: item.image}} style={{width: 100, height: 80}} />
                        </View>
                    </View>
                )
            })}
        </ScrollView>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: hp(15),
    },
    refreshcontainer: {
          flex: 1,
          backgroundColor: 'white'
    },
    refreshscrollview: {
          flex: 1,
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center',
    },
});