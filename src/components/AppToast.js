import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal,Text } from 'react-native';
import AppText from './AppText';


let showToastRef = null;

const getDefaultLabel = (type) => {
  switch (type) {
    case 'success':
      return 'Success';
    case 'warning':
      return 'Warning';
    case 'error':
      return 'Error';
    default:
      return 'Info';
  }
};

const AppToast = () => {
 
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('success');
  const [label, setLabel] = useState('');
  const timeoutRef = useRef(null);

  useEffect(() => {
    showToastRef = (
      msg,
      toastType = 'success',

      customLabel
    ) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setMessage(msg);
      setType(toastType);

      // 🔥 Set dynamic label
      setLabel(customLabel || getDefaultLabel(toastType));

      setVisible(true);

      timeoutRef.current = setTimeout(() => {
        setVisible(false);
      }, 3000);
    };

    return () => {
      showToastRef = null;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!visible) return null;

 return (
  <Modal
    transparent
    visible={visible}
    animationType="fade"
    statusBarTranslucent
  >
    {visible && (
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View
            style={[
              styles.toast,
              type === 'success'
                ? styles.success
                : type === 'warning'
                ? styles.warning
                : styles.error,
            ]}
          >
            <View style={styles.header}>
              <AppText style={styles.label}>{label}</AppText>

              <TouchableOpacity onPress={() => setVisible(false)}>
                <AppText style={styles.ok}>OK</AppText>
              </TouchableOpacity>
            </View>

            <AppText style={styles.message}>{message}</AppText>
          </View>
        </View>
      </View>
    )}
  </Modal>
);

};

/**
 * 🔥 Global Toast API
 */
export const AppToastService = {
  
  
  
  show: (
    message,
    type = 'success',
    label // optional
  ) => {
    showToastRef?.(message, type, label);
  },
};

const styles = StyleSheet.create({
  overlay: {
  flex: 1,
  justifyContent: 'flex-end',
},
container: {
  marginBottom: 90,
  marginHorizontal: 20,
},
  toast: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    backgroundColor: '#333', // fallback
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10,
  },

  success: {
    backgroundColor: '#38BA83',
  },

  warning: {
    backgroundColor: '#E2C051',
  },

  error: {
    backgroundColor: '#EF6B6B',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  label: {
    color: '#E8F5E9',
    fontSize: 14,
    fontWeight: '500',
  },

  ok: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  message: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'left',
  },
});

export default AppToast;
