import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderBar } from '../components/HeaderBar';
import { Button } from '../components/Button';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { walletApi, Transaction } from '../services/api/endpoints/wallet';
import Icon from '../components/Icon';

interface WalletScreenProps {
  onBack: () => void;
  onDeposit: () => void;
  onTransfer: () => void;
  onNavigateToUser?: (userId: number) => void;
  onNavigateToOwe?: (oweId: number) => void;
  onNavigateToReturn?: (returnId: number) => void;
}

export const WalletScreen: React.FC<WalletScreenProps> = ({
  onBack,
  onDeposit,
  onTransfer,
  onNavigateToUser,
  onNavigateToOwe,
  onNavigateToReturn,
}) => {
  const [balance, setBalance] = useState<string>('0');
  const [status, setStatus] = useState<string>('active');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWalletData = async () => {
    try {
      const [walletData, transactionsData] = await Promise.all([
        walletApi.getWallet(),
        walletApi.getTransactions(),
      ]);

      setBalance(walletData.balance || '0');
      setStatus(walletData.status || 'active');
      setTransactions(transactionsData || []);
    } catch (error: any) {
      console.error('Error loading wallet data:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити дані гаманця');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWalletData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadWalletData();
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return '⬇';
      case 'transfer':
      case 'debt_return_transfer':
        return '➡';
      case 'payment':
      case 'debt_return_hold':
        return '⬆';
      case 'refund':
      case 'debt_return_release':
        return '↩';
      default:
        return '•';
    }
  };

  const getTransactionColor = (type: string, amount: string) => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0) return colors.green;
    if (numAmount < 0) return colors.coral;
    return colors.text;
  };

  const getTransactionTitle = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Поповнення';
      case 'transfer':
        return 'Переказ';
      case 'payment':
        return 'Оплата боргу';
      case 'refund':
        return 'Повернення';
      case 'debt_return_hold':
        return 'Заморожено (повернення боргу)';
      case 'debt_return_release':
        return 'Розморожено';
      case 'debt_return_transfer':
        return 'Отримано повернення боргу';
      default:
        return type;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return colors.green;
      case 'suspended':
        return colors.yellow;
      case 'frozen':
        return colors.coral;
      default:
        return colors.text70;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активний';
      case 'suspended':
        return 'Призупинений';
      case 'frozen':
        return 'Заморожений';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <HeaderBar title="Гаманець" onBack={onBack} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <HeaderBar title="Гаманець" onBack={onBack} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Баланс */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={typography.secondary}>Ваш баланс</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusBadgeColor(status) },
              ]}
            >
              <Text style={styles.statusText}>{getStatusText(status)}</Text>
            </View>
          </View>
          <Text style={styles.balanceAmount}>
            {parseFloat(balance).toFixed(2)} ₴
          </Text>
        </View>

        {/* Кнопки дій */}
        <View style={styles.actionsCard}>
          <Button
            title="Поповнити"
            variant="green"
            onPress={onDeposit}
            style={styles.actionButton}
            icon="+"
          />
          <Button
            title="Перевести"
            variant="purple"
            onPress={onTransfer}
            style={styles.actionButton}
            icon="→"
          />
        </View>

        {/* Історія транзакцій */}
        <View style={styles.section}>
          <Text style={[typography.h3, styles.sectionTitle]}>
            Історія транзакцій
          </Text>

          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={typography.secondary}>
                Поки що немає транзакцій
              </Text>
            </View>
          ) : (
            transactions.map((transaction) => (
              <TouchableOpacity
                key={transaction.id}
                style={styles.transactionCard}
                activeOpacity={0.7}
                onPress={() => {
                  // Навігація based на тип транзакції
                  if (transaction.relatedOweReturnId && onNavigateToReturn) {
                    // Пріоритет: debt return transaction -> return details
                    onNavigateToReturn(transaction.relatedOweReturnId);
                  } else if (transaction.relatedUser && onNavigateToUser) {
                    // Інакше: користувач -> профіль
                    onNavigateToUser(transaction.relatedUser.id);
                  }
                }}
              >
                <View style={styles.transactionIcon}>
                  <Text style={styles.transactionIconText}>
                    {getTransactionIcon(transaction.type)}
                  </Text>
                </View>

                <View style={styles.transactionInfo}>
                  <Text style={typography.main}>
                    {getTransactionTitle(transaction.type)}
                  </Text>
                  {transaction.description && (
                    <Text
                      style={[typography.secondary, styles.transactionDescription]}
                      numberOfLines={1}
                    >
                      {transaction.description}
                    </Text>
                  )}
                  <Text style={[typography.secondary, { fontSize: 12 }]}>
                    {new Date(transaction.createdAt).toLocaleDateString('uk-UA', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>

                <View style={styles.transactionAmount}>
                  <Text
                    style={[
                      typography.h3,
                      {
                        color: getTransactionColor(
                          transaction.type,
                          transaction.amount
                        ),
                      },
                    ]}
                  >
                    {parseFloat(transaction.amount) > 0 ? '+' : ''}
                    {parseFloat(transaction.amount).toFixed(2)} ₴
                  </Text>
                  <Text
                    style={[
                      typography.secondary,
                      { fontSize: 11, textAlign: 'right' },
                    ]}
                  >
                    {transaction.status}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: colors.card_surface,
    fontSize: 11,
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: colors.text,
  },
  actionsCard: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.card_surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border_divider,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionIconText: {
    fontSize: 20,
  },
  transactionInfo: {
    flex: 1,
    gap: 2,
  },
  transactionDescription: {
    fontSize: 13,
  },
  transactionAmount: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
});
