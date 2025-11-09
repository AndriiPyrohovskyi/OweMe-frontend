import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { Button } from '../components/Button';
import { HeaderBar } from '../components/HeaderBar';
import { TextInput } from '../components/TextInput';
import { owesApi, OweParticipant, ReturnOweDto } from '../services/api/endpoints/owes';

interface CreateOweReturnScreenProps {
  participantId: number;
  onBack: () => void;
  onSuccess: () => void;
}

export const CreateOweReturnScreen: React.FC<CreateOweReturnScreenProps> = ({
  participantId,
  onBack,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [participant, setParticipant] = useState<OweParticipant | null>(null);
  const [returned, setReturned] = useState('');

  useEffect(() => {
    loadParticipant();
  }, []);

  const loadParticipant = async () => {
    try {
      const response = await owesApi.getOweParticipant(participantId);
      setParticipant(response);
    } catch (err: any) {
      console.error('Error loading participant:', err);
      Alert.alert('Помилка', 'Не вдалося завантажити дані боргу');
      onBack();
    }
  };

  const calculateAvailable = () => {
    if (!participant) return 0;
    
    const totalReturned = participant.oweReturns
      ? participant.oweReturns
          .filter(ret => ret.status === 'Accepted')
          .reduce((sum, ret) => sum + Number(ret.returned), 0)
      : 0;
    
    return Number(participant.sum) - totalReturned;
  };

  const handleSubmit = async () => {
    if (!returned || parseFloat(returned) <= 0) {
      Alert.alert('Помилка', 'Введіть коректну суму');
      return;
    }

    const returnedAmount = parseFloat(returned);
    const available = calculateAvailable();

    if (returnedAmount > available) {
      Alert.alert('Помилка', `Сума повернення не може перевищувати ${available.toFixed(2)} ₴`);
      return;
    }

    try {
      setLoading(true);

      const dto: ReturnOweDto = {
        participantId,
        returned: returnedAmount,
      };

      await owesApi.createOweReturn(dto);
      Alert.alert('Успіх', 'Запит на повернення створено', [
        { text: 'OK', onPress: onSuccess }
      ]);
    } catch (err: any) {
      console.error('Error creating return:', err);
      Alert.alert('Помилка', err.response?.data?.message || 'Не вдалося створити повернення');
    } finally {
      setLoading(false);
    }
  };

  if (!participant) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <HeaderBar title="Повернення боргу" onBack={onBack} />
        <View style={styles.loader}>
          <Text style={[typography.main, { color: colors.text70 }]}>Завантаження...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const available = calculateAvailable();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <HeaderBar title="Повернення боргу" onBack={onBack} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoCard}>
          <Text style={[typography.h3, styles.infoTitle]}>Інформація про борг</Text>
          
          <View style={styles.infoRow}>
            <Text style={[typography.secondary, styles.label]}>Пункт боргу:</Text>
            <Text style={[typography.main, styles.value]}>{participant.oweItem.name}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[typography.secondary, styles.label]}>Загальна сума:</Text>
            <Text style={[typography.numbers, { color: colors.coral }]}>
              {Number(participant.sum).toFixed(2)} ₴
            </Text>
          </View>
          
          {participant.oweReturns && participant.oweReturns.length > 0 && (
            <View style={styles.infoRow}>
              <Text style={[typography.secondary, styles.label]}>Вже повернено:</Text>
              <Text style={[typography.numbers, { color: colors.green }]}>
                {(Number(participant.sum) - available).toFixed(2)} ₴
              </Text>
            </View>
          )}
          
          <View style={[styles.infoRow, styles.availableRow]}>
            <Text style={[typography.main, styles.label]}>Доступно для повернення:</Text>
            <Text style={[typography.numbers, { color: colors.text }]}>
              {available.toFixed(2)} ₴
            </Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={[typography.h3, styles.formTitle]}>Сума повернення</Text>
          
          <TextInput
            label="Сума *"
            value={returned}
            onChangeText={setReturned}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
          
          <Text style={[typography.secondary, styles.hint]}>
            Введіть суму, яку ви хочете повернути. Максимум: {available.toFixed(2)} ₴
          </Text>

          <Button
            title={loading ? 'Створення...' : 'Створити запит на повернення'}
            onPress={handleSubmit}
            variant="green"
            padding={16}
            style={styles.submitButton}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    backgroundColor: colors.card_surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.border_divider,
  },
  infoTitle: {
    color: colors.text,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border_divider,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  availableRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border_divider,
  },
  label: {
    color: colors.text70,
  },
  value: {
    color: colors.text,
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: colors.card_surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border_divider,
  },
  formTitle: {
    color: colors.text,
    marginBottom: 16,
  },
  hint: {
    color: colors.text70,
    marginTop: 8,
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
  },
});

export default CreateOweReturnScreen;
