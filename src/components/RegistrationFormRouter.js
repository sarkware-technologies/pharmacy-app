import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import RegistrationFormWrapper from './RegistrationFormWrapper';

/**
 * Smart registration form router that dynamically loads the correct form
 * based on Type, Category, and Sub Category selections
 */
const RegistrationFormRouter = ({
  selectedType,
  selectedCategory,
  selectedSubCategory,
  navigation,
  onChangeSelection,
}) => {
  // Force remount when selections change
  const [key, setKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Show loader when selections change
    setIsLoading(true);
    // Increment key to force remount of the form component
    setKey(prev => prev + 1);
    
    // Hide loader after a short delay to allow form to render
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [selectedType?.id, selectedCategory?.id, selectedSubCategory?.id]);
  // Helper function to get form component based on selections
  const getFormComponent = () => {
    if (!selectedType) {
      return null;
    }

    const typeId = selectedType?.id;
    const typeName = selectedType?.name?.toLowerCase();
    const categoryId = selectedCategory?.id;
    const categoryName = selectedCategory?.name?.toLowerCase();
    const subCategoryId = selectedSubCategory?.id;
    const subCategoryName = selectedSubCategory?.name?.toLowerCase();

    // Pharmacy/Chemist/Medical Store forms
    if (typeName?.includes('pharmacy') || typeName?.includes('chemist') || typeName?.includes('medical')) {
      console.log(categoryName, "categoryNamecategoryNamecategoryName")
      if (categoryName == 'only retail') {
        return 'PharmacyRetailer';
      } else if (categoryName == 'only wholesaler') {
        return 'PharmacyWholesaler';
      } else if (categoryName == 'retail cum wholesaler') {
        return 'PharmacyWholesalerRetailer';
      }
    }

    // Hospital forms
    if (typeName?.includes('hospital')) {
      if (categoryName?.includes('govt')) {
        return 'GovtHospitalRegistrationForm';
      } else if (categoryName?.includes('private')) {
        // For private hospitals, check sub category
        if (subCategoryName?.includes('group')) {
          return 'GroupHospitalRegistrationForm';
        }
        return 'PrivateRegistration';
      }
      // Default hospital form
      return 'PrivateRegistration';
    }

    // Doctor forms
    if (typeName?.includes('doctor')) {
      return 'DoctorRegistrationForm';
    }

    return null;
  };

  const formComponent = getFormComponent();

  // Dynamically import and render the appropriate form
  const renderForm = () => {
    if (!formComponent) {
      return null;
    }

    // Map component names to actual imports
    const formMap = {
      'PharmacyRetailer': require('../screens/authorized/registration/PharmacyRetailer').default,
      'PharmacyWholesaler': require('../screens/authorized/registration/PharmacyWholesaler').default,
      'PharmacyWholesalerRetailer': require('../screens/authorized/registration/PharmacyWholesalerRetailer').default,
      'PrivateRegistration': require('../screens/authorized/registration/PrivateRegistration').default,
      'GroupHospitalRegistrationForm': require('../screens/authorized/registration/GroupHospitalRegistrationForm').default,
      'GovtHospitalRegistrationForm': require('../screens/authorized/registration/GovtHospitalRegistrationForm').default,
      'DoctorRegistrationForm': require('../screens/authorized/registration/DoctorRegistrationForm').default,
    };

    const FormComponent = formMap[formComponent];

    if (!FormComponent) {
      return null;
    }

    return (
      <RegistrationFormWrapper
        key={key}
        selectedType={selectedType}
        selectedCategory={selectedCategory}
        selectedSubCategory={selectedSubCategory}
        onChangeSelection={onChangeSelection}
      >
        <FormComponent
          key={key}
          selectedType={selectedType}
          selectedCategory={selectedCategory}
          selectedSubCategory={selectedSubCategory}
          navigation={navigation}
        />
      </RegistrationFormWrapper>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {isLoading && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          zIndex: 999,
        }}>
          <ActivityIndicator size="large" color="#FF8C42" />
        </View>
      )}
      {renderForm()}
    </View>
  );
};

export default RegistrationFormRouter;
