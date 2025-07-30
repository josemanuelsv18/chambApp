import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function TrabajosScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#62483E' }}>
      <View style={styles.header}>
        <Text style={styles.logo}>ChambApp</Text>
        <TextInput
          placeholder='Buscar en “Mis trabajos”'
          placeholderTextColor="#755B51"
          style={styles.searchBar}
        />
      </View>

      <View style={styles.containerGray}>
        <Text style={styles.title}>Mis trabajos</Text>
        <ScrollView style={{ width: '100%' }}>
          {/* Trabajo 1 */}
          <View style={styles.card}>
            <Image source={require('../assets/vaqueras.png')} style={styles.companyLogo} />
            <View style={{ flex: 1 }}>
              <Text style={styles.position}>Publicidad (eventual){"\n"}vaquitas</Text>
              <Text style={styles.detail}>5.00$/h     24/07/2025</Text>
              <Text style={styles.status}>Estado: <Text style={{ color: '#755B51' }}>En Progreso</Text></Text>
            </View>
          </View>
          {/* Trabajo 2 */}
          <View style={styles.card}>
            <Image source={require('../assets/grupo_diferencial.png')} style={styles.companyLogo} />
            <View style={{ flex: 1 }}>
              <Text style={styles.position}>Publicidad (eventual){"\n"}Cholos</Text>
              <Text style={styles.detail}>2.60$/h     22/06/2024</Text>
              <Text style={styles.status}>Estado: <Text style={{ color: '#755B51' }}>Finalizado</Text></Text>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>evaluar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 22,
    backgroundColor: '#62483E',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  logo: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 26,
    marginBottom: 10,
  },
  searchBar: {
    backgroundColor: '#F2F0F0',
    color: '#755B51',
    fontSize: 17,
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 10,
    width: '100%',
    marginBottom: 0,
  },
  containerGray: {
    backgroundColor: '#D2D2D2',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 10,
    paddingTop: 12,
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    color: '#4C3A34',
    fontWeight: '600',
    alignSelf: 'center',
    marginVertical: 10,
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#F2F0F0',
    borderRadius: 28,
    alignItems: 'flex-start',
    padding: 18,
    marginBottom: 18,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
  },
  companyLogo: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
    marginRight: 12,
    marginTop: 5,
  },
  position: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4C3A34',
    marginBottom: 6,
  },
  detail: {
    color: '#4C3A34',
    fontSize: 16,
    marginBottom: 2,
  },
  status: {
    color: '#4C3A34',
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#57443D',
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 34,
    paddingVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
});
