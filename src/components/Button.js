import React from 'react';
import { TouchableOpacity, View, ActivityIndicator, StyleSheet } from 'react-native';
import { AppText } from '.';

const Button = ({
  children,
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
  testID,
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={isDisabled ? null : onPress}
      style={[styles.button, isDisabled && styles.disabled, style]}
      disabled={isDisabled}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <View>
          {typeof children === "string" || typeof children === "number" ? (
            <AppText style={[styles.text, textStyle]}>{children}</AppText>
          ) : (
            children
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#F7941E',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
});

export default Button;
