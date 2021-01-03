import React, { useEffect } from 'react';

import { CardService } from "../../services/card";
import { WebView } from 'react-native-webview';
import { useNavigation } from "@react-navigation/native";

export function AddCardScreen(props: any) {
  const navigation = useNavigation();

  return (
    <WebView
      originWhitelist={[ '*' ]}
      source={{ uri: `https://web-build-taupe.vercel.app/?customer_id=${ props.route.params.customer_id }` }}
      onNavigationStateChange={async (e) => {
        if (e.url.includes('success=true')) {
          navigation.goBack();
          CardService.completed.next(true);
        }
      }}
    />
  );
}
