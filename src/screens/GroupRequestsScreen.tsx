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
import { groupsApi, RequestToGroup, RequestFromGroup } from '../services/api/endpoints/groups';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';

interface GroupRequestsScreenProps {
  onBack?: () => void;
}

const GroupRequestsScreen: React.FC<GroupRequestsScreenProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [receivedRequests, setReceivedRequests] = useState<RequestFromGroup[]>([]);
  const [sentRequests, setSentRequests] = useState<RequestToGroup[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const [received, sent] = await Promise.all([
        groupsApi.getMyRequestsFromGroups(), // запрошення від груп
        groupsApi.getMyRequestsToGroups(), // мої запити до груп
      ]);
      setReceivedRequests(received);
      setSentRequests(sent);
    } catch (error: any) {
      console.error('Failed to load requests:', error);
      // Мок дані
      setReceivedRequests([]);
      setSentRequests([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const handleAccept = async (requestId: number) => {
    try {
      await groupsApi.acceptRequestFromGroup(requestId);
      await loadRequests();
      Alert.alert('Успіх', 'Запрошення прийнято!');
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося прийняти запрошення');
    }
  };

  const handleDecline = async (requestId: number) => {
    try {
      await groupsApi.declineRequestFromGroup(requestId);
      await loadRequests();
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося відхилити запрошення');
    }
  };

  const handleCancel = async (requestId: number) => {
    try {
      await groupsApi.cancelRequestToGroup(requestId);
      await loadRequests();
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося скасувати запит');
    }
  };

  const handleAcceptAll = async () => {
    try {
      await groupsApi.acceptAllRequestsFromGroups();
      await loadRequests();
      Alert.alert('Успіх', 'Всі запрошення прийнято!');
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося прийняти всі запрошення');
    }
  };

  const handleDeclineAll = async () => {
    try {
      await groupsApi.declineAllRequestsFromGroups();
      await loadRequests();
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося відхилити всі запрошення');
    }
  };

  const handleCancelAll = async () => {
    try {
      await groupsApi.cancelAllRequestsToGroups();
      await loadRequests();
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося скасувати всі запити');
    }
  };

  const currentRequests = activeTab === 'received' ? receivedRequests : sentRequests;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Запити в групу</Text>
        <View style={{ width: 40 }} />
      </View>

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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {(currentRequests || []).length > 0 ? (
          currentRequests.map((request) => {
            const displayName = activeTab === 'received' 
              ? ('sender' in request && 'group' in request.sender ? request.sender.group?.name || 'Група' : 'Група')
              : ('group' in request ? request.group?.name || 'Група' : 'Група');
            
            return (
              <View
                key={request.id}
                style={[
                  styles.requestCard,
                  activeTab === 'received' ? styles.receivedCard : styles.sentCard,
                ]}
              >
                <View style={styles.requestHeader}>
                  <View style={styles.requestAvatar}>
                    <Text style={styles.requestAvatarText}>
                      {displayName[0].toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.requestName}>{displayName}</Text>
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
                    onPress={() => handleCancel(request.id)}
                  />
                )}
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>
              {activeTab === 'received' ? 'Немає запрошень' : 'Немає відправлених запитів'}
            </Text>
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
  backIcon: { fontSize: 28, color: colors.text },
  headerTitle: { ...typography.h2, color: colors.text },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card_surface,
    margin: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: colors.green15 },
  tabText: { ...typography.main, color: colors.text70 },
  tabTextActive: { ...typography.main, fontWeight: '600', color: colors.text },
  bulkActions: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 16 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
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
  receivedCard: { borderColor: colors.green },
  sentCard: { borderColor: colors.yellow },
  requestHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  requestAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestAvatarText: { ...typography.h3, color: colors.text },
  requestName: { ...typography.main, fontWeight: '600', color: colors.text },
  requestActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 64, marginBottom: 12 },
  emptyText: { ...typography.h3, color: colors.text, textAlign: 'center' },
});

export default GroupRequestsScreen;
