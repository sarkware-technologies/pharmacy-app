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
import CustomInput from '../../../components/CustomInput';
import FileUploadComponent from '../../../components/FileUploadComponent';
import Calendar from '../../../components/icons/Calendar';
import ChevronLeft from '../../../components/icons/ChevronLeft';
import ChevronRight from '../../../components/icons/ChevronRight';
import { customerAPI } from '../../../api/customer';

// Document types for file uploads
const DOC_TYPES = {
  LICENSE_20B: 2,  // License Type ID for 20B
  LICENSE_21B: 4,  // License Type ID for 21B
  PHARMACY_IMAGE: 1,      
  PAN: 7,
  GST: 8,
};

// Mock data for areas only (as there's no API for areas)
const MOCK_AREAS = [
  { id: 0, name: 'Vadgaonsheri'}, 
  { id: 1, name: 'Kharadi'}, 
  { id: 2, name: 'Viman Nagar'}, 
  { id: 3, name: 'Kalyani Nagar'}, 
  { id: 4, name: 'Koregaon Park'}
];

const PharmacyWholesalerForm = () => {

  const navigation = useNavigation();
  const route = useRoute();
  const scrollViewRef = useRef(null);
  const otpRefs = useRef({});

  // Get registration type data from route params
  const { type, typeName, typeId, category, categoryName, categoryId, subCategory, subCategoryName, subCategoryId } = route.params || {};

  // State for license types fetched from API
  const [licenseTypes, setLicenseTypes] = useState({
    LICENSE_20B: { id: 2, docTypeId: 4, name: '20B', code: 'LIC20B' },
    LICENSE_21B: { id: 4, docTypeId: 6, name: '21B', code: 'LIC21B' },
  });

  // Form state
  const [formData, setFormData] = useState({
    // License Details
    license20b: '',
    license20bFile: null,
    license20bExpiryDate: '',
    license21b: '',
    license21bFile: null,
    license21bExpiryDate: '',
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
    areaId: null,
    city: '',
    cityId: null,
    state: '',
    stateId: null,
    
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
    selectedCategory: '', // 'groupCorporateHospital', 'pharmacy', or ''
    selectedHospitals: [],
    selectedPharmacies: [],
    
    // Customer group
    customerGroupId: 1,
    
    // Stockist Suggestions
    stockists: [],
  });

  // Error state
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);

  // Dropdown data
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [customerGroups, setCustomerGroups] = useState([]);

  // Date picker states
  const [showDatePicker, setShowDatePicker] = useState({
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

  // Modal states for hospital and pharmacy selectors
  const [showHospitalModal, setShowHospitalModal] = useState(false);
  const [showPharmacyModal, setShowPharmacyModal] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const otpSlideAnim = useRef(new Animated.Value(-50)).current;

  // Uploaded document IDs
  const [uploadedDocIds, setUploadedDocIds] = useState([]);

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
    loadAreas();

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
      // Load license types first
      const licenseResponse = await customerAPI.getLicenseTypes(typeId || 1, categoryId || 2);
      if (licenseResponse.success && licenseResponse.data) {
        const licenseData = {};
        licenseResponse.data.forEach(license => {
          if (license.code === 'LIC20B') {
            licenseData.LICENSE_20B = {
              id: license.id,
              docTypeId: license.docTypeId,
              name: license.name,
              code: license.code,
            };
          } else if (license.code === 'LIC21B') {
            licenseData.LICENSE_21B = {
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

  // Load cities when state changes
  // useEffect(() => {
  //   if (formData.stateId) {
  //     loadCities(formData.stateId);
  //   } else {
  //     setCities([]);
  //     setAreas([]);
  //     setFormData(prev => ({ ...prev, cityId: null, city: '', areaId: null, area: '' }));
  //   }
  // }, [formData.stateId]);

  // Load areas when city changes
  // useEffect(() => {
  //   if (formData.cityId) {
  //     loadAreas(formData.cityId);
  //   } else {
  //     setAreas([]);
  //     setFormData(prev => ({ ...prev, areaId: null, area: '' }));
  //   }
  // }, [formData.cityId]);

  const loadCities = async (stateId=null) => {  console.log("loadCities is called");
    try {
      setLoadingCities(true);
      const response = await customerAPI.getCities(stateId);
      console.log(response);
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

  const loadAreas = async (cityId) => {
    try {
      setLoadingAreas(true);
      //const response = await customerAPI.getAreas(cityId);
      //if (response.success) {
        setAreas(MOCK_AREAS || []);
      //}
    } catch (error) {
      console.error('Error loading areas:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load areas',
      });
    } finally {
      setLoadingAreas(false);
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
      
      const payload = {
        customerId: 1, // Using temporary customer ID as per curl
      };

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
      
      const payload = {
        customerId: 1, // Using temporary customer ID as per curl
      };

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
        [`${selectedDateField}ExpiryDate`]: formattedDate 
      }));
      setErrors(prev => ({ ...prev, [`${selectedDateField}ExpiryDate`]: null }));
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
        <Text style={styles.otpTitle}>Enter 4-digit OTP</Text>
        <View style={styles.otpInputContainer}>
          {[0, 1, 2, 3].map(index => (
            <TextInput
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
          <Text style={styles.otpTimer}>
            {otpTimers[field] > 0 ? `Resend in ${otpTimers[field]}s` : ''}
          </Text>
          {otpTimers[field] === 0 && (
            <TouchableOpacity onPress={() => handleResendOTP(field)}>
              <Text style={styles.resendText}>Resend OTP</Text>
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
    }
  };

  const handleFileDelete = (field) => {
    const file = formData[field];
    if (file && file.id) {
      setUploadedDocIds(prev => prev.filter(id => id !== file.id));
    }
    setFormData(prev => ({ ...prev, [field]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate required fields
    if (!formData.license20b) newErrors.license20b = 'License 20B number is required';
    if (!formData.license20bFile) newErrors.license20bFile = 'License 20B upload is required';
    if (!formData.license20bExpiryDate) newErrors.license20bExpiryDate = 'License 20B expiry date is required';
    if (!formData.license21b) newErrors.license21b = 'License 21B number is required';
    if (!formData.license21bFile) newErrors.license21bFile = 'License 21B upload is required';
    if (!formData.license21bExpiryDate) newErrors.license21bExpiryDate = 'License 21B expiry date is required';
    if (!formData.pharmacyImageFile) newErrors.pharmacyImageFile = 'Pharmacy image is required';
    if (!formData.pharmacyName) newErrors.pharmacyName = 'Pharmacy name is required';
    if (!formData.address1) newErrors.address1 = 'Address is required';
    if (!formData.pincode || formData.pincode.length !== 6) newErrors.pincode = 'Valid 6-digit pincode is required';
    if (!formData.areaId) newErrors.area = 'Area is required';
    if (!formData.cityId) newErrors.city = 'City is required';
    if (!formData.stateId) newErrors.state = 'State is required';
    if (!formData.mobileNumber || formData.mobileNumber.length !== 10) newErrors.mobileNumber = 'Valid 10-digit mobile number is required';
    if (!verificationStatus.mobile) newErrors.mobileVerification = 'Mobile number verification is required';
    if (!verificationStatus.email) newErrors.emailVerification = 'Email verification is required';
    if (!formData.panNumber || formData.panNumber.length !== 10) newErrors.panNumber = 'Valid PAN number is required';
    if (!formData.gstNumber || formData.gstNumber.length !== 15) newErrors.gstNumber = 'Valid GST number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const handleRegister = async () => {   console.log("handleRegister is called");
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
      // Prepare registration payload
      const registrationData = {
        typeId: typeId || 1,
        categoryId: categoryId || 2,
        subCategoryId: subCategoryId || 0,
        isMobileVerified: verificationStatus.mobile,
        isEmailVerified: verificationStatus.email,
        isExisting: false,
        licenceDetails: {
          registrationDate: new Date().toISOString(),
          licence: [
            {
              licenceTypeId: licenseTypes.LICENSE_20B?.id || 2,
              licenceNo: formData.license20b,
              licenceValidUpto: formData.license20bExpiryDate,
            },
            {
              licenceTypeId: licenseTypes.LICENSE_21B?.id || 4,
              licenceNo: formData.license21b,
              licenceValidUpto: formData.license21bExpiryDate,
            },
          ],
        },
        // customerDocIds: uploadedDocIds,
        isBuyer: false,
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
          cityId: formData.cityId,
          stateId: formData.stateId,
        },
        securityDetails: {
          mobile: formData.mobileNumber,
          email: formData.emailAddress,
          panNumber: formData.panNumber,
          gstNumber: formData.gstNumber,
        },
        suggestedDistributors: formData.stockists.map(stockist => ({
          name: stockist.name,
          code: stockist.code,
          city: stockist.city,
        })),
      };


      const response = await customerAPI.createCustomer(registrationData);

      console.log(response, "response");
      
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Pharmacy registered successfully!',
        });

        // Navigate to success screen with registration details
        navigation.navigate('RegistrationSuccess', {
          type: 'pharmacy',
          registrationCode: response.data?.code || response.data?.id || 'SUCCESS',
          customerId: response.data?.id,
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
            text2: response.details || 'Failed to register pharmacy. Please try again.',
          });
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2:  error + '. Please try again.',
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

  // Dropdown Modal Component
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
            style={{flex: 1}} 
            activeOpacity={1} 
            onPress={onClose}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
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
                      selectedId === item.id && styles.modalItemSelected
                    ]}
                    onPress={() => {
                      onSelect(item);
                      onClose();
                    }}
                  >
                    <Text style={[
                      styles.modalItemText,
                      selectedId === item.id && styles.modalItemTextSelected
                    ]}>
                      {item.name || item.label}
                    </Text>
                    {selectedId === item.id && (
                      <Icon name="check" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No items available</Text>
                }
                style={styles.modalList}
              />
            )}
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ChevronLeft />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registration</Text>
      </View>

      <View style={styles.typeHeader}>
        <View style={styles.typeTag}>
          <Text style={styles.typeTagText}>{typeName || 'Pharmacy'}</Text>
        </View>        
        <ChevronRight height={10} />        
        <View style={[styles.typeTag, styles.typeTagActive]}>
          <Text style={[styles.typeTagText, styles.typeTagTextActive]}>{categoryName}</Text>
        </View>
      </View>

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
              <Text style={styles.sectionTitle}>License Details <Text style={{color: 'red'}}>*</Text></Text>
              
              {/* 20B License */}
              <View style={styles.licenseRow}>
                <Text style={styles.licenseNumber}>20B <Text style={{color: 'red'}}>*</Text></Text>
                <Icon name="info-outline" size={16} color={colors.textSecondary} />
              </View>
              
              <FileUploadComponent
                placeholder="Upload 20B license"
                accept={['pdf', 'jpg', 'png']}
                maxSize={10 * 1024 * 1024}
                docType={licenseTypes.LICENSE_20B?.docTypeId || 4}
                initialFile={formData.license20bFile}
                onFileUpload={(file) => handleFileUpload('license20bFile', file)}
                onFileDelete={() => handleFileDelete('license20bFile')}
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
                <Text style={formData.license20bExpiryDate ? styles.dateText : styles.placeholderText}>
                  {formatDate(formData.license20bExpiryDate) || 'Expiry Date*'}
                </Text>
                <Calendar />
              </TouchableOpacity>
              {errors.license20bExpiryDate && (
                <Text style={styles.errorText}>{errors.license20bExpiryDate}</Text>
              )}

              {/* 21B License */}
              <View style={styles.licenseRow}>
                <Text style={styles.licenseNumber}>21B <Text style={{color: 'red'}}>*</Text></Text>
                <Icon name="info-outline" size={16} color={colors.textSecondary} />
              </View>
              
              <FileUploadComponent
                placeholder="Upload 21B license"
                accept={['pdf', 'jpg', 'png']}
                maxSize={10 * 1024 * 1024}
                docType={licenseTypes.LICENSE_21B?.docTypeId || 6}
                initialFile={formData.license21bFile}
                onFileUpload={(file) => handleFileUpload('license21bFile', file)}
                onFileDelete={() => handleFileDelete('license21bFile')}
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
                <Text style={formData.license21bExpiryDate ? styles.dateText : styles.placeholderText}>
                  {formatDate(formData.license21bExpiryDate) || 'Expiry Date*'}
                </Text>
                <Calendar />
              </TouchableOpacity>
              {errors.license21bExpiryDate && (
                <Text style={styles.errorText}>{errors.license21bExpiryDate}</Text>
              )}

              {/* Pharmacy Image */}
              <FileUploadComponent
                placeholder="Pharmacy Image*"
                accept={['jpg', 'png', 'jpeg']}
                maxSize={10 * 1024 * 1024}
                docType={DOC_TYPES.PHARMACY_IMAGE}
                initialFile={formData.pharmacyImageFile}
                onFileUpload={(file) => handleFileUpload('pharmacyImageFile', file)}
                onFileDelete={() => handleFileDelete('pharmacyImageFile')}
                errorMessage={errors.pharmacyImageFile}
              />
            </View>

            {/* General Details Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>General Details*</Text>
              
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
                placeholder="Short Name (Optional)"
                value={formData.shortName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, shortName: text }))}
              />
              
              <CustomInput
                placeholder="Address 1"
                value={formData.address1}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, address1: text }));
                  setErrors(prev => ({ ...prev, address1: null }));
                }}
                mandatory={true}
                error={errors.address1}
              />
              
              <CustomInput
                placeholder="Address 2"
                value={formData.address2}
                onChangeText={(text) => setFormData(prev => ({ ...prev, address2: text }))}
              />
              
              <CustomInput
                placeholder="Address 3"
                value={formData.address3}
                onChangeText={(text) => setFormData(prev => ({ ...prev, address3: text }))}
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
                mandatory={true}
                error={errors.pincode}
              />
              
              {/* State Dropdown */}
              <View style={styles.dropdownContainer}>
                <Text style={styles.inputLabel}>State*</Text>
                <TouchableOpacity 
                  style={[styles.dropdown, errors.state && styles.inputError]}
                  onPress={() => setShowStateModal(true)}
                >
                  <Text style={[styles.dropdownText, !formData.state && styles.dropdownPlaceholder]}>
                    {formData.state || 'Select State'}
                  </Text>
                  <Icon name="arrow-drop-down" size={24} color="#666" />
                </TouchableOpacity>
                {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
              </View>
              
              {/* City Dropdown */}
              <View style={styles.dropdownContainer}>
                <Text style={styles.inputLabel}>City*</Text>
                <TouchableOpacity 
                  style={[styles.dropdown, errors.city && styles.inputError]}
                  onPress={() => setShowCityModal(true)}
                  //disabled={!formData.stateId}
                >
                  <Text style={[styles.dropdownText, !formData.city && styles.dropdownPlaceholder]}>
                    {formData.city || 'Select City'}
                  </Text>
                  <Icon name="arrow-drop-down" size={24} color={formData.stateId ? "#666" : "#ccc"} />
                </TouchableOpacity>
                {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
              </View>
              
              {/* Area Dropdown */}
              <View style={styles.dropdownContainer}>
                <Text style={styles.inputLabel}>Area*</Text>
                <TouchableOpacity 
                  style={[styles.dropdown, errors.area && styles.inputError]}
                  onPress={() => setShowAreaModal(true)}
                  //disabled={!formData.cityId}
                >
                  <Text style={[styles.dropdownText, !formData.area && styles.dropdownPlaceholder]}>
                    {formData.area || 'Select Area'}
                  </Text>
                  <Icon name="arrow-drop-down" size={24} color={formData.cityId ? "#666" : "#ccc"} />
                </TouchableOpacity>
                {errors.area && <Text style={styles.errorText}>{errors.area}</Text>}
              </View>
            </View>

            {/* Security Details Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Security Details *</Text>
              
              {/* Mobile Number with OTP Verification */}
              <View style={[styles.inputWithButton, errors.mobileNumber && styles.inputError]}>
                <Text style={styles.countryCode}>+91</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="Mobile Number"
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
                    <Text style={[
                      styles.inlineVerifyText,
                      verificationStatus.mobile && styles.verifiedText
                    ]}>
                      {verificationStatus.mobile ? 'Verified' : 'Verify'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
              {errors.mobileNumber && (
                <Text style={styles.errorText}>{errors.mobileNumber}</Text>
              )}
              {errors.mobileVerification && (
                <Text style={styles.errorText}>{errors.mobileVerification}</Text>
              )}
              {renderOTPInput('mobile')}

              {/* Email Address with OTP Verification */}
              <View style={[styles.inputWithButton, errors.emailAddress && styles.inputError]}>
                <TextInput
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
                    <Text style={[
                      styles.inlineVerifyText,
                      verificationStatus.email && styles.verifiedText
                    ]}>
                      {verificationStatus.email ? 'Verified' : 'Verify'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
              {errors.emailAddress && (
                <Text style={styles.errorText}>{errors.emailAddress}</Text>
              )}
              {errors.emailVerification && (
                <Text style={styles.errorText}>{errors.emailVerification}</Text>
              )}
              {renderOTPInput('email')}
              
              <FileUploadComponent
                placeholder="Upload PAN Card (e.g., ASDSD12345G)"
                accept={['pdf', 'jpg', 'png']}
                maxSize={10 * 1024 * 1024}
                docType={DOC_TYPES.PAN}
                initialFile={formData.panFile}
                onFileUpload={(file) => handleFileUpload('panFile', file)}
                onFileDelete={() => handleFileDelete('panFile')}
              />
              
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
              
              <FileUploadComponent
                placeholder="Upload GST (e.g., 27ASDSD1234F1Z5)"
                accept={['pdf', 'jpg', 'png']}
                maxSize={10 * 1024 * 1024}
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
              <Text style={styles.sectionTitle}>Mapping</Text>
              
              <Text style={styles.sectionLabel}>Select category <Text style={styles.optional}>(Optional)</Text></Text>
              
              <View style={styles.categoryOptions}>
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
                  <Text style={styles.radioLabel}>Group Corporate Hospital</Text>
                </TouchableOpacity>

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
                              <Text style={styles.selectedItemTagText}>{hospital.name}</Text>
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
                                <Text style={styles.removeTagText}>×</Text>
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      ) : (
                        <>
                          <Text style={styles.selectorPlaceholder}>Search hospital name/code</Text>                
                          <Icon name="search" size={20} color="#999" />
                        </>
                      )}
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.addNewLink}
                      onPress={() => setShowHospitalModal(true)}
                    >            
                      <Text style={styles.addNewLinkText}>+ Add New Group Hospital</Text>
                    </TouchableOpacity>
                  </>
                )}

                {/* Pharmacy Radio Button */}
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => {
                    setFormData(prev => ({ 
                      ...prev, 
                      selectedCategory: formData.selectedCategory === 'pharmacy' ? '' : 'pharmacy',
                      selectedPharmacies: formData.selectedCategory === 'pharmacy' ? [] : prev.selectedPharmacies
                    }));
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.radioCircle}>
                    {formData.selectedCategory === 'pharmacy' && (
                      <View style={styles.radioSelected} />
                    )}
                  </View>
                  <Text style={styles.radioLabel}>Pharmacy</Text>
                </TouchableOpacity>
              </View>

              {/* Pharmacy Selector - Show when Pharmacy is selected */}
              {formData.selectedCategory === 'pharmacy' && (
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
                    <Text style={styles.selectorPlaceholder}>Search pharmacy name/code</Text>
                    <Icon name="search" size={20} color="#999" />
                  </TouchableOpacity>
                  
                  {/* Selected Pharmacies List */}
                  {formData.selectedPharmacies.map((pharmacy) => (
                    <View key={pharmacy.id} style={styles.selectedPharmacyItem}>
                      <View style={styles.pharmacyInfo}>
                        <Text style={styles.pharmacyName}>{pharmacy.name}</Text>
                        <Text style={styles.pharmacyCode}>{pharmacy.code}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          setFormData(prev => ({
                            ...prev,
                            selectedPharmacies: prev.selectedPharmacies.filter(p => p.id !== pharmacy.id)
                          }));
                        }}
                      >                
                        <Icon name="close" size={20} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                  
                  <TouchableOpacity 
                    style={styles.addNewLink}
                    onPress={() => setShowPharmacyModal(true)}
                  >
                    <Text style={styles.addNewLinkText}>+ Add New Pharmacy</Text>
                  </TouchableOpacity>
                </>
              )}

              <View style={styles.divider} />
              
              <Text style={styles.sectionLabel}>Customer Group</Text>
              
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
                    <Text style={styles.radioText}>9 Doctor Supply</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.radioOption, styles.radioOptionFlex, styles.disabledOption]}
                    disabled={true}
                  >
                    <View style={[styles.radioCircle, styles.disabledRadio]}>
                    </View>
                    <Text style={[styles.radioText, styles.disabledText]}>10 VQ</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.radioRow}>
                  <TouchableOpacity 
                    style={[styles.radioOption, styles.radioOptionFlex, styles.disabledOption]}
                    disabled={true}
                  >
                    <View style={[styles.radioCircle, styles.disabledRadio]}>
                    </View>
                    <Text style={[styles.radioText, styles.disabledText]}>11 RFQ</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.radioOption, styles.radioOptionFlex, styles.disabledOption]}
                    disabled={true}
                  >
                    <View style={[styles.radioCircle, styles.disabledRadio]}>
                    </View>
                    <Text style={[styles.radioText, styles.disabledText]}>12 GOVT</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Stockist Suggestions Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Stockist Suggestions
                <Text style={styles.optionalText}> (Optional)</Text>
              </Text>
              
              {formData.stockists.map((stockist, index) => (
                <View key={index} style={styles.stockistContainer}>
                  <View style={styles.stockistHeader}>
                    <Text style={styles.stockistTitle}>Stockist {index + 1}</Text>
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
              
              <TouchableOpacity style={styles.addMoreButton} onPress={handleAddStockist}>
                <Text style={styles.addMoreButtonText}>+ Add Stockist</Text>
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCancel}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.registerButton, loading && styles.disabledButton]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.registerButtonText}>Register</Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Pickers */}
      {showDatePicker.license20b && (
        <DateTimePicker
          value={formData.license20bExpiryDate ? new Date(formData.license20bExpiryDate) : new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
      {showDatePicker.license21b && (
        <DateTimePicker
          value={formData.license21bExpiryDate ? new Date(formData.license21bExpiryDate) : new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
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
            cityId: null,
            city: '',
            areaId: null,
            area: ''
          }));
          setErrors(prev => ({ ...prev, state: null }));
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
            city: item.name,
            areaId: null,
            area: ''
          }));
          setErrors(prev => ({ ...prev, city: null }));
        }}
        loading={loadingCities}
      />

      <DropdownModal
        visible={showAreaModal}
        onClose={() => setShowAreaModal(false)}
        title="Select Area"
        data={areas}
        selectedId={formData.areaId}
        onSelect={(item) => {
          setFormData(prev => ({ 
            ...prev, 
            areaId: item.id, 
            area: item.name 
          }));
          setErrors(prev => ({ ...prev, area: null }));
        }}
        loading={loadingAreas}
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
              <Text style={styles.modalIcon}>!</Text>
            </View>
            <Text style={styles.modalTitle}>Are you sure you want to Cancel the Onboarding?</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalYesButton}
                onPress={() => {
                  setShowCancelModal(false);
                  navigation.goBack();
                }}
              >
                <Text style={styles.modalYesButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalNoButton}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={styles.modalNoButtonText}>No</Text>
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
    paddingBottom: 100,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
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
    backgroundColor: '#FAFAFA',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
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
    backgroundColor: '#FAFAFA',
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
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    marginBottom: 12,
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
  modalLoader: {
    paddingVertical: 50,
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
  modalList: {
    paddingHorizontal: 16,
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
  // New styles for category selection
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
    marginBottom: 8,
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
    marginVertical: 12,
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
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
});

export default PharmacyWholesalerForm;