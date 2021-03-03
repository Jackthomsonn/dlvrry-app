import { Linking, Text, View } from 'react-native';
import React, { createRef, useState } from 'react';
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";

import { AccountType } from 'dlvrry-common';
import ActionSheet from 'react-native-actions-sheet';
import AmexSvg from '../svg/amex';
import { Button } from '../button';
import GenericSvg from '../svg/generic';
import { Ionicons } from '@expo/vector-icons';
import { Loader } from '../loader';
import MastercardSvg from '../svg/mastercard';
import Stripe from 'stripe';
import { User } from '../../services/user';
import VisaSvg from '../svg/visa';
import firebase from 'firebase';
import { useNavigation } from '@react-navigation/native';
import { variables } from '../../../Variables';

interface HeaderProps {
  main: string,
  sub: string,
  showBackButton?: boolean,
  hideAvatar?: boolean,
  subheader?: boolean
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
        <Text style={{ fontSize: 24, ...variables.fontStyle, marginTop: 24, lineHeight: 24 }}>Dashboard</Text>
        <View style={{ marginTop: 8 }}>
          <Button showIcon={true} type="primary" title="Go to my dashboard" onPress={() => { goToDashboard() }} loading={isLoading} />
        </View>
      </>
    )
  }

  const getCardBrandImage = (card: Stripe.Card) => {
    switch (card.brand) {
      case 'amex':
        return <AmexSvg width={30} height={30} />;
      case 'mastercard':
        return <MastercardSvg width={30} height={30} />;
      case 'visa':
        return <VisaSvg width={30} height={30} />;
      default:
        return <GenericSvg width={30} height={30} />;
    }
  }

  const businessActionSheet = () => {
    return (
      <View style={{ height: 700 }}>
        <Text style={{ fontSize: 24, ...variables.fontStyle, marginTop: 24, lineHeight: 24 }}>Cards</Text>
        {
          isGettingCards
            ? <Loader />
            : cards?.length === 0
              ? <>
                <Text style={{ marginTop: 8 }}>You have no available cards</Text>
                <View style={{ marginTop: 8 }}>
                  <Button showIcon={true} type="primary" title="Add card" onPress={() => { setupCard() }} />
                </View>
              </>
              : <>
                {
                  cards?.length
                    ? <>
                      {
                        cards.map(card => {
                          return (
                            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, marginBottom: 12, backgroundColor: variables.tertiaryColor, padding: 16, borderRadius: 4 }}>
                              <View style={{ flex: 2 }}>{getCardBrandImage(card)}</View>
                              <Text style={{ flex: 5, ...variables.fontStyle, fontWeight: '600' }} >************{card.last4}</Text>
                              <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', flex: 3 }}>
                                {
                                  card.is_default_payment_method
                                    ? <TouchableOpacity style={{ backgroundColor: 'rgba(230,52,98, 0.2)', padding: 4, borderRadius: 4 }}>
                                      <Text style={{ ...variables.fontStyle, color: variables.primaryColor }}>Default</Text>
                                    </TouchableOpacity>
                                    : <TouchableOpacity hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}>
                                      <Ionicons name="ios-link" size={18} color={variables.secondaryColor} />
                                    </TouchableOpacity>
                                }

                                <TouchableOpacity style={{ marginLeft: 16 }} hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}>
                                  <Ionicons name="ios-trash" size={18} color={variables.secondaryColor} />
                                </TouchableOpacity>
                              </View>
                            </View>
                          )
                        })}
                    </>
                    : <Text>No cards available</Text>
                }
              </>
        }
      </View>
    )
  }

  const genericActionSheet = () => {
    return (
      <>
        <Text style={{ fontSize: 24, ...variables.fontStyle, }}>Account settings</Text>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ marginTop: 8 }} onPress={() => logout()}>
          {isLoggingOut ? <Loader /> : <Text style={{ marginBottom: 8, fontSize: 18, ...variables.fontStyle }}>Log out</Text>}
        </TouchableOpacity>
      </>
    )
  }

  const goToDashboard = async () => {
    setIsLoading(true);

    const loginLink = await User.getLoginLink(User.storedUserId);

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

    setCards(response.data);

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
      <View style={{ paddingTop: 24, paddingLeft: props.hideAvatar ? 0 : 24, paddingRight: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        {
          props.showBackButton
            ? <View style={{ flexDirection: 'row', flex: 1 }}>
              <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={() => goBack()}>
                <Ionicons name="md-arrow-back" size={22} color={variables.secondaryColor} />
              </TouchableOpacity>
            </View>
            : undefined
        }
        <View style={{ flexDirection: 'row', flex: 5 }}>
          <Text style={{ color: variables.secondaryColor, fontWeight: props.subheader ? '500' : '700', fontSize: props.subheader ? 22 : 32, ...variables.fontStyle, lineHeight: 32, }}>{props.main}</Text>
          <Text style={{ color: variables.secondaryColor, fontWeight: '300', fontSize: props.subheader ? 22 : 32, ...variables.fontStyle, lineHeight: 32, }}> {props.sub}</Text>
        </View>
        {
          User.storedUser && !props.hideAvatar
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
        <ScrollView style={{ padding: 24, height: 700 }} showsVerticalScrollIndicator={false}>
          <View style={{ padding: 12 }}>
            {
              genericActionSheet()
            }

            {
              User.storedUser?.account_type === AccountType.RIDER ? riderActionSheet() : businessActionSheet()
            }
          </View>
        </ScrollView>
      </ActionSheet>
    </>
  )
}
