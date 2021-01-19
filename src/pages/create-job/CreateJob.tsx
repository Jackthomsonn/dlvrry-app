import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import React, { createRef, useEffect, useRef, useState } from "react";

import { Button } from "../../components/button";
import { FlatList } from "react-native-gesture-handler";
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Header } from "../../components/header";
import { IJob } from "dlvrry-common";
import { Input } from "../../components/input";
import { Job } from "../../services/job";
import { Loader } from "../../components/loader";
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
  const pickupLocationRef: any = useRef();
  const customerPickupRef: any = useRef();
  const navigation = useNavigation();

  const [ pickupLocationHeight, setPickupLocationHeight ] = useState(46);
  const [ customerLocationHeight, setuCustomerLocationHeight ] = useState(46);
  const [ isLoading, setIsLoading ] = useState(false);
  const [ sessionToken, setSessionToken ] = useState(undefined);
  const [ riderPayout, setRiderPayout ] = useState(undefined);
  const { register, handleSubmit, setValue, errors, getValues } = useForm();

  const onSubmit = async (job: IJob) => {
    setIsLoading(true);

    job.cost = job.payout * 100;
    job.payout = riderPayout * 100;

    try {
      await Job.createJob(job, User.storedUser.id);

      setIsLoading(false);
      navigation.goBack();
    } catch (e) {
      setIsLoading(false);
      alert(e);
    }
  }

  const setCostAndCaluclateRiderPayout = (value: any) => {
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

    const sessionToken = await Session.createToken();

    setSessionToken(sessionToken.data);

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
    register('pickup_location');
    register('customer_location');
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

    setInterval(() => {
      if (customerPickupRef && customerPickupRef.current && customerPickupRef.current.isFocused()) {
        setuCustomerLocationHeight(240)
      }

      if (pickupLocationRef && pickupLocationRef.current && pickupLocationRef.current.isFocused()) {
        setPickupLocationHeight(240)
      }
    }, 1000);
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

              <Input keyboardType={'numbers-and-punctuation'} onChange={value => setCostAndCaluclateRiderPayout(value)} />

              {
                errors.payout
                  ? <Text style={styles.errorText}>{errors.payout.message}</Text>
                  : undefined
              }

              <Text style={{ marginBottom: 8 }}>Pickup location</Text>

              <View style={{
                display: 'flex',
                flex: 1,
                minHeight: pickupLocationHeight,
                height: 'auto',
                borderWidth: 1,
                borderRadius: 4,
                marginBottom: 12,
                borderColor: 'rgba(0, 0, 0, 0.1)'
              }}>
                <GooglePlacesAutocomplete
                  ref={pickupLocationRef}
                  debounce={200}
                  placeholder={''}
                  renderDescription={row => row.description}
                  fetchDetails={true}
                  enablePoweredByContainer={false}
                  onPress={(_data, details) => {
                    setPickupLocationHeight(46);
                    setValue('pickup_location', {
                      latitude: details.geometry.location.lat,
                      longitude: details.geometry.location.lng
                    })
                  }}
                  query={{
                    key: 'AIzaSyBcQkaIwOQN0mbW8aUhjXIVz2q22cywbbU',
                    sessiontoken: sessionToken,
                    language: 'en',
                  }}
                />
              </View>

              {
                errors.pickup_location
                  ? <Text style={styles.errorText}>{errors.pickup_location.message}</Text>
                  : undefined
              }

              <Text style={{ marginBottom: 8 }}>Customer location</Text>

              <View style={{
                display: 'flex',
                flex: 1,
                minHeight: customerLocationHeight,
                height: 'auto',
                borderWidth: 1,
                borderRadius: 4,
                marginBottom: 12,
                borderColor: 'rgba(0, 0, 0, 0.1)'
              }}>
                <GooglePlacesAutocomplete
                  ref={customerPickupRef}
                  debounce={200}
                  placeholder={''}
                  renderDescription={row => row.description}
                  fetchDetails={true}
                  enablePoweredByContainer={false}
                  onPress={(_data, details) => {
                    setuCustomerLocationHeight(46);
                    setValue('customer_location', {
                      latitude: details.geometry.location.lat,
                      longitude: details.geometry.location.lng
                    })
                  }}
                  query={{
                    key: 'AIzaSyBcQkaIwOQN0mbW8aUhjXIVz2q22cywbbU',
                    sessiontoken: sessionToken,
                    language: 'en',
                  }}
                />
              </View>

              {
                errors.customer_location
                  ? <Text style={styles.errorText}>{errors.customer_location.message}</Text>
                  : undefined
              }

              <Text style={{ marginBottom: 8 }}>Number of items</Text>

              <Input keyboardType={'numbers-and-punctuation'} onChange={value => setValue('number_of_items', value)} />

              {
                errors.number_of_items
                  ? <Text style={styles.errorText}>{errors.number_of_items.message}</Text>
                  : undefined
              }

              <Button type="primary" title="Create job" onPress={handleSubmit(onSubmit)} loading={isLoading}></Button>
            </KeyboardAvoidingView>
        }
      </>
    </SafeAreaView >
  );
}
