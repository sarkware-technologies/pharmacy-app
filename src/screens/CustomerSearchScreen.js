import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../styles/colors';

const CustomerSearchScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([
    'Jahangir General Hospital',
    'Dr. Sudhakar Joshi',
    'Pune Hospitals',
  ]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const searchBarScale = useRef(new Animated.Value(0.95)).current;

  // Mock data for search
  const allCustomers = [
    {
      id: '1',
      name: 'Jahangir General Hospital',
      code: '3595',
      location: 'Pune',
      type: '11-RFQ',
      category: 'Hospital',
    },
    {
      id: '2',
      name: 'Jahangir Bone General Hospital',
      code: '3594',
      location: 'Pune',
      type: '11-RFQ',
      category: 'Hospital',
    },
    {
      id: '3',
      name: 'Jahangir Maternity General Hospital',
      code: '3593',
      location: 'Pune',
      type: '11-RFQ',
      category: 'Hospital',
    },
  ];

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(searchBarScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-focus on search input
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 300);
  }, []);

  const searchInputRef = useRef(null);

  const handleSearch = (text) => {
    setSearchText(text);
    
    if (text.trim()) {
      // Animate search action
      const pulseAnim = new Animated.Value(1);
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Filter results based on search text
      const filtered = allCustomers.filter(customer =>
        customer.name.toLowerCase().includes(text.toLowerCase()) ||
        customer.code.includes(text)
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const handleRecentSearchClick = (search) => {
    const bounceAnim = new Animated.Value(1);
    
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSearchText(search);
      handleSearch(search);
    });
  };

  const renderSearchResult = ({ item, index }) => {
    const itemAnim = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
      Animated.timing(itemAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        style={[
          styles.resultItem,
          {
            opacity: itemAnim,
            transform: [
              {
                translateX: itemAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-30, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('CustomerDetail', { customer: item })}
          activeOpacity={0.7}
        >
          <View style={styles.resultContent}>
            <Text style={styles.resultName}>{item.name}</Text>
            <Icon name="chevron-forward" size={20} color="#999" />
          </View>
          <View style={styles.resultMeta}>
            <Icon name="qr-code-outline" size={14} color="#999" />
            <Text style={styles.resultMetaText}>{item.code}</Text>
            <Text style={styles.divider}>|</Text>
            <Text style={styles.resultMetaText}>{item.location}</Text>
            <Text style={styles.divider}>|</Text>
            <Text style={styles.resultMetaText}>{item.type}</Text>
            <Text style={styles.divider}>|</Text>
            <Text style={styles.resultMetaText}>{item.category}</Text>
            <Icon name="information-circle" size={14} color="#999" style={styles.infoIcon} />
          </View>
          <View style={styles.resultActions}>
            <Icon name="call-outline" size={16} color="#999" />
            <Text style={styles.contactText}>9080807070</Text>
            <Icon name="mail-outline" size={16} color="#999" style={styles.mailIcon} />
            <Text style={styles.contactText}>Sudhakarjoshi123@gmail.com</Text>
          </View>
          <TouchableOpacity style={styles.onboardButton}>
            <Text style={styles.onboardButtonText}>Onboard</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const EmptyState = () => (
    <Animated.View 
      style={[
        styles.emptyState,
        {
          opacity: fadeAnim,
          transform: [{ scale: searchBarScale }],
        },
      ]}
    >
      <Icon name="search" size={60} color="#DDD" />
      <Text style={styles.emptyStateText}>Searched results will display here</Text>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        
        {/* Header with Search Bar */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: searchBarScale },
            ],
          },
        ]}
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="chevron-back" size={28} color={colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.searchBar}>
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search by name or code"
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={handleSearch}
            autoFocus
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchText('');
                setSearchResults([]);
              }}
              style={styles.clearButton}
            >
              <Icon name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="options-outline" size={24} color="#666" />
        </TouchableOpacity>
      </Animated.View>

      {/* Recent Searches */}
      {searchText.length === 0 && recentSearches.length > 0 && (
        <Animated.View
          style={[
            styles.recentSearchContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.recentSearchTitle}>Recent Searches</Text>
          {recentSearches.map((search, index) => (
            <TouchableOpacity
              key={index}
              style={styles.recentSearchItem}
              onPress={() => handleRecentSearchClick(search)}
              activeOpacity={0.7}
            >
              <Icon name="time-outline" size={18} color="#999" />
              <Text style={styles.recentSearchText}>{search}</Text>
              <Icon name="arrow-forward-outline" size={16} color="#999" />
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

      {/* Search Results */}
      {searchText.length > 0 && searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResult}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      ) : searchText.length > 0 && searchResults.length === 0 ? (
        <View style={styles.noResults}>
          <Icon name="search-outline" size={60} color="#DDD" />
          <Text style={styles.noResultsText}>No results found for "{searchText}"</Text>
          <Text style={styles.noResultsSubtext}>Try searching with different keywords</Text>
        </View>
      ) : searchText.length === 0 && recentSearches.length === 0 ? (
        <EmptyState />
      ) : null}

      {/* Keyboard with Done button */}
      {Platform.OS === 'ios' && (
        <View style={styles.keyboardAccessory}>
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => Keyboard.dismiss()}
          >
            <Text style={styles.doneButtonText}>DONE</Text>
          </TouchableOpacity>
        </View>)}
      </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff'
  },
  backButton: {
    marginRight: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    marginLeft: 12,
    padding: 4,
  },
  recentSearchContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  recentSearchTitle: {
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  recentSearchText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#333',
  },
  resultsList: {
    paddingVertical: 8,
  },
  resultItem: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  resultContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultMetaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  divider: {
    color: '#999',
    marginHorizontal: 6,
  },
  infoIcon: {
    marginLeft: 4,
  },
  resultActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  mailIcon: {
    marginLeft: 12,
  },
  onboardButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
  onboardButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  noResultsText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  noResultsSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  keyboardAccessory: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    paddingRight: 16,
    paddingBottom: 8,
  },
  doneButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CustomerSearchScreen;