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
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../../../styles/colors';
import CustomInput from '../../../components/CustomInput';
import FileUploadComponent from '../../../components/FileUploadComponent';
import ChevronLeft from '../../../components/icons/ChevronLeft';
import Calendar from '../../../components/icons/Calendar';
import ArrowDown from '../../../components/icons/ArrowDown';
import Search from '../../../components/icons/Search';
import CloseCircle from '../../../components/icons/CloseCircle';
import { customerAPI } from '../../../api/customer';

const { width, height } = Dimensions.get('window');

// Mock data
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

const MOCK_AREAS = ['Vadgaonsheri', 'Kharadi', 'Viman Nagar', 'Kalyani Nagar', 'Koregaon Park'];

// Document types for file uploads
const DOC_TYPES = {
  CLINIC_REGISTRATION: 'CLINIC_REGISTRATION',
  PRACTICE_LICENSE: 'PRACTICE_LICENSE',
  ADDRESS_PROOF: 'ADDRESS_PROOF',
  CLINIC_IMAGE: 'CLINIC_IMAGE',
  PAN_CARD: 'PAN_CARD',
  GST_CERTIFICATE: 'GST_CERTIFICATE',
};

const DoctorRegistrationForm = () => {
  
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const scrollViewRef = useRef(null);
  const otpRefs = useRef({});
  
  // Form state
  const [formData, setFormData] = useState({
    // License Details
    clinicRegistrationNumber: '',
    clinicRegistrationDate: '',
    clinicRegistrationFile: null, // Changed to object { fileName: '', s3Path: '' }
    
    practiceLicenseNumber: '',
    practiceLicenseDate: '',
    practiceLicenseFile: null, // Changed to object
    
    addressProofFile: null, // Changed to object
    clinicImageFile: null, // Changed to object
    
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
    state: '',
    
    // Security Details
    mobileNumber: '',
    emailAddress: '',
    panNumber: '',
    panFile: null, // Changed to object
    gstNumber: '',
    gstFile: null, // Changed to object
    
    // Mapping
    markAsBuyingEntity: false,
    selectedCategory: '',
    selectedHospital: null,
    selectedPharmacies: [],
    
    // Customer Group
    customerGroup: '10-50',
    
    // Stockist Suggestions
    stockistSuggestion: '',
    distributorCode: '',
    stockistCity: '',

    stockists: [],

  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [datePickerType, setDatePickerType] = useState('');
  
  // Document IDs for API submission
  const [documentIds, setDocumentIds] = useState({
    clinicRegistration: null,
    practiceLicense: null,
    addressProof: null,
    clinicImage: null,
    pan: null,
    gst: null,
  });
  
  // API Data
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  
  // Dropdown Modals
  const [showSpecialityModal, setShowSpecialityModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  
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
    loadStates();
  }, []);

  const loadStates = async () => {
    setLoadingStates(true);
    try {
      const response = await customerAPI.getStates();
      if (response.success && response.data) {
        const _states = [];
        for (let i = 0; i < response.data.states.length; i++) {
          _states.push({ 
            id: response.data.states[i].id, 
            name: response.data.states[i].stateName 
          });
        }
        setStates(_states || []);
      }
    } catch (error) {
      console.error('Error loading states:', error);
      Alert.alert('Error', 'Failed to load states. Please try again.');
    } finally {
      setLoadingStates(false);
    }
  };

  const loadCities = async (stateId) => {
    if (!stateId) return;
    
    setLoadingCities(true);
    setCities([]);
    setFormData(prev => ({ ...prev, city: '', cityId: null }));
    
    try {
      const response = await customerAPI.getCities(stateId);
      if (response.success && response.data) {
        const _cities = [];
        for (let i = 0; i < response.data.cities.length; i++) {
          _cities.push({ 
            id: response.data.cities[i].id, 
            name: response.data.cities[i].cityName 
          });
        }
        setCities(_cities || []);
      }
    } catch (error) {
      console.error('Error loading cities:', error);
      Alert.alert('Error', 'Failed to load cities. Please try again.');
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

  const handleVerify = (field) => {
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
    if (!formData.speciality) {
      newErrors.speciality = 'Speciality is required';
    }
    if (!formData.address1) {
      newErrors.address1 = 'Address is required';
    }
    if (!formData.pincode || formData.pincode.length !== 6) {
      newErrors.pincode = 'Valid 6-digit pincode is required';
    }
    if (!formData.area) {
      newErrors.area = 'Area is required';
    }
    if (!formData.city) {
      newErrors.city = 'City is required';
    }
    if (!formData.state) {
      newErrors.state = 'State is required';
    }
    
    // Security Details validation
    if (!formData.mobileNumber || formData.mobileNumber.length !== 10) {
      newErrors.mobileNumber = 'Valid 10-digit mobile number is required';
    }
    if (!formData.emailAddress || !formData.emailAddress.includes('@')) {
      newErrors.emailAddress = 'Valid email address is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Please fill all required fields');
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to success page with doctor code
      navigation.navigate('RegistrationSuccess', {
        customerCode: `DOC${Math.random().toString().substr(2, 5)}`,
        codeType: 'Doctor',
      });
      
    } catch (error) {
      Alert.alert('Error', 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toLocaleDateString('en-IN');
      
      if (datePickerType === 'clinic') {
        setFormData(prev => ({ ...prev, clinicRegistrationDate: formattedDate }));
        setErrors(prev => ({ ...prev, clinicRegistrationDate: null }));
      } else if (datePickerType === 'practice') {
        setFormData(prev => ({ ...prev, practiceLicenseDate: formattedDate }));
        setErrors(prev => ({ ...prev, practiceLicenseDate: null }));
      }
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
        <View style={[styles.typeTag, styles.typeTagActive]}>
          <Text style={[styles.typeTagText, styles.typeTagTextActive]}>Doctors</Text>
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
              
              <Text style={styles.sectionLabel}>Clinic registration<Text style={styles.mandatoryIndicator}>*</Text></Text>
              
              <FileUploadComponent
                placeholder="Upload Clinic Registration Certificate"
                accept={['pdf', 'jpg', 'png']}
                maxSize={10 * 1024 * 1024} // 10MB
                docType={DOC_TYPES.CLINIC_REGISTRATION}
                initialFile={formData.clinicRegistrationFile}
                onFileUpload={(file) => handleFileUpload('clinicRegistration', file)}
                onFileDelete={() => handleFileDelete('clinicRegistration')}
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
                onPress={() => {
                  setDatePickerType('clinic');
                  setShowDatePicker(true);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.inputTextContainer}>
                  <Text style={formData.clinicRegistrationDate ? styles.inputText : styles.placeholderText}>
                    {formData.clinicRegistrationDate || 'Expiry date'}
                  </Text>
                  <Text style={styles.inlineAsterisk}>*</Text>
                </View>
                <Calendar />
              </TouchableOpacity>
              {errors.clinicRegistrationDate && (
                <Text style={styles.errorText}>{errors.clinicRegistrationDate}</Text>
              )}

              <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Practice license<Text style={styles.mandatoryIndicator}>*</Text></Text>
              
              <FileUploadComponent
                placeholder="Upload Practice License"
                accept={['pdf', 'jpg', 'png']}
                maxSize={10 * 1024 * 1024} // 10MB
                docType={DOC_TYPES.PRACTICE_LICENSE}
                initialFile={formData.practiceLicenseFile}
                onFileUpload={(file) => handleFileUpload('practiceLicense', file)}
                onFileDelete={() => handleFileDelete('practiceLicense')}
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
                onPress={() => {
                  setDatePickerType('practice');
                  setShowDatePicker(true);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.inputTextContainer}>
                  <Text style={formData.practiceLicenseDate ? styles.inputText : styles.placeholderText}>
                    {formData.practiceLicenseDate || 'Expiry date'}
                  </Text>
                  <Text style={styles.inlineAsterisk}>*</Text>
                </View>
                <Calendar />
              </TouchableOpacity>
              {errors.practiceLicenseDate && (
                <Text style={styles.errorText}>{errors.practiceLicenseDate}</Text>
              )}

              <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Address proof<Text style={styles.mandatoryIndicator}>*</Text></Text>
              
              <FileUploadComponent
                placeholder="Upload Address Proof"
                accept={['pdf', 'jpg', 'png']}
                maxSize={10 * 1024 * 1024} // 10MB
                docType={DOC_TYPES.ADDRESS_PROOF}
                initialFile={formData.addressProofFile}
                onFileUpload={(file) => handleFileUpload('addressProof', file)}
                onFileDelete={() => handleFileDelete('addressProof')}
                errorMessage={errors.addressProofFile}
              />

              <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Clinic image</Text>
              
              <FileUploadComponent
                placeholder="Upload Clinic Image"
                accept={['jpg', 'png', 'jpeg']}
                maxSize={5 * 1024 * 1024} // 5MB
                docType={DOC_TYPES.CLINIC_IMAGE}
                initialFile={formData.clinicImageFile}
                onFileUpload={(file) => handleFileUpload('clinicImage', file)}
                onFileDelete={() => handleFileDelete('clinicImage')}
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
                placeholder="Name of the Doctor"
                value={formData.doctorName}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, doctorName: text }));
                  setErrors(prev => ({ ...prev, doctorName: null }));
                }}
                error={errors.doctorName}
                mandatory={true}
              />

              {/* Speciality Dropdown */}
              <TouchableOpacity
                style={[styles.input, errors.speciality && styles.inputError]}
                onPress={() => setShowSpecialityModal(true)}
                activeOpacity={0.7}
              >
                <View style={styles.inputTextContainer}>
                  <Text style={formData.speciality ? styles.inputText : styles.placeholderText}>
                    {formData.speciality || 'Speciality'}
                  </Text>
                  <Text style={styles.inlineAsterisk}>*</Text>
                </View>
                <ArrowDown color='#999' />
              </TouchableOpacity>
              {errors.speciality && (
                <Text style={styles.errorText}>{errors.speciality}</Text>
              )}

              {/* Clinic Name */}
              <CustomInput
                placeholder="Clinic Name"
                value={formData.clinicName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, clinicName: text }))}
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
                mandatory={true}
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
                error={errors.pincode}
                mandatory={true}
              />

              {/* Area Dropdown */}
              <TouchableOpacity
                style={[styles.input, errors.area && styles.inputError]}
                onPress={() => setShowAreaModal(true)}
                activeOpacity={0.7}
              >
                <View style={styles.inputTextContainer}>
                  <Text style={formData.area ? styles.inputText : styles.placeholderText}>
                    {formData.area || 'Area'}
                  </Text>
                  <Text style={styles.inlineAsterisk}>*</Text>
                </View>
                <ArrowDown color='#999' />
              </TouchableOpacity>
              {errors.area && (
                <Text style={styles.errorText}>{errors.area}</Text>
              )}

              {/* City Dropdown */}
              <TouchableOpacity
                style={[styles.input, errors.city && styles.inputError]}
                onPress={() => setShowCityModal(true)}
                activeOpacity={0.7}
              >
                <View style={styles.inputTextContainer}>
                  <Text style={formData.city ? styles.inputText : styles.placeholderText}>
                    {formData.city || 'City'}
                  </Text>
                  <Text style={styles.inlineAsterisk}>*</Text>
                </View>
                <ArrowDown color='#999' />
              </TouchableOpacity>
              {errors.city && (
                <Text style={styles.errorText}>{errors.city}</Text>
              )}

              {/* State Dropdown */}
              <TouchableOpacity
                style={[styles.input, errors.state && styles.inputError]}
                onPress={() => setShowStateModal(true)}
                activeOpacity={0.7}
              >
                <View style={styles.inputTextContainer}>
                  <Text style={formData.state ? styles.inputText : styles.placeholderText}>
                    {formData.state || 'State'}
                  </Text>
                  <Text style={styles.inlineAsterisk}>*</Text>
                </View>
                <ArrowDown color='#999' />
              </TouchableOpacity>
              {errors.state && (
                <Text style={styles.errorText}>{errors.state}</Text>
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
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, mobileNumber: text }));
                    setErrors(prev => ({ ...prev, mobileNumber: null }));
                  }}
                  keyboardType="phone-pad"
                  maxLength={10}
                  placeholderTextColor="#999"
                />
                <Text style={styles.mandatoryIndicator}>*</Text>
                <TouchableOpacity
                  style={styles.inlineVerifyButton}
                  onPress={() => handleVerify('mobile')}
                >
                  <Text style={styles.inlineVerifyText}>Verify</Text>
                </TouchableOpacity>
              </View>
              {errors.mobileNumber && (
                <Text style={styles.errorText}>{errors.mobileNumber}</Text>
              )}
              {renderOTPInput('mobile')}

              {/* Email Address with Verify */}
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
                />
                <Text style={styles.mandatoryIndicator}>*</Text>
                <TouchableOpacity
                  style={styles.inlineVerifyButton}
                  onPress={() => handleVerify('email')}
                >
                  <Text style={styles.inlineVerifyText}>Verify</Text>
                </TouchableOpacity>
              </View>
              {errors.emailAddress && (
                <Text style={styles.errorText}>{errors.emailAddress}</Text>
              )}
              {renderOTPInput('email')}

              {/* PAN Upload */}
              <FileUploadComponent
                placeholder="Upload PAN Card"
                accept={['pdf', 'jpg', 'png']}
                maxSize={5 * 1024 * 1024} // 5MB
                docType={DOC_TYPES.PAN_CARD}
                initialFile={formData.panFile}
                onFileUpload={(file) => handleFileUpload('pan', file)}
                onFileDelete={() => handleFileDelete('pan')}
              />

              {/* PAN Number with Verify */}
              <View style={styles.inputWithButton}>
                <TextInput
                  style={[styles.inputField, { flex: 1 }]}
                  placeholder="PAN Number (e.g., ASDSD12345G)"
                  value={formData.panNumber}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, panNumber: text.toUpperCase() }))}
                  autoCapitalize="characters"
                  maxLength={10}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                  style={styles.inlineVerifyButton}
                  onPress={() => {
                    Alert.alert('PAN Verification', 'PAN verified successfully!');
                  }}
                >
                  <Text style={styles.inlineVerifyText}>Verify</Text>
                </TouchableOpacity>
              </View>

              {/* GST Upload */}
              <FileUploadComponent
                placeholder="Upload GST Certificate"
                accept={['pdf', 'jpg', 'png']}
                maxSize={5 * 1024 * 1024} // 5MB
                docType={DOC_TYPES.GST_CERTIFICATE}
                initialFile={formData.gstFile}
                onFileUpload={(file) => handleFileUpload('gst', file)}
                onFileDelete={() => handleFileDelete('gst')}
              />

              {/*
              <View style={styles.inputWithButton}>
                <TextInput
                  style={[styles.inputField, { flex: 1 }]}
                  placeholder="GST Number"
                  value={formData.gstNumber}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, gstNumber: text.toUpperCase() }))}
                  autoCapitalize="characters"
                  maxLength={15}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                  style={styles.inlineVerifyButton}
                  onPress={() => {
                    Alert.alert('GST Verification', 'GST verified successfully!');
                  }}
                >
                  <Text style={styles.inlineVerifyText}>Verify</Text>
                </TouchableOpacity>
              </View> */}

                  <CustomInput
                  placeholder="GST Number (e.g., 27ASDSD1234F1Z5)"
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
                  <Text style={styles.radioLabel}>Hospital</Text>
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
                    onPress={() => Alert.alert('Add Hospital', 'Navigate to add new hospital')}
                  >            
                    <Text style={styles.addNewLinkText}>+ Add New Hospital</Text>
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
                {['10-50', '12-50GOVT'].map((group) => (
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

                
                  {/* Stockist Suggestions Section */}
              <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Stockist Suggestions
                <Text style={styles.optionalText}> (Optional)</Text>
              </Text>
              
              <Text style={styles.helperText}>
                Add suggested stockists for this pharmacy
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
              
              <TouchableOpacity 
                style={styles.addMoreButton}
                onPress={handleAddStockist}
              >
                <Text style={styles.addMoreButtonText}>+ Add New Stockist</Text>
              </TouchableOpacity>
            </View>


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

      {/* Dropdown Modals */}
      <DropdownModal
        visible={showSpecialityModal}
        onClose={() => setShowSpecialityModal(false)}
        title="Select Speciality"
        data={MOCK_SPECIALTIES.map((speciality, index) => ({ id: index, name: speciality }))}
        selectedId={MOCK_SPECIALTIES.indexOf(formData.speciality)}
        onSelect={(item) => {
          setFormData(prev => ({ 
            ...prev, 
            speciality: item.name
          }));
          setErrors(prev => ({ ...prev, speciality: null }));
        }}
        loading={false}
      />

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
            city: ''
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

      <DropdownModal
        visible={showAreaModal}
        onClose={() => setShowAreaModal(false)}
        title="Select Area"
        data={MOCK_AREAS.map((area, index) => ({ id: index, name: area }))}
        selectedId={MOCK_AREAS.indexOf(formData.area)}
        onSelect={(item) => {
          setFormData(prev => ({ 
            ...prev, 
            area: item.name
          }));
          setErrors(prev => ({ ...prev, area: null }));
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
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
  addMoreButton: {
    paddingVertical: 8,
  },
  addMoreButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
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
});

export default DoctorRegistrationForm;