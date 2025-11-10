import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFeather from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');

const UnmappedProductsModal = ({ visible, onClose, onMapProducts, onCheckout, message }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <View style={styles.iconBackground}>
            <Icon name="alert-circle" size={40} color="#E8505B" />
          </View>
        </View>

        <Text style={styles.title}>Warning!</Text>
        <Text style={styles.message}>
          {message}
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.outlineButton} onPress={onMapProducts}>
            <Text style={styles.outlineButtonText}>Map Products</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fillButton} onPress={onCheckout}>
            <Text style={styles.fillButtonText}>Proceed To Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};


const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    width: width,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  iconBackground: {
    backgroundColor: '#FCE8E9',
    borderRadius: 50,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 6,
  },
  message: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  outlineButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E79533',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 8,
  },
  outlineButtonText: {
    color: '#E79533',
    fontWeight: '600',
  },
  fillButton: {
    flex: 1,
    backgroundColor: '#E79533',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 8,
  },
  fillButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default {
  UnmappedProductsModal,
};
