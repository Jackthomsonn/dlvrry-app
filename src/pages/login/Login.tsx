import * as Google from 'expo-google-app-auth';

import { Button, Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';
import { IUserData } from '../../interfaces/IUserData';
import React from 'react';
import { Role } from '../../../../dlvrry-backend/functions/src/enums/role';
import { StorageKey } from '../../enums/Storage.enum';
import { User } from '../../services/user';
import { UserRole } from '../../enums/UserRole';
import firebase from 'firebase';
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

export function LoginScreen() {
  const signInAsync = async (role: UserRole) => {
    try {
      const { type, accessToken, idToken }: any = await Google.logInAsync({
        iosClientId: '787206689882-mhnl71sjdfbg46qvhrfbq90m505n2ht4.apps.googleusercontent.com',
        iosStandaloneAppClientId: '787206689882-ep4vpt932ucl9nsacevb8ob9bostb4rj.apps.googleusercontent.com'
      });

      if (type === 'success') {
        const credential = firebase.auth.GoogleAuthProvider.credential(idToken, accessToken);

        const user = await firebase.auth().signInWithCredential(credential);

        await AsyncStorage.setItem(StorageKey.USER_DATA, JSON.stringify(constructUserObject(user)));

        await User.updateUser(user.user.uid, { role });
      }
    } catch (error) {
      return error;
    }
  }

  const constructUserObject = ({ user: { email, emailVerified, displayName, uid, photoURL } }): IUserData => {
    return { displayName, uid, email, photoURL, emailVerified };
  }

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
            onPress={() => signInAsync(UserRole.RIDER)}
            title="Get started as a rider"
            color={variables.primaryColor}>
          </Button>
        </View>

        <View style={styles.buttonBusiness}>
          <Button
            onPress={() => signInAsync(UserRole.BUSINESS)}
            title="Get started as a business"
            color={variables.light}>
          </Button>
        </View>
      </View>
    </SafeAreaView >
  );
}
