import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { API_URL } from '../config/api';

interface UserData {
  user_id: number;
  email: string;
  user_type: string;
  is_active: boolean;
  is_verified: boolean;
  company_id?: number; // Agregar company_id opcional
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
        
        // Si es company, obtener el company_id
        if (userData.user_type === 'company') {
          const companyId = await getCompanyIdByUserId(userData.user_id, accessToken);
          userData.company_id = companyId;
        }
        
        setUser(userData);
        return userData;
      } else if (response.status === 401) {
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

  const getCompanyIdByUserId = async (userId: number, accessToken: string): Promise<number | null> => {
    try {
      const response = await fetch(`${API_URL}/companies`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const companies = await response.json();
        const userCompany = companies.find((company: any) => company.user_id === userId);
        return userCompany ? userCompany.id : null;
      }
      return null;
    } catch (error) {
      console.error('Error getting company ID:', error);
      return null;
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