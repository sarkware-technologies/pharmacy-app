import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,  
  StatusBar,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { mockInvoiceDetails } from './Mockdata';
import ConfirmSubmitModal from '../../../components/netrate/ConfirmSubmitModal';
import SuccessModal from '../../../components/netrate/SuccessModal';
import CommentModal from '../../../components/chargeback/CommentModal';

const InvoiceDetails = () => {

  const navigation = useNavigation();
  const route = useRoute();
  const { invoice } = route.params || {};
  
  const [invoiceDetails] = useState(mockInvoiceDetails);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [supplyQuantities, setSupplyQuantities] = useState({});

  const handleQuantityChange = (productId, value) => {
    setSupplyQuantities(prev => ({
      ...prev,
      [productId]: value
    }));
  };

  const handleSubmit = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    setTimeout(() => {
      setShowSuccessModal(true);
    }, 500);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigation.navigate('NetRateListing');
  };

  const renderProductCard = (product) => {
    const isInCNS = product.inCNS;
    
    return (
      <View key={product.id} style={styles.productCard}>
        <View style={styles.productHeader}>
          <View>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productCode}>
              {product.code} | In CNS {isInCNS ? '✅' : '🚫'}
            </Text>
          </View>
          <View style={[styles.batchBadge, isInCNS && styles.batchBadgeGreen]}>
            <Text style={styles.batchText}>{product.batch}</Text>
          </View>
        </View>

        <View style={styles.productDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>PTS</Text>
              <Text style={styles.detailValue}>₹ {product.pts}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Approved Rate</Text>
              <Text style={styles.detailValue}>₹ {product.approvedRate}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Tax</Text>
              <Text style={styles.detailValue}>₹ {product.tax}</Text>
            </View>
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Stockist Supply Rate</Text>
            <TextInput
              style={styles.input}
              value={`₹ ${product.stockistSupplyRate}`}
              editable={true}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Invoice Qty</Text>
            <Text style={styles.staticValue}>{product.invoiceQty}</Text>
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Supply Qty</Text>
            <TextInput
              style={styles.input}
              value={supplyQuantities[product.id] || product.supplyQty.toString()}
              onChangeText={(value) => handleQuantityChange(product.id, value)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.bottomRow}>
            <View style={styles.bottomItem}>
              <Text style={styles.bottomLabel}>Short Supply Qty</Text>
              <Text style={styles.bottomValue}>{product.shortSupplyQty || '-'}</Text>
            </View>
            <View style={styles.bottomItem}>
              <Text style={styles.bottomLabel}>Debit Note Amount</Text>
              <Text style={styles.bottomValue}>₹ {product.debitNoteAmount}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{invoiceDetails.invoiceId}</Text>
        <TouchableOpacity onPress={() => setShowCommentModal(true)}>
          <Icon name="history" size={20} color="#666" />
          <Text style={styles.logsText}>Logs</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.invoiceInfo}>
        <Text style={styles.invoiceDate}>
          {invoiceDetails.date} | ₹ {invoiceDetails.totalAmount?.toLocaleString('en-IN')}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderId}>{invoiceDetails.orderInfo.orderId}</Text>
            <TouchableOpacity>
              <Text style={styles.viewDocsText}>
                <Icon name="visibility" size={16} color="#FFA500" /> View Documents
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.orderDetails}>
            <View style={styles.orderRow}>
              <Text style={styles.poNumber}>{invoiceDetails.orderInfo.poNumber}</Text>
              <Text style={styles.podAmount}>POD: ₹ {invoiceDetails.orderInfo.podAmount}</Text>
            </View>
            
            <Text style={styles.orderDate}>
              {invoiceDetails.orderInfo.poDate} | {invoiceDetails.orderInfo.netRateType}
            </Text>
            <Text style={styles.batchCount}>Batch Count : {invoiceDetails.orderInfo.batchCount}</Text>
            
            <View style={styles.partiesInfo}>
              <View>
                <Text style={styles.partyLabel}>Supplied to</Text>
                <View style={styles.partyDetails}>
                  <Text style={styles.partyName}>
                    {invoiceDetails.orderInfo.suppliedTo.name} {invoiceDetails.orderInfo.suppliedTo.icon}
                  </Text>
                  <Text style={styles.partyCode}>{invoiceDetails.orderInfo.suppliedTo.code}</Text>
                </View>
              </View>
              <View>
                <Text style={styles.partyLabel}>Fulfilled by</Text>
                <View style={styles.partyDetails}>
                  <Text style={styles.partyName}>{invoiceDetails.orderInfo.fulfilledBy.name}</Text>
                  <Text style={styles.partyCode}>{invoiceDetails.orderInfo.fulfilledBy.code}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.podDetailsSection}>
          <Text style={styles.sectionTitle}>POD Details</Text>
          
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search product name/code..."
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.filterIcon}>
              <Icon name="tune" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterIcon}>
              <Icon name="content-copy" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {invoiceDetails.products.map(product => renderProductCard(product))}
        </View>

        <Text style={styles.lastSavedText}>⏰ Last saved 05/04/2025</Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>

      <ConfirmSubmitModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
      />

      <SuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessClose}
        invoiceId={invoiceDetails.invoiceId}
      />

      <CommentModal
        visible={showCommentModal}
        onClose={() => setShowCommentModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  logsText: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  invoiceInfo: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  invoiceDate: {
    fontSize: 14,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
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
  viewDocsText: {
    fontSize: 14,
    color: '#FFA500',
  },
  orderDetails: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  poNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  podAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  batchCount: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  partiesInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  partyLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  partyDetails: {
    marginBottom: 4,
  },
  partyName: {
    fontSize: 14,
    color: '#000',
  },
  partyCode: {
    fontSize: 12,
    color: '#999',
  },
  podDetailsSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#000',
  },
  filterIcon: {
    marginLeft: 12,
  },
  productCard: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  productCode: {
    fontSize: 12,
    color: '#666',
  },
  batchBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  batchBadgeGreen: {
    backgroundColor: '#E8F5E9',
  },
  batchText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  productDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    color: '#000',
  },
  inputRow: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#FFFFFF',
  },
  staticValue: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#666',
    backgroundColor: '#F5F5F5',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  bottomItem: {
    flex: 1,
  },
  bottomLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  bottomValue: {
    fontSize: 13,
    color: '#000',
    fontWeight: '500',
  },
  lastSavedText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginVertical: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  submitButton: {
    backgroundColor: '#FFA500',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default InvoiceDetails;