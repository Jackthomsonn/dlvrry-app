import { KeyboardAvoidingView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";

import { Button } from "../../components/button";
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Header } from "../../components/header";
import { IJob } from "dlvrry-common";
import { Input } from "../../components/input";
import { Job } from "../../services/job";
import { Loader } from "../../components/loader";
import { LocationPicker } from "../../components/location-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { Session } from "../../services/session";
import { User } from "../../services/user";
import percentage from 'calculate-percentages';
import { useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { variables } from "../../../Variables";

const styles = StyleSheet.create({
  host: {
    display: 'flex',
    flex: 1,
    backgroundColor: '#FFF'
  },
  input: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
    borderColor: 'rgba(0, 0, 0, 0.1)'
  },
  errorText: {
    color: variables.warning,
    fontWeight: '700',
    marginBottom: 24
  },
  keyboardView: {
    margin: 24
  }
});

export const CreateJobScreen = () => {
  const navigation = useNavigation();

  const [ isLoading, setIsLoading ] = useState(false);
  const [ isSubmitting, setIsSubmitting ] = useState(false);
  const [ riderPayout, setRiderPayout ] = useState(undefined);
  const { register, handleSubmit, setValue, errors, getValues } = useForm();

  const onSubmit = async (job: IJob) => {
    setIsSubmitting(true);

    job.cost = job.payout * 100;
    job.payout = riderPayout * 100;

    try {
      await Job.createJob(job, User.storedUser.id);

      setIsSubmitting(false);
      navigation.goBack();
    } catch (e) {
      setIsSubmitting(false);
      alert(e);
    }
  }

  const setCostAndCalculateRiderPayout = (value: any) => {
    setValue('payout', value);

    const wholeAmount = Number(getValues('payout'));
    const dlvrryFee = percentage.of(12, wholeAmount) + 0.20;

    const amountAfterPayoutFee = wholeAmount - dlvrryFee;

    setRiderPayout((amountAfterPayoutFee).toFixed(2));
  }

  useEffect(() => {
    setup();
  }, [ register ]);

  const setup = async () => {
    setIsLoading(true);

    setIsLoading(false);

    register('payout', {
      required: {
        message: 'You must specify how much the rider will recieve',
        value: true
      },
      min: {
        message: 'You must enter a minimum amount of £5',
        value: 5
      },
      valueAsNumber: true
    });
    register('pickup_location', {
      required: {
        message: 'You must provide a pickup location within 5 miles of your current location',
        value: true
      }
    });
    register('customer_location', {
      required: {
        message: 'You must provide a customer location within 5 miles of your current location',
        value: true
      }
    });
    register('number_of_items', {
      required: {
        message: 'You must specify the amount of items included in this job',
        value: true
      },
      valueAsNumber: true,
      max: {
        message: 'You can not create a job with more than 50 items',
        value: 50
      },
      min: {
        message: 'You must have at least 1 item for a job to be created',
        value: 1
      }
    });
  }

  const handleError = (modelName: string) => {
    if (modelName && errors[ modelName ]) {
      return (<Text style={styles.errorText}>{errors[ modelName ].message}</Text>);
    }

    return undefined;
  }

  return (
    <SafeAreaView style={styles.host}>
      <>
        <Header main="Create" sub="job" showBackButton={true} />

        {
          isLoading
            ? <Loader />
            : <KeyboardAvoidingView behavior={'padding'} style={styles.keyboardView}>
              <Text style={{ marginBottom: 8 }}>Payout (£) {riderPayout > 0 ? <Text>- Rider will recieve £{riderPayout}</Text> : undefined}</Text>

              <Input keyboardType={'numbers-and-punctuation'} onChange={value => setCostAndCalculateRiderPayout(value)} />

              {handleError('payout')}

              <Text style={{ marginBottom: 8 }}>Pickup location</Text>

              <LocationPicker height={46} onChange={value => setValue('pickup_location', value)} />

              {handleError('pickup_location')}

              <Text style={{ marginBottom: 8 }}>Customer location</Text>

              <LocationPicker height={46} onChange={value => setValue('customer_location', value)} />

              {handleError('customer_location')}

              <Text style={{ marginBottom: 8 }}>Number of items</Text>

              <Input keyboardType={'numbers-and-punctuation'} onChange={value => setValue('number_of_items', value)} />

              {handleError('number_of_items')}

              <Button type="primary" title="Create job" onPress={handleSubmit(onSubmit)} loading={isSubmitting} ></Button>
            </KeyboardAvoidingView>
        }
      </>
    </SafeAreaView >
  );
}
