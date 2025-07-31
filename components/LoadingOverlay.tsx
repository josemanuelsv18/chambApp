import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible, message = 'Cargando...' }) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#62483E" />
          <Text style={styles.text}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(98, 72, 62, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#62483E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 12,
    elevation: 8,
  },
  text: {
    marginTop: 14,
    fontSize: 17,
    color: '#62483E',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default LoadingOverlay;