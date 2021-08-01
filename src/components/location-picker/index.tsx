import * as Location from 'expo-location';

import React, { useEffect, useRef, useState } from "react";
import { View } from 'react-native';

import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { Loader } from '../loader';

export const LocationPicker = (props: { height: number, onChange: Function, sessionToken: string }) => {
  const ref: any = useRef();
  const [locationHeight, setLocationHeight] = useState(props.height);
  const [currentLocation, setCurrentLocation] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setInterval(() => {
      if (ref?.current?.isFocused()) {
        setLocationHeight(240)
      }

      if (!ref?.current?.isFocused()) {
        setLocationHeight(props.height)
      }
    }, 1000);

    setup();
  }, []);

  const setup = async () => {
    let location = await Location.getCurrentPositionAsync({ accuracy: Location.LocationAccuracy.BestForNavigation });

    setCurrentLocation(`${location.coords.latitude}, ${location.coords.longitude}`);

    setIsLoading(false);
  }

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
      {
        !isLoading
          ? <GooglePlacesAutocomplete
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
                longitude: details.geometry.location.lng,
                streetNumber: details.address_components[0].long_name,
                streetName: details.address_components[1].long_name,
              })
            }}
            query={{
              location: currentLocation,
              radius: '8100',
              strictbounds: true,
              key: 'AIzaSyCGDPRUz_vTChg2QDg-qMRlhxz7hGVlFFs',
              sessiontoken: props.sessionToken,
              language: 'en'
            }}
          />
          : <Loader />
      }
    </View>
  )
}