import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function PublicarTrabajoScreen() {
  const [puesto, setPuesto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [salario, setSalario] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [trabajadores, setTrabajadores] = useState('1');
  const [isLoading, setIsLoading] = useState(false);

  const handlePublicar = async () => {
    if (!puesto || !descripcion || !salario || !ubicacion) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);

    try {
      // Obtener el company_id del usuario loggeado
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'Debes iniciar sesión');
        return;
      }

      // Buscar la empresa asociada al usuario
      const companiesResponse = await fetch('http://127.0.0.1:8000/companies/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const companies = await companiesResponse.json();
      const userCompany = companies.find((c: any) => c.user_id === parseInt(userId));

      if (!userCompany) {
        Alert.alert('Error', 'No se encontró empresa asociada a tu cuenta');
        return;
      }

      // Crear job offer
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const jobOfferData = {
        company_id: userCompany.id,
        title: puesto,
        description: descripcion,
        category: 'other',
        location: ubicacion,
        start_date: tomorrow.toISOString().split('T')[0],
        end_date: nextWeek.toISOString().split('T')[0],
        start_time: '09:00:00',
        end_time: '17:00:00',
        required_workers: parseInt(trabajadores),
        hourly_rate: parseFloat(salario),
        total_payment: parseFloat(salario) * 8 * parseInt(trabajadores), // 8 horas estimadas
        experience_level: 'entry',
        status: 'open'
      };

      const response = await fetch('http://127.0.0.1:8000/job_offers/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobOfferData),
      });

      if (response.ok) {
        Alert.alert(
          'Éxito',
          'Trabajo publicado exitosamente',
          [
            {
              text: 'OK',
              onPress: () => {
                // Limpiar formulario
                setPuesto('');
                setDescripcion('');
                setSalario('');
                setUbicacion('');
                setTrabajadores('1');
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', 'No se pudo publicar el trabajo');
      }
    } catch (error) {
      console.error('Error publishing job:', error);
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#62483E' }}>
      <View style={styles.header}>
        {/* Logo y Coffeshop */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 25, marginLeft: 10 }}>
          <MaterialIcons name="work" size={38} color="#fff" />
          <Text style={styles.logoText}>ChambApp</Text>
          {/* Puedes poner aquí la imagen del Coffeshop si la tienes */}
        </View>
      </View>
      
      <View style={styles.mainContainer}>
        <Text style={styles.title}>Publicar trabajo</Text>

        {/* Nombre del puesto */}
        <View style={styles.inputBox}>
          <MaterialIcons name="work-outline" size={25} color="#755B51" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Nombre del puesto"
            placeholderTextColor="#b8b6b6"
            value={puesto}
            onChangeText={setPuesto}
            editable={!isLoading}
          />
        </View>

        {/* Descripción */}
        <View style={[styles.inputBox, { height: 100, alignItems: 'flex-start', paddingTop: 12 }]}>
          <MaterialIcons name="description" size={25} color="#755B51" style={styles.icon} />
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            placeholder="Descripción del puesto (Requisitos y detalles)"
            placeholderTextColor="#b8b6b6"
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            editable={!isLoading}
          />
        </View>

        {/* Salario */}
        <View style={styles.inputBox}>
          <FontAwesome name="dollar" size={22} color="#755B51" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Salario por hora"
            placeholderTextColor="#b8b6b6"
            value={salario}
            onChangeText={setSalario}
            keyboardType="numeric"
            editable={!isLoading}
          />
        </View>

        {/* Ubicación */}
        <View style={styles.inputBox}>
          <MaterialIcons name="location-on" size={25} color="#755B51" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Ubicación"
            placeholderTextColor="#b8b6b6"
            value={ubicacion}
            onChangeText={setUbicacion}
            editable={!isLoading}
          />
        </View>

        {/* Número de trabajadores */}
        <View style={styles.inputBox}>
          <MaterialIcons name="people" size={25} color="#755B51" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Número de trabajadores necesarios"
            placeholderTextColor="#b8b6b6"
            value={trabajadores}
            onChangeText={setTrabajadores}
            keyboardType="numeric"
            editable={!isLoading}
          />
        </View>

        {/* Botón */}
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handlePublicar}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Publicando...' : 'Publicar Trabajo'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#62483E',
    height: 100,
    justifyContent: 'flex-end',
    paddingBottom: 15,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  logoText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 23,
    marginLeft: 8,
  },
  mainContainer: {
    backgroundColor: '#D2D2D2',
    flex: 1,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 15,
    paddingTop: 18,
    alignItems: 'center',
  },
  title: {
    color: "#4C3A34",
    fontWeight: 'bold',
    fontSize: 32,
    marginBottom: 16,
    alignSelf: 'flex-start'
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F0F0',
    borderRadius: 24,
    marginBottom: 14,
    paddingHorizontal: 16,
    width: '100%',
    height: 50,
    marginTop: 2
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
    marginBottom: 18,
    marginTop: 12,
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
