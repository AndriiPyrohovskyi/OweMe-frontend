import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../components/Button';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { NavigationProp } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

type DashboardScreenProps = {
  navigation: NavigationProp<any>;
};

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // Автоматично перекине на Login
  };
  return (
    <View style={styles.container}>
      <Text style={[typography.h1, styles.text]}>
        Вітаємо, {user?.username}!
      </Text>
      <Button title="Вийти" onPress={handleLogout} />
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