/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
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
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../styles/colors';
import { getCartDetails, getOrders, OrderAction } from '../../../api/orders';
import Menu from '../../../components/icons/Menu';
import AddrLine from '../../../components/icons/AddrLine';
import Filter from '../../../components/icons/Filter';
import Calendar from '../../../components/icons/Calendar';
import FilterModal from '../../../components/FilterModal';
import SelectDistributor from './SelectDistributor';
import CustomerSelectionModal from "./CustomerSelector"
import { setCartDetails, setCartTotal } from '../../../redux/slices/orderSlice';
import { useDispatch, useSelector } from 'react-redux';
import Downarrow from '../../../components/icons/downArrow';
import Toast from 'react-native-toast-message';
import ErrorMessage from "../../../components/view/error"
import { AppText, AppInput } from "../../../components"
import { Fonts } from "../../../utils/fontHelper"
import { formatPrice, getInitials } from "../../../utils/getInitials"
import Svg, { Path } from 'react-native-svg';
import ModalClose from "../../../components/icons/modalClose"
import { SkeletonList } from '../../../components/SkeletonLoader';

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
  const { cartTotal } = useSelector(state => state.orders);

  const [cartCount, setCartCount] = useState(0);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const tabs = ['All', 'Waiting for Confirmation', 'Hold', 'Track PO'];
  // Tab scroll ref for centering active tab
  const tabScrollRef = useRef(null);
  const tabRefs = useRef({});
  
  useEffect(() => {
    const unsubscribe = navigation.getParent()?.addListener("tabPress", e => {
      const parent = navigation.getParent();
      const activeTab = parent?.getState().routes[parent.getState().index].name;
      setPage(1);
      setHasMore(true);
      loadOrders(false, 1);
      // getCartdetails();
    });

    return unsubscribe;
  }, [navigation]);


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

      const cartDetails = response?.cartDetails ?? [];
      if (cartDetails.length > 0) {
        const count = cartDetails.reduce((acc, item) => acc + (item.products?.length ?? 0), 0);
        dispatch(setCartDetails(cartDetails));
        dispatch(setCartTotal(count));
      } else {
        dispatch(setCartDetails([]));
        dispatch(setCartTotal(0));
        setCartCount(0);
      }
    } catch (error) {
      console.error("Error fetching cart details:", error);
      dispatch(setCartTotal(0));
      ErrorMessage()
    }
  };

  useEffect(() => {
    setCartCount(cartTotal);
  }, [cartTotal])


  // ✅ Main API function
  const loadOrders = async (isPaginating = false, resetPage) => {

    const pageNo = resetPage ?? page;
    if (isPaginating) setLoadingMore(true);
    else setLoading(true);
    if (pageNo == 1) {
      setOrders([]);
    }

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



    // Handle tab press with centering
    const handleTabPress = async (tabName) => {
      // First reset the list and set active tab
      setActiveTab(tabName);
  
      // Scroll the tab into visible area after a small delay to ensure layout is ready
      setTimeout(() => {
        if (tabRefs.current[tabName] && tabScrollRef.current) {
          tabRefs.current[tabName].measureLayout(
            tabScrollRef.current.getNode ? tabScrollRef.current.getNode() : tabScrollRef.current,
            (x, y, w, h) => {
              const screenWidth = Dimensions.get('window').width;
              // Center the tab in the screen
              const scrollX = x - (screenWidth / 2) + (w / 2);
  
              tabScrollRef.current?.scrollTo({
                x: Math.max(0, scrollX),
                animated: true
              });
            },
            () => {
              console.log('measureLayout failed');
            }
          );
        }
      }, 100);
    };

  const checkAction = (instance) => {
    let action = true;
    if (instance && Object.keys(instance).length === 0) {
      action = false;
    }
    else if (instance?.stepInstances && instance?.workflowInstance && instance?.stepInstances.length && instance?.stepInstances[0].stepInstanceStatus == "PENDING") {
      action = true;
    }
    else if (instance?.stepInstances && instance?.workflowInstance && instance?.stepInstances.length && (instance?.stepInstances[0].stepInstanceStatus == "APPROVED" || instance?.stepInstances[0].stepInstanceStatus == "APPROVE" || instance?.stepInstances[0].stepInstanceStatus == "REJECT" || instance?.stepInstances[0].stepInstanceStatus == "REJECTED")) {
      action = false;
    }
    else {
      action = true
    }
    return action;
  }

  const actionToast = () => {
    Toast.show({
      type: 'error',
      text1: 'Access denied',
      text2: 'Current user dont have the access.',
    });
  }

  const handleAction = async (type, instance, orderId) => {

    if (instance && Object.keys(instance).length !== 0) {
      if (instance?.stepInstances && instance?.workflowInstance && instance?.stepInstances.length && instance?.stepInstances[0].stepInstanceStatus == "PENDING") {
        const payload = {
          "stepOrder": instance?.stepInstances[0]?.stepOrder,
          "parallelGroup": instance?.stepInstances[0]?.stepOrder,
          "action": type,
          "comments": "Approved after review",
          "actorId": instance?.stepInstances[0]?.assignedUserId,
          "dataChanges": {}
        }
        const response = await OrderAction(instance?.workflowInstance?.id, payload);
        console.log(response);
        if (response?.action == type) {
          const orderlist = orders.map((e) => {
            if (e.orderId !== orderId) return e;

            return {
              ...e,
              instance: {
                ...e.instance,
                stepInstances: [
                  {
                    ...e.instance.stepInstances[0],
                    stepInstanceStatus: type
                  }
                ]
              }
            };
          });

          setOrders(orderlist);

        }
      }
    }
    else {
      Toast.show({
        type: 'error',
        text1: 'Data not fount',
        text2: 'Instance is Missing',
      });
    }

  }
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
            <AppText style={styles.modalTitle}>Create New Order</AppText>
            <TouchableOpacity onPress={() => setShowCreateOrderModal(false)}>
              <ModalClose />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.orderTypeOption}
            onPress={() => handleCreateOrder('manual')}
          >
            <Svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <Path d="M16.75 16.75L12.8896 12.8896M12.8896 12.8896C13.5499 12.2293 14.0737 11.4453 14.4311 10.5826C14.7885 9.71978 14.9724 8.79507 14.9724 7.86121C14.9724 6.92735 14.7885 6.00264 14.4311 5.13987C14.0737 4.2771 13.5499 3.49316 12.8896 2.83283C12.2293 2.17249 11.4453 1.64868 10.5826 1.29131C9.71978 0.933937 8.79507 0.75 7.86121 0.75C6.92735 0.75 6.00264 0.933937 5.13987 1.29131C4.2771 1.64868 3.49316 2.17249 2.83283 2.83283C1.49921 4.16644 0.75 5.9752 0.75 7.86121C0.75 9.74722 1.49921 11.556 2.83283 12.8896C4.16644 14.2232 5.9752 14.9724 7.86121 14.9724C9.74722 14.9724 11.556 14.2232 12.8896 12.8896Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>

            <AppText style={styles.orderTypeText}>Manual Order</AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.orderTypeOption}
            onPress={() => handleCreateOrder('upload')}
          >
            <Svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <Path d="M0.75 12.2206V13.9853C0.75 14.4533 0.934374 14.9022 1.26256 15.2331C1.59075 15.5641 2.03587 15.75 2.5 15.75H13C13.4641 15.75 13.9092 15.5641 14.2374 15.2331C14.5656 14.9022 14.75 14.4533 14.75 13.9853V12.2206M3.375 5.16176L7.75 0.75M7.75 0.75L12.125 5.16176M7.75 0.75V11.3382" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>

            <AppText style={styles.orderTypeText}>Upload Order</AppText>
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
          <AppText style={styles.headerTitle}>Orders</AppText>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.createOrderButton}
              onPress={() => setShowCreateOrderModal(true)}
            >
              <AppText style={styles.createOrderText}>CREATE ORDER</AppText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Cart')}>
              <Icon name="shopping-cart" size={18} color="#fff" />
              {cartCount < 0 && (
                <Downarrow color='#fff' />
              )}
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <AppText style={styles.cartBadgeText}>{cartCount}</AppText>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <ScrollView  ref={tabScrollRef} horizontal showsHorizontalScrollIndicator={false} style={{ ...styles.tabContainer, ...{ height: 55 } }}  scrollEventThrottle={16}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              ref={(ref) => tabRefs.current[tab] = ref}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => handleTabPress(tab)}
            >
              <AppText style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </AppText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Icon name="search" size={20} color="#999" />
            <AppInput
              style={styles.searchInput}
              placeholder="Search customer name/code..."
              value={searchText}
              onChangeText={(e) => setSearchText(e)}
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
          <ScrollView>
            <SkeletonList items={5} />
          </ScrollView>
        ) : (
          <FlatList
            style={{ marginBottom: 100 }}
            data={orders}
            renderItem={({ item }) => (
              <OrderItem
                item={item}
                navigation={navigation}
                checkAction={checkAction}
                handleAction={handleAction}
              />
            )}
            keyExtractor={(item, i) => i.toString()}
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
                  <AppText style={styles.emptyText}>No Orders Found</AppText>
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
          selectedCustomer={selectedCustomer}
          changeCustomer={() => {
            setShowDistributorModal(false)
            setShowCustomerModal(true)
          }}
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



{/* List */ }
const OrderItem = React.memo(
  ({ item, navigation, checkAction, handleAction }) => {

    const date = new Date(item.orderDate);
    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;

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

    const statusColors = getStatusColor(item.statusName);


    return (
      <View style={styles.orderCard}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.push("OrderDetails", { orderId: item?.orderId })}
        >
          {/* Header */}
          <View style={styles.orderHeader}>
            <View style={styles.orderIdRow}>
              <AppText style={styles.orderId}>{item.orderNo}</AppText>
              <Icon name="chevron-right" size={20} color={colors.primary} />
            </View>

            <AppText style={styles.orderAmount}>
              {formatPrice(parseFloat(item.netOrderValue || 0))}
            </AppText>
          </View>

          {/* Meta */}
          <View style={styles.orderMeta}>
            <AppText style={styles.orderDate}>{formattedDate}</AppText>

            <AppText style={styles.skuCount}>
              SKU:{" "}
              <AppText style={{ color: "#2B2B2B", fontFamily: Fonts.Bold }}>
                {item.skwCount ?? 0}
              </AppText>
            </AppText>
          </View>

          {/* Customer */}
          <View style={styles.customerSection}>
            <View style={styles.customerInfo}>
              <View style={styles.customerDetails}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <View
                    style={{
                      backgroundColor: "#9C874333",
                      width: 23,
                      height: 22,
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <AppText style={{ fontSize: 10, color: "#9C8743" }}>
                      {getInitials(item.customerDetails?.customerName || "")}
                    </AppText>
                  </View>

                  <AppText style={styles.customerName}>
                    {item.customerDetails?.customerName}
                  </AppText>
                </View>

                <View style={styles.customerMeta}>
                  <AddrLine />
                  <View style={{ flexDirection: "row", gap: 10, marginLeft: 5 }}>
                    <AppText style={styles.customerMetaText}>
                      {item.customerDetails?.customerId}
                    </AppText>
                    <AppText style={styles.customerMetaText}>
                      | {item.customerDetails?.cityName} | Div:
                    </AppText>
                    <AppText style={styles.customerMetaText}>
                      {item.divisionDetails?.divisionName}
                    </AppText>
                  </View>
                </View>

                <AppText style={styles.pendingAction}>
                  Pending Action by:{" "}
                  <AppText style={{ color: "#222" }}>
                    {item.pendingActionBy?.Username || "N/A"}
                  </AppText>
                </AppText>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.orderFooter}>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <AppText style={[styles.statusText, { color: statusColors.text }]}>
              {item.statusName}
            </AppText>
          </View>

          {checkAction(item?.instance) && (
            <View style={{ display: 'flex', justifyContent: "center", flexDirection: "row", alignItems: "center", gap: 15 }}>
              <TouchableOpacity onPress={() => !checkAction(item?.instance) ? actionToast() : handleAction("APPROVE", item?.instance, item.orderId)} disabled={!checkAction(item?.instance)} style={[{ backgroundColor: "#F7941E", display: 'flex', justifyContent: "center", flexDirection: "row", alignItems: "center", paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8, gap: 5 }, !checkAction(item?.instance) && { opacity: 0.5 }]}>
                {/* <TouchableOpacity onPress={() => handleAction("APPROVE", item?.instance)} style={[{ backgroundColor: "#F7941E", display: 'flex', justifyContent: "center", flexDirection: "row", alignItems: "center", paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8, gap: 5 }, !checkAction(item?.instance) && { opacity: 0.5 }]}> */}
                <Svg width="13" height="9" viewBox="0 0 13 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <Path d="M11.4167 0.75L4.08333 8.08333L0.75 4.75" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <AppText style={{ color: "white", fontSize: 14 }}>
                  Confirm
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => !checkAction(item?.instance) ? actionToast() : handleAction("REJECT", item?.instance, item.orderId)} disabled={!checkAction(item?.instance)} style={!checkAction(item?.instance) && { opacity: 0.5 }}>
                <Svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <Path d="M13.75 13.75L7.75 7.75M7.75 13.75L13.75 7.75M20.75 10.75C20.75 5.227 16.273 0.75 10.75 0.75C5.227 0.75 0.75 5.227 0.75 10.75C0.75 16.273 5.227 20.75 10.75 20.75C16.273 20.75 20.75 16.273 20.75 10.75Z" stroke="#2B2B2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>

              </TouchableOpacity>
            </View>

          )}
        </View>
      </View>
    );
  },
  (prev, next) => prev.item === next.item // prevents re-render
);




