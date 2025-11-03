import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { colors } from '../../../styles/colors';
import { bulkUpdateProductDiscounts } from '../../../api/product';
import { setProducts, setBulkEditMode, deselectAllProducts } from '../../../redux/slices/productSlice';

const ProductBulkEdit = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { productIds, products } = route.params;

  const [doctorDiscount, setDoctorDiscount] = useState('');
  const [hospitalDiscount, setHospitalDiscount] = useState('');
  const [applyToAll, setApplyToAll] = useState(true);
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    if (!doctorDiscount && !hospitalDiscount) {
      Alert.alert('Error', 'Please enter at least one discount value');
      return;
    }

    Alert.alert(
      'Confirm Update',
      `Update discount for ${products.length} selected products?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            setUpdating(true);
            try {
              await bulkUpdateProductDiscounts(
                productIds,
                doctorDiscount ? parseFloat(doctorDiscount) : null,
                hospitalDiscount ? parseFloat(hospitalDiscount) : null
              );

              Alert.alert(
                'Success',
                `${products.length} products updated successfully`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      dispatch(setBulkEditMode(false));
                      dispatch(deselectAllProducts());
                      navigation.goBack();
                    }
                  }
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to update products');
            } finally {
              setUpdating(false);
            }
          }
        }
      ]
    );
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return '₹ 0.00';
    return `₹ ${(price / 100).toFixed(2)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bulk Edit Products</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.selectionInfo}>
            <Icon name="info-outline" size={20} color={colors.primary} />
            <Text style={styles.selectionText}>
              {products.length} products selected for bulk update
            </Text>
          </View>

          <View style={styles.selectedProductsList}>
            <Text style={styles.sectionTitle}>Selected Products</Text>
            <ScrollView 
              style={styles.productScrollView}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
            >
              {products.slice(0, 5).map((product, index) => (
                <View key={product.productId} style={styles.productItem}>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {product.productName}
                    </Text>
                    <Text style={styles.productCode}>{product.productCode}</Text>
                  </View>
                  <View style={styles.currentDiscounts}>
                    <Text style={styles.discountText}>
                      D: {product.doctorMargin || 0}%
                    </Text>
                    <Text style={styles.discountText}>
                      H: {product.hosptialMargin || 0}%
                    </Text>
                  </View>
                </View>
              ))}
              {products.length > 5 && (
                <Text style={styles.moreText}>
                  And {products.length - 5} more products...
                </Text>
              )}
            </ScrollView>
          </View>

          <View style={styles.discountSection}>
            <Text style={styles.sectionTitle}>New Discount Configuration</Text>
            
            <View style={styles.discountInputContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Doctor Discount (%)</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={doctorDiscount}
                    onChangeText={setDoctorDiscount}
                    keyboardType="numeric"
                    placeholder="Enter discount"
                    placeholderTextColor="#999"
                  />
                  <Text style={styles.percentSign}>%</Text>
                </View>
                <Text style={styles.helperText}>
                  Leave empty to keep existing values
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Hospital Discount (%)</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={hospitalDiscount}
                    onChangeText={setHospitalDiscount}
                    keyboardType="numeric"
                    placeholder="Enter discount"
                    placeholderTextColor="#999"
                  />
                  <Text style={styles.percentSign}>%</Text>
                </View>
                <Text style={styles.helperText}>
                  Leave empty to keep existing values
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.applyOption}
              onPress={() => setApplyToAll(!applyToAll)}
            >
              <Icon
                name={applyToAll ? 'check-box' : 'check-box-outline-blank'}
                size={24}
                color={colors.primary}
              />
              <Text style={styles.applyOptionText}>
                Apply same discount to all selected products
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Update Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Products to update:</Text>
              <Text style={styles.summaryValue}>{products.length}</Text>
            </View>
            {doctorDiscount && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>New doctor discount:</Text>
                <Text style={styles.summaryValue}>{doctorDiscount}%</Text>
              </View>
            )}
            {hospitalDiscount && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>New hospital discount:</Text>
                <Text style={styles.summaryValue}>{hospitalDiscount}%</Text>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.updateButton, updating && styles.disabledButton]}
            onPress={handleUpdate}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.updateButtonText}>Update All</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
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
  },
  content: {
    flex: 1,
  },
  selectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    marginTop: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  selectionText: {
    fontSize: 14,
    color: '#F57C00',
    flex: 1,
  },
  selectedProductsList: {
    backgroundColor: '#fff',
    marginTop: 8,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 8,
    maxHeight: 250,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  productScrollView: {
    maxHeight: 180,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  productInfo: {
    flex: 1,
    paddingRight: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  productCode: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  currentDiscounts: {
    flexDirection: 'row',
    gap: 12,
  },
  discountText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  moreText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
  },
  discountSection: {
    backgroundColor: '#fff',
    marginTop: 8,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 8,
  },
  discountInputContainer: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  percentSign: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#999',
  },
  applyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  applyOptionText: {
    fontSize: 14,
    color: '#333',
  },
  summary: {
    backgroundColor: '#E3F2FD',
    marginTop: 8,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#555',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  updateButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ProductBulkEdit;