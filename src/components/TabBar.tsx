import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import colors from "../theme/colors";
import typography from "../theme/typography";
import Icon from "./Icon";

interface TabAtributes {
    name: string;
    icon: string;
}

interface TabBarProps {
    onTabChange: (tab: TabAtributes) => void;
    activeTab?: TabAtributes;
    tabs: TabAtributes[];
}

export const TabBar: React.FC<TabBarProps> = ({
    onTabChange,
    tabs,
    activeTab: initialActiveTab = { name: "Home", icon: "dropdownIcon" }
}) => {
    const [activeTab, setActiveTab] = useState<TabAtributes>(initialActiveTab);

    return (
        <View style={styles.tabs}>
            {tabs.map((tab: TabAtributes, index) => {
                const isActive = activeTab.name === tab.name;
                return (
                    <TouchableOpacity
                        key={index}
                        style={styles.tab}
                        onPress={() => {
                            setActiveTab(tab);
                            onTabChange(tab);
                        }}
                    >
                        <Icon 
                            name={tab.icon} 
                            size={40} 
                            color={isActive ? colors.dark_primary : colors.text}
                        />
                        <Text 
                            style={[
                                typography.secondary, 
                                { color: isActive ? colors.dark_primary : colors.text }
                            ]}
                        >
                            {tab.name}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    tabs: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 2,
        borderColor: colors.border_divider,
        width: '100%',
    },
    tab: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
});