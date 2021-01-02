import { LoginScreen } from '../pages/login/Login';
import React from 'react';
import { SignUpScreen } from '../pages/sign-up/SignUp';
import { WelcomeScreen } from '../pages/welcome/Welcome';
import { createStackNavigator } from '@react-navigation/stack';

const AuthStack = createStackNavigator();

export function AuthStackScreen() {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
      <AuthStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
    </AuthStack.Navigator>
  );
}
