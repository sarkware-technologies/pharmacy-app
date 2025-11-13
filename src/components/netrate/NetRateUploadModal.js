import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import AppText from "../AppText"

const NetRateUploadModal = ({ visible, onClose, invoice }) => {
  const navigation = useNavigation();
  const [hospitalOrderFile, setHospitalOrderFile] = useState('Orderhspfilename.csv');
  const [summaryFile, setSummaryFile] = useState(null);
  const [invoiceFile, setInvoiceFile] = useState('Invoicehspfilena.pdf');
  const [podFiles, setPodFiles] = useState([]);
  const [uploadedPod, setUploadedPod] = useState(false);

  const handleFileUpload = (type) => {
    // Mock file upload
    switch(type) {
      case 'summary':
        setSummaryFile('Summary.pdf');
        break;
      case 'pod':
        setUploadedPod(true);
        setPodFiles([...podFiles, 'PODfilename.pdf']);
        break;
    }
  };

  const handleUpload = () => {
    onClose();
    // Navigate to Invoice Details
    navigation.navigate('InvoiceDetails', { invoice });
  };

  const removePodFile = (index) => {
    const newFiles = [...podFiles];
    newFiles.splice(index, 1);
    setPodFiles(newFiles);
    if (newFiles.length === 0) {
      setUploadedPod(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <AppText style={styles.invoiceId}>{invoice?.id || 'INVC12345'}</AppText>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Original Hospital Order */}
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>Original Hospital Order</AppText>
              <View style={styles.fileRow}>
                <AppText style={styles.fileName}>{hospitalOrderFile}</AppText>
                <View style={styles.fileActions}>
                  <TouchableOpacity>
                    <Icon name="visibility" size={20} color="#FFA500" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionIcon}>
                    <Icon name="download" size={20} color="#FFA500" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Summary */}
            <View style={styles.section}>
              <View style={styles.summaryRow}>
                <AppText style={styles.sectionTitle}>Summary</AppText>
                <View style={styles.fileActions}>
                  <TouchableOpacity>
                    <Icon name="visibility" size={20} color="#FFA500" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionIcon}>
                    <Icon name="download" size={20} color="#FFA500" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Upload Documents */}
            <View style={styles.uploadSection}>
              <AppText style={styles.uploadTitle}>Upload Documents</AppText>
              <AppText style={styles.uploadSubtext}>
                Please ensure that template file format is in excel, PDF, XLS,XLSX and is within 5 mb.
              </AppText>

              {/* DT Generated Invoice */}
              <View style={styles.uploadItem}>
                <AppText style={styles.uploadLabel}>DT Generated Invoice*</AppText>
                <View style={styles.fileRow}>
                  <AppText style={styles.fileName}>{invoiceFile}</AppText>
                  <View style={styles.fileActions}>
                    <TouchableOpacity>
                      <Icon name="visibility" size={20} color="#FFA500" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionIcon}>
                      <Icon name="download" size={20} color="#FFA500" />
                    </TouchableOpacity>
                  </View>
                </View>
                <AppText style={styles.invoiceInfo}>INVC001 | 05/03/2025</AppText>
              </View>

              {/* Proof Of Delivery */}
              <View style={styles.uploadItem}>
                <AppText style={styles.uploadLabel}>Proof Of Delivery</AppText>
                
                {!uploadedPod ? (
                  <TouchableOpacity 
                    style={styles.uploadBox}
                    onPress={() => handleFileUpload('pod')}
                  >
                    <AppText style={styles.uploadText}>Upload</AppText>
                    <Icon name="upload" size={20} color="#FFA500" />
                  </TouchableOpacity>
                ) : (
                  <>
                    <View style={styles.fileRow}>
                      <AppText style={styles.fileName}>PODfilename.pdf</AppText>
                      <View style={styles.fileActions}>
                        <TouchableOpacity>
                          <Icon name="visibility" size={20} color="#FFA500" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.actionIcon}
                          onPress={() => removePodFile(0)}
                        >
                          <Icon name="close" size={20} color="#666" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.successMessage}>
                      <Icon name="check-circle" size={16} color="#4CAF50" />
                      <AppText style={styles.successText}>File successfully uploaded</AppText>
                    </View>
                  </>
                )}
                
                <TouchableOpacity style={styles.addMore} onPress={() => handleFileUpload('pod')}>
                  <AppText style={styles.addMoreText}>+Add More</AppText>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <AppText style={styles.cancelText}>Cancel</AppText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
              <AppText style={styles.uploadButtonText}>Upload</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  invoiceId: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  section: {
    padding: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
  },
  fileName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  fileActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  uploadSection: {
    padding: 16,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  uploadSubtext: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  uploadItem: {
    marginBottom: 20,
  },
  uploadLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  invoiceInfo: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: '#FFA500',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  uploadText: {
    fontSize: 14,
    color: '#333',
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  successText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
  },
  addMore: {
    marginTop: 12,
  },
  addMoreText: {
    fontSize: 14,
    color: '#FFA500',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#FFA500',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelText: {
    fontSize: 16,
    color: '#FFA500',
    fontWeight: '500',
  },
  uploadButton: {
    flex: 1,
    backgroundColor: '#FFA500',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginLeft: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default NetRateUploadModal;