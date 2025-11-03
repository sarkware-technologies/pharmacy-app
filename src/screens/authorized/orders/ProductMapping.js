import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../../styles/colors';
import { addToCart, clearCart } from '../../../redux/slices/orderSlice';

const ProductMapping = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { selectedDistributor } = useSelector(state => state.orders || {});
  
  const [activeTab, setActiveTab] = useState('Mapped');
  const [searchText, setSearchText] = useState('');
  const [products, setProducts] = useState([]);
  const [mappedProducts, setMappedProducts] = useState([]);
  const [nonMappedProducts, setNonMappedProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    // Simulate product mapping process
    loadMappedProducts();
  }, []);

  const loadMappedProducts = () => {
    // Mock data for mapped and non-mapped products
    const mockMappedProducts = [
      {
        id: 'INF30R0552',
        name: 'CALDIKIND PLUS CAPSULES 150 MG',
        customerProduct: 'CALDIKIND PLUS CAPSULES',
        pth: 46.34,
        moq: 50,
        exhaustedQty: 100,
        maxQty: 200,
        isMapped: true,
        quantity: 50,
      },
      {
        id: 'INF30R0553',
        name: 'CALDIKIND PLUS CAPSULES 150 MG',
        customerProduct: 'CALDIKIND PLUS CAPSULES',
        pth: 46.34,
        moq: 50,
        exhaustedQty: 100,
        maxQty: 200,
        isMapped: true,
        quantity: 50,
      },
    ];

    const mockNonMappedProducts = [
      {
        id: 'INF30R0554',
        name: 'PRODUCT NOT MAPPED',
        customerProduct: 'UNKNOWN PRODUCT',
        pth: 0,
        moq: 50,
        exhaustedQty: 0,
        maxQty: 0,
        isMapped: false,
        quantity: 50,
      },
    ];

    setMappedProducts(mockMappedProducts);
    setNonMappedProducts(mockNonMappedProducts);
    
    // Initialize quantities
    const initialQuantities = {};
    [...mockMappedProducts, ...mockNonMappedProducts].forEach(product => {
      initialQuantities[product.id] = product.quantity;
    });
    setQuantities(initialQuantities);

    // Set all products
    setProducts([...mockMappedProducts, ...mockNonMappedProducts]);
  };

  const handleQuantityChange = (productId, change) => {
    const newQuantities = { ...quantities };
    const currentQty = newQuantities[productId] || 0;
    const newQty = Math.max(0, currentQty + change);
    newQuantities[productId] = newQty;
    setQuantities(newQuantities);
  };

  const handleProceedToCart = () => {
    // Clear existing cart and add mapped products with quantities
    dispatch(clearCart());
    
    mappedProducts.forEach(product => {
      if (quantities[product.id] > 0) {
        dispatch(addToCart({
          ...product,
          quantity: quantities[product.id],
          orderValue: quantities[product.id] * product.pth
        }));
      }
    });

    setShowConfirmModal(true);
  };

  const handleConfirmOrder = (comment) => {
    setShowConfirmModal(false);
    navigation.navigate('Cart');
  };

  const getFilteredProducts = () => {
    let filteredList = [];
    
    if (activeTab === 'All') {
      filteredList = products;
    } else if (activeTab === 'Mapped') {
      filteredList = mappedProducts;
    } else if (activeTab === 'Non-Mapped') {
      filteredList = nonMappedProducts;
    }

    if (searchText) {
      return filteredList.filter(product => 
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.id.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return filteredList;
  };

  const renderProduct = ({ item }) => {
    const quantity = quantities[item.id] || 0;
    
    return (
      <View style={styles.productCard}>
        <View style={styles.productHeader}>
          <Text style={styles.productName}>{item.name}</Text>
        </View>
        <Text style={styles.productId}>{item.id}</Text>

        <View style={styles.productInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Customer Product Title</Text>
            <Text style={styles.infoLabel}>Mapping</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoValue}>{item.customerProduct}</Text>
            <TouchableOpacity>
              <Text style={styles.changeLink}>Change ›</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.productMetrics}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>PTH</Text>
            <Text style={styles.metricValue}>₹ {item.pth.toFixed(2)}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>MOQ</Text>
            <Text style={styles.metricValue}>{item.moq}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Exausted /Max Qty</Text>
            <Text style={styles.metricValue}>{item.exhaustedQty}/{item.maxQty}</Text>
          </View>
        </View>

        <View style={styles.mappingStatus}>
          {item.isMapped ? (
            <>
              <Icon name="check-circle" size={20} color="#169560" />
              <Text style={styles.mappedText}>Mapped</Text>
            </>
          ) : (
            <>
              <Icon name="error" size={20} color={colors.error} />
              <Text style={styles.notMappedText}>Not Mapped</Text>
            </>
          )}
          
          <View style={styles.quantityControls}>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(item.id, -item.moq)}
            >
              <Icon name="remove" size={20} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(item.id, item.moq)}
            >
              <Icon name="add" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderConfirmModal = () => (
    <Modal
      visible={showConfirmModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowConfirmModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalIcon}>
            <Text style={styles.modalIconText}>!</Text>
          </View>
          
          <Text style={styles.modalTitle}>Confirmation</Text>
          <Text style={styles.modalMessage}>
            Selected {mappedProducts.filter(p => quantities[p.id] > 0).length} Upload order PO will{'\n'}be checked out
          </Text>

          <View style={styles.commentContainer}>
            <Text style={styles.commentLabel}>Write your comment*</Text>
            <TextInput
              style={styles.commentInput}
              multiline
              numberOfLines={4}
              placeholder="Enter your comment here..."
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowConfirmModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={() => handleConfirmOrder('')}
            >
              <Icon name="check" size={20} color="#fff" />
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Order/Product Mapping</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressStep}>
          <View style={[styles.stepCircle, styles.completedStep]}>
            <Icon name="check" size={16} color="#fff" />
          </View>
          <Text style={[styles.stepLabel, styles.completedStepLabel]}>Upload Order</Text>
        </View>
        <View style={styles.progressLine} />
        <View style={styles.progressStep}>
          <View style={[styles.stepCircle, styles.activeStep]}>
            <Text style={styles.stepNumber}>2</Text>
          </View>
          <Text style={[styles.stepLabel, styles.activeStepLabel]}>Product Mapping</Text>
        </View>
      </View>

      <View style={styles.mappingComplete}>
        <Icon name="check-circle" size={16} color="#169560" />
        <Text style={styles.mappingCompleteText}>Mapping Complete</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'All' && styles.activeTab]}
          onPress={() => setActiveTab('All')}
        >
          <Text style={[styles.tabText, activeTab === 'All' && styles.activeTabText]}>
            All(100)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Mapped' && styles.activeTab]}
          onPress={() => setActiveTab('Mapped')}
        >
          <Text style={[styles.tabText, activeTab === 'Mapped' && styles.activeTabText]}>
            Mapped(88)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Non-Mapped' && styles.activeTab]}
          onPress={() => setActiveTab('Non-Mapped')}
        >
          <Text style={[styles.tabText, activeTab === 'Non-Mapped' && styles.activeTabText]}>
            Non-Mapped(12)
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search product name/code"
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Icon name="more-vert" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={getFilteredProducts()}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity 
        style={styles.proceedButton}
        onPress={handleProceedToCart}
      >
        <Text style={styles.proceedText}>Proceed to Cart</Text>
      </TouchableOpacity>

      {renderConfirmModal()}
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
    fontSize: 16,
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
  completedStep: {
    backgroundColor: '#169560',
  },
  activeStep: {
    backgroundColor: colors.primary,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  stepLabel: {
    fontSize: 12,
    color: '#333',
  },
  completedStepLabel: {
    fontWeight: '600',
    color: '#169560',
  },
  activeStepLabel: {
    fontWeight: '600',
    color: '#333',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 12,
    marginBottom: 24,
  },
  mappingComplete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#E8F4EF',
  },
  mappingCompleteText: {
    fontSize: 14,
    color: '#169560',
    fontWeight: '600',
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#F6F6F6',
    gap: 12,
  },
  searchBar: {
    flex: 1,
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
  menuButton: {
    width: 44,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  productHeader: {
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  productId: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  productInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 11,
    color: '#999',
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  changeLink: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  productMetrics: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  mappingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mappedText: {
    fontSize: 14,
    color: '#169560',
    fontWeight: '600',
    marginLeft: 4,
    flex: 1,
  },
  notMappedText: {
    fontSize: 14,
    color: colors.error,
    fontWeight: '600',
    marginLeft: 4,
    flex: 1,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  proceedButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  proceedText: {
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
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  modalIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalIconText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  commentContainer: {
    width: '100%',
    marginBottom: 20,
  },
  commentLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default ProductMapping;