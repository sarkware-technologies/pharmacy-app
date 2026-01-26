import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { AppText } from '..';

const ConfirmModal = ({
  visible,
  title,
  message,
  confirmText = 'Yes',
  cancelText = 'No',
  onConfirm,
  onClose,
  icon = '!',
}) => {
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
                  <AppText style={styles.iconText}>{icon}</AppText>
                </View>
              </View>

              {/* Title / Message */}
              {title && <AppText style={styles.title}>{title}</AppText>}
              {message && <AppText style={styles.message}>{message}</AppText>}

              {/* Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={onConfirm}
                  activeOpacity={0.8}
                >
                  <AppText style={styles.confirmText}>
                    {confirmText}
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <AppText style={styles.cancelText}>
                    {cancelText}
                  </AppText>
                </TouchableOpacity>
              </View>

            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ConfirmModal;
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
    marginBottom: 8,
  },

  message: {
    fontSize: 14,
    textAlign: 'center',
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 24,
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },

  confirmButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#F7941E',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
});

