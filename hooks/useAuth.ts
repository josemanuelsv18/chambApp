import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { API_URL } from '../config/api';

interface UserData {
  user_id: number;
  email: string;
  user_type: string;
  is_active: boolean;
  is_verified: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getUserInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const accessToken = await AsyncStorage.getItem('accessToken');
      
      if (!accessToken) {
        setUser(null);
        return null;
      }

      console.log('Verificando información del usuario...');
      
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('Datos del usuario obtenidos:', userData);
        setUser(userData);
        return userData;
      } else if (response.status === 401) {
        // Token inválido, limpiar storage
        console.log('Token inválido, limpiando storage...');
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'isLoggedIn']);
        setUser(null);
        setError('Sesión expirada');
        return null;
      } else {
        console.error('Error en la respuesta:', response.status);
        setError('Error al obtener información del usuario');
        return null;
      }
    } catch (error) {
      console.error('Error getting user info:', error);
      setError('Error de conexión');
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  return {
    user,
    isLoading,
    error,
    isCompany: user?.user_type === 'company',
    isLoggedIn: !!user,
    refreshUserInfo: getUserInfo,
  };
};