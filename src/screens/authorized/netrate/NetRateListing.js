import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { mockInvoicesData, mockPendingInvoices } from './Mockdata';
import NetRateUploadModal from '../../../components/netrate/NetRateUploadModal';
import Bell from '../../../components/icons/Bell';
import Menu from '../../../components/icons/Menu';
import { colors } from '../../../styles/colors';
import Filter from '../../../components/icons/Filter';
import Calendar from '../../../components/icons/Calendar';
import Download from '../../../components/icons/Download';
import AddrLine from '../../../components/icons/AddrLine';
import {AppText,AppInput} from "../../../components"
import claimsAPI from '../../../api/claims';

// Custom Skeleton Component
const SkeletonLoader = ({ width, height, style }) => {
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: '#E0E0E0',
          opacity,
        },
        style,
      ]}
    />
  );
};

const NetRateListing = () => {

  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [spilType, setSpilType] = useState('SPIL');
  const [overdueFilter, setOverdueFilter] = useState('Overdue');

  // Claims API state
  const [claimsData, setClaimsData] = useState([]);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [claimsError, setClaimsError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const tabs = ['All', 'Pending', 'Missed POD', 'Reassigned', 'Waiting for Approval'];

  // Map tab to claimModeId
  const getClaimModeId = (tab) => {
    const tabModeMap = {
      'All': 1,
      'Pending': 2,
      'Missed POD': 3,
      'Reassigned': 4,
      'Waiting for Approval': 5
    };
    return tabModeMap[tab] || 1;
  };

  // Fetch claims data
  const fetchClaims = async (page = 1, isLoadMore = false) => {
    try {
      setClaimsLoading(true);
      setClaimsError(null);
      
      const claimModeId = getClaimModeId(activeTab);
      const response = await claimsAPI.getClaimsList(claimModeId, page, 10, 'DESC');

      console.log(response?.data, "responseresponseresponse")
      
      if (response?.data?.claims) {
        const { claims, page: responsePage, limit, total } = response.data;
        const calculatedTotalPages = Math.ceil(total / limit);
        
        if (isLoadMore) {
          setClaimsData(prev => [...prev, ...claims]);
        } else {
          setClaimsData(claims);
        }
        
        setCurrentPage(responsePage);
        setTotalPages(calculatedTotalPages);
        setHasMore(responsePage < calculatedTotalPages);
        
        console.log('Claims fetched:', { page, total, claimsCount: claims.length });
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
      setClaimsError(error.message || 'Failed to load claims');
    } finally {
      setClaimsLoading(false);
    }
  };

  // Fetch claims on component mount and when active tab changes
  useEffect(() => {
    setCurrentPage(1);
    setClaimsData([]);
    fetchClaims(1, false);
  }, [activeTab]);

  // Handle load more
  const handleLoadMore = () => {
    if (!claimsLoading && hasMore) {
      fetchClaims(currentPage + 1, true);
    }
  };

  const handleInvoicePress = (invoice) => {
    if (invoice.status === 'DRAFT') {
      setSelectedInvoice(invoice);
      setShowUploadModal(true);
    } else if (invoice.status === 'PROCESSED') {
      // View processed invoice
      //navigation.navigate('InvoiceDetails', { invoice });
      navigation.getParent()?.navigate('NetrateStack', {
        screen: 'InvoiceDetails',
        params: { invoice }
      });
    }
  };

  const renderClaimItem = ({ item }) => {
    const statusColor = item.status === 'ACCEPTED' ? '#4CAF50' : 
                        item.status === 'PENDING' ? '#FF9800' : '#F44336';
    const statusBgColor = item.status === 'ACCEPTED' ? '#E8F5E9' : 
                          item.status === 'PENDING' ? '#FFF3E0' : '#FFEBEE';

    return (
      <TouchableOpacity 
        style={styles.invoiceCard}
        onPress={() => handleInvoicePress(item)}
      >
        {/* Header: Claim Number and Amount */}
        <View style={styles.invoiceHeader}>
          <View style={styles.invoiceIdContainer}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <AppText style={styles.invoiceId}>{item.claimNo}</AppText>
              <Icon name="chevron-right" size={24} color="#FFA500" />
            </View>
            <AppText style={styles.dateText}>
              Claim Date: {new Date(item.createdDate).toLocaleDateString('en-IN')}
            </AppText>
          </View>
          <View style={styles.amountContainer}>
            <AppText style={styles.podLabel}>POD: ₹ {parseFloat(item.claimedAmount).toLocaleString('en-IN')}</AppText>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />
        
        {/* Customer Name */}
        <View style={styles.customerInfo}>
          <AppText style={styles.customerName}>
            {item.customerDetails?.customerName}
          </AppText>
        </View>
        
        {/* Details Row: Code | Type | Order */}
        <View style={styles.detailsRow}>
          <View style={styles.codeContainer}>
            <AddrLine />
            <AppText style={styles.codeText}>
              {item.customerDetails?.customerCode}
            </AppText>
          </View>
          <AppText style={styles.separator}>|</AppText>
          <AppText style={styles.typeText}>
            {item.customerDetails?.customerType}
          </AppText>
          <AppText style={styles.separator}>|</AppText>
          <AppText style={styles.orderText}>
            {item.orders?.[0]?.orderNo || 'N/A'} ({new Date(item.orders?.[0]?.orderDate).toLocaleDateString('en-IN') || 'N/A'})
          </AppText>
        </View>
        
        {/* Short Supply / Order Count */}
        <AppText style={styles.shortSupplyText}>
          Short Supply (SKU's) : {item.orders?.[0]?.skwCount || 0}
        </AppText>
        
        {/* Claim Details */}
        <AppText style={styles.poText}>
          {item.claimNo} | Claim ID: {item.claimId}
        </AppText>
        
        {/* Status and Action Button */}
        <View style={styles.statusContainer}>
          <View style={[styles.draftBadge, { backgroundColor: statusBgColor }]}>
            <AppText style={[styles.draftText, { color: statusColor }]}>
              {item.status}
            </AppText>
          </View>
          <TouchableOpacity style={styles.uploadButton}>
            <Icon name="visibility" size={20} color="white" />
            <AppText style={styles.uploadText}>View Details</AppText>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSkeletonCard = () => (
    <View style={[styles.invoiceCard, { marginBottom: 16 }]}>
      <View style={styles.skeletonHeader}>
        <View>
          <SkeletonLoader width={180} height={20} style={styles.skeletonLine} />
          <SkeletonLoader width={120} height={16} style={[styles.skeletonLine, { marginTop: 4 }]} />
        </View>
        <SkeletonLoader width={80} height={24} style={styles.skeletonPill} />
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.skeletonContent}>
        <SkeletonLoader width={200} height={20} style={styles.skeletonLine} />
        <View style={styles.skeletonDetails}>
          <SkeletonLoader width={80} height={16} style={styles.skeletonLine} />
          <SkeletonLoader width={40} height={16} style={styles.skeletonLine} />
          <SkeletonLoader width={120} height={16} style={styles.skeletonLine} />
        </View>
        <SkeletonLoader width={160} height={16} style={styles.skeletonLine} />
        <SkeletonLoader width={220} height={16} style={[styles.skeletonLine, { marginTop: 8 }]} />
      </View>
      
      <View style={styles.skeletonActions}>
        <SkeletonLoader width={100} height={36} style={[styles.skeletonButton, { borderRadius: 8 }]} />
        <SkeletonLoader width={120} height={36} style={[styles.skeletonButton, { borderRadius: 8 }]} />
      </View>
    </View>
  );

  const renderContent = () => {
    if (claimsLoading && claimsData.length === 0) {
      return (
        <ScrollView style={{ padding: 16 }}>
          {Array(3).fill(0).map((_, index) => (
            <View key={index}>
              {renderSkeletonCard()}
            </View>
          ))}
        </ScrollView>
      );
    }

    // Show error state
    if (claimsError && claimsData.length === 0) {
      return (
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={48} color="#F44336" />
          <AppText style={styles.errorText}>{claimsError}</AppText>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => fetchClaims(1, false)}
          >
            <AppText style={styles.retryButtonText}>Retry</AppText>
          </TouchableOpacity>
        </View>
      );
    }

    // Show empty state
    if (claimsData.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="inbox" size={48} color="#CCC" />
          <AppText style={styles.emptyText}>No {activeTab.toLowerCase()} claims available</AppText>
        </View>
      );
    }

    switch (activeTab) {
      case 'All':
      case 'Pending':
      case 'Missed POD':
      case 'Reassigned':
      case 'Waiting for Approval':
        return (
          <>
            {activeTab === 'Pending' && (
              <View style={styles.filterContainer}>
                <View style={styles.spilToggle}>
                  <TouchableOpacity
                    style={[styles.toggleButton, spilType === 'SPIL' && styles.activeToggle]}
                    onPress={() => setSpilType('SPIL')}
                  >
                    <AppText style={[styles.toggleText, spilType === 'SPIL' && styles.activeToggleText]}>
                      SPIL
                    </AppText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.middleToggle}
                    disabled
                  >
                    <View style={styles.radioButton}>
                      <View style={[styles.radio, overdueFilter === 'Overdue' && styles.radioSelected]}>
                        {overdueFilter === 'Overdue' && <View style={styles.radioInner} />}
                      </View>
                      <AppText style={styles.radioText}>Overdue</AppText>
                    </View>
                    <View style={styles.radioButton}>
                      <View style={[styles.radio, overdueFilter === 'Due' && styles.radioSelected]}>
                        {overdueFilter === 'Due' && <View style={styles.radioInner} />}
                      </View>
                      <AppText style={styles.radioText}>Due</AppText>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleButton, styles.toggleButtonRight, spilType === 'SPLL' && styles.activeToggle]}
                    onPress={() => setSpilType('SPLL')}
                  >
                    <AppText style={[styles.toggleText, spilType === 'SPLL' && styles.activeToggleText]}>
                      SPLL
                    </AppText>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            <FlatList
              data={claimsData}
              renderItem={renderClaimItem}
              keyExtractor={(item, index) => `${item.claimId}-${index}`}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.3}
              ListFooterComponent={() => 
                claimsLoading && claimsData.length > 0 ? (
                  <View style={styles.footerLoader}>
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                ) : null
              }
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Menu />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>NetRate</AppText>
        <View style={styles.headerRight}>
          <TouchableOpacity>
            <Bell />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.tabContainer}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <AppText style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </AppText>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <View style={{backgroundColor: '#F5F5F5', flex: 1}}>
        {(activeTab === 'All' || activeTab === 'Pending') && (
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Icon name="search" size={20} color="#999" />
              <AppInput
                style={styles.searchInput}
                placeholder="Search customer name/code..."
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor="#999"
              />
            </View>
            <TouchableOpacity style={styles.filterButton}>
              <Filter />
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
              <Calendar />
            </TouchableOpacity>
          </View>
        )}
        
        {renderContent()}
        
        <NetRateUploadModal
          visible={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          invoice={selectedInvoice}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
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
  tabContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    maxHeight: 55,
    flexGrow: 0,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginRight: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#F6F6F6',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  invoiceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowRadius: 4,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 12,
  },
  invoiceIdContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
  },
  invoiceId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  podLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  dbtnText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  customerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  separator: {
    fontSize: 12,
    color: '#E0E0E0',
    marginHorizontal: 8,
  },
  typeText: {
    fontSize: 12,
    color: '#999',
  },
  orderText: {
    fontSize: 12,
    color: '#999',
  },
  shortSupplyText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  poText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  draftBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  draftText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
  },
  processedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  processedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFA500',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  uploadText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: '500',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewText: {
    fontSize: 14,
    color: '#FFA500',
    marginLeft: 4,
    fontWeight: '500',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
  },
  spilToggle: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#FFA500',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  toggleButtonRight: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  activeToggle: {
    backgroundColor: '#FFA500',
  },
  toggleText: {
    fontSize: 14,
    color: '#FFA500',
    fontWeight: '500',
  },
  activeToggleText: {
    color: '#FFFFFF',
  },
  middleToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    gap: 16,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFA500',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  radioSelected: {
    backgroundColor: '#FFA500',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  radioText: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    marginTop: 12,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  skeletonLine: {
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonPill: {
    borderRadius: 12,
  },
  skeletonContent: {
    marginBottom: 12,
  },
  skeletonDetails: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 8,
  },
  skeletonButton: {
    borderRadius: 8,
  },
  skeletonActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
});

export default NetRateListing;