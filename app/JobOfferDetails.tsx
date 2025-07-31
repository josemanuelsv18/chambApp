import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function JobOfferDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();

  return (
    <View style={{ flex: 1, backgroundColor: '#62483E' }}>
      {/* Header con botón de retroceso */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/internals/HomeScreen')} style={styles.backButton}>
          <MaterialIcons name="arrow-back-ios" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del Empleo</Text>
      </View>
      <ScrollView style={{ flex: 1, backgroundColor: '#D2D2D2' }}>
        <View style={styles.container}>
          {params.logo && (
            <Image source={{ uri: params.logo as string }} style={styles.logo} />
          )}
          <Text style={styles.title}>{params.title}</Text>
          <Text style={styles.company}>{params.companyName}</Text> 
          <View style={styles.chipRow}>
            <Text style={styles.chip}>{params.category}</Text>
            <Text style={styles.chip}>Inicio: {params.startDate}</Text>
            <Text style={styles.chip}>Pago: {params.payment}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>Descripción</Text>
            <Text style={styles.description}>{params.description}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#62483E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 44,
    paddingBottom: 18,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 4,
  },
  backButton: {
    marginRight: 8,
    padding: 4,
    borderRadius: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  container: {
    alignItems: 'center',
    padding: 28,
    paddingTop: 32,
  },
  logo: {
    width: 110,
    height: 110,
    borderRadius: 22,
    marginBottom: 18,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4C3A34',
    marginBottom: 2,
    textAlign: 'center',
  },
  company: {
    fontSize: 18,
    color: '#755B51',
    marginBottom: 12,
    textAlign: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
    justifyContent: 'center',
  },
  chip: {
    backgroundColor: '#F2F0F0',
    color: '#755B51',
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 7,
    fontSize: 15,
    marginRight: 7,
    marginBottom: 6,
    fontWeight: '500',
  },
  section: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontWeight: 'bold',
    color: '#4C3A34',
    fontSize: 17,
    marginBottom: 6,
  },
  description: {
    fontSize: 16,
    color: '#57443D',
    marginBottom: 2,
    lineHeight: 22,
  },
});