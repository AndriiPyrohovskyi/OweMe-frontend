import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { groupsApi } from '../services/api/endpoints/groups';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { Icon } from '../components/Icon';
import { Button } from '../components/Button';

interface FindGroupScreenProps {
  onBack?: () => void;
}

interface GroupSearchResult {
  id: number;
  name: string;
  tag: string;
  memberCount: number;
}

const FindGroupScreen: React.FC<FindGroupScreenProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GroupSearchResult[]>([]);
  const [sentRequests, setSentRequests] = useState<Set<number>>(new Set());

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      // TODO: Implement group search when backend endpoint is available
      Alert.alert('В розробці', 'Пошук груп ще не реалізовано на бекенді');
      setSearchResults([]);
    } catch (error: any) {
      console.error('Failed to search groups:', error);
      Alert.alert('Помилка', 'Не вдалося знайти групи');
      setSearchResults([]);
    }
  };

  const handleJoinGroup = async (groupId: number) => {
    try {
      await groupsApi.sendRequestToGroup(groupId);
      setSentRequests(new Set(sentRequests).add(groupId));
      Alert.alert('Успіх', 'Запит на вступ відправлено!');
    } catch (error: any) {
      console.error('Failed to send request:', error);
      Alert.alert('Помилка', 'Не вдалося відправити запит');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="homeIcon" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Знайти групу</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Пошук</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="DemonDestroyer"
          placeholderTextColor={colors.text70}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity onPress={handleSearch}>
          <Icon name="homeIcon" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {searchResults.length > 0 ? (
          searchResults.map((result) => (
            <View key={result.id} style={styles.groupCard}>
              <View style={styles.groupInfo}>
                <View style={styles.groupAvatar}>
                  <Text style={styles.groupAvatarText}>{result.name[0].toUpperCase()}</Text>
                </View>
                <View style={styles.groupDetails}>
                  <Text style={styles.groupName}>{result.name}</Text>
                  <Text style={styles.groupTag}>{result.tag}</Text>
                </View>
              </View>
              <Button
                title={sentRequests.has(result.id) ? 'Надіслано' : 'Приєднатись'}
                icon="homeIcon"
                iconSize={16}
                variant={sentRequests.has(result.id) ? 'green' : 'purple'}
                padding={8}
                onPress={() => !sentRequests.has(result.id) && handleJoinGroup(result.id)}
              />
            </View>
          ))
        ) : searchQuery.trim() ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>Нічого не знайдено</Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👋</Text>
            <Text style={styles.emptyText}>Почніть пошук</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: colors.card_surface,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { ...typography.h2, color: colors.text },
  titleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.card_surface,
  },
  title: { ...typography.h1, color: colors.text },
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
  searchInput: { flex: 1, ...typography.main, color: colors.text, paddingVertical: 8 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card_surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  groupInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  groupAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupAvatarText: { ...typography.h3, color: colors.text },
  groupDetails: { flex: 1 },
  groupName: { ...typography.main, fontWeight: '600', color: colors.text },
  groupTag: { ...typography.secondary, color: colors.text70 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 64, marginBottom: 12 },
  emptyText: { ...typography.h3, color: colors.text, textAlign: 'center' },
});

export default FindGroupScreen;
