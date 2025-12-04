/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
import { AppText } from ".";
import CalendarIcon from "./icons/Calendar";
import { colors } from "../styles/colors";

const FloatingDateInput = ({
  label,
  value,
  mandatory = false,
  error = null,
  minimumDate = null,
  maximumDate = null,
  onChange = () => { },
  rightComponent = null,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  // Floating label animation (same as CustomInput)
  const floatingLabelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    if (value) {
      Animated.timing(floatingLabelAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [value]);

  const openPicker = () => {
    setShowPicker(true);
    Animated.timing(floatingLabelAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleDateChange = (event, selectedDate) => {
    setShowPicker(false);

    if (event.type === "set" && selectedDate) {
      onChange(selectedDate);
    }
  };


  const labelTextStyle = {
    fontSize: floatingLabelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12], // big → small
    }),
    color: floatingLabelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.gray, colors.primary], // gray → primary
    }),
    fontFamily: "Lato-Bold",
  };
  return (
    <View style={styles.container}>
      {/* INPUT BOX */}
      <View style={[
        styles.inputContainer,
        error && styles.inputContainerError
      ]}>

        {/* Floating Label */}
        <Animated.View
          style={[
            styles.labelContainer,
            {
              top: floatingLabelAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [18, -10],
              }),
            },
          ]}
          pointerEvents="none"
        >
          <Animated.Text style={labelTextStyle}>
            {label}{mandatory && <AppText style={styles.asterisk}>*</AppText>}
          </Animated.Text>
        </Animated.View>

        {/* Touchable field */}
        <TouchableOpacity
          style={styles.dateTouchable}
          activeOpacity={0.7}
          onPress={openPicker}
        >
          <AppText style={value ? styles.valueText : styles.placeholderText}>
            {value ? new Date(value).toLocaleDateString("en-IN") : ""}
          </AppText>
        </TouchableOpacity>

        {/* Right Icon */}
        <View style={styles.rightIcon}>
          {rightComponent ? rightComponent : <CalendarIcon />}
        </View>
      </View>

      {/* Error Message */}
      {error && <AppText style={styles.errorText}>{error}</AppText>}

      {/* Date Picker */}
      {showPicker && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode="date"
          display="default"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={handleDateChange}
        />
      )}
    </View>
  );
};

export default FloatingDateInput;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },

  inputContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.loginInputBorderColor,
    height: 56,
    paddingHorizontal: 16,
    justifyContent: "center",
  },

  inputContainerError: {
    borderColor: colors.error,
  },

  labelContainer: {
    position: "absolute",
    left: 16,
    backgroundColor: colors.white,
    paddingHorizontal: 4,
    zIndex: 10,
  },

  labelText: {
    fontFamily: "Lato-Bold",
  },

  asterisk: {
    color: "red",
    fontSize: 16,
  },

  dateTouchable: {
    flex: 1,
    justifyContent: "center",
  },

  placeholderText: {
    fontSize: 16,
    color: "#999",
    fontFamily: "Lato-Bold",
  },

  valueText: {
    fontSize: 16,
    color: colors.text,
    fontFamily: "Lato-Bold",
  },

  rightIcon: {
    position: "absolute",
    right: 16,
    top: 16,
  },

  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
