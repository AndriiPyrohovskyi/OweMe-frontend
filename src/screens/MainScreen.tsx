import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { NavigationProp } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Dropdown } from '../components/Dropdown';
import { TabBar } from '../components/TabBar';

type MainScreenProps = {
  navigation: NavigationProp<any>;
};

export const MainScreen: React.FC<MainScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("Домашня");
  
  const handleLogout = async () => {
    await logout();
  };
  
  const renderContent = () => {
    switch(activeTab) {
      case "Домашня":
        return (
        <View>
              <Text style={[typography.h2, styles.text]}>Домашня сторінка</Text>
        </View>
        );
      case "Друзі":
        return <Text style={[typography.h2, styles.text]}>Список друзів</Text>;
      case "Групи":
        return <Text style={[typography.h2, styles.text]}>Мої групи</Text>;
      case "Налаштування":
        return <Text style={[typography.h2, styles.text]}>Налаштування</Text>;
      case "Інше":
        return <Text style={[typography.h2, styles.text]}>Інше</Text>;
      default:
        return null;
    }
  };
  
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          {renderContent()}
        </View>
        <TabBar
        onTabChange={(tab) => setActiveTab(tab.name)}
        tabs={[ {name: "Домашня", icon: "homeIcon"},
                {name: "Друзі", icon: "friendsIcon"},
                {name: "Групи", icon: "groupsIcon"},
                {name: "Налаштування", icon: "settingsIcon"},
                {name: "Інше", icon: "otherIcon"},
        ]}
        >
        </TabBar>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});