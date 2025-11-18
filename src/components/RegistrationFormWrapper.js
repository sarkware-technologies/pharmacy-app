import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppText from './AppText';

/**
 * Wrapper component that displays registration type info at the top of forms
 * and handles component remounting when selections change
 */
const RegistrationFormWrapper = ({
  selectedType,
  selectedCategory,
  selectedSubCategory,
  children,
  onChangeSelection,
}) => {
  // Generate display text based on selections
  const getDisplayText = () => {
    const parts = [];
    
    if (selectedType?.name) {
      parts.push(selectedType.name);
    }
    
    if (selectedCategory?.name) {
      parts.push(selectedCategory.name);
    }
    
    if (selectedSubCategory?.name) {
      parts.push(selectedSubCategory.name);
    }
    
    return parts.join(' • ');
  };

  // Get icon based on type
  const getIcon = () => {
    const typeName = selectedType?.name?.toLowerCase() || '';
    
    if (typeName.includes('pharmacy') || typeName.includes('chemist')) {
      return 'hospital-box';
    } else if (typeName.includes('hospital')) {
      return 'hospital-building';
    } else if (typeName.includes('doctor')) {
      return 'doctor';
    }
    
    return 'file-document';
  };

  return (
    <View style={styles.container}>
      {/* Hidden change selection handler - accessible internally */}
      <TouchableOpacity
        style={styles.hiddenChangeButton}
        onPress={onChangeSelection}
        activeOpacity={1}
      />

      {/* Form Content */}
      <View style={styles.formContainer}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  hiddenChangeButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 0,
    zIndex: -1,
  },
  formContainer: {
    flex: 1,
    padding: 0
  },
});

export default RegistrationFormWrapper;
