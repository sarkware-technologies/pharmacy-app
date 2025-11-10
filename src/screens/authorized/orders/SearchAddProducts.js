import React, { useState, useEffect, useCallback } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../../styles/colors';
import { AddtoCart, DeleteCart, getCartDetails, getProducts, IncreaseQTY } from '../../../api/orders';
import { addToCart, updateCartItem } from '../../../redux/slices/orderSlice';
import Downarrow from '../../../components/icons/downArrow';
import Carticon from '../../../components/icons/Cart';
import Svg, { Path } from 'react-native-svg';
import CustomCheckbox from '../../../components/view/checkbox';
import Delete from '../../../components/icons/Delete';
import { setCartDetails } from "../../../redux/slices/orderSlice"
import CustomerSelectionModal from './CustomerSelector';
import SelectDistributor from './SelectDistributor';

const SearchAddProducts = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { cart } = useSelector(state => state.orders);

  const { distributor, customer } = route.params || {};
  const [selectedDistributor, setSelectedDistributor] = useState(distributor);
  const [selectedCustomer, setSelectedCustomer] = useState(customer);

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [quantities, setQuantities] = useState({});
  const [showDistributorselection, setShowSelectdistributor] = useState(false);
  const [showCustomerselection, setShowCustomerselection] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Debounce timer for search
  const [searchTimer, setSearchTimer] = useState(null);

  useEffect(() => {
    getCartdetails();

  }, [selectedDistributor, selectedCustomer])

  const getCartdetails = async () => {
    try {
      const response = await getCartDetails();

      const cartDetails = response?.cartDetails ?? [];

      if (cartDetails.length > 0) {
        dispatch(setCartDetails(cartDetails));

        const productCount = cartDetails[0]?.products?.length ?? 0;
        setCartCount(productCount);
      } else {
        dispatch(setCartDetails([]));
        setCartCount(0);
      }
    } catch (error) {
      console.error("Error fetching cart details:", error);
      setCartCount(0);
    }
  };


  // useEffect(() => {
  //   console.log(cart, 87987987897)
  // }, [cart])

  useEffect(() => {
    // Initialize quantities from cart
    const initialQuantities = {};
    cart.forEach(item => {
      initialQuantities[item.id] = item.quantity;
    });
    setQuantities(initialQuantities);
  }, [cart]);

  useEffect(() => {
    loadProducts(1, searchText, true);
  }, [selectedDistributor, selectedCustomer]);

  // ✅ Debounced Search Effect
  useEffect(() => {
    if (searchTimer) clearTimeout(searchTimer);
    const timer = setTimeout(() => {
      loadProducts(1, searchText, true);
    }, 500);
    setSearchTimer(timer);
    return () => clearTimeout(timer);
  }, [searchText]);

  // ✅ Fetch paginated products
  const loadProducts = useCallback(
    async (pageNumber = 1, search = '', replace = false) => {
      if (loading || (!hasMore && !replace)) return;
      setLoading(true);
      try {
        const params = {
          // distributorIds: selectedDistributor?.id,
          distributorIds: [4],
          customerIds: [parseInt(selectedCustomer?.customerId)],
          page: pageNumber,
          limit: 10,
          search,
        };
        const res = await getProducts(params);

        // 🧩 Safely extract array
        const data = res?.rcDetails ?? [];
        console.log(res, 'fetched products');
        console.log(data, 'fetched products');
        if (data.length === 0) {
          setHasMore(false);
        }

        if (replace) {
          setProducts(data);
        } else {
          setProducts(prev => [...prev, ...data]);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    },
    [selectedDistributor, selectedCustomer, hasMore, loading]
  );


  // ✅ Handle pagination scroll
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadProducts(nextPage, searchText);
    }
  };

  const handleQuantityChange = async (product, event) => {
    console.log(product, 98989998)
    try {
      const minQTY = product?.productDetails.packing ? parseInt(product?.productDetails.packing) : 1
      const updateQTY = product?.quantity + (event === 'plus' ? +minQTY : -minQTY);
      if (updateQTY > 0) {
        const increasesQTY = await IncreaseQTY(
          product?.cartIds,
          product?.productDetails?.productId,
          product?.quantity + (event === 'plus' ? +minQTY : -minQTY)
        );
        if (increasesQTY?.qty) {
          const list = products.map(item => {
            return {
              ...item,
              quantity: item.id === product.id ? increasesQTY?.qty : item?.quantity,
            };
          })
          setProducts(list);
        }
      }
      else {
        await handleDelete(product);
      }


    } catch (error) {

    }
    finally {
      getCartdetails();
    }

  };

  const handleAddToCart = async (product) => {

    try {
      const payload = {
        cfaId: product?.productDetails?.cfaId,
        customerId: product?.customerDetails?.customerId ? parseInt(product?.customerDetails?.customerId) : selectedCustomer?.customerId,
        distributorId: 4,
        divisionId: product?.productDetails?.divisionId,
        modifiedBy: 4,
        createdBy: 4,
        principalId: 1,
        productId: product?.productDetails?.productId,
        qty: product?.productDetails.packing ? parseInt(product?.productDetails.packing) : 1
      }
      const addtocart = await AddtoCart([payload]);

      if (addtocart) {
        console.log(addtocart?.[0]?.id, 89876)
        const list = products.map(item => {
          return {
            ...item,
            isInCart: item.id === product.id ? true : item.isInCart ?? false,
            quantity: item.id === product.id ? payload.qty : item?.quantity,
            cartIds: item.id === product.id ? addtocart?.[0]?.id ?? item.cartIds : item.cartIds,
          };
        })
        setProducts(list);
      }
    }
    catch (error) {

    }
    finally {
      getCartdetails();
    }
  };

  const handleCheckout = () => {
    navigation.navigate('Cart');
  };

  const handleDelete = async (product) => {
    try {

      const deleteCart = await DeleteCart([product.cartIds]);
      if (deleteCart?.message == "Product deleted successfully.") {
        const list = products.map(item => {
          return {
            ...item,
            isInCart: item.id === product.id ? false : item?.isInCart,
            quantity: item.id === product.id ? null : item?.quantity,
            cartIds: item.id === product.id ? null : item.cartIds,
          };
        })
        setProducts(list);
      }

    }
    catch (error) {
    }
    finally {
      getCartdetails();
    }

  }

  const renderProduct = ({ item, index }) => {
    const quantity = item?.quantity || 0;

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

        <View style={styles.productContent}>
          <CustomCheckbox containerStyle={{ alignItems: "flex-start" }} size={20} title={<Text style={styles.productName}>{item?.productDetails?.productName ? item?.productDetails?.productName.toUpperCase() : ''}</Text>} checkboxStyle={{ marginTop: 2 }} />
          <View style={{ marginLeft: 29, marginTop: 0 }}>
            <Text style={styles.productId}>{item.id}</Text>
          </View>

          <View style={styles.productMetrics}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>PTR</Text>
              <Text style={styles.metricValue}>₹ {item?.productDetails?.ptr}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Discount</Text>
              <Text style={styles.metricValue}>₹ {item?.discount}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Margin</Text>
              <Text style={styles.metricValue}>₹{item?.productDetails?.doctorMargin}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>PTH</Text>
              <Text style={styles.metricValue}>₹ {(item?.pth ?? 0)}</Text>
            </View>

          </View>
          <View style={styles.productMetrics}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>MOQ</Text>
              <Text style={styles.metricValue}>{(item?.productDetails?.packing ?? 0)}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Exausted /Max Qty</Text>
              <Text style={{ ...styles.metricValue, ...{ textAlign: "right" } }}>{item.exhaustedQty ?? 0}/{item.maxOrderQty}</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <View style={styles.statusBadge}>
              <Text style={styles.staus}>ACTIVE</Text>
            </View>
            <View style={{ height: 45 }}>
              {item.isInCart ? (
                <View style={styles.quantityControls}>
                  <View style={styles.quantityBox}>
                    {/* border: 1px solid #F7941E1A */}
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => handleQuantityChange(item, 'minus')}
                    >
                      <Icon name="remove" size={20} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{quantity}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => handleQuantityChange(item, 'plus')}
                    >
                      <Icon name="add" size={20} color={colors.primary} />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
                    <Delete />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addToCartButton}
                  onPress={() => handleAddToCart(item)}
                >
                  <Text style={styles.addToCartText}>Add to cart</Text>
                  <Svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <Path fill-rule="evenodd" clip-rule="evenodd" d="M6.66667 13.3333C10.3487 13.3333 13.3333 10.3487 13.3333 6.66667C13.3333 2.98467 10.3487 0 6.66667 0C2.98467 0 0 2.98467 0 6.66667C0 10.3487 2.98467 13.3333 6.66667 13.3333ZM6.98 4.31333C7.07375 4.2197 7.20083 4.16711 7.33333 4.16711C7.46583 4.16711 7.59292 4.2197 7.68667 4.31333L9.68667 6.31333C9.7803 6.40708 9.83289 6.53417 9.83289 6.66667C9.83289 6.79917 9.7803 6.92625 9.68667 7.02L7.68667 9.02C7.64089 9.06912 7.58569 9.10853 7.52436 9.13585C7.46303 9.16318 7.39682 9.17788 7.32968 9.17906C7.26255 9.18025 7.19586 9.1679 7.1336 9.14275C7.07134 9.1176 7.01479 9.08017 6.96731 9.03269C6.91983 8.98521 6.8824 8.92866 6.85725 8.8664C6.8321 8.80414 6.81975 8.73745 6.82094 8.67032C6.82212 8.60318 6.83682 8.53697 6.86415 8.47564C6.89147 8.41431 6.93088 8.35911 6.98 8.31333L8.12667 7.16667H4C3.86739 7.16667 3.74021 7.11399 3.64645 7.02022C3.55268 6.92645 3.5 6.79927 3.5 6.66667C3.5 6.53406 3.55268 6.40688 3.64645 6.31311C3.74021 6.21935 3.86739 6.16667 4 6.16667H8.12667L6.98 5.02C6.88637 4.92625 6.83377 4.79917 6.83377 4.66667C6.83377 4.53417 6.88637 4.40708 6.98 4.31333Z" fill="white" />
                  </Svg>
                </TouchableOpacity>
              )}
            </View>
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
        <TouchableOpacity style={styles.cartIcon} onPress={handleCheckout}>
          <Carticon />
          {cartCount < 0 && (
            <Downarrow color='#fff' />
          )}
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.infoBarContainer}>
        <View style={styles.infoBar}>
          <Text style={styles.infoText}>Showing most ordered products in last 30 days</Text>
        </View>
      </View>
      <View style={styles.filtersContainer}>
        <View style={styles.wrapper}>
          {/* Row for both boxes */}
          <View style={styles.row}>
            <TouchableOpacity style={styles.box} onPress={() => setShowCustomerselection(true)}>
              <Text style={styles.label}>Customer</Text>
              <View style={styles.valueRow}>
                <Text style={styles.valueText} numberOfLines={1}>
                  {selectedCustomer?.customerName}
                </Text>
                <Downarrow />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.box} onPress={() => setShowSelectdistributor(true)}>
              <Text style={styles.label}>Distributor</Text>
              <View style={styles.valueRow}>
                <Text style={styles.valueText} numberOfLines={1}>
                  {selectedDistributor?.name}
                </Text>
                <Downarrow />
              </View>
            </TouchableOpacity>
          </View>
        </View>


      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by product name"
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#777777"
          />
        </View>
      </View>
      <View style={{ paddingHorizontal: 16, borderRadius: 10 }}>
        <View style={{ backgroundColor: "#FFFFFF", overflow: "hidden", borderRadius: 10 }}>
          <TouchableOpacity style={styles.selectAllRow}>
            <CustomCheckbox size={20} title='Select all' textStyle={{ fontSize: 14 }} />
          </TouchableOpacity>
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 160 }}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.2}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={<View style={{ height: 220 }} />}
          />

        </View>
      </View>
      <CustomerSelectionModal onSelectCustomer={(e) => {
        setSelectedCustomer(e)
        setShowCustomerselection(false)
      }} visible={showCustomerselection} onClose={() => setShowCustomerselection(false)} />


      <SelectDistributor onSelect={(e) => {
        setSelectedDistributor(e)
        setShowSelectdistributor(false)
      }} visible={showDistributorselection} onClose={() => setShowSelectdistributor(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#FFFFFF",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 12
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  box: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    position: "relative",
  },
  label: {
    position: "absolute",
    top: -10,
    left: 14,
    backgroundColor: "#fff",
    paddingHorizontal: 6,
    fontSize: 13,
    color: "#777",
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  valueText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#2B2B2B",
    fontWeight: 500
  },
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
    paddingBottom: 6,
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
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 8,
    display: 'flex',
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
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
  infoBarContainer: {
    paddingHorizontal: 16,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingBottom: 10,
  },
  infoBar: {
    backgroundColor: '#fffaeb',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12
  },
  infoText: {
    fontSize: 12,
    color: colors.primary,
    textAlign: 'center',
    color: "#F7941E"
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 12,
    // backgroundColor: '#fff',
    marginTop: 10
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
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    paddingLeft: 15,

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
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EDEDED"
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
    backgroundColor: '#FFFF',
    // marginBottom: 12,
    borderRadius: 8,
    padding: 16,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: "#EDEDED"
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
  },
  productId: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    paddingRight: 20
  },
  productMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  metricItem: {
    // width: '50%',
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
    justifyContent: 'space-between',
  },
  statusBadge: {
    backgroundColor: '#e1f2eb',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  staus: {
    color: "#169560",
    fontWeight: 700,

  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
    alignItems: "center",
  },
  addToCartText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 700,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F7941E1A',
    padding: 3,
    borderRadius: 5
  },
  quantityButton: {
    width: 35,
    height: 35,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#feefdd"
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