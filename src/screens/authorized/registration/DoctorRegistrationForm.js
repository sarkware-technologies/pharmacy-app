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
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import { colors } from '../../../styles/colors';
import CustomInput from '../../../components/CustomInput';
import AddressInputWithLocation from '../../../components/AddressInputWithLocation';
import FileUploadComponent from '../../../components/FileUploadComponent';
import ChevronLeft from '../../../components/icons/ChevronLeft';
import Calendar from '../../../components/icons/Calendar';
import ArrowDown from '../../../components/icons/ArrowDown';
import Search from '../../../components/icons/Search';
import CloseCircle from '../../../components/icons/CloseCircle';
import { customerAPI } from '../../../api/customer';
import { AppText, AppInput } from '../../../components';
import AddNewHospitalModal from './AddNewHospitalModal';
import AddNewPharmacyModal from './AddNewPharmacyModal';
import DoctorDeleteIcon from '../../../components/icons/DoctorDeleteIcon';
import FetchGst from '../../../components/icons/FetchGst';
import { usePincodeLookup } from '../../../hooks/usePincodeLookup';
import FloatingDateInput from '../../../components/FloatingDateInput';
import { validateField, isValidPAN, isValidGST, isValidEmail, isValidMobile, isValidPincode, createFilteredInputHandler, filterForField } from '../../../utils/formValidation';

const { width, height } = Dimensions.get('window');

// Mock data for specialities (you can replace with API data if available)
const MOCK_SPECIALTIES = [
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'Orthopedic',
  'Pediatrician',
  'Gynecologist',
  'Neurologist',
  'Psychiatrist',
  'Dentist',
  'ENT Specialist',
];

// Mock data for areas only (as there's no API for areas)
const MOCK_AREAS = [
  { id: 0, name: 'Vadgaonsheri' },
  { id: 1, name: 'Kharadi' },
  { id: 2, name: 'Viman Nagar' },
  { id: 3, name: 'Kalyani Nagar' },
  { id: 4, name: 'Koregaon Park' },
];

// Document types for file uploads
const DOC_TYPES = {
  CLINIC_REGISTRATION: 10,
  PRACTICE_LICENSE: 8,
  ADDRESS_PROOF: 11,
  CLINIC_IMAGE: 1,
  PAN: 7,
  GST: 2,
};

