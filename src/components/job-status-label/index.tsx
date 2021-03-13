import { Button } from '../button';
import { JobStatus } from 'dlvrry-common';
import React from 'react';
import { Text } from 'react-native';
import { variables } from "../../../Variables";

interface JobStatusLabelProps {
  id: string,
  status: JobStatus,
  cb?: Function,
  isLoading?: boolean,
  completePaymentCb?: Function,
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
          <Text style={{ fontWeight: '700', color: variables.neutral, marginBottom: 12, textAlign: 'left' }}>In progress</Text>
        </>
      )
      break;
    case JobStatus.CANCELLED_BY_RIDER:
      element = (
        <>
          <Text style={{ fontWeight: '700', color: variables.success, marginBottom: 12, textAlign: 'left' }}>Awaiting acceptance</Text>
          <Text style={{ color: variables.secondaryColor, marginBottom: 12 }}>This job was cancelled by the rider. This Job is still awaiting a rider to accept</Text>
        </>
      )
      break;
    case JobStatus.PENDING:
      element = (
        <>
          <Text style={{ fontWeight: '700', color: variables.success, marginBottom: 12, textAlign: 'left' }}>Awaiting acceptance</Text>
        </>
      )
      break;
    case JobStatus.REFUNDED:
      element = (
        <>
          <Text style={{ fontWeight: '700', color: variables.warning, marginBottom: 12, textAlign: 'left' }}>Refunded</Text>
        </>
      )
      break;
    case JobStatus.AWAITING_PAYMENT:
      element = (
        <>
          <Text style={{ fontWeight: '700', color: variables.success, marginBottom: 12, textAlign: 'left' }}>Awaiting payment</Text>
          <Button title="Make payment" onPress={() => props.completePaymentCb()} type="light" />
        </>
      )
      break;
  }

  return element;
}