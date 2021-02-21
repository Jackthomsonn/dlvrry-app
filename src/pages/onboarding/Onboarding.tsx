import * as AuthSession from 'expo-auth-session';

import { ActivityIndicator, Linking, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { IUser, VerificationStatus } from 'dlvrry-common';
import React, { useEffect, useState } from 'react';

import { Button } from "../../components/button";
import Constants from 'expo-constants';
import { Header } from '../../components/header';
import { User } from "../../services/user";
import { useDocumentData } from 'react-firebase-hooks/firestore';
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

  const [ accountHasPendingActions, setAccountHasPendingActions ] = useState(false);
  const [ checkingForPendingAccountActions, setCheckingForPendingAccountActions ] = useState(false);
  const [ loginLink, setLoginLink ] = useState(undefined);
  const [ onboardingActionIsInProcess, setOnboardingActionIsInProcess ] = useState(false);

  const [ user ] = useDocumentData<IUser>(User.getUser(User.storedUserId));

  const startOnboardingProcess = async () => {
    if (onboardingActionIsInProcess) return;

    const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });

    const response = await User.onboardUser(
      user?.id,
      user.email,
      `${ Constants.manifest.extra.functionsUri }/refreshAccountLink`,
      redirectUri
    );

    const result = await AuthSession.startAsync({
      authUrl: `${ response.data }?redirect_uri=${ redirectUri }`
    });

    // Handle these cases correctly
    if (result.type === 'success') {
      setOnboardingActionIsInProcess(false);
    }

    if (result.type === 'error' || result.type === 'cancel') {
      alert('Something went wrong');
      setOnboardingActionIsInProcess(false);
    }
  }

  const handleUserVerificationStatus = async () => {
    switch (user?.verification_status) {
      case VerificationStatus.PENDING_VERIFICATION:
        setCheckingForPendingAccountActions(true);

        break;
      case VerificationStatus.PAST_DUE:
        const loginLink = await User.getLoginLink(user?.id);

        setCheckingForPendingAccountActions(false);
        setAccountHasPendingActions(true);
        setLoginLink(loginLink.data.url);

        break;
      case VerificationStatus.PENDING || VerificationStatus.CANCELLED || VerificationStatus.FAILED:
        setOnboardingActionIsInProcess(true);
        startOnboardingProcess();

        break;
      case VerificationStatus.COMPLETED:
        navigation.navigate('Home');
        break;
    }
  }

  const verifyStep = () => {
    return (
      <>
        <Header main="Last step" sub="verification" />
        <View style={styles.verifyHost}>
          <View style={styles.verifyBox}>
            <Text style={styles.text}>
              It looks like you have some outstanding actions on your account. In order to continue using Dlvrry please click the link below
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
          <Text>Loading..</Text>
        </View>
      </>
    );
  }

  useEffect(() => {
    handleUserVerificationStatus();
  }, [ user ]);

  return (
    <SafeAreaView style={styles.host}>
      {
        checkingForPendingAccountActions
          ? <>
            <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator />
              <Text>Verifying information..</Text>
            </View>
          </>
          : accountHasPendingActions
            ? verifyStep()
            : onboardStep()
      }
    </SafeAreaView >
  );
}
