import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Button } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';


export default function Profile({ navigation }) {
    return (
      <View style={styles.container}>
        <Text>Profile Screen</Text>
        <StatusBar style="auto" />
      </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
});