import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  StatusBar,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../../styles/colors';
import { updateCartItem, removeFromCart, clearCart } from '../../../redux/slices/orderSlice';
import { createOrder } from '../../../api/orders';

const Cart = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { cart, selectedDistributor, orderSummary } = useSelector(state => state.orders);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [searchText, setSearchText] = useState('');

  const handleQuantityChange = (productId, change) => {
    const item = cart.find(p => p.id === productId);
    if (!item) return;

    const newQty = Math.max(0, item.quantity + change);
    
    if (newQty >= item.moq && newQty <= item.maxQty) {
      dispatch(updateCartItem({ id: productId, quantity: newQty }));
    } else if (newQty === 0) {
      dispatch(removeFromCart(productId));
    }
  };

  const handleRemoveItem = (productId) => {
    dispatch(removeFromCart(productId));
  };

  const handleCheckout = async () => {
    const orderData = {
      distributor: selectedDistributor,
      items: cart,
      summary: orderSummary,
      timestamp: new Date().toISOString()
    };

    try {
      const result = await createOrder(orderData);
      if (result.success) {
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    dispatch(clearCart());
    navigation.navigate('OrderList');
  };

  const filteredCart = cart.filter(item => {
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      return item.name.toLowerCase().includes(searchLower) ||
             item.id.toLowerCase().includes(searchLower);
    }
    return true;
  });

  const renderCartItem = ({ item, index }) => {
    const isMapping = item.isMappingRequired;
    
    return (
      <View style={styles.cartItem}>
        {isMapping && (
          <View style={styles.mappingHeader}>
            <Text style={styles.mappingText}>Find Product</Text>
            <View style={styles.mappingBadge}>
              <Icon name="close" size={12} color={colors.primary} />
              <Text style={styles.mappingBadgeText}>Mapping Required</Text>
            </View>
          </View>
        )}
        
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.orderValue}>Order Value</Text>
        </View>
        
        <View style={styles.itemDetails}>
          <Text style={styles.itemId}>{item.id} | {item.customerProduct}</Text>
          <Text style={styles.orderAmount}>₹ {item.orderValue?.toFixed(1) || 0}</Text>
        </View>
        
        <View style={styles.itemMetrics}>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Customer Product</Text>
            <Text style={styles.metricLabel}>MOQ</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricValue}>{item.customerProduct}</Text>
            <Text style={styles.metricValue}>{item.moq}</Text>
          </View>
        </View>
        
        <View style={styles.priceRow}>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>PTH</Text>
            <Text style={styles.priceValue}>₹ {item.pth?.toFixed(2) || 0}</Text>
          </View>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>Margin</Text>
            <Text style={styles.priceValue}>₹ {item.margin?.toFixed(2) || 0}</Text>
          </View>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>Tax(GST)</Text>
            <Text style={styles.priceValue}>₹ {item.taxGST || '0 (0%)'}</Text>
          </View>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>Exausted /Max Qty</Text>
            <Text style={styles.priceValue}>{item.exhaustedQty}/{item.maxQty}</Text>
          </View>
        </View>
        
        <View style={styles.quantityRow}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.id, -item.moq)}
          >
            <Icon name="remove" size={20} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.id, item.moq)}
          >
            <Icon name="add" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleRemoveItem(item.id)}
          >
            <Icon name="delete-outline" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {index === 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.cnsSection}>
              <View style={styles.cnsBadge}>
                <Text style={styles.cnsText}>IN CNS</Text>
              </View>
              <Text style={styles.skuInfo}>| SKU's</Text>
              <TouchableOpacity>
                <Icon name="delete-outline" size={20} color="#999" />
              </TouchableOpacity>
              <TouchableOpacity>
                <Icon name="expand-less" size={24} color="#333" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  };

  const renderSuccessModal = () => (
    <Modal
      visible={showSuccessModal}
      transparent
      animationType="fade"
      onRequestClose={handleSuccessClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.successModalContent}>
          <View style={styles.successIconContainer}>
            <View style={styles.successIcon}>
              <Icon name="check" size={48} color="#fff" />
            </View>
          </View>
          
          <Text style={styles.successTitle}>Congratulations!</Text>
          <Text style={styles.successMessage}>
            Your order has been successfully placed.
          </Text>
          
          <TouchableOpacity 
            style={styles.goToOrdersButton}
            onPress={handleSuccessClose}
          >
            <Text style={styles.goToOrdersText}>Go to Orders</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Cart</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>SKU Count</Text>
              <Text style={styles.summaryValue}>{orderSummary.skuCount}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Order Value</Text>
              <Text style={styles.summaryValue}>₹ {parseFloat(orderSummary.totalOrderValue).toLocaleString()}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>(-) Discount</Text>
              <Text style={[styles.summaryValue, styles.discountValue]}>₹ {orderSummary.discount}</Text>
            </View>
          </View>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>(=) Gross Ord Value</Text>
              <Text style={styles.summaryValue}>₹ {parseFloat(orderSummary.grossOrderValue).toLocaleString()}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>(+) Tax</Text>
              <Text style={styles.summaryValue}>₹ {orderSummary.tax}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>(=) Net Ord Value</Text>
              <Text style={[styles.summaryValue, styles.netValue]}>₹ {parseFloat(orderSummary.netOrderValue).toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Icon name="search" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by PO number, SKU, Product title"
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.distributorSection}>
          <Text style={styles.distributorLabel}>Distributor</Text>
          <TouchableOpacity style={styles.distributorDropdown}>
            <Text style={styles.distributorName}>{selectedDistributor?.name}</Text>
            <Icon name="arrow-drop-down" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Icon name="filter-list" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.selectSection}>
          <View style={styles.selectBadge}>
            <Icon name="verified" size={16} color="#169560" />
            <Text style={styles.selectText}>SELECTA</Text>
          </View>
          <Text style={styles.skuText}>| SKU's</Text>
          <TouchableOpacity>
            <Icon name="delete-outline" size={20} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.expandButton}>
            <Icon name="expand-more" size={24} color="#333" />
          </TouchableOpacity>
        </TouchableOpacity>

        <FlatList
          data={filteredCart}
          renderItem={renderCartItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
        />
      </ScrollView>

      <TouchableOpacity 
        style={styles.checkoutButton}
        onPress={handleCheckout}
      >
        <Text style={styles.checkoutText}>Checkout</Text>
      </TouchableOpacity>

      {renderSuccessModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
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
  summaryCard: {
    backgroundColor: '#E8F4EF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  discountValue: {
    color: '#169560',
  },
  netValue: {
    color: colors.primary,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  distributorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  distributorLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  distributorDropdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  distributorName: {
    fontSize: 14,
    color: '#333',
  },
  filterButton: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4EF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  selectText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#169560',
    marginLeft: 4,
  },
  skuText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  expandButton: {
    marginLeft: 8,
  },
  listContent: {
    paddingBottom: 100,
  },
  cartItem: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    padding: 16,
  },
  mappingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mappingText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  mappingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  mappingBadgeText: {
    fontSize: 11,
    color: colors.primary,
    marginLeft: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  orderValue: {
    fontSize: 12,
    color: '#666',
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemId: {
    fontSize: 12,
    color: '#666',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemMetrics: {
    marginBottom: 12,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: '#999',
    flex: 1,
  },
  metricValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  priceItem: {
    width: '50%',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    minWidth: 40,
    textAlign: 'center',
  },
  deleteButton: {
    marginLeft: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  cnsSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cnsBadge: {
    backgroundColor: '#FEF7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  cnsText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  skuInfo: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  checkoutButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '85%',
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#169560',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  goToOrdersButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 8,
  },
  goToOrdersText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default Cart;