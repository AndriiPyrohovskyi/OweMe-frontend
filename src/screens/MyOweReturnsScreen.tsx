import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { Button } from '../components/Button';
import { HeaderBar } from '../components/HeaderBar';
import { OweReturn } from '../types/owes';
import { owesApi } from '../services/api/endpoints/owes';
import { OweReturnCard } from '../components/OweReturnCard';
import { useAuth } from '../context/AuthContext';

interface MyOweReturnsScreenProps {
  onBack: () => void;
  onNavigateToOwe?: (oweId: number) => void;
}

export const MyOweReturnsScreen: React.FC<MyOweReturnsScreenProps> = ({ onBack, onNavigateToOwe }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');
  const [returns, setReturns] = useState<OweReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReturns = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError(null);
      
      const response = await owesApi.getMyOweReturns();
      
      // Backend returns { out: [], in: [] }
      if (response && typeof response === 'object') {
        const data = response as any;
        // Filter by active tab
        if (activeTab === 'sent') {
          setReturns(data.out || []);
        } else {
          setReturns(data.in || []);
        }
      }
    } catch (err: any) {
      console.error('Error fetching returns:', err);
      setError(err.response?.data?.message || 'Помилка завантаження повернень');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [activeTab]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReturns(false);
  };

  const handleAccept = async (returnId: number) => {
    try {
      setActionLoading(true);
      await owesApi.acceptOweReturn(returnId);
      Alert.alert('Успіх', 'Повернення прийнято');
      fetchReturns();
    } catch (err: any) {
      Alert.alert('Помилка', err.response?.data?.message || 'Не вдалося прийняти повернення');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async (returnId: number) => {
    try {
      setActionLoading(true);
      await owesApi.declineOweReturn(returnId);
      Alert.alert('Успіх', 'Повернення відхилено');
      fetchReturns();
    } catch (err: any) {
      Alert.alert('Помилка', err.response?.data?.message || 'Не вдалося відхилити повернення');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (returnId: number) => {
    Alert.alert(
      'Підтвердження',
      'Ви впевнені, що хочете скасувати це повернення?',
      [
        { text: 'Ні', style: 'cancel' },
        {
          text: 'Так',
          onPress: async () => {
            try {
              setActionLoading(true);
              await owesApi.cancelOweReturn(returnId);
              Alert.alert('Успіх', 'Повернення скасовано');
              fetchReturns();
            } catch (err: any) {
              Alert.alert('Помилка', err.response?.data?.message || 'Не вдалося скасувати повернення');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={[typography.h3, styles.emptyText]}>
        {activeTab === 'sent' 
          ? 'У вас поки немає відправлених повернень' 
          : 'У вас поки немає отриманих повернень'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <HeaderBar title="Повернення боргів" onBack={onBack} />

      <View style={styles.tabContainer}>
        <Button
          title="Відправлені"
          onPress={() => setActiveTab('sent')}
          variant={activeTab === 'sent' ? 'purple' : 'yellow'}
          padding={10}
          style={styles.tabButton}
        />
        <Button
          title="Отримані"
          onPress={() => setActiveTab('received')}
          variant={activeTab === 'received' ? 'purple' : 'yellow'}
          padding={10}
          style={styles.tabButton}
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
            onPress={() => fetchReturns()}
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
          {returns.length === 0 ? (
            renderEmptyState()
          ) : (
            returns.map((returnItem) => {
              const oweId = returnItem.participant?.oweItem?.fullOwe?.id;
              return (
                <OweReturnCard
                  key={returnItem.id}
                  oweReturn={returnItem}
                  variant={activeTab}
                  showActions={!actionLoading}
                  onPress={oweId && onNavigateToOwe ? () => onNavigateToOwe(oweId) : undefined}
                  onAccept={activeTab === 'received' ? () => handleAccept(returnItem.id) : undefined}
                  onDecline={activeTab === 'received' ? () => handleDecline(returnItem.id) : undefined}
                  onCancel={activeTab === 'sent' ? () => handleCancel(returnItem.id) : undefined}
                />
              );
            })
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
  },
});

export default MyOweReturnsScreen;
