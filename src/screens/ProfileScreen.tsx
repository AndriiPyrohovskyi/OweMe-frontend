import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Icon } from '../components/Icon';
import { Button } from '../components/Button';
import colors from '../theme/colors';
import typography from '../theme/typography';

interface ProfileScreenProps {
  onBack: () => void;
  onEdit?: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack, onEdit }) => {
  const { user } = useAuth();

  const handleChangeAvatar = () => {
    Alert.alert(
      'Змінити фото',
      'Виберіть джерело',
      [
        { text: 'Камера', onPress: () => console.log('Open camera') },
        { text: 'Галерея', onPress: () => console.log('Open gallery') },
        { text: 'Скасувати', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="homeIcon" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[typography.h2, styles.headerTitle]}>Профіль</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={[typography.h1, styles.avatarText]}>
                  {user?.firstName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
            )}
            <View style={styles.avatarBorder} />
          </View>

          <Button
            title="Змінити фото"
            icon="homeIcon"
            variant="purple"
            padding={12}
            onPress={handleChangeAvatar}
            style={styles.changePhotoButton}
          />
        </View>

        {/* User Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={[typography.caption, styles.infoLabel]}>Ім'я та прізвище</Text>
            <Text style={[typography.main, styles.infoValue]}>
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.username || '—'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={[typography.caption, styles.infoLabel]}>Прізвище</Text>
            <Text style={[typography.main, styles.infoValue]}>
              {user?.lastName || '—'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={[typography.caption, styles.infoLabel]}>Юзернейм</Text>
            <Text style={[typography.main, styles.infoValue]}>
              {user?.username || '—'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={[typography.caption, styles.infoLabel]}>Про мене</Text>
            <Text style={[typography.main, styles.infoValue, styles.bioText]}>
              {user?.description || '—'}
            </Text>
          </View>
        </View>

        {/* Edit Button */}
        <Button
          title="Змінити інфомацію"
          icon="homeIcon"
          variant="purple"
          padding={14}
          onPress={() => onEdit?.()}
          style={styles.editButton}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: colors.card_surface,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 100,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  avatarPlaceholder: {
    backgroundColor: colors.primary70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.text,
    fontSize: 56,
  },
  avatarBorder: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 74,
    borderWidth: 4,
    borderColor: colors.primary,
  },
  changePhotoButton: {
    paddingHorizontal: 24,
  },
  infoSection: {
    backgroundColor: colors.card_surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  infoRow: {
    paddingVertical: 16,
  },
  infoLabel: {
    color: colors.text70,
    marginBottom: 8,
  },
  infoValue: {
    color: colors.text,
  },
  bioText: {
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  editButton: {
    marginTop: 8,
  },
});

export default ProfileScreen;
