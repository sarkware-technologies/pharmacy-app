/* eslint-disable no-dupe-keys */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import { colors } from '../../../styles/colors';
import { CustomInput } from '../../../components';
import AddressInputWithLocation from '../../../components/AddressInputWithLocation';
import FileUploadComponent from '../../../components/FileUploadComponent';
import Calendar from '../../../components/icons/Calendar';
import ChevronLeft from '../../../components/icons/ChevronLeft';
import ChevronRight from '../../../components/icons/ChevronRight';
import { customerAPI } from '../../../api/customer';
import { AppText, AppInput } from "../../../components"
import AddNewHospitalModal from './AddNewHospitalModal';
import AddNewDoctorModal from './AddNewDoctorModal';
import DoctorDeleteIcon from '../../../components/icons/DoctorDeleteIcon';

// Default document types for file uploads (will be updated from API for licenses)
const DOC_TYPES = {
  PHARMACY_IMAGE: 1,
  PAN_CARD: 7,
  GST_CERTIFICATE: 2,
};

const PharmacyWholesalerRetailerForm = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const scrollViewRef = useRef(null);
  const otpRefs = useRef({});

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
    subCategoryId
  } = route.params || {};

  // State for license types fetched from API
  const [licenseTypes, setLicenseTypes] = useState({
    LICENSE_20: { id: 1, docTypeId: 3, name: '20', code: 'LIC20' },
    LICENSE_21: { id: 3, docTypeId: 5, name: '21', code: 'LIC21' },
    LICENSE_20B: { id: 2, docTypeId: 4, name: '20B', code: 'LIC20B' },
    LICENSE_21B: { id: 4, docTypeId: 6, name: '21B', code: 'LIC21B' },
  });

  // Form state
  const [formData, setFormData] = useState({
    // License Details
    license20: '',
    license20File: null,
    license20ExpiryDate: null,
    license20b: '',
    license20bFile: null,
    license20bExpiryDate: null,
    license21: '',
    license21File: null,
    license21ExpiryDate: null,
    license21b: '',
    license21bFile: null,
    license21bExpiryDate: null,
    pharmacyImageFile: null,

    // General Details
    pharmacyName: '',
    shortName: '',
    address1: '',
    address2: '',
    address3: '',
    address4: '',
    pincode: '',
    area: '',
    areaId: '',
    city: '',
    cityId: '',
    state: '',
    stateId: '',

    // Security Details
    mobileNumber: '',
    emailAddress: '',
    panFile: null,
    panNumber: '',
    gstFile: null,
    gstNumber: '',

    // Mapping
    hospitalCode: '',
    hospitalName: '',
    selectedCategory: '', // 'groupCorporateHospital', 'doctor', or ''
    selectedHospitals: [],
    selectedDoctors: [],

    // Customer group
    customerGroupId: 1,
    isBuyer: false,

    // Stockist Suggestions
    suggestedDistributors: [],
    stockists: [],
  });

  // Document IDs for API submission
  const [documentIds, setDocumentIds] = useState({
    license20: null,
    license21: null,
    license20b: null,
    license21b: null,
    pharmacyImage: null,
    pan: null,
    gst: null,
  });

  // Uploaded documents with full details including docTypeId
  const [uploadedDocs, setUploadedDocs] = useState([]);

  // Error state
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);

  // Date picker states
  const [showDatePicker, setShowDatePicker] = useState({
    license20: false,
    license21: false,
    license20b: false,
    license21b: false,
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
  const [generatedOTP, setGeneratedOTP] = useState({
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

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const otpSlideAnim = useRef(new Animated.Value(-50)).current;

  // States and cities data
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);

  // Dropdown modal states
  const [showStateModal, setShowStateModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showAddHospitalModal, setShowAddHospitalModal] = useState(false);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);

  // Modal states for hospital and pharmacy selectors
  const [showHospitalModal, setShowHospitalModal] = useState(false);
  const [showPharmacyModal, setShowPharmacyModal] = useState(false);

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

    return () => {
      // Cleanup function to reset all states
      setShowOTP({ mobile: false, email: false });
      setOtpValues({ mobile: ['', '', '', ''], email: ['', '', '', ''] });
      setOtpTimers({ mobile: 30, email: 30 });
      setGeneratedOTP({ mobile: null, email: null });
      setLoading(false);
      setRegistering(false);
      setVerificationStatus({ mobile: false, email: false, pan: false, gst: false });
      setErrors({});
      setFormData({
        // License Details
        license20: '',
        license20File: null,
        license20ExpiryDate: null,
        license20b: '',
        license20bFile: null,
        license20bExpiryDate: null,
        license21: '',
        license21File: null,
        license21ExpiryDate: null,
        license21b: '',
        license21bFile: null,
        license21bExpiryDate: null,
        pharmacyImageFile: null,

        // General Details
        pharmacyName: '',
        shortName: '',
        address1: '',
        address2: '',
        address3: '',
        address4: '',
        pincode: '',
        area: '',
        areaId: '',
        city: '',
        cityId: '',
        state: '',
        stateId: '',

        // Security Details
        mobileNumber: '',
        emailAddress: '',
        panFile: null,
        panNumber: '',
        gstFile: null,
        gstNumber: '',

        // Mapping
        hospitalCode: '',
        hospitalName: '',

        // Customer group
        customerGroupId: 1,
        isIPD: false,
        isGOVT: false,
        isBuyer: false,

        // Stockist Suggestions
        suggestedDistributors: [],
      });
      setDocumentIds({
        license20: null,
        license21: null,
        license20b: null,
        license21b: null,
        pharmacyImage: null,
        pan: null,
        gst: null,
      });
      setLicenseTypes({
        LICENSE_20: { id: 1, docTypeId: 3, name: '20', code: 'LIC20' },
        LICENSE_21: { id: 3, docTypeId: 5, name: '21', code: 'LIC21' },
        LICENSE_20B: { id: 2, docTypeId: 4, name: '20B', code: 'LIC20B' },
        LICENSE_21B: { id: 4, docTypeId: 6, name: '21B', code: 'LIC21B' },
      });
      setStates([]);
      setCities([]);
      setLoadingCities(false);
      setShowStateModal(false);
      setShowCityModal(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Load initial data
    loadInitialData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadInitialData = async () => {
    // Fetch license types from API
    await fetchLicenseTypes();
    // Load states on mount
    await loadStates();
  };

  const fetchLicenseTypes = async () => {
    try {
      const response = await customerAPI.getLicenseTypes(typeId || 1, categoryId || 3);
      if (response.success && response.data) {
        const licenseData = {};
        response.data.forEach(license => {
          // Map all 4 license types
          if (license.code === 'LIC20' || license.name === '20') {
            licenseData.LICENSE_20 = {
              id: license.id,
              docTypeId: license.docTypeId,
              name: license.name,
              code: license.code,
            };
          } else if (license.code === 'LIC21' || license.name === '21') {
            licenseData.LICENSE_21 = {
              id: license.id,
              docTypeId: license.docTypeId,
              name: license.name,
              code: license.code,
            };
          } else if (license.code === 'LIC20B' || license.name === '20B') {
            licenseData.LICENSE_20B = {
              id: license.id,
              docTypeId: license.docTypeId,
              name: license.name,
              code: license.code,
            };
          } else if (license.code === 'LIC21B' || license.name === '21B') {
            licenseData.LICENSE_21B = {
              id: license.id,
              docTypeId: license.docTypeId,
              name: license.name,
              code: license.code,
            };
          }
        });

        if (Object.keys(licenseData).length > 0) {
          setLicenseTypes(prev => ({ ...prev, ...licenseData }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch license types:', error);
      // Keep default values if API fails
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

  // Load all cities on mount - independent selection
  useEffect(() => {
    loadCities();
  }, []);


  const loadStates = async () => {
    try {
      const response = await customerAPI.getStates();
      if (response.success && response.data) {
        const _states = [];
        for (let i = 0; i < response.data.states.length; i++) {
          _states.push({ id: response.data.states[i].id, name: response.data.states[i].stateName });
        }
        setStates(_states || []);
        //setStates(response.data);
      }
    } catch (error) {
      console.error('Failed to load states:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load states',
      });
    }
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
      });
    } finally {
      setLoadingCities(false);
    }
  };


  const handleVerify = async (field) => {
    // Validate the field before showing OTP
    if (field === 'mobile' && (!formData.mobileNumber || formData.mobileNumber.length !== 10)) {
      setErrors(prev => ({ ...prev, mobileNumber: 'Please enter valid 10-digit mobile number' }));
      return;
    }
    if (field === 'mobile' && !/^[6-9]/.test(formData.mobileNumber)) {
      setErrors(prev => ({ ...prev, mobileNumber: 'Please enter valid 10-digit mobile number' }));
      return;
    }
    if (field === 'email' && (!formData.emailAddress || !formData.emailAddress.includes('@'))) {
      setErrors(prev => ({ ...prev, emailAddress: 'Please enter valid email address' }));
      return;
    }

    setLoadingOtp(prev => ({ ...prev, [field]: true }));
    try {
      const requestData = {
        [field === 'mobile' ? 'mobile' : 'email']:
          field === 'mobile' ? formData.mobileNumber : formData.emailAddress
      };

      const response = await customerAPI.generateOTP(requestData);

      if (response.success) {
        setShowOTP(prev => ({ ...prev, [field]: true }));
        setOtpTimers(prev => ({ ...prev, [field]: 30 }));

        // If OTP is returned in response (for testing), auto-fill it
        if (response.data && response.data.otp) {
          const otpString = response.data.otp.toString();
          const otpArray = otpString.split('').slice(0, 4);
          setOtpValues(prev => ({
            ...prev,
            [field]: [...otpArray, ...Array(4 - otpArray.length).fill('')]
          }));
          setGeneratedOTP(prev => ({ ...prev, [field]: response.data.otp }));

          // Auto-submit OTP after a delay
          setTimeout(() => {
            handleOtpVerification(field, response.data.otp.toString());
          }, 500);
        }

        Toast.show({
          type: 'success',
          text1: 'OTP Sent',
          text2: response.message || 'OTP has been sent successfully',
        });

        // Animate OTP container
        Animated.spring(otpSlideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }).start();
      } else {
        // Check if customer already exists
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          const existingCustomer = response.data[0];
          Alert.alert(
            'Customer Already Exists',
            `A customer with this ${field} already exists.\nCustomer Code: ${existingCustomer.code || 'N/A'}\nName: ${existingCustomer.name}`,
            [
              { text: 'OK', style: 'default' }
            ]
          );
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: response.message || 'Failed to generate OTP',
          });
        }
      }
    } catch (error) {
      console.error('OTP generation error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to generate OTP. Please try again.',
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
    const otpValue = otp || otpValues[field].join('');

    setLoadingOtp(prev => ({ ...prev, [field]: true }));
    try {
      const requestData = {
        [field === 'mobile' ? 'mobile' : 'email']:
          field === 'mobile' ? formData.mobileNumber : formData.emailAddress
      };

      const response = await customerAPI.validateOTP(otpValue, requestData);

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
        setGeneratedOTP(prev => ({ ...prev, [field]: null }));
      } else {
        Toast.show({
          type: 'error',
          text1: 'Invalid OTP',
          text2: 'Please enter the correct OTP',
        });
      }
    } catch (error) {
      console.error('OTP validation error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to validate OTP. Please try again.',
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
      setFormData(prev => ({
        ...prev,
        [`${selectedDateField}ExpiryDate`]: selectedDate
      }));
      setErrors(prev => ({ ...prev, [`${selectedDateField}ExpiryDate`]: null }));
    }
    setSelectedDateField(null);
  };

  const openDatePicker = (field) => {
    setSelectedDateField(field);
    setShowDatePicker(prev => ({ ...prev, [field]: true }));
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
              editable={!loading}
            />
          ))}
        </View>
        <View style={styles.otpFooter}>
          <AppText style={styles.otpTimer}>
            {otpTimers[field] > 0 ? `Resend in ${otpTimers[field]}s` : ''}
          </AppText>
          {otpTimers[field] === 0 && (
            <TouchableOpacity onPress={() => handleResendOTP(field)} disabled={loading}>
              <AppText style={styles.resendText}>Resend OTP</AppText>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate required fields - all 4 licenses
    if (!formData.license20) newErrors.license20 = 'License 20 number is required';
    if (!documentIds.license20) newErrors.license20File = 'License 20 upload is required';
    if (!formData.license20ExpiryDate) newErrors.license20ExpiryDate = 'License 20 expiry date is required';
    if (!formData.license20b) newErrors.license20b = 'License 20B number is required';
    if (!documentIds.license20b) newErrors.license20bFile = 'License 20B upload is required';
    if (!formData.license20bExpiryDate) newErrors.license20bExpiryDate = 'License 20B expiry date is required';
    if (!formData.license21) newErrors.license21 = 'License 21 number is required';
    if (!documentIds.license21) newErrors.license21File = 'License 21 upload is required';
    if (!formData.license21ExpiryDate) newErrors.license21ExpiryDate = 'License 21 expiry date is required';
    if (!formData.license21b) newErrors.license21b = 'License 21B number is required';
    if (!documentIds.license21b) newErrors.license21bFile = 'License 21B upload is required';
    if (!formData.license21bExpiryDate) newErrors.license21bExpiryDate = 'License 21B expiry date is required';
    if (!formData.panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
      newErrors.panNumber = 'Valid PAN number is required (e.g., ABCDE1234F)';
    }
    if (!formData.pincode || !/^[1-9]\d{5}$/.test(formData.pincode)) {
      newErrors.pincode = 'Valid pincode is required (6 digits)';
    }
    if (!formData.area) newErrors.area = 'Area is required';
    if (!formData.cityId) newErrors.cityId = 'City is required';
    if (!formData.stateId) newErrors.stateId = 'State is required';
    if (!formData.pharmacyName) newErrors.pharmacyName = 'Pharmacy name is required';
    if (!formData.address1) newErrors.address1 = 'Address is required';
    if (!formData.mobileNumber || !/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Valid mobile number is required (10 digits)';
    }
    if (!formData.emailAddress || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.emailAddress)) {
      newErrors.emailAddress = 'Valid email address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const formatDateForAPI = (date) => {
    if (!date) return null;
    const d = new Date(date);
    // Add time component to avoid timezone issues
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill all required fields and complete verifications',
      });
      // Scroll to first error
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    setRegistering(true);

    try {
      // Prepare the registration data according to API format with all 4 licenses
      const registrationData = {
        typeId: typeId || 1,
        categoryId: categoryId || 3, // Wholesaler & Retailer category
        subCategoryId: subCategoryId || 0,
        isMobileVerified: verificationStatus.mobile,
        isEmailVerified: verificationStatus.email,
        isExisting: false,
        licenceDetails: {
          registrationDate: new Date().toISOString(),
          licence: [
            {
              licenceTypeId: licenseTypes.LICENSE_20?.id || 1,
              licenceNo: formData.license20,
              licenceValidUpto: formatDateForAPI(formData.license20ExpiryDate),
            },
            {
              licenceTypeId: licenseTypes.LICENSE_21?.id || 3,
              licenceNo: formData.license21,
              licenceValidUpto: formatDateForAPI(formData.license21ExpiryDate),
            },
            {
              licenceTypeId: licenseTypes.LICENSE_20B?.id || 2,
              licenceNo: formData.license20b,
              licenceValidUpto: formatDateForAPI(formData.license20bExpiryDate),
            },
            {
              licenceTypeId: licenseTypes.LICENSE_21B?.id || 4,
              licenceNo: formData.license21b,
              licenceValidUpto: formatDateForAPI(formData.license21bExpiryDate),
            }
          ]
        },
        customerDocs: uploadedDocs,
        isBuyer: formData.isBuyer,
        customerGroupId: formData.customerGroupId,
        generalDetails: {
          name: formData.pharmacyName,
          shortName: formData.shortName || '',
          address1: formData.address1,
          address2: formData.address2 || '',
          address3: formData.address3 || '',
          address4: formData.address4 || '',
          pincode: parseInt(formData.pincode),
          area: formData.area,
          cityId: parseInt(formData.cityId),
          stateId: parseInt(formData.stateId),
        },
        securityDetails: {
          mobile: formData.mobileNumber,
          email: formData.emailAddress || '',
          panNumber: formData.panNumber,
          gstNumber: formData.gstNumber,
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

      console.log('Registration data:', registrationData);

      const response = await customerAPI.createCustomer(registrationData);

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Registration Successful',
          text2: response.message || 'Customer registered successfully',
        });

        // Navigate to success screen with registration details
        navigation.navigate('RegistrationSuccess', {
          type: 'pharmacy',
          registrationCode: response.data?.id || response.data?.id || 'SUCCESS',
          customerId: response.data?.id,
        });
      } else {
        // Handle specific validation errors
        if (response.message && Array.isArray(response.message)) {
          const errorMessage = response.message.join('\n');
          Alert.alert('Validation Error', errorMessage);
        } else {
          Toast.show({
            type: 'error',
            text1: 'Registration Failed',
            text2: response.message || 'Failed to register. Please try again.',
          });
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to register. Please check your connection and try again.',
      });
    } finally {
      setRegistering(false);
    }
  };

  const handleAddNewHospital = () => {
    navigation.navigate('HospitalSelector');
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
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.flexContainer}
            activeOpacity={1}
            onPress={onClose}
          />
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
                      {item.name}
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
        </View>
      </Modal>
    );
  };

  const handleFileUpload = (field, file) => {
    if (file && file.id) {
      setDocumentIds(prev => ({ ...prev, [field]: file.id }));
    }
    setFormData(prev => ({ ...prev, [`${field}File`]: file }));
    setErrors(prev => ({ ...prev, [`${field}File`]: null }));

    // Add complete document object to uploaded list with docTypeId
    if (file && file.id) {
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
    const file = formData[`${field}File`];
    if (file && file.id) {
      setUploadedDocs(prev => prev.filter(doc => doc.id !== file.id));
    }
    setDocumentIds(prev => ({ ...prev, [field]: null }));
    setFormData(prev => ({ ...prev, [`${field}File`]: null }));
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
              <AppText style={styles.sectionTitle}>License Details <AppText style={styles.asteriskRed}>*</AppText></AppText>

              {/* 20 License */}
              <View style={styles.licenseRow}>
                <AppText style={styles.licenseNumber}>20<AppText style={styles.asteriskRed}>*</AppText></AppText>
                <Icon name="info-outline" size={16} color={colors.textSecondary} />
              </View>

              <FileUploadComponent
                placeholder="Upload 20 license"
                accept={['pdf', 'jpg', 'png']}
                maxSize={15 * 1024 * 1024}
                docType={licenseTypes.LICENSE_20?.docTypeId || 3}
                initialFile={formData.license20File}
                onFileUpload={(file) => handleFileUpload('license20', file)}
                onFileDelete={() => handleFileDelete('license20')}
                errorMessage={errors.license20File}
              />

              <CustomInput
                placeholder="Drug license number"
                value={formData.license20}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, license20: text }));
                  setErrors(prev => ({ ...prev, license20: null }));
                }}
                mandatory={true}
                error={errors.license20}
              />

              <TouchableOpacity
                style={[styles.datePickerInput, errors.license20ExpiryDate && styles.inputError]}
                onPress={() => openDatePicker('license20')}
                activeOpacity={0.7}
              >
                <View style={styles.inputTextContainer}>
                  <AppText style={formData.license20ExpiryDate ? styles.dateText : styles.placeholderText}>
                    {formData.license20ExpiryDate
                      ? new Date(formData.license20ExpiryDate).toLocaleDateString('en-IN')
                      : 'Expiry Date'}
                  </AppText>
                  <AppText style={styles.inlineAsterisk}>*</AppText>
                </View>
                <Calendar />
              </TouchableOpacity>
              {errors.license20ExpiryDate && (
                <AppText style={styles.errorText}>{errors.license20ExpiryDate}</AppText>
              )}

              {/* 21 License */}
              <View style={[styles.licenseRow, { marginTop: 20 }]}>
                <AppText style={styles.licenseNumber}>21<AppText style={styles.asteriskRed}>*</AppText></AppText>
                <Icon name="info-outline" size={16} color={colors.textSecondary} />
              </View>

              <FileUploadComponent
                placeholder="Upload 21 license"
                accept={['pdf', 'jpg', 'png']}
                maxSize={15 * 1024 * 1024}
                docType={licenseTypes.LICENSE_21?.docTypeId || 5}
                initialFile={formData.license21File}
                onFileUpload={(file) => handleFileUpload('license21', file)}
                onFileDelete={() => handleFileDelete('license21')}
                errorMessage={errors.license21File}
              />

              <CustomInput
                placeholder="Drug license number"
                value={formData.license21}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, license21: text }));
                  setErrors(prev => ({ ...prev, license21: null }));
                }}
                mandatory={true}
                error={errors.license21}
              />

              <TouchableOpacity
                style={[styles.datePickerInput, errors.license21ExpiryDate && styles.inputError]}
                onPress={() => openDatePicker('license21')}
                activeOpacity={0.7}
              >
                <View style={styles.inputTextContainer}>
                  <AppText style={formData.license21ExpiryDate ? styles.dateText : styles.placeholderText}>
                    {formData.license21ExpiryDate
                      ? new Date(formData.license21ExpiryDate).toLocaleDateString('en-IN')
                      : 'Expiry Date'}
                  </AppText>
                  <AppText style={styles.inlineAsterisk}>*</AppText>
                </View>
                <Calendar />
              </TouchableOpacity>
              {errors.license21ExpiryDate && (
                <AppText style={styles.errorText}>{errors.license21ExpiryDate}</AppText>
              )}

              {/* 20B License */}
              <View style={[styles.licenseRow, { marginTop: 20 }]}>

                <AppText style={styles.licenseNumber}>20B<AppText style={styles.asteriskRed}>*</AppText></AppText>
                <Icon name="info-outline" size={16} color={colors.textSecondary} />
              </View>

              <FileUploadComponent
                placeholder="Upload 20B license"
                accept={['pdf', 'jpg', 'png']}
                maxSize={15 * 1024 * 1024}
                docType={licenseTypes.LICENSE_20B?.docTypeId || 4}
                initialFile={formData.license20bFile}
                onFileUpload={(file) => handleFileUpload('license20b', file)}
                onFileDelete={() => handleFileDelete('license20b')}
                errorMessage={errors.license20bFile}
              />

              <CustomInput
                placeholder="Drug license number"
                value={formData.license20b}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, license20b: text }));
                  setErrors(prev => ({ ...prev, license20b: null }));
                }}
                mandatory={true}
                error={errors.license20b}
              />

              <TouchableOpacity
                style={[styles.datePickerInput, errors.license20bExpiryDate && styles.inputError]}
                onPress={() => openDatePicker('license20b')}
                activeOpacity={0.7}
              >
                <View style={styles.inputTextContainer}>
                  <AppText style={formData.license20bExpiryDate ? styles.dateText : styles.placeholderText}>
                    {formData.license20bExpiryDate
                      ? new Date(formData.license20bExpiryDate).toLocaleDateString('en-IN')
                      : 'Expiry Date'}
                  </AppText>
                  <AppText style={styles.inlineAsterisk}>*</AppText>
                </View>
                <Calendar />
              </TouchableOpacity>
              {errors.license20bExpiryDate && (
                <AppText style={styles.errorText}>{errors.license20bExpiryDate}</AppText>
              )}

              {/* 21B License */}
              <View style={[styles.licenseRow, { marginTop: 20 }]}>

                <AppText style={styles.licenseNumber}>21B <AppText style={styles.asteriskRed}>*</AppText></AppText>
                <Icon name="info-outline" size={16} color={colors.textSecondary} />
              </View>

              <FileUploadComponent
                placeholder="Upload 21B license"
                accept={['pdf', 'jpg', 'png']}
                maxSize={15 * 1024 * 1024}
                docType={licenseTypes.LICENSE_21B?.docTypeId || 6}
                initialFile={formData.license21bFile}
                onFileUpload={(file) => handleFileUpload('license21b', file)}
                onFileDelete={() => handleFileDelete('license21b')}
                errorMessage={errors.license21bFile}
              />

              <CustomInput
                placeholder="Drug license number"
                value={formData.license21b}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, license21b: text }));
                  setErrors(prev => ({ ...prev, license21b: null }));
                }}
                mandatory={true}
                error={errors.license21b}
              />

              <TouchableOpacity
                style={[styles.datePickerInput, errors.license21bExpiryDate && styles.inputError]}
                onPress={() => openDatePicker('license21b')}
                activeOpacity={0.7}
              >
                <View style={styles.inputTextContainer}>
                  <AppText style={formData.license21bExpiryDate ? styles.dateText : styles.placeholderText}>
                    {formData.license21bExpiryDate
                      ? new Date(formData.license21bExpiryDate).toLocaleDateString('en-IN')
                      : 'Expiry Date'}
                  </AppText>
                  <AppText style={styles.inlineAsterisk}>*</AppText>
                </View>
                <Calendar />
              </TouchableOpacity>
              {errors.license21bExpiryDate && (
                <AppText style={styles.errorText}>{errors.license21bExpiryDate}</AppText>
              )}
            </View>

            <View style={styles.section}>
              <AppText style={styles.sectionSubTitle}>Pharmacy Image<AppText style={styles.asteriskRed}>*</AppText></AppText>

              {/* Pharmacy Image */}
              <FileUploadComponent
                placeholder="Upload"
                accept={['jpg', 'png', 'jpeg']}
                maxSize={15 * 1024 * 1024}
                docType={DOC_TYPES.PHARMACY_IMAGE}
                initialFile={formData.pharmacyImageFile}
                onFileUpload={(file) => handleFileUpload('pharmacyImage', file)}
                onFileDelete={() => handleFileDelete('pharmacyImage')}
                errorMessage={errors.pharmacyImageFile}
              />
            </View>

            {/* General Details Section */}
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>General Details<AppText style={styles.asteriskRed}>*</AppText></AppText>

              <CustomInput
                placeholder="Name of the Pharmacy"
                value={formData.pharmacyName}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, pharmacyName: text }));
                  setErrors(prev => ({ ...prev, pharmacyName: null }));
                }}
                mandatory={true}
                error={errors.pharmacyName}
              />

              <CustomInput
                placeholder="Enter OP, IP, Cathlab etc"
                value={formData.shortName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, shortName: text }))}
              />

              <AddressInputWithLocation
                placeholder="Address 1"
                value={formData.address1}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, address1: text }));
                  setErrors(prev => ({ ...prev, address1: null }));
                }}
                mandatory={true}
                error={errors.address1}
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
                  if (matchedState) loadCities(matchedState.id);
                  setErrors(prev => ({ ...prev, address1: null, address2: null, address3: null, address4: null, pincode: null, area: null, city: null, state: null }));
                }}
              />

              <CustomInput
                placeholder="Address 2"
                value={formData.address2}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, address2: text }));
                  setErrors(prev => ({ ...prev, address2: null }));
                }}
                mandatory={true}
                error={errors.address2}
              />

              <CustomInput
                placeholder="Address 3"
                value={formData.address3}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, address3: text }));
                  setErrors(prev => ({ ...prev, address3: null }));
                }}
                mandatory={true}
                error={errors.address3}
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
                  if (/^\d*$/.test(text) && text.length <= 6) {
                    setFormData(prev => ({ ...prev, pincode: text }));
                    setErrors(prev => ({ ...prev, pincode: null }));
                  }
                }}
                keyboardType="numeric"
                maxLength={6}
                mandatory={true}
                error={errors.pincode}
              />

              <CustomInput
                placeholder="Enter Area"
                value={formData.area}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, area: text }));
                  setErrors(prev => ({ ...prev, area: null }));
                }}
                error={errors.area}
                mandatory={true}
              />

              <View style={styles.dropdownContainer}>
                {formData.city && (
                  <AppText style={[styles.floatingLabel, { color: colors.primary }]}>
                    City<AppText style={styles.asteriskPrimary}>*</AppText>
                  </AppText>
                )}
                <TouchableOpacity
                  style={[styles.dropdown, errors.cityId && styles.inputError]}
                  onPress={() => setShowCityModal(true)}
                >
                  <View style={styles.inputTextContainer}>
                    <AppText style={formData.city ? styles.inputText : styles.placeholderText}>
                      {formData.city || 'City'}
                    </AppText>
                    <AppText style={styles.inlineAsterisk}>*</AppText>
                  </View>
                  <Icon name="arrow-drop-down" size={24} color="#666" />
                </TouchableOpacity>
                {errors.cityId && <AppText style={styles.errorText}>{errors.cityId}</AppText>}
              </View>

              <View style={styles.dropdownContainer}>
                {/* <AppText style={styles.inputLabel}>State*</AppText> */}
                <TouchableOpacity
                  style={[styles.dropdown, errors.stateId && styles.inputError]}
                  onPress={() => setShowStateModal(true)}
                >
                  <View style={styles.inputTextContainer}>
                    <AppText style={formData.state ? styles.inputText : styles.placeholderText}>
                      {formData.state || 'State'}
                    </AppText>
                    <AppText style={styles.inlineAsterisk}>*</AppText>
                  </View>
                  <Icon name="arrow-drop-down" size={24} color="#666" />
                </TouchableOpacity>
                {errors.stateId && <AppText style={styles.errorText}>{errors.stateId}</AppText>}
              </View>
            </View>

            {/* Security Details Section */}
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>Security Details<AppText style={styles.asteriskRed}>*</AppText></AppText>

              {/* Mobile Number with OTP Verification */}


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

              {/* Email Address with OTP Verification */}
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
              {renderOTPInput('email')}

              <FileUploadComponent
                placeholder="Upload PAN"
                accept={['pdf', 'jpg', 'png', 'jpeg']}
                maxSize={15 * 1024 * 1024}
                docType={DOC_TYPES.PAN_CARD}
                initialFile={formData.panFile}
                onFileUpload={(file) => handleFileUpload('pan', file)}
                onFileDelete={() => handleFileDelete('pan')}
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

              {/* <View style={[styles.input, errors.panNumber && styles.inputError, verificationStatus.pan && styles.verifiedInput]}>
                <View style={styles.inputTextContainer}>
                  <CustomInput
                    placeholder="PAN number"
                    value={formData.panNumber}
                    onChangeText={(text) => {
                      const upperText = text.toUpperCase();
                      setFormData(prev => ({ ...prev, panNumber: upperText }));
                      setErrors(prev => ({ ...prev, panNumber: null }));
                      // Auto-verify if valid PAN format
                      if (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(upperText)) {
                        setVerificationStatus(prev => ({ ...prev, pan: true }));
                      } else {
                        setVerificationStatus(prev => ({ ...prev, pan: false }));
                      }
                    }}
                    autoCapitalize="characters"
                    maxLength={10}
                    mandatory={true}
                    error={errors.panNumber}
                    style={styles.flexContainer}
                  />
                  {verificationStatus.pan && (
                    <AppText style={styles.verifiedText}>✓ Verified</AppText>
                  )}
                </View>
              </View> */}
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

              <FileUploadComponent
                placeholder="Upload GST"
                accept={['pdf', 'jpg', 'png', 'jpeg']}
                maxSize={15 * 1024 * 1024}
                docType={DOC_TYPES.GST_CERTIFICATE}
                initialFile={formData.gstFile}
                onFileUpload={(file) => handleFileUpload('gst', file)}
                onFileDelete={() => handleFileDelete('gst')}
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

              <CustomInput
                placeholder="GST number"
                value={formData.gstNumber}
                onChangeText={(text) => {
                  // Allow only letters and numbers - remove any special characters
                  const filtered = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                  setFormData(prev => ({ ...prev, gstNumber: filtered }));
                  setErrors(prev => ({ ...prev, gstNumber: null }));
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

              {/* <AppText style={styles.sectionLabel}>Select category <AppText style={styles.optional}>(Optional)</AppText></AppText> */}

              <View style={styles.categoryOptions}>

                <View style={styles.radioButtonContainer}>

                  {/* Group Corporate Hospital Radio Button */}
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => {
                      setFormData(prev => ({
                        ...prev,
                        selectedCategory: formData.selectedCategory === 'groupCorporateHospital' ? '' : 'groupCorporateHospital',
                        selectedHospitals: formData.selectedCategory === 'groupCorporateHospital' ? [] : prev.selectedHospitals
                      }));
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.radioCircle}>
                      {formData.selectedCategory === 'groupCorporateHospital' && (
                        <View style={styles.radioSelected} />
                      )}
                    </View>
                    <AppText style={styles.radioLabel}>Hospital</AppText>
                  </TouchableOpacity>


                  {/* Doctor Radio Button */}
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => {
                      setFormData(prev => ({
                        ...prev,
                        selectedCategory: formData.selectedCategory === 'doctor' ? '' : 'doctor',
                        selectedDoctors: formData.selectedCategory === 'doctor' ? [] : prev.selectedDoctors
                      }));
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.radioCircle}>
                      {formData.selectedCategory === 'doctor' && (
                        <View style={styles.radioSelected} />
                      )}
                    </View>
                    <AppText style={styles.radioLabel}>Doctor</AppText>
                  </TouchableOpacity>
                </View>
                {/* Group Hospital Selector - Show when Group Corporate Hospital is selected */}
                {formData.selectedCategory === 'groupCorporateHospital' && (
                  <>
                    <TouchableOpacity
                      style={styles.selectorInput}
                      onPress={() => {
                        navigation.navigate('HospitalSelector', {
                          selectedHospitals: formData.selectedHospitals,
                          onSelect: (hospitals) => {
                            setFormData(prev => ({ ...prev, selectedHospitals: hospitals }));
                          }
                        });
                      }}
                      activeOpacity={0.7}
                    >
                      {formData.selectedHospitals && formData.selectedHospitals.length > 0 ? (
                        <View style={styles.selectedItemsContainer}>
                          {formData.selectedHospitals.map((hospital, index) => (
                            <View key={hospital.id} style={styles.selectedItemTag}>
                              <AppText style={styles.selectedItemTagText}>{hospital.name}</AppText>
                              <TouchableOpacity
                                onPress={(e) => {
                                  e.stopPropagation();
                                  setFormData(prev => ({
                                    ...prev,
                                    selectedHospitals: prev.selectedHospitals.filter(h => h.id !== hospital.id)
                                  }));
                                }}
                                style={styles.removeTagButton}
                              >
                                <AppText style={styles.removeTagText}>×</AppText>
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      ) : (
                        <>
                          <AppText style={styles.selectorPlaceholder}>Search hospital name/code</AppText>
                          <Icon name="search" size={20} color="#999" />
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.addNewLink}
                      onPress={() => setShowAddHospitalModal(true)}
                    >
                      <AppText style={styles.addNewLinkText}>+ Add New Hospital</AppText>
                    </TouchableOpacity>
                  </>
                )}



                {/* Doctor Selector - Show when Doctor is selected */}
                {formData.selectedCategory === 'doctor' && (
                  <>
                    <TouchableOpacity
                      style={styles.selectorInput}
                      onPress={() => {
                        navigation.navigate('DoctorSelector', {
                          selectedDoctors: formData.selectedDoctors,
                          onSelect: (selectedDoctors) => {
                            console.log('=== Doctors Selected from DoctorSelector ===');
                            console.log('Selected Doctors:', selectedDoctors);
                            console.log('First Doctor:', selectedDoctors[0]);
                            console.log('=== End Doctors Selection ===');
                            setFormData(prev => ({
                              ...prev,
                              selectedDoctors: selectedDoctors
                            }));
                          }
                        });
                      }}
                    >
                      <AppText style={styles.selectorPlaceholder}>
                        {formData.selectedDoctors.length > 0
                          ? `${formData.selectedDoctors.length} Doctor${formData.selectedDoctors.length !== 1 ? 's' : ''} selected`
                          : 'Search doctor name/code'
                        }
                      </AppText>
                      <Icon name="arrow-drop-down" size={24} color="#666" />
                    </TouchableOpacity>

                   

                    {/* Selected Doctors List */}
                    {formData.selectedDoctors.length > 0 && (
                      <View style={styles.selectedItemsContainer}>
                        {formData.selectedDoctors.map((doctor, index) => (
                          <View key={doctor.id || index} style={styles.selectedItemChip}>
                             <AppText style={styles.addNewDoctorLink}>{ doctor.name || doctor.customerName || `Doctor ${index + 1}` }  </AppText>
                            <TouchableOpacity
                              onPress={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  selectedDoctors: prev.selectedDoctors.filter((_, i) => i !== index)
                                }));
                              }}
                            >
                              <DoctorDeleteIcon />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}

                     {/* Add New Doctor Link */}
                    <TouchableOpacity
                      style={styles.addNewLink}
                      onPress={() => {
                        setShowAddDoctorModal(true);
                      }}
                    >
                      <AppText style={styles.addNewLinkText}>+ Add New Doctor</AppText>
                    </TouchableOpacity>


                  </>
                )}
              </View>

              {/* <View style={styles.divider} /> */}

              <View style={styles.customerGroupContainer}>

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
            </View>

            {/* Stockist Suggestions Section */}
            <View style={styles.section}>
              <AppText style={styles.sectionSubTitle}>
                Stockist Suggestions
                <AppText style={styles.optionalText}> (Optional)</AppText>
              </AppText>

              {/* <AppText style={styles.helperText}>
                Add suggested stockists for this pharmacy
              </AppText> */}

              {formData?.stockists.map((stockist, index) => (
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
                disabled={registering}
              >
                <AppText style={styles.cancelButtonText}>Cancel</AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.registerButton, registering && styles.disabledButton]}
                onPress={handleRegister}
                disabled={registering}
              >
                {registering ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <AppText style={styles.registerButtonText}>Register</AppText>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Pickers */}
      {showDatePicker.license20 && (
        <DateTimePicker
          value={formData.license20ExpiryDate || new Date()}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={handleDateChange}
        />
      )}
      {showDatePicker.license21 && (
        <DateTimePicker
          value={formData.license21ExpiryDate || new Date()}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={handleDateChange}
        />
      )}
      {showDatePicker.license20b && (
        <DateTimePicker
          value={formData.license20bExpiryDate || new Date()}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={handleDateChange}
        />
      )}
      {showDatePicker.license21b && (
        <DateTimePicker
          value={formData.license21bExpiryDate || new Date()}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={handleDateChange}
        />
      )}

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
            state: item.name,
            // Don't reset city and area - allow independent selection
          }));
          setErrors(prev => ({ ...prev, stateId: null }));
        }}
        loading={false}
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
            city: item.name,
            // Don't reset area - allow independent selection
          }));
          setErrors(prev => ({ ...prev, cityId: null }));
        }}
        loading={loadingCities}
      />


      {/* Add New Hospital Modal */}
      <AddNewHospitalModal
        visible={showAddHospitalModal}
        onClose={() => setShowAddHospitalModal(false)}
        pharmacyName={formData.pharmacyName}
        onAdd={(hospital) => {
          // Console the raw response from AddNewHospitalModal
          console.log('=== Hospital Response from AddNewHospitalModal ===');
          console.log('Full Response:', hospital);
          console.log('Hospital ID:', hospital.id || hospital.customerId);
          console.log('=== End Hospital Response ===');

          // Extract hospital data for selectedHospitals
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

          console.log('=== Adding Hospital to selectedHospitals ===');
          console.log('Hospital Data:', hospitalData);
          console.log('=== End Hospital Data ===');

          setFormData(prev => ({
            ...prev,
            selectedHospitals: [...(prev.selectedHospitals || []), hospitalData]
          }));
          setShowAddHospitalModal(false);
        }}
      />

      {/* Add New Doctor Modal */}
      <AddNewDoctorModal
        visible={showAddDoctorModal}
        onClose={() => setShowAddDoctorModal(false)}
        pharmacyName={formData.pharmacyName}
        onAdd={(doctor) => {
          // Console the raw response from AddNewDoctorModal
          console.log('=== Doctor Response from AddNewDoctorModal ===');
          console.log('Full Response:', doctor);
          console.log('Doctor ID:', doctor.id || doctor.customerId);
          console.log('=== End Doctor Response ===');

          // Extract doctor data for selectedDoctors
          const doctorData = {
            id: doctor.id || doctor.customerId,
            name: doctor.name || doctor.pharmacyName,
            code: doctor.code || doctor.shortName,
            customerId: doctor.id || doctor.customerId,
            stateId: doctor.stateId,
            cityId: doctor.cityId,
            area: doctor.area,
            city: doctor.city,
            state: doctor.state,
            mobileNumber: doctor.mobileNumber,
            emailAddress: doctor.emailAddress,
            isNew: true,
            ...doctor,
          };

          console.log('=== Adding Doctor to selectedDoctors ===');
          console.log('Doctor Data:', doctorData);
          console.log('=== End Doctor Data ===');

          setFormData(prev => ({
            ...prev,
            selectedDoctors: [...(prev.selectedDoctors || []), doctorData]
          }));
          setShowAddDoctorModal(false);
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
    paddingVertical: 16,
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
  }, sectionTopSpacing: {
    marginTop: 32,

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
  optionalText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#999',
  },
  licenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  licenseNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginRight: 8,
  },
  datePickerInput: {
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
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: colors.gray,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  floatingLabel: {
    position: 'absolute',
    top: -8,
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
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
  },
  dropdownPlaceholder: {
    color: '#999',
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
    minWidth: 70,
    alignItems: 'center',
  },
  verifiedButton: {
    // backgroundColor: '#E8F5E9',
  },
  inlineVerifyText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  verifiedText: {
    color: colors.primary,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 4,
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
  mappingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mappingLabel: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  dot: {
    marginHorizontal: 8,
  },
  mappingType: {
    fontSize: 14,
    color: '#666',
  },
  searchDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    marginBottom: 12,
  },
  searchDropdownText: {
    fontSize: 14,
    color: '#999',
  },
  addNewButton: {
    paddingVertical: 8,
    marginBottom: 16,
  },
  addNewButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  customerGroupLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  radioGroup: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 8,
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
  checkboxGroup: {
    flexDirection: 'row',
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxText: {
    fontSize: 14,
    color: '#333',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  addMoreButton: {
    paddingVertical: 8,
  },
  addMoreButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
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
  disabledButton: {
    opacity: 0.6,
  },
  // Modal styles
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
  // New styles for category selection


  customerGroupContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
  },


  stockistContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  }, stockistHeader: {
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
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    // marginBottom: 8,
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
  radioLabel: {
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
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 20,
  },
  radioGroupContainer: {
    // marginVertical: 12,
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  radioOptionFlex: {
    flex: 1,
    marginRight: 16,
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
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#FFF5ED',
  },
  addNewButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  selectedItemsContainer: {
    marginBottom: 16,
  },
  selectedItemsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
   selectedItemChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF5ED',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  selectedItemText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  addNewDoctorLink: {
    fontSize: 14,
    color: "#555",
    fontWeight: '500',
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
  }
});

export default PharmacyWholesalerRetailerForm;