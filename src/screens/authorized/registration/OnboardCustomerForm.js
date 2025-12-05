import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import AppText from '../../../components/AppText';
import CustomInput from '../../../components/CustomInput';
import { colors } from '../../../styles/colors';
import * as customerAPI from '../../../api/customer';
import { usePincodeLookup } from '../../../hooks/usePincodeLookup';

/**
 * Simplified Onboard Customer Form
 * Shows only editable fields with one field per row
 */
const OnboardCustomerForm = ({ route, navigation }) => {
  const { customerId, customerData, isStaging } = route.params || {};
  const loggedInUser = useSelector((state) => state.auth.user);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // General Details - Only addresses are editable
    customerName: '',
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
    
    // Security Details - Mobile and Email are editable
    mobileNumber: '',
    emailAddress: '',
    
    // Mapping - Based on customer type
    mappingType: '',
    selectedHospitals: [],
    selectedDoctors: [],
    selectedPharmacies: [],
    customerGroupId: null,
    customerGroupName: '',
  });

  // Pincode lookup hook
  const { areas, cities, states, loading: pincodeLoading, lookupByPincode, clearData } = usePincodeLookup();
  
  // Dropdown modal states
  const [showAreaModal, setShowAreaModal] = useState(false);

  const [registrationType, setRegistrationType] = useState({
    type: '',
    category: '',
    subCategory: '',
  });

  useEffect(() => {
    if (customerData) {
      populateFormData(customerData);
    }
  }, [customerData]);

  // Auto-populate city, state, and area when pincode lookup completes
  useEffect(() => {
    if (cities.length > 0 && states.length > 0) {
      // Auto-select first city and state from lookup results
      const firstCity = cities[0];
      const firstState = states[0];
      
      setFormData(prev => ({
        ...prev,
        city: firstCity.name,
        cityId: firstCity.id,
        state: firstState.name,
        stateId: firstState.id,
      }));
    }
    
    // Auto-select first area (0th index) if available
    if (areas.length > 0 && !formData.area) {
      const firstArea = areas[0];
      setFormData(prev => ({
        ...prev,
        area: firstArea.name,
        areaId: firstArea.id,
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cities, states, areas]);

  const populateFormData = (data) => {
    const { generalDetails, securityDetails, customerType, customerCategory, customerSubcategory, mapping, groupDetails } = data;

    // Set registration type with separate fields
    setRegistrationType({
      type: customerType || '',
      category: customerCategory || '',
      subCategory: customerSubcategory || '',
    });

    // Populate form fields
    setFormData({
      // General Details
      customerName: generalDetails?.customerName || '',
      shortName: generalDetails?.shortName || '',
      address1: generalDetails?.address1 || '',
      address2: generalDetails?.address2 || '',
      address3: generalDetails?.address3 || '',
      address4: generalDetails?.address4 || '',
      pincode: generalDetails?.pincode ? String(generalDetails.pincode) : '',
      area: generalDetails?.area || '',
      areaId: generalDetails?.areaId || null,
      city: generalDetails?.cityName || '',
      cityId: generalDetails?.cityId || null,
      state: generalDetails?.stateName || '',
      stateId: generalDetails?.stateId || null,
      
      // Security Details
      mobileNumber: securityDetails?.mobile || '',
      emailAddress: securityDetails?.email || '',
      
      // Mapping - Read from existing data
      selectedHospitals: mapping?.hospitals || [],
      selectedDoctors: mapping?.doctors || [],
      selectedPharmacies: mapping?.pharmacy || [],
      customerGroupId: groupDetails?.customerGroupId || null,
      customerGroupName: groupDetails?.customerGroupName || '',
    });
  };

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
          text2: 'Customer onboarded successfully!',
          position: 'top',
        });

        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.message || 'Failed to onboard customer',
          position: 'top',
        });
      }
    } catch (error) {
      console.error('Error onboarding customer:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'An error occurred while onboarding',
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <AppText style={styles.headerTitle}>Registration-Existing</AppText>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Registration Type - Disabled */}
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>Registration Type</AppText>
            
            {/* Type Selection - Disabled */}
            <View style={styles.typeContainer}>
              <AppText style={styles.typeLabel}>Type (Select Any One)</AppText>
              <View style={styles.typeButtonsRow}>
                <View style={[
                  styles.typeButton,
                  registrationType.type === 'Pharmacy/Chemist/Medical store' && styles.typeButtonActive
                ]}>
                  <AppText style={[
                    styles.typeButtonText,
                    registrationType.type === 'Pharmacy/Chemist/Medical store' && styles.typeButtonTextActive
                  ]}>
                    Pharmacy/Chemist/Medical store
                  </AppText>
                </View>
                
                <View style={[
                  styles.typeButton,
                  registrationType.type === 'Hospital' && styles.typeButtonActive
                ]}>
                  <AppText style={[
                    styles.typeButtonText,
                    registrationType.type === 'Hospital' && styles.typeButtonTextActive
                  ]}>
                    Hospital
                  </AppText>
                </View>
                
                <View style={[
                  styles.typeButton,
                  registrationType.type === 'Doctors' && styles.typeButtonActive
                ]}>
                  <AppText style={[
                    styles.typeButtonText,
                    registrationType.type === 'Doctors' && styles.typeButtonTextActive
                  ]}>
                    Doctors
                  </AppText>
                </View>
              </View>
            </View>

            {/* Category - if exists */}
            {registrationType.category && (
              <View style={styles.disabledInputContainer}>
                <AppText style={styles.disabledInputLabel}>Category</AppText>
                <AppText style={styles.disabledInputText}>{registrationType.category}</AppText>
              </View>
            )}

            {/* Sub Category - if exists */}
            {registrationType.subCategory && (
              <View style={styles.disabledInputContainer}>
                <AppText style={styles.disabledInputLabel}>Sub Category</AppText>
                <AppText style={styles.disabledInputText}>{registrationType.subCategory}</AppText>
              </View>
            )}
          </View>

          {/* General Details */}
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>General Details</AppText>

            {/* Customer Name - Disabled */}
            <CustomInput
              placeholder="Name"
              value={formData.customerName}
              editable={false}
              style={styles.disabledInput}
            />

            {/* Short Name - Disabled */}
            <CustomInput
              placeholder="Short Name"
              value={formData.shortName}
              editable={false}
              style={styles.disabledInput}
            />

            {/* Address 1 - Editable */}
            <CustomInput
              placeholder="Address 1"
              value={formData.address1}
              onChangeText={(text) => setFormData(prev => ({ ...prev, address1: text }))}
            />

            {/* Address 2 - Editable */}
            <CustomInput
              placeholder="Address 2"
              value={formData.address2}
              onChangeText={(text) => setFormData(prev => ({ ...prev, address2: text }))}
            />

            {/* Address 3 - Editable */}
            <CustomInput
              placeholder="Address 3"
              value={formData.address3}
              onChangeText={(text) => setFormData(prev => ({ ...prev, address3: text }))}
            />

            {/* Address 4 - Editable */}
            <CustomInput
              placeholder="Address 4"
              value={formData.address4}
              onChangeText={(text) => setFormData(prev => ({ ...prev, address4: text }))}
            />

            {/* Pincode - Editable */}
            <CustomInput
              placeholder="Pincode"
              value={formData.pincode}
              onChangeText={async (text) => {
                if (/^\d{0,6}$/.test(text)) {
                  setFormData(prev => ({ ...prev, pincode: text }));
                  
                  // Clear previous selections when pincode changes
                  if (text.length < 6) {
                    setFormData(prev => ({
                      ...prev,
                      area: '',
                      areaId: null,
                      city: '',
                      cityId: null,
                      state: '',
                      stateId: null,
                    }));
                    clearData();
                  }
                  
                  // Trigger lookup when pincode is complete (6 digits)
                  if (text.length === 6) {
                    await lookupByPincode(text);
                  }
                }
              }}
              keyboardType="number-pad"
              maxLength={6}
            />
            {pincodeLoading && (
              <View style={{ marginTop: -10, marginBottom: 10 }}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            )}

            {/* Area Dropdown */}
            <View style={styles.dropdownContainer}>
              {(formData.area || areas.length > 0) && (
                <AppText style={[styles.floatingLabel, { color: colors.primary }]}>
                  Area
                </AppText>
              )}
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowAreaModal(true)}
              >
                <View style={styles.inputTextContainer}>
                  <AppText style={formData.area ? styles.inputText : styles.placeholderText}>
                    {formData.area || ('Area')}
                  </AppText>
                </View>
                <Icon name="arrow-drop-down" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* City - Auto-populated from pincode */}
            <View style={styles.dropdownContainer}>
              {(formData.city || cities.length > 0) && (
                <AppText style={[styles.floatingLabel, { color: colors.primary }]}>
                  City
                </AppText>
              )}
              <TouchableOpacity style={styles.dropdown}>
                <View style={styles.inputTextContainer}>
                  <AppText style={formData.city ? styles.inputText : styles.placeholderText}>
                    {formData.city || ('City')}
                  </AppText>
                </View>
                <Icon name="arrow-drop-down" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* State - Auto-populated from pincode */}
            <View style={styles.dropdownContainer}>
              {(formData.state || states.length > 0) && (
                <AppText style={[styles.floatingLabel, { color: colors.primary }]}>
                  State
                </AppText>
              )}
              <TouchableOpacity style={styles.dropdown}>
                <View style={styles.inputTextContainer}>
                  <AppText style={formData.state ? styles.inputText : styles.placeholderText}>
                    {formData.state || ('State')}
                  </AppText>
                </View>
                <Icon name="arrow-drop-down" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Security Details */}
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>Security Details</AppText>

            {/* Mobile Number - Editable */}
            <CustomInput
              placeholder="Mobile Number"
              value={formData.mobileNumber}
              onChangeText={(text) => setFormData(prev => ({ ...prev, mobileNumber: text }))}
              keyboardType="phone-pad"
              maxLength={10}
              rightComponent={
                <View style={styles.verifiedBadge}>
                  <AppText style={styles.verifiedText}>Verified</AppText>
                </View>
              }
            />

            {/* Email Address - Editable */}
            <CustomInput
              placeholder="Email Address"
              value={formData.emailAddress}
              onChangeText={(text) => setFormData(prev => ({ ...prev, emailAddress: text }))}
              keyboardType="email-address"
              rightComponent={
                <View style={styles.verifiedBadge}>
                  <AppText style={styles.verifiedText}>Verified</AppText>
                </View>
              }
            />
          </View>

          {/* Mapping Section - Display existing mappings */}
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>Mapping</AppText>

            {/* Customer Group - Editable Radio Buttons */}
            <View style={styles.customerGroupContainer}>
              <AppText style={styles.customerGroupLabel}>Customer Group</AppText>
              <View style={styles.radioGroupContainer}>
                <View style={styles.radioRow}>
                  <TouchableOpacity
                    style={[styles.radioOption, styles.radioOptionFlex]}
                    onPress={() => setFormData(prev => ({ ...prev, customerGroupId: 1, customerGroupName: 'DOCTOR SUPPLY' }))}
                  >
                    <View style={styles.radioCircle}>
                      {formData.customerGroupId === 1 && (
                        <View style={styles.radioSelected} />
                      )}
                    </View>
                    <AppText style={styles.radioText}>DOCTOR SUPPLY</AppText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.radioOption, styles.radioOptionFlex]}
                    onPress={() => setFormData(prev => ({ ...prev, customerGroupId: 2, customerGroupName: 'RFQ' }))}
                  >
                    <View style={styles.radioCircle}>
                      {formData.customerGroupId === 2 && (
                        <View style={styles.radioSelected} />
                      )}
                    </View>
                    <AppText style={styles.radioText}>RFQ</AppText>
                  </TouchableOpacity>
                </View>

                <View style={styles.radioRow}>
                  <TouchableOpacity
                    style={[styles.radioOption, styles.radioOptionFlex]}
                    onPress={() => setFormData(prev => ({ ...prev, customerGroupId: 3, customerGroupName: 'VQ' }))}
                  >
                    <View style={styles.radioCircle}>
                      {formData.customerGroupId === 3 && (
                        <View style={styles.radioSelected} />
                      )}
                    </View>
                    <AppText style={styles.radioText}>VQ</AppText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.radioOption, styles.radioOptionFlex]}
                    onPress={() => setFormData(prev => ({ ...prev, customerGroupId: 4, customerGroupName: 'GOVT' }))}
                  >
                    <View style={styles.radioCircle}>
                      {formData.customerGroupId === 4 && (
                        <View style={styles.radioSelected} />
                      )}
                    </View>
                    <AppText style={styles.radioText}>GOVT</AppText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Mapped Hospitals */}
            {formData.selectedHospitals.length > 0 && (
              <View style={styles.fieldContainer}>
                <AppText style={styles.fieldLabel}>Mapped Hospitals</AppText>
                <View style={styles.mappingList}>
                  {formData.selectedHospitals.map((hospital, index) => (
                    <View key={index} style={styles.mappingChip}>
                      <AppText style={styles.mappingChipText} numberOfLines={1}>
                        {hospital.hospitalName || hospital.name || 'Hospital'}
                      </AppText>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Mapped Doctors */}
            {formData.selectedDoctors.length > 0 && (
              <View style={styles.fieldContainer}>
                <AppText style={styles.fieldLabel}>Mapped Doctors</AppText>
                <View style={styles.mappingList}>
                  {formData.selectedDoctors.map((doctor, index) => (
                    <View key={index} style={styles.mappingChip}>
                      <AppText style={styles.mappingChipText} numberOfLines={1}>
                        {doctor.doctorName || doctor.name || 'Doctor'}
                      </AppText>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Mapped Pharmacies */}
            {formData.selectedPharmacies.length > 0 && (
              <View style={styles.fieldContainer}>
                <AppText style={styles.fieldLabel}>Mapped Pharmacies</AppText>
                <View style={styles.mappingList}>
                  {formData.selectedPharmacies.map((pharmacy, index) => (
                    <View key={index} style={styles.mappingChip}>
                      <AppText style={styles.mappingChipText} numberOfLines={1}>
                        {pharmacy.pharmacyName || pharmacy.name || 'Pharmacy'}
                      </AppText>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Bottom Buttons - Inside ScrollView */}
          <View style={styles.bottomButtons}>
            <TouchableOpacity
              style={styles.assignButtonOutlined}
              onPress={() => {
                Toast.show({
                  type: 'info',
                  text1: 'Info',
                  text2: 'Assign to Customer feature coming soon',
                  position: 'top',
                });
              }}
            >
              <AppText style={styles.assignButtonTextOutlined}>Assign to Customer</AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerButtonFilled}
              onPress={handleAssignToCustomer}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <AppText style={styles.registerButtonTextFilled}>Register</AppText>
              )}
            </TouchableOpacity>
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Area Dropdown Modal */}
      <Modal
        visible={showAreaModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAreaModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAreaModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText style={styles.modalTitle}>Select Area</AppText>
              <TouchableOpacity onPress={() => setShowAreaModal(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {pincodeLoading ? (
              <ActivityIndicator size="large" color={colors.primary} style={styles.modalLoader} />
            ) : (
              <FlatList
                data={areas}
                keyExtractor={(item) => item.id?.toString() || item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      formData.areaId == item.id && styles.modalItemSelected
                    ]}
                    onPress={() => {
                      setFormData(prev => ({
                        ...prev,
                        area: item.name,
                        areaId: item.id,
                      }));
                      setShowAreaModal(false);
                    }}
                  >
                    <AppText style={[
                      styles.modalItemText,
                      formData.areaId == item.id && styles.modalItemTextSelected
                    ]}>
                      {item.name || item.label}
                    </AppText>
                    {formData.areaId == item.id && (
                      <Icon name="check" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <AppText style={styles.emptyText}>No items available</AppText>
                }
                style={styles.modalList}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  bottomSpacing: {
    height: 20,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 12,
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
  disabledInputContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  disabledInputText: {
    fontSize: 14,
    color: '#666',
  },
  disabledInputLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#666',
  },
  typeContainer: {
    marginBottom: 16,
  },
  typeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  typeButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F9FA',
  },
  typeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFF5E6',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  typeButtonTextActive: {
    color: colors.primary,
    fontWeight: '500',
  },
  verifiedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  customerGroupContainer: {
    marginBottom: 20,
  },
  customerGroupLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  radioGroupContainer: {
    gap: 12,
  },
  radioRow: {
    flexDirection: 'row',
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  radioOptionFlex: {
    flex: 1,
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
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  radioText: {
    fontSize: 14,
    color: '#333',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  mappingList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mappingChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    maxWidth: '100%',
  },
  mappingChipText: {
    fontSize: 14,
    color: '#333',
  },
  bottomButtons: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 12,
    gap: 12,
  },
  assignButtonOutlined: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  assignButtonTextOutlined: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  registerButtonFilled: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  registerButtonTextFilled: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  floatingLabel: {
    position: 'absolute',
    top: -6,
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
    marginBottom: 16
  },
  inputText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  inputTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  emptyText: {
    textAlign: 'center',
    paddingVertical: 40,
    fontSize: 16,
    color: '#999',
  },
});

export default OnboardCustomerForm;
