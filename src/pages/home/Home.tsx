import { AccountType, IJob, IUser, JobStatus } from 'dlvrry-common';
import { Linking, Platform, SafeAreaView, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import Constants from 'expo-constants';
import { Button } from '../../components/button';
import { FlatList } from "react-native-gesture-handler";
import { Header } from '../../components/header';
import { Job } from "../../services/job";
import { JobCard } from '../../components/job-card';
import { Loader } from '../../components/loader';
import NoResultsSvg from '../../components/svg/no-results';
import { User } from "../../services/user";
import { variables } from '../../../Variables';

import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import SuspendedSvg from '../../components/svg/suspended';
import WaitingSvg from '../../components/svg/waiting';

const styles = StyleSheet.create({
  host: {
    flex: 1,
    backgroundColor: variables.pageBackgroundColor
  }
});

export function HomeScreen() {
  const navigation = useNavigation();

  const [businessHasConnectedCard, setBusinessHasConnectedCard] = useState(false);
  const [user] = useDocumentData<IUser>(User.getUser(User.storedUserId));
  const [allowsLocation, setAllowsLocation] = useState(true);

  const [allJobs, allJobsLoading, allJobsError] = useCollectionData<IJob>(
    user?.account_type === AccountType.RIDER
      ? Job.getJobs([JobStatus.PENDING, JobStatus.CANCELLED_BY_RIDER])
      : Job.getJobsForBusiness(User.storedUserId, [
        JobStatus.PENDING,
        JobStatus.CANCELLED_BY_RIDER,
        JobStatus.IN_PROGRESS,
        JobStatus.REFUNDED,
        JobStatus.PAYMENT_FAILED,
        JobStatus.AWAITING_PAYMENT,
        JobStatus.CANCELLED_BY_OWNER,
        JobStatus.COMPLETED,
      ], 100)
  )

  const getConnectedCards = async () => {
    if (!user || !user.customer_id) {
      return;
    }

    const response = await User.getCards(user.customer_id);

    setBusinessHasConnectedCard(response.data.length > 0);
  }

  const riderView = () => {
    return (
      <>
        <Header main="Available" sub="jobs"></Header>
        <View style={{ flex: 1 }}>
          {
            user.cancelled_jobs >= 3
              ?
              <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <SuspendedSvg width={180} height={180} />
                <Text style={{ fontWeight: '500', color: variables.secondaryColor, fontSize: 16, ...variables.fontStyle, marginTop: 12, textAlign: 'center' }}>
                  Your account has been suspended. You have cancelled too many jobs in a short space of time. If you believe this is an error, please contact us at hello@dlvrry.io
                </Text>
              </View>
              :
              allJobs?.length > 0
                ? <FlatList showsVerticalScrollIndicator={false} data={allJobs} keyExtractor={(_item, index) => index.toString()} renderItem={({ item }) => {
                  return (
                    <View style={{ padding: 24 }}>
                      <JobCard user={user} job={item} account_type={user.account_type} />
                    </View>
                  )
                }}></FlatList>
                : <>
                  <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <NoResultsSvg width={180} height={180} />
                    <Text style={{ fontWeight: '500', color: variables.secondaryColor, fontSize: 16, ...variables.fontStyle, marginTop: 12, textAlign: 'center' }}>No jobs found. This page will update automatically when jobs become available</Text>
                  </View>
                </>
          }
        </View>
      </>
    )
  }

  const businessView = () => {
    return (
      <>
        <Header main="Your listed" sub="jobs"></Header>
        <View style={{
          flex: 1
        }}>
          <SectionList
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => {
              return (
                <View style={{ padding: 24 }}>
                  <JobCard key={index} user={user} job={item} account_type={user.account_type} />
                </View>
              )
            }}
            keyExtractor={(item, index) => item.id}
            renderSectionHeader={({ section: { title } }) => (
              <View style={{ backgroundColor: variables.pageBackgroundColor }}>
                <Header main={title} sub="jobs" hideAvatar={true} subheader={true}></Header>
              </View>
            )}
            sections={[{
              title: 'All',
              data: allJobs
            }]}>

          </SectionList>

        </View>
        <View style={{
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: 48,
          shadowColor: '#CCC',
          shadowOffset: {
            width: 1,
            height: 1
          },
          shadowOpacity: 0.5,
          shadowRadius: 20,
          position: 'absolute',
          bottom: 0,
          width: '100%',
          marginBottom: 0,
          display: 'flex',
          justifyContent: 'center'
        }}>
          {
            businessHasConnectedCard
              ?
              <View>
                <Button showIcon={true} type="primary" title="Create new job" onPress={() => navigation.navigate('CreateJob')}></Button>
              </View>
              : <Button showIcon={true} type="primary" title="Add card" onPress={() => navigation.navigate('AddCard', { customer_id: user.customer_id })}></Button>
          }
        </View>
      </>
    )
  }

  const registerForPushNotificationsAsync = async () => {
    let token: string;

    if (Constants.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();

      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        return;
      }

      token = (await Notifications.getExpoPushTokenAsync()).data;
    } else {
      alert('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  }

  const openAppSettings = () => {
    Linking.openSettings()
  }

  useEffect(() => {
    try {
      Notifications.getPermissionsAsync().then(() => {
        registerForPushNotificationsAsync().then(async (token) => {
          await User.updateUser(User.storedUser.id, { push_token: token })
        });
      });

      Location.getForegroundPermissionsAsync().then(async (location_status) => {
        if (!location_status.granted) {
          let { status } = await Location.requestForegroundPermissionsAsync();

          if (status !== 'granted') {
            setAllowsLocation(false);
          } else {
            setAllowsLocation(true);
          }
        } else {
          setAllowsLocation(true);
        }
      });
    } catch (e) {
      alert(e);
    }
  }, []);

  useFocusEffect(() => {
    if (user?.account_type === AccountType.BUSINESS) {
      try {
        getConnectedCards();
      } catch (e) {
        alert("There was an error when trying to get your cards");
      }
    }
  });

  return (
    <SafeAreaView style={styles.host}>
      {
        !allowsLocation
          ?
          <>
            <Header main="" sub="" />
            <View style={{ margin: 24, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%' }}>
              <SuspendedSvg width={180} height={180} />
              <Text style={{ marginBottom: 24, fontWeight: '500', color: variables.secondaryColor, fontSize: 16, ...variables.fontStyle, marginTop: 12, textAlign: 'center' }}>
                You must allow location tracking to use Dlvrry. We use your location data to show jobs near you as a rider & as a business to find addresses for your customers' deliveries. You can enable location services by clicking the button below
              </Text>
              <Button type="primary" title="Open app settings" onPress={openAppSettings} />
            </View></>
          : <>
            {
              user?.verified ?
                allJobsLoading
                  ? <Loader />
                  : user?.account_type === AccountType.RIDER
                    ? riderView()
                    : businessView()
                : <View style={{ padding: 24, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <WaitingSvg width={180} height={180} />
                  <Text style={{ fontWeight: '500', color: variables.secondaryColor, fontSize: 16, ...variables.fontStyle, marginTop: 12, textAlign: 'center' }}>
                    Your account is pending manual verification. You will receive an email when your account has been verified this takes around 24-48 hours to complete
                  </Text>
                </View>
            }

            <Text>{allJobsError ?? allJobsError}</Text>
          </>
      }

    </SafeAreaView >
  );
}
