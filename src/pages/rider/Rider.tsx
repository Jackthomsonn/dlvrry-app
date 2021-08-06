import React, { useEffect, useState } from 'react';

import { IJob } from 'dlvrry-common';
import { Info } from '../../components/info';
import { Map } from '../../components/map';
import { Route, useNavigation } from "@react-navigation/native";

import * as Location from 'expo-location';
import { Job } from '../../services/job';

interface RiderScreenProps {
  route: Route<any, {
    params: {
      job: IJob
    }
  }>
}

export function RiderScreen(props: RiderScreenProps) {
  const [duration, setDuration] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    Location.getForegroundPermissionsAsync().then(async (location_status) => {
      if (!location_status.granted) {
        try {
          alert("You must allow location services")

          navigation.goBack();

          await Job.cancelJob(props.route.params.params.job.id);
        } catch (e) {
          alert("Something went wrong");
        }
      }
    });
  })

  return (
    <>
      <Map
        customerAddress={props.route.params.params.job.customer_location}
        pickupAddress={props.route.params.params.job.pickup_location}
        duration={duration => setDuration(duration)}
      />
      <Info job={props.route.params.params.job} duration={duration} />
    </>
  )
}
