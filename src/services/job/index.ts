import Axios, { AxiosResponse } from 'axios';
import { IJob, JobStatus } from 'dlvrry-common';

import Constants from 'expo-constants';
import { User } from './../user/index';
import firebase from 'firebase';

export class Job {
  static getJobs() {
    return firebase
      .firestore()
      .collection('jobs')
      .where('status', 'in', [ JobStatus.PENDING, JobStatus.CANCELLED ])
  }

  static getJobsForBusiness(id: string) {
    return firebase.firestore().collection('jobs').where('owner_id', '==', id);
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
  static async cancelJob(id: string) {
    const job = firebase.firestore().collection('jobs').doc(id);

    const job_data = await job.get();

    if (User.storedUser.id !== job_data.data().owner_id) {
      const rider_id = job_data.data().rider_id;

      let cancelled_jobs = User.storedUser.cancelled_jobs;

      await job.update({ status: JobStatus.CANCELLED });

      await User.updateUser(rider_id, { cancelled_jobs: cancelled_jobs + 1 });
    } else {
      await job.delete();
    }
  }

  static async completeJob(job: IJob) {
    const token = await firebase.auth().currentUser.getIdToken();

    return await Axios.post<string, AxiosResponse<string>>(`${ Constants.manifest.extra.functionsUri }/completeJob`, { job }, {
      headers: {
        'Authorization': token
      }
    });
  }

  static async createJob(job: IJob, owner_id: string) {
    const token = await firebase.auth().currentUser.getIdToken();

    return await Axios.post<string, AxiosResponse<string>>(`${ Constants.manifest.extra.functionsUri }/createJob`, { job, owner_id }, {
      headers: {
        'Authorization': token
      }
    });
  }
}