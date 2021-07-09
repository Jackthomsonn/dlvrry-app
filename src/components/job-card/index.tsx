import { AccountType, IJob, IUser } from 'dlvrry-common';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from "../button";
import { Ionicons } from '@expo/vector-icons';
import { Job } from '../../services/job';
import { JobStatusLabel } from '../job-status-label';
import { User } from '../../services/user';
import { useNavigation } from "@react-navigation/native";
import { variables } from "../../../Variables";

const styles = StyleSheet.create({
  host: {
    backgroundColor: variables.secondaryColor,
    borderColor: variables.secondaryColor,
    borderWidth: 1,
    padding: 24,
    flex: 1,
    marginTop: 16,
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  column: {
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
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

  return (
    <View style={styles.host} >
      <View style={styles.column}>
        <View style={styles.column}>
          <View style={{ display: 'flex', flexDirection: 'row' }}>
            <Ionicons name="ios-pin" size={18} color={variables.light} style={{ marginRight: 12 }} />
            <Text style={{ fontWeight: '500', fontSize: 18, ...variables.fontStyle, marginBottom: 24, marginRight: 24, color: variables.light }}>{props.job.customer_location_name}</Text>
          </View>

          <View style={{ display: 'flex', flexDirection: 'row' }}>
            <Ionicons name="ios-barcode" size={18} color={variables.light} style={{ marginRight: 12 }} />
            <Text style={{ fontWeight: '500', fontSize: 18, ...variables.fontStyle, marginBottom: 24, marginRight: 0, color: variables.light }}>{props.job.id.substr(0, 4).toUpperCase()}</Text>
            <View style={{ display: 'flex', flexDirection: 'row', marginBottom: 12, marginLeft: 24 }}>
              <Ionicons name="ios-cash" size={18} color={variables.light} style={{ marginRight: 12 }} />
              <Text style={{ fontWeight: '500', fontSize: 18, ...variables.fontStyle, color: variables.light }}>£{(props.job.payout / 100).toFixed(2)} </Text>
            </View>
          </View>
        </View>
        <View>
          <View style={{ width: 300 - 24 }}>
            {
              props.account_type === AccountType.RIDER
                ? <Button
                  showIcon={true}
                  type="primary"
                  title="Accept job"
                  onPress={() => acceptJob(props.job.id, User.storedUserId)}
                  loading={isLoading} />
                : <JobStatusLabel id={props.job.id} status={props.job.status} cb={cancelJob} isLoading={isLoading} completePaymentCb={() => {
                  navigation.navigate('AuthenticatePayment', {
                    client_secret: props.job.complete_payment_link,
                    payment_method_id: props.job.complete_payment_method_link,
                  });
                }} />
            }
          </View>
        </View>
      </View>
    </View>
  );
}