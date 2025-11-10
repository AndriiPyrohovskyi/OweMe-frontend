import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { HeaderBar } from '../components/HeaderBar';
import { TextInput } from '../components/TextInput';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { owesApi, OweItem } from '../services/api/endpoints/owes';
import { uploadApi } from '../services/api/endpoints/upload';

interface EditOweScreenProps {
  oweItemId: number;
  onBack: () => void;
  onSaved?: () => void;
}

const EditOweScreen: React.FC<EditOweScreenProps> = ({
  oweItemId,
  onBack,
  onSaved,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [oweItem, setOweItem] = useState<OweItem | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadOweItem();
  }, [oweItemId]);

  const loadOweItem = async () => {
    try {
      setLoading(true);
      const item = await owesApi.getOweItemById(oweItemId);
      setOweItem(item);
      setName(item.name);
      setDescription(item.description || '');
      setImageUrls(item.imageUrls || []);
    } catch (error) {
      console.error('Error loading owe item:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити інформацію про борг');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSelectImage = () => {
    if (imageUrls.length >= 3) {
      Alert.alert('Ліміт досягнуто', 'Можна додати максимум 3 фото');
      return;
    }

    Alert.alert(
      'Оберіть джерело',
      'Звідки ви хочете завантажити фото?',
      [
        {
          text: 'Камера',
          onPress: () => openCamera(),
        },
        {
          text: 'Галерея',
          onPress: () => openGallery(),
        },
        {
          text: 'Скасувати',
          style: 'cancel',
        },
      ]
    );
  };

  const openCamera = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
      });

      if (result.assets && result.assets[0]) {
        await uploadImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error opening camera:', error);
      Alert.alert('Помилка', 'Не вдалося відкрити камеру');
    }
  };

  const openGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
      });

      if (result.assets && result.assets[0]) {
        await uploadImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error opening gallery:', error);
      Alert.alert('Помилка', 'Не вдалося відкрити галерею');
    }
  };

  const uploadImage = async (image: any) => {
    try {
      setUploadingImage(true);
      const result = await uploadApi.uploadOweImage(oweItemId, image);
      
      if (result && result.imageUrls) {
        setImageUrls(result.imageUrls);
        Alert.alert('Успіх', 'Фото успішно завантажено');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити фото');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = (imageUrl: string) => {
    Alert.alert(
      'Видалити фото',
      'Ви впевнені, що хочете видалити це фото?',
      [
        {
          text: 'Скасувати',
          style: 'cancel',
        },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: () => deleteImage(imageUrl),
        },
      ]
    );
  };

  const deleteImage = async (imageUrl: string) => {
    try {
      const result = await uploadApi.deleteOweImage(oweItemId, imageUrl);
      
      if (result && result.imageUrls) {
        setImageUrls(result.imageUrls);
        Alert.alert('Успіх', 'Фото успішно видалено');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      Alert.alert('Помилка', 'Не вдалося видалити фото');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Помилка', 'Введіть назву боргу');
      return;
    }

    try {
      setSaving(true);
      await owesApi.updateOweItem(oweItemId, {
        name: name.trim(),
        description: description.trim() || undefined,
      });

      Alert.alert('Успіх', 'Борг успішно оновлено');
      onSaved?.();
      onBack();
    } catch (error) {
      console.error('Error saving owe item:', error);
      Alert.alert('Помилка', 'Не вдалося зберегти зміни');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <HeaderBar title="Редагування боргу" onBack={onBack} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <HeaderBar title="Редагування боргу" onBack={onBack} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Name Input */}
        <TextInput
          label="Назва боргу *"
          value={name}
          onChangeText={setName}
          placeholder="Введіть назву"
        />

        {/* Description Input */}
        <TextInput
          label="Опис"
          value={description}
          onChangeText={setDescription}
          placeholder="Введіть опис"
          multiline
          numberOfLines={4}
          style={styles.descriptionInput}
        />

        {/* Images Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Фото ({imageUrls.length}/3)</Text>
          
          <View style={styles.imagesGrid}>
            {imageUrls.map((url, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: url }} style={styles.image} />
                <TouchableOpacity
                  style={styles.deleteImageButton}
                  onPress={() => handleDeleteImage(url)}
                >
                  <Icon name="closeIcon" size={16} color={colors.background} />
                </TouchableOpacity>
              </View>
            ))}

            {imageUrls.length < 3 && (
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={handleSelectImage}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <Icon name="homeIcon" size={32} color={colors.primary} />
                    <Text style={styles.addImageText}>Додати фото</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.hint}>
            Ви можете додати до 3 фото для підтвердження боргу
          </Text>
        </View>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <Button
            title={saving ? 'Збереження...' : 'Зберегти зміни'}
            onPress={handleSave}
            disabled={saving || uploadingImage}
            variant="green"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  descriptionInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 12,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  deleteImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.coral,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary15,
  },
  addImageText: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 4,
  },
  hint: {
    ...typography.caption,
    color: colors.text70,
    marginTop: 8,
  },
  buttonContainer: {
    marginTop: 24,
  },
});

export default EditOweScreen;
