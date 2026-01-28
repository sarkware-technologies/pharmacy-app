/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-dupe-keys */
import React, { useState, useRef, useEffect, useCallback } from 'react';

import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
  PanResponder,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { WebView } from 'react-native-webview';
import { colors } from '../../../styles/colors';
import { useFocusEffect, useRoute, useNavigation, DrawerActions } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Menu from '../../../components/icons/Menu';
import Phone from '../../../components/icons/Phone';
import Edit from '../../../components/icons/Edit';
import Download from '../../../components/icons/Download';
import Filter from '../../../components/icons/Filter';
import Calendar from '../../../components/icons/Calendar';
import AddrLine from '../../../components/icons/AddrLine';
import Email from '../../../components/icons/Email';
import Search from '../../../components/icons/Search';
import DateTimePicker from '@react-native-community/datetimepicker';
import Locked from '../../../components/icons/Locked';
import UnLocked from '../../../components/icons/UnLocked';
import AlertFilled from '../../../components/icons/AlertFilled';
import Bell from '../../../components/icons/Bell';
import FilterModal from '../../../components/FilterModal';
import CloseCircle from '../../../components/icons/CloseCircle';
import EyeOpen from '../../../components/icons/EyeOpen';
import People from '../../../components/icons/People';
import Refresh from '../../../components/icons/Refresh';
import AlertCircle from '../../../components/icons/AlertCircle';
import RejectCustomerModal from '../../../components/modals/RejectCustomerModal';
import ApproveCustomerModal from '../../../components/modals/ApproveCustomerModal';
import { showLoader, hideLoader } from '../../../components/ScreenLoader';

import WorkflowTimelineModal from '../../../components/modals/WorkflowTimelineModal';
import { customerAPI } from '../../../api/customer';
import { SkeletonList } from '../../../components/SkeletonLoader';
import { AppText } from "../../../components"
import Toast from 'react-native-toast-message';
import { checkStoragePermission, requestStoragePermission } from '../../../utils/permissions';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { handleOnboardCustomer } from '../../../utils/customerNavigationHelper';
import PermissionWrapper from "../../../utils/RBAC/permissionWrapper"
import PERMISSIONS from "../../../utils/RBAC/permissionENUM"
import checkPermission from "../../../utils/RBAC/permissionHelper"
import { AppToastService } from '../../../components/AppToast';
import LinkIcon from '../../../components/icons/LinkIcon'

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
  clearShouldResetToAllTab, // Import clear flag action
} from '../../../redux/slices/customerSlice';
import ChevronRight from '../../../components/icons/ChevronRight';
import CommonTooltip from '../../../components/view/Tooltip';
import { logger } from 'react-native-reanimated/lib/typescript/common';

