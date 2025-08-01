import { API_URL } from '@/config/api';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import {
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
    if (!user?.company_id) {
      Alert.alert('Error', 'No se pudo obtener la información de la empresa');
      return;
    }

    const jobData = {
      company_id: user.company_id, // Usar el company_id del usuario logueado
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
      <View style={{ flex: 1, backgroundColor: '#62443E' }}>
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
