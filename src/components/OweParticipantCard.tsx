import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { OweParticipant } from '../types/owes';
import { StatusBadge } from './StatusBadge';
import Icon from './Icon';

interface OweParticipantCardProps {
  participant: OweParticipant;
  onPress?: () => void;
  showActions?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onCancel?: () => void;
  variant: 'sent' | 'received';
}

export const OweParticipantCard: React.FC<OweParticipantCardProps> = ({
  participant,
  onPress,
  showActions = false,
  onAccept,
  onDecline,
  onCancel,
  variant,
}) => {
  const calculateReturned = () => {
    if (!participant.oweReturns || participant.oweReturns.length === 0) return 0;
    
    return participant.oweReturns
      .filter(ret => ret.status === 'Accepted')
      .reduce((sum, ret) => sum + Number(ret.returned), 0);
  };

  const returned = calculateReturned();
  const remaining = Number(participant.sum) - returned;

  const getRecipientName = () => {
    if (participant.toUser) {
      return `${participant.toUser.firstName} ${participant.toUser.lastName}`;
    }
    if (participant.group) {
      return participant.group.name;
    }
    return 'Невідомо';
  };

  const getRecipientSubtext = () => {
    if (participant.toUser) {
      return `@${participant.toUser.username}`;
    }
    if (participant.group) {
      return 'Група';
    }
    return '';
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[typography.h3, styles.title]} numberOfLines={1}>
            {getRecipientName()}
          </Text>
          <Text style={[typography.secondary, styles.subtitle]}>
            {getRecipientSubtext()}
          </Text>
        </View>
        <StatusBadge status={participant.status} type="owe" />
      </View>

      <View style={styles.amounts}>
        <View style={styles.amountRow}>
          <Text style={[typography.secondary, styles.label]}>Сума боргу:</Text>
          <Text style={[typography.numbers, { color: colors.coral }]}>
            {Number(participant.sum).toFixed(2)} ₴
          </Text>
        </View>
        {returned > 0 && (
          <>
            <View style={styles.amountRow}>
              <Text style={[typography.secondary, styles.label]}>Повернено:</Text>
              <Text style={[typography.numbers, { color: colors.green }]}>
                {returned.toFixed(2)} ₴
              </Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={[typography.secondary, styles.label]}>Залишок:</Text>
              <Text style={[typography.numbers, { color: colors.text }]}>
                {remaining.toFixed(2)} ₴
              </Text>
            </View>
          </>
        )}
      </View>

      {showActions && participant.status === 'Opened' && (
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
  subtitle: {
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
