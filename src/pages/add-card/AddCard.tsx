import React, { useState } from 'react';

import { WebView } from 'react-native-webview';
import { useNavigation } from "@react-navigation/native";

export function AddCardScreen(props: any) {
  const navigation = useNavigation();
  const [ inProgress, setInProgress ] = useState(true);

  return (
    <WebView
      originWhitelist={[ '*' ]}
      source={{ uri: `https://web-build-taupe.vercel.app?customer_id=${ props.route.params.customer_id }` }}
      onNavigationStateChange={async (e) => {
        if (e.url.includes('success=true')) {
          navigation.goBack();
        } else {
          if (e.url.includes('goback=true')) {
            if (inProgress) {
              setInProgress(false);
              navigation.goBack();
            }
          }
        }
      }}
    />
  );
}
