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

  // If user cancels → do nothing and keep placeholder
  if (event.type === 'dismissed') {
    // If NO value present → drop label back down
    if (!value) {
      Animated.timing(floatingLabelAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
    return;
  }

  // If user selects a date
  if (event.type === "set" && selectedDate) {

    // const year = selectedDate.getFullYear();
    // const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    // const day = String(selectedDate.getDate()).padStart(2, '0');

    // const formattedDate = `${year}-${month}-${day}`;
    // onChange(formattedDate);

    const isoDate = selectedDate.toISOString();
    onChange(isoDate);

    // Ensure label floats upward
    Animated.timing(floatingLabelAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
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

const parseToDate = (dateString) => {  
  if (!dateString) return new Date();
  // ISO format (2025-12-22T00:00:00.000Z)
  if (dateString.includes("T")) {
    return new Date(dateString);
  }
  // DD/MM/YYYY support
  if (dateString.includes("/")) {
    const [day, month, year] = dateString.split("/");
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  return new Date();
};
const formatDisplayDate = (isoString) => {
  if (!isoString) return "";

  const date = new Date(isoString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
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
            {formatDisplayDate(value) || ""} {/* Already in DD/MM/YYYY */}
          </AppText>
        </TouchableOpacity>

        {/* Right Icon */}
        <TouchableOpacity style={styles.rightIcon} onPress={openPicker}>
  {rightComponent ? rightComponent : <CalendarIcon />}
</TouchableOpacity>
      </View>

      {/* Error Message */}
      {error && <AppText style={styles.errorText}>{error}</AppText>}

      {/* Date Picker */}
      {showPicker && (
        <DateTimePicker
          value={parseToDate(value)}   // Always convert string to Date
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
