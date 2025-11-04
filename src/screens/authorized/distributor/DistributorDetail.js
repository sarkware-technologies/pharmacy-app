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
        <Text style={styles.sectionTitle}>Basic Information</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Name</Text>
          <Text style={styles.detailValue}>{distributor.name}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Code</Text>
          <Text style={styles.detailValue}>{distributor.code}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Type</Text>
          <Text style={styles.detailValue}>{distributor.distributorType}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Email</Text>
          <Text style={styles.detailValue}>{distributor.email}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Mobile</Text>
          <Text style={styles.detailValue}>{distributor.mobile1}</Text>
        </View>
        
        {distributor.mobile2 && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Alt Mobile</Text>
            <Text style={styles.detailValue}>{distributor.mobile2}</Text>
          </View>
        )}
      </View>

      <View style={styles.detailSection}>
        <Text style={styles.sectionTitle}>License Information</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>License 20B No.</Text>
          <Text style={styles.detailValue}>{distributor.licence20BNo || 'N/A'}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>License 21B No.</Text>
          <Text style={styles.detailValue}>{distributor.licence21BNo || 'N/A'}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>GST Number</Text>
          <Text style={styles.detailValue}>{distributor.gstNumber || 'N/A'}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>PAN Number</Text>
          <Text style={styles.detailValue}>{distributor.panNumber || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.detailSection}>
        <Text style={styles.sectionTitle}>Supply Margin</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Doctor Supply Margin</Text>
          <Text style={styles.detailValue}>{distributor.doctorSupplyMargin}%</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Hospital Supply Margin</Text>
          <Text style={styles.detailValue}>{distributor.hospitalSupplyMargin}%</Text>
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
          <Text style={styles.fieldHeaderText}>Employee Name & Code</Text>
          <Text style={styles.fieldHeaderText}>Designation</Text>
        </View>
        
        {fieldData.map((item, index) => (
          <View key={index} style={styles.fieldRow}>
            <View style={styles.fieldNameSection}>
              <Text style={styles.fieldName}>{item.name}</Text>
              <Text style={styles.fieldCode}>{item.code}</Text>
            </View>
            <Text style={styles.fieldDesignation}>{item.designation}</Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderDivisionsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.divisionHeader}>
        <Text style={styles.divisionHeaderText}>Division Name</Text>
        <Text style={styles.divisionHeaderText}>Code</Text>
      </View>
      
      {distributor.divisions?.map((division, index) => (
        <View key={index} style={styles.divisionRow}>
          <Text style={styles.divisionName}>{division.divisionName}</Text>
          <Text style={styles.divisionCode}>{division.divisionCode}</Text>
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
          <Text style={styles.selectAllText}>Select all</Text>
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
                    <Text style={styles.customerName}>{item.customerName}</Text>
                    <Text style={styles.customerDetails}>
                      {item.customerCode || item.customerId} | {item.customerType}
                    </Text>
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
                  <Text style={[styles.blockButtonText, isBlocked && styles.unblockButtonText]}>
                    {isBlocked ? 'Unblock' : 'Block'}
                  </Text>
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
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.bulkBlockButton}
            onPress={handleBulkBlock}
          >
            <Text style={styles.bulkBlockButtonText}>Block</Text>
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
            <Text style={[styles.linkedTabText, activeLinkedTab === tab && styles.activeLinkedTabText]}>
              {tab}
            </Text>
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
        <Text style={styles.headerTitle}>{distributor.name}</Text>
        {activeTab === 'Linkaged' && activeLinkedTab === 'Customer' && selectedCustomers.length > 0 && (
          <View style={styles.selectedCount}>
            <Text style={styles.selectedCountText}>{selectedCustomers.length}</Text>
          </View>
        )}
      </View>

      <View style={styles.statusBar}>
        <View style={styles.statusBadge}>
          <Icon name="check-circle" size={16} color={colors.success} />
          <Text style={styles.statusText}>Accepted</Text>
        </View>
        <View style={styles.blockStatusBadge}>
          <Text style={styles.blockStatusText}>UNBLOCKED</Text>
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
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
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