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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../styles/colors';
import Toast from 'react-native-toast-message';
import { customerAPI } from '../../../api/customer';
import FileUploadComponent from '../../../components/FileUploadComponent';
import AppText from "../../../components/AppText"

const DOC_TYPES = {
  LICENSE_20B: 4,
  LICENSE_21B: 6,
  PHARMACY_IMAGE: 1,
  PAN: 7,
  GST: 8,
};

const AddNewPharmacyModal = ({ visible, onClose, onSubmit }) => {
  const [pharmacyForm, setPharmacyForm] = useState({
    license20b: '',
    license20bFile: null,
    license20bExpiryDate: '',
    license21b: '',
    license21bFile: null,
    license21bExpiryDate: '',
    pharmacyImageFile: null,
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
  
  // API Data
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  
  // Dropdowns
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);

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
    setPharmacyForm(prev => ({ ...prev, city: '', cityId: null }));
    
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

  const resetForm = () => {
    setPharmacyForm({
      license20b: '',
      license20bFile: null,
      license20bExpiryDate: '',
      license21b: '',
      license21bFile: null,
      license21bExpiryDate: '',
      pharmacyImageFile: null,
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
      mobileNumber: '',
      emailAddress: '',
      panFile: null,
      panNumber: '',
      gstFile: null,
      gstNumber: '',
    });
    setPharmacyErrors({});
    setCities([]);
    setDocumentIds({});
  };

  const handleFileUpload = (field, file) => {
    if (file && file.id) {
      setDocumentIds(prev => ({ ...prev, [field]: file.id }));
    }
    setPharmacyForm(prev => ({ ...prev, [`${field}File`]: file }));
    setPharmacyErrors(prev => ({ ...prev, [`${field}File`]: null }));
  };

  const handleFileDelete = (field) => {
    setDocumentIds(prev => ({ ...prev, [field]: null }));
    setPharmacyForm(prev => ({ ...prev, [`${field}File`]: null }));
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    // Validate mandatory fields
    const newErrors = {};
    if (!pharmacyForm.pharmacyName) newErrors.pharmacyName = 'Pharmacy name is required';
    if (!pharmacyForm.address1) newErrors.address1 = 'Address 1 is required';
    if (!pharmacyForm.pincode) newErrors.pincode = 'Pincode is required';
    if (!pharmacyForm.mobileNumber) newErrors.mobileNumber = 'Mobile number is required';
    if (!pharmacyForm.emailAddress) newErrors.emailAddress = 'Email address is required';
    if (!pharmacyForm.panNumber) newErrors.panNumber = 'PAN number is required';
    if (!pharmacyForm.gstNumber) newErrors.gstNumber = 'GST number is required';

    if (Object.keys(newErrors).length > 0) {
      setPharmacyErrors(newErrors);
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill all mandatory fields',
      });
      return;
    }

    // Create pharmacy object
    const newPharmacy = {
      id: Date.now(),
      name: pharmacyForm.pharmacyName,
      shortName: pharmacyForm.shortName,
      ...pharmacyForm,
    };

    // Call parent callback with pharmacy data
    onSubmit(newPharmacy);

    // Reset and close
    resetForm();
    Toast.show({
      type: 'success',
      text1: 'Pharmacy Added',
      text2: 'Pharmacy has been added successfully',
    });
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

          {/* License Details - 20B */}
          <AppText style={styles.modalSectionLabel}>Licence Details <AppText style={styles.mandatory}>*</AppText></AppText>
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
          <TextInput
            style={[styles.modalInput, { marginBottom: 10 }]}
            placeholder="Drug license number"
            placeholderTextColor="#999"
            value={pharmacyForm.license20b}
            onChangeText={(text) => setPharmacyForm(prev => ({ ...prev, license20b: text }))}
          />
          <TouchableOpacity style={[styles.modalInput, { marginBottom: 10 }]}>
            <AppText style={styles.dropdownPlaceholder}>Expiry date</AppText>
          </TouchableOpacity>

          {/* License Details - 21B */}
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
          <TextInput
            style={[styles.modalInput, { marginBottom: 10 }]}
            placeholder="Drug license number"
            placeholderTextColor="#999"
            value={pharmacyForm.license21b}
            onChangeText={(text) => setPharmacyForm(prev => ({ ...prev, license21b: text }))}
          />
          <TouchableOpacity style={[styles.modalInput, { marginBottom: 10 }]}>
            <AppText style={styles.dropdownPlaceholder}>Expiry date</AppText>
          </TouchableOpacity>

          {/* Pharmacy Image */}
          <FileUploadComponent
            placeholder="Pharmacy Image*"
            accept={['jpg', 'png', 'jpeg']}
            maxSize={10 * 1024 * 1024}
            docType={DOC_TYPES.PHARMACY_IMAGE}
            initialFile={pharmacyForm.pharmacyImageFile}
            onFileUpload={(file) => handleFileUpload('pharmacyImage', file)}
            onFileDelete={() => handleFileDelete('pharmacyImage')}
            errorMessage={pharmacyErrors.pharmacyImageFile}
          />

          {/* General Details */}
          <AppText style={styles.modalSectionLabel}>General Details <AppText style={styles.mandatory}>*</AppText></AppText>
          <TextInput
            style={[styles.modalInput, { marginBottom: 10 }]}
            placeholder="Name of the Pharmacy"
            placeholderTextColor="#999"
            value={pharmacyForm.pharmacyName}
            onChangeText={(text) => setPharmacyForm(prev => ({ ...prev, pharmacyName: text }))}
          />

          <TextInput
            style={[styles.modalInput, { marginBottom: 10 }]}
            placeholder="Short Name (Optional)"
            placeholderTextColor="#999"
            value={pharmacyForm.shortName}
            onChangeText={(text) => setPharmacyForm(prev => ({ ...prev, shortName: text }))}
          />

          <TextInput
            style={[styles.modalInput, { marginBottom: 10 }]}
            placeholder="Address 1 *"
            placeholderTextColor="#999"
            value={pharmacyForm.address1}
            onChangeText={(text) => setPharmacyForm(prev => ({ ...prev, address1: text }))}
          />

          <TextInput
            style={[styles.modalInput, { marginBottom: 10 }]}
            placeholder="Address 2"
            placeholderTextColor="#999"
            value={pharmacyForm.address2}
            onChangeText={(text) => setPharmacyForm(prev => ({ ...prev, address2: text }))}
          />

          <TextInput
            style={[styles.modalInput, { marginBottom: 10 }]}
            placeholder="Address 3"
            placeholderTextColor="#999"
            value={pharmacyForm.address3}
            onChangeText={(text) => setPharmacyForm(prev => ({ ...prev, address3: text }))}
          />

          <TextInput
            style={[styles.modalInput, { marginBottom: 10 }]}
            placeholder="Address 4"
            placeholderTextColor="#999"
            value={pharmacyForm.address4}
            onChangeText={(text) => setPharmacyForm(prev => ({ ...prev, address4: text }))}
          />

          <TextInput
            style={[styles.modalInput, { marginBottom: 10 }]}
            placeholder="Pincode *"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={pharmacyForm.pincode}
            onChangeText={(text) => setPharmacyForm(prev => ({ ...prev, pincode: text }))}
          />

          {/* State Dropdown */}
          <TouchableOpacity 
            style={[styles.dropdownInput, { marginBottom: 10 }]}
            onPress={() => setShowStateDropdown(!showStateDropdown)}
          >
            <AppText style={styles.dropdownPlaceholder}>
              {pharmacyForm.state || 'State *'}
            </AppText>
          </TouchableOpacity>
          {showStateDropdown && (
            <View style={styles.dropdown}>
              {loadingStates ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                states.map((state) => (
                  <TouchableOpacity
                    key={state.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setPharmacyForm(prev => ({ 
                        ...prev, 
                        state: state.name, 
                        stateId: state.id,
                        city: '',
                        cityId: null 
                      }));
                      setShowStateDropdown(false);
                      loadCities(state.id);
                    }}
                  >
                    <AppText style={styles.dropdownText}>{state.name}</AppText>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {/* City Dropdown */}
          <TouchableOpacity 
            style={[styles.dropdownInput, { marginBottom: 10 }]}
            onPress={() => setShowCityDropdown(!showCityDropdown)}
          >
            <AppText style={styles.dropdownPlaceholder}>
              {pharmacyForm.city || 'City *'}
            </AppText>
          </TouchableOpacity>
          {showCityDropdown && (
            <View style={styles.dropdown}>
              {loadingCities ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                cities.map((city) => (
                  <TouchableOpacity
                    key={city.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setPharmacyForm(prev => ({ 
                        ...prev, 
                        city: city.name, 
                        cityId: city.id 
                      }));
                      setShowCityDropdown(false);
                    }}
                  >
                    <AppText style={styles.dropdownText}>{city.name}</AppText>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          <TouchableOpacity style={[styles.dropdownInput, { marginBottom: 10 }]}>
            <AppText style={styles.dropdownPlaceholder}>Area</AppText>
          </TouchableOpacity>

          {/* Security Details */}
          <AppText style={styles.modalSectionLabel}>Security Details <AppText style={styles.mandatory}>*</AppText></AppText>
          <AppText style={styles.modalFieldLabel}>Mobile number <AppText style={styles.mandatory}>*</AppText></AppText>
          <View style={styles.fileUploadRow}>
            <TextInput
              style={styles.modalInput}
              placeholder="Mobile Number *"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={pharmacyForm.mobileNumber}
              onChangeText={(text) => setPharmacyForm(prev => ({ ...prev, mobileNumber: text }))}
            />
            <TouchableOpacity style={[styles.verifyButton, { marginBottom: 0 }]}>
              <AppText style={styles.verifyButtonText}>🔒</AppText>
            </TouchableOpacity>
          </View>
          <AppText style={styles.otpNote}>Auto verified after OTP</AppText>

          <AppText style={styles.modalFieldLabel}>Email address <AppText style={styles.mandatory}>*</AppText></AppText>
          <View style={styles.fileUploadRow}>
            <TextInput
              style={styles.modalInput}
              placeholder="Email Address *"
              placeholderTextColor="#999"
              keyboardType="email-address"
              value={pharmacyForm.emailAddress}
              onChangeText={(text) => setPharmacyForm(prev => ({ ...prev, emailAddress: text }))}
            />
            <TouchableOpacity style={[styles.verifyButton, { marginBottom: 0 }]}>
              <AppText style={styles.verifyButtonText}>🔒</AppText>
            </TouchableOpacity>
          </View>
          <AppText style={styles.otpNote}>Auto verified after OTP</AppText>

          {/* PAN */}
          <FileUploadComponent
            placeholder="Upload PAN Card (e.g., ASDSD12345G)"
            accept={['pdf', 'jpg', 'png']}
            maxSize={10 * 1024 * 1024}
            docType={DOC_TYPES.PAN}
            initialFile={pharmacyForm.panFile}
            onFileUpload={(file) => handleFileUpload('pan', file)}
            onFileDelete={() => handleFileDelete('pan')}
            errorMessage={pharmacyErrors.panFile}
          />
          <TextInput
            style={[styles.modalInput, { marginBottom: 10 }]}
            placeholder="PAN Number (e.g., ASDSD12345G)"
            placeholderTextColor="#999"
            value={pharmacyForm.panNumber}
            onChangeText={(text) => setPharmacyForm(prev => ({ ...prev, panNumber: text.toUpperCase() }))}
          />

          {/* GST */}
          <FileUploadComponent
            placeholder="Upload GST (e.g., 27ASDSD1234F1Z5)"
            accept={['pdf', 'jpg', 'png']}
            maxSize={10 * 1024 * 1024}
            docType={DOC_TYPES.GST}
            initialFile={pharmacyForm.gstFile}
            onFileUpload={(file) => handleFileUpload('gst', file)}
            onFileDelete={() => handleFileDelete('gst')}
            errorMessage={pharmacyErrors.gstFile}
          />
          <TextInput
            style={[styles.modalInput, { marginBottom: 10 }]}
            placeholder="GST Number (e.g., 27ASDSD1234F1Z5)"
            placeholderTextColor="#999"
            value={pharmacyForm.gstNumber}
            onChangeText={(text) => setPharmacyForm(prev => ({ ...prev, gstNumber: text.toUpperCase() }))}
          />

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
  dropdownInput: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.loginInputBorderColor,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
  },
  dropdownPlaceholder: {
    fontSize: 13,
    color: '#999',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.loginInputBorderColor,
    marginTop: -10,
    marginBottom: 10,
    maxHeight: 200,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownText: {
    fontSize: 13,
    color: '#333',
  },
  verifyButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  otpNote: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    marginBottom: 12,
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
});

export default AddNewPharmacyModal;
