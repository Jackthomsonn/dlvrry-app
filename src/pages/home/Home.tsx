import { ActivityIndicator, Image, SafeAreaView, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';

import AsyncStorage from "@react-native-community/async-storage";
import { Button } from '../../components/button';
import { FlatList } from "react-native-gesture-handler";
import { IJob } from 'dlvrry-common';
import { IUserData } from '../../interfaces/IUserData';
import { Job } from "../../services/job";
import { JobCard } from '../../components/job-card';
import { StorageKey } from '../../enums/Storage.enum';
import { User } from "../../services/user";
import { UserRole } from '../../enums/UserRole';
import { useNavigation } from "@react-navigation/native";
import { variables } from "../../../Variables";

export function HomeScreen() {
  const navigation = useNavigation();

  const [ userRole, setUserRole ] = useState(undefined);
  const [ user, setUser ] = useState<{ uid: string }>(undefined);
  const [ isLoading, setIsLoading ] = useState(true);
  const [ avatarUri, setAvatarUri ] = useState(undefined);
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

  const setup = async () => {
    const userData = await AsyncStorage.getItem(StorageKey.USER_DATA)
    const user: IUserData = JSON.parse(userData);
    const userRole: string = await User.getUserRole(user.uid);

    setUser(user);
    setUserRole(userRole);

    if (userRole === UserRole.RIDER) {
      getJobs();
    }

    if (userRole === UserRole.BUSINESS) {
      getJobsForBusiness(user.uid);
    }

    setIsLoading(false);

    setAvatarUri(user.photoURL);
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
                  <View style={{ flexDirection: 'row' }}>
                    <Image source={{ uri: avatarUri }} style={{ display: 'flex', width: 48, height: 48, borderRadius: 100 }}></Image>
                  </View>
                </>
              </View>
              <View style={{ padding: 24, flex: 1 }}>
                <FlatList data={jobs} keyExtractor={(_item, index) => index.toString()} renderItem={({ item }) => <JobCard user={user} job={item} role={userRole} />}></FlatList>
              </View>
            </>
            : <>
              <View style={{ paddingTop: 24, paddingLeft: 24, paddingRight: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <>
                  <View style={{ flexDirection: 'row', flex: 1 }}>
                    <Text style={{ color: variables.dark, fontWeight: '700', fontSize: 32 }}>Your</Text>
                    <Text style={{ color: variables.dark, fontWeight: '300', fontSize: 32 }}> listed jobs</Text>
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <Image source={{ uri: avatarUri }} style={{ display: 'flex', width: 48, height: 48, borderRadius: 100 }}></Image>
                  </View>
                </>
              </View>
              <View style={{ padding: 24, flex: 1 }}>
                <FlatList data={jobs} keyExtractor={(_item, index) => index.toString()} renderItem={({ item }) => <JobCard user={user} job={item} role={userRole} />}></FlatList>

                <Button type="primary" title="Create new job" onPress={() => navigation.navigate('CreateJob')}></Button>
              </View>
            </>
      }
    </SafeAreaView >
  );
}
