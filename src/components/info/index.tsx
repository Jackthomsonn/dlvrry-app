import { Text, View } from "react-native"

import { Button } from "../button"
import { IJob } from "dlvrry-common";
import { Job } from "../../services/job"
import React from "react"
import { useNavigation } from "@react-navigation/native"
import { variables } from "../../../Variables"

interface InfoProps {
  job: IJob
}

export const Info = (props: InfoProps) => {
  const navigation = useNavigation();

  const cancelJob = async () => {
    try {
      await Job.cancelJob(props.job.id);
      navigation.goBack();
    } catch (e) {
      alert(e);
    }
  }

  const completeJob = async () => {
    try {
      await Job.completeJob(props.job);
      navigation.goBack();
    } catch (e) {
      alert(e);
    }
  }

  return (
    <>
      <View style={{ height: '15%', backgroundColor: variables.light, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ backgroundColor: variables.tertiaryColor, width: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Text>Business</Text>
          <Text style={{ fontWeight: '700', color: variables.dark }}>{props.job.owner_name}</Text>
        </View>
        <View style={{ backgroundColor: variables.tertiaryColor, width: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Text>Payout</Text>
          <Text style={{ fontWeight: '700', color: variables.dark }}>£{props.job.payout / 100}</Text>
        </View>
      </View>
      <View style={{ display: 'flex', flexDirection: 'row', height: '15%', justifyContent: 'space-between' }}>
        <View style={{ backgroundColor: variables.light, width: '25%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: variables.dark }}>Status</Text>
          <Text style={{ fontWeight: '700', color: variables.dark }}>Job started</Text>
        </View>
        <View style={{ backgroundColor: variables.light, width: '35%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Button type="primary" title="Cancel job" onPress={() => cancelJob()}></Button>
        </View>
        <View style={{ backgroundColor: variables.light, width: '40%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Button type="primary" title="Complete job" onPress={() => completeJob()}></Button>
        </View>
      </View>
    </>
  )
}