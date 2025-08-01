import { API_URL } from '@/config/api';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import CompanyProtection from '../../components/CompanyProtection';
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
}

export default function CompanyScreen() {
  const { user } = useAuth(); // Obtener información del usuario
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
    daily_hours: '',
  });
  const [paymentType, setPaymentType] = useState('hourly');
  
  // Estados para los selectores
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  
  // Estados para las fechas/horas seleccionadas
  const [selectedDates, setSelectedDates] = useState<{ [date: string]: any }>({});
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());

  // Estados para los datos de la empresa y trabajos
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [companyData, setCompanyData] = useState<Company | null>(null);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  // Cargar datos cuando se monta el componente
  useEffect(() => {
    if (user && user.user_type === 'company') {
      loadCompanyJobOffers();
    }
  }, [user]);

  // Función para cargar las ofertas de trabajo de la empresa
  const loadCompanyJobOffers = async () => {
    try {
      setIsLoadingJobs(true);
      const accessToken = await AsyncStorage.getItem('accessToken');

      // 1. Obtener datos de la empresa del usuario logueado
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

      // 2. Obtener ofertas de trabajo de la empresa
      const jobOffersResponse = await fetch(`${API_URL}/job_offers/by_company/${company.id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (jobOffersResponse.ok) {
        const jobOffersData = await jobOffersResponse.json();
        setJobOffers(jobOffersData);
      } else if (jobOffersResponse.status === 404) {
        setJobOffers([]); // No hay trabajos publicados
      } else {
        throw new Error('Error fetching job offers');
      }

    } catch (error) {
      console.error('Error loading company job offers:', error);
      Alert.alert('Error', 'No se pudieron cargar los trabajos publicados');
    } finally {
      setIsLoadingJobs(false);
    }
  };

  // Función para manejar la selección de rango de fechas
  const handleDayPress = (day: any) => {
    const dateString = day.dateString;
    
    // Si no hay fechas seleccionadas o ya hay un rango completo, empezar nuevo
    if (!formData.start_date || (formData.start_date && formData.end_date)) {
      const newSelectedDates = {
        [dateString]: {
          selected: true,
          startingDay: true,
          color: '#57443D',
          textColor: 'white'
        }
      };
      
      setSelectedDates(newSelectedDates);
      setFormData({
        ...formData,
        start_date: dateString,
        end_date: ''
      });
    } 
    // Si solo hay fecha de inicio, establecer fecha de fin
    else if (formData.start_date && !formData.end_date) {
      const startDate = new Date(formData.start_date + 'T00:00:00'); // Agregar hora para evitar problemas de zona horaria
      const endDate = new Date(dateString + 'T00:00:00');
      
      // Asegurar que la fecha de fin no sea anterior a la de inicio
      if (endDate < startDate) {
        Alert.alert('Error', 'La fecha de fin no puede ser anterior a la fecha de inicio');
        return;
      }
      
      // Crear el rango de fechas
      const newSelectedDates: { [key: string]: any } = {};
      const currentDate = new Date(startDate); // Usar la fecha de inicio correcta
      
      while (currentDate <= endDate) {
        const currentDateString = currentDate.toISOString().split('T')[0];
        
        if (currentDateString === formData.start_date) {
          newSelectedDates[currentDateString] = {
            selected: true,
            startingDay: true,
            color: '#57443D',
            textColor: 'white'
          };
        } else if (currentDateString === dateString) {
          newSelectedDates[currentDateString] = {
            selected: true,
            endingDay: true,
            color: '#57443D',
            textColor: 'white'
          };
        } else {
          newSelectedDates[currentDateString] = {
            selected: true,
            color: '#8B6F62',
            textColor: 'white'
          };
        }
        
        // Avanzar correctamente un día
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      }
      
      setSelectedDates(newSelectedDates);
      setFormData({
        ...formData,
        end_date: dateString
      });
    }
  };

  // Funciones para manejar cambios en los time pickers
  const onStartTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || startTime;
    setShowStartTimePicker(Platform.OS === 'ios');
    setStartTime(currentTime);
    
    // Formatear hora para el formulario (HH:MM:SS)
    const formattedTime = currentTime.toTimeString().split(' ')[0];
    setFormData({...formData, start_time: formattedTime});
  };

  const onEndTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || endTime;
    setShowEndTimePicker(Platform.OS === 'ios');
    setEndTime(currentTime);
    
    // Formatear hora para el formulario (HH:MM:SS)
    const formattedTime = currentTime.toTimeString().split(' ')[0];
    setFormData({...formData, end_time: formattedTime});
  };

  // Funciones para mostrar los pickers
  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const showStartTimePickerModal = () => {
    setShowStartTimePicker(true);
  };

  const showEndTimePickerModal = () => {
    setShowEndTimePicker(true);
  };

  // Funciones para formatear las fechas/horas mostradas
  const formatDisplayDateRange = () => {
    if (!formData.start_date) return 'Seleccionar rango de fechas';
    
    // Usar directamente las fechas en formato string para evitar problemas de zona horaria
    const startDateParts = formData.start_date.split('-');
    const startDate = new Date(
      parseInt(startDateParts[0]), 
      parseInt(startDateParts[1]) - 1, 
      parseInt(startDateParts[2])
    );
    
    const startFormatted = startDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    if (!formData.end_date) {
      return `Desde: ${startFormatted}`;
    }
    
    const endDateParts = formData.end_date.split('-');
    const endDate = new Date(
      parseInt(endDateParts[0]), 
      parseInt(endDateParts[1]) - 1, 
      parseInt(endDateParts[2])
    );
    
    const endFormatted = endDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return `${startFormatted} - ${endFormatted}`;
  };

  const formatDisplayTime = (timeString: string) => {
    if (!timeString) return 'Seleccionar hora';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  // Funciones para formatear datos en la lista
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
      case 'available': return 'Disponible';
      case 'in_progress': return 'En progreso';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      case 'paused': return 'Pausado';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#E8F5E8';
      case 'in_progress': return '#E3F2FD';
      case 'completed': return '#F3E5F5';
      case 'cancelled': return '#FFEBEE';
      case 'paused': return '#FFF3E0';
      default: return '#F5F5F5';
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
    // Resetear fechas y horas
    setSelectedDates({});
    setStartTime(new Date());
    setEndTime(new Date());
  };

  const calculateTotalPayment = () => {
    if (paymentType === 'hourly' && formData.hourly_rate && formData.daily_hours && formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      const timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
      
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

    // Verificar que tenemos company_id
    if (!companyData?.id) {
      Alert.alert('Error', 'No se pudo obtener la información de la empresa');
      return;
    }

    const jobData = {
      company_id: companyData.id, // Usar el company_id obtenido de la API
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
      status: "available" // Siempre "available" al crear
    };

    console.log('Datos del trabajo a crear:', jobData);
    
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      
      const response = await fetch(`${API_URL}/job_offers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`, // Agregar autorización
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });

      if (response.ok) {
        Alert.alert('Éxito', 'Trabajo publicado correctamente');
        handleCloseModal();
        // Recargar los trabajos publicados
        loadCompanyJobOffers();
      } else {
        const errorData = await response.json();
        console.log('Error de la API:', errorData);
        Alert.alert('Error', 'No se pudo publicar el trabajo');
      }
    } catch (error) {
      console.log('Error de conexión:', error);
      Alert.alert('Error', 'Error de conexión: ' + error);
    }
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

            <Text style={styles.sectionTitle}>Mis trabajos publicados</Text>

            {/* Loading de trabajos */}
            {isLoadingJobs ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#57443D" />
                <Text style={styles.loadingText}>Cargando trabajos publicados...</Text>
              </View>
            ) : jobOffers.length === 0 ? (
              // Estado vacío
              <View style={styles.emptyContainer}>
                <MaterialIcons name="work-off" size={64} color="#755B51" />
                <Text style={styles.emptyText}>No has publicado trabajos aún</Text>
                <Text style={styles.emptySubtext}>
                  Publica tu primer trabajo usando el botón de arriba
                </Text>
              </View>
            ) : (
              // Lista de trabajos publicados
              jobOffers.map((job) => (
                <TouchableOpacity 
                  key={job.id} 
                  style={styles.jobCard}
                  onPress={() => router.push(`/JobDetailsScreen?jobId=${job.id}`)}
                >
                  {companyData?.logo ? (
                    <Image source={{ uri: companyData.logo }} style={styles.companyLogo} />
                  ) : (
                    <View style={styles.placeholderLogo}>
                      <MaterialIcons name="business" size={24} color="#755B51" />
                    </View>
                  )}
                  <View style={styles.jobInfo}>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <Text style={styles.jobDescription} numberOfLines={2}>
                      {job.description}
                    </Text>
                    <View style={styles.jobDetails}>
                      <Text style={styles.detail}>
                        {job.hourly_rate > 0 ? `$${job.hourly_rate}/h` : `$${job.total_payment} total`}
                      </Text>
                      <Text style={styles.detail}>
                        {getCategoryLabel(job.category)}
                      </Text>
                    </View>
                    <View style={styles.jobDetails}>
                      <Text style={styles.detail}>
                        {job.required_workers} trabajador{job.required_workers !== 1 ? 'es' : ''}
                      </Text>
                      <Text style={styles.detail}>
                        {formatDate(job.start_date)} - {formatDate(job.end_date)}
                      </Text>
                    </View>
                    <View style={styles.statusRow}>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
                        <Text style={styles.statusText}>{getStatusLabel(job.status)}</Text>
                      </View>
                      <Text style={styles.publishDate}>
                        Publicado: {formatDate(job.created_at)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.arrowContainer}>
                    <MaterialIcons name="chevron-right" size={24} color="#755B51" />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>

        {/* Modal para crear nuevo trabajo - mismo que antes */}
        <Modal
          visible={showCreateJobModal}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCloseModal}
        >
          {/* Todo el contenido del modal igual que antes */}
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

                {/* Selector de Rango de Fechas */}
                <Text style={styles.label}>Fechas del trabajo *</Text>
                <TouchableOpacity style={styles.dateTimeButton} onPress={showDatePickerModal}>
                  <MaterialIcons name="date-range" size={20} color="#755B51" />
                  <Text style={styles.dateTimeText}>
                    {formatDisplayDateRange()}
                  </Text>
                </TouchableOpacity>

                {/* Modal del Calendar */}
                <Modal
                  visible={showDatePicker}
                  transparent={true}
                  animationType="slide"
                  onRequestClose={() => setShowDatePicker(false)}
                >
                  <View style={styles.calendarModalOverlay}>
                    <View style={styles.calendarContainer}>
                      <View style={styles.calendarHeader}>
                        <Text style={styles.calendarTitle}>Seleccionar fechas</Text>
                        <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                          <MaterialIcons name="close" size={24} color="#4C3A34" />
                        </TouchableOpacity>
                      </View>
                      
                      <Calendar
                        onDayPress={handleDayPress}
                        markingType={'period'}
                        markedDates={selectedDates}
                        minDate={new Date().toISOString().split('T')[0]}
                        theme={{
                          backgroundColor: '#ffffff',
                          calendarBackground: '#ffffff',
                          textSectionTitleColor: '#4C3A34',
                          selectedDayBackgroundColor: '#57443D',
                          selectedDayTextColor: '#ffffff',
                          todayTextColor: '#57443D',
                          dayTextColor: '#4C3A34',
                          textDisabledColor: '#d9e1e8',
                          dotColor: '#57443D',
                          selectedDotColor: '#ffffff',
                          arrowColor: '#57443D',
                          disabledArrowColor: '#d9e1e8',
                          monthTextColor: '#4C3A34',
                          indicatorColor: '#57443D',
                          textDayFontWeight: '500',
                          textMonthFontWeight: 'bold',
                          textDayHeaderFontWeight: '600',
                          textDayFontSize: 16,
                          textMonthFontSize: 18,
                          textDayHeaderFontSize: 14
                        }}
                      />
                      
                      <View style={styles.calendarFooter}>
                        <Text style={styles.calendarInstruction}>
                          {!formData.start_date 
                            ? "Toca una fecha para seleccionar el inicio" 
                            : !formData.end_date 
                            ? "Toca otra fecha para seleccionar el final"
                            : `Seleccionado: ${formatDisplayDateRange()}`}
                        </Text>
                        {formData.start_date && formData.end_date && (
                          <TouchableOpacity 
                            style={styles.confirmButton} 
                            onPress={() => setShowDatePicker(false)}
                          >
                            <Text style={styles.confirmButtonText}>Confirmar</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                </Modal>

                {/* Selectores de Hora */}
                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Hora inicio *</Text>
                    <TouchableOpacity style={styles.dateTimeButton} onPress={showStartTimePickerModal}>
                      <MaterialIcons name="access-time" size={20} color="#755B51" />
                      <Text style={styles.dateTimeText}>
                        {formatDisplayTime(formData.start_time)}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Hora fin *</Text>
                    <TouchableOpacity style={styles.dateTimeButton} onPress={showEndTimePickerModal}>
                      <MaterialIcons name="access-time" size={20} color="#755B51" />
                      <Text style={styles.dateTimeText}>
                        {formatDisplayTime(formData.end_time)}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Time Pickers */}
                {showStartTimePicker && (
                  <DateTimePicker
                    testID="startTimePicker"
                    value={startTime}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={onStartTimeChange}
                  />
                )}

                {showEndTimePicker && (
                  <DateTimePicker
                    testID="endTimePicker"
                    value={endTime}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={onEndTimeChange}
                  />
                )}

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
  sectionTitle: {
    fontSize: 20,
    color: '#4C3A34',
    fontWeight: '600',
    marginBottom: 16,
  },

  // Estados de loading y vacío
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
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
  placeholderLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 6,
    gap: 16,
    flexWrap: 'wrap',
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
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
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
  moreButton: {
    padding: 4,
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 8,
  },

  // Estilos del Modal - mantener todos los anteriores
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
  
  // Nuevos estilos para los selectores de fecha/hora
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F0F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 10,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#4C3A34',
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

  // Nuevos estilos para el calendar
  calendarModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4C3A34',
  },
  calendarFooter: {
    marginTop: 15,
    alignItems: 'center',
  },
  calendarInstruction: {
    fontSize: 14,
    color: '#755B51',
    textAlign: 'center',
    marginBottom: 10,
  },
  confirmButton: {
    backgroundColor: '#57443D',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
