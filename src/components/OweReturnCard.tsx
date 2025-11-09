import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { OweReturn } from '../types/owes';
import { StatusBadge } from './StatusBadge';

interface OweReturnCardProps {
  oweReturn: OweReturn;
  onPress?: () => void;
  showActions?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onCancel?: () => void;
  variant: 'sent' | 'received';
}

export const OweReturnCard: React.FC<OweReturnCardProps> = ({
  oweReturn,
  onPress,
  showActions = false,
  onAccept,
  onDecline,
  onCancel,
  variant,
}) => {
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[typography.h3, styles.title]}>
            Повернення боргу
          </Text>
          <Text style={[typography.secondary, styles.date]}>
            {new Date(oweReturn.createdAt).toLocaleDateString('uk-UA')}
          </Text>
        </View>
        <StatusBadge status={oweReturn.status} type="return" />
      </View>

      <View style={styles.amounts}>
        <View style={styles.amountRow}>
          <Text style={[typography.secondary, styles.label]}>Сума боргу:</Text>
          <Text style={[typography.numbers, { color: colors.coral }]}>
            {Number(oweReturn.participant.sum).toFixed(2)} ₴
          </Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={[typography.secondary, styles.label]}>Повертається:</Text>
          <Text style={[typography.numbers, { color: colors.green }]}>
            {Number(oweReturn.returned).toFixed(2)} ₴
          </Text>
        </View>
      </View>

      {showActions && oweReturn.status === 'Opened' && (
        <View style={styles.actions}>
          {variant === 'received' && onAccept && onDecline && (
            <>
              <TouchableOpacity 
                style={[styles.actionButton, styles.acceptButton]}
                onPress={onAccept}
              >
                <Text style={[typography.CTA, styles.actionText]}>Прийняти</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.declineButton]}
                onPress={onDecline}
              >
                <Text style={[typography.CTA, styles.actionText]}>Відхилити</Text>
              </TouchableOpacity>
            </>
          )}
          {variant === 'sent' && onCancel && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={[typography.CTA, styles.actionText]}>Скасувати</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card_surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border_divider,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    color: colors.text,
    marginBottom: 2,
  },
  date: {
    color: colors.text70,
  },
  amounts: {
    gap: 6,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: colors.text70,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border_divider,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: colors.green15,
    borderColor: colors.green,
  },
  declineButton: {
    backgroundColor: colors.coral15,
    borderColor: colors.coral,
  },
  cancelButton: {
    backgroundColor: colors.yellow15,
    borderColor: colors.yellow,
  },
  actionText: {
    color: colors.text,
  },
});
