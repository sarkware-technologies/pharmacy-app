import React, { useState, useEffect } from 'react';
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

const AddNewPharmacyModal = ({ visible, onClose, onSubmit }) => {
  const [pharmacyForm, setPharmacyForm] = useState({
    licenseType: 'Only Retail', // 'Only Retail', 'Only Wholesaler', 'Retail Cum Wholesaler'
    license20b: '',
    license20bFile: null,
    license20bExpiryDate: '',
    license21b: '',
    license21bFile: null,
    license21bExpiryDate: '',
    registrationDate: '',
    pharmacyImageFile: null,
    pharmacyName: '',
    shortName: '',
    ownerName: '',
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
    mobileNumber: '',
    emailAddress: '',
    panFile: null,
    panNumber: '',
    gstFile: null,
    gstNumber: '',
  });

  const [pharmacyErrors, setPharmacyErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Document IDs for uploaded files
  const [documentIds, setDocumentIds] = useState({});
  
  // Uploaded documents with full details including docTypeId
  const [uploadedDocs, setUploadedDocs] = useState([]);
  
  // Verification status
  const [verificationStatus, setVerificationStatus] = useState({
    mobile: false,
    email: false,
  });
  
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
    if (!stateId) return;
    
    setLoadingCities(true);
    setCities([]);
    setPharmacyForm(prev => ({ ...prev, city: '', cityId: null, area: '', areaId: null }));
    
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

  const loadAreas = async (cityId) => {
    if (!cityId) return;
    
    setLoadingAreas(true);
    setAreas([]);
    
    try {
      // Using mock data for areas
      setAreas(MOCK_AREAS);
    } catch (error) {
      console.error('Error loading areas:', error);
    } finally {
      setLoadingAreas(false);
    }
  };

  const handleDateChange = (type, event, date) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(null);
      return;
    }
    
    if (date) {
      const formattedDate = date.toLocaleDateString('en-IN');
      
      if (type === '20b') {
        setSelectedDate20b(date);
        setPharmacyForm(prev => ({ ...prev, license20bExpiryDate: formattedDate }));
      } else if (type === '21b') {
        setSelectedDate21b(date);
        setPharmacyForm(prev => ({ ...prev, license21bExpiryDate: formattedDate }));
      } else if (type === 'registration') {
        setSelectedRegistrationDate(date);
        setPharmacyForm(prev => ({ ...prev, registrationDate: formattedDate }));
      }
    }
    
    setShowDatePicker(null);
  };

  const resetForm = () => {
    setPharmacyForm({
      licenseType: 'Only Retail',
      license20b: '',
      license20bFile: null,
      license20bExpiryDate: '',
      license21b: '',
      license21bFile: null,
      license21bExpiryDate: '',
      registrationDate: '',
      pharmacyImageFile: null,
      pharmacyName: '',
      shortName: '',
      ownerName: '',
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
      mobileNumber: '',
      emailAddress: '',
      panFile: null,
      panNumber: '',
      gstFile: null,
      gstNumber: '',
    });
    setPharmacyErrors({});
    setVerificationStatus({ mobile: false, email: false });
    setCities([]);
    setAreas([]);
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
    setPharmacyForm(prev => ({ ...prev, [`${field}File`]: file }));
    setPharmacyErrors(prev => ({ ...prev, [`${field}File`]: null }));
  };

  const handleFileDelete = (field) => {
    const file = pharmacyForm[`${field}File`];
    if (file && file.id) {
      setUploadedDocs(prev => prev.filter(doc => doc.id !== file.id));
    }
    setDocumentIds(prev => ({ ...prev, [field]: null }));
    setPharmacyForm(prev => ({ ...prev, [`${field}File`]: null }));
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    // Comprehensive validation
    const newErrors = {};
    
    // License Type validation
    if (!pharmacyForm.licenseType) {
      newErrors.licenseType = 'License type is required';
    }
    
    // 20B License validation
    if (!pharmacyForm.license20bFile && !documentIds.license20b) {
      newErrors.license20bFile = '20B license document is required';
    }
    if (!pharmacyForm.license20b || pharmacyForm.license20b.trim() === '') {
      newErrors.license20b = '20B license number is required';
    }
    if (!pharmacyForm.license20bExpiryDate || pharmacyForm.license20bExpiryDate.trim() === '') {
      newErrors.license20bExpiryDate = '20B expiry date is required';
    }
    
    // 21B License validation
    if (!pharmacyForm.license21bFile && !documentIds.license21b) {
      newErrors.license21bFile = '21B license document is required';
    }
    if (!pharmacyForm.license21b || pharmacyForm.license21b.trim() === '') {
      newErrors.license21b = '21B license number is required';
    }
    if (!pharmacyForm.license21bExpiryDate || pharmacyForm.license21bExpiryDate.trim() === '') {
      newErrors.license21bExpiryDate = '21B expiry date is required';
    }
    
    // Pharmacy Image validation
    if (!pharmacyForm.pharmacyImageFile && !documentIds.pharmacyImage) {
      newErrors.pharmacyImageFile = 'Pharmacy image is required';
    }
    
    // Pharmacy Name validation
    if (!pharmacyForm.pharmacyName || pharmacyForm.pharmacyName.trim() === '') {
      newErrors.pharmacyName = 'Pharmacy name is required';
    } else if (pharmacyForm.pharmacyName.trim().length < 3) {
      newErrors.pharmacyName = 'Pharmacy name must be at least 3 characters';
    }
    
    // Owner Name validation
    if (!pharmacyForm.ownerName || pharmacyForm.ownerName.trim() === '') {
      newErrors.ownerName = 'Owner name is required';
    }
    
    // Address 1 validation
    if (!pharmacyForm.address1 || pharmacyForm.address1.trim() === '') {
      newErrors.address1 = 'Address 1 is required';
    }
    
    // Pincode validation
    if (!pharmacyForm.pincode || pharmacyForm.pincode.trim() === '') {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(pharmacyForm.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }
    
    // Area validation
    if (!pharmacyForm.area || !pharmacyForm.areaId) {
      newErrors.area = 'Area is required';
    }
    
    // City validation
    if (!pharmacyForm.city || !pharmacyForm.cityId) {
      newErrors.city = 'City is required';
    }
    
    // State validation
    if (!pharmacyForm.state || !pharmacyForm.stateId) {
      newErrors.state = 'State is required';
    }
    
    // Mobile Number validation
    if (!pharmacyForm.mobileNumber || pharmacyForm.mobileNumber.trim() === '') {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(pharmacyForm.mobileNumber)) {
      newErrors.mobileNumber = 'Mobile number must be 10 digits';
    } else if (!verificationStatus.mobile) {
      newErrors.mobileVerification = 'Please verify mobile number';
    }
    
    // Email Address validation
    if (!pharmacyForm.emailAddress || pharmacyForm.emailAddress.trim() === '') {
      newErrors.emailAddress = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pharmacyForm.emailAddress)) {
      newErrors.emailAddress = 'Please enter a valid email address';
    } else if (!verificationStatus.email) {
      newErrors.emailVerification = 'Please verify email address';
    }
    
    // PAN validation
    if (!pharmacyForm.panFile && !documentIds.pan) {
      newErrors.panFile = 'PAN document is required';
    }
    if (!pharmacyForm.panNumber || pharmacyForm.panNumber.trim() === '') {
      newErrors.panNumber = 'PAN number is required';
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pharmacyForm.panNumber)) {
      newErrors.panNumber = 'Invalid PAN format (e.g., ABCDE1234F)';
    }
    
    // GST validation
    if (!pharmacyForm.gstFile && !documentIds.gst) {
      newErrors.gstFile = 'GST document is required';
    }
    if (!pharmacyForm.gstNumber || pharmacyForm.gstNumber.trim() === '') {
      newErrors.gstNumber = 'GST number is required';
    } else if (!/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(pharmacyForm.gstNumber)) {
      newErrors.gstNumber = 'Invalid GST format';
    }

    if (Object.keys(newErrors).length > 0) {
      setPharmacyErrors(newErrors);
      
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
      // Determine categoryId and subCategoryId based on license type
      let categoryId = 1;
      let subCategoryId = 0;
      
      if (pharmacyForm.licenseType === 'Only Retail') {
        categoryId = 1;
        subCategoryId = 0;
      } else if (pharmacyForm.licenseType === 'Only Wholesaler') {
        categoryId = 2;
        subCategoryId = 0;
      } else if (pharmacyForm.licenseType === 'Retail Cum Wholesaler') {
        categoryId = 3;
        subCategoryId = 0;
      }

      // Prepare registration payload matching the API structure
      const registrationData = {
        typeId: 1,
        categoryId: categoryId,
        subCategoryId: subCategoryId,
        isMobileVerified: verificationStatus.mobile,
        isEmailVerified: verificationStatus.email,
        isExisting: false,
        licenceDetails: {
          registrationDate: pharmacyForm.registrationDate ? new Date(pharmacyForm.registrationDate).toISOString() : new Date().toISOString(),
          licence: [
            {
              licenceTypeId: 1,
              licenceNo: pharmacyForm.license20b,
              licenceValidUpto: pharmacyForm.license20bExpiryDate ? new Date(pharmacyForm.license20bExpiryDate).toISOString() : new Date().toISOString(),
            },
            {
              licenceTypeId: 3,
              licenceNo: pharmacyForm.license21b,
              licenceValidUpto: pharmacyForm.license21bExpiryDate ? new Date(pharmacyForm.license21bExpiryDate).toISOString() : new Date().toISOString(),
            }
          ]
        },
        customerDocs: uploadedDocs,
        isBuyer: true,
        customerGroupId: 1,
        generalDetails: {
          name: pharmacyForm.pharmacyName,
          shortName: pharmacyForm.shortName || '',
          address1: pharmacyForm.address1,
          address2: pharmacyForm.address2 || '',
          address3: pharmacyForm.address3 || '',
          address4: pharmacyForm.address4 || '',
          pincode: parseInt(pharmacyForm.pincode),
          area: pharmacyForm.area || 'Default',
          cityId: parseInt(pharmacyForm.cityId),
          stateId: parseInt(pharmacyForm.stateId),
          ownerName: pharmacyForm.ownerName || '',
          clinicName: '',
          specialist: '',
        },
        securityDetails: {
          mobile: pharmacyForm.mobileNumber,
          email: pharmacyForm.emailAddress,
          panNumber: pharmacyForm.panNumber,
          gstNumber: pharmacyForm.gstNumber,
        },
        suggestedDistributors: [{
          distributorCode: '',
          distributorName: '',
          city: ''
        }]
      };

      console.log('Pharmacy registration payload:', registrationData);

      const response = await customerAPI.createCustomer(registrationData);
      
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Pharmacy Added',
          text2: response.message || 'Pharmacy registered successfully',
        });

        // Pass the created pharmacy data back to parent
        const newPharmacy = {
          id: response.data?.id || Date.now(),
          name: pharmacyForm.pharmacyName,
          code: response.data?.code || pharmacyForm.shortName,
          ...pharmacyForm,
          customerId: response.data?.id,
        };

        onSubmit(newPharmacy);

        // Reset and close
        resetForm();
        onClose();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: response.details || 'Failed to register pharmacy. Please try again.',
        });
      }
    } catch (error) {
      console.error('Pharmacy registration error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An error occurred while registering the pharmacy. Please try again.',
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
            <AppText style={styles.modalTitle}>Add Pharmacy Account</AppText>
            <TouchableOpacity onPress={handleClose}>
              <AppText style={styles.modalCloseButton}>✕</AppText>
            </TouchableOpacity>
          </View>

          {/* License Details */}
          <AppText style={styles.modalSectionLabel}>Licence Details <AppText style={styles.mandatory}>*</AppText></AppText>
          
          {/* License Type Radio Buttons */}
          <View style={styles.radioGroup}>
            <TouchableOpacity 
              style={styles.radioOption}
              onPress={() => setPharmacyForm(prev => ({ ...prev, licenseType: 'Only Retail' }))}
            >
              <View style={[styles.radioCircle, pharmacyForm.licenseType === 'Only Retail' && styles.radioCircleSelected]} />
              <AppText style={styles.radioLabel}>Only Retail</AppText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.radioOption}
              onPress={() => setPharmacyForm(prev => ({ ...prev, licenseType: 'Only Wholesaler' }))}
            >
              <View style={[styles.radioCircle, pharmacyForm.licenseType === 'Only Wholesaler' && styles.radioCircleSelected]} />
              <AppText style={styles.radioLabel}>Only Wholesaler</AppText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.radioOption}
              onPress={() => setPharmacyForm(prev => ({ ...prev, licenseType: 'Retail Cum Wholesaler' }))}
            >
              <View style={[styles.radioCircle, pharmacyForm.licenseType === 'Retail Cum Wholesaler' && styles.radioCircleSelected]} />
              <AppText style={styles.radioLabel}>Retail Cum Wholesaler</AppText>
            </TouchableOpacity>
          </View>

          {/* 20B License */}
          <AppText style={styles.fieldLabel}>20B *</AppText>
          <FileUploadComponent
            placeholder="Upload 20B license"
            accept={['pdf', 'jpg', 'png']}
            maxSize={10 * 1024 * 1024}
            docType={DOC_TYPES.LICENSE_20B}
            initialFile={pharmacyForm.license20bFile}
            onFileUpload={(file) => handleFileUpload('license20b', file)}
            onFileDelete={() => handleFileDelete('license20b')}
            errorMessage={pharmacyErrors.license20bFile}
          />
          {pharmacyErrors.license20bFile && (
            <AppText style={styles.errorText}>{pharmacyErrors.license20bFile}</AppText>
          )}
          
          <AppInput
            style={[styles.modalInput, { marginBottom: pharmacyErrors.license20b ? 5 : 10 }, pharmacyErrors.license20b && styles.inputError]}
            placeholder="Drug license number *"
            placeholderTextColor="#999"
            value={pharmacyForm.license20b}
            onChangeText={(text) => {
              setPharmacyForm(prev => ({ ...prev, license20b: text }));
              if (pharmacyErrors.license20b) {
                setPharmacyErrors(prev => ({ ...prev, license20b: null }));
              }
            }}
          />
          {pharmacyErrors.license20b && (
            <AppText style={styles.errorText}>{pharmacyErrors.license20b}</AppText>
          )}
          
          <TouchableOpacity 
            style={[styles.modalInput, { marginBottom: pharmacyErrors.license20bExpiryDate ? 5 : 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, pharmacyErrors.license20bExpiryDate && styles.inputError]}
            onPress={() => setShowDatePicker('20b')}
          >
            <AppText style={[styles.dropdownPlaceholder, pharmacyForm.license20bExpiryDate && { color: '#333' }]}>
              {pharmacyForm.license20bExpiryDate || 'Expiry date *'}
            </AppText>
            <Icon name="calendar-today" size={20} color="#999" />
          </TouchableOpacity>
          {pharmacyErrors.license20bExpiryDate && (
            <AppText style={styles.errorText}>{pharmacyErrors.license20bExpiryDate}</AppText>
          )}

          {/* 21B License */}
          <AppText style={styles.fieldLabel}>21B *</AppText>
          <FileUploadComponent
            placeholder="Upload 21B license"
            accept={['pdf', 'jpg', 'png']}
            maxSize={10 * 1024 * 1024}
            docType={DOC_TYPES.LICENSE_21B}
            initialFile={pharmacyForm.license21bFile}
            onFileUpload={(file) => handleFileUpload('license21b', file)}
            onFileDelete={() => handleFileDelete('license21b')}
            errorMessage={pharmacyErrors.license21bFile}
          />
          {pharmacyErrors.license21bFile && (
            <AppText style={styles.errorText}>{pharmacyErrors.license21bFile}</AppText>
          )}
          
          <AppInput
            style={[styles.modalInput, { marginBottom: pharmacyErrors.license21b ? 5 : 10 }, pharmacyErrors.license21b && styles.inputError]}
            placeholder="Drug license number *"
            placeholderTextColor="#999"
            value={pharmacyForm.license21b}
            onChangeText={(text) => {
              setPharmacyForm(prev => ({ ...prev, license21b: text }));
              if (pharmacyErrors.license21b) {
                setPharmacyErrors(prev => ({ ...prev, license21b: null }));
              }
            }}
          />
          {pharmacyErrors.license21b && (
            <AppText style={styles.errorText}>{pharmacyErrors.license21b}</AppText>
          )}
          
          <TouchableOpacity 
            style={[styles.modalInput, { marginBottom: pharmacyErrors.license21bExpiryDate ? 5 : 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, pharmacyErrors.license21bExpiryDate && styles.inputError]}
            onPress={() => setShowDatePicker('21b')}
          >
            <AppText style={[styles.dropdownPlaceholder, pharmacyForm.license21bExpiryDate && { color: '#333' }]}>
              {pharmacyForm.license21bExpiryDate || 'Expiry date *'}
            </AppText>
            <Icon name="calendar-today" size={20} color="#999" />
          </TouchableOpacity>
          {pharmacyErrors.license21bExpiryDate && (
            <AppText style={styles.errorText}>{pharmacyErrors.license21bExpiryDate}</AppText>
          )}

          {/* Pharmacy Image */}
          <AppText style={styles.fieldLabel}>Pharmacy Image *</AppText>
          <FileUploadComponent
            placeholder="Upload"
            accept={['jpg', 'png', 'jpeg']}
            maxSize={10 * 1024 * 1024}
            docType={DOC_TYPES.PHARMACY_IMAGE}
            initialFile={pharmacyForm.pharmacyImageFile}
            onFileUpload={(file) => handleFileUpload('pharmacyImage', file)}
            onFileDelete={() => handleFileDelete('pharmacyImage')}
            errorMessage={pharmacyErrors.pharmacyImageFile}
          />
          {pharmacyErrors.pharmacyImageFile && (
            <AppText style={styles.errorText}>{pharmacyErrors.pharmacyImageFile}</AppText>
          )}

          {/* Date Pickers */}
          {showDatePicker === '20b' && (
            <DateTimePicker
              value={selectedDate20b}
              mode="date"
              display="default"
              onChange={(event, date) => handleDateChange('20b', event, date)}
            />
          )}
          {showDatePicker === '21b' && (
            <DateTimePicker
              value={selectedDate21b}
              mode="date"
              display="default"
              onChange={(event, date) => handleDateChange('21b', event, date)}
            />
          )}
          {showDatePicker === 'registration' && (
            <DateTimePicker
              value={selectedRegistrationDate}
              mode="date"
              display="default"
              onChange={(event, date) => handleDateChange('registration', event, date)}
            />
          )}

          {/* General Details */}
          <AppText style={styles.modalSectionLabel}>General Details <AppText style={styles.mandatory}>*</AppText></AppText>
          
          <AppInput
            style={[styles.modalInput, { marginBottom: pharmacyErrors.pharmacyName ? 5 : 10 }, pharmacyErrors.pharmacyName && styles.inputError]}
            placeholder="Name of the Pharmacy *"
            placeholderTextColor="#999"
            value={pharmacyForm.pharmacyName}
            onChangeText={(text) => {
              setPharmacyForm(prev => ({ ...prev, pharmacyName: text }));
              if (pharmacyErrors.pharmacyName) {
                setPharmacyErrors(prev => ({ ...prev, pharmacyName: null }));
              }
            }}
          />
          {pharmacyErrors.pharmacyName && (
            <AppText style={styles.errorText}>{pharmacyErrors.pharmacyName}</AppText>
          )}
          
          <AppInput
            style={[styles.modalInput, { marginBottom: pharmacyErrors.ownerName ? 5 : 10 }, pharmacyErrors.ownerName && styles.inputError]}
            placeholder="Name of the Owner *"
            placeholderTextColor="#999"
            value={pharmacyForm.ownerName}
            onChangeText={(text) => {
              setPharmacyForm(prev => ({ ...prev, ownerName: text }));
              if (pharmacyErrors.ownerName) {
                setPharmacyErrors(prev => ({ ...prev, ownerName: null }));
              }
            }}
          />
          {pharmacyErrors.ownerName && (
            <AppText style={styles.errorText}>{pharmacyErrors.ownerName}</AppText>
          )}

          <AppInput
            style={[styles.modalInput, { marginBottom: 10 }]}
            placeholder="Short Name (Optional)"
            placeholderTextColor="#999"
            value={pharmacyForm.shortName}
            onChangeText={(text) => setPharmacyForm(prev => ({ ...prev, shortName: text }))}
          />

          <AppInput
            style={[styles.modalInput, { marginBottom: pharmacyErrors.address1 ? 5 : 10 }, pharmacyErrors.address1 && styles.inputError]}
            placeholder="Address 1 *"
            placeholderTextColor="#999"
            value={pharmacyForm.address1}
            onChangeText={(text) => {
              setPharmacyForm(prev => ({ ...prev, address1: text }));
              if (pharmacyErrors.address1) {
                setPharmacyErrors(prev => ({ ...prev, address1: null }));
              }
            }}
          />
          {pharmacyErrors.address1 && (
            <AppText style={styles.errorText}>{pharmacyErrors.address1}</AppText>
          )}
          
          <AppInput
            style={[styles.modalInput, { marginBottom: 10 }]}
            placeholder="Address 2"
            placeholderTextColor="#999"
            value={pharmacyForm.address2}
            onChangeText={(text) => setPharmacyForm(prev => ({ ...prev, address2: text }))}
          />

          <AppInput
            style={[styles.modalInput, { marginBottom: 10 }]}
            placeholder="Address 3"
            placeholderTextColor="#999"
            value={pharmacyForm.address3}
            onChangeText={(text) => setPharmacyForm(prev => ({ ...prev, address3: text }))}
          />

          <AppInput
            style={[styles.modalInput, { marginBottom: 10 }]}
            placeholder="Address 4"
            placeholderTextColor="#999"
            value={pharmacyForm.address4}
            onChangeText={(text) => setPharmacyForm(prev => ({ ...prev, address4: text }))}
          />

          <AppInput
            style={[styles.modalInput, { marginBottom: pharmacyErrors.pincode ? 5 : 10 }, pharmacyErrors.pincode && styles.inputError]}
            placeholder="Pincode *"
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={6}
            value={pharmacyForm.pincode}
            onChangeText={(text) => {
              if (/^\d{0,6}$/.test(text)) {
                setPharmacyForm(prev => ({ ...prev, pincode: text }));
                if (pharmacyErrors.pincode) {
                  setPharmacyErrors(prev => ({ ...prev, pincode: null }));
                }
              }
            }}
          />
          {pharmacyErrors.pincode && (
            <AppText style={styles.errorText}>{pharmacyErrors.pincode}</AppText>
          )}

          {/* Area, City, State Dropdowns */}
          <TouchableOpacity 
            style={[styles.dropdown, { marginBottom: pharmacyErrors.area ? 5 : 10 }, pharmacyErrors.area && styles.inputError]}
            onPress={() => {
              if (pharmacyForm.cityId) {
                loadAreas(pharmacyForm.cityId);
                setShowAreaModal(true);
              } else {
                Toast.show({
                  type: 'info',
                  text1: 'Select City First',
                  text2: 'Please select a city before selecting area',
                });
              }
            }}
          >
            <AppText style={[styles.dropdownPlaceholder, pharmacyForm.area && { color: '#333' }]}>
              {pharmacyForm.area || 'Area *'}
            </AppText>
            <Icon name="arrow-drop-down" size={24} color="#999" />
          </TouchableOpacity>
          {pharmacyErrors.area && (
            <AppText style={styles.errorText}>{pharmacyErrors.area}</AppText>
          )}
          
          <TouchableOpacity 
            style={[styles.dropdown, { marginBottom: pharmacyErrors.city ? 5 : 10 }, pharmacyErrors.city && styles.inputError]}
            onPress={() => {
              if (pharmacyForm.stateId) {
                loadCities(pharmacyForm.stateId);
                setShowCityModal(true);
              } else {
                Toast.show({
                  type: 'info',
                  text1: 'Select State First',
                  text2: 'Please select a state before selecting city',
                });
              }
            }}
          >
            <AppText style={[styles.dropdownPlaceholder, pharmacyForm.city && { color: '#333' }]}>
              {pharmacyForm.city || 'City *'}
            </AppText>
            <Icon name="arrow-drop-down" size={24} color="#999" />
          </TouchableOpacity>
          {pharmacyErrors.city && (
            <AppText style={styles.errorText}>{pharmacyErrors.city}</AppText>
          )}

          <TouchableOpacity 
            style={[styles.dropdown, { marginBottom: pharmacyErrors.state ? 5 : 10 }, pharmacyErrors.state && styles.inputError]}
            onPress={() => setShowStateModal(true)}
          >
            <AppText style={[styles.dropdownPlaceholder, pharmacyForm.state && { color: '#333' }]}>
              {pharmacyForm.state || 'State *'}
            </AppText>
            <Icon name="arrow-drop-down" size={24} color="#999" />
          </TouchableOpacity>
          {pharmacyErrors.state && (
            <AppText style={styles.errorText}>{pharmacyErrors.state}</AppText>
          )}

          {/* Security Details */}
          <AppText style={styles.modalSectionLabel}>Security Details <AppText style={styles.mandatory}>*</AppText></AppText>
          <AppText style={styles.modalFieldLabel}>Mobile number <AppText style={styles.mandatory}>*</AppText></AppText>
          <View style={[styles.inputWithButton, pharmacyErrors.mobileNumber && styles.inputError]}>
            <AppText style={styles.countryCode}>+91</AppText>
            <AppInput
              style={styles.inputField}
              placeholder="Mobile Number"
              value={pharmacyForm.mobileNumber}
              onChangeText={(text) => {
                if (/^\d{0,10}$/.test(text)) {
                  setPharmacyForm(prev => ({ ...prev, mobileNumber: text }));
                  if (pharmacyErrors.mobileNumber) {
                    setPharmacyErrors(prev => ({ ...prev, mobileNumber: null, mobileVerification: null }));
                  }
                  // Auto verify when 10 digits entered
                  if (text.length === 10) {
                    setVerificationStatus(prev => ({ ...prev, mobile: true }));
                    Toast.show({
                      type: 'success',
                      text1: 'Mobile Verified',
                      text2: 'Mobile number auto-verified',
                      position: 'bottom',
                    });
                  } else {
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
                verificationStatus.mobile && styles.verifiedButton,
              ]}
              disabled={true}
            >
              <AppText style={[
                styles.inlineVerifyText,
                verificationStatus.mobile && styles.verifiedText
              ]}>
                {verificationStatus.mobile ? 'Verified' : 'Verify'}
              </AppText>
            </TouchableOpacity>
          </View>
          {(pharmacyErrors.mobileNumber || pharmacyErrors.mobileVerification) && (
            <AppText style={styles.errorText}>{pharmacyErrors.mobileNumber || pharmacyErrors.mobileVerification}</AppText>
          )}

          <AppText style={styles.modalFieldLabel}>Email address <AppText style={styles.mandatory}>*</AppText></AppText>
          <View style={[styles.inputWithButton, pharmacyErrors.emailAddress && styles.inputError]}>
            <AppInput
              style={[styles.inputField, { flex: 1 }]}
              placeholder="Email Address"
              value={pharmacyForm.emailAddress}
              onChangeText={(text) => {
                setPharmacyForm(prev => ({ ...prev, emailAddress: text }));
                if (pharmacyErrors.emailAddress) {
                  setPharmacyErrors(prev => ({ ...prev, emailAddress: null, emailVerification: null }));
                }
                // Auto verify when valid email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (emailRegex.test(text)) {
                  setVerificationStatus(prev => ({ ...prev, email: true }));
                  Toast.show({
                    type: 'success',
                    text1: 'Email Verified',
                    text2: 'Email address auto-verified',
                    position: 'bottom',
                  });
                } else {
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
                verificationStatus.email && styles.verifiedButton,
              ]}
              disabled={true}
            >
              <AppText style={[
                styles.inlineVerifyText,
                verificationStatus.email && styles.verifiedText
              ]}>
                {verificationStatus.email ? 'Verified' : 'Verify'}
              </AppText>
            </TouchableOpacity>
          </View>
          {(pharmacyErrors.emailAddress || pharmacyErrors.emailVerification) && (
            <AppText style={styles.errorText}>{pharmacyErrors.emailAddress || pharmacyErrors.emailVerification}</AppText>
          )}

          {/* PAN */}
          <AppText style={styles.modalFieldLabel}>Upload PAN <AppText style={styles.mandatory}>*</AppText></AppText>
          <FileUploadComponent
            placeholder="Upload PAN"
            accept={['pdf', 'jpg', 'png']}
            maxSize={10 * 1024 * 1024}
            docType={DOC_TYPES.PAN}
            initialFile={pharmacyForm.panFile}
            onFileUpload={(file) => handleFileUpload('pan', file)}
            onFileDelete={() => handleFileDelete('pan')}
            errorMessage={pharmacyErrors.panFile}
          />
          {pharmacyErrors.panFile && (
            <AppText style={styles.errorText}>{pharmacyErrors.panFile}</AppText>
          )}
          
          <AppInput
            style={[styles.modalInput, { marginBottom: pharmacyErrors.panNumber ? 5 : 10 }, pharmacyErrors.panNumber && styles.inputError]}
            placeholder="PAN number *"
            placeholderTextColor="#999"
            maxLength={10}
            autoCapitalize="characters"
            value={pharmacyForm.panNumber}
            onChangeText={(text) => {
              setPharmacyForm(prev => ({ ...prev, panNumber: text.toUpperCase() }));
              if (pharmacyErrors.panNumber) {
                setPharmacyErrors(prev => ({ ...prev, panNumber: null }));
              }
            }}
          />
          {pharmacyErrors.panNumber && (
            <AppText style={styles.errorText}>{pharmacyErrors.panNumber}</AppText>
          )}

          {/* GST */}
          <AppText style={styles.modalFieldLabel}>Upload GST <AppText style={styles.mandatory}>*</AppText></AppText>
          <FileUploadComponent
            placeholder="Upload GST"
            accept={['pdf', 'jpg', 'png']}
            maxSize={10 * 1024 * 1024}
            docType={DOC_TYPES.GST}
            initialFile={pharmacyForm.gstFile}
            onFileUpload={(file) => handleFileUpload('gst', file)}
            onFileDelete={() => handleFileDelete('gst')}
            errorMessage={pharmacyErrors.gstFile}
          />
          {pharmacyErrors.gstFile && (
            <AppText style={styles.errorText}>{pharmacyErrors.gstFile}</AppText>
          )}
          
          <AppInput
            style={[styles.modalInput, { marginBottom: pharmacyErrors.gstNumber ? 5 : 10 }, pharmacyErrors.gstNumber && styles.inputError]}
            placeholder="GST number *"
            placeholderTextColor="#999"
            maxLength={15}
            autoCapitalize="characters"
            value={pharmacyForm.gstNumber}
            onChangeText={(text) => {
              setPharmacyForm(prev => ({ ...prev, gstNumber: text.toUpperCase() }));
              if (pharmacyErrors.gstNumber) {
                setPharmacyErrors(prev => ({ ...prev, gstNumber: null }));
              }
            }}
          />
          {pharmacyErrors.gstNumber && (
            <AppText style={styles.errorText}>{pharmacyErrors.gstNumber}</AppText>
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
                        setPharmacyForm(prev => ({
                          ...prev,
                          state: item.name,
                          stateId: item.id,
                          city: '',
                          cityId: null,
                          area: '',
                          areaId: null,
                        }));
                        setCities([]);
                        setAreas([]);
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
                        setPharmacyForm(prev => ({
                          ...prev,
                          city: item.name,
                          cityId: item.id,
                          area: '',
                          areaId: null,
                        }));
                        setAreas([]);
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
                        setPharmacyForm(prev => ({
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
});

export default AddNewPharmacyModal;
