import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
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
import { API_URL } from '../../config/api';
import { useAuth } from '../../hooks/useAuth';

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

interface Company {
  id: number;
  company_name: string;
  logo: string;
  rating?: string;
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

export interface BaseJobDetailProps {
  screenType: 'jobOffer' | 'application' | 'workerJob' | 'companyJob';
  itemId: string;
  headerTitle: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  renderCustomActions?: (data: any) => React.ReactNode;
  renderAdditionalContent?: (data: any) => React.ReactNode;
}

export default function BaseJobDetailScreen({
  screenType,
  itemId,
  headerTitle,
  showBackButton = true,
  onBackPress,
  renderCustomActions,
  renderAdditionalContent
}: BaseJobDetailProps) {
  const { user } = useAuth();
  
  const [jobOffer, setJobOffer] = useState<JobOffer | null>(null);
  const [companyData, setCompanyData] = useState<Company | null>(null);
  const [applicationData, setApplicationData] = useState<Application | null>(null);
  const [jobData, setJobData] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [itemId, screenType]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const accessToken = await AsyncStorage.getItem('accessToken');

      switch (screenType) {
        case 'jobOffer':
          await loadJobOfferData(parseInt(itemId), accessToken ?? '');
          break;
        case 'application':
          await loadApplicationData(parseInt(itemId), accessToken ?? '');
          break;
        case 'workerJob':
          await loadWorkerJobData(parseInt(itemId), accessToken ?? '');
          break;
        case 'companyJob':
          await loadCompanyJobData(parseInt(itemId), accessToken ?? '');
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'No se pudieron cargar los detalles');
    } finally {
      setIsLoading(false);
    }
  };

  const loadJobOfferData = async (jobOfferId: number, accessToken: string) => {
    // Cargar job offer específico
    const jobResponse = await fetch(`${API_URL}/job_offers/${jobOfferId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (jobResponse.ok) {
      const jobOffer = await jobResponse.json();
      setJobOffer(jobOffer);
      await loadCompanyData(jobOffer.company_id, accessToken);
    }
  };

  const loadApplicationData = async (applicationId: number, accessToken: string) => {
    // Cargar application específica
    const appResponse = await fetch(`${API_URL}/applications/${applicationId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (appResponse.ok) {
      const application = await appResponse.json();
      setApplicationData(application);
      
      // Cargar job offer relacionado
      const jobResponse = await fetch(`${API_URL}/job_offers/${application.job_offer_id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (jobResponse.ok) {
        const jobOffer = await jobResponse.json();
        setJobOffer(jobOffer);
        await loadCompanyData(jobOffer.company_id, accessToken);
      }
    }
  };

  const loadWorkerJobData = async (jobId: number, accessToken: string) => {
    // Cargar job específico
    const jobResponse = await fetch(`${API_URL}/jobs/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (jobResponse.ok) {
      const job = await jobResponse.json();
      setJobData(job);
      
      // Cargar job offer relacionado
      const jobOfferResponse = await fetch(`${API_URL}/job_offers/${job.job_offer_id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (jobOfferResponse.ok) {
        const jobOffer = await jobOfferResponse.json();
        setJobOffer(jobOffer);
        await loadCompanyData(jobOffer.company_id, accessToken);
      }
    }
  };

  const loadCompanyJobData = async (jobOfferId: number, accessToken: string) => {
    // Similar a loadJobOfferData pero para company context
    await loadJobOfferData(jobOfferId, accessToken);
  };

  const loadCompanyData = async (companyId: number, accessToken: string) => {
    try {
      const response = await fetch(`${API_URL}/companies/${companyId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const company = await response.json();
        setCompanyData(company);
      }
    } catch (error) {
      console.error('Error loading company data:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  }, [itemId, screenType]);

  // Funciones de formato compartidas
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible';
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
      case 'available': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'accepted': return '#4CAF50';
      case 'rejected': return '#F44336';
      case 'in_progress': return '#2196F3';
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#757575';
      default: return '#755B51';
    }
  };

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#57443D" />
        <Text style={styles.loadingText}>Cargando detalles...</Text>
      </View>
    );
  }

  if (!jobOffer) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="error" size={64} color="#755B51" />
        <Text style={styles.emptyText}>No se pudieron cargar los detalles</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Preparar datos para componentes personalizados
  const contextData = {
    jobOffer,
    companyData,
    applicationData,
    jobData,
    user,
    formatDate,
    formatTime,
    getCategoryLabel,
    getExperienceLevelLabel,
    getStatusLabel,
    getStatusColor,
    loadData
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#62483E' }}>
      {/* Header */}
      <View style={styles.header}>
        {showBackButton && (
          <TouchableOpacity onPress={handleBackPress} style={styles.backIcon}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        )}
        <Text style={styles.logo}>{headerTitle}</Text>
      </View>

      <View style={styles.containerGray}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        >
          {/* Información básica del trabajo */}
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
                <Text style={styles.jobTitle}>
                  {jobData?.title || jobOffer.title}
                </Text>
                <Text style={styles.companyName}>{companyData?.company_name}</Text>
                
                {/* Mostrar estado específico según el tipo */}
                {screenType === 'application' && applicationData && (
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(applicationData.status) }]}>
                    <Text style={styles.statusText}>{getStatusLabel(applicationData.status)}</Text>
                  </View>
                )}
                
                {screenType === 'workerJob' && jobData && (
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(jobData.status) }]}>
                    <Text style={styles.statusText}>{getStatusLabel(jobData.status)}</Text>
                  </View>
                )}
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
              <View style={styles.detailRow}>
                <MaterialIcons name="school" size={20} color="#57443D" />
                <Text style={styles.detailText}>
                  {getExperienceLevelLabel(jobOffer.experience_level)}
                </Text>
              </View>
            </View>
          </View>

          {/* Información específica por tipo de pantalla */}
          {screenType === 'application' && applicationData && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Detalles de tu Aplicación</Text>
              <View style={styles.applicationInfo}>
                <Text style={styles.infoLabel}>Fecha de aplicación:</Text>
                <Text style={styles.infoValue}>{formatDate(applicationData.applied_at)}</Text>
              </View>
              <View style={styles.applicationInfo}>
                <Text style={styles.infoLabel}>Tu mensaje:</Text>
                <Text style={styles.messageText}>{applicationData.message}</Text>
              </View>
              {applicationData.company_response && (
                <View style={styles.applicationInfo}>
                  <Text style={styles.infoLabel}>Respuesta de la empresa:</Text>
                  <Text style={styles.messageText}>{applicationData.company_response}</Text>
                </View>
              )}
            </View>
          )}

          {screenType === 'workerJob' && jobData && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Estado del Trabajo</Text>
              <View style={styles.applicationInfo}>
                <Text style={styles.infoLabel}>Fecha de contratación:</Text>
                <Text style={styles.infoValue}>{formatDate(jobData.created_at)}</Text>
              </View>
              <View style={styles.applicationInfo}>
                <Text style={styles.infoLabel}>Estado actual:</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(jobData.status) }]}>
                  <Text style={styles.statusText}>{getStatusLabel(jobData.status)}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Contenido adicional personalizado */}
          {renderAdditionalContent && renderAdditionalContent(contextData)}

          {/* Acciones personalizadas */}
          {renderCustomActions && renderCustomActions(contextData)}
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
    marginBottom: 8,
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
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4C3A34',
    marginBottom: 12,
  },
  applicationInfo: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#755B51',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#4C3A34',
  },
  messageText: {
    fontSize: 14,
    color: '#4C3A34',
    lineHeight: 18,
    backgroundColor: '#F8F6F6',
    padding: 12,
    borderRadius: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
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
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4C3A34',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
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