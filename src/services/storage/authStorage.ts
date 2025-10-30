import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = '@oweme_token';
const USER_KEY = '@oweme_user';

export const authStorage = {
    async getToken(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem(TOKEN_KEY);
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    },
    async setToken(token: string): Promise<void> {
        try {
            await AsyncStorage.setItem(TOKEN_KEY, token);
        } catch (error) {
            console.error('Error setting token:', error);
        }
    },
    async removeToken() : Promise<any | null> {
        try {
            await AsyncStorage.removeItem(TOKEN_KEY);
        } catch (error) {
            console.error('Error removing token:', error);
            return null;
        }
    },
    async getUser() : Promise<any | null> {
        try {
            const user = await AsyncStorage.getItem(USER_KEY);
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('Error getting user:', error);
            return null;
        }
    },
    async setUser(user: any) : Promise<void> {
        try {
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(user))
        } catch (error) {
            console.error('Error setting user:', error);
        }
    },
    async removeUser() : Promise<void> {
        try {
            await AsyncStorage.removeItem(USER_KEY)
        } catch (error) {
            console.error('Error setting user:', error);
        }
    },
    async clearAll(): Promise<void> {
        try {
          await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
        } catch (error) {
          console.error('Error clearing auth data:', error);
        }
    },
}