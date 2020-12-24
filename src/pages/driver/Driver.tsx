import { IJob } from '../../../../dlvrry-backend/functions/src/interfaces/IJob';
import { Info } from '../../components/info';
import { Map } from '../../components/map';
import React from 'react';
import { Route } from "@react-navigation/native";

export interface DriverScreenProps {
  route: Route<any, {
    params: {
      job: IJob
    }
  }>
}

export function DriverScreen(props: DriverScreenProps) {

  return (
    <>
      <Map
        customerAddress={props.route.params.params.job.customerLocation}
        pickupAddress={props.route.params.params.job.pickupLocation}
      />
      <Info job={props.route.params.params.job} />
    </>
  )
}
