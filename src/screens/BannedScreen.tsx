import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Icon } from '../components/Icon';
import { Button } from '../components/Button';
import colors from '../theme/colors';
import typography from '../theme/typography';

const BannedScreen: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Icon name="homeIcon" size={80} color={colors.coral} />
          </View>
        </View>

        <Text style={[typography.h1, styles.title]}>Акаунт заблоковано</Text>
        
        <Text style={[typography.main, styles.description]}>
          Ваш акаунт було заблоковано адміністратором
        </Text>

        {user?.banReason && (
          <View style={styles.reasonContainer}>
            <Text style={[typography.caption, styles.reasonLabel]}>Причина:</Text>
            <Text style={[typography.secondary, styles.reasonText]}>
              {user.banReason}
            </Text>
          </View>
        )}

        {user?.bannedAt && (
          <Text style={[typography.caption, styles.dateText]}>
            Дата блокування: {new Date(user.bannedAt).toLocaleDateString('uk-UA')}
          </Text>
        )}

        <View style={styles.infoBox}>
          <Text style={[typography.secondary, styles.infoText]}>
            Якщо ви вважаєте, що це помилка, зв'яжіться з підтримкою
          </Text>
        </View>

        <View style={styles.contactContainer}>
          <Text style={[typography.h3, styles.contactTitle]}>Контакти підтримки:</Text>
          
          <TouchableOpacity style={styles.contactItem}>
            <Icon name="homeIcon" size={20} color={colors.primary} />
            <Text style={[typography.secondary, styles.contactText]}>
              support@oweme.com
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem}>
            <Icon name="homeIcon" size={20} color={colors.primary} />
            <Text style={[typography.secondary, styles.contactText]}>
              @oweme_support
            </Text>
          </TouchableOpacity>
        </View>

        <Button
          title="Вийти з акаунту"
          icon="homeIcon"
          variant="coral"
          padding={14}
          onPress={logout}
          style={styles.logoutButton}
        />
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
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.coral15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.coral,
  },
  title: {
    color: colors.coral,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    color: colors.text70,
    textAlign: 'center',
    marginBottom: 24,
  },
  reasonContainer: {
    backgroundColor: colors.card_surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: colors.coral,
  },
  reasonLabel: {
    color: colors.coral,
    marginBottom: 8,
    fontWeight: '600',
  },
  reasonText: {
    color: colors.text,
  },
  dateText: {
    color: colors.text70,
    textAlign: 'center',
    marginBottom: 24,
  },
  infoBox: {
    backgroundColor: colors.primary15,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    width: '100%',
  },
  infoText: {
    color: colors.text,
    textAlign: 'center',
  },
  contactContainer: {
    width: '100%',
    marginBottom: 32,
  },
  contactTitle: {
    color: colors.text,
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card_surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  contactText: {
    color: colors.text,
  },
  logoutButton: {
    width: '100%',
  },
});

export default BannedScreen;
