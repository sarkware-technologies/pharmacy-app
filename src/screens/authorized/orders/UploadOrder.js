import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../../styles/colors';
import { setSelectedDistributor } from '../../../redux/slices/orderSlice';
import Downarrow from '../../../components/icons/downArrow';
import Download from '../../../components/icons/Download';
import CustomCheckbox from '../../../components/view/checkbox';
import Note from "../../../components/icons/note"
import Upload from "../../../components/icons/Upload"
import { pick, types } from '@react-native-documents/picker';
import CustomerSelectionModal from './CustomerSelector';
import SelectDistributor from './SelectDistributor';
import AppText from "../../../components/AppText"
import Toast from 'react-native-toast-message';
import { Fonts } from '../../../utils/fontHelper';
import BackButton from '../../../components/view/backButton';
import { DownloadTemplate } from '../../../api/orders';
import { ErrorMessage } from '../../../components/view/error';

const UploadOrder = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const route = useRoute();

  const [originalFile, setOriginalFile] = useState(null);
  const [templateFile, setTemplateFile] = useState(null);
  const [isocr, setIsocr] = useState(false);


  const { distributor, customer } = route.params || {};
  const [selectedDistributor, setSelectedDistributor] = useState(distributor);
  const [selectedCustomer, setSelectedCustomer] = useState(customer);


  const [showDistributorselection, setShowSelectdistributor] = useState(false);
  const [showCustomerselection, setShowCustomerselection] = useState(false);


  const handleFileUpload = async (type) => {
    try {
      // ✅ use @react-native-documents/picker
      const [file] = await pick({ type: [types.allFiles] });
      console.log('Selected file:', file);

      if (!file) return;

      // Validate file extension
      const allowedExtensions = ['xls', 'xlsx', 'csv', 'txt', 'xlsb', 'pdf'];
      const ext = file.name?.split('.').pop()?.toLowerCase();

      if (!allowedExtensions.includes(ext)) {
        Toast.show({
          type: 'error',
          text1: 'Invalid file type',
          text2: 'Only xls, xlsx, csv, txt, xlsb & pdf files are allowed.',
        });
        return;
      }

      // Validate file size (5MB)
      if (file.size && file.size > 5 * 1024 * 1024) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'File size exceeds 5MB limit',
        });
        return;
      }

      // Format file size
      const formatFileSize = (bytes) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        else return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      };

      const formattedFile = {
        name: file.name,
        size: formatFileSize(file.size),
        uri: file.uri,
        type: file.type || 'application/octet-stream',
      };

      // ✅ Keep your original logic unchanged
      if (type === 'original') {
        setIsocr(true);
        setTemplateFile(null);
        setOriginalFile(formattedFile);
      } else {
        setIsocr(false);
        setOriginalFile(null);
        setTemplateFile(formattedFile);
      }

    } catch (err) {
      console.error('File picker error:', err);
      Toast.show({
        type: 'error',
        text1: 'Invalid file',
        text2: 'Failed to pick the file.',
      });
    }
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
    } else {
      setTemplateFile(file);
    }
  };



  const handleCancelUpload = (type) => {
    if (type === 'original') {
      setOriginalFile(null);
    } else {
      setTemplateFile(null);
    }
  };

  const handleContinue = () => {
    if (!originalFile && !templateFile) {
      // Alert.alert('Error', 'Please upload order file and select distributor');
      return;
    }
    navigation.replace('ProductMapping', {
      originalFile,
      templateFile,
      distributor: selectedDistributor,
      customer: selectedCustomer,
      isOCR: isocr
    });
    // navigation.push('ProductMapping', {
    //   originalFile,
    //   templateFile,
    //   distributor: selectedDistributor,
    //   customer: selectedCustomer,
    //   isOCR: isocr
    // });
  };


  const handleDownloadTemplate = async () => {

    try {
      const response = await DownloadTemplate();
      console.log(response,8798798)
      if (response?.signedUrl) {
        await Linking.openURL(response.signedUrl);
      }
    } catch (error) {
      ErrorMessage(error);
    }
  };



  const renderUploadfile = () => {
    return (
      <View style={styles.content}>
        <View style={styles.scrollcontent}>
          <ScrollView style={{ marginBottom: 20 }} showsVerticalScrollIndicator={false}>
            <AppText style={styles.instructionText}>
              To create an order, please upload the order file that you downloaded from the ERP system.
            </AppText>
            <View style={styles.filtersContainer}>
              <View style={styles.wrapper}>
                <View style={styles.row}>

                  <TouchableOpacity style={styles.box} onPress={() => setShowCustomerselection(true)}>
                    <AppText style={styles.label}>Customer</AppText>
                    <View style={styles.valueRow}>
                      <AppText style={styles.valueText} numberOfLines={1}>
                        {selectedCustomer?.customerName ?? 'Select Customer'}
                      </AppText>
                      <Downarrow />
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.box} onPress={() => setShowSelectdistributor(true)}>
                    <AppText style={styles.label}>Distributor</AppText>
                    <View style={styles.valueRow}>
                      <AppText style={styles.valueText} numberOfLines={1}>
                        {selectedDistributor?.name ?? 'Select Distributor'}
                      </AppText>
                      <Downarrow />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            {/* Original Order File Upload */}
            <TouchableOpacity
              style={styles.uploadBox}
              onPress={() => !originalFile && handleFileUpload('original')}
              activeOpacity={originalFile ? 1 : 0.7}
            >
              <>
                {originalFile ? <Note /> : <Upload color='#2B2B2B' width={20} height={20} />}
                <AppText style={styles.uploadTitle}>{originalFile ? originalFile?.name : 'Upload Original Order File*'}</AppText>
                {!originalFile ? (
                  <AppText style={styles.uploadSubtext}>
                    xls, xlsx, csv, txt, xlsb & pdf file of maximum{'\n'}5 mb size is supported.
                  </AppText>
                ) : (
                  <AppText style={styles.fileSize}>Uploaded {originalFile.size}</AppText>
                )}

                {originalFile && (
                  <TouchableOpacity style={{ marginTop: 6 }} onPress={() => handleCancelUpload('original')}>
                    <AppText style={styles.cancelUpload}>Cancel Upload</AppText>
                  </TouchableOpacity>
                )}
              </>
            </TouchableOpacity>

            {/* Template File Upload */}
            <TouchableOpacity
              style={styles.uploadBox}
              onPress={() => !templateFile && handleFileUpload('template')}
              activeOpacity={templateFile ? 1 : 0.7}
            >
              <>
                {templateFile ? <Note /> : <Upload color='#2B2B2B' width={20} height={20} />}
                <AppText style={styles.uploadTitle}>{templateFile ? templateFile?.name : 'Upload Template File'}</AppText>
                {!templateFile ? (
                  <AppText style={styles.uploadSubtext}>
                    xls, xlsx, csv, txt, xlsb & pdf file of maximum{'\n'}5 mb size is supported.
                  </AppText>
                ) : (
                  <AppText style={styles.fileSize}>Uploaded {templateFile.size}</AppText>
                )}

                {templateFile && (
                  <TouchableOpacity style={{ marginTop: 6 }} onPress={() => handleCancelUpload('template')}>
                    <AppText style={styles.cancelUpload}>Cancel Upload</AppText>
                  </TouchableOpacity>
                )}
              </>
            </TouchableOpacity>

            {/* OCR Status */}
            {/* {(isProcessing || ocrComplete) && ( */}
            {isocr && (
              <View style={{ display: "flex", alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 10 }}>
                {/* <ActivityIndicator size="small" color={colors.primary} /> */}
                <CustomCheckbox checked={isocr} activeColor="#F7941E" size={15} title={<AppText style={styles.ocrText}>
                  Read the file with OCR  |  02:15 Sec
                </AppText>} />
              </View>

            )}
            {!originalFile && (
              <View style={{ height: 25 }}></View>
            )}

            {/* )} */}

            <TouchableOpacity
              style={styles.downloadTemplate}
              onPress={handleDownloadTemplate}
            >
              <Download width={13} height={13} color='#F7941E' />
              <AppText style={styles.downloadText}>Download Template</AppText>
            </TouchableOpacity>
          </ScrollView>
          <TouchableOpacity
            style={[
              styles.continueButton,
              (!originalFile && !templateFile) && styles.disabledButton
            ]}
            onPress={handleContinue}
            disabled={!originalFile && !templateFile}
          >
            <AppText style={styles.continueText}>Continue</AppText>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <BackButton />
        <AppText style={styles.headerTitle}>Create Order</AppText>
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressStep}>
          <View style={[styles.stepCircle, styles.activeStep]}>
            <AppText style={styles.stepNumber}>1</AppText>
          </View>
          <AppText style={[styles.stepLabel, styles.activeStepLabel]}>Upload Order</AppText>
        </View>
        <View style={styles.progressLine} />
        <View style={styles.progressStep}>
          <View style={[styles.stepCircle, styles.inactiveStep]}>
            <AppText style={[styles.stepNumber, styles.inactiveStepNumber]}>2</AppText>
          </View>
          <AppText style={[styles.stepLabel, styles.inactiveStepLabel]}>Products Mapping</AppText>
        </View>
      </View>
      {renderUploadfile()}
      <CustomerSelectionModal onSelectCustomer={(e) => {
        setSelectedCustomer(e)
        setSelectedDistributor(null)
        setShowCustomerselection(false)
      }} visible={showCustomerselection} onClose={() => setShowCustomerselection(false)} />


      <SelectDistributor customerId={selectedCustomer?.customerId} onSelect={(e) => {
        setSelectedDistributor(e)
        setShowSelectdistributor(false)
      }} visible={showDistributorselection} onClose={() => setShowSelectdistributor(false)} />
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
    paddingTop: 12,
    paddingLeft: 23,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginLeft: 16,
    fontFamily: Fonts.Black,
    textAlign: "center",
    width: "80%"
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    justifyContent: "space-between"
  },
  progressStep: {
    alignItems: "center",
    flexDirection: 'row',
    display: "flex",
    gap: 5
  },
  stepCircle: {
    width: 25,
    height: 25,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',

  },
  activeStep: {
    backgroundColor: "#F7941E",
    borderRadius: 16,
  },
  inactiveStep: {
    backgroundColor: '#909090',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  inactiveStepNumber: {
    color: 'white',
  },
  stepLabel: {
    fontSize: 16,
    color: '#9295A5',
  },
  activeStepLabel: {
    fontWeight: '600',
    color: '#333',
  },
  inactiveStepLabel: {
    color: '#999',
  },
  progressLine: {
    // flex: 1,
    height: 2,
    backgroundColor: '#909090',
    marginHorizontal: 12,
    width: 50
    // marginBottom: 24,
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F6F6F6",
    paddingBottom: 50
  },
  scrollcontent: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16
  },
  instructionText: {
    fontSize: 14,
    color: '#909090',
    lineHeight: 20,
    marginBottom: 20,
    fontWeight: 400,
    fontFamily: Fonts.Regular
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
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingHorizontal: 25,
    paddingVertical: 25,
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#FAFAFA',
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D22',
    marginTop: 10,
    marginBottom: 5,
  },
  uploadSubtext: {
    fontSize: 12,
    color: '#909090',
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: Fonts.Regular
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
    fontSize: 16,
    fontWeight: '500',
    color: '#1D1D22',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    color: '#909090',
    fontFamily: Fonts.Regular
  },
  cancelUpload: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  ocrStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    // paddingVertical: 12,
    justifyContent: "center"
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
    marginTop: 10,
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
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#D3D3D3',
  },
  continueText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Fonts.Black,
    color: '#fff',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingVertical: 6,
    gap: 12,
  },
  wrapper: {
    backgroundColor: "#FFFFFF",
    flex: 1,
    justifyContent: "center",
    paddingBottom: 20,
    borderRadius: 12
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  box: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    position: "relative",
  },
  label: {
    position: "absolute",
    top: -10,
    left: 14,
    backgroundColor: "#fff",
    paddingHorizontal: 6,
    fontSize: 13,
    color: colors.secondaryText,
    fontWeight: 400,
    fontFamily: Fonts.Regular
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  valueText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: colors.primaryText,
    fontWeight: 500,
    fontFamily: Fonts.Regular
  },
});

export default UploadOrder;