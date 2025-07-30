import React from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';

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

// ...Tus estilos igual
