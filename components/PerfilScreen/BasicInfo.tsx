import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { styles } from './PerfilScreenStyles';

interface BasicInfoProps {
  email: string;
  phone: string;
  balance: string;
}

const BasicInfo: React.FC<BasicInfoProps> = ({ email, phone, balance }) => {
  return (
    <View style={styles.basicInfoContainer}>
      <View style={styles.infoCard}>
        <MaterialIcons name="email" size={20} color="#57443D" />
        <Text style={styles.infoText}>{email}</Text>
      </View>
      <View style={styles.infoCard}>
        <MaterialIcons name="phone" size={20} color="#57443D" />
        <Text style={styles.infoText}>{phone}</Text>
      </View>
      <View style={styles.infoCard}>
        <MaterialIcons name="account-balance-wallet" size={20} color="#57443D" />
        <Text style={styles.infoText}>${balance}</Text>
      </View>
    </View>
  );
};

export default BasicInfo;