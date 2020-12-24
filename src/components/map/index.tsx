import * as Location from 'expo-location';

import { ActivityIndicator, Text, View } from 'react-native';
import MapView, { Marker } from "react-native-maps"
import React, { useEffect, useState } from "react";

import Constants from 'expo-constants';
import MapViewDirections from "react-native-maps-directions"

export interface MapProps {
  customerAddress: {
    latitude: number,
    longitude: number
  },
  pickupAddress: {
    latitude: number,
    longitude: number
  }
}

export const Map = (props: MapProps) => {
  let map: MapView;

  const [ usersCurrentLocation, setUsersCurrentLocation ] = useState<Location.LocationObject>(undefined);
  const [ isReady, setIsReady ] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestPermissionsAsync();
      if (status !== 'granted') { }

      let location = await Location.getCurrentPositionAsync();

      setUsersCurrentLocation(location);

      setIsReady(true);
    })();
  }, []);

  return (
    isReady
      ? <MapView
        ref={ref => { map = ref }}
        style={{
          display: 'flex',
          height: '70%',
          width: '100%'
        }}
        provider={'google'}
        initialCamera={{
          zoom: 1000,
          center: {
            latitude: usersCurrentLocation?.coords.latitude,
            longitude: usersCurrentLocation?.coords.longitude
          },
          altitude: 1,
          pitch: 50,
          heading: 0
        }}
        onUserLocationChange={(e) => {
          map.animateCamera({
            center: {
              latitude: e.nativeEvent.coordinate.latitude,
              longitude: e.nativeEvent.coordinate.longitude
            }
          })
        }}
        showsUserLocation={true}
        followsUserLocation={true} >

        <MapViewDirections
          origin={{
            latitude: usersCurrentLocation?.coords.latitude,
            longitude: usersCurrentLocation?.coords.longitude
          }}
          waypoints={[ {
            latitude: props.pickupAddress.latitude,
            longitude: props.pickupAddress.longitude
          } ]}
          destination={{ latitude: props.customerAddress.latitude, longitude: props.customerAddress.longitude }}
          apikey={Constants.manifest.extra.apiKey}
          strokeWidth={3}
          strokeColor={'hotpink'}
          precision={'high'}
        />
        <Marker coordinate={{ latitude: props.pickupAddress.latitude, longitude: props.pickupAddress.longitude }} title={'Pickup location'}></Marker>
        <Marker coordinate={{ latitude: props.customerAddress.latitude, longitude: props.customerAddress.longitude }} title={'Customer location'}></Marker>
      </MapView >
      : <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <ActivityIndicator />
      </View>
  )
}