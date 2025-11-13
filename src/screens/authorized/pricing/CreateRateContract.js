import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../../../styles/colors';
import AppText from "../../../components/AppText"

const CreateRateContract = () => {
  const navigation = useNavigation();
  const [rcId, setRcId] = useState('SUNRC_1');
  const [status, setStatus] = useState('DRAFT');
  const [selectedCustomer, setSelectedCustomer] = useState('Columbia Asia');
  const [linkedDistributors, setLinkedDistributors] = useState(4);
  const [startDate, setStartDate] = useState(new Date('2025-04-01'));
  const [endDate, setEndDate] = useState(new Date('2026-03-31'));
  const [supplyMode, setSupplyMode] = useState('Net Rate');
  const [products, setProducts] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [showConfigureModal, setShowConfigureModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('start');
  const [searchProductText, setSearchProductText] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [showDiscountFilter, setShowDiscountFilter] = useState(false);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);

  const customers = [
    { id: '10106555', name: 'Columbia Asia', location: 'Pune' },
    { id: '10006565', name: 'Kokilaben Dhirubhai Hospital', location: 'Bengaluru' },
    { id: '10106555', name: 'Tata Memorial Hospital', location: 'Jaipur' },
  ];

  const mockProducts = [
    {
      id: '005501350',
      name: 'BRUFFEN 100MG 1X10 TAB',
      pts: 70.20,
      ptr: 100.20,
      mrp: 120.20,
      specialPriceType: 'Discount on PTR',
      discount: 40,
      specialPrice: 60.20,
      moq: 120,
    }
  ];

  const searchResults = [
    { id: '005501358', name: 'DOLO PROXYVON 75MG TAB' },
    { id: '005501358', name: 'DOLO 250 SUSPENSION' },
    { id: '005501358', name: 'DOLO PLUS TAB 1X10' },
    { id: '005501358', name: 'DOLO PROXYVON 500MG TAB' },
    { id: '005501358', name: 'DOLO 75MG TAB' },
    { id: '005501358', name: 'T DOLO 75MG TAB' },
    { id: '005501358', name: 'DOLO PLUS TAB 1X20' },
    { id: '005501358', name: 'DOLO PROXYVON 100MG TAB' },
  ];

  const distributors = [
    {
      id: '10106555',
      name: 'Mahalaxmi Distributors',
      location: 'One city | Pune',
      margin: 15,
      supplyMode: 'Net Rate',
      spll: 'SPLL',
      division: 'All Divisions',
    },
    {
      id: '10106555',
      name: 'Tapadiya Distributors',
      location: 'One city | Pune',
      margin: 15,
      supplyMode: 'Net Rate',
      spll: 'SPLL',
      division: 'All Divisions',
    },
    {
      id: '10106555',
      name: 'Anand Medical Distributors',
      location: 'One city | Pune',
      margin: 15,
      supplyMode: 'Net Rate',
      spll: 'SPLL',
      division: 'All Divisions',
    },
  ];

  const addProduct = () => {
    const newProduct = {
      ...mockProducts[0],
      id: Date.now().toString(),
    };
    setProducts([...products, newProduct]);
  };

  const removeProduct = (productId) => {
    setProducts(products.filter(p => p.id !== productId));
  };

  const handleSubmit = () => {
    setShowSubmitConfirmation(true);
  };

  const confirmSubmit = () => {
    setShowSubmitConfirmation(false);
    Alert.alert('Success', 'Rate Contract Submitted Successfully!', [
      {
        text: 'Go to Pricing',
        onPress: () => navigation.navigate('RateContractList'),
      },
    ]);
  };

  const renderCustomerDropdown = () => (
    <Modal
      visible={showCustomerDropdown}
      transparent
      animationType="fade"
      onRequestClose={() => setShowCustomerDropdown(false)}
    >
      <TouchableOpacity 
        style={styles.dropdownOverlay}
        activeOpacity={1}
        onPress={() => setShowCustomerDropdown(false)}
      >
        <View style={[styles.dropdownContainer, { top: 200 }]}>
          {customers.map((customer, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dropdownItem}
              onPress={() => {
                setSelectedCustomer(customer.name);
                setShowCustomerDropdown(false);
              }}
            >
              <AppText style={styles.dropdownItemText}>{customer.name}</AppText>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderCopyModal = () => (
    <Modal
      visible={showCopyModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowCopyModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCopyModal(false)}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <AppText style={styles.modalTitle}>Copy RC's From Existing Customer</AppText>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.modalBody}>
            <View style={styles.newCustomerInfo}>
              <AppText style={styles.sectionLabel}>New Customer</AppText>
              <AppText style={styles.customerName}>Columbia Asia</AppText>
              <AppText style={styles.customerDetails}>10106555 | Pune</AppText>
            </View>

            <View style={styles.filterRow}>
              <TouchableOpacity style={styles.filterChip}>
                <Icon name="filter-list" size={18} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterDropdown}>
                <AppText style={styles.filterText}>4 States</AppText>
                <Icon name="arrow-drop-down" size={20} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterDropdown}>
                <AppText style={styles.filterText}>55 Cities</AppText>
                <Icon name="arrow-drop-down" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
              <Icon name="search" size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by customer name/code"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.customerList}>
              <View style={styles.listHeader}>
                <AppText style={styles.listHeaderText}>Customer Details</AppText>
                <AppText style={styles.listHeaderText}>City</AppText>
              </View>
              
              {customers.map((customer, index) => (
                <TouchableOpacity key={index} style={styles.customerItem}>
                  <View>
                    <AppText style={styles.customerItemName}>{customer.name}</AppText>
                    <AppText style={styles.customerItemCode}>{customer.id}</AppText>
                  </View>
                  <AppText style={styles.customerItemCity}>{customer.location}</AppText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderConfigureModal = () => (
    <Modal
      visible={showConfigureModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowConfigureModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <AppText style={styles.modalTitle}>Configure Supply Mode</AppText>
            <TouchableOpacity onPress={() => setShowConfigureModal(false)}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity style={[styles.tab, styles.activeTab]}>
              <AppText style={styles.activeTabText}>Preferred Distributors</AppText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab}>
              <AppText style={styles.tabText}>All Distributors</AppText>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.distributorList}>
            {distributors.map((distributor, index) => (
              <View key={index} style={styles.distributorCard}>
                <View style={styles.distributorHeader}>
                  <AppText style={styles.distributorName}>{distributor.name}</AppText>
                  <AppText style={styles.marginLabel}>Margin</AppText>
                </View>
                <AppText style={styles.distributorDetails}>{distributor.id} | {distributor.location}</AppText>
                
                <View style={styles.distributorControls}>
                  <TouchableOpacity style={styles.dropdownButton}>
                    <AppText style={styles.dropdownButtonText}>{distributor.spll}</AppText>
                    <Icon name="arrow-drop-down" size={20} color={colors.text} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.dropdownButton}>
                    <AppText style={styles.dropdownButtonText}>{distributor.division}</AppText>
                    <Icon name="arrow-drop-down" size={20} color={colors.text} />
                  </TouchableOpacity>
                  
                  <View style={styles.marginInput}>
                    <TextInput
                      style={styles.marginInputText}
                      value={distributor.margin.toString()}
                      keyboardType="numeric"
                    />
                    <AppText style={styles.percentSymbol}>%</AppText>
                  </View>
                </View>
                
                <View style={styles.supplyModeRow}>
                  <TouchableOpacity style={styles.radioButton}>
                    <View style={[styles.radioOuter, distributor.supplyMode === 'Net Rate' && styles.radioActive]}>
                      {distributor.supplyMode === 'Net Rate' && <View style={styles.radioInner} />}
                    </View>
                    <AppText style={styles.radioText}>Net Rate</AppText>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.radioButton}>
                    <View style={styles.radioOuter}>
                      {distributor.supplyMode === 'Chargeback' && <View style={styles.radioInner} />}
                    </View>
                    <AppText style={styles.radioText}>Chargeback</AppText>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.configureButton} onPress={() => setShowConfigureModal(false)}>
            <AppText style={styles.configureButtonText}>Configure</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderProductSearch = () => (
    <Modal
      visible={showProductSearch}
      animationType="slide"
      transparent
      onRequestClose={() => setShowProductSearch(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <AppText style={styles.modalTitle}>Search & add product</AppText>
            <TouchableOpacity onPress={() => setShowProductSearch(false)}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.productSearchInput}
              placeholder="Type to search..."
              placeholderTextColor={colors.textSecondary}
              value={searchProductText}
              onChangeText={setSearchProductText}
              autoFocus
            />
            {searchProductText && (
              <TouchableOpacity onPress={() => setSearchProductText('')}>
                <Icon name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {searchProductText ? (
            <ScrollView style={styles.searchResults}>
              {searchResults.map((product, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.searchResultItem}
                  onPress={() => {
                    addProduct();
                    setShowProductSearch(false);
                    setSearchProductText('');
                  }}
                >
                  <View style={styles.searchResultInfo}>
                    <AppText style={styles.searchResultName}>{product.name}</AppText>
                    <AppText style={styles.searchResultCode}>{product.id}</AppText>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptySearchState}>
              <Icon name="search" size={48} color={colors.border} />
              <AppText style={styles.emptySearchText}>Searched results will display here</AppText>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  const renderDiscountFilter = () => (
    <Modal
      visible={showDiscountFilter}
      animationType="slide"
      transparent
      onRequestClose={() => setShowDiscountFilter(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContentSmall}>
          <View style={styles.modalHeader}>
            <AppText style={styles.modalTitle}>Discount %</AppText>
            <TouchableOpacity onPress={() => setShowDiscountFilter(false)}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.discountContent}>
            <TextInput
              style={styles.customDiscountInput}
              placeholder="Enter custom %"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />

            <View style={styles.discountOptions}>
              {[
                { range: '5%-10%', count: 100 },
                { range: '10%-15%', count: 50 },
                { range: '15%-20%', count: 10 },
                { range: '20%-25%', count: 25 },
                { range: '25%-30%', count: 10 },
                { range: 'More than 30%', count: 10, selected: true },
              ].map((option, index) => (
                <TouchableOpacity key={index} style={styles.discountOption}>
                  <View style={styles.checkbox}>
                    {option.selected && <Icon name="check" size={16} color={colors.primary} />}
                  </View>
                  <AppText style={styles.discountOptionText}>
                    {option.range} ({option.count})
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity 
            style={styles.applyButton}
            onPress={() => setShowDiscountFilter(false)}
          >
            <AppText style={styles.applyButtonText}>Apply</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderSubmitConfirmation = () => (
    <Modal
      visible={showSubmitConfirmation}
      animationType="slide"
      transparent
      onRequestClose={() => setShowSubmitConfirmation(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.confirmationModal}>
          <View style={styles.confirmationIcon}>
            <Icon name="error" size={48} color={colors.error} />
          </View>

          <AppText style={styles.confirmationTitle}>
            Are you sure you want{'\n'}to submit the Rate Contract?
          </AppText>

          <AppText style={styles.confirmationSubtitle}>
            Please review the below summary of{'\n'}created rate contract
          </AppText>

          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <AppText style={styles.summaryLabel}>No Change</AppText>
              <AppText style={styles.summaryValue}>300</AppText>
            </View>
            <View style={styles.summaryItem}>
              <AppText style={styles.summaryLabel}>Fixed Rate</AppText>
              <AppText style={styles.summaryValue}>20</AppText>
            </View>
            <View style={styles.summaryItem}>
              <AppText style={styles.summaryLabel}>Disc. On PTR</AppText>
              <AppText style={styles.summaryValue}>25</AppText>
            </View>
            <View style={styles.summaryItem}>
              <AppText style={styles.summaryLabel}>Chargeback</AppText>
              <AppText style={styles.summaryValue}>30</AppText>
            </View>
            <View style={styles.summaryItem}>
              <AppText style={styles.summaryLabel}>Net rate</AppText>
              <AppText style={styles.summaryValue}>15</AppText>
            </View>
            <View style={styles.summaryItem}>
              <AppText style={styles.summaryLabel}>With / Without MOQ</AppText>
              <AppText style={styles.summaryValue}>80/100</AppText>
            </View>
          </View>

          <View style={styles.discountSummary}>
            <AppText style={styles.discountSummaryTitle}>Discount (%)</AppText>
            <View style={styles.discountGrid}>
              {[
                { label: 'Below 5%', value: 20 },
                { label: '5%-10%', value: 20 },
                { label: '10%-15%', value: 20 },
                { label: '15%-20%', value: 20 },
                { label: '20%-25%', value: 20 },
                { label: '25%-30%', value: 20 },
              ].map((item, index) => (
                <View key={index} style={styles.discountGridItem}>
                  <AppText style={styles.discountGridLabel}>{item.label}</AppText>
                  <AppText style={styles.discountGridValue}>{item.value}</AppText>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.confirmationButtons}>
            <TouchableOpacity 
              style={styles.noButton}
              onPress={() => setShowSubmitConfirmation(false)}
            >
              <AppText style={styles.noButtonText}>No</AppText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.yesButton}
              onPress={confirmSubmit}
            >
              <AppText style={styles.yesButtonText}>Yes</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <AppText style={styles.headerTitle}>{rcId}</AppText>
          <View style={styles.headerBadges}>
            <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
              <AppText style={styles.badgeText}>DRAFT</AppText>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.lightGray }]}>
              <AppText style={styles.badgeText}>RFQ</AppText>
            </View>
          </View>
        </View>
        <TouchableOpacity>
          <Icon name="download" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formSection}>
          <AppText style={styles.sectionLabel}>Select Customer</AppText>
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => setShowCustomerDropdown(true)}
          >
            <AppText style={styles.dropdownText}>{selectedCustomer}</AppText>
            <Icon name="arrow-drop-down" size={24} color={colors.text} />
          </TouchableOpacity>

          {selectedCustomer && (
            <>
              <TouchableOpacity style={styles.addCustomerChip}>
                <Icon name="apartment" size={16} color={colors.textSecondary} />
                <AppText style={styles.chipText}>Kokilaben Dhirubhai Hospital</AppText>
                <TouchableOpacity>
                  <Icon name="close" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.copyLink}
                onPress={() => setShowCopyModal(true)}
              >
                <Icon name="content-copy" size={16} color={colors.primary} />
                <AppText style={styles.copyLinkText}>Copy RC from another customer</AppText>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.formSection}>
          <AppText style={styles.sectionLabel}>Linked Distributors</AppText>
          <View style={styles.row}>
            <View style={styles.infoBox}>
              <AppText style={styles.infoBoxText}>{linkedDistributors} Distributors</AppText>
            </View>
            <TouchableOpacity 
              style={styles.configureBtn}
              onPress={() => setShowConfigureModal(true)}
            >
              <Icon name="settings" size={16} color={colors.text} />
              <AppText style={styles.configureBtnText}>Configure</AppText>
              <Icon name="chevron-right" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formSection}>
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <AppText style={styles.sectionLabel}>Start Date</AppText>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => {
                  setDatePickerMode('start');
                  setShowDatePicker(true);
                }}
              >
                <AppText style={styles.dateText}>
                  {startDate.toLocaleDateString('en-GB').replace(/\//g, '/')}
                </AppText>
                <Icon name="calendar-today" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.halfWidth}>
              <AppText style={styles.sectionLabel}>End Date</AppText>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => {
                  setDatePickerMode('end');
                  setShowDatePicker(true);
                }}
              >
                <AppText style={styles.dateText}>
                  {endDate.toLocaleDateString('en-GB').replace(/\//g, '/')}
                </AppText>
                <Icon name="calendar-today" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.formSection}>
          <AppText style={styles.sectionLabel}>Supply Mode</AppText>
          <View style={styles.radioGroup}>
            <TouchableOpacity 
              style={styles.radioButton}
              onPress={() => setSupplyMode('Net Rate')}
            >
              <View style={[styles.radioOuter, supplyMode === 'Net Rate' && styles.radioActive]}>
                {supplyMode === 'Net Rate' && <View style={styles.radioInner} />}
              </View>
              <AppText style={styles.radioText}>Net Rate</AppText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.radioButton}
              onPress={() => setSupplyMode('Chargeback')}
            >
              <View style={[styles.radioOuter, supplyMode === 'Chargeback' && styles.radioActive]}>
                {supplyMode === 'Chargeback' && <View style={styles.radioInner} />}
              </View>
              <AppText style={styles.radioText}>Chargeback</AppText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.radioButton}
              onPress={() => setSupplyMode('Mixed')}
            >
              <View style={[styles.radioOuter, supplyMode === 'Mixed' && styles.radioActive]}>
                {supplyMode === 'Mixed' && <View style={styles.radioInner} />}
              </View>
              <AppText style={styles.radioText}>Mixed</AppText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formSection}>
          <View style={styles.rcHeader}>
            <AppText style={styles.sectionTitle}>RC's</AppText>
          </View>
          
          <TouchableOpacity 
            style={styles.addProductBar}
            onPress={() => setShowProductSearch(true)}
          >
            <AppText style={styles.addProductPlaceholder}>
              Enter product code/name to add...
            </AppText>
            <View style={styles.addProductIcons}>
              <TouchableOpacity onPress={() => setShowProductSearch(true)}>
                <Icon name="filter-list" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowDiscountFilter(true)}>
                <AppText style={styles.percentIcon}>%</AppText>
                <Icon name="arrow-drop-down" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          {products.map((product, index) => (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.productHeader}>
                <AppText style={styles.productName}>{product.name}</AppText>
                <TouchableOpacity onPress={() => removeProduct(product.id)}>
                  <Icon name="delete-outline" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.productPrices}>
                <AppText style={styles.priceText}>{product.id} | </AppText>
                <AppText style={styles.priceText}>PTS: ₹{product.pts} </AppText>
                <AppText style={styles.priceText}>PTR: ₹{product.ptr} </AppText>
                <AppText style={styles.priceText}>MRP: ₹{product.mrp}</AppText>
              </View>

              <View style={styles.productInputRow}>
                <View style={styles.productInputGroup}>
                  <AppText style={styles.inputLabel}>Special Price Type</AppText>
                  <TouchableOpacity style={styles.productDropdown}>
                    <AppText style={styles.productDropdownText}>{product.specialPriceType}</AppText>
                    <Icon name="arrow-drop-down" size={20} color={colors.text} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.productInputGroup}>
                  <AppText style={styles.inputLabel}>Discount (%)</AppText>
                  <View style={styles.discountInput}>
                    <TextInput
                      style={styles.discountInputText}
                      value={product.discount.toString()}
                      keyboardType="numeric"
                    />
                    <AppText style={styles.percentSymbol}>%</AppText>
                  </View>
                </View>
              </View>

              <View style={styles.productInputRow}>
                <View style={styles.productInputGroup}>
                  <AppText style={styles.inputLabel}>Special Price</AppText>
                  <View style={styles.priceInput}>
                    <AppText style={styles.rupeeSymbol}>₹</AppText>
                    <TextInput
                      style={styles.priceInputText}
                      value={product.specialPrice.toString()}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                
                <View style={styles.productInputGroup}>
                  <AppText style={styles.inputLabel}>MOQ(Monthly)</AppText>
                  <TextInput
                    style={styles.moqInput}
                    value={product.moq.toString()}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.radioGroup}>
                <TouchableOpacity style={styles.radioButton}>
                  <View style={[styles.radioOuter, styles.radioActive]}>
                    <View style={styles.radioInner} />
                  </View>
                  <AppText style={styles.radioText}>Net Rate</AppText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.radioButton}>
                  <View style={styles.radioOuter} />
                  <AppText style={styles.radioText}>Chargeback</AppText>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.lastSavedInfo}>
                <Icon name="refresh" size={16} color={colors.textSecondary} />
                <AppText style={styles.lastSavedText}>Last saved 05/04/2025</AppText>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <AppText style={styles.submitButtonText}>Submit</AppText>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={datePickerMode === 'start' ? startDate : endDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              if (datePickerMode === 'start') {
                setStartDate(selectedDate);
              } else {
                setEndDate(selectedDate);
              }
            }
          }}
        />
      )}

      {renderCustomerDropdown()}
      {renderCopyModal()}
      {renderConfigureModal()}
      {renderProductSearch()}
      {renderDiscountFilter()}
      {renderSubmitConfirmation()}
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
    padding: 16,
    backgroundColor: colors.white
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
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  formSection: {
    backgroundColor: colors.white,
    padding: 16,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
  },
  dropdownText: {
    fontSize: 16,
    color: colors.text,
  },
  addCustomerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  copyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 8,
  },
  copyLinkText: {
    fontSize: 14,
    color: colors.primary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  infoBox: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  infoBoxText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  configureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  configureBtnText: {
    fontSize: 14,
    color: colors.text,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 14,
    color: colors.text,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 8,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  radioText: {
    fontSize: 14,
    color: colors.text,
  },
  rcHeader: {
    marginBottom: 12,
  },
  addProductBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.inputBackground,
    marginBottom: 16,
  },
  addProductPlaceholder: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  addProductIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  percentIcon: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  productCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    backgroundColor: colors.white,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  productPrices: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  priceText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  productInputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  productInputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  productDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  productDropdownText: {
    fontSize: 14,
    color: colors.text,
  },
  discountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  discountInputText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    padding: 0,
  },
  percentSymbol: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  rupeeSymbol: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 4,
  },
  priceInputText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    padding: 0,
  },
  moqInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.text,
  },
  lastSavedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  lastSavedText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
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
  modalContentSmall: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
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
  modalBody: {
    padding: 16,
  },
  newCustomerInfo: {
    marginBottom: 20,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
  },
  customerDetails: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  filterChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterDropdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterText: {
    fontSize: 14,
    color: colors.text,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
  },
  customerList: {
    maxHeight: 300,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listHeaderText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  customerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  customerItemName: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  customerItemCode: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  customerItemCity: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdownContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: colors.white,
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemText: {
    fontSize: 14,
    color: colors.text,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  activeTabText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  tabText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  distributorList: {
    maxHeight: 400,
    padding: 16,
  },
  distributorCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  distributorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  distributorName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  marginLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  distributorDetails: {
    fontSize: 14,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dropdownButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  marginInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 80,
  },
  marginInputText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    padding: 0,
  },
  supplyModeRow: {
    flexDirection: 'row',
    gap: 24,
  },
  configureButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 8,
    margin: 16,
  },
  configureButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  productSearchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    padding: 0,
  },
  searchResults: {
    maxHeight: 400,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  searchResultCode: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptySearchState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptySearchText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 16,
  },
  discountContent: {
    padding: 16,
  },
  customDiscountInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
    marginBottom: 20,
  },
  discountOptions: {
    gap: 16,
  },
  discountOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 8,
    margin: 16,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  confirmationModal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  confirmationIcon: {
    marginBottom: 20,
  },
  confirmationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  confirmationSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  summaryItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  discountSummary: {
    width: '100%',
    marginBottom: 24,
  },
  discountSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  discountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  discountGridItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 12,
  },
  discountGridLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  discountGridValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  confirmationButtons: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  noButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  noButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  yesButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  yesButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default CreateRateContract;