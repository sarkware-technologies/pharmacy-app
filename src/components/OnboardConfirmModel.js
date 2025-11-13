import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AppText from "./AppText"

const { width } = Dimensions.get('window');

// Approve Customer Modal Component
export const ApproveConfirmModal = ({ visible, onClose, onConfirm, customerName = "customer" }) => {
  const [comment, setComment] = useState('');

  const handleConfirm = () => {
    onConfirm(comment);
    setComment('');
  };

  const handleCancel = () => {
    onClose();
    setComment('');
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardView}
            >
              <View style={styles.modalContainer}>
                {/* Alert Icon - Orange */}
                <View style={styles.iconContainer}>
                  <View style={[styles.alertCircle, { backgroundColor: '#FF6B00' }]}>
                    <AppText style={styles.exclamationMark}>!</AppText>
                  </View>
                </View>

                {/* Title */}
                <AppText style={styles.modalTitle}>
                  Are you sure you want to{'\n'}Approve {customerName}?
                </AppText>

                {/* Comment Input */}
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Write your comment"
                    placeholderTextColor="#999"
                    value={comment}
                    onChangeText={setComment}
                    multiline={true}
                    textAlignVertical="top"
                  />
                  <AppText style={styles.asterisk}>*</AppText>
                </View>

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancel}
                    activeOpacity={0.8}
                  >
                    <AppText style={styles.cancelButtonText}>No</AppText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.confirmButton, { backgroundColor: '#FF6B00' }]}
                    onPress={handleConfirm}
                    activeOpacity={0.8}
                  >
                    <AppText style={styles.confirmButtonText}>Yes</AppText>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// Link Divisions Modal Component
export const LinkDivisionsModal = ({ visible, onClose, onConfirm }) => {
  const [comment, setComment] = useState('');

  const handleConfirm = () => {
    onConfirm(comment);
    setComment('');
  };

  const handleCancel = () => {
    onClose();
    setComment('');
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardView}
            >
              <View style={styles.modalContainer}>
                {/* Alert Icon - Orange */}
                <View style={styles.iconContainer}>
                  <View style={[styles.alertCircle, { backgroundColor: '#FF6B00' }]}>
                    <AppText style={styles.exclamationMark}>!</AppText>
                  </View>
                </View>

                {/* Title */}
                <AppText style={styles.modalTitle}>
                  Are you sure you want to{'\n'}Link Divisions?
                </AppText>

                {/* Comment Input */}
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Write your comment"
                    placeholderTextColor="#999"
                    value={comment}
                    onChangeText={setComment}
                    multiline={true}
                    textAlignVertical="top"
                  />
                  <AppText style={styles.asterisk}>*</AppText>
                </View>

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancel}
                    activeOpacity={0.8}
                  >
                    <AppText style={styles.cancelButtonText}>No</AppText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.confirmButton, { backgroundColor: '#FF6B00' }]}
                    onPress={handleConfirm}
                    activeOpacity={0.8}
                  >
                    <AppText style={styles.confirmButtonText}>Yes</AppText>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// Reject Customer Modal Component
export const RejectCustomerModal = ({ visible, onClose, onConfirm, message = "Test message" }) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {/* Alert Icon - Red/Pink */}
              <View style={styles.iconContainer}>
                <View style={[styles.alertCircle, { backgroundColor: '#FF5252' }]}>
                  <AppText style={styles.exclamationMark}>!</AppText>
                </View>
              </View>

              {/* Title */}
              <AppText style={styles.modalTitle}>
                Are you sure you want to{'\n'}Reject customer?
              </AppText>

              {/* Message Text */}
              <AppText style={styles.messageText}>{message}</AppText>

              {/* Buttons - Reversed for Reject */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleConfirm}
                  activeOpacity={0.8}
                >
                  <AppText style={styles.cancelButtonText}>Yes</AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.confirmButton, { backgroundColor: '#FF5252' }]}
                  onPress={handleCancel}
                  activeOpacity={0.8}
                >
                  <AppText style={styles.confirmButtonText}>No</AppText>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// Tag Hospital Modal Component
export const TagHospitalModal = ({ visible, onClose, onConfirm, hospitalName = "this hospital", teamName = "Instra Team" }) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {/* Warning Icon - Pink with Triangle */}
              <View style={styles.iconContainer}>
                <View style={[styles.warningCircle]}>
                  <View style={styles.triangle}>
                    <AppText style={styles.warningExclamation}>!</AppText>
                  </View>
                </View>
              </View>

              {/* Title */}
              <AppText style={styles.modalTitle}>
                Do you want to tag{'\n'}{hospitalName} to {teamName}?
              </AppText>

              {/* Buttons */}
              <View style={[styles.buttonContainer, { marginTop: 40 }]}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  activeOpacity={0.8}
                >
                  <AppText style={styles.cancelButtonText}>No</AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.confirmButton, { backgroundColor: '#FF6B00' }]}
                  onPress={handleConfirm}
                  activeOpacity={0.8}
                >
                  <AppText style={styles.confirmButtonText}>Yes</AppText>
                </TouchableOpacity>
              </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: width * 0.85,
    maxWidth: 350,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  alertCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFCDD2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 24,
    borderRightWidth: 24,
    borderBottomWidth: 42,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#fff',
    transform: [{ rotate: '0deg' }],
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  warningExclamation: {
    fontSize: 24,
    color: '#FF5252',
    fontWeight: 'bold',
    position: 'absolute',
    bottom: 8,
    left: -4,
  },
  exclamationMark: {
    fontSize: 36,
    color: 'white',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 32,
  },
  messageText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
    position: 'relative',
  },
  commentInput: {
    width: '100%',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#FAFAFA',
  },
  asterisk: {
    position: 'absolute',
    top: 12,
    right: 12,
    color: '#FF0000',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF6B00',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF6B00',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
});

export default {
  ApproveConfirmModal,
  LinkDivisionsModal,
  RejectCustomerModal,
  TagHospitalModal,
};
