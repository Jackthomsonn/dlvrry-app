import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity } from "react-native-gesture-handler";
import { variables } from '../../../Variables';

const styles = StyleSheet.create({
  primary: {
    backgroundColor: variables.primaryColor,
    borderRadius: 4,
    padding: 16
  },
  small: {
    padding: 8
  },
  medium: {
    padding: 14
  },
  large: {
    padding: 16
  },
  primaryBorder: {
    borderColor: variables.primaryColor,
    borderWidth: 1,
    borderRadius: 4,
    padding: 16
  },
  lightBorder: {
    borderColor: variables.light,
    borderWidth: 1,
    borderRadius: 4,
    padding: 16
  },
  link: {
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
    fontSize: 16,
    ...variables.fontStyle
  },
  primaryBorderText: {
    color: variables.primaryColor,
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 16,
    ...variables.fontStyle
  },
  lightBorderText: {
    color: variables.light,
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 16,
    ...variables.fontStyle
  },
  linkText: {
    color: variables.secondaryColor,
    textAlign: 'center',
  },
  secondaryText: {
    color: variables.light,
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 16,
    ...variables.fontStyle
  },
  lightText: {
    color: variables.secondaryColor,
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 16,
    ...variables.fontStyle
  },
  disabledText: {
    color: variables.disabledTextColor
  }
});

interface ButtonProps {
  onPress: Function;
  title: string;
  type: 'primary' | 'primaryBorder' | 'secondary' | 'disabled' | 'light' | 'link' | 'lightBorder';
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  iconColor?: string;
  loading?: boolean;
  loaderColor?: string;
}

export const Button = (props: ButtonProps) => {
  return (
    <TouchableOpacity hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }} style={[styles[props.type], styles[props.size]]} onPress={() => props.onPress()}>
      {
        props.loading
          ? <>
            <View style={{ padding: 4 }}>
              <ActivityIndicator color={props.loaderColor ? props.loaderColor : variables.light} size={15} />
            </View>
          </>
          :
          <>
            <View style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles[props.type + 'Text']}>{props.title}</Text>
              {props.showIcon ? <Ionicons name="md-arrow-forward" size={22} color={props.iconColor ? props.iconColor : variables.light} /> : undefined}
            </View>
          </>
      }
    </TouchableOpacity>
  )
}
