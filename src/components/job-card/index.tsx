import { StyleSheet, Text, View } from 'react-native';

import { Button } from "../button";
import { IJob } from "../../../../dlvrry-backend/functions/src/interfaces/IJob";
import { IUser } from '../../../../dlvrry-backend/functions/src/interfaces/IUser';
import { Job } from '../../services/job';
import React from 'react';
import { Role } from '../../../../dlvrry-backend/functions/src/enums/role';
import { UserRole } from '../../enums/UserRole';
import firebase from 'firebase';
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
  role: string
}

export const JobCard = (props: JobCardProps) => {
  const navigation = useNavigation();

  const acceptJob = async (id: string, userId: string) => {
    await Job.acceptJob(id, userId);

    navigation.navigate('Driver', {
      screen: 'Driver',
      params: {
        customerAddress: {
          latitude: props.job.customerLocation.latitude,
          longitude: props.job.customerLocation.longitude
        },
        pickupAddress: {
          latitude: props.job.pickupLocation.latitude,
          longitude: props.job.pickupLocation.longitude
        },
        job: props.job
      }
    });
  }

  const cancelJob = async (id: string) => {
    await Job.cancelJob(id);
  }

  const handleJobStatus = (status: string) => {
    if (status === 'COMPLETED') {
      return <Text style={{ color: variables.success }}>Completed</Text>;
    } else if (status === 'IN_PROGRESS') {
      return <Text style={{ color: variables.success }}>In progress</Text>;
    } else {
      return (
        <>
          <Text style={{ color: variables.dark, marginBottom: 12 }}> Awaiting acceptance</Text>
          <Button type="primary" title={'Cancel job'} onPress={() => cancelJob(props.job.id)} />
        </>
      );
    }
  }

  return (
    <View style={styles.host} >
      <View style={styles.column}>
        <Text style={{ fontWeight: '700', fontSize: 22, color: variables.dark }}>{props.job.businessName}</Text>
        <Text style={{ fontWeight: '300', marginTop: 8, fontSize: 18, color: variables.dark }}>{props.job.customerLocation.latitude} </Text>
        <Text style={{ fontWeight: '300', marginTop: 8, fontSize: 18, color: variables.dark }}>£{props.job.payout / 100} </Text>
        <View style={{ width: 300 - 48, marginTop: 12 }}>
          {
            props.role === UserRole.RIDER
              ? <Button
                type="primary"
                title="Accept job"
                onPress={() => acceptJob(props.job.id, props.user.uid)} />
              : handleJobStatus(props.job.status)
          }
        </View>
      </View>
    </View>
  );
}