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
import { groupsApi, RequestToGroup, RequestFromGroup, RequestStatus } from '../services/api/endpoints/groups';
import { Icon } from '../components/Icon';
import colors from '../theme/colors';
import typography from '../theme/typography';

interface GroupRequestsManagementScreenProps {
  groupId: number;
  onBack: () => void;
}

type TabType = 'received' | 'sent';

const GroupRequestsManagementScreen: React.FC<GroupRequestsManagementScreenProps> = ({
  groupId,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('received');
  const [receivedRequests, setReceivedRequests] = useState<RequestToGroup[]>([]);
  const [sentRequests, setSentRequests] = useState<RequestFromGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, [groupId, activeTab]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      if (activeTab === 'received') {
        const data = await groupsApi.getRequestsToGroup(groupId);
        // ФІКС: Показувати тільки Pending запити
        const pendingRequests = data.filter(r => r.requestStatus === RequestStatus.Opened);
        setReceivedRequests(pendingRequests);
      } else {
        const data = await groupsApi.getRequestsFromGroup(groupId);
        // ФІКС: Показувати тільки Pending запити
        const pendingRequests = data.filter(r => r.requestStatus === RequestStatus.Opened);
        setSentRequests(pendingRequests);
      }
    } catch (error) {
      console.error('Failed to load requests:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити запити');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: number) => {
    try {
      await groupsApi.acceptRequestToGroup(requestId);
      // Одразу видаляємо з UI
      setReceivedRequests((prev) => prev.filter((r) => r.id !== requestId));
      Alert.alert('Успішно', 'Запит прийнято');
      // Перезавантажуємо для актуалізації
      await loadRequests();
    } catch (error) {
      console.error('Failed to accept request:', error);
      Alert.alert('Помилка', 'Не вдалося прийняти запит');
    }
  };

  const handleDecline = async (requestId: number) => {
    try {
      await groupsApi.declineRequestToGroup(requestId);
      // Одразу видаляємо з UI
      setReceivedRequests((prev) => prev.filter((r) => r.id !== requestId));
      Alert.alert('Успішно', 'Запит відхилено');
      // Перезавантажуємо для актуалізації
      await loadRequests();
    } catch (error) {
      console.error('Failed to decline request:', error);
      Alert.alert('Помилка', 'Не вдалося відхилити запит');
    }
  };

  const handleCancelSent = async (requestId: number) => {
    try {
      await groupsApi.cancelRequestFromGroup(requestId);
      // Одразу видаляємо з UI
      setSentRequests((prev) => prev.filter((r) => r.id !== requestId));
      Alert.alert('Успішно', 'Запит скасовано');
      // Перезавантажуємо для актуалізації
      await loadRequests();
    } catch (error) {
      console.error('Failed to cancel request:', error);
      Alert.alert('Помилка', 'Не вдалося скасувати запит');
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
              await Promise.all(receivedRequests.map((r) => groupsApi.acceptRequestToGroup(r.id)));
              setReceivedRequests([]);
              Alert.alert('Успішно', 'Всі запити прийнято');
              // Перезавантажуємо для актуалізації
              await loadRequests();
            } catch (error) {
              console.error('Failed to accept all:', error);
              Alert.alert('Помилка', 'Не вдалося прийняти запити');
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
              await Promise.all(receivedRequests.map((r) => groupsApi.declineRequestToGroup(r.id)));
              setReceivedRequests([]);
              Alert.alert('Успішно', 'Всі запити відхилено');
              // Перезавантажуємо для актуалізації
              await loadRequests();
            } catch (error) {
              console.error('Failed to decline all:', error);
              Alert.alert('Помилка', 'Не вдалося відхилити запити');
            }
          },
        },
      ]
    );
  };

  const handleCancelAllSent = async () => {
    Alert.alert(
      'Скасувати всі',
      'Ви впевнені, що хочете скасувати всі відправлені запити?',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Скасувати всі',
          style: 'destructive',
          onPress: async () => {
            try {
              await Promise.all(sentRequests.map((r) => groupsApi.cancelRequestFromGroup(r.id)));
              setSentRequests([]);
              Alert.alert('Успішно', 'Всі запити скасовано');
              // Перезавантажуємо для актуалізації
              await loadRequests();
            } catch (error) {
              console.error('Failed to cancel all:', error);
              Alert.alert('Помилка', 'Не вдалося скасувати запити');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrowLeft" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[typography.h3, styles.headerTitle]}>Групові запити</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'received' && styles.activeTab]}
          onPress={() => setActiveTab('received')}
        >
          <Text style={[styles.tabText, activeTab === 'received' && styles.activeTabText]}>
            Отримані
          </Text>
          {receivedRequests.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{receivedRequests.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sent' && styles.activeTab]}
          onPress={() => setActiveTab('sent')}
        >
          <Text style={[styles.tabText, activeTab === 'sent' && styles.activeTabText]}>
            Відправлені
          </Text>
          {sentRequests.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{sentRequests.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Bulk Actions */}
      {activeTab === 'received' && receivedRequests.length > 0 && (
        <View style={styles.bulkActions}>
          <TouchableOpacity style={styles.acceptAllButton} onPress={handleAcceptAll}>
            <Icon name="check" size={18} color={colors.text} />
            <Text style={styles.acceptAllText}>Прийняти всі</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.declineAllButton} onPress={handleDeclineAll}>
            <Icon name="close" size={18} color={colors.text} />
            <Text style={styles.declineAllText}>Відхилити всі</Text>
          </TouchableOpacity>
        </View>
      )}
      {activeTab === 'sent' && sentRequests.length > 0 && (
        <View style={styles.bulkActions}>
          <TouchableOpacity style={styles.cancelAllButton} onPress={handleCancelAllSent}>
            <Icon name="close" size={18} color={colors.text} />
            <Text style={styles.cancelAllText}>Скасувати всі</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Requests List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.emptyState}>
            <Text style={typography.body}>Завантаження...</Text>
          </View>
        ) : activeTab === 'received' ? (
          // Received requests
          receivedRequests.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="friendsIcon" size={48} color={colors.text70} />
              <Text style={[typography.body, styles.emptyText]}>
                Немає отриманих запитів
              </Text>
            </View>
          ) : (
            <View style={styles.requestsList}>
              {receivedRequests.map((request) => {
                if (!request.sender) return null;
                
                return (
                  <View key={request.id} style={styles.requestCard}>
                    <View style={styles.requestInfo}>
                      <View style={styles.avatar}>
                        <Icon name="homeIcon" size={32} color={colors.text70} />
                      </View>
                      <View style={styles.userInfo}>
                        <Text style={typography.bodyBold}>
                          {request.sender.firstName}
                        </Text>
                        <Text style={[typography.caption, styles.userTag]}>
                          @{request.sender.username}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.requestActions}>
                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => handleAccept(request.id)}
                      >
                        <Icon name="check" size={20} color={colors.text} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.declineButton}
                        onPress={() => handleDecline(request.id)}
                      >
                        <Icon name="close" size={20} color={colors.text} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )
        ) : (
          // Sent requests
          sentRequests.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="friendsIcon" size={48} color={colors.text70} />
              <Text style={[typography.body, styles.emptyText]}>
                Немає відправлених запитів
              </Text>
            </View>
          ) : (
            <View style={styles.requestsList}>
              {sentRequests.map((request) => {
                if (!request.receiver) return null;
                
                return (
                  <View key={request.id} style={styles.requestCard}>
                    <View style={styles.requestInfo}>
                      <View style={styles.avatar}>
                        <Icon name="homeIcon" size={32} color={colors.text70} />
                      </View>
                      <View style={styles.userInfo}>
                        <Text style={typography.bodyBold}>
                          {request.receiver.firstName}
                        </Text>
                        <Text style={[typography.caption, styles.userTag]}>
                          @{request.receiver.username}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.requestActions}>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => handleCancelSent(request.id)}
                      >
                        <Icon name="close" size={20} color={colors.text} />
                        <Text style={styles.cancelButtonText}>Скасувати</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border_divider,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.card_surface,
    gap: 8,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.body,
    color: colors.text70,
  },
  activeTabText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  badge: {
    backgroundColor: colors.coral,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  bulkActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  acceptAllButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.green,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  acceptAllText: {
    ...typography.button,
    fontSize: 14,
    color: colors.text,
  },
  declineAllButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.coral,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  declineAllText: {
    ...typography.button,
    fontSize: 14,
    color: colors.text,
  },
  cancelAllButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.coral,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  cancelAllText: {
    ...typography.button,
    fontSize: 14,
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
    paddingHorizontal: 20,
  },
  emptyText: {
    color: colors.text70,
  },
  requestsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card_surface,
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userTag: {
    color: colors.text70,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.coral,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.coral,
    gap: 6,
  },
  cancelButtonText: {
    ...typography.button,
    fontSize: 14,
    color: colors.text,
  },
});

export default GroupRequestsManagementScreen;
