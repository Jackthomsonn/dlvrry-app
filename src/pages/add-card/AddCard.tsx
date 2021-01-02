import React, { useEffect, useState } from 'react';
import { Route, useNavigation } from "@react-navigation/native";

import AsyncStorage from "@react-native-community/async-storage";
import { CardService } from "../../services/card";
import { IUserData } from '../../interfaces/IUserData';
import { StorageKey } from "../../enums/Storage.enum";
import { User } from "../../services/user";
import { WebView } from 'react-native-webview';

export function AddCardScreen(props: any) {
  const navigation = useNavigation();
  const [ user, setUser ] = useState(undefined);

  const setup = async () => {
  }

  useEffect(() => {
    setup();
  }, [])

  return (
    <WebView
      originWhitelist={[ '*' ]}
      source={{ uri: `https://web-build-taupe.vercel.app/?customer_id=${ props.route.params.customer_id }` }}
      onNavigationStateChange={async (e) => {
        console.log(e);
        if (e.url.includes('success=true')) {
          navigation.goBack();
          CardService.completed.next(true);
        }
      }}
    />
  );
}
