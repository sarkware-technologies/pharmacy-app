/* eslint-disable no-undef */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-dupe-keys */
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFeather from 'react-native-vector-icons/Feather';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import {
  ApproveConfirmModal,
  LinkDivisionsModal,
  TagHospitalModal,
} from '../../../components/OnboardConfirmModel';
import FilterModal from '../../../components/FilterModal';
import { customerAPI } from '../../../api/customer';
import { getDistributors, getPreferredDistributors as distributorAPI_getPreferredDistributors } from '../../../api/distributor';
import { useSelector } from 'react-redux';
import { selectCurrentCustomerId } from '../../../redux/slices/customerSlice';
import { AppText, AppInput } from '../../../components';
import { colors } from '../../../styles/colors';
import Distributors from '../../../components/icons/Distributors';
import Divisions from '../../../components/icons/Divisions';
import Field from '../../../components/icons/Field';
import CustomerHierarchy from '../../../components/icons/CustomerHierarchy';
import PermissionWrapper from '../../../utils/RBAC/permissionWrapper';
import PERMISSIONS from '../../../utils/RBAC/permissionENUM';
import checkPermission from '../../../utils/RBAC/permissionHelper';
import CloseCircle from '../../../components/icons/CloseCircle';

const { width } = Dimensions.get('window');

// Static divisions data
const mockDivisions = {
  opened: [
    { id: 1, name: 'Zesteva', code: '1023', blocked: true },
    { id: 2, name: 'BMVICTRIX SUN', code: '1046', blocked: false },
  ],
  other: [
    { id: 1, name: 'Sun Exports USA', code: '1020', selected: true },
    { id: 2, name: 'VICTRIX SUN', code: '1044', selected: true },
    { id: 3, name: 'Sun Exports USA', code: '1020', selected: false },
    { id: 4, name: 'VICTRIX SUN', code: '1044', selected: false },
    { id: 5, name: 'Sun Exports USA', code: '1020', selected: false },
    { id: 6, name: 'VICTRIX SUN', code: '1044', selected: false },
  ],
  allDivisions: [
    { id: 1, name: 'All Divisions', code: '', selected: true },
    { id: 2, name: 'VICTRIX SUN', code: '1044', selected: true },
    { id: 3, name: 'Sun Exports USA', code: '1020', selected: true },
    { id: 4, name: 'Oncology', code: '1044', selected: true },
    { id: 5, name: 'GLI', code: '1020', selected: true },
    { id: 6, name: 'Bonesta', code: '1044', selected: true },
    { id: 7, name: 'VICTRIX SUN', code: '1044', selected: true },
    { id: 8, name: 'Sun Exports USA', code: '1044', selected: true },
    { id: 9, name: 'Bonesta', code: '1044', selected: true },
  ],
};

// Static field data
const mockFieldData = [
  {
    id: 1,
    name: 'Abhishek Suryawanshi',
    code: 'SUN12345',
    designation: 'Customer executive',
  },
  { id: 2, name: 'Akshav Pawar', code: 'SUN12345', designation: 'NSM' },
  {
    id: 3,
    name: 'Sachin Patil',
    code: 'SUN12345',
    designation: 'Filed officer',
  },
  { id: 4, name: 'Rushikesh Mahajan', code: 'SUN12345', designation: 'ZSM' },
  { id: 5, name: 'Akshay Amanakar', code: 'SUN12345', designation: 'ASM' },
  {
    id: 6,
    name: 'Omkar Ankam',
    code: 'SUN12345',
    designation: 'Filed officer',
  },
  {
    id: 7,
    name: 'Vrushal Shinde',
    code: 'SUN12345',
    designation: 'Customer executive',
  },
  {
    id: 8,
    name: 'Sagar Kadam',
    code: 'SUN12345',
    designation: 'Customer executive',
  },
  {
    id: 9,
    name: 'Sanket Kulkarni',
    code: 'SUN12345',
    designation: 'Customer executive',
  },
];

