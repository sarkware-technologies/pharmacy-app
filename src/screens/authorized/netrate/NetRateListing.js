import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
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

const NetRateListing = () => {

  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [spilType, setSpilType] = useState('SPIL');
  const [overdueFilter, setOverdueFilter] = useState('Overdue');

  const tabs = ['All', 'Pending', 'Missed POD', 'Reassigned'];

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

  const renderInvoiceItem = ({ item }) => {
    const isDraft = item.status === 'DRAFT';
    const isProcessed = item.status === 'PROCESSED';

    return (
      <TouchableOpacity 
        style={styles.invoiceCard}
        onPress={() => handleInvoicePress(item)}
      >
        <View style={styles.invoiceHeader}>
          <View style={styles.invoiceIdContainer}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <AppText style={styles.invoiceId}>{item.id}</AppText>
              <Icon name="chevron-right" size={24} color="#FFA500" />
            </View>
            <AppText style={styles.dateText}>Invoice Date: {item.invoiceDate}</AppText>
          </View>
          <View style={styles.amountContainer}>
            <AppText style={styles.podLabel}>POD: ₹ {item.podAmount?.toLocaleString('en-IN')}</AppText>
            {item.dbtnNumber && (
              <AppText style={styles.dbtnText}>
                {item.dbtnNumber} ₹ {item.dbtnAmount?.toLocaleString('en-IN')}
              </AppText>
            )}
          </View>
        </View>
        
        <View style={styles.customerInfo}>
          <AppText style={styles.customerName}>{item.customerName}</AppText>
          {isDraft && (
            <TouchableOpacity>
              <Download />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.detailsRow}>
          <View style={styles.codeContainer}>
            <AddrLine />
            <AppText style={styles.codeText}>{item.customerCode}</AppText>
          </View>
          <AppText style={styles.separator}>|</AppText>
          <AppText style={styles.typeText}>{item.customerType}</AppText>
          <AppText style={styles.separator}>|</AppText>
          <AppText style={styles.orderText}>
            {item.orderCode} ({item.orderDate})
          </AppText>
        </View>
        
        <AppText style={styles.shortSupplyText}>
          Short Supply (SKU's) : {item.shortSupply}
        </AppText>
        
        <AppText style={styles.poText}>
          {item.poNumber} | POD submission number: {item.podSubmissionNumber}
        </AppText>
        
        <View style={styles.statusContainer}>
          {isDraft && (
            <>
              <View style={styles.draftBadge}>
                <AppText style={styles.draftText}>DRAFT</AppText>
              </View>
              <TouchableOpacity style={styles.uploadButton}>
                <Icon name="cloud-upload" size={20} color="white" />
                <AppText style={styles.uploadText}>Upload Documents</AppText>
              </TouchableOpacity>
            </>
          )}
          {isProcessed && (
            <>
              <View style={styles.processedBadge}>
                <AppText style={styles.processedText}>PROCESSED</AppText>
              </View>
              <TouchableOpacity style={styles.viewButton}>
                <Icon name="visibility" size={20} color="#FFA500" />
                <AppText style={styles.viewText}>View</AppText>
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'All':
        return (
          <FlatList
            data={mockInvoicesData}
            renderItem={renderInvoiceItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        );
      case 'Pending':
        return (
          <>
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
            <FlatList
              data={mockPendingInvoices}
              renderItem={renderInvoiceItem}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          </>
        );
      case 'Missed POD':
      case 'Reassigned':
        return (
          <View style={styles.emptyContainer}>
            <AppText style={styles.emptyText}>No {activeTab.toLowerCase()} available</AppText>
          </View>
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
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    justifyContent: 'center',
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
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default NetRateListing;