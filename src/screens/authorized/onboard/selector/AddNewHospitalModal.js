/* eslint-disable no-dupe-keys */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../../styles/colors';
import Toast from 'react-native-toast-message';
import { customerAPI } from '../../../../api/customer';
import FileUploadComponent from '../../../../components/FileUploadComponent';
import AddressInputWithLocation from '../../../../components/AddressInputWithLocation';
import CustomInput from '../../../../components/CustomInput';
import { AppText, AppInput } from "../../../../components"
import { usePincodeLookup } from '../../../../hooks/usePincodeLookup';
import FloatingDateInput from '../../../../components/FloatingDateInput';
import { validateField, createFilteredInputHandler, filterForField } from '../../../../utils/formValidation';
import { useSelector } from 'react-redux';
import SearchableDropdownModal from '../../../../components/modals/SearchableDropdownModal';
import { resolveCategoryLabel } from '../utils/helper'

const DOC_TYPES = {
  REGISTRATION_CERTIFICATE: 8,
  HOSPITAL_IMAGE: 1,
  PAN: 7,
  GST: 2,
  registrationCertificate:8,
  image:1
};


const AddNewHospitalModal = ({ visible, onClose, onSubmit, formData, entityType, allowMultiple = true, parentHospitalId = null }) => {

console.log(visible);

  const loggedInUser = useSelector(state => state.auth.user);
  const [hospitalForm, setHospitalForm] = useState({
    category: 'Private',
    subCategory: 'Clinic',
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
    isBuyer: true,
    selectedDoctors: [],
    stockistName: '',
    stockistCode: '',
    stockistCity: '',
    stationCode: "",
  });

  const [verificationStatus, setVerificationStatus] = useState({
    mobile: false,
    email: false,
    pan: false,
  });
  const [licenseTypes, setLicenseTypes] = useState({});

  const [hospitalErrors, setHospitalErrors] = useState({});
  const [loading, setLoading] = useState(false);
  // Document IDs for uploaded files
  const [documentIds, setDocumentIds] = useState({});

  // Uploaded documents with full details including docTypeId
  const [uploadedDocs, setUploadedDocs] = useState([]);


  // States and cities data
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

  // Modals for dropdowns
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [showStationModal, setShowStationModal] = useState(false);

  // OTP states
  const [showOTP, setShowOTP] = useState({ mobile: false, email: false });
  const [otpValues, setOtpValues] = useState({ mobile: ['', '', '', ''], email: ['', '', '', ''] });
  const [otpTimers, setOtpTimers] = useState({ mobile: 30, email: 30 });
  const [loadingOtp, setLoadingOtp] = useState({ mobile: false, email: false });
  const otpRefs = useRef({});




  // useeffect section start/////////////////////////////////////////////////////

  // Sync pincode lookup results → local lists (states, cities, areas) and auto-select first matches.
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
      setHospitalForm(prev => ({
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
      setHospitalForm(prev => ({
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
      setHospitalForm(prev => ({
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


  const loadInitialData = async () => {
    // Note: States and cities are now loaded via pincode lookup only
    // Load license types from API

    let subCategoryId = 2; // default: Individual Hospital

    if (entityType === "groupHospitals") {
      subCategoryId = 3;
    } else if (hospitalForm?.subCategory === "Clinic") {
      subCategoryId = 1;
    }


    try {
      const response = await customerAPI.getLicenseTypes(2, 4, subCategoryId);
      if (response.success && response.data) {
  

        const licenseData = {};
        response.data.forEach(license => {
          // Map the license codes to match what we expect
          // Note: The API might return different codes, so we map them appropriately
          if (license.code === 'REG' || license.name === 'REGISTRATION') {
            licenseData.REGISTRATION = {
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
      console.error('Error fetching license types:', error);
    }
  };

  useEffect(() => {
    if (visible) {
      loadInitialData();
    }
  }, [visible]);


  // funtion section start//////////////////////////////////////////////


  // Handle pincode change and trigger lookup
  const handlePincodeChange = async text => {
    // Filter pincode input to only allow digits
    const filtered = createFilteredInputHandler('pincode', null, 6)(text);
    // If filtered text is different, it means invalid characters were typed, so don't proceed
    if (filtered !== text && text.length > filtered.length) return;

    setHospitalForm(prev => ({ ...prev, pincode: filtered }));
    setHospitalErrors(prev => ({ ...prev, pincode: null }));


    // If user is editing pincode manually, clear any OCR/upload-derived area list
    if (uploadedAreas && uploadedAreas.length > 0) {
      setUploadedAreas([]); // prefer manual lookup results from pincode
    }

    // Clear previous selections when pincode becomes incomplete
    if (filtered.length < 6) {
      setHospitalForm(prev => ({
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
      setHospitalForm(prev => {
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
      setHospitalErrors(prev => ({
        ...prev,
        pincode: null,
        cityId: null,
        stateId: null,
        area: null,
      }));
    }
  };

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
    if (!hospitalForm.stateId) {
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
        stateId: hospitalForm?.stateId, // based on PIN/state
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
      setHospitalForm(prev => ({
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

  const resetForm = () => {
    setHospitalForm({
      category: 'Private',
      subCategory: '',
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
    // removed setCities([]) — setCities is undefined and caused a runtime error
    setDocumentIds({});
    setUploadedDocs([]);
    setVerificationStatus({ mobile: false, email: false, pan: false });
    clearData();
  };



  const handleVerify = async (field) => {

    if (
      field === 'mobile' &&
      (!hospitalForm.mobileNumber ||
        !/^[6-9]\d{9}$/.test(hospitalForm.mobileNumber))
    ) {
      setHospitalErrors(prev => ({
        ...prev,
        mobileNumber: 'Please enter valid 10-digit mobile number',
      }));
      return;
    }
    if (
      field === 'email' &&
      (!hospitalForm.emailAddress ||
        !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(hospitalForm.emailAddress))
    ) {
      setHospitalErrors(prev => ({
        ...prev,
        emailAddress: 'Please enter a valid email address',
      }));
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
        if (nextInput && nextInput.focus) nextInput.focus();
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

  const handleFileUpload = async (field, file) => {
    if (file && file.id) {
      setDocumentIds(prev => ({ ...prev, [field]: file.id }));

      

      // Add complete document object to uploaded list with docTypeId
      const docObject = {
        s3Path: file.s3Path || file.uri,
        docTypeId: DOC_TYPES[field],
        fileName: file.fileName || file.name,
        id: file.id
      };

      setUploadedDocs(prev => {
        // Avoid duplicates
        const exists = prev.find(d => d.id === docObject.id);
        if (exists) return prev;
        return [...prev, docObject];
      });
    }
    setHospitalForm(prev => ({ ...prev, [`${field}File`]: file }));
    setHospitalErrors(prev => ({ ...prev, [`${field}File`]: null }));

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
        setHospitalForm(prev => ({ ...prev, ...updates }));
        const clearErrs = {};
        if (updates.areaId) clearErrs.area = null;
        if (updates.cityId) clearErrs.cityId = null;
        if (updates.stateId) clearErrs.stateId = null;
        if (updates.pincode) clearErrs.pincode = null;
        setHospitalErrors(prev => ({ ...prev, ...clearErrs }));
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
          setHospitalForm(prev => {
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

  const handleFileDelete = (field) => {
    const file = hospitalForm[`${field}File`];
    if (file && file.id) {
      setUploadedDocs(prev => prev.filter(doc => doc.id !== file.id));
    }
    setDocumentIds(prev => ({ ...prev, [field]: null }));
    setHospitalForm(prev => ({ ...prev, [`${field}File`]: null }));
  };

  const formatDateForAPI = (date) => {
    if (!date) return null;
    const d = new Date(date);
    // Add time component to avoid timezone issues
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
  };

  const handleClose = () => {
    resetForm();
    onClose?.();
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

    if (!hospitalForm.stationCode)
      newErrors.stationCode = 'Station Code is required';

    // Hospital Name validation using reusable validation utility
    const hospitalNameError = validateField('hospitalName', hospitalForm.hospitalName, true, 'Hospital name is required');
    if (hospitalNameError) newErrors.hospitalName = hospitalNameError;
    if (hospitalForm.hospitalName && hospitalForm.hospitalName.trim().length < 3) {
      newErrors.hospitalName = 'Hospital name must be at least 3 characters';
    }

    // Address validation using reusable validation utility
    const address1Error = validateField('address1', hospitalForm.address1, true, 'Address 1 is required');
    if (address1Error) newErrors.address1 = address1Error;

    const address2Error = validateField('address2', hospitalForm.address2, true, 'Address 2 is required');
    if (address2Error) newErrors.address2 = address2Error;

    const address3Error = validateField('address3', hospitalForm.address3, true, 'Address 3 is required');
    if (address3Error) newErrors.address3 = address3Error;

    const pincodeError = validateField('pincode', hospitalForm.pincode, true, 'Valid 6-digit pincode is required');
    if (pincodeError) newErrors.pincode = pincodeError;

    const areaError = validateField('area', hospitalForm.area, true, 'Area is required');
    if (areaError) newErrors.area = areaError;

    // City validation
    if (!hospitalForm.city || !hospitalForm.cityId) {
      newErrors.city = 'City is required';
    }

    // State validation
    if (!hospitalForm.state || !hospitalForm.stateId) {
      newErrors.state = 'State is required';
    }

    // Mobile Number validation using reusable validation utility
    const mobileError = validateField('mobileNo', hospitalForm.mobileNumber, true, 'Valid 10-digit mobile number is required');
    if (mobileError) newErrors.mobileNumber = mobileError;
    if (!verificationStatus.mobile) {
      newErrors.mobileVerification = 'Please verify mobile number';
    }

    // Email Address validation using reusable validation utility
    const emailError = validateField('emailAddress', hospitalForm.emailAddress, true, 'Valid email address is required');
    if (emailError) newErrors.emailAddress = emailError;
    if (!verificationStatus.email) {
      newErrors.emailVerification = 'Please verify email address';
    }

    // PAN validation using reusable validation utility
    if (!hospitalForm.panFile && !documentIds.pan) {
      newErrors.panFile = 'PAN document is required';
    }
    const panError = validateField('panNo', hospitalForm.panNumber, true, 'Valid PAN number is required (e.g., ABCDE1234F)');
    if (panError) newErrors.panNumber = panError;

    // GST validation using reusable validation utility
    if (hospitalForm.gstNumber && hospitalForm.gstNumber.trim() !== '') {
      const gstError = validateField('gstNo', hospitalForm.gstNumber, false, 'Invalid GST format');
      if (gstError) newErrors.gstNumber = gstError;
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
      let subCategoryId = 2; // default: Individual Hospital

      if (entityType === "groupHospitals") {
        subCategoryId = 3;
      } else if (hospitalForm?.subCategory === "Clinic") {
        subCategoryId = 1;
      }

      // Prepare registration payload matching the API structure
      const registrationData = {
        typeId: 2,
        categoryId: 4,
        subCategoryId: subCategoryId,
        isMobileVerified: verificationStatus.mobile,
        isEmailVerified: verificationStatus.email,
        isExisting: false,
        licenceDetails: {
          registrationDate: new Date().toISOString(),
          licence: [
            {
              licenceTypeId: licenseTypes.REGISTRATION?.id || 8,
              licenceNo: hospitalForm.registrationNumber,
              licenceValidUpto: formatDateForAPI(hospitalForm.registrationDate),
            }
          ]
        },
        customerDocs: uploadedDocs,
        isBuyer: true,
        customerGroupId: 1,
        stationCode: hospitalForm.stationCode,
        generalDetails: {
          name: hospitalForm.hospitalName,
          shortName: hospitalForm.shortName || '',
          address1: hospitalForm.address1,
          address2: hospitalForm.address2 || '',
          address3: hospitalForm.address3 || '',
          address4: hospitalForm.address4 || '',
          pincode: parseInt(hospitalForm.pincode, 10),
          area: hospitalForm.area || 'Default',
          areaId: parseInt(hospitalForm.areaId),
          cityId: parseInt(hospitalForm.cityId, 10),
          stateId: parseInt(hospitalForm.stateId, 10),
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
        ] : [],
        isChildCustomer: true
      };


      const response = await customerAPI.createCustomer(registrationData);

      if (response?.success) {
        Toast.show({
          type: 'success',
          text1: 'Hospital Added',
          text2: response.message || 'Hospital registered successfully',
          position: 'top',
        });

        console.log(response);
        

        // Pass the created hospital data back to parent
        const newHospital = [{
          id: response?.data?.data?.stgCustomerId,
          customerName: response?.data?.data?.generalDetails?.name,
          isNew: true,
          isActive: true
        }];

        onSubmit(entityType, newHospital, parentHospitalId, allowMultiple);
        // Reset and close
        resetForm();
        onClose();
      } else {

        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: response.message || 'Failed to register hospital. Please try again.',
          position: 'top',
        });
      }
    } catch (error) {


      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: error.response?.message || 'An error occurred while registering the hospital',
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
      transparent={true}
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Icon name="close" size={20} color="#666" />
          </TouchableOpacity>




          <AppText style={styles.modalTitle}>
            Add {entityType === 'groupHospitals' ? 'Group Hospital' : 'Hospital'} account
          </AppText>
        </View>
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Category Section */}
          {entityType === 'hospitals' &&
            <>
              <AppText style={styles.categoryLabel}>Category <AppText style={styles.categoryPlaceholder}>(Select Any One)</AppText></AppText>

              <View style={styles.radioGroupHorizontal}>
                <TouchableOpacity
                  style={styles.radioOptionHorizontal}
                  onPress={() => setHospitalForm(prev => ({ ...prev, subCategory: 'Clinic' }))}
                >
                  <View style={[styles.radioCircle, hospitalForm.subCategory === 'Clinic' && styles.radioCircleSelected]}>
                    {hospitalForm.subCategory === 'Clinic' && <View style={styles.radioInner} />}
                  </View>
                  <AppText style={styles.radioLabel}>Private-Clinic</AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.radioOptionHorizontal}
                  onPress={() => setHospitalForm(prev => ({ ...prev, subCategory: 'Individual Hospital' }))}
                >
                  <View style={[styles.radioCircle, hospitalForm.subCategory === 'Individual Hospital' && styles.radioCircleSelected]}>
                    {hospitalForm.subCategory === 'Individual Hospital' && <View style={styles.radioInner} />}
                  </View>
                  <AppText style={styles.radioLabel}>Private-Individual Hospital</AppText>
                </TouchableOpacity>
              </View>
            </>
          }


          <AppText style={[styles.modalSectionLabel, styles.modalSectionTopspacing]}>License Details<AppText style={styles.mandatory}>*</AppText></AppText>

          {/* Registration Certificate */}
          <FileUploadComponent
            placeholder="Upload registration certificate"
            accept={['pdf', 'jpg', 'jpeg', 'png']}
            maxSize={15 * 1024 * 1024}
            docType={licenseTypes?.REGISTRATION?.docTypeId || 8}
            initialFile={hospitalForm.registrationCertificate}
            onFileUpload={(file) => handleFileUpload('registrationCertificate', file)}
            onFileDelete={() => handleFileDelete('registrationCertificate')}
            errorMessage={hospitalErrors.registrationCertificate}
            onOcrDataExtracted={async (ocrData) => {

              // Helper function to split address
              const splitAddress = (address) => {
                if (!address) return { address1: '', address2: '', address3: '' };
                const parts = address.split(',').map(part => part.trim()).filter(part => part.length > 0);
                if (parts.length >= 3) {
                  return {
                    address1: parts[0],
                    address2: parts.slice(1, -1).join(', '),
                    address3: parts[parts.length - 1],
                  };
                } else if (parts.length === 2) {
                  return { address1: parts[0], address2: parts[1], address3: '' };
                } else if (parts.length === 1) {
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
                    return { address1: addr, address2: '', address3: '' };
                  }
                }
                return { address1: '', address2: '', address3: '' };
              };

              const updates = {};

              // Populate hospital name if available
              if (ocrData.hospitalName && !hospitalForm.hospitalName) {
                updates.hospitalName = filterForField('hospitalName', ocrData.hospitalName, 40);
              }

              if (ocrData.pharmacyName && !hospitalForm.hospitalName) {
                updates.hospitalName = filterForField('hospitalName', ocrData.pharmacyName, 40);
              }


              // Split and populate address fields
              if (ocrData.address) {
                const addressParts = splitAddress(ocrData.address);
                if (!hospitalForm.address1 && addressParts.address1) {
                  updates.address1 = filterForField('address1', addressParts.address1, 40);
                }
                if (!hospitalForm.address2 && addressParts.address2) {
                  updates.address2 = filterForField('address2', addressParts.address2, 40);
                }
                if (!hospitalForm.address3 && addressParts.address3) {
                  updates.address3 = filterForField('address3', addressParts.address3, 60);
                }
              }

              // Populate registration number if available
              if (ocrData.registrationNumber && !hospitalForm.registrationNumber) {
                updates.registrationNumber = filterForField('hospitalCode', ocrData.registrationNumber, 20);
              } else if (ocrData.licenseNumber && !hospitalForm.registrationNumber) {
                updates.registrationNumber = filterForField('hospitalCode', ocrData.licenseNumber, 20);
              }

              // Populate registration date if available
              if (ocrData.issueDate && !hospitalForm.registrationDate) {
                const parts = ocrData.issueDate.split('-');
                if (parts.length === 3) {
                  updates.registrationDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                }
              }

              // Populate expiry date if available
              if (ocrData.expiryDate) {
                const parts = ocrData.expiryDate.split('-');
                if (parts.length === 3) {
                  const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                  // Store if needed
                }
              }

              // Populate pincode
              if (ocrData.pincode && !hospitalForm.pincode) {
                updates.pincode = filterForField('pincode', ocrData.pincode, 6);
              }

              // -----------------------------
              //  🔥 DIRECTLY USE OCR LOCATION
              // -----------------------------
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
                setAreas(extractedAreas)
                setCities(extractedCities);
                setStates(extractedStates);
                if (extractedAreas.length > 0) setUploadedAreas(extractedAreas);

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

              if (Object.keys(updates).length > 0) {
                setHospitalForm(prev => ({ ...prev, ...updates }));
                const errorUpdates = {};
                Object.keys(updates).forEach(key => {
                  errorUpdates[key] = null;
                });
                setHospitalErrors(prev => ({ ...prev, ...errorUpdates }));
              }

              // Trigger pincode lookup if pincode is available and valid (6 digits) and locationDetails not available
              if (!location && (ocrData.pincode || ocrData.Pincode) && /^\d{6}$/.test(String(ocrData.pincode || ocrData.Pincode))) {
                await lookupByPincode(String(ocrData.pincode || ocrData.Pincode));
              }
            }}
          />

          <CustomInput
            placeholder="Hospital registration number"
            value={hospitalForm.registrationNumber}


            onChangeText={createFilteredInputHandler('registrationNumber', (text) => {
              setHospitalForm(prev => ({ ...prev, registrationNumber: text }));
              if (hospitalErrors.registrationNumber) {
                setHospitalErrors(prev => ({ ...prev, registrationNumber: null }));
              }
            }, 40)}
            mandatory={true}
            error={hospitalErrors.registrationNumber}
          />




          <FloatingDateInput
            label="Registration date"
            mandatory={true}
            value={hospitalForm.registrationDate}
            error={hospitalErrors.registrationDate}
            maximumDate={new Date()}
            onChange={(date) => {
              setHospitalForm(prev => ({ ...prev, registrationDate: date }));
              setHospitalErrors(prev => ({ ...prev, registrationDate: null }));
            }}
          />

          {/* Image */}
          <AppText style={styles.modalFieldLabelImage}>Image <AppText style={styles.mandatory}>*</AppText> <Icon
            name="info-outline"
            size={16}
            color={colors.textSecondary}
          /></AppText>
          <FileUploadComponent
            placeholder="Upload"
            accept={['jpg', 'png', 'jpeg', 'jpeg']}
            maxSize={15 * 1024 * 1024}
            docType={DOC_TYPES.HOSPITAL_IMAGE}
            initialFile={hospitalForm.image}
            onFileUpload={(file) => handleFileUpload('image', file)}
            onFileDelete={() => handleFileDelete('image')}
            errorMessage={hospitalErrors.image}
          />

          {/* General Details */}
          <AppText style={styles.modalSectionLabel}>General Details <AppText style={styles.mandatory}>*</AppText></AppText>
          <CustomInput
            placeholder="Enter hospital name"
            value={hospitalForm.hospitalName}
            onChangeText={createFilteredInputHandler('hospitalName', (text) => {
              setHospitalForm(prev => ({ ...prev, hospitalName: text }));
              if (hospitalErrors.hospitalName) {
                setHospitalErrors(prev => ({ ...prev, hospitalName: null }));
              }
            }, 40)}
            mandatory={true}
            error={hospitalErrors.hospitalName}
          />

          <CustomInput
            placeholder="Enter Short name"
            value={hospitalForm.shortName}
            onChangeText={createFilteredInputHandler('shortName', (text) => setHospitalForm(prev => ({ ...prev, shortName: text })), 25)}
          />

          {/* Station code */}
          <View style={styles.dropdownContainer}>
            {(hospitalForm.stationCode) && (
              <AppText
                style={[styles.floatingLabel, { color: colors.primary }]}
              >
                Station<AppText style={styles.asteriskPrimary}>*</AppText>
              </AppText>
            )}
            <TouchableOpacity
              style={[styles.dropdown, hospitalErrors.stationCode && styles.inputError]}
              onPress={() => setShowStationModal(true)}
            >
              <View style={styles.inputTextContainer}>
                <AppText style={hospitalForm.stationCode ? styles.inputText : styles.placeholderText}>
                  {hospitalForm.stationCode || ('Station')}
                </AppText>
                {!hospitalForm.stationCode && (
                  <AppText style={styles.inlineAsterisk}>*</AppText>
                )}
              </View>
              <Icon name="arrow-drop-down" size={24} color="#666" />
            </TouchableOpacity>

            {hospitalErrors.stationCode && (
              <AppText style={styles.errorText}>{hospitalErrors.stationCode}</AppText>
            )}
          </View>

          <AddressInputWithLocation
            label="Address 1"
            value={hospitalForm.address1}
            onChangeText={createFilteredInputHandler('address1', (text) => {
              setHospitalForm(prev => ({ ...prev, address1: text }));
              if (hospitalErrors.address1) {
                setHospitalErrors(prev => ({ ...prev, address1: null }));
              }
            }, 40)}
            placeholder="Address 1 "
            error={hospitalErrors.address1}
            mandatory={true}
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

              // Update address fields only
              setHospitalForm(prev => ({
                ...prev,
                address1: filterForField('address1', filteredParts[0] || '', 40),
                address2: filterForField('address2', filteredParts[1] || '', 40),
                address3: filterForField('address3', filteredParts[2] || '', 60),
                address4: filteredParts.slice(3).join(', ') || '',
              }));

              // Update pincode and trigger lookup (this will populate area, city, state)
              if (extractedPincode) {
                setHospitalForm(prev => ({ ...prev, pincode: extractedPincode }));
                setHospitalErrors(prev => ({ ...prev, pincode: null }));
                // Trigger pincode lookup to populate area, city, state
                await lookupByPincode(extractedPincode);
              }

              setHospitalErrors(prev => ({
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
            value={hospitalForm.address2}
            onChangeText={createFilteredInputHandler('address2', (text) => setHospitalForm(prev => ({ ...prev, address2: text })), 40)}
            mandatory={true}
            error={hospitalErrors.address2}
          />

          <CustomInput
            placeholder="Address 3"
            value={hospitalForm.address3}
            onChangeText={createFilteredInputHandler('address3', (text) => setHospitalForm(prev => ({ ...prev, address3: text })), 60)}
            mandatory={true}
            error={hospitalErrors.address3}
          />

          <CustomInput
            placeholder="Address 4"
            value={hospitalForm.address4}
            onChangeText={createFilteredInputHandler('address4', (text) => setHospitalForm(prev => ({ ...prev, address4: text })), 60)}
          />

          <CustomInput
            placeholder="Pincode"
            keyboardType="numeric"
            maxLength={6}
            value={hospitalForm.pincode}
            onChangeText={(text) => handlePincodeChange(text)}
            mandatory={true}
            error={hospitalErrors.pincode}
          />

          {/* Area Dropdown */}
          <View style={styles.dropdownContainer}>
            {(hospitalForm.area || (uploadedAreas.length > 0 || pincodeAreas.length > 0)) && (
              <AppText style={[styles.floatingLabel, { color: colors.primary }]}>
                Area<AppText style={styles.asteriskPrimary}>*</AppText>
              </AppText>
            )}
            <TouchableOpacity
              style={[styles.dropdown, hospitalErrors.area && styles.inputError]}
              onPress={() => {
                if (uploadedAreas.length === 0 && pincodeAreas.length === 0) {
                  Toast.show({
                    type: 'info',
                    text1: 'Area',
                    text2: 'Area for this pincode',
                    position: 'top',
                  });
                } else {
                  setShowAreaModal(true);
                }
              }}
            >
              <View style={styles.inputTextContainer}>
                <AppText style={hospitalForm.area ? styles.inputText : styles.placeholderText}>
                  {hospitalForm.area || 'Area'}
                </AppText>
                {!hospitalForm.area && (
                  <AppText style={styles.inlineAsterisk}>*</AppText>
                )}
              </View>
              <Icon name="arrow-drop-down" size={24} color="#666" />
            </TouchableOpacity>
            {hospitalErrors.area && <AppText style={styles.errorText}>{hospitalErrors.area}</AppText>}
          </View>

          {/* City - Auto-populated from pincode */}
          <View style={styles.dropdownContainer}>
            {(hospitalForm.city || cities.length > 0 || pincodeCities.length > 0) && (
              <AppText style={[styles.floatingLabel, { color: colors.primary }]}>
                City<AppText style={styles.asteriskPrimary}>*</AppText>
              </AppText>
            )}
            <TouchableOpacity
              style={[styles.dropdown, hospitalErrors.city && styles.inputError]}
              onPress={() => {
                const availableCities = cities.length > 0 ? cities : pincodeCities;
                if (availableCities.length === 0) {
                  Toast.show({
                    type: 'info',
                    text1: 'City',
                    text2: 'City for this pincode',
                    position: 'top',
                  });
                } else {
                  setShowCityModal(true);
                }
              }}
            >
              <View style={styles.inputTextContainer}>
                <AppText style={hospitalForm.city ? styles.inputText : styles.placeholderText}>
                  {hospitalForm.city || ('City')}
                </AppText>
                {!hospitalForm.city && (
                  <AppText style={styles.inlineAsterisk}>*</AppText>
                )}
              </View>
              <Icon name="arrow-drop-down" size={24} color="#666" />
            </TouchableOpacity>
            {hospitalErrors.city && <AppText style={styles.errorText}>{hospitalErrors.city}</AppText>}
          </View>

          {/* State - Auto-populated from pincode */}
          <View style={styles.dropdownContainer}>
            {(hospitalForm.state || states.length > 0 || pincodeStates.length > 0) && (
              <AppText style={[styles.floatingLabel, { color: colors.primary }]}>
                State<AppText style={styles.asteriskPrimary}>*</AppText>
              </AppText>
            )}
            <TouchableOpacity
              style={[styles.dropdown, hospitalErrors.state && styles.inputError]}
              onPress={() => {
                const availableStates = states.length > 0 ? states : pincodeStates;
                if (availableStates.length === 0) {
                  Toast.show({
                    type: 'info',
                    text1: 'State',
                    text2: 'State for this pincode',
                    position: 'top',
                  });
                } else {
                  setShowStateModal(true);
                }
              }}
            >
              <View style={styles.inputTextContainer}>
                <AppText style={hospitalForm.state ? styles.inputText : styles.placeholderText}>
                  {hospitalForm.state || ('State')}
                </AppText>
                {!hospitalForm.state && (
                  <AppText style={styles.inlineAsterisk}>*</AppText>
                )}
              </View>
              <Icon name="arrow-drop-down" size={24} color="#666" />
            </TouchableOpacity>
            {hospitalErrors.state && <AppText style={styles.errorText}>{hospitalErrors.state}</AppText>}
          </View>

          {/* Security Details */}
          <AppText style={styles.modalSectionLabel}>Security Details <AppText style={styles.mandatory}>*</AppText></AppText>
          <CustomInput
            placeholder="Mobile number"
            value={hospitalForm.mobileNumber}
            onChangeText={createFilteredInputHandler('mobileNumber', (text) => {
              setHospitalForm(prev => ({ ...prev, mobileNumber: text }));
              if (hospitalErrors.mobileNumber) {
                setHospitalErrors(prev => ({ ...prev, mobileNumber: null, mobileVerification: null }));
              }
            }, 10)}
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
            onChangeText={createFilteredInputHandler('emailAddress', (text) => {
              setHospitalForm(prev => ({ ...prev, emailAddress: text.toLowerCase() }));
              if (hospitalErrors.emailAddress) {
                setHospitalErrors(prev => ({ ...prev, emailAddress: null, emailVerification: null }));
              }
            }, 241)}
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
          <CustomInput
            placeholder="PAN number"
            maxLength={10}
            autoCapitalize="characters"
            value={hospitalForm.panNumber}
            onChangeText={createFilteredInputHandler('panNumber', (text) => {
              const upperText = text.toUpperCase();
              setHospitalForm(prev => ({ ...prev, panNumber: upperText }));
              if (hospitalErrors.panNumber) {
                setHospitalErrors(prev => ({ ...prev, panNumber: null }));
              }
            }, 10)}
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

          <CustomInput
            placeholder="GST number"
            maxLength={15}
            autoCapitalize="characters"
            value={hospitalForm.gstNumber}
            onChangeText={createFilteredInputHandler('gstNumber', (text) => {
              const upperText = text.toUpperCase();
              setHospitalForm(prev => ({ ...prev, gstNumber: upperText }));
              if (hospitalErrors.gstNumber) {
                setHospitalErrors(prev => ({ ...prev, gstNumber: null }));
              }
            }, 15)}
            error={hospitalErrors.gstNumber}
          />

          {/* Mapping Section */}
          <AppText style={styles.modalSectionLabel}>Mapping</AppText>




          <AppText style={styles.modalFieldLabel}>  {resolveCategoryLabel({
            typeId: formData?.typeId,
            categoryId: formData?.categoryId,
            subCategoryId: formData?.subCategoryId,
          })}</AppText>


          <View style={[styles.mappingPharmacyBox, { marginBottom: 20 }]}>
            <AppText style={styles.mappingPharmacyText}>{formData?.generalDetails?.name}</AppText>
          </View>

          {/* Add Stockist Section (Optional) */}
          <AppText style={styles.modalSectionLabel2}> Stockist Suggestions <AppText style={styles.optionalText}> (Optional)</AppText></AppText>
          <CustomInput
            placeholder="Name of the Stockist"
            value={hospitalForm.stockistName}
            onChangeText={createFilteredInputHandler('nameOfStockist', (text) => setHospitalForm(prev => ({ ...prev, stockistName: text })), 40)}
          />
          <CustomInput
            placeholder="Distributor Code"
            value={hospitalForm.stockistCode}
            onChangeText={createFilteredInputHandler('distributorCode', (text) => setHospitalForm(prev => ({ ...prev, stockistCode: text })), 20)}
          />
          <CustomInput
            placeholder="City"
            value={hospitalForm.stockistCity}
            onChangeText={createFilteredInputHandler('distributorCity', (text) => setHospitalForm(prev => ({ ...prev, stockistCity: text })), 40)}
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
          selectedId={hospitalForm.stationCode}
          onSelect={item => {
            setHospitalForm(prev => ({
              ...prev,
              stationCode: item.name,
            }));
            setHospitalErrors(prev => ({ ...prev, stationCode: null }));
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
          selectedId={hospitalForm.areaId}
          onSelect={item => {
            setHospitalForm(prev => ({
              ...prev,
              areaId: item.id,
              area: item.name,
            }));
            setHospitalErrors(prev => ({ ...prev, area: null }));
          }}
          loading={false}
        />

        <SearchableDropdownModal
          visible={showStateModal}
          onClose={() => setShowStateModal(false)}
          title="Select State"
          data={states}
          selectedId={hospitalForm.stateId}
          onSelect={item => {
            setHospitalForm(prev => ({
              ...prev,
              stateId: item.id,
              state: item.name,
            }));
            setHospitalErrors(prev => ({ ...prev, stateId: null }));
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
          selectedId={hospitalForm.cityId}
          onSelect={item => {
            setHospitalForm(prev => ({
              ...prev,
              cityId: item.id,
              city: item.name,
            }));
            setHospitalErrors(prev => ({ ...prev, cityId: null }));
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


  inlineVerifyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 4,
    marginLeft: 8,
  },
  inlineVerifyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    // backgroundColor: '#FFF5ED',
    borderRadius: 16,
  },
  inlineVerifyText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
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
  verifiedButton: {
    // backgroundColor: '#4CAF50',
    // borderColor: '#4CAF50',
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
  radioGroupHorizontal: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 24,
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
  dropdown: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.loginInputBorderColor,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },




  inlineVerifyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 4,
    marginLeft: 8,
  },

  verifiedText: {
    color: colors.primary
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

  placeholderText: {
    fontSize: 16,
    color: colors.gray,
    marginLeft: 8
  },
  inputText: {
    fontSize: 16,
    color: '#333',
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
  dropdownContainer: {
    marginBottom: 18,
  },

  asteriskPrimary: {
    color: "red",
    fontSize: 16
  },
});

export default AddNewHospitalModal;