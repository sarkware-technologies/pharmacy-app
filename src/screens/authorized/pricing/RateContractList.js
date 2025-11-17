import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  StatusBar,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../styles/colors';
import Menu from '../../../components/icons/Menu';
import Bell from '../../../components/icons/Bell';
import ArrowDown from '../../../components/icons/ArrowDown';
import Search from '../../../components/icons/Search';
import Filter from '../../../components/icons/Filter';
import Calendar from '../../../components/icons/Calendar';
import AddCircle from '../../../components/icons/AddCircle';
import EyeOpen from '../../../components/icons/EyeOpen';
import ChevronRight from '../../../components/icons/ChevronRight';
import Business from '../../../components/icons/Business';
import AddrLine from '../../../components/icons/AddrLine';
import PauseCircle from '../../../components/icons/PauseCircle';
import { AppText, AppInput } from "../../../components"
import { getPriceSummary, getRCStatus } from "../../../api/rate-contract"
import Svg, { Path } from 'react-native-svg';
import {
  AddProduct,
  ProductSwapping,
  UpdateDiscount,
  UpdateSupplyMode,
  QuotationGeneration,
  CloseIcon
} from "../../../components/icons/pricingIcon"

const RateContractList = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('Active');
  const [searchText, setSearchText] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [showGroupupdate, setShowGroupupdate] = useState(false);

  const [selectedFilters, setSelectedFilters] = useState({
    status: ['Active', 'Draft', 'Expired RC', 'Inactive RC', 'Pending Approval', 'Approved', 'Rejected', 'Cancelled', 'Reassigned', 'Expiring Soon'],
    customerGroup: [],
    category: [],
    state: [],
    city: [],
  });



  useEffect(() => {
    getRcStatus();
    loadSummery();
  }, [navigation])

  const getRcStatus = async () => {
    const response = await getRCStatus();
    console.log(response?.allStatus, 6788798)

    //   {
    //     Active: 20,
    //       Draft: 10,
    //         'Expired RC': 5,
    //           'Inactive RC': 3,
    //             'Pending Approval': 8,
    //               Approved: 15,
    //                 Rejected: 2,
    //                   Cancelled: 1,
    //                     Reassigned: 4,
    //                       'Expiring Soon': 5,
    // };
  }
  const loadSummery = async () => {
    console.log(347865387)
    const response = await getPriceSummary();
    if (response?.rcSummary) {
      setRateContracts(response?.rcSummary);
    }
  }
  // Mock data for rate contracts
  const [rateContracts, setRateContracts] = useState([]);

  const [statusCounts, setStatusCounts] = useState();

  const tabs = ['All', 'Draft', 'Pending Approval', 'Expiring Soon', 'Expired RC', 'Reassigned'];


  const renderStatusBadge = (status) => {
    const statusBackgroundColors = {
      ACTIVE: '#E8F4EF',
      DRAFT: '#F7F1E8',
      'EXPIRED RC': '#FBEAEA',
      EXPIRED: '#FBEAEA',
      'INACTIVE RC': '#F7F9F9',
      INACTIVE: '#F7F9F9',
      'PENDING APPROVAL': '#FEF7ED',
      PENDING: colors.primaryLight,
      APPROVED: '#E8F4EF',
      REJECTED: '#FBEAEA',
      CANCELLED: colors.textSecondary,
      REASSIGNED: '#FEF7ED',
      'EXPIRING SOON': '#F4F4F4',
    };

    const statusTextColors = {
      ACTIVE: '#169560',
      DRAFT: '#AE7017',
      'EXPIRED RC': colors.error,
      EXPIRED: colors.error,
      'INACTIVE RC': colors.gray,
      INACTIVE: colors.gray,
      'PENDING APPROVAL': '#F4AD48',
      PENDING: colors.primaryLight,
      APPROVED: '#169560',
      REJECTED: colors.error,
      CANCELLED: colors.textSecondary,
      REASSIGNED: '#F4AD48',
      'EXPIRING SOON': '#959491',
    };

    return (
      <View style={[styles.statusBadge, { backgroundColor: statusBackgroundColors[status] || colors.gray }]}>
        <AppText style={[styles.statusText, { color: statusTextColors[status] }]}>{status.replace('_', ' ')}</AppText>
      </View>
    );
  };



  // ✅ Modal for order creation
  const renderCreateOrderModal = () => (
    <Modal
      visible={showGroupupdate}
      transparent
      animationType="slide"
      onRequestClose={() => setShowGroupupdate(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowGroupupdate(false)}
      >
        <View style={styles.createOrderModalContent}>
          <View style={styles.modalHeader}>
            <AppText style={styles.modalTitle}>Group Update</AppText>
            <TouchableOpacity onPress={() => setShowGroupupdate(false)}>
              <CloseIcon />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.orderTypeOption}
          // onPress={() => handleCreateOrder('manual')}
          >
            <AddProduct />
            <AppText style={styles.orderTypeText}>Add New Product</AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.orderTypeOption}
          // onPress={() => handleCreateOrder('upload')}
          >
            <ProductSwapping />

            <AppText style={styles.orderTypeText}>Product Swapping</AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.orderTypeOption}
          // onPress={() => handleCreateOrder('upload')}
          >
            <UpdateDiscount />

            <AppText style={styles.orderTypeText}>Update Discount</AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.orderTypeOption}
          // onPress={() => handleCreateOrder('upload')}
          >
            <UpdateSupplyMode />

            <AppText style={styles.orderTypeText}>Update Supply Mode</AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.orderTypeOption}
          // onPress={() => handleCreateOrder('upload')}
          >
            <QuotationGeneration />

            <AppText style={styles.orderTypeText}>Quotation Generation</AppText>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );









  const renderFilterModal = () => (
    <Modal
      visible={filterVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setFilterVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <AppText style={styles.modalTitle}>Filters</AppText>
            <TouchableOpacity onPress={() => setFilterVisible(false)}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterScroll}>
            <View style={styles.filterSection}>
              <AppText style={styles.filterSectionTitle}>Status</AppText>
              {selectedFilters.status.map((status) => (
                <TouchableOpacity key={status} style={styles.filterOption}>
                  <Icon name="check-box" size={24} color={colors.primary} />
                  <AppText style={styles.filterOptionText}>{status}</AppText>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.filterSection}>
              <AppText style={styles.filterSectionTitle}>Customer Group</AppText>
              <AppInput
                style={styles.filterInput}
                placeholder="Enter customer group"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.filterSection}>
              <AppText style={styles.filterSectionTitle}>Category</AppText>
              <AppInput
                style={styles.filterInput}
                placeholder="Enter category"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.filterSection}>
              <AppText style={styles.filterSectionTitle}>State</AppText>
              <AppInput
                style={styles.filterInput}
                placeholder="Enter state"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.filterSection}>
              <AppText style={styles.filterSectionTitle}>City</AppText>
              <AppInput
                style={styles.filterInput}
                placeholder="Enter city"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.clearButton}>
              <AppText style={styles.clearButtonText}>Clear filter</AppText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton}>
              <AppText style={styles.applyButtonText}>Apply filter</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderRateContract = ({ item }) => (
    <View style={styles.contractCard}>
      <TouchableOpacity
        style={styles.contractHeader}
        onPress={() => navigation.navigate('RateContractDetail', { contract: item })}
      >
        <View style={styles.contractIdContainer}>
          <AppText style={styles.contractId}>{item.id} <ChevronRight color={colors.primary} height={11} /></AppText>
        </View>
        <View style={styles.contractBadges}>
          {item.rfqDate && (
            <View style={styles.dateBadge}>
              <AppText style={styles.dateBadgeText}>RFQ</AppText>
            </View>
          )}
          {item.vqDate && (
            <View style={styles.dateBadge}>
              <AppText style={styles.dateBadgeText}>VQ</AppText>
            </View>
          )}
          <AppText style={styles.dateText}>
            {item.rfqDate || item.vqDate}
          </AppText>
          {item.isMultiple && (
            <View style={styles.countBadge}>
              <AppText style={styles.countText}>{item.count} <ArrowDown color={colors.primary} width={8} /></AppText>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.contractBody}>
        <AppText style={styles.customerName}>{item.customer}</AppText>
        <View style={styles.contractInfo}>
          <AddrLine />
          <AppText style={styles.infoText}>
            {item.code} | {item.location} | Product Count: {item.productCount}
          </AppText>
        </View>

        <View style={styles.distributorStockistRow}>
          <TouchableOpacity style={styles.distributorInfo}>
            <Business />
            <AppText style={{ ...styles.infoText, color: '#202020' }}>Configure Distribution <ChevronRight height={8} /></AppText>
          </TouchableOpacity>

          <View style={styles.stockistInfo}>
            <AppText style={styles.stockistText}>Stockist:<AppText style={{ color: '#202020', fontSize: 14, fontWeight: 'bold' }}>{item.stockist}</AppText></AppText>
            <EyeOpen color={colors.primary} width={16} />
          </View>
        </View>
      </View>

      <View style={styles.contractFooter}>
        {renderStatusBadge(item.status)}
        {item.status === 'DRAFT' ? (
          <TouchableOpacity style={styles.createButton}>
            <AddCircle />
            <AppText style={styles.createButtonText}>Create</AppText>
            <ChevronRight height={11} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.suspendButton}>
            <PauseCircle />
            <AppText style={styles.suspendButtonText}>Suspend</AppText>
            <ChevronRight height={11} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Menu />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>Pricing</AppText>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.groupUpdateButton} onPress={() => setShowGroupupdate(true)}>
            <AppText style={styles.groupUpdateText}>GROUP UPDATE</AppText>
            <ArrowDown color={colors.primary} width={10} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Bell />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.statCard}>
              <AppText style={styles.statLabel}>Active</AppText>
              <AppText style={[styles.statValue, { color: colors.success }]}>
                {statusCounts?.Active}
              </AppText>
            </View>
            <View style={styles.statCard}>
              <AppText style={styles.statLabel}>Draft</AppText>
              <AppText style={[styles.statValue, { color: colors.primary }]}>
                {statusCounts?.Draft}
              </AppText>
            </View>
            <View style={styles.statCard}>
              <AppText style={styles.statLabel}>Expired RC</AppText>
              <AppText style={[styles.statValue, { color: colors.error }]}>
                {/* {statusCounts['Expired RC']} */}
              </AppText>
            </View>
            <View style={styles.statCard}>
              <AppText style={styles.statLabel}>Inactive RC</AppText>
              <AppText style={[styles.statValue, { color: colors.gray }]}>
                {/* {statusCounts['Inactive RC']} */}
              </AppText>
            </View>
            <View style={styles.statCard}>
              <AppText style={styles.statLabel}>Pending Approval</AppText>
              <AppText style={[styles.statValue, { color: colors.primaryLight }]}>
                {/* {statusCounts['Pending Approval']} */}
              </AppText>
            </View>
            <View style={styles.statCard}>
              <AppText style={styles.statLabel}>Approved</AppText>
              <AppText style={[styles.statValue, { color: colors.success }]}>
                {statusCounts?.Approved}
              </AppText>
            </View>
            <View style={styles.statCard}>
              <AppText style={styles.statLabel}>Rejected</AppText>
              <AppText style={[styles.statValue, { color: colors.error }]}>
                {statusCounts?.Rejected}
              </AppText>
            </View>
            <View style={styles.statCard}>
              <AppText style={styles.statLabel}>Cancelled</AppText>
              <AppText style={[styles.statValue, { color: colors.textSecondary }]}>
                {statusCounts?.Cancelled}
              </AppText>
            </View>
            <View style={styles.statCard}>
              <AppText style={styles.statLabel}>Reassigned</AppText>
              <AppText style={[styles.statValue, { color: colors.primaryLight }]}>
                {statusCounts?.Reassigned}
              </AppText>
            </View>
            <View style={styles.statCard}>
              <AppText style={styles.statLabel}>Expiring Soon</AppText>
              <AppText style={[styles.statValue, { color: colors.primary }]}>
                {/* {statusCounts['Expiring Soon']} */}
              </AppText>
            </View>
          </ScrollView>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
          {tabs.map(tab => (
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

        <View style={styles.filterContainer}>
          <TouchableOpacity style={styles.filterButton}>
            <AppText style={styles.filterButtonText}>New Pricing(30)</AppText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterButton, styles.activeFilterButton]}>
            <AppText style={styles.activeFilterButtonText}>Multiple RC Found(50)</AppText>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search color="#999" />
            <AppInput
              style={styles.searchInput}
              placeholder="Search RC, customer name/code..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#999"
            />
          </View>
          <TouchableOpacity
            style={styles.searchFilterButton}
            onPress={() => setFilterVisible(true)}
          >
            <Filter color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.searchFilterButton}>
            <Calendar />
          </TouchableOpacity>
        </View>

        <FlatList
          data={rateContracts}
          renderItem={renderRateContract}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          scrollEnabled={false}
        />
      </ScrollView>

      {renderFilterModal()}
      {renderCreateOrderModal()}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginRight: 'auto',
    marginLeft: 10
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  groupUpdateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  groupUpdateText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginRight: 8
  },
  content: {
    flex: 1,
    padding: 15,
    backgroundColor: '#F6F6F6'
  },
  statsContainer: {
    margin: -15,
    marginBottom: 0,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: colors.white,
  },
  statCard: {
    alignItems: 'start',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#EDEDED',
    borderRadius: 12,
    backgroundColor: colors.white,
    minWidth: 100,
  },
  statLabel: {
    fontSize: 14,
    color: '#202020',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 4,
  },
  tabContainer: {
    margin: -15,
    marginTop: 0,
    marginBottom: 15,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 0,
    gap: 12,
    marginBottom: 15
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  activeFilterButtonText: {
    fontSize: 14,
    color: colors.white,
  },

  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333'
  },
  searchContainer: {
    flexDirection: 'row',
    paddingBottom: 0,
    marginBottom: 15,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    gap: 12,
  },
  searchFilterButton: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#fff'
  },
  listContent: {
    paddingBottom: 80,
  },
  contractCard: {
    backgroundColor: colors.white,
    marginBottom: 15,
    borderRadius: 12
  },
  contractHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contractIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contractId: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  contractBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dateBadgeText: {
    fontSize: 11,
    color: colors.white,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  countText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  contractBody: {
    padding: 16,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  contractInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 5
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  distributorStockistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  distributorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  stockistInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stockistText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  contractFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 15,
  },
  statusBadge: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2B2B2B',
  },
  createButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: 'bold'
  },
  suspendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2B2B2B',
  },
  suspendButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: 'bold'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  filterScroll: {
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 12,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  filterOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.text,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  createOrderModalContent: {
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
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  orderTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingLeft: 30
  },
  orderTypeText: { fontSize: 16, color: '#333', marginLeft: 20 },
});

export default RateContractList;