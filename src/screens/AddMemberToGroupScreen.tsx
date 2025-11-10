import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { friendsApi, UserSearchResult, Friend } from '../services/api/endpoints/friends';
import { groupsApi } from '../services/api/endpoints/groups';
import { Icon } from '../components/Icon';
import { HeaderBar } from '../components/HeaderBar';
import colors from '../theme/colors';
import typography from '../theme/typography';

interface AddMemberToGroupScreenProps {
  groupId: number;
  onBack: () => void;
}

const AddMemberToGroupScreen: React.FC<AddMemberToGroupScreenProps> = ({
  groupId,
  onBack,
}) => {
  const { user } = useAuth();
  const [searchMode, setSearchMode] = useState<'friends' | 'global'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState<Set<number>>(new Set());
  const [groupMembers, setGroupMembers] = useState<Set<number>>(new Set());
  const [pendingInvites, setPendingInvites] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadGroupData();
    if (searchMode === 'friends') {
      loadFriends();
    }
  }, [searchMode]);

    const loadGroupData = async () => {
    try {
      const [members, requests] = await Promise.all([
        groupsApi.getGroupMembers(groupId),
        groupsApi.getRequestsFromGroup(groupId),
      ]);
      setGroupMembers(new Set(members.map((m: any) => m.user.id)));
      const pendingIds = requests
        .filter((r: any) => r.requestStatus === 'Opened')
        .map((r: any) => r.receiver.id);
      setPendingInvites(new Set(pendingIds));
    } catch (error) {
      console.error('Failed to load group data:', error);
    }
  };

  const loadFriends = async () => {
    try {
      setLoading(true);
      if (!user?.id) return;
      const friendsList = await friendsApi.getUserFriends(user.id);
      setFriends(friendsList);
    } catch (error) {
      console.error('Failed to load friends:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити друзів');
    } finally {
      setLoading(false);
    }
  };

  // Фільтр друзів по пошуку
  const filteredFriends = searchMode === 'friends' && searchQuery
    ? friends.filter(f => 
        f.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.username?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : friends;

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const results = await friendsApi.searchUsers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      Alert.alert('Помилка', 'Не вдалося знайти користувачів');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (userId: number) => {
    try {
      await groupsApi.sendRequestFromGroup(groupId, userId);
      setInvitedUsers(prev => new Set(prev).add(userId));
      setPendingInvites(prev => new Set(prev).add(userId));
      Alert.alert('Успіх', 'Запрошення надіслано');
    } catch (error) {
      console.error('Failed to invite user:', error);
      Alert.alert('Помилка', 'Не вдалося надіслати запрошення');
    }
  };

  const handleAddMember = async (userId: number) => {
    // For friends, same as invite
    await handleInvite(userId);
  };

  const getUserStatus = (userId: number) => {
    if (groupMembers.has(userId)) return 'member';
    if (pendingInvites.has(userId)) return 'invited';
    if (invitedUsers.has(userId)) return 'invited';
    return 'none';
  };

  const getButtonText = (status: string): string => {
    if (status === 'member') return 'Учасник';
    if (status === 'invited') return 'Запрошений';
    return 'Додати';
  };  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <HeaderBar title="Додати учасника" onBack={onBack} />

      {/* Mode Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, searchMode === 'friends' && styles.activeTab]}
          onPress={() => setSearchMode('friends')}
        >
          <Text style={[styles.tabText, searchMode === 'friends' && styles.activeTabText]}>
            Друзі
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, searchMode === 'global' && styles.activeTab]}
          onPress={() => setSearchMode('global')}
        >
          <Text style={[styles.tabText, searchMode === 'global' && styles.activeTabText]}>
            Глобальний пошук
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search for global mode */}
      {searchMode === 'global' && (
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Введіть ім'я користувача"
              placeholderTextColor={colors.text70}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Icon name="search" size={20} color={colors.text70} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Results */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {searchMode === 'friends' ? (
          // Friends list
          loading ? (
            <View style={styles.emptyState}>
              <Text style={typography.body}>Завантаження...</Text>
            </View>
          ) : filteredFriends.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={typography.body}>
                {searchQuery ? 'Нічого не знайдено' : 'У вас поки немає друзів'}
              </Text>
            </View>
          ) : (
            filteredFriends.map((friend) => {
              const status = getUserStatus(friend.id);
              return (
                <View key={friend.id} style={styles.friendItem}>
                  <View style={styles.friendInfo}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>
                        {(friend.firstName?.[0] || friend.username?.[0] || '?').toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.friendName}>
                        {friend.firstName}
                      </Text>
                      <Text style={styles.friendUsername}>@{friend.username}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.addButton,
                      status === 'invited' && styles.invitedButton,
                      status === 'member' && styles.memberButton,
                    ]}
                    onPress={() => status === 'none' ? handleAddMember(friend.id) : null}
                    disabled={status !== 'none'}
                  >
                    <Text style={[
                      styles.addButtonText,
                      status !== 'none' && styles.disabledButtonText
                    ]}>
                      {getButtonText(status)}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )
        ) : (
          // Global search results
          loading ? (
            <View style={styles.emptyState}>
              <Text style={typography.body}>Пошук...</Text>
            </View>
          ) : searchResults.length === 0 && searchQuery ? (
            <View style={styles.emptyState}>
              <Icon name="search" size={48} color={colors.text70} />
              <Text style={[typography.body, styles.emptyText]}>
                Нічого не знайдено
              </Text>
            </View>
          ) : searchResults.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="search" size={48} color={colors.text70} />
              <Text style={[typography.body, styles.emptyText]}>
                Введіть ім'я для пошуку
              </Text>
            </View>
          ) : (
            searchResults.map((user) => {
              const status = getUserStatus(user.id);
              return (
                <View key={user.id} style={styles.userCard}>
                  <View style={styles.userInfo}>
                    {user.avatarUrl ? (
                      <Image 
                        source={{ uri: user.avatarUrl }} 
                        style={styles.avatar}
                      />
                    ) : (
                      <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Text style={styles.avatarText}>
                          {user.firstName?.[0]?.toUpperCase() || '?'}
                        </Text>
                      </View>
                    )}
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>
                        {user.firstName}
                      </Text>
                      <Text style={styles.userUsername}>@{user.username}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.inviteButton,
                      status === 'invited' && styles.invitedButton,
                      status === 'member' && styles.memberButton,
                    ]}
                    onPress={() => status === 'none' ? handleInvite(user.id) : null}
                    disabled={status !== 'none'}
                  >
                    <Text style={[
                      styles.inviteButtonText,
                      status !== 'none' && styles.disabledButtonText
                    ]}>
                      {getButtonText(status)}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border_divider,
  },
  backButton: {
    marginRight: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card_surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.card_surface,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.body,
    color: colors.text70,
  },
  activeTabText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card_surface,
    borderRadius: 24,
    paddingHorizontal: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    ...typography.body,
    color: colors.text,
  },
  searchButton: {
    padding: 4,
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
    color: colors.text70,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card_surface,
    padding: 12,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  userUsername: {
    ...typography.caption,
    color: colors.text70,
  },
  inviteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  invitedButton: {
    backgroundColor: colors.green,
  },
  memberButton: {
    backgroundColor: colors.text70,
  },
  inviteButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  disabledButtonText: {
    color: colors.text70,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card_surface,
    padding: 12,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarCircle: {
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
    fontSize: 18,
    color: colors.background,
    fontWeight: '600',
  },
  friendName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  friendUsername: {
    ...typography.caption,
    color: colors.text70,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  addButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
});

export default AddMemberToGroupScreen;
