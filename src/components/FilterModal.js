import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  TextInput,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../styles/colors';

const { height } = Dimensions.get('window');

const FilterModal = ({ visible, onClose, onApply }) => {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const [filters, setFilters] = useState({
    category: ['All', 'Pharmacists in hospitals', 'Hospitals', 'Doctors'],
    subCategory: [],
    status: [],
    state: '',
    city: '',
  });
  
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    subCategory: false,
    status: false,
    state: false,
    city: false,
  });

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const toggleSection = (section) => {
    const rotateAnim = new Animated.Value(expandedSections[section] ? 1 : 0);
    
    Animated.spring(rotateAnim, {
      toValue: expandedSections[section] ? 0 : 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
    
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleFilter = (section, value) => {
    setFilters(prev => {
      if (section === 'category' || section === 'subCategory' || section === 'status') {
        const current = prev[section];
        const index = current.indexOf(value);
        if (index > -1) {
          return {
            ...prev,
            [section]: current.filter(item => item !== value),
          };
        } else {
          return {
            ...prev,
            [section]: [...current, value],
          };
        }
      }
      return prev;
    });
  };

  const clearFilters = () => {
    const clearAnim = new Animated.Value(1);
    
    Animated.sequence([
      Animated.timing(clearAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(clearAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setFilters({
        category: [],
        subCategory: [],
        status: [],
        state: '',
        city: '',
      });
    });
  };

  const applyFilters = () => {
    const bounceAnim = new Animated.Value(1);
    
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onApply(filters);
      onClose();
    });
  };

  const FilterSection = ({ title, section, options, multiSelect = false }) => {
    const sectionAnim = useRef(new Animated.Value(0)).current;
    const isExpanded = expandedSections[section];
    
    useEffect(() => {
      Animated.timing(sectionAnim, {
        toValue: isExpanded ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }, [isExpanded]);

    return (
      <View style={styles.filterSection}>
        <TouchableOpacity 
          style={styles.sectionHeader}
          onPress={() => toggleSection(section)}
          activeOpacity={0.7}
        >
          <Text style={styles.sectionTitle}>{title}</Text>
          <Animated.View
            style={{
              transform: [
                {
                  rotate: sectionAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg'],
                  }),
                },
              ],
            }}
          >
            <Icon name="chevron-down" size={20} color="#666" />
          </Animated.View>
        </TouchableOpacity>
        
        {isExpanded && (
          <Animated.View
            style={[
              styles.sectionContent,
              {
                opacity: sectionAnim,
                maxHeight: sectionAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 500],
                }),
              },
            ]}
          >
            {section === 'state' || section === 'city' ? (
              <TextInput
                style={styles.textInput}
                placeholder={`Enter ${title}`}
                value={filters[section]}
                onChangeText={(text) => setFilters(prev => ({ ...prev, [section]: text }))}
                placeholderTextColor="#999"
              />
            ) : (
              <View style={styles.optionsContainer}>
                {options?.map((option, index) => {
                  const isSelected = filters[section]?.includes(option);
                  return (
                    <TouchableOpacity
                      key={index}
                      style={styles.optionItem}
                      onPress={() => toggleFilter(section, option)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                        {isSelected && <Icon name="checkmark" size={16} color="#fff" />}
                      </View>
                      <Text style={styles.optionText}>{option}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </Animated.View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View 
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity 
          style={styles.overlayTouch}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close-circle-outline" size={28} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={styles.filterContainer}
            showsVerticalScrollIndicator={false}
          >
            <FilterSection
              title="Category"
              section="category"
              options={['All', 'Pharmacists in hospitals', 'Hospitals', 'Doctors']}
              multiSelect={true}
            />
            
            <FilterSection
              title="Sub-Category"
              section="subCategory"
              options={['Pharmacy', 'Clinic', 'Laboratory']}
              multiSelect={true}
            />
            
            <FilterSection
              title="Status"
              section="status"
              options={['Active', 'Inactive', 'Pending']}
              multiSelect={true}
            />
            
            <FilterSection
              title="State"
              section="state"
            />
            
            <FilterSection
              title="City"
              section="city"
            />
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={clearFilters}
              activeOpacity={0.7}
            >
              <Text style={styles.clearButtonText}>Clear filter</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={applyFilters}
              activeOpacity={0.7}
            >
              <Text style={styles.applyButtonText}>Apply filter</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTouch: {
    flex: 1,
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.85,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  filterContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  filterSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  sectionContent: {
    overflow: 'hidden',
  },
  optionsContainer: {
    paddingTop: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 15,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 12,
    fontSize: 15,
    color: '#333',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default FilterModal;