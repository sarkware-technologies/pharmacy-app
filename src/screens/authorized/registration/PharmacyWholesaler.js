/* eslint-disable react/no-unstable-nested-components */
import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import { colors } from '../../../styles/colors';
import { CustomInput } from '../../../components';
import AddressInputWithLocation from '../../../components/AddressInputWithLocation';
import FileUploadComponent from '../../../components/FileUploadComponent';
import Calendar from '../../../components/icons/Calendar';
import ChevronLeft from '../../../components/icons/ChevronLeft';
import { customerAPI } from '../../../api/customer';
import { AppText, AppInput } from '../../../components';
import AddNewHospitalModal from './AddNewHospitalModal';
import AddNewDoctorModal from './AddNewDoctorModal';
import DoctorDeleteIcon from '../../../components/icons/DoctorDeleteIcon';
import FetchGst from '../../../components/icons/FetchGst';
import { usePincodeLookup } from '../../../hooks/usePincodeLookup';
import FloatingDateInput from '../../../components/FloatingDateInput';
import { validateField, isValidPAN, isValidGST, isValidEmail, isValidMobile, isValidPincode, createFilteredInputHandler, filterForField } from '../../../utils/formValidation';
import SearchableDropdownModal from '../../../components/modals/SearchableDropdownModal';

// Document types for file uploads
const DOC_TYPES = {
  LICENSE_20B: 4, // License Type ID for 20B
  LICENSE_21B: 6, // License Type ID for 21B
  PHARMACY_IMAGE: 1,
  PAN_CARD: 7,
  GST_CERTIFICATE: 2,
};

