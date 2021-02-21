import Axios, { AxiosResponse } from 'axios';
import { IJob, JobStatus } from 'dlvrry-common';

import Constants from 'expo-constants';
import { User } from './../user/index';
import firebase from 'firebase';

export class Job {
  static getJobs(statuses: JobStatus[]) {
    return firebase
      .firestore()
      .collection('jobs')
      .where('status', 'in', statuses)
      .where('payment_captured', '==', true);
  }

  static getJobsForBusiness(id: string, statuses: JobStatus[]) {
    return firebase.firestore().collection('jobs').where('owner_id', '==', id).where('status', 'in', statuses);
  }

  static async getJob(id: string) {
    return firebase.firestore().collection('jobs').doc(id);
  }

  static async acceptJob(id: string, rider_id: string) {
    const token = await firebase.auth().currentUser.getIdToken();

    return await Axios.post<string, AxiosResponse<string>>(`${ Constants.manifest.extra.functionsUri }/acceptJob`, { id, rider_id }, {
      headers: {
        'Authorization': token
      }
    });
  }

  // Turn this into a function
  static async cancelJob(id: string, userId: string) {
    const token = await firebase.auth().currentUser.getIdToken();

    return await Axios.post<string, AxiosResponse<string>>(`${ Constants.manifest.extra.functionsUri }/cancelJob`, { id }, {
      headers: {
        'Authorization': token
      }
    });
  }

  static async completeJob(job: IJob) {
    const token = await firebase.auth().currentUser.getIdToken();

    return await Axios.post<string, AxiosResponse<string>>(`${ Constants.manifest.extra.functionsUri }/completeJob`, { job }, {
      headers: {
        'Authorization': token
      }
    });
  }

  static async createJob(job: IJob, rider_id: string) {
    const token = await firebase.auth().currentUser.getIdToken();

    return await Axios.post<any, AxiosResponse<any>>(`${ Constants.manifest.extra.functionsUri }/createJob`, { job, rider_id }, {
      headers: {
        'Authorization': token
      }
    });
  }
}