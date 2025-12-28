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
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../styles/colors';
import Toast from 'react-native-toast-message';
import { customerAPI } from '../../../api/customer';
import FileUploadComponent from '../../../components/FileUploadComponent';
import AddressInputWithLocation from '../../../components/AddressInputWithLocation';
import { AppText, AppInput, CustomInput } from "../../../components"
import { usePincodeLookup } from '../../../hooks/usePincodeLookup';
import FloatingDateInput from '../../../components/FloatingDateInput';
import { validateField, isValidPAN, isValidGST, isValidEmail, isValidMobile, isValidPincode, createFilteredInputHandler, filterForField } from '../../../utils/formValidation';
import { useSelector } from 'react-redux';
import SearchableDropdownModal from '../../../components/modals/SearchableDropdownModal';


const DOC_TYPES = {
  CLINIC_REGISTRATION: 8,
  PRACTICE_LICENSE: 10,
  ADDRESS_PROOF: 11,
  CLINIC_IMAGE: 1,
  PAN: 7,
  GST: 2,
};

const AddNewDoctorModal = ({ visible, onClose, onSubmit, onAdd, mappingName, mappingLabel }) => {


  const loggedInUser = useSelector(state => state.auth.user);

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
    stationCode: "",

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
    areaId:null,
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
  const [licenseTypes, setLicenseTypes] = useState({

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



  // API Data
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
    const [searchCities, setSearchCities] = useState(null);
  
  const [uploadedAreas, setUploadedAreas] = useState([]); // For OCR-extracted areas
 // Modal visibility
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [showStationModal, setShowStationModal] = useState(false);

  // Pincode lookup hook
  const { areas: pincodeAreas, cities: pincodeCities, states: pincodeStates, loading: pincodeLoading, lookupByPincode, clearData } = usePincodeLookup();


  // useeffect section start/////////////////////////////

  useEffect(() => {
    if (visible) {
      loadInitialData();
    }
  }, [visible]);
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
      setDoctorForm(prev => ({
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
      setDoctorForm(prev => ({
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
      setDoctorForm(prev => ({
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
  // function section start/////////////////////////////

  const loadInitialData = async () => {
    // Note: States and cities are now loaded via pincode lookup only
    // Load license types from API
    try {
      const licenseResponse = await customerAPI.getLicenseTypes(1, 1); // typeId: 1 (pharmacy), categoryId: 1 (Only Retailer)

      if (licenseResponse.success && licenseResponse.data) {
        const licenseData = {};
        licenseResponse.data.forEach(license => {
          if (license.code === 'CLINIC_REG' || license.id === 7) {
            licenseData.CLINIC_REGISTRATION = {
              id: license.id,
              docTypeId: license.docTypeId,
              name: license.name,
              code: license.code,
            };
          } else if (license.code === 'PRACTICE_LIC' || license.id === 6) {
            licenseData.PRACTICE_LICENSE = {
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



    } catch (error) {
      console.error('Error fetching license types:', error);
      // Keep default values if API fails
    }
  };
  // Handle pincode change and trigger lookup
  const handlePincodeChange = async text => {
    // Filter pincode input to only allow digits
    const filtered = createFilteredInputHandler('pincode', null, 6)(text);
    // If filtered text is different, it means invalid characters were typed, so don't proceed
    if (filtered !== text && text.length > filtered.length) return;

    setDoctorForm(prev => ({ ...prev, pincode: filtered }));
    setDoctorErrors(prev => ({ ...prev, pincode: null }));


    // If user is editing pincode manually, clear any OCR/upload-derived area list
    if (uploadedAreas && uploadedAreas.length > 0) {
      setUploadedAreas([]); // prefer manual lookup results from pincode
    }

    // Clear previous selections when pincode becomes incomplete
    if (filtered.length < 6) {
      setDoctorForm(prev => ({
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
      setDoctorForm(prev => {
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
      setDoctorErrors(prev => ({
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
    if (!doctorForm.stateId) {
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
        stateId: doctorForm?.stateId, // based on PIN/state
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
      setDoctorForm(prev => ({
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

  const handleLicenseOcrData = async (ocrData) => {
    console.log('Clinic Registration OCR Data:', ocrData);

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

    // Populate clinic name if available
    if (ocrData.clinicName && !doctorForm.clinicName) {
      updates.clinicName = filterForField('clinicName', ocrData.clinicName, 40);
    } else if (ocrData.hospitalName && !doctorForm.clinicName) {
      updates.clinicName = filterForField('clinicName', ocrData.hospitalName, 40);
    }
    else if (ocrData.pharmacyName && !doctorForm.clinicName) {
      updates.clinicName = filterForField('clinicName', ocrData.pharmacyName, 40);
    }

    // Split and populate address fields
    if (ocrData.address) {
      const addressParts = splitAddress(ocrData.address);
      if (!doctorForm.address1 && addressParts.address1) {
        updates.address1 = filterForField('address1', addressParts.address1, 40);
      }
      if (!doctorForm.address2 && addressParts.address2) {
        updates.address2 = filterForField('address2', addressParts.address2, 40);
      }
      if (!doctorForm.address3 && addressParts.address3) {
        updates.address3 = filterForField('address3', addressParts.address3, 60);
      }
    }

    // Populate registration number if available

    
        // License number
        const licenseMap = {
          PRLIC: { number: 'practiceLicenseNumber', expiry: 'practiceLicenseExpiryDate' },
          REG: { number: 'clinicRegistrationNumber', expiry: 'clinicRegistrationExpiryDate' },
    
        };
    
        const map = licenseMap[ocrData.doctypeCode];
    
        if (map) {
          const value =
            ocrData.registrationNumber ||
            ocrData.licenseNumber;
    
          if (value) {
            updates[map.number] = filterForField(map.number, value, 20);
          }
    
          // Expiry Date
          if (ocrData.expiryDate) {
            const [dd, mm, yyyy] = ocrData.issueDate.split('-');
            if (dd && mm && yyyy) {
              updates[map.expiry] = `${yyyy}-${mm}-${dd}`;
            }
          }
        }


  


    // Populate pincode
    if (ocrData.pincode && !doctorForm.pincode) {
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
      setDoctorForm(prev => ({ ...prev, ...updates }));
      const errorUpdates = {};
      Object.keys(updates).forEach(key => {
        errorUpdates[key] = null;
      });
      setDoctorErrors(prev => ({ ...prev, ...errorUpdates }));
    }

    // Trigger pincode lookup if pincode is available and valid (6 digits) and locationDetails not available
    if (!location && (ocrData.pincode || ocrData.Pincode) && /^\d{6}$/.test(String(ocrData.pincode || ocrData.Pincode))) {
      await lookupByPincode(String(ocrData.pincode || ocrData.Pincode));
    }
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

  const handleFileUpload = async(field, file) => {
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
        setDoctorForm(prev => ({ ...prev, ...updates }));
        const clearErrs = {};
        if (updates.areaId) clearErrs.area = null;
        if (updates.cityId) clearErrs.cityId = null;
        if (updates.stateId) clearErrs.stateId = null;
        if (updates.pincode) clearErrs.pincode = null;
        setDoctorErrors(prev => ({ ...prev, ...clearErrs }));
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
          setDoctorForm(prev => {
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


    if (
      field === 'mobile' &&
      (!doctorForm.mobileNumber ||
        !/^[6-9]\d{9}$/.test(doctorForm.mobileNumber))
    ) {
      setDoctorErrors(prev => ({
        ...prev,
        mobileNumber: 'Please enter valid 10-digit mobile number',
      }));
      return;
    }
    if (
      field === 'email' &&
      (!doctorForm.emailAddress ||
        !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(doctorForm.emailAddress))
    ) {
      setDoctorErrors(prev => ({
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

        setDoctorErrors(prev => ({
          ...prev,
          [`${field}Verification`]: null,
        }));

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
  const formatDateForAPI = (date) => {
    if (!date) return null;
    const d = new Date(date);
    // Add time component to avoid timezone issues
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
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

    if (!doctorForm.addressProofFile && !documentIds.addressProof) {
      newErrors.addressProofFile = 'Address Proof is required';

    }



    if (!doctorForm.stationCode)
      newErrors.stationCode = 'Station Code is required';
    // Doctor Name validation using reusable validation utility
    const doctorNameError = validateField('nameOfDoctor', doctorForm.doctorName, true, 'Doctor name is required');
    if (doctorNameError) newErrors.doctorName = doctorNameError;
    if (doctorForm.doctorName && doctorForm.doctorName.trim().length < 3) {
      newErrors.doctorName = 'Doctor name must be at least 3 characters';
    }

    // Speciality validation using reusable validation utility
    const specialityError = validateField('speciality', doctorForm.speciality, true, 'Speciality is required');
    if (specialityError) newErrors.speciality = specialityError;

    // Address validation using reusable validation utility
    const address1Error = validateField('address1', doctorForm.address1, true, 'Address 1 is required');
    if (address1Error) newErrors.address1 = address1Error;

    const address2Error = validateField('address2', doctorForm.address2, true, 'Address 2 is required');
    if (address2Error) newErrors.address2 = address2Error;

    const address3Error = validateField('address3', doctorForm.address3, true, 'Address 3 is required');
    if (address3Error) newErrors.address3 = address3Error;

    const pincodeError = validateField('pincode', doctorForm.pincode, true, 'Valid 6-digit pincode is required');
    if (pincodeError) newErrors.pincode = pincodeError;

    const areaError = validateField('area', doctorForm.area, true, 'Area is required');
    if (areaError) newErrors.area = areaError;

    // City validation
    if (!doctorForm.city || !doctorForm.cityId) {
      newErrors.city = 'City is required';
    }

    // State validation
    if (!doctorForm.state || !doctorForm.stateId) {
      newErrors.state = 'State is required';
    }

    // Mobile Number validation using reusable validation utility
    const mobileError = validateField('mobileNo', doctorForm.mobileNumber, true, 'Valid 10-digit mobile number is required');
    if (mobileError) newErrors.mobileNumber = mobileError;
    if (!verificationStatus.mobile) {
      newErrors.mobileVerification = 'Please verify mobile number';
    }

    // Email Address validation using reusable validation utility
    const emailError = validateField('emailAddress', doctorForm.emailAddress, true, 'Valid email address is required');
    if (emailError) newErrors.emailAddress = emailError;
    if (!verificationStatus.email) {
      newErrors.emailVerification = 'Please verify email address';
    }

    // PAN validation using reusable validation utility
    if (!doctorForm.panFile && !documentIds.pan) {
      newErrors.panFile = 'PAN document is required';
    }
    const panError = validateField('panNo', doctorForm.panNumber, true, 'Valid PAN number is required (e.g., ABCDE1234F)');
    if (panError) newErrors.panNumber = panError;

    // GST validation using reusable validation utility
    if (doctorForm.gstNumber && doctorForm.gstNumber.trim() !== '') {
      const gstError = validateField('gstNo', doctorForm.gstNumber, false, 'Invalid GST format');
      if (gstError) newErrors.gstNumber = gstError;
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
              licenceTypeId: licenseTypes.CLINIC_REGISTRATION?.id || 7,
              licenceNo: doctorForm.clinicRegistrationNumber,
              licenceValidUpto: formatDateForAPI(doctorForm.clinicRegistrationExpiryDate),
            },
            {
              licenceTypeId: licenseTypes.PRACTICE_LICENSE?.id || 6,
              licenceNo: doctorForm.practiceLicenseNumber,
              licenceValidUpto: formatDateForAPI(doctorForm.practiceLicenseExpiryDate),
            }
          ]
        },
        customerDocs: uploadedDocs,
        isBuyer: true,
        customerGroupId: 1,
        stationCode: doctorForm.stationCode,
        generalDetails: {
          name: doctorForm.doctorName,
          shortName: '',
          address1: doctorForm.address1,
          address2: doctorForm.address2 || '',
          address3: doctorForm.address3 || '',
          address4: doctorForm.address4 || '',
          pincode: parseInt(doctorForm.pincode),
          area: doctorForm.area,
          areaId: parseInt(doctorForm.areaId),
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
          ...(doctorForm.gstNumber ? { gstNumber: doctorForm.gstNumber } : {}),
        },
        suggestedDistributors: [{
          distributorCode: '',
          distributorName: '',
          city: ''
        }],
        isChildCustomer: true
      };

      console.log('Doctor registration payload:', registrationData);
      console.log('=== Calling API: customerAPI.createCustomer ===');

      const response = await customerAPI.createCustomer(registrationData);


      if (response?.success) {
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
      Toast.show({
        type: 'error',
        text1: 'Registration Faild',
        text2: error.response?.message || 'An error occurred while registering the doctor. Please try again.',
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
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
          <AppText style={styles.modalTitle}>Add Doctor Account</AppText>
        </View>
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>


          {/* License Details */}
          <AppText style={styles.modalSectionLabel}>License Details<AppText style={styles.mandatory}>*</AppText></AppText>

          {/* Clinic Registration Certificate */}
          <AppText style={styles.fieldLabel}>Clinic registration<AppText style={styles.mandatory}>*</AppText></AppText>
          <FileUploadComponent
            placeholder="Upload Certificate"
            accept={['pdf', 'jpg', 'png', 'jpeg']}
            maxSize={15 * 1024 * 1024}
            docType={licenseTypes.CLINIC_REGISTRATION?.docTypeId || 8}
            initialFile={doctorForm.clinicRegistrationCertificateFile}
            onFileUpload={(file) => handleFileUpload('clinicRegistrationCertificate', file)}
            onFileDelete={() => handleFileDelete('clinicRegistrationCertificate')}
            errorMessage={doctorErrors.clinicRegistrationCertificateFile}
            onOcrDataExtracted={handleLicenseOcrData}



          />


          <CustomInput
            placeholder="Clinic Registration number"
            value={doctorForm.clinicRegistrationNumber}
            onChangeText={createFilteredInputHandler('clinicRegistrationNumber', (text) => {
              setDoctorForm(prev => ({ ...prev, clinicRegistrationNumber: text }));
              if (doctorErrors.clinicRegistrationNumber) {
                setDoctorErrors(prev => ({ ...prev, clinicRegistrationNumber: null }));
              }
            }, 20)}
            mandatory={true}
            error={doctorErrors.clinicRegistrationNumber}
          />




          <FloatingDateInput
            label="Expiry Date"
            mandatory={true}
            value={doctorForm.clinicRegistrationExpiryDate}
            error={doctorErrors.clinicRegistrationExpiryDate}
            minimumDate={new Date()}    // If future date only (optional)
            onChange={(date) => {
              setDoctorForm(prev => ({ ...prev, clinicRegistrationExpiryDate: date }));
              setDoctorErrors(prev => ({ ...prev, clinicRegistrationExpiryDate: null }));
            }}
          />


          {/* Practice License */}
          <AppText style={[styles.fieldLabel, styles.sectionTopSpacing]}>Practice license<AppText style={styles.mandatory}>*</AppText></AppText>
          <FileUploadComponent
            placeholder="Upload License"
            accept={['pdf', 'jpg', 'png', 'jpeg']}
            maxSize={15 * 1024 * 1024}
            docType={licenseTypes.PRACTICE_LICENSE?.docTypeId || 10}
            initialFile={doctorForm.practiceLicenseFile}
            onFileUpload={(file) => handleFileUpload('practiceLicense', file)}
            onFileDelete={() => handleFileDelete('practiceLicense')}
            errorMessage={doctorErrors.practiceLicenseFile}
            onOcrDataExtracted={handleLicenseOcrData}



          />





          <CustomInput
            placeholder="Practice License Number"
            value={doctorForm.practiceLicenseNumber}
            onChangeText={createFilteredInputHandler('practiceLicenseNumber', (text) => {
              setDoctorForm(prev => ({ ...prev, practiceLicenseNumber: text }));
              if (doctorErrors.practiceLicenseNumber) {
                setDoctorErrors(prev => ({ ...prev, practiceLicenseNumber: null }));
              }
            }, 20)}
            mandatory={true}
            error={doctorErrors.practiceLicenseNumber}
          />





          <FloatingDateInput
            label="Expiry Date"
            mandatory={true}
            value={doctorForm.practiceLicenseExpiryDate}
            error={doctorErrors.practiceLicenseExpiryDate}
            minimumDate={new Date()}    // If future date only (optional)
            onChange={(date) => {
              setDoctorForm(prev => ({ ...prev, practiceLicenseExpiryDate: date }));
              setDoctorErrors(prev => ({ ...prev, practiceLicenseExpiryDate: null }));
            }}
          />


          {/* Address Proof / Clinic Image */}
          <AppText style={[styles.fieldLabel, styles.sectionTopSpacing]}>Address Proof<AppText style={styles.mandatory}>*</AppText></AppText>
          <FileUploadComponent
            placeholder="Upload Electricity/Telephone bill"
            accept={['jpg', 'png', 'jpeg']}
            maxSize={15 * 1024 * 1024}
            docType={DOC_TYPES.ADDRESS_PROOF}
            initialFile={doctorForm.addressProofFile}
            onFileUpload={(file) => handleFileUpload('addressProof', file)}
            onFileDelete={() => handleFileDelete('addressProof')}
            errorMessage={doctorErrors.addressProofFile}
          />

          {/* Address Proof / Clinic Image */}
          <AppText style={[styles.fieldLabel, styles.sectionTopSpacing]}>Clinic image<AppText style={styles.mandatory}>*</AppText></AppText>
          <FileUploadComponent
            placeholder="Upload"
            accept={['jpg', 'png', 'jpeg']}
            maxSize={15 * 1024 * 1024}
            docType={DOC_TYPES.CLINIC_IMAGE}
            initialFile={doctorForm.clinicImageFile}
            onFileUpload={(file) => handleFileUpload('clinicImage', file)}
            onFileDelete={() => handleFileDelete('clinicImage')}
            errorMessage={doctorErrors.clinicImageFile}
          />







          {/* General Details */}
          <AppText style={styles.modalSectionLabel}>General Details <AppText style={styles.mandatory}>*</AppText></AppText>


          <CustomInput
            placeholder="Name of the Doctor"
            value={doctorForm.doctorName}
            onChangeText={createFilteredInputHandler('doctorName', (text) => {
              setDoctorForm(prev => ({ ...prev, doctorName: text }));
              if (doctorErrors.doctorName) {
                setDoctorErrors(prev => ({ ...prev, doctorName: null }));
              }
            }, 40)}
            mandatory={true}
            error={doctorErrors.doctorName}
          />





          <CustomInput
            placeholder="Speciality"
            value={doctorForm.speciality}
            onChangeText={createFilteredInputHandler('speciality', (text) => {
              setDoctorForm(prev => ({ ...prev, speciality: text }));
              if (doctorErrors.speciality) {
                setDoctorErrors(prev => ({ ...prev, speciality: null }));
              }
            }, 40)}
            mandatory={true}
            error={doctorErrors.speciality}
          />




          <CustomInput
            placeholder="Clinic Name"
            value={doctorForm.clinicName}
            onChangeText={createFilteredInputHandler('clinicName', (text) => {
              setDoctorForm(prev => ({ ...prev, clinicName: text }));
            }, 40)}
          />

          {/* Station code */}
          <View style={styles.dropdownContainer}>
            {(doctorForm.stationCode) && (
              <AppText
                style={[styles.floatingLabel, { color: colors.primary }]}
              >
                Station<AppText style={styles.asteriskPrimary}>*</AppText>
              </AppText>
            )}
            <TouchableOpacity
              style={[styles.dropdown, doctorErrors.stationCode && styles.inputError]}
              onPress={() => setShowStationModal(true)}
            >
              <View style={styles.inputTextContainer}>
                <AppText style={doctorForm.stationCode ? styles.inputText : styles.placeholderText}>
                  {doctorForm.stationCode || ('Station')}
                </AppText>
                {!doctorForm.stationCode && (
                  <AppText style={styles.inlineAsterisk}>*</AppText>
                )}
              </View>
              <Icon name="arrow-drop-down" size={24} color="#666" />
            </TouchableOpacity>

            {doctorErrors.stationCode && (
              <AppText style={styles.errorText}>{doctorErrors.stationCode}</AppText>
            )}
          </View>

          <AddressInputWithLocation
            label="Address 1"
            value={doctorForm.address1}
            onChangeText={createFilteredInputHandler('address1', (text) => {
              setDoctorForm(prev => ({ ...prev, address1: text }));
              if (doctorErrors.address1) {
                setDoctorErrors(prev => ({ ...prev, address1: null }));
              }
            }, 40)}
            placeholder="Address 1 "
            error={doctorErrors.address1}
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
              setDoctorForm(prev => ({
                ...prev,
                address1: filterForField('address1', filteredParts[0] || '', 40),
                address2: filterForField('address2', filteredParts[1] || '', 40),
                address3: filterForField('address3', filteredParts[2] || '', 60),
                address4: filteredParts.slice(3).join(', ') || '',
              }));


              // Update pincode and trigger lookup (this will populate area, city, state)
              if (extractedPincode) {
                setDoctorForm(prev => ({ ...prev, pincode: extractedPincode }));
                setDoctorErrors(prev => ({ ...prev, pincode: null }));
                // Trigger pincode lookup to populate area, city, state
                await lookupByPincode(extractedPincode);
              }

              setDoctorErrors(prev => ({
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
            value={doctorForm.address2}
            onChangeText={createFilteredInputHandler('address2', (text) => setDoctorForm(prev => ({ ...prev, address2: text })), 40)}
            mandatory={true}
            error={doctorErrors.address2}
          />

          <CustomInput
            placeholder="Address 3"
            value={doctorForm.address3}
            onChangeText={createFilteredInputHandler('address3', (text) => setDoctorForm(prev => ({ ...prev, address3: text })), 60)}
            mandatory={true}
            error={doctorErrors.address3}

          />

          <CustomInput
            placeholder="Address 4"
            value={doctorForm.address4}
            onChangeText={createFilteredInputHandler('address4', (text) => setDoctorForm(prev => ({ ...prev, address4: text })), 60)}
          />



          <CustomInput
            placeholder="Pincode"
            keyboardType="numeric"
            maxLength={6}
            value={doctorForm.pincode}
            onChangeText={handlePincodeChange}
            mandatory={true}
            error={doctorErrors.pincode}
          />


          {/* Area Dropdown */}
          <View style={styles.dropdownContainer}>
            {(doctorForm.area || pincodeAreas.length > 0) && (
              <AppText style={[styles.floatingLabel, { color: colors.primary }]}>
                Area<AppText style={styles.asteriskPrimary}>*</AppText>
              </AppText>
            )}
            <TouchableOpacity
              style={[styles.dropdown, doctorErrors.area && styles.inputError]}
              onPress={() => {
                if (pincodeAreas.length === 0) {
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
                <AppText style={doctorForm.area ? styles.inputText : styles.placeholderText}>
                  {doctorForm.area || 'Area'}
                </AppText>
                {!doctorForm.area && (
                  <AppText style={styles.inlineAsterisk}>*</AppText>
                )}
              </View>
              <Icon name="arrow-drop-down" size={24} color="#666" />
            </TouchableOpacity>
            {doctorErrors.area && <AppText style={styles.errorText}>{doctorErrors.area}</AppText>}
          </View>

          {/* City - Auto-populated from pincode */}
          <View style={styles.dropdownContainer}>
            {(doctorForm.city || pincodeCities.length > 0) && (
              <AppText style={[styles.floatingLabel, { color: colors.primary }]}>
                City<AppText style={styles.asteriskPrimary}>*</AppText>
              </AppText>
            )}
            <TouchableOpacity
              style={[styles.dropdown, doctorErrors.city && styles.inputError]}
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
                <AppText style={doctorForm.city ? styles.inputText : styles.placeholderText}>
                  {doctorForm.city || ('City')}
                </AppText>
                {!doctorForm.city && (
                  <AppText style={styles.inlineAsterisk}>*</AppText>
                )}
              </View>
              <Icon name="arrow-drop-down" size={24} color="#666" />
            </TouchableOpacity>
            {doctorErrors.city && <AppText style={styles.errorText}>{doctorErrors.city}</AppText>}
          </View>

          {/* State - Auto-populated from pincode */}
          <View style={styles.dropdownContainer}>
            {(doctorForm.state || pincodeStates.length > 0) && (
              <AppText style={[styles.floatingLabel, { color: colors.primary }]}>
                State<AppText style={styles.asteriskPrimary}>*</AppText>
              </AppText>
            )}
            <TouchableOpacity
              style={[styles.dropdown, doctorErrors.state && styles.inputError]}
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
                <AppText style={doctorForm.state ? styles.inputText : styles.placeholderText}>
                  {doctorForm.state || ('State')}
                </AppText>
                {!doctorForm.state && (
                  <AppText style={styles.inlineAsterisk}>*</AppText>
                )}
              </View>
              <Icon name="arrow-drop-down" size={24} color="#666" />
            </TouchableOpacity>
            {doctorErrors.state && <AppText style={styles.errorText}>{doctorErrors.state}</AppText>}
          </View>

          {/* Security Details */}
          <AppText style={styles.modalSectionLabel}>Security Details <AppText style={styles.mandatory}>*</AppText></AppText>
          <CustomInput
            placeholder="Mobile number"
            value={doctorForm.mobileNumber}
            onChangeText={createFilteredInputHandler('mobileNumber', (text) => {
              setDoctorForm(prev => ({ ...prev, mobileNumber: text }));
              if (doctorErrors.mobileNumber) {
                setDoctorErrors(prev => ({ ...prev, mobileNumber: null, mobileVerification: null }));
              }
            }, 10)}
            keyboardType="phone-pad"
            maxLength={10}
            editable={!verificationStatus.mobile}
            mandatory={true}
            error={doctorErrors.mobileNumber || doctorErrors.mobileVerification}
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
            value={doctorForm.emailAddress}
            onChangeText={createFilteredInputHandler('emailAddress', (text) => {
              setDoctorForm(prev => ({ ...prev, emailAddress: text.toLowerCase() }));
              if (doctorErrors.emailAddress) {
                setDoctorErrors(prev => ({ ...prev, emailAddress: null, emailVerification: null }));
              }
            }, 241)}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!verificationStatus.email}
            mandatory={true}
            error={doctorErrors.emailAddress || doctorErrors.emailVerification}
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

          {/* PAN */}
          {/* <AppText style={styles.modalFieldLabel}>Upload PAN <AppText style={styles.mandatory}>*</AppText></AppText> */}
          <FileUploadComponent
            placeholder="Upload PAN"
            accept={['pdf', 'jpg', 'png', 'jpeg']}
            maxSize={15 * 1024 * 1024}
            docType={DOC_TYPES.PAN}
            mandatory
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


          <CustomInput
            placeholder="PAN number"
            value={doctorForm.panNumber}
            onChangeText={createFilteredInputHandler('panNumber', (text) => {
              const upperText = text.toUpperCase();
              setDoctorForm(prev => ({ ...prev, panNumber: upperText }));
              if (doctorErrors.panNumber) {
                setDoctorErrors(prev => ({ ...prev, panNumber: null }));
              }
            }, 10)}
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
          {/* <AppText style={styles.modalFieldLabel}>Upload GST <AppText style={styles.mandatory}>*</AppText></AppText> */}
          <FileUploadComponent
            placeholder="Upload GST"
            accept={['pdf', 'jpg', 'png', 'jpeg']}
            maxSize={15 * 1024 * 1024}
            docType={DOC_TYPES.GST}
            initialFile={doctorForm.gstFile}
            onFileUpload={(file) => handleFileUpload('gst', file)}
            onFileDelete={() => handleFileDelete('gst')}
            onOcrDataExtracted={(ocrData) => {
              console.log('GST OCR Data:', ocrData);
              if (ocrData.gstNumber) {
                setDoctorForm(prev => ({ ...prev, gstNumber: ocrData.gstNumber }));

              }
            }}
          />




          <CustomInput
            placeholder="GST number"
            maxLength={15}
            autoCapitalize="characters"
            value={doctorForm.gstNumber}
            onChangeText={createFilteredInputHandler('gstNumber', (text) => {
              const upperText = text.toUpperCase();
              setDoctorForm(prev => ({ ...prev, gstNumber: upperText }));
              if (doctorErrors.gstNumber) {
                setDoctorErrors(prev => ({ ...prev, gstNumber: null }));
              }
            }, 15)}

            error={doctorErrors.gstNumber}
          />

          {/* Mapping Section */}
          <AppText style={styles.modalSectionLabel}>Mapping</AppText>
          <AppText style={styles.modalFieldLabel}>{mappingLabel || "Hospital"}</AppText>
          <View style={[styles.mappingPharmacyBox, { marginBottom: 20 }]}>
            <AppText style={styles.mappingPharmacyText}>{mappingName || 'Pharmacy name will appear here'}</AppText>
          </View>

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
                <AppText style={styles.submitButtonText}>Submit</AppText>
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
        selectedId={doctorForm.stationCode}
        onSelect={item => {
          setDoctorForm(prev => ({
            ...prev,
            stationCode: item.name,
          }));
          setDoctorErrors(prev => ({ ...prev, stationCode: null }));
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
        selectedId={doctorForm.areaId}
        onSelect={item => {
          setDoctorForm(prev => ({
            ...prev,
            areaId: item.id,
            area: item.name,
          }));
          setDoctorErrors(prev => ({ ...prev, area: null }));
        }}
        loading={false}
      />

      <SearchableDropdownModal
        visible={showStateModal}
        onClose={() => setShowStateModal(false)}
        title="Select State"
        data={states}
        selectedId={doctorForm.stateId}
        onSelect={item => {
          setDoctorForm(prev => ({
            ...prev,
            stateId: item.id,
            state: item.name,
          }));
          setDoctorErrors(prev => ({ ...prev, stateId: null }));
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
        selectedId={doctorForm.cityId}
        onSelect={item => {
          setDoctorForm(prev => ({
            ...prev,
            cityId: item.id,
            city: item.name,
          }));
          setDoctorErrors(prev => ({ ...prev, cityId: null }));
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
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
    marginVertical: 8
  },
  sectionTopSpacing: {
    marginTop: 20

  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 0,
  },
 
  inputError: {
    borderColor: colors.error,
    borderWidth: 1.5,
  },
  errorText: {

    color: colors.error,
    fontSize: 12,
    marginLeft: 4,
    marginTop: 2
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

  inlineVerifyText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
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


  verifiedText: {
    color: colors.primary
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

export default AddNewDoctorModal;
