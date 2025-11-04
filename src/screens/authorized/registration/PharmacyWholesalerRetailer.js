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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../../../styles/colors';
import CustomInput from '../../../components/CustomInput';
import FileUploadComponent from '../../../components/FileUploadComponent';
import Calendar from '../../../components/icons/Calendar';
import ChevronLeft from '../../../components/icons/ChevronLeft';
import ChevronRight from '../../../components/icons/ChevronRight';

// Document types for file uploads
const DOC_TYPES = {
  LICENSE_20: 'LICENSE_20',
  LICENSE_21: 'LICENSE_21',
  PHARMACY_IMAGE: 'PHARMACY_IMAGE',
  PAN_CARD: 'PAN_CARD',
  GST_CERTIFICATE: 'GST_CERTIFICATE',
};

const PharmacyWholesalerRetailerForm = () => {

  const navigation = useNavigation();
  const route = useRoute();
  const scrollViewRef = useRef(null);
  const otpRefs = useRef({});

  // Get registration type data from route params
  const { type, typeName, category, categoryName } = route.params || {};

  // Form state
  const [formData, setFormData] = useState({
    // License Details

    license20: '',
    license20File: null,
    license20ExpiryDate: '',
    license20b: '',
    license20bFile: null,
    license20bExpiryDate: '',
    license21: '',
    license21File: null,
    license21ExpiryDate: '',
    license21b: '',
    license21bFile: null,
    license21bExpiryDate: '',
    pharmacyImageFile: null,
    
    // General Details
    pharmacyName: '',
    enterGSTOrCathLabEtc: '',
    address1: '',
    address2: '',
    address3: '',
    address4: '',
    pincode: '',
    area: '',
    city: '',
    state: '',
    
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
    customerGroup: '9 Doctor badge',
    isIPD: false,
    isGOVT: false,
    
    // Stockist Suggestions
    stockist1Name: '',
    distributor1Code: '',
    stockist1City: '',
  });

  // Error state
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Date picker states
  const [showDatePicker, setShowDatePicker] = useState({
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
  }, []);

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

  const handleVerify = (field) => {
    // Validate the field before showing OTP
    if (field === 'mobile' && (!formData.mobileNumber || formData.mobileNumber.length !== 10)) {
      setErrors(prev => ({ ...prev, mobileNumber: 'Please enter valid 10-digit mobile number' }));
      return;
    }
    if (field === 'email' && (!formData.emailAddress || !formData.emailAddress.includes('@'))) {
      setErrors(prev => ({ ...prev, emailAddress: 'Please enter valid email address' }));
      return;
    }

    setShowOTP(prev => ({ ...prev, [field]: true }));
    setOtpTimers(prev => ({ ...prev, [field]: 30 }));
    
    // Animate OTP container
    Animated.spring(otpSlideAnim, {
      toValue: 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
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

  const handleOtpVerification = (field) => {
    const otp = otpValues[field].join('');
    if (otp === '1234') { // Mock verification
      Alert.alert('Success', `${field} verified successfully!`);
      setShowOTP(prev => ({ ...prev, [field]: false }));
      setVerificationStatus(prev => ({ ...prev, [field]: true }));
      // Reset OTP values for this field
      setOtpValues(prev => ({
        ...prev,
        [field]: ['', '', '', '']
      }));
    } else {
      Alert.alert('Error', 'Invalid OTP. Please try again.');
    }
  };

  const handleResendOTP = (field) => {
    setOtpTimers(prev => ({ ...prev, [field]: 30 }));
    Alert.alert('OTP Sent', `New OTP sent for ${field} verification.`);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(prev => ({ ...prev, [selectedDateField]: false }));
    if (selectedDate && selectedDateField) {
      const formattedDate = selectedDate.toLocaleDateString('en-IN');
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

  const validateForm = () => {
    const newErrors = {};
    
    // Validate required fields
    if (!formData.license20) newErrors.license20 = 'License 20 number is required';
    if (!formData.license20File) newErrors.license20File = 'License 20 upload is required';
    if (!formData.license20ExpiryDate) newErrors.license20ExpiryDate = 'License 20 expiry date is required';
    if (!formData.license20b) newErrors.license20b = 'License 20B number is required';
    if (!formData.license20bFile) newErrors.license20bFile = 'License 20B upload is required';
    if (!formData.license20bExpiryDate) newErrors.license20bExpiryDate = 'License 20B expiry date is required';
    if (!formData.license21) newErrors.license21 = 'License 21 number is required';
    if (!formData.license21File) newErrors.license21File = 'License 21 upload is required';
    if (!formData.license21ExpiryDate) newErrors.license21ExpiryDate = 'License 21 expiry date is required';
    if (!formData.license21b) newErrors.license21b = 'License 21B number is required';
    if (!formData.license21bFile) newErrors.license21bFile = 'License 21B upload is required';
    if (!formData.license21bExpiryDate) newErrors.license21bExpiryDate = 'License 21B expiry date is required';
    if (!formData.pharmacyImageFile) newErrors.pharmacyImageFile = 'Pharmacy image is required';
    if (!formData.pharmacyName) newErrors.pharmacyName = 'Pharmacy name is required';
    if (!formData.address1) newErrors.address1 = 'Address is required';
    if (!formData.pincode) newErrors.pincode = 'Pincode is required';
    if (!formData.area) newErrors.area = 'Area is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.mobileNumber) newErrors.mobileNumber = 'Mobile number is required';
    if (!verificationStatus.mobile) newErrors.mobileVerification = 'Mobile number verification is required';
    if (!formData.panNumber) newErrors.panNumber = 'PAN number is required';
    if (!formData.gstNumber) newErrors.gstNumber = 'GST number is required';
    
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

  const handleRegister = async () => {
    if (validateForm()) {
      setLoading(true);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Navigate to success screen
        navigation.navigate('RegistrationSuccess', {
          type: 'pharmacy',
          registrationCode: 'HSP12345', // This will come from API
        });
      } catch (error) {
        Alert.alert('Error', 'Failed to register pharmacy. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert('Error', 'Please fill all required fields and complete verifications');
      // Scroll to first error
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handleAddNewHospital = () => {
    navigation.navigate('HospitalSelector');
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

              {/* 20* License */}
              <View style={styles.licenseRow}>
                <Text style={styles.licenseNumber}>20  <Text style={{color: 'red'}}>*</Text></Text>
                <Icon name="info-outline" size={16} color={colors.textSecondary} />
              </View>
              
              <FileUploadComponent
                placeholder="Upload 20 license"
                accept={['pdf', 'jpg', 'png']}
                maxSize={10 * 1024 * 1024} // 10MB
                docType={DOC_TYPES.LICENSE_20}
                initialFile={formData.license20File}
                onFileUpload={(file) => {
                  setFormData(prev => ({ ...prev, license20File: file }));
                  setErrors(prev => ({ ...prev, license20File: null }));
                }}
                onFileDelete={() => {
                  setFormData(prev => ({ ...prev, license20File: null }));
                }}
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
                  {formData.license20ExpiryDate || 'Expiry Date*'}
                </Text>
                <Calendar />
              </TouchableOpacity>
              {errors.license20ExpiryDate && (
                <Text style={styles.errorText}>{errors.license20ExpiryDate}</Text>
              )}

              {/* 21* License */}
              <View style={styles.licenseRow}>
                <Text style={styles.licenseNumber}>21  <Text style={{color: 'red'}}>*</Text></Text>
                <Icon name="info-outline" size={16} color={colors.textSecondary} />
              </View>
              
              <FileUploadComponent
                placeholder="Upload 21 license"
                accept={['pdf', 'jpg', 'png']}
                maxSize={10 * 1024 * 1024} // 10MB
                docType={DOC_TYPES.LICENSE_21}
                initialFile={formData.license21File}
                onFileUpload={(file) => {
                  setFormData(prev => ({ ...prev, license21File: file }));
                  setErrors(prev => ({ ...prev, license21File: null }));
                }}
                onFileDelete={() => {
                  setFormData(prev => ({ ...prev, license21File: null }));
                }}
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
                  {formData.license21ExpiryDate || 'Expiry Date*'}
                </Text>
                <Calendar />
              </TouchableOpacity>
              {errors.license21ExpiryDate && (
                <Text style={styles.errorText}>{errors.license21ExpiryDate}</Text>
              )}
              
              {/* 20* License */}
              <View style={styles.licenseRow}>
                <Text style={styles.licenseNumber}>20B <Text style={{color: 'red'}}>*</Text></Text>
                <Icon name="info-outline" size={16} color={colors.textSecondary} />
              </View>
              
              <FileUploadComponent
                placeholder="Upload 20 license"
                accept={['pdf', 'jpg', 'png']}
                maxSize={10 * 1024 * 1024} // 10MB
                docType={DOC_TYPES.LICENSE_20}
                initialFile={formData.license20bFile}
                onFileUpload={(file) => {
                  setFormData(prev => ({ ...prev, license20bFile: file }));
                  setErrors(prev => ({ ...prev, license20bFile: null }));
                }}
                onFileDelete={() => {
                  setFormData(prev => ({ ...prev, license20bFile: null }));
                }}
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
                onPress={() => openDatePicker('license20')}
                activeOpacity={0.7}
              >
                <Text style={formData.license20bExpiryDate ? styles.dateText : styles.placeholderText}>
                  {formData.license20bExpiryDate || 'Expiry Date*'}
                </Text>
                <Calendar />
              </TouchableOpacity>
              {errors.license20ExpiryDate && (
                <Text style={styles.errorText}>{errors.license20bExpiryDate}</Text>
              )}

              {/* 21* License */}
              <View style={styles.licenseRow}>
                <Text style={styles.licenseNumber}>21B  <Text style={{color: 'red'}}>*</Text></Text>
                <Icon name="info-outline" size={16} color={colors.textSecondary} />
              </View>
              
              <FileUploadComponent
                placeholder="Upload 21 license"
                accept={['pdf', 'jpg', 'png']}
                maxSize={10 * 1024 * 1024} // 10MB
                docType={DOC_TYPES.LICENSE_21}
                initialFile={formData.license21bFile}
                onFileUpload={(file) => {
                  setFormData(prev => ({ ...prev, license21bFile: file }));
                  setErrors(prev => ({ ...prev, license21bFile: null }));
                }}
                onFileDelete={() => {
                  setFormData(prev => ({ ...prev, license21bFile: null }));
                }}
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
                onPress={() => openDatePicker('license21')}
                activeOpacity={0.7}
              >
                <Text style={formData.license21bExpiryDate ? styles.dateText : styles.placeholderText}>
                  {formData.license21bExpiryDate || 'Expiry Date*'}
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
                maxSize={10 * 1024 * 1024} // 10MB
                docType={DOC_TYPES.PHARMACY_IMAGE}
                initialFile={formData.pharmacyImageFile}
                onFileUpload={(file) => {
                  setFormData(prev => ({ ...prev, pharmacyImageFile: file }));
                  setErrors(prev => ({ ...prev, pharmacyImageFile: null }));
                }}
                onFileDelete={() => {
                  setFormData(prev => ({ ...prev, pharmacyImageFile: null }));
                }}
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
                placeholder="Enter GST, R, Cathlab etc"
                value={formData.enterGSTOrCathLabEtc}
                onChangeText={(text) => setFormData(prev => ({ ...prev, enterGSTOrCathLabEtc: text }))}
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
                  setFormData(prev => ({ ...prev, pincode: text }));
                  setErrors(prev => ({ ...prev, pincode: null }));
                }}
                keyboardType="numeric"
                maxLength={6}
                mandatory={true}
                error={errors.pincode}
              />
              
              <View style={styles.dropdownContainer}>
                <Text style={styles.inputLabel}>Area*</Text>
                <TouchableOpacity style={[styles.dropdown, errors.area && styles.inputError]}>
                  <Text style={[styles.dropdownText, !formData.area && styles.dropdownPlaceholder]}>
                    {formData.area || 'Select Area'}
                  </Text>
                  <Icon name="arrow-drop-down" size={24} color="#666" />
                </TouchableOpacity>
                {errors.area && <Text style={styles.errorText}>{errors.area}</Text>}
              </View>
              
              <View style={styles.dropdownContainer}>
                <Text style={styles.inputLabel}>City*</Text>
                <TouchableOpacity style={[styles.dropdown, errors.city && styles.inputError]}>
                  <Text style={[styles.dropdownText, !formData.city && styles.dropdownPlaceholder]}>
                    {formData.city || 'Select City'}
                  </Text>
                  <Icon name="arrow-drop-down" size={24} color="#666" />
                </TouchableOpacity>
                {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
              </View>
              
              <View style={styles.dropdownContainer}>
                <Text style={styles.inputLabel}>State*</Text>
                <TouchableOpacity style={[styles.dropdown, errors.state && styles.inputError]}>
                  <Text style={[styles.dropdownText, !formData.state && styles.dropdownPlaceholder]}>
                    {formData.state || 'Select State'}
                  </Text>
                  <Icon name="arrow-drop-down" size={24} color="#666" />
                </TouchableOpacity>
                {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
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
                    setFormData(prev => ({ ...prev, mobileNumber: text }));
                    setErrors(prev => ({ ...prev, mobileNumber: null }));
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

              {/* Email Address with OTP Verification */}
              <View style={[styles.inputWithButton, errors.emailAddress && styles.inputError]}>
                <TextInput
                  style={[styles.inputField, { flex: 1 }]}
                  placeholder="Email Address"
                  value={formData.emailAddress}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, emailAddress: text }));
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
              {renderOTPInput('email')}
              
              <FileUploadComponent
                placeholder="Upload PAN"
                accept={['pdf', 'jpg', 'png']}
                maxSize={10 * 1024 * 1024} // 10MB
                docType={DOC_TYPES.PAN_CARD}
                initialFile={formData.panFile}
                onFileUpload={(file) => {
                  setFormData(prev => ({ ...prev, panFile: file }));
                }}
                onFileDelete={() => {
                  setFormData(prev => ({ ...prev, panFile: null }));
                }}
              />
              
              <View style={styles.inputWithButton}>
                <TextInput
                  style={[styles.inputField, { flex: 1 }]}
                  placeholder="PAN Number"
                  value={formData.panNumber}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, panNumber: text.toUpperCase() }));
                    setErrors(prev => ({ ...prev, panNumber: null }));
                  }}
                  autoCapitalize="characters"
                  maxLength={10}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                  style={[
                    styles.inlineVerifyButton,
                    verificationStatus.pan && styles.verifiedButton
                  ]}
                  onPress={() => {
                    // Direct API verification, no OTP
                    Alert.alert('PAN Verification', 'PAN verified successfully!');
                    setVerificationStatus(prev => ({ ...prev, pan: true }));
                  }}
                  disabled={verificationStatus.pan}
                >
                  <Text style={[
                    styles.inlineVerifyText,
                    verificationStatus.pan && styles.verifiedText
                  ]}>
                    {verificationStatus.pan ? 'Verified' : 'Verify'}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.panNumber && (
                <Text style={styles.errorText}>{errors.panNumber}</Text>
              )}
              
              <FileUploadComponent
                placeholder="Upload GST"
                accept={['pdf', 'jpg', 'png']}
                maxSize={10 * 1024 * 1024} // 10MB
                docType={DOC_TYPES.GST_CERTIFICATE}
                initialFile={formData.gstFile}
                onFileUpload={(file) => {
                  setFormData(prev => ({ ...prev, gstFile: file }));
                }}
                onFileDelete={() => {
                  setFormData(prev => ({ ...prev, gstFile: null }));
                }}
              />
              
              <View style={styles.dropdownContainer}>
                <Text style={styles.inputLabel}>GST number*</Text>
                <TouchableOpacity style={[styles.dropdown, errors.gstNumber && styles.inputError]}>
                  <Text style={[styles.dropdownText, !formData.gstNumber && styles.dropdownPlaceholder]}>
                    {formData.gstNumber || 'Select GST number'}
                  </Text>
                  <Icon name="arrow-drop-down" size={24} color="#666" />
                </TouchableOpacity>
                {errors.gstNumber && <Text style={styles.errorText}>{errors.gstNumber}</Text>}
              </View>
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
                  onPress={() => setFormData(prev => ({ ...prev, customerGroup: '9 Doctor badge' }))}
                >
                  <View style={styles.radioCircle}>
                    {formData.customerGroup === '9 Doctor badge' && (
                      <View style={styles.radioSelected} />
                    )}
                  </View>
                  <Text style={styles.radioText}>9 Doctor badge</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.radioOption}
                  onPress={() => setFormData(prev => ({ ...prev, customerGroup: '10 VVI' }))}
                >
                  <View style={styles.radioCircle}>
                    {formData.customerGroup === '10 VVI' && (
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
              
              <CustomInput
                placeholder="Name of the Stockist 1"
                value={formData.stockist1Name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, stockist1Name: text }))}
              />
              
              <CustomInput
                placeholder="Distributor Code"
                value={formData.distributor1Code}
                onChangeText={(text) => setFormData(prev => ({ ...prev, distributor1Code: text }))}
              />
              
              <CustomInput
                placeholder="City"
                value={formData.stockist1City}
                onChangeText={(text) => setFormData(prev => ({ ...prev, stockist1City: text }))}
              />
              
              <TouchableOpacity style={styles.addMoreButton}>
                <Text style={styles.addMoreButtonText}>+ Add More Stockist</Text>
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
                style={styles.registerButton}
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
      {showDatePicker.license20 && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      {showDatePicker.license21 && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
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
  typeInfoContainer: {
    marginBottom: 24,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  typeSubLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#999',
  },
  typeTagsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  selectedTypeTag: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: '#FFF5ED',
  },
  selectedTypeText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  unselectedTypeTag: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  unselectedTypeText: {
    fontSize: 13,
    color: '#666',
  },
  categoryInfoContainer: {
    marginBottom: 24,
  },
  categoryTagsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  selectedCategoryTag: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: '#FFF5ED',
  },
  selectedCategoryText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  unselectedCategoryTag: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    marginBottom: 8,
  },
  unselectedCategoryText: {
    fontSize: 13,
    color: '#666',
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
});

export default PharmacyWholesalerRetailerForm;