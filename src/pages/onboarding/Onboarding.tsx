import * as AuthSession from 'expo-auth-session';

import { ActivityIndicator, Linking, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import { Button } from "../../components/button";
import Constants from 'expo-constants';
import { IUserData } from '../../interfaces/IUserData';
import { OnboardingStatus } from '../../enums/Onboarding';
import { StorageKey } from '../../enums/Storage.enum';
import { User } from "../../services/user";
import { useNavigation } from "@react-navigation/native";
import { variables } from "../../../Variables";

const styles = StyleSheet.create({
  mainHost: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center'
  },
  header: {
    paddingTop: 24,
    paddingLeft: 24,
    paddingRight: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  row: {
    flexDirection: 'row'
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
  const [ user, setUser ] = useState(undefined);
  const [ isLoading, setIsLoading ] = useState(false);

  const getUserStatus = async (user: { uid: string }) => {
    const loginLink = await User.getLoginLink(user.uid);
    const userData = await AsyncStorage.getItem(StorageKey.USER_DATA);
    const parsedUser: IUserData = JSON.parse(userData);
    const stripeUserDetails = await User.getConnectedAccountDetails(parsedUser.uid);

    setLoginLink(loginLink.url);

    if (!stripeUserDetails.requirements.disabled_reason) {
      await AsyncStorage.setItem(StorageKey.ONBOARDING_STATUS, OnboardingStatus.COMPLETE);
      User.updateUser(parsedUser.uid, { verification_status: OnboardingStatus.COMPLETE });
      setAccountNeedsVerification(false);
      setIsLoading(false);
      navigation.navigate('Home');
    } else {
      await AsyncStorage.setItem(StorageKey.ONBOARDING_STATUS, OnboardingStatus.NEEDS_VERIFICATION);
      User.updateUser(parsedUser.uid, { verification_status: OnboardingStatus.NEEDS_VERIFICATION });
      setAccountNeedsVerification(true);
      setIsLoading(false);
    }
  }

  const refresh = () => {
    setIsLoading(true);
    getUserStatus(user);
  }

  const setup = async () => {
    const userData = await AsyncStorage.getItem(StorageKey.USER_DATA);
    const parsedUserData: IUserData = JSON.parse(userData);
    const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
    const response = await User.getUser(parsedUserData.uid);

    if (response.data() && response.data().verification_status === OnboardingStatus.COMPLETE) {
      navigation.navigate('Home');
      return;
    }

    setUser(parsedUserData);

    const onboardingStatus = await AsyncStorage.getItem(StorageKey.ONBOARDING_STATUS);

    if (onboardingStatus === OnboardingStatus.NEEDS_VERIFICATION) {
      setAccountNeedsVerification(true);
      getUserStatus(parsedUserData);
      setIsLoading(false);
    } else {
      const response = await User.onboardUser(
        parsedUserData,
        `${ Constants.manifest.extra.functionsUri }/refreshAccountLink`,
        redirectUri
      );

      await AsyncStorage.setItem(StorageKey.ONBOARDING_STATUS, OnboardingStatus.IN_PROGRESS);

      const result = await AuthSession.startAsync({
        authUrl: `${ response }?redirect_uri=${ redirectUri }`
      });

      if (result.type === 'success') {
        getUserStatus(parsedUserData);
      } else {
        await AsyncStorage.setItem(StorageKey.ONBOARDING_STATUS, OnboardingStatus.CANCELLED);
      }
    }
  }

  const verifyStep = () => {
    return (
      <>
        <View style={styles.header}>
          <View style={styles.row}>
            <Text style={styles.primaryText}>Last step</Text>
            <Text style={styles.secondaryText}> verification</Text>
          </View>
        </View>
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
        <View style={styles.header}>
          <View style={styles.row}>
            <Text style={styles.primaryText}>Onboarding</Text>
            <Text style={styles.secondaryText}> time</Text>
          </View>
        </View>

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
    <SafeAreaView style={styles.mainHost}>
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
