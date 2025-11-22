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
import AppText from "../../../components/AppText"
import RegistrationFormRouter from "../../../components/RegistrationFormRouter";

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
  const [formSubmitted, setFormSubmitted] = useState(false);
  
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
    // If clicking the same type, toggle it off (allow deselection)
    if (selectedType?.id === type.id) {
      setSelectedType(null);
      setSelectedCategory(null);
      setSelectedSubCategory(null);
      setFormSubmitted(false);
      
      // Reset animations
      categoryFadeAnim.setValue(0);
      categorySlideAnim.setValue(30);
      subCategoryFadeAnim.setValue(0);
      subCategorySlideAnim.setValue(30);
    } else {
      // Different type selected
      setSelectedType(type);
      setSelectedCategory(null);
      setSelectedSubCategory(null);
      setFormSubmitted(false);
      
      // Reset animations for category and subcategory
      categoryFadeAnim.setValue(0);
      categorySlideAnim.setValue(30);
      subCategoryFadeAnim.setValue(0);
      subCategorySlideAnim.setValue(30);

      // If type doesn't need category, mount form immediately
      if (!type?.customerCategories?.length) {
        setFormSubmitted(true);
      }
    }
  };

  const handleCategorySelect = (category) => {
    // If clicking the same category, toggle it off (allow deselection)
    if (selectedCategory?.id === category.id) {
      setSelectedCategory(null);
      setSelectedSubCategory(null);
      setFormSubmitted(false);
      
      // Reset subcategory animation
      subCategoryFadeAnim.setValue(0);
      subCategorySlideAnim.setValue(30);
    } else {
      // Different category selected
      setSelectedCategory(category);
      setSelectedSubCategory(null);
      
      // Reset subcategory animation
      subCategoryFadeAnim.setValue(0);
      subCategorySlideAnim.setValue(30);

      // If category doesn't need subcategory, mount form immediately
      if (!category?.customerSubcategories?.length) {
        setFormSubmitted(true);
      } else {
        // Reset form submission if subcategory is needed
        setFormSubmitted(false);
      }
    }
  };

  const handleSubCategorySelect = (subCategory) => {
    // If clicking the same subcategory, toggle it off (allow deselection)
    if (selectedSubCategory?.id === subCategory.id) {
      setSelectedSubCategory(null);
      setFormSubmitted(false);
    } else {
      // Different subcategory selected
      setSelectedSubCategory(subCategory);
      // Mount form immediately when subcategory is selected
      setFormSubmitted(true);
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

  // Helper function to clean up display names by removing "Private - " prefix
  const cleanDisplayName = (name) => {
    if (!name) return name;
    return name.replace(/^Private\s*-\s*/i, '').trim();
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
          <AppText style={[
            styles.typeButtonText,
            isSelected && styles.selectedTypeButtonText,
          ]}>
            {type.name}
          </AppText>
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
          <AppText style={styles.headerTitle}>Registration</AppText>
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
          <AppText style={styles.headerTitle}>Registration</AppText>
        </View>
        <View style={styles.errorContainer}>
          <AppText style={styles.errorText}>Error loading customer types</AppText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => dispatch(fetchCustomerTypes())}
          >
            <AppText style={styles.retryButtonText}>Retry</AppText>
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
        <AppText style={styles.headerTitle}>Registration</AppText>
      </View>

      {/* Selection Section - Always visible at top */}
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
            <AppText style={styles.sectionTitle}>Type <AppText style={styles.subtitle}>(Select Any One)</AppText></AppText>
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
                <AppText style={styles.noDataText}>No customer types available</AppText>
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
              <AppText style={styles.sectionTitle}>
                Category <AppText style={styles.subtitle}>(Select Any One)</AppText>
              </AppText>
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
                    <AppText style={[
                      styles.categoryButtonText,
                      selectedCategory?.id === category.id && styles.selectedCategoryButtonText,
                    ]}>
                      {category.name}
                    </AppText>
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
              <AppText style={styles.sectionTitle}>Sub Category</AppText>
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
                    <AppText style={[
                      styles.subCategoryButtonText,
                      selectedSubCategory?.id === subCat.id && styles.selectedSubCategoryButtonText,
                    ]}>
                      {cleanDisplayName(subCat.name)}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Dynamic Form Router - Shows below selections */}
          {formSubmitted && selectedType && (
            (!needsCategory() || selectedCategory) && 
            (!needsSubCategory() || selectedSubCategory)
          ) && (
            <View style={styles.formSection}>
              <RegistrationFormRouter
                selectedType={selectedType}
                selectedCategory={selectedCategory}
                selectedSubCategory={selectedSubCategory}
                navigation={navigation}
                onChangeSelection={() => {
                  // Go back to selection screen
                  setFormSubmitted(false);
                }}
              />
            </View>
          )}
        </Animated.View>
      </ScrollView>
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
    paddingBottom: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  section: {
    marginBottom: 12,
  },
  formSection: {
    marginTop: -10,
    marginBottom: 12,
    flex: 1,
    minHeight: 400,
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
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  typeButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3E3E3',
    backgroundColor: '#FAFAFA',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedTypeButton: {
    borderColor: colors.primary,
    backgroundColor: '#fef4e8',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    flexWrap: 'nowrap',
  },
  selectedTypeButtonText: {
    color: '#111',
    fontWeight: '500',
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  categoryButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3E3E3',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCategoryButton: {
    borderColor: colors.primary,
    backgroundColor: '#fef4e8',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
    flexWrap: 'nowrap',
  },
  selectedCategoryButtonText: {
    color: '#111',
    fontWeight: '500',
  },
  subCategoryContainer: {
    gap: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  subCategoryButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3E3E3',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedSubCategoryButton: {
    borderColor: colors.primary,
    backgroundColor: '#fef4e8',
  },
  subCategoryButtonText: {
    fontSize: 14,
    color: '#666',
    flexWrap: 'nowrap',
  },
  selectedSubCategoryButtonText: {
    color: '#111',
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