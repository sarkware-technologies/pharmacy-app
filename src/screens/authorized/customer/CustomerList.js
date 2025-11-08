import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  Modal,
  FlatList,
  StatusBar,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../styles/colors';

import { useDispatch, useSelector } from 'react-redux';

import Menu from '../../../components/icons/Menu';
import Phone from '../../../components/icons/Phone';
import Edit from '../../../components/icons/Edit';
import Download from '../../../components/icons/Download';
import Filter from '../../../components/icons/Filter';
import AddrLine from '../../../components/icons/AddrLine';
import Email from '../../../components/icons/Email';
import Search from '../../../components/icons/Search';
import Locked from '../../../components/icons/Locked';
import UnLocked from '../../../components/icons/UnLocked';
import AlertFilled from '../../../components/icons/AlertFilled';
import Bell from '../../../components/icons/Bell';
import FilterModal from '../../../components/FilterModal';
import CloseCircle from '../../../components/icons/CloseCircle';
import EyeOpen from '../../../components/icons/EyeOpen';
import Document from '../../../components/icons/Document';
import People from '../../../components/icons/People';
import Refresh from '../../../components/icons/Refresh';
import AlertCircle from '../../../components/icons/AlertCircle';

const { width, height } = Dimensions.get('window');

// Import Redux actions and selectors
import {
  fetchCustomersList,
  fetchCustomerTypes,
  fetchCustomerStatuses,
  setFilters,
  selectCustomers,
  selectPagination,
  selectLoadingStates,
  selectCustomerStatuses,
  selectCustomerTypes,
  selectFilters,
  incrementPage,
  resetCustomersList
} from '../../../redux/slices/customerSlice';
import ChevronLeft from '../../../components/icons/ChevronLeft';
import ChevronRight from '../../../components/icons/ChevronRight';
import FilterCheck from '../../../components/icons/FilterCheck';
import CheckCircle from '../../../components/icons/CheckCircle';

