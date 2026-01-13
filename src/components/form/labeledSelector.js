import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import AppText from "../AppText";
import Downarrow from "../icons/downArrow";

const labeledSelector = ({
  value,
  placeholder = "Search hospital name/code",
  onPress,
  style,
  disabled = false,
  sufix=true
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.container,
        disabled && styles.disabled,
        style,
      ]}
    >
      <AppText
        fontFamily="regular"
        numberOfLines={1}
        style={[
          styles.text,
          !value && styles.placeholder,
        ]}
      >
        {value || placeholder}
      </AppText>

      {sufix && <Downarrow /> }

     
    </TouchableOpacity>
  );
};

export default labeledSelector;
const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    borderWidth: 1.5,
    borderColor: "#E3E3E3",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,   // 👈 vertical centering
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },

  text: {
    fontSize: 15,
    color: "#000",
    flex: 1,
  },

  placeholder: {
    color: "#999",
  },

  disabled: {
    opacity: 0.6,
     backgroundColor: '#F5F5F5',
  },
});
