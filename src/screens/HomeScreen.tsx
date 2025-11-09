import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { walletApi } from '../services/api/endpoints';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { TopBar } from '../components/TopBar';
import { Button } from '../components/Button';
import Icon from '../components/Icon';

interface DebtItem {
  id: number;
  name: string;
  amount: number;
  emoji?: string;
}

interface HomeScreenProps {
  onNavigateToProfile?: () => void;
  onNavigateToFriends?: () => void;
  onNavigateToGroups?: () => void;
  onNavigateToTopUp?: () => void;
  onNavigateToTransfer?: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ 
  onNavigateToProfile, 
  onNavigateToFriends, 
  onNavigateToGroups,
  onNavigateToTopUp,
  onNavigateToTransfer,
}) => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'owe' | 'owed'>('owe'); // Вам винні / Ви винні
  const [loading, setLoading] = useState(true);
  
  // Завантаження балансу з API
  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      const walletData = await walletApi.getBalance();
      if (walletData && walletData.balance !== undefined) {
        setBalance(parseFloat(walletData.balance));
      }
    } catch (error: any) {
      console.error('Failed to load balance:', error);
      if (error?.response?.status === 404) {
        Alert.alert('Помилка', 'Гаманець не знайдено. Спробуйте перезайти в додаток.');
      }
      // Залишаємо balance = 0 при помилці
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBalance();
    // TODO: Завантажити борги з API
    setRefreshing(false);
  };
  const [debtsOwed, setDebtsOwed] = useState<DebtItem[]>([
    { id: 1, name: 'Тусовка в барі', amount: 1012, emoji: '🍺' },
    { id: 2, name: 'Картинг', amount: 920, emoji: '🏎️' },
    { id: 3, name: 'Продукти в Лідлі', amount: 34, emoji: '🛒' },
    { id: 4, name: 'Вода', amount: 12, emoji: '💧' },
    { id: 5, name: 'Доллата в маршрутці', amount: 2, emoji: '🚌' },
  ]);

  const [debtsYouOwe, setDebtsYouOwe] = useState<DebtItem[]>([
    { id: 1, name: 'DemonDestroyer', amount: 1012 },
    { id: 2, name: 'hephestic', amount: 920 },
    { id: 3, name: 'MaksTomash', amount: 34 },
    { id: 4, name: 'YanyaZolo2004', amount: 12 },
    { id: 5, name: 'Stepanchik1', amount: 2 },
  ]);

  const totalOwed = debtsOwed.reduce((sum, debt) => sum + debt.amount, 0);
  const totalYouOwe = debtsYouOwe.reduce((sum, debt) => sum + debt.amount, 0);

  const [friendsCount, setFriendsCount] = useState<number | null>(null);
  const [groupsCount, setGroupsCount] = useState<number | null>(null);
  const [owesCount, setOwesCount] = useState<number | null>(null);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        if (user?.id) {
          const friendsApi = (await import('../services/api/endpoints/friends')).friendsApi;
          const f = await friendsApi.getFriendCount(user.id);
          setFriendsCount(f);
        }
      } catch (e) {
        setFriendsCount(null);
      }

      try {
        const groupsApi = (await import('../services/api/endpoints/groups')).groupsApi;
        const myGroups = await groupsApi.getMyGroups();
        setGroupsCount(myGroups?.length ?? 0);
      } catch (e) {
        setGroupsCount(null);
      }

      try {
        const owesApi = (await import('../services/api/endpoints/owes')).owesApi;
        const myOwes = await owesApi.getMyFullOwes();
        setOwesCount(myOwes?.length ?? 0);
      } catch (e) {
        setOwesCount(null);
      }
    };

    loadSummary();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <TopBar 
        userName={user?.username}
        onAvatarPress={onNavigateToProfile}
        onNotificationPress={() => Alert.alert('Сповіщення', 'Функція в розробці')}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Wallet Balance Card */}
        <View style={styles.walletCard}>
          <Text style={styles.walletTitle}>Ваш баланс</Text>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceAmount}>{balance.toFixed(2)}</Text>
            <Text style={styles.balanceCurrency}> грн</Text>
          </View>
          <View style={styles.walletActions}>
            <Button
              title="💳 Поповнити"
              variant="green"
              padding={12}
              onPress={async () => {
                // Navigate to top-up flow if provided, otherwise try a quick deposit test
                if (onNavigateToTopUp) return onNavigateToTopUp();
                try {
                  // quick test deposit of 1.00 for dev
                  const res = await walletApi.deposit({ amount: 1, paymentMethodId: 'test' });
                  Alert.alert('Поповнено', 'Баланс успішно поповнено (тест)');
                  await loadBalance();
                } catch (e) {
                  console.error('Deposit failed', e);
                  Alert.alert('Помилка', 'Не вдалось поповнити баланс');
                }
              }}
            />

            <Button
              title="📤 Перевести"
              variant="purple"
              padding={12}
              onPress={() => {
                if (onNavigateToTransfer) return onNavigateToTransfer();
                // Default behavior: open transfer screen should be provided by navigation
                Alert.alert('Перевести', 'Відкрити екран переказу');
              }}
            />
          </View>
        </View>

        {/* Summary cards */}
        <View style={styles.summaryRow}>
          <TouchableOpacity style={[styles.summaryCard, { borderColor: colors.green }]} onPress={() => onNavigateToFriends?.()}>
            <Text style={styles.summaryNumber}>{friendsCount !== null ? friendsCount : '-'}</Text>
            <Text style={styles.summaryLabel}>Друзі</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.summaryCard, { borderColor: colors.yellow }]} onPress={() => onNavigateToGroups?.()}>
            <Text style={styles.summaryNumber}>{groupsCount !== null ? groupsCount : '-'}</Text>
            <Text style={styles.summaryLabel}>Групи</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.summaryCard, { borderColor: colors.coral }]} onPress={() => { /* open owes tab in parent */ }}>
            <Text style={styles.summaryNumber}>{owesCount !== null ? owesCount : '-'}</Text>
            <Text style={styles.summaryLabel}>Борги</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

