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
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import { colors } from '../../../styles/colors';
import CustomInput from '../../../components/CustomInput';
import FileUploadComponent from '../../../components/FileUploadComponent';
import ChevronLeft from '../../../components/icons/ChevronLeft';
import Calendar from '../../../components/icons/Calendar';
import ArrowDown from '../../../components/icons/ArrowDown';
import Search from '../../../components/icons/Search';
import CloseCircle from '../../../components/icons/CloseCircle';
import { customerAPI } from '../../../api/customer';
import {AppText,AppInput} from "../../../components"
import AddNewHospitalModal from './AddNewHospitalModal';
import AddNewPharmacyModal from './AddNewPharmacyModal';

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
  { id: 0, name: 'Vadgaonsheri'}, 
  { id: 1, name: 'Kharadi'}, 
  { id: 2, name: 'Viman Nagar'}, 
  { id: 3, name: 'Kalyani Nagar'}, 
  { id: 4, name: 'Koregaon Park'}
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
  const { type, typeName, typeId, category, categoryName, categoryId, subCategory, subCategoryName, subCategoryId } = route.params || {};
  
  // State for license types fetched from API
  const [licenseTypes, setLicenseTypes] = useState({
    CLINIC_REGISTRATION: { id: 6, docTypeId: 10, name: 'Clinic Registration', code: 'CLINIC_REG' },
    PRACTICE_LICENSE: { id: 7, docTypeId: 8, name: 'Practice License', code: 'PRACTICE_LIC' },
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
    city: '',
    cityId: null,
    state: '',
    stateId: null,
    
    // Security Details
    mobileNumber: '',
    emailAddress: '',
    panNumber: '',
    panFile: null,
    gstNumber: '',
    gstFile: null,
    
    // Mapping
    markAsBuyingEntity: false,
    selectedCategory: '',
    selectedHospital: null,
    selectedPharmacies: [],
    
    // Customer Group
    customerGroupId: 1,
    
    // Stockist Suggestions
    stockists: [],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  
  // Dropdown data
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [customerGroups, setCustomerGroups] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  
  // Date picker states
  const [showDatePicker, setShowDatePicker] = useState({
    clinicRegistration: false,
    practiceLicense: false,
  });
  const [selectedDateField, setSelectedDateField] = useState(null);
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
    loadCities();

    // Cleanup function to reset states when component unmounts
    return () => {
      setLoading(false);
      setShowOTP({ mobile: false, email: false });
      setOtpValues({ mobile: ['', '', '', ''], email: ['', '', '', ''] });
      setOtpTimers({ mobile: 30, email: 30 });
      setVerificationStatus({ mobile: false, email: false, pan: false, gst: false });
    };
  }, []);

  // Load states and customer groups on mount
  const loadInitialData = async () => {
    try {
      // Load license types first (for doctors, typeId=3, categoryId=0)
      const licenseResponse = await customerAPI.getLicenseTypes(typeId || 3, categoryId || 0, subCategoryId  || 0);
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
          _states.push({ id: statesResponse.data.states[i].id, name: statesResponse.data.states[i].stateName });
        }
        setStates(_states || []);
      }
    } catch (error) {
      console.error('Error loading states:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load states',
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

  const loadCities = async (stateId=null) => {
    try {
      setLoadingCities(true);
      const response = await customerAPI.getCities(stateId);
      if (response.success) {
        const _cities = [];
        for (let i = 0; i < response.data.cities.length; i++) {
          _cities.push({ id: response.data.cities[i].id, name: response.data.cities[i].cityName });
        }
        setCities(_cities || []);
      }
    } catch (error) {
      console.error('Error loading cities:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load cities',
      });
    } finally {
      setLoadingCities(false);
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

  const handleVerify = async (field) => {
    // Validate the field before showing OTP
    if (field === 'mobile' && (!formData.mobileNumber || formData.mobileNumber.length !== 10)) {
      setErrors(prev => ({ ...prev, mobileNumber: 'Please enter valid 10-digit mobile number' }));
      return;
    }
    if (field === 'email' && (!formData.emailAddress || !formData.emailAddress.includes('@'))) {
      setErrors(prev => ({ ...prev, emailAddress: 'Please enter valid email address' }));
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
        });

        // Animate OTP container
        Animated.spring(otpSlideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }).start();
      } else {
        // Check for existing customer
        if (!response.success && response.data && Array.isArray(response.data)) {
          const existingCustomer = response.data[0];
          Toast.show({
            type: 'error',
            text1: 'Customer Exists',
            text2: `Customer already exists with this ${field}`,
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
          });
        }
      }
    } catch (error) {
      console.error('Error generating OTP:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to send OTP. Please try again.',
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
          text2: `${field === 'mobile' ? 'Mobile' : 'Email'} verified successfully!`,
        });
        
        setShowOTP(prev => ({ ...prev, [field]: false }));
        setVerificationStatus(prev => ({ ...prev, [field]: true }));
        
        // Reset OTP values for this field
        setOtpValues(prev => ({
          ...prev,
          [field]: ['', '', '', '']
        }));
        
        // Reset OTP timer
        setOtpTimers(prev => ({
          ...prev,
          [field]: 30
        }));
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Invalid OTP. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error validating OTP:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to verify OTP. Please try again.',
      });
    } finally {
      setLoadingOtp(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleResendOTP = async (field) => {
    setOtpTimers(prev => ({ ...prev, [field]: 30 }));
    await handleVerify(field);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(prev => ({ ...prev, [selectedDateField]: false }));
    if (selectedDate && selectedDateField) {
      const formattedDate = selectedDate.toISOString();
      setFormData(prev => ({ 
        ...prev, 
        [`${selectedDateField}Date`]: formattedDate 
      }));
      setErrors(prev => ({ ...prev, [`${selectedDateField}Date`]: null }));
    }
    setSelectedDateField(null);
  };

  const openDatePicker = (field) => {
    setSelectedDateField(field);
    setShowDatePicker(prev => ({ ...prev, [field]: true }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
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
    if (file && file.id) {
      setUploadedDocIds(prev => [...prev, file.id]);
      
      // Add complete document object to uploaded list with docTypeId
      const docObject = {
        s3Path: file.s3Path || file.uri,
        docTypeId: file.docTypeId,
        fileName: file.fileName || file.name,
        id: file.id
      };
      setUploadedDocs(prev => [...prev, docObject]);
    }
  };

  const handleFileDelete = (field) => {
    const file = formData[field];
    if (file && file.id) {
      setUploadedDocIds(prev => prev.filter(id => id !== file.id));
      setUploadedDocs(prev => prev.filter(doc => doc.id !== file.id));
    }
    setFormData(prev => ({ ...prev, [field]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // License Details validation
    if (!formData.clinicRegistrationNumber) {
      newErrors.clinicRegistrationNumber = 'Clinic registration number is required';
    }
    if (!formData.clinicRegistrationDate) {
      newErrors.clinicRegistrationDate = 'Expiry date is required';
    }
    if (!formData.clinicRegistrationFile) {
      newErrors.clinicRegistrationFile = 'Clinic registration certificate is required';
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
    
    // General Details validation
    if (!formData.doctorName) {
      newErrors.doctorName = 'Doctor name is required';
    }
    if (!formData.speciality || formData.speciality.trim().length === 0) {
      newErrors.speciality = 'Speciality is required';
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
    if (!formData.pincode || formData.pincode.length !== 6) {
      newErrors.pincode = 'Valid 6-digit pincode is required';
    } else if (/^0+$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode cannot be all zeros';
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
    if (!verificationStatus.mobile) {
      newErrors.mobileVerification = 'Mobile number verification is required';
    }
    if (!formData.emailAddress || !formData.emailAddress.includes('@')) {
      newErrors.emailAddress = 'Valid email address is required';
    }
    if (!verificationStatus.email) {
      newErrors.emailVerification = 'Email verification is required';
    }
    if (!formData.panNumber || formData.panNumber.trim() === '') {
      newErrors.panNumber = 'PAN number is required';
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
      newErrors.panNumber = 'Invalid PAN format (e.g., ABCDE1234F)';
    }
    // GST is optional - only validate if provided
    if (formData.gstNumber && formData.gstNumber.trim() !== '') {    
      if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNumber)) {
        newErrors.gstNumber = 'Invalid GST format (e.g., 27ASDSD1234F1Z5)';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;

  }

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill all required fields and complete verifications',
      });
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    setLoading(true);
    
    try {
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
              licenceValidUpto: formData.clinicRegistrationDate,
            },
            {
              licenceTypeId: licenseTypes.PRACTICE_LICENSE?.id || 7,
              licenceNo: formData.practiceLicenseNumber,
              licenceValidUpto: formData.practiceLicenseDate,
            },
          ],
        },
        customerDocs: uploadedDocs,
        isBuyer: formData.isBuyer || true,
        customerGroupId: formData.customerGroupId,
        generalDetails: {
          name: formData.doctorName,
          address1: formData.address1,
          address2: formData.address2 || '',
          address3: formData.address3 || '',
          address4: formData.address4 || '',
          pincode: parseInt(formData.pincode),
          area: formData.area,
          cityId: formData.cityId,
          stateId: formData.stateId,
          clinicName: formData.clinicName || '',
          specialist: formData.speciality,
        },
        securityDetails: {
          mobile: formData.mobileNumber,
          email: formData.emailAddress,
          panNumber: formData.panNumber,
          gstNumber: formData.gstNumber,
        },
        mapping: {
          hospitalIds: formData.selectedHospital ? [{ id: formData.selectedHospital.id, isNew: false }] : [],
          pharmacyIds: formData.selectedPharmacies.map(p => ({ id: p.id, isNew: false })),
          markAsBuyingEntity: formData.markAsBuyingEntity,
        },
        ...(formData.stockists && formData.stockists.length > 0 && {
          suggestedDistributors: formData.stockists.map(stockist => ({
            "distributorCode": stockist.code,
            "distributorName": stockist.name,
            "city": stockist.city,
            "customerId": stockist.name,
          }))
        })
      };

      const response = await customerAPI.createCustomer(registrationData);
      
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Doctor registered successfully!',
        });

        // Navigate to success screen with registration details
        navigation.navigate('RegistrationSuccess', {
          type: 'doctor',
          registrationCode: response.data?.id || response.data?.id || 'SUCCESS',
          customerId: response.data?.id,
          codeType: 'Doctor',
        });
      } else {
        // Handle validation errors
        if (response.message && Array.isArray(response.message)) {
          const errorMessage = response.message.join('\n');
          Toast.show({
            type: 'error',
            text1: 'Registration Failed',
            text2: errorMessage,
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Registration Failed',
            text2: response.details || 'Failed to register doctor. Please try again.',
          });
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error + '. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddStockist = () => {
    setFormData(prev => ({
      ...prev,
      stockists: [
        ...prev.stockists,
        { name: '', code: '', city: '' }
      ]
    }));
  };

  const handleRemoveStockist = (index) => {
    setFormData(prev => ({
      ...prev,
      stockists: prev.stockists.filter((_, i) => i !== index)
    }));
  };

  const handleStockistChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      stockists: prev.stockists.map((stockist, i) => 
        i === index ? { ...stockist, [field]: value } : stockist
      )
    }));
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
                      {item.name || item.label}
                    </AppText>
                    {selectedId == item.id && (
                      <Icon name="check" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <AppText style={styles.emptyText}>No items available</AppText>
                }
                style={styles.modalList}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
   
      <KeyboardAvoidingView
        style={{ flex: 1 }}
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
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>License Details<AppText style={styles.mandatoryIndicator}>*</AppText></AppText>
              
              <AppText style={styles.sectionLabel}>Clinic registration<AppText style={styles.mandatoryIndicator}>*</AppText></AppText>
              
              <FileUploadComponent
                placeholder="Upload Clinic Registration Certificate"
                accept={['pdf', 'jpg', 'png']}
                maxSize={10 * 1024 * 1024}
                docType={licenseTypes.CLINIC_REGISTRATION?.docTypeId || DOC_TYPES.CLINIC_REGISTRATION}
                initialFile={formData.clinicRegistrationFile}
                onFileUpload={(file) => handleFileUpload('clinicRegistrationFile', file)}
                onFileDelete={() => handleFileDelete('clinicRegistrationFile')}
                errorMessage={errors.clinicRegistrationFile}
              />

              <CustomInput
                placeholder="Clinic registration number"
                value={formData.clinicRegistrationNumber}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, clinicRegistrationNumber: text }));
                  setErrors(prev => ({ ...prev, clinicRegistrationNumber: null }));
                }}
                error={errors.clinicRegistrationNumber}
                autoCapitalize="characters"
                mandatory={true}
              />

              <TouchableOpacity
                style={[styles.input, errors.clinicRegistrationDate && styles.inputError]}
                onPress={() => openDatePicker('clinicRegistration')}
                activeOpacity={0.7}
              >
                <View style={styles.inputTextContainer}>
                  <AppText style={formData.clinicRegistrationDate ? styles.inputText : styles.placeholderText}>
                    {formatDate(formData.clinicRegistrationDate) || 'Expiry date'}
                  </AppText>
                  <AppText style={styles.inlineAsterisk}>*</AppText>
                </View>
                <Calendar />
              </TouchableOpacity>
              {errors.clinicRegistrationDate && (
                <AppText style={styles.errorText}>{errors.clinicRegistrationDate}</AppText>
              )}

              <AppText style={[styles.sectionLabel, { marginTop: 20 }]}>Practice license<AppText style={styles.mandatoryIndicator}>*</AppText></AppText>
              
              <FileUploadComponent
                placeholder="Upload Practice License"
                accept={['pdf', 'jpg', 'png']}
                maxSize={10 * 1024 * 1024}
                docType={licenseTypes.PRACTICE_LICENSE?.docTypeId || DOC_TYPES.PRACTICE_LICENSE}
                initialFile={formData.practiceLicenseFile}
                onFileUpload={(file) => handleFileUpload('practiceLicenseFile', file)}
                onFileDelete={() => handleFileDelete('practiceLicenseFile')}
                errorMessage={errors.practiceLicenseFile}
              />

              <CustomInput
                placeholder="Practice license number"
                value={formData.practiceLicenseNumber}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, practiceLicenseNumber: text }));
                  setErrors(prev => ({ ...prev, practiceLicenseNumber: null }));
                }}
                error={errors.practiceLicenseNumber}
                autoCapitalize="characters"
                mandatory={true}
              />

              <TouchableOpacity
                style={[styles.input, errors.practiceLicenseDate && styles.inputError]}
                onPress={() => openDatePicker('practiceLicense')}
                activeOpacity={0.7}
              >
                <View style={styles.inputTextContainer}>
                  <AppText style={formData.practiceLicenseDate ? styles.inputText : styles.placeholderText}>
                    {formatDate(formData.practiceLicenseDate) || 'Expiry date'}
                  </AppText>
                  <AppText style={styles.inlineAsterisk}>*</AppText>
                </View>
                <Calendar />
              </TouchableOpacity>
              {errors.practiceLicenseDate && (
                <AppText style={styles.errorText}>{errors.practiceLicenseDate}</AppText>
              )}

              <AppText style={[styles.sectionLabel, { marginTop: 20 }]}>Address proof<AppText style={styles.mandatoryIndicator}>*</AppText></AppText>
              
              <FileUploadComponent
                placeholder="Upload Address Proof"
                accept={['pdf', 'jpg', 'png']}
                maxSize={10 * 1024 * 1024}
                docType={DOC_TYPES.ADDRESS_PROOF}
                initialFile={formData.addressProofFile}
                onFileUpload={(file) => handleFileUpload('addressProofFile', file)}
                onFileDelete={() => handleFileDelete('addressProofFile')}
                errorMessage={errors.addressProofFile}
              />

              <AppText style={[styles.sectionLabel, { marginTop: 20 }]}>Clinic image<AppText style={styles.mandatoryIndicator}>*</AppText></AppText>
              
              <FileUploadComponent
                placeholder="Upload Clinic Image"
                accept={['jpg', 'png', 'jpeg']}
                maxSize={5 * 1024 * 1024}
                docType={DOC_TYPES.CLINIC_IMAGE}
                initialFile={formData.clinicImageFile}
                onFileUpload={(file) => handleFileUpload('clinicImageFile', file)}
                onFileDelete={() => handleFileDelete('clinicImageFile')}
              />

              {showDatePicker.clinicRegistration && (
                <DateTimePicker
                  value={formData.clinicRegistrationDate ? new Date(formData.clinicRegistrationDate) : new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
              {showDatePicker.practiceLicense && (
                <DateTimePicker
                  value={formData.practiceLicenseDate ? new Date(formData.practiceLicenseDate) : new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>

            {/* General Details Section */}
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>General Details<AppText style={styles.mandatoryIndicator}>*</AppText></AppText>
              
              <CustomInput
                placeholder="Name of the Doctor"
                value={formData.doctorName}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, doctorName: text }));
                  setErrors(prev => ({ ...prev, doctorName: null }));
                }}
                error={errors.doctorName}
                mandatory={true}
              />

              {/* Speciality Input Field */}
              <CustomInput
                placeholder="Speciality"
                value={formData.speciality}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, speciality: text }));
                  setErrors(prev => ({ ...prev, speciality: null }));
                }}
                error={errors.speciality}
                mandatory={true}
              />

              {/* Clinic Name */}
              <CustomInput
                placeholder="Clinic Name"
                value={formData.clinicName}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, clinicName: text }));
                  setErrors(prev => ({ ...prev, clinicName: null }));
                }}
                error={errors.clinicName}
                mandatory={true}
              />

              <CustomInput
                placeholder="Address 1"
                value={formData.address1}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, address1: text }));
                  setErrors(prev => ({ ...prev, address1: null }));
                }}
                error={errors.address1}
                mandatory={true}
              />

              <CustomInput
                placeholder="Address 2"
                value={formData.address2}
                onChangeText={(text) => setFormData(prev => ({ ...prev, address2: text }))}
                mandatory={true}
              />

              <CustomInput
                placeholder="Address 3"
                value={formData.address3}
                onChangeText={(text) => setFormData(prev => ({ ...prev, address3: text }))}
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
                onChangeText={(text) => {
                  if (/^\d{0,6}$/.test(text)) {
                    setFormData(prev => ({ ...prev, pincode: text }));
                    setErrors(prev => ({ ...prev, pincode: null }));
                  }
                }}
                keyboardType="numeric"
                maxLength={6}
                error={errors.pincode}
                mandatory={true}
              />

              {/* Area Input Field */}
              <CustomInput
                label="Area"
                placeholder="Enter Area"
                value={formData.area}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, area: text }));
                  setErrors(prev => ({ ...prev, area: null }));
                }}
                error={errors.area}
                mandatory={true}
              />

              {/* City Dropdown */}
              <View style={styles.dropdownContainer}>
                <AppText style={styles.inputLabel}>City<AppText style={{color: 'red'}}>*</AppText></AppText>
                <TouchableOpacity 
                  style={[styles.dropdown, errors.city && styles.inputError]}
                  onPress={() => setShowCityModal(true)}
                >
                  <AppText style={[styles.dropdownText, !formData.city && styles.dropdownPlaceholder]}>
                    {formData.city || 'Select City'}
                  </AppText>
                  <Icon name="arrow-drop-down" size={24} color="#666" />
                </TouchableOpacity>
                {errors.city && <AppText style={styles.errorText}>{errors.city}</AppText>}
              </View>

              {/* State Dropdown */}
              <View style={styles.dropdownContainer}>
                <AppText style={styles.inputLabel}>State<AppText style={{color: 'red'}}>*</AppText></AppText>
                <TouchableOpacity 
                  style={[styles.dropdown, errors.state && styles.inputError]}
                  onPress={() => setShowStateModal(true)}
                >
                  <AppText style={[styles.dropdownText, !formData.state && styles.dropdownPlaceholder]}>
                    {formData.state || 'Select State'}
                  </AppText>
                  <Icon name="arrow-drop-down" size={24} color="#666" />
                </TouchableOpacity>
                {errors.state && <AppText style={styles.errorText}>{errors.state}</AppText>}
              </View>
            </View>

            {/* Security Details Section */}
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>Security Details<AppText style={styles.mandatoryIndicator}>*</AppText></AppText>
              
              {/* Mobile Number with Verify */}
              <View style={[styles.inputWithButton, errors.mobileNumber && styles.inputError]}>
                <AppInput
                  style={styles.inputField}
                  placeholder="Mobile number*"
                  value={formData.mobileNumber}
                  onChangeText={(text) => {
                    if (/^\d{0,10}$/.test(text)) {
                      setFormData(prev => ({ ...prev, mobileNumber: text }));
                      setErrors(prev => ({ ...prev, mobileNumber: null }));
                    }
                  }}
                  keyboardType="phone-pad"
                  maxLength={10}
                  placeholderTextColor="#999"
                  editable={!verificationStatus.mobile}
                />
                <TouchableOpacity
                  style={[
                    styles.inlineVerifyButton,
                    verificationStatus.mobile && styles.verifiedButton,
                    loadingOtp.mobile && styles.disabledButton
                  ]}
                  onPress={() => !verificationStatus.mobile && !loadingOtp.mobile && handleVerify('mobile')}
                  disabled={verificationStatus.mobile || loadingOtp.mobile}
                >
                  {loadingOtp.mobile && !verificationStatus.mobile ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <AppText style={[
                      styles.inlineVerifyText,
                      verificationStatus.mobile && styles.verifiedText
                    ]}>
                      {verificationStatus.mobile ? 'Verified' : 'Verify'}
                    </AppText>
                  )}
                </TouchableOpacity>
              </View>
              {errors.mobileNumber && (
                <AppText style={styles.errorText}>{errors.mobileNumber}</AppText>
              )}
              {errors.mobileVerification && (
                <AppText style={styles.errorText}>{errors.mobileVerification}</AppText>
              )}
              {renderOTPInput('mobile')}

              {/* Email Address with Verify */}
              <View style={[styles.inputWithButton, errors.emailAddress && styles.inputError]}>
                <AppInput
                  style={[styles.inputField, { flex: 1 }]}
                  placeholder="Email Address"
                  value={formData.emailAddress}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, emailAddress: text.toLowerCase() }));
                    setErrors(prev => ({ ...prev, emailAddress: null }));
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                  editable={!verificationStatus.email}
                />
                <AppText style={styles.mandatoryIndicator}>*</AppText>
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
                      {verificationStatus.email ? 'Verified' : 'Verify'}
                    </AppText>
                  )}
                </TouchableOpacity>
              </View>
              {errors.emailAddress && (
                <AppText style={styles.errorText}>{errors.emailAddress}</AppText>
              )}
              {errors.emailVerification && (
                <AppText style={styles.errorText}>{errors.emailVerification}</AppText>
              )}
              {renderOTPInput('email')}

              {/* PAN Upload */}
              <FileUploadComponent
                placeholder="Upload PAN Card"
                accept={['pdf', 'jpg', 'png']}
                maxSize={5 * 1024 * 1024}
                docType={DOC_TYPES.PAN}
                initialFile={formData.panFile}
                onFileUpload={(file) => handleFileUpload('panFile', file)}
                onFileDelete={() => handleFileDelete('panFile')}
              />

              {/* PAN Number */}
              <CustomInput
                placeholder="PAN Number (e.g., ASDSD12345G)"
                value={formData.panNumber}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, panNumber: text.toUpperCase() }));
                  setErrors(prev => ({ ...prev, panNumber: null }));
                }}
                autoCapitalize="characters"
                maxLength={10}
                mandatory={true}
                error={errors.panNumber}
              />

              {/* GST Upload */}
              <FileUploadComponent
                placeholder="Upload GST Certificate"
                accept={['pdf', 'jpg', 'png']}
                maxSize={5 * 1024 * 1024}
                docType={DOC_TYPES.GST}
                initialFile={formData.gstFile}
                onFileUpload={(file) => handleFileUpload('gstFile', file)}
                onFileDelete={() => handleFileDelete('gstFile')}
              />

              <CustomInput
                placeholder="GST Number (e.g., 27ASDSD1234F1Z5)"
                value={formData.gstNumber}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, gstNumber: text.toUpperCase() }));
                  setErrors(prev => ({ ...prev, gstNumber: null }));
                }}
                autoCapitalize="characters"
                maxLength={15}
                mandatory={true}
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

              <AppText style={styles.sectionLabel}>Select category <AppText style={styles.optional}>(Optional)</AppText></AppText>
              
              <View style={styles.categoryOptions}>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    formData.selectedCategory === 'Hospital' && styles.radioButtonActive,
                  ]}
                  onPress={() => setFormData(prev => ({ 
                    ...prev, 
                    selectedCategory: 'Hospital' 
                  }))}
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
                    formData.selectedCategory === 'Pharmacy' && styles.radioButtonActive,
                  ]}
                  onPress={() => setFormData(prev => ({ 
                    ...prev, 
                    selectedCategory: 'Pharmacy' 
                  }))}
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
                    style={styles.selectorInput}
                    onPress={() => {
                      navigation.navigate('HospitalSelector', {
                        selectedHospitals: formData.selectedHospital ? [formData.selectedHospital] : [],
                        onSelect: (hospitals) => {
                          setFormData(prev => ({ ...prev, selectedHospital: hospitals[0] || null }));
                        }
                      });
                    }}
                    activeOpacity={0.7}
                  >
                    {formData.selectedHospital ? (
                      <View style={styles.selectedItem}>
                        <View>
                          <AppText style={styles.selectedItemName}>{formData.selectedHospital.name}</AppText>
                          <AppText style={styles.selectedItemCode}>{formData.selectedHospital.code}</AppText>
                        </View>
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            setFormData(prev => ({ ...prev, selectedHospital: null }));
                          }}
                        >                  
                          <CloseCircle color="#999" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <>
                        <AppText style={styles.selectorPlaceholder}>Search hospital name/code</AppText>                
                        <Search />
                      </>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.addNewLink}
                    onPress={() => setShowHospitalModal(true)}
                  >            
                    <AppText style={styles.addNewLinkText}>+ Add New Hospital</AppText>
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
                        onSelect: (pharmacies) => {
                          setFormData(prev => ({ ...prev, selectedPharmacies: pharmacies }));
                        }
                      });
                    }}
                    activeOpacity={0.7}
                  >
                    <AppText style={styles.selectorPlaceholder}>Search pharmacy name/code</AppText>
                    <Search />
                  </TouchableOpacity>
                  
                  {/* Selected Pharmacies List */}
                  {formData.selectedPharmacies.map((pharmacy) => (
                    <View key={pharmacy.id} style={styles.selectedPharmacyItem}>
                      <View style={styles.pharmacyInfo}>
                        <AppText style={styles.pharmacyName}>{pharmacy.name}</AppText>
                        <AppText style={styles.pharmacyCode}>{pharmacy.code}</AppText>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          setFormData(prev => ({
                            ...prev,
                            selectedPharmacies: prev.selectedPharmacies.filter(p => p.id !== pharmacy.id)
                          }));
                        }}
                      >                
                        <CloseCircle color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  
                  <TouchableOpacity 
                    style={styles.addNewLink}
                    onPress={() => setShowPharmacyModal(true)}
                  >
                    <AppText style={styles.addNewLinkText}>+ Add New Pharmacy</AppText>
                  </TouchableOpacity>
                </>
              )}

              <View style={styles.divider} />
              
              <AppText style={styles.customerGroupLabel}>Customer group</AppText>
              <View style={styles.radioGroupContainer}>
                <View style={styles.radioRow}>
                  <TouchableOpacity 
                    style={[styles.radioOption, styles.radioOptionFlex]}
                    onPress={() => setFormData(prev => ({ ...prev, customerGroupId: 1 }))}
                  >
                    <View style={styles.radioCircle}>
                      {formData.customerGroupId === 1 && (
                        <View style={styles.radioSelected} />
                      )}
                    </View>
                    <AppText style={styles.radioText}>9 Doctor Supply</AppText>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.radioOption, styles.radioOptionFlex, styles.disabledOption]}
                    disabled={true}
                  >
                    <View style={[styles.radioCircle, styles.disabledRadio]}>
                    </View>
                    <AppText style={[styles.radioText, styles.disabledText]}>10 VQ</AppText>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.radioRow}>
                  <TouchableOpacity 
                    style={[styles.radioOption, styles.radioOptionFlex, styles.disabledOption]}
                    disabled={true}
                  >
                    <View style={[styles.radioCircle, styles.disabledRadio]}>
                    </View>
                    <AppText style={[styles.radioText, styles.disabledText]}>11 RFQ</AppText>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.radioOption, styles.radioOptionFlex, styles.disabledOption]}
                    disabled={true}
                  >
                    <View style={[styles.radioCircle, styles.disabledRadio]}>
                    </View>
                    <AppText style={[styles.radioText, styles.disabledText]}>12 GOVT</AppText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Stockist Suggestions Section */}
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>
                Stockist Suggestions
                <AppText style={styles.optionalText}> (Optional)</AppText>
              </AppText>
              
              <AppText style={styles.helperText}>
                Add suggested stockists for this doctor
              </AppText>
              
              {formData.stockists.map((stockist, index) => (
                <View key={index} style={styles.stockistContainer}>
                  <View style={styles.stockistHeader}>
                    <AppText style={styles.stockistTitle}>Stockist {index + 1}</AppText>
                    <TouchableOpacity onPress={() => handleRemoveStockist(index)}>
                      <Icon name="delete" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                  <CustomInput
                    placeholder="Name of the Stockist"
                    value={stockist.name}
                    onChangeText={(text) => handleStockistChange(index, 'name', text)}
                  />
                  <CustomInput
                    placeholder="Distributor Code"
                    value={stockist.code}
                    onChangeText={(text) => handleStockistChange(index, 'code', text)}
                  />
                  <CustomInput
                    placeholder="City"
                    value={stockist.city}
                    onChangeText={(text) => handleStockistChange(index, 'city', text)}
                  />
                </View>
              ))}
              
              <TouchableOpacity 
                style={styles.addMoreButton}
                onPress={handleAddStockist}
              >
                <AppText style={styles.addMoreButtonText}>+ Add New Stockist</AppText>
              </TouchableOpacity>
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
                style={[styles.registerButton, loading && styles.disabledButton]}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <AppText style={styles.registerButtonText}>Register</AppText>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Dropdown Modals */}
      <DropdownModal
        visible={showStateModal}
        onClose={() => setShowStateModal(false)}
        title="Select State"
        data={states}
        selectedId={formData.stateId}
        onSelect={(item) => {
          setFormData(prev => ({ 
            ...prev, 
            stateId: item.id, 
            state: item.name
          }));
          setErrors(prev => ({ ...prev, state: null }));
          loadCities(item.id);
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
          setFormData(prev => ({ 
            ...prev, 
            cityId: item.id, 
            city: item.name
          }));
          setErrors(prev => ({ ...prev, city: null }));
        }}
        loading={loadingCities}
      />


      {/* Add New Hospital Modal */}
      <AddNewHospitalModal
        visible={showHospitalModal}
        onClose={() => setShowHospitalModal(false)}
        onSubmit={(hospital) => {
          setShowHospitalModal(false);
          // Handle hospital submission if needed
          Toast.show({
            type: 'success',
            text1: 'Hospital Added',
            text2: 'Hospital has been added successfully',
          });
        }}
      />

      {/* Add New Pharmacy Modal */}
      <AddNewPharmacyModal
        visible={showPharmacyModal}
        onClose={() => setShowPharmacyModal(false)}
        onSubmit={(pharmacy) => {
          setShowPharmacyModal(false);
          // Handle pharmacy submission if needed
          Toast.show({
            type: 'success',
            text1: 'Pharmacy Added',
            text2: 'Pharmacy has been added successfully',
          });
        }}
      />

      <Toast />

      {/* Cancel Confirmation Modal */}
      <Modal
        visible={showCancelModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.cancelModalOverlay}>
          <View style={styles.cancelModalContent}>
            <View style={styles.modalIconContainer}>
              <AppText style={styles.modalIcon}>!</AppText>
            </View>
            <AppText style={styles.modalTitle}>Are you sure you want to Cancel the Onboarding?</AppText>
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
}

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
    paddingBottom: 100,
  },
  content: {
    paddingHorizontal: 0,
    paddingTop: 20,
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
    color: '#999',
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: -12,
    marginBottom: 12,
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
    backgroundColor: '#FFF5ED',
    borderRadius: 16,
  },
  verifiedButton: {
    backgroundColor: '#E8F5E9',
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
    color: '#4CAF50',
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
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
    color: '#999',
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
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
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
  registerButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
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
    backgroundColor: '#FAFAFA',
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
    marginVertical: 12,
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
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
});

export default DoctorRegistrationForm;