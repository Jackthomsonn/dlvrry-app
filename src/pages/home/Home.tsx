import { AccountType, IJob } from 'dlvrry-common';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/button';
import { FlatList } from "react-native-gesture-handler";
import { Header } from '../../components/header';
import { Job } from "../../services/job";
import { JobCard } from '../../components/job-card';
import { Loader } from '../../components/loader';
import React from 'react';
import { User } from "../../services/user";
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useNavigation } from "@react-navigation/native";

const styles = StyleSheet.create({
  host: {
    flex: 1,
    backgroundColor: '#FFF'
  }
});

export function HomeScreen() {
  const navigation = useNavigation();

  const [ jobs, loading, error ] = useCollectionData<IJob>(
    User.storedUser.account_type === AccountType.RIDER
      ? Job.getJobs()
      : Job.getJobsForBusiness(User.storedUser.id)
  )

  const riderView = () => {
    return (
      <>
        <Header main="Available" sub="jobs"></Header>
        <View style={{ padding: 24, flex: 1 }}>
          <FlatList data={jobs} keyExtractor={(_item, index) => index.toString()} renderItem={({ item }) => <JobCard user={User.storedUser} job={item} account_type={User.storedUser.account_type} />}></FlatList>
        </View>
      </>
    )
  }

  const businessView = () => {
    return (
      <>
        <Header main="Your listed" sub="jobs"></Header>
        <View style={{ padding: 24, flex: 1 }}>
          <FlatList data={jobs} keyExtractor={(_item, index) => index.toString()} renderItem={({ item }) => <JobCard user={User.storedUser} job={item} account_type={User.storedUser.account_type} />}></FlatList>

          <Button type="primary" title="Create new job" onPress={() => navigation.navigate('CreateJob')}></Button>
        </View>
      </>
    )
  }

  return (
    <SafeAreaView style={styles.host}>
      {
        loading
          ? <Loader />
          : User.storedUser.account_type === AccountType.RIDER
            ? riderView()
            : businessView()
      }

      {
        error ? <Text>{error}</Text> : undefined
      }
    </SafeAreaView >
  );
}
