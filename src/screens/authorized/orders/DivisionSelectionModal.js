import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppText from "../../../components/AppText"

const { width, height } = Dimensions.get('window');

export const DivisionSelectionModal = ({
  visible,
  onClose,
  onConfirm,
  initialSelections = []
}) => {
  const [selectedDivisions, setSelectedDivisions] = useState(initialSelections);

  // Mock divisions data
  const divisions = [
    { id: 1, name: 'All Divisions', code: '', isAll: true },
    { id: 2, name: 'VICTRIX SUN', code: '1044' },
    { id: 3, name: 'Sun Exports USA', code: '1020' },
    { id: 4, name: 'Oncology', code: '1044' },
    { id: 5, name: 'GLI', code: '1020' },
    { id: 6, name: 'Bonesta', code: '1044' },
    { id: 7, name: 'VICTRIX SUN', code: '1044' },
    { id: 8, name: 'Sun Exports USA', code: '1044' },
    { id: 9, name: 'Bonesta', code: '1044' },
  ];

  const toggleDivision = (division) => {
    if (division.isAll) {
      // If "All Divisions" is clicked, select/deselect all
      if (selectedDivisions.length === divisions.length) {
        setSelectedDivisions([]);
      } else {
        setSelectedDivisions(divisions.map(d => d.id));
      }
    } else {
      // Toggle individual division
      setSelectedDivisions(prev => {
        const exists = prev.includes(division.id);
        let newSelections;

        if (exists) {
          newSelections = prev.filter(id => id !== division.id);
          // If we're deselecting, also deselect "All Divisions"
          newSelections = newSelections.filter(id => id !== 1);
        } else {
          newSelections = [...prev, division.id];
          // Check if all other divisions are now selected
          const allOthersSelected = divisions
            .filter(d => !d.isAll)
            .every(d => newSelections.includes(d.id));

          if (allOthersSelected) {
            newSelections.push(1); // Add "All Divisions"
          }
        }

        return newSelections;
      });
    }
  };

  const handleConfirm = () => {
    const selected = divisions.filter(d => selectedDivisions.includes(d.id));
    if (onConfirm) {
      onConfirm(selected);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.header}>
                <AppText style={styles.headerTitle}>Divisions</AppText>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Column Headers */}
              <View style={styles.columnHeaders}>
                <AppText style={styles.columnHeaderText}>Name</AppText>
                <AppText style={[styles.columnHeaderText, styles.codeHeader]}>Code</AppText>
              </View>

              {/* Division List */}
              <ScrollView
                style={styles.divisionList}
                showsVerticalScrollIndicator={false}
              >
                {divisions.map((division) => (
                  <TouchableOpacity
                    key={division.id}
                    style={styles.divisionItem}
                    onPress={() => toggleDivision(division)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.divisionRow}>
                      <View style={[
                        styles.checkbox,
                        selectedDivisions.includes(division.id) && styles.checkboxSelected
                      ]}>
                        {selectedDivisions.includes(division.id) && (
                          <Icon name="check" size={16} color="#fff" />
                        )}
                      </View>
                      <AppText style={styles.divisionName}>{division.name}</AppText>
                    </View>
                    <AppText style={styles.divisionCode}>{division.code}</AppText>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Confirm Button - Optional */}
              {/* Uncomment if you want a confirm button at the bottom */}
              {/* <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirm}
              >
                <AppText style={styles.confirmButtonText}>Confirm Selection</AppText>
              </TouchableOpacity> */}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: height * 0.75,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  columnHeaders: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  columnHeaderText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    flex: 1,
  },
  codeHeader: {
    textAlign: 'right',
    flex: 0,
    width: 80,
  },
  divisionList: {
    flex: 1,
  },
  divisionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  divisionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  divisionName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  divisionCode: {
    fontSize: 16,
    color: '#666',
    width: 80,
    textAlign: 'right',
  },
  confirmButton: {
    backgroundColor: '#FF6B00',
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DivisionSelectionModal;
