import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { NavigationProp } from '@react-navigation/native';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Dropdown } from '../components/Dropdown';
import { TabBar } from '../components/TabBar';
import HomeScreen from './HomeScreen';
import FriendsScreen from './FriendsScreen';
import AddFriendScreen from './AddFriendScreen';
import FriendRequestsScreen from './FriendRequestsScreen';
import GroupsScreen from './GroupsScreen';
import CreateGroupScreen from './CreateGroupScreen';
import GroupRequestsScreen from './GroupRequestsScreen';
import FindGroupScreen from './FindGroupScreen';
import GroupDashboardScreen from './GroupDashboardScreen';
import GroupDetailsScreen from './GroupDetailsScreen';
import GroupRequestsManagementScreen from './GroupRequestsManagementScreen';
import AddMemberToGroupScreen from './AddMemberToGroupScreen';
import AddFriendToGroupScreen from './AddFriendToGroupScreen';
import ProfileScreen from './ProfileScreen';
import EditProfileScreen from './EditProfileScreen';
import UserProfileScreen from './UserProfileScreen';
import GroupMembersScreen from './GroupMembersScreen';
import EditGroupScreen from './EditGroupScreen';
import MyOwesScreen from './MyOwesScreen';
import CreateOweScreen from './CreateOweScreen';
import OweDetailsScreen from './OweDetailsScreen';
import EditOweScreen from './EditOweScreen';
import MyOweReturnsScreen from './MyOweReturnsScreen';
import CreateOweReturnScreen from './CreateOweReturnScreen';
import GroupOwesScreen from './GroupOwesScreen';
import { WalletScreen } from './WalletScreen';
import { DepositScreen } from './DepositScreen';
import { TransferScreen } from './TransferScreen';
import { NotificationsScreen } from './NotificationsScreen';
import StatisticsScreen from './StatisticsScreen';
import AchievementsScreen from './AchievementsScreen';
import { GroupDebtStatusScreen } from './GroupDebtStatusScreen';
import BannedScreen from './BannedScreen';

type MainScreenProps = {
  navigation: NavigationProp<any>;
};

type GroupSubScreen = 
  | { type: 'list' }
  | { type: 'create' }
  | { type: 'requests' }
  | { type: 'find' }
  | { type: 'dashboard'; groupId: number }
  | { type: 'details'; groupId: number }
  | { type: 'manageRequests'; groupId: number }
  | { type: 'addMember'; groupId: number }
  | { type: 'addFriend'; groupId: number }
  | { type: 'members'; groupId: number }
  | { type: 'edit'; groupId: number }
  | { type: 'owes'; groupId: number }
  | { type: 'debtStatus'; groupId: number };

type OwesSubScreen =
  | { type: 'list' }
  | { type: 'create'; friendId?: number; groupId?: number }
  | { type: 'details'; oweId: number }
  | { type: 'edit'; oweItemId: number }
  | { type: 'returns' }
  | { type: 'createReturn'; participantId: number }
  | { type: 'groupOwes'; groupId: number };

type WalletSubScreen = 
  | { type: 'main' }
  | { type: 'deposit' }
  | { type: 'transfer' };

type ProfileSubScreen = 'view' | 'edit';