const CustomerList = ({ navigation: navigationProp }) => {
  const navigationHook = useNavigation();
  const navigation = navigationProp || navigationHook;
  const route = useRoute();
  const insets = useSafeAreaInsets();
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
  const shouldResetToAllTab = useSelector(state => state.customer.shouldResetToAllTab); // Get reset flag

  // Fetch customer groups for mapping names to IDs
  const [customerGroups, setCustomerGroups] = useState([]);

  useEffect(() => {
    const loadCustomerGroups = async () => {
      try {
        const response = await customerAPI.getCustomerGroups();
          if (response.success && response.data) {
          setCustomerGroups(response.data || []);
        }
      } catch (error) {
        console.error('Error loading customer groups:', error);
      }
    };
    loadCustomerGroups();
  }, []);

  console.log(loggedInUser);
  

  

  

  const [activeTab, setActiveTab] = useState(loggedInUser?.subRoleName == 'MR' ? 'all':"waitingForApproval");
  const [activeFilterButton, setActiveFilterButton] = useState('newCustomer');
  const [searchText, setSearchText] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [datePickerModalVisible, setDatePickerModalVisible] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const [isHardRefreshing, setIsHardRefreshing] = useState(false);

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
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [latestDraftData, setLatestDraftData] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedCustomerForAction, setSelectedCustomerForAction] = useState(null);
  const [workflowTimelineVisible, setWorkflowTimelineVisible] = useState(false);
  const [selectedCustomerForWorkflow, setSelectedCustomerForWorkflow] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const toastTimeoutRef = useRef(null);

  // Documents modal state
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [customerDocuments, setCustomerDocuments] = useState(null);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [selectedDocumentForPreview, setSelectedDocumentForPreview] = useState(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [isFullScreenPreview, setIsFullScreenPreview] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewSignedUrl, setPreviewSignedUrl] = useState(null);
  const [isPreviewing, setIsPreviewing] = useState(false);

  // State to show preview inside DocumentsModal
  const [showPreviewInDocumentsModal, setShowPreviewInDocumentsModal] = useState(false);

  // Refs to prevent duplicate API calls
  const isFetchingPreviewRef = useRef(false);
  const lastFetchedPreviewPathRef = useRef(null);

  // Block/Unblock state
  const [blockUnblockLoading, setBlockUnblockLoading] = useState(false);

  // Tab permission states
  const [hasAllTabPermission, setHasAllTabPermission] = useState(true);
  const [hasUnverifiedTabPermission, setHasUnverifiedTabPermission] = useState(true);
  const [hasNotOnboardedTabPermission, setHasNotOnboardedTabPermission] = useState(true);
  const [hasWaitingForApprovalTabPermission, setHasWaitingForApprovalTabPermission] = useState(true);
  const [hasRejectedTabPermission, setHasRejectedTabPermission] = useState(true);
  const [hasDoctorSupplyTabPermission, setHasDoctorSupplyTabPermission] = useState(true);
  const [hasDraftTabPermission, setHasDraftTabPermission] = useState(true);
  const [hasLinkDTAccess, setHasLinkDTAccess] = useState(true);
  const [unverifiedEdit, setUnverifiedEdit] = useState(true);




  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Tab scroll ref for centering active tab
  const tabScrollRef = useRef(null);
  const tabRefs = useRef({});
  const isHardRefreshRef = useRef(false); // Track if we're doing a hard refresh
  const currentTabForDataRef = useRef(activeTab); // Track which tab's data is currently displayed
  const wasFocusedRef = useRef(false); // Track if screen was previously focused (to detect return from CustomerDetail)

  // Filter buttons scroll ref for "waiting for approval" tab
  const filterButtonsScrollRef = useRef(null);
  const filterButtonRefs = useRef({});

  // No client-side filtering - API handles filtering based on statusIds
  // Don't show customers if:
  // 1. We're hard refreshing (prevents showing stale search results)
  // 2. The displayed data doesn't match the current active tab (prevents showing wrong tab's data)
  const filteredCustomers = (isHardRefreshing || currentTabForDataRef.current !== activeTab) ? [] : customers;

  // Map tab to statusIds
  const getStatusIdsForTab = (tab) => {
    const statusMap = {
      'all': [0],
      'waitingForApproval': [5],
      'notOnboarded': [18],
      'unverified': [19],
      'rejected': [6],
      'doctorSupply': [7],
      'draft': [4]
    };
    return statusMap[tab] || [0];
  };


  const editPermissionTabBased = {
    all: [PERMISSIONS.ONBOARDING_LISTING_PAGE_ALL_EDIT, PERMISSIONS.ONBOARDING_WORKFLOW_EDIT],
    waitingForApproval: [
      PERMISSIONS.ONBOARDING_LISTING_PAGE_WAITING_FOR_APPROVAL_EDIT,
      PERMISSIONS.ONBOARDING_LISTING_PAGE_WAITING_FOR_APPROVAL_REASSIGNED_EDIT,
      PERMISSIONS.ONBOARDING_WORKFLOW_EDIT,
    ],
    notOnboarded: [],
    unverified: [PERMISSIONS.ONBOARDING_LISTING_PAGE_UNVERIFIED_EDIT],
    rejected: [PERMISSIONS.ONBOARDING_LISTING_PAGE_REJECTED_EDIT],
    doctorSupply: [],
    draft: [PERMISSIONS.ONBOARDING_LISTING_PAGE_DRAFT_EDIT_DELETE],
  };
  // Map filter button to filter value for API
  const getFilterValue = (filterButton) => {
    const filterMap = {
      'newCustomer': 'NEW',
      'customerGroupChange': 'GROUP_CHANGED',
      'editCustomer': 'EDITED',
      'existingCustomer': 'EXISTING'
    };
    return filterMap[filterButton] || null;
  };



  // Format dates to ISO string for API - ensures time is always 00:00:00Z
  const formatDateForAPI = (date) => {
    if (!date) return null;
    const d = new Date(date);
    // Use UTC methods to ensure time is always 00:00:00Z regardless of timezone
    // This ensures the date is formatted as YYYY-MM-DDTHH:MM:SSZ with 00:00:00Z
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}T00:00:00Z`;
  };

  // Check tab permissions on mount
  useEffect(() => {
    const checkTabPermissions = async () => {
      const [
        allPermission,
        unverifiedPermission,
        notOnboardedPermission,
        waitingForApprovalPermission,
        rejectedPermission,
        doctorSupplyPermission,
        draftPermission,
        hasLinkDTAccess,
        unverifiedEdit

      ] = await Promise.all([
        checkPermission(PERMISSIONS.ONBOARDING_LISTING_PAGE_ALL_PAGE_VIEW),
        checkPermission(PERMISSIONS.ONBOARDING_LISTING_PAGE_UNVERIFIED_PAGE_VIEW),
        checkPermission(PERMISSIONS.ONBOARDING_LISTING_PAGE_NOT_ONBOARDED_PAGE_VIEW),
        checkPermission(PERMISSIONS.ONBOARDING_LISTING_PAGE_WAITING_FOR_APPROVAL_PAGE_VIEW),
        checkPermission(PERMISSIONS.ONBOARDING_LISTING_PAGE_REJECTED_PAGE_VIEW),
        checkPermission(PERMISSIONS.ONBOARDING_LISTING_PAGE_DOCTOR_SUPPLY_PAGE_VIEW),
        checkPermission(PERMISSIONS.ONBOARDING_LISTING_PAGE_DRAFT_PAGE_VIEW),
        checkPermission(PERMISSIONS.ONBOARDING_LISTING_PAGE_ALL_LINK_DT),
        checkPermission(PERMISSIONS.ONBOARDING_LISTING_PAGE_UNVERIFIED_EDIT)
      ]);

      setHasAllTabPermission(allPermission);
      setHasUnverifiedTabPermission(unverifiedPermission);
      setHasNotOnboardedTabPermission(notOnboardedPermission);
      setHasWaitingForApprovalTabPermission(waitingForApprovalPermission);
      setHasRejectedTabPermission(rejectedPermission);
      setHasDoctorSupplyTabPermission(doctorSupplyPermission);
      setHasDraftTabPermission(draftPermission);
      setHasLinkDTAccess(hasLinkDTAccess)
      setUnverifiedEdit(unverifiedEdit)
    };

    checkTabPermissions();
  }, []);

  // Switch to first available tab if current tab doesn't have permission
  useEffect(() => {
    const getFirstAvailableTab = () => {
      if (hasAllTabPermission) return 'all';
      if (hasWaitingForApprovalTabPermission) return 'waitingForApproval';
      if (hasNotOnboardedTabPermission) return 'notOnboarded';
      if (hasUnverifiedTabPermission) return 'unverified';
      if (hasRejectedTabPermission) return 'rejected';
      if (hasDoctorSupplyTabPermission) return 'doctorSupply';
      if (hasDraftTabPermission) return 'draft';
      return 'all'; // fallback
    };

    const checkCurrentTabPermission = () => {
      switch (activeTab) {
        case 'all':
          return hasAllTabPermission;
        // case 'waitingForApproval':
        //   return hasWaitingForApprovalTabPermission;
        case 'notOnboarded':
          return hasNotOnboardedTabPermission;
        case 'unverified':
          return hasUnverifiedTabPermission;
        case 'rejected':
          return hasRejectedTabPermission;
        case 'doctorSupply':
          return hasDoctorSupplyTabPermission;
        case 'draft':
          return hasDraftTabPermission;
        default:
          return true;
      }
    };

    if (!checkCurrentTabPermission()) {
      const firstAvailableTab = getFirstAvailableTab();
      setActiveTab(firstAvailableTab);
    }
  }, [
    activeTab,
    hasAllTabPermission,
    hasUnverifiedTabPermission,
    hasNotOnboardedTabPermission,
    // hasWaitingForApprovalTabPermission,
    hasRejectedTabPermission,
    hasDoctorSupplyTabPermission,
    hasDraftTabPermission,
  ]);

  // Fetch tab counts on component mount
  useEffect(() => {
    dispatch(fetchTabCounts());
  }, [dispatch]);

  // Show toast when returning from send back action
  useEffect(() => {
    if (route?.params?.sendBackToast) {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Customer sent back successfully',
        position: 'top',
      });
      navigation.setParams({ sendBackToast: undefined });
    }
  }, [route?.params?.sendBackToast, navigation]);

  // Show toast when returning from CustomerDetail after approve/reject/verify
  useFocusEffect(
    React.useCallback(() => {
      const parentNav = navigation.getParent();
      if (!parentNav) return;

      try {
        const parentState = parentNav.getState();
        const currentRoute = parentState?.routes?.[parentState?.index];
        const pendingAction = currentRoute?.params?.pendingCustomerAction;

        if (!pendingAction) return;

        let message = '';
        let type = 'success';
        let label = "Approve"

        switch (pendingAction) {
          case 'APPROVE':
            message = 'Customer has been successfully approved!';
            type = 'success';
            label = 'Approve'
            break;
          case 'REJECT':
            message = 'Customer has been rejected!';
            type = 'error';
            label = 'Reject'
            break;
          case 'verify':
            message = 'Customer has been successfully verified!';
            type = 'success';
            label = 'Verify'
            break;
          case 'sendBack':
            message = 'Customer form has been sent back!';
            type = 'warning';
            label = 'Send Back'
            break;
          default:
            break;
        }

        if (message) {
          AppToastService.show(message, type, label);
          parentNav.setParams({ pendingCustomerAction: undefined });
        }
      } catch (error) {
        console.error('Error checking parent navigation params:', error);
      }
    }, [navigation])
  );




  // Fetch tab counts and refresh list whenever the customer tab becomes active (screen is focused)
  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchTabCounts());

      // Don't close documents modal on focus - let user control it explicitly

      // Refresh the customer list when screen comes into focus (after navigating back from CustomerDetail)
      // Only refresh if we were previously focused (to avoid refreshing on initial mount)
      if (wasFocusedRef.current) {
        // Refresh the customer list based on current active tab
        if (activeTab === 'all') {
          dispatch(fetchCustomersList({
            page: 1,
            limit: pagination.limit,
            searchText: filters.searchText,
            ...(fromDate && toDate ? {
              startDate: formatDateForAPI(fromDate),
              endDate: formatDateForAPI(toDate),
            } : {}),
            ...(filters.startDate && filters.endDate ? {
              startDate: filters.startDate,
              endDate: filters.endDate,
            } : {}),
            isStaging: false,
            isAll: true
          }));
        } else if (activeTab === 'waitingForApproval' || activeTab === 'rejected' || activeTab === 'draft') {
          const statusIds = getStatusIdsForTab(activeTab);
          const payload = {
            page: 1,
            limit: pagination.limit,
            searchText: filters.searchText,
            ...(fromDate && toDate ? {
              startDate: formatDateForAPI(fromDate),
              endDate: formatDateForAPI(toDate),
            } : {}),
            ...(filters.startDate && filters.endDate ? {
              startDate: filters.startDate,
              endDate: filters.endDate,
            } : {}),
            isStaging: true,
            statusIds: statusIds
          };
          // Add filter for waitingForApproval tab
          if (activeTab === 'waitingForApproval') {
            payload.filter = getFilterValue(activeFilterButton);
          }
          // Add filter for draft tab
          if (activeTab === 'draft') {
            payload.filter = 'NEW';
          }
          dispatch(fetchCustomersList(payload));
        } else if (activeTab === 'doctorSupply') {
          const statusIds = getStatusIdsForTab(activeTab);
          dispatch(fetchCustomersList({
            page: 1,
            limit: pagination.limit,
            searchText: filters.searchText,
            ...(fromDate && toDate ? {
              startDate: formatDateForAPI(fromDate),
              endDate: formatDateForAPI(toDate),
            } : {}),
            ...(filters.startDate && filters.endDate ? {
              startDate: filters.startDate,
              endDate: filters.endDate,
            } : {}),
            isStaging: false,
            statusIds: statusIds,
            customerGroupId: 1
          }));
        } else {
          const statusIds = getStatusIdsForTab(activeTab);
          dispatch(fetchCustomersList({
            page: 1,
            limit: pagination.limit,
            searchText: filters.searchText,
            ...(fromDate && toDate ? {
              startDate: formatDateForAPI(fromDate),
              endDate: formatDateForAPI(toDate),
            } : {}),
            ...(filters.startDate && filters.endDate ? {
              startDate: filters.startDate,
              endDate: filters.endDate,
            } : {}),
            isStaging: false,
            statusIds: statusIds
          }));
        }
      }

      // Mark that we've been focused
      wasFocusedRef.current = true;

      // Cleanup: reset on blur
      return () => {
        // Keep wasFocusedRef.current as true so next focus will trigger refresh
      };
    }, [dispatch, activeTab, pagination.limit, filters.searchText, activeFilterButton])
  );

  // Fetch customers on mount and when tab changes
  useEffect(() => {
    const initializeData = async () => {
      // Immediately clear customers list when tab changes (prevents showing wrong tab's data)
      dispatch(resetCustomersList());

      // Update ref to track that we're switching tabs (data doesn't match yet)
      currentTabForDataRef.current = null;

      // Get dates from state or filters (prefer filters as source of truth)
      const startDate = filters.startDate || (fromDate ? formatDateForAPI(fromDate) : null);
      const endDate = filters.endDate || (toDate ? formatDateForAPI(toDate) : null);

      // Fetch customers based on active tab with page: 1
      if (activeTab === 'all') {
        // All tab - regular endpoint, no statusIds
        const payload = {
          page: 1,
          limit: 10,
          isLoadMore: false,
          isStaging: false,
          typeCode: [],
          categoryCode: [],
          subCategoryCode: [],
          ...(startDate && endDate ? {
            startDate: startDate,
            endDate: endDate,
          } : {}),
          sortBy: '',
          sortDirection: 'ASC',
          isAll: true
        };
        dispatch(fetchCustomersList(payload));
      } else if (activeTab === 'waitingForApproval' || activeTab === 'rejected' || activeTab === 'draft') {
        // Waiting for Approval, Rejected, and Draft - staging endpoint
        const statusIds = getStatusIdsForTab(activeTab);
        const payload = {
          page: 1,
          limit: 10,
          isLoadMore: false,
          isStaging: true,
          typeCode: [],
          categoryCode: [],
          subCategoryCode: [],
          statusIds: statusIds,
          ...(startDate && endDate ? {
            startDate: startDate,
            endDate: endDate,
          } : {}),
          sortBy: '',
          sortDirection: 'ASC'
        };
        // Add filter for waitingForApproval tab
        if (activeTab === 'waitingForApproval') {
          payload.filter = getFilterValue(activeFilterButton);
        }
        // Add filter for draft tab
        if (activeTab === 'draft') {
          payload.filter = 'NEW';
        }
        dispatch(fetchCustomersList(payload));
      } else if (activeTab === 'doctorSupply') {
        // Doctor Supply - regular endpoint with statusIds and customerGroupId
        const statusIds = getStatusIdsForTab(activeTab);
        const payload = {
          page: 1,
          limit: 10,
          isLoadMore: false,
          isStaging: false,
          typeCode: [],
          categoryCode: [],
          subCategoryCode: [],
          statusIds: statusIds,
          ...(startDate && endDate ? {
            startDate: startDate,
            endDate: endDate,
          } : {}),
          sortBy: '',
          sortDirection: 'ASC',
          customerGroupId: 1
        };
        dispatch(fetchCustomersList(payload));
      } else {
        // Not Onboarded and Unverified - regular endpoint with statusIds
        const statusIds = getStatusIdsForTab(activeTab);
        const payload = {
          page: 1,
          limit: 10,
          isLoadMore: false,
          isStaging: false,
          typeCode: [],
          categoryCode: [],
          subCategoryCode: [],
          statusIds: statusIds,
          sortBy: '',
          sortDirection: 'ASC'
        };
        dispatch(fetchCustomersList(payload));
      }

      // Only fetch these on initial mount
      if (activeTab === 'all') {
        dispatch(fetchCustomerStatuses());
        dispatch(fetchCustomerTypes());
      }
    };

    // Only initialize if not hard refreshing (to prevent double fetch)
    if (!isHardRefreshRef.current) {
      initializeData();
    } else {
      // Reset the ref after skipping
      isHardRefreshRef.current = false;
    }
  }, [activeTab, activeFilterButton, dispatch]); // Trigger on tab change or filter button change

  // Update the ref when new data arrives for the current tab
  useEffect(() => {
    if (!listLoading && customers.length > 0) {
      // Data has loaded, update ref to match current tab
      currentTabForDataRef.current = activeTab;
    } else if (!listLoading && customers.length === 0) {
      // No data loaded, but loading is complete - still update ref to allow empty state
      currentTabForDataRef.current = activeTab;
    }
  }, [listLoading, customers.length, activeTab]);

  // Handle refresh when returning from search - Preserve current tab instead of resetting to "all"
  useFocusEffect(
    React.useCallback(() => {
      if (shouldResetToAllTab) {

        // Set hard refreshing flag to show loading and prevent stale data
        setIsHardRefreshing(true);
        isHardRefreshRef.current = true; // Set ref to prevent useEffect from running

        // Clear the flag first
        dispatch(clearShouldResetToAllTab());

        // Clear Redux customers list completely
        dispatch(resetCustomersList());

        // DON'T reset to "all" tab - keep the current activeTab
        // The activeTab is already set, so we just need to refresh its data
        currentTabForDataRef.current = null; // Clear ref to prevent showing stale data

        // Force fetch current tab's data immediately (hard refresh)
        // Use the same logic as the initial tab load
        if (activeTab === 'all') {
          const payload = {
            page: 1,
            limit: 10,
            isLoadMore: false,
            isStaging: false,
            typeCode: [],
            categoryCode: [],
            subCategoryCode: [],
            sortBy: '',
            sortDirection: 'ASC',
            isAll: true
          };
          dispatch(fetchCustomersList(payload));
        } else if (activeTab === 'waitingForApproval' || activeTab === 'rejected' || activeTab === 'draft') {
          const statusIds = getStatusIdsForTab(activeTab);
          const payload = {
            page: 1,
            limit: 10,
            isLoadMore: false,
            isStaging: true,
            statusIds: statusIds
          };
          if (activeTab === 'waitingForApproval') {
            payload.filter = getFilterValue(activeFilterButton);
          }
          if (activeTab === 'draft') {
            payload.filter = 'NEW';
          }
          dispatch(fetchCustomersList(payload));
        } else if (activeTab === 'doctorSupply') {
          const statusIds = getStatusIdsForTab(activeTab);
          const payload = {
            page: 1,
            limit: 10,
            isLoadMore: false,
            isStaging: false,
            statusIds: statusIds,
            customerGroupId: 1
          };
          dispatch(fetchCustomersList(payload));
        } else {
          const statusIds = getStatusIdsForTab(activeTab);
          const payload = {
            page: 1,
            limit: 10,
            isLoadMore: false,
            statusIds: statusIds
          };
          dispatch(fetchCustomersList(payload));
        }
      }
    }, [shouldResetToAllTab, activeTab, activeFilterButton, dispatch])
  );

  // Clear hard refreshing flag when loading completes
  useEffect(() => {
    if (isHardRefreshing && !listLoading) {
      setIsHardRefreshing(false);
    }
  }, [isHardRefreshing, listLoading]);





  // Handle search with debounce - now includes activeTab to search within current tab
  useEffect(() => {
    // Only perform search if searchText is not empty
    if (!searchText || searchText.trim() === '') {
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      dispatch(resetCustomersList());
      if (activeTab === 'all') {
        // All tab - regular endpoint, no staging
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
          isStaging: false,
          isAll: true
        }));
      } else if (activeTab === 'waitingForApproval' || activeTab === 'rejected' || activeTab === 'draft') {
        // Waiting for Approval, Rejected, and Draft - staging endpoint
        const statusIds = getStatusIdsForTab(activeTab);
        const payload = {
          page: 1,
          limit: 10,
          searchText: searchText,
          typeCode: selectedFilters.typeCode,
          categoryCode: selectedFilters.categoryCode,
          subCategoryCode: selectedFilters.subCategoryCode,
          statusId: selectedFilters.statusId,
          cityIds: selectedFilters.cityIds,
          isLoadMore: false,
          isStaging: true,
          statusIds: statusIds
        };
        // Add filter for waitingForApproval tab
        if (activeTab === 'waitingForApproval') {
          payload.filter = getFilterValue(activeFilterButton);
        }
        // Add filter for draft tab
        if (activeTab === 'draft') {
          payload.filter = 'NEW';
        }
        dispatch(fetchCustomersList(payload));
      } else if (activeTab === 'doctorSupply') {
        // Doctor Supply - regular endpoint with statusIds and customerGroupId
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
          isStaging: false,
          statusIds: statusIds,
          customerGroupId: 1
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, activeTab, dispatch]); // Now includes activeTab - search within current tab

  // Refresh function
  const onRefresh = async () => {
    setIsRefreshing(true);
    dispatch(resetCustomersList());
    if (activeTab === 'all') {
      // All tab - regular endpoint, no staging
      await dispatch(fetchCustomersList({
        page: 1,
        limit: 10,
        ...filters,
        ...(fromDate && toDate ? {
          startDate: formatDateForAPI(fromDate),
          endDate: formatDateForAPI(toDate),
        } : {}),
        isLoadMore: false,
        isStaging: false,
        isAll: true
      }));
    } else if (activeTab === 'waitingForApproval' || activeTab === 'rejected' || activeTab === 'draft') {
      // Waiting for Approval, Rejected, and Draft - staging endpoint
      const statusIds = getStatusIdsForTab(activeTab);
      const payload = {
        page: 1,
        limit: 10,
        ...filters,
        ...(fromDate && toDate ? {
          startDate: formatDateForAPI(fromDate),
          endDate: formatDateForAPI(toDate),
        } : {}),
        isLoadMore: false,
        isStaging: true,
        statusIds: statusIds
      };
      // Add filter for waitingForApproval tab
      if (activeTab === 'waitingForApproval') {
        payload.filter = getFilterValue(activeFilterButton);
      }
      // Add filter for draft tab
      if (activeTab === 'draft') {
        payload.filter = 'NEW';
      }
      await dispatch(fetchCustomersList(payload));
    } else if (activeTab === 'doctorSupply') {
      // Doctor Supply - regular endpoint with statusIds and customerGroupId
      const statusIds = getStatusIdsForTab(activeTab);
      const startDate = filters.startDate || (fromDate ? formatDateForAPI(fromDate) : null);
      const endDate = filters.endDate || (toDate ? formatDateForAPI(toDate) : null);
      await dispatch(fetchCustomersList({
        page: 1,
        limit: 10,
        ...filters,
        ...(startDate && endDate ? {
          startDate: startDate,
          endDate: endDate,
        } : {}),
        isLoadMore: false,
        isStaging: false,
        statusIds: statusIds,
        customerGroupId: 1
      }));
    } else {
      // Not Onboarded and Unverified - regular endpoint with statusIds
      const statusIds = getStatusIdsForTab(activeTab);
      const startDate = filters.startDate || (fromDate ? formatDateForAPI(fromDate) : null);
      const endDate = filters.endDate || (toDate ? formatDateForAPI(toDate) : null);
      await dispatch(fetchCustomersList({
        page: 1,
        limit: 10,
        ...filters,
        ...(startDate && endDate ? {
          startDate: startDate,
          endDate: endDate,
        } : {}),
        isLoadMore: false,
        isStaging: false,
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
    if (activeTab === 'all') {
      requestParams = {
        page: nextPage,
        limit: limit || 10,
        ...filters,
        isLoadMore: true,
        isStaging: false
      };
    } else if (activeTab === 'waitingForApproval' || activeTab === 'rejected' || activeTab === 'draft') {
      const statusIds = getStatusIdsForTab(activeTab);
      requestParams = {
        page: nextPage,
        limit: limit || 10,
        ...filters,
        isLoadMore: true,
        isStaging: true,
        statusIds: statusIds
      };
      // Add filter for waitingForApproval tab
      if (activeTab === 'waitingForApproval') {
        requestParams.filter = getFilterValue(activeFilterButton);
      }
      // Add filter for draft tab
      if (activeTab === 'draft') {
        requestParams.filter = 'NEW';
      }
    } else if (activeTab === 'doctorSupply') {
      const statusIds = getStatusIdsForTab(activeTab);
      requestParams = {
        page: nextPage,
        limit: limit || 10,
        ...filters,
        isLoadMore: true,
        isStaging: false,
        statusIds: statusIds,
        customerGroupId: 1
      };
    } else {
      const statusIds = getStatusIdsForTab(activeTab);
      requestParams = {
        page: nextPage,
        limit: limit || 10,
        ...filters,
        isLoadMore: true,
        isStaging: false,
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

  // Handle workflow timeline - just open modal with customer info
  // The modal will fetch the data internally
  const handleViewWorkflowTimeline = (stageId, customerName, customerType) => {
    setSelectedCustomerForWorkflow({
      stageId,
      customerName,
      customerType
    });
    setWorkflowTimelineVisible(true);
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
    // Clear any existing timeout
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    setToastMessage(message);
    setToastType(type);

    // Show toast after 500ms delay
    toastTimeoutRef.current = setTimeout(() => {
      setToastVisible(true);

      // Hide toast after 3 seconds
      setTimeout(() => {
        setToastVisible(false);
      }, 3000);
    }, 500);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // Handle tab press with centering
  const handleTabPress = async (tabName) => {
    // First reset the list and set active tab
    setActiveTab(tabName);
    tabName === "waitingForApproval" && setActiveFilterButton("newCustomer")

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


  const handleFilterButtonPress = (buttonName) => {
    // If same button is clicked again → deselect
    const isSameButton = activeFilterButton === buttonName;

    // Reset list always
    dispatch(resetCustomersList());

    // Toggle logic
    const newActiveButton = isSameButton ? null : buttonName;


    setActiveFilterButton(newActiveButton);

    // If deselected, no need to scroll
    // if (isSameButton) return;

    // Scroll selected button into view
    setTimeout(() => {
      if (
        filterButtonRefs.current[buttonName] &&
        filterButtonsScrollRef.current
      ) {
        filterButtonRefs.current[buttonName].measureLayout(
          filterButtonsScrollRef.current.getNode
            ? filterButtonsScrollRef.current.getNode()
            : filterButtonsScrollRef.current,
          (x, y, w) => {
            const screenWidth = Dimensions.get('window').width;
            const scrollX = x - screenWidth / 2 + w / 2;

            filterButtonsScrollRef.current.scrollTo({
              x: Math.max(0, scrollX),
              animated: true,
            });
          }
        );
      }
    }, 100);
  };

  // Fetch customer documents
  const fetchCustomerDocuments = async (customer) => {
    setLoadingDocuments(true);
    try {
      const customerId = customer?.customerId || customer?.stgCustomerId;
      const isStaging = customer?.customerId ? false : true;

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

  // Fetch signed URL when preview is shown (either in separate modal or inside documents modal)
  useEffect(() => {
    // Only fetch when preview is shown and we have a document
    if ((previewModalVisible || showPreviewInDocumentsModal) && selectedDocumentForPreview?.s3Path) {
      // Prevent duplicate calls - check if we're already fetching or if this is the same document
      if (!isFetchingPreviewRef.current && lastFetchedPreviewPathRef.current !== selectedDocumentForPreview.s3Path) {
        fetchPreviewSignedUrl();
      }
    } else if (!previewModalVisible && !showPreviewInDocumentsModal) {
      // Reset when preview closes
      setIsFullScreenPreview(false);
      setPreviewSignedUrl(null);
      lastFetchedPreviewPathRef.current = null;
      isFetchingPreviewRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewModalVisible, showPreviewInDocumentsModal, selectedDocumentForPreview?.s3Path]);

  const fetchPreviewSignedUrl = async () => {
    if (!selectedDocumentForPreview?.s3Path || isFetchingPreviewRef.current) return;

    // Mark as fetching and store the path
    isFetchingPreviewRef.current = true;
    lastFetchedPreviewPathRef.current = selectedDocumentForPreview.s3Path;

    setPreviewLoading(true);
    try {
      const response = await customerAPI.getDocumentSignedUrl(selectedDocumentForPreview.s3Path);
      if (response?.data?.signedUrl) {
        setPreviewSignedUrl(response.data.signedUrl);
      }
    } catch (error) {
      console.error('Error fetching document URL:', error);
      Alert.alert('Error', 'Failed to load document');
    } finally {
      setPreviewLoading(false);
      isFetchingPreviewRef.current = false;
    }
  };

  // Preview document - shows preview inside DocumentsModal if it's open, otherwise opens separate modal
  const previewDocument = (doc) => {
    // ⛔ Ignore if already fetching
    if (isFetchingPreviewRef.current) return;
    if (!doc || !doc.s3Path) {
      Alert.alert('Info', 'Document not available');
      return;
    }

    // Check if this is the same document already being previewed
    if (selectedDocumentForPreview?.s3Path === doc.s3Path && (previewModalVisible || showPreviewInDocumentsModal)) {
      return; // Already showing this document
    }

    // If DocumentsModal is open, show preview inside it (don't open separate modal)
    if (showDocumentsModal) {
      setSelectedDocumentForPreview(doc);
      setShowPreviewInDocumentsModal(true);
      setPreviewSignedUrl(null); // Clear previous URL
      // Explicitly ensure separate preview modal is closed
      setPreviewModalVisible(false);
      setIsFullScreenPreview(false);
    } else {
      // Otherwise open separate preview modal
      setSelectedDocumentForPreview(doc);
      setPreviewModalVisible(true);
      setPreviewSignedUrl(null); // Clear previous URL
      // Make sure inline preview is not shown
      setShowPreviewInDocumentsModal(false);
    }
  };

  const [isDownloading, setIsDownloading] = useState(false);

  // Download document - using WebView to trigger automatic download
  const [downloadWebViewUrl, setDownloadWebViewUrl] = useState(null);
  const downloadWebViewRef = useRef(null);

  // Helper function to get MIME type from file extension
  const getMimeType = (extension) => {
    const mimeTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'webp': 'image/webp',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'mp4': 'video/mp4',
      'mov': 'video/quicktime',
      'avi': 'video/x-msvideo',
      'mkv': 'video/x-matroska',
      '3gp': 'video/3gpp',
    };
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  };

  const downloadDocument = async (docInfo) => {
    // Prevent multiple simultaneous downloads
    if (isDownloading) {
      Toast.show({
        type: 'info',
        text1: 'Download in progress',
        text2: 'Please wait for the current download to complete',
        position: 'bottom',
      });
      return;
    }

    // Store these in outer scope for WebView fallback
    let downloadSignedUrl = null;
    let downloadFileName = null;

    try {
      // Set downloading state without causing modal to re-render
      setIsDownloading(true);

      // Small delay to ensure modal state is stable before starting download
      await new Promise(resolve => setTimeout(resolve, 50));

      if (!docInfo?.s3Path) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Document not available',
          position: 'bottom',
        });
        setIsDownloading(false);
        return;
      }

      // Check and request storage permission
      if (Platform.OS === 'android') {
        let hasPermission = await checkStoragePermission();
        if (!hasPermission) {
          hasPermission = await requestStoragePermission();
        }

        if (!hasPermission) {
          // Use Toast instead of Alert to prevent modal from closing
          Toast.show({
            type: 'error',
            text1: 'Permission Denied',
            text2: 'Storage permission is required. Please grant permission in settings.',
            position: 'bottom',
            visibilityTime: 4000,
            onPress: () => Linking.openSettings(),
          });
          setIsDownloading(false);
          return;
        }
      }

      // 1️⃣ Get signed URL
      const response = await customerAPI.getDocumentSignedUrl(docInfo.s3Path);
      const signedUrl = response?.data?.signedUrl;

      if (!signedUrl) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to get download link',
          position: 'bottom',
        });
        setIsDownloading(false);
        return;
      }

      // 2️⃣ Prepare file name and determine save location
      const fileName = docInfo.fileName || docInfo.doctypeName || 'document';

      // Store these in outer scope for WebView fallback
      downloadSignedUrl = signedUrl;
      downloadFileName = fileName;
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';

      // Determine if it's an image/video (for gallery visibility)
      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension);
      const isVideo = ['mp4', 'mov', 'avi', 'mkv', '3gp'].includes(fileExtension);

      // Get appropriate directory
      let dirs = ReactNativeBlobUtil.fs.dirs;
      let downloadPath;

      if (Platform.OS === 'android') {
        if (isImage) {
          // Save images to Pictures folder (visible in gallery)
          downloadPath = dirs.PictureDir;
        } else if (isVideo) {
          // Save videos to Movies folder (visible in gallery)
          downloadPath = dirs.MovieDir || dirs.DownloadDir;
        } else {
          // Save other files to Downloads folder
          downloadPath = dirs.DownloadDir;
        }
      } else {
        // iOS - use DocumentDirectory
        downloadPath = dirs.DocumentDir;
      }

      const filePath = `${downloadPath}/${fileName}`;


      // Show loading toast
      Toast.show({
        type: 'info',
        text1: 'Downloading...',
        text2: fileName,
        position: 'bottom',
      });

      // 3️⃣ Download file using react-native-blob-util
      const downloadTask = ReactNativeBlobUtil.config({
        fileCache: false, // Don't cache when using download manager
        path: filePath,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          title: fileName,
          description: 'Downloading file...',
          mime: getMimeType(fileExtension),
          mediaScannable: true, // Make file visible in gallery
          path: filePath, // Explicit path for download manager
        },
      });

      // Add timeout and better error handling for release builds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Download timeout after 60 seconds')), 60000);
      });

      const downloadPromise = downloadTask.fetch('GET', signedUrl, {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      });

      const res = await Promise.race([downloadPromise, timeoutPromise]);

      // Check if download was successful
      if (!res || !res.path()) {
        throw new Error('Download failed: No file path returned');
      }

      const savedPath = res.path();

      // Verify file exists (especially important in release builds)
      const fileExists = await ReactNativeBlobUtil.fs.exists(savedPath);
      if (!fileExists) {
        // If file doesn't exist, try WebView fallback for release builds
        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body>
              <script>
                (function() {
                  try {
                    const link = document.createElement('a');
                    link.href = '${downloadSignedUrl}';
                    link.download = '${downloadFileName}';
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.ReactNativeWebView.postMessage('DOWNLOAD_STARTED');
                  } catch (error) {
                    window.ReactNativeWebView.postMessage('DOWNLOAD_ERROR: ' + error.message);
                  }
                })();
              </script>
            </body>
          </html>
        `;
        setDownloadWebViewUrl(htmlContent);
        setIsDownloading(false);
        return;
      }

      // Show success message
      Toast.show({
        type: 'success',
        text1: 'Download Complete',
        text2: `${fileName} saved successfully`,
        position: 'bottom',
      });

    } catch (error) {
      console.error('Download error:', error);
      console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));

      // Try WebView fallback on error (especially for release builds)
      try {
        // Get signed URL again if not already available
        let fallbackSignedUrl = downloadSignedUrl;
        let fallbackFileName = downloadFileName;

        if (!fallbackSignedUrl) {
          const fallbackResponse = await customerAPI.getDocumentSignedUrl(docInfo.s3Path);
          fallbackSignedUrl = fallbackResponse?.data?.signedUrl;
          fallbackFileName = docInfo.fileName || docInfo.doctypeName || 'document';
        }

        if (fallbackSignedUrl) {
          const htmlContent = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body>
                <script>
                  (function() {
                    try {
                      const link = document.createElement('a');
                      link.href = '${fallbackSignedUrl}';
                      link.download = '${fallbackFileName}';
                      link.target = '_blank';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.ReactNativeWebView.postMessage('DOWNLOAD_STARTED');
                    } catch (error) {
                      window.ReactNativeWebView.postMessage('DOWNLOAD_ERROR: ' + error.message);
                    }
                  })();
                </script>
              </body>
            </html>
          `;
          setDownloadWebViewUrl(htmlContent);
          setIsDownloading(false);
          return;
        }
      } catch (webViewError) {
        console.error('WebView fallback also failed:', webViewError);
      }

      // More specific error messages
      let errorMessage = 'Failed to download file';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.toString && error.toString() !== '[object Object]') {
        errorMessage = error.toString();
      }

      Toast.show({
        type: 'error',
        text1: 'Download Failed',
        text2: errorMessage,
        position: 'bottom',
        visibilityTime: 5000,
      });
      setIsDownloading(false);
    } finally {
      // Only reset if not using WebView fallback
      if (!downloadWebViewUrl) {
        setIsDownloading(false);
      }
    }
  };

  // Handle approve customer
  const handleApprovePress = (customer) => {
    setSelectedCustomerForAction(customer);
    setApproveModalVisible(true);
  };


  const normalizeMappingIsApproved = (mapping = {}) =>
    Object.fromEntries(
      Object.entries(mapping).map(([key, list]) => [
        key,
        (list || []).map(item => ({
          ...item,
          isApproved:
            item.isApproved !== undefined ? item.isApproved : true,
        })),
      ])
    );


  const handleApproveConfirm = async (comment) => {
    try {

      const workflowId = selectedCustomerForAction?.workflowId || selectedCustomerForAction?.stgCustomerId;
      const instanceId = selectedCustomerForAction?.instaceId || selectedCustomerForAction?.instaceId;
      const actorId = loggedInUser?.userId || loggedInUser?.id;
      const parellGroupId = selectedCustomerForAction?.instance?.stepInstances[0]?.parallelGroup
      const stepOrderId = selectedCustomerForAction?.instance?.stepInstances[0]?.stepOrder




      const draftResponse = await customerAPI.getLatestDraft(instanceId, actorId);

      const latestDraft = draftResponse?.data;
      let dataChanges;

      if (latestDraft.hasDraft) {
        dataChanges = {
          ...latestDraft.draftEdits,
          mapping: normalizeMappingIsApproved(latestDraft.draftEdits?.mapping),
        };
      } else {


        const customerId = selectedCustomerForAction?.customerId || selectedCustomerForAction?.stgCustomerId;

        if (!customerId) {
          throw new Error('Customer ID is missing');
        }
        const isStaging = selectedCustomerForAction?.customerId ? false : true;

        const response = await customerAPI.getCustomerDetails(customerId, isStaging);



        dataChanges = {
          customerGroupId: response?.data?.customerGroupId,
          distributors: [],
          divisions: response?.data?.divisions,
          mapping: normalizeMappingIsApproved(response?.data?.mapping),
        };
      }

      if (!latestDraft) {
        throw new Error('Latest draft data not found');
      }

      const actionDataPyaload = {
        stepOrder: stepOrderId,
        parallelGroup: parellGroupId,
        actorId: actorId,
        action: "APPROVE",
        comments: comment || "Approved",

        dataChanges: dataChanges
      };

      const response = await customerAPI.workflowAction(instanceId, actionDataPyaload);

      setApproveModalVisible(false);
      showToast('Customer has been successfully approved!', 'success');
      setSelectedCustomerForAction(null);

      // Refresh the customer list after approval
      if (activeTab === 'all') {
        dispatch(fetchCustomersList({
          page: 1,
          limit: pagination.limit,
          searchText: filters.searchText,
          isStaging: false,
          isAll: true
        }));
      } else if (activeTab === 'waitingForApproval' || activeTab === 'rejected' || activeTab === 'draft') {
        const statusIds = getStatusIdsForTab(activeTab);
        const payload = {
          page: 1,
          limit: pagination.limit,
          searchText: filters.searchText,
          isStaging: true,
          statusIds: statusIds
        };
        // Add filter for waitingForApproval tab
        if (activeTab === 'waitingForApproval') {
          payload.filter = getFilterValue(activeFilterButton);
        }
        // Add filter for draft tab
        if (activeTab === 'draft') {
          payload.filter = 'NEW';
        }
        dispatch(fetchCustomersList(payload));
      } else if (activeTab === 'doctorSupply') {
        const statusIds = getStatusIdsForTab(activeTab);
        dispatch(fetchCustomersList({
          page: 1,
          limit: pagination.limit,
          searchText: filters.searchText,
          isStaging: false,
          statusIds: statusIds,
          customerGroupId: 1
        }));
      } else {
        const statusIds = getStatusIdsForTab(activeTab);
        dispatch(fetchCustomersList({
          page: 1,
          limit: pagination.limit,
          searchText: filters.searchText,
          isStaging: false,
          statusIds: statusIds
        }));
      }
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
    try {
      showLoader();
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

      console.log(response);
      

      setRejectModalVisible(false);

      AppToastService.show("Customer has been rejected!", "error", "Reject");
      setSelectedCustomerForAction(null);

      // Refresh the customer list after rejection
      if (activeTab === 'all') {
        dispatch(fetchCustomersList({
          page: 1,
          limit: pagination.limit,
          searchText: filters.searchText,
          isStaging: false,
          isAll: true
        }));
      } else if (activeTab === 'waitingForApproval' || activeTab === 'rejected' || activeTab === 'draft') {
        const statusIds = getStatusIdsForTab(activeTab);
        const payload = {
          page: 1,
          limit: pagination.limit,
          searchText: filters.searchText,
          isStaging: true,
          statusIds: statusIds
        };
        // Add filter for waitingForApproval tab
        if (activeTab === 'waitingForApproval') {
          payload.filter = getFilterValue(activeFilterButton);
        }
        // Add filter for draft tab
        if (activeTab === 'draft') {
          payload.filter = 'NEW';
        }
        dispatch(fetchCustomersList(payload));
      } else if (activeTab === 'doctorSupply') {
        const statusIds = getStatusIdsForTab(activeTab);
        dispatch(fetchCustomersList({
          page: 1,
          limit: pagination.limit,
          searchText: filters.searchText,
          isStaging: false,
          statusIds: statusIds,
          customerGroupId: 1
        }));
      } else {
        const statusIds = getStatusIdsForTab(activeTab);
        dispatch(fetchCustomersList({
          page: 1,
          limit: pagination.limit,
          searchText: filters.searchText,
          isStaging: false,
          statusIds: statusIds
        }));
      }
    } catch (error) {
      console.error('Error rejecting customer:', error);
      setRejectModalVisible(false);
      showToast(`Failed to reject customer: ${error.message}`, 'error');
      setSelectedCustomerForAction(null);
    } finally {
      hideLoader();
    }
  };

  // Handle verify button click - fetch latest draft first
  const handleVerifyClick = async (customer) => {
    try {
      setActionLoading(true);
      setSelectedCustomerForAction(customer);
      const instanceId = customer?.instaceId || customer?.stgCustomerId;
      const actorId = loggedInUser?.userId || loggedInUser?.id;

      if (!instanceId || !actorId) {
        showToast('Missing instance ID or actor ID', 'error');
        return;
      }

      // Fetch latest draft data
      const latestDraftResponse = await customerAPI.getLatestDraft(instanceId, actorId);

      if (latestDraftResponse?.data?.draftEdits) {
        setLatestDraftData(latestDraftResponse.data.draftEdits);
        setVerifyModalVisible(true);
      } else {
        showToast('Failed to fetch latest draft data', 'error');
      }
    } catch (error) {
      console.error('Error fetching latest draft:', error);
      showToast(`Failed to fetch latest draft: ${error.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Verify confirmation - call workflow action API with latest draft data
  const handleVerifyConfirm = async (comment) => {
    try {
      setActionLoading(true);
      const instanceId = selectedCustomerForAction?.instaceId || selectedCustomerForAction?.stgCustomerId;
      const actorId = loggedInUser?.userId || loggedInUser?.id;

      if (!instanceId || !actorId) {
        showToast('Missing instance ID or actor ID', 'error');
        return;
      }

      // Get data from latest draft
      const draftData = latestDraftData;
      if (!draftData) {
        showToast('Latest draft data not available', 'error');
        return;
      }

      // Extract data from latest draft response
      const parallelGroup = draftData?.parallelGroup || selectedCustomerForAction?.instance?.stepInstances?.[0]?.parallelGroup || 1;
      const stepOrder = draftData?.stepOrder || selectedCustomerForAction?.instance?.stepInstances?.[0]?.stepOrder || 1;


      let draftEdits;

      if (draftData) {
        // ✅ Case 1: Draft exists
        draftEdits = {
          ...draftData,
          mapping: normalizeMappingIsApproved(draftData?.mapping),
        };
      } else {
        // ✅ Case 2: No draft → fetch customer details
        const customerId =
          selectedCustomerForAction?.customerId ||
          selectedCustomerForAction?.stgCustomerId;

        if (!customerId) {
          throw new Error('Customer ID is missing');
        }

        const isStaging = selectedCustomerForAction?.customerId ? false : true;

        const response = await customerAPI.getCustomerDetails(customerId, isStaging);

        draftEdits = {
          customerGroupId: response?.data?.customerGroupId,
          distributorMapping: [],
          divisions: response?.data?.divisions,
          mapping: normalizeMappingIsApproved(response?.data?.mapping),
        };
      }




      const actionDataPayload = {
        action: "APPROVE",
        parallelGroup: parallelGroup,
        stepOrder: stepOrder,
        actorId: actorId,
        comments: comment || "approved",
        dataChanges: draftEdits,
      };

      const response = await customerAPI.workflowAction(instanceId, actionDataPayload);

      setVerifyModalVisible(false);
      setLatestDraftData(null);
      showToast('Customer has been successfully verified!', 'success');
      setSelectedCustomerForAction(null);

      // Refresh the customer list after verification
      if (activeTab === 'all') {
        dispatch(fetchCustomersList({
          page: 1,
          limit: pagination.limit,
          searchText: filters.searchText,
          isStaging: false,
          isAll: true
        }));
      } else if (activeTab === 'waitingForApproval' || activeTab === 'rejected' || activeTab === 'draft') {
        const statusIds = getStatusIdsForTab(activeTab);
        const payload = {
          page: 1,
          limit: pagination.limit,
          searchText: filters.searchText,
          isStaging: true,
          statusIds: statusIds
        };
        // Add filter for waitingForApproval tab
        if (activeTab === 'waitingForApproval') {
          payload.filter = getFilterValue(activeFilterButton);
        }
        // Add filter for draft tab
        if (activeTab === 'draft') {
          payload.filter = 'NEW';
        }
        dispatch(fetchCustomersList(payload));
      } else if (activeTab === 'doctorSupply') {
        const statusIds = getStatusIdsForTab(activeTab);
        dispatch(fetchCustomersList({
          page: 1,
          limit: pagination.limit,
          searchText: filters.searchText,
          isStaging: false,
          statusIds: statusIds,
          customerGroupId: 1
        }));
      } else {
        const statusIds = getStatusIdsForTab(activeTab);
        dispatch(fetchCustomersList({
          page: 1,
          limit: pagination.limit,
          searchText: filters.searchText,
          isStaging: false,
          statusIds: statusIds
        }));
      }
    } catch (error) {
      console.error('Error verifying customer:', error);
      setVerifyModalVisible(false);
      showToast(`Failed to verify customer: ${error.message}`, 'error');
      setSelectedCustomerForAction(null);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle block customer
  const handleBlockCustomer = async (customer) => {
    try {
      setBlockUnblockLoading(true);
      const customerId = customer?.stgCustomerId || customer?.customerId;

      const response = await customerAPI.blockUnblockCustomer(
        [customerId],
        false // isActive = false for blocking
      );

      showToast('Customer has been blocked successfully!', 'success');

      // Refresh the customer list
      if (activeTab === 'all') {
        dispatch(fetchCustomersList({
          page: 1,
          limit: pagination.limit,
          searchText: filters.searchText,
          isStaging: false,
          isAll: true
        }));
      } else if (activeTab === 'waitingForApproval' || activeTab === 'rejected' || activeTab === 'draft') {
        const statusIds = getStatusIdsForTab(activeTab);
        const payload = {
          page: 1,
          limit: pagination.limit,
          searchText: filters.searchText,
          isStaging: true,
          statusIds: statusIds
        };
        // Add filter for waitingForApproval tab
        if (activeTab === 'waitingForApproval') {
          payload.filter = getFilterValue(activeFilterButton);
        }
        // Add filter for draft tab
        if (activeTab === 'draft') {
          payload.filter = 'NEW';
        }
        dispatch(fetchCustomersList(payload));
      } else if (activeTab === 'doctorSupply') {
        const statusIds = getStatusIdsForTab(activeTab);
        dispatch(fetchCustomersList({
          page: 1,
          limit: pagination.limit,
          searchText: filters.searchText,
          isStaging: false,
          statusIds: statusIds,
          customerGroupId: 1
        }));
      } else {
        const statusIds = getStatusIdsForTab(activeTab);
        dispatch(fetchCustomersList({
          page: 1,
          limit: pagination.limit,
          searchText: filters.searchText,
          isStaging: false,
          statusIds: statusIds
        }));
      }
    } catch (error) {
      console.error('Error blocking customer:', error);
      showToast(`Failed to block customer: ${error.message}`, 'error');
    } finally {
      setBlockUnblockLoading(false);
    }
  };

  // Handle unblock customer
  const handleUnblockCustomer = async (customer) => {
    try {
      setBlockUnblockLoading(true);
      const customerId = customer?.stgCustomerId || customer?.customerId;

      const response = await customerAPI.blockUnblockCustomer(
        [customerId],
        true // isActive = true for unblocking
      );

      showToast('Customer has been unblocked successfully!', 'success');

      // Refresh the customer list
      if (activeTab === 'all') {
        dispatch(fetchCustomersList({
          page: 1,
          limit: pagination.limit,
          searchText: filters.searchText,
          isStaging: false,
          isAll: true
        }));
      } else if (activeTab === 'waitingForApproval' || activeTab === 'rejected' || activeTab === 'draft') {
        const statusIds = getStatusIdsForTab(activeTab);
        const payload = {
          page: 1,
          limit: pagination.limit,
          searchText: filters.searchText,
          isStaging: true,
          statusIds: statusIds
        };
        // Add filter for waitingForApproval tab
        if (activeTab === 'waitingForApproval') {
          payload.filter = getFilterValue(activeFilterButton);
        }
        // Add filter for draft tab
        if (activeTab === 'draft') {
          payload.filter = 'NEW';
        }
        dispatch(fetchCustomersList(payload));
      } else if (activeTab === 'doctorSupply') {
        const statusIds = getStatusIdsForTab(activeTab);
        dispatch(fetchCustomersList({
          page: 1,
          limit: pagination.limit,
          searchText: filters.searchText,
          isStaging: false,
          statusIds: statusIds,
          customerGroupId: 1
        }));
      } else {
        const statusIds = getStatusIdsForTab(activeTab);
        dispatch(fetchCustomersList({
          page: 1,
          limit: pagination.limit,
          searchText: filters.searchText,
          isStaging: false,
          statusIds: statusIds
        }));
      }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        return '#666';
    }
  };

  const handleApplyFilters = (filters) => {
    let typeCode = [];
    let categoryCode = [];
    let subCategoryCode = [];
    let statusIds = [];
    let stateIds = [];
    let cityIds = [];
    let customerGroupIds = [];

    // Handle customerGroup - now from API, map customerGroupName to customerGroupId
    if (filters.customerGroup && filters.customerGroup.length > 0 && !filters.customerGroup.includes('All')) {
      customerGroupIds = filters.customerGroup
        .map(groupName => {
          const group = customerGroups.find(g => (g.customerGroupName || g.name) === groupName);
          return group?.customerGroupId || group?.id;
        })
        .filter(id => id !== undefined);
    }

    // Handle category - now contains customer types (previously in customerGroup)
    // Map to typeCode array
    if (filters.category && filters.category.length > 0 && !filters.category.includes('All')) {
      typeCode = filters.category
        .map(catName => {
          const type = customerTypes.find(t => t.name === catName);
          return type?.code;
        })
        .filter(code => code !== undefined);
    }

    // Handle subCategory - map to subCategoryCode array
    if (filters.subCategory && filters.subCategory.length > 0) {
      subCategoryCode = filters.subCategory
        .map(subCatName => {
          // Search for subcategory code in all customer types
          for (let type of customerTypes) {
            if (type?.customerCategories) {
              for (let cat of type.customerCategories) {
                const subCat = cat.customerSubcategories?.find(s => s.name === subCatName);
                if (subCat) {
                  return subCat.code; // "PCL", "PIH", "PGH"
                }
              }
            }
          }
          return undefined;
        })
        .filter(code => code !== undefined);
    }

    // Handle status - map to statusIds array
    if (filters.status && filters.status.length > 0 && !filters.status.includes('All')) {
      statusIds = filters.status
        .map(statusName => customerStatuses.find(s => s.name === statusName)?.id)
        .filter(id => id !== undefined);
    }

    // Handle state - map to stateIds array
    if (filters.state && filters.state.length > 0 && !filters.state.includes('All')) {
      stateIds = filters.state
        .map(stateName => states.find(s => s.stateName === stateName)?.id)
        .filter(id => id !== undefined);
    }

    // Handle city - map to cityIds array
    if (filters.city && filters.city.length > 0 && !filters.city.includes('All')) {
      cityIds = filters.city
        .map(cityName => cities.find(c => c.cityName === cityName)?.id)
        .filter(id => id !== undefined);
    }

    // Get dates from state or filters (prefer filters as source of truth)
    const startDate = filters.startDate || (fromDate ? formatDateForAPI(fromDate) : null);
    const endDate = filters.endDate || (toDate ? formatDateForAPI(toDate) : null);

    // Build API payload matching the format
    const filterParams = {
      typeCode: typeCode.length > 0 ? typeCode : [],
      categoryCode: categoryCode.length > 0 ? categoryCode : [],
      subCategoryCode: subCategoryCode.length > 0 ? subCategoryCode : [],
      statusIds: statusIds.length > 0 ? statusIds : [],
      stateIds: stateIds.length > 0 ? stateIds : [],
      cityIds: cityIds.length > 0 ? cityIds : [],
      customerGroupIds: customerGroupIds.length > 0 ? customerGroupIds : [],
      ...(startDate && endDate ? {
        startDate: startDate,
        endDate: endDate,
      } : {}),
      page: 1,
      limit: 10,
      sortBy: '',
      sortDirection: 'ASC',
    };

    dispatch(setFilters(filterParams));
    if (activeTab === 'all') {
      const payload = {
        ...filterParams,
        isStaging: false,
        isAll: true
      };
      dispatch(fetchCustomersList(payload));
    } else if (activeTab === 'waitingForApproval' || activeTab === 'rejected' || activeTab === 'draft') {
      const tabStatusIds = getStatusIdsForTab(activeTab);
      const payload = {
        ...filterParams,
        isStaging: true,
        statusIds: tabStatusIds
      };
      // Add filter for waitingForApproval tab
      if (activeTab === 'waitingForApproval') {
        payload.filter = getFilterValue(activeFilterButton);
      }
      // Add filter for draft tab
      if (activeTab === 'draft') {
        payload.filter = 'NEW';
      }
      dispatch(fetchCustomersList(payload));
    } else if (activeTab === 'doctorSupply') {
      const tabStatusIds = getStatusIdsForTab(activeTab);
      dispatch(fetchCustomersList({
        ...filterParams,
        isStaging: false,
        statusIds: tabStatusIds,
        customerGroupId: 1
      }));
    } else {
      const tabStatusIds = getStatusIdsForTab(activeTab);
      dispatch(fetchCustomersList({
        ...filterParams,
        isStaging: false,
        statusIds: tabStatusIds
      }));
    }
    setFilterModalVisible(false);
  };


  const renderCustomerAction = (item) => {
    // 1️⃣ BLOCK / UNBLOCK
    if (item.statusName === 'LOCKED') {
      return (
        <PermissionWrapper permission={PERMISSIONS.ONBOARDING_LISTING_PAGE_ALL_BLOCK_UNBLOCK}>
          <TouchableOpacity
            style={styles.unlockButton}
            onPress={() => handleUnblockCustomer(item)}
            disabled={blockUnblockLoading}
          >
            <UnLocked fill="#EF4444" />
            <AppText style={styles.unlockButtonText}>Unblock</AppText>
          </TouchableOpacity>
        </PermissionWrapper>
      );
    }

    if (['ACTIVE', 'UN-VERIFIED'].includes(item.statusName)) {
      return (
        <PermissionWrapper permission={PERMISSIONS.ONBOARDING_LISTING_PAGE_ALL_BLOCK_UNBLOCK}>
          <TouchableOpacity
            style={styles.blockButton}
            onPress={() => handleBlockCustomer(item)}
            disabled={blockUnblockLoading}
          >
            <Locked fill="#666" />
            <AppText style={styles.blockButtonText}>Block</AppText>
          </TouchableOpacity>
        </PermissionWrapper>
      );
    }

    // 2️⃣ ONBOARD
    if (item.statusName === 'NOT-ONBOARDED') {
      return (
        <PermissionWrapper permission={[
          PERMISSIONS.ONBOARDING_LISTING_PAGE_ALL_ONBOARD,
          PERMISSIONS.ONBOARDING_LISTING_PAGE_NOT_ONBOARDED_ONBOARD,
        ]}>
          <TouchableOpacity
            style={styles.onboardButton}
            onPress={() => {
              const customerId = item.stgCustomerId || item.customerId;
              const isStaging = item.stgCustomerId != null;
              navigation.navigate('onboarding', { isStaging, customerId, action: "onboard", documentUpload:false })
            }}
          >
            <AppText style={styles.onboardButtonText}>Onboard</AppText>
          </TouchableOpacity>
        </PermissionWrapper>
      );
    }

    // 3️⃣ INSTANCE BASED ACTIONS
    const stepStatus =
      item?.instance?.stepInstances?.[0]?.stepInstanceStatus;

    const isInstance = ['PENDING', 'IN_PROGRESS'].includes(stepStatus);

    const approverType = item?.instance?.stepInstances?.[0]?.approverType;

    if (
      (hasLinkDTAccess && activeTab == "all" && !item?.customerId && isInstance) ||
      (hasLinkDTAccess &&
        activeTab == "waitingForApproval" &&
        activeFilterButton == "newCustomer" &&
        !item?.customerId &&
        isInstance)
    ) {
      return (
        <PermissionWrapper permission={PERMISSIONS.ONBOARDING_LISTING_PAGE_ALL_LINK_DT}>
          <View style={styles.pendingActions}>
            <TouchableOpacity
              style={styles.linkDtButton}
              onPress={() =>
                navigation.navigate('CustomerDetail', {
                  customerId: item?.stgCustomerId ?? item?.customerId,
                  isStaging: !!item?.stgCustomerId,
                  activeTab: 'linkaged',
                })
              }
            >
              <View style={styles.linkDtButtonContent}>
                <AppText style={styles.linkDtButtonText}>LINK DT</AppText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => handleRejectPress(item)}
            >
              <CloseCircle color="#000" />
            </TouchableOpacity>
          </View>
        </PermissionWrapper>
      );
    } else {
      // 3B️⃣ APPROVE / VERIFY
      return (

        isInstance ? (<PermissionWrapper
          permission={[
            PERMISSIONS.ONBOARDING_LISTING_PAGE_ALL_APPROVE_REJECT,
            PERMISSIONS.ONBOARDING_LISTING_PAGE_WAITING_FOR_APPROVAL_APPROVE_REJECT,
          ]}
        >
          <View style={styles.pendingActions}>
            <TouchableOpacity
              style={styles.approveButton}
              onPress={() =>
                navigation.navigate('CustomerDetail', {
                  customerId: item?.stgCustomerId ?? item?.customerId,
                  isStaging: !!item?.stgCustomerId,
                })
              }
              disabled={actionLoading}
            >
              <View style={styles.approveButtonContent}>
                <Icon name="checkmark-outline" size={18} color="white" />
                <AppText style={styles.approveButtonText}>
                  {approverType === 'ROLE' ? 'Verify' : 'Approve'}
                </AppText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => handleRejectPress(item)}
              disabled={actionLoading}
            >
              <CloseCircle color="#000" />
            </TouchableOpacity>
          </View>
        </PermissionWrapper>) : null

      );
    }


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
        <View style={styles.customerHeader}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate('CustomerDetail', {
                customerId: item?.stgCustomerId ?? item?.customerId,
                isStaging: !!item?.stgCustomerId,

              })
            }
            style={styles.customerNameRow}
          >
            <AppText
              style={styles.customerName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.customerName}
            </AppText>

            <ChevronRight
              height={12}
              color={colors.primary}
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>
          <View style={styles.actionsContainer}>
            {console.log(unverifiedEdit, 54345345)
            }

            {(
              item.statusName !== 'NOT-ONBOARDED' &&
              (
                item.statusName === 'DRAFT' ||
                !!item?.instance?.stepInstances?.length ||
                (item?.customerId && !item?.stgCustomerId)
              ) && (

                <PermissionWrapper permission={editPermissionTabBased[activeTab]}>
                  {
                    (item.statusName === 'UNVERIFIED' && !unverifiedEdit) ||
                      item?.instance?.stepInstances?.[0]?.stepInstanceStatus === 'APPROVED' ||
                      (item?.childStageId || []).length > 0 ? <></> :

                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                          const customerId = item.stgCustomerId || item.customerId;
                          const isStaging = item.stgCustomerId != null;
                          navigation.navigate('onboarding', { isStaging, customerId, action: item.statusName === 'DRAFT' ?"register":"edit",  })
                          // handleOnboardCustomer(
                          //   navigation,
                          //   customerId,
                          //   isStaging,
                          //   customerAPI,
                          //   toastConfig => Toast.show(toastConfig),
                          //   derivedStatus
                          // );
                        }}
                      >
                        <Edit color="#666" />
                      </TouchableOpacity>

                  }



                </PermissionWrapper>
              ))
            }
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
            {/* LEFT ICON */}
            <AddrLine color="#999" />

            {/* FLEXIBLE INFO BLOCK */}
            <View style={styles.flexInfo}>
              <AppText style={styles.infoIdText} numberOfLines={1}>
                {item.customerCode || item.stgCustomerId}
              </AppText>

              <AppText style={styles.divider}>|</AppText>

              {item?.cityName && (
                <>
                  <AppText style={styles.infoText} numberOfLines={1}>
                    {item.cityName}
                  </AppText>
                  <AppText style={styles.divider}>|</AppText>
                </>
              )}

              <AppText style={styles.infoText} numberOfLines={1}>
                {item.groupName}
              </AppText>

              <AppText style={styles.divider}>|</AppText>

              {/* PROTECTED CUSTOMER TYPE */}
              <View style={styles.customerTypeBox}>
                <AppText style={styles.customerTypeText} numberOfLines={1}>
                  {item.customerType}
                </AppText>

                {item.customerSubcategory && (
                  <CommonTooltip
                    content={
                      <AppText style={styles.tooltipText}>
                        {item.customerSubcategory}
                      </AppText>
                    }
                    backgroundColor='#2b2b2b'


                    verticalOffset={8}
                  >
                    <View style={styles.alertIconWrap}>
                      <AlertFilled color="#000" />
                    </View>
                  </CommonTooltip>
                )}
              </View>
            </View>

            {/* RIGHT — LINKAGE COUNT */}
            <TouchableOpacity
              style={styles.linkageBox}
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate('CustomerDetail', {
                  customerId: item?.stgCustomerId ?? item?.customerId,
                  isStaging: !!item?.stgCustomerId,
                  activeTab: 'linkaged',
                })
              }
            >
              <LinkIcon />
              <AppText style={styles.linkageText}>
                {item.linkageCount ?? 0}
              </AppText>
            </TouchableOpacity>
          </View>

          <View style={styles.contactRow}>
            <Phone color="#999" />
            <AppText style={{ ...styles.contactText, marginRight: 15 }}>{item.mobile}</AppText>
            <Email color="#999" style={styles.mailIcon} />
            {/* <AppText style={styles.contactText} ellipsizeMode="tail" numberOfLines={1}  >{item.email}</AppText> */}

            <AppText
              style={[styles.contactText, { flex: 1, maxWidth: "100%" }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.email}
            </AppText>
          </View>
        </View>

        <View style={styles.statusRow}>
          <TouchableOpacity
            onPress={() => {
              // stageId is always an array, get the first element
              const stageId = item.stageId && Array.isArray(item.stageId) ? item.stageId : [item.stgCustomerId];


              if (stageId && stageId.length > 0) {
                handleViewWorkflowTimeline(
                  stageId,
                  item.customerName,
                  item.customerType
                );
              } else {
                console.warn('⚠️ No stageId found for item:', item);
                Toast.show({
                  type: 'error',
                  text1: 'Error',
                  text2: 'Customer ID not available',
                });
              }
            }}
            activeOpacity={0.7}
          >


            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: getStatusColor(
                    item?.instance?.stepInstances?.[0]?.approverType === 'INITIATOR'
                      ? item?.instance?.stepInstances?.[0]?.stepInstanceStatus === 'APPROVED'
                        ? 'APPROVED'
                        : 'REASSIGNED'
                      : item.statusName
                  ),
                },
              ]}
            >
              <AppText
                style={[
                  styles.statusText,
                  {
                    color: getStatusTextColor(
                      item?.instance?.stepInstances?.[0]?.approverType === 'INITIATOR'
                        ? item?.instance?.stepInstances?.[0]?.stepInstanceStatus === 'APPROVED'
                          ? 'APPROVED'
                          : 'REASSIGNED'
                        : item.statusName
                    ),
                  },
                ]}
              >
                {item?.instance?.stepInstances?.[0]?.approverType === 'INITIATOR'
                  ? item?.instance?.stepInstances?.[0]?.stepInstanceStatus === 'APPROVED'
                    ? 'APPROVED'
                    : 'REASSIGNED'
                  : item.statusName}
              </AppText>
            </View>

          </TouchableOpacity>





          {renderCustomerAction(item)}




        </View>
      </Animated.View>
    );
  };


  // Documents Modal - Shows all documents for a customer
  const DocumentsModal = () => {
    const handleClose = () => {
      // Only close if preview is not active and not downloading - prevent accidental closes
      if (!showPreviewInDocumentsModal && !isDownloading) {
        // Clean up all modal state
        setShowDocumentsModal(false);
        setShowPreviewInDocumentsModal(false);
        setPreviewModalVisible(false);
        setSelectedDocumentForPreview(null);
        setPreviewSignedUrl(null);
        setIsFullScreenPreview(false);
      }
    };

    const handleOverlayPress = (e) => {
      // Prevent closing when preview is shown or downloading
      if (!showPreviewInDocumentsModal && !isDownloading) {
        e.stopPropagation();
        handleClose();
      }
    };

    const handleBackFromPreview = () => {
      setShowPreviewInDocumentsModal(false);
      setSelectedDocumentForPreview(null);
      setPreviewSignedUrl(null);
    };

    // Don't render if modal is not visible
    if (!showDocumentsModal) {
      return null;
    }

    return (
      <Modal
        visible={showDocumentsModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          // Only allow closing via back button if not previewing or downloading
          if (!showPreviewInDocumentsModal && !isDownloading) {
            handleClose();
          }
        }}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleOverlayPress}
            disabled={showPreviewInDocumentsModal || isDownloading}
            style={StyleSheet.absoluteFill}
          />
          <View
            style={styles.documentsModalContent}
            pointerEvents="box-none"
          >
            {/* Documents List - Always visible, but dimmed when preview is shown */}
            <View style={[styles.documentsListWrapper, showPreviewInDocumentsModal && styles.documentsListDimmed]}>
              {/* Header */}
              <View style={styles.documentsModalHeader}>
                <AppText style={styles.documentsModalTitle}>All Documents</AppText>
                <TouchableOpacity onPress={handleClose}>
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
                              onPress={(e) => {
                                e.stopPropagation();
                                previewDocument(customerDocuments.gstDoc);
                              }}
                            >
                              <EyeOpen width={16} color={colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.documentActionButtonSmall}
                              onPress={(e) => {
                                e.stopPropagation();
                                downloadDocument(customerDocuments.gstDoc);
                              }}
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
                              onPress={(e) => {
                                e.stopPropagation();
                                previewDocument(customerDocuments.panDoc);
                              }}
                            >
                              <EyeOpen width={16} color={colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.documentActionButtonSmall}
                              onPress={(e) => {
                                e.stopPropagation();
                                downloadDocument(customerDocuments.panDoc);
                              }}
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
                              onPress={(e) => {
                                e.stopPropagation();
                                previewDocument(doc);
                              }}
                            >
                              <EyeOpen width={18} color={colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.documentActionButton}
                              onPress={(e) => {
                                e.stopPropagation();
                                downloadDocument(doc);
                              }}
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

            {/* Image Preview Overlay - Shows on top of documents modal */}
            {showPreviewInDocumentsModal && (
              <View style={styles.previewOverlayContainer}>
                <View style={styles.previewOverlayContent}>
                  {/* Close button */}
                  <TouchableOpacity
                    onPress={handleBackFromPreview}
                    style={styles.previewCloseButton}
                  >
                    <View style={styles.previewCloseButtonCircle}>
                      <Icon name="close" size={24} color="#000" />
                    </View>
                  </TouchableOpacity>

                  {previewLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color={colors.primary} />
                      <AppText style={styles.loadingText}>Loading document...</AppText>
                    </View>
                  ) : (() => {
                    const isImageFile = selectedDocumentForPreview?.fileName?.toLowerCase().endsWith('.jpg') ||
                      selectedDocumentForPreview?.fileName?.toLowerCase().endsWith('.jpeg') ||
                      selectedDocumentForPreview?.fileName?.toLowerCase().endsWith('.png');

                    return previewSignedUrl && isImageFile ? (
                      <ScrollView
                        style={styles.previewScrollContainer}
                        contentContainerStyle={styles.previewScrollContent}
                        showsVerticalScrollIndicator={true}
                      >
                        <View style={styles.previewImageWrapper}>
                          <TouchableOpacity
                            activeOpacity={1}
                            onPress={() => {
                              // Show full screen preview in a separate modal even when inside DocumentsModal
                              setPreviewModalVisible(true);
                              setIsFullScreenPreview(true);
                            }}
                            style={styles.imagePreviewTouchable}
                          >
                            <ZoomableImage
                              imageUri={previewSignedUrl}
                              containerWidth={width * 0.95 - 32}
                              containerHeight={height * 0.65}
                            />
                          </TouchableOpacity>
                        </View>

                        {/* Filename and actions */}
                        <View style={styles.previewDocumentInfo}>
                          <AppText style={styles.previewFileName} numberOfLines={1}>
                            {selectedDocumentForPreview?.fileName || selectedDocumentForPreview?.doctypeName}
                          </AppText>
                          <View style={styles.previewActions}>
                            <TouchableOpacity
                              style={styles.previewActionButton}
                              onPress={() => {
                                setPreviewModalVisible(true);
                                setIsFullScreenPreview(true);
                              }}
                            >
                              <EyeOpen width={20} color={colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.previewActionButton}
                              onPress={(e) => {
                                e.stopPropagation();
                                downloadDocument(selectedDocumentForPreview);
                              }}
                            >
                              <Download width={20} color={colors.primary} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </ScrollView>
                    ) : previewSignedUrl ? (
                      <ScrollView
                        style={styles.previewScrollContainer}
                        contentContainerStyle={styles.previewScrollContent}
                      >
                        <View style={styles.documentPreviewPlaceholder}>
                          <Icon name="document-text-outline" size={64} color="#999" />
                          <AppText style={styles.documentPreviewText}>{selectedDocumentForPreview?.fileName}</AppText>
                        </View>

                        {/* Filename and actions */}
                        <View style={styles.previewDocumentInfo}>
                          <AppText style={styles.previewFileName} numberOfLines={1}>
                            {selectedDocumentForPreview?.fileName || selectedDocumentForPreview?.doctypeName}
                          </AppText>
                          <View style={styles.previewActions}>
                            <TouchableOpacity
                              style={styles.previewActionButton}
                              onPress={(e) => {
                                e.stopPropagation();
                                downloadDocument(selectedDocumentForPreview);
                              }}
                            >
                              <Download width={20} color={colors.primary} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </ScrollView>
                    ) : null;
                  })()}
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  };



  // Zoomable Image Component - Using React Native built-in APIs only
  const ZoomableImage = ({ imageUri, containerWidth, containerHeight }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;

    const savedScale = useRef(1);
    const currentTranslateX = useRef(0);
    const currentTranslateY = useRef(0);
    const lastTap = useRef(null);
    const initialDistance = useRef(null);
    const initialScale = useRef(1);
    const activeTouches = useRef([]);

    const MIN_SCALE = 1;
    const MAX_SCALE = 5;

    // Calculate distance between two touch points
    const getDistance = (touches) => {
      if (touches.length < 2) return null;
      const dx = touches[0].pageX - touches[1].pageX;
      const dy = touches[0].pageY - touches[1].pageY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    // Handle touch start - better multi-touch detection
    const handleTouchStart = (evt) => {
      const touches = evt.nativeEvent.touches;
      activeTouches.current = Array.from(touches);

      if (touches.length === 2) {
        // Pinch gesture
        initialDistance.current = getDistance(touches);
        initialScale.current = savedScale.current;
      } else if (touches.length === 1) {
        // Single touch - check for double tap
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;

        if (lastTap.current && (now - lastTap.current) < DOUBLE_TAP_DELAY) {
          // Double tap detected
          if (savedScale.current > MIN_SCALE) {
            // Reset zoom
            Animated.parallel([
              Animated.spring(scale, {
                toValue: MIN_SCALE,
                useNativeDriver: true,
                tension: 50,
                friction: 7,
              }),
              Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true,
                tension: 50,
                friction: 7,
              }),
              Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                tension: 50,
                friction: 7,
              }),
            ]).start(() => {
              savedScale.current = MIN_SCALE;
              currentTranslateX.current = 0;
              currentTranslateY.current = 0;
            });
          } else {
            // Zoom in
            Animated.spring(scale, {
              toValue: 2,
              useNativeDriver: true,
              tension: 50,
              friction: 7,
            }).start(() => {
              savedScale.current = 2;
            });
          }
          lastTap.current = null;
        } else {
          lastTap.current = now;
        }

        // Save current translation for pan
        translateX.stopAnimation((x) => {
          currentTranslateX.current = x;
        });
        translateY.stopAnimation((y) => {
          currentTranslateY.current = y;
        });
      }
    };

    // Handle touch move - better multi-touch detection
    const handleTouchMove = (evt) => {
      const touches = evt.nativeEvent.touches;
      activeTouches.current = Array.from(touches);

      if (touches.length === 2) {
        const currentDistance = getDistance(touches);

        // Initialize distance if not set
        if (!initialDistance.current && currentDistance) {
          initialDistance.current = currentDistance;
          initialScale.current = savedScale.current;
        }

        // Perform pinch zoom
        if (currentDistance && initialDistance.current && initialDistance.current > 0) {
          const scaleRatio = currentDistance / initialDistance.current;
          const newScale = initialScale.current * scaleRatio;
          const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));

          scale.setValue(clampedScale);
          savedScale.current = clampedScale;
        }
      }
    };

    // Handle touch end
    const handleTouchEnd = (evt) => {
      const touches = evt.nativeEvent.touches;
      activeTouches.current = Array.from(touches);

      if (touches.length === 0) {
        initialDistance.current = null;
        translateX.stopAnimation((x) => {
          translateY.stopAnimation((y) => {
            constrainTranslation(savedScale.current, x, y);
          });
        });
      }
    };

    const constrainTranslation = (scaleValue, currentX, currentY) => {
      if (scaleValue <= MIN_SCALE) {
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }),
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }),
        ]).start();
        currentTranslateX.current = 0;
        currentTranslateY.current = 0;
      } else {
        const maxTranslateX = (containerWidth * (scaleValue - 1)) / 2;
        const maxTranslateY = (containerHeight * (scaleValue - 1)) / 2;

        const clampedX = Math.max(-maxTranslateX, Math.min(maxTranslateX, currentX));
        const clampedY = Math.max(-maxTranslateY, Math.min(maxTranslateY, currentY));

        Animated.parallel([
          Animated.spring(translateX, {
            toValue: clampedX,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }),
          Animated.spring(translateY, {
            toValue: clampedY,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }),
        ]).start();

        currentTranslateX.current = clampedX;
        currentTranslateY.current = clampedY;
      }
    };

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: (evt) => {
          return true;
        },
        onMoveShouldSetPanResponder: (evt) => {
          return true;
        },
        onPanResponderGrant: (evt) => {
          handleTouchStart(evt);
        },
        onPanResponderMove: (evt, gestureState) => {
          const touches = evt.nativeEvent.touches;

          // Handle pinch in touch move handler
          handleTouchMove(evt);

          // Handle single finger pan when zoomed
          if (touches.length === 1 && savedScale.current > MIN_SCALE) {
            const newX = currentTranslateX.current + gestureState.dx;
            const newY = currentTranslateY.current + gestureState.dy;
            translateX.setValue(newX);
            translateY.setValue(newY);
          }
        },
        onPanResponderRelease: (evt) => {
          handleTouchEnd(evt);
        },
        onPanResponderTerminate: () => {
          initialDistance.current = null;
          activeTouches.current = [];
        },
      })
    ).current;

    const animatedStyle = {
      transform: [
        { translateX },
        { translateY },
        { scale },
      ],
    };

    return (
      <View
        style={[styles.zoomableImageWrapper, { width: containerWidth, height: containerHeight }]}
        {...panResponder.panHandlers}
      >
        <Animated.Image
          source={{ uri: imageUri }}
          style={[styles.previewImage, animatedStyle]}
          resizeMode="contain"
        />
      </View>
    );
  };

  // Document Preview Modal
  const DocumentPreviewModal = () => {
    const closeModal = () => {
      setPreviewModalVisible(false);
      setIsPreviewing(false);
      setIsFullScreenPreview(false);
      // Don't close documents modal - keep it open in background
    };

    // Don't show this modal if preview is being shown inside DocumentsModal (unless it's full screen)
    if (showPreviewInDocumentsModal && !isFullScreenPreview) {
      return null;
    }

    const isImageFile = selectedDocumentForPreview?.fileName?.toLowerCase().endsWith('.jpg') ||
      selectedDocumentForPreview?.fileName?.toLowerCase().endsWith('.jpeg') ||
      selectedDocumentForPreview?.fileName?.toLowerCase().endsWith('.png');

    // Full Screen Image Preview - show even if opened from DocumentsModal
    if (isFullScreenPreview && previewSignedUrl && isImageFile && previewModalVisible) {
      return (
        <Modal
          visible={previewModalVisible}
          transparent
          animationType="fade"
          onRequestClose={closeModal}
          statusBarTranslucent
        >
          <View style={styles.fullScreenPreviewContainer}>
            <View style={styles.fullScreenPreviewHeader}>
              <TouchableOpacity onPress={() => {
                setIsFullScreenPreview(false);
                // If opened from DocumentsModal, just exit full screen and keep DocumentsModal open
                // Otherwise close the preview modal
                if (!showPreviewInDocumentsModal) {
                  setPreviewModalVisible(false);
                }
              }} style={styles.fullScreenCloseButton}>
                <Icon name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
            <ZoomableImage
              imageUri={previewSignedUrl}
              containerWidth={width}
              containerHeight={Dimensions.get('window').height}
            />
          </View>
        </Modal>
      );
    }

    // Regular Modal View - only show if not opened from DocumentsModal
    if (showPreviewInDocumentsModal) {
      return null; // Don't show separate modal if preview is inside DocumentsModal
    }

    return (
      <Modal
        visible={previewModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          style={styles.previewModalOverlay}
          activeOpacity={1}
          onPress={closeModal}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.previewModalContent}
          >
            <View style={styles.previewModalHeader}>
              <AppText style={styles.previewModalTitle} numberOfLines={1}>
                {selectedDocumentForPreview?.fileName || selectedDocumentForPreview?.doctypeName}
              </AppText>
              <TouchableOpacity onPress={closeModal}>
                <CloseCircle />
              </TouchableOpacity>
            </View>

            <View style={styles.previewContainer}>
              {previewLoading ? (
                <ActivityIndicator size="large" color={colors.primary} />
              ) : previewSignedUrl && isImageFile ? (
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => {
                    // Show full screen preview in a separate modal even when inside DocumentsModal
                    setPreviewModalVisible(true);
                    setIsFullScreenPreview(true);
                  }}
                  style={styles.imagePreviewTouchable}
                >
                  <ZoomableImage
                    imageUri={previewSignedUrl}
                    containerWidth={width * 0.95 - 32}
                    containerHeight={300}
                  />
                </TouchableOpacity>
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
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
          <TouchableOpacity onPress={() => {
            // Use DrawerActions to open drawer from nested navigation
            // This works from any screen in the navigation hierarchy
            navigation.dispatch(DrawerActions.openDrawer());
          }}>
            <Menu />
          </TouchableOpacity>
          <AppText style={styles.headerTitle}>Customers</AppText>
          <View style={styles.headerActions}>
            <PermissionWrapper permission={PERMISSIONS.ONBOARDING_LISTING_PAGE_ALL_CREATE_CUSTOMER}>
              <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('onboarding')}>
                <AppText style={styles.createButtonText}>CREATE</AppText>
              </TouchableOpacity>
            </PermissionWrapper>
            <TouchableOpacity>
              <Bell color="#333" />
            </TouchableOpacity>
            {/* <TouchableOpacity onPress={() => setDownloadModalVisible(true)}>
              <Download color="#333" />
            </TouchableOpacity> */}
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
          {hasAllTabPermission && (
            <TouchableOpacity
              ref={(ref) => tabRefs.current['all'] = ref}
              style={[styles.tab, activeTab === 'all' && styles.activeTab]}
              onPress={() => handleTabPress('all')}
            >
              <AppText style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
                All ({tabCounts.all})
              </AppText>
            </TouchableOpacity>
          )}
          {/* {hasWaitingForApprovalTabPermission && ( */}
          <TouchableOpacity
            ref={(ref) => tabRefs.current['waitingForApproval'] = ref}
            style={[styles.tab, activeTab === 'waitingForApproval' && styles.activeTab]}
            onPress={() => handleTabPress('waitingForApproval')}
          >
            <AppText style={[styles.tabText, activeTab === 'waitingForApproval' && styles.activeTabText]}>
              Waiting for Approval ({tabCounts.waitingForApproval})
            </AppText>
          </TouchableOpacity>
          {/* )} */}
          {hasNotOnboardedTabPermission && (
            <TouchableOpacity
              ref={(ref) => tabRefs.current['notOnboarded'] = ref}
              style={[styles.tab, activeTab === 'notOnboarded' && styles.activeTab]}
              onPress={() => handleTabPress('notOnboarded')}
            >
              <AppText style={[styles.tabText, activeTab === 'notOnboarded' && styles.activeTabText]}>
                Not Onboarded ({tabCounts.notOnboarded})
              </AppText>
            </TouchableOpacity>
          )}
          {hasUnverifiedTabPermission && (
            <TouchableOpacity
              ref={(ref) => tabRefs.current['unverified'] = ref}
              style={[styles.tab, activeTab === 'unverified' && styles.activeTab]}
              onPress={() => handleTabPress('unverified')}
            >
              <AppText style={[styles.tabText, activeTab === 'unverified' && styles.activeTabText]}>
                Unverified ({tabCounts.unverified})
              </AppText>
            </TouchableOpacity>
          )}
          {hasRejectedTabPermission && (
            <TouchableOpacity
              ref={(ref) => tabRefs.current['rejected'] = ref}
              style={[styles.tab, activeTab === 'rejected' && styles.activeTab]}
              onPress={() => handleTabPress('rejected')}
            >
              <AppText style={[styles.tabText, activeTab === 'rejected' && styles.activeTabText]}>
                Rejected ({tabCounts.rejected})
              </AppText>
            </TouchableOpacity>
          )}
          {hasDoctorSupplyTabPermission && (
            <TouchableOpacity
              ref={(ref) => tabRefs.current['doctorSupply'] = ref}
              style={[styles.tab, activeTab === 'doctorSupply' && styles.activeTab]}
              onPress={() => handleTabPress('doctorSupply')}
            >
              <AppText style={[styles.tabText, activeTab === 'doctorSupply' && styles.activeTabText]}>
                Doctor Supply ({tabCounts.doctorSupply || 0})
              </AppText>
            </TouchableOpacity>
          )}
          {hasDraftTabPermission && (
            <TouchableOpacity
              ref={(ref) => tabRefs.current['draft'] = ref}
              style={[styles.tab, activeTab === 'draft' && styles.activeTab]}
              onPress={() => handleTabPress('draft')}
            >
              <AppText style={[styles.tabText, activeTab === 'draft' && styles.activeTabText]}>
                Draft ({tabCounts.draft || 0})
              </AppText>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Filter Buttons for Waiting for Approval Tab */}
        {activeTab === 'waitingForApproval' && (
          <ScrollView
            ref={filterButtonsScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterButtonsContainer}
            contentContainerStyle={styles.filterButtonsContent}
            scrollEventThrottle={16}
          >
            <TouchableOpacity
              ref={(ref) => filterButtonRefs.current['newCustomer'] = ref}
              style={[
                styles.filterButtonItem,
                activeFilterButton === 'newCustomer' && styles.activeFilterButton
              ]}
              onPress={() => handleFilterButtonPress('newCustomer')}
            >
              <AppText
                style={[
                  styles.filterButtonText,
                  activeFilterButton === 'newCustomer' && styles.activeFilterButtonText
                ]}
              >
                New customer
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              ref={(ref) => filterButtonRefs.current['customerGroupChange'] = ref}
              style={[
                styles.filterButtonItem,
                activeFilterButton === 'customerGroupChange' && styles.activeFilterButton
              ]}
              onPress={() => handleFilterButtonPress('customerGroupChange')}
            >
              <AppText
                style={[
                  styles.filterButtonText,
                  activeFilterButton === 'customerGroupChange' && styles.activeFilterButtonText
                ]}
              >
                Customer group change
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              ref={(ref) => filterButtonRefs.current['editCustomer'] = ref}
              style={[
                styles.filterButtonItem,
                activeFilterButton === 'editCustomer' && styles.activeFilterButton
              ]}
              onPress={() => handleFilterButtonPress('editCustomer')}
            >
              <AppText
                style={[
                  styles.filterButtonText,
                  activeFilterButton === 'editCustomer' && styles.activeFilterButtonText
                ]}
              >
                Edit customer
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              ref={(ref) => filterButtonRefs.current['existingCustomer'] = ref}
              style={[
                styles.filterButtonItem,
                activeFilterButton === 'existingCustomer' && styles.activeFilterButton
              ]}
              onPress={() => handleFilterButtonPress('existingCustomer')}
            >
              <AppText
                style={[
                  styles.filterButtonText,
                  activeFilterButton === 'existingCustomer' && styles.activeFilterButtonText
                ]}
              >
                Existing customer
              </AppText>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => navigation.navigate('CustomerStack', {
              screen: 'CustomerSearchMain',
              params: { activeTab: activeTab, activeFilterButton: activeFilterButton } // Pass current active tab to search screen
            })}
            activeOpacity={0.7}
          >
            <Search color="#999" />
            <AppText style={styles.searchPlaceholder}>Search by customer name/code</AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Filter color="#666" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setDatePickerModalVisible(true)}
          >
            <Calendar color="#666" />
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

          {(listLoading || isHardRefreshing) && customers.length === 0 ? (
            <SkeletonList items={5} />
          ) : listError && customers.length === 0 ? (
            <View style={styles.errorContainer}>
              <AlertCircle size={60} color="#EF4444" />
              <AppText style={styles.errorTitle}>Unable to Load Customers</AppText>
              <AppText style={styles.errorMessage}>
                {listError === 'Network request failed' || listError.includes('Network')
                  ? 'Server is currently unavailable. Please check your connection and try again.'
                  : listError || 'Something went wrong. Please try again.'}
              </AppText>
              <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
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
          loading={actionLoading}
        />

        <RejectCustomerModal
          visible={rejectModalVisible}
          onClose={() => {
            setRejectModalVisible(false);
            setSelectedCustomerForAction(null);
          }}
          onConfirm={handleRejectConfirm}
          customerName={selectedCustomerForAction?.customerName}
          loading={actionLoading}
        />

        {/* Verify Modal */}
        <ApproveCustomerModal
          visible={verifyModalVisible}
          onClose={() => {
            setVerifyModalVisible(false);
            setLatestDraftData(null);
            setSelectedCustomerForAction(null);
          }}
          onConfirm={handleVerifyConfirm}
          customerName={selectedCustomerForAction?.customerName}
          loading={actionLoading}
        />

        <WorkflowTimelineModal
          visible={workflowTimelineVisible}
          onClose={() => {
            setWorkflowTimelineVisible(false);
            setSelectedCustomerForWorkflow(null);
          }}
          stageId={selectedCustomerForWorkflow?.stageId?.[0] || null}
          customerName={selectedCustomerForWorkflow?.customerName}
          customerType={selectedCustomerForWorkflow?.customerType}
        />

        {/* Toast Notification */}
        {toastVisible && (
          <View style={[styles.toastContainer, { bottom: insets.bottom || 8 }]}>
            <View
              style={[
                styles.toast,
                toastType === 'success'
                  ? styles.toastSuccess
                  : toastType === 'warning'
                    ? styles.toastWarning
                    : styles.toastError,
              ]}
            >
              <View style={styles.toastHeader}>
                <AppText style={styles.toastLabel}>
                  {toastType === 'success'
                    ? 'Approve'
                    : toastType === 'warning'
                      ? 'Send Back'
                      : 'Reject'}
                </AppText>

                <TouchableOpacity onPress={() => setToastVisible(false)}>
                  <AppText style={styles.toastOkButton}>OK</AppText>
                </TouchableOpacity>
              </View>

              <AppText style={styles.toastMessage}>{toastMessage}</AppText>
            </View>
          </View>
        )}


        {/* Date Picker Modal */}
        <Modal
          visible={datePickerModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setDatePickerModalVisible(false)}
        >
          <View style={styles.dateModalOverlay}>
            <View style={styles.dateModalContent}>
              <View style={styles.dateModalHeader}>
                <AppText style={styles.dateModalTitle}>Select Date Range</AppText>
                <TouchableOpacity onPress={() => setDatePickerModalVisible(false)}>
                  <CloseCircle />
                </TouchableOpacity>
              </View>

              <View style={styles.dateInputContainer}>
                <TouchableOpacity
                  style={[styles.dateInput, !fromDate && styles.dateInputPlaceholder]}
                  onPress={() => setShowFromDatePicker(true)}
                >
                  <Calendar color="#666" />
                  <AppText style={[styles.dateInputText, !fromDate && styles.dateInputPlaceholderText]}>
                    {fromDate ? fromDate.toLocaleDateString('en-GB') : 'From Date'}
                  </AppText>
                </TouchableOpacity>

                {Platform.OS === 'ios' && showFromDatePicker && (
                  <DateTimePicker
                    value={fromDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowFromDatePicker(false);
                      if (selectedDate) {
                        setFromDate(selectedDate);
                        if (toDate && selectedDate > toDate) {
                          setToDate(null);
                        }
                      }
                    }}
                    maximumDate={toDate || new Date()}
                  />
                )}

                {Platform.OS === 'android' && showFromDatePicker && (
                  <DateTimePicker
                    value={fromDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowFromDatePicker(false);
                      if (event.type === 'set' && selectedDate) {
                        setFromDate(selectedDate);
                        if (toDate && selectedDate > toDate) {
                          setToDate(null);
                        }
                      }
                    }}
                    maximumDate={toDate || new Date()}
                  />
                )}

                <TouchableOpacity
                  style={[styles.dateInput, !toDate && styles.dateInputPlaceholder]}
                  onPress={() => setShowToDatePicker(true)}
                >
                  <Calendar color="#666" />
                  <AppText style={[styles.dateInputText, !toDate && styles.dateInputPlaceholderText]}>
                    {toDate ? toDate.toLocaleDateString('en-GB') : 'To Date'}
                  </AppText>
                </TouchableOpacity>

                {Platform.OS === 'ios' && showToDatePicker && (
                  <DateTimePicker
                    value={toDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowToDatePicker(false);
                      if (selectedDate) {
                        setToDate(selectedDate);
                      }
                    }}
                    minimumDate={fromDate || undefined}
                    maximumDate={new Date()}
                  />
                )}

                {Platform.OS === 'android' && showToDatePicker && (
                  <DateTimePicker
                    value={toDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowToDatePicker(false);
                      if (event.type === 'set' && selectedDate) {
                        setToDate(selectedDate);
                      }
                    }}
                    minimumDate={fromDate || undefined}
                    maximumDate={new Date()}
                  />
                )}
              </View>

              <View style={styles.dateModalActions}>
                <TouchableOpacity
                  style={[styles.dateModalButton, styles.clearButton]}
                  onPress={() => {
                    setFromDate(null);
                    setToDate(null);
                    // Clear dates from filters and refresh
                    const filterParams = {
                      typeCode: filters.typeCode || [],
                      categoryCode: filters.categoryCode || [],
                      subCategoryCode: filters.subCategoryCode || [],
                      statusIds: getStatusIdsForTab(activeTab),
                      stateIds: [],
                      cityIds: [],
                      customerGroupIds: [],
                      page: 1,
                      limit: 10,
                      sortBy: '',
                      sortDirection: 'ASC',
                    };
                    dispatch(setFilters(filterParams));
                    if (activeTab === 'all') {
                      dispatch(fetchCustomersList({
                        ...filterParams,
                        isStaging: false,
                        isAll: true
                      }));
                    } else {
                      const tabStatusIds = getStatusIdsForTab(activeTab);
                      dispatch(fetchCustomersList({
                        ...filterParams,
                        isStaging: activeTab === 'waitingForApproval' || activeTab === 'rejected' || activeTab === 'draft',
                        statusIds: tabStatusIds
                      }));
                    }
                    setDatePickerModalVisible(false);
                  }}
                >
                  <AppText style={styles.clearButtonText}>Clear</AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dateModalButton, styles.applyButton, (!fromDate || !toDate) && styles.applyButtonDisabled]}
                  onPress={() => {
                    if (fromDate && toDate) {
                      // Apply date filter and refresh
                      const filterParams = {
                        typeCode: filters.typeCode || [],
                        categoryCode: filters.categoryCode || [],
                        subCategoryCode: filters.subCategoryCode || [],
                        statusIds: [], // Empty array when dates are selected
                        stateIds: filters.stateIds || [],
                        cityIds: filters.cityIds || [],
                        customerGroupIds: filters.customerGroupIds || [],
                        startDate: formatDateForAPI(fromDate),
                        endDate: formatDateForAPI(toDate),
                        page: 1,
                        limit: 10,
                        sortBy: '',
                        sortDirection: 'ASC',
                      };
                      dispatch(setFilters(filterParams));
                      if (activeTab === 'all') {
                        dispatch(fetchCustomersList({
                          ...filterParams,
                          isStaging: false,
                          isAll: true
                        }));
                      } else {
                        dispatch(fetchCustomersList({
                          ...filterParams,
                          isStaging: activeTab === 'waitingForApproval' || activeTab === 'rejected' || activeTab === 'draft',
                          statusIds: [] // Empty array when dates are selected
                        }));
                      }
                      setDatePickerModalVisible(false);
                    } else {
                      Toast.show({
                        type: 'error',
                        text1: 'Date Range Required',
                        text2: 'Please select both from and to dates',
                        position: 'top',
                      });
                    }
                  }}
                  disabled={!fromDate || !toDate}
                >
                  <AppText style={[styles.applyButtonText, (!fromDate || !toDate) && styles.applyButtonTextDisabled]}>
                    Apply
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Hidden WebView for automatic downloads */}
        {downloadWebViewUrl && (
          <WebView
            ref={downloadWebViewRef}
            source={{ html: downloadWebViewUrl }}
            style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
            onMessage={(event) => {
              const message = event.nativeEvent.data;
              if (message === 'DOWNLOAD_STARTED') {
                Toast.show({
                  type: 'success',
                  text1: 'Download Started',
                  text2: 'File is being downloaded',
                  position: 'bottom',
                });
                setTimeout(() => {
                  setDownloadWebViewUrl(null);
                }, 2000);
              } else if (message && message.startsWith('DOWNLOAD_ERROR')) {
                console.error('Download failed:', message);
                Toast.show({
                  type: 'error',
                  text1: 'Download Failed',
                  text2: 'Failed to download document. Please try again.',
                  position: 'bottom',
                });
                setDownloadWebViewUrl(null);
              }
            }}
            onShouldStartLoadWithRequest={(request) => {
              // Allow navigation to download URL
              return true;
            }}
            onLoadStart={() => {
              console.log('WebView started loading:', downloadWebViewUrl.substring(0, 100));
            }}
            onLoadEnd={() => {
              console.log('WebView finished loading');
              // Reset after a delay to allow download to start
              setTimeout(() => {
                setDownloadWebViewUrl(null);
              }, 10000);
            }}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('WebView error:', nativeEvent);
              setDownloadWebViewUrl(null);
            }}
            // Android download handler - this triggers the download manager
            onFileDownload={(request) => {


              // Show success message
              Toast.show({
                type: 'success',
                text1: 'Download Started',
                text2: 'File is being downloaded',
                position: 'bottom',
              });

              setTimeout(() => {
                setDownloadWebViewUrl(null);
              }, 3000);
            }}
          />
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
  filterButtonsContainer: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 30,
    height: 48,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexGrow: 0,
    flexShrink: 0,
  },
  filterButtonsContent: {
    paddingRight: 16,
    alignItems: 'center',
  },
  filterButtonItem: {
    paddingHorizontal: 16,
    paddingVertical: 0,
    borderRadius: 8,
    height: 40,
    marginRight: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeFilterButton: {
    backgroundColor: '#FFF2E6',
    borderColor: '#FB923C',
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#333',
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
    paddingVertical: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#999',
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

  customerNameRow: {
    gap: 2,
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "80%",     // ⬅ LEFT BLOCK TAKES 80%
    flexShrink: 1,       // ⬅ allow text to shrink
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flexShrink: 1,       // ⬅ allows truncation

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
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10
  },

  flexInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },

  infoText: {
    fontSize: 12,
    color: "#666",
    maxWidth: 80,
    flexShrink: 1,
  },
  infoIdText: {
    fontSize: 12,
    color: "#666",
    maxWidth: 80,
    flexShrink: 0,
  },
  divider: {
    marginHorizontal: 4,
    color: "#999",
  },

  customerTypeBox: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 80,
    maxWidth: 110,
    flexShrink: 0,
  },

  customerTypeText: {
    fontSize: 12,
    color: "#666",
  },

  alertIconWrap: {
    marginLeft: 4,
  },

  linkageBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    width: 40,
    justifyContent: "flex-end",
  },

  linkageText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#F57C00",
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
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
    gap: 4,
  },
  approveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',   // ⬅️ PERFECT vertical alignment
  },

  approveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,          // ⬅️ spacing between icon & text
  },


  linkDtButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
    borderColor: colors.primary,
    borderWidth: 1
  },


  linkDtButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,          // ⬅️ spacing between icon & text
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
    overflow: 'hidden',
  },
  zoomableImageWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  fullScreenPreviewContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenPreviewHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  fullScreenCloseButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  imagePreviewTouchable: {
    width: '100%',
    height: '100%',
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
  documentsListWrapper: {
    flex: 1,
    width: '100%',
  },
  documentsListDimmed: {
    opacity: 0.3,
  },
  previewOverlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewOverlayContent: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    position: 'relative',
  },
  previewContainerInModal: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
  },
  previewCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  previewCloseButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  previewScrollContainer: {
    flex: 1,
  },
  previewScrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 60,
    paddingBottom: 100,
  },
  previewImageWrapper: {
    width: '100%',
    minHeight: height * 0.65,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
  },
  previewImageContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewDocumentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  previewFileName: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },
  previewActions: {
    flexDirection: 'row',
    gap: 12,
  },
  previewActionButton: {
    padding: 8,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  dateModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  dateModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  dateModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  dateModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  dateInputContainer: {
    gap: 16,
    marginBottom: 24,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    gap: 12,
  },
  dateInputPlaceholder: {
    borderColor: '#E0E0E0',
  },
  dateInputText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  dateInputPlaceholderText: {
    color: '#999',
  },
  dateModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  dateModalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: '#fff',
  },
  clearButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: colors.primary,
  },
  applyButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  applyButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  applyButtonTextDisabled: {
    color: '#999',
  },
  tooltipText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
    backgroundColor: "#2B2B2B",
    width: "100%",
    textAlign: "center"
  },
});

export default CustomerList;