const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: 700, color: colors.primaryText, marginLeft: 16, fontFamily: Fonts.Bold },
  headerRight: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 12 },
  createOrderButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F7941E",
  },
  createOrderText: { fontSize: 12, fontWeight: '700', color: colors.primary, fontFamily: Fonts.Bold },
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
  activeTab: { borderBottomWidth: 3, borderBottomColor: colors.primary },
  tabText: { fontSize: 16, color: '#909090', fontWeight: 400, fontFamily: Fonts.Regular },
  activeTabText: { color: colors.primary, fontWeight: 700, fontFamily: Fonts.Bold },
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
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#777777', fontFamily: Fonts.Regular },
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
  orderId: { fontSize: 16, fontWeight: '700', color: '#2B2B2B', fontFamily: Fonts.Black },
  orderAmount: { fontSize: 14, fontWeight: '600', fontFamily: Fonts.Bold, color: '#333' },
  orderMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  orderDate: { fontSize: 12, color: '#777777', fontFamily: Fonts.Regular, marginTop: 4 },
  skuCount: { fontSize: 12, color: '#777777', marginTop: 4, fontFamily: Fonts.Regular },
  customerSection: { borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 8 },
  customerInfo: { flexDirection: 'row', alignItems: 'flex-start' },
  customerDetails: { flex: 1, },
  customerName: { fontSize: 16, fontWeight: '600', color: colors.primaryText, marginBottom: 4, fontFamily: Fonts.Bold, alignItems: "center", display: 'flex', marginTop: 4 },
  customerMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, marginTop: 7 },
  customerMetaText: { fontSize: 14, color: colors.secondaryText, marginLeft: 4, fontFamily: Fonts.Regular },
  pendingAction: { fontSize: 12, color: colors.secondaryText, marginTop: 8 },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 7,
    paddingTop: 12,

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
  modalTitle: { fontSize: 20, fontWeight: 700, color: colors.primaryText },
  orderTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    // borderBottomWidth: 1,
    // borderBottomColor: '#F0F0F0',
  },
  orderTypeText: { fontSize: 20, color: colors.primaryText, marginLeft: 16 },
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
