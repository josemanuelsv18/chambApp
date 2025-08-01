import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import ImageUploader from '../ImageUploader/ImageUploader';
import { styles } from './PerfilScreenStyles';

interface WorkerFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const WorkerFormModal: React.FC<WorkerFormModalProps> = ({
  visible,
  onClose,
  onSubmit
}) => {
  const [workerData, setWorkerData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    profile_picture: '',
    bio: '',
    experience_level: 'beginner',
    location: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(false);
    setSelectedDate(currentDate);
    
    // Formatear la fecha manualmente para evitar problemas de zona horaria
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    setWorkerData({ ...workerData, date_of_birth: formattedDate });
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return 'Seleccionar fecha';
    
    // Parsing manual para evitar problemas de zona horaria
    const dateParts = dateString.split('-');
    const date = new Date(
      parseInt(dateParts[0]), 
      parseInt(dateParts[1]) - 1, 
      parseInt(dateParts[2])
    );
    
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSubmit = () => {
    // Validaciones
    if (!workerData.first_name || !workerData.last_name || !workerData.date_of_birth || !workerData.location) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    onSubmit(workerData);
    
    // Limpiar formulario
    setWorkerData({
      first_name: '',
      last_name: '',
      date_of_birth: '',
      profile_picture: '',
      bio: '',
      experience_level: 'beginner',
      location: '',
    });
  };

  const handleClose = () => {
    // Limpiar formulario al cerrar
    setWorkerData({
      first_name: '',
      last_name: '',
      date_of_birth: '',
      profile_picture: '',
      bio: '',
      experience_level: 'beginner',
      location: '',
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.formModalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Perfil de Trabajador</Text>
            <TouchableOpacity onPress={handleClose}>
              <MaterialIcons name="close" size={24} color="#4C3A34" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScrollView} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Nombre *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu nombre"
              value={workerData.first_name}
              onChangeText={(text) => setWorkerData({...workerData, first_name: text})}
            />

            <Text style={styles.label}>Apellido *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu apellido"
              value={workerData.last_name}
              onChangeText={(text) => setWorkerData({...workerData, last_name: text})}
            />

            <Text style={styles.label}>Fecha de nacimiento *</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
              <MaterialIcons name="calendar-today" size={20} color="#755B51" />
              <Text style={styles.dateText}>
                {formatDisplayDate(workerData.date_of_birth)}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={workerData.date_of_birth ? (() => {
                  const dateParts = workerData.date_of_birth.split('-');
                  return new Date(
                    parseInt(dateParts[0]), 
                    parseInt(dateParts[1]) - 1, 
                    parseInt(dateParts[2])
                  );
                })() : new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}

            <Text style={styles.label}>Ubicación *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Ciudad de Panamá"
              value={workerData.location}
              onChangeText={(text) => setWorkerData({...workerData, location: text})}
            />

            <Text style={styles.label}>Nivel de experiencia *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={workerData.experience_level}
                onValueChange={(value) => setWorkerData({...workerData, experience_level: value})}
                style={styles.picker}
              >
                <Picker.Item label="Principiante" value="beginner" />
                <Picker.Item label="Intermedio" value="intermediate" />
                <Picker.Item label="Avanzado" value="advanced" />
              </Picker>
            </View>

            {/* Reemplazar el TextInput de foto con ImageUploader */}
            <ImageUploader
              label="Foto de perfil"
              placeholder="Agregar foto de perfil"
              currentImageUrl={workerData.profile_picture}
              onImageUploaded={(imageUrl) => setWorkerData({...workerData, profile_picture: imageUrl})}
              showLabel={true}
            />

            <Text style={styles.label}>Biografía</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Cuéntanos sobre ti y tu experiencia"
              value={workerData.bio}
              onChangeText={(text) => setWorkerData({...workerData, bio: text})}
              multiline
              numberOfLines={4}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Crear perfil</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default WorkerFormModal;