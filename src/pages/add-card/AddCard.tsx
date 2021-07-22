import React, { useEffect, useState } from 'react';

import { WebView } from 'react-native-webview';
import { useNavigation } from "@react-navigation/native";
import Constants from 'expo-constants';
import firebase from 'firebase';
import { Loader } from '../../components/loader';

export function AddCardScreen(props: any) {
  const navigation = useNavigation();
  const [inProgress, setInProgress] = useState(true);
  const [token, setToken] = useState(undefined);

  const url = Constants.manifest.extra.useEmulator
    ? 'https://dlvrry-payment-hgwx8lxfr-jackthomson.vercel.app'
    : 'https://payment.dlvrry.io'

  const getToken = async () => {
    const token = await firebase.auth().currentUser.getIdToken();

    setToken(token);
  }

  useEffect(() => {
    getToken();
  }, [])

  return (

    token
      ? <WebView
        originWhitelist={['*']}
        source={{ uri: `${url}?customer_id=${props.route.params.customer_id}?${token}` }
        }
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
        }
        }
      />
      : <Loader />
  );
}
