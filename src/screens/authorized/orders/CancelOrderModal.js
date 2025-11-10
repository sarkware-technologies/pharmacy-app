import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

const CancelOrderModal = ({ visible, onCancel, onClose }) => {
  const translateY = React.useRef(new Animated.Value(height)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.bottomSheet, { transform: [{ translateY }] }]}>
          <View style={styles.iconContainer}>
            <Icon name="alert-circle-outline" size={60} color="#E74C3C" />
          </View>

          <Text style={styles.title}>
            Are you sure you want to cancel the order?
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.backButton} onPress={onClose}>
              <Text style={styles.backButtonText}>No, Go Back</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Icon name="close-circle-outline" size={18} color="#fff" />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#FFE3E3',
    borderRadius: 100,
    padding: 20,
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 25,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  backButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingVertical: 12,
    marginRight: 10,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FF7779',
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default CancelOrderModal;
