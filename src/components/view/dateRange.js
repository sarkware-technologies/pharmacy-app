import React, { useState } from "react";
import { View, Modal, TouchableOpacity, Text } from "react-native";
import { Calendar } from "react-native-calendars";

const DateRangePicker = ({
  visible,
  onClose,
  handleChange,
  maxDate = new Date().toISOString().split("T")[0],
}) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const onDayPress = (day) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(day.dateString);
      setEndDate(null);
    } else {
      setEndDate(day.dateString);
    }
  };

  const getMarkedDates = () => {
    if (!startDate) return {};

    if (!endDate) {
      return {
        [startDate]: { startingDay: true, endingDay: true, color: "#F7941E" },
      };
    }

    let marked = {};
    let current = new Date(startDate);
    let end = new Date(endDate);

    while (current <= end) {
      const date = current.toISOString().split("T")[0];
      marked[date] = {
        color: "#F7941E",
        ...(date === startDate && { startingDay: true }),
        ...(date === endDate && { endingDay: true }),
      };
      current.setDate(current.getDate() + 1);
    }

    return marked;
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 12,
          }}
        >
          <Calendar
            markingType="period"
            markedDates={getMarkedDates()}
            onDayPress={onDayPress}
            maxDate={maxDate}
          />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 12,
            }}
          >
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: "red" }}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={!startDate || !endDate}
              onPress={() => {
                handleChange && handleChange({ startDate, endDate });
                onClose && onClose();
              }}
            >
              <Text style={{ color: "#F7941E", fontWeight: "600" }}>
                Apply
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DateRangePicker;
