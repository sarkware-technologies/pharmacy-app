import React, { useState, useEffect, useRef } from 'react';
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
  TagHospitalModal 
} from '../../../components/OnboardConfirmModel';
import { customerAPI } from '../../../api/customer';
import { useSelector } from 'react-redux';
import { selectCurrentCustomerId } from '../../../redux/slices/customerSlice';
import {AppText,AppInput} from "../../../components"

const { width } = Dimensions.get('window');

// Mock data for different customer types
const mockLinkagedData = {
  doctor: {
    linkedPharmacies: [
      { id: 1, name: 'Jahangir Pharmacies', code: '3645', location: 'Pune', status: 'pending' },
      { id: 2, name: 'Ruby hall pharmacies', code: '1645', location: 'Pune', status: 'pending' },
      { id: 3, name: 'Sai shreepharmacies', code: '4645', location: 'Pune', status: 'pending' },
      { id: 4, name: 'Columbia pharmacies', code: '2645', location: 'Pune', status: 'pending' },
    ],
  },
  hospital: {
    parentHospital: {
      name: 'Tata Group',
      code: '1563',
      type: 'Group Hospital'
    },
    childHospitals: [
      { id: 1, name: 'Tata Memorial MUM', code: '1563', type: 'Hospital', status: 'pending' },
      { id: 2, name: 'Tata Memorial HYD', code: '1563', type: 'Hospital', status: 'pending' },
      { id: 3, name: 'Tata Memorial JAM', code: '1563', type: 'Hospital', status: 'pending' },
    ],
    linkedPharmacies: [
      { id: 1, name: 'Jahangir Pharmacies', code: '3645', location: 'Pune', status: 'pending' },
      { id: 2, name: 'Ruby hall pharmacies', code: '1645', location: 'Pune', status: 'pending' },
      { id: 3, name: 'Sai shreepharmacies', code: '4645', location: 'Pune', status: 'pending' },
      { id: 4, name: 'Columbia pharmacies', code: '2645', location: 'Pune', status: 'pending' },
    ],
    linkedDoctors: []
  },
  pharmacy: {
    linkedDoctors: [],
    linkedHospitals: []
  }
};

// Static distributor data
const mockDistributors = {
  preferred: [
    {
      id: 1,
      name: 'Mahalaxmi Distributors',
      code: '10106555',
      location: 'One city',
      city: 'Pune',
      division: 'SPLL',
      allDivisions: false,
      margin: 15,
      rateType: 'Net Rate',
    }
  ],
  all: [
    { id: 1, name: 'Mahalaxmi distributors', code: '10106555', city: 'Pune', supplyType: 'Net Rate (DM)' },
    { id: 2, name: 'Rupesh stores', code: '10106555', city: 'Pune', supplyType: 'Chargeback (CM)' },
    { id: 3, name: 'Tapadiya distributors', code: '10106555', city: 'Pune', supplyType: 'Net Rate (DM)' },
    { id: 4, name: 'Sai shree memo', code: '10106555', city: 'Pune', supplyType: 'Net Rate (DM)' },
    { id: 5, name: 'Rupesh stores', code: '10106555', city: 'Pune', supplyType: 'Chargeback (CM)' },
    { id: 6, name: 'Tapadiya distributors', code: '10106555', city: 'Pune', supplyType: 'Net Rate (DM)' },
    { id: 7, name: 'Sai shree memo', code: '10106555', city: 'Pune', supplyType: 'Net Rate (DM)' },
  ]
};

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
  ]
};

// Static field data
const mockFieldData = [
  { id: 1, name: 'Abhishek Suryawanshi', code: 'SUN12345', designation: 'Customer executive' },
  { id: 2, name: 'Akshav Pawar', code: 'SUN12345', designation: 'NSM' },
  { id: 3, name: 'Sachin Patil', code: 'SUN12345', designation: 'Filed officer' },
  { id: 4, name: 'Rushikesh Mahajan', code: 'SUN12345', designation: 'ZSM' },
  { id: 5, name: 'Akshay Amanakar', code: 'SUN12345', designation: 'ASM' },
  { id: 6, name: 'Omkar Ankam', code: 'SUN12345', designation: 'Filed officer' },
  { id: 7, name: 'Vrushal Shinde', code: 'SUN12345', designation: 'Customer executive' },
  { id: 8, name: 'Sagar Kadam', code: 'SUN12345', designation: 'Customer executive' },
  { id: 9, name: 'Sanket Kulkarni', code: 'SUN12345', designation: 'Customer executive' },
];

