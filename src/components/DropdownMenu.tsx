import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Icon } from './Icon';
import colors from '../theme/colors';
import typography from '../theme/typography';

export interface DropdownMenuItem {
  label: string;
  value: string;
  icon?: string;
}

interface DropdownMenuProps {
  visible: boolean;
  onClose: () => void;
  items: DropdownMenuItem[];
  onSelect: (value: string) => void;
  anchorPosition?: { x: number; y: number };
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  visible,
  onClose,
  items,
  onSelect,
  anchorPosition,
}) => {
  const handleSelect = (value: string) => {
    onSelect(value);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View 
              style={[
                styles.menuContainer,
                anchorPosition && {
                  position: 'absolute',
                  top: anchorPosition.y,
                  right: 16, // Завжди справа з відступом
                }
              ]}
            >
              {items.map((item, index) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.menuItem,
                    index === items.length - 1 && styles.menuItemLast,
                  ]}
                  onPress={() => handleSelect(item.value)}
                  activeOpacity={0.7}
                >
                  {item.icon && (
                    <Icon name={item.icon} size={20} color={colors.text} />
                  )}
                  <Text style={[typography.main, styles.menuItemText]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  menuContainer: {
    backgroundColor: colors.card_surface,
    borderRadius: 12,
    marginTop: 60,
    marginHorizontal: 16,
    paddingVertical: 4,
    minWidth: 200,
    maxWidth: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    color: colors.text,
    flex: 1,
  },
});
