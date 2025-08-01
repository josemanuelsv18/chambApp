import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { API_URL } from '../config/api';
import { useAuth } from '../hooks/useAuth';

interface JobOffer {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  category: string;
  location: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  required_workers: number;
  hourly_rate: number;
  total_payment: number;
  experience_level: string;
  status: string;
  company_id: number;
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

interface Worker {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  profile_picture?: string;
  bio?: string;
  experience_level: string;
  location: string;
  rating: string;
  completed_jobs: number;
  balance: string;
}

interface Company {
  id: number;
  company_name: string;
  logo: string;
}

export default function JobDetailsScreen() {
  const { user } = useAuth();
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  
  const [jobOffer, setJobOffer] = useState<JobOffer | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [workers, setWorkers] = useState<{[key: number]: Worker}>({});
  const [companyData, setCompanyData] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (jobId && user && user.user_type === 'company') {
      loadJobDetails();
    } else {
      setIsLoading(false);
    }
  }, [jobId, user]);

  const loadJobDetails = async () => {
    try {
      setIsLoading(true);
      const accessToken = await AsyncStorage.getItem('accessToken');

      // 1. Obtener datos de la empresa
      const companyResponse = await fetch(`${API_URL}/companies/by_user/${user?.user_id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!companyResponse.ok) {
        throw new Error('Error fetching company data');
      }

      const company = await companyResponse.json();
      setCompanyData(company);

      // 2. Obtener detalles del trabajo específico
      const jobResponse = await fetch(`${API_URL}/job_offers/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!jobResponse.ok) {
        throw new Error('Error fetching job details');
      }

      const jobData = await jobResponse.json();
      setJobOffer(jobData);

      // 3. Obtener aplicaciones para este trabajo
      await loadApplications(parseInt(jobId), accessToken ?? '');

    } catch (error) {
      console.error('Error loading job details:', error);
      Alert.alert('Error', 'No se pudieron cargar los detalles del trabajo');
    } finally {
      setIsLoading(false);
    }
  };

  const loadApplications = async (jobOfferId: number, accessToken: string) => {
    try {
      const response = await fetch(`${API_URL}/applications/by_job_offer/${jobOfferId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const applicationsData = await response.json();
        setApplications(applicationsData);
        
        // Cargar datos de cada worker que aplicó
        for (const app of applicationsData) {
          await loadWorkerData(app.worker_id, accessToken);
        }
      } else if (response.status === 404) {
        setApplications([]);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      setApplications([]);
    }
  };

  const loadWorkerData = async (workerId: number, accessToken: string) => {
    try {
      if (workers[workerId]) return; // Ya cargado

      const response = await fetch(`${API_URL}/workers/${workerId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const worker = await response.json();
        setWorkers(prev => ({ ...prev, [workerId]: worker }));
      }
    } catch (error) {
      console.error('Error loading worker data:', error);
    }
  };

  const handleApplicationResponse = async (applicationId: number, action: 'accept' | 'reject') => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      
      // 1. Actualizar el estado de la aplicación
      const response = await fetch(`${API_URL}/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          application_status: action === 'accept' ? 'accepted' : 'rejected',
          company_response: action === 'accept' 
            ? 'Tu aplicación ha sido aceptada. Te contactaremos pronto.' 
            : 'Gracias por tu interés. En esta ocasión hemos seleccionado otros candidatos.'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        Alert.alert('Error', 'No se pudo procesar la respuesta');
        return;
      }

      // 2. Si la aplicación fue aceptada, crear un job automáticamente
      if (action === 'accept') {
        const application = applications.find(app => app.id === applicationId);
        
        if (application && jobOffer) {
          const jobData = {
            job_offer_id: jobOffer.id,
            worker_id: application.worker_id,
            application_id: applicationId,
            title: jobOffer.title,
            status: "pending"
          };

          const jobResponse = await fetch(`${API_URL}/jobs/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(jobData),
          });

          if (!jobResponse.ok) {
            const jobErrorData = await jobResponse.json();
            console.error('Error creating job:', jobErrorData);
            Alert.alert(
              'Advertencia', 
              'La aplicación fue aceptada pero hubo un problema creando el trabajo. Por favor contacta al soporte.'
            );
            return;
          } else {
            console.log('Job created successfully for accepted application');
          }
        }
      }

      // 3. Mostrar mensaje de éxito
      Alert.alert(
        'Éxito', 
        action === 'accept' 
          ? 'Aplicación aceptada y trabajo creado correctamente'
          : 'Aplicación rechazada correctamente'
      );

      // 4. Recargar aplicaciones para reflejar los cambios
      if (jobId) {
        await loadApplications(parseInt(jobId), accessToken ?? '');
      }

    } catch (error) {
      console.error('Error responding to application:', error);
      Alert.alert('Error', 'Error de conexión');
    }
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadJobDetails();
    setIsRefreshing(false);
  }, [jobId, user]);

  // Funciones de formato
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'accepted': return 'Aceptada';
      case 'rejected': return 'Rechazada';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'accepted': return '#4CAF50';
      case 'rejected': return '#F44336';
      default: return '#755B51';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'events': return 'Eventos';
      case 'catering': return 'Catering';
      case 'cleaning': return 'Limpieza';
      case 'delivery': return 'Delivery';
      case 'other': return 'Otros';
      default: return category;
    }
  };

  const getExperienceLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner': return 'Principiante';
      case 'intermediate': return 'Intermedio';
      case 'advanced': return 'Avanzado';
      default: return level;
    }
  };

  const renderStars = (rating: string) => {
    const numRating = parseFloat(rating);
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <MaterialIcons
          key={i}
          name={i <= numRating ? 'star' : 'star-border'}
          size={16}
          color="#FFD700"
        />
      );
    }
    
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  if (!user || user.user_type !== 'company') {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="business-center" size={64} color="#755B51" />
        <Text style={styles.emptyText}>Solo las empresas pueden ver esta sección</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#57443D" />
        <Text style={styles.loadingText}>Cargando detalles del trabajo...</Text>
      </View>
    );
  }

  if (!jobOffer) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="error" size={64} color="#755B51" />
        <Text style={styles.emptyText}>No se pudo cargar el trabajo</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#62483E' }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.logo}>Detalles del Trabajo</Text>
      </View>

      <View style={styles.containerGray}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        >
          {/* Información del trabajo */}
          <View style={styles.jobInfoCard}>
            <View style={styles.jobHeader}>
              {companyData?.logo ? (
                <Image source={{ uri: companyData.logo }} style={styles.companyLogo} />
              ) : (
                <View style={styles.placeholderLogo}>
                  <MaterialIcons name="business" size={32} color="#755B51" />
                </View>
              )}
              <View style={styles.jobHeaderText}>
                <Text style={styles.jobTitle}>{jobOffer.title}</Text>
                <Text style={styles.companyName}>{companyData?.company_name}</Text>
              </View>
            </View>

            <Text style={styles.jobDescription}>{jobOffer.description}</Text>

            <View style={styles.jobDetailsGrid}>
              <View style={styles.detailRow}>
                <MaterialIcons name="location-on" size={20} color="#57443D" />
                <Text style={styles.detailText}>{jobOffer.location}</Text>
              </View>
              <View style={styles.detailRow}>
                <MaterialIcons name="category" size={20} color="#57443D" />
                <Text style={styles.detailText}>{getCategoryLabel(jobOffer.category)}</Text>
              </View>
              <View style={styles.detailRow}>
                <MaterialIcons name="date-range" size={20} color="#57443D" />
                <Text style={styles.detailText}>
                  {formatDate(jobOffer.start_date)} - {formatDate(jobOffer.end_date)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <MaterialIcons name="access-time" size={20} color="#57443D" />
                <Text style={styles.detailText}>
                  {formatTime(jobOffer.start_time)} - {formatTime(jobOffer.end_time)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <MaterialIcons name="people" size={20} color="#57443D" />
                <Text style={styles.detailText}>
                  {jobOffer.required_workers} trabajador{jobOffer.required_workers !== 1 ? 'es' : ''}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <MaterialIcons name="attach-money" size={20} color="#57443D" />
                <Text style={styles.detailText}>
                  {jobOffer.hourly_rate > 0 
                    ? `$${jobOffer.hourly_rate}/h` 
                    : `$${jobOffer.total_payment} total`
                  }
                </Text>
              </View>
            </View>
          </View>

          {/* Aplicaciones */}
          <Text style={styles.sectionTitle}>
            Aplicaciones ({applications.length})
          </Text>

          {applications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="assignment" size={64} color="#755B51" />
              <Text style={styles.emptyText}>No hay aplicaciones aún</Text>
              <Text style={styles.emptySubtext}>
                Los trabajadores interesados aparecerán aquí
              </Text>
            </View>
          ) : (
            applications.map((application) => {
              const worker = workers[application.worker_id];
              
              if (!worker) {
                return (
                  <View key={application.id} style={styles.applicationCard}>
                    <ActivityIndicator size="small" color="#57443D" />
                    <Text style={styles.loadingText}>Cargando trabajador...</Text>
                  </View>
                );
              }

              return (
                <View key={application.id} style={styles.applicationCard}>
                  <View style={styles.workerHeader}>
                    {worker.profile_picture ? (
                      <Image source={{ uri: worker.profile_picture }} style={styles.workerPhoto} />
                    ) : (
                      <View style={styles.placeholderPhoto}>
                        <MaterialIcons name="person" size={32} color="#755B51" />
                      </View>
                    )}
                    <View style={styles.workerInfo}>
                      <Text style={styles.workerName}>
                        {worker.first_name} {worker.last_name}
                      </Text>
                      <Text style={styles.workerExperience}>
                        {getExperienceLevelLabel(worker.experience_level)}
                      </Text>
                      <View style={styles.ratingRow}>
                        {renderStars(worker.rating)}
                        <Text style={styles.ratingText}>
                          ({worker.rating}) • {worker.completed_jobs} trabajos
                        </Text>
                      </View>
                    </View>
                  </View>

                  {worker.bio && (
                    <Text style={styles.workerBio} numberOfLines={2}>
                      {worker.bio}
                    </Text>
                  )}

                  <View style={styles.messageContainer}>
                    <Text style={styles.messageLabel}>Mensaje de aplicación:</Text>
                    <Text style={styles.messageText}>{application.message}</Text>
                  </View>

                  <View style={styles.applicationFooter}>
                    <View style={styles.statusContainer}>
                      <Text style={styles.appliedDate}>
                        Aplicó: {formatDate(application.applied_at)}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) }]}>
                        <Text style={styles.statusText}>{getStatusLabel(application.status)}</Text>
                      </View>
                    </View>

                    {application.status === 'pending' && (
                      <View style={styles.actionButtons}>
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.rejectButton]}
                          onPress={() => handleApplicationResponse(application.id, 'reject')}
                        >
                          <MaterialIcons name="close" size={20} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.acceptButton]}
                          onPress={() => handleApplicationResponse(application.id, 'accept')}
                        >
                          <MaterialIcons name="check" size={20} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          )}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
  },
  backIcon: {
    marginRight: 12,
    padding: 4,
  },
  logo: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    flex: 1,
  },
  containerGray: {
    backgroundColor: '#D2D2D2',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  jobInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  companyLogo: {
    width: 60,
    height: 60,
    borderRadius: 15,
    marginRight: 16,
  },
  placeholderLogo: {
    width: 60,
    height: 60,
    borderRadius: 15,
    marginRight: 16,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobHeaderText: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4C3A34',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 16,
    color: '#755B51',
  },
  jobDescription: {
    fontSize: 16,
    color: '#4C3A34',
    lineHeight: 22,
    marginBottom: 20,
  },
  jobDetailsGrid: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#4C3A34',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4C3A34',
    marginBottom: 16,
  },
  applicationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  workerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  workerPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  placeholderPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4C3A34',
    marginBottom: 2,
  },
  workerExperience: {
    fontSize: 14,
    color: '#755B51',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  ratingText: {
    fontSize: 12,
    color: '#755B51',
  },
  workerBio: {
    fontSize: 14,
    color: '#4C3A34',
    lineHeight: 18,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  messageContainer: {
    backgroundColor: '#F8F6F6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#755B51',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#4C3A34',
    lineHeight: 18,
  },
  applicationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flex: 1,
  },
  appliedDate: {
    fontSize: 12,
    color: '#755B51',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
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
  backButton: {
    backgroundColor: '#57443D',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});