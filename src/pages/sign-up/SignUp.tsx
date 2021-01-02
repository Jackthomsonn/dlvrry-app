import { KeyboardAvoidingView, StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';

import { AccountType } from '@dlvrry/dlvrry-common';
import AsyncStorage from '@react-native-community/async-storage';
import { Button } from '../../components/button';
import DropDownPicker from 'react-native-dropdown-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StorageKey } from '../../enums/Storage.enum';
import { TextInput } from 'react-native-gesture-handler';
import { User } from '../../services/user';
import firebase from 'firebase';
import { useForm } from 'react-hook-form';
import { variables } from '../../../Variables';

const styles = StyleSheet.create({
  host: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFF'
  },
  header: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 12
  },
  input: {
    borderColor: variables.disabledColor,
    borderWidth: 2,
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
  }
});

export function SignUpScreen() {
  const { register, handleSubmit, setValue, errors, getValues, setError } = useForm();

  useEffect(() => {
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

    register('all');

    setValue('account_type', AccountType.RIDER)
  }, [ register ])

  const onSubmit = async () => {
    try {
      const result = await firebase.auth().createUserWithEmailAndPassword(
        getValues('email'),
        getValues('password')
      );

      await AsyncStorage.setItem(StorageKey.USER_DATA, JSON.stringify(result.user));

      await User.updateUser(result.user.uid, { account_type: getValues('account_type') });

    } catch (error) {
      setError('all', { message: error.message })
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
      <View style={{ paddingTop: 24, paddingLeft: 24, paddingRight: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <>
          <View style={{ flexDirection: 'row', flex: 1 }}>
            <Text style={{ color: variables.dark, fontWeight: '700', fontSize: 32 }}>Get</Text>
            <Text style={{ color: variables.dark, fontWeight: '300', fontSize: 32 }}> started</Text>
          </View>
        </>
      </View>

      <KeyboardAvoidingView behavior="padding" style={{ margin: 24 }}>
        <Text style={{ marginBottom: 8 }}>Account type</Text>
        <DropDownPicker
          defaultValue="rider"
          items={[
            { label: 'Rider', value: AccountType.RIDER },
            { label: 'Business', value: AccountType.BUSINESS, }
          ]}
          containerStyle={{ height: 40, marginBottom: 8 }}
          itemStyle={{
            justifyContent: 'flex-start'
          }}
          onChangeItem={response => setValue('account_type', response.value)}
        />

        {
          errors.account_type
            ? <Text style={{ color: variables.warning, fontWeight: '700', marginBottom: 24 }}>{errors.account_type.message}</Text>
            : undefined
        }

        <Text style={{ marginBottom: 8 }}>Email</Text>
        <TextInput style={styles.input} onChangeText={value => setValue('email', value)}></TextInput>

        {
          errors.email
            ? <Text style={{ color: variables.warning, fontWeight: '700', marginBottom: 24 }}>{errors.email.message}</Text>
            : undefined
        }

        <Text style={{ marginBottom: 8 }}>Password</Text>
        <TextInput style={styles.input} secureTextEntry={true} onChangeText={value => setValue('password', value)}></TextInput>

        {
          errors.password
            ? <Text style={{ color: variables.warning, fontWeight: '700', marginBottom: 24 }}>{errors.password.message}</Text>
            : undefined
        }

        {
          errors.all
            ? <Text style={{ color: variables.warning, fontWeight: '700', marginBottom: 24 }}>{errors.all.message}</Text>
            : undefined
        }

        <Button type="primary" title="Get started" onPress={handleSubmit(onSubmit)}></Button>
      </KeyboardAvoidingView>
    </SafeAreaView >
  );
}
