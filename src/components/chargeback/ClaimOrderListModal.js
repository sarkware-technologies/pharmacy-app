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
import AppText from "../AppText"

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

        <View style={styles.modalHeader}>
            <AppText style={styles.modalTitle}>
              {claim?.customerName || 'Kokilaben Dhirubhai Ambani'}
            </AppText>
            <TouchableOpacity onPress={onClose}>
              <CloseCircle />
            </TouchableOpacity>
          </View>
        <View style={styles.modalContent}>
          

          <View style={styles.selectAllContainer}>
            <CustomCheckBox
              value={selectAll}
              onValueChange={handleSelectAll}
            />
            <AppText style={styles.selectAllText}>Select all orders</AppText>
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
                    <AppText style={styles.orderId}>{order.id}</AppText>
                  </View>

                  <View style={styles.orderDetails}>
                    <AppText style={styles.poNumber}>
                      {order.poNumber} | In CNS <AppText style={styles.cnsCount}>+{order.inCNS}</AppText>
                    </AppText>
                  </View>

                  <View style={styles.orderFooter}>
                    <View style={styles.draftBadge}>
                      <AppText style={styles.draftText}>DRAFT</AppText>
                    </View>

                    <View style={{ flexDirection: 'column', gap: 15, marginTop: -30 }}>
                      <AppText style={styles.podInfo}>POD/Invoice <AppText style={styles.podInfoText}>{order.podInvoiceCount}</AppText></AppText>
                      <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={() => handleUploadDocument(order)}
                      >
                        <Upload height={14} />
                        <AppText style={styles.uploadButtonText}>Upload Documents</AppText>
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
            <AppText style={styles.generateButtonText}>Generate Claim</AppText>
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
    paddingTop: 16,
    paddingHorizontal: 16,
    maxHeight: '80%',
  },
  modalHeader: {

    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    maxHeight: '80%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth:1,
    borderBottomColor:"#EDEDED"
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2B2B2B',
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
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
    fontWeight: '600',

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
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    paddingBottom:0,

   borderBottomWidth: 1,  // underline
  borderBottomColor: '#000', // color
  },
  podInfo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right'
  },

  podInfoText: {
    color: '#000',
  },
  orderDetails: {
    marginBottom: 12,
  },
  poNumber: {
    fontSize: 14,
    color: '#666',
    fontWeight: "400"
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
    backgroundColor: '#f7f1e8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  draftText: {
    fontSize: 12,
    color: '#AE7017',
    fontWeight: '700',
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
    fontWeight:"700"
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