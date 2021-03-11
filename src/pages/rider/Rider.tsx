import React, { useEffect, useState } from 'react';

import { IJob } from 'dlvrry-common';
import { Info } from '../../components/info';
import { Map } from '../../components/map';
import { Route } from "@react-navigation/native";

interface RiderScreenProps {
  route: Route<any, {
    params: {
      job: IJob
    }
  }>
}

export function RiderScreen(props: RiderScreenProps) {
  const [ duration, setDuration ] = useState(0);

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
