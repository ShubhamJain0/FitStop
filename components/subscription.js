import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef, isValidElement, useContext, useLayoutEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Image, Dimensions, TouchableHighlight, Platform, ScrollView, 
  TouchableOpacity, RefreshControl, Animated, Easing, Linking, Button, FlatList, ActivityIndicator } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen'; 
import { MaterialCommunityIcons, MaterialIcons, FontAwesome, Ionicons, AntDesign, createIconSetFromIcoMoon, FontAwesome5, Feather } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import NetInfo from "@react-native-community/netinfo";
import icoMoonConfig from '../selection.json';
import { showMessage } from 'react-native-flash-message';
import { CartContext, IsLoginContext, SubPlanContext, SubDayContext } from './context';
import * as SecureStore from 'expo-secure-store';
import Modal from 'react-native-modal';
import Carousel from 'react-native-snap-carousel';
import {Calendar, CalendarList, Agenda} from 'react-native-calendars';
import moment from 'moment';
import Ripple from 'react-native-material-ripple';
import Svg, { Circle, Path } from "react-native-svg";

const screenWidth = Dimensions.get("window").width;

export default function Subscription({ navigation }){

    const CustomIcon = createIconSetFromIcoMoon(icoMoonConfig, 'IcoMoon');

    const [mounted, setMounted] = useState(true);
    const [isOffline, setIsOffline] = useState(false);
    const [showIndic, setShowInidc] = useState(false);
    const [loading, setLoading] = useState('true');
    const [error, setError] = useState('');


    const [conIsLogin, setConIsLogin] = useContext(IsLoginContext);

    const [isLogin, setIsLogin] = useState(true);
    const [userData, setUserData] = useState({});

    const [cartBadge, setCartBadge] = useState('');
    const [ordersBadge, setOrdersBadge] = useState('');

    const tabs = [1, 2, 3, 4, 5];
    const [pathX] = useState("357")
    const [pathY] = useState("675")
    const [pathA] = useState("689")
    const [pathB] = useState("706")

    //Carousel, Modal, Calendar, date and time related

    const [choosenDay, setChoosenDay] = useContext(SubDayContext);

    var currentDate = new Date()
    currentDate.setDate(currentDate.getDate() + 1)

    const [showModal, setShowModal] = useState(false);
    const [subType, setSubType] = useState('');
    const [choosenPlan, setChoosenPlan] = useContext(SubPlanContext);

    const carouselRef = useRef(null);
    const [carouselData] = useState([1, 2]);
 

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



    useEffect(() => {
        const getToken = navigation.addListener('focus', () => {
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
                    .then(resp => {if (mounted && resp.json.length > 0) {setCartBadge(true)} else {setCartBadge(false)}})
                    .catch(error => setError(error))
                } else {
                    setCartBadge(false);
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
              .catch(error => setError(error));
          } else {
            if (mounted) {
                setIsLogin(false);
                setLoading('false');
            }
          }
        })().catch(error => setError(error))
  
    }, [conIsLogin])


    //Retry

    const retry = async () => {
        setShowInidc(true);
        const token = await SecureStore.getItemAsync('USER_TOKEN')
        try {

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
                .then(resp => {if(resp.json.length > 0){setCartBadge(true)} else {setCartBadge(false)}})
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
                .then(() => setShowInidc(false))
                .then(() => setIsOffline(false))
                .catch(error => setError(error))
            } else {
                setCartBadge(false);
                setOrdersBadge(false);
                setLoading('false');
                setIsOffline(false);
                setShowInidc(false);
                setIsLogin(false);
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
              <Text style={{fontFamily: 'Maven-sem', fontSize: wp(6), marginTop: 50, textAlign: 'center'}}>Uh oh! Seems like you are disconnected !</Text>
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
            <View style={{flexDirection: 'row', alignItems: 'center', padding: 25, paddingTop: 35}}>
                <View style={{flex: 1}}>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{alignSelf: 'flex-start'}} activeOpacity={1}>
                    {isLogin ? userData.image ? <Image source={{uri: userData.image}} style={{width: 40, height: 40, borderRadius: 50}} />: <LottieView source={require('../assets/animations/43110-male-avatar.json')} autoPlay={true} loop={true} style={{width: 60}}  />: <LottieView source={require('../assets/animations/43110-male-avatar.json')} autoPlay={true} loop={true} style={{width: 60}}  />}
                </TouchableOpacity>
                </View>
                <View style={{flex: 1.5}}>
                    <Text style={{fontFamily: 'Maven-bold', fontSize: wp(5.5), textAlign: 'center'}}>Subscription</Text>
                </View>
                <View style={{flex: 1}}>
                    <TouchableOpacity onPress={() => navigation.navigate('cart')} style={{alignSelf: 'flex-end'}} activeOpacity={1}><CustomIcon name="cart" size={wp(6)} color="black" style={{alignSelf: 'center'}} /></TouchableOpacity>
                    {cartBadge ? <View style={{position: 'absolute', borderRadius: 50, backgroundColor: '#249c86', width: 15, height: 15, right: -10, top: -8}}>
                    </View> : null}
                </View>
            </View>
            <ScrollView contentContainerStyle={{paddingBottom: 150, paddingTop: 20, marginTop: 25}} overScrollMode={'never'} showsVerticalScrollIndicator={false}>
                <Ripple style={styles.imageContainer} activeOpacity={0.9} onPress={() => (setShowModal(true), setSubType('Products'))} rippleDuration={600} rippleContainerBorderRadius={10} rippleOpacity={0.5} onLongPress={{}}>
                    <Image source={require('../assets/fruit.jpg')} style={{width: '100%', height: '100%', borderRadius: 10}} />
                </Ripple>
                <Ripple style={[styles.imageContainer, {marginTop: 40}]} activeOpacity={0.9} onPress={() => (setShowModal(true), setSubType('Recipes'))} rippleDuration={600} rippleContainerBorderRadius={10} rippleOpacity={0.5} onLongPress={{}}>
                    <Image source={require('../assets/ret.jpg')} style={{width: '100%', height: '100%', borderRadius: 10}} />
                </Ripple>
                <Ripple style={{marginLeft: 25, marginTop: 50, width: '50%', padding: 15, backgroundColor: '#6aab9e', borderRadius: 10, elevation: 5, shadowColor: "#000",shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.25, shadowRadius: 3.84}} onLongPress={{}} onPress={() => navigation.navigate('MySubscriptions')} rippleDuration={600} rippleContainerBorderRadius={10} rippleOpacity={0.5}>
                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), textAlign: 'center'}}>My subscriptions</Text>
                </Ripple>
            </ScrollView>

            <Modal
                isVisible={showModal}
                onBackdropPress={() => setShowModal(false)}
                onBackButtonPress={() => setShowModal(false)}
                backdropOpacity={0.8}
                backdropColor={'white'}
                style={{margin: 0}}
                useNativeDriver={true}
                useNativeDriverForBackdrop={true}
                animationInTiming={300}
                animationOutTiming={300}
                backdropTransitionInTiming={300}
                backdropTransitionOutTiming={300}
                animationIn={'slideInUp'}
            >
                <View style={{backgroundColor: 'white', marginTop: hp(10), height: '100%', flex: 1, elevation: 25, borderTopLeftRadius: 25, borderTopRightRadius: 25}}>
                    <TouchableOpacity style={{alignSelf: 'flex-end', padding: 25, paddingBottom: 0}} onPress={() => subType === 'Products' ? (setShowModal(false), setChoosenPlan(null), setChoosenDay(null), navigation.navigate('SubFruits')) : (setShowModal(false), setChoosenPlan(null), setChoosenDay(null), navigation.navigate('SubRecipe'))} activeOpacity={1}>
                        <Text style={{color: '#249c86', fontSize: wp(4), fontFamily: 'Maven-sem', marginBottom: 25}}>Do it later</Text>
                    </TouchableOpacity>
                    <Carousel 
                        ref={carouselRef}
                        data={carouselData}
                        sliderWidth={screenWidth}
                        itemWidth={screenWidth}
                        inactiveSlideScale={1}
                        scrollEnabled={false}
                        containerCustomStyle={{alignSelf: 'center'}}
                        renderItem={({item, index}) => {
                            return (
                                <View style={{flex: 1, padding: 25, paddingTop: 0}}>
                                    {index === 0 ?
                                    <View style={{flex: 1}}>
                                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(5.5)}}>Choose your plan</Text>
                                        <Text style={{fontFamily: 'Maven-med', fontSize: wp(4), color: 'black', marginTop: 10}}>{subType === 'Products' ? 'Items will be delivered on the first day of every plan week' : 'Items will be delivered daily'}</Text>
                                        <TouchableOpacity style={{flex: 0.5, borderWidth: 1.5, borderRadius: 5, borderColor: choosenPlan === '2-week' ? '#249c86' : 'grey', marginTop: 25, padding: 25, justifyContent: 'center'}} activeOpacity={1} onPress={() => setChoosenPlan('2-week')}>
                                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                                {choosenPlan === '2-week' ? 
                                                    <MaterialCommunityIcons name="checkbox-marked-circle" size={24} color="#249c86" />
                                                :
                                                    <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={24} color="grey" />
                                                }
                                                <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4.5), marginLeft: 15}}>2-week plan</Text>
                                            </View>
                                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                                <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={24} color="white" />
                                                <Text style={{fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'grey', marginLeft: 15}}>{subType === 'Products' ? '2 total delieveries' : '14 total deliveries'}</Text>
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={{flex: 0.5, borderWidth: 1.5, borderRadius: 5, borderColor: choosenPlan === 'Monthly' ? '#249c86' : 'grey', marginTop: 25, padding: 25, justifyContent: 'center'}} activeOpacity={1} onPress={() => setChoosenPlan('Monthly')}>
                                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                                {choosenPlan === 'Monthly' ? 
                                                    <MaterialCommunityIcons name="checkbox-marked-circle" size={24} color="#249c86" />
                                                :
                                                    <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={24} color="grey" />
                                                }
                                                <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4.5), marginLeft: 15}}>Monthly plan</Text>
                                            </View>
                                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                                <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={24} color="white" />
                                                <Text style={{fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'grey', marginLeft: 15}}>{subType === 'Products' ? '4 total deliveries' : 'Full month delivery'}</Text>
                                            </View>
                                        </TouchableOpacity>
                                        <View style={{flex: 1, marginTop: 50}}>
                                            <Ripple style={{width: '50%', alignSelf: 'center', padding: 15, backgroundColor: '#6aab9e', borderRadius: 10, elevation: 5, shadowColor: "#000",shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.25, shadowRadius: 3.84, opacity: choosenPlan ? 1 : 0.2}} disabled={choosenPlan ? false : true} onPress={() => carouselRef.current.snapToNext()} rippleDuration={600} rippleContainerBorderRadius={10} rippleOpacity={0.5} onLongPress={{}}>
                                                <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), textAlign: 'center'}}>Next</Text>
                                            </Ripple>
                                        </View>
                                    </View> :
                                    <View style={{flex: 1}}>
                                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(5.5), paddingBottom: 25}}>
                                            Choose the day to start your plan
                                        </Text>
                                        <ScrollView contentContainerStyle={{padding: 5, paddingTop: 0, paddingBottom: 15}} showsVerticalScrollIndicator={false} overScrollMode={'never'}>
                                            {choosenPlan === '2-week' ? 
                                            <Calendar
                                                style={{elevation: 5, marginTop: 5, borderRadius: 10, padding: 15, shadowColor: "#000", shadowOffset: {width: 0,height: 2,}, shadowOpacity: 0.25, shadowRadius: 3.84}}
                                                onDayPress={(result) => setChoosenDay(result)}
                                                minDate={currentDate}
                                                disableAllTouchEventsForDisabledDays={true}
                                                displayLoadingIndicator={true}
                                                markingType={'period'}
                                                markedDates={choosenDay ? subType === 'Products' ? {
                                                    [choosenDay.dateString]: {startingDay: true, color: '#6aab9e', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(1, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black'},
                                                    [moment(choosenDay.dateString).add(2, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black'},
                                                    [moment(choosenDay.dateString).add(3, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black'},
                                                    [moment(choosenDay.dateString).add(4, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black'},
                                                    [moment(choosenDay.dateString).add(5, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black'},
                                                    [moment(choosenDay.dateString).add(6, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black'},
                                                    [moment(choosenDay.dateString).add(7, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(8, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black'},
                                                    [moment(choosenDay.dateString).add(9, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black'},
                                                    [moment(choosenDay.dateString).add(10, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black'},
                                                    [moment(choosenDay.dateString).add(11, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black'},
                                                    [moment(choosenDay.dateString).add(12, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black'},
                                                    [moment(choosenDay.dateString).add(13, 'days').format('YYYY-MM-DD')]: {endingDay: true, color: '#6aab9e', textColor: 'black'},
                                                }: 
                                                {
                                                    [choosenDay.dateString]: {startingDay: true, color: '#6aab9e', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(1, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(2, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(3, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(4, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(5, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(6, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(7, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(8, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(9, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(10, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(11, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(12, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(13, 'days').format('YYYY-MM-DD')]: {endingDay: true, color: '#6aab9e', textColor: 'black', dotColor: 'black', marked: true},
                                                } 
                                                :
                                                {}}
                                                theme={{
                                                    arrowColor: '#249c86',
                                                    textMonthFontFamily: 'Maven-sem',
                                                    textDayFontFamily: 'Maven-med',
                                                    textDayHeaderFontFamily: 'Maven-sem',
                                                    indicatorColor: '#249c86',
                                                }}
                                            />:
                                            <Calendar
                                                style={{elevation: 5, marginTop: 5, borderRadius: 10, padding: 15, shadowColor: "#000", shadowOffset: {width: 0,height: 2,}, shadowOpacity: 0.25, shadowRadius: 3.84}}
                                                onDayPress={(result) => setChoosenDay(result)}
                                                minDate={currentDate}
                                                disableAllTouchEventsForDisabledDays={true}
                                                displayLoadingIndicator={true}
                                                markingType={'period'}
                                                markedDates={choosenDay ? subType === 'Products' ? {
                                                    [choosenDay.dateString]: {startingDay: true, color: '#6aab9e', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(1, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black'},
                                                    [moment(choosenDay.dateString).add(2, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black'},
                                                    [moment(choosenDay.dateString).add(3, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black'},
                                                    [moment(choosenDay.dateString).add(4, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black'},
                                                    [moment(choosenDay.dateString).add(5, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black'},
                                                    [moment(choosenDay.dateString).add(6, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black'},
                                                    [moment(choosenDay.dateString).add(7, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(8, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black'},
                                                    [moment(choosenDay.dateString).add(9, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black'},
                                                    [moment(choosenDay.dateString).add(10, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black'},
                                                    [moment(choosenDay.dateString).add(11, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black'},
                                                    [moment(choosenDay.dateString).add(12, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black'},
                                                    [moment(choosenDay.dateString).add(13, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black'},
                                                    [moment(choosenDay.dateString).add(14, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(15, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black'},
                                                    [moment(choosenDay.dateString).add(16, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black'},
                                                    [moment(choosenDay.dateString).add(17, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black'},
                                                    [moment(choosenDay.dateString).add(18, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black'},
                                                    [moment(choosenDay.dateString).add(19, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black'},
                                                    [moment(choosenDay.dateString).add(20, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black'},
                                                    [moment(choosenDay.dateString).add(21, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(22, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black'},
                                                    [moment(choosenDay.dateString).add(23, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black'},
                                                    [moment(choosenDay.dateString).add(24, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black'},
                                                    [moment(choosenDay.dateString).add(25, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black'},
                                                    [moment(choosenDay.dateString).add(26, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black'},
                                                    [moment(choosenDay.dateString).add(27, 'days').format('YYYY-MM-DD')]: {endingDay: true, color: '#6aab9e', textColor: 'black'},
                                                }
                                                :
                                                {
                                                    [choosenDay.dateString]: {startingDay: true, color: '#6aab9e', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(1, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(2, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(3, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(4, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(5, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(6, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(7, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(8, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(9, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(10, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(11, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(12, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(13, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(14, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(15, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(16, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(17, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(18, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(19, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(20, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(21, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(22, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(23, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(24, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(25, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(26, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(27, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(28, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(29, 'days').format('YYYY-MM-DD')]: {color: '#e1f0ed', textColor: 'black', dotColor: 'black', marked: true},
                                                    [moment(choosenDay.dateString).add(30, 'days').format('YYYY-MM-DD')]: {endingDay: true, color: '#6aab9e', textColor: 'black', dotColor: 'black', marked: true},
                                                }
                                                :
                                                {}}
                                                theme={{
                                                    arrowColor: '#249c86',
                                                    textMonthFontFamily: 'Maven-sem',
                                                    textDayFontFamily: 'Maven-med',
                                                    textDayHeaderFontFamily: 'Maven-sem',
                                                    indicatorColor: '#249c86',
                                                }}
                                            />}
                                            {choosenDay ? subType === 'Products' ?
                                            choosenPlan === '2-week' ?
                                            <View style={{marginTop: 50}}> 
                                                <Text style={{fontFamily: 'Maven-med', fontSize: wp(4)}}>&#9679;  Products will be delivered on the start of every plan week i.e., on <Text style={{fontFamily: 'Maven-sem'}}>{choosenDay.dateString} and {moment(choosenDay.dateString).add(7, 'days').format('YYYY-MM-DD')}</Text></Text>
                                                <Text style={{fontFamily: 'Maven-med', fontSize: wp(4), marginTop: 25}}>&#9679;  Your subscription will end on <Text style={{fontFamily: 'Maven-sem'}}>{moment(choosenDay.dateString).add(13, 'days').format('YYYY-MM-DD')}</Text></Text>
                                                <Ripple style={{backgroundColor: '#6aab9e', padding: 15, borderRadius: 10, width: '50%', alignSelf: 'center', marginTop: 25,  elevation: 5, shadowColor: "#000",shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.25, shadowRadius: 3.84}} onPress={() => (setShowModal(false), navigation.navigate('SubFruits'))} rippleDuration={600} rippleContainerBorderRadius={10} rippleOpacity={0.5} onLongPress={{}}>
                                                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), textAlign: 'center'}}>Confirm</Text>
                                                </Ripple>
                                            </View>
                                            : 
                                            <View style={{marginTop: 50}}> 
                                                <Text style={{fontFamily: 'Maven-med', fontSize: wp(4)}}>&#9679;  Products will be delivered on the start of every plan week i.e., on <Text style={{fontFamily: 'Maven-sem'}}>{choosenDay.dateString}, {moment(choosenDay.dateString).add(7, 'days').format('YYYY-MM-DD')}, {moment(choosenDay.dateString).add(14, 'days').format('YYYY-MM-DD')} and {moment(choosenDay.dateString).add(21, 'days').format('YYYY-MM-DD')}</Text></Text>
                                                <Text style={{fontFamily: 'Maven-med', fontSize: wp(4), marginTop: 25}}>&#9679;  Your subscription will end on <Text style={{fontFamily: 'Maven-sem'}}>{moment(choosenDay.dateString).add(27, 'days').format('YYYY-MM-DD')}</Text></Text>
                                                <Ripple style={{backgroundColor: '#6aab9e', padding: 15, borderRadius: 10, width: '50%', alignSelf: 'center', marginTop: 25,  elevation: 5, shadowColor: "#000",shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.25, shadowRadius: 3.84}} onPress={() => (setShowModal(false), navigation.navigate('SubFruits'))} rippleDuration={600} rippleContainerBorderRadius={10} rippleOpacity={0.5} onLongPress={{}}>
                                                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), textAlign: 'center'}}>Confirm</Text>
                                                </Ripple>
                                            </View>
                                            : choosenPlan === '2-week' ?
                                            <View style={{marginTop: 50}}> 
                                                <Text style={{fontFamily: 'Maven-med', fontSize: wp(4)}}>&#9679;  Products will be delivered for 14 days</Text>
                                                <Text style={{fontFamily: 'Maven-med', fontSize: wp(4), marginTop: 25}}>&#9679;  Your subscription will end on <Text style={{fontFamily: 'Maven-sem'}}>{moment(choosenDay.dateString).add(13, 'days').format('YYYY-MM-DD')}</Text></Text>
                                                <Ripple style={{backgroundColor: '#6aab9e', padding: 15, borderRadius: 10, width: '50%', alignSelf: 'center', marginTop: 25,  elevation: 5, shadowColor: "#000",shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.25, shadowRadius: 3.84}} onPress={() => (setShowModal(false), navigation.navigate('SubRecipe'))} rippleDuration={600} rippleContainerBorderRadius={10} rippleOpacity={0.5} onLongPress={{}}>
                                                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), textAlign: 'center'}}>Confirm</Text>
                                                </Ripple>
                                            </View>
                                            :
                                            <View style={{marginTop: 50}}> 
                                                <Text style={{fontFamily: 'Maven-med', fontSize: wp(4)}}>&#9679;  Products will be delivered for the entire month</Text>
                                                <Text style={{fontFamily: 'Maven-med', fontSize: wp(4), marginTop: 25}}>&#9679;  Your subscription will end on <Text style={{fontFamily: 'Maven-sem'}}>{moment(choosenDay.dateString).add(1, 'month').format('YYYY-MM-DD')}</Text></Text>
                                                <Ripple style={{backgroundColor: '#6aab9e', padding: 15, borderRadius: 10, width: '50%', alignSelf: 'center', marginTop: 25,  elevation: 5, shadowColor: "#000",shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.25, shadowRadius: 3.84}} onPress={() => (setShowModal(false), navigation.navigate('SubRecipe'))} rippleDuration={600} rippleContainerBorderRadius={10} rippleOpacity={0.5} onLongPress={{}}>
                                                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), textAlign: 'center'}}>Confirm</Text>
                                                </Ripple>
                                            </View>
                                            :
                                            null}
                                        </ScrollView>
                                    </View>
                                    }
                                </View>
                            ) 
                            
                        }} 
                    />
                    
                </View>
            </Modal>

            {/* <View style={{width: '90%', position: 'absolute', bottom: 10, backgroundColor: '#fcfcfc', left: 20, right: 20, padding: 5, borderRadius: 10,flexDirection: 'row', alignItems: 'center', elevation: 15, shadowOffset: {width: 0, height: 7}, shadowOpacity: 0.43, shadowRadius: 9.51, shadowColor: '#000'}}>
                <View style={{flex: 1, alignItems: 'center'}}>
                    <TouchableOpacity onPress={() => navigation.navigate('Home')} activeOpacity={1}>
                        <CustomIcon name="home" size={wp(6)} style={{color: 'black', alignSelf: 'center'}} />
                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3), color: 'black', textAlign: 'center'}}>Home</Text>
                    </TouchableOpacity>         
                </View>
                <View style={{flex: 1}}>
                    <TouchableOpacity onPress={() => navigation.navigate('Fruits')} activeOpacity={1} style={{alignSelf: 'center'}}>
                        <CustomIcon name="store" size={wp(6)} color="black" style={{alignSelf: 'center'}} />
                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3), color: 'black', textAlign: 'center'}}>Store</Text>
                    </TouchableOpacity>
                </View>
                <View style={{flex: 1}}>
                    <TouchableOpacity style={{backgroundColor: '#fcfcfc', borderRadius: 50, elevation: 5, padding: 15, top: -30, left: 0, right: 0 }} onPress={() => navigation.navigate('Subscription')} activeOpacity={1}>
                        <CustomIcon name="cart" size={wp(6.5)} color="black" style={{alignSelf: 'center'}} />
                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3), color: 'black', textAlign: 'center'}}>cart</Text>
                    </TouchableOpacity>
                </View>    
                <View style={{flex: 1}}>
                    <TouchableOpacity onPress={() => navigation.navigate('Recipes')} activeOpacity={1}>
                        <CustomIcon name="card" size={wp(6.5)} color="black" style={{alignSelf: 'center'}} />
                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3), color: 'black', textAlign: 'center'}}>Recipes</Text>
                    </TouchableOpacity>
                </View>    
                <View style={{flex: 1}}>
                    <TouchableOpacity onPress={() => navigation.navigate('Subscription')} activeOpacity={1}>
                        <CustomIcon name="subscription-b" size={wp(6.5)} color="#249c86" style={{alignSelf: 'center'}} />
                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3), color: '#249c86', textAlign: 'center'}}>Subscription</Text>
                    </TouchableOpacity>
                </View>        
            </View>  */}

            {/* <View style={[styles.content]}>
            <View style={styles.subContent}>
                {tabs.map((_tabs, i) => {
                return (
                    <TouchableHighlight
                    key={i}
                    underlayColor={"transparent"}
                    onPress={() => console.log("onPress")}
                    style={{flex: 1}}
                    >
                        <View>
                        {i === 0 ?
                        <CustomIcon name="home" size={wp(6)} style={{color: 'black', alignSelf: 'center'}} />:
                        i === 1 ?
                        <CustomIcon name="store" size={wp(6)} color="black" style={{alignSelf: 'center'}} />:
                        i === 2 ?
                        <CustomIcon name="cart" size={wp(6.5)} color="black" style={{alignSelf: 'center'}} />:
                        <CustomIcon name="subscription-b" size={wp(6.5)} color="#249c86" style={{alignSelf: 'center'}} />
                    }
                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3), color: 'black', textAlign: 'center'}}>Home</Text>
                        </View>
                    
                    </TouchableHighlight>
                );
                })}
            </View>
            <Svg
                version="1.1"
                id="bottom-bar"
                x="0px"
                y="0px"
                width="100%"
                height="100"
                viewBox="0 0 1092 260"
                space="preserve"
                
            >
                <Path
                fill={"#ebebeb"}
                stroke={'#ebebeb'}
                strokeWidth={1}
                d={`M30,60h${pathX}.3c17.2,0,31,14.4,30,31.6c-0.2,2.7-0.3,5.5-0.3,8.2c0,71.2,58.1,129.6,129.4,130c72.1,0.3,130.6-58,130.6-130c0-2.7-0.1-5.4-0.2-8.1C${pathY}.7,74.5,${pathA}.5,60,${pathB}.7,60H1062c16.6,0,30,13.4,30,30v94c0,42-34,76-76,76H76c-42,0-76-34-76-76V90C0,73.4,13.4,60,30,60z`}
                />
                <Circle
                fill={"#6aab9e"}
                stroke={"#6aab9e"}
                cx="546"
                cy="100"
                r="100"
                />
            </Svg>
            </View> */}
        </View>
    )
}


const styles = StyleSheet.create({
    imageContainer: {
        width: '90%',
        height: 600*(screenWidth/1445),
        backgroundColor: 'white',
        borderRadius: 10,
        elevation: 5,
        shadowOffset: {width: 0, height: 5},
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        shadowColor: '#000',
        alignSelf: 'center'
      },
      content: {
        flexDirection: "column",
        zIndex: 0,
        width: Dimensions.get("window").width - 30,
        marginBottom: "2%",
        left: "4%",
        right: "4%",
        position: "absolute",
        bottom: "0%",
      },
      subContent: {
        flexDirection: "row",
        marginBottom: 10,
        zIndex: 1,
        position: "absolute",
        bottom: 10,
      }
})