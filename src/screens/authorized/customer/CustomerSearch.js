/* eslint-disable react/no-unstable-nested-components */
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
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../../styles/colors';
import {AppText,AppInput} from "../../../components"
import { fetchCustomersList, resetCustomersList, selectCustomers, selectLoadingStates } from '../../../redux/slices/customerSlice';
import { SkeletonList } from '../../../components/SkeletonLoader';
import FilterModal from '../../../components/FilterModal';
import CustomerSearchResultsIcon from '../../../components/icons/CustomerSearchResultsIcon';

const CustomerSearch = ({ navigation }) => {
  const dispatch = useDispatch();
  const customers = useSelector(selectCustomers);
  const { listLoading } = useSelector(selectLoadingStates);
  
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const searchBarScale = useRef(new Animated.Value(0.95)).current;

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

      // Call API with search text
      dispatch(resetCustomersList());
      dispatch(fetchCustomersList({
        page: 1,
        limit: 20,
        searchText: text,
        isLoadMore: false,
      }));
    } else {
      setSearchResults([]);
      dispatch(resetCustomersList());
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
    const handleViewDetails = () => {
      console.log('Navigating to CustomerDetail with customer:', item);
      navigation.navigate('CustomerDetail', { customer: item });
    };

    // Get status badge color and text based on item.statusName
    const getStatusStyle = () => {
      const status = item.statusName?.toUpperCase();
      switch (status) {
        case 'ACTIVE':
          return { bg: '#E8F5E9', text: '#2E7D32', label: 'Active' };
        case 'LOCKED':
        case 'BLOCKED':
          return { bg: '#FFEBEE', text: '#C62828', label: 'Blocked' };
        case 'PENDING':
          return { bg: '#FFF3E0', text: '#E65100', label: 'Pending' };
        case 'NOT-ONBOARDED':
          return { bg: '#E3F2FD', text: '#1565C0', label: 'Not Onboarded' };
        case 'UN-VERIFIED':
          return { bg: '#F3E5F5', text: '#7B1FA2', label: 'Un-Verified' };
        case 'REJECTED':
          return { bg: '#FFEBEE', text: '#C62828', label: 'Rejected' };
        case 'APPROVED':
          return { bg: '#E8F5E9', text: '#2E7D32', label: 'Approved' };
        default:
          return status ? { bg: '#F5F5F5', text: '#666', label: status } : null;
      }
    };

    // Get action badge color and text based on item.action
    const getActionStyle = () => {
      const action = item.action?.toUpperCase();
      switch (action) {
        case 'APPROVE':
          return { bg: '#E8F5E9', text: '#2E7D32', label: 'Approve' };
        case 'REJECT':
          return { bg: '#FFEBEE', text: '#C62828', label: 'Reject' };
        case 'BLOCK':
          return { bg: '#FFF3E0', text: '#E65100', label: 'Block' };
        case 'ACCEPT':
          return { bg: '#E3F2FD', text: '#1565C0', label: 'Accept' };
        default:
          return null;
      }
    };

    const statusStyle = getStatusStyle();
    const actionStyle = getActionStyle();

    return (
      <TouchableOpacity
        style={[
          styles.resultItem,
          {
            opacity: 1,
          },
        ]}
        onPress={handleViewDetails}
        activeOpacity={0.7}
      >
        <View style={styles.resultContent}>
          <AppText style={styles.resultName}>{item.customerName || item.name}</AppText>
          <View style={styles.resultRightContent}>
            {statusStyle && (
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                <AppText style={[styles.statusBadgeText, { color: statusStyle.text }]}>
                  {statusStyle.label}
                </AppText>
              </View>
            )}
            {actionStyle && (
              <View style={[styles.actionBadge, { backgroundColor: actionStyle.bg }]}>
                <AppText style={[styles.actionBadgeText, { color: actionStyle.text }]}>
                  {actionStyle.label}
                </AppText>
              </View>
            )}
            <Icon name="chevron-forward" size={20} color="#999" />
          </View>
        </View>
        <View style={styles.resultMeta}>
          <Icon name="qr-code-outline" size={14} color="#999" />
          <AppText style={styles.resultMetaText}>{item.customerCode || item.code}</AppText>
          <AppText style={styles.divider}>|</AppText>
          <AppText style={styles.resultMetaText}>{item.cityName || item.location}</AppText>
        </View>
        <View style={styles.resultActions}>
          <Icon name="call-outline" size={16} color="#999" />
          <AppText style={styles.contactText}>{item.mobile || 'N/A'}</AppText>
          <Icon name="mail-outline" size={16} color="#999" style={styles.mailIcon} />
          <AppText style={styles.contactText}>{item.email || 'N/A'}</AppText>
        </View>
      </TouchableOpacity>
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
      <CustomerSearchResultsIcon />
      <AppText style={styles.emptyStateText}>Searched results will display here</AppText>
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
        <View style={styles.searchBar}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="chevron-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          
          <AppInput
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
                dispatch(resetCustomersList());
              }}
              style={styles.clearButton}
            >
              <Icon name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
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
          <AppText style={styles.recentSearchTitle}>Recent Searches</AppText>
          {recentSearches.map((search, index) => (
            <TouchableOpacity
              key={index}
              style={styles.recentSearchItem}
              onPress={() => handleRecentSearchClick(search)}
              activeOpacity={0.7}
            >
              <Icon name="time-outline" size={18} color="#999" />
              <AppText style={styles.recentSearchText}>{search}</AppText>
              <Icon name="arrow-forward-outline" size={16} color="#999" />
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

      {/* Search Results */}
      {searchText.length > 0 && listLoading ? (
        <SkeletonList items={5} />
      ) : searchText.length > 0 && customers.length > 0 ? (
        <FlatList
          data={customers}
          renderItem={renderSearchResult}
          keyExtractor={(item) => item.customerId || item.stgCustomerId || item.id}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      ) : searchText.length > 0 && customers.length === 0 && !listLoading ? (
        <View style={styles.noResults}>
          <Icon name="search-outline" size={60} color="#DDD" />
          <AppText style={styles.noResultsText}>No results found for "{searchText}"</AppText>
          <AppText style={styles.noResultsSubtext}>Try searching with different keywords</AppText>
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
            <AppText style={styles.doneButtonText}>DONE</AppText>
          </TouchableOpacity>
        </View>)}
      </KeyboardAvoidingView>

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApplyFilters={(filters) => {
          // Handle filter application
          setFilterModalVisible(false);
        }}
      />
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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 20,
    backgroundColor: '#fff',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingLeft: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 0,
    fontSize: 14,
    color: '#333',
    height: 20,
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
  resultRightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  actionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  actionBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
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

export default CustomerSearch;