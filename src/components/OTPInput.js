import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Animated,
} from 'react-native';
import { colors } from '../styles/colors';
import { AppInput } from '.';

const OTPInput = ({ value, onChange, length = 4 }) => {
  const [otp, setOtp] = useState(new Array(length).fill(''));
  const inputs = useRef([]);
  const animations = useRef(
    new Array(length).fill(0).map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Animate boxes on mount
    animations.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: 1,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  useEffect(() => {
    if (value) {
      const otpArray = value.split('');
      setOtp(otpArray.concat(new Array(length - otpArray.length).fill('')));
    }
  }, [value, length]);

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    onChange(newOtp.join(''));

    // Move to next input
    if (text && index < length - 1) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  return (
    <View style={styles.container}>
      {otp.map((digit, index) => (
        <Animated.View
          key={index}
          style={[
            styles.inputWrapper,
            {
              transform: [{ scale: animations[index] }],
            },
          ]}>
          <AppInput
            ref={(ref) => (inputs.current[index] = ref)}
            style={[
              styles.input,
              digit && styles.filledInput,
            ]}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="numeric"
            maxLength={1}
            selectTextOnFocus
          />
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  inputWrapper: {
    marginHorizontal: 8,
  },
  input: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    backgroundColor: colors.white,
  },
  filledInput: {
    borderColor: colors.primary,
    backgroundColor: colors.inputBackground,
  },
});

export default OTPInput;