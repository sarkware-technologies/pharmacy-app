import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { AppText } from '..';

const { width } = Dimensions.get('window');

const DraftExistsModal = ({ visible, onConfirm, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {/* Icon */}
              <View style={styles.iconOuter}>
                <View style={styles.iconInner}>
                  <AppText style={styles.iconText}>!</AppText>
                </View>
              </View>

              {/* Title */}
              <AppText style={styles.title}>
                Customer already exists{'\n'}
                in Draft. Do you still want{'\n'}
                to continue?
              </AppText>

              {/* Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.yesButton}
                  onPress={onConfirm}
                  activeOpacity={0.8}
                >
                  <AppText style={styles.yesText}>Yes</AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.noButton}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <AppText style={styles.noText}>No</AppText>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default DraftExistsModal;
const styles = StyleSheet.create({
  overlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.45)',
  justifyContent: 'flex-end',   
},

 modalContainer: {
  width: '100%',                
  backgroundColor: '#fff',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  padding: 24,
  paddingBottom: 32,
  alignItems: 'center',
},

  iconOuter: {
    backgroundColor: '#FFE8D9',
    padding: 18,
    borderRadius: 100,
    marginBottom: 16,
  },

  iconInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1F2937',
    lineHeight: 24,
    marginBottom: 24,
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },

  yesButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#F7941E',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  yesText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  noButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  noText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
});
