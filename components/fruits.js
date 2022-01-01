import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useContext, useRef, createRef, useCallback } from 'react';
import { TouchableOpacity } from 'react-native';
import { StyleSheet, Text, View, RefreshControl, ScrollView, SafeAreaView, Image, Button, Animated, Dimensions, ActivityIndicator, FlatList, TextInput, Platform, LayoutAnimation, UIManager } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { Ionicons, FontAwesome, FontAwesome5, MaterialCommunityIcons, Entypo, Feather, AntDesign, MaterialIcons, createIconSetFromIcoMoon } from "@expo/vector-icons";
import Svg, { Path, G, Rect, Circle, Polygon, Ellipse, Defs } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ModalDropdown from 'react-native-modal-dropdown';
import FlipCard from 'react-native-flip-card';
import NetInfo from "@react-native-community/netinfo";
import LottieView from 'lottie-react-native';
import { copilot, walkthroughable, CopilotStep } from "react-native-copilot";
import icoMoonConfig from '../selection.json';
import { showMessage } from 'react-native-flash-message';
import * as SecureStore from 'expo-secure-store';
import { IsLoginContext } from './context';
import Ripple from 'react-native-material-ripple';

if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
  ) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

function Fruits(props) {

    const navigation = props.navigation;

    const CustomIcon = createIconSetFromIcoMoon(icoMoonConfig, 'IcoMoon');

    const [category, setCategory] = useState('Fruits');

    const [mounted, setMounted] = useState(true);
    const [fruitslist, setFruitsList] = useState([]);
    const [driedfruitslist, setDriedFruitsList] = useState([]);
    const [exoticslist, setExoticsList] = useState([]);
    const [imblist, setImbList] = useState([]);
    const [otherlist, setOtherList] = useState([]);
    const [filteredFruitsList, setFilteredFruitsList] = useState([]);
    const [filteredDriedFruitsList, setFilteredDriedFruitsList] = useState([]);
    const [filteredExoticsList, setFilteredExoticsList] = useState([]);
    const [filteredImbList, setFilteredImbList] = useState([]);
    const [filteredOtherList, setFilteredOtherList] = useState([]);
    const [cartStatus, setCartStatus] = useState(401);
    const [cartData, setCartData] = useState([]);
    const [custom, setCustom] = useState([{item: 'default', value: 'default'}]);

    const [loading, setLoading] = useState('true');
    const [refreshing, setRefreshing] = useState(false);
    const [hideButton, setHideButton] = useState('flex');
    const fruitsDropdownRef = useRef([]);
    const driedfruitsDropdownRef = useRef([]);
    const exoticsDropdownRef = useRef([]);
    const imbDropdownRef = useRef([]);
    const otherDropdownRef = useRef([]);


    const scaleAnimation1 = new Animated.Value(1);
    const scaleAnimation2 = new Animated.Value(1);
    const scaleAnimation3 = new Animated.Value(1);
    const scaleAnimation4 = new Animated.Value(1);
    const scaleAnimation5 = new Animated.Value(1);
    const [scrollY] = useState(new Animated.Value(0));
    const screenWidth = Dimensions.get("window").width;

    const [error, setError] = useState('');

    const [query, setQuery] = useState('');
    const searchInputRef = useRef(null);

    const [isOffline, setIsOffline] = useState(false);
    const [showIndic, setShowInidc] = useState(false);    

    const [conIsLogin, setConIsLogin] = useContext(IsLoginContext);

    const [isLogin, setIsLogin] = useState(true);
    const [userData, setUserData] = useState({});

    const [cartBadge, setCartBadge] = useState('');
    const [ordersBadge, setOrdersBadge] = useState('');

    //Custom scroll indicator
    const [completeScrollBarWidth, setcompleteScrollBarWidth] = useState(1);
    const [visibleScrollBarWidth, setvisibleScrollBarWidth] = useState(0);
    const scrollIndicator = useRef(new Animated.Value(0)).current;


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

    return () => {
        unsubscribe();
    }
    }, [])


    //Jump to category
    const gotoCategory = props.route.params;
    useEffect(() => {
        if (gotoCategory){
            setCategory(gotoCategory.category);
        }
    }, [gotoCategory])


    const flRef = useCallback((node) => {
        if (node) {
            if (gotoCategory === undefined || gotoCategory === null){
                return;
            } else {
                if (gotoCategory.category === 'Exotics'){
                    setTimeout(() => node.scrollToIndex({index: 2}), 500)
                } else if (gotoCategory.category === 'Immunity-Boosters'){
                    setTimeout(() => node.scrollToIndex({index: 3}), 500)
                } else if (gotoCategory.category === 'Other'){
                    setTimeout(() => node.scrollToIndex({index: 4}), 500)
                }
            }
        }
        
    }, [gotoCategory])


    useEffect(() => {
            fetch('http://192.168.0.156:8000/store/fruitslist/',{
            method: 'GET',
            headers: {
                'Content-type': 'application/json'
            }
            })
            .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
            .then(resp => {if (mounted) {setFruitsList(resp.json); setFilteredFruitsList(resp.json); fruitsDropdownRef.current = new Array(resp.json.length);}})
            .catch(error => setError(error))

        return () => {
            setMounted(false);
        }
    }, [])


    useEffect(() => {
            fetch('http://192.168.0.156:8000/store/dried-fruitslist/',{
            method: 'GET',
            headers: {
                'Content-type': 'application/json'
            }
            })
            .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
            .then(resp => {if (mounted) {setDriedFruitsList(resp.json); setFilteredDriedFruitsList(resp.json); driedfruitsDropdownRef.current = new Array(resp.json.length);}})
            .catch(error => setError(error))

        return () => {
            setMounted(false);
        }

    }, [])


    useEffect(() => {
            fetch('http://192.168.0.156:8000/store/exoticslist/',{
            method: 'GET',
            headers: {
                'Content-type': 'application/json'
            }
            })
            .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
            .then(resp => {if (mounted) {setExoticsList(resp.json); setFilteredExoticsList(resp.json); exoticsDropdownRef.current = new Array(resp.json.length);}})
            .catch(error => setError(error))

        return () => {
            setMounted(false);
        }
        
    }, [])


    useEffect(() => {
            fetch('http://192.168.0.156:8000/store/imblist/',{
            method: 'GET',
            headers: {
                'Content-type': 'application/json'
            }
            })
            .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
            .then(resp => {if (mounted) {setImbList(resp.json); setFilteredImbList(resp.json); imbDropdownRef.current = new Array(resp.json.length);}})
            .catch(error => setError(error))

        return () => {
            setMounted(false);
        }
    
    }, [])


    useEffect(() => {
            fetch('http://192.168.0.156:8000/store/otherlist/',{
            method: 'GET',
            headers: {
                'Content-type': 'application/json'
            }
            })
            .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
            .then(resp => {if (mounted) {setOtherList(resp.json); setFilteredOtherList(resp.json); otherDropdownRef.current = new Array(resp.json.length);}})
            .catch(error => setError(error))

        return () => {
            setMounted(false);
        }
        
    }, [])


    useEffect(() => {
        fruitsDropdownRef.current = new Array(fruitslist.length)
    }, [fruitslist])


    useEffect(() => {
        driedfruitsDropdownRef.current = new Array(driedfruitslist.length)
    }, [driedfruitslist])


    useEffect(() => {
        exoticsDropdownRef.current = new Array(exoticslist.length)
    }, [exoticslist])


    useEffect(() => {
        imbDropdownRef.current = new Array(exoticslist.length)
    }, [exoticslist])


    useEffect(() => {
        otherDropdownRef.current = new Array(exoticslist.length)
    }, [exoticslist])



    useEffect(() => {
        const getCart = navigation.addListener('focus', () => {
            if (mounted) {
                setHideButton('flex')
            };
            (async () => {
                const token = await SecureStore.getItemAsync('USER_TOKEN')
                if (token) {
                    fetch('http://192.168.0.156:8000/store/cart/',{
                        method: 'GET',
                        headers: {
                            'Authorization': `Token ${token}`,
                            'Content-type': 'application/json'
                        }
                    })
                    .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                    .then(resp => {if (mounted) {setCartData(resp.json); setCartStatus(resp.status); if(resp.json.length > 0){setCartBadge(true)} else {setCartBadge(false)}}})
                    .then(() => {if (mounted) {setHideButton('none')}})
                    .catch(error => setError(error))
                } else {
                    if (mounted) {
                        setCartData([]);
                        setHideButton('none');
                        setCartBadge(false);
                    }
                }
                

            })().catch(error => setError(error))
        });
        
        return () => {
            setMounted(false);
        }
        
    }, [navigation])


    useEffect(() => {
        (async () => {
          const token = await SecureStore.getItemAsync('USER_TOKEN')
          if (token) {
            fetch('http://192.168.0.156:8000/api/me/',{
                  method: 'GET',
                  headers: {
                  'Authorization': `Token ${token}`,
                  'Content-type': 'application/json'
                  }
              })
              .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
              .then(resp => {if (mounted) {setUserData(resp.json)}})
              .then(() => {if (mounted) {setIsLogin(true)}})
              .then(() => {if (mounted) {setLoading('false')}})
              .then(() => {if (mounted) {setIsOffline(false)}})
              .catch(error => setError(error));
          } else {
            if (mounted) {
                setIsLogin(false);
                setLoading('false');
                setIsOffline(false);
            }
          }
        })().catch(error => setError(error))
  
    }, [conIsLogin])



    const searchFilterFunction = (text) => {
        if (category === 'Fruits'){
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
                setFilteredFruitsList(newData);
                setQuery(text);
              } else {
                // Inserted text is blank
                // Update FilteredDataSource with masterDataSource
                setFilteredFruitsList(fruitslist);
                setQuery(text);
              }   
        } else if (category === 'Dried-fruits'){
            // Check if searched text is not blank
            if (text) {
                // Inserted text is not blank
                // Filter the masterDataSource
                // Update FilteredDataSource
                const newData = driedfruitslist.filter(
                  function (item) {
                    const itemData = item.name
                      ? item.name.toUpperCase()
                      : ''.toUpperCase();
                    const textData = text.toUpperCase();
                    return itemData.indexOf(textData) > -1;
                });
                setFilteredDriedFruitsList(newData);
                setQuery(text);
            } else {
                // Inserted text is blank
                // Update FilteredDataSource with masterDataSource
                setFilteredDriedFruitsList(driedfruitslist);
                setQuery(text);
            }   
        } else if (category === 'Exotics'){
            // Check if searched text is not blank
            if (text) {
                // Inserted text is not blank
                // Filter the masterDataSource
                // Update FilteredDataSource
                const newData = exoticslist.filter(
                  function (item) {
                    const itemData = item.name
                      ? item.name.toUpperCase()
                      : ''.toUpperCase();
                    const textData = text.toUpperCase();
                    return itemData.indexOf(textData) > -1;
                });
                setFilteredExoticsList(newData);
                setQuery(text);
            } else {
                // Inserted text is blank
                // Update FilteredDataSource with masterDataSource
                setFilteredExoticsList(exoticslist);
                setQuery(text);
            }   
        } else if (category === 'Immunity-Boosters'){
            // Check if searched text is not blank
            if (text) {
                // Inserted text is not blank
                // Filter the masterDataSource
                // Update FilteredDataSource
                const newData = imblist.filter(
                  function (item) {
                    const itemData = item.name
                      ? item.name.toUpperCase()
                      : ''.toUpperCase();
                    const textData = text.toUpperCase();
                    return itemData.indexOf(textData) > -1;
                });
                setFilteredImbList(newData);
                setQuery(text);
            } else {
                // Inserted text is blank
                // Update FilteredDataSource with masterDataSource
                setFilteredImbList(exoticslist);
                setQuery(text);
            }   
        } else if (category === 'Other'){
            // Check if searched text is not blank
            if (text) {
                // Inserted text is not blank
                // Filter the masterDataSource
                // Update FilteredDataSource
                const newData = otherlist.filter(
                  function (item) {
                    const itemData = item.name
                      ? item.name.toUpperCase()
                      : ''.toUpperCase();
                    const textData = text.toUpperCase();
                    return itemData.indexOf(textData) > -1;
                });
                setFilteredOtherList(newData);
                setQuery(text);
            } else {
                // Inserted text is blank
                // Update FilteredDataSource with masterDataSource
                setFilteredOtherList(exoticslist);
                setQuery(text);
            }   
        }
        
      };


    const wait = timeout => {
        return new Promise(resolve => {
          setTimeout(resolve, timeout);
        });
    };


    const buildCart = (item) => async evt  => {
            const token =  await SecureStore.getItemAsync('USER_TOKEN')
            if (token) {
                const check = exists(item);
                if (check !== undefined){
                    return fetch('http://192.168.0.156:8000/store/cart/',{
                        method: 'POST',
                        headers: {
                        'Authorization': `Token ${token}`,
                        'Content-type': 'application/json'
                        },
                        body: JSON.stringify({ ordereditem: item, quantity:  check, item_type: 'Products' })
                    })
                    .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                    .then(resp => {setCartData(resp.json.cart); if(resp.json.cart.length > 0){setCartBadge(true)} else {setCartBadge(false)}})
                    .catch(error => setError(error))
                } else {
                    return fetch('http://192.168.0.156:8000/store/cart/',{
                        method: 'POST',
                        headers: {
                        'Authorization': `Token ${token}`,
                        'Content-type': 'application/json'
                        },
                        body: JSON.stringify({ ordereditem: item, quantity:  item.detail[0].quantity, item_type: 'Products' })
                    })
                    .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                    .then(resp => {setCartData(resp.json.cart); if(resp.json.cart.length > 0){setCartBadge(true)} else {setCartBadge(false)}})
                    .catch(error => setError(error))
                    
                }
            } else {
                showMessage({
                    message: 'You need to be logged-in to edit cart !',
                    position: 'top',
                    floating: true,
                    titleStyle: {fontFamily: 'Maven-sem', fontSize: wp(3.5)},
                    style: {alignItems: 'center'},
                    icon: 'auto',
                    type: 'warning',
                    statusBarHeight: hp(3),
                    duration: 5000
                })
                navigation.navigate('Register')
            }
    }


    const reduceItem = (item) => async evt => {
        const token = await SecureStore.getItemAsync('USER_TOKEN')
        if (token) {
        return fetch('http://192.168.0.156:8000/store/reduceordelete/',{
            method: 'POST',
            headers: {
            'Authorization': `Token ${token}`,
            'Content-type': 'application/json'
            },
            body: JSON.stringify({ reduceitem: item })
        })
        .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
        .then(resp => {setCartData(resp.json.cart); if(resp.json.cart.length > 0){setCartBadge(true)} else {setCartBadge(false)}})
        .catch(error => setError(error))
        } else {
            showMessage({
                message: 'You need to be logged-in to edit cart !',
                position: 'top',
                floating: true,
                titleStyle: {fontFamily: 'Maven-sem', fontSize: wp(3.5)},
                style: {alignItems: 'center'},
                icon: 'auto',
                type: 'warning',
                statusBarHeight: hp(3),
                duration: 5000
            })
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

    //animation

    // useEffect(() => {
    //     scrollY.addListener(value => {
    //       if (value.value > 25){
    //         Animated.timing(animation, {
    //           toValue: 1,
    //           duration: 200,
    //           useNativeDriver: true,
    //         }).start()
    //       } else {
    //         Animated.timing(animation, {
    //           toValue: 0,
    //           duration: 200,
    //           useNativeDriver: true
    //         }).start()
    //       }
    //     })
    //   }, [])

    const hideCategory = Animated.diffClamp(scrollY, 0, 125).interpolate({
        inputRange: [0, 250],
        outputRange: [0, -275],
        extrapolate: 'clamp'
    })

    const startScale1 = () => {
        Animated.spring(scaleAnimation1, {
            toValue: 0.8,
            friction: 5,
            useNativeDriver: true,
        }).start();
    };

    const startScale2 = () => {
        Animated.spring(scaleAnimation2, {
            toValue: 0.8,
            friction: 5,
            useNativeDriver: true,
        }).start();
    };

    const startScale3 = () => {
        Animated.spring(scaleAnimation3, {
            toValue: 0.8,
            friction: 5,
            useNativeDriver: true,
        }).start();
    };


    const startScale4 = () => {
        Animated.spring(scaleAnimation4, {
            toValue: 0.8,
            friction: 5,
            useNativeDriver: true,
        }).start();
    };


    const startScale5 = () => {
        Animated.spring(scaleAnimation5, {
            toValue: 0.8,
            friction: 5,
            useNativeDriver: true,
        }).start();
    };
    
    const stopScale1 = () => {
        Animated.spring(scaleAnimation1, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
        }).start();
        
    };

    const stopScale2 = () => {
        Animated.spring(scaleAnimation2, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
        }).start();
        
    };

    const stopScale3 = () => {
        Animated.spring(scaleAnimation3, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
        }).start();
        
    };

    const stopScale4 = () => {
        Animated.spring(scaleAnimation4, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
        }).start();
        
    };

    const stopScale5 = () => {
        Animated.spring(scaleAnimation5, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
        }).start();
        
    };
    


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



    //Custom scroll indicator
    const scrollIndicatorSize =
        completeScrollBarWidth > visibleScrollBarWidth
        ? (visibleScrollBarWidth * visibleScrollBarWidth)
            / completeScrollBarWidth
        : visibleScrollBarWidth;

    const difference =
        visibleScrollBarWidth > scrollIndicatorSize
        ? visibleScrollBarWidth - scrollIndicatorSize
        : 1;

    const scrollIndicatorPosition = Animated.multiply(
        scrollIndicator,
        visibleScrollBarWidth / completeScrollBarWidth,
        ).interpolate({
        extrapolate: 'clamp',
        inputRange: [0, difference],
        outputRange: [0, difference - wp(35)],
    });


    const onLayout = ({
        nativeEvent: {
        layout: { width },
        },
        }) => {
        setvisibleScrollBarWidth(width);
    };
    
    
    
    //Retry

    const retry = async () => {
        setShowInidc(true);
        const token = await SecureStore.getItemAsync('USER_TOKEN')
        try {

            //Fruits list

            fetch('http://192.168.0.156:8000/store/fruitslist/',{
            method: 'GET',
            headers: {
                'Content-type': 'application/json'
            }
            })
            .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
            .then(resp => {if (mounted) {setFruitsList(resp.json); setFilteredFruitsList(resp.json); fruitsDropdownRef.current = new Array(resp.json.length);}})
            .catch(error => setError(error))
    

            fetch('http://192.168.0.156:8000/store/dried-fruitslist/',{
            method: 'GET',
            headers: {
                'Content-type': 'application/json'
            }
            })
            .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
            .then(resp => {if (mounted) {setDriedFruitsList(resp.json); setFilteredDriedFruitsList(resp.json); driedfruitsDropdownRef.current = new Array(resp.json.length);}})
            .catch(error => setError(error))
    
    
            fetch('http://192.168.0.156:8000/store/exoticslist/',{
            method: 'GET',
            headers: {
                'Content-type': 'application/json'
            }
            })
            .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
            .then(resp => {if (mounted) {setExoticsList(resp.json); setFilteredExoticsList(resp.json); exoticsDropdownRef.current = new Array(resp.json.length);}})
            .catch(error => setError(error))


            fetch('http://192.168.0.156:8000/store/imblist/',{
            method: 'GET',
            headers: {
                'Content-type': 'application/json'
            }
            })
            .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
            .then(resp => {if (mounted) {setImbList(resp.json); setFilteredImbList(resp.json); imbDropdownRef.current = new Array(resp.json.length);}})
            .catch(error => setError(error))


            fetch('http://192.168.0.156:8000/store/otherlist/',{
            method: 'GET',
            headers: {
                'Content-type': 'application/json'
            }
            })
            .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
            .then(resp => {if (mounted) {setOtherList(resp.json); setFilteredOtherList(resp.json); otherDropdownRef.current = new Array(resp.json.length);}})
            .catch(error => setError(error))

            //Cart

            if (token) {
                fetch('http://192.168.0.156:8000/store/cart/',{
                    method: 'GET',
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-type': 'application/json'
                    }
                })
                .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
                .then(resp => {setCartData(resp.json); setCartStatus(resp.status); if(resp.json.length > 0){setCartBadge(true)} else {setCartBadge(false)}})
                .catch(error => setError(error))


                fetch('http://192.168.0.156:8000/api/me/',{
                    method: 'GET',
                    headers: {
                    'Authorization': `Token ${token}`,
                    'Content-type': 'application/json'
                    }
                })
                .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
                .then(resp => setUserData(resp.json))
                .then(() => setLoading('false'))
                .then(() => setIsLogin(true))
                .then(() => setHideButton('none'))
                .then(() => setShowInidc(false))
                .then(() => setIsOffline(false))
                .catch(error => setError(error))
            } else {
                if (mounted){setCartData([]);
                setHideButton('none');
                setCartBadge(false);
                setOrdersBadge(false);
                setLoading('false');
                setIsOffline(false);
                setShowInidc(false);
                setIsLogin(false);}
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
            <View style={{flex: 1, backgroundColor: '#fcfcfc'}}>
                <StatusBar style="inverted" />
                <Image source={require('../assets/offline.png')} style={{width: '95%', height: 1939*(screenWidth/3300), marginTop: wp(30), alignSelf: 'center'}} />
                <View style={{width: '80%', alignSelf: 'center'}}>
                <Text style={{fontFamily: 'Maven-sem', fontSize: wp(6), marginTop: 50, textAlign: 'center', color: 'black'}}>Uh oh! Seems like you are disconnected !</Text>
                {!showIndic ? <TouchableOpacity style={{alignSelf: 'center', marginTop: 25}} onPress={retry} activeOpacity={1}>
                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: '#249c86'}}>RETRY</Text>
                </TouchableOpacity>: <LottieView source={require('../assets/animations/connecting.json')} autoPlay={true} loop={true} style={{height: 100, alignSelf: 'center'}} />}
                </View>
            </View>
        )
      }

    


    if (loading == 'true') {
        return (
            <View style={{flex: 1, backgroundColor: '#fcfcfc', justifyContent: 'center', alignItems: 'center'}}>
                <StatusBar style="inverted" />
                <LottieView source={require('../assets/animations/9258-bouncing-fruits.json')} style={{width: 200}} loop={true} autoPlay={true} />
            </View>
        )
    }

    return (
        <View style={{backgroundColor: '#fcfcfc', flex: 1}}>
            
            <View style={{flexDirection: 'row', backgroundColor: '#fcfcfc', flex: 1, marginTop: 200}}>
                    <View style={{flex: 1}}>
                        <Animated.FlatList 
                            data={category === 'Fruits' ? filteredFruitsList : category === 'Dried-fruits' ? filteredDriedFruitsList : category === 'Exotics' ? filteredExoticsList : category === 'Immunity-Boosters' ? filteredImbList : filteredOtherList}
                            contentContainerStyle={{paddingBottom: 150, padding: 25, marginTop: 150}}
                            showsVerticalScrollIndicator={false}
                            keyExtractor={(item, index) => index.toString()}
                            overScrollMode={'never'}
                            onScroll={Animated.event(
                                [{nativeEvent: {contentOffset: {y: scrollY}}}],
                                {useNativeDriver: true}
                                
                              )}
                            ListEmptyComponent={() => 
                                category === 'Fruits' ? (!filteredFruitsList.length ? <Text style={{fontFamily: 'Maven-sem', textAlign: 'center', fontSize: wp(4), color: 'grey'}}>Nothing found! Try something different.</Text>: null)
                                : category === 'Dried-fruits' ? (!filteredDriedFruitsList.length ? <Text style={{fontFamily: 'Maven-sem', textAlign: 'center', fontSize: wp(4), color: 'grey'}}>Nothing found! Try something different.</Text>: null)
                                : category === 'Exotics' ? (!filteredExoticsList.length ? <Text style={{fontFamily: 'Maven-sem', textAlign: 'center', fontSize: wp(4), color: 'grey'}}>Nothing found! Try something different.</Text>: null)
                                : category === 'Immuntiy-Boosters' ? (!filteredImbList.length ? <Text style={{fontFamily: 'Maven-sem', textAlign: 'center', fontSize: wp(4), color: 'grey'}}>Nothing found! Try something different.</Text>: null)
                                : category === 'Other' ? (!filteredOtherList.length ? <Text style={{fontFamily: 'Maven-sem', textAlign: 'center', fontSize: wp(4), color: 'grey'}}>Nothing found! Try something different.</Text>: null)
                                : null
                            }
                            renderItem={({ item, index }) => (
                                    <FlipCard friction={500} flipHorizontal={true} flipVertical={false} useNativeDriver={true} >
                                        {index === 0 ? 
                                            <CopilotStep text={'Touch the respective card for more information !'} order={2} name={'Card'}>
                                                <CoPilotView key={item.id} style={{flexDirection: 'row', marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000', elevation: 5, paddingTop: wp(6), paddingBottom: wp(8), paddingLeft: wp(5), borderRadius: 10}}>
                                                    <ModalDropdown 
                                                        ref={el => category === 'Fruits' ? fruitsDropdownRef.current[item.id] = el : category === 'Dried-fruits' ? driedfruitsDropdownRef.current[item.id] = el : category === 'Exotics' ? exoticsDropdownRef.current[item.id] = el : category === 'Immunity-Boosters' ? imbDropdownRef.current[item.id] = el : otherDropdownRef.current[item.id] = el  }
                                                        defaultValue={item.detail[0].quantity}
                                                        options={item.detail.map(item1 => item1.quantity)} 
                                                        style={{alignSelf: 'center', marginTop: 5, position: 'absolute', bottom: 2, left: 20, padding: 5}}
                                                        dropdownStyle={{marginTop: -15, marginLeft: -10, width: '20%', alignItems: 'center', backgroundColor: 'white', elevation: 10, shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.34, shadowRadius: 6.27, shadowColor: '#000'}} 
                                                        dropdownTextStyle={{fontSize: wp(4), fontFamily: 'Maven-med', textAlign: 'center', color: 'black'}} 
                                                        renderSeparator={() => (<Text style={{backgroundColor: '#ebebeb', height: 1}}></Text>)}
                                                        onSelect={(value, index) => updateList(item, index) ? setCustom([...custom]): setCustom([...custom, {item: item.name, value: index}])}
                                                    >
                                                        <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => category === 'Fruits' ? fruitsDropdownRef.current[item.id].show() : category === 'Dried-fruits' ? driedfruitsDropdownRef.current[item.id].show() : category === 'Exotics' ? exoticsDropdownRef.current[item.id].show() : category === 'Immunity-Boosters' ? imbDropdownRef.current[item.id].show() : otherDropdownRef.current[item.id].show()} activeOpacity={1}>
                                                            {exists(item) ?
                                                                item.detail.map((item2) => {
                                                                    return item2.quantity === exists(item) ?
                                                                    <Text key={item2.id} style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: '#249c86'}}>{item2.quantity}</Text>: null 
                                                                })
                                                                : <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: '#249c86'}}>{item.detail[0].quantity}</Text>
                                                            }
                                                            <Text style={{fontFamily: 'Maven-med', color: '#249c86', fontSize: wp(4)}}> ▼</Text>
                                                        </TouchableOpacity>
                                                    </ModalDropdown>
                                                    <View style={{flex: 1}}>
                                                        <Image source={{uri: item.image}} style={{width: 100, height: 80, borderRadius: 10}}  />
                                                    </View>
                                                    <View style={{flex: 1}}>
                                                        <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(5), marginBottom: 5, color: 'black'}}>{item.name}</Text>
                                                        {exists(item) ? 
                                                            item.detail.map((item2) => {
                                                                return item2.quantity === exists(item) ?
                                                                item2.previous_price > 0 ? 
                                                                <View key={item2.id} style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                                                    <Text style={{textAlign: 'center', fontFamily: 'Maven-med', textDecorationLine: 'line-through', marginRight: wp(2.5), color: 'black'}}>&#8377; {item2.previous_price}</Text>
                                                                    <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>&#8377; {item2.price}</Text>
                                                                </View>:
                                                                <Text key={item2.id} style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>&#8377; {item2.price}</Text> : null
                                                                
                                                            }):  
                                                            
                                                            item.detail[0].previous_price > 0 ?
                                                            <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                                                <Text style={{textAlign: 'center', fontFamily: 'Maven-med', textDecorationLine: 'line-through', marginRight: wp(2.5), color: 'black'}}>&#8377; {item.detail[0].previous_price}</Text>
                                                                <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>&#8377; {item.detail[0].price}</Text>
                                                            </View>
                                                            : <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>&#8377; {item.detail[0].price}</Text>
                                                        }
                                                        
                                                            {hideButton === 'none' ? item.availability === 'In stock' ? 
                                                                search(item) ? cartData.map((item1) => {
                                                                    return item1.ordereditem  === item.name ? 
                                                                        
                                                                    <View key={item1.id} style={{flexDirection: 'row', justifyContent: 'space-around',  alignSelf: 'center', marginTop: 10, backgroundColor: '#fff', borderRadius: 10, width: '60%', elevation: 1, shadowOffset: {width: 0, height: 1}, shadowRadius: 1.00, shadowOpacity: 0.18, shadowColor: '#000'}}>
                                                                    
                                                                        <Ripple onPress={buildCart(item)} style={{flex: 1, padding: 7, backgroundColor: '#6aab9e', borderRadius: 10, elevation: 5, shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000'}} rippleDuration={600} rippleContainerBorderRadius={5} rippleOpacity={0.5} onLongPress={{}}>
                                                                            <Text style={{textAlign: 'center',fontFamily: 'Maven-med', color: '#2A363B', fontSize: wp(4)}}>+</Text>
                                                                        </Ripple>
                                                                        <View style={{justifyContent: 'center', flex: 1, padding: 7}}>
                                                                            <Text style={{textAlign: 'center', fontFamily: 'Maven-med', color: '#2A363B', fontSize: wp(4)}}>{item1.item_count}</Text> 
                                                                        </View>
                                                                        <Ripple onPress={reduceItem(item)} style={{flex: 1, padding: 7, backgroundColor: '#6aab9e', borderRadius: 10, elevation: 5, shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000'}} rippleDuration={600} rippleContainerBorderRadius={5} rippleOpacity={0.5} onLongPress={{}}>
                                                                            <Text style={{textAlign: 'center',fontFamily: 'Maven-med', color: '#2A363B', fontSize: wp(4)}}>-</Text>
                                                                        </Ripple>
                                                                    </View>
                                                                : null
                                                            }): 
                                                            <Ripple onPress={buildCart(item)} style={{alignSelf: 'center',  marginTop: 10, backgroundColor: '#6aab9e', width: '60%', padding: 7, borderRadius: 10, shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000', elevation: 5}} rippleDuration={600} rippleContainerBorderRadius={10} rippleOpacity={0.5} onLongPress={{}}>
                                                                <Text style={{textAlign: 'center', fontFamily: 'Maven-med', color: '#2A363B', fontSize: wp(4)}}>Add &#43;</Text>
                                                            </Ripple>
                                                            :  <Text style={{color: 'red', textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), marginTop: 10, height: wp(8.5)}}>Out of stock !</Text>: <ActivityIndicator size={30} color="#6aab9e" style={{display: hideButton, alignSelf: 'center', marginTop: 10, height: wp(8.5)}} />}
                                                        
                                                    </View>
                                                </CoPilotView>
                                            </CopilotStep> : 
                                            
                                            <View key={item.id} style={{flexDirection: 'row', marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000', elevation: 5, paddingTop: wp(6), paddingBottom: wp(8), paddingLeft: wp(5), borderRadius: 10}}>
                                                <ModalDropdown 
                                                    ref={el => category === 'Fruits' ? fruitsDropdownRef.current[item.id] = el : category === 'Dried-fruits' ? driedfruitsDropdownRef.current[item.id] = el : category === 'Exotics' ? exoticsDropdownRef.current[item.id] = el : category === 'Immunity-Boosters' ? imbDropdownRef.current[item.id] = el : otherDropdownRef.current[item.id] = el  }
                                                    defaultValue={item.detail[0].quantity}
                                                    options={item.detail.map(item1 => item1.quantity)} 
                                                    style={{alignSelf: 'center', marginTop: 5, position: 'absolute', bottom: 2, left: 20, padding: 5}}
                                                    dropdownStyle={{marginTop: -15, marginLeft: -10, width: '20%', alignItems: 'center', backgroundColor: 'white', elevation: 10, shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.34, shadowRadius: 6.27, shadowColor: '#000'}} 
                                                    dropdownTextStyle={{fontSize: wp(4), fontFamily: 'Maven-med', textAlign: 'center', color: 'black'}} 
                                                    renderSeparator={() => (<Text style={{backgroundColor: '#ebebeb', height: 1}}></Text>)}
                                                    onSelect={(value, index) => updateList(item, index) ? setCustom([...custom]): setCustom([...custom, {item: item.name, value: index}])}
                                                >
                                                    <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => category === 'Fruits' ? fruitsDropdownRef.current[item.id].show() : category === 'Dried-fruits' ? driedfruitsDropdownRef.current[item.id].show() : category === 'Exotics' ? exoticsDropdownRef.current[item.id].show() : category === 'Immunity-Boosters' ? imbDropdownRef.current[item.id].show() : otherDropdownRef.current[item.id].show()} activeOpacity={1}>
                                                        {exists(item) ?
                                                            item.detail.map((item2) => {
                                                                return item2.quantity === exists(item) ?
                                                                <Text key={item2.id} style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: '#249c86'}}>{item2.quantity}</Text>: null 
                                                            })
                                                            : <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: '#249c86'}}>{item.detail[0].quantity}</Text>
                                                        }
                                                        <Text style={{fontFamily: 'Maven-med', color: '#249c86', fontSize: wp(4)}}> ▼</Text>
                                                    </TouchableOpacity>
                                                </ModalDropdown>
                                                <View style={{flex: 1}}>
                                                    <Image source={{uri: item.image}} style={{width: 100, height: 80, borderRadius: 10}}  />
                                                </View>
                                                <View style={{flex: 1}}>
                                                    <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(5), marginBottom: 5, color: 'black'}}>{item.name}</Text>
                                                    {exists(item) ? 
                                                        item.detail.map((item2) => {
                                                            return item2.quantity === exists(item) ?
                                                            item2.previous_price > 0 ? 
                                                            <View key={item2.id} style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                                                <Text style={{textAlign: 'center', fontFamily: 'Maven-med', textDecorationLine: 'line-through', marginRight: wp(2), color: 'black'}}>&#8377; {item2.previous_price}</Text>
                                                                <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>&#8377; {item2.price}</Text>
                                                            </View>:
                                                            <Text key={item2.id} style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>&#8377; {item2.price}</Text> : null
                                                            
                                                        }):  
                                                        
                                                        item.detail[0].previous_price > 0 ?
                                                        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                                            <Text style={{textAlign: 'center', fontFamily: 'Maven-med', textDecorationLine: 'line-through', marginRight: wp(2), color: 'black'}}>&#8377; {item.detail[0].previous_price}</Text>
                                                            <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>&#8377; {item.detail[0].price}</Text>
                                                        </View>
                                                        : <Text style={{textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>&#8377; {item.detail[0].price}</Text>
                                                    }
                                                    
                                                        {hideButton === 'none' ? item.availability === 'In stock' ? 
                                                            search(item) ? cartData.map((item1) => {
                                                                return item1.ordereditem  === item.name ? 
                                                                    
                                                                <View key={item1.id} style={{flexDirection: 'row', justifyContent: 'space-around',  alignSelf: 'center', marginTop: 10, backgroundColor: '#fff', borderRadius: 10, width: '60%', elevation: 1, shadowOffset: {width: 0, height: 1}, shadowRadius: 1.00, shadowOpacity: 0.18, shadowColor: '#000'}}>
                                                                    
                                                                    <Ripple onPress={buildCart(item)} style={{flex: 1, padding: 7, backgroundColor: '#6aab9e', borderRadius: 10, elevation: 5, shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000'}} rippleDuration={600} rippleContainerBorderRadius={5} rippleOpacity={0.5} onLongPress={{}}>
                                                                        <Text style={{textAlign: 'center',fontFamily: 'Maven-med', color: '#2A363B', fontSize: wp(4)}}>+</Text>
                                                                    </Ripple>
                                                                    <View style={{justifyContent: 'center', flex: 1, padding: 7}}>
                                                                        <Text style={{textAlign: 'center', fontFamily: 'Maven-med', color: '#2A363B', fontSize: wp(4)}}>{item1.item_count}</Text> 
                                                                    </View>
                                                                    <Ripple onPress={reduceItem(item)} style={{flex: 1, padding: 7, backgroundColor: '#6aab9e', borderRadius: 10, elevation: 5, shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000'}} rippleDuration={600} rippleContainerBorderRadius={5} rippleOpacity={0.5} onLongPress={{}}>
                                                                        <Text style={{textAlign: 'center',fontFamily: 'Maven-med', color: '#2A363B', fontSize: wp(4)}}>-</Text>
                                                                    </Ripple>
                                                                </View>
                                                                : null
                                                            }): 
                                                            <Ripple onPress={buildCart(item)} style={{alignSelf: 'center',  marginTop: 10, backgroundColor: '#6aab9e', width: '60%', padding: 7, borderRadius: 10, shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000', elevation: 5}} rippleDuration={600} rippleContainerBorderRadius={10} rippleOpacity={0.5} onLongPress={{}}>
                                                                <Text style={{textAlign: 'center', fontFamily: 'Maven-med', color: '#2A363B', fontSize: wp(4)}}>Add &#43;</Text>
                                                            </Ripple>
                                                        :  <Text style={{color: 'red', textAlign: 'center', fontFamily: 'Maven-sem', fontSize: wp(4), marginTop: 10, height: wp(8.5)}}>Out of stock !</Text>: <ActivityIndicator size={30} color="#6aab9e" style={{display: hideButton, alignSelf: 'center', marginTop: 10, height: wp(8.5)}} />}
                                                    
                                                </View>
                                            </View>
                                            }
                                        <View key={item.id} style={{marginBottom: hp(4), backgroundColor: 'white', shadowOffset: {width: 0, height: 2}, shadowRadius: 3.84, shadowOpacity: 0.25, shadowColor: '#000', elevation: 5, paddingTop: wp(1), paddingBottom: wp(6), borderRadius: 10}}>
                                            
                                            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 5}}>
                                                <Text style={{flex: 1, marginLeft: 15, fontFamily: 'Maven-sem', fontSize: wp(5), color: 'black'}}>Description</Text>
                                                {item.avg_ratings > 0 ? 
                                                    <View style={{flex: 1}}>
                                                        <View style={{flexDirection:'row', justifyContent: 'center', alignItems: 'center'}}>
                                                            <AntDesign name="star" size={15} style={item.avg_ratings > 0 ? {color: '#249C86'}: {color: 'grey'}} />
                                                            <AntDesign name="star" size={15} style={item.avg_ratings > 1 ? {color: '#249C86'}: {color: 'grey'}} />
                                                            <AntDesign name="star" size={15} style={item.avg_ratings > 2 ? {color: '#249C86'}: {color: 'grey'}} />
                                                            <AntDesign name="star" size={15} style={item.avg_ratings > 3 ? {color: '#249C86'}: {color: 'grey'}} />
                                                            <AntDesign name="star" size={15} style={item.avg_ratings > 4 ? {color: '#249C86'}: {color: 'grey'}} />
                                                            
                                                            <Text style={{textAlign: 'center', fontFamily: 'Maven-med', color: 'black'}}> (<FontAwesome name="user" size={wp(3)} color="black" /> {item.no_of_ratings}) </Text>
                                                        </View>
                                                    </View>
                                                : null}
                                            </View>
                                            <Text style={{marginLeft: 15, fontFamily: 'Maven-med', fontSize: wp(3.5), flex: 1, color: 'black'}}>{item.description}</Text>
                                            <Text style={{backgroundColor: '#ebebeb', height: 1, width: '90%', alignSelf: 'center', marginTop: 10}}></Text>
                                            <View style={{flex: 1, marginTop: 5}}>
                                                <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4.5), marginLeft: 15, color: 'black'}}>Nutrition per 100 g</Text>
                                                <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15, marginRight: 5, marginLeft: 5}}>
                                                    {item.nutritional_values.slice(0, 3).map((x, index) => {
                                                        return  <View key={x.id} style={{flex: 1, borderRightWidth: index === 2 ? 0: 1, borderColor: '#b5b5b5'}}>
                                                                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                                                        {x.name === 'Protein' ? <MaterialCommunityIcons name="arm-flex" size={wp(4)} color="#c58c85" />: 
                                                                        x.name === 'Carbs' ? <MaterialCommunityIcons name="barley" size={wp(4)} color="green" />:
                                                                        x.name === 'Sugar' ? <FontAwesome name="cubes" size={wp(4)} color="grey" />:
                                                                        x.name === 'Fat (Sat.)' || x.name === 'Fat (Unsat.)' || x.name === 'Fat (trans)' ? <Entypo name="drop" size={wp(4)} color="#8B8000" />: 
                                                                        x.name === 'Calories' ? <MaterialIcons name="local-fire-department" size={wp(4)} color="#249C86" /> : null}
                                                                        <Text style={{textAlign: 'center', fontFamily: 'Maven-med', fontSize: wp(4), color: 'black'}}> {x.name}</Text>
                                                                    </View>
                                                                    <Text style={{textAlign: 'center', fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'grey', marginTop: 3}}>{x.value}</Text>
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
                                                                        <Text style={{textAlign: 'center', fontFamily: 'Maven-med', fontSize: wp(4), color: 'black'}}> {x.name}</Text>
                                                                    </View>
                                                                    <Text style={{textAlign: 'center', fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'grey'}}>{x.value}</Text>
                                                                </View>
                                                    })}
                                                </View>
                                            </View>
                                            <TouchableOpacity style={{marginTop: 15, marginLeft: 15, alignSelf: 'flex-start'}} onPress={() => navigation.navigate('NutritionCalculator', {Item: item, values: item.nutritional_values})} activeOpacity={1}>
                                                <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3.5), color: '#249c86'}}>Calculate how much you intake ! &rarr;</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </FlipCard>
                            )}
                        />
                        <Animated.View style={{ transform: [{translateY: hideCategory}], position: 'absolute', backgroundColor: '#fcfcfc'}}>
                            <Animated.FlatList
                                ref={flRef}
                                data={[1, 2, 3, 4, 5]}
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={(item, index) => index.toString()}
                                contentContainerStyle={{padding: 25, paddingLeft: 0, paddingTop:5}}
                                overScrollMode={'never'}
                                onScrollToIndexFailed={(info) => console.log(info)}
                                onContentSizeChange={(w, h) => {
                                setcompleteScrollBarWidth(w);
                                }}
                                scrollEventThrottle={16}
                                onLayout={onLayout}
                                onScroll={Animated.event(
                                [{ nativeEvent: { contentOffset: { x: scrollIndicator } } }],
                                { useNativeDriver: true },
                                )}
                                renderItem={({index, item}) => {
                                    if (index === 0) {
                                        return (
                                            <Animated.View style={{transform: [{scale: scaleAnimation1}], flex: 1, marginLeft: 25}}>
                                                <TouchableOpacity style={{borderRadius: 10, backgroundColor: category === 'Fruits' ? '#e1f0ed' : '#fcfcfc', elevation: 2, padding: 15, paddingLeft: 30, paddingRight: 30, shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.20, shadowRadius: 1.41, shadowColor: '#000'}} activeOpacity={1} onPress={() => setCategory('Fruits')} onPressIn={() => startScale1()} onPressOut={() => stopScale1()}>
                                                    <Image source={require('../assets/fruits.png')} style={{width: 25, height: 25, alignSelf: 'center'}} />
                                                    <Text style={{textAlign: 'center', fontFamily: 'Maven-med', marginTop: 10, fontSize: wp(3.5)}}>Fruits</Text>
                                                </TouchableOpacity>
                                            </Animated.View>
                                        )
                                    } else if (index === 1){
                                        return (
                                            <Animated.View style={{transform: [{scale: scaleAnimation2}], flex: 1, marginLeft: 25}}>
                                                <TouchableOpacity style={{borderRadius: 10, backgroundColor: category === 'Dried-fruits' ? '#e1f0ed' : '#fcfcfc', elevation: 2, padding: 15, paddingLeft: 30, paddingRight: 30, shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.20, shadowRadius: 1.41, shadowColor: '#000'}} activeOpacity={1} onPress={() => setCategory('Dried-fruits')}  onPressIn={() => startScale2()} onPressOut={() => stopScale2()}>
                                                    <Image source={require('../assets/dried-fruits.png')} style={{width: 25, height: 25, alignSelf: 'center'}} />
                                                    <Text style={{textAlign: 'center', fontFamily: 'Maven-med', marginTop: 10, fontSize: wp(3.5)}}>Dried-Fruits</Text>
                                                </TouchableOpacity>
                                            </Animated.View>
                                        )
                                    } else if (index === 2) {
                                        return (
                                            <Animated.View style={{transform: [{scale: scaleAnimation3}], flex: 1, marginLeft: 25}}>
                                                <TouchableOpacity style={{borderRadius: 10, backgroundColor: category === 'Exotics' ? '#e1f0ed' : '#fcfcfc', elevation: 2, padding: 15, paddingLeft: 30, paddingRight: 30, shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.20, shadowRadius: 1.41, shadowColor: '#000'}} activeOpacity={1} onPress={() => setCategory('Exotics')}  onPressIn={() => startScale3()} onPressOut={() => stopScale3()}>
                                                    <Image source={require('../assets/broccoli.png')} style={{width: 25, height: 25, alignSelf: 'center'}} />
                                                    <Text style={{textAlign: 'center', fontFamily: 'Maven-med', marginTop: 10, fontSize: wp(3.5)}}>Exotics</Text>
                                                </TouchableOpacity>
                                            </Animated.View>
                                        )
                                    } else if (index === 3) {
                                        return (
                                            <Animated.View style={{transform: [{scale: scaleAnimation4}], flex: 1, marginLeft: 25}}>
                                                <TouchableOpacity style={{borderRadius: 10, backgroundColor: category === 'Immunity-Boosters' ? '#e1f0ed' : '#fcfcfc', elevation: 2, padding: 15, paddingLeft: 30, paddingRight: 30, shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.20, shadowRadius: 1.41, shadowColor: '#000'}} activeOpacity={1} onPress={() => setCategory('Immunity-Boosters')}  onPressIn={() => startScale4()} onPressOut={() => stopScale4()}>
                                                    <Image source={require('../assets/imb.png')} style={{width: 25, height: 25, alignSelf: 'center'}} />
                                                    <Text style={{textAlign: 'center', fontFamily: 'Maven-med', marginTop: 10, fontSize: wp(3.5)}}>Immunity-Boosters</Text>
                                                </TouchableOpacity>
                                            </Animated.View>
                                        )
                                    } else if (index === 4) {
                                        return (
                                            <Animated.View style={{transform: [{scale: scaleAnimation5}], flex: 1, marginLeft: 25}}>
                                                <TouchableOpacity style={{borderRadius: 10, backgroundColor: category === 'Other' ? '#e1f0ed' : '#fcfcfc', elevation: 2, padding: 15, paddingLeft: 30, paddingRight: 30, shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.20, shadowRadius: 1.41, shadowColor: '#000'}} activeOpacity={1} onPress={() => setCategory('Other')}  onPressIn={() => startScale5()} onPressOut={() => stopScale5()}>
                                                    <Image source={require('../assets/other.png')} style={{width: 25, height: 25, alignSelf: 'center'}} />
                                                    <Text style={{textAlign: 'center', fontFamily: 'Maven-med', marginTop: 10, fontSize: wp(3.5)}}>Other</Text>
                                                </TouchableOpacity>
                                            </Animated.View>
                                        )
                                    }
                                }}
                            />
                            <View style={{width: wp(20), backgroundColor: '#ebebeb', borderRadius: 3, height: 4, alignSelf: 'center', marginBottom: 15}}>
                                <Animated.View
                                style={{
                                    width: scrollIndicatorSize - wp(45),
                                    transform: [{ translateX: scrollIndicatorPosition }],
                                    backgroundColor: '#249c86',
                                    borderRadius: 3,
                                    height: 4,
                                    elevation: 5,
                                    shadowColor: '#249c86',
                                    shadowOffset: {
                                        width: 0,
                                        height: 2,
                                    },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 3.84,
                                    }}
                                />
                            </View>
                        </Animated.View>
                    </View>
            
                {/* <View style={{width: '100%', position: 'absolute', bottom: 0, backgroundColor: '#fcfcfc', padding: 5, paddingTop: 10, flexDirection: 'row', alignItems: 'center', elevation: 15, shadowOffset: {width: 0, height: 7}, shadowOpacity: 0.43, shadowRadius: 9.51, shadowColor: '#000'}}>
                    <View style={{flex: 1, alignItems: 'center'}}>
                        <TouchableOpacity onPress={() => navigation.navigate('Home')} activeOpacity={1}>
                            <CustomIcon name="home" size={wp(6)} style={{color: 'black', alignSelf: 'center'}} />
                            <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3), color: 'black', textAlign: 'center'}}>Home</Text>
                        </TouchableOpacity>         
                    </View>
                    <View style={{flex: 1}}>
                        <CustomIcon name="store-b" size={wp(6)} color="#249c86" style={{alignSelf: 'center'}} />
                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3), color: '#249c86', textAlign: 'center'}}>Store</Text>
                    </View>
                    <View style={{flex: 1}}>
                        <TouchableOpacity onPress={() => navigation.navigate('Subscription')} activeOpacity={1}>
                            <CustomIcon name="subscription" size={wp(6.5)} color="black" style={{alignSelf: 'center'}} />
                            <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3), color: 'black', textAlign: 'center'}}>Subscription</Text>
                        </TouchableOpacity>
                    </View>          
                </View> */}
            </View>
            <View style={{backgroundColor: '#fcfcfc', position: 'absolute', top: 0, left: 0, right: 0}}>
                <View style={{flexDirection: 'row', alignItems: 'center', padding: 25, paddingTop: 35, paddingBottom: 0, backgroundColor: '#fcfcfc'}}>
                    <View style={{flex: 1}}>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{alignSelf: 'flex-start'}} activeOpacity={1}>
                        {isLogin ? userData.image ? <Image source={{uri: userData.image}} style={{width: 40, height: 40, borderRadius: 100}} />: <LottieView source={require('../assets/animations/43110-male-avatar.json')} autoPlay={true} loop={true} style={{width: 60}}  />: <LottieView source={require('../assets/animations/43110-male-avatar.json')} autoPlay={true} loop={true} style={{width: 60}}  />}
                    </TouchableOpacity>
                    </View>
                    <View style={{flex: 1}}>
                        <Text style={{fontFamily: 'Maven-bold', fontSize: wp(5.5), textAlign: 'center'}}>Store</Text>
                    </View>
                    <View style={{flex: 1}}>
                        <TouchableOpacity onPress={() => navigation.navigate('cart')} style={{alignSelf: 'flex-end'}} activeOpacity={1}><CustomIcon name="cart" size={wp(6)} color="black" style={{alignSelf: 'center'}} /></TouchableOpacity>
                        {cartBadge ? <View style={{position: 'absolute', borderRadius: 100, backgroundColor: '#249c86', width: 15, height: 15, right: -10, top: -8}}>
                        </View> : null}
                    </View>
                </View>
            
                <View
                    style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#fcfcfc', 
                    padding: 10, 
                    borderRadius: 10,
                    marginLeft: 25,
                    marginRight: 25,
                    paddingLeft: 5,
                    marginTop: 15,
                    marginBottom: 25,
                    elevation: 3,
                    shadowOffset: {
                        width: 0,
                        height: 1,
                    },
                    shadowOpacity: 0.22,
                    shadowRadius: 2.22
                    }}
                >
                    <CopilotStep text={"Search for what you love !!"} order={1} name={'Search'}>
                        <CoPilotView style={{flex: 0.1, justifyContent: 'flex-end', alignItems: 'flex-end', marginRight: 5}}>
                            <TouchableOpacity onPress={() => searchInputRef.current.focus()} activeOpacity={1}>
                                <CustomIcon name="search" size={20} color="black"  />
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
                            placeholder="Search..."
                            style={{fontFamily: 'Maven-med', fontSize: wp(3.5)}}
                        />
                    </View>
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
        backgroundColor: "#6aab9e",
        elevation: 3,
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        shadowColor: '#000',
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
        <Text style={{fontFamily: 'Maven-med', fontSize: wp(4)}}>{currentStepNumber}</Text>
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
        <Text testID="stepDescription" style={{fontFamily: 'Maven-sem', fontSize: wp(3.5), color: 'black'}}>{currentStep.text}</Text>
      </View>
      <View style={{marginTop: 10, flexDirection: 'row', justifyContent: 'flex-end'}}>
        {
          !isLastStep ?
            <TouchableOpacity onPress={handleStop} activeOpacity={1}>
              <Text style={{padding: 10, fontFamily: 'Maven-sem', color: '#249c86'}}>{labels.skip || 'Skip'}</Text>
            </TouchableOpacity>
            : null
        }
        {
          !isFirstStep ?
            <TouchableOpacity onPress={handlePrev} activeOpacity={1}>
              <Text style={{padding: 10, fontFamily: 'Maven-sem', color: '#249c86'}}>{labels.previous || 'Previous'}</Text>
            </TouchableOpacity>
            : null
        }
        {
          !isLastStep ?
            <TouchableOpacity onPress={handleNext} activeOpacity={1}>
              <Text style={{padding: 10, fontFamily: 'Maven-sem', color: '#249c86'}}>{labels.next || 'Next'}</Text>
            </TouchableOpacity> :
            <TouchableOpacity onPress={handleStop} activeOpacity={1}>
              <Text style={{padding: 10, fontFamily: 'Maven-sem', color: '#249c86'}}>{labels.finish || 'Done'}</Text>
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