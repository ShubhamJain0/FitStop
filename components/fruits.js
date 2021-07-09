import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useContext, useRef, createRef } from 'react';
import { TouchableOpacity } from 'react-native';
import { StyleSheet, Text, View, RefreshControl, ScrollView, SafeAreaView, Image, Button, Animated, Dimensions, ActivityIndicator, FlatList, TextInput, Platform, LayoutAnimation, UIManager } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { Ionicons, FontAwesome, FontAwesome5, MaterialCommunityIcons, Entypo, Feather, AntDesign, MaterialIcons, createIconSetFromIcoMoon } from "@expo/vector-icons";
import Svg, { Path, G, Rect, Circle, Polygon, Ellipse, Defs } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import ModalDropdown from 'react-native-modal-dropdown';
import FlipCard from 'react-native-flip-card';
import NetInfo from "@react-native-community/netinfo";
import LottieView from 'lottie-react-native';
import { copilot, walkthroughable, CopilotStep } from "react-native-copilot";
import icoMoonConfig from '../selection.json';
import Carousel, {ParallaxImage, Pagination} from 'react-native-snap-carousel';


if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
  ) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

function Fruits(props) {

    const navigation = props.navigation;

    const CustomIcon = createIconSetFromIcoMoon(icoMoonConfig, 'IcoMoon');

    const [mounted, setMounted] = useState(true);
    const [fruitslist, setFruitsList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [cartStatus, setCartStatus] = useState(401);
    const [cartData, setCartData] = useState([]);
    const [custom, setCustom] = useState([{item: 'default', value: 'default'}]);

    const [loading, setLoading] = useState('true');
    const [refreshing, setRefreshing] = useState(false);
    const [hideButton, setHideButton] = useState('flex');
    const dropDownRef = useRef([]);


    const animation = new Animated.Value(0);
    const [scrollY] = useState(new Animated.Value(0));
    const screenHeight = Dimensions.get("window").height;

    const [error, setError] = useState('');

    const [query, setQuery] = useState('');
    const searchInputRef = useRef(null);

    const [isOffline, setIsOffline] = useState(false);
    const [showIndic, setShowInidc] = useState(false);    


    //Copilot Variables
  
    const CoPilotTouchableOpacity = walkthroughable(TouchableOpacity)
    const CoPilotView = walkthroughable(View)


    //Checks for first time and launches co pilot
    useEffect(() => {
        (async () => {
        const isFirstTime = await AsyncStorage.getItem('isFirstTimeStore')
        if (isFirstTime === null && mounted) {
            await AsyncStorage.setItem('isFirstTimeStore', 'false')
            props.start();
        }
        })().catch(error => console.log(error))

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
            fetch('http://192.168.0.105:8000/store/fruitslist/',{
            method: 'GET',
            headers: {
                'Content-type': 'application/json'
            }
            })
            .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
            .then(resp => {if (mounted) {setFruitsList(resp.json); setFilteredList(resp.json); dropDownRef.current = new Array(resp.json.length);}})
            .catch(error => console.log(error))

        return () => {
            setMounted(false);
        }
    }, [])


    useEffect(() => {
        dropDownRef.current = new Array(fruitslist.length)
    }, [fruitslist])



    useEffect(() => {
        const getCart = navigation.addListener('focus', () => {
            if (mounted) {
                setHideButton('flex')
            };
            (async () => {
                const token = await AsyncStorage.getItem('USER_TOKEN')
                if (token) {
                    fetch('http://192.168.0.105:8000/store/cart/',{
                        method: 'GET',
                        headers: {
                            'Authorization': `Token ${token}`,
                            'Content-type': 'application/json'
                        }
                    })
                    .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                    .then(resp => {if (mounted) {setCartData(resp.json), setCartStatus(resp.status)}})
                    .then(() => {if (mounted) {setHideButton('none')}})
                    .then(() => {if (mounted) {setLoading('false')}})
                    .then(() => {if (mounted) {setIsOffline(false)}})
                    .catch(error => console.log(error))
                } else {
                    if (mounted) {
                        setCartData([]);
                        setHideButton('none');
                        setLoading('false');
                        setIsOffline(false);
                    }
                }
                

            })().catch(error => console.log(error))
        });
        
        return () => {
            setMounted(false);
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
    
        fetch('http://192.168.0.105:8000/store/fruitslist/',{
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
                const check = exists(item);
                if (check !== undefined){
                    return fetch('http://192.168.0.105:8000/store/cart/',{
                        method: 'POST',
                        headers: {
                        'Authorization': `Token ${token}`,
                        'Content-type': 'application/json'
                        },
                        body: JSON.stringify({ ordereditem: item, quantity:  check })
                    })
                    .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                    .then(resp => setCartData(resp.json.cart))
                    .catch(error => console.log(error))
                } else {
                    return fetch('http://192.168.0.105:8000/store/cart/',{
                        method: 'POST',
                        headers: {
                        'Authorization': `Token ${token}`,
                        'Content-type': 'application/json'
                        },
                        body: JSON.stringify({ ordereditem: item, quantity:  item.detail[0].quantity })
                    })
                    .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                    .then(resp => setCartData(resp.json.cart))
                    .catch(error => console.log(error))
                    
                }
            } else {
                navigation.navigate('Register')
            }
    }


    const reduceItem = (item) => async evt => {
        const token = await AsyncStorage.getItem('USER_TOKEN')
        if (token) {
        return fetch('http://192.168.0.105:8000/store/reduceordelete/',{
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
            navigation.navigate('Register')
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
    

    const diffClamp = Animated.diffClamp(scrollY, 0, 50)

    const triggerOpenAnimation = () => {
        Animated.timing(scrollY, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
        }).start();
    }

    const triggerCloseAnimation = () => {
        Animated.timing(scrollY, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true
        }).start();
    }

    const slideUp = scrollY.interpolate({
        inputRange: [0, 1],
        outputRange: [150, 0],
        extrapolate: 'clamp',
    })

    


      const updateList = (item, index) => {
        for (var i=0; i < custom.length; i++) {
            if (custom[i].item === item.name) {
               return custom[i].value = index;
            }
        }
          
      }


      const exists = (item) => {
        for (var i=0; i < custom.length; i++) {
            if (custom[i].item === item.name) {
               return custom[i].value;
            }
        }
      }



    
    
    
    //Retry

    const retry = async () => {
        setShowInidc(true);
        const token = await AsyncStorage.getItem('USER_TOKEN')
        try {

            //Fruits list
            fetch('http://192.168.0.105:8000/store/fruitslist/',{
                method: 'GET',
                headers: {
                    'Content-type': 'application/json'
                }
            })
            .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
            .then(resp => (setFruitsList(resp.json), setFilteredList(resp.json), dropDownRef.current = new Array(resp.json.length)))
            .catch(error => console.log(error))

            //Cart

            if (token) {
                fetch('http://192.168.0.105:8000/store/cart/',{
                    method: 'GET',
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-type': 'application/json'
                    }
                })
                .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                .then(resp => (setCartData(resp.json), setCartStatus(resp.status)))
                .then(() => setHideButton('none'))
                .then(() => setLoading('false'))
                .then(() => setIsOffline(false))
                .then(() => setShowInidc(false))
                .catch(error => console.log(error))
            } else {
                setCartData([]);
                setHideButton('none');
                setLoading('false');
                setIsOffline(false);
                setShowInidc(false)
            }
        } catch (error) {
            console.log(error)
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
            <View style={{flex: 1, backgroundColor: '#fcfcfc'}}>
                <Image source={require('../assets/offline.png')} style={{width: '95%', height: 1939*(screenWidth/3300), marginTop: wp(30), alignSelf: 'center'}} />
                <View style={{width: '80%', alignSelf: 'center'}}>
                <Text style={{fontFamily: 'sofia-black', fontSize: wp(6), marginTop: 50, textAlign: 'center'}}>Uh oh! Seems like you are disconnected !</Text>
                {!showIndic ? <TouchableOpacity style={{alignSelf: 'center', marginTop: 25}} onPress={retry}>
                    <Text style={{fontFamily: 'sofia-bold', fontSize: wp(4), color: '#249c86'}}>RETRY</Text>
                </TouchableOpacity>: <LottieView source={require('../assets/animations/connecting.json')} autoPlay={true} loop={true} style={{height: 100, alignSelf: 'center'}} />}
                </View>
            </View>
        )
      }

    


    if (loading == 'true') {
        return (
            <View style={{flex: 1, backgroundColor: '#fcfcfc'}}>
                <SkeletonPlaceholder>
                    <SkeletonPlaceholder.Item height={hp(99)} marginTop={hp(5)} width={wp(90)} alignSelf={'center'} flexDirection={'row'} justifyContent={'space-between'}>
                        <SkeletonPlaceholder.Item marginTop={hp(15)} marginLeft={wp(7)} alignItems={'center'}>
                            <SkeletonPlaceholder.Item  
                                width={wp(5)}
                                height={wp(20)}
                                borderRadius={5}
                                marginBottom={hp(8)}
                            />
                            <SkeletonPlaceholder.Item  
                                width={wp(5)}
                                height={wp(20)}
                                borderRadius={5}
                                marginBottom={hp(8)}
                            />
                            <SkeletonPlaceholder.Item  
                                width={wp(5)}
                                height={wp(20)}
                                borderRadius={5}
                            />
                        </SkeletonPlaceholder.Item>
                        <SkeletonPlaceholder.Item>
                            <SkeletonPlaceholder.Item
                                width={wp(50)}
                                height={20}
                                borderRadius={5}
                            />
                            <SkeletonPlaceholder.Item
                                marginTop={hp(4)}
                                width={wp(60)}
                                height={wp(40)}
                                borderRadius={10}
                            />
                            <SkeletonPlaceholder.Item
                                marginTop={hp(4)}
                                width={wp(60)}
                                height={wp(40)}
                                borderRadius={10}
                            />
                            <SkeletonPlaceholder.Item
                                marginTop={hp(4)}
                                width={wp(60)}
                                height={wp(40)}
                                borderRadius={10}
                            />
                            <SkeletonPlaceholder.Item
                                marginTop={hp(4)}
                                width={wp(60)}
                                height={wp(40)}
                                borderRadius={10}
                            />
                            <SkeletonPlaceholder.Item
                                marginTop={hp(4)}
                                width={wp(60)}
                                height={wp(40)}
                                borderRadius={10}
                            />
                            <SkeletonPlaceholder.Item
                                marginTop={hp(4)}
                                width={wp(60)}
                                height={wp(40)}
                                borderRadius={10}
                            />
                            <SkeletonPlaceholder.Item
                                marginTop={hp(4)}
                                width={wp(60)}
                                height={wp(40)}
                                borderRadius={10}
                            />
                        </SkeletonPlaceholder.Item>
                    </SkeletonPlaceholder.Item>
                </SkeletonPlaceholder>
                <View style={{position: 'absolute', bottom: 0, backgroundColor: '#fcfcfc', width: '100%'}}>
                <SkeletonPlaceholder>
                    <SkeletonPlaceholder.Item paddingTop={15} padding={10} flexDirection={'row'} alignItems={'center'}>
                        <SkeletonPlaceholder.Item 
                            width={wp(9)}
                            height={wp(9)}
                            marginLeft={wp(10)}
                            borderRadius={10}
                        />
                        <SkeletonPlaceholder.Item 
                            width={wp(9)}
                            height={wp(9)}
                            marginLeft={wp(25)}
                            borderRadius={10}
                        />
                        <SkeletonPlaceholder.Item 
                            width={wp(9)}
                            height={wp(9)}
                            marginLeft={wp(25)}
                            borderRadius={10}
                        />
                    </SkeletonPlaceholder.Item>
                    </SkeletonPlaceholder>
                </View>
            </View>
        )
    }

    return (
            <View style={{flexDirection: 'row', backgroundColor: '#fcfcfc', flex: 1}}>
                <View style={{flex: 0.4, justifyContent: 'center'}}>
                    <CopilotStep text={'Explore fruits !'} order={3} name={'fruits'}>
                        <CoPilotTouchableOpacity style={{alignItems: 'center', margin: hp(4), marginBottom: 75, transform: [{rotate: '-90deg'}]}} onPress={() => navigation.navigate('Fruits')} >
                            <Text style={{fontFamily: 'sofia-medium', fontSize: wp(4.5)}}>Fruits</Text>
                            <Text style={{backgroundColor: '#249C86', height: 2, width: '40%', marginTop: 5, alignSelf: 'center'}}></Text>
                        </CoPilotTouchableOpacity>
                    </CopilotStep>
                    <CopilotStep text={'Explore dried-fruits !'} order={4} name={'dried-fruits'}>
                        <CoPilotTouchableOpacity style={{alignItems: 'center', margin: hp(4), marginBottom: 75, opacity: 0.2, transform: [{rotate: '-90deg'}]}} onPress={() => navigation.navigate('Dried-Fruits')} >
                            <Text style={{fontFamily: 'sofia-medium', fontSize: wp(4.5)}}>Dried{'\n'}Fruits</Text>
                            <Text style={{ height: 2, marginTop: 5}}></Text>
                        </CoPilotTouchableOpacity>
                    </CopilotStep>
                    <CopilotStep text={'Explore exotics !'} order={5} name={'exotics'}>
                        <CoPilotTouchableOpacity style={{alignItems: 'center', margin: hp(4), marginBottom: 75, opacity: 0.2, transform: [{rotate: '-90deg'}]}} onPress={() => navigation.navigate('Exotics')} >
                            <Text style={{fontFamily: 'sofia-medium', fontSize: wp(4.5)}}>Exotics</Text>
                            <Text style={{ height: 2, marginTop: 5}}></Text>
                        </CoPilotTouchableOpacity>
                    </CopilotStep>
                </View>
                
                    <StatusBar style="auto" />
                    <View style={styles.container}>
                        <View
                            style={{
                            backgroundColor: '#fcfcfc',
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: hp(4)
                            }}
                        >
                            <CopilotStep text={"Search for what you love !!"} order={1} name={'Search'}>
                                <CoPilotView style={{flex: 0.1, justifyContent: 'flex-end', alignItems: 'flex-end', marginRight: 5}}>
                                    <TouchableOpacity onPress={() => searchInputRef.current.focus()}>
                                        <FontAwesome name="search" size={20} color="black"  />
                                    </TouchableOpacity>
                                </CoPilotView>
                            </CopilotStep>
                            <View style={{flex: 1}}>
                                <TextInput
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    value={query}
                                    onChangeText={(text) => searchFilterFunction(text)}
                                    ref={searchInputRef}
                                    placeholder="Search"
                                />
                            </View>
                        </View>
                        <Animated.FlatList 
                            data={filteredList}
                            contentContainerStyle={{paddingBottom: 100}}
                            showsVerticalScrollIndicator={false}
                            keyExtractor={(item, index) => index.toString()}
                            ListEmptyComponent={() => (!filteredList.length ? <Text style={{fontFamily: 'sf-semi', textAlign: 'center', fontSize: wp(4), color: 'grey'}}>Nothing found! Try something different.</Text>: null)}
                            renderItem={({ item, index }) => (
                                    <FlipCard friction={500} flipHorizontal={true} flipVertical={false} useNativeDriver={true} onFlipStart={() => LayoutAnimation.configureNext(LayoutAnimation.Presets.spring)}>
                                        {index === 0 ? 
                                            <CopilotStep text={'Touch the respective card for more information !'} order={2} name={'Card'}>
                                                <CoPilotView key={item.id} style={{flexDirection: 'row', marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, elevation: 5, margin: 10, paddingTop: wp(6), paddingBottom: wp(8), paddingLeft: wp(5), borderRadius: 10}}>
                                                    <ModalDropdown 
                                                        ref={el => dropDownRef.current[item.id] = el}
                                                        defaultValue={item.detail[0].quantity}
                                                        options={item.detail.map(item1 => item1.quantity)} 
                                                        style={{alignSelf: 'center', marginTop: 5, position: 'absolute', bottom: 2, left: 20, padding: 5}}
                                                        dropdownStyle={{marginTop: -15, marginLeft: -10, width: '20%', alignItems: 'center', backgroundColor: 'white', elevation: 10, shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.34, shadowRadius: 6.27}} 
                                                        dropdownTextStyle={{fontSize: wp(4), fontFamily: 'sf', textAlign: 'center', color: 'black'}} 
                                                        renderSeparator={() => (<Text style={{backgroundColor: '#ebebeb', height: 1}}></Text>)}
                                                        onSelect={(value, index) => updateList(item, index) ? setCustom([...custom]): setCustom([...custom, {item: item.name, value: index}])}
                                                    >
                                                        <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => dropDownRef.current[item.id].show()}>
                                                            {exists(item) ?
                                                                item.detail.map((item2) => {
                                                                    return item2.quantity === exists(item) ?
                                                                    <Text key={item2.id} style={{fontFamily: 'sf-semi', fontSize: wp(3.5), color: '#249c86', fontWeight: 'bold'}}>{item2.quantity}</Text>: null 
                                                                })
                                                                : <Text style={{fontFamily: 'sf-semi', fontSize: wp(3.5), color: '#249c86', fontWeight: 'bold'}}>{item.detail[0].quantity}</Text>
                                                            }
                                                            <Text style={{fontFamily: 'sf', color: '#249c86', fontSize: wp(3.5)}}> ▼</Text>
                                                        </TouchableOpacity>
                                                    </ModalDropdown>
                                                    <View style={{flex: 1}}>
                                                        <Image source={{uri: item.image}} style={{width: 100, height: 80, borderRadius: 5}}  />
                                                    </View>
                                                    <View style={{flex: 1}}>
                                                        <Text style={{textAlign: 'center', fontFamily: 'sofia-bold', fontSize: wp(4.5), marginBottom: 5}}>{item.name}</Text>
                                                        {exists(item) ? 
                                                            item.detail.map((item2) => {
                                                                return item2.quantity === exists(item) ?
                                                                item2.previous_price > 0 ? 
                                                                <View key={item2.id} style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                                                    <Text style={{textAlign: 'center', fontFamily: 'sf', textDecorationLine: 'line-through', marginRight: wp(2)}}>&#8377; {item2.previous_price}</Text>
                                                                    <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}>&#8377; {item2.price}</Text>
                                                                </View>:
                                                                <Text key={item2.id} style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}>&#8377; {item2.price}</Text> : null
                                                                
                                                            }):  
                                                            
                                                            item.detail[0].previous_price > 0 ?
                                                            <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                                                <Text style={{textAlign: 'center', fontFamily: 'sf', textDecorationLine: 'line-through', marginRight: wp(2)}}>&#8377; {item.detail[0].previous_price}</Text>
                                                                <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}>&#8377; {item.detail[0].price}</Text>
                                                            </View>
                                                            : <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}>&#8377; {item.detail[0].price}</Text>
                                                        }
                                                        
                                                            {hideButton === 'none' ? item.availability === 'In stock' ? 
                                                                search(item) ? cartData.map((item1) => {
                                                                    return item1.ordereditem  === item.name ? 
                                                                        
                                                                    <View key={item1.id} style={{flexDirection: 'row', justifyContent: 'center', alignSelf: 'center', marginTop: 10, alignItems: 'center', backgroundColor: '#99b898', borderRadius: 5, width: '60%', elevation: 5, shadowOffset: {width: 1, height: 1}, shadowRadius: 2, shadowOpacity: 0.5, height: 30, padding: wp(1), flex: 0.1}}>
                                                                            
                                                                            <TouchableOpacity onPress={buildCart(item)} style={{justifyContent: 'center'}}>
                                                                                <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(6)}}>+ </Text>
                                                                            </TouchableOpacity>
                                                                            <View style={{justifyContent: 'center'}}>
                                                                                <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(4.5)}}> {item1.item_count} </Text> 
                                                                            </View>
                                                                            <TouchableOpacity onPress={reduceItem(item)} style={{justifyContent: 'center'}}>
                                                                                <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(6)}}> -</Text>
                                                                            </TouchableOpacity>
                                                                        </View>
                                                                        : null
                                                                    }): 
                                                                    <TouchableOpacity onPress={buildCart(item)} style={{flex: 0.1, alignSelf: 'center', justifyContent: 'center',  marginTop: 10, backgroundColor: '#99b898', width: '60%', height: 30, borderRadius: 5, shadowOffset: {width: 1, height: 1}, shadowRadius: 2, shadowOpacity: 0.5, elevation: 5}} activeOpacity={1}>
                                                                        <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(4)}}>Add &#43;</Text>
                                                                    </TouchableOpacity>
                                                            :  <Text style={{color: 'red', textAlign: 'center'}}>Out of stock!</Text>: <ActivityIndicator size={30} color="#99b898" style={{display: hideButton, alignSelf: 'center', marginTop: 10}} />}
                                                        
                                                    </View>
                                                </CoPilotView>
                                            </CopilotStep> : 
                                            
                                            <View key={item.id} style={{flexDirection: 'row', marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, elevation: 5, margin: 10, paddingTop: wp(6), paddingBottom: wp(8), paddingLeft: wp(5), borderRadius: 10}}>
                                                <ModalDropdown 
                                                    ref={el => dropDownRef.current[item.id] = el}
                                                    defaultValue={item.detail[0].quantity}
                                                    options={item.detail.map(item1 => item1.quantity)} 
                                                    style={{alignSelf: 'center', marginTop: 5, position: 'absolute', bottom: 2, left: 20, padding: 5}}
                                                    dropdownStyle={{marginTop: -15, marginLeft: -10, width: '20%', alignItems: 'center', backgroundColor: 'white', elevation: 10, shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.34, shadowRadius: 6.27}} 
                                                    dropdownTextStyle={{fontSize: wp(4), fontFamily: 'sf', textAlign: 'center', color: 'black'}} 
                                                    renderSeparator={() => (<Text style={{backgroundColor: '#ebebeb', height: 1}}></Text>)}
                                                    onSelect={(value, index) => updateList(item, index) ? setCustom([...custom]): setCustom([...custom, {item: item.name, value: index}])}
                                                >
                                                    <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => dropDownRef.current[item.id].show()}>
                                                        {exists(item) ?
                                                            item.detail.map((item2) => {
                                                                return item2.quantity === exists(item) ?
                                                                <Text key={item2.id} style={{fontFamily: 'sf-semi', fontSize: wp(3.5), color: '#249c86', fontWeight: 'bold'}}>{item2.quantity}</Text>: null 
                                                            })
                                                            : <Text style={{fontFamily: 'sf-semi', fontSize: wp(3.5), color: '#249c86', fontWeight: 'bold'}}>{item.detail[0].quantity}</Text>
                                                        }
                                                        <Text style={{fontFamily: 'sf', color: '#249c86', fontSize: wp(3.5)}}> ▼</Text>
                                                    </TouchableOpacity>
                                                </ModalDropdown>
                                                <View style={{flex: 1}}>
                                                    <Image source={{uri: item.image}} style={{width: 100, height: 80, borderRadius: 5}}  />
                                                </View>
                                                <View style={{flex: 1}}>
                                                    <Text style={{textAlign: 'center', fontFamily: 'sofia-bold', fontSize: wp(4.5), marginBottom: 5}}>{item.name}</Text>
                                                    {exists(item) ? 
                                                        item.detail.map((item2) => {
                                                            return item2.quantity === exists(item) ?
                                                            item2.previous_price > 0 ? 
                                                            <View key={item2.id} style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                                                <Text style={{textAlign: 'center', fontFamily: 'sf', textDecorationLine: 'line-through', marginRight: wp(2)}}>&#8377; {item2.previous_price}</Text>
                                                                <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}>&#8377; {item2.price}</Text>
                                                            </View>:
                                                            <Text key={item2.id} style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}>&#8377; {item2.price}</Text> : null
                                                            
                                                        }):  
                                                        
                                                        item.detail[0].previous_price > 0 ?
                                                        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                                            <Text style={{textAlign: 'center', fontFamily: 'sf', textDecorationLine: 'line-through', marginRight: wp(2)}}>&#8377; {item.detail[0].previous_price}</Text>
                                                            <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}>&#8377; {item.detail[0].price}</Text>
                                                        </View>
                                                        : <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}>&#8377; {item.detail[0].price}</Text>
                                                    }
                                                    
                                                        {hideButton === 'none' ? item.availability === 'In stock' ? 
                                                            search(item) ? cartData.map((item1) => {
                                                                return item1.ordereditem  === item.name ? 
                                                                    
                                                                <View key={item1.id} style={{flexDirection: 'row', justifyContent: 'center', alignSelf: 'center', marginTop: 10, alignItems: 'center', backgroundColor: '#99b898', borderRadius: 5, width: '60%', elevation: 5, shadowOffset: {width: 1, height: 1}, shadowRadius: 2, shadowOpacity: 0.5, height: 30, padding: wp(1), flex: 0.1}}>
                                                                        
                                                                        <TouchableOpacity onPress={buildCart(item)} style={{justifyContent: 'center'}}>
                                                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(6)}}>+ </Text>
                                                                        </TouchableOpacity>
                                                                        <View style={{justifyContent: 'center'}}>
                                                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(4.5)}}> {item1.item_count} </Text> 
                                                                        </View>
                                                                        <TouchableOpacity onPress={reduceItem(item)} style={{justifyContent: 'center'}}>
                                                                            <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(6)}}> -</Text>
                                                                        </TouchableOpacity>
                                                                    </View>
                                                                    : null
                                                                }): 
                                                                <TouchableOpacity onPress={buildCart(item)} style={{flex: 0.1, alignSelf: 'center', justifyContent: 'center',  marginTop: 10, backgroundColor: '#99b898', width: '60%', height: 30, borderRadius: 5, shadowOffset: {width: 1, height: 1}, shadowRadius: 2, shadowOpacity: 0.5, elevation: 5}} activeOpacity={1}>
                                                                    <Text style={{textAlign: 'center', fontFamily: 'sofia-medium', color: '#2A363B', fontSize: wp(4)}}>Add &#43;</Text>
                                                                </TouchableOpacity>
                                                        :  <Text style={{color: 'red', textAlign: 'center'}}>Out of stock!</Text>: <ActivityIndicator size={30} color="#99b898" style={{display: hideButton, alignSelf: 'center', marginTop: 10}} />}
                                                    
                                                </View>
                                            </View>
                                            }
                                        <View key={item.id} style={{marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, elevation: 5, margin: 10, paddingTop: wp(1), paddingBottom: wp(6), borderRadius: 10}}>
                                            
                                            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
                                                <Text style={{flex: 1, marginLeft: 15, fontFamily: 'sofia-black', fontSize: wp(5.5)}}>Details</Text>
                                                {item.avg_ratings > 0 ? 
                                                    <View style={{flex: 1}}>
                                                        <View style={{flexDirection:'row', justifyContent: 'center', alignItems: 'center'}}>
                                                            <AntDesign name="star" size={15} style={item.avg_ratings > 0 ? {color: '#249C86'}: {color: 'grey'}} />
                                                            <AntDesign name="star" size={15} style={item.avg_ratings > 1 ? {color: '#249C86'}: {color: 'grey'}} />
                                                            <AntDesign name="star" size={15} style={item.avg_ratings > 2 ? {color: '#249C86'}: {color: 'grey'}} />
                                                            <AntDesign name="star" size={15} style={item.avg_ratings > 3 ? {color: '#249C86'}: {color: 'grey'}} />
                                                            <AntDesign name="star" size={15} style={item.avg_ratings > 4 ? {color: '#249C86'}: {color: 'grey'}} />
                                                            
                                                            <Text style={{textAlign: 'center', fontFamily: 'sf'}}> (<FontAwesome name="user" size={wp(3)} color="black" /> {item.no_of_ratings}) </Text>
                                                        </View>
                                                    </View>
                                                : null}
                                            </View>
                                            <Text style={{marginLeft: 15, fontFamily: 'sf', fontSize: wp(3.5), flex: 1}}>{item.description}</Text>
                                            <Text style={{backgroundColor: '#ebebeb', height: 1, width: '90%', alignSelf: 'center', marginTop: 10}}></Text>
                                            <View style={{flex: 1, marginTop: 5}}>
                                                <Text style={{fontFamily: 'sofia-bold', fontSize: wp(4.5), marginLeft: 15}}>Nutrition per 100 g</Text>
                                                <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15, marginRight: 5, marginLeft: 5}}>
                                                    {item.nutritional_values.slice(0, 3).map((x, index) => {
                                                        return  <View key={x.id} style={{flex: 1, borderRightWidth: index === 2 ? 0: 1, borderColor: '#b5b5b5'}}>
                                                                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                                                        {x.name === 'Protein' ? <MaterialCommunityIcons name="arm-flex" size={wp(4)} color="#c58c85" />: 
                                                                        x.name === 'Carbs' ? <MaterialCommunityIcons name="barley" size={wp(4)} color="green" />:
                                                                        x.name === 'Sugar' ? <FontAwesome name="cubes" size={wp(4)} color="grey" />:
                                                                        x.name === 'Fat (Sat.)' || x.name === 'Fat (Unsat.)' || x.name === 'Fat (trans)' ? <Entypo name="drop" size={wp(4)} color="#8B8000" />: 
                                                                        x.name === 'Calories' ? <MaterialIcons name="local-fire-department" size={wp(4)} color="#249C86" /> : null}
                                                                        <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}> {x.name}</Text>
                                                                    </View>
                                                                    <Text style={{textAlign: 'center', fontFamily: 'sf', fontSize: wp(3.5), color: 'grey', marginTop: 3}}>{x.value}</Text>
                                                                </View>
                                                    })}
                                                </View>
                                                <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15, marginRight: 5, marginLeft: 5}}>
                                                    {item.nutritional_values.slice(3, 5).map((x, index) => {
                                                        return  <View key={x.id} style={{flex: 1, borderRightWidth: index === 1 ? 0: 1, borderColor: '#b5b5b5'}}>
                                                                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                                                        {x.name === 'Protein' ? <MaterialCommunityIcons name="arm-flex" size={wp(4)} color="#c58c85" />: 
                                                                        x.name === 'Carbs' ? <MaterialCommunityIcons name="barley" size={wp(4)} color="green" />:
                                                                        x.name === 'Sugar' ? <FontAwesome name="cubes" size={wp(4)} color="grey" />:
                                                                        x.name === 'Fat (Sat.)' || x.name === 'Fat (Unsat.)' || x.name === 'Fat (trans)' ? <Entypo name="drop" size={wp(4)} color="#8B8000" />: 
                                                                        x.name === 'Calories' ? <MaterialIcons name="local-fire-department" size={wp(4)} color="#249C86" /> : null}
                                                                        <Text style={{textAlign: 'center', fontFamily: 'sf-semi', fontSize: wp(4)}}> {x.name}</Text>
                                                                    </View>
                                                                    <Text style={{textAlign: 'center', fontFamily: 'sf', fontSize: wp(3.5), color: 'grey'}}>{x.value}</Text>
                                                                </View>
                                                    })}
                                                </View>
                                            </View>
                                            <TouchableOpacity style={{marginTop: 15, marginLeft: 15, alignSelf: 'flex-start'}} onPress={() => navigation.navigate('NutritionCalculator', {Item: item, values: item.nutritional_values})}>
                                                <Text style={{fontFamily: 'sf-semi', fontSize: wp(3.5), color: '#249c86'}}>Calculate how much you intake ! &rarr;</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </FlipCard>
                            )}
                        />
                    </View>
                {cartStatus !== 401 ? cartData.length > 0 ? triggerOpenAnimation() : triggerCloseAnimation() : null}
                <Animated.View style={{backgroundColor: 'rgba(235,235,235,0.95)', padding: 25, paddingLeft: 0, position: 'absolute', bottom: 55, width: '100%', transform: [{translateY: slideUp}], flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={{flex: 1, textAlign: 'right', color: 'black', fontFamily: 'sf'}}>Items added to your cart!</Text>
                    <TouchableOpacity style={{flex: 1}} onPress={() => navigation.navigate('cart')}>
                        <Text style={{textAlign: 'center', color: '#249c86', fontFamily: 'sf-semi'}}>View Cart</Text>
                    </TouchableOpacity>
                </Animated.View>
                <View style={{width: '100%', position: 'absolute', bottom: 0, backgroundColor: '#fcfcfc', padding: 5, paddingTop: 10, flexDirection: 'row', alignItems: 'center', elevation: 15, shadowOffset: {width: 0, height: 7}, shadowOpacity: 0.43, shadowRadius: 9.51}}>
                    <View style={{flex: 1, alignItems: 'center'}}>
                        <TouchableOpacity onPress={() => navigation.navigate('Home')} activeOpacity={1}>
                            <CustomIcon name="home-1" size={wp(6)} style={{color: 'black', alignSelf: 'center'}} />
                            <Text style={{fontFamily: 'sf-semi', fontSize: wp(3), color: 'black', textAlign: 'center'}}>Home</Text>
                        </TouchableOpacity>         
                    </View>
                    <View style={{flex: 1}}>
                        <CustomIcon name="store" size={wp(6)} color="#249c86" style={{alignSelf: 'center'}} />
                        <Text style={{fontFamily: 'sf-semi', fontSize: wp(3), color: '#249c86', textAlign: 'center'}}>Store</Text>
                    </View>
                    <View style={{flex: 1}}>
                        <TouchableOpacity onPress={() => navigation.navigate('Recipes')} activeOpacity={1}>
                            <CustomIcon name="salad-1" size={wp(6.5)} color="black" style={{alignSelf: 'center'}} />
                            <Text style={{fontFamily: 'sf-semi', fontSize: wp(3), color: 'black', textAlign: 'center'}}>Recipes</Text>
                        </TouchableOpacity>
                    </View>          
                </View>
            </View>
        
    )
}



