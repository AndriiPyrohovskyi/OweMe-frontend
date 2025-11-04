import React, { useState } from 'react';
import { View, TextInput, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/api/client';
import { NavigationProp } from '@react-navigation/native';
import { authApi } from '../services/api/endpoints';
import { Button } from "../components/Button";
import colors from '../theme/colors';

type LoginScreenProps = {
    navigation: NavigationProp<any>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [usernameLogin, setUsernameLogin] = useState('');
  const [passwordLogin, setPasswordLogin] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);

  const [usernameRegister, setUsernameRegister] = useState('');
  const [passwordRegister, setPasswordRegister] = useState('');
  const [emailRegister, setEmailRegister] = useState('');
  const [loadingRegister, setLoadingRegister] = useState(false);
  
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      setLoadingLogin(true);
      await login(usernameLogin, passwordLogin);
    } catch (error) {
      if (error instanceof ApiError) {
        Alert.alert('Помилка', error.message);
      } else {
        Alert.alert('Помилка', 'Щось пішло не так');
      }
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleRegister = async () => {
    try {
      await authApi.register({username: usernameRegister, password: passwordRegister, email: emailRegister})
      try {
        setLoadingRegister(true);
        await login(usernameRegister, passwordRegister);
      } catch (error) {
        if (error instanceof ApiError) {
          Alert.alert('Помилка', error.message);
        } else {
          Alert.alert('Помилка', 'Щось пішло не так');
        }
      } finally {
        setLoadingRegister(false);
      }      
    } catch (error) {
      if (error instanceof ApiError) {
        Alert.alert('Помилка', error.message);
      } else {
        Alert.alert('Помилка', 'Щось пішло не так');
    }
  };
}

  return (
    <View style={styles.container}>
      <TextInput
      style={styles.textBox}
      placeholder="Username"
      placeholderTextColor={colors.text70}
      value={usernameLogin}
      onChangeText={setUsernameLogin}
      autoCapitalize="none"
      />
      <TextInput
      style={styles.textBox}
      placeholder="Password"
      placeholderTextColor={colors.text70}
      value={passwordLogin}
      onChangeText={setPasswordLogin}
      secureTextEntry
      />
      <Button 
      title={loadingLogin ? 'Завантаження...' : 'Увійти'} 
      onPress={handleLogin}
      />

      <TextInput
      style={styles.textBox}
      placeholder="Username"
      placeholderTextColor={colors.text70}
      value={usernameRegister}
      onChangeText={setUsernameRegister}
      autoCapitalize="none"
      />
      <TextInput
      style={styles.textBox}
      placeholder="Password"
      placeholderTextColor={colors.text70}
      value={passwordRegister}
      onChangeText={setPasswordRegister}
      secureTextEntry
      />
      <TextInput
      style={styles.textBox}
      placeholder="Email"
      placeholderTextColor={colors.text70}
      value={emailRegister}
      onChangeText={setEmailRegister}
      />
      <Button 
      title={loadingRegister ? 'Завантаження...' : 'Зареєструватись'} 
      onPress={handleRegister}
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
    textBox: {
        color: colors.text,
    },
    subtitle: {
        opacity: 0.7,
        color: colors.text,
        marginBottom: 20,
    }
});

export default LoginScreen;