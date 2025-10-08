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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../styles/colors';
import ChevronLeft from '../../../components/icons/ChevronLeft';

const { width } = Dimensions.get('window');

const RegistrationType = () => {
  const navigation = useNavigation();
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  
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
  }, []);

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
    setSelectedCategory('');
    setSelectedSubCategory('');
    
    // Reset animations for category and subcategory
    categoryFadeAnim.setValue(0);
    categorySlideAnim.setValue(30);
    subCategoryFadeAnim.setValue(0);
    subCategorySlideAnim.setValue(30);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedSubCategory('');
    
    // Reset subcategory animation
    subCategoryFadeAnim.setValue(0);
    subCategorySlideAnim.setValue(30);
  };

  const handleSubCategorySelect = (subCategory) => {
    setSelectedSubCategory(subCategory);
  };

  const handleContinue = () => {
    if (selectedType && (!needsCategory() || (selectedCategory && (!needsSubCategory() || selectedSubCategory)))) {
      // Navigate to appropriate form based on selection
      if (selectedType === 'Hospital' && selectedCategory === 'Private' && selectedSubCategory === 'Clinic') {
        navigation.navigate('ClinicRegistrationForm');
      } else if (selectedType === 'Hospital') {
        navigation.navigate('ClinicRegistrationForm', {
          category: selectedCategory,
          subCategory: selectedSubCategory,
        });
      } else if (selectedType === 'Pharmacy') {
        navigation.navigate('ClinicRegistrationForm', {
          type: 'Pharmacy',
          subCategory: selectedSubCategory,
        });
      } else if (selectedType === 'Doctor') {
        navigation.navigate('ClinicRegistrationForm', {
          type: 'Doctor',
        });
      }
    }
  };

  const needsCategory = () => {
    return selectedType === 'Hospital';
  };

  const needsSubCategory = () => {
    if (selectedType === 'Hospital') return true;
    if (selectedType === 'Pharmacy') return true;
    return false;
  };

  const getSubCategories = () => {
    if (selectedType === 'Hospital') {
      if (selectedCategory === 'Private') {
        return ['Clinic', 'Individual Hospital', 'Group Hospital/CBU'];
      } else if (selectedCategory === 'Govt') {
        return ['District Hospital', 'Medical College', 'PHC'];
      }
    } else if (selectedType === 'Pharmacy') {
      return ['Only Retail', 'Only Wholesaler', 'Retail Cum Wholesaler'];
    }
    return [];
  };

  const TypeButton = ({ type, label, isSelected }) => {
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
            {label}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

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
              <TypeButton
                type="Pharmacy"
                label="Pharmacy/Chemist/Medical store"
                isSelected={selectedType === 'Pharmacy'}
              />
              <TypeButton
                type="Hospital"
                label="Hospital"
                isSelected={selectedType === 'Hospital'}
              />
              <TypeButton
                type="Doctor"
                label="Doctors"
                isSelected={selectedType === 'Doctor'}
              />
            </View>
          </View>

          {/* Category Selection - Only for Hospital */}
          {selectedType === 'Hospital' && (
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
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    selectedCategory === 'Private' && styles.selectedCategoryButton,
                  ]}
                  onPress={() => handleCategorySelect('Private')}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    selectedCategory === 'Private' && styles.selectedCategoryButtonText,
                  ]}>
                    Private
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    selectedCategory === 'Govt' && styles.selectedCategoryButton,
                  ]}
                  onPress={() => handleCategorySelect('Govt')}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    selectedCategory === 'Govt' && styles.selectedCategoryButtonText,
                  ]}>
                    Govt
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {/* SubCategory Selection */}
          {((selectedType === 'Hospital' && selectedCategory) || selectedType === 'Pharmacy') && (
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
                {getSubCategories().map((subCat, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.subCategoryButton,
                      selectedSubCategory === subCat && styles.selectedSubCategoryButton,
                    ]}
                    onPress={() => handleSubCategorySelect(subCat)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.subCategoryButtonText,
                      selectedSubCategory === subCat && styles.selectedSubCategoryButtonText,
                    ]}>
                      {subCat}
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
        (!needsSubCategory() || selectedSubCategory) ||
        selectedType === 'Doctor'
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
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    marginBottom: 12,
  },
  selectedTypeButton: {
    borderColor: colors.primary,
    backgroundColor: '#FFF5ED',
  },
  typeButtonText: {
    fontSize: 16,
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  selectedCategoryButton: {
    borderColor: colors.primary,
    backgroundColor: '#FFF5ED',
  },
  categoryButtonText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  selectedCategoryButtonText: {
    color: colors.primary,
    fontWeight: '500',
  },
  subCategoryContainer: {
    gap: 12,
  },
  subCategoryButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  selectedSubCategoryButton: {
    borderColor: colors.primary,
    backgroundColor: '#FFF5ED',
  },
  subCategoryButtonText: {
    fontSize: 16,
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
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
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
});

export default RegistrationType;