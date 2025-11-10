import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { friendsApi, Friend } from '../services/api/endpoints/friends';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { TopBar } from '../components/TopBar';
import { TextInput } from '../components/TextInput';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';

interface FriendsScreenProps {
  onNavigateToAddFriend?: () => void;
  onNavigateToRequests?: () => void;
  onNavigateToProfile?: (userId: number) => void;
  onNavigateToCreateOwe?: (friendId: number) => void;
  onNavigateToNotifications?: () => void;
}

const FriendsScreen: React.FC<FriendsScreenProps> = ({
  onNavigateToAddFriend,
  onNavigateToRequests,
  onNavigateToProfile,
  onNavigateToNotifications,
  onNavigateToCreateOwe,
}) => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      if (!user?.id) return;
      const friendsList = await friendsApi.getUserFriends(user.id);
      setFriends(friendsList);
    } catch (error: any) {
      console.error('Failed to load friends:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити список друзів');
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFriends();
    setRefreshing(false);
  };

  const handleRequestDebt = (friend: Friend) => {
    if (onNavigateToCreateOwe) {
      onNavigateToCreateOwe(friend.id);
    }
  };

  const handleRemoveFriend = async (friend: Friend) => {
    Alert.alert(
      'Видалити друга',
      `Ви впевнені, що хочете видалити ${friend.username} з друзів?`,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!user?.id) return;
              await friendsApi.removeFriend(user.id, friend.id);
              await loadFriends();
            } catch (error) {
              Alert.alert('Помилка', 'Не вдалося видалити друга');
            }
          },
        },
      ]
    );
  };

  const filteredFriends = (friends || []).filter((friend) =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <TopBar 
        userName={user?.username}
        avatarUrl={user?.avatarUrl}
        onAvatarPress={() => onNavigateToProfile?.(user?.id || 0)}
        onNotificationPress={onNavigateToNotifications}
      />

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Друзі</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          title="Додати друга"
          icon="homeIcon"
          iconSize={20}
          variant="green"
          padding={12}
          onPress={onNavigateToAddFriend || (() => {})}
        />
        <Button
          title="Запити на дружбу"
          icon="homeIcon"
          iconSize={20}
          variant="yellow"
          padding={12}
          onPress={onNavigateToRequests || (() => {})}
        />
      </View>

      {/* Search Input */}
      <TextInput
        placeholder="DemonDestroyer"
        value={searchQuery}
        onChangeText={setSearchQuery}
        leftIcon={<Icon name="homeIcon" size={20} color={colors.text70} />}
        style={styles.searchInput}
      />

      {/* Friends List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredFriends.length > 0 ? (
          filteredFriends.map((friend) => (
            <TouchableOpacity 
              key={friend.id} 
              style={styles.friendCard}
              onPress={() => onNavigateToProfile?.(friend.id)}
            >
              <View style={styles.friendHeader}>
                {friend.avatarUrl ? (
                  <Image source={{ uri: friend.avatarUrl }} style={styles.friendAvatar} />
                ) : (
                  <View style={[styles.friendAvatar, styles.friendAvatarPlaceholder]}>
                    <Text style={styles.friendAvatarText}>
                      {friend.username[0].toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{friend.username}</Text>
                  {friend.firstName && (
                    <Text style={[typography.body, styles.friendName]}>
                      {friend.firstName}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.friendActions}>
                <Button
                  title="Запросити борг"
                  icon="homeIcon"
                  iconSize={16}
                  variant="green"
                  padding={8}
                  onPress={() => handleRequestDebt(friend)}
                />
                <Button
                  title="Видалити"
                  icon="homeIcon"
                  iconSize={16}
                  variant="coral"
                  padding={8}
                  onPress={() => handleRemoveFriend(friend)}
                />
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>😔</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Нічого не знайдено' : 'У вас ще немає друзів'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery
                ? 'Спробуйте інший запит'
                : 'Натисніть "Додати друга" щоб знайти друзів'}
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
  titleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.card_surface,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  addFriendButton: {
    backgroundColor: colors.green,
  },
  requestsButton: {
    backgroundColor: colors.yellow,
  },
  actionButtonIcon: {
    fontSize: 20,
  },
  actionButtonText: {
    ...typography.CTA,
    color: colors.text,
  },
  searchInput: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  searchIcon: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  friendCard: {
    backgroundColor: colors.card_surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  friendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  friendAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  friendAvatarPlaceholder: {
    backgroundColor: colors.primary70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendAvatarText: {
    ...typography.h2,
    color: colors.text,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    ...typography.h2,
    color: colors.text,
  },
  friendFullName: {
    ...typography.secondary,
    color: colors.text70,
    marginTop: 2,
  },
  friendActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  friendStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statIcon: {
    fontSize: 14,
  },
  statLabel: {
    ...typography.secondary,
    color: colors.text70,
  },
  statValue: {
    ...typography.numbers,
    fontSize: 14,
    color: colors.text,
  },
  friendMeta: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaIcon: {
    fontSize: 14,
  },
  metaText: {
    ...typography.secondary,
    color: colors.text70,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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
  },
});

export default FriendsScreen;
