import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  StatusBar,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../../../styles/colors';
import ConfirmationModal from './ConfirmationModal';
import Toast from './Toast';

const RCDetails = ({ rc, product, onBack, onApprove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showUpdateToast, setShowUpdateToast] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeletedProducts, setShowDeletedProducts] = useState(false);
  const [formData, setFormData] = useState({
    customer: 'Columbia Asia',
    distributors: '4 Distributors',
    startDate: '03/06/2025',
    endDate: '31/03/2026',
    supplyMode: 'Mixed',
    discount: '40',
    specialPrice: '60.20',
    moq: '120',
  });

  const handleUpdate = () => {
    setIsEditing(false);
    setShowUpdateToast(true);
    setTimeout(() => setShowUpdateToast(false), 3000);
  };

  const handleEditToggle = () => {
    setIsEditing(true);
  };

  const handleApproveClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmApprove = () => {
    setShowConfirmModal(false);
    onApprove();
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
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>SUNRC_2</Text>
            <View style={styles.headerBadges}>
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingText}>PENDING</Text>
              </View>
              <View style={styles.rfqBadge}>
                <Text style={styles.rfqText}>RFQ</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity>
            <Icon name="download" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.formSection}>
            {/* Customer Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Select Customer</Text>
              <View style={styles.dropdownField}>
                <Text style={styles.dropdownText}>{formData.customer}</Text>
                <Icon name="arrow-drop-down" size={24} color={colors.text} />
              </View>
              
              <TouchableOpacity style={styles.copyLink}>
                <Icon name="content-copy" size={16} color={colors.primary} />
                <Text style={styles.copyLinkText}>Copy RC from another customer</Text>
              </TouchableOpacity>
            </View>

            {/* Linked Distributors */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Linked Distributors</Text>
              <View style={styles.distributorRow}>
                <View style={styles.distributorField}>
                  <Text style={styles.fieldText}>{formData.distributors}</Text>
                </View>
                <TouchableOpacity style={styles.configureButton}>
                  <Icon name="settings" size={16} color={colors.text} />
                  <Text style={styles.configureText}>Configure</Text>
                  <Icon name="chevron-right" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Date Selection */}
            <View style={styles.dateRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Start Date</Text>
                <TouchableOpacity style={styles.dateField}>
                  <Text style={styles.fieldText}>{formData.startDate}</Text>
                  <Icon name="calendar-today" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>End Date</Text>
                <TouchableOpacity style={styles.dateField}>
                  <Text style={styles.fieldText}>{formData.endDate}</Text>
                  <Icon name="calendar-today" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Supply Mode */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Supply Mode</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity style={styles.radioOption}>
                  <View style={styles.radio}>
                    {formData.supplyMode === 'Net Rate' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioText}>Net Rate</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.radioOption}>
                  <View style={styles.radio}>
                    {formData.supplyMode === 'Chargeback' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioText}>Chargeback</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.radioOption}>
                  <View style={[styles.radio, styles.radioSelected]}>
                    {formData.supplyMode === 'Mixed' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioText}>Mixed</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* RC's Section */}
          <View style={styles.rcSection}>
            <View style={styles.rcHeader}>
              <Text style={styles.rcTitle}>RC's</Text>
              <View style={styles.rcActions}>
                <TouchableOpacity style={styles.logsButton}>
                  <Icon name="history" size={20} color={colors.text} />
                  <Text style={styles.logsText}>Logs</Text>
                </TouchableOpacity>
                {isEditing && (
                  <TouchableOpacity 
                    style={styles.showDeletedRow}
                    onPress={() => setShowDeletedProducts(!showDeletedProducts)}
                  >
                    <View style={styles.checkbox}>
                      <Icon 
                        name={showDeletedProducts ? "check-box" : "check-box-outline-blank"} 
                        size={20} 
                        color={colors.textSecondary} 
                      />
                    </View>
                    <Text style={styles.showDeletedText}>Show Deleted Products</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {isEditing && (
              <View style={styles.addProductBar}>
                <Text style={styles.addProductText}>Enter product code/name to add new product</Text>
                <Icon name="filter-list" size={20} color={colors.textSecondary} />
              </View>
            )}

            {/* Product Cards */}
            <View style={styles.productCard}>
              <View style={styles.productHeader}>
                <Text style={styles.productName}>BRUFFEN 100MG 1X10 TAB</Text>
                {isEditing && (
                  <TouchableOpacity>
                    <Icon name="delete-outline" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.productCode}>
                005501350 | PTS: ₹70.20 PTR: ₹100.20 MRP: ₹120.20
              </Text>

              {isEditing ? (
                <>
                  <View style={styles.editRow}>
                    <View style={styles.editField}>
                      <Text style={styles.editLabel}>Special Price Type</Text>
                      <View style={styles.dropdown}>
                        <Text style={styles.dropdownValue}>Discount on PTR</Text>
                        <Icon name="arrow-drop-down" size={20} color={colors.text} />
                      </View>
                    </View>
                    <View style={styles.editFieldSmall}>
                      <Text style={styles.editLabel}>Discount (%)</Text>
                      <TextInput
                        style={styles.input}
                        value={formData.discount}
                        onChangeText={(text) => setFormData({...formData, discount: text})}
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
                          value={formData.specialPrice}
                          onChangeText={(text) => setFormData({...formData, specialPrice: text})}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                    <View style={styles.editFieldSmall}>
                      <Text style={styles.editLabel}>MOQ</Text>
                      <TextInput
                        style={styles.input}
                        value={formData.moq}
                        onChangeText={(text) => setFormData({...formData, moq: text})}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.viewDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Special Price Type</Text>
                    <Text style={styles.detailLabel}>Discount (%)</Text>
                    <Text style={styles.detailLabel}>Special Price</Text>
                    <Text style={styles.detailLabel}>MOQ</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailValue}>Discount on PTR</Text>
                    <Text style={styles.detailValue}>30%</Text>
                    <Text style={styles.detailValue}>₹ 70.20</Text>
                    <Text style={styles.detailValue}>120</Text>
                  </View>
                </View>
              )}

              <Text style={styles.division}>Division: IN CNS</Text>
            </View>

            {/* Second Product */}
            <View style={styles.productCard}>
              <View style={styles.productHeader}>
                <Text style={styles.productName}>CREMAFFIN 100MG 1X10 Tablets</Text>
                {isEditing && (
                  <TouchableOpacity>
                    <Icon name="delete-outline" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.productCode}>
                005501350 | PTS: ₹70.20 PTR: ₹100.20 MRP: ₹120.20
              </Text>

              <View style={styles.viewDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Special Price Type</Text>
                  <Text style={styles.detailLabel}>Discount (%)</Text>
                  <Text style={styles.detailLabel}>Special Price</Text>
                  <Text style={styles.detailLabel}>MOQ</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailValue}>Discount on PTR</Text>
                  <Text style={styles.detailValue}>40%</Text>
                  <Text style={styles.detailValue}>₹ 60.20</Text>
                  <Text style={styles.detailValue}>120</Text>
                </View>
              </View>

              <Text style={styles.division}>Division: IN CNS</Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          {isEditing ? (
            <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
              <Text style={styles.updateButtonText}>Update</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.editButton} onPress={handleEditToggle}>
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

        {/* Update Toast */}
        {showUpdateToast && (
          <Toast
            message="Rate Contract has been successfully updated!"
            type="success"
            onDismiss={() => setShowUpdateToast(false)}
          />
        )}
      </SafeAreaView>

      {/* Confirmation Modal */}
      <ConfirmationModal
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
  pendingBadge: {
    backgroundColor: '#FEF7ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  pendingText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#F4AD48',
  },
  rfqBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  rfqText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
  },
  content: {
    flex: 1,
  },
  formSection: {
    backgroundColor: colors.white,
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  dropdownField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownText: {
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
  distributorField: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  fieldText: {
    fontSize: 14,
    color: colors.text,
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
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  radioGroup: {
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
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  rcHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rcTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  rcActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logsText: {
    fontSize: 14,
    color: colors.text,
  },
  showDeletedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  checkbox: {
    padding: 2,
  },
  showDeletedText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  addProductBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  addProductText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  productCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  productName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  productCode: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  viewDetails: {
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
  dropdownValue: {
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
  division: {
    fontSize: 13,
    color: colors.text,
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

export default RCDetails;