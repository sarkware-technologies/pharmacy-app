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
    
    // Customer group
    customerGroupId: 1,
    isIPD: false,
    isGOVT: false,
    isBuyer: false,
    
    // Stockist Suggestions
    suggestedDistributors: [],
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
  const [areas, setAreas] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);

  // Dropdown modal states
  const [showStateModal, setShowStateModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);

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

  // Load cities when state changes
  useEffect(() => {
    if (formData.stateId) {
      loadCities(formData.stateId);
      // Reset city and area when state changes
      setFormData(prev => ({ ...prev, cityId: '', city: '', areaId: '', area: '' }));
      setAreas([]);
    }
  }, [formData.stateId]);

  // Load areas when city changes
  useEffect(() => {
    if (formData.cityId) {
      loadAreas(formData.cityId);
      // Reset area when city changes
      setFormData(prev => ({ ...prev, areaId: '', area: '' }));
    }
  }, [formData.cityId]);

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

  const loadCities = async (stateId) => {
    setLoadingCities(true);
    try {
      const response = await customerAPI.getCities(stateId);
      if (response.success && response.data) {
        const _cities = [];
        for (let i = 0; i < response.data.cities.length; i++) {
          _cities.push({ id: response.data.cities[i].id, name: response.data.cities[i].cityName });
        }
        setCities(_cities || []);
        //setCities(response.data);
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

  const loadAreas = async (cityId) => {
    setLoadingAreas(true);
    try {
      // Assuming there's an API endpoint for areas based on city
      // For now, using mock data
      const mockAreas = [
        { id: 0, name: 'Vadgaonsheri'}, 
  { id: 1, name: 'Kharadi'}, 
  { id: 2, name: 'Viman Nagar'}, 
  { id: 3, name: 'Kalyani Nagar'}, 
  { id: 4, name: 'Koregaon Park'}
      ];
      setAreas(mockAreas);
    } catch (error) {
      console.error('Failed to load areas:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load areas',
      });
    } finally {
      setLoadingAreas(false);
    }
  };

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

    setLoading(true);
    try {
      const requestData = {
        customerId: 1, // Using default customerId for now
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
      setLoading(false);
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

  const handleOtpVerification = async (field) => {
    const otp = otpValues[field].join('');
    
    setLoading(true);
    try {
      const requestData = {
        customerId: 1,
        [field === 'mobile' ? 'mobile' : 'email']: 
          field === 'mobile' ? formData.mobileNumber : formData.emailAddress
      };

      const response = await customerAPI.validateOTP(otp, requestData);

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
      setLoading(false);
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
              editable={!loading}
            />
          ))}
        </View>
        <View style={styles.otpFooter}>
          <Text style={styles.otpTimer}>
            {otpTimers[field] > 0 ? `Resend in ${otpTimers[field]}s` : ''}
          </Text>
          {otpTimers[field] === 0 && (
            <TouchableOpacity onPress={() => handleResendOTP(field)} disabled={loading}>
              <Text style={styles.resendText}>Resend OTP</Text>
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
    if (!documentIds.pharmacyImage) newErrors.pharmacyImageFile = 'Pharmacy image is required';
    if (!formData.pharmacyName) newErrors.pharmacyName = 'Pharmacy name is required';
    if (!formData.address1) newErrors.address1 = 'Address is required';
    if (!formData.pincode || formData.pincode.length !== 6) newErrors.pincode = 'Valid 6-digit pincode is required';
    if (!formData.area) newErrors.area = 'Area is required';
    if (!formData.cityId) newErrors.cityId = 'City is required';
    if (!formData.stateId) newErrors.stateId = 'State is required';
    if (!formData.mobileNumber || formData.mobileNumber.length !== 10) newErrors.mobileNumber = 'Valid 10-digit mobile number is required';
    if (!verificationStatus.mobile) newErrors.mobileVerification = 'Mobile number verification is required';
    if (!formData.panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
      newErrors.panNumber = 'Valid PAN number is required (e.g., ABCDE1234F)';
    }
    if (!formData.gstNumber || !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}[A-Z]{1}[0-9]{1}$/.test(formData.gstNumber)) {
      newErrors.gstNumber = 'Valid GST number is required (e.g., 27ABCDE1234F1Z5)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Registration',
      'Are you sure you want to cancel? All entered data will be lost.',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: () => navigation.goBack() },
      ]
    );
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
        customerDocIds: [
          documentIds.license20,
          documentIds.license21,
          documentIds.license20b,
          documentIds.license21b,
          documentIds.pharmacyImage,
          documentIds.pan,
          documentIds.gst,
        ].filter(id => id !== null),
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
        suggestedDistributors: formData.suggestedDistributors
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
          registrationCode: response.data?.code || response.data?.id || 'SUCCESS',
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
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={onClose}
        >
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
                      selectedId == item.id && styles.modalItemSelected
                    ]}
                    onPress={() => {
                      onSelect(item);
                      onClose();
                    }}
                  >
                    <Text style={[
                      styles.modalItemText,
                      selectedId == item.id && styles.modalItemTextSelected
                    ]}>
                      {item.name}
                    </Text>
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

  const handleFileUpload = (field, file) => {
    if (file && file.id) {
      setDocumentIds(prev => ({ ...prev, [field]: file.id }));
    }
    setFormData(prev => ({ ...prev, [`${field}File`]: file }));
    setErrors(prev => ({ ...prev, [`${field}File`]: null }));
  };

  const handleFileDelete = (field) => {
    setDocumentIds(prev => ({ ...prev, [field]: null }));
    setFormData(prev => ({ ...prev, [`${field}File`]: null }));
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
          <Text style={styles.typeTagText}>Pharmacy</Text>
        </View>        
        <ChevronRight />        
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

              {/* 20 License */}
              <View style={styles.licenseRow}>
                <Text style={styles.licenseNumber}>20  <Text style={{color: 'red'}}>*</Text></Text>
                <Icon name="info-outline" size={16} color={colors.textSecondary} />
              </View>
              
              <FileUploadComponent
                placeholder="Upload 20 license"
                accept={['pdf', 'jpg', 'png']}
                maxSize={10 * 1024 * 1024}
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
                <Text style={formData.license20ExpiryDate ? styles.dateText : styles.placeholderText}>
                  {formData.license20ExpiryDate 
                    ? new Date(formData.license20ExpiryDate).toLocaleDateString('en-IN')
                    : 'Expiry Date*'}
                </Text>
                <Calendar />
              </TouchableOpacity>
              {errors.license20ExpiryDate && (
                <Text style={styles.errorText}>{errors.license20ExpiryDate}</Text>
              )}

              {/* 21 License */}
              <View style={styles.licenseRow}>
                <Text style={styles.licenseNumber}>21  <Text style={{color: 'red'}}>*</Text></Text>
                <Icon name="info-outline" size={16} color={colors.textSecondary} />
              </View>
              
              <FileUploadComponent
                placeholder="Upload 21 license"
                accept={['pdf', 'jpg', 'png']}
                maxSize={10 * 1024 * 1024}
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
                <Text style={formData.license21ExpiryDate ? styles.dateText : styles.placeholderText}>
                  {formData.license21ExpiryDate 
                    ? new Date(formData.license21ExpiryDate).toLocaleDateString('en-IN')
                    : 'Expiry Date*'}
                </Text>
                <Calendar />
              </TouchableOpacity>
              {errors.license21ExpiryDate && (
                <Text style={styles.errorText}>{errors.license21ExpiryDate}</Text>
              )}
              
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
                <Text style={formData.license20bExpiryDate ? styles.dateText : styles.placeholderText}>
                  {formData.license20bExpiryDate 
                    ? new Date(formData.license20bExpiryDate).toLocaleDateString('en-IN')
                    : 'Expiry Date*'}
                </Text>
                <Calendar />
              </TouchableOpacity>
              {errors.license20bExpiryDate && (
                <Text style={styles.errorText}>{errors.license20bExpiryDate}</Text>
              )}

              {/* 21B License */}
              <View style={styles.licenseRow}>
                <Text style={styles.licenseNumber}>21B  <Text style={{color: 'red'}}>*</Text></Text>
                <Icon name="info-outline" size={16} color={colors.textSecondary} />
              </View>
              
              <FileUploadComponent
                placeholder="Upload 21B license"
                accept={['pdf', 'jpg', 'png']}
                maxSize={10 * 1024 * 1024}
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
                <Text style={formData.license21bExpiryDate ? styles.dateText : styles.placeholderText}>
                  {formData.license21bExpiryDate 
                    ? new Date(formData.license21bExpiryDate).toLocaleDateString('en-IN')
                    : 'Expiry Date*'}
                </Text>
                <Calendar />
              </TouchableOpacity>
              {errors.license21bExpiryDate && (
                <Text style={styles.errorText}>{errors.license21bExpiryDate}</Text>
              )}

              {/* Pharmacy Image */}
              <FileUploadComponent
                placeholder="Pharmacy Image"
                accept={['jpg', 'png', 'jpeg']}
                maxSize={10 * 1024 * 1024}
                docType={DOC_TYPES.PHARMACY_IMAGE}
                initialFile={formData.pharmacyImageFile}
                onFileUpload={(file) => handleFileUpload('pharmacyImage', file)}
                onFileDelete={() => handleFileDelete('pharmacyImage')}
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
                placeholder="Short Name"
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
              
              <View style={styles.dropdownContainer}>
                <Text style={styles.inputLabel}>State*</Text>
                <TouchableOpacity 
                  style={[styles.dropdown, errors.stateId && styles.inputError]}
                  onPress={() => setShowStateModal(true)}
                >
                  <Text style={[styles.dropdownText, !formData.state && styles.dropdownPlaceholder]}>
                    {formData.state || 'Select State'}
                  </Text>
                  <Icon name="arrow-drop-down" size={24} color="#666" />
                </TouchableOpacity>
                {errors.stateId && <Text style={styles.errorText}>{errors.stateId}</Text>}
              </View>
              
              <View style={styles.dropdownContainer}>
                <Text style={styles.inputLabel}>City*</Text>
                <TouchableOpacity 
                  style={[styles.dropdown, errors.cityId && styles.inputError]}
                  onPress={() => formData.stateId && setShowCityModal(true)}
                  disabled={!formData.stateId}
                >
                  <Text style={[styles.dropdownText, !formData.city && styles.dropdownPlaceholder]}>
                    {formData.city || 'Select City'}
                  </Text>
                  <Icon name="arrow-drop-down" size={24} color={formData.stateId ? "#666" : "#ccc"} />
                </TouchableOpacity>
                {errors.cityId && <Text style={styles.errorText}>{errors.cityId}</Text>}
              </View>
              
              <View style={styles.dropdownContainer}>
                <Text style={styles.inputLabel}>Area*</Text>
                <TouchableOpacity 
                  style={[styles.dropdown, errors.area && styles.inputError]}
                  onPress={() => formData.cityId && setShowAreaModal(true)}
                  disabled={!formData.cityId}
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
              <Text style={styles.sectionTitle}>Security Details*</Text>
              
              {/* Mobile Number with OTP Verification */}
              <View style={[styles.inputWithButton, errors.mobileNumber && styles.inputError]}>
                <Text style={styles.countryCode}>+91</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="Mobile Number"
                  value={formData.mobileNumber}
                  onChangeText={(text) => {
                    if (/^\d*$/.test(text) && text.length <= 10) {
                      setFormData(prev => ({ ...prev, mobileNumber: text }));
                      setErrors(prev => ({ ...prev, mobileNumber: null }));
                      if (verificationStatus.mobile) {
                        setVerificationStatus(prev => ({ ...prev, mobile: false }));
                      }
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
                    verificationStatus.mobile && styles.verifiedButton
                  ]}
                  onPress={() => !verificationStatus.mobile && handleVerify('mobile')}
                  disabled={verificationStatus.mobile || loading}
                >
                  {loading && !verificationStatus.mobile ? (
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
                    if (verificationStatus.email) {
                      setVerificationStatus(prev => ({ ...prev, email: false }));
                    }
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                  editable={!verificationStatus.email}
                />
                <TouchableOpacity
                  style={[
                    styles.inlineVerifyButton,
                    verificationStatus.email && styles.verifiedButton
                  ]}
                  onPress={() => !verificationStatus.email && handleVerify('email')}
                  disabled={verificationStatus.email || loading}
                >
                  {loading && !verificationStatus.email ? (
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
              {renderOTPInput('email')}
              
              <FileUploadComponent
                placeholder="Upload PAN"
                accept={['pdf', 'jpg', 'png']}
                maxSize={10 * 1024 * 1024}
                docType={DOC_TYPES.PAN_CARD}
                initialFile={formData.panFile}
                onFileUpload={(file) => handleFileUpload('pan', file)}
                onFileDelete={() => handleFileDelete('pan')}
              />
              
              <CustomInput
                placeholder="PAN Number (e.g., ABCDE1234F)"
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
                placeholder="Upload GST"
                accept={['pdf', 'jpg', 'png']}
                maxSize={10 * 1024 * 1024}
                docType={DOC_TYPES.GST_CERTIFICATE}
                initialFile={formData.gstFile}
                onFileUpload={(file) => handleFileUpload('gst', file)}
                onFileDelete={() => handleFileDelete('gst')}
              />
              
              <CustomInput
                placeholder="GST Number (e.g., 27ABCDE1234F1Z5)"
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
              
              <View style={styles.mappingRow}>
                <Icon name="local-hospital" size={20} color={colors.primary} />
                <Text style={styles.mappingLabel}>Hospital</Text>
                <Icon name="circle" size={8} color={colors.primary} style={styles.dot} />
                <Text style={styles.mappingType}>Doctor</Text>
              </View>
              
              <TouchableOpacity style={styles.searchDropdown}>
                <Text style={styles.searchDropdownText}>Search hospital name/code</Text>
                <Icon name="arrow-drop-down" size={24} color="#666" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.addNewButton}
                onPress={handleAddNewHospital}
              >
                <Text style={styles.addNewButtonText}>+ Add New Hospital</Text>
              </TouchableOpacity>
              
              <Text style={styles.customerGroupLabel}>Customer group</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity 
                  style={styles.radioOption}
                  onPress={() => setFormData(prev => ({ ...prev, customerGroupId: 1 }))}
                >
                  <View style={styles.radioCircle}>
                    {formData.customerGroupId === 1 && (
                      <View style={styles.radioSelected} />
                    )}
                  </View>
                  <Text style={styles.radioText}>9 Doctor badge</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.radioOption}
                  onPress={() => setFormData(prev => ({ ...prev, customerGroupId: 2 }))}
                >
                  <View style={styles.radioCircle}>
                    {formData.customerGroupId === 2 && (
                      <View style={styles.radioSelected} />
                    )}
                  </View>
                  <Text style={styles.radioText}>10 VVI</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.checkboxGroup}>
                <TouchableOpacity 
                  style={styles.checkboxOption}
                  onPress={() => setFormData(prev => ({ ...prev, isIPD: !prev.isIPD }))}
                >
                  <View style={styles.checkbox}>
                    {formData.isIPD && (
                      <Icon name="check" size={16} color={colors.primary} />
                    )}
                  </View>
                  <Text style={styles.checkboxText}>13 IPD</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.checkboxOption}
                  onPress={() => setFormData(prev => ({ ...prev, isGOVT: !prev.isGOVT }))}
                >
                  <View style={styles.checkbox}>
                    {formData.isGOVT && (
                      <Icon name="check" size={16} color={colors.primary} />
                    )}
                  </View>
                  <Text style={styles.checkboxText}>12 GOVT</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Stockist Suggestions Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Stockist Suggestions
                <Text style={styles.optionalText}> (Optional)</Text>
              </Text>
              
              <Text style={styles.helperText}>
                Add suggested stockists for this pharmacy
              </Text>
              
              <TouchableOpacity style={styles.addMoreButton}>
                <Text style={styles.addMoreButtonText}>+ Add More Stockist</Text>
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCancel}
                disabled={registering}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.registerButton, registering && styles.disabledButton]}
                onPress={handleRegister}
                disabled={registering}
              >
                {registering ? (
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
            cityId: '',
            city: '',
            areaId: '',
            area: ''
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
            areaId: '',
            area: ''
          }));
          setErrors(prev => ({ ...prev, cityId: null }));
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
    minWidth: 70,
    alignItems: 'center',
  },
  verifiedButton: {
    backgroundColor: '#E8F5E9',
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
  },
  modalItemTextSelected: {
    color: colors.primary,
    fontWeight: '500',
  },
  modalLoader: {
    paddingVertical: 50,
  },
});

export default PharmacyWholesalerRetailerForm;