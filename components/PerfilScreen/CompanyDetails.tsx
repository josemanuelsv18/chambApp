import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { styles } from './PerfilScreenStyles';

interface CompanyDetailsProps {
  businessType: string;
  address: string;
  contactPerson: string;
  totalJobsPosted: number;
  status: string;
  description?: string;
}

const CompanyDetails: React.FC<CompanyDetailsProps> = ({
  businessType,
  address,
  contactPerson,
  totalJobsPosted,
  status,
  description
}) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'approved': return styles.statusApproved;
      case 'pending': return styles.statusPending;
      default: return styles.statusRejected;
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'approved': return 'Aprobado';
      case 'pending': return 'Pendiente';
      default: return 'Rechazado';
    }
  };

  return (
    <View style={styles.detailsContainer}>
      <Text style={styles.sectionTitle}>Información de la Empresa</Text>
      
      <View style={styles.twoColumnRow}>
        <View style={styles.detailCard}>
          <MaterialIcons name="business" size={18} color="#755B51" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Tipo de negocio</Text>
            <Text style={styles.detailValue}>{businessType}</Text>
          </View>
        </View>
        
        <View style={styles.detailCard}>
          <MaterialIcons name="location-on" size={18} color="#755B51" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Dirección</Text>
            <Text style={styles.detailValue}>{address}</Text>
          </View>
        </View>
      </View>

      <View style={styles.twoColumnRow}>
        <View style={styles.detailCard}>
          <MaterialIcons name="person" size={18} color="#755B51" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Contacto</Text>
            <Text style={styles.detailValue}>{contactPerson}</Text>
          </View>
        </View>
        
        <View style={styles.detailCard}>
          <MaterialIcons name="work" size={18} color="#755B51" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Trabajos publicados</Text>
            <Text style={styles.detailValue}>{totalJobsPosted}</Text>
          </View>
        </View>
      </View>

      <View style={styles.statusCard}>
        <MaterialIcons name="verified" size={18} color="#755B51" />
        <View style={styles.detailContent}>
          <Text style={styles.detailLabel}>Estado</Text>
          <Text style={[styles.detailValue, getStatusStyle()]}>
            {getStatusLabel()}
          </Text>
        </View>
      </View>

      {description && (
        <View style={styles.bioCard}>
          <MaterialIcons name="description" size={18} color="#755B51" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Descripción</Text>
            <Text style={styles.bioText}>{description}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default CompanyDetails;