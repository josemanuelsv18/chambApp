import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    console.log('handleRegister called');
    
    // Validaciones básicas
    if (!email || !phone || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
      
      // Preparar datos JSON como espera tu API
      const requestData = {
        email: email.toLowerCase().trim(),
        phone: cleanPhone,
        user_type: "worker",
        password: password,
      };

      console.log('Enviando datos JSON:', requestData);

      const response = await fetch('http://127.0.0.1:8000/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('Response status:', response.status);
      
      if (response.status === 200 || response.status === 201) {
        try {
          const result = await response.json();
          console.log('API Response:', result);

          if (result === true) {
            Alert.alert(
              'Éxito', 
              'Cuenta creada exitosamente',
              [{
                text: 'OK',
                onPress: () => router.push('/login')
              }]
            );
            
            // Limpiar formulario
            setEmail('');
            setPhone('');
            setPassword('');
          } else {
            Alert.alert('Error', 'No se pudo crear la cuenta. El email podría estar ya registrado.');
          }
        } catch (jsonError) {
          // Si no puede parsear JSON, asumir éxito si status es 200/201
          Alert.alert(
            'Éxito', 
            'Cuenta creada exitosamente',
            [{
              text: 'OK',
              onPress: () => router.push('/login')
            }]
          );
          
          setEmail('');
          setPhone('');
          setPassword('');
        }
      } else if (response.status === 422) {
        // Error de validación específico
        try {
          const errorData = await response.json();
          console.log('Error 422 details:', errorData);
          
          let errorMessage = 'Error de validación:\n';
          if (errorData.detail && Array.isArray(errorData.detail)) {
            errorData.detail.forEach((err: any) => {
              errorMessage += `• ${err.msg}\n`;
            });
          } else {
            errorMessage = 'Datos inválidos. Verifica el formato del email y teléfono.';
          }
          
          Alert.alert('Error de Validación', errorMessage);
        } catch (parseError) {
          Alert.alert('Error', 'Error de validación en los datos enviados');
        }
      } else {
        Alert.alert('Error', `Error del servidor: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Error de registro:', error);
      Alert.alert('Error', 'No se pudo conectar con el servidor. Verifica tu conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    router.push('/login');
  };

  const handleGoToCompanyRegister = () => {
    router.push('/RegisterEmpresaScreen');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#62483E' }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
    >
      <View style={styles.container}>
        <View style={styles.topContainer}>
          <Image source={require('../assets/Logo_ChambApp.png')} style={styles.logo} />
          <Text style={styles.titulo}>Registro</Text>
          <Text style={styles.subtitulo}>Crea tu cuenta en ChambApp</Text>
        </View>

        <View style={styles.bottomContainer}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            {/* Toggle para tipo de usuario */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity style={styles.toggleLeftActive}>
                <Text style={styles.toggleLeftTextActive}>Trabajador</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toggleRight} onPress={handleGoToCompanyRegister}>
                <Text style={styles.toggleRightText}>Empresa</Text>
              </TouchableOpacity>
            </View>

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
                placeholder="Teléfono (+1234567890)"
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
                placeholder="Contraseña (mínimo 8 caracteres)"
                placeholderTextColor="#755B51"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]} 
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Registrando...' : 'Registrarse'}
              </Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={handleGoToLogin} disabled={isLoading}>
                <Text style={styles.loginLink}>Inicia sesión</Text>
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
  button: {
    backgroundColor: '#57443D',
    paddingVertical: 13,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 5,
  },
  buttonDisabled: {
    backgroundColor: '#9A8A84',
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
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  toggleLeftActive: {
    backgroundColor: '#57443D',
    borderRadius: 22,
    paddingVertical: 6,
    paddingHorizontal: 23,
    marginRight: 8,
  },
  toggleLeftTextActive: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  toggleRight: {
    backgroundColor: '#D2D2D2',
    borderRadius: 22,
    paddingVertical: 6,
    paddingHorizontal: 23,
  },
  toggleRightText: {
    color: '#755B51',
    fontSize: 17,
  },
});

