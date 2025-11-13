import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,  
  StatusBar,
  FlatList,
  ActivityIndicator,
  Switch
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../../styles/colors';
import { getDistributorCustomers, updateCustomerStatus } from '../../../api/distributor';
import { setCustomers, setLoading } from '../../../redux/slices/distributorSlice';
import ChevronLeft from '../../../components/icons/ChevronLeft';
import AppText from "../../../components/AppText"

const DistributorDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  
  const { distributor } = route.params;
  const { customers, loading } = useSelector(state => state.distributor || {});
  
  const [activeTab, setActiveTab] = useState('Details');
  const [selectAll, setSelectAll] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState([]);

  const tabs = ['Details', 'Linkaged'];
  const linkedTabs = ['Divisions', 'Field', 'Customer'];
  const [activeLinkedTab, setActiveLinkedTab] = useState('Customer');

  useEffect(() => {
    if (activeTab === 'Linkaged' && activeLinkedTab === 'Customer') {
      loadCustomers();
    }
  }, [activeTab, activeLinkedTab]);

  const loadCustomers = async () => {
    dispatch(setLoading(true));
    try {
      const data = await getDistributorCustomers(distributor.id);
      dispatch(setCustomers(data.customers || []));
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleCustomerSelect = (customerId) => {
    setSelectedCustomers(prev => {
      if (prev.includes(customerId)) {
        return prev.filter(id => id !== customerId);
      }
      return [...prev, customerId];
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map(c => c.customerId));
    }
    setSelectAll(!selectAll);
  };

  const handleBlockCustomer = async (customerId, currentStatus) => {
    try {
      const action = currentStatus === 'BLOCKED' ? 'unblock' : 'block';
      await updateCustomerStatus(customerId, distributor.id, action);
      // Refresh customers list
      loadCustomers();
    } catch (error) {
      console.error('Error updating customer status:', error);
    }
  };

  const handleBulkBlock = async () => {
    if (selectedCustomers.length === 0) return;
    
    try {
      // Block all selected customers
      for (const customerId of selectedCustomers) {
        await updateCustomerStatus(customerId, distributor.id, 'block');
      }
      setSelectedCustomers([]);
      setSelectAll(false);
      loadCustomers();
    } catch (error) {
      console.error('Error blocking customers:', error);
    }
  };

  const renderDetailsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.detailSection}>
        <AppText style={styles.sectionTitle}>Basic Information</AppText>
        
        <View style={styles.detailRow}>
          <AppText style={styles.detailLabel}>Name</AppText>
          <AppText style={styles.detailValue}>{distributor.name}</AppText>
        </View>
        
        <View style={styles.detailRow}>
          <AppText style={styles.detailLabel}>Code</AppText>
          <AppText style={styles.detailValue}>{distributor.code}</AppText>
        </View>
        
        <View style={styles.detailRow}>
          <AppText style={styles.detailLabel}>Type</AppText>
          <AppText style={styles.detailValue}>{distributor.distributorType}</AppText>
        </View>
        
        <View style={styles.detailRow}>
          <AppText style={styles.detailLabel}>Email</AppText>
          <AppText style={styles.detailValue}>{distributor.email}</AppText>
        </View>
        
        <View style={styles.detailRow}>
          <AppText style={styles.detailLabel}>Mobile</AppText>
          <AppText style={styles.detailValue}>{distributor.mobile1}</AppText>
        </View>
        
        {distributor.mobile2 && (
          <View style={styles.detailRow}>
            <AppText style={styles.detailLabel}>Alt Mobile</AppText>
            <AppText style={styles.detailValue}>{distributor.mobile2}</AppText>
          </View>
        )}
      </View>

      <View style={styles.detailSection}>
        <AppText style={styles.sectionTitle}>License Information</AppText>
        
        <View style={styles.detailRow}>
          <AppText style={styles.detailLabel}>License 20B No.</AppText>
          <AppText style={styles.detailValue}>{distributor.licence20BNo || 'N/A'}</AppText>
        </View>
        
        <View style={styles.detailRow}>
          <AppText style={styles.detailLabel}>License 21B No.</AppText>
          <AppText style={styles.detailValue}>{distributor.licence21BNo || 'N/A'}</AppText>
        </View>
        
        <View style={styles.detailRow}>
          <AppText style={styles.detailLabel}>GST Number</AppText>
          <AppText style={styles.detailValue}>{distributor.gstNumber || 'N/A'}</AppText>
        </View>
        
        <View style={styles.detailRow}>
          <AppText style={styles.detailLabel}>PAN Number</AppText>
          <AppText style={styles.detailValue}>{distributor.panNumber || 'N/A'}</AppText>
        </View>
      </View>

      <View style={styles.detailSection}>
        <AppText style={styles.sectionTitle}>Supply Margin</AppText>
        
        <View style={styles.detailRow}>
          <AppText style={styles.detailLabel}>Doctor Supply Margin</AppText>
          <AppText style={styles.detailValue}>{distributor.doctorSupplyMargin}%</AppText>
        </View>
        
        <View style={styles.detailRow}>
          <AppText style={styles.detailLabel}>Hospital Supply Margin</AppText>
          <AppText style={styles.detailValue}>{distributor.hospitalSupplyMargin}%</AppText>
        </View>
      </View>
    </ScrollView>
  );

  const renderFieldTab = () => {
    // Static field data as per requirement
    const fieldData = [
      { name: 'Abhishek Suryawanshi', code: 'SUN12345', designation: 'Customer executive' },
      { name: 'Akshay Pawar', code: 'SUN12345', designation: 'NSM' },
      { name: 'Sachin Patil', code: 'SUN12345', designation: 'Filed officer' },
      { name: 'Rushikesh Mahajan', code: 'SUN12345', designation: 'ZSM' },
      { name: 'Akshay Amanakar', code: 'SUN12345', designation: 'ASM' },
      { name: 'Omkar Ankam', code: 'SUN12345', designation: 'Filed officer' },
      { name: 'Vrushal Shinde', code: 'SUN12345', designation: 'Customer executive' },
    ];

    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.fieldHeader}>
          <AppText style={styles.fieldHeaderText}>Employee Name & Code</AppText>
          <AppText style={styles.fieldHeaderText}>Designation</AppText>
        </View>
        
        {fieldData.map((item, index) => (
          <View key={index} style={styles.fieldRow}>
            <View style={styles.fieldNameSection}>
              <AppText style={styles.fieldName}>{item.name}</AppText>
              <AppText style={styles.fieldCode}>{item.code}</AppText>
            </View>
            <AppText style={styles.fieldDesignation}>{item.designation}</AppText>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderDivisionsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.divisionHeader}>
        <AppText style={styles.divisionHeaderText}>Division Name</AppText>
        <AppText style={styles.divisionHeaderText}>Code</AppText>
      </View>
      
      {distributor.divisions?.map((division, index) => (
        <View key={index} style={styles.divisionRow}>
          <AppText style={styles.divisionName}>{division.divisionName}</AppText>
          <AppText style={styles.divisionCode}>{division.divisionCode}</AppText>
        </View>
      ))}
    </ScrollView>
  );

  const renderCustomerTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.customerHeader}>
        <TouchableOpacity 
          style={styles.selectAllRow}
          onPress={handleSelectAll}
        >
          <View style={[styles.checkbox, selectAll && styles.checkboxSelected]}>
            {selectAll && <Icon name="check" size={14} color="#fff" />}
          </View>
          <AppText style={styles.selectAllText}>Select all</AppText>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={customers}
          keyExtractor={item => item.customerId}
          renderItem={({ item }) => {
            const isSelected = selectedCustomers.includes(item.customerId);
            const isBlocked = item.statusName === 'BLOCKED';
            
            return (
              <View style={styles.customerCard}>
                <TouchableOpacity
                  style={styles.customerRow}
                  onPress={() => handleCustomerSelect(item.customerId)}
                >
                  <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Icon name="check" size={14} color="#fff" />}
                  </View>
                  
                  <View style={styles.customerInfo}>
                    <AppText style={styles.customerName}>{item.customerName}</AppText>
                    <AppText style={styles.customerDetails}>
                      {item.customerCode || item.customerId} | {item.customerType}
                    </AppText>
                  </View>
                </TouchableOpacity>

                {isBlocked && (
                  <View style={styles.blockedIndicator}>
                    <Icon name="lock" size={14} color={colors.error} />
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.blockButton, isBlocked && styles.unblockButton]}
                  onPress={() => handleBlockCustomer(item.customerId, item.statusName)}
                >
                  <Icon 
                    name={isBlocked ? "lock-open" : "lock"} 
                    size={16} 
                    color={isBlocked ? colors.success : '#666'} 
                  />
                  <AppText style={[styles.blockButtonText, isBlocked && styles.unblockButtonText]}>
                    {isBlocked ? 'Unblock' : 'Block'}
                  </AppText>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}

      {selectedCustomers.length > 0 && (
        <View style={styles.bulkActionBar}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => {
              setSelectedCustomers([]);
              setSelectAll(false);
            }}
          >
            <AppText style={styles.cancelButtonText}>Cancel</AppText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.bulkBlockButton}
            onPress={handleBulkBlock}
          >
            <AppText style={styles.bulkBlockButtonText}>Block</AppText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderLinkagedTab = () => (
    <>
      <View style={styles.linkedTabsContainer}>
        {linkedTabs.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.linkedTab, activeLinkedTab === tab && styles.activeLinkedTab]}
            onPress={() => setActiveLinkedTab(tab)}
          >
            <Icon 
              name={tab === 'Divisions' ? 'dashboard' : tab === 'Field' ? 'people' : 'groups'} 
              size={18} 
              color={activeLinkedTab === tab ? colors.primary : '#666'} 
            />
            <AppText style={[styles.linkedTabText, activeLinkedTab === tab && styles.activeLinkedTabText]}>
              {tab}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>
      
      {activeLinkedTab === 'Customer' && renderCustomerTab()}
      {activeLinkedTab === 'Field' && renderFieldTab()}
      {activeLinkedTab === 'Divisions' && renderDivisionsTab()}
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>{distributor.name}</AppText>
        {activeTab === 'Linkaged' && activeLinkedTab === 'Customer' && selectedCustomers.length > 0 && (
          <View style={styles.selectedCount}>
            <AppText style={styles.selectedCountText}>{selectedCustomers.length}</AppText>
          </View>
        )}
      </View>

      <View style={styles.statusBar}>
        <View style={styles.statusBadge}>
          <Icon name="check-circle" size={16} color={colors.success} />
          <AppText style={styles.statusText}>Accepted</AppText>
        </View>
        <View style={styles.blockStatusBadge}>
          <AppText style={styles.blockStatusText}>UNBLOCKED</AppText>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <View style={styles.mainTabs}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Icon 
                name={tab === 'Details' ? 'description' : 'link'} 
                size={18} 
                color={activeTab === tab ? colors.primary : '#666'} 
              />
              <AppText style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
        <View style={[styles.tabIndicator, { left: activeTab === 'Details' ? '0%' : '50%' }]} />
      </View>

      {activeTab === 'Details' ? renderDetailsTab() : renderLinkagedTab()}
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
    paddingTop: 12,   
    paddingBottom: 0
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  selectedCount: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  selectedCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '500',
  },
  blockStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
  },
  blockStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  tabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 1,
  },
  mainTabs: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
  },
  activeTab: {
    // Active tab styles handled by text color
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '500',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '50%',
    height: 3,
    backgroundColor: colors.primary,
  },
  linkedTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',    
    padding: 16,
    gap: 16,
  },
  linkedTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  activeLinkedTab: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '10',
  },
  linkedTabText: {
    fontSize: 14,
    color: '#666',
  },
  activeLinkedTabText: {
    color: colors.primary,
    fontWeight: '500',
  },
  tabContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  detailSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
  },
  fieldHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  fieldNameSection: {
    flex: 1,
  },
  fieldName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  fieldCode: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  fieldDesignation: {
    fontSize: 14,
    color: '#666',
  },
  divisionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
  },
  divisionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  divisionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  divisionName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  divisionCode: {
    fontSize: 14,
    color: '#666',
  },
  customerHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectAllText: {
    fontSize: 14,
    color: '#333',
  },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  customerDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  blockedIndicator: {
    marginRight: 8,
  },
  blockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  unblockButton: {
    borderColor: colors.success,
    backgroundColor: colors.success + '10',
  },
  blockButtonText: {
    fontSize: 12,
    color: '#666',
  },
  unblockButtonText: {
    color: colors.success,
  },
  bulkActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  bulkBlockButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    marginLeft: 8,
  },
  bulkBlockButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default DistributorDetail;