export const LinkagedTab = ({ customerType = 'Hospital', customerId = null }) => {
  const [activeSubTab, setActiveSubTab] = useState('divisions');
  const [activeDistributorTab, setActiveDistributorTab] = useState('preferred');
  const [showDivisionModal, setShowDivisionModal] = useState(false);
  const [selectedDivisions, setSelectedDivisions] = useState(mockDivisions.other.filter(d => d.selected));
  const [allDivisionsSelected, setAllDivisionsSelected] = useState(mockDivisions.allDivisions.filter(d => d.selected));
  const [searchText, setSearchText] = useState('');
  
  // Get logged-in user data
  const loggedInUser = useSelector(state => state.auth.user);
  
  // Get customerId from Redux (set by CustomerDetail)
  const reduxCustomerId = useSelector(selectCurrentCustomerId);
  // Use Redux customerId if available, otherwise fall back to prop
  const effectiveCustomerId = reduxCustomerId || customerId;
  
  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showLinkDivisionsModal, setShowLinkDivisionsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Customer Hierarchy states
  const [activeHierarchyTab, setActiveHierarchyTab] = useState('pharmacies');
  
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
  const [preferredDistributorsData, setPreferredDistributorsData] = useState([]);
  const [distributorsLoading, setDistributorsLoading] = useState(false);
  const [distributorsError, setDistributorsError] = useState(null);

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

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    
    setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };

  // Fetch divisions data on component mount
  useEffect(() => {
    const fetchDivisionsData = async () => {
      console.log('LinkagedTab: Fetching divisions for customerId:', effectiveCustomerId);
      if (!effectiveCustomerId) {
        console.log('LinkagedTab: No customerId provided, skipping divisions fetch');
        return;
      }
      
      try {
        setDivisionsLoading(true);
        setDivisionsError(null);
        
        // Fetch customer's linked divisions
        console.log('LinkagedTab: Calling getCustomerDivisions API...');
        const customerDivisionsResponse = await customerAPI.getCustomerDivisions(effectiveCustomerId);
        console.log('LinkagedTab: Customer divisions API response:', customerDivisionsResponse);
        
        // Fetch all available divisions
        console.log('LinkagedTab: Calling getAllDivisions API...');
        const allDivisionsResponse = await customerAPI.getAllDivisions();
        console.log('LinkagedTab: All divisions API response:', allDivisionsResponse);
        
        let openedDivisions = [];
        let otherDivisions = [];
        
        // Process customer's linked divisions (opened)
        if (customerDivisionsResponse?.data && Array.isArray(customerDivisionsResponse.data)) {
          openedDivisions = customerDivisionsResponse.data;
          console.log('LinkagedTab: Opened divisions:', openedDivisions.length);
        }
        
        // Process all available divisions and filter out already linked ones
        if (allDivisionsResponse?.data?.divisions && Array.isArray(allDivisionsResponse.data.divisions)) {
          const linkedDivisionIds = openedDivisions.map(d => Number(d.divisionId));
          otherDivisions = allDivisionsResponse.data.divisions.filter(
            d => !linkedDivisionIds.includes(Number(d.divisionId))
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

  // Fetch preferred distributors when Preferred tab is active
  useEffect(() => {
    const fetchPreferredDistributorsData = async () => {
      if (activeDistributorTab !== 'preferred' || !effectiveCustomerId) {
        return;
      }

      console.log('LinkagedTab: Fetching preferred distributors for customerId:', effectiveCustomerId);
      
      try {
        setDistributorsLoading(true);
        setDistributorsError(null);
        
        // Call API to get linked distributors and divisions
        const response = await customerAPI.getLinkedDistributorDivisions(effectiveCustomerId);
        console.log('LinkagedTab: Linked distributor divisions API response:', response);
        
        if (response?.data?.customer?.distributorDetails && Array.isArray(response.data.customer.distributorDetails)) {
          console.log('LinkagedTab: Setting preferredDistributorsData with', response.data.customer.distributorDetails.length, 'distributors');
          setPreferredDistributorsData(response.data.customer.distributorDetails);
        } else {
          console.log('LinkagedTab: Invalid preferred distributors response format');
          setPreferredDistributorsData([]);
        }
      } catch (error) {
        console.error('LinkagedTab: Error fetching preferred distributors:', error);
        setDistributorsError(error.message);
        setPreferredDistributorsData([]);
      } finally {
        setDistributorsLoading(false);
      }
    };

    fetchPreferredDistributorsData();
  }, [activeDistributorTab, effectiveCustomerId]);

  // Fetch all distributors when All Distributors tab is active and opened divisions exist
  useEffect(() => {
    const fetchDistributorsData = async () => {
      if (activeDistributorTab !== 'all' || openedDivisionsData.length === 0) {
        return;
      }

      console.log('LinkagedTab: Fetching distributors for divisions:', openedDivisionsData);
      
      try {
        setDistributorsLoading(true);
        setDistributorsError(null);
        
        // Get division IDs from opened divisions
        const divisionIds = openedDivisionsData.map(d => Number(d.divisionId));
        console.log('LinkagedTab: Division IDs for distributor query:', divisionIds);
        
        // Call API to get distributors
        const response = await customerAPI.getDistributorsList(1, 20, divisionIds, 0, 0);
        console.log('LinkagedTab: Distributors API response:', response);
        
        if (response?.data?.distributors && Array.isArray(response.data.distributors)) {
          console.log('LinkagedTab: Setting allDistributorsData with', response.data.distributors.length, 'distributors');
          setAllDistributorsData(response.data.distributors);
        } else {
          console.log('LinkagedTab: Invalid distributors response format');
          setAllDistributorsData([]);
        }
      } catch (error) {
        console.error('LinkagedTab: Error fetching distributors:', error);
        setDistributorsError(error.message);
        setAllDistributorsData([]);
      } finally {
        setDistributorsLoading(false);
      }
    };

    fetchDistributorsData();
  }, [activeDistributorTab, openedDivisionsData]);

  const handleApprove = (item) => {
    setSelectedItem(item);
    setShowApproveModal(true);
  };

  const handleReject = (item) => {
    setSelectedItem(item);
    setShowRejectModal(true);
  };
  
  const handleApproveConfirm = async (comment) => {
    try {
      const workflowId = selectedItem?.workflowId || selectedItem?.id;
      const actorId = loggedInUser?.userId || loggedInUser?.id;
      
      const actionData = {
        stepOrder: 3,
        parallelGroup: 1,
        actorId: actorId,
        action: "APPROVE",
        comments: comment || "Approved",
        actionData: {}
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
        action: "REJECT",
        comments: "Rejected",
        actionData: {}
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
  
  const handleLinkDivisionsConfirmModal = (comment) => {
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
  const handleAddDistributor = async (distributor) => {
    const alreadyExists = preferredDistributorsData.find(d => d.id === distributor.id);
    if (alreadyExists) {
      showToast(`${distributor.name} is already in preferred distributors!`, 'error');
      return;
    }

    try {
      console.log('Adding distributor:', distributor.id);
      
      // Build the mapping payload with opened divisions
      const mappingsPayload = {
        mappings: [
          {
            distributorId: Number(distributor.id),
            divisions: openedDivisionsData.map(d => ({
              id: Number(d.divisionId),
              isActive: true
            })),
            supplyModeId: 3,
            margin: 1
          }
        ]
      };

      console.log('Link distributor payload:', mappingsPayload);
      
      // Call API to link distributor
      const response = await customerAPI.linkDistributorDivisions(effectiveCustomerId, mappingsPayload);
      console.log('Link distributor API response:', response);

      // Add to preferred distributors locally
      setPreferredDistributorsData(prev => [...prev, distributor]);
      
      showToast(`${distributor.name} added to preferred distributors!`, 'success');
      
      // Refresh preferred distributors list
      if (effectiveCustomerId) {
        const updatedResponse = await customerAPI.getLinkedDistributorDivisions(effectiveCustomerId);
        if (updatedResponse?.data?.customer?.distributorDetails && Array.isArray(updatedResponse.data.customer.distributorDetails)) {
          setPreferredDistributorsData(updatedResponse.data.customer.distributorDetails);
        }
      }
    } catch (error) {
      console.error('Error adding distributor:', error);
      showToast(`Failed to add distributor: ${error.message}`, 'error');
    }
  };

  // Remove distributor from "Preferred"
  const handleRemoveDistributor = (distributorId) => {
    setPreferredDistributorsData(prev => prev.filter(d => d.id !== distributorId));
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
      [distributorId]: rateType
    }));
    setShowRateTypeDropdown(prev => ({
      ...prev,
      [distributorId]: false
    }));
  };

  // Handle division selection
  const handleDivisionSelect = (distributorId, division) => {
    setDistributorDivision(prev => ({
      ...prev,
      [distributorId]: division
    }));
    setShowDivisionDropdown(prev => ({
      ...prev,
      [distributorId]: false
    }));
  };

  // Toggle rate type dropdown
  const toggleRateTypeDropdown = (distributorId) => {
    setShowRateTypeDropdown(prev => ({
      ...prev,
      [distributorId]: !prev[distributorId]
    }));
  };

  // Toggle division dropdown
  const toggleDivisionDropdown = (distributorId) => {
    setShowDivisionDropdown(prev => ({
      ...prev,
      [distributorId]: !prev[distributorId]
    }));
  };

  // Toggle division selection in "Other Division"
  const toggleOtherDivisionSelection = (division) => {
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
  const handleLinkDivisionsConfirm = (comment) => {
    if (selectedDivisions.length === 0) {
      showToast('Please select at least one division', 'error');
      return;
    }

    // Move selected divisions to opened
    setOpenedDivisionsData(prev => [...prev, ...selectedDivisions]);
    
    // Remove from other divisions
    const selectedIds = selectedDivisions.map(d => d.divisionId);
    setOtherDivisionsData(prev => prev.filter(d => !selectedIds.includes(d.divisionId)));
    
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

      const divisionsPayload = {
        divisions: validDivisions.map(division => ({
          divisionId: Number(division.divisionId),
          isActive: true
        }))
      };

      console.log('Linking divisions with payload:', divisionsPayload);
      
      // Call API to link divisions
      const response = await customerAPI.linkDivisions(effectiveCustomerId, divisionsPayload);
      
      console.log('Link divisions API response:', response);

      // Move valid selected divisions to opened
      setOpenedDivisionsData(prev => [...prev, ...validDivisions]);
      
      // Remove from other divisions
      const selectedIds = validDivisions.map(d => d.divisionId);
      setOtherDivisionsData(prev => prev.filter(d => !selectedIds.includes(d.divisionId)));
      
      // Clear selection
      setSelectedDivisions([]);
      
      showToast('Divisions linked successfully!', 'success');
      
      // Refresh divisions data after linking
      if (effectiveCustomerId) {
        try {
          // Fetch updated customer divisions (opened)
          const customerDivisionsResponse = await customerAPI.getCustomerDivisions(effectiveCustomerId);
          
          // Fetch all available divisions
          const allDivisionsResponse = await customerAPI.getAllDivisions();
          
          let updatedOpenedDivisions = [];
          let updatedOtherDivisions = [];
          
          // Process customer's linked divisions (opened)
          if (customerDivisionsResponse?.data && Array.isArray(customerDivisionsResponse.data)) {
            updatedOpenedDivisions = customerDivisionsResponse.data;
          }
          
          // Process all available divisions and filter out already linked ones
          if (allDivisionsResponse?.data?.divisions && Array.isArray(allDivisionsResponse.data.divisions)) {
            const linkedDivisionIds = updatedOpenedDivisions.map(d => Number(d.divisionId));
            updatedOtherDivisions = allDivisionsResponse.data.divisions.filter(
              d => !linkedDivisionIds.includes(Number(d.divisionId))
            );
          }
          
          setOpenedDivisionsData(updatedOpenedDivisions);
          setOtherDivisionsData(updatedOtherDivisions);
        } catch (error) {
          console.error('Error refreshing divisions after linking:', error);
        }
      }
    } catch (error) {
      console.error('Error linking divisions:', error);
      showToast(`Failed to link divisions: ${error.message}`, 'error');
    } finally {
      setLinkingDivisions(false);
    }
  };

  const renderDistributorsTab = () => (
    <View style={styles.tabContent}>
      {/* Sub tabs for Preferred and All Distributors */}
      <View style={styles.distributorTabs}>
        <TouchableOpacity
          style={[styles.distributorTab, activeDistributorTab === 'preferred' && styles.activeDistributorTab]}
          onPress={() => setActiveDistributorTab('preferred')}
        >
          <AppText style={[styles.distributorTabText, activeDistributorTab === 'preferred' && styles.activeDistributorTabText]}>
            Preferred Distributors
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.distributorTab, activeDistributorTab === 'all' && styles.activeDistributorTab]}
          onPress={() => setActiveDistributorTab('all')}
        >
          <AppText style={[styles.distributorTabText, activeDistributorTab === 'all' && styles.activeDistributorTabText]}>
            All Distributors
          </AppText>
        </TouchableOpacity>
      </View>

      {activeDistributorTab === 'preferred' ? (
        <ScrollView style={styles.scrollContent}>
          {/* Suggested Stockist */}
          <View style={styles.suggestedSection}>
            <AppText style={styles.suggestedTitle}>Suggested Stockist by MR</AppText>
            <TouchableOpacity style={styles.infoIcon}>
              <Icon name="information-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {preferredDistributorsData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="package-variant-closed" size={40} color="#999" />
              <AppText style={styles.emptyText}>No preferred distributors added yet</AppText>
              <AppText style={styles.emptySubText}>Add distributors from "All Distributors" tab</AppText>
            </View>
          ) : (
            preferredDistributorsData.map((distributor) => (
              <View key={distributor.id} style={styles.distributorCard}>
                <View style={styles.distributorHeader}>
                  <AppText style={styles.distributorName}>{distributor.name}</AppText>
                  <View style={styles.marginContainer}>
                    <AppText style={styles.marginLabel}>Margin</AppText>
                    <View style={styles.marginInputContainer}>
                      <AppInput
                        style={styles.marginInput}
                        placeholder="0"
                        keyboardType="numeric"
                      />
                      <AppText style={styles.marginPercent}>%</AppText>
                    </View>
                  </View>
                </View>
                
                <AppText style={styles.distributorInfo}>
                  {distributor.code} | {distributor.cityName || 'N/A'} | {distributor.stateName || 'N/A'}
                </AppText>

                <View style={styles.distributorActions}>
                  <View style={styles.dropdownsRow}>
                    {/* Organization Dropdown */}
                    <View style={styles.dropdownWrapper}>
                      <TouchableOpacity 
                        style={styles.dropdown}
                        onPress={() => toggleDivisionDropdown(distributor.id)}
                      >
                        <AppText style={styles.dropdownText}>
                          {distributorDivision[distributor.id] || 'SPILL'}
                        </AppText>
                        <IconMaterial name="keyboard-arrow-down" size={20} color="#666" />
                      </TouchableOpacity>
                      {showDivisionDropdown[distributor.id] && (
                        <View style={styles.dropdownMenu}>
                          <TouchableOpacity 
                            style={styles.dropdownMenuItem}
                            onPress={() => handleDivisionSelect(distributor.id, 'SPILL')}
                          >
                            <AppText style={styles.dropdownMenuText}>SPILL</AppText>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.dropdownMenuItem}
                            onPress={() => handleDivisionSelect(distributor.id, 'BOTH')}
                          >
                            <AppText style={styles.dropdownMenuText}>BOTH</AppText>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                    
                    {/* All Divisions Dropdown */}
                    <View style={styles.dropdownWrapper}>
                      <TouchableOpacity 
                        style={styles.dropdown}
                        onPress={() => toggleRateTypeDropdown(distributor.id)}
                      >
                        <AppText style={styles.dropdownText}>
                          {distributorRateType[distributor.id] || 'All Divisions'}
                        </AppText>
                        <IconMaterial name="keyboard-arrow-down" size={20} color="#666" />
                      </TouchableOpacity>
                      {showRateTypeDropdown[distributor.id] && (
                        <View style={styles.dropdownMenu}>
                          <TouchableOpacity 
                            style={styles.dropdownMenuItem}
                            onPress={() => handleRateTypeSelect(distributor.id, 'All Divisions')}
                          >
                            <AppText style={styles.dropdownMenuText}>All Divisions</AppText>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.dropdownMenuItem}
                            onPress={() => handleRateTypeSelect(distributor.id, 't4')}
                          >
                            <AppText style={styles.dropdownMenuText}>t4</AppText>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.dropdownMenuItem}
                            onPress={() => handleRateTypeSelect(distributor.id, 'test35')}
                          >
                            <AppText style={styles.dropdownMenuText}>test35</AppText>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => handleRemoveDistributor(distributor.id)}
                  >
                    <AppText style={styles.removeText}>Remove</AppText>
                    <IconFeather name="trash-2" size={16} color="#FF6B00" />
                  </TouchableOpacity>
                </View>

                <View style={styles.rateTypeRow}>
                  <TouchableOpacity 
                    style={styles.radioButton}
                    onPress={() => handleRateTypeSelect(distributor.id, 'Net Rate')}
                  >
                    <View style={[styles.radioOuter, distributorRateType[distributor.id] === 'Net Rate' && styles.radioSelected]}>
                      {distributorRateType[distributor.id] === 'Net Rate' && <View style={styles.radioInner} />}
                    </View>
                    <AppText style={styles.radioText}>Net Rate</AppText>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.radioButton}
                    onPress={() => handleRateTypeSelect(distributor.id, 'Chargeback')}
                  >
                    <View style={[styles.radioOuter, distributorRateType[distributor.id] === 'Chargeback' && styles.radioSelected]}>
                      {distributorRateType[distributor.id] === 'Chargeback' && <View style={styles.radioInner} />}
                    </View>
                    <AppText style={styles.radioText}>Chargeback</AppText>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}


        </ScrollView>
      ) : (
        <ScrollView style={styles.scrollContent}>
          {distributorsLoading ? (
            <View style={styles.loadingContainer}>
              <Icon name="loading" size={40} color="#FF6B00" />
              <AppText style={styles.loadingText}>Loading distributors...</AppText>
            </View>
          ) : distributorsError ? (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={40} color="#EF4444" />
              <AppText style={styles.errorText}>Error loading distributors</AppText>
              <AppText style={styles.errorSubText}>{distributorsError}</AppText>
            </View>
          ) : (
            <>
              {/* Filters */}
              <View style={styles.filterRow}>
                <TouchableOpacity style={styles.filterIcon}>
                  <Icon name="tune" size={20} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterDropdown}>
                  <AppText style={styles.filterText}>State</AppText>
                  <IconMaterial name="keyboard-arrow-down" size={20} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterDropdown}>
                  <AppText style={styles.filterText}>City</AppText>
                  <IconMaterial name="keyboard-arrow-down" size={20} color="#666" />
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
                <AppText style={styles.tableHeaderText}>Name, Code & City</AppText>
                <AppText style={styles.tableHeaderText}>Status</AppText>
                <AppText style={styles.tableHeaderText}>Action</AppText>
              </View>

              {/* Distributor List */}
              {allDistributorsData.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Icon name="package-variant-closed" size={40} color="#999" />
                  <AppText style={styles.emptyText}>No distributors available</AppText>
                </View>
              ) : (
                allDistributorsData.map((distributor) => (
                  <View key={`${distributor.id}-${distributor.name}`} style={styles.distributorRow}>
                    <View style={styles.distributorInfo}>
                      <AppText style={styles.distributorRowName}>{distributor.name}</AppText>
                      <AppText style={styles.distributorRowCode}>{distributor.code} | {distributor.cityName || 'N/A'}</AppText>
                    </View>
                    <TouchableOpacity style={styles.supplyTypeDropdown}>
                      <AppText style={styles.supplyTypeText}>{distributor.inviteStatusName}</AppText>
                      <IconMaterial name="keyboard-arrow-down" size={20} color="#666" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.addButton}
                      onPress={() => handleAddDistributor(distributor)}
                    >
                      <AppText style={styles.addButtonText}>+ Add</AppText>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </>
          )}
        </ScrollView>
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
          <ScrollView style={styles.scrollContent}>
            <View style={styles.divisionsContainer}>
              <View style={styles.divisionColumn}>
                <AppText style={styles.columnTitle}>Opened Division</AppText>
                <AppText style={styles.columnSubtitle}>Name & Code</AppText>
                
                {openedDivisionsData.length === 0 ? (
                  <View style={styles.emptyDivisionContainer}>
                    <AppText style={styles.emptyDivisionText}>No divisions opened yet</AppText>
                  </View>
                ) : (
                  openedDivisionsData.map((division) => (
                    <View key={division.divisionId} style={styles.divisionItem}>
                      <View>
                        <AppText style={styles.divisionName}>{division.divisionName}</AppText>
                        <AppText style={styles.divisionCode}>{division.divisionCode}</AppText>
                      </View>
                    </View>
                  ))
                )}
              </View>

              <View style={styles.divisionColumn}>
                <View style={styles.columnHeader}>
                  <AppText style={styles.columnTitle}>Other Division</AppText>
                  <TouchableOpacity>
                    <AppText style={styles.assignText}>Assign to Instra</AppText>
                  </TouchableOpacity>
                </View>
                <AppText style={styles.columnSubtitle}>Name & Code</AppText>
                
                {otherDivisionsData.length === 0 ? (
                  <View style={styles.emptyDivisionContainer}>
                    <AppText style={styles.emptyDivisionText}>No other divisions available</AppText>
                  </View>
                ) : (
                  otherDivisionsData.map((division) => (
                    <TouchableOpacity 
                      key={`other-${division.divisionId}`} 
                      style={styles.checkboxItem}
                      onPress={() => toggleOtherDivisionSelection(division)}
                    >
                      <View style={[styles.checkbox, selectedDivisions.find(d => d.divisionId === division.divisionId) && styles.checkboxSelected]}>
                        {selectedDivisions.find(d => d.divisionId === division.divisionId) && (
                          <Icon name="check" size={16} color="#fff" />
                        )}
                      </View>
                      <View>
                        <AppText style={styles.divisionName}>{division.divisionName}</AppText>
                        <AppText style={styles.divisionCode}>{division.divisionCode}</AppText>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>
          </ScrollView>

          {/* Sticky Continue Button at Bottom */}
          <View style={styles.stickyButtonContainer}>
            <TouchableOpacity 
              style={[styles.continueButton, (linkingDivisions || selectedDivisions.length === 0) && styles.continueButtonDisabled]}
              onPress={handleLinkDivisionsAPI}
              disabled={linkingDivisions || selectedDivisions.length === 0}
            >
              {linkingDivisions ? (
                <AppText style={styles.linkButtonText}>Linking...</AppText>
              ) : (
                <AppText style={styles.linkButtonText}>Continue</AppText>
              )}
            </TouchableOpacity>
          </View>
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
          <AppText style={styles.emptyText}>No field team members found</AppText>
        </View>
      ) : (
        <ScrollView style={styles.scrollContent}>
          <View style={styles.fieldHeader}>
            <AppText style={styles.fieldHeaderText}>Employee Name & Code</AppText>
            <AppText style={styles.fieldHeaderText}>Designation</AppText>
          </View>

          {fieldTeamData.map((employee) => (
            <View key={employee.id} style={styles.fieldRow}>
              <View style={styles.employeeInfo}>
                <AppText style={styles.employeeName}>{employee.userName}</AppText>
                <AppText style={styles.employeeCode}>{employee.userCode}</AppText>
              </View>
              <AppText style={styles.employeeDesignation}>{employee.designation}</AppText>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderCustomerHierarchyTab = () => {
    // Different views based on customer type
    if (customerType === 'Doctors') {
      return (
        <View style={styles.tabContent}>
          <ScrollView style={styles.scrollContent}>
            <View style={styles.emptyContainer}>
              <Icon name="inbox" size={50} color="#999" />
              <AppText style={styles.emptyText}>No data found</AppText>
              <AppText style={styles.emptySubText}>Linked pharmacies will appear here</AppText>
            </View>
            
            {/* TODO: Will integrate with API later */}
            {/* 
            <View style={styles.hierarchyHeader}>
              <AppText style={styles.hierarchyHeaderText}>Pharmacy Details</AppText>
              <AppText style={styles.hierarchyHeaderText}>Action</AppText>
            </View>

            {mockLinkagedData.doctor.linkedPharmacies.map((pharmacy) => (
              <View key={pharmacy.id} style={styles.hierarchyRow}>
                <View style={styles.hierarchyInfo}>
                  <AppText style={styles.hierarchyName}>{pharmacy.name}</AppText>
                  <AppText style={styles.hierarchyCode}>{pharmacy.code} | {pharmacy.location}</AppText>
                </View>
                <View style={styles.hierarchyActions}>
                  <TouchableOpacity 
                    style={styles.approveButton}
                    onPress={() => handleApprove(pharmacy)}
                  >
                    <Icon name="check" size={16} color="#fff" />
                    <AppText style={styles.approveButtonText}>Approve</AppText>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.rejectButton}
                    onPress={() => handleReject(pharmacy)}
                  >
                    <Icon name="close" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            */}
          </ScrollView>
        </View>
      );
    } else if (customerType === 'Hospital') {
      // Parent Hospital View
      if (mockLinkagedData.hospital.parentHospital) {
        return (
          <View style={styles.tabContent}>
            <ScrollView style={styles.scrollContent}>
              <View style={styles.emptyContainer}>
                <Icon name="inbox" size={50} color="#999" />
                <AppText style={styles.emptyText}>No data found</AppText>
                <AppText style={styles.emptySubText}>Linked pharmacies and doctors will appear here</AppText>
              </View>

              {/* TODO: Will integrate with API later */}
              {/* 
              {/* Parent Hospital Info */}
              {/* <View style={styles.parentHospitalCard}>
                <AppText style={styles.parentLabel}>Group Hospital</AppText>
                <AppText style={styles.parentTitle}>Parent Hospital</AppText>
                <AppText style={styles.parentName}>
                  {mockLinkagedData.hospital.parentHospital.name} | {mockLinkagedData.hospital.parentHospital.code}
                </AppText>
              </View>

              {/* Tabs for Linked Pharmacies and Doctors */}
              {/* <View style={styles.hierarchyTabs}>
                <TouchableOpacity
                  style={[styles.hierarchyTab, activeHierarchyTab === 'pharmacies' && styles.activeHierarchyTab]}
                  onPress={() => setActiveHierarchyTab('pharmacies')}
                >
                  <AppText style={[styles.hierarchyTabText, activeHierarchyTab === 'pharmacies' && styles.activeHierarchyTabText]}>
                    Linked Pharmacies
                  </AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.hierarchyTab, activeHierarchyTab === 'doctors' && styles.activeHierarchyTab]}
                  onPress={() => setActiveHierarchyTab('doctors')}
                >
                  <AppText style={[styles.hierarchyTabText, activeHierarchyTab === 'doctors' && styles.activeHierarchyTabText]}>
                    Linked Doctors
                  </AppText>
                </TouchableOpacity>
              </View>

              <View style={styles.hierarchyHeader}>
                <AppText style={styles.hierarchyHeaderText}>Pharmacy Details</AppText>
                <AppText style={styles.hierarchyHeaderText}>Action</AppText>
              </View>

              {mockLinkagedData.hospital.linkedPharmacies.map((pharmacy) => (
                <View key={pharmacy.id} style={styles.hierarchyRow}>
                  <View style={styles.hierarchyInfo}>
                    <AppText style={styles.hierarchyName}>{pharmacy.name}</AppText>
                    <AppText style={styles.hierarchyCode}>{pharmacy.code} | {pharmacy.location}</AppText>
                  </View>
                  <View style={styles.hierarchyActions}>
                    <TouchableOpacity 
                      style={styles.approveButton}
                      onPress={() => handleApprove(pharmacy)}
                    >
                      <Icon name="check" size={16} color="#fff" />
                      <AppText style={styles.approveButtonText}>Approve</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.rejectButton}
                      onPress={() => handleReject(pharmacy)}
                    >
                      <Icon name="close" size={20} color="#666" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              */}
            </ScrollView>
          </View>
        );
      } else {
        // Child Hospitals View
        return (
          <View style={styles.tabContent}>
            <ScrollView style={styles.scrollContent}>
              <View style={styles.emptyContainer}>
                <Icon name="inbox" size={50} color="#999" />
                <AppText style={styles.emptyText}>No data found</AppText>
                <AppText style={styles.emptySubText}>Child hospitals will appear here</AppText>
              </View>

              {/* TODO: Will integrate with API later */}
              {/* 
              {mockLinkagedData.hospital.childHospitals.map((hospital) => (
                <View key={hospital.id} style={styles.hospitalCard}>
                  <View style={styles.hospitalHeader}>
                    <View>
                      <AppText style={styles.hospitalName}>{hospital.name}</AppText>
                      <AppText style={styles.hospitalCode}>{hospital.code} | {hospital.type}</AppText>
                    </View>
                    <View style={styles.hierarchyActions}>
                      <TouchableOpacity 
                        style={styles.approveButton}
                        onPress={() => handleApprove(hospital)}
                      >
                        <Icon name="check" size={16} color="#fff" />
                        <AppText style={styles.approveButtonText}>Approve</AppText>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.rejectButton}
                        onPress={() => handleReject(hospital)}
                      >
                        <Icon name="close" size={20} color="#666" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.expandButton}>
                    <AppText style={styles.expandText}>Linked Pharmacies & Doctors</AppText>
                    <IconMaterial name="keyboard-arrow-down" size={24} color="#666" />
                  </TouchableOpacity>

                  {/* Tabs */}
                  {/* <View style={styles.hierarchyTabs}>
                    <TouchableOpacity style={[styles.hierarchyTab, styles.activeHierarchyTab]}>
                      <AppText style={[styles.hierarchyTabText, styles.activeHierarchyTabText]}>
                        Pharmacies
                      </AppText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.hierarchyTab}>
                      <AppText style={styles.hierarchyTabText}>Doctors</AppText>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.linkedItemsContainer}>
                    <View style={styles.hierarchyHeader}>
                      <AppText style={styles.hierarchyHeaderText}>Pharmacy Details</AppText>
                      <AppText style={styles.hierarchyHeaderText}>Action</AppText>
                    </View>

                    {mockLinkagedData.hospital.linkedPharmacies.map((pharmacy) => (
                      <View key={`${hospital.id}-${pharmacy.id}`} style={styles.hierarchyRow}>
                        <View style={styles.hierarchyInfo}>
                          <AppText style={styles.hierarchyName}>{pharmacy.name}</AppText>
                          <AppText style={styles.hierarchyCode}>{pharmacy.code} | {pharmacy.location}</AppText>
                        </View>
                        <View style={styles.hierarchyActions}>
                          <TouchableOpacity 
                            style={styles.approveButton}
                            onPress={() => handleApprove(pharmacy)}
                          >
                            <Icon name="check" size={16} color="#fff" />
                            <AppText style={styles.approveButtonText}>Approve</AppText>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.rejectButton}
                            onPress={() => handleReject(pharmacy)}
                          >
                            <Icon name="close" size={20} color="#666" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
              */}
            </ScrollView>
          </View>
        );
      }
    }

    return null;
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
            {mockDivisions.allDivisions.map((division) => (
              <TouchableOpacity 
                key={division.id} 
                style={styles.divisionModalItem}
                onPress={() => toggleDivisionSelection(division, true)}
              >
                <View style={[styles.checkbox, allDivisionsSelected.find(d => d.id === division.id) && styles.checkboxSelected]}>
                  {allDivisionsSelected.find(d => d.id === division.id) && (
                    <Icon name="check" size={16} color="#fff" />
                  )}
                </View>
                <AppText style={styles.divisionModalName}>{division.name}</AppText>
                <AppText style={styles.divisionModalCode}>{division.code}</AppText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Sub-tabs */}
      <View style={styles.subTabsContainer}>
        {/* Divisions Tab - Always visible */}
        <TouchableOpacity
          style={[styles.subTab, activeSubTab === 'divisions' && styles.activeSubTab]}
          onPress={() => setActiveSubTab('divisions')}
        >
          <Icon name="view-grid" size={20} color={activeSubTab === 'divisions' ? '#FF6B00' : '#999'} />
          <AppText style={[styles.subTabText, activeSubTab === 'divisions' && styles.activeSubTabText]}>
            Divisions
          </AppText>
        </TouchableOpacity>

        {/* Distributors Tab - Disabled if no opened divisions */}
        <TouchableOpacity
          style={[styles.subTab, activeSubTab === 'distributors' && styles.activeSubTab, openedDivisionsData.length === 0 && styles.disabledTab]}
          onPress={() => openedDivisionsData.length > 0 && setActiveSubTab('distributors')}
          disabled={openedDivisionsData.length === 0}
        >
          <Icon name="store" size={20} color={openedDivisionsData.length > 0 ? (activeSubTab === 'distributors' ? '#FF6B00' : '#999') : '#CCC'} />
          <AppText style={[styles.subTabText, activeSubTab === 'distributors' && styles.activeSubTabText, openedDivisionsData.length === 0 && styles.disabledTabText]}>
            Distributors
          </AppText>
        </TouchableOpacity>

        {/* Field Tab - Disabled if no opened divisions */}
        <TouchableOpacity
          style={[styles.subTab, activeSubTab === 'field' && styles.activeSubTab, openedDivisionsData.length === 0 && styles.disabledTab]}
          onPress={() => openedDivisionsData.length > 0 && setActiveSubTab('field')}
          disabled={openedDivisionsData.length === 0}
        >
          <IconFeather name="users" size={20} color={openedDivisionsData.length > 0 ? (activeSubTab === 'field' ? '#FF6B00' : '#999') : '#CCC'} />
          <AppText style={[styles.subTabText, activeSubTab === 'field' && styles.activeSubTabText, openedDivisionsData.length === 0 && styles.disabledTabText]}>
            Field
          </AppText>
        </TouchableOpacity>

        {/* Customer Hierarchy Tab - Always visible */}
        <TouchableOpacity
          style={[styles.subTab, activeSubTab === 'hierarchy' && styles.activeSubTab]}
          onPress={() => setActiveSubTab('hierarchy')}
        >
          <Icon name="sitemap" size={20} color={activeSubTab === 'hierarchy' ? '#FF6B00' : '#999'} />
          <AppText style={[styles.subTabText, activeSubTab === 'hierarchy' && styles.activeSubTabText]}>
            Customer Hierarchy
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Content based on active sub-tab */}
      {activeSubTab === 'distributors' && renderDistributorsTab()}
      {activeSubTab === 'divisions' && renderDivisionsTab()}
      {activeSubTab === 'field' && renderFieldTab()}
      {activeSubTab === 'hierarchy' && renderCustomerHierarchyTab()}

      {/* Modals */}
      <DivisionSelectionModal />
      
      <ApproveConfirmModal
        visible={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setSelectedItem(null);
        }}
        onConfirm={handleApproveConfirm}
        customerName={selectedItem?.name || 'customer'}
      />

      <LinkDivisionsModal
        visible={showLinkDivisionsModal}
        onClose={() => setShowLinkDivisionsModal(false)}
        onConfirm={handleLinkDivisionsConfirm}
      />

      <RejectCustomerModal
        visible={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedItem(null);
        }}
        onConfirm={handleRejectConfirm}
        message="Are you sure you want to reject?"
      />

      <TagHospitalModal
        visible={showTagModal}
        onClose={() => setShowTagModal(false)}
        onConfirm={handleTagConfirm}
        hospitalName="this hospital"
        teamName="Instra Team"
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  subTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  subTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  activeSubTab: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FF6B00',
  },
  subTabText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#999',
  },
  activeSubTabText: {
    color: '#FF6B00',
    fontWeight: '600',
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
  },
  distributorTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  distributorTab: {
    marginRight: 24,
    paddingBottom: 8,
  },
  activeDistributorTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B00',
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
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  distributorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  distributorRowName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  distributorRowCode: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  supplyTypeDropdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  supplyTypeText: {
    fontSize: 13,
    color: '#333',
  },
  addButton: {
    paddingHorizontal: 12,
  },
  addButtonText: {
    fontSize: 14,
    color: '#FF6B00',
    fontWeight: '500',
  },
  divisionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  divisionColumn: {
    flex: 1,
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
    paddingVertical: 16,
    backgroundColor: '#F5F5F5',
  },
  fieldHeaderText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  fieldRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  employeeCode: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  employeeDesignation: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  hierarchyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  hierarchyHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
  },
  hierarchyHeaderText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  hierarchyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  hierarchyInfo: {
    flex: 1,
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
  hierarchyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
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
  rejectButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
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
  stickyButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
});

export default LinkagedTab;