export const LinkagedTab = ({
  customerType = 'Hospital',
  customerId = null,
  mappingData = null,
  hasApprovePermission = false,
  isCustomerActive = false,
  customerRequestedDivisions = [],
  instanceId = null,
  customerGroupId = null,
  instance = null,
  action = null
}) => {


  const [activeSubTab, setActiveSubTab] = useState('divisions');
  const [activeDistributorTab, setActiveDistributorTab] = useState('preferred');
  const [showDivisionModal, setShowDivisionModal] = useState(false);
  const [selectedDivisions, setSelectedDivisions] = useState(
    mockDivisions.other.filter(d => d.selected),
  );
  const [allDivisionsSelected, setAllDivisionsSelected] = useState(
    mockDivisions.allDivisions.filter(d => d.selected),
  );
  // State to track organization code selection (SPIL/SPILL) for each division
  const [divisionOrgCodes, setDivisionOrgCodes] = useState({}); // { divisionId: { SPIL: boolean, SPILL: boolean } }
  // Debounced search for All Distributors (prevents reloading whole page on each keystroke)
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const DEBOUNCE_DELAY = 400; // ms
  const searchDebounceRef = useRef(null);

  // All-distributors supply-type state & dropdown control
  const [allDistributorSupplyType, setAllDistributorSupplyType] = useState({});
  const [showAllSupplyDropdown, setShowAllSupplyDropdown] = useState({});





  // Helper function to format mapping items - preserve existing isApproved: true values
  const formatMappingItemApprove = (mappingItem, isBeingApproved) => {
    const formatted = {
      id: Number(mappingItem.id || mappingItem.customerId),
      isNew: mappingItem.isNew !== undefined ? mappingItem.isNew : false,
      cityId: mappingItem.cityId ? String(mappingItem.cityId) : (mappingItem.cityId || ''),
      typeId: mappingItem.typeId !== undefined ? Number(mappingItem.typeId) : (mappingItem.typeId || null),
      stateId: mappingItem.stateId ? String(mappingItem.stateId) : (mappingItem.stateId || ''),
      cityName: mappingItem.cityName || '',
      stateName: mappingItem.stateName || '',
      categoryId: mappingItem.categoryId !== undefined ? Number(mappingItem.categoryId) : (mappingItem.categoryId || null),
      stationCode: mappingItem.stationCode || '',
      customerCode: mappingItem.customerCode || '',
      customerName: mappingItem.customerName || '',
      subCategoryId: mappingItem.subCategoryId !== undefined ? Number(mappingItem.subCategoryId) : (mappingItem.subCategoryId || 0),
      action: 'APPROVE',
    };

    // Handle isApproved: preserve existing true values, set true for item being approved
    if (isBeingApproved) {
      // Item being approved gets isApproved: true
      formatted.isApproved = true;
    } 
    
    
    if (mappingItem.hasOwnProperty('isApproved') ) {
      // Preserve existing isApproved: true for other items
      formatted.isApproved = mappingItem.isApproved;
    }
    // If item doesn't have isApproved or it's false, don't include the property

    return formatted;
  };

  // Helper function to format mapping items for reject - preserve existing isApproved: true values
  const formatMappingItemReject = (mappingItem, isBeingRejected) => {
    const formatted = {
      id: Number(mappingItem.id || mappingItem.customerId),
      isNew: mappingItem.isNew !== undefined ? mappingItem.isNew : false,
      cityId: mappingItem.cityId ? String(mappingItem.cityId) : (mappingItem.cityId || ''),
      typeId: mappingItem.typeId !== undefined ? Number(mappingItem.typeId) : (mappingItem.typeId || null),
      stateId: mappingItem.stateId ? String(mappingItem.stateId) : (mappingItem.stateId || ''),
      cityName: mappingItem.cityName || '',
      stateName: mappingItem.stateName || '',
      categoryId: mappingItem.categoryId !== undefined ? Number(mappingItem.categoryId) : (mappingItem.categoryId || null),
      stationCode: mappingItem.stationCode || '',
      customerCode: mappingItem.customerCode || '',
      customerName: mappingItem.customerName || '',
      subCategoryId: mappingItem.subCategoryId !== undefined ? Number(mappingItem.subCategoryId) : (mappingItem.subCategoryId || 0),
      action: 'APPROVE',
    };

    // Handle isActive: set false for rejected items, preserve existing for others
    if (isBeingRejected) {
      // Rejected item gets isActive: false
      formatted.isApproved = false;
    } 
    
    if (mappingItem.hasOwnProperty('isApproved')) {
      // Preserve existing isActive value for other items
      formatted.isApproved = mappingItem.isApproved;
    }

    // Handle isApproved: preserve existing true values, don't set for rejected item
    if (isBeingRejected) {
      // Rejected item doesn't get isApproved (or gets false)
      // Don't include isApproved property for rejected items
    } else if (mappingItem.hasOwnProperty('isApproved') && mappingItem.isApproved === true) {
      // Preserve existing isApproved: true for other items
      formatted.isApproved = true;
    }

    return formatted;
  };


  const toggleAllSupplyDropdown = distributorId => {
    setShowAllSupplyDropdown(prev => ({
      ...prev,
      [distributorId]: !prev[distributorId],
    }));
  };

  const handleAllDistributorSupplySelect = (distributorId, value) => {
    setAllDistributorSupplyType(prev => ({
      ...prev,
      [distributorId]: value,
    }));
    setShowAllSupplyDropdown(prev => ({
      ...prev,
      [distributorId]: false,
    }));
  };

  // update debouncedSearch after a pause in typing
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchText.trim());
    }, DEBOUNCE_DELAY);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchText]);

  const loggedInUser = useSelector(state => state.auth.user);
  const reduxCustomerId = useSelector(selectCurrentCustomerId);
  const selectedCustomer = useSelector(state => state.customer.selectedCustomer);
  const effectiveCustomerId = reduxCustomerId || customerId;

  // Get instanceId from customerDetails response (selectedCustomer from Redux)
  // Priority: selectedCustomer.instaceId > selectedCustomer.instanceId > prop instanceId

  const instanceIdFromDetails = selectedCustomer?.instaceId || selectedCustomer?.instanceId || instanceId;

  // Permission state for Other Division Section
  const [hasOtherDivisionPermission, setHasOtherDivisionPermission] = useState(true);
  const [hasPreferredDistributorPermission, setHasPreferredDistributorPermission] = useState(true);
  const [hasAllDistributorPermission, setHasAllDistributorPermission] = useState(true);

  // Check permission on mount
  useEffect(() => {
    const checkPermissions = async () => {
      const [
        hasOtherDivision,
        hasPreferredDistributor,
        hasAllDistributor,
      ] = await Promise.all([
        checkPermission(PERMISSIONS.ONBOARDING_LINKAGE_PAGE_DIVISION_OTHER_DIVISION_SECTION),
        checkPermission(PERMISSIONS.ONBOARDING_LINKAGE_PAGE_DISTRIBUTOR_PREFERRED_DISTRIBUTOR_PAGE_VIEW),
        checkPermission(PERMISSIONS.ONBOARDING_LINKAGE_PAGE_DISTRIBUTOR_ALL_DISTRIBUTOR_PAGE_VIEW),
      ]);

      setHasOtherDivisionPermission(hasOtherDivision);
      setHasPreferredDistributorPermission(hasPreferredDistributor);
      setHasAllDistributorPermission(hasAllDistributor);

      // Ensure activeDistributorTab always points to a visible tab
      setActiveDistributorTab(prev => {
        if (prev === 'preferred' && !hasPreferredDistributor) {
          if (hasAllDistributor) return 'all';
          return 'linked';
        }
        if (prev === 'all' && !hasAllDistributor) {
          if (hasPreferredDistributor) return 'preferred';
          return 'linked';
        }
        return prev;
      });
    };
    checkPermissions();
  }, []);

  // Helper function to fetch latest draft and populate divisions and distributors
  const fetchLatestDraftData = useCallback(async () => {

    // Only fetch if instanceId is available

    if (!instanceIdFromDetails) {
      // If no instanceId, just use the prop divisions
      setMergedRequestedDivisions(customerRequestedDivisions);
      return;
    }

    const actorId = loggedInUser?.userId || loggedInUser?.id;
    if (!actorId) {
      // If no actorId, just use the prop divisions
      setMergedRequestedDivisions(customerRequestedDivisions);
      return;
    }

    // For active customers, try to fetch latest-draft even if instance is empty
    // as they might have instanceId from stageId[0]
    // Check customerCode (not null) or statusName === 'ACTIVE'
    const isActiveCustomer = selectedCustomer?.customerCode != null || selectedCustomer?.statusName === 'ACTIVE';

    if (Object.keys(instance).length !== 0) {
      try {
        const response = await customerAPI.getLatestDraft(instanceIdFromDetails, actorId);

        if (response?.data?.success && response?.data?.hasDraft && response?.data?.draftEdits) {
          const draftEdits = response.data.draftEdits;

          // Handle divisions from draft
          if (draftEdits.divisions && Array.isArray(draftEdits.divisions)) {
            const draftDivisions = draftEdits.divisions;

            // Merge draft divisions with existing customerRequestedDivisions
            // Create a map of existing divisions by divisionId to avoid duplicates
            const existingDivisionsMap = new Map();
            customerRequestedDivisions.forEach(div => {
              const key = String(div.divisionId || div.id);
              existingDivisionsMap.set(key, div);
            });

            // Add draft divisions that don't already exist
            draftDivisions.forEach(draftDiv => {
              const key = String(draftDiv.divisionId);
              if (!existingDivisionsMap.has(key)) {
                // Format draft division to match the structure of customerRequestedDivisions
                existingDivisionsMap.set(key, {
                  divisionId: draftDiv.divisionId,
                  divisionCode: draftDiv.divisionCode,
                  divisionName: draftDiv.divisionName,
                  isOpen: draftDiv.isOpen || false,
                });
              }
            });

            // Convert map back to array
            const merged = Array.from(existingDivisionsMap.values());
            setMergedRequestedDivisions(merged);
          } else {
            // No divisions in draft, use prop divisions
            setMergedRequestedDivisions(customerRequestedDivisions);
          }

          // Handle distributors from draft - set as linked distributors
          // ONLY use distributors from latest-draft response for linked distributors
          if (draftEdits.distributors && Array.isArray(draftEdits.distributors)) {
            const draftDistributors = draftEdits.distributors;
            setLinkedDistributorsData(draftDistributors);
          } else {
            // If no distributors in draft, clear linked distributors
            setLinkedDistributorsData([]);
          }

          // Handle mapping data from draft - merge with customerDetails mapping
          if (draftEdits.mapping) {
            const draftMapping = draftEdits.mapping;
            const customerMapping = mappingData || {};

            // Helper function to merge mapping arrays
            // Items in draft mapping take precedence, and we preserve isApproved status
            // Only include isApproved if it exists in either customer mapping or draft mapping
            const mergeMappingArray = (draftArray, customerArray) => {
              const mergedMap = new Map();

              // First, add all items from customer mapping (base data)
              (customerArray || []).forEach(item => {
                const key = String(item.id || item.customerId);
                mergedMap.set(key, { ...item });
              });

              // Then, update/add items from draft mapping (draft takes precedence)
              (draftArray || []).forEach(item => {
                const key = String(item.id || item.customerId);
                const existing = mergedMap.get(key);
                if (existing) {
                  // Merge existing with draft data (draft properties take precedence)
                  const merged = {
                    ...existing,
                    ...item
                  };

                  // Handle isApproved: only include if it exists in either source
                  // Don't add isApproved: false if it doesn't exist in either
                  const hasIsApprovedInDraft = item.hasOwnProperty('isApproved');
                  const hasIsApprovedInCustomer = existing.hasOwnProperty('isApproved');

                  if (hasIsApprovedInDraft) {
                    // isApproved exists in draft mapping - use draft value
                    merged.isApproved = item.isApproved;
                  } else if (hasIsApprovedInCustomer) {
                    // isApproved exists in customer mapping but not in draft - preserve customer value
                    merged.isApproved = existing.isApproved;
                  } else {
                    // Neither has isApproved - explicitly remove it to avoid false values
                    delete merged.isApproved;
                  }

                  mergedMap.set(key, merged);
                } else {
                  // Add new item from draft
                  const newItem = { ...item };
                  // Only keep isApproved if it exists in the draft item
                  if (!item.hasOwnProperty('isApproved')) {
                    delete newItem.isApproved;
                  }
                  mergedMap.set(key, newItem);
                }
              });

              return Array.from(mergedMap.values());
            };

            // Merge all mapping arrays
            const mergedMapping = {
              hospitals: mergeMappingArray(draftMapping.hospitals, customerMapping.hospitals),
              doctors: mergeMappingArray(draftMapping.doctors, customerMapping.doctors),
              pharmacy: mergeMappingArray(draftMapping.pharmacy, customerMapping.pharmacy),
              groupHospitals: mergeMappingArray(draftMapping.groupHospitals, customerMapping.groupHospitals),
            };

            setHierarchyMappingData(mergedMapping);
          } else if (mappingData) {
            // If no draft mapping, use customer mapping
            setHierarchyMappingData(mappingData);
          }
        } else {
          // No draft, use prop divisions
          setMergedRequestedDivisions(customerRequestedDivisions);
          // Also set mapping data from props if available
          if (mappingData) {
            setHierarchyMappingData(mappingData);
          }
        }
      } catch (error) {
        // On error, just use the prop divisions
        setMergedRequestedDivisions(customerRequestedDivisions);
      }
    }





  }, [instanceIdFromDetails, loggedInUser?.userId, loggedInUser?.id, instanceId, customerRequestedDivisions, instance, mappingData, selectedCustomer?.statusName, selectedCustomer?.customerCode]);

  // Legacy function name for backward compatibility
  const fetchAndMergeDraftDivisions = fetchLatestDraftData;

  // Fetch latest draft and merge divisions with requested divisions on mount/update
  useEffect(() => {
    fetchLatestDraftData();
  }, [fetchLatestDraftData]);

  // Note: Linked distributors are fetched from latest-draft API only
  // No need to fetch separately - latest-draft is the source of truth
  // The linkedDistributorIds Set is updated when linkedDistributorsData changes

  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showLinkDivisionsModal, setShowLinkDivisionsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);


  // Customer Hierarchy states
  const [activeHierarchyTab, setActiveHierarchyTab] = useState('pharmacies');
  const [hierarchyMappingData, setHierarchyMappingData] = useState(null);
  const [expandedHospitals, setExpandedHospitals] = useState({});
  const [expandedGroupHospitals, setExpandedGroupHospitals] = useState({});
  const [activeGroupHospitalTab, setActiveGroupHospitalTab] = useState({});

  // Toast states
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Field team states
  const [fieldTeamData, setFieldTeamData] = useState([]);
  const [fieldTeamLoading, setFieldTeamLoading] = useState(false);
  const [fieldTeamError, setFieldTeamError] = useState(null);
  const [fieldTeamPage, setFieldTeamPage] = useState(1);
  const [fieldTeamHasMore, setFieldTeamHasMore] = useState(true);
  const [fieldTeamLoadingMore, setFieldTeamLoadingMore] = useState(false);

  // Distributors states
  const [allDistributorsData, setAllDistributorsData] = useState([]);
  const [filteredDistributorsData, setFilteredDistributorsData] = useState([]);
  const [preferredDistributorsData, setPreferredDistributorsData] = useState(
    [],
  );
  const [linkedDistributorsData, setLinkedDistributorsData] = useState([]);
  const [distributorsLoading, setDistributorsLoading] = useState(false);
  const [distributorsError, setDistributorsError] = useState(null);

  // State for linked distributor organization codes (SPLL/SPIL)
  const [linkedDistributorOrgCodes, setLinkedDistributorOrgCodes] = useState({}); // { distributorId: 'SPLL' | 'SPIL' }
  // State for linked distributor margins
  const [linkedDistributorMargins, setLinkedDistributorMargins] = useState({}); // { distributorId: marginValue }
  // State for linked distributor supply modes (1 = chargeback, else net rate)
  const [linkedDistributorSupplyModes, setLinkedDistributorSupplyModes] = useState({}); // { distributorId: '1' | '0' }
  // State for organization code dropdown visibility
  const [showLinkedOrgCodeDropdown, setShowLinkedOrgCodeDropdown] = useState({}); // { distributorId: boolean }
  // State for "All Divisions" dropdown visibility
  const [showAllDivisionsDropdown, setShowAllDivisionsDropdown] = useState({}); // { distributorId: boolean }
  // State for selected divisions for each linked distributor
  const [linkedDistributorSelectedDivisions, setLinkedDistributorSelectedDivisions] = useState({}); // { distributorId: [divisionId1, divisionId2, ...] }

  // Filter states for distributors
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [distributorFilters, setDistributorFilters] = useState({
    state: [],
    city: [],
  });

  // Preferred distributors mode and selection
  const [preferredViewMode, setPreferredViewMode] = useState('selection'); // 'selection' or 'edit'
  const [selectedDistributors, setSelectedDistributors] = useState([]);
  const [preferredSearchText, setPreferredSearchText] = useState('');
  const [linkingDistributors, setLinkingDistributors] = useState(false);
  const [distributorMargins, setDistributorMargins] = useState({});
  const [addMoreSearchText, setAddMoreSearchText] = useState('');

  // Distributor dropdown states
  const [distributorRateType, setDistributorRateType] = useState({});
  const [distributorDivision, setDistributorDivision] = useState({});
  const [showRateTypeDropdown, setShowRateTypeDropdown] = useState({});
  const [showDivisionDropdown, setShowDivisionDropdown] = useState({});

  // Divisions states
  const [openedDivisionsData, setOpenedDivisionsData] = useState([]);
  const [otherDivisionsData, setOtherDivisionsData] = useState([]);
  const [divisionsLoading, setDivisionsLoading] = useState(false);
  const [divisionsError, setDivisionsError] = useState(null);
  const [linkingDivisions, setLinkingDivisions] = useState(false);
  const [blockingDivision, setBlockingDivision] = useState(null); // Track which division is being blocked/unblocked
  // Merged requested divisions (combining prop divisions with draft divisions)
  const [mergedRequestedDivisions, setMergedRequestedDivisions] = useState(customerRequestedDivisions);

  // Flags to track if data has been fetched for each tab
  const [divisionsDataFetched, setDivisionsDataFetched] = useState(false);
  const [distributorsDataFetched, setDistributorsDataFetched] = useState(false);
  const [fieldDataFetched, setFieldDataFetched] = useState(false);
  const [hierarchyDataFetched, setHierarchyDataFetched] = useState(false);

  // Ref to track if we need to fetch preferred distributors on distributors tab activation
  const shouldFetchPreferredDistributorsRef = useRef(false);

  // Filter otherDivisionsData to exclude divisions that are already in mergedRequestedDivisions
  // This ensures divisions moved to "Requested" don't appear in "Other" column
  const filteredOtherDivisionsData = useMemo(() => {
    if (!mergedRequestedDivisions || mergedRequestedDivisions.length === 0) {
      return otherDivisionsData;
    }

    // Create a Set of division IDs that are in mergedRequestedDivisions
    const requestedDivisionIds = new Set(
      mergedRequestedDivisions.map(div => String(div.divisionId || div.id))
    );

    // Filter out divisions that are already in requested divisions
    return otherDivisionsData.filter(div => {
      const divisionId = String(div.divisionId || div.id);
      return !requestedDivisionIds.has(divisionId);
    });
  }, [otherDivisionsData, mergedRequestedDivisions]);

  // Tab scroll ref for centering active tab
  const tabScrollRef = useRef(null);
  const tabRefs = useRef({});

  const distributorTabScrollRef = useRef(null);
  const distributorTabRefs = useRef({});

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);

    setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };

  const handleTabPress = async tabName => {

    // First reset the list and set active tab
    setActiveSubTab(tabName);

    // Fetch latest draft data when LinkagedTab is clicked/visible
    // This populates requested divisions and linked distributors from draft

    if (!instanceIdFromDetails) {
      await fetchLatestDraftData();
    }
    // Fetch data based on the tab clicked
    if (tabName === 'divisions') {
      await fetchDivisionsData();
    } else if (tabName === 'distributors' && !distributorsDataFetched) {
      // Note: linked distributors are already set from latest-draft API above
      // Latest-draft is the ONLY source for linked distributors data
      // Mark as fetched and set flag to trigger fetch
      setDistributorsDataFetched(true);
      shouldFetchPreferredDistributorsRef.current = true;
    } else if (tabName === 'field' && !fieldDataFetched) {


      // Reset pagination when switching to field tab
      setFieldTeamPage(1);
      setFieldTeamHasMore(true);
      await fetchFieldTeamData(1, false);
    } else if (tabName === 'hierarchy' && !hierarchyDataFetched) {
      // Hierarchy uses mappingData prop, just mark as fetched
      setHierarchyDataFetched(true);
    }

    // Scroll the tab into visible area after a small delay to ensure layout is ready
    setTimeout(() => {
      if (tabRefs.current[tabName] && tabScrollRef.current) {
        tabRefs.current[tabName].measureLayout(
          tabScrollRef.current.getNode
            ? tabScrollRef.current.getNode()
            : tabScrollRef.current,
          (x, y, w, h) => {
            const screenWidth = Dimensions.get('window').width;
            // Center the tab in the screen
            const scrollX = x - screenWidth / 2 + w / 2;

            tabScrollRef.current?.scrollTo({
              x: Math.max(0, scrollX),
              animated: true,
            });
          },
          () => {
          },
        );
      }
    }, 100);
  };

  const handleDistributorTabPress = tabName => {
    setActiveDistributorTab(tabName);

    // Fetch data when switching distributor sub-tabs (only if distributors main tab is active)
    if (activeSubTab === 'distributors' && distributorsDataFetched) {
      if (tabName === 'preferred') {
        fetchPreferredDistributorsData();
      } else if (tabName === 'linked') {
        // Note: Linked distributors come from latest-draft API only, no separate fetch needed
        // Data is already set by fetchLatestDraftData() when tab is clicked
      } else if (tabName === 'all') {
        fetchDistributorsData();
      }
    }

    setTimeout(() => {
      if (
        distributorTabRefs.current[tabName] &&
        distributorTabScrollRef.current
      ) {
        distributorTabRefs.current[tabName].measureLayout(
          distributorTabScrollRef.current.getNode
            ? distributorTabScrollRef.current.getNode()
            : distributorTabScrollRef.current,
          (x, y, w, h) => {
            const screenWidth = Dimensions.get('window').width;
            const scrollX = x - screenWidth / 2 + w / 2;

            distributorTabScrollRef.current.scrollTo({
              x: Math.max(0, scrollX),
              animated: true,
            });
          },
          () => {
          },
        );
      }
    }, 100);
  };


  // Get linked distributor IDs to filter them out from preferred and all distributors
  // Create a Set of linked distributor IDs for efficient filtering
  // This ensures linked distributors are excluded from Preferred and All lists
  const linkedDistributorIds = useMemo(() => {
    const ids = (linkedDistributorsData || []).map(linked => {
      // Handle both 'id' and 'distributorId' fields, convert to string
      const id = linked.id || linked.distributorId;
      return id != null ? String(id) : null;
    }).filter(id => id && id !== 'undefined' && id !== 'null' && id !== '');

    return new Set(ids);
  }, [linkedDistributorsData]);

  // derived local filter for Preferred Distributors (client-side search)
  // Also filters out linked distributors to ensure they don't appear in Preferred list
  const filteredPreferredDistributors = useMemo(() => {
    // First, filter out linked distributors
    let filtered = (preferredDistributorsData || []).filter(d => {
      const distributorId = d.id || d.distributorId;
      const idString = distributorId != null ? String(distributorId) : '';
      const isLinked = idString && linkedDistributorIds.has(idString);
      return !isLinked;
    });

    // Then apply search filter
    const q = (preferredSearchText || '').trim().toLowerCase();
    if (!q) return filtered;

    return filtered.filter(d => {
      const name = (d.name || '').toLowerCase();
      const code = (d.code || '').toLowerCase();
      const city = (d.cityName || d.city || '').toLowerCase();
      // match on name, code or city (you can add other fields if needed)
      return name.includes(q) || code.includes(q) || city.includes(q);
    });
  }, [preferredSearchText, preferredDistributorsData, linkedDistributorIds]);




  const fetchDivisionsData = useCallback(async () => {


    setDivisionsLoading(true);
    setDivisionsError(null);

    // Safe defaults
    let customerDivisionsResponse = { data: [] };
    let allDivisionsResponse = { data: { divisions: [] } };

    try {
      // ------------------------------------
      // Determine customer state
      // ------------------------------------
      const isPendingCustomer = selectedCustomer?.statusName === 'PENDING';
      const hasCustomerCode =
        selectedCustomer?.customerCode !== null &&
        selectedCustomer?.customerCode !== '';



      const isActiveCustomer =
        !isPendingCustomer &&
        (hasCustomerCode || selectedCustomer?.statusName === 'ACTIVE');

      // ------------------------------------
      // 1️⃣ Have Customer Code → fetch opened divisions
      // ------------------------------------
      if (customerId && effectiveCustomerId) {
        try {
          customerDivisionsResponse =
            await customerAPI.getCustomerDivisions(effectiveCustomerId);
        } catch (err) {
          console.error('getCustomerDivisions failed:', err);
          customerDivisionsResponse = { data: [] }; // fallback
        }
      }

      // ------------------------------------
      // 2️⃣ Instance exists → fetch all divisions
      // ------------------------------------
      if (instance && Object.keys(instance).length > 0) {
        try {
          allDivisionsResponse = await customerAPI.getAllDivisions();
        } catch (err) {
          console.error('getAllDivisions failed:', err);
          allDivisionsResponse = { data: { divisions: [] } }; // fallback
        }
      }

      // ------------------------------------
      // Opened divisions (hasCustomerCode only)
      // ------------------------------------
      const openedDivisions = customerId &&
        Array.isArray(customerDivisionsResponse.data)
        ? customerDivisionsResponse.data
        : [];

      // ------------------------------------
      // Other divisions (from all divisions)
      // ------------------------------------
      const allDivisions = Array.isArray(
        allDivisionsResponse?.data?.divisions,
      )
        ? allDivisionsResponse.data.divisions
        : [];

      const linkedDivisionIds = openedDivisions.map(d =>
        Number(d.divisionId),
      );

      const otherDivisions = allDivisions.filter(
        d => !linkedDivisionIds.includes(Number(d.divisionId)),
      );

      // ------------------------------------
      // FINAL STATE SETTING (VERY IMPORTANT)
      // ------------------------------------
      if (customerId) {
        // ✅ ACTIVE customer
        setOpenedDivisionsData(openedDivisions);

        // ❌ No requested divisions for active customer
        setMergedRequestedDivisions([]);
      } else {
        // ❌ NON-ACTIVE / PENDING customer
        setOpenedDivisionsData([]);
        // requested divisions handled elsewhere (draft / props)
      }

      setOtherDivisionsData(otherDivisions);
      setDivisionsDataFetched(true);

    } catch (err) {
      // Only unexpected JS errors reach here
      setDivisionsError(err.message);
      setOpenedDivisionsData([]);
      setOtherDivisionsData([]);
      setMergedRequestedDivisions([]);
    } finally {
      setDivisionsLoading(false);
    }
  }, [effectiveCustomerId, instance, selectedCustomer]);



  // Fetch divisions data on component mount (since it's the default tab)
  // Also trigger when customerCode or statusName changes for active customers
  useEffect(() => {
    fetchDivisionsData();
  }, [fetchDivisionsData, selectedCustomer?.action, selectedCustomer?.statusName, selectedCustomer?.customerCode]);

  // Function to fetch field team data
  const fetchFieldTeamData = useCallback(async (page = 1, loadMore = false) => {

    // Determine isStaging based on customer status
    // If customer is active (customerCode not null or statusName === 'ACTIVE'), isStaging=false, else isStaging=true
    const isStaging = customerId ? false : true;

    try {
      if (loadMore) {
        setFieldTeamLoadingMore(true);
      } else {
        setFieldTeamLoading(true);
        setFieldTeamError(null);
      }



      const response = await customerAPI.getFieldList(page, 10, customerId || selectedCustomer?.stgCustomerId, isStaging);

      if (response?.data) {
        // Extract data from response - could be in different formats
        const newData = response.data.data || response.data.companyUsers || response.data.fieldList || response.data || [];

        if (loadMore) {
          // Append new data to existing data
          setFieldTeamData(prev => [...prev, ...newData]);
        } else {
          // Replace data for first load
          setFieldTeamData(newData);
          setFieldDataFetched(true);
        }

        // Check if there's more data to load
        // If we got a full page (10 items), there might be more
        const hasMore = Array.isArray(newData) && newData.length === 10;
        setFieldTeamHasMore(hasMore);

        if (hasMore) {
          setFieldTeamPage(page + 1);
        } else {
          setFieldTeamHasMore(false);
        }
      } else {
        if (!loadMore) {
          setFieldTeamData([]);
          setFieldDataFetched(true);
        }
        setFieldTeamHasMore(false);
      }
    } catch (error) {
      if (!loadMore) {
        setFieldTeamError(error.message);
        setFieldTeamData([]);
      }
      setFieldTeamHasMore(false);
    } finally {
      if (loadMore) {
        setFieldTeamLoadingMore(false);
      } else {
        setFieldTeamLoading(false);
      }
    }
  }, [effectiveCustomerId, selectedCustomer?.statusName, selectedCustomer?.customerCode]);

  // Process and log mapping data from customer details API
  // Note: This is now handled in fetchLatestDraftData to merge with draft mapping
  // Only set if fetchLatestDraftData hasn't been called yet or if there's no draft
  useEffect(() => {
    // Only set if hierarchyMappingData is null (not yet set by fetchLatestDraftData)
    if (mappingData && !hierarchyMappingData) {
      setHierarchyMappingData(mappingData);
    }
  }, [mappingData, hierarchyMappingData]);

  // Function to fetch preferred distributors
  const fetchPreferredDistributorsData = useCallback(async () => {
    if (activeDistributorTab !== 'preferred' || !effectiveCustomerId) {
      return;
    }

    try {
      setDistributorsLoading(true);
      setDistributorsError(null);

      // Get stationCode from loggedInUser
      const stationCode = loggedInUser?.stationCode ||
        loggedInUser?.userDetails?.stationCodes?.[0]?.stationCode ||
        loggedInUser?.userDetails?.stationCode ||
        '';

      // Extract divisionIds from mergedRequestedDivisions
      // Ensure we get all divisionIds from the requested divisions
      const divisionIds = (mergedRequestedDivisions || [])
        .map(div => {
          // Try divisionId first, then id, handle both string and number
          const id = div.divisionId || div.id;
          return id != null ? String(id) : null;
        })
        .filter(id => id != null && id !== '' && id !== 'undefined');

      // Call API to get preferred distributors
      const response = await distributorAPI_getPreferredDistributors(
        1, // page
        20, // limit
        stationCode,
        divisionIds,
      );

      if (response?.distributors && Array.isArray(response.distributors)) {
        // Filter out linked distributors before setting the data
        // Use the linkedDistributorIds Set which is already computed and memoized
        const filteredDistributors = response.distributors.filter(distributor => {
          const distributorId = String(distributor.id || distributor.distributorId || '');
          return !linkedDistributorIds.has(distributorId);
        });
        setPreferredDistributorsData(filteredDistributors);
      } else {
        setPreferredDistributorsData([]);
      }
    } catch (error) {

      setDistributorsError(error.message);
      setPreferredDistributorsData([]);
    } finally {
      setDistributorsLoading(false);
    }
  }, [activeDistributorTab, effectiveCustomerId, loggedInUser, mergedRequestedDivisions, linkedDistributorIds]);

  // Fetch preferred distributors when Preferred tab is active (only if distributors tab is already active)
  useEffect(() => {

    if (
      activeSubTab === 'distributors' &&
      distributorsDataFetched &&
      activeDistributorTab === 'preferred' &&
      effectiveCustomerId &&
      shouldFetchPreferredDistributorsRef.current
    ) {
      shouldFetchPreferredDistributorsRef.current = false; // Reset flag
      fetchPreferredDistributorsData();
    } else {

    }
  }, [activeDistributorTab, activeSubTab, distributorsDataFetched, effectiveCustomerId, fetchPreferredDistributorsData]);

  // Function to fetch linked distributors using distributor/list API with divisionIds
  // This function can be called regardless of which distributor sub-tab is active
  const fetchLinkedDistributorsData = async () => {
    // Fetch only when Linked tab is active
    if (activeDistributorTab !== 'linked') {
      return;
    }

    // Extract valid division IDs
    const divisionIds = (openedDivisionsData || [])
      .map(div => String(div.divisionId || div.id))
      .filter(id => id && id !== 'undefined' && id !== 'null');

    // No divisions → clear data
    if (divisionIds.length === 0) {

      setLinkedDistributorsData([]);
      return;
    }

    try {
      setDistributorsLoading(true);
      setDistributorsError(null);

      // API call for linked distributors
      const response = await customerAPI.getLinkedDistributorDivisions(
        customerId
      );



      if (response?.data?.customer?.distributorDetails && Array.isArray(response?.data?.customer?.distributorDetails)) {
        setLinkedDistributorsData(response?.data?.customer?.distributorDetails);
      } else {
        setLinkedDistributorsData([]);
      }
    } catch (error) {
      setDistributorsError(error.message);
      setLinkedDistributorsData([]);
    } finally {
      setDistributorsLoading(false);
    }
  };


  // Note: Linked distributors come from latest-draft API only
  // No separate fetch needed - data is set by fetchLatestDraftData() when tab is clicked

  // Function to fetch all distributors
  const fetchDistributorsData = useCallback(async () => {
    if (activeDistributorTab !== 'all') {
      return;
    }



    try {
      setDistributorsLoading(true);
      setDistributorsError(null);

      // Call API to get all distributors with pagination (search uses debouncedSearch)
      const response = await getDistributors(1, 100, debouncedSearch);

      if (response?.distributors && Array.isArray(response.distributors)) {
        // Filter out linked distributors before setting the data
        // Use the linkedDistributorIds Set which is already computed and memoized
        const filteredDistributors = response.distributors.filter(distributor => {
          const distributorId = String(distributor.id || distributor.distributorId || '');
          return !linkedDistributorIds.has(distributorId);
        });

        setAllDistributorsData(filteredDistributors);
        setFilteredDistributorsData(filteredDistributors);
      } else {
        setAllDistributorsData([]);
        setFilteredDistributorsData([]);
      }
    } catch (error) {
      setDistributorsError(error.message);
      setAllDistributorsData([]);
      setFilteredDistributorsData([]);
    } finally {
      setDistributorsLoading(false);
    }
  }, [activeDistributorTab, debouncedSearch, linkedDistributorIds]);

  // Fetch all distributors when All tab is active (only if distributors tab is already active)
  useEffect(() => {
    if (activeSubTab === 'distributors' && distributorsDataFetched && activeDistributorTab === 'all') {
      fetchDistributorsData();
    }
  }, [activeDistributorTab, activeSubTab, distributorsDataFetched, fetchDistributorsData]);


  useEffect(() => {

    if (
      customerId &&
      activeSubTab === 'distributors' &&
      activeDistributorTab === 'linked'
    ) {


      fetchLinkedDistributorsData();
    }
  }, [activeDistributorTab, activeSubTab, customerId, mergedRequestedDivisions]);

  // Apply filters to distributors (also filters out linked distributors)
  useEffect(() => {
    if (allDistributorsData.length === 0) {
      setFilteredDistributorsData([]);
      return;
    }

    // First, filter out linked distributors to ensure they don't appear in All list
    let filtered = allDistributorsData.filter(distributor => {
      const distributorId = distributor.id || distributor.distributorId;
      const idString = distributorId != null ? String(distributorId) : '';
      const isLinked = idString && linkedDistributorIds.has(idString);
      return !isLinked;
    });

    // Apply state filter
    if (
      distributorFilters.state.length > 0 &&
      !distributorFilters.state.includes('All')
    ) {
      filtered = filtered.filter(distributor =>
        distributorFilters.state.includes(distributor.stateName),
      );
    }

    // Apply city filter
    if (
      distributorFilters.city.length > 0 &&
      !distributorFilters.city.includes('All')
    ) {
      filtered = filtered.filter(distributor =>
        distributorFilters.city.includes(distributor.cityName),
      );
    }

    setFilteredDistributorsData(filtered);
  }, [allDistributorsData, distributorFilters, linkedDistributorIds]);

  const handleFilterApply = filters => {
    setDistributorFilters({
      state: filters.state || [],
      city: filters.city || [],
    });
  };

  const toggleDistributorSelection = distributorId => {
    setSelectedDistributors(prev => {
      if (prev.includes(distributorId)) {
        return prev.filter(id => id !== distributorId);
      } else {
        return [...prev, distributorId];
      }
    });
  };

  const handleContinueToEdit = () => {
    if (selectedDistributors.length > 0) {
      setPreferredViewMode('edit');
    } else {
      showToast('Please select at least one distributor', 'error');
    }
  };

  // Check if all required fields are filled for linking
  const isLinkButtonDisabled = () => {
    if (linkingDistributors) return true;

    const selectedDists = preferredDistributorsData.filter(d =>
      selectedDistributors.includes(d.id),
    );

    for (const distributor of selectedDists) {
      // Check if margin is filled
      if (
        !distributorMargins[distributor.id] ||
        distributorMargins[distributor.id] === ''
      ) {
        return true;
      }

      // Check if rate type is selected (Net Rate or Chargeback)
      if (
        !distributorRateType[distributor.id] ||
        (distributorRateType[distributor.id] !== 'Net Rate' &&
          distributorRateType[distributor.id] !== 'Chargeback')
      ) {
        return true;
      }
    }

    return false;
  };


  const handleApprove = item => {
    setSelectedItem(item);
    setShowApproveModal(true);
  };

  const handleReject = item => {
    setSelectedItem(item);
    setShowRejectModal(true);
  };

  const handleApproveConfirm = async comment => {
    try {
      const workflowId = selectedItem?.workflowId || selectedItem?.id;
      const actorId = loggedInUser?.userId || loggedInUser?.id;

      const actionData = {
        stepOrder: 3,
        parallelGroup: 1,
        actorId: actorId,
        action: 'APPROVE',
        comments: comment || 'Approved',
        actionData: {},
      };


      const response = await customerAPI.workflowAction(workflowId, actionData);

      setShowApproveModal(false);
      showToast(`${selectedItem?.name} approved successfully!`, 'success');
      setSelectedItem(null);
    } catch (error) {
      console.error('Error approving:', error);
      setShowApproveModal(false);
      showToast(`Failed to approve: ${error.message}`, 'error');
      setSelectedItem(null);
    }
  };

  // Handle approve for customer hierarchy items (hospitals, doctors, pharmacies, group hospitals)
  const handleHierarchyApprove = async (item, itemType) => {
    try {

      // Get instanceId from customerDetails response (selectedCustomer from Redux)
      const effectiveInstanceId = instanceIdFromDetails;

      if (!effectiveInstanceId) {
        showToast('Instance ID not available', 'error');
        return;
      }

      const actorId = loggedInUser?.userId || loggedInUser?.id;
      if (!actorId) {
        showToast('User ID not available', 'error');
        return;
      }

      // Format existing divisions
      const formattedDivisions = (mergedRequestedDivisions || []).map(div => ({
        divisionId: String(div.divisionId || div.id),
        divisionCode: div.divisionCode || '',
        divisionName: div.divisionName || '',
        isOpen: div.isOpen !== undefined ? div.isOpen : false,
      }));

      // Format existing distributors
      const formattedDistributors = (linkedDistributorsData || []).map(dist => {
        const distributorDivisions = (dist.divisions || []).map(div => ({
          cfaId: div.cfaId || '',
          cfaCode: div.cfaCode || '',
          cfaName: div.cfaName || null,
          divisionId: String(div.divisionId || ''),
          divisionCode: div.divisionCode || '',
          divisionName: div.divisionName || '',
          distributorId: Number(dist.id || dist.distributorId),
          organizationCode: div.organizationCode || 'SPLL',
        }));

        return {
          id: String(dist.id || dist.distributorId),
          code: dist.code || '',
          name: dist.name || dist.distributorName || '',
          email: dist.email || '',
          cityId: dist.cityId || null,
          typeId: dist.typeId || null,
          mobile1: dist.mobile1 || '',
          mobile2: dist.mobile2 || null,
          stateId: dist.stateId || null,
          address1: dist.address1 || null,
          address2: dist.address2 || null,
          cityName: dist.cityName || null,
          isActive: dist.isActive !== undefined ? dist.isActive : true,
          divisions: distributorDivisions,
          gstNumber: dist.gstNumber || null,
          panNumber: dist.panNumber || null,
          stateName: dist.stateName || null,
          licence20BNo: dist.licence20BNo || null,
          licence21BNo: dist.licence21BNo || null,
          divisionCount: dist.divisionCount || distributorDivisions.length,
          expiryDate20B: dist.expiryDate20B || null,
          expiryDate21B: dist.expiryDate21B || null,
          inviteStatusId: dist.inviteStatusId || 1,
          distributorType: dist.distributorType || null,
          inviteStatusName: dist.inviteStatusName || 'Not Invited',
          organizationCode: dist.organizationCode || 'SPLL',
          doctorSupplyMargin: dist.doctorSupplyMargin || null,
          hospitalSupplyMargin: dist.hospitalSupplyMargin || null,
        };
      });

      // Get existing mapping data
      const hierarchyData = hierarchyMappingData || {};
      const itemId = Number(item.id || item.customerId);
      // Format all hospitals - only the one being approved gets isApproved: true
      const mappingHospitals = (hierarchyData?.hospitals || []).map(h => {
        const isBeingApproved = itemType === 'hospital' && Number(h.id || h.customerId) === itemId;
        return formatMappingItemApprove(h, isBeingApproved);
      });

      // Format all doctors - only the one being approved gets isApproved: true
      const mappingDoctors = (hierarchyData?.doctors || []).map(d => {
        const isBeingApproved = itemType === 'doctor' && Number(d.id || d.customerId) === itemId;
        return formatMappingItemApprove(d, isBeingApproved);
      });

      // Format all pharmacies - only the one being approved gets isApproved: true
      const mappingPharmacy = (hierarchyData?.pharmacy || []).map(p => {
        const isBeingApproved = itemType === 'pharmacy' && Number(p.id || p.customerId) === itemId;
        return formatMappingItemApprove(p, isBeingApproved);
      });

      // Format all group hospitals - only the one being approved gets isApproved: true
      const mappingGroupHospitals = (hierarchyData?.groupHospitals || []).map(gh => {
        const isBeingApproved = itemType === 'groupHospital' && Number(gh.id || gh.customerId) === itemId;
        return formatMappingItemApprove(gh, isBeingApproved);
      });

      // If the item being approved doesn't exist in the mapping, add it
      const approvedItem = formatMappingItemApprove(item, true);

      if (itemType === 'hospital') {
        const existingIndex = mappingHospitals.findIndex(h => h.id === itemId);
        if (existingIndex >= 0) {
          mappingHospitals[existingIndex] = approvedItem;
        } else {
          mappingHospitals.push(approvedItem);
        }
      } else if (itemType === 'doctor') {
        const existingIndex = mappingDoctors.findIndex(d => d.id === itemId);
        if (existingIndex >= 0) {
          mappingDoctors[existingIndex] = approvedItem;
        } else {
          mappingDoctors.push(approvedItem);
        }
      } else if (itemType === 'pharmacy') {
        const existingIndex = mappingPharmacy.findIndex(p => p.id === itemId);
        if (existingIndex >= 0) {
          mappingPharmacy[existingIndex] = approvedItem;
        } else {
          mappingPharmacy.push(approvedItem);
        }
      } else if (itemType === 'groupHospital') {
        const existingIndex = mappingGroupHospitals.findIndex(gh => gh.id === itemId);
        if (existingIndex >= 0) {
          mappingGroupHospitals[existingIndex] = approvedItem;
        } else {
          mappingGroupHospitals.push(approvedItem);
        }
      }

      // Format mapping object
      const formattedMapping = {
        hospitals: mappingHospitals,
        doctors: mappingDoctors,
        pharmacy: mappingPharmacy,
        groupHospitals: mappingGroupHospitals,
      };

      // Prepare draft-edit payload
      const draftEditPayload = {
        stepOrder: selectedCustomer?.instance?.stepInstances?.[0]?.stepOrder || 1,
        parallelGroup: 1,
        comments: '',
        actorId: actorId,
        dataChanges: {
          divisions: formattedDivisions,
          distributors: formattedDistributors,
          mapping: formattedMapping,
          customerGroupId: customerGroupId || selectedCustomer?.customerGroupId || 1,
        },
      };

      // Call draft-edit API
      await customerAPI.draftEdit(effectiveInstanceId, draftEditPayload);

      showToast(`${item.customerName || item.name} approved successfully!`, 'success');

      // Refresh latest draft data to update the UI
      await fetchLatestDraftData();
    } catch (error) {
      console.error('Error approving hierarchy item:', error);
      showToast(`Failed to approve: ${error.message}`, 'error');
    }
  };

  // Handle reject for customer hierarchy items
  const handleHierarchyReject = async (item, itemType) => {
    try {
      // Get instanceId from customerDetails response (selectedCustomer from Redux)
      const effectiveInstanceId = instanceIdFromDetails;

      if (!effectiveInstanceId) {
        showToast('Instance ID not available', 'error');
        return;
      }

      const actorId = loggedInUser?.userId || loggedInUser?.id;
      if (!actorId) {
        showToast('User ID not available', 'error');
        return;
      }

      // Format existing divisions
      const formattedDivisions = (mergedRequestedDivisions || []).map(div => ({
        divisionId: String(div.divisionId || div.id),
        divisionCode: div.divisionCode || '',
        divisionName: div.divisionName || '',
        isOpen: div.isOpen !== undefined ? div.isOpen : false,
      }));

      // Format existing distributors
      const formattedDistributors = (linkedDistributorsData || []).map(dist => {
        const distributorDivisions = (dist.divisions || []).map(div => ({
          cfaId: div.cfaId || '',
          cfaCode: div.cfaCode || '',
          cfaName: div.cfaName || null,
          divisionId: String(div.divisionId || ''),
          divisionCode: div.divisionCode || '',
          divisionName: div.divisionName || '',
          distributorId: Number(dist.id || dist.distributorId),
          organizationCode: div.organizationCode || 'SPLL',
        }));

        return {
          id: String(dist.id || dist.distributorId),
          code: dist.code || '',
          name: dist.name || dist.distributorName || '',
          email: dist.email || '',
          cityId: dist.cityId || null,
          typeId: dist.typeId || null,
          mobile1: dist.mobile1 || '',
          mobile2: dist.mobile2 || null,
          stateId: dist.stateId || null,
          address1: dist.address1 || null,
          address2: dist.address2 || null,
          cityName: dist.cityName || null,
          isActive: dist.isActive !== undefined ? dist.isActive : true,
          divisions: distributorDivisions,
          gstNumber: dist.gstNumber || null,
          panNumber: dist.panNumber || null,
          stateName: dist.stateName || null,
          licence20BNo: dist.licence20BNo || null,
          licence21BNo: dist.licence21BNo || null,
          divisionCount: dist.divisionCount || distributorDivisions.length,
          expiryDate20B: dist.expiryDate20B || null,
          expiryDate21B: dist.expiryDate21B || null,
          inviteStatusId: dist.inviteStatusId || 1,
          distributorType: dist.distributorType || null,
          inviteStatusName: dist.inviteStatusName || 'Not Invited',
          organizationCode: dist.organizationCode || 'SPLL',
          doctorSupplyMargin: dist.doctorSupplyMargin || null,
          hospitalSupplyMargin: dist.hospitalSupplyMargin || null,
        };
      });

      // Get existing mapping data
      const hierarchyData = hierarchyMappingData || {};
      const itemId = Number(item.id || item.customerId);



      // Format all hospitals - preserve existing isApproved: true
      const mappingHospitals = (hierarchyData?.hospitals || []).map(h => {
        const isBeingRejected = itemType === 'hospital' && Number(h.id || h.customerId) === itemId;
        return formatMappingItemReject(h, isBeingRejected);
      });

      // Format all doctors - preserve existing isApproved: true
      const mappingDoctors = (hierarchyData?.doctors || []).map(d => {
        const isBeingRejected = itemType === 'doctor' && Number(d.id || d.customerId) === itemId;
        return formatMappingItemReject(d, isBeingRejected);
      });

      // Format all pharmacies - preserve existing isApproved: true
      const mappingPharmacy = (hierarchyData?.pharmacy || []).map(p => {
        const isBeingRejected = itemType === 'pharmacy' && Number(p.id || p.customerId) === itemId;
        return formatMappingItemReject(p, isBeingRejected);
      });

      // Format all group hospitals - preserve existing isApproved: true
      const mappingGroupHospitals = (hierarchyData?.groupHospitals || []).map(gh => {
        const isBeingRejected = itemType === 'groupHospital' && Number(gh.id || gh.customerId) === itemId;
        return formatMappingItemReject(gh, isBeingRejected);
      });

      // If the item being rejected doesn't exist in the mapping, add it (without isApproved)
      const rejectedItem = formatMappingItemReject(item, true);

      if (itemType === 'hospital') {
        const existingIndex = mappingHospitals.findIndex(h => h.id === itemId);
        if (existingIndex >= 0) {
          mappingHospitals[existingIndex] = rejectedItem;
        } else {
          mappingHospitals.push(rejectedItem);
        }
      } else if (itemType === 'doctor') {
        const existingIndex = mappingDoctors.findIndex(d => d.id === itemId);
        if (existingIndex >= 0) {
          mappingDoctors[existingIndex] = rejectedItem;
        } else {
          mappingDoctors.push(rejectedItem);
        }
      } else if (itemType === 'pharmacy') {
        const existingIndex = mappingPharmacy.findIndex(p => p.id === itemId);
        if (existingIndex >= 0) {
          mappingPharmacy[existingIndex] = rejectedItem;
        } else {
          mappingPharmacy.push(rejectedItem);
        }
      } else if (itemType === 'groupHospital') {
        const existingIndex = mappingGroupHospitals.findIndex(gh => gh.id === itemId);
        if (existingIndex >= 0) {
          mappingGroupHospitals[existingIndex] = rejectedItem;
        } else {
          mappingGroupHospitals.push(rejectedItem);
        }
      }

      // Format mapping object
      const formattedMapping = {
        hospitals: mappingHospitals,
        doctors: mappingDoctors,
        pharmacy: mappingPharmacy,
        groupHospitals: mappingGroupHospitals,
      };

      // Prepare draft-edit payload
      const draftEditPayload = {
        stepOrder: selectedCustomer?.instance?.stepInstances?.[0]?.stepOrder || 1,
        parallelGroup: 1,
        comments: '',
        actorId: actorId,
        dataChanges: {
          divisions: formattedDivisions,
          distributors: formattedDistributors,
          mapping: formattedMapping,
          customerGroupId: customerGroupId || selectedCustomer?.customerGroupId || 1,
        },
      };

      // Call draft-edit API
      await customerAPI.draftEdit(effectiveInstanceId, draftEditPayload);

      showToast(`${item.customerName || item.name} rejected!`, 'error');

      // Refresh latest draft data to update the UI
      await fetchLatestDraftData();
    } catch (error) {
      console.error('Error rejecting hierarchy item:', error);
      showToast(`Failed to reject: ${error.message}`, 'error');
    }
  };

  const handleRejectConfirm = async () => {
    try {
      const workflowId = selectedItem?.workflowId || selectedItem?.id;
      const actorId = loggedInUser?.userId || loggedInUser?.id;

      const actionData = {
        stepOrder: selectedCustomer?.instance?.stepInstances?.[0]?.stepOrder || 3,
        parallelGroup: 1,
        actorId: actorId,
        action: 'REJECT',
        comments: 'Rejected',
        actionData: {},
      };



      const response = await customerAPI.workflowAction(workflowId, actionData);

      setShowRejectModal(false);
      showToast(`${selectedItem?.name} rejected!`, 'error');
      setSelectedItem(null);
    } catch (error) {
      console.error('Error rejecting:', error);
      setShowRejectModal(false);
      showToast(`Failed to reject: ${error.message}`, 'error');
      setSelectedItem(null);
    }
  };

  // Handle Finish button for linked distributors - calls draft-edit API
  const handleFinishLinkedDistributors = async () => {
    if (linkedDistributorsData.length === 0) {
      showToast('No linked distributors to update', 'error');
      return;
    }

    try {
      setLinkingDistributors(true);

      // Get instanceId from customerDetails response (selectedCustomer from Redux)
      const effectiveInstanceId = instanceIdFromDetails;

      if (!effectiveInstanceId) {
        showToast('Instance ID not found. Please refresh and try again.', 'error');
        setLinkingDistributors(false);
        return;
      }

      const actorId = loggedInUser?.userId || loggedInUser?.id;

      // Format all existing divisions from mergedRequestedDivisions
      const formattedDivisions = (mergedRequestedDivisions || []).map(div => ({
        divisionId: String(div.divisionId || div.id),
        divisionCode: div.divisionCode || '',
        divisionName: div.divisionName || '',
        isOpen: div.isOpen !== undefined ? div.isOpen : false,
      }));

      // Format linked distributors with updated values (org code, margin, supply mode)
      const formattedDistributors = linkedDistributorsData.map(dist => {
        const distId = String(dist.id || dist.distributorId);
        const orgCode = linkedDistributorOrgCodes[distId] || dist.organizationCode || 'SPLL';
        const margin = linkedDistributorMargins[distId] || dist.doctorSupplyMargin || dist.hospitalSupplyMargin || null;
        const supplyMode = linkedDistributorSupplyModes[distId] || dist.supplyMode || '0';
        const supplyType = supplyMode === '1' ? 'CM' : 'DM'; // 1 = chargeback (CM), else net rate (DM)
        const typeId = supplyMode === '1' ? 2 : 1; // Chargeback = 2, Net Rate = 1

        // Format distributor divisions
        const distributorDivisions = (dist.divisions || []).map(div => ({
          cfaId: div.cfaId || '',
          cfaCode: div.cfaCode || '',
          cfaName: div.cfaName || null,
          divisionId: String(div.divisionId || ''),
          divisionCode: div.divisionCode || '',
          divisionName: div.divisionName || '',
          distributorId: Number(dist.id || dist.distributorId),
          organizationCode: orgCode,
        }));

        return {
          id: String(dist.id || dist.distributorId),
          code: dist.code || '',
          name: dist.name || dist.distributorName || '',
          email: dist.email || '',
          cityId: dist.cityId || null,
          typeId: typeId,
          mobile1: dist.mobile1 || '',
          mobile2: dist.mobile2 || null,
          stateId: dist.stateId || null,
          address1: dist.address1 || null,
          address2: dist.address2 || null,
          cityName: dist.cityName || null,
          isActive: dist.isActive !== undefined ? dist.isActive : true,
          divisions: distributorDivisions,
          gstNumber: dist.gstNumber || null,
          panNumber: dist.panNumber || null,
          stateName: dist.stateName || null,
          licence20BNo: dist.licence20BNo || null,
          licence21BNo: dist.licence21BNo || null,
          divisionCount: dist.divisionCount || distributorDivisions.length,
          expiryDate20B: dist.expiryDate20B || null,
          expiryDate21B: dist.expiryDate21B || null,
          inviteStatusId: dist.inviteStatusId || 1,
          distributorType: dist.distributorType || null,
          inviteStatusName: dist.inviteStatusName || 'Not Invited',
          organizationCode: orgCode,
          doctorSupplyMargin: margin,
          hospitalSupplyMargin: margin,
          supplyMode: supplyMode,
        };
      });

      // Get existing mapping data
      const hierarchyData = hierarchyMappingData || {};


      // Format all hospitals - only the one being approved gets isApproved: true
      const mappingHospitals = (hierarchyData?.hospitals || []).map(h => {
        return formatMappingItemApprove(h);
      });

      // Format all doctors - only the one being approved gets isApproved: true
      const mappingDoctors = (hierarchyData?.doctors || []).map(d => {
        return formatMappingItemApprove(d);
      });

      // Format all pharmacies - only the one being approved gets isApproved: true
      const mappingPharmacy = (hierarchyData?.pharmacy || []).map(p => {
        return formatMappingItemApprove(p);
      });

      // Format all group hospitals - only the one being approved gets isApproved: true
      const mappingGroupHospitals = (hierarchyData?.groupHospitals || []).map(gh => {
        return formatMappingItemApprove(gh,);
      });



      // Format mapping object
      const formattedMapping = {
        hospitals: mappingHospitals,
        doctors: mappingDoctors,
        pharmacy: mappingPharmacy,
        groupHospitals: mappingGroupHospitals,
      };

      const draftEditPayload = {
        stepOrder: selectedCustomer?.instance?.stepInstances?.[0]?.stepOrder || 3,
        parallelGroup: 1,
        comments: '',
        actorId: actorId,
        dataChanges: {
          divisions: formattedDivisions,
          distributors: formattedDistributors,
          mapping: formattedMapping,
          customerGroupId: customerGroupId || selectedCustomer?.customerGroupId || 1,
        },
      };


      // Call draft-edit API
      const draftEditResponse = await customerAPI.draftEdit(effectiveInstanceId, draftEditPayload);

      showToast('Linked distributors updated successfully!', 'success');

      // Refresh latest draft data to get updated values
      await fetchLatestDraftData();
    } catch (error) {
      console.error('Error updating linked distributors:', error);
      showToast(`Failed to update linked distributors: ${error.message}`, 'error');
    } finally {
      setLinkingDistributors(false);
    }
  };

  const handleLinkDivisionsConfirmModal = comment => {
    // TODO: API integration
    setShowLinkDivisionsModal(false);
    showToast('Divisions linked successfully!', 'success');
  };

  // Handle Verify action (for LINK_DT)
  const handleVerifyAction = async () => {
    try {
      const instanceIdValue = instanceIdFromDetails || instanceId || selectedCustomer?.instaceId || selectedCustomer?.stgCustomerId;
      const actorId = loggedInUser?.userId || loggedInUser?.id;
      const parallelGroupId = selectedCustomer?.instance?.stepInstances?.[0]?.parallelGroup;
      const stepOrderId = selectedCustomer?.instance?.stepInstances?.[0]?.stepOrder;

      if (!instanceIdValue) {
        showToast('Instance ID not found. Please refresh and try again.', 'error');
        return;
      }

      const actionDataPayload = {
        stepOrder: stepOrderId,
        parallelGroup: parallelGroupId,
        actorId: actorId,
        action: "VERIFY",
        comments: "Verified",
        instanceId: instanceIdValue,
        actionData: {
          field: "status",
          newValue: "Verified"
        },
      };

      await customerAPI.workflowAction(instanceIdValue, actionDataPayload);
      showToast('Customer verified successfully!', 'success');
    } catch (error) {
      console.error('Error verifying customer:', error);
      showToast(`Failed to verify customer: ${error.message}`, 'error');
    }
  };

  // Handle Reject action (for LINK_DT)
  const handleRejectAction = async () => {
    try {
      const instanceIdValue = instanceIdFromDetails || instanceId || selectedCustomer?.instaceId || selectedCustomer?.stgCustomerId;
      const actorId = loggedInUser?.userId || loggedInUser?.id;
      const parallelGroupId = selectedCustomer?.instance?.stepInstances?.[0]?.parallelGroup;
      const stepOrderId = selectedCustomer?.instance?.stepInstances?.[0]?.stepOrder;

      if (!instanceIdValue) {
        showToast('Instance ID not found. Please refresh and try again.', 'error');
        return;
      }

      const actionDataPayload = {
        stepOrder: stepOrderId,
        parallelGroup: parallelGroupId,
        actorId: actorId,
        action: "REJECT",
        comments: "Rejected",
        instanceId: instanceIdValue,
        actionData: {
          field: "status",
          newValue: "Rejected"
        },
        dataChanges: {
          previousStatus: "Pending",
          newStatus: "Rejected"
        }
      };

      await customerAPI.workflowAction(instanceIdValue, actionDataPayload);
      showToast('Customer rejected!', 'error');
    } catch (error) {
      console.error('Error rejecting customer:', error);
      showToast(`Failed to reject customer: ${error.message}`, 'error');
    }
  };

  const handleTagConfirm = () => {
    // TODO: API integration
    setShowTagModal(false);
    showToast('Hospital tagged successfully!', 'success');
  };

  const toggleDivisionSelection = (division, isAllDivisions = false) => {
    if (isAllDivisions) {
      if (division.name === 'All Divisions') {
        setAllDivisionsSelected(prev => {
          const isSelected = prev.find(d => d.id === division.id);
          if (isSelected) {
            return [];
          } else {
            return mockDivisions.allDivisions;
          }
        });
      } else {
        setAllDivisionsSelected(prev => {
          const exists = prev.find(d => d.id === division.id);
          if (exists) {
            return prev.filter(d => d.id !== division.id);
          } else {
            return [...prev, division];
          }
        });
      }
    } else {
      setSelectedDivisions(prev => {
        const exists = prev.find(d => d.id === division.id);
        if (exists) {
          return prev.filter(d => d.id !== division.id);
        } else {
          return [...prev, division];
        }
      });
    }
  };

  // Add distributor from "All" to "Preferred"
  const handleAddDistributor = async distributor => {
    const alreadyExists = linkedDistributorsData.find(
      d => d.id === distributor.id,
    );
    if (alreadyExists) {
      showToast(
        `${distributor.name} is already in linked distributors!`,
        'error',
      );
      return;
    }

    // Check if already linked
    const alreadyLinked = linkedDistributorsData.find(
      d => String(d.id || d.distributorId) === String(distributor.id),
    );
    if (alreadyLinked) {
      showToast(
        `${distributor.name} is already linked!`,
        'error',
      );
      return;
    }

    try {

      // Get instanceId from customerDetails response (selectedCustomer from Redux)
      const effectiveInstanceId = instanceIdFromDetails;

      if (!effectiveInstanceId) {
        showToast('Instance ID not found. Please refresh and try again.', 'error');
        return;
      }

      const actorId = loggedInUser?.userId || loggedInUser?.id;

      // Format all existing divisions from mergedRequestedDivisions
      const formattedDivisions = (mergedRequestedDivisions || []).map(div => ({
        divisionId: String(div.divisionId || div.id),
        divisionCode: div.divisionCode || '',
        divisionName: div.divisionName || '',
        isOpen: div.isOpen !== undefined ? div.isOpen : false,
      }));

      // Get existing linked distributors to merge with newly added one
      // Also check latest draft for distributors that might be in draft but not yet linked
      let existingDistributorsFromDraft = [];
      if (Object.keys(instance).length !== 0) {
        try {

          const draftResponse = await customerAPI.getLatestDraft(effectiveInstanceId, actorId);
          if (draftResponse?.data?.success && draftResponse?.data?.hasDraft && draftResponse?.data?.draftEdits?.distributors) {
            existingDistributorsFromDraft = draftResponse.data.draftEdits.distributors;
          }
        } catch (error) {
          console.warn('Could not fetch distributors from draft:', error);
        }
      }

      // Create a map to avoid duplicates
      const allDistributorsMap = new Map();

      // First, add all existing linked distributors from API
      (linkedDistributorsData || []).forEach(linkedDist => {
        const distId = String(linkedDist.id || linkedDist.distributorId || '');
        if (distId && distId !== 'undefined') {
          // Format existing linked distributor
          const distributorDivisions = (linkedDist.divisions || []).map(div => ({
            cfaId: div.cfaId || '',
            cfaCode: div.cfaCode || '',
            cfaName: div.cfaName || null,
            divisionId: String(div.divisionId || ''),
            divisionCode: div.divisionCode || '',
            divisionName: div.divisionName || '',
            distributorId: Number(linkedDist.id || linkedDist.distributorId),
            organizationCode: div.organizationCode || 'SPLL',
          }));

          allDistributorsMap.set(distId, {
            id: String(linkedDist.id || linkedDist.distributorId),
            code: linkedDist.code || '',
            name: linkedDist.name || linkedDist.distributorName || '',
            email: linkedDist.email || '',
            cityId: linkedDist.cityId || null,
            typeId: linkedDist.typeId || null,
            mobile1: linkedDist.mobile1 || '',
            mobile2: linkedDist.mobile2 || null,
            stateId: linkedDist.stateId || null,
            address1: linkedDist.address1 || null,
            address2: linkedDist.address2 || null,
            cityName: linkedDist.cityName || null,
            isActive: linkedDist.isActive !== undefined ? linkedDist.isActive : true,
            divisions: distributorDivisions,
            gstNumber: linkedDist.gstNumber || null,
            panNumber: linkedDist.panNumber || null,
            stateName: linkedDist.stateName || null,
            licence20BNo: linkedDist.licence20BNo || null,
            licence21BNo: linkedDist.licence21BNo || null,
            divisionCount: linkedDist.divisionCount || distributorDivisions.length,
            expiryDate20B: linkedDist.expiryDate20B || null,
            expiryDate21B: linkedDist.expiryDate21B || null,
            inviteStatusId: linkedDist.inviteStatusId || 1,
            distributorType: linkedDist.distributorType || null,
            inviteStatusName: linkedDist.inviteStatusName || 'Not Invited',
            organizationCode: linkedDist.organizationCode || 'SPLL',
            doctorSupplyMargin: linkedDist.doctorSupplyMargin || null,
            hospitalSupplyMargin: linkedDist.hospitalSupplyMargin || null,
          });
        }
      });

      // Then, add distributors from draft (if any)
      existingDistributorsFromDraft.forEach(draftDist => {
        const distId = String(draftDist.id || '');
        if (distId && distId !== 'undefined' && !allDistributorsMap.has(distId)) {
          // Format draft distributor
          const distributorDivisions = (draftDist.divisions || []).map(div => ({
            cfaId: div.cfaId || '',
            cfaCode: div.cfaCode || '',
            cfaName: div.cfaName || null,
            divisionId: String(div.divisionId || ''),
            divisionCode: div.divisionCode || '',
            divisionName: div.divisionName || '',
            distributorId: Number(draftDist.id),
            organizationCode: div.organizationCode || 'SPLL',
          }));

          allDistributorsMap.set(distId, {
            id: String(draftDist.id),
            code: draftDist.code || '',
            name: draftDist.name || '',
            email: draftDist.email || '',
            cityId: draftDist.cityId || null,
            typeId: draftDist.typeId || null,
            mobile1: draftDist.mobile1 || '',
            mobile2: draftDist.mobile2 || null,
            stateId: draftDist.stateId || null,
            address1: draftDist.address1 || null,
            address2: draftDist.address2 || null,
            cityName: draftDist.cityName || null,
            isActive: draftDist.isActive !== undefined ? draftDist.isActive : true,
            divisions: distributorDivisions,
            gstNumber: draftDist.gstNumber || null,
            panNumber: draftDist.panNumber || null,
            stateName: draftDist.stateName || null,
            licence20BNo: draftDist.licence20BNo || null,
            licence21BNo: draftDist.licence21BNo || null,
            divisionCount: draftDist.divisionCount || distributorDivisions.length,
            expiryDate20B: draftDist.expiryDate20B || null,
            expiryDate21B: draftDist.expiryDate21B || null,
            inviteStatusId: draftDist.inviteStatusId || 1,
            distributorType: draftDist.distributorType || null,
            inviteStatusName: draftDist.inviteStatusName || 'Not Invited',
            organizationCode: draftDist.organizationCode || 'SPLL',
            doctorSupplyMargin: draftDist.doctorSupplyMargin || null,
            hospitalSupplyMargin: draftDist.hospitalSupplyMargin || null,
          });
        }
      });

      // Finally, add the newly selected distributor
      const distId = String(distributor.id);
      // Get supply type (default to Net Rate if not specified)
      const supplyType = allDistributorSupplyType[distributor.id] ||
        (distributor.inviteStatusId === 2 ? 'Chargeback (CM)' : 'NetRate (DM)');
      const typeId = supplyType.includes('Chargeback') || supplyType.includes('CM') ? 2 : 1;

      // Format distributor divisions (from the distributor's divisions array)
      const distributorDivisions = (distributor.divisions || []).map(div => ({
        cfaId: div.cfaId || '',
        cfaCode: div.cfaCode || '',
        cfaName: div.cfaName || null,
        divisionId: String(div.divisionId || ''),
        divisionCode: div.divisionCode || '',
        divisionName: div.divisionName || '',
        distributorId: Number(distributor.id),
        organizationCode: div.organizationCode || 'SPLL',
      }));

      allDistributorsMap.set(distId, {
        id: String(distributor.id),
        code: distributor.code || '',
        name: distributor.name || '',
        email: distributor.email || '',
        cityId: distributor.cityId || null,
        typeId: typeId,
        mobile1: distributor.mobile1 || '',
        mobile2: distributor.mobile2 || null,
        stateId: distributor.stateId || null,
        address1: distributor.address1 || null,
        address2: distributor.address2 || null,
        cityName: distributor.cityName || null,
        isActive: distributor.isActive !== undefined ? distributor.isActive : true,
        divisions: distributorDivisions,
        gstNumber: distributor.gstNumber || null,
        panNumber: distributor.panNumber || null,
        stateName: distributor.stateName || null,
        licence20BNo: distributor.licence20BNo || null,
        licence21BNo: distributor.licence21BNo || null,
        divisionCount: distributor.divisionCount || distributorDivisions.length,
        expiryDate20B: distributor.expiryDate20B || null,
        expiryDate21B: distributor.expiryDate21B || null,
        inviteStatusId: distributor.inviteStatusId || 1,
        distributorType: distributor.distributorType || null,
        inviteStatusName: distributor.inviteStatusName || 'Not Invited',
        organizationCode: distributor.organizationCode || 'SPLL',
        doctorSupplyMargin: distributor.doctorSupplyMargin || null,
        hospitalSupplyMargin: distributor.hospitalSupplyMargin || null,
      });

      // Convert map to array - this includes all existing + newly added distributor
      const formattedDistributors = Array.from(allDistributorsMap.values());

      // Format mapping data (customer hierarchy)
      const formattedMapping = {
        groupHospitals: (mappingData?.groupHospitals || []).map(h => ({
          id: Number(h.id),
          isNew: h.isNew !== undefined ? h.isNew : false,
          action: h.action || 'LINK_DT',
          cityId: h.cityId || null,
          typeId: h.typeId || null,
          stateId: h.stateId || null,
          cityName: h.cityName || null,
          stateName: h.stateName || null,
          categoryId: h.categoryId || null,
          stationCode: h.stationCode || null,
          customerCode: h.customerCode || null,
          customerName: h.customerName || null,
          subCategoryId: h.subCategoryId || null,
        })),
        hospitals: (mappingData?.hospitals || []).map(h => ({
          id: Number(h.id),
          isNew: h.isNew !== undefined ? h.isNew : false,
        })),
        doctors: (mappingData?.doctors || []).map(d => ({
          id: Number(d.id),
          isNew: d.isNew !== undefined ? d.isNew : false,
        })),
        pharmacy: (mappingData?.pharmacy || []).map(p => ({
          id: Number(p.id),
          isNew: p.isNew !== undefined ? p.isNew : false,
        })),
      };

      const draftEditPayload = {
        stepOrder: selectedCustomer?.instance?.stepInstances?.[0]?.stepOrder || 3,
        parallelGroup: 1,
        comments: '',
        actorId: actorId,
        dataChanges: {
          divisions: formattedDivisions,
          distributors: formattedDistributors,
          mapping: formattedMapping,
          customerGroupId: customerGroupId || selectedCustomer?.customerGroupId || 1,
        },
      };


      // Call draft-edit API
      const draftEditResponse = await customerAPI.draftEdit(effectiveInstanceId, draftEditPayload);

      // Add to preferred distributors locally
      setPreferredDistributorsData(prev => [...prev, distributor]);

      showToast(
        `${distributor.name} added to preferred distributors!`,
        'success',
      );

      // After successful mapping, fetch latest draft to update divisions and distributors
      // This will update linked distributors from latest-draft response (ONLY source)
      await fetchLatestDraftData();

      // Refresh preferred distributors list
      if (activeDistributorTab === 'preferred' && effectiveCustomerId) {
        await fetchPreferredDistributorsData();
      }
    } catch (error) {
      console.error('Error adding distributor:', error);
      showToast(`Failed to add distributor: ${error.message}`, 'error');
    }
  };

  // Remove distributor from "Preferred"
  const handleRemoveDistributor = distributorId => {
    setPreferredDistributorsData(prev =>
      prev.filter(d => d.id !== distributorId),
    );
    // Clean up dropdown states for removed distributor
    setDistributorRateType(prev => {
      const updated = { ...prev };
      delete updated[distributorId];
      return updated;
    });
    setDistributorDivision(prev => {
      const updated = { ...prev };
      delete updated[distributorId];
      return updated;
    });
    showToast('Distributor removed from preferred!', 'success');
  };

  // Handle rate type selection
  const handleRateTypeSelect = (distributorId, rateType) => {
    setDistributorRateType(prev => ({
      ...prev,
      [distributorId]: rateType,
    }));
    setShowRateTypeDropdown(prev => ({
      ...prev,
      [distributorId]: false,
    }));
  };

  // Handle division selection
  const handleDivisionSelect = (distributorId, division) => {
    setDistributorDivision(prev => ({
      ...prev,
      [distributorId]: division,
    }));
    setShowDivisionDropdown(prev => ({
      ...prev,
      [distributorId]: false,
    }));
  };

  // Toggle rate type dropdown
  const toggleRateTypeDropdown = distributorId => {
    setShowRateTypeDropdown(prev => ({
      ...prev,
      [distributorId]: !prev[distributorId],
    }));
  };

  // Toggle division dropdown
  const toggleDivisionDropdown = distributorId => {
    setShowDivisionDropdown(prev => ({
      ...prev,
      [distributorId]: !prev[distributorId],
    }));
  };

  // Toggle division selection in "Other Division"
  const toggleOtherDivisionSelection = division => {
    setSelectedDivisions(prev => {
      const exists = prev.find(d => d.divisionId === division.divisionId);
      if (exists) {
        return prev.filter(d => d.divisionId !== division.divisionId);
      } else {
        return [...prev, division];
      }
    });
  };

  // Move selected divisions from "Other" to "Opened"
  // Move selected divisions from "Other" to "Opened"
  const handleLinkDivisionsConfirm = comment => {
    if (selectedDivisions.length === 0) {
      showToast('Please select at least one division', 'error');
      return;
    }

    // Move selected divisions to opened
    setOpenedDivisionsData(prev => [...prev, ...selectedDivisions]);

    // Remove from other divisions
    const selectedIds = selectedDivisions.map(d => d.divisionId);
    setOtherDivisionsData(prev =>
      prev.filter(d => !selectedIds.includes(d.divisionId)),
    );

    // Clear selection
    setSelectedDivisions([]);

    // Close modal
    setShowDivisionModal(false);

    showToast('Divisions linked successfully!', 'success');
  };

  // Handle continue button - link divisions via API
  const handleLinkDivisionsAPI = async () => {
    if (selectedDivisions.length === 0) {
      showToast('Please select at least one division', 'error');
      return;
    }

    try {
      setLinkingDivisions(true);

      // Filter only divisions with divisionId and format for API
      const validDivisions = selectedDivisions.filter(d => d.divisionId);

      if (validDivisions.length === 0) {
        showToast('No valid divisions selected', 'error');
        setLinkingDivisions(false);
        return;
      }

      // Get instanceId from customerDetails response (selectedCustomer from Redux)
      // Use instanceIdFromDetails which is already calculated from selectedCustomer
      const effectiveInstanceId = instanceIdFromDetails;

      // instanceId is required for draft-edit API
      if (!effectiveInstanceId) {
        showToast('Instance ID not found. Please refresh and try again.', 'error');
        setLinkingDivisions(false);
        return;
      }

      const actorId = loggedInUser?.userId || loggedInUser?.id;

      // Get all existing divisions from mergedRequestedDivisions (includes divisions already in draft)
      // Create a map to avoid duplicates
      const allDivisionsMap = new Map();

      // First, add all existing divisions from mergedRequestedDivisions
      mergedRequestedDivisions.forEach(div => {
        const key = String(div.divisionId || div.id);
        allDivisionsMap.set(key, {
          divisionId: String(div.divisionId || div.id),
          divisionCode: div.divisionCode || '',
          divisionName: div.divisionName || '',
          isOpen: div.isOpen !== undefined ? div.isOpen : false,
        });
      });

      // Then, add newly selected divisions (they will overwrite if duplicate, but that's fine)
      validDivisions.forEach(division => {
        const key = String(division.divisionId);
        allDivisionsMap.set(key, {
          divisionId: String(division.divisionId),
          divisionCode: division.divisionCode || '',
          divisionName: division.divisionName || '',
          isOpen: false, // Default to false for newly mapped divisions
        });
      });

      // Convert map to array - this includes all existing + newly selected divisions
      const formattedDivisions = Array.from(allDivisionsMap.values());

      const draftEditPayload = {
        stepOrder: selectedCustomer?.instance?.stepInstances?.[0]?.stepOrder || 3,
        parallelGroup: 1,
        comments: '',
        actorId: actorId,
        dataChanges: {
          divisions: formattedDivisions,
          customerGroupId: customerGroupId || selectedCustomer?.customerGroupId || 1, // Use from selectedCustomer if available
        },
      };



      // Call draft-edit API only
      const draftEditResponse = await customerAPI.draftEdit(effectiveInstanceId, draftEditPayload);

      // Move valid selected divisions to opened locally (so UI updates immediately)
      // setOpenedDivisionsData(prev => [...prev, ...validDivisions]);

      // Remove from other divisions locally
      const selectedIds = validDivisions.map(d => d.divisionId);
      setOtherDivisionsData(prev =>
        prev.filter(d => !selectedIds.includes(d.divisionId)),
      );

      // Clear selection
      setSelectedDivisions([]);

      showToast('Divisions linked successfully!', 'success');

      // Fetch latest draft to update requested divisions and linked distributors
      await fetchLatestDraftData();

      // Refresh divisions data after linking - ONLY for active customers
      const isPendingCustomer = selectedCustomer?.statusName === 'PENDING';
      const isActiveCustomer = !isPendingCustomer && (selectedCustomer?.customerCode != null || selectedCustomer?.statusName === 'ACTIVE');

      if (effectiveCustomerId && isActiveCustomer) {
        try {
          // Fetch updated customer divisions (opened) - only for active customers
          const customerDivisionsResponse =
            await customerAPI.getCustomerDivisions(effectiveCustomerId);

          // Fetch all available divisions
          const allDivisionsResponse = await customerAPI.getAllDivisions();



          let updatedOpenedDivisions = [];
          let updatedOtherDivisions = [];

          // Process customer's linked divisions (opened) - only for active customers
          if (
            customerDivisionsResponse?.data &&
            Array.isArray(customerDivisionsResponse.data)
          ) {
            updatedOpenedDivisions = customerDivisionsResponse.data;
          }

          // Process all available divisions and filter out already linked ones
          if (
            allDivisionsResponse?.data?.divisions &&
            Array.isArray(allDivisionsResponse.data.divisions)
          ) {
            const linkedDivisionIds = updatedOpenedDivisions.map(d =>
              Number(d.divisionId),
            );
            updatedOtherDivisions = allDivisionsResponse.data.divisions.filter(
              d => !linkedDivisionIds.includes(Number(d.divisionId)),
            );
          }

          // Only set opened divisions data for active customers
          setOpenedDivisionsData(updatedOpenedDivisions);
          setOtherDivisionsData(updatedOtherDivisions);
        } catch (error) {
          console.error('Error refreshing divisions after linking:', error);
          // don't block the user for refresh errors
        }
      } else if (!isActiveCustomer) {
        // For non-active customers, ensure opened divisions are cleared
        setOpenedDivisionsData([]);
      }
    } catch (error) {
      console.error('Error linking divisions:', error);
      showToast(`Failed to link divisions: ${error.message}`, 'error');
    } finally {
      setLinkingDivisions(false);
    }
  };

  // Handle block/unblock division
  const handleBlockUnblockDivision = async (division) => {
    if (!effectiveCustomerId || !division?.divisionId) {
      showToast('Customer ID or Division ID is missing', 'error');
      return;
    }

    const isBlocking = !division.isBlocked; // If currently not blocked, we're blocking it
    const isActive = !isBlocking; // isActive: false for block, true for unblock

    try {
      setBlockingDivision(division.divisionId);

      await customerAPI.blockUnblockDivision(
        effectiveCustomerId,
        division.divisionId,
        isActive
      );

      // Update the local state
      setOpenedDivisionsData(prev =>
        prev.map(div =>
          div.divisionId === division.divisionId
            ? { ...div, isBlocked: isBlocking }
            : div
        )
      );

      showToast(
        `Division ${isBlocking ? 'blocked' : 'unblocked'} successfully`,
        'success'
      );
    } catch (error) {
      console.error('Error blocking/unblocking division:', error);
      showToast(
        `Failed to ${isBlocking ? 'block' : 'unblock'} division: ${error.message || 'Unknown error'}`,
        'error'
      );
    } finally {
      setBlockingDivision(null);
    }
  };

  // Simple skeleton placeholders for distributor rows
  const DistributorListSkeleton = ({ rows = 5 }) => {
    return (
      <View style={{ paddingHorizontal: 20 }}>
        {Array.from({ length: rows }).map((_, i) => (
          <View key={`skeleton-${i}`} style={styles.skeletonRow}>
            <View style={styles.skeletonLeft}>
              <View style={styles.skeletonTitle} />
              <View style={styles.skeletonSubTitle} />
            </View>

            <View style={styles.skeletonMiddle}>
              <View style={styles.skeletonStatus} />
            </View>

            <View style={styles.skeletonRight}>
              <View style={styles.skeletonAddButton} />
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderDistributorsTab = () => (
    <View style={styles.tabContent}>
      {/* Sub tabs for Preferred and All Distributors */}
      {/* <View style={styles.distributorTabs}> */}

      <View style={styles.subTabsWrapper}>

        <ScrollView
          horizontal
          ref={distributorTabScrollRef}
          showsHorizontalScrollIndicator={false}
          style={styles.subTabsContainer}
          scrollEventThrottle={16}
        >

          {hasPreferredDistributorPermission && (
            <TouchableOpacity
              ref={ref => (distributorTabRefs.current['preferred'] = ref)}
              style={[
                styles.distributorTab,
                activeDistributorTab === 'preferred' && styles.activeDistributorTab,
              ]}
              onPress={() => handleDistributorTabPress('preferred')}
            >
              <AppText
                style={[
                  styles.distributorTabText,
                  activeDistributorTab === 'preferred' &&
                  styles.activeDistributorTabText,
                ]}
              >
                Preferred Distributors
              </AppText>
            </TouchableOpacity>
          )}

          {hasAllDistributorPermission && (
            <TouchableOpacity
              ref={ref => (distributorTabRefs.current['all'] = ref)}
              style={[
                styles.distributorTab,
                activeDistributorTab === 'all' && styles.activeDistributorTab,
              ]}
              onPress={() => handleDistributorTabPress('all')}
            >
              <AppText
                style={[
                  styles.distributorTabText,
                  activeDistributorTab === 'all' &&
                  styles.activeDistributorTabText,
                ]}
              >
                All Distributors
              </AppText>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            ref={ref => (distributorTabRefs.current['linked'] = ref)}
            style={[
              styles.distributorTab,
              activeDistributorTab === 'linked' && styles.activeDistributorTab,
            ]}
            onPress={() => handleDistributorTabPress('linked')}
          >
            <AppText
              style={[
                styles.distributorTabText,
                activeDistributorTab === 'linked' &&
                styles.activeDistributorTabText,
              ]}
            >
              Linked Distributors
            </AppText>
          </TouchableOpacity>
        </ScrollView>

      </View>



      {activeDistributorTab === 'preferred' && hasPreferredDistributorPermission && (
        <ScrollView style={styles.scrollContent}>
          {distributorsError ? (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={40} color="#EF4444" />
              <AppText style={styles.errorText}>
                Error loading distributors
              </AppText>
              <AppText style={styles.errorSubText}>{distributorsError}</AppText>
            </View>
          ) : (
            <>
              {/* Filters */}

              <View style={styles.suggestedSection}>
                <AppText style={styles.suggestedTitle}>
                  Suggested Stockist by MR
                </AppText>
                <TouchableOpacity style={styles.infoIcon}>
                  <Icon name="information-outline" size={20} color="#333" />
                </TouchableOpacity>
              </View>
              <View style={styles.filterRow}>

                <TouchableOpacity
                  style={styles.filterIcon}
                  onPress={() => setShowFilterModal(true)}
                >
                  <Icon name="tune" size={20} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.filterDropdown}
                  onPress={() => setShowFilterModal(true)}
                >
                  <AppText style={styles.filterText}>
                    {distributorFilters.state.length > 0 &&
                      !distributorFilters.state.includes('All')
                      ? `State (${distributorFilters.state.length})`
                      : 'State'}
                  </AppText>
                  <IconMaterial
                    name="keyboard-arrow-down"
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.filterDropdown}
                  onPress={() => setShowFilterModal(true)}
                >
                  <AppText style={styles.filterText}>
                    {distributorFilters.city.length > 0 &&
                      !distributorFilters.city.includes('All')
                      ? `City (${distributorFilters.city.length})`
                      : 'City'}
                  </AppText>
                  <IconMaterial
                    name="keyboard-arrow-down"
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              {/* Search */}
              <View style={styles.searchContainer}>
                <IconFeather name="search" size={20} color="#999" />
                <AppInput
                  style={styles.searchInput}
                  placeholder="Search by distributor name & code"
                  placeholderTextColor="#999"
                  value={preferredSearchText}
                  onChangeText={setPreferredSearchText}
                />
              </View>

              {/* Table Header */}
              <View style={styles.tableHeader}>
                <AppText style={[styles.tableHeaderText, { flex: 1.5 }]}>
                  Name, Code & City
                </AppText>
                <AppText
                  style={[
                    styles.tableHeaderText,
                    { flex: 1, textAlign: 'center' },
                  ]}
                >
                  Type
                </AppText>
                <AppText
                  style={[
                    styles.tableHeaderText,
                    { flex: 0.6, textAlign: 'right' },
                  ]}
                >
                  Action
                </AppText>
              </View>

              {/* Distributor List Area: show skeleton while loading, error or actual rows otherwise */}
              {distributorsLoading ? (
                <DistributorListSkeleton rows={6} />
              ) : distributorsError ? (
                <View style={styles.errorContainer}>
                  <Icon name="alert-circle" size={40} color="#EF4444" />
                  <AppText style={styles.errorText}>
                    Error loading distributors
                  </AppText>
                  <AppText style={styles.errorSubText}>
                    {distributorsError}
                  </AppText>
                </View>
              ) : (
                <>
                  {filteredPreferredDistributors.length === 0 ? (
                    <View style={styles.emptyContainer}>
                      <Icon
                        name="package-variant-closed"
                        size={40}
                        color="#999"
                      />
                      <AppText style={styles.emptyText}>
                        {preferredDistributorsData.length === 0
                          ? 'No distributors available'
                          : 'No distributors match the selected filters'}
                      </AppText>
                    </View>
                  ) : (
                    filteredPreferredDistributors.map(distributor => (
                      <View
                        key={`${distributor.id}-${distributor.name}`}
                        style={[
                          styles.distributorRow,
                          showAllSupplyDropdown[distributor.id] && styles.distributorRowWithDropdown
                        ]}
                      >
                        <View
                          style={[styles.distributorInfoColumn, { flex: 1.5 }]}
                        >
                          <AppText style={styles.distributorRowName}>
                            {distributor.name}
                          </AppText>
                          <AppText style={styles.distributorRowCode}>
                            {distributor.code} | {distributor.cityName || 'N/A'}
                          </AppText>
                        </View>

                        <View style={[styles.supplyTypeColumn, styles.supplyTypeWrapper, { flex: 1 }]}>
                          <TouchableOpacity
                            style={styles.supplyTypeDropdown}
                            onPress={() => toggleAllSupplyDropdown(distributor.id)}
                            activeOpacity={0.85}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <AppText style={styles.supplyTypeText}>
                              {allDistributorSupplyType[distributor.id] ||
                                (distributor.inviteStatusId === 2 ? 'Chargeback (CM)' : 'NetRate (DM)')}
                            </AppText>
                            <IconMaterial name="keyboard-arrow-down" size={20} color="#999" />
                          </TouchableOpacity>

                          {showAllSupplyDropdown[distributor.id] && (
                            <View
                              style={[
                                styles.dropdownMenu,
                                styles.supplyDropdownMenu, // extra positioning/width
                              ]}
                              pointerEvents="auto"
                            >
                              <TouchableOpacity
                                style={styles.dropdownMenuItem}
                                onPress={() =>
                                  handleAllDistributorSupplySelect(distributor.id, 'NetRate (DM)')
                                }
                                hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
                              >
                                <AppText style={styles.dropdownMenuText}>NetRate (DM)</AppText>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={[styles.dropdownMenuItem, styles.dropdownMenuItemLast]}
                                onPress={() =>
                                  handleAllDistributorSupplySelect(distributor.id, 'Chargeback (CM)')
                                }
                                hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
                              >
                                <AppText style={styles.dropdownMenuText}>Chargeback (CM)</AppText>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>


                        <View style={[styles.actionColumn, { flex: 0.6 }]}>
                          <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => handleAddDistributor(distributor)}
                          >
                            <AppText style={styles.addButtonText}>
                              + Add
                            </AppText>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  )}
                </>
              )}
            </>
          )}
        </ScrollView>

      )}


      {activeDistributorTab === 'all' && hasAllDistributorPermission && (
        <ScrollView style={styles.scrollContent}>
          {distributorsError ? (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={40} color="#EF4444" />
              <AppText style={styles.errorText}>
                Error loading distributors
              </AppText>
              <AppText style={styles.errorSubText}>{distributorsError}</AppText>
            </View>
          ) : (
            <>
              {/* Filters */}

              {/* <View style={styles.suggestedSection}>
              <AppText style={styles.suggestedTitle}>
                Suggested Stockist by MR
              </AppText>
              <TouchableOpacity style={styles.infoIcon}>
                <Icon name="information-outline" size={20} color="#333" />
              </TouchableOpacity>
            </View> */}
              <View style={styles.filterRow}>

                <TouchableOpacity
                  style={styles.filterIcon}
                  onPress={() => setShowFilterModal(true)}
                >
                  <Icon name="tune" size={20} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.filterDropdown}
                  onPress={() => setShowFilterModal(true)}
                >
                  <AppText style={styles.filterText}>
                    {distributorFilters.state.length > 0 &&
                      !distributorFilters.state.includes('All')
                      ? `State (${distributorFilters.state.length})`
                      : 'State'}
                  </AppText>
                  <IconMaterial
                    name="keyboard-arrow-down"
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.filterDropdown}
                  onPress={() => setShowFilterModal(true)}
                >
                  <AppText style={styles.filterText}>
                    {distributorFilters.city.length > 0 &&
                      !distributorFilters.city.includes('All')
                      ? `City (${distributorFilters.city.length})`
                      : 'City'}
                  </AppText>
                  <IconMaterial
                    name="keyboard-arrow-down"
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              {/* Search */}
              <View style={styles.searchContainer}>
                <IconFeather name="search" size={20} color="#999" />
                <AppInput
                  style={styles.searchInput}
                  placeholder="Search by distributor name & code"
                  placeholderTextColor="#999"
                  value={searchText}
                  onChangeText={setSearchText}
                />
              </View>

              {/* Table Header */}
              <View style={styles.tableHeader}>
                <AppText style={[styles.tableHeaderText, { flex: 1.5 }]}>
                  Name, Code & City
                </AppText>
                <AppText
                  style={[
                    styles.tableHeaderText,
                    { flex: 1, textAlign: 'center' },
                  ]}
                >
                  Supply type
                </AppText>
                <AppText
                  style={[
                    styles.tableHeaderText,
                    { flex: 0.6, textAlign: 'right' },
                  ]}
                >
                  Action
                </AppText>
              </View>

              {/* Distributor List Area: show skeleton while loading, error or actual rows otherwise */}
              {distributorsLoading ? (
                <DistributorListSkeleton rows={6} />
              ) : distributorsError ? (
                <View style={styles.errorContainer}>
                  <Icon name="alert-circle" size={40} color="#EF4444" />
                  <AppText style={styles.errorText}>
                    Error loading distributors
                  </AppText>
                  <AppText style={styles.errorSubText}>
                    {distributorsError}
                  </AppText>
                </View>
              ) : (
                <>
                  {filteredDistributorsData.length === 0 ? (
                    <View style={styles.emptyContainer}>
                      <Icon
                        name="package-variant-closed"
                        size={40}
                        color="#999"
                      />
                      <AppText style={styles.emptyText}>
                        {allDistributorsData.length === 0
                          ? 'No distributors available'
                          : 'No distributors match the selected filters'}
                      </AppText>
                    </View>
                  ) : (
                    filteredDistributorsData.map(distributor => (
                      <View
                        key={`${distributor.id}-${distributor.name}`}
                        style={[
                          styles.distributorRow,
                          showAllSupplyDropdown[distributor.id] && styles.distributorRowWithDropdown
                        ]}
                      >
                        <View
                          style={[styles.distributorInfoColumn, { flex: 1.5 }]}
                        >
                          <AppText style={styles.distributorRowName}>
                            {distributor.name}
                          </AppText>
                          <AppText style={styles.distributorRowCode}>
                            {distributor.code} | {distributor.cityName || 'N/A'}
                          </AppText>
                        </View>

                        <View style={[styles.supplyTypeColumn, styles.supplyTypeWrapper, { flex: 1 }]}>
                          <TouchableOpacity
                            style={styles.supplyTypeDropdown}
                            onPress={() => toggleAllSupplyDropdown(distributor.id)}
                            activeOpacity={0.85}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <AppText style={styles.supplyTypeText}>
                              {allDistributorSupplyType[distributor.id] ||
                                (distributor.inviteStatusId === 2 ? 'Chargeback (CM)' : 'NetRate (DM)')}
                            </AppText>
                            <IconMaterial name="keyboard-arrow-down" size={20} color="#999" />
                          </TouchableOpacity>

                          {showAllSupplyDropdown[distributor.id] && (
                            <View
                              style={[
                                styles.dropdownMenu,
                                styles.supplyDropdownMenu, // extra positioning/width
                              ]}
                              pointerEvents="auto"
                            >
                              <TouchableOpacity
                                style={styles.dropdownMenuItem}
                                onPress={() =>
                                  handleAllDistributorSupplySelect(distributor.id, 'NetRate (DM)')
                                }
                                hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
                              >
                                <AppText style={styles.dropdownMenuText}>NetRate (DM)</AppText>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={[styles.dropdownMenuItem, styles.dropdownMenuItemLast]}
                                onPress={() =>
                                  handleAllDistributorSupplySelect(distributor.id, 'Chargeback (CM)')
                                }
                                hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
                              >
                                <AppText style={styles.dropdownMenuText}>Chargeback (CM)</AppText>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>


                        <View style={[styles.actionColumn, { flex: 0.6 }]}>
                          <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => handleAddDistributor(distributor)}
                          >
                            <AppText style={styles.addButtonText}>
                              + Add
                            </AppText>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  )}
                </>
              )}
            </>
          )}
        </ScrollView>

      )}

      {activeDistributorTab === 'linked' && (
        <View style={{ flex: 1, overflow: 'visible' }}>
          <ScrollView
            style={[styles.scrollContent, { overflow: 'visible' }]}
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            {/* Header */}
            <View style={styles.suggestedSection}>
              <AppText style={styles.suggestedTitle}>
                Suggested Stockist by MR
              </AppText>
              <Icon name="information-outline" size={16} color="#6B7280" />
            </View>

            {distributorsLoading ? (
              <View style={styles.loadingContainer}>
                <Icon name="loading" size={40} color="#FF6B00" />
                <AppText style={styles.loadingText}>Loading linked distributors...</AppText>
              </View>
            ) : distributorsError ? (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={40} color="#EF4444" />
                <AppText style={styles.errorText}>Error loading linked distributors</AppText>
                <AppText style={styles.errorSubText}>{distributorsError}</AppText>
              </View>
            ) : linkedDistributorsData.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="account-multiple-outline" size={40} color="#999" />
                <AppText style={styles.emptyText}>No linked distributors found</AppText>
              </View>
            ) : (
              linkedDistributorsData.map(item => {

                const distId = String(item.id || item.distributorId);
                const isOpen =
                  showAllDivisionsDropdown[distId] ||
                  showLinkedOrgCodeDropdown[distId];
                return (
                  <View key={distId} style={[
                    styles.linkedCard,
                    isOpen && {
                      zIndex: 10000,
                      elevation: 50, // Android
                    },
                  ]}>

                    {/* NAME + MARGIN LABEL */}
                    <View style={styles.topRow}>
                      <View style={{ flex: 1 }}>
                        <AppText style={styles.name}>{item.name || item.distributorName}</AppText>

                      </View>
                      {/* <AppText style={styles.marginLabel}>Margin</AppText> */}
                    </View>

                    {/* DROPDOWNS + MARGIN */}
                    <View style={styles.middleRow}>

                      <View>

                        <AppText style={styles.subTextLiked}>
                          {(item.code || item.distributorCode) || 'N/A'} | {item.cityName || 'N/A'}
                        </AppText>

                        <View style={styles.middleRowDropdown}>
                          {/* Organization Code Dropdown (SPLL/SPIL) */}
                          <View style={styles.dropdownWrapper}>
                            <TouchableOpacity
                              style={styles.dropdown}
                              onPress={() => {
                                const distId = String(item.id || item.distributorId);
                                // Close other dropdowns when opening this one
                                setShowAllDivisionsDropdown(prev => ({ ...prev, [distId]: false }));
                                setShowLinkedOrgCodeDropdown(prev => ({
                                  ...prev,
                                  [distId]: !prev[distId],
                                }));
                              }}
                            >
                              <AppText style={styles.dropdownText}>
                                {linkedDistributorOrgCodes[String(item.id || item.distributorId)] || item.organizationCode || 'SPLL'}
                              </AppText>
                              <IconMaterial
                                name="keyboard-arrow-down"
                                size={18}
                                color="#6B7280"
                              />
                            </TouchableOpacity>

                            {showLinkedOrgCodeDropdown[String(item.id || item.distributorId)] && (
                              <View style={styles.orgCodeDropdownMenu}>
                                <TouchableOpacity
                                  style={styles.dropdownMenuItem}
                                  onPress={() => {
                                    const distId = String(item.id || item.distributorId);
                                    setLinkedDistributorOrgCodes(prev => ({
                                      ...prev,
                                      [distId]: 'SPLL',
                                    }));
                                    setShowLinkedOrgCodeDropdown(prev => ({
                                      ...prev,
                                      [distId]: false,
                                    }));
                                  }}
                                >
                                  <AppText style={styles.dropdownMenuText}>SPLL</AppText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={[styles.dropdownMenuItem, styles.dropdownMenuItemLast]}
                                  onPress={() => {
                                    const distId = String(item.id || item.distributorId);
                                    setLinkedDistributorOrgCodes(prev => ({
                                      ...prev,
                                      [distId]: 'SPIL',
                                    }));
                                    setShowLinkedOrgCodeDropdown(prev => ({
                                      ...prev,
                                      [distId]: false,
                                    }));
                                  }}
                                >
                                  <AppText style={styles.dropdownMenuText}>SPIL</AppText>
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>

                          {/* All Divisions Dropdown - Shows requested divisions with checkboxes */}
                          <View style={styles.dropdownWrapper}>
                            <TouchableOpacity
                              style={[
                                styles.dropdown,
                                (() => {
                                  const distId = String(item.id || item.distributorId);
                                  const selectedDivs = linkedDistributorSelectedDivisions[distId] || [];
                                  const hasSelection = selectedDivs.length > 0;
                                  return !hasSelection ? styles.dropdownError : null;
                                })()
                              ]}
                              onPress={() => {
                                const distId = String(item.id || item.distributorId);
                                // Close other dropdowns when opening this one
                                setShowLinkedOrgCodeDropdown(prev => ({ ...prev, [distId]: false }));
                                setShowAllDivisionsDropdown(prev => ({
                                  ...prev,
                                  [distId]: !prev[distId],
                                }));
                              }}
                            >
                              <AppText style={styles.dropdownText}>
                                {(() => {
                                  const distId = String(item.id || item.distributorId);
                                  const selectedDivs = linkedDistributorSelectedDivisions[distId] || [];
                                  if (selectedDivs.length === 0) {
                                    return 'All Divisions';
                                  } else if (selectedDivs.length === 1) {
                                    const divId = selectedDivs[0];
                                    const div = mergedRequestedDivisions.find(d => String(d.divisionId || d.id) === divId);
                                    return div ? `${div.divisionName || div.name}` : 'All Divisions';
                                  } else {
                                    return `${selectedDivs.length} Selected`;
                                  }
                                })()}
                              </AppText>
                              <IconMaterial
                                name="keyboard-arrow-down"
                                size={18}
                                color="#6B7280"
                              />
                            </TouchableOpacity>

                            {showAllDivisionsDropdown[String(item.id || item.distributorId)] && (
                              <View style={[styles.dropdownMenu, styles.allDivisionsDropdownMenu]}>
                                {mergedRequestedDivisions && mergedRequestedDivisions.length > 0 ? (
                                  mergedRequestedDivisions.map((division, index) => {
                                    const distId = String(item.id || item.distributorId);
                                    const divisionId = String(division.divisionId || division.id);
                                    const selectedDivs = linkedDistributorSelectedDivisions[distId] || [];
                                    const isSelected = selectedDivs.includes(divisionId);

                                    return (
                                      <TouchableOpacity
                                        key={`${division.divisionId || division.id}-${index}`}
                                        style={[
                                          styles.dropdownMenuItem,
                                          styles.dropdownMenuItemWithCheckbox,
                                          index === mergedRequestedDivisions.length - 1 && styles.dropdownMenuItemLast
                                        ]}
                                        onPress={() => {
                                          const currentSelected = linkedDistributorSelectedDivisions[distId] || [];
                                          let newSelected;

                                          if (isSelected) {
                                            // If trying to deselect, ensure at least one remains selected
                                            if (currentSelected.length > 1) {
                                              newSelected = currentSelected.filter(id => id !== divisionId);
                                            } else {
                                              // Cannot deselect the last one
                                              return;
                                            }
                                          } else {
                                            // Add to selection
                                            newSelected = [...currentSelected, divisionId];
                                          }

                                          setLinkedDistributorSelectedDivisions(prev => ({
                                            ...prev,
                                            [distId]: newSelected,
                                          }));
                                        }}
                                      >
                                        <View style={styles.checkboxContainer}>
                                          <View style={[
                                            styles.checkbox,
                                            isSelected && styles.checkboxSelected
                                          ]}>
                                            {isSelected && (
                                              <IconMaterial name="check" size={14} color="#fff" />
                                            )}
                                          </View>
                                        </View>
                                        <AppText style={styles.dropdownMenuText}>
                                          {division.divisionName || division.name} ({division.divisionCode || division.code})
                                        </AppText>
                                      </TouchableOpacity>
                                    );
                                  })
                                ) : (
                                  <View style={styles.dropdownMenuItem}>
                                    <AppText style={styles.dropdownMenuText}>No divisions available</AppText>
                                  </View>
                                )}
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                      <View>
                        <AppText style={styles.subTextLiked}>Margin</AppText>

                        <View style={styles.marginBox}>
                          <AppInput
                            value={linkedDistributorMargins[String(item.id || item.distributorId)] ||
                              item.doctorSupplyMargin ||
                              item.hospitalSupplyMargin ||
                              ''}
                            onChangeText={(text) => {
                              const distId = String(item.id || item.distributorId);
                              setLinkedDistributorMargins(prev => ({
                                ...prev,
                                [distId]: text,
                              }));
                            }}
                            keyboardType="numeric"
                            style={styles.marginInput}
                          />
                          <AppText style={styles.percent}>%</AppText>
                        </View>
                      </View>
                    </View>

                    {/* RADIO + REMOVE */}
                    <View style={styles.bottomRow}>
                      <View style={styles.radioRow}>
                        <TouchableOpacity
                          style={styles.radioItem}
                          onPress={() => {
                            const distId = String(item.id || item.distributorId);
                            setLinkedDistributorSupplyModes(prev => ({
                              ...prev,
                              [distId]: '0', // Net Rate
                            }));
                          }}
                        >
                          <View style={[
                            styles.radioOuter,
                            linkedDistributorSupplyModes[String(item.id || item.distributorId)] === '0' && styles.radioSelected
                          ]}>
                            {linkedDistributorSupplyModes[String(item.id || item.distributorId)] === '0' && (
                              <View style={styles.radioInner} />
                            )}
                          </View>
                          <AppText style={styles.radioText}>Net Rate</AppText>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.radioItem}
                          onPress={() => {
                            const distId = String(item.id || item.distributorId);
                            setLinkedDistributorSupplyModes(prev => ({
                              ...prev,
                              [distId]: '1', // Chargeback
                            }));
                          }}
                        >
                          <View style={[
                            styles.radioOuter,
                            linkedDistributorSupplyModes[String(item.id || item.distributorId)] === '1' && styles.radioSelected
                          ]}>
                            {linkedDistributorSupplyModes[String(item.id || item.distributorId)] === '1' && (
                              <View style={styles.radioInner} />
                            )}
                          </View>
                          <AppText style={styles.radioText}>Chargeback</AppText>
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity style={styles.removeBtn}>
                        <AppText style={styles.removeText}>Remove</AppText>
                        <IconFeather
                          name="trash-2"
                          size={15}
                          color="#F97316"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                )
              }))}
          </ScrollView>

          {/* FINISH BUTTON */}
          <View style={styles.finishContainer}>
            <TouchableOpacity
              style={styles.finishBtn}
              onPress={handleFinishLinkedDistributors}
              disabled={linkingDistributors}
            >
              <AppText style={styles.finishText}>
                {linkingDistributors ? 'Processing...' : 'Finish'}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      )}







    </View>
  );





  const renderDivisionsTab = () => (
    <View style={styles.tabContent}>
      {divisionsLoading ? (
        <View style={styles.loadingContainer}>
          <Icon name="loading" size={40} color="#FF6B00" />
          <AppText style={styles.loadingText}>Loading divisions...</AppText>
        </View>
      ) : divisionsError ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={40} color="#EF4444" />
          <AppText style={styles.errorText}>Error loading divisions</AppText>
          <AppText style={styles.errorSubText}>{divisionsError}</AppText>
        </View>
      ) : (
        <>


          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentContainer}

          >

            {/* ---------- HEADER (Requested / Other / Opened) ---------- */}
            <View style={styles.headerWrapper}>
              <View style={styles.colRequested}>
                <AppText style={styles.headerTitle}>Requested</AppText>
              </View>

              {hasOtherDivisionPermission && <View style={styles.divider} />}

              {hasOtherDivisionPermission && (
                <View style={styles.colOther}>
                  <AppText style={styles.headerTitle}>Other</AppText>
                </View>
              )}

              <View style={styles.divider} />

              <View style={styles.colOpened}>
                <AppText style={styles.headerTitle}>Opened</AppText>
              </View>
            </View>

            {/* ---------- SUBHEADER LABELS (Name & Code) ---------- */}
            <View style={styles.subHeaderWrapper}>
              <View style={styles.colRequested}>
                <AppText style={styles.subHeaderText}>Name & Code</AppText>
              </View>

              {hasOtherDivisionPermission && <View style={styles.divider} />}

              {hasOtherDivisionPermission && (
                <View style={styles.colOther}>
                  <AppText style={styles.subHeaderText}>Name & Code</AppText>
                </View>
              )}

              <View style={styles.divider} />

              <View style={styles.colOpened}>
                <AppText style={styles.subHeaderText}>Name & Code</AppText>
              </View>
            </View>

            {/* ---------- BODY (3 Columns) ---------- */}
            <View style={styles.columnsRow}>


              {/* ========== REQUESTED COLUMN ========== */}
              <View style={styles.colRequested}>
                {mergedRequestedDivisions?.length > 0 ? (
                  mergedRequestedDivisions.map(div => (
                    <View key={div.divisionId || div.id} style={styles.reqRow}>
                      <AppText style={styles.divisionName}>{div.divisionName}</AppText>
                      <AppText style={styles.divisionCode}>{div.divisionCode}</AppText>
                    </View>
                  ))
                ) : (
                  <AppText style={styles.emptyText}>No requested divisions</AppText>
                )}
              </View>

              {hasOtherDivisionPermission && <View style={styles.dividerinside} />}

              {/* ========== OTHER COLUMN ========== */}
              {hasOtherDivisionPermission && (
                <View style={styles.colOther}>
                  {filteredOtherDivisionsData?.length > 0 ? (
                    filteredOtherDivisionsData.map(div => {
                      const isSelected = selectedDivisions.some(
                        d => d.divisionId === div.divisionId
                      );

                      return (
                        <TouchableOpacity
                          key={div.divisionId}
                          style={styles.otherRow}
                          onPress={() => toggleOtherDivisionSelection(div)}
                        >
                          <View
                            style={[
                              styles.checkbox,
                              isSelected && styles.checkboxSelected
                            ]}
                          >
                            {isSelected && <Icon name="check" size={14} color="#fff" />}
                          </View>

                          <View style={{ flexShrink: 1 }}>
                            <AppText style={styles.divisionName}>{div.divisionName}</AppText>
                            <AppText style={styles.divisionCode}>{div.divisionCode}</AppText>
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <AppText style={styles.emptyText}>No other divisions</AppText>
                  )}
                </View>
              )}

              <View style={styles.dividerinside} />

              {/* ========== OPENED COLUMN ========== */}
              <View style={styles.colOpened}>
                {openedDivisionsData?.length > 0 ? (
                  openedDivisionsData.map(div => (
                    <View key={div.divisionId} style={styles.openedRow}>
                      <View style={{ flexShrink: 1 }}>
                        <AppText style={styles.divisionName}>{div.divisionName}</AppText>
                        <AppText style={styles.divisionCode}>{div.divisionCode}</AppText>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.blockButton,
                          div.isBlocked && styles.unblockButton,
                          blockingDivision === div.divisionId && styles.blockButtonDisabled
                        ]}
                        onPress={() => handleBlockUnblockDivision(div)}
                        disabled={blockingDivision === div.divisionId}
                      >
                        <Icon
                          name={div.isBlocked ? "lock-open-outline" : "lock-outline"}
                          size={15}
                          color={div.isBlocked ? "#EF4444" : "#2B2B2B"}
                        />
                        <AppText
                          style={[
                            styles.blockText,
                            div.isBlocked && styles.unblockText
                          ]}
                        >
                          {blockingDivision === div.divisionId
                            ? "Processing..."
                            : div.isBlocked
                              ? "Unblock"
                              : "Block"}
                        </AppText>
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <AppText style={styles.emptyText}>No opened divisions</AppText>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Sticky Continue Button at Bottom - Only show if user has selected divisions from Other column */}


          {/* {(hasApprovePermission || isCustomerActive) && selectedDivisions.length > 0 && ( */}

          <View style={styles.stickyButtonContainer}>
            <TouchableOpacity
              style={[
                styles.continueButton,
                (linkingDivisions || selectedDivisions.length === 0) &&
                styles.continueButtonDisabled,
              ]}
              onPress={handleLinkDivisionsAPI}
              disabled={linkingDivisions || selectedDivisions.length === 0}
            >
              {linkingDivisions ? (
                <AppText style={styles.linkButtonText}>Linking...</AppText>
              ) : (
                <AppText style={styles.linkButtonText}>Link Division</AppText>
              )}
            </TouchableOpacity>
          </View>
          {/* )} */}
        </>
      )}
    </View>
  );

  // Field skeleton loader component
  const FieldListSkeleton = ({ rows = 8 }) => {
    return (
      <View style={styles.fieldSkeletonContainer}>
        {Array.from({ length: rows }).map((_, i) => (
          <View key={`field-skeleton-${i}`} style={styles.fieldSkeletonRow}>
            <View style={styles.fieldSkeletonNameColumn}>
              <View style={styles.fieldSkeletonName} />
              <View style={styles.fieldSkeletonCode} />
            </View>
            <View style={styles.fieldSkeletonDivisionColumn}>
              <View style={styles.fieldSkeletonDivision} />
              <View style={styles.fieldSkeletonDivisionCode} />
            </View>
            <View style={styles.fieldSkeletonDesignationColumn}>
              <View style={styles.fieldSkeletonDesignation} />
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderFieldTab = () => (
    <View style={styles.tabContent}>
      {/* Sticky Header */}
      <View style={styles.fieldStickyHeader}>
        <AppText style={[styles.fieldHeaderText, styles.fieldHeaderName]}>
          Name
        </AppText>
        <AppText style={[styles.fieldHeaderText, styles.fieldHeaderDivision]}>
          Division
        </AppText>
        <AppText style={[styles.fieldHeaderText, styles.fieldHeaderDesignation]}>
          Designation
        </AppText>
      </View>

      {/* Scrollable Content */}
      {fieldTeamLoading && fieldTeamData.length === 0 ? (
        <FieldListSkeleton rows={8} />
      ) : fieldTeamError ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={40} color="#EF4444" />
          <AppText style={styles.errorText}>Error loading field team</AppText>
          <AppText style={styles.errorSubText}>{fieldTeamError}</AppText>
        </View>
      ) : fieldTeamData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="account-multiple-outline" size={40} color="#999" />
          <AppText style={styles.emptyText}>
            No field team members found
          </AppText>
        </View>
      ) : (
        <ScrollView
          style={styles.fieldScrollContent}
          contentContainerStyle={styles.fieldScrollContentContainer}
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const paddingToBottom = 20;
            const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

            if (isCloseToBottom && fieldTeamHasMore && !fieldTeamLoadingMore && !fieldTeamLoading) {
              fetchFieldTeamData(fieldTeamPage, true);
            }
          }}
          scrollEventThrottle={400}
        >
          {fieldTeamData.map((employee, index) => (
            <View key={employee.id || employee.userId || index} style={styles.fieldRow}>
              <View style={styles.fieldNameColumn}>
                <AppText style={styles.employeeName}>
                  {employee.userName || employee.name || '—'}
                </AppText>
                <AppText style={styles.employeeCode}>
                  {employee.userCode || employee.code || employee.userId || '—'}
                </AppText>
              </View>
              <View style={styles.fieldDivisionColumn}>
                <AppText style={styles.employeeDivision}>
                  {employee?.divisions?.[0]?.divisionName || '—'}
                </AppText>
                <AppText style={styles.employeeDivisionCode}>
                  {employee?.divisions?.[0]?.divisionCode || '—'}
                </AppText>
              </View>
              <View style={styles.fieldDesignationColumn}>
                <AppText style={styles.employeeDesignation}>
                  {employee.designation || '—'}
                </AppText>
              </View>
            </View>
          ))}

          {fieldTeamLoadingMore && (
            <View style={styles.loadingMoreContainer}>
              <Icon name="loading" size={30} color="#FF6B00" />
              <AppText style={styles.loadingMoreText}>Loading more...</AppText>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );

  const renderCustomerHierarchyTab = () => {
    // Check if hierarchyMappingData is null or undefined
    if (!hierarchyMappingData) {
      return (
        <View style={styles.tabContent}>
          <View style={styles.scrollContent}>
            <View style={styles.emptyContainer}>
              <Icon name="inbox" size={50} color="#999" />
              <AppText style={styles.emptyText}>No data found</AppText>
              <AppText style={styles.emptySubText}>
                Linked data will appear here
              </AppText>
            </View>
          </View>
        </View>
      );
    }

    // Check if all arrays are empty or don't exist
    const doctors = hierarchyMappingData?.doctors || [];
    const pharmacy = hierarchyMappingData?.pharmacy || [];
    const hospitals = hierarchyMappingData?.hospitals || [];
    const groupHospitals = hierarchyMappingData?.groupHospitals || [];

    // Helper function to check if an item has been processed (approved/rejected)
    // An item is considered "processed" if it has the isApproved property
    // If isApproved is not present, show approve/reject buttons
    const isItemProcessed = (item) => {
      // Check if item has isApproved property (regardless of value)
      // If isApproved exists (true or false), item is processed
      // If isApproved doesn't exist, item is not processed - show buttons
      return item.hasOwnProperty('isApproved') || item.isApproved !== undefined;
    };

    if ((!doctors || doctors.length === 0) &&
      (!pharmacy || pharmacy.length === 0) &&
      (!hospitals || hospitals.length === 0) &&
      (!groupHospitals || groupHospitals.length === 0)) {
      return (
        <View style={styles.tabContent}>
          <View style={styles.scrollContent}>
            <View style={styles.emptyContainer}>
              <Icon name="inbox" size={50} color="#999" />
              <AppText style={styles.emptyText}>No data found</AppText>
              <AppText style={styles.emptySubText}>
                Linked data will appear here
              </AppText>
            </View>
          </View>
        </View>
      );
    }

    /* =====================================================
       DOCTOR → ONLY PHARMACIES (SIMPLE LIST)
    ===================================================== */
    if (customerType === 'Doctors') {
      return (
        <View style={styles.tabContent}>
          <ScrollView style={styles.scrollContent}>
            <View style={styles.hierarchySection}>
              <AppText style={styles.hierarchySectionTitle}>
                Linked Pharmacies
              </AppText>

              <View style={styles.hierarchyHeader}>
                <AppText style={styles.hierarchyHeaderLeft}>
                  Pharmacy Details
                </AppText>
                <AppText style={styles.hierarchyHeaderRight}>
                  Action
                </AppText>
              </View>


              {pharmacy.map(item => (
                <View key={item.customerId || item.id || `pharmacy-${item.customerCode || item.customerName}`} style={styles.hierarchyRow}>
                  <View style={styles.hierarchyInfo}>
                    <AppText style={styles.hierarchyName}>
                      {item.customerName}
                    </AppText>
                    <AppText style={styles.hierarchyCode}>
                      {item.customerCode} | {item.cityName}
                    </AppText>
                  </View>

                  <View style={styles.hierarchyActions}>
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.approveButton}
                        onPress={() => handleHierarchyApprove(item, 'pharmacy')}
                      >
                        <Icon name="check" size={14} color="#fff" />
                        <AppText style={styles.approveButtonText}>Approve</AppText>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.rejectButton}
                        onPress={() => handleHierarchyReject(item, 'pharmacy')}
                      >
                        <Icon name="close" size={14} color="#2B2B2B" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      );
    }

    /* =====================================================
       HOSPITAL → GROUPED (ACCORDION DESIGN)
    ===================================================== */
    if (customerType === 'Hospital' && groupHospitals.length > 0) {
      return (
        <View style={styles.tabContent}>
          <ScrollView style={styles.scrollContent}>
            {groupHospitals.map(hospital => {
              const isExpanded =
                expandedGroupHospitals[hospital.customerId];
              const activeTab =
                activeGroupHospitalTab[hospital.customerId] || 'pharmacies';

              return (
                <View key={hospital.customerId} style={styles.accordionCard}>
                  {/* HEADER */}
                  <TouchableOpacity
                    style={styles.accordionHeader}
                    onPress={() =>
                      setExpandedGroupHospitals(prev => ({
                        ...prev,
                        [hospital.customerId]: !prev[hospital.customerId],
                      }))
                    }
                  >
                    <View style={styles.accordionHeaderInfo}>
                      <AppText style={styles.accordionHospitalName}>
                        {hospital.customerName}
                      </AppText>
                      <AppText style={styles.accordionHospitalCode}>
                        {hospital.customerCode} | {hospital.cityName}
                      </AppText>

                      {isExpanded && (
                        <View style={styles.accordionTabsContainer}>
                          {['pharmacies', 'doctors'].map(tab => (
                            <TouchableOpacity
                              key={tab}
                              style={[
                                styles.accordionTab,
                                activeTab === tab &&
                                styles.activeAccordionTab,
                              ]}
                              onPress={() =>
                                setActiveGroupHospitalTab(prev => ({
                                  ...prev,
                                  [hospital.customerId]: tab,
                                }))
                              }
                            >
                              <AppText
                                style={[
                                  styles.accordionTabText,
                                  activeTab === tab &&
                                  styles.activeAccordionTabText,
                                ]}
                              >
                                {tab === 'pharmacies'
                                  ? 'Pharmacies'
                                  : 'Doctors'}
                              </AppText>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* CONTENT */}
                  {isExpanded && (
                    <View style={styles.accordionContent}>
                      <View style={styles.accordionItemsContainer}>
                        <View style={styles.accordionItemsHeader}>
                          <AppText style={styles.accordionItemsHeaderText}>
                            {activeTab === 'pharmacies'
                              ? 'Pharmacy Details'
                              : 'Doctor Details'}
                          </AppText>
                          <AppText style={styles.accordionItemsHeaderText}>
                            Action
                          </AppText>
                        </View>

                        {(activeTab === 'pharmacies'
                          ? pharmacy
                          : doctors
                        ).map(item => (
                          <View
                            key={item.customerId || item.id || `${activeTab}-${item.customerCode || item.customerName}`}
                            style={styles.accordionItemRow}
                          >
                            <View style={styles.accordionItemInfo}>
                              <AppText style={styles.accordionItemName}>
                                {item.customerName}
                              </AppText>
                              <AppText style={styles.accordionItemCode}>
                                {item.customerCode} | {item.cityName}
                              </AppText>
                            </View>

                            <View style={styles.accordionItemActions}>
                              {isItemProcessed(item) ? (
                                <View style={styles.statusRow}>
                                  {item.isApproved ? (
                                    <>
                                      <IconMaterial name="check" size={18} color="#16A34A" />
                                      <AppText style={[styles.statusText, styles.approvedText]}>
                                        APPROVED
                                      </AppText>
                                    </>

                                  ) : (
                                    <>
                                      <View style={styles.rejectedIconCircle}>
                                        <IconMaterial name="close" size={14} color="#EF4444" />
                                      </View>
                                      <AppText style={[styles.statusText, styles.rejectedText]}>
                                        REJECTED
                                      </AppText>
                                    </>
                                  )}
                                </View>
                              ) : (
                                <>
                                  <TouchableOpacity
                                    style={styles.approveButton}
                                    onPress={() => handleHierarchyApprove(item, activeTab === 'pharmacies' ? 'pharmacy' : 'doctor')}
                                  >
                                    <Icon name="check" size={14} color="#fff" />
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    style={styles.rejectButton}
                                    onPress={() => handleHierarchyReject(item, activeTab === 'pharmacies' ? 'pharmacy' : 'doctor')}
                                  >
                                    <Icon name="close" size={14} color="#2B2B2B" />
                                  </TouchableOpacity>
                                </>
                              )}
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>
      );
    }

    /* =====================================================
       HOSPITAL → SIMPLE (NO GROUP)
    ===================================================== */
    return (
      <View style={styles.tabContent}>
        <ScrollView style={styles.scrollContent}>
          {[{ list: pharmacy, title: 'Linked Pharmacies', header: 'Pharmacy Details' },
          { list: doctors, title: 'Linked Doctors', header: 'Doctor Details' },
          { list: hospitals, title: 'Linked Hospitals', header: 'Hospital Details' },
          ].map(
            ({ list, title, header }) => {
              if (list.length === 0) return null;
              return (
                <View key={title} style={styles.hierarchySection}>
                  <AppText style={styles.hierarchySectionTitle}>
                    {title}
                  </AppText>



                  <View style={styles.hierarchyHeader}>
                    <AppText style={styles.hierarchyHeaderLeft}>
                      {header}
                    </AppText>
                    <AppText style={styles.hierarchyHeaderRight}>
                      Action
                    </AppText>
                  </View>

                  {list.map(item => (
                    <View key={item.customerId || item.id || `${title}-${item.customerCode || item.customerName}`} style={styles.hierarchyRow}>
                      <View style={styles.hierarchyInfo}>
                        <AppText style={styles.hierarchyName}>
                          {item.customerName}
                        </AppText>
                        <AppText style={styles.hierarchyCode}>
                          {item.customerCode} | {item.cityName}
                        </AppText>
                      </View>

                      <View style={styles.hierarchyActions}>
                        {isItemProcessed(item) ? (
                          <View style={styles.statusRow}>
                            {item.isApproved ? (
                              <>
                                <IconMaterial name="check" size={18} color="#16A34A" />
                                <AppText style={[styles.statusText, styles.approvedText]}>
                                  APPROVED
                                </AppText>
                              </>

                            ) : (
                              <>
                                <View style={styles.rejectedIconCircle}>
                                  <IconMaterial name="close" size={14} color="#EF4444" />
                                </View>
                                <AppText style={[styles.statusText, styles.rejectedText]}>
                                  REJECTED
                                </AppText>
                              </>
                            )}
                          </View>
                        ) : (
                          <View style={styles.actionButtons}>
                            <TouchableOpacity
                              style={styles.approveButton}
                              onPress={() => {
                                let itemType = 'hospital';
                                if (title === 'Linked Pharmacies') itemType = 'pharmacy';
                                else if (title === 'Linked Doctors') itemType = 'doctor';
                                else if (title === 'Linked Hospitals') itemType = 'hospital';
                                handleHierarchyApprove(item, itemType);
                              }}
                            >
                              <Icon name="check" size={14} color="#fff" />
                              <AppText style={styles.approveButtonText}>Approve</AppText>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.rejectButton}
                              onPress={() => {
                                let itemType = 'hospital';
                                if (title === 'Linked Pharmacies') itemType = 'pharmacy';
                                else if (title === 'Linked Doctors') itemType = 'doctor';
                                else if (title === 'Linked Hospitals') itemType = 'hospital';
                                handleHierarchyReject(item, itemType);
                              }}
                            >
                              <Icon name="close" size={14} color="#2B2B2B" />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              );
            }
          )}
        </ScrollView>
      </View>
    );
  };

  // Toggle organization code (SPIL/SPILL) for a division
  const toggleDivisionOrgCode = (divisionId, orgCode) => {
    setDivisionOrgCodes(prev => {
      const current = prev[divisionId] || {};
      return {
        ...prev,
        [divisionId]: {
          ...current,
          [orgCode]: !current[orgCode],
        },
      };
    });
  };

  const DivisionSelectionModal = () => {
    // Use mergedRequestedDivisions (requested divisions) for the modal
    const divisionsToShow = mergedRequestedDivisions || [];

    return (
      <Modal
        visible={showDivisionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDivisionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.divisionModalContent}>
            <View style={styles.modalHeader}>
              <AppText style={styles.modalTitle}>All Divisions</AppText>
              <TouchableOpacity onPress={() => setShowDivisionModal(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.divisionModalHeader}>
              <AppText style={styles.divisionModalHeaderText}>Name</AppText>
              <AppText style={styles.divisionModalHeaderText}>Code</AppText>
              <AppText style={styles.divisionModalHeaderText}>Organization</AppText>
            </View>

            <ScrollView style={styles.divisionModalList}>
              {divisionsToShow.length === 0 ? (
                <View style={styles.divisionModalItem}>
                  <AppText style={styles.emptyText}>No divisions available</AppText>
                </View>
              ) : (
                divisionsToShow.map(division => {
                  const divisionId = String(division.divisionId || division.id);
                  const orgCodes = divisionOrgCodes[divisionId] || {};

                  return (
                    <View key={divisionId} style={styles.divisionModalItemWithCheckboxes}>
                      <View style={styles.divisionModalItemMain}>
                        <View
                          style={[
                            styles.checkbox,
                            (orgCodes.SPIL || orgCodes.SPILL) && styles.checkboxSelected,
                          ]}
                        >
                          {(orgCodes.SPIL || orgCodes.SPILL) && (
                            <Icon name="check" size={16} color="#fff" />
                          )}
                        </View>
                        <AppText style={styles.divisionModalName}>
                          {division.divisionName || division.name}
                        </AppText>
                        <AppText style={styles.divisionModalCode}>
                          {division.divisionCode || division.code}
                        </AppText>
                      </View>

                      {/* SPIL and SPILL checkboxes */}
                      <View style={styles.orgCodeCheckboxes}>
                        <TouchableOpacity
                          style={styles.orgCodeCheckboxItem}
                          onPress={() => toggleDivisionOrgCode(divisionId, 'SPIL')}
                        >
                          <View
                            style={[
                              styles.checkbox,
                              orgCodes.SPIL && styles.checkboxSelected,
                            ]}
                          >
                            {orgCodes.SPIL && (
                              <Icon name="check" size={16} color="#fff" />
                            )}
                          </View>
                          <AppText style={styles.orgCodeText}>SPIL</AppText>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.orgCodeCheckboxItem}
                          onPress={() => toggleDivisionOrgCode(divisionId, 'SPILL')}
                        >
                          <View
                            style={[
                              styles.checkbox,
                              orgCodes.SPILL && styles.checkboxSelected,
                            ]}
                          >
                            {orgCodes.SPILL && (
                              <Icon name="check" size={16} color="#fff" />
                            )}
                          </View>
                          <AppText style={styles.orgCodeText}>SPILL</AppText>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.stickyTabsContainer}>
          <ScrollView
            ref={tabScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.subTabsContainer}
            scrollEventThrottle={16}
          >
            <TouchableOpacity
              ref={ref => (tabRefs.current['divisions'] = ref)}
              style={[
                styles.subTab,
                activeSubTab === 'divisions' && styles.activeSubTab,
              ]}
              onPress={() => handleTabPress('divisions')}
            >
              <Divisions color={activeSubTab === 'divisions' ? '#000' : '#999'} />
              <AppText
                style={[
                  styles.subTabText,
                  activeSubTab === 'divisions' && styles.activeSubTabText,
                ]}
              >
                Divisions
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.subTab,
                activeSubTab === 'distributors' && styles.activeSubTab,
              ]}
              ref={ref => (tabRefs.current['distributors'] = ref)}
              onPress={() => handleTabPress('distributors')}
            >
              <Distributors
                color={
                  activeSubTab === 'distributors'
                    ? '#000'
                    : '#999'
                }
              />

              <AppText
                style={[
                  styles.subTabText,
                  activeSubTab === 'distributors' && styles.activeSubTabText,
                ]}
              >
                Distributors
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.subTab,
                activeSubTab === 'field' && styles.activeSubTab,
              ]}
              ref={ref => (tabRefs.current['field'] = ref)}
              onPress={() => handleTabPress('field')}
            >
              <Field
                color={
                  activeSubTab === 'field'
                    ? '#000'
                    : '#999'
                }
              />
              <AppText
                style={[
                  styles.subTabText,
                  activeSubTab === 'field' && styles.activeSubTabText,
                ]}
              >
                Field
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.subTab,
                activeSubTab === 'hierarchy' && styles.activeSubTab,
              ]}
              onPress={() => handleTabPress('hierarchy')}
              ref={ref => (tabRefs.current['hierarchy'] = ref)}
            >
              <CustomerHierarchy
                color={
                  openedDivisionsData.length > 0
                    ? activeSubTab === 'hierarchy'
                      ? '#000'
                      : '#999'
                    : '#CCC'
                }
              />
              <AppText
                style={[
                  styles.subTabText,
                  activeSubTab === 'hierarchy' && styles.activeSubTabText,
                ]}
              >
                Customer Hierarchy
              </AppText>
            </TouchableOpacity>
          </ScrollView>
        </View>


        <View style={styles.tabContentWrapper}>
          {activeSubTab === 'distributors' && renderDistributorsTab()}
          {activeSubTab === 'divisions' && renderDivisionsTab()}
          {activeSubTab === 'field' && renderFieldTab()}
          {activeSubTab === 'hierarchy' && renderCustomerHierarchyTab()}
        </View>
        {/* Modals */}
        <DivisionSelectionModal />

        <LinkDivisionsModal
          visible={showLinkDivisionsModal}
          onClose={() => setShowLinkDivisionsModal(false)}
          onConfirm={handleLinkDivisionsConfirm}
        />

        <TagHospitalModal
          visible={showTagModal}
          onClose={() => setShowTagModal(false)}
          onConfirm={handleTagConfirm}
          hospitalName="this hospital"
          teamName="Instra Team"
        />

        {/* Filter Modal for Distributors */}
        <FilterModal
          visible={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          onApply={handleFilterApply}
        />


        {/* Toast Notification */}
        {toastVisible && (
          <View style={styles.toastContainer}>
            <View
              style={[
                styles.toast,
                toastType === 'success'
                  ? styles.toastSuccess
                  : styles.toastError,
              ]}
            >
              <AppText style={styles.toastText}>{toastMessage}</AppText>
            </View>
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    overflow: 'visible',
  },
  stickyTabsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10, // For Android
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16
  },
  topRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 'auto',
    paddingRight: 8,
  },
  verifyButtonTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 12,
    backgroundColor: colors.primary,
    gap: 6,
  },
  verifyButtonTopText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  rejectButtonTop: {
    width: 24,
    height: 24,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#2B2B2B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 8,
    maxHeight: 60,
    marginHorizontal: 16,
    marginTop: 10,
  },
  subTab: {
    // flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#909090',
    backgroundColor: 'transparent',
  },
  activeSubTab: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF6B00',
  },
  subTabText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#999',
    fontWeight: '400',
  },
  activeSubTabText: {
    color: '#000',
    fontWeight: '700',
  },
  disabledTab: {
    opacity: 0.5,
  },
  disabledTabText: {
    color: '#CCC',
  },
  tabContent: {
    flex: 1,

  },
  scrollContent: {
    flex: 1,
    overflow: 'visible',
  },
  scrollContentContainer: {
    paddingBottom: 100, // Add padding to ensure last item is visible above sticky button
  },
  distributorTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  distributorTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeDistributorTab: {
    // No background color when active
  },
  distributorTabText: {
    fontSize: 14,
    color: '#999',
  },
  activeDistributorTabText: {
    color: '#FF6B00',
    fontWeight: '600',
  },
  suggestedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  suggestedTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoIcon: {
    marginLeft: 8,
  },
  // Preferred Distributors Selection Mode Styles
  preferredSelectionContainer: {
    flex: 1,
  },
  backToSelectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backToSelectionText: {
    fontSize: 14,
    color: '#FF6B00',
    marginLeft: 8,
    fontWeight: '500',
  },
  preferredFiltersRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  preferredFilterDropdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  preferredFilterText: {
    fontSize: 14,
    color: '#666',
  },
  preferredSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  preferredTableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
  },
  preferredCheckboxHeader: {
    width: 40,
    alignItems: 'center',
  },
  preferredCheckboxPlaceholder: {
    width: 20,
    height: 20,
  },
  preferredHeaderText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '400',
  },
  preferredListContainer: {
    flex: 1,
  },
  preferredDistributorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  preferredCheckboxContainer: {
    width: 40,
    alignItems: 'center',
  },
  preferredCheckbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preferredCheckboxSelected: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  preferredDistributorName: {
    fontSize: 15,
    fontWeight: '400',
    color: '#333',
    marginBottom: 4,
  },
  preferredDistributorCode: {
    fontSize: 13,
    color: '#999',
  },
  preferredStockistType: {
    fontSize: 14,
    color: '#666',
  },
  preferredFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#fff',
  },
  preferredContinueButton: {
    backgroundColor: '#FF6B00',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  preferredContinueButtonDisabled: {
    backgroundColor: '#FFB380',
    opacity: 0.5,
  },
  preferredContinueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  linkDistributorsButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  linkDistributorsButton: {
    backgroundColor: '#FF6B00',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  linkDistributorsButtonDisabled: {
    backgroundColor: '#FFB380',
    opacity: 0.5,
  },
  linkDistributorsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  distributorCard: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  distributorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  distributorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  distributorInfo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  marginContainer: {
    alignItems: 'flex-end',
  },
  marginLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  marginInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  marginInput: {
    width: 40,
    height: 32,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  marginPercent: {
    fontSize: 14,
    color: '#666',
  },
  distributorActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dropdownsRow: {
    flexDirection: 'row',
    flex: 1,
    gap: 8,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  removeText: {
    fontSize: 14,
    color: '#FF6B00',
    marginRight: 4,
  },
  rateTypeRow: {
    flexDirection: 'row',
    gap: 24,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioSelected: {
    borderColor: '#FF6B00',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6B00',
  },
  radioText: {
    fontSize: 14,
    color: '#333',
  },
  addMoreButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  addMoreText: {
    fontSize: 14,
    color: '#FF6B00',
    fontWeight: '500',
  },
  linkButton: {
    backgroundColor: '#FF6B00',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  linkButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    alignItems: 'center',
  },
  filterIcon: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
  filterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterText: {
    fontSize: 14,
    color: '#333',
    marginRight: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tableHeaderText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '400',
  },
  distributorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    position: 'relative',
    zIndex: 1,
  },
  distributorRowWithDropdown: {
    zIndex: 10001,
    // elevation: 26,
  },
  distributorInfoColumn: {
    paddingRight: 12,
  },
  distributorRowName: {
    fontSize: 15,
    fontWeight: '400',
    color: '#333',
    marginBottom: 4,
  },
  distributorRowCode: {
    fontSize: 13,
    color: '#999',
  },
  supplyTypeColumn: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  supplyTypeDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  supplyTypeText: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  actionColumn: {
    alignItems: 'flex-end',
    paddingLeft: 8,
  },
  addButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  addButtonText: {
    fontSize: 15,
    color: '#FF6B00',
    fontWeight: '400',
  },
  divisionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  divisionColumn: {
    flex: 1,
  },
  divisionColumnFullWidth: {
    flex: 1,
    width: '100%',
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  assignText: {
    fontSize: 10,
    color: '#FF6B00',
    fontWeight: '600',
  },
  columnSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
  },
  divisionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  divisionName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  divisionCode: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  blockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  unblockButton: {
    borderColor: '#FF6B00',
    backgroundColor: '#FFF3E0',
  },
  blockText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  unblockText: {
    color: '#FF6B00',
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  linkDivisionsButton: {
    backgroundColor: '#FF6B00',
    marginHorizontal: 20,
    marginTop: 32,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: '#FF6B00',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  // Sticky header for field tab
  fieldStickyHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    zIndex: 10,
    elevation: 2,
  },
  fieldHeaderText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  fieldHeaderName: {
    flex: 2,
  },
  fieldHeaderDivision: {
    flex: 1.5,
    textAlign: 'center',
  },
  fieldHeaderDesignation: {
    flex: 1.5,
    textAlign: 'right',
    paddingRight: 10,
  },
  // Scrollable content area
  fieldScrollContent: {
    flex: 1,
  },
  fieldScrollContentContainer: {
    paddingBottom: 20,
  },
  // Field row styles
  fieldRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
  },
  fieldNameColumn: {
    flex: 2,
  },
  fieldDivisionColumn: {
    flex: 1.5,
    alignItems: 'center',
  },
  fieldDesignationColumn: {
    flex: 1.5,
    alignItems: 'flex-end',
    paddingRight: 10,
  },
  employeeName: {
    fontSize: 15,
    fontWeight: '400',
    color: '#333',
    marginBottom: 4,
  },
  employeeCode: {
    fontSize: 13,
    color: '#999',
  },
  employeeDivision: {
    fontSize: 15,
    fontWeight: '400',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  employeeDivisionCode: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
  },
  employeeDesignation: {
    fontSize: 15,
    color: '#666',
    textAlign: 'right',
  },
  // Field skeleton styles
  fieldSkeletonContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  fieldSkeletonRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
  },
  fieldSkeletonNameColumn: {
    flex: 2,
  },
  fieldSkeletonDivisionColumn: {
    flex: 1.5,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  fieldSkeletonDesignationColumn: {
    flex: 1.5,
    alignItems: 'flex-end',
    paddingRight: 10,
  },
  fieldSkeletonName: {
    height: 16,
    width: '70%',
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    marginBottom: 8,
  },
  fieldSkeletonCode: {
    height: 12,
    width: '40%',
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
  },
  fieldSkeletonDivision: {
    height: 16,
    width: '60%',
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    marginBottom: 8,
  },
  fieldSkeletonDivisionCode: {
    height: 12,
    width: '40%',
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
  },
  fieldSkeletonDesignation: {
    height: 16,
    width: '80%',
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
  },
  hierarchyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },


  hierarchyName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  hierarchyCode: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  // hierarchyActions: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   gap: 8,
  // },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
  },

  parentHospitalCard: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  parentLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  parentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  parentName: {
    fontSize: 14,
    color: '#333',
  },
  hierarchyTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  hierarchyTab: {
    marginRight: 24,
    paddingBottom: 8,
  },
  activeHierarchyTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B00',
  },
  hierarchyTabText: {
    fontSize: 14,
    color: '#999',
  },
  activeHierarchyTabText: {
    color: '#FF6B00',
    fontWeight: '600',
  },
  hospitalCard: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 16,
    marginBottom: 16,
  },
  hospitalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  hospitalCode: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  expandButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  expandText: {
    fontSize: 14,
    color: '#666',
  },
  linkedItemsContainer: {
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  divisionModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  divisionModalHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
  },
  divisionModalHeaderText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  divisionModalList: {
    flex: 1,
  },
  divisionModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  divisionModalItemWithCheckboxes: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  divisionModalItemMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  divisionModalName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
  },
  divisionModalCode: {
    fontSize: 14,
    color: '#666',
    width: 80,
  },
  orgCodeCheckboxes: {
    flexDirection: 'row',
    marginLeft: 28,
  },
  orgCodeCheckboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  orgCodeText: {
    fontSize: 14,
    color: '#333',
  },
  // Dropdown menu styles
  dropdownWrapper: {
    position: 'relative',
    // flex: 1,
    zIndex: 10000,
    elevation: 20,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    zIndex: 100010,
    elevation: 30,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    backgroundColor: '#fff',
    borderRadius: 6,
    paddingVertical: 4,
    marginTop: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },


  },
  dropdownMenuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dropdownMenuText: {
    fontSize: 14,
    color: '#333',
  },
  // Toast styles
  toastContainer: {
    position: 'absolute',
    top: 20,
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
  // Loading, error, and empty states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingMoreText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#FF6B00',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  errorSubText: {
    marginTop: 4,
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  emptySubText: {
    marginTop: 4,
    fontSize: 12,
    color: '#999',
  },
  emptyDivisionContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyDivisionText: {
    fontSize: 14,
    color: '#999',
  },
  editModeContainer: {
    flex: 1,
  },
  stickyButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  addMoreSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginBottom: 80,
  },
  addMoreTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B00',
    marginBottom: 12,
  },
  addMoreSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    gap: 8,
    marginBottom: 16,
  },
  addMoreDistributorItem: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  addMoreDistributorInfo: {
    flex: 1,
  },
  addMoreDistributorName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  addMoreDistributorCity: {
    fontSize: 13,
    color: '#999',
  },
  // Hierarchy section styles
  hierarchySection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  hierarchySectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },

  // hierarchyInfo: {
  //   flex: 1,
  //   marginRight: 12,
  // },
  hierarchyName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  hierarchyCode: {
    fontSize: 12,
    color: '#999',
  },
  // hierarchyActions: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   gap: 8,
  // },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  approveButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  rejectButton: {
    width: 20,
    height: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2B2B2B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },

  // Hospital card styles (for expandable design)
  hospitalCard: {
    marginHorizontal: 12,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  hospitalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  hospitalCardInfo: {
    flex: 1,
    marginRight: 12,
  },
  hospitalCardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  hospitalCardCode: {
    fontSize: 12,
    color: '#999',
  },
  hospitalCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expandableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F9F9F9',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  expandableContent: {
    flex: 1,
  },
  expandableText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  expandedContent: {
    backgroundColor: '#FAFAFA',
    paddingVertical: 8,
  },
  linkedItemsSection: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  linkedItemsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 4,
  },
  linkedItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginBottom: 4,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  linkedItemInfo: {
    flex: 1,
    marginRight: 8,
  },
  linkedItemName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  linkedItemCode: {
    fontSize: 11,
    color: '#999',
  },
  linkedItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  // Accordion styles (for group hospitals)
  accordionCard: {
    marginHorizontal: 12,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  accordionHeaderInfo: {
    flex: 1,
    marginRight: 12,
  },
  accordionHospitalName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  accordionHospitalCode: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  accordionTabsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 12,
  },
  accordionTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeAccordionTab: {
    borderBottomColor: '#FF6B00',
  },
  accordionTabText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  activeAccordionTabText: {
    color: '#FF6B00',
    fontWeight: '600',
  },
  accordionHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accordionContent: {
    backgroundColor: '#FAFAFA',
    paddingVertical: 12,
  },
  accordionItemsContainer: {
    paddingHorizontal: 12,
  },
  accordionItemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    marginBottom: 8,
  },
  accordionItemsHeaderText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    flex: 1,
  },
  accordionItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  accordionItemInfo: {
    flex: 1,
    marginRight: 8,
  },
  accordionItemName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  accordionItemCode: {
    fontSize: 11,
    color: '#999',
  },
  accordionItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyAccordionContent: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyAccordionText: {
    fontSize: 12,
    color: '#999',
  },

  // Skeleton styles for distributor rows
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  skeletonLeft: {
    flex: 1.5,
    paddingRight: 12,
  },
  skeletonMiddle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonRight: {
    flex: 0.6,
    alignItems: 'flex-end',
  },
  skeletonTitle: {
    height: 16,
    width: '70%',
    backgroundColor: '#eee',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonSubTitle: {
    height: 12,
    width: '40%',
    backgroundColor: '#f3f3f3',
    borderRadius: 4,
  },
  skeletonStatus: {
    height: 16,
    width: '50%',
    backgroundColor: '#f3f3f3',
    borderRadius: 4,
  },
  skeletonAddButton: {
    height: 20,
    width: 48,
    backgroundColor: '#ffece0',
    borderRadius: 4,
  },
  supplyTypeWrapper: {
    position: 'relative',
    overflow: 'visible',
    zIndex: 10000,
    elevation: 25,
  },

  supplyTypeDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 8,
    minWidth: 120,
    zIndex: 51,
  },

  /* BASE DROPDOWN MENU (GLOBAL) */
  dropdownMenu: {
    position: 'absolute',
    top: 40, // ensures it drops below the button
    right: 0, // align to right always
    minWidth: 180,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'visible',

    // FIX CLIPPING - High z-index to appear above other elements
    zIndex: 99999,
    elevation: 30,

    // Stronger shadow for visibility
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
  },

  /* DROPDOWN FOR SUPPLY TYPE (OVERRIDE SIZE/POSITION) */
  supplyDropdownMenu: {
    position: 'absolute',
    top: 42,
    right: -10,  // move slightly outward so it doesn't overlap text
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 6,
    borderWidth: 0, // Ensure no border on dropdown container

    // FIX CLIPPING - Maximum z-index to appear above all elements
    overflow: 'visible',
    zIndex: 99999,
    elevation: 30,

    // Improve shadow for better visibility
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
  },

  dropdownMenuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#fff',

    // Increase tap area
    minHeight: 44,
    justifyContent: 'center',

    // Maximum z-index for touch detection
    zIndex: 99999,
    elevation: 30,
  },
  dropdownMenuItemLast: {
    borderBottomWidth: 0, // Remove border from last item
  },

  dropdownMenuText: {
    fontSize: 14,
    color: '#333',
    zIndex: 99999,
  },

  supplyTypeText: {
    fontSize: 14,
    color: '#333',
    marginRight: 6,
  },
  tabContentWrapper: {
    flex: 1,
    paddingTop: 60, // Same height as sticky tab bar (60 + 10 margin)
    overflow: 'visible', // Changed to visible to allow dropdown to overflow
  },


  headerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    marginTop: 10,
  },

  headerTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2B2B2B",
    paddingBottom: 15
  },

  subHeaderWrapper: {
    flexDirection: "row",
    backgroundColor: "#FBFBFB",
    // paddingVertical: 8,
    paddingHorizontal: 16,
    // marginBottom:10


  },

  subHeaderText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#777",
    paddingVertical: 10
  },

  columnsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    // paddingTop: 14,
    marginTop: 20
  },

  divider: {
    width: 1,
    backgroundColor: "#9090903e",
    marginHorizontal: 12,


  },

  dividerinside: {
    width: 1,
    backgroundColor: "#9090903e",
    marginHorizontal: 12,
    marginTop: -20
  },

  /* Column widths based on screenshot */
  colRequested: {
    flex: 1,        // Medium width
    paddingRight: 6,
    // paddingTop:20
  },

  colOther: {
    flex: 1.3,      // WIDEST column (as per screenshot)
    paddingLeft: 6,
    paddingRight: 6,
    // paddingTop:20
  },
  unauthorizedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  unauthorizedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  unauthorizedMessage: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },

  colOpened: {
    flex: 1,        // Smallest column
    paddingLeft: 6,
    // paddingTop:20
  },

  /* Requested Rows */
  reqRow: {
    marginBottom: 20,
  },

  /* Other Rows */
  otherRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },

  /* Opened Rows */
  openedRow: {

    borderBottomColor: "#D9DFE2",
    borderBottomWidth: 1,
    paddingBottom: 10,
    marginBottom: 10,


  },

  emptyText: {
    fontSize: 13,
    color: "#999",
    lineHeight: 18,
  },

  divisionName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },

  divisionCode: {
    fontSize: 14,
    color: "#777",
    marginTop: 2,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#909090",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  checkboxSelected: {
    backgroundColor: "#FF8A00",
    borderColor: "#FF8A00",
  },

  blockButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#2B2B2B",
    borderRadius: 8,
    marginVertical: 5,
    alignSelf: "flex-start",
  },

  blockButtonDisabled: {
    opacity: 0.5,
  },

  unblockButton: {
    borderColor: "#EF4444",
    backgroundColor: "#FEE2E2",
  },

  blockText: {
    marginLeft: 6,
    fontSize: 12,
    color: "#2B2B2B",
  },

  unblockText: {
    color: "#EF4444",
  },

  subTabsWrapper: {
    marginTop: 0,
    height: 60,
    backgroundColor: '#fff',
    zIndex: 10,
  },

  /* CARD */
  linkedCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    overflow: 'visible',
    zIndex: 1,
  },

  /* TOP ROW */
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  name: {
    fontSize: 15,
    fontFamily: 'Lato-Bold',
    color: '#111827',
  },

  subText: {
    fontSize: 12.5,
    color: '#6B7280',
    marginTop: 3,
  },

  subTextLiked: {
    fontSize: 12.5,
    color: '#6B7280',
    marginTop: 3,
    marginBottom: 10
  },

  marginLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  /* MIDDLE ROW */
  middleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    marginBottom: 10,
    justifyContent: "space-between"
  },

  middleRowDropdown: {
    flexDirection: 'row',
    gap: 12,
    zIndex: 1000,
  },

  orgCodeDropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 4,
    zIndex: 999999,
    elevation: 100,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 4,
    minWidth: 120,
  },

  allDivisionsDropdownMenu: {
    zIndex: 10002,
    elevation: 31,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    maxHeight: 200,
  },

  dropdown: {
    height: 36,
    minWidth: 110,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  dropdownError: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
  },
  dropdownMenuItemWithCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  checkboxContainer: {
    marginRight: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dropdownError: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
  },

  dropdownText: {
    fontSize: 14,
    color: '#111827',
  },
  dropdownMenuItemWithCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  checkboxContainer: {
    marginRight: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  marginBox: {
    height: 36,
    width: 72,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  marginInput: {
    width: 26,
    padding: 0,
    margin: 0,
    textAlign: 'center',
    fontSize: 14,
    color: '#111827',
  },

  percent: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
  },

  /* BOTTOM ROW */
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  radioRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
    flex: 0,
  },

  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  radioSelected: {
    borderColor: '#F97316',
  },

  radioSelectedOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F97316',
  },

  radioText: {
    fontSize: 13,
    color: '#111827',
  },

  radioDisabled: {
    fontSize: 13,
    color: '#9CA3AF',
  },

  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  removeText: {
    fontSize: 13,
    color: '#F97316',
    marginRight: 6,
  },

  /* FINISH */
  finishContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },

  finishBtn: {
    height: 48,
    backgroundColor: '#F97316',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  finishText: {
    fontSize: 16,
    fontFamily: 'Lato-Bold',
    color: '#FFFFFF',
  },

  marginText: {
    fontSize: 12,
    color: "#777777"
  },

  hierarchyHeader: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 6,
    marginBottom: 8,

  },

  hierarchyHeaderLeft: {
    flex: 6.5,              // ✅ 70%
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },

  hierarchyHeaderRight: {
    flex: 3,              // ✅ 30%
    fontSize: 12,
    fontWeight: '500',
    color: '#666',

  },

  hierarchyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  hierarchyInfo: {
    flex: 7,              // ✅ MUST MATCH HEADER LEFT
  },

  hierarchyActions: {
    flex: 3,              // ✅ MUST MATCH HEADER RIGHT
    alignItems: 'flex-end',
  },

  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,               // ✅ spacing without breaking layout
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // space between icon & text
  },

  statusText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },

  approvedText: {
    color: '#16A34A', // green
  },

  rejectedText: {
    color: '#EF4444', // red
  },
  rejectedIconCircle: {
    width: 18,
    height: 18,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LinkagedTab;