const CustomerList = ({ navigation }) => {

  const dispatch = useDispatch();
  
  // Get customers from Redux instead of mock data
  const customers = useSelector(selectCustomers);

  const customerTypes = useSelector(selectCustomerTypes);
  const customerStatuses = useSelector(selectCustomerStatuses);
  const cities = useSelector(state => state.customer.cities);
  const states = useSelector(state => state.customer.states);

  const pagination = useSelector(selectPagination);
  const { listLoading, listLoadingMore } = useSelector(selectLoadingStates);
  const { currentPage, hasMore, limit } = pagination; // Add limit here
  const filters = useSelector(selectFilters); // Get filters from Redux
  const listError = useSelector(state => state.customer.error);
  
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const [documentModalVisible, setDocumentModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  const [selectedFilters, setSelectedFilters] = useState({
    typeCode: '',
    statusId: [],
    cityIds: [],
    categoryCode: '',
    subCategoryCode: ''
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const filteredCustomers = customers.filter((customer) => {
    if (activeTab === 'onboarded') {
      return customer.status === 'ACTIVE';
    } else if (activeTab === 'notOnboarded') {
      return customer.status === 'NOT-ONBOARDED';
    }
    return true;
  });

  console.log(filteredCustomers);

  // Fetch customers on mount and when tab changes
  useEffect(() => {
    const initializeData = async () => {    
      dispatch(resetCustomersList());  
      // Fetch customers based on active tab
      dispatch(fetchCustomersList({
        page: 1,
        limit: 10,
        isLoadMore: false,
        isStaging: activeTab === 'notOnboarded' // Use staging endpoint for Not Onboarded tab
      }));
      
      // Only fetch these on initial mount
      if (activeTab === 'all') {
        dispatch(fetchCustomerStatuses());
        dispatch(fetchCustomerTypes());
      }
    };
    
    initializeData();
  }, [dispatch, activeTab]); // Added activeTab as dependency

  // Handle search with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      dispatch(setFilters({ ...filters, searchText }));
      dispatch(resetCustomersList());
      dispatch(fetchCustomersList({
        page: 1,
        limit: 10,
        searchText: searchText,
        ...filters,
        isLoadMore: false,
        isStaging: activeTab === 'notOnboarded' // Pass isStaging based on active tab
      }));
    }, 500);
    
    return () => clearTimeout(delayDebounceFn);
  }, [searchText, dispatch, activeTab]); // Added activeTab as dependency

  // Refresh function
  const onRefresh = async () => {
    setIsRefreshing(true);
    dispatch(resetCustomersList());
    await dispatch(fetchCustomersList({
      page: 1,
      limit: 10,
      ...filters,
      isLoadMore: false,
      isStaging: activeTab === 'notOnboarded' // Pass isStaging based on active tab
    }));
    setIsRefreshing(false);
  };

  // Load more customers for infinite scroll
  const loadMoreCustomers = useCallback(() => {
    if (!hasMore || listLoadingMore || listLoading) {
      return;
    }

    const nextPage = currentPage + 1;
    
    dispatch(fetchCustomersList({
      page: nextPage,
      limit: limit || 10,
      ...filters,
      isLoadMore: true, // This tells the slice to append, not replace
      isStaging: activeTab === 'notOnboarded' // Pass isStaging based on active tab
    })).then((result) => {
      if (result.type === 'customer/fetchList/fulfilled') {
        dispatch(incrementPage());
      }
    });
  }, [dispatch, currentPage, hasMore, listLoadingMore, listLoading, limit, filters, activeTab]);

  // Handle scroll end reached - for FlatList
  const handleLoadMore = () => {
    if (hasMore && !listLoadingMore) {
      loadMoreCustomers();
    }
  };

  // Footer component for loading indicator
  const renderFooter = () => {
    if (!listLoadingMore) return null;
    
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={{ textAlign: 'center', marginTop: 10, color: '#666' }}>
          Loading more customers...
        </Text>
      </View>
    );
  };

  // End reached component
  const renderEndReached = () => {
    if (hasMore || listLoadingMore || customers.length === 0) return null;
    
    return (
      <View style={{ paddingVertical: 20, alignItems: 'center' }}>
        <Text style={{ color: '#999', fontSize: 14 }}>
          — End of list —
        </Text>
        <Text style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
          {customers.length} customers loaded
        </Text>
      </View>
    );
  };

  const keyExtractor = (item) => (item.customerId ? item.customerId.toString() : "");

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
      case 'ACCEPTED':
      case 'APPROVED':
      case 'UN-VERIFIED':
        return 'rgba(34, 197, 94, 0.1)'; // bg-active/10 (green)
      case 'PENDING':
        return 'rgba(251, 146, 60, 0.1)'; // bg-warningLight/10 (orange)
      case 'LOCKED':
        return 'rgba(239, 68, 68, 0.1)'; // bg-danger/10 (red)
      case 'DRAFT':
        return 'rgba(156, 163, 175, 0.08)'; // bg-draftbg/8 (gray)
      case 'NOT ONBOARDED':
        return '#FFF3E0';
      default:
        return '#F5F5F5';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'ACTIVE':
      case 'ACCEPTED':
      case 'APPROVED':
      case 'UN-VERIFIED':
        return '#22C55E'; // text-active (green)
      case 'PENDING':
        return '#FB923C'; // text-warningLight (orange)
      case 'LOCKED':
        return '#EF4444'; // text-danger (red)
      case 'DRAFT':
        return '#9CA3AF'; // text-draftbg (gray)
      case 'NOT ONBOARDED':
        return '#F57C00';
      default:
        return '#757575';
    }
  };

  const handleApplyFilters = (filters) => {
    let typeCode = '';
    let categoryCode = '';
    let subCategoryCode = '';
    let statusIds = [];
    
    // Handle category (customer type) - uses actual API code
    if (filters.category && filters.category.length > 0 && !filters.category.includes('All')) {
      const selectedType = customerTypes.find(type => type.name === filters.category[0]);
      if (selectedType) {
        typeCode = selectedType.code; // "PCM", "HOSP", "DOCT"
      }
    }
    
    // Handle subcategory - uses actual API codes
    if (filters.subCategory && filters.subCategory.length > 0 && typeCode) {
      const selectedSubCatName = filters.subCategory[0];
      const selectedType = customerTypes.find(type => type.code === typeCode);
      
      if (selectedType?.customerCategories) {
        // Check if it's a category
        const category = selectedType.customerCategories.find(cat => cat.name === selectedSubCatName);
        if (category) {
          categoryCode = category.code; // "OR", "OW", "RCW", "PRI", "GOV"
        } else {
          // Check if it's a subcategory
          selectedType.customerCategories.forEach(cat => {
            const subCategory = cat.customerSubcategories?.find(subCat => subCat.name === selectedSubCatName);
            if (subCategory) {
              categoryCode = cat.code;
              subCategoryCode = subCategory.code; // "PCL", "PIH", "PGH"
            }
          });
        }
      }
    }
    
    // Handle status - uses actual API IDs
    if (filters.status && filters.status.length > 0) {
      statusIds = filters.status
        .map(statusName => customerStatuses.find(s => s.name === statusName)?.id)
        .filter(id => id !== undefined); // [1, 2, 3, 4]
    }
    
    // Handle cities - uses actual API IDs
    const cityIds = filters.city && filters.city.length > 0
      ? filters.city
          .map(cityName => cities.find(c => c.cityName === cityName)?.id)
          .filter(id => id !== undefined)
      : [];
    
    // Apply filters matching your Redux structure
    const filterParams = {
      searchText: searchText || '',
      typeCode,
      categoryCode,
      subCategoryCode,
      statusId: statusIds,
      cityIds,
    };
    
    dispatch(setFilters(filterParams));
    dispatch(fetchCustomersList({
      page: 1,
      limit: 10,
      ...filterParams,
      isStaging: activeTab === 'notOnboarded' // Pass isStaging based on active tab
    }));
    
    setFilterModalVisible(false);
  };

  // Add onRetry function
  const onRetry = () => {
    dispatch(resetCustomersList());
    dispatch(fetchCustomersList({
      page: 1,
      limit: 10,
      ...filters,
      isLoadMore: false,
      isStaging: activeTab === 'notOnboarded'
    }));
  };

  // Document Download Modal for individual customer
  const DocumentModal = () => {
    const slideAnim = useRef(new Animated.Value(height * 0.5)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (documentModalVisible) {
        slideAnim.setValue(height * 0.5);
        fadeAnim.setValue(0);
        Animated.parallel([
          Animated.spring(slideAnim, {
            toValue: 0,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [documentModalVisible]);

    const handleClose = () => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height * 0.5,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setDocumentModalVisible(false);
        setSelectedCustomer(null);
      });
    };

    const documents = [
      { name: 'Registration Certificate', icon: 'document-attach-outline' },
      { name: 'Practice License', icon: 'document-outline' },
      { name: 'Address Proof', icon: 'location-outline' },
      { name: 'Image', icon: 'image-outline' },
    ];

    return (
      <Modal
        visible={documentModalVisible}
        transparent
        animationType="none"
        onRequestClose={handleClose}
      >
        <Animated.View 
          style={[
            styles.documentModalOverlay,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.documentOverlayTouch}
            activeOpacity={1}
            onPress={handleClose}
          />
          
          <Animated.View
            style={[
              styles.documentModalContent,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.documentModalHeader}>
              <Text style={styles.documentModalTitle}>Click to download documents</Text>
              <TouchableOpacity onPress={handleClose}>
                <CloseCircle />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.documentList}
              showsVerticalScrollIndicator={false}
            >
              {/* GST and PAN special row at the top */}
              <View style={styles.topDocumentRow}>
                <TouchableOpacity 
                  style={styles.topDocumentItem}
                  activeOpacity={0.7}
                  onPress={() => {
                    console.log(`Download GST for ${selectedCustomer?.customerName}`);
                  }}
                >
                  <View style={styles.topDocumentContent}>
                    <Document />
                    <Text style={styles.topDocumentName}>GST</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.eyeIconButton}
                    onPress={() => {
                      console.log(`Preview GST for ${selectedCustomer?.customerName}`);
                    }}
                  >
                    <EyeOpen width={18} color={colors.primary} />
                  </TouchableOpacity>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.topDocumentItem}
                  activeOpacity={0.7}
                  onPress={() => {
                    console.log(`Download PAN for ${selectedCustomer?.customerName}`);
                  }}
                >
                  <View style={styles.topDocumentContent}>
                    <Document />
                    <Text style={styles.topDocumentName}>PAN</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.eyeIconButton}
                    onPress={() => {
                      console.log(`Preview PAN for ${selectedCustomer?.customerName}`);
                    }}
                  >
                    <EyeOpen width={18} color={colors.primary} />
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>

              <View style={styles.otherDocContainer}>
              {/* Other documents */}
              {documents.map((doc, index) => (
                <View 
                  key={index} 
                  style={styles.documentItemNew}
                >
                  <TouchableOpacity 
                    style={styles.documentRowContent}
                    activeOpacity={0.7}
                    onPress={() => {
                      console.log(`Download ${doc.name} for ${selectedCustomer?.customerName}`);
                    }}
                  >
                    <View style={styles.documentLeftSection}>
                      <Document />
                      <Text style={styles.documentName}>{doc.name}</Text>
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.eyeIconButton}
                    onPress={() => {
                      console.log(`Preview ${doc.name} for ${selectedCustomer?.customerName}`);
                    }}
                  >
                    <EyeOpen width={18} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              ))}
              </View>
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  };

  const renderCustomerItem = ({ item, index }) => {
    return (
      <Animated.View
        style={[
          styles.customerCard,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('CustomerDetail', { customer: item })}
        >
          <View style={styles.customerHeader}>
            <Text style={styles.customerName}>{item.customerName} <ChevronRight height={11} color={colors.primary} /></Text>
            <View style={styles.actionsContainer}>
              {item.statusName === 'NOT-ONBOARDED' && (
                <TouchableOpacity style={styles.actionButton}>
                  <Edit color="#666" />
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                  setSelectedCustomer(item);
                  setDocumentModalVisible(true);
                }}
              >
                <Download color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.customerInfo}>
            <View style={styles.infoRow}>
              <AddrLine color="#999" />
              <Text style={styles.infoText}>{item.customerCode}</Text>
              <Text style={styles.divider}>|</Text>
              <Text style={styles.infoText}>{item.cityName}</Text>
              <Text style={styles.divider}>|</Text>
              <Text style={styles.infoText}>{item.groupName}</Text>
              <Text style={styles.divider}>|</Text>
              <Text style={{...styles.infoText, marginRight: 5}}>{item.customerType}</Text>
              {item.customerType === 'Hospital' && (
                <AlertFilled color="#999" style={styles.infoIcon} />
              )}
            </View>

            <View style={styles.contactRow}>
              <Phone color="#999" />
              <Text style={{...styles.contactText, marginRight: 15}}>{item.mobile}</Text>
              <Email color="#999" style={styles.mailIcon} />
              <Text style={styles.contactText}>{item.email}</Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.statusName) }]}>
              <Text style={[styles.statusText, { color: getStatusTextColor(item.statusName) }]}>
                {item.statusName}
              </Text>
            </View>
            {item.statusName === 'LOCKED' ? (
            <TouchableOpacity style={styles.unlockButton}>
              <UnLocked fill="#EF4444" />
              <Text style={styles.unlockButtonText}>Unblock</Text>
            </TouchableOpacity>
          ) : (item.statusName === 'ACTIVE' || item.statusName === 'UN-VERIFIED') ? (
            <TouchableOpacity style={styles.blockButton}>
              <Locked fill="#666" />
              <Text style={styles.blockButtonText}>Block</Text>
            </TouchableOpacity>
          ) : item.statusName === 'PENDING' ? (
            <View style={styles.pendingActions}>
              <TouchableOpacity style={styles.approveButton}>
                <Text style={styles.approveButtonText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.rejectButton}>
                <CloseCircle />
              </TouchableOpacity>
            </View>
          ) : item.statusName === 'NOT ONBOARDED' ? (
            <TouchableOpacity 
              style={styles.onboardButton}
              onPress={() => navigation.navigate('CustomerOnboard', { customerId: item.customerId })}>
              <Text style={styles.onboardButtonText}>Onboard</Text>
            </TouchableOpacity>
          ) : null}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const DownloadModal = () => (
    <Modal
      visible={downloadModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setDownloadModalVisible(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setDownloadModalVisible(false)}
      >
        <Animated.View style={styles.downloadModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Click to download documents</Text>
            <TouchableOpacity onPress={() => setDownloadModalVisible(false)}>
              <AlertFilled color="#666" />
            </TouchableOpacity>
          </View>

          {[
            { name: 'GST', icon: 'document-text-outline' },
            { name: 'PAN', icon: 'document-text-outline' },
            { name: 'Registration Certificate', icon: 'document-outline' },
            { name: 'Practice License', icon: 'document-outline' },
            { name: 'Address Proof', icon: 'location-outline' },
            { name: 'Image', icon: 'image-outline' },
          ].map((doc, index) => (
            <TouchableOpacity key={index} style={styles.documentItem}>
              <View style={styles.documentLeft}>
                <Icon name={doc.icon} size={20} color="#666" />
                <Text style={styles.documentText}>{doc.name}</Text>
              </View>
              <Icon name="eye-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          ))}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Menu />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customers</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('RegistrationType')}>
            <Text style={styles.createButtonText}>CREATE</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Bell color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDownloadModalVisible(true)}>
            <Download color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All ({pagination.totalCustomers})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'notOnboarded' && styles.activeTab]}
          onPress={() => setActiveTab('notOnboarded')}
        >
          <Text style={[styles.tabText, activeTab === 'notOnboarded' && styles.activeTabText]}>
            Not Onboarded
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'unverified' && styles.activeTab]}
          onPress={() => setActiveTab('unverified')}
        >
          <Text style={[styles.tabText, activeTab === 'unverified' && styles.activeTabText]}>
            Unverified
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by customer name/code"
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Filter color="#666" />
        </TouchableOpacity>
      </View>

      {/* Customer List */}
      <Animated.View
        style={[
          styles.listContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >

        {listLoading && customers.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading customers...</Text>
        </View>
      ) :listError && customers.length === 0 ? (
        <View style={styles.errorContainer}>
          <AlertCircle size={60} color="#EF4444" />
          <Text style={styles.errorTitle}>Unable to Load Customers</Text>
          <Text style={styles.errorMessage}>
            {listError === 'Network request failed' || listError.includes('Network') 
              ? 'Server is currently unavailable. Please check your connection and try again.'
              : listError || 'Something went wrong. Please try again.'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Refresh size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : customers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <People size={60} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No Customers Found</Text>
          <Text style={styles.emptyMessage}>
            {searchText ? `No customers match "${searchText}"` : 'Start by adding your first customer'}
          </Text>
        </View>
      ) : (
        
        <FlatList
        data={filteredCustomers}
        renderItem={renderCustomerItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.scrollContent}
        removeClippedSubviews={true}
        maxToRenderPerBatch={20}
        windowSize={20}
        initialNumToRender={10}
        updateCellsBatchingPeriod={50}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        // Infinite scroll props
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3} // Load more when 30% from bottom
        ListFooterComponent={
          <>
            {renderFooter()}
            {renderEndReached()}
          </>
        }
        ListEmptyComponent={
          !listLoading && (
            <View style={styles.emptyContainer}>
              <People width={80} height={80} color="#E0E0E0" />
              <Text style={styles.emptyTitle}>No Customers Found</Text>
              <Text style={styles.emptyMessage}>
                {searchText 
                  ? `No results for "${searchText}"`
                  : 'Start by adding your first customer'}
              </Text>
            </View>
          )
        }                
      />

      )}
        </Animated.View>

        <DownloadModal />
        <DocumentModal />

        <FilterModal 
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          onApply={handleApplyFilters}
        />

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  createButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
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
    borderRadius: 16,
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
  listContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  listContent: {
    paddingBottom: 20,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textLight,
  },
  customerCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  customerInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  divider: {
    color: '#999',
    marginHorizontal: 8,
  },
  infoIcon: {
    marginLeft: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  mailIcon: {
    marginLeft: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  blockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#999',
  },
  blockButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  onboardButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  onboardButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D32F2F',
  },
  unlockButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#D32F2F',
  },
  pendingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
    gap: 4,
  },
  approveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  rejectButton: {
    padding: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  downloadModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  documentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  // Document Modal Styles
  documentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  documentOverlayTouch: {
    flex: 1,
  },
  documentModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.5,
    paddingTop: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  documentModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  documentModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  documentList: {
    flex: 1,
    paddingTop: 8,
  },
  otherDocContainer: {
    display: 'flex',
    padding: 20,
    gap: 20
  },
  documentItemNew: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#F5F5F5',
    borderRadius: 8
  },
  documentRowContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentName: {
    marginLeft: 20,
    fontSize: 16,
    color: '#333',
    fontWeight: '400',
  },
  eyeIconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topDocumentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 0,
    gap: 12,
  },
  topDocumentItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F5F5F5'
  },
  topDocumentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingLeft: 10
  },
  topDocumentName: {
    marginLeft: 12,
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
});

export default CustomerList;