import React from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Linking,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AppText from '../AppText'; 
import CloseCircle from '../icons/CloseCircle';
import {colors} from '../../styles/colors'; 
const { width } = Dimensions.get('window');

const isImage = (fileName = '') =>
  /\.(jpg|jpeg|png)$/i.test(fileName);

const DocumentPreviewModal = ({
  visible = false,
  onClose,
  uploadedFile,
  signedUrl,
  loading = false,
}) => {
  if (!visible) return null;



  return (
    <View style={styles.topSheetWrapper}>

      {/* Header */}
      <View style={styles.topSheetHeader}>
        <AppText style={styles.topSheetTitle} numberOfLines={1}>
          {uploadedFile?.name || 'Document Preview'}
        </AppText>

        <TouchableOpacity onPress={onClose}>
          <CloseCircle />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.previewContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : signedUrl && isImage(uploadedFile?.name) ? (
          <Image
            source={{ uri: signedUrl }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.filePlaceholder}>
            <Icon name="document-text" size={70} color="#999" />
            <AppText style={styles.documentName}>
              {uploadedFile?.name}
            </AppText>

            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => signedUrl && Linking.openURL(signedUrl)}
            >
              <Icon name="download-outline" size={18} color="#fff" />
              <AppText style={styles.downloadText}>Download</AppText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topSheetWrapper: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    elevation: 6, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    zIndex: 10,
  },

  topSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },

  topSheetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    flex: 1,
    marginRight: 10,
  },

  previewContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },

  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 8,
  },

  filePlaceholder: {
    alignItems: 'center',
    paddingVertical: 20,
  },

  documentName: {
    marginTop: 10,
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },

  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 14,
  },

  downloadText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
  },
});