export const MainScreen: React.FC<MainScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("Домашня");
  const [friendsSubScreen, setFriendsSubScreen] = useState<'list' | 'add' | 'requests'>('list');
  const [groupsSubScreen, setGroupsSubScreen] = useState<GroupSubScreen>({ type: 'list' });
  const [owesSubScreen, setOwesSubScreen] = useState<OwesSubScreen>({ type: 'list' });
  const [walletSubScreen, setWalletSubScreen] = useState<WalletSubScreen | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [profileSubScreen, setProfileSubScreen] = useState<ProfileSubScreen>('view');
  const [viewingUserProfile, setViewingUserProfile] = useState<number | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  
  if (user?.isBanned) {
    return <BannedScreen />;
  }
  
  const handleLogout = async () => {
    await logout();
  };
  
  const renderContent = () => {
    // Якщо відкритий гаманець
    if (walletSubScreen) {
      if (walletSubScreen.type === 'deposit') {
        return (
          <DepositScreen
            onBack={() => setWalletSubScreen({ type: 'main' })}
            onSuccess={() => setWalletSubScreen({ type: 'main' })}
          />
        );
      } else if (walletSubScreen.type === 'transfer') {
        return (
          <TransferScreen
            onBack={() => setWalletSubScreen({ type: 'main' })}
            onSuccess={() => setWalletSubScreen({ type: 'main' })}
          />
        );
      }
      // main wallet screen
      return (
        <WalletScreen
          onBack={() => setWalletSubScreen(null)}
          onDeposit={() => setWalletSubScreen({ type: 'deposit' })}
          onTransfer={() => setWalletSubScreen({ type: 'transfer' })}
          onNavigateToUser={(userId) => {
            setWalletSubScreen(null);
            setViewingUserProfile(userId);
          }}
          onNavigateToOwe={(oweId) => {
            setWalletSubScreen(null);
            setActiveTab('Борги');
            setOwesSubScreen({ type: 'details', oweId });
          }}
          onNavigateToReturn={(returnId) => {
            // Перейти до списку returns, користувач побачить цей return
            setWalletSubScreen(null);
            setActiveTab('Борги');
            setOwesSubScreen({ type: 'returns' });
            // TODO: можна додати підсвітку конкретного return або автоматичне відкриття деталей
          }}
        />
      );
    }

    // Якщо відкриті сповіщення
    if (showNotifications) {
      return (
        <NotificationsScreen 
          onBack={() => setShowNotifications(false)}
        />
      );
    }

    // Якщо відкрита статистика
    if (showStatistics) {
      return (
        <StatisticsScreen 
          onClose={() => setShowStatistics(false)}
          onNavigateToUserProfile={(userId) => {
            setShowStatistics(false);
            setViewingUserProfile(userId);
          }}
        />
      );
    }

    // Якщо відкриті досягнення
    if (showAchievements) {
      return (
        <AchievementsScreen 
          onClose={() => setShowAchievements(false)}
        />
      );
    }

    // Якщо переглядається профіль іншого користувача
    if (viewingUserProfile) {
      return (
        <UserProfileScreen 
          userId={viewingUserProfile}
          onBack={() => setViewingUserProfile(null)}
          onNavigateToCreateOwe={(friendId) => {
            setViewingUserProfile(null);
            setActiveTab('Борги');
            setOwesSubScreen({ type: 'create', friendId });
          }}
          onNavigateToInviteToGroup={(userId) => {
            // TODO: Додати можливість вибору групи для запрошення
            Alert.alert(
              'Запросити в групу',
              'Функція запрошення користувача в групу буде доступна найближчим часом. Зараз ви можете запросити користувача через екран групи.'
            );
          }}
        />
      );
    }

    // Якщо відкритий профіль, показуємо його поверх всього
    if (showProfile) {
      if (profileSubScreen === 'edit') {
        return <EditProfileScreen onBack={() => setProfileSubScreen('view')} />;
      }
      return (
        <ProfileScreen 
          onBack={() => {
            setShowProfile(false);
            setProfileSubScreen('view');
          }}
          onEdit={() => setProfileSubScreen('edit')}
        />
      );
    }

    switch(activeTab) {
      case "Домашня":
        return (
          <HomeScreen 
            onNavigateToProfile={() => setShowProfile(true)}
            onNavigateToNotifications={() => setShowNotifications(true)}
            onNavigateToFriends={() => setActiveTab('Друзі')}
            onNavigateToGroups={() => setActiveTab('Групи')}
            onNavigateToOwes={() => setActiveTab('Борги')}
            onNavigateToTransfer={() => setActiveTab('Борги')}
            onNavigateToTopUp={() => setWalletSubScreen({ type: 'main' })}
            onNavigateToStatistics={() => setShowStatistics(true)}
          />
        );
      case "Друзі":
        if (friendsSubScreen === 'add') {
          return (
            <AddFriendScreen 
              onBack={() => setFriendsSubScreen('list')}
              onNavigateToProfile={(username) => setViewingUserProfile(username)}
            />
          );
        } else if (friendsSubScreen === 'requests') {
          return (
            <FriendRequestsScreen 
              onBack={() => setFriendsSubScreen('list')}
              onNavigateToProfile={(username) => setViewingUserProfile(username)}
            />
          );
        }
        return (
          <FriendsScreen
            onNavigateToAddFriend={() => setFriendsSubScreen('add')}
            onNavigateToRequests={() => setFriendsSubScreen('requests')}
            onNavigateToProfile={(username) => setViewingUserProfile(username)}
            onNavigateToNotifications={() => setShowNotifications(true)}
            onNavigateToCreateOwe={(friendId) => {
              setActiveTab("Борги");
              setOwesSubScreen({ type: 'create', friendId });
            }}
          />
        );
      case "Групи":
        if (groupsSubScreen.type === 'create') {
          return <CreateGroupScreen onBack={() => setGroupsSubScreen({ type: 'list' })} />;
        } else if (groupsSubScreen.type === 'requests') {
          return <GroupRequestsScreen onBack={() => setGroupsSubScreen({ type: 'list' })} />;
        } else if (groupsSubScreen.type === 'find') {
          return <FindGroupScreen onBack={() => setGroupsSubScreen({ type: 'list' })} />;
        } else if (groupsSubScreen.type === 'dashboard') {
          return (
            <GroupDashboardScreen 
              groupId={groupsSubScreen.groupId}
              onBack={() => setGroupsSubScreen({ type: 'list' })}
              onOpenMenu={() => setGroupsSubScreen({ type: 'details', groupId: groupsSubScreen.groupId })}
              onNavigateToAddMember={() => setGroupsSubScreen({ type: 'addMember', groupId: groupsSubScreen.groupId })}
              onNavigateToDetails={() => setGroupsSubScreen({ type: 'details', groupId: groupsSubScreen.groupId })}
              onNavigateToOwes={() => setGroupsSubScreen({ type: 'owes', groupId: groupsSubScreen.groupId })}
              onNavigateToDebtStatus={() => setGroupsSubScreen({ type: 'debtStatus', groupId: groupsSubScreen.groupId })}
            />
          );
        } else if (groupsSubScreen.type === 'details') {
          return (
            <GroupDetailsScreen
              groupId={groupsSubScreen.groupId}
              onBack={() => setGroupsSubScreen({ type: 'dashboard', groupId: groupsSubScreen.groupId })}
              onNavigateToAddMember={() => setGroupsSubScreen({ type: 'addMember', groupId: groupsSubScreen.groupId })}
              onNavigateToAddFriend={() => setGroupsSubScreen({ type: 'addFriend', groupId: groupsSubScreen.groupId })}
              onNavigateToManageRequests={() => setGroupsSubScreen({ type: 'manageRequests', groupId: groupsSubScreen.groupId })}
              onNavigateToDashboard={() => setGroupsSubScreen({ type: 'dashboard', groupId: groupsSubScreen.groupId })}
              onNavigateToMembers={() => setGroupsSubScreen({ type: 'members', groupId: groupsSubScreen.groupId })}
              onNavigateToEditGroup={() => setGroupsSubScreen({ type: 'edit', groupId: groupsSubScreen.groupId })}
            />
          );
        } else if (groupsSubScreen.type === 'members') {
          return (
            <GroupMembersScreen
              groupId={groupsSubScreen.groupId}
              onBack={() => setGroupsSubScreen({ type: 'details', groupId: groupsSubScreen.groupId })}
              onNavigateToProfile={(userId) => setViewingUserProfile(userId)}
            />
          );
        } else if (groupsSubScreen.type === 'edit') {
          return (
            <EditGroupScreen
              groupId={groupsSubScreen.groupId}
              onBack={() => setGroupsSubScreen({ type: 'details', groupId: groupsSubScreen.groupId })}
            />
          );
        } else if (groupsSubScreen.type === 'manageRequests') {
          return (
            <GroupRequestsManagementScreen
              groupId={groupsSubScreen.groupId}
              onBack={() => setGroupsSubScreen({ type: 'details', groupId: groupsSubScreen.groupId })}
            />
          );
        } else if (groupsSubScreen.type === 'addMember' && 'groupId' in groupsSubScreen) {
          return (
            <AddMemberToGroupScreen
              groupId={groupsSubScreen.groupId}
              onBack={() => setGroupsSubScreen({ type: 'details', groupId: groupsSubScreen.groupId })}
            />
          );
        } else if (groupsSubScreen.type === 'addFriend' && 'groupId' in groupsSubScreen) {
          return (
            <AddFriendToGroupScreen
              groupId={groupsSubScreen.groupId}
              onBack={() => setGroupsSubScreen({ type: 'details', groupId: groupsSubScreen.groupId })}
            />
          );
        } else if (groupsSubScreen.type === 'owes' && 'groupId' in groupsSubScreen) {
          return (
            <GroupOwesScreen
              groupId={groupsSubScreen.groupId}
              onBack={() => setGroupsSubScreen({ type: 'dashboard', groupId: groupsSubScreen.groupId })}
              onViewOwe={(oweId) => {
                // Switch to Owes tab and show details
                setActiveTab('Борги');
                setOwesSubScreen({ type: 'details', oweId });
              }}
            />
          );
        } else if (groupsSubScreen.type === 'debtStatus' && 'groupId' in groupsSubScreen) {
          return (
            <GroupDebtStatusScreen
              groupId={groupsSubScreen.groupId}
              onBack={() => setGroupsSubScreen({ type: 'dashboard', groupId: groupsSubScreen.groupId })}
            />
          );
        }
        return (
          <GroupsScreen
            onNavigateToCreateGroup={() => setGroupsSubScreen({ type: 'create' })}
            onNavigateToGroupRequests={() => setGroupsSubScreen({ type: 'requests' })}
            onNavigateToFindGroup={() => setGroupsSubScreen({ type: 'find' })}
            onNavigateToGroupDetails={(groupId) => setGroupsSubScreen({ type: 'dashboard', groupId })}
            onNavigateToNotifications={() => setShowNotifications(true)}
            onNavigateToCreateOweForGroup={(groupId) => {
              setActiveTab('Борги');
              setOwesSubScreen({ type: 'create', friendId: undefined });
              // Pass groupId via a temporary state in owesSubScreen would be better; for now we open create and let user select group
            }}
          />
        );
      case "Борги":
        if (owesSubScreen.type === 'create') {
          return (
            <CreateOweScreen
              onBack={() => setOwesSubScreen({ type: 'list' })}
              onSuccess={(oweId) => setOwesSubScreen({ type: 'details', oweId })}
              friendId={'friendId' in owesSubScreen ? owesSubScreen.friendId : undefined}
              groupId={'groupId' in owesSubScreen ? owesSubScreen.groupId : undefined}
            />
          );
        } else if (owesSubScreen.type === 'details' && 'oweId' in owesSubScreen) {
          return (
            <OweDetailsScreen
              oweId={owesSubScreen.oweId}
              onBack={() => setOwesSubScreen({ type: 'list' })}
              onEdit={(oweItemId) => {
                if (oweItemId) {
                  setOwesSubScreen({ type: 'edit', oweItemId });
                } else {
                  Alert.alert('Помилка', 'Не вдалося відкрити екран редагування');
                }
              }}
              onCreateReturn={(participantId) => 
                setOwesSubScreen({ type: 'createReturn', participantId })
              }
              onNavigateToUser={(userId) => {
                // Перейти до профілю користувача
                setViewingUserProfile(userId);
              }}
              onNavigateToGroup={(groupId) => {
                // Перейти до деталей групи
                setActiveTab('Групи');
                setGroupsSubScreen({ type: 'dashboard', groupId });
              }}
            />
          );
        } else if (owesSubScreen.type === 'edit' && 'oweItemId' in owesSubScreen) {
          return (
            <EditOweScreen
              oweItemId={owesSubScreen.oweItemId}
              onBack={() => setOwesSubScreen({ type: 'list' })}
              onSaved={() => {
                setOwesSubScreen({ type: 'list' });
              }}
            />
          );
        } else if (owesSubScreen.type === 'returns') {
          return (
            <MyOweReturnsScreen
              onBack={() => setOwesSubScreen({ type: 'list' })}
              onNavigateToOwe={(oweId) => {
                // Перейти до деталей боргу
                setOwesSubScreen({ type: 'details', oweId });
              }}
            />
          );
        } else if (owesSubScreen.type === 'createReturn' && 'participantId' in owesSubScreen) {
          return (
            <CreateOweReturnScreen
              participantId={owesSubScreen.participantId}
              onBack={() => setOwesSubScreen({ type: 'list' })}
              onSuccess={() => setOwesSubScreen({ type: 'list' })}
            />
          );
        } else if (owesSubScreen.type === 'groupOwes' && 'groupId' in owesSubScreen) {
          return (
            <GroupOwesScreen
              groupId={owesSubScreen.groupId}
              onBack={() => setOwesSubScreen({ type: 'list' })}
              onViewOwe={(oweId) => setOwesSubScreen({ type: 'details', oweId })}
            />
          );
        }
        return (
          <MyOwesScreen
            onBack={() => setActiveTab('Домашня')}
            onCreateOwe={() => setOwesSubScreen({ type: 'create' })}
            onViewOwe={(oweId) => setOwesSubScreen({ type: 'details', oweId })}
            onNavigateToReturns={() => setOwesSubScreen({ type: 'returns' })}
            onNavigateToUserProfile={(userId) => setViewingUserProfile(userId)}
            onNavigateToProfile={() => setShowProfile(true)}
            onNavigateToNotifications={() => setShowNotifications(true)}
          />
        );
      case "Налаштування":
        return <Text style={[typography.h2, styles.text]}>Налаштування</Text>;
      case "Інше":
        return (
          <View style={styles.otherContainer}>
            <Text style={[typography.h2, styles.otherTitle]}>Інше</Text>
            
            <View style={styles.otherSection}>
              <Text style={[typography.h3, styles.sectionTitle]}>Аналітика</Text>
              
              <Button
                title="📊 Статистика"
                icon="homeIcon"
                onPress={() => setShowStatistics(true)}
                variant="purple"
                padding={16}
                style={styles.otherButton}
              />
              
              <Button
                title="🏆 Досягнення"
                icon="homeIcon"
                onPress={() => setShowAchievements(true)}
                variant="yellow"
                padding={16}
                style={styles.otherButton}
              />
            </View>

            <View style={styles.otherSection}>
              <Text style={[typography.h3, styles.sectionTitle]}>Гаманець</Text>
              
              <Button
                title="💳 Мій гаманець"
                icon="homeIcon"
                onPress={() => setWalletSubScreen({ type: 'main' })}
                variant="green"
                padding={16}
                style={styles.otherButton}
              />
            </View>

            <View style={styles.otherSection}>
              <Button
                title="Вийти"
                icon="homeIcon"
                onPress={handleLogout}
                variant="coral"
                padding={16}
              />
            </View>
          </View>
        );
      default:
        return null;
    }
  };
  
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          {renderContent()}
        </View>
  {/* Hide TabBar when in GroupDashboard, viewing profile, wallet, notifications, statistics, or when showing Profile */}
  {!showProfile && !showNotifications && !showStatistics && groupsSubScreen.type !== 'dashboard' && !viewingUserProfile && !walletSubScreen && (
          <TabBar
            onTabChange={(tab) => {
              setActiveTab(tab.name);
              // Скидаємо sub-screens при зміні таба
              if (tab.name === "Друзі") {
                setFriendsSubScreen('list');
              }
              if (tab.name === "Групи") {
                setGroupsSubScreen({ type: 'list' });
              }
              if (tab.name === "Борги") {
                setOwesSubScreen({ type: 'list' });
              }
            }}
            tabs={[ {name: "Домашня", icon: "homeIcon"},
                    {name: "Друзі", icon: "friendsIcon"},
                    {name: "Групи", icon: "groupsIcon"},
                    {name: "Борги", icon: "homeIcon"},
                    {name: "Налаштування", icon: "settingsIcon"},
                    {name: "Інше", icon: "otherIcon"},
            ]}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  text: {
    marginBottom: 10,
    color: colors.text
  },
  subtitle: {
    opacity: 0.7,
    color: colors.text,
    marginBottom: 20,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
  },
  otherContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  otherTitle: {
    color: colors.text,
    marginBottom: 24,
  },
  otherSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.text,
    marginBottom: 12,
  },
  otherButton: {
    marginBottom: 12,
  },
});

export default MainScreen;