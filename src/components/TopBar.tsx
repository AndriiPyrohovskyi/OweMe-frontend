import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from "../theme/colors";
import typography from "../theme/typography";
import Icon from "./Icon";

interface TopBarProps {
    userName?: string;
    onAvatarPress?: () => void;
    onNotificationPress?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
    userName,
    onAvatarPress,
    onNotificationPress
}) => {
    const insets = useSafeAreaInsets();
    
    return (
        <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
            <View style={styles.headerLeft}>
                <TouchableOpacity 
                    style={styles.avatar}
                    onPress={onAvatarPress}
                >
                    <Text style={styles.avatarText}>{userName?.[0]?.toUpperCase() || '?'}</Text>
                </TouchableOpacity>
                <Text style={styles.appName}>OweMe</Text>
            </View>
            <TouchableOpacity onPress={onNotificationPress}>
                <Icon name="homeIcon" size={24} color={colors.text} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        ...typography.h3,
        fontSize: 18,
        color: colors.background,
    },
    appName: {
        ...typography.h2,
        fontSize: 20,
        color: colors.text,
    },
});