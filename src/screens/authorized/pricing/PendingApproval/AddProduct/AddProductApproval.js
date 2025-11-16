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
import ProductList from './ProductList';
import RCList from './RCList';
import RCDetails from './RCDetails';
import Toast from './Toast';

const AddProductApproval = () => {
  const [currentView, setCurrentView] = useState('productList'); // productList, rcList, rcDetails
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedRC, setSelectedRC] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setCurrentView('rcList');
  };

  const handleRCClick = (rc) => {
    setSelectedRC(rc);
    setCurrentView('rcDetails');
  };

  const handleApprove = () => {
    setCurrentView('productList');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleBack = () => {
    if (currentView === 'rcDetails') {
      setCurrentView('rcList');
    } else if (currentView === 'rcList') {
      setCurrentView('productList');
    }
  };

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      // Select all products logic
      setSelectedProducts(['all']);
    } else {
      setSelectedProducts([]);
    }
  };

  const toggleProductSelect = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  if (currentView === 'rcList') {
    return (
      <RCList
        product={selectedProduct}
        onBack={handleBack}
        onRCClick={handleRCClick}
      />
    );
  }

  if (currentView === 'rcDetails') {
    return (
      <RCDetails
        rc={selectedRC}
        product={selectedProduct}
        onBack={handleBack}
        onApprove={handleApprove}
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

      {/* Product List */}
      <ProductList
        searchText={searchText}
        selectedProducts={selectedProducts}
        onProductClick={handleProductClick}
        onProductSelect={toggleProductSelect}
      />

      {/* Toast Message */}
      {showToast && (
        <Toast
          message="Product has been approved!"
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

export default AddProductApproval;