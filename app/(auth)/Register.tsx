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
import { API_URL } from '../../config/api';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    // Validaciones básicas
    if (!email.trim() || !phone.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Por favor, completa todos los campos');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Por favor, ingresa un email válido');
      return;
    }

    if (!isValidPhone(phone)) {
      Alert.alert('Error', 'Por favor, ingresa un número de teléfono válido');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      // Registro del usuario usando /users/
      console.log('Registrando usuario con URL:', `${API_URL}/users/`);
      
      const registerResponse = await fetch(`${API_URL}/users/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          phone: phone.trim(),
          user_type: 'worker', // Por defecto worker
          password: password,
        }),
      });

      const registerData = await registerResponse.json();
      console.log('Register response:', registerResponse.status, registerData);

      if (registerResponse.ok) {
        console.log('Registro exitoso:', registerData);
        
        // Después del registro exitoso, hacer login automático
        await performAutoLogin(email.toLowerCase().trim(), password);
      } else {
        // Error en el registro
        let errorMessage = 'Error al crear la cuenta';
        if (registerData.detail) {
          if (typeof registerData.detail === 'string') {
            errorMessage = registerData.detail;
          } else if (Array.isArray(registerData.detail)) {
            errorMessage = registerData.detail.map((err: any) => err.msg || err.message || err).join(', ');
          }
        }
        Alert.alert('Error de registro', errorMessage);
      }
    } catch (error) {
      console.error('Error during registration:', error);
      Alert.alert(
        'Error de conexión', 
        'No se pudo conectar al servidor. Verifica tu conexión a internet.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const performAutoLogin = async (email: string, password: string) => {
    try {
      console.log('Iniciando login automático...');
      
      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const loginData = await loginResponse.json();
      console.log('Auto login response:', loginResponse.status, loginData);

      if (loginResponse.ok) {
        // Login exitoso - guardar tokens y datos del usuario
        await AsyncStorage.multiSet([
          ['accessToken', loginData.access_token],
          ['refreshToken', loginData.refresh_token],
          ['isLoggedIn', 'true'],
        ]);

        console.log('Tokens del auto-login guardados');

        // Obtener información del usuario con el nuevo token
        await getUserInfo(loginData.access_token);

        console.log('Login automático exitoso');
        
        // Mostrar mensaje de éxito y redirigir
        Alert.alert(
          'Registro exitoso',
          '¡Bienvenido a ChambApp! Tu cuenta ha sido creada exitosamente.',
          [
            {
              text: 'Continuar',
              onPress: () => router.replace('/internals/HomeScreen')
            }
          ]
        );
      } else {
        // Si falla el login automático, redirigir a login manual
        Alert.alert(
          'Registro exitoso',
          'Tu cuenta ha sido creada. Por favor, inicia sesión.',
          [
            {
              text: 'Ir a Login',
              onPress: () => router.replace('/(auth)/login')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error during auto login:', error);
      // Si falla el login automático, redirigir a login manual
      Alert.alert(
        'Registro exitoso',
        'Tu cuenta ha sido creada. Por favor, inicia sesión.',
        [
          {
            text: 'Ir a Login',
            onPress: () => router.replace('/(auth)/login')
          }
        ]
      );
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

  const isValidPhone = (phone: string): boolean => {
    // Validación básica para números de teléfono (8-15 dígitos)
    const phoneRegex = /^\+?[\d\s-()]{8,15}$/;
    return phoneRegex.test(phone.trim());
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#62483E' }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
    >
      <View style={styles.container}>
        {/* Encabezado */}
        <View style={styles.topContainer}>
          <Image source={require('../assets/Logo_ChambApp.png')} style={styles.logo} />
          <Text style={styles.titulo}>Registro</Text>
          <Text style={styles.subtitulo}>Crea tu cuenta en ChambApp</Text>
        </View>

        {/* Formulario */}
        <View style={styles.bottomContainer}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.inputBox}>
              <MaterialIcons name="email" size={22} color="#755B51" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor="#755B51"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputBox}>
              <MaterialIcons name="phone" size={22} color="#755B51" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Número de teléfono"
                placeholderTextColor="#755B51"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputBox}>
              <MaterialIcons name="lock" size={22} color="#755B51" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña (mín. 8 caracteres)"
                placeholderTextColor="#755B51"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputBox}>
              <MaterialIcons name="lock" size={22} color="#755B51" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Confirmar contraseña"
                placeholderTextColor="#755B51"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            {/* <View style={styles.userTypeInfo}>
              <MaterialIcons name="work" size={20} color="#755B51" />
              <Text style={styles.userTypeText}>
                Te registrarás como trabajador
              </Text>
            </View> */}

            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]} 
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Registrarse</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
              <TouchableOpacity 
                onPress={() => router.push('/(auth)/login')}
                disabled={isLoading}
              >
                <Text style={[styles.loginLink, isLoading && styles.linkDisabled]}>
                  Inicia sesión
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
    paddingTop: 50,
    paddingBottom: 15,
    alignItems: 'flex-start',
    paddingHorizontal: 32,
    backgroundColor: '#62483E',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
    resizeMode: 'contain',
  },
  titulo: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subtitulo: {
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
  userTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4F8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#B0D4E0',
  },
  userTypeText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4C3A34',
    fontWeight: '500',
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
  loginContainer: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'center',
  },
  loginText: {
    color: '#755B51',
    fontSize: 15,
  },
  loginLink: {
    color: '#4C3A34',
    fontWeight: 'bold',
    fontSize: 15,
  },
  linkDisabled: {
    color: '#A0A0A0',
  },
});
