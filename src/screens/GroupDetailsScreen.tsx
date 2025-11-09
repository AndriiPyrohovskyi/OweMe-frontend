import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { groupsApi, Group, GroupMember, GroupsUserRole } from '../services/api/endpoints/groups';
import { Icon } from '../components/Icon';
import { Button } from '../components/Button';
import colors from '../theme/colors';
import typography from '../theme/typography';

interface GroupDetailsScreenProps {
  groupId: number;
  onBack: () => void;
  onNavigateToAddMember?: () => void;
  onNavigateToAddFriend?: () => void;
  onNavigateToManageRequests?: () => void;
  onNavigateToDashboard?: () => void;
  onNavigateToManageGroup?: () => void;
  onNavigateToMembers?: () => void;
  onNavigateToEditGroup?: () => void;
}

const GroupDetailsScreen: React.FC<GroupDetailsScreenProps> = ({
  groupId,
  onBack,
  onNavigateToAddMember,
  onNavigateToAddFriend,
  onNavigateToManageRequests,
  onNavigateToDashboard,
  onNavigateToManageGroup,
  onNavigateToMembers,
  onNavigateToEditGroup,
}) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroupDetails();
  }, [groupId]);

  const loadGroupDetails = async () => {
    try {
      setLoading(true);
      const groupData = await groupsApi.getGroup(groupId);
      setGroup(groupData);
      
      // Try to load members, but don't fail if endpoint doesn't exist
      try {
        const membersData = await groupsApi.getGroupMembers(groupId);
        setMembers(membersData);
      } catch (membersError) {
        console.log('Members endpoint not available yet');
        setMembers([]);
      }
    } catch (error) {
      console.error('Failed to load group details:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити дані групи');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = () => {
    Alert.alert(
      'Видалити фото',
      'Ви впевнені, що хочете видалити фото групи?',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement photo deletion
            console.log('Delete photo');
          },
        },
      ]
    );
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      'Вийти з групи',
      'Ви впевнені, що хочете вийти з групи?',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Вийти',
          style: 'destructive',
          onPress: async () => {
            try {
              if (user?.id) {
                await groupsApi.removeMember(groupId, user.id);
                onBack();
              }
            } catch (error) {
              console.error('Failed to leave group:', error);
              Alert.alert('Помилка', 'Не вдалося вийти з групи');
            }
          },
        },
      ]
    );
  };

  // Визначаємо роль поточного користувача
  const currentUserMember = members.find(m => m.user.id === user?.id);
  const currentUserRole = currentUserMember?.role;
  
  // Тільки Founder та Owner можуть редагувати групу
  const canEditGroup = currentUserRole && [
    GroupsUserRole.Founder,
    GroupsUserRole.Owner
  ].includes(currentUserRole);
  
  // Адміністратори та вище можуть керувати запитами та додавати учасників
  const canManageRequests = currentUserRole && [
    GroupsUserRole.Founder,
    GroupsUserRole.Owner,
    GroupsUserRole.Admin
  ].includes(currentUserRole);

  if (loading || !group) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Icon name="arrowLeft" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={[typography.h3, styles.headerTitle]}>Група</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={typography.body}>Завантаження...</Text>
        </View>
      </View>
    );
  }

  // Розрахунок часу з моменту створення групи
  const createdDate = group.createdAt ? new Date(group.createdAt) : null;
  const now = new Date();
  const diffMonthsCreated = createdDate 
    ? Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
    : 0;

  // Розрахунок часу перебування користувача в групі
  const currentMember = user ? members.find(m => m.user.id === user.id) : null;
  const joinedDate = currentMember?.joinedAt ? new Date(currentMember.joinedAt) : null;
  const diffMonthsJoined = joinedDate
    ? Math.floor((now.getTime() - joinedDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
    : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrowLeft" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[typography.h3, styles.headerTitle]}>Група</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Group Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarWrapper}>
            {group.avatarUrl ? (
              <Image source={{ uri: group.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Icon name="groupsIcon" size={80} color={colors.text.secondary} />
              </View>
            )}
          </View>
          {canEditGroup && (
            <TouchableOpacity style={styles.deletePhotoButton} onPress={handleDeletePhoto}>
              <Icon name="trash" size={16} color={colors.background.primary} />
              <Text style={styles.deletePhotoText}>Видалити фото</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Group Info */}
        <View style={styles.infoSection}>
          <Text style={typography.h2}>{group.name}</Text>
          <Text style={[typography.body, styles.tag]}>{group.tag}</Text>
          
          {group.description && (
            <View style={styles.descriptionContainer}>
              <Text style={typography.body}>{group.description}</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Icon name="friendsIcon" size={20} color={colors.primary} />
            <Text style={[typography.caption, styles.statText]}>
              Вам винні: <Text style={styles.statValue}>120</Text>
            </Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="friendsIcon" size={20} color={colors.coral} />
            <Text style={[typography.caption, styles.statText]}>
              Ви винні: <Text style={styles.statValue}>50 123</Text>
            </Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="friendsIcon" size={20} color={colors.text.secondary} />
            <Text style={[typography.caption, styles.statText]}>
              Групу створено: {createdDate 
                ? createdDate.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'невідомо'}
            </Text>
          </View>
          {joinedDate && (
            <View style={styles.statItem}>
              <Icon name="friendsIcon" size={20} color={colors.coral} />
              <Text style={[typography.caption, styles.statText]}>
                Ви приєдналися: {joinedDate.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          {onNavigateToDashboard && (
            <Button 
              title="Про групу" 
              icon="homeIcon" 
              variant="purple" 
              padding={14} 
              onPress={onNavigateToDashboard}
            />
          )}

          {onNavigateToMembers && (
            <Button 
              title="Учасники групи" 
              icon="friendsIcon" 
              variant="green" 
              padding={14} 
              onPress={onNavigateToMembers}
            />
          )}

          {canEditGroup && onNavigateToEditGroup && (
            <Button 
              title="Редагувати групу" 
              icon="settingsIcon" 
              variant="yellow" 
              padding={14} 
              onPress={onNavigateToEditGroup}
            />
          )}

          {canManageRequests && onNavigateToManageRequests && (
            <Button 
              title="Управління запитами" 
              icon="homeIcon" 
              variant="purple" 
              padding={14} 
              onPress={onNavigateToManageRequests}
            />
          )}

          {canManageRequests && onNavigateToAddMember && (
            <Button 
              title="Додати учасника" 
              icon="homeIcon" 
              variant="green" 
              padding={14} 
              onPress={onNavigateToAddMember}
            />
          )}

          <Button 
            title="Вийти з групи" 
            icon="homeIcon" 
            variant="coral" 
            padding={14} 
            onPress={handleLeaveGroup}
          />
        </View>
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
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarWrapper: {
    marginBottom: 12,
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  avatarPlaceholder: {
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deletePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.coral,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  deletePhotoText: {
    ...typography.caption,
    color: colors.background.primary,
    fontFamily: 'Poppins-SemiBold',
  },
  infoSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tag: {
    color: colors.text.secondary,
    marginTop: 4,
  },
  descriptionContainer: {
    marginTop: 12,
    paddingHorizontal: 20,
  },
  statsContainer: {
    backgroundColor: colors.background.secondary,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statText: {
    color: colors.text.secondary,
  },
  statValue: {
    color: colors.text.primary,
    fontFamily: 'Poppins-SemiBold',
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  actionButton: {
    backgroundColor: colors.background.secondary,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  actionButtonText: {
    ...typography.button,
    color: colors.text.primary,
  },
  actionButtonYellow: {
    backgroundColor: colors.yellow,
    paddingVertical: 14,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonTextYellow: {
    ...typography.button,
    color: colors.text.primary,
  },
  actionButtonGreen: {
    backgroundColor: colors.green,
    paddingVertical: 14,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonTextGreen: {
    ...typography.button,
    color: colors.background.primary,
  },
  actionButtonCoral: {
    backgroundColor: colors.coral,
    paddingVertical: 14,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonTextCoral: {
    ...typography.button,
    color: colors.background.primary,
  },
});

export default GroupDetailsScreen;
