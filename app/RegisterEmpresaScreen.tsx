import { Feather, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterEmpresaScreen() {
  const [empresa, setEmpresa] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [desc, setDesc] = useState('');
  const [fiscales, setFiscales] = useState('');

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#62483E' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={require('./assets/Logo_ChambApp.png')} style={styles.logo} />
            <Text style={styles.brand}>ChambApp</Text>
          </View>
          {/* Icono empresa */}
          <Image source={require('./assets/icon_empresa.png')} style={styles.coffee} />
        </View>

        {/* Cuerpo */}
        <View style={styles.container}>
          <Text style={styles.title}>Crear cuenta empresa</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity style={styles.toggleLeft}><Text style={styles.toggleLeftText}>Trabajador</Text></TouchableOpacity>
            <TouchableOpacity style={styles.toggleRightActive}><Text style={styles.toggleRightTextActive}>Empresa</Text></TouchableOpacity>
          </View>

          <View style={styles.inputBox}>
            <FontAwesome5 name="user" size={20} color="#755B51" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="nombre de empresa"
              placeholderTextColor="#755B51"
              value={empresa}
              onChangeText={setEmpresa}
            />
          </View>
          <View style={styles.inputBox}>
            <MaterialIcons name="email" size={20} color="#755B51" style={styles.icon} />
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
            <Feather name="phone" size={20} color="#755B51" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="teléfono"
              placeholderTextColor="#755B51"
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
            />
          </View>
          <View style={styles.inputBox}>
            <MaterialIcons name="lock" size={20} color="#755B51" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="contraseña"
              placeholderTextColor="#755B51"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          <View style={styles.inputBox}>
            <MaterialIcons name="lock" size={20} color="#755B51" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="confirmar contraseña"
              placeholderTextColor="#755B51"
              value={confirmar}
              onChangeText={setConfirmar}
              secureTextEntry
            />
          </View>
          <View style={styles.inputBox}>
            <Feather name="edit" size={20} color="#755B51" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="breve descripcion"
              placeholderTextColor="#755B51"
              value={desc}
              onChangeText={setDesc}
            />
          </View>
          <View style={styles.inputBox}>
            <FontAwesome5 name="building" size={20} color="#755B51" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="datos fiscales (opcional)"
              placeholderTextColor="#755B51"
              value={fiscales}
              onChangeText={setFiscales}
            />
          </View>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Registrarse</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 80,
    backgroundColor: '#62483E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 32,
  },
  logo: {
    width: 36,
    height: 36,
    marginRight: 7,
    resizeMode: 'contain',
  },
  brand: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  coffee: {
    width: 64,
    height: 64,
    marginTop: -16,
    resizeMode: 'contain',
  },
  container: {
    backgroundColor: '#D2D2D2',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 18,
    paddingTop: 18,
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 32,
    color: '#4C3A34',
    fontWeight: '500',
    marginBottom: 18,
    alignSelf: 'flex-start',
    marginLeft: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignSelf: 'flex-start',
    marginLeft: 4,
  },
  toggleLeft: {
    backgroundColor: '#D2D2D2',
    borderRadius: 22,
    paddingVertical: 6,
    paddingHorizontal: 23,
    marginRight: 8,
  },
  toggleLeftText: {
    color: '#755B51',
    fontSize: 17,
  },
  toggleRightActive: {
    backgroundColor: '#57443D',
    borderRadius: 22,
    paddingVertical: 6,
    paddingHorizontal: 23,
  },
  toggleRightTextActive: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F0F0',
    borderRadius: 25,
    marginBottom: 14,
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
    fontSize: 16,
    color: '#4C3A34',
  },
  button: {
    backgroundColor: '#57443D',
    paddingVertical: 13,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
});
