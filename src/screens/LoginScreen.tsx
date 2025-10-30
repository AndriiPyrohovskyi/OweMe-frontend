import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { authApi } from '../services/api/endpoints/auth';
import { authStorage } from '../services/storage/authStorage';
import { ApiError } from '../services/api/client';
import { NavigationProp } from '@react-navigation/native';

type LoginScreenProps = {
    navigation: NavigationProp<any>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      
      const response = await authApi.login({ username, password });

      await authStorage.setToken(response.accessToken);

      const user = await authApi.getProfile();
      await authStorage.setUser(user);

      navigation.navigate('Dashboard');

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
    <View>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
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