// Helper function для кольорів номерів
const getNumberColor = (index: number): string => {
  const colorMap = [
    colors.yellow15,
    colors.coral15,
    colors.coral15,
    colors.primary15,
    colors.primary15,
  ];
  return colorMap[index] || colors.border_divider;
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.h3,
    color: colors.text,
  },
  appName: {
    ...typography.h2,
    color: colors.text,
  },
  bellIcon: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  premiumBanner: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  diamondIcon: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  diamondEmoji: {
    fontSize: 40,
  },
  premiumText: {
    flex: 1,
  },
  premiumTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 4,
  },
  premiumSubtitle: {
    ...typography.secondary,
    color: colors.text70,
  },
  walletCard: {
    backgroundColor: colors.card_surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  walletTitle: {
    ...typography.h3,
    color: colors.text70,
    marginBottom: 8,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  balanceAmount: {
    ...typography.h1,
    fontSize: 36,
    color: colors.text,
  },
  balanceCurrency: {
    ...typography.h3,
    color: colors.text70,
  },
  walletActions: {
    flexDirection: 'row',
    gap: 12,
  },
  walletButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  walletButtonText: {
    ...typography.CTA,
    color: colors.text,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card_surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: colors.green15,
  },
  tabText: {
    ...typography.main,
    color: colors.text70,
  },
  tabTextActive: {
    ...typography.main,
    fontWeight: '600',
    color: colors.text,
  },
  debtCard: {
    backgroundColor: colors.card_surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.green,
  },
  debtItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border_divider,
  },
  debtLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  debtNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  debtNumberText: {
    ...typography.secondary,
    fontWeight: '600',
    color: colors.text,
  },
  debtName: {
    ...typography.main,
    color: colors.text,
    flex: 1,
  },
  debtAmount: {
    ...typography.numbers,
    color: colors.text,
  },
  showMore: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  showMoreText: {
    ...typography.main,
    fontWeight: '600',
    color: colors.text,
  },
  groupsCard: {
    backgroundColor: colors.card_surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.yellow,
  },
  friendsCard: {
    backgroundColor: colors.card_surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.green,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.card_surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  summaryNumber: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 6,
  },
  summaryLabel: {
    ...typography.secondary,
    color: colors.text70,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  emptyText: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    ...typography.secondary,
    color: colors.text70,
    textAlign: 'center',
    marginBottom: 16,
  },
  createGroupButton: {
    backgroundColor: colors.yellow,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  createGroupText: {
    ...typography.CTA,
    color: colors.text,
  },
});

export default HomeScreen;
