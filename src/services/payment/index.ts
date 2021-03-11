import Axios, { AxiosResponse } from 'axios';

import Constants from 'expo-constants';
import firebase from 'firebase';

export class Payment {
  static async removePaymentMethod(payment_method_id: string) {
    const token = await firebase.auth().currentUser.getIdToken();

    return await Axios.post<string, AxiosResponse<string>>(`${ Constants.manifest.extra.functionsUri }/removePaymentMethod`, { payment_method_id: payment_method_id }, {
      headers: {
        'Authorization': token
      }
    });
  }

  static async setDefaultPaymentMethod(customer_id: string, payment_method_id: string) {
    const token = await firebase.auth().currentUser.getIdToken();

    return await Axios.post<string, AxiosResponse<string>>(`${ Constants.manifest.extra.functionsUri }/setDefaultPaymentMethod`, {
      customer_id: customer_id,
      payment_method_id: payment_method_id
    }, {
      headers: {
        'Authorization': token
      }
    });
  }
}