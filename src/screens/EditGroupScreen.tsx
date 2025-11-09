import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { groupsApi, Group, UpdateGroupDto } from '../services/api/endpoints/groups';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { Button } from '../components/Button';
import { TextInput } from '../components/TextInput';
import Icon from '../components/Icon';

interface EditGroupScreenProps {
  groupId: number;
  onBack: () => void;
  onSuccess?: (updatedGroup: Group) => void;
}

const EditGroupScreen: React.FC<EditGroupScreenProps> = ({
  groupId,
  onBack,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [group, setGroup] = useState<Group | null>(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [errors, setErrors] = useState({
    name: '',
    description: '',
    avatarUrl: '',
  });

  useEffect(() => {
    loadGroup();
  }, [groupId]);

  const loadGroup = async () => {
    try {
      const groupData = await groupsApi.getGroup(groupId);
      setGroup(groupData);
      setName(groupData.name);
      setDescription(groupData.description || '');
      setAvatarUrl(groupData.avatarUrl || '');
    } catch (error: any) {
      console.error('Failed to load group:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити групу');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors = {
      name: '',
      description: '',
      avatarUrl: '',
    };

    if (!name.trim()) {
      newErrors.name = 'Назва групи обов\'язкова';
    } else if (name.trim().length < 3) {
      newErrors.name = 'Назва має містити мінімум 3 символи';
    } else if (name.trim().length > 100) {
      newErrors.name = 'Назва не може перевищувати 100 символів';
    }

    if (description.length > 1000) {
      newErrors.description = 'Опис не може перевищувати 1000 символів';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    setSaving(true);
    try {
      const updateData: UpdateGroupDto = {};
      
      // Додаємо тільки змінені поля
      if (name.trim() !== group?.name) {
        updateData.name = name.trim();
      }
      if (description !== (group?.description || '')) {
        updateData.description = description;
      }
      if (avatarUrl !== (group?.avatarUrl || '')) {
        updateData.avatarUrl = avatarUrl;
      }

      // Якщо нічого не змінилося
      if (Object.keys(updateData).length === 0) {
        Alert.alert('Інформація', 'Немає змін для збереження');
        setSaving(false);
        return;
      }

      const updatedGroup = await groupsApi.updateGroup(groupId, updateData);
      Alert.alert('Успіх', 'Групу оновлено');
      onSuccess?.(updatedGroup);
      onBack();
    } catch (error: any) {
      console.error('Failed to update group:', error);
      const message = error.response?.data?.message || 'Не вдалося оновити групу';
      Alert.alert('Помилка', message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Видалити групу?',
      'Ця дія незворотна. Всі дані групи будуть втрачені.',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: async () => {
            try {
              await groupsApi.deleteGroup(groupId);
              Alert.alert('Успіх', 'Групу видалено');
              onBack();
            } catch (error: any) {
              console.error('Failed to delete group:', error);
              const message = error.response?.data?.message || 'Не вдалося видалити групу';
              Alert.alert('Помилка', message);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Icon name="homeIcon" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Редагування групи</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Завантаження...</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="homeIcon" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Редагування групи</Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Основна інформація</Text>
          
          <TextInput
            label="Назва групи *"
            value={name}
            onChangeText={setName}
            placeholder="Введіть назву групи"
            error={errors.name}
            maxLength={100}
          />

          <TextInput
            label="Опис"
            value={description}
            onChangeText={setDescription}
            placeholder="Опис групи (необов'язково)"
            multiline
            numberOfLines={4}
            error={errors.description}
            maxLength={1000}
            style={styles.textArea}
          />

          <TextInput
            label="URL аватара"
            value={avatarUrl}
            onChangeText={setAvatarUrl}
            placeholder="https://example.com/avatar.jpg"
            error={errors.avatarUrl}
            autoCapitalize="none"
            keyboardType="url"
          />

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 Підказка: Ви можете завантажити зображення на будь-який хостинг 
              (наприклад, imgur.com) та вставити посилання сюди.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Тег групи</Text>
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyLabel}>Тег:</Text>
            <Text style={styles.readOnlyValue}>@{group?.tag}</Text>
          </View>
          <Text style={styles.helperText}>
            Тег не можна змінити після створення групи
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            title={saving ? 'Збереження...' : 'Зберегти зміни'}
            onPress={handleSave}
          />

          <Button
            title="Скасувати"
            onPress={onBack}
            variant="yellow"
          />
        </View>

        <View style={styles.dangerZone}>
          <Text style={styles.dangerZoneTitle}>Небезпечна зона</Text>
          <Text style={styles.dangerZoneText}>
            Тільки засновник групи може видалити групу. Ця дія незворотна.
          </Text>
          <Button
            title="Видалити групу"
            onPress={handleDelete}
            variant="coral"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border_divider,
    backgroundColor: colors.card_surface,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.text70,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  infoBox: {
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  infoText: {
    ...typography.caption,
    color: colors.text,
    lineHeight: 18,
  },
  readOnlyField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card_surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  readOnlyLabel: {
    ...typography.body,
    color: colors.text70,
    marginRight: 8,
  },
  readOnlyValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  helperText: {
    ...typography.caption,
    color: colors.text70,
    marginTop: 4,
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  dangerZone: {
    padding: 16,
    backgroundColor: colors.coral15,
    borderTopWidth: 2,
    borderTopColor: colors.coral,
    marginTop: 16,
  },
  dangerZoneTitle: {
    ...typography.h3,
    color: colors.coral,
    marginBottom: 8,
  },
  dangerZoneText: {
    ...typography.body,
    color: colors.text,
    marginBottom: 16,
  },
});

export default EditGroupScreen;
