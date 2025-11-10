import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { friendsApi, UserSearchResult, FriendshipStatus } from '../services/api/endpoints/friends';
import { usersApi } from '../services/api/endpoints/users';
import { Icon } from '../components/Icon';
import { Button } from '../components/Button';
import colors from '../theme/colors';
import typography from '../theme/typography';

interface UserProfileScreenProps {
  userId?: number;
  username?: string;
  onBack: () => void;
  onNavigateToCreateOwe?: (friendId: number) => void;
  onNavigateToInviteToGroup?: (userId: number) => void;
}

const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ 
  userId, 
  username, 
  onBack,
  onNavigateToCreateOwe,
  onNavigateToInviteToGroup,
}) => {
  const { user: currentUser } = useAuth();
  const insets = useSafeAreaInsets();
  const [profileUser, setProfileUser] = useState<UserSearchResult | null>(null);
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus>({
    areFriends: false,
    hasRequest: false,
  });
  const [friendCount, setFriendCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, [userId, username]);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      let user: UserSearchResult | null = null;

      if (!currentUser) return;

      const role = await usersApi.getCurrentRole(currentUser.id);
      const adminStatus = role === 'Admin';
      setIsAdmin(adminStatus);


      // Завантажити дані користувача
      if (username) {
        user = await friendsApi.getUserProfileByUsername(username);
      } else if (userId) {
        // Якщо є тільки ID, завантажуємо через пошук
        const results = await friendsApi.searchUsers('');
        user = results.find(u => u.id === userId) || null;
      }

      if (!user) {
        Alert.alert('Помилка', 'Користувача не знайдено');
        onBack();
        return;
      }

      setProfileUser(user);

      // Завантажити статус дружби та кількість друзів
      if (currentUser?.id && user.id !== currentUser.id) {
        const [status, count] = await Promise.all([
          friendsApi.getFriendshipStatus(currentUser.id, user.id),
          friendsApi.getFriendCount(user.id),
        ]);
        setFriendshipStatus(status);
        setFriendCount(count);
      } else {
        const count = await friendsApi.getFriendCount(user.id);
        setFriendCount(count);
      }

      if (adminStatus && user.id !== currentUser?.id) {
        try {
          const stats = await usersApi.getAdminStats(user.id);
          setAdminStats(stats);
        } catch (error) {
          console.error('Failed to load admin stats:', error);
        }
      }
    } catch (error: any) {
      console.error('Failed to load user profile:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити профіль користувача');
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!profileUser || !currentUser) return;

    setActionLoading(true);
    try {
      await friendsApi.sendFriendRequest(profileUser.id);
      Alert.alert('Успіх', 'Запит на дружбу відправлено!');
      await loadUserProfile();
    } catch (error: any) {
      console.error('Failed to send friend request:', error);
      Alert.alert('Помилка', error.message || 'Не вдалося відправити запит');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!friendshipStatus.requestId) return;

    setActionLoading(true);
    try {
      await friendsApi.acceptRequest(friendshipStatus.requestId);
      Alert.alert('Успіх', 'Запит прийнято!');
      await loadUserProfile();
    } catch (error: any) {
      console.error('Failed to accept request:', error);
      Alert.alert('Помилка', 'Не вдалося прийняти запит');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineRequest = async () => {
    if (!friendshipStatus.requestId) return;

    Alert.alert(
      'Відхилити запит',
      'Ви впевнені, що хочете відхилити цей запит?',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Відхилити',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await friendsApi.declineRequest(friendshipStatus.requestId!);
              Alert.alert('Успіх', 'Запит відхилено');
              await loadUserProfile();
            } catch (error: any) {
              console.error('Failed to decline request:', error);
              Alert.alert('Помилка', 'Не вдалося відхилити запит');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCancelRequest = async () => {
    if (!friendshipStatus.requestId) return;

    Alert.alert(
      'Скасувати запит',
      'Ви впевнені, що хочете скасувати цей запит?',
      [
        { text: 'Ні', style: 'cancel' },
        {
          text: 'Так',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await friendsApi.cancelRequest(friendshipStatus.requestId!);
              Alert.alert('Успіх', 'Запит скасовано');
              await loadUserProfile();
            } catch (error: any) {
              console.error('Failed to cancel request:', error);
              Alert.alert('Помилка', 'Не вдалося скасувати запит');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleBanUser = async () => {
    if (!profileUser) return;
    
    if (profileUser.id === currentUser?.id) {
      Alert.alert('Помилка', 'Ви не можете заблокувати самого себе!');
      return;
    }
    
    Alert.alert(
      'Заблокувати користувача',
      `Ви впевнені, що хочете заблокувати ${profileUser.username}?`,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Заблокувати',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await usersApi.banUser({ userId: profileUser.id, reason: 'Banned by admin' });
              Alert.alert('Успіх', 'Користувача заблоковано');
              await loadUserProfile();
            } catch (error: any) {
              const message = error.response?.data?.message || 'Не вдалося заблокувати користувача';
              Alert.alert('Помилка', message);
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleUnbanUser = async () => {
    if (!profileUser) return;
    setActionLoading(true);
    try {
      await usersApi.unbanUser({ userId: profileUser.id });
      Alert.alert('Успіх', 'Користувача розблоковано');
      await loadUserProfile();
    } catch (error: any) {
      Alert.alert('Помилка', 'Не вдалося розблокувати користувача');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetFields = async () => {
    if (!profileUser) return;
    Alert.alert(
      'Скинути поля',
      'Скинути ім\'я, прізвище та опис до дефолтних значень?',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Скинути',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await usersApi.resetFields(profileUser.id);
              Alert.alert('Успіх', 'Поля скинуто');
              await loadUserProfile();
            } catch (error: any) {
              Alert.alert('Помилка', 'Не вдалося скинути поля');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRemoveFriend = async () => {
    if (!profileUser || !currentUser) return;

    Alert.alert(
      'Видалити з друзів',
      `Ви впевнені, що хочете видалити ${profileUser.username} з друзів?`,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await friendsApi.removeFriend(currentUser.id, profileUser.id);
              Alert.alert('Успіх', 'Друга видалено');
              await loadUserProfile();
            } catch (error: any) {
              console.error('Failed to remove friend:', error);
              Alert.alert('Помилка', 'Не вдалося видалити друга');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderActionButton = () => {
    if (!profileUser || !currentUser || profileUser.id === currentUser.id) {
      return null;
    }

    if (actionLoading) {
      return (
        <View style={styles.actionButtonContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      );
    }

    // Якщо вже друзі
    if (friendshipStatus.areFriends) {
      return (
        <View style={styles.actionButtonContainer}>
          <Button
            title="Видалити з друзів"
            icon="homeIcon"
            variant="coral"
            padding={14}
            onPress={handleRemoveFriend}
          />
        </View>
      );
    }

    // Якщо є відкритий запит
    if (friendshipStatus.hasRequest && friendshipStatus.requestStatus === 'Opened') {
      if (friendshipStatus.isRequestSender) {
        // Поточний користувач відправив запит
        return (
          <View style={styles.actionButtonContainer}>
            <Button
              title="Скасувати запит"
              icon="homeIcon"
              variant="yellow"
              padding={14}
              onPress={handleCancelRequest}
            />
          </View>
        );
      } else {
        // Поточний користувач отримав запит
        return (
          <View style={styles.actionButtonContainer}>
            <Button
              title="Прийняти запит"
              icon="homeIcon"
              variant="green"
              padding={14}
              onPress={handleAcceptRequest}
            />
            <View style={styles.buttonSpacing} />
            <Button
              title="Відхилити"
              icon="homeIcon"
              variant="coral"
              padding={14}
              onPress={handleDeclineRequest}
            />
          </View>
        );
      }
    }

    // Якщо немає дружби і запиту - показати кнопку відправлення запиту
    return (
      <View style={styles.actionButtonContainer}>
        <Button
          title="Додати в друзі"
          icon="homeIcon"
          variant="green"
          padding={14}
          onPress={handleSendFriendRequest}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Icon name="homeIcon" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[typography.h2, styles.headerTitle]}>Профіль</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!profileUser) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Icon name="homeIcon" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[typography.h2, styles.headerTitle]}>Профіль</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyState}>
          <Icon name="homeIcon" size={64} color={colors.text70} />
          <Text style={styles.emptyText}>Користувача не знайдено</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="homeIcon" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[typography.h2, styles.headerTitle]}>Профіль</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            {profileUser.avatarUrl ? (
              <Image source={{ uri: profileUser.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={[typography.h1, styles.avatarText]}>
                  {profileUser.firstName?.[0]?.toUpperCase() || 
                   profileUser.username?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
            )}
            <View style={styles.avatarBorder} />
          </View>

          {/* Username */}
          <Text style={[typography.h2, styles.username]}>
            @{profileUser.username}
          </Text>

          {/* Friend Count */}
          <Text style={[typography.caption, styles.friendCount]}>
            {friendCount} {friendCount === 1 ? 'друг' : 'друзів'}
          </Text>
        </View>

        {/* User Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={[typography.caption, styles.infoLabel]}>Ім'я</Text>
            <Text style={[typography.main, styles.infoValue]}>
              {profileUser.firstName || '—'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={[typography.caption, styles.infoLabel]}>Прізвище</Text>
            <Text style={[typography.main, styles.infoValue]}>
              {profileUser.lastName || '—'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={[typography.caption, styles.infoLabel]}>Юзернейм</Text>
            <Text style={[typography.main, styles.infoValue]}>
              {profileUser.username}
            </Text>
          </View>

          {profileUser.description && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={[typography.caption, styles.infoLabel]}>Про себе</Text>
                <Text style={[typography.main, styles.infoValue, styles.bioText]}>
                  {profileUser.description}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Action Button (Friend Request) */}
        {renderActionButton()}

        {/* Quick Actions - якщо друзі */}
        {profileUser.id !== currentUser?.id && friendshipStatus.areFriends && (
          <View style={styles.quickActionsSection}>
            <Text style={[typography.h3, styles.sectionTitle]}>Швидкі дії</Text>
            <View style={styles.quickActionsRow}>
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => onNavigateToCreateOwe?.(profileUser.id)}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: colors.coral15 }]}>
                  <Icon name="homeIcon" size={24} color={colors.coral} />
                </View>
                <Text style={[typography.secondary, styles.quickActionText]}>Запросити борг</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => onNavigateToInviteToGroup?.(profileUser.id)}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: colors.primary15 }]}>
                  <Icon name="homeIcon" size={24} color={colors.primary} />
                </View>
                <Text style={[typography.secondary, styles.quickActionText]}>Запросити в групу</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Statistics Section */}
        {profileUser.id !== currentUser?.id && friendshipStatus.areFriends && (
          <View style={styles.statisticsSection}>
            <Text style={[typography.h3, styles.sectionTitle]}>Статистика</Text>
            
            <View style={styles.statRow}>
              <Icon name="homeIcon" size={20} color={colors.text70} />
              <Text style={[typography.secondary, styles.statLabel]}>Спільні борги:</Text>
              <Text style={[typography.main, styles.statValue]}>—</Text>
            </View>

            <View style={styles.statRow}>
              <Icon name="homeIcon" size={20} color={colors.text70} />
              <Text style={[typography.secondary, styles.statLabel]}>Спільні групи:</Text>
              <Text style={[typography.main, styles.statValue]}>—</Text>
            </View>

            <View style={styles.statRow}>
              <Icon name="homeIcon" size={20} color={colors.text70} />
              <Text style={[typography.secondary, styles.statLabel]}>Спільні друзі:</Text>
              <Text style={[typography.main, styles.statValue]}>—</Text>
            </View>
          </View>
        )}

        {isAdmin && profileUser.id !== currentUser?.id && (
          <View style={styles.adminSection}>
            <TouchableOpacity 
              style={styles.adminHeader}
              onPress={() => setShowAdminPanel(!showAdminPanel)}
            >
              <Text style={[typography.h3, styles.adminTitle]}>
                Адміністрування
              </Text>
              <Icon 
                name="homeIcon" 
                size={20} 
                color={colors.coral}
              />
            </TouchableOpacity>

            {showAdminPanel && (
              <>
                {adminStats && (
                  <View style={styles.adminStatsSection}>
                    <Text style={[typography.secondary, styles.adminStatsTitle]}>Детальна статистика:</Text>
                    
                    <View style={styles.adminStatRow}>
                      <Text style={[typography.caption, styles.adminStatLabel]}>Email:</Text>
                      <Text style={[typography.secondary, styles.adminStatValue]}>{adminStats.email}</Text>
                    </View>
                    
                    <View style={styles.adminStatRow}>
                      <Text style={[typography.caption, styles.adminStatLabel]}>Дата реєстрації:</Text>
                      <Text style={[typography.secondary, styles.adminStatValue]}>
                        {new Date(adminStats.createdAt).toLocaleDateString('uk-UA')}
                      </Text>
                    </View>
                    
                    <View style={styles.adminStatRow}>
                      <Text style={[typography.caption, styles.adminStatLabel]}>Друзів:</Text>
                      <Text style={[typography.secondary, styles.adminStatValue]}>{adminStats.stats.totalFriends}</Text>
                    </View>
                    
                    <View style={styles.adminStatRow}>
                      <Text style={[typography.caption, styles.adminStatLabel]}>Груп:</Text>
                      <Text style={[typography.secondary, styles.adminStatValue]}>{adminStats.stats.totalGroups}</Text>
                    </View>
                    
                    <View style={styles.adminStatRow}>
                      <Text style={[typography.caption, styles.adminStatLabel]}>Надано боргів:</Text>
                      <Text style={[typography.secondary, styles.adminStatValue]}>{adminStats.stats.sentOwes}</Text>
                    </View>
                    
                    <View style={styles.adminStatRow}>
                      <Text style={[typography.caption, styles.adminStatLabel]}>Отримано боргів:</Text>
                      <Text style={[typography.secondary, styles.adminStatValue]}>{adminStats.stats.receivedOwes}</Text>
                    </View>
                    
                    <View style={styles.adminStatRow}>
                      <Text style={[typography.caption, styles.adminStatLabel]}>Загальний борг:</Text>
                      <Text style={[typography.secondary, styles.adminStatValue]}>{adminStats.stats.totalDebt} ₴</Text>
                    </View>
                    
                    <View style={styles.adminStatRow}>
                      <Text style={[typography.caption, styles.adminStatLabel]}>Загальна сума надано:</Text>
                      <Text style={[typography.secondary, styles.adminStatValue]}>{adminStats.stats.totalLent} ₴</Text>
                    </View>

                    {adminStats.isBanned && (
                      <View style={styles.bannedInfo}>
                        <Text style={[typography.caption, styles.bannedLabel]}>Заблоковано:</Text>
                        <Text style={[typography.secondary, styles.bannedReason]}>{adminStats.banReason}</Text>
                        <Text style={[typography.caption, styles.bannedDate]}>
                          {new Date(adminStats.bannedAt).toLocaleDateString('uk-UA')}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                <View style={styles.adminButtonsRow}>
                  <Button
                    title="Скинути поля"
                    icon="homeIcon"
                    variant="yellow"
                    padding={12}
                    onPress={handleResetFields}
                    disabled={actionLoading}
                    style={styles.adminButton}
                  />
                  
                  <Button
                    title={adminStats?.isBanned ? 'Розбанити' : 'Забанити'}
                    icon="homeIcon"
                    variant="coral"
                    padding={12}
                    onPress={adminStats?.isBanned ? handleUnbanUser : handleBanUser}
                    disabled={actionLoading}
                    style={styles.adminButton}
                  />
                </View>
              </>
            )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: colors.card_surface,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    ...typography.h3,
    color: colors.text70,
    marginTop: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  avatarPlaceholder: {
    backgroundColor: colors.primary70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.text,
    fontSize: 56,
  },
  avatarBorder: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 74,
    borderWidth: 4,
    borderColor: colors.primary,
  },
  username: {
    color: colors.text,
    marginBottom: 8,
  },
  friendCount: {
    color: colors.text70,
  },
  infoSection: {
    backgroundColor: colors.card_surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  infoRow: {
    paddingVertical: 12,
  },
  infoLabel: {
    color: colors.text70,
    marginBottom: 4,
  },
  infoValue: {
    color: colors.text,
  },
  bioText: {
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  actionButtonContainer: {
    marginBottom: 24,
  },
  buttonSpacing: {
    height: 12,
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.text,
    marginBottom: 16,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: colors.card_surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border_divider,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    color: colors.text,
    textAlign: 'center',
  },
  statisticsSection: {
    backgroundColor: colors.card_surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  statLabel: {
    flex: 1,
    color: colors.text70,
  },
  statValue: {
    color: colors.text,
    fontWeight: '600',
  },
  adminSection: {
    backgroundColor: colors.card_surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.coral,
  },
  adminHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  adminTitle: {
    color: colors.coral,
  },
  adminStatsSection: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  adminStatsTitle: {
    color: colors.text,
    marginBottom: 12,
    fontWeight: '600',
  },
  adminStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  adminStatLabel: {
    color: colors.text70,
  },
  adminStatValue: {
    color: colors.text,
  },
  bannedInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.coral15,
    borderRadius: 8,
  },
  bannedLabel: {
    color: colors.coral,
    fontWeight: '600',
    marginBottom: 4,
  },
  bannedReason: {
    color: colors.text,
    marginBottom: 4,
  },
  bannedDate: {
    color: colors.text70,
  },
  adminButtonsRow: {
    gap: 12,
  },
  adminButton: {
    width: '100%',
  },
  adminButtonSpacing: {
    height: 8,
  },
  bannedBadge: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.coral15,
    borderRadius: 12,
    alignItems: 'center',
  },
});

export default UserProfileScreen;
