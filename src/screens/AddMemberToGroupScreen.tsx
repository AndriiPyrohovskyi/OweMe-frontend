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
import { friendsApi, UserSearchResult, Friend } from '../services/api/endpoints/friends';
import { groupsApi } from '../services/api/endpoints/groups';
import { Icon } from '../components/Icon';
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

  useEffect(() => {
    if (searchMode === 'friends') {
      loadFriends();
    }
  }, [searchMode]);

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
          <Icon name="arrowLeft" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerAvatar}>
          <Icon name="friendsIcon" size={24} color={colors.text70} />
        </View>
        <Text style={[typography.h3, styles.headerTitle]}>Додати учасника</Text>
      </View>

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
          ) : friends.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={typography.body}>У вас поки немає друзів</Text>
            </View>
          ) : (
            friends.map((friend) => (
              <View key={friend.id} style={styles.userCard}>
                <View style={styles.userInfo}>
                  <View style={styles.avatar}>
                    <Icon name="homeIcon" size={32} color={colors.text70} />
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>
                      {friend.firstName} {friend.lastName}
                    </Text>
                    <Text style={styles.userUsername}>@{friend.username}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.inviteButton,
                    invitedUsers.has(friend.id) && styles.invitedButton,
                  ]}
                  onPress={() => handleInvite(friend.id)}
                  disabled={invitedUsers.has(friend.id)}
                >
                  <Text style={styles.inviteButtonText}>
                    {invitedUsers.has(friend.id) ? 'Запрошено' : 'Запросити'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
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
            searchResults.map((user) => (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.userInfo}>
                  <View style={styles.avatar}>
                    <Icon name="homeIcon" size={32} color={colors.text70} />
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>
                      {user.firstName} {user.lastName}
                    </Text>
                    <Text style={styles.userUsername}>@{user.username}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.inviteButton,
                    invitedUsers.has(user.id) && styles.invitedButton,
                  ]}
                  onPress={() => handleInvite(user.id)}
                  disabled={invitedUsers.has(user.id)}
                >
                  <Text style={styles.inviteButtonText}>
                    {invitedUsers.has(user.id) ? 'Запрошено' : 'Запросити'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )
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
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
  inviteButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
});

export default AddMemberToGroupScreen;
