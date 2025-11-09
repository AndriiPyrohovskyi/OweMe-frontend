import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import typography from '../theme/typography';
import Icon from './Icon';

interface HeaderBarProps {
  title: string;
  onBack: () => void;
  rightContent?: React.ReactNode;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ title, onBack, rightContent }) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Icon name="homeIcon" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={[typography.h2, styles.title]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.rightContent}>
        {rightContent}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 15,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border_divider,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  title: {
    flex: 1,
    color: colors.text,
  },
  rightContent: {
    marginLeft: 12,
  },
});
