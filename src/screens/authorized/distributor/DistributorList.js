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
  Modal,
  Animated
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../../styles/colors';
import { getDistributors, inviteDistributor } from '../../../api/distributor';
import { 
  setDistributors, 
  setLoading, 
  setSelectedDistributor,
  setPagination,
  setFilters 
} from '../../../redux/slices/distributorSlice';
import Menu from '../../../components/icons/Menu';
import Bell from '../../../components/icons/Bell';
import Filter from '../../../components/icons/Filter';
import ChevronRight from '../../../components/icons/ChevronRight';
import Phone from '../../../components/icons/Phone';
import AddrLine from '../../../components/icons/AddrLine';

const DistributorList = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { distributors = [], loading, pagination, filters } = useSelector(state => state.distributor || {});
  
  const [searchText, setSearchText] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedDistributorForInvite, setSelectedDistributorForInvite] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [listError, setListError] = useState(null);
  const [allDistributors, setAllDistributors] = useState([]);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
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
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadInitialData = async () => {
    dispatch(setLoading(true));
    setListError(null);
    setAllDistributors([]);
    
    try {
      const data = await getDistributors(1, 20, searchText);
      setAllDistributors(data.distributors || []);
      dispatch(setDistributors(data.distributors || []));
      dispatch(setPagination({
        page: 1,
        limit: 20,
        total: data.total || 0
      }));
      
      // Check if there's more data based on total count
      const totalLoaded = data.distributors?.length || 0;
      setHasMoreData(totalLoaded < data.total);
    } catch (error) {
      console.error('Error loading distributors:', error);
      setListError(error.message || 'Failed to load distributors');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setListError(null);
    
    try {
      const data = await getDistributors(1, 20, searchText);
      setAllDistributors(data.distributors || []);
      dispatch(setDistributors(data.distributors || []));
      dispatch(setPagination({
        page: 1,
        limit: 20,
        total: data.total || 0
      }));
      
      // Check if there's more data based on total count
      const totalLoaded = data.distributors?.length || 0;
      setHasMoreData(totalLoaded < data.total);
    } catch (error) {
      console.error('Error refreshing distributors:', error);
      setListError(error.message || 'Failed to refresh distributors');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    // Don't load more if already loading, no more data, or if we've loaded all items
    if (loadingMore || !hasMoreData || loading || refreshing) return;
    
    // Check if we've already loaded all items
    if (allDistributors.length >= pagination.total) {
      setHasMoreData(false);
      return;
    }
    
    setLoadingMore(true);
    const nextPage = pagination.page + 1;
    
    try {
      const data = await getDistributors(nextPage, 20, searchText);
      const newDistributors = data.distributors || [];
      
      if (newDistributors.length > 0) {
        const updatedList = [...allDistributors, ...newDistributors];
        setAllDistributors(updatedList);
        dispatch(setDistributors(updatedList));
        dispatch(setPagination({
          page: nextPage,
          limit: 20,
          total: data.total || 0
        }));
        
        // Check if we've loaded all items
        setHasMoreData(updatedList.length < data.total);
      } else {
        setHasMoreData(false);
      }
    } catch (error) {
      console.error('Error loading more distributors:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    
    // Clear existing timer
    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
    }
    
    // Set new timer for debounced search
    searchTimer.current = setTimeout(() => {
      dispatch(setFilters({ search: text }));
      loadInitialData();
    }, 500);
  };

  const handleDistributorPress = (distributor) => {
    dispatch(setSelectedDistributor(distributor));
    //navigation.navigate('DistributorDetail', { distributor });
    navigation.getParent()?.navigate('DistributorStack', {
        screen: 'DistributorDetail',
        params: { distributor },
    });
  };

  const handleGroupUpdate = () => {
    //navigation.navigate('DistributorGroupUpdate');
    navigation.getParent()?.navigate('DistributorStack', {
        screen: 'DistributorGroupUpdate'
    });
  };

  const handleInvite = (distributor) => {
    setSelectedDistributorForInvite(distributor);
    setShowInviteModal(true);
  };

  const sendInvite = async () => {
    try {
      await inviteDistributor(selectedDistributorForInvite.id);
      setShowInviteModal(false);
      setSelectedDistributorForInvite(null);
      handleRefresh();
    } catch (error) {
      console.error('Error sending invite:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
      case 'active':
        return colors.success;
      case 'pending':
      case 'not invited':
        return colors.primary;
      case 'blocked':
        return colors.error;
      default:
        return colors.gray;
    }
  };

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingMoreText}>Loading more distributors...</Text>
      </View>
    );
  };

  const renderEndReached = () => {
    if (hasMoreData || loadingMore || allDistributors.length === 0) return null;
    
    return (
      <View style={styles.endReachedContainer}>
        <Text style={styles.endReachedText}>You've reached the end</Text>
      </View>
    );
  };

  const onRetry = () => {
    setListError(null);
    loadInitialData();
  };

  const renderDistributor = ({ item }) => (
    <TouchableOpacity 
      style={styles.distributorCard}
      onPress={() => handleDistributorPress(item)}
      activeOpacity={0.7}
    >
      <TouchableOpacity 
        style={styles.cardHeader}
        onPress={() => handleDistributorPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.nameRow}>
          <Text style={styles.distributorName}>{item.name} <ChevronRight color={colors.primary} height={12} /></Text>          
          <View style={styles.statusBadge}>
          <Icon 
            name="check-circle" 
            size={16} 
            color={getStatusColor(item.inviteStatusName)}
          />
          <Text style={[styles.statusText, { color: getStatusColor(item.inviteStatusName) }]}>
            {item.inviteStatusName || 'Not Invited'}
          </Text>
        </View>
        </View>        
      </TouchableOpacity>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <AddrLine />
          <Text style={styles.detailText}>
            {item.code} | {item.distributorType || 'CFA-DT'} | {item.organizationCode || 'SPLL'}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Phone />
          <Text style={styles.detailText}>{item.mobile1}</Text>
          <Text style={styles.divisionCount}>| Divisions : <Text style={{ color: '#222', fontWeight: '500' }}>{item.divisionCount || 0}</Text></Text>
          <TouchableOpacity onPress={() => handleDistributorPress(item)}>
            <Icon name="visibility" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.marginSection}>
        <Text style={styles.marginTitle}>Supply Margin</Text>
        <View style={styles.marginRow}>
          <Text style={styles.marginLabel}>Doctor : <Text style={{color: '#222', fontWeight: '500'}}>{item.doctorSupplyMargin}%</Text></Text>
          <Text style={styles.marginLabel}>Hospital : <Text style={{color: '#222', fontWeight: '500'}}>{item.hospitalSupplyMargin}%</Text></Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.blockStatusBadge}>
          <Text style={styles.blockStatusText}>
            {item.isActive ? 'UNBLOCKED' : 'BLOCKED'}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={() => handleInvite(item)}
        >
          <Icon name="more-vert" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderInviteModal = () => (
    <Modal
      visible={showInviteModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowInviteModal(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowInviteModal(false)}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>More</Text>
            <TouchableOpacity onPress={() => setShowInviteModal(false)}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.inviteButton}
            onPress={sendInvite}
          >
            <Icon name="person-add" size={24} color="#666" />
            <Text style={styles.inviteButtonText}>Invite</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Menu />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Distributors</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.groupUpdateButton}
            onPress={handleGroupUpdate}
          >
            <Text style={styles.groupUpdateText}>GROUP UPDATE</Text>
            <Icon name="arrow-drop-down" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Bell />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by distributor name/code"
            value={searchText}
            onChangeText={handleSearch}
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Filter />
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[
          styles.listContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        {loading && allDistributors.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading distributors...</Text>
          </View>
        ) : listError && allDistributors.length === 0 ? (
          <View style={styles.errorContainer}>
            <Icon name="error-outline" size={60} color="#EF4444" />
            <Text style={styles.errorTitle}>Unable to Load Distributors</Text>
            <Text style={styles.errorMessage}>
              {listError === 'Network request failed' || listError.includes('Network')
                ? 'Server is currently unavailable. Please check your connection and try again.'
                : listError || 'Something went wrong. Please try again.'}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
              <Icon name="refresh" size={20} color="#fff" />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : allDistributors.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="business" size={60} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Distributors Found</Text>
            <Text style={styles.emptyMessage}>
              {searchText ? `No distributors match "${searchText}"` : 'No distributors available'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={allDistributors}
            renderItem={renderDistributor}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            removeClippedSubviews={true}
            maxToRenderPerBatch={20}
            windowSize={20}
            initialNumToRender={10}
            updateCellsBatchingPeriod={50}
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
            ListFooterComponent={
              <>
                {renderFooter()}
                {renderEndReached()}
              </>
            }
          />
        )}
      </Animated.View>

      {renderInviteModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
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
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 0,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  filterButton: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#fff'
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  distributorCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,    
  },
  cardHeader: {
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  distributorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardDetails: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',    
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  divisionCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    marginRight: 8
  },
  marginSection: {      
    marginBottom: 6,
    flexDirection: 'row'
  },
  marginTitle: {
    fontSize: 12,
    color: '#222',
    fontWeight: '500',
    marginRight: 10    
  },
  marginRow: {
    flexDirection: 'row',
    gap: 20,
  },
  marginLabel: {
    fontSize: 12,
    color: '#666',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  blockStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
  },
  blockStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  moreButton: {
    padding: 4,
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
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
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
  endReachedContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  endReachedText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
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
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  inviteButtonText: {
    fontSize: 16,
    color: '#333',
  },
});

export default DistributorList;