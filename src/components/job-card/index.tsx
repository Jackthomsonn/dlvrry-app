import { AccountType, IJob, IUser, JobStatus } from 'dlvrry-common';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from "../button";
import { Job } from '../../services/job';
import { useNavigation } from "@react-navigation/native";
import { variables } from "../../../Variables";

const styles = StyleSheet.create({
  host: {
    backgroundColor: variables.secondaryColor,
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

interface JobCardProps {
  job: IJob,
  user: IUser,
  account_type: string
}

export const JobCard = (props: JobCardProps) => {
  const navigation = useNavigation();
  const [ isLoading, setIsLoading ] = useState(false);

  const acceptJob = async (id: string, rider_id: string) => {
    try {
      setIsLoading(true);

      await Job.acceptJob(id, rider_id);

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

      setIsLoading(false);
    } catch (e) {
      alert(e);
      setIsLoading(false);
    }
  }

  const cancelJob = async (id: string) => {
    try {
      setIsLoading(true);

      await Job.cancelJob(id);

      setIsLoading(false);
    } catch (e) {
      alert(e);
      setIsLoading(false);
    }
  }

  const handleJobStatus = (status: string) => {
    if (status === JobStatus.COMPLETED) {
      return <Text style={{ color: variables.success }}>Completed</Text>;
    } else if (status === JobStatus.IN_PROGRESS) {
      return <Text style={{ color: variables.success }}>In progress</Text>;
    } else if (status === JobStatus.CANCELLED) {
      return (
        <>
          <Text style={{ color: variables.warning, marginBottom: 12 }}>Cancelled by rider. Job is still awaiting a rider to accept</Text>
          <Button type="primary" title={'Cancel job'} onPress={() => cancelJob(props.job.id)} loading={isLoading} />
        </>
      )
    }
    else {
      return (
        <>
          <Text style={{ color: variables.success, marginBottom: 12 }}> Awaiting acceptance</Text>
          <Button type="primary" title={'Cancel job'} onPress={() => cancelJob(props.job.id)} loading={isLoading} />
        </>
      );
    }
  }

  return (
    <View style={styles.host} >
      <View style={styles.column}>
        <Text style={{ fontWeight: '700', fontSize: 22, color: variables.light }}>{props.job.owner_name}</Text>
        <Text style={{ fontWeight: '500', marginTop: 8, fontSize: 18, color: variables.light }}>Location name </Text>
        <Text style={{ fontWeight: '500', marginTop: 8, fontSize: 18, color: variables.light }}>£{(props.job.payout / 100).toFixed(2)} </Text>
        <View style={{ width: 300 - 24, marginTop: 12 }}>
          {
            props.account_type === AccountType.RIDER
              ? <Button
                type="primary"
                title="Accept job"
                onPress={() => acceptJob(props.job.id, props.user.id)}
                loading={isLoading} />
              : handleJobStatus(props.job.status)
          }
        </View>
      </View>
    </View>
  );
}