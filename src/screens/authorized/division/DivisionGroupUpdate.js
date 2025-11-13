import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Switch,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../../styles/colors';
import AppText from "../../../components/AppText"

const DivisionGroupUpdate = () => {
  const navigation = useNavigation();
  const [selectedDivisions, setSelectedDivisions] = useState([]);
  const [updateType, setUpdateType] = useState('margin'); // 'margin', 'status', 'header'
  const [doctorMargin, setDoctorMargin] = useState('');
  const [hospitalMargin, setHospitalMargin] = useState('');
  const [activeStatus, setActiveStatus] = useState(true);
  const [headerDivision, setHeaderDivision] = useState('');

  const divisions = [
    { id: '43', name: 'IN CNS', code: 'tt1', customers: 480, active: true },
    { id: '455', name: 'Selecta', code: '455', customers: 480, active: true },
    { id: '456', name: 'Oncology', code: '456', customers: 480, active: true },
    { id: '457', name: 'Bonesta', code: '457', customers: 480, active: true },
  ];

  const toggleDivisionSelection = (divisionId) => {
    if (selectedDivisions.includes(divisionId)) {
      setSelectedDivisions(selectedDivisions.filter(id => id !== divisionId));
    } else {
      setSelectedDivisions([...selectedDivisions, divisionId]);
    }
  };

  const selectAll = () => {
    if (selectedDivisions.length === divisions.length) {
      setSelectedDivisions([]);
    } else {
      setSelectedDivisions(divisions.map(d => d.id));
    }
  };

  const handleGroupUpdate = () => {
    if (selectedDivisions.length === 0) {
      Alert.alert('No Selection', 'Please select at least one division to update');
      return;
    }

    let updateMessage = '';
    switch (updateType) {
      case 'margin':
        if (!doctorMargin || !hospitalMargin) {
          Alert.alert('Missing Information', 'Please enter both doctor and hospital margins');
          return;
        }
        updateMessage = `Update margins for ${selectedDivisions.length} divisions?\nDoctor: ${doctorMargin}%\nHospital: ${hospitalMargin}%`;
        break;
      case 'status':
        updateMessage = `${activeStatus ? 'Activate' : 'Deactivate'} ${selectedDivisions.length} divisions?`;
        break;
      case 'header':
        if (!headerDivision) {
          Alert.alert('Missing Information', 'Please enter header division code');
          return;
        }
        updateMessage = `Update header division to "${headerDivision}" for ${selectedDivisions.length} divisions?`;
        break;
    }

    Alert.alert(
      'Confirm Update',
      updateMessage,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Update', 
          onPress: () => {
            // Perform update API call here
            Alert.alert('Success', 'Divisions updated successfully');
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>Group Update</AppText>
        <TouchableOpacity onPress={selectAll}>
          <AppText style={styles.selectAllText}>
            {selectedDivisions.length === divisions.length ? 'Deselect All' : 'Select All'}
          </AppText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Select Divisions</AppText>
          {divisions.map(division => (
            <TouchableOpacity 
              key={division.id}
              style={styles.divisionItem}
              onPress={() => toggleDivisionSelection(division.id)}
            >
              <View style={[
                styles.checkbox, 
                selectedDivisions.includes(division.id) && styles.checkboxSelected
              ]}>
                {selectedDivisions.includes(division.id) && (
                  <Icon name="check" size={16} color="#fff" />
                )}
              </View>
              <View style={styles.divisionInfo}>
                <AppText style={styles.divisionName}>{division.name}</AppText>
                <AppText style={styles.divisionCode}>
                  {division.code} | {division.customers} customers
                </AppText>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Update Type</AppText>
          
          <TouchableOpacity 
            style={[styles.updateOption, updateType === 'margin' && styles.updateOptionActive]}
            onPress={() => setUpdateType('margin')}
          >
            <Icon 
              name="percent" 
              size={20} 
              color={updateType === 'margin' ? colors.primary : '#666'} 
            />
            <AppText style={[styles.updateOptionText, updateType === 'margin' && styles.updateOptionTextActive]}>
              Update Margins
            </AppText>
            {updateType === 'margin' && (
              <Icon name="check-circle" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.updateOption, updateType === 'status' && styles.updateOptionActive]}
            onPress={() => setUpdateType('status')}
          >
            <Icon 
              name="toggle-on" 
              size={20} 
              color={updateType === 'status' ? colors.primary : '#666'} 
            />
            <AppText style={[styles.updateOptionText, updateType === 'status' && styles.updateOptionTextActive]}>
              Update Status
            </AppText>
            {updateType === 'status' && (
              <Icon name="check-circle" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.updateOption, updateType === 'header' && styles.updateOptionActive]}
            onPress={() => setUpdateType('header')}
          >
            <Icon 
              name="account-tree" 
              size={20} 
              color={updateType === 'header' ? colors.primary : '#666'} 
            />
            <AppText style={[styles.updateOptionText, updateType === 'header' && styles.updateOptionTextActive]}>
              Update Header Division
            </AppText>
            {updateType === 'header' && (
              <Icon name="check-circle" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>

        {updateType === 'margin' && (
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>Margin Values</AppText>
            <View style={styles.inputGroup}>
              <AppText style={styles.inputLabel}>Doctor Margin (%)</AppText>
              <TextInput
                style={styles.input}
                value={doctorMargin}
                onChangeText={setDoctorMargin}
                placeholder="Enter doctor margin"
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
            <View style={styles.inputGroup}>
              <AppText style={styles.inputLabel}>Hospital Margin (%)</AppText>
              <TextInput
                style={styles.input}
                value={hospitalMargin}
                onChangeText={setHospitalMargin}
                placeholder="Enter hospital margin"
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
          </View>
        )}

        {updateType === 'status' && (
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>Division Status</AppText>
            <View style={styles.switchGroup}>
              <AppText style={styles.switchLabel}>
                {activeStatus ? 'Active' : 'Inactive'}
              </AppText>
              <Switch
                value={activeStatus}
                onValueChange={setActiveStatus}
                trackColor={{ false: '#E0E0E0', true: '#FFD4B2' }}
                thumbColor={activeStatus ? colors.primary : '#999'}
              />
            </View>
          </View>
        )}

        {updateType === 'header' && (
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>Header Division</AppText>
            <View style={styles.inputGroup}>
              <AppText style={styles.inputLabel}>Header Division Code</AppText>
              <TextInput
                style={styles.input}
                value={headerDivision}
                onChangeText={setHeaderDivision}
                placeholder="Enter header division code"
              />
            </View>
          </View>
        )}

        <View style={styles.selectedSummary}>
          <Icon name="info" size={20} color={colors.primary} />
          <AppText style={styles.summaryText}>
            {selectedDivisions.length} division{selectedDivisions.length !== 1 ? 's' : ''} selected
          </AppText>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <AppText style={styles.cancelButtonText}>Cancel</AppText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.updateButton, selectedDivisions.length === 0 && styles.updateButtonDisabled]}
          onPress={handleGroupUpdate}
          disabled={selectedDivisions.length === 0}
        >
          <AppText style={styles.updateButtonText}>Update {selectedDivisions.length} Divisions</AppText>
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
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  selectAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  divisionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  divisionInfo: {
    flex: 1,
  },
  divisionName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  divisionCode: {
    fontSize: 13,
    color: '#999',
  },
  updateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
    marginBottom: 8,
  },
  updateOptionActive: {
    backgroundColor: '#FFF5EC',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  updateOptionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#666',
  },
  updateOptionTextActive: {
    color: colors.primary,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchLabel: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  selectedSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5EC',
    padding: 16,
    marginTop: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  summaryText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  updateButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  updateButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  updateButtonText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
});

export default DivisionGroupUpdate;