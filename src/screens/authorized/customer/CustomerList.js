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
  Alert,
  Linking,
  Image,
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
import EditCustomer from '../../../components/icons/EditCustomer';
import ApproveCustomerModal from '../../../components/modals/ApproveCustomerModal';
import RejectCustomerModal from '../../../components/modals/RejectCustomerModal';
import { customerAPI } from '../../../api/customer';
import { SkeletonList } from '../../../components/SkeletonLoader';
import {AppText,AppInput} from "../../../components"
import Toast from 'react-native-toast-message';
import { handleOnboardCustomer } from '../../../utils/customerNavigationHelper';

const { width, height } = Dimensions.get('window');

// Import Redux actions and selectors
import {
  fetchCustomersList,
  fetchCustomerTypes,
  fetchCustomerStatuses,
  fetchTabCounts, // NEW: Import fetchTabCounts action
  setFilters,
  selectCustomers,
  selectPagination,
  selectLoadingStates,
  selectCustomerStatuses,
  selectCustomerTypes,
  selectFilters,
  resetCustomersList,
  setTabCounts, // Import setTabCounts action
  selectTabCounts, // Import selectTabCounts selector
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
  
  // Get logged-in user data
  const loggedInUser = useSelector(state => state.auth.user);
  const states = useSelector(state => state.customer.states);

  const pagination = useSelector(selectPagination);
  const { listLoading, listLoadingMore } = useSelector(selectLoadingStates);
  const { currentPage, hasMore, limit } = pagination; // Add limit here
  const filters = useSelector(selectFilters); // Get filters from Redux
  const listError = useSelector(state => state.customer.error);
  const tabCounts = useSelector(selectTabCounts); // Re-added tabCounts selector
  
  // Console log tab counts for debugging
  useEffect(() => {
    console.log('=== TAB COUNTS IN CUSTOMERLIST ===');
    console.log('Tab Counts:', tabCounts);
    console.log('All:', tabCounts.all);
    console.log('Waiting for Approval:', tabCounts.waitingForApproval);
    console.log('Not Onboarded:', tabCounts.notOnboarded);
    console.log('Unverified:', tabCounts.unverified);
    console.log('Rejected:', tabCounts.rejected);
    console.log('====================================');
  }, [tabCounts]);
  
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
  
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedCustomerForAction, setSelectedCustomerForAction] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  
  // Documents modal state
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [customerDocuments, setCustomerDocuments] = useState(null);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [selectedDocumentForPreview, setSelectedDocumentForPreview] = useState(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewSignedUrl, setPreviewSignedUrl] = useState(null);

  // Block/Unblock state
  const [blockUnblockLoading, setBlockUnblockLoading] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // Tab scroll ref for centering active tab
  const tabScrollRef = useRef(null);
  const tabRefs = useRef({});

  const filteredCustomers = customers.filter((customer) => {
    if (activeTab === 'onboarded') {
      return customer.statusName === 'ACTIVE';
    } else if (activeTab === 'waitingForApproval' || activeTab === 'notOnboarded') {
      // Use the same dataset for both tabs, based on PENDING status
      return customer.statusName === 'PENDING';
    }
    return true;
  });

  // Map tab to statusIds
  const getStatusIdsForTab = (tab) => {
    const statusMap = {
      'all': [0],
      'waitingForApproval': [5],
      'notOnboarded': [18],
      'unverified': [19],
      'rejected': [6]
    };
    return statusMap[tab] || [0];
  };

  // Fetch tab counts on component mount
  useEffect(() => {
    dispatch(fetchTabCounts());
  }, [dispatch]);

  // Fetch customers on mount and when tab changes
  useEffect(() => {
    const initializeData = async () => {    
      dispatch(resetCustomersList());  
      // Fetch customers based on active tab
      // For 'all' and 'waitingForApproval', use original logic
      // For other tabs, use statusIds
      if (activeTab === 'all' || activeTab === 'waitingForApproval') {
        const isStaging = activeTab === 'waitingForApproval';
        dispatch(fetchCustomersList({
          page: 1,
          limit: 10,
          isLoadMore: false,
          isStaging: isStaging,
          ...(isStaging && { statusIds: [5] })
        }));
      } else {
        // For unverified, rejected, notOnboarded use new statusIds
        const statusIds = getStatusIdsForTab(activeTab);
        dispatch(fetchCustomersList({
          page: 1,
          limit: 10,
          isLoadMore: false,
          statusIds: statusIds
        }));
      }
      
      // Only fetch these on initial mount
      if (activeTab === 'all') {
        dispatch(fetchCustomerStatuses());
        dispatch(fetchCustomerTypes());
      }
    };
    
    initializeData();
  }, [activeTab, dispatch]); // Only trigger on tab change

  // Handle search with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      dispatch(resetCustomersList());
      if (activeTab === 'all' || activeTab === 'waitingForApproval') {
        const isStaging = activeTab === 'waitingForApproval';
        dispatch(fetchCustomersList({
          page: 1,
          limit: 10,
          searchText: searchText,
          typeCode: selectedFilters.typeCode,
          categoryCode: selectedFilters.categoryCode,
          subCategoryCode: selectedFilters.subCategoryCode,
          statusId: selectedFilters.statusId,
          cityIds: selectedFilters.cityIds,
          isLoadMore: false,
          isStaging: isStaging,
          ...(isStaging && { statusIds: [5] })
        }));
      } else {
        const statusIds = getStatusIdsForTab(activeTab);
        dispatch(fetchCustomersList({
          page: 1,
          limit: 10,
          searchText: searchText,
          typeCode: selectedFilters.typeCode,
          categoryCode: selectedFilters.categoryCode,
          subCategoryCode: selectedFilters.subCategoryCode,
          statusId: selectedFilters.statusId,
          cityIds: selectedFilters.cityIds,
          isLoadMore: false,
          statusIds: statusIds
        }));
      }
    }, 500);
    
    return () => clearTimeout(delayDebounceFn);
  }, [searchText, dispatch]); // Only trigger on search text change, not on tab change

  // Refresh function
  const onRefresh = async () => {
    setIsRefreshing(true);
    dispatch(resetCustomersList());
    if (activeTab === 'all' || activeTab === 'waitingForApproval') {
      const isStaging = activeTab === 'waitingForApproval';
      await dispatch(fetchCustomersList({
        page: 1,
        limit: 10,
        ...filters,
        isLoadMore: false,
        isStaging: isStaging,
        ...(isStaging && { statusIds: [5] })
      }));
    } else {
      const statusIds = getStatusIdsForTab(activeTab);
      await dispatch(fetchCustomersList({
        page: 1,
        limit: 10,
        ...filters,
        isLoadMore: false,
        statusIds: statusIds
      }));
    }
    setIsRefreshing(false);
  };

  // Load more customers for infinite scroll
  const loadMoreCustomers = useCallback(() => {
    if (!hasMore || listLoadingMore || listLoading) {
      return;
    }

    const nextPage = currentPage + 1;
    
    let requestParams;
    if (activeTab === 'all' || activeTab === 'waitingForApproval') {
      const isStaging = activeTab === 'waitingForApproval';
      requestParams = {
        page: nextPage,
        limit: limit || 10,
        ...filters,
        isLoadMore: true,
        isStaging: isStaging,
        ...(isStaging && { statusIds: [5] })
      };
    } else {
      const statusIds = getStatusIdsForTab(activeTab);
      requestParams = {
        page: nextPage,
        limit: limit || 10,
        ...filters,
        isLoadMore: true,
        statusIds: statusIds
      };
    }
    
    dispatch(fetchCustomersList(requestParams));
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
        <AppText style={{ textAlign: 'center', marginTop: 10, color: '#666' }}>
          Loading more customers...
        </AppText>
      </View>
    );
  };

  // End reached component
  const renderEndReached = () => {
    if (hasMore || listLoadingMore || customers.length === 0) return null;
    
    return (
      <View style={{ paddingVertical: 20, alignItems: 'center' }}>
        <AppText style={{ color: '#999', fontSize: 14 }}>
          — End of list —
        </AppText>
        <AppText style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
          {customers.length} customers loaded
        </AppText>
      </View>
    );
  };

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    
    setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };

  // Handle tab press with centering
  const handleTabPress = (tabName) => {
    setActiveTab(tabName);
    
    // Scroll the tab into center view after a small delay to ensure layout is ready
    setTimeout(() => {
      if (tabRefs.current[tabName] && tabScrollRef.current) {
        tabRefs.current[tabName].measureInWindow((x, y, width, height) => {
          const screenWidth = Dimensions.get('window').width;
          const centerOffset = x + width / 2 - screenWidth / 2;
          tabScrollRef.current?.scrollTo({ x: centerOffset, animated: true });
        });
      }
    }, 100);
  };

  // Fetch customer documents
  const fetchCustomerDocuments = async (customer) => {
    setLoadingDocuments(true);
    try {
      const customerId = customer?.stgCustomerId || customer?.customerId;
      const isStaging = customer?.statusName === 'PENDING' || customer?.statusName === 'NOT-ONBOARDED';
      
      const response = await customerAPI.getCustomerDetails(customerId, isStaging);
      
      if (response?.data) {
        const details = response.data;
        const docs = {
          gst: details.securityDetails?.gstNumber || null,
          gstDoc: details.docType?.find(d => d.doctypeName === 'GSTIN') || null,
          pan: details.securityDetails?.panNumber || null,
          panDoc: details.docType?.find(d => d.doctypeName === 'PAN CARD') || null,
          registrationCertificate: details.docType?.find(d => d.doctypeName === 'REGISTRATION') || null,
          practiceCertificate: details.docType?.find(d => d.doctypeName === 'PRACTICE') || null,
          electricityBill: details.docType?.find(d => d.doctypeName === 'ELECTRICITY BILL') || null,
          image: details.docType?.find(d => d.doctypeName === 'IMAGE') || null,
          allDocuments: details.docType || []
        };
        setCustomerDocuments(docs);
        setShowDocumentsModal(true);
      }
    } catch (error) {
      console.error('Error fetching customer documents:', error);
      Alert.alert('Error', 'Failed to load customer documents');
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Preview document
  const previewDocument = async (doc) => {
    if (!doc || !doc.s3Path) {
      Alert.alert('Info', 'Document not available');
      return;
    }
    
    setSelectedDocumentForPreview(doc);
    setPreviewModalVisible(true);
    setPreviewLoading(true);
    
    try {
      const response = await customerAPI.getDocumentSignedUrl(doc.s3Path);
      if (response?.data?.signedUrl) {
        setPreviewSignedUrl(response.data.signedUrl);
      }
    } catch (error) {
      console.error('Error fetching document URL:', error);
      Alert.alert('Error', 'Failed to load document');
    } finally {
      setPreviewLoading(false);
    }
  };

  // Download document
  const downloadDocument = async (doc) => {
    if (!doc || !doc.s3Path) {
      Alert.alert('Info', 'Document not available for download');
      return;
    }
    
    try {
      const response = await customerAPI.getDocumentSignedUrl(doc.s3Path);
      if (response?.data?.signedUrl) {
        await Linking.openURL(response.data.signedUrl);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      Alert.alert('Error', 'Failed to download document');
    }
  };

  // Handle approve customer
  const handleApprovePress = (customer) => {
    setSelectedCustomerForAction(customer);
    setApproveModalVisible(true);
  };

  const handleApproveConfirm = async (comment) => {
    console.log(selectedCustomerForAction, 'selectedCustomerForAction')
    try {
      const workflowId = selectedCustomerForAction?.workflowId || selectedCustomerForAction?.stgCustomerId;
      const instanceId = selectedCustomerForAction?.instaceId || selectedCustomerForAction?.instaceId;
      const actorId = loggedInUser?.userId || loggedInUser?.id;
      const parellGroupId = selectedCustomerForAction?.instance?.stepInstances[0]?.parallelGroup
      const stepOrderId = selectedCustomerForAction?.instance?.stepInstances[0]?.stepOrder
      
      const actionDataPyaload = {
        stepOrder: stepOrderId,
        parallelGroup: parellGroupId,
        actorId: actorId,
        action: "APPROVE",
        comments: comment || "Approved",
        instanceId: instanceId,
        actionData: {
          field: "status",
          newValue: "Approved"
        },
        dataChanges: {
          previousStatus: "Pending",
          newStatus: "Approved"
        }
      };

      const response = await customerAPI.workflowAction(instanceId, actionDataPyaload);
      
      setApproveModalVisible(false);
      showToast(`Customer ${selectedCustomerForAction?.customerName} approved successfully!`, 'success');
      setSelectedCustomerForAction(null);
      
      // Refresh the customer list after approval
      const isStaging = activeTab === 'notOnboarded' || activeTab === 'waitingForApproval';
      dispatch(fetchCustomersList({
        page: 1,
        limit: pagination.limit,
        searchText: filters.searchText,
        isStaging: isStaging,
        ...(isStaging && { statusIds: [5] }) // Send statusIds: [5] only for staging requests
      }));
    } catch (error) {
      console.error('Error approving customer:', error);
      setApproveModalVisible(false);
      showToast(`Failed to approve customer: ${error.message}`, 'error');
      setSelectedCustomerForAction(null);
    }
  };

  // Handle reject customer
  const handleRejectPress = (customer) => {
    setSelectedCustomerForAction(customer);
    setRejectModalVisible(true);
  };

  const handleRejectConfirm = async (comment) => {

    console.log(selectedCustomerForAction?.instaceId, 'selectedCustomerForAction?.instaceId')

    try {
      const workflowId = selectedCustomerForAction?.workflowId || selectedCustomerForAction?.stgCustomerId;
      const instanceId = selectedCustomerForAction?.instaceId || selectedCustomerForAction?.stgCustomerId;
      const actorId = loggedInUser?.userId || loggedInUser?.id;
      const parellGroupId = selectedCustomerForAction?.instance?.stepInstances[0]?.parallelGroup
      const stepOrderId = selectedCustomerForAction?.instance?.stepInstances[0]?.stepOrder
      
      const actionDataPyaload = {
        stepOrder: stepOrderId,
        parallelGroup: parellGroupId,
        actorId: actorId,
        action: "REJECT",
        comments: comment || "Rejected",
        instanceId: instanceId,
        actionData: {
          field: "status",
          newValue: "Rejected"
        },
        dataChanges: {
          previousStatus: "Pending",
          newStatus: "Rejected"
        }
      };

      const response = await customerAPI.workflowAction(instanceId, actionDataPyaload);
      
      setRejectModalVisible(false);
      showToast(`Customer ${selectedCustomerForAction?.customerName} rejected!`, 'error');
      setSelectedCustomerForAction(null);
      
      // Refresh the customer list after rejection
      const isStaging = activeTab === 'notOnboarded' || activeTab === 'waitingForApproval';
      dispatch(fetchCustomersList({
        page: 1,
        limit: pagination.limit,
        searchText: filters.searchText,
        isStaging: isStaging,
        ...(isStaging && { statusIds: [5] }) // Send statusIds: [5] only for staging requests
      }));
    } catch (error) {
      console.error('Error rejecting customer:', error);
      setRejectModalVisible(false);
      showToast(`Failed to reject customer: ${error.message}`, 'error');
      setSelectedCustomerForAction(null);
    }
  };

  // Handle block customer
  const handleBlockCustomer = async (customer) => {
    try {
      setBlockUnblockLoading(true);
      const customerId = customer?.stgCustomerId || customer?.customerId;
      const distributorId = loggedInUser?.distributorId || 1;
      
      const response = await customerAPI.blockUnblockCustomer(
        [customerId],
        distributorId,
        false // isActive = false for blocking
      );
      
      showToast(`Customer ${customer?.customerName} blocked successfully!`, 'success');
      
      // Refresh the customer list
      const isStaging = activeTab === 'notOnboarded' || activeTab === 'waitingForApproval';
      dispatch(fetchCustomersList({
        page: 1,
        limit: pagination.limit,
        searchText: filters.searchText,
        isStaging: isStaging,
        ...(isStaging && { statusIds: [5] }) // Send statusIds: [5] only for staging requests
      }));
    } catch (error) {
      console.error('Error blocking customer:', error);
      showToast(`Failed to block customer: ${error.message}`, 'error');
    } finally {
      setBlockUnblockLoading(false);
    }
  };

  // Handle unblock customer
  const handleUnblockCustomer = async (customer) => {
    console.log(loggedInUser)
    try {
      setBlockUnblockLoading(true);
      const customerId = customer?.stgCustomerId || customer?.customerId;
      const distributorId = loggedInUser?.distributorId || 1;
      
      const response = await customerAPI.blockUnblockCustomer(
        [customerId],
        distributorId,
        true // isActive = true for unblocking
      );
      
      showToast(`Customer ${customer?.customerName} unblocked successfully!`, 'success');
      
      // Refresh the customer list
      const isStaging = activeTab === 'notOnboarded' || activeTab === 'waitingForApproval';
      dispatch(fetchCustomersList({
        page: 1,
        limit: pagination.limit,
        searchText: filters.searchText,
        isStaging: isStaging,
        ...(isStaging && { statusIds: [5] }) // Send statusIds: [5] only for staging requests
      }));
    } catch (error) {
      console.error('Error unblocking customer:', error);
      showToast(`Failed to unblock customer: ${error.message}`, 'error');
    } finally {
      setBlockUnblockLoading(false);
    }
  };

  const keyExtractor = (item) => {
    const id = item.stgCustomerId || item.customerId;
    return id ? id.toString() : "";
  };

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
    const isStaging = activeTab === 'notOnboarded' || activeTab === 'waitingForApproval';
    dispatch(fetchCustomersList({
      page: 1,
      limit: 10,
      ...filterParams,
      isStaging: isStaging,
      ...(isStaging && { statusIds: [5] }) // Send statusIds: [5] only for staging requests
    }));
    
    setFilterModalVisible(false);
  };

  // Add onRetry function
  const onRetry = () => {
    dispatch(resetCustomersList());
    const isStaging = activeTab === 'notOnboarded' || activeTab === 'waitingForApproval';
    dispatch(fetchCustomersList({
      page: 1,
      limit: 10,
      ...filters,
      isLoadMore: false,
      isStaging: isStaging,
      ...(isStaging && { statusIds: [5] }) // Send statusIds: [5] only for staging requests
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
              <AppText style={styles.documentModalTitle}>Click to download documents</AppText>
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
                    <AppText style={styles.topDocumentName}>GST</AppText>
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
                    <AppText style={styles.topDocumentName}>PAN</AppText>
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
                      <AppText style={styles.documentName}>{doc.name}</AppText>
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
            <AppText style={styles.customerName}>{item.customerName} <ChevronRight height={11} color={colors.primary} /></AppText>
            <View style={styles.actionsContainer}>
              {item.statusName === 'NOT-ONBOARDED' && (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => {
                    const customerId = item.customerId || item.stgCustomerId;
                    const isStaging = activeTab === 'notOnboarded' || activeTab === 'waitingForApproval';
                    handleOnboardCustomer(
                      navigation,
                      customerId,
                      isStaging,
                      customerAPI,
                      (toastConfig) => Toast.show(toastConfig)
                    );
                  }}
                >
                  <Edit color="#666" />
                </TouchableOpacity>
              )}

              {item.statusName === 'APPROVED' && (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => {
                    const customerId = item.customerId || item.stgCustomerId;
                    const isStaging = false; // APPROVED items are not staging
                    handleOnboardCustomer(
                      navigation,
                      customerId,
                      isStaging,
                      customerAPI,
                      (toastConfig) => Toast.show(toastConfig)
                    );
                  }}
                >
                  <Edit color="#666" />
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => fetchCustomerDocuments(item)}
              >
                <Download color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.customerInfo}>
           <View style={styles.infoRow}>
              <AddrLine color="#999" />
              <AppText style={styles.infoText}>{item.customerCode}</AppText>
              <AppText style={styles.divider}>|</AppText>
              <AppText style={styles.infoText}>{item.cityName}</AppText>
              <AppText style={styles.divider}>|</AppText>
              <AppText style={styles.infoText}>{item.groupName}</AppText>
              <AppText style={styles.divider}>|</AppText>
              <AppText
                style={[styles.infoText, { flex: 1, maxWidth: 80 }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.customerType}
              </AppText>

              {item.customerType === 'Hospital' && (
                <AlertFilled color="#999" style={styles.infoIcon} />
              )}
            </View>
            <View style={styles.contactRow}>
              <Phone color="#999" />
              <AppText style={{...styles.contactText, marginRight: 15}}>{item.mobile}</AppText>
              <Email color="#999" style={styles.mailIcon} />
              <AppText style={styles.contactText}   ellipsizeMode="tail" numberOfLines={1}  >{item.email}</AppText>
            </View>
          </View>

          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.statusName) }]}>
              <AppText style={[styles.statusText, { color: getStatusTextColor(item.statusName) }]}>
                {item.statusName}
              </AppText>
            </View>
            {item.statusName === 'LOCKED' ? (
            <TouchableOpacity 
              style={styles.unlockButton}
              onPress={() => handleUnblockCustomer(item)}
              disabled={blockUnblockLoading}
            >
              <UnLocked fill="#EF4444" />
              <AppText style={styles.unlockButtonText}>Unblock</AppText>
            </TouchableOpacity>
          ) : (item.statusName === 'ACTIVE' || item.statusName === 'UN-VERIFIED') ? (
            <TouchableOpacity 
              style={styles.blockButton}
              onPress={() => handleUnblockCustomer(item)}
              disabled={blockUnblockLoading}
            >
              <Locked fill="#666" />
              <AppText style={styles.blockButtonText}>Block</AppText>
            </TouchableOpacity>
          ) :  item.statusName === 'PENDING' && item.action == 'APPROVE' ? (
            <View style={styles.pendingActions}>
              <TouchableOpacity 
                style={styles.approveButton}
                onPress={() => handleApprovePress(item)}
              >
                <AppText style={styles.approveButtonText}>Approve</AppText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.rejectButton}
                onPress={() => handleRejectPress(item)}
              >
                <CloseCircle />
              </TouchableOpacity>
            </View>
          ) : item.statusName === 'NOT-ONBOARDED' ? (
            <TouchableOpacity 
              style={styles.onboardButton}
              onPress={() => {
                const customerId = item.customerId || item.stgCustomerId;
                const isStaging = activeTab === 'notOnboarded' || activeTab === 'waitingForApproval';
                handleOnboardCustomer(
                  navigation,
                  customerId,
                  isStaging,
                  customerAPI,
                  (toastConfig) => Toast.show(toastConfig)
                );
              }}>
              <AppText style={styles.onboardButtonText}>Onboard</AppText>
            </TouchableOpacity>
          ) : null}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Documents Modal - Shows all documents for a customer
  const DocumentsModal = () => (
    <Modal
      visible={showDocumentsModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowDocumentsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.documentsModalContent}>
          {/* Header */}
          <View style={styles.documentsModalHeader}>
            <AppText style={styles.documentsModalTitle}>All Documents</AppText>
            <TouchableOpacity onPress={() => setShowDocumentsModal(false)}>
              <CloseCircle />
            </TouchableOpacity>
          </View>

          {loadingDocuments ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <AppText style={styles.loadingText}>Loading documents...</AppText>
            </View>
          ) : customerDocuments && customerDocuments.allDocuments && customerDocuments.allDocuments.length > 0 ? (
            <ScrollView style={styles.documentsListContainer} showsVerticalScrollIndicator={false}>
              {/* Top Row: GST and PAN side by side */}
              <View style={styles.documentsTopRow}>
                {customerDocuments.gstDoc && (
                  <View style={styles.documentCardSmall}>
                    <View style={styles.documentCardContentSmall}>
                      <View style={styles.documentCardLeftSmall}>
                        <Icon name="document-outline" size={20} color={colors.primary} />
                        <View style={styles.documentInfoSmall}>
                          <AppText style={styles.documentFileNameSmall} numberOfLines={1}>
                            {customerDocuments.gstDoc.fileName || 'GST'}
                          </AppText>
                          <AppText style={styles.documentTypeSmall}>{customerDocuments.gstDoc.doctypeName}</AppText>
                        </View>
                      </View>
                      <View style={styles.documentActionsSmall}>
                        <TouchableOpacity 
                          style={styles.documentActionButtonSmall}
                          onPress={() => previewDocument(customerDocuments.gstDoc)}
                        >
                          <EyeOpen width={16} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.documentActionButtonSmall}
                          onPress={() => downloadDocument(customerDocuments.gstDoc)}
                        >
                          <Download width={16} color={colors.primary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
                {customerDocuments.panDoc && (
                  <View style={styles.documentCardSmall}>
                    <View style={styles.documentCardContentSmall}>
                      <View style={styles.documentCardLeftSmall}>
                        <Icon name="document-outline" size={20} color={colors.primary} />
                        <View style={styles.documentInfoSmall}>
                          <AppText style={styles.documentFileNameSmall} numberOfLines={1}>
                            {customerDocuments.panDoc.fileName || 'PAN'}
                          </AppText>
                          <AppText style={styles.documentTypeSmall}>{customerDocuments.panDoc.doctypeName}</AppText>
                        </View>
                      </View>
                      <View style={styles.documentActionsSmall}>
                        <TouchableOpacity 
                          style={styles.documentActionButtonSmall}
                          onPress={() => previewDocument(customerDocuments.panDoc)}
                        >
                          <EyeOpen width={16} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.documentActionButtonSmall}
                          onPress={() => downloadDocument(customerDocuments.panDoc)}
                        >
                          <Download width={16} color={colors.primary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
              </View>

              {/* Other Documents Below */}
              {customerDocuments.allDocuments
                .filter(doc => doc.doctypeName !== 'GSTIN' && doc.doctypeName !== 'PAN CARD')
                .map((doc, index) => (
                  <View key={index} style={styles.documentCard}>
                    <View style={styles.documentCardContent}>
                      <View style={styles.documentCardLeft}>
                        <Icon name="document-outline" size={24} color={colors.primary} />
                        <View style={styles.documentInfo}>
                          <AppText style={styles.documentFileName} numberOfLines={1}>
                            {doc.fileName || doc.doctypeName}
                          </AppText>
                          <AppText style={styles.documentType}>{doc.doctypeName}</AppText>
                        </View>
                      </View>
                      <View style={styles.documentActions}>
                        <TouchableOpacity 
                          style={styles.documentActionButton}
                          onPress={() => previewDocument(doc)}
                        >
                          <EyeOpen width={18} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.documentActionButton}
                          onPress={() => downloadDocument(doc)}
                        >
                          <Download width={18} color={colors.primary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
            </ScrollView>
          ) : (
            <View style={styles.noDocumentsContainer}>
              <Icon name="document-outline" size={48} color="#ccc" />
              <AppText style={styles.noDocumentsText}>No documents available</AppText>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  // Document Preview Modal
  const DocumentPreviewModal = () => (
    <Modal
      visible={previewModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setPreviewModalVisible(false)}
    >
      <View style={styles.previewModalOverlay}>
        <View style={styles.previewModalContent}>
          <View style={styles.previewModalHeader}>
            <AppText style={styles.previewModalTitle} numberOfLines={1}>
              {selectedDocumentForPreview?.fileName || selectedDocumentForPreview?.doctypeName}
            </AppText>
            <TouchableOpacity onPress={() => setPreviewModalVisible(false)}>
              <CloseCircle />
            </TouchableOpacity>
          </View>

          <View style={styles.previewContainer}>
            {previewLoading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : previewSignedUrl && (selectedDocumentForPreview?.fileName?.toLowerCase().endsWith('.jpg') || 
                                     selectedDocumentForPreview?.fileName?.toLowerCase().endsWith('.jpeg') || 
                                     selectedDocumentForPreview?.fileName?.toLowerCase().endsWith('.png')) ? (
              <Image 
                source={{ uri: previewSignedUrl }} 
                style={styles.previewImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.documentPreviewPlaceholder}>
                <Icon name="document-text-outline" size={64} color="#999" />
                <AppText style={styles.documentPreviewText}>{selectedDocumentForPreview?.fileName}</AppText>
              </View>
            )}
          </View>

          <TouchableOpacity 
            style={styles.downloadButtonInPreview}
            onPress={() => downloadDocument(selectedDocumentForPreview)}
          >
            <Download width={20} color="#fff" />
            <AppText style={styles.downloadButtonText}>Download</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

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
            <AppText style={styles.modalTitle}>Click to download documents</AppText>
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
                <AppText style={styles.documentText}>{doc.name}</AppText>
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
        <AppText style={styles.headerTitle}>Customers</AppText>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('RegistrationType')}>
            <AppText style={styles.createButtonText}>CREATE</AppText>
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
      <ScrollView 
        ref={tabScrollRef}
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.tabContainer}
        scrollEventThrottle={16}
      >
        <TouchableOpacity
          ref={(ref) => tabRefs.current['all'] = ref}
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => handleTabPress('all')}
        >
          <AppText style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All ({tabCounts.all})
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          ref={(ref) => tabRefs.current['waitingForApproval'] = ref}
          style={[styles.tab, activeTab === 'waitingForApproval' && styles.activeTab]}
          onPress={() => handleTabPress('waitingForApproval')}
        >
          <AppText style={[styles.tabText, activeTab === 'waitingForApproval' && styles.activeTabText]}>
            Waiting for Approval ({tabCounts.waitingForApproval})
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          ref={(ref) => tabRefs.current['notOnboarded'] = ref}
          style={[styles.tab, activeTab === 'notOnboarded' && styles.activeTab]}
          onPress={() => handleTabPress('notOnboarded')}
        >
          <AppText style={[styles.tabText, activeTab === 'notOnboarded' && styles.activeTabText]}>
            Not Onboarded ({tabCounts.notOnboarded})
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          ref={(ref) => tabRefs.current['unverified'] = ref}
          style={[styles.tab, activeTab === 'unverified' && styles.activeTab]}
          onPress={() => handleTabPress('unverified')}
        >
          <AppText style={[styles.tabText, activeTab === 'unverified' && styles.activeTabText]}>
            Unverified ({tabCounts.unverified})
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          ref={(ref) => tabRefs.current['rejected'] = ref}
          style={[styles.tab, activeTab === 'rejected' && styles.activeTab]}
          onPress={() => handleTabPress('rejected')}
        >
          <AppText style={[styles.tabText, activeTab === 'rejected' && styles.activeTabText]}>
            Rejected ({tabCounts.rejected})
          </AppText>
        </TouchableOpacity>
      </ScrollView>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search color="#999" />
          <AppInput
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
        <SkeletonList items={5} />
      ) :listError && customers.length === 0 ? (
        <View style={styles.errorContainer}>
          <AlertCircle size={60} color="#EF4444" />
          <AppText style={styles.errorTitle}>Unable to Load Customers</AppText>
          <AppText style={styles.errorMessage}>
            {listError === 'Network request failed' || listError.includes('Network') 
              ? 'Server is currently unavailable. Please check your connection and try again.'
              : listError || 'Something went wrong. Please try again.'}
          </AppText>
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Refresh size={20} color="#fff" />
            <AppText style={styles.retryButtonText}>Retry</AppText>
          </TouchableOpacity>
        </View>
      ) : customers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <People size={60} color="#9CA3AF" />
          <AppText style={styles.emptyTitle}>No Customers Found</AppText>
          <AppText style={styles.emptyMessage}>
            {searchText ? `No customers match "${searchText}"` : 'Start by adding your first customer'}
          </AppText>
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
              <AppText style={styles.emptyTitle}>No Customers Found</AppText>
              <AppText style={styles.emptyMessage}>
                {searchText 
                  ? `No results for "${searchText}"`
                  : 'Start by adding your first customer'}
              </AppText>
            </View>
          )
        }                
      />

      )}
        </Animated.View>

        <DownloadModal />
        <DocumentsModal />
        <DocumentPreviewModal />

        <FilterModal 
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          onApply={handleApplyFilters}
        />

        <ApproveCustomerModal
          visible={approveModalVisible}
          onClose={() => {
            setApproveModalVisible(false);
            setSelectedCustomerForAction(null);
          }}
          onConfirm={handleApproveConfirm}
          customerName={selectedCustomerForAction?.customerName}
        />

        <RejectCustomerModal
          visible={rejectModalVisible}
          onClose={() => {
            setRejectModalVisible(false);
            setSelectedCustomerForAction(null);
          }}
          onConfirm={handleRejectConfirm}
          customerName={selectedCustomerForAction?.customerName}
        />

        {/* Toast Notification */}
        {toastVisible && (
          <View style={styles.toastContainer}>
            <View style={[
              styles.toast,
              toastType === 'success' ? styles.toastSuccess : styles.toastError
            ]}>
              <AppText style={styles.toastText}>{toastMessage}</AppText>
            </View>
          </View>
        )}

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
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    maxHeight: 55,
    flexGrow: 0,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginRight: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 8,
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
    marginTop: 2,
  },
  customerInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flex: 1,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
    flexShrink: 1,
  },
  divider: {
    color: '#999',
    marginHorizontal: 4,
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
  // Toast styles
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 200,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toastSuccess: {
    backgroundColor: '#10B981',
  },
  toastError: {
    backgroundColor: '#EF4444',
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Documents Modal Styles
  documentsModalContent: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  documentsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  documentsModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  documentsListContainer: {
    flex: 1,
    marginVertical: 12,
  },
  documentsTopRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  documentCardSmall: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  documentCardContentSmall: {
    flexDirection: 'column',
    padding: 10,
  },
  documentCardLeftSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  documentInfoSmall: {
    marginLeft: 8,
    flex: 1,
  },
  documentFileNameSmall: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  documentTypeSmall: {
    fontSize: 11,
    color: '#999',
  },
  documentActionsSmall: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'flex-end',
  },
  documentActionButtonSmall: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    overflow: 'hidden',
  },
  documentCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  documentCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  documentInfo: {
    marginLeft: 12,
    flex: 1,
  },
  documentFileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  documentType: {
    fontSize: 12,
    color: '#999',
  },
  documentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  documentActionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  noDocumentsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDocumentsText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  previewModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewModalContent: {
    width: width * 0.95,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  previewModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  previewModalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  previewContainer: {
    height: 300,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  documentPreviewPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentPreviewText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  downloadButtonInPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    margin: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default CustomerList;