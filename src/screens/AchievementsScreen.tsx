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
import { achievementsApi, AchievementsSummary, Achievement } from '../services/api/endpoints/achievements';
import colors from '../theme/colors';
import typography from '../theme/typography';

interface AchievementsScreenProps {
  onClose?: () => void;
}

const { width } = Dimensions.get('window');

const TIER_COLORS = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
  diamond: '#B9F2FF',
};

const TIER_NAMES = {
  bronze: 'Бронза',
  silver: 'Срібло',
  gold: 'Золото',
  platinum: 'Платина',
  diamond: 'Діамант',
};

const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [data, setData] = useState<AchievementsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const achievements = await achievementsApi.getAll();
      console.log('🏆 Achievements data received:', JSON.stringify(achievements, null, 2));
      setData(achievements);
    } catch (error) {
      console.error('❌ Failed to load achievements:', error);
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
    await loadAchievements();
    setRefreshing(false);
  };

  if (loading && !data) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🏆 Досягнення</Text>
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

  if (!data) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🏆 Досягнення</Text>
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

  const filteredAchievements = data.achievements.filter((achievement) => {
    if (filter === 'unlocked') return achievement.unlocked;
    if (filter === 'locked') return !achievement.unlocked;
    return true;
  });

  const getProgressPercentage = (achievement: Achievement) => {
    return Math.min((achievement.progress / achievement.target) * 100, 100);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Досягнення</Text>
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
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View>
              <Text style={styles.summaryTitle}>Ваш прогрес</Text>
              <Text style={styles.summarySubtitle}>
                {data.unlockedCount} з {data.totalCount} досягнень
              </Text>
            </View>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsText}>{data.totalPoints}</Text>
              <Text style={styles.pointsLabel}>балів</Text>
            </View>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${data.completionPercentage}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {data.completionPercentage.toFixed(1)}% завершено
            </Text>
          </View>
        </View>

        {/* Recently Unlocked */}
        {data.recentlyUnlocked.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎉 Нещодавно отримані</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.recentScroll}
            >
              {data.recentlyUnlocked.map((achievement) => (
                <View
                  key={achievement.id}
                  style={[
                    styles.recentCard,
                    {
                      borderColor:
                        TIER_COLORS[achievement.tier as keyof typeof TIER_COLORS],
                    },
                  ]}
                >
                  <Text style={styles.recentIcon}>{achievement.icon}</Text>
                  <Text style={styles.recentTitle} numberOfLines={1}>
                    {achievement.title}
                  </Text>
                  <View
                    style={[
                      styles.recentTierBadge,
                      {
                        backgroundColor:
                          TIER_COLORS[achievement.tier as keyof typeof TIER_COLORS],
                      },
                    ]}
                  >
                    <Text style={styles.recentTierText}>
                      {TIER_NAMES[achievement.tier as keyof typeof TIER_NAMES]}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'all' && styles.filterTabTextActive,
              ]}
            >
              Всі ({data.totalCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === 'unlocked' && styles.filterTabActive,
            ]}
            onPress={() => setFilter('unlocked')}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'unlocked' && styles.filterTabTextActive,
              ]}
            >
              Отримані ({data.unlockedCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === 'locked' && styles.filterTabActive,
            ]}
            onPress={() => setFilter('locked')}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'locked' && styles.filterTabTextActive,
              ]}
            >
              Заблоковані ({data.totalCount - data.unlockedCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Achievements List */}
        <View style={styles.achievementsList}>
          {filteredAchievements.map((achievement) => {
            const progressPercentage = getProgressPercentage(achievement);
            const tierColor =
              TIER_COLORS[achievement.tier as keyof typeof TIER_COLORS];

            return (
              <View
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  achievement.unlocked && styles.achievementCardUnlocked,
                  { borderLeftColor: tierColor },
                ]}
              >
                <View style={styles.achievementHeader}>
                  <View style={styles.achievementIconContainer}>
                    <Text
                      style={[
                        styles.achievementIcon,
                        !achievement.unlocked && styles.achievementIconLocked,
                      ]}
                    >
                      {achievement.unlocked ? achievement.icon : '🔒'}
                    </Text>
                  </View>

                  <View style={styles.achievementInfo}>
                    <View style={styles.achievementTitleRow}>
                      <Text style={styles.achievementTitle}>
                        {achievement.title}
                      </Text>
                      <View
                        style={[
                          styles.achievementTierBadge,
                          { backgroundColor: tierColor },
                        ]}
                      >
                        <Text style={styles.achievementTierText}>
                          {TIER_NAMES[achievement.tier as keyof typeof TIER_NAMES]}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.achievementDescription}>
                      {achievement.unlocked
                        ? achievement.description
                        : '???'}
                    </Text>

                    <View style={styles.achievementProgress}>
                      <View style={styles.progressInfo}>
                        <Text style={styles.progressLabel}>
                          {achievement.progress} / {achievement.target}
                        </Text>
                        <Text style={styles.achievementPoints}>
                          {achievement.points} балів
                        </Text>
                      </View>
                      <View style={styles.miniProgressBarBackground}>
                        <View
                          style={[
                            styles.miniProgressBarFill,
                            {
                              width: `${progressPercentage}%`,
                              backgroundColor: achievement.unlocked
                                ? tierColor
                                : colors.text70,
                            },
                          ]}
                        />
                      </View>
                    </View>

                    {achievement.unlocked && achievement.unlockedAt && (
                      <Text style={styles.unlockedDate}>
                        Отримано:{' '}
                        {new Date(achievement.unlockedAt).toLocaleDateString(
                          'uk-UA',
                          {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          }
                        )}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {filteredAchievements.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyText}>
              {filter === 'unlocked'
                ? 'Поки немає отриманих досягнень'
                : 'Всі досягнення отримані!'}
            </Text>
            <Text style={styles.emptySubtext}>
              {filter === 'unlocked'
                ? 'Продовжуйте користуватись додатком, щоб отримати перші досягнення!'
                : 'Ви - справжній майстер OweMe! 🎉'}
            </Text>
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
  summaryCard: {
    backgroundColor: colors.card_surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.yellow,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 4,
  },
  summarySubtitle: {
    ...typography.secondary,
    color: colors.text70,
  },
  pointsBadge: {
    backgroundColor: colors.yellow,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: 70,
  },
  pointsText: {
    ...typography.h2,
    color: colors.text,
  },
  pointsLabel: {
    ...typography.secondary,
    color: colors.text70,
    marginTop: 2,
  },
  progressBarContainer: {
    gap: 8,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: colors.background,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.yellow,
    borderRadius: 6,
  },
  progressText: {
    ...typography.secondary,
    color: colors.text70,
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 12,
  },
  recentScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  recentCard: {
    width: 140,
    backgroundColor: colors.card_surface,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  recentIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  recentTitle: {
    ...typography.main,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  recentTierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  recentTierText: {
    ...typography.secondary,
    fontSize: 10,
    fontWeight: '600',
    color: colors.text,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card_surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterTabActive: {
    backgroundColor: colors.purple,
  },
  filterTabText: {
    ...typography.main,
    color: colors.text70,
  },
  filterTabTextActive: {
    color: colors.text,
    fontWeight: '600',
  },
  achievementsList: {
    gap: 12,
  },
  achievementCard: {
    backgroundColor: colors.card_surface,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
  },
  achievementCardUnlocked: {
    borderWidth: 1,
    borderColor: colors.border_divider,
  },
  achievementHeader: {
    flexDirection: 'row',
  },
  achievementIconContainer: {
    marginRight: 12,
  },
  achievementIcon: {
    fontSize: 48,
  },
  achievementIconLocked: {
    opacity: 0.3,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  achievementTitle: {
    ...typography.main,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  achievementTierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  achievementTierText: {
    ...typography.secondary,
    fontSize: 10,
    fontWeight: '600',
    color: colors.text,
  },
  achievementDescription: {
    ...typography.secondary,
    color: colors.text70,
    marginBottom: 12,
  },
  achievementProgress: {
    gap: 6,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    ...typography.secondary,
    color: colors.text70,
  },
  achievementPoints: {
    ...typography.secondary,
    color: colors.purple,
    fontWeight: '600',
  },
  miniProgressBarBackground: {
    height: 6,
    backgroundColor: colors.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  miniProgressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  unlockedDate: {
    ...typography.secondary,
    fontSize: 11,
    color: colors.text70,
    marginTop: 8,
    fontStyle: 'italic',
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
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    ...typography.secondary,
    color: colors.text70,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default AchievementsScreen;
