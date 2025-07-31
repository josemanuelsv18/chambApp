import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { API_URL } from '../../config/api';

export default function PerfilScreen() {
  const handleLogout = async () => {
    console.log('Botón presionado');
    
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Iniciando proceso de logout...');
              
              // Obtener el token de acceso
              const accessToken = await AsyncStorage.getItem('accessToken');
              
              if (accessToken) {
                console.log('Token encontrado, llamando API...');
                // Llamar al endpoint de logout
                const response = await fetch(`${API_URL}/auth/logout`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                  },
                });
                
                console.log('Respuesta de logout API:', response.status);
                
                if (!response.ok) {
                  console.warn('La API devolvió un error, pero continuamos con la limpieza local');
                }
              }

              // Limpiar todos los datos de sesión
              await AsyncStorage.multiRemove([
                'accessToken',
                'refreshToken',
                'userToken',
                'userEmail', 
                'userId',
                'userType',
                'isLoggedIn'
              ]);

              console.log('Datos locales limpiados, redirigiendo...');
              
              // Redirigir a la pantalla de login
              router.replace('/(auth)/login');
              
            } catch (error) {
              console.error('Error during logout:', error);
              
              // Aunque falle la llamada a la API, limpiar datos locales
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
                
                console.log('Datos limpiados tras error, redirigiendo...');
                router.replace('/(auth)/login');
              } catch (clearError) {
                console.error('Error limpiando datos:', clearError);
                Alert.alert('Error', 'Hubo un problema cerrando la sesión. Reinicia la aplicación.');
              }
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#62483E' }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>ChambApp</Text>
      </View>

      {/* Contenido perfil */}
      <View style={styles.profileContainer}>
        <View style={styles.rowBetween}>
          <Text style={styles.userName}>Karen Sanchez</Text>
          <TouchableOpacity>
            <MaterialIcons name="settings" size={28} color="#57443D" />
          </TouchableOpacity>
        </View>
        <Image source={require('../assets/karen_avatar.png')} style={styles.avatar} />

        {/* Usuario y correo */}
        <Text style={styles.label}>Usuario</Text>
        <View style={styles.chipRow}>
          <Text style={styles.chip}>@akabadmoonie</Text>
        </View>

        <View style={styles.rowBetween}>
          <Text style={styles.label}>Nombre completo</Text>
          <Text style={styles.label}>Email</Text>
        </View>
        <View style={styles.chipRow}>
          <Text style={styles.chip}>Karen Sanchez</Text>
          <Text style={styles.chip}>karen@gmail.com</Text>
        </View>

        {/* Habilidades */}
        <Text style={styles.label}>Habilidades</Text>
        <View style={styles.chipRow}>
          <Text style={styles.chipLarge}>atención al cliente, marketing, publicidad, frontend</Text>
        </View>

        {/* Disponibilidad */}
        <Text style={styles.label}>Disponibilidad</Text>
        <View style={styles.chipRow}>
          <Text style={styles.chip}>Fines de semana</Text>
          <Text style={styles.chip}>virtual</Text>
        </View>

        {/* Rating */}
        <View style={styles.ratingRow}>
          <Text style={styles.label}>RATING</Text>
          <View style={styles.stars}>
            <FontAwesome name="star" size={22} color="#E7E67D" />
            <FontAwesome name="star" size={22} color="#E7E67D" />
            <FontAwesome name="star" size={22} color="#E7E67D" />
            <FontAwesome name="star" size={22} color="#E7E67D" />
            <FontAwesome name="star-o" size={22} color="#4C3A34" />
          </View>
          <View style={styles.chipScore}>
            <Text style={styles.score}>4/5</Text>
          </View>
        </View>

        {/* Botón de Logout */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <MaterialIcons name="logout" size={20} color="#fff" />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#62483E',
    paddingTop: 35,
    height: 80,
  },
  logo: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 26,
    letterSpacing: 0.5,
  },
  profileContainer: {
    backgroundColor: '#D2D2D2',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -22,
    flex: 1,
    padding: 22,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    color: '#4C3A34',
    fontWeight: '500',
    fontSize: 22,
    textAlign: 'center',
    flex: 1,
  },
  avatar: {
    alignSelf: 'center',
    width: 92,
    height: 92,
    borderRadius: 45,
    marginTop: 8,
    marginBottom: 14,
    resizeMode: 'cover',
  },
  label: {
    color: '#4C3A34',
    fontWeight: '600',
    fontSize: 15,
    marginTop: 7,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginVertical: 6,
    alignItems: 'center',
  },
  chip: {
    backgroundColor: '#F2F0F0',
    borderRadius: 15,
    paddingVertical: 7,
    paddingHorizontal: 16,
    color: '#755B51',
    fontSize: 15,
    marginRight: 7,
  },
  chipLarge: {
    backgroundColor: '#F2F0F0',
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 13,
    color: '#755B51',
    fontSize: 14,
    flex: 1,
    marginRight: 7,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 7,
  },
  stars: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  chipScore: {
    backgroundColor: '#F2F0F0',
    borderRadius: 15,
    paddingVertical: 7,
    paddingHorizontal: 18,
    marginLeft: 15,
  },
  score: {
    color: '#4C3A34',
    fontWeight: 'bold',
    fontSize: 17,
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C64545',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
