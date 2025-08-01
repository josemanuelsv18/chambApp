import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { API_URL } from '../config/api';
import { useAuth } from '../hooks/useAuth';

export default function JobOfferDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  
  // Estados para la aplicación
  const [hasApplied, setHasApplied] = useState(false);
  const [isLoadingApplication, setIsLoadingApplication] = useState(true);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  type WorkerData = { id: number; [key: string]: any };
  const [workerData, setWorkerData] = useState<WorkerData | null>(null);
  
  // Nuevo estado para datos de la empresa
  const [companyData, setCompanyData] = useState<any>(null);
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);

  // Cargar datos cuando se monta el componente
  useEffect(() => {
    loadCompanyData();
    if (user && user.user_type === 'worker') {
      checkIfUserHasApplied();
    } else {
      setIsLoadingApplication(false);
    }
  }, [user, params.id]);

  // Función para cargar datos de la empresa
  const loadCompanyData = async () => {
    try {
      setIsLoadingCompany(true);
      const accessToken = await AsyncStorage.getItem('accessToken');

      const companyResponse = await fetch(`${API_URL}/companies/${params.companyId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (companyResponse.ok) {
        const company = await companyResponse.json();
        setCompanyData(company);
      } else {
        console.error('Error fetching company data');
      }
    } catch (error) {
      console.error('Error loading company data:', error);
    } finally {
      setIsLoadingCompany(false);
    }
  };

  // Función para verificar si el usuario ya aplicó
  const checkIfUserHasApplied = async () => {
    try {
      setIsLoadingApplication(true);
      const accessToken = await AsyncStorage.getItem('accessToken');

      // 1. Obtener datos del worker
      const workerResponse = await fetch(`${API_URL}/workers/by_user/${user?.user_id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!workerResponse.ok) {
        console.error('Error fetching worker data');
        return;
      }

      const workerData = await workerResponse.json();
      setWorkerData(workerData);

      // 2. Obtener aplicaciones para esta oferta de trabajo
      const applicationsResponse = await fetch(`${API_URL}/applications/by_job_offer/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (applicationsResponse.ok) {
        const applications = await applicationsResponse.json();
        
        // 3. Verificar si el worker_id está en las aplicaciones
        const hasUserApplied = applications.some(
          (app: any) => app.worker_id === workerData.id
        );
        
        setHasApplied(hasUserApplied);
      } else {
        // Si no hay aplicaciones (404), el usuario no ha aplicado
        setHasApplied(false);
      }
    } catch (error) {
      console.error('Error checking application status:', error);
    } finally {
      setIsLoadingApplication(false);
    }
  };

  // Función para renderizar estrellas
  const renderStars = (rating: string | number) => {
    const numRating = parseFloat(rating.toString());
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesome
          key={i}
          name={i <= numRating ? "star" : i - 0.5 <= numRating ? "star-half-o" : "star-o"}
          size={16}
          color="#E7E67D"
          style={{ marginRight: 2 }}
        />
      );
    }
    
    return stars;
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return 'No especificada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Función para formatear hora
  const formatTime = (timeString: string) => {
    if (!timeString) return 'No especificada';
    return timeString.slice(0, 5);
  };

  // Función para obtener el estado en español
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'in_progress': return 'En progreso';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      default: return status || 'No especificado';
    }
  };

  // Función para obtener el color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#4CAF50';
      case 'in_progress': return '#FF9800';
      case 'completed': return '#2196F3';
      case 'cancelled': return '#F44336';
      default: return '#755B51';
    }
  };

  // Función para obtener nivel de experiencia en español
  const getExperienceLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner': return 'Principiante';
      case 'intermediate': return 'Intermedio';
      case 'advanced': return 'Avanzado';
      default: return level || 'No especificado';
    }
  };

  // Función para determinar si se debe mostrar el botón de aplicar
  const shouldShowApplyButton = () => {
    return (
      params.status === 'available' &&
      user && 
      user.is_verified && 
      user.user_type === 'worker' &&
      !hasApplied &&
      !isLoadingApplication
    );
  };

  // Función para manejar la apertura del modal
  const handleApplyPress = () => {
    setApplicationMessage('');
    setShowApplicationModal(true);
  };

  // Función para enviar la aplicación
  const handleSubmitApplication = async () => {
    if (!applicationMessage.trim()) {
      Alert.alert('Error', 'Por favor escribe un mensaje para tu postulación');
      return;
    }

    if (!workerData) {
      Alert.alert('Error', 'No se pudieron obtener los datos del trabajador');
      return;
    }

    try {
      setIsSubmitting(true);
      const accessToken = await AsyncStorage.getItem('accessToken');

      const applicationData = {
        job_offer_id: parseInt(params.id as string),
        worker_id: workerData.id,
        application_status: 'pending',
        applied_at: new Date().toISOString(),
        message: applicationMessage.trim()
      };

      const response = await fetch(`${API_URL}/applications/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      if (response.ok) {
        setHasApplied(true);
        setShowApplicationModal(false);
        Alert.alert(
          'Éxito', 
          'Tu postulación ha sido enviada correctamente. La empresa revisará tu aplicación y te contactará si eres seleccionado.',
          [{ text: 'OK' }]
        );
      } else {
        const errorData = await response.text();
        console.error('Error submitting application:', errorData);
        Alert.alert('Error', 'No se pudo enviar la postulación. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      Alert.alert('Error', 'Error de conexión. Verifica tu internet e inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#62483E' }}>
      {/* Header con botón de retroceso */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/internals/HomeScreen')} style={styles.backButton}>
          <MaterialIcons name="arrow-back-ios" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del Empleo</Text>
      </View>
      
      <ScrollView style={{ flex: 1, backgroundColor: '#D2D2D2' }} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Logo de la empresa */}
          {(companyData?.logo || params.logo) && (
            <Image 
              source={{ uri: (companyData?.logo || params.logo) as string }} 
              style={styles.logo} 
            />
          )}
          
          {/* Título y empresa */}
          <Text style={styles.title}>{params.title}</Text>
          <Text style={styles.company}>
            {companyData?.company_name || params.companyName}
          </Text>

          {/* Rating de la empresa */}
          {companyData && !isLoadingCompany && (
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {renderStars(companyData.rating || "0.00")}
                <Text style={styles.ratingText}>
                  ({parseFloat(companyData.rating || "0.00").toFixed(1)})
                </Text>
              </View>
              <Text style={styles.ratingLabel}>Calificación de la empresa</Text>
            </View>
          )}

          {/* Loading de empresa */}
          {isLoadingCompany && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#57443D" />
              <Text style={styles.loadingText}>Cargando información de la empresa...</Text>
            </View>
          )}

          {/* Chips principales */}
          <View style={styles.chipRow}>
            <Text style={styles.chip}>{params.category}</Text>
            <Text style={[styles.chip, styles.statusChip, { backgroundColor: getStatusColor(params.status as string) }]}>
              {getStatusLabel(params.status as string)}
            </Text>
            <Text style={styles.chip}>Pago: {params.payment}</Text>
          </View>

          {/* Información de fechas y horarios */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <MaterialIcons name="schedule" size={18} color="#4C3A34" /> Fechas y Horarios
            </Text>
            
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Fecha de inicio</Text>
                <Text style={styles.infoValue}>{formatDate(params.startDate as string)}</Text>
              </View>
              
              {params.endDate && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Fecha de fin</Text>
                  <Text style={styles.infoValue}>{formatDate(params.endDate as string)}</Text>
                </View>
              )}
              
              {params.startTime && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Hora de inicio</Text>
                  <Text style={styles.infoValue}>{formatTime(params.startTime as string)}</Text>
                </View>
              )}
              
              {params.endTime && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Hora de fin</Text>
                  <Text style={styles.infoValue}>{formatTime(params.endTime as string)}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Información de pago y experiencia */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <MaterialIcons name="work" size={18} color="#4C3A34" /> Detalles del Trabajo
            </Text>
            
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Nivel de experiencia</Text>
                <Text style={styles.infoValue}>{getExperienceLevelLabel(params.experienceLevel as string)}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Pago total</Text>
                <Text style={[styles.infoValue, styles.paymentValue]}>{params.payment}</Text>
              </View>
              
              {params.hourlyRate && parseFloat(params.hourlyRate as string) > 0 && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Tarifa por hora</Text>
                  <Text style={[styles.infoValue, styles.paymentValue]}>${params.hourlyRate}/hora</Text>
                </View>
              )}
            </View>
          </View>

          {/* Descripción */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <MaterialIcons name="description" size={18} color="#4C3A34" /> Descripción
            </Text>
            <Text style={styles.description}>{params.description}</Text>
          </View>

          {/* Loading de verificación de aplicación */}
          {isLoadingApplication && user?.user_type === 'worker' && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#57443D" />
              <Text style={styles.loadingText}>Verificando estado de postulación...</Text>
            </View>
          )}

          {/* Botón de aplicar - Solo para workers verificados y trabajo disponible */}
          {shouldShowApplyButton() && (
            <TouchableOpacity style={styles.applyButton} onPress={handleApplyPress}>
              <MaterialIcons name="send" size={20} color="#fff" />
              <Text style={styles.applyButtonText}>Postular al trabajo</Text>
            </TouchableOpacity>
          )}

          {/* Botón deshabilitado si ya aplicó */}
          {hasApplied && params.status === 'available' && user?.user_type === 'worker' && !isLoadingApplication && (
            <View style={styles.appliedButton}>
              <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.appliedButtonText}>Ya te has postulado</Text>
            </View>
          )}

          {/* Mensaje informativo si no puede aplicar */}
          {params.status === 'available' && (!user?.is_verified || user?.user_type !== 'worker') && (
            <View style={styles.infoMessage}>
              <MaterialIcons name="info" size={18} color="#755B51" />
              <Text style={styles.infoMessageText}>
                {!user?.is_verified 
                  ? 'Completa tu perfil para postular a trabajos'
                  : user?.user_type !== 'worker' 
                    ? 'Solo los trabajadores pueden postular a empleos'
                    : 'No puedes postular a este trabajo'
                }
              </Text>
            </View>
          )}

          {/* Mensaje si el trabajo no está disponible */}
          {params.status !== 'available' && (
            <View style={styles.infoMessage}>
              <MaterialIcons name="info" size={18} color="#755B51" />
              <Text style={styles.infoMessageText}>
                Este trabajo {getStatusLabel(params.status as string).toLowerCase()} y no acepta nuevas postulaciones.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal para escribir mensaje de aplicación */}
      <Modal
        visible={showApplicationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowApplicationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Postular al trabajo</Text>
              <TouchableOpacity onPress={() => setShowApplicationModal(false)}>
                <MaterialIcons name="close" size={24} color="#4C3A34" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Escribe un mensaje explicando por qué eres el candidato ideal para este trabajo:
            </Text>

            <TextInput
              style={styles.messageInput}
              placeholder="Ej: Tengo experiencia en este tipo de trabajos y estoy disponible en las fechas indicadas..."
              value={applicationMessage}
              onChangeText={setApplicationMessage}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowApplicationModal(false)}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
                onPress={handleSubmitApplication}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <MaterialIcons name="send" size={16} color="#fff" />
                    <Text style={styles.submitButtonText}>Enviar postulación</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#62483E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 44,
    paddingBottom: 18,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 4,
  },
  backButton: {
    marginRight: 8,
    padding: 4,
    borderRadius: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  container: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 32,
    paddingBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4C3A34',
    marginBottom: 4,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  company: {
    fontSize: 16,
    color: '#755B51',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Estilos para el rating de la empresa
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#755B51',
    marginLeft: 8,
    fontWeight: '500',
  },
  ratingLabel: {
    fontSize: 12,
    color: '#755B51',
    fontWeight: '400',
  },

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
    justifyContent: 'center',
  },
  chip: {
    backgroundColor: '#F2F0F0',
    color: '#755B51',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 13,
    fontWeight: '500',
  },
  statusChip: {
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#4C3A34',
    fontSize: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#755B51',
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#4C3A34',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  paymentValue: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  description: {
    fontSize: 15,
    color: '#57443D',
    lineHeight: 22,
  },

  // Estados de loading
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F0F0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 10,
  },
  loadingText: {
    color: '#755B51',
    fontSize: 14,
    fontWeight: '500',
  },

  // Botón de aplicar
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#57443D',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 20,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    width: '100%',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Botón cuando ya aplicó
  appliedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E8',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 20,
    gap: 8,
    borderWidth: 2,
    borderColor: '#4CAF50',
    width: '100%',
  },
  appliedButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },

  // Mensajes informativos
  infoMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F0F0',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    gap: 10,
  },
  infoMessageText: {
    color: '#755B51',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },

  // Modal de aplicación
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(98, 72, 62, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4C3A34',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#755B51',
    marginBottom: 20,
    lineHeight: 22,
  },
  messageInput: {
    backgroundColor: '#F2F0F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#4C3A34',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 24,
    minHeight: 120,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#755B51',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#755B51',
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#57443D',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});