import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Aquí conectas a tu backend
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
                placeholder="email"
                placeholderTextColor="#755B51"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputBox}>
              <MaterialIcons name="lock" size={22} color="#755B51" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="contraseña"
                placeholderTextColor="#755B51"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.linkContainer}>
              <Text style={styles.forgot}>¿olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Ingresar</Text>
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>¿No tienes cuenta? </Text>
              <TouchableOpacity /* onPress={...} */>
                <Text style={styles.registerLink}>Registrarse</Text>
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
  forgot: {
    color: '#755B51',
    fontSize: 14,
    marginBottom: 18,
    textAlign: 'right',
  },
  linkContainer: {
    width: '100%',
    alignItems: 'flex-end',
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
});
