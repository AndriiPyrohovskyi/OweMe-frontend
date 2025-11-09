import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { groupsApi, Group, GroupMember } from '../services/api/endpoints/groups';
import { Icon } from '../components/Icon';
import { Button } from '../components/Button';
import { DropdownMenu } from '../components/DropdownMenu';
import colors from '../theme/colors';
import typography from '../theme/typography';

interface GroupDashboardScreenProps {
  groupId: number;
  onBack: () => void;
  onOpenMenu?: () => void;
  onNavigateToAddMember?: () => void;
  onNavigateToDetails?: () => void;
  onNavigateToOwes?: () => void;
}

interface Debt {
  id: number;
  type: string;
  title: string;
  creator: {
    username: string;
    tag: string;
    avatarUrl?: string;
  };
  participants: string[];
  amount: number;
  date: string;
  time: string;
  groupTag?: string;
  isOwner: boolean;
}
const GroupDashboardScreen: React.FC<GroupDashboardScreenProps> = ({
  groupId,
  onBack,
  onOpenMenu,
  onNavigateToAddMember,
  onNavigateToDetails,
  onNavigateToOwes,
}) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [debts, setDebts] = useState<Debt[]>([]);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [menuButtonLayout, setMenuButtonLayout] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  const loadGroupData = async () => {
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
      
      // TODO: Load debts/activity from API when endpoint is available
      setDebts([]);
    } catch (error) {
      console.error('Failed to load group data:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити дані групи');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // TODO: Implement message sending
    console.log('Send message:', message);
    setMessage('');
    Keyboard.dismiss();
  };

  const handleMention = () => {
    // Toggle mention menu
    setShowMentionMenu(!showMentionMenu);
  };

  const handleSelectMention = (memberTag: string) => {
    setMessage(message + memberTag + ' ');
    setShowMentionMenu(false);
  };

  const handleMenuSelect = (value: string) => {
    setShowHeaderMenu(false);
    
    switch (value) {
      case 'add-member':
        onNavigateToAddMember?.();
        break;
      case 'debt-status':
        // TODO: Create and navigate to debt status screen
        Alert.alert('В розробці', 'Екран боргових статусів ще не реалізовано');
        break;
      case 'stats':
        // TODO: Create and navigate to statistics screen
        Alert.alert('В розробці', 'Екран статистики ще не реалізовано');
        break;
      case 'group-owes':
        onNavigateToOwes?.();
        break;
      case 'manage':
        onNavigateToDetails?.();
        break;
    }
  };

  if (loading || !group) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Icon name="homeIcon" size={24} color={colors.text} />
          </TouchableOpacity>
          <Image
            source={{ uri: group?.avatarUrl }}
            style={styles.headerAvatar}
          />
          <View style={styles.headerInfo}>
            <Text style={[typography.h3, styles.headerTitle]}>Завантаження...</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="homeIcon" size={24} color={colors.text} />
        </TouchableOpacity>
        {group.avatarUrl ? (
          <Image source={{ uri: group.avatarUrl }} style={styles.headerAvatar} />
        ) : (
          <View style={[styles.headerAvatar, styles.headerAvatarPlaceholder]}>
            <Icon name="homeIcon" size={24} color={colors.text70} />
          </View>
        )}
        <View style={styles.headerInfo}>
          <Text style={[typography.h3, styles.headerTitle]}>{group.name}</Text>
          <Text style={[typography.caption, styles.headerSubtitle]}>
            {members.length} учасників
          </Text>
        </View>
        {onOpenMenu && (
          <TouchableOpacity 
            onPress={() => setShowHeaderMenu(true)}
            style={styles.menuButton}
            onLayout={(e) => {
              const { x, y, height } = e.nativeEvent.layout;
              // Calculate absolute position roughly using insets
              setMenuButtonLayout({ x: x + 16, y: insets.top + 12 + height });
            }}
          >
            <Icon name="homeIcon" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>

      {/* Dropdown Menu */}
      <DropdownMenu
        visible={showHeaderMenu}
        onClose={() => setShowHeaderMenu(false)}
        items={[
          { label: 'Додати учасника', value: 'add-member', icon: 'homeIcon' },
          { label: 'Боргові статуси', value: 'debt-status', icon: 'homeIcon' },
          { label: 'Статистика', value: 'stats', icon: 'homeIcon' },
          { label: 'Борги групи', value: 'group-owes', icon: 'homeIcon' },
          { label: 'Керування групою', value: 'manage', icon: 'homeIcon' },
        ]}
        onSelect={handleMenuSelect}
        anchorPosition={menuButtonLayout ?? { x: 0, y: insets.top + 60 }}
      />

      {/* Messages/Debts Feed */}
      <ScrollView style={styles.feed} showsVerticalScrollIndicator={false}>
        {debts.map((debt) => {
          if (debt.type === 'debt') {
            return (
              <View key={debt.id} style={styles.debtCard}>
                <View style={styles.debtHeader}>
                  <Text style={[typography.bodyBold, styles.debtDate]}>
                    {debt.date}
                  </Text>
                </View>
                <View style={styles.debtContent}>
                  <View style={styles.debtCreator}>
                    {debt.creator.avatarUrl ? (
                      <Image
                        source={{ uri: debt.creator.avatarUrl }}
                        style={styles.debtAvatar}
                      />
                    ) : (
                      <View style={[styles.debtAvatar, styles.debtAvatarPlaceholder]}>
                        <Icon name="friendsIcon" size={20} color={colors.text.secondary} />
                      </View>
                    )}
                    <View>
                      <Text style={typography.bodyBold}>{debt.creator.username}</Text>
                      <Text style={[typography.caption, styles.debtCreatorTag]}>
                        {debt.creator.tag}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.debtInfo}>
                    <Text style={[typography.caption, styles.debtAction]}>
                      <Text style={styles.debtCreatorName}>{debt.creator.tag}</Text>
                      {' '}створив борг{' '}
                      <Text style={styles.debtTitle}>{debt.title}</Text>
                      {'\n'}для{' '}
                      {debt.participants.map((p, i) => (
                        <Text key={i} style={styles.debtParticipant}>
                          {p}
                          {i < debt.participants.length - 1 ? ' ' : ''}
                        </Text>
                      ))}
                      {' '}на суму {debt.amount} для кожного.
                    </Text>
                    {debt.time && (
                      <Text style={[typography.caption, styles.debtTime]}>
                        {debt.time}
                      </Text>
                    )}
                  </View>

                  {debt.groupTag && (
                    <View style={styles.debtGroup}>
                      <Text style={[typography.caption, styles.debtGroupText]}>
                        {debt.groupTag}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          } else {
            // Message
            return (
              <View key={debt.id} style={styles.messageCard}>
                <View style={styles.messageHeader}>
                  {debt.creator.avatarUrl ? (
                    <Image
                      source={{ uri: debt.creator.avatarUrl }}
                      style={styles.messageAvatar}
                    />
                  ) : (
                    <View style={[styles.messageAvatar, styles.messageAvatarPlaceholder]}>
                      <Icon name="friendsIcon" size={20} color={colors.text.secondary} />
                    </View>
                  )}
                  <View style={styles.messageInfo}>
                    <View style={styles.messageNameRow}>
                      <Text style={typography.bodyBold}>{debt.creator.username}</Text>
                      <Text style={[typography.caption, styles.messageTag]}>
                        {debt.creator.tag}
                      </Text>
                      {debt.groupTag && (
                        <View style={styles.ownerBadge}>
                          <Text style={styles.ownerBadgeText}>{debt.groupTag}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                <Text style={[typography.body, styles.messageText]}>
                  Альо Сань віддай 111hhggggh njdnfnj jnskdj
                </Text>
                <Text style={[typography.caption, styles.messageTime]}>
                  {debt.time}
                </Text>
              </View>
            );
          }
        })}
      </ScrollView>

      {/* Mention Member Menu - appears above input */}
      {showMentionMenu && (
        <View style={styles.mentionMenuOverlay}>
          <TouchableOpacity 
            style={styles.mentionMenuBackdrop}
            activeOpacity={1}
            onPress={() => setShowMentionMenu(false)}
          />
          <View style={styles.mentionMenuContainer}>
            <ScrollView 
              style={styles.mentionMenu} 
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
            >
              {members.length > 0 ? (
                members.map((member, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.mentionMenuItem}
                    onPress={() => handleSelectMention(`@${member.user?.username || 'user'}`)}
                  >
                    <View style={styles.mentionMemberAvatar}>
                      <Icon name="homeIcon" size={16} color={colors.text70} />
                    </View>
                    <View style={styles.mentionMemberInfo}>
                      <Text style={[typography.main, { fontSize: 14 }]}>{member.user?.username || 'User'}</Text>
                      <Text style={[typography.caption, { color: colors.text70, fontSize: 12 }]}>
                        @{member.user?.username || 'user'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                // Member suggestions when no real members
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.mentionMenuItem}
                      onPress={() => handleSelectMention('@hephestic')}
                    >
                      <View style={styles.mentionMemberAvatar}>
                        <Icon name="friendsIcon" size={16} color={colors.text.secondary} />
                      </View>
                      <View style={styles.mentionMemberInfo}>
                        <Text style={[typography.main, { fontSize: 14 }]}>Andrii Pyrohovskyi</Text>
                        <Text style={[typography.caption, { color: colors.text70, fontSize: 12 }]}>
                          @hephestic
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
              )}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={handleMention} style={styles.mentionButton}>
          <Icon name="homeIcon" size={24} color={colors.text} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Альо Сань"
          placeholderTextColor={colors.text70}
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <Button
          title=""
          icon="homeIcon"
          iconSize={20}
          variant="purple"
          padding={10}
          onPress={handleSendMessage}
          style={styles.sendButton}
        />
      </View>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    marginRight: 12,
  },
  headerAvatarPlaceholder: {
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
  },
  headerSubtitle: {
    color: colors.text.secondary,
  },
  menuButton: {
    padding: 4,
  },
  feed: {
    flex: 1,
    paddingHorizontal: 16,
  },
  debtCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
  },
  debtHeader: {
    marginBottom: 12,
  },
  debtDate: {
    color: colors.text.secondary,
  },
  debtContent: {
    gap: 12,
  },
  debtCreator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  debtAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  debtAvatarPlaceholder: {
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  debtCreatorTag: {
    color: colors.text.secondary,
  },
  debtInfo: {
    gap: 4,
  },
  debtAction: {
    color: colors.text.secondary,
    lineHeight: 20,
  },
  debtCreatorName: {
    color: colors.primary,
  },
  debtTitle: {
    color: colors.text.primary,
    fontFamily: 'Poppins-SemiBold',
  },
  debtParticipant: {
    color: colors.primary,
  },
  debtTime: {
    color: colors.text.secondary,
  },
  debtGroup: {
    alignSelf: 'flex-start',
  },
  debtGroupText: {
    color: colors.text.secondary,
  },
  messageCard: {
    backgroundColor: colors.primary + '20',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    alignSelf: 'flex-end',
    maxWidth: '80%',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  messageAvatarPlaceholder: {
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageInfo: {
    flex: 1,
  },
  messageNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  messageTag: {
    color: colors.text.secondary,
  },
  ownerBadge: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ownerBadgeText: {
    ...typography.caption,
    fontSize: 10,
  },
  messageText: {
    marginBottom: 4,
  },
  messageTime: {
    color: colors.text.secondary,
    textAlign: 'right',
  },
  memberSuggestions: {
    paddingVertical: 16,
    gap: 8,
  },
  memberSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  memberSuggestionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberSuggestionInfo: {
    flex: 1,
  },
  memberSuggestionTag: {
    color: colors.text.secondary,
  },
  mentionMenuOverlay: {
    position: 'absolute',
    bottom: 64,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  mentionMenuBackdrop: {
    position: 'absolute',
    top: -1000,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  mentionMenuContainer: {
    maxHeight: 240,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card_surface,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  mentionMenu: {
    maxHeight: 240,
  },
  mentionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  mentionMemberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mentionMemberInfo: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  mentionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card_surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.card_surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    ...typography.main,
    color: colors.text,
  },
  sendButton: {
    minWidth: 40,
  },
});

export default GroupDashboardScreen;
