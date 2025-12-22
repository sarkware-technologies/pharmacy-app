import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  StatusBar,
  Modal,
  Alert,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../styles/colors';
import Menu from '../../../components/icons/Menu';
import Bell from '../../../components/icons/Bell';
import ArrowDown from '../../../components/icons/ArrowDown';
import Search from '../../../components/icons/Search';
import Filter from '../../../components/icons/Filter';
import Calendar from '../../../components/icons/Calendar';
import AddCircle from '../../../components/icons/AddCircle';
import EyeOpen from '../../../components/icons/EyeOpen';
import ChevronRight from '../../../components/icons/ChevronRight';
import Business from '../../../components/icons/Business';
import AddrLine from '../../../components/icons/AddrLine';
import PauseCircle from '../../../components/icons/PauseCircle';
import { AppText, AppInput } from "../../../components"
import { getPriceSummary, getRCStatus } from "../../../api/rate-contract"
import Svg, { Path } from 'react-native-svg';
import {
  AddProduct,
  ProductSwapping,
  UpdateDiscount,
  UpdateSupplyMode,
  QuotationGeneration,
  CloseIcon
} from "../../../components/icons/pricingIcon"
import { Fonts } from '../../../utils/fontHelper';
import { SkeletonList } from '../../../components/SkeletonLoader';
import SelectProduct from "./model/selectProduct"
import SelectRC from "./model/selectRC"

