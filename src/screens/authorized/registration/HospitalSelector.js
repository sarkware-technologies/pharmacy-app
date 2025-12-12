import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
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
import { colors } from '../../../styles/colors';
import { AppText, AppInput } from '../../../components';
import { customerAPI } from '../../../api/customer';
import PhamacySearchNotFound from '../../../components/icons/PhamacySearchNotFound';
import AddNewHospitalModal from './AddNewHospitalModal';

const HospitalSelector = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    onSelect,
    selectedHospitals = [],
    allowMultiple = false,
    mappingFor,
    categoryCode = false,
    subCategoryCode = false,
    customerGroupId
  } = route.params || {};


  const [searchQuery, setSearchQuery] = useState('');
  // Support both single and multiple selection
  const [selectedItems, setSelectedItems] = useState(
    allowMultiple ? selectedHospitals : [],
  );
  const [selectedItem, setSelectedItem] = useState(
    !allowMultiple && selectedHospitals?.length > 0
      ? selectedHospitals[0]
      : null,
  );

  // Hospital data states
  const [hospitalsData, setHospitalsData] = useState([]);
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
  const [showAddHospitalModal, setShowAddHospitalModal] = useState(false);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch states and hospitals on component mount
  useEffect(() => {
    fetchStates();
    fetchHospitals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch hospitals when filters or search changes
  useEffect(() => {
    if (!loading) {
      fetchHospitals();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const handleAddNewHospital = () => {
    setShowAddHospitalModal(true);
  };

  const handleReset = () => {
    if (allowMultiple) {
      setSelectedItems([]);
    } else {
      setSelectedItem(null);
    }
  };

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('HospitalSelector: Fetching hospitals with filters...');

      // Build state and city IDs arrays
      const stateIds = selectedStates.map(s => Number(s.id));
      const cityIds = selectedCities.map(c => Number(c.id));

      console.log(
        'HospitalSelector: Filter params - stateIds:',
        stateIds,
        'cityIds:',
        cityIds,
        'searchText:',
        searchQuery,
      );

      // Build payload matching the API requirements
      const payload = {
        typeCode: ['HOSP'],
        statusIds: [7, 2], // ACTIVE and APPROVED
        page: 1,
        limit: 20,
        mappingFor: mappingFor || "HOSP",
        ...(categoryCode
          ? { categoryCode: categoryCode }
          : {}),
        ...(subCategoryCode ? { subCategoryCode: subCategoryCode } : {}),
        ...(customerGroupId ? { customerGroupId: customerGroupId } : {})


      };

      // Add optional filters
      if (stateIds.length > 0) {
        payload.stateIds = stateIds;
      }
      if (cityIds.length > 0) {
        payload.cityIds = cityIds;
      }
      if (searchQuery && searchQuery.trim().length > 0) {
        payload.searchText = searchQuery.trim();
      }

      console.log(
        'HospitalSelector: API payload being sent:',
        JSON.stringify(payload),
      );

      // Call API directly with correct payload
      const response = await customerAPI.getCustomersListMapping(payload);
      console.log('HospitalSelector: Hospitals API response:', response);

      if (response?.customers && Array.isArray(response.customers)) {
        // Transform API response to match expected format
        const transformedHospitals = response.customers.map(customer => ({
          id: customer.customerId,
          name: customer.customerName,
          code: customer.customerCode || customer.customerId,
          city: customer.cityName || 'N/A',
          state: customer.stateName || 'N/A',
          customerId: customer.customerId,
          customerCode: customer.customerCode,
        }));
        console.log(
          'HospitalSelector: Transformed hospitals:',
          transformedHospitals.length,
          'items',
        );
        setHospitalsData(transformedHospitals);
      } else {
        console.log('HospitalSelector: Invalid hospitals response format');
        setHospitalsData([]);
      }
    } catch (err) {
      console.error('HospitalSelector: Error fetching hospitals:', err);
      setError(err.message || 'Failed to load hospitals');
      setHospitalsData([]);
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

  const fetchCitiesForStates = async states => {
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

  const handleStateToggle = state => {
    const isSelected = selectedStates.some(s => s.id === state.id);
    if (isSelected) {
      setSelectedStates(selectedStates.filter(s => s.id !== state.id));
    } else {
      setSelectedStates([...selectedStates, state]);
    }
  };

  const handleCityToggle = city => {
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

  const handleToggleHospital = hospital => {
    if (allowMultiple) {
      // Multiple selection - checkbox behavior
      const isSelected = selectedItems.some(h => h.id === hospital.id);
      if (isSelected) {
        setSelectedItems(selectedItems.filter(h => h.id !== hospital.id));
      } else {
        setSelectedItems([...selectedItems, hospital]);
      }
    } else {
      // Single selection - radio button behavior
      const isSelected = selectedItem?.id === hospital.id;
      if (isSelected) {
        setSelectedItem(null); // Deselect if already selected
      } else {
        setSelectedItem(hospital); // Select this hospital
      }
    }
  };

  const handleContinue = () => {
    if (onSelect) {
      if (allowMultiple) {
        onSelect(selectedItems);
      } else if (selectedItem) {
        onSelect([selectedItem]); // Return as array for compatibility
      }
    }
    navigation.goBack();
  };

  const handleHospitalSubmit = newHospital => {
    // Add the new pharmacy to selected items
    setSelectedItems([...selectedItems, newHospital]);
    // Optionally refresh the pharmacy list
    fetchHospitals();
  };

  const renderHospitalItem = ({ item }) => {
    const isSelected = allowMultiple
      ? selectedItems.some(h => h.id === item.id)
      : selectedItem?.id === item.id;

    return (
      <TouchableOpacity
        style={styles.hospitalItem}
        onPress={() => handleToggleHospital(item)}
        activeOpacity={0.7}
      >
        <View style={styles.radioContainer}>
          {allowMultiple ? (
            // Checkbox for multiple selection
            <View
              style={[styles.checkbox, isSelected && styles.checkboxSelected]}
            >
              {isSelected && <Icon name="checkmark" size={16} color="#fff" />}
            </View>
          ) : (
            // Radio button for single selection
            <View
              style={[
                styles.radioCircle,
                isSelected && styles.radioCircleSelected,
              ]}
            >
              {isSelected && <View style={styles.radioInner} />}
            </View>
          )}
        </View>

        <View style={styles.hospitalInfo}>
          <AppText style={styles.hospitalName}>{item.name}</AppText>
          <AppText style={styles.hospitalCode}>{item.code}</AppText>
        </View>

        <AppText style={styles.hospitalCity}>{item.city}</AppText>
      </TouchableOpacity>
    );
  };

  // Empty list component
  const renderEmptyList = () => (
    // <View style={styles.emptyContainer}>
    //   <Icon name="search" size={40} color="#999" />
    //   <AppText style={styles.emptyText}>No hospitals found</AppText>
    // </View>
    <View style={styles.emptyContainer}>
      <PhamacySearchNotFound width={40} height={40} color="#999" />
      <AppText style={styles.emptyTitle}>Hospital Not Found</AppText>
      <AppText style={styles.emptySubtitle}>
        Hospital not found. You can add a new hospital to continue
      </AppText>
      <TouchableOpacity
        style={styles.addNewPharmacyButtonEmpty}
        onPress={handleAddNewHospital}
      >
        <AppText style={styles.addNewPharmacyTextEmpty}>
          +Add New Hospital
        </AppText>
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
        <AppText style={styles.headerTitle}>Select Hospital</AppText>
      </View>

      {/* Filter Dropdowns Container */}
      <View style={styles.filterContainer}>
        {/* State Dropdown */}
        <TouchableOpacity
          style={styles.filterDropdown}
          onPress={() => setShowStateDropdown(!showStateDropdown)}
        >
          <AppText style={styles.filterDropdownText}>
            {selectedStates.length > 0
              ? `${selectedStates.length} State${selectedStates.length !== 1 ? 's' : ''
              }`
              : 'Select State'}
          </AppText>
          <Icon
            name={showStateDropdown ? 'chevron-up' : 'chevron-down'}
            size={16}
            color="#666"
          />
        </TouchableOpacity>

        {/* City Dropdown */}
        <TouchableOpacity
          style={styles.filterDropdown}
          onPress={() => setShowCityDropdown(!showCityDropdown)}
        >
          <AppText style={styles.filterDropdownText}>
            {selectedCities.length > 0
              ? `${selectedCities.length} Cit${selectedCities.length !== 1 ? 'ies' : 'y'
              }`
              : 'Select City'}
          </AppText>
          <Icon
            name={showCityDropdown ? 'chevron-up' : 'chevron-down'}
            size={16}
            color="#666"
          />
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
                    <View
                      style={[
                        styles.checkboxSmall,
                        isSelected && styles.checkboxSmallSelected,
                      ]}
                    >
                      {isSelected && (
                        <Icon name="checkmark" size={14} color="#fff" />
                      )}
                    </View>
                    <AppText style={styles.dropdownItemText}>
                      {state.name}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.dropdownEmptyContainer}>
              <AppText style={styles.dropdownEmptyText}>
                No states available
              </AppText>
            </View>
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
                    <View
                      style={[
                        styles.checkboxSmall,
                        isSelected && styles.checkboxSmallSelected,
                      ]}
                    >
                      {isSelected && (
                        <Icon name="checkmark" size={14} color="#fff" />
                      )}
                    </View>
                    <AppText style={styles.dropdownItemText}>
                      {city.name}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.dropdownEmptyContainer}>
              <AppText style={styles.dropdownEmptyText}>
                No cities available
              </AppText>
            </View>
          )}
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
        <AppInput
          style={styles.searchInput}
          placeholder="Search by hospital name/code"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          placeholderTextColor="#777777"
        />

        <TouchableOpacity onPress={() => setSearchQuery('')}>
          <Icon name="close" size={15} color="#999" style={styles.closeIcon} />
        </TouchableOpacity>
      </View>

      {/* Header Row */}
      {!loading && !error && hospitalsData.length > 0 && (
        <View style={styles.headerRow}>
          <View style={styles.headerRadioSpace} />
          <AppText style={styles.headerText}>Name</AppText>
          <AppText style={styles.headerCityText}>City</AppText>
        </View>
      )}

      {/* Hospital List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText style={styles.loadingText}>Loading hospitals...</AppText>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={40} color="#EF4444" />
          <AppText style={styles.errorText}>Error loading hospitals</AppText>
          <AppText style={styles.errorSubText}>{error}</AppText>
          <TouchableOpacity style={styles.retryButton} onPress={fetchHospitals}>
            <AppText style={styles.retryButtonText}>Retry</AppText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={hospitalsData}
          renderItem={renderHospitalItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyList}
        />
      )}

      {/* Bottom Button */}
      {(allowMultiple ? selectedItems.length > 0 : selectedItem) && (
        <View style={styles.bottomContainer}>
          <View style={styles.bottomRow}>
            {/* RESET BUTTON */}
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <AppText style={styles.resetButtonText}>Reset</AppText>
            </TouchableOpacity>

            {/* CONTINUE BUTTON */}
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
            >
              <AppText style={styles.continueButtonText}>Continue</AppText>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <AddNewHospitalModal
        visible={showAddHospitalModal}
        onClose={() => setShowAddHospitalModal(false)}
        onSubmit={handleHospitalSubmit}
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
  dropdownEmptyContainer: {
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  dropdownEmptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 12,
  },

  closeIcon: {
    backgroundColor: '#EDEDED',
    borderRadius: 50,
    padding: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: 20,
    color: '#333',
    paddingVertical: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F8F8',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerRadioSpace: {
    width: 34,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  headerCityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    marginRight: 4,
  },
  listContent: {
    paddingBottom: 100,
  },
  hospitalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  radioContainer: {
    marginRight: 12,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#DDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
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
  hospitalInfo: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  hospitalCode: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  hospitalCity: {
    fontSize: 12,
    color: '#666',
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

  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  continueButton: {
    flex: 1.3,
    paddingVertical: 16,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginTop: 24,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  addNewPharmacyButtonEmpty: {
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  addNewPharmacyTextEmpty: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },

  resetButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E58A28', // orange border
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E58A28', // orange text
  },
});

export default HospitalSelector;
