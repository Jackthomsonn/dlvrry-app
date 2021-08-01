import { IJob, IUser, JobStatus } from "dlvrry-common";
import React, { useEffect, useState } from "react";
import { Linking, Text, View } from "react-native";

import { Button } from "../button";
import { Job } from "../../services/job";
import getDirections from 'react-native-google-maps-directions'
import { useNavigation } from "@react-navigation/native";
import { variables } from "../../../Variables";
import * as Location from 'expo-location';
import haversine from 'haversine';
import { LatLng } from "react-native-maps";
import { User } from '../../services/user';
import { useDocumentData } from "react-firebase-hooks/firestore";
import { format } from "libphonenumber-js";


interface InfoProps {
  job: IJob,
  duration: number,
}

export const Info = (props: InfoProps) => {
  const navigation = useNavigation();
  const [isCancellingJob, setIsCancellingJob] = useState(false);
  const [isCompletingJob, setIsCompletingJob] = useState(false);
  const [currentProgress, setCurrentProgress] = useState('in_progress');
  const [showCancelJobDialog, setShowCancelJobDialog] = useState(false)
  const [currentPosition, setCurrentPosition] = useState<LatLng>({ latitude: undefined, longitude: undefined });
  const [user] = useDocumentData<IUser>(User.getUser(User.storedUserId));

  const maybeCancelJob = () => {
    setShowCancelJobDialog(true)
  }

  const cancelJob = async () => {
    try {
      setIsCancellingJob(true);

      await Job.cancelJob(props.job.id);

      setIsCancellingJob(false);

      setCurrentProgress('in_progress');

      setShowCancelJobDialog(false);

      navigation.goBack();
    } catch (e) {
      setIsCancellingJob(false);
      setShowCancelJobDialog(false);
      alert(e);
    }
  }

  const completeJob = async () => {
    try {
      setIsCompletingJob(true);

      await Job.completeJob(props.job);

      setIsCompletingJob(false);

      setCurrentProgress('in_progress');

      navigation.goBack();
    } catch (e) {
      setIsCompletingJob(false);

      setCurrentProgress('in_progress');

      alert(e);
    }
  }

  const openDirectionsViewer = async () => {

    const data = {
      destination: {
        latitude: props.job.customer_location.latitude,
        longitude: props.job.customer_location.longitude,
      },
      params: [
        {
          key: "travelmode",
          value: user.mode
        },
        {
          key: "dir_action",
          value: "navigate"
        }
      ],
      waypoints: [
        {
          latitude: props.job.pickup_location.latitude,
          longitude: props.job.pickup_location.longitude,
        },
      ]
    }

    getDirections(data);

    setCurrentProgress('get_directions');
  }

  const riderIsWithinDistanceToCompleteJob = (destination: LatLng) => {
    return haversine(currentPosition, destination, { unit: 'meter', threshold: 100 })
  }

  const openPhoneCaller = async () => {
    await Linking.openURL(`tel:${format(props.job.phone_number, "NATIONAL")}`)
  }

  useEffect(() => {
    Location.watchPositionAsync({ accuracy: Location.LocationAccuracy.BestForNavigation }, location => {
      setCurrentPosition({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      })
    });
  }, [])

  return (
    <>
      <View style={{
        position: 'absolute',
        bottom: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '40%',
        backgroundColor: variables.light,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        shadowColor: '#CCC',
        shadowOffset: {
          width: 1,
          height: 1
        },
        shadowOpacity: 1,
        shadowRadius: 20
      }}>
        <View style={{ borderTopLeftRadius: 50, borderTopRightRadius: 50, flexDirection: 'row', height: 100, backgroundColor: variables.light, }}>
          <View style={{ width: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontWeight: '500', color: variables.primaryColor, fontSize: 16, ...variables.fontStyle }}>Business</Text>
            <Text style={{ fontWeight: '700', color: variables.secondaryColor, fontSize: 18, ...variables.fontStyle }}>{props.job.owner_name}</Text>
          </View>
          <View style={{ borderTopRightRadius: 50, width: '50%', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontWeight: '500', color: variables.primaryColor, fontSize: 16, ...variables.fontStyle }}>Payout</Text>
            <Text style={{ fontWeight: '700', color: variables.secondaryColor, fontSize: 18, ...variables.fontStyle }}>£{(props.job.payout / 100).toFixed(2)}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', height: 50, backgroundColor: variables.light, }}>
          <View style={{ borderTopRightRadius: 50, width: '50%', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontWeight: '500', color: variables.primaryColor, fontSize: 16, ...variables.fontStyle }}>Phone number</Text>
            <Text onPress={openPhoneCaller} style={{ fontWeight: '700', color: variables.secondaryColor, fontSize: 18, ...variables.fontStyle }}>{props.job.phone_number ? format(props.job.phone_number, "NATIONAL") : 'N/A'}</Text>
          </View>
          <View style={{ borderTopRightRadius: 50, width: '50%', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontWeight: '500', color: variables.primaryColor, fontSize: 16, ...variables.fontStyle }}>Job ID</Text>
            <Text style={{ fontWeight: '700', color: variables.secondaryColor, fontSize: 18, ...variables.fontStyle }}>{props.job.id.substr(0, 4).toUpperCase()}</Text>
          </View>
        </View>

        <View style={{ height: 180, backgroundColor: variables.light, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '80%', marginTop: 24 }}>
            {
              currentProgress === JobStatus.IN_PROGRESS
                ? <Button showIcon={true} title={'Get directions'} onPress={() => openDirectionsViewer()} type={'primary'} loading={isCompletingJob} />
                : riderIsWithinDistanceToCompleteJob(props.job.customer_location) ?
                  <Button showIcon={true} title={'Complete job'} onPress={() => completeJob()} type={'primary'} loading={isCompletingJob} />
                  : <Text style={{ fontWeight: '500', color: variables.secondaryColor, textAlign: 'center', ...variables.fontStyle }}>You must be within the customers destination to mark a job as complete</Text>
            }
            <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
              <Button showIcon={true} title={'Cancel job'} onPress={() => maybeCancelJob()} type='link' loading={isCancellingJob} loaderColor={variables.secondaryColor} />
            </View>
          </View>
        </View>
      </View>
      {
        showCancelJobDialog
          ? <View style={{ display: 'flex', justifyContent: 'center', position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(255, 255, 255, 0.97)', padding: 24 }}>
            <Text style={{ marginBottom: 24, fontWeight: '500', color: variables.secondaryColor, textAlign: 'center', ...variables.fontStyle }}>You can only cancel a job so many times before your account will be suspended. Please only accept jobs you know you can complete</Text>
            <Button showIcon={true} title={'I am sure I want to cancel'} onPress={() => cancelJob()} type={'primary'} loading={isCancellingJob} />
            <View style={{ marginTop: 24 }}>
              <Button showIcon={true} title={'Dont cancel this job'} onPress={() => setShowCancelJobDialog(false)} type={'secondary'} />
            </View>
          </View>
          : undefined
      }

    </>
  )
}