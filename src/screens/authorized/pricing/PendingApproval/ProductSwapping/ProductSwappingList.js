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

const ProductSwappingList = ({ selectedItems, onItemSelect, onSwapClick }) => {
  // Mock data for product swapping
  const productSwaps = [
    {
      id: '1',
      oldProduct: {
        name: 'BRUFFEN 100MG 1X10 TAB',
        code: '005501350',
      },
      newProduct: {
        name: 'BRUFFEN 250MG 1X10 TAB',
        code: '004501350',
      },
      rcCount: 2,
    },
    {
      id: '2',
      oldProduct: {
        name: 'CREMAFFIN 100MG 1X10 TAB',
        code: '005501350',
      },
      newProduct: {
        name: 'CREMAFFIN 250MG 1X10 TAB',
        code: '004501350',
      },
      rcCount: 2,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {productSwaps.map((swap) => (
        <View key={swap.id} style={styles.swapCard}>
          <TouchableOpacity 
            style={styles.checkbox}
            onPress={() => onItemSelect(swap.id)}
          >
            <Icon 
              name={selectedItems.includes(swap.id) || selectedItems.includes('all') ? "check-box" : "check-box-outline-blank"} 
              size={24} 
              color={selectedItems.includes(swap.id) || selectedItems.includes('all') ? colors.primary : colors.textSecondary} 
            />
          </TouchableOpacity>

          <View style={styles.swapContent}>
            {/* Old Product */}
            <View style={styles.productSection}>
              <Text style={styles.productLabel}>Old Product Details</Text>
              <Text style={styles.productName}>{swap.oldProduct.name}</Text>
              <Text style={styles.productCode}>{swap.oldProduct.code}</Text>
            </View>

            {/* New Product */}
            <View style={styles.productSection}>
              <Text style={styles.productLabel}>New Product Details</Text>
              <Text style={styles.productName}>{swap.newProduct.name}</Text>
              <Text style={styles.productCode}>{swap.newProduct.code}</Text>
            </View>

            {/* RC Count and Actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={styles.rcButton}
                onPress={() => onSwapClick(swap)}
              >
                <Text style={styles.rcCount}>{swap.rcCount} RC's</Text>
                <Icon name="arrow-drop-down" size={20} color={colors.primary} />
              </TouchableOpacity>

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
          </View>
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
  swapCard: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  checkbox: {
    paddingRight: 12,
    paddingTop: 4,
  },
  swapContent: {
    flex: 1,
  },
  productSection: {
    marginBottom: 16,
  },
  productLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  productName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  productCode: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rcButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
});

export default ProductSwappingList;