import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../../../styles/colors';

const ProductList = ({ searchText, selectedProducts, onProductClick, onProductSelect }) => {
  // Mock products data
  const products = [
    {
      id: '005501350-1',
      name: 'BRUFFEN 100MG 1X10 TAB',
      code: '005501350',
      rcCount: 2,
    },
    {
      id: '005501350-2',
      name: 'CREMAFFIN 100MG 1X10 Tablet',
      code: '005501350',
      rcCount: 10,
    },
    {
      id: '005501350-3',
      name: 'GELOSIL PLUS 100ML BOTTLE',
      code: '005501350',
      rcCount: 25,
    },
    {
      id: '005501350-4',
      name: 'REVITAL 100 Tab',
      code: '005501350',
      rcCount: 15,
    },
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchText.toLowerCase()) ||
    product.code.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {filteredProducts.map((product, index) => (
        <View key={product.id} style={styles.productCard}>
          <View style={styles.productRow}>
            <TouchableOpacity 
              style={styles.checkbox}
              onPress={() => onProductSelect(product.id)}
            >
              <Icon 
                name={selectedProducts.includes(product.id) ? "check-box" : "check-box-outline-blank"} 
                size={24} 
                color={selectedProducts.includes(product.id) ? colors.primary : colors.textSecondary} 
              />
            </TouchableOpacity>

            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productCode}>{product.code}</Text>
              
              <TouchableOpacity 
                style={styles.rcButton}
                onPress={() => onProductClick(product)}
              >
                <Text style={styles.rcCount}>{product.rcCount} RC's</Text>
                <Icon name="arrow-drop-down" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.approveButton}>
                <Icon name="check" size={18} color={colors.white} />
                <Text style={styles.approveText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton}>
                <Icon name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Divider between products except for last one */}
          {index < filteredProducts.length - 1 && (
            <View style={styles.divider} />
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingVertical: 16,
  },
  productCard: {
    paddingHorizontal: 16,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  checkbox: {
    paddingRight: 12,
    paddingTop: 4,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  productCode: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  rcButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  rcCount: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  approveText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 36,
  },
});

export default ProductList;