import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import LoadingOverlay from '../../components/LoadingOverlay';
import { API_URL } from '../../config/api';
import { useAuth } from '../../hooks/useAuth';

interface UserProfile {
  id: number;
  email: string;
  phone: string;
  user_type: string;
  is_active: boolean;
  is_verified: boolean;
  worker?: CompleteWorkerProfile;
  company?: CompleteCompanyProfile;
}

interface CompleteWorkerProfile {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  profile_picture?: string;
  bio?: string;
  experience_level: string;
  location: string;
  rating: string;
  completed_jobs: number;
  balance: string;
  created_at: string;
  updated_at: string;
}

interface CompleteCompanyProfile {
  id: number;
  user_id: number;
  company_name: string;
  business_type: string;
  address: string;
  contact_person: string;
  logo?: string;
  description?: string;
  rating: string;
  total_jobs_posted: number;
  balance: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function PerfilScreen() {
  const { user, refreshUserInfo } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [accountType, setAccountType] = useState<'worker' | 'company' | null>(null);
  const [showWorkerForm, setShowWorkerForm] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  
  // Estados para formulario worker
  const [workerData, setWorkerData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    profile_picture: '',
    bio: '',
    experience_level: 'beginner',
    location: '',
  });
  
  // Estados para formulario company
  const [companyData, setCompanyData] = useState({
    company_name: '',
    business_type: '',
    address: '',
    contact_person: '',
    logo: '',
    description: '',
  });
  
  // Estados para date picker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const accessToken = await AsyncStorage.getItem('accessToken');
      
