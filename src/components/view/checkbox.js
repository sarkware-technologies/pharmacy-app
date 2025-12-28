import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
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
  borderWidth = 2,
  checkIcon = "✓",
}) {
  /* -------------------- State -------------------- */
  const [internalChecked, setInternalChecked] = useState(false);
  const checked = controlledChecked ?? internalChecked;

  /* -------------------- Animated values -------------------- */
  const bgScale = useRef(new Animated.Value(checked ? 1 : 0)).current;
  const bgOpacity = useRef(new Animated.Value(checked ? 1 : 0)).current;
  const iconScale = useRef(new Animated.Value(checked ? 1 : 0)).current;
  const iconOpacity = useRef(new Animated.Value(checked ? 1 : 0)).current;

  /* -------------------- Animations -------------------- */
  useEffect(() => {
    Animated.parallel([
      Animated.spring(bgScale, {
        toValue: checked ? 1 : 0,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(bgOpacity, {
        toValue: checked ? 1 : 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(iconScale, {
        toValue: checked ? 1 : 0,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(iconOpacity, {
        toValue: checked ? 1 : 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [checked]);

  /* -------------------- Handler -------------------- */
  const handlePress = () => {
    if (disabled) return;
    const newValue = !checked;
    setInternalChecked(newValue);
    onChange?.(newValue);
  };

  /* -------------------- UI -------------------- */
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { opacity: disabled ? 0.5 : 1 },
        containerStyle,
      ]}
      onPress={handlePress}
      activeOpacity={1}
      disabled={disabled}
    >
      {/* Checkbox */}
      <View
        style={[
          styles.checkbox,
          {
            width: size,
            height: size,
            borderRadius: size / 4,
            borderWidth,
            borderColor: disabled
              ? disabledColor
              : checked
                ? activeColor
                : inactiveColor,
          },
          checkboxStyle,
        ]}
      >
        {/* Animated background */}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: activeColor,
              // borderRadius: size / 6,
              opacity: bgOpacity,
              transform: [{ scale: bgScale }],
            },
          ]}
        />

        {/* Animated check icon */}
        <Animated.View
          style={{
            opacity: iconOpacity,
            transform: [{ scale: iconScale }],
          }}
        >
          <AppText
            style={[
              styles.checkMark,
              { fontSize: size - 8 },
            ]}
          >
            {checkIcon}
          </AppText>
        </Animated.View>
      </View>

      {/* Title */}
      {typeof title === "string" || typeof title === "number" ? (
        <AppText style={[styles.label, textStyle]}>{title}</AppText>
      ) : (
        title
      )}
    </TouchableOpacity>
  );
}

/* -------------------- Styles -------------------- */
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    overflow: "hidden",
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
