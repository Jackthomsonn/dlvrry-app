import Axios, { AxiosResponse } from "axios";
import { IJob, JobStatus } from "dlvrry-common";

import Constants from "expo-constants";
import firebase from "firebase";

export class Job {
  static getJobs(statuses: JobStatus[]) {
    return firebase
      .firestore()
      .collection("jobs")
      .where("status", "in", statuses)
      .where("payment_captured", "==", true)
      .orderBy("created", "desc");
  }

  static getJobsForBusiness(id: string, statuses: JobStatus[], limit: number) {
    return firebase
      .firestore()
      .collection("jobs")
      .where("owner_id", "==", id)
      .where("status", "in", statuses)
      .orderBy("created", "desc")
      .limitToLast(limit);
  }

  static async getJob(id: string) {
    return firebase.firestore().collection("jobs").doc(id);
  }

  static async acceptJob(id: string, rider_id: string) {
    const token = await firebase.auth().currentUser.getIdToken();

    return await Axios.post<string, AxiosResponse<string>>(
      `${Constants.manifest.extra.functionsUri}/acceptJob`,
      { id, rider_id },
      {
        headers: {
          Authorization: token,
        },
      }
    );
  }

  static async cancelJob(id: string) {
    const token = await firebase.auth().currentUser.getIdToken();

    return await Axios.post<string, AxiosResponse<string>>(
      `${Constants.manifest.extra.functionsUri}/cancelJob`,
      { id },
      {
        headers: {
          Authorization: token,
        },
      }
    );
  }

  static async completeJob(job: IJob) {
    const token = await firebase.auth().currentUser.getIdToken();

    return await Axios.post<string, AxiosResponse<string>>(
      `${Constants.manifest.extra.functionsUri}/completeJob`,
      { job },
      {
        headers: {
          Authorization: token,
        },
      }
    );
  }

  static async createJob(job: IJob, owner_id: string) {
    const token = await firebase.auth().currentUser.getIdToken();

    return await Axios.post<any, AxiosResponse<any>>(
      `${Constants.manifest.extra.functionsUri}/createJob`,
      { job, owner_id },
      {
        headers: {
          Authorization: token,
        },
      }
    );
  }
}
