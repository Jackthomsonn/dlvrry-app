import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";

import { Button } from "../../components/button";
import { CardService } from "../../services/card";
import { Header } from "../../components/header";
import { IJob } from "dlvrry-common";
import { Input } from "../../components/input";
import { Job } from "../../services/job";
import { LocationPicker } from "../../components/location-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { User } from "../../services/user";
import { useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { variables } from "../../../Variables";
import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js"

const styles = StyleSheet.create({
  host: {
    display: 'flex',
    flex: 1,
    backgroundColor: variables.pageBackgroundColor
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [sessionToken, setSessionToken] = useState("");

  const { register, handleSubmit, setValue, errors } = useForm();

  const onSubmit = async (job: IJob) => {
    setIsSubmitting(true);

    try {
      const response = await Job.createJob(job, User.storedUserId);

      if (response.data.completed) {
        setIsSubmitting(false);
        navigation.goBack();
      } else {
        setIsSubmitting(false);

        const authCompleted = CardService.authenticationCompleted.subscribe((result) => {
          if (!result.completed) {
            alert(result.message);
          }

          navigation.goBack();
          authCompleted.unsubscribe();
        });

        navigation.navigate('AuthenticatePayment', {
          client_secret: response.data.client_secret,
          payment_method_id: response.data.payment_method_id
        });
      }
    } catch (e) {
      setIsSubmitting(false);
      alert(e.message);
    }
  }

  useEffect(() => {
    setup();
  }, [register]);

  const setup = async () => {
    register('cost', {
      required: {
        message: 'You must specify the cost of this job',
        value: true
      },
      min: {
        message: 'You must enter a minimum amount of £5',
        value: 500,
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
    register('customer_location_name');
    register('pickup_location_name');
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
    register('phone_number', {
      required: {
        message: 'You must specify the customer phone number for parcel tracking',
        value: true,
      },
      validate: (number) => {
        console.log(number)
        if (!isValidPhoneNumber(number, "GB")) {
          return "You must provide a valid phone number"
        }
      },
      setValueAs: (number) => {

        console.log("PARSE")
        return parsePhoneNumber(number, "GB").number;
      }
    });

    setSessionToken(new Date().valueOf().toString());
  }

  const handleError = (modelName: string) => {
    if (modelName && errors[modelName]) {
      return (<Text style={styles.errorText}>{errors[modelName].message}</Text>);
    }

    return undefined;
  }

  return (
    <SafeAreaView style={styles.host}>
      <>
        {
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "position" : "height"} keyboardVerticalOffset={100}>
            <Header main="Create" sub="job" showBackButton={true} />

            <View style={{ margin: 24 }}>
              <Text style={{ marginBottom: 8 }}>Cost (£)</Text>

              <Input keyboardType={'numbers-and-punctuation'} onChange={value => setValue('cost', value * 100)} />

              {handleError('cost')}

              <Text style={{ marginBottom: 8 }}>Number of items</Text>

              <Input keyboardType={'numbers-and-punctuation'} onChange={value => setValue('number_of_items', value)} />

              {handleError('number_of_items')}

              <Text style={{ marginBottom: 8 }}>Customer phone number (For delivery notifications)</Text>

              <Input keyboardType={'number-pad'} onChange={value => setValue('phone_number', value)} />

              {handleError('phone_number')}

              <Text style={{ marginBottom: 8 }}>Pickup location</Text>

              <LocationPicker sessionToken={sessionToken} height={46} onChange={({ latitude, longitude, streetNumber, streetName }) => {
                setValue('pickup_location', { latitude, longitude })
                setValue('pickup_location_name', `${streetNumber} ${streetName}`)
              }} />

              {handleError('pickup_location')}

              <Text style={{ marginBottom: 8 }}>Customer location</Text>

              <LocationPicker sessionToken={sessionToken} height={46} onChange={({ latitude, longitude, streetNumber, streetName }) => {
                setValue('customer_location', { latitude, longitude })
                setValue('customer_location_name', `${streetNumber} ${streetName}`)
              }} />

              {handleError('customer_location')}

              <Button showIcon={true} type="primary" title="Create job" onPress={handleSubmit(onSubmit)} loading={isSubmitting} ></Button>
            </View>
          </KeyboardAvoidingView>
        }
      </>
    </SafeAreaView >
  );
}
