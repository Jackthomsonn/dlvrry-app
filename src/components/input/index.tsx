import { KeyboardTypeOptions, StyleSheet, TextInput, View } from "react-native"

import React from "react"
import { variables } from "../../../Variables";

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    height: 42,
    marginBottom: 12,
    backgroundColor: variables.light,
    borderColor: 'rgba(0, 0, 0, 0.1)'
  }
});

interface InputProps {
  onChange: Function,
  keyboardType?: KeyboardTypeOptions,
  secureTextEntry?: boolean,
  textContentType?: 'URL'
  | 'addressCity'
  | 'addressCityAndState'
  | 'addressState'
  | 'countryName'
  | 'creditCardNumber'
  | 'emailAddress'
  | 'familyName'
  | 'fullStreetAddress'
  | 'givenName'
  | 'jobTitle'
  | 'location'
  | 'middleName'
  | 'name'
  | 'namePrefix'
  | 'nameSuffix'
  | 'nickname'
  | 'organizationName'
  | 'postalCode'
  | 'streetAddressLine1'
  | 'streetAddressLine2'
  | 'sublocality'
  | 'telephoneNumber'
  | 'username'
  | 'password'
  | 'newPassword'
  | 'oneTimeCode'
  | 'none';
}

export const Input = (props: InputProps) => {
  return (
    <View style={styles.input}>
      <TextInput
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        secureTextEntry={props.secureTextEntry}
        keyboardType={props.keyboardType}
        onChangeText={value => props.onChange(value)}
        enablesReturnKeyAutomatically={true}
        textContentType={props.textContentType}>
      </TextInput>
    </View >
  )
}