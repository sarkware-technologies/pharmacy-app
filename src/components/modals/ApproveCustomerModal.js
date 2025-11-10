import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { colors } from '../../styles/colors';

const { width, height } = Dimensions.get('window');

const ApproveCustomerModal = ({ visible, onClose, onConfirm, customerName }) => {
  const [comment, setComment] = useState('');

  const handleConfirm = () => {
    onConfirm(comment);
    setComment('');
  };

  const handleClose = () => {
    setComment('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
          {/* Warning Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>!</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>
            Are you sure you want to{'\n'}Approve customer?
          </Text>

          {/* Comment Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Write your comment*"
              placeholderTextColor="#999"
              multiline={true}
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
              textAlignVertical="top"
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.noButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Text style={styles.noButtonText}>No</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.yesButton}
              onPress={handleConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.yesButtonText}>Yes</Text>
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: width,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF4ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF8A3D',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 26,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    minHeight: 100,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  noButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#FF8A3D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF8A3D',
  },
  yesButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#FF8A3D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  yesButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ApproveCustomerModal;
