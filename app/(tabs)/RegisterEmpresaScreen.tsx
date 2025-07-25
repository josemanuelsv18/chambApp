import { Feather, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterEmpresaScreen() {
  const [empresa, setEmpresa] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [desc, setDesc] = useState('');
  const [fiscales, setFiscales] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    // Validaciones
    if (!empresa || !email || !telefono || !password || !confirmar) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    if (password !== confirmar) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Crear usuario empresa
      const userData = {
        email: email.toLowerCase().trim(),
        phone: telefono.replace(/[\s\-\(\)]/g, ''),
        user_type: 'company',
        password: password,
      };

      const userResponse = await fetch('http://127.0.0.1:8000/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!userResponse.ok) {
        Alert.alert('Error', 'No se pudo crear la cuenta de usuario');
        return;
      }

      // 2. Obtener el usuario creado para obtener su ID
      const usersResponse = await fetch('http://127.0.0.1:8000/users/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const users = await usersResponse.json();
      const newUser = users.find((u: any) => u.email === email.toLowerCase().trim());

      if (!newUser) {
        Alert.alert('Error', 'No se pudo obtener la información del usuario');
        return;
      }

      // 3. Crear empresa
      const companyData = {
        user_id: newUser.id,
        company_name: empresa,
        business_type: desc || 'Sin descripción',
        email: email.toLowerCase().trim(),
        phone: telefono.replace(/[\s\-\(\)]/g, ''),
        website: '',
        logo: '',
        description: desc || 'Sin descripción',
        location: '',
        tax_info: fiscales || '',
        verification_status: 'pending'
      };

      const companyResponse = await fetch('http://127.0.0.1:8000/companies/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyData),
      });

      if (companyResponse.ok) {
        Alert.alert(
          'Éxito',
          'Cuenta de empresa creada exitosamente',
          [
            {
              text: 'OK',
              onPress: () => router.push('/login')
            }
          ]
        );

        // Limpiar formulario
        setEmpresa('');
        setEmail('');
        setTelefono('');
        setPassword('');
        setConfirmar('');
        setDesc('');
        setFiscales('');
      } else {
        Alert.alert('Error', 'No se pudo crear la empresa');
      }
    } catch (error) {
      console.error('Error registering company:', error);
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToWorkerRegister = () => {
    router.push('/register');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#62483E' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={require('../assets/Logo_ChambApp.png')} style={styles.logo} />
            <Text style={styles.brand}>ChambApp</Text>
          </View>
          {/* Icono empresa */}
          <Image source={require('../assets/icon_empresa.png')} style={styles.coffee} />
        </View>

        {/* Cuerpo */}
        <View style={styles.container}>
          <Text style={styles.title}>Crear cuenta empresa</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity style={styles.toggleLeft} onPress={handleGoToWorkerRegister}>
              <Text style={styles.toggleLeftText}>Trabajador</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toggleRightActive}>
              <Text style={styles.toggleRightTextActive}>Empresa</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputBox}>
            <FontAwesome5 name="user" size={20} color="#755B51" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="nombre de empresa"
              placeholderTextColor="#755B51"
              value={empresa}
              onChangeText={setEmpresa}
              editable={!isLoading}
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
              editable={!isLoading}
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
              editable={!isLoading}
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
              editable={!isLoading}
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
              editable={!isLoading}
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
              editable={!isLoading}
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
              editable={!isLoading}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Registrando...' : 'Registrarse'}
            </Text>
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
  buttonDisabled: {
    backgroundColor: '#9A8A84',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
});