const PharmacyWholesalerForm = ({ onSaveDraftRef }) => {
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
    subCategoryId,
    mode,
    customerId,
    customerData: routeCustomerData,
    isStaging,
  } = route.params || {};
  // start of state ////////////////////////////////////////////////////////////////////////////////////////////////

  // Get logged-in user for assign functionality
  const loggedInUser = useSelector(state => state.auth.user);

  // Edit mode and onboard mode detection
  const isEditMode = mode === 'edit' || !!customerId;
  const isOnboardMode = mode === 'onboard';
  const [loadingCustomerData, setLoadingCustomerData] = useState(false);
  const isMounted = useRef(true);

  // State for license types fetched from API
  const [licenseTypes, setLicenseTypes] = useState({});

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
    stationCode: "",
    // Mapping
    hospitalCode: '',
    hospitalName: '',
    selectedCategory: 'groupCorporateHospital', // 'groupCorporateHospital', 'doctor', or ''
    selectedHospitals: [],
    selectedDoctors: [],

    // Customer group
    customerGroupId: 1,

    // Stockist Suggestions
    stockists: [{ name: '', code: '', city: '' }],
  });

  // Error state
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  // Dropdown data
  const [customerGroups, setCustomerGroups] = useState([]);
  const [areas, setAreas] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [searchCities, setSearchCities] = useState(null);
  const [uploadedAreas, setUploadedAreas] = useState([]); // [{ id, name }]
  // Pincode lookup hook
  const {
    areas: pincodeAreas,
    cities: pincodeCities,
    states: pincodeStates,
    loading: pincodeLoading,
    lookupByPincode,
    clearData,
  } = usePincodeLookup();
  // Local state for dropdown modals
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [showStationModal, setShowStationModal] = useState(false);


  // Date picker states
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


  // Modal states for hospital and pharmacy selectors
  const [showAddHospitalModal, setShowAddHospitalModal] = useState(false);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const otpSlideAnim = useRef(new Animated.Value(-50)).current;

  // Uploaded documents with full details
  const [uploadedDocs, setUploadedDocs] = useState([]);

  // Document IDs for API submission
  const [documentIds, setDocumentIds] = useState({
    license20b: null,
    license21b: null,
    pharmacyImage: null,
    pan: null,
    gst: null,
  });
  // end of state ////////////////////////////////////////////////////////////////////////////////////////////////


  // useeffect section////////////////////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    onSaveDraftRef?.(handleSaveAsDraft);
    return () => onSaveDraftRef?.(null);
  }, [onSaveDraftRef, handleSaveAsDraft]);

  useEffect(() => {
    if (verificationStatus.mobile || verificationStatus.email) {
      handleSaveAsDraft();
    }
  }, [verificationStatus.mobile, verificationStatus.email]);

  // Set navigation header - always hide default header, we use custom header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false, // Always hide default header, we use custom header
      headerBackTitleVisible: false,
    });
  }, [navigation]);

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

    // Load initial data (only customer groups and license types, no cities/states)
    loadInitialData();

    // Handle edit mode and onboard mode - fetch customer details
    if (isEditMode || isOnboardMode) {
      if (routeCustomerData) {
        // Use provided customer data
        populateFormFromCustomerData(routeCustomerData);
      } else if (customerId) {
        // Fetch customer details from API (same API for both edit and onboard)
        fetchCustomerDetailsForEdit();
      }
    }

    // Cleanup function to reset states when component unmounts
    return () => {
      isMounted.current = false;
      setLoading(false);
      setShowOTP({ mobile: false, email: false });
      setOtpValues({ mobile: ['', '', '', ''], email: ['', '', '', ''] });
      setOtpTimers({ mobile: 30, email: 30 });
      setVerificationStatus({
        mobile: false,
        email: false,
        pan: false,
        gst: false,
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-populate city, state, and area when pincode lookup completes
  useEffect(() => {
    // Map pincodeCities → cities
    if (Array.isArray(pincodeCities) && pincodeCities.length > 0) {
      const mappedCities = pincodeCities.map(c => ({
        id: c.id ?? c.value,
        name: c.name || c.cityName || c.city || c.label || '',
      }));
      setCities(mappedCities);

      // Auto-select the first city if none selected or cityId is falsy
      const firstCity = mappedCities[0];
      setFormData(prev => ({
        ...prev,
        city: prev.city || firstCity?.name || '',
        cityId: prev.cityId || firstCity?.id || '',
      }));
    }

    // Map pincodeStates → states
    if (Array.isArray(pincodeStates) && pincodeStates.length > 0) {
      const mappedStates = pincodeStates.map(s => ({
        id: s.id ?? s.value,
        name: s.name || s.stateName || s.state || s.label || '',
      }));
      setStates(mappedStates);

      // Auto-select the first state if none selected or stateId is falsy
      const firstState = mappedStates[0];
      setFormData(prev => ({
        ...prev,
        state: prev.state || firstState?.name || '',
        stateId: prev.stateId || firstState?.id || '',
      }));
    }

    // Map pincodeAreas → areas (this 'areas' variable is the component's local state)
    if (Array.isArray(pincodeAreas) && pincodeAreas.length > 0) {
      const mappedAreas = pincodeAreas.map(a => ({
        id: a.id ?? a.value,
        name: a.name || a.label || '',
        cityId: a.cityId || a.raw?.cityId || '',
      }));
      setAreas(mappedAreas);

      // Auto-select first area if none selected
      const firstArea = mappedAreas[0];
      setFormData(prev => ({
        ...prev,
        area: prev.area || firstArea?.name || '',
        areaId: prev.areaId || firstArea?.id || '',
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pincodeCities, pincodeStates, pincodeAreas]);

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

  // Check form validity whenever form data, document IDs, or verification status changes
  useEffect(() => {
    // Validate required fields
    let isValid = true;
    if (!formData.license20b) isValid = false;
    else if (!formData.license20bFile) isValid = false;
    else if (!formData.license20bExpiryDate) isValid = false;
    else if (!formData.license21b) isValid = false;
    else if (!formData.license21bFile) isValid = false;
    else if (!formData.license21bExpiryDate) isValid = false;
    else if (!formData.pharmacyImageFile) isValid = false;
    else if (!formData.pharmacyName) isValid = false;
    else if (!formData.stationCode) isValid = false;
    else if (!formData.address1) isValid = false;
    else if (!formData.address2) isValid = false;
    else if (!formData.address3) isValid = false;
    else if (!formData.area || formData.area.trim().length === 0) isValid = false;
    else if (!formData.pincode || !/^[1-9]\d{5}$/.test(formData.pincode)) isValid = false;
    else if (!formData.cityId) isValid = false;
    else if (!formData.stateId) isValid = false;
    else if (!formData.mobileNumber || formData.mobileNumber.length !== 10) isValid = false;
    else if (!verificationStatus.mobile) isValid = false;
    else if (!formData.emailAddress || !formData.emailAddress.includes('@')) isValid = false;
    else if (!verificationStatus.email) isValid = false;
    else if (!formData.panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) isValid = false;
    else if (!formData.panFile) isValid = false;
    else if (formData.gstNumber && !isValidGST(formData.gstNumber)) isValid = false;
    else if (formData.selectedDoctors.length === 0 && formData.selectedHospitals.length === 0) isValid = false;

    setIsFormValid(isValid);
  }, [formData, verificationStatus]);


  // funtion section//////////////////////////////////////////

  const handleCitySearch = async (text) => {
    try {
      const response = await customerAPI.getCitiesList({
        page: 1,
        limit: 50,
        search: text,
      });
      const cityList = response?.data?.cities || [];
      const formattedCities = cityList.map(city => ({
        id: Number(city.id),
        name: city.cityName,
      }));

      setSearchCities(formattedCities);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const addNewCity = async (cityName) => {
    if (!formData.stateId) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `Please select state to create city`,
        position: 'top',
      });
    }
    try {
      const response = await customerAPI.createCity({
        name: cityName,
        stateId: formData?.stateId, // based on PIN/state
      });

      if (response?.success) {
        Toast.show({
          type: 'success',
          text1: 'City Created',
          text2: `City created successfully`,
          position: 'top',
        });
      }
      const newCity = {
        id: Number(response?.data?.cities[0]?.id),
        name: response?.data?.cities[0]?.cityName,
      };
      setCities(prev => [newCity, ...prev]);
      setFormData(prev => ({
        ...prev,
        cityId: newCity.id,
        city: newCity.name,
      }));
      setSearchCities(null)

      setShowCityModal(false);
    } catch (e) {
      console.error('Add city failed', e);
    }
  };
  // Save as Draft handler - only sends filled fields
  const handleSaveAsDraft = (async () => {
    try {
      setLoading(true);

      // Build draft payload with only filled fields
      const buildDraftPayload = () => {
        const draftPayload = {
          typeId: typeId || 1,
          categoryId: categoryId || 2,
          subCategoryId: subCategoryId || 0,
          isMobileVerified: verificationStatus.mobile || false,
          isEmailVerified: verificationStatus.email || false,
          isExisting: false,
          isBuyer: true,
          customerGroupId: formData.customerGroupId || null,

          stationCode: formData.stationCode || null,

          ...(formData.stgCustomerId && {
            stgCustomerId: formData.stgCustomerId,
          }),
        };

        // Build generalDetails with only filled fields
        const generalDetails = {};
        if (formData.pharmacyName && formData.pharmacyName.trim()) {
          generalDetails.name = formData.pharmacyName.trim();
        }
        if (formData.shortName && formData.shortName.trim()) {
          generalDetails.shortName = formData.shortName.trim();
        }
        if (formData.address1 && formData.address1.trim()) {
          generalDetails.address1 = formData.address1.trim();
        }
        if (formData.address2 && formData.address2.trim()) {
          generalDetails.address2 = formData.address2.trim();
        }
        if (formData.address3 && formData.address3.trim()) {
          generalDetails.address3 = formData.address3.trim();
        }
        if (formData.address4 && formData.address4.trim()) {
          generalDetails.address4 = formData.address4.trim();
        }
        if (formData.pincode && formData.pincode.trim()) {
          const pincodeNum = parseInt(formData.pincode, 10);
          if (!isNaN(pincodeNum)) {
            generalDetails.pincode = pincodeNum;
          }
        }
        if (formData.area && formData.area.trim()) {
          generalDetails.area = formData.area.trim();
        }
        if (formData.areaId) {
          const areaIdNum = parseInt(formData.areaId, 10);
          if (!isNaN(areaIdNum)) {
            generalDetails.areaId = areaIdNum;
          }
        }
        if (formData.cityId) {
          const cityIdNum = parseInt(formData.cityId, 10);
          if (!isNaN(cityIdNum)) {
            generalDetails.cityId = cityIdNum;
          }
        }
        if (formData.stateId) {
          const stateIdNum = parseInt(formData.stateId, 10);
          if (!isNaN(stateIdNum)) {
            generalDetails.stateId = stateIdNum;
          }
        }

        // Always add generalDetails to ensure validation works
        draftPayload.generalDetails = generalDetails;

        // Build securityDetails with only filled fields
        const securityDetails = {};
        if (formData.mobileNumber && formData.mobileNumber.trim()) {
          securityDetails.mobile = formData.mobileNumber.trim();
        }
        if (formData.emailAddress && formData.emailAddress.trim()) {
          securityDetails.email = formData.emailAddress.trim();
        }
        if (formData.panNumber && formData.panNumber.trim()) {
          securityDetails.panNumber = formData.panNumber.trim();
        }
        if (formData.gstNumber && formData.gstNumber.trim()) {
          securityDetails.gstNumber = formData.gstNumber.trim();
        }

        // Only add securityDetails if it has at least one field
        if (Object.keys(securityDetails).length > 0) {
          draftPayload.securityDetails = securityDetails;
        }

        // Build licenceDetails with only filled fields
        const licenceDetails = {
          registrationDate: new Date().toISOString(),
          licence: [],
        };

        if (formData.license20b && formData.license20b.trim()) {
          licenceDetails.licence.push({
            licenceTypeId: licenseTypes.LICENSE_20B?.id || 2,
            licenceNo: formData.license20b.trim(),
            licenceValidUpto: formatDateForAPI(formData.license20bExpiryDate),
            hospitalCode: '',
          });
        }

        if (formData.license21b && formData.license21b.trim()) {
          licenceDetails.licence.push({
            licenceTypeId: licenseTypes.LICENSE_21B?.id || 4,
            licenceNo: formData.license21b.trim(),
            licenceValidUpto: formatDateForAPI(formData.license21bExpiryDate),
            hospitalCode: '',
          });
        }

        // Only add licenceDetails if it has at least one licence
        if (licenceDetails.licence.length > 0) {
          draftPayload.licenceDetails = licenceDetails;
        }

        // Add customerDocs if there are any uploaded documents
        if (uploadedDocs && uploadedDocs.length > 0) {
          draftPayload.customerDocs = uploadedDocs.map(doc => ({
            s3Path: doc.s3Path,
            docTypeId: String(doc.docTypeId),
            fileName: doc.fileName,
            id: String(doc.id || ''),
          }));
        }

        // Add mapping if there are selected hospitals or doctors
        if (formData.selectedHospitals && formData.selectedHospitals.length > 0) {
          draftPayload.mapping = {
            hospitals: formData.selectedHospitals.map(h => ({
              id: Number(h.id),
              isNew: false,
            })),
          };
        } else if (formData.selectedDoctors && formData.selectedDoctors.length > 0) {
          draftPayload.mapping = {
            doctors: formData.selectedDoctors.map(d => ({
              id: Number(d.id),
              isNew: false,
            })),
          };
        }

        // Add suggestedDistributors if there are any stockists
        if (formData.stockists && formData.stockists.length > 0 && formData.stockists[0].name) {
          draftPayload.suggestedDistributors = formData.stockists
            .filter(s => s.name && s.name.trim())
            .map(stockist => ({
              distributorCode: stockist.code || '',
              distributorName: stockist.name || '',
              city: stockist.city || '',
              customerId: stockist.name,
            }));
        }

        return draftPayload;
      };

      const draftPayload = buildDraftPayload();

      // Check if there's at least some data to save
      // Check if there's at least some data to save
      // First check the built payload
      const hasPayloadData =
        (draftPayload.generalDetails && Object.keys(draftPayload.generalDetails).length > 0) ||
        (draftPayload.securityDetails && Object.keys(draftPayload.securityDetails).length > 0) ||
        (draftPayload.licenceDetails && draftPayload.licenceDetails.licence && draftPayload.licenceDetails.licence.length > 0) ||
        (draftPayload.customerDocs && Array.isArray(draftPayload.customerDocs) && draftPayload.customerDocs.length > 0) ||
        (draftPayload.mapping && (draftPayload.mapping.hospitals || draftPayload.mapping.doctors || draftPayload.mapping.pharmacy)) ||
        (draftPayload.suggestedDistributors && Array.isArray(draftPayload.suggestedDistributors) && draftPayload.suggestedDistributors.length > 0);

      // Fallback: Check formData directly for any filled fields
      const hasFormData =
        (formData.pharmacyName && formData.pharmacyName.trim()) ||
        (formData.shortName && formData.shortName.trim()) ||
        (formData.stationCode) ||
        (formData.address1 && formData.address1.trim()) ||
        (formData.address2 && formData.address2.trim()) ||
        (formData.address3 && formData.address3.trim()) ||
        (formData.address4 && formData.address4.trim()) ||
        (formData.pincode && formData.pincode.trim()) ||
        (formData.area && formData.area.trim()) ||
        formData.areaId ||
        formData.cityId ||
        formData.stateId ||
        (formData.mobileNumber && formData.mobileNumber.trim()) ||
        (formData.emailAddress && formData.emailAddress.trim()) ||
        (formData.panNumber && formData.panNumber.trim()) ||
        (formData.gstNumber && formData.gstNumber.trim()) ||
        (formData.license20b && formData.license20b.trim()) ||
        (formData.license21b && formData.license21b.trim()) ||
        (uploadedDocs && uploadedDocs.length > 0) ||
        (formData.selectedHospitals && formData.selectedHospitals.length > 0) ||
        (formData.selectedDoctors && formData.selectedDoctors.length > 0) ||
        (formData.stockists && formData.stockists.length > 0 && formData.stockists.some(s => s.name || s.code || s.city));

      const hasData = hasPayloadData || hasFormData;

      if (!hasData) {
        Toast.show({
          type: 'info',
          text1: 'No Data',
          text2: 'Please fill at least one field before saving as draft',
          position: 'top',
        });
        setLoading(false);
        return;
      }

      const response = await customerAPI.saveCustomerDraft(draftPayload);

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Draft Saved',
          text2: 'Your registration has been saved as draft successfully',
          position: 'top',
        });

        if (!formData.stgCustomerId) {
          setFormData(prev => ({
            ...prev,
            stgCustomerId: response?.data?.data?.stgCustomerId,
          }));

        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Save Failed',
          text2: response.message || 'Failed to save draft. Please try again.',
          position: 'top',
        });
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to save draft. Please check your connection and try again.',
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  });

  // Load states and customer groups on mount
  const loadInitialData = async () => {
    try {
      // Load license types first
      const licenseResponse = await customerAPI.getLicenseTypes(
        typeId || 1,
        categoryId || 2,
      );
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

      // Note: States and cities are now loaded via pincode lookup only
    } catch (error) {
      console.error('Error loading initial data:', error);
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

  // Fetch customer details for edit mode and onboard mode (same API)
  const fetchCustomerDetailsForEdit = async () => {
    if (!customerId) return;

    setLoadingCustomerData(true);
    try {
      // For onboard mode, always use isStaging = false. For edit mode, use the passed value
      const useStaging = isOnboardMode ? false : (isStaging !== undefined ? isStaging : false);
      const response = await customerAPI.getCustomerDetails(customerId, useStaging);
      if (response.success && response.data) {
        populateFormFromCustomerData(response.data);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load customer details',
          position: 'top',
        });
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load customer details. Please try again.',
        position: 'top',
      });
    } finally {
      setLoadingCustomerData(false);
    }
  };

  // Populate form from customer data (API response)
  const populateFormFromCustomerData = (data) => {

    try {
      const generalDetails = data.generalDetails || {};
      const securityDetails = data.securityDetails || {};
      const licenceDetails = data.licenceDetails || {};
      const docType = data.docType || [];
      const mapping = data.mapping || {};
      const groupDetails = data.groupDetails || {};

      // Format date from API ISO format to ISO format (FloatingDateInput expects ISO)
      // Also handles invalid dates properly to prevent NaN/NAN/NAN
      const formatDate = (isoDate) => {
        if (!isoDate) return null;
        try {
          const date = new Date(isoDate);
          // Check if date is valid
          if (isNaN(date.getTime())) {
            console.warn('Invalid date received:', isoDate);
            return null;
          }
          // Return ISO format as FloatingDateInput expects ISO
          return date.toISOString();
        } catch (error) {
          console.error('Error formatting date:', error, isoDate);
          return null;
        }
      };

      // Helper function to find documents by type (handles both string and number doctypeId)
      const findDocByType = (docTypeId, docTypeName) => {
        return docType.find(d =>
          String(d.doctypeId) === String(docTypeId) ||
          d.doctypeName === docTypeName ||
          d.doctypeName?.toUpperCase() === docTypeName?.toUpperCase()
        );
      };

      // Find license documents (20B and 21B for Wholesaler) - also match by docTypeId
      const license20b = licenceDetails.licence?.find(l =>
        l.licenceTypeCode === 'LIC20B' ||
        l.licenceTypeName === '20B' ||
        String(l.docTypeId) === '4'
      );
      const license21b = licenceDetails.licence?.find(l =>
        l.licenceTypeCode === 'LIC21B' ||
        l.licenceTypeName === '21B' ||
        String(l.docTypeId) === '6'
      );

      // Find document files - use helper function for robust matching
      const license20bDoc = findDocByType('4', 'LICENCE 20B') ||
        (license20b?.docTypeId ? findDocByType(String(license20b.docTypeId), 'LICENCE 20B') : null);
      const license21bDoc = findDocByType('6', 'LICENCE 21B') ||
        (license21b?.docTypeId ? findDocByType(String(license21b.docTypeId), 'LICENCE 21B') : null);
      const pharmacyImageDoc = findDocByType('1', 'CLINIC IMAGE');
      const panDoc = findDocByType('7', 'PAN CARD');
      const gstDoc = findDocByType('2', 'GSTIN');

      // Populate form data
      setFormData(prev => ({
        ...prev,
        // License Details
        license20b: license20b?.licenceNo || '',
        license20bExpiryDate: formatDate(license20b?.licenceValidUpto),
        license20bFile: license20bDoc ? {
          id: license20bDoc.docId || '',
          docId: license20bDoc.docId || '',
          fileName: license20bDoc.fileName || 'LICENCE 20B',
          s3Path: license20bDoc.s3Path || '',
          uri: license20bDoc.s3Path || '',
          docTypeId: parseInt(license20bDoc.doctypeId) || 4,
        } : null,
        license21b: license21b?.licenceNo || '',
        license21bExpiryDate: formatDate(license21b?.licenceValidUpto),
        license21bFile: license21bDoc ? {
          id: license21bDoc.docId || '',
          docId: license21bDoc.docId || '',
          fileName: license21bDoc.fileName || 'LICENCE 21B',
          s3Path: license21bDoc.s3Path || '',
          uri: license21bDoc.s3Path || '',
          docTypeId: parseInt(license21bDoc.doctypeId) || 6,
        } : null,
        pharmacyImageFile: pharmacyImageDoc ? {
          id: pharmacyImageDoc.docId || '',
          docId: pharmacyImageDoc.docId || '',
          fileName: pharmacyImageDoc.fileName || 'CLINIC IMAGE',
          s3Path: pharmacyImageDoc.s3Path || '',
          uri: pharmacyImageDoc.s3Path || '',
          docTypeId: parseInt(pharmacyImageDoc.doctypeId) || 1,
        } : null,

        // General Details
        stationCode: data.stationCode || '',
        pharmacyName: generalDetails.customerName || '',
        shortName: generalDetails.shortName || '',
        address1: generalDetails.address1 || '',
        address2: generalDetails.address2 || '',
        address3: generalDetails.address3 || '',
        address4: generalDetails.address4 || '',
        pincode: String(generalDetails.pincode || ''),
        area: generalDetails.area || '',
        areaId: generalDetails.areaId ? String(generalDetails.areaId) : null,
        city: generalDetails.cityName || '',
        cityId: generalDetails.cityId ? String(generalDetails.cityId) : null,
        state: generalDetails.stateName || '',
        stateId: generalDetails.stateId ? String(generalDetails.stateId) : null,

        // Security Details
        mobileNumber: securityDetails.mobile || '',
        emailAddress: securityDetails.email || '',
        panNumber: securityDetails.panNumber || '',
        panFile: panDoc ? {
          id: panDoc.docId || '',
          docId: panDoc.docId || '',
          fileName: panDoc.fileName || 'PAN CARD',
          s3Path: panDoc.s3Path || '',
          uri: panDoc.s3Path || '',
          docTypeId: parseInt(panDoc.doctypeId) || 7,
        } : null,
        gstNumber: securityDetails.gstNumber || '',
        gstFile: gstDoc ? {
          id: gstDoc.docId || '',
          docId: gstDoc.docId || '',
          fileName: gstDoc.fileName || 'GSTIN',
          s3Path: gstDoc.s3Path || '',
          uri: gstDoc.s3Path || '',
          docTypeId: parseInt(gstDoc.doctypeId) || 2,
        } : null,

        // Customer group
        customerGroupId: groupDetails.customerGroupId || 1,

        // Stockist Suggestions
        stockists: data.suggestedDistributors?.map(dist => ({
          name: dist.distributorName || '',
          code: dist.distributorCode || '',
          city: dist.city || '',
        })) || [{ name: '', code: '', city: '' }],
      }));

      // Set document IDs for existing documents
      if (license20bDoc) {
        setDocumentIds(prev => ({ ...prev, license20b: license20bDoc.docId }));
      }
      if (license21bDoc) {
        setDocumentIds(prev => ({ ...prev, license21b: license21bDoc.docId }));
      }
      if (pharmacyImageDoc) {
        setDocumentIds(prev => ({ ...prev, pharmacyImage: pharmacyImageDoc.docId }));
      }
      if (panDoc) {
        setDocumentIds(prev => ({ ...prev, pan: panDoc.docId }));
      }
      if (gstDoc) {
        setDocumentIds(prev => ({ ...prev, gst: gstDoc.docId }));
      }

      // Set verification status
      setVerificationStatus({
        mobile: data.isMobileVerified || false,
        email: data.isEmailVerified || false,
        pan: !!panDoc,
        gst: !!gstDoc,
      });

      // Set uploaded documents
      // Set uploaded documents - include both id and docId for edit mode
      const uploadedDocsList = docType.map(doc => ({
        id: doc.docId, // Use docId as id for existing documents
        docId: doc.docId,
        docTypeId: parseInt(doc.doctypeId),
        fileName: doc.fileName,
        s3Path: doc.s3Path,
      }));
      setUploadedDocs(uploadedDocsList);

      // Trigger pincode lookup to populate area, city, state dropdowns
      if (generalDetails.pincode) {
        lookupByPincode(String(generalDetails.pincode));
      }

      // Handle mapping data (hospitals, doctors, pharmacies)
      if (mapping.hospitals && mapping.hospitals.length > 0) {
        setFormData(prev => ({
          ...prev,
          selectedCategory: 'groupCorporateHospital',
          selectedHospitals: mapping.hospitals.map(h => ({
            id: h.customerId,
            customerId: h.customerId,
            name: h.customerName,
            code: h.customerCode,
            cityName: h.cityName,
            stateName: h.stateName,
          })),
        }));
      }

      if (mapping.doctors && mapping.doctors.length > 0) {
        setFormData(prev => ({
          ...prev,
          selectedDoctors: mapping.doctors.map(d => ({
            id: d.customerId,
            customerId: d.customerId,
            name: d.customerName || d.name,
            code: d.customerCode,
          })),
        }));
      }

    } catch (error) {
      console.error('Error populating form from customer data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to populate form data',
        position: 'top',
      });
    }
  };

  // Handle pincode change and trigger lookup
  // Handle pincode change and trigger lookup
  const handlePincodeChange = async text => {
    // Filter pincode input to only allow digits
    const filtered = createFilteredInputHandler('pincode', null, 6)(text);
    // If filtered text is different, it means invalid characters were typed, so don't proceed
    if (filtered !== text && text.length > filtered.length) return;

    setFormData(prev => ({ ...prev, pincode: filtered }));
    setErrors(prev => ({ ...prev, pincode: null }));

    // If user is editing pincode manually, clear any OCR/upload-derived area list
    if (uploadedAreas && uploadedAreas.length > 0) {
      setUploadedAreas([]); // prefer manual lookup results from pincode
    }

    // Clear previous selections when pincode becomes incomplete
    if (filtered.length < 6) {
      setFormData(prev => ({
        ...prev,
        area: '',
        areaId: null,
        city: '',
        cityId: '',
        state: '',
        stateId: '',
      }));
      // clear hook data
      clearData();
      setAreas([]); // clear local areas too
      setCities([]);
      setStates([]);
      return;
    }

    // Trigger lookup when pincode is complete (6 digits)
    if (filtered.length === 6) {
      // call lookup and receive returned arrays (hook now returns them)
      const { areas: lkAreas = [], cities: lkCities = [], states: lkStates = [] } =
        (await lookupByPincode(filtered)) || {};

      // Apply to local component state so dropdowns read correct lists
      if (Array.isArray(lkAreas)) setAreas(lkAreas);
      if (Array.isArray(lkCities)) setCities(lkCities);
      if (Array.isArray(lkStates)) setStates(lkStates);

      // Auto-select first available values if form doesn't already have them
      setFormData(prev => {
        const next = { ...prev };

        if ((!next.cityId || !next.city) && Array.isArray(lkCities) && lkCities.length > 0) {
          next.city = lkCities[0].name || '';
          next.cityId = lkCities[0].id || '';
        }

        if ((!next.stateId || !next.state) && Array.isArray(lkStates) && lkStates.length > 0) {
          next.state = lkStates[0].name || '';
          next.stateId = lkStates[0].id || '';
        }

        if ((!next.areaId || !next.area) && Array.isArray(lkAreas) && lkAreas.length > 0) {
          next.area = lkAreas[0].name || '';
          next.areaId = lkAreas[0].id || '';
        }

        return next;
      });

      // clear any related errors
      setErrors(prev => ({
        ...prev,
        pincode: null,
        cityId: null,
        stateId: null,
        area: null,
      }));
    }
  };


  const handleVerify = async field => {
    // Validate the field before showing OTP
    if (
      field === 'mobile' &&
      (!formData.mobileNumber ||
        !/^[6-9]\d{9}$/.test(formData.mobileNumber))
    ) {
      setErrors(prev => ({
        ...prev,
        mobileNumber: 'Please enter valid 10-digit mobile number',
      }));
      return;
    }
    if (
      field === 'email' &&
      (!formData.emailAddress ||
        !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.emailAddress))
    ) {
      setErrors(prev => ({
        ...prev,
        emailAddress: 'Please enter a valid email address',
      }));
      return;
    }

    // Reset OTP state for this field before generating new OTP
    setOtpValues(prev => ({ ...prev, [field]: ['', '', '', ''] }));
    setOtpTimers(prev => ({ ...prev, [field]: 30 }));
    setShowOTP(prev => ({ ...prev, [field]: false }));

    try {
      setLoadingOtp(prev => ({ ...prev, [field]: true }));

      const payload = {};

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
          position: 'top',
        });



        // Animate OTP container
        Animated.spring(otpSlideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }).start();


        setErrors(prev => ({
          ...prev,
          [`${field}Verification`]: null,
        }));
      } else {
        // Check for existing customer
        if (
          !response.success &&
          response.data &&
          Array.isArray(response.data)
        ) {
          const existingCustomer = response.data[0];
          Toast.show({
            type: 'error',
            text1: 'Customer Exists',
            text2: `Customer already exists with this ${field}`,
            position: 'top',
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
            position: 'top',
          });
        }
      }
    } catch (error) {
      console.error('Error generating OTP:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        position: 'top',
        text2:
          error.response?.data?.message ||
          error.message ||
          'Failed to send OTP. Please try again.',
      });
    } finally {
      setLoadingOtp(prev => ({ ...prev, [field]: false }));
    }
  };

  // Handles both ISO format and DD/MM/YYYY format dates
  const formatDateForAPI = date => {
    if (!date) return null;
    try {
      let d;
      // If date is in DD/MM/YYYY format (from FloatingDateInput display)
      if (typeof date === 'string' && date.includes('/') && !date.includes('T')) {
        const [day, month, year] = date.split('/');
        d = new Date(Number(year), Number(month) - 1, Number(day));
      } else {
        // ISO format or Date object
        d = new Date(date);
      }

      // Check if date is valid
      if (isNaN(d.getTime())) {
        console.warn('Invalid date for API:', date);
        return null;
      }

      // Add time component to avoid timezone issues
      d.setHours(23, 59, 59, 999);
      return d.toISOString();
    } catch (error) {
      console.error('Error formatting date for API:', error, date);
      return null;
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

      const payload = {};

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
          text2: `${field === 'mobile' ? 'Mobile' : 'Email'
            } verified successfully!`,
          position: 'top',

        });

        setShowOTP(prev => ({ ...prev, [field]: false }));
        setVerificationStatus(prev => ({ ...prev, [field]: true }));

        // Reset OTP values for this field
        setOtpValues(prev => ({
          ...prev,
          [field]: ['', '', '', ''],
        }));

        // Reset OTP timer
        setOtpTimers(prev => ({
          ...prev,
          [field]: 30,
        }));
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.message || 'Invalid OTP. Please try again.',
          position: 'top',
        });
      }
    } catch (error) {
      console.error('Error validating OTP:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2:
          error.response?.data?.message ||
          error.message ||
          'Failed to verify OTP. Please try again.',
        position: 'top',

      });
    } finally {
      setLoadingOtp(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleResendOTP = async field => {
    setOtpTimers(prev => ({ ...prev, [field]: 30 }));
    await handleVerify(field);
  };

  const renderOTPInput = field => {
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
              ref={ref => {
                otpRefs.current[`otp-${field}-${index}`] = ref;
              }}
              style={styles.otpInput}
              value={otpValues[field][index]}
              onChangeText={value => handleOtpChange(field, index, value)}
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

  const handleFileUpload = async (field, file) => {
    // keep original behaviour for document Ids and formData
    if (file && (file.id || file.docId)) {
      const fileId = file.id || file.docId;
      setDocumentIds(prev => ({ ...prev, [field.replace('File', '')]: fileId }));
    }
    setFormData(prev => ({ ...prev, [field]: file }));
    setErrors(prev => ({ ...prev, [field]: null }));

    // Add complete document object to uploaded list with docTypeId
    // For edit mode: include docId if it's an existing file
    if (file && (file.id || file.docId)) {
      const docObject = {
        s3Path: file.s3Path || file.uri,
        docTypeId: file.docTypeId,
        fileName: file.fileName || file.name,
        id: file.id || file.docId, // Use id for new uploads, docId for existing files
        ...(file.docId ? { docId: file.docId } : {}), // Include docId if it exists
      };
      // Remove old doc if it exists (for edit mode file replacement)
      if (isEditMode && file.docId) {
        setUploadedDocs(prev => prev.filter(doc => doc.docId !== file.docId && doc.id !== file.docId));
      }
      setUploadedDocs(prev => [...prev, docObject]);
    }

    // --- NEW: parse locationDetails (if present) and populate Area / City / State / Pincode ---
    const locationDetails =
      (file && file.locationDetails) ||
      (file &&
        file.response &&
        file.response.data &&
        file.response.data[0] &&
        file.response.data[0].locationDetails) ||
      (file && file.data && file.data[0] && file.data[0].locationDetails) ||
      null;

    try {
      const updates = {};

      if (locationDetails) {
        // Build cities array
        const ldCities = Array.isArray(locationDetails.cities)
          ? locationDetails.cities.map(c => ({
            id: c.value ?? c.id ?? c.value,
            name:
              c.label ||
              c.name ||
              c.city ||
              (c.label && String(c.label)) ||
              '',
            raw: c,
          }))
          : [];

        // Build states array
        const ldStates = Array.isArray(locationDetails.states)
          ? locationDetails.states.map(s => ({
            id: s.value ?? s.id ?? s.value,
            name: s.label || s.name || s.state || '',
            gstCode: s.gstCode,
            raw: s,
          }))
          : [];

        // Build areas: if cities array present, take first city -> its area list
        let ldAreas = [];
        if (
          Array.isArray(locationDetails.cities) &&
          locationDetails.cities.length > 0
        ) {
          const firstCity = locationDetails.cities[0];
          if (Array.isArray(firstCity.area)) {
            ldAreas = firstCity.area.map(a => ({
              id: a.value ?? a.id ?? a.value,
              name: a.label || a.name || '',
              raw: a,
            }));
          }
        }

        // Apply them to component state (so modal dropdowns can use them)
        if (ldCities.length > 0) setCities(ldCities);
        if (ldStates.length > 0) setStates(ldStates);
        if (ldAreas.length > 0) setUploadedAreas(ldAreas);

        // Prefer OCR'd textual City/State/Area if present on the file object
        const uploadedCityName = (file && (file.City || file.city)) || null;
        const uploadedStateName = (file && (file.State || file.state)) || null;
        const uploadedAreaName = (file && (file.Area || file.area)) || null;

        // City
        if (ldCities.length > 0) {
          const matchCity = uploadedCityName
            ? ldCities.find(
              c =>
                c.name &&
                c.name.toLowerCase() ===
                String(uploadedCityName).toLowerCase(),
            )
            : null;
          const chosenCity = matchCity || ldCities[0];
          if (chosenCity) {
            updates.city = chosenCity.name || '';
            updates.cityId = chosenCity.id || '';
          }
        }

        // State
        if (ldStates.length > 0) {
          const matchState = uploadedStateName
            ? ldStates.find(
              s =>
                s.name &&
                s.name.toLowerCase() ===
                String(uploadedStateName).toLowerCase(),
            )
            : null;
          const chosenState = matchState || ldStates[0];
          if (chosenState) {
            updates.state = chosenState.name || '';
            updates.stateId = chosenState.id || '';
          }
        }

        // Area
        if (ldAreas.length > 0) {
          const matchArea = uploadedAreaName
            ? ldAreas.find(
              a =>
                a.name &&
                a.name.toLowerCase() ===
                String(uploadedAreaName).toLowerCase(),
            )
            : null;
          const chosenArea = matchArea || ldAreas[0];
          if (chosenArea) {
            updates.area = chosenArea.name || '';
            updates.areaId = chosenArea.id || '';
          }
        }
      }

      // If the upload response also provided a Pincode (many responses use capital 'Pincode'), set it
      const uploadedPincode =
        (file &&
          (file.Pincode ||
            file.pincode ||
            (file.response &&
              file.response.data &&
              file.response.data[0] &&
              (file.response.data[0].Pincode ||
                file.response.data[0].pincode)))) ||
        null;

      if (uploadedPincode && /^\d{6}$/.test(String(uploadedPincode))) {
        updates.pincode = String(uploadedPincode);
      }

      // Apply updates gathered so far (city/state/area/pincode)
      if (Object.keys(updates).length > 0) {
        setFormData(prev => ({ ...prev, ...updates }));
        const clearErrs = {};
        if (updates.areaId) clearErrs.area = null;
        if (updates.cityId) clearErrs.cityId = null;
        if (updates.stateId) clearErrs.stateId = null;
        if (updates.pincode) clearErrs.pincode = null;
        setErrors(prev => ({ ...prev, ...clearErrs }));
      }

      // If there's a valid pincode extracted from the uploaded file, trigger lookupByPincode immediately
      const finalPincode =
        updates.pincode || (file && (file.Pincode || file.pincode));
      if (finalPincode && /^\d{6}$/.test(String(finalPincode))) {
        try {
          console.log(
            'handleFileUpload: calling lookupByPincode with',
            String(finalPincode),
          );
          // call with string — lookup hook should accept string or number
          await lookupByPincode(String(finalPincode));

          // after lookup completes, if hook provided arrays and the form doesn't yet have selections,
          // auto-select first available items so UI updates immediately
          // (use the hook values: areas, pincodeCities, pincodeStates)
          setFormData(prev => {
            const next = { ...prev };
            if (
              (!next.cityId || !next.city) &&
              Array.isArray(pincodeCities) &&
              pincodeCities.length > 0
            ) {
              const fc = pincodeCities[0];
              next.city = fc.name || fc.city || fc.cityName || '';
              next.cityId = fc.id || fc.value || '';
            }
            if (
              (!next.stateId || !next.state) &&
              Array.isArray(pincodeStates) &&
              pincodeStates.length > 0
            ) {
              const fs = pincodeStates[0];
              next.state = fs.name || fs.state || fs.stateName || '';
              next.stateId = fs.id || fs.value || '';
            }
            if (
              (!next.areaId || !next.area) &&
              Array.isArray(areas) &&
              areas.length > 0
            ) {
              const fa = areas[0];
              next.area = fa.name || '';
              next.areaId = fa.id || '';
            }
            return next;
          });
        } catch (err) {
          console.error('lookupByPincode failed in handleFileUpload:', err);
        }
      }
    } catch (err) {
      console.warn('Failed to apply locationDetails from upload:', err);
    }
  };

  const handleFileDelete = field => {
    const file = formData[field];
    // Handle both new uploads (file.id) and existing files from edit mode (file.docId)
    if (file && (file.id || file.docId)) {
      const fileId = file.id || file.docId;
      setUploadedDocs(prev => prev.filter(doc => doc.id !== fileId && doc.docId !== fileId));
    }
    setFormData(prev => ({ ...prev, [field]: null }));
    setDocumentIds(prev => ({ ...prev, [field]: null }));
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  // Helper function to split address into address1, address2, address3
  const splitAddress = (address) => {
    if (!address) return { address1: '', address2: '', address3: '' };

    // Split by commas first
    const parts = address.split(',').map(part => part.trim()).filter(part => part.length > 0);

    if (parts.length >= 3) {
      return {
        address1: parts[0],
        address2: parts.slice(1, -1).join(', '),
        address3: parts[parts.length - 1],
      };
    } else if (parts.length === 2) {
      return {
        address1: parts[0],
        address2: parts[1],
        address3: '',
      };
    } else if (parts.length === 1) {
      // If no commas, try to split by length (approximately 50 chars each)
      const addr = parts[0];
      if (addr.length > 100) {
        return {
          address1: addr.substring(0, 50).trim(),
          address2: addr.substring(50, 100).trim(),
          address3: addr.substring(100).trim(),
        };
      } else if (addr.length > 50) {
        return {
          address1: addr.substring(0, 50).trim(),
          address2: addr.substring(50).trim(),
          address3: '',
        };
      } else {
        return {
          address1: addr,
          address2: '',
          address3: '',
        };
      }
    }

    return { address1: '', address2: '', address3: '' };
  };

  const handleLicenseOcrData = async (ocrData) => {
    console.log('OCR Data Received:', ocrData);

    const updates = {};

    // Populate pharmacy name if available
    if (ocrData.pharmacyName && !formData.pharmacyName) {
      updates.pharmacyName = filterForField('pharmacyName', ocrData.pharmacyName, 40);
    }

    // Split and populate address fields if available
    if (ocrData.address) {
      const addressParts = splitAddress(ocrData.address);
      if (!formData.address1 && addressParts.address1) {
        updates.address1 = filterForField('address1', addressParts.address1, 40);

      }
      if (!formData.address2 && addressParts.address2) {
        updates.address2 = filterForField('address2', addressParts.address2, 40);
      }
      if (!formData.address3 && addressParts.address3) {
        updates.address3 = filterForField('address3', addressParts.address3, 60);
      }
    }



    // License number
    const licenseMap = {

      LIC20B: { number: 'license20b', expiry: 'license20bExpiryDate' },
      LIC21B: { number: 'license21b', expiry: 'license21bExpiryDate' },
    };

    const map = licenseMap[ocrData.doctypeCode];

    if (map) {
      // License Number
      if (ocrData.licenseNumber) {
        updates[map.number] = filterForField(map.number, ocrData.licenseNumber, 50);
      }

      // Expiry Date
      if (ocrData.expiryDate) {
        const [dd, mm, yyyy] = ocrData.expiryDate.split('-');
        if (dd && mm && yyyy) {
          updates[map.expiry] = `${yyyy}-${mm}-${dd}`;
        }
      }
    }

    const location = ocrData.locationDetails;

    if (location) {
      // Build CITIES (flat)
      const extractedCities = Array.isArray(location.cities)
        ? location.cities.map(c => ({
          id: c.value,
          name: c.label,
        }))
        : [];

      // Build STATES (flat)
      const extractedStates = Array.isArray(location.states)
        ? location.states.map(s => ({
          id: s.value,
          name: s.label,
          gstCode: s.gstCode,
        }))
        : [];

      // Build AREAS (take from first city)
      let extractedAreas = [];
      if (
        Array.isArray(location.cities) &&
        location.cities.length > 0 &&
        Array.isArray(location.cities[0].area)
      ) {
        extractedAreas = location.cities[0].area.map(a => ({
          id: a.value,
          name: a.label,
          cityId: location.cities[0].value,
        }));
      }

      // UPDATE STATE VALUES DIRECTLY (NO API CALL)
      setCities(extractedCities);
      setStates(extractedStates);
      setAreas(extractedAreas);

      // Set selected values if not already filled
      if (extractedCities.length > 0) {
        updates.city = extractedCities[0].name;
        updates.cityId = extractedCities[0].id;
      }

      if (extractedStates.length > 0) {
        updates.state = extractedStates[0].name;
        updates.stateId = extractedStates[0].id;
      }

      if (extractedAreas.length > 0) {
        updates.area = extractedAreas[0].name;
        updates.areaId = extractedAreas[0].id;
      }
    }

    // Pincode — use directly, no lookup
    if (ocrData.Pincode || ocrData.pincode) {
      updates.pincode = filterForField('pincode', String(ocrData.Pincode || ocrData.pincode), 6);;
    }

    // Apply all updates first
    if (Object.keys(updates).length > 0) {
      setFormData(prev => ({ ...prev, ...updates }));
      // Clear errors for auto-populated fields
      const errorUpdates = {};
      Object.keys(updates).forEach(key => {
        errorUpdates[key] = null;
      });
      setErrors(prev => ({ ...prev, ...errorUpdates }));
    }

    // Trigger pincode lookup if pincode is available and valid (6 digits)
    if (ocrData.pincode && /^\d{6}$/.test(ocrData.pincode)) {
      await lookupByPincode(ocrData.pincode);
    }
  };


  const validateForm = () => {
    const newErrors = {};

    // Validate required fields
    if (!formData.license20b)
      newErrors.license20b = 'License 20B number is required';
    if (!formData.license20bFile)
      newErrors.license20bFile = 'License 20B upload is required';
    if (!formData.license20bExpiryDate)
      newErrors.license20bExpiryDate = 'License 20B expiry date is required';
    if (!formData.license21b)
      newErrors.license21b = 'License 21B number is required';
    if (!formData.license21bFile)
      newErrors.license21bFile = 'License 21B upload is required';
    if (!formData.license21bExpiryDate)
      newErrors.license21bExpiryDate = 'License 21B expiry date is required';
    if (!formData.pharmacyImageFile)
      newErrors.pharmacyImageFile = 'Pharmacy image is required';

    if (!formData.stationCode)
      newErrors.stationCode = 'Station Code is required';

    // General Details validation using reusable validation utility
    const nameOfPharmacyError = validateField('nameOfPharmacy', formData.pharmacyName, true, 'Pharmacy name is required');
    if (nameOfPharmacyError) newErrors.pharmacyName = nameOfPharmacyError;

    const address1Error = validateField('address1', formData.address1, true, 'Address 1 is required');
    if (address1Error) newErrors.address1 = address1Error;

    const address2Error = validateField('address2', formData.address2, true, 'Address 2 is required');
    if (address2Error) newErrors.address2 = address2Error;

    const address3Error = validateField('address3', formData.address3, true, 'Address 3 is required');
    if (address3Error) newErrors.address3 = address3Error;

    const pincodeError = validateField('pincode', formData.pincode, true, 'Valid 6-digit pincode is required');
    if (pincodeError) newErrors.pincode = pincodeError;

    const areaError = validateField('area', formData.area, true, 'Area is required');
    if (areaError) newErrors.area = areaError;

    if (!formData.cityId) newErrors.city = 'City is required';
    if (!formData.stateId) newErrors.state = 'State is required';

    // Security Details validation using reusable validation utility
    const mobileError = validateField('mobileNo', formData.mobileNumber, true, 'Valid 10-digit mobile number is required');
    if (mobileError) newErrors.mobileNumber = mobileError;
    if (!verificationStatus.mobile)
      newErrors.mobileVerification = 'Mobile number verification is required';

    const emailError = validateField('emailAddress', formData.emailAddress, true, 'Valid email address is required');
    if (emailError) newErrors.emailAddress = emailError;
    if (!verificationStatus.email)
      newErrors.emailVerification = 'Email verification is required';

    const panError = validateField('panNo', formData.panNumber, true, 'Valid PAN number is required (e.g., ABCDE1234F)');
    if (panError) newErrors.panNumber = panError;

    if (formData.gstNumber) {
      const gstError = validateField('gstNo', formData.gstNumber, false, 'GST number must be valid (e.g., 27ASDSD1234F1Z5)');
      if (gstError) newErrors.gstNumber = gstError;
    }

    if (!formData.panFile) {
      newErrors.panFile = 'PAN document is required';
    }

    if (
      formData.selectedDoctors.length === 0 && formData.selectedHospitals.length === 0
    ) {
      newErrors.mapping = "Mapping is required";
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    if (isEditMode || isOnboardMode) {
      // In edit mode or onboard mode, navigate to CustomerStack which contains CustomerList
      // Use goBack() to preserve tab bar visibility
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    } else {
      // In registration mode, show cancel confirmation modal
      setShowCancelModal(true);
    }
  };

  // Handle assign to customer (onboard functionality)
  const handleAssignToCustomer = async () => {
    try {
      setLoading(true);

      // Prepare the onboard payload with only editable fields
      const payload = {
        customerId: customerId,
        distributorId: loggedInUser?.distributorId || 1,
        updatedFields: {
          // Only send fields that were editable
          address1: formData.address1,
          address2: formData.address2,
          address3: formData.address3,
          address4: formData.address4,
          pincode: formData.pincode,
          area: formData.area,
          mobileNumber: formData.mobileNumber,
          emailAddress: formData.emailAddress,
        },
      };

      // Call onboard API
      const response = await customerAPI.onboardCustomer(payload, isStaging);

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Customer assigned successfully!',
          position: 'top',
        });

        setTimeout(() => {
          // Use goBack() to preserve tab bar visibility
          if (navigation.canGoBack()) {
            navigation.goBack();
          }
        }, 1500);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.message || 'Failed to assign customer',
          position: 'top',
        });
      }
    } catch (error) {
      console.error('Error assigning customer:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'An error occurred while assigning customer',
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };


  const handleRegister = async () => {
    console.log('handleRegister is called');
    if (!validateForm()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill all required fields and complete verifications',
        position: 'top',
      });
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    setLoading(true);

    try {
      // Prepare customerDocs array with proper structure
      const prepareCustomerDocs = () => {
        return uploadedDocs.map(doc => ({
          s3Path: doc.s3Path,
          docTypeId: String(doc.docTypeId),
          fileName: doc.fileName,
          ...(isEditMode && customerId ? {
            customerId: String(customerId),
            id: String(doc.docId || doc.id || ''),
          } : {
            id: String(doc.id || ''),
          }),
        }));
      };

      // Prepare registration payload
      const registrationData = {
        typeId: typeId || 1,
        categoryId: categoryId || 2,
        subCategoryId: subCategoryId || 0,
        isMobileVerified: verificationStatus.mobile,
        isEmailVerified: verificationStatus.email,
        isExisting: false,
        ...(formData.stgCustomerId && {
          stgCustomerId: formData.stgCustomerId,
        }),
        licenceDetails: {
          registrationDate: new Date().toISOString(),
          licence: [
            {
              licenceTypeId: licenseTypes.LICENSE_20B?.id || 2,
              licenceNo: formData.license20b,
              licenceValidUpto: formatDateForAPI(formData.license20bExpiryDate),
              hospitalCode: '',
            },
            {
              licenceTypeId: licenseTypes.LICENSE_21B?.id || 4,
              licenceNo: formData.license21b,
              licenceValidUpto: formatDateForAPI(formData.license21bExpiryDate),
              hospitalCode: '',
            },
          ],
        },
        customerDocs: prepareCustomerDocs(),
        isBuyer: true,
        customerGroupId: formData.customerGroupId,
        stationCode: formData.stationCode,
        generalDetails: {
          name: formData.pharmacyName,
          shortName: formData.shortName || '',
          address1: formData.address1,
          address2: formData.address2 || '',
          address3: formData.address3 || '',
          address4: formData.address4 || '',
          pincode: parseInt(formData.pincode, 10),
          area: formData.area || '',
          areaId: formData.areaId ? parseInt(formData.areaId, 10) : null,
          cityId: parseInt(formData.cityId, 10),
          stateId: parseInt(formData.stateId, 10),
          ownerName: '',
          clinicName: '',
        },
        securityDetails: {
          mobile: formData.mobileNumber,
          email: formData.emailAddress,
          panNumber: formData.panNumber,
          ...(formData.gstNumber ? { gstNumber: formData.gstNumber } : {}),
        },
        mapping:
          formData.selectedHospitals?.length > 0
            ? {
              hospitals: formData.selectedHospitals.map(h => ({
                id: Number(h.id),
                isNew: false,
              })),
            }
            : formData.selectedDoctors?.length > 0
              ? {
                doctors: formData.selectedDoctors.map(d => ({
                  id: Number(d.id),
                  isNew: false,
                })),
              }
              : undefined,
        ...(formData.stockists &&
          formData.stockists.length > 0 && {
          suggestedDistributors: formData.stockists.map(stockist => ({
            distributorCode: stockist.code || '',
            distributorName: stockist.name || '',
            city: stockist.city || '',
            customerId: isEditMode && customerId ? parseInt(customerId, 10) : stockist.name,
          })),
        }),
        isChildCustomer: false,
        ...(isEditMode && customerId ? { customerId: parseInt(customerId, 10) } : {}),
      };

      console.log(isEditMode ? 'Update data:' : 'Registration data:', registrationData);

      let response;
      if (isEditMode && customerId) {
        // Update existing customer - use POST to create endpoint with customerId in payload
        response = await customerAPI.createCustomer(registrationData);
      } else {
        // Create new customer
        response = await customerAPI.createCustomer(registrationData);
      }

      console.log(response, 'response');

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: isEditMode ? 'Update Successful' : 'Registration Successful',
          text2: response.message || (isEditMode ? 'Customer details updated successfully' : 'Customer registered successfully'),
          position: 'top',
        });

        // Navigate to success screen for both create and edit
        navigation.navigate('RegistrationSuccess', {
          type: 'pharmacy',
          registrationCode: isEditMode ? customerId : (response.data?.id || 'SUCCESS'),
          codeType: 'Pharmacy',
          ...(isEditMode ? { isEditMode: true } : { customerId: response.data?.id }),
        });
      } else {
        // Handle validation errors
        if (response.message && Array.isArray(response.message)) {
          const errorMessage = response.message.join('\n');
          Toast.show({
            type: 'error',
            text1: 'Registration Failed',
            text2: errorMessage,
            position: 'top',
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Registration Failed',
            position: 'top',

            text2:
              response.details ||
              'Failed to register pharmacy. Please try again.',
          });
        }
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


  const handleAddStockist = () => {
    if (formData.stockists.length >= 4) {
      Toast.show({
        type: 'error',
        text1: 'Limit Reached',
        text2: 'You can only add up to 4 stockists.',
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      stockists: [...prev.stockists, { name: '', code: '', city: '' }],
    }));
  };

  const handleRemoveStockist = index => {
    setFormData(prev => ({
      ...prev,
      stockists: prev.stockists.filter((_, i) => i !== index),
    }));
  };

  const handleStockistChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      stockists: prev.stockists.map((stockist, i) =>
        i === index ? { ...stockist, [field]: value } : stockist,
      ),
    }));
  };



  // Show loading indicator while fetching customer data
  if (loadingCustomerData) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText style={{ marginTop: 16, color: '#666' }}>Loading customer details...</AppText>
        </View>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      {/* Custom Header - Only for Edit/Onboard Mode */}
      {(isEditMode || isOnboardMode) && (
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ChevronLeft />
          </TouchableOpacity>
          <AppText style={styles.headerTitle}>
            {isOnboardMode ? 'Registration-Existing' : 'Edit'}
          </AppText>
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.flexContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            isEditMode && { paddingHorizontal: 16 }
          ]}
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
            <View style={[styles.section, styles.sectionTopSpacing]}>
              <AppText style={styles.sectionTitle}>
                License Details<AppText style={styles.asteriskRed}>*</AppText>
              </AppText>

              {/* 20B License */}
              <View style={styles.licenseRow}>
                <AppText style={styles.licenseNumber}>
                  20B<AppText style={styles.asteriskRed}>*</AppText>
                </AppText>
                <Icon
                  name="info-outline"
                  size={16}
                  color={colors.textSecondary}
                />
              </View>

              <FileUploadComponent
                placeholder="Upload 20B license"
                accept={['pdf', 'jpg', 'png', 'jpeg']}
                maxSize={15 * 1024 * 1024}
                docType={licenseTypes.LICENSE_20B?.docTypeId || 4}
                initialFile={formData.license20bFile}
                onFileUpload={file => handleFileUpload('license20bFile', file)}
                onFileDelete={() => handleFileDelete('license20bFile')}
                onOcrDataExtracted={handleLicenseOcrData}
                errorMessage={errors.license20bFile}
              />

              <CustomInput
                placeholder="Drug license number"
                value={formData.license20b}
                onChangeText={createFilteredInputHandler('license20b', (text) => {
                  setFormData(prev => ({ ...prev, license20b: text }));
                  setErrors(prev => ({ ...prev, license20b: null }));
                }, 50)}
                mandatory={true}
                error={errors.license20b}
              />
              <FloatingDateInput
                label="Expiry Date"
                mandatory={true}
                value={formData.license20bExpiryDate}
                error={errors.license20bExpiryDate}
                minimumDate={new Date()}    // If future date only (optional)
                onChange={(date) => {
                  setFormData(prev => ({ ...prev, license20bExpiryDate: date }));
                  setErrors(prev => ({ ...prev, license20bExpiryDate: null }));
                }}
              />



              {/* 21B License */}
              <View style={styles.licenseRow}>
                <AppText style={styles.licenseNumber}>
                  21B<AppText style={styles.asteriskRed}>*</AppText>
                </AppText>
                <Icon
                  name="info-outline"
                  size={16}
                  color={colors.textSecondary}
                />
              </View>

              <FileUploadComponent
                placeholder="Upload 21B license"
                accept={['pdf', 'jpg', 'png', 'jpeg']}
                maxSize={15 * 1024 * 1024}
                docType={licenseTypes.LICENSE_21B?.docTypeId || 6}
                initialFile={formData.license21bFile}
                onFileUpload={file => handleFileUpload('license21bFile', file)}
                onFileDelete={() => handleFileDelete('license21bFile')}
                onOcrDataExtracted={handleLicenseOcrData}
                errorMessage={errors.license21bFile}
              />

              <CustomInput
                placeholder="Drug license number"
                value={formData.license21b}
                onChangeText={createFilteredInputHandler('license21b', (text) => {
                  setFormData(prev => ({ ...prev, license21b: text }));
                  setErrors(prev => ({ ...prev, license21b: null }));
                }, 50)}
                mandatory={true}
                error={errors.license21b}
              />



              <FloatingDateInput
                label="Expiry Date"
                mandatory={true}
                value={formData.license21bExpiryDate}
                error={errors.license21bExpiryDate}
                minimumDate={new Date()}    // If future date only (optional)
                onChange={(date) => {
                  setFormData(prev => ({ ...prev, license21bExpiryDate: date }));
                  setErrors(prev => ({ ...prev, license21bExpiryDate: null }));
                }}
              />
            </View>

            <View style={styles.section}>
              <AppText style={styles.sectionSubTitle}>
                Pharmacy Image<AppText style={styles.asteriskRed}>*</AppText>
              </AppText>

              {/* Pharmacy Image */}
              <FileUploadComponent
                placeholder="Upload"
                accept={['jpg', 'png', 'jpeg']}
                maxSize={15 * 1024 * 1024}
                docType={DOC_TYPES.PHARMACY_IMAGE}
                initialFile={formData.pharmacyImageFile}
                onFileUpload={file =>
                  handleFileUpload('pharmacyImageFile', file)
                }
                onFileDelete={() => handleFileDelete('pharmacyImageFile')}
                errorMessage={errors.pharmacyImageFile}
              />
            </View>

            {/* General Details Section */}
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>
                General Details<AppText style={styles.asteriskRed}>*</AppText>
              </AppText>

              <CustomInput
                placeholder="Name of the Pharmacy"
                value={formData.pharmacyName}
                onChangeText={createFilteredInputHandler('pharmacyName', (text) => {
                  setFormData(prev => ({ ...prev, pharmacyName: text }));
                  setErrors(prev => ({ ...prev, pharmacyName: null }));
                }, 40)}
                mandatory={true}
                error={errors.pharmacyName}
              />

              <CustomInput
                placeholder="Enter OP, IP, Cathlab etc"
                value={formData.shortName}
                onChangeText={createFilteredInputHandler('opIpCathlab', (text) =>
                  setFormData(prev => ({ ...prev, shortName: text })), 30
                )}
              />

              {/* Station code */}
              <View style={styles.dropdownContainer}>
                {(formData.stationCode) && (
                  <AppText
                    style={[styles.floatingLabel, { color: colors.primary }]}
                  >
                    Station<AppText style={styles.asteriskPrimary}>*</AppText>
                  </AppText>
                )}
                <TouchableOpacity
                  style={[styles.dropdown, errors.stationCode && styles.inputError]}
                  onPress={() => setShowStationModal(true)}
                >
                  <View style={styles.inputTextContainer}>
                    <AppText style={formData.stationCode ? styles.inputText : styles.placeholderText}>
                      {formData.stationCode || ('Station')}
                    </AppText>
                    {!formData.stationCode && (
                      <AppText style={styles.inlineAsterisk}>*</AppText>
                    )}
                  </View>
                  <Icon name="arrow-drop-down" size={24} color="#666" />
                </TouchableOpacity>

                {errors.stationCode && (
                  <AppText style={styles.errorTextDropdown}>{errors.stationCode}</AppText>
                )}
              </View>

              <AddressInputWithLocation
                placeholder="Address 1"
                value={formData.address1}


                onChangeText={createFilteredInputHandler('address1', (text) => {
                  setFormData(prev => ({ ...prev, address1: text }));
                  setErrors(prev => ({ ...prev, address1: null }));
                }, 40)}


                mandatory={true}
                error={errors.address1}
                onLocationSelect={async (locationData) => {
                  const addressParts = locationData.address
                    .split(',')
                    .map(part => part.trim());
                  const extractedPincode = locationData.pincode || '';
                  const filteredParts = addressParts.filter(part => {
                    return (
                      !part.match(/^\d{6}$/) && part.toLowerCase() !== 'india'
                    );
                  });

                  setFormData(prev => ({
                    ...prev,
                    address1: filterForField('address1', filteredParts[0] || '', 40),
                    address2: filterForField('address2', filteredParts[1] || '', 40),
                    address3: filterForField('address3', filteredParts[2] || '', 60),
                    address4: filteredParts.slice(3).join(', ') || '',
                  }));


                  // Update pincode and trigger lookup (this will populate area, city, state)
                  if (extractedPincode) {
                    setFormData(prev => ({ ...prev, pincode: extractedPincode }));
                    setErrors(prev => ({ ...prev, pincode: null }));
                    // Trigger pincode lookup to populate area, city, state
                    await lookupByPincode(extractedPincode);
                  }

                  setErrors(prev => ({
                    ...prev,
                    address1: null,
                    address2: null,
                    address3: null,
                    address4: null,
                    pincode: null,
                  }));
                }}
              />

              <CustomInput
                placeholder="Address 2"
                value={formData.address2}
                onChangeText={createFilteredInputHandler('address2', (text) => {
                  setFormData(prev => ({ ...prev, address2: text }));
                  setErrors(prev => ({ ...prev, address2: null }));
                }, 40)}
                mandatory={true}
                error={errors.address2}
              />

              <CustomInput
                placeholder="Address 3"
                value={formData.address3}
                onChangeText={createFilteredInputHandler('address3', (text) => {
                  setFormData(prev => ({ ...prev, address3: text }));
                  setErrors(prev => ({ ...prev, address3: null }));
                }, 60)}
                mandatory={true}
                error={errors.address3}
              />

              <CustomInput
                placeholder="Address 4"
                value={formData.address4}
                onChangeText={createFilteredInputHandler('address4', (text) =>
                  setFormData(prev => ({ ...prev, address4: text })), 60
                )}
              />

              <CustomInput
                placeholder="Pincode"
                value={formData.pincode}
                onChangeText={handlePincodeChange}
                keyboardType="numeric"
                maxLength={6}
                mandatory={true}
                error={errors.pincode}
              />
              {pincodeLoading && (
                <View style={{ marginTop: -10, marginBottom: 10 }}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              )}

              {/* Area Dropdown */}
              <View style={styles.dropdownContainer}>
                {(formData.area || areas.length > 0) && (
                  <AppText
                    style={[styles.floatingLabel, { color: colors.primary }]}
                  >
                    Area<AppText style={styles.asteriskPrimary}>*</AppText>
                  </AppText>
                )}
                <TouchableOpacity
                  style={[styles.dropdown, errors.area && styles.inputError]}
                  onPress={() => {
                    setShowAreaModal(true)
                  }}
                >
                  <View style={styles.inputTextContainer}>
                    <AppText
                      style={
                        formData.area
                          ? styles.inputText
                          : styles.placeholderText
                      }
                    >
                      {formData.area || (areas.length === 0 ? 'Area' : 'Area')}
                    </AppText>
                    {!formData.area && (
                      <AppText style={styles.inlineAsterisk}>*</AppText>

                    )}
                  </View>
                  <Icon name="arrow-drop-down" size={24} color="#666" />
                </TouchableOpacity>
                {errors.area && (
                  <AppText style={styles.errorTextDropdown}>{errors.area}</AppText>
                )}
              </View>

              {/* City - Auto-populated from pincode */}
              <View style={styles.dropdownContainer}>
                {(formData.city || cities.length > 0) && (
                  <AppText
                    style={[styles.floatingLabel, { color: colors.primary }]}
                  >
                    City<AppText style={styles.asteriskPrimary}>*</AppText>
                  </AppText>
                )}
                <TouchableOpacity
                  style={[styles.dropdown, errors.city && styles.inputError]}
                  onPress={() => setShowCityModal(true)}
                >
                  <View style={styles.inputTextContainer}>
                    <AppText style={formData.city ? styles.inputText : styles.placeholderText}>
                      {formData.city || ('City')}
                    </AppText>
                    {!formData.city && (
                      <AppText style={styles.inlineAsterisk}>*</AppText>
                    )}
                  </View>
                  <Icon name="arrow-drop-down" size={24} color="#666" />
                </TouchableOpacity>

                {errors.city && (
                  <AppText style={styles.errorTextDropdown}>{errors.city}</AppText>
                )}
              </View>

              {/* State - Auto-populated from pincode */}
              <View style={styles.dropdownContainer}>
                {(formData.state || states.length > 0) && (
                  <AppText
                    style={[styles.floatingLabel, { color: colors.primary }]}
                  >
                    State

                    {!formData.city && (
                      <AppText style={styles.inlineAsterisk}>*</AppText>
                    )}<AppText style={styles.asteriskPrimary}>*</AppText>
                  </AppText>
                )}
                <TouchableOpacity
                  style={[styles.dropdown, errors.state && styles.inputError]}
                  onPress={() => setShowStateModal(true)}
                >
                  <View style={styles.inputTextContainer}>
                    <AppText style={formData.state ? styles.inputText : styles.placeholderText}>
                      {formData.state || ('State')}
                    </AppText>
                    {!formData.state && (
                      <AppText style={styles.inlineAsterisk}>*</AppText>
                    )}
                  </View>
                  <Icon name="arrow-drop-down" size={24} color="#666" />
                </TouchableOpacity>

                {errors.state && (
                  <AppText style={styles.errorTextDropdown}>{errors.state}</AppText>
                )}
              </View>
            </View>

            {/* Security Details Section */}
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>
                Security Details<AppText style={styles.asteriskRed}>*</AppText>
              </AppText>

              {/* Mobile */}
              <CustomInput
                placeholder="Mobile Number"
                value={formData.mobileNumber}
                onChangeText={createFilteredInputHandler('mobileNumber', (text) => {
                  setFormData(prev => ({ ...prev, mobileNumber: text }));
                  setErrors(prev => ({ ...prev, mobileNumber: null }));
                }, 10)}
                maxLength={10}
                keyboardType="phone-pad"
                mandatory
                editable={!verificationStatus.mobile}
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
              {errors.mobileNumber && (
                <AppText style={styles.errorText}>
                  {errors.mobileNumber}
                </AppText>
              )}
              {errors.mobileVerification && (
                <AppText style={styles.errorText}>
                  {errors.mobileVerification}
                </AppText>
              )}
              {renderOTPInput('mobile')}

              {/* Email */}
              <CustomInput
                placeholder="Email Address"
                value={formData.emailAddress}
                onChangeText={createFilteredInputHandler('emailAddress', (text) => {
                  setFormData(prev => ({
                    ...prev,
                    emailAddress: text.toLowerCase(),
                  }));
                  setErrors(prev => ({ ...prev, emailAddress: null }));
                }, 241)}
                keyboardType="email-address"
                mandatory
                editable={!verificationStatus.email}
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
              {errors.emailAddress && (
                <AppText style={styles.errorText}>
                  {errors.emailAddress}
                </AppText>
              )}
              {errors.emailVerification && (
                <AppText style={styles.errorText}>
                  {errors.emailVerification}
                </AppText>
              )}
              {renderOTPInput('email')}

              {/* PAN and GST fields - Hidden in onboard mode */}
              <>
                {/* PAN Upload */}
                <FileUploadComponent
                  placeholder="Upload PAN"
                  accept={['pdf', 'jpg', 'png', 'jpeg']}
                  maxSize={15 * 1024 * 1024}
                  docType={DOC_TYPES.PAN_CARD}
                  initialFile={formData.panFile}
                  onFileUpload={file => handleFileUpload('panFile', file)}
                  onFileDelete={() => handleFileDelete('panFile')}
                  mandatory={true}
                  errorMessage={errors.panFile}
                  onOcrDataExtracted={ocrData => {
                    console.log('PAN OCR Data:', ocrData);
                    if (ocrData.panNumber) {
                      setFormData(prev => ({
                        ...prev,
                        panNumber: ocrData.panNumber,
                      }));
                      // Auto-verify when PAN is populated from OCR
                      setVerificationStatus(prev => ({ ...prev, pan: true }));
                    }
                  }}
                />

                {/* PAN Number */}
                <CustomInput
                  placeholder="PAN Number"
                  value={formData.panNumber}
                  onChangeText={createFilteredInputHandler('panNumber', (text) => {
                    const upperText = text.toUpperCase();
                    setFormData(prev => ({ ...prev, panNumber: upperText }));
                    setErrors(prev => ({ ...prev, panNumber: null }));
                  }, 10)}
                  autoCapitalize="characters"
                  maxLength={10}
                  mandatory
                  editable={!verificationStatus.pan}
                  error={errors.panNumber}
                  rightComponent={
                    <TouchableOpacity
                      style={[
                        styles.inlineVerifyButton,
                        verificationStatus.pan && styles.verifiedButton,
                      ]}
                      onPress={() => {
                        if (!verificationStatus.pan) {
                          // Verify PAN format
                          if (
                            /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)
                          ) {
                            setVerificationStatus(prev => ({
                              ...prev,
                              pan: true,
                            }));
                          } else {
                            Alert.alert(
                              'Invalid PAN',
                              'Please enter a valid PAN number',
                            );
                          }
                        }
                      }}
                      disabled={verificationStatus.pan}
                    >
                      <AppText
                        style={[
                          styles.inlineVerifyText,
                          verificationStatus.pan && styles.verifiedText,
                        ]}
                      >
                        {verificationStatus.pan ? (
                          'Verified'
                        ) : (
                          <>
                            Verify
                            <AppText style={styles.inlineAsterisk}>*</AppText>
                          </>
                        )}
                      </AppText>
                    </TouchableOpacity>
                  }
                />

                {
                  verificationStatus.pan &&
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
                    <FetchGst />
                    <AppText style={styles.linkText}>Fetch GST from PAN</AppText>
                  </TouchableOpacity>
                }


                {/* GST Upload */}
                <FileUploadComponent
                  placeholder="Upload GST"
                  accept={['pdf', 'jpg', 'png', 'jpeg']}
                  maxSize={15 * 1024 * 1024}
                  docType={DOC_TYPES.GST_CERTIFICATE}
                  initialFile={formData.gstFile}
                  onFileUpload={file => handleFileUpload('gstFile', file)}
                  onFileDelete={() => handleFileDelete('gstFile')}
                  onOcrDataExtracted={ocrData => {
                    console.log('GST OCR Data:', ocrData);
                    if (ocrData.gstNumber) {
                      setFormData(prev => ({
                        ...prev,
                        gstNumber: ocrData.gstNumber,
                      }));
                      if (ocrData.isGstValid) {
                        setVerificationStatus(prev => ({ ...prev, gst: true }));
                      }
                    }
                  }}
                />

                {/* GST Number */}
                <CustomInput
                  placeholder="GST number"
                  value={formData.gstNumber}
                  onChangeText={createFilteredInputHandler('gstNumber', (text) => {
                    const upperText = text.toUpperCase();
                    setFormData(prev => ({ ...prev, gstNumber: upperText }));
                    setErrors(prev => ({ ...prev, gstNumber: null }));
                  }, 15)}
                  autoCapitalize="characters"
                  keyboardType="default"
                  maxLength={15}
                  error={errors.gstNumber}
                />
              </>


            </View>

            {/* Mapping Section */}
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>Mapping</AppText>

              <View style={styles.categoryOptions}>
                <View style={styles.radioButtonContainer}>
                  {/* Hospital */}
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => {
                      setFormData(prev => ({
                        ...prev,
                        selectedCategory:
                          formData.selectedCategory === 'groupCorporateHospital'
                            ? ''
                            : 'groupCorporateHospital',
                        selectedHospitals:
                          formData.selectedCategory === 'groupCorporateHospital'
                            ? []
                            : prev.selectedHospitals,
                      }));
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.radioCircle}>
                      {formData.selectedCategory ===
                        'groupCorporateHospital' && (
                          <View style={styles.radioSelected} />
                        )}
                    </View>
                    <AppText style={styles.radioLabel}>Hospital</AppText>
                  </TouchableOpacity>

                  {/* Doctor */}
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => {
                      setFormData(prev => ({
                        ...prev,
                        selectedCategory:
                          formData.selectedCategory === 'doctor'
                            ? ''
                            : 'doctor',
                        selectedDoctors:
                          formData.selectedCategory === 'doctor'
                            ? []
                            : prev.selectedDoctors,
                      }));
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.radioCircle}>
                      {formData.selectedCategory === 'doctor' && (
                        <View style={styles.radioSelected} />
                      )}
                    </View>
                    <AppText style={styles.radioLabel}>Doctor</AppText>
                  </TouchableOpacity>
                </View>

                {/* Hospital Selector */}
                {formData.selectedCategory === 'groupCorporateHospital' && (
                  <>
                    <TouchableOpacity
                      style={styles.hospitalSelectorDropdown}
                      onPress={() => {
                        navigation.navigate('HospitalSelector', {
                          selectedHospitals: formData.selectedHospitals,
                          onSelect: hospitals => {
                            setFormData(prev => ({
                              ...prev,
                              selectedHospitals: hospitals,
                            }));
                          },
                          mappingFor: "PCM",
                          customerGroupId: formData.customerGroupId,
                          ...(formData?.stateId && { stateIds: [Number(formData.stateId)] }),
                          ...(formData?.cityId && { cityIds: [Number(formData.cityId)] }),

                        });
                      }}
                      activeOpacity={0.7}
                    >
                      <AppText style={styles.hospitalSelectorText}>
                        {formData.selectedHospitals && formData.selectedHospitals.length > 0
                          ? formData.selectedHospitals.map(h => h.name).join(', ')
                          : 'Search hospital name/code'}
                      </AppText>
                      <Icon name="arrow-drop-down" size={24} color="#333" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.addNewHospitalLink}
                      onPress={() => setShowAddHospitalModal(true)}
                    >
                      <AppText style={styles.addNewHospitalLinkText}>
                        + Add New Hospital
                      </AppText>
                    </TouchableOpacity>
                  </>
                )}

                {/* Doctor Selector - Show when Doctor is selected */}
                {formData.selectedCategory === 'doctor' && (
                  <>
                    <TouchableOpacity
                      style={styles.selectorInput}
                      onPress={() => {
                        navigation.navigate('DoctorSelector', {
                          selectedDoctors: formData.selectedDoctors,
                          onSelect: (selectedDoctors) => {
                            console.log('=== Doctors Selected from DoctorSelector ===');
                            console.log('Selected Doctors:', selectedDoctors);
                            console.log('First Doctor:', selectedDoctors[0]);
                            console.log('=== End Doctors Selection ===');
                            setFormData(prev => ({
                              ...prev,
                              selectedDoctors: selectedDoctors
                            }));
                          },
                          mappingFor: "PCM",
                          customerGroupId: formData.customerGroupId,
                          ...(formData?.stateId && { stateIds: [Number(formData.stateId)] }),
                          ...(formData?.cityId && { cityIds: [Number(formData.cityId)] }),
                        });
                      }}
                    >
                      <AppText style={styles.selectorPlaceholder}>
                        {formData?.selectedDoctors.length > 0
                          ? `${formData.selectedDoctors.length} Doctor${formData.selectedDoctors.length !== 1 ? 's' : ''} selected`
                          : 'Search doctor name/code'
                        }

                      </AppText>
                      <Icon name="arrow-drop-down" size={24} color="#666" />
                    </TouchableOpacity>



                    {/* Selected Doctors List */}
                    {formData.selectedDoctors.length > 0 && (
                      <View style={styles.selectedItemsContainer}>
                        {formData.selectedDoctors.map((doctor, index) => (
                          <View key={doctor.id || index} style={styles.selectedItemChip}>
                            <AppText style={styles.addNewDoctorLink}>{doctor.name || doctor.customerName || `Doctor ${index + 1}`}  </AppText>
                            <TouchableOpacity
                              onPress={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  selectedDoctors: prev.selectedDoctors.filter((_, i) => i !== index)
                                }));
                              }}
                            >
                              <DoctorDeleteIcon />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Add New Doctor Link */}
                    <TouchableOpacity
                      style={styles.addNewLink}
                      onPress={() => {
                        setShowAddDoctorModal(true);
                      }}
                    >
                      <AppText style={styles.addNewLinkText}>+ Add New Doctor</AppText>
                    </TouchableOpacity>


                  </>
                )}

                {errors.mapping && (
                  <AppText style={styles.errorText}>
                    {errors.mapping}
                  </AppText>
                )}
              </View>



              <View style={styles.customerGroupContainer}>
                <AppText style={styles.customerGroupLabel}>
                  Customer group
                </AppText>
                <View style={styles.radioGroupContainer}>
                  {customerGroups.length > 0 ? (
                    <>
                      {/* First row - first 2 groups */}
                      <View style={styles.radioRow}>
                        {customerGroups.slice(0, 2).map((group) => {
                          // Only DSUP (DOCTOR SUPPLY) is enabled, others are disabled
                          const isEnabled = group.customerGroupCode === 'DSUP';
                          return (
                            <TouchableOpacity
                              key={group.customerGroupId}
                              style={[
                                styles.radioOption,
                                styles.radioOptionFlex,
                                !isEnabled && styles.disabledOption,
                              ]}
                              onPress={() => {
                                if (isEnabled) {
                                  setFormData(prev => ({
                                    ...prev,
                                    customerGroupId: group.customerGroupId,
                                  }));
                                }
                              }}
                              disabled={!isEnabled}
                            >
                              <View
                                style={[
                                  styles.radioCircle,
                                  !isEnabled && styles.disabledRadio,
                                ]}
                              >
                                {formData.customerGroupId === group.customerGroupId && (
                                  <View style={styles.radioSelected} />
                                )}
                              </View>
                              <AppText
                                style={[
                                  styles.radioText,
                                  !isEnabled && styles.disabledText,
                                ]}
                              >
                                {group.customerGroupName}
                              </AppText>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                      {/* Second row - remaining groups */}
                      {customerGroups.length > 2 && (
                        <View style={styles.radioRow}>
                          {customerGroups.slice(2, 4).map((group) => {
                            // Only DSUP (DOCTOR SUPPLY) is enabled, others are disabled
                            const isEnabled = group.customerGroupCode === 'DSUP';
                            return (
                              <TouchableOpacity
                                key={group.customerGroupId}
                                style={[
                                  styles.radioOption,
                                  styles.radioOptionFlex,
                                  !isEnabled && styles.disabledOption,
                                ]}
                                onPress={() => {
                                  if (isEnabled) {
                                    setFormData(prev => ({
                                      ...prev,
                                      customerGroupId: group.customerGroupId,
                                    }));
                                  }
                                }}
                                disabled={!isEnabled}
                              >
                                <View
                                  style={[
                                    styles.radioCircle,
                                    !isEnabled && styles.disabledRadio,
                                  ]}
                                >
                                  {formData.customerGroupId === group.customerGroupId && (
                                    <View style={styles.radioSelected} />
                                  )}
                                </View>
                                <AppText
                                  style={[
                                    styles.radioText,
                                    !isEnabled && styles.disabledText,
                                  ]}
                                >
                                  {group.customerGroupId} {group.customerGroupName}
                                </AppText>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      )}
                    </>
                  ) : (
                    <ActivityIndicator size="small" color={colors.primary} />
                  )}
                </View>
              </View>
            </View>

            {/* Stockist Suggestions Section */}
            <View style={styles.section}>
              <AppText style={styles.sectionSubTitle}>
                Stockist Suggestions
                <AppText style={styles.optionalText}> (Optional)</AppText>
              </AppText>

              {formData.stockists.map((stockist, index) => (
                <View key={index} style={styles.stockistContainer}>
                  {index > 0 && (
                    <View style={styles.stockistHeader}>
                      <TouchableOpacity
                        onPress={() => handleRemoveStockist(index)}
                        style={{ marginLeft: 'auto' }}
                      >
                        <Icon name="delete" size={20} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  )}
                  <CustomInput
                    placeholder={`Name of the Stockist ${index + 1}`}
                    value={stockist.name}
                    onChangeText={createFilteredInputHandler('nameOfStockist', (text) =>
                      handleStockistChange(index, 'name', text), 40
                    )}


                  />
                  <CustomInput
                    placeholder={`Distributor Code`}
                    value={stockist.code}


                    onChangeText={createFilteredInputHandler('distributorCode', (text) =>
                      handleStockistChange(index, 'code', text), 20
                    )}
                  />
                  <CustomInput
                    placeholder={`City`}
                    value={stockist.city}

                    onChangeText={createFilteredInputHandler('distributorCity', (text) =>
                      handleStockistChange(index, 'city', text), 40
                    )}
                  />
                </View>
              ))}

              <TouchableOpacity
                style={styles.addMoreButton}
                onPress={handleAddStockist}
              >


                {
                  formData.stockists.length < 4 && (
                    <TouchableOpacity onPress={handleAddStockist}>
                      <AppText style={styles.addMoreButtonText}>+ Add More Stockist</AppText>
                    </TouchableOpacity>
                  )
                }

              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {isOnboardMode ? (
                <>
                  <TouchableOpacity
                    style={styles.assignButton}
                    onPress={handleAssignToCustomer}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color={colors.primary} />
                    ) : (
                      <AppText style={styles.assignButtonText}>Assign to Customer</AppText>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.registerButton,
                      !isFormValid && styles.registerButtonDisabled,
                      loading && styles.disabledButton,
                    ]}
                    onPress={handleRegister}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <AppText style={[
                        styles.registerButtonText,
                        !isFormValid && styles.registerButtonTextDisabled,
                      ]}>
                        Register
                      </AppText>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancel}
                    disabled={loading}
                  >
                    <AppText style={styles.cancelButtonText}>Cancel</AppText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.registerButton,
                      !isFormValid && styles.registerButtonDisabled,
                      loading && styles.disabledButton,
                    ]}
                    onPress={handleRegister}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <AppText style={[
                        styles.registerButtonText,
                        !isFormValid && styles.registerButtonTextDisabled,
                      ]}>
                        {isEditMode ? 'Update' : 'Register'}
                      </AppText>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>



      {/* start dropdown modal section////////////////////////////////////////// */}

      <SearchableDropdownModal
        visible={showStationModal}
        onClose={() => setShowStationModal(false)}
        title="Select Station Code"
        data={
          loggedInUser?.userDetails?.stationCodes?.map((item) => ({
            id: item.stationCode,
            name: item.stationCode,
          }))
        }
        selectedId={formData.stationCode}
        onSelect={item => {
          setFormData(prev => ({
            ...prev,
            stationCode: item.name,
          }));
          setErrors(prev => ({ ...prev, stationCode: null }));
        }}
        loading={false}
      />

      <SearchableDropdownModal
        visible={showAreaModal}
        onClose={() => setShowAreaModal(false)}
        title="Select Area"
        data={uploadedAreas && uploadedAreas.length > 0
          ? uploadedAreas
          : Array.isArray(areas)
            ? areas.map(area => ({ id: area.id, name: area.name }))
            : []}
        selectedId={formData.areaId}
        onSelect={item => {
          setFormData(prev => ({
            ...prev,
            areaId: item.id,
            area: item.name,
          }));
          setErrors(prev => ({ ...prev, area: null }));
        }}
        loading={false}
      />

      <SearchableDropdownModal
        visible={showStateModal}
        onClose={() => setShowStateModal(false)}
        title="Select State"
        data={states}
        selectedId={formData.stateId}
        onSelect={item => {
          setFormData(prev => ({
            ...prev,
            stateId: item.id,
            state: item.name,
          }));
          setErrors(prev => ({ ...prev, stateId: null }));
        }}
        loading={false}
      />

      <SearchableDropdownModal
        visible={showCityModal}
        onClose={() => {
          setShowCityModal(false)
          setSearchCities(null)
        }}
        title="Select City"
        data={searchCities ? searchCities : cities}
        selectedId={formData.cityId}
        onSelect={item => {
          setFormData(prev => ({
            ...prev,
            cityId: item.id,
            city: item.name,
          }));
          setErrors(prev => ({ ...prev, cityId: null }));
          setCities(prevCities => {
            const exists = prevCities.some(c => c.id === item.id);
            if (exists) return prevCities;

            return [item, ...prevCities]; // add on top
          });
        }}
        loading={false}
        onSearch={handleCitySearch}
        onAddNew={addNewCity}
      />
      {/* start dropdown modal section////////////////////////////////////////// */}

      {/* Cancel Confirmation Modal */}
      <Modal
        visible={showCancelModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.cancelModalOverlay}>
          <View style={styles.cancelModalContent}>
            <View style={styles.modalIconContainerOuter}>

              <View style={styles.modalIconContainer}>

                <AppText style={styles.modalIcon}>!</AppText>
              </View></View>
            <AppText style={styles.cancelModalTitle}>
              {`Are you sure you want
to Cancel the Onboarding?`}
            </AppText>
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
        onClose={() => setShowAddHospitalModal(false)}
        mappingName={formData.pharmacyName}
        mappingLabel="Only Wholesaler"
        onAdd={hospital => {
          console.log('=== Hospital Response from AddNewHospitalModal ===');
          console.log('Full Response:', hospital);
          console.log('Hospital ID:', hospital.id || hospital.customerId);
          console.log('=== End Hospital Response ===');

          const hospitalData = {
            id: hospital.id || hospital.customerId,
            name: hospital.name || hospital.hospitalName,
            code: hospital.code || hospital.shortName,
            customerId: hospital.id || hospital.customerId,
            stateId: hospital.stateId,
            cityId: hospital.cityId,
            area: hospital.area,
            city: hospital.city,
            state: hospital.state,
            mobileNumber: hospital.mobileNumber,
            emailAddress: hospital.emailAddress,
            isNew: true,
            ...hospital,
          };

          console.log('=== Adding Hospital to selectedHospitals ===');
          console.log('Hospital Data:', hospitalData);
          console.log('=== End Hospital Data ===');

          setFormData(prev => ({
            ...prev,
            selectedHospitals: [
              ...(prev.selectedHospitals || []),
              hospitalData,
            ],
          }));
          setShowAddHospitalModal(false);
        }}
      />

      {/* Add New Doctor Modal */}
      <AddNewDoctorModal
        visible={showAddDoctorModal}
        onClose={() => setShowAddDoctorModal(false)}
        mappingName={formData.pharmacyName}
        mappingLabel="Only Wholesaler"
        onAdd={doctor => {
          console.log('=== Doctor Response from AddNewDoctorModal ===');
          console.log('Full Response:', doctor);
          console.log('Doctor ID:', doctor.id || doctor.customerId);
          console.log('=== End Doctor Response ===');

          const doctorData = {
            id: doctor.id || doctor.customerId,
            name: doctor.name || doctor.doctorName,
            code: doctor.code || doctor.shortName,
            customerId: doctor.id || doctor.customerId,
            stateId: doctor.stateId,
            cityId: doctor.cityId,
            area: doctor.area,
            city: doctor.city,
            state: doctor.state,
            mobileNumber: doctor.mobileNumber,
            emailAddress: doctor.emailAddress,
            isNew: true,
            ...doctor,
          };

          console.log('=== Adding Doctor to selectedDoctors ===');
          console.log('Doctor Data:', doctorData);
          console.log('=== End Doctor Data ===');

          setFormData(prev => ({
            ...prev,
            selectedDoctors: [...(prev.selectedDoctors || []), doctorData],
          }));
          setShowAddDoctorModal(false);
        }}
      />
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
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  saveDraftButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveDraftButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
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
    paddingBottom: 0,
  },
  disabledInputContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
  },
  disabledInputText: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    paddingHorizontal: 0,
    paddingTop: 8,
  },
  section: {
    marginBottom: 32,
  },
  sectionTopSpacing: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    paddingLeft: 12,
  },
  sectionSubTitle: {
    fontSize: 17,
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


  placeholderText: {
    fontSize: 16,
    color: colors.gray,
    marginLeft: 8
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  floatingLabel: {
    position: 'absolute',
    top: -10,
    left: 12,
    fontSize: 12,
    fontWeight: '500',
    backgroundColor: '#fff',
    paddingHorizontal: 4,
    zIndex: 1,
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
    backgroundColor: '#FFFFFF',
    marginBottom: 2
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
    borderRadius: 16,
  },
  verifiedButton: {},
  disabledButton: {
    opacity: 0.6,
  },
  inlineVerifyText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  verifiedText: {
    color: colors.primary,
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
  errorTextDropdown: {
    color: colors.error,
    fontSize: 12,
    // marginBottom: 12,
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
  radioText: {
    fontSize: 14,
    color: '#333',
  },
  customerGroupContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
  },
  stockistContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 0,
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
    visibility: 'hidden !important',
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
  assignButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  assignButtonText: {
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
  registerButtonDisabled: {
    backgroundColor: '#CCCCCC',
    elevation: 0,
    shadowOpacity: 0,
  },
  registerButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  registerButtonTextDisabled: {
    color: '#fff',
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
    paddingTop: 70,
    paddingBottom: 20,
    alignItems: 'center',
  },

  cancelModalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    textAlign: "center",
    marginBottom: 50

  },



  modalIconContainerOuter: {
    width: 80,
    height: 80,
    borderRadius: 50,
    backgroundColor: '#FFE3E3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 30,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
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
    borderColor: '#FF6B6B',
    alignItems: 'center',
  },
  modalYesButtonText: {
    fontSize: 16,
    color: '#FF6B6B',
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
    marginBottom: 16,
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
  hospitalDropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  hospitalDropdownText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  hospitalSelectorDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#999',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  hospitalSelectorText: {
    fontSize: 16,
    color: '#777777',
    flex: 1,
    fontWeight: '500',
  },
  addNewHospitalLink: {
    marginBottom: 16,
  },
  addNewHospitalLinkText: {
    fontSize: 14,
    color: colors.primary,
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
    backgroundColor: '#FFFFFF',
  },
  selectorPlaceholder: {
    fontSize: 16,
    color: '#777777',
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
    marginTop: -12,
    marginBottom: 20,
  },
  addNewLinkText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  addNewDoctorLink: {
    fontSize: 14,
    color: "#333",
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 20,
  },
  radioGroupContainer: {},
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#FFF5ED',
  },
  addNewButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  selectedItemsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  selectedItemChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F6',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  selectedItemText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    flex: 1,
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
  flexContainer: {
    flex: 1,
  },
  asteriskRed: {
    color: 'red',
  },
  asteriskPrimary: {
    color: "red",
    fontSize: 16
  },
  radioButtonContainer: {
    flexDirection: 'row',
    gap: 50,
    flex: 1,
    marginBottom: 16,
  },
  inputText: {
    fontSize: 16,
    color: '#333',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 8,
    marginBottom: 16,
    marginTop: -16,
  },
  linkText: {
    color: colors.primary
  }
});

export default PharmacyWholesalerForm;
