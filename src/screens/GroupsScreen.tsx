import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { groupsApi, Group } from '../services/api/endpoints/groups';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { TopBar } from '../components/TopBar';
import { Button } from '../components/Button';

interface GroupsScreenProps {
  onNavigateToCreateGroup?: () => void;
  onNavigateToGroupRequests?: () => void;
  onNavigateToFindGroup?: () => void;
  onNavigateToGroupDetails?: (groupId: number) => void;
  onNavigateToCreateOweForGroup?: (groupId: number) => void;
  onNavigateToProfile?: (userId?: number) => void;
}

const GroupsScreen: React.FC<GroupsScreenProps> = ({
  onNavigateToCreateGroup,
  onNavigateToGroupRequests,
  onNavigateToFindGroup,
  onNavigateToGroupDetails,
  onNavigateToCreateOweForGroup,
  onNavigateToProfile,
}) => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const groupsList = await groupsApi.getMyGroups();
      setGroups(groupsList);
    } catch (error: any) {
      console.error('Failed to load groups:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити групи');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGroups();
    setRefreshing(false);
  };

  const handleRequestDebt = (group: Group) => {
  if (onNavigateToCreateOweForGroup) return onNavigateToCreateOweForGroup(group.id);
  Alert.alert('Запросити борг', `Запросити борг у групі ${group.name}?`);
  };

  const handleLeaveGroup = async (group: Group) => {
    Alert.alert(
      'Покинути групу',
      `Ви впевнені, що хочете покинути групу "${group.name}"?`,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Покинути',
          style: 'destructive',
          onPress: async () => {
            try {
              if (user) {
                await groupsApi.removeMember(group.id, user.id);
                await loadGroups();
              }
            } catch (error) {
              Alert.alert('Помилка', 'Не вдалося покинути групу');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    
    if (diffMonths < 1) return 'менше місяця тому';
    if (diffMonths === 1) return '1 місяць тому';
    if (diffMonths < 5) return `${diffMonths} місяці тому`;
    return `${diffMonths} місяців тому`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <TopBar 
        userName={user?.username}
        onAvatarPress={() => onNavigateToProfile?.(user?.id)}
        onNotificationPress={() => Alert.alert('Сповіщення', 'Функція в розробці')}
      />

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Групи</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          title="Створити групу"
          icon="homeIcon"
          iconSize={20}
          variant="purple"
          padding={12}
          onPress={onNavigateToCreateGroup || (() => {})}
        />
        <Button
          title="Групові запити"
          icon="homeIcon"
          iconSize={20}
          variant="yellow"
          padding={12}
          onPress={onNavigateToGroupRequests || (() => {})}
        />
      </View>

      {/* Search Button */}
      <View style={styles.searchContainer}>
        <Button
          title="Знайти групу"
          icon="homeIcon"
          iconSize={20}
          variant="green"
          padding={12}
          onPress={onNavigateToFindGroup || (() => {})}
        />
      </View>

      {/* Groups List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {(groups || []).length > 0 ? (
          groups.map((group) => (
            <TouchableOpacity
              key={group.id}
              style={styles.groupCard}
              onPress={() => onNavigateToGroupDetails?.(group.id)}
            >
              <View style={styles.groupHeader}>
                <View style={styles.groupAvatar}>
                  <Text style={styles.groupAvatarText}>
                    {group.name[0].toUpperCase()}
                  </Text>
                </View>
                <View style={styles.groupInfo}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.groupTag}>{group.tag}</Text>
                </View>
              </View>

              {group.description && (
                <Text style={styles.groupDescription} numberOfLines={2}>
                  {group.description}
                </Text>
              )}

              <View style={styles.groupActions}>
                <View style={styles.actionButtonWrapper}>
                  <Button
                    title="Запросити борг"
                    icon="homeIcon"
                    onPress={() => handleRequestDebt(group)}
                    variant="green"
                    padding={10}
                  />
                </View>
                <View style={styles.actionButtonWrapper}>
                  <Button
                    title="Покинути"
                    icon="homeIcon"
                    onPress={() => handleLeaveGroup(group)}
                    variant="coral"
                    padding={10}
                  />
                </View>
              </View>

              <View style={styles.groupFooter}>
                <View style={styles.footerItem}>
                  <Text style={styles.footerIcon}>🕐</Text>
                  <Text style={styles.footerText}>
                    Групу створено: {formatDate(group.createdAt)}
                  </Text>
                </View>
                <View style={styles.footerItem}>
                  <Text style={styles.footerIcon}>🖤</Text>
                  <Text style={styles.footerText}>
                    Перебування у групі: {formatDate(group.createdAt)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>У вас ще немає груп</Text>
            <Text style={styles.emptySubtext}>
              Створіть нову групу або приєднайтесь до існуючої
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
  searchContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
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
  createGroupButton: {
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
  findGroupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 12,
  },
  findGroupIcon: {
    fontSize: 20,
  },
  findGroupText: {
    ...typography.CTA,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  groupCard: {
    backgroundColor: colors.card_surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  groupAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupAvatarText: {
    ...typography.h2,
    color: colors.text,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    ...typography.h2,
    color: colors.text,
  },
  groupTag: {
    ...typography.secondary,
    color: colors.text70,
  },
  groupDescription: {
    ...typography.main,
    color: colors.text70,
    marginBottom: 12,
  },
  groupActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionButtonWrapper: {
    flex: 1,
  },
  metaIcon: {
    fontSize: 14,
  },
  metaText: {
    ...typography.secondary,
    color: colors.text70,
  },
  groupFooter: {
    gap: 8,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerIcon: {
    fontSize: 14,
  },
  footerText: {
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

export default GroupsScreen;
