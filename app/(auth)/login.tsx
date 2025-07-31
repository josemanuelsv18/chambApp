import { API_URL } from '@/config/api';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // Validaciones básicas
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor, completa todos los campos');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Por favor, ingresa un email válido');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Intentando login con URL:', `${API_URL}/auth/login`);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password: password,
        }),
      });

      const data = await response.json();
      console.log('Login response:', response.status, data);

      if (response.ok) {
        // Login exitoso - guardar tokens y datos del usuario
        await AsyncStorage.multiSet([
          ['accessToken', data.access_token],
          ['refreshToken', data.refresh_token],
          ['isLoggedIn', 'true'],
        ]);

        console.log('Tokens guardados exitosamente');

        // Obtener información del usuario con el nuevo token
        await getUserInfo(data.access_token);

        console.log('Login exitoso');
        
        // Redirigir a la pantalla principal
        router.replace('/internals/HomeScreen');
      } else {
        // Error en el login
        const errorMessage = data.detail || 'Error al iniciar sesión';
        Alert.alert('Error de autenticación', errorMessage);
      }
    } catch (error) {
      console.error('Error during login:', error);
      Alert.alert(
        'Error de conexión', 
        'No se pudo conectar al servidor. Verifica tu conexión a internet.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getUserInfo = async (accessToken: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        
        // Guardar información del usuario
        await AsyncStorage.multiSet([
          ['userEmail', userData.email],
          ['userId', userData.user_id.toString()],
          ['userType', userData.user_type],
        ]);

        console.log('Información del usuario guardada:', userData);
      }
    } catch (error) {
      console.error('Error getting user info:', error);
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#62483E' }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
    >
      <View style={styles.container}>
        {/* Encabezado y saludo */}
        <View style={styles.topContainer}>
          <Image source={require('../assets/Logo_ChambApp.png')} style={styles.logo} />
          <Text style={styles.hola}>¡Hola!</Text>
          <Text style={styles.bienvenido}>Bienvenido a ChambApp</Text>
        </View>

        {/* Sección inferior con scroll y inputs */}
        <View style={styles.bottomContainer}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.loginTitle}>Iniciar Sesión</Text>

            <View style={styles.inputBox}>
              <MaterialIcons name="email" size={22} color="#755B51" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#755B51"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputBox}>
              <MaterialIcons name="lock" size={22} color="#755B51" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="#755B51"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]} 
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Ingresar</Text>
              )}
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>¿No tienes cuenta? </Text>
              <TouchableOpacity 
                onPress={() => router.push('/(auth)/Register')}
                disabled={isLoading}
              >
                <Text style={[styles.registerLink, isLoading && styles.linkDisabled]}>
                  Registrarse
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#62483E',
  },
  topContainer: {
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'flex-start',
    paddingHorizontal: 32,
    backgroundColor: '#62483E',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  hola: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bienvenido: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 8,
  },
  bottomContainer: {
    flex: 1,
    backgroundColor: '#D2D2D2',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 7,
    justifyContent: 'flex-start',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingBottom: 24,
  },
  loginTitle: {
    fontSize: 28,
    color: '#4C3A34',
    fontWeight: '500',
    marginBottom: 18,
    marginTop: 8,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F0F0',
    borderRadius: 25,
    marginBottom: 18,
    paddingHorizontal: 16,
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#D2D2D2',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: '#4C3A34',
  },
  button: {
    backgroundColor: '#57443D',
    paddingVertical: 13,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    marginTop: 5,
    minHeight: 50,
  },
  buttonDisabled: {
    backgroundColor: '#8A7A74',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
  registerContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  registerText: {
    color: '#755B51',
    fontSize: 15,
  },
  registerLink: {
    color: '#4C3A34',
    fontWeight: 'bold',
    fontSize: 15,
  },
  linkDisabled: {
    color: '#A0A0A0',
  },
});
