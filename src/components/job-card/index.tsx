import { IJob, JobStatus } from '@dlvrry/dlvrry-common';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from "../button";
import { Job } from '../../services/job';
import React from 'react';
import { UserRole } from '../../enums/UserRole';
import { useNavigation } from "@react-navigation/native";
import { variables } from "../../../Variables";

const styles = StyleSheet.create({
  host: {
    backgroundColor: variables.tertiaryColor,
    padding: 24,
    flex: 1,
    marginTop: 24,
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  column: {
    flexDirection: 'column',
    justifyContent: 'space-between'
  }
})

export interface JobCardProps {
  job: IJob,
  user: { uid: string },
  account_type: string
}

export const JobCard = (props: JobCardProps) => {
  const navigation = useNavigation();

  const acceptJob = async (id: string, userId: string) => {
    await Job.acceptJob(id, userId);

    navigation.navigate('Rider', {
      screen: 'Rider',
      params: {
        customerAddress: {
          latitude: props.job.customer_location.latitude,
          longitude: props.job.customer_location.longitude
        },
        pickupAddress: {
          latitude: props.job.pickup_location.latitude,
          longitude: props.job.pickup_location.longitude
        },
        job: props.job
      }
    });
  }

  const cancelJob = async (id: string) => {
    await Job.cancelJob(id);
  }

  const handleJobStatus = (status: string) => {
    if (status === JobStatus.COMPLETED) {
      return <Text style={{ color: variables.success }}>Completed</Text>;
    } else if (status === JobStatus.IN_PROGRESS) {
      return <Text style={{ color: variables.success }}>In progress</Text>;
    } else if (status === JobStatus.CANCELLED) {
      return <Text style={{ color: variables.warning }}>Cancelled</Text>;
    }
    else {
      return (
        <>
          <Text style={{ color: variables.dark, marginBottom: 12 }}> Awaiting acceptance</Text>
          <Button type="primaryNoBorder" title={'Cancel job'} onPress={() => cancelJob(props.job.id)} />
        </>
      );
    }
  }

  return (
    <View style={styles.host} >
      <View style={styles.column}>
        <Text style={{ fontWeight: '700', fontSize: 22, color: variables.dark }}>{props.job.owner_name}</Text>
        <Text style={{ fontWeight: '300', marginTop: 8, fontSize: 18, color: variables.dark }}>{props.job.customer_location.latitude} </Text>
        <Text style={{ fontWeight: '300', marginTop: 8, fontSize: 18, color: variables.dark }}>£{(props.job.payout / 100).toFixed(2)} </Text>
        <View style={{ width: 300 - 48, marginTop: 12 }}>
          {
            props.account_type === UserRole.RIDER
              ? <Button
                type="primaryNoBorder"
                title="Accept job"
                onPress={() => acceptJob(props.job.id, props.user.uid)} />
              : handleJobStatus(props.job.status)
          }
        </View>
      </View>
    </View>
  );
}