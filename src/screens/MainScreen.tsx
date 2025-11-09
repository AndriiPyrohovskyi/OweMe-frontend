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
import MyOweReturnsScreen from './MyOweReturnsScreen';
import CreateOweReturnScreen from './CreateOweReturnScreen';
import GroupOwesScreen from './GroupOwesScreen';

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
  | { type: 'owes'; groupId: number };

type OwesSubScreen =
  | { type: 'list' }
  | { type: 'create'; friendId?: number; groupId?: number }
  | { type: 'details'; oweId: number }
  | { type: 'returns' }
  | { type: 'createReturn'; participantId: number }
  | { type: 'groupOwes'; groupId: number };

type ProfileSubScreen = 'view' | 'edit';

export const MainScreen: React.FC<MainScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("Домашня");
  const [friendsSubScreen, setFriendsSubScreen] = useState<'list' | 'add' | 'requests'>('list');
  const [groupsSubScreen, setGroupsSubScreen] = useState<GroupSubScreen>({ type: 'list' });
  const [owesSubScreen, setOwesSubScreen] = useState<OwesSubScreen>({ type: 'list' });
  const [showProfile, setShowProfile] = useState(false);
  const [profileSubScreen, setProfileSubScreen] = useState<ProfileSubScreen>('view');
  const [viewingUserProfile, setViewingUserProfile] = useState<number | null>(null);
  
  const handleLogout = async () => {
    await logout();
  };
  
  const renderContent = () => {
    // Якщо переглядається профіль іншого користувача
    if (viewingUserProfile) {
      return (
        <UserProfileScreen 
          userId={viewingUserProfile}
          onBack={() => setViewingUserProfile(null)}
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
            onNavigateToFriends={() => setActiveTab('Друзі')}
            onNavigateToGroups={() => setActiveTab('Групи')}
            onNavigateToTransfer={() => setActiveTab('Борги')}
            onNavigateToTopUp={() => Alert.alert('Поповнення', 'Відкрити екран поповнення (в розробці)')}
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
        }
        return (
          <GroupsScreen
            onNavigateToCreateGroup={() => setGroupsSubScreen({ type: 'create' })}
            onNavigateToGroupRequests={() => setGroupsSubScreen({ type: 'requests' })}
            onNavigateToFindGroup={() => setGroupsSubScreen({ type: 'find' })}
            onNavigateToGroupDetails={(groupId) => setGroupsSubScreen({ type: 'dashboard', groupId })}
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
              onEdit={() => {
                // TODO: implement edit screen
                Alert.alert('В розробці', 'Редагування боргу ще не реалізовано');
              }}
              onCreateReturn={(participantId) => 
                setOwesSubScreen({ type: 'createReturn', participantId })
              }
            />
          );
        } else if (owesSubScreen.type === 'returns') {
          return (
            <MyOweReturnsScreen
              onBack={() => setOwesSubScreen({ type: 'list' })}
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
          />
        );
      case "Налаштування":
        return <Text style={[typography.h2, styles.text]}>Налаштування</Text>;
      case "Інше":
        return (
          <View style={styles.otherContainer}>
            <Button
              title="Вийти"
              icon="homeIcon"
              onPress={handleLogout}
              variant="coral"
              padding={16}
            />
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
  {/* Hide TabBar when in GroupDashboard, viewing profile, or when showing Profile */}
  {!showProfile && groupsSubScreen.type !== 'dashboard' && !viewingUserProfile && (
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default MainScreen;