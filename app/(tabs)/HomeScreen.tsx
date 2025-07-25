import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const JOBS = [
  {
    id: '1',
    title: 'Salonero (Eventual)',
    company: 'Hilton',
    salary: '3.12$/h',
    date: '23/07/2025',
    logo: require('../assets/hilton.png'),
  },
  {
    id: '2',
    title: 'Salonero (Eventual)',
    company: 'Sheraton',
    salary: '3.05$/h',
    date: '22/07/2025',
    logo: require('../assets/sheraton.png'),
  },
  {
    id: '3',
    title: 'Salonero (Eventual)',
    company: 'Marriot',
    salary: '3.75$/h',
    date: '20/07/2025',
    logo: require('../assets/marriot.png'),
  },
];

export default function HomeScreen() {
  const [search, setSearch] = useState('');

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              // Limpiar todos los datos del usuario
              await AsyncStorage.multiRemove([
                'userToken',
                'userEmail',
                'userId', 
                'isLoggedIn'
              ]);
              
              console.log('Sesión cerrada, redirigiendo a registro');
              router.replace('/register');
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'No se pudo cerrar sesión');
            }
          },
        },
      ]
    );
  };

  // Puedes activar el filtro si tu diseño lo permite
  // const filteredJobs = JOBS.filter(...);
  const filteredJobs = JOBS;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Image source={require('../assets/Logo_ChambApp.png')} style={styles.logoChamb} />
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <MaterialIcons name="logout" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="buscar"
          placeholderTextColor="#755B51"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Empleos</Text>
        <FlatList
          data={filteredJobs}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* <Image source={item.logo} style={styles.logoJob} /> */}
              <View style={{ flex: 1 }}>
                <Text style={styles.jobTitle}>{item.title}</Text>
                <Text style={styles.company}>{item.company}</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.salary}>{item.salary}</Text>
                  <Text style={styles.date}>{item.date}</Text>
                </View>
                <TouchableOpacity style={styles.button}>
                  <Text style={styles.buttonText}>ver más</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F0F0',
  },
  header: {
    backgroundColor: '#62483E',
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoChamb: {
    width: 120,
    height: 36,
    resizeMode: 'contain',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  searchInput: {
    backgroundColor: '#F2F0F0',
    borderRadius: 25,
    paddingHorizontal: 22,
    height: 48,
    fontSize: 17,
    color: '#4C3A34',
    borderWidth: 0,
    marginBottom: 16,
  },
  section: {
    flex: 1,
    backgroundColor: '#D2D2D2',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 8,
    paddingTop: 8,
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#4C3A34',
    fontSize: 32,
    fontWeight: '500',
    marginBottom: 14,
    marginTop: 8,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F8F8',
    borderRadius: 28,
    padding: 18,
    marginBottom: 16,
    width: 340,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  logoJob: {
    width: 60,
    height: 60,
    borderRadius: 18,
    marginRight: 18,
    backgroundColor: '#fff',
    resizeMode: 'contain',
  },
  jobTitle: {
    color: '#4C3A34',
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 2,
  },
  company: {
    color: '#4C3A34',
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
    gap: 18,
  },
  salary: {
    color: '#4C3A34',
    fontSize: 17,
    fontWeight: '500',
    marginRight: 18,
  },
  date: {
    color: '#4C3A34',
    fontSize: 17,
    fontWeight: '400',
  },
  button: {
    backgroundColor: '#57443D',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 38,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
  },
});

