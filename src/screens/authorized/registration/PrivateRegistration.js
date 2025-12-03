/* eslint-disable no-dupe-keys */
import React, { useState, useRef, useEffect } from 'react';
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
import { AppText, AppInput } from "../../../components"
import DoctorDeleteIcon from '../../../components/icons/DoctorDeleteIcon';
import FetchGst from '../../../components/icons/FetchGst';

const { width, height } = Dimensions.get('window');

// Mock data for areas only (as there's no API for areas)
const MOCK_AREAS = ['Vadgaonsheri', 'Kharadi', 'Viman Nagar', 'Kalyani Nagar', 'Koregaon Park'];

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
    customerData,
    isStaging
  } = route.params || {};

  // Determine if we're in edit mode - check multiple flags for backward compatibility
  const inEditMode = mode === 'edit' || isEditMode || !!customerId;

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
    markAsBuyingEntity: false,
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
  const [stockists, setStockists] = useState([{ name: '', code: '', city: '' }]);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingCustomerData, setLoadingCustomerData] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Store original type data when editing
  const [originalTypeData, setOriginalTypeData] = useState({
    typeId: null,
    typeName: '',
    categoryId: null,
    categoryName: '',
    subCategoryId: null,
    subCategoryName: '',
  });

  // Location data from APIs
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [customerGroups, setCustomerGroups] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

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

  useEffect(() => {
    console.log('🚀 PrivateRegistration Form Mounted');
    console.log('📦 Route Params:', {
      mode,
      isEditMode,
      customerId,
      hasEditData: !!editData,
      hasCustomerData: !!customerData,
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

    // Load initial data (states, license types, customer groups)
    loadInitialData();
    loadCities();

    // EFFICIENT EDIT MODE HANDLING
    // If editData is already provided (from onboard/edit button), use it directly
    // This avoids an additional API call
    if (inEditMode && editData) {
      console.log('✅ Using pre-fetched edit data (efficient mode)');
      console.log('📋 Edit Data Preview:', {
        customerId: editData.customerId,
        name: editData.name,
        clinicName: editData.clinicName,
        mobile: editData.mobile,
        email: editData.email,
      });
      populateFormFromEditData(editData);
    }
    // Fallback: If in edit mode but no editData provided, fetch from API
    else if (inEditMode && customerId) {
      console.log('⚠️ Fetching customer details from API (fallback mode)');
      console.log('🆔 Customer ID:', customerId);
      fetchCustomerDetails();
    } else {
      console.log('🆕 Creating new registration (not edit mode)');
    }
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
    setStockists(prev => [...prev, { name: '', distributorCode: '', city: '' }]);

  };
  const loadCities = async () => {
    setLoadingCities(true);
    try {
      const response = await customerAPI.getCities();
      if (response.success && response.data) {
        const _cities = [];
        for (let i = 0; i < response.data.cities.length; i++) {
          _cities.push({ id: response.data.cities[i].id, name: response.data.cities[i].cityName });
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

  // EFFICIENT: Populate form using pre-fetched and transformed data
  const populateFormFromEditData = (data) => {
    try {
      console.log('🔍 Populating form with edit data:', JSON.stringify(data, null, 2));

      // Store original type data
      if (customerData) {
        console.log('📋 Setting original type data from customerData');
        setOriginalTypeData({
          typeId: customerData.typeId,
          typeName: customerData.customerType,
          categoryId: customerData.categoryId,
          categoryName: customerData.customerCategory,
          subCategoryId: customerData.subCategoryId,
          subCategoryName: customerData.customerSubcategory,
        });
      }

      // Populate form data - Map from transformed data structure
      const updatedFormData = {
        // Registration details - from licences array
        registrationNumber: data.licences?.[0]?.licenceNo || '',
        registrationDate: data.licences?.[0]?.licenceValidUpto ?
          new Date(data.licences?.[0]?.licenceValidUpto).toLocaleDateString('en-IN') : '',

        // General details - from transformed flat structure
        clinicName: data.clinicName || data.name || '',  // clinicName or fallback to name (customerName)
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

      console.log('✅ Form data being set:', JSON.stringify(updatedFormData, null, 2));
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

      // Load cities if state is present
      if (data.stateId) {
        console.log('🌆 Loading cities for stateId:', data.stateId);
        loadCities(data.stateId);
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

  // Function to fetch and populate customer details for editing
  const fetchCustomerDetails = async () => {
    setLoadingCustomerData(true);
    try {
      const response = await customerAPI.getCustomerDetails(customerId, isStaging);

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
              id: doc.docId
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
        if (customer.licenceDetails?.licence && customer.licenceDetails.licence.length > 0) {
          registrationNumber = customer.licenceDetails.licence[0].licenceNo || '';
        }

        // Map customer group
        let customerGroup = 'X';
        if (customerGroups && customerGroups.length > 0) {
          const group = customerGroups.find(g => g.customerGroupId === customer.groupDetails?.customerGroupId);
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
          customerGroup = customerGroupMapping[customer.groupDetails?.customerGroupId] || 'X';
        }

        // Get suggested distributors
        let stockistSuggestion = '';
        let distributorCode = '';
        let stockistCity = '';

        if (customer.suggestedDistributors && customer.suggestedDistributors.length > 0) {
          const distributor = customer.suggestedDistributors[0];
          stockistSuggestion = distributor.distributorName || '';
          distributorCode = distributor.distributorCode || '';
          stockistCity = distributor.city || '';
        }

        // Process mapping data
        const hasGroupHospitals = customer.mapping?.groupHospitals && customer.mapping.groupHospitals.length > 0;
        const hasPharmacies = customer.mapping?.pharmacy && customer.mapping.pharmacy.length > 0;

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

        // Load cities for the selected state
        if (customer.generalDetails?.stateId) {
          fetchCities(customer.generalDetails.stateId);
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
      const licenseResponse = await customerAPI.getLicenseTypes(typeId || 2, categoryId || 4, subCategoryId || 1);
      if (licenseResponse.success && licenseResponse.data) {
        const licenseData = {};
        licenseResponse.data.forEach(license => {
          // For Private Hospital, we typically have Registration license type
          // Adjust mapping based on actual API response
          if (license.id === 7 || license.code === 'REG' || license.code === 'REGISTRATION') {
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
      // Load states
      setLoadingStates(true);
      const statesResponse = await customerAPI.getStates();
      if (statesResponse.success && statesResponse.data && statesResponse.data.states) {
        const _states = [];
        for (let i = 0; i < statesResponse.data.states.length; i++) {
          _states.push({
            id: statesResponse.data.states[i].id,
            name: statesResponse.data.states[i].stateName
          });
        }
        setStates(_states || []);
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
      // Load ALL cities initially (no state dependency)
      setLoadingCities(true);
      const citiesResponse = await customerAPI.getCities();
      if (citiesResponse.success && citiesResponse.data && citiesResponse.data.cities) {
        const _cities = citiesResponse.data.cities.map(city => ({
          id: city.id,
          name: city.cityName,
          stateId: city.stateId
        }));
        setCities(_cities || []);
      }
    } catch (error) {
      console.error('Error loading cities:', error);
    } finally {
      setLoadingCities(false);
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

  // Fetch states from API
  const fetchStates = async () => {
    setLoadingStates(true);
    try {
      const response = await customerAPI.getStates();
      if (response.success && response.data && response.data.states) {
        setStates(response.data.states);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to load states',
          text2: 'Please try again later',
          position: 'top',
        });
      }
    } catch (error) {
      console.error('Error fetching states:', error);
      Toast.show({
        type: 'error',
        text1: 'Error loading states',
        text2: 'Please check your connection',
        position: 'top',
      });
    } finally {
      setLoadingStates(false);
    }
  };

  // Fetch cities based on selected state
  const fetchCities = async (stateId) => {
    setLoadingCities(true);
    try {
      const response = await customerAPI.getCities(stateId);
      if (response.success && response.data) {
        // Transform API response to match DropdownModal format
        const _cities = [];
        if (response.data.cities && Array.isArray(response.data.cities)) {
          for (let i = 0; i < response.data.cities.length; i++) {
            _cities.push({
              id: response.data.cities[i].id,
              name: response.data.cities[i].cityName
            });
          }
        }
        console.log(_cities, 'cities')
        setCities(_cities || []);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to load cities',
          text2: 'Please try again later',
          position: 'top',
        });
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      Toast.show({
        type: 'error',
        text1: 'Error loading cities',
        text2: 'Please check your connection',
        position: 'top',
      });
    } finally {
      setLoadingCities(false);
    }
  };

  // Handle state selection - NO RESET of city/area
  const handleStateSelect = (state) => {
    setFormData(prev => ({
      ...prev,
      stateId: state.id,
      state: state.name,
    }));
    setErrors(prev => ({ ...prev, state: null }));
    // Fetch cities for selected state (but don't clear existing selection)
    fetchCities(state.id);
  };

  // Handle city selection - NO RESET of area
  const handleCitySelect = (city) => {
    setFormData(prev => ({
      ...prev,
      cityId: city.id,
      city: city.name,
    }));
    setErrors(prev => ({ ...prev, city: null }));
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

  const handleVerify = async (field) => {
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
        if (!formData.mobileNumber || formData.mobileNumber.length !== 10) {
          Toast.show({
            type: 'error',
            text1: 'Invalid Mobile Number',
            text2: 'Please enter a valid 10-digit mobile number',
            position: 'top',
          });
          return;
        }
        if (!/^[6-9]/.test(formData.mobileNumber)) {
          Toast.show({
            type: 'error',
            text1: 'Invalid Mobile Number',
            text2: 'Please enter valid 10-digit mobile number',
            position: 'top',
          });
          return;
        }
        requestData.mobile = formData.mobileNumber;
      } else if (field === 'email') {
        if (!formData.emailAddress || !formData.emailAddress.includes('@')) {
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
          text2: `OTP sent to your ${field === 'mobile' ? 'mobile number' : 'email address'}`,
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
        if (response.statusCode === 302 && response.data && response.data.length > 0) {
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
        text2: error.message || 'Failed to send OTP. Please check your connection and try again.',
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
          text2: `${field === 'mobile' ? 'Mobile number' : 'Email address'} verified successfully!`,
          position: 'top',
        });

        // Update verification status
        setVerificationStatus(prev => ({ ...prev, [field]: true }));

        // Hide OTP input
        setShowOTP(prev => ({ ...prev, [field]: false }));

        // Reset OTP values for this field
        setOtpValues(prev => ({
          ...prev,
          [field]: ['', '', '', '']
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

  const handleResendOTP = async (field) => {
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

      console.log("working");
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



    // General Details validation
    if (!formData.clinicName) {
      newErrors.clinicName = 'Clinic name is required';
    }
    if (!formData.address1) {
      newErrors.address1 = 'Address is required';
    }
    if (!formData.address2) {
      newErrors.address2 = 'Address 2 is required';
    }
    if (!formData.address3) {
      newErrors.address3 = 'Address 3 is required';
    }
    if (!formData.pincode || !/^[1-9]\d{5}$/.test(formData.pincode)) {
      newErrors.pincode = 'Valid 6-digit pincode is required';
    }
    if (!formData.area || formData.area.trim().length === 0) {
      newErrors.area = 'Area is required';
    }
    if (!formData.cityId) {
      newErrors.city = 'City is required';
    }
    if (!formData.stateId) {
      newErrors.state = 'State is required';
    }

    // Security Details validation
    if (!formData.mobileNumber || formData.mobileNumber.length !== 10) {
      newErrors.mobileNumber = 'Valid 10-digit mobile number is required';
    }
    if (!formData.emailAddress || !formData.emailAddress.includes('@')) {
      newErrors.emailAddress = 'Valid email address is required';
    }

    // PAN validation
    if (!formData.panNumber || formData.panNumber.trim() == '') {
      newErrors.panNumber = 'PAN number is required';
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
      newErrors.panNumber = 'Invalid PAN format (e.g., ABCDE1234F)';
    }

    // GST is optional - only validate if provided
    if (formData.gstNumber && formData.gstNumber.trim() != '') {
      if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNumber)) {
        newErrors.gstNumber = 'Invalid GST format (e.g., 27ASDSD1234F1Z5)';
      }
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const getCustomerGroupId = (groupName) => {
    // If we have customer groups from API, use them
    if (customerGroups && customerGroups.length > 0) {
      const group = customerGroups.find(g => g.customerGroupName === groupName);
      return group ? group.customerGroupId : 1;
    }

    // Fallback to static mapping if API data not available
    const groupMap = {
      'X': 1,
      'Y': 2,
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
      const registrationDate = formData.registrationDate ?
        new Date(formData.registrationDate.split('/').reverse().join('-')).toISOString() :
        new Date().toISOString();

      // Use original type data for edit mode, or route params for new registration
      const finalTypeId = isEditMode ? originalTypeData.typeId : (typeId || 2);
      const finalCategoryId = isEditMode ? originalTypeData.categoryId : (categoryId || 4);
      const finalSubCategoryId = isEditMode ? originalTypeData.subCategoryId : (subCategoryId || 1);

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
          licence: [{
            licenceTypeId: licenseTypes.REGISTRATION?.id || 7, // Use dynamic license type ID
            licenceNo: formData.registrationNumber,
            licenceValidUpto: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(), // 1 year validity
          }]
        },
        customerDocs: [],
        isBuyer: formData.markAsBuyingEntity,
        customerGroupId: getCustomerGroupId(formData.customerGroup),
        generalDetails: {
          name: formData.clinicName,
          shortName: formData.shortName || formData.clinicName.substring(0, 10),
          address1: formData.address1,
          address2: formData.address2 || '',
          address3: formData.address3 || '',
          address4: formData.address4 || '',
          pincode: parseInt(formData.pincode),
          area: formData.area || 'Default',
          cityId: formData.cityId, // Use actual cityId from API
          stateId: formData.stateId, // Use actual stateId from API
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
            "distributorCode": stockist.code,
            "distributorName": stockist.name,
            "city": stockist.city,
            "customerId": stockist.name,
          }))
        }),
        isChildCustomer: false
      };

      // If editing, add the customerId to the payload
      if (isEditMode) {
        requestPayload.id = customerId;
      }

      console.log('Registration payload:', requestPayload);

      // Call create or update customer API
      const response = isEditMode ?
        await customerAPI.updateCustomer(customerId, requestPayload) :
        await customerAPI.createCustomer(requestPayload);

      if (response.success && response.data) {
        Toast.show({
          type: 'success',
          text1: isEditMode ? 'Update Successful' : 'Registration Successful',
          text2: isEditMode ?
            `Customer updated successfully` :
            `Customer registered with code: ${response.data.code || response.data.id}`,
          visibilityTime: 5000,
          position: 'top',

        });

        // Navigate to success page or back to list
        if (isEditMode) {
          navigation.goBack();
        } else {
          navigation.navigate('RegistrationSuccess', {
            customerCode: response?.data?.id || `HOSP ${response.data.id}`,
            customerId: response?.data?.id,
          });
        }
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


  const handleDateChange = (event, selectedDate) => {
    // close immediately
    setShowDatePicker(false);

    // 🚫 Cancel clicked → do nothing
    if (event.type === 'dismissed') {
      return;
    }

    // ✅ OK clicked → update date
    if (event.type === 'set' && selectedDate) {
      const formattedDate = selectedDate.toLocaleDateString('en-IN');
      setFormData(prev => ({
        ...prev,
        registrationDate: formattedDate,
      }));
      setErrors(prev => ({
        ...prev,
        registrationDate: null,
      }));
    }
  };


  const renderOTPInput = (field) => {
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
              ref={ref => otpRefs.current[`otp-${field}-${index}`] = ref}
              style={styles.otpInput}
              value={otpValues[field][index]}
              onChangeText={(value) => handleOtpChange(field, index, value)}
              keyboardType="numeric"
              maxLength={1}
            />
          ))}
        </View>
        <View style={styles.otpFooter}>
          <AppText style={styles.otpTimer}>
            {otpTimers[field] > 0 ? `Resend OTP in ${otpTimers[field]}s` : (
              <TouchableOpacity onPress={() => handleResendOTP(field)}>
                <AppText style={styles.resendText}>Resend OTP</AppText>
              </TouchableOpacity>
            )}
          </AppText>
        </View>
      </Animated.View>
    );
  };

  // DropdownModal Component
  const DropdownModal = ({ visible, onClose, title, data, selectedId, onSelect, loading }) => {
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
              <ActivityIndicator size="large" color={colors.primary} style={styles.modalLoader} />
            ) : (
              <FlatList
                data={data}
                keyExtractor={(item) => item.id?.toString() || item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      selectedId == item.id && styles.modalItemSelected
                    ]}
                    onPress={() => {
                      onSelect(item);
                      onClose();
                    }}
                  >
                    <AppText style={[
                      styles.modalItemText,
                      selectedId == item.id && styles.modalItemTextSelected
                    ]}>
                      {item.name || item.stateName || item.cityName}
                    </AppText>
                    {selectedId == item.id && (
                      <Icon name="check" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
                style={styles.modalList}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  // Show loading spinner while fetching customer data
  if (loadingCustomerData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText style={styles.loadingText}>Loading customer details...</AppText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      <KeyboardAvoidingView
        style={styles.flexContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
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
              <AppText style={styles.sectionTitle}>License Details<AppText style={styles.asteriskRed}>*</AppText></AppText>

              {/* Registration Certificate Upload */}
              <FileUploadComponent
                placeholder="Upload registration certificate"
                accept={['pdf', 'jpg', 'jpeg', 'png']}
                maxSize={15 * 1024 * 1024} // 15MB
                docType={DOC_TYPES.LICENSE_CERTIFICATE}
                initialFile={formData.licenseFile}
                onFileUpload={(file) => {
                  setFormData(prev => ({ ...prev, licenseFile: file }));
                  setErrors(prev => ({ ...prev, licenseFile: null }));
                }}
                onFileDelete={() => {
                  setFormData(prev => ({ ...prev, licenseFile: null }));
                }}
                onOcrDataExtracted={(ocrData) => {
                  console.log('OCR Data Received:', ocrData);
                  const updates = {};

                  if (ocrData.hospitalName && !formData.clinicName) {
                    updates.clinicName = ocrData.hospitalName;
                  }
                  if (ocrData.address && !formData.address1) {
                    updates.address1 = ocrData.address;
                  }
                  if (ocrData.registrationNumber && !formData.registrationNumber) {
                    updates.registrationNumber = ocrData.registrationNumber;
                  }
                  if (ocrData.issueDate && !formData.registrationDate) {
                    const parts = ocrData.issueDate.split('-');
                    if (parts.length === 3) {
                      updates.registrationDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                    }
                  }
                  if (ocrData.city && !formData.city) {
                    updates.city = ocrData.city;
                  }
                  if (ocrData.state && !formData.state) {
                    updates.state = ocrData.state;
                  }
                  if (ocrData.pincode && !formData.pincode) {
                    updates.pincode = ocrData.pincode;
                  }
                  if (ocrData.area && !formData.area) {
                    updates.area = ocrData.area;
                  }

                  if (Object.keys(updates).length > 0) {
                    setFormData(prev => ({ ...prev, ...updates }));
                    const errorUpdates = {};
                    Object.keys(updates).forEach(key => {
                      errorUpdates[key] = null;
                    });
                    setErrors(prev => ({ ...prev, ...errorUpdates }));
                  }
                }}
                errorMessage={errors.licenseFile}
              />

              <CustomInput
                placeholder="Hospital Registration Number"
                value={formData.registrationNumber}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, registrationNumber: text }))
                  setErrors(prev => ({ ...prev, registrationNumber: null }))
                }}
                error={errors.registrationNumber}
                autoCapitalize="characters"
                mandatory={true}
              />

              <TouchableOpacity
                style={[styles.input, errors.registrationDate && styles.inputError]}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <View style={styles.inputTextContainer}>
                  <AppText style={formData.registrationDate ? styles.inputText : styles.placeholderText}>
                    {formData.registrationDate || 'Registration Date'}
                  </AppText>
                  <AppText style={styles.inlineAsterisk}>*</AppText>
                </View>
                <Calendar />
              </TouchableOpacity>
              {errors.registrationDate && (
                <AppText style={styles.errorText}>{errors.registrationDate}</AppText>
              )}

              <AppText style={styles.sectionSubTitle}>Image<AppText style={styles.asteriskRed}>*</AppText> <Icon name="information-circle-outline" size={16} color="#999" />
              </AppText>

              <FileUploadComponent
                placeholder="Upload"
                accept={['jpg', 'jpeg', 'png']}
                maxSize={15 * 1024 * 1024} // 15MB
                docType={DOC_TYPES.CLINIC_IMAGE}
                initialFile={formData.licenseImage}
                onFileUpload={(file) => {
                  setFormData(prev => ({ ...prev, licenseImage: file }));
                  setErrors(prev => ({ ...prev, licenseImage: null }));
                }}
                onFileDelete={() => {
                  setFormData(prev => ({ ...prev, licenseImage: null }));
                }}
                errorMessage={errors.licenseImage}
              />

              {showDatePicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
            </View>

            {/* General Details Section */}
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>General Details<AppText style={styles.asteriskRed}>*</AppText></AppText>

              <CustomInput
                placeholder="Enter hospital Name"
                value={formData.clinicName}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, clinicName: text }))
                  setErrors(prev => ({ ...prev, clinicName: null }))
                }}
                error={errors.clinicName}
                mandatory={true}
              />

              <CustomInput
                placeholder="Enter short Name"
                value={formData.shortName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, shortName: text }))}
              />

              <AddressInputWithLocation
                placeholder="Address 1"
                value={formData.address1}
                onChangeText={(text) => setFormData(prev => ({ ...prev, address1: text }))}
                error={errors.address1}
                mandatory={true}
                onLocationSelect={(locationData) => {
                  const addressParts = locationData.address.split(',').map(part => part.trim());
                  const extractedPincode = locationData.pincode || '';
                  const filteredParts = addressParts.filter(part => {
                    return !part.match(/^\d{6}$/) && part.toLowerCase() !== 'india';
                  });
                  const matchedState = states.find(s => s.name.toLowerCase() === locationData.state.toLowerCase());
                  const matchedCity = cities.find(c => c.name.toLowerCase() === locationData.city.toLowerCase());
                  setFormData(prev => ({
                    ...prev,
                    address1: filteredParts[0] || '',
                    address2: filteredParts[1] || '',
                    address3: filteredParts[2] || '',
                    address4: filteredParts.slice(3).join(', ') || '',
                    pincode: extractedPincode,
                    area: locationData.area || '',
                    ...(matchedState && { stateId: matchedState.id, state: matchedState.name }),
                    ...(matchedCity && { cityId: matchedCity.id, city: matchedCity.name }),
                  }));
                  setErrors(prev => ({ ...prev, address1: null, address2: null, address3: null, address4: null, pincode: null, area: null, city: null, state: null }));
                }}
              />

              <CustomInput
                placeholder="Address 2"
                value={formData.address2}
                onChangeText={(text) => setFormData(prev => ({ ...prev, address2: text }))}
                error={errors.address2}
                mandatory={true}
              />

              <CustomInput
                placeholder="Address 3"
                value={formData.address3}
                onChangeText={(text) => setFormData(prev => ({ ...prev, address3: text }))}
                error={errors.address3}
                mandatory={true}
              />

              <CustomInput
                placeholder="Address 4"
                value={formData.address4}
                onChangeText={(text) => setFormData(prev => ({ ...prev, address4: text }))}
              />

              <CustomInput
                placeholder="Pincode"
                value={formData.pincode}
                onChangeText={(text) => setFormData(prev => ({ ...prev, pincode: text }))}
                keyboardType="numeric"
                maxLength={6}
                error={errors.pincode}
                mandatory={true}
              />

              {/* Area Text Input - Independent selection */}
              <CustomInput
                placeholder="Area"
                value={formData.area}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, area: text }));
                  setErrors(prev => ({ ...prev, area: null }));
                }}
                error={errors.area}
                mandatory={true}
              />

              {/* City Dropdown - Independent selection */}
              <View style={styles.inputTextContainer}>
                {/* <AppText style={styles.inputLabel}>City</AppText> */}
                {/* <AppText style={styles.mandatoryIndicator}>*</AppText> */}
              </View>
              <TouchableOpacity
                style={[styles.input, errors.city && styles.inputError]}
                onPress={() => !loadingCities && setShowCityModal(true)}
                activeOpacity={0.7}
                disabled={loadingCities}
              >
                {loadingCities ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <View style={styles.inputTextContainer}>
                      <AppText style={formData.city ? styles.inputText : styles.placeholderText}>
                        {formData.city || 'City'}
                      </AppText>
                      <AppText style={styles.inlineAsterisk}>*</AppText>
                    </View>


                    <ArrowDown color='#999' />
                  </>
                )}
              </TouchableOpacity>
              {errors.city && (
                <AppText style={styles.errorText}>{errors.city}</AppText>
              )}

              {/* State Dropdown - Independent selection */}
              <View style={styles.inputTextContainer}>
                {/* <AppText style={styles.inputLabel}>State</AppText> */}
                {/* <AppText style={styles.mandatoryIndicator}>*</AppText> */}
              </View>
              <TouchableOpacity
                style={[styles.input, errors.state && styles.inputError]}
                onPress={() => !loadingStates && setShowStateModal(true)}
                activeOpacity={0.7}
                disabled={loadingStates}
              >
                {loadingStates ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    {/* <AppText style={formData.state ? styles.inputText : styles.placeholderText}>
                      {formData.state || 'State'}
                    </AppText> */}

                    <View style={styles.inputTextContainer}>
                      <AppText style={formData.state ? styles.inputText : styles.placeholderText}>
                        {formData.state || 'State'}
                      </AppText>
                      <AppText style={styles.inlineAsterisk}>*</AppText>
                    </View>
                    <ArrowDown color='#999' />
                  </>
                )}
              </TouchableOpacity>
              {errors.state && (
                <AppText style={styles.errorText}>{errors.state}</AppText>
              )}
            </View>

            {/* Security Details Section */}
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>Security Details<AppText style={styles.asteriskRed}>*</AppText></AppText>

              {/* Mobile Number with Verify */}
              <CustomInput
                placeholder="Mobile Number"
                value={formData.mobileNumber}
                onChangeText={(text) => {
                  if (/^\d{0,10}$/.test(text)) {
                    setFormData(prev => ({ ...prev, mobileNumber: text }));
                    setErrors(prev => ({ ...prev, mobileNumber: null }));
                  }
                }}
                maxLength={10}
                keyboardType="phone-pad"
                mandatory
                editable={!verificationStatus.mobile}

                rightComponent={
                  <TouchableOpacity
                    style={[
                      styles.inlineVerifyButton,
                      verificationStatus.mobile && styles.verifiedButton
                    ]}
                    onPress={() => !verificationStatus.mobile && handleVerify('mobile')}
                    disabled={verificationStatus.mobile || loadingOtp.mobile}
                  >
                    {loadingOtp.mobile && !verificationStatus.mobile ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <AppText style={[
                        styles.inlineVerifyText,
                        verificationStatus.mobile && styles.verifiedText
                      ]}>
                        {verificationStatus.mobile ? (
                          'Verified'
                        ) : (
                          <>
                            Verify<AppText style={styles.inlineAsterisk}>*</AppText>
                          </>
                        )}
                      </AppText>
                    )}
                  </TouchableOpacity>
                }
              />
              {errors.mobileNumber && (
                <AppText style={styles.errorText}>{errors.mobileNumber}</AppText>
              )}
              {errors.mobileVerification && (
                <AppText style={styles.errorText}>{errors.mobileVerification}</AppText>
              )}
              {renderOTPInput('mobile')}

              {/* Email Address with Verify */}
              <CustomInput
                placeholder="Email Address"
                value={formData.emailAddress}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, emailAddress: text.toLowerCase() }));
                  setErrors(prev => ({ ...prev, emailAddress: null }));
                }}
                keyboardType="email-address"
                mandatory
                editable={!verificationStatus.email}

                rightComponent={
                  <TouchableOpacity
                    style={[
                      styles.inlineVerifyButton,
                      verificationStatus.email && styles.verifiedButton,
                      loadingOtp.email && styles.disabledButton
                    ]}
                    onPress={() => !verificationStatus.email && !loadingOtp.email && handleVerify('email')}
                    disabled={verificationStatus.email || loadingOtp.email}
                  >
                    {loadingOtp.email && !verificationStatus.email ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <AppText style={[
                        styles.inlineVerifyText,
                        verificationStatus.email && styles.verifiedText
                      ]}>
                        {verificationStatus.email ? (
                          'Verified'
                        ) : (
                          <>
                            Verify<AppText style={styles.inlineAsterisk}>*</AppText>
                          </>
                        )}
                      </AppText>
                    )}
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

              {/* PAN Upload */}
              <FileUploadComponent
                placeholder="Upload PAN"
                accept={['pdf', 'jpg', 'jpeg', 'png']}
                maxSize={15 * 1024 * 1024} // 15MB
                docType={DOC_TYPES.PAN}
                initialFile={formData.panFile}
                onFileUpload={(file) => {
                  setFormData(prev => ({ ...prev, panFile: file }));
                }}
                onFileDelete={() => {
                  setFormData(prev => ({ ...prev, panFile: null }));
                }}
                errorMessage={errors.panFile}
                mandatory={true}
                onOcrDataExtracted={(ocrData) => {
                  console.log('PAN OCR Data:', ocrData);
                  if (ocrData.panNumber) {
                    setFormData(prev => ({ ...prev, panNumber: ocrData.panNumber }));
                    // Auto-verify when PAN is populated from OCR
                    setVerificationStatus(prev => ({ ...prev, pan: true }));
                  }
                }}
              />

              {/* PAN Number with Verify - No OTP, just API verification */}
              <CustomInput
                placeholder="PAN Number"
                value={formData.panNumber}
                onChangeText={(text) => {
                  const upperText = text.toUpperCase();
                  setFormData(prev => ({ ...prev, panNumber: upperText }));
                  setErrors(prev => ({ ...prev, panNumber: null }));
                }}
                autoCapitalize="characters"
                maxLength={10} mandatory
                editable={!verificationStatus.pan}

                rightComponent={
                  <TouchableOpacity
                    style={[
                      styles.inlineVerifyButton,
                      verificationStatus.pan && styles.verifiedButton
                    ]}
                    onPress={() => {
                      if (!verificationStatus.pan) {
                        // Verify PAN format
                        if (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
                          setVerificationStatus(prev => ({ ...prev, pan: true }));

                        } else {
                          Alert.alert('Invalid PAN', 'Please enter a valid PAN number');
                        }
                      }
                    }}
                    disabled={verificationStatus.pan}
                  >
                    <AppText style={[
                      styles.inlineVerifyText,
                      verificationStatus.pan && styles.verifiedText
                    ]}>
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
              {errors.panNumber && (
                <AppText style={styles.errorText}>{errors.panNumber}</AppText>
              )}

               {
                   verificationStatus.pan &&
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
                  }


              {/* GST Upload */}
              <FileUploadComponent
                placeholder="Upload GST"
                accept={['pdf', 'jpg', 'jpeg', 'png']}
                maxSize={15 * 1024 * 1024} // 15MB
                docType={DOC_TYPES.GST}
                initialFile={formData.gstFile}
                onFileUpload={(file) => {
                  setFormData(prev => ({ ...prev, gstFile: file }));
                }}
                onFileDelete={() => {
                  setFormData(prev => ({ ...prev, gstFile: null }));
                }}
                onOcrDataExtracted={(ocrData) => {
                  console.log('GST OCR Data:', ocrData);
                  if (ocrData.gstNumber) {
                    setFormData(prev => ({ ...prev, gstNumber: ocrData.gstNumber }));
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
                onChangeText={(text) => {
                  // Allow only letters and numbers - remove any special characters
                  const filtered = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                  setFormData(prev => ({ ...prev, gstNumber: filtered }));
                }}
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
                <AppText style={styles.switchLabel}>Mark as buying entity</AppText>
                <TouchableOpacity
                  style={[
                    styles.switch,
                    formData.markAsBuyingEntity && styles.switchActive,
                  ]}
                  onPress={() => setFormData(prev => ({
                    ...prev,
                    markAsBuyingEntity: !prev.markAsBuyingEntity
                  }))}
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

              <AppText style={styles.sectionSubTitle}>Select category <AppText style={styles.optional}>(Optional)</AppText></AppText>

              <View style={styles.categoryOptions}>
                <TouchableOpacity
                  style={[
                    styles.checkboxButton,
                    formData.selectedCategory.groupCorporateHospital && styles.checkboxButtonActive,
                  ]}
                  onPress={() => setFormData(prev => ({
                    ...prev,
                    selectedCategory: {
                      ...prev.selectedCategory,
                      groupCorporateHospital: !prev.selectedCategory.groupCorporateHospital
                    }
                  }))}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.checkbox,
                    formData.selectedCategory.groupCorporateHospital && styles.checkboxSelected
                  ]}>
                    {formData.selectedCategory.groupCorporateHospital && (
                      <AppText style={styles.checkboxTick}>✓</AppText>
                    )}
                  </View>
                  <AppText style={styles.checkboxLabel}>Group Corporate Hospital<Icon name="information-circle-outline" size={16} color="#999" /></AppText>
                </TouchableOpacity>

                {/* Group Hospital Selector - Show when Group Corporate Hospital is selected */}
                {formData.selectedCategory.groupCorporateHospital && (
                  <>
                    <TouchableOpacity
                      style={styles.hospitalSelectorDropdown}
                      onPress={() => {
                        navigation.navigate('HospitalSelector', {
                          selectedHospitals: formData.selectedHospitals,
                          onSelect: (hospitals) => {
                            // Allow multiple hospital selections
                            setFormData(prev => ({ ...prev, selectedHospitals: hospitals }));
                          }
                        });
                      }}
                      activeOpacity={0.7}
                    >
                      <AppText style={styles.hospitalSelectorText}>
                        {formData.selectedHospitals && formData.selectedHospitals.length > 0
                          ? formData.selectedHospitals.map(h => h.name).join(', ')
                          : 'Search hospital name/code'}
                      </AppText>
                      <ArrowDown color='#333' />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.addNewHospitalLink}
                      onPress={() => setShowHospitalModal(true)}
                    >
                      <AppText style={styles.addNewHospitalLinkText}>+ Add New Group Hospital</AppText>
                    </TouchableOpacity>
                  </>
                )}

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
                  <AppText style={styles.checkboxLabel}>Pharmacy<Icon name="information-circle-outline" size={16} color="#999" /></AppText>
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
                        onSelect: (pharmacies) => {
                          setFormData(prev => ({ ...prev, selectedPharmacies: pharmacies }));
                        }
                      });
                    }}
                    activeOpacity={0.7}
                  >
                    <AppText style={styles.selectorPlaceholder}>


                      {formData.selectedPharmacies && formData?.selectedPharmacies.length > 0
                        ? `${formData.selectedPharmacies.length} Pharmacies Selected`
                        : 'Select pharmacy name/code'}
                    </AppText>
                    <ArrowDown color='#333' />
                  </TouchableOpacity>

                  {/* Selected Pharmacies List */}

                  {formData.selectedPharmacies.length > 0 && (
                    <View style={styles.selectedItemsContainer}>
                      {/* Selected Pharmacies List */}
                      {formData.selectedPharmacies.map((pharmacy, index) => (
                        <View key={pharmacy.id || index} style={styles.selectedItemChip}>
                          <AppText >{pharmacy.name}  </AppText>
                          <TouchableOpacity
                            onPress={() => {
                              setFormData(prev => ({
                                ...prev,
                                selectedPharmacies: prev.selectedPharmacies.filter((_, i) => i !== index)
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
                    onPress={() => setShowPharmacyModal(true)}
                  >
                    <AppText style={styles.addNewLinkText}>+ Add New Pharmacy</AppText>
                  </TouchableOpacity>
                </>
              )}

              {/* <View style={styles.divider} /> */}
              <View style={styles.customerGroupContainer}>

                <AppText style={styles.sectionLabel}>Customer group</AppText>

                <View style={styles.customerGroupGridContainer}>
                  {['9 Doctor Supply', '10 VQ', '11 RFQ', '12 GOVT'].map((group, index) => {
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
                            setFormData(prev => ({ ...prev, customerGroupId: groupId }));
                          }
                        }}
                        disabled={isDisabled}
                        activeOpacity={isDisabled ? 1 : 0.7}
                      >
                        <View style={[
                          styles.radioButton,
                          isSelected && styles.radioButtonSelected,
                        ]}>
                          {isSelected && (
                            <View style={styles.radioButtonInner} />
                          )}
                        </View>
                        <AppText style={[
                          styles.radioButtonLabel,
                          isDisabled && styles.radioButtonLabelDisabled,
                        ]}>
                          {group}
                        </AppText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
              <AppText style={styles.sectionSubTitle}>Stockist Suggestions <AppText style={styles.optional}>(Optional)</AppText></AppText>

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
                    onChangeText={(text) => {
                      setStockists(prev => prev.map((s, i) =>
                        i === index ? { ...s, name: text } : s
                      ));
                    }}
                  />

                  <CustomInput
                    placeholder="Distributor Code"
                    value={stockist.distributorCode}
                    onChangeText={(text) => {
                      setStockists(prev => prev.map((s, i) =>
                        i === index ? { ...s, distributorCode: text } : s
                      ));
                    }}
                  />

                  <CustomInput
                    placeholder="City"
                    value={stockist.city}
                    onChangeText={(text) => {
                      setStockists(prev => prev.map((s, i) =>
                        i === index ? { ...s, city: text } : s
                      ));
                    }}
                  />
                </View>
              ))}

              {/* Add Stockist Button */}

              {
                stockists.length < 4 && (
                  <TouchableOpacity style={styles.addStockistButton} onPress={handleAddStockist}>
                    <AppText style={styles.addStockistButtonText}>+ Add More Stockist</AppText>
                  </TouchableOpacity>
                )
              }
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
                style={styles.registerButton}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <AppText style={styles.registerButtonText}>
                    {inEditMode ? 'Update' : 'Register'}
                  </AppText>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Add New Hospital Modal */}
      <AddNewHospitalModal
        visible={showHospitalModal}
        pharmacyName={formData.clinicName}
        onClose={() => setShowHospitalModal(false)}
        onSubmit={(hospital) => {
          setFormData(prev => ({
            ...prev,
            selectedHospitals: [...prev.selectedHospitals, hospital]
          }));
          setShowHospitalModal(false);
        }}
      />

      {/* Add New Pharmacy Modal */}
      <AddNewPharmacyModal
        visible={showPharmacyModal}
        onClose={() => setShowPharmacyModal(false)}
        hospitalName={formData.clinicName}
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
        visible={showStateModal}
        onClose={() => setShowStateModal(false)}
        title="Select State"
        data={states}
        selectedId={formData.stateId}
        onSelect={(item) => {
          handleStateSelect(item);
        }}
        loading={loadingStates}
      />

      <DropdownModal
        visible={showCityModal}
        onClose={() => setShowCityModal(false)}
        title="Select City"
        data={cities}
        selectedId={formData.cityId}
        onSelect={(item) => {
          handleCitySelect(item);
        }}
        loading={loadingCities}
      />

      <DropdownModal
        visible={showAreaModal}
        onClose={() => setShowAreaModal(false)}
        title="Select Area"
        data={MOCK_AREAS.map((area, index) => ({ id: index, name: area }))}
        selectedId={MOCK_AREAS.indexOf(formData.area)}
        onSelect={(item) => {
          setFormData(prev => ({ ...prev, area: item.name }));
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
                            </View></View>
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
  typeTagActive: {

  },
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
  inputTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  dropdown: {
    position: 'relative',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginTop: -10,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxHeight: 200,
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
    backgroundColor: "#F8F9FA",
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
    marginBottom: 30
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
  registerButtonText: {
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
    textAlign: "center",
    marginBottom: 50

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
    color: colors.primary,
  },
  radioButtonContainer: {
    flexDirection: 'row',
    gap: 50,
    flex: 1,
    marginBottom: 16
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
   linkButton: {
    flexDirection: 'row',   
    alignItems: 'center',  
    gap: 2,                
    paddingVertical: 8,
    marginBottom: 16,
    marginTop: -16,
  },
  linkText: {
    color: colors.primary
  }
});

export default PrivateRegistrationForm;