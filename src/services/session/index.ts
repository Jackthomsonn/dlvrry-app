import Axios, { AxiosResponse } from 'axios';

import Constants from 'expo-constants';
import Stripe from 'stripe';

export class Session {
  static async createToken() {
    return await Axios.post<string, AxiosResponse<Stripe.Account>>(`${ Constants.manifest.extra.functionsUri }/createSessionToken`);
  }
}