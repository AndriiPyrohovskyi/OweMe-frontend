import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { FullOwe } from '../types/owes';
import { StatusBadge } from './StatusBadge';
import Icon from './Icon';

interface OweCardProps {
  owe: FullOwe;
  onPress: () => void;
  variant: 'sent' | 'received';
  onUserPress?: (userId: number) => void;
}

export const OweCard: React.FC<OweCardProps> = ({ owe, onPress, variant, onUserPress }) => {
  // Calculate total sum and overall status
  const calculateTotals = () => {
    let totalSum = 0;
    let allAccepted = true;
    let anyDeclined = false;
    let anyCanceled = false;
    let allReturned = true;
    let someReturned = false;

    owe.oweItems.forEach(item => {
      item.oweParticipants.forEach(participant => {
        totalSum += Number(participant.sum);
        
        if (participant.status !== 'Accepted') allAccepted = false;
        if (participant.status === 'Declined') anyDeclined = true;
        if (participant.status === 'Canceled') anyCanceled = true;
        if (participant.status !== 'Returned') allReturned = false;
        if (participant.status === 'Returned' || participant.status === 'PartlyReturned') someReturned = true;
      });
    });

    let overallStatus = 'Opened';
    if (allReturned && someReturned) overallStatus = 'Returned';
    else if (someReturned) overallStatus = 'PartlyReturned';
    else if (anyCanceled) overallStatus = 'Canceled';
    else if (anyDeclined) overallStatus = 'Declined';
    else if (allAccepted) overallStatus = 'Accepted';

    return { totalSum, overallStatus };
  };

  const { totalSum, overallStatus } = calculateTotals();
  const user = variant === 'received' ? owe.fromUser : null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {owe.image ? (
            <Image source={{ uri: owe.image }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Icon name="homeIcon" size={20} />
            </View>
          )}
          <View style={styles.titleContainer}>
            <Text style={[typography.h3, styles.title]} numberOfLines={1}>
              {owe.name}
            </Text>
            {variant === 'received' && user && (
              <TouchableOpacity 
                onPress={() => onUserPress?.(user.id)}
                disabled={!onUserPress}
              >
                <Text style={[typography.secondary, styles.username]}>
                  від @{user.username}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <StatusBadge status={overallStatus as any} type="owe" />
      </View>
      
      {owe.description && (
        <Text style={[typography.secondary, styles.description]} numberOfLines={2}>
          {owe.description}
        </Text>
      )}
      
      <View style={styles.footer}>
        <View style={styles.info}>
          <Text style={[typography.secondary, styles.label]}>Пунктів: </Text>
          <Text style={[typography.main, styles.value]}>{owe.oweItems.length}</Text>
        </View>
        <View style={styles.totalSum}>
          <Text style={[typography.numbers, { color: colors.coral }]}>
            {totalSum.toFixed(2)} ₴
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card_surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border_divider,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
  },
  imagePlaceholder: {
    backgroundColor: colors.primary15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: colors.text,
    marginBottom: 2,
  },
  username: {
    color: colors.text70,
  },
  description: {
    color: colors.text70,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border_divider,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    color: colors.text70,
  },
  value: {
    color: colors.text,
    fontWeight: '600',
  },
  totalSum: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
