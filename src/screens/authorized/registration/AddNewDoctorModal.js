/* eslint-disable no-dupe-keys */
// Add
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../styles/colors';
import Toast from 'react-native-toast-message';
import { customerAPI } from '../../../api/customer';
import FileUploadComponent from '../../../components/FileUploadComponent';
import AddressInputWithLocation from '../../../components/AddressInputWithLocation';
import { AppText, AppInput, CustomInput } from "../../../components"

const DOC_TYPES = {
  LICENSE_20B: 3,
  LICENSE_21B: 5,
  PHARMACY_IMAGE: 1,
  PAN: 7,
  GST: 2,
};

const MOCK_AREAS = [
  { id: 0, name: 'Vadgaonsheri'},
  { id: 1, name: 'Kharadi'},
  { id: 2, name: 'Viman Nagar'},
  { id: 3, name: 'Kalyani Nagar'},
  { id: 4, name: 'Koregaon Park'},
  { id: 5, name: 'Sadar'},
];

const AddNewDoctorModal = ({ visible, onClose, onSubmit, onAdd, pharmacyName }) => {
  const [doctorForm, setDoctorForm] = useState({
    // License Details
    clinicRegistrationCertificateFile: null,
    clinicRegistrationNumber: '',
    clinicRegistrationExpiryDate: '',
    practiceLicenseFile: null,
    practiceLicenseNumber: '',
    practiceLicenseExpiryDate: '',
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
    panFile: null,
    panNumber: '',
    gstFile: null,
    gstNumber: '',
    
    // Mapping
    isWholesalerOnly: false,
  });

  const [doctorErrors, setDoctorErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Document IDs for uploaded files
  const [documentIds, setDocumentIds] = useState({});
  
  // Uploaded documents with full details including docTypeId
  const [uploadedDocs, setUploadedDocs] = useState([]);
  
  // Verification status
  const [verificationStatus, setVerificationStatus] = useState({
    mobile: false,
    email: false,
    pan: false,
  });

  // OTP states
  const [showOTP, setShowOTP] = useState({ mobile: false, email: false });
  const [otpValues, setOtpValues] = useState({ mobile: ['', '', '', ''], email: ['', '', '', ''] });
  const [otpTimers, setOtpTimers] = useState({ mobile: 30, email: 30 });
  const [loadingOtp, setLoadingOtp] = useState({ mobile: false, email: false });
  const otpRefs = useRef({});
  
  // Date picker states
  const [showDatePicker, setShowDatePicker] = useState(null); // null, '20b', '21b', 'registration'
  const [selectedDate20b, setSelectedDate20b] = useState(new Date());
  const [selectedDate21b, setSelectedDate21b] = useState(new Date());
  const [selectedRegistrationDate, setSelectedRegistrationDate] = useState(new Date());
  
  // API Data
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  
  // Modal visibility
  const [showStateModal, setShowStateModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);

  useEffect(() => {
    if (visible) {
      loadStates();
    }
  }, [visible]);

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

  const loadStates = async () => {
    setLoadingStates(true);
    try {
      const response = await customerAPI.getStates();
      if (response.success && response.data) {
        const _states = response.data.states.map(state => ({
          id: state.id,
          name: state.stateName
        }));
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
  };

  const loadCities = async (stateId) => {
    setLoadingCities(true);
    setCities([]);
    try {
      const response = await customerAPI.getCities(stateId);
      if (response.success && response.data) {
        const _cities = response.data.cities.map(city => ({
          id: city.id,
          name: city.cityName
        }));
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

  const handleDateChange = (type, event, date) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(null);
      return;
    }
    
    if (date) {
      const formattedDate = date.toLocaleDateString('en-IN');
      
      if (type === 'clinicRegistration') {
        setSelectedDate20b(date);
        setDoctorForm(prev => ({ ...prev, clinicRegistrationExpiryDate: formattedDate }));
      } else if (type === 'practiceLicense') {
        setSelectedDate21b(date);
        setDoctorForm(prev => ({ ...prev, practiceLicenseExpiryDate: formattedDate }));
      }
    }
    
    setShowDatePicker(null);
  };

  const resetForm = () => {
    setDoctorForm({
      // License Details
      clinicRegistrationCertificateFile: null,
      clinicRegistrationNumber: '',
      clinicRegistrationExpiryDate: '',
      practiceLicenseFile: null,
      practiceLicenseNumber: '',
      practiceLicenseExpiryDate: '',
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
      panFile: null,
      panNumber: '',
      gstFile: null,
      gstNumber: '',
      
      // Mapping
      isWholesalerOnly: false,
    });
    setDoctorErrors({});
    setVerificationStatus({ mobile: false, email: false, pan: false });
    setCities([]);
    setDocumentIds({});
    setUploadedDocs([]);
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
    setDoctorForm(prev => ({ ...prev, [`${field}File`]: file }));
    setDoctorErrors(prev => ({ ...prev, [`${field}File`]: null }));
  };

  const handleFileDelete = (field) => {
    const file = doctorForm[`${field}File`];
    if (file && file.id) {
      setUploadedDocs(prev => prev.filter(doc => doc.id !== file.id));
    }
    setDocumentIds(prev => ({ ...prev, [field]: null }));
    setDoctorForm(prev => ({ ...prev, [`${field}File`]: null }));
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleVerify = async (field) => {
    // Validate the field before showing OTP
    if (field === 'mobile' && (!doctorForm.mobileNumber || doctorForm.mobileNumber.length !== 10)) {
      setDoctorErrors(prev => ({ ...prev, mobileNumber: 'Please enter valid 10-digit mobile number' }));
      return;
    }
    if (field === 'email' && (!doctorForm.emailAddress || !doctorForm.emailAddress.includes('@'))) {
      setDoctorErrors(prev => ({ ...prev, emailAddress: 'Please enter valid email address' }));
      return;
    }

    setLoadingOtp(prev => ({ ...prev, [field]: true }));
    try {
      // Reset OTP state before generating new OTP
      setOtpValues(prev => ({ ...prev, [field]: ['', '', '', ''] }));
      setOtpTimers(prev => ({ ...prev, [field]: 30 }));

      const requestData = {
        [field === 'mobile' ? 'mobile' : 'email']: 
          field === 'mobile' ? doctorForm.mobileNumber : doctorForm.emailAddress
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
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.message || 'Failed to generate OTP',
        });
      }
    } catch (error) {
      console.error('Error generating OTP:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || error.message || 'Failed to send OTP. Please try again.',
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
      
      // Check if OTP is complete (all 4 digits filled)
      if (newOtpValues[field].every(v => v !== '')) {
        const otp = newOtpValues[field].join('');
        // Add a small delay to ensure state is updated
        setTimeout(() => {
          handleOtpVerification(field, otp);
        }, 100);
      }
    }
  };

  const handleOtpVerification = async (field, otp) => {
    const otpValue = otp || otpValues[field].join('');
    
    setLoadingOtp(prev => ({ ...prev, [field]: true }));
    try {
      const requestData = {
        [field === 'mobile' ? 'mobile' : 'email']: 
          field === 'mobile' ? doctorForm.mobileNumber : doctorForm.emailAddress
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
          text2: response.message || 'Please enter the correct OTP',
        });
      }
    } catch (error) {
      console.error('OTP validation error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || error.message || 'Failed to validate OTP. Please try again.',
      });
    } finally {
      setLoadingOtp(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleResendOTP = async (field) => {
    setOtpTimers(prev => ({ ...prev, [field]: 30 }));
    await handleVerify(field);
  };

  const renderOTPInput = (field) => {
    if (!showOTP[field]) return null;
    
    return (
      <View style={styles.otpContainer}>
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
              editable={!loadingOtp[field]}
            />
          ))}
        </View>
        <View style={styles.otpFooter}>
          <AppText style={styles.otpTimer}>
            {otpTimers[field] > 0 ? `Resend in ${otpTimers[field]}s` : ''}
          </AppText>
          {otpTimers[field] === 0 && (
            <TouchableOpacity onPress={() => handleResendOTP(field)} disabled={loadingOtp[field]}>
              <AppText style={styles.resendText}>Resend OTP</AppText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Helper function to parse date string in DD/MM/YYYY format to ISO format
  const parseDateToISO = (dateString) => {
    if (!dateString) return new Date().toISOString();
    try {
      // Parse DD/MM/YYYY format
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
        const year = parseInt(parts[2], 10);
        const date = new Date(year, month, day);
        return date.toISOString();
      }
      return new Date().toISOString();
    } catch (error) {
      console.error('Error parsing date:', error);
      return new Date().toISOString();
    }
  };

  const handleSubmit = async () => {
    console.log('=== handleSubmit called ===');
    console.log('Doctor Form:', doctorForm);
    console.log('Document IDs:', documentIds);
    console.log('Verification Status:', verificationStatus);

    // Comprehensive validation
    const newErrors = {};

    // Clinic Registration Certificate validation
    if (!doctorForm.clinicRegistrationCertificateFile && !documentIds.clinicRegistrationCertificate) {
      newErrors.clinicRegistrationCertificateFile = 'Clinic Registration Certificate is required';
    }
    if (!doctorForm.clinicRegistrationNumber || doctorForm.clinicRegistrationNumber.trim() === '') {
      newErrors.clinicRegistrationNumber = 'Clinic Registration Number is required';
    }
    if (!doctorForm.clinicRegistrationExpiryDate || doctorForm.clinicRegistrationExpiryDate.trim() === '') {
      newErrors.clinicRegistrationExpiryDate = 'Clinic Registration Expiry Date is required';
    }
    
    // Practice License validation
    if (!doctorForm.practiceLicenseFile && !documentIds.practiceLicense) {
      newErrors.practiceLicenseFile = 'Practice License is required';
    }
    if (!doctorForm.practiceLicenseNumber || doctorForm.practiceLicenseNumber.trim() === '') {
      newErrors.practiceLicenseNumber = 'Practice License Number is required';
    }
    if (!doctorForm.practiceLicenseExpiryDate || doctorForm.practiceLicenseExpiryDate.trim() === '') {
      newErrors.practiceLicenseExpiryDate = 'Practice License Expiry Date is required';
    }
    
    // Clinic Image validation
    if (!doctorForm.clinicImageFile && !documentIds.clinicImage) {
      newErrors.clinicImageFile = 'Clinic Image is required';
    }
    
    // Doctor Name validation
    if (!doctorForm.doctorName || doctorForm.doctorName.trim() === '') {
      newErrors.doctorName = 'Doctor name is required';
    } else if (doctorForm.doctorName.trim().length < 3) {
      newErrors.doctorName = 'Doctor name must be at least 3 characters';
    }
    
    // Speciality validation
    if (!doctorForm.speciality || doctorForm.speciality.trim() === '') {
      newErrors.speciality = 'Speciality is required';
    }
    
    // Address 1 validation
    if (!doctorForm.address1 || doctorForm.address1.trim() === '') {
      newErrors.address1 = 'Address 1 is required';
    }
    
    // Pincode validation
    if (!doctorForm.pincode || doctorForm.pincode.trim() === '') {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^[1-9]\d{5}$/.test(doctorForm.pincode)) {
      newErrors.pincode = 'Valid 6-digit pincode is required';
    }
    
    // Area validation
    if (!doctorForm.area || doctorForm.area.trim() === '') {
      newErrors.area = 'Area is required';
    }
    
    // City validation
    if (!doctorForm.city || !doctorForm.cityId) {
      newErrors.city = 'City is required';
    }
    
    // State validation
    if (!doctorForm.state || !doctorForm.stateId) {
      newErrors.state = 'State is required';
    }
    
    // Mobile Number validation
    if (!doctorForm.mobileNumber || doctorForm.mobileNumber.trim() === '') {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(doctorForm.mobileNumber)) {
      newErrors.mobileNumber = 'Mobile number must be 10 digits';
    } else if (!verificationStatus.mobile) {
      newErrors.mobileVerification = 'Please verify mobile number';
    }
    
    // Email Address validation
    if (!doctorForm.emailAddress || doctorForm.emailAddress.trim() === '') {
      newErrors.emailAddress = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(doctorForm.emailAddress)) {
      newErrors.emailAddress = 'Please enter a valid email address';
    } else if (!verificationStatus.email) {
      newErrors.emailVerification = 'Please verify email address';
    }
    
    // PAN validation
    if (!doctorForm.panFile && !documentIds.pan) {
      newErrors.panFile = 'PAN document is required';
    }
    if (!doctorForm.panNumber || doctorForm.panNumber.trim() === '') {
      newErrors.panNumber = 'PAN number is required';
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(doctorForm.panNumber)) {
      newErrors.panNumber = 'Invalid PAN format (e.g., ABCDE1234F)';
    }
    
    // GST validation
    if (!doctorForm.gstFile && !documentIds.gst) {
      newErrors.gstFile = 'GST document is required';
    }
    if (!doctorForm.gstNumber || doctorForm.gstNumber.trim() === '') {
      newErrors.gstNumber = 'GST number is required';
    } else if (!/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(doctorForm.gstNumber)) {
      newErrors.gstNumber = 'Invalid GST format';
    }

    if (Object.keys(newErrors).length > 0) {
      console.log('=== Validation Errors ===');
      console.log('Errors:', newErrors);
      setDoctorErrors(newErrors);
      
      // Find the first error to show
      const firstErrorField = Object.keys(newErrors)[0];
      const firstErrorMessage = newErrors[firstErrorField];
      
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: firstErrorMessage,
        position: 'top',
      });
      return;
    }

    console.log('=== Validation Passed - Calling API ===');
    setLoading(true);

    try {
      // Prepare doctor registration payload matching the API structure
      const registrationData = {
        typeId: 3,
        categoryId: 0,
        subCategoryId: 0,
        isMobileVerified: verificationStatus.mobile,
        isEmailVerified: verificationStatus.email,
        isExisting: false,
        licenceDetails: {
          registrationDate: new Date().toISOString(),
          licence: [
            {
              licenceTypeId: 6,
              licenceNo: doctorForm.clinicRegistrationNumber,
              licenceValidUpto: parseDateToISO(doctorForm.clinicRegistrationExpiryDate),
            },
            {
              licenceTypeId: 7,
              licenceNo: doctorForm.practiceLicenseNumber,
              licenceValidUpto: parseDateToISO(doctorForm.practiceLicenseExpiryDate),
            }
          ]
        },
        customerDocs: uploadedDocs,
        isBuyer: true,
        customerGroupId: 1,
        generalDetails: {
          name: doctorForm.doctorName,
          shortName: '',
          address1: doctorForm.address1,
          address2: doctorForm.address2 || '',
          address3: doctorForm.address3 || '',
          address4: doctorForm.address4 || '',
          pincode: parseInt(doctorForm.pincode),
          area: doctorForm.area,
          cityId: parseInt(doctorForm.cityId),
          stateId: parseInt(doctorForm.stateId),
          ownerName: '',
          clinicName: doctorForm.clinicName,
          specialist: doctorForm.speciality,
        },
        securityDetails: {
          mobile: doctorForm.mobileNumber,
          email: doctorForm.emailAddress,
          panNumber: doctorForm.panNumber,
          gstNumber: doctorForm.gstNumber,
        },
        suggestedDistributors: [{
          distributorCode: '',
          distributorName: '',
          city: ''
        }]
      };

      console.log('Doctor registration payload:', registrationData);
      console.log('=== Calling API: customerAPI.createCustomer ===');

      const response = await customerAPI.createCustomer(registrationData);
      
      console.log('=== API Response ===');
      console.log('Response:', response);
      
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Doctor Added',
          text2: response.message || 'Doctor registered successfully',
        });

        // Pass the created doctor data back to parent
        const newDoctor = {
          id: response.data?.id || Date.now(),
          name: doctorForm.doctorName,
          code: response.data?.code,
          customerId: response.data?.id,
          stateId: doctorForm.stateId,
          cityId: doctorForm.cityId,
          area: doctorForm.area,
          city: doctorForm.city,
          state: doctorForm.state,
          mobileNumber: doctorForm.mobileNumber,
          emailAddress: doctorForm.emailAddress,
          isNew: true,
          ...response.data,
        };

        // Call onAdd callback if provided, otherwise onSubmit
        if (onAdd) {
          onAdd(newDoctor);
        } else if (onSubmit) {
          onSubmit(newDoctor);
        }

        // Reset and close
        resetForm();
        onClose();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: response.details || 'Failed to register doctor. Please try again.',
        });
      }
    } catch (error) {
      console.error('Doctor registration error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An error occurred while registering the doctor. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
            <AppText style={styles.modalTitle}>Add Doctor Account</AppText>
          </View>

          {/* License Details */}
          <AppText style={styles.modalSectionLabel}>License Details <AppText style={styles.mandatory}>*</AppText></AppText>
          
          {/* Clinic Registration Certificate */}
          <AppText style={styles.fieldLabel}>Clinic Registration Certificate *</AppText>
          <FileUploadComponent
            placeholder="Upload Certificate"
            accept={['pdf', 'jpg', 'png']}
            maxSize={15 * 1024 * 1024}
            docType={DOC_TYPES.LICENSE_20B}
            initialFile={doctorForm.clinicRegistrationCertificateFile}
            onFileUpload={(file) => handleFileUpload('clinicRegistrationCertificate', file)}
            onFileDelete={() => handleFileDelete('clinicRegistrationCertificate')}
            errorMessage={doctorErrors.clinicRegistrationCertificateFile}
          />
          {doctorErrors.clinicRegistrationCertificateFile && (
            <AppText style={styles.errorText}>{doctorErrors.clinicRegistrationCertificateFile}</AppText>
          )}
          
          <AppInput
            style={[styles.modalInput, { marginBottom: doctorErrors.clinicRegistrationNumber ? 5 : 10 }, doctorErrors.clinicRegistrationNumber && styles.inputError]}
            placeholder="Clinic Registration Number *"
            placeholderTextColor="#999"
            value={doctorForm.clinicRegistrationNumber}
            onChangeText={(text) => {
              setDoctorForm(prev => ({ ...prev, clinicRegistrationNumber: text }));
              if (doctorErrors.clinicRegistrationNumber) {
                setDoctorErrors(prev => ({ ...prev, clinicRegistrationNumber: null }));
              }
            }}
          />
          {doctorErrors.clinicRegistrationNumber && (
            <AppText style={styles.errorText}>{doctorErrors.clinicRegistrationNumber}</AppText>
          )}
          
          <TouchableOpacity 
            style={[styles.modalInput, { marginBottom: doctorErrors.clinicRegistrationExpiryDate ? 5 : 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, doctorErrors.clinicRegistrationExpiryDate && styles.inputError]}
            onPress={() => setShowDatePicker('clinicRegistration')}
          >
            <AppText style={[styles.dropdownPlaceholder, doctorForm.clinicRegistrationExpiryDate && { color: '#333' }]}>
              {doctorForm.clinicRegistrationExpiryDate || 'Expiry date *'}
            </AppText>
            <Icon name="calendar-today" size={20} color="#999" />
          </TouchableOpacity>
          {doctorErrors.clinicRegistrationExpiryDate && (
            <AppText style={styles.errorText}>{doctorErrors.clinicRegistrationExpiryDate}</AppText>
          )}

          {/* Practice License */}
          <AppText style={styles.fieldLabel}>Practice License *</AppText>
          <FileUploadComponent
            placeholder="Upload License"
            accept={['pdf', 'jpg', 'png']}
            maxSize={15 * 1024 * 1024}
            docType={DOC_TYPES.LICENSE_21B}
            initialFile={doctorForm.practiceLicenseFile}
            onFileUpload={(file) => handleFileUpload('practiceLicense', file)}
            onFileDelete={() => handleFileDelete('practiceLicense')}
            errorMessage={doctorErrors.practiceLicenseFile}
          />
          {doctorErrors.practiceLicenseFile && (
            <AppText style={styles.errorText}>{doctorErrors.practiceLicenseFile}</AppText>
          )}
          
          <AppInput
            style={[styles.modalInput, { marginBottom: doctorErrors.practiceLicenseNumber ? 5 : 10 }, doctorErrors.practiceLicenseNumber && styles.inputError]}
            placeholder="Practice License Number *"
            placeholderTextColor="#999"
            value={doctorForm.practiceLicenseNumber}
            onChangeText={(text) => {
              setDoctorForm(prev => ({ ...prev, practiceLicenseNumber: text }));
              if (doctorErrors.practiceLicenseNumber) {
                setDoctorErrors(prev => ({ ...prev, practiceLicenseNumber: null }));
              }
            }}
          />
          {doctorErrors.practiceLicenseNumber && (
            <AppText style={styles.errorText}>{doctorErrors.practiceLicenseNumber}</AppText>
          )}
          
          <TouchableOpacity 
            style={[styles.modalInput, { marginBottom: doctorErrors.practiceLicenseExpiryDate ? 5 : 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, doctorErrors.practiceLicenseExpiryDate && styles.inputError]}
            onPress={() => setShowDatePicker('practiceLicense')}
          >
            <AppText style={[styles.dropdownPlaceholder, doctorForm.practiceLicenseExpiryDate && { color: '#333' }]}>
              {doctorForm.practiceLicenseExpiryDate || 'Expiry date *'}
            </AppText>
            <Icon name="calendar-today" size={20} color="#999" />
          </TouchableOpacity>
          {doctorErrors.practiceLicenseExpiryDate && (
            <AppText style={styles.errorText}>{doctorErrors.practiceLicenseExpiryDate}</AppText>
          )}

          {/* Address Proof / Clinic Image */}
          <AppText style={styles.fieldLabel}>Address Proof / Clinic Image *</AppText>
          <FileUploadComponent
            placeholder="Upload"
            accept={['jpg', 'png', 'jpeg']}
            maxSize={15 * 1024 * 1024}
            docType={DOC_TYPES.PHARMACY_IMAGE}
            initialFile={doctorForm.clinicImageFile}
            onFileUpload={(file) => handleFileUpload('clinicImage', file)}
            onFileDelete={() => handleFileDelete('clinicImage')}
            errorMessage={doctorErrors.clinicImageFile}
          />
          {doctorErrors.clinicImageFile && (
            <AppText style={styles.errorText}>{doctorErrors.clinicImageFile}</AppText>
          )}

          {/* Date Pickers */}
          {showDatePicker === 'clinicRegistration' && (
            <DateTimePicker
              value={selectedDate20b}
              mode="date"
              display="default"
              onChange={(event, date) => handleDateChange('clinicRegistration', event, date)}
            />
          )}
          {showDatePicker === 'practiceLicense' && (
            <DateTimePicker
              value={selectedDate21b}
              mode="date"
              display="default"
              onChange={(event, date) => handleDateChange('practiceLicense', event, date)}
            />
          )}

          {/* General Details */}
          <AppText style={styles.modalSectionLabel}>General Details <AppText style={styles.mandatory}>*</AppText></AppText>
          
          <AppInput
            style={[styles.modalInput, { marginBottom: doctorErrors.doctorName ? 5 : 10 }, doctorErrors.doctorName && styles.inputError]}
            placeholder="Name of the Doctor *"
            placeholderTextColor="#999"
            value={doctorForm.doctorName}
            onChangeText={(text) => {
              setDoctorForm(prev => ({ ...prev, doctorName: text }));
              if (doctorErrors.doctorName) {
                setDoctorErrors(prev => ({ ...prev, doctorName: null }));
              }
            }}
          />
          {doctorErrors.doctorName && (
            <AppText style={styles.errorText}>{doctorErrors.doctorName}</AppText>
          )}
          
          <AppInput
            style={[styles.modalInput, { marginBottom: doctorErrors.speciality ? 5 : 10 }, doctorErrors.speciality && styles.inputError]}
            placeholder="Speciality *"
            placeholderTextColor="#999"
            value={doctorForm.speciality}
            onChangeText={(text) => {
              setDoctorForm(prev => ({ ...prev, speciality: text }));
              if (doctorErrors.speciality) {
                setDoctorErrors(prev => ({ ...prev, speciality: null }));
              }
            }}
          />
          {doctorErrors.speciality && (
            <AppText style={styles.errorText}>{doctorErrors.speciality}</AppText>
          )}

          <AppInput
            style={[styles.modalInput, { marginBottom: 10 }]}
            placeholder="Clinic Name"
            placeholderTextColor="#999"
            value={doctorForm.clinicName}
            onChangeText={(text) => setDoctorForm(prev => ({ ...prev, clinicName: text }))}
          />

          <AddressInputWithLocation
            label="Address 1"
            value={doctorForm.address1}
            onChangeText={(text) => {
              setDoctorForm(prev => ({ ...prev, address1: text }));
              if (doctorErrors.address1) {
                setDoctorErrors(prev => ({ ...prev, address1: null }));
              }
            }}
            placeholder="Address 1 *"
            error={doctorErrors.address1}
            mandatory={true}
            onLocationSelect={(locationData) => {
              console.log('Location selected:', locationData);
              
              // Update address field
              setDoctorForm(prev => ({ ...prev, address1: locationData.address }));
              
              // Update pincode
              if (locationData.pincode) {
                setDoctorForm(prev => ({ ...prev, pincode: locationData.pincode }));
                setDoctorErrors(prev => ({ ...prev, pincode: null }));
              }
              
              // Update area
              if (locationData.area) {
                setDoctorForm(prev => ({ ...prev, area: locationData.area }));
                setDoctorErrors(prev => ({ ...prev, area: null }));
              }
              
              // Match and update state
              if (locationData.state && states.length > 0) {
                const matchedState = states.find(s => 
                  s.name.toLowerCase().includes(locationData.state.toLowerCase()) ||
                  locationData.state.toLowerCase().includes(s.name.toLowerCase())
                );
                if (matchedState) {
                  setDoctorForm(prev => ({
                    ...prev,
                    state: matchedState.name,
                    stateId: matchedState.id,
                  }));
                  setDoctorErrors(prev => ({ ...prev, state: null }));
                  
                  // Load cities for the matched state
                  loadCities(matchedState.id);
                }
              }
              
              // Match and update city (after a short delay to ensure cities are loaded)
              if (locationData.city) {
                setTimeout(() => {
                  const matchedCity = cities.find(c => 
                    c.name.toLowerCase().includes(locationData.city.toLowerCase()) ||
                    locationData.city.toLowerCase().includes(c.name.toLowerCase())
                  );
                  if (matchedCity) {
                    setDoctorForm(prev => ({
                      ...prev,
                      city: matchedCity.name,
                      cityId: matchedCity.id,
                    }));
                    setDoctorErrors(prev => ({ ...prev, city: null }));
                  }
                }, 500);
              }
              
              // Clear errors
              setDoctorErrors(prev => ({
                ...prev,
                address1: null,
                pincode: null,
                area: null,
                city: null,
                state: null,
              }));
            }}
          />
          
          <AppInput
            style={[styles.modalInput, { marginBottom: 10 }]}
            placeholder="Address 2"
            placeholderTextColor="#999"
            value={doctorForm.address2}
            onChangeText={(text) => setDoctorForm(prev => ({ ...prev, address2: text }))}
            mandatory
          />

          <AppInput
            style={[styles.modalInput, { marginBottom: 10 }]}
            placeholder="Address 3"
            placeholderTextColor="#999"
            value={doctorForm.address3}
            onChangeText={(text) => setDoctorForm(prev => ({ ...prev, address3: text }))}
          />

          <AppInput
            style={[styles.modalInput, { marginBottom: 10 }]}
            placeholder="Address 4"
            placeholderTextColor="#999"
            value={doctorForm.address4}
            onChangeText={(text) => setDoctorForm(prev => ({ ...prev, address4: text }))}
          />

          <AppInput
            style={[styles.modalInput, { marginBottom: doctorErrors.pincode ? 5 : 10 }, doctorErrors.pincode && styles.inputError]}
            placeholder="Pincode *"
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={6}
            value={doctorForm.pincode}
            onChangeText={(text) => {
              if (/^\d{0,6}$/.test(text)) {
                setDoctorForm(prev => ({ ...prev, pincode: text }));
                if (doctorErrors.pincode) {
                  setDoctorErrors(prev => ({ ...prev, pincode: null }));
                }
              }
            }}
          />
          {doctorErrors.pincode && (
            <AppText style={styles.errorText}>{doctorErrors.pincode}</AppText>
          )}

          {/* Area - Input Field */}
          <AppInput
            style={[styles.modalInput, { marginBottom: doctorErrors.area ? 5 : 10 }, doctorErrors.area && styles.inputError]}
            placeholder="Area *"
            placeholderTextColor="#999"
            value={doctorForm.area}
            onChangeText={(text) => {
              setDoctorForm(prev => ({ ...prev, area: text }));
              if (doctorErrors.area) {
                setDoctorErrors(prev => ({ ...prev, area: null }));
              }
            }}
          />
          {doctorErrors.area && (
            <AppText style={styles.errorText}>{doctorErrors.area}</AppText>
          )}
          
          {/* City - Dropdown with Floating Label */}
          <View style={{ marginBottom: 10 }}>
            <TouchableOpacity
              style={[styles.dropdown, doctorErrors.city && styles.inputError]}
              onPress={() => {
                loadCities(null);
                setShowCityModal(true);
              }}
            >
              <View style={{ flex: 1 }}>
                {doctorForm.city && (
                  <AppText style={styles.floatingLabel}>City *</AppText>
                )}
                <AppText style={[styles.dropdownText, !doctorForm.city && styles.dropdownPlaceholder]}>
                  {doctorForm.city || 'City *'}
                </AppText>
              </View>
              <Icon name="arrow-drop-down" size={24} color="#999" />
            </TouchableOpacity>
            {doctorErrors.city && (
              <AppText style={styles.errorText}>{doctorErrors.city}</AppText>
            )}
          </View>

          {/* State - Dropdown with Floating Label */}
          <View style={{ marginBottom: 10 }}>
            <TouchableOpacity
              style={[styles.dropdown, doctorErrors.state && styles.inputError]}
              onPress={() => setShowStateModal(true)}
            >
              <View style={{ flex: 1 }}>
                {doctorForm.state && (
                  <AppText style={styles.floatingLabel}>State *</AppText>
                )}
                <AppText style={[styles.dropdownText, !doctorForm.state && styles.dropdownPlaceholder]}>
                  {doctorForm.state || 'State *'}
                </AppText>
              </View>
              <Icon name="arrow-drop-down" size={24} color="#999" />
            </TouchableOpacity>
            {doctorErrors.state && (
              <AppText style={styles.errorText}>{doctorErrors.state}</AppText>
            )}
          </View>

          {/* Security Details */}
          <AppText style={styles.modalSectionLabel}>Security Details <AppText style={styles.mandatory}>*</AppText></AppText>
          <View style={[styles.inputWithButton, doctorErrors.mobileNumber && styles.inputError]}>
            <AppInput
              style={styles.inputField}
              placeholder="Mobile number*"
              value={doctorForm.mobileNumber}
              onChangeText={(text) => {
                if (/^\d{0,10}$/.test(text)) {
                  setDoctorForm(prev => ({ ...prev, mobileNumber: text }));
                  if (doctorErrors.mobileNumber) {
                    setDoctorErrors(prev => ({ ...prev, mobileNumber: null, mobileVerification: null }));
                  }
                }
              }}
              keyboardType="phone-pad"
              maxLength={10}
              placeholderTextColor="#999"
              editable={!verificationStatus.mobile}
            />
            <TouchableOpacity
              style={styles.inlineVerifyButton}
              onPress={() => !verificationStatus.mobile && handleVerify('mobile')}
              disabled={verificationStatus.mobile || loadingOtp.mobile}
            >
              <AppText style={styles.inlineVerifyText}>
                {verificationStatus.mobile ? 'Verified' : 'Verify'}
              </AppText>
            </TouchableOpacity>
          </View>
          {(doctorErrors.mobileNumber || doctorErrors.mobileVerification) && (
            <AppText style={styles.errorText}>{doctorErrors.mobileNumber || doctorErrors.mobileVerification}</AppText>
          )}
          {renderOTPInput('mobile')}

          <View style={[styles.inputWithButton, doctorErrors.emailAddress && styles.inputError]}>
            <AppInput
              style={[styles.inputField, { flex: 1 }]}
              placeholder="Email Address"
              value={doctorForm.emailAddress}
              onChangeText={(text) => {
                setDoctorForm(prev => ({ ...prev, emailAddress: text }));
                if (doctorErrors.emailAddress) {
                  setDoctorErrors(prev => ({ ...prev, emailAddress: null, emailVerification: null }));
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
              editable={!verificationStatus.email}
            />
            <TouchableOpacity
              style={styles.inlineVerifyButton}
              onPress={() => !verificationStatus.email && handleVerify('email')}
              disabled={verificationStatus.email || loadingOtp.email}
            >
              <AppText style={styles.inlineVerifyText}>
                {verificationStatus.email ? 'Verified' : 'Verify'}
              </AppText>
            </TouchableOpacity>
          </View>
          {(doctorErrors.emailAddress || doctorErrors.emailVerification) && (
            <AppText style={styles.errorText}>{doctorErrors.emailAddress || doctorErrors.emailVerification}</AppText>
          )}
          {renderOTPInput('email')}

          {/* PAN */}
          <AppText style={styles.modalFieldLabel}>Upload PAN <AppText style={styles.mandatory}>*</AppText></AppText>
          <FileUploadComponent
            placeholder="Upload PAN"
            accept={['pdf', 'jpg', 'png', 'jpeg']}
            maxSize={15 * 1024 * 1024}
            docType={DOC_TYPES.PAN}
            initialFile={doctorForm.panFile}
            onFileUpload={(file) => handleFileUpload('pan', file)}
            onFileDelete={() => handleFileDelete('pan')}
            errorMessage={doctorErrors.panFile}
            onOcrDataExtracted={(ocrData) => {
              console.log('PAN OCR Data:', ocrData);
              if (ocrData.panNumber) {
                setDoctorForm(prev => ({ ...prev, panNumber: ocrData.panNumber }));
                setVerificationStatus(prev => ({ ...prev, pan: true }));
              }
            }}
          />
          {doctorErrors.panFile && (
            <AppText style={styles.errorText}>{doctorErrors.panFile}</AppText>
          )}
          
          <CustomInput
            placeholder="PAN number"
            value={doctorForm.panNumber}
            onChangeText={(text) => {
              const upperText = text.toUpperCase();
              setDoctorForm(prev => ({ ...prev, panNumber: upperText }));
              if (doctorErrors.panNumber) {
                setDoctorErrors(prev => ({ ...prev, panNumber: null }));
              }
            }}
            maxLength={10}
            autoCapitalize="characters"
            mandatory={true}
            error={doctorErrors.panNumber}
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
                    if (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(doctorForm.panNumber)) {
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

          {/* GST */}
          <AppText style={styles.modalFieldLabel}>Upload GST <AppText style={styles.mandatory}>*</AppText></AppText>
          <FileUploadComponent
            placeholder="Upload GST"
            accept={['pdf', 'jpg', 'png', 'jpeg']}
            maxSize={15 * 1024 * 1024}
            docType={DOC_TYPES.GST}
            initialFile={doctorForm.gstFile}
            onFileUpload={(file) => handleFileUpload('gst', file)}
            onFileDelete={() => handleFileDelete('gst')}
            errorMessage={doctorErrors.gstFile}
            onOcrDataExtracted={(ocrData) => {
              console.log('GST OCR Data:', ocrData);
              if (ocrData.gstNumber) {
                setDoctorForm(prev => ({ ...prev, gstNumber: ocrData.gstNumber }));
              }
            }}
          />
          {doctorErrors.gstFile && (
            <AppText style={styles.errorText}>{doctorErrors.gstFile}</AppText>
          )}
          
          <AppInput
            style={[styles.modalInput, { marginBottom: doctorErrors.gstNumber ? 5 : 10 }, doctorErrors.gstNumber && styles.inputError]}
            placeholder="GST number *"
            placeholderTextColor="#999"
            maxLength={15}
            autoCapitalize="characters"
            value={doctorForm.gstNumber}
            onChangeText={(text) => {
              setDoctorForm(prev => ({ ...prev, gstNumber: text.toUpperCase() }));
              if (doctorErrors.gstNumber) {
                setDoctorErrors(prev => ({ ...prev, gstNumber: null }));
              }
            }}
          />
          {doctorErrors.gstNumber && (
            <AppText style={styles.errorText}>{doctorErrors.gstNumber}</AppText>
          )}

          {/* Mapping Section */}
          <AppText style={styles.modalSectionLabel}>Mapping</AppText>
          <AppText style={styles.modalFieldLabel}>Only Wholesaler</AppText>
          <View style={[styles.mappingPharmacyBox, { marginBottom: 20 }]}>
            <AppText style={styles.mappingPharmacyText}>{pharmacyName || 'Pharmacy name will appear here'}</AppText>
          </View>

          {/* Action Buttons */}
          <View style={styles.modalActionButtons}>
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <AppText style={styles.submitButtonText}>Submit</AppText>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleClose}
            >
              <AppText style={styles.cancelButtonText}>Cancel</AppText>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* State Selection Modal */}
        <Modal
          visible={showStateModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowStateModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.dropdownModal}>
              <View style={styles.dropdownModalHeader}>
                <AppText style={styles.dropdownModalTitle}>Select State</AppText>
                <TouchableOpacity onPress={() => setShowStateModal(false)}>
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              {loadingStates ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
              ) : (
                <FlatList
                  data={states}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownModalItem}
                      onPress={() => {
                        setDoctorForm(prev => ({
                          ...prev,
                          state: item.name,
                          stateId: item.id,
                        }));
                        setShowStateModal(false);
                      }}
                    >
                      <AppText style={styles.dropdownModalItemText}>{item.name}</AppText>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </View>
        </Modal>

        {/* City Selection Modal */}
        <Modal
          visible={showCityModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCityModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.dropdownModal}>
              <View style={styles.dropdownModalHeader}>
                <AppText style={styles.dropdownModalTitle}>Select City</AppText>
                <TouchableOpacity onPress={() => setShowCityModal(false)}>
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              {loadingCities ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
              ) : (
                <FlatList
                  data={cities}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownModalItem}
                      onPress={() => {
                        setDoctorForm(prev => ({
                          ...prev,
                          city: item.name,
                          cityId: item.id,
                        }));
                        setShowCityModal(false);
                      }}
                    >
                      <AppText style={styles.dropdownModalItemText}>{item.name}</AppText>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </View>
        </Modal>

        {/* Area Selection Modal */}
        <Modal
          visible={showAreaModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowAreaModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.dropdownModal}>
              <View style={styles.dropdownModalHeader}>
                <AppText style={styles.dropdownModalTitle}>Select Area</AppText>
                <TouchableOpacity onPress={() => setShowAreaModal(false)}>
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              {loadingAreas ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
              ) : (
                <FlatList
                  data={areas}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownModalItem}
                      onPress={() => {
                        setDoctorForm(prev => ({
                          ...prev,
                          area: item.name,
                          areaId: item.id,
                        }));
                        setShowAreaModal(false);
                      }}
                    >
                      <AppText style={styles.dropdownModalItemText}>{item.name}</AppText>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContent: {
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  closeButton: {
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  modalSectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 12,
    paddingLeft: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF8C42',
    marginLeft: -16,
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
  radioGroup: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
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
  radioCircleSelected: {
    backgroundColor: colors.primary,
  },
  radioLabel: {
    fontSize: 13,
    color: '#333',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginBottom: 6,
    marginTop: 4,
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 0,
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
  inputError: {
    borderColor: colors.error,
    borderWidth: 1.5,
  },
  errorText: {
    fontSize: 11,
    color: colors.error,
    marginTop: -5,
    marginBottom: 10,
    marginLeft: 4,
  },
  dropdownPlaceholder: {
    fontSize: 13,
    color: '#999',
  },
  dropdown: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.loginInputBorderColor,
    backgroundColor: '#FAFAFA',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  dropdownModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  dropdownModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownModalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dropdownModalItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownModalItemText: {
    fontSize: 14,
    color: '#333',
  },
  inputWithButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.loginInputBorderColor,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  countryCode: {
    fontSize: 13,
    color: '#333',
    marginRight: 8,
    fontWeight: '500',
  },
  inputField: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: '#333',
  },
  inlineVerifyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 4,
    marginLeft: 8,
  },
  inlineVerifyText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  doctorBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CCC',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorBoxText: {
    fontSize: 13,
    color: '#999',
  },
  mappingPharmacyBox: {
    padding: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.loginInputBorderColor,
    backgroundColor: '#F5F5F5',
    minHeight: 50,
  },
  mappingPharmacyText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '400',
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
  otpContainer: {
    marginVertical: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  otpTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  otpInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    backgroundColor: '#FFF',
  },
  otpFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  otpTimer: {
    fontSize: 12,
    color: '#999',
  },
  resendText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  inputWithButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.loginInputBorderColor,
    borderRadius: 6,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 12,
    marginBottom: 10,
    gap: 8,
  },
  countryCode: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  inputField: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: '#333',
  },
  inlineVerifyButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedButton: {
    backgroundColor: '#10B981',
  },
  inlineVerifyText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  verifiedText: {
    color: '#fff',
  },
  floatingLabel: {
    position: 'absolute',
    top: 4,
    left: 0,
    fontSize: 10,
    color: '#999',
    fontWeight: '500',
  },
  dropdownText: {
    fontSize: 13,
    color: '#333',
    paddingTop: 8,
  },
});

export default AddNewDoctorModal;
