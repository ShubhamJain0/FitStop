import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, RefreshControl, ScrollView, SafeAreaView, Image, Button } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';


export default function Exotics({ navigation }) {
  const [exoticslist, setExoticsList] = useState([]);

  const [loading, setLoading] = useState('true');
  const [refreshing, setRefreshing] = useState(false);


  useEffect(() => {

          fetch('http://192.168.29.234:8000/store/exoticslist/',{
          method: 'GET',
          headers: {
              'Content-type': 'application/json'
          }
          })
          .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
          .then(resp => setExoticsList(resp.json))
          .then(() => setLoading('false'))
          .catch(error => console.log(error))
      
  }, [])


  const wait = timeout => {
      return new Promise(resolve => {
        setTimeout(resolve, timeout);
      });
  };


  const onRefresh = React.useCallback(() => {
      setRefreshing(true);
  
      wait(2000).then(() => setRefreshing(false))
  
      fetch('http://192.168.29.234:8000/store/exoticslist/',{
          method: 'GET',
          headers: {
          'Content-type': 'application/json'
          }
      })
      .then(resp =>  resp.json().then(data => ({status: resp.status, json: data})))
      .then(resp => setExoticsList(resp.json))
      .then(() => setLoading('false'))
      .catch(error => console.log(error))
  
      
  }, []);







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
            {exoticslist.map((item) => {
              return (
                  <View key={item.id} style={{flexDirection: 'row', marginBottom: hp(3)}}>
                      <View style={{flex: 2}}>
                          <Text style={{textAlign: 'center'}}>{item.name}</Text>
                          <Text style={{textAlign: 'center'}}>{item.description}</Text>
                          <Text style={{textAlign: 'center'}}>{item.price}</Text>
                      </View>
                      <View style={{flex: 1}}>
                          <Image source={{uri: item.image}} style={{width: 100, height: 100}} />
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