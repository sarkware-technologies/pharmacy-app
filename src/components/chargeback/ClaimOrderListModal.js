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
import { mockOrdersList } from '../../screens/authorized/chargeback/Mockdata';
import DocumentUploadModal from './DocumentUploadModal';
import CloseCircle from '../icons/CloseCircle';
import { colors } from '../../styles/colors';
import Upload from '../icons/Upload';
import { RollInLeft } from 'react-native-reanimated';

// Custom CheckBox Component
const CustomCheckBox = ({ value, onValueChange }) => {
  return (
    <TouchableOpacity
      onPress={() => onValueChange(!value)}
      style={[
        styles.checkbox,
        value && styles.checkboxChecked
      ]}
    >
      {value && (
        <Icon name="check" size={14} color="#FFF" />
      )}
    </TouchableOpacity>
  );
};

const ClaimOrderListModal = ({ visible, onClose, claim }) => {

  const navigation = useNavigation();
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);  
  const [orders, setOrders] = useState(mockOrdersList);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectOrder = (orderId) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  const handleUploadDocument = (order) => {
    setCurrentOrder(order);
    setShowUploadModal(true);
  };

  const handleGenerateClaim = () => {
    // Close the modal first
    onClose();   
    
    navigation.getParent()?.navigate('ChargebackStack', {
        screen: 'ClaimDetails'
    });
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
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {claim?.customerName || 'Kokilaben Dhirubhai Ambani'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <CloseCircle />
            </TouchableOpacity>
          </View>

          <View style={styles.selectAllContainer}>
            <CustomCheckBox
              value={selectAll}
              onValueChange={handleSelectAll}
            />
            <Text style={styles.selectAllText}>Select all orders</Text>
          </View>

          <ScrollView style={styles.ordersList}>
            {orders.map((order, index) => (
              <View key={`${order.id}-${index}`} style={styles.orderCard}>
                <CustomCheckBox
                  value={selectedOrders.includes(order.id)}
                  onValueChange={() => handleSelectOrder(order.id)}
                />
                
                <View style={styles.orderContent}>
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderId}>{order.id}</Text>                    
                  </View>
                  
                  <View style={styles.orderDetails}>
                    <Text style={styles.poNumber}>
                      {order.poNumber} | In CNS <Text style={styles.cnsCount}>+{order.inCNS}</Text>
                    </Text>
                  </View>
                  
                  <View style={styles.orderFooter}>
                    <View style={styles.draftBadge}>
                      <Text style={styles.draftText}>DRAFT</Text>
                    </View>
                    
                    <View style={{ flexDirection: 'column', gap: 15, marginTop: -30 }}>
                      <Text style={styles.podInfo}>POD/Invoice {order.podInvoiceCount}</Text>
                      <TouchableOpacity 
                        style={styles.uploadButton}
                        onPress={() => handleUploadDocument(order)}
                      >
                        <Upload height={14} />
                        <Text style={styles.uploadButtonText}>Upload Documents</Text>
                      </TouchableOpacity>
                    </View>                    
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity 
            style={[
              styles.generateButton, 
              selectedOrders.length === 0 && styles.disabledButton
            ]}
            onPress={handleGenerateClaim}
            disabled={selectedOrders.length === 0}
          >
            <Text style={styles.generateButtonText}>Generate Claim</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showUploadModal && (
        <DocumentUploadModal
          visible={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          order={currentOrder}
        />
      )}
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
    paddingTop: 20,
    paddingHorizontal: 16,
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
    color: '#000',
    flex: 1,
    marginRight: 12,
  },
  selectAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  selectAllText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FFA500',
    borderColor: '#FFA500',
  },
  ordersList: {
    flexGrow: 0,
    marginBottom: 16,
  },
  orderCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  orderContent: {
    flex: 1,
    marginLeft: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    textDecorationLine: 'underline',
  },
  podInfo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right'
  },
  orderDetails: {
    marginBottom: 12,
  },
  poNumber: {
    fontSize: 14,
    color: '#666',
  },
  cnsCount: {
    color: '#FFA500',
    fontWeight: '600',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  draftBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  draftText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  uploadButtonText: {
    fontSize: 12,
    color: '#FFA500',
    marginLeft: 4,
  },
  generateButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ClaimOrderListModal;