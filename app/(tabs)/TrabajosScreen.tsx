import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function TrabajosScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#62483E' }}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Image source={require('../assets/Logo_ChambApp.png')} style={styles.logo} />
        <TextInput
          placeholder='Buscar en “Mis trabajos”'
          placeholderTextColor="#755B51"
          style={styles.searchBar}
        />
      </View>

      {/* Contenedor gris */}
      <View style={styles.containerGray}>
        <Text style={styles.title}>Mis trabajos</Text>

        <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%' }}>
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

      {/* Barra de navegación */}
      <View style={styles.tabBar}>
        <Image source={require('../assets/home_icon.png')} style={styles.tabIcon} />
        <Image source={require('../assets/briefcase_icon.png')} style={styles.tabIcon} />
        <Image source={require('../assets/chat_icon.png')} style={styles.tabIcon} />
        <Image source={require('../assets/profile_icon.png')} style={styles.tabIcon} />
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
    width: 135,
    height: 35,
    marginBottom: 18,
    resizeMode: 'contain',
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
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F2F0F0',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 65,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: -1 },
  },
  tabIcon: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
  },
});
