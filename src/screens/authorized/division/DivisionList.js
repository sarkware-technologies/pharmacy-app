import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,  
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../../styles/colors';
import Menu from '../../../components/icons/Menu';
import GroupUpdateModal from '../../../components/GroupUpdateModal';
import AppText from "../../../components/AppText"

import { getDivisions } from '../../../api/division';
import {
  setDivisions,
  setLoading,
  setSelectedDivision,
  setPagination,
  setFilters
} from '../../../redux/slices/divisionSlice';
import Bell from '../../../components/icons/Bell';
import Search from '../../../components/icons/Search';
import Edit from '../../../components/icons/Edit';
import AddrLine from '../../../components/icons/AddrLine';
import ChevronRight from '../../../components/icons/ChevronRight';

const DivisionList = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { divisions = [], loading, pagination, filters } = useSelector(state => state.division || {});
  
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [listError, setListError] = useState(null);
  const [allDivisions, setAllDivisions] = useState([]);
  const [showGroupUpdateModal, setShowGroupUpdateModal] = useState(false);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Debounce timer ref
  const searchTimer = useRef(null);

  useEffect(() => {
    loadInitialData();
    
    // Animate list appearance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const loadInitialData = async () => {
    dispatch(setLoading(true));
    setListError(null);
    setAllDivisions([]);
    
    try {
      const data = await getDivisions(1, 10, searchText);
      setAllDivisions(data.divisions || []);
      dispatch(setDivisions(data.divisions || []));
      dispatch(setPagination({
        page: 1,
        limit: 10,
        total: data.total || 0
      }));
      
      const totalLoaded = data.divisions?.length || 0;
      setHasMoreData(totalLoaded < data.total);
    } catch (error) {
      console.error('Error loading divisions:', error);
      setListError(error.message || 'Failed to load divisions');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setListError(null);
    
    try {
      const data = await getDivisions(1, 10, searchText);
      setAllDivisions(data.divisions || []);
      dispatch(setDivisions(data.divisions || []));
      dispatch(setPagination({
        page: 1,
        limit: 10,
        total: data.total || 0
      }));
      
      const totalLoaded = data.divisions?.length || 0;
      setHasMoreData(totalLoaded < data.total);
    } catch (error) {
      console.error('Error refreshing divisions:', error);
      setListError(error.message || 'Failed to refresh divisions');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasMoreData || loading || refreshing) return;
    
    if (allDivisions.length >= pagination.total) {
      setHasMoreData(false);
      return;
    }
    
    setLoadingMore(true);
    const nextPage = pagination.page + 1;
    
    try {
      const data = await getDivisions(nextPage, 10, searchText);
      const newDivisions = data.divisions || [];
      
      if (newDivisions.length > 0) {
        const updatedList = [...allDivisions, ...newDivisions];
        setAllDivisions(updatedList);
        dispatch(setDivisions(updatedList));
        dispatch(setPagination({
          page: nextPage,
          limit: 10,
          total: data.total || 0
        }));
        
        setHasMoreData(updatedList.length < data.total);
      } else {
        setHasMoreData(false);
      }
    } catch (error) {
      console.error('Error loading more divisions:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    
    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
    }
    
    searchTimer.current = setTimeout(() => {
      dispatch(setFilters({ search: text }));
      loadInitialData();
    }, 500);
  };

  const handleDivisionPress = (division) => {
    dispatch(setSelectedDivision(division));
    navigation.getParent()?.navigate('DivisionStack', {
        screen: 'DivisionDetail',
        params: { division },
    });
  };

  const handleGroupUpdate = () => {
    setShowGroupUpdateModal(true);
  };

  const handleGroupUpdateOption = (option) => {
    switch(option) {
      case 'max_discount':
        navigation.getParent()?.navigate('DivisionStack', {
          screen: 'UpdateMaxDiscount'
        });
        break;
      case 'ceo_threshold':
        navigation.getParent()?.navigate('DivisionStack', {
          screen: 'CEOThresholdUpdate'
        });
        break;
      case 'link_customers':
        // Navigate to Link Customers screen when implemented
        navigation.getParent()?.navigate('DivisionStack', {
          screen: 'LinkCustomers'
        });
        break;
    }
  };

  const keyExtractor = useCallback((item) => item.divisionId.toString(), []);

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
        <AppText style={styles.loadingMoreText}>Loading more divisions...</AppText>
      </View>
    );
  };

  const renderDivision = ({ item }) => (
    <TouchableOpacity 
      style={styles.divisionCard}
      onPress={() => handleDivisionPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <AppText style={styles.divisionName}>{item.divisionName || 'Unnamed Division'} <ChevronRight height={12} color={colors.primary} /></AppText>
        <TouchableOpacity style={styles.editButton}>          
          <Edit />
        </TouchableOpacity>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <AddrLine />
          <AppText style={styles.detailText}>
            {item.divisionCode} | Customers: {item.totalDistributors || 0}
          </AppText>
        </View>
        
        <View style={styles.headerDivisionRow}>
          <AppText style={styles.headerDivisionLabel}>Header Division</AppText>
          <AppText style={styles.headerDivisionValue}>
            {item.headerDivisionNamme || 'Common (2016)'}
          </AppText>
        </View>
      </View>

      <View style={styles.marginSection}>
        <AppText style={styles.marginTitle}>Max Discount</AppText>
        <View style={styles.marginRow}>
          <AppText style={styles.marginLabel}>
            Doctor : <AppText style={{ color: '#333' }}>{item.divisionMargin?.doctorMargin || item.ceoMargin?.doctorMargin || 0}%</AppText>
          </AppText>
          <AppText style={styles.marginLabel}>
            Hospital : <AppText style={{ color: '#333' }}>{item.divisionMargin?.hospitalMargin || item.ceoMargin?.hospitalMargin || 0}%</AppText>
          </AppText>
        </View>
      </View>
    </TouchableOpacity>
  );

  const onRetry = () => {
    setListError(null);
    loadInitialData();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      <View style={{backgroundColor: '#F5F5F5', flex: 1}}>

      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Menu />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>Divisions</AppText>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.groupUpdateButton}
            onPress={handleGroupUpdate}
          >
            <AppText style={styles.groupUpdateText}>GROUP UPDATE</AppText>
            <Icon name="arrow-drop-down" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity>            
            <Bell />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by division name/code"
            value={searchText}
            onChangeText={handleSearch}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <Animated.View
        style={[
          styles.listContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {loading && allDivisions.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <AppText style={styles.loadingText}>Loading divisions...</AppText>
          </View>
        ) : listError && allDivisions.length === 0 ? (
          <View style={styles.errorContainer}>
            <Icon name="error-outline" size={60} color="#EF4444" />
            <AppText style={styles.errorTitle}>Unable to Load Divisions</AppText>
            <AppText style={styles.errorMessage}>
              {listError || 'Something went wrong. Please try again.'}
            </AppText>
            <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
              <Icon name="refresh" size={20} color="#fff" />
              <AppText style={styles.retryButtonText}>Retry</AppText>
            </TouchableOpacity>
          </View>
        ) : allDivisions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="folder-open" size={60} color="#9CA3AF" />
            <AppText style={styles.emptyTitle}>No Divisions Found</AppText>
            <AppText style={styles.emptyMessage}>
              {searchText ? `No divisions match "${searchText}"` : 'No divisions available'}
            </AppText>
          </View>
        ) : (
          <FlatList
            data={allDivisions}
            renderItem={renderDivision}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderFooter()}
          />
        )}
      </Animated.View>

        <GroupUpdateModal
        visible={showGroupUpdateModal}
        onClose={() => setShowGroupUpdateModal(false)}
        onSelectOption={handleGroupUpdateOption}
      />
      </View>
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
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  headerRight: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  groupUpdateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  groupUpdateText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 0,
    backgroundColor: '#F5F5F5',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  divisionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,    
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  divisionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  editButton: {
    padding: 4,
  },
  cardDetails: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  headerDivisionRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',        
  },
  headerDivisionLabel: {
    fontSize: 12,
    color: '#333',
    marginRight: 10    
  },
  headerDivisionValue: {
    fontSize: 12,
    color: '#999',
  },
  marginSection: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 0
  },
  marginTitle: {
    fontSize: 12,
    color: '#333',
    marginBottom: 0,
  },
  marginRow: {
    flexDirection: 'row',
    gap: 40,
  },
  marginLabel: {
    fontSize: 12,
    color: '#999',
  },
  viewMoreButton: {
    position: 'absolute',
    right: 12,
    bottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 16,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  loadingMoreText: {
    fontSize: 12,
    color: '#666',
  },
});

export default DivisionList;