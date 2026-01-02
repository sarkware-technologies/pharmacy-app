import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { AppInput, AppText } from "../../../../../components";
import { colors } from "../../../../../styles/colors";
import { Fonts } from "../../../../../utils/fontHelper";
import CommonStyle from "../../../../../styles/styles";
import RadioOption from "../../../../../components/view/RadioOption";
import Svg, { Path } from "react-native-svg";
import CustomDropdown from "../../../../../components/view/customDropdown";
import SelectDivision from "../modal/selectDivision"

const DistributorCard = ({ distributor, setValue, disabled }) => {
  console.log(distributor?.margin, 23984267)

  const handleSetValue = (params) => {
    const newdistributor = { ...distributor, ...params }
    let error = null;
    if (newdistributor.error) {
      if (newdistributor?.divisions && !newdistributor.divisions.some((a) => a.isChecked)) {
        error = "division";
      } else if (newdistributor?.margin == null || newdistributor?.margin === "") {
        error = "margin";
      } else if (newdistributor?.supplyMode == null) {
        error = "supplyMode";
      } else if (Number(newdistributor?.margin) < 1 || Number(newdistributor?.margin) > 100) {
        error = "margin";
      }
    }
    setValue?.({
      ...newdistributor,
      error
    })
  }

  const [showDiv, setShowDiv] = useState(false);
  return (
    <View style={styles.card}>
      {/* Header */}
      <AppText style={styles.title}>{distributor?.name}</AppText>
     <View style={CommonStyle.SpaceBetween}>
  {/* LEFT INFO */}
  <View style={styles.subRow}>
    <AppText numberOfLines={1} style={styles.subText}>
      {distributor?.code ?? "-"}
    </AppText>
    <AppText style={styles.separator}>|</AppText>
    <AppText numberOfLines={1} style={styles.subText}>
      {distributor?.cityName ?? "-"}
    </AppText>
    <AppText style={styles.separator}>|</AppText>
    <AppText numberOfLines={1} style={styles.subText}>
      {distributor?.cityName ?? "-"}
    </AppText>
  </View>

  {/* RIGHT LABEL — MATCH INPUT WIDTH */}
  <View style={styles.marginLabelBox}>
    <AppText style={styles.subText}>Margin</AppText>
  </View>
</View>
      {/* Dropdowns + Margin */}
      <View style={styles.row}>
        <CustomDropdown
          disabled={disabled}
          data={[{ label: "SPLL", value: "SPLL" }, { label: "SPIL", value: "SPIL" }, { label: "BOTH", value: "BOTH" }]}
          value={distributor?.organizationCode}
          onChange={(e) => {
            let error = null;
            if (distributor.error) {
              if (distributor?.divisions && !distributor.divisions.some((a) => a.isChecked)) {
                error = "division";
              } else if (distributor?.margin == null || distributor?.margin === "") {
                error = "margin";
              } else if (distributor?.supplyMode == null) {
                error = "supplyMode";
              } else if (Number(distributor?.margin) < 1 || Number(distributor?.margin) > 100) {
                error = "margin";
              }
            }
            handleSetValue?.({ organizationCode: e })
          }}
        >
          <View style={[styles.dropdown, { flex: 1 }]}>
            <AppText numberOfLines={1} style={styles.dropdownText}>{distributor?.organizationCode ?? "SPLL"}</AppText>
            <Svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <Path d="M0.5 0.5L4.875 4.875L9.25 0.5" stroke="#909090" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
        </CustomDropdown>

        <TouchableOpacity disabled={disabled} style={[
          styles.dropdown,
          { flex: 1 },
          distributor?.error == "division" && { borderWidth: 1, borderColor: "red" }
        ]}

          onPress={() => setShowDiv(true)}>
          <AppText style={styles.dropdownText}>{"All Divisions"}</AppText>
          <Svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <Path d="M0.5 0.5L4.875 4.875L9.25 0.5" stroke="#909090" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>

        </TouchableOpacity>


        <View style={[styles.marginBox, distributor?.error == "margin" && { borderWidth: 1, borderColor: "red" }]}>
          <AppInput
            style={[styles.marginInput]}
            value={distributor?.margin != null ? String(distributor.margin) : ""}
            keyboardType="numeric"
            onChangeText={(text) => handleSetValue?.({ margin: text })}
            editable={!disabled}
          />
          <AppText style={styles.percent}>% </AppText>
        </View>
      </View>

      {/* Radio buttons */}
      <View style={styles.bottomRow}>
        <View >
          <View style={styles.radioRow}>
            <RadioOption disabled={disabled} onSelect={() => handleSetValue?.({ supplyMode: 1 })} label="Net Rate" selected={distributor?.supplyMode == 1} />
            <RadioOption disabled={disabled} onSelect={() => handleSetValue?.({ supplyMode: 2 })} label="Chargeback" selected={distributor?.supplyMode == 2} />
          </View>
          {distributor?.error == "supplyMode" && (
            <AppText style={{ color: "red", fontSize: 12, marginTop: 7, paddingLeft: 10 }}>Select supply Mode</AppText>
          )}
        </View>

        {/* Remove */}
        <TouchableOpacity disabled={disabled} style={styles.removeRow} onPress={() => handleSetValue?.({ isActive: false })}>
          <AppText style={styles.removeText}>Remove</AppText>
          <Svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <Path d="M10.125 2.54167L9.76333 8.38958C9.67117 9.8835 9.62508 10.6308 9.25 11.168C9.06483 11.4335 8.82645 11.6576 8.55 11.826C7.99175 12.1667 7.24333 12.1667 5.7465 12.1667C4.24733 12.1667 3.49775 12.1667 2.93833 11.8254C2.66177 11.6567 2.42337 11.4322 2.23833 11.1663C1.86383 10.6284 1.81833 9.88 1.7285 8.38375L1.375 2.54167M0.5 2.54167H11M8.116 2.54167L7.71758 1.72033C7.45333 1.17433 7.32092 0.901917 7.09283 0.731583C7.04217 0.693851 6.98852 0.660296 6.93242 0.63125C6.67983 0.5 6.3765 0.5 5.77042 0.5C5.14858 0.5 4.83767 0.5 4.58042 0.6365C4.52355 0.666956 4.46931 0.702077 4.41825 0.7415C4.18783 0.91825 4.05892 1.20117 3.80108 1.76642L3.44758 2.54167" stroke="#909090" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>

        </TouchableOpacity>
      </View>
      <SelectDivision onSelectDivision={(e) => handleSetValue?.({ divisions: e })}
        visible={showDiv} onClose={() => setShowDiv(false)} divisions={distributor?.divisions} />
    </View>
  );
};

