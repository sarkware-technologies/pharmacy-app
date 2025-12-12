/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-dupe-keys */
// src/screens/authorized/registration/GroupHospitalRegistrationForm.js

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
import Icon from 'react-native-vector-icons/MaterialIcons';
import DoctorDeleteIcon from '../../../components/icons/DoctorDeleteIcon';
import { colors } from '../../../styles/colors';
import CustomInput from '../../../components/CustomInput';
import AddressInputWithLocation from '../../../components/AddressInputWithLocation';
import FileUploadComponent from '../../../components/FileUploadComponent';
import ChevronLeft from '../../../components/icons/ChevronLeft';
import ChevronRight from '../../../components/icons/ChevronRight';
import Upload from '../../../components/icons/Upload';
import Calendar from '../../../components/icons/Calendar';
import ArrowDown from '../../../components/icons/ArrowDown';
import Search from '../../../components/icons/Search';
import CloseCircle from '../../../components/icons/CloseCircle';
import RemoveHospitalCloseIcon from '../../../components/icons/RemoveHospitalCloseIcon';
import { customerAPI } from '../../../api/customer';
import { AppText, AppInput } from '../../../components';
import AddNewHospitalModal from './AddNewHospitalModal';
import AddNewPharmacyModal from './AddNewPharmacyModal';

import Toast from 'react-native-toast-message';
import FetchGst from '../../../components/icons/FetchGst';
import { usePincodeLookup } from '../../../hooks/usePincodeLookup';
import FloatingDateInput from '../../../components/FloatingDateInput';
import { validateField, isValidPAN, isValidGST, isValidEmail, isValidMobile, isValidPincode, createFilteredInputHandler, filterForField } from '../../../utils/formValidation';

const { width, height } = Dimensions.get('window');

// Mock data
const MOCK_HOSPITALS = [
  { id: '1', name: 'Columbia Asia', code: '10106555', city: 'Pune' },
  { id: '2', name: 'Command', code: '10006565', city: 'Bengaluru' },
  { id: '3', name: 'Tata Memorial Hospital', code: '10106555', city: 'Jaipur' },
];

// Document types for file uploads
const DOC_TYPES = {
  REGISTRATION_CERTIFICATE: 8,
  HOSPITAL_IMAGE: 1,
  PAN: 7,
  GST: 8,
};

