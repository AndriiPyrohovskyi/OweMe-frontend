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
import { Icon } from '../components/Icon';
import { Button } from '../components/Button';
import { TextInput } from '../components/TextInput';
import colors from '../theme/colors';
import typography from '../theme/typography';

interface EditProfileScreenProps {
  onBack: () => void;
}

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.description || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // TODO: Виклик API для оновлення профілю
      // await usersApi.updateProfile({ firstName, lastName, username, description: bio });
      
      Alert.alert('Успіх', 'Профіль оновлено!', [
        { text: 'OK', onPress: onBack }
      ]);
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося оновити профіль');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="homeIcon" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[typography.h2, styles.headerTitle]}>Змінити профіль</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formSection}>
          <TextInput
            label="Ім'я та прізвище"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Роман"
          />

          <TextInput
            label="Прізвище"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Прізвище"
          />

          <TextInput
            label="Юзернейм"
            value={username}
            onChangeText={setUsername}
            placeholder="mr_ananas229"
          />

          <TextInput
            label="Про мене"
            value={bio}
            onChangeText={setBio}
            placeholder="Гигиги, я не поверну вам ні копійки, якщо ви - не жінка! А за альтушку я 4+ розміром готовий навіть кредит взяти. Дада"
            multiline
            numberOfLines={4}
          />
        </View>

        <Button
          title="Зберегти"
          icon="homeIcon"
          variant="green"
          padding={14}
          onPress={handleSave}
          style={styles.saveButton}
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
    paddingTop: 24,
    paddingBottom: 100,
  },
  formSection: {
    gap: 20,
    marginBottom: 32,
  },
  saveButton: {
    marginTop: 8,
  },
});

export default EditProfileScreen;
