import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useContext, useRef } from 'react';
import { TouchableOpacity } from 'react-native';
import { StyleSheet, Text, View, RefreshControl, ScrollView, SafeAreaView, Image, Button, Animated, Dimensions, Modal, Easing, FlatList, TextInput } from 'react-native';
import BouncingPreloader from 'react-native-bouncing-preloaders';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons, FontAwesome, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Path, G, Rect, Circle } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function Fruits({ navigation }) {

    const [fruitslist, setFruitsList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [cartStatus, setCartStatus] = useState(401);
    const [cartData, setCartData] = useState([]);

    const [loading, setLoading] = useState('true');
    const [refreshing, setRefreshing] = useState(false);
    const [refreshOpacity, setRefreshOpacity] = useState(0);

    const animation = new Animated.Value(0);
    const screenHeight = Dimensions.get("window").height;

    const [error, setError] = useState('');

    const [query, setQuery] = useState('');
    const searchInputRef = useRef(null);

    useEffect(() => {
        let mounted = true;
        let timeOut = setTimeout(() => setRefreshOpacity(1), 8000)
            fetch('http://192.168.29.234:8000/store/fruitslist/',{
            method: 'GET',
            headers: {
                'Content-type': 'application/json'
            }
            })
            .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
            .then(resp => {if (mounted) {setFruitsList(resp.json); setFilteredList(resp.json);}})
            .then(() => setTimeout(() => setLoading('false'), 3000))
            .catch(error => console.log(error))

        return () => {
            mounted = false;
            clearTimeout(timeOut);
        }
    }, [])


    useEffect(() => {
        let mounted = true;
        const getCart = navigation.addListener('focus', () => {
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
                    .then(resp => {if (mounted) {setCartData(resp.json), setCartStatus(resp.status)}})
                    .catch(error => console.log(error))
                } else {
                    if (mounted) {
                        setCartData([]);
                    }
                }
                

            })().catch(error => console.log(error))
        });

        return () => {
            mounted = false;
        }
        
    }, [navigation])



    const searchFilterFunction = (text) => {
        // Check if searched text is not blank
        if (text) {
          // Inserted text is not blank
          // Filter the masterDataSource
          // Update FilteredDataSource
          const newData = fruitslist.filter(
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
          setFilteredList(fruitslist);
          setQuery(text);
        }
      };


    const wait = timeout => {
        return new Promise(resolve => {
          setTimeout(resolve, timeout);
        });
    };


    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
    
        wait(2000).then(() => setRefreshing(false))
    
        fetch('http://192.168.29.234:8000/store/fruitslist/',{
            method: 'GET',
            headers: {
            'Content-type': 'application/json'
            }
        })
        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => setFilteredList(resp.json))
        .then(() => setLoading('false'))
        .catch(error => console.log(error))
    
        
    }, []);


    const buildCart = (item) => async evt  => {
            const token =  await AsyncStorage.getItem('USER_TOKEN')
            if (token) {
                return fetch('http://192.168.29.234:8000/store/cart/',{
                    method: 'POST',
                    headers: {
                    'Authorization': `Token ${token}`,
                    'Content-type': 'application/json'
                    },
                    body: JSON.stringify({ ordereditem: item })
                })
                .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                .then(resp => setCartData(resp.json.cart))
                .catch(error => console.log(error))
            } else {
                navigation.navigate('Auth')
            }
    }


    const reduceItem = (item) => async evt => {
        const token = await AsyncStorage.getItem('USER_TOKEN')
        if (token) {
        return fetch('http://192.168.29.234:8000/store/reduceordelete/',{
            method: 'POST',
            headers: {
            'Authorization': `Token ${token}`,
            'Content-type': 'application/json'
            },
            body: JSON.stringify({ reduceitem: item })
        })
        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => setCartData(resp.json.cart))
        .catch(error => console.log(error))
        } else {
            navigation.navigate('Auth')
        }
    }


    const search = (item) => {
        if (cartStatus !== 401) {
            for (var i=0; i < cartData.length; i++) {
                if (cartData[i].ordereditem === item.name) {
                    return cartData[i];
                }
            }
        }
    }


    const handleOpen = () => {
        Animated.timing(animation, {
          toValue: 1,
          duration: 1,
          useNativeDriver: true,
        }).start();
      };


    const handleClose = () => {
        Animated.timing(animation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }).start();
        
      };
    

      const slideUp = {
        transform: [
          {
            translateY: animation.interpolate({
              inputRange: [0.01, 1],
              outputRange: [0, -1 * screenHeight],
            }),
          },
        ],
      };

    

    if (loading == 'true') {
        return (
            <SafeAreaView style={styles.refreshcontainer}>
                <View style={{flex: 0.5, paddingTop: hp(15)}}>
                    <TouchableOpacity style={{alignItems: 'center', marginBottom: hp(15)}} onPress={() => navigation.navigate('cart')}>
                        <Svg height={hp(5)} viewBox="0 0 512 512" width="512"><Path fill="#99B898" d="M509.739,89.437c-2.022-2.586-5.122-4.097-8.405-4.096H96c-5.891-0.001-10.668,4.773-10.669,10.664  c0,0.717,0.072,1.433,0.216,2.136l42.667,213.333c1.079,5.531,6.274,9.269,11.861,8.533l320-42.667c4.339-0.58,7.883-3.752,8.939-8  L511.68,98.674C512.505,95.461,511.787,92.046,509.739,89.437z"/><G><Circle fill="#455A64" cx="394.667" cy="437.341" r="53.333"/><Circle fill="#455A64" cx="181.333" cy="437.341" r="53.333"/><Path fill="#455A64" d="M191.125,362.674h246.208c5.891,0,10.667-4.776,10.667-10.667c0-5.891-4.776-10.667-10.667-10.667   H191.125c-25.408-0.053-47.272-17.976-52.309-42.88L85.12,29.874c-1.014-4.967-5.384-8.534-10.453-8.533h-64   C4.776,21.341,0,26.116,0,32.007s4.776,10.667,10.667,10.667H65.92l51.989,259.968   C124.954,337.505,155.557,362.598,191.125,362.674z"/></G><G></G><G></G><G></G><G></G><G></G><G></G><G></G><G></G><G></G><G></G><G></G><G></G><G></G><G></G><G></G></Svg>
                    </TouchableOpacity>
                    <TouchableOpacity disabled={true} style={{alignItems: 'center', margin: hp(4)}} onPress={() => navigation.navigate('Fruits')} >
                        <Svg height={hp(5)} viewBox="0 0 512 512" width="512"><Path d="m344 88s0-48-32-64c-32 16-32 64-32 64v72h64z" fill="#35a872"/><Path d="m336 192s9.455-80 104-80c0 0-47.273 40-47.273 80z" fill="#248256"/><Path d="m288 192s-9.455-80-104-80c0 0 47.273 40 47.273 80z" fill="#248256"/><Path d="m304 152s9.455-80 104-80c0 0-47.273 40-47.273 80z" fill="#319c6a"/><Path d="m320 152s-9.455-80-104-80c0 0 47.273 40 47.273 80z" fill="#2e9163"/><Rect fill="#f7b030" height="304" rx="128" width="256" x="184" y="144"/><G fill="#e09f2c"><Path d="m402.79 318.2-45.26 43.89-45.41-44.08 45.26-43.94z"/><Path d="m312.12 318.01-45.4 44.08-45.27-43.9 45.4-44.14z"/><Path d="m309.87 144.02-43.14 41.93-22.93-22.28a127.231 127.231 0 0 1 66.07-19.65z"/><Path d="m312.1 230.05-45.25 44-45.41-44.08 45.29-44.02z"/><Path d="m402.81 229.97-45.43 44.1-45.28-44.02 45.39-44.12z"/><Path d="m380.31 163.74-22.82 22.19-43.11-41.91a127.258 127.258 0 0 1 65.93 19.72z"/><Path d="m221.44 229.97-37.31 36.27a127.238 127.238 0 0 1 16.17-56.79z"/><Path d="m439.86 265.98-37.05-36.01 20.97-20.36a127.14 127.14 0 0 1 16.08 56.37z"/><Path d="m440 282.12v37.88a127.891 127.891 0 0 1 -3.73 30.76l-33.48-32.56z"/><Path d="m221.45 318.19-33.68 32.75a128.261 128.261 0 0 1 -3.77-30.94v-38.12z"/></G><Path d="m266.72 362.09-47.49 46.11a127.877 127.877 0 0 1 -31.46-57.26l33.68-32.75z" fill="#f7b030"/><Path d="m404.89 408.07a128.015 128.015 0 0 1 -185.66.13l47.49-46.11 45.4 44.03 45.41-44.03z" fill="#e09f2c"/><Path d="m349.25 442.12a1.831 1.831 0 0 0 -.3.46 128.6 128.6 0 0 1 -73.95-.02v-.44l37.12-36z" fill="#f7b030"/><Path d="m488 328c0 77.32-82.38 160-184 160s-184-82.68-184-160z" fill="#35a872"/><Path d="m455.67 328c-5.21 63.3-71.12 128-151.67 128s-146.46-64.7-151.67-128z" fill="#d13330"/><Path d="m416 360a8 8 0 0 1 -16 0c0-4.418 3.582-16 8-16s8 11.582 8 16z" fill="#5e3725"/><Path d="m376 400a8 8 0 0 1 -16 0c0-4.418 3.582-16 8-16s8 11.582 8 16z" fill="#5e3725"/><Path d="m336 376a8 8 0 0 1 -16 0c0-4.418 3.582-16 8-16s8 11.582 8 16z" fill="#5e3725"/><Path d="m288 376a8 8 0 0 1 -16 0c0-4.418 3.582-16 8-16s8 11.582 8 16z" fill="#5e3725"/><Path d="m312 424a8 8 0 0 1 -16 0c0-4.418 3.582-16 8-16s8 11.582 8 16z" fill="#5e3725"/><Path d="m232 400a8 8 0 0 0 16 0c0-4.418-3.582-16-8-16s-8 11.582-8 16z" fill="#5e3725"/><Path d="m183.912 280c-6.38 0-23 4.354-29.855 9.5a29.742 29.742 0 0 1 -36.114 0c-6.854-5.145-23.475-9.5-29.855-9.5-41.723 0-69.92 37.576-63.06 83.661l5 33.576a170.458 170.458 0 0 0 19.586 57.937c14.323 25.666 41.786 38.077 68.005 30.736l13.381-4.788a14.779 14.779 0 0 1 10 0l13.381 4.788c26.222 7.341 53.682-5.07 68.008-30.736a170.458 170.458 0 0 0 19.586-57.937l5-33.576c6.857-46.085-21.34-83.661-63.063-83.661z" fill="#eb423f"/><Path d="m136 336a8 8 0 0 1 -8-8c0-.75.023-18.623 2.036-39.758 2.781-29.2 7.931-49.615 15.308-60.68a8 8 0 0 1 13.312 8.875c-12.01 18.016-14.656 72.205-14.656 91.563a8 8 0 0 1 -8 8z" fill="#5e3725"/><Path d="m165.657 314.343a8 8 0 0 0 -11.314 0c-.056.057-6.2 5.657-18.343 5.657s-18.184-5.512-18.435-5.747l.088.087a8 8 0 1 0 -11.306 11.321c1.073 1.072 10.897 10.339 29.653 10.339 18.772 0 28.6-9.285 29.657-10.343a8 8 0 0 0 0-11.314z" fill="#c7312e"/></Svg>
                    </TouchableOpacity>
                    <TouchableOpacity disabled={true} style={{alignItems: 'center', margin: hp(4), opacity: 0.2}} onPress={() => navigation.navigate('Dried-Fruits')} >
                        <Svg viewBox="0 0 512 512" height={hp(4)} width="512"><Path d="m489.67 108.004c-2.908-15.691-14.747-28.731-29.985-33.363-4.553-1.384-9.333-1.998-14.088-1.805-31.893 1.295-95.203 10.662-167.722 57.987-2.73-6.533-5.607-12.952-8.648-19.239-24.736-51.141-54.603-83.261-75.304-101.2-11.829-10.252-29.051-13.163-43.653-7.612-4.646 1.766-8.977 4.356-12.733 7.611-24.217 20.988-58.503 59.07-84.318 121.302-1.59 3.834.229 8.232 4.063 9.823 3.834 1.588 8.232-.228 9.823-4.063 20.617-49.701 46.739-83.165 68.185-104.461-9.267 18.721-19.735 44.861-28.874 79.98-15.709 60.37-23.674 132.275-23.674 213.718 0 54.101 7.87 100.309 22.759 133.628 5.103 11.42 10.969 21.081 17.438 28.849-19.277-7.365-36.57-19.8-50.622-36.718-25.745-30.996-39.353-74.483-39.353-125.759 0-59.448 8.106-114.032 24.092-162.234 1.306-3.94-.829-8.194-4.768-9.5-3.947-1.307-8.195.828-9.501 4.768-16.492 49.731-24.855 105.907-24.855 166.966 0 54.828 14.808 101.636 42.822 135.364 26.756 32.213 64.038 49.954 104.976 49.954 12.627 0 24.903-1.693 36.632-4.972 11.755 3.298 23.894 4.963 36.224 4.963 18.458 0 37.33-3.684 55.899-11.01 33.068-13.046 64.673-37.645 91.399-71.139 23.191-29.065 42.99-58.882 58.846-88.624 1.952-3.663.567-8.216-3.097-10.169-3.663-1.953-8.216-.567-10.169 3.097-15.423 28.931-34.713 57.974-57.331 86.32-25.089 31.442-54.539 54.448-85.165 66.531-20.172 7.957-40.66 11.155-60.356 9.542 15.757-8.345 30.003-19.935 42.095-34.493 4.413-5.313 8.497-10.952 12.249-16.895 17.532-15.495 35.112-34.235 52.267-55.733 50.797-63.661 89.419-124.834 114.793-181.82 14.748-33.121 22.868-60.065 27.304-80.471 4.351 38.257 2.825 102.158-32.757 180.485-1.586 3.489-.214 7.73 3.112 9.633 3.794 2.17 8.77.557 10.574-3.415 42.99-94.636 38.138-169.577 31.421-205.826zm-189.161 94.461c71.675-69.936 126.174-97.159 153.821-107.424l-142.946 179.146c-2.095-24.967-5.73-48.893-10.875-71.722zm129.104-113.325c-52.416 24.469-102.298 66.979-133.235 96.436-3.692-13.935-7.981-27.429-12.855-40.472 59.535-39.5 112.533-52.207 146.09-55.964zm-331.837 237.542c0-80.167 7.802-150.799 23.189-209.932 12.224-46.98 26.753-77.027 37.249-94.454v473.732c-14.791-3.684-28.424-18.214-38.987-41.851-14.034-31.405-21.451-75.492-21.451-127.495zm161.367 125.759c-14.053 16.919-31.345 29.353-50.623 36.718 6.469-7.768 12.335-17.429 17.439-28.849 14.889-33.319 22.759-79.527 22.759-133.628 0-4.151-3.365-7.517-7.516-7.517-4.152 0-7.516 3.365-7.516 7.517 0 52.004-7.418 96.09-21.45 127.495-10.563 23.637-24.197 38.166-38.988 41.851v-473.735c21.036 34.892 55.33 114.851 59.93 269.594.124 4.149 3.624 7.428 7.737 7.29 4.15-.123 7.414-3.587 7.29-7.737-4.027-135.444-30.699-215.469-51.994-258.41 18.18 18.084 40.381 45.604 59.483 85.099 28.403 58.723 42.804 128.89 42.804 208.553-.001 51.276-13.609 94.763-39.355 125.759zm177.14-250.958c-24.855 55.819-62.81 115.896-112.811 178.559-7.278 9.121-14.627 17.718-22.005 25.759 7.96-23.665 12.063-50.28 12.063-79.118 0-10.22-.232-20.292-.695-30.21l153.244-192.052c-2.665 20.167-10.05 52.714-29.796 97.062z" fill="black" /></Svg>
                    </TouchableOpacity>
                    <TouchableOpacity disabled={true} style={{alignItems: 'center', margin: hp(4), opacity: 0.2}} onPress={() => navigation.navigate('Exotics')} >
                        <Svg  viewBox="0 0 512 512" height={hp(4)} width="512" stroke="black" strokeWidth="5" ><Path d="m490 216.9c4.7-9.5 7.2-20 7.2-30.6 0-35.7-27.3-65.2-62.2-68.6 3.2-14.6-2.1-30.8-14.7-43.2-16.8-16.6-40.5-21.7-61.8-13.8-8-14.8-21.2-27.3-38.5-36.5-18.3-9.7-40-14.7-60.9-14.1-19.7.6-38.1 6.1-53.3 15.9-15.4 10-27.2 24-35 41.7-22.7-10.4-45.1-9.5-63.8 2.6-20.6 13.3-33 38.8-31.1 63.5.1 1.2.2 2.3.4 3.5-30.3-1.6-57.7 19.7-62.9 50.3-4.9 29.1 11.8 56.9 38.5 66.8-6.4 13.1-6.6 28.5-.4 41.9 8.3 18 26.1 28.6 44.7 28.6 4.1 0 8.2-.5 12.3-1.6l71.6 153.9c5.9 12.7 18.7 20.8 32.6 20.8h.4l86.4-.9c15.7-.2 29.3-10.3 34-25.3 1.5-5 3.1-10.1 4.7-15.3 12.6-41.2 27.5-90.3 57.9-140.6 4.8 1.9 9.9 2.9 14.9 2.9 7.5 0 15.1-2.1 21.7-6.4 8.2-5.3 14.2-13.3 17-22.5 1.4.1 2.7.2 4.1.2 25.1 0 45.5-20.4 45.5-45.5.1-10.1-3.2-19.8-9.3-27.7zm-464.7-27.2c4.4-25.7 28.3-43.3 54-40 .7 1.9 1.4 3.7 2.2 5.5-8.7 10.7-13.9 23.9-14.6 37.6-.8 15.3 4 30.2 13.5 42.1 2.6 3.3 5.5 6.2 8.7 8.9-7.7 2.7-16 3.4-24.1 2-26.4-4.6-44.2-29.7-39.7-56.1zm37.1 101.7c-5-10.9-4.4-23.4 1.4-33.8 3.1.5 6.2.7 9.3.7 1.7 0 3.3-.1 5-.2l25.2 54.2c-16.4 3.2-33.6-5-40.9-20.9zm264.3 161.6c-1.6 5.2-3.1 10.3-4.7 15.3-3.1 10-12.2 16.8-22.7 16.9l-86.4.9c-.1 0-.2 0-.3 0-9.3 0-17.8-5.4-21.8-13.9l-100.5-216.4c3.7-1.1 7.4-2.6 10.9-4.4 6.7 3.3 14.1 5.5 21.9 6.2 1.3.1 2.6.2 4 .2 7.8 15.3 40.2 78.7 50.3 96.6 5 9 13 14.2 21.1 14.2 1.6 0 3.3-.2 4.9-.6 10.2-2.7 16.8-13 16.7-26.2 0-.2 0-.3 0-.5l-7.1-86.1c9.9 5.2 20.3 8.9 31 11l17.8 100.9c2.1 11.9 12.3 20.2 24 20.2 1.2 0 2.3-.1 3.5-.3 6.7-1 12.7-4.7 16.6-10.2l78.5-113.1c2.4.3 4.8.4 7.2.4 6.8 0 13.5-1 20-3 1 2.2 2.2 4.4 3.5 6.4-52 66.1-72.1 132.2-88.4 185.5zm-149.4-182.7c-11.6 4.3-23.7 2.7-32.8-4.5-1.7-3.4-3.2-6.3-4.5-8.8 10.8-1.8 21.1-6.4 30-13.5 4.2-3.4 8-7.3 11.2-11.5 5.7 5.7 11.7 10.7 17.9 15.1-2.8 10.4-10.8 19.1-21.8 23.2zm24.5-3 6.2 74.8c0 7.5-3.1 13.1-7.8 14.3-4.3 1.1-9.1-1.9-12.5-7.8-6.2-11.2-21.8-41.1-34.2-65.3 3.5.9 7.2 1.3 10.9 1.3 5.7 0 11.4-1 17.1-3.2 8.1-2.9 15-7.8 20.3-14.1zm128.7-18.8c3.3-2.2 6.6-4.5 9.7-7 .1.2.3.3.4.5 8.4 9.1 19 15.8 30.8 19.3l-75.6 108.8c-2 2.8-5 4.7-8.4 5.2-5.4.8-10.5-2-12.9-6.7zm-60 100.3-9.2-51.9c7.5 4.3 16.6 7.2 26 7.2 1.4 0 2.7-.1 4.1-.2zm27.3-58.7c-14.4 5.7-32.8-2.2-39.6-11.1l-1.9-11c2.9.2 5.9.4 8.9.4 16.5 0 32.5-3.5 47.5-10.1zm128.6 12.2c-7.2 4.6-15.8 5.7-23.7 3.2 6.1-9.5 12.8-19 20.2-28.5 4.5 4.3 9.8 7.7 15.4 9.9-2.1 6.4-6.3 11.8-11.9 15.4zm27.5-24.2c-12.7 0-25.6-9.1-31.3-21.4 5.5-2.8 10.8-6.4 15.5-10.8 7.3-6.7 13-14.9 16.9-24 1.4-3.3-.4-7.1-3.9-8.1-2.9-.8-6 .7-7.2 3.5-3.1 7.5-7.9 14.2-13.9 19.8-14.6 13.5-34.8 18.3-54 13-10.2-2.8-19.3-8.5-26.5-16.3-12.5-13.5-17.6-32.3-13.8-50.4 1.6-7.8 4.9-15.1 9.5-21.5 1.6-2.2 1.6-5.1 0-7.2-2.4-3.2-7.3-3.2-9.6 0-5.7 7.8-9.6 16.7-11.6 26.2-3.7 17.6-.3 35.9 9.1 50.9-20 16.1-43.4 24.5-67.8 24.5-28.6 0-55.3-12-77.4-34.8 4.8-9.7 7.2-20.6 6.7-31.5-.2-3.6-3.4-6.3-6.9-5.7-3.1.5-5.2 3.2-5.1 6.3.8 16.6-6.6 32.9-20 43.6-11 8.8-24.6 12.9-38.4 11.6-13.7-1.3-25.9-7.9-34.4-18.5-14-17.5-14.3-42.6-1.6-61.1 6.7 8.8 15.9 16 27.2 21 3 1.4 6.6 0 7.9-3s0-6.6-3-7.9c-19.4-8.6-30.9-24-32.4-43.3-1.6-20.5 8.6-41.6 25.5-52.5 16.5-10.7 36.9-10.4 57.5.8 1.5.8 3.3 1 5 .3 1.6-.6 2.9-1.9 3.5-3.5 12.9-34.5 42-54.9 79.9-56 39.5-1.2 77.8 19.3 90.8 48.8.7 1.5 1.9 2.7 3.4 3.2 1.5.6 3.2.5 4.7-.3 21.8-10.7 42.5-1.8 53.6 9.2 13.8 13.6 13.9 28.4 9.5 37.7-.9 1.9-.7 4.1.4 5.9 1.2 1.8 3.1 2.8 5.3 2.7h1.2c31.4 0 57 25.5 57 57 0 10-2.6 19.8-7.6 28.4-1.3 2.3-1 5.2.8 7.1 5.8 6.2 9.1 14.3 9.1 22.9-.1 18.4-15.1 33.4-33.6 33.4z" fill="black" /></Svg>
                    </TouchableOpacity>                             
                </View>
                <View style={{flex: 1}}>
                    <ScrollView bounces={false}
                        contentContainerStyle={styles.refreshscrollview}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    >
                        <BouncingPreloader
                            icons={[ require('../assets/apple.png'), require('../assets/food.png'), 
                            null, require('../assets/broccoli.png'),
                            require('../assets/nut.png'), require('../assets/mango.png')]}
                            leftRotation="-680deg"
                            rightRotation="360deg"
                            leftDistance={-80}
                            rightDistance={-200}
                            speed={1000}
                            size={40}
                        />
                        <Text style={{color: 'black', marginTop: 50, opacity: refreshOpacity}}>Pull down to refresh</Text>
                    </ScrollView>
                </View>
            </SafeAreaView>
        )
    }

    return (
            <View style={{flexDirection: 'row', backgroundColor: 'white', flex: 1}}>
                <View style={{flex: 0.5, paddingTop: hp(15)}}>
                    <TouchableOpacity style={{alignItems: 'center', marginBottom: hp(15)}} onPress={() => navigation.navigate('cart')}>
                        <Svg height={hp(5)} viewBox="0 0 512 512" width="512"><Path fill="#99B898" d="M509.739,89.437c-2.022-2.586-5.122-4.097-8.405-4.096H96c-5.891-0.001-10.668,4.773-10.669,10.664  c0,0.717,0.072,1.433,0.216,2.136l42.667,213.333c1.079,5.531,6.274,9.269,11.861,8.533l320-42.667c4.339-0.58,7.883-3.752,8.939-8  L511.68,98.674C512.505,95.461,511.787,92.046,509.739,89.437z"/><G><Circle fill="#455A64" cx="394.667" cy="437.341" r="53.333"/><Circle fill="#455A64" cx="181.333" cy="437.341" r="53.333"/><Path fill="#455A64" d="M191.125,362.674h246.208c5.891,0,10.667-4.776,10.667-10.667c0-5.891-4.776-10.667-10.667-10.667   H191.125c-25.408-0.053-47.272-17.976-52.309-42.88L85.12,29.874c-1.014-4.967-5.384-8.534-10.453-8.533h-64   C4.776,21.341,0,26.116,0,32.007s4.776,10.667,10.667,10.667H65.92l51.989,259.968   C124.954,337.505,155.557,362.598,191.125,362.674z"/></G><G></G><G></G><G></G><G></G><G></G><G></G><G></G><G></G><G></G><G></G><G></G><G></G><G></G><G></G><G></G></Svg>
                    </TouchableOpacity>
                    <TouchableOpacity style={{alignItems: 'center', margin: hp(4)}} onPress={() => navigation.navigate('Fruits')} >
                        <Svg height={hp(5)} viewBox="0 0 512 512" width="512"><Path d="m344 88s0-48-32-64c-32 16-32 64-32 64v72h64z" fill="#35a872"/><Path d="m336 192s9.455-80 104-80c0 0-47.273 40-47.273 80z" fill="#248256"/><Path d="m288 192s-9.455-80-104-80c0 0 47.273 40 47.273 80z" fill="#248256"/><Path d="m304 152s9.455-80 104-80c0 0-47.273 40-47.273 80z" fill="#319c6a"/><Path d="m320 152s-9.455-80-104-80c0 0 47.273 40 47.273 80z" fill="#2e9163"/><Rect fill="#f7b030" height="304" rx="128" width="256" x="184" y="144"/><G fill="#e09f2c"><Path d="m402.79 318.2-45.26 43.89-45.41-44.08 45.26-43.94z"/><Path d="m312.12 318.01-45.4 44.08-45.27-43.9 45.4-44.14z"/><Path d="m309.87 144.02-43.14 41.93-22.93-22.28a127.231 127.231 0 0 1 66.07-19.65z"/><Path d="m312.1 230.05-45.25 44-45.41-44.08 45.29-44.02z"/><Path d="m402.81 229.97-45.43 44.1-45.28-44.02 45.39-44.12z"/><Path d="m380.31 163.74-22.82 22.19-43.11-41.91a127.258 127.258 0 0 1 65.93 19.72z"/><Path d="m221.44 229.97-37.31 36.27a127.238 127.238 0 0 1 16.17-56.79z"/><Path d="m439.86 265.98-37.05-36.01 20.97-20.36a127.14 127.14 0 0 1 16.08 56.37z"/><Path d="m440 282.12v37.88a127.891 127.891 0 0 1 -3.73 30.76l-33.48-32.56z"/><Path d="m221.45 318.19-33.68 32.75a128.261 128.261 0 0 1 -3.77-30.94v-38.12z"/></G><Path d="m266.72 362.09-47.49 46.11a127.877 127.877 0 0 1 -31.46-57.26l33.68-32.75z" fill="#f7b030"/><Path d="m404.89 408.07a128.015 128.015 0 0 1 -185.66.13l47.49-46.11 45.4 44.03 45.41-44.03z" fill="#e09f2c"/><Path d="m349.25 442.12a1.831 1.831 0 0 0 -.3.46 128.6 128.6 0 0 1 -73.95-.02v-.44l37.12-36z" fill="#f7b030"/><Path d="m488 328c0 77.32-82.38 160-184 160s-184-82.68-184-160z" fill="#35a872"/><Path d="m455.67 328c-5.21 63.3-71.12 128-151.67 128s-146.46-64.7-151.67-128z" fill="#d13330"/><Path d="m416 360a8 8 0 0 1 -16 0c0-4.418 3.582-16 8-16s8 11.582 8 16z" fill="#5e3725"/><Path d="m376 400a8 8 0 0 1 -16 0c0-4.418 3.582-16 8-16s8 11.582 8 16z" fill="#5e3725"/><Path d="m336 376a8 8 0 0 1 -16 0c0-4.418 3.582-16 8-16s8 11.582 8 16z" fill="#5e3725"/><Path d="m288 376a8 8 0 0 1 -16 0c0-4.418 3.582-16 8-16s8 11.582 8 16z" fill="#5e3725"/><Path d="m312 424a8 8 0 0 1 -16 0c0-4.418 3.582-16 8-16s8 11.582 8 16z" fill="#5e3725"/><Path d="m232 400a8 8 0 0 0 16 0c0-4.418-3.582-16-8-16s-8 11.582-8 16z" fill="#5e3725"/><Path d="m183.912 280c-6.38 0-23 4.354-29.855 9.5a29.742 29.742 0 0 1 -36.114 0c-6.854-5.145-23.475-9.5-29.855-9.5-41.723 0-69.92 37.576-63.06 83.661l5 33.576a170.458 170.458 0 0 0 19.586 57.937c14.323 25.666 41.786 38.077 68.005 30.736l13.381-4.788a14.779 14.779 0 0 1 10 0l13.381 4.788c26.222 7.341 53.682-5.07 68.008-30.736a170.458 170.458 0 0 0 19.586-57.937l5-33.576c6.857-46.085-21.34-83.661-63.063-83.661z" fill="#eb423f"/><Path d="m136 336a8 8 0 0 1 -8-8c0-.75.023-18.623 2.036-39.758 2.781-29.2 7.931-49.615 15.308-60.68a8 8 0 0 1 13.312 8.875c-12.01 18.016-14.656 72.205-14.656 91.563a8 8 0 0 1 -8 8z" fill="#5e3725"/><Path d="m165.657 314.343a8 8 0 0 0 -11.314 0c-.056.057-6.2 5.657-18.343 5.657s-18.184-5.512-18.435-5.747l.088.087a8 8 0 1 0 -11.306 11.321c1.073 1.072 10.897 10.339 29.653 10.339 18.772 0 28.6-9.285 29.657-10.343a8 8 0 0 0 0-11.314z" fill="#c7312e"/></Svg>
                    </TouchableOpacity>
                    <TouchableOpacity style={{alignItems: 'center', margin: hp(4), opacity: 0.2}} onPress={() => navigation.navigate('Dried-Fruits')} >
                        <Svg viewBox="0 0 512 512" height={hp(4)} width="512"><Path d="m489.67 108.004c-2.908-15.691-14.747-28.731-29.985-33.363-4.553-1.384-9.333-1.998-14.088-1.805-31.893 1.295-95.203 10.662-167.722 57.987-2.73-6.533-5.607-12.952-8.648-19.239-24.736-51.141-54.603-83.261-75.304-101.2-11.829-10.252-29.051-13.163-43.653-7.612-4.646 1.766-8.977 4.356-12.733 7.611-24.217 20.988-58.503 59.07-84.318 121.302-1.59 3.834.229 8.232 4.063 9.823 3.834 1.588 8.232-.228 9.823-4.063 20.617-49.701 46.739-83.165 68.185-104.461-9.267 18.721-19.735 44.861-28.874 79.98-15.709 60.37-23.674 132.275-23.674 213.718 0 54.101 7.87 100.309 22.759 133.628 5.103 11.42 10.969 21.081 17.438 28.849-19.277-7.365-36.57-19.8-50.622-36.718-25.745-30.996-39.353-74.483-39.353-125.759 0-59.448 8.106-114.032 24.092-162.234 1.306-3.94-.829-8.194-4.768-9.5-3.947-1.307-8.195.828-9.501 4.768-16.492 49.731-24.855 105.907-24.855 166.966 0 54.828 14.808 101.636 42.822 135.364 26.756 32.213 64.038 49.954 104.976 49.954 12.627 0 24.903-1.693 36.632-4.972 11.755 3.298 23.894 4.963 36.224 4.963 18.458 0 37.33-3.684 55.899-11.01 33.068-13.046 64.673-37.645 91.399-71.139 23.191-29.065 42.99-58.882 58.846-88.624 1.952-3.663.567-8.216-3.097-10.169-3.663-1.953-8.216-.567-10.169 3.097-15.423 28.931-34.713 57.974-57.331 86.32-25.089 31.442-54.539 54.448-85.165 66.531-20.172 7.957-40.66 11.155-60.356 9.542 15.757-8.345 30.003-19.935 42.095-34.493 4.413-5.313 8.497-10.952 12.249-16.895 17.532-15.495 35.112-34.235 52.267-55.733 50.797-63.661 89.419-124.834 114.793-181.82 14.748-33.121 22.868-60.065 27.304-80.471 4.351 38.257 2.825 102.158-32.757 180.485-1.586 3.489-.214 7.73 3.112 9.633 3.794 2.17 8.77.557 10.574-3.415 42.99-94.636 38.138-169.577 31.421-205.826zm-189.161 94.461c71.675-69.936 126.174-97.159 153.821-107.424l-142.946 179.146c-2.095-24.967-5.73-48.893-10.875-71.722zm129.104-113.325c-52.416 24.469-102.298 66.979-133.235 96.436-3.692-13.935-7.981-27.429-12.855-40.472 59.535-39.5 112.533-52.207 146.09-55.964zm-331.837 237.542c0-80.167 7.802-150.799 23.189-209.932 12.224-46.98 26.753-77.027 37.249-94.454v473.732c-14.791-3.684-28.424-18.214-38.987-41.851-14.034-31.405-21.451-75.492-21.451-127.495zm161.367 125.759c-14.053 16.919-31.345 29.353-50.623 36.718 6.469-7.768 12.335-17.429 17.439-28.849 14.889-33.319 22.759-79.527 22.759-133.628 0-4.151-3.365-7.517-7.516-7.517-4.152 0-7.516 3.365-7.516 7.517 0 52.004-7.418 96.09-21.45 127.495-10.563 23.637-24.197 38.166-38.988 41.851v-473.735c21.036 34.892 55.33 114.851 59.93 269.594.124 4.149 3.624 7.428 7.737 7.29 4.15-.123 7.414-3.587 7.29-7.737-4.027-135.444-30.699-215.469-51.994-258.41 18.18 18.084 40.381 45.604 59.483 85.099 28.403 58.723 42.804 128.89 42.804 208.553-.001 51.276-13.609 94.763-39.355 125.759zm177.14-250.958c-24.855 55.819-62.81 115.896-112.811 178.559-7.278 9.121-14.627 17.718-22.005 25.759 7.96-23.665 12.063-50.28 12.063-79.118 0-10.22-.232-20.292-.695-30.21l153.244-192.052c-2.665 20.167-10.05 52.714-29.796 97.062z" fill="black" /></Svg>
                    </TouchableOpacity>
                    <TouchableOpacity style={{alignItems: 'center', margin: hp(4), opacity: 0.2}} onPress={() => navigation.navigate('Exotics')} >
                        <Svg  viewBox="0 0 512 512" height={hp(4)} width="512" stroke="black" strokeWidth="5" ><Path d="m490 216.9c4.7-9.5 7.2-20 7.2-30.6 0-35.7-27.3-65.2-62.2-68.6 3.2-14.6-2.1-30.8-14.7-43.2-16.8-16.6-40.5-21.7-61.8-13.8-8-14.8-21.2-27.3-38.5-36.5-18.3-9.7-40-14.7-60.9-14.1-19.7.6-38.1 6.1-53.3 15.9-15.4 10-27.2 24-35 41.7-22.7-10.4-45.1-9.5-63.8 2.6-20.6 13.3-33 38.8-31.1 63.5.1 1.2.2 2.3.4 3.5-30.3-1.6-57.7 19.7-62.9 50.3-4.9 29.1 11.8 56.9 38.5 66.8-6.4 13.1-6.6 28.5-.4 41.9 8.3 18 26.1 28.6 44.7 28.6 4.1 0 8.2-.5 12.3-1.6l71.6 153.9c5.9 12.7 18.7 20.8 32.6 20.8h.4l86.4-.9c15.7-.2 29.3-10.3 34-25.3 1.5-5 3.1-10.1 4.7-15.3 12.6-41.2 27.5-90.3 57.9-140.6 4.8 1.9 9.9 2.9 14.9 2.9 7.5 0 15.1-2.1 21.7-6.4 8.2-5.3 14.2-13.3 17-22.5 1.4.1 2.7.2 4.1.2 25.1 0 45.5-20.4 45.5-45.5.1-10.1-3.2-19.8-9.3-27.7zm-464.7-27.2c4.4-25.7 28.3-43.3 54-40 .7 1.9 1.4 3.7 2.2 5.5-8.7 10.7-13.9 23.9-14.6 37.6-.8 15.3 4 30.2 13.5 42.1 2.6 3.3 5.5 6.2 8.7 8.9-7.7 2.7-16 3.4-24.1 2-26.4-4.6-44.2-29.7-39.7-56.1zm37.1 101.7c-5-10.9-4.4-23.4 1.4-33.8 3.1.5 6.2.7 9.3.7 1.7 0 3.3-.1 5-.2l25.2 54.2c-16.4 3.2-33.6-5-40.9-20.9zm264.3 161.6c-1.6 5.2-3.1 10.3-4.7 15.3-3.1 10-12.2 16.8-22.7 16.9l-86.4.9c-.1 0-.2 0-.3 0-9.3 0-17.8-5.4-21.8-13.9l-100.5-216.4c3.7-1.1 7.4-2.6 10.9-4.4 6.7 3.3 14.1 5.5 21.9 6.2 1.3.1 2.6.2 4 .2 7.8 15.3 40.2 78.7 50.3 96.6 5 9 13 14.2 21.1 14.2 1.6 0 3.3-.2 4.9-.6 10.2-2.7 16.8-13 16.7-26.2 0-.2 0-.3 0-.5l-7.1-86.1c9.9 5.2 20.3 8.9 31 11l17.8 100.9c2.1 11.9 12.3 20.2 24 20.2 1.2 0 2.3-.1 3.5-.3 6.7-1 12.7-4.7 16.6-10.2l78.5-113.1c2.4.3 4.8.4 7.2.4 6.8 0 13.5-1 20-3 1 2.2 2.2 4.4 3.5 6.4-52 66.1-72.1 132.2-88.4 185.5zm-149.4-182.7c-11.6 4.3-23.7 2.7-32.8-4.5-1.7-3.4-3.2-6.3-4.5-8.8 10.8-1.8 21.1-6.4 30-13.5 4.2-3.4 8-7.3 11.2-11.5 5.7 5.7 11.7 10.7 17.9 15.1-2.8 10.4-10.8 19.1-21.8 23.2zm24.5-3 6.2 74.8c0 7.5-3.1 13.1-7.8 14.3-4.3 1.1-9.1-1.9-12.5-7.8-6.2-11.2-21.8-41.1-34.2-65.3 3.5.9 7.2 1.3 10.9 1.3 5.7 0 11.4-1 17.1-3.2 8.1-2.9 15-7.8 20.3-14.1zm128.7-18.8c3.3-2.2 6.6-4.5 9.7-7 .1.2.3.3.4.5 8.4 9.1 19 15.8 30.8 19.3l-75.6 108.8c-2 2.8-5 4.7-8.4 5.2-5.4.8-10.5-2-12.9-6.7zm-60 100.3-9.2-51.9c7.5 4.3 16.6 7.2 26 7.2 1.4 0 2.7-.1 4.1-.2zm27.3-58.7c-14.4 5.7-32.8-2.2-39.6-11.1l-1.9-11c2.9.2 5.9.4 8.9.4 16.5 0 32.5-3.5 47.5-10.1zm128.6 12.2c-7.2 4.6-15.8 5.7-23.7 3.2 6.1-9.5 12.8-19 20.2-28.5 4.5 4.3 9.8 7.7 15.4 9.9-2.1 6.4-6.3 11.8-11.9 15.4zm27.5-24.2c-12.7 0-25.6-9.1-31.3-21.4 5.5-2.8 10.8-6.4 15.5-10.8 7.3-6.7 13-14.9 16.9-24 1.4-3.3-.4-7.1-3.9-8.1-2.9-.8-6 .7-7.2 3.5-3.1 7.5-7.9 14.2-13.9 19.8-14.6 13.5-34.8 18.3-54 13-10.2-2.8-19.3-8.5-26.5-16.3-12.5-13.5-17.6-32.3-13.8-50.4 1.6-7.8 4.9-15.1 9.5-21.5 1.6-2.2 1.6-5.1 0-7.2-2.4-3.2-7.3-3.2-9.6 0-5.7 7.8-9.6 16.7-11.6 26.2-3.7 17.6-.3 35.9 9.1 50.9-20 16.1-43.4 24.5-67.8 24.5-28.6 0-55.3-12-77.4-34.8 4.8-9.7 7.2-20.6 6.7-31.5-.2-3.6-3.4-6.3-6.9-5.7-3.1.5-5.2 3.2-5.1 6.3.8 16.6-6.6 32.9-20 43.6-11 8.8-24.6 12.9-38.4 11.6-13.7-1.3-25.9-7.9-34.4-18.5-14-17.5-14.3-42.6-1.6-61.1 6.7 8.8 15.9 16 27.2 21 3 1.4 6.6 0 7.9-3s0-6.6-3-7.9c-19.4-8.6-30.9-24-32.4-43.3-1.6-20.5 8.6-41.6 25.5-52.5 16.5-10.7 36.9-10.4 57.5.8 1.5.8 3.3 1 5 .3 1.6-.6 2.9-1.9 3.5-3.5 12.9-34.5 42-54.9 79.9-56 39.5-1.2 77.8 19.3 90.8 48.8.7 1.5 1.9 2.7 3.4 3.2 1.5.6 3.2.5 4.7-.3 21.8-10.7 42.5-1.8 53.6 9.2 13.8 13.6 13.9 28.4 9.5 37.7-.9 1.9-.7 4.1.4 5.9 1.2 1.8 3.1 2.8 5.3 2.7h1.2c31.4 0 57 25.5 57 57 0 10-2.6 19.8-7.6 28.4-1.3 2.3-1 5.2.8 7.1 5.8 6.2 9.1 14.3 9.1 22.9-.1 18.4-15.1 33.4-33.6 33.4z" fill="black" /></Svg>
                    </TouchableOpacity>
                </View>
                
                    <StatusBar style="auto" />
                    <View style={styles.container}>
                        <View
                            style={{
                            backgroundColor: '#fff',
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: hp(4)
                            }}
                        >
                            <View style={{flex: 0.1, justifyContent: 'flex-end', alignItems: 'flex-end', marginRight: 5}}>
                                <TouchableOpacity onPress={() => searchInputRef.current.focus()}>
                                    <FontAwesome name="search" size={20} color="black"  />
                                </TouchableOpacity>
                            </View>
                            <View style={{flex: 1}}>
                                <TextInput
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    clearButtonMode="always"
                                    value={query}
                                    onChangeText={(text) => searchFilterFunction(text)}
                                    ref={searchInputRef}
                                    placeholder="Search"
                                />
                            </View>
                        </View>
                        <FlatList 
                            data={filteredList}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                    <View key={item.id} style={{flexDirection: 'row', marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 1, height: 1}, shadowRadius: 1.5, shadowOpacity: 0.3, elevation: 2, margin: wp(1), paddingTop: wp(6), paddingBottom: wp(6), paddingLeft: wp(5), borderRadius: 10}}>
                                        <View style={{flex: 1}}>
                                            <Image source={{uri: item.image}} style={{width: 100, height: 80, borderRadius: 5}}  />
                                            <TouchableOpacity onPress={() => navigation.navigate('Details', {detailItem: item})} activeOpacity={1}>
                                                <Text style={{textAlign: 'center', fontFamily: 'sofia-medium'}}>View Details &raquo;</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={{flex: 1}}>
                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-black'}}>{item.name}</Text>
                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-medium'}}>{item.description}</Text>
                                            {item.previous_price > 0 ? 
                                                <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                                    <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', textDecorationLine: 'line-through', marginRight: wp(2)}}>{item.previous_price}</Text>
                                                    <Text style={{textAlign: 'center', fontFamily: 'sofia-bold', fontSize: wp(5)}}>{item.price}</Text>
                                                </View>:
                                                <Text style={{textAlign: 'center', fontFamily: 'sofia-bold'}}>{item.price}</Text>
                                            }
                                            
                                                    
                                                    {search(item) ? cartData.map((item1) => {
                                                        return item1.ordereditem  === item.name ? 
                                                            
                                                            <View key={item1.id} style={{flexDirection: 'row', justifyContent: 'center'}}>
                                                                
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
                                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-medium'}}>Add to cart</Text>
                                                        </TouchableOpacity>
                                                    }
                                            
                                        </View>
                                    </View>
                            )}
                        />
                    </View>

                {cartStatus !==401 ? cartData.length > 0 ? handleOpen(): handleClose(): null}
                <View style={[styles.sheet]}>
                    <Animated.View style={[styles.popup, slideUp]}>
                        <Text style={{flex: 1, textAlign: 'right'}}>Items added to your cart!</Text>
                        <TouchableOpacity style={{flex: 1}} onPress={() => navigation.navigate('cart')}>
                        <Text style={{textAlign: 'center'}}>View Cart</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </View>
        
    )
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      paddingTop: hp(5)
    },
    refreshcontainer: {
        flex: 1,
        backgroundColor: 'white',
        flexDirection: 'row',
    },
    refreshscrollview: {
        flex: 1,
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sheet: {
        position: "absolute",
        top: Dimensions.get('window').height,
        left: 0,
        right: 0,
        height: "100%",
        justifyContent: "flex-end",
      },
      popup: {
        backgroundColor: "#99b898",
        elevation: 3,
        shadowOffset: {width: 3, height: 3},
        marginHorizontal: 15,
        marginBottom: 5,
        borderRadius: 10,
        minHeight: 60,
        flexDirection: 'row',
        alignItems: 'center'
      },
});