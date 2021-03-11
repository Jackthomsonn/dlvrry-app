import { Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/button';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { variables } from '../../../Variables';

const styles = StyleSheet.create({
  host: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: variables.pageBackgroundColor
  },
  header: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 12
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  contentText: {
    fontSize: 18,
    textAlign: 'center',
    width: 300,
    fontWeight: '500',
    ...variables.fontStyle
  },
  buttonContainer: {
    flex: 2,
    display: 'flex',
    width: '70%'
  }
});

export function WelcomeScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.host}>
      <View style={styles.header}>
        <Image source={require('../../../assets/icon.png')} style={styles.logo} />
      </View>
      <View style={styles.content}>
        <Text style={styles.contentText}>Welcome to Dlvrry! You can sign up as a rider or as a business below, or, if you already have an account, you can login and start working!</Text>
      </View>
      <View style={styles.buttonContainer}>
        <View>
          <Button
            showIcon={true}
            onPress={() => navigation.navigate('SignUp')}
            title="Get started"
            type={'primary'} />
        </View>

        <View style={{ marginTop: 24 }}>
          <Button
            showIcon={true}
            onPress={() => navigation.navigate('Login')}
            title="Login"
            type={'primaryNoBorder'}
            iconColor={variables.primaryColor} />
        </View>
      </View>
    </SafeAreaView >
  );
}
