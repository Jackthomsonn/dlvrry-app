import { IJob, JobStatus } from 'dlvrry-common';

import { Button } from "../button";
import React from 'react';
import { Text } from 'react-native';
import { variables } from "../../../Variables";

interface JobStatusLabelProps {
  id: string,
  status: JobStatus,
  cb?: Function,
  isLoading?: boolean
};

export const JobStatusLabel = (props: JobStatusLabelProps) => {
  let element: JSX.Element;

  switch (props.status) {
    case JobStatus.COMPLETED:
      element = (
        <>
          <Text style={{ fontWeight: '700', color: variables.success, marginBottom: 12, textAlign: 'left' }}>Completed</Text>
        </>
      )
      break;
    case JobStatus.IN_PROGRESS:
      element = (
        <>
          <Text style={{ fontWeight: '700', color: variables.success, marginBottom: 12, textAlign: 'left' }}>In progress</Text>
        </>
      )
      break;
    case JobStatus.CANCELLED:
      element = (
        <>
          <Text style={{ color: variables.light, marginBottom: 12 }}>Cancelled by rider. Job is still awaiting a rider to accept</Text>
          <Button type="primary" title={'Cancel job'} onPress={() => props.cb(props.id)} loading={props.isLoading} />
        </>
      )
      break;
    case JobStatus.PENDING:
      element = (
        <>
          <Text style={{ fontWeight: '700', color: variables.success, marginBottom: 12, textAlign: 'left' }}>Awaiting acceptance</Text>
          <Button type="primary" title={'Cancel job'} onPress={() => props.cb(props.id)} loading={props.isLoading} />
        </>
      )
      break;
    case JobStatus.REFUNDED:
      element = (
        <>
          <Text style={{ fontWeight: '700', color: variables.success, marginBottom: 12, textAlign: 'left' }}>Refunded</Text>
        </>
      )
      break;
    case JobStatus.AWAITING_PAYMENT:
      element = (
        <>
          <Text style={{ fontWeight: '700', color: variables.success, marginBottom: 12, textAlign: 'left' }}>Awaiting payment</Text>
        </>
      )
      break;
  }

  return element;
}