      // Obtener información básica del usuario
      const userResponse = await fetch(`${API_URL}/users/${user.user_id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        
        // Solo establecer userProfile, no mostrar modal automáticamente
        if (!userData.is_verified) {
          setUserProfile(userData);
          return;
        }
        
        let profileData = {
          ...userData,
          worker: null,
          company: null
        };
        
        // Usar los nuevos endpoints directos
        if (userData.user_type === 'worker') {
          const workerResponse = await fetch(`${API_URL}/workers/by_user/${user.user_id}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (workerResponse.ok) {
            profileData.worker = await workerResponse.json();
          }
        } else if (userData.user_type === 'company') {
          const companyResponse = await fetch(`${API_URL}/companies/by_user/${user.user_id}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (companyResponse.ok) {
            profileData.company = await companyResponse.json();
          }
        }
        
        setUserProfile(profileData);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      Alert.alert('Error', 'No se pudo cargar el perfil del usuario');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para mostrar rating con estrellas
  const renderStars = (rating: string) => {
    const numRating = parseFloat(rating);
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesome
          key={i}
          name={i <= numRating ? "star" : i - 0.5 <= numRating ? "star-half-o" : "star-o"}
          size={16}
          color="#E7E67D"
          style={{ marginRight: 2 }}
        />
      );
    }
    
    return (
      <View style={styles.starsContainer}>
        {stars}
        <Text style={styles.ratingText}>({rating})</Text>
      </View>
    );
  };

  // Función para formatear fecha de nacimiento (CORREGIDA)
  const formatBirthDate = (dateString: string) => {
    if (!dateString) return 'Fecha no disponible';
    
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

  const handleAccountTypeSelection = (type: 'worker' | 'company') => {
    setAccountType(type);
    setShowVerificationModal(false);
    
    if (type === 'worker') {
      setShowWorkerForm(true);
    } else {
      setShowCompanyForm(true);
    }
  };

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

  const handleWorkerSubmit = async () => {
    // Validaciones
    if (!workerData.first_name || !workerData.last_name || !workerData.date_of_birth || !workerData.location) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setIsLoading(true);
      const accessToken = await AsyncStorage.getItem('accessToken');

      const workerPayload = {
        user_id: user?.user_id,
        first_name: workerData.first_name,
        last_name: workerData.last_name,
        date_of_birth: workerData.date_of_birth, // Ya está en formato correcto YYYY-MM-DD
        profile_picture: workerData.profile_picture || null,
        bio: workerData.bio || null,
        experience_level: workerData.experience_level,
        location: workerData.location,
      };

      console.log('Worker payload:', workerPayload); // Debug para verificar la fecha

      const response = await fetch(`${API_URL}/workers/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workerPayload),
      });

      if (response.ok) {
        await updateUserVerification();
        setShowWorkerForm(false);
        Alert.alert('Éxito', 'Perfil de trabajador creado correctamente');
        await loadUserProfile();
        await refreshUserInfo();
      } else {
        const errorData = await response.json();
        console.log('Error creating worker:', errorData);
        Alert.alert('Error', 'No se pudo crear el perfil de trabajador');
      }
    } catch (error) {
      console.error('Error creating worker profile:', error);
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanySubmit = async () => {
    // Validaciones
    if (!companyData.company_name || !companyData.business_type || !companyData.address || !companyData.contact_person) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setIsLoading(true);
      const accessToken = await AsyncStorage.getItem('accessToken');

      // 1. Actualizar tipo de usuario a company
      const userUpdateResponse = await fetch(`${API_URL}/users/${user?.user_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_type: 'company'
        }),
      });

      if (!userUpdateResponse.ok) {
        Alert.alert('Error', 'No se pudo actualizar el tipo de usuario');
        return;
      }

      // 2. Crear perfil de empresa
      const companyPayload = {
        company_name: companyData.company_name,
        business_type: companyData.business_type,
        address: companyData.address,
        contact_person: companyData.contact_person,
        logo: companyData.logo || null,
        description: companyData.description || null,
        company_status: 'approved',
        user_id: user?.user_id,
      };

      const companyResponse = await fetch(`${API_URL}/companies/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyPayload),
      });

      if (companyResponse.ok) {
        // Actualizar usuario como verificado
        await updateUserVerification();
        setShowCompanyForm(false);
        Alert.alert('Éxito', 'Perfil de empresa creado correctamente');
        await loadUserProfile();
        await refreshUserInfo();
      } else {
        Alert.alert('Error', 'No se pudo crear el perfil de empresa');
      }
    } catch (error) {
      console.error('Error creating company profile:', error);
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserVerification = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      
      await fetch(`${API_URL}/users/${user?.user_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_verified: true
        }),
      });
    } catch (error) {
      console.error('Error updating user verification:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              const accessToken = await AsyncStorage.getItem('accessToken');
              
              if (accessToken) {
                await fetch(`${API_URL}/auth/logout`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                  },
                });
              }

              await AsyncStorage.multiRemove([
                'accessToken',
                'refreshToken',
                'userToken',
                'userEmail', 
                'userId',
                'userType',
                'isLoggedIn'
              ]);
              
              router.replace('/(auth)/login');
              
            } catch (error) {
              console.error('Error during logout:', error);
              try {
                await AsyncStorage.multiRemove([
                  'accessToken',
                  'refreshToken',
                  'userToken',
                  'userEmail', 
                  'userId',
                  'userType',
                  'isLoggedIn'
                ]);
                router.replace('/(auth)/login');
              } catch (clearError) {
                Alert.alert('Error', 'Hubo un problema cerrando la sesión. Reinicia la aplicación.');
              }
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  if (isLoading) {
    return <LoadingOverlay visible={true} message="Cargando perfil..." />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#62483E' }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>ChambApp</Text>
      </View>

      {/* Contenido perfil */}
      <View style={styles.profileContainer}>
        {userProfile && userProfile.is_verified ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Header del perfil con imagen y nombre */}
            <View style={styles.profileHeader}>
              <Image 
                source={
                  user?.user_type === 'worker' && userProfile.worker?.profile_picture
                    ? { uri: userProfile.worker.profile_picture }
                    : user?.user_type === 'company' && userProfile.company?.logo
                    ? { uri: userProfile.company.logo }
                    : require('../assets/default-avatar.png')
                } 
                style={styles.avatar} 
              />
              <View style={styles.nameSection}>
                <Text style={styles.userName}>
                  {user?.user_type === 'worker' 
                    ? `${userProfile.worker?.first_name || ''} ${userProfile.worker?.last_name || ''}`.trim() || 'Usuario'
                    : userProfile.company?.company_name || 'Empresa'
                  }
                </Text>
                <Text style={styles.userType}>
                  {user?.user_type === 'worker' ? 'Trabajador' : 'Empresa'}
                </Text>
                <View style={styles.ratingSection}>
                  {renderStars(userProfile.worker?.rating || userProfile.company?.rating || "0.00")}
                </View>
              </View>
              <TouchableOpacity style={styles.settingsButton}>
                <MaterialIcons name="settings" size={24} color="#57443D" />
              </TouchableOpacity>
            </View>

            {/* Información básica en cards */}
            <View style={styles.basicInfoContainer}>
              <View style={styles.infoCard}>
                <MaterialIcons name="email" size={20} color="#57443D" />
                <Text style={styles.infoText}>{userProfile.email}</Text>
              </View>
              <View style={styles.infoCard}>
                <MaterialIcons name="phone" size={20} color="#57443D" />
                <Text style={styles.infoText}>{userProfile.phone}</Text>
              </View>
              <View style={styles.infoCard}>
                <MaterialIcons name="account-balance-wallet" size={20} color="#57443D" />
                <Text style={styles.infoText}>
                  ${userProfile.worker?.balance || userProfile.company?.balance || "0.00"}
                </Text>
              </View>
            </View>

            {/* Información específica del Worker */}
            {user?.user_type === 'worker' && userProfile.worker && (
              <View style={styles.detailsContainer}>
                <Text style={styles.sectionTitle}>Información Personal</Text>
                
                <View style={styles.twoColumnRow}>
                  <View style={styles.detailCard}>
                    <MaterialIcons name="cake" size={18} color="#755B51" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Fecha de nacimiento</Text>
                      <Text style={styles.detailValue}>
                        {formatBirthDate(userProfile.worker.date_of_birth)}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailCard}>
                    <MaterialIcons name="location-on" size={18} color="#755B51" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Ubicación</Text>
                      <Text style={styles.detailValue}>{userProfile.worker.location}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.twoColumnRow}>
                  <View style={styles.detailCard}>
                    <MaterialIcons name="trending-up" size={18} color="#755B51" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Experiencia</Text>
                      <Text style={styles.detailValue}>
                        {userProfile.worker.experience_level === 'beginner' ? 'Principiante' :
                         userProfile.worker.experience_level === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailCard}>
                    <MaterialIcons name="work" size={18} color="#755B51" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Trabajos</Text>
                      <Text style={styles.detailValue}>{userProfile.worker.completed_jobs}</Text>
                    </View>
                  </View>
                </View>

                {userProfile.worker.bio && (
                  <View style={styles.bioCard}>
                    <MaterialIcons name="person" size={18} color="#755B51" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Biografía</Text>
                      <Text style={styles.bioText}>{userProfile.worker.bio}</Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Información específica de la Company */}
            {user?.user_type === 'company' && userProfile.company && (
              <View style={styles.detailsContainer}>
                <Text style={styles.sectionTitle}>Información de la Empresa</Text>
                
                <View style={styles.twoColumnRow}>
                  <View style={styles.detailCard}>
                    <MaterialIcons name="business" size={18} color="#755B51" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Tipo de negocio</Text>
                      <Text style={styles.detailValue}>{userProfile.company.business_type}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailCard}>
                    <MaterialIcons name="location-on" size={18} color="#755B51" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Dirección</Text>
                      <Text style={styles.detailValue}>{userProfile.company.address}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.twoColumnRow}>
                  <View style={styles.detailCard}>
                    <MaterialIcons name="person" size={18} color="#755B51" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Contacto</Text>
                      <Text style={styles.detailValue}>{userProfile.company.contact_person}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailCard}>
                    <MaterialIcons name="work" size={18} color="#755B51" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Trabajos publicados</Text>
                      <Text style={styles.detailValue}>{userProfile.company.total_jobs_posted}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.statusCard}>
                  <MaterialIcons name="verified" size={18} color="#755B51" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Estado</Text>
                    <Text style={[
                      styles.detailValue,
                      userProfile.company.status === 'approved' ? styles.statusApproved :
                      userProfile.company.status === 'pending' ? styles.statusPending :
                      styles.statusRejected
                    ]}>
                      {userProfile.company.status === 'approved' ? 'Aprobado' :
                       userProfile.company.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                    </Text>
                  </View>
                </View>

                {userProfile.company.description && (
                  <View style={styles.bioCard}>
                    <MaterialIcons name="description" size={18} color="#755B51" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Descripción</Text>
                      <Text style={styles.bioText}>{userProfile.company.description}</Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Botón de Logout */}
            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <MaterialIcons name="logout" size={20} color="#fff" />
              <Text style={styles.logoutText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <View style={styles.centeredContent}>
            <MaterialIcons name="account-circle" size={80} color="#755B51" style={{ marginBottom: 20 }} />
            <Text style={styles.welcomeText}>¡Bienvenido a ChambApp!</Text>
            <Text style={styles.verificationText}>
              Para completar tu perfil, necesitas verificar tu cuenta seleccionando el tipo de usuario.
            </Text>
            
            {/* Botón para activar modal de verificación */}
            <TouchableOpacity 
              style={styles.completeProfileButton}
              onPress={() => setShowVerificationModal(true)}
              activeOpacity={0.8}
            >
              <MaterialIcons name="person-add" size={24} color="#fff" />
              <Text style={styles.completeProfileText}>Completar Perfil</Text>
            </TouchableOpacity>
            
            {/* Información adicional */}
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
        )}
      </View>

      {/* Modal de verificación de cuenta */}
      <Modal
        visible={showVerificationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Completa tu perfil</Text>
            <Text style={styles.modalSubtitle}>
              Selecciona el tipo de cuenta que deseas crear:
            </Text>

            <TouchableOpacity 
              style={styles.accountTypeButton}
              onPress={() => handleAccountTypeSelection('worker')}
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
              onPress={() => handleAccountTypeSelection('company')}
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

      {/* Modal formulario Worker */}
      <Modal
        visible={showWorkerForm}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowWorkerForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.formModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Perfil de Trabajador</Text>
              <TouchableOpacity onPress={() => setShowWorkerForm(false)}>
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

              <Text style={styles.label}>URL de foto de perfil</Text>
              <TextInput
                style={styles.input}
                placeholder="https://ejemplo.com/foto.jpg"
                value={workerData.profile_picture}
                onChangeText={(text) => setWorkerData({...workerData, profile_picture: text})}
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
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowWorkerForm(false)}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitButton} onPress={handleWorkerSubmit}>
                  <Text style={styles.submitButtonText}>Crear perfil</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal formulario Company */}
      <Modal
        visible={showCompanyForm}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCompanyForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.formModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Perfil de Empresa</Text>
              <TouchableOpacity onPress={() => setShowCompanyForm(false)}>
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

              <Text style={styles.label}>URL del logo</Text>
              <TextInput
                style={styles.input}
                placeholder="https://ejemplo.com/logo.png"
                value={companyData.logo}
                onChangeText={(text) => setCompanyData({...companyData, logo: text})}
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
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowCompanyForm(false)}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitButton} onPress={handleCompanySubmit}>
                  <Text style={styles.submitButtonText}>Crear perfil</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#62483E',
    paddingTop: 35,
    height: 80,
  },
  logo: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 26,
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 16,
    color: '#4C3A34',
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 4,
  },
  profileContainer: {
    backgroundColor: '#D2D2D2',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -22,
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },

  // Nuevo header del perfil
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  nameSection: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4C3A34',
    marginBottom: 2,
  },
  userType: {
    fontSize: 14,
    color: '#755B51',
    marginBottom: 8,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButton: {
    padding: 8,
  },

  // Cards de información básica
  basicInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#4C3A34',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },

  // Contenedor de detalles
  detailsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4C3A34',
    marginBottom: 15,
    textAlign: 'center',
  },

  // Filas de dos columnas
  twoColumnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 10,
  },
  detailCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailContent: {
    marginLeft: 10,
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#755B51',
    fontWeight: '500',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    color: '#4C3A34',
    fontWeight: '600',
  },

  // Cards especiales
  bioCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bioText: {
    fontSize: 13,
    color: '#4C3A34',
    lineHeight: 18,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  // Estrellas compactas
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#755B51',
    marginLeft: 8,
    fontWeight: '500',
  },

  // Estados
  statusApproved: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  statusPending: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  statusRejected: {
    color: '#F44336',
    fontWeight: 'bold',
  },

  // Botón de logout mejorado
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C64545',
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginTop: 10,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  // Pantalla de bienvenida
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4C3A34',
    textAlign: 'center',
    marginBottom: 16,
  },
  verificationText: {
    fontSize: 16,
    color: '#755B51',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  
  // Botón para completar perfil
  completeProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#57443D',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 40,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 200,
  },
  completeProfileText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  
  // Contenedor de beneficios
  benefitsContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  benefitText: {
    fontSize: 16,
    color: '#4C3A34',
    marginLeft: 16,
    fontWeight: '500',
    flex: 1,
  },

  // Estilos de modales
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(98, 72, 62, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4C3A34',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#755B51',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  accountTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F0F0',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    width: '100%',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  accountTypeContent: {
    marginLeft: 12,
    flex: 1,
  },
  accountTypeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4C3A34',
    marginBottom: 4,
  },
  accountTypeDescription: {
    fontSize: 14,
    color: '#755B51',
    lineHeight: 18,
  },

  // Estilos de formularios
  formModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '90%',
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
  formScrollView: {
    maxHeight: 500,
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
    marginBottom: 12,
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
    marginBottom: 12,
  },
  picker: {
    color: '#4C3A34',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F0F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
    gap: 10,
  },
  dateText: {
    fontSize: 16,
    color: '#4C3A34',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
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
});
