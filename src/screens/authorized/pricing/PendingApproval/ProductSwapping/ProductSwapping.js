import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../../../styles/colors';
import ProductSwappingList from './ProductSwappingList';
import ProductSwappingDetail from './ProductSwappingDetail';
import Toast from '../AddProduct/Toast';

const ProductSwapping = () => {
  const [currentView, setCurrentView] = useState('list'); // list, detail
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const handleSwapClick = (swap) => {
    setSelectedSwap(swap);
    setCurrentView('detail');
  };

  const handleBack = () => {
    setCurrentView('list');
  };

  const handleApprove = () => {
    setToastMessage('Product Swapping has been approved!');
    setShowToast(true);
    setCurrentView('list');
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleUpdate = () => {
    setToastMessage('Rate Contract has been successfully updated!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedItems(['all']);
    } else {
      setSelectedItems([]);
    }
  };

  const toggleItemSelect = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  if (currentView === 'detail') {
    return (
      <ProductSwappingDetail
        swap={selectedSwap}
        onBack={handleBack}
        onApprove={handleApprove}
        onUpdate={handleUpdate}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <StatusBar backgroundColor="#F6F6F6" barStyle="dark-content" />

      {/* Select All Checkbox */}
      <TouchableOpacity style={styles.selectAllRow} onPress={toggleSelectAll}>
        <View style={styles.checkboxContainer}>
          <Icon 
            name={selectAll ? "check-box" : "check-box-outline-blank"} 
            size={24} 
            color={selectAll ? colors.primary : colors.textSecondary} 
          />
          <Text style={styles.selectAllText}>Select all</Text>
        </View>
      </TouchableOpacity>

      {/* Product Swapping List */}
      <ProductSwappingList
        selectedItems={selectedItems}
        onItemSelect={toggleItemSelect}
        onSwapClick={handleSwapClick}
      />

      {/* Toast Message */}
      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onDismiss={() => setShowToast(false)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: colors.white,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  activeActionButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actionButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeActionButtonText: {
    color: colors.white,
  },
  selectAllRow: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectAllText: {
    fontSize: 14,
    color: colors.text,
  },
});

export default ProductSwapping;