import Axios, { AxiosResponse } from 'axios';

import Constants from 'expo-constants';
import { IUser } from '@dlvrry/dlvrry-common';
import { IUserData } from './../../interfaces/IUserData';
import Stripe from 'stripe';
import firebase from 'firebase'

export class User {
  static storedUser: IUser = undefined;

  static getConnectedAccountDetails(id: string) {
    return new Promise<Stripe.Account>(resolve => {
      Axios.post<string, AxiosResponse<Stripe.Account>>(`${ Constants.manifest.extra.functionsUri }/getConnectedAccountDetails`, { id }).then(async (response) => {
        resolve(response.data);
      });
    });
  }

  static getLoginLink(id: string) {
    return new Promise<Stripe.LoginLink>(resolve => {
      Axios.post<string, AxiosResponse<Stripe.LoginLink>>(`${ Constants.manifest.extra.functionsUri }/getLoginLink`, { id }).then(async (response) => {
        resolve(response.data);
      });
    });
  }

  static onboardUser(user: IUserData, refreshUrl: string, returnUrl: string) {
    return new Promise<string>(async (resolve) => {
      await Axios.post<string, AxiosResponse<string>>(`${ Constants.manifest.extra.functionsUri }/onboardUser`, { email: user.email, id: user.uid, refreshUrl, returnUrl }).then(response => {
        resolve(response.data);
      })
    })
  }

  static async updateUser(id: string, data: any) {
    await firebase.firestore().collection('users').doc(id).update(data);

    const user = User.getUser(id);

    const newUserData = await user.get();

    User.storedUser = <IUser>newUserData.data();
  }

  static getUser(id: string) {
    return firebase.firestore().collection('users').doc(id);
  }

  static getCards(id: string) {
    return new Promise<any>(async (resolve) => {
      const response = await Axios.post<any, AxiosResponse<any>>(`${ Constants.manifest.extra.functionsUri }/getPaymentCards`, {
        customer_id: id
      });

      const collection = [];

      response.data.data.forEach(cards => {
        collection.push(cards.card.last4);
      });

      resolve(collection);
    });
  }
}