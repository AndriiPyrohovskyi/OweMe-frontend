import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { friendsApi, UserSearchResult } from '../services/api/endpoints/friends';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { Button } from '../components/Button';
import { TextInput } from '../components/TextInput';
import { Icon } from '../components/Icon';

interface AddFriendScreenProps {
  onBack?: () => void;
  onNavigateToProfile?: (userId: number) => void;
}

const AddFriendScreen: React.FC<AddFriendScreenProps> = ({ 
  onBack, 
  onNavigateToProfile 
}) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState<Set<number>>(new Set());

  // Real-time search with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await friendsApi.searchUsers(searchQuery);
      // Фільтруємо себе зі списку
      const filtered = results.filter((u) => u.id !== user?.id);
      setSearchResults(filtered);
    } catch (error: any) {
      console.error('Search failed:', error);
      Alert.alert('Помилка', 'Не вдалося виконати пошук');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (userId: number) => {
    try {
      await friendsApi.sendFriendRequest(userId);
      setSentRequests(new Set(sentRequests).add(userId));
      Alert.alert('Успіх', 'Запит на дружбу відправлено!');
    } catch (error: any) {
      console.error('Failed to send request:', error);
      Alert.alert('Помилка', 'Не вдалося відправити запит');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="homeIcon" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Додати друга</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Пошук</Text>
      </View>
        <TextInput
          placeholder="DemonDestroyer"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

      {/* Search Results */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {searchResults.length > 0 ? (
          searchResults.map((result) => (
            <TouchableOpacity
              key={result.id}
              style={styles.userCard}
              onPress={() => onNavigateToProfile?.(result.id)}
            >
              <View style={styles.userInfo}>
                {result.avatarUrl ? (
                  <Image 
                    source={{ uri: result.avatarUrl }} 
                    style={styles.userAvatar}
                  />
                ) : (
                  <View style={[styles.userAvatar, styles.userAvatarPlaceholder]}>
                    <Text style={styles.userAvatarText}>
                      {result.username[0].toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{result.username}</Text>
                  {(result.firstName || result.lastName) && (
                    <Text style={styles.userFullName}>
                      {[result.firstName, result.lastName].filter(Boolean).join(' ')}
                    </Text>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.addButton,
                  sentRequests.has(result.id) && styles.addButtonDisabled,
                ]}
                onPress={(e) => {
                  e.stopPropagation();
                  handleAddFriend(result.id);
                }}
                disabled={sentRequests.has(result.id)}
              >
                <Icon 
                  name="homeIcon" 
                  size={24} 
                  color={sentRequests.has(result.id) ? colors.green : colors.primary} 
                />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        ) : searchQuery.trim() && !loading ? (
          <View style={styles.emptyState}>
            <Icon name="homeIcon" size={48} color={colors.text70} />
            <Text style={styles.emptyText}>Нічого не знайдено</Text>
            <Text style={styles.emptySubtext}>Спробуйте інший запит</Text>
          </View>
        ) : !searchQuery.trim() ? (
          <View style={styles.emptyState}>
            <Icon name="homeIcon" size={48} color={colors.text70} />
            <Text style={styles.emptyText}>Почніть пошук</Text>
            <Text style={styles.emptySubtext}>
              Введіть ім'я користувача у поле пошуку
            </Text>
          </View>
        ) : null}
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 28,
    color: colors.text,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card_surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border_divider,
  },
  searchInput: {
    flex: 1,
    ...typography.main,
    color: colors.text,
    paddingVertical: 8,
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card_surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.green,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  userDetails: {
    flex: 1,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userAvatarPlaceholder: {
    backgroundColor: colors.green15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    ...typography.h3,
    color: colors.text,
  },
  userName: {
    ...typography.main,
    fontWeight: '600',
    color: colors.text,
  },
  userFullName: {
    ...typography.secondary,
    color: colors.text70,
    marginTop: 2,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: colors.border_divider,
  },
  addButtonIcon: {
    fontSize: 20,
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

export default AddFriendScreen;
