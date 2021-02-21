import React, { useState } from 'react';

import { CardService } from '../../services/card';
import { WebView } from 'react-native-webview';
import { useNavigation } from "@react-navigation/native";

export function AuthenticatePaymentScreen(props: any) {
  const navigation = useNavigation();
  const [ inProgress, setInProgress ] = useState(true);

  return (
    <WebView
      originWhitelist={[ '*' ]}
      source={{ uri: `https://payment.dlvrry.io?&client_secret=${ props.route.params.client_secret }&payment_method_id=${ props.route.params.payment_method_id }` }}
      onNavigationStateChange={async (e) => {
        if (e.url.includes('success=true')) {
          CardService.authenticationCompleted.next({ completed: true });
          navigation.goBack();
        } else {
          if (e.url.includes('goback=true')) {
            CardService.authenticationCompleted.next({
              completed: false,
              message: 'Something went wrong. Please make sure the card you have on file is up to date and can accept payments'
            });

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
