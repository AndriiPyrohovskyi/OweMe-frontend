import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderBar } from '../components/HeaderBar';
import { Button } from '../components/Button';
import { TextInput } from '../components/TextInput';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { walletApi } from '../services/api/endpoints/wallet';
import { friendsApi, Friend } from '../services/api/endpoints/friends';
import { useAuth } from '../context/AuthContext';

interface TransferScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const TransferScreen: React.FC<TransferScreenProps> = ({
  onBack,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user?.id) {
      Alert.alert('Помилка', 'Користувача не знайдено');
      return;
    }

    try {
      setLoadingFriends(true);
      const [friendsData, walletData] = await Promise.all([
        friendsApi.getUserFriends(user.id),
        walletApi.getWallet(),
      ]);
      
      setFriends(friendsData);
      setBalance(parseFloat(walletData.balance) || 0);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити дані');
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleTransfer = async () => {
    if (loading) return;
    
    const transferAmount = parseFloat(amount);

    if (!transferAmount || transferAmount <= 0) {
      Alert.alert('Помилка', 'Введіть коректну суму');
      return;
    }

    if (!selectedFriendId) {
      Alert.alert('Помилка', 'Оберіть отримувача');
      return;
    }

    if (transferAmount > balance) {
      Alert.alert(
        'Недостатньо коштів',
        `Ваш баланс: ${balance.toFixed(2)} ₴\nНеобхідно: ${transferAmount.toFixed(2)} ₴`
      );
      return;
    }

    const selectedFriend = friends.find(f => f.id === selectedFriendId);
    
    Alert.alert(
      'Підтвердження',
      `Перевести ${transferAmount.toFixed(2)} ₴ для ${selectedFriend?.username}?`,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Підтвердити',
          onPress: async () => {
            try {
              setLoading(true);
              
              await walletApi.transfer({
                toUserId: selectedFriendId,
                amount: transferAmount,
                description: description || undefined,
              });

              Alert.alert(
                'Успіх!',
                `Переведено ${transferAmount.toFixed(2)} ₴ для ${selectedFriend?.username}`,
                [{ text: 'OK', onPress: onSuccess }]
              );
            } catch (error: any) {
              console.error('Error transferring:', error);
              Alert.alert(
                'Помилка',
                error.response?.data?.message || 'Не вдалося виконати переказ'
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loadingFriends) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <HeaderBar title="Перевести кошти" onBack={onBack} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[typography.secondary, { marginTop: 16 }]}>
            Завантаження...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <HeaderBar title="Перевести кошти" onBack={onBack} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Баланс */}
        <View style={styles.balanceCard}>
          <Text style={typography.secondary}>Доступно:</Text>
          <Text style={[typography.h2, { color: colors.primary }]}>
            {balance.toFixed(2)} ₴
          </Text>
        </View>

        {/* Отримувач */}
        <View style={styles.section}>
          <Text style={[typography.main, styles.sectionTitle]}>Отримувач</Text>
          
          {friends.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={typography.secondary}>
                У вас немає друзів для переказу
              </Text>
            </View>
          ) : (
            <View style={styles.friendsList}>
              {friends.map((friend) => (
                <TouchableOpacity
                  key={friend.id}
                  style={[
                    styles.friendCard,
                    selectedFriendId === friend.id && styles.friendCardSelected,
                  ]}
                  onPress={() => setSelectedFriendId(friend.id)}
                  activeOpacity={0.7}
                >
                  {friend.avatarUrl ? (
                    <Image 
                      source={{ uri: friend.avatarUrl }} 
                      style={styles.friendAvatar}
                    />
                  ) : (
                    <View style={[styles.friendAvatar, styles.friendAvatarPlaceholder]}>
                      <Text style={styles.friendAvatarText}>
                        {friend.username.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.friendInfo}>
                    <Text
                      style={[
                        typography.main,
                        selectedFriendId === friend.id && styles.friendNameSelected,
                      ]}
                    >
                      {friend.username}
                    </Text>
                    <Text style={typography.secondary}>
                      {friend.email || friend.firstName || 'Користувач'}
                    </Text>
                  </View>
                  {selectedFriendId === friend.id && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Сума */}
        <View style={styles.section}>
          <TextInput
            label="Сума переказу (₴)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
          />
        </View>

        {/* Опис */}
        <View style={styles.section}>
          <TextInput
            label="Коментар (опціонально)"
            value={description}
            onChangeText={setDescription}
            placeholder="Наприклад: За каву"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Кнопка */}
        <Button
          title={loading ? "Обробка..." : "Перевести"}
          variant="purple"
          onPress={handleTransfer}
        />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceCard: {
    backgroundColor: colors.primary15,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary70,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  friendsList: {
    gap: 12,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.card_surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border_divider,
  },
  friendCardSelected: {
    backgroundColor: colors.primary15,
    borderColor: colors.primary,
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  friendAvatarPlaceholder: {
    backgroundColor: colors.primary70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.card_surface,
  },
  friendInfo: {
    flex: 1,
  },
  friendNameSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: colors.card_surface,
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
});
