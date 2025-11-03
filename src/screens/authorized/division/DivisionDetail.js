import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,  
  StatusBar,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../../styles/colors';
import {
  getDivisionProducts,
  getDistributorsByDivision,
  getCustomersByDivision,
  getFieldEmployees
} from '../../../api/division';
import {
  setDivisionProducts,
  setDivisionDistributors,
  setDivisionCustomers,
  setDivisionFieldEmployees,
  setProductsLoading,
  setDistributorsLoading,
  setCustomersLoading,
  setFieldsLoading,
  setActiveTab,
  clearDivisionData,
  setProductsPagination,
  setCustomersPagination
} from '../../../redux/slices/divisionSlice';
import ChevronLeft from '../../../components/icons/ChevronLeft';
import Details from '../../../components/icons/Details';
import Linkage from '../../../components/icons/Linkage';

const DivisionDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const division = route.params?.division;
  
  const {
    divisionProducts,
    divisionDistributors,
    divisionCustomers,
    divisionFieldEmployees,
    productsLoading,
    distributorsLoading,
    customersLoading,
    fieldsLoading,
    activeTab,
    productsPagination,
    customersPagination
  } = useSelector(state => state.division);

  const [activeLinkagedTab, setActiveLinkagedTab] = useState('Distributors');
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMoreProducts, setLoadingMoreProducts] = useState(false);
  const [loadingMoreCustomers, setLoadingMoreCustomers] = useState(false);

  useEffect(() => {
    if (division) {
      loadInitialData();
    }
    return () => {
      dispatch(clearDivisionData());
    };
  }, [division]);

  const loadInitialData = async () => {
    if (activeTab === 'Details') {
      loadProducts(1);
    } else {
      loadLinkagedData();
    }
  };

  const loadProducts = async (page = 1) => {
    dispatch(setProductsLoading(true));
    try {
      const data = await getDivisionProducts(division.divisionId, page, 10);
      if (page === 1) {
        dispatch(setDivisionProducts(data.products || []));
      } else {
        dispatch(setDivisionProducts([...divisionProducts, ...(data.products || [])]));
      }
      dispatch(setProductsPagination({
        page: data.page || page,
        limit: data.limit || 10,
        total: data.total || 0
      }));
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      dispatch(setProductsLoading(false));
      setLoadingMoreProducts(false);
    }
  };

  const loadLinkagedData = async () => {
    if (activeLinkagedTab === 'Distributors') {
      loadDistributors();
    } else if (activeLinkagedTab === 'Customer') {
      loadCustomers(1);
    } else if (activeLinkagedTab === 'Field') {
      loadFieldEmployees();
    }
  };

  const loadDistributors = async () => {
    dispatch(setDistributorsLoading(true));
    try {
      const data = await getDistributorsByDivision(division.divisionId);
      dispatch(setDivisionDistributors(Array.isArray(data) ? data : []));
    } catch (error) {
      console.error('Error loading distributors:', error);
    } finally {
      dispatch(setDistributorsLoading(false));
    }
  };

  const loadCustomers = async (page = 1) => {
    dispatch(setCustomersLoading(true));
    try {
      const data = await getCustomersByDivision(parseInt(division.divisionId), page, 10);
      if (page === 1) {
        dispatch(setDivisionCustomers(data.customers || []));
      } else {
        dispatch(setDivisionCustomers([...divisionCustomers, ...(data.customers || [])]));
      }
      dispatch(setCustomersPagination({
        page: data.page || page,
        limit: data.limit || 10,
        total: data.total || 0
      }));
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      dispatch(setCustomersLoading(false));
      setLoadingMoreCustomers(false);
    }
  };

  const loadFieldEmployees = async () => {
    dispatch(setFieldsLoading(true));
    try {
      const data = await getFieldEmployees(division.divisionId);
      dispatch(setDivisionFieldEmployees(data || []));
    } catch (error) {
      console.error('Error loading field employees:', error);
    } finally {
      dispatch(setFieldsLoading(false));
    }
  };

  const handleTabChange = (tab) => {
    dispatch(setActiveTab(tab));
    if (tab === 'Details') {
      if (divisionProducts.length === 0) {
        loadProducts(1);
      }
    } else {
      if (activeLinkagedTab === 'Distributors' && divisionDistributors.length === 0) {
        loadDistributors();
      } else if (activeLinkagedTab === 'Customer' && divisionCustomers.length === 0) {
        loadCustomers(1);
      } else if (activeLinkagedTab === 'Field' && divisionFieldEmployees.length === 0) {
        loadFieldEmployees();
      }
    }
  };

  const handleLinkagedTabChange = (tab) => {
    setActiveLinkagedTab(tab);
    if (tab === 'Distributors' && divisionDistributors.length === 0) {
      loadDistributors();
    } else if (tab === 'Customer' && divisionCustomers.length === 0) {
      loadCustomers(1);
    } else if (tab === 'Field' && divisionFieldEmployees.length === 0) {
      loadFieldEmployees();
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadInitialData().then(() => setRefreshing(false));
  };

  const handleLoadMoreProducts = () => {
    if (!loadingMoreProducts && divisionProducts.length < productsPagination.total) {
      setLoadingMoreProducts(true);
      loadProducts(productsPagination.page + 1);
    }
  };

  const handleLoadMoreCustomers = () => {
    if (!loadingMoreCustomers && divisionCustomers.length < customersPagination.total) {
      setLoadingMoreCustomers(true);
      loadCustomers(customersPagination.page + 1);
    }
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <View>
          <Text style={styles.productName}>{item.productName}</Text>
          <Text style={styles.productCode}>{item.productCode}</Text>
        </View>
        <View style={styles.marginInfo}>
          <Text style={styles.marginText}>{item.doctorMargin || 10}% | {item.hospitalMargin || 12}%</Text>
        </View>
      </View>
    </View>
  );

  const renderDistributorItem = ({ item }) => (
    <View style={styles.linkageCard}>
      <View style={styles.linkageHeader}>
        <Text style={styles.linkageName}>{item.name}</Text>
        <Text style={styles.linkageCode}>{item.cityName}</Text>
      </View>
      <View style={styles.linkageDetails}>
        <Text style={styles.linkageLocation}>
          {item.code}
        </Text>        
      </View>
    </View>
  );

  const renderCustomerItem = ({ item }) => (
    <View style={styles.linkageCard}>
      <View style={styles.linkageHeader}>
        <Text style={styles.linkageName}>{item.customerName}</Text>
        <Text style={styles.linkageCode}>{item.customerCategory}/</Text>
      </View>
      <View style={styles.linkageDetails}>
        <Text style={styles.linkageCategory}>{item.customerCode || item.customerId}</Text>
        <Text style={styles.linkageCode}>{item.customerSubcategory}</Text>
      </View>
    </View>
  );

  const renderFieldItem = ({ item }) => (
    <View style={styles.linkageCard}>
      <View style={styles.linkageHeader}>
        <View>
          <Text style={styles.linkageName}>{item.name}</Text>
          <Text style={styles.linkageCode}>{item.code}</Text>
        </View>
        <Text style={styles.designation}>{item.designation}</Text>
      </View>
    </View>
  );

  const renderDetailsTab = () => (
    <FlatList
      data={divisionProducts}
      renderItem={renderProductItem}
      keyExtractor={(item) => item.productId.toString()}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
        />
      }
      onEndReached={handleLoadMoreProducts}
      onEndReachedThreshold={0.3}
      ListEmptyComponent={() => (
        productsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        )
      )}
      ListFooterComponent={() => 
        loadingMoreProducts ? <ActivityIndicator size="small" color={colors.primary} /> : null
      }
    />
  );

  const renderLinkagedTab = () => (
    <View style={styles.linkagedContainer}>
      <View style={styles.linkagedTabs}>
        <TouchableOpacity
          style={[styles.linkagedTab, activeLinkagedTab === 'Distributors' && styles.activeLinkagedTab]}
          onPress={() => handleLinkagedTabChange('Distributors')}
        >
          <Icon name="business" size={18} color={activeLinkagedTab === 'Distributors' ? colors.primary : '#666'} />
          <Text style={[styles.linkagedTabText, activeLinkagedTab === 'Distributors' && styles.activeLinkagedTabText]}>
            Distributors
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.linkagedTab, activeLinkagedTab === 'Field' && styles.activeLinkagedTab]}
          onPress={() => handleLinkagedTabChange('Field')}
        >
          <Icon name="people" size={18} color={activeLinkagedTab === 'Field' ? colors.primary : '#666'} />
          <Text style={[styles.linkagedTabText, activeLinkagedTab === 'Field' && styles.activeLinkagedTabText]}>
            Field
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.linkagedTab, activeLinkagedTab === 'Customer' && styles.activeLinkagedTab]}
          onPress={() => handleLinkagedTabChange('Customer')}
        >
          <Icon name="store" size={18} color={activeLinkagedTab === 'Customer' ? colors.primary : '#666'} />
          <Text style={[styles.linkagedTabText, activeLinkagedTab === 'Customer' && styles.activeLinkagedTabText]}>
            Customer
          </Text>
        </TouchableOpacity>
      </View>

      {activeLinkagedTab === 'Distributors' && (
        <>
        <View style={styles.linkageTabItemHeader}>
          <Text style={{color: '#666'}}>Name</Text>
          <Text style={{color: '#666'}}>City</Text>
        </View>
        <FlatList
          data={divisionDistributors}
          renderItem={renderDistributorItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={() => (
            distributorsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No distributors found</Text>
              </View>
            )
          )}
        />
        </>        
      )}

      {activeLinkagedTab === 'Customer' && (
        <>
        <View style={styles.linkageTabItemHeader}>
          <Text style={{color: '#666'}}>Customer Details</Text>
          <Text style={{color: '#666'}}>Category/Subcategory</Text>
        </View>
        <FlatList
          data={divisionCustomers}
          renderItem={renderCustomerItem}
          keyExtractor={(item) => item.customerId.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
          onEndReached={handleLoadMoreCustomers}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={() => (
            customersLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No customers found</Text>
              </View>
            )
          )}
          ListFooterComponent={() => 
            loadingMoreCustomers ? <ActivityIndicator size="small" color={colors.primary} /> : null
          }
        />
        </>
      )}

      {activeLinkagedTab === 'Field' && (
         <>
        <View style={styles.linkageTabItemHeader}>
          <Text style={{color: '#666'}}>Employee Name & Code</Text>
          <Text style={{color: '#666'}}>Designation</Text>
        </View>
        <FlatList
          data={divisionFieldEmployees}
          renderItem={renderFieldItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={() => (
            fieldsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No field employees found</Text>
              </View>
            )
          )}
        />
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{division?.divisionName || 'Division'}</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Details' && styles.activeTab]}
          onPress={() => handleTabChange('Details')}
        >
          <Details color={activeTab === 'Details' ? colors.primary : '#999'} />
          <Text style={[styles.tabText, activeTab === 'Details' && styles.activeTabText]}>
            Details
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Linkaged' && styles.activeTab]}
          onPress={() => handleTabChange('Linkaged')}
        >
          <Linkage color={activeTab === 'Linkaged' ? colors.primary : '#999'} />
          <Text style={[styles.tabText, activeTab === 'Linkaged' && styles.activeTabText]}>
            Linkaged
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'Details' ? renderDetailsTab() : renderLinkagedTab()}
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: '#999',    
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '500',
  },
  listContent: {
    
  },
  productCard: {
    backgroundColor: '#fff',    
    paddingHorizontal: 16,    
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F6F6F6'
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 14,    
    color: '#222',
    marginBottom: 4,
  },
  productCode: {
    fontSize: 12,
    color: '#999',
  },
  marginInfo: {
    alignItems: 'flex-end',
  },
  marginText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  linkagedContainer: {
    flex: 1,
  },
  linkagedTabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  linkagedTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
    gap: 4,
  },
  activeLinkagedTab: {
    borderColor: colors.primary,
    backgroundColor: '#FFF5EC',
  },
  linkagedTabText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeLinkagedTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  linkageTabItemHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F6F6F6',
    flexDirection: 'row',
    justifyContent:'space-between',    
  },
  linkageCard: {
    backgroundColor: '#fff',    
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F6F6F6'
  },
  linkageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  linkageName: {
    fontSize: 14,    
    color: '#222',
  },
  linkageCode: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  linkageDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkageLocation: {
    fontSize: 12,
    color: '#666',
  },
  linkageCategory: {
    fontSize: 12,
    color: '#666',
  },
  designation: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default DivisionDetail;