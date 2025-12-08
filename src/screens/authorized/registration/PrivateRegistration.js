/* eslint-disable no-dupe-keys */
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Dimensions,
  Modal,
  FlatList,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import { colors } from '../../../styles/colors';
import CustomInput from '../../../components/CustomInput';
import AddressInputWithLocation from '../../../components/AddressInputWithLocation';
import FileUploadComponent from '../../../components/FileUploadComponent';
import ChevronLeft from '../../../components/icons/ChevronLeft';
import ChevronRight from '../../../components/icons/ChevronRight';
import Calendar from '../../../components/icons/Calendar';
import ArrowDown from '../../../components/icons/ArrowDown';
import Search from '../../../components/icons/Search';
import CloseCircle from '../../../components/icons/CloseCircle';
import { customerAPI } from '../../../api/customer';
import AddNewPharmacyModal from './AddNewPharmacyModal';
import AddNewHospitalModal from './AddNewHospitalModal';
import { AppText, AppInput } from '../../../components';
import DoctorDeleteIcon from '../../../components/icons/DoctorDeleteIcon';
import FetchGst from '../../../components/icons/FetchGst';
import { usePincodeLookup } from '../../../hooks/usePincodeLookup';
import FloatingDateInput from '../../../components/FloatingDateInput';
import { validateField, isValidPAN, isValidGST, isValidEmail, isValidMobile, isValidPincode, createFilteredInputHandler } from '../../../utils/formValidation';

const { width, height } = Dimensions.get('window');

// Mock data for areas only (as there's no API for areas)
const MOCK_AREAS = [
  'Vadgaonsheri',
  'Kharadi',
  'Viman Nagar',
  'Kalyani Nagar',
  'Koregaon Park',
];

const DOC_TYPES = {
  CLINIC_IMAGE: 1,
  LICENSE_CERTIFICATE: 8,
  PAN: 7,
  GST: 2,
};

