import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  TextInput,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../../styles/colors';

const DistributorGroupUpdate = () => {
  const navigation = useNavigation();
  
  const [selectedDistributors, setSelectedDistributors] = useState([]);
  const [updateFields, setUpdateFields] = useState({
    doctorMargin: '',
    hospitalMargin: '',
    status: true,
    sendInvite: false
  });

  const distributors = [
    { id: '1', name: 'A.A. Pharma', code: '10106555', selected: false },
    { id: '2', name: 'A A PHARMACEUTICALS', code: '10106556', selected: false },
    { id: '3', name: 'A A PHARMACEUTICALS MED...', code: '10106557', selected: false },
  ];

  const handleSelectDistributor = (id) => {
    setSelectedDistributors(prev => {
      if (prev.includes(id)) {
        return prev.filter(dId => dId !== id);
      }
      return [...prev, id];
    });
  };

  const handleSelectAll = () => {
    if (selectedDistributors.length === distributors.length) {
      setSelectedDistributors([]);
    } else {
      setSelectedDistributors(distributors.map(d => d.id));
    }
  };

  const handleUpdate = () => {
    if (selectedDistributors.length === 0) {
      Alert.alert('Error', 'Please select at least one distributor');
      return;
    }

    Alert.alert(
      'Confirm Update',
      `Update ${selectedDistributors.length} distributor(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            // Perform update logic here
            Alert.alert('Success', 'Distributors updated successfully');
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Group Update</Text>
        <TouchableOpacity onPress={handleUpdate}>
          <Text style={styles.saveText}>SAVE</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Distributors</Text>
          
          <TouchableOpacity
            style={styles.selectAllRow}
            onPress={handleSelectAll}
          >
            <View style={[
              styles.checkbox,
              selectedDistributors.length === distributors.length && styles.checkboxSelected
            ]}>
              {selectedDistributors.length === distributors.length && (
                <Icon name="check" size={14} color="#fff" />
              )}
            </View>
            <Text style={styles.selectAllText}>Select All</Text>
            {selectedDistributors.length > 0 && (
              <Text style={styles.selectedCount}>
                ({selectedDistributors.length} selected)
              </Text>
            )}
          </TouchableOpacity>

          {distributors.map(distributor => (
            <TouchableOpacity
              key={distributor.id}
              style={styles.distributorRow}
              onPress={() => handleSelectDistributor(distributor.id)}
            >
              <View style={[
                styles.checkbox,
                selectedDistributors.includes(distributor.id) && styles.checkboxSelected
              ]}>
                {selectedDistributors.includes(distributor.id) && (
                  <Icon name="check" size={14} color="#fff" />
                )}
              </View>
              <View style={styles.distributorInfo}>
                <Text style={styles.distributorName}>{distributor.name}</Text>
                <Text style={styles.distributorCode}>{distributor.code}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Update Fields</Text>
          
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Doctor Supply Margin (%)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter percentage"
              value={updateFields.doctorMargin}
              onChangeText={(text) => setUpdateFields({...updateFields, doctorMargin: text})}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Hospital Supply Margin (%)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter percentage"
              value={updateFields.hospitalMargin}
              onChangeText={(text) => setUpdateFields({...updateFields, hospitalMargin: text})}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.fieldLabel}>Status</Text>
            <View style={styles.statusToggle}>
              <Text style={styles.statusText}>
                {updateFields.status ? 'Active' : 'Inactive'}
              </Text>
              <Switch
                value={updateFields.status}
                onValueChange={(value) => setUpdateFields({...updateFields, status: value})}
                trackColor={{ false: '#ccc', true: colors.primaryLight }}
                thumbColor={updateFields.status ? colors.primary : '#f4f3f4'}
              />
            </View>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.fieldLabel}>Send Invite</Text>
            <Switch
              value={updateFields.sendInvite}
              onValueChange={(value) => setUpdateFields({...updateFields, sendInvite: value})}
              trackColor={{ false: '#ccc', true: colors.primaryLight }}
              thumbColor={updateFields.sendInvite ? colors.primary : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.noteSection}>
          <Icon name="info-outline" size={16} color={colors.primary} />
          <Text style={styles.noteText}>
            Only filled fields will be updated. Leave blank to keep existing values.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.updateButton, selectedDistributors.length === 0 && styles.disabledButton]}
          onPress={handleUpdate}
          disabled={selectedDistributors.length === 0}
        >
          <Text style={styles.updateButtonText}>
            Update ({selectedDistributors.length})
          </Text>
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
  saveText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 12,
  },
  selectedCount: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 8,
  },
  distributorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  distributorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  distributorName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  distributorCode: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  fieldRow: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  noteSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight + '20',
    margin: 16,
    padding: 12,
    borderRadius: 8,
  },
  noteText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  updateButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  updateButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default DistributorGroupUpdate;