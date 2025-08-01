import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import BaseJobDetailScreen from '../components/shared/BaseJobDetailScreen';

export default function ApplicationDetails() {
  const { applicationId } = useLocalSearchParams<{ applicationId: string }>();

  const renderCustomActions = (data: any) => {
    const { applicationData, jobOffer } = data;
    
    if (!applicationData || !jobOffer) return null;

    // Solo mostrar acciones si la aplicación está pendiente
    if (applicationData.status === 'pending') {
      return (
        <TouchableOpacity 
          style={styles.cancelApplicationButton}
          onPress={() => handleCancelApplication(applicationData.id)}
        >
          <MaterialIcons name="cancel" size={20} color="#fff" />
          <Text style={styles.cancelApplicationText}>Cancelar Aplicación</Text>
        </TouchableOpacity>
      );
    }

    // Si fue aceptada, mostrar mensaje positivo
    if (applicationData.status === 'accepted') {
      return (
        <TouchableOpacity style={styles.acceptedButton} disabled>
          <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
          <Text style={styles.acceptedText}>¡Aplicación Aceptada!</Text>
        </TouchableOpacity>
      );
    }

    return null;
  };

  const handleCancelApplication = (applicationId: number) => {
    Alert.alert(
      'Cancelar Aplicación',
      '¿Estás seguro de que deseas cancelar tu aplicación? Esta acción no se puede deshacer.',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Sí, cancelar', 
          style: 'destructive',
          onPress: () => {
            // Aquí implementarías la lógica para cancelar la aplicación
            // Por ejemplo: DELETE /applications/{applicationId}
            console.log('Cancelando aplicación:', applicationId);
          }
        }
      ]
    );
  };

  if (!applicationId) {
    return null;
  }

  return (
    <BaseJobDetailScreen
      screenType="application"
      itemId={applicationId}
      headerTitle="Detalles de tu Aplicación"
      renderCustomActions={renderCustomActions}
    />
  );
}

const styles = StyleSheet.create({
  cancelApplicationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 20,
    gap: 8,
    width: '100%',
  },
  cancelApplicationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  acceptedButton: {
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
  acceptedText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
});