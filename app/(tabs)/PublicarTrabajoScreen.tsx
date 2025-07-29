import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import CheckBox from '@react-native-community/checkbox';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function PublicarTrabajoScreen() {
  const [puesto, setPuesto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [virtual, setVirtual] = useState(false);
  const [presencial, setPresencial] = useState(false);
  const [hibrido, setHibrido] = useState(false);
  const [salario, setSalario] = useState('');
  const [ubicacion, setUbicacion] = useState('');

  const handlePublicar = () => {
    // Aquí iría la lógica para publicar trabajo
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#62483E' }}>
      <View style={styles.header}>
        {/* Logo y Coffeshop */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 25, marginLeft: 10 }}>
          <MaterialIcons name="work" size={38} color="#fff" />
          <Text style={styles.logoText}>ChambApp</Text>
          {/* Puedes poner aquí la imagen del Coffeshop si la tienes */}
        </View>
      </View>
      <View style={styles.mainContainer}>
        <Text style={styles.title}>Publicar trabajo</Text>

        {/* Nombre del puesto */}
        <View style={styles.inputBox}>
          <MaterialIcons name="work-outline" size={25} color="#755B51" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Nombre del puesto"
            placeholderTextColor="#b8b6b6"
            value={puesto}
            onChangeText={setPuesto}
          />
        </View>

        {/* Descripción */}
        <View style={[styles.inputBox, { height: 100, alignItems: 'flex-start', paddingTop: 12 }]}>
          <MaterialIcons name="description" size={25} color="#755B51" style={styles.icon} />
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            placeholder="Descripción del puesto (Requisitos y Salario)"
            placeholderTextColor="#b8b6b6"
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
          />
        </View>

        {/* Modalidad */}
        <View style={styles.modalidadContainer}>
          <Text style={styles.modalidadLabel}>Modalidad del trabajo</Text>
          <View style={styles.checkRow}>
            <Text style={styles.modalidadText}>Virtual</Text>
            <CheckBox
              value={virtual}
              onValueChange={setVirtual}
              tintColors={{ true: "#62483E", false: "#D2D2D2" }}
            />
          </View>
          <View style={styles.checkRow}>
            <Text style={styles.modalidadText}>Presencial</Text>
            <CheckBox
              value={presencial}
              onValueChange={setPresencial}
              tintColors={{ true: "#62483E", false: "#D2D2D2" }}
            />
          </View>
          <View style={styles.checkRow}>
            <Text style={styles.modalidadText}>Híbrido</Text>
            <CheckBox
              value={hibrido}
              onValueChange={setHibrido}
              tintColors={{ true: "#62483E", false: "#D2D2D2" }}
            />
          </View>
        </View>

        {/* Salario */}
        <View style={styles.inputBox}>
          <FontAwesome name="dollar" size={22} color="#755B51" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Salario"
            placeholderTextColor="#b8b6b6"
            value={salario}
            onChangeText={setSalario}
            keyboardType="numeric"
          />
        </View>

        {/* Ubicación */}
        <View style={styles.inputBox}>
          <MaterialIcons name="location-on" size={25} color="#755B51" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Ubicación"
            placeholderTextColor="#b8b6b6"
            value={ubicacion}
            onChangeText={setUbicacion}
          />
        </View>

        {/* Botón */}
        <TouchableOpacity style={styles.button} onPress={handlePublicar}>
          <Text style={styles.buttonText}>Publicar Trabajo</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#62483E',
    height: 100,
    justifyContent: 'flex-end',
    paddingBottom: 15,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  logoText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 23,
    marginLeft: 8,
  },
  mainContainer: {
    backgroundColor: '#D2D2D2',
    flex: 1,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 15,
    paddingTop: 18,
    alignItems: 'center',
  },
  title: {
    color: "#4C3A34",
    fontWeight: 'bold',
    fontSize: 32,
    marginBottom: 16,
    alignSelf: 'flex-start'
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F0F0',
    borderRadius: 24,
    marginBottom: 14,
    paddingHorizontal: 16,
    width: '100%',
    height: 50,
    borderWidth: 0,
    marginTop: 2
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#4C3A34',
  },
  modalidadContainer: {
    backgroundColor: '#F2F0F0',
    borderRadius: 24,
    marginBottom: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: '100%',
    alignItems: 'flex-start',
  },
  modalidadLabel: {
    color: '#4C3A34',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    marginLeft: 4,
  },
  modalidadText: {
    color: '#4C3A34',
    fontSize: 16,
    marginRight: 10,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#57443D',
    paddingVertical: 13,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
});
