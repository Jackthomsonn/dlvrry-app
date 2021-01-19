import React, { useEffect, useState } from 'react';

import { AddCardScreen } from '../pages/add-card/AddCard';
import AsyncStorage from '@react-native-community/async-storage';
import { CreateJobScreen } from '../pages/create-job/CreateJob';
import { HomeScreen } from '../pages/home/Home';
import { OnboardingScreen } from '../pages/onboarding/Onboarding';
import { StorageKey } from '../enums/Storage.enum';
import { VerificationStatus } from 'dlvrry-common';
import { createStackNavigator } from '@react-navigation/stack';

const HomeStack = createStackNavigator();

export function HomeStackScreen() {
  const [ onboardingStatus, setOnboardingStatus ] = useState(undefined);

  const setup = async () => {
    const status = await AsyncStorage.getItem(StorageKey.ONBOARDING_STATUS);
    setOnboardingStatus(status);
  }

  useEffect(() => {
    setup();
  });

  const accountIsVerified = () => {
    return (
      <HomeStack.Navigator>
        <HomeStack.Screen name="Home" component={HomeScreen} options={{ headerShown: false, gestureEnabled: false }} />
        <HomeStack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false, gestureEnabled: false }} />
        <HomeStack.Screen name="AddCard" component={AddCardScreen} options={{ headerShown: false, gestureEnabled: false }} />
        <HomeStack.Screen name="CreateJob" component={CreateJobScreen} options={{ headerShown: false, gestureEnabled: false }} />
      </HomeStack.Navigator>
    )
  }

  const accountIsNotVerified = () => {
    return (
      <HomeStack.Navigator>
        <HomeStack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false, gestureEnabled: false }} />
        <HomeStack.Screen name="Home" component={HomeScreen} options={{ headerShown: false, gestureEnabled: false }} />
        <HomeStack.Screen name="AddCard" component={AddCardScreen} options={{ headerShown: false, gestureEnabled: false }} />
        <HomeStack.Screen name="CreateJob" component={CreateJobScreen} options={{ headerShown: false, gestureEnabled: false }} />
      </HomeStack.Navigator>
    )
  }

  useEffect(() => { })

  return (
    onboardingStatus === VerificationStatus.COMPLETED
      ? accountIsVerified()
      : accountIsNotVerified()
  );
}
