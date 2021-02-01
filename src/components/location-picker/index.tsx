import React, { useEffect, useRef, useState } from "react";

import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { View } from "react-native";

export const LocationPicker = (props: { height: number, onChange: Function }) => {
  const ref: any = useRef();
  const [ locationHeight, setLocationHeight ] = useState(props.height);

  useEffect(() => {
    setInterval(() => {
      if (ref && ref.current && ref.current.isFocused()) {
        setLocationHeight(240)
      }

      if (ref && ref.current && ref.current.isFocused()) {
        setLocationHeight(240)
      }
    }, 1000);
  }, []);

  return (
    <View style={{
      display: 'flex',
      flex: 1,
      minHeight: locationHeight,
      height: 'auto',
      borderWidth: 1,
      borderRadius: 4,
      marginBottom: 12,
      borderColor: 'rgba(0, 0, 0, 0.1)'
    }}>
      <GooglePlacesAutocomplete
        ref={ref}
        debounce={200}
        placeholder={''}
        renderDescription={row => row.description}
        fetchDetails={true}
        enablePoweredByContainer={false}
        onPress={(_data, details) => {
          setLocationHeight(46);
          props.onChange({
            latitude: details.geometry.location.lat,
            longitude: details.geometry.location.lng
          })
        }}
        query={{
          key: 'AIzaSyBcQkaIwOQN0mbW8aUhjXIVz2q22cywbbU',
          sessiontoken: new Date().valueOf(),
          language: 'en'
        }}
      />
    </View>
  )
}