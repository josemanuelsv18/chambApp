import JobOfferCard from '@/components/JobOfferCard';
import LoadingOverlay from '@/components/LoadingOverlay';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { API_URL } from '../../../config/api';

interface JobOffer {
  id: number;
  company_id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  required_workers: number;
  hourly_rate: string;
  total_payment: string;
  experience_level: string;
  status: string;
  created_at: string;
  updated_at: string;
  company_name: string;
  business_type: string;
  logo: string;
}

export default function HomeScreen() {
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadJobOffers();
  }, []);

  const loadJobOffers = async () => {
    try {
      setIsLoading(true);
      console.log('Cargando ofertas de trabajo...');
      
      const response = await fetch(`${API_URL}/job_offers/with_company/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Ofertas cargadas:', data.length);
        setJobOffers(data);
      } else {
        console.error('Error en la respuesta:', response.status);
        setJobOffers([]);
      }
    } catch (error) {
      console.error("Error loading job offers:", error);
      setJobOffers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para refrescar con pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadJobOffers();
    setRefreshing(false);
  }, []);

  const handleCardPress = (jobOffer: JobOffer) => {
    router.push({
      pathname: '/JobOfferDetails',
      params: {
        id: jobOffer.id.toString(),
        title: jobOffer.title,
        description: jobOffer.description,
        category: jobOffer.category,
        startDate: jobOffer.start_date,
        payment: `$${jobOffer.total_payment}`,
        companyName: jobOffer.company_name,
        logo: jobOffer.logo,
        // Datos adicionales que puedes necesitar después
        companyId: jobOffer.company_id.toString(),
        location: jobOffer.location,
        endDate: jobOffer.end_date,
        startTime: jobOffer.start_time,
        endTime: jobOffer.end_time,
        requiredWorkers: jobOffer.required_workers.toString(),
        hourlyRate: jobOffer.hourly_rate,
        experienceLevel: jobOffer.experience_level,
        status: jobOffer.status,
        businessType: jobOffer.business_type,
      }
    });
  };

  const formatPayment = (totalPayment: string, hourlyRate: string) => {
    if (parseFloat(hourlyRate) > 0) {
      return `$${hourlyRate}/hr`;
    }
    return `$${totalPayment}`;
  };

  const formatCategory = (category: string, businessType: string) => {
    if (category === 'other') {
      return businessType;
    }
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#62483E' }}>
      <LoadingOverlay visible={isLoading} message="Cargando empleos..." />
      
      <View style={styles.header}>
        <Text style={styles.logo}>ChambApp</Text>
      </View>
      
      <View style={styles.containerGray}>
        <Text style={styles.title}>Empleos disponibles</Text>
        
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#57443D']}
              tintColor="#57443D"
            />
          }
        >
          {jobOffers.length > 0 ? (
            jobOffers.map((jobOffer) => (
              <JobOfferCard
                key={jobOffer.id}
                title={jobOffer.title}
                description={jobOffer.description}
                category={formatCategory(jobOffer.category, jobOffer.business_type)}
                startDate={jobOffer.start_date}
                payment={formatPayment(jobOffer.total_payment, jobOffer.hourly_rate)}
                companyName={jobOffer.company_name}
                logo={jobOffer.logo}
                onPress={() => handleCardPress(jobOffer)}
              />
            ))
          ) : (
            !isLoading && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No hay empleos disponibles</Text>
              </View>
            )
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#62483E',
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 32,
  },
  logo: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 26,
    letterSpacing: 0.5,
  },
  containerGray: {
    backgroundColor: '#D2D2D2',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  title: {
    fontSize: 32,
    color: '#4C3A34',
    fontWeight: '600',
    marginBottom: 18,
    marginTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#755B51',
    textAlign: 'center',
  },
});
