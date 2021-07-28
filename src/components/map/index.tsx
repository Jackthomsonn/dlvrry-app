import * as Location from 'expo-location';

import { ActivityIndicator, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps"
import React, { useEffect, useState } from "react";

import Constants from 'expo-constants';
import MapViewDirections from "react-native-maps-directions"
import { variables } from '../../../Variables';

interface MapProps {
  customerAddress: {
    latitude: number,
    longitude: number
  },
  pickupAddress: {
    latitude: number,
    longitude: number
  },
  duration: Function,
}

export const Map = (props: MapProps) => {
  let map: MapView;

  const [usersCurrentLocation, setCurrentPosition] = useState<Location.LocationObject>(undefined);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setup();
  }, []);

  const setup = () => {
    Location.getCurrentPositionAsync({ accuracy: Location.LocationAccuracy.BestForNavigation }).then(location => {
      setCurrentPosition(location);
      setIsReady(true);
    })
  }

  return (
    isReady
      ? <MapView
        provider={PROVIDER_GOOGLE}
        ref={ref => { map = ref }}
        style={{
          display: 'flex',
          height: '100%',
          width: '100%'
        }}
        camera={{
          zoom: 16,
          center: {
            latitude: usersCurrentLocation?.coords.latitude,
            longitude: usersCurrentLocation?.coords.longitude,
          },
          altitude: usersCurrentLocation?.coords.altitude,
          pitch: 40,
          heading: usersCurrentLocation.coords.heading
        }}
        mapPadding={{ bottom: 100, top: 0, left: 0, right: 0 }}
        showsPointsOfInterest={false}
        showsCompass={true}
        loadingEnabled={true}
        showsUserLocation={true}>

        <MapViewDirections
          origin={{
            latitude: usersCurrentLocation?.coords.latitude,
            longitude: usersCurrentLocation?.coords.longitude
          }}
          waypoints={[{
            latitude: props.pickupAddress.latitude,
            longitude: props.pickupAddress.longitude
          }]}
          destination={{ latitude: props.customerAddress.latitude, longitude: props.customerAddress.longitude }}
          apikey={Constants.manifest.extra.apiKey}
          strokeWidth={3}
          strokeColor={variables.primaryColor}
          precision={'low'}
        />
        <Marker coordinate={{ latitude: props.pickupAddress.latitude, longitude: props.pickupAddress.longitude }} title={'Pickup location'}></Marker>
        <Marker coordinate={{ latitude: props.customerAddress.latitude, longitude: props.customerAddress.longitude }} title={'Customer location'}></Marker>
      </MapView >
      : <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <ActivityIndicator />
      </View>
  )
}