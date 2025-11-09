import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { statisticsApi, FullStatistics } from '../services/api/endpoints/statistics';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { Button } from '../components/Button';

interface StatisticsScreenProps {
  onClose?: () => void;
  onNavigateToUserProfile?: (userId: number) => void;
}

const { width } = Dimensions.get('window');

const StatisticsScreen: React.FC<StatisticsScreenProps> = ({
  onClose,
  onNavigateToUserProfile,
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<FullStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const data = await statisticsApi.getFull();
      console.log('📊 Statistics data received:', JSON.stringify(data, null, 2));
      setStats(data);
    } catch (error) {
      console.error('❌ Failed to load statistics:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStatistics();
    setRefreshing(false);
  };

  if (loading && !stats) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>📊 Статистика</Text>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Завантаження...</Text>
        </View>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>📊 Статистика</Text>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Немає даних</Text>
        </View>
      </View>
    );
  }

  const balance = stats.summary.totalOwedToMe - stats.summary.totalIOweThem;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Статистика</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Загальна статистика */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Загальна статистика</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats.summary.totalFriends}</Text>
              <Text style={styles.statLabel}>Друзів</Text>
            </View>
            
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats.summary.totalGroups}</Text>
              <Text style={styles.statLabel}>Груп</Text>
            </View>
            
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats.summary.totalActiveOwes}</Text>
              <Text style={styles.statLabel}>Боргів</Text>
            </View>
            
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats.summary.totalReturns}</Text>
              <Text style={styles.statLabel}>Повернень</Text>
            </View>
          </View>

          <View style={styles.balanceSection}>
            <Text style={styles.balanceTitle}>Фінансовий баланс</Text>
            <Text style={[
              styles.balanceAmount,
              { color: balance >= 0 ? colors.green : colors.coral }
            ]}>
              {balance >= 0 ? '+' : ''}{balance.toFixed(2)} ₴
            </Text>
            <View style={styles.balanceBreakdown}>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceLabel}>Вам винні:</Text>
                <Text style={[styles.balanceValue, { color: colors.green }]}>
                  +{stats.summary.totalOwedToMe.toFixed(2)} ₴
                </Text>
              </View>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceLabel}>Ви винні:</Text>
                <Text style={[styles.balanceValue, { color: colors.coral }]}>
                  -{stats.summary.totalIOweThem.toFixed(2)} ₴
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Цікаві факти */}
        {stats.interestingFacts.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🎯 Цікаві факти</Text>
            {stats.interestingFacts.map((fact, index) => (
              <View key={index} style={styles.factItem}>
                <Text style={styles.factIcon}>{fact.icon}</Text>
                <View style={styles.factContent}>
                  <Text style={styles.factTitle}>{fact.title}</Text>
                  <Text style={styles.factValue}>{fact.value}</Text>
                  <Text style={styles.factDescription}>{fact.description}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Рекорди */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏆 Ваші рекорди</Text>
          
          {stats.biggestOweCreated && (
            <View style={styles.recordItem}>
              <Text style={styles.recordTitle}>💰 Найбільший створений борг</Text>
              <Text style={styles.recordValue}>
                {stats.biggestOweCreated.amount.toFixed(2)} ₴
              </Text>
              <Text style={styles.recordDetails}>
                для @{stats.biggestOweCreated.username}
              </Text>
            </View>
          )}

          {stats.biggestOweReceived && (
            <View style={styles.recordItem}>
              <Text style={styles.recordTitle}>📥 Найбільший отриманий борг</Text>
              <Text style={styles.recordValue}>
                {stats.biggestOweReceived.amount.toFixed(2)} ₴
              </Text>
              <Text style={styles.recordDetails}>
                від @{stats.biggestOweReceived.username}
              </Text>
            </View>
          )}

          {stats.averageOweAmount > 0 && (
            <View style={styles.recordItem}>
              <Text style={styles.recordTitle}>📊 Середня сума боргу</Text>
              <Text style={styles.recordValue}>
                {stats.averageOweAmount.toFixed(2)} ₴
              </Text>
            </View>
          )}

          <View style={styles.recordItem}>
            <Text style={styles.recordTitle}>📅 Найактивніший день</Text>
            <Text style={styles.recordValue}>{stats.mostActiveDay}</Text>
          </View>

          {stats.longestOwe && (
            <View style={styles.recordItem}>
              <Text style={styles.recordTitle}>⏳ Найдовший борг</Text>
              <Text style={styles.recordValue}>{stats.longestOwe.days} днів</Text>
              <Text style={styles.recordDetails}>
                з @{stats.longestOwe.username}
              </Text>
            </View>
          )}

          {stats.fastestReturn && (
            <View style={styles.recordItem}>
              <Text style={styles.recordTitle}>⚡ Найшвидше повернення</Text>
              <Text style={styles.recordValue}>
                {stats.fastestReturn.days} {stats.fastestReturn.days === 1 ? 'день' : 'днів'}
              </Text>
              <Text style={styles.recordDetails}>
                від @{stats.fastestReturn.username}
              </Text>
            </View>
          )}
        </View>

        {/* Топ друзів за кількістю */}
        {stats.topFriendsByOwes.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>👥 Топ друзів за кількістю боргів</Text>
            {stats.topFriendsByOwes.map((friend, index) => (
              <TouchableOpacity
                key={friend.userId}
                style={styles.topItem}
                onPress={() => onNavigateToUserProfile?.(friend.userId)}
              >
                <View style={styles.topRank}>
                  <Text style={styles.topRankText}>#{index + 1}</Text>
                </View>
                <View style={styles.topInfo}>
                  <Text style={styles.topName}>@{friend.username}</Text>
                  <Text style={styles.topDescription}>{friend.description}</Text>
                </View>
                <Text style={styles.topValue}>{friend.value}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Топ друзів за сумою */}
        {stats.topFriendsByAmount.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>💵 Топ друзів за сумою боргів</Text>
            {stats.topFriendsByAmount.map((friend, index) => (
              <TouchableOpacity
                key={friend.userId}
                style={styles.topItem}
                onPress={() => onNavigateToUserProfile?.(friend.userId)}
              >
                <View style={styles.topRank}>
                  <Text style={styles.topRankText}>#{index + 1}</Text>
                </View>
                <View style={styles.topInfo}>
                  <Text style={styles.topName}>@{friend.username}</Text>
                  <Text style={styles.topDescription}>{friend.description}</Text>
                </View>
                <Text style={styles.topValue}>{friend.value.toFixed(0)} ₴</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Топ груп */}
        {stats.topGroups.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🎯 Топ груп за активністю</Text>
            {stats.topGroups.map((group, index) => (
              <View key={group.groupId} style={styles.topItem}>
                <View style={styles.topRank}>
                  <Text style={styles.topRankText}>#{index + 1}</Text>
                </View>
                <View style={styles.topInfo}>
                  <Text style={styles.topName}>{group.groupName}</Text>
                  <Text style={styles.topDescription}>{group.description}</Text>
                </View>
                <Text style={styles.topValue}>{group.value}</Text>
              </View>
            ))}
          </View>
        )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: colors.card_surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border_divider,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    ...typography.h3,
    color: colors.text,
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
  loadingText: {
    ...typography.main,
    color: colors.text70,
  },
  card: {
    backgroundColor: colors.card_surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.secondary,
    color: colors.text70,
    textAlign: 'center',
  },
  balanceSection: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border_divider,
    alignItems: 'center',
  },
  balanceTitle: {
    ...typography.main,
    color: colors.text70,
    marginBottom: 8,
  },
  balanceAmount: {
    ...typography.h1,
    marginBottom: 16,
  },
  balanceBreakdown: {
    width: '100%',
    gap: 8,
  },
  balanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    ...typography.main,
    color: colors.text70,
  },
  balanceValue: {
    ...typography.h3,
    fontWeight: '600',
  },
  factItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  factIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  factContent: {
    flex: 1,
  },
  factTitle: {
    ...typography.main,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  factValue: {
    ...typography.h3,
    color: colors.purple,
    marginBottom: 4,
  },
  factDescription: {
    ...typography.secondary,
    color: colors.text70,
  },
  recordItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  recordTitle: {
    ...typography.main,
    color: colors.text70,
    marginBottom: 4,
  },
  recordValue: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 4,
  },
  recordDetails: {
    ...typography.secondary,
    color: colors.text70,
  },
  topItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: 8,
  },
  topRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.purple,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topRankText: {
    ...typography.secondary,
    fontWeight: '600',
    color: colors.text,
  },
  topInfo: {
    flex: 1,
  },
  topName: {
    ...typography.main,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  topDescription: {
    ...typography.secondary,
    color: colors.text70,
  },
  topValue: {
    ...typography.h3,
    color: colors.purple,
  },
});

export default StatisticsScreen;
