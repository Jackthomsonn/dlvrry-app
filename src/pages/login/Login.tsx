import { KeyboardAvoidingView, StyleSheet, Text } from 'react-native';
import React, { useEffect, useState } from 'react';

import { Button } from '../../components/button';
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
  }
});

export function LoginScreen() {
  const { register, handleSubmit, setValue, errors, getValues, setError } = useForm();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
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
  }, [register])

  const onSubmit = async () => {
    setIsLoading(true);

    try {
      const result = await firebase.auth().signInWithEmailAndPassword(
        getValues('email'),
        getValues('password')
      );

      User.authenticated.next(result.user);
    } catch (e) {
      setIsLoading(false);
      setError('firebaseErrors', { message: e.message })
    }
  }

  return (
    <SafeAreaView style={styles.host}>
      <Header main="Login" sub="to get started" showBackButton={true} />

      <KeyboardAvoidingView behavior="padding" style={{ margin: 24 }}>
        <Text style={{ marginBottom: 8 }}>Email</Text>
        <Input textContentType={'username'} onChange={value => setValue('email', value)} />

        {
          errors.email
            ? <Text style={styles.errorText}>{errors.email.message}</Text>
            : undefined
        }

        <Text style={{ marginBottom: 8 }}>Password</Text>
        <Input textContentType={'password'} secureTextEntry={true} onChange={value => setValue('password', value)} />

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

        <Button showIcon={true} type="primary" title="Login" onPress={handleSubmit(onSubmit)} loading={isLoading}></Button>
      </KeyboardAvoidingView>
    </SafeAreaView >
  );
}
