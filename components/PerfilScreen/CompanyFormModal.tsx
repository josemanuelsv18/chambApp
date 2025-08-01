import { MaterialIcons } from '@expo/vector-icons';
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

interface CompanyFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const CompanyFormModal: React.FC<CompanyFormModalProps> = ({
  visible,
  onClose,
  onSubmit
}) => {
  const [companyData, setCompanyData] = useState({
    company_name: '',
    business_type: '',
    address: '',
    contact_person: '',
    logo: '',
    description: '',
  });

  const handleSubmit = () => {
    // Validaciones
    if (!companyData.company_name || !companyData.business_type || !companyData.address || !companyData.contact_person) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    onSubmit(companyData);
    
    // Limpiar formulario
    setCompanyData({
      company_name: '',
      business_type: '',
      address: '',
      contact_person: '',
      logo: '',
      description: '',
    });
  };

  const handleClose = () => {
    // Limpiar formulario al cerrar
    setCompanyData({
      company_name: '',
      business_type: '',
      address: '',
      contact_person: '',
      logo: '',
      description: '',
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
            <Text style={styles.modalTitle}>Perfil de Empresa</Text>
            <TouchableOpacity onPress={handleClose}>
              <MaterialIcons name="close" size={24} color="#4C3A34" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScrollView} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Nombre de la empresa *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa el nombre de tu empresa"
              value={companyData.company_name}
              onChangeText={(text) => setCompanyData({...companyData, company_name: text})}
            />

            <Text style={styles.label}>Tipo de negocio *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Tecnología, Restaurante, etc."
              value={companyData.business_type}
              onChangeText={(text) => setCompanyData({...companyData, business_type: text})}
            />

            <Text style={styles.label}>Dirección *</Text>
            <TextInput
              style={styles.input}
              placeholder="Dirección de la empresa"
              value={companyData.address}
              onChangeText={(text) => setCompanyData({...companyData, address: text})}
            />

            <Text style={styles.label}>Persona de contacto *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre del responsable"
              value={companyData.contact_person}
              onChangeText={(text) => setCompanyData({...companyData, contact_person: text})}
            />

            <ImageUploader
              label="Logo de la empresa"
              placeholder="Agregar logo"
              currentImageUrl={companyData.logo}
              onImageUploaded={(imageUrl) => setCompanyData({...companyData, logo: imageUrl})}
              showLabel={true}
            />

            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe tu empresa y sus servicios"
              value={companyData.description}
              onChangeText={(text) => setCompanyData({...companyData, description: text})}
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

export default CompanyFormModal;