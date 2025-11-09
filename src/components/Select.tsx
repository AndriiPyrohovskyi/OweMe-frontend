import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import colors from '../theme/colors';
import typography from '../theme/typography';
import Icon from './Icon';

interface SelectProps {
  label?: string;
  items: { label: string; value: string }[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}

export const Select: React.FC<SelectProps> = ({
  label,
  items,
  selectedValue,
  onValueChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedItem = items.find(item => item.value === selectedValue);
  const displayText = selectedItem ? selectedItem.label : 'Оберіть...';

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[typography.secondary, styles.label]}>{label}</Text>
      )}
      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={[typography.secondary, styles.selectText]} numberOfLines={1}>
          {displayText}
        </Text>
        <Icon name="dropdownIcon" size={12} color={colors.text} />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <ScrollView style={styles.optionsList}>
              {items.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.option,
                    item.value === selectedValue && styles.selectedOption,
                  ]}
                  onPress={() => {
                    onValueChange(item.value);
                    setIsOpen(false);
                  }}
                >
                  <Text
                    style={[
                      typography.secondary,
                      styles.optionText,
                      item.value === selectedValue && styles.selectedOptionText,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    color: colors.text,
    marginBottom: 6,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card_surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border_divider,
    padding: 12,
    minHeight: 50,
  },
  selectText: {
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.card_surface,
    borderRadius: 12,
    width: '80%',
    maxHeight: '60%',
    borderWidth: 1,
    borderColor: colors.border_divider,
  },
  optionsList: {
    maxHeight: 400,
  },
  option: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border_divider,
  },
  selectedOption: {
    backgroundColor: colors.primary15,
  },
  optionText: {
    color: colors.text,
  },
  selectedOptionText: {
    color: colors.primary,
    fontWeight: '600',
  },
});
