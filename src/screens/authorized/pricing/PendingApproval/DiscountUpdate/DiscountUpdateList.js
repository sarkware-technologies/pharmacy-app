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

const DiscountUpdateList = ({ selectedItems, onItemSelect, onProductClick }) => {
  // Mock data for discount updates
  const discountUpdates = [
    {
      id: '1',
      productName: 'BRUFFEN 100MG 1X10 TAB',
      productCode: '005501350',
      oldDiscount: '20%',
      newDiscount: '15%',
      rcCount: 2,
    },
    {
      id: '2',
      productName: 'CREMAFFIN 100MG 1X10 TAB',
      productCode: '005501350',
      oldDiscount: '20%',
      newDiscount: '15%',
      rcCount: 2,
    },
    {
      id: '3',
      productName: 'GELOSIL PLUS 100ML BOTTLE',
      productCode: '005501350',
      oldDiscount: '20%',
      newDiscount: '15%',
      rcCount: 2,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {discountUpdates.map((item) => (
        <View key={item.id} style={styles.updateCard}>
          <TouchableOpacity 
            style={styles.checkbox}
            onPress={() => onItemSelect(item.id)}
          >
            <Icon 
              name={selectedItems.includes(item.id) || selectedItems.includes('all') ? "check-box" : "check-box-outline-blank"} 
              size={24} 
              color={selectedItems.includes(item.id) || selectedItems.includes('all') ? colors.primary : colors.textSecondary} 
            />
          </TouchableOpacity>

          <View style={styles.cardContent}>
            <Text style={styles.productName}>{item.productName}</Text>
            <Text style={styles.productCode}>{item.productCode}</Text>

            <View style={styles.discountRow}>
              <View style={styles.discountItem}>
                <Text style={styles.discountLabel}>Old Discount</Text>
                <Text style={styles.discountValue}>{item.oldDiscount}</Text>
              </View>
              <View style={styles.discountItem}>
                <Text style={styles.discountLabel}>New Discount</Text>
                <Text style={styles.discountValue}>{item.newDiscount}</Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={styles.rcButton}
                onPress={() => onProductClick(item)}
              >
                <Text style={styles.rcCount}>{item.rcCount} RC's</Text>
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
  updateCard: {
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
  cardContent: {
    flex: 1,
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
    marginBottom: 12,
  },
  discountRow: {
    flexDirection: 'row',
    gap: 60,
    marginBottom: 12,
  },
  discountItem: {
    flex: 1,
  },
  discountLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  discountValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
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

export default DiscountUpdateList;