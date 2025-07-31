import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import LoadingOverlay from './LoadingOverlay';

interface CompanyProtectionProps {
  children: React.ReactNode;
}

const CompanyProtection: React.FC<CompanyProtectionProps> = ({ children }) => {
  const { user, isLoading, error, isCompany, isLoggedIn } = useAuth();

  useEffect(() => {
    // Si no está cargando y no hay usuario logueado, redirigir a login
    if (!isLoading && !isLoggedIn) {
      console.log('Usuario no logueado, redirigiendo a login...');
      router.replace('/(auth)/login');
      return;
    }

    // Si terminó de cargar, hay usuario pero no es company, mostrar alerta y redirigir
    if (!isLoading && user && !isCompany) {
      console.log('Usuario no es company, tipo:', user.user_type);
      
      Alert.alert(
        'Acceso restringido',
        `Esta sección está disponible únicamente para cuentas empresariales.\n\nTu cuenta actual es de tipo: ${user.user_type}`,
        [
          {
            text: 'Entendido',
            onPress: () => {
              console.log('Redirigiendo a HomeScreen...');
              router.replace('/internals/HomeScreen');
            }
          }
        ],
        { cancelable: false }
      );
    }
  }, [isLoading, user, isCompany, isLoggedIn]);

  // Mostrar loading mientras verifica
  if (isLoading) {
    return <LoadingOverlay visible={true} message="Verificando permisos..." />;
  }

  // Si hay error de conexión
  if (error && !user) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <MaterialIcons name="error-outline" size={80} color="#755B51" />
          <Text style={styles.title}>Error de conexión</Text>
          <Text style={styles.message}>
            No se pudo verificar tu tipo de cuenta. Verifica tu conexión a internet.
          </Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.replace('/internals/HomeScreen')}
          >
            <Text style={styles.buttonText}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Si no hay usuario logueado, mostrar loading (se redirige automáticamente)
  if (!isLoggedIn) {
    return <LoadingOverlay visible={true} message="Redirigiendo a login..." />;
  }

  // Si no es company, mostrar mensaje de acceso denegado
  if (!isCompany) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <MaterialIcons name="business" size={80} color="#755B51" />
          <Text style={styles.title}>Acceso Restringido</Text>
          <Text style={styles.message}>
            Esta sección está disponible únicamente para cuentas empresariales.
          </Text>
          <Text style={styles.submessage}>
            Tu cuenta actual es de tipo: <Text style={styles.userType}>{user?.user_type}</Text>
          </Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.replace('/internals/HomeScreen')}
          >
            <Text style={styles.buttonText}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Si es company, mostrar el contenido
  console.log('Usuario es company, mostrando CompanyScreen');
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#62483E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#D2D2D2',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4C3A34',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#755B51',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  submessage: {
    fontSize: 14,
    color: '#755B51',
    textAlign: 'center',
    marginBottom: 24,
  },
  userType: {
    fontWeight: 'bold',
    color: '#4C3A34',
  },
  button: {
    backgroundColor: '#57443D',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 150,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CompanyProtection;