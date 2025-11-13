import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../../styles/colors';
import { getProducts } from '../../../api/product';
import { setSelectedProduct } from '../../../redux/slices/productSlice';
import {AppText,AppInput} from "../../../components"

const ProductSearch = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState([
    'TELMIKIND-TRIO',
    'ALPHADOL',
    'WILLGO CR'
  ]);
  
  // Filter states
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  const searchTimer = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    // Focus search input when screen loads
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  }, []);

  const handleSearch = async (text) => {
    setSearchText(text);
    
    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
    }
    
    if (!text.trim()) {
      setSearchResults([]);
      return;
    }
    
    searchTimer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await getProducts(1, 50, text);
        setSearchResults(data.products || []);
        
        // Add to recent searches if not already there
        if (text.trim() && !recentSearches.includes(text.trim())) {
          setRecentSearches(prev => [text.trim(), ...prev.slice(0, 4)]);
        }
      } catch (error) {
        console.error('Error searching products:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleRecentSearch = (searchTerm) => {
    setSearchText(searchTerm);
    handleSearch(searchTerm);
  };

  const handleProductSelect = (product) => {
    dispatch(setSelectedProduct(product));
    navigation.navigate('ProductDetail', { product });
  };

  const clearSearch = () => {
    setSearchText('');
    setSearchResults([]);
    searchInputRef.current?.focus();
  };

  const applyFilters = async () => {
    setShowFilters(false);
    setLoading(true);
    
    try {
      // Add filter logic here based on your API
      const data = await getProducts(1, 50, searchText);
      let filtered = data.products || [];
      
      // Apply local filters
      if (selectedStatus !== 'all') {
        filtered = filtered.filter(p => 
          selectedStatus === 'active' ? p.isActive : !p.isActive
        );
      }
      
      if (minPrice) {
        const min = parseFloat(minPrice) * 100;
        filtered = filtered.filter(p => p.ptr >= min);
      }
      
      if (maxPrice) {
        const max = parseFloat(maxPrice) * 100;
        filtered = filtered.filter(p => p.ptr <= max);
      }
      
      setSearchResults(filtered);
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSelectedDivision('');
    setSelectedStatus('all');
    setMinPrice('');
    setMaxPrice('');
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return '₹ 0.00';
    return `₹ ${(price / 100).toFixed(2)}`;
  };

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleProductSelect(item)}
    >
      <View style={styles.resultContent}>
        <AppText style={styles.productName} numberOfLines={1}>
          {item.productName}
        </AppText>
        <View style={styles.resultDetails}>
          <AppText style={styles.productCode}>{item.productCode}</AppText>
          <View style={[
            styles.statusIndicator,
            item.isActive ? styles.activeIndicator : styles.inactiveIndicator
          ]} />
          <AppText style={styles.priceText}>{formatPrice(item.ptr)}</AppText>
        </View>
      </View>
      <Icon name="chevron-right" size={20} color="#999" />
    </TouchableOpacity>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <AppText style={styles.modalTitle}>Filter Products</AppText>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.filterContent}>
            <View style={styles.filterSection}>
              <AppText style={styles.filterLabel}>Status</AppText>
              <View style={styles.statusOptions}>
                {['all', 'active', 'inactive'].map(status => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusOption,
                      selectedStatus === status && styles.selectedStatusOption
                    ]}
                    onPress={() => setSelectedStatus(status)}
                  >
                    <AppText style={[
                      styles.statusOptionText,
                      selectedStatus === status && styles.selectedStatusText
                    ]}>
                      {status === 'all' ? 'All' : status === 'active' ? 'Active' : 'Inactive'}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.filterSection}>
              <AppText style={styles.filterLabel}>Price Range (PTR)</AppText>
              <View style={styles.priceInputs}>
                <AppInput
                  style={styles.priceInput}
                  placeholder="Min"
                  value={minPrice}
                  onChangeText={setMinPrice}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
                <AppText style={styles.priceSeparator}>-</AppText>
                <AppInput
                  style={styles.priceInput}
                  placeholder="Max"
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
            
            <View style={styles.filterSection}>
              <AppText style={styles.filterLabel}>Division</AppText>
              <AppInput
                style={styles.divisionInput}
                placeholder="Enter division name"
                value={selectedDivision}
                onChangeText={setSelectedDivision}
                placeholderTextColor="#999"
              />
            </View>
          </ScrollView>
          
          <View style={styles.filterActions}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetFilters}
            >
              <AppText style={styles.resetButtonText}>Reset</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={applyFilters}
            >
              <AppText style={styles.applyButtonText}>Apply Filters</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>Search Products</AppText>
        <TouchableOpacity onPress={() => setShowFilters(true)}>
          <Icon name="tune" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#999" />
          <AppInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search by product name, code, or brand"
            value={searchText}
            onChangeText={handleSearch}
            placeholderTextColor="#999"
            autoFocus
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Icon name="close" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {searchText.length === 0 && recentSearches.length > 0 && (
        <View style={styles.recentSearchesContainer}>
          <AppText style={styles.recentSearchesTitle}>Recent Searches</AppText>
          {recentSearches.map((term, index) => (
            <TouchableOpacity
              key={index}
              style={styles.recentSearchItem}
              onPress={() => handleRecentSearch(term)}
            >
              <Icon name="history" size={18} color="#999" />
              <AppText style={styles.recentSearchText}>{term}</AppText>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText style={styles.loadingText}>Searching products...</AppText>
        </View>
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResult}
          keyExtractor={item => item.productId.toString()}
          contentContainerStyle={styles.resultsList}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : searchText.length > 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="search-off" size={60} color="#9CA3AF" />
          <AppText style={styles.emptyTitle}>No products found</AppText>
          <AppText style={styles.emptyMessage}>
            Try adjusting your search or filters
          </AppText>
        </View>
      ) : null}
      
      {renderFilterModal()}
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
    justifyContent: 'space-between',
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
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
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
  recentSearchesContainer: {
    backgroundColor: '#fff',
    marginTop: 8,
    padding: 16,
  },
  recentSearchesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  recentSearchText: {
    fontSize: 14,
    color: '#666',
  },
  resultsList: {
    paddingVertical: 8,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultContent: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  resultDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  productCode: {
    fontSize: 12,
    color: '#999',
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeIndicator: {
    backgroundColor: colors.success,
  },
  inactiveIndicator: {
    backgroundColor: colors.error,
  },
  priceText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 16,
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
    paddingBottom: 100,
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
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  filterContent: {
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statusOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  selectedStatusOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusOptionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedStatusText: {
    color: '#fff',
    fontWeight: '500',
  },
  priceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#333',
  },
  priceSeparator: {
    fontSize: 16,
    color: '#999',
  },
  divisionInput: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#333',
  },
  filterActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ProductSearch;