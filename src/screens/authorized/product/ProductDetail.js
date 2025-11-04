import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,  
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../../styles/colors';
import { getProductById, updateProductDiscount } from '../../../api/product';
import { updateProduct } from '../../../redux/slices/productSlice';
import ChevronLeft from '../../../components/icons/ChevronLeft';

const ProductDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { product } = route.params;

  const [activeTab, setActiveTab] = useState('details');
  const [productDetails, setProductDetails] = useState(product);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // Discount values for editing
  const [doctorDiscount, setDoctorDiscount] = useState(
    product?.doctorMargin?.toString() || '10'
  );
  const [hospitalDiscount, setHospitalDiscount] = useState(
    product?.hosptialMargin?.toString() || '15'
  );

  useEffect(() => {
    fetchProductDetails();
  }, [product.productId]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const data = await getProductById(product.productId);
      setProductDetails(data);
      setDoctorDiscount(data.doctorMargin?.toString() || '10');
      setHospitalDiscount(data.hosptialMargin?.toString() || '15');
    } catch (error) {
      console.error('Error fetching product details:', error);
      // Use existing product data if API fails
      setProductDetails(product);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDiscount = async () => {
    if (!doctorDiscount || !hospitalDiscount) {
      Alert.alert('Error', 'Please enter valid discount values');
      return;
    }

    setUpdating(true);
    try {
      await updateProductDiscount(
        productDetails.productId,
        parseFloat(doctorDiscount),
        parseFloat(hospitalDiscount)
      );

      const updatedProduct = {
        ...productDetails,
        doctorMargin: parseFloat(doctorDiscount),
        hosptialMargin: parseFloat(hospitalDiscount)
      };

      setProductDetails(updatedProduct);
      dispatch(updateProduct(updatedProduct));
      setEditMode(false);
      Alert.alert('Success', 'Discount updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update discount');
    } finally {
      setUpdating(false);
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return '₹ 0.00';
    return `₹ ${(price / 100).toFixed(2)}`;
  };

  const renderDetailsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={{...styles.section}}>
        <Text style={styles.sectionTitle}>Product Details</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Product Title</Text>
          <Text style={styles.detailValue}>{productDetails.productName}</Text>
        </View>

        <View style={{...styles.detailRow, marginTop: 10}}>
          <Text style={styles.detailLabel}>Description</Text>
          <Text style={styles.detailValue}>
            {productDetails.composition || 'Bioever Presents The New Guards Against Sunburn Water Resistant Sunscreen Lotion. Bioever Sunscreen'}
          </Text>
        </View>

        <View style={{...styles.tripleRow, marginTop: 10}}>
          <View style={styles.tripleItem}>
            <Text style={styles.detailLabel}>UPC</Text>
            <Text style={styles.detailValue}>{productDetails.upc || 'S001-M002'}</Text>
          </View>
          <View style={styles.tripleItem}>
            <Text style={styles.detailLabel}>HSN Code</Text>
            <Text style={styles.detailValue}>{productDetails.hsnCode || '202'}</Text>
          </View>
          <View style={styles.tripleItem}>
            <Text style={styles.detailLabel}>Division</Text>
            <Text style={styles.detailValue}>{productDetails.divisionName || 'Selecta'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pricing & Tax</Text>
        
        <View style={styles.priceGrid}>
          <View style={styles.priceItem}>
            <Text style={styles.detailLabel}>PTS</Text>
            <Text style={styles.priceValue}>{formatPrice(productDetails.pts)}</Text>
          </View>
          <View style={styles.priceItem}>
            <Text style={styles.detailLabel}>PTR</Text>
            <Text style={styles.priceValue}>{formatPrice(productDetails.ptr)}</Text>
          </View>
          <View style={styles.priceItem}>
            <Text style={styles.detailLabel}>MRP</Text>
            <Text style={styles.priceValue}>{formatPrice(productDetails.mrp)}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Tax Category</Text>
          <Text style={styles.detailValue}>
            GST {productDetails.gstClassification || '18'}%
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Base Unit & Pack Size</Text>
        
        <View style={styles.tripleRow}>
          <View style={styles.tripleItem}>
            <Text style={styles.detailLabel}>Base UoM</Text>
            <Text style={styles.detailValue}>{productDetails.uom || 'CSE'}</Text>
          </View>
          <View style={styles.tripleItem}>
            <Text style={styles.detailLabel}>Pack Size</Text>
            <Text style={styles.detailValue}>{productDetails.packing || '10'}</Text>
          </View>
          <View style={styles.tripleItem}>
            <Text style={styles.detailLabel}>Box Qty</Text>
            <Text style={styles.detailValue}>{productDetails.boxQty || '1'}</Text>
          </View>
        </View>
      </View>

      <View style={{...styles.section, borderBottomWidth: 0}}>
        <Text style={styles.sectionTitle}>Facets</Text>
        
        <View style={{ flexDirection: 'row', gap: 20 }}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Brand Name</Text>
            <Text style={styles.detailValue}>{productDetails.brandName || 'AstraZeneca'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Brand Code</Text>
            <Text style={styles.detailValue}>{productDetails.brandCode || 'RU60Y8SZTL'}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderDiscountTab = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.tabContent}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.discountSection}>
          <Text style={styles.sectionTitle}>Product Name</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Product Title</Text>
            <Text style={styles.detailValue}>{productDetails.productName}</Text>
          </View>

          <View style={{...styles.detailRow, marginTop: 15}}>
            <Text style={styles.detailLabel}>Division</Text>
            <Text style={styles.detailValue}>{productDetails.divisionName || 'IN CNS'}</Text>
          </View>

          <View style={styles.discountContainer}>
            <Text style={styles.discountTitle}>Discount</Text>
            
            {editMode ? (
              <View style={styles.editDiscountContainer}>
                <View style={styles.discountInputRow}>
                  <View style={styles.discountInputItem}>
                    <Text style={styles.discountInputLabel}>For Doctor</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.discountInput}
                        value={doctorDiscount}
                        onChangeText={setDoctorDiscount}
                        keyboardType="numeric"
                        placeholder="10"
                        placeholderTextColor="#999"
                      />
                      <Text style={styles.percentSign}>%</Text>
                    </View>
                  </View>
                  
                  <View style={styles.discountInputItem}>
                    <Text style={styles.discountInputLabel}>For Hospital</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.discountInput}
                        value={hospitalDiscount}
                        onChangeText={setHospitalDiscount}
                        keyboardType="numeric"
                        placeholder="15"
                        placeholderTextColor="#999"
                      />
                      <Text style={styles.percentSign}>%</Text>
                    </View>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={styles.updateButton}
                  onPress={handleUpdateDiscount}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.updateButtonText}>Update</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.discountRow}>
                  <View style={styles.discountItem}>
                    <Text style={styles.discountLabel}>For Doctor</Text>
                    <Text style={styles.discountValue}>{doctorDiscount}%</Text>
                  </View>
                  <View style={styles.discountItem}>
                    <Text style={styles.discountLabel}>For Hospital</Text>
                    <Text style={styles.discountValue}>{hospitalDiscount}%</Text>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setEditMode(true)}
                >
                  <Text style={styles.editButtonText}>Edit Discount</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          SKU Code - {productDetails.productCode}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'details' && styles.activeTab]}
          onPress={() => setActiveTab('details')}
        >
          <Icon 
            name="description" 
            size={20} 
            color={activeTab === 'details' ? colors.primary : '#999'} 
          />
          <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>
            Details
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'discount' && styles.activeTab]}
          onPress={() => setActiveTab('discount')}
        >
          <Icon 
            name="local-offer" 
            size={20} 
            color={activeTab === 'discount' ? colors.primary : '#999'} 
          />
          <Text style={[styles.tabText, activeTab === 'discount' && styles.activeTabText]}>
            Discount Configuration
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'details' ? renderDetailsTab() : renderDiscountTab()}
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
    marginLeft: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
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
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,    
    backgroundColor: '#fff',    
  },
  section: {
    backgroundColor: '#fff',    
    paddingVertical: 16,    
    borderBottomColor: '#F4F4F4',
    borderBottomWidth: 1
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  detailRow: {
    
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  tripleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tripleItem: {
    flex: 1,
  },
  priceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priceItem: {
    flex: 1,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  discountSection: {
    backgroundColor: '#fff',    
    marginTop: 15,
  },
  discountContainer: {
    marginTop: 24,
  },
  discountTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  discountRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 24,
    gap: 50    
  },
  discountItem: {
    alignItems: 'flex-start',    
  },
  discountLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  discountValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  editButton: {
    backgroundColor: '#fff',
    borderColor: colors.primary,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  editDiscountContainer: {
    marginTop: 16,
  },
  discountInputRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 24,
    gap: 50
  },
  discountInputItem: {
    alignItems: 'flex-start',
  },
  discountInputLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 0,
    minWidth: 100,
  },
  discountInput: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  percentSign: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  updateButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 8,
    alignSelf: 'flex-start',    
    alignItems: 'flex-start',
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProductDetail;