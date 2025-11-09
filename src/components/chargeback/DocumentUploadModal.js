import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CloseCircle from '../icons/CloseCircle';
import { colors } from '../../styles/colors';
import Upload from '../icons/Upload';

const DocumentUploadModal = ({ visible, onClose, order }) => {
  const [claimForm, setClaimForm] = useState(null);
  const [hospitalOrder, setHospitalOrder] = useState(null);
  const [dtInvoice, setDtInvoice] = useState(null);
  const [proofOfDelivery, setProofOfDelivery] = useState([]);
  const [podDetails, setPodDetails] = useState([{ code: '', date: '' }]);

  const handleFilePick = async (type) => {
    // Mock file selection
    const mockFile = { name: `${type}_file_${Date.now()}.pdf` };
    
    switch (type) {
      case 'claim':
        setClaimForm(mockFile);
        break;
      case 'hospital':
        setHospitalOrder(mockFile);
        break;
      case 'invoice':
        setDtInvoice(mockFile);
        break;
      case 'pod':
        setProofOfDelivery([...proofOfDelivery, mockFile]);
        break;
    }
  };

  const addMorePOD = () => {
    setPodDetails([...podDetails, { code: '', date: '' }]);
  };

  const updatePODDetail = (index, field, value) => {
    const newDetails = [...podDetails];
    newDetails[index][field] = value;
    setPodDetails(newDetails);
  };

  const removePOD = (index) => {
    const newDetails = podDetails.filter((_, i) => i !== index);
    setPodDetails(newDetails);
    const newFiles = proofOfDelivery.filter((_, i) => i !== index);
    setProofOfDelivery(newFiles);
  };

  const handleUpload = () => {
    onClose();
    Alert.alert('Success', 'Documents uploaded successfully');
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
            <Text style={styles.headerTitle}>Document Upload</Text>
            <TouchableOpacity onPress={onClose}>
              <CloseCircle />
            </TouchableOpacity>
          </View>

          <Text style={styles.estimatedTime}>
            Estimated time to Read the file with OCR | 02:15 Sec
          </Text>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.claimSection}>
              <Text style={styles.claimId}>CLM12345</Text>
              <TouchableOpacity style={styles.downloadTemplate}>
                <Icon name="download" size={16} color="#FFA500" />
                <Text style={styles.downloadText}>Download Template</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.uploadBox}
              onPress={() => handleFilePick('claim')}
            >
              <Text style={styles.uploadLabel}>Upload Claim form</Text>
              {claimForm && (
                <Text style={styles.fileName} numberOfLines={1}>
                  {claimForm.name}
                </Text>
              )}
              <Upload />
            </TouchableOpacity>

            <View style={styles.orderSection}>
              <TouchableOpacity style={styles.orderHeader}>
                <Text style={styles.orderId}>{order?.id || 'ORDR_777'}</Text>
                <Icon name="keyboard-arrow-up" size={24} color="#666" />
              </TouchableOpacity>

              <Text style={styles.fileFormatText}>
                Please ensure that template file format is in excel PDF,Jpeg, Jpg and is within 25 mb.
              </Text>

              <View style={styles.documentSection}>
                <Text style={styles.sectionTitle}>Original Hospital Order</Text>
                <TouchableOpacity 
                  style={styles.uploadedFile}
                  onPress={() => handleFilePick('hospital')}
                >
                  <Text style={styles.placeholderText}>Orderhspfilen....csv</Text>
                  <View style={styles.fileActions}>
                    <Icon name="visibility" size={20} color="#FFA500" />
                    <Icon name="download" size={20} color="#666" style={styles.actionIcon} />
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.documentSection}>
                <Text style={styles.sectionTitle}>Upload Proof Of Delivery</Text>
                
                <View style={styles.subSection}>
                  <Text style={styles.subTitle}>DT Generated Invoice</Text>
                  <TouchableOpacity 
                    style={styles.uploadedFile}
                    onPress={() => handleFilePick('invoice')}
                  >
                    <Text style={styles.placeholderText}>Invoicehspfilena.pdf</Text>
                    <View style={styles.fileActions}>
                      <Icon name="visibility" size={20} color="#FFA500" />
                      <Icon name="download" size={20} color="#666" style={styles.actionIcon} />
                    </View>
                  </TouchableOpacity>
                  <Text style={styles.invoiceInfo}>INVC001 | 05/03/2025</Text>
                </View>

                <View style={styles.subSection}>
                  <Text style={styles.subTitle}>Proof Of Delivery*</Text>
                  
                  {podDetails.map((pod, index) => (
                    <View key={index}>
                      <TouchableOpacity 
                        style={styles.podFile}
                        onPress={() => handleFilePick('pod')}
                      >
                        <Text style={styles.podFileName}>PODFilename.jpeg</Text>
                        <View style={styles.fileActions}>
                          <Icon name="visibility" size={20} color="#FFA500" />
                          <TouchableOpacity onPress={() => removePOD(index)}>
                            <Icon name="close" size={20} color="#666" style={styles.actionIcon} />
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                      
                      {proofOfDelivery[index] && (
                        <View style={styles.successMessage}>
                          <Icon name="check-circle" size={16} color="#4CAF50" />
                          <Text style={styles.successText}>File successfully uploaded</Text>
                        </View>
                      )}
                      
                      <View style={styles.podInputs}>
                        <TextInput
                          style={styles.podInput}
                          placeholder="POD001"
                          value={pod.code}
                          onChangeText={(text) => updatePODDetail(index, 'code', text)}
                        />
                        <TextInput
                          style={styles.podInput}
                          placeholder="05/03/2025"
                          value={pod.date}
                          onChangeText={(text) => updatePODDetail(index, 'date', text)}
                        />
                      </View>
                    </View>
                  ))}
                  
                  <TouchableOpacity style={styles.addMore} onPress={addMorePOD}>
                    <Text style={styles.addMoreText}>+Add More</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
              <Text style={styles.uploadButtonText}>Upload</Text>
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
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,    
    paddingBottom: 6
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  estimatedTime: {
    fontSize: 12,
    color: '#666',   
    paddingHorizontal: 16, 
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  scrollContent: {
    flex: 1,
    padding: 16,
  },
  claimSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  claimId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  downloadTemplate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadText: {
    fontSize: 14,
    color: '#FFA500',
    marginLeft: 4,
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  uploadLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  fileName: {
    fontSize: 12,
    color: '#333',
    marginBottom: 8,
  },
  orderSection: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  fileFormatText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  documentSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  uploadedFile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
    flex: 1,
  },
  fileActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    marginLeft: 12,
  },
  invoiceInfo: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  subSection: {
    marginTop: 16,
  },
  subTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  podFile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  podFileName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  successText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
  },
  podInputs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  podInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  addMore: {
    alignItems: 'flex-start',
    marginTop: 8,
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

export default DocumentUploadModal;