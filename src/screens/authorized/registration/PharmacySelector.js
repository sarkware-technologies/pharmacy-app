// src/screens/authorized/registration/PharmacySelector.js

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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../styles/colors';

// Mock pharmacy data
const MOCK_PHARMACIES = [
  { id: 1, name: 'Sunlite Pharma Medicos 24/7', code: '10106555', city: 'Pune', state: 'Maharashtra', selected: true },
  { id: 2, name: 'Wellness Forever', code: '10006565', city: 'Bengaluru', state: 'Karnataka', selected: true },
  { id: 3, name: 'Alkem Laboratories', code: '10106555', city: 'Jaipur', state: 'Rajasthan', selected: true },
  { id: 4, name: 'Safar Dang Pharmacy', code: '10006565', city: 'Pimpri', state: 'Maharashtra', selected: false },
  { id: 5, name: "King's George Pharmacy", code: '10106555', city: 'Indira Nagar', state: 'UP', selected: false },
  { id: 6, name: 'Naidu Pharmacy', code: '10006565', city: 'Hydrabad', state: 'Telangana', selected: false },
  { id: 7, name: 'District Pharmacy', code: '10106555', city: 'Pune', state: 'Maharashtra', selected: false },
  { id: 8, name: 'MGM Pharmacy', code: '10006565', city: 'Viman Nagar', state: 'Maharashtra', selected: false },
  { id: 9, name: 'MMF Ratna Memorial Pharmacy', code: '10006565', city: 'Bengaluru', state: 'Karnataka', selected: false },
  { id: 10, name: 'District Pharamcy', code: '10106555', city: 'Pune', state: 'Maharashtra', selected: false },
];

const STATES = ['All States', 'Maharashtra', 'Karnataka', 'Rajasthan', 'UP', 'Telangana'];
const CITIES = ['All Cities', 'Pune', 'Bengaluru', 'Jaipur', 'Pimpri', 'Hydrabad', 'Viman Nagar', 'Indira Nagar'];

const PharmacySelector = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { onSelect, selectedPharmacies = [] } = route.params || {};
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('4 States');
  const [selectedCity, setSelectedCity] = useState('55 Cities');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState(() => {
    // Initialize with pre-selected pharmacies
    const preSelected = MOCK_PHARMACIES.filter(p => p.selected);
    return [...preSelected, ...selectedPharmacies];
  });
  
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

  const handleSearch = () => {
    // Filter pharmacies based on search query
    const filtered = MOCK_PHARMACIES.filter(pharmacy => 
      pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pharmacy.code.includes(searchQuery)
    );
  };

  const handleTogglePharmacy = (pharmacy) => {
    const isSelected = selectedItems.some(item => item.id === pharmacy.id);
    if (isSelected) {
      setSelectedItems(selectedItems.filter(item => item.id !== pharmacy.id));
    } else {
      setSelectedItems([...selectedItems, pharmacy]);
    }
  };

  const handleAddNewPharmacy = () => {
    // Navigate to add new pharmacy form
    navigation.navigate('AddPharmacy');
  };

  const handleContinue = () => {
    if (onSelect) {
      onSelect(selectedItems);
    }
    navigation.goBack();
  };

  const renderPharmacyItem = ({ item }) => {
    const isSelected = selectedItems.some(pharmacy => pharmacy.id === item.id);
    
    return (
      <TouchableOpacity
        style={styles.pharmacyItem}
        onPress={() => handleTogglePharmacy(item)}
        activeOpacity={0.7}
      >
        <View style={styles.checkboxContainer}>
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <Icon name="checkmark" size={16} color="#fff" />}
          </View>
        </View>
        
        <View style={styles.pharmacyInfo}>
          <Text style={styles.pharmacyName}>{item.name}</Text>
          <Text style={styles.pharmacyCode}>{item.code}</Text>
        </View>
        
        <Text style={styles.pharmacyCity}>{item.city}</Text>
      </TouchableOpacity>
    );
  };

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
        <Text style={styles.headerTitle}>Select Pharmacy</Text>
      </View>

      {/* Filter Pills */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <MaterialIcons name="filter-list" size={20} color={colors.primary} />
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={styles.filterPill}
            onPress={() => setShowStateDropdown(!showStateDropdown)}
          >
            <Text style={styles.filterPillText}>{selectedState}</Text>
            <Icon name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterPill}
            onPress={() => setShowCityDropdown(!showCityDropdown)}
          >
            <Text style={styles.filterPillText}>{selectedCity}</Text>
            <Icon name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by pharmacy name/code"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          placeholderTextColor="#999"
        />
      </View>

      {/* Pharmacy List */}
      <FlatList
        data={searchQuery ? 
          MOCK_PHARMACIES.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.code.includes(searchQuery)
          ) : MOCK_PHARMACIES
        }
        renderItem={renderPharmacyItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={() => (
          <TouchableOpacity
            style={styles.addNewPharmacyButton}
            onPress={handleAddNewPharmacy}
          >
            <Icon name="add" size={20} color={colors.primary} />
            <Text style={styles.addNewPharmacyText}>Add New Pharmacy</Text>
          </TouchableOpacity>
        )}
      />

      {/* Bottom Button */}
      {selectedItems.length > 0 && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>
              Continue ({selectedItems.length} selected)
            </Text>
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  filterScroll: {
    flex: 1,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    marginRight: 8,
  },
  filterPillText: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
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
  pharmacyItem: {
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
  pharmacyInfo: {
    flex: 1,
  },
  pharmacyName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  pharmacyCode: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  pharmacyCity: {
    fontSize: 14,
    color: '#666',
  },
  addNewPharmacyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
  },
  addNewPharmacyText: {
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

export default PharmacySelector;