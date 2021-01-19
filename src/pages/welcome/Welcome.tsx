import { Button, Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { variables } from '../../../Variables';

const styles = StyleSheet.create({
  host: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFF'
  },
  header: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 12
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  contentText: {
    fontSize: 18,
    textAlign: 'center',
    width: 300
  },
  buttonContainer: {
    flex: 2,
    display: 'flex'
  },
  buttonRider: {
    borderColor: variables.primaryColor,
    borderWidth: 1,
    padding: 4,
    borderRadius: 4,
    marginBottom: 12
  },
  buttonBusiness: {
    backgroundColor: variables.primaryColor,
    borderColor: variables.primaryColor,
    borderWidth: 1,
    padding: 4,
    borderRadius: 4
  }
});

export function WelcomeScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.host}>
      <View style={styles.header}>
        <Image source={require('../../../assets/icon.png')} style={styles.logo} />
      </View>
      <View style={styles.content}>
        <Text style={styles.contentText}>The on-demand delivery service that make sure you recieve your items on the same day you ordered them!</Text>
      </View>
      <View style={styles.buttonContainer}>
        <View style={styles.buttonRider}>
          <Button
            onPress={() => navigation.navigate('SignUp')}
            title="Get started"
            color={variables.primaryColor}>
          </Button>
        </View>

        <View style={styles.buttonBusiness}>
          <Button
            onPress={() => navigation.navigate('Login')}
            title="Already have an account?"
            color={variables.light}>
          </Button>
        </View>
      </View>
    </SafeAreaView >
  );
}
