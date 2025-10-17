import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../components/Button';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { NavigationProp } from '@react-navigation/native';

type DashboardScreenProps = {
  navigation: NavigationProp<any>;
};

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={[typography.h1, styles.text]}>
        Dashboard
      </Text>
      <Text style={[typography.secondary, styles.subtitle]}>
        Your debts and credits
      </Text>
      <Button 
        title="Go Back" 
        onPress={() => navigation.goBack()}
        variant='purple'
        padding={8}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background
  },
  text: {
    marginBottom: 10,
    color: colors.text
  },
  subtitle: {
    opacity: 0.7,
    color: colors.text,
    marginBottom: 20,
  },
});