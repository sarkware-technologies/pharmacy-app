import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../../styles/colors';
import { getOrders } from '../../../api/orders';
import { setOrders, setLoading } from '../../../redux/slices/orderSlice';
import Menu from '../../../components/icons/Menu';
import AddrLine from '../../../components/icons/AddrLine';
import Filter from '../../../components/icons/Filter';
import Calendar from '../../../components/icons/Calendar';
import FilterModal from '../../../components/FilterModal';

const OrderList = () => {

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { orders = [], loading = false } = useSelector(state => state.orders || {});
  
  const [activeTab, setActiveTab] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);  
  
  const tabs = ['All', 'Waiting for Confirmation', 'Hold', 'Track PO'];

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  const loadOrders = async () => {
    dispatch(setLoading(true));
    try {
      const data = await getOrders(activeTab);
      dispatch(setOrders(data));
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleCreateOrder = (type) => {
    setShowCreateOrderModal(false);
    if (type === 'manual') {
      navigation.navigate('SelectDistributor');
    } else {
      navigation.navigate('UploadOrder');
    }
  };

  const filteredOrders = orders.filter(order => {
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      return order.customerName.toLowerCase().includes(searchLower) ||
             order.id.toLowerCase().includes(searchLower) ||
             order.customerId.includes(searchText);
    }
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return { bg: '#FEF7ED', text: '#F4AD48' };
      case 'APPROVED':
        return { bg: '#E8F4EF', text: '#169560' };
      default:
        return { bg: '#F4F4F4', text: '#666' };
    }
  };

  const handleApplyFilters = (filters) => {

  };

  const renderOrder = ({ item }) => {
    const statusColors = getStatusColor(item.status);
    
    return (
      <TouchableOpacity style={styles.orderCard} activeOpacity={0.7}>
        <View style={styles.orderHeader}>
          <View style={styles.orderIdRow}>
            <Text style={styles.orderId}>{item.id}</Text>
            <Icon name="chevron-right" size={20} color={colors.primary} />
          </View>
          <Text style={styles.orderAmount}>₹ {item.totalAmount.toFixed(2)}</Text>
        </View>
        
        <View style={styles.orderMeta}>
          <Text style={styles.orderDate}>{item.date} {item.time} | {item.rateType}</Text>
          <Text style={styles.skuCount}>SKU : <Text style={{color: '#222'}}>{item.skuCount}</Text></Text>
        </View>

        <View style={styles.customerSection}>
          <View style={styles.customerInfo}>
            {/*<View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>AA</Text>
            </View> */}
            <View style={styles.customerDetails}>
              <Text style={styles.customerName}>{item.customerName}</Text>
              <View style={styles.customerMeta}>
                <AddrLine />
                <Text style={styles.customerMetaText}>
                  {item.customerId} | {item.location} | Div: {item.division}
                </Text>
                {item.additionalCount > 0 && (
                  <Text style={styles.additionalCount}>+{item.additionalCount}</Text>
                )}
              </View>
              <Text style={styles.pendingAction}>
                Pending Action by: <Text style={{ color: '#222' }}>{item.pendingActionBy.name}</Text> ({item.pendingActionBy.phone} | {item.pendingActionBy.role})
              </Text>
            </View>
            <TouchableOpacity>
              <Icon name="download" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.orderFooter}>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusText, { color: statusColors.text }]}>{item.status}</Text>
          </View>
          {item.status === 'SUBMITTED' && (
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.confirmButton}>
                <Icon name="check" size={16} color="#fff" />
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton}>
                <Icon name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderCreateOrderModal = () => (
    <Modal
      visible={showCreateOrderModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCreateOrderModal(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowCreateOrderModal(false)}
      >
        <View style={styles.createOrderModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Order</Text>
            <TouchableOpacity onPress={() => setShowCreateOrderModal(false)}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.orderTypeOption}
            onPress={() => handleCreateOrder('manual')}
          >
            <Icon name="search" size={24} color="#666" />
            <Text style={styles.orderTypeText}>Manual Order</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.orderTypeOption}
            onPress={() => handleCreateOrder('upload')}
          >
            <Icon name="upload" size={24} color="#666" />
            <Text style={styles.orderTypeText}>Upload Order</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      <View style={{backgroundColor: '#F6F6F6'}}>

      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>          
          <Menu />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Orders</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.createOrderButton}
            onPress={() => setShowCreateOrderModal(true)}
          >
            <Text style={styles.createOrderText}>CREATE ORDER</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cartButton}>
            <Icon name="shopping-cart" size={18} color="#fff" />
            <Icon name="arrow-drop-down" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabContainer}
      >
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search customer name/code..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Filter />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Calendar />
        </TouchableOpacity>
      </View>

      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrder}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}      

      {renderCreateOrderModal()}

      </View>

      <FilterModal 
          visible={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          onApply={handleApplyFilters}
        />

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
    marginLeft: 16,
  },
  headerRight: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  createOrderButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  createOrderText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tabContainer: {
    backgroundColor: '#fff',
    maxHeight: 64,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '500',
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  orderAmount: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  orderMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
  },
  skuCount: {
    fontSize: 12,
    color: '#666',
  },
  customerSection: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  customerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  customerMetaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  additionalCount: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  pendingAction: {
    fontSize: 12,
    color: '#666',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  orderTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  orderTypeText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
  },
});

export default OrderList;