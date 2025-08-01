import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { styles } from './PerfilScreenStyles';

interface ProfileHeaderProps {
  userType: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  profilePicture?: string;
  logo?: string;
  rating: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  userType,
  firstName,
  lastName,
  companyName,
  profilePicture,
  logo,
  rating
}) => {
  const renderStars = () => {
    const numRating = parseFloat(rating);
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesome
          key={i}
          name={i <= numRating ? "star" : i - 0.5 <= numRating ? "star-half-o" : "star-o"}
          size={16}
          color="#E7E67D"
          style={{ marginRight: 2 }}
        />
      );
    }
    
    return (
      <View style={styles.starsContainer}>
        {stars}
        <Text style={styles.ratingText}>({rating})</Text>
      </View>
    );
  };

  const getDisplayName = () => {
    if (userType === 'worker') {
      return `${firstName || ''} ${lastName || ''}`.trim() || 'Usuario';
    }
    return companyName || 'Empresa';
  };

  const getImageSource = () => {
    if (userType === 'worker' && profilePicture) {
      return { uri: profilePicture };
    }
    if (userType === 'company' && logo) {
      return { uri: logo };
    }
    return require('../../app/assets/default-avatar.png'); // Default avatar image
  };

  return (
    <View style={styles.profileHeader}>
      <Image source={getImageSource()} style={styles.avatar} />
      <View style={styles.nameSection}>
        <Text style={styles.userName}>{getDisplayName()}</Text>
        <Text style={styles.userType}>
          {userType === 'worker' ? 'Trabajador' : 'Empresa'}
        </Text>
        <View style={styles.ratingSection}>
          {renderStars()}
        </View>
      </View>
      <TouchableOpacity style={styles.settingsButton}>
        <MaterialIcons name="settings" size={24} color="#57443D" />
      </TouchableOpacity>
    </View>
  );
};

export default ProfileHeader;