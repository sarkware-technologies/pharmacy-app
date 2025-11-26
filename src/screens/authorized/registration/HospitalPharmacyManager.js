import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../styles/colors';
import { AppText } from '../../../components';

const HospitalPharmacyManager = ({ 
  hospitals = [], 
  onChange, 
  allowMultipleHospitals = false 
}) => {
  const navigation = useNavigation();
  const [expanded, setExpanded] = useState(false);

  const handleAddHospital = () => {
    navigation.navigate('HospitalSelector', {
      selectedHospitals: hospitals,
      onSelect: (selectedHospitals) => {
        // For single select, just replace with new selection
        // For multiple select, add to existing
        if (allowMultipleHospitals) {
          const newHospitals = selectedHospitals.map(hospital => ({
            ...hospital,
            pharmacies: hospital.pharmacies || []
          }));
          onChange([...hospitals, ...newHospitals.filter(
            newH => !hospitals.find(h => h.id === newH.id)
          )]);
        } else {
          if (selectedHospitals.length > 0) {
            onChange([{
              ...selectedHospitals[0],
              pharmacies: selectedHospitals[0].pharmacies || []
            }]);
          }
        }
      },
    });
  };

  const handleRemoveHospital = (hospitalId) => {
    onChange(hospitals.filter(h => h.id !== hospitalId));
  };

  const handleAddPharmacy = (hospitalId) => {
    navigation.navigate('PharmacySelector', {
      selectedPharmacies: hospitals.find(h => h.id === hospitalId)?.pharmacies || [],
      onSelect: (selectedPharmacies) => {
        onChange(hospitals.map(hospital => 
          hospital.id === hospitalId 
            ? { ...hospital, pharmacies: selectedPharmacies }
            : hospital
        ));
      },
    });
  };

  const handleRemovePharmacy = (hospitalId, pharmacyId) => {
    onChange(hospitals.map(hospital => 
      hospital.id === hospitalId
        ? {
            ...hospital,
            pharmacies: hospital.pharmacies.filter(p => p.id !== pharmacyId)
          }
        : hospital
    ));
  };

  const getTotalHospitalsCount = () => hospitals.length;

  return (
    <View style={styles.container}>
      {/* Summary Header */}
      <TouchableOpacity
        style={styles.summaryHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <AppText style={styles.summaryText}>
          {getTotalHospitalsCount()} Hospital{getTotalHospitalsCount() !== 1 ? 's' : ''} Selected
        </AppText>
        <Icon 
          name={expanded ? 'chevron-up' : 'chevron-down'} 
          size={24} 
          color="#333" 
        />
      </TouchableOpacity>

      {/* Expanded Content */}
      {expanded && (
        <View style={styles.expandedContent}>
          {hospitals.map((hospital, hospitalIndex) => (
            <View key={hospital.id} style={styles.hospitalCard}>
              {/* Hospital Header */}
              <View style={styles.hospitalHeader}>
                <AppText style={styles.hospitalName}>{hospital.name}</AppText>
                <TouchableOpacity
                  onPress={() => handleRemoveHospital(hospital.id)}
                  style={styles.removeButton}
                >
                  <MaterialCommunityIcons 
                    name="close-circle" 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>

              {/* Pharmacies Section */}
              {hospital.pharmacies && hospital.pharmacies.length > 0 && (
                <View style={styles.pharmaciesSection}>
                  <AppText style={styles.pharmaciesLabel}>Pharmacies</AppText>
                  <View style={styles.pharmaciesContainer}>
                    {hospital.pharmacies.map((pharmacy, pharmacyIndex) => (
                      <View key={pharmacy.id} style={styles.pharmacyChip}>
                        <AppText style={styles.pharmacyChipText}>
                          {pharmacy.name}
                        </AppText>
                        <TouchableOpacity
                          onPress={() => handleRemovePharmacy(hospital.id, pharmacy.id)}
                          style={styles.pharmacyRemoveButton}
                        >
                          <MaterialCommunityIcons 
                            name="close-circle" 
                            size={16} 
                            color="#666" 
                          />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Add Pharmacy Button */}
              <TouchableOpacity
                style={styles.addPharmacyButton}
                onPress={() => handleAddPharmacy(hospital.id)}
              >
                <AppText style={styles.addPharmacyText}>+ Add Pharmacy</AppText>
              </TouchableOpacity>
            </View>
          ))}

          {/* Add New Hospital Button */}
          <TouchableOpacity
            style={styles.addHospitalButton}
            onPress={handleAddHospital}
          >
            <AppText style={styles.addHospitalText}>+ Add New Hospital</AppText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  summaryText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  expandedContent: {
    marginTop: 12,
  },
  hospitalCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  hospitalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  pharmaciesSection: {
    marginBottom: 12,
  },
  pharmaciesLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  pharmaciesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pharmacyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pharmacyChipText: {
    fontSize: 14,
    color: '#333',
    marginRight: 4,
  },
  pharmacyRemoveButton: {
    padding: 2,
  },
  addPharmacyButton: {
    paddingVertical: 8,
  },
  addPharmacyText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  addHospitalButton: {
    paddingVertical: 12,
  },
  addHospitalText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
});

export default HospitalPharmacyManager;
