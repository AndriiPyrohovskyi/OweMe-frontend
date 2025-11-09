import { useState } from 'react';
import { Alert } from 'react-native';
import { owesApi, OweReturn, ReturnOweDto } from '../services/api/endpoints/owes';
import { walletApi } from '../services/api/endpoints/wallet';

interface UseDebtReturnProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useDebtReturn = ({ onSuccess, onError }: UseDebtReturnProps = {}) => {
  const [loading, setLoading] = useState(false);
  const [checkingBalance, setCheckingBalance] = useState(false);

  // Перевірка балансу перед створенням повернення
  const checkBalance = async (amount: number): Promise<boolean> => {
    try {
      setCheckingBalance(true);
      const wallet = await walletApi.getWallet();
      
      if (wallet.status !== 'active') {
        Alert.alert('Помилка', 'Ваш гаманець неактивний. Зверніться до підтримки.');
        return false;
      }

      const balance = parseFloat(wallet.balance);
      if (balance < amount) {
        Alert.alert(
          'Недостатньо коштів',
          `На вашому рахунку ${balance.toFixed(2)} ₴, але потрібно ${amount.toFixed(2)} ₴.\n\nПоповніть гаманець?`,
          [
            { text: 'Скасувати', style: 'cancel' },
            { 
              text: 'Поповнити', 
              onPress: () => {
                // TODO: Navigate to wallet deposit screen
                console.log('Navigate to wallet deposit');
              }
            }
          ]
        );
        return false;
      }

      return true;
    } catch (error: any) {
      console.error('Error checking balance:', error);
      Alert.alert('Помилка', error.response?.data?.message || 'Не вдалося перевірити баланс');
      return false;
    } finally {
      setCheckingBalance(false);
    }
  };

  // Створити повернення боргу
  const createReturn = async (data: ReturnOweDto): Promise<OweReturn | null> => {
    try {
      setLoading(true);

      // Спочатку перевіряємо баланс
      const hasBalance = await checkBalance(data.returned);
      if (!hasBalance) {
        return null;
      }

      // Створюємо повернення
      const result = await owesApi.createOweReturn(data);
      
      Alert.alert(
        'Успіх!',
        `Запит на повернення створено.\n\n${data.returned} ₴ заморожені до рішення власника боргу.`,
        [{ text: 'OK', onPress: onSuccess }]
      );

      return result;
    } catch (error: any) {
      console.error('Error creating return:', error);
      const message = error.response?.data?.message || 'Не вдалося створити повернення';
      Alert.alert('Помилка', message);
      onError?.(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Прийняти повернення (власник боргу)
  const acceptReturn = async (returnId: number): Promise<boolean> => {
    try {
      setLoading(true);
      await owesApi.acceptOweReturn(returnId);
      
      Alert.alert(
        'Готово!',
        'Повернення прийнято. Кошти надійшли на ваш рахунок.',
        [{ text: 'OK', onPress: onSuccess }]
      );
      
      return true;
    } catch (error: any) {
      console.error('Error accepting return:', error);
      const message = error.response?.data?.message || 'Не вдалося прийняти повернення';
      Alert.alert('Помилка', message);
      onError?.(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Відхилити повернення (власник боргу)
  const declineReturn = async (returnId: number): Promise<boolean> => {
    try {
      setLoading(true);
      await owesApi.declineOweReturn(returnId);
      
      Alert.alert(
        'Готово',
        'Повернення відхилено. Кошти повернені боржнику.',
        [{ text: 'OK', onPress: onSuccess }]
      );
      
      return true;
    } catch (error: any) {
      console.error('Error declining return:', error);
      const message = error.response?.data?.message || 'Не вдалося відхилити повернення';
      Alert.alert('Помилка', message);
      onError?.(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Скасувати повернення (боржник)
  const cancelReturn = async (returnId: number): Promise<boolean> => {
    try {
      setLoading(true);
      await owesApi.cancelOweReturn(returnId);
      
      Alert.alert(
        'Скасовано',
        'Повернення скасовано. Кошти розморожені.',
        [{ text: 'OK', onPress: onSuccess }]
      );
      
      return true;
    } catch (error: any) {
      console.error('Error canceling return:', error);
      const message = error.response?.data?.message || 'Не вдалося скасувати повернення';
      Alert.alert('Помилка', message);
      onError?.(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    checkingBalance,
    checkBalance,
    createReturn,
    acceptReturn,
    declineReturn,
    cancelReturn,
  };
};
