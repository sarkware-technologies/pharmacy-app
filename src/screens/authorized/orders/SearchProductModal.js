import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Svg, { Path } from 'react-native-svg';
import { getProducts } from '../../../api/product';

const { height } = Dimensions.get('window');

export const SearchProductModal = ({
  visible,
  onClose,
  onSelectProduct,
  onSearchChange
}) => {

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Reset when modal opens
  useEffect(() => {
    if (visible) {
      setSearch("");
      setPage(1);
      setProducts([]);
      setHasMore(true);
    }
  }, [visible]);

  // Fetch data when search or page changes
  useEffect(() => {
    fetchProducts(page, search);
  }, [search, page]);

  const fetchProducts = async (pageNumber, query) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (query != '') {
        const response = await getProducts(pageNumber, 20, query);
        const newProducts = response?.products || [];

        if (pageNumber === 1) {
          setProducts(newProducts);
        } else {
          setProducts(prev => [...prev, ...newProducts]);
        }

        // if less than 20, no more pages
        setHasMore(newProducts.length === 20);
      }
      else {
        setHasMore(true);
        setProducts([]);
      }
    } catch (e) {
      console.log("Error fetching products:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (text) => {
    setSearch(text);
    setPage(1);
    setHasMore(true);
    if (onSearchChange) onSearchChange(text);
  };

  const clearSearch = () => {
    setSearch('');
    setPage(1);
    setHasMore(true);
    if (onSearchChange) onSearchChange('');
  };

  const handleSelectProduct = (product) => {
    if (onSelectProduct) onSelectProduct(product);
  };

  // Pagination trigger
  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const renderProduct = ({ item }) => (
      <TouchableOpacity
      style={styles.productCard}
        onPress={() => handleSelectProduct(item)}
      >
        <View style={styles.productContent}>
          <View style={styles.productHeader}>
            <View>
              <Text style={styles.productName}>
                {item.productName
                  ?.split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(' ')}
              </Text>
              <Text style={styles.productCode}>{item.productCode}</Text>
            </View>
            <View style={styles.metricColumn}>
              <Text style={styles.metricLabel}>PTH</Text>
              <Text style={styles.metricValue}>₹ {item.pth ?? '-'}</Text>
            </View>
          </View>

          <View style={styles.productMetrics}>
            <View style={styles.metricColumn}>
              <Text style={styles.metricLabel}>PTR</Text>
              <Text style={styles.metricValue}>₹ {item.ptr}</Text>
            </View>
            <View style={styles.metricColumn}>
              <Text style={styles.metricLabel}>Margin</Text>
              <Text style={styles.metricValue}>{item.packing ?? '-'}</Text>
            </View>
            <View style={styles.metricColumn}>
              <Text style={styles.metricLabel}>MOQ</Text>
              <Text style={[styles.metricValue,{textAlign:"right"}]}>{item.moq ?? '-'}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>

        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Search & add product</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <Path
                d="M11.2442 11.2667L13.8108 13.8333M13 6.75C13 8.4076 12.3415 9.99731 11.1694 11.1694C9.99731 12.3415 8.4076 13 6.75 13C5.0924 13 3.50268 12.3415 2.33058 11.1694C1.15848 9.99731 0.5 8.4076 0.5 6.75C0.5 5.0924 1.15848 3.50268 2.33058 2.33058C3.50268 1.15848 5.0924 0.5 6.75 0.5C8.4076 0.5 9.99731 1.15848 11.1694 2.33058C12.3415 3.50268 13 5.0924 13 6.75Z"
                stroke="#777777"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>

            <TextInput
              style={styles.searchInput}
              placeholder="Search by product name/code"
              placeholderTextColor="#999"
              value={search}
              onChangeText={handleSearchChange}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <Icon name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          {/* Product List */}
          <FlatList
            data={products}
            keyExtractor={(item, index) => item._id || index.toString()}
            renderItem={renderProduct}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListEmptyComponent={
              !isLoading && search.length > 0 ? (
                <View style={styles.emptyContainer}>
                  <Svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <Path d="M32.3749 33.9159L29.065 30.6059M29.065 30.6059C30.0558 29.6146 30.6125 28.2705 30.6128 26.8689C30.6129 25.6459 30.1889 24.4606 29.4131 23.5151C28.6372 22.5695 27.5575 21.9223 26.3579 21.6837C25.1584 21.445 23.9132 21.6297 22.8345 22.2062C21.7558 22.7828 20.9104 23.7155 20.4424 24.8455C19.9744 25.9755 19.9126 27.2328 20.2677 28.4032C20.6228 29.5736 21.3728 30.5847 22.3898 31.2641C23.4068 31.9435 24.628 32.2493 25.8451 32.1293C27.0623 32.0093 28.2002 31.4709 29.065 30.6059Z" stroke="#777777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M16.9583 33.9163H16.5375C11.5116 33.9163 8.99563 33.9163 7.25046 32.6861C6.75381 32.3378 6.30988 31.9198 5.93233 31.445C4.625 29.8016 4.625 27.4367 4.625 22.7038V18.7803C4.625 14.2123 4.625 11.9275 5.34804 10.1038C6.51046 7.16997 8.96788 4.85747 12.0851 3.76288C14.0215 3.08301 16.4465 3.08301 21.3028 3.08301C24.0747 3.08301 25.4622 3.08301 26.5691 3.47151C28.3497 4.09742 29.7542 5.41863 30.4186 7.09443C30.8333 8.13659 30.8333 9.44238 30.8333 12.0524V18.4997" stroke="#777777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M4.625 18.4997C4.625 17.1369 5.16636 15.8299 6.13 14.8663C7.09363 13.9027 8.40059 13.3613 9.76338 13.3613C10.7901 13.3613 12.0003 13.5401 12.9978 13.2734C13.4336 13.1561 13.831 12.9263 14.15 12.607C14.469 12.2877 14.6985 11.8902 14.8154 11.4543C15.0821 10.4568 14.9033 9.24659 14.9033 8.21984C14.9037 6.85733 15.4452 5.55076 16.4088 4.58746C17.3724 3.62416 18.6792 3.08301 20.0417 3.08301" stroke="#777777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                  <Text style={styles.emptyText}>No products found</Text>
                </View>
              ) : !isLoading && search.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <Path d="M32.3749 33.9159L29.065 30.6059M29.065 30.6059C30.0558 29.6146 30.6125 28.2705 30.6128 26.8689C30.6129 25.6459 30.1889 24.4606 29.4131 23.5151C28.6372 22.5695 27.5575 21.9223 26.3579 21.6837C25.1584 21.445 23.9132 21.6297 22.8345 22.2062C21.7558 22.7828 20.9104 23.7155 20.4424 24.8455C19.9744 25.9755 19.9126 27.2328 20.2677 28.4032C20.6228 29.5736 21.3728 30.5847 22.3898 31.2641C23.4068 31.9435 24.628 32.2493 25.8451 32.1293C27.0623 32.0093 28.2002 31.4709 29.065 30.6059Z" stroke="#777777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M16.9583 33.9163H16.5375C11.5116 33.9163 8.99563 33.9163 7.25046 32.6861C6.75381 32.3378 6.30988 31.9198 5.93233 31.445C4.625 29.8016 4.625 27.4367 4.625 22.7038V18.7803C4.625 14.2123 4.625 11.9275 5.34804 10.1038C6.51046 7.16997 8.96788 4.85747 12.0851 3.76288C14.0215 3.08301 16.4465 3.08301 21.3028 3.08301C24.0747 3.08301 25.4622 3.08301 26.5691 3.47151C28.3497 4.09742 29.7542 5.41863 30.4186 7.09443C30.8333 8.13659 30.8333 9.44238 30.8333 12.0524V18.4997" stroke="#777777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M4.625 18.4997C4.625 17.1369 5.16636 15.8299 6.13 14.8663C7.09363 13.9027 8.40059 13.3613 9.76338 13.3613C10.7901 13.3613 12.0003 13.5401 12.9978 13.2734C13.4336 13.1561 13.831 12.9263 14.15 12.607C14.469 12.2877 14.6985 11.8902 14.8154 11.4543C15.0821 10.4568 14.9033 9.24659 14.9033 8.21984C14.9037 6.85733 15.4452 5.55076 16.4088 4.58746C17.3724 3.62416 18.6792 3.08301 20.0417 3.08301" stroke="#777777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                  <Text style={styles.emptyText}>Start typing to search for a product</Text>
                </View>
              ) : null
            }
            ListFooterComponent={
              isLoading && (
                <View style={{ paddingVertical: 20 }}>
                  <ActivityIndicator size="small" color="#FF6B00" />
                </View>
              )
            }
          />

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: height * 0.85,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 8
  },
  clearButton: { padding: 4 },
  productCard: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingHorizontal: 20,
  },
  productCheckbox: { marginRight: 12, paddingTop: 4 },
  productContent: { flex: 1 },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: { fontSize: 16, fontWeight: '600', color: '#333' },
  productCode: { fontSize: 14, color: '#666' },
  productMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metricLabel: { fontSize: 12, color: '#999', marginBottom: 4 },
  metricValue: { fontSize: 14, color: '#333', fontWeight: '500' },
  metricColumn: { alignItems: 'flex-start' },

  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    height: 400
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 15
  },

});

export default SearchProductModal;
