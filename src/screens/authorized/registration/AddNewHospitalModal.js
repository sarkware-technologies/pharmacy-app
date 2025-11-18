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
import {AppText,AppInput} from "../../../components"

const DOC_TYPES = {
  REGISTRATION_CERTIFICATE: 8,
  HOSPITAL_IMAGE: 1,
  PAN: 7,
  GST: 8,
};


const AddNewHospitalModal = ({ visible, onClose, onSubmit, onAdd, typeId, categoryId, subCategoryId }) => {
  const [hospitalForm, setHospitalForm] = useState({
    licenseType: 'Individual Hospital',
    registrationCertificate: '',
    registrationNumber: '',
    registrationDate: '',
    image: null,
    hospitalName: '',
    shortName: '',
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
    mobileNumber: '',
    emailAddress: '',
    panFile: null,
    panNumber: '',
    gstFile: null,
    gstNumber: '',
    isBuyer: true,
    selectedDoctors: [],
  });

  const [verificationStatus, setVerificationStatus] = useState({
    mobile: false,
    email: false,
  });

  // Date picker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [hospitalErrors, setHospitalErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Document IDs for uploaded files
  const [documentIds, setDocumentIds] = useState({});
  
  // Uploaded documents with full details including docTypeId
  const [uploadedDocs, setUploadedDocs] = useState([]);
  
  // API Data
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  
  // Modals for dropdowns
  const [showStateModal, setShowStateModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);

  // OTP states
  const [showOTP, setShowOTP] = useState({ mobile: false, email: false });
  const [otpValues, setOtpValues] = useState({ mobile: ['', '', '', ''], email: ['', '', '', ''] });
  const [otpTimers, setOtpTimers] = useState({ mobile: 30, email: 30 });
  const [loadingOtp, setLoadingOtp] = useState({ mobile: false, email: false });
  const otpRefs = useRef({});

  

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

  const loadInitialData = async () => {
    // Load states on mount
    await loadStates();
    // Load all cities on mount (independent of state)
    await loadCities();
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadStates = async () => {
    try {
      setLoadingStates(true);
      const statesResponse = await customerAPI.getStates();
      if (statesResponse.success && statesResponse.data) {
        const _states = statesResponse.data.states.map(state => ({
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

  const loadCities = async (stateId = null) => {
    setLoadingCities(true);
    try {
      console.log('Loading cities for stateId:', stateId);
      const response = await customerAPI.getCities(stateId);
      console.log('Cities API response:', response);
      
      if (response.success && response.data) {
        const _cities = response.data.cities.map(city => {
          console.log('City object:', city);
          return {
            id: city.id,
            name: city.cityName
          };
        });
        console.log('Mapped cities:', _cities);
        setCities(_cities || []);
      } else {
        console.warn('Response not successful or no data:', response);
        setCities([]);
      }
    } catch (error) {
      console.error('Error loading cities:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load cities',
      });
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  const resetForm = () => {
    setHospitalForm({
      licenseType: 'Individual Hospital',
      registrationCertificate: '',
      registrationNumber: '',
      registrationDate: '',
      image: null,
      hospitalName: '',
      shortName: '',
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
      mobileNumber: '',
      emailAddress: 'sddivya123@gmail.com',
      panFile: null,
      panNumber: '',
      gstFile: null,
      gstNumber: '',
    });
    setHospitalErrors({});
    setCities([]);
    setDocumentIds({});
    setUploadedDocs([]);
    setVerificationStatus({ mobile: false, email: false });
    setSelectedDate(new Date());
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toLocaleDateString('en-IN');
      setHospitalForm(prev => ({ ...prev, registrationDate: formattedDate }));
    }
  };

  const handleVerify = async (field) => {
    // Validate the field before showing OTP
    if (field === 'mobile' && (!hospitalForm.mobileNumber || hospitalForm.mobileNumber.length !== 10)) {
      setHospitalErrors(prev => ({ ...prev, mobileNumber: 'Please enter valid 10-digit mobile number' }));
      return;
    }
    if (field === 'email' && (!hospitalForm.emailAddress || !hospitalForm.emailAddress.includes('@'))) {
      setHospitalErrors(prev => ({ ...prev, emailAddress: 'Please enter valid email address' }));
      return;
    }

    setLoadingOtp(prev => ({ ...prev, [field]: true }));
    try {
      // Reset OTP state before generating new OTP
      setOtpValues(prev => ({ ...prev, [field]: ['', '', '', ''] }));
      setOtpTimers(prev => ({ ...prev, [field]: 30 }));

      const requestData = {
        [field === 'mobile' ? 'mobile' : 'email']: 
          field === 'mobile' ? hospitalForm.mobileNumber : hospitalForm.emailAddress
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
          field === 'mobile' ? hospitalForm.mobileNumber : hospitalForm.emailAddress
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
    setHospitalForm(prev => ({ ...prev, [`${field}File`]: file }));
    setHospitalErrors(prev => ({ ...prev, [`${field}File`]: null }));
  };

  const handleFileDelete = (field) => {
    const file = hospitalForm[`${field}File`];
    if (file && file.id) {
      setUploadedDocs(prev => prev.filter(doc => doc.id !== file.id));
    }
    setDocumentIds(prev => ({ ...prev, [field]: null }));
    setHospitalForm(prev => ({ ...prev, [`${field}File`]: null }));
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    // Validate mandatory fields
    const newErrors = {};
    
    // License Type validation
    if (!hospitalForm.licenseType) {
      newErrors.licenseType = 'License type is required';
    }
    
    // Registration Certificate validation
    if (!hospitalForm.registrationCertificate && !documentIds.registrationCertificate) {
      newErrors.registrationCertificate = 'Registration certificate is required';
    }
    
    // Registration Number validation
    if (!hospitalForm.registrationNumber || hospitalForm.registrationNumber.trim() === '') {
      newErrors.registrationNumber = 'Registration number is required';
    }
    
    // Registration Date validation
    if (!hospitalForm.registrationDate || hospitalForm.registrationDate.trim() === '') {
      newErrors.registrationDate = 'Registration date is required';
    }
    
    // Hospital Image validation
    if (!hospitalForm.image && !documentIds.image) {
      newErrors.image = 'Hospital image is required';
    }
    
    // Hospital Name validation
    if (!hospitalForm.hospitalName || hospitalForm.hospitalName.trim() === '') {
      newErrors.hospitalName = 'Hospital name is required';
    } else if (hospitalForm.hospitalName.trim().length < 3) {
      newErrors.hospitalName = 'Hospital name must be at least 3 characters';
    }
    
    // Address 1 validation
    if (!hospitalForm.address1 || hospitalForm.address1.trim() === '') {
      newErrors.address1 = 'Address 1 is required';
    }
    
    // Pincode validation
    if (!hospitalForm.pincode || hospitalForm.pincode.trim() === '') {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(hospitalForm.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }
    
    // Area validation
    if (!hospitalForm.area || hospitalForm.area.trim() === '') {
      newErrors.area = 'Area is required';
    }
    
    // City validation
    if (!hospitalForm.city || !hospitalForm.cityId) {
      newErrors.city = 'City is required';
    }
    
    // State validation
    if (!hospitalForm.state || !hospitalForm.stateId) {
      newErrors.state = 'State is required';
    }
    
    // Mobile Number validation
    if (!hospitalForm.mobileNumber || hospitalForm.mobileNumber.trim() === '') {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(hospitalForm.mobileNumber)) {
      newErrors.mobileNumber = 'Mobile number must be 10 digits';
    } else if (!verificationStatus.mobile) {
      newErrors.mobileVerification = 'Please verify mobile number';
    }
    
    // Email Address validation
    if (!hospitalForm.emailAddress || hospitalForm.emailAddress.trim() === '') {
      newErrors.emailAddress = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(hospitalForm.emailAddress)) {
      newErrors.emailAddress = 'Please enter a valid email address';
    } else if (!verificationStatus.email) {
      newErrors.emailVerification = 'Please verify email address';
    }
    
    // PAN validation
    if (!hospitalForm.panFile && !documentIds.pan) {
      newErrors.panFile = 'PAN document is required';
    }
    if (!hospitalForm.panNumber || hospitalForm.panNumber.trim() === '') {
      newErrors.panNumber = 'PAN number is required';
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(hospitalForm.panNumber)) {
      newErrors.panNumber = 'Invalid PAN format (e.g., ABCDE1234F)';
    }
    
    // GST validation
    if (!hospitalForm.gstFile && !documentIds.gst) {
      newErrors.gstFile = 'GST document is required';
    }
    if (!hospitalForm.gstNumber || hospitalForm.gstNumber.trim() === '') {
      newErrors.gstNumber = 'GST number is required';
    } else if (!/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(hospitalForm.gstNumber)) {
      newErrors.gstNumber = 'Invalid GST format';
    }

    if (Object.keys(newErrors).length > 0) {
      setHospitalErrors(newErrors);
      
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

    setLoading(true);

    try {
      // Determine subCategoryId based on license type
      const subCatId = hospitalForm.licenseType === 'Clinic' ? 3 : 1;

      // Prepare registration payload matching the API structure
      const registrationData = {
        typeId: typeId || 2,
        categoryId: categoryId || 4,
        subCategoryId: subCategoryId || subCatId,
        isMobileVerified: verificationStatus.mobile,
        isEmailVerified: verificationStatus.email,
        isExisting: false,
        licenceDetails: {
          registrationDate: new Date().toISOString(),
          licence: [
            {
              licenceTypeId: 7,
              licenceNo: hospitalForm.registrationNumber,
              licenceValidUpto: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
            }
          ]
        },
        customerDocs: uploadedDocs,
        isBuyer: Boolean(hospitalForm.isBuyer),
        customerGroupId: 1,
        generalDetails: {
          name: hospitalForm.hospitalName,
          shortName: hospitalForm.shortName || '',
          address1: hospitalForm.address1,
          address2: hospitalForm.address2 || '',
          address3: hospitalForm.address3 || '',
          address4: hospitalForm.address4 || '',
          pincode: parseInt(hospitalForm.pincode),
          area: hospitalForm.area || 'Default',
          cityId: parseInt(hospitalForm.cityId),
          stateId: parseInt(hospitalForm.stateId),
          ownerName: '',
          clinicName: '',
          specialist: '',
        },
        securityDetails: {
          mobile: hospitalForm.mobileNumber,
          email: hospitalForm.emailAddress,
          panNumber: hospitalForm.panNumber,
          gstNumber: hospitalForm.gstNumber,
        },
        suggestedDistributors: [
          {
            distributorCode: '',
            distributorName: '',
            city: ''
          }
        ]
      };

      console.log('Hospital registration payload:', registrationData);

      const response = await customerAPI.createCustomer(registrationData);
      
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Hospital Added',
          text2: response.message || 'Hospital registered successfully',
        });

        // Pass the created hospital data back to parent
        const newHospital = {
          id: response.data?.id || Date.now(),
          name: hospitalForm.hospitalName,
          code: response.data?.code || hospitalForm.shortName,
          ...hospitalForm,
          customerId: response.data?.id,
        };

        // Call onAdd callback if provided (for PharmacyWholesaler integration)
        if (onAdd) {
          onAdd(newHospital);
        } else if (onSubmit) {
          onSubmit(newHospital);
        }

        // Reset and close
        resetForm();
        onClose();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: response.details || 'Failed to register hospital. Please try again.',
        });
      }
    } catch (error) {
      console.error('Hospital registration error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An error occurred while registering the hospital. Please try again.',
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
            <AppText style={styles.modalTitle}>Add Hospital Account</AppText>
            <TouchableOpacity onPress={handleClose}>
              <AppText style={styles.modalCloseButton}>✕</AppText>
            </TouchableOpacity>
          </View>

          {/* License Details */}
          <AppText style={styles.modalSectionLabel}>Licence Details <AppText style={styles.mandatory}>*</AppText></AppText>
          <View style={styles.radioGroup}>
            <TouchableOpacity 
              style={styles.radioOption}
              onPress={() => setHospitalForm(prev => ({ ...prev, licenseType: 'Clinic' }))}
            >
              <View style={[styles.radioCircle, hospitalForm.licenseType === 'Clinic' && styles.radioCircleSelected]} />
              <AppText style={styles.radioLabel}>Clinic</AppText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.radioOption}
              onPress={() => setHospitalForm(prev => ({ ...prev, licenseType: 'Individual Hospital' }))}
            >
              <View style={[styles.radioCircle, hospitalForm.licenseType === 'Individual Hospital' && styles.radioCircleSelected]} />
              <AppText style={styles.radioLabel}>Individual Hospital</AppText>
            </TouchableOpacity>
          </View>

          {/* Registration Certificate */}
          <AppText style={styles.modalFieldLabel}>Registration Certificate <AppText style={styles.mandatory}>*</AppText></AppText>
          <FileUploadComponent
            placeholder="Upload registration certificate"
            accept={['pdf', 'jpg', 'png']}
            maxSize={10 * 1024 * 1024}
            docType={DOC_TYPES.REGISTRATION_CERTIFICATE}
            initialFile={hospitalForm.registrationCertificate}
            onFileUpload={(file) => handleFileUpload('registrationCertificate', file)}
            onFileDelete={() => handleFileDelete('registrationCertificate')}
            errorMessage={hospitalErrors.registrationCertificateFile}
          />
          {hospitalErrors.registrationCertificate && (
            <AppText style={styles.errorText}>{hospitalErrors.registrationCertificate}</AppText>
          )}
          <AppInput
            style={[styles.modalInput, { marginBottom: hospitalErrors.registrationNumber ? 5 : 10 }, hospitalErrors.registrationNumber && styles.inputError]}
            placeholder="Registration Number *"
            placeholderTextColor="#999"
            value={hospitalForm.registrationNumber}
            onChangeText={(text) => {
              setHospitalForm(prev => ({ ...prev, registrationNumber: text }));
              if (hospitalErrors.registrationNumber) {
                setHospitalErrors(prev => ({ ...prev, registrationNumber: null }));
              }
            }}
          />
          {hospitalErrors.registrationNumber && (
            <AppText style={styles.errorText}>{hospitalErrors.registrationNumber}</AppText>
          )}
          <TouchableOpacity 
            style={[styles.modalInput, { marginBottom: hospitalErrors.registrationDate ? 5 : 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, hospitalErrors.registrationDate && styles.inputError]}
            onPress={() => setShowDatePicker(true)}
          >
            <AppText style={[styles.dropdownPlaceholder, hospitalForm.registrationDate && { color: '#333' }]}>
              {hospitalForm.registrationDate || 'Registration date *'}
            </AppText>
            <Icon name="calendar-today" size={20} color="#999" />
          </TouchableOpacity>
          {hospitalErrors.registrationDate && (
            <AppText style={styles.errorText}>{hospitalErrors.registrationDate}</AppText>
          )}
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          {/* Image */}
          <AppText style={styles.modalFieldLabel}>Image <AppText style={styles.mandatory}>*</AppText></AppText>
          <FileUploadComponent
            placeholder="Upload Hospital Image"
            accept={['jpg', 'png', 'jpeg']}
            maxSize={10 * 1024 * 1024}
            docType={DOC_TYPES.HOSPITAL_IMAGE}
            initialFile={hospitalForm.image}
            onFileUpload={(file) => handleFileUpload('image', file)}
            onFileDelete={() => handleFileDelete('image')}
            errorMessage={hospitalErrors.imageFile}
          />
          {hospitalErrors.image && (
            <AppText style={styles.errorText}>{hospitalErrors.image}</AppText>
          )}

          {/* General Details */}
          <AppText style={styles.modalSectionLabel}>General Details <AppText style={styles.mandatory}>*</AppText></AppText>
          <AppInput
            style={[styles.modalInput, { marginBottom: hospitalErrors.hospitalName ? 5 : 10 }, hospitalErrors.hospitalName && styles.inputError]}
            placeholder="Enter hospital name *"
            placeholderTextColor="#999"
            value={hospitalForm.hospitalName}
            onChangeText={(text) => {
              setHospitalForm(prev => ({ ...prev, hospitalName: text }));
              if (hospitalErrors.hospitalName) {
                setHospitalErrors(prev => ({ ...prev, hospitalName: null }));
              }
            }}
          />
          {hospitalErrors.hospitalName && (
            <AppText style={styles.errorText}>{hospitalErrors.hospitalName}</AppText>
          )}

          <AppInput
            style={[styles.modalInput, { marginBottom: 10 }]}
            placeholder="Enter short name"
            placeholderTextColor="#999"
            value={hospitalForm.shortName}
            onChangeText={(text) => setHospitalForm(prev => ({ ...prev, shortName: text }))}
          />

          <AppInput
            style={[styles.modalInput, { marginBottom: hospitalErrors.address1 ? 5 : 10 }, hospitalErrors.address1 && styles.inputError]}
            placeholder="Address 1 *"
            placeholderTextColor="#999"
            value={hospitalForm.address1}
            onChangeText={(text) => {
              setHospitalForm(prev => ({ ...prev, address1: text }));
              if (hospitalErrors.address1) {
                setHospitalErrors(prev => ({ ...prev, address1: null }));
              }
            }}
          />
          {hospitalErrors.address1 && (
            <AppText style={styles.errorText}>{hospitalErrors.address1}</AppText>
          )}

          <AppInput
            style={[styles.modalInput, { marginBottom: 10 }]}
            placeholder="Address 2"
            placeholderTextColor="#999"
            value={hospitalForm.address2}
            onChangeText={(text) => setHospitalForm(prev => ({ ...prev, address2: text }))}
          />

          <AppInput
            style={[styles.modalInput, { marginBottom: 10 }]}
            placeholder="Address 3"
            placeholderTextColor="#999"
            value={hospitalForm.address3}
            onChangeText={(text) => setHospitalForm(prev => ({ ...prev, address3: text }))}
          />

          <AppInput
            style={[styles.modalInput, { marginBottom: 10 }]}
            placeholder="Address 4"
            placeholderTextColor="#999"
            value={hospitalForm.address4}
            onChangeText={(text) => setHospitalForm(prev => ({ ...prev, address4: text }))}
          />

          <AppInput
            style={[styles.modalInput, { marginBottom: hospitalErrors.pincode ? 5 : 10 }, hospitalErrors.pincode && styles.inputError]}
            placeholder="Pincode *"
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={6}
            value={hospitalForm.pincode}
            onChangeText={(text) => {
              if (/^\d{0,6}$/.test(text)) {
                setHospitalForm(prev => ({ ...prev, pincode: text }));
                if (hospitalErrors.pincode) {
                  setHospitalErrors(prev => ({ ...prev, pincode: null }));
                }
              }
            }}
          />
          {hospitalErrors.pincode && (
            <AppText style={styles.errorText}>{hospitalErrors.pincode}</AppText>
          )}

          <AppInput
            style={[styles.modalInput, { marginBottom: hospitalErrors.area ? 5 : 10 }, hospitalErrors.area && styles.inputError]}
            placeholder="Enter Area *"
            placeholderTextColor="#999"
            value={hospitalForm.area}
            onChangeText={(text) => {
              setHospitalForm(prev => ({ ...prev, area: text }));
              setHospitalErrors(prev => ({ ...prev, area: null }));
            }}
          />
          {hospitalErrors.area && (
            <AppText style={styles.errorText}>{hospitalErrors.area}</AppText>
          )}

          <TouchableOpacity 
            style={[styles.dropdown, { marginBottom: hospitalErrors.city ? 5 : 10 }, hospitalErrors.city && styles.inputError]}
            onPress={() => setShowCityModal(true)}
          >
            <AppText style={[styles.dropdownPlaceholder, hospitalForm.city && { color: '#333' }]}>
              {hospitalForm.city || 'City *'}
            </AppText>
            <Icon name="arrow-drop-down" size={24} color="#999" />
          </TouchableOpacity>
          {hospitalErrors.city && (
            <AppText style={styles.errorText}>{hospitalErrors.city}</AppText>
          )}

          <TouchableOpacity 
            style={[styles.dropdown, { marginBottom: hospitalErrors.state ? 5 : 10 }, hospitalErrors.state && styles.inputError]}
            onPress={() => setShowStateModal(true)}
          >
            <AppText style={[styles.dropdownPlaceholder, hospitalForm.state && { color: '#333' }]}>
              {hospitalForm.state || 'State *'}
            </AppText>
            <Icon name="arrow-drop-down" size={24} color="#999" />
          </TouchableOpacity>
          {hospitalErrors.state && (
            <AppText style={styles.errorText}>{hospitalErrors.state}</AppText>
          )}

          {/* Security Details */}
          <AppText style={styles.modalSectionLabel}>Security Details <AppText style={styles.mandatory}>*</AppText></AppText>
          <AppText style={styles.modalFieldLabel}>Mobile number <AppText style={styles.mandatory}>*</AppText></AppText>
          <View style={[styles.inputWithButton, hospitalErrors.mobileNumber && styles.inputError]}>
            <AppInput
              style={styles.inputField}
              placeholder="Mobile number*"
              value={hospitalForm.mobileNumber}
              onChangeText={(text) => {
                if (/^\d{0,10}$/.test(text)) {
                  setHospitalForm(prev => ({ ...prev, mobileNumber: text }));
                  if (hospitalErrors.mobileNumber) {
                    setHospitalErrors(prev => ({ ...prev, mobileNumber: null, mobileVerification: null }));
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
                verificationStatus.mobile && styles.verifiedButton,
              ]}
              onPress={() => !verificationStatus.mobile && handleVerify('mobile')}
              disabled={verificationStatus.mobile || loadingOtp.mobile}
            >
              {loadingOtp.mobile && !verificationStatus.mobile ? (
                <ActivityIndicator size="small" color="#007AFF" />
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
          {(hospitalErrors.mobileNumber || hospitalErrors.mobileVerification) && (
            <AppText style={styles.errorText}>{hospitalErrors.mobileNumber || hospitalErrors.mobileVerification}</AppText>
          )}
          {renderOTPInput('mobile')}

          <AppText style={styles.modalFieldLabel}>Email address <AppText style={styles.mandatory}>*</AppText></AppText>
          <View style={[styles.inputWithButton, hospitalErrors.emailAddress && styles.inputError]}>
            <AppInput
              style={[styles.inputField, { flex: 1 }]}
              placeholder="Email Address"
              value={hospitalForm.emailAddress}
              onChangeText={(text) => {
                setHospitalForm(prev => ({ ...prev, emailAddress: text }));
                if (hospitalErrors.emailAddress) {
                  setHospitalErrors(prev => ({ ...prev, emailAddress: null, emailVerification: null }));
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
                verificationStatus.email && styles.verifiedButton,
              ]}
              onPress={() => !verificationStatus.email && handleVerify('email')}
              disabled={verificationStatus.email || loadingOtp.email}
            >
              {loadingOtp.email && !verificationStatus.email ? (
                <ActivityIndicator size="small" color="#007AFF" />
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
          {(hospitalErrors.emailAddress || hospitalErrors.emailVerification) && (
            <AppText style={styles.errorText}>{hospitalErrors.emailAddress || hospitalErrors.emailVerification}</AppText>
          )}
          {renderOTPInput('email')}

          <AppText style={styles.modalFieldLabel}>Upload PAN <AppText style={styles.mandatory}>*</AppText></AppText>
          <FileUploadComponent
            placeholder="Upload PAN"
            accept={['pdf', 'jpg', 'png']}
            maxSize={10 * 1024 * 1024}
            docType={DOC_TYPES.PAN}
            initialFile={hospitalForm.panFile}
            onFileUpload={(file) => handleFileUpload('pan', file)}
            onFileDelete={() => handleFileDelete('pan')}
            errorMessage={hospitalErrors.panFile}
          />
          {hospitalErrors.panFile && (
            <AppText style={styles.errorText}>{hospitalErrors.panFile}</AppText>
          )}
          <AppInput
            style={[styles.modalInput, { marginBottom: hospitalErrors.panNumber ? 5 : 10 }, hospitalErrors.panNumber && styles.inputError]}
            placeholder="PAN number *"
            placeholderTextColor="#999"
            maxLength={10}
            autoCapitalize="characters"
            value={hospitalForm.panNumber}
            onChangeText={(text) => {
              setHospitalForm(prev => ({ ...prev, panNumber: text.toUpperCase() }));
              if (hospitalErrors.panNumber) {
                setHospitalErrors(prev => ({ ...prev, panNumber: null }));
              }
            }}
          />
          {hospitalErrors.panNumber && (
            <AppText style={styles.errorText}>{hospitalErrors.panNumber}</AppText>
          )}

          <AppText style={styles.modalFieldLabel}>Upload GST <AppText style={styles.mandatory}>*</AppText></AppText>
          <FileUploadComponent
            placeholder="Upload GST"
            accept={['pdf', 'jpg', 'png']}
            maxSize={10 * 1024 * 1024}
            docType={DOC_TYPES.GST}
            initialFile={hospitalForm.gstFile}
            onFileUpload={(file) => handleFileUpload('gst', file)}
            onFileDelete={() => handleFileDelete('gst')}
            errorMessage={hospitalErrors.gstFile}
          />
          {hospitalErrors.gstFile && (
            <AppText style={styles.errorText}>{hospitalErrors.gstFile}</AppText>
          )}
          <AppInput
            style={[styles.modalInput, { marginBottom: hospitalErrors.gstNumber ? 5 : 10 }, hospitalErrors.gstNumber && styles.inputError]}
            placeholder="GST number *"
            placeholderTextColor="#999"
            maxLength={15}
            autoCapitalize="characters"
            value={hospitalForm.gstNumber}
            onChangeText={(text) => {
              setHospitalForm(prev => ({ ...prev, gstNumber: text.toUpperCase() }));
              if (hospitalErrors.gstNumber) {
                setHospitalErrors(prev => ({ ...prev, gstNumber: null }));
              }
            }}
          />
          {hospitalErrors.gstNumber && (
            <AppText style={styles.errorText}>{hospitalErrors.gstNumber}</AppText>
          )}

          {/* Mapping Section */}
          <AppText style={styles.modalSectionLabel}>Mapping</AppText>
          <AppText style={styles.modalFieldLabel}>Doctor</AppText>
          <View style={[styles.doctorBox, { marginBottom: 20 }]}>
            <AppText style={styles.doctorBoxText}>Doctors will appear here after adding</AppText>
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
                        setHospitalForm(prev => ({
                          ...prev,
                          state: item.name,
                          stateId: item.id,
                          // Don't reset city and area - allow independent selection
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
                        setHospitalForm(prev => ({
                          ...prev,
                          city: item.name,
                          cityId: item.id,
                          // Don't reset area - allow independent selection
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
  dropdownPlaceholder: {
    fontSize: 13,
    color: '#999',
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
    borderWidth: 1,
    borderColor: colors.primary,
    marginLeft: 8,
  },
  verifiedButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  inlineVerifyText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  verifiedText: {
    color: '#fff',
  },
  otpNote: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  fileUploadRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  doctorBox: {
    padding: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.loginInputBorderColor,
    borderStyle: 'dashed',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  doctorBoxText: {
    fontSize: 13,
    color: '#999',
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
});

export default AddNewHospitalModal;
