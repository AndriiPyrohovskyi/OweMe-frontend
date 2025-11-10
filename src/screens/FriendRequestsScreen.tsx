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
import { friendsApi, FriendRequest } from '../services/api/endpoints/friends';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { Button } from '../components/Button';
import Icon from '../components/Icon';

interface FriendRequestsScreenProps {
  onBack?: () => void;
  onNavigateToProfile?: (userId: number) => void;
}

const FriendRequestsScreen: React.FC<FriendRequestsScreenProps> = ({ 
  onBack,
  onNavigateToProfile 
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      if (!user?.id) return;
      const [received, sent] = await Promise.all([
        friendsApi.getReceivedRequests(user.id),
        friendsApi.getSentRequests(user.id),
      ]);
      // Фільтруємо лише відкриті запити
      setReceivedRequests(received.filter(req => req.requestStatus === 'Opened'));
      setSentRequests(sent.filter(req => req.requestStatus === 'Opened'));
    } catch (error: any) {
      console.error('Failed to load requests:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити запити');
      setReceivedRequests([]);
      setSentRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const handleAccept = async (requestId: number) => {
    try {
      await friendsApi.acceptRequest(requestId);
      await loadRequests();
      Alert.alert('Успіх', 'Запит прийнято!');
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося прийняти запит');
    }
  };

  const handleDecline = async (requestId: number) => {
    try {
      await friendsApi.declineRequest(requestId);
      await loadRequests();
      Alert.alert('Успіх', 'Запит відхилено');
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося відхилити запит');
    }
  };

  const handleAcceptAll = async () => {
    Alert.alert(
      'Прийняти всі',
      'Ви впевнені, що хочете прийняти всі запити?',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Прийняти',
          onPress: async () => {
            try {
              if (!user?.id) return;
              await friendsApi.acceptAllRequests(user.id);
              await loadRequests();
              Alert.alert('Успіх', 'Всі запити прийнято!');
            } catch (error) {
              Alert.alert('Помилка', 'Не вдалося прийняти всі запити');
            }
          },
        },
      ]
    );
  };

  const handleDeclineAll = async () => {
    Alert.alert(
      'Відхилити всі',
      'Ви впевнені, що хочете відхилити всі запити?',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Відхилити',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!user?.id) return;
              await friendsApi.declineAllRequests(user.id);
              await loadRequests();
              Alert.alert('Успіх', 'Всі запити відхилено');
            } catch (error) {
              Alert.alert('Помилка', 'Не вдалося відхилити всі запити');
            }
          },
        },
      ]
    );
  };

  const handleCancelAll = async () => {
    Alert.alert(
      'Скасувати всі',
      'Ви впевнені, що хочете скасувати всі відправлені запити?',
      [
        { text: 'Ні', style: 'cancel' },
        {
          text: 'Так',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!user?.id) return;
              await friendsApi.cancelAllRequests(user.id);
              await loadRequests();
              Alert.alert('Успіх', 'Всі запити скасовано');
            } catch (error) {
              Alert.alert('Помилка', 'Не вдалося скасувати запити');
            }
          },
        },
      ]
    );
  };

  const handleCancelRequest = async (requestId: number) => {
    try {
      await friendsApi.cancelRequest(requestId);
      await loadRequests();
      Alert.alert('Успіх', 'Запит скасовано');
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося скасувати запит');
    }
  };

  const currentRequests = activeTab === 'received' ? receivedRequests : sentRequests;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="homeIcon" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Запити в друзі</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'received' && styles.tabActive]}
          onPress={() => setActiveTab('received')}
        >
          <Text style={[styles.tabText, activeTab === 'received' && styles.tabTextActive]}>
            Отримані
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sent' && styles.tabActive]}
          onPress={() => setActiveTab('sent')}
        >
          <Text style={[styles.tabText, activeTab === 'sent' && styles.tabTextActive]}>
            Відправлені
          </Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      {activeTab === 'received' && receivedRequests.length > 0 && (
        <View style={styles.bulkActions}>
          <Button 
            title="Прийняти всі" 
            icon="homeIcon" 
            variant="green" 
            padding={12} 
            onPress={handleAcceptAll}
            style={{ flex: 1 }}
          />
          <Button 
            title="Відхилити всі" 
            icon="homeIcon" 
            variant="coral" 
            padding={12} 
            onPress={handleDeclineAll}
            style={{ flex: 1 }}
          />
        </View>
      )}

      {activeTab === 'sent' && sentRequests.length > 0 && (
        <View style={styles.bulkActions}>
          <Button 
            title="Скасувати всі" 
            icon="homeIcon" 
            variant="yellow" 
            padding={12} 
            onPress={handleCancelAll}
            style={{ flex: 1 }}
          />
        </View>
      )}

      {/* Requests List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {currentRequests.length > 0 ? (
          currentRequests.map((request) => {
            const otherUser = request.user;
            return (
              <TouchableOpacity
                key={request.id}
                style={[
                  styles.requestCard,
                  activeTab === 'received' ? styles.receivedCard : styles.sentCard,
                ]}
                onPress={() => onNavigateToProfile?.(otherUser.id)}
              >
                <View style={styles.requestHeader}>
                  <View style={styles.requestAvatar}>
                    <Text style={styles.requestAvatarText}>
                      {otherUser.username[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.requestUserInfo}>
                    <Text style={styles.requestName}>{otherUser.username}</Text>
                                        {otherUser.firstName && (
                      <Text style={[typography.body, styles.friendName]}>
                        {otherUser.firstName}
                      </Text>
                    )}
                  </View>
                </View>

                {activeTab === 'received' ? (
                  <View style={styles.requestActions}>
                    <Button
                      title="Прийняти"
                      icon="homeIcon"
                      iconSize={16}
                      variant="green"
                      padding={8}
                      onPress={() => handleAccept(request.id)}
                      style={{ flex: 1 }}
                    />
                    <Button
                      title="Відхилити"
                      icon="homeIcon"
                      iconSize={16}
                      variant="coral"
                      padding={8}
                      onPress={() => handleDecline(request.id)}
                      style={{ flex: 1 }}
                    />
                  </View>
                ) : (
                  <Button
                    title="Скасувати"
                    icon="homeIcon"
                    iconSize={16}
                    variant="yellow"
                    padding={8}
                    onPress={() => handleCancelRequest(request.id)}
                  />
                )}
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Icon name="homeIcon" size={64} color={colors.text70} />
            <Text style={styles.emptyText}>
              {activeTab === 'received'
                ? 'Немає отриманих запитів'
                : 'Немає відправлених запитів'}
            </Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'received'
                ? 'Коли хтось надішле вам запит, він з\'явиться тут'
                : 'Знайдіть друзів та надішліть їм запит'}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card_surface,
    margin: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: colors.green15,
  },
  tabText: {
    ...typography.main,
    color: colors.text70,
  },
  tabTextActive: {
    ...typography.main,
    fontWeight: '600',
    color: colors.text,
  },
  bulkActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  acceptAllButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.green,
    borderRadius: 12,
    paddingVertical: 12,
  },
  acceptAllIcon: {
    fontSize: 18,
  },
  acceptAllText: {
    ...typography.CTA,
    color: colors.text,
  },
  declineAllButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.coral,
    borderRadius: 12,
    paddingVertical: 12,
  },
  declineAllIcon: {
    fontSize: 18,
  },
  declineAllText: {
    ...typography.CTA,
    color: colors.text,
  },
  cancelAllButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.yellow,
    borderRadius: 12,
    paddingVertical: 12,
  },
  cancelAllIcon: {
    fontSize: 18,
  },
  cancelAllText: {
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
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card_surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  receivedCard: {
    borderColor: colors.green,
  },
  sentCard: {
    borderColor: colors.yellow,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  requestAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestAvatarText: {
    ...typography.h3,
    color: colors.text,
  },
  requestUserInfo: {
    flex: 1,
  },
  requestName: {
    ...typography.main,
    fontWeight: '600',
    color: colors.text,
  },
  requestFullName: {
    ...typography.secondary,
    color: colors.text70,
    marginTop: 2,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
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

export default FriendRequestsScreen;
