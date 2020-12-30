import Axios, { AxiosResponse } from 'axios';
import { IJob, JobStatus } from 'dlvrry-common';

import Constants from 'expo-constants';
import firebase from 'firebase';

export class Job {
  static getJobs() {
    return firebase.firestore().collection('jobs').where('status', '==', JobStatus.PENDING)
  }

  static getJobsForBusiness(id: string) {
    return firebase.firestore().collection('jobs').where('owner_id', '==', id);
  }

  static async getJob(id: string) {
    return firebase.firestore().collection('jobs').doc(id);
  }

  static async acceptJob(id: string, rider_id: string) {
    return firebase.firestore().collection('jobs').doc(id).update({ status: JobStatus.IN_PROGRESS, rider_id: rider_id });
  }

  static async cancelJob(id: string) {
    return firebase.firestore().collection('jobs').doc(id).update({ status: JobStatus.CANCELLED });
  }

  static async completeJob(job: IJob) {
    return new Promise<string>(async (resolve) => {
      await Axios.post<string, AxiosResponse<string>>(`${ Constants.manifest.extra.functionsUri }/completeJob`, { job }).then(response => {
        resolve(response.data);
      })
    })
  }

  static async createJob(job: IJob, owner_id: string) {
    return new Promise<string>(async (resolve) => {
      await Axios.post<string, AxiosResponse<string>>(`${ Constants.manifest.extra.functionsUri }/createJob`, { job, owner_id }).then(response => {
        resolve(response.data);
      })
    });
  }
}