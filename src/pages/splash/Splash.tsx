import { ActivityIndicator, View } from 'react-native';

import React from 'react';
import { variables } from '../../../Variables';

export function SplashScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: variables.light }}>
      <ActivityIndicator />
    </View >
  );
}
