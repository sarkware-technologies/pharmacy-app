import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '../../../components/AppText';
import { colors } from '../../../styles/colors';

// Import the simplified onboard form
import OnboardCustomerForm from './OnboardCustomerForm';

/**
 * OnboardCustomer - Wrapper component that loads the simplified onboard form
 * Shows only editable fields in a simple one-by-one layout
 */
const OnboardCustomer = ({ route, navigation }) => {
  const { customerId, customerData, isStaging } = route.params || {};
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (customerData) {
      setLoading(false);
    }
  }, [customerData]);

  if (loading || !customerData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText style={styles.loadingText}>Loading customer details...</AppText>
      </SafeAreaView>
    );
  }

  // Render the simplified onboard form
  return (
    <OnboardCustomerForm
      route={route}
      navigation={navigation}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default OnboardCustomer;