const RateContractList = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [showGroupupdate, setShowGroupupdate] = useState(false);

  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showSelectProduct, setShowSelectProduct] = useState(false);

  const [groupType, setGroupType] = useState("");
  const [rcAction, setRcAction] = useState("");

  const [selectProduct, setSelectedProduct] = useState(null);
  const [selectProductOld, setSelectedProductOld] = useState(null);
  const [selectProductNew, setSelectedProductNew] = useState(null);

  const [showRCselection, setShowRCselection] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState([]);



  const [selectedFilters, setSelectedFilters] = useState({
    status: ['Active', 'Draft', 'Expired RC', 'Inactive RC', 'Pending Approval', 'Approved', 'Rejected', 'Cancelled', 'Reassigned', 'Expiring Soon'],
    customerGroup: [],
    category: [],
    state: [],
    city: [],
  });


  useEffect(() => {
    const unsubscribe = navigation.getParent()?.addListener("tabPress", e => {
      setPage(1);
      getRcStatus();
      loadSummery(1, true);
      // getCartdetails();
    });

    return unsubscribe;
  }, [navigation]);


  // useEffect(() => {
  //   setPage(1);
  //   getRcStatus();
  //   loadSummery(1, true);
  // }, [navigation])

  const getRcStatus = async () => {
    const response = await getRCStatus();
    // console.log(response?.allStatus, 678898)
    const status = {
      Active: 0,
      Draft: 0,
      Expired: 0,
      Inactive: 0,
      Pending_Approval: 0,
      Approved: 0,
      Rejected: 0,
      Cancelled: 0,
      Reassigned: 0,
      Expiring_Soon: 0,
    };
    if (response?.allStatus) {
      response?.allStatus.forEach(element => {
        // switch(e)
        switch (element?.status) {
          case "ACTIVE":
            status.Active = element?.statusCount;
          case "APPROVED":
            status.Approved = element?.statusCount;
          case "INACTIVE":
            status.Inactive = element?.statusCount;
          case "EXPIRED":
            status.Expired = element?.statusCount;
        }
      });

    }
    setStatusCounts(status);



  }
  const loadSummery = async (pageNumber = 1, isRefresh = false) => {
    try {
      if (pageNumber == 1) {
        setLoading(true)
      }
      const response = await getPriceSummary({ page: pageNumber });

      const data = response?.rcSummary ?? [];

      if (isRefresh) {
        setRateContracts(data);
      } else {
        setRateContracts(prev => [...prev, ...data]);
      }
      if (data.length === 0 || data.length < 10) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    }
    catch (e) {
    }
    finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    getRcStatus();
    setRefreshing(true);
    setPage(1);
    await loadSummery(1, true);
    setRefreshing(false);
  };


  const loadMoreData = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    const next = page + 1;
    setPage(next);

    await loadSummery(next);

    setIsLoadingMore(false);
  };

  useEffect(() => {
    getRcStatus();
    loadSummery(1, true);    // initial load
  }, [navigation]);

  const handleSelectProduct = (product) => {
    if (groupType == "productSwapping") {
      selectProductOld
      if (!selectProductOld) {
        setSelectedProductOld(product)
      }
      else {
        setSelectedProductNew(product)
        setShowSelectProduct(false)
        navigation.navigate('GroupUpdateScreen', { selectProduct, selectProductOld, selectProductNew: product, selectedCustomers, groupType, rcAction })
      }
    }
    else if (groupType == "addNew" || groupType == "updateDiscount" || groupType == "updateSupply" || groupType == "quotation") {
      setSelectedProduct(product)
    }

  }

  const clearState = () => {
    setSelectedProduct(null)
    setSelectedProductOld(null)
    setSelectedProductNew(null)
    setSelectedCustomers([]);
    setRcAction("")
  }


  const groupAction = (type) => {
    clearState();
    setGroupType(type);
    setShowGroupupdate(false);
    if (type == "addNew" || type == "updateDiscount" || type == "updateSupply" || type == "quotation") {
      setShowSelectProduct(true)
    }
    else if (type == "productSwapping") {
      setShowSelectProduct(true)
    }
  }

  const onRcClick = (action) => {
    setShowSelectProduct(false)
    setRcAction(action);
    if (action == "all") {
      navigation.navigate('GroupUpdateScreen', { selectProduct, selectProductOld, selectProductNew, selectedCustomers: null, groupType, rcAction: action })
    }
    else {
      setShowRCselection(true);
    }

  }

  const handleSelectCustomer = (e) => {
    setSelectedCustomers(e);
    navigation.navigate('GroupUpdateScreen', { selectProduct, selectProductOld, selectProductNew, selectedCustomers: e, groupType, rcAction })

  }

  // Mock data for rate contracts
  const [rateContracts, setRateContracts] = useState([]);

  const [statusCounts, setStatusCounts] = useState();

  const tabs = ['All', 'Draft', 'Pending Approval', 'Expiring Soon', 'Expired RC', 'Reassigned'];

  // Tab scroll ref for centering active tab
  const tabScrollRef = useRef(null);
  const tabRefs = useRef({});

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

  const renderStatusBadge = (status) => {
    const statusBackgroundColors = {
      ACTIVE: '#E8F5F0',
      DRAFT: '#f7f1e8',
      'EXPIRED RC': '#FBEAEA',
      EXPIRED: '#FBEAEA',
      'INACTIVE RC': '#F7F9F9',
      INACTIVE: '#F7F9F9',
      'PENDING APPROVAL': '#FEF7ED',
      PENDING: colors.primaryLight,
      APPROVED: '#E8F4EF',
      REJECTED: '#FBEAEA',
      CANCELLED: colors.textSecondary,
      REASSIGNED: '#FEF7ED',
      'EXPIRING SOON': '#F4F4F4',
    };

    const statusTextColors = {
      ACTIVE: '#169560',
      DRAFT: '#AE7017',
      'EXPIRED RC': colors.error,
      EXPIRED: colors.error,
      'INACTIVE RC': colors.gray,
      INACTIVE: colors.gray,
      'PENDING APPROVAL': '#F4AD48',
      PENDING: colors.primaryLight,
      APPROVED: '#169560',
      REJECTED: colors.error,
      CANCELLED: colors.textSecondary,
      REASSIGNED: '#F4AD48',
      'EXPIRING SOON': '#959491',
    };

    return (
      <View style={[styles.statusBadge, { backgroundColor: statusBackgroundColors[status] || colors.gray }]}>
        <AppText style={[styles.statusText, { color: statusTextColors[status] }]}>{status.replace('_', ' ')}</AppText>
      </View>
    );
  };




  // ✅ Modal for order creation
  const renderCreateOrderModal = () => (
    <Modal
      statusBarTranslucent
      visible={showGroupupdate}
      transparent
      animationType="slide"
      onRequestClose={() => setShowGroupupdate(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowGroupupdate(false)}
      >
        <View style={styles.createOrderModalContent}>
          <View style={styles.modalHeader}>
            <AppText style={styles.modalTitle}>Group Update</AppText>
            <TouchableOpacity onPress={() => setShowGroupupdate(false)}>
              <CloseIcon />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.orderTypeOption}
            onPress={() => groupAction('addNew')}
          >
            <AddProduct />
            <AppText style={styles.orderTypeText}>Add New Product</AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.orderTypeOption}
            onPress={() => groupAction('productSwapping')}
          >
            <ProductSwapping />

            <AppText style={styles.orderTypeText}>Product Swapping</AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.orderTypeOption}
            onPress={() => groupAction('updateDiscount')}
          >
            <UpdateDiscount />

            <AppText style={styles.orderTypeText}>Update Discount</AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.orderTypeOption}
            onPress={() => groupAction('updateSupply')}
          >
            <UpdateSupplyMode />

            <AppText style={styles.orderTypeText}>Update Supply Mode</AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.orderTypeOption}
            onPress={() => groupAction('quotation')}
          >
            <QuotationGeneration />

            <AppText style={styles.orderTypeText}>Quotation Generation</AppText>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );









  const renderFilterModal = () => (
    <Modal
      visible={filterVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setFilterVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <AppText style={styles.modalTitle}>Filters</AppText>
            <TouchableOpacity onPress={() => setFilterVisible(false)}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterScroll}>
            <View style={styles.filterSection}>
              <AppText style={styles.filterSectionTitle}>Status</AppText>
              {selectedFilters.status.map((status, i) => (
                <TouchableOpacity key={i + status} style={styles.filterOption} >
                  <Icon name="check-box" size={24} color={colors.primary} />
                  <AppText style={styles.filterOptionText}>{status}</AppText>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.filterSection}>
              <AppText style={styles.filterSectionTitle}>Customer Group</AppText>
              <AppInput
                style={styles.filterInput}
                placeholder="Enter customer group"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.filterSection}>
              <AppText style={styles.filterSectionTitle}>Category</AppText>
              <AppInput
                style={styles.filterInput}
                placeholder="Enter category"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.filterSection}>
              <AppText style={styles.filterSectionTitle}>State</AppText>
              <AppInput
                style={styles.filterInput}
                placeholder="Enter state"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.filterSection}>
              <AppText style={styles.filterSectionTitle}>City</AppText>
              <AppInput
                style={styles.filterInput}
                placeholder="Enter city"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.clearButton}>
              <AppText style={styles.clearButtonText}>Clear filter</AppText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton}>
              <AppText style={styles.applyButtonText}>Apply filter</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderRateContract = ({ item }) => (
    <View style={styles.contractCard}>
      <TouchableOpacity
        style={styles.contractHeader}
        onPress={() => navigation.navigate('RateContractDetail', { contract: item })}
      >
        <View style={styles.contractIdContainer}>
          <AppText style={styles.contractId}>{item?.rateContractNum}</AppText>
          <ChevronRight color={colors.primary} height={11} />
        </View>
        <View style={styles.contractBadges}>
          {item.rfqDate && (
            <View style={styles.dateBadge}>
              <AppText style={styles.dateBadgeText}>RFQ</AppText>
            </View>
          )}
          {item.vqDate && (
            <View style={styles.dateBadge}>
              <AppText style={styles.dateBadgeText}>VQ</AppText>
            </View>
          )}
          <AppText style={styles.dateText}>
            {item?.startDate || item.vqDate}
          </AppText>
          {item.isMultiple && (
            <View style={styles.countBadge}>
              <AppText style={styles.countText}>{item.count} <ArrowDown color={colors.primary} width={8} /></AppText>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.contractBody}>
        <View style={{ display: "flex", flexDirection: "row", gap: 10, justifyContent: "space-between", alignItems: "center" }}>
          <AppText style={styles.customerName}>{item?.customerName}</AppText>
          <View style={{ display: "flex", flexDirection: "row", gap: 10, alignItems: "center" }}>
            <TouchableOpacity>
              <Svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <Path d="M6.19417 7.54261C6.05324 7.68356 5.94147 7.8509 5.86525 8.03507C5.78904 8.21924 5.74988 8.41663 5.75 8.61595V10.7509H7.89833C8.30083 10.7509 8.6875 10.5909 8.9725 10.3059L15.3058 3.96928C15.4471 3.8284 15.5591 3.66104 15.6356 3.47679C15.712 3.29253 15.7514 3.09501 15.7514 2.89553C15.7514 2.69605 15.712 2.49852 15.6356 2.31427C15.5591 2.13002 15.4471 1.96266 15.3058 1.82178L14.68 1.19595C14.5391 1.05459 14.3717 0.942441 14.1874 0.865916C14.003 0.789391 13.8054 0.75 13.6058 0.75C13.4063 0.75 13.2086 0.789391 13.0243 0.865916C12.84 0.942441 12.6726 1.05459 12.5317 1.19595L6.19417 7.54261Z" stroke="#909090" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M15.75 8.25113C15.75 11.787 15.75 13.5545 14.6517 14.6528C13.5533 15.7511 11.785 15.7511 8.25 15.7511C4.715 15.7511 2.94667 15.7511 1.84833 14.6528C0.75 13.5545 0.75 11.7861 0.75 8.25113C0.75 4.71613 0.75 2.9478 1.84833 1.84946C2.94667 0.751129 4.715 0.751129 8.25 0.751129" stroke="#909090" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
            <TouchableOpacity>
              <Svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <Path d="M0.75 11.1407V12.0403C0.75 12.759 1.03548 13.4482 1.54365 13.9564C2.05181 14.4645 2.74103 14.75 3.45968 14.75H12.4919C13.2106 14.75 13.8998 14.4645 14.408 13.9564C14.9161 13.4482 15.2016 12.759 15.2016 12.0403V11.1371M7.97581 0.75V10.6855M7.97581 10.6855L11.1371 7.52419M7.97581 10.6855L4.81452 7.52419" stroke="#909090" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
          </View>

        </View>
        <View style={styles.contractInfo}>
          <AddrLine />
          <AppText style={styles.infoText}>
            {item?.stationCode} | {item?.cityName} | Product Count: {item?.productCount}
          </AppText>
        </View>

        <View style={styles.distributorStockistRow}>
          <TouchableOpacity style={styles.distributorInfo}>
            <Business />
            <AppText style={{ ...styles.infoText, color: '#2B2B2B', fontFamily: Fonts.Bold, fontWeight: 600 }}>Configure Distribution <ChevronRight height={8} /></AppText>
          </TouchableOpacity>

          <View style={styles.stockistInfo}>
            <AppText style={styles.stockistText}>Stockist:<AppText style={{ color: '#202020', fontSize: 14, fontWeight: 'bold' }}>{item.stockist ?? '-'}</AppText></AppText>
            <EyeOpen color={colors.primary} width={16} />
          </View>
        </View>
      </View>

      <View style={styles.contractFooter}>
        {renderStatusBadge(item.status)}
        {item.status === 'DRAFT' ? (
          <TouchableOpacity style={styles.createButton}>
            <AddCircle />
            <AppText style={styles.createButtonText}>Create</AppText>
            <ChevronRight height={11} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.suspendButton}>
            <PauseCircle />
            <AppText style={styles.suspendButtonText}>Suspend</AppText>
            <ChevronRight height={11} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Menu />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>Pricing</AppText>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.groupUpdateButton} onPress={() => setShowGroupupdate(true)}>
            <AppText style={styles.groupUpdateText}>GROUP UPDATE</AppText>
            <ArrowDown color={colors.primary} width={10} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Bell />
          </TouchableOpacity>
        </View>
      </View>
      {loading ? <SkeletonList /> : (
        <FlatList
          data={rateContracts}
          renderItem={renderRateContract}
          keyExtractor={(item, index) => item.id?.toString() + index.toString()}
          contentContainerStyle={{ backgroundColor: "#F6F6F6", padding: 15 }}

          // 🔥 Pull to refresh works now
          refreshing={refreshing}
          onRefresh={onRefresh}

          // 🔥 Pagination
          onEndReachedThreshold={0.5}
          onEndReached={loadMoreData}
          stickyHeaderIndices={[0]}
          // 🔥 Everything above list moved here
          ListHeaderComponent={
            <>
              <View style={styles.content}>
                <View style={styles.statsContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} >
                    <View style={styles.statCard}>
                      <AppText style={styles.statLabel}>Active</AppText>
                      <AppText style={[styles.statValue, { color: "#169560" }]}>
                        {statusCounts?.Active}
                      </AppText>
                    </View>
                    <View style={styles.statCard}>
                      <AppText style={styles.statLabel}>Draft</AppText>
                      <AppText style={[styles.statValue, { color: "#AE7017" }]}>
                        {statusCounts?.Draft}
                      </AppText>
                    </View>
                    <View style={styles.statCard}>
                      <AppText style={styles.statLabel}>Expired RC</AppText>
                      <AppText style={[styles.statValue, { color: "#909090" }]}>
                        {statusCounts?.Draft}
                      </AppText>
                    </View>
                    <View style={styles.statCard}>
                      <AppText style={styles.statLabel}>Inactive RC</AppText>
                      <AppText style={[styles.statValue, { color: colors.gray }]}>
                        {statusCounts?.Inactive}
                      </AppText>
                    </View>
                    <View style={styles.statCard}>
                      <AppText style={styles.statLabel}>Pending Approval</AppText>
                      <AppText style={[styles.statValue, { color: colors.primaryLight }]}>
                        {statusCounts?.Pending_Approval}
                      </AppText>
                    </View>
                    <View style={styles.statCard}>
                      <AppText style={styles.statLabel}>Approved</AppText>
                      <AppText style={[styles.statValue, { color: colors.success }]}>
                        {statusCounts?.Approved}
                      </AppText>
                    </View>
                    <View style={styles.statCard}>
                      <AppText style={styles.statLabel}>Rejected</AppText>
                      <AppText style={[styles.statValue, { color: colors.error }]}>
                        {statusCounts?.Rejected}
                      </AppText>
                    </View>
                    <View style={styles.statCard}>
                      <AppText style={styles.statLabel}>Cancelled</AppText>
                      <AppText style={[styles.statValue, { color: colors.textSecondary }]}>
                        {statusCounts?.Cancelled}
                      </AppText>
                    </View>
                    <View style={styles.statCard}>
                      <AppText style={styles.statLabel}>Reassigned</AppText>
                      <AppText style={[styles.statValue, { color: colors.primaryLight }]}>
                        {statusCounts?.Reassigned}
                      </AppText>
                    </View>
                    <View style={styles.statCard}>
                      <AppText style={styles.statLabel}>Expiring Soon</AppText>
                      <AppText style={[styles.statValue, { color: colors.primary }]}>
                        {statusCounts?.Expiring_Soon}
                      </AppText>
                    </View>
                  </ScrollView>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer} ref={tabScrollRef} scrollEventThrottle={16}>
                  {tabs.map((tab, i) => (
                    <TouchableOpacity
                      key={i + tab}
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

                <View style={styles.filterContainer}>
                  <TouchableOpacity style={styles.filterButton}>
                    <AppText style={styles.filterButtonText}>New Pricing(30)</AppText>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.filterButton, styles.activeFilterButton]}>
                    <AppText style={styles.activeFilterButtonText}>Multiple RC Found(50)</AppText>
                  </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                  <View style={styles.searchBar}>
                    <Search color="#999" />
                    <AppInput
                      style={styles.searchInput}
                      placeholder="Search RC, customer name/code..."
                      value={searchText}
                      onChangeText={setSearchText}
                      placeholderTextColor="#777777"
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.searchFilterButton}
                    onPress={() => setFilterVisible(true)}
                  >
                    <Filter color="#666" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.searchFilterButton}>
                    <Calendar />
                  </TouchableOpacity>
                </View>

              </View>
            </>
          }

          ListFooterComponent={
            isLoadingMore ? (
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={{ marginTop: 10, marginBottom: 20 }}
              />
            ) : null
          }
        />
      )}

      {renderFilterModal()}
      {renderCreateOrderModal()}
      <SelectProduct
        selectProductOld={selectProductOld}
        visible={showSelectProduct}
        onClose={() => setShowSelectProduct(false)}
        selectDIV={groupType != "productSwapping"}
        onSelectProduct={handleSelectProduct}
        selectedProduct={selectProduct}
        onRcClick={onRcClick}
      />
      <SelectRC onSelectCustomer={(e) => handleSelectCustomer(e)} visible={showRCselection} onClose={() => { setShowRCselection(false) }} />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
    // paddingBottom: 20
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginRight: 'auto',
    marginLeft: 10
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  groupUpdateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  groupUpdateText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginRight: 8
  },
  content: {
    flex: 1,
    backgroundColor: '#F6F6F6',
    zIndex: 100
  },
  statsContainer: {
    margin: -8,
    marginBottom: 0,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: colors.white,
  },
  statCard: {
    alignItems: 'start',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#EDEDED',
    borderRadius: 12,
    backgroundColor: colors.white,
    minWidth: 90,
  },
  statLabel: {
    fontSize: 14,
    color: colors.primaryText,
    fontFamily: Fonts.Regular,
    fontWeight: 400
  },
  statValue: {
    fontSize: 18,
    fontWeight: 700,
    fontFamily: Fonts.Bold,
    color: colors.text,
    marginTop: 4,
  },
  tabContainer: {
    margin: -15,
    marginTop: 0,
    marginBottom: 13,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 10,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: "#F7941E",
    fontWeight: 700,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 0,
    gap: 12,
    marginBottom: 13
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "#909090",
    backgroundColor: "#FFFFFF"
  },
  filterButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: Fonts.Regular,
    fontWeight: 400,
    color: "#909090"
  },
  activeFilterButton: {
    backgroundColor: "#fff4e8",
    borderColor: "#F7941E",
    borderWidth: 0.5,
    color: colors.primaryText
  },
  activeFilterButtonText: {
    fontSize: 14,
    color: !colors.white,
    fontWeight: 600
  },

  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#777777',
    fontFamily: Fonts.Regular,
    fontWeight: 400
  },
  searchContainer: {
    flexDirection: 'row',
    paddingBottom: 0,
    marginBottom: 15,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    gap: 12,
  },
  searchFilterButton: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#fff'
  },
  listContent: {
    // paddingBottom: 30,
  },
  contractCard: {
    backgroundColor: colors.white,
    marginBottom: 15,
    borderRadius: 12
  },
  contractHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contractIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contractId: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryText,
    marginRight: 6
  },
  contractBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dateBadgeText: {
    fontSize: 11,
    color: colors.white,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: Fonts.Regular
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  countText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  contractBody: {
    padding: 16,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 600,
    color: colors.primaryText,
    marginBottom: 8,
  },
  contractInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 5
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    fontFamily: Fonts.Regular,
    fontWeight: 400
  },
  distributorStockistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  distributorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  stockistInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stockistText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: 600
  },
  contractFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 15,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 700,
    fontFamily: Fonts.Black,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#2B2B2B',
  },
  createButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: 'bold'
  },
  suspendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#2B2B2B',
  },
  suspendButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: 'bold'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
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
    borderBottomColor: "#F7941E",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: "#F7941E",
  },
  filterScroll: {
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 12,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  filterOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.text,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },

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
    paddingLeft: 30
  },
  orderTypeText: { fontSize: 16, color: '#333', marginLeft: 20 },
});

export default RateContractList;