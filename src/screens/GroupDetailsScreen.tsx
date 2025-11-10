import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchImageLibrary, launchCamera, ImagePickerResponse } from 'react-native-image-picker';
import { useAuth } from '../context/AuthContext';
import { groupsApi, Group, GroupMember, GroupsUserRole, GroupOwe } from '../services/api/endpoints/groups';
import { uploadApi } from '../services/api/endpoints/upload';
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
  const [owes, setOwes] = useState<GroupOwe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroupDetails();
  }, [groupId]);

  const loadGroupDetails = async () => {
    try {
      setLoading(true);
      const groupData = await groupsApi.getGroup(groupId);
      setGroup(groupData);
      
      try {
        const membersData = await groupsApi.getGroupMembers(groupId);
        setMembers(membersData);
      } catch (membersError) {
        console.log('Members endpoint not available yet');
        setMembers([]);
      }

      try {
        const owesData = await groupsApi.getGroupOwes(groupId);
        setOwes(owesData);
      } catch (owesError) {
        console.log('Owes endpoint not available yet');
        setOwes([]);
      }
    } catch (error) {
      console.error('Failed to load group details:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити дані групи');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (response: ImagePickerResponse) => {
    if (response.didCancel) {
      return;
    }

    if (response.errorCode) {
      Alert.alert('Помилка', 'Не вдалося вибрати фото');
      return;
    }

    const asset = response.assets?.[0];
    if (asset) {
      uploadGroupAvatar(asset);
    }
  };

  const handleChangePhoto = () => {
    Alert.alert(
      'Змінити фото',
      'Оберіть джерело фото',
      [
        {
          text: 'Камера',
          onPress: () => {
            launchCamera(
              {
                mediaType: 'photo',
                quality: 0.8,
                saveToPhotos: false,
              },
              handleImageSelect
            );
          },
        },
        {
          text: 'Галерея',
          onPress: () => {
            launchImageLibrary(
              {
                mediaType: 'photo',
                quality: 0.8,
              },
              handleImageSelect
            );
          },
        },
        { text: 'Скасувати', style: 'cancel' },
      ]
    );
  };

  const uploadGroupAvatar = async (asset: any) => {
    try {
      const result = await uploadApi.uploadGroupAvatar(groupId, asset);
      console.log('Upload result:', result);
      if (group && result && result.avatarUrl) {
        setGroup({ ...group, avatarUrl: result.avatarUrl });
        Alert.alert('Успіх', 'Фото групи оновлено');
      } else {
        console.error('Invalid result:', result);
        Alert.alert('Помилка', 'Отримано невірну відповідь від сервера');
      }
    } catch (error) {
      console.error('Failed to upload group avatar:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити фото');
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

  // Розрахунок статистики боргів
  const myOwesToOthers = owes
    .filter(owe => owe.fromUserId === user?.id)
    .reduce((sum, owe) => sum + parseFloat(owe.totalDebt), 0);

  const othersOweToMe = owes
    .filter(owe => owe.toUserId === user?.id)
    .reduce((sum, owe) => sum + parseFloat(owe.totalDebt), 0);

  const totalGroupDebts = owes.reduce((sum, owe) => sum + parseFloat(owe.totalDebt), 0);

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
            <View style={styles.avatarButtonsContainer}>
              <TouchableOpacity style={styles.changePhotoButton} onPress={handleChangePhoto}>
                <Icon name="camera" size={16} color={colors.background.primary} />
                <Text style={styles.changePhotoText}>Змінити фото</Text>
              </TouchableOpacity>
              {group.avatarUrl && (
                <TouchableOpacity style={styles.deletePhotoButton} onPress={handleDeletePhoto}>
                  <Icon name="trash" size={16} color={colors.background.primary} />
                  <Text style={styles.deletePhotoText}>Видалити фото</Text>
                </TouchableOpacity>
              )}
            </View>
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
            <Icon name="friendsIcon" size={20} color={colors.text.secondary} />
            <Text style={[typography.caption, styles.statText]}>
              Учасників: <Text style={styles.statValue}>{members.length}</Text>
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

        {/* Debt Statistics */}
        {owes.length > 0 && (
          <View style={styles.debtStatsContainer}>
            <Text style={[typography.h3, styles.sectionTitle]}>Статистика боргів</Text>
            <View style={styles.debtStatsGrid}>
              <View style={styles.debtStatCard}>
                <Icon name="friendsIcon" size={24} color={colors.green} />
                <Text style={[typography.caption, styles.debtStatLabel]}>Вам винні</Text>
                <Text style={[typography.h2, styles.debtStatValue, { color: colors.green }]}>
                  {othersOweToMe.toFixed(2)} ₴
                </Text>
              </View>
              <View style={styles.debtStatCard}>
                <Icon name="friendsIcon" size={24} color={colors.coral} />
                <Text style={[typography.caption, styles.debtStatLabel]}>Ви винні</Text>
                <Text style={[typography.h2, styles.debtStatValue, { color: colors.coral }]}>
                  {myOwesToOthers.toFixed(2)} ₴
                </Text>
              </View>
              <View style={styles.debtStatCard}>
                <Icon name="friendsIcon" size={24} color={colors.primary} />
                <Text style={[typography.caption, styles.debtStatLabel]}>Всього в групі</Text>
                <Text style={[typography.h2, styles.debtStatValue, { color: colors.primary }]}>
                  {totalGroupDebts.toFixed(2)} ₴
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Owes Section */}
        {owes.length > 0 && (
          <View style={styles.owesSection}>
            <Text style={[typography.h3, styles.sectionTitle]}>Борги в групі</Text>
            {owes.map((owe, index) => (
              <View key={index} style={styles.oweItem}>
                <View style={styles.oweUsers}>
                  <View style={styles.oweUserContainer}>
                    {owe.fromUserAvatar ? (
                      <Image source={{ uri: owe.fromUserAvatar }} style={styles.oweAvatar} />
                    ) : (
                      <View style={[styles.oweAvatar, styles.oweAvatarPlaceholder]}>
                        <Icon name="profileIcon" size={20} color={colors.text.secondary} />
                      </View>
                    )}
                    <Text style={typography.caption}>{owe.fromUserName}</Text>
                  </View>
                  <Icon name="arrowRight" size={20} color={colors.text.secondary} />
                  <View style={styles.oweUserContainer}>
                    {owe.toUserAvatar ? (
                      <Image source={{ uri: owe.toUserAvatar }} style={styles.oweAvatar} />
                    ) : (
                      <View style={[styles.oweAvatar, styles.oweAvatarPlaceholder]}>
                        <Icon name="profileIcon" size={20} color={colors.text.secondary} />
                      </View>
                    )}
                    <Text style={typography.caption}>{owe.toUserName}</Text>
                  </View>
                </View>
                <Text style={[typography.h3, styles.oweAmount]}>{parseFloat(owe.totalDebt).toFixed(2)} ₴</Text>
              </View>
            ))}
          </View>
        )}

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
  avatarButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.green,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  changePhotoText: {
    ...typography.caption,
    color: colors.background.primary,
    fontFamily: 'Poppins-SemiBold',
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
  debtStatsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  debtStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  debtStatCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  debtStatLabel: {
    color: colors.text.secondary,
    textAlign: 'center',
  },
  debtStatValue: {
    textAlign: 'center',
  },
  owesSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  oweItem: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  oweUsers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  oweUserContainer: {
    alignItems: 'center',
    gap: 4,
  },
  oweAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  oweAvatarPlaceholder: {
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  oweAmount: {
    color: colors.green,
  },
});

export default GroupDetailsScreen;
