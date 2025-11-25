/* eslint-disable no-dupe-keys */
// src/screens/authorized/registration/GovtHospitalRegistrationForm.js

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
import Upload from '../../../components/icons/Upload';
import Calendar from '../../../components/icons/Calendar';
import ArrowDown from '../../../components/icons/ArrowDown';
import Search from '../../../components/icons/Search';
import CloseCircle from '../../../components/icons/CloseCircle';
import { customerAPI } from '../../../api/customer';
import { AppText, AppInput } from "../../../components"
import AddNewHospitalModal from './AddNewHospitalModal';
import AddNewPharmacyModal from './AddNewPharmacyModal';

const { width, height } = Dimensions.get('window');

// Mock data
const MOCK_AREAS = ['Vadgaonsheri', 'Kharadi', 'Viman Nagar', 'Kalyani Nagar', 'Koregaon Park'];
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

const GovtHospitalRegistrationForm = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
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

  // Form state
  const [formData, setFormData] = useState({
    // License Details
    registrationCertificate: '',
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
    city: '',
    state: '',

    // Security Details
    mobileNumber: '',
    emailAddress: '',
    panFile: '',
    panNumber: '',
    gstFile: '',
    gstNumber: '',

    // License Details
    registrationNumber: '',
    nin: '',

    // Mapping
    markAsBuyingEntity: false,
    linkedHospitals: [],
    customerGroupId: 12,
  });

  // State for managing stockists
  const [stockists, setStockists] = useState([{ name: '', code: '', city: '' }]);

  // State for managing expanded hospitals in accordion
  const [expandedHospitals, setExpandedHospitals] = useState({});

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAddHospitalModal, setShowAddHospitalModal] = useState(false);
  const [showAddPharmacyModal, setShowAddPharmacyModal] = useState(false);

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
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [customerGroups, setCustomerGroups] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Dropdown Modals
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [showGstModal, setShowGstModal] = useState(false);

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

  // Verification status
  const [verificationStatus, setVerificationStatus] = useState({
    mobile: false,
    email: false,
  });

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const otpSlideAnim = useRef(new Animated.Value(-50)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Load states and customer groups on mount
    loadStates();
    loadCustomerGroups();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load cities when state changes - NO RESET
  useEffect(() => {
    loadCities();
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

  const loadCities = async () => {
    setLoadingCities(true);
    try {
      const response = await customerAPI.getCities();
      if (response.success && response.data) {
        const _cities = [];
        for (let i = 0; i < response.data.cities.length; i++) {
          _cities.push({ id: response.data.cities[i].id, name: response.data.cities[i].cityName });
        }
        console.log('Cities:', _cities);
        setCities(_cities || []);
        //setCities(response.data);
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


  const loadCustomerGroups = async () => {
    try {
      const groupsResponse = await customerAPI.getCustomerGroups();
      if (groupsResponse.success && groupsResponse.data) {
        console.log('Customer groups:', groupsResponse.data);
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

  const handleVerify = async (field) => {
    // Validate field before verification
    if (field === 'mobile' && (!formData.mobileNumber || formData.mobileNumber.length !== 10 || !/^[6789]\d{9}$/.test(formData.mobileNumber))) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Mobile',
        text2: 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9',
        position: 'top',
      });
      return;
    }
    if (field === 'email' && (!formData.emailAddress || !formData.emailAddress.includes('@'))) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address',
        position: 'top',
      });
      return;
    }

    setLoadingOtp(prev => ({ ...prev, [field]: true }));
    try {
      // Reset OTP state before generating new OTP
      setOtpValues(prev => ({ ...prev, [field]: ['', '', '', ''] }));
      setOtpTimers(prev => ({ ...prev, [field]: 30 }));

      const requestData = {
        [field === 'mobile' ? 'mobile' : 'email']:
          field === 'mobile' ? formData.mobileNumber : formData.emailAddress
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
            [field]: [...otpArray, ...Array(4 - otpArray.length).fill('')]
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
    if (file && file.id) {
      setDocumentIds(prev => ({ ...prev, [field]: file.id }));

      // Add complete document object to uploaded list with docTypeId
      const docObject = {
        s3Path: file.s3Path || file.uri,
        docTypeId: file.docTypeId,
        fileName: file.fileName || file.name,
        id: file.id
      };
      setUploadedDocs(prev => [...prev, docObject]);
    }
    setFormData(prev => ({ ...prev, [`${field}File`]: file }));
    setErrors(prev => ({ ...prev, [`${field}File`]: null }));
  };

  const handleFileDelete = (field) => {
    const file = formData[`${field}File`];
    if (file && file.id) {
      setUploadedDocs(prev => prev.filter(doc => doc.id !== file.id));
    }
    setDocumentIds(prev => ({ ...prev, [field]: null }));
    setFormData(prev => ({ ...prev, [`${field}File`]: null }));
  };

  // Handle OCR extracted data for registration certificate uploads
  const handleRegistrationOcrData = (ocrData) => {
    console.log('OCR Data Received:', ocrData);
    
    const updates = {};
    
    // Populate hospital name if available
    if (ocrData.hospitalName && !formData.hospitalName) {
      updates.hospitalName = ocrData.hospitalName;
    }
    
    // Populate address fields if available
    if (ocrData.address && !formData.address1) {
      updates.address1 = ocrData.address;
    }
    
    // Populate registration number if available
    if (ocrData.registrationNumber && !formData.registrationNumber) {
      updates.registrationNumber = ocrData.registrationNumber;
    }
    
    // Populate registration date if available
    if (ocrData.issueDate && !formData.registrationDate) {
      const parts = ocrData.issueDate.split('-');
      if (parts.length === 3) {
        const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
        updates.registrationDate = formattedDate;
      }
    }
    
    // Populate location fields if available
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
    
    // Apply all updates at once
    if (Object.keys(updates).length > 0) {
      setFormData(prev => ({ ...prev, ...updates }));
      const errorUpdates = {};
      Object.keys(updates).forEach(key => {
        errorUpdates[key] = null;
      });
      setErrors(prev => ({ ...prev, ...errorUpdates }));
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
          field === 'mobile' ? formData.mobileNumber : formData.emailAddress
      };

      const response = await customerAPI.validateOTP(otpValue, requestData);

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: `${field === 'mobile' ? 'Mobile' : 'Email'} verified successfully!`,
        position: 'top',
        });

        setShowOTP(prev => ({ ...prev, [field]: false }));
        setVerificationStatus(prev => ({ ...prev, [field]: true }));
        setOtpTimers(prev => ({ ...prev, [field]: 0 })); // Reset OTP timer

        // Reset OTP values for this field
        setOtpValues(prev => ({
          ...prev,
          [field]: ['', '', '', '']
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

  const handleResendOTP = (field) => {
    setOtpTimers(prev => ({ ...prev, [field]: 30 }));
    Alert.alert('OTP Sent', `New OTP sent for ${field} verification.`);
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
        </TouchableOpacity>
      </Modal>
    );
  };

  const validateForm = () => {
    const newErrors = {};

    // License Details
    if (!formData.registrationNumber) {
      newErrors.registrationNumber = 'Hospital code is required';
    }
    if (!formData.nin || formData.nin.trim().length === 0) {
      newErrors.nin = 'NIN (National Identification Number) is required';
    }
    if (!formData.registrationDate) {
      newErrors.registrationDate = 'Registration date is required';
    }

    // General Details
    if (!formData.hospitalName) {
      newErrors.hospitalName = 'Hospital name is required';
    }
    if (!formData.address1) {
      newErrors.address1 = 'Address 1 is required';
    }
    if (!formData.address2 || formData.address2.trim().length === 0) {
      newErrors.address2 = 'Address 2 is required';
    }
    if (!formData.address3 || formData.address3.trim().length === 0) {
      newErrors.address3 = 'Address 3 is required';
    }
    if (!formData.pincode || !/^[1-9]\d{5}$/.test(formData.pincode)) {
      newErrors.pincode = 'Valid 6-digit pincode is required';
    }
    if (!formData.area || formData.area.trim().length === 0) {
      newErrors.area = 'Area is required';
    }
    if (!formData.city) {
      newErrors.city = 'City is required';
    }
    if (!formData.state) {
      newErrors.state = 'State is required';
    }

    // Security Details
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
    // PAN validation
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

    // Mapping Details
    // if (!formData.linkedHospitals || formData.linkedHospitals.length === 0) {
    //   newErrors.linkedHospitals = 'At least one linked hospital is required';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
      // Prepare registration payload
      const registrationData = {
        typeId: typeId || 2,
        categoryId: categoryId || 4,
        subCategoryId: subCategoryId || 2,
        isMobileVerified: verificationStatus.mobile,
        isEmailVerified: verificationStatus.email,
        isExisting: false,
        licenceDetails: {
          licence: [
            {
              licenceTypeId: 7,
              licenceNo: formData.registrationNumber,
              licenceValidUpto: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
              hospitalCode: formData.registrationNumber,
            }
          ]
        },
        customerDocs: uploadedDocs,
        isBuyer: formData.markAsBuyingEntity || false,
        customerGroupId: formData.customerGroupId || 1,
        generalDetails: {
          name: formData.hospitalName,
          shortName: formData.shortName || '',
          address1: formData.address1,
          address2: formData.address2 || '',
          address3: formData.address3 || '',
          address4: formData.address4 || '',
          pincode: parseInt(formData.pincode),
          area: formData.area,
          city: formData.city,
          state: formData.state,
        },
        securityDetails: {
          mobile: formData.mobileNumber,
          email: formData.emailAddress || '',
          panNumber: formData.panNumber || '',
          gstNumber: formData.gstNumber || '',
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

        console.log('Registration successful:', response?.data?.id);

        Toast.show({
          type: 'success',
          text1: 'Registration Successful',
          text2: response.message || 'Government Hospital registered successfully',
        position: 'top',
        });

        navigation.navigate('RegistrationSuccess', {
          type: 'hospital',
          registrationCode: response.data?.id || response.data?.id || 'SUCCESS',
          customerId: response?.data?.id,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: response.details || 'Failed to register hospital. Please try again.',
        position: 'top',
        });
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

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toLocaleDateString('en-IN');
      setFormData(prev => ({ ...prev, registrationDate: formattedDate }));
    }
  };


  const handleCancel = () => {
    setShowCancelModal(true);
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

        <AppText style={styles.stepTitle}>License Details<AppText style={{ color: 'red' }}>*</AppText></AppText>

        <FileUploadComponent
          placeholder="Upload Govt. Establishment Order"
          accept={['pdf', 'jpg', 'png']}
          maxSize={15 * 1024 * 1024}
          docType={DOC_TYPES.REGISTRATION_CERTIFICATE}
          initialFile={formData.registrationCertificateFile}
          onFileUpload={(file) => handleFileUpload('registrationCertificate', file)}
          onFileDelete={() => handleFileDelete('registrationCertificate')}
          onOcrDataExtracted={handleRegistrationOcrData}
          errorMessage={errors.registrationCertificateFile}
        />

        <CustomInput
          placeholder="Hospital Code "
          value={formData.registrationNumber}
          onChangeText={(text) => setFormData(prev => ({ ...prev, registrationNumber: text }))}
          error={errors.registrationNumber}
          autoCapitalize="characters"
          mandatory={false}
        />

        <CustomInput
          placeholder="NIN (National Identification Number)"
          value={formData.nin}
          onChangeText={(text) => {
            setFormData(prev => ({ ...prev, nin: text }));
            setErrors(prev => ({ ...prev, nin: null }));
          }}
          error={errors.nin}
          autoCapitalize="characters"
          mandatory={false}
        />

        <TouchableOpacity
          style={[styles.datePickerInput, errors.registrationDate && styles.inputError]}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.7}
        >
          <View style={styles.inputTextContainer}>
            <AppText style={formData.registrationDate ? styles.inputText : styles.placeholderText}>
              {formData.registrationDate || 'Legal Start Date'}
            </AppText>
            {/* <AppText style={styles.inlineAsterisk}>*</AppText> */}
          </View>
          <Calendar />
        </TouchableOpacity>
        {errors.registrationDate && (
          <AppText style={styles.errorText}>{errors.registrationDate}</AppText>
        )}

        <FileUploadComponent
          placeholder="Official Letter on Dept. Letterhead"
          accept={['jpg', 'png', 'jpeg']}
          maxSize={15 * 1024 * 1024}
          docType={DOC_TYPES.HOSPITAL_IMAGE}
          initialFile={formData.hospitalImageFile}
          onFileUpload={(file) => handleFileUpload('hospitalImage', file)}
          onFileDelete={() => handleFileDelete('hospitalImage')}
          errorMessage={errors.hospitalImageFile}
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

        <AppText style={styles.stepTitle}>General Details<AppText style={{ color: 'red' }}>*</AppText></AppText>

        <CustomInput
          placeholder="Hospital name"
          value={formData.hospitalName}
          onChangeText={(text) => setFormData(prev => ({ ...prev, hospitalName: text }))}
          error={errors.hospitalName}
          mandatory={true}
        />

        <CustomInput
          placeholder="Short name"
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
          error={errors.address2}
          mandatory={true}
        />

        <CustomInput
          placeholder="Address 3"
          value={formData.address3}
          onChangeText={(text) => {
            setFormData(prev => ({ ...prev, address3: text }));
            setErrors(prev => ({ ...prev, address3: null }));
          }}
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
        <TouchableOpacity
          style={[styles.input, errors.city && styles.inputError]}
          onPress={() => setShowCityModal(true)}
          activeOpacity={0.7}
        >
          <View style={styles.inputTextContainer}>
            <AppText style={formData.city ? styles.inputText : styles.placeholderText}>
              {formData.city || 'City'}
            </AppText>
            <AppText style={styles.inlineAsterisk}>*</AppText>
          </View>
          <ArrowDown color='#999' />
        </TouchableOpacity>
        {errors.city && (
          <AppText style={styles.errorText}>{errors.city}</AppText>
        )}

        {/* State Dropdown */}
        <TouchableOpacity
          style={[styles.input, errors.state && styles.inputError]}
          onPress={() => setShowStateModal(true)}
          activeOpacity={0.7}
        >
          <View style={styles.inputTextContainer}>
            <AppText style={formData.state ? styles.inputText : styles.placeholderText}>
              {formData.state || 'State'}
            </AppText>
            <AppText style={styles.inlineAsterisk}>*</AppText>
          </View>
          <ArrowDown color='#999' />
        </TouchableOpacity>
        {errors.state && (
          <AppText style={styles.errorText}>{errors.state}</AppText>
        )}

      </View>
    </Animated.View>
  );

  // === FIXED: removed stray text node between Animated.View and View here ===
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

        <AppText style={styles.stepTitle}>Security Details<AppText style={{ color: 'red' }}>*</AppText></AppText>

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

        {/* Upload PAN */}
        <FileUploadComponent
          placeholder="Upload PAN"
          accept={['pdf', 'jpg', 'png', 'jpeg']}
          maxSize={15 * 1024 * 1024}
          docType={DOC_TYPES.PAN}
          initialFile={formData.panFile}
          onFileUpload={(file) => handleFileUpload('pan', file)}
          onFileDelete={() => handleFileDelete('pan')}
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

        {/* PAN Number */}
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

        {/* Upload GST */}
        <FileUploadComponent
          placeholder="Upload GST"
          accept={['pdf', 'jpg', 'png', 'jpeg']}
          maxSize={15 * 1024 * 1024}
          docType={DOC_TYPES.GST}
          initialFile={formData.gstFile}
          onFileUpload={(file) => handleFileUpload('gst', file)}
          onFileDelete={() => handleFileDelete('gst')}
          errorMessage={errors.gstFile}
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

        {/* GST Number Input */}
        <CustomInput
          placeholder="GST Number"
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
      <AppText style={styles.stepTitle}>Mapping</AppText>

      {/* Mark as Buying Entity Switch */}
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

      <AppText style={styles.stepTitle}>
        Select category
      </AppText>

      {/* Link Child Hospital */}
      <View style={styles.inputTextContainer}>
        <AppText style={styles.subsectionLabel}>Link hospital<AppText style={styles.inlineAsterisk}>*</AppText>
          <Icon name="information-circle-outline" size={16} color="#999" /></AppText>
      </View>

      {/* Hospital Selector Dropdown */}
      <TouchableOpacity
        style={[styles.selectorInput, errors.linkedHospitals && styles.inputError]}
        onPress={() => {
          navigation.navigate('HospitalSelector', {
            selectedHospitals: formData.linkedHospitals,
            onSelect: (hospitals) => {
              setFormData(prev => ({
                ...prev,
                linkedHospitals: hospitals.map(h => ({
                  ...h,
                  pharmacies: []
                }))
              }));
              setErrors(prev => ({ ...prev, linkedHospitals: null }));
            }
          });
        }}
        activeOpacity={0.7}
      >
        <AppText style={styles.selectorPlaceholder}>
          {formData.linkedHospitals.length > 0
            ? `${formData.linkedHospitals.length} Hospitals Selected`
            : 'Search hospital name/code'}
        </AppText>
        <ArrowDown />
      </TouchableOpacity>
      {errors.linkedHospitals && (
        <AppText style={styles.errorText}>{errors.linkedHospitals}</AppText>
      )}

      {/* Accordion-style Hospital List with Nested Pharmacies */}
      {formData.linkedHospitals.length > 0 && (
        <View style={styles.hospitalsContainer}>
          {formData.linkedHospitals.map((hospital, index) => (
            <View key={hospital.id || index} style={styles.hospitalAccordion}>
              {/* Hospital Header */}
              <TouchableOpacity
                style={styles.hospitalHeader}
                onPress={() => {
                  setExpandedHospitals(prev => ({
                    ...prev,
                    [hospital.id]: !prev[hospital.id]
                  }));
                }}
                activeOpacity={0.7}
              >
                <View style={styles.hospitalHeaderContent}>
                  <AppText style={styles.hospitalName}>{hospital.name}</AppText>
                </View>
                <View style={styles.hospitalHeaderActions}>
                  <TouchableOpacity
                    onPress={() => {
                      setFormData(prev => ({
                        ...prev,
                        linkedHospitals: prev.linkedHospitals.filter((_, i) => i !== index)
                      }));
                    }}
                    style={styles.removeButton}
                  >
                    <CloseCircle color="#999" />
                  </TouchableOpacity>
                  <Icon
                    name={expandedHospitals[hospital.id] ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.primary}
                    style={styles.chevron}
                  />
                </View>
              </TouchableOpacity>

              {/* Hospital Content (Pharmacies) */}
              {expandedHospitals[hospital.id] && (
                <View style={styles.hospitalContent}>
                  {/* Pharmacies Section */}
                  <View style={styles.pharmaciesSection}>
                    <AppText style={styles.pharmaciesLabel}>Pharmacies</AppText>

                    {/* Selected Pharmacies Tags */}
                    {hospital.pharmacies && hospital.pharmacies.length > 0 && (
                      <View style={styles.pharmaciesTags}>
                        {hospital.pharmacies.map((pharmacy, pIndex) => (
                          <View key={pharmacy.id || pIndex} style={styles.pharmacyTag}>
                            <AppText style={styles.pharmacyTagText}>{pharmacy.name}</AppText>
                            <TouchableOpacity
                              onPress={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  linkedHospitals: prev.linkedHospitals.map((h, hIndex) =>
                                    hIndex === index
                                      ? {
                                        ...h,
                                        pharmacies: h.pharmacies.filter((_, pIdx) => pIdx !== pIndex)
                                      }
                                      : h
                                  )
                                }));
                              }}
                              style={styles.pharmacyTagRemove}
                            >
                              <Icon name="close" size={14} color="#666" />
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
                          selectedPharmacies: hospital.pharmacies || [],
                          onSelect: (pharmacies) => {
                            setFormData(prev => ({
                              ...prev,
                              linkedHospitals: prev.linkedHospitals.map((h, hIndex) =>
                                hIndex === index
                                  ? { ...h, pharmacies }
                                  : h
                              )
                            }));
                          }
                        });
                      }}
                    >
                      <AppText style={styles.addPharmacyLinkText}>+ Add Pharmacy</AppText>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
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

      {/* <View style={styles.divider} /> */}

      {/* Pharmacy Selection */}
      <AppText style={styles.sectionLabel}>Pharmacy</AppText>

      <View style={styles.pharmacySelectionContainer}>
        <TouchableOpacity
          style={styles.pharmacySelectButton}
          onPress={() => {
            navigation.navigate('PharmacySelector', {
              selectedPharmacies: formData.linkedPharmacies || [],
              onSelect: (pharmacies) => {
                setFormData(prev => ({
                  ...prev,
                  linkedPharmacies: pharmacies
                }));
              }
            });
          }}
          activeOpacity={0.7}
        >
          <AppText style={styles.pharmacySelectButtonText}>
            {formData.linkedPharmacies && formData.linkedPharmacies.length > 0
              ? `${formData.linkedPharmacies.length} Pharmacies Selected`
              : 'Select Pharmacy'}
          </AppText>
          <ArrowDown />
        </TouchableOpacity>
      </View>

      {/* Selected Pharmacies Display */}
      {formData.linkedPharmacies && formData.linkedPharmacies.length > 0 && (
        <View style={styles.selectedPharmaciesContainer}>
          {formData.linkedPharmacies.map((pharmacy, index) => (
            <View key={pharmacy.id || index} style={styles.pharmacyItem}>
              <View style={styles.pharmacyInfo}>
                <AppText style={styles.pharmacyName}>{pharmacy.name}</AppText>
                <AppText style={styles.pharmacyCode}>{pharmacy.code}</AppText>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setFormData(prev => ({
                    ...prev,
                    linkedPharmacies: prev.linkedPharmacies.filter((_, i) => i !== index)
                  }));
                }}
              >
                <CloseCircle color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.addNewLink}
        onPress={() => setShowAddPharmacyModal(true)}
      >
        <AppText style={styles.addNewLinkText}>+ Add New Pharmacy</AppText>
      </TouchableOpacity>

      {/* <View style={styles.divider} /> */}
      <View style={styles.customerGroupContainer}>
        {/* Customer Group - Radio Buttons Grid */}
        <AppText style={styles.sectionLabel}>Customer group</AppText>

        <View style={styles.radioGridContainer}>
          {['9 Doctor Supply', '10 VQ', '11 RFQ', '12 GOVT'].map((group, index) => {
            const groupId = index + 9; // 9, 10, 11, 12
            const isDisabled = group !== '12 GOVT';
            const isSelected = formData.customerGroupId === groupId;
            
            return (
              <TouchableOpacity
                key={group}
                style={[styles.radioGridItem, isDisabled && styles.radioGridItemDisabled]}
                onPress={() => {
                  if (!isDisabled) {
                    setFormData(prev => ({ ...prev, customerGroupId: groupId }));
                  }
                }}
                activeOpacity={isDisabled ? 0.5 : 0.7}
                disabled={isDisabled}
              >
                <View style={[
                  styles.radioButton,
                  isDisabled && styles.radioButtonDisabled,
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



      {/* Stockist Suggestions */}
      <View style={styles.sectionLabelContainer}>
        <AppText style={styles.sectionLabel}>Stockist Suggestions <AppText style={styles.optional}>(Optional)</AppText> </AppText>
       
      </View>

      {/* Stockist List */}
      {stockists.map((stockist, index) => (
        <View key={index} style={styles.stockistCard}>
          <View style={styles.stockistCardHeader}>
            <View>
              <AppText style={styles.stockistCardTitle}>Stockist</AppText>
            </View>
            <View>
              <AppText style={styles.stockistCardIndex}>{index + 1}</AppText>
            </View>
            {index > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setStockists(prev => prev.filter((_, i) => i !== index));
                }}
                style={styles.deleteStockistButton}
              >
                <Icon name="trash-outline" size={20} color="#FF3B30" />
              </TouchableOpacity>
            )}
          </View>

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
      <TouchableOpacity
        style={styles.addStockistButton}
        onPress={() => {
          setStockists(prev => [...prev, { name: '', distributorCode: '', city: '' }]);
        }}
        activeOpacity={0.7}
      >
        <AppText style={styles.addStockistButtonText}>+ Add Stockist</AppText>
      </TouchableOpacity>
    </Animated.View>
  );

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
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <AppText style={styles.cancelButtonText}>Cancel</AppText>
        </TouchableOpacity>

        <Animated.View
          style={[
            { flex: 1 },
            { transform: [{ scale: buttonScaleAnim }] }
          ]}
        >
          <TouchableOpacity
  style={[styles.registerButton, loading && styles.disabledButton]}            onPress={handleNextStep}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <AppText style={styles.registerButtonText}>Register</AppText>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>


       

      {/* Cancel Confirmation Modal */}
      {/* Dropdown Modals */}
      <DropdownModal
        visible={showStateModal}
        onClose={() => setShowStateModal(false)}
        title="Select State"
        data={states}
        selectedId={states.find(s => s.name === formData.state)?.id}
        onSelect={(item) => {
          setFormData(prev => ({
            ...prev,
            state: item.name
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
        selectedId={cities.find(c => c.name === formData.city)?.id}
        onSelect={(item) => {
          setFormData(prev => ({
            ...prev,
            city: item.name
          }));
          setErrors(prev => ({ ...prev, city: null }));
        }}
        loading={loadingCities}
      />


      <Modal
        visible={showCancelModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
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

      {/* Add New Hospital Modal */}
      <AddNewHospitalModal
        visible={showAddHospitalModal}
        pharmacyName={formData.hospitalName}
        onClose={() => setShowAddHospitalModal(false)}
        onAdd={(hospital) => {
          setFormData(prev => ({
            ...prev,
            linkedHospitals: [...prev.linkedHospitals, { ...hospital, pharmacies: [] }]
          }));
          setShowAddHospitalModal(false);
        }}
      />

      {/* Add New Pharmacy Modal */}
      <AddNewPharmacyModal
        visible={showAddPharmacyModal}
        onClose={() => setShowAddPharmacyModal(false)}
        hospitalName={formData.hospitalName}
        parentHospital={true}
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

      {/* Add New Doctor Modal */}
      {/* <AddNewDoctorModal
        visible={showAddDoctorModal}
        onClose={() => setShowAddDoctorModal(false)}
        onAdd={(doctor) => {
          setFormData(prev => ({
            ...prev,
            linkedDoctors: [...prev.linkedDoctors, doctor]
          }));
          setShowAddDoctorModal(false);
        }}
      /> */}
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
    color: colors.gray,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: -12,
    marginBottom: 12,
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

  section: {
    marginBottom: 32,
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
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    fontWeight: "500"
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
    marginBottom: 20,
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
    marginBottom: 30


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
    // borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 0,
    marginBottom: 16,
    // borderWidth: 1,
    // borderColor: '#E8E8E8',
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
    flexDirection: 'row',
    paddingHorizontal: 0,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
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
    paddingHorizontal: 16,
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
    paddingHorizontal: 16,
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
    paddingVertical: 8,
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
  radioGridItemDisabled: {
    opacity: 0.5,
  },
  radioButtonDisabled: {
    borderColor: '#CCCCCC',
    backgroundColor: '#F5F5F5',
  },
  radioButtonLabelDisabled: {
    color: '#CCCCCC',
  },
  // Pharmacy Selection Styles
  pharmacySelectionContainer: {
    marginBottom: 12,
  },
  pharmacySelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  pharmacySelectButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  selectedPharmaciesContainer: {
    marginBottom: 12,
  },
  pharmacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#FAFAFA',
  },
  pharmacyInfo: {
    flex: 1,
  },
  pharmacyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  pharmacyCode: {
    fontSize: 12,
    color: '#999',
  }

  ,
  inlineAsterisk: {
    color: 'red',
    fontSize: 16,
    marginLeft: 2,
  },

  radioButtonContainer: {
    flexDirection: 'row',
    gap: 50,
    flex: 1,
    marginBottom: 16
  }, inputTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  inlineAsterisk: {
    color: 'red',
    fontSize: 16,
    marginLeft: 2,
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
});

export default GovtHospitalRegistrationForm;