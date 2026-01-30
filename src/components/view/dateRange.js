import React, { useEffect, useState } from "react";
import { View, Modal, TouchableOpacity, Text } from "react-native";
import { Calendar } from "react-native-calendars";
import Button from "../Button";
import AppView from "../AppView";
import { colors } from "../../styles/colors";

const DateRangePicker = ({
  visible,
  onClose,
  handleChange,
  value,
  maxDate = new Date().toISOString().split("T")[0],
}) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    if (visible && value?.startDate && value?.endDate) {
      setStartDate(value.startDate.slice(0, 10));
      setEndDate(value.endDate.slice(0, 10));
    }
  }, [visible]);

  const toISOStringUTC = (dateString) => {
    return `${dateString}T00:00:00Z`;
  };


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
        [startDate]: { startingDay: true, endingDay: true, color: "#F7941E", textColor: "white" },
      };
    }

    let marked = {};
    let current = new Date(startDate);
    let end = new Date(endDate);

    while (current <= end) {
      const date = current.toISOString().split("T")[0];
      marked[date] = {
        color: "#F7941E",
        textColor: "white",
        ...(date === startDate && { startingDay: true }),
        ...(date === endDate && { endingDay: true }),
      };
      current.setDate(current.getDate() + 1);
    }

    return marked;
  };



  return (
    <Modal  visible={visible} transparent animationType="slide" onRequestClose={()=>onClose?.()}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            borderBottomEndRadius: 0,
            borderBottomLeftRadius: 0,
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
              marginTop: 30,
              marginBottom: 10,
            }}
          >
            {startDate && endDate ? (
              <Button
                backgroundColor={"white"}
                onPress={() => {
                  handleChange && handleChange({ startDate: null, endDate: null });
                  setStartDate(null);
                  setEndDate(null);
                  onClose && onClose();
                }}
                style={{ borderWidth: 0.5 }}
                textStyle={{ color: colors.primaryText, }}
              >
                Clear
              </Button>
            ) : (
              <Button
                backgroundColor={"gray"}
                onPress={() => {
                  onClose && onClose();
                }}
              >
                Close
              </Button>
            )}

            <Button
              disabled={!startDate || !endDate}
              onPress={() => {
                handleChange &&
                  handleChange({
                    startDate: toISOStringUTC(startDate),
                    endDate: toISOStringUTC(endDate),
                  });
                onClose && onClose();
              }}
            >
              Apply
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DateRangePicker;
