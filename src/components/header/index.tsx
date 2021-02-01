import { Linking, Text, View } from 'react-native';
import React, { createRef, useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";

import { AccountType } from 'dlvrry-common';
import ActionSheet from 'react-native-actions-sheet';
import { Button } from '../button';
import { Ionicons } from '@expo/vector-icons';
import { Loader } from '../loader';
import { User } from '../../services/user';
import firebase from 'firebase';
import { useNavigation } from '@react-navigation/native';
import { variables } from '../../../Variables';

interface HeaderProps {
  main: string,
  sub: string,
  showBackButton?: boolean
}

export const Header = (props: HeaderProps) => {
  const [ cards, setCards ] = useState(undefined);
  const [ isLoading, setIsLoading ] = useState(false);
  const [ isLoggingOut, setIsLoggingOut ] = useState(false);
  const [ isGettingCards, setIsGettingCards ] = useState(false);
  const actionSheetRef: any = createRef();
  const navigation = useNavigation();

  const riderActionSheet = () => {
    return (
      <>
        <Text style={{ fontSize: 24, marginTop: 24 }}>Dashboard</Text>
        <View style={{ marginTop: 8 }}>
          <Button type="primary" title="Go to my dashboard" onPress={() => { goToDashboard() }} loading={isLoading} />
        </View>
      </>
    )
  }

  const businessActionSheet = () => {
    return (
      <View>
        <Text style={{ fontSize: 24, marginTop: 24 }}>Cards</Text>
        {
          isGettingCards
            ? <Loader />
            : cards?.length === 0
              ? <>
                <Text style={{ marginTop: 8 }}>You have no available cards</Text>
                <View style={{ marginTop: 8 }}>
                  <Button type="primary" title="Add card" onPress={() => { setupCard() }} />
                </View>
              </>
              : <>
                {
                  cards?.length
                    ? <Text style={{ marginTop: 8 }}>You have {cards.length} card available ending in {cards[ 0 ]}</Text>
                    : <Text>No cards available</Text>
                }
                <View style={{ marginTop: 8 }}>
                  <Button type="primary" title="Remove card" onPress={() => { setupCard(); }} />
                </View>
              </>
        }
      </View>
    )
  }

  const genericActionSheet = () => {
    return (
      <>
        <Text style={{ fontSize: 24 }}>Account settings</Text>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ marginTop: 8 }} onPress={() => logout()}>
          {isLoggingOut ? <Loader /> : <Text style={{ marginBottom: 8, fontSize: 18 }}>Log out</Text>}
        </TouchableOpacity>
      </>
    )
  }

  const goToDashboard = async () => {
    setIsLoading(true);

    const loginLink = await User.getLoginLink(User.storedUser.id);

    setIsLoading(false);
    Linking.openURL(loginLink.data.url);
  }

  const logout = async () => {
    setIsLoggingOut(true);
    firebase.auth().signOut();
  }

  const getCards = async () => {
    setIsGettingCards(true);

    if (!User.storedUser || !User.storedUser.customer_id) {
      setIsGettingCards(false);

      return;
    }

    const response = await User.getCards(User.storedUser.customer_id);

    setCards(response);

    setIsGettingCards(false);
  }

  const setupCard = async () => {
    if (!User.storedUser || !User.storedUser.customer_id) {
      return;
    }

    actionSheetRef.current?.hide();

    navigation.navigate('AddCard', { customer_id: User.storedUser.customer_id });
  }

  const goBack = () => {
    navigation.goBack();
  }

  const showActionSheet = () => {
    getCards();

    actionSheetRef.current?.show();
  }

  return (
    <>
      <View style={{ paddingTop: 24, paddingLeft: 24, paddingRight: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        {
          props.showBackButton
            ? <View style={{ flexDirection: 'row', flex: 1 }}>
              <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={() => goBack()}>
                <Ionicons name="md-arrow-back" size={22} color={variables.dark} />
              </TouchableOpacity>
            </View>
            : undefined
        }
        <View style={{ flexDirection: 'row', flex: 5 }}>
          <Text style={{ color: variables.dark, fontWeight: '700', fontSize: 32 }}>{props.main}</Text>
          <Text style={{ color: variables.dark, fontWeight: '300', fontSize: 32 }}> {props.sub}</Text>
        </View>
        {
          User.storedUser
            ? <View style={{ flexDirection: 'row', backgroundColor: variables.primaryColor, width: 50, height: 50, borderRadius: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <TouchableOpacity
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={() => showActionSheet()}
              ><Ionicons name="md-person" size={22} color={variables.light} />
              </TouchableOpacity>
            </View>
            : undefined
        }
      </View>

      <ActionSheet ref={actionSheetRef} headerAlwaysVisible={true} bounceOnOpen={true} gestureEnabled={true} closable={true}>
        <ScrollView style={{ padding: 24, height: 500 }}>
          <View style={{ padding: 12 }}>
            {genericActionSheet()}

            {
              User.storedUser && User.storedUser.account_type === AccountType.RIDER ? riderActionSheet() : businessActionSheet()
            }
          </View>
        </ScrollView>
      </ActionSheet>
    </>
  )
}
