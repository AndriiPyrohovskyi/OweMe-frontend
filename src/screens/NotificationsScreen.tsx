import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { HeaderBar } from '../components/HeaderBar';
import Icon from '../components/Icon';

interface NotificationsScreenProps {
  onBack: () => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onBack }) => {
  return (
    <View style={styles.container}>
      <HeaderBar title="Сповіщення" onBack={onBack} />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.emptyState}>
          <Icon name="homeIcon" size={64} color={colors.text70} />
          <Text style={[typography.h3, styles.emptyTitle]}>
            Сповіщення відсутні
          </Text>
          <Text style={[typography.main, styles.emptyText]}>
            Тут будуть відображатися ваші сповіщення
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptyTitle: {
    color: colors.text,
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.text70,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default NotificationsScreen;
