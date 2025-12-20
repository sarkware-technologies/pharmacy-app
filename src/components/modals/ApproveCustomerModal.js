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
import { AppText, AppInput } from ".."
import CustomCheckbox from '../view/checkbox';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const ApproveCustomerModal = ({ visible, onClose, onConfirm, customerName, checkboxLabel, loading = false }) => {
  const [comment, setComment] = useState('');
  const [checkConfirm, setCheckConfirm] = useState(true);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (!comment || comment.trim() === '') {

      setError('Please enter a comment before approving');

      return;
    }

    if (!checkConfirm) {
      setError('Please check a verify checkbox');

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
                <View style={styles.iconCircle}>
                  <AppText style={styles.iconText}>!</AppText>
                </View>
              </View>

              {/* Title */}
              <AppText style={styles.title}>
                Are you sure you want to{'\n'}Approve customer?
              </AppText>

              {/* Comment Input */}
              <View style={styles.inputContainer}>
                <AppInput
                  style={[styles.input, error && styles.inputError, { marginBottom: 20}]}
                  placeholder="Write your comment*"
                  placeholderTextColor="#999"
                  multiline={true}
                  numberOfLines={4}
                  value={comment}
                  onChangeText={handleCommentChange}
                  textAlignVertical="top"
                  editable={!loading}
                />

                <CustomCheckbox

                  checked={checkConfirm}
                  checkboxStyle={{ marginRight: 5 }}
                  size={16}
                  borderWidth={1}
                  activeColor="#F7941E"
                  checkIcon={
                    <Svg width="9" height="7" viewBox="0 0 9 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <Path d="M8.25 0.75L3.09375 5.90625L0.75 3.5625" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>

                  }
                  title={
                    <AppText>

                      {checkboxLabel || " I have verified all details and documents"}
                     
                    </AppText>
                  }
                  onChange={() => {
                    if (!loading) {
                      setCheckConfirm(!checkConfirm)
                    }
                  }}
                  disabled={loading}
                />


                {error && <AppText style={styles.errorText}>{error}</AppText>}



              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.noButton}
                  onPress={handleClose}
                  activeOpacity={0.7}
                  disabled={loading}
                >
                  <AppText style={styles.noButtonText}>No</AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.yesButton,
                    { backgroundColor: (checkConfirm && comment && !loading) ? colors.primary : '#D3D4D6' }
                  ]}
                  onPress={handleConfirm}
                  activeOpacity={0.7}
                  disabled={!checkConfirm || !comment || loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <AppText style={styles.yesButtonText}>Yes</AppText>
                  )}
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
