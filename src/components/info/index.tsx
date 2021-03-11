import { IJob, JobStatus } from "dlvrry-common";
import React, { useState } from "react";
import { Text, View } from "react-native";

import { Button } from "../button";
import { Job } from "../../services/job";
import getDirections from 'react-native-google-maps-directions'
import { useNavigation } from "@react-navigation/native";
import { variables } from "../../../Variables";

interface InfoProps {
  job: IJob,
  duration: number,
}

export const Info = (props: InfoProps) => {
  const navigation = useNavigation();
  const [ isCancellingJob, setIsCancellingJob ] = useState(false);
  const [ isCompletingJob, setIsCompletingJob ] = useState(false);
  const [ currentProgress, setCurrentProgress ] = useState('in_progress');

  const cancelJob = async () => {
    try {
      setIsCancellingJob(true);

      await Job.cancelJob(props.job.id);

      setIsCancellingJob(false);

      setCurrentProgress('in_progress');

      navigation.goBack();
    } catch (e) {
      setIsCancellingJob(false);
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

      navigation.goBack();
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
          value: "bicycling"
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

  return (
    <>
      <View style={{
        position: 'absolute',
        bottom: 168,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '15%',
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
            <Text style={{ fontWeight: '500', color: variables.primaryColor, fontSize: 16, ...variables.fontStyle }}>Number of items</Text>
            <Text style={{ fontWeight: '700', color: variables.secondaryColor, fontSize: 18, ...variables.fontStyle }}>{props.job.number_of_items}</Text>
          </View>
          <View style={{ borderTopRightRadius: 50, width: '50%', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontWeight: '500', color: variables.primaryColor, fontSize: 16, ...variables.fontStyle }}>Job ID</Text>
            <Text style={{ fontWeight: '700', color: variables.secondaryColor, fontSize: 18, ...variables.fontStyle }}>{props.job.id.substr(0, 4).toUpperCase()}</Text>
          </View>
        </View>

        <View style={{ height: 140, backgroundColor: variables.light, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '80%' }}>
            {
              currentProgress === JobStatus.IN_PROGRESS
                ? <Button showIcon={true} title={'Get directions'} onPress={() => openDirectionsViewer()} type={'primary'} loading={isCompletingJob} />
                : <Button showIcon={true} title={'Complete job'} onPress={() => completeJob()} type={'primary'} loading={isCompletingJob} />
            }
            <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
              <Button showIcon={true} title={'Cancel job'} onPress={() => cancelJob()} type='link' loading={isCancellingJob} loaderColor={variables.secondaryColor} />
            </View>
          </View>
        </View>
      </View>
    </>
  )
}