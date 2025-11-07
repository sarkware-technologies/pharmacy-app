import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";

export default function CustomCheckbox({
  title = "",
  checked: controlledChecked,
  onChange,
  containerStyle,
  checkboxStyle,
  textStyle,
  activeColor = "#007AFF",
  inactiveColor = "#C7C7CC",
  size = 18,
}) {
  const [internalChecked, setInternalChecked] = useState(false);
  const checked = controlledChecked ?? internalChecked;

  const handlePress = () => {
    const newValue = !checked;
    setInternalChecked(newValue);
    onChange?.(newValue);
  };

  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.checkbox,
          {
            borderColor: checked ? activeColor : inactiveColor,
            backgroundColor: checked ? activeColor : "transparent",
            width: size,
            height: size,
            borderRadius: size / 4,
          },
          checkboxStyle,
        ]}
      >
        {checked && <Text style={[styles.checkMark, { fontSize: size - 8 }]}>✓</Text>}
      </View>

      {title ? <Text style={[styles.label, textStyle]}>{title}</Text> : null}
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
    fontSize: 12,
    fontWeight: "600",
  },
  label: {
    fontSize: 16,
    color: "#333",
  },
});
