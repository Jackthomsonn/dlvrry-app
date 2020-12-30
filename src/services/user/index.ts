import { IUserData } from './../../interfaces/IUserData';
import Axios, { AxiosResponse } from 'axios';

import Constants from 'expo-constants';
import Stripe from 'stripe';
import firebase from 'firebase'
import { IUser } from 'dlvrry-common';

export class User {
  static getConnectedAccountDetails(id: string) {
    return new Promise<Stripe.Account>(resolve => {
      Axios.post<string, AxiosResponse<Stripe.Account>>(`${ Constants.manifest.extra.functionsUri }/getConnectedAccountDetails`, { id }).then(async (response) => {
        resolve(response.data);
      });
    });
  }

  static getUserRole(id: string) {
    return new Promise<string>(async (resolve) => {
      const userResponse = await firebase.firestore().collection('users').doc(id).get();
      const user = <IUser>userResponse.data();

      resolve(user.role);
    })
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

  static updateUser(id: string, data: any) {
    return firebase.firestore().collection('users').doc(id).update(data);
  }

  static getUser(id: string) {
    return firebase.firestore().collection('users').doc(id).get();
  }
}