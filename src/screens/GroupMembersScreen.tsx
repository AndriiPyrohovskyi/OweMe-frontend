import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { groupsApi, GroupMember, GroupsUserRole } from '../services/api/endpoints/groups';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { Button } from '../components/Button';
import Icon from '../components/Icon';

interface GroupMembersScreenProps {
  groupId: number;
  onBack: () => void;
  onNavigateToProfile?: (userId: number) => void;
}

const GroupMembersScreen: React.FC<GroupMembersScreenProps> = ({
  groupId,
  onBack,
  onNavigateToProfile,
}) => {
  const { user: currentUser } = useAuth();
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<GroupsUserRole | null>(null);
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    loadMembers();
  }, [groupId]);

  const loadMembers = async () => {
    try {
      const membersList = await groupsApi.getGroupMembers(groupId);
      setMembers(membersList);

      // Знайти роль поточного користувача
      const myMember = membersList.find(m => m.user.id === currentUser?.id);
      if (myMember) {
        setCurrentUserRole(myMember.role);
      }
    } catch (error: any) {
      console.error('Failed to load members:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити учасників');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMembers();
  };

  const canManageRoles = () => {
    return currentUserRole && [
      GroupsUserRole.Founder,
      GroupsUserRole.Owner,
      GroupsUserRole.Admin,
    ].includes(currentUserRole);
  };

  const canChangeRole = (member: GroupMember) => {
    if (!currentUserRole) return false;
    if (member.user.id === currentUser?.id) return false;
    if (member.role === GroupsUserRole.Founder) return false;

    // Founder може все
    if (currentUserRole === GroupsUserRole.Founder) return true;
    
    // Owner може змінювати всіх (Founder вже відсіяні вище)
    if (currentUserRole === GroupsUserRole.Owner) {
      return true;
    }
    
    // Admin може змінювати тільки Member
    if (currentUserRole === GroupsUserRole.Admin) {
      return member.role === GroupsUserRole.Member;
    }

    return false;
  };

  const canRemoveMember = (member: GroupMember) => {
    if (member.user.id === currentUser?.id) return true; // Можна вийти самому
    if (!canManageRoles()) return false;
    if (member.role === GroupsUserRole.Founder) return false;
    return true;
  };

  const handleChangeRole = async (newRole: GroupsUserRole) => {
    if (!selectedMember) return;

    try {
      await groupsApi.changeMemberRole(groupId, selectedMember.user.id, newRole);
      Alert.alert('Успіх', 'Роль учасника змінено');
      setShowRoleModal(false);
      setSelectedMember(null);
      loadMembers();
    } catch (error: any) {
      console.error('Failed to change role:', error);
      Alert.alert('Помилка', error.response?.data?.message || 'Не вдалося змінити роль');
    }
  };

  const handleRemoveMember = (member: GroupMember) => {
    const isMyself = member.user.id === currentUser?.id;
    const title = isMyself ? 'Вийти з групи?' : 'Видалити учасника?';
    const message = isMyself 
      ? 'Ви впевнені, що хочете вийти з цієї групи?'
      : `Видалити ${member.user.username} з групи?`;

    Alert.alert(
      title,
      message,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: isMyself ? 'Вийти' : 'Видалити',
          style: 'destructive',
          onPress: async () => {
            try {
              await groupsApi.removeMember(groupId, member.user.id);
              Alert.alert('Успіх', isMyself ? 'Ви вийшли з групи' : 'Учасника видалено');
              if (isMyself) {
                onBack();
              } else {
                loadMembers();
              }
            } catch (error: any) {
              console.error('Failed to remove member:', error);
              Alert.alert('Помилка', 'Не вдалося видалити учасника');
            }
          },
        },
      ]
    );
  };

  const getRoleLabel = (role: GroupsUserRole): string => {
    switch (role) {
      case GroupsUserRole.Founder:
        return 'Засновник';
      case GroupsUserRole.Owner:
        return 'Власник';
      case GroupsUserRole.Admin:
        return 'Адміністратор';
      case GroupsUserRole.Member:
        return 'Учасник';
      default:
        return role;
    }
  };

  const getRoleColor = (role: GroupsUserRole): string => {
    switch (role) {
      case GroupsUserRole.Founder:
        return colors.primary;
      case GroupsUserRole.Owner:
        return colors.primary;
      case GroupsUserRole.Admin:
        return colors.yellow;
      case GroupsUserRole.Member:
        return colors.green;
      default:
        return colors.text70;
    }
  };

  const getAvailableRoles = (member: GroupMember): GroupsUserRole[] => {
    if (!currentUserRole) return [];

    const allRoles = [
      GroupsUserRole.Member,
      GroupsUserRole.Admin,
      GroupsUserRole.Owner,
    ];

    // Founder може призначати будь-які ролі (крім Founder)
    if (currentUserRole === GroupsUserRole.Founder) {
      return allRoles.filter(r => r !== member.role);
    }

    // Owner може призначати Member та Admin
    if (currentUserRole === GroupsUserRole.Owner) {
      return [GroupsUserRole.Member, GroupsUserRole.Admin].filter(r => r !== member.role);
    }

    // Admin може тільки підвищувати Member до Admin або знижувати
    if (currentUserRole === GroupsUserRole.Admin && member.role === GroupsUserRole.Member) {
      return [GroupsUserRole.Admin];
    }

    return [];
  };

  const renderMember = (member: GroupMember) => {
    const fullName = [member.user.firstName, member.user.lastName]
      .filter(Boolean)
      .join(' ') || member.user.username;

    return (
      <View key={member.id} style={styles.memberCard}>
        <TouchableOpacity
          style={styles.memberInfo}
          onPress={() => onNavigateToProfile?.(member.user.id)}
          disabled={!onNavigateToProfile}
        >
          <View style={styles.avatar}>
            <Icon name="homeIcon" size={32} color={colors.text70} />
          </View>
          <View style={styles.memberDetails}>
            <Text style={styles.memberName}>{fullName}</Text>
            <Text style={styles.memberUsername}>@{member.user.username}</Text>
            <View style={styles.roleContainer}>
              <View style={[styles.roleBadge, { backgroundColor: getRoleColor(member.role) + '20' }]}>
                <Text style={[styles.roleText, { color: getRoleColor(member.role) }]}>
                  {getRoleLabel(member.role)}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.actions}>
          {canChangeRole(member) && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setSelectedMember(member);
                setShowRoleModal(true);
              }}
            >
              <Icon name="settingsIcon" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
          {canRemoveMember(member) && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleRemoveMember(member)}
            >
              <Icon name="otherIcon" size={20} color={colors.coral} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderRoleModal = () => {
    if (!selectedMember) return null;

    const availableRoles = getAvailableRoles(selectedMember);

    return (
      <Modal
        visible={showRoleModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRoleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Змінити роль</Text>
            <Text style={styles.modalSubtitle}>
              {selectedMember.user.username}
            </Text>

            <View style={styles.rolesList}>
              {availableRoles.map(role => (
                <TouchableOpacity
                  key={role}
                  style={styles.roleOption}
                  onPress={() => handleChangeRole(role)}
                >
                  <View style={[styles.roleBadge, { backgroundColor: getRoleColor(role) + '20' }]}>
                    <Text style={[styles.roleText, { color: getRoleColor(role) }]}>
                      {getRoleLabel(role)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title="Скасувати"
              onPress={() => {
                setShowRoleModal(false);
                setSelectedMember(null);
              }}
              variant="yellow"
            />
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Icon name="homeIcon" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Учасники</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Завантаження...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="homeIcon" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Учасники</Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Учасники ({members.length})
          </Text>
          {members.map(renderMember)}
        </View>
      </ScrollView>

      {renderRoleModal()}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border_divider,
    backgroundColor: colors.card_surface,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.text70,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 16,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card_surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  memberInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
  memberDetails: {
    flex: 1,
  },
  memberName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  memberUsername: {
    ...typography.caption,
    color: colors.text70,
    marginBottom: 6,
  },
  roleContainer: {
    flexDirection: 'row',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleText: {
    ...typography.caption,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card_surface,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    ...typography.body,
    color: colors.text70,
    marginBottom: 20,
    textAlign: 'center',
  },
  rolesList: {
    marginBottom: 20,
  },
  roleOption: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.background,
  },
});

export default GroupMembersScreen;