const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fcfcfc',
      paddingTop: hp(5),
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
        <Text testID="stepDescription" style={{fontFamily: 'sofia-medium', fontSize: wp(4)}}>{currentStep.text}</Text>
      </View>
      <View style={{marginTop: 10, flexDirection: 'row', justifyContent: 'flex-end'}}>
        {
          !isLastStep ?
            <TouchableOpacity onPress={handleStop}>
              <Text style={{padding: 10, fontFamily: 'sf-semi', color: '#249c86'}}>{labels.skip || 'Skip'}</Text>
            </TouchableOpacity>
            : null
        }
        {
          !isFirstStep ?
            <TouchableOpacity onPress={handlePrev}>
              <Text style={{padding: 10, fontFamily: 'sf-semi', color: '#249c86'}}>{labels.previous || 'Previous'}</Text>
            </TouchableOpacity>
            : null
        }
        {
          !isLastStep ?
            <TouchableOpacity onPress={handleNext}>
              <Text style={{padding: 10, fontFamily: 'sf-semi', color: '#249c86'}}>{labels.next || 'Next'}</Text>
            </TouchableOpacity> :
            <TouchableOpacity onPress={handleStop}>
              <Text style={{padding: 10, fontFamily: 'sf-semi', color: '#249c86'}}>{labels.finish || 'Done'}</Text>
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
    tooltipComponent: TooltipComponent
  })(Fruits);