import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Application {
  id: number;
  job_offer_id: number;
  worker_id: number;
  application_status: string;
  applied_at: string;
  message?: string;
  company_response?: string;
}

interface JobOffer {
  id: number;
  title: string;
  company_id: number;
  hourly_rate: number;
  start_date: string;
  status: string;
}

interface Company {
  id: number;
  company_name: string;
}

export default function TrabajosScreen() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUserApplications();
    fetchJobOffers();
    fetchCompanies();
  }, []);

  const fetchUserApplications = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const response = await fetch(`http://127.0.0.1:8000/applications/by_worker/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

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
        setJobOffers(data);
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

  const getJobOffer = (jobOfferId: number) => {
    return jobOffers.find(job => job.id === jobOfferId);
  };

  const getCompanyName = (companyId: number) => {
    const company = companies.find(c => c.id === companyId);
    return company?.company_name || 'Empresa';
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'accepted': return 'Aceptado';
      case 'rejected': return 'Rechazado';
      case 'completed': return 'Completado';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'accepted': return '#4CAF50';
      case 'rejected': return '#F44336';
      case 'completed': return '#2196F3';
      default: return '#755B51';
    }
  };

  const handleCreateReview = async (applicationId: number, jobOfferId: number) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const jobOffer = getJobOffer(jobOfferId);
      if (!jobOffer) return;

      // Crear review simple
      const reviewData = {
        job_id: applicationId, // Usando application_id como job_id por simplicidad
        reviewer_id: parseInt(userId),
        reviewee_id: jobOffer.company_id,
        reviewer_type: 'worker',
        reviewee_type: 'company',
        rating: 5,
        comment: 'Buen trabajo'
      };

      const response = await fetch('http://127.0.0.1:8000/reviews/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (response.ok) {
        Alert.alert('Éxito', 'Evaluación enviada correctamente');
      } else {
        Alert.alert('Error', 'No se pudo enviar la evaluación');
      }
    } catch (error) {
      console.error('Error creating review:', error);
      Alert.alert('Error', 'Error de conexión');
    }
  };

  const filteredApplications = applications.filter(app => {
    const jobOffer = getJobOffer(app.job_offer_id);
    if (!jobOffer) return false;
    
    const companyName = getCompanyName(jobOffer.company_id);
    return jobOffer.title.toLowerCase().includes(search.toLowerCase()) ||
           companyName.toLowerCase().includes(search.toLowerCase());
  });

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#62483E" />
        <Text style={{ marginTop: 10, color: '#62483E' }}>Cargando trabajos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../assets/Logo_ChambApp.png')} style={styles.logo} />
        <TextInput
          placeholder='Buscar en "Mis trabajos"'
          placeholderTextColor="#755B51"
          style={styles.searchBar}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.containerGray}>
        <Text style={styles.title}>Mis trabajos</Text>

        <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%' }}>
          {filteredApplications.length > 0 ? (
            filteredApplications.map((application) => {
              const jobOffer = getJobOffer(application.job_offer_id);
              if (!jobOffer) return null;

              const companyName = getCompanyName(jobOffer.company_id);
              const statusText = getStatusText(application.application_status);
              const statusColor = getStatusColor(application.application_status);

              return (
                <View key={application.id} style={styles.card}>
                  <View style={styles.companyLogoContainer}>
                    <Text style={styles.companyInitial}>
                      {companyName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.position}>
                      {jobOffer.title}{"\n"}
                      {companyName}
                    </Text>
                    <Text style={styles.detail}>
                      ${jobOffer.hourly_rate}/h     {new Date(jobOffer.start_date).toLocaleDateString()}
                    </Text>
                    <Text style={styles.status}>
                      Estado: <Text style={{ color: statusColor }}>{statusText}</Text>
                    </Text>
                    
                    {application.application_status === 'completed' && (
                      <TouchableOpacity 
                        style={styles.button}
                        onPress={() => handleCreateReview(application.id, application.job_offer_id)}
                      >
                        <Text style={styles.buttonText}>evaluar</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tienes trabajos aplicados</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#62483E',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 22,
    backgroundColor: '#62483E',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  logo: {
    width: 135,
    height: 35,
    marginBottom: 18,
    resizeMode: 'contain',
  },
  searchBar: {
    backgroundColor: '#F2F0F0',
    color: '#755B51',
    fontSize: 17,
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 10,
    width: '100%',
    marginBottom: 0,
  },
  containerGray: {
    backgroundColor: '#D2D2D2',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 10,
    paddingTop: 12,
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    color: '#4C3A34',
    fontWeight: '600',
    alignSelf: 'center',
    marginVertical: 10,
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#F2F0F0',
    borderRadius: 28,
    alignItems: 'flex-start',
    padding: 18,
    marginBottom: 18,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
  },
  companyLogoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#57443D',
    marginRight: 12,
    marginTop: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyInitial: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  position: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4C3A34',
    marginBottom: 6,
  },
  detail: {
    color: '#4C3A34',
    fontSize: 16,
    marginBottom: 2,
  },
  status: {
    color: '#4C3A34',
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#57443D',
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 34,
    paddingVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
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
