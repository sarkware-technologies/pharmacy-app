import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppText from "../../../components/AppText"

const VerticalText = () => {
  return (
    <View style={styles.container}>
      <AppText style={styles.verticalText}>DIV</AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E0F0C3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalText: {
    transform: [{ rotate: '-90deg' }],
    fontSize: 10,
    fontWeight: 'bold',
    color: '#7AA049',
    letterSpacing:1,
  },
});

export default VerticalText;
