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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../styles/colors';

import CloseCircle from './icons/CloseCircle';
import Search from './icons/Search';
import FilterCheck from './icons/FilterCheck';

const { height, width } = Dimensions.get('window');

const FilterModal = ({ visible, onClose, onApply }) => {
  // All hooks must be at the top
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const [activeSection, setActiveSection] = useState('category');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [filters, setFilters] = useState({
    category: ['All', 'Pharmacists in hospitals', 'Hospitals', 'Doctors'],
    subCategory: [],
    status: [],
    state: [],
    city: [],
  });

  const [availableCities, setAvailableCities] = useState([]);

  // Data constants after hooks
  const indianStatesAndCities = {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane", "Aurangabad", "Solapur"],
    "Karnataka": ["Bengaluru", "Mysore", "Mangalore", "Hubli", "Belgaum", "Dharwad"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut", "Allahabad"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Bardhaman"],
    "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "Central Delhi"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"],
    "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga"],
    "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"],
    "Haryana": ["Gurgaon", "Faridabad", "Panipat", "Ambala", "Yamunanagar"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Puri", "Sambalpur"],
    "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Tezpur"],
    "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh"],
    "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Durg", "Korba"],
    "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi", "Kullu"],
    "Uttarakhand": ["Dehradun", "Haridwar", "Haldwani", "Roorkee", "Rudrapur"],
    "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
    "Tripura": ["Agartala", "Udaipur", "Dharmanagar", "Kailasahar"],
    "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongpoh"],
    "Manipur": ["Imphal", "Thoubal", "Churachandpur", "Bishnupur"],
    "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang"],
    "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang"],
    "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Serchhip"],
    "Sikkim": ["Gangtok", "Namchi", "Mangan", "Ravangla"],
  };

  const states = Object.keys(indianStatesAndCities).sort();
  const subCategories = ["Pharmacy", "Clinic", "Laboratory", "Diagnostic Center", "Medical Store"];
  const statusOptions = ["Active", "Inactive", "Pending", "Blocked", "Verified"];

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
      // Animate out when closing
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  useEffect(() => {
    const cities = [];
    filters.state.forEach(state => {
      if (indianStatesAndCities[state]) {
        cities.push(...indianStatesAndCities[state]);
      }
    });
    setAvailableCities([...new Set(cities)].sort());
  }, [filters.state]);

  useEffect(() => {
    // Clear search when changing sections
    setSearchQuery('');
  }, [activeSection]);

  const getOptionsForSection = (section) => {
    switch (section) {
      case 'category':
        return ['All', 'Pharmacists in hospitals', 'Hospitals', 'Doctors'];
      case 'subCategory':
        return subCategories;
      case 'status':
        return statusOptions;
      case 'state':
        return states;
      case 'city':
        return availableCities.length > 0 ? availableCities : 
          [...new Set(Object.values(indianStatesAndCities).flat())].sort();
      default:
        return [];
    }
  };

  const toggleFilter = (section, value) => {
    setFilters(prev => {
      const current = prev[section];
      const index = current.indexOf(value);
      
      // Special handling for "All" in category
      if (section === 'category' && value === 'All') {
        if (index > -1) {
          return { ...prev, category: [] };
        } else {
          return { ...prev, category: ['All', 'Pharmacists in hospitals', 'Hospitals', 'Doctors'] };
        }
      }
      
      if (index > -1) {
        return {
          ...prev,
          [section]: current.filter(item => item !== value),
        };
      } else {
        return {
          ...prev,
          [section]: [...current, value],
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
    setSearchQuery('');
  };

  const applyFilters = () => {
    // Animate out first, then apply and close
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onApply(filters);
      onClose();
    });
  };

  const renderLeftMenuItem = (section) => (
    <TouchableOpacity
      key={section.id}
      style={[
        styles.leftMenuItem,
        activeSection === section.id && styles.leftMenuItemActive,
      ]}
      onPress={() => setActiveSection(section.id)}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.leftMenuText,
        activeSection === section.id && styles.leftMenuTextActive,
      ]}>
        {section.label}
      </Text>
    </TouchableOpacity>
  );

  const renderRightContent = () => {
    const section = filterSections.find(s => s.id === activeSection);
    const options = getOptionsForSection(activeSection);
    const filteredOptions = searchQuery && section?.hasSearch
      ? options.filter(option => 
          option.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

    return (
      <View style={styles.rightContent}>
        {section?.hasSearch && (
          <View style={styles.searchContainer}>
            <Search width={16} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${section.label.toLowerCase()}`}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
        )}
        
        <ScrollView 
          style={styles.optionsList}
          showsVerticalScrollIndicator={false}
        >
          {filteredOptions.map((option, index) => {
            const isChecked = filters[activeSection].includes(option);
            
            return (
              <TouchableOpacity
                key={index}
                style={styles.optionItem}
                onPress={() => toggleFilter(activeSection, option)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.checkbox, 
                  isChecked && styles.checkboxChecked
                ]}>
                  {isChecked && (
                    <FilterCheck />
                  )}
                </View>
                <Text style={[
                  styles.optionText,
                  isChecked && styles.optionTextChecked,
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
          
          {filteredOptions.length === 0 && searchQuery && (
            <Text style={styles.noResults}>No results found</Text>
          )}
        </ScrollView>
      </View>
    );
  };

  const handleClose = () => {
    // Animate out first, then close
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose(); // Call onClose after animation completes
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View 
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity 
          style={styles.overlayTouch}
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
            {/* Left Side - Menu */}
            <View style={styles.leftPanel}>
              {filterSections.map(section => renderLeftMenuItem(section))}
            </View>
            
            {/* Vertical Divider */}
            <View style={styles.divider} />
            
            {/* Right Side - Options */}
            <View style={styles.rightPanel}>
              {renderRightContent()}
            </View>
          </View>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={clearFilters}
              activeOpacity={0.7}
            >
              <Text style={styles.clearButtonText}>Clear filter</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={applyFilters}
              activeOpacity={0.7}
            >
              <Text style={styles.applyButtonText}>Apply filter</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTouch: {
    flex: 1,
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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