const PrivateRegistrationForm = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const scrollViewRef = useRef(null);
  const otpRefs = useRef({});

  // Get all params including edit mode data
  const {
    type,
    typeName,
    typeId,
    category,
    categoryName,
    categoryId,
    subCategory,
    subCategoryName,
    subCategoryId,
    customerId,
    mode,
    isEditMode,
    editData,
    customerData: routeCustomerData,
    isStaging,
  } = route.params || {};

  

  // Get logged-in user for assign functionality
  const loggedInUser = useSelector(state => state.auth.user);

  // Determine if we're in edit mode - check multiple flags for backward compatibility
  const inEditMode = mode === 'edit' || isEditMode || !!customerId;
  const isOnboardMode = mode === 'onboard';
  const [loadingCustomerData, setLoadingCustomerData] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState([]);

  const isMounted = useRef(true);

  // State for license types fetched from API
  const [licenseTypes, setLicenseTypes] = useState({
    REGISTRATION: { id: 7, docTypeId: 8, name: 'Registration', code: 'REG' },
  });

  // Form state
  const [formData, setFormData] = useState({
    // License Details
    licenseFileName: null,
    registrationNumber: '',
    registrationDate: '',
    licenseImageName: null,

    // General Details
    clinicName: '',
    shortName: '',
    address1: '',
    address2: '',
    address3: '',
    address4: '',
    pincode: '',
    area: '',
    areaId: null,
    city: '',
    cityId: null,
    state: '',
    stateId: null,

    // Security Details
    mobileNumber: '',
    emailAddress: '',
    panNumber: '',
    panImageName: '',
    gstNumber: '',
    gstFileName: '',

    licenseFile: null, // { fileName: '', s3Path: '', id: '' }
    licenseImage: null,
    panFile: null,
    gstFile: null,

    // Mapping
    markAsBuyingEntity: true,
    selectedCategory: {
      isManufacturer: false,
      isDistributor: false,
      groupCorporateHospital: false,
      pharmacy: false,
    },
    selectedHospitals: [],
    selectedPharmacies: [],

    // Customer Group
    customerGroupId: 9,
  });

  // State for managing stockists
  const [stockists, setStockists] = useState([
    { name: '', code: '', city: '' },
  ]);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Store original type data when editing
  const [originalTypeData, setOriginalTypeData] = useState({
    typeId: null,
    typeName: '',
    categoryId: null,
    categoryName: '',
    subCategoryId: null,
    subCategoryName: '',
  });

  // States and cities data
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [customerGroups, setCustomerGroups] = useState([]);
  const [uploadedAreas, setUploadedAreas] = useState([]); // For OCR-extracted areas

  // Pincode lookup hook
  const {
    areas,
    cities: pincodeCities,
    states: pincodeStates,
    loading: pincodeLoading,
    lookupByPincode,
    clearData,
  } = usePincodeLookup();

  // Handle pincode change and trigger lookup
  const handlePincodeChange = async text => {
    // Filter pincode input to only allow digits
    const filtered = createFilteredInputHandler('pincode', null, 6)(text);
    // If filtered text is different, it means invalid characters were typed, so don't proceed
    if (filtered !== text && text.length > filtered.length) return;

    setFormData(prev => ({ ...prev, pincode: filtered }));
    setErrors(prev => ({ ...prev, pincode: null }));

    // Clear previous selections when pincode changes
    if (filtered.length < 6) {
      setFormData(prev => ({
        ...prev,
        area: '',
        areaId: null,
        city: '',
        cityId: null,
        state: '',
        stateId: null,
      }));
      clearData();
      return;
    }

    // Trigger lookup when pincode is complete (6 digits)
    if (filtered.length === 6) {
      await lookupByPincode(filtered);
    }
  };

  // Auto-populate city, state, and area when pincode lookup completes
  useEffect(() => {
    if (pincodeCities.length > 0 && pincodeStates.length > 0) {
      // Auto-select first city and state from lookup results only if not already filled
      const firstCity = pincodeCities[0];
      const firstState = pincodeStates[0];

      setFormData(prev => {
        const updates = {};
        if (!prev.city || !prev.cityId) {
          updates.city = firstCity.name;
          updates.cityId = firstCity.id;
        }
        if (!prev.state || !prev.stateId) {
          updates.state = firstState.name;
          updates.stateId = firstState.id;
        }
        return Object.keys(updates).length > 0 ? { ...prev, ...updates } : prev;
      });
    }

    // Auto-select first area (0th index) if available and not already filled
    if (areas.length > 0 && !formData.area) {
      const firstArea = areas[0];
      setFormData(prev => ({
        ...prev,
        area: firstArea.name,
        areaId: firstArea.id,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pincodeCities, pincodeStates, areas]);

  // Dropdown Modals
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);

  // OTP states
  const [showOTP, setShowOTP] = useState({
    mobile: false,
    email: false,
    pan: false,
    gst: false,
  });
  const [otpValues, setOtpValues] = useState({
    mobile: ['', '', '', ''],
    email: ['', '', '', ''],
    pan: ['', '', '', ''],
    gst: ['', '', '', ''],
  });
  const [otpTimers, setOtpTimers] = useState({
    mobile: 30,
    email: 30,
    pan: 30,
    gst: 30,
  });
  const [loadingOtp, setLoadingOtp] = useState({
    mobile: false,
    email: false,
    pan: false,
    gst: false,
  });

  // Verification states
  const [verificationStatus, setVerificationStatus] = useState({
    mobile: false,
    email: false,
  });

  // Modal states for separate components
  const [showHospitalModal, setShowHospitalModal] = useState(false);
  const [showPharmacyModal, setShowPharmacyModal] = useState(false);

  // Document IDs for API
  const [documentIds, setDocumentIds] = useState([]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const otpSlideAnim = useRef(new Animated.Value(-50)).current;

  // Set navigation header - hide default header in edit/onboard mode, show custom header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false, // Always hide default header, we use custom header
      headerBackTitleVisible: false,
    });
  }, [navigation]);

  useEffect(() => {
    console.log('🚀 PrivateRegistration Form Mounted');
    console.log('📦 Route Params:', {
      mode,
      isEditMode,
      customerId,
      hasEditData: !!editData,
      hasCustomerData: !!routeCustomerData,
      inEditMode,
    });

    // Entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Load initial data (license types, customer groups)
    // Note: States and cities are now loaded via pincode lookup only
    loadInitialData();

    // Handle edit mode - fetch customer details
    if (inEditMode) {
      if (routeCustomerData) {
        // Use provided customer data
        populateFormFromCustomerData(routeCustomerData);
      } else if (editData) {
        // Use pre-fetched edit data (backward compatibility)
        populateFormFromEditData(editData);
      } else if (customerId) {
        // Fetch customer details from API
        fetchCustomerDetailsForEdit();
      }
    }

    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddStockist = () => {
    if (stockists.length >= 4) {
      Toast.show({
        type: 'error',
        text1: 'Limit Reached',
        text2: 'You can only add up to 4 stockists.',
      });
      return;
    }
    setStockists(prev => [
      ...prev,
      { name: '', distributorCode: '', city: '' },
    ]);
  };
  // Legacy function removed - cities now loaded via pincode lookup only

  // Populate form from customer data (API response) - matches PharmacyRetailer.js pattern
  const populateFormFromCustomerData = (data) => {
    try {
      const generalDetails = data.generalDetails || {};
      const securityDetails = data.securityDetails || {};
      const licenceDetails = data.licenceDetails || {};
      const docType = data.docType || [];
      const mapping = data.mapping || {};
      const groupDetails = data.groupDetails || {};

      // Format date from API ISO format to ISO format (FloatingDateInput expects ISO)
      // Also handles invalid dates properly to prevent NaN/NAN/NAN
      const formatDate = (isoDate) => {
        if (!isoDate) return null;
        try {
          const date = new Date(isoDate);
          // Check if date is valid
          if (isNaN(date.getTime())) {
            console.warn('Invalid date received:', isoDate);
            return null;
          }
          // Return ISO format as FloatingDateInput expects ISO
          return date.toISOString();
        } catch (error) {
          console.error('Error formatting date:', error, isoDate);
          return null;
        }
      };

      // Helper function to find documents by type (handles both string and number doctypeId)
      const findDocByType = (docTypeId, docTypeName) => {
        return docType.find(d => 
          String(d.doctypeId) === String(docTypeId) || 
          d.doctypeName === docTypeName ||
          d.doctypeName?.toUpperCase() === docTypeName?.toUpperCase()
        );
      };

      // Find license documents (Registration for Private Hospital) - also match by docTypeId
      const registrationLicense = licenceDetails.licence?.find(l => 
        l.licenceTypeCode === 'REG' || 
        l.licenceTypeName === 'Registration' ||
        String(l.docTypeId) === '8'
      );

      // Find document files - use helper function for robust matching
      const registrationDoc = findDocByType('8', 'REGISTRATION') || 
        (registrationLicense?.docTypeId ? findDocByType(String(registrationLicense.docTypeId), 'REGISTRATION') : null);
      const clinicImageDoc = findDocByType('1', 'CLINIC IMAGE');
      const panDoc = findDocByType('7', 'PAN CARD');
      const gstDoc = findDocByType('2', 'GSTIN');

      // Populate form data
      setFormData(prev => ({
        ...prev,
        // License Details
        registrationNumber: registrationLicense?.licenceNo || '',
        registrationDate: formatDate(registrationLicense?.licenceValidUpto),
        licenseFile: registrationDoc ? {
          id: registrationDoc.docId || '',
          docId: registrationDoc.docId || '',
          fileName: registrationDoc.fileName || 'REGISTRATION',
          s3Path: registrationDoc.s3Path || '',
          uri: registrationDoc.s3Path || '',
          docTypeId: parseInt(registrationDoc.doctypeId) || 8,
        } : null,
        licenseImage: clinicImageDoc ? {
          id: clinicImageDoc.docId || '',
          docId: clinicImageDoc.docId || '',
          fileName: clinicImageDoc.fileName || 'CLINIC IMAGE',
          s3Path: clinicImageDoc.s3Path || '',
          uri: clinicImageDoc.s3Path || '',
          docTypeId: parseInt(clinicImageDoc.doctypeId) || 1,
        } : null,
        
        // General Details
        clinicName: generalDetails.customerName || '',
        shortName: generalDetails.shortName || '',
        address1: generalDetails.address1 || '',
        address2: generalDetails.address2 || '',
        address3: generalDetails.address3 || '',
        address4: generalDetails.address4 || '',
        pincode: String(generalDetails.pincode || ''),
        area: generalDetails.area || '',
        areaId: generalDetails.areaId ? String(generalDetails.areaId) : null,
        city: generalDetails.cityName || '',
        cityId: generalDetails.cityId ? String(generalDetails.cityId) : null,
        state: generalDetails.stateName || '',
        stateId: generalDetails.stateId ? String(generalDetails.stateId) : null,
        ownerName: generalDetails.ownerName || '',
        specialist: generalDetails.specialist || '',

        // Security Details
        mobileNumber: securityDetails.mobile || '',
        emailAddress: securityDetails.email || '',
        panNumber: securityDetails.panNumber || '',
        panFile: panDoc ? {
          id: panDoc.docId || '',
          docId: panDoc.docId || '',
          fileName: panDoc.fileName || 'PAN CARD',
          s3Path: panDoc.s3Path || '',
          uri: panDoc.s3Path || '',
          docTypeId: parseInt(panDoc.doctypeId) || 7,
        } : null,
        gstNumber: securityDetails.gstNumber || '',
        gstFile: gstDoc ? {
          id: gstDoc.docId || '',
          docId: gstDoc.docId || '',
          fileName: gstDoc.fileName || 'GSTIN',
          s3Path: gstDoc.s3Path || '',
          uri: gstDoc.s3Path || '',
          docTypeId: parseInt(gstDoc.doctypeId) || 2,
        } : null,

        // Customer group
        customerGroup: groupDetails.customerGroupName || '9-DOCTOR SUPPLY',
        markAsBuyingEntity: data.isBuyer || false,

        // Mapping
        selectedHospitals: mapping.groupHospitals || [],
        selectedPharmacies: mapping.pharmacy || [],
      }));

      // Set document IDs for existing documents
      if (registrationDoc) {
        setDocumentIds(prev => [...prev, { field: 'licenseFile', docId: registrationDoc.docId }]);
      }
      if (clinicImageDoc) {
        setDocumentIds(prev => [...prev, { field: 'licenseImage', docId: clinicImageDoc.docId }]);
      }
      if (panDoc) {
        setDocumentIds(prev => [...prev, { field: 'panFile', docId: panDoc.docId }]);
      }
      if (gstDoc) {
        setDocumentIds(prev => [...prev, { field: 'gstFile', docId: gstDoc.docId }]);
      }

      // Set verification status
      setVerificationStatus({
        mobile: data.isMobileVerified || false,
        email: data.isEmailVerified || false,
        pan: !!panDoc,
        gst: !!gstDoc,
      });

      // Set uploaded documents - include both id and docId for edit mode
      const uploadedDocsList = docType.map(doc => ({
        id: doc.docId, // Use docId as id for existing documents
        docId: doc.docId,
        docTypeId: parseInt(doc.doctypeId),
        fileName: doc.fileName,
        s3Path: doc.s3Path,
      }));
      setUploadedDocs(uploadedDocsList);

      // Trigger pincode lookup to populate area, city, state dropdowns
      if (generalDetails.pincode) {
        lookupByPincode(String(generalDetails.pincode));
      }

      Toast.show({
        type: 'success',
        text1: 'Edit Mode',
        text2: 'Customer data loaded successfully',
        position: 'top',
      });
    } catch (error) {
      console.error('Error populating form from customer data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to populate form data',
        position: 'top',
      });
    }
  };

  // EFFICIENT: Populate form using pre-fetched and transformed data (legacy - kept for backward compatibility)
  const populateFormFromEditData = data => {
    try {
      console.log(
        '🔍 Populating form with edit data:',
        JSON.stringify(data, null, 2),
      );

      // Store original type data
      if (routeCustomerData) {
        console.log('📋 Setting original type data from customerData');
        setOriginalTypeData({
          typeId: routeCustomerData.typeId,
          typeName: routeCustomerData.customerType,
          categoryId: routeCustomerData.categoryId,
          categoryName: routeCustomerData.customerCategory,
          subCategoryId: routeCustomerData.subCategoryId,
          subCategoryName: routeCustomerData.customerSubcategory,
        });
      }

      // Populate form data - Map from transformed data structure
      const updatedFormData = {
        // Registration details - from licences array
        registrationNumber: data.licences?.[0]?.licenceNo || '',
        registrationDate: data.licences?.[0]?.licenceValidUpto
          ? new Date(data.licences?.[0]?.licenceValidUpto).toLocaleDateString(
            'en-IN',
          )
          : '',

        // General details - from transformed flat structure
        clinicName: data.clinicName || data.name || '', // clinicName or fallback to name (customerName)
        shortName: data.shortName || '',
        address1: data.address1 || '',
        address2: data.address2 || '',
        address3: data.address3 || '',
        address4: data.address4 || '',
        pincode: data.pincode || '',
        area: data.area || '',
        city: data.cityName || '',
        cityId: data.cityId || null,
        state: data.stateName || '',
        stateId: data.stateId || null,
        ownerName: data.ownerName || '',
        specialist: data.specialist || '',

        // Security details
        mobileNumber: data.mobile || '',
        emailAddress: data.email || '',
        panNumber: data.panNumber || '',
        gstNumber: data.gstNumber || '',

        // Customer group
        customerGroup: data.customerGroupName || '9-DOCTOR SUPPLY',

        // Mark as buying entity
        markAsBuyingEntity: data.isBuyer || false,

        // Mapping
        selectedHospitals: data.hospitals || [],
        selectedPharmacies: data.pharmacies || [],
      };

      console.log(
        '✅ Form data being set:',
        JSON.stringify(updatedFormData, null, 2),
      );
      setFormData(prev => ({
        ...prev,
        ...updatedFormData,
      }));

      // Set verification status
      console.log('🔐 Setting verification status:', {
        mobile: data.isMobileVerified,
        email: data.isEmailVerified,
      });
      setVerificationStatus({
        mobile: data.isMobileVerified || false,
        email: data.isEmailVerified || false,
      });

      // Note: Cities and states are now loaded via pincode lookup only
      // If pincode is available, trigger lookup to populate area, city, state
      if (data.pincode) {
        lookupByPincode(data.pincode.toString());
      }

      Toast.show({
        type: 'success',
        text1: 'Edit Mode',
        text2: 'Customer data loaded successfully',
        position: 'top',
        position: 'bottom',
        visibilityTime: 2000,
      });

      console.log('✨ Form population completed successfully');
    } catch (error) {
      console.error('❌ Error populating form from edit data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load customer data: ' + error.message,
        position: 'top',
        position: 'bottom',
      });
    }
  };

  // Fetch customer details for edit mode and onboard mode (same API)
  const fetchCustomerDetailsForEdit = async () => {
    if (!customerId) return;
    
    setLoadingCustomerData(true);
    try {
      // For onboard mode, always use isStaging = false. For edit mode, use the passed value
      const useStaging = isOnboardMode ? false : (isStaging !== undefined ? isStaging : false);
      const response = await customerAPI.getCustomerDetails(customerId, useStaging);
      if (response.success && response.data) {
        populateFormFromCustomerData(response.data);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load customer details',
          position: 'top',
        });
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load customer details. Please try again.',
        position: 'top',
      });
    } finally {
      setLoadingCustomerData(false);
    }
  };

  // Function to fetch and populate customer details for editing (legacy - kept for backward compatibility)
  const fetchCustomerDetails = async () => {
    setLoadingCustomerData(true);
    try {
      const response = await customerAPI.getCustomerDetails(
        customerId,
        isStaging,
      );

      if (response.success && response.data) {
        const customer = response.data;

        // Store original type data
        setOriginalTypeData({
          typeId: customer.typeId,
          typeName: customer.customerType,
          categoryId: customer.categoryId,
          categoryName: customer.customerCategory,
          subCategoryId: customer.subCategoryId,
          subCategoryName: customer.customerSubcategory,
        });

        // Format registration date
        let formattedRegistrationDate = '';
        if (customer.licenceDetails?.registrationDate) {
          const date = new Date(customer.licenceDetails.registrationDate);
          formattedRegistrationDate = date.toLocaleDateString('en-IN');
        }

        // Process documents
        const docs = {};
        if (customer.docType && Array.isArray(customer.docType)) {
          customer.docType.forEach(doc => {
            const docData = {
              fileName: doc.fileName,
              s3Path: doc.s3Path,
              id: doc.docId,
            };

            switch (parseInt(doc.doctypeId)) {
              case 1: // CLINIC IMAGE
                docs.licenseImage = docData;
                break;
              case 8: // REGISTRATION
                docs.licenseFile = docData;
                break;
              case 7: // PAN CARD
                docs.panFile = docData;
                break;
              case 2: // GSTIN
                docs.gstFile = docData;
                break;
            }
          });
        }

        // Get license details
        let registrationNumber = '';
        if (
          customer.licenceDetails?.licence &&
          customer.licenceDetails.licence.length > 0
        ) {
          registrationNumber =
            customer.licenceDetails.licence[0].licenceNo || '';
        }

        // Map customer group
        let customerGroup = 'X';
        if (customerGroups && customerGroups.length > 0) {
          const group = customerGroups.find(
            g => g.customerGroupId === customer.groupDetails?.customerGroupId,
          );
          customerGroup = group ? group.customerGroupName : 'X';
        } else {
          // Fallback to static mapping
          const customerGroupMapping = {
            1: 'X',
            2: 'Y',
            3: 'Doctor Supply',
            4: '10+50',
            5: '12+60',
          };
          customerGroup =
            customerGroupMapping[customer.groupDetails?.customerGroupId] || 'X';
        }

        // Get suggested distributors
        let stockistSuggestion = '';
        let distributorCode = '';
        let stockistCity = '';

        if (
          customer.suggestedDistributors &&
          customer.suggestedDistributors.length > 0
        ) {
          const distributor = customer.suggestedDistributors[0];
          stockistSuggestion = distributor.distributorName || '';
          distributorCode = distributor.distributorCode || '';
          stockistCity = distributor.city || '';
        }

        // Process mapping data
        const hasGroupHospitals =
          customer.mapping?.groupHospitals &&
          customer.mapping.groupHospitals.length > 0;
        const hasPharmacies =
          customer.mapping?.pharmacy && customer.mapping.pharmacy.length > 0;

        // Update form data with fetched customer details
        setFormData(prev => ({
          ...prev,
          // License Details
          registrationNumber: registrationNumber,
          registrationDate: formattedRegistrationDate,
          licenseFile: docs.licenseFile || null,
          licenseImage: docs.licenseImage || null,

          // General Details
          clinicName: customer.generalDetails?.customerName || '',
          shortName: customer.generalDetails?.shortName || '',
          address1: customer.generalDetails?.address1 || '',
          address2: customer.generalDetails?.address2 || '',
          address3: customer.generalDetails?.address3 || '',
          address4: customer.generalDetails?.address4 || '',
          pincode: customer.generalDetails?.pincode?.toString() || '',
          area: customer.generalDetails?.area || '',
          city: customer.generalDetails?.cityName || '',
          cityId: customer.generalDetails?.cityId || null,
          state: customer.generalDetails?.stateName || '',
          stateId: customer.generalDetails?.stateId || null,

          // Security Details
          mobileNumber: customer.securityDetails?.mobile || '',
          emailAddress: customer.securityDetails?.email || '',
          panNumber: customer.securityDetails?.panNumber || '',
          gstNumber: customer.securityDetails?.gstNumber || '',
          panFile: docs.panFile || null,
          gstFile: docs.gstFile || null,

          // Mapping
          markAsBuyingEntity: customer.isBuyer || false,
          selectedCategory: {
            isManufacturer: false,
            isDistributor: false,
            groupCorporateHospital: hasGroupHospitals,
            pharmacy: hasPharmacies,
          },
          selectedHospitals: customer.mapping?.groupHospitals || [],
          selectedPharmacies: customer.mapping?.pharmacy || [],

          // Customer Group and Stockist
          customerGroup: customerGroup,
          stockistSuggestion: stockistSuggestion,
          distributorCode: distributorCode,
          stockistCity: stockistCity,
        }));

        // Set verification status based on fetched data
        setVerificationStatus({
          mobile: customer.isMobileVerified || false,
          email: customer.isEmailVerified || false,
        });

        // Note: Cities and states are now loaded via pincode lookup only
        // If pincode is available, trigger lookup to populate area, city, state
        if (customer.generalDetails?.pincode) {
          lookupByPincode(customer.generalDetails.pincode.toString());
        }

        Toast.show({
          type: 'success',
          text1: 'Customer data loaded',
          text2: 'You can now edit the customer details',
          position: 'top',
        });
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load customer data',
        text2: 'Please try again or contact support',
        position: 'top',
      });
    } finally {
      setLoadingCustomerData(false);
    }
  };

  // Load states, license types and customer groups on mount
  const loadInitialData = async () => {
    try {
      // Load license types first
      const licenseResponse = await customerAPI.getLicenseTypes(
        typeId || 2,
        categoryId || 4,
        subCategoryId || 1,
      );
      if (licenseResponse.success && licenseResponse.data) {
        const licenseData = {};
        licenseResponse.data.forEach(license => {
          // For Private Hospital, we typically have Registration license type
          // Adjust mapping based on actual API response
          if (
            license.id === 7 ||
            license.code === 'REG' ||
            license.code === 'REGISTRATION'
          ) {
            licenseData.REGISTRATION = {
              id: license.id,
              docTypeId: license.docTypeId,
              name: license.name,
              code: license.code,
            };
          }
        });

        if (Object.keys(licenseData).length > 0) {
          setLicenseTypes(licenseData);
        }
      }
    } catch (error) {
      console.error('Error loading license types:', error);
    }


    try {
      // Load customer groups
      const groupsResponse = await customerAPI.getCustomerGroups();
      if (groupsResponse.success && groupsResponse.data) {
        setCustomerGroups(groupsResponse.data || []);
      }
    } catch (error) {
      console.error('Error loading customer groups:', error);
    }
  };

  // OTP Timer Effect
  useEffect(() => {
    const timers = {};

    Object.keys(otpTimers).forEach(key => {
      if (showOTP[key] && otpTimers[key] > 0) {
        timers[key] = setTimeout(() => {
          setOtpTimers(prev => ({
            ...prev,
            [key]: prev[key] - 1,
          }));
        }, 1000);
      }
    });

    return () => {
      Object.values(timers).forEach(timer => clearTimeout(timer));
    };
  }, [otpTimers, showOTP]);

  const handleVerify = async field => {
    try {
      // In edit mode, if already verified, skip verification
      if (isEditMode && verificationStatus[field]) {
        Toast.show({
          type: 'info',
          text1: 'Already Verified',
          text2: `This ${field} is already verified`,
          position: 'top',
        });
        return;
      }

      // Prepare data based on field type
      let requestData = {}; // No customerId needed for new registrations

      if (field === 'mobile') {
        if (!formData.mobileNumber ||
        !/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
          Toast.show({
            type: 'error',
            text1: 'Invalid Mobile Number',
            text2: 'Please enter a valid 10-digit mobile number',
            position: 'top',
          });
          return;
        }
       
        requestData.mobile = formData.mobileNumber;
      } else if (field === 'email') {
        if (!formData.emailAddress ||
      !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.emailAddress)) {
          Toast.show({
            type: 'error',
            text1: 'Invalid Email',
            text2: 'Please enter a valid email address',
            position: 'top',
          });
          return;
        }
        requestData.email = formData.emailAddress;
      }

      // Call generate OTP API
      const response = await customerAPI.generateOTP(requestData);

      if (response.success && response.data) {
        // Show OTP input
        setShowOTP(prev => ({ ...prev, [field]: true }));
        setOtpTimers(prev => ({ ...prev, [field]: 30 }));

        // If OTP is returned in response (for testing), auto-fill it
        if (response.data.otp) {
          const otpString = response.data.otp.toString();
          const otpArray = otpString.split('').map(digit => digit);
          while (otpArray.length < 4) {
            otpArray.push('');
          }
          setOtpValues(prev => ({ ...prev, [field]: otpArray }));

          // Auto-verify after a short delay
          setTimeout(() => {
            handleOtpVerification(field, otpString);
          }, 500);
        }

        Toast.show({
          type: 'success',
          text1: 'OTP Sent',
          text2: `OTP sent to your ${field === 'mobile' ? 'mobile number' : 'email address'
            }`,
          position: 'top',
        });

        // Animate OTP container
        Animated.spring(otpSlideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }).start();
        setErrors(prev => ({
          ...prev,
          [`${field}Verification`]: null,
        }));
      } else {
        // Handle failure case where customer already exists
        if (
          response.statusCode === 302 &&
          response.data &&
          response.data.length > 0
        ) {
          const existingCustomer = response.data[0];
          Toast.show({
            type: 'error',
            text1: 'Customer Already Exists',
            text2: `Customer with this ${field} already exists (ID: ${existingCustomer.id})`,
            position: 'top',
            visibilityTime: 4000,
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'OTP Generation Failed',
            text2: response.message || 'Failed to send OTP. Please try again.',
            position: 'top',
          });
        }
      }
    } catch (error) {
      console.error('Error generating OTP:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2:
          error.message ||
          'Failed to send OTP. Please check your connection and try again.',
        position: 'top',
      });
    }
  };

  const handleOtpChange = (field, index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtpValues = { ...otpValues };
      newOtpValues[field][index] = value;
      setOtpValues(newOtpValues);

      // Auto focus next input
      if (value && index < 3) {
        const nextInput = otpRefs.current[`otp-${field}-${index + 1}`];
        if (nextInput) nextInput.focus();
      }

      // Check if OTP is complete
      if (newOtpValues[field].every(v => v)) {
        const otp = newOtpValues[field].join('');
        handleOtpVerification(field, otp);
      }
    }
  };

  const handleOtpVerification = async (field, otpValue = null) => {
    try {
      const otp = otpValue || otpValues[field].join('');

      if (!otp || otp.length < 4) {
        Toast.show({
          type: 'error',
          text1: 'Invalid OTP',
          text2: 'Please enter complete OTP',
          position: 'top',
        });
        return;
      }

      // Prepare data based on field type
      let requestData = {}; // No customerId needed for new registrations

      if (field === 'mobile') {
        requestData.mobile = formData.mobileNumber;
      } else if (field === 'email') {
        requestData.email = formData.emailAddress;
      }

      // Call validate OTP API
      const response = await customerAPI.validateOTP(otp, requestData);

      if (response.success && response.data === true) {
        Toast.show({
          type: 'success',
          text1: 'Verification Successful',
          text2: `${field === 'mobile' ? 'Mobile number' : 'Email address'
            } verified successfully!`,
          position: 'top',
        });

        // Update verification status
        setVerificationStatus(prev => ({ ...prev, [field]: true }));

        // Hide OTP input
        setShowOTP(prev => ({ ...prev, [field]: false }));

        // Reset OTP values for this field
        setOtpValues(prev => ({
          ...prev,
          [field]: ['', '', '', ''],
        }));
      } else {
        Toast.show({
          type: 'error',
          text1: 'Verification Failed',
          text2: 'Invalid OTP. Please try again.',
          position: 'top',
        });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      Toast.show({
        type: 'error',
        text1: 'Verification Error',
        text2: 'Failed to verify OTP. Please try again.',
        position: 'top',
      });
    }
  };

  const handleResendOTP = async field => {
    setOtpTimers(prev => ({ ...prev, [field]: 30 }));
    await handleVerify(field);
  };

  const validateForm = () => {
    const newErrors = {};

    // License Details validation
    if (!formData.registrationNumber) {
      newErrors.registrationNumber = 'Registration number is required';
    }
    if (!formData.registrationDate) {
      newErrors.registrationDate = 'Registration date is required';
    } else {
      console.log('working');
      const [day, month, year] = formData.registrationDate.split('/');
      const selected = new Date(year, month - 1, day);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selected > today) {
        newErrors.registrationDate = 'Future date is not allowed';
      }
    }

    if (!formData.licenseFile) {
      newErrors.licenseFile = 'Registration Certificate is required';
    }

    // General Details validation using reusable validation utility
    const clinicNameError = validateField('clinicName', formData.clinicName, true, 'Clinic name is required');
    if (clinicNameError) newErrors.clinicName = clinicNameError;

    const address1Error = validateField('address1', formData.address1, true, 'Address 1 is required');
    if (address1Error) newErrors.address1 = address1Error;

    const address2Error = validateField('address2', formData.address2, true, 'Address 2 is required');
    if (address2Error) newErrors.address2 = address2Error;

    const address3Error = validateField('address3', formData.address3, true, 'Address 3 is required');
    if (address3Error) newErrors.address3 = address3Error;

    const pincodeError = validateField('pincode', formData.pincode, true, 'Valid 6-digit pincode is required');
    if (pincodeError) newErrors.pincode = pincodeError;

    const areaError = validateField('area', formData.area, true, 'Area is required');
    if (areaError) newErrors.area = areaError;

    if (!formData.cityId) {
      newErrors.cityId = 'City is required';
    }
    if (!formData.stateId) {
      newErrors.stateId = 'State is required';
    }

    // Security Details validation using reusable validation utility
    const mobileError = validateField('mobileNo', formData.mobileNumber, true, 'Valid 10-digit mobile number is required');
    if (mobileError) newErrors.mobileNumber = mobileError;

    const emailError = validateField('emailAddress', formData.emailAddress, true, 'Valid email address is required');
    if (emailError) newErrors.emailAddress = emailError;

    // PAN validation
    const panError = validateField('panNo', formData.panNumber, true, 'Valid PAN number is required (e.g., ABCDE1234F)');
    if (panError) newErrors.panNumber = panError;

    // GST is optional - only validate if provided
    if (formData.gstNumber && formData.gstNumber.trim() !== '') {
      const gstError = validateField('gstNo', formData.gstNumber, false, 'Invalid GST format (e.g., 27ASDSD1234F1Z5)');
      if (gstError) newErrors.gstNumber = gstError;
    }
    if (!formData.panFile) {
      newErrors.panFile = 'PAN document is required';
    }
    // Verification validation - only for new registration
    if (!isEditMode) {
      if (!verificationStatus.mobile) {
        newErrors.mobileVerification = 'Mobile number verification is required';
      }
      if (!verificationStatus.email) {
        newErrors.emailVerification = 'Email verification is required';
      }
    }

     if (!formData.markAsBuyingEntity && formData.selectedPharmacies.length === 0) {
      newErrors.pharmaciesMapping = "Pharmacy mapping is mandatory for non buying entities";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check form validity whenever form data or verification status changes
  useEffect(() => {
    // Validate required fields
    let isValid = true;
    if (!formData.registrationNumber) isValid = false;
    else if (!formData.registrationDate) isValid = false;
    else if (!formData.licenseFile) isValid = false;
    else if (!formData.clinicName) isValid = false;
    else if (!formData.address1) isValid = false;
    else if (!formData.address2) isValid = false;
    else if (!formData.address3) isValid = false;
    else if (!formData.pincode || !/^[1-9]\d{5}$/.test(formData.pincode)) isValid = false;
    else if (!formData.area || formData.area.trim().length === 0) isValid = false;
    else if (!formData.cityId) isValid = false;
    else if (!formData.stateId) isValid = false;
    else if (!formData.mobileNumber || formData.mobileNumber.length !== 10) isValid = false;
    else if (!formData.emailAddress || !formData.emailAddress.includes('@')) isValid = false;
    else if (!formData.panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) isValid = false;
    else if (!formData.panFile) isValid = false;
    else if (formData.gstNumber && formData.gstNumber.trim() != '' && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNumber)) isValid = false;
    else if (!inEditMode && !verificationStatus.mobile) isValid = false;
    else if (!inEditMode && !verificationStatus.email) isValid = false;
    
    setIsFormValid(isValid);
  }, [formData, verificationStatus, inEditMode]);

  const handleCancel = () => {
    if (inEditMode || isOnboardMode) {
      // In edit mode or onboard mode, navigate to CustomerStack which contains CustomerList
      navigation.navigate('CustomerStack', { screen: 'CustomerList' });
    } else {
      // In registration mode, show cancel confirmation modal
      setShowCancelModal(true);
    }
  };

  // Handle assign to customer (onboard functionality)
  const handleAssignToCustomer = async () => {
    try {
      setLoading(true);

      // Prepare the onboard payload with only editable fields
      const payload = {
        customerId: customerId,
        distributorId: loggedInUser?.distributorId || 1,
        updatedFields: {
          // Only send fields that were editable
          address1: formData.address1,
          address2: formData.address2,
          address3: formData.address3,
          address4: formData.address4,
          pincode: formData.pincode,
          area: formData.area,
          mobileNumber: formData.mobileNumber,
          emailAddress: formData.emailAddress,
        },
      };

      // Call onboard API
      const response = await customerAPI.onboardCustomer(payload, isStaging);

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Customer assigned successfully!',
          position: 'top',
        });

        setTimeout(() => {
          navigation.navigate('CustomerStack', { screen: 'CustomerList' });
        }, 1500);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.message || 'Failed to assign customer',
          position: 'top',
        });
      }
    } catch (error) {
      console.error('Error assigning customer:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'An error occurred while assigning customer',
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format dates for API submission
  // Handles both ISO format and DD/MM/YYYY format dates
  const formatDateForAPI = date => {
    if (!date) return null;
    try {
      let d;
      // If date is in DD/MM/YYYY format (from FloatingDateInput display)
      if (typeof date === 'string' && date.includes('/') && !date.includes('T')) {
        const [day, month, year] = date.split('/');
        d = new Date(Number(year), Number(month) - 1, Number(day));
      } else {
        // ISO format or Date object
        d = new Date(date);
      }
      
      // Check if date is valid
      if (isNaN(d.getTime())) {
        console.warn('Invalid date for API:', date);
        return null;
      }
      
      // Add time component to avoid timezone issues
      d.setHours(23, 59, 59, 999);
      return d.toISOString();
    } catch (error) {
      console.error('Error formatting date for API:', error, date);
      return null;
    }
  };

  const getCustomerGroupId = groupName => {
    // If we have customer groups from API, use them
    if (customerGroups && customerGroups.length > 0) {
      const group = customerGroups.find(g => g.customerGroupName === groupName);
      return group ? group.customerGroupId : 1;
    }

    // Fallback to static mapping if API data not available
    const groupMap = {
      X: 1,
      Y: 2,
      'Doctor Supply': 3,
      '10+50': 4,
      '12+60': 5,
    };
    return groupMap[groupName] || 1;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill all required fields and complete verifications',
        position: 'top',
      });
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
      return;
    }

    setLoading(true);

    try {
      // Collect all document IDs
      const docIds = [];
      if (formData.licenseFile?.id) docIds.push(formData.licenseFile.id);
      if (formData.licenseImage?.id) docIds.push(formData.licenseImage.id);
      if (formData.panFile?.id) docIds.push(formData.panFile.id);
      if (formData.gstFile?.id) docIds.push(formData.gstFile.id);

      // Prepare registration date
      const registrationDate = formData.registrationDate
        ? new Date(
          formData.registrationDate.split('/').reverse().join('-'),
        ).toISOString()
        : new Date().toISOString();

      // Use original type data for edit mode, or route params for new registration
      const finalTypeId = isEditMode ? originalTypeData.typeId : typeId || 2;
      const finalCategoryId = isEditMode
        ? originalTypeData.categoryId
        : categoryId || 4;
      const finalSubCategoryId = isEditMode
        ? originalTypeData.subCategoryId
        : subCategoryId || 1;

      // Prepare customerDocs array with proper structure
      const prepareCustomerDocs = () => {
        const docs = [];
        // Collect all documents
        if (formData.licenseFile?.id || formData.licenseFile?.docId) {
          const doc = formData.licenseFile;
          docs.push({
            s3Path: doc.s3Path || doc.uri,
            docTypeId: String(doc.docTypeId || ''),
            fileName: doc.fileName || doc.name,
            ...(inEditMode && customerId ? {
              customerId: String(customerId),
              id: String(doc.docId || doc.id || ''),
            } : {
              id: String(doc.id || ''),
            }),
          });
        }
        if (formData.licenseImage?.id || formData.licenseImage?.docId) {
          const doc = formData.licenseImage;
          docs.push({
            s3Path: doc.s3Path || doc.uri,
            docTypeId: String(doc.docTypeId || ''),
            fileName: doc.fileName || doc.name,
            ...(inEditMode && customerId ? {
              customerId: String(customerId),
              id: String(doc.docId || doc.id || ''),
            } : {
              id: String(doc.id || ''),
            }),
          });
        }
        if (formData.panFile?.id || formData.panFile?.docId) {
          const doc = formData.panFile;
          docs.push({
            s3Path: doc.s3Path || doc.uri,
            docTypeId: String(doc.docTypeId || ''),
            fileName: doc.fileName || doc.name,
            ...(inEditMode && customerId ? {
              customerId: String(customerId),
              id: String(doc.docId || doc.id || ''),
            } : {
              id: String(doc.id || ''),
            }),
          });
        }
        if (formData.gstFile?.id || formData.gstFile?.docId) {
          const doc = formData.gstFile;
          docs.push({
            s3Path: doc.s3Path || doc.uri,
            docTypeId: String(doc.docTypeId || ''),
            fileName: doc.fileName || doc.name,
            ...(inEditMode && customerId ? {
              customerId: String(customerId),
              id: String(doc.docId || doc.id || ''),
            } : {
              id: String(doc.id || ''),
            }),
          });
        }
        return docs;
      };

      // Prepare the request payload
      const requestPayload = {
        typeId: finalTypeId,
        categoryId: finalCategoryId,
        subCategoryId: finalSubCategoryId,
        isMobileVerified: verificationStatus.mobile,
        isEmailVerified: verificationStatus.email,
        isExisting: false,
        licenceDetails: {
          registrationDate: registrationDate,
          licence: [
            {
              licenceTypeId: licenseTypes.REGISTRATION?.id || 7, // Use dynamic license type ID
              licenceNo: formData.registrationNumber,
              licenceValidUpto: formatDateForAPI(formData.registrationDate),
              hospitalCode: '',
            },
          ],
        },
        customerDocs: prepareCustomerDocs(),
        isBuyer: formData.markAsBuyingEntity,
        customerGroupId: getCustomerGroupId(formData.customerGroup),
        generalDetails: {
          name: formData.clinicName,
          shortName: formData.shortName || formData.clinicName.substring(0, 10),
          address1: formData.address1,
          address2: formData.address2 || '',
          address3: formData.address3 || '',
          address4: formData.address4 || '',
          pincode: parseInt(formData.pincode, 10),
          area: formData.area || '',
          areaId: formData.areaId ? parseInt(formData.areaId, 10) : null,
          cityId: parseInt(formData.cityId, 10),
          stateId: parseInt(formData.stateId, 10),
          ownerName: '',
          clinicName: '',
        },
        securityDetails: {
          mobile: formData.mobileNumber,
          email: formData.emailAddress,
          panNumber: formData.panNumber || '',
          ...(formData.gstNumber ? { gstNumber: formData.gstNumber } : {}),
        },
        ...(stockists &&
          stockists.length > 0 && {
          suggestedDistributors: stockists.map(stockist => ({
            distributorCode: stockist.code || '',
            distributorName: stockist.name || '',
            city: stockist.city || '',
            customerId: inEditMode && customerId ? parseInt(customerId, 10) : stockist.name,
          })),
        }),
        mapping:
          formData.selectedHospitals?.length > 0 ||
            formData.selectedPharmacies?.length > 0
            ? {
              ...(formData.selectedHospitals?.length > 0 && {
                hospitals: formData.selectedHospitals.map(h => ({
                  id: Number(h.id),
                  isNew: false,
                })),
              }),

              ...(formData.selectedPharmacies?.length > 0 && {
                pharmacy: formData.selectedPharmacies.map(p => ({
                  id: Number(p.id),
                  isNew: false,
                })),
              }),
            }
            : undefined,
        isChildCustomer: false,
      };

    

      // If editing, add the customerId to the payload
      if (isEditMode) {
        requestPayload.id = customerId;
      }

      console.log('Registration payload:', requestPayload);

      // Call create customer API for both create and edit (with customerId in payload)
      const response = await customerAPI.createCustomer(requestPayload);

      if (response.success && response.data) {
        Toast.show({
          type: 'success',
          text1: inEditMode ? 'Update Successful' : 'Registration Successful',
          text2: response.message || (inEditMode ? 'Customer details updated successfully' : 'Customer registered successfully'),
          position: 'top',
        });

        // Navigate to success screen for both create and edit
        navigation.navigate('RegistrationSuccess', {
          type: 'hospital',
          registrationCode: inEditMode ? customerId : (response?.data?.id || `HOSP ${response.data.id}`),
          codeType: 'Private Clinic',
          ...(inEditMode ? { isEditMode: true } : { customerId: response?.data?.id }),
        });
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);

      // Handle specific error messages
      if (error.message && error.message.includes('GST Number')) {
        Toast.show({
          type: 'error',
          text1: 'Invalid GST Number',
          text2: 'Please enter a valid GST number (e.g., 27ABCDE1234F1Z5)',
          position: 'top',
          visibilityTime: 5000,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: isEditMode ? 'Update Failed' : 'Registration Failed',
          text2: error.message || 'Failed to process. Please try again.',
          position: 'top',
          visibilityTime: 5000,
        });
      }
    } finally {
      setLoading(false);
    }
  };


  const renderOTPInput = field => {
    if (!showOTP[field]) return null;

    return (
      <Animated.View
        style={[
          styles.otpContainer,
          {
            transform: [{ translateY: otpSlideAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <AppText style={styles.otpTitle}>Enter 4-digit OTP</AppText>
        <View style={styles.otpInputContainer}>
          {[0, 1, 2, 3].map(index => (
            <AppInput
              key={index}
              ref={ref => (otpRefs.current[`otp-${field}-${index}`] = ref)}
              style={styles.otpInput}
              value={otpValues[field][index]}
              onChangeText={value => handleOtpChange(field, index, value)}
              keyboardType="numeric"
              maxLength={1}
            />
          ))}
        </View>
        <View style={styles.otpFooter}>
          <AppText style={styles.otpTimer}>
            {otpTimers[field] > 0 ? (
              `Resend OTP in ${otpTimers[field]}s`
            ) : (
              <TouchableOpacity onPress={() => handleResendOTP(field)}>
                <AppText style={styles.resendText}>Resend OTP</AppText>
              </TouchableOpacity>
            )}
          </AppText>
        </View>
      </Animated.View>
    );
  };

  // DropdownModal Component (replace existing DropdownModal)
  const DropdownModal = ({
    visible,
    onClose,
    title,
    data = [],
    selectedId,
    onSelect,
    loading = false,
  }) => {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText style={styles.modalTitle}>{title}</AppText>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator
                size="large"
                color={colors.primary}
                style={styles.modalLoader}
              />
            ) : (
              <FlatList
                data={data}
                keyExtractor={(item, idx) =>
                  item.id?.toString
                    ? item.id?.toString()
                    : String(item.value || idx)
                }
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      selectedId == item.id && styles.modalItemSelected,
                    ]}
                    onPress={() => {
                      onSelect(item);
                      onClose();
                    }}
                  >
                    <AppText
                      style={[
                        styles.modalItemText,
                        selectedId == item.id && styles.modalItemTextSelected,
                      ]}
                    >
                      {item.name ||
                        item.stateName ||
                        item.cityName ||
                        item.label ||
                        String(item.value)}
                    </AppText>

                    {selectedId == item.id && (
                      // Ionicons correct check name
                      <Icon name="checkmark" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
                style={styles.modalList}
                ListEmptyComponent={
                  <View style={{ paddingVertical: 28, alignItems: 'center' }}>
                    <AppText
                      style={{ fontSize: 15, color: '#777' }}
                    >{`No ${title} available`}</AppText>
                  </View>
                }
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  // Show loading indicator while fetching customer data
  if (loadingCustomerData) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText style={{ marginTop: 16, color: '#666' }}>Loading customer details...</AppText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      {/* Custom Header for Edit Mode and Onboard Mode */}
      {(inEditMode || isOnboardMode) && (
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate('CustomerStack', { screen: 'CustomerList' })}
            style={styles.backButton}
          >
            <ChevronLeft />
          </TouchableOpacity>
          <AppText style={styles.headerTitle}>
            {isOnboardMode ? 'Registration-Existing' : 'Edit'}
          </AppText>
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.flexContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            inEditMode && { paddingHorizontal: 16 }
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* License Details Section */}
            <View style={[styles.section, styles.sectionTopSpacing]}>
              <AppText style={styles.sectionTitle}>
                License Details<AppText style={styles.asteriskRed}>*</AppText>
              </AppText>

              {/* Registration Certificate Upload */}
              <FileUploadComponent
                placeholder="Upload registration certificate"
                accept={['pdf', 'jpg', 'jpeg', 'png']}
                maxSize={15 * 1024 * 1024} // 15MB
                docType={DOC_TYPES.LICENSE_CERTIFICATE}
                initialFile={formData.licenseFile}
                onFileUpload={file => {
                  setFormData(prev => ({ ...prev, licenseFile: file }));
                  setErrors(prev => ({ ...prev, licenseFile: null }));
                }}
                onFileDelete={() => {
                  const file = formData.licenseFile;
                  // Handle both new uploads (file.id) and existing files from edit mode (file.docId)
                  if (file && (file.id || file.docId)) {
                    const fileId = file.id || file.docId;
                    setUploadedDocs(prev => prev.filter(doc => doc.id !== fileId && doc.docId !== fileId));
                    setDocumentIds(prev => prev.filter(doc => doc.docId !== fileId));
                  }
                  setFormData(prev => ({ ...prev, licenseFile: null }));
                  setErrors(prev => ({ ...prev, licenseFile: null }));
                }}
                onOcrDataExtracted={async (ocrData) => {
                  console.log('OCR Data Received:', ocrData);
                  
                  // Helper function to split address
                  const splitAddress = (address) => {
                    if (!address) return { address1: '', address2: '', address3: '' };
                    const parts = address.split(',').map(part => part.trim()).filter(part => part.length > 0);
                    if (parts.length >= 3) {
                      return {
                        address1: parts[0],
                        address2: parts.slice(1, -1).join(', '),
                        address3: parts[parts.length - 1],
                      };
                    } else if (parts.length === 2) {
                      return { address1: parts[0], address2: parts[1], address3: '' };
                    } else if (parts.length === 1) {
                      const addr = parts[0];
                      if (addr.length > 100) {
                        return {
                          address1: addr.substring(0, 50).trim(),
                          address2: addr.substring(50, 100).trim(),
                          address3: addr.substring(100).trim(),
                        };
                      } else if (addr.length > 50) {
                        return {
                          address1: addr.substring(0, 50).trim(),
                          address2: addr.substring(50).trim(),
                          address3: '',
                        };
                      } else {
                        return { address1: addr, address2: '', address3: '' };
                      }
                    }
                    return { address1: '', address2: '', address3: '' };
                  };
                  
                  const updates = {};

                  if (ocrData.hospitalName && !formData.clinicName) {
                    updates.clinicName = ocrData.hospitalName;
                  }
                  
                  // Split and populate address fields
                  if (ocrData.address) {
                    const addressParts = splitAddress(ocrData.address);
                    if (!formData.address1 && addressParts.address1) {
                      updates.address1 = addressParts.address1;
                    }
                    if (!formData.address2 && addressParts.address2) {
                      updates.address2 = addressParts.address2;
                    }
                    if (!formData.address3 && addressParts.address3) {
                      updates.address3 = addressParts.address3;
                    }
                  }
                  
                  if (
                    ocrData.registrationNumber &&
                    !formData.registrationNumber
                  ) {
                    updates.registrationNumber = ocrData.registrationNumber;
                  } else if (ocrData.licenseNumber && !formData.registrationNumber) {
                    updates.registrationNumber = ocrData.licenseNumber;
                  }
                  if (ocrData.issueDate && !formData.registrationDate) {
                    const parts = ocrData.issueDate.split('-');
                    if (parts.length === 3) {
                      updates.registrationDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                    }
                  }
                  if (ocrData.expiryDate) {
                    const parts = ocrData.expiryDate.split('-');
                    if (parts.length === 3) {
                      const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                      // Store expiry date if needed
                    }
                  }
                  
                  // -----------------------------
                  //  🔥 DIRECTLY USE OCR LOCATION
                  // -----------------------------
                  const location = ocrData.locationDetails;

                  if (location) {
                    // Build CITIES (flat)
                    const extractedCities = Array.isArray(location.cities)
                      ? location.cities.map(c => ({
                          id: c.value,
                          name: c.label,
                        }))
                      : [];

                    // Build STATES (flat)
                    const extractedStates = Array.isArray(location.states)
                      ? location.states.map(s => ({
                          id: s.value,
                          name: s.label,
                          gstCode: s.gstCode,
                        }))
                      : [];

                    // Build AREAS (take from first city)
                    let extractedAreas = [];
                    if (
                      Array.isArray(location.cities) &&
                      location.cities.length > 0 &&
                      Array.isArray(location.cities[0].area)
                    ) {
                      extractedAreas = location.cities[0].area.map(a => ({
                        id: a.value,
                        name: a.label,
                        cityId: location.cities[0].value,
                      }));
                    }

                    // UPDATE STATE VALUES DIRECTLY (NO API CALL)
                    setCities(extractedCities);
                    setStates(extractedStates);
                    if (extractedAreas.length > 0) setUploadedAreas(extractedAreas);

                    // Set selected values if not already filled
                    if (extractedCities.length > 0) {
                      updates.city = extractedCities[0].name;
                      updates.cityId = extractedCities[0].id;
                    }

                    if (extractedStates.length > 0) {
                      updates.state = extractedStates[0].name;
                      updates.stateId = extractedStates[0].id;
                    }

                    if (extractedAreas.length > 0) {
                      updates.area = extractedAreas[0].name;
                      updates.areaId = extractedAreas[0].id;
                    }
                  }

                  // Pincode — use directly, no lookup
                  if (ocrData.Pincode || ocrData.pincode) {
                    updates.pincode = String(ocrData.Pincode || ocrData.pincode);
                  }

                  if (Object.keys(updates).length > 0) {
                    setFormData(prev => ({ ...prev, ...updates }));
                    const errorUpdates = {};
                    Object.keys(updates).forEach(key => {
                      errorUpdates[key] = null;
                    });
                    setErrors(prev => ({ ...prev, ...errorUpdates }));
                  }
                  
                  // Trigger pincode lookup if pincode is available and valid (6 digits) and locationDetails not available
                  if (!location && (ocrData.pincode || ocrData.Pincode) && /^\d{6}$/.test(String(ocrData.pincode || ocrData.Pincode))) {
                    await lookupByPincode(String(ocrData.pincode || ocrData.Pincode));
                  }
                }}
                errorMessage={errors.licenseFile}
              />

              <CustomInput
                placeholder="Hospital Registration Number"
                value={formData.registrationNumber}
                onChangeText={createFilteredInputHandler('registrationNumber', (text) => {
                  setFormData(prev => ({ ...prev, registrationNumber: text }));
                  setErrors(prev => ({ ...prev, registrationNumber: null }));
                }, 20)}
                error={errors.registrationNumber}
                autoCapitalize="characters"
                mandatory={true}
              />




              <FloatingDateInput
                label="Registration Date"
                mandatory={true}
                value={formData.registrationDate}
                error={errors.registrationDate}
                onChange={(date) => {
                  setFormData(prev => ({ ...prev, registrationDate: date }));
                  setErrors(prev => ({ ...prev, registrationDate: null }));
                }}
              />
              <AppText style={styles.sectionSubTitle}>
                Image<AppText style={styles.asteriskRed}>*</AppText>{' '}
                <Icon
                  name="information-circle-outline"
                  size={16}
                  color="#999"
                />
              </AppText>

              <FileUploadComponent
                placeholder="Upload"
                accept={['jpg', 'jpeg', 'png']}
                maxSize={15 * 1024 * 1024} // 15MB
                docType={DOC_TYPES.CLINIC_IMAGE}
                initialFile={formData.licenseImage}
                onFileUpload={file => {
                  setFormData(prev => ({ ...prev, licenseImage: file }));
                  setErrors(prev => ({ ...prev, licenseImage: null }));
                }}
                onFileDelete={() => {
                  setFormData(prev => ({ ...prev, licenseImage: null }));
                }}
                errorMessage={errors.licenseImage}
              />

           
            </View>

            {/* General Details Section */}
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>
                General Details<AppText style={styles.asteriskRed}>*</AppText>
              </AppText>

              <CustomInput
                placeholder="Enter hospital name"
                value={formData.clinicName}
                onChangeText={createFilteredInputHandler('clinicName', (text) => {
                  setFormData(prev => ({ ...prev, clinicName: text }));
                  setErrors(prev => ({ ...prev, clinicName: null }));
                }, 40)}
                error={errors.clinicName}
                mandatory={true}
              />

              <CustomInput
                placeholder="Enter short name"
                value={formData.shortName}
                onChangeText={createFilteredInputHandler('shortName', (text) =>
                  setFormData(prev => ({ ...prev, shortName: text })), 25
                )}
              />

              <AddressInputWithLocation
                placeholder="Address 1"
                value={formData.address1}
              onChangeText={createFilteredInputHandler('address1', (text) => {
                             setFormData(prev => ({ ...prev, address1: text }));
                              setErrors(prev => ({ ...prev, address1: null }));
                            }, 40)}
                mandatory={true}
                error={errors.address1}
                onLocationSelect={async locationData => {
                  const addressParts = locationData.address
                    .split(',')
                    .map(part => part.trim());
                  const extractedPincode = locationData.pincode || '';
                  const filteredParts = addressParts.filter(part => {
                    return (
                      !part.match(/^\d{6}$/) && part.toLowerCase() !== 'india'
                    );
                  });

                  // Update address fields only
                  setFormData(prev => ({
                    ...prev,
                    address1: filteredParts[0] || '',
                    address2: filteredParts[1] || '',
                    address3: filteredParts[2] || '',
                    address4: filteredParts.slice(3).join(', ') || '',
                  }));

                  // Update pincode and trigger lookup (this will populate area, city, state)
                  if (extractedPincode) {
                    setFormData(prev => ({
                      ...prev,
                      pincode: extractedPincode,
                    }));
                    setErrors(prev => ({ ...prev, pincode: null }));
                    // Trigger pincode lookup to populate area, city, state
                    await lookupByPincode(extractedPincode);
                  }

                  setErrors(prev => ({
                    ...prev,
                    address1: null,
                    address2: null,
                    address3: null,
                    address4: null,
                    pincode: null,
                  }));
                }}
              />

              <CustomInput
                placeholder="Address 2"
                value={formData.address2}
                onChangeText={createFilteredInputHandler('address2', (text) =>
                  setFormData(prev => ({ ...prev, address2: text })), 40
                )}
                error={errors.address2}
                mandatory={true}
              />

              <CustomInput
                placeholder="Address 3"
                value={formData.address3}
                onChangeText={createFilteredInputHandler('address3', (text) =>
                  setFormData(prev => ({ ...prev, address3: text })), 60
                )}
                error={errors.address3}
                mandatory={true}
              />

              <CustomInput
                placeholder="Address 4"
                value={formData.address4}
                onChangeText={createFilteredInputHandler('address4', (text) =>
                  setFormData(prev => ({ ...prev, address4: text })), 60
                )}
              />

              <CustomInput
                placeholder="Pincode"
                value={formData.pincode}
                onChangeText={handlePincodeChange}
                keyboardType="numeric"
                maxLength={6}
                mandatory={true}
                error={errors.pincode}
              />
              {pincodeLoading && (
                <View style={{ marginTop: -10, marginBottom: 10 }}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              )}

              {/* Area Dropdown */}
              <View style={styles.dropdownContainer}>
                {/* always show floating label so it floats above the dropdown */}
                {(formData.area || areas.length > 0) && (
                  <AppText
                    style={[
                      styles.floatingLabel,
                      { color: formData.area ? colors.primary : '#999' },
                    ]}
                  >
                    Area<AppText style={styles.asteriskPrimary}>*</AppText>
                  </AppText>
                )}

                <TouchableOpacity
                  style={[styles.dropdown, errors.area && styles.inputError]}
                  onPress={() => {
                    // open area modal even if empty (modal will show "No Select..." message)
                    setShowAreaModal(true);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.inputTextContainer}>
                    <AppText
                      style={
                        formData.area
                          ? styles.inputText
                          : styles.placeholderText
                      }
                    >
                      {formData.area || 'Area'}
                    </AppText>
                    <AppText style={styles.inlineAsterisk}>*</AppText>
                  </View>
                  <ArrowDown color="#999" />
                </TouchableOpacity>
                {errors.area && (
                  <AppText style={styles.errorTextDropdown}>{errors.area}</AppText>
                )}
              </View>

              {/* City - Auto-populated from pincode */}
              <View style={styles.dropdownContainer}>
                {(formData.city || cities.length > 0) && (
                  <AppText
                    style={[styles.floatingLabel, { color: colors.primary }]}
                  >
                    City<AppText style={styles.asteriskPrimary}>*</AppText>
                  </AppText>
                )}

                <TouchableOpacity
                  style={[styles.dropdown, errors.cityId && styles.inputError]}
                  onPress={() => setShowCityModal(true)}
                  activeOpacity={0.8}
                >
                  <View style={styles.inputTextContainer}>
                    <AppText
                      style={
                        formData.city
                          ? styles.inputText
                          : styles.placeholderText
                      }
                    >
                      {formData.city || 'City'}
                    </AppText>
                    <AppText style={styles.inlineAsterisk}>*</AppText>
                  </View>
                  <ArrowDown color="#999" />
                </TouchableOpacity>
                {errors.cityId && (
                  <AppText style={styles.errorTextDropdown}>{errors.cityId}</AppText>
                )}
              </View>

              {/* State - Auto-populated from pincode */}
              <View style={styles.dropdownContainer}>
                {formData.state && (
                  <AppText
                    style={[styles.floatingLabel, { color: colors.primary }]}
                  >
                    State<AppText style={styles.asteriskPrimary}>*</AppText>
                  </AppText>
                )}

                <TouchableOpacity
                  style={[styles.dropdown, errors.stateId && styles.inputError]}
                  onPress={() => setShowStateModal(true)}
                  activeOpacity={0.8}
                >
                  <View style={styles.inputTextContainer}>
                    <AppText
                      style={
                        formData.state
                          ? styles.inputText
                          : styles.placeholderText
                      }
                    >
                      {formData.state || 'State'}
                    </AppText>
                    <AppText style={styles.inlineAsterisk}>*</AppText>
                  </View>
                  <ArrowDown color="#999" />
                </TouchableOpacity>
                {errors.stateId && (
                  <AppText style={styles.errorTextDropdown}>{errors.stateId}</AppText>
                )}
              </View>
            </View>

            {/* Security Details Section */}
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>
                Security Details<AppText style={styles.asteriskRed}>*</AppText>
              </AppText>

              {/* Mobile Number with Verify */}
              <CustomInput
                placeholder="Mobile Number"
                value={formData.mobileNumber}
                onChangeText={createFilteredInputHandler('mobileNumber', (text) => {
                  setFormData(prev => ({ ...prev, mobileNumber: text }));
                  setErrors(prev => ({ ...prev, mobileNumber: null }));
                }, 10)}
                maxLength={10}
                keyboardType="phone-pad"
                mandatory
                editable={!verificationStatus.mobile}
                rightComponent={
                  <TouchableOpacity
                    style={[
                      styles.inlineVerifyButton,
                      verificationStatus.mobile && styles.verifiedButton,
                    ]}
                    onPress={() =>
                      !verificationStatus.mobile && handleVerify('mobile')
                    }
                    disabled={verificationStatus.mobile || loadingOtp.mobile}
                  >
                    {loadingOtp.mobile && !verificationStatus.mobile ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <AppText
                        style={[
                          styles.inlineVerifyText,
                          verificationStatus.mobile && styles.verifiedText,
                        ]}
                      >
                        {verificationStatus.mobile ? (
                          'Verified'
                        ) : (
                          <>
                            Verify
                            <AppText style={styles.inlineAsterisk}>*</AppText>
                          </>
                        )}
                      </AppText>
                    )}
                  </TouchableOpacity>
                }
              />
              {errors.mobileNumber && (
                <AppText style={styles.errorText}>
                  {errors.mobileNumber}
                </AppText>
              )}
              {errors.mobileVerification && (
                <AppText style={styles.errorText}>
                  {errors.mobileVerification}
                </AppText>
              )}
              {renderOTPInput('mobile')}

              {/* Email Address with Verify */}
              <CustomInput
                placeholder="Email Address"
                value={formData.emailAddress}
                onChangeText={createFilteredInputHandler('emailAddress', (text) => {
                  setFormData(prev => ({
                    ...prev,
                    emailAddress: text.toLowerCase(),
                  }));
                  setErrors(prev => ({ ...prev, emailAddress: null }));
                }, 241)}
                keyboardType="email-address"
                mandatory
                editable={!verificationStatus.email}
                rightComponent={
                  <TouchableOpacity
                    style={[
                      styles.inlineVerifyButton,
                      verificationStatus.email && styles.verifiedButton,
                      loadingOtp.email && styles.disabledButton,
                    ]}
                    onPress={() =>
                      !verificationStatus.email &&
                      !loadingOtp.email &&
                      handleVerify('email')
                    }
                    disabled={verificationStatus.email || loadingOtp.email}
                  >
                    {loadingOtp.email && !verificationStatus.email ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <AppText
                        style={[
                          styles.inlineVerifyText,
                          verificationStatus.email && styles.verifiedText,
                        ]}
                      >
                        {verificationStatus.email ? (
                          'Verified'
                        ) : (
                          <>
                            Verify
                            <AppText style={styles.inlineAsterisk}>*</AppText>
                          </>
                        )}
                      </AppText>
                    )}
                  </TouchableOpacity>
                }
              />
              {errors.emailAddress && (
                <AppText style={styles.errorText}>
                  {errors.emailAddress}
                </AppText>
              )}
              {errors.emailVerification && (
                <AppText style={styles.errorText}>
                  {errors.emailVerification}
                </AppText>
              )}
              {renderOTPInput('email')}

              {/* PAN Upload */}
              <FileUploadComponent
                placeholder="Upload PAN"
                accept={['pdf', 'jpg', 'jpeg', 'png']}
                maxSize={15 * 1024 * 1024} // 15MB
                docType={DOC_TYPES.PAN}
                initialFile={formData.panFile}
                onFileUpload={file => {
                  setFormData(prev => ({ ...prev, panFile: file }));
                }}
                onFileDelete={() => {
                  setFormData(prev => ({ ...prev, panFile: null }));
                }}
                errorMessage={errors.panFile}
                mandatory={true}
                onOcrDataExtracted={ocrData => {
                  console.log('PAN OCR Data:', ocrData);
                  if (ocrData.panNumber) {
                    setFormData(prev => ({
                      ...prev,
                      panNumber: ocrData.panNumber,
                    }));
                    // Auto-verify when PAN is populated from OCR
                    setVerificationStatus(prev => ({ ...prev, pan: true }));
                  }
                }}
              />

              {/* PAN Number with Verify - No OTP, just API verification */}
              <CustomInput
                placeholder="PAN Number"
                value={formData.panNumber}
                onChangeText={createFilteredInputHandler('panNumber', (text) => {
                  const upperText = text.toUpperCase();
                  setFormData(prev => ({ ...prev, panNumber: upperText }));
                  setErrors(prev => ({ ...prev, panNumber: null }));
                }, 10)}
                autoCapitalize="characters"
                maxLength={10}
                mandatory
                editable={!verificationStatus.pan}
                rightComponent={
                  <TouchableOpacity
                    style={[
                      styles.inlineVerifyButton,
                      verificationStatus.pan && styles.verifiedButton,
                    ]}
                    onPress={() => {
                      if (!verificationStatus.pan) {
                        // Verify PAN format
                        if (
                          /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)
                        ) {
                          setVerificationStatus(prev => ({
                            ...prev,
                            pan: true,
                          }));
                        } else {
                          Alert.alert(
                            'Invalid PAN',
                            'Please enter a valid PAN number',
                          );
                        }
                      }
                    }}
                    disabled={verificationStatus.pan}
                  >
                    <AppText
                      style={[
                        styles.inlineVerifyText,
                        verificationStatus.pan && styles.verifiedText,
                      ]}
                    >
                      {verificationStatus.pan ? (
                        'Verified'
                      ) : (
                        <>
                          Verify
                          <AppText style={styles.inlineAsterisk}>*</AppText>
                        </>
                      )}
                    </AppText>
                  </TouchableOpacity>
                }
              />
              {errors.panNumber && (
                <AppText style={styles.errorText}>{errors.panNumber}</AppText>
              )}

              {verificationStatus.pan && (
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => {
                    Toast.show({
                      type: 'info',
                      text1: 'Fetch GST',
                      text2: 'Fetching GST details from PAN...',
                    });
                    // Here you would call API to fetch GST from PAN
                    // and populate the GST dropdown options
                  }}
                >
                  <FetchGst />
                  <AppText style={styles.linkText}>Fetch GST from PAN</AppText>
                </TouchableOpacity>
              )}

              {/* GST Upload */}
              <FileUploadComponent
                placeholder="Upload GST"
                accept={['pdf', 'jpg', 'jpeg', 'png']}
                maxSize={15 * 1024 * 1024} // 15MB
                docType={DOC_TYPES.GST}
                initialFile={formData.gstFile}
                onFileUpload={file => {
                  setFormData(prev => ({ ...prev, gstFile: file }));
                }}
                onFileDelete={() => {
                  setFormData(prev => ({ ...prev, gstFile: null }));
                }}
                onOcrDataExtracted={ocrData => {
                  console.log('GST OCR Data:', ocrData);
                  if (ocrData.gstNumber) {
                    setFormData(prev => ({
                      ...prev,
                      gstNumber: ocrData.gstNumber,
                    }));
                    if (ocrData.isGstValid) {
                      setVerificationStatus(prev => ({ ...prev, gst: true }));
                    }
                  }
                }}
              />

              {/* 
              <TouchableOpacity
                style={[styles.input]}
                onPress={() => Alert.alert('GST Number', 'Select from GST numbers fetched from PAN')}
                activeOpacity={0.7}
              >
                <AppText style={formData.gstNumber ? styles.inputText : styles.placeholderText}>
                  {formData.gstNumber || 'GST Number'}
                </AppText>
                <ArrowDown color='#999' />
              </TouchableOpacity> */}

              <CustomInput
                placeholder="GST number"
                value={formData.gstNumber}
                onChangeText={createFilteredInputHandler('gstNumber', (text) => {
                  const upperText = text.toUpperCase();
                  setFormData(prev => ({ ...prev, gstNumber: upperText }));
                }, 15)}
                autoCapitalize="characters"
                keyboardType="default"
                maxLength={15}
                error={errors.gstNumber}
              />
            </View>

            {/* Mapping Section */}
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>Mapping</AppText>

              <View style={styles.switchContainer}>
                <AppText style={styles.switchLabel}>
                  Mark as buying entity
                </AppText>
                <TouchableOpacity
                  style={[
                    styles.switch,
                    formData.markAsBuyingEntity && styles.switchActive,
                  ]}
                  onPress={() =>
                    setFormData(prev => ({
                      ...prev,
                      markAsBuyingEntity: !prev.markAsBuyingEntity,
                    }))
                  }
                  activeOpacity={0.8}
                >
                  <Animated.View
                    style={[
                      styles.switchThumb,
                      formData.markAsBuyingEntity && styles.switchThumbActive,
                    ]}
                  />
                </TouchableOpacity>
              </View>

              <AppText style={styles.sectionSubTitle}>
                Select category{' '}
                <AppText style={styles.optional}>(Optional)</AppText>
              </AppText>

              <View style={styles.categoryOptions}>
                <TouchableOpacity
                  style={[
                    styles.checkboxButton,
                    formData.selectedCategory.groupCorporateHospital &&
                    styles.checkboxButtonActive,
                  ]}
                  onPress={() =>
                    setFormData(prev => ({
                      ...prev,
                      selectedCategory: {
                        ...prev.selectedCategory,
                        groupCorporateHospital:
                          !prev.selectedCategory.groupCorporateHospital,
                      },
                    }))
                  }
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      formData.selectedCategory.groupCorporateHospital &&
                      styles.checkboxSelected,
                    ]}
                  >
                    {formData.selectedCategory.groupCorporateHospital && (
                      <AppText style={styles.checkboxTick}>✓</AppText>
                    )}
                  </View>
                  <AppText style={styles.checkboxLabel}>
                    Group Corporate Hospital
                    <Icon
                      name="information-circle-outline"
                      size={16}
                      color="#999"
                    />
                  </AppText>
                </TouchableOpacity>

                {/* Group Hospital Selector - Show when Group Corporate Hospital is selected */}
                {formData.selectedCategory.groupCorporateHospital && (
                  <>
                    <TouchableOpacity
                      style={styles.hospitalSelectorDropdown}
                      onPress={() => {
                        navigation.navigate('HospitalSelector', {
                          selectedHospitals: formData.selectedHospitals,
                          onSelect: hospitals => {
                            // Allow multiple hospital selections
                            setFormData(prev => ({
                              ...prev,
                              selectedHospitals: hospitals,
                            }));
                          },
                        });
                      }}
                      activeOpacity={0.7}
                    >
                      <AppText style={styles.hospitalSelectorText}>
                        {formData.selectedHospitals &&
                          formData.selectedHospitals.length > 0
                          ? formData.selectedHospitals
                            .map(h => h.name)
                            .join(', ')
                          : 'Search hospital name/code'}
                      </AppText>
                      <ArrowDown color="#333" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.addNewHospitalLink}
                      onPress={() => setShowHospitalModal(true)}
                    >
                      <AppText style={styles.addNewHospitalLinkText}>
                        + Add New Group Hospital
                      </AppText>
                    </TouchableOpacity>
                  </>
                )}

                <TouchableOpacity
                  style={[
                    styles.checkboxButton,
                    formData.selectedCategory.pharmacy &&
                    styles.checkboxButtonActive,
                  ]}
                  onPress={() =>
                    setFormData(prev => ({
                      ...prev,
                      selectedCategory: {
                        ...prev.selectedCategory,
                        pharmacy: !prev.selectedCategory.pharmacy,
                      },
                    }))
                  }
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      formData.selectedCategory.pharmacy &&
                      styles.checkboxSelected,
                    ]}
                  >
                    {formData.selectedCategory.pharmacy && (
                      <AppText style={styles.checkboxTick}>✓</AppText>
                    )}
                  </View>
                  <AppText style={styles.checkboxLabel}>
                    Pharmacy
                    <Icon
                      name="information-circle-outline"
                      size={16}
                      color="#999"
                    />
                  </AppText>
                </TouchableOpacity>
              </View>

              {/* Pharmacy Selector - Show when Pharmacy is selected */}
              {formData.selectedCategory.pharmacy && (
                <>
                  <TouchableOpacity
                    style={styles.selectorInput}
                    onPress={() => {
                      navigation.navigate('PharmacySelector', {
                        selectedPharmacies: formData.selectedPharmacies,
                        onSelect: pharmacies => {
                          setFormData(prev => ({
                            ...prev,
                            selectedPharmacies: pharmacies,
                          }));
                        },
                      });
                    }}
                    activeOpacity={0.7}
                  >
                    <AppText style={styles.selectorPlaceholder}>
                      {formData.selectedPharmacies &&
                        formData?.selectedPharmacies.length > 0
                        ? `${formData.selectedPharmacies.length} Pharmacies Selected`
                        : 'Select pharmacy name/code'}
                    </AppText>
                    <ArrowDown color="#333" />
                  </TouchableOpacity>

                  {/* Selected Pharmacies List */}

                  {formData.selectedPharmacies.length > 0 && (
                    <View style={styles.selectedItemsContainer}>
                      {/* Selected Pharmacies List */}
                      {formData.selectedPharmacies.map((pharmacy, index) => (
                        <View
                          key={pharmacy.id || index}
                          style={styles.selectedItemChip}
                        >
                          <AppText style={{ color: '#333'} }>{pharmacy.name} </AppText>
                          <TouchableOpacity
                            onPress={() => {
                              setFormData(prev => ({
                                ...prev,
                                selectedPharmacies:
                                  prev.selectedPharmacies.filter(
                                    (_, i) => i !== index,
                                  ),
                              }));
                            }}
                          >
                            <DoctorDeleteIcon />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.addNewLink}
                    onPress={() => setShowPharmacyModal(true)}
                  >
                    <AppText style={styles.addNewLinkText}>
                      + Add New Pharmacy
                    </AppText>
                  </TouchableOpacity>
                </>
              )}
               {errors.pharmaciesMapping && (
                              <AppText style={styles.errorText}>
                                {errors.pharmaciesMapping}
                              </AppText>
                            )}

              {/* <View style={styles.divider} /> */}
              <View style={styles.customerGroupContainer}>
                <AppText style={styles.sectionLabel}>Customer group</AppText>

                <View style={styles.customerGroupGridContainer}>
                  {['9 Doctor Supply', '10 VQ', '11 RFQ', '12 GOVT'].map(
                    (group, index) => {
                      const groupId = index + 9; // 9, 10, 11, 12
                      const isDisabled = group !== '9 Doctor Supply';
                      const isSelected = formData.customerGroupId === groupId;

                      return (
                        <TouchableOpacity
                          key={group}
                          style={[
                            styles.radioButtonItem,
                            isDisabled && styles.radioButtonItemDisabled,
                          ]}
                          onPress={() => {
                            if (!isDisabled) {
                              setFormData(prev => ({
                                ...prev,
                                customerGroupId: groupId,
                              }));
                            }
                          }}
                          disabled={isDisabled}
                          activeOpacity={isDisabled ? 1 : 0.7}
                        >
                          <View
                            style={[
                              styles.radioButton,
                              isSelected && styles.radioButtonSelected,
                            ]}
                          >
                            {isSelected && (
                              <View style={styles.radioButtonInner} />
                            )}
                          </View>
                          <AppText
                            style={[
                              styles.radioButtonLabel,
                              isDisabled && styles.radioButtonLabelDisabled,
                            ]}
                          >
                            {group}
                          </AppText>
                        </TouchableOpacity>
                      );
                    },
                  )}
                </View>
              </View>
              <AppText style={styles.sectionSubTitle}>
                Stockist Suggestions{' '}
                <AppText style={styles.optional}>(Optional)</AppText>
              </AppText>

              {/* Stockist List */}
              {stockists.map((stockist, index) => (
                <View key={index} style={styles.stockistCard}>
                  {index > 0 && (
                    <View style={styles.stockistCardHeader}>
                      <TouchableOpacity
                        onPress={() => {
                          setStockists(prev =>
                            prev.filter((_, i) => i !== index),
                          );
                        }}
                        style={[
                          styles.deleteStockistButton,
                          { marginLeft: 'auto' },
                        ]}
                      >
                        <Icon name="trash-outline" size={20} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  )}

                  <CustomInput
                    placeholder="Name of the stockist"
                    value={stockist.name}
                    onChangeText={createFilteredInputHandler('nameOfStockist', (text) => {
                      setStockists(prev =>
                        prev.map((s, i) =>
                          i === index ? { ...s, name: text } : s,
                        ),
                      );
                    }, 40)}
                  />

                  <CustomInput
                    placeholder="Distributor Code"
                    value={stockist.distributorCode}
                    onChangeText={createFilteredInputHandler('distributorCode', (text) => {
                      setStockists(prev =>
                        prev.map((s, i) =>
                          i === index ? { ...s, distributorCode: text } : s,
                        ),
                      );
                    }, 20)}
                  />

                  <CustomInput
                    placeholder="City"
                    value={stockist.city}
                    onChangeText={createFilteredInputHandler('distributorCity', (text) => {
                      setStockists(prev =>
                        prev.map((s, i) =>
                          i === index ? { ...s, city: text } : s,
                        ),
                      );
                    }, 40)}
                  />
                </View>
              ))}

              {/* Add Stockist Button */}

              {stockists.length < 4 && (
                <TouchableOpacity
                  style={styles.addStockistButton}
                  onPress={handleAddStockist}
                >
                  <AppText style={styles.addStockistButtonText}>
                    + Add More Stockist
                  </AppText>
                </TouchableOpacity>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {isOnboardMode ? (
                <>
                  <TouchableOpacity
                    style={styles.assignButton}
                    onPress={handleAssignToCustomer}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator color={colors.primary} />
                    ) : (
                      <AppText style={styles.assignButtonText}>Assign to Customer</AppText>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.registerButton,
                      !isFormValid && styles.registerButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <AppText style={[
                        styles.registerButtonText,
                        !isFormValid && styles.registerButtonTextDisabled,
                      ]}>
                        Register
                      </AppText>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancel}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    <AppText style={styles.cancelButtonText}>Cancel</AppText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.registerButton,
                      !isFormValid && styles.registerButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <AppText style={[
                        styles.registerButtonText,
                        !isFormValid && styles.registerButtonTextDisabled,
                      ]}>
                        {inEditMode ? 'Update' : 'Register'}
                      </AppText>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Add New Hospital Modal */}
      <AddNewHospitalModal
        visible={showHospitalModal}
        mappingName={formData.clinicName}
        mappingLabel="Private Hospital"
        
        onClose={() => setShowHospitalModal(false)}
        onSubmit={hospital => {
          setFormData(prev => ({
            ...prev,
            selectedHospitals: [...prev.selectedHospitals, hospital],
          }));
          setShowHospitalModal(false);
        }}
      />

      {/* Add New Pharmacy Modal */}
      <AddNewPharmacyModal
        visible={showPharmacyModal}
        onClose={() => setShowPharmacyModal(false)}
         mappingName={formData.clinicName}
        mappingLabel="Private Hospital"
        onSubmit={pharmacy => {
          console.log('=== Pharmacy Response from AddNewPharmacyModal ===');
          console.log('Full Response:', pharmacy);
          console.log('Pharmacy ID:', pharmacy.id || pharmacy.customerId);
          console.log('=== End Pharmacy Response ===');

          // Create pharmacy object for display
          const newPharmacyItem = {
            id: pharmacy.id || pharmacy.customerId,
            name: pharmacy.pharmacyName || pharmacy.name,
            code: pharmacy.code || '',
          };

          // Add pharmacy to form data with mapping structure
          setFormData(prev => ({
            ...prev,
            selectedPharmacies: [
              ...(prev.selectedPharmacies || []),
              newPharmacyItem,
            ],
            mapping: {
              ...prev.mapping,
              pharmacy: [
                ...(prev.mapping?.pharmacy || []),
                {
                  id: pharmacy.id || pharmacy.customerId,
                  isNew: true,
                },
              ],
            },
          }));

          setShowPharmacyModal(false);
        }}
      />

      {/* Add New Doctor Modal */}
      {/* <AddNewDoctorModal
        visible={showDoctorModal}
        onClose={() => setShowDoctorModal(false)}
        onSubmit={(doctor) => {
          setFormData(prev => ({
            ...prev,
            selectedDoctors: [...prev.selectedDoctors, doctor]
          }));
          setShowDoctorModal(false);
        }}
      /> */}

      {/* Dropdown Modals */}
      <DropdownModal
        visible={showAreaModal}
        onClose={() => setShowAreaModal(false)}
        title="Select Area"
        data={
          uploadedAreas && uploadedAreas.length > 0
            ? uploadedAreas
            : Array.isArray(areas)
            ? areas.map(area => ({ id: area.id, name: area.name }))
            : []
        }
        selectedId={formData.areaId}
        onSelect={item => {
          setFormData(prev => ({
            ...prev,
            area: item.name,
            areaId: item.id,
          }));
          setErrors(prev => ({ ...prev, area: null }));
        }}
        loading={pincodeLoading}
      />
     

      {/* City Dropdown Modal */}
      <DropdownModal
        visible={showCityModal}
        onClose={() => setShowCityModal(false)}
        title="Select City"
        data={cities}
        selectedId={formData.cityId}
        onSelect={item => {
          setFormData(prev => ({
            ...prev,
            cityId: item.id,
            city: item.name,
          }));
          setErrors(prev => ({ ...prev, cityId: null }));
        }}
        loading={false}
      />

       {/* Dropdown Modals */}
      <DropdownModal
        visible={showStateModal}
        onClose={() => setShowStateModal(false)}
        title="Select State"
        data={states}
        selectedId={formData.stateId}
        onSelect={item => {
          setFormData(prev => ({
            ...prev,
            stateId: item.id,
            state: item.name,
            // Don't reset city and cityId - allow independent selection
          }));
          setErrors(prev => ({ ...prev, stateId: null }));
        }}
        loading={false}
      />

      {/* Cancel Confirmation Modal */}
      <Modal
        visible={showCancelModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.cancelModalOverlay}>
          <View style={styles.cancelModalContent}>
            <View style={styles.modalIconContainerOuter}>
              <View style={styles.modalIconContainer}>
                <AppText style={styles.modalIcon}>!</AppText>
              </View>
            </View>
            <AppText style={styles.cancelModalTitle}>
              {`Are you sure you want
to Cancel the Onboarding?`}
            </AppText>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalYesButton}
                onPress={() => {
                  setShowCancelModal(false);
                  navigation.goBack();
                }}
              >
                <AppText style={styles.modalYesButtonText}>Yes</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalNoButton}
                onPress={() => setShowCancelModal(false)}
              >
                <AppText style={styles.modalNoButtonText}>No</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  typeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  typeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
  },
  typeTagActive: {},
  typeTagText: {
    fontSize: 12,
    color: '#666',
  },
  typeTagTextActive: {
    color: colors.primary,
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: 0,
  },
  content: {
    paddingHorizontal: 0,
    paddingTop: 8,
  },
  section: {
    marginBottom: 32,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    paddingLeft: 12,
  },
  sectionSubTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.loginInputBorderColor,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: colors.error,
  },
  inputText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: colors.gray,
  },
  disabledText: {
    color: '#DDD',
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 4,
  },

  errorTextDropdown: {
    color: colors.error,
    fontSize: 12,
    // marginBottom: 12,
    marginLeft: 4,
  },
  floatingLabel: {
    position: 'absolute',
    top: -10,
    left: 12,
    fontSize: 12,
    fontWeight: '500',
    backgroundColor: '#fff',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 4,
    minHeight: 52,
  },
  inputTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  mandatoryIndicator: {
    fontSize: 16,
    color: colors.error,
    marginLeft: 4,
    fontWeight: '600',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  inputWithButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.loginInputBorderColor,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 10,
  },
  countryCode: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  inlineVerifyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    // backgroundColor: '#FFF5ED',
    borderRadius: 16,
  },
  inlineVerifyText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  verifiedButton: {
    // backgroundColor: '#E8F5E9',
  },
  verifiedText: {
    color: colors.primary,
  },
  otpContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    marginTop: -8,
  },
  otpTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  otpInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    backgroundColor: '#fff',
  },
  otpFooter: {
    alignItems: 'center',
  },
  otpTimer: {
    fontSize: 13,
    color: '#999',
  },
  resendText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#DDD',
    padding: 2,
    justifyContent: 'center',
  },
  switchActive: {
    backgroundColor: colors.primary,
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
  },
  switchThumbActive: {
    transform: [{ translateX: 20 }],
  },

  sectionTopSpacing: {
    marginTop: 32,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  optional: {
    fontSize: 14,
    fontWeight: '400',
    color: '#999',
  },
  categoryOptions: {
    marginBottom: 20,
  },
  checkboxButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  checkboxButtonActive: {
    opacity: 0.8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#fff',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxTick: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
  selectedItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
  },
  selectedItemTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5ED',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  selectedItemTagText: {
    fontSize: 14,
    color: '#333',
    marginRight: 6,
  },
  removeTagButton: {
    padding: 2,
  },
  removeTagText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },

  customerGroupContainer: {
    // flexDirection: 'row',
    // flexWrap: 'wrap',
    // gap: 8,
    // marginBottom: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 30,
  },
  customerGroupButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 20,
    backgroundColor: '#FAFAFA',
  },
  customerGroupButtonActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFF5ED',
  },
  customerGroupButtonText: {
    fontSize: 14,
    color: '#666',
  },
  customerGroupButtonTextActive: {
    color: colors.primary,
    fontWeight: '500',
  },
  customerGroupGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    // marginBottom: 20,
  },
  radioButtonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    paddingVertical: 12,
    paddingHorizontal: 0,
    marginBottom: 8,
  },
  radioButtonItemDisabled: {
    opacity: 0.5,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  radioButtonSelected: {
    borderColor: colors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  radioButtonLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  radioButtonLabelDisabled: {
    color: '#999',
  },
  stockistCard: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 0,
    marginBottom: 16,
  },
  stockistCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stockistCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  deleteStockistButton: {
    padding: 4,
  },
  addStockistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  addStockistButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  linkButton: {
    paddingVertical: 8,
    marginBottom: 16,
    marginTop: -8,
  },
  linkText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  hospitalSelectorDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#999',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  hospitalSelectorText: {
    fontSize: 16,
    color: '#777777',
    flex: 1,
    fontWeight: '500',
  },
  addNewHospitalLink: {
    marginBottom: 16,
  },
  addNewHospitalLinkText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  selectorInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.loginInputBorderColor,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  selectorPlaceholder: {
    fontSize: 16,
    color: '#777777',
    flex: 1,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  selectedItemName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectedItemCode: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  selectedPharmacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 8,
  },
  pharmacyInfo: {
    flex: 1,
  },
  pharmacyName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  pharmacyCode: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  addNewLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 20,
  },
  addNewLinkText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 8,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 24,
    marginBottom: 32,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  assignButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  assignButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  registerButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  registerButtonDisabled: {
    backgroundColor: '#CCCCCC',
    elevation: 0,
    shadowOpacity: 0,
  },
  registerButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  registerButtonTextDisabled: {
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIcon: {
    fontSize: 32,
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalYesButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  modalYesButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  modalNoButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
  },
  modalNoButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },

  cancelModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  cancelModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 20,
    alignItems: 'center',
  },

  cancelModalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 50,
  },

  modalIconContainerOuter: {
    width: 80,
    height: 80,
    borderRadius: 50,
    backgroundColor: '#FFE3E3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 30,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalYesButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#FF6B6B',
    alignItems: 'center',
  },
  modalYesButtonText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  modalNoButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
  },
  modalNoButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  // Hospital and Pharmacy Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalCloseButton: {
    fontSize: 24,
    color: '#999',
    fontWeight: '300',
  },
  modalSectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 10,
  },
  modalFieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    marginTop: 12,
    marginBottom: 6,
  },
  mandatory: {
    color: colors.error,
  },
  radioGroup: {
    marginBottom: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 12,
  },
  radioCircleSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  radioLabel: {
    fontSize: 14,
    color: '#333',
  },
  fileUploadRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  fileUploadButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: '#FFF5ED',
    alignItems: 'center',
  },
  fileUploadButtonText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  modalInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.loginInputBorderColor,
    backgroundColor: '#FAFAFA',
    fontSize: 13,
    color: '#333',
  },
  dropdownInput: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.loginInputBorderColor,
    backgroundColor: '#FAFAFA',
    marginBottom: 10,
    justifyContent: 'center',
  },
  dropdownPlaceholder: {
    fontSize: 13,
    color: '#999',
  },
  verifyButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  otpNote: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  modalActionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    marginBottom: 30,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  assignButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  assignButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  // Modal styles for dropdown
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalList: {
    paddingHorizontal: 16,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalItemSelected: {
    backgroundColor: '#FFF5ED',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    textAlign: 'left',
  },
  modalItemTextSelected: {
    color: colors.primary,
    fontWeight: '500',
  },
  modalLoader: {
    paddingVertical: 50,
  },
  inlineAsterisk: {
    color: 'red',
    fontSize: 16,
    marginLeft: 2,
  },
  flexContainer: {
    flex: 1,
  },
  asteriskRed: {
    color: 'red',
  },
  asteriskPrimary: {
    color: "red",
    fontSize:16
  },
  radioButtonContainer: {
    flexDirection: 'row',
    gap: 50,
    flex: 1,
    marginBottom: 16,
  },
  selectedItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
    marginBottom: 16,
  },
  selectedItemChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F6',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 8,
    marginBottom: 16,
    marginTop: -16,
  },
  linkText: {
    color: colors.primary,
  },
});

export default PrivateRegistrationForm;
