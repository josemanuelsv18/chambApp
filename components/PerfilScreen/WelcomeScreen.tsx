import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from './PerfilScreenStyles';

interface WelcomeScreenProps {
  onCompleteProfile: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onCompleteProfile }) => {
  return (
    <View style={styles.centeredContent}>
      <MaterialIcons name="account-circle" size={80} color="#755B51" style={{ marginBottom: 20 }} />
      <Text style={styles.welcomeText}>¡Bienvenido a ChambApp!</Text>
      <Text style={styles.verificationText}>
        Para completar tu perfil, necesitas verificar tu cuenta seleccionando el tipo de usuario.
      </Text>
      
      <TouchableOpacity 
        style={styles.completeProfileButton}
        onPress={onCompleteProfile}
        activeOpacity={0.8}
      >
        <MaterialIcons name="person-add" size={24} color="#fff" />
        <Text style={styles.completeProfileText}>Completar Perfil</Text>
      </TouchableOpacity>
      
      <View style={styles.benefitsContainer}>
        <View style={styles.benefitItem}>
          <MaterialIcons name="work" size={20} color="#57443D" />
          <Text style={styles.benefitText}>Accede a trabajos disponibles</Text>
        </View>
        <View style={styles.benefitItem}>
          <MaterialIcons name="star" size={20} color="#57443D" />
          <Text style={styles.benefitText}>Construye tu reputación</Text>
        </View>
        <View style={styles.benefitItem}>
          <MaterialIcons name="security" size={20} color="#57443D" />
          <Text style={styles.benefitText}>Pagos seguros garantizados</Text>
        </View>
      </View>
    </View>
  );
};

export default WelcomeScreen;