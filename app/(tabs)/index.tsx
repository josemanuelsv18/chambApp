import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function IndexScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Verificar si hay una sesión guardada
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
      const userToken = await AsyncStorage.getItem('userToken');
      const userEmail = await AsyncStorage.getItem('userEmail');
      
      console.log('Estado de sesión:', { isLoggedIn, userToken, userEmail });

      if (isLoggedIn === 'true' && userToken && userEmail) {
        // Usuario ya está loggeado, ir directamente a HomeScreen
        console.log('Usuario ya loggeado, redirigiendo a HomeScreen');
        router.replace('/HomeScreen');
      } else {
        // No hay sesión activa, ir a registro
        console.log('No hay sesión activa, redirigiendo a registro');
        router.replace('/register');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // En caso de error, limpiar datos y ir a registro
      await clearUserData();
      router.replace('/register');
    } finally {
      setIsLoading(false);
    }
  };

  const clearUserData = async () => {
    try {
      await AsyncStorage.multiRemove([
        'userToken',
        'userEmail', 
        'userId',
        'isLoggedIn'
      ]);
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