import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Linking,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import BaseJobDetailScreen from '../components/shared/BaseJobDetailScreen';
import { API_URL } from '../config/api';

export default function WorkerJobDetails() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const statusCheckRef = useRef<any>(null);
  const lastCheckRef = useRef<string>(''); // Para evitar múltiples verificaciones
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [loadingContact, setLoadingContact] = useState(false);
  const [companyContactInfo, setCompanyContactInfo] = useState<{
    phone?: string;
    email?: string;
    company_name?: string;
  } | null>(null);

  // Función para verificar y actualizar el estado automáticamente
  const checkAndUpdateJobStatus = async (jobData: any, jobOffer: any, loadData: () => void) => {
    if (!jobData || !jobOffer) return;

    // Evitar verificaciones si el job ya está en un estado final
    if (jobData.status === 'completed' || jobData.status === 'cancelled') {
      return;
    }

    // Crear una clave única para evitar múltiples verificaciones del mismo estado
    const checkKey = `${jobData.id}-${jobData.status}-${jobOffer.start_date}-${jobOffer.end_date}`;
    if (lastCheckRef.current === checkKey) {
      return; // Ya se verificó este estado
    }

    const now = new Date();
    const startDate = new Date(jobOffer.start_date);
    const endDate = new Date(jobOffer.end_date);
    
    let newStatus = jobData.status;
    
    // Determinar el estado que debería tener basado en las fechas
    if (now >= startDate && now <= endDate && jobData.status === 'pending') {
      newStatus = 'running';
    } else if (now > endDate && (jobData.status === 'pending' || jobData.status === 'running')) {
      newStatus = 'completed';
    }
    
    // Solo actualizar si el estado cambió
    if (newStatus !== jobData.status) {
      console.log(`Updating job status from ${jobData.status} to ${newStatus} based on dates`);
      lastCheckRef.current = checkKey; // Marcar como verificado
      
      try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        
        const response = await fetch(`${API_URL}/jobs/${jobData.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: newStatus
          }),
        });

        if (response.ok) {
          console.log(`Job status updated from ${jobData.status} to ${newStatus}`);
          // Recargar los datos para reflejar el cambio
          await loadData();
        } else {
          console.error('Error updating job status:', response.status);
        }
      } catch (error) {
        console.error('Error updating job status:', error);
      }
    } else {
      lastCheckRef.current = checkKey; // Marcar como verificado aunque no haya cambio
    }
  };

  const renderCustomActions = (data: any) => {
    const { jobData, jobOffer, loadData, companyData } = data;
    
    if (!jobData || !jobOffer) return null;

    // Guardar la referencia para poder hacer la verificación de estado
    statusCheckRef.current = { jobData, jobOffer, loadData };

    return (
      <View style={styles.actionsContainer}>
        {/* Información sobre el estado actual */}
        <View style={styles.statusInfo}>
          {jobData.status === 'pending' && (
            <View style={styles.infoRow}>
              <MaterialIcons name="schedule" size={20} color="#FF9800" />
              <Text style={styles.infoText}>
                El trabajo iniciará automáticamente el {data.formatDate(jobOffer.start_date)}
              </Text>
            </View>
          )}
          
          {jobData.status === 'running' && (
            <View style={styles.infoRow}>
              <MaterialIcons name="play-circle-filled" size={20} color="#4CAF50" />
              <Text style={styles.infoText}>
                Trabajo en progreso. Finalizará automáticamente el {data.formatDate(jobOffer.end_date)}
              </Text>
            </View>
          )}
          
          {jobData.status === 'completed' && (
            <View style={styles.infoRow}>
              <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.infoText}>
                Trabajo completado exitosamente
              </Text>
            </View>
          )}
          
          {jobData.status === 'cancelled' && (
            <View style={styles.infoRow}>
              <MaterialIcons name="cancel" size={20} color="#F44336" />
              <Text style={styles.infoText}>
                Trabajo cancelado
              </Text>
            </View>
          )}
        </View>

        {/* Botón para evaluar empresa (solo si está completado) */}
        {jobData.status === 'completed' && (
          <TouchableOpacity 
            style={styles.rateCompanyButton}
            onPress={() => handleRateCompany(jobData.id)}
          >
            <MaterialIcons name="star" size={20} color="#fff" />
            <Text style={styles.rateCompanyText}>Evaluar Empresa</Text>
          </TouchableOpacity>
        )}

        {/* Botón de contacto (siempre visible excepto si está cancelado) */}
        {jobData.status !== 'cancelled' && (
          <TouchableOpacity 
            style={[styles.contactButton, loadingContact && styles.disabledButton]}
            onPress={() => handleContactCompany(companyData)}
            disabled={loadingContact}
          >
            <MaterialIcons name="message" size={20} color={loadingContact ? "#999" : "#57443D"} />
            <Text style={[styles.contactText, loadingContact && styles.disabledText]}>
              {loadingContact ? 'Cargando...' : 'Contactar Empresa'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Botón para cancelar trabajo (solo si no está completado o ya cancelado) */}
        {jobData.status !== 'completed' && jobData.status !== 'cancelled' && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => handleCancelJob(jobData.id, loadData)}
          >
            <MaterialIcons name="cancel" size={20} color="#fff" />
            <Text style={styles.cancelText}>Cancelar Trabajo</Text>
          </TouchableOpacity>
        )}

        {/* Modal de contacto */}
        <Modal
          visible={contactModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setContactModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Contactar Empresa</Text>
                <TouchableOpacity 
                  onPress={() => setContactModalVisible(false)}
                  style={styles.closeButton}
                >
                  <MaterialIcons name="close" size={24} color="#757575" />
                </TouchableOpacity>
              </View>

              {loadingContact ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Cargando información de contacto...</Text>
                </View>
              ) : companyContactInfo ? (
                <View style={styles.contactInfo}>
                  <Text style={styles.companyNameModal}>
                    {companyContactInfo.company_name}
                  </Text>

                  {/* Información de teléfono */}
                  {companyContactInfo.phone && (
                    <View style={styles.contactItem}>
                      <View style={styles.contactHeader}>
                        <MaterialIcons name="phone" size={20} color="#57443D" />
                        <Text style={styles.contactLabel}>Teléfono</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.contactValue}
                        onPress={() => showPhoneOptions(companyContactInfo.phone!)}
                      >
                        <Text style={styles.contactValueText}>
                          {companyContactInfo.phone}
                        </Text>
                        <MaterialIcons name="chevron-right" size={20} color="#757575" />
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Información de email */}
                  {companyContactInfo.email && (
                    <View style={styles.contactItem}>
                      <View style={styles.contactHeader}>
                        <MaterialIcons name="email" size={20} color="#57443D" />
                        <Text style={styles.contactLabel}>Email</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.contactValue}
                        onPress={() => openEmailApp(companyContactInfo.email!)}
                      >
                        <Text style={styles.contactValueText}>
                          {companyContactInfo.email}
                        </Text>
                        <MaterialIcons name="chevron-right" size={20} color="#757575" />
                      </TouchableOpacity>
                    </View>
                  )}

                  {(!companyContactInfo.phone && !companyContactInfo.email) && (
                    <View style={styles.noContactInfo}>
                      <MaterialIcons name="info" size={24} color="#757575" />
                      <Text style={styles.noContactText}>
                        No hay información de contacto disponible
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.noContactInfo}>
                  <MaterialIcons name="error" size={24} color="#757575" />
                  <Text style={styles.noContactText}>
                    Error al cargar la información de contacto
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  // MÉTODO ÓPTIMO: useEffect con dependencias específicas y memoización
  useEffect(() => {
    if (statusCheckRef.current) {
      const { jobData, jobOffer, loadData } = statusCheckRef.current;
      checkAndUpdateJobStatus(jobData, jobOffer, loadData);
    }
  }, [
    statusCheckRef.current?.jobData?.id,           // Solo cuando cambie el job
    statusCheckRef.current?.jobData?.status,      // Solo cuando cambie el status
    statusCheckRef.current?.jobOffer?.start_date, // Solo cuando cambie fecha inicio
    statusCheckRef.current?.jobOffer?.end_date    // Solo cuando cambie fecha fin
  ]);

  // Reset del último check cuando cambia el job
  useEffect(() => {
    lastCheckRef.current = '';
  }, [jobId]);

  const handleCancelJob = async (jobId: number, loadData: () => void) => {
    Alert.alert(
      'Cancelar Trabajo',
      '¿Estás seguro de que deseas cancelar este trabajo? Esta acción no se puede deshacer y puede afectar tu calificación.',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Sí, cancelar', 
          style: 'destructive',
          onPress: async () => {
            try {
              const accessToken = await AsyncStorage.getItem('accessToken');
              
              const response = await fetch(`${API_URL}/jobs/${jobId}`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  status: 'cancelled'
                }),
              });

              if (response.ok) {
                Alert.alert('Éxito', 'El trabajo ha sido cancelado correctamente');
                await loadData(); // Recargar datos
              } else {
                Alert.alert('Error', 'No se pudo cancelar el trabajo');
              }
            } catch (error) {
              console.error('Error cancelling job:', error);
              Alert.alert('Error', 'Error de conexión');
            }
          }
        }
      ]
    );
  };

  const handleRateCompany = (jobId: number) => {
    console.log('Evaluar empresa para trabajo:', jobId);
    Alert.alert('Próximamente', 'La función de evaluación estará disponible pronto');
  };

  const handleContactCompany = async (companyData: any) => {
    if (!companyData || loadingContact) {
      Alert.alert('Error', 'No se pudo obtener la información de la empresa');
      return;
    }

    setLoadingContact(true);
    setContactModalVisible(true); // Abrir modal inmediatamente con loading

    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      
      console.log('Loading company data for ID:', companyData.id);
      
      // 1. Primero obtener información completa de la empresa para conseguir user_id
      const companyResponse = await fetch(`${API_URL}/companies/${companyData.id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!companyResponse.ok) {
        console.error('Company response not OK:', companyResponse.status);
        Alert.alert('Error', 'No se pudo obtener la información de la empresa');
        setContactModalVisible(false);
        return;
      }

      const fullCompanyData = await companyResponse.json();
      console.log('Company data loaded:', fullCompanyData);
      
      // 2. Luego obtener información del usuario para conseguir teléfono y email
      const userResponse = await fetch(`${API_URL}/users/${fullCompanyData.user_id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!userResponse.ok) {
        console.error('User response not OK:', userResponse.status);
        Alert.alert('Error', 'No se pudo obtener la información de contacto');
        setContactModalVisible(false);
        return;
      }

      const userData = await userResponse.json();
      console.log('User data loaded:', userData);
      
      // 3. Establecer la información de contacto combinando ambas respuestas
      setCompanyContactInfo({
        phone: userData.phone,
        email: userData.email,
        company_name: fullCompanyData.company_name
      });
      
    } catch (error) {
      console.error('Error getting company contact info:', error);
      Alert.alert('Error', 'Error de conexión');
      setContactModalVisible(false);
    } finally {
      setLoadingContact(false);
    }
  };

  const showPhoneOptions = (phoneNumber: string) => {
    Alert.alert(
      'Contactar por teléfono',
      `¿Cómo deseas contactar al ${phoneNumber}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Llamada', 
          onPress: () => makePhoneCall(phoneNumber)
        },
        { 
          text: 'SMS', 
          onPress: () => sendSMS(phoneNumber)
        },
        { 
          text: 'WhatsApp', 
          onPress: () => openWhatsApp(phoneNumber)
        }
      ]
    );
  };

  const makePhoneCall = (phoneNumber: string) => {
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Error', 'No se puede hacer llamadas en este dispositivo');
        }
      })
      .catch((error) => {
        console.error('Error making phone call:', error);
        Alert.alert('Error', 'No se pudo realizar la llamada');
      });
  };

  const sendSMS = (phoneNumber: string) => {
    const url = Platform.OS === 'ios' 
      ? `sms:${phoneNumber}` 
      : `sms:${phoneNumber}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Error', 'No se puede enviar SMS en este dispositivo');
        }
      })
      .catch((error) => {
        console.error('Error sending SMS:', error);
        Alert.alert('Error', 'No se pudo abrir la aplicación de SMS');
      });
  };

  const openWhatsApp = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    const url = `whatsapp://send?phone=${cleanNumber}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Error', 'WhatsApp no está instalado en este dispositivo');
        }
      })
      .catch((error) => {
        console.error('Error opening WhatsApp:', error);
        Alert.alert('Error', 'No se pudo abrir WhatsApp');
      });
  };

  const openEmailApp = (email: string) => {
    const subject = encodeURIComponent('Consulta sobre trabajo - ChambApp');
    const body = encodeURIComponent('Hola,\n\nMe gustaría hacer una consulta sobre el trabajo...\n\nSaludos.');
    const url = `mailto:${email}?subject=${subject}&body=${body}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Error', 'No hay una aplicación de correo configurada');
        }
      })
      .catch((error) => {
        console.error('Error opening email app:', error);
        Alert.alert('Error', 'No se pudo abrir la aplicación de correo');
      });
  };

  if (!jobId) {
    return null;
  }

  return (
    <BaseJobDetailScreen
      screenType="workerJob"
      itemId={jobId}
      headerTitle="Detalles del Trabajo"
      renderCustomActions={renderCustomActions}
    />
  );
}

const styles = StyleSheet.create({
  actionsContainer: {
    gap: 16,
    marginTop: 20,
  },
  statusInfo: {
    backgroundColor: '#F8F6F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#4C3A34',
    lineHeight: 18,
  },
  rateCompanyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9800',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    gap: 8,
  },
  rateCompanyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F0F0',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    gap: 8,
    borderWidth: 2,
    borderColor: '#57443D',
  },
  contactText: {
    color: '#57443D',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    gap: 8,
  },
  cancelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Estilos del modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4C3A34',
  },
  closeButton: {
    padding: 4,
  },
  contactInfo: {
    padding: 20,
  },
  companyNameModal: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4C3A34',
    marginBottom: 20,
    textAlign: 'center',
  },
  contactItem: {
    marginBottom: 20,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#57443D',
  },
  contactValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F6F6',
    padding: 12,
    borderRadius: 12,
  },
  contactValueText: {
    fontSize: 16,
    color: '#4C3A34',
    flex: 1,
  },
  noContactInfo: {
    alignItems: 'center',
    padding: 20,
    gap: 8,
  },
  noContactText: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#755B51',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledText: {
    color: '#999',
  },
});