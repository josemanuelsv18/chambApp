import { API_URL } from '@/config/api';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import {
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
import CompanyProtection from '../../components/CompanyProtection';

export default function CompanyScreen() {
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'events',
    location: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    required_workers: '',
    hourly_rate: '',
    total_payment: '',
    experience_level: 'beginner',
    daily_hours: '', // Campo extra para calcular total_payment cuando se usa hourly_rate
  });
  const [paymentType, setPaymentType] = useState('hourly'); // 'hourly' o 'total'

  const handleCreateJob = () => {
    setShowCreateJobModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateJobModal(false);
    // Resetear formulario
    setFormData({
      title: '',
      description: '',
      category: 'events',
      location: '',
      start_date: '',
      end_date: '',
      start_time: '',
      end_time: '',
      required_workers: '',
      hourly_rate: '',
      total_payment: '',
      experience_level: 'beginner',
      daily_hours: '',
    });
    setPaymentType('hourly');
  };

  const calculateTotalPayment = () => {
    if (paymentType === 'hourly' && formData.hourly_rate && formData.daily_hours && formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      const timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 para incluir el día inicial
      
      const total = parseFloat(formData.hourly_rate) * parseFloat(formData.daily_hours) * daysDiff;
      return total.toFixed(2);
    }
    return formData.total_payment;
  };

  const handleSubmitJob = async () => {
    // Validaciones básicas
    if (!formData.title || !formData.description || !formData.location || 
        !formData.start_date || !formData.end_date || !formData.start_time || 
        !formData.end_time || !formData.required_workers) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    if (paymentType === 'hourly' && (!formData.hourly_rate || !formData.daily_hours)) {
      Alert.alert('Error', 'Por favor completa la tarifa por hora y las horas diarias');
      return;
    }

    if (paymentType === 'total' && !formData.total_payment) {
      Alert.alert('Error', 'Por favor completa el pago total');
      return;
    }

    // Preparar datos para enviar
    const jobData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      location: formData.location,
      start_date: formData.start_date,
      end_date: formData.end_date,
      start_time: formData.start_time,
      end_time: formData.end_time,
      required_workers: parseInt(formData.required_workers),
      hourly_rate: paymentType === 'hourly' ? parseFloat(formData.hourly_rate) : 0,
      total_payment: paymentType === 'hourly' ? parseFloat(calculateTotalPayment()) : parseFloat(formData.total_payment),
      experience_level: formData.experience_level,
    };

    console.log('Datos del trabajo a crear:', jobData);
    
    // Aquí harías la llamada a la API
    // await createJobOffer(jobData);
    const createJobOffer = await fetch(`${API_URL}/job_offers`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobData),
    });

    Alert.alert('Éxito', 'Trabajo publicado correctamente');
    handleCloseModal();
  };

  return (
    <CompanyProtection>
      <View style={{ flex: 1, backgroundColor: '#62483E' }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>ChambApp</Text>
        </View>

        <View style={styles.containerGray}>
          <Text style={styles.title}>Administración</Text>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Botón para crear nuevo trabajo */}
            <TouchableOpacity style={styles.createJobButton} onPress={handleCreateJob}>
              <MaterialIcons name="add-circle" size={24} color="#fff" />
              <Text style={styles.createJobText}>Publicar nuevo trabajo</Text>
            </TouchableOpacity>

            {/* Estadísticas rápidas */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Trabajos activos</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>45</Text>
                <Text style={styles.statLabel}>Postulaciones</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>8</Text>
                <Text style={styles.statLabel}>Completados</Text>
              </View>
            </View>

            {/* Sección de trabajos publicados */}
            <Text style={styles.sectionTitle}>Mis trabajos publicados</Text>

            {/* Trabajo 1 - Activo */}
            <View style={styles.jobCard}>
              <Image source={require('../assets/Logo_ChambApp.png')} style={styles.companyLogo} />
              <View style={styles.jobInfo}>
                <Text style={styles.jobTitle}>Mesero para evento</Text>
                <Text style={styles.jobDescription}>
                  Se busca mesero con experiencia para evento corporativo
                </Text>
                <View style={styles.jobDetails}>
                  <Text style={styles.detail}>$15.00/h</Text>
                  <Text style={styles.detail}>2 postulaciones</Text>
                </View>
                <View style={styles.statusRow}>
                  <View style={[styles.statusBadge, styles.activeStatus]}>
                    <Text style={styles.statusText}>Activo</Text>
                  </View>
                  <Text style={styles.publishDate}>Publicado: 25/07/2025</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.moreButton}>
                <MaterialIcons name="more-vert" size={24} color="#755B51" />
              </TouchableOpacity>
            </View>

            {/* Trabajo 2 - En progreso */}
            <View style={styles.jobCard}>
              <Image source={require('../assets/Logo_ChambApp.png')} style={styles.companyLogo} />
              <View style={styles.jobInfo}>
                <Text style={styles.jobTitle}>Ayudante de cocina</Text>
                <Text style={styles.jobDescription}>
                  Apoyo en cocina para restaurante durante fin de semana
                </Text>
                <View style={styles.jobDetails}>
                  <Text style={styles.detail}>$250.00 total</Text>
                  <Text style={styles.detail}>1 trabajador asignado</Text>
                </View>
                <View style={styles.statusRow}>
                  <View style={[styles.statusBadge, styles.progressStatus]}>
                    <Text style={styles.statusText}>En progreso</Text>
                  </View>
                  <Text style={styles.publishDate}>Inicia: 28/07/2025</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.moreButton}>
                <MaterialIcons name="more-vert" size={24} color="#755B51" />
              </TouchableOpacity>
            </View>

            {/* Trabajo 3 - Completado */}
            <View style={styles.jobCard}>
              <Image source={require('../assets/Logo_ChambApp.png')} style={styles.companyLogo} />
              <View style={styles.jobInfo}>
                <Text style={styles.jobTitle}>Repartidor delivery</Text>
                <Text style={styles.jobDescription}>
                  Entrega de pedidos en zona metropolitana
                </Text>
                <View style={styles.jobDetails}>
                  <Text style={styles.detail}>$3.50/h</Text>
                  <Text style={styles.detail}>Trabajo completado</Text>
                </View>
                <View style={styles.statusRow}>
                  <View style={[styles.statusBadge, styles.completedStatus]}>
                    <Text style={styles.statusText}>Completado</Text>
                  </View>
                  <View style={styles.ratingRow}>
                    <FontAwesome name="star" size={14} color="#E7E67D" />
                    <Text style={styles.ratingText}>4.8</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.moreButton}>
                <MaterialIcons name="more-vert" size={24} color="#755B51" />
              </TouchableOpacity>
            </View>

            {/* Trabajo 4 - Pausado */}
            <View style={styles.jobCard}>
              <Image source={require('../assets/Logo_ChambApp.png')} style={styles.companyLogo} />
              <View style={styles.jobInfo}>
                <Text style={styles.jobTitle}>Promotor de ventas</Text>
                <Text style={styles.jobDescription}>
                  Promoción de productos en centro comercial
                </Text>
                <View style={styles.jobDetails}>
                  <Text style={styles.detail}>$12.00/h</Text>
                  <Text style={styles.detail}>0 postulaciones</Text>
                </View>
                <View style={styles.statusRow}>
                  <View style={[styles.statusBadge, styles.pausedStatus]}>
                    <Text style={styles.statusText}>Pausado</Text>
                  </View>
                  <Text style={styles.publishDate}>Pausado: 20/07/2025</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.moreButton}>
                <MaterialIcons name="more-vert" size={24} color="#755B51" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* Modal para crear nuevo trabajo */}
        <Modal
          visible={showCreateJobModal}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Publicar nuevo trabajo</Text>
                <TouchableOpacity onPress={handleCloseModal}>
                  <MaterialIcons name="close" size={24} color="#4C3A34" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.formScrollView} showsVerticalScrollIndicator={false}>
                {/* Título */}
                <Text style={styles.label}>Título *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Mesero para evento corporativo"
                  value={formData.title}
                  onChangeText={(text) => setFormData({...formData, title: text})}
                />

                {/* Descripción */}
                <Text style={styles.label}>Descripción *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe las responsabilidades y requisitos del trabajo"
                  value={formData.description}
                  onChangeText={(text) => setFormData({...formData, description: text})}
                  multiline
                  numberOfLines={4}
                />

                {/* Categoría */}
                <Text style={styles.label}>Categoría *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.category}
                    onValueChange={(value) => setFormData({...formData, category: value})}
                    style={styles.picker}
                  >
                    <Picker.Item label="Eventos" value="events" />
                    <Picker.Item label="Catering" value="catering" />
                    <Picker.Item label="Limpieza" value="cleaning" />
                    <Picker.Item label="Delivery" value="delivery" />
                    <Picker.Item label="Otros" value="others" />
                  </Picker>
                </View>

                {/* Ubicación */}
                <Text style={styles.label}>Ubicación *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Centro de Convenciones, Ciudad de Panamá"
                  value={formData.location}
                  onChangeText={(text) => setFormData({...formData, location: text})}
                />

                {/* Fechas */}
                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Fecha inicio *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="YYYY-MM-DD"
                      value={formData.start_date}
                      onChangeText={(text) => setFormData({...formData, start_date: text})}
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Fecha fin *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="YYYY-MM-DD"
                      value={formData.end_date}
                      onChangeText={(text) => setFormData({...formData, end_date: text})}
                    />
                  </View>
                </View>

                {/* Horarios */}
                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Hora inicio *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="HH:MM:SS"
                      value={formData.start_time}
                      onChangeText={(text) => setFormData({...formData, start_time: text})}
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Hora fin *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="HH:MM:SS"
                      value={formData.end_time}
                      onChangeText={(text) => setFormData({...formData, end_time: text})}
                    />
                  </View>
                </View>

                {/* Trabajadores requeridos */}
                <Text style={styles.label}>Trabajadores requeridos *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Número de trabajadores"
                  value={formData.required_workers}
                  onChangeText={(text) => setFormData({...formData, required_workers: text})}
                  keyboardType="numeric"
                />

                {/* Nivel de experiencia */}
                <Text style={styles.label}>Nivel de experiencia *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.experience_level}
                    onValueChange={(value) => setFormData({...formData, experience_level: value})}
                    style={styles.picker}
                  >
                    <Picker.Item label="Principiante" value="beginner" />
                    <Picker.Item label="Intermedio" value="intermediate" />
                    <Picker.Item label="Avanzado" value="advanced" />
                  </Picker>
                </View>

                {/* Tipo de pago */}
                <Text style={styles.label}>Tipo de pago *</Text>
                <View style={styles.paymentTypeContainer}>
                  <TouchableOpacity
                    style={[styles.paymentTypeButton, paymentType === 'hourly' && styles.paymentTypeActive]}
                    onPress={() => setPaymentType('hourly')}
                  >
                    <Text style={[styles.paymentTypeText, paymentType === 'hourly' && styles.paymentTypeTextActive]}>
                      Por hora
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.paymentTypeButton, paymentType === 'total' && styles.paymentTypeActive]}
                    onPress={() => setPaymentType('total')}
                  >
                    <Text style={[styles.paymentTypeText, paymentType === 'total' && styles.paymentTypeTextActive]}>
                      Pago total
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Campos de pago según tipo seleccionado */}
                {paymentType === 'hourly' ? (
                  <View style={styles.row}>
                    <View style={styles.halfWidth}>
                      <Text style={styles.label}>Tarifa por hora *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Ej: 15.00"
                        value={formData.hourly_rate}
                        onChangeText={(text) => setFormData({...formData, hourly_rate: text})}
                        keyboardType="decimal-pad"
                      />
                    </View>
                    <View style={styles.halfWidth}>
                      <Text style={styles.label}>Horas por día *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Ej: 8"
                        value={formData.daily_hours}
                        onChangeText={(text) => setFormData({...formData, daily_hours: text})}
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>
                ) : (
                  <>
                    <Text style={styles.label}>Pago total *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ej: 500.00"
                      value={formData.total_payment}
                      onChangeText={(text) => setFormData({...formData, total_payment: text})}
                      keyboardType="decimal-pad"
                    />
                  </>
                )}

                {/* Mostrar pago total calculado cuando es por hora */}
                {paymentType === 'hourly' && formData.hourly_rate && formData.daily_hours && formData.start_date && formData.end_date && (
                  <View style={styles.calculatedPayment}>
                    <Text style={styles.calculatedPaymentLabel}>Pago total calculado:</Text>
                    <Text style={styles.calculatedPaymentValue}>${calculateTotalPayment()}</Text>
                  </View>
                )}

                {/* Botones */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.cancelButton} onPress={handleCloseModal}>
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.submitButton} onPress={handleSubmitJob}>
                    <Text style={styles.submitButtonText}>Publicar trabajo</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </CompanyProtection>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#62483E',
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 32,
  },
  logo: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 26,
    letterSpacing: 0.5,
  },
  containerGray: {
    backgroundColor: '#D2D2D2',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  title: {
    fontSize: 32,
    color: '#4C3A34',
    fontWeight: '600',
    marginBottom: 18,
    marginTop: 10,
  },
  createJobButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#57443D',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  createJobText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4C3A34',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#755B51',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    color: '#4C3A34',
    fontWeight: '600',
    marginBottom: 16,
  },
  jobCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#EEE',
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4C3A34',
    marginBottom: 4,
  },
  jobDescription: {
    fontSize: 14,
    color: '#755B51',
    marginBottom: 8,
    lineHeight: 18,
  },
  jobDetails: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 16,
  },
  detail: {
    fontSize: 13,
    color: '#57443D',
    fontWeight: '500',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeStatus: {
    backgroundColor: '#E8F5E8',
  },
  progressStatus: {
    backgroundColor: '#E3F2FD',
  },
  completedStatus: {
    backgroundColor: '#F3E5F5',
  },
  pausedStatus: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4C3A34',
  },
  publishDate: {
    fontSize: 11,
    color: '#755B51',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#755B51',
    fontWeight: '500',
  },
  moreButton: {
    padding: 4,
  },

  // Estilos del Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(98, 72, 62, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4C3A34',
  },
  formScrollView: {
    maxHeight: 450,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4C3A34',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F2F0F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#4C3A34',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#F2F0F0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  picker: {
    color: '#4C3A34',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  paymentTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  paymentTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  paymentTypeActive: {
    borderColor: '#57443D',
    backgroundColor: '#F8F6F6',
  },
  paymentTypeText: {
    fontSize: 16,
    color: '#755B51',
    fontWeight: '500',
  },
  paymentTypeTextActive: {
    color: '#57443D',
    fontWeight: '600',
  },
  calculatedPayment: {
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calculatedPaymentLabel: {
    fontSize: 14,
    color: '#4C3A34',
    fontWeight: '500',
  },
  calculatedPaymentValue: {
    fontSize: 16,
    color: '#4C3A34',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 8,
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
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#57443D',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
