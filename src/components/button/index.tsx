import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import React from 'react';
import { TouchableOpacity } from "react-native-gesture-handler";
import { variables } from '../../../Variables';

const styles = StyleSheet.create({
  primary: {
    backgroundColor: variables.primaryColor,
    borderRadius: 4,
    padding: 16
  },
  primaryNoBorder: {
    borderColor: variables.primaryColor,
    borderWidth: 1,
    borderRadius: 4,
    padding: 16
  },
  secondary: {
    backgroundColor: variables.secondaryColor,
    borderRadius: 4,
    padding: 16
  },
  disabled: {
    backgroundColor: variables.disabledColor,
    borderRadius: 4,
    padding: 8,
  },
  primaryText: {
    color: variables.light,
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 16
  },
  primaryNoBorderText: {
    color: variables.primaryColor,
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 16
  },
  secondaryText: {
    color: variables.light,
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 16
  },
  lightText: {
    color: variables.dark,
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 16
  },
  disabledText: {
    color: variables.disabledTextColor
  }
});

interface ButtonProps {
  onPress: Function;
  title: string;
  type: 'primary' | 'primaryNoBorder' | 'secondary' | 'disabled' | 'light';
  loading?: boolean;
  loaderColor?: string;
}

export const Button = (props: ButtonProps) => {
  return (
    <TouchableOpacity style={styles[ props.type ]} onPress={() => props.onPress()}>
      {
        props.loading
          ? <ActivityIndicator color={props.loaderColor ? props.loaderColor : variables.light} size={15} />
          : <Text style={styles[ props.type + 'Text' ]}> {props.title}</Text>
      }
    </TouchableOpacity>
  )
}
