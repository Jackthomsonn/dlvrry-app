import Axios, { AxiosResponse } from 'axios';

import Constants from 'expo-constants';
import { IUser } from 'dlvrry-common';
import Stripe from 'stripe';
import { Subject } from 'rxjs';
import firebase from 'firebase';

export class User {
  static storedUserId: string;
  static storedUser: IUser;
  static authenticated = new Subject();

  static tearDownUserData() {
    User.storedUserId = undefined;
    User.storedUser = undefined;
  }

  static async getConnectedAccountDetails(id: string) {
    const token = await firebase.auth().currentUser.getIdToken();

    return await Axios.post<string, AxiosResponse<Stripe.Account>>(`${ Constants.manifest.extra.functionsUri }/getConnectedAccountDetails`, { id }, {
      headers: {
        'Authorization': token
      }
    });
  }

  static async getLoginLink(id: string) {
    const token = await firebase.auth().currentUser.getIdToken();

    return await Axios.post<string, AxiosResponse<Stripe.LoginLink>>(`${ Constants.manifest.extra.functionsUri }/getLoginLink`, { id }, {
      headers: {
        'Authorization': token
      }
    });
  }

  static async onboardUser(id: string, email: string, refreshUrl: string, returnUrl: string) {
    const token = await firebase.auth().currentUser.getIdToken();

    return await Axios.post<string, AxiosResponse<string>>(`${ Constants.manifest.extra.functionsUri }/onboardUser`, { email, id, refreshUrl, returnUrl }, {
      headers: {
        'Authorization': token
      }
    });
  }

  static async updateUser(id: string, data: any) {
    await firebase.firestore().collection('users').doc(id).update(data);

    return Promise.resolve();
  }

  static getUser(id: string) {
    return firebase.firestore()
      .collection('users')
      .doc(id);
  }

  static async getCards(customer_id: string) {
    const token = await firebase.auth().currentUser.getIdToken();

    return await Axios.post<any, AxiosResponse<any>>(`${ Constants.manifest.extra.functionsUri }/getPaymentCards`, { customer_id, id: firebase.auth().currentUser.uid }, {
      headers: {
        'Authorization': token
      }
    });
  }
}