import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../styles/colors';
import Filter from '../../../components/icons/Filter';

const RateContractDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { contract } = route.params || {};
  
  const [showPriceChangeModal, setShowPriceChangeModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showConfigureModal, setShowConfigureModal] = useState(false);
  const [activeTab, setActiveTab] = useState('preferred');
  const [distributors, setDistributors] = useState([
    {
      id: '10106555',
      name: 'Mahalaxmi Distributors',
      location: 'One city | Pune',
      spll: 'SPLL',
      division: 'All Divisions',
      margin: '15',
      supplyMode: 'Net Rate',
    },
    {
      id: '10106555',
      name: 'Tapadiya Distributors',
      location: 'One city | Pune',
      spll: 'SPLL',
      division: 'All Divisions',
      margin: '15',
      supplyMode: 'Net Rate',
    },
    {
      id: '10106555',
      name: 'Anand Medical Distributors',
      location: 'One city | Pune',
      spll: 'SPLL',
      division: 'All Divisions',
      margin: '15',
      supplyMode: 'Net Rate',
    },
  ]);

  // Contract details
  const contractDetails = {
    id: 'SUNRC_1',
    customer: 'Columbia Asia',
    location: 'Pune',
    status: 'DRAFT',
    rfqDate: 'RFQ',
  };

  // Products list
  const products = [
    {
      id: '005501350',
      name: 'BRUFFEN 100MG 1X10 TAB',
      pts: 70.20,
      ptr: 100.20,
      mrp: 120.20,
      specialPriceType: 'Discount on PTR',
      discount: 40,
      specialPrice: 60.20,
      moq: 'Qty',
      supplyMode: 'Net Rate',
    },
    {
      id: '005501350',
      name: 'BRUFFEN 100MG 1X10 TAB',
      pts: 70.20,
      ptr: 100.20,
      mrp: 120.20,
      specialPriceType: 'Discount on PTR',
      discount: 40,
      specialPrice: 60.20,
      moq: 'Qty',
      supplyMode: 'Net Rate',
    },
    {
      id: '005501350',
      name: 'BRUFFEN 100MG 1X10 TAB',
      pts: 70.20,
      ptr: 100.20,
      mrp: 120.20,
      specialPriceType: 'Discount on PTR',
      discount: 40,
      specialPrice: 60.20,
      moq: 'Qty',
      supplyMode: 'Net Rate',
    },
  ];

  const openPriceChangeModal = (product) => {
    setSelectedProduct(product);
    setShowPriceChangeModal(true);
  };

  const renderProduct = (product, index) => (
    <View key={index} style={styles.productCard}>
      <View style={styles.productHeader}>
        <Text style={styles.productName}>{product.name}</Text>
        <TouchableOpacity onPress={() => {}}>
          <Icon name="delete-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productCode}>
          {product.id} | PTS: ₹{product.pts} PTR: ₹{product.ptr} MRP: ₹{product.mrp}
        </Text>
      </View>

      <View style={styles.productInputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Special Price Type</Text>
          <TouchableOpacity style={styles.dropdown}>
            <Text style={styles.dropdownText}>{product.specialPriceType}</Text>
            <Icon name="arrow-drop-down" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroupSmall}>
          <Text style={styles.inputLabel}>Discount (%)</Text>
          <View style={styles.discountInput}>
            <TextInput
              style={styles.discountValue}
              value={product.discount.toString()}
              editable={false}
            />
            <Text style={styles.percentSign}>%</Text>
          </View>
        </View>
      </View>

      <View style={styles.productInputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Special Price</Text>
          <View style={styles.priceInputContainer}>
            <Text style={styles.rupeeSign}>₹</Text>
            <TextInput
              style={styles.priceInput}
              value={product.specialPrice.toString()}
              editable={false}
            />
          </View>
        </View>

        <View style={styles.inputGroupSmall}>
          <Text style={styles.inputLabel}>MOQ(Monthly)</Text>
          <TouchableOpacity style={styles.moqInput}>
            <Text style={styles.moqText}>{product.moq}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.supplyModeRow}>
        <TouchableOpacity style={styles.radioOption}>
          <View style={[styles.radio, product.supplyMode === 'Net Rate' && styles.radioSelected]}>
            {product.supplyMode === 'Net Rate' && <View style={styles.radioInner} />}
          </View>
          <Text style={styles.radioText}>Net Rate</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.radioOption}>
          <View style={[styles.radio, product.supplyMode === 'Chargeback' && styles.radioSelected]}>
            {product.supplyMode === 'Chargeback' && <View style={styles.radioInner} />}
          </View>
          <Text style={styles.radioText}>Chargeback</Text>
        </TouchableOpacity>
      </View>
      
    </View>
  );

  return (
    <>
    <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{contractDetails.id}</Text>
          <View style={styles.headerBadges}>
            <View style={[styles.badge, styles.draftBadge]}>
              <Text style={styles.badgeText}>DRAFT</Text>
            </View>
            <View style={[styles.badge, styles.rfqBadge]}>
              <Text style={styles.badgeText}>RFQ</Text>
            </View>
          </View>
        </View>


        <TouchableOpacity>
          <Icon name="download" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.topSection}>
          {/* Customer Info */}
          <View style={styles.customerSection}>
            <Text style={styles.sectionLabel}>Select Customer</Text>
            <TouchableOpacity style={styles.customerDropdown}>
              <Text style={styles.customerName}>{contractDetails.customer}</Text>
              <Icon name="arrow-drop-down" size={24} color={colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.copyLink}>
              <Icon name="content-copy" size={16} color={colors.primary} />
              <Text style={styles.copyLinkText}>Copy RC from another customer</Text>
            </TouchableOpacity>
          </View>

          {/* Linked Distributors */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Linked Distributors</Text>
            <View style={styles.distributorRow}>
              <View style={styles.distributorInfo}>
                <Text style={styles.distributorText}>4 Distributors</Text>
              </View>
              <TouchableOpacity style={styles.configureButton} onPress={() => setShowConfigureModal(true)}>
                <Icon name="settings" size={16} color={colors.text} />
                <Text style={styles.configureText}>Configure</Text>
                <Icon name="chevron-right" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Date Selection */}
          <View style={styles.dateSection}>
            <View style={styles.dateGroup}>
              <Text style={styles.sectionLabel}>Start Date</Text>
              <TouchableOpacity style={styles.dateInput}>
                <Text style={styles.dateText}>Select</Text>
                <Icon name="calendar-today" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.dateGroup}>
              <Text style={styles.sectionLabel}>End Date</Text>
              <TouchableOpacity style={styles.dateInput}>
                <Text style={styles.dateText}>Select</Text>
                <Icon name="calendar-today" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Supply Mode */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Supply Mode</Text>
            <View style={styles.supplyModeOptions}>
              <TouchableOpacity style={styles.radioOption}>
                <View style={[styles.radio, styles.radioSelected]}>
                  <View style={styles.radioInner} />
                </View>
                <Text style={styles.radioText}>Net Rate</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.radioOption}>
                <View style={styles.radio} />
                <Text style={styles.radioText}>Chargeback</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.radioOption}>
                <View style={styles.radio} />
                <Text style={styles.radioText}>Mixed</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* RC's Section */}
        <View style={styles.rcSection}>
          <Text style={styles.rcTitle}>RC's</Text>
          
          {/* Add Product Bar */}
          <TouchableOpacity style={styles.addProductBar}>
            <View style={styles.productTextWrapper}>
              <Text style={styles.addProductText}>Enter product code/name to add...</Text>
            </View>
            <View style={styles.addProductActions}>
              <TouchableOpacity style={styles.filterButton}>                
                <Filter />
              </TouchableOpacity>
              <TouchableOpacity style={styles.percentButton}>
                <Text style={styles.percentText}>%</Text>
                <Icon name="arrow-drop-down" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          {/* Product Cards */}
          {products.map((product, index) => renderProduct(product, index))}
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.lastSavedRow}>
          <Icon name="refresh" size={16} color={colors.textSecondary} />
          <Text style={styles.lastSavedText}>Last saved 05/04/2025</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>

      {/* Configure Supply Mode Modal */}
        <Modal
          visible={showConfigureModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowConfigureModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Configure Supply Mode</Text>
                <TouchableOpacity onPress={() => setShowConfigureModal(false)}>
                  <Icon name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Tab Navigation */}
              <View style={styles.tabContainer}>
                <TouchableOpacity 
                  style={[styles.tab, activeTab === 'preferred' && styles.activeTab]}
                  onPress={() => setActiveTab('preferred')}
                >
                  <Text style={[styles.tabText, activeTab === 'preferred' && styles.activeTabText]}>
                    Preferred Distributors
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.tab, activeTab === 'all' && styles.activeTab]}
                  onPress={() => setActiveTab('all')}
                >
                  <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
                    All Distributors
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Distributor List */}
              <ScrollView style={styles.distributorList}>
                {distributors.map((distributor, index) => (
                  <View key={index} style={styles.distributorCard}>
                    <View style={styles.distributorHeader}>
                      <Text style={styles.distributorName}>{distributor.name}</Text>
                      <Text style={styles.marginLabel}>Margin</Text>
                    </View>
                    <Text style={styles.distributorDetails}>{distributor.id} | {distributor.location}</Text>
                    
                    <View style={styles.distributorControls}>
                      <TouchableOpacity style={styles.dropdownButton}>
                        <Text style={styles.dropdownButtonText}>{distributor.spll}</Text>
                        <Icon name="arrow-drop-down" size={20} color={colors.text} />
                      </TouchableOpacity>
                      
                      <TouchableOpacity style={styles.dropdownButton}>
                        <Text style={styles.dropdownButtonText}>{distributor.division}</Text>
                        <Icon name="arrow-drop-down" size={20} color={colors.text} />
                      </TouchableOpacity>
                      
                      <View style={styles.marginInput}>
                        <TextInput
                          style={styles.marginInputText}
                          value={distributor.margin}
                          keyboardType="numeric"
                        />
                        <Text style={styles.percentSymbol}>%</Text>
                      </View>
                    </View>
                    
                    <View style={styles.supplyModeRowModal}>
                      <TouchableOpacity style={styles.radioOption}>
                        <View style={[styles.radio, distributor.supplyMode === 'Net Rate' && styles.radioSelected]}>
                          {distributor.supplyMode === 'Net Rate' && <View style={styles.radioInner} />}
                        </View>
                        <Text style={styles.radioText}>Net Rate</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity style={styles.radioOption}>
                        <View style={[styles.radio, distributor.supplyMode === 'Chargeback' && styles.radioSelected]}>
                          {distributor.supplyMode === 'Chargeback' && <View style={styles.radioInner} />}
                        </View>
                        <Text style={styles.radioText}>Chargeback</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>

              {/* Configure Button */}
              <TouchableOpacity 
                style={styles.modalSubmitButton}
                onPress={() => {
                  setShowConfigureModal(false);
                  Alert.alert('Success', 'Supply mode configured successfully');
                }}
              >
                <Text style={styles.modalSubmitButtonText}>Configure</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

    </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    paddingTop: 0,
    backgroundColor: '#F6F6F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: -15,
    marginBottom: 15    
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
  },
  draftBadge: {
    backgroundColor: '#FFF3E0',
  },
  rfqBadge: {
    backgroundColor: '#FFF3E0',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
  },
  topSection: {    
    marginBottom: 15,
    borderRadius: 12,
    backgroundColor: 'white',
    paddingBottom: 15,
    paddingHorizontal: 5
  },
  content: {
    flex: 1,    
  },
  customerSection: {
    padding: 16,    
  },
  section: {
    paddingHorizontal: 16,    
    paddingVertical: 5
  },
  sectionLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  customerDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8    
  },
  customerName: {
    fontSize: 15,
    color: colors.text,
  },
  copyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  copyLinkText: {
    fontSize: 13,
    color: colors.primary,
  },
  distributorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  distributorInfo: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  distributorText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  configureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  configureText: {
    fontSize: 14,
    color: colors.text,
  },
  dateSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,    
  },
  dateGroup: {
    flex: 1,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  supplyModeOptions: {
    flexDirection: 'row',
    gap: 24,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  radioText: {
    fontSize: 14,
    color: colors.text,
  },
  rcSection: {
    padding: 0    
  },
  rcTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  addProductBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',            
    marginBottom: 16,      
  },
  productTextWrapper: {        
    alignItems: 'center',            
    height: 46,    
    paddingHorizontal: 15,
    borderRadius: 12,    
    backgroundColor: 'white',
  },
  addProductText: {
    fontSize: 14,
    flexDirection: 'row',
    color: colors.textSecondary,    
    paddingVertical: 12
  },
  addProductActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterButton: {
    backgroundColor: 'white',
    padding: 12,
    height: 46,
    width: 46,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  percentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    rowGap : 2,
    backgroundColor: 'white',
    padding: 10,
    height: 46,
    width: 46,
    borderRadius: 10,
    justifyContent: 'center'
  },
  percentText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  productCard: {    
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: colors.white,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  productInfo: {
    marginBottom: 12,
  },
  productCode: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  productInputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inputGroup: {
    flex: 2,
  },
  inputGroupSmall: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  dropdownText: {
    fontSize: 13,
    color: colors.text,
  },
  discountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  discountValue: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    padding: 0,
  },
  percentSign: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  rupeeSign: {
    fontSize: 13,
    color: colors.textSecondary,
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    padding: 0,
  },
  moqInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  moqText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  supplyModeRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 4,
    marginBottom: 8,
  },
  lastSavedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,    
    justifyContent: 'center'
  },
  lastSavedText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  footer: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,    
    margin: -15,
    marginBottom: -40,
    marginTop: 5
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
   modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
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
  distributorList: {
    maxHeight: 400,
    paddingHorizontal: 20,
  },
  distributorCard: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  distributorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  distributorName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  marginLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  distributorDetails: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  distributorControls: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  dropdownButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  dropdownButtonText: {
    fontSize: 13,
    color: colors.text,
  },
  marginInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 80,
  },
  marginInputText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    textAlign: 'center',
    padding: 0,
  },
  supplyModeRowModal: {
    flexDirection: 'row',
    gap: 24,
  },
  modalSubmitButton: {
    backgroundColor: colors.primary,
    margin: 20,
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalSubmitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default RateContractDetail;