import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,  
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Animated,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../../styles/colors';
import { getProducts, updateProductStatus } from '../../../api/product';
import {
  setProducts,
  addProducts,
  setLoading,
  setSelectedProduct,
  setPagination,
  setFilters,
  updateProduct,
  toggleProductSelection,
  selectAllProducts,
  deselectAllProducts,
  setBulkEditMode
} from '../../../redux/slices/productSlice';
import Menu from '../../../components/icons/Menu';
import Bell from '../../../components/icons/Bell';
import Search from '../../../components/icons/Search';
import Filter from '../../../components/icons/Filter';
import FilterModal from '../../../components/FilterModal';

const ProductList = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { 
    products = [], 
    loading, 
    pagination, 
    filters,
    selectedProducts,
    bulkEditMode 
  } = useSelector(state => state.product || {});

  const [searchText, setSearchText] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [listError, setListError] = useState(null);
  const [allProducts, setAllProducts] = useState([]);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Debounce timer ref
  const searchTimer = useRef(null);

  useEffect(() => {
    loadInitialData();

    // Animate list appearance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadInitialData = async () => {
    dispatch(setLoading(true));
    setListError(null);
    setAllProducts([]);

    try {
      const data = await getProducts(1, 20, searchText);
      setAllProducts(data.products || []);
      dispatch(setProducts(data.products || []));
      dispatch(setPagination({
        page: 1,
        limit: 20,
        total: data.total || 0
      }));

      const totalLoaded = data.products?.length || 0;
      setHasMoreData(totalLoaded < data.total);
    } catch (error) {
      console.error('Error loading products:', error);
      setListError(error.message || 'Failed to load products');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setListError(null);

    try {
      const data = await getProducts(1, 20, searchText);
      setAllProducts(data.products || []);
      dispatch(setProducts(data.products || []));
      dispatch(setPagination({
        page: 1,
        limit: 20,
        total: data.total || 0
      }));

      const totalLoaded = data.products?.length || 0;
      setHasMoreData(totalLoaded < data.total);
    } catch (error) {
      console.error('Error refreshing products:', error);
      setListError(error.message || 'Failed to refresh products');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasMoreData || loading || refreshing) return;

    if (allProducts.length >= pagination.total) {
      setHasMoreData(false);
      return;
    }

    setLoadingMore(true);
    const nextPage = pagination.page + 1;

    try {
      const data = await getProducts(nextPage, 20, searchText);
      const newProducts = data.products || [];

      if (newProducts.length > 0) {
        const updatedList = [...allProducts, ...newProducts];
        setAllProducts(updatedList);
        dispatch(addProducts(newProducts));
        dispatch(setPagination({
          page: nextPage,
          limit: 20,
          total: data.total || 0
        }));

        setHasMoreData(updatedList.length < data.total);
      } else {
        setHasMoreData(false);
      }
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);

    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
    }

    searchTimer.current = setTimeout(() => {
      dispatch(setFilters({ search: text }));
      loadInitialData();
    }, 500);
  };

  const handleProductPress = (product) => {
    if (bulkEditMode) {
      dispatch(toggleProductSelection(product.productId));
    } else {
      dispatch(setSelectedProduct(product));      
      navigation.getParent()?.navigate('ProductStack', {
        screen: 'ProductDetail',
        params: { product },
      });
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      await updateProductStatus(product.productId, !product.isActive);
      const updatedProduct = { ...product, isActive: !product.isActive };
      dispatch(updateProduct(updatedProduct));
      
      // Update local state
      const index = allProducts.findIndex(p => p.productId === product.productId);
      if (index !== -1) {
        const newProducts = [...allProducts];
        newProducts[index] = updatedProduct;
        setAllProducts(newProducts);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update product status');
    }
  };

  const handleApplyFilters = (filters) => {

  };

  const handleBulkEdit = () => {
    if (selectedProducts.length === 0) {
      Alert.alert('No Selection', 'Please select products to edit');
      return;
    }
      navigation.getParent()?.navigate('ProductStack', {
        screen: 'ProductBulkEdit',
        params: { 
          productIds: selectedProducts,
          products: allProducts.filter(p => selectedProducts.includes(p.productId))
        },
      });
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === allProducts.length) {
      dispatch(deselectAllProducts());
    } else {
      dispatch(selectAllProducts());
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return '₹ 0.00';
    return `₹ ${(price / 100).toFixed(2)}`;
  };

  const keyExtractor = useCallback((item) => item.productId.toString(), []);

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingMoreText}>Loading more products...</Text>
      </View>
    );
  };

  const renderProduct = ({ item }) => {
    const isSelected = selectedProducts && selectedProducts.includes(item.productId);
    
    return (
      <TouchableOpacity
        style={[styles.productCard, isSelected && styles.selectedCard]}
        onPress={() => handleProductPress(item)}
        activeOpacity={0.7}
      >
        {bulkEditMode && (
          <View style={styles.checkboxContainer}>
            <TouchableOpacity 
              onPress={() => dispatch(toggleProductSelection(item.productId))}
              style={styles.checkbox}
            >
              <Icon 
                name={isSelected ? 'check-box' : 'check-box-outline-blank'} 
                size={24} 
                color={isSelected ? colors.primary : '#999'} 
              />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.cardHeader}>
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.productName}
            </Text>
            <Text style={styles.productCode}>{item.productCode}</Text>
          </View>
          <View style={styles.moqContainer}>
            <Text style={styles.moqLabel}>MOQ</Text>
            <Text style={styles.moqValue}>{item.moq || '50'}</Text>
          </View>
        </View>

        <View style={styles.priceRow}>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>PTS</Text>
            <Text style={styles.priceValue}>{formatPrice(item.pts)}</Text>
          </View>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>PTR</Text>
            <Text style={styles.priceValue}>{formatPrice(item.ptr)}</Text>
          </View>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>Margin</Text>
            <Text style={styles.priceValue}>
              {formatPrice(item.ptr - item.pts)}
            </Text>
          </View>
          <View style={{ ...styles.priceItem, alignItems: 'flex-end'}}>
            <Text style={styles.priceLabel}>PTH</Text>
            <Text style={styles.priceValue}>{formatPrice(item.mrp)}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={[
              styles.statusBadge,
              item.isActive ? styles.activeBadge : styles.inactiveBadge
            ]}
            onPress={() => handleToggleStatus(item)}
          >
            <Text style={[
              styles.statusText,
              item.isActive ? styles.activeText : styles.inactiveText
            ]}>
              {item.isActive ? 'ACTIVE' : 'IN-ACTIVE'}
            </Text>
          </TouchableOpacity>

          <View style={styles.quantityInfo}>
            <Text style={styles.quantityText}>
              Exausted /Max Qty
            </Text>
            <Text style={styles.quantityValue}>
              {item.exhaustedQty || '100'}/{item.maxQty || '200'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const onRetry = () => {
    setListError(null);
    loadInitialData();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>      
      
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      <View style={{flex: 1, backgroundColor: '#F8F9FA'}}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Menu />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Products</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity>
            <Bell />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by product name/code"
            value={searchText}
            onChangeText={handleSearch}
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Filter />
        </TouchableOpacity>
      </View>      

      {bulkEditMode && (
        <View style={styles.bulkEditBar}>
          <TouchableOpacity onPress={handleSelectAll}>
            <Text style={styles.selectAllText}>
              {selectedProducts.length === allProducts.length ? 'Deselect All' : 'Select All'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.selectedCount}>
            {selectedProducts.length} selected
          </Text>
          <TouchableOpacity onPress={handleBulkEdit}>
            <Text style={styles.bulkEditText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => dispatch(setBulkEditMode(false))}>
            <Icon name="close" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      )}

      <Animated.View
        style={[
          styles.listContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        {loading && allProducts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        ) : listError && allProducts.length === 0 ? (
          <View style={styles.errorContainer}>
            <Icon name="error-outline" size={60} color="#EF4444" />
            <Text style={styles.errorTitle}>Unable to Load Products</Text>
            <Text style={styles.errorMessage}>
              {listError || 'Something went wrong. Please try again.'}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
              <Icon name="refresh" size={20} color="#fff" />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : allProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="inventory" size={60} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Products Found</Text>
            <Text style={styles.emptyMessage}>
              {searchText ? `No products match "${searchText}"` : 'No products available'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={allProducts}
            renderItem={renderProduct}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            removeClippedSubviews={true}
            maxToRenderPerBatch={20}
            windowSize={20}
            initialNumToRender={10}
            updateCellsBatchingPeriod={50}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderFooter()}
          />
        )}
      </Animated.View>

      <FilterModal 
          visible={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          onApply={handleApplyFilters}
        />

      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  headerRight: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 0,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  filterButton: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#fff'
  },
  bulkEditBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  selectAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  selectedCount: {
    fontSize: 14,
    color: '#666',
  },
  bulkEditText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
    marginTop: 8
  },
  listContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,    
  },
  selectedCard: {
    borderColor: colors.primary,
    borderWidth: 1,
  },
  checkboxContainer: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 1,
  },
  checkbox: {
    padding: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
    paddingRight: 12,
  },
  productName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  productCode: {
    fontSize: 12,
    color: '#999',
  },
  moqContainer: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  moqLabel: {
    fontSize: 11,
    color: '#999',
  },
  moqValue: {
    fontSize: 14,    
    color: '#999',
    fontWeight: '500'
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 0,    
  },
  priceItem: {
    flex: 1,
    alignItems: 'flex-start',
  },
  priceLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  activeBadge: {
    backgroundColor: '#E8F5E9',
  },
  inactiveBadge: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeText: {
    color: colors.success,
  },
  inactiveText: {
    color: colors.error,
  },
  quantityInfo: {
    alignItems: 'flex-end',
  },
  quantityText: {
    fontSize: 11,
    color: '#999',
  },
  quantityValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 16,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  loadingMoreText: {
    fontSize: 12,
    color: '#666',
  },
  bulkEditFab: {
    position: 'absolute',
    right: 16,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
});

export default ProductList;