import React, { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";

import AsyncStorage from "@react-native-community/async-storage";
import { Button } from "../../components/button";
import { IJob } from "../../../../dlvrry-backend/functions/src/interfaces/IJob";
import { IUserData } from "../../interfaces/IUserData";
import { Job } from "../../services/job";
import { PaymentService } from "../../services/payment";
import { SafeAreaView } from "react-native-safe-area-context";
import { StorageKey } from "../../enums/Storage.enum";
import percentage from 'calculate-percentages';
import { useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { variables } from "../../../Variables";

export const CreateJobScreen = () => {
  const navigation = useNavigation();

  const [ riderPayout, setRiderPayout ] = useState(undefined);
  const { register, handleSubmit, setValue, errors, getValues } = useForm();

  const onSubmit = (job: IJob) => {
    job.cost = job.payout * 100;
    job.payout = riderPayout * 100;

    navigation.navigate('Payment', { cost: job.cost });

    const completedSubscription = PaymentService.completed.subscribe(async (isComplete) => {
      const userData = await AsyncStorage.getItem(StorageKey.USER_DATA);
      const user: IUserData = JSON.parse(userData);

      if (isComplete) {
        await Job.createJob(job, user.uid);

        navigation.goBack();

        completedSubscription.unsubscribe();
      }
    });
  }

  const calculateRiderPayout = () => {
    const wholeAmount = Number(getValues('payout'));

    const paymentFee = percentage.of(2.9, wholeAmount) + 0.20;
    const dlvrryFee = percentage.of(2.5, wholeAmount) + 0.20;
    const amountAfterAllFees = wholeAmount - paymentFee - dlvrryFee;

    const payoutFee = percentage.of(0.25, wholeAmount) + 0.10;
    const amountAfterPayoutFee = amountAfterAllFees - payoutFee;

    setRiderPayout((amountAfterPayoutFee).toFixed(2));
  }

  useEffect(() => {
    register('payout', {
      required: {
        message: 'You must specify how much the rider will recieve',
        value: true
      },
      min: {
        message: 'You must enter an amount greater than £5',
        value: 5
      },
      valueAsNumber: true
    });
    register('pickupLocation');
    register('customerLocation');
    register('numberOfItems', {
      required: {
        message: 'You must specify the amount of items exist for this job',
        value: true
      },
      valueAsNumber: true,
      max: {
        message: 'You can not create a job with more than 10 items',
        value: 10
      },
      min: {
        message: 'You must have at least 1 item for a job to be created',
        value: 1
      }
    });
  }, [ register ]);

  return (
    <SafeAreaView style={{ display: 'flex', flex: 1, backgroundColor: '#FFF' }}>
      <>
        <View style={{ paddingTop: 24, paddingLeft: 24, paddingRight: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <>
            <View style={{ flexDirection: 'row', flex: 1 }}>
              <Text style={{ color: variables.dark, fontWeight: '700', fontSize: 32 }}>Create</Text>
              <Text style={{ color: variables.dark, fontWeight: '300', fontSize: 32 }}> job</Text>
            </View>
          </>
        </View>
        <View style={{ padding: 24, flex: 1 }}>
          <Text style={{ marginBottom: 8 }}>Payout (£) {
            riderPayout > 0
              ? <Text>- Rider will recieve £{riderPayout}</Text>
              : undefined
          }
          </Text>

          <TextInput
            enablesReturnKeyAutomatically={true}
            keyboardType={'decimal-pad'}
            onChangeText={text => {
              setValue('payout', text);
              calculateRiderPayout();
            }}
            style={{ borderWidth: 1, borderRadius: 4, padding: 12, marginBottom: 12, borderColor: 'rgba(0, 0, 0, 0.1)' }}
          />

          {
            errors.payout
              ? <Text style={{ color: variables.warning, fontWeight: '700', marginBottom: 24 }}>{errors.payout.message}</Text>
              : undefined
          }

          <Text style={{ marginBottom: 8 }}>Pickup location</Text>

          <TextInput
            enablesReturnKeyAutomatically={true}
            onChangeText={text => setValue('pickupLocation', text)}
            style={{ borderWidth: 1, borderRadius: 4, padding: 12, marginBottom: 12, borderColor: 'rgba(0, 0, 0, 0.1)' }}
          />

          {
            errors.pickupLocation
              ? <Text style={{ color: variables.warning, fontWeight: '700', marginBottom: 24 }}>{errors.pickupLocation.message}</Text>
              : undefined
          }

          <Text style={{ marginBottom: 8 }}>Customer location</Text>

          <TextInput
            enablesReturnKeyAutomatically={true}
            onChangeText={text => setValue('customerLocation', text)}
            style={{ borderWidth: 1, borderRadius: 4, padding: 12, marginBottom: 12, borderColor: 'rgba(0, 0, 0, 0.1)' }}
          />

          {
            errors.customerLocation
              ? <Text style={{ color: variables.warning, fontWeight: '700', marginBottom: 24 }}>{errors.customerLocation.message}</Text>
              : undefined
          }

          <Text style={{ marginBottom: 8 }}>Number of items</Text>

          <TextInput
            enablesReturnKeyAutomatically={true}
            textContentType={'creditCardNumber'}
            onChangeText={text => setValue('numberOfItems', text)}
            style={{ borderWidth: 1, borderRadius: 4, padding: 12, marginBottom: 12, borderColor: 'rgba(0, 0, 0, 0.1)' }}
          />

          {
            errors.numberOfItems
              ? <Text style={{ color: variables.warning, fontWeight: '700', marginBottom: 24 }}>{errors.numberOfItems.message}</Text>
              : undefined
          }

          <Button type="primary" title="Create job" onPress={handleSubmit(onSubmit)}></Button>
        </View>
      </>
    </SafeAreaView>
  );
}
