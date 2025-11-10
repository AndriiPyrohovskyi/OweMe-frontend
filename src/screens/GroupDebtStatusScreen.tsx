import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { owesApi, OweParticipant, OweStatus } from '../services/api/endpoints/owes';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { HeaderBar } from '../components/HeaderBar';
import { Button } from '../components/Button';

interface GroupDebtStatusScreenProps {
  groupId: number;
  onBack: () => void;
}

interface DebtSummary {
  userId: number;
  username: string;
  avatarUrl?: string;
  owesToGroup: number; // Скільки користувач винен групі
  groupOwesToUser: number; // Скільки група винна користувачу
  balance: number; // Баланс (+ якщо йому винні, - якщо він винен)
  debts: OweParticipant[]; // Деталі боргів
}

export const GroupDebtStatusScreen: React.FC<GroupDebtStatusScreenProps> = ({
  groupId,
  onBack,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [participants, setParticipants] = useState<OweParticipant[]>([]);
  const [debtSummaries, setDebtSummaries] = useState<DebtSummary[]>([]);
  const [expandedUsers, setExpandedUsers] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadDebtStatus();
  }, [groupId]);

  const loadDebtStatus = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      // Завантажити всі борги групи
      const groupParticipants = await owesApi.getOweParticipantsByGroup(groupId);
      console.log('📊 Group Participants:', groupParticipants);

      // Фільтруємо тільки Accepted та Opened (які можна прийняти)
      const relevantParticipants = (Array.isArray(groupParticipants) ? groupParticipants : [])
        .filter(p => p && (p.status === OweStatus.Accepted || p.status === OweStatus.Opened));

      setParticipants(relevantParticipants);

      // Групуємо по користувачам
      const summariesMap = new Map<number, DebtSummary>();

      relevantParticipants.forEach(participant => {
        if (!participant.toUser) return;

        const userId = participant.toUser.id;
        
        if (!summariesMap.has(userId)) {
          summariesMap.set(userId, {
            userId,
            username: participant.toUser.username,
            avatarUrl: participant.toUser.avatarUrl,
            owesToGroup: 0,
            groupOwesToUser: 0,
            balance: 0,
            debts: [],
          });
        }

        const summary = summariesMap.get(userId)!;
        summary.debts.push(participant);

        // Якщо статус Accepted, рахуємо суму
        if (participant.status === OweStatus.Accepted) {
          summary.groupOwesToUser += participant.sum;
        }
      });

      // Розрахунок балансу
      summariesMap.forEach(summary => {
        summary.balance = summary.groupOwesToUser - summary.owesToGroup;
      });

      const summariesArray = Array.from(summariesMap.values())
        .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));

      setDebtSummaries(summariesArray);
    } catch (error) {
      console.error('Failed to load debt status:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити борговий статус');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDebtStatus(false);
  };

  const toggleUserExpanded = (userId: number) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const handleAcceptDebt = async (participantId: number) => {
    try {
      await owesApi.acceptOweParticipant(participantId);
      Alert.alert('Успіх', 'Борг прийнято');
      loadDebtStatus(false);
    } catch (error) {
      console.error('Failed to accept debt:', error);
      Alert.alert('Помилка', 'Не вдалося прийняти борг');
    }
  };

  const handleDeclineDebt = async (participantId: number) => {
    Alert.alert(
      'Відхилити борг',
      'Ви впевнені, що хочете відхилити цей борг?',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Відхилити',
          style: 'destructive',
          onPress: async () => {
            try {
              await owesApi.declineOweParticipant(participantId);
              Alert.alert('Успіх', 'Борг відхилено');
              loadDebtStatus(false);
            } catch (error) {
              console.error('Failed to decline debt:', error);
              Alert.alert('Помилка', 'Не вдалося відхилити борг');
            }
          },
        },
      ]
    );
  };

  const renderDebtItem = (participant: OweParticipant, isCurrentUser: boolean) => {
    const isOpened = participant.status === OweStatus.Opened;
    const canAccept = isOpened && isCurrentUser;

    return (
      <View key={participant.id} style={styles.debtDetailItem}>
        <View style={styles.debtDetailInfo}>
          <Text style={styles.debtDetailName}>
            {participant.oweItem?.name || 'Без назви'}
          </Text>
          <Text style={styles.debtDetailDescription}>
            Сума: {participant.sum.toFixed(0)} ₴
          </Text>
          <View style={styles.statusBadge}>
            <Text style={[
              styles.statusText,
              participant.status === OweStatus.Accepted && styles.statusAccepted,
              participant.status === OweStatus.Opened && styles.statusOpened,
            ]}>
              {participant.status === OweStatus.Accepted ? '✓ Прийнято' : '⏳ Очікує'}
            </Text>
          </View>
        </View>

        {canAccept && (
          <View style={styles.debtActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleAcceptDebt(participant.id)}
            >
              <Text style={styles.actionButtonText}>✓</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.declineButton]}
              onPress={() => handleDeclineDebt(participant.id)}
            >
              <Text style={styles.actionButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderUserSummary = (summary: DebtSummary) => {
    const isExpanded = expandedUsers.has(summary.userId);
    const isCurrentUser = user?.id === summary.userId;
    const hasPendingDebts = summary.debts.some(d => d.status === OweStatus.Opened);

    return (
      <View key={summary.userId} style={styles.summaryCard}>
        <TouchableOpacity
          style={styles.summaryHeader}
          onPress={() => toggleUserExpanded(summary.userId)}
          activeOpacity={0.7}
        >
          <View style={styles.summaryUserInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {summary.username.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.summaryText}>
              <Text style={styles.summaryUsername}>
                {summary.username}
                {isCurrentUser && <Text style={styles.youBadge}> (Ви)</Text>}
              </Text>
              <Text style={styles.summaryDebtsCount}>
                {summary.debts.length} борг{summary.debts.length === 1 ? '' : 'ів'}
                {hasPendingDebts && ' • ⏳ Є очікуючі'}
              </Text>
            </View>
          </View>

          <View style={styles.summaryBalance}>
            <Text style={[
              styles.balanceAmount,
              summary.balance > 0 ? styles.positiveBalance : styles.negativeBalance,
            ]}>
              {summary.balance > 0 ? '+' : ''}{summary.balance.toFixed(0)} ₴
            </Text>
            <Text style={styles.expandIcon}>
              {isExpanded ? '▼' : '▶'}
            </Text>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.debtDetails}>
            {summary.debts.map(debt => renderDebtItem(debt, isCurrentUser))}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <HeaderBar title="Борговий статус" onBack={onBack} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <HeaderBar title="Борговий статус" onBack={onBack} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {/* Загальна статистика */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>📊 Загальна статистика</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{participants.length}</Text>
              <Text style={styles.statLabel}>Всього боргів</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.green }]}>
                {participants.filter(p => p.status === OweStatus.Accepted).length}
              </Text>
              <Text style={styles.statLabel}>Прийнято</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.yellow }]}>
                {participants.filter(p => p.status === OweStatus.Opened).length}
              </Text>
              <Text style={styles.statLabel}>Очікує</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{debtSummaries.length}</Text>
              <Text style={styles.statLabel}>Учасників</Text>
            </View>
          </View>
        </View>

        {/* Список боргів по користувачам */}
        {debtSummaries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎉</Text>
            <Text style={styles.emptyText}>
              У групі немає активних боргів
            </Text>
          </View>
        ) : (
          debtSummaries.map(renderUserSummary)
        )}
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
    padding: 16,
    paddingBottom: 100,
  },
  statsCard: {
    backgroundColor: colors.card_surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.purple,
  },
  statsTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    width: '47%',
    alignItems: 'center',
    paddingVertical: 8,
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
  summaryCard: {
    backgroundColor: colors.card_surface,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border_divider,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  summaryUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    ...typography.h3,
    color: colors.text,
  },
  summaryText: {
    flex: 1,
  },
  summaryUsername: {
    ...typography.main,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  youBadge: {
    ...typography.secondary,
    color: colors.primary,
    fontWeight: '600',
  },
  summaryDebtsCount: {
    ...typography.secondary,
    color: colors.text70,
  },
  summaryBalance: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
  },
  balanceAmount: {
    ...typography.numbers,
    fontWeight: '600',
    fontSize: 18,
  },
  positiveBalance: {
    color: colors.green,
  },
  negativeBalance: {
    color: colors.coral,
  },
  expandIcon: {
    ...typography.secondary,
    color: colors.text70,
  },
  debtDetails: {
    backgroundColor: colors.background,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border_divider,
  },
  debtDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: colors.card_surface,
    borderRadius: 8,
    marginBottom: 8,
  },
  debtDetailInfo: {
    flex: 1,
    marginRight: 12,
  },
  debtDetailName: {
    ...typography.main,
    color: colors.text,
    marginBottom: 2,
  },
  debtDetailDescription: {
    ...typography.secondary,
    color: colors.text70,
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: colors.border_divider,
  },
  statusText: {
    ...typography.secondary,
    fontSize: 11,
    color: colors.text70,
  },
  statusAccepted: {
    color: colors.green,
  },
  statusOpened: {
    color: colors.yellow,
  },
  debtActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: colors.green,
  },
  declineButton: {
    backgroundColor: colors.coral,
  },
  actionButtonText: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    ...typography.h3,
    color: colors.text70,
    textAlign: 'center',
  },
});
