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
import CloseCircle from '../../../components/icons/CloseCircle';
import Filter from '../../../components/icons/Filter';
import ArrowDown from '../../../components/icons/ArrowDown';
import Search from '../../../components/icons/Search';
import FilterCheck from '../../../components/icons/FilterCheck';

// Mock hospital data
const MOCK_HOSPITALS = [
  { id: 1, name: 'Columbia Asia', code: '10106555', city: 'Pune', state: 'Maharashtra', contract: '9-Contract' },
  { id: 2, name: 'Command', code: '10006565', city: 'Bengaluru', state: 'Karnataka', contract: '11-RFQ' },
  { id: 3, name: 'Tata Memorial Hospital', code: '10106555', city: 'Jaipur', state: 'Rajasthan', contract: '9-Contract' },
  { id: 4, name: 'Safar Dang Hospital', code: '10006565', city: 'Pimpri', state: 'Maharashtra', contract: '12-Tender' },
  { id: 5, name: "King's George Medical", code: '10106555', city: 'Indira Nagar', state: 'UP', contract: '9-Contract' },
  { id: 6, name: 'Dr. Naidu', code: '10006565', city: 'Hydrabad', state: 'Telangana', contract: '11-RFQ' },
  { id: 7, name: 'District Hospital', code: '10106555', city: 'Pune', state: 'Maharashtra', contract: '9-Contract' },
  { id: 8, name: 'MGM Hospital', code: '10006565', city: 'Viman Nagar', state: 'Maharashtra', contract: '12-Tender' },
  { id: 9, name: 'MMF Ratna Memorial Hospital', code: '10006565', city: 'Bengaluru', state: 'Karnataka', contract: '11-RFQ' },
  { id: 10, name: 'Rubby hall clinic', code: '10006565', city: 'Wagholi', state: 'Maharashtra', contract: '9-Contract' },
];

const STATES = ['All States', 'Maharashtra', 'Karnataka', 'Rajasthan', 'UP', 'Telangana'];
const CITIES = ['All Cities', 'Pune', 'Bengaluru', 'Jaipur', 'Pimpri', 'Hydrabad', 'Viman Nagar', 'Wagholi', 'Indira Nagar'];
const CONTRACTS = ['All Contracts', '9-Contract', '11-RFQ', '12-Tender'];

const HospitalSelector = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { onSelect, selectedHospitals = [] } = route.params || {};
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('4 States');
  const [selectedCity, setSelectedCity] = useState('55 Cities');
  const [selectedContract, setSelectedContract] = useState('9-Contract');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState(selectedHospitals);
  const [showNoResults, setShowNoResults] = useState(false);
  
  // Filter dropdowns
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showContractDropdown, setShowContractDropdown] = useState(false);
  
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
    // Filter hospitals based on search query
    const filtered = MOCK_HOSPITALS.filter(hospital => 
      hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.code.includes(searchQuery)
    );
    
    if (filtered.length === 0) {
      setShowNoResults(true);
    } else {
      setShowNoResults(false);
    }
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

  const handleAddNewHospital = () => {
    // Navigate to add new hospital form
    navigation.navigate('AddGroupHospital');
  };

  const renderHospitalItem = ({ item }) => {
    const isSelected = selectedItems.some(hospital => hospital.id === item.id);
    
    return (
      <TouchableOpacity
        style={styles.hospitalItem}
        onPress={() => handleToggleHospital(item)}
        activeOpacity={0.7}
      >
        <View style={styles.checkboxContainer}>
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <FilterCheck />}
          </View>
        </View>
        
        <View style={styles.hospitalInfo}>
          <Text style={styles.hospitalName}>{item.name}</Text>
          <Text style={styles.hospitalCode}>{item.code}</Text>
        </View>
        
        <Text style={styles.hospitalCity}>{item.city}</Text>
      </TouchableOpacity>
    );
  };

  const renderNoResults = () => (
    <View style={styles.noResultsContainer}>
      <Icon name="search-outline" size={60} color="#CCC" />
      <Text style={styles.noResultsTitle}>Hospital Not Found</Text>
      <Text style={styles.noResultsText}>
        Hospital not found. You can add group hospital to continue.{'\n'}
        Else try to search different hospital
      </Text>
      <TouchableOpacity
        style={styles.addNewButton}
        onPress={handleAddNewHospital}
      >        
        <Text style={styles.addNewButtonText}>+Add New Group Hospital</Text>
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
          <CloseCircle />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Hospital</Text>
      </View>

      {/* Filter Pills */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Filter color={colors.primary} />
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={styles.filterPill}
            onPress={() => setShowStateDropdown(!showStateDropdown)}
          >
            <Text style={styles.filterPillText}>{selectedState}</Text>            
            <ArrowDown width='10' color='#666' />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterPill}
            onPress={() => setShowCityDropdown(!showCityDropdown)}
          >
            <Text style={styles.filterPillText}>{selectedCity}</Text>
            <ArrowDown width='10' color='#666' />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterPill}
            onPress={() => setShowContractDropdown(!showContractDropdown)}
          >
            <Text style={styles.filterPillText}>{selectedContract}</Text>
            <ArrowDown width='10' color='#666' />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterPill}
            onPress={() => {}}
          >
            <Text style={styles.filterPillText}>Hospital/Clinic...</Text>
            <ArrowDown width='10' color='#666' />
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>        
        <Search style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by hospital name/code"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          placeholderTextColor="#999"
        />
      </View>

      {/* Hospital List or No Results */}
      {showNoResults ? (
        renderNoResults()
      ) : (
        <FlatList
          data={searchQuery ? 
            MOCK_HOSPITALS.filter(h => 
              h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              h.code.includes(searchQuery)
            ) : MOCK_HOSPITALS
          }
          renderItem={renderHospitalItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Bottom Button */}
      {!showNoResults && selectedItems.length > 0 && (
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
  hospitalItem: {
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
    fontSize: 14,
    color: '#666',
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

export default HospitalSelector;