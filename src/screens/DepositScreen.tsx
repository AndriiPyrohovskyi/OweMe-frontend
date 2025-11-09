import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderBar } from '../components/HeaderBar';
import { Button } from '../components/Button';
import { TextInput } from '../components/TextInput';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { walletApi } from '../services/api/endpoints/wallet';

interface DepositScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const DepositScreen: React.FC<DepositScreenProps> = ({
  onBack,
  onSuccess,
}) => {
  const [amount, setAmount] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [loading, setLoading] = useState(false);

  const quickAmounts = [50, 100, 200, 500, 1000];

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleDeposit = async () => {
    if (loading) return;
    
    const depositAmount = parseFloat(amount);

    if (!depositAmount || depositAmount <= 0) {
      Alert.alert('Помилка', 'Введіть коректну суму');
      return;
    }

    if (depositAmount < 1) {
      Alert.alert('Помилка', 'Мінімальна сума поповнення - 1 ₴');
      return;
    }

    if (depositAmount > 10000) {
      Alert.alert('Помилка', 'Максимальна сума поповнення - 10 000 ₴');
      return;
    }

    // Використовуємо спеціальний тестовий ID, який backend розпізнає
    // Backend автоматично створить payment method з Stripe test card
    const testPaymentMethodId = 'pm_test_visa';

    Alert.alert(
      'Підтвердження',
      `Поповнити рахунок на ${depositAmount.toFixed(2)} ₴?`,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Підтвердити',
          onPress: async () => {
            try {
              setLoading(true);
              
              await walletApi.deposit({
                amount: depositAmount,
                paymentMethodId: testPaymentMethodId,
              });

              Alert.alert(
                'Успіх!',
                `Рахунок поповнено на ${depositAmount.toFixed(2)} ₴`,
                [{ text: 'OK', onPress: onSuccess }]
              );
            } catch (error: any) {
              console.error('Error depositing:', error);
              Alert.alert(
                'Помилка',
                error.response?.data?.message || 'Не вдалося поповнити рахунок'
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <HeaderBar title="Поповнити рахунок" onBack={onBack} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Інфо */}
        <View style={styles.infoCard}>
          <Text style={typography.h3}>💳 Поповнення через Stripe</Text>
          <Text style={[typography.secondary, { marginTop: 8 }]}>
            Безпечна оплата картою Visa, Mastercard
          </Text>
        </View>

        {/* Сума */}
        <View style={styles.section}>
          <TextInput
            label="Сума поповнення (₴)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
          />

          {/* Швидкі суми */}
          <View style={styles.quickAmountsContainer}>
            <Text style={[typography.secondary, styles.quickAmountsLabel]}>
              Швидкий вибір:
            </Text>
            <View style={styles.quickAmounts}>
              {quickAmounts.map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.quickAmountButton,
                    amount === value.toString() && styles.quickAmountButtonActive,
                  ]}
                  onPress={() => handleQuickAmount(value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.quickAmountText,
                      amount === value.toString() && styles.quickAmountTextActive,
                    ]}
                  >
                    {value} ₴
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Розрахунок */}
          {amount && parseFloat(amount) > 0 && (
            <View style={styles.calculationCard}>
              <View style={styles.calculationRow}>
                <Text style={typography.secondary}>Сума:</Text>
                <Text style={typography.main}>{parseFloat(amount).toFixed(2)} ₴</Text>
              </View>
              <View style={styles.calculationRow}>
                <Text style={typography.secondary}>Комісія:</Text>
                <Text style={[typography.main, { color: colors.green }]}>
                  0.00 ₴
                </Text>
              </View>
              <View style={[styles.calculationRow, styles.totalRow]}>
                <Text style={typography.h3}>До сплати:</Text>
                <Text style={[typography.h2, { color: colors.primary }]}>
                  {parseFloat(amount).toFixed(2)} ₴
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Обмеження */}
        <View style={styles.limitsCard}>
          <Text style={[typography.secondary, { fontSize: 12 }]}>
            ℹ️ Мінімальна сума: 1 ₴
          </Text>
          <Text style={[typography.secondary, { fontSize: 12 }]}>
            ℹ️ Максимальна сума: 10 000 ₴
          </Text>
        </View>

        {/* Кнопка */}
        <Button
          title={loading ? "Обробка..." : "Поповнити"}
          variant="green"
          onPress={handleDeposit}
        />

        {/* Тестова інформація */}
        <View style={styles.testInfo}>
          <Text style={[typography.secondary, { fontSize: 11, textAlign: 'center', fontWeight: '600' }]}>
            🧪 Тестовий режим Stripe
          </Text>
          <Text style={[typography.secondary, { fontSize: 10, textAlign: 'center', marginTop: 4 }]}>
            Використовується тестова картка Visa (4242 4242 4242 4242)
          </Text>
          <Text style={[typography.secondary, { fontSize: 10, textAlign: 'center' }]}>
            Платіж буде успішним без реального списання коштів
          </Text>
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
  infoCard: {
    backgroundColor: colors.primary15,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.primary70,
  },
  section: {
    marginBottom: 24,
  },
  quickAmountsContainer: {
    marginTop: 16,
  },
  quickAmountsLabel: {
    marginBottom: 8,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickAmountButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.card_surface,
    borderWidth: 1,
    borderColor: colors.border_divider,
  },
  quickAmountButtonActive: {
    backgroundColor: colors.primary15,
    borderColor: colors.primary,
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text70,
  },
  quickAmountTextActive: {
    color: colors.primary,
  },
  calculationCard: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.card_surface,
    borderRadius: 12,
    gap: 12,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalRow: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border_divider,
  },
  limitsCard: {
    padding: 12,
    backgroundColor: colors.yellow15,
    borderRadius: 8,
    marginBottom: 16,
    gap: 4,
  },
  testInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.green15,
    borderRadius: 8,
  },
});
