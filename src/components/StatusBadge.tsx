import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { OweStatus, ReturnStatus } from '../types/owes';

interface StatusBadgeProps {
  status: OweStatus | ReturnStatus;
  type?: 'owe' | 'return';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'owe' }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'Opened':
        return colors.yellow;
      case 'Accepted':
        return colors.green;
      case 'Declined':
      case 'Canceled':
        return colors.coral;
      case 'Returned':
        return colors.green;
      case 'PartlyReturned':
        return colors.primary;
      default:
        return colors.border_divider;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'Opened':
        return 'Відкрито';
      case 'Accepted':
        return 'Прийнято';
      case 'Declined':
        return 'Відхилено';
      case 'Canceled':
        return 'Скасовано';
      case 'Returned':
        return 'Повернено';
      case 'PartlyReturned':
        return 'Частково';
      default:
        return status;
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getStatusColor() + '30', borderColor: getStatusColor() }]}>
      <Text style={[typography.secondary2, styles.text, { color: getStatusColor() }]}>
        {getStatusText()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
  },
});
