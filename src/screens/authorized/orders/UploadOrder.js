import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../../styles/colors';
import { setSelectedDistributor } from '../../../redux/slices/orderSlice';

const UploadOrder = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { selectedDistributor } = useSelector(state => state.orders || {});

  const [originalFile, setOriginalFile] = useState(null);
  const [templateFile, setTemplateFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrComplete, setOcrComplete] = useState(false);
  const [ocrTime, setOcrTime] = useState('');

  const handleFileUpload = async (type) => {
    const options = {
      title: `Select ${type === 'original' ? 'Order' : 'Template'} File`,
      mediaType: 'mixed', // This allows selecting from Files app on iOS
      includeBase64: true,
      quality: 1,
      selectionLimit: 1,
      // For Android, you might need to add custom options
      // to allow document selection through file managers
      presentationStyle: 'fullScreen',
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled file picker');
        return;
      }

      if (response.errorMessage) {
        Alert.alert('Error', response.errorMessage);
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];

        // Create file object from response
        const file = {
          name: asset.fileName || `file_${Date.now()}.pdf`,
          size: asset.fileSize ? `${(asset.fileSize / (1024 * 1024)).toFixed(1)} MB` : '4.1 MB',
          uri: asset.uri,
          type: asset.type || 'application/pdf',
        };

        // Validate file size (5MB limit)
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          Alert.alert('Error', 'File size exceeds 5MB limit');
          return;
        }

        if (type === 'original') {
          setOriginalFile(file);
          // Simulate OCR processing
          processOCR();
        } else {
          setTemplateFile(file);
        }
      }
    });
  };

  // Alternative method using a file path if you have one
  const handleFileFromPath = (type, filePath) => {
    // This method can be used if you have file paths from other sources
    const fileName = filePath.split('/').pop();
    const file = {
      name: fileName || 'return_file_sample_data.csv',
      size: '4.1 MB', // You'd need to get actual file size
      uri: filePath,
      type: 'text/csv',
    };

    if (type === 'original') {
      setOriginalFile(file);
      processOCR();
    } else {
      setTemplateFile(file);
    }
  };

  const processOCR = () => {
    setIsProcessing(true);
    setOcrComplete(false);

    // Simulate OCR processing
    setTimeout(() => {
      setIsProcessing(false);
      setOcrComplete(true);
      setOcrTime('02:15 Sec');
    }, 2000);
  };

  const handleCancelUpload = (type) => {
    if (type === 'original') {
      setOriginalFile(null);
      setOcrComplete(false);
      setOcrTime('');
    } else {
      setTemplateFile(null);
    }
  };

  const handleContinue = () => {
    if (!originalFile || !selectedDistributor) {
      Alert.alert('Error', 'Please upload order file and select distributor');
      return;
    }
    navigation.navigate('ProductMapping', {
      originalFile,
      templateFile,
      distributor: selectedDistributor
    });
  };

  const handleDownloadTemplate = () => {
    // Handle template download
    Alert.alert('Download', 'Template download initiated');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Order</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressStep}>
          <View style={[styles.stepCircle, styles.activeStep]}>
            <Text style={styles.stepNumber}>1</Text>
          </View>
          <Text style={[styles.stepLabel, styles.activeStepLabel]}>Upload Order</Text>
        </View>
        <View style={styles.progressLine} />
        <View style={styles.progressStep}>
          <View style={[styles.stepCircle, styles.inactiveStep]}>
            <Text style={[styles.stepNumber, styles.inactiveStepNumber]}>2</Text>
          </View>
          <Text style={[styles.stepLabel, styles.inactiveStepLabel]}>Products Mapping</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.instructionText}>
          To create an order, please upload the order file that you downloaded from the ERP system.
        </Text>

        <View style={styles.distributorContainer}>
          <Text style={styles.fieldLabel}>Distributor</Text>
          <TouchableOpacity
            style={styles.distributorDropdown}
            onPress={() => navigation.navigate('SelectDistributor', { fromUpload: true })}
          >
            <Text style={styles.distributorText}>
              {selectedDistributor?.name || 'Select Distributor'}
            </Text>
            <Icon name="arrow-drop-down" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Original Order File Upload */}
        <TouchableOpacity
          style={styles.uploadBox}
          onPress={() => !originalFile && handleFileUpload('original')}
          activeOpacity={originalFile ? 1 : 0.7}
        >
          {!originalFile ? (
            <>
              <Icon name="upload-file" size={48} color="#999" />
              <Text style={styles.uploadTitle}>Upload Original Order File*</Text>
              <Text style={styles.uploadSubtext}>
                xls, xlsx, csv, txt, xlsb & pdf file of maximum{'\n'}5 mb size is supported.
              </Text>
            </>
          ) : (
            <View style={styles.uploadedFileContainer}>
              <Icon name="insert-drive-file" size={40} color="#666" />
              <View style={styles.fileInfo}>
                <Text style={styles.fileName}>{originalFile.name}</Text>
                <Text style={styles.fileSize}>Uploaded {originalFile.size}</Text>
              </View>
              <TouchableOpacity onPress={() => handleCancelUpload('original')}>
                <Text style={styles.cancelUpload}>Cancel Upload</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>

        {/* Template File Upload */}
        <TouchableOpacity
          style={styles.uploadBox}
          onPress={() => !templateFile && handleFileUpload('template')}
          activeOpacity={templateFile ? 1 : 0.7}
        >
          {!templateFile ? (
            <>
              <Icon name="upload-file" size={48} color="#999" />
              <Text style={styles.uploadTitle}>Upload Template File</Text>
              <Text style={styles.uploadSubtext}>
                xls, xlsx, csv, txt, xlsb & pdf file of maximum{'\n'}5 mb size is supported.
              </Text>
            </>
          ) : (
            <View style={styles.uploadedFileContainer}>
              <Icon name="insert-drive-file" size={40} color="#666" />
              <View style={styles.fileInfo}>
                <Text style={styles.fileName}>{templateFile.name}</Text>
                <Text style={styles.fileSize}>Uploaded {templateFile.size}</Text>
              </View>
              <TouchableOpacity onPress={() => handleCancelUpload('template')}>
                <Text style={styles.cancelUpload}>Cancel Upload</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>

        {/* OCR Status */}
        {(isProcessing || ocrComplete) && (
          <View style={styles.ocrStatus}>
            {isProcessing ? (
              <>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.ocrText}>Reading file with OCR...</Text>
              </>
            ) : (
              <>
                <Icon name="check-circle" size={20} color={colors.primary} />
                <Text style={styles.ocrText}>
                  Read the file with OCR | {ocrTime}
                </Text>
              </>
            )}
          </View>
        )}

        <TouchableOpacity
          style={styles.downloadTemplate}
          onPress={handleDownloadTemplate}
        >
          <Icon name="download" size={20} color={colors.primary} />
          <Text style={styles.downloadText}>Download Template</Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.continueButton,
          (!originalFile || !selectedDistributor) && styles.disabledButton
        ]}
        onPress={handleContinue}
        disabled={!originalFile || !selectedDistributor}
      >
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  progressStep: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeStep: {
    backgroundColor: colors.primary,
  },
  inactiveStep: {
    backgroundColor: '#E0E0E0',
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  inactiveStepNumber: {
    color: '#999',
  },
  stepLabel: {
    fontSize: 12,
    color: '#333',
  },
  activeStepLabel: {
    fontWeight: '600',
    color: '#333',
  },
  inactiveStepLabel: {
    color: '#999',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 12,
    marginBottom: 24,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 24,
  },
  distributorContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  distributorDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  distributorText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#FAFAFA',
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  uploadSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
  uploadedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
  },
  cancelUpload: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  ocrStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 20,
  },
  ocrText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  downloadTemplate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 20,
  },
  downloadText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  continueButton: {
    backgroundColor: colors.primary,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#D3D3D3',
  },
  continueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default UploadOrder;