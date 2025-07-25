import React from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ChatScreen() {
  return (
    <View style={styles.container}>
      {/* Top bar marrón con logo y avatar */}
      <View style={styles.header}>
        <Image source={require('../assets/Logo_ChambApp.png')} style={styles.logo} />
        <Image source={require('../assets/avatar_header.png')} style={styles.avatarHeader} />
      </View>
      {/* Bloque gris con curva */}
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Chat</Text>
        <TextInput
          placeholder="Buscar Chat"
          placeholderTextColor="#755B51"
          style={styles.searchBar}
        />

        {/* ÚNICO chat card */}
        <TouchableOpacity style={styles.chatCard}>
          <Image source={require('../assets/grupo_diferencial.png')} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.groupName}>Grupo Diferencial</Text>
            <View style={styles.lastMessageRow}>
              <Text style={styles.lastMessage}>¡Hola!, ¿Que tal Karen?..</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>1</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
      {/* Puedes agregar tu BottomNavigation aquí si quieres */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#62483E' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 34,
    height: 100,
    justifyContent: 'space-between',
    backgroundColor: '#62483E',
  },
  logo: {
    width: 110,
    height: 38,
    resizeMode: 'contain',
  },
  avatarHeader: {
    width: 58,
    height: 58,
    resizeMode: 'contain',
  },
  innerContainer: {
    flex: 1,
    backgroundColor: '#D2D2D2',
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    paddingTop: 24,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  title: {
    color: '#4C3A34',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  searchBar: {
    backgroundColor: '#F2F0F0',
    borderRadius: 22,
    height: 42,
    width: '90%',
    marginBottom: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#4C3A34',
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F0F0',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 18,
    width: '93%',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 32,
    marginRight: 16,
    backgroundColor: '#fff',
    resizeMode: 'contain',
  },
  groupName: {
    color: '#4C3A34',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 2,
  },
  lastMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  lastMessage: {
    color: '#755B51',
    fontSize: 15,
    flex: 1,
  },
  badge: {
    backgroundColor: '#fff',
    borderRadius: 50,
    paddingHorizontal: 9,
    paddingVertical: 2,
    marginLeft: 10,
    borderColor: '#D2D2D2',
    borderWidth: 1,
    minWidth: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#4C3A34',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
