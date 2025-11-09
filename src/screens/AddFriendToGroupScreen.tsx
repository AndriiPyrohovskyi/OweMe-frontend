import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { friendsApi, Friend } from '../services/api/endpoints/friends';
import { groupsApi } from '../services/api/endpoints/groups';
import { Icon } from '../components/Icon';
import colors from '../theme/colors';
import typography from '../theme/typography';

interface AddFriendToGroupScreenProps {
  groupId: number;
  onBack: () => void;
}
const AddFriendToGroupScreen: React.FC<AddFriendToGroupScreenProps> = ({
  groupId,
  onBack,
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [invitedUsers, setInvitedUsers] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadFriends();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = friends.filter((friend) =>
        friend.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFriends(filtered);
    } else {
      setFilteredFriends(friends);
    }
  }, [searchQuery, friends]);
  const loadFriends = async () => {
    try {
      setLoading(true);
      if (!user?.id) return;
      const data = await friendsApi.getUserFriends(user.id);
      setFriends(data);
      setFilteredFriends(data);
      setFilteredFriends(data);
    } catch (error) {
      console.error('Failed to load friends:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити список друзів');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (userId: number) => {
    try {
      await groupsApi.sendRequestFromGroup(groupId, userId);
      setInvitedUsers((prev) => new Set(prev).add(userId));
      Alert.alert('Успішно', 'Запрошення надіслано');
    } catch (error: any) {
      console.error('Failed to invite user:', error);
      Alert.alert('Помилка', error.response?.data?.message || 'Не вдалося надіслати запрошення');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrowLeft" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerAvatar}>
          <Icon name="friendsIcon" size={24} color={colors.text.secondary} />
        </View>
        <Text style={[typography.h3, styles.headerTitle]}>Додати друга до групи</Text>
      </View>

      {/* Search */}
      <View style={styles.searchSection}>
        <Text style={[typography.h3, styles.sectionTitle]}>Друзі</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="DemonDestroyer"
            placeholderTextColor={colors.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          <Icon name="search" size={20} color={colors.text.secondary} />
        </View>
      </View>

      {/* Global Search */}
      <View style={styles.globalSearchSection}>
        <Text style={[typography.h3, styles.sectionTitle]}>Глобальний пошук</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="DemonDestroyer"
            placeholderTextColor={colors.text.secondary}
            returnKeyType="search"
          />
          <Icon name="search" size={20} color={colors.text.secondary} />
        </View>
      </View>

      {/* Friends List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.emptyState}>
            <Text style={typography.body}>Завантаження...</Text>
          </View>
        ) : filteredFriends.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="friendsIcon" size={48} color={colors.text.secondary} />
            <Text style={[typography.body, styles.emptyText]}>
              {searchQuery ? 'Нічого не знайдено' : 'У вас поки немає друзів'}
            </Text>
          </View>
        ) : (
          <View style={styles.friendsList}>
            {filteredFriends.map((friend) => {
              const isInvited = invitedUsers.has(friend.id);
              const createdDate = friend.createdAt ? new Date(friend.createdAt) : new Date();
              const now = new Date();
              const diffMonths = Math.floor(
                (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
              );

              return (
                <View key={friend.id} style={styles.friendCard}>
                  {friend.avatarUrl ? (
                    <Image source={{ uri: friend.avatarUrl }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                      <Icon name="friendsIcon" size={24} color={colors.text.secondary} />
                    </View>
                  )}
                  <View style={styles.friendInfo}>
                    <Text style={typography.bodyBold}>{friend.username}</Text>
                    <View style={styles.stats}>
                      <View style={styles.statItem}>
                        <Icon name="friendsIcon" size={14} color={colors.green} />
                        <Text style={[typography.caption, styles.statText]}>
                          Вам винні: <Text style={styles.statValue}>120</Text>
                        </Text>
                      </View>
                      <View style={styles.statItem}>
                        <Icon name="warning" size={14} color={colors.coral} />
                        <Text style={[typography.caption, styles.statText]}>
                          Ви винні: <Text style={styles.statValue}>50 123</Text>
                        </Text>
                      </View>
                    </View>
                    <View style={styles.statItem}>
                      <Icon name="heart" size={14} color={colors.coral} />
                      <Text style={[typography.caption, styles.statText]}>
                        Дружба триває: {diffMonths > 0 ? `${diffMonths} міс.` : 'нещодавно'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.inviteButton,
                      isInvited && styles.inviteButtonDisabled,
                    ]}
                    onPress={() => handleInvite(friend.id)}
                    disabled={isInvited}
                  >
                    <Icon
                      name="addUser"
                      size={20}
                      color={colors.background.primary}
                    />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  globalSearchSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 24,
    paddingHorizontal: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    ...typography.body,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    color: colors.text.secondary,
  },
  friendsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendInfo: {
    flex: 1,
    gap: 4,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: colors.text.secondary,
    fontSize: 11,
  },
  statValue: {
    color: colors.text.primary,
    fontFamily: 'Poppins-SemiBold',
  },
  inviteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteButtonDisabled: {
    backgroundColor: colors.text.secondary,
  },
});

export default AddFriendToGroupScreen;
