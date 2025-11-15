import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import AppText from "../AppText";

export default function CustomCheckbox({
  title = "",
  checked: controlledChecked,
  onChange,
  containerStyle,
  checkboxStyle,
  textStyle,
  activeColor = "#007AFF",
  inactiveColor = "#C7C7CC",
  disabled = false,
  disabledColor = "#E5E5E5",
  size = 18,
}) {
  const [internalChecked, setInternalChecked] = useState(false);
  const checked = controlledChecked ?? internalChecked;

  const handlePress = () => {
    if (disabled) return;
    const newValue = !checked;
    setInternalChecked(newValue);
    onChange?.(newValue);
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { opacity: disabled ? 0.5 : 1 },
        containerStyle,
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <View
        style={[
          styles.checkbox,
          {
            borderColor: disabled
              ? disabledColor
              : checked
                ? activeColor
                : inactiveColor,
            backgroundColor:
              disabled ? disabledColor : checked ? activeColor : "transparent",
            width: size,
            height: size,
            borderRadius: size / 4,
          },
          checkboxStyle,
        ]}
      >
        {checked && !disabled && (
          <AppText style={[styles.checkMark, { fontSize: size - 8 }]}>
            ✓
          </AppText>
        )}
      </View>

      {title ? <AppText style={[styles.label, textStyle]}>{title}</AppText> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  checkMark: {
    color: "#fff",
    fontWeight: "600",
  },
  label: {
    fontSize: 16,
    color: "#333",
  },
});
