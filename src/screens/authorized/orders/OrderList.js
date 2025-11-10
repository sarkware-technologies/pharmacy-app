import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../styles/colors';
import { getCartDetails, getOrders } from '../../../api/orders';
import Menu from '../../../components/icons/Menu';
import AddrLine from '../../../components/icons/AddrLine';
import Filter from '../../../components/icons/Filter';
import Calendar from '../../../components/icons/Calendar';
import FilterModal from '../../../components/FilterModal';
import SelectDistributor from './SelectDistributor';
import CustomerSelectionModal from "./CustomerSelector"
import { setCartDetails } from '../../../redux/slices/orderSlice';
import { useDispatch } from 'react-redux';
import Downarrow from '../../../components/icons/downArrow';
import Toast from 'react-native-toast-message';
import ErrorMessage from "../../../components/view/error"

const OrderList = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [showDistributorModal, setShowDistributorModal] = useState(false);

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedType, setSelectedType] = useState("");

  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [cartCount, setCartCount] = useState(0);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const tabs = ['All', 'Waiting for Confirmation', 'Hold', 'Track PO'];

  // ✅ Load orders when tab changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    loadOrders(false, 1);
    getCartdetails();
  }, [activeTab, searchText]);

  const getCartdetails = async () => {
    try {
      const response = await getCartDetails();
      console.log(response);

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
      ErrorMessage()
    }
  };


  // ✅ Main API function
  const loadOrders = async (isPaginating = false, resetPage) => {
    const pageNo = resetPage ?? page;
    if (isPaginating) setLoadingMore(true);
    else setLoading(true);

    try {
      const data = await getOrders({ page: pageNo, status: activeTab, search: searchText });
      if (data?.orders?.length) {
        setOrders((prev) => (isPaginating ? [...prev, ...data.orders] : data.orders));
        setHasMore(data.orders.length > 0);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      const statusCode = error?.response?.status;
      if ([500, 502, 504].includes(statusCode)) {
        setOrders([])
        setLoading(false);
        setHasMore(false);
        Toast.show({
          type: 'error',
          text1: 'Server Error',
          text2: `Server temporarily unavailable (Error ${statusCode}). Please try again later.`,
        });
      }
      // ✅ Handle known empty data case
      else if (error.message === 'No data found with linked customer Ids') {
        if (pageNo === 1) setOrders([]);
        setHasMore(false);
      }
      else {
        setOrders([])
        setHasMore(false);
        setLoading(false);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load orders. Please try again.',
        });
      }
    } finally {
      if (isPaginating) setLoadingMore(false);
      else setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ Infinite scroll trigger
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  // ✅ Fetch next page when page increases
  useEffect(() => {
    if (page > 1) {
      loadOrders(true);
    }
  }, [page]);

  // ✅ Pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    setSearchText('');
    setPage(1);
    setHasMore(true);
    await loadOrders(false, 1);
  };

  // ✅ Create order navigation
  const handleCreateOrder = (type) => {
    setSelectedDistributor(null);
    setSelectedCustomer(null);
    setSelectedType(type);
    setShowCreateOrderModal(false);
    if (type === 'manual') {
      setShowCustomerModal(true);

    } else {
      setShowCustomerModal(true);
    }
  };

  const handleDistributorSelect = (distributor) => {
    setShowDistributorModal(false);
    setSelectedDistributor(distributor);
    if (selectedType === "manual") {
      navigation.navigate('SearchAddProducts', { distributor: distributor, customer: selectedCustomer });
    }
    else {
      navigation.navigate('UploadOrder', { distributor: distributor, customer: selectedCustomer });
      //   navigation.getParent()?.navigate('OrdersStack', {
      //     screen: 'UploadOrder',
      //     params: { distributor: distributor, customer: selectedCustomer },
      //   });
    }
  };

  const handleCustomerSelect = (customer) => {
    setShowCustomerModal(false);
    setShowDistributorModal(true);
    setSelectedCustomer(customer);
    // Example: navigate to manual order page
  };

  // ✅ Status color logic
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING APPROVAL':
        return { bg: '#FEF7ED', text: '#F4AD48' };
      case 'APPROVED':
        return { bg: '#E8F4EF', text: '#169560' };
      default:
        return { bg: '#F4F4F4', text: '#666' };
    }
  };

  // ✅ Render each order item
  const renderOrder = ({ item }) => {
    const statusColors = getStatusColor(item.statusName);
    const date = new Date(item.orderDate);
    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;

    return (
      <TouchableOpacity style={styles.orderCard} activeOpacity={0.7}>
        <TouchableOpacity >
          <View style={styles.orderHeader}>
            <View style={styles.orderIdRow}>
              <Text style={styles.orderId}>{item.orderNo}</Text>
              <Icon name="chevron-right" size={20} color={colors.primary} />
            </View>
            <Text style={styles.orderAmount}>
              ₹ {Number(item.netOrderValue || 0).toFixed(2)}
            </Text>
          </View>

          <View style={styles.orderMeta}>
            <Text style={styles.orderDate}>{formattedDate}</Text>
            <Text style={styles.skuCount}>
              SKU : <Text style={{ color: '#222' }}>{item.skwCount ?? 0}</Text>
            </Text>
          </View>
        </TouchableOpacity>
        <View style={styles.customerSection}>
          <View style={styles.customerInfo}>
            <View style={styles.customerDetails}>
              <Text style={styles.customerName}>{item.customerDetails?.customerName}</Text>
              <View style={styles.customerMeta}>
                <AddrLine />
                <Text style={styles.customerMetaText}>
                  {item.customerDetails?.customerId} | {item.customerDetails?.cityName} | Div:{' '}
                  {item.divisionDetails?.divisionName}
                </Text>
              </View>
              <Text style={styles.pendingAction}>
                Pending Action by:{' '}
                <Text style={{ color: '#222' }}>
                  {item.pendingActionBy?.Username || 'N/A'}
                </Text>
              </Text>
            </View>
            <TouchableOpacity>
              <Icon name="download" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.orderFooter}>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusText, { color: statusColors.text }]}>
              {item.statusName}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ✅ Modal for order creation
  const renderCreateOrderModal = () => (
    <Modal
      visible={showCreateOrderModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCreateOrderModal(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowCreateOrderModal(false)}
      >
        <View style={styles.createOrderModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Order</Text>
            <TouchableOpacity onPress={() => setShowCreateOrderModal(false)}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.orderTypeOption}
            onPress={() => handleCreateOrder('manual')}
          >
            <Icon name="search" size={24} color="#666" />
            <Text style={styles.orderTypeText}>Manual Order</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.orderTypeOption}
            onPress={() => handleCreateOrder('upload')}
          >
            <Icon name="upload" size={24} color="#666" />
            <Text style={styles.orderTypeText}>Upload Order</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      <View style={{ backgroundColor: '#F6F6F6' }}>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Menu />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Orders</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.createOrderButton}
              onPress={() => setShowCreateOrderModal(true)}
            >
              <Text style={styles.createOrderText}>CREATE ORDER</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Cart')}>
              <Icon name="shopping-cart" size={18} color="#fff" />
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
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ ...styles.tabContainer, ...{ height: 55 } }}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Icon name="search" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search customer name/code..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#999"
            />
          </View>
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
            <Filter />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Calendar />
          </TouchableOpacity>
        </View>

        {/* List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            style={{ marginBottom: 100 }}
            data={orders}
            renderItem={renderOrder}
            keyExtractor={(item) => item.orderId.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.2}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={{ marginVertical: 20 }}
                />
              ) : null
            }
            ListEmptyComponent={
              !loading && !refreshing ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No Orders Found</Text>
                </View>

              ) : null
            }
          />
        )}
        {renderCreateOrderModal()}
        <SelectDistributor
          visible={showDistributorModal}
          onClose={() => setShowDistributorModal(false)}
          onSelect={handleDistributorSelect}
          customerId={selectedCustomer?.customerId}
        />
        <CustomerSelectionModal
          visible={showCustomerModal}
          onClose={() => setShowCustomerModal(false)}
          onSelectCustomer={handleCustomerSelect}
        />
      </View>

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={() => { }}
      />
      {/* <Toast /> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#333', marginLeft: 16 },
  headerRight: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 12 },
  createOrderButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  createOrderText: { fontSize: 12, fontWeight: '600', color: colors.primary },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tabContainer: {
    backgroundColor: '#fff',
    maxHeight: 64,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: { paddingHorizontal: 20, paddingVertical: 10 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { fontSize: 14, color: '#666' },
  activeTabText: { color: colors.primary, fontWeight: '500' },
  searchContainer: { flexDirection: 'row', padding: 16, gap: 12, backgroundColor: '#F6F6F6' },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#333' },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  orderCard: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, padding: 16 },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  orderIdRow: { flexDirection: 'row', alignItems: 'center' },
  orderId: { fontSize: 14, fontWeight: '600', color: '#333' },
  orderAmount: { fontSize: 12, fontWeight: '500', color: '#333' },
  orderMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  orderDate: { fontSize: 12, color: '#666' },
  skuCount: { fontSize: 12, color: '#666' },
  customerSection: { borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 8 },
  customerInfo: { flexDirection: 'row', alignItems: 'flex-start' },
  customerDetails: { flex: 1 },
  customerName: { fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 4 },
  customerMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  customerMetaText: { fontSize: 12, color: '#666', marginLeft: 4 },
  pendingAction: { fontSize: 12, color: '#666' },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  statusText: { fontSize: 12, fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  createOrderModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  orderTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  orderTypeText: { fontSize: 16, color: '#333', marginLeft: 16 },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
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
});

export default OrderList;
