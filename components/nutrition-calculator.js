import React, { useState, useEffect, useContext, useRef } from 'react';
import { TouchableNativeFeedback } from 'react-native';
import { StyleSheet, Text, View, RefreshControl, ScrollView, SafeAreaView, Image, Button, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Dimensions, Animated } from 'react-native';
import Modal from 'react-native-modal';
import { AntDesign, FontAwesome, MaterialIcons, Entypo, Ionicons, EvilIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';
import Carousel, {ParallaxImage, Pagination} from 'react-native-snap-carousel';
import { VictoryLabel, VictoryPie } from "victory-native";
import Svg, { Path, G, Rect, Circle, Polygon, Ellipse, Defs } from 'react-native-svg';
import { StatusBar } from 'expo-status-bar';

const {width: screenWidth} = Dimensions.get('window');

export default function NutritionCalculator({ navigation, route }) {

    const { Item } = route.params;
    const { values } = route.params;

    const [carouselData, setCarouselData] = useState([{first: 'first'}, {second: 'second'}, {third: 'third'}])
    const carouselRef = useRef(null);

    const [open, setOpen] = useState(false);

    const [defValues, setDefValues] = useState([]);
    const [defUnits, setDefUnits] = useState([
        {label: 'Grams', value: 'Grams'}, 
        {label: 'Kilo-Grams', value: 'KiloGrams'},
        {label: 'Ounces (oz)', value: 'Ounces'}
    ])

    const [customUnit, setCustomUnit] = useState('');
    const [customWeight, setCustomWeight] = useState(null);

    const [carbs, setCarbs] = useState(null);
    const [protein, setProtein] = useState(null);
    const [sugar, setSugar] = useState(null);
    const [calories, setCalories] = useState(null);
    const [fat, setFat] = useState(null);

    const defaultGraphicData = [{x: ' ', y: 0 }, {x: ' ', y: 1000}];
    const [graphicData1, setGraphicData1] = useState(defaultGraphicData);
    const [graphicData2, setGraphicData2] = useState(defaultGraphicData);
    const [graphicData4, setGraphicData4] = useState(defaultGraphicData);
    const [graphicData5, setGraphicData5] = useState(defaultGraphicData);
    const wantedGraphicData1 = [{x: ' ', y: protein }, {x: ' ', y: carbs + sugar + fat }];
    const wantedGraphicData2 = [{x: ' ', y: sugar }, {x: ' ', y: carbs + protein + fat }];
    const wantedGraphicData4 = [{x: ' ', y: carbs}, {x: ' ', y: protein + sugar + fat}];
    const wantedGraphicData5 = [{x: ' ', y: fat }, {x: ' ', y: carbs + protein + sugar}];
    const graphicColor1 = ['#c58c85', '#d9d9d9'];
    const graphicColor2 = ['grey', '#d9d9d9'];
    const graphicColor3 = ['#249c86', '#d9d9d9'];
    const graphicColor4 = ['green', '#d9d9d9'];
    const graphicColor5 = ['#8b8000', '#d9d9d9'];

    const [p1, setP1] = useState(0);
    const [p2, setP2] = useState(0);
    const [p3, setP3] = useState(0);
    const [p4, setP4] = useState(0);

    useEffect(() => {
        if (values !== undefined) {
            setDefValues(values);
        }
    }, [values])

    useEffect(() => {
        if (protein || carbs || fat || sugar || calories) {
            setGraphicData1(wantedGraphicData1);
            setGraphicData2(wantedGraphicData2);
            setGraphicData4(wantedGraphicData4);
            setGraphicData5(wantedGraphicData5);

            setP1(((protein / (protein + carbs + sugar + fat)) * 100).toFixed(1));
            setP2(((sugar / (protein + carbs + sugar + fat)) * 100).toFixed(1));
            setP3(((carbs / (protein + carbs + sugar + fat)) * 100).toFixed(1));
            setP4(((fat / (protein + carbs + sugar + fat)) * 100).toFixed(1));
        }
    }, [protein, calories, carbs, sugar, fat])


    const calculate = () => {
        if (customUnit === 'Grams') {
            defValues.map(x => {
                return x.name === 'Sugar' ?
                customWeight >= 100 ? 
                setSugar(+(x.value.replace(/[^0-9.]/g, '') * (customWeight / 100)).toFixed(1)) : setSugar(+(x.value.replace(/[^0-9.]/g, '') / (100 / customWeight)).toFixed(1))
                : x.name === 'Protein' ?
                customWeight >= 100 ? 
                setProtein(+(x.value.replace(/[^0-9.]/g, '') * (customWeight / 100)).toFixed(1)) : setProtein(+(x.value.replace(/[^0-9.]/g, '') / (100 / customWeight)).toFixed(1))
                : x.name === 'Calories' ?
                customWeight >= 100 ? 
                setCalories(+(x.value.replace(/[^0-9.]/g, '') * (customWeight / 100)).toFixed(1)) : setCalories(+(x.value.replace(/[^0-9.]/g, '') / (100 / customWeight)).toFixed(1))
                : x.name === 'Carbs' ?
                customWeight >= 100 ? 
                setCarbs(+(x.value.replace(/[^0-9.]/g, '') * (customWeight / 100)).toFixed(1)) : setCarbs(+(x.value.replace(/[^0-9.]/g, '') / (100 / customWeight)).toFixed(1))
                : x.name === 'Fat (Sat.)' || x.name === 'Fat (Unsat.)' || x.name === 'Fat (trans)' ?
                customWeight >= 100 ? 
                setFat(+(x.value.replace(/[^0-9.]/g, '') * (customWeight / 100)).toFixed(1)) : setFat(+(x.value.replace(/[^0-9.]/g, '') / (100 / customWeight)).toFixed(1))
                : null
            })
        } else if (customUnit === 'KiloGrams') {
            defValues.map(x => {
                return x.name === 'Sugar' ?
                setSugar(+(x.value.replace(/[^0-9.]/g, '') * (customWeight * 10)).toFixed(1))
                : x.name === 'Protein' ?
                setProtein(+(x.value.replace(/[^0-9.]/g, '') * (customWeight * 10)).toFixed(1))
                : x.name === 'Calories' ?
                setCalories(+(x.value.replace(/[^0-9.]/g, '') * (customWeight * 10)).toFixed(1))
                : x.name === 'Carbs' ?
                setCarbs(+(x.value.replace(/[^0-9.]/g, '') * (customWeight * 10)).toFixed(1))
                : x.name === 'Fat (Sat.)' || x.name === 'Fat (Unsat.)' || x.name === 'Fat (trans)' ?
                setFat(+(x.value.replace(/[^0-9.]/g, '') * (customWeight * 10)).toFixed(1))
                : null
            })
        } else if (customUnit === 'Ounces') {
            defValues.map(x => {
                return x.name === 'Sugar' ?
                customWeight >= 3.51 ? 
                setSugar(+(x.value.replace(/[^0-9.]/g, '') * ((customWeight * 28.35) / 100)).toFixed(1)) : setSugar(+(x.value.replace(/[^0-9.]/g, '') / (100 / (customWeight * 28.35))).toFixed(1))
                : x.name === 'Protein' ?
                customWeight >= 3.51 ? 
                setProtein(+(x.value.replace(/[^0-9.]/g, '') * ((customWeight * 28.35) / 100)).toFixed(1)) : setProtein(+(x.value.replace(/[^0-9.]/g, '') / (100 / (customWeight * 28.35))).toFixed(1))
                : x.name === 'Calories' ?
                customWeight >= 3.51 ? 
                setCalories(+(x.value.replace(/[^0-9.]/g, '') * ((customWeight * 28.35) / 100)).toFixed(1)) : setCalories(+(x.value.replace(/[^0-9.]/g, '') / (100 / (customWeight * 28.35))).toFixed(1))
                : x.name === 'Carbs' ?
                customWeight >= 3.51 ? 
                setCarbs(+(x.value.replace(/[^0-9.]/g, '') * ((customWeight * 28.35) / 100)).toFixed(1)) : setCarbs(+(x.value.replace(/[^0-9.]/g, '') / (100 / (customWeight * 28.35))).toFixed(1))
                : x.name === 'Fat (Sat.)' || x.name === 'Fat (Unsat.)' || x.name === 'Fat (trans)' ?
                customWeight >= 3.51 ? 
                setFat(+(x.value.replace(/[^0-9.]/g, '') * ((customWeight * 28.35) / 100)).toFixed(1)) : setFat(+(x.value.replace(/[^0-9.]/g, '') / (100 / (customWeight * 28.35))).toFixed(1))
                : null
            })
        }
    }




    return (
        <View style={styles.container}>
            <StatusBar style="inverted" />
            <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={{minHeight: hp(99)}}>
            <Image source={{uri: Item.image}} style={{width: 175, height: 175, alignSelf: 'center'}} />
            <Text style={{fontFamily: 'sofia-black', textAlign: 'center', fontSize: wp(6), marginTop: 15, color: 'black'}}>{Item.name}</Text>
            <Text style={{backgroundColor: '#ebebeb', height: 1, marginTop: 25, width: '80%', alignSelf: 'center'}}></Text>
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
                        <View style={{width: '80%', alignSelf: 'center'}}>
                            {index === 0 ? <Text style={{fontFamily: 'Maison-bold', fontSize: wp(4), marginBottom: 25, marginTop: 25, color: 'black'}}>Choose how you want to measure the item in .</Text>: null}
                            {index === 0 ? 
                                <DropDownPicker 
                                    placeholder={'Select......'}
                                    placeholderStyle={{fontFamily: 'Maison-bold'}}
                                    open={open}
                                    value={customUnit}
                                    items={defUnits}
                                    setOpen={setOpen}
                                    setValue={(value) => (setCustomUnit(value), setTimeout(() => carouselRef.current.snapToNext(), 500))}
                                    listItemLabelStyle={{fontFamily: 'Maison-bold'}}
                                    selectedItemLabelStyle={{fontFamily: 'Maison-bold', color: '#249c86'}}
                                    labelStyle={{color: '#249c86', fontFamily: 'Maison-bold'}}
                                    dropDownContainerStyle={{elevation: 3, backgroundColor: 'white', borderColor: '#fcfcfc', borderTopColor: '#ebebeb', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.22, shadowRadius: 2.22, shadowColor: '#000'}}
                                    style={{elevation: 3, borderColor: '#fcfcfc', backgroundColor: '#fff', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.22, shadowRadius: 2.22, shadowColor: '#000'}}
                                    
                                />
                                : index === 1 ? 
                                    <View style={{marginTop: 25}}>
                                        <Text style={{fontFamily: 'Maison-bold', fontSize: wp(4), color: 'black'}}>Enter weight of the item .</Text>
                                        
                                        <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 25, justifyContent: 'center'}}>
                                            <TextInput style={{fontFamily: 'sf', fontSize: wp(4), width: '30%', borderBottomWidth: 1, borderBottomColor: '#ebebeb', textAlign: 'center'}} placeholder={'Weight'} onChangeText={(text) => setCustomWeight(text)} keyboardType={'numeric'} onSubmitEditing={() => customWeight ? (calculate(), carouselRef.current.snapToNext()) : null} />
                                            <Text style={{fontFamily: 'Maison-bold', fontSize: wp(4), marginLeft: 10, color: 'black'}}>{customUnit}</Text>
                                            <TouchableOpacity style={{}} onPress={() => {carouselRef.current.snapToPrev()}}>
                                                <Text style={{marginLeft: 5, fontFamily: 'Maison-bold', fontSize: wp(4), color: '#249c86'}}>(Change)</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <TouchableOpacity disabled={customWeight ?  false : true} style={{opacity: customWeight ? 1 : 0.2, backgroundColor: '#6aab9e', alignSelf: 'center', padding: 10, paddingLeft: 15, paddingRight: 15, borderRadius: 5, marginTop: 25}} onPress={() => {calculate(), carouselRef.current.snapToNext()}}>
                                            <Text style={{fontFamily: 'Maison-bold', fontSize: wp(3.5), color: 'black'}}>Get values</Text>
                                        </TouchableOpacity>
                                        
                                    </View>
                                : index === 2 ?
                                    <View>
                                        <View style={{flexDirection: 'row', alignItems: 'center',  marginTop: 25}}>
                                            <Text style={{fontFamily: 'Maison-bold', fontSize: wp(4), color: 'black'}}>Nutrition in </Text>
                                            <Text style={{color: '#249c86', fontFamily: 'Maison-bold', fontSize: wp(4)}}>{customWeight} {customUnit}</Text>
                                        </View>
                                        <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 35}}>
                                            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                                                <View style={{flex: 1, alignItems: 'center'}}>
                                                    <Svg  width={50} height={50} >
                                                        <VictoryPie
                                                            animate={{duration: 1000, easing: 'circle'}}
                                                            data={graphicData1}
                                                            width={50}
                                                            height={50} 
                                                            colorScale={graphicColor1}
                                                            innerRadius={23} 
                                                            radius={25}
                                                        />
                                                        <VictoryLabel style={{fontSize: wp(3), fontWeight: '500'}} text={p1 + '%'}  x={p1.toString().length === 3 ? 15 : p1.toString().length === 1 ? 18 : 10} y={25} />
                                                    </Svg>
                                                </View>
                                                
                                                <View style={{flex: 1}}>
                                                    <Text style={{fontFamily: 'Maison-bold', fontSize: wp(4), color: '#c58c85'}}>Protein</Text>
                                                    <Text style={{fontFamily: 'Maison-bold', fontSize: wp(3.5), color: 'black'}}>{protein} g</Text>
                                                </View>
                                            </View>
                                            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                                                <View style={{flex: 1, alignItems: 'center'}}>
                                                    <Svg width={50} height={50}>
                                                        <VictoryPie
                                                            animate={{duration: 1000, easing: 'circle'}}
                                                            data={graphicData2} 
                                                            width={50} 
                                                            height={50} 
                                                            colorScale={graphicColor2}
                                                            innerRadius={23} 
                                                            radius={25}
                                                        />
                                                        <VictoryLabel style={{fontSize: wp(3), fontWeight: '500'}} text={p2 + '%'}   x={p2.toString().length === 3 ? 15 :  p2.toString().length === 1 ? 18 : 10} y={25} />
                                                    </Svg>
                                                </View>
                                                <View style={{flex: 1}}>
                                                    <Text style={{fontFamily: 'Maison-bold', fontSize: wp(4), color: 'grey'}}>Sugar</Text>
                                                    <Text style={{fontFamily: 'Maison-bold', fontSize: wp(3.5), color: 'black'}}>{sugar} g</Text>
                                                </View>
                                            </View>
                                        </View>
                                        
                                        
                                        
                                        <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 50}}>
                                            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                                                <View style={{flex: 1, alignItems: 'center'}}>
                                                    <Svg  width={50} height={50} >
                                                        <VictoryPie
                                                            animate={{duration: 1000, easing: 'circle'}}
                                                            data={graphicData4}
                                                            width={50}
                                                            height={50} 
                                                            colorScale={graphicColor4}
                                                            innerRadius={23} 
                                                            radius={25}
                                                        />
                                                        <VictoryLabel style={{fontSize: wp(3), fontWeight: '500'}} text={p3 + '%'}   x={p3.toString().length === 3 ? 15 :  p3.toString().length === 1 ? 18 : 10} y={25} />
                                                    </Svg>
                                                </View>
                                                
                                                <View style={{flex: 1}}>
                                                    <Text style={{fontFamily: 'Maison-bold', fontSize: wp(4), color: 'green'}}>Carbs</Text>
                                                    <Text style={{fontFamily: 'Maison-bold', fontSize: wp(3.5), color: 'black'}}>{carbs} g</Text>
                                                </View>
                                            </View>
                                            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                                                <View style={{flex: 1, alignItems: 'center'}}>
                                                    <Svg width={50} height={50}>
                                                        <VictoryPie
                                                            animate={{duration: 1000, easing: 'circle'}}
                                                            data={graphicData5} 
                                                            width={50} 
                                                            height={50} 
                                                            colorScale={graphicColor5}
                                                            innerRadius={23} 
                                                            radius={25}
                                                        />
                                                        <VictoryLabel style={{fontSize: wp(3), fontWeight: '500'}} text={p4 + '%'}   x={p4.toString().length === 3 ? 15 :  p4.toString().length === 1 ? 18 : 10} y={25} />
                                                    </Svg>
                                                </View>
                                                <View style={{flex: 1}}>
                                                    <Text style={{fontFamily: 'Maison-bold', fontSize: wp(4), color: '#8b8000'}}>Fat</Text>
                                                    <Text style={{fontFamily: 'Maison-bold', fontSize: wp(3.5), color: 'black'}}>{fat} g</Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 50, justifyContent: 'center'}}>
                                            <MaterialIcons name="local-fire-department" size={wp(4)} color="#249C86" />
                                            <Text style={{fontFamily: 'Maison-bold', fontSize: wp(4), marginLeft: 5, color: 'grey'}}>Calorie intake -</Text>
                                            <Text style={{fontFamily: 'Maison-bold', fontSize: wp(3.5), marginLeft: 5, color: 'black'}}>{calories} k cal</Text>
                                        </View>
                                    </View>
                                : null
                            }
                        </View>
                    )
                }}
            />
            </ScrollView>
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff', 
        paddingTop: 100,
    }
});