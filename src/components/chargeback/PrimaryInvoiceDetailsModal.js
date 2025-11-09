import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PrimaryInvoiceDetailsModal = ({ visible, onClose, product }) => {
  const invoiceData = {
    totalInvoiceQty: 100,
    confirmClaimQty: 20,
    claimInProcessQty: 40,
    returnQty: 10,
    claimableQty: 30,
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
            <Text style={styles.headerTitle}>Primary Invoice Details</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.productInfo}>
            <Text style={styles.productName}>
              {product?.name || 'BRUFFEN 100MG TABLETS'}
            </Text>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Total Invoice Qty</Text>
              <Text style={styles.value}>{invoiceData.totalInvoiceQty}</Text>
            </View>

            <View style={styles.breakdown}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Confirm Claim Qty</Text>
                <Text style={styles.breakdownValue}>{invoiceData.confirmClaimQty}</Text>
              </View>
              
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Claim In Process Qty</Text>
                <Text style={styles.breakdownValue}>{invoiceData.claimInProcessQty}</Text>
              </View>
              
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Return Qty</Text>
                <Text style={styles.breakdownValue}>{invoiceData.returnQty}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.claimableRow}>
              <Text style={styles.claimableLabel}>Claimable Qty</Text>
              <Text style={styles.claimableValue}>{invoiceData.claimableQty}</Text>
            </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  productInfo: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  detailsContainer: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  breakdown: {
    paddingLeft: 16,
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#666',
  },
  breakdownValue: {
    fontSize: 14,
    color: '#000',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  claimableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  claimableLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  claimableValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
});

export default PrimaryInvoiceDetailsModal;