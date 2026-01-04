import { useEffect, useRef, useState } from "react";
import {
  View,
  Animated,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import OnboardStyle from "../../screens/authorized/onboard/style/onboardStyle";
import AppText from "../AppText";
import { colors } from "../../styles/colors";
import DateTimePicker from "@react-native-community/datetimepicker";
import CalendarIcon from "../icons/Calendar";

const FloatingDatePicker = ({
  label,
  value,
  isRequired = false,
  error = null, 
  minimumDate = null,
  maximumDate = null,
  disabled = false,
  onChange,
  style,
  labelStyle
}) => {

  const [visible, setVisible] = useState(false);

  // 🔥 IMPORTANT FIX
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  // 🔥 Animate label when value changes (edit / API / manual select)
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const parseToDate = (dateString) => {
    if (!dateString) return new Date();

    if (dateString.includes("T")) {
      return new Date(dateString);
    }

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

  const LocallabelStyle = {
    position: "absolute",
    left: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 16],
    }),
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [14, -10],
    }),
    color: disabled
      ? "#bdbdbd"
      : error
      ? "#d32f2f"
      : "#999",
    backgroundColor: "white",
    paddingLeft: 5,
    paddingRight: 0,
    zIndex: 99
  };

  const handleDateChange = (event, selectedDate) => {
    setVisible(false);

    if (event.type === "dismissed") return;

    if (selectedDate) {
      onChange?.(selectedDate.toISOString());
    }
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => !disabled && setVisible(true)}
        style={[
          styles.container,
          error && styles.errorContainer,
          style,
        ]}
      >
        <Animated.Text style={[LocallabelStyle, labelStyle]}>
          {label}{" "}
          {isRequired && (
            <AppText style={[OnboardStyle.requiredIcon, { fontSize: 12 }]}>
              *
            </AppText>
          )}
        </Animated.Text>

        <AppText style={{ paddingLeft: 20 }}>
          {formatDisplayDate(value)}
        </AppText>

        <View style={{ paddingHorizontal: 20 }}>
          <CalendarIcon />
        </View>
      </TouchableOpacity>

      {visible && (
        <DateTimePicker
          value={parseToDate(value)}
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

export default FloatingDatePicker;

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    borderWidth: 1.5,
    borderColor: "#E3E3E3",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 17,
    justifyContent: "space-between"
  },
  input: {
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#000",
    flex: 1
  },
  errorInput: {
    borderColor: "#d32f2f",
  },
  disabledInput: {
    borderColor: "#e0e0e0",
    backgroundColor: "#f5f5f5",
    color: "#9e9e9e",
  },
  inputStyle: {
    paddingVertical: 20,
  },
  focusedContainer: {
    borderColor: colors.primary,
    borderWidth: 1.5,
    fontWeight: 600
  },
});
