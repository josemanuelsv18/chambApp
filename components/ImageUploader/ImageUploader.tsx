import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { CLOUDINARY_CONFIG, CLOUDINARY_UPLOAD_URL } from '../../config/cloudinary';

interface ImageUploaderProps {
  onImageUploaded: (imageUrl: string) => void;
  currentImageUrl?: string;
  placeholder?: string;
  style?: any;
  imageStyle?: any;
  showLabel?: boolean;
  label?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUploaded,
  currentImageUrl,
  placeholder = "Seleccionar imagen",
  style,
  imageStyle,
  showLabel = true,
  label = "Imagen"
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(currentImageUrl || null);

  // Solicitar permisos
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permisos requeridos',
        'Se necesitan permisos de cámara y galería para subir imágenes.'
      );
      return false;
    }
    return true;
  };

  // Mostrar opciones de selección
  const showImageOptions = () => {
    Alert.alert(
      'Seleccionar imagen',
      'Elige una opción',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cámara', onPress: takePicture },
        { text: 'Galería', onPress: pickFromGallery },
      ],
      { cancelable: true }
    );
  };

  // Tomar foto con cámara
  const takePicture = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPreviewUri(result.assets[0].uri);
        await uploadToCloudinary(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  // Seleccionar de galería
  const pickFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPreviewUri(result.assets[0].uri);
        await uploadToCloudinary(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  // Subir imagen a Cloudinary
  const uploadToCloudinary = async (imageUri: string) => {
    try {
      setUploading(true);

      // Crear FormData
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `image_${Date.now()}.jpg`,
      } as any);
      formData.append('upload_preset', CLOUDINARY_CONFIG.upload_preset);
      formData.append('cloud_name', CLOUDINARY_CONFIG.cloud_name);

      // Subir a Cloudinary
      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const imageUrl = data.secure_url;
        
        // Llamar callback con la URL
        onImageUploaded(imageUrl);
        
        Alert.alert('Éxito', 'Imagen subida correctamente');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      Alert.alert('Error', 'No se pudo subir la imagen');
      setPreviewUri(currentImageUrl || null); // Revertir preview
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {showLabel && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={showImageOptions}
        disabled={uploading}
      >
        {previewUri ? (
          <View style={styles.imageWrapper}>
            <Image 
              source={{ uri: previewUri }} 
              style={[styles.image, imageStyle]} 
            />
            {uploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.uploadingText}>Subiendo...</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <MaterialIcons name="add-a-photo" size={40} color="#755B51" />
            <Text style={styles.placeholderText}>{placeholder}</Text>
          </View>
        )}
      </TouchableOpacity>

      {previewUri && !uploading && (
        <TouchableOpacity 
          style={styles.changeButton} 
          onPress={showImageOptions}
        >
          <MaterialIcons name="edit" size={16} color="#57443D" />
          <Text style={styles.changeButtonText}>Cambiar imagen</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#4C3A34',
    fontWeight: '600',
    marginBottom: 8,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F2F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#755B51',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F2F0F0',
    borderRadius: 8,
    alignSelf: 'center',
  },
  changeButtonText: {
    color: '#57443D',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default ImageUploader;