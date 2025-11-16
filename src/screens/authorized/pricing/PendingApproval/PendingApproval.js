import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors } from '../../../../styles/colors';
import AddProductApproval from './AddProduct/AddProductApproval';
import ProductSwapping from './ProductSwapping/ProductSwapping';
import DiscountUpdate from './DiscountUpdate/DiscountUpdate';

const PendingApproval = () => {
  const [activeSubTab, setActiveSubTab] = useState('Add Product');
  
  const subTabs = [
    'New RC',
    'RC Renewal',
    'Validity Extension',
    'Add Product',
    'Product Swapping',
    'Discount Update'
  ];

  const renderContent = () => {
    switch (activeSubTab) {
      case 'Add Product':
        return <AddProductApproval />;
      case 'New RC':
        return (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>New RC View Coming Soon</Text>
          </View>
        );
      case 'RC Renewal':
        return (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>RC Renewal View Coming Soon</Text>
          </View>
        );
      case 'Validity Extension':
        return (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Validity Extension View Coming Soon</Text>
          </View>
        );
      case 'Product Swapping':
        return <ProductSwapping />;
      case 'Discount Update':
        return <DiscountUpdate />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Sub Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.subTabContainer}
      >
        {subTabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.subTab,
              activeSubTab === tab && styles.activeSubTab
            ]}
            onPress={() => setActiveSubTab(tab)}
          >
            <Text style={[
              styles.subTabText,
              activeSubTab === tab && styles.activeSubTabText
            ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  subTabContainer: {
    backgroundColor: colors.white,
    paddingVertical: 8,
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  subTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  activeSubTab: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  subTabText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeSubTabText: {
    color: colors.white,
  },
  content: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});

export default PendingApproval;