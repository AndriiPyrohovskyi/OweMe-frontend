import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import colors from "../theme/colors";
import typography from "../theme/typography";
import Icon from "./Icon";

interface ButtonProps {
    onPress: () => void;
    title?: string;
    icon?: string;
    iconSize?: number;
    variant?: 'purple' | 'green' | 'yellow' | "coral";
    padding?: number;
}

export const Button: React.FC<ButtonProps> = ({
    title = '',
    onPress,
    variant = 'purple',
    icon = null,
    iconSize = 12,
    padding = 4,
}) => {
    const buttonStyle = [
        { padding: padding },
        styles.button,
        variant === 'purple' && styles.purple,
        variant === 'green' && styles.green,
        variant === 'yellow' && styles.yellow,
        variant === 'coral' && styles.coral,
    ];
    
    return (
        <TouchableOpacity
            style={buttonStyle}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                {icon && <Icon name={icon} size={iconSize} />}
                {title && (
                    <Text style={[typography.CTA, styles.text]}>
                        {title}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 16,
        borderWidth: 2,
        width: '100%',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    iconContainer: {
        marginRight: 8,
    },
    text: {
        color: colors.text
    },
    purple: {
        backgroundColor: colors.primary,
        borderColor: colors.dark_primary,
    },
    green: {
        backgroundColor: colors.green70,
        borderColor: colors.green,
    },
    yellow: {
        backgroundColor: colors.yellow70,
        borderColor: colors.yellow,
    },
    coral: {
        backgroundColor: colors.coral70,
        borderColor: colors.coral
    }
});