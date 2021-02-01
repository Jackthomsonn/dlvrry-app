import { AccountType, IJob } from 'dlvrry-common';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { Button } from '../../components/button';
import { FlatList } from "react-native-gesture-handler";
import { Header } from '../../components/header';
import { Job } from "../../services/job";
import { JobCard } from '../../components/job-card';
import { Loader } from '../../components/loader';
import { User } from "../../services/user";
import { useCollectionData } from 'react-firebase-hooks/firestore';

const styles = StyleSheet.create({
  host: {
    flex: 1,
    backgroundColor: '#FFF'
  }
});

export function HomeScreen() {
  const navigation = useNavigation();

  const [ businessHasConnectedCard, setBusinessHasConnectedCard ] = useState(false);

  const [ jobs, loading, error ] = useCollectionData<IJob>(
    User.storedUser.account_type === AccountType.RIDER
      ? Job.getJobs()
      : Job.getJobsForBusiness(User.storedUser.id)
  )

  const getConnectedCards = async () => {
    if (!User.storedUser || !User.storedUser.customer_id) {
      return;
    }

    const response = await User.getCards(User.storedUser.customer_id);

    setBusinessHasConnectedCard(response.length > 0);
  }

  const riderView = () => {
    return (
      <>
        <Header main="Available" sub="jobs"></Header>
        <View style={{ padding: 24, flex: 1 }}>
          {
            jobs && jobs.length > 0
              ? <FlatList showsVerticalScrollIndicator={false} data={jobs} keyExtractor={(_item, index) => index.toString()} renderItem={({ item }) => <JobCard user={User.storedUser} job={item} account_type={User.storedUser.account_type} />}></FlatList>
              : <Text>No jobs available</Text>
          }
        </View>
      </>
    )
  }

  const businessView = () => {
    return (
      <>
        <Header main="Your listed" sub="jobs"></Header>
        <View style={{ padding: 24, flex: 10 }}>
          {
            jobs && jobs.length > 0
              ? <FlatList showsVerticalScrollIndicator={false} data={jobs} keyExtractor={(_item, index) => index.toString()} renderItem={({ item }) => <JobCard user={User.storedUser} job={item} account_type={User.storedUser.account_type} />}>
              </FlatList>
              : <Text>You have no listed jobs available</Text>
          }

        </View>
        <View style={{ flex: 1, padding: 24 }}>
          {
            businessHasConnectedCard
              ? <Button type="primary" title="Create new job" onPress={() => navigation.navigate('CreateJob')}></Button>
              : <Button type="primary" title="Add card" onPress={() => navigation.navigate('AddCard', { customer_id: User.storedUser.customer_id })}></Button>
          }
        </View>
      </>
    )
  }

  useFocusEffect(() => {
    getConnectedCards();
  })

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
