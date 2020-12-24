import { DriverScreen } from '../pages/driver/Driver';
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

const DriverStack = createStackNavigator();

export function DriverStackScreen() {
  return (
    <DriverStack.Navigator>
      <DriverStack.Screen name="Driver" options={{ headerShown: false }} component={DriverScreen} />
    </DriverStack.Navigator>
  );
}