export default DistributorCard;




const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 6,
    backgroundColor: "#FBFBFB"
  },

  title: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primaryText,
    fontFamily: Fonts.Bold
  },

  subRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  subText: {
    color: colors.secondaryText,
    fontSize: 12,
    fontFamily: Fonts.Regular
  },

  separator: {
    marginHorizontal: 6,
    color: "#aaa",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 12,
    width: "100%",
  },

  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 14,
    height: 35,
    justifyContent: "space-between",
    minWidth: 90,
  },

  dropdownText: {
    fontSize: 12,
    color: colors.primaryText,
    fontFamily: Fonts.Regular,
    fontWeight: 400
  },

  arrow: {
    fontSize: 16,
    color: "#888",
  },

  marginLabelBox: {
  width: 90,            
  alignItems: "flex-start", 
},
  marginBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingLeft: 0,
    height: 35,
    width: 90,
    justifyContent: "space-between",

  },

  marginInput: {
    fontSize: 12,
    fontWeight: "400",
    color: colors.primaryText,
    width: "80%",
    fontFamily: Fonts.Regular,
    height: "100%",
    paddingLeft: 15
  },

  percent: {
    fontSize: 12,
    color: "#777",
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginTop: 18,
  },

  radioRow: {
    flexDirection: "row",
    gap: 20,
  },

  radio: {
    flexDirection: "row",
    alignItems: "center",
  },

  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },

  radioOuterActive: {
    borderColor: "#f28c28",
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#f28c28",
  },

  radioText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },

  radioTextDisabled: {
    fontSize: 16,
    color: "#aaa",
  },

  removeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  removeText: {
    color: "#F7941E",
    fontSize: 12,
    fontWeight: "600",
  },

  trash: {
    fontSize: 18,
    color: "#999",
  },
});


