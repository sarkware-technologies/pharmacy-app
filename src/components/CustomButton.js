import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../styles/colors';
import AppText from "./AppText"

const CustomButton = ({
  title,
  onPress,
  loading,
  disabled,
  variant = 'primary',
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const isPrimary = variant === 'primary';
  const buttonStyle = isPrimary ? styles.primaryButton : styles.secondaryButton;
  const textStyle = isPrimary ? styles.primaryText : styles.secondaryText;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.button, buttonStyle, disabled && styles.disabledButton]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}>
        {loading ? (
          <ActivityIndicator color={isPrimary ? colors.white : colors.primary} />
        ) : (
          <AppText style={[styles.text, textStyle]}>{title}</AppText>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.lightGray,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabledButton: {
    backgroundColor: colors.loginButtonBackgroundColor
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.text,
  },
});

export default CustomButton;