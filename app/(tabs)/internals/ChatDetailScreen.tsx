import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ChatDetailScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#D2D2D2' }}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require('../../assets/avatar_header.png')} style={styles.avatar} />
        <View style={{ marginLeft: 8 }}>
          <Text style={styles.groupName}>Grupo Diferencial</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>En Línea</Text>
          </View>
        </View>
      </View>

      {/* Chat bubbles */}
      <View style={styles.messagesContainer}>
        {/* Mensaje recibido */}
        <View style={styles.row}>
          <Image source={require('../../assets/grupo_diferencial.png')} style={styles.msgAvatar} />
          <View style={styles.bubbleReceived}>
            <Text style={styles.textReceived}>¡Hola!, ¿Qué tal Karen?</Text>
          </View>
        </View>
        {/* Mensaje enviado */}
        <View style={[styles.row, { justifyContent: 'flex-end' }]}>
          <View style={styles.bubbleSent}>
            <Text style={styles.textSent}>¡Hola!</Text>
          </View>
        </View>
        {/* Mensaje recibido largo */}
        <View style={styles.row}>
          <Image source={require('../../assets/grupo_diferencial.png')} style={styles.msgAvatar} />
          <View style={styles.bubbleReceivedLarge}>
            <Text style={styles.textReceived}>
              Karen, te escribimos de Grupo Diferencial{"\n"}
              Espero esté bien.{"\n"}
              ¿Está disponible para una entrevista el próximo Lunes?
            </Text>
          </View>
        </View>
        {/* Mensaje enviado */}
        <View style={[styles.row, { justifyContent: 'flex-end' }]}>
          <View style={styles.bubbleSent}>
            <Text style={styles.textSent}>Claro, ¿Dónde seria?</Text>
          </View>
        </View>
        {/* Mensaje recibido corto */}
        <View style={styles.row}>
          <Image source={require('../../assets/grupo_diferencial.png')} style={styles.msgAvatar} />
          <View style={styles.bubbleReceivedShort}>
            <Text style={styles.textReceived}>
              A lado De Karen´s{"\n"}San Miguelito.
            </Text>
          </View>
        </View>
        {/* Mensaje enviado */}
        <View style={[styles.row, { justifyContent: 'flex-end' }]}>
          <View style={styles.bubbleSent}>
            <Text style={styles.textSent}>¡Listo, Ahí estaré!</Text>
          </View>
        </View>
      </View>

      {/* Caja de texto */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Aa"
          placeholderTextColor="#755B51"
        />
        <TouchableOpacity>
          <MaterialIcons name="arrow-forward-ios" size={28} color="#4C3A34" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#62483E',
    paddingTop: 40,
    paddingBottom: 18,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 28,
    backgroundColor: '#fff',
  },
  groupName: {
    color: '#4C3A34',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 0,
    marginTop: 4,
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: '#24CB22',
    marginRight: 4,
  },
  onlineText: {
    color: '#4C3A34',
    fontSize: 13,
  },
  messagesContainer: {
    flex: 1,
    padding: 14,
    paddingBottom: 60,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  msgAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    marginRight: 5,
  },
  bubbleReceived: {
    backgroundColor: '#F2F0F0',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxWidth: '70%',
  },
  bubbleReceivedLarge: {
    backgroundColor: '#F2F0F0',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '75%',
  },
  bubbleReceivedShort: {
    backgroundColor: '#F2F0F0',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '65%',
  },
  textReceived: {
    color: '#755B51',
    fontSize: 17,
  },
  bubbleSent: {
    backgroundColor: '#D2D2D2',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxWidth: '70%',
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: '#F2F0F0',
  },
  textSent: {
    color: '#4C3A34',
    fontSize: 17,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F0F0',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 30,
    marginHorizontal: 12,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#4C3A34',
    marginRight: 12,
  },
});
