import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { Button } from '../components/Button';
import { HeaderBar } from '../components/HeaderBar';
import { TopBar } from '../components/TopBar';
import { FullOwe } from '../types/owes';
import { owesApi } from '../services/api/endpoints/owes';
import { OweCard } from '../components/OweCard';
import { useAuth } from '../context/AuthContext';

interface MyOwesScreenProps {
  onBack: () => void;
  onCreateOwe: () => void;
  onViewOwe: (oweId: number) => void;
  onNavigateToReturns: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToNotifications?: () => void;
  onNavigateToUserProfile?: (userId: number) => void;
}
export const MyOwesScreen: React.FC<MyOwesScreenProps> = ({
  onBack,
  onCreateOwe,
  onViewOwe,
  onNavigateToReturns,
  onNavigateToProfile,
  onNavigateToNotifications,
  onNavigateToUserProfile,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');
  const [sentOwes, setSentOwes] = useState<FullOwe[]>([]);
  const [receivedOwes, setReceivedOwes] = useState<FullOwe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOwes = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError(null);
      
      const response = await owesApi.getMyFullOwes();
      
      // Backend returns { sended: [], received: [] }
      if (response && typeof response === 'object') {
        const data = response as any;
        setSentOwes(data.sended || []);
        setReceivedOwes(data.received || []);
      }
    } catch (err: any) {
      console.error('Error fetching owes:', err);
      setError(err.response?.data?.message || 'Помилка завантаження боргів');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOwes();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOwes(false);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={[typography.h3, styles.emptyText]}>
        {activeTab === 'sent' 
          ? 'У вас поки немає відправлених боргів' 
          : 'У вас поки немає отриманих боргів'}
      </Text>
      {activeTab === 'sent' && (
        <Button
          title="Створити борг"
          onPress={onCreateOwe}
          variant="purple"
          padding={12}
          style={styles.emptyButton}
        />
      )}
    </View>
  );

  const currentOwes = activeTab === 'sent' ? sentOwes : receivedOwes;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Add top bar for avatar, app name */}
      <TopBar 
        userName={user?.username} 
        onAvatarPress={onNavigateToProfile || (() => {})} 
        onNotificationPress={onNavigateToNotifications || (() => {})} 
      />
      <HeaderBar
        title="Мої борги"
        onBack={onBack}
        rightContent={
          <Button
            title="Створити"
            icon="homeIcon"
            onPress={onCreateOwe}
            variant="green"
            padding={8}
          />
        }
      />

      <View style={styles.tabContainer}>
        <Button
          title="Відправлені"
          icon="homeIcon"
          iconSize={18}
          onPress={() => setActiveTab('sent')}
          variant={activeTab === 'sent' ? 'purple' : 'yellow'}
          padding={10}
          style={styles.tabButton}
        />
        <Button
          title="Отримані"
          icon="homeIcon"
          iconSize={18}
          onPress={() => setActiveTab('received')}
          variant={activeTab === 'received' ? 'purple' : 'yellow'}
          padding={10}
          style={styles.tabButton}
        />
      </View>

      <View style={styles.returnLinkContainer}>
        <Button
          title="Запити на повернення"
          icon="homeIcon"
          iconSize={18}
          onPress={onNavigateToReturns}
          variant="green"
          padding={8}
          style={styles.returnLink}
        />
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[typography.main, styles.errorText]}>{error}</Text>
          <Button
            title="Спробувати ще раз"
            onPress={() => fetchOwes()}
            variant="purple"
            padding={12}
          />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
        >
          {currentOwes.length === 0 ? (
            renderEmptyState()
          ) : (
            currentOwes.map((owe) => (
              <OweCard
                key={owe.id}
                owe={owe}
                onPress={() => onViewOwe(owe.id)}
                variant={activeTab}
                onUserPress={onNavigateToUserProfile}
              />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabButton: {
    flex: 1,
  },
  returnLinkContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  returnLink: {
    width: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: colors.coral,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: colors.text70,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    minWidth: 200,
  },
});

export default MyOwesScreen;
