import * as AuthSession from 'expo-auth-session';

import { ActivityIndicator, Linking, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { IUser, VerificationStatus } from 'dlvrry-common';
import React, { useEffect, useState } from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import { Button } from "../../components/button";
import Constants from 'expo-constants';
import { Header } from '../../components/header';
import { IUserData } from '../../interfaces/IUserData';
import { StorageKey } from '../../enums/Storage.enum';
import { User } from "../../services/user";
import { useNavigation } from "@react-navigation/native";
import { variables } from "../../../Variables";

const styles = StyleSheet.create({
  host: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center'
  },
  primaryText: {
    color: variables.dark,
    fontWeight: '700',
    fontSize: 32
  },
  secondaryText: {
    color: variables.dark,
    fontWeight: '300',
    fontSize: 32
  },
  verifyHost: {
    flex: 1,
    paddingTop: 24,
    paddingLeft: 24,
    paddingRight: 24
  },
  verifyBox: {
    backgroundColor: variables.warning,
    padding: 12,
    borderRadius: 4
  },
  text: {
    color: variables.light,
    fontWeight: '500',
    fontSize: 18
  },
  loginLinkHost: {
    marginTop: 12
  },
  onboardHost: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export function OnboardingScreen() {
  const navigation = useNavigation();

  const [ accountNeedsVerification, setAccountNeedsVerification ] = useState(false);
  const [ loginLink, setLoginLink ] = useState(undefined);
  const [ isLoading, setIsLoading ] = useState(false);

  const getUserStatus = async (user: IUser) => {
    try {
      const loginLink = await User.getLoginLink(user.id);
      const stripeUserDetails = await User.getConnectedAccountDetails(user.id);

      setLoginLink(loginLink.data.url);

      if (!stripeUserDetails.data.requirements.disabled_reason) {
        await AsyncStorage.setItem(StorageKey.ONBOARDING_STATUS, VerificationStatus.COMPLETED);

        User.updateUser(User.storedUser.id, { verification_status: VerificationStatus.COMPLETED });

        setAccountNeedsVerification(false);

        setIsLoading(false);

        navigation.navigate('Home');
      } else {
        await AsyncStorage.setItem(StorageKey.ONBOARDING_STATUS, VerificationStatus.NEEDS_VERIFICATION);

        User.updateUser(User.storedUser.id, { verification_status: VerificationStatus.NEEDS_VERIFICATION });

        setAccountNeedsVerification(true);

        setIsLoading(false);
      }
    } catch (e) {
      alert(e);
    }
  }

  const refresh = () => {
    setIsLoading(true);
    getUserStatus(User.storedUser);
  }

  const setup = async () => {
    try {
      const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });

      if (User.storedUser && User.storedUser.verification_status === VerificationStatus.COMPLETED) {
        navigation.navigate('Home');
        return;
      }

      if (!User.storedUser || !User.storedUser.id) {
        return;
      }

      const onboardingStatus = await User.getUser(User.storedUser.id).get();

      if (onboardingStatus.data().verification_status === VerificationStatus.NEEDS_VERIFICATION) {
        setAccountNeedsVerification(true);
        getUserStatus(User.storedUser);
        setIsLoading(false);
      } else {
        const response = await User.onboardUser(
          User.storedUser.email,
          `${ Constants.manifest.extra.functionsUri }/refreshAccountLink`,
          redirectUri
        );

        await AsyncStorage.setItem(StorageKey.ONBOARDING_STATUS, VerificationStatus.PENDING);

        const result = await AuthSession.startAsync({
          authUrl: `${ response.data }?redirect_uri=${ redirectUri }`
        });

        if (result.type === 'success') {
          getUserStatus(User.storedUser);
        } else {
          await AsyncStorage.setItem(StorageKey.ONBOARDING_STATUS, VerificationStatus.CANCELLED);
        }
      }
    } catch (e) {
      alert(e);
    }
  }

  const verifyStep = () => {
    return (
      <>
        <Header main="Last step" sub="verification" />
        <View style={styles.verifyHost}>
          <View style={styles.verifyBox}>
            <Text style={styles.text}>
              Nearly done! Click the link below to provide some verification documents to make sure everyone is safe on Dlvrry
              </Text>
          </View>
          <View style={styles.loginLinkHost}>
            {
              loginLink
                ? <>
                  <Button
                    type={'secondary'}
                    onPress={() => Linking.openURL(loginLink)}
                    title="Complete onboarding" />
                  <View style={{ marginTop: 8 }}>
                    <Button
                      type={'primaryNoBorder'}
                      title="Refresh"
                      onPress={() => refresh()} />
                  </View>
                </>
                : <ActivityIndicator />
            }
          </View>
        </View>
      </>
    );
  }

  const onboardStep = () => {
    return (
      <>
        <Header main="Onboarding" sub="time" />

        <View style={styles.onboardHost}>
          <ActivityIndicator />
        </View>
      </>
    );
  }

  useEffect(() => {
    setIsLoading(true);
    setup();
  }, []);

  return (
    <SafeAreaView style={styles.host}>
      {
        isLoading
          ? <ActivityIndicator />
          : accountNeedsVerification
            ? verifyStep()
            : onboardStep()
      }
    </SafeAreaView >
  );
}
