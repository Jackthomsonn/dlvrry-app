import { AccountType, IJob, IUser, JobStatus } from 'dlvrry-common';
import { Image, SafeAreaView, SectionList, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { Button } from '../../components/button';
import { FlatList } from "react-native-gesture-handler";
import { Header } from '../../components/header';
import { Job } from "../../services/job";
import { JobCard } from '../../components/job-card';
import { Loader } from '../../components/loader';
import { User } from "../../services/user";
import { variables } from '../../../Variables';

const styles = StyleSheet.create({
  host: {
    flex: 1,
    backgroundColor: variables.light
  }
});

export function HomeScreen() {
  const navigation = useNavigation();

  const [ businessHasConnectedCard, setBusinessHasConnectedCard ] = useState(false);
  const [ user ] = useDocumentData<IUser>(User.getUser(User.storedUserId));

  const [ jobsPendingOrCancelled, jobsPendingOrCancelledLoading, jobsPendingOrCancelledError ] = useCollectionData<IJob>(
    user?.account_type === AccountType.RIDER
      ? Job.getJobs([ JobStatus.PENDING, JobStatus.CANCELLED ])
      : Job.getJobsForBusiness(User.storedUserId, [ JobStatus.PENDING, JobStatus.CANCELLED ])
  )

  const [ jobsAwaitingPayment, jobsAwaitingPaymentLoading, jobsAwaitingPaymentError ] = useCollectionData<IJob>(
    user?.account_type === AccountType.BUSINESS
      ? Job.getJobsForBusiness(User.storedUserId, [ JobStatus.AWAITING_PAYMENT ])
      : undefined
  )

  const [ jobsCompleted, jobsCompletedLoading, jobsCompletedError ] = useCollectionData<IJob>(
    user?.account_type === AccountType.BUSINESS
      ? Job.getJobsForBusiness(User.storedUserId, [ JobStatus.COMPLETED ])
      : undefined
  )

  const getConnectedCards = async () => {
    if (!user || !user.customer_id) {
      return;
    }

    const response = await User.getCards(user.customer_id);

    setBusinessHasConnectedCard(response.length > 0);
  }

  const riderView = () => {
    return (
      <>
        <Header main="Available" sub="jobs"></Header>
        <View style={{ padding: 24, flex: 1 }}>
          {
            jobsPendingOrCancelled?.length > 0
              ? <FlatList showsVerticalScrollIndicator={false} data={jobsPendingOrCancelled} keyExtractor={(_item, index) => index.toString()} renderItem={({ item }) => <JobCard user={user} job={item} account_type={user.account_type} />}></FlatList>
              : <>
                <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Image source={require('../../../assets/no-results.png')} style={{
                    width: 180,
                    height: 180
                  }} />
                  <Text style={{ fontWeight: '500', color: variables.secondaryColor, fontSize: 16, marginTop: 12 }}>No jobs found</Text>
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
          padding: 24,
          flex: 1,
          paddingBottom: 214,
        }}>
          <SectionList
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => <JobCard user={user} job={item} account_type={user.account_type} />}
            keyExtractor={(item, index) => item.id + index}
            renderSectionHeader={({ section: { title } }) => (
              <View style={{ backgroundColor: variables.light, paddingBottom: 24 }}>
                <Header main={title} sub="jobs" hideAvatar={true} subheader={true}></Header>
              </View>
            )}
            sections={[ {
              title: 'Active',
              data: jobsPendingOrCancelled
            }, {
              title: 'Pending',
              data: jobsAwaitingPayment
            }, {
              title: 'Completed',
              data: jobsCompleted
            } ]}>

          </SectionList>

        </View>
        <View style={{
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: 48,
          backgroundColor: variables.light,
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
              ? <>
                <View style={{ borderTopLeftRadius: 50, borderTopRightRadius: 50, flexDirection: 'row', height: 40, backgroundColor: variables.light, }}>
                  <View style={{ width: '50%', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                    <Text style={{ fontWeight: '500', color: variables.primaryColor, fontSize: 16, textAlign: 'center' }}>Active</Text>
                    <Text style={{ fontWeight: '700', color: variables.secondaryColor, fontSize: 18, textAlign: 'center' }}>{jobsPendingOrCancelled.length}</Text>
                  </View>
                  <View style={{ borderTopRightRadius: 50, width: '50%', justifyContent: 'center', alignItems: 'flex-start' }}>
                    <Text style={{ fontWeight: '500', color: variables.primaryColor, fontSize: 16, textAlign: 'center' }}>Awaiting payment</Text>
                    <Text style={{ fontWeight: '700', color: variables.secondaryColor, fontSize: 18, textAlign: 'center' }}>{jobsAwaitingPayment.length}</Text>
                  </View>
                </View>
                <View style={{ borderTopLeftRadius: 50, borderTopRightRadius: 50, flexDirection: 'row', height: 40, backgroundColor: variables.light, marginTop: 24 }}>
                  <View style={{ width: '50%', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                    <Text style={{ fontWeight: '500', color: variables.primaryColor, fontSize: 16, textAlign: 'center' }}>Completed</Text>
                    <Text style={{ fontWeight: '700', color: variables.secondaryColor, fontSize: 18, textAlign: 'center', marginBottom: 24 }}>{jobsCompleted.length}</Text>
                  </View>
                </View>
                <View style={{ marginBottom: 24 }}>
                  <Button type="primary" title="Create new job" onPress={() => navigation.navigate('CreateJob')}></Button>
                </View>
              </>
              : <Button type="primary" title="Add card" onPress={() => navigation.navigate('AddCard', { customer_id: user.customer_id })}></Button>
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
        jobsPendingOrCancelledLoading || jobsAwaitingPaymentLoading || jobsCompletedLoading
          ? <Loader />
          : user?.account_type === AccountType.RIDER
            ? riderView()
            : businessView()
      }

      <Text>{jobsPendingOrCancelledError ?? jobsPendingOrCancelledError}</Text>
      <Text>{jobsAwaitingPaymentError ?? jobsAwaitingPaymentError}</Text>
      <Text>{jobsCompletedError ?? jobsCompletedError}</Text>

    </SafeAreaView >
  );
}
