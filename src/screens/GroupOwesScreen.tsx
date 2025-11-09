import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { Button } from '../components/Button';
import { HeaderBar } from '../components/HeaderBar';
import { FullOwe } from '../types/owes';
import { owesApi } from '../services/api/endpoints/owes';
import { OweCard } from '../components/OweCard';

interface GroupOwesScreenProps {
  groupId: number;
  onBack: () => void;
  onViewOwe: (oweId: number) => void;
}

export const GroupOwesScreen: React.FC<GroupOwesScreenProps> = ({
  groupId,
  onBack,
  onViewOwe,
}) => {
  const [owes, setOwes] = useState<FullOwe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroupOwes = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError(null);
      
      const response = await owesApi.getFullOwesByGroup(groupId);
      setOwes(response || []);
    } catch (err: any) {
      console.error('Error fetching group owes:', err);
      setError(err.response?.data?.message || 'Помилка завантаження боргів групи');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGroupOwes();
  }, [groupId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchGroupOwes(false);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={[typography.h3, styles.emptyText]}>
        У цій групі поки немає боргів
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <HeaderBar title="Борги групи" onBack={onBack} />

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[typography.main, styles.errorText]}>{error}</Text>
          <Button
            title="Спробувати ще раз"
            onPress={() => fetchGroupOwes()}
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
          {owes.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              <Text style={[typography.main, styles.countText]}>
                Знайдено боргів: {owes.length}
              </Text>
              {owes.map((owe) => (
                <OweCard
                  key={owe.id}
                  owe={owe}
                  onPress={() => onViewOwe(owe.id)}
                  variant="sent" // In group context, show as sent
                />
              ))}
            </>
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
  countText: {
    color: colors.text70,
    marginBottom: 12,
  },
});

export default GroupOwesScreen;
