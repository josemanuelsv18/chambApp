import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { styles } from './PerfilScreenStyles';

interface WorkerDetailsProps {
  dateOfBirth: string;
  location: string;
  experienceLevel: string;
  completedJobs: number;
  bio?: string;
}

const WorkerDetails: React.FC<WorkerDetailsProps> = ({
  dateOfBirth,
  location,
  experienceLevel,
  completedJobs,
  bio
}) => {
  const formatBirthDate = (dateString: string) => {
    if (!dateString) return 'Fecha no disponible';
    
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

  const getExperienceLabel = () => {
    switch (experienceLevel) {
      case 'beginner': return 'Principiante';
      case 'intermediate': return 'Intermedio';
      case 'advanced': return 'Avanzado';
      default: return experienceLevel;
    }
  };

  return (
    <View style={styles.detailsContainer}>
      <Text style={styles.sectionTitle}>Información Personal</Text>
      
      <View style={styles.twoColumnRow}>
        <View style={styles.detailCard}>
          <MaterialIcons name="cake" size={18} color="#755B51" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Fecha de nacimiento</Text>
            <Text style={styles.detailValue}>{formatBirthDate(dateOfBirth)}</Text>
          </View>
        </View>
        
        <View style={styles.detailCard}>
          <MaterialIcons name="location-on" size={18} color="#755B51" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Ubicación</Text>
            <Text style={styles.detailValue}>{location}</Text>
          </View>
        </View>
      </View>

      <View style={styles.twoColumnRow}>
        <View style={styles.detailCard}>
          <MaterialIcons name="trending-up" size={18} color="#755B51" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Experiencia</Text>
            <Text style={styles.detailValue}>{getExperienceLabel()}</Text>
          </View>
        </View>
        
        <View style={styles.detailCard}>
          <MaterialIcons name="work" size={18} color="#755B51" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Trabajos</Text>
            <Text style={styles.detailValue}>{completedJobs}</Text>
          </View>
        </View>
      </View>

      {bio && (
        <View style={styles.bioCard}>
          <MaterialIcons name="person" size={18} color="#755B51" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Biografía</Text>
            <Text style={styles.bioText}>{bio}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default WorkerDetails;