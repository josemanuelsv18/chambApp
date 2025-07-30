import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#62483E' }}>
      <View style={styles.header}>
        <Text style={styles.logo}>ChambApp</Text>
      </View>
      <View style={styles.containerGray}>
        <Text style={styles.title}>Empleos disponibles</Text>
        <ScrollView>
          {/* Aquí van tus cards de empleo */}
          <Text style={{ color: '#755B51', fontSize: 18, marginTop: 20, alignSelf: 'center' }}>
            (Cards de empleos aquí)
          </Text>
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
});
