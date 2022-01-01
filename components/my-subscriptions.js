import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { Button } from 'react-native';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image, ScrollView, Platform, ActivityIndicator, Dimensions, FlatList } from 'react-native';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Svg, { Path, Rect, Circle, G, Polygon, LinearGradient, Defs, Stop, Ellipse } from 'react-native-svg';
import LottieView from 'lottie-react-native';
import { showMessage } from 'react-native-flash-message';
import * as SecureStore from 'expo-secure-store';
import { UserContext, SubPlanContext, SubDayContext, PushTokenContext } from './context';
import Carousel from 'react-native-snap-carousel';
import {Calendar, CalendarList, Agenda} from 'react-native-calendars';
import moment from 'moment';
import NetInfo from "@react-native-community/netinfo";
import { MaterialCommunityIcons, MaterialIcons, FontAwesome, Ionicons, AntDesign, createIconSetFromIcoMoon, FontAwesome5, Feather } from '@expo/vector-icons';


const {width: screenWidth} = Dimensions.get('window');


export default function MySubscriptions({ navigation }) {

    const [mounted, setMounted] = useState(true);
    const [isOffline, setIsOffline] = useState(false);
    const [showIndic, setShowInidc] = useState(false);

    const [type, setType] = useState('Products');
    const [list, setList] = useState([]);
    const [items, setItems] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [images, setImages] = useState([]);
    const [recipeImages, setRecipeImages] = useState([]);
    const [status, setStatus] = useState(0);


    const [detailsModal, setDetailsModal] = useState(false);
    const [details, setDetails] = useState(null);

    const [addressModal, setAddressModal] = useState(false);
    const [address, setAddress] = useState('');
    const [locality, setLocality] = useState('');
    const [city, setCity] = useState('');

    const [conPushToken] = useContext(PushTokenContext);


    //Carousel, Modal, Calendar, date and time related

    var currentDate = new Date()
    currentDate.setDate(currentDate.getDate() + 1)

    const [planModal, setPlanModal] = useState(false);
    const [subType, setSubType] = useState('');
    const [choosenPlan, setChoosenPlan] = useContext(SubPlanContext);
    const [choosenDay, setChoosenDay] = useContext(SubDayContext);

    const carouselRef = useRef(null);
    const [carouselData] = useState([1, 2, 3]);

    const [error, setError] = useState('');


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
        (async () => {
            const token = await SecureStore.getItemAsync('USER_TOKEN')
            if (token) {
              fetch('http://192.168.0.156:8000/store/mysubscriptions/',{
                  method: 'GET',
                  headers: {
                  'Authorization': `Token ${token}`,
                  'Content-type': 'application/json'
                  }
              })
              .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
              .then(resp => {if (mounted) {setList(resp.json.subscriptions_list), setItems(resp.json.item_data), setRecipes(resp.json.recipe_data), setImages(resp.json.item_images), setRecipeImages(resp.json.recipe_images), setStatus(resp.status)}})
              .catch(error => setError(error))
            } else {
                setStatus(401);
            }
          })().catch(error => setError(error))
    }, [])


    const repeatSubscription = async () => {
        const token = await SecureStore.getItemAsync('USER_TOKEN')
        if (token) {
            fetch('http://192.168.0.156:8000/store/repeatsubscription/',{
                method: 'POST',
                headers: {
                'Authorization': `Token ${token}`,
                'Content-type': 'application/json'
                },
                body: JSON.stringify({sub_id: details.id})
            })
            .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
            .then(resp => {if (resp.status === 404) {
                showMessage({
                    message: 'Some items are out of stock, sorry for inconvenience !',
                    position: 'top',
                    floating: true,
                    titleStyle: {fontFamily: 'Maven-sem', fontSize: wp(3.5)},
                    style: {alignItems: 'center'},
                    icon: 'auto',
                    type: 'warning',
                    statusBarHeight: hp(3),
                    duration: 5000
                })
            }})
            .then(() => setPlanModal(false))
            .then(() => details.subscription_type === 'Products' ? navigation.navigate('SubFruits') : navigation.navigate('SubRecipe'))
            .catch(error => setError(error))
        }
    }


    const retry = async () => {
        setShowInidc(true);
        const token = await SecureStore.getItemAsync('USER_TOKEN')
        try {
            if (token) {
                fetch('http://192.168.0.156:8000/store/mysubscriptions/',{
                    method: 'GET',
                    headers: {
                    'Authorization': `Token ${token}`,
                    'Content-type': 'application/json'
                    }
                })
                .then(resp => resp.json().then(data => ({status: resp.status, json: data})))
                .then(resp => {if (mounted) {setList(resp.json.subscriptions_list), setItems(resp.json.item_data), setRecipes(resp.json.recipe_data), setImages(resp.json.item_images), setRecipeImages(resp.json.recipe_images), setStatus(resp.status)}})
                .then(() => setIsOffline(false))
                .catch(error => setError(error))
            } else {
                if (mounted) {
                    setStatus(401);
                    setShowInidc(false);
                    setIsOffline(false);
                }
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
                <Text style={{fontFamily: 'Maven-bold', fontSize: wp(6), marginTop: 50, textAlign: 'center', color: 'black'}}>Uh oh! Seems like you are disconnected !</Text>
                {!showIndic ? <TouchableOpacity style={{alignSelf: 'center', marginTop: 25}} onPress={retry} activeOpacity={1}>
                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: '#249c86'}}>RETRY</Text>
                </TouchableOpacity>: <LottieView source={require('../assets/animations/connecting.json')} autoPlay={true} loop={true} style={{height: 100, alignSelf: 'center'}} />}
                </View>
            </View>
        )
    }


    if (type === 'Products'){
        return (
            <View style={styles.container}>
                <StatusBar style="inverted" />
                {status === 200 ? 
                    <View>
                        <View style={{flexDirection: 'row', alignItems: 'center', width: '85%', alignSelf: 'center'}}>
                            <View style={{flex: 1}}>
                                <TouchableOpacity style={{alignSelf: 'center'}} onPress={() => setType('Products')} activeOpacity={1}>
                                    <Text style={{color: type === 'Products' ? '#249c86' : 'grey', fontSize: wp(4), fontFamily: 'Maven-sem' }}>Products</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{flex: 1}}>
                                <TouchableOpacity style={{alignSelf: 'center'}} onPress={() => setType('Ready-to-eat')} activeOpacity={1}>
                                    <Text style={{color: type === 'Ready-to-eat' ? '#249c86' : 'grey', fontSize: wp(4), fontFamily: 'Maven-sem' }}>Ready-to-eat</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <FlatList 
                            data={list}
                            keyExtractor={(item, index) => index.toString()}
                            contentContainerStyle={{paddingBottom: 50, paddingTop: 50}}
                            renderItem={({ item }) => {
                                return item.subscription_type === 'Products' ? (
                                    <View style={{marginBottom: 50, backgroundColor: 'white', width: '85%', padding: 25, alignSelf: 'center', elevation: 10, borderRadius: 10, shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.34, shadowRadius: 6.27, shadowColor: '#000'}}>
                                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(5), color: item.subscription_status === 'Active' ? 'green' : '#F67280', marginTop: 2}}>{item.subscription_status}</Text>
                                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black', marginTop: 10}}>{item.subscription_plan} plan</Text>
                                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3.5), color: 'black', marginTop: 5}}>Your subscription ends on {item.enddate}</Text>
                                        <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
                                            <TouchableOpacity style={{alignSelf: 'flex-start'}} onPress={() => (setDetailsModal(true), setDetails(item))} activeOpacity={1}>
                                                <Text style={{fontFamily: 'Maven-med', fontSize: wp(3.5), color: '#249c86'}}>View all details &raquo;</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <Text style={{backgroundColor: '#ebebeb', height: 1, marginTop: 15}}></Text>
                                        <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
                                            {item.subscription_status === 'Expired' ? 
                                                <TouchableOpacity style={{alignSelf: 'flex-start', flex: 1, opacity: 1}} onPress={() => (setPlanModal(true), setDetails(item))} activeOpacity={1}>
                                                    <Text style={{fontSize: wp(4), color: '#249C86', fontFamily: 'Maven-sem'}}> Repeat subscription</Text>
                                                </TouchableOpacity> :
                                                <TouchableOpacity disabled={true} style={{alignSelf: 'flex-start', flex: 1, opacity: 0.2}} activeOpacity={1}>
                                                    <Text style={{fontSize: wp(4), color: '#249C86', fontFamily: 'Maven-sem'}}> Repeat subscription</Text>
                                                </TouchableOpacity>
                                            }
                                        </View>
                                    </View>
                                
                                ) : 
                                <View style={{flex: 1, justifyContent: 'center'}}>
                                    <Image source={require('../assets/not-found.png')} style={{width: '85%', height: 2071*(screenWidth/3994), alignSelf: 'center'}} />
                                    <Text style={{marginTop: 50, fontFamily: 'Maven-sem', fontSize: wp(5), textAlign: 'center', color: 'black'}}>No subscriptions available.</Text>
                                    <TouchableOpacity activeOpacity={1} style={{marginTop: 15, alignSelf: 'center'}} onPress={() => (navigation.popToTop(), navigation.navigate('Subscription'))}>
                                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), textAlign: 'center', color: '#249c86'}}>SUBSCRIBE NOW</Text>
                                    </TouchableOpacity>
                                </View>
                            }}
                        
                    />
                </View>
                : status === 404 || status === 401 ? 
                        <View style={{flex: 1, justifyContent: 'center'}}>
                            <Image source={require('../assets/not-found.png')} style={{width: '85%', height: 2071*(screenWidth/3994), alignSelf: 'center'}} />
                            <Text style={{marginTop: 50, fontFamily: 'Maven-sem', fontSize: wp(5), textAlign: 'center', color: 'black'}}>You haven't started your subscription yet.</Text>
                            <TouchableOpacity activeOpacity={1} style={{marginTop: 15, alignSelf: 'center'}} onPress={() => (navigation.popToTop(), navigation.navigate('Subscription'))}>
                                <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), textAlign: 'center', color: '#249c86'}}>SUBSCRIBE NOW</Text>
                            </TouchableOpacity>
                        </View>
                        
                        : <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><LottieView source={require('../assets/animations/9258-bouncing-fruits.json')} style={{width: 200}} loop={true} autoPlay={true} /></View>}
                <Modal 
                    isVisible={detailsModal}
                    backdropOpacity={0.3}
                    backdropColor={'black'}
                    onBackdropPress={() => setDetailsModal(false)}
                    onBackButtonPress={() => setDetailsModal(false)}
                    backdropTransitionInTiming={600}
                    backdropTransitionOutTiming={600}
                    animationInTiming={600}
                    animationOutTiming={600}
                    useNativeDriver={true}
                    useNativeDriverForBackdrop={true}
                >
                    <View style={{flex: 1, alignSelf: 'center', width: '90%', padding: 25, backgroundColor: 'white'}}>
                        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                            <Text style={{fontFamily: 'Maven-bold', fontSize: wp(6), marginBottom: 20, color: 'black'}}>Details</Text>
                            <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), marginBottom: 10, color: 'black'}}>Items to be delivered every week</Text>
                            {details ? items.map(item1 => {
                                        return item1.items.map((x,index) => {
                                            return x.id_of_subscription === details.id ?
                                            <View key={x.id} style={{marginTop: 10}}>
                                                {index !== 0 ? <Text style={{backgroundColor: '#ebebeb', height: 1, marginBottom: 10, width: '75%', alignSelf: 'flex-end'}}></Text>: null}
                                                <View style={{flexDirection: 'row'}}>
                                                    {images.length > 0 ? 
                                                        images.map(y => {
                                                            return x.item_name === y.name ? 
                                                            <Image key={y.id} source={{uri: y.image}} style={{width: 55, height: 55, borderRadius: 20}} />
                                                            : null
                                                        })
                                                    : null}
                                                    <View style={{marginLeft: 25, marginTop: 5}}>
                                                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>{x.item_name} </Text>
                                                        <Text style={{marginRight: 25, fontFamily: 'Maven-med', fontSize: wp(3.5), marginTop: 5, color: 'black'}}>{x.item_weight}     x{x.item_count}</Text>
                                                    </View>
                                                </View>
                                            </View>: null
                                        })
                            }): 'null'}
                            <Text style={{backgroundColor: '#cccccc', height: 1, marginTop: 15}}></Text>
                            <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4.5), marginTop: 10, marginBottom: 10, color: 'black'}}>Delivery address</Text>
                            {details ? <Text style={{fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'black'}}>{details.delivery_address}, {details.delivery_locality}, {details.delivery_city}</Text>: 'null'}
                            <Text style={{backgroundColor: '#cccccc', height: 1, marginTop: 15}}></Text>
                            <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4.5), marginTop: 10, marginBottom: 10, color: 'black'}}>Plan start date</Text>
                            {details ? 
                                <Text style={{fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'black'}}>{details.startdate}</Text>
                            : 'null'}
                            <Text style={{backgroundColor: '#cccccc', height: 1, marginTop: 15}}></Text>
                            <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4.5), marginTop: 10, marginBottom: 10, color: 'black'}}>Bill break-up for your plan</Text>
                            {details ? 
                                <View>
                                    <View style={{flexDirection: 'row', marginBottom: 5}}>
                                        <Text style={{flex: 1, fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'black'}}>Item subtotal</Text>
                                        <Text style={{flex: 1, textAlign: 'right', fontFamily: 'Maven-sem', fontSize: wp(3.5), color: 'black'}}>&#8377; {details.cart_total}</Text>
                                    </View>
                                    <View style={{flexDirection: 'row', marginBottom: 5}}>
                                        <Text style={{flex: 1, fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'black'}}>Delivery Charges</Text>
                                        <Text style={{flex: 1, textAlign: 'right', fontFamily: 'Maven-sem', fontSize: wp(3.5), color: 'black'}}>&#8377; {details.delivery_charges}</Text>
                                    </View>
                                    <View style={{flexDirection: 'row', marginBottom: 5}}>
                                        <Text style={{flex: 1, fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'black'}}>Taxes</Text>
                                        <Text style={{flex: 1, textAlign: 'right', fontFamily: 'Maven-sem', fontSize: wp(3.5), color: 'black'}}>&#8377; {details.taxes}</Text>
                                    </View>
                                    {details.coupon !== 0 ? 
                                        <View style={{flexDirection: 'row', marginBottom: 5}}>
                                            <Text style={{flex: 1, fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'black'}}>Offer Applied</Text>
                                            <Text style={{flex: 1, textAlign: 'right', fontFamily: 'Maven-sem', fontSize: wp(3.5), color: 'black'}}>- &#8377; {details.coupon}</Text>
                                        </View>: null
                                    }
                                    <View style={{flexDirection: 'row', marginBottom: 5}}>
                                        <Text style={{flex: 1, fontFamily: 'Maven-sem', fontSize: wp(4.5), color: 'black'}}>Total</Text>
                                        <Text style={{flex: 1, textAlign: 'right', fontFamily: 'Maven-sem', fontSize: wp(4.5), color: 'black'}}>&#8377; {details.total_subscription_price}</Text>
                                    </View>
                                    {details ? <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3.5), color: 'black', marginTop: 10}}>Paid via {details.payment_mode}</Text>: 'null'}
                                </View>
                            : 'null'
                            }
                            <Text style={{backgroundColor: '#cccccc', height: 1, marginTop: 15}}></Text>
                        </ScrollView>
                    </View>
                </Modal>

                <Modal
                    isVisible={addressModal}
                    backdropOpacity={0.3}
                    backdropColor={'black'}
                    onBackdropPress={() => setAddressModal(false)}
                    onBackButtonPress={() => setAddressModal(false)}
                    backdropTransitionInTiming={600}
                    backdropTransitionOutTiming={600}
                    animationInTiming={600}
                    animationOutTiming={600}
                    useNativeDriver={true}
                    useNativeDriverForBackdrop={true}
                >
                    <Text>

                    </Text>
                </Modal>

                    <Modal
                        isVisible={planModal}
                        onBackdropPress={() => setPlanModal(false)}
                        onBackButtonPress={() => setPlanModal(false)}
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
                            <TouchableOpacity style={{alignSelf: 'flex-end', padding: 25, paddingBottom: 0}} onPress={() => (setChoosenPlan(null), setChoosenDay(null), repeatSubscription())} activeOpacity={1}>
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
                                                        <Text style={{fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'grey', marginLeft: 15}}>2 total delieveries</Text>
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
                                                        <Text style={{fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'grey', marginLeft: 15}}>4 total deliveries</Text>
                                                    </View>
                                                </TouchableOpacity>
                                                <View style={{flex: 1, marginTop: 50}}>
                                                    <TouchableOpacity style={{width: '50%', alignSelf: 'center', padding: 15, backgroundColor: '#6aab9e', borderRadius: 10, elevation: 5, shadowColor: "#000",shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.25, shadowRadius: 3.84, opacity: choosenPlan ? 1 : 0.2}} disabled={choosenPlan ? false : true} onPress={() => carouselRef.current.snapToNext()} activeOpacity={1}>
                                                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), textAlign: 'center'}}>Continue</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View> :
                                            <View style={{flex: 1}}>
                                                <Text style={{fontFamily: 'Maven-sem', fontSize: wp(5.5), paddingBottom: 25}}>
                                                    Choose the day to start your plan
                                                </Text>
                                                <ScrollView contentContainerStyle={{padding: 5, paddingTop: 0}} showsVerticalScrollIndicator={false} overScrollMode={'never'}>
                                                    {choosenPlan === '2-week' ? 
                                                    <Calendar
                                                        style={{elevation: 5, marginTop: 5, borderRadius: 10, padding: 15, shadowColor: "#000", shadowOffset: {width: 0,height: 2,}, shadowOpacity: 0.25, shadowRadius: 3.84}}
                                                        onDayPress={(result) => setChoosenDay(result)}
                                                        minDate={currentDate}
                                                        disableAllTouchEventsForDisabledDays={true}
                                                        displayLoadingIndicator={true}
                                                        markingType={'period'}
                                                        markedDates={choosenDay ? {
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
                                                        markedDates={choosenDay ? {
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
                                                        {}}
                                                        theme={{
                                                            arrowColor: '#249c86',
                                                            textMonthFontFamily: 'Maven-sem',
                                                            textDayFontFamily: 'Maven-med',
                                                            textDayHeaderFontFamily: 'Maven-sem',
                                                            indicatorColor: '#249c86',
                                                        }}
                                                    />}
                                                    {choosenDay ? 
                                                    choosenPlan === '2-week' ?
                                                    <View style={{marginTop: 50}}> 
                                                        <Text style={{fontFamily: 'Maven-med', fontSize: wp(4)}}>&#9679;  Products will be delivered on the start of every plan week i.e., on <Text style={{fontFamily: 'Maven-sem'}}>{choosenDay.dateString} and {moment(choosenDay.dateString).add(7, 'days').format('YYYY-MM-DD')}</Text></Text>
                                                        <Text style={{fontFamily: 'Maven-med', fontSize: wp(4), marginTop: 25}}>&#9679;  Your subscription will end on <Text style={{fontFamily: 'Maven-sem'}}>{moment(choosenDay.dateString).add(13, 'days').format('YYYY-MM-DD')}</Text></Text>
                                                       <TouchableOpacity style={{backgroundColor: '#6aab9e', padding: 15, borderRadius: 10, width: '50%', alignSelf: 'center', marginTop: 25,  elevation: 5, shadowColor: "#000",shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.25, shadowRadius: 3.84}} onPress={() => repeatSubscription()} activeOpacity={1}>
                                                            <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), textAlign: 'center'}}>Continue</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                    : 
                                                    <View style={{marginTop: 50}}> 
                                                        <Text style={{fontFamily: 'Maven-med', fontSize: wp(4)}}>&#9679;  Products will be delivered on the start of every plan week i.e., on <Text style={{fontFamily: 'Maven-sem'}}>{choosenDay.dateString}, {moment(choosenDay.dateString).add(7, 'days').format('YYYY-MM-DD')}, {moment(choosenDay.dateString).add(14, 'days').format('YYYY-MM-DD')} and {moment(choosenDay.dateString).add(21, 'days').format('YYYY-MM-DD')}</Text></Text>
                                                        <Text style={{fontFamily: 'Maven-med', fontSize: wp(4), marginTop: 25}}>&#9679;  Your subscription will end on <Text style={{fontFamily: 'Maven-sem'}}>{moment(choosenDay.dateString).add(27, 'days').format('YYYY-MM-DD')}</Text></Text>
                                                        <TouchableOpacity style={{backgroundColor: '#6aab9e', padding: 15, borderRadius: 10, width: '50%', alignSelf: 'center', marginTop: 25,  elevation: 5, shadowColor: "#000",shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.25, shadowRadius: 3.84}} onPress={() => repeatSubscription()} activeOpacity={1}>
                                                            <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), textAlign: 'center'}}>Continue</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                    : null}
                                                </ScrollView>
                                            </View> }
                                        </View>
                                    ) 
                                    
                                }} 
                            />
                            
                        </View>
                    </Modal>
            </View>
        )
    } else {
        return (
            <View style={styles.container}>
                <StatusBar style="inverted" />
                {status === 200 ? 
                    <View>
                        <View style={{flexDirection: 'row', alignItems: 'center', width: '85%', alignSelf: 'center'}}>
                            <View style={{flex: 1}}>
                                <TouchableOpacity style={{alignSelf: 'center'}} onPress={() => setType('Products')} activeOpacity={1}>
                                    <Text style={{color: type === 'Products' ? '#249c86' : 'grey', fontSize: wp(4), fontFamily: 'Maven-sem' }}>Products</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{flex: 1}}>
                                <TouchableOpacity style={{alignSelf: 'center'}} onPress={() => setType('Ready-to-eat')} activeOpacity={1}>
                                    <Text style={{color: type === 'Ready-to-eat' ? '#249c86' : 'grey', fontSize: wp(4), fontFamily: 'Maven-sem' }}>Ready-to-eat</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <FlatList 
                            data={list}
                            keyExtractor={(item, index) => index.toString()}
                            contentContainerStyle={{paddingBottom: 50, paddingTop: 50}}
                            renderItem={({ item }) => {
                                return item.subscription_type === 'Ready-to-eat' ? (
                                    <View style={{marginBottom: 50, backgroundColor: 'white', width: '85%', padding: 25, alignSelf: 'center', elevation: 10, borderRadius: 10, shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.34, shadowRadius: 6.27, shadowColor: '#000'}}>
                                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(5), color: item.subscription_status === 'Active' ? 'green' : '#F67280', marginTop: 2}}>{item.subscription_status}</Text>
                                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black', marginTop: 15}}>{item.subscription_plan} plan</Text>
                                        <Text style={{fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'black', marginTop: 5}}>Your subscription ends on {item.enddate}</Text>
                                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black', marginTop: 15}}>Delivering to</Text>
                                        <Text style={{fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'black', marginTop: 5}}>{item.delivery_address}, {item.delivery_locality}, {item.delivery_city}</Text>
                                        <TouchableOpacity style={{alignSelf: 'flex-start'}} activeOpacity={1}>
                                            <Text style={{color: '#249c86', fontFamily: 'Maven-med', fontSize: wp(3.5), marginTop: 5}}>Change address</Text>
                                        </TouchableOpacity>
                                        <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20}}>
                                            <TouchableOpacity style={{alignSelf: 'flex-start'}} onPress={() => (setDetailsModal(true), setDetails(item))} activeOpacity={1}>
                                                <Text style={{fontFamily: 'Maven-med', fontSize: wp(3.5), color: '#249c86'}}>View all details &raquo;</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <Text style={{backgroundColor: '#ebebeb', height: 1, marginTop: 15}}></Text>
                                        <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
                                            {item.subscription_status === 'Expired' ? 
                                                <TouchableOpacity style={{alignSelf: 'flex-start', flex: 1, opacity: 1}} onPress={() => (setPlanModal(true), setDetails(item))} activeOpacity={1}>
                                                    <Text style={{fontSize: wp(4), color: '#249C86', fontFamily: 'Maven-sem'}}> Repeat subscription</Text>
                                                </TouchableOpacity> :
                                                <TouchableOpacity disabled={true} style={{alignSelf: 'flex-start', flex: 1, opacity: 0.2}} activeOpacity={1}>
                                                    <Text style={{fontSize: wp(4), color: '#249C86', fontFamily: 'Maven-sem'}}> Repeat subscription</Text>
                                                </TouchableOpacity>
                                            }
                                        </View>
                                    </View>
                                
                                ) : 
                                <View style={{flex: 1, justifyContent: 'center'}}>
                                    <Image source={require('../assets/not-found.png')} style={{width: '85%', height: 2071*(screenWidth/3994), alignSelf: 'center'}} />
                                    <Text style={{marginTop: 50, fontFamily: 'Maven-sem', fontSize: wp(5), textAlign: 'center', color: 'black'}}>No subscriptions available.</Text>
                                    <TouchableOpacity activeOpacity={1} style={{marginTop: 15, alignSelf: 'center'}} onPress={() => (navigation.popToTop(), navigation.navigate('Subscription'))}>
                                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), textAlign: 'center', color: '#249c86'}}>SUBSCRIBE NOW</Text>
                                    </TouchableOpacity>
                                </View>
                            }}
                        
                    />
                </View>
                : status === 404 || status === 401 ? 
                        <View style={{flex: 1, justifyContent: 'center'}}>
                            <Image source={require('../assets/not-found.png')} style={{width: '85%', height: 2071*(screenWidth/3994), alignSelf: 'center'}} />
                            <Text style={{marginTop: 50, fontFamily: 'Maven-sem', fontSize: wp(5), textAlign: 'center', color: 'black'}}>You haven't started your subscription yet.</Text>
                            <TouchableOpacity activeOpacity={1} style={{marginTop: 15, alignSelf: 'center'}} onPress={() => (navigation.popToTop(), navigation.navigate('Subscription'))}>
                                <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), textAlign: 'center', color: '#249c86'}}>SUBSCRIBE NOW</Text>
                            </TouchableOpacity>
                        </View>
                        
                        : <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><LottieView source={require('../assets/animations/9258-bouncing-fruits.json')} style={{width: 200}} loop={true} autoPlay={true} /></View>}
                <Modal 
                    isVisible={detailsModal}
                    backdropOpacity={0.3}
                    backdropColor={'black'}
                    onBackdropPress={() => setDetailsModal(false)}
                    onBackButtonPress={() => setDetailsModal(false)}
                    backdropTransitionInTiming={600}
                    backdropTransitionOutTiming={600}
                    animationInTiming={600}
                    animationOutTiming={600}
                    useNativeDriver={true}
                    useNativeDriverForBackdrop={true}
                >
                    <View style={{flex: 1, alignSelf: 'center', width: '90%', padding: 25, backgroundColor: 'white'}}>
                        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                            <Text style={{fontFamily: 'Maven-bold', fontSize: wp(6), marginBottom: 20, color: 'black'}}>Details</Text>
                            <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), marginBottom: 10, color: 'black'}}>Items to be delivered every day</Text>
                            {details ? recipes.map(item1 => {
                                        return item1.recipes.map((x,index) => {
                                            return x.id_of_subscription === details.id ?
                                            <View key={x.id} style={{marginTop: 10}}>
                                                {index !== 0 ? <Text style={{backgroundColor: '#ebebeb', height: 1, marginBottom: 10, width: '75%', alignSelf: 'flex-end'}}></Text>: null}
                                                <View style={{flexDirection: 'row'}}>
                                                    {recipeImages.length > 0 ? 
                                                        recipeImages.map(y => {
                                                            return x.recipe_name === y.name ? 
                                                            <Image key={y.id} source={{uri: y.image}} style={{width: 55, height: 55, borderRadius: 20}} />
                                                            : null
                                                        })
                                                    : null}
                                                    <View style={{marginLeft: 25, marginTop: 5}}>
                                                        <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), color: 'black'}}>{x.recipe_name} </Text>
                                                        <Text style={{marginRight: 25, fontFamily: 'Maven-med', fontSize: wp(3.5), marginTop: 5, color: 'black'}}>{x.category}</Text>
                                                    </View>
                                                </View>
                                            </View>: null
                                        })
                            }): 'null'}
                            <Text style={{backgroundColor: '#cccccc', height: 1, marginTop: 15}}></Text>
                            <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4.5), marginTop: 10, marginBottom: 10, color: 'black'}}>Delivery address</Text>
                            {details ? <Text style={{fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'black'}}>{details.delivery_address}, {details.delivery_locality}, {details.delivery_city}</Text>: 'null'}
                            <Text style={{backgroundColor: '#cccccc', height: 1, marginTop: 15}}></Text>
                            <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4.5), marginTop: 10, marginBottom: 10, color: 'black'}}>Plan start date</Text>
                            {details ? 
                                <Text style={{fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'black'}}>{details.startdate}</Text>
                            : 'null'}
                            <Text style={{backgroundColor: '#cccccc', height: 1, marginTop: 15}}></Text>
                            <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4.5), marginTop: 10, marginBottom: 10, color: 'black'}}>Bill break-up for your plan</Text>
                            {details ? 
                                <View>
                                    <View style={{flexDirection: 'row', marginBottom: 5}}>
                                        <Text style={{flex: 1, fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'black'}}>Item subtotal</Text>
                                        <Text style={{flex: 1, textAlign: 'right', fontFamily: 'Maven-sem', fontSize: wp(3.5), color: 'black'}}>&#8377; {details.cart_total}</Text>
                                    </View>
                                    <View style={{flexDirection: 'row', marginBottom: 5}}>
                                        <Text style={{flex: 1, fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'black'}}>Delivery Charges</Text>
                                        <Text style={{flex: 1, textAlign: 'right', fontFamily: 'Maven-sem', fontSize: wp(3.5), color: 'black'}}>&#8377; {details.delivery_charges}</Text>
                                    </View>
                                    <View style={{flexDirection: 'row', marginBottom: 5}}>
                                        <Text style={{flex: 1, fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'black'}}>Taxes</Text>
                                        <Text style={{flex: 1, textAlign: 'right', fontFamily: 'Maven-sem', fontSize: wp(3.5), color: 'black'}}>&#8377; {details.taxes}</Text>
                                    </View>
                                    {details.coupon !== 0 ? 
                                        <View style={{flexDirection: 'row', marginBottom: 5}}>
                                            <Text style={{flex: 1, fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'black'}}>Offer Applied</Text>
                                            <Text style={{flex: 1, textAlign: 'right', fontFamily: 'Maven-sem', fontSize: wp(3.5), color: 'black'}}>- &#8377; {details.coupon}</Text>
                                        </View>: null
                                    }
                                    <View style={{flexDirection: 'row', marginBottom: 5}}>
                                        <Text style={{flex: 1, fontFamily: 'Maven-sem', fontSize: wp(4.5), color: 'black'}}>Total</Text>
                                        <Text style={{flex: 1, textAlign: 'right', fontFamily: 'Maven-sem', fontSize: wp(4.5), color: 'black'}}>&#8377; {details.total_subscription_price}</Text>
                                    </View>
                                    {details ? <Text style={{fontFamily: 'Maven-sem', fontSize: wp(3.5), color: 'black', marginTop: 10}}>Paid via {details.payment_mode}</Text>: 'null'}
                                </View>
                            : 'null'
                            }
                            <Text style={{backgroundColor: '#cccccc', height: 1, marginTop: 15}}></Text>
                        </ScrollView>
                    </View>
                </Modal>

            <Modal
                isVisible={planModal}
                onBackdropPress={() => setPlanModal(false)}
                onBackButtonPress={() => setPlanModal(false)}
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
                    <TouchableOpacity style={{alignSelf: 'flex-end', padding: 25, paddingBottom: 0}} onPress={() => (setChoosenPlan(null), setChoosenDay(null), repeatSubscription())} activeOpacity={1}>
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
                                        <Text style={{fontFamily: 'Maven-med', fontSize: wp(4), color: 'black', marginTop: 10}}>Items will be delivered daily</Text>
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
                                                <Text style={{fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'grey', marginLeft: 15}}>14 total deliveries</Text>
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
                                                <Text style={{fontFamily: 'Maven-med', fontSize: wp(3.5), color: 'grey', marginLeft: 15}}>Full month delivery</Text>
                                            </View>
                                        </TouchableOpacity>
                                        <View style={{flex: 1, marginTop: 50}}>
                                            <TouchableOpacity style={{width: '50%', alignSelf: 'center', padding: 15, backgroundColor: '#6aab9e', borderRadius: 10, elevation: 5, shadowColor: "#000",shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.25, shadowRadius: 3.84, opacity: choosenPlan ? 1 : 0.2}} disabled={choosenPlan ? false : true} onPress={() => carouselRef.current.snapToNext()} activeOpacity={1}>
                                                <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), textAlign: 'center'}}>Next</Text>
                                            </TouchableOpacity>
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
                                                markedDates={choosenDay ? 
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
                                                markedDates={choosenDay ?
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
                                            {choosenDay ? choosenPlan === '2-week' ?
                                            <View style={{marginTop: 50}}> 
                                                <Text style={{fontFamily: 'Maven-med', fontSize: wp(4)}}>&#9679;  Products will be delivered for 14 days</Text>
                                                <Text style={{fontFamily: 'Maven-med', fontSize: wp(4), marginTop: 25}}>&#9679;  Your subscription will end on <Text style={{fontFamily: 'Maven-sem'}}>{moment(choosenDay.dateString).add(13, 'days').format('YYYY-MM-DD')}</Text></Text>
                                                <TouchableOpacity style={{backgroundColor: '#6aab9e', padding: 15, borderRadius: 10, width: '50%', alignSelf: 'center', marginTop: 25,  elevation: 5, shadowColor: "#000",shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.25, shadowRadius: 3.84}} onPress={() => (setPlanModal(false), repeatSubscription())} activeOpacity={1}>
                                                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), textAlign: 'center'}}>Continue</Text>
                                                </TouchableOpacity>
                                            </View>
                                            :
                                            <View style={{marginTop: 50}}> 
                                                <Text style={{fontFamily: 'Maven-med', fontSize: wp(4)}}>&#9679;  Products will be delivered for the entire month</Text>
                                                <Text style={{fontFamily: 'Maven-med', fontSize: wp(4), marginTop: 25}}>&#9679;  Your subscription will end on <Text style={{fontFamily: 'Maven-sem'}}>{moment(choosenDay.dateString).add(1, 'month').format('YYYY-MM-DD')}</Text></Text>
                                                <TouchableOpacity style={{backgroundColor: '#6aab9e', padding: 15, borderRadius: 10, width: '50%', alignSelf: 'center', marginTop: 25,  elevation: 5, shadowColor: "#000",shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.25, shadowRadius: 3.84}} onPress={() => (setPlanModal(false), repeatSubscription())} activeOpacity={1}>
                                                    <Text style={{fontFamily: 'Maven-sem', fontSize: wp(4), textAlign: 'center'}}>Continue</Text>
                                                </TouchableOpacity>
                                            </View>
                                            :
                                            null}
                                        </ScrollView>
                                    </View>}
                                </View>
                            ) 
                            
                        }} 
                    />
                    
                </View>
            </Modal>
            </View>
        )
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fcfcfc',
        paddingTop: 25
    },
})