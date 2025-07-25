import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface JobOffer {
  id: number;
  title: string;
  company_id: number;
  description: string;
  location: string;
  hourly_rate: number;
  start_date: string;
  end_date: string;
  required_workers: number;
  category: string;
  status: string;
}

interface Company {
  id: number;
  company_name: string;
  logo?: string;
}

export default function HomeScreen() {
  const [search, setSearch] = useState('');
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchJobOffers();
    fetchCompanies();
  }, []);

  const fetchJobOffers = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/job_offers/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Job offers fetched:', data.length);
        setJobOffers(data.filter((job: JobOffer) => job.status === 'open'));
      }
    } catch (error) {
      console.error('Error fetching job offers:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/companies/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCompanyName = (companyId: number) => {
    const company = companies.find(c => c.id === companyId);
    return company?.company_name || 'Empresa';
  };

  const handleApplyJob = async (jobOfferId: number) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'Debes iniciar sesión para aplicar');
        return;
      }

      // Crear aplicación
      const applicationData = {
        job_offer_id: jobOfferId,
        worker_id: parseInt(userId),
        application_status: 'pending',
        applied_at: new Date().toISOString(),
        message: 'Interesado en el puesto'
      };

      const response = await fetch('http://127.0.0.1:8000/applications/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      if (response.ok) {
        Alert.alert('Éxito', 'Aplicación enviada correctamente');
      } else {
        Alert.alert('Error', 'No se pudo enviar la aplicación');
      }
    } catch (error) {
      console.error('Error applying to job:', error);
      Alert.alert('Error', 'Error de conexión');
    }
  };

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
              await AsyncStorage.multiRemove([
                'userToken',
                'userEmail',
                'userId', 
                'isLoggedIn'
              ]);
              
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

  const filteredJobs = jobOffers.filter(job => 
    job.title.toLowerCase().includes(search.toLowerCase()) ||
    getCompanyName(job.company_id).toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#62483E" />
        <Text style={{ marginTop: 10, color: '#62483E' }}>Cargando empleos...</Text>
      </View>
    );
  }

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
          placeholder="buscar empleos..."
          placeholderTextColor="#755B51"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Empleos Disponibles</Text>
        <FlatList
          data={filteredJobs}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.jobTitle}>{item.title}</Text>
                <Text style={styles.company}>{getCompanyName(item.company_id)}</Text>
                <Text style={styles.description} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={styles.infoRow}>
                  <Text style={styles.salary}>${item.hourly_rate}/h</Text>
                  <Text style={styles.location}>{item.location}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.date}>
                    {new Date(item.start_date).toLocaleDateString()}
                  </Text>
                  <Text style={styles.workers}>
                    {item.required_workers} personas
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.button}
                  onPress={() => handleApplyJob(item.id)}
                >
                  <Text style={styles.buttonText}>Aplicar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay empleos disponibles</Text>
            </View>
          }
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
    marginBottom: 6,
  },
  description: {
    color: '#755B51',
    fontSize: 14,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  salary: {
    color: '#4C3A34',
    fontSize: 17,
    fontWeight: '500',
  },
  location: {
    color: '#4C3A34',
    fontSize: 15,
  },
  date: {
    color: '#755B51',
    fontSize: 14,
  },
  workers: {
    color: '#755B51',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#57443D',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 38,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#755B51',
    fontSize: 16,
  },
});

