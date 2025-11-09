import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,  
  StatusBar,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { mockClaimDetails } from './Mockdata';
import PrimaryInvoiceDetailsModal from '../../../components/chargeback/PrimaryInvoiceDetailsModal';
import ConfirmSubmitModal from '../../../components/chargeback/ConfirmSubmitModal';
import ClaimSuccessModal from '../../../components/chargeback/ClaimSuccessModal';
import CommentModal from '../../../components/chargeback/CommentModal';

const ClaimDetails = () => {

  const navigation = useNavigation();
  const route = useRoute();
  const { claim, selectedOrders } = route.params || {};
  
  const [currentOrderIndex, setCurrentOrderIndex] = useState(0);
  const [expandedOrders, setExpandedOrders] = useState({ 'ORDR_777': true });
  const [claimDetails, setClaimDetails] = useState(mockClaimDetails);
  const [showPrimaryInvoice, setShowPrimaryInvoice] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productQuantities, setProductQuantities] = useState({});

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handleQuantityChange = (productId, value) => {
    setProductQuantities(prev => ({
      ...prev,
      [productId]: value
    }));
  };

  const handleViewPrimaryInvoice = (product) => {
    setSelectedProduct(product);
    setShowPrimaryInvoice(true);
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
    navigation.navigate('ChargebackListing');
  };

  const handleJumpToOrder = (index) => {
    setCurrentOrderIndex(index);
    const orderId = claimDetails.orders[index]?.id;
    if (orderId) {
      setExpandedOrders(prev => ({
        ...prev,
        [orderId]: true
      }));
    }
  };

  const handleAddOrder = () => {
    Alert.alert('Add Order', 'Navigate to add order screen');
  };

  const renderProductItem = (product, order) => {
    const isInCNS = product.inCNS;
    
    return (
      <View key={product.id} style={styles.productCard}>
        <View style={styles.productHeader}>
          <View>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productCode}>{product.code} | In CNS {isInCNS ? '✓' : '✗'}</Text>
          </View>
          <View style={[styles.batchBadge, !isInCNS && styles.batchBadgeRed]}>
            <Text style={[styles.batchText, !isInCNS && styles.batchTextWhite]}>
              {product.batch}
            </Text>
          </View>
        </View>

        <View style={styles.productDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order Qty</Text>
            <Text style={styles.detailValue}>{product.orderQty}</Text>
            <Text style={styles.detailLabel}>Already Claimed Qty</Text>
            <Text style={styles.detailValue}>{product.alreadyClaimedQty}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Current Claimed Qty</Text>
            <TextInput
              style={styles.quantityInput}
              value={productQuantities[product.id] || product.currentClaimedQty.toString()}
              onChangeText={(value) => handleQuantityChange(product.id, value)}
              keyboardType="numeric"
            />
            <Text style={styles.detailLabel}>Balance Qty</Text>
            <Text style={styles.detailValue}>{product.balanceQty}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Approved Rate</Text>
            <Text style={styles.detailValue}>₹ {product.approvedRate}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Stockist Supply Rate</Text>
            <TextInput
              style={styles.rateInput}
              value={`₹ ${product.stockistSupplyRate}`}
              editable={true}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tax</Text>
            <Text style={styles.detailValue}>₹ {product.tax}</Text>
            <Text style={styles.detailLabel}>Claimed Amount</Text>
            <Text style={styles.detailValue}>₹ {product.claimedAmount}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.primaryInvoiceButton}
          onPress={() => handleViewPrimaryInvoice(product)}
        >
          <Text style={styles.primaryInvoiceText}>View Primary Invoice Details {'>'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderOrder = (order, index) => {
    const isExpanded = expandedOrders[order.id];
    
    return (
      <View key={order.id} style={styles.orderContainer}>
        <TouchableOpacity 
          style={styles.orderHeader}
          onPress={() => toggleOrderExpansion(order.id)}
        >
          <View>
            <Text style={styles.orderId}>{order.id}</Text>
            <View style={styles.orderStats}>
              <Text style={styles.orderStat}>Invoice {order.invoiceCount}</Text>
              <Text style={styles.orderStat}>POD {order.podCount}</Text>
            </View>
          </View>
          <View style={styles.orderHeaderRight}>
            <TouchableOpacity onPress={() => Alert.alert('View Documents')}>
              <Text style={styles.viewDocsText}>View Documents</Text>
            </TouchableOpacity>
            <Icon 
              name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
              size={24} 
              color="#666" 
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.orderContent}>
            <View style={styles.orderInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>PO_No_{order.poNumber?.split('_')[2]}</Text>
                <Text style={styles.infoValue}>₹ {order.amount?.toLocaleString('en-IN') || '45026.34'}</Text>
              </View>
              <Text style={styles.infoDate}>{order.poDate} | {order.chargebackType}</Text>
              <Text style={styles.batchCount}>Batch Count : {order.batchCount}</Text>
              
              <View style={styles.supplierInfo}>
                <View>
                  <Text style={styles.supplierLabel}>Supplied to</Text>
                  <Text style={styles.supplierName}>{order.suppliedTo?.name || 'Columbia Pharmacy'}</Text>
                  <Text style={styles.supplierCode}>{order.suppliedTo?.code || '1356'}</Text>
                </View>
                <View>
                  <Text style={styles.supplierLabel}>Fulfilled by</Text>
                  <Text style={styles.supplierName}>{order.fulfilledBy?.name || 'Sumeet distributors'}</Text>
                  <Text style={styles.supplierCode}>{order.fulfilledBy?.code || '0033678950'}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.claimDetailsTitle}>Claim Details</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search product name/code..."
              placeholderTextColor="#999"
            />

            {order.products && order.products.map(product => renderProductItem(product, order))}
          </View>
        )}
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
        <Text style={styles.claimNumber}>{claimDetails.claimId}</Text>
        <TouchableOpacity onPress={() => setShowCommentModal(true)}>
          <Icon name="history" size={24} color="#666" />
          <Text style={styles.logsText}>Logs</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.claimInfo}>
        <Text style={styles.claimDate}>{claimDetails.date} | ₹ {claimDetails.totalAmount?.toLocaleString('en-IN')}</Text>
        <TouchableOpacity 
          style={styles.jumpToOrder}
          onPress={() => handleJumpToOrder((currentOrderIndex + 1) % claimDetails.orders.length)}
        >
          <Text style={styles.jumpText}>Total Orders: {claimDetails.orders.length}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {claimDetails.orders.map((order, index) => renderOrder(order, index))}
        
        <TouchableOpacity style={styles.addOrderButton} onPress={handleAddOrder}>
          <Text style={styles.addOrderText}>+Add Order</Text>
        </TouchableOpacity>

        <Text style={styles.lastSavedText}>* Last saved 05/06/2025</Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.claimFormButton}>
          <Icon name="description" size={20} color="#FFA500" />
          <Text style={styles.claimFormText}>Claim Form</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>

      <PrimaryInvoiceDetailsModal
        visible={showPrimaryInvoice}
        onClose={() => setShowPrimaryInvoice(false)}
        product={selectedProduct}
      />

      <ConfirmSubmitModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
      />

      <ClaimSuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessClose}
        claimId={claimDetails.claimId}
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
  claimNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  logsText: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  claimInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  claimDate: {
    fontSize: 14,
    color: '#666',
  },
  jumpToOrder: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  jumpText: {
    fontSize: 12,
    color: '#FF9800',
  },
  scrollView: {
    flex: 1,
  },
  orderContainer: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    textDecorationLine: 'underline',
  },
  orderStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  orderStat: {
    fontSize: 12,
    color: '#666',
  },
  orderHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewDocsText: {
    fontSize: 14,
    color: '#FFA500',
  },
  orderContent: {
    padding: 16,
  },
  orderInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  infoDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  batchCount: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  supplierInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  supplierLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  supplierName: {
    fontSize: 14,
    color: '#000',
    marginBottom: 2,
  },
  supplierCode: {
    fontSize: 12,
    color: '#999',
  },
  claimDetailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 14,
  },
  productCard: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
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
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  batchBadgeRed: {
    backgroundColor: '#FF5252',
  },
  batchText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  batchTextWhite: {
    color: '#FFFFFF',
  },
  productDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 12,
    color: '#000',
    flex: 1,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    flex: 1,
    marginRight: 8,
  },
  rateInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    flex: 1,
  },
  primaryInvoiceButton: {
    alignItems: 'center',
  },
  primaryInvoiceText: {
    fontSize: 14,
    color: '#FFA500',
  },
  addOrderButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  addOrderText: {
    fontSize: 16,
    color: '#FFA500',
    fontWeight: '500',
  },
  lastSavedText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginVertical: 16,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  claimFormButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFA500',
    borderRadius: 8,
    paddingVertical: 14,
    marginRight: 8,
  },
  claimFormText: {
    fontSize: 16,
    color: '#FFA500',
    marginLeft: 8,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#FFA500',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginLeft: 8,
  },
  submitButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ClaimDetails;