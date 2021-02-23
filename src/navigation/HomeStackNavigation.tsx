import { IUser, VerificationStatus } from 'dlvrry-common';

import { ActivityIndicator } from 'react-native';
import { AddCardScreen } from '../pages/add-card/AddCard';
import { AuthenticatePaymentScreen } from '../pages/authenticate-payment/AuthenticatePayment';
import { CreateJobScreen } from '../pages/create-job/CreateJob';
import { HomeScreen } from '../pages/home/Home';
import { OnboardingScreen } from '../pages/onboarding/Onboarding';
import React from 'react';
import { User } from '../services/user';
import { createStackNavigator } from '@react-navigation/stack';
import { useDocumentData } from 'react-firebase-hooks/firestore';

const HomeStack = createStackNavigator();

export function HomeStackScreen() {
  const [ user, userLoading ] = useDocumentData<IUser>(User.getUser(User.storedUserId));

  const accountIsVerified = () => {
    return (
      <HomeStack.Navigator>
        <HomeStack.Screen name="Home" component={HomeScreen} options={{ headerShown: false, gestureEnabled: false }} />
        <HomeStack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false, gestureEnabled: false }} />
        <HomeStack.Screen name="AddCard" component={AddCardScreen} options={{ headerShown: false, gestureEnabled: false }} />
        <HomeStack.Screen name="AuthenticatePayment" component={AuthenticatePaymentScreen} options={{ headerShown: false, gestureEnabled: false }} />
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

  return (
    userLoading || !user
      ? <ActivityIndicator />
      : user.verification_status === VerificationStatus.COMPLETED
        ? accountIsVerified()
        : accountIsNotVerified()
  );
}
