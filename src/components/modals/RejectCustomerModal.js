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
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../styles/colors';
import {AppText,AppInput} from ".."

const { width, height } = Dimensions.get('window');

const RejectCustomerModal = ({
  visible,
  onClose,
  onConfirm,
  customerName,
  titleText = 'Are you sure you want to\nReject customer?',
  confirmLabel = 'Yes',
  requireComment = true,
  loading = false,
}) => {
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (requireComment && (!comment || comment.trim() === '')) {
      setError('Please enter a comment before proceeding');
      return;
    }
   await onConfirm(comment);
    setComment('');
    setError('');
  };

  const handleClose = () => {
    setComment('');
    setError('');
    onClose();
  };

  const handleCommentChange = (text) => {
    setComment(text);
    if (error) setError('');
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

                        <View style={styles.iconCircleOuter}>


            <View style={styles.iconCircle}>
              <AppText style={styles.iconText}>!</AppText>
            </View>

            </View>
          </View>

          {/* Title */}
          <AppText style={styles.title}>
            {titleText}
          </AppText>

          {/* Comment Input */}
          <View style={styles.inputContainer}>
            <AppInput
              style={[styles.input, error && styles.inputError]}
              placeholder="Write your comment*"
              placeholderTextColor="#999"
              multiline={true}
              numberOfLines={4}
              value={comment}
              onChangeText={handleCommentChange}
              textAlignVertical="top"
              editable={!loading}
            />
            {error && <AppText style={styles.errorText}>{error}</AppText>}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.yesButton,
                loading && styles.yesButtonDisabled
              ]}
              onPress={handleConfirm}
              activeOpacity={0.7}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#6B7280" />
              ) : (
                <AppText style={styles.yesButtonText}>{confirmLabel}</AppText>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.noButton}
              onPress={handleClose}
              activeOpacity={0.7}
              disabled={loading}
            >
              <AppText style={styles.noButtonText}>No</AppText>
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

  iconCircleOuter:{
    backgroundColor:"#FFE3E3",
   borderRadius:100,
   padding:20

  },
  iconCircle: {
    width: 49,
    height: 49,
    borderRadius: 32,
    backgroundColor: '#FF7779',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
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
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  yesButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#6B7280',
    justifyContent: 'center',
    alignItems: 'center',
  },
  yesButtonDisabled: {
    opacity: 0.6,
  },
  yesButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  noButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
});

export default RejectCustomerModal;
