import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { walletApi } from '../services/api/endpoints';
import { statisticsApi, SummaryStatistics } from '../services/api/endpoints/statistics';
import { owesApi, FullOwe, OweParticipant, OweStatus } from '../services/api/endpoints/owes';
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
  onNavigateToNotifications?: () => void;
  onNavigateToFriends?: () => void;
  onNavigateToGroups?: () => void;
  onNavigateToTopUp?: () => void;
  onNavigateToTransfer?: () => void;
  onNavigateToOwes?: () => void;
  onNavigateToStatistics?: () => void;
}

// Quick Debts Section Component
interface QuickDebtsSectionProps {
  onNavigateToOwes?: () => void;
}

const QuickDebtsSection: React.FC<QuickDebtsSectionProps> = ({ onNavigateToOwes }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myOwes, setMyOwes] = useState<FullOwe[]>([]);
  const [owedToMe, setOwedToMe] = useState<OweParticipant[]>([]);

  useEffect(() => {
    loadQuickDebts();
  }, []);

  const loadQuickDebts = async () => {
    try {
      setLoading(true);
      
      let owesArray: FullOwe[] = [];
      let participantsArray: OweParticipant[] = [];
      
      // Завантажити мої борги (я створив FullOwe)
      try {
        const owesData = await owesApi.getMyFullOwes();
        console.log('📊 Quick Debts - My Owes:', owesData);
        // Backend returns { sended: FullOwe[], received: FullOwe[] }
        if (owesData && typeof owesData === 'object') {
          const d = owesData as any;
          if (Array.isArray(d.sended)) owesArray = d.sended;
          else if (Array.isArray(d)) owesArray = d as FullOwe[]; // defensive
        } else if (Array.isArray(owesData)) {
          owesArray = owesData as FullOwe[];
        }
      } catch (err) {
        console.error('Failed to load my owes:', err);
      }
      
      // Завантажити борги де мені винні (я toUser в OweParticipant)
      try {
        const participantsData = await owesApi.getMyOweParticipants();
        console.log('📊 Quick Debts - Owed to Me:', participantsData);
        // Backend may return { out: OweParticipant[], in: OweParticipant[] }
        if (participantsData && typeof participantsData === 'object') {
          const p = participantsData as any;
          if (Array.isArray(p.in)) participantsArray = p.in;
          else if (Array.isArray(p)) participantsArray = p as OweParticipant[]; // defensive
        } else if (Array.isArray(participantsData)) {
          participantsArray = participantsData as OweParticipant[];
        }
      } catch (err) {
        console.error('Failed to load participants:', err);
      }
      
      // Фільтруємо тільки Accepted статус
      const activeOwes = owesArray.filter(owe => {
        if (!owe || !owe.oweItems || !Array.isArray(owe.oweItems)) return false;
        return owe.oweItems.some(item => {
          if (!item || !item.oweParticipants || !Array.isArray(item.oweParticipants)) return false;
          return item.oweParticipants.some(p => p && p.status === OweStatus.Accepted);
        });
      });
      
      const activeParticipants = participantsArray.filter(p => p && p.status === OweStatus.Accepted);
      
      console.log('📊 Active Owes:', activeOwes.length);
      console.log('📊 Active Participants:', activeParticipants.length);
      console.log('📊 Active Owes data:', activeOwes);
      console.log('📊 Active Participants data:', activeParticipants);
      
      setMyOwes(activeOwes.slice(0, 3)); // Топ 3
      setOwedToMe(activeParticipants.slice(0, 3)); // Топ 3
    } catch (error) {
      console.error('Failed to load quick debts:', error);
      setMyOwes([]);
      setOwedToMe([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={quickDebtsStyles.container}>
        <View style={quickDebtsStyles.header}>
          <Text style={quickDebtsStyles.title}>💰 Швидкий огляд боргів</Text>
        </View>
        <View style={quickDebtsStyles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (myOwes.length === 0 && owedToMe.length === 0) {
    return (
      <View style={quickDebtsStyles.container}>
        <View style={quickDebtsStyles.header}>
          <Text style={quickDebtsStyles.title}>💰 Швидкий огляд боргів</Text>
          <TouchableOpacity onPress={onNavigateToOwes}>
            <Text style={quickDebtsStyles.seeAll}>Переглянути всі →</Text>
          </TouchableOpacity>
        </View>
        <View style={quickDebtsStyles.emptyContainer}>
          <Text style={quickDebtsStyles.emptyText}>🎉 У вас немає активних боргів</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={quickDebtsStyles.container}>
      <View style={quickDebtsStyles.header}>
        <Text style={quickDebtsStyles.title}>💰 Швидкий огляд боргів</Text>
        <TouchableOpacity onPress={onNavigateToOwes}>
          <Text style={quickDebtsStyles.seeAll}>Переглянути всі →</Text>
        </TouchableOpacity>
      </View>

      {/* Вам винні */}
      {owedToMe.length > 0 && (
        <View style={quickDebtsStyles.section}>
          <Text style={quickDebtsStyles.sectionTitle}>💚 Вам винні</Text>
          {owedToMe.map((participant) => {
            const displayAmount = Number(participant.sum) || 0;
            return (
              <TouchableOpacity
                key={participant.id}
                style={quickDebtsStyles.debtItem}
                onPress={onNavigateToOwes}
                activeOpacity={0.7}
              >
                <View style={quickDebtsStyles.debtInfo}>
                  <Text style={quickDebtsStyles.debtName}>
                    {participant.oweItem?.name || 'Без назви'}
                  </Text>
                  <Text style={quickDebtsStyles.debtDescription}>
                    від {participant.toUser?.username || participant.group?.name || 'Невідомо'}
                  </Text>
                </View>
                <View style={quickDebtsStyles.amountContainer}>
                  <Text style={[quickDebtsStyles.debtAmount, { color: colors.green }]}>
                    +{displayAmount.toFixed(0)} ₴
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Ви винні */}
      {myOwes.length > 0 && (
        <View style={quickDebtsStyles.section}>
          <Text style={quickDebtsStyles.sectionTitle}>💸 Ви винні</Text>
          {myOwes.map((owe) => {
            if (!owe.oweItems || !Array.isArray(owe.oweItems)) {
              return null;
            }
            
            const totalAmount = owe.oweItems.reduce((sum, item) => {
              if (!item.oweParticipants || !Array.isArray(item.oweParticipants)) {
                return sum;
              }
              return sum + item.oweParticipants
                .filter(p => p && p.status === OweStatus.Accepted)
                .reduce((pSum, p) => {
                  const amount = Number(p.sum) || 0;
                  return pSum + amount;
                }, 0);
            }, 0);
            
            const displayAmount = Number(totalAmount) || 0;
            
            return (
              <TouchableOpacity
                key={owe.id}
                style={quickDebtsStyles.debtItem}
                onPress={onNavigateToOwes}
                activeOpacity={0.7}
              >
                <View style={quickDebtsStyles.debtInfo}>
                  <Text style={quickDebtsStyles.debtName}>{owe.name || 'Без назви'}</Text>
                  <Text style={quickDebtsStyles.debtDescription}>
                    {owe.oweItems.length} позиці{owe.oweItems.length === 1 ? 'я' : 'ї'}
                  </Text>
                </View>
                <View style={quickDebtsStyles.amountContainer}>
                  <Text style={[quickDebtsStyles.debtAmount, { color: colors.coral }]}>
                    -{displayAmount.toFixed(0)} ₴
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const HomeScreen: React.FC<HomeScreenProps> = ({ 
  onNavigateToProfile,
  onNavigateToNotifications,
  onNavigateToFriends, 
  onNavigateToGroups,
  onNavigateToTopUp,
  onNavigateToTransfer,
  onNavigateToOwes,
  onNavigateToStatistics,
}) => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'owe' | 'owed'>('owe'); // Вам винні / Ви винні
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<SummaryStatistics | null>(null);
  
  // Завантаження балансу та статистики з API
  useEffect(() => {
    loadBalance();
    loadStatistics();
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

  const loadStatistics = async () => {
    try {
      const stats = await statisticsApi.getSummary();
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadBalance(), loadStatistics()]);
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
        const myOwes: any = await owesApi.getMyFullOwes();
        // myOwes can be { sended: [], received: [] } or an array
        if (myOwes && typeof myOwes === 'object') {
          if (Array.isArray(myOwes)) {
            setOwesCount(myOwes.length);
          } else {
            const len = (Array.isArray(myOwes.sended) ? myOwes.sended.length : 0) + 
                       (Array.isArray(myOwes.received) ? myOwes.received.length : 0);
            setOwesCount(len);
          }
        } else {
          setOwesCount(0);
        }
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
        avatarUrl={user?.avatarUrl}
        onAvatarPress={onNavigateToProfile}
        onNotificationPress={onNavigateToNotifications}
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

        {/* Quick Statistics */}
        {statistics && (
          <TouchableOpacity 
            style={styles.statsCard}
            onPress={onNavigateToStatistics}
            activeOpacity={0.7}
          >
            <View style={styles.statsHeader}>
              <Text style={styles.statsTitle}>📊 Швидка статистика</Text>
              <Text style={styles.statsLink}>Детальніше →</Text>
            </View>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{statistics.totalActiveOwes}</Text>
                <Text style={styles.statLabel}>Активних боргів</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.green }]}>
                  {statistics.totalOwedToMe.toFixed(0)} ₴
                </Text>
                <Text style={styles.statLabel}>Вам винні</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.coral }]}>
                  {statistics.totalIOweThem.toFixed(0)} ₴
                </Text>
                <Text style={styles.statLabel}>Ви винні</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{statistics.totalReturns}</Text>
                <Text style={styles.statLabel}>Повернень</Text>
              </View>
            </View>

            <View style={styles.balanceIndicator}>
              <Text style={styles.balanceText}>
                {statistics.totalOwedToMe - statistics.totalIOweThem >= 0 ? '📈' : '📉'}
                {' '}Баланс:{' '}
                <Text style={{
                  color: statistics.totalOwedToMe - statistics.totalIOweThem >= 0 
                    ? colors.green 
                    : colors.coral
                }}>
                  {Math.abs(statistics.totalOwedToMe - statistics.totalIOweThem).toFixed(0)} ₴
                </Text>
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Quick Debts Overview */}
        <QuickDebtsSection onNavigateToOwes={onNavigateToOwes} />

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

          <TouchableOpacity style={[styles.summaryCard, { borderColor: colors.coral }]} onPress={() => onNavigateToOwes?.()}>
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
  statsCard: {
    backgroundColor: colors.card_surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.purple,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    ...typography.h3,
    color: colors.text,
  },
  statsLink: {
    ...typography.secondary,
    color: colors.purple,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    width: '47%',
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.secondary,
    color: colors.text70,
    textAlign: 'center',
  },
  balanceIndicator: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border_divider,
    alignItems: 'center',
  },
  balanceText: {
    ...typography.main,
    color: colors.text,
    fontWeight: '600',
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

// Styles for QuickDebtsSection
const quickDebtsStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.card_surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  seeAll: {
    ...typography.secondary,
    color: colors.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.main,
    color: colors.text70,
    textAlign: 'center',
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    ...typography.main,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  debtItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: 6,
  },
  debtInfo: {
    flex: 1,
    marginRight: 12,
  },
  debtName: {
    ...typography.main,
    color: colors.text,
    marginBottom: 2,
  },
  debtDescription: {
    ...typography.secondary,
    color: colors.text70,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  debtAmount: {
    ...typography.numbers,
    fontWeight: '600',
  },
});

export default HomeScreen;
