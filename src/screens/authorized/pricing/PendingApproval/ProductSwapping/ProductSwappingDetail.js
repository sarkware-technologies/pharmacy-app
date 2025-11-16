import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../../../styles/colors';
import ProductSwappingConfirmModal from './ProductSwappingConfirmModal';

const ProductSwappingDetail = ({ swap, onBack, onApprove, onUpdate }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedRCs, setSelectedRCs] = useState(['SUNRC_1', 'SUNRC_2']);
  const [searchText, setSearchText] = useState('');
  
  // Mock RC data
  const [rateContracts, setRateContracts] = useState([
    {
      id: 'SUNRC_1',
      customer: 'Agarwal Maternity General Hospital',
      code: '2536',
      location: 'Pune',
      specialPriceType: 'Discount on PTR',
      discount: isEditMode ? '40' : '30%',
      specialPrice: '₹ 70.20',
      moq: isEditMode ? 'Qty' : '120',
      selected: true,
    },
    {
      id: 'SUNRC_2',
      customer: 'Columbia Asia',
      code: '1336',
      location: 'Mumbai',
      specialPriceType: 'Discount on PTR',
      discount: '30%',
      specialPrice: '₹ 70.20',
      moq: '120',
      selected: true,
    },
    {
      id: 'SUNRC_3',
      customer: 'Apollo Hospitals',
      code: '2537',
      location: 'Delhi',
      specialPriceType: 'Discount on PTR',
      discount: '30%',
      specialPrice: '₹ 70.20',
      moq: '120',
      selected: true,
    },
  ]);

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleUpdate = () => {
    setIsEditMode(false);
    onUpdate();
  };

  const handleApproveClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmApprove = () => {
    setShowConfirmModal(false);
    onApprove();
  };

  const toggleRCSelection = (rcId) => {
    if (selectedRCs.includes(rcId)) {
      setSelectedRCs(selectedRCs.filter(id => id !== rcId));
    } else {
      setSelectedRCs([...selectedRCs, rcId]);
    }
  };

  return (
    <>
      <SafeAreaView style={styles.container} edges={[]}>
        <StatusBar backgroundColor="#F6F6F6" barStyle="dark-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Icon name="chevron-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Swapping</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Product Cards */}
          <View style={styles.productCardsContainer}>
            {/* Old Product Card */}
            <View style={styles.productCard}>
              <Text style={styles.cardLabel}>OLD PRODUCT</Text>
              <Text style={styles.productName}>BRUFFEN 100MG 1X10 TAB</Text>
              <View style={styles.productDetails}>
                <Text style={styles.productDetailText}>PTS: ₹70.20</Text>
                <Text style={styles.productDetailText}>PTR: ₹80.20</Text>
                <Text style={styles.productDetailText}>MRP: ₹100.20</Text>
              </View>
              <View style={styles.productFooter}>
                <Text style={styles.productCode}>10106555</Text>
                <TouchableOpacity>
                  <Text style={styles.viewMoreText}>View More</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Swap Icon */}
            <View style={styles.swapIconContainer}>
              <View style={styles.swapIcon}>
                <Icon name="swap-vert" size={24} color={colors.white} />
              </View>
            </View>

            {/* New Product Card */}
            <View style={[styles.productCard, styles.newProductCard]}>
              <Text style={styles.cardLabel}>NEW PRODUCT</Text>
              <Text style={styles.productName}>BRUFFEN 250MG 1X20 TAB</Text>
              <View style={styles.productDetails}>
                <Text style={styles.productDetailText}>PTS: ₹70.20</Text>
                <Text style={styles.productDetailText}>PTR: ₹80.20</Text>
                <Text style={styles.productDetailText}>MRP: ₹100.20</Text>
              </View>
              <View style={styles.productFooter}>
                <Text style={styles.productCode}>10106555</Text>
                <TouchableOpacity>
                  <Text style={styles.viewMoreText}>View More</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by customer name/RC id"
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor={colors.textSecondary}
            />
            <View style={styles.searchActions}>
              <TouchableOpacity style={styles.filterButton}>
                <Icon name="filter-list" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.percentButton}>
                <Text style={styles.percentText}>%</Text>
                <Icon name="arrow-drop-down" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* All RC's Section */}
          <View style={styles.rcSection}>
            <View style={styles.rcHeader}>
              <View style={styles.allRCsContainer}>
                <Icon name="check-box" size={20} color={colors.primary} />
                <Text style={styles.allRCsText}>All RC's</Text>
              </View>
              <Text style={styles.fetchedPriceText}>Fetched Fixed Price</Text>
            </View>

            {/* RC Cards */}
            {rateContracts.map((rc, index) => (
              <View key={rc.id} style={styles.rcCard}>
                <View style={styles.rcCardHeader}>
                  <View style={styles.rcCheckbox}>
                    <Icon 
                      name={selectedRCs.includes(rc.id) ? "check-box" : "check-box-outline-blank"} 
                      size={20} 
                      color={colors.primary} 
                    />
                    <Text style={styles.rcId}>{rc.id}</Text>
                    <Icon name="chevron-right" size={20} color={colors.text} />
                  </View>
                  <TouchableOpacity>
                    <Icon name="delete-outline" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.customerName}>{rc.customer}</Text>
                <View style={styles.locationRow}>
                  <Icon name="location-on" size={14} color={colors.textSecondary} />
                  <Text style={styles.locationText}>{rc.code} | {rc.location}</Text>
                </View>

                {isEditMode && index === 0 ? (
                  // Edit Mode for first RC
                  <>
                    <View style={styles.editRow}>
                      <View style={styles.editField}>
                        <Text style={styles.editLabel}>Special Price Type</Text>
                        <TouchableOpacity style={styles.dropdown}>
                          <Text style={styles.dropdownText}>{rc.specialPriceType}</Text>
                          <Icon name="arrow-drop-down" size={20} color={colors.text} />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.editFieldSmall}>
                        <Text style={styles.editLabel}>Discount (%)</Text>
                        <TextInput
                          style={styles.input}
                          value={rc.discount}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                    <View style={styles.editRow}>
                      <View style={styles.editField}>
                        <Text style={styles.editLabel}>Special Price</Text>
                        <View style={styles.priceInput}>
                          <Text style={styles.rupeeSign}>₹</Text>
                          <TextInput
                            style={styles.priceValue}
                            value="60.20"
                            keyboardType="numeric"
                          />
                        </View>
                      </View>
                      <View style={styles.editFieldSmall}>
                        <Text style={styles.editLabel}>MOQ(Monthly)</Text>
                        <TouchableOpacity style={styles.dropdown}>
                          <Text style={styles.dropdownText}>{rc.moq}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>
                ) : (
                  // View Mode
                  <View style={styles.detailsGrid}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Special Price Type</Text>
                      <Text style={styles.detailLabel}>Discount (%)</Text>
                      <Text style={styles.detailLabel}>Special Price</Text>
                      <Text style={styles.detailLabel}>MOQ</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailValue}>{rc.specialPriceType}</Text>
                      <Text style={styles.detailValue}>{rc.discount}</Text>
                      <Text style={styles.detailValue}>{rc.specialPrice}</Text>
                      <Text style={styles.detailValue}>{rc.moq}</Text>
                    </View>
                  </View>
                )}

                {index === 1 && (
                  <Text style={styles.lastSaved}>
                    <Icon name="refresh" size={14} color={colors.textSecondary} />
                    {' '}Last saved 05/04/2025
                  </Text>
                )}
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          {isEditMode ? (
            <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
              <Text style={styles.updateButtonText}>Update</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Icon name="edit" size={20} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.sendBackButton}>
                <Icon name="undo" size={20} color={colors.primary} />
                <Text style={styles.sendBackText}>Send Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.approveButton} onPress={handleApproveClick}>
                <Icon name="check" size={20} color={colors.white} />
                <Text style={styles.approveButtonText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.rejectButton}>
                <Icon name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>

      {/* Confirmation Modal */}
      <ProductSwappingConfirmModal
        visible={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmApprove}
      />
    </>
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
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  productCardsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  productCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16,
  },
  newProductCard: {
    borderColor: colors.primary,
  },
  cardLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  productDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  productDetailText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productCode: {
    fontSize: 14,
    color: colors.text,
  },
  viewMoreText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  swapIconContainer: {
    alignItems: 'center',
    marginVertical: -8,
    zIndex: 1,
  },
  swapIcon: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginVertical: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
  },
  searchActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterButton: {
    padding: 4,
  },
  percentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  percentText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  rcSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  rcHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  allRCsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  allRCsText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  fetchedPriceText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  rcCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  rcCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rcCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rcId: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  detailsGrid: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
  },
  editRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  editField: {
    flex: 2,
  },
  editFieldSmall: {
    flex: 1,
  },
  editLabel: {
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
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.text,
    textAlign: 'center',
  },
  priceInput: {
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
  priceValue: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },
  lastSaved: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    gap: 10,
  },
  editButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  sendBackButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 12,
  },
  sendBackText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
  },
  approveButtonText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
  },
  rejectButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  updateButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  updateButtonText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
  },
});

export default ProductSwappingDetail;