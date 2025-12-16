/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-dupe-keys */
import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  RejectCustomerModal,
  TagHospitalModal,
} from '../../../components/OnboardConfirmModel';
import FilterModal from '../../../components/FilterModal';
import { customerAPI } from '../../../api/customer';
import { getDistributors } from '../../../api/distributor';
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
  customerRequestedDivisions = []
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
  // Debounced search for All Distributors (prevents reloading whole page on each keystroke)
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const DEBOUNCE_DELAY = 400; // ms
  const searchDebounceRef = useRef(null);

  // All-distributors supply-type state & dropdown control
  const [allDistributorSupplyType, setAllDistributorSupplyType] = useState({});
  const [showAllSupplyDropdown, setShowAllSupplyDropdown] = useState({});

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
  const effectiveCustomerId = reduxCustomerId || customerId;

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
  const [fieldTeamData, setFieldTeamData] = useState(mockFieldData);
  const [fieldTeamLoading, setFieldTeamLoading] = useState(false);
  const [fieldTeamError, setFieldTeamError] = useState(null);

  // Distributors states
  const [allDistributorsData, setAllDistributorsData] = useState([]);
  const [filteredDistributorsData, setFilteredDistributorsData] = useState([]);
  const [preferredDistributorsData, setPreferredDistributorsData] = useState(
    [],
  );
  const [linkedDistributorsData, setLinkedDistributorsData] = useState([]);
  const [distributorsLoading, setDistributorsLoading] = useState(false);
  const [distributorsError, setDistributorsError] = useState(null);

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
            console.log('measureLayout failed');
          },
        );
      }
    }, 100);
  };

  const handleDistributorTabPress = tabName => {
    setActiveDistributorTab(tabName);

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
            console.log('Distributor tab measure failed');
          },
        );
      }
    }, 100);
  };


  // derived local filter for Preferred Distributors (client-side search)
  const filteredPreferredDistributors = useMemo(() => {
    const q = (preferredSearchText || '').trim().toLowerCase();
    if (!q) return preferredDistributorsData || [];

    return (preferredDistributorsData || []).filter(d => {
      const name = (d.name || '').toLowerCase();
      const code = (d.code || '').toLowerCase();
      const city = (d.cityName || d.city || '').toLowerCase();
      // match on name, code or city (you can add other fields if needed)
      return name.includes(q) || code.includes(q) || city.includes(q);
    });
  }, [preferredSearchText, preferredDistributorsData]);

  // Fetch divisions data on component mount
  useEffect(() => {
    const fetchDivisionsData = async () => {
      console.log(
        'LinkagedTab: Fetching divisions for customerId:',
        effectiveCustomerId,
      );
      if (!effectiveCustomerId) {
        console.log(
          'LinkagedTab: No customerId provided, skipping divisions fetch',
        );
        return;
      }

      try {
        setDivisionsLoading(true);
        setDivisionsError(null);

        // Fetch customer's linked divisions
        console.log('LinkagedTab: Calling getCustomerDivisions API...');
        const customerDivisionsResponse =
          await customerAPI.getCustomerDivisions(effectiveCustomerId);
        console.log(
          'LinkagedTab: Customer divisions API response:',
          customerDivisionsResponse,
        );

        // Fetch all available divisions
        console.log('LinkagedTab: Calling getAllDivisions API...');
        const allDivisionsResponse = await customerAPI.getAllDivisions();
        console.log(
          'LinkagedTab: All divisions API response:',
          allDivisionsResponse,
        );

        let openedDivisions = [];
        let otherDivisions = [];

        // Process customer's linked divisions (opened)
        if (
          customerDivisionsResponse?.data &&
          Array.isArray(customerDivisionsResponse.data)
        ) {
          openedDivisions = customerDivisionsResponse.data;
          console.log('LinkagedTab: Opened divisions:', openedDivisions.length);
        }

        // Process all available divisions and filter out already linked ones
        if (
          allDivisionsResponse?.data?.divisions &&
          Array.isArray(allDivisionsResponse.data.divisions)
        ) {
          const linkedDivisionIds = openedDivisions.map(d =>
            Number(d.divisionId),
          );
          otherDivisions = allDivisionsResponse.data.divisions.filter(
            d => !linkedDivisionIds.includes(Number(d.divisionId)),
          );
          console.log('LinkagedTab: Other divisions:', otherDivisions.length);
        }

        setOpenedDivisionsData(openedDivisions);
        setOtherDivisionsData(otherDivisions);
      } catch (error) {
        console.error('LinkagedTab: Error fetching divisions data:', error);
        setDivisionsError(error.message);
        setOtherDivisionsData([]);
        setOpenedDivisionsData([]);
      } finally {
        setDivisionsLoading(false);
      }
    };

    fetchDivisionsData();
  }, [effectiveCustomerId]);

  // Fetch field team data on component mount
  useEffect(() => {
    const fetchFieldTeamData = async () => {
      try {
        setFieldTeamLoading(true);
        setFieldTeamError(null);
        const response = await customerAPI.getCompanyUsers(1, 20);

        if (response?.data?.companyUsers) {
          setFieldTeamData(response.data.companyUsers);
        } else {
          setFieldTeamData([]);
        }
      } catch (error) {
        console.error('Error fetching field team data:', error);
        setFieldTeamError(error.message);
        setFieldTeamData([]);
      } finally {
        setFieldTeamLoading(false);
      }
    };

    fetchFieldTeamData();
  }, []);

  // Process and log mapping data from customer details API
  useEffect(() => {
    if (mappingData) {
      console.log('=== MAPPING DATA RECEIVED IN LINKAGED TAB ===');
      console.log('Full Mapping Data:', mappingData);

      // Log individual sections
      console.log('--- Hospitals ---');
      console.log('Hospitals:', mappingData.hospitals || []);
      console.log('Hospital Count:', mappingData.hospitals?.length || 0);

      console.log('--- Doctors ---');
      console.log('Doctors:', mappingData.doctors || []);
      console.log('Doctor Count:', mappingData.doctors?.length || 0);

      console.log('--- Pharmacies ---');
      console.log('Pharmacies:', mappingData.pharmacy || []);
      console.log('Pharmacy Count:', mappingData.pharmacy?.length || 0);

      console.log('--- Group Hospitals ---');
      console.log('Group Hospitals:', mappingData.groupHospitals || []);
      console.log(
        'Group Hospital Count:',
        mappingData.groupHospitals?.length || 0,
      );

      // Store mapping data in state
      setHierarchyMappingData(mappingData);
    }
  }, [mappingData]);

  // Fetch preferred distributors when Preferred tab is active
  useEffect(() => {
    const fetchPreferredDistributorsData = async () => {
      if (activeDistributorTab !== 'preferred' || !effectiveCustomerId) {
        return;
      }

      console.log(
        'LinkagedTab: Fetching preferred distributors for customerId:',
        effectiveCustomerId,
      );

      try {
        setDistributorsLoading(true);
        setDistributorsError(null);

        // Call API to get linked distributors and divisions
        const response = await customerAPI.getLinkedDistributorDivisions(
          effectiveCustomerId,
        );
        console.log(
          'LinkagedTab: Linked distributor divisions API response:',
          response,
        );

        if (
          response?.data?.customer?.distributorDetails &&
          Array.isArray(response.data.customer.distributorDetails)
        ) {
          console.log(
            'LinkagedTab: Setting preferredDistributorsData with',
            response.data.customer.distributorDetails.length,
            'distributors',
          );
          setPreferredDistributorsData(
            response.data.customer.distributorDetails,
          );
        } else {
          console.log(
            'LinkagedTab: Invalid preferred distributors response format',
          );
          setPreferredDistributorsData([]);
        }
      } catch (error) {
        console.error(
          'LinkagedTab: Error fetching preferred distributors:',
          error,
        );
        setDistributorsError(error.message);
        setPreferredDistributorsData([]);
      } finally {
        setDistributorsLoading(false);
      }
    };

    fetchPreferredDistributorsData();
  }, [activeDistributorTab, effectiveCustomerId]);

  // Fetch linked distributors when Linked tab is active
  useEffect(() => {
    const fetchLinkedDistributorsData = async () => {
      if (activeDistributorTab !== 'linked' || !effectiveCustomerId) {
        return;
      }

      console.log(
        'LinkagedTab: Fetching linked distributors for customerId:',
        effectiveCustomerId,
      );

      try {
        setDistributorsLoading(true);
        setDistributorsError(null);

        const response = await customerAPI.getLinkedDistributorDivisions(
          effectiveCustomerId,
        );
        console.log(
          'LinkagedTab: Linked distributor divisions (linked tab) API response:',
          response,
        );

        if (
          response?.data?.customer?.distributorDetails &&
          Array.isArray(response.data.customer.distributorDetails)
        ) {
          setLinkedDistributorsData(response.data.customer.distributorDetails);
        } else {
          setLinkedDistributorsData([]);
        }
      } catch (error) {
        console.error(
          'LinkagedTab: Error fetching linked distributors:',
          error,
        );
        setDistributorsError(error.message);
        setLinkedDistributorsData([]);
      } finally {
        setDistributorsLoading(false);
      }
    };

    fetchLinkedDistributorsData();
  }, [activeDistributorTab, effectiveCustomerId]);

  useEffect(() => {
    const fetchDistributorsData = async () => {
      if (activeDistributorTab !== 'all') {
        return;
      }

      console.log('LinkagedTab: Fetching all distributors...', {
        query: debouncedSearch,
      });

      try {
        setDistributorsLoading(true);
        setDistributorsError(null);

        // Call API to get all distributors with pagination (search uses debouncedSearch)
        const response = await getDistributors(1, 100, debouncedSearch);
        console.log('LinkagedTab: Distributors API response:', response);

        if (response?.distributors && Array.isArray(response.distributors)) {
          console.log(
            'LinkagedTab: Setting allDistributorsData with',
            response.distributors.length,
            'distributors',
          );
          setAllDistributorsData(response.distributors);
          setFilteredDistributorsData(response.distributors);
        } else {
          console.log('LinkagedTab: Invalid distributors response format');
          setAllDistributorsData([]);
          setFilteredDistributorsData([]);
        }
      } catch (error) {
        console.error('LinkagedTab: Error fetching distributors:', error);
        setDistributorsError(error.message);
        setAllDistributorsData([]);
        setFilteredDistributorsData([]);
      } finally {
        setDistributorsLoading(false);
      }
    };

    fetchDistributorsData();
  }, [activeDistributorTab, debouncedSearch]);

  // Apply filters to distributors
  useEffect(() => {
    if (allDistributorsData.length === 0) {
      setFilteredDistributorsData([]);
      return;
    }

    let filtered = [...allDistributorsData];

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
  }, [allDistributorsData, distributorFilters]);

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

  const handleLinkDistributors = async () => {
    if (!effectiveCustomerId) {
      showToast('Customer ID not found', 'error');
      return;
    }

    // Validate all required fields
    const selectedDists = preferredDistributorsData.filter(d =>
      selectedDistributors.includes(d.id),
    );

    for (const distributor of selectedDists) {
      // Check if margin is filled
      if (
        !distributorMargins[distributor.id] ||
        distributorMargins[distributor.id] === ''
      ) {
        showToast(`Please enter margin for ${distributor.name}`, 'error');
        return;
      }

      // Check if rate type is selected (Net Rate or Chargeback)
      if (
        !distributorRateType[distributor.id] ||
        (distributorRateType[distributor.id] !== 'Net Rate' &&
          distributorRateType[distributor.id] !== 'Chargeback')
      ) {
        showToast(`Please select rate type for ${distributor.name}`, 'error');
        return;
      }
    }

    try {
      setLinkingDistributors(true);

      // Build the mappings array from selected distributors
      const mappings = selectedDists.map(distributor => ({
        distributorId: Number(distributor.id),
        divisions: openedDivisionsData.map(div => ({
          id: Number(div.divisionId),
          isActive: true,
        })),
        supplyModeId: 3, // Default supply mode
        margin: Number(distributorMargins[distributor.id] || 0),
      }));

      const payload = { mappings };

      console.log('Linking distributors with payload:', payload);

      const response = await customerAPI.linkDistributorDivisions(
        effectiveCustomerId,
        payload,
      );

      console.log('Link distributors API response:', response);

      showToast('Distributors linked successfully!', 'success');

      // Go back to selection mode
      setPreferredViewMode('selection');
      setSelectedDistributors([]);

      // Refresh preferred distributors list
      if (effectiveCustomerId) {
        const updatedResponse = await customerAPI.getLinkedDistributorDivisions(
          effectiveCustomerId,
        );
        if (
          updatedResponse?.data?.customer?.distributorDetails &&
          Array.isArray(updatedResponse.data.customer.distributorDetails)
        ) {
          setPreferredDistributorsData(
            updatedResponse.data.customer.distributorDetails,
          );
        }
      }
    } catch (error) {
      console.error('Error linking distributors:', error);
      showToast(`Failed to link distributors: ${error.message}`, 'error');
    } finally {
      setLinkingDistributors(false);
    }
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

      console.log('Approving item:', selectedItem?.name);
      console.log('Workflow ID:', workflowId);
      console.log('Logged-in User ID (actorId):', actorId);
      console.log('Action Data:', actionData);

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

  const handleRejectConfirm = async () => {
    try {
      const workflowId = selectedItem?.workflowId || selectedItem?.id;
      const actorId = loggedInUser?.userId || loggedInUser?.id;

      const actionData = {
        stepOrder: 3,
        parallelGroup: 1,
        actorId: actorId,
        action: 'REJECT',
        comments: 'Rejected',
        actionData: {},
      };

      console.log('Rejecting item:', selectedItem?.name);
      console.log('Workflow ID:', workflowId);
      console.log('Logged-in User ID (actorId):', actorId);
      console.log('Action Data:', actionData);

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

  const handleLinkDivisionsConfirmModal = comment => {
    // TODO: API integration
    console.log('Link Divisions with comment:', comment);
    setShowLinkDivisionsModal(false);
    showToast('Divisions linked successfully!', 'success');
  };

  const handleTagConfirm = () => {
    // TODO: API integration
    console.log('Tagged');
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
    const alreadyExists = preferredDistributorsData.find(
      d => d.id === distributor.id,
    );
    if (alreadyExists) {
      showToast(
        `${distributor.name} is already in preferred distributors!`,
        'error',
      );
      return;
    }

    try {
      console.log('Adding distributor:', distributor.id);

      // Build the mapping payload with opened divisions
      // Build the mapping payload with opened divisions and the selected supply type
      const mappingsPayload = {
        mappings: [
          {
            distributorId: Number(distributor.id),
            divisions: openedDivisionsData.map(d => ({
              id: Number(d.divisionId),
              isActive: true,
            })),
            supplyModeId: 3,
            margin: 1,
            // optional: include chosen rate type so backend can know the preference
            rateType:
              allDistributorSupplyType[distributor.id] ||
                distributor.inviteStatusId == 2 ? 'Chargeback (CM)' :
                'NetRate (DM)'
          },
        ],
      };


      console.log('Link distributor payload:', mappingsPayload);

      // Call API to link distributor
      const response = await customerAPI.linkDistributorDivisions(
        effectiveCustomerId,
        mappingsPayload,
      );
      console.log('Link distributor API response:', response);

      // Add to preferred distributors locally
      setPreferredDistributorsData(prev => [...prev, distributor]);

      showToast(
        `${distributor.name} added to preferred distributors!`,
        'success',
      );

      // Refresh preferred distributors list
      if (effectiveCustomerId) {
        const updatedResponse = await customerAPI.getLinkedDistributorDivisions(
          effectiveCustomerId,
        );
        if (
          updatedResponse?.data?.customer?.distributorDetails &&
          Array.isArray(updatedResponse.data.customer.distributorDetails)
        ) {
          setPreferredDistributorsData(
            updatedResponse.data.customer.distributorDetails,
          );
        }
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

    // Switch to Distributors tab so user can continue
    setActiveSubTab('distributors');

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

      const divisionsPayload = {
        divisions: validDivisions.map(division => ({
          divisionId: Number(division.divisionId),
          isActive: true,
        })),
      };

      console.log('Linking divisions with payload:', divisionsPayload);

      // Call API to link divisions
      const response = await customerAPI.linkDivisions(
        effectiveCustomerId,
        divisionsPayload,
      );

      console.log('Link divisions API response:', response);

      // Move valid selected divisions to opened locally (so UI updates immediately)
      setOpenedDivisionsData(prev => [...prev, ...validDivisions]);

      // Remove from other divisions locally
      const selectedIds = validDivisions.map(d => d.divisionId);
      setOtherDivisionsData(prev =>
        prev.filter(d => !selectedIds.includes(d.divisionId)),
      );

      // Clear selection
      setSelectedDivisions([]);

      // Switch to Distributors tab so user can proceed
      setTimeout(() => {
        setActiveSubTab('distributors');
      }, 500);

      showToast('Divisions linked successfully!', 'success');

      // Refresh divisions data after linking (optional, you already have this)
      if (effectiveCustomerId) {
        try {
          // Fetch updated customer divisions (opened)
          const customerDivisionsResponse =
            await customerAPI.getCustomerDivisions(effectiveCustomerId);

          // Fetch all available divisions
          const allDivisionsResponse = await customerAPI.getAllDivisions();

          let updatedOpenedDivisions = [];
          let updatedOtherDivisions = [];

          // Process customer's linked divisions (opened)
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

          setOpenedDivisionsData(updatedOpenedDivisions);
          setOtherDivisionsData(updatedOtherDivisions);
        } catch (error) {
          console.error('Error refreshing divisions after linking:', error);
          // don't block the user for refresh errors
        }
      }
    } catch (error) {
      console.error('Error linking divisions:', error);
      showToast(`Failed to link divisions: ${error.message}`, 'error');
    } finally {
      setLinkingDivisions(false);
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
                        style={styles.distributorRow}
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
                              pointerEvents="box-none"
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
                                style={styles.dropdownMenuItem}
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
                        style={styles.distributorRow}
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
                              pointerEvents="box-none"
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
                                style={styles.dropdownMenuItem}
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
        <View style={{ flex: 1 }}>
          <ScrollView
            style={styles.scrollContent}
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
              linkedDistributorsData.map(item => (
              <View key={item.id || item.distributorId} style={styles.linkedCard}>

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
                      {(item.code || item.distributorCode) || 'N/A'} | One city | {item.cityName || 'Pune'}
                    </AppText>

                    <View style={styles.middleRowDropdown}>

                      <TouchableOpacity style={styles.dropdown}>
                        <AppText style={styles.dropdownText}>SPLL</AppText>
                        <IconMaterial
                          name="keyboard-arrow-down"
                          size={18}
                          color="#6B7280"
                        />
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.dropdown}>
                        <AppText style={styles.dropdownText}>All Divisions</AppText>
                        <IconMaterial
                          name="keyboard-arrow-down"
                          size={18}
                          color="#6B7280"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View>
                    <AppText style={styles.subTextLiked}>Margin</AppText>

                    <View style={styles.marginBox}>
                      <AppInput
                        value="15"
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
                    <View style={styles.radioItem}>
                      <View style={styles.radioSelectedOuter}>
                        <View style={styles.radioInner} />
                      </View>
                      <AppText style={styles.radioText}>Net Rate</AppText>
                    </View>

                    <View style={styles.radioItem}>
                      <View style={styles.radioOuter} />
                      <AppText style={styles.radioDisabled}>Chargeback</AppText>
                    </View>
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
            )))}
          </ScrollView>

          {/* FINISH BUTTON */}
          <View style={styles.finishContainer}>
            <TouchableOpacity style={styles.finishBtn}>
              <AppText style={styles.finishText}>Finish</AppText>
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
          {/* <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={[
              (hasApprovePermission || isCustomerActive) &&
              styles.scrollContentWithButton,
            ]}
          >
            <View style={styles.divisionsContainer}>
              <View
                style={[
                  styles.divisionColumn,
                  !(hasApprovePermission || isCustomerActive) &&
                  styles.divisionColumnFullWidth,
                ]}
              >
                <AppText style={styles.columnTitle}>Opened Division</AppText>
                <AppText style={styles.columnSubtitle}>Name & Code</AppText>

                {openedDivisionsData.length === 0 ? (
                  <View style={styles.emptyDivisionContainer}>
                    <AppText style={styles.emptyDivisionText}>
                      No divisions opened yet
                    </AppText>
                  </View>
                ) : (
                  openedDivisionsData.map(division => (
                    <View key={division.divisionId} style={styles.divisionItem}>
                      <View>
                        <AppText style={styles.divisionName}>
                          {division.divisionName}
                        </AppText>
                        <AppText style={styles.divisionCode}>
                          {division.divisionCode}
                        </AppText>
                      </View>
                    </View>
                  ))
                )}
              </View>

              {(hasApprovePermission || isCustomerActive) && (
                <View style={styles.divisionColumn}>
                  <View style={styles.columnHeader}>
                    <AppText style={styles.columnTitle}>Other Division</AppText>
            
                  </View>
                  <AppText style={styles.columnSubtitle}>Name & Code</AppText>

                  {otherDivisionsData.length === 0 ? (
                    <View style={styles.emptyDivisionContainer}>
                      <AppText style={styles.emptyDivisionText}>
                        No other divisions available
                      </AppText>
                    </View>
                  ) : (
                    otherDivisionsData.map(division => (
                      <TouchableOpacity
                        key={`other-${division.divisionId}`}
                        style={styles.checkboxItem}
                        onPress={() => toggleOtherDivisionSelection(division)}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            selectedDivisions.find(
                              d => d.divisionId === division.divisionId,
                            ) && styles.checkboxSelected,
                          ]}
                        >
                          {selectedDivisions.find(
                            d => d.divisionId === division.divisionId,
                          ) && <Icon name="check" size={16} color="#fff" />}
                        </View>
                        <View>
                          <AppText style={styles.divisionName}>
                            {division.divisionName}
                          </AppText>
                          <AppText style={styles.divisionCode}>
                            {division.divisionCode}
                          </AppText>
                        </View>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}
            </View>
          </ScrollView> */}

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollContent}
            contentContainerStyle={[
              (hasApprovePermission || isCustomerActive) && styles.scrollContentWithButton
            ]}
          >

            {/* ---------- HEADER (Requested / Other / Opened) ---------- */}
            <View style={styles.headerWrapper}>
              <View style={styles.colRequested}>
                <AppText style={styles.headerTitle}>Requested</AppText>
              </View>

              <View style={styles.divider} />

              <View style={styles.colOther}>
                <AppText style={styles.headerTitle}>Other</AppText>
              </View>

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

              <View style={styles.divider} />
              <View style={styles.colOther}>
                <AppText style={styles.subHeaderText}>Name & Code</AppText>
              </View>

              <View style={styles.divider} />

              <View style={styles.colOpened}>
                <AppText style={styles.subHeaderText}>Name & Code</AppText>
              </View>
            </View>

            {/* ---------- BODY (3 Columns) ---------- */}
            <View style={styles.columnsRow}>

              {console.log(customerRequestedDivisions)
              }

              {/* ========== REQUESTED COLUMN ========== */}
              <View style={styles.colRequested}>
                {customerRequestedDivisions?.length > 0 ? (
                  customerRequestedDivisions.map(div => (
                    <View key={div.divisionId} style={styles.reqRow}>
                      <AppText style={styles.divisionName}>{div.divisionName}</AppText>
                      <AppText style={styles.divisionCode}>{div.divisionCode}</AppText>
                    </View>
                  ))
                ) : (
                  <AppText style={styles.emptyText}>No requested divisions</AppText>
                )}
              </View>

              <View style={styles.dividerinside} />

              {/* ========== OTHER COLUMN ========== */}
              <View style={styles.colOther}>
                {hasOtherDivisionPermission ? (
                  otherDivisionsData?.length > 0 ? (
                    otherDivisionsData.map(div => {
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
                  )
                ) : (
                  <View style={styles.unauthorizedContainer}>
                    <CloseCircle width={40} height={40} color="#EF4444" />
                    <AppText style={styles.unauthorizedTitle}>Unauthorized Access</AppText>
                    <AppText style={styles.unauthorizedMessage}>You don't have permission to access.</AppText>
                  </View>
                )}
              </View>

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
                          div.isBlocked && styles.unblockButton
                        ]}
                      >
                        <Icon
                          name={div.isBlocked ? "lock-open-outline" : "lock-outline"}
                          size={15}
                          color={div.isBlocked ? "#FF6B00" : "#2B2B2B"}
                        />
                        <AppText
                          style={[
                            styles.blockText,
                            div.isBlocked && styles.unblockText
                          ]}
                        >
                          {div.isBlocked ? "Unblock" : "Block"}
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

          {/* Sticky Continue Button at Bottom - Only show if user has approve permission or customer is active */}
          {(hasApprovePermission || isCustomerActive) && (
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
          )}
        </>
      )}
    </View>
  );

  const renderFieldTab = () => (
    <View style={styles.tabContent}>
      {fieldTeamLoading ? (
        <View style={styles.loadingContainer}>
          <Icon name="loading" size={40} color="#FF6B00" />
          <AppText style={styles.loadingText}>Loading field team...</AppText>
        </View>
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
        <ScrollView style={styles.scrollContent}>
          <View style={styles.fieldHeader}>
            <AppText style={styles.fieldHeaderText}>
              Employee Name & Code
            </AppText>
            <AppText
              style={[styles.fieldHeaderText, styles.fieldHeaderDesignation]}
            >
              Designation
            </AppText>
          </View>

          {fieldTeamData.map((employee, index) => (
            <View key={employee.id || index} style={styles.fieldRow}>
              <View style={styles.employeeInfo}>
                <AppText style={styles.employeeName}>
                  {employee.userName}
                </AppText>
                <AppText style={styles.employeeCode}>
                  {employee.userCode}
                </AppText>
              </View>
              <View style={styles.employeeDesignationContainer}>
                <AppText style={styles.employeeDesignation}>
                  {employee.designation}
                </AppText>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  // const renderCustomerHierarchyTab = () => {
  //   // Check if we have mapping data
  //   if (!hierarchyMappingData) {
  //     return (
  //       <View style={styles.tabContent}>
  //         <ScrollView style={styles.scrollContent}>
  //           <View style={styles.emptyContainer}>
  //             <Icon name="inbox" size={50} color="#999" />
  //             <AppText style={styles.emptyText}>No data found</AppText>
  //             <AppText style={styles.emptySubText}>
  //               Linked data will appear here
  //             </AppText>
  //           </View>
  //         </ScrollView>
  //       </View>
  //     );
  //   }

  //   // For Doctors - show linked pharmacies
  //   if (customerType === 'Doctors') {
  //     const linkedPharmacies = hierarchyMappingData?.pharmacy || [];

  //     if (linkedPharmacies.length === 0) {
  //       return (
  //         <View style={styles.tabContent}>
  //           <ScrollView style={styles.scrollContent}>
  //             <View style={styles.emptyContainer}>
  //               <Icon name="inbox" size={50} color="#999" />
  //               <AppText style={styles.emptyText}>No data found</AppText>
  //               <AppText style={styles.emptySubText}>
  //                 Linked pharmacies will appear here
  //               </AppText>
  //             </View>
  //           </ScrollView>
  //         </View>
  //       );
  //     }

  //     return (
  //       <View style={styles.tabContent}>
  //         <ScrollView style={styles.scrollContent}>
  //           <View style={styles.hierarchySection}>
  //             <AppText style={styles.hierarchySectionTitle}>
  //               Linked Pharmacies
  //             </AppText>

  //             <View style={styles.hierarchyHeader}>
  //               <AppText style={styles.hierarchyHeaderText}>
  //                 Pharmacy Details
  //               </AppText>
  //               <AppText style={styles.hierarchyHeaderText}>Action</AppText>
  //             </View>

  //             {linkedPharmacies.map(pharmacy => (
  //               <View key={pharmacy.customerId} style={styles.hierarchyRow}>
  //                 <View style={styles.hierarchyInfo}>
  //                   <AppText style={styles.hierarchyName}>
  //                     {pharmacy.customerName}
  //                   </AppText>
  //                   <AppText style={styles.hierarchyCode}>
  //                     {pharmacy.customerCode} | {pharmacy.cityName}
  //                   </AppText>
  //                 </View>
  //               </View>
  //             ))}
  //           </View>
  //         </ScrollView>
  //       </View>
  //     );
  //   }

  //   // For Hospitals - show linked pharmacies and doctors
  //   else if (customerType === 'Hospital') {
  //     const linkedPharmacies = hierarchyMappingData?.pharmacy || [];
  //     const linkedDoctors = hierarchyMappingData?.doctors || [];
  //     const childHospitals = hierarchyMappingData?.hospitals || [];
  //     const groupHospitals = hierarchyMappingData?.groupHospitals || [];

  //     // If we have child hospitals, show the expandable design
  //     if (childHospitals.length > 0) {
  //       return (
  //         <View style={styles.tabContent}>
  //           <ScrollView style={styles.scrollContent}>
  //             {childHospitals.map(hospital => (
  //               <View key={hospital.customerId} style={styles.hospitalCard}>
  //                 {/* Hospital Header */}
  //                 <View style={styles.hospitalCardHeader}>
  //                   <View style={styles.hospitalCardInfo}>
  //                     <AppText style={styles.hospitalCardName}>
  //                       {hospital.customerName}
  //                     </AppText>
  //                     <AppText style={styles.hospitalCardCode}>
  //                       {hospital.customerCode} | {hospital.cityName}
  //                     </AppText>
  //                   </View>
  //                 </View>

  //                 {/* Expandable Section */}
  //                 <TouchableOpacity
  //                   style={styles.expandableHeader}
  //                   onPress={() =>
  //                     setExpandedHospitals(prev => ({
  //                       ...prev,
  //                       [hospital.customerId]: !prev[hospital.customerId],
  //                     }))
  //                   }
  //                 >
  //                   <View style={styles.expandableContent}>
  //                     <AppText style={styles.expandableText}>
  //                       {linkedPharmacies.length > 0 && linkedDoctors.length > 0
  //                         ? 'Linked Pharmacies & Doctors'
  //                         : linkedPharmacies.length > 0
  //                           ? 'Linked Pharmacies'
  //                           : 'Linked Doctors'}
  //                     </AppText>
  //                   </View>
  //                   <Icon
  //                     name={
  //                       expandedHospitals[hospital.customerId]
  //                         ? 'chevron-up'
  //                         : 'chevron-down'
  //                     }
  //                     size={20}
  //                     color="#666"
  //                   />
  //                 </TouchableOpacity>

  //                 {/* Expanded Content */}
  //                 {expandedHospitals[hospital.customerId] && (
  //                   <View style={styles.expandedContent}>
  //                     {/* Linked Pharmacies */}
  //                     {linkedPharmacies.length > 0 && (
  //                       <View style={styles.linkedItemsSection}>
  //                         <AppText style={styles.linkedItemsTitle}>
  //                           Linked Pharmacies
  //                         </AppText>
  //                         {linkedPharmacies.map(pharmacy => (
  //                           <View
  //                             key={pharmacy.customerId}
  //                             style={styles.linkedItemRow}
  //                           >
  //                             <View style={styles.linkedItemInfo}>
  //                               <AppText style={styles.linkedItemName}>
  //                                 {pharmacy.customerName}
  //                               </AppText>
  //                               <AppText style={styles.linkedItemCode}>
  //                                 {pharmacy.customerCode} | {pharmacy.cityName}
  //                               </AppText>
  //                             </View>
  //                           </View>
  //                         ))}
  //                       </View>
  //                     )}

  //                     {/* Linked Doctors */}
  //                     {linkedDoctors.length > 0 && (
  //                       <View style={styles.linkedItemsSection}>
  //                         <AppText style={styles.linkedItemsTitle}>
  //                           Linked Doctors
  //                         </AppText>
  //                         {linkedDoctors.map(doctor => (
  //                           <View
  //                             key={doctor.customerId}
  //                             style={styles.linkedItemRow}
  //                           >
  //                             <View style={styles.linkedItemInfo}>
  //                               <AppText style={styles.linkedItemName}>
  //                                 {doctor.customerName}
  //                               </AppText>
  //                               <AppText style={styles.linkedItemCode}>
  //                                 {doctor.customerCode} | {doctor.cityName}
  //                               </AppText>
  //                             </View>
  //                           </View>
  //                         ))}
  //                       </View>
  //                     )}
  //                   </View>
  //                 )}
  //               </View>
  //             ))}
  //           </ScrollView>
  //         </View>
  //       );
  //     }

  //     // If we have group hospitals, show accordion design
  //     if (groupHospitals.length > 0) {
  //       return (
  //         <View style={styles.tabContent}>
  //           <ScrollView style={styles.scrollContent}>
  //             {groupHospitals.map(hospital => (
  //               <View key={hospital.customerId} style={styles.accordionCard}>
  //                 {/* Hospital Header */}
  //                 <TouchableOpacity
  //                   style={styles.accordionHeader}
  //                   onPress={() =>
  //                     setExpandedGroupHospitals(prev => ({
  //                       ...prev,
  //                       [hospital.customerId]: !prev[hospital.customerId],
  //                     }))
  //                   }
  //                 >
  //                   <View style={styles.accordionHeaderInfo}>
  //                     <AppText style={styles.accordionHospitalName}>
  //                       {hospital.customerName}
  //                     </AppText>
  //                     <AppText style={styles.accordionHospitalCode}>
  //                       {hospital.customerCode} | {hospital.cityName}
  //                     </AppText>

  //                     {expandedGroupHospitals[hospital.customerId] && (
  //                       <View style={styles.accordionTabsContainer}>
  //                         <TouchableOpacity
  //                           style={[
  //                             styles.accordionTab,
  //                             activeGroupHospitalTab[hospital.customerId] ===
  //                             'doctors' && styles.activeAccordionTab,
  //                           ]}
  //                           onPress={() =>
  //                             setActiveGroupHospitalTab(prev => ({
  //                               ...prev,
  //                               [hospital.customerId]: 'doctors',
  //                             }))
  //                           }
  //                         >
  //                           <AppText
  //                             style={[
  //                               styles.accordionTabText,
  //                               activeGroupHospitalTab[hospital.customerId] ===
  //                               'doctors' && styles.activeAccordionTabText,
  //                             ]}
  //                           >
  //                             Doctors
  //                           </AppText>
  //                         </TouchableOpacity>
  //                         <TouchableOpacity
  //                           style={[
  //                             styles.accordionTab,
  //                             (!activeGroupHospitalTab[hospital.customerId] ||
  //                               activeGroupHospitalTab[hospital.customerId] ===
  //                               'pharmacies') &&
  //                             styles.activeAccordionTab,
  //                           ]}
  //                           onPress={() =>
  //                             setActiveGroupHospitalTab(prev => ({
  //                               ...prev,
  //                               [hospital.customerId]: 'pharmacies',
  //                             }))
  //                           }
  //                         >
  //                           <AppText
  //                             style={[
  //                               styles.accordionTabText,
  //                               (!activeGroupHospitalTab[hospital.customerId] ||
  //                                 activeGroupHospitalTab[
  //                                 hospital.customerId
  //                                 ] === 'pharmacies') &&
  //                               styles.activeAccordionTabText,
  //                             ]}
  //                           >
  //                             Pharmacies
  //                           </AppText>
  //                         </TouchableOpacity>
  //                       </View>
  //                     )}
  //                   </View>
  //                 </TouchableOpacity>

  //                 {/* Expandable Content */}
  //                 {expandedGroupHospitals[hospital.customerId] && (
  //                   <View style={styles.accordionContent}>
  //                     {/* Pharmacies Tab */}
  //                     {(!activeGroupHospitalTab[hospital.customerId] ||
  //                       activeGroupHospitalTab[hospital.customerId] ===
  //                       'pharmacies') && (
  //                         <View style={styles.accordionItemsContainer}>
  //                           {linkedPharmacies.length > 0 ? (
  //                             <>
  //                               <View style={styles.accordionItemsHeader}>
  //                                 <AppText
  //                                   style={styles.accordionItemsHeaderText}
  //                                 >
  //                                   Pharmacy Details
  //                                 </AppText>
  //                                 <AppText
  //                                   style={styles.accordionItemsHeaderText}
  //                                 >
  //                                   Action
  //                                 </AppText>
  //                               </View>
  //                               {linkedPharmacies.map((pharmacy, index) => (
  //                                 <View
  //                                   key={`${hospital.customerId}-pharmacy-${pharmacy.customerId}-${index}`}
  //                                   style={styles.accordionItemRow}
  //                                 >
  //                                   <View style={styles.accordionItemInfo}>
  //                                     <AppText style={styles.accordionItemName}>
  //                                       {pharmacy.customerName}
  //                                     </AppText>
  //                                     <AppText style={styles.accordionItemCode}>
  //                                       {pharmacy.customerCode} |{' '}
  //                                       {pharmacy.cityName}
  //                                     </AppText>
  //                                   </View>
  //                                 </View>
  //                               ))}
  //                             </>
  //                           ) : (
  //                             <View style={styles.emptyAccordionContent}>
  //                               <AppText style={styles.emptyAccordionText}>
  //                                 No pharmacies linked
  //                               </AppText>
  //                             </View>
  //                           )}
  //                         </View>
  //                       )}

  //                     {/* Doctors Tab */}
  //                     {activeGroupHospitalTab[hospital.customerId] ===
  //                       'doctors' && (
  //                         <View style={styles.accordionItemsContainer}>
  //                           {linkedDoctors.length > 0 ? (
  //                             <>
  //                               <View style={styles.accordionItemsHeader}>
  //                                 <AppText
  //                                   style={styles.accordionItemsHeaderText}
  //                                 >
  //                                   Doctor Details
  //                                 </AppText>
  //                                 <AppText
  //                                   style={styles.accordionItemsHeaderText}
  //                                 >
  //                                   Action
  //                                 </AppText>
  //                               </View>
  //                               {linkedDoctors.map((doctor, index) => (
  //                                 <View
  //                                   key={`${hospital.customerId}-doctor-${doctor.customerId}-${index}`}
  //                                   style={styles.accordionItemRow}
  //                                 >
  //                                   <View style={styles.accordionItemInfo}>
  //                                     <AppText style={styles.accordionItemName}>
  //                                       {doctor.customerName}
  //                                     </AppText>
  //                                     <AppText style={styles.accordionItemCode}>
  //                                       {doctor.customerCode} | {doctor.cityName}
  //                                     </AppText>
  //                                   </View>
  //                                 </View>
  //                               ))}
  //                             </>
  //                           ) : (
  //                             <View style={styles.emptyAccordionContent}>
  //                               <AppText style={styles.emptyAccordionText}>
  //                                 No doctors linked
  //                               </AppText>
  //                             </View>
  //                           )}
  //                         </View>
  //                       )}
  //                   </View>
  //                 )}
  //               </View>
  //             ))}
  //           </ScrollView>
  //         </View>
  //       );
  //     }

  //     // Check if we have any other data
  //     const hasOtherData =
  //       linkedPharmacies.length > 0 || linkedDoctors.length > 0;

  //     if (!hasOtherData) {
  //       return (
  //         <View style={styles.tabContent}>
  //           <ScrollView style={styles.scrollContent}>
  //             <View style={styles.emptyContainer}>
  //               <Icon name="inbox" size={50} color="#999" />
  //               <AppText style={styles.emptyText}>No data found</AppText>
  //               <AppText style={styles.emptySubText}>
  //                 Linked pharmacies, doctors and hospitals will appear here
  //               </AppText>
  //             </View>
  //           </ScrollView>
  //         </View>
  //       );
  //     }

  //     return (
  //       <View style={styles.tabContent}>
  //         <ScrollView style={styles.scrollContent}>
  //           {/* Linked Pharmacies Section */}
  //           {linkedPharmacies.length > 0 && (
  //             <View style={styles.hierarchySection}>
  //               <AppText style={styles.hierarchySectionTitle}>
  //                 Linked Pharmacies
  //               </AppText>

  //               <View style={styles.hierarchyHeader}>
  //                 <AppText style={styles.hierarchyHeaderText}>
  //                   Pharmacy Details
  //                 </AppText>
  //                 <AppText style={styles.hierarchyHeaderText}>Action</AppText>
  //               </View>

  //               {linkedPharmacies.map(pharmacy => (
  //                 <View key={pharmacy.customerId} style={styles.hierarchyRow}>
  //                   <View style={styles.hierarchyInfo}>
  //                     <AppText style={styles.hierarchyName}>
  //                       {pharmacy.customerName}
  //                     </AppText>
  //                     <AppText style={styles.hierarchyCode}>
  //                       {pharmacy.customerCode} | {pharmacy.cityName}
  //                     </AppText>
  //                   </View>
  //                 </View>
  //               ))}
  //             </View>
  //           )}

  //           {/* Linked Doctors Section */}
  //           {linkedDoctors.length > 0 && (
  //             <View style={styles.hierarchySection}>
  //               <AppText style={styles.hierarchySectionTitle}>
  //                 Linked Doctors
  //               </AppText>

  //               <View style={styles.hierarchyHeader}>
  //                 <AppText style={styles.hierarchyHeaderText}>
  //                   Doctor Details
  //                 </AppText>
  //                 <AppText style={styles.hierarchyHeaderText}>Action</AppText>
  //               </View>

  //               {linkedDoctors.map(doctor => (
  //                 <View key={doctor.customerId} style={styles.hierarchyRow}>
  //                   <View style={styles.hierarchyInfo}>
  //                     <AppText style={styles.hierarchyName}>
  //                       {doctor.customerName}
  //                     </AppText>
  //                     <AppText style={styles.hierarchyCode}>
  //                       {doctor.customerCode} | {doctor.cityName}
  //                     </AppText>
  //                   </View>
  //                 </View>
  //               ))}
  //             </View>
  //           )}

  //           {/* Group Hospitals Section */}
  //           {groupHospitals.length > 0 && (
  //             <View style={styles.hierarchySection}>
  //               <AppText style={styles.hierarchySectionTitle}>
  //                 Group Hospitals
  //               </AppText>

  //               <View style={styles.hierarchyHeader}>
  //                 <AppText style={styles.hierarchyHeaderText}>
  //                   Hospital Details
  //                 </AppText>
  //                 <AppText style={styles.hierarchyHeaderText}>Action</AppText>
  //               </View>

  //               {groupHospitals.map(hospital => (
  //                 <View key={hospital.customerId} style={styles.hierarchyRow}>
  //                   <View style={styles.hierarchyInfo}>
  //                     <AppText style={styles.hierarchyName}>
  //                       {hospital.customerName}
  //                     </AppText>
  //                     <AppText style={styles.hierarchyCode}>
  //                       {hospital.customerCode} | {hospital.cityName}
  //                     </AppText>
  //                   </View>
  //                 </View>
  //               ))}
  //             </View>
  //           )}
  //         </ScrollView>
  //       </View>
  //     );
  //   }

  //   return null;
  // };


  const renderCustomerHierarchyTab = () => {
    if (!hierarchyMappingData) {
      return (
        <View style={styles.tabContent}>
          <ScrollView style={styles.scrollContent}>
            <View style={styles.emptyContainer}>
              <Icon name="inbox" size={50} color="#999" />
              <AppText style={styles.emptyText}>No data found</AppText>
              <AppText style={styles.emptySubText}>
                Linked data will appear here
              </AppText>
            </View>
          </ScrollView>
        </View>
      );
    }

    const {
      pharmacy = [],
      doctors = [],
      hospitals = [],
      groupHospitals = [],
    } = hierarchyMappingData;

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
                <View key={item.customerId} style={styles.hierarchyRow}>
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
                      <TouchableOpacity style={styles.approveButton}>
                        <Icon name="check" size={14} color="#fff" />
                        <AppText style={styles.approveButtonText}>Approve</AppText>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.rejectButton}>
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
                            key={item.customerId}
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
                              <TouchableOpacity style={styles.approveButton}>
                                <Icon name="check" size={14} color="#fff" />
                              </TouchableOpacity>
                              <TouchableOpacity style={styles.rejectButton}>
                                <Icon name="close" size={14} color="#2B2B2B" />
                              </TouchableOpacity>
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
            ({ list, title, header }) =>
              list.length > 0 && (
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
                    <View key={item.customerId} style={styles.hierarchyRow}>
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
                          <TouchableOpacity style={styles.approveButton}>
                            <Icon name="check" size={14} color="#fff" />
                            <AppText style={styles.approveButtonText}>Approve</AppText>
                          </TouchableOpacity>

                          <TouchableOpacity style={styles.rejectButton}>
                            <Icon name="close" size={14} color="#2B2B2B" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )
          )}
        </ScrollView>
      </View>
    );
  };

  const DivisionSelectionModal = () => (
    <Modal
      visible={showDivisionModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowDivisionModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.divisionModalContent}>
          <View style={styles.modalHeader}>
            <AppText style={styles.modalTitle}>Divisions</AppText>
            <TouchableOpacity onPress={() => setShowDivisionModal(false)}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.divisionModalHeader}>
            <AppText style={styles.divisionModalHeaderText}>Name</AppText>
            <AppText style={styles.divisionModalHeaderText}>Code</AppText>
          </View>

          <ScrollView style={styles.divisionModalList}>
            {mockDivisions.allDivisions.map(division => (
              <TouchableOpacity
                key={division.id}
                style={styles.divisionModalItem}
                onPress={() => toggleDivisionSelection(division, true)}
              >
                <View
                  style={[
                    styles.checkbox,
                    allDivisionsSelected.find(d => d.id === division.id) &&
                    styles.checkboxSelected,
                  ]}
                >
                  {allDivisionsSelected.find(d => d.id === division.id) && (
                    <Icon name="check" size={16} color="#fff" />
                  )}
                </View>
                <AppText style={styles.divisionModalName}>
                  {division.name}
                </AppText>
                <AppText style={styles.divisionModalCode}>
                  {division.code}
                </AppText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      <View style={styles.container}>
        {/* Sub-tabs */}

        <ScrollView
          ref={tabScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.subTabsContainer}
          scrollEventThrottle={16}
        >
          {/* Divisions Tab - Always visible */}
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

          {/* Distributors Tab - Disabled if no opened divisions */}
          <TouchableOpacity
            style={[
              styles.subTab,
              activeSubTab === 'distributors' && styles.activeSubTab,
              openedDivisionsData.length === 0 && styles.disabledTab,
            ]}
            ref={ref => (tabRefs.current['distributors'] = ref)}
            onPress={() =>
              openedDivisionsData.length > 0 && handleTabPress('distributors')
            }
            disabled={openedDivisionsData.length === 0}
          >
            <Distributors
              color={
                openedDivisionsData.length > 0
                  ? activeSubTab === 'distributors'
                    ? '#000'
                    : '#999'
                  : '#CCC'
              }
            />

            <AppText
              style={[
                styles.subTabText,
                activeSubTab === 'distributors' && styles.activeSubTabText,
                openedDivisionsData.length === 0 && styles.disabledTabText,
              ]}
            >
              Distributors
            </AppText>
          </TouchableOpacity>

          {/* Field Tab - Disabled if no opened divisions */}
          <TouchableOpacity
            style={[
              styles.subTab,
              activeSubTab === 'field' && styles.activeSubTab,
              openedDivisionsData.length === 0 && styles.disabledTab,
            ]}
            ref={ref => (tabRefs.current['field'] = ref)}
            onPress={() =>
              openedDivisionsData.length > 0 && handleTabPress('field')
            }
            disabled={openedDivisionsData.length === 0}
          >
            <Field
              color={
                openedDivisionsData.length > 0
                  ? activeSubTab === 'field'
                    ? '#000'
                    : '#999'
                  : '#CCC'
              }
            />
            <AppText
              style={[
                styles.subTabText,
                activeSubTab === 'field' && styles.activeSubTabText,
                openedDivisionsData.length === 0 && styles.disabledTabText,
              ]}
            >
              Field
            </AppText>
          </TouchableOpacity>

          {/* Customer Hierarchy Tab - Always visible */}
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
        {/* Divisions Tab - Always visible */}


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
  scrollContentWithButton: {
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
  fieldHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  fieldHeaderText: {
    flex: 1,
    fontSize: 14,
    color: '#999',
    fontWeight: '400',
  },
  fieldHeaderDesignation: {
    textAlign: 'right',
    paddingRight: 10,
  },
  fieldRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
  },
  employeeInfo: {
    flex: 1,
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
  employeeDesignationContainer: {
    flex: 1,
    alignItems: 'flex-end',
    paddingRight: 10,
  },
  employeeDesignation: {
    fontSize: 15,
    color: '#666',
    textAlign: 'right',
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
  divisionModalName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
  },
  divisionModalCode: {
    fontSize: 14,
    color: '#666',
  },
  // Dropdown menu styles
  dropdownWrapper: {
    position: 'relative',
    flex: 1,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingVertical: 4,
    marginTop: 6,
    elevation: 4,
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
    zIndex: 50,
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

    // FIX CLIPPING
    zIndex: 9999,
    elevation: 15,

    // Stronger shadow for visibility
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
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

    // FIX CLIPPING
    overflow: 'visible',
    zIndex: 9999,
    elevation: 20,

    // Improve shadow
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
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

    // Makes touch detection easy
    zIndex: 9999,
  },

  dropdownMenuText: {
    fontSize: 14,
    color: '#333',
    zIndex: 9999,
  },

  supplyTypeText: {
    fontSize: 14,
    color: '#333',
    marginRight: 6,
  },
  tabContentWrapper: {
    flex: 1,
    // paddingTop: 60, // Same height as tab bar
    overflow: 'hidden',
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
  },

  /* Opened Rows */
  openedRow: {
    // flexDirection: "row",
    // justifyContent: "space-between",
    // alignItems: "center",
    // marginBottom: 28,
    borderBottomColor: "#D9DFE2",
    borderBottomWidth: 1,
    paddingBottom: 10,
    marginBottom: 10,


  },

  emptyText: {
    // marginTop: 10,
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
    marginVertical: 5
  },

  unblockButton: {
    borderColor: "#FF6B00",
    backgroundColor: "#FFF5EF",
  },

  blockText: {
    marginLeft: 6,
    fontSize: 12,
    color: "#2B2B2B",
  },

  unblockText: {
    color: "#FF6B00",
  },

  subTabsWrapper: {
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
    marginHorizontal: 16
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

  dropdownText: {
    fontSize: 14,
    color: '#111827',
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
  },

  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
  },

  radioOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    marginRight: 6,
  },

  radioSelectedOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },

  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
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

});

export default LinkagedTab;


