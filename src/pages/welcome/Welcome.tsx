import * as Google from 'expo-google-app-auth';

import { Button, Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';
import { IUserData } from '../../interfaces/IUserData';
import React from 'react';
import { StorageKey } from '../../enums/Storage.enum';
import { User } from '../../services/user';
import { UserRole } from '../../enums/UserRole';
import firebase from 'firebase';
import { useNavigation } from '@react-navigation/native';
import { variables } from '../../../Variables';

const styles = StyleSheet.create({
  host: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFF'
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
    width: 300
  },
  buttonContainer: {
    flex: 2,
    display: 'flex'
  },
  buttonRider: {
    borderColor: variables.primaryColor,
    borderWidth: 1,
    padding: 4,
    borderRadius: 4,
    marginBottom: 12
  },
  buttonBusiness: {
    backgroundColor: variables.primaryColor,
    borderColor: variables.primaryColor,
    borderWidth: 1,
    padding: 4,
    borderRadius: 4
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
        <Text style={styles.contentText}>The on-demand delivery service for urban and rural areas</Text>
      </View>
      <View style={styles.buttonContainer}>
        <View style={styles.buttonRider}>
          <Button
            onPress={() => navigation.navigate('SignUp')}
            title="Get started"
            color={variables.primaryColor}>
          </Button>
        </View>

        <View style={styles.buttonBusiness}>
          <Button
            onPress={() => navigation.navigate('Login')}
            title="Already have an account?"
            color={variables.light}>
          </Button>
        </View>
      </View>
    </SafeAreaView >
  );
}
