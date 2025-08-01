import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { styles } from './PerfilScreenStyles';

interface VerificationModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectType: (type: 'worker' | 'company') => void;
}

const VerificationModal: React.FC<VerificationModalProps> = ({
  visible,
  onClose,
  onSelectType
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Completa tu perfil</Text>
          <Text style={styles.modalSubtitle}>
            Selecciona el tipo de cuenta que deseas crear:
          </Text>

          <TouchableOpacity 
            style={styles.accountTypeButton}
            onPress={() => onSelectType('worker')}
          >
            <MaterialIcons name="person" size={24} color="#57443D" />
            <View style={styles.accountTypeContent}>
              <Text style={styles.accountTypeTitle}>Trabajador</Text>
              <Text style={styles.accountTypeDescription}>
                Busca y postula a trabajos eventuales
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.accountTypeButton}
            onPress={() => onSelectType('company')}
          >
            <MaterialIcons name="business" size={24} color="#57443D" />
            <View style={styles.accountTypeContent}>
              <Text style={styles.accountTypeTitle}>Empresa</Text>
              <Text style={styles.accountTypeDescription}>
                Publica trabajos y contrata personal
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default VerificationModal;