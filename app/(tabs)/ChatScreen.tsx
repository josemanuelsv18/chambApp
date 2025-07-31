import React from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ChatScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#62483E' }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>ChambApp</Text>
      </View>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Chat</Text>
        <TextInput
          placeholder="Buscar Chat"
          placeholderTextColor="#755B51"
          style={styles.searchBar}
        />

        {/* Chat card */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: '#755B51',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  innerContainer: {
    flex: 1,
    padding: 16,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 20,
    color: '#62483E',
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  groupName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#62483E',
  },
  lastMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  lastMessage: {
    color: '#755B51',
    flex: 1,
  },
  badge: {
    backgroundColor: '#E4572E',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
