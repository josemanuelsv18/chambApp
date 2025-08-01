import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { API_URL } from '../../config/api';
import { useAuth } from '../../hooks/useAuth';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface WorkerData {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  rating: string;
  completed_jobs: number;
  balance: string;
}

interface Application {
  id: number;
  job_offer_id: number;
  worker_id: number;
  status: string;
  applied_at: string;
  message: string;
  company_response: string | null;
  responded_at: string | null;
}

interface Job {
  id: number;
  job_offer_id: number;
  worker_id: number;
  application_id: number;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Company {
  id: number;
  company_name: string;
  logo: string;
  rating: string;
}

interface JobOffer {
  id: number;
  company_id: number;
  title: string;
  category: string;
  total_payment: string;
  hourly_rate: string;
  start_date: string;
  end_date?: string;
}

export default function TrabajosScreen() {
  const { user } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [selectedTab, setSelectedTab] = useState<'applications' | 'jobs'>('applications');
  
  // Estados de datos
  const [workerData, setWorkerData] = useState<WorkerData | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<{[key: number]: Company}>({});
  const [jobOffers, setJobOffers] = useState<{[key: number]: JobOffer}>({});
  
  // Estados de loading
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Animaciones para swipe
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (user && user.user_type === 'worker') {
      loadWorkerData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadWorkerData = async () => {
    try {
      setIsLoading(true);
      const accessToken = await AsyncStorage.getItem('accessToken');

      // 1. Obtener datos del worker
      const workerResponse = await fetch(`${API_URL}/workers/by_user/${user?.user_id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!workerResponse.ok) {
        throw new Error('Error fetching worker data');
      }

      const workerData = await workerResponse.json();
      setWorkerData(workerData);

      // 2. Cargar applications y jobs en paralelo
      await Promise.all([
        loadApplications(workerData.id, accessToken ?? ''),
        loadJobs(workerData.id, accessToken ?? '')
      ]);

    } catch (error) {
      console.error('Error loading worker data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del trabajador');
    } finally {
      setIsLoading(false);
    }
  };

  const loadApplications = async (workerId: number, accessToken: string) => {
    try {
      const response = await fetch(`${API_URL}/applications/by_worker/${workerId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const applicationsData = await response.json();
        setApplications(applicationsData);
        
        // Cargar detalles de job offers para applications
        for (const app of applicationsData) {
          await loadJobOfferDetails(app.job_offer_id, accessToken);
        }
      } else if (response.status === 404) {
        setApplications([]);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      setApplications([]);
    }
  };

  const loadJobs = async (workerId: number, accessToken: string) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${workerId}/worker`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const jobsData = await response.json();
        setJobs(jobsData);
        
        // Cargar detalles de job offers para jobs
        for (const job of jobsData) {
          await loadJobOfferDetails(job.job_offer_id, accessToken);
        }
      } else if (response.status === 404) {
        setJobs([]);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      setJobs([]);
    }
  };

  const loadJobOfferDetails = async (jobOfferId: number, accessToken: string) => {
    try {
      if (jobOffers[jobOfferId]) return; // Ya cargado

      const response = await fetch(`${API_URL}/job_offers/${jobOfferId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const jobOffer = await response.json();
        setJobOffers(prev => ({ ...prev, [jobOfferId]: jobOffer }));
        
        // Cargar datos de la empresa
        await loadCompanyData(jobOffer.company_id, accessToken);
      }
    } catch (error) {
      console.error('Error loading job offer details:', error);
    }
  };

  const loadCompanyData = async (companyId: number, accessToken: string) => {
    try {
      if (companies[companyId]) return; // Ya cargado

      const response = await fetch(`${API_URL}/companies/${companyId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const company = await response.json();
        setCompanies(prev => ({ ...prev, [companyId]: company }));
      }
    } catch (error) {
      console.error('Error loading company data:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadWorkerData();
    setIsRefreshing(false);
  }, [user]);

  // Función para cambiar tab programáticamente
  const changeTab = (newTab: 'applications' | 'jobs') => {
    setSelectedTab(newTab);
  };

  // Manejador de gestos para swipe
  type GestureContext = { startX: number };

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    GestureContext
  >({
    onStart: (_, context) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      translateX.value = context.startX + event.translationX;
      
      // Calcular opacidad basada en el progreso del swipe
      const progress = Math.abs(event.translationX) / (SCREEN_WIDTH * 0.3);
      opacity.value = Math.max(0.3, 1 - progress);
    },
    onEnd: (event) => {
      const shouldSwipe = Math.abs(event.translationX) > SCREEN_WIDTH * 0.2;
      
      if (shouldSwipe) {
        if (event.translationX > 0) {
          // Swipe hacia la derecha -> ir a applications
          runOnJS(changeTab)('applications');
        } else {
          // Swipe hacia la izquierda -> ir a jobs
          runOnJS(changeTab)('jobs');
        }
      }
      
      // Volver a la posición original
      translateX.value = withSpring(0);
      opacity.value = withSpring(1);
    },
  });

  // Estilo animado para el contenido
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      opacity: opacity.value,
    };
  });

  // Funciones de filtrado
  const filteredApplications = applications.filter(app => {
    const jobOffer = jobOffers[app.job_offer_id];
    const company = jobOffer ? companies[jobOffer.company_id] : null;
    const searchLower = searchText.toLowerCase();
    
    return (
      jobOffer?.title?.toLowerCase().includes(searchLower) ||
      company?.company_name?.toLowerCase().includes(searchLower) ||
      jobOffer?.category?.toLowerCase().includes(searchLower)
    );
  });

  const filteredJobs = jobs.filter(job => {
    const jobOffer = jobOffers[job.job_offer_id];
    const company = jobOffer ? companies[jobOffer.company_id] : null;
    const searchLower = searchText.toLowerCase();
    
    return (
      job.title?.toLowerCase().includes(searchLower) ||
      jobOffer?.title?.toLowerCase().includes(searchLower) ||
      company?.company_name?.toLowerCase().includes(searchLower)
    );
  });

  // Funciones de formato
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'accepted': return 'Aceptada';
      case 'rejected': return 'Rechazada';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'accepted': return '#4CAF50';
      case 'rejected': return '#F44336';
      case 'in_progress': return '#2196F3';
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#757575';
      default: return '#755B51';
    }
  };

  if (!user || user.user_type !== 'worker') {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="work-off" size={64} color="#755B51" />
        <Text style={styles.emptyText}>Solo los trabajadores pueden ver esta sección</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#57443D" />
        <Text style={styles.loadingText}>Cargando mis trabajos...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#62483E' }}>
      <View style={styles.header}>
        <Text style={styles.logo}>ChambApp</Text>
        <TextInput
          placeholder='Buscar en "Mis trabajos"'
          placeholderTextColor="#755B51"
          style={styles.searchBar}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.containerGray}>
        <Text style={styles.title}>Mis trabajos</Text>
        
        {/* Tabs para cambiar entre Applications y Jobs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'applications' && styles.activeTab]}
            onPress={() => setSelectedTab('applications')}
          >
            <Text style={[styles.tabText, selectedTab === 'applications' && styles.activeTabText]}>
              Postulaciones ({applications.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'jobs' && styles.activeTab]}
            onPress={() => setSelectedTab('jobs')}
          >
            <Text style={[styles.tabText, selectedTab === 'jobs' && styles.activeTabText]}>
              Empleos ({jobs.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Indicador de swipe */}
        {/* <View style={styles.swipeIndicator}>
          <Text style={styles.swipeText}>
            ← Desliza para navegar →
          </Text>
        </View> */}

        {/* Contenido con gesture handler - Movido el ScrollView fuera del PanGestureHandler */}
        <ScrollView 
          style={{ width: '100%', flex: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={isRefreshing} 
              onRefresh={onRefresh}
              colors={['#57443D']} // Android
              tintColor="#57443D" // iOS
              title="Actualizando..." // iOS
            />
          }
        >
          <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View style={[{ width: '100%' }, animatedStyle]}>
              {selectedTab === 'applications' ? (
                // Sección de Applications
                filteredApplications.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <MaterialIcons name="assignment" size={64} color="#755B51" />
                    <Text style={styles.emptyText}>
                      {applications.length === 0 
                        ? 'No has hecho postulaciones aún'
                        : 'No se encontraron postulaciones'
                      }
                    </Text>
                    <Text style={styles.emptySubtext}>
                      {applications.length === 0 
                        ? 'Explora trabajos disponibles y postúlate'
                        : 'Intenta con otros términos de búsqueda'
                      }
                    </Text>
                  </View>
                ) : (
                  filteredApplications.map((application) => {
                    const jobOffer = jobOffers[application.job_offer_id];
                    const company = jobOffer ? companies[jobOffer.company_id] : null;
                    
                    return (
                      <TouchableOpacity 
                        key={`app-${application.id}`} 
                        style={styles.card}
                        onPress={() => router.push(`/ApplicationDetails?applicationId=${application.id}`)}
                      >
                        {company?.logo ? (
                          <Image source={{ uri: company.logo }} style={styles.companyLogo} />
                        ) : (
                          <View style={styles.placeholderLogo}>
                            <MaterialIcons name="business" size={32} color="#755B51" />
                          </View>
                        )}
                        <View style={{ flex: 1 }}>
                          <Text style={styles.position}>
                            {jobOffer?.title || 'Cargando...'}{'\n'}
                            <Text style={styles.companyName}>
                              {company?.company_name || 'Cargando...'}
                            </Text>
                          </Text>
                          <Text style={styles.detail}>
                            {jobOffer?.hourly_rate && parseFloat(jobOffer.hourly_rate) > 0 
                              ? `$${jobOffer.hourly_rate}/h` 
                              : `$${jobOffer?.total_payment || '0'}`
                            } • {formatDate(application.applied_at)}
                          </Text>
                          <Text style={styles.status}>
                            Estado: <Text style={{ color: getStatusColor(application.status) }}>
                              {getStatusLabel(application.status)}
                            </Text>
                          </Text>
                          {application.status === 'completed' && (
                            <TouchableOpacity style={styles.button}>
                              <Text style={styles.buttonText}>Evaluar empresa</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )
              ) : (
                // Sección de Jobs
                filteredJobs.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <MaterialIcons name="work" size={64} color="#755B51" />
                    <Text style={styles.emptyText}>
                      {jobs.length === 0 
                        ? 'No tienes empleos contratados aún'
                        : 'No se encontraron empleos'
                      }
                    </Text>
                    <Text style={styles.emptySubtext}>
                      {jobs.length === 0 
                        ? 'Cuando te contraten aparecerán aquí'
                        : 'Intenta con otros términos de búsqueda'
                      }
                    </Text>
                  </View>
                ) : (
                  filteredJobs.map((job) => {
                    const jobOffer = jobOffers[job.job_offer_id];
                    const company = jobOffer ? companies[jobOffer.company_id] : null;
                    
                    return (
                      <TouchableOpacity 
                        key={`job-${job.id}`} 
                        style={styles.card}
                        onPress={() => router.push(`/WorkerJobDetails?jobId=${job.id}`)}
                      >
                        {company?.logo ? (
                          <Image source={{ uri: company.logo }} style={styles.companyLogo} />
                        ) : (
                          <View style={styles.placeholderLogo}>
                            <MaterialIcons name="business" size={32} color="#755B51" />
                          </View>
                        )}
                        <View style={{ flex: 1 }}>
                          <Text style={styles.position}>
                            {job.title || jobOffer?.title || 'Cargando...'}{'\n'}
                            <Text style={styles.companyName}>
                              {company?.company_name || 'Cargando...'}
                            </Text>
                          </Text>
                          <Text style={styles.detail}>
                            {jobOffer?.hourly_rate && parseFloat(jobOffer.hourly_rate) > 0 
                              ? `$${jobOffer.hourly_rate}/h` 
                              : `$${jobOffer?.total_payment || '0'}`
                            } • {formatDate(job.created_at)}
                          </Text>
                          <Text style={styles.status}>
                            Estado: <Text style={{ color: getStatusColor(job.status) }}>
                              {getStatusLabel(job.status)}
                            </Text>
                          </Text>
                          {job.status === 'completed' && (
                            <TouchableOpacity style={styles.button}>
                              <Text style={styles.buttonText}>Evaluar empresa</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )
              )}
            </Animated.View>
          </PanGestureHandler>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 22,
    backgroundColor: '#62483E',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  logo: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 26,
    marginBottom: 10,
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
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F2F0F0',
    borderRadius: 25,
    padding: 4,
    marginBottom: 8,
    width: '90%',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#57443D',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#755B51',
  },
  activeTabText: {
    color: '#fff',
  },
  swipeIndicator: {
    paddingVertical: 8,
    marginBottom: 12,
  },
  swipeText: {
    fontSize: 12,
    color: '#755B51',
    fontStyle: 'italic',
    opacity: 0.7,
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
  companyLogo: {
    width: 64,
    height: 64,
    resizeMode: 'cover',
    borderRadius: 12,
    marginRight: 12,
    marginTop: 5,
  },
  placeholderLogo: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 12,
    marginTop: 5,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  position: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4C3A34',
    marginBottom: 6,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '400',
    color: '#755B51',
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D2D2D2',
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#755B51',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4C3A34',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#755B51',
    textAlign: 'center',
    lineHeight: 20,
  },
});
