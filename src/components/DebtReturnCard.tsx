import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { OweReturn, ReturnStatus } from '../services/api/endpoints/owes';
import { Button } from './Button';
import colors from '../theme/colors';
import typography from '../theme/typography';

interface DebtReturnCardProps {
  oweReturn: OweReturn;
  isOwner: boolean; // чи є користувач власником боргу
  onAccept?: () => void;
  onDecline?: () => void;
  onCancel?: () => void;
  onRefresh?: () => void;
}

export const DebtReturnCard: React.FC<DebtReturnCardProps> = ({
  oweReturn,
  isOwner,
  onAccept,
  onDecline,
  onCancel,
  onRefresh,
}) => {
  const getStatusColor = (status: ReturnStatus): string => {
    switch (status) {
      case ReturnStatus.Opened:
        return colors.yellow;
      case ReturnStatus.Accepted:
        return colors.green;
      case ReturnStatus.Declined:
        return colors.coral;
      case ReturnStatus.Canceled:
        return colors.text70;
      default:
        return colors.text;
    }
  };

  const getStatusText = (status: ReturnStatus): string => {
    switch (status) {
      case ReturnStatus.Opened:
        return 'Очікує рішення';
      case ReturnStatus.Accepted:
        return 'Прийнято';
      case ReturnStatus.Declined:
        return 'Відхилено';
      case ReturnStatus.Canceled:
        return 'Скасовано';
      default:
        return status;
    }
  };

  const getStatusDescription = (status: ReturnStatus): string => {
    if (!isOwner) {
      switch (status) {
        case ReturnStatus.Opened:
          return 'Кошти заморожені до рішення власника';
        case ReturnStatus.Accepted:
          return 'Кошти переведені власнику боргу';
        case ReturnStatus.Declined:
          return 'Кошти повернені на ваш рахунок';
        case ReturnStatus.Canceled:
          return 'Кошти повернені на ваш рахунок';
        default:
          return '';
      }
    } else {
      switch (status) {
        case ReturnStatus.Opened:
          return 'Очікує вашого рішення';
        case ReturnStatus.Accepted:
          return 'Ви отримали кошти';
        case ReturnStatus.Declined:
          return 'Ви відхилили повернення';
        case ReturnStatus.Canceled:
          return 'Боржник скасував повернення';
        default:
          return '';
      }
    }
  };

  const handleAccept = () => {
    Alert.alert(
      'Прийняти повернення?',
      `Ви отримаєте ${oweReturn.returned} ₴ на свій рахунок.`,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Прийняти',
          style: 'default',
          onPress: onAccept,
        },
      ]
    );
  };

  const handleDecline = () => {
    Alert.alert(
      'Відхилити повернення?',
      'Кошти будуть повернені боржнику.',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Відхилити',
          style: 'destructive',
          onPress: onDecline,
        },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Скасувати повернення?',
      'Ваші кошти будуть розморожені.',
      [
        { text: 'Ні', style: 'cancel' },
        {
          text: 'Так, скасувати',
          style: 'destructive',
          onPress: onCancel,
        },
      ]
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={typography.h3}>Повернення #{oweReturn.id}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(oweReturn.status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusText(oweReturn.status)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.amountSection}>
        <Text style={[typography.h2, styles.amount]}>{oweReturn.returned} ₴</Text>
        <Text style={[typography.secondary, { color: getStatusColor(oweReturn.status) }]}>
          {getStatusDescription(oweReturn.status)}
        </Text>
      </View>

      <View style={styles.info}>
        <Text style={typography.secondary}>
          Створено: {new Date(oweReturn.createdAt).toLocaleDateString('uk-UA', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
        {oweReturn.holdTransactionId && (
          <Text style={[typography.secondary, { fontSize: 12, color: colors.text70 }]}>
            ID транзакції: {oweReturn.holdTransactionId}
          </Text>
        )}
      </View>

      {oweReturn.status === ReturnStatus.Opened && (
        <View style={styles.actions}>
          {isOwner ? (
            <>
              <Button
                title="✓ Прийняти"
                variant="green"
                onPress={handleAccept}
                style={styles.button}
              />
              <Button
                title="✕ Відхилити"
                variant="coral"
                onPress={handleDecline}
                style={styles.button}
              />
            </>
          ) : (
            <Button
              title="Скасувати"
              variant="yellow"
              onPress={handleCancel}
              style={styles.button}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card_surface,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: colors.card_surface,
    fontSize: 12,
    fontWeight: '600',
  },
  amountSection: {
    marginVertical: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border_divider,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  info: {
    marginTop: 8,
    gap: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  button: {
    flex: 1,
  },
});
