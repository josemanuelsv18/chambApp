// Puedes guardar este componente como JobCard.tsx
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface JobCardProps {
  title: string;
  description: string;
  category: string;
  startDate: string;
  payment: string;
  companyName: string;
  logo?: string; // URL o require local
  onPress?: () => void; // Nuevo prop
}

const JobOfferCard: React.FC<JobCardProps> = ({
  title,
  description,
  category,
  startDate,
  payment,
  companyName,
  logo,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.headerRow}>
        {logo ? (
          typeof logo === 'string' ? (
            <Image source={{ uri: logo }} style={styles.logo} />
          ) : (
            <Image source={logo} style={styles.logo} />
          )
        ) : (
          <View style={styles.logoPlaceholder} />
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.company}>{companyName}</Text>
        </View>
      </View>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.infoRow}>
        <Text style={styles.chip}>{category}</Text>
        <Text style={styles.chip}>Inicio: {startDate}</Text>
        <Text style={styles.chip}>Pago: {payment}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginVertical: 10,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#EEE',
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4C3A34',
  },
  company: {
    fontSize: 15,
    color: '#755B51',
    marginTop: 2,
  },
  description: {
    fontSize: 15,
    color: '#57443D',
    marginBottom: 10,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#F2F0F0',
    color: '#755B51',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 13,
    marginRight: 7,
    marginBottom: 4,
  },
});

export default JobOfferCard;