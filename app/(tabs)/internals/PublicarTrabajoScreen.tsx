import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PerfilScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#62483E' }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>ChambApp</Text>
      </View>

      {/* Contenido perfil */}
      <View style={styles.profileContainer}>
        <View style={styles.rowBetween}>
          <Text style={styles.userName}>Karen Sanchez</Text>
          <TouchableOpacity>
            <MaterialIcons name="settings" size={28} color="#57443D" />
          </TouchableOpacity>
        </View>
        <Image source={require('../../assets/karen_avatar.png')} style={styles.avatar} />

        {/* Usuario y correo */}
        <Text style={styles.label}>Usuario</Text>
        <View style={styles.chipRow}>
          <Text style={styles.chip}>@akabadmoonie</Text>
        </View>

        <View style={styles.rowBetween}>
          <Text style={styles.label}>Nombre completo</Text>
          <Text style={styles.label}>Email</Text>
        </View>
        <View style={styles.chipRow}>
          <Text style={[styles.chip, { marginRight: 9 }]}>Karen Sanchez</Text>
          <Text style={styles.chip}>karen@gmail.com</Text>
        </View>

        {/* Habilidades */}
        <Text style={styles.label}>Habilidades</Text>
        <View style={styles.chipRow}>
          <Text style={styles.chipLarge}>atención al cliente, marketing, publicidad, frontend</Text>
        </View>

        {/* Disponibilidad */}
        <Text style={styles.label}>Disponibilidad</Text>
        <View style={styles.chipRow}>
          <Text style={[styles.chip, { marginRight: 9 }]}>Fines de semana</Text>
          <Text style={styles.chip}>virtual</Text>
        </View>

        {/* Rating */}
        <View style={styles.ratingRow}>
          <Text style={styles.label}>RATING</Text>
          <View style={styles.stars}>
            <FontAwesome name="star" size={22} color="#E7E67D" style={styles.starMargin} />
            <FontAwesome name="star" size={22} color="#E7E67D" style={styles.starMargin} />
            <FontAwesome name="star" size={22} color="#E7E67D" style={styles.starMargin} />
            <FontAwesome name="star" size={22} color="#E7E67D" style={styles.starMargin} />
            <FontAwesome name="star-o" size={22} color="#4C3A34" />
          </View>
          <View style={styles.chipScore}>
            <Text style={styles.score}>4/5</Text>
          </View>
        </View>
      </View>
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
  profileContainer: {
    backgroundColor: '#D2D2D2',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -22,
    flex: 1,
    padding: 22,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    color: '#4C3A34',
    fontWeight: '500',
    fontSize: 22,
    textAlign: 'center',
    flex: 1,
  },
  avatar: {
    alignSelf: 'center',
    width: 92,
    height: 92,
    borderRadius: 45,
    marginTop: 8,
    marginBottom: 14,
    resizeMode: 'cover',
  },
  label: {
    color: '#4C3A34',
    fontWeight: '600',
    fontSize: 15,
    marginTop: 7,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 6,
    alignItems: 'center',
  },
  chip: {
    backgroundColor: '#F2F0F0',
    borderRadius: 15,
    paddingVertical: 7,
    paddingHorizontal: 16,
    color: '#755B51',
    fontSize: 15,
    marginRight: 0,
    marginBottom: 5,
  },
  chipLarge: {
    backgroundColor: '#F2F0F0',
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 13,
    color: '#755B51',
    fontSize: 14,
    flex: 1,
    marginBottom: 5,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  stars: {
    flexDirection: 'row',
    marginLeft: 12,
    alignItems: 'center',
  },
  starMargin: {
    marginRight: 7,
  },
  chipScore: {
    backgroundColor: '#F2F0F0',
    borderRadius: 15,
    paddingVertical: 7,
    paddingHorizontal: 18,
    marginLeft: 15,
  },
  score: {
    color: '#4C3A34',
    fontWeight: 'bold',
    fontSize: 17,
    textAlign: 'center',
  },
});
