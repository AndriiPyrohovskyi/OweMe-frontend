import React, { useState } from 'react';
import { View, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/api/client';
import { NavigationProp } from '@react-navigation/native';

type LoginScreenProps = {
    navigation: NavigationProp<any>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      setLoading(true);
      await login(username, password);
    } catch (error) {
      if (error instanceof ApiError) {
        Alert.alert('Помилка', error.message);
      } else {
        Alert.alert('Помилка', 'Щось пішло не так');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button 
        title={loading ? 'Завантаження...' : 'Увійти'} 
        onPress={handleLogin}
        disabled={loading}
      />
    </View>
  );
};

export default LoginScreen;