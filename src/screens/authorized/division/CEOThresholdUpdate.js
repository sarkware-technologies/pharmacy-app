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

const CEOThresholdUpdate = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.division || {});
  
  const [divisions, setDivisions] = useState([]);
  const [thresholdValues, setThresholdValues] = useState({});
  const [globalValues, setGlobalValues] = useState({ doctor: '10', hospital: '15' });
  const [divisionCount, setDivisionCount] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadDivisions();
  }, []);

  const loadDivisions = async () => {
    dispatch(setLoading(true));
    try {
      // Load all divisions for bulk update
      const data = await getDivisions(1, 100);
      const divisionsData = data.divisions || [];
      setDivisions(divisionsData);
      setDivisionCount(divisionsData.length);
      
      // Initialize threshold values with CEO margins
      const initialValues = {};
      divisionsData.forEach(div => {
        initialValues[div.divisionId] = {
          doctor: div.ceoMargin?.doctorMargin || 10,
          hospital: div.ceoMargin?.hospitalMargin || 15,
        };
      });
      setThresholdValues(initialValues);
    } catch (error) {
      console.error('Error loading divisions:', error);
      Alert.alert('Error', 'Failed to load divisions');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleGlobalChange = (type, value) => {
    // Only allow numbers
    const numValue = value.replace(/[^0-9]/g, '');
    
    setGlobalValues(prev => ({
      ...prev,
      [type]: numValue,
    }));

    // Update all divisions with the global value
    const updatedValues = {};
    divisions.forEach(div => {
      updatedValues[div.divisionId] = {
        ...thresholdValues[div.divisionId],
        [type]: numValue,
      };
    });
    setThresholdValues(updatedValues);
  };

  const handleThresholdChange = (divisionId, type, value) => {
    // Only allow numbers
    const numValue = value.replace(/[^0-9]/g, '');
    
    setThresholdValues(prev => ({
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
        doctor: div.ceoMargin?.doctorMargin || 10,
        hospital: div.ceoMargin?.hospitalMargin || 15,
      };
    });
    setThresholdValues(resetValues);
    setGlobalValues({ doctor: '10', hospital: '15' });
  };

  const handleUpdate = async () => {
    Alert.alert(
      'Confirm Update',
      "Are you sure you want to update the CEO's threshold for all divisions?",
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Update',
          onPress: async () => {
            setIsUpdating(true);
            try {
              // Update each division with CEO threshold
              for (const division of divisions) {
                const values = thresholdValues[division.divisionId];
                await updateDivisionMargins(
                  [division.divisionId],
                  parseInt(values.doctor),
                  parseInt(values.hospital)
                );
              }
              
              Alert.alert('Success', "CEO's threshold updated successfully", [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              console.error('Error updating thresholds:', error);
              Alert.alert('Error', 'Failed to update thresholds');
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
        <Text style={styles.divisionName}>{division.divisionName}</Text>
        <Text style={styles.divisionCode}>{division.divisionCode}</Text>
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={thresholdValues[division.divisionId]?.doctor?.toString() || ''}
          onChangeText={(value) => handleThresholdChange(division.divisionId, 'doctor', value)}
          keyboardType="numeric"
          maxLength={3}
          placeholder="0"
        />
        <Text style={styles.percentSign}>%</Text>
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={thresholdValues[division.divisionId]?.hospital?.toString() || ''}
          onChangeText={(value) => handleThresholdChange(division.divisionId, 'hospital', value)}
          keyboardType="numeric"
          maxLength={3}
          placeholder="0"
        />
        <Text style={styles.percentSign}>%</Text>
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
        <Text style={styles.headerTitle}>CEO's Threshold</Text>
      </View>

      <View style={styles.globalUpdateSection}>
        <View style={styles.globalHeader}>
          <Text style={styles.globalTitle}>Update For All Divisions</Text>
          <Text style={styles.divisionCountBadge}>{divisionCount}</Text>
        </View>
        
        <View style={styles.globalInputRow}>
          <Text style={styles.globalLabel}>For Doctor</Text>
          <View style={styles.globalInputContainer}>
            <TextInput
              style={styles.globalInput}
              value={globalValues.doctor}
              onChangeText={(value) => handleGlobalChange('doctor', value)}
              keyboardType="numeric"
              maxLength={3}
              placeholder="0"
            />
            <Text style={styles.percentSign}>%</Text>
          </View>
          
          <Text style={styles.globalLabel}>For Hospital</Text>
          <View style={styles.globalInputContainer}>
            <TextInput
              style={styles.globalInput}
              value={globalValues.hospital}
              onChangeText={(value) => handleGlobalChange('hospital', value)}
              keyboardType="numeric"
              maxLength={3}
              placeholder="0"
            />
            <Text style={styles.percentSign}>%</Text>
          </View>
        </View>
      </View>

      <View style={styles.tableHeader}>
        <Text style={styles.headerLabel}>Name</Text>
        <Text style={styles.headerLabel}>For Doctor</Text>
        <Text style={styles.headerLabel}>For Hospital</Text>
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
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.updateButton}
          onPress={handleUpdate}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.updateButtonText}>Update</Text>
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
  globalUpdateSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  globalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  globalTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  divisionCountBadge: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  globalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  globalLabel: {
    fontSize: 14,
    color: '#666',
  },
  globalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  globalInput: {
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
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    marginTop: 8,
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

export default CEOThresholdUpdate;