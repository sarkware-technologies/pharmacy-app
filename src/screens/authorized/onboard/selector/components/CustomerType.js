import React, { useCallback, useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import { AppText } from "../../../../../components";
import CommonStyle from "../../../../../styles/styles";
import EntityStyle from "../../style/EntityStyle";
import AppView from "../../../../../components/AppView";
import { initialFormData } from "../../utils/fieldMeta";
const RenderItem = React.memo(({ data = [], formData, onPress }) => {
  return (
    <View style={EntityStyle.radioGroupHorizontal}>
      {data.map(item => {
        const isActive =
          item.updateKey === 'categoryId'
            ? item.categoryId === formData.categoryId
            : item.subCategoryId === formData.subCategoryId;

        return (
          <TouchableOpacity
            key={`${item.name}`}
            style={EntityStyle.radioOptionHorizontal}
            onPress={() => onPress(item)}
            activeOpacity={0.8}
          >
            <View
              style={[
                EntityStyle.radioCircle,
                isActive && EntityStyle.radioCircleSelected,
              ]}
            >
              {isActive && <View style={EntityStyle.radioInner} />}
            </View>

            <AppText style={EntityStyle.radioLabel}>
              {item.name}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

const CustomerType = ({ customerType = [], formData, setFormData }) => {

  const handleClick = useCallback((item) => {
    setFormData(prev => {
      if (item.updateKey === 'categoryId') {
        return {
          ...prev,
          categoryId: item.categoryId,
        };
      }

      if (item.updateKey === 'subCategoryId') {
        return {
          ...prev,
          subCategoryId: item.subCategoryId,
        };
      }

      return prev;
    });
  }, [setFormData]);

  return (
    <AppView style={[EntityStyle.customerType, {marginTop:20}]}>
      <AppText style={[CommonStyle.primaryText, { fontSize: 20, marginVertical: 7 }]}>
        Category{" "}
        <AppText style={[CommonStyle.secondaryText, { fontSize: 20 }]}>
          (Select Any One)
        </AppText>
      </AppText>

      <RenderItem
        data={customerType?.types}
        formData={formData}
        onPress={handleClick}
      />
    </AppView>
  );
};



export default CustomerType;
