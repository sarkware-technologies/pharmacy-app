// src/screens/authorized/registration/RegistrationType.js

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../../styles/colors';
import ChevronLeft from '../../../components/icons/ChevronLeft';
import {
  fetchCustomerTypes,
  selectCustomerTypes,
} from '../../../redux/slices/customerSlice';

const { width } = Dimensions.get('window');

const RegistrationType = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  // Redux state
  const customerTypes = useSelector(selectCustomerTypes);
  const { typesLoading, typesError } = useSelector((state) => ({
    typesLoading: state.customer.typesLoading,
    typesError: state.customer.typesError,
  }));  
  
  // Local state - store the actual objects instead of just strings
  const [selectedType, setSelectedType] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  // Category and subcategory animation values
  const categoryFadeAnim = useRef(new Animated.Value(0)).current;
  const categorySlideAnim = useRef(new Animated.Value(30)).current;
  const subCategoryFadeAnim = useRef(new Animated.Value(0)).current;
  const subCategorySlideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Fetch customer types when component mounts
    dispatch(fetchCustomerTypes());
    
    // Entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [dispatch]);

  useEffect(() => {
    if (selectedType) {
      // Animate category section
      Animated.parallel([
        Animated.timing(categoryFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(categorySlideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [selectedType]);

  useEffect(() => {
    if (selectedCategory) {
      // Animate subcategory section
      Animated.parallel([
        Animated.timing(subCategoryFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(subCategorySlideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [selectedCategory]);

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    
    // Reset animations for category and subcategory
    categoryFadeAnim.setValue(0);
    categorySlideAnim.setValue(30);
    subCategoryFadeAnim.setValue(0);
    subCategorySlideAnim.setValue(30);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedSubCategory(null);
    
    // Reset subcategory animation
    subCategoryFadeAnim.setValue(0);
    subCategorySlideAnim.setValue(30);
  };

  const handleSubCategorySelect = (subCategory) => {
    setSelectedSubCategory(subCategory);
  };

  const handleContinue = () => {
    if (selectedType && (!needsCategory() || (selectedCategory && (!needsSubCategory() || selectedSubCategory)))) {
      // Navigate with the selected data
      const navigationParams = {
        type: selectedType.code,
        typeName: selectedType.name,
        typeId: selectedType.id,
      };

      if (selectedCategory) {
        navigationParams.category = selectedCategory.code;
        navigationParams.categoryName = selectedCategory.name;
        navigationParams.categoryId = selectedCategory.id;
      }

      if (selectedSubCategory) {
        navigationParams.subCategory = selectedSubCategory.code;
        navigationParams.subCategoryName = selectedSubCategory.name;
        navigationParams.subCategoryId = selectedSubCategory.id;
      }

      // Navigate to appropriate form based on selection
      if (selectedType.code === 'HOSP' && selectedCategory?.code === 'PRI' && 
        (selectedSubCategory?.code === 'PCL' || selectedSubCategory?.code === 'PIH' || selectedSubCategory?.code === 'PGH')) {
        navigation.navigate('PrivateRegistrationForm', navigationParams);
      } else if (selectedType.code === 'HOSP' && selectedCategory?.code === 'GOV') {
        navigation.navigate('PrivateRegistrationForm', navigationParams);
      } else if (selectedType.code === 'DOCT') {
        navigation.navigate('DoctorRegistrationForm', navigationParams);
      } else if (selectedType.code === 'PCM' && selectedCategory?.code === 'OR') {
        navigation.navigate('PharmacyRetailerForm', navigationParams);
      } else if (selectedType.code === 'PCM' && selectedCategory?.code === 'OW') {
        navigation.navigate('PharmacyWholesalerForm', navigationParams);
      } else if (selectedType.code === 'PCM' && selectedCategory?.code === 'RCW') {
        navigation.navigate('PharmacyWholesalerRetailerForm', navigationParams);
      }
    }
  };

  const needsCategory = () => {
    return selectedType?.customerCategories?.length > 0;
  };

  const needsSubCategory = () => {
    return selectedCategory?.customerSubcategories?.length > 0;
  };

  const getCategories = () => {
    return selectedType?.customerCategories || [];
  };

  const getSubCategories = () => {
    return selectedCategory?.customerSubcategories || [];
  };

  const TypeButton = ({ type, isSelected }) => {
    const buttonScale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(buttonScale, {
        toValue: 0.95,
        friction: 3,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            isSelected && styles.selectedTypeButton,
          ]}
          onPress={() => handleTypeSelect(type)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.typeButtonText,
            isSelected && styles.selectedTypeButtonText,
          ]}>
            {type.name}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (typesLoading && (!customerTypes || customerTypes.length === 0)) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ChevronLeft />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Registration</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (typesError) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ChevronLeft />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Registration</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading customer types</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => dispatch(fetchCustomerTypes())}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >          
          <ChevronLeft />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registration</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          {/* Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Type <Text style={styles.subtitle}>(Select Any One)</Text></Text>
            <View style={styles.typeContainer}>
              {customerTypes && customerTypes.length > 0 ? (
                customerTypes.map((type) => (
                  <TypeButton
                    key={type.id}
                    type={type}
                    isSelected={selectedType?.id === type.id}
                  />
                ))
              ) : (
                <Text style={styles.noDataText}>No customer types available</Text>
              )}
            </View>
          </View>

          {/* Category Selection */}
          {needsCategory() && (
            <Animated.View
              style={[
                styles.section,
                {
                  opacity: categoryFadeAnim,
                  transform: [{ translateY: categorySlideAnim }],
                },
              ]}
            >
              <Text style={styles.sectionTitle}>
                Category <Text style={styles.subtitle}>(Select Any One)</Text>
              </Text>
              <View style={styles.categoryContainer}>
                {getCategories().map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      selectedCategory?.id === category.id && styles.selectedCategoryButton,
                    ]}
                    onPress={() => handleCategorySelect(category)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      selectedCategory?.id === category.id && styles.selectedCategoryButtonText,
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          )}

          {/* SubCategory Selection */}
          {needsSubCategory() && (
            <Animated.View
              style={[
                styles.section,
                {
                  opacity: subCategoryFadeAnim,
                  transform: [{ translateY: subCategorySlideAnim }],
                },
              ]}
            >
              <Text style={styles.sectionTitle}>Sub Category</Text>
              <View style={styles.subCategoryContainer}>
                {getSubCategories().map((subCat) => (
                  <TouchableOpacity
                    key={subCat.id}
                    style={[
                      styles.subCategoryButton,
                      selectedSubCategory?.id === subCat.id && styles.selectedSubCategoryButton,
                    ]}
                    onPress={() => handleSubCategorySelect(subCat)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.subCategoryButtonText,
                      selectedSubCategory?.id === subCat.id && styles.selectedSubCategoryButtonText,
                    ]}>
                      {subCat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Continue Button */}
      {selectedType && (
        (!needsCategory() || selectedCategory) && 
        (!needsSubCategory() || selectedSubCategory)
      ) && (
        <Animated.View
          style={[
            styles.bottomContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#999',
  },
  typeContainer: {
    gap: 12,
  },
  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3E3E3',
    backgroundColor: '#FAFAFA',
    marginBottom: 12,    
  },
  selectedTypeButton: {
    borderColor: colors.primary,
    backgroundColor: '#FFF5ED',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  selectedTypeButtonText: {
    color: colors.primary,
    fontWeight: '500',
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3E3E3',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectedCategoryButton: {
    borderColor: colors.primary,
    backgroundColor: '#FFF5ED',
    
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    verticalAlign: 'middle'    
  },
  selectedCategoryButtonText: {
    color: colors.primary,
    fontWeight: '500',
  },
  subCategoryContainer: {
    gap: 12,
  },
  subCategoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3E3E3',
    backgroundColor: '#FAFAFA',
  },
  selectedSubCategoryButton: {
    borderColor: colors.primary,
    backgroundColor: '#FFF5ED',
  },
  subCategoryButtonText: {
    fontSize: 14,
    color: '#666',
  },
  selectedSubCategoryButtonText: {
    color: colors.primary,
    fontWeight: '500',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',    
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default RegistrationType;