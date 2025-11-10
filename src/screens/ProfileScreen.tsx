import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../context/AuthContext';
import { Icon } from '../components/Icon';
import { Button } from '../components/Button';
import { uploadApi } from '../services/api/endpoints/upload';
import colors from '../theme/colors';
import typography from '../theme/typography';

interface ProfileScreenProps {
  onBack: () => void;
  onEdit?: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack, onEdit }) => {
  const { user, refreshUser } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleImagePick = async (type: 'camera' | 'gallery') => {
    try {
      const result = type === 'camera' 
        ? await launchCamera({ mediaType: 'photo', quality: 0.8 })
        : await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });

      if (result.didCancel || !result.assets?.[0]) {
        return;
      }

      const asset = result.assets[0];
      setUploading(true);

      const uploadResult = await uploadApi.uploadAvatar({
        uri: asset.uri,
        type: asset.type,
        fileName: asset.fileName,
      });

      await refreshUser();
      Alert.alert('Успіх', 'Аватарка оновлена!');
    } catch (error: any) {
      console.error('Failed to upload avatar:', error);
      Alert.alert('Помилка', error.response?.data?.message || 'Не вдалося завантажити фото');
    } finally {
      setUploading(false);
    }
  };

  const handleChangeAvatar = () => {
    Alert.alert(
      'Змінити фото',
      'Виберіть джерело',
      [
        { text: 'Камера', onPress: () => handleImagePick('camera') },
        { text: 'Галерея', onPress: () => handleImagePick('gallery') },
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
            {uploading ? (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : user?.avatarUrl ? (
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
            title={uploading ? "Завантаження..." : "Змінити фото"}
            icon="homeIcon"
            variant="purple"
            padding={12}
            onPress={handleChangeAvatar}
            disabled={uploading}
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
