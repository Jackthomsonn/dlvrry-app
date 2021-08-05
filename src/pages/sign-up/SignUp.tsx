import { AccountType, ModeType, VerificationStatus } from 'dlvrry-common';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';

import { Button } from '../../components/button';
import DropDownPicker from 'react-native-dropdown-picker';
import { Header } from '../../components/header';
import { Input } from '../../components/input';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User } from '../../services/user';
import firebase from 'firebase';
import { useForm } from 'react-hook-form';
import { variables } from '../../../Variables';

const styles = StyleSheet.create({
  host: {
    flex: 1,
    backgroundColor: variables.pageBackgroundColor
  },
  errorText: {
    color: variables.warning,
    fontWeight: '700',
    marginBottom: 24
  },
  keyboardAvoidingView: {
    flex: 1
  }
});

export function SignUpScreen() {
  const { register, handleSubmit, setValue, errors, getValues, setError } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [isSigningupAsARider, setIsSigningupAsARider] = useState(true);

  useEffect(() => {
    register('name', {
      required: {
        message: 'You must provide a name',
        value: true
      }
    });

    register('account_type', {
      required: true
    });

    register('email', {
      required: {
        message: 'You must provide an email',
        value: true
      }
    });

    register('password', {
      required: {
        message: 'You must provide a password',
        value: true
      }
    });

    register('mode', {
      required: {
        message: 'You must provide a mode of transport you will be using to deliver goods',
        value: false
      }
    });

    register('firebaseErrors');

    setValue('account_type', AccountType.RIDER);
    setValue('mode', ModeType.BICYCLING);
  }, [register])

  const onSubmit = async () => {
    setIsLoading(true);

    try {
      const result = await firebase.auth().createUserWithEmailAndPassword(
        getValues('email'),
        getValues('password')
      );

      const account_type = getValues('account_type');

      const generic_update_object = {
        account_type: account_type,
        id: result.user.uid,
        name: getValues('name'),
      }

      const rider_update_object = {
        mode: getValues('mode'),
        verification_status: VerificationStatus.PENDING,
      }

      firebase.firestore().collection('users').doc(result.user.uid).onSnapshot(async (user) => {
        if (user.data().account_type !== AccountType.NONE) {
          User.authenticated.next(result.user);

          return;
        }

        if (account_type === AccountType.RIDER) {
          await User.updateUser(result.user.uid, {
            ...generic_update_object,
            ...rider_update_object,
          });
        } else {
          await User.updateUser(result.user.uid, {
            ...generic_update_object,
          });
        }

        User.authenticated.next(result.user);
      })

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false)
      setError('firebaseErrors', { message: error.message })
    }
  }

  return (
    <SafeAreaView style={styles.host}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "position" : "height"}>
        <Header main="Get" sub="started" showBackButton={true} />
        <View style={{ margin: 24 }}>
          <Text style={{ marginTop: 24, marginBottom: 8 }}>Account type</Text>
          <DropDownPicker
            defaultValue={AccountType.RIDER}
            items={[
              { label: 'Rider', value: AccountType.RIDER },
              { label: 'Business', value: AccountType.BUSINESS, }
            ]}
            containerStyle={{ height: 40, marginBottom: 12 }}
            itemStyle={{ justifyContent: 'flex-start' }}
            onChangeItem={response => {
              setValue('account_type', response.value);

              setIsSigningupAsARider(response.value === AccountType.RIDER);
            }}
          />

          {
            errors.account_type
              ? <Text style={styles.errorText}>{errors.account_type.message}</Text>
              : undefined
          }

          <Text style={{ marginBottom: 8, marginTop: 12 }}>{isSigningupAsARider ? 'Your name' : 'Your business name'}</Text>
          <Input onChange={value => setValue('name', value)} />

          {
            errors.name
              ? <Text style={styles.errorText}>{errors.name.message}</Text>
              : undefined
          }

          {
            isSigningupAsARider
              ? <>
                <Text style={{ marginBottom: 8, marginTop: 12 }}>How will you be delivering goods?</Text>
                <DropDownPicker
                  placeholder={'Select a mode of transport'}
                  defaultValue={ModeType.BICYCLING}
                  items={[
                    { label: 'Bike', value: ModeType.BICYCLING },
                    { label: 'Car', value: ModeType.DRIVING },
                  ]}
                  containerStyle={{ height: 40, marginBottom: 12 }}
                  itemStyle={{ justifyContent: 'flex-start' }}
                  onChangeItem={response => { setValue('mode', response.value) }}
                />

                {
                  errors.mode
                    ? <Text style={styles.errorText}>{errors.mode.message}</Text>
                    : undefined
                }
              </>
              : undefined
          }

          <Text style={{ marginBottom: 8, marginTop: 12 }}>Email</Text>
          <Input keyboardType={'email-address'} onChange={value => setValue('email', value)} />

          {
            errors.email
              ? <Text style={styles.errorText}>{errors.email.message}</Text>
              : undefined
          }

          <Text style={{ marginBottom: 8, marginTop: 12 }}>Password</Text>
          <Input secureTextEntry={true} onChange={value => setValue('password', value)} />

          {
            errors.password
              ? <Text style={styles.errorText}>{errors.password.message}</Text>
              : undefined
          }

          {
            errors.firebaseErrors
              ? <Text style={styles.errorText}>{errors.firebaseErrors.message}</Text>
              : undefined
          }

          <Text style={{ fontWeight: '500' }}>By clicking the 'Get Started' button below you accept the terms and conditions set out by us, Dlvrry</Text>

          <View style={{ marginTop: 12 }}>
            <Button showIcon={true} type="primary" title="Get started" onPress={handleSubmit(onSubmit)} loading={isLoading}></Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView >
  );
}
