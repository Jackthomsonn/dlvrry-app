import { IJob, IUser } from "dlvrry-common";
import { KeyboardAvoidingView, StyleSheet, Text } from "react-native";
import React, { useEffect, useState } from "react";

import { Button } from "../../components/button";
import { CardService } from "../../services/card";
import { Header } from "../../components/header";
import { Input } from "../../components/input";
import { Job } from "../../services/job";
import { Loader } from "../../components/loader";
import { LocationPicker } from "../../components/location-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { User } from "../../services/user";
import { useDocumentData } from "react-firebase-hooks/firestore";
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

  const [ isSubmitting, setIsSubmitting ] = useState(false);
  const [ user ] = useDocumentData<IUser>(User.getUser(User.storedUserId));

  const { register, handleSubmit, setValue, errors } = useForm();

  const onSubmit = async (job: IJob) => {
    setIsSubmitting(true);

    try {
      const response = await Job.createJob(job, user?.id);

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
      alert(e);
    }
  }

  useEffect(() => {
    setup();
  }, [ register ]);

  const setup = async () => {
    register('cost', {
      required: {
        message: 'You must specify the cost of this job',
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
          <KeyboardAvoidingView behavior={'padding'} style={styles.keyboardView}>
            <Text style={{ marginBottom: 8 }}>Cost (£)</Text>

            <Input keyboardType={'numbers-and-punctuation'} onChange={value => setValue('cost', value * 100)} />

            {handleError('cost')}

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
