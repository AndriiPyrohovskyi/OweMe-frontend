import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../components/Button';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { NavigationProp } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Dropdown } from '../components/Dropdown';

type MainScreenProps = {
  navigation: NavigationProp<any>;
};

export const MainScreen: React.FC<MainScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };
  return (
    <View style={styles.container}>
      <Text style={[typography.h1, styles.text]}>
        Вітаємо, {user?.username}!
      </Text>
      <Dropdown
        onPress={() => {}}
        options={["1", "2", "3", "1", "2", "3", "1", "2", "3", "1", "2", "3", "1", "2", "3", "1", "2", "3", "1", "2", "3", "1", "2", "3"]}
        title='123445'
      >

      </Dropdown>
      <Button title="Кнопівка" onPress={() => {}} iconSize={12} icon='dropdownIcon' padding={8}/>
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