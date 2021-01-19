import { ActivityIndicator, Text, View } from "react-native"

import React from "react";

interface LoaderProps {
  text?: string
}

export const Loader = (props: LoaderProps) => {
  return (
    <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
      <ActivityIndicator />
      {
        props.text
          ? <Text>{props.text}</Text>
          : undefined
      }
    </View>
  );
}
