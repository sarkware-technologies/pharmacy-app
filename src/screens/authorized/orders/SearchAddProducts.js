import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../../styles/colors';
import { getProducts } from '../../../api/orders';
import { addToCart, updateCartItem } from '../../../redux/slices/orderSlice';

const SearchAddProducts = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { selectedDistributor, cart } = useSelector(state => state.orders);
  
  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('All Divisions');
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    loadProducts();
  }, [selectedDistributor, selectedDivision]);

  useEffect(() => {
    // Initialize quantities from cart
    const initialQuantities = {};
    cart.forEach(item => {
      initialQuantities[item.id] = item.quantity;
    });
    setQuantities(initialQuantities);
  }, [cart]);

  const loadProducts = async () => {
    if (!selectedDistributor) return;
    
    setLoading(true);
    try {
      const data = await getProducts(selectedDistributor.id, selectedDivision);
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId, change) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const currentQty = quantities[productId] || 0;
    const newQty = Math.max(0, currentQty + change);
    
    if (newQty >= product.moq && newQty <= product.maxQty) {
      setQuantities({ ...quantities, [productId]: newQty });
      
      // Update cart
      if (newQty > 0) {
        dispatch(updateCartItem({ id: productId, quantity: newQty }));
      }
    }
  };

  const handleAddToCart = (product) => {
    const quantity = quantities[product.id] || product.moq;
    
    dispatch(addToCart({
      ...product,
      quantity,
      orderValue: quantity * product.pth
    }));
    
    setQuantities({ ...quantities, [product.id]: quantity });
  };

  const handleCheckout = () => {
    navigation.navigate('Cart');
  };

  const filteredProducts = products.filter(product => {
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      return product.name.toLowerCase().includes(searchLower) ||
             product.id.toLowerCase().includes(searchLower);
    }
    return true;
  });

  const cartItemsCount = cart.reduce((sum, item) => sum + (item.quantity > 0 ? 1 : 0), 0);

  const renderProduct = ({ item, index }) => {
    const isInCart = cart.some(cartItem => cartItem.id === item.id);
    const quantity = quantities[item.id] || 0;
    
    return (
      <View style={styles.productCard}>
        {index === 0 && item.isMappingRequired && (
          <View style={styles.mappingBanner}>
            <Text style={styles.mappingText}>Find Product</Text>
            <View style={styles.mappingBadge}>
              <Text style={styles.mappingBadgeText}>Mapping Required</Text>
            </View>
          </View>
        )}
        
        <TouchableOpacity style={styles.productCheckbox}>
          {isInCart && <Icon name="check-box-outline-blank" size={24} color="#999" />}
        </TouchableOpacity>
        
        <View style={styles.productContent}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productId}>{item.id}</Text>
          
          <View style={styles.productMetrics}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>PTR</Text>
              <Text style={styles.metricValue}>₹ {item.ptr.toFixed(2)}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Discount</Text>
              <Text style={styles.metricValue}>₹ {item.discount.toFixed(2)}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>PTH</Text>
              <Text style={styles.metricValue}>₹ {item.pth.toFixed(2)}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Exausted /Max Qty</Text>
              <Text style={styles.metricValue}>{item.exhaustedQty}/{item.maxQty}</Text>
            </View>
          </View>
          
          <View style={styles.moqRow}>
            <Text style={styles.moqText}>MOQ</Text>
            <Text style={styles.moqValue}>{item.moq}</Text>
          </View>
          
          <View style={styles.actionRow}>
            {quantity > 0 ? (
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
                <TouchableOpacity style={styles.deleteButton}>
                  <Icon name="delete-outline" size={20} color="#999" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.addToCartButton}
                onPress={() => handleAddToCart(item)}
              >
                <Text style={styles.addToCartText}>Add to cart</Text>
                <Icon name="arrow-forward" size={16} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search & Add Products to Cart</Text>
        <TouchableOpacity style={styles.cartIcon}>
          <Icon name="shopping-cart" size={24} color={colors.primary} />
          {cartItemsCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItemsCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.infoBar}>
        <Text style={styles.infoText}>Showing most ordered products in last 30 days</Text>
      </View>

      <View style={styles.filtersContainer}>
        <TouchableOpacity style={styles.filterDropdown}>
          <Text style={styles.filterLabel}>Distributor</Text>
          <View style={styles.filterValue}>
            <Text style={styles.filterText} numberOfLines={1}>
              {selectedDistributor?.name || 'Select Distributor'}
            </Text>
            <Icon name="arrow-drop-down" size={20} color="#333" />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.filterDropdown}>
          <Text style={styles.filterLabel}>Division</Text>
          <View style={styles.filterValue}>
            <Text style={styles.filterText}>{selectedDivision}</Text>
            <Icon name="arrow-drop-down" size={20} color="#333" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by product name"
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <TouchableOpacity style={styles.selectAllRow}>
        <Icon name="check-box-outline-blank" size={20} color="#999" />
        <Text style={styles.selectAllText}>Select all</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {cartItemsCount > 0 && (
        <TouchableOpacity 
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutText}>Checkout ({cartItemsCount} items)</Text>
        </TouchableOpacity>
      )}
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
    flex: 1,
  },
  cartIcon: {
    position: 'relative',
    padding: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  cartBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  infoBar: {
    backgroundColor: '#FEF7ED',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  infoText: {
    fontSize: 12,
    color: colors.primary,
    textAlign: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
  },
  filterDropdown: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  filterValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  filterText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F6F6F6',
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
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F6F6F6',
  },
  selectAllText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  listContent: {
    paddingBottom: 100,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    padding: 16,
    position: 'relative',
  },
  mappingBanner: {
    position: 'absolute',
    top: -12,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mappingText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  mappingBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mappingBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  productCheckbox: {
    marginRight: 12,
    marginTop: 4,
  },
  productContent: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productId: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  productMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  metricItem: {
    width: '50%',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 10,
    color: '#999',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  moqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  moqText: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  moqValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  deleteButton: {
    marginLeft: 8,
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
});

export default SearchAddProducts;