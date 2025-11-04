import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import colors from "../theme/colors";
import typography from "../theme/typography";
import Icon from "./Icon";

interface DropdownProps {
    onPress: () => void;
    isActive?: boolean;
    title?: string;
    padding?: number;
    options: string[];
}

export const Dropdown: React.FC<DropdownProps> = ({
    title,
    onPress,
    padding = 4,
    isActive: initialActive = false,
    options
}) => {
    const [isActive, setIsActive] = useState(initialActive);
    const [selectedOption, setSelectedOption] = useState(title);
    const toggleDropdown = () => {
        setIsActive((prev) => !prev);
    };

    const dropdownStyle = [
        { padding: padding },
        styles.dropdown,
    ];

    return (
        <View>
            <TouchableOpacity
                style={dropdownStyle}
                onPress={toggleDropdown}
                activeOpacity={0.7}
            >
                <View style={styles.content}>
                    <Text style={[typography.secondary, styles.text]}>
                        {selectedOption}
                    </Text>
                    <Icon name="dropdownIcon" size={12} />
                </View>
            </TouchableOpacity>
            {isActive && (
                <ScrollView style={styles.dropdownContent}>
                    {options.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => {
                                setSelectedOption(option);
                                setIsActive(false);
                                onPress();
                            }}
                            style={{ padding: 8 }}
                        >
                            <Text style={typography.secondary}>{option}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    dropdown: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        borderWidth: 2,
        width: '100%',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    text: {
        color: colors.text,
    },
    dropdownContent: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        marginTop: 8,
        padding: 8,
        backgroundColor: colors.card_surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border_divider,
        zIndex: 1000,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        maxHeight: 200,
    },
});