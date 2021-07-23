import 'react-native-gesture-handler';
import 'firebase/functions';
import "firebase/firestore";

import React, { useEffect, useState } from 'react';
import { decode, encode } from 'base-64';
import * as Location from 'expo-location';
import { AuthStackScreen } from './src/navigation/AuthStackNavigation';
import Constants from 'expo-constants';
import { HomeStackScreen } from './src/navigation/HomeStackNavigation';
import { NavigationContainer } from '@react-navigation/native';
import { RiderScreen } from './src/pages/rider/Rider';
import { SplashScreen } from './src/pages/splash/Splash';
import { User } from './src/services/user';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import firebase from 'firebase';

import * as Notifications from 'expo-notifications';
import { Text, View } from 'react-native';
import SuspendedSvg from './src/components/svg/suspended';
import { variables } from './Variables';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

if (!global['btoa']) { global['btoa'] = encode }

if (!global['atob']) { global['atob'] = decode }

const Tab = createBottomTabNavigator();

export default function App() {
  const [isLoggedIn, setLoggedInState] = useState(false);
  const [isLoading, setIsLoadingState] = useState(true);
  const [allowsLocation, setAllowsLocation] = useState(true)

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
    if (user) {
      User.storedUserId = user.uid;
      const userData: any = await User.getUser(user.uid).get();
      User.storedUser = userData.data();
      setIsLoadingState(false);
      setLoggedInState(true);
    }

    if (!user) {
      setIsLoadingState(false);
      setLoggedInState(false);
      User.tearDownUserData();
    }
  });

  User.authenticated.subscribe(async (user: firebase.User) => {
    if (user) {
      setLoggedInState(true);
      setIsLoadingState(false);
    }
  });

  useEffect(() => {
    Location.getForegroundPermissionsAsync().then(async (location_status) => {
      if (!location_status.granted) {
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          setAllowsLocation(false);
        } else {
          setAllowsLocation(true);
        }
      } else {
        setAllowsLocation(true);
      }
    })
  }, []);

  return (
    <NavigationContainer>
      {
        allowsLocation
          ? <Tab.Navigator tabBarOptions={{ showLabel: false }} screenOptions={{ tabBarVisible: isLoggedIn }}>
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
          : <>
            <View style={{ margin: 24, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <SuspendedSvg width={180} height={180} />
              <Text style={{ fontWeight: '500', color: variables.secondaryColor, fontSize: 16, ...variables.fontStyle, marginTop: 12, textAlign: 'center' }}>
                You must allow location tracking to use Dlvrry. We use your location data to show jobs near you as a rider & as a business to find addresses for your customers' deliveries
              </Text>
            </View>
          </>
      }

    </NavigationContainer>
  );
}
