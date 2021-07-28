import ActionSheet from 'react-native-actions-sheet';
import { Linking, Text, View } from 'react-native';
import React, { useRef, useState } from 'react';
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";

import { AccountType } from 'dlvrry-common';
import AmexSvg from '../svg/amex';
import { Button } from '../button';
import GenericSvg from '../svg/generic';
import { Ionicons } from '@expo/vector-icons';
import { Loader } from '../loader';
import MastercardSvg from '../svg/mastercard';
import { Payment } from '../../services/payment';
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
  const [paymentMethods, setPaymentMethods] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingCards, setIsGettingCards] = useState(false);

  const actionSheetRef: React.MutableRefObject<any> = useRef();
  const scrollViewRef: React.MutableRefObject<any> = useRef();
  const navigation = useNavigation();

  const onClose = () => {
    scrollViewRef.current?.setNativeProps({
      scrollEnabled: false,
    });
  };

  const onOpen = () => {
    scrollViewRef.current?.setNativeProps({
      scrollEnabled: false,
    });
  };

  const riderActionSheet = () => {
    return (
      <>
        <View style={{ paddingBottom: 200 }}>
          <Text style={{ fontSize: 24, ...variables.fontStyle, marginTop: 24, lineHeight: 24 }}>Dashboard</Text>
          <View style={{ marginTop: 8 }}>
            <Button showIcon={true} type="primary" title="Go to my dashboard" onPress={() => { goToDashboard() }} loading={isLoading} />
          </View>
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

  const removePaymentMethod = async (payment_method_id: string) => {
    try {
      await Payment.removePaymentMethod(payment_method_id);
      await getCards();
    } catch (e) {
      alert(e);
    }
  }

  const businessActionSheet = () => {
    return (
      <View style={{ paddingBottom: 48 }}>
        <View style={{ backgroundColor: variables.tertiaryColor, height: 1, marginTop: 8 }}></View>
        <Text style={{ fontSize: 24, ...variables.fontStyle, marginTop: 24, lineHeight: 24 }}>Cards</Text>
        {
          isGettingCards
            ? <Loader />
            : paymentMethods?.length === 0
              ? <>
                <Text style={{ marginTop: 8 }}>You have no available cards</Text>
                <View style={{ marginTop: 8 }}>
                  <Button showIcon={true} type="primary" title="Add card" onPress={() => { setupCard() }} />
                </View>
              </>
              : <>
                {
                  paymentMethods?.length
                    ? <>
                      {
                        paymentMethods.map((payment_method, index) => {
                          return (
                            <View key={index} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, marginBottom: 12, backgroundColor: variables.tertiaryColor, padding: 16, borderRadius: 4 }}>
                              <View style={{ flex: 2 }}>{getCardBrandImage(payment_method)}</View>
                              <Text style={{ flex: 5, ...variables.fontStyle, fontWeight: '600' }} >************{payment_method.last4}</Text>
                              <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', flex: 4 }}>
                                {
                                  payment_method.is_default_payment_method
                                    ? <TouchableOpacity style={{ backgroundColor: 'rgba(61, 220, 151, 0.2)', padding: 4, borderRadius: 4 }}>
                                      <Text style={{ ...variables.fontStyle, fontWeight: '500', color: variables.success }}>Default</Text>
                                    </TouchableOpacity>
                                    : <TouchableOpacity style={{ backgroundColor: 'rgba(63, 48, 71, 0.1)', padding: 4, borderRadius: 4 }}>
                                      <Text style={{ ...variables.fontStyle, fontWeight: '500', color: variables.secondaryColor }}>Set default</Text>
                                    </TouchableOpacity>
                                }

                                <TouchableOpacity style={{ marginLeft: 16 }} hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }} onPress={() => removePaymentMethod(payment_method.id)}>
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
        <Text style={{ fontSize: 24, ...variables.fontStyle }}>Account settings</Text>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ marginTop: 8 }} onPress={() => logout()}>
          <Text style={{ marginBottom: 8, fontSize: 18, ...variables.fontStyle }}>Log out</Text>
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
    firebase.auth().signOut();
  }

  const getCards = async () => {
    setIsGettingCards(true);

    if (!User.storedUser || !User.storedUser.customer_id) {
      setIsGettingCards(false);

      return;
    }

    const response = await User.getCards(User.storedUser.customer_id);

    setPaymentMethods(response.data);

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

      <ActionSheet
        initialOffsetFromBottom={0.6}
        ref={actionSheetRef}
        onOpen={onOpen}
        statusBarTranslucent
        bounceOnOpen={true}
        bounciness={4}
        gestureEnabled={true}
        onClose={onClose}
        defaultOverlayOpacity={0.2}>
        <ScrollView
          style={{ padding: 24 }}
          showsVerticalScrollIndicator={false} ref={scrollViewRef}
          nestedScrollEnabled={true}
          onScrollEndDrag={() =>
            actionSheetRef.current?.handleChildScrollEnd()
          }
          onScrollAnimationEnd={() =>
            actionSheetRef.current?.handleChildScrollEnd()
          }
          onMomentumScrollEnd={() =>
            actionSheetRef.current?.handleChildScrollEnd()
          }
        >
          <View style={{ padding: 12, paddingBottom: 140 }}>
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
