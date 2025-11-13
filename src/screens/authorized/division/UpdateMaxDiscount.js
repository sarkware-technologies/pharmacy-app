import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../../styles/colors';
import { getDivisions, updateDivisionMargins } from '../../../api/division';
import { setLoading } from '../../../redux/slices/divisionSlice';
import {AppText,AppInput} from "../../../components"

const UpdateMaxDiscount = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.division || {});
  
  const [divisions, setDivisions] = useState([]);
  const [discountValues, setDiscountValues] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadDivisions();
  }, []);

  const loadDivisions = async () => {
    dispatch(setLoading(true));
    try {
      // Load all divisions for bulk update
      const data = await getDivisions(1, 100); // Load more divisions
      const divisionsData = data.divisions || [];
      setDivisions(divisionsData);
      
      // Initialize discount values
      const initialValues = {};
      divisionsData.forEach(div => {
        initialValues[div.divisionId] = {
          doctor: div.divisionMargin?.doctorMargin || div.ceoMargin?.doctorMargin || 10,
          hospital: div.divisionMargin?.hospitalMargin || div.ceoMargin?.hospitalMargin || 15,
        };
      });
      setDiscountValues(initialValues);
    } catch (error) {
      console.error('Error loading divisions:', error);
      Alert.alert('Error', 'Failed to load divisions');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleDiscountChange = (divisionId, type, value) => {
    // Only allow numbers
    const numValue = value.replace(/[^0-9]/g, '');
    
    setDiscountValues(prev => ({
      ...prev,
      [divisionId]: {
        ...prev[divisionId],
        [type]: numValue,
      },
    }));
  };

  const handleReset = () => {
    // Reset to original values
    const resetValues = {};
    divisions.forEach(div => {
      resetValues[div.divisionId] = {
        doctor: div.divisionMargin?.doctorMargin || div.ceoMargin?.doctorMargin || 10,
        hospital: div.divisionMargin?.hospitalMargin || div.ceoMargin?.hospitalMargin || 15,
      };
    });
    setDiscountValues(resetValues);
  };

  const handleUpdate = async () => {
    Alert.alert(
      'Confirm Update',
      'Are you sure you want to update the max discount for all divisions?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Update',
          onPress: async () => {
            setIsUpdating(true);
            try {
              // Update each division
              for (const division of divisions) {
                const values = discountValues[division.divisionId];
                await updateDivisionMargins(
                  [division.divisionId],
                  parseInt(values.doctor),
                  parseInt(values.hospital)
                );
              }
              
              Alert.alert('Success', 'Max discount updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              console.error('Error updating discounts:', error);
              Alert.alert('Error', 'Failed to update discounts');
            } finally {
              setIsUpdating(false);
            }
          }
        }
      ]
    );
  };

  const renderDivisionItem = (division) => (
    <View key={division.divisionId} style={styles.divisionRow}>
      <View style={styles.divisionInfo}>
        <AppText style={styles.divisionName}>{division.divisionName}</AppText>
        <AppText style={styles.divisionCode}>{division.divisionCode}</AppText>
      </View>
      
      <View style={styles.inputContainer}>
        <AppInput
          style={styles.input}
          value={discountValues[division.divisionId]?.doctor?.toString() || ''}
          onChangeText={(value) => handleDiscountChange(division.divisionId, 'doctor', value)}
          keyboardType="numeric"
          maxLength={3}
          placeholder="0"
        />
        <AppText style={styles.percentSign}>%</AppText>
      </View>
      
      <View style={styles.inputContainer}>
        <AppInput
          style={styles.input}
          value={discountValues[division.divisionId]?.hospital?.toString() || ''}
          onChangeText={(value) => handleDiscountChange(division.divisionId, 'hospital', value)}
          keyboardType="numeric"
          maxLength={3}
          placeholder="0"
        />
        <AppText style={styles.percentSign}>%</AppText>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>Update Max Discount</AppText>
      </View>

      <View style={styles.tableHeader}>
        <AppText style={styles.headerLabel}>Name</AppText>
        <AppText style={styles.headerLabel}>For Doctor</AppText>
        <AppText style={styles.headerLabel}>For Hospital</AppText>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {divisions.map(renderDivisionItem)}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={handleReset}
        >
          <AppText style={styles.resetButtonText}>Reset</AppText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.updateButton}
          onPress={handleUpdate}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <AppText style={styles.updateButtonText}>Update</AppText>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerLabel: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  divisionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
  },
  divisionInfo: {
    flex: 1,
  },
  divisionName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  divisionCode: {
    fontSize: 13,
    color: '#999',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#fff',
    minWidth: 70,
    textAlign: 'center',
  },
  percentSign: {
    marginLeft: 8,
    fontSize: 15,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  updateButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UpdateMaxDiscount;