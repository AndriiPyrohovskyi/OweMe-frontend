import { NavigationProp } from "@react-navigation/native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import colors from "../theme/colors";
import typography from "../theme/typography";
import { Button } from "../components/Button";

type HomeScreenProps = {
    navigation: NavigationProp<any>;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Text style={[typography.h1, styles.text]}>OweMe</Text>
            <Text style={[typography.secondary, styles.subtitle]}>
                Track debts with friends
            </Text>
            <Button 
                title="Go to Dashboard" 
                onPress={() => navigation.navigate('Dashboard')}
                variant='green'
                padding={8}
            />
            <Button 
                title="Go to Dashboard" 
                onPress={() => navigation.navigate('Login')}
                variant='green'
                padding={8}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background
    },
    text: {
        marginBottom: 10,
        color: colors.text
    },
    subtitle: {
        opacity: 0.7,
        color: colors.text,
        marginBottom: 20,
    }
});