/* eslint-disable no-dupe-keys */
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
import CustomInput from '../../../components/CustomInput';
import { AppText, AppInput } from "../../../components"
import Calendar from '../../../components/icons/Calendar';

const DOC_TYPES = {
  REGISTRATION_CERTIFICATE: 8,
  HOSPITAL_IMAGE: 1,
  PAN: 7,
  GST: 8,
};


const AddNewHospitalModal = ({ visible, onClose, onSubmit, onAdd, typeId, categoryId, subCategoryId, pharmacyName }) => {
  const [hospitalForm, setHospitalForm] = useState({
    category: 'Private',
    subCategory: 'Individual Hospital',
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
    stockistName: '',
    stockistCode: '',
    stockistCity: '',
  });

  const [verificationStatus, setVerificationStatus] = useState({
    mobile: false,
    email: false,
    pan: false,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        position: 'top',
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
        position: 'top',
      });
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };


  const openDatePicker = field => {
    // setSelectedDateField(field);
    setShowDatePicker(prev => ({ ...prev, [field]: true }));
  };

  const resetForm = () => {
    setHospitalForm({
      category: 'Private',
      subCategory: 'Individual Hospital',
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
      stockistName: '',
      stockistCode: '',
      stockistCity: '',
    });
    setHospitalErrors({});
    setCities([]);
    setDocumentIds({});
    setUploadedDocs([]);
    setVerificationStatus({ mobile: false, email: false, pan: false });
    setSelectedDate(new Date());
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toLocaleDateString('en-IN');
      setHospitalForm(prev => ({ ...prev, registrationDate: formattedDate }));
      setHospitalErrors(prev => ({ ...prev, registrationDate: null }));
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
          position: 'top',
        });

        setHospitalErrors(prev => ({
          ...prev,
          [`${field}Verification`]: null,
        }));

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
        text2: error.response?.data?.message || error.message || 'Failed to send OTP. Please try again.',
        position: 'top',
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
          text2: response.message || 'Please enter the correct OTP',
          position: 'top',
        });
      }
    } catch (error) {
      console.error('OTP validation error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || error.message || 'Failed to validate OTP. Please try again.',
        position: 'top',
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


    // Address 2 validation
    if (!hospitalForm.address2 || hospitalForm.address2.trim() === '') {
      newErrors.address2 = 'Address 2 is required';
    }



    // Address 3 validation
    if (!hospitalForm.address3 || hospitalForm.address3.trim() === '') {
      newErrors.address3 = 'Address 3 is required';
    }

    // Pincode validation
    if (!hospitalForm.pincode || hospitalForm.pincode.trim() === '') {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^[1-9]\d{5}$/.test(hospitalForm.pincode)) {
      newErrors.pincode = 'Valid 6-digit pincode is required';
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



    if (hospitalForm.gstNumber.trim() !== '' &&
      !/^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/.test(hospitalForm.gstNumber)) {
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
      // Determine subCategoryId based on sub category
      const subCatId = hospitalForm.subCategory === 'Clinic' ? 3 : 1;

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
          ...(hospitalForm.gstNumber ? { gstNumber: hospitalForm.gstNumber } : {}),
        },
        suggestedDistributors: hospitalForm.stockistName || hospitalForm.stockistCode || hospitalForm.stockistCity ? [
          {
            distributorCode: hospitalForm.stockistCode || '',
            distributorName: hospitalForm.stockistName || '',
            city: hospitalForm.stockistCity || ''
          }
        ] : []
      };

      console.log('Hospital registration payload:', registrationData);

      const response = await customerAPI.createCustomer(registrationData);

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Hospital Added',
          text2: response.message || 'Hospital registered successfully',
          position: 'top',
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
          position: 'top',
        });
      }
    } catch (error) {
      console.error('Hospital registration error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An error occurred while registering the hospital. Please try again.',
        position: 'top',
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

        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Icon name="close" size={20} color="#666" />
          </TouchableOpacity>
          <AppText style={styles.modalTitle}>Add Hospital account</AppText>
        </View>
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>

          {/* Category Section */}
          <AppText style={styles.categoryLabel}>Category <AppText style={styles.categoryPlaceholder}>(Select Any One)</AppText></AppText>
          <View style={styles.radioGroupHorizontal}>
            <TouchableOpacity
              style={styles.radioOptionHorizontal}
              onPress={() => setHospitalForm(prev => ({ ...prev, category: 'Private' }))}
            >
              <View style={[styles.radioCircle, hospitalForm.category === 'Private' && styles.radioCircleSelected]}>
                {hospitalForm.category === 'Private' && <View style={styles.radioInner} />}
              </View>
              <AppText style={styles.radioLabel}>Private</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioOptionHorizontal}
              onPress={() => setHospitalForm(prev => ({ ...prev, category: 'Govt' }))}
            >
              <View style={[styles.radioCircle, hospitalForm.category === 'Govt' && styles.radioCircleSelected]}>
                {hospitalForm.category === 'Govt' && <View style={styles.radioInner} />}
              </View>
              <AppText style={styles.radioLabel}>Govt</AppText>
            </TouchableOpacity>
          </View>

          {/* Sub Category Section */}
          <AppText style={styles.categoryLabel}>Sub Category <AppText style={styles.categoryPlaceholder}>(Select Any One)</AppText></AppText>
          <View style={styles.radioGroupHorizontal}>
            <TouchableOpacity
              style={styles.radioOptionHorizontal}
              onPress={() => setHospitalForm(prev => ({ ...prev, subCategory: 'Clinic' }))}
            >
              <View style={[styles.radioCircle, hospitalForm.subCategory === 'Clinic' && styles.radioCircleSelected]}>
                {hospitalForm.subCategory === 'Clinic' && <View style={styles.radioInner} />}
              </View>
              <AppText style={styles.radioLabel}>Clinics</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioOptionHorizontal}
              onPress={() => setHospitalForm(prev => ({ ...prev, subCategory: 'Individual Hospital' }))}
            >
              <View style={[styles.radioCircle, hospitalForm.subCategory === 'Individual Hospital' && styles.radioCircleSelected]}>
                {hospitalForm.subCategory === 'Individual Hospital' && <View style={styles.radioInner} />}
              </View>
              <AppText style={styles.radioLabel}>Individual Hospital</AppText>
            </TouchableOpacity>
          </View>

          <AppText style={[styles.modalSectionLabel, styles.modalSectionTopspacing]}>License Details<AppText style={styles.mandatory}>*</AppText></AppText>

          {/* Registration Certificate */}
          <FileUploadComponent
            placeholder="Upload registration certificate"
            accept={['pdf', 'jpg', 'png']}
            maxSize={15 * 1024 * 1024}
            docType={DOC_TYPES.REGISTRATION_CERTIFICATE}
            initialFile={hospitalForm.registrationCertificate}
            onFileUpload={(file) => handleFileUpload('registrationCertificate', file)}
            onFileDelete={() => handleFileDelete('registrationCertificate')}
            errorMessage={hospitalErrors.registrationCertificate}
          />


          {/* {hospitalErrors.registrationCertificate && (
            <AppText style={styles.errorText}>{hospitalErrors.registrationCertificate}</AppText>
          )} */}
          <CustomInput
            placeholder="Hospital registration number"
            value={hospitalForm.registrationNumber}
            onChangeText={(text) => {
              setHospitalForm(prev => ({ ...prev, registrationNumber: text }));
              if (hospitalErrors.registrationNumber) {
                setHospitalErrors(prev => ({ ...prev, registrationNumber: null }));
              }
            }}
            mandatory={true}
            error={hospitalErrors.registrationNumber}
          />

          <TouchableOpacity
            style={[
              styles.datePickerInput,
              hospitalErrors.registrationDate && styles.inputError,

            ]}
            onPress={() => openDatePicker()}
            activeOpacity={0.7}
          >
            <View style={styles.inputTextContainer}>
              <AppText
                style={
                  hospitalForm.registrationDate
                    ? styles.dateText
                    : styles.placeholderText
                }
              >
                {hospitalForm.registrationDate || 'Registration date'}
              </AppText>
              <AppText style={styles.inlineAsterisk}>*</AppText>
            </View>
            <Calendar />
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
          <AppText style={styles.modalFieldLabelImage}>Image <AppText style={styles.mandatory}>*</AppText> <Icon
            name="info-outline"
            size={16}
            color={colors.textSecondary}
          /></AppText>
          <FileUploadComponent
            placeholder="Uplaod"
            accept={['jpg', 'png', 'jpeg']}
            maxSize={15 * 1024 * 1024}
            docType={DOC_TYPES.HOSPITAL_IMAGE}
            initialFile={hospitalForm.image}
            onFileUpload={(file) => handleFileUpload('image', file)}
            onFileDelete={() => handleFileDelete('image')}
            errorMessage={hospitalErrors.image}
          />
          {/* {hospitalErrors.image && (
            <AppText style={styles.errorText}>{hospitalErrors.image}</AppText>
          )} */}

          {/* General Details */}
          <AppText style={styles.modalSectionLabel}>General Details <AppText style={styles.mandatory}>*</AppText></AppText>
          <CustomInput
            placeholder="Enter hospital name"
            value={hospitalForm.hospitalName}
            onChangeText={(text) => {
              setHospitalForm(prev => ({ ...prev, hospitalName: text }));
              if (hospitalErrors.hospitalName) {
                setHospitalErrors(prev => ({ ...prev, hospitalName: null }));
              }
            }}
            mandatory={true}
            error={hospitalErrors.hospitalName}
          />

          <CustomInput
            placeholder="Enter Short name"
            value={hospitalForm.shortName}
            onChangeText={(text) => setHospitalForm(prev => ({ ...prev, shortName: text }))}
          />

          <AddressInputWithLocation
            label="Address 1"
            value={hospitalForm.address1}
            onChangeText={(text) => {
              setHospitalForm(prev => ({ ...prev, address1: text }));
              if (hospitalErrors.address1) {
                setHospitalErrors(prev => ({ ...prev, address1: null }));
              }
            }}
            placeholder="Address 1 "
            error={hospitalErrors.address1}
            mandatory={true}


            onLocationSelect={locationData => {
              const addressParts = locationData.address
                .split(',')
                .map(part => part.trim());
              const extractedPincode = locationData.pincode || '';
              const filteredParts = addressParts.filter(part => {
                return (
                  !part.match(/^\d{6}$/) && part.toLowerCase() !== 'india'
                );
              });
              const matchedState = states.find(
                s =>
                  s.name.toLowerCase() === locationData.state.toLowerCase(),
              );
              const matchedCity = cities.find(
                c =>
                  c.name.toLowerCase() === locationData.city.toLowerCase(),
              );
              setHospitalForm(prev => ({
                ...prev,
                address1: filteredParts[0] || '',
                address2: filteredParts[1] || '',
                address3: filteredParts[2] || '',
                address4: filteredParts.slice(3).join(', ') || '',
                pincode: extractedPincode,
                area: locationData.area || '',
                ...(matchedState && {
                  stateId: matchedState.id,
                  state: matchedState.name,
                }),
                ...(matchedCity && {
                  cityId: matchedCity.id,
                  city: matchedCity.name,
                }),
              }));
              // if (matchedState) loadCities(matchedState.id);
              setHospitalErrors(prev => ({
                ...prev,
                address1: null,
                address2: null,
                address3: null,
                address4: null,
                pincode: null,
                area: null,
                city: null,
                state: null,
              }));
            }}
          />

          <CustomInput
            placeholder="Address 2"
            value={hospitalForm.address2}
            onChangeText={(text) => setHospitalForm(prev => ({ ...prev, address2: text }))}
            mandatory={true}
            error={hospitalErrors.address2}
          />

          <CustomInput
            placeholder="Address 3"
            value={hospitalForm.address3}
            onChangeText={(text) => setHospitalForm(prev => ({ ...prev, address3: text }))}
            mandatory={true}
            error={hospitalErrors.address3}

          />

          <CustomInput
            placeholder="Address 4"
            value={hospitalForm.address4}
            onChangeText={(text) => setHospitalForm(prev => ({ ...prev, address4: text }))}
          />

          <CustomInput
            placeholder="Pincode"
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
            mandatory={true}
            error={hospitalErrors.pincode}
          />

          <CustomInput
            placeholder="Area"
            value={hospitalForm.area}
            onChangeText={(text) => {
              setHospitalForm(prev => ({ ...prev, area: text }));
              setHospitalErrors(prev => ({ ...prev, area: null }));
            }}
            mandatory={true}
            error={hospitalErrors.area}
          />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowCityModal(true)}
          >
            <CustomInput
              placeholder="City"
              value={hospitalForm.city}
              onChangeText={() => { }}
              mandatory={true}
              error={hospitalErrors.city}
              editable={false}
              pointerEvents="none"
              rightComponent={
                <Icon name="arrow-drop-down" size={24} color="#999" />
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowStateModal(true)}
          >
            <CustomInput
              placeholder="State"
              value={hospitalForm.state}
              onChangeText={() => { }}
              mandatory={true}
              error={hospitalErrors.state}
              editable={false}
              pointerEvents="none"
              rightComponent={
                <Icon name="arrow-drop-down" size={24} color="#999" />
              }
            />
          </TouchableOpacity>

          {/* Security Details */}
          <AppText style={styles.modalSectionLabel}>Security Details <AppText style={styles.mandatory}>*</AppText></AppText>
          <CustomInput
            placeholder="Mobile number"
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
            editable={!verificationStatus.mobile}
            mandatory={true}
            error={hospitalErrors.mobileNumber || hospitalErrors.mobileVerification}
            rightComponent={
              <TouchableOpacity
                style={[
                  styles.inlineVerifyButton,
                  verificationStatus.mobile && styles.verifiedButton,
                  loadingOtp.mobile && styles.disabledButton,
                ]}
                onPress={() =>
                  !verificationStatus.mobile &&
                  !loadingOtp.mobile &&
                  handleVerify('mobile')
                }
                disabled={verificationStatus.mobile || loadingOtp.mobile}
              >
                {loadingOtp.mobile && !verificationStatus.mobile ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <AppText
                    style={[
                      styles.inlineVerifyText,
                      verificationStatus.mobile && styles.verifiedText,
                    ]}
                  >
                    {verificationStatus.mobile ? (
                      'Verified'
                    ) : (
                      <>
                        Verify
                        <AppText style={styles.inlineAsterisk}>*</AppText>
                      </>
                    )}
                  </AppText>
                )}
              </TouchableOpacity>
            }
          />
          {renderOTPInput('mobile')}

          <CustomInput
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
            editable={!verificationStatus.email}
            mandatory={true}
            error={hospitalErrors.emailAddress || hospitalErrors.emailVerification}
            rightComponent={
              <TouchableOpacity
                style={[
                  styles.inlineVerifyButton,
                  verificationStatus.email && styles.verifiedButton,
                  loadingOtp.email && styles.disabledButton,
                ]}
                onPress={() =>
                  !verificationStatus.email &&
                  !loadingOtp.email &&
                  handleVerify('email')
                }
                disabled={verificationStatus.email || loadingOtp.email}
              >
                {loadingOtp.email && !verificationStatus.email ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <AppText
                    style={[
                      styles.inlineVerifyText,
                      verificationStatus.email && styles.verifiedText,
                    ]}
                  >
                    {verificationStatus.email ? (
                      'Verified'
                    ) : (
                      <>
                        Verify
                        <AppText style={styles.inlineAsterisk}>*</AppText>
                      </>
                    )}
                  </AppText>
                )}
              </TouchableOpacity>
            }
          />
          {renderOTPInput('email')}

          <FileUploadComponent
            placeholder="Upload PAN"
            accept={['pdf', 'jpg', 'png', 'jpeg']}
            maxSize={15 * 1024 * 1024}
            docType={DOC_TYPES.PAN}
            mandatory={true}
            initialFile={hospitalForm.panFile}
            onFileUpload={(file) => handleFileUpload('pan', file)}
            onFileDelete={() => handleFileDelete('pan')}
            errorMessage={hospitalErrors.panFile}
            onOcrDataExtracted={(ocrData) => {
              console.log('PAN OCR Data:', ocrData);
              if (ocrData.panNumber) {
                setHospitalForm(prev => ({ ...prev, panNumber: ocrData.panNumber }));
                setVerificationStatus(prev => ({ ...prev, pan: true }));
              }
            }}
          />
          {/* {hospitalErrors.panFile && (
            <AppText style={styles.errorText}>{hospitalErrors.panFile}</AppText>
          )} */}
          <CustomInput
            placeholder="PAN number"
            maxLength={10}
            autoCapitalize="characters"
            value={hospitalForm.panNumber}
            onChangeText={(text) => {
              const upperText = text.toUpperCase();
              setHospitalForm(prev => ({ ...prev, panNumber: upperText }));
              if (hospitalErrors.panNumber) {
                setHospitalErrors(prev => ({ ...prev, panNumber: null }));
              }
            }}
            mandatory={true}
            error={hospitalErrors.panNumber}
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
                    if (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(hospitalForm.panNumber)) {
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
            docType={DOC_TYPES.GST}
            initialFile={hospitalForm.gstFile}
            onFileUpload={(file) => handleFileUpload('gst', file)}
            onFileDelete={() => handleFileDelete('gst')}
            onOcrDataExtracted={(ocrData) => {
              console.log('GST OCR Data:', ocrData);
              if (ocrData.gstNumber) {
                setHospitalForm(prev => ({ ...prev, gstNumber: ocrData.gstNumber }));

              }
            }}
          />
          {/* {hospitalErrors.gstFile && (
            <AppText style={styles.errorText}>{hospitalErrors.gstFile}</AppText>
          )} */}
          <CustomInput
            placeholder="GST number"
            maxLength={15}
            autoCapitalize="characters"
            value={hospitalForm.gstNumber}
            onChangeText={(text) => {
              setHospitalForm(prev => ({ ...prev, gstNumber: text.toUpperCase() }));
              if (hospitalErrors.gstNumber) {
                setHospitalErrors(prev => ({ ...prev, gstNumber: null }));
              }
            }}
            error={hospitalForm.gstNumber}

          />

          {/* Mapping Section */}
          <AppText style={styles.modalSectionLabel}>Mapping</AppText>
          <AppText style={styles.modalFieldLabel}>Hospital</AppText>
          <View style={[styles.mappingPharmacyBox, { marginBottom: 20 }]}>
            <AppText style={styles.mappingPharmacyText}>{pharmacyName || 'Hospital name will appear here'}</AppText>
          </View>

          {/* Add Stockist Section (Optional) */}
          <AppText style={styles.modalSectionLabel2}> Stockist Suggestions <AppText style={styles.optionalText}> (Optional)</AppText></AppText>
          <CustomInput
            placeholder="Name of the Stockist"
            value={hospitalForm.stockistName}
            onChangeText={(text) => setHospitalForm(prev => ({ ...prev, stockistName: text }))}
          />
          <CustomInput
            placeholder="Distributor Code"
            value={hospitalForm.stockistCode}
            onChangeText={(text) => setHospitalForm(prev => ({ ...prev, stockistCode: text }))}
          />
          <CustomInput
            placeholder="City"
            value={hospitalForm.stockistCity}
            onChangeText={(text) => setHospitalForm(prev => ({ ...prev, stockistCity: text }))}
          />

          {/* Action Buttons */}
          <View style={styles.modalActionButtons}>


            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
            >
              <AppText style={styles.cancelButtonText}>Cancel</AppText>
            </TouchableOpacity>


            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <AppText style={styles.submitButtonText}>Register</AppText>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>
        <Toast topOffset={20} />

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
    paddingVertical: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  modalCloseButton: {
    fontSize: 24,
    color: '#999',
    fontWeight: '300',
  },
  modalSectionLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 12,
    paddingLeft: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF8C42',
    marginLeft: -16,
  },

  modalSectionLabel2: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 12,
    paddingLeft: 12,
    marginLeft: -16,
  },

  modalSectionTopspacing: {
    marginTop: 30

  },
  modalFieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 12,
    marginBottom: 6,
  },
  modalFieldLabelImage: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 12,
    marginLeft: 4,
    marginBottom: 6,
  },
  mandatory: {
    color: colors.error,
  },
  categoryLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 20,
  },
  categoryPlaceholder: {
    fontSize: 18,
    fontWeight: '400',
    color: '#999',
  },
  radioGroup: {
    marginBottom: 12,
  },
  radioGroupHorizontal: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 24,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  radioOptionHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
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
    marginTop: 2,
    color: colors.error,
    fontSize: 12,
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
    // backgroundColor: '#4CAF50',
    // borderColor: '#4CAF50',
  },
  inlineVerifyText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  verifiedText: {
    color: colors.primary
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



  datePickerInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.loginInputBorderColor,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 2,
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
  optionalText: {
    fontSize: 18,
    fontWeight: '400',
    color: '#999',
  },
});

export default AddNewHospitalModal;
