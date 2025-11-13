import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AppText from "../AppText"

const ClaimSuccessModal = ({ visible, onClose, claimId }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.successCircle}>
            <View style={styles.innerCircle}>
              <View style={styles.checkCircle}>
                <Icon name="check" size={48} color="#FFFFFF" />
              </View>
            </View>
          </View>

          <AppText style={styles.title}>Claim Submitted Successfully!</AppText>
          <AppText style={styles.claimIdText}>Claim Id: {claimId || 'CLM123456'}</AppText>

          <TouchableOpacity style={styles.goToListingButton} onPress={onClose}>
            <AppText style={styles.buttonText}>Go to Listings</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 32,
    paddingBottom: 40,
    alignItems: 'center',
  },
  successCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  innerCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#C8E6C9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 12,
  },
  claimIdText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  goToListingButton: {
    backgroundColor: '#FFA500',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 48,
    width: '100%',
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ClaimSuccessModal;