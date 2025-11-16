import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Animated,
  FlatList,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../styles/colors';
import {AppText,AppInput} from "../../../components"
import { customerAPI } from '../../../api/customer';

const DoctorSelector = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { onSelect, selectedDoctors = [] } = route.params || {};
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState(selectedDoctors || []);
  
  // Doctor data states
  const [doctorsData, setDoctorsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [selectedStates, setSelectedStates] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [statesLoading, setStatesLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(false);
  
  // Filter dropdowns
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  
  // Animation
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Fetch states and doctors on component mount
  useEffect(() => {
    fetchStates();
    fetchDoctors();
  }, []);

  // Fetch doctors when filters or search changes
  useEffect(() => {
    // Debounce the API call to avoid too many requests
    const timer = setTimeout(() => {
      fetchDoctors();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [selectedStates, selectedCities, searchQuery]);

  // Fetch cities when state is selected
  useEffect(() => {
    if (selectedStates.length > 0) {
      // Fetch cities for all selected states
      fetchCitiesForStates(selectedStates);
    } else {
      setCitiesList([]);
      setSelectedCities([]);
    }
  }, [selectedStates]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('DoctorSelector: Fetching doctors with filters...');
      
      // Build state and city IDs arrays for filtering
      const stateIds = selectedStates.length > 0 ? selectedStates.map(s => Number(s.id)) : [];
      const cityIds = selectedCities.length > 0 ? selectedCities.map(c => Number(c.id)) : [];
      
      console.log('DoctorSelector: Filter params - stateIds:', stateIds, 'cityIds:', cityIds, 'searchText:', searchQuery);
      
      // Call API with doctor type code and filters
      const response = await customerAPI.getDoctorsList(['DOCT'], 1, 1, 20, stateIds, cityIds, searchQuery);
      console.log('DoctorSelector: Doctors API response:', response);
      
      if (response?.data?.customers && Array.isArray(response.data.customers)) {
        // Transform API response to match expected format
        const transformedDoctors = response.data.customers.map(customer => ({
          id: customer.customerId,
          name: customer.customerName,
          code: customer.customerCode || customer.sapCode || customer.customerId,
          city: customer.cityName || 'N/A',
          state: customer.stateName || 'N/A',
          mobile: customer.mobile,
          email: customer.email,
          speciality: customer.customerCategory || 'General',
        }));
        
        console.log('DoctorSelector: Transformed doctors:', transformedDoctors.length, 'items');
        setDoctorsData(transformedDoctors);
      } else {
        console.log('DoctorSelector: Invalid doctors response format');
        setDoctorsData([]);
      }
    } catch (err) {
      console.error('DoctorSelector: Error fetching doctors:', err);
      setError(err.message || 'Failed to load doctors');
      setDoctorsData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStates = async () => {
    try {
      setStatesLoading(true);
      console.log('HospitalSelector: Fetching states...');
      
      const response = await customerAPI.getStatesList(1, 20);
      console.log('HospitalSelector: States API response:', response);
      
      if (response?.data?.states && Array.isArray(response.data.states)) {
        // Transform state response
        const transformedStates = response.data.states.map(state => ({
          id: state.id,
          name: state.stateName,
        }));
        setStatesList(transformedStates);
      } else {
        setStatesList([]);
      }
    } catch (err) {
      console.error('HospitalSelector: Error fetching states:', err);
      setStatesList([]);
    } finally {
      setStatesLoading(false);
    }
  };

  const fetchCitiesForStates = async (states) => {
    try {
      setCitiesLoading(true);
      console.log('HospitalSelector: Fetching cities for states...');
      
      const response = await customerAPI.getCitiesList(1, 20);
      console.log('HospitalSelector: Cities API response:', response);
      
      if (response?.data?.cities && Array.isArray(response.data.cities)) {
        // Filter cities by all selected states and transform
        const stateIds = states.map(s => Number(s.id));
        const filteredCities = response.data.cities
          .filter(city => stateIds.includes(Number(city.stateId)))
          .map(city => ({
            id: city.id,
            name: city.cityName,
          }));
        setCitiesList(filteredCities);
      } else {
        setCitiesList([]);
      }
    } catch (err) {
      console.error('HospitalSelector: Error fetching cities:', err);
      setCitiesList([]);
    } finally {
      setCitiesLoading(false);
    }
  };

  const handleStateToggle = (state) => {
    const isSelected = selectedStates.some(s => s.id === state.id);
    if (isSelected) {
      setSelectedStates(selectedStates.filter(s => s.id !== state.id));
    } else {
      setSelectedStates([...selectedStates, state]);
    }
  };

  const handleCityToggle = (city) => {
    const isSelected = selectedCities.some(c => c.id === city.id);
    if (isSelected) {
      setSelectedCities(selectedCities.filter(c => c.id !== city.id));
    } else {
      setSelectedCities([...selectedCities, city]);
    }
  };

  const handleSearch = () => {
    // Search is handled by API call through useEffect
  };

  const handleToggleHospital = (hospital) => {
    const isSelected = selectedItems.some(item => item.id === hospital.id);
    if (isSelected) {
      setSelectedItems(selectedItems.filter(item => item.id !== hospital.id));
    } else {
      setSelectedItems([...selectedItems, hospital]);
    }
  };

  const handleContinue = () => {
    if (onSelect) {
      onSelect(selectedItems);
    }
    navigation.goBack();
  };

  const handleAddNewDoctor = () => {
    // Navigate to add new doctor form
    navigation.navigate('AddNewDoctor');
  };

  const renderDoctorItem = ({ item }) => {
    const isSelected = selectedItems.some(doctor => doctor.id === item.id);
    
    return (
      <TouchableOpacity
        style={styles.doctorItem}
        onPress={() => handleToggleHospital(item)}
        activeOpacity={0.7}
      >
        <View style={styles.checkboxContainer}>
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <Icon name="checkmark" size={16} color="#fff" />}
          </View>
        </View>
        
        <View style={styles.doctorInfo}>
          <AppText style={styles.doctorName}>{item.name}</AppText>
          <View style={styles.doctorDetails}>
            <AppText style={styles.doctorCode}>{item.code}</AppText>
            <AppText style={styles.doctorSpeciality}>{item.speciality}</AppText>
          </View>
          <AppText style={styles.doctorContact}>{item.mobile}</AppText>
        </View>
        
        <AppText style={styles.doctorCity}>{item.state}</AppText>
      </TouchableOpacity>
    );
  };

  const renderNoResults = () => (
    <View style={styles.noResultsContainer}>
      <Icon name="search-outline" size={60} color="#CCC" />
      <AppText style={styles.noResultsTitle}>Doctor Not Found</AppText>
      <AppText style={styles.noResultsText}>
        Doctor not found. You can add new doctor to continue.{'\n'}
        Else try to search different doctor
      </AppText>
      <TouchableOpacity
        style={styles.addNewButton}
        onPress={handleAddNewDoctor}
      >        
        <AppText style={styles.addNewButtonText}>+ Add New Doctor</AppText>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >          
          <Icon name="close" size={24} color="#333" />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>Select Doctor</AppText>
      </View>

      {/* Filter Dropdowns Container */}
      <View style={styles.filterContainer}>
        {/* State Dropdown */}
        <TouchableOpacity
          style={styles.filterDropdown}
          onPress={() => setShowStateDropdown(!showStateDropdown)}
        >
          <AppText style={styles.filterDropdownText}>
            {selectedStates.length > 0 ? `${selectedStates.length} State${selectedStates.length !== 1 ? 's' : ''}` : 'Select State'}
          </AppText>
          <Icon name={showStateDropdown ? 'chevron-up' : 'chevron-down'} size={16} color="#666" />
        </TouchableOpacity>

        {/* City Dropdown */}
        <TouchableOpacity
          style={styles.filterDropdown}
          onPress={() => setShowCityDropdown(!showCityDropdown)}
        >
          <AppText style={styles.filterDropdownText}>
            {selectedCities.length > 0 ? `${selectedCities.length} Cit${selectedCities.length !== 1 ? 'ies' : 'y'}` : 'Select City'}
          </AppText>
          <Icon name={showCityDropdown ? 'chevron-up' : 'chevron-down'} size={16} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Overlay to close dropdowns when clicking outside */}
      {(showStateDropdown || showCityDropdown) && (
        <Pressable
          style={styles.overlay}
          onPress={() => {
            setShowStateDropdown(false);
            setShowCityDropdown(false);
          }}
        />
      )}

      {/* State Dropdown Menu - Absolute Positioned */}
      {showStateDropdown && (
        <View style={[styles.dropdownMenu, styles.stateDropdownMenu]}>
          {statesLoading ? (
            <View style={styles.dropdownLoading}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : statesList.length > 0 ? (
            <ScrollView style={styles.dropdownScroll}>
              {statesList.map(state => {
                const isSelected = selectedStates.some(s => s.id === state.id);
                return (
                  <TouchableOpacity
                    key={state.id}
                    style={styles.dropdownItem}
                    onPress={() => handleStateToggle(state)}
                  >
                    <View style={[styles.checkboxSmall, isSelected && styles.checkboxSmallSelected]}>
                      {isSelected && <Icon name="checkmark" size={14} color="#fff" />}
                    </View>
                    <AppText style={styles.dropdownItemText}>{state.name}</AppText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <AppText style={styles.dropdownItemText}>No states available</AppText>
          )}
        </View>
      )}

      {/* City Dropdown Menu - Absolute Positioned */}
      {showCityDropdown && (
        <View style={[styles.dropdownMenu, styles.cityDropdownMenu]}>
          {citiesLoading ? (
            <View style={styles.dropdownLoading}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : citiesList.length > 0 ? (
            <ScrollView style={styles.dropdownScroll}>
              {citiesList.map(city => {
                const isSelected = selectedCities.some(c => c.id === city.id);
                return (
                  <TouchableOpacity
                    key={city.id}
                    style={styles.dropdownItem}
                    onPress={() => handleCityToggle(city)}
                  >
                    <View style={[styles.checkboxSmall, isSelected && styles.checkboxSmallSelected]}>
                      {isSelected && <Icon name="checkmark" size={14} color="#fff" />}
                    </View>
                    <AppText style={styles.dropdownItemText}>{city.name}</AppText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <AppText style={styles.dropdownItemText}>No cities available</AppText>
          )}
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>        
        <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
        <AppInput
          style={styles.searchInput}
          placeholder="Search by doctor name/code"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          placeholderTextColor="#999"
        />
      </View>

      {/* Doctor List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText style={styles.loadingText}>Loading doctors...</AppText>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={40} color="#EF4444" />
          <AppText style={styles.errorText}>Error loading doctors</AppText>
          <AppText style={styles.errorSubText}>{error}</AppText>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchDoctors}
          >
            <AppText style={styles.retryButtonText}>Retry</AppText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={doctorsData}
          renderItem={renderDoctorItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Icon name="search" size={40} color="#999" />
              <AppText style={styles.emptyText}>No doctors found</AppText>
            </View>
          )}
          // ListFooterComponent={() => (
          //   <TouchableOpacity
          //     style={styles.addNewButton}
          //     onPress={handleAddNewHospital}
          //   >
          //     <Icon name="add" size={20} color={colors.primary} />
          //     <AppText style={styles.addNewButtonText}>Add New Hospital</AppText>
          //   </TouchableOpacity>
          // )}
        />
      )}

      {/* Bottom Button */}
      {selectedItems.length > 0 && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <AppText style={styles.continueButtonText}>
              Continue ({selectedItems.length} selected)
            </AppText>
          </TouchableOpacity>
        </View>
      )}
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  closeButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9998,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 12,
    zIndex: 100,
  },
  filterDropdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#999',
  },
  filterDropdownText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  dropdownMenu: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    maxHeight: 250,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 20,
  },
  stateDropdownMenu: {
    top: 100,
    left: 16,
    right: 'auto',
    width: '45%',
  },
  cityDropdownMenu: {
    top: 100,
    right: 16,
    left: 'auto',
    width: '45%',
  },
  dropdownScroll: {
    maxHeight: 250,
  },
  dropdownLoading: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  checkboxSmall: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#DDD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#fff',
  },
  checkboxSmallSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F8F8',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  listContent: {
    paddingBottom: 100,
  },
  doctorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#DDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  doctorDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  doctorCode: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  doctorSpeciality: {
    fontSize: 12,
    color: '#999',
  },
  doctorContact: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  doctorCity: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 12,
  },
  errorSubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
  },
  noResultsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 24,
  },
  addNewButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DoctorSelector;