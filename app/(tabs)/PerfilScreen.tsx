import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PerfilScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#62483E' }}>
      {/* Header con logo y personaje */}
      <View style={styles.header}>
        <Image source={require('../assets/Logo_ChambApp.png')} style={styles.logo} />
        <Image source={require('../assets/avatar_header.png')} style={styles.avatarHeader} />
      </View>

      {/* Contenido perfil */}
      <View style={styles.profileContainer}>
        <View style={styles.rowBetween}>
          <Text style={styles.userName}>Karen Sanchez</Text>
          <TouchableOpacity>
            <MaterialIcons name="settings" size={28} color="#57443D" />
          </TouchableOpacity>
        </View>
        <Image source={require('../assets/karen_avatar.png')} style={styles.avatar} />

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
          <Text style={styles.chip}>Karen Sanchez</Text>
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
          <Text style={styles.chip}>Fines de semana</Text>
          <Text style={styles.chip}>virtual</Text>
        </View>

        {/* Rating */}
        <View style={styles.ratingRow}>
          <Text style={styles.label}>RATING</Text>
          <View style={styles.stars}>
            <FontAwesome name="star" size={22} color="#E7E67D" />
            <FontAwesome name="star" size={22} color="#E7E67D" />
            <FontAwesome name="star" size={22} color="#E7E67D" />
            <FontAwesome name="star" size={22} color="#E7E67D" />
            <FontAwesome name="star-o" size={22} color="#4C3A34" />
          </View>
          <View style={styles.chipScore}>
            <Text style={styles.score}>4/5</Text>
          </View>
        </View>
      </View>

      {/* Barra de navegación inferior (puedes crearla como componente aparte y reusar) */}
      <View style={styles.navbar}>
        <MaterialIcons name="home" size={34} color="#4C3A34" />
        <MaterialIcons name="work" size={30} color="#755B51" />
        <MaterialIcons name="chat-bubble-outline" size={32} color="#755B51" />
        <MaterialIcons name="person" size={32} color="#755B51" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    paddingTop: 35,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#62483E',
    height: 110,
  },
  logo: {
    width: 100,
    height: 34,
    resizeMode: 'contain',
  },
  avatarHeader: {
    width: 72,
    height: 72,
    resizeMode: 'contain',
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
    gap: 9,
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
    marginRight: 7,
  },
  chipLarge: {
    backgroundColor: '#F2F0F0',
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 13,
    color: '#755B51',
    fontSize: 14,
    flex: 1,
    marginRight: 7,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 7,
  },
  stars: {
    flexDirection: 'row',
    marginLeft: 12,
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
  navbar: {
    backgroundColor: '#F2F0F0',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    height: 64,
  },
});
