import Axios, { AxiosResponse } from 'axios';

import Constants from 'expo-constants';
import { IJob } from '../../../../dlvrry-backend/functions/src/interfaces/IJob';
import firebase from 'firebase';

export class Job {
  static getJobs() {
    return firebase.firestore().collection('jobs').where('status', '==', 'AWAITING_ACCEPTANCE')
  }

  static getJobsForBusiness(businessId: string) {
    return firebase.firestore().collection('jobs').where('businessId', '==', businessId);
  }

  static async getJob(id: string) {
    return firebase.firestore().collection('jobs').doc(id);
  }

  static async acceptJob(id: string, userId: string) {
    return firebase.firestore().collection('jobs').doc(id).update({ status: 'IN_PROGRESS', driverId: userId });
  }

  static async cancelJob(id: string) {
    return firebase.firestore().collection('jobs').doc(id).update({ status: 'CANCELLED' });
  }

  static async completeJob(job: IJob) {
    return new Promise<string>(async (resolve) => {
      await Axios.post<string, AxiosResponse<string>>(`${ Constants.manifest.extra.functionsUri }/completeJob`, { job }).then(response => {
        resolve(response.data);
      })
    })
  }

  static async createJob(job: IJob, businessId: string) {
    return new Promise<string>(async (resolve) => {
      await Axios.post<string, AxiosResponse<string>>(`${ Constants.manifest.extra.functionsUri }/createJob`, { job, businessId }).then(response => {
        resolve(response.data);
      })
    });
  }
}