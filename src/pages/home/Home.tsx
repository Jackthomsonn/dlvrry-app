import { AccountType, IJob } from '@dlvrry/dlvrry-common';
import { ActivityIndicator, Image, Linking, SafeAreaView, Text, View } from 'react-native';
import { FlatList, ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import { Link, useNavigation } from "@react-navigation/native";
import React, { createRef, useEffect, useState } from 'react';

import ActionSheet from "react-native-actions-sheet";
import AsyncStorage from "@react-native-community/async-storage";
import { Button } from '../../components/button';
import { IUserData } from '../../interfaces/IUserData';
import { Ionicons } from '@expo/vector-icons';
import { Job } from "../../services/job";
import { JobCard } from '../../components/job-card';
import { StorageKey } from '../../enums/Storage.enum';
import { User } from "../../services/user";
import { UserRole } from '../../enums/UserRole';
import firebase from 'firebase';
import { variables } from "../../../Variables";

const actionSheetRef: any = createRef();

export function HomeScreen() {
  const navigation = useNavigation();
  const [ cards, setCards ] = useState(undefined);

  const [ userRole, setUserRole ] = useState(undefined);
  const [ user, setUser ] = useState<{ uid: string }>(undefined);
  const [ isLoading, setIsLoading ] = useState(true);
  const [ jobs, setJobs ] = useState<IJob[]>([]);

  const getJobs = () => {
    Job.getJobs().onSnapshot(jobs => {
      const collection = [];

      jobs.docs.forEach(job => {
        collection.push({ ...job.data(), id: job.id });
      });

      setJobs(collection);
    });
  }

  const getJobsForBusiness = (id: string) => {
    Job.getJobsForBusiness(id).onSnapshot(jobs => {
      const collection = [];

      jobs.docs.forEach(job => {
        collection.push({ ...job.data(), id: job.id });
      });

      setJobs(collection);
    });
  }

  const goToDashboard = async () => {
    const loginLink = await User.getLoginLink(user.uid);

    Linking.openURL(loginLink.url);
  }

  const getCards = async () => {
    const userData = await AsyncStorage.getItem(StorageKey.USER_DATA)
    const parsedUserData: IUserData = JSON.parse(userData);
    const user = await User.getUser(parsedUserData.uid);

    const response = await User.getCards(user.data().customer_id);

    setCards(response);
  }

  const setupCard = async () => {
    const userData = await AsyncStorage.getItem(StorageKey.USER_DATA)
    const parsedUserData: IUserData = JSON.parse(userData);

    const user = await User.getUser(parsedUserData.uid);
    await navigation.navigate('AddCard', { customer_id: user.data().customer_id });

    actionSheetRef.current?.hide();
  }

  const setup = async () => {
    const userData = await AsyncStorage.getItem(StorageKey.USER_DATA)
    const user: IUserData = JSON.parse(userData);
    const accountType: string = await User.getAccountType(user.uid);

    setUser(user);
    setUserRole(accountType);

    if (accountType === UserRole.RIDER) {
      getJobs();
    }

    if (accountType === UserRole.BUSINESS) {
      getJobsForBusiness(user.uid);
    }

    getCards();

    setIsLoading(false);
  }

  useEffect(() => {
    setup();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
      {
        isLoading
          ? <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <ActivityIndicator />
          </View>
          : userRole === UserRole.RIDER
            ? <>
              <View style={{ paddingTop: 24, paddingLeft: 24, paddingRight: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <>
                  <View style={{ flexDirection: 'row', flex: 1 }}>
                    <Text style={{ color: variables.dark, fontWeight: '700', fontSize: 32 }}>Available</Text>
                    <Text style={{ color: variables.dark, fontWeight: '300', fontSize: 32 }}> jobs</Text>
                  </View>
                  <View style={{ flexDirection: 'row', backgroundColor: variables.primaryColor, width: 50, height: 50, borderRadius: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity
                      onPress={() => {
                        actionSheetRef.current?.setModalVisible();
                      }}
                    ><Ionicons name="md-person" size={22} color={variables.light} />
                    </TouchableOpacity>
                  </View>
                </>
              </View>
              <View style={{ padding: 24, flex: 1 }}>
                <FlatList data={jobs} keyExtractor={(_item, index) => index.toString()} renderItem={({ item }) => <JobCard user={user} job={item} account_type={userRole} />}></FlatList>
              </View>
            </>
            : <>
              <View style={{ paddingTop: 24, paddingLeft: 24, paddingRight: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <>
                  <View style={{ flexDirection: 'row', flex: 1 }}>
                    <Text style={{ color: variables.dark, fontWeight: '700', fontSize: 32 }}>Your</Text>
                    <Text style={{ color: variables.dark, fontWeight: '300', fontSize: 32 }}> listed jobs</Text>
                  </View>
                  <View style={{ flexDirection: 'row', backgroundColor: variables.primaryColor, width: 50, height: 50, borderRadius: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity
                      onPress={() => {
                        actionSheetRef.current?.setModalVisible();
                      }}
                    ><Ionicons name="md-person" size={22} color={variables.light} />
                    </TouchableOpacity>
                  </View>
                </>
              </View>
              <View style={{ padding: 24, flex: 1 }}>
                <FlatList data={jobs} keyExtractor={(_item, index) => index.toString()} renderItem={({ item }) => <JobCard user={user} job={item} account_type={userRole} />}></FlatList>

                <Button type="primary" title="Create new job" onPress={() => navigation.navigate('CreateJob')}></Button>
              </View>
            </>
      }

      <ActionSheet ref={actionSheetRef}>
        <ScrollView style={{ padding: 24, height: 500 }}>
          <View style={{ padding: 12 }}>
            <Text style={{ fontSize: 24 }}>Account settings</Text>
            <TouchableOpacity style={{ marginTop: 8 }} onPress={async () => {
              await firebase.auth().signOut();
              await AsyncStorage.clear();
            }}>
              <Text style={{ marginBottom: 8, fontSize: 18 }}>Log out</Text>
            </TouchableOpacity>

            {
              userRole === AccountType.RIDER
                ? <>
                  <Text style={{ fontSize: 24, marginTop: 24 }}>Dashboard</Text>
                  <TouchableOpacity style={{ marginTop: 8 }} onPress={() => goToDashboard()}>
                    <Text style={{ marginBottom: 8, fontSize: 18 }}>Go to my dashboard</Text>
                  </TouchableOpacity>
                </>
                : undefined
            }

            {
              userRole === AccountType.BUSINESS
                ? <>
                  <Text style={{ fontSize: 24, marginTop: 24 }}>Cards</Text>
                  {
                    cards?.length === 0
                      ? <>
                        <Text style={{ marginTop: 8 }}>You have no available cards</Text>
                        <View style={{ marginTop: 8 }}>
                          <Button type="primary" title="Add card" onPress={() => { setupCard() }} />
                        </View>
                      </>
                      : <Text>You have {cards?.length}</Text>
                  }
                </>
                : undefined
            }

          </View>
        </ScrollView>
      </ActionSheet>
    </SafeAreaView >
  );
}
