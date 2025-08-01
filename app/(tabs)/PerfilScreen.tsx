import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import LoadingOverlay from '../../components/LoadingOverlay';
import BasicInfo from '../../components/PerfilScreen/BasicInfo';
import CompanyDetails from '../../components/PerfilScreen/CompanyDetails';
import CompanyFormModal from '../../components/PerfilScreen/CompanyFormModal';
import ProfileHeader from '../../components/PerfilScreen/ProfileHeader';
import VerificationModal from '../../components/PerfilScreen/VerificationModal';
import WelcomeScreen from '../../components/PerfilScreen/WelcomeScreen';
import WorkerDetails from '../../components/PerfilScreen/WorkerDetails';
import WorkerFormModal from '../../components/PerfilScreen/WorkerFormModal';

import { styles } from '../../components/PerfilScreen/PerfilScreenStyles';
import { API_URL } from '../../config/api';
import { useAuth } from '../../hooks/useAuth';

// Interfaces
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
  total_jobs_posted: number; // Este ahora será dinámico
  balance: string;
  status: string;
}

export default function PerfilScreen() {
  const { user, refreshUserInfo } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showWorkerForm, setShowWorkerForm] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const accessToken = await AsyncStorage.getItem('accessToken');
      
      const userResponse = await fetch(`${API_URL}/users/${user.user_id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        
        if (!userData.is_verified) {
          setUserProfile(userData);
          return;
        }
        
        let profileData = {
          ...userData,
          worker: null,
          company: null
        };
        
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
            const companyData = await companyResponse.json();
            
            // Obtener el número real de trabajos publicados
            const jobOffersCount = await getCompanyJobOffersCount(companyData.id, accessToken ?? '');
            
            profileData.company = {
              ...companyData,
              total_jobs_posted: jobOffersCount
            };
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

  // Nueva función para obtener el conteo real de trabajos publicados
  const getCompanyJobOffersCount = async (companyId: number, accessToken: string): Promise<number> => {
    try {
      const response = await fetch(`${API_URL}/job_offers/by_company/${companyId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const jobOffers = await response.json();
        return Array.isArray(jobOffers) ? jobOffers.length : 0;
      } else if (response.status === 404) {
        // No hay trabajos publicados
        return 0;
      } else {
        console.error('Error fetching job offers count:', response.status);
        return 0;
      }
    } catch (error) {
      console.error('Error getting job offers count:', error);
      return 0;
    }
  };

  const handleAccountTypeSelection = (type: 'worker' | 'company') => {
    setShowVerificationModal(false);
    if (type === 'worker') {
      setShowWorkerForm(true);
    } else {
      setShowCompanyForm(true);
    }
  };

  const handleWorkerSubmit = async (workerData: any) => {
    try {
      setIsLoading(true);
      const accessToken = await AsyncStorage.getItem('accessToken');

      const workerPayload = {
        user_id: user?.user_id,
        ...workerData,
      };

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
        Alert.alert('Error', 'No se pudo crear el perfil de trabajador');
      }
    } catch (error) {
      console.error('Error creating worker profile:', error);
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanySubmit = async (companyData: any) => {
    try {
      setIsLoading(true);
      const accessToken = await AsyncStorage.getItem('accessToken');

      // Actualizar tipo de usuario
      const userUpdateResponse = await fetch(`${API_URL}/users/${user?.user_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_type: 'company' }),
      });

      if (!userUpdateResponse.ok) {
        Alert.alert('Error', 'No se pudo actualizar el tipo de usuario');
        return;
      }

      // Crear perfil de empresa
      const companyPayload = {
        ...companyData,
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
        body: JSON.stringify({ is_verified: true }),
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
        { text: 'Cancelar', style: 'cancel' },
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
                'accessToken', 'refreshToken', 'userToken',
                'userEmail', 'userId', 'userType', 'isLoggedIn'
              ]);
              
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Hubo un problema cerrando la sesión');
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
            <ProfileHeader
              userType={user?.user_type || 'worker'}
              firstName={userProfile.worker?.first_name}
              lastName={userProfile.worker?.last_name}
              companyName={userProfile.company?.company_name}
              profilePicture={userProfile.worker?.profile_picture}
              logo={userProfile.company?.logo}
              rating={userProfile.worker?.rating || userProfile.company?.rating || "0.00"}
            />

            <BasicInfo
              email={userProfile.email}
              phone={userProfile.phone}
              balance={userProfile.worker?.balance || userProfile.company?.balance || "0.00"}
            />

            {user?.user_type === 'worker' && userProfile.worker && (
              <WorkerDetails
                dateOfBirth={userProfile.worker.date_of_birth}
                location={userProfile.worker.location}
                experienceLevel={userProfile.worker.experience_level}
                completedJobs={userProfile.worker.completed_jobs}
                bio={userProfile.worker.bio}
              />
            )}

            {user?.user_type === 'company' && userProfile.company && (
              <CompanyDetails
                businessType={userProfile.company.business_type}
                address={userProfile.company.address}
                contactPerson={userProfile.company.contact_person}
                totalJobsPosted={userProfile.company.total_jobs_posted} // Ahora es dinámico
                status={userProfile.company.status}
                description={userProfile.company.description}
              />
            )}

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <MaterialIcons name="logout" size={20} color="#fff" />
              <Text style={styles.logoutText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <WelcomeScreen onCompleteProfile={() => setShowVerificationModal(true)} />
        )}
      </View>

      {/* Modales */}
      <VerificationModal
        visible={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onSelectType={handleAccountTypeSelection}
      />

      <WorkerFormModal
        visible={showWorkerForm}
        onClose={() => setShowWorkerForm(false)}
        onSubmit={handleWorkerSubmit}
      />

      <CompanyFormModal
        visible={showCompanyForm}
        onClose={() => setShowCompanyForm(false)}
        onSubmit={handleCompanySubmit}
      />
    </View>
  );
}