const DoctorRegistrationForm = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const scrollViewRef = useRef(null);
  const otpRefs = useRef({});
  const route = useRoute();

  // Get registration type data from route params
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
    mode,
    isEditMode,
    customerId,
    customerData: routeCustomerData,
    editData,
    isOnboardMode,
    hidePanGst,
  } = route.params || {};

  // Edit mode detection
  const inEditMode = mode === 'edit' || isEditMode || !!customerId;
  const [loadingCustomerData, setLoadingCustomerData] = useState(false);
  const isMounted = useRef(true);

  // State for license types fetched from API
  const [licenseTypes, setLicenseTypes] = useState({
    CLINIC_REGISTRATION: {
      id: 6,
      docTypeId: 10,
      name: 'Clinic Registration',
      code: 'CLINIC_REG',
    },
    PRACTICE_LICENSE: {
      id: 7,
      docTypeId: 8,
      name: 'Practice License',
      code: 'PRACTICE_LIC',
    },
  });

  // Form state
  const [formData, setFormData] = useState({
    // License Details
    clinicRegistrationNumber: '',
    clinicRegistrationDate: '',
    clinicRegistrationFile: null,

    practiceLicenseNumber: '',
    practiceLicenseDate: '',
    practiceLicenseFile: null,

    addressProofFile: null,
    clinicImageFile: null,

    // General Details
    doctorName: '',
    speciality: '',
    clinicName: '',
    address1: '',
    address2: '',
    address3: '',
    address4: '',
    pincode: '',
    area: '',
    areaId: null, // << ADDED
    city: '',
    cityId: null, // << ADDED
    state: '',
    stateId: null, // << ADDED

    // Security Details
    mobileNumber: '',
    emailAddress: '',
    panNumber: '',
    panFile: null,
    gstNumber: '',
    gstFile: null,

    // Mapping
    markAsBuyingEntity: true,
    selectedCategory: '',
    selectedHospitals: null,
    selectedPharmacies: [],

    // Customer Group
    customerGroupId: 1,

    // Stockist Suggestions
    stockists: [{ name: '', code: '', city: '' }],
  });

  console.log(formData);
  

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Dropdown data
  const [customerGroups, setCustomerGroups] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [allStates, setAllStates] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);

  // States and cities data
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);

  // Pincode lookup hook
  // Pincode lookup hook — use the same names as the hospital example
  const {
    areas,
    cities: pincodeCities,
    states: pincodeStates,
    loading: pincodeLoading,
    lookupByPincode,
    clearData,
  } = usePincodeLookup();


  const [showCancelModal, setShowCancelModal] = useState(false);

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
  const [otpId, setOtpId] = useState({
    mobile: null,
    email: null,
  });
  const [loadingOtp, setLoadingOtp] = useState({
    mobile: false,
    email: false,
  });

  // Verification status
  const [verificationStatus, setVerificationStatus] = useState({
    mobile: false,
    email: false,
    pan: false,
    gst: false,
  });

  // Dropdown modal states
  const [showStateModal, setShowStateModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);

  const [showHospitalModal, setShowHospitalModal] = useState(false);
  const [showPharmacyModal, setShowPharmacyModal] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const otpSlideAnim = useRef(new Animated.Value(-50)).current;

  // Uploaded document IDs
  const [uploadedDocIds, setUploadedDocIds] = useState([]);

  // Uploaded documents with full details including docTypeId
  const [uploadedDocs, setUploadedDocs] = useState([]);

  // Set navigation header - hide default header in edit mode, show custom header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: !inEditMode, // Hide default header in edit mode
      title: inEditMode ? 'Edit' : 'Register',
      headerBackTitleVisible: false,
    });
  }, [navigation, inEditMode]);

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

    // Load initial data (only customer groups and license types, no cities/states)
    loadInitialData();

    // Handle edit mode - fetch customer details
    if (inEditMode) {
      if (routeCustomerData) {
        // Use provided customer data
        populateFormFromCustomerData(routeCustomerData);
      } else if (editData && routeCustomerData) {
        // Use pre-fetched edit data (backward compatibility)
        populateFormFromCustomerData(routeCustomerData);
      } else if (customerId) {
        // Fetch customer details from API
        fetchCustomerDetailsForEdit();
      }
    }

    // Cleanup function to reset states when component unmounts
    return () => {
      isMounted.current = false;
      setLoading(false);
      setShowOTP({ mobile: false, email: false });
      setOtpValues({ mobile: ['', '', '', ''], email: ['', '', '', ''] });
      setOtpTimers({ mobile: 30, email: 30 });
      setVerificationStatus({
        mobile: false,
        email: false,
        pan: false,
        gst: false,
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load states and customer groups on mount
  const loadInitialData = async () => {
    try {
      // Load license types first (for doctors, typeId=3, categoryId=0)
      const licenseResponse = await customerAPI.getLicenseTypes(
        typeId || 3,
        categoryId || 0,
        subCategoryId || 0,
      );
      if (licenseResponse.success && licenseResponse.data) {
        const licenseData = {};
        licenseResponse.data.forEach(license => {
          if (license.code === 'CLINIC_REG' || license.id === 6) {
            licenseData.CLINIC_REGISTRATION = {
              id: license.id,
              docTypeId: license.docTypeId,
              name: license.name,
              code: license.code,
            };
          } else if (license.code === 'PRACTICE_LIC' || license.id === 7) {
            licenseData.PRACTICE_LICENSE = {
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

      // Load states
      setLoadingStates(true);
      const statesResponse = await customerAPI.getStates();
      if (statesResponse.success) {
        const _states = [];
        for (let i = 0; i < statesResponse.data.states.length; i++) {
          _states.push({
            id: statesResponse.data.states[i].id,
            name: statesResponse.data.states[i].stateName,
          });
        }
        setAllStates(_states || []);
      }
    } catch (error) {
      console.error('Error loading states:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load states',
        position: 'top',
      });
    } finally {
      setLoadingStates(false);
    }

    try {
      // Load customer groups
      const groupsResponse = await customerAPI.getCustomerGroups();
      if (groupsResponse.success) {
        setCustomerGroups(groupsResponse.data || []);
      }
    } catch (error) {
      console.error('Error loading customer groups:', error);
    }
  };

  // Fetch customer details for edit mode
  const fetchCustomerDetailsForEdit = async () => {
    if (!customerId) return;

    setLoadingCustomerData(true);
    try {
      const response = await customerAPI.getCustomerDetails(customerId, false);
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

  // Populate form from customer data (API response) - matches PharmacyRetailer.js pattern
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

      // Find license documents (Clinic Registration and Practice License for Doctor)
      const clinicLicense = licenceDetails.licence?.find(l =>
        l.licenceTypeCode === 'CLINIC_REG' ||
        l.licenceTypeCode === 'REG' ||
        l.docTypeId === 10
      );
      const practiceLicense = licenceDetails.licence?.find(l =>
        l.licenceTypeCode === 'PRACTICE_LIC' ||
        l.licenceTypeCode === 'PRLIC' ||
        l.docTypeId === 8
      );

      // Find document files
      const clinicRegDoc = docType.find(d => d.doctypeId === '10' || d.doctypeName === 'CLINIC REGISTRATION');
      const practiceLicDoc = docType.find(d => d.doctypeId === '8' || d.doctypeName === 'PRACTICE LICENSE');
      const addressProofDoc = docType.find(d => d.doctypeId === '11' || d.doctypeName === 'ADDRESS PROOF');
      const clinicImageDoc = docType.find(d => d.doctypeId === '1' || d.doctypeName === 'CLINIC IMAGE');
      const panDoc = docType.find(d => d.doctypeId === '7' || d.doctypeName === 'PAN CARD');
      const gstDoc = docType.find(d => d.doctypeId === '2' || d.doctypeName === 'GSTIN');

      // Populate form data
      setFormData(prev => ({
        ...prev,
        // License Details
        clinicRegistrationNumber: clinicLicense?.licenceNo || '',
        clinicRegistrationDate: formatDate(clinicLicense?.licenceValidUpto),
        clinicRegistrationFile: clinicRegDoc ? {
          fileName: clinicRegDoc.fileName || 'CLINIC REGISTRATION',
          s3Path: clinicRegDoc.s3Path || '',
          docId: clinicRegDoc.docId || '',
        } : null,
        practiceLicenseNumber: practiceLicense?.licenceNo || '',
        practiceLicenseDate: formatDate(practiceLicense?.licenceValidUpto),
        practiceLicenseFile: practiceLicDoc ? {
          fileName: practiceLicDoc.fileName || 'PRACTICE LICENSE',
          s3Path: practiceLicDoc.s3Path || '',
          docId: practiceLicDoc.docId || '',
        } : null,
        addressProofFile: addressProofDoc ? {
          fileName: addressProofDoc.fileName || 'ADDRESS PROOF',
          s3Path: addressProofDoc.s3Path || '',
          docId: addressProofDoc.docId || '',
        } : null,
        clinicImageFile: clinicImageDoc ? {
          fileName: clinicImageDoc.fileName || 'CLINIC IMAGE',
          s3Path: clinicImageDoc.s3Path || '',
          docId: clinicImageDoc.docId || '',
        } : null,

        // General Details
        doctorName: generalDetails.ownerName || '',
        speciality: generalDetails.specialist || '',
        clinicName: generalDetails.customerName || '',
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

        // Security Details
        mobileNumber: securityDetails.mobile || '',
        emailAddress: securityDetails.email || '',
        panNumber: securityDetails.panNumber || '',
        panFile: panDoc ? {
          fileName: panDoc.fileName || 'PAN CARD',
          s3Path: panDoc.s3Path || '',
          docId: panDoc.docId || '',
        } : null,
        gstNumber: securityDetails.gstNumber || '',
        gstFile: gstDoc ? {
          fileName: gstDoc.fileName || 'GSTIN',
          s3Path: gstDoc.s3Path || '',
          docId: gstDoc.docId || '',
        } : null,

        // Customer group
        customerGroupId: groupDetails.customerGroupId || 1,
        markAsBuyingEntity: data.isBuyer || false,
      }));

      // Set document IDs for existing documents
      if (clinicRegDoc) {
        setUploadedDocIds(prev => [...prev, clinicRegDoc.docId]);
      }
      if (practiceLicDoc) {
        setUploadedDocIds(prev => [...prev, practiceLicDoc.docId]);
      }
      if (addressProofDoc) {
        setUploadedDocIds(prev => [...prev, addressProofDoc.docId]);
      }
      if (clinicImageDoc) {
        setUploadedDocIds(prev => [...prev, clinicImageDoc.docId]);
      }
      if (panDoc) {
        setUploadedDocIds(prev => [...prev, panDoc.docId]);
      }
      if (gstDoc) {
        setUploadedDocIds(prev => [...prev, gstDoc.docId]);
      }

      // Set verification status
      setVerificationStatus({
        mobile: data.isMobileVerified || false,
        email: data.isEmailVerified || false,
        pan: !!panDoc,
        gst: !!gstDoc,
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

  useEffect(() => {
    if (
      pincodeCities &&
      pincodeCities.length > 0 &&
      pincodeStates &&
      pincodeStates.length > 0
    ) {
      const firstCity = pincodeCities[0];
      const firstState = pincodeStates[0];

      setFormData(prev => ({
        ...prev,
        city: firstCity.name,
        cityId: firstCity.id,
        state: firstState.name,
        stateId: firstState.id,
      }));
    }

    if (areas && areas.length > 0 && !formData.area) {
      const firstArea = areas[0];
      setFormData(prev => ({
        ...prev,
        area: firstArea.name,
        areaId: firstArea.id,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pincodeCities, pincodeStates, areas]);

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
    // Validate the field before showing OTP
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

    // Reset OTP state for this field before generating new OTP
    setOtpValues(prev => ({ ...prev, [field]: ['', '', '', ''] }));
    setOtpTimers(prev => ({ ...prev, [field]: 30 }));
    setShowOTP(prev => ({ ...prev, [field]: false }));

    try {
      setLoadingOtp(prev => ({ ...prev, [field]: true }));

      const payload = {};

      if (field === 'mobile') {
        payload.mobile = formData.mobileNumber;
      } else {
        payload.email = formData.emailAddress;
      }

      const response = await customerAPI.generateOTP(payload);

      if (response.success) {
        setShowOTP(prev => ({ ...prev, [field]: true }));
        setOtpTimers(prev => ({ ...prev, [field]: 30 }));

        // Store OTP ID for validation
        if (response.data?.id) {
          setOtpId(prev => ({ ...prev, [field]: response.data.id }));
        }

        // Auto-fill OTP if provided in response (for testing)
        if (response.data?.otp) {
          const otpString = response.data.otp.toString();
          const otpArray = otpString.split('').slice(0, 4);
          const newOtpValues = { ...otpValues };
          newOtpValues[field] = [...otpArray, '', '', ''].slice(0, 4);
          setOtpValues(newOtpValues);

          // Auto-submit OTP after a delay
          setTimeout(() => {
            handleOtpVerification(field, response.data.otp);
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
        // Check for existing customer
        if (
          !response.success &&
          response.data &&
          Array.isArray(response.data)
        ) {
          const existingCustomer = response.data[0];
          Toast.show({
            type: 'error',
            text1: 'Customer Exists',
            text2: `Customer already exists with this ${field}`,
            position: 'top',
          });

          // Check if already verified
          if (field === 'mobile' && existingCustomer.isMobileVerified) {
            setVerificationStatus(prev => ({ ...prev, mobile: true }));
          }
          if (field === 'email' && existingCustomer.isEmailVerified) {
            setVerificationStatus(prev => ({ ...prev, email: true }));
          }
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: response.message || 'Failed to generate OTP',
            position: 'top',
          });
        }
      }
    } catch (error) {
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

  const handleOtpVerification = async (field, otp) => {
    try {
      setLoadingOtp(prev => ({ ...prev, [field]: true }));

      const payload = {};

      if (field === 'mobile') {
        payload.mobile = formData.mobileNumber;
      } else {
        payload.email = formData.emailAddress;
      }

      const response = await customerAPI.validateOTP(otp, payload);

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

        // Reset OTP values for this field
        setOtpValues(prev => ({
          ...prev,
          [field]: ['', '', '', ''],
        }));

        // Reset OTP timer
        setOtpTimers(prev => ({
          ...prev,
          [field]: 30,
        }));
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.message || 'Invalid OTP. Please try again.',
          position: 'top',
        });
      }
    } catch (error) {
      console.error('Error validating OTP:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2:
          error.response?.data?.message ||
          error.message ||
          'Failed to verify OTP. Please try again.',
        position: 'top',
      });
    } finally {
      setLoadingOtp(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleResendOTP = async field => {
    setOtpTimers(prev => ({ ...prev, [field]: 30 }));
    await handleVerify(field);
  };





  const loadCities = async (stateId = null) => {
    setLoadingCities(true);
    try {
      const response = await customerAPI.getCities(stateId);
      if (response.success && response.data) {
        const _cities = [];
        for (let i = 0; i < response.data.cities.length; i++) {
          _cities.push({
            id: response.data.cities[i].id,
            name: response.data.cities[i].cityName,
          });
        }
        setCities(_cities || []);
      }
    } catch (error) {
      console.error('Failed to load cities:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load cities',
        position: 'top',
      });
    } finally {
      setLoadingCities(false);
    }
  };



  const formatDate = dateString => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
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

  const handleFileUpload = (field, file) => {
    setFormData(prev => ({ ...prev, [field]: file }));
    setErrors(prev => ({ ...prev, [field]: null }));

    // Add doc ID to uploaded list
    // For edit mode: include docId if it's an existing file
    if (file && (file.id || file.docId)) {
      const fileId = file.id || file.docId;
      setUploadedDocIds(prev => [...prev, fileId]);

      // Add complete document object to uploaded list with docTypeId
      const docObject = {
        s3Path: file.s3Path || file.uri,
        docTypeId: file.docTypeId,
        fileName: file.fileName || file.name,
        id: file.id || file.docId, // Use id for new uploads, docId for existing files
        ...(file.docId ? { docId: file.docId } : {}), // Include docId if it exists
      };
      // Remove old doc if it exists (for edit mode file replacement)
      if (inEditMode && file.docId) {
        setUploadedDocs(prev => prev.filter(doc => doc.docId !== file.docId && doc.id !== file.docId));
      }
      setUploadedDocs(prev => [...prev, docObject]);
    }
  };

  const handleFileDelete = field => {
    const file = formData[field];
    // Handle both new uploads (file.id) and existing files from edit mode (file.docId)
    if (file && (file.id || file.docId)) {
      const fileId = file.id || file.docId;
      setUploadedDocIds(prev => prev.filter(id => id !== fileId));
      setUploadedDocs(prev => prev.filter(doc => doc.id !== fileId && doc.docId !== fileId));
    }
    setFormData(prev => ({ ...prev, [field]: null }));
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  // Handle OCR extracted data for clinic/practice license uploads
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
  const handleLicenseOcrData = async (ocrData) => {
    console.log('OCR Data Received:', ocrData);

    const updates = {};

    // Populate clinic name if available
    if (ocrData.clinicName && !formData.clinicName) {
      updates.clinicName = filterForField('clinicName', ocrData.clinicName, 40);
    }
    
     if (ocrData.pharmacyName && !formData.clinicName) {
                        updates.clinicName = filterForField('clinicName', ocrData.pharmacyName, 40);
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

    // Populate registration/license number if available
    if (ocrData.registrationNumber && !formData.clinicRegistrationNumber) {
      updates.clinicRegistrationNumber = filterForField('clinicRegistrationNumber', ocrData.registrationNumber, 20);
    } else if (ocrData.licenseNumber) {
      if (!formData.clinicRegistrationNumber) {
        updates.clinicRegistrationNumber = filterForField('clinicRegistrationNumber', ocrData.licenseNumber, 20);
      } else if (!formData.practiceLicenseNumber) {
        updates.practiceLicenseNumber = filterForField('practiceLicenseNumber', ocrData.licenseNumber, 20);
      }
    }

    

    // Populate registration/issue date if available
    if (ocrData.issueDate && !formData.clinicRegistrationDate) {
      const parts = ocrData.issueDate.split('-');
      if (parts.length === 3) {
        const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
        updates.clinicRegistrationDate = formattedDate;
      }
    }

    // Populate expiry date if available
    if (ocrData.expiryDate) {
      const parts = ocrData.expiryDate.split('-');
      if (parts.length === 3) {
        const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
        // Try to populate clinic registration expiry first, then practice license expiry
        if (!formData.clinicRegistrationDate) {
          // If no registration date, use expiry date as registration date (some forms use expiry as registration)
          updates.clinicRegistrationDate = formattedDate;
        } else if (!formData.practiceLicenseExpiryDate) {
          updates.practiceLicenseExpiryDate = formattedDate;
        }
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

  const validateForm = () => {
    const newErrors = {};

    // License Details validation
    if (!formData.clinicRegistrationNumber) {
      newErrors.clinicRegistrationNumber =
        'Clinic registration number is required';
    }
    if (!formData.clinicRegistrationDate) {
      newErrors.clinicRegistrationDate = 'Expiry date is required';
    }
    if (!formData.clinicRegistrationFile) {
      newErrors.clinicRegistrationFile =
        'Clinic registration certificate is required';
    }
    if (!formData.practiceLicenseNumber) {
      newErrors.practiceLicenseNumber = 'Practice license number is required';
    }
    if (!formData.practiceLicenseDate) {
      newErrors.practiceLicenseDate = 'Expiry date is required';
    }
    if (!formData.practiceLicenseFile) {
      newErrors.practiceLicenseFile = 'Practice license is required';
    }
    if (!formData.addressProofFile) {
      newErrors.addressProofFile = 'Address proof is required';
    }

    // General Details validation using reusable validation utility
    const doctorNameError = validateField('nameOfDoctor', formData.doctorName, true, 'Doctor name is required');
    if (doctorNameError) newErrors.doctorName = doctorNameError;

    const specialityError = validateField('speciality', formData.speciality, true, 'Speciality is required');
    if (specialityError) newErrors.speciality = specialityError;

    const address1Error = validateField('address1', formData.address1, true, 'Address 1 is required');
    if (address1Error) newErrors.address1 = address1Error;

    const address2Error = validateField('address2', formData.address2, true, 'Address 2 is required');
    if (address2Error) newErrors.address2 = address2Error;

    const address3Error = validateField('address3', formData.address3, true, 'Address 3 is required');
    if (address3Error) newErrors.address3 = address3Error;

    const pincodeError = validateField('pincode', formData.pincode, true, 'Valid 6-digit pincode is required');
    if (pincodeError) newErrors.pincode = pincodeError;
    if (formData.pincode && /^0+$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode cannot be all zeros';
    }

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

    if (!formData.markAsBuyingEntity && formData.selectedPharmacies.length === 0) {
      newErrors.pharmaciesMapping = "Pharmacy mapping is mandatory for non buying entities";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check form validity whenever form data, document IDs, or verification status changes
  useEffect(() => {
    // Validate required fields
    let isValid = true;
    if (!formData.clinicRegistrationNumber) isValid = false;
    else if (!formData.clinicRegistrationDate) isValid = false;
    else if (!formData.clinicRegistrationFile) isValid = false;
    else if (!formData.practiceLicenseNumber) isValid = false;
    else if (!formData.practiceLicenseDate) isValid = false;
    else if (!formData.practiceLicenseFile) isValid = false;
    else if (!formData.addressProofFile) isValid = false;
    else if (!formData.clinicImageFile) isValid = false;
    else if (!formData.doctorName) isValid = false;
    else if (!formData.speciality || formData.speciality.trim().length === 0) isValid = false;
    else if (!formData.clinicName) isValid = false;
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
    else if (formData.gstNumber && formData.gstNumber.trim() !== '' && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNumber)) isValid = false;

    setIsFormValid(isValid);
  }, [formData, verificationStatus]);

  const handleCancel = () => {
    if (inEditMode) {
      // In edit mode, navigate to CustomerStack which contains CustomerList
      navigation.navigate('CustomerStack', { screen: 'CustomerList' });
    } else {
      // In registration mode, show cancel confirmation modal
      setShowCancelModal(true);
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill all required fields and complete verifications',
        position: 'top',
      });
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    setLoading(true);

    try {
      // Prepare customerDocs array with proper structure
      const prepareCustomerDocs = () => {
        return uploadedDocs.map(doc => ({
          s3Path: doc.s3Path,
          docTypeId: String(doc.docTypeId),
          fileName: doc.fileName,
          ...(inEditMode && customerId ? {
            customerId: String(customerId),
            id: String(doc.docId || doc.id || ''),
          } : {
            id: String(doc.id || ''),
          }),
        }));
      };

      // Prepare registration payload for Doctor
      const registrationData = {
        typeId: typeId || 3, // Doctor type ID
        categoryId: categoryId || 0,
        subCategoryId: subCategoryId || 0,
        isMobileVerified: verificationStatus.mobile,
        isEmailVerified: verificationStatus.email,
        isExisting: false,
        licenceDetails: {
          registrationDate: new Date().toISOString(),
          licence: [
            {
              licenceTypeId: licenseTypes.CLINIC_REGISTRATION?.id || 6,
              licenceNo: formData.clinicRegistrationNumber,
              licenceValidUpto: formatDateForAPI(formData.clinicRegistrationDate),
              hospitalCode: '',
            },
            {
              licenceTypeId: licenseTypes.PRACTICE_LICENSE?.id || 7,
              licenceNo: formData.practiceLicenseNumber,
              licenceValidUpto: formatDateForAPI(formData.practiceLicenseDate),
              hospitalCode: '',
            },
          ],
        },
        customerDocs: prepareCustomerDocs(),
        isBuyer: formData.markAsBuyingEntity,
        customerGroupId: formData.customerGroupId,
        generalDetails: {
          name: formData.doctorName,
          address1: formData.address1,
          address2: formData.address2 || '',
          address3: formData.address3 || '',
          address4: formData.address4 || '',
          pincode: parseInt(formData.pincode, 10),
          area: formData.area || '',
          areaId: formData.areaId ? parseInt(formData.areaId, 10) : null,
          cityId: parseInt(formData.cityId, 10),
          stateId: parseInt(formData.stateId, 10),
          clinicName: formData.clinicName || '',
          specialist: formData.speciality,
          ownerName: '',
        },
        securityDetails: {
          mobile: formData.mobileNumber,
          email: formData.emailAddress,
          panNumber: formData.panNumber,
          ...(formData.gstNumber ? { gstNumber: formData.gstNumber } : {}),
        },
        ...(formData.stockists &&
          formData.stockists.length > 0 && {
          suggestedDistributors: formData.stockists.map(stockist => ({
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
        ...(inEditMode && customerId ? { customerId: parseInt(customerId, 10) } : {}),
      };

      console.log(inEditMode ? 'Update data:' : 'Registration data:', registrationData);

      let response;
      if (inEditMode && customerId) {
        // Update existing customer - use POST to create endpoint with customerId in payload
        response = await customerAPI.createCustomer(registrationData);
      } else {
        // Create new customer
        response = await customerAPI.createCustomer(registrationData);
      }

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: inEditMode ? 'Update Successful' : 'Registration Successful',
          text2: response.message || (inEditMode ? 'Customer details updated successfully' : 'Doctor registered successfully!'),
          position: 'top',
        });

        // Navigate to success screen for both create and edit
        navigation.navigate('RegistrationSuccess', {
          type: 'doctor',
          registrationCode: inEditMode ? customerId : (response.data?.id || response.data?.data?.id || 'SUCCESS'),
          codeType: 'Doctor',
          ...(inEditMode ? { isEditMode: true } : { customerId: response.data?.id }),
        });
      } else {
        // Handle validation errors
        if (response.message && Array.isArray(response.message)) {
          const errorMessage = response.message.join('\n');
          Toast.show({
            type: 'error',
            text1: 'Registration Failed',
            text2: errorMessage,
            position: 'top',
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Registration Failed',
            text2:
              response.details ||
              'Failed to register doctor. Please try again.',
            position: 'top',
          });
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error + '. Please try again.',
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddStockist = () => {
    if (formData.stockists.length >= 4) {
      Toast.show({
        type: 'error',
        text1: 'Limit Reached',
        text2: 'You can only add up to 4 stockists.',
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      stockists: [...prev.stockists, { name: '', code: '', city: '' }],
    }));
  };

  const handleRemoveStockist = index => {
    setFormData(prev => ({
      ...prev,
      stockists: prev.stockists.filter((_, i) => i !== index),
    }));
  };

  const handleStockistChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      stockists: prev.stockists.map((stockist, i) =>
        i === index ? { ...stockist, [field]: value } : stockist,
      ),
    }));
  };


  console.log(formData);

  // DropdownModal Component
  // eslint-disable-next-line react/no-unstable-nested-components
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
                      <Icon name="check" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <AppText style={styles.emptyText}>
                    No {title} available
                  </AppText>
                }
                style={styles.modalList}
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

      {/* Custom Header for Edit Mode */}
      {inEditMode && (
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate('CustomerStack', { screen: 'CustomerList' })}
            style={styles.backButton}
          >
            <ChevronLeft />
          </TouchableOpacity>
          <AppText style={styles.headerTitle}>Edit</AppText>
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
            {/* Registration Type Section - Only shown in onboard mode */}
            {isOnboardMode && (
              <View style={styles.section}>
                {' '}
                <AppText style={styles.sectionTitle}>Registration Type</AppText>
                <View style={styles.disabledInputContainer}>
                  <AppText style={styles.disabledInputText}>
                    {`${type || ''} - ${category || ''}${subCategory ? ` - ${subCategory}` : ''
                      }`.trim()}
                  </AppText>
                </View>
              </View>
            )}

            {/* License Details Section */}
            <View style={[styles.section, styles.sectionTopSpacing]}>
              <AppText style={styles.sectionTitle}>
                License Details
                <AppText style={styles.mandatoryIndicator}>*</AppText>
              </AppText>

              <AppText style={styles.sectionLabel}>
                Clinic registration
                <AppText style={styles.mandatoryIndicator}>*</AppText>
              </AppText>

              <FileUploadComponent
                placeholder="Upload Certificate"
                accept={['pdf', 'jpg', 'png', 'jpeg']}
                maxSize={15 * 1024 * 1024}
                docType={
                  licenseTypes.CLINIC_REGISTRATION?.docTypeId ||
                  DOC_TYPES.CLINIC_REGISTRATION
                }
                initialFile={formData.clinicRegistrationFile}
                onFileUpload={file =>
                  handleFileUpload('clinicRegistrationFile', file)
                }
                onFileDelete={() => handleFileDelete('clinicRegistrationFile')}
                onOcrDataExtracted={handleLicenseOcrData}
                errorMessage={errors.clinicRegistrationFile}
              />

              <CustomInput
                placeholder="Clinic registration number"
                value={formData.clinicRegistrationNumber}
                onChangeText={createFilteredInputHandler('clinicRegistrationNumber', (text) => {
                  setFormData(prev => ({
                    ...prev,
                    clinicRegistrationNumber: text,
                  }));
                  setErrors(prev => ({
                    ...prev,
                    clinicRegistrationNumber: null,
                  }));
                }, 20)}
                error={errors.clinicRegistrationNumber}
                autoCapitalize="characters"
                mandatory={true}
              />




              <FloatingDateInput
                label="Expiry Date"
                mandatory={true}
                value={formData.clinicRegistrationDate}
                error={errors.clinicRegistrationDate}
                minimumDate={new Date()}    // If future date only (optional)
                onChange={(date) => {
                  setFormData(prev => ({ ...prev, clinicRegistrationDate: date }));
                  setErrors(prev => ({ ...prev, clinicRegistrationDate: null }));
                }}
              />
              <AppText style={[styles.sectionLabel, { marginTop: 20 }]}>
                Practice license
                <AppText style={styles.mandatoryIndicator}>*</AppText>
              </AppText>

              <FileUploadComponent
                placeholder="Upload"
                accept={['pdf', 'jpg', 'png', 'jpeg']}
                maxSize={15 * 1024 * 1024}
                docType={
                  licenseTypes.PRACTICE_LICENSE?.docTypeId ||
                  DOC_TYPES.PRACTICE_LICENSE
                }
                initialFile={formData.practiceLicenseFile}
                onFileUpload={file =>
                  handleFileUpload('practiceLicenseFile', file)
                }
                onFileDelete={() => handleFileDelete('practiceLicenseFile')}
                onOcrDataExtracted={handleLicenseOcrData}
                errorMessage={errors.practiceLicenseFile}
              />

              <CustomInput
                placeholder="Practice license number"
                value={formData.practiceLicenseNumber}
                onChangeText={createFilteredInputHandler('practiceLicenseNumber', (text) => {
                  setFormData(prev => ({
                    ...prev,
                    practiceLicenseNumber: text,
                  }));
                  setErrors(prev => ({ ...prev, practiceLicenseNumber: null }));
                }, 20)}
                error={errors.practiceLicenseNumber}
                autoCapitalize="characters"
                mandatory={true}
              />



              <FloatingDateInput
                label="Expiry Date"
                mandatory={true}
                value={formData.practiceLicenseDate}
                error={errors.practiceLicenseDate}
                minimumDate={new Date()}    // If future date only (optional)
                onChange={(date) => {
                  setFormData(prev => ({ ...prev, practiceLicenseDate: date }));
                  setErrors(prev => ({ ...prev, practiceLicenseDate: null }));
                }}
              />

              <AppText style={[styles.sectionLabel, { marginTop: 20 }]}>
                Address proof
                <AppText style={styles.mandatoryIndicator}>*</AppText>
              </AppText>

              <FileUploadComponent
                placeholder="Upload Electricity/Telephone bill"
                accept={['pdf', 'jpg', 'png', 'jpeg']}
                maxSize={15 * 1024 * 1024}
                docType={DOC_TYPES.ADDRESS_PROOF}
                initialFile={formData.addressProofFile}
                onFileUpload={file =>
                  handleFileUpload('addressProofFile', file)
                }
                onFileDelete={() => handleFileDelete('addressProofFile')}
                errorMessage={errors.addressProofFile}
              />

              <AppText style={[styles.sectionLabel, { marginTop: 20 }]}>
                Clinic image
                <AppText style={styles.mandatoryIndicator}>*</AppText>
              </AppText>

              <FileUploadComponent
                placeholder="Upload"
                accept={['jpg', 'png', 'jpeg']}
                maxSize={15 * 1024 * 1024}
                docType={DOC_TYPES.CLINIC_IMAGE}
                initialFile={formData.clinicImageFile}
                onFileUpload={file => handleFileUpload('clinicImageFile', file)}
                onFileDelete={() => handleFileDelete('clinicImageFile')}
              />


            </View>

            {/* General Details Section */}
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>
                General Details
                <AppText style={styles.mandatoryIndicator}>*</AppText>
              </AppText>

              <CustomInput
                placeholder="Name of the doctor"
                value={formData.doctorName}
                onChangeText={createFilteredInputHandler('doctorName', (text) => {
                  setFormData(prev => ({ ...prev, doctorName: text }));
                  setErrors(prev => ({ ...prev, doctorName: null }));
                }, 40)}
                error={errors.doctorName}
                mandatory={true}
              />

              {/* Speciality Input Field */}
              <CustomInput
                placeholder="Speciality"
                value={formData.speciality}
                onChangeText={createFilteredInputHandler('speciality', (text) => {
                  setFormData(prev => ({ ...prev, speciality: text }));
                  setErrors(prev => ({ ...prev, speciality: null }));
                }, 40)}
                error={errors.speciality}
                mandatory={true}
              />

              {/* Clinic Name */}
              <CustomInput
                placeholder="Clinic Name"
                value={formData.clinicName}
                onChangeText={createFilteredInputHandler('clinicName', (text) => {
                  setFormData(prev => ({ ...prev, clinicName: text }));
                  setErrors(prev => ({ ...prev, clinicName: null }));
                }, 40)}
              />

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
                  console.log('Location selected:', locationData);

                  // Update address field only
                  setFormData(prev => ({
                    ...prev,
                    address1: locationData.address,
                  }));

                  // Split address by commas for other address fields
                  const addressParts = locationData.address
                    .split(',')
                    .map(part => part.trim());
                  const filteredParts = addressParts.filter(
                    part =>
                      part.toLowerCase() !== 'india' &&
                      part !== locationData.pincode,
                  );

                  // Fill remaining address fields
                  if (filteredParts.length > 1) {
                    setFormData(prev => ({
                      ...prev,
                      address2: filteredParts[1] || '',
                    }));
                  }
                  if (filteredParts.length > 2) {
                    setFormData(prev => ({
                      ...prev,
                      address3: filteredParts[2] || '',
                    }));
                  }
                  if (filteredParts.length > 3) {
                    setFormData(prev => ({
                      ...prev,
                      address4: filteredParts[3] || '',
                    }));
                  }

                  // Update pincode and trigger lookup (this will populate area, city, state)
                  if (locationData.pincode) {
                    setFormData(prev => ({
                      ...prev,
                      pincode: locationData.pincode,
                    }));
                    setErrors(prev => ({ ...prev, pincode: null }));
                    // Trigger pincode lookup to populate area, city, state
                    await lookupByPincode(locationData.pincode);
                  }

                  // Clear all address field errors
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
                mandatory={true}
                error={errors.address2}
              />

              <CustomInput
                placeholder="Address 3"
                value={formData.address3}
                onChangeText={createFilteredInputHandler('address3', (text) =>
                  setFormData(prev => ({ ...prev, address3: text })), 60
                )}
                mandatory={true}
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
                  <AppText
                    style={[styles.floatingLabel, { color: colors.primary }]}
                  >
                    Area<AppText style={styles.asteriskPrimary}>*</AppText>
                  </AppText>
                )}
                <TouchableOpacity
                  style={[styles.dropdown, errors.area && styles.inputError]}
                  onPress={() => setShowAreaModal(true)}
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
                  <Icon name="arrow-drop-down" size={24} color="#666" />
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
                  style={[styles.dropdown, errors.city && styles.inputError]}
                  onPress={() => {
                    setShowCityModal(true);
                  }}
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
                  <Icon name="arrow-drop-down" size={24} color="#666" />
                </TouchableOpacity>
                {errors.city && (
                  <AppText style={styles.errorTextDropdown}>{errors.city}</AppText>
                )}
              </View>

              {/* State - Auto-populated from pincode */}
              <View style={styles.dropdownContainer}>
                {(formData.state || states.length > 0) && (
                  <AppText
                    style={[styles.floatingLabel, { color: colors.primary }]}
                  >
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
                        formData.state
                          ? styles.inputText
                          : styles.placeholderText
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

            {/* Security Details Section */}
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>
                Security Details
                <AppText style={styles.mandatoryIndicator}>*</AppText>
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

              {/* PAN and GST fields - Hidden in onboard mode */}
              {!hidePanGst && (
                <>
                  <FileUploadComponent
                    placeholder="Upload PAN"
                    accept={['pdf', 'jpg', 'png', 'jpeg']}
                    maxSize={15 * 1024 * 1024}
                    docType={DOC_TYPES.PAN}
                    initialFile={formData.panFile}
                    onFileUpload={file => handleFileUpload('panFile', file)}
                    onFileDelete={() => handleFileDelete('panFile')}
                    mandatory={true}
                    errorMessage={errors.panFile}
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
                    error={errors.panNumber}
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
                              /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(
                                formData.panNumber,
                              )
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
                      <AppText style={styles.linkText}>
                        Fetch GST from PAN
                      </AppText>
                    </TouchableOpacity>
                  )}

                  {/* GST Upload */}
                  <FileUploadComponent
                    placeholder="Upload GST"
                    accept={['pdf', 'jpg', 'png', 'jpeg']}
                    maxSize={15 * 1024 * 1024}
                    docType={DOC_TYPES.GST}
                    initialFile={formData.gstFile}
                    onFileUpload={file => handleFileUpload('gstFile', file)}
                    onFileDelete={() => handleFileDelete('gstFile')}
                    onOcrDataExtracted={ocrData => {
                      console.log('GST OCR Data:', ocrData);
                      if (ocrData.gstNumber) {
                        setFormData(prev => ({
                          ...prev,
                          gstNumber: ocrData.gstNumber,
                        }));
                        // Auto-verify if valid GST
                        if (ocrData.isGstValid) {
                          setVerificationStatus(prev => ({
                            ...prev,
                            gst: true,
                          }));
                        }
                      }
                    }}
                  />

                  <CustomInput
                    placeholder="GST number"
                    value={formData.gstNumber}
                    //
                    onChangeText={createFilteredInputHandler('gstNumber', (text) => {
                      const upperText = text.toUpperCase();
                      setFormData(prev => ({ ...prev, gstNumber: upperText }));
                      setErrors(prev => ({ ...prev, gstNumber: null }));
                    }, 15)}
                    autoCapitalize="characters"
                    keyboardType="default"
                    maxLength={15}
                    error={errors.gstNumber}
                  />
                </>
              )}
            </View>

            {/* Mapping Section */}
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>
                Mapping{' '}
                <AppText style={styles.optionalText}> (Optional)</AppText>
              </AppText>

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

              {/* <AppText style={styles.sectionLabel}>Select category <AppText style={styles.optional}>(Optional)</AppText></AppText> */}

              <View
                style={[styles.categoryOptions, styles.radioButtonContainer]}
              >
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    formData.selectedCategory === 'Hospital' &&
                    styles.radioButtonActive,
                  ]}
                  onPress={() =>
                    setFormData(prev => ({
                      ...prev,
                      selectedCategory: 'Hospital',
                    }))
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.radioOuter}>
                    {formData.selectedCategory === 'Hospital' && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <AppText style={styles.radioLabel}>Hospital</AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    formData.selectedCategory === 'Pharmacy' &&
                    styles.radioButtonActive,
                  ]}
                  onPress={() =>
                    setFormData(prev => ({
                      ...prev,
                      selectedCategory: 'Pharmacy',
                    }))
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.radioOuter}>
                    {formData.selectedCategory === 'Pharmacy' && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <AppText style={styles.radioLabel}>Pharmacy</AppText>
                </TouchableOpacity>
              </View>

              {/* Hospital Selector - Show when Hospital is selected */}
              {formData.selectedCategory === 'Hospital' && (
                <>
                  <TouchableOpacity
                    style={styles.hospitalSelectorDropdown}
                    onPress={() => {
                      navigation.navigate('HospitalSelector', {
                        selectedHospitals: formData.selectedHospitals
                          ? [formData.selectedHospitals]
                          : [],
                        onSelect: hospitals => {
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


                      {formData.selectedHospitals && formData.selectedHospitals.length > 0
                        ? formData.selectedHospitals.map(h => h.name).join(', ')
                        : 'Search hospital name/code'}



                    </AppText>
                    <Icon name="arrow-drop-down" size={24} color="#333" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.addNewHospitalLink}
                    onPress={() => setShowHospitalModal(true)}
                  >
                    <AppText style={styles.addNewHospitalLinkText}>
                      + Add New Hospital
                    </AppText>
                  </TouchableOpacity>
                </>
              )}

              {/* Pharmacy Selector - Show when Pharmacy is selected */}
              {formData.selectedCategory === 'Pharmacy' && (
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
                    <AppText style={[
                      styles.selectorPlaceholder,
                      formData.selectedPharmacies.length !== 0 && { color: '#333' }
                    ]}>
                      {formData.selectedPharmacies && formData.selectedPharmacies.length > 0
                        ? `${formData.selectedPharmacies.length} Pharmacies Selected`
                        : 'Select pharmacy name/code'}
                    </AppText>
                    <ArrowDown color='#333' />
                  </TouchableOpacity>
                  {formData.selectedPharmacies.length > 0 && (
                    <View style={styles.selectedItemsContainer}>
                      {/* Selected Pharmacies List */}
                      {formData.selectedPharmacies.map((pharmacy, index) => (
                        <View
                          key={pharmacy.id || index}
                          style={styles.selectedItemChip}
                        >
                          <AppText style={{ color: '#333' }}>{pharmacy.name} </AppText>
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
                <AppText style={styles.customerGroupLabel}>
                  Customer group
                </AppText>
                <View style={styles.radioGroupContainer}>
                  <View style={styles.radioRow}>
                    <TouchableOpacity
                      style={[styles.radioOption, styles.radioOptionFlex]}
                      onPress={() =>
                        setFormData(prev => ({ ...prev, customerGroupId: 1 }))
                      }
                    >
                      <View style={styles.radioCircle}>
                        {formData.customerGroupId === 1 && (
                          <View style={styles.radioSelected} />
                        )}
                      </View>
                      <AppText style={styles.radioText}>
                        9 Doctor Supply
                      </AppText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.radioOption,
                        styles.radioOptionFlex,
                        styles.disabledOption,
                      ]}
                      disabled={true}
                    >
                      <View
                        style={[styles.radioCircle, styles.disabledRadio]}
                      ></View>
                      <AppText style={[styles.radioText, styles.disabledText]}>
                        10 VQ
                      </AppText>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.radioRow}>
                    <TouchableOpacity
                      style={[
                        styles.radioOption,
                        styles.radioOptionFlex,
                        styles.disabledOption,
                      ]}
                      disabled={true}
                    >
                      <View
                        style={[styles.radioCircle, styles.disabledRadio]}
                      ></View>
                      <AppText style={[styles.radioText, styles.disabledText]}>
                        11 RFQ
                      </AppText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.radioOption,
                        styles.radioOptionFlex,
                        styles.disabledOption,
                      ]}
                      disabled={true}
                    >
                      <View
                        style={[styles.radioCircle, styles.disabledRadio]}
                      ></View>
                      <AppText style={[styles.radioText, styles.disabledText]}>
                        12 GOVT
                      </AppText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* Stockist Suggestions Section */}
            <View style={styles.section}>
              <AppText style={styles.sectionSubTitle}>
                Stockist Suggestions
                <AppText style={styles.optionalText}> (Optional)</AppText>
              </AppText>

              {/* <AppText style={styles.helperText}>
                Add suggested stockists for this doctor
              </AppText> */}

              {formData.stockists.map((stockist, index) => (
                <View key={index} style={styles.stockistContainer}>
                  {index > 0 && (
                    <View style={styles.stockistHeader}>
                      <TouchableOpacity
                        onPress={() => handleRemoveStockist(index)}
                        style={{ marginLeft: 'auto' }}
                      >
                        <Icon name="delete" size={20} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  )}
                  <CustomInput
                    placeholder="Name of the Stockist"
                    value={stockist.name}
                  onChangeText={createFilteredInputHandler('nameOfStockist', (text) =>
                                      handleStockistChange(index, 'name', text), 40
                                      )}
                  />
                  <CustomInput
                    placeholder="Distributor Code"
                    value={stockist.code}
                      onChangeText={createFilteredInputHandler('distributorCode', (text) =>
                                        handleStockistChange(index, 'code', text), 20
                                        )}
                  />
                  <CustomInput
                    placeholder="City"
                    value={stockist.city}
                      onChangeText={createFilteredInputHandler('distributorCity', (text) =>
                                      handleStockistChange(index, 'city', text), 40
                                      )}
                  />
                </View>
              ))}

              {formData.stockists.length < 4 && (
                <TouchableOpacity onPress={handleAddStockist}>
                  <AppText style={styles.addMoreButtonText}>
                    + Add More Stockist
                  </AppText>
                </TouchableOpacity>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
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
                  loading && styles.disabledButton,
                ]}
                onPress={handleRegister}
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
            </View>
          </Animated.View>
        </ScrollView>

        <DropdownModal
          visible={showAreaModal}
          onClose={() => setShowAreaModal(false)}
          title="Select Area"
          data={areas}
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
      </KeyboardAvoidingView>

      <DropdownModal
        visible={showStateModal}
        onClose={() => setShowStateModal(false)}
        title="Select State"
        data={pincodeStates} // << CHANGED
        selectedId={formData.stateId}
        onSelect={item => {
          setFormData(prev => ({
            ...prev,
            stateId: item.id,
            state: item.name,
            // don't reset city here — user may pick
          }));
          setErrors(prev => ({ ...prev, stateId: null }));
        }}
        loading={false}
      />

      <DropdownModal
        visible={showCityModal}
        onClose={() => setShowCityModal(false)}
        title="Select City"
        data={pincodeCities} // << CHANGED
        selectedId={formData.cityId}
        onSelect={item => {
          setFormData(prev => ({
            ...prev,
            cityId: item.id,
            city: item.name,
          }));
          setErrors(prev => ({ ...prev, cityId: null }));
        }}
        loading={pincodeLoading}
      />

      {/* Add New Hospital Modal */}
      <AddNewHospitalModal
        visible={showHospitalModal}
        onClose={() => setShowHospitalModal(false)}
        mappingName={formData.doctorName}
        mappingLabel="Doctor"
        onSubmit={hospital => {
          console.log('=== Hospital Response from AddNewHospitalModal ===');
          console.log('Full Response:', hospital);
          console.log('Hospital ID:', hospital.id || hospital.customerId);
          console.log('=== End Hospital Response ===');
          const hospitalData = {
            id: hospital.id || hospital.customerId,
            name: hospital.name || hospital.hospitalName,
            code: hospital.code || hospital.shortName,
            customerId: hospital.id || hospital.customerId,
            stateId: hospital.stateId,
            cityId: hospital.cityId,
            area: hospital.area,
            city: hospital.city,
            state: hospital.state,
            mobileNumber: hospital.mobileNumber,
            emailAddress: hospital.emailAddress,
            isNew: true,
            ...hospital,
          };

          setFormData(prev => ({
            ...prev,
            selectedHospitals: [
              ...(prev.selectedHospitals || []),
              hospitalData,
            ],
          }));
          setShowHospitalModal(false);
          // Handle hospital submission if needed
          Toast.show({
            type: 'success',
            text1: 'Hospital Added',
            text2: 'Hospital has been added successfully',
            position: 'top',
          });
        }}
      />

      {console.log(formData)
      }

      {/* Add New Pharmacy Modal */}
      <AddNewPharmacyModal
        visible={showPharmacyModal}
        onClose={() => setShowPharmacyModal(false)}
        mappingName={formData.doctorName}
        mappingLabel="Doctor"
        onSubmit={pharmacy => {


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

          setFormData(prev => ({
            ...prev,
            selectedPharmacies: [
              ...(prev.selectedPharmacies || []),
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


          setShowPharmacyModal(false);
          // Handle pharmacy submission if needed
          Toast.show({
            type: 'success',
            text1: 'Pharmacy Added',
            text2: 'Pharmacy has been added successfully',
            position: 'top',
          });
        }}
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
  disabledInputContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
  },
  disabledInputText: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    paddingHorizontal: 0,
    paddingTop: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTopSpacing: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    paddingLeft: 12,
  },
  sectionSubTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
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
    backgroundColor: '#FAFAFA',
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
    marginLeft: 8,
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
  verifiedButton: {
    // backgroundColor: '#E8F5E9',
  },
  disabledButton: {
    opacity: 0.6,
  },
  inlineVerifyText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
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
  optional: {
    fontSize: 14,
    fontWeight: '400',
    color: '#999',
  },
  optionalText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#999',
  },
  categoryOptions: {
    marginBottom: 20,
  },
  radioButtonContainer: {
    flexDirection: 'row',
    gap: 50,
    flex: 1,
    marginBottom: 16,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
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
  radioLabel: {
    fontSize: 16,
    color: '#333',
  },
  customerGroupContainer: {
    // flexDirection: 'row',
    // flexWrap: 'wrap',
    // gap: 8,
    // marginBottom: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
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
    backgroundColor: '#FAFAFA',
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
  stockistContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 0,
    marginBottom: 16,
  },
  stockistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stockistTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  addMoreButton: {
    paddingVertical: 8,
  },
  addMoreButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
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
  mandatoryIndicator: {
    color: 'red',
    fontSize: 16,
    marginLeft: 2,
  },
  inputTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  inlineAsterisk: {
    color: 'red',
    fontSize: 16,
    marginLeft: 2,
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
  emptyText: {
    textAlign: 'center',
    paddingVertical: 40,
    fontSize: 16,
    color: '#999',
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

  // New dropdown and radio styles
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
    marginBottom: 2,
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
  },
  dropdownPlaceholder: {
    color: '#999',
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  customerGroupLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  radioGroupContainer: {
    // marginVertical: 12,
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginBottom: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    // marginBottom: 8,
  },
  radioOptionFlex: {
    flex: 1,
    marginRight: 16,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  radioText: {
    fontSize: 14,
    color: '#333',
  },
  disabledOption: {
    opacity: 0.5,
  },
  disabledRadio: {
    backgroundColor: '#E8E8E8',
    borderColor: '#CCCCCC',
  },
  disabledText: {
    color: '#999999',
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
  asteriskPrimary: {
    color: "red",
    fontSize: 16
  }
});

export default DoctorRegistrationForm;
