import { IUserData } from './../../interfaces/IUserData';
import Axios, { AxiosResponse } from 'axios';

import Constants from 'expo-constants';
import { IUser } from '../../../../dlvrry-backend/functions/src/interfaces/IUser';
import Stripe from 'stripe';
import firebase from 'firebase'

export class User {
  static getStripeUserDetails(id: string) {
    return new Promise<Stripe.Account>(resolve => {
      Axios.post<string, AxiosResponse<Stripe.Account>>(`${ Constants.manifest.extra.functionsUri }/getStripeUserDetails`, { id }).then(async (response) => {
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
      await Axios.post<string, AxiosResponse<string>>(`${ Constants.manifest.extra.functionsUri }/onboardDriver`, { email: user.email, id: user.uid, refreshUrl, returnUrl }).then(response => {
        resolve(response.data);
      })
    })
  }

  static updateUser(id: string, data: any) {
    return new Promise<any>(async (resolve) => {
      const user = await firebase.firestore().collection('users').doc(id).update(data);

      resolve(user);
    })
  }

  static getUser(id: string) {
    return firebase.firestore().collection('users').doc(id).get();
  }
}