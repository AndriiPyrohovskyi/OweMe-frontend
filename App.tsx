import React from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { Button } from './src/components/Button';
import colors from './src/theme/colors';
import typography from './src/theme/typography';

function AppContent(): React.JSX.Element {
  return (
    <View style={[styles.container]}>
      <Text style={[typography.h1, styles.text]}>
        OweMe
      </Text>
      <Text style={[typography.secondary, styles.subtitle]}>
        Track debts with friends
      </Text>
      <Button 
        title="Click" 
        onPress={() => {
          console.log('Button pressed!');
        }}
        variant='green'
        padding={8}
      />
    </View>
  );
}

export default function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

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
  },
});