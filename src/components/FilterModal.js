import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  TextInput,
  Dimensions,
  Keyboard,
} from 'react-native';

import { colors } from '../styles/colors';
import { useSelector, useDispatch } from 'react-redux';
import apiClient from '../api/apiClient';

import CloseCircle from './icons/CloseCircle';
import Search from './icons/Search';
import FilterCheck from './icons/FilterCheck';

// Import Redux selectors
import {
  selectCustomerTypes,
  selectCustomerStatuses,
  fetchCustomerTypes,
  fetchCustomerStatuses,
} from '../redux/slices/customerSlice';

const { height, width } = Dimensions.get('window');

const FilterModal = ({ visible, onClose, onApply }) => {
  const dispatch = useDispatch();
  
  // Get data from Redux
  const customerTypes = useSelector(selectCustomerTypes) || [];
  const customerStatuses = useSelector(selectCustomerStatuses) || [];
  
  // All hooks must be at the top
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const [activeSection, setActiveSection] = useState('category');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [filters, setFilters] = useState({
    category: [],
    subCategory: [],
    status: [],
    state: [],
    city: [],
  });

  const [availableCities, setAvailableCities] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // Fetch data when component mounts
  useEffect(() => {
    dispatch(fetchCustomerTypes());
    dispatch(fetchCustomerStatuses());
    fetchStates();
    fetchCities();
  }, [dispatch]);

  // Fetch states from API
  const fetchStates = async () => {
    try {
      const response = await apiClient.get('/user-management/states?page=1&limit=50');
      if (response.data?.states) {
        setStates(response.data.states);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  // Fetch cities from API  
  const fetchCities = async () => {
    try {
      const response = await apiClient.get('/user-management/cities?page=1&limit=500');
      if (response.data?.cities) {
        setCities(response.data.cities);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  // Get subcategories dynamically based on selected categories
  const getSubCategories = () => {
    const selectedCategories = filters.category;
    const subCats = [];
    
    if (selectedCategories.includes('All') || selectedCategories.length === 0) {
      // Show all subcategories
      customerTypes.forEach(type => {
        type.customerCategories?.forEach(cat => {
          if (cat.customerSubcategories?.length > 0) {
            cat.customerSubcategories.forEach(subCat => {
              if (!subCats.find(sc => sc.name === subCat.name)) {
                subCats.push(subCat.name);
              }
            });
          } else {
            if (!subCats.includes(cat.name)) {
              subCats.push(cat.name);
            }
          }
        });
      });
    } else {
      // Show subcategories for selected categories
      selectedCategories.forEach(selectedCat => {
        const type = customerTypes.find(t => 
          t.name === selectedCat || 
          selectedCat.includes(t.name.split('/')[0]) // Handle "Pharmacy/Chemist/Medical store"
        );
        if (type?.customerCategories) {
          type.customerCategories.forEach(cat => {
            if (cat.customerSubcategories?.length > 0) {
              cat.customerSubcategories.forEach(subCat => {
                if (!subCats.includes(subCat.name)) {
                  subCats.push(subCat.name);
                }
              });
            } else {
              if (!subCats.includes(cat.name)) {
                subCats.push(cat.name);
              }
            }
          });
        }
      });
    }
  
    return subCats;
  };

  const subCategories = getSubCategories();
  const statusOptions = customerStatuses.map(s => s.name);

  const filterSections = [
    { id: 'category', label: 'Category', hasSearch: false },
    { id: 'subCategory', label: 'Sub-Category', hasSearch: false },
    { id: 'status', label: 'Status', hasSearch: false },
    { id: 'state', label: 'State', hasSearch: true },
    { id: 'city', label: 'City', hasSearch: true },
  ];

  useEffect(() => {
    if (visible) {
      // Reset animation values before opening
      slideAnim.setValue(height);
      fadeAnim.setValue(0);
      
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset search when modal closes
      setSearchQuery('');
    }
  }, [visible, slideAnim, fadeAnim]);

  useEffect(() => {
    // Update available cities when states are selected
    const selectedStates = filters.state;
    if (selectedStates.length > 0) {
      // Get state IDs from selected state names
      const selectedStateIds = states
        .filter(state => selectedStates.includes(state.stateName))
        .map(state => state.id);
      
      // Filter cities based on selected states
      const filteredCities = cities.filter(city => 
        selectedStateIds.includes(city.stateId?.toString())
      );
      setAvailableCities(filteredCities.map(c => c.cityName));
      
      // Remove any selected cities that are no longer available
      const availableCityNames = filteredCities.map(c => c.cityName);
      const updatedCityFilters = filters.city.filter(city => 
        availableCityNames.includes(city)
      );
      if (updatedCityFilters.length !== filters.city.length) {
        setFilters(prev => ({ ...prev, city: updatedCityFilters }));
      }
    } else {
      setAvailableCities([]);
      setFilters(prev => ({ ...prev, city: [] }));
    }
  }, [filters.state, states, cities]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const toggleFilter = (type, value) => {
    setFilters(prev => {
      const current = prev[type];
      const index = current.indexOf(value);
      
      if (index > -1) {
        // Remove if exists
        return {
          ...prev,
          [type]: current.filter(item => item !== value),
        };
      } else {
        // Add if not exists
        return {
          ...prev,
          [type]: [...current, value],
        };
      }
    });
  };

  const clearFilters = () => {
    setFilters({
      category: [],
      subCategory: [],
      status: [],
      state: [],
      city: [],
    });
  };

  const applyFilters = () => {
    onApply(filters);
    handleClose();
  };

  const getFilterData = () => {
    switch (activeSection) {
      case 'category':
        // Get categories from API only
        const categories = ['All'];
        customerTypes.forEach(type => {
          categories.push(type.name);
        });
        return categories;
      case 'subCategory':
        return subCategories;
      case 'status':
        return statusOptions;
      case 'state':
        return states.map(s => s.stateName);
      case 'city':
        return availableCities.length > 0 ? availableCities : [];
      default:
        return [];
    }
  };

  const filteredData = getFilterData().filter(item =>
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentSection = filterSections.find(s => s.id === activeSection);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent={true}
      presentationStyle="overFullScreen"
    >
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
        <TouchableOpacity 
          style={styles.backgroundTouch}
          activeOpacity={1}
          onPress={handleClose}
        />
        
        <Animated.View 
          style={[
            styles.modalContent,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={handleClose}>
              <CloseCircle />
            </TouchableOpacity>
          </View>

          <View style={styles.splitContainer}>
            {/* Left Panel - Filter Types */}
            <View style={styles.leftPanel}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {filterSections.map((section) => {
                  const count = filters[section.id].length;
                  return (
                    <TouchableOpacity
                      key={section.id}
                      style={[
                        styles.leftMenuItem,
                        activeSection === section.id && styles.leftMenuItemActive,
                      ]}
                      onPress={() => {
                        setActiveSection(section.id);
                        setSearchQuery('');
                      }}
                    >
                      <Text
                        style={[
                          styles.leftMenuText,
                          activeSection === section.id && styles.leftMenuTextActive,
                        ]}
                      >
                        {section.label} {count > 0 && `(${count})`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.divider} />

            {/* Right Panel - Filter Options */}
            <View style={styles.rightPanel}>
              <View style={styles.rightContent}>
                {/* Search Bar */}
                {currentSection?.hasSearch && (
                  <View style={styles.searchContainer}>
                    <Search />
                    <TextInput
                      style={styles.searchInput}
                      placeholder={`Search ${currentSection.label.toLowerCase()}...`}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholderTextColor="#999"
                    />
                    {searchQuery.length > 0 && (
                      <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <CloseCircle width={16} height={16} />
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Options List */}
                <ScrollView 
                  style={styles.optionsList} 
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {activeSection === 'city' && filters.state.length === 0 ? (
                    <Text style={styles.noResults}>Please select a state first</Text>
                  ) : filteredData.length === 0 ? (
                    <Text style={styles.noResults}>No results found</Text>
                  ) : (
                    filteredData.map((item, index) => {
                      const isChecked = filters[activeSection].includes(item);
                      return (
                        <TouchableOpacity
                          key={index}
                          style={styles.optionItem}
                          onPress={() => {
                            Keyboard.dismiss();
                            toggleFilter(activeSection, item);
                          }}
                        >
                          <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                            {isChecked && <FilterCheck width={12} height={12} color="#fff" />}
                          </View>
                          <Text style={[styles.optionText, isChecked && styles.optionTextChecked]}>
                            {item}
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>
              </View>
            </View>
          </View>

          {/* Footer Buttons */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// KEEPING YOUR EXACT ORIGINAL STYLES - NOT CHANGING ANYTHING
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backgroundTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.8,  // Fixed height at 90% of screen
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  splitContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  leftPanel: {
    width: '40%',
    backgroundColor: '#FAFAFA',
    paddingVertical: 8,
  },
  leftMenuItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  leftMenuItemActive: {
    backgroundColor: '#fff',
    borderLeftColor: colors.primary,
  },
  leftMenuText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '400',
  },
  leftMenuTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    backgroundColor: '#F0F0F0',
  },
  rightPanel: {
    flex: 1,
    backgroundColor: '#fff',
  },
  rightContent: {
    flex: 1,
    paddingTop: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
    padding: 0,
  },
  optionsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 15,
    color: '#333',
  },
  optionTextChecked: {
    color: colors.primary,
    fontWeight: '500',
  },
  noResults: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 20,
    fontSize: 14,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default FilterModal;