import React, { useEffect, useState } from 'react';

import AsyncStorage from "@react-native-community/async-storage";
import { CardService } from "../../services/card";
import { IUserData } from "../../interfaces/IUserData";
import { StorageKey } from "../../enums/Storage.enum";
import { User } from "../../services/user";
import { WebView } from 'react-native-webview';
import { useNavigation } from "@react-navigation/native";

export function AddCardScreen() {
  const navigation = useNavigation();
  const [ user, setUser ] = useState(undefined);

  const setup = async () => {
    const userData = await AsyncStorage.getItem(StorageKey.USER_DATA)
    const parsedUserData: IUserData = JSON.parse(userData);

    const user = await User.getUser(parsedUserData.uid);

    setUser(user);
  }

  useEffect(() => {
    setup();
  }, [])

  return (
    <WebView
      originWhitelist={[ '*' ]}
      source={{ uri: `https://web-build-taupe.vercel.app/customerId?${ user.data().customerId }` }}
      onNavigationStateChange={async (e) => {
        if (e.url.includes('success=true')) {
          navigation.goBack();
          CardService.completed.next(true);
        }
      }}
    />
  );
}
