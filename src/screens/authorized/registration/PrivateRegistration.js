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
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import { colors } from '../../../styles/colors';
import CustomInput from '../../../components/CustomInput';
import FileUploadComponent from '../../../components/FileUploadComponent';
import ChevronLeft from '../../../components/icons/ChevronLeft';
import ChevronRight from '../../../components/icons/ChevronRight';
import Calendar from '../../../components/icons/Calendar';
import ArrowDown from '../../../components/icons/ArrowDown';
import Search from '../../../components/icons/Search';
import CloseCircle from '../../../components/icons/CloseCircle';
import { customerAPI } from '../../../api/customer';

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

  const { type, typeName, typeId, category, categoryName, categoryId, subCategory, subCategoryName, subCategoryId } = route.params || {};
    
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
    selectedCategory: '',
    selectedHospital: null,
    selectedPharmacies: [],
    
    // Customer Group
    customerGroup: 'X',
    stockistSuggestion: '',
    distributorCode: '',
    stockistCity: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Location data from APIs
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  
  // Dropdowns
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  
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
  
  // Verification states
  const [verificationStatus, setVerificationStatus] = useState({
    mobile: false,
    email: false,
  });

  // Document IDs for API
  const [documentIds, setDocumentIds] = useState([]);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const otpSlideAnim = useRef(new Animated.Value(-50)).current;

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

    // Load states on mount
    fetchStates();
  }, []);

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
        });
      }
    } catch (error) {
      console.error('Error fetching states:', error);
      Toast.show({
        type: 'error',
        text1: 'Error loading states',
        text2: 'Please check your connection',
      });
    } finally {
      setLoadingStates(false);
    }
  };

  // Fetch cities based on selected state
  const fetchCities = async (stateId) => {
    setLoadingCities(true);
    try {
      const response = await customerAPI.getCities(stateId);  console.log(response);
      if (response.success && response.data) {
        // Handle both array response and object with cities array
        const citiesData = Array.isArray(response.data) ? response.data : 
                          (response.data.cities || response.data);
        setCities(citiesData);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to load cities',
          text2: 'Please try again later',
        });
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      Toast.show({
        type: 'error',
        text1: 'Error loading cities',
        text2: 'Please check your connection',
      });
    } finally {
      setLoadingCities(false);
    }
  };

  // Handle state selection
  const handleStateSelect = (state) => {
    setFormData(prev => ({ 
      ...prev, 
      state: state.stateName,
      stateId: state.id,
      city: '', // Reset city when state changes
      cityId: null 
    }));
    setShowStateDropdown(false);
    setCities([]); // Clear cities
    fetchCities(state.id); // Fetch cities for selected state
  };

  // Handle city selection
  const handleCitySelect = (city) => {
    setFormData(prev => ({ 
      ...prev, 
      city: city.cityName || city.name, // Handle both cityName and name fields
      cityId: city.id 
    }));
    setShowCityDropdown(false);
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
      // Prepare data based on field type
      let requestData = {}; // No customerId needed for new registrations
      
      if (field === 'mobile') {
        if (!formData.mobileNumber || formData.mobileNumber.length !== 10) {
          Toast.show({
            type: 'error',
            text1: 'Invalid Mobile Number',
            text2: 'Please enter a valid 10-digit mobile number',
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
        });
        
        // Animate OTP container
        Animated.spring(otpSlideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }).start();
      } else {
        // Handle failure case where customer already exists
        if (response.statusCode === 302 && response.data && response.data.length > 0) {
          const existingCustomer = response.data[0];
          Toast.show({
            type: 'error',
            text1: 'Customer Already Exists',
            text2: `Customer with this ${field} already exists (ID: ${existingCustomer.id})`,
            visibilityTime: 4000,
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'OTP Generation Failed',
            text2: response.message || 'Failed to send OTP. Please try again.',
          });
        }
      }
    } catch (error) {
      console.error('Error generating OTP:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to send OTP. Please check your connection and try again.',
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
        });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      Toast.show({
        type: 'error',
        text1: 'Verification Error',
        text2: 'Failed to verify OTP. Please try again.',
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
    }
    
    // General Details validation
    if (!formData.clinicName) {
      newErrors.clinicName = 'Clinic name is required';
    }
    if (!formData.address1) {
      newErrors.address1 = 'Address is required';
    }
    if (!formData.pincode || formData.pincode.length !== 6) {
      newErrors.pincode = 'Valid 6-digit pincode is required';
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
    
    // Verification validation
    if (!verificationStatus.mobile) {
      newErrors.mobileVerification = 'Mobile number verification is required';
    }
    if (!verificationStatus.email) {
      newErrors.emailVerification = 'Email verification is required';
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

  const getCustomerGroupId = (groupName) => {
    // Map customer group names to IDs
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

      // Prepare the request payload
      const requestPayload = {
        typeId: typeId || 2,
        categoryId: categoryId || 4,
        subCategoryId: subCategoryId || 1,
        isMobileVerified: verificationStatus.mobile,
        isEmailVerified: verificationStatus.email,
        isExisting: false,
        licenceDetails: {
          registrationDate: registrationDate,
          licence: [{
            licenceTypeId: 7, // Default license type ID
            licenceNo: formData.registrationNumber,
            licenceValidUpto: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(), // 1 year validity
          }]
        },
        customerDocIds: docIds,
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
          gstNumber: formData.gstNumber || '',
        },
        suggestedDistributors: formData.stockistSuggestion ? [{
          distributorCode: formData.distributorCode || '',
          distributorName: formData.stockistSuggestion,
          city: formData.stockistCity || formData.city,
        }] : [],
      };

      console.log('Registration payload:', requestPayload);

      // Call create customer API
      const response = await customerAPI.createCustomer(requestPayload);
      
      if (response.success && response.data) {
        Toast.show({
          type: 'success',
          text1: 'Registration Successful',
          text2: `Customer registered with code: ${response.data.code || response.data.id}`,
          visibilityTime: 5000,
        });
        
        // Navigate to success page
        navigation.navigate('RegistrationSuccess', {
          customerCode: response.data.code || `HOSP${response.data.id}`,
          customerId: response.data.id,
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
          visibilityTime: 5000,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: error.message || 'Failed to register. Please try again.',
          visibilityTime: 5000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toLocaleDateString('en-IN');
      setFormData(prev => ({ ...prev, registrationDate: formattedDate }));
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
          <Text style={styles.typeTagText}>{typeName || 'Hospital'}</Text>
        </View>        
        <ChevronRight height={10} />
        <View style={styles.typeTag}>
          <Text style={styles.typeTagText}>{categoryName || 'Private'}</Text>
        </View>
        <ChevronRight height={10} />
        <View style={[styles.typeTag, styles.typeTagActive]}>
          <Text style={[styles.typeTagText, styles.typeTagTextActive]}>{subCategoryName}</Text>
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
              <Text style={styles.sectionTitle}>License Details*</Text>
              
              {/* Registration Certificate Upload */}
              <FileUploadComponent
                placeholder="Upload registration certificate"
                accept={['pdf']}
                maxSize={10 * 1024 * 1024} // 10MB
                docType={DOC_TYPES.LICENSE_CERTIFICATE}        
                initialFile={formData.licenseFile}
                onFileUpload={(file) => {
                  setFormData(prev => ({ ...prev, licenseFile: file }));
                  setErrors(prev => ({ ...prev, licenseFile: null }));
                }}
                onFileDelete={() => {
                  setFormData(prev => ({ ...prev, licenseFile: null }));
                }}
                errorMessage={errors.licenseFile}
              />

              <CustomInput
                placeholder="Hospital Registration Number"
                value={formData.registrationNumber}
                onChangeText={(text) => setFormData(prev => ({ ...prev, registrationNumber: text }))}
                error={errors.registrationNumber}
                autoCapitalize="characters"
              />

              <TouchableOpacity
                style={[styles.input, errors.registrationDate && styles.inputError]}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Text style={formData.registrationDate ? styles.inputText : styles.placeholderText}>
                  {formData.registrationDate || 'Registration Date'}
                </Text>        
                <Calendar />
              </TouchableOpacity>
              {errors.registrationDate && (
                <Text style={styles.errorText}>{errors.registrationDate}</Text>
              )}

              <FileUploadComponent
                  placeholder="Upload"
                  accept={['jpg', 'jpeg', 'png']}
                  maxSize={5 * 1024 * 1024} // 5MB
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
              <Text style={styles.sectionTitle}>General Details*</Text>
              
              <CustomInput
                placeholder="Hospital/Clinic Name"
                value={formData.clinicName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, clinicName: text }))}
                error={errors.clinicName}
              />

              <CustomInput
                placeholder="Short Name"
                value={formData.shortName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, shortName: text }))}
              />

              <CustomInput
                placeholder="Address 1"
                value={formData.address1}
                onChangeText={(text) => setFormData(prev => ({ ...prev, address1: text }))}
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
                onChangeText={(text) => setFormData(prev => ({ ...prev, pincode: text }))}
                keyboardType="numeric"
                maxLength={6}
                error={errors.pincode}
              />

              {/* State Dropdown - Load this first */}
              <TouchableOpacity
                style={[styles.input, errors.state && styles.inputError]}
                onPress={() => !loadingStates && setShowStateDropdown(!showStateDropdown)}
                activeOpacity={0.7}
                disabled={loadingStates}
              >
                {loadingStates ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <Text style={formData.state ? styles.inputText : styles.placeholderText}>
                      {formData.state || 'State'}
                    </Text>
                    <ArrowDown color='#999' />
                  </>
                )}
              </TouchableOpacity>
              {showStateDropdown && (
                <View style={styles.dropdown}>
                  <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled={true}>
                    {states.map((state) => (
                      <TouchableOpacity
                        key={state.id}
                        style={styles.dropdownItem}
                        onPress={() => handleStateSelect(state)}
                      >
                        <Text style={styles.dropdownItemText}>{state.stateName}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
              {errors.state && (
                <Text style={styles.errorText}>{errors.state}</Text>
              )}

              {/* Area Dropdown */}
              <TouchableOpacity
                style={[styles.input]}
                onPress={() => setShowAreaDropdown(!showAreaDropdown)}
                activeOpacity={0.7}
              >
                <Text style={formData.area ? styles.inputText : styles.placeholderText}>
                  {formData.area || 'Area'}
                </Text>        
                <ArrowDown color='#999' />
              </TouchableOpacity>
              {showAreaDropdown && (
                <View style={styles.dropdown}>
                  {MOCK_AREAS.map((area, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setFormData(prev => ({ ...prev, area }));
                        setShowAreaDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{area}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}              

              {/* City Dropdown - Only show after state is selected */}
              <TouchableOpacity
                style={[styles.input, errors.city && styles.inputError]}
                onPress={() => {
                  if (!formData.stateId) {
                    Toast.show({
                      type: 'info',
                      text1: 'Select State First',
                      text2: 'Please select a state to load cities',
                    });
                  } else if (!loadingCities) {
                    setShowCityDropdown(!showCityDropdown);
                  }
                }}
                activeOpacity={0.7}
                disabled={!formData.stateId || loadingCities}
              >
                {loadingCities ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <Text style={[
                      formData.city ? styles.inputText : styles.placeholderText,
                      !formData.stateId && styles.disabledText
                    ]}>
                      {formData.city || (formData.stateId ? 'City' : 'Select state first')}
                    </Text>
                    <ArrowDown color={formData.stateId ? '#999' : '#DDD'} />
                  </>
                )}
              </TouchableOpacity>
              {showCityDropdown && cities.length > 0 && (
                <View style={styles.dropdown}>
                  <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled={true}>
                    {cities.map((city) => (
                      <TouchableOpacity
                        key={city.id}
                        style={styles.dropdownItem}
                        onPress={() => handleCitySelect(city)}
                      >
                        <Text style={styles.dropdownItemText}>
                          {city.cityName || city.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
              {errors.city && (
                <Text style={styles.errorText}>{errors.city}</Text>
              )}
            </View>

            {/* Security Details Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Security Details*</Text>
              
              {/* Mobile Number with Verify */}
              <View style={[styles.inputWithButton, errors.mobileNumber && styles.inputError]}>
                <Text style={styles.countryCode}>+91</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="Mobile Number"
                  value={formData.mobileNumber}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, mobileNumber: text }))}
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
                  disabled={verificationStatus.mobile}
                >
                  <Text style={[
                    styles.inlineVerifyText,
                    verificationStatus.mobile && styles.verifiedText
                  ]}>
                    {verificationStatus.mobile ? 'Verified' : 'Verify'}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.mobileNumber && (
                <Text style={styles.errorText}>{errors.mobileNumber}</Text>
              )}
              {errors.mobileVerification && (
                <Text style={styles.errorText}>{errors.mobileVerification}</Text>
              )}
              {renderOTPInput('mobile')}

              {/* Email Address with Verify */}
              <View style={[styles.inputWithButton, errors.emailAddress && styles.inputError]}>
                <TextInput
                  style={[styles.inputField, { flex: 1 }]}
                  placeholder="Email Address"
                  value={formData.emailAddress}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, emailAddress: text }))}
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
                  disabled={verificationStatus.email}
                >
                  <Text style={[
                    styles.inlineVerifyText,
                    verificationStatus.email && styles.verifiedText
                  ]}>
                    {verificationStatus.email ? 'Verified' : 'Verify'}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.emailAddress && (
                <Text style={styles.errorText}>{errors.emailAddress}</Text>
              )}
              {errors.emailVerification && (
                <Text style={styles.errorText}>{errors.emailVerification}</Text>
              )}
              {renderOTPInput('email')}

              {/* PAN Upload */}
              <FileUploadComponent
                placeholder="Upload PAN"
                accept={['pdf', 'jpg', 'jpeg', 'png']}
                maxSize={5 * 1024 * 1024} // 5MB
                docType={DOC_TYPES.PAN}        
                initialFile={formData.panFile}
                onFileUpload={(file) => {
                  setFormData(prev => ({ ...prev, panFile: file }));
                }}
                onFileDelete={() => {
                  setFormData(prev => ({ ...prev, panFile: null }));
                }}
              />

              {/* PAN Number with Verify - No OTP, just API verification */}
              <View style={styles.inputWithButton}>
                <TextInput
                  style={[styles.inputField, { flex: 1 }]}
                  placeholder="PAN Number"
                  value={formData.panNumber}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, panNumber: text.toUpperCase() }))}
                  autoCapitalize="characters"
                  maxLength={10}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                  style={styles.inlineVerifyButton}
                  onPress={() => {
                    // Direct API verification, no OTP
                    Toast.show({
                      type: 'success',
                      text1: 'PAN Verification',
                      text2: 'PAN verified successfully!',
                    });
                  }}
                >
                  <Text style={styles.inlineVerifyText}>Verify</Text>
                </TouchableOpacity>
              </View>
              {errors.panNumber && (
                <Text style={styles.errorText}>{errors.panNumber}</Text>
              )}

              {/* Fetch GST from PAN Link */}
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
                <Text style={styles.linkText}>Fetch GST from PAN</Text>
              </TouchableOpacity>

              {/* GST Upload */}
              <FileUploadComponent
                placeholder="Upload GST"
                accept={['pdf', 'jpg', 'jpeg', 'png']}
                maxSize={5 * 1024 * 1024} // 5MB
                docType={DOC_TYPES.GST}        
                initialFile={formData.gstFile}
                onFileUpload={(file) => {
                  setFormData(prev => ({ ...prev, gstFile: file }));
                }}
                onFileDelete={() => {
                  setFormData(prev => ({ ...prev, gstFile: null }));
                }}
              />

              {/* 
              <TouchableOpacity
                style={[styles.input]}
                onPress={() => Alert.alert('GST Number', 'Select from GST numbers fetched from PAN')}
                activeOpacity={0.7}
              >
                <Text style={formData.gstNumber ? styles.inputText : styles.placeholderText}>
                  {formData.gstNumber || 'GST Number'}
                </Text>
                <ArrowDown color='#999' />
              </TouchableOpacity> */}

                <CustomInput
                  placeholder="GST number"
                  value={formData.gstNumber}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, gstNumber: text }))}
                />

            </View>

            {/* Mapping Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mapping</Text>
              
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Mark as buying entity</Text>
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

              <Text style={styles.sectionLabel}>Select category <Text style={styles.optional}>(Optional)</Text></Text>
              
              <View style={styles.categoryOptions}>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    formData.selectedCategory === 'Group Corporate Hospital' && styles.radioButtonActive,
                  ]}
                  onPress={() => setFormData(prev => ({ 
                    ...prev, 
                    selectedCategory: 'Group Corporate Hospital' 
                  }))}
                  activeOpacity={0.7}
                >
                  <View style={styles.radioOuter}>
                    {formData.selectedCategory === 'Group Corporate Hospital' && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text style={styles.radioLabel}>Group Corporate Hospital</Text>
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
                  <Text style={styles.radioLabel}>Pharmacy</Text>
                </TouchableOpacity>
              </View>

              {/* Group Hospital Selector - Show when Group Corporate Hospital is selected */}
              {formData.selectedCategory === 'Group Corporate Hospital' && (
                <>
                  <TouchableOpacity
                    style={styles.selectorInput}
                    onPress={() => {
                      navigation.navigate('HospitalSelector', {
                        selectedHospitals: formData.selectedHospital ? [formData.selectedHospital] : [],
                        onSelect: (hospitals) => {
                          // For single selection, take the first hospital
                          setFormData(prev => ({ ...prev, selectedHospital: hospitals[0] || null }));
                        }
                      });
                    }}
                    activeOpacity={0.7}
                  >
                    {formData.selectedHospital ? (
                      <View style={styles.selectedItem}>
                        <View>
                          <Text style={styles.selectedItemName}>{formData.selectedHospital.name}</Text>
                          <Text style={styles.selectedItemCode}>{formData.selectedHospital.code}</Text>
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
                        <Text style={styles.selectorPlaceholder}>Search hospital name/code</Text>                
                        <Search />
                      </>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.addNewLink}
                    onPress={() => Alert.alert('Add Hospital', 'Navigate to add new group hospital')}
                  >            
                    <Text style={styles.addNewLinkText}>+ Add New Group Hospital</Text>
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
                    <Text style={styles.selectorPlaceholder}>Search pharmacy name/code</Text>
                    <Search />
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
                        <CloseCircle color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  
                  <TouchableOpacity 
                    style={styles.addNewLink}
                    onPress={() => Alert.alert('Add Pharmacy', 'Navigate to add new pharmacy')}
                  >
                    <Text style={styles.addNewLinkText}>+ Add New Pharmacy</Text>
                  </TouchableOpacity>
                </>
              )}

              <View style={styles.divider} />

              <Text style={styles.sectionLabel}>Customer group</Text>
              
              <View style={styles.customerGroupContainer}>
                {['X', 'Y', 'Doctor Supply', '10+50', '12+60'].map((group) => (
                  <TouchableOpacity
                    key={group}
                    style={[
                      styles.customerGroupButton,
                      formData.customerGroup === group && styles.customerGroupButtonActive,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, customerGroup: group }))}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.customerGroupButtonText,
                      formData.customerGroup === group && styles.customerGroupButtonTextActive,
                    ]}>
                      {group}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionLabel}>Stockist Suggestions <Text style={styles.optional}>(Optional)</Text></Text>
              
              <CustomInput
                placeholder="Name of the Stockist"
                value={formData.stockistSuggestion}
                onChangeText={(text) => setFormData(prev => ({ ...prev, stockistSuggestion: text }))}
              />

              <CustomInput
                placeholder="Distributor Code"
                value={formData.distributorCode}
                onChangeText={(text) => setFormData(prev => ({ ...prev, distributorCode: text }))}
              />

              <CustomInput
                placeholder="City"
                value={formData.stockistCity}
                onChangeText={(text) => setFormData(prev => ({ ...prev, stockistCity: text }))}
              />

              <TouchableOpacity
                style={styles.addStockistButton}
                onPress={() => Alert.alert('Add Stockist', 'Stockist addition will be available soon')}
                activeOpacity={0.7}
              >        
                <Text style={styles.addStockistButtonText}>+ Add New Stockist</Text>
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
                <Text style={styles.cancelButtonText}>Cancel</Text>
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
                  <Text style={styles.registerButtonText}>Register</Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Toast Component */}
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
    paddingHorizontal: 20,
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
    backgroundColor: '#FFF5ED',
    borderRadius: 16,
  },
  inlineVerifyText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  verifiedButton: {
    backgroundColor: '#E8F5E9',
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
  addStockistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  addStockistButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 8,
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
});

export default PrivateRegistrationForm;