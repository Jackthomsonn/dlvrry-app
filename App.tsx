import 'react-native-gesture-handler';
import 'firebase/functions';
import "firebase/firestore";

import React, { useState } from 'react';
import { decode, encode } from 'base-64';

import AsyncStorage from '@react-native-community/async-storage';
import { AuthStackScreen } from './src/navigation/AuthStackNavigation';
import Constants from 'expo-constants';
import { HomeStackScreen } from './src/navigation/HomeStackNavigation';
import { NavigationContainer } from '@react-navigation/native';
import { RiderScreen } from './src/pages/rider/Rider';
import { SplashScreen } from './src/pages/splash/Splash';
import { User } from './src/services/user';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import firebase from 'firebase';

if (!global[ 'btoa' ]) { global[ 'btoa' ] = encode }

if (!global[ 'atob' ]) { global[ 'atob' ] = decode }

const Tab = createBottomTabNavigator();

// AsyncStorage.clear();
// firebase.auth().signOut();
// User.storedUser = undefined

export default function App() {
  const [ isLoggedIn, setLoggedInState ] = useState(false);
  const [ isLoading, setIsLoadingState ] = useState(true);
  const [ activeUser, setActiveUser ] = useState(undefined);

  User.requestAndSetStoredUser();

  if (firebase.apps.length === 0) {
    const fi = firebase.initializeApp({
      apiKey: Constants.manifest.extra.apiKey,
      authDomain: Constants.manifest.extra.authDomain,
      databaseURL: Constants.manifest.extra.databaseURL,
      projectId: Constants.manifest.extra.projectId,
      storageBucket: Constants.manifest.extra.storageBucket,
      messagingSenderId: Constants.manifest.extra.messagingSenderId,
      appId: Constants.manifest.extra.appId,
      measurementId: Constants.manifest.extra.measurementId,
    });

    if (Constants.manifest.extra.useEmulator) {
      fi.auth().useEmulator(Constants.manifest.extra.authUri);
      fi.firestore().settings({
        host: Constants.manifest.extra.firestoreHost,
        ssl: true
      })
    }
  }

  firebase.auth().onAuthStateChanged(async user => {
    setActiveUser(user);

    if (user && User.storedUser && User.storedUser.id) {
      setLoggedInState(user !== null);
      setIsLoadingState(false);
    } else {
      setIsLoadingState(false);
    }
  });

  User.authenticated.subscribe(async (isAuthenticated: boolean) => {
    if (!isAuthenticated) {
      setIsLoadingState(false);
      setLoggedInState(false);

      return;
    }

    if (!User.storedUser) {
      try {
        await User.setupStoredUser(activeUser);
        setIsLoadingState(false);
        setLoggedInState(true);
      } catch (e) {
        return e;
      }
    } else {
      setLoggedInState(true);
    }
  });

  return (
    <NavigationContainer>
      <Tab.Navigator tabBarOptions={{ showLabel: false }} screenOptions={{ tabBarVisible: isLoggedIn }}>
        {
          isLoading ? (
            <Tab.Screen name="Splash" component={SplashScreen} />
          ) : isLoggedIn ? (
            <React.Fragment>
              <Tab.Screen name="Home" component={HomeStackScreen} options={{
                tabBarVisible: false,
              }} />
              <Tab.Screen name="Rider" component={RiderScreen} options={{
                tabBarVisible: false,
              }} />
            </React.Fragment>
          ) : (<Tab.Screen name="Login" component={AuthStackScreen} />)
        }
      </Tab.Navigator>
    </NavigationContainer>
  );
}
