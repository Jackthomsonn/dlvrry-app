import Axios, { AxiosResponse } from 'axios';
import { BehaviorSubject, Subject } from 'rxjs';

import AsyncStorage from '@react-native-community/async-storage';
import Constants from 'expo-constants';
import { IUser } from 'dlvrry-common';
import { StorageKey } from './../../enums/Storage.enum';
import Stripe from 'stripe';
import firebase from 'firebase'

export class User {
  static storedUser: IUser;
  static authenticated = new Subject();

  static async requestAndSetStoredUser() {
    const userData = await AsyncStorage.getItem(StorageKey.USER_DATA);

    User.storedUser = JSON.parse(userData);
  }

  static async saveUser(newUserData: any) {
    return await AsyncStorage.setItem(StorageKey.USER_DATA, JSON.stringify(newUserData));
  }

  static async setupStoredUser(activeUser: firebase.User) {
    if (!activeUser) {
      return Promise.reject('No user');
    }

    const newUser: any = await User.getUser(activeUser.uid).get();

    User.storedUser = newUser.data();

    return User.saveUser(newUser.data());
  }

  static async getConnectedAccountDetails(id: string) {
    return await Axios.post<string, AxiosResponse<Stripe.Account>>(`${ Constants.manifest.extra.functionsUri }/getConnectedAccountDetails`, { id });
  }

  static async getLoginLink(id: string) {
    return await Axios.post<string, AxiosResponse<Stripe.LoginLink>>(`${ Constants.manifest.extra.functionsUri }/getLoginLink`, { id });
  }

  static async onboardUser(email: string, refreshUrl: string, returnUrl: string) {
    if (User.storedUser && User.storedUser.id) {
      return await Axios.post<string, AxiosResponse<string>>(`${ Constants.manifest.extra.functionsUri }/onboardUser`, { email, id: User.storedUser.id, refreshUrl, returnUrl });
    }
  }

  // Turn this into a function
  static async updateUser(id: string, data: any) {
    await firebase.firestore().collection('users').doc(id).update(data);

    const user = User.getUser(id);

    const newUserData = await user.get();

    await AsyncStorage.setItem(StorageKey.USER_DATA, JSON.stringify(newUserData.data()));

    User.storedUser = <IUser>newUserData.data();

    return Promise.resolve();
  }

  static getUser(id: string) {
    return firebase.firestore().collection('users').doc(id);
  }

  static async getCards(id: string) {
    const response = await Axios.post<any, AxiosResponse<any>>(`${ Constants.manifest.extra.functionsUri }/getPaymentCards`, {
      customer_id: id
    });

    const collection = [];

    response.data.forEach(cards => {
      collection.push(cards.card.last4);
    });

    return Promise.resolve(collection);
  }
}