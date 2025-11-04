// src/components/FileUploadComponent.js

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Platform,
  Modal,
  Image,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { pick, types, keepLocalCopy } from '@react-native-documents/picker';
import { colors } from '../styles/colors';
import Upload from './icons/Upload';
import CloseCircle from './icons/CloseCircle';
import EyeOpen from './icons/EyeOpen';
import apiClient from '../api/apiClient';

const { width } = Dimensions.get('window');

const FileUploadComponent = ({
  placeholder = 'Upload file',
  accept = ['pdf', 'jpg', 'jpeg', 'png'], // Accepted file extensions
  maxSize = 10 * 1024 * 1024, // 5MB default
  onFileUpload,
  onFileDelete,
  initialFile = null, // { fileName: '', s3Path: '' }
  docType = null, // Document type ID for API
  customerId = 1, // Customer ID for API
  disabled = false,
  showPreview = true,
  style,
  errorMessage,
}) => {
  const [file, setFile] = useState(initialFile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(errorMessage);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [signedUrl, setSignedUrl] = useState(null);
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setFile(initialFile);
  }, [initialFile]);

  useEffect(() => {
    setError(errorMessage);
  }, [errorMessage]);

  // Animate on file change
  useEffect(() => {
    if (file) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [file]);

  const handleSelectFile = async () => {
    if (disabled || loading) return;

    // For images, use image picker
    const isImageOnly = accept.every(ext => ['jpg', 'jpeg', 'png', 'gif'].includes(ext));
    
    if (isImageOnly) {
      // Show options for camera or gallery
      Alert.alert(
        'Select Image',
        'Choose from where you want to select an image',
        [
          { text: 'Camera', onPress: handleCamera },
          { text: 'Gallery', onPress: handleGallery },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true }
      );
    } else {
      // For PDFs and mixed file types, show file selection message
      Alert.alert(
        'File Selection',
        `Please select a ${accept.join(' or ')} file from your device.\n\nNote: On Android, you can use your file manager app. On iOS, files must be in your Files app.`,
        [
          { text: 'Open Gallery', onPress: handleGallery },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true }
      );
    }
  };

  const handleCamera = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchCamera(options, handleImageResponse);
  };

  const handleDocumentPicker = async () => {  console.log("handleDocumentPicker is called");
    try {
    const [file] = await pick({ type: [ types.allFiles ] });  console.log(file);

    // Validate size
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Validate extension
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop().toLowerCase();
    if (!accept.includes(fileExtension)) {
      setError(`Only ${accept.join(', ')} files are allowed`);
      return;
    }

    setError('');
    uploadFile({
      uri: file.uri,
      type: file.type || 'application/pdf',
      name: fileName,
      fileSize: file.size,
    });
  } catch (err) {
    if (!DocumentPicker.isCancel(err)) {
      console.error('DocumentPicker Error:', err);
      setError('Failed to pick document');
    }
  }
};


  const handleGallery = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
      selectionLimit: 1,
    };

    launchImageLibrary(options, handleImageResponse);
  };

  const handleImageResponse = (response) => {
    if (response.didCancel || response.error) {
      return;
    }

    if (response.assets && response.assets[0]) {
      const asset = response.assets[0];
      
      // Validate file size
      if (asset.fileSize && asset.fileSize > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024);
        setError(`File size must be less than ${maxSizeMB}MB`);
        return;
      }

      // Get file extension from URI or type
      const fileName = asset.fileName || `image_${Date.now()}.jpg`;
      const fileExtension = fileName.split('.').pop().toLowerCase();
      
      // Validate file extension
      if (!accept.includes(fileExtension)) {
        setError(`Only ${accept.join(', ')} files are allowed`);
        return;
      }

      setError('');
      uploadFile({
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: fileName,
        fileSize: asset.fileSize,
      });
    }
  };

  const uploadFile = async (selectedFile) => {  console.log("uploadFile is called");  console.log(selectedFile);

    setLoading(true);
    
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('files', {
        uri: Platform.OS === 'ios' ? selectedFile.uri.replace('file://', '') : selectedFile.uri,
        type: selectedFile.type || 'application/octet-stream',
        name: selectedFile.name,
      });

      if (docType) {
        formData.append('docTypes', docType.toString());
      }

      if (customerId) {
        formData.append('customerId', customerId.toString());
      }

      console.log(formData);

      // Make the API call with proper headers for multipart/form-data
      const token = await apiClient.getToken();
      
      const response = await fetch('https://pharmsupply-dev-api.pharmconnect.com/user-management/customer/upload-docs?isStaging=true', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          // Don't set Content-Type header - let fetch set it with boundary
        },
        body: formData,
      });

      console.log("response ", response);

      const responseData = await response.json();

      if (responseData.success && responseData.data && responseData.data.length > 0) {
        const uploadedFile = responseData.data[0];
        const fileData = {
          fileName: uploadedFile.fileName,
          s3Path: uploadedFile.s3Path,
          id: uploadedFile.id,
        };
        
        setFile(fileData);
        
        // Callback to parent
        if (onFileUpload) {
          onFileUpload(fileData);
        }
        
        // Success animation
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.8,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
        
      } else {
        throw new Error(responseData.message || 'Failed to upload file');
      }

    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload file. Please try again.');
      Alert.alert('Upload Failed', error.message || 'Unable to upload file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!file || !file.s3Path || loading) return;
    
    setShowDocumentModal(true);
    setLoadingDoc(true);
    
    try {
      // Get signed URL for preview
      const response = await apiClient.get(
        `/user-management/customer/download-doc?s3Path=${encodeURIComponent(file.s3Path)}`
      );

      if (response.success && response.data && response.data.signedUrl) {
        setSignedUrl(response.data.signedUrl);
      } else {
        throw new Error('Failed to get preview URL');
      }

    } catch (error) {
      console.error('Preview error:', error);
      Alert.alert('Preview Failed', 'Unable to preview file. Please try again.');
      setShowDocumentModal(false);
    } finally {
      setLoadingDoc(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete File',
      'Are you sure you want to remove this file?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Simple state reset without fade animation
            setFile(null);
            setError('');
            
            // Callback to parent
            if (onFileDelete) {
              onFileDelete();
            }
            
            // Optional: Add a subtle animation for the transition
            Animated.sequence([
              Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                tension: 40,
                useNativeDriver: true,
              }),
            ]).start();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const closeModal = () => {
    setShowDocumentModal(false);
    setSignedUrl(null);
  };

  const DocumentModal = () => {
    return (
      <Modal
        visible={showDocumentModal}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.documentModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {file?.fileName || 'DOCUMENT'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <CloseCircle />
              </TouchableOpacity>
            </View>
            
            <View style={styles.documentImageContainer}>
              {loadingDoc ? (
                <ActivityIndicator size="large" color={colors.primary} />
              ) : signedUrl && (file?.fileName?.toLowerCase().endsWith('.jpg') || 
                                file?.fileName?.toLowerCase().endsWith('.jpeg') || 
                                file?.fileName?.toLowerCase().endsWith('.png')) ? (
                <Image 
                  source={{ uri: signedUrl }} 
                  style={{ width: '100%', height: 300 }}
                  resizeMode="contain"
                />
              ) : signedUrl ? (
                <View style={styles.dummyDocument}>
                  <Icon name="document-text" size={100} color="#999" />
                  <Text style={styles.documentName}>{file?.fileName}</Text>
                  <TouchableOpacity 
                    style={styles.downloadButton}
                    onPress={() => {
                      // Open the signed URL in browser for download
                      if (signedUrl) {
                        require('react-native/Libraries/Linking/Linking').openURL(signedUrl);
                      }
                    }}
                  >
                    <Icon name="download-outline" size={20} color="#fff" />
                    <Text style={styles.downloadButtonText}>Download</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.uploadContainer,
          file && styles.uploadContainerWithFile,
          error && styles.uploadContainerError,
          disabled && styles.uploadContainerDisabled,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>
              {file ? 'Processing...' : 'Uploading...'}
            </Text>
          </View>
        ) : (
          <>
            {file ? (
              // File Selected State
              <View style={styles.fileSelectedContainer}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {file.fileName}
                </Text>
                <View style={styles.fileActions}>
                  {showPreview && (
                    <TouchableOpacity
                      onPress={handlePreview}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <EyeOpen color={colors.primary} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={handleDelete}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <CloseCircle width={20} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              // No File Selected State
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handleDocumentPicker}
                activeOpacity={0.7}
                disabled={disabled}
              >
                <Text style={styles.placeholderText}>{placeholder}</Text>
                <Upload color={colors.primary} />
              </TouchableOpacity>
            )}
          </>
        )}
      </Animated.View>
      
      {error ? (
        <Animated.Text 
          style={[
            styles.errorText,
            {
              opacity: fadeAnim,
            }
          ]}
        >
          {error}
        </Animated.Text>
      ) : null}
      
      {/* Document Preview Modal */}
      <DocumentModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  uploadContainer: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#FFF5ED',
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 56,
    justifyContent: 'center',
  },
  uploadContainerWithFile: {
    borderWidth: 0,
    backgroundColor: '#FFF5ED',
  },
  uploadContainerError: {
    borderColor: colors.error,
    backgroundColor: '#FFF5F5',
  },
  uploadContainerDisabled: {
    opacity: 0.6,
    backgroundColor: '#F5F5F5',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  placeholderText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    flex: 1,
    textAlign: 'left',
  },
  fileSelectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fileName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  fileActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentModalContent: {
    width: width * 0.9,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    flex: 1,
    marginRight: 12,
  },
  documentImageContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 20,
    minHeight: 200,
    justifyContent: 'center',
  },
  dummyDocument: {
    alignItems: 'center',
  },
  documentName: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 20,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default FileUploadComponent;