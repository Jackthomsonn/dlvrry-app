import { Route, useNavigation } from "@react-navigation/native";

import { PaymentService } from '../../services/payment';
import React from 'react';
import { WebView } from 'react-native-webview';

export function PaymentScreen(props: any) {
  const navigation = useNavigation();

  return (
    <WebView
      originWhitelist={[ '*' ]}
      source={{ uri: `https://web-build-taupe.vercel.app/?amount=${ props.route.params.cost }` }}
      onNavigationStateChange={async (e) => {
        if (e.url.includes('success=true')) {
          navigation.goBack();
          PaymentService.completed.next(true);
        }
      }}
    />
  );
}
