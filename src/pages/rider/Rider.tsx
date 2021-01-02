import { IJob } from '@dlvrry/dlvrry-common';
import { Info } from '../../components/info';
import { Map } from '../../components/map';
import React from 'react';
import { Route } from "@react-navigation/native";

interface RiderScreenProps {
  route: Route<any, {
    params: {
      job: IJob
    }
  }>
}

export function RiderScreen(props: RiderScreenProps) {
  return (
    <>
      <Map
        customerAddress={props.route.params.params.job.customer_location}
        pickupAddress={props.route.params.params.job.pickup_location}
      />
      <Info job={props.route.params.params.job} />
    </>
  )
}
