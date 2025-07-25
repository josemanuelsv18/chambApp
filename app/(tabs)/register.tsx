import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterScreen() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = () => {
    // Aquí conectas a tu backend
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
              <MaterialIcons name="person" size={22} color="#755B51" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Nombre completo"
                placeholderTextColor="#755B51"
                value={nombre}
                onChangeText={setNombre}
              />
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
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Registrarse</Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
              <TouchableOpacity /* onPress={...} */>
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
});

