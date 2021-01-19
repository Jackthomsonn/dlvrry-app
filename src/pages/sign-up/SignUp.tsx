import { KeyboardAvoidingView, StyleSheet, Text } from 'react-native';
import React, { useEffect, useState } from 'react';

import { AccountType } from 'dlvrry-common';
import { Button } from '../../components/button';
import DropDownPicker from 'react-native-dropdown-picker';
import { Header } from '../../components/header';
import { Input } from '../../components/input';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from 'react-native-gesture-handler';
import { User } from '../../services/user';
import firebase from 'firebase';
import { useForm } from 'react-hook-form';
import { variables } from '../../../Variables';

const styles = StyleSheet.create({
  host: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  keyboardView: {
    margin: 24
  },
  errorText: {
    color: variables.warning,
    fontWeight: '700',
    marginBottom: 24
  }
});

export function SignUpScreen() {
  const { register, handleSubmit, setValue, errors, getValues, setError } = useForm();
  const [ isLoading, setIsLoading ] = useState(false);

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

    register('firebaseErrors');

    setValue('account_type', AccountType.RIDER)
  }, [ register ])

  const onSubmit = async () => {
    setIsLoading(true);

    try {
      const result = await firebase.auth().createUserWithEmailAndPassword(
        getValues('email'),
        getValues('password')
      );

      await User.updateUser(result.user.uid, {
        account_type: getValues('account_type'),
        id: result.user.uid,
        name: getValues('name')
      });

      User.authenticated.next(result.user !== null);

      setIsLoading(false);
    } catch (error) {
      setError('firebaseErrors', { message: error.message })
    }
  }

  return (
    <SafeAreaView style={styles.host}>
      <Header main="Get" sub="started" showBackButton={true} />

      <KeyboardAvoidingView behavior="padding" style={styles.keyboardView}>
        <Text style={{ marginBottom: 8 }}>Account type</Text>
        <DropDownPicker
          defaultValue="rider"
          items={[
            { label: 'Rider', value: AccountType.RIDER },
            { label: 'Business', value: AccountType.BUSINESS, }
          ]}
          containerStyle={{ height: 40, marginBottom: 8 }}
          itemStyle={{ justifyContent: 'flex-start' }}
          onChangeItem={response => setValue('account_type', response.value)}
        />

        {
          errors.account_type
            ? <Text style={styles.errorText}>{errors.account_type.message}</Text>
            : undefined
        }

        <Text style={{ marginBottom: 8 }}>Your name / Business name</Text>
        <Input onChange={value => setValue('name', value)} />

        {
          errors.name
            ? <Text style={styles.errorText}>{errors.name.message}</Text>
            : undefined
        }

        <Text style={{ marginBottom: 8 }}>Email</Text>
        <Input keyboardType={'email-address'} onChange={value => setValue('email', value)} />

        {
          errors.email
            ? <Text style={styles.errorText}>{errors.email.message}</Text>
            : undefined
        }

        <Text style={{ marginBottom: 8 }}>Password</Text>
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

        <Button type="primary" title="Get started" onPress={handleSubmit(onSubmit)} loading={isLoading}></Button>
      </KeyboardAvoidingView>
    </SafeAreaView >
  );
}
