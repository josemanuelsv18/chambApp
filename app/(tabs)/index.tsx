import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { API_URL } from '../../config/api';

// !!! No se logra mantener la sesión si el usuario entra y sale de la app !!!

export default function IndexScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Verificar si hay una sesión guardada
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      
      console.log('Tokens encontrados:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        accessToken: accessToken ? accessToken.substring(0, 20) + '...' : null,
        refreshToken: refreshToken ? refreshToken.substring(0, 20) + '...' : null,
      });

      if(!accessToken || !refreshToken) {
        // Si no hay tokens, redirigir a la pantalla de inicio de sesión
        console.log('No hay sesión activa, redirigiendo a login...');
        await clearUserData();
        router.replace('/(auth)/login');
        return;
      }

      // Verificar si los tokens son validos
      const isValid = await validateAccessToken(accessToken);
      
      if (isValid){
        //Token valido, usuario autenticado
        console.log('Token válido, redirigiendo a la pantalla principal...');
        router.replace('/internals/HomeScreen');
      }else{
        // Token invalido, Intentar renovarlo
        console.log('Access token invalido, intentando renovar...');
        const refreshSuccess = await refreshAccessToken(refreshToken);
        
        if(refreshSuccess){
          console.log('Token renovado exitosamente, redirigiendo a la pantalla principal...');
          router.replace('/internals/HomeScreen');
        }else{
          console.log('No se pudo renovar el token, redirigiendo a login...');
          await clearUserData();
          router.replace('/(auth)/login');
        }
      }

    } catch (error) {
      console.error('Error checking auth status:', error);
      // En caso de error, redirigir a la pantalla de inicio de sesión
      await clearUserData();
      router.replace('/(auth)/login');
    } finally{
      setIsLoading(false);
    }
  };

  const validateAccessToken = async (token: string): Promise<boolean> => {
    try{
      console.log('Validando token con URL:', `${API_URL}/auth/me`);
      
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers:{
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      
      if (response.ok){
        const userData = await response.json();
        console.log('Datos del usuario obtenidos:', userData);
        
        //Guardar datos del usuario actualizados
        await AsyncStorage.multiSet([
          ['userEmail', userData.email],
          ['userId', userData.user_id.toString()], // Cambié de id a user_id
          ['userType', userData.user_type],
          ['isLoggedIn', 'true'],
        ]);
        
        return true;
      }
      
      console.log('Token inválido, response not ok');
      return false;
    } catch (error) {
      console.error('Error validating access token:', error);
      return false;
    }
  };

  const refreshAccessToken = async (refreshToken: string): Promise<boolean> => {
    try{
      console.log('Renovando token con URL:', `${API_URL}/auth/refresh`);
      
      const response = await fetch(`${API_URL}/auth/refresh`,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      console.log('Refresh response status:', response.status);

      if (response.ok){
        const tokenData = await response.json();
        console.log('Nuevos tokens obtenidos');

        //Guardar los nuevos tokens
        await AsyncStorage.multiSet([
          ['accessToken', tokenData.access_token],
          ['refreshToken', tokenData.refresh_token],
        ]);

        return await validateAccessToken(tokenData.access_token);
      }
      
      console.log('No se pudo renovar el token');
      return false;
    } catch (error){
      console.error('Error refreshing access token:', error);
      return false;
    }
  };

  const clearUserData = async () => {
    try {
      await AsyncStorage.multiRemove([
        'accessToken',
        'refreshToken',
        'userToken',
        'userEmail', 
        'userId',
        'userType',
        'isLoggedIn'
      ]);
      console.log('Datos de usuario limpiados');
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#62483E" />
        <Text style={styles.loadingText}>Verificando sesión...</Text>
      </View>
    );
  }

  // Este componente solo muestra loading, la navegación es automática
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#62483E" />
      <Text style={styles.loadingText}>Cargando...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#62483E',
  },
});