const GroupHospitalRegistrationForm = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const scrollViewRef = useRef(null);
  const otpRefs = useRef({});

  // Get route params
  const {
    typeId,
    categoryId,
    subCategoryId,
    mode,
    customerId,
    customerData: routeCustomerData,
    isStaging,
  } = route.params || {};

  // Get logged-in user for assign functionality
  const loggedInUser = useSelector(state => state.auth.user);

  // Edit mode and onboard mode detection
  const isEditMode = mode === 'edit' || !!customerId;
  const isOnboardMode = mode === 'onboard';
  const [loadingCustomerData, setLoadingCustomerData] = useState(false);
  const isMounted = useRef(true);

  // Form state
  const [formData, setFormData] = useState({
    // License Details
    registrationCertificateFile: '',
    registrationNumber: '',
    registrationDate: '',
    licenseImage: '',

    // General Details
    hospitalName: '',
    shortName: '',
    address1: '',
    address2: '',
    address3: '',
    address4: '',
    pincode: '',
    area: '',
    areaId: null, // <<< ADDED
    city: '',
    cityId: null,
    state: '',
    stateId: null,
    stationCode: "",

    // Security Details
    mobileNumber: '',
    emailAddress: '',
    panFile: '',
    panNumber: '',
    gstFile: '',
    gstNumber: '',

    // Mapping
    markAsBuyingEntity: true,
    linkedHospitals: [],
    linkedPharmacies: [],
    customerGroup: '10-VQ',
    selectedCategory: {
      pharmacy: false,
    },
    customerGroupId: 3
  });

  // State for managing stockists
  const [stockists, setStockists] = useState([
    { name: '', distributorCode: '', city: '' },
  ]);

  // State for managing expanded hospitals in accordion
  const [expandedHospitals, setExpandedHospitals] = useState({ summary: true });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showAddHospitalModal, setShowAddHospitalModal] = useState(false);

  // Document IDs for API submission
  const [documentIds, setDocumentIds] = useState({
    registrationCertificate: null,
    hospitalImage: null,
    pan: null,
    gst: null,
  });

  // Uploaded documents with full details including docTypeId
  const [uploadedDocs, setUploadedDocs] = useState([]);

  // API Data
  const [customerGroups, setCustomerGroups] = useState([]);

  // Pincode lookup hook
  const {
    areas,
    cities,
    states,
    loading: pincodeLoading,
    lookupByPincode,
    clearData,
  } = usePincodeLookup();

  // Dropdown Modals
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [showStationModal, setShowStationModal] = useState(false);
  const [showGstModal, setShowGstModal] = useState(false);
  const [showAddPharmacyModal, setShowAddPharmacyModal] = useState(false);

  // OTP states
  const [showOTP, setShowOTP] = useState({
    mobile: false,
    email: false,
  });
  const [otpValues, setOtpValues] = useState({
    mobile: ['', '', '', ''],
    email: ['', '', '', ''],
  });
  const [otpTimers, setOtpTimers] = useState({
    mobile: 30,
    email: 30,
  });
  const [loadingOtp, setLoadingOtp] = useState({
    mobile: false,
    email: false,
  });
  const [verificationStatus, setVerificationStatus] = useState({
    mobile: false,
    email: false,
    pan: false,
    gst: false,
  });

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const otpSlideAnim = useRef(new Animated.Value(-50)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  // Set navigation header - hide default header in edit/onboard mode, show custom header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false, // Always hide default header, we use custom header
      headerBackTitleVisible: false,
    });
  }, [navigation]);

  useEffect(() => {
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

    // Load initial data
    loadInitialData();

    // Handle edit mode and onboard mode - fetch customer details
    if (isEditMode || isOnboardMode) {
      if (routeCustomerData) {
        // Use provided customer data
        populateFormFromCustomerData(routeCustomerData);
      } else if (customerId) {
        // Fetch customer details from API (same API for both edit and onboard)
        fetchCustomerDetailsForEdit();
      }
    }

    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadInitialData = async () => {
    // Note: States and cities are now loaded via pincode lookup only
    // Keep this function in case we add more initial loads later (customer groups etc.)
    loadCustomerGroups();
  };

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
    if (cities.length > 0 && states.length > 0) {
      // Auto-select first city and state from lookup results
      const firstCity = cities[0];
      const firstState = states[0];

      setFormData(prev => ({
        ...prev,
        city: firstCity.name,
        cityId: firstCity.id,
        state: firstState.name,
        stateId: firstState.id,
      }));
    }

    // Auto-select first area (0th index) if available
    if (areas.length > 0 && !formData.area) {
      const firstArea = areas[0];
      setFormData(prev => ({
        ...prev,
        area: firstArea.name,
        areaId: firstArea.id,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cities, states, areas]);

  // Legacy functions removed - cities and states now loaded via pincode lookup only
  const loadStatesLegacy = async () => {
    // No-op retained for backward compatibility
    return;
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

  // Populate form from customer data (API response)
  const populateFormFromCustomerData = (data) => {
    try {
      const generalDetails = data.generalDetails || {};
      const securityDetails = data.securityDetails || {};
      const licenceDetails = data.licenceDetails || {};
      const docType = data.docType || [];
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

      // Find license documents (Registration Certificate for Group Hospital) - also match by docTypeId
      const registrationLicense = licenceDetails.licence?.find(l =>
        l.licenceTypeCode === 'REG' ||
        l.licenceTypeName === 'Registration' ||
        l.hospitalCode ||
        String(l.docTypeId) === '8'
      );

      // Find document files - use helper function for robust matching
      const registrationDoc = findDocByType('8', 'REGISTRATION') ||
        (registrationLicense?.docTypeId ? findDocByType(String(registrationLicense.docTypeId), 'REGISTRATION') : null);
      const hospitalImageDoc = findDocByType('1', 'CLINIC IMAGE');
      const panDoc = findDocByType('7', 'PAN CARD');
      const gstDoc = findDocByType('2', 'GSTIN');

      // Populate form data
      setFormData(prev => ({
        ...prev,
        // License Details
        registrationNumber: registrationLicense?.licenceNo || registrationLicense?.hospitalCode || '',
        registrationDate: formatDate(registrationLicense?.licenceValidUpto),
        registrationCertificateFile: registrationDoc ? {
          id: registrationDoc.docId || '',
          docId: registrationDoc.docId || '',
          fileName: registrationDoc.fileName || 'REGISTRATION',
          s3Path: registrationDoc.s3Path || '',
          uri: registrationDoc.s3Path || '',
          docTypeId: parseInt(registrationDoc.doctypeId) || 8,
        } : null,
        licenseImage: hospitalImageDoc ? {
          id: hospitalImageDoc.docId || '',
          docId: hospitalImageDoc.docId || '',
          fileName: hospitalImageDoc.fileName || 'HOSPITAL IMAGE',
          s3Path: hospitalImageDoc.s3Path || '',
          uri: hospitalImageDoc.s3Path || '',
          docTypeId: parseInt(hospitalImageDoc.doctypeId) || 1,
        } : null,

        // General Details
        hospitalName: generalDetails.customerName || '',
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
        stationCode: data.stationCode || '',

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
        customerGroupId: groupDetails.customerGroupId || 3,
        markAsBuyingEntity: data.isBuyer || false,
      }));

      // Set document IDs for existing documents
      if (registrationDoc) {
        setDocumentIds(prev => ({ ...prev, registrationCertificate: registrationDoc.docId }));
      }
      if (hospitalImageDoc) {
        setDocumentIds(prev => ({ ...prev, hospitalImage: hospitalImageDoc.docId }));
      }
      if (panDoc) {
        setDocumentIds(prev => ({ ...prev, pan: panDoc.docId }));
      }
      if (gstDoc) {
        setDocumentIds(prev => ({ ...prev, gst: gstDoc.docId }));
      }

      // Set verification status
      setVerificationStatus({
        mobile: data.isMobileVerified || false,
        email: data.isEmailVerified || false,
      });

      // Set uploaded documents
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

  const loadCustomerGroups = async () => {
    try {
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
    // Validate field before verification
    if (
      field === 'mobile' &&
      (!formData.mobileNumber ||
        !/^[6-9]\d{9}$/.test(formData.mobileNumber))
    ) {
      setErrors(prev => ({
        ...prev,
        mobileNumber: 'Please enter valid 10-digit mobile number',
      }));
      return;
    }
    if (
      field === 'email' &&
      (!formData.emailAddress ||
        !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.emailAddress))
    ) {
      setErrors(prev => ({
        ...prev,
        emailAddress: 'Please enter a valid email address',
      }));
      return;
    }

    setLoadingOtp(prev => ({ ...prev, [field]: true }));
    try {
      // Reset OTP state before generating new OTP
      setOtpValues(prev => ({ ...prev, [field]: ['', '', '', ''] }));
      setOtpTimers(prev => ({ ...prev, [field]: 30 }));

      const requestData = {
        [field === 'mobile' ? 'mobile' : 'email']:
          field === 'mobile' ? formData.mobileNumber : formData.emailAddress,
      };

      const response = await customerAPI.generateOTP(requestData);

      if (response.success) {
        setShowOTP(prev => ({ ...prev, [field]: true }));

        // If OTP is returned in response (for testing), auto-fill it
        if (response.data && response.data.otp) {
          const otpString = response.data.otp.toString();
          const otpArray = otpString.split('').slice(0, 4);
          setOtpValues(prev => ({
            ...prev,
            [field]: [...otpArray, ...Array(4 - otpArray.length).fill('')],
          }));

          // Auto-submit OTP after a delay
          setTimeout(() => {
            handleOtpVerification(field, response.data.otp.toString());
          }, 500);
        }

        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: `OTP sent to ${field}`,
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
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.message || 'Failed to generate OTP',
          position: 'top',
        });
      }
    } catch (error) {
      console.error('Error generating OTP:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to send OTP. Please try again.',
        position: 'top',
      });
    } finally {
      setLoadingOtp(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleFileUpload = (field, file) => {
    if (file && (file.id || file.docId)) {
      const fileId = file.id || file.docId;
      setDocumentIds(prev => ({ ...prev, [field]: fileId }));

      // Add complete document object to uploaded list with docTypeId
      // For edit mode: include docId if it's an existing file
      const docObject = {
        s3Path: file.s3Path || file.uri,
        docTypeId: file.docTypeId,
        fileName: file.fileName || file.name,
        id: file.id || file.docId, // Use id for new uploads, docId for existing files
        ...(file.docId ? { docId: file.docId } : {}), // Include docId if it exists
      };
      // Remove old doc if it exists (for edit mode file replacement)
      if (isEditMode && file.docId) {
        setUploadedDocs(prev => prev.filter(doc => doc.docId !== file.docId && doc.id !== file.docId));
      }
      setUploadedDocs(prev => [...prev, docObject]);
    }
    setFormData(prev => ({ ...prev, [`${field}File`]: file }));
    setErrors(prev => ({ ...prev, [`${field}File`]: null }));
  };

  const handleFileDelete = field => {
    const file = formData[`${field}File`];
    // Handle both new uploads (file.id) and existing files from edit mode (file.docId)
    if (file && (file.id || file.docId)) {
      const fileId = file.id || file.docId;
      setUploadedDocs(prev => prev.filter(doc => doc.id !== fileId && doc.docId !== fileId));
      setDocumentIds(prev => {
        const updated = { ...prev };
        if (field === 'registrationCertificate') updated.registrationCertificate = null;
        if (field === 'hospitalImage') updated.hospitalImage = null;
        if (field === 'pan') updated.pan = null;
        if (field === 'gst') updated.gst = null;
        return updated;
      });
    }
    setFormData(prev => ({ ...prev, [`${field}File`]: null }));
    setErrors(prev => ({ ...prev, [`${field}File`]: null }));
  };

  // Helper function to split address into address1, address2, address3
  const splitAddress = (address) => {
    if (!address) return { address1: '', address2: '', address3: '' };

    // Split by commas first
    const parts = address.split(',').map(part => part.trim()).filter(part => part.length > 0);

    if (parts.length >= 3) {
      return {
        address1: parts[0],
        address2: parts.slice(1, -1).join(', '),
        address3: parts[parts.length - 1],
      };
    } else if (parts.length === 2) {
      return {
        address1: parts[0],
        address2: parts[1],
        address3: '',
      };
    } else if (parts.length === 1) {
      // If no commas, try to split by length (approximately 50 chars each)
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
        return {
          address1: addr,
          address2: '',
          address3: '',
        };
      }
    }

    return { address1: '', address2: '', address3: '' };
  };

  // Handle OCR extracted data for registration certificate uploads
  const handleRegistrationOcrData = async (ocrData) => {
    console.log('OCR Data Received:', ocrData);

    const updates = {};

    // Populate hospital name if available



    if (ocrData.hospitalName && !formData.hospitalName) {
      updates.hospitalName = filterForField('hospitalName', ocrData.hospitalName, 40);
    }

    if (ocrData.pharmacyName && !formData.hospitalName) {
      updates.hospitalName = filterForField('hospitalName', ocrData.pharmacyName, 40);
    }

    // Split and populate address fields if available
    if (ocrData.address) {
      const addressParts = splitAddress(ocrData.address);
      if (!formData.address1 && addressParts.address1) {
        updates.address1 = filterForField('address1', addressParts.address1, 40);
      }
      if (!formData.address2 && addressParts.address2) {
        updates.address2 = filterForField('address2', addressParts.address2, 40);
      }
      if (!formData.address3 && addressParts.address3) {
        updates.address3 = filterForField('address3', addressParts.address3, 60);
      }
    }

    // Populate registration number if available (also check licenseNumber as fallback)
    if (ocrData.registrationNumber && !formData.registrationNumber) {
      updates.registrationNumber = filterForField('hospitalCode', ocrData.registrationNumber, 20);
    } else if (ocrData.licenseNumber && !formData.registrationNumber) {
      updates.registrationNumber = filterForField('hospitalCode', ocrData.licenseNumber, 20);
    }

    // Populate registration date if available
    if (ocrData.issueDate && !formData.registrationDate) {
      const parts = ocrData.issueDate.split('-');
      if (parts.length === 3) {
        const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
        updates.registrationDate = formattedDate;
      }
    }

    // Populate expiry date if available (for license expiry tracking)
    if (ocrData.expiryDate) {
      const parts = ocrData.expiryDate.split('-');
      if (parts.length === 3) {
        const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
        // Store expiry date if there's a field for it, or use registrationDate as fallback
        // Note: You may need to add a separate expiryDate field if required
      }
    }

    // Populate pincode
    if (ocrData.pincode && !formData.pincode) {
      updates.pincode = filterForField('pincode', ocrData.pincode, 6);
    }

    // Apply all updates first
    if (Object.keys(updates).length > 0) {
      setFormData(prev => ({ ...prev, ...updates }));
      const errorUpdates = {};
      Object.keys(updates).forEach(key => {
        errorUpdates[key] = null;
      });
      setErrors(prev => ({ ...prev, ...errorUpdates }));
    }

    // Trigger pincode lookup if pincode is available and valid (6 digits)
    if (ocrData.pincode && /^\d{6}$/.test(ocrData.pincode)) {
      await lookupByPincode(ocrData.pincode);
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
        handleOtpVerification(field);
      }
    }
  };

  const handleOtpVerification = async (field, otp) => {
    const otpValue = otp || otpValues[field].join('');

    setLoadingOtp(prev => ({ ...prev, [field]: true }));
    try {
      const requestData = {
        [field === 'mobile' ? 'mobile' : 'email']:
          field === 'mobile' ? formData.mobileNumber : formData.emailAddress,
      };

      const response = await customerAPI.validateOTP(otpValue, requestData);

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: `${field === 'mobile' ? 'Mobile' : 'Email'
            } verified successfully!`,
          position: 'top',
        });

        setShowOTP(prev => ({ ...prev, [field]: false }));
        setVerificationStatus(prev => ({ ...prev, [field]: true }));
        setOtpTimers(prev => ({ ...prev, [field]: 0 })); // Reset OTP timer

        // Reset OTP values for this field
        setOtpValues(prev => ({
          ...prev,
          [field]: ['', '', '', ''],
        }));
      } else {
        Toast.show({
          type: 'error',
          text1: 'Invalid OTP',
          text2: 'Please enter the correct OTP',
          position: 'top',
        });
      }
    } catch (error) {
      console.error('OTP validation error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to validate OTP. Please try again.',
        position: 'top',
      });
    } finally {
      setLoadingOtp(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleResendOTP = field => {
    setOtpTimers(prev => ({ ...prev, [field]: 30 }));
    Alert.alert('OTP Sent', `New OTP sent for ${field} verification.`);
  };

  // DropdownModal Component
  const DropdownModal = ({
    visible,
    onClose,
    title,
    data,
    selectedId,
    onSelect,
    loading,
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
                keyExtractor={item => item.id?.toString() || item.value}
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
                      {item.name || item.label}
                    </AppText>
                    {selectedId == item.id && (
                      <Icon name="checkmark" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                    <AppText style={styles.emptyText}>
                      No {title} available
                    </AppText>
                  </View>
                }
                style={styles.modalList}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    );
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
  const validateForm = () => {
    const newErrors = {};

    // License Details
    if (!formData.registrationNumber) {
      newErrors.registrationNumber = 'Registration number is required';
    }

    if (!formData.registrationCertificateFile) {
      newErrors.registrationCertificateFile =
        'Registration Certificate is required';
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

    if (!formData.stationCode)
      newErrors.stationCode = 'Station Code is required';

    // General Details validation using reusable validation utility
    const hospitalNameError = validateField('hospitalName', formData.hospitalName, true, 'Hospital name is required');
    if (hospitalNameError) newErrors.hospitalName = hospitalNameError;

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
      newErrors.city = 'City is required';
    }
    if (!formData.stateId) {
      newErrors.state = 'State is required';
    }

    // Security Details validation using reusable validation utility
    const mobileError = validateField('mobileNo', formData.mobileNumber, true, 'Valid 10-digit mobile number is required');
    if (mobileError) newErrors.mobileNumber = mobileError;
    if (!verificationStatus.mobile) {
      newErrors.mobileVerification = 'Mobile number verification is required';
    }

    const emailError = validateField('emailAddress', formData.emailAddress, true, 'Valid email address is required');
    if (emailError) newErrors.emailAddress = emailError;
    if (!verificationStatus.email) {
      newErrors.emailVerification = 'Email verification is required';
    }

    // PAN validation
    const panError = validateField('panNo', formData.panNumber, true, 'Valid PAN number is required (e.g., ABCDE1234F)');
    if (panError) newErrors.panNumber = panError;

    // GST is optional - only validate if provided
    if (formData.gstNumber && formData.gstNumber.trim() !== '') {
      const gstError = validateField('gstNo', formData.gstNumber, false, 'Invalid GST format (e.g., 27ASDSD1234F1Z5)');
      if (gstError) newErrors.gstNumber = gstError;
    }

    // Linked Hospitals validation
    if (!formData.linkedHospitals || formData.linkedHospitals.length === 0) {
      newErrors.linkedHospitals = 'At least one linked hospital is required';
    }

    if (!formData.panFile) {
      newErrors.panFile = 'PAN document is required';
    }


    if (!formData.markAsBuyingEntity && formData.linkedPharmacies.length === 0) {
      newErrors.pharmaciesMapping = "Pharmacy mapping is mandatory for non buying entities";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check form validity whenever form data, document IDs, or verification status changes
  useEffect(() => {
    // Validate required fields
    let isValid = true;
    if (!formData.registrationNumber) isValid = false;
    else if (!formData.registrationCertificateFile) isValid = false;
    else if (!formData.registrationDate) isValid = false;
    else if (!formData.hospitalName) isValid = false;
    else if (!formData.address1) isValid = false;
    else if (!formData.address2) isValid = false;
    else if (!formData.address3) isValid = false;
    else if (!formData.pincode || !/^[1-9]\d{5}$/.test(formData.pincode)) isValid = false;
    else if (!formData.area || formData.area.trim().length === 0) isValid = false;
    else if (!formData.cityId) isValid = false;
    else if (!formData.stateId) isValid = false;
    else if (!formData.mobileNumber || formData.mobileNumber.length !== 10) isValid = false;
    else if (!verificationStatus.mobile) isValid = false;
    else if (!formData.emailAddress || !formData.emailAddress.includes('@')) isValid = false;
    else if (!verificationStatus.email) isValid = false;
    else if (!formData.panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) isValid = false;
    else if (!formData.panFile) isValid = false;
    else if (!formData.linkedHospitals || formData.linkedHospitals.length === 0) isValid = false;
    else if (!formData.stationCode) isValid = false;


    setIsFormValid(isValid);
  }, [formData, verificationStatus]);

  const handleNextStep = () => {
    handleSubmit();
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);

    // Animate button
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      // Prepare customerDocs array with proper structure
      const prepareCustomerDocs = () => {
        return uploadedDocs.map(doc => ({
          s3Path: doc.s3Path,
          docTypeId: String(doc.docTypeId),
          fileName: doc.fileName,
          ...(isEditMode && customerId ? {
            customerId: String(customerId),
            id: String(doc.docId || doc.id || ''),
          } : {
            id: String(doc.id || ''),
          }),
        }));
      };

      // Prepare registration payload
      const registrationData = {
        typeId: typeId || 2,
        categoryId: categoryId || 4,
        subCategoryId: subCategoryId || 1,
        isMobileVerified: verificationStatus.mobile,
        isEmailVerified: verificationStatus.email,
        isExisting: false,
        licenceDetails: {
          registrationDate: new Date().toISOString(),
          licence: [
            {
              licenceTypeId: 7,
              licenceNo: formData.registrationNumber,
              licenceValidUpto: formatDateForAPI(formData.registrationDate),
              hospitalCode: '',
            },
          ],
        },
        customerDocs: prepareCustomerDocs(),
        isBuyer: formData.markAsBuyingEntity,
        customerGroupId: formData.customerGroupId || 3,
        stationCode: formData.stationCode,
        generalDetails: {
          name: formData.hospitalName,
          shortName: formData.shortName || '',
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
          email: formData.emailAddress || '',
          panNumber: formData.panNumber || '',
          ...(formData.gstNumber ? { gstNumber: formData.gstNumber } : {}),
        },
        ...(stockists &&
          stockists.length > 0 && {
          suggestedDistributors: stockists.map(stockist => ({
            distributorCode: stockist.distributorCode || '',
            distributorName: stockist.name || '',
            city: stockist.city || '',
            customerId: isEditMode && customerId ? parseInt(customerId, 10) : stockist.name,
          })),
        }),

        mapping:
          formData.linkedHospitals?.length > 0 ||
            formData.linkedHospitals?.length > 0
            ? {
              ...(formData.linkedHospitals?.length > 0 && {
                hospitals: formData.linkedHospitals.map(h => ({
                  id: Number(h.id),
                  isNew: false,
                })),
              }),

              ...(formData.linkedPharmacies?.length > 0 && {
                pharmacy: formData.linkedPharmacies.map(p => ({
                  id: Number(p.id),
                  isNew: false,
                })),
              }),
            }
            : undefined,

        isChildCustomer: false,
        ...(isEditMode && customerId ? { customerId: parseInt(customerId, 10) } : {}),
      };

      console.log(isEditMode ? 'Update data:' : 'Registration data:', registrationData);

      let response;
      if (isEditMode && customerId) {
        // Update existing customer - use POST to create endpoint with customerId in payload
        response = await customerAPI.createCustomer(registrationData);
      } else {
        // Create new customer
        response = await customerAPI.createCustomer(registrationData);
      }

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: isEditMode ? 'Update Successful' : 'Registration Successful',
          text2: response.message || (isEditMode ? 'Customer details updated successfully' : 'Group Hospital registered successfully'),
          position: 'top',
        });

        // Navigate to success screen for both create and edit
        navigation.navigate('RegistrationSuccess', {
          type: 'hospital',
          registrationCode: isEditMode ? customerId : (response.data?.id || response?.data?.id || 'SUCCESS'),
          codeType: 'Group Hospital',
          ...(isEditMode ? { isEditMode: true } : { customerId: response?.data?.id }),
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2:
            response.details ||
            'Failed to register hospital. Please try again.',
          position: 'top',
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: String(error) + '. Please try again.',
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };


  const handleCancel = () => {
    if (isEditMode || isOnboardMode) {
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
            {otpTimers[field] > 0 ? `Resend in ${otpTimers[field]}s` : ''}
          </AppText>
          {otpTimers[field] === 0 && (
            <TouchableOpacity onPress={() => handleResendOTP(field)}>
              <AppText style={styles.resendText}>Resend OTP</AppText>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  };

  const renderLicenseDetails = () => (
    <Animated.View
      style={[
        styles.stepContent,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.section, styles.sectionTopSpacing]}>
        <AppText style={styles.stepTitle}>
          License Details<AppText style={{ color: 'red' }}>*</AppText>
        </AppText>

        <FileUploadComponent
          placeholder="Upload registration certificate"
          accept={['pdf', 'jpg', 'png', 'jpeg']}
          maxSize={15 * 1024 * 1024}
          docType={DOC_TYPES.REGISTRATION_CERTIFICATE}
          initialFile={formData.registrationCertificateFile}
          onFileUpload={file =>
            handleFileUpload('registrationCertificate', file)
          }
          onFileDelete={() => handleFileDelete('registrationCertificate')}
          onOcrDataExtracted={handleRegistrationOcrData}
          errorMessage={errors.registrationCertificateFile}
        />

        <CustomInput
          placeholder="Hospital Registration Number"
          value={formData.registrationNumber}
          onChangeText={createFilteredInputHandler('hospitalCode', (text) => {
            setFormData(prev => ({ ...prev, registrationNumber: text }));
            setErrors(prev => ({ ...prev, registrationNumber: null }));
          }, 20)}
          error={errors.registrationNumber}
          autoCapitalize="characters"
          mandatory={true}
        />

        <FloatingDateInput
          label="Registration date"
          mandatory={true}
          value={formData.registrationDate}
          error={errors.registrationDate}
          onChange={(date) => {
            setFormData(prev => ({ ...prev, registrationDate: date }));
            setErrors(prev => ({ ...prev, registrationDate: null }));
          }}
        />
        <AppText style={styles.sectionSubTitle}>
          Image<AppText style={{ color: 'red' }}>*</AppText>{' '}
          <Icon name="info-outline" size={16} color="#999" />
        </AppText>
        <FileUploadComponent
          placeholder="Upload"
          accept={['jpg', 'png', 'jpeg']}
          maxSize={15 * 1024 * 1024}
          docType={DOC_TYPES.HOSPITAL_IMAGE}
          initialFile={formData.hospitalImageFile}
          onFileUpload={file => handleFileUpload('hospitalImage', file)}
          onFileDelete={() => handleFileDelete('hospitalImage')}
          errorMessage={errors.hospitalImageFile}
        />


      </View>
    </Animated.View>
  );

  const renderGeneralDetails = () => (
    <Animated.View
      style={[
        styles.stepContent,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.section}>
        <AppText style={styles.stepTitle}>
          General Details<AppText style={{ color: 'red' }}>*</AppText>
        </AppText>

        <CustomInput
          placeholder="Hospital name"
          value={formData.hospitalName}
          onChangeText={createFilteredInputHandler('hospitalName', (text) => {
            setFormData(prev => ({ ...prev, hospitalName: text }));
            setErrors(prev => ({ ...prev, hospitalName: null }));
          }, 40)}
          error={errors.hospitalName}
          mandatory={true}
        />

        <CustomInput
          placeholder="Short name"
          value={formData.shortName}
          onChangeText={createFilteredInputHandler('shortName', (text) =>
            setFormData(prev => ({ ...prev, shortName: text })), 25
          )}
        />

        {/* Station code */}
        <View style={styles.dropdownContainer}>
          {(formData.stationCode || cities.length > 0) && (
            <AppText
              style={[styles.floatingLabel, { color: colors.primary }]}
            >
              Station<AppText style={styles.asteriskPrimary}>*</AppText>
            </AppText>
          )}
          <TouchableOpacity
            style={[styles.dropdown, errors.stationCode && styles.inputError]}
            onPress={() => setShowStationModal(true)}
          >
            <View style={styles.inputTextContainer}>
              <AppText style={formData.stationCode ? styles.inputText : styles.placeholderText}>
                {formData.stationCode || ('Station')}
              </AppText>
              <AppText style={styles.inlineAsterisk}>*</AppText>
            </View>
            <Icon name="arrow-drop-down" size={24} color="#666" />
          </TouchableOpacity>

          {errors.stationCode && (
            <AppText style={styles.errorTextDropdown}>{errors.stationCode}</AppText>
          )}
        </View>

        <AddressInputWithLocation
          placeholder="Address 1"
          value={formData.address1}
          onChangeText={createFilteredInputHandler('address1', (text) => {
            setFormData(prev => ({ ...prev, address1: text }));
            setErrors(prev => ({ ...prev, address1: null }));
          }, 40)}
          error={errors.address1}
          mandatory={true}
          onLocationSelect={async locationData => {
            const addressParts = locationData.address
              .split(',')
              .map(part => part.trim());
            const extractedPincode = locationData.pincode || '';
            const filteredParts = addressParts.filter(part => {
              return !part.match(/^\d{6}$/) && part.toLowerCase() !== 'india';
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
              setFormData(prev => ({ ...prev, pincode: extractedPincode }));
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
          onChangeText={createFilteredInputHandler('address2', (text) => {
            setFormData(prev => ({ ...prev, address2: text }));
            setErrors(prev => ({ ...prev, address2: null }));
          }, 40)}
          mandatory
          error={errors.address2}
        />

        <CustomInput
          placeholder="Address 3"
          value={formData.address3}
          onChangeText={createFilteredInputHandler('address3', (text) => {
            setFormData(prev => ({ ...prev, address3: text }));
            setErrors(prev => ({ ...prev, address3: null }));
          }, 60)}
          mandatory
          error={errors.address3}
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
          error={errors.pincode}
          mandatory={true}
        />
        {pincodeLoading && (
          <View style={{ marginTop: -10, marginBottom: 10 }}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}

        {/* Area Dropdown */}
        <View style={styles.dropdownContainer}>
          {(formData.area || areas.length > 0) && (
            <AppText style={[styles.floatingLabel, { color: colors.primary }]}>
              Area<AppText style={styles.asteriskPrimary}>*</AppText>
            </AppText>
          )}
          <TouchableOpacity
            style={[styles.dropdown, errors.area && styles.inputError]}
            onPress={() => {
              setShowAreaModal(true);
            }}
          >
            <View style={styles.inputTextContainer}>
              <AppText
                style={
                  formData.area ? styles.inputText : styles.placeholderText
                }
              >
                {formData.area || (areas.length === 0 ? 'Area' : 'Area')}
              </AppText>
              <AppText style={styles.inlineAsterisk}>*</AppText>
            </View>
            <Icon name="arrow-drop-down" size={24} color="#666" />
          </TouchableOpacity>
          {errors.area && (
            <AppText style={styles.errorTextDropdown}>{errors.area}</AppText>
          )}
        </View>

        {/* City - Auto-populated from pincode */}
        <View style={styles.dropdownContainer}>
          {(formData.city || cities.length > 0) && (
            <AppText style={[styles.floatingLabel, { color: colors.primary }]}>
              City<AppText style={styles.asteriskPrimary}>*</AppText>
            </AppText>
          )}
          <TouchableOpacity
            style={[styles.dropdown, errors.city && styles.inputError]}
            onPress={() => {
              setShowCityModal(true);
            }}
          >
            <View style={styles.inputTextContainer}>
              <AppText
                style={
                  formData.city ? styles.inputText : styles.placeholderText
                }
              >
                {formData.city || 'City'}
              </AppText>
              <AppText style={styles.inlineAsterisk}>*</AppText>
            </View>
            <Icon name="arrow-drop-down" size={24} color="#666" />
          </TouchableOpacity>
          {errors.city && (
            <AppText style={styles.errorTextDropdown}>{errors.city}</AppText>
          )}
        </View>

        {/* State - Auto-populated from pincode */}
        <View style={styles.dropdownContainer}>
          {(formData.state || states.length > 0) && (
            <AppText style={[styles.floatingLabel, { color: colors.primary }]}>
              State<AppText style={styles.asteriskPrimary}>*</AppText>
            </AppText>
          )}
          <TouchableOpacity
            style={[styles.dropdown, errors.state && styles.inputError]}
            onPress={() => {
              setShowStateModal(true);
            }}
          >
            <View style={styles.inputTextContainer}>
              <AppText
                style={
                  formData.state ? styles.inputText : styles.placeholderText
                }
              >
                {formData.state || 'State'}
              </AppText>
              <AppText style={styles.inlineAsterisk}>*</AppText>
            </View>
            <Icon name="arrow-drop-down" size={24} color="#666" />
          </TouchableOpacity>
          {errors.state && (
            <AppText style={styles.errorTextDropdown}>{errors.state}</AppText>
          )}
        </View>
      </View>
    </Animated.View>
  );

  const renderSecurityDetails = () => (
    <Animated.View
      style={[
        styles.stepContent,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.section}>
        <AppText style={styles.stepTitle}>
          Security Details<AppText style={{ color: 'red' }}>*</AppText>
        </AppText>
        {/* Mobile Number with Verify */}
        <CustomInput
          placeholder="Mobile number"
          value={formData.mobileNumber}
          onChangeText={createFilteredInputHandler('mobileNumber', (text) => {
            setFormData(prev => ({ ...prev, mobileNumber: text }));
            setErrors(prev => ({ ...prev, mobileNumber: null }));
          }, 10)}
          keyboardType="phone-pad"
          maxLength={10}
          mandatory
          editable={!verificationStatus.mobile}
          rightComponent={
            <TouchableOpacity
              style={[
                styles.inlineVerifyButton,
                verificationStatus.mobile && styles.verifiedButton,
              ]}
              onPress={() => handleVerify('mobile')}
              disabled={verificationStatus.mobile}
            >
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
                    Verify<AppText style={styles.inlineAsterisk}>*</AppText>
                  </>
                )}
              </AppText>
            </TouchableOpacity>
          }
        />
        {errors.mobileNumber && (
          <AppText style={styles.errorText}>{errors.mobileNumber}</AppText>
        )}

        {errors.mobileVerification && (
          <AppText style={styles.errorText}>
            {errors.mobileVerification}
          </AppText>
        )}
        {renderOTPInput('mobile')}
        {/* Email Address with Verify */}
        <CustomInput
          placeholder="Email address"
          value={formData.emailAddress}
          onChangeText={createFilteredInputHandler('emailAddress', (text) => {
            setFormData(prev => ({ ...prev, emailAddress: text.toLowerCase() }));
            setErrors(prev => ({ ...prev, emailAddress: null }));
          }, 241)}
          keyboardType="email-address"
          autoCapitalize="none"
          mandatory
          editable={!verificationStatus.email}
          rightComponent={
            <TouchableOpacity
              style={[
                styles.inlineVerifyButton,
                verificationStatus.email && styles.verifiedButton,
              ]}
              onPress={() => handleVerify('email')}
              disabled={verificationStatus.email}
            >
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
                    Verify<AppText style={styles.inlineAsterisk}>*</AppText>
                  </>
                )}
              </AppText>
            </TouchableOpacity>
          }
        />
        {errors.emailAddress && (
          <AppText style={styles.errorText}>{errors.emailAddress}</AppText>
        )}
        {errors.emailVerification && (
          <AppText style={styles.errorText}>{errors.emailVerification}</AppText>
        )}
        {renderOTPInput('email')}
        {/* Upload PAN */}
        <FileUploadComponent
          placeholder="Upload PAN"
          accept={['pdf', 'jpg', 'png', 'jpeg']}
          maxSize={15 * 1024 * 1024}
          docType={DOC_TYPES.PAN}
          initialFile={formData.panFile}
          onFileUpload={file => handleFileUpload('pan', file)}
          onFileDelete={() => handleFileDelete('pan')}
          errorMessage={errors.panFile}
          mandatory={true}
          onOcrDataExtracted={ocrData => {
            console.log('PAN OCR Data:', ocrData);
            if (ocrData.panNumber) {
              setFormData(prev => ({ ...prev, panNumber: ocrData.panNumber }));
              // Auto-verify when PAN is populated from OCR
              setVerificationStatus(prev => ({ ...prev, pan: true }));
            }
          }}
        />
        {/* PAN Number */}
        <CustomInput
          placeholder="PAN Number"
          value={formData.panNumber}
          onChangeText={createFilteredInputHandler('panNumber', (text) => {
            const upperText = text.toUpperCase();
            setFormData(prev => ({ ...prev, panNumber: upperText }));
            setErrors(prev => ({ ...prev, panNumber: null }));
          }, 10)}
          autoCapitalize="characters"
          keyboardType="default"
          maxLength={10}
          mandatory
          error={errors.panNumber}
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
                  if (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
                    setVerificationStatus(prev => ({ ...prev, pan: true }));
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
                    Verify<AppText style={styles.inlineAsterisk}>*</AppText>
                  </>
                )}
              </AppText>
            </TouchableOpacity>
          }
        />

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
        {/* Upload GST */}
        <FileUploadComponent
          placeholder="Upload GST"
          accept={['pdf', 'jpg', 'png', 'jpeg']}
          maxSize={15 * 1024 * 1024}
          docType={DOC_TYPES.GST}
          initialFile={formData.gstFile}
          onFileUpload={file => handleFileUpload('gst', file)}
          onFileDelete={() => handleFileDelete('gst')}
          errorMessage={errors.gstFile}
          onOcrDataExtracted={ocrData => {
            console.log('GST OCR Data:', ocrData);
            if (ocrData.gstNumber) {
              setFormData(prev => ({ ...prev, gstNumber: ocrData.gstNumber }));
              if (ocrData.isGstValid) {
                setVerificationStatus(prev => ({ ...prev, gst: true }));
              }
            }
          }}
        />
        {/* GST Number Input */}
        <CustomInput
          placeholder="GST Number"
          value={formData.gstNumber}
          onChangeText={createFilteredInputHandler('gstNumber', (text) => {
            const upperText = text.toUpperCase();
            setFormData(prev => ({ ...prev, gstNumber: upperText }));
            setErrors(prev => ({ ...prev, gstNumber: null }));
          }, 15)}
          autoCapitalize="characters"
          maxLength={15}
          error={errors.gstNumber}
        />
      </View>
    </Animated.View>
  );

  const renderMapping = () => (
    <Animated.View
      style={[
        styles.stepContent,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.section}>
        <AppText style={styles.stepTitle}>Mapping</AppText>

        {/* Mark as Buying Entity Switch */}
        <View style={styles.switchContainer}>
          <AppText style={styles.switchLabel}>Mark as buying entity</AppText>
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

        <AppText style={styles.sectionTitle}>Select category</AppText>

        {/* Link Child Hospital */}
        <AppText style={styles.subsectionLabel}>
          Link child hospital<AppText style={{ color: 'red' }}>*</AppText>
          <Icon name="info-outline" size={16} color="#999" />
        </AppText>

        {/* Hospital Selector - Collapsible Summary */}
        {formData.linkedHospitals.length === 0 ? (
          <TouchableOpacity
            style={[
              styles.selectorInput,
              errors.linkedHospitals && styles.inputError,
            ]}
            onPress={() => {
              navigation.navigate('HospitalSelector', {
                selectedHospitals: formData.linkedHospitals,
                allowMultiple: true,
                onSelect: hospitals => {
                  setFormData(prev => ({
                    ...prev,
                    linkedHospitals: hospitals.map(h => ({
                      ...h,
                      pharmacies: h.pharmacies || [],
                    })),
                  }
                  ));
                  setErrors(prev => ({ ...prev, linkedHospitals: null }));
                },
                formType: "PGH"
              });
            }}
            activeOpacity={0.7}
          >
            <AppText style={styles.selectorPlaceholder}>
              Search hospital name/code
            </AppText>
            <ArrowDown color="#333" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.hospitalsSummary}
            onPress={() => {
              navigation.navigate('HospitalSelector', {
                selectedHospitals: formData.linkedHospitals,
                allowMultiple: true,
                onSelect: hospitals => {
                  setFormData(prev => ({
                    ...prev,
                    linkedHospitals: hospitals.map(h => ({
                      ...h,
                      pharmacies: h.pharmacies || [],
                    })),
                  }));
                  setErrors(prev => ({ ...prev, linkedHospitals: null }));
                },
                categoryCode: ["OR", "RCW", "OW", "PRI"]
              });
            }}
            activeOpacity={0.7}
          >
            <AppText style={styles.hospitalsSummaryText}>
              {formData.linkedHospitals.length} Hospital
              {formData.linkedHospitals.length > 1 ? 's' : ''} Selected
            </AppText>
            <ArrowDown height={8} width={8} color="#111" />
          </TouchableOpacity>
        )}
        {errors.linkedHospitals && (
          <AppText style={styles.errorText}>{errors.linkedHospitals}</AppText>
        )}

        {/* Expanded Hospital List with Nested Pharmacies */}
        {formData.linkedHospitals.length > 0 && (
          <View style={styles.hospitalsContainer}>
            {formData.linkedHospitals.map((hospital, index) => (
              <View key={hospital.id || index} style={styles.hospitalAccordion}>
                {/* Hospital Header */}
                <View style={styles.hospitalHeader}>
                  <View style={styles.hospitalHeaderContent}>
                    <AppText style={styles.hospitalName}>
                      {hospital.name}
                    </AppText>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setFormData(prev => ({
                        ...prev,
                        linkedHospitals: prev.linkedHospitals.filter(
                          (_, i) => i !== index,
                        ),
                      }));
                    }}
                    style={styles.removeButton}
                  >
                    <RemoveHospitalCloseIcon
                      width={12}
                      height={12}
                      color="#999"
                    />
                  </TouchableOpacity>
                </View>

                {/* Pharmacies Section - Always Visible */}
                <View style={styles.hospitalContent}>
                  <View style={styles.pharmaciesSection}>
                    {/* Pharmacies Label - Only show when pharmacies exist */}
                    {hospital.pharmacies && hospital.pharmacies.length > 0 && (
                      <AppText style={styles.pharmaciesLabel}>
                        Pharmacies
                      </AppText>
                    )}

                    {/* Selected Pharmacies Tags */}
                    {hospital.pharmacies && hospital.pharmacies.length > 0 && (
                      <View style={styles.pharmaciesTags}>
                        {hospital.pharmacies.map((pharmacy, pIndex) => (
                          <View
                            key={pharmacy.id || pIndex}
                            style={styles.pharmacyTag}
                          >
                            <AppText style={styles.pharmacyTagText}>
                              {pharmacy.name}
                            </AppText>
                            <TouchableOpacity
                              onPress={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  linkedHospitals: prev.linkedHospitals.map(
                                    (h, hIndex) =>
                                      hIndex === index
                                        ? {
                                          ...h,
                                          pharmacies: h.pharmacies.filter(
                                            (_, pIdx) => pIdx !== pIndex,
                                          ),
                                        }
                                        : h,
                                  ),
                                }));
                              }}
                              style={styles.pharmacyTagRemove}
                            >
                              <RemoveHospitalCloseIcon
                                width={12}
                                height={12}
                                color="#666"
                              />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Add Pharmacy Link */}
                    <TouchableOpacity
                      style={styles.addPharmacyLink}
                      onPress={() => {
                        navigation.navigate('PharmacySelector', {
                          parentHospitalName: hospital.name,
                          mappingLabel: "Private - Group Hospital / GBU",
                          mappingName: formData.hospitalName,
                          selectedPharmacies: hospital.pharmacies || [],
                          selectedPharmacies: hospital.pharmacies || [],
                          onSelect: pharmacies => {
                            setFormData(prev => ({
                              ...prev,
                              linkedHospitals: prev.linkedHospitals.map(
                                (h, hIndex) =>
                                  hIndex === index ? { ...h, pharmacies } : h,
                              ),
                            }));
                          },
                          customerGroupId: formData.customerGroupId,
                          mappingFor: "PGH"
                        });
                      }}
                    >
                      <AppText style={styles.addPharmacyLinkText}>
                        + Add Pharmacy
                      </AppText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Add New Hospital Link */}
        <TouchableOpacity
          style={styles.addNewLink}
          onPress={() => setShowAddHospitalModal(true)}
        >
          <AppText style={styles.addNewLinkText}>+ Add New Hospital</AppText>
        </TouchableOpacity>



        <View style={styles.categoryOptions}>

          <TouchableOpacity
            style={[
              styles.checkboxButton,
              formData.selectedCategory.pharmacy && styles.checkboxButtonActive,
            ]}
            onPress={() => setFormData(prev => ({
              ...prev,
              selectedCategory: {
                ...prev.selectedCategory,
                pharmacy: !prev.selectedCategory.pharmacy
              }
            }))}
            activeOpacity={0.7}
          >
            <View style={[
              styles.checkbox,
              formData.selectedCategory.pharmacy && styles.checkboxSelected
            ]}>
              {formData.selectedCategory.pharmacy && (
                <AppText style={styles.checkboxTick}>✓</AppText>
              )}
            </View>
            <AppText style={styles.checkboxLabel}>Pharmacy</AppText>
          </TouchableOpacity>


        </View>

        {formData.selectedCategory.pharmacy && (
          <>
            <View style={styles.pharmacySelectionContainer}>

              <TouchableOpacity
                style={[styles.selectorInput, errors.linkedHospitals && styles.inputError]}
                onPress={() => {
                  navigation.navigate('PharmacySelector', {
                    selectedPharmacies: formData.linkedPharmacies || [],
                    onSelect: (pharmacies) => {
                      setFormData(prev => ({
                        ...prev,
                        linkedPharmacies: pharmacies
                      }));
                    },
                    customerGroupId: formData.customerGroupId,
                    mappingFor: "PGH"
                  });
                }}
                activeOpacity={0.7}
              >

                <AppText style={[
                  styles.selectorPlaceholder,
                  formData.linkedPharmacies.length !== 0 && { color: '#333' }
                ]}>
                  {formData.linkedPharmacies && formData.linkedPharmacies.length > 0
                    ? `${formData.linkedPharmacies.length} Pharmacies Selected`
                    : 'Select pharmacy name/code'}
                </AppText>
                <ArrowDown color='#333' />

              </TouchableOpacity>
            </View>

            {/* Selected Pharmacies Display */}

            {formData.linkedPharmacies.length > 0 && (
              <View style={styles.selectedItemsContainer}>

                {/* Selected Pharmacies List */}
                {formData.linkedPharmacies.map((pharmacy, index) => (


                  <View key={pharmacy.id || index} style={styles.selectedItemChip}>
                    <AppText style={{ color: '#333' }}>{pharmacy.name}  </AppText>
                    <TouchableOpacity
                      onPress={() => {
                        setFormData(prev => ({
                          ...prev,
                          linkedPharmacies: prev.linkedPharmacies.filter((_, i) => i !== index)
                        }));
                      }}
                    >
                      <DoctorDeleteIcon />
                    </TouchableOpacity>
                  </View>

                ))}
              </View>)}

            <TouchableOpacity
              style={styles.addNewLink}
              onPress={() => setShowAddPharmacyModal(true)}
            >
              <AppText style={styles.addNewLinkText}>+ Add New Pharmacy</AppText>
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
          {/* Customer Group - Radio Buttons Grid */}
          <AppText style={styles.sectionLabel}>Customer group</AppText>

          <View style={styles.radioGridContainer}>
            {customerGroups.length > 0
              ? customerGroups
                .filter(group =>
                  ['DOCTOR SUPPLY', 'VQ', 'RFQ', 'GOVT'].includes(
                    group.customerGroupName,
                  ),
                )
                .map(group => {
                  const isEnabled = ['VQ', 'RFQ'].includes(
                    group.customerGroupName,
                  );
                  return (
                    <TouchableOpacity
                      key={group.customerGroupId}
                      style={[
                        styles.radioGridItem,
                        !isEnabled && { opacity: 0.5 },
                      ]}
                      onPress={() => {
                        if (isEnabled) {
                          setFormData(prev => ({
                            ...prev,
                            customerGroup: group.customerGroupName,
                          }));
                        }
                      }}
                      activeOpacity={isEnabled ? 0.7 : 1}
                      disabled={!isEnabled}
                    >
                      <View
                        style={[
                          styles.radioButton,
                          formData.customerGroup ===
                          group.customerGroupName &&
                          styles.radioButtonSelected,
                        ]}
                      >
                        {formData.customerGroup ===
                          group.customerGroupName && (
                            <View style={styles.radioButtonInner} />
                          )}
                      </View>
                      <AppText style={styles.radioButtonLabel}>
                        {group.customerGroupName}
                      </AppText>
                    </TouchableOpacity>
                  );
                })
              : // Fallback if API data not available
              ['9-Doctor Supply', '10-VQ', '11-RFQ', '12-GOVT'].map(group => {
                const isEnabled = ['10-VQ', '11-RFQ'].includes(group);
                return (
                  <TouchableOpacity
                    key={group}
                    style={[
                      styles.radioGridItem,
                      !isEnabled && { opacity: 0.5 },
                    ]}
                    onPress={() => {
                      if (isEnabled) {
                        setFormData(prev => ({
                          ...prev,
                          customerGroup: group,
                        }));
                      }
                    }}
                    activeOpacity={isEnabled ? 0.7 : 1}
                    disabled={!isEnabled}
                  >
                    <View
                      style={[
                        styles.radioButton,
                        formData.customerGroup === group &&
                        styles.radioButtonSelected,
                      ]}
                    >
                      {formData.customerGroup === group && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <AppText style={styles.radioButtonLabel}>{group}</AppText>
                  </TouchableOpacity>
                );
              })}
          </View>
        </View>

        {/* Stockist Suggestions */}
        <AppText style={styles.sectionSubTitle}>
          Stockist Suggestions
          <AppText style={styles.optionalText}> (Optional)</AppText>
        </AppText>

        {/* Stockist List */}
        {stockists.map((stockist, index) => (
          <View key={index} style={styles.stockistCard}>
            {index > 0 && (
              <View style={styles.stockistCardHeader}>
                <TouchableOpacity
                  onPress={() => {
                    setStockists(prev => prev.filter((_, i) => i !== index));
                  }}
                  style={[styles.deleteStockistButton, { marginLeft: 'auto' }]}
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
                  prev.map((s, i) => (i === index ? { ...s, name: text } : s)),
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
                  prev.map((s, i) => (i === index ? { ...s, city: text } : s)),
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
    </Animated.View>
  );

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
      {(isEditMode || isOnboardMode) && (
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
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            isEditMode && { paddingHorizontal: 16 }
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
            {/* License Details */}
            {renderLicenseDetails()}

            {/* General Details */}
            {renderGeneralDetails()}

            {/* Security Details */}
            {renderSecurityDetails()}

            {/* Mapping */}
            {renderMapping()}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Navigation */}
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

            <Animated.View
              style={[{ flex: 1 }, { transform: [{ scale: buttonScaleAnim }] }]}
            >
              <TouchableOpacity
                style={[
                  styles.registerButton,
                  !isFormValid && styles.registerButtonDisabled,
                  loading && styles.disabledButton,
                ]}
                onPress={handleNextStep}
                activeOpacity={0.8}
                disabled={loading}
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
            </Animated.View>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <AppText style={styles.cancelButtonText}>Cancel</AppText>
            </TouchableOpacity>

            <Animated.View
              style={[{ flex: 1 }, { transform: [{ scale: buttonScaleAnim }] }]}
            >
              <TouchableOpacity
                style={[
                  styles.registerButton,
                  !isFormValid && styles.registerButtonDisabled,
                  loading && styles.disabledButton,
                ]}
                onPress={handleNextStep}
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <AppText style={[
                    styles.registerButtonText,
                    !isFormValid && styles.registerButtonTextDisabled,
                  ]}>
                    {isEditMode ? 'Update' : 'Register'}
                  </AppText>
                )}
              </TouchableOpacity>
            </Animated.View>
          </>
        )}
      </View>

      {/* Dropdown Modals */}


      <DropdownModal
        visible={showStationModal}
        onClose={() => setShowStationModal(false)}
        title="Select Station"
        data={
          loggedInUser?.userDetails?.stationCodes?.map((item) => ({
            id: item.stationCode,
            name: item.stationCode,
          }))
        }
        selectedId={formData.stationCode} // <-- match value
        onSelect={item => {

          console.log(item);

          setFormData({
            ...formData,
            stationCode: item.name,  // <-- store directly
          });
          setErrors(prev => ({
            ...prev,
            stationCode: null,
          }));
        }}
      />
      <DropdownModal
        visible={showAreaModal}
        onClose={() => setShowAreaModal(false)}
        title="Select Area"
        data={areas.map(area => ({ id: area.id, name: area.name }))}
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

      <DropdownModal
        visible={showCityModal}
        onClose={() => setShowCityModal(false)}
        title="Select City"
        data={cities.map(c => ({ id: c.id, name: c.name }))}
        selectedId={formData.cityId}
        onSelect={item => {
          setFormData(prev => ({
            ...prev,
            city: item.name,
            cityId: item.id,
          }));
          setErrors(prev => ({ ...prev, city: null }));
        }}
        loading={false}
      />

      <DropdownModal
        visible={showStateModal}
        onClose={() => setShowStateModal(false)}
        title="Select State"
        data={states.map(s => ({ id: s.id, name: s.name }))}
        selectedId={formData.stateId}
        onSelect={item => {
          setFormData(prev => ({
            ...prev,
            state: item.name,
            stateId: item.id,
          }));
          setErrors(prev => ({ ...prev, state: null }));
        }}
        loading={false}
      />

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

      {/* Add New Hospital Modal */}
      <AddNewHospitalModal
        visible={showAddHospitalModal}
        mappingName={formData.hospitalName}
        mappingLabel="Private - Group Hospital / GBU"
        onClose={() => setShowAddHospitalModal(false)}
        onAdd={hospital => {
          setFormData(prev => ({
            ...prev,
            linkedHospitals: [
              ...prev.linkedHospitals,
              { ...hospital, pharmacies: [] },
            ],
          }));
          setShowAddHospitalModal(false);
        }}
      />

      <AddNewPharmacyModal
        visible={showAddPharmacyModal}
        onClose={() => setShowAddPharmacyModal(false)}
        mappingName={formData.hospitalName}
        mappingLabel="Private - Group Hospital / GBU"
        onSubmit={(pharmacy) => {
          console.log('=== Pharmacy Response from AddNewPharmacyModal ===');
          console.log('Full Response:', pharmacy);
          console.log('Pharmacy ID:', pharmacy.id || pharmacy.customerId);
          console.log('=== End Pharmacy Response ===');

          // Create pharmacy object for display
          const newPharmacyItem = {
            id: pharmacy.id || pharmacy.customerId,
            name: pharmacy.pharmacyName || pharmacy.name,
            code: pharmacy.code || ''
          };

          // Add pharmacy to form data with mapping structure
          setFormData(prev => ({
            ...prev,
            linkedPharmacies: [
              ...(prev.linkedPharmacies || []),
              newPharmacyItem
            ],
            mapping: {
              ...prev.mapping,
              pharmacy: [
                ...(prev.mapping?.pharmacy || []),
                {
                  id: pharmacy.id || pharmacy.customerId,
                  isNew: true
                }
              ]
            }
          }));

          setShowAddPharmacyModal(false);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    paddingHorizontal: 0,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  typeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    marginHorizontal: 4,
  },
  typeTagActive: {
    backgroundColor: '#FFF5ED',
  },
  typeTagText: {
    fontSize: 12,
    color: '#666',
  },
  typeTagTextActive: {
    color: colors.primary,
    fontWeight: '500',
  },
  stepIndicatorContainer: {
    paddingHorizontal: 0,
    paddingTop: 20,
    paddingBottom: 10,
  },
  stepIndicatorBar: {
    height: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  stepIndicatorProgress: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  stepLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  stepLabelWrapper: {
    alignItems: 'center',
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepDotActive: {
    backgroundColor: colors.primary,
  },
  stepDotCompleted: {
    backgroundColor: '#4CAF50',
  },
  stepDotText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  stepDotTextActive: {
    color: '#fff',
  },
  stepLabel: {
    fontSize: 11,
    color: '#999',
  },
  stepLabelActive: {
    color: colors.primary,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  stepContent: {
    paddingTop: 8,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    paddingLeft: 12,
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
    marginLeft: 8,
    color: colors.gray,
  },
  inputTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  dropdownContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  floatingLabel: {
    position: 'absolute',
    top: -10,
    left: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 4,
    fontSize: 12,
    color: colors.primary,
    zIndex: 10,
  },
  asteriskPrimary: {
    color: "red",
    fontSize: 16
  },
  mandatoryIndicator: {
    fontSize: 16,
    color: colors.error,
    marginLeft: 4,
    fontWeight: '600',
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
    marginTop: 2,
    marginLeft: 4,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 16,
    marginBottom: 16,
    backgroundColor: '#FFF5ED',
  },
  uploadButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 8,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 16,   // increased from 12 -> 16 to match other inputs
    backgroundColor: '#FFFFFF',
    minHeight: 48,         // ensure height similar to text inputs
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
  sectionSubTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  section: {
    marginBottom: 32,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
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
  subsectionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optional: {
    fontSize: 14,
    fontWeight: '400',
    color: '#999',
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
    color: '#999',
    flex: 1,
  },
  hospitalsSummary: {
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
  hospitalsSummaryText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
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
  linkedHospitalCard: {
    marginBottom: 16,
  },
  linkedHospitalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  linkedHospitalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  linkedHospitalInfo: {
    flex: 1,
  },
  linkedHospitalName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  linkedHospitalCode: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  addNewLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  addNewLinkText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    textDecorationLine: 'underline',
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
    marginRight: 8,
    marginBottom: 8,
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
    textDecorationLine: 'underline',
  },
  bottomNavigation: {
    // flexDirection: 'row',
    // paddingHorizontal: 8,
    // paddingVertical: 16,
    // backgroundColor: '#fff',
    // borderTopWidth: 1,
    // borderTopColor: '#F0F0F0',
    // gap: 12,

    flexDirection: 'row',
    marginTop: 24,
    marginBottom: 32,
    gap: 12,
  },
  backStepButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  backStepButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  nextStepButton: {
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  nextStepButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
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
    maxHeight: '70%',
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
  // Accordion Styles
  hospitalsContainer: {
    marginBottom: 16,
  },
  hospitalAccordion: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    overflow: 'hidden',
  },
  hospitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#FAFAFA',
  },
  hospitalHeaderContent: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  hospitalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  removeButton: {
    padding: 4,
  },
  chevron: {
    marginLeft: 8,
  },
  hospitalContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  pharmaciesSection: {
    marginBottom: 0,
  },
  pharmaciesLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    marginBottom: 10,
  },
  pharmaciesTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  pharmacyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    gap: 6,
  },
  pharmacyTagText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  pharmacyTagRemove: {
    padding: 2,
  },
  addPharmacyLink: {
    padding: 0,
    margin: 0,
  },
  addPharmacyLinkText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  // Radio Button Styles
  radioGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    // marginBottom: 20,
  },
  radioGridItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 0,
    // marginBottom: 16,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  radioButtonLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },

  inlineAsterisk: {
    color: 'red',
    fontSize: 16,
    marginLeft: 2,
  },

  radioButtonContainer: {
    flexDirection: 'row',
    gap: 50,
    flex: 1,
    marginBottom: 16,
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
    marginRight: 8,
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
    borderColor: "#ccc",
  },


});

export default GroupHospitalRegistrationForm;
