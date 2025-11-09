import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { groupsApi } from '../services/api/endpoints/groups';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { Button } from '../components/Button';
import { TextInput } from '../components/TextInput';
import Icon from '../components/Icon';

interface CreateGroupScreenProps {
  onBack?: () => void;
  onGroupCreated?: () => void;
  onNavigateToAddMember?: (groupId: number) => void;
}

const CreateGroupScreen: React.FC<CreateGroupScreenProps> = ({ onBack, onGroupCreated, onNavigateToAddMember }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [creating, setCreating] = useState(false);

  const handleChangePhoto = () => {
    Alert.alert('Змінити фото', 'Функція зміни фото буде додана пізніше');
    // TODO: Implement image picker
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Помилка', 'Введіть назву групи');
      return;
    }

    if (!tag.trim()) {
      Alert.alert('Помилка', 'Введіть тег групи');
      return;
    }

    // Додаємо @ якщо користувач не ввів
    const formattedTag = tag.startsWith('@') ? tag : `@${tag}`;

    setCreating(true);
    try {
      await groupsApi.createGroup({
        name: name.trim(),
        tag: formattedTag,
        description: description.trim() || undefined,
      });
      
      Alert.alert('Успіх', 'Групу створено!', [
        {
          text: 'OK',
          onPress: () => {
            onGroupCreated?.();
            onBack?.();
          },
        },
      ]);
    } catch (error: any) {
      console.error('Failed to create group:', error);
      Alert.alert('Помилка', 'Не вдалося створити групу');
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="homeIcon" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Створити групу</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarPlaceholderText}>
              {name ? name[0].toUpperCase() : '?'}
            </Text>
          </View>
          <TouchableOpacity style={styles.changePhotoButton} onPress={handleChangePhoto}>
            <Icon name="homeIcon" size={20} color={colors.text} />
            <Text style={styles.changePhotoText}>Змінити фото</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            label="Назва"
            placeholder="Чупіки"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            label="Тег"
            placeholder="@chupiki"
            value={tag}
            onChangeText={setTag}
            autoCapitalize="none"
          />

          <TextInput
            label="Про групу"
            placeholder="Опис групи..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="Додати учасника"
            icon="homeIcon"
            iconSize={20}
            variant="purple"
            padding={12}
            onPress={() => {
              Alert.alert(
                'Інформація', 
                'Спочатку збережіть групу, а потім зможете додати учасників через деталі групи'
              );
            }}
          />

          <Button
            title={creating ? 'Створення...' : 'Зберегти'}
            icon="homeIcon"
            iconSize={20}
            variant="green"
            padding={12}
            onPress={handleCreate}
          />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  backIcon: {
    fontSize: 28,
    color: colors.text,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarPlaceholderText: {
    ...typography.h1,
    fontSize: 48,
    color: colors.text,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  changePhotoIcon: {
    fontSize: 18,
  },
  changePhotoText: {
    ...typography.main,
    fontWeight: '600',
    color: colors.text,
  },
  form: {
    gap: 20,
    marginBottom: 24,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    ...typography.h3,
    color: colors.text,
  },
  input: {
    ...typography.main,
    color: colors.text,
    backgroundColor: colors.card_surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border_divider,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  actions: {
    gap: 12,
  },
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.green,
    borderRadius: 12,
    paddingVertical: 14,
  },
  addMemberIcon: {
    fontSize: 20,
  },
  addMemberText: {
    ...typography.CTA,
    color: colors.text,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonIcon: {
    fontSize: 20,
  },
  createButtonText: {
    ...typography.CTA,
    color: colors.text,
  },
});

export default CreateGroupScreen;
