import React from 'react';
import { RiderScreen } from '../pages/rider/Rider';
import { createStackNavigator } from '@react-navigation/stack';

const RiderStack = createStackNavigator();

export function RiderStackScreen() {
  return (
    <RiderStack.Navigator>
      <RiderStack.Screen name="Rider" options={{ headerShown: false, gestureEnabled: false }} component={RiderScreen} />
    </RiderStack.Navigator>
  );
}
