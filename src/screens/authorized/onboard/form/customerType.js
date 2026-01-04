import React, { useCallback, useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import { AppText } from "../../../../components";
import CommonStyle from "../../../../styles/styles";
import OnboardStyle from "../style/onboardStyle";
import AppView from "../../../../components/AppView";
import { initialFormData } from "../utils/fieldMeta";

const RenderItem = React.memo(({ data = [], formKey, formData, onPress }) => {
    return (
        <AppView style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {data.map((e) => {
                const isActive = e?.id === formData?.[formKey];

                return (
                    <TouchableOpacity
                        key={e.id}
                        style={[
                            OnboardStyle.customerTypeItem,
                            isActive && OnboardStyle.customerTypeItemActive,
                        ]}
                        onPress={() => onPress(formKey, e.id)}
                        activeOpacity={0.8}
                    >
                        <AppText
                            style={[
                                OnboardStyle.customerTypeItemText,
                                isActive && OnboardStyle.customerTypeItemActiveText,
                            ]}
                        >
                            {e?.name}
                        </AppText>
                    </TouchableOpacity>
                );
            })}
        </AppView>
    );
});


const CustomerType = ({ customerType, formData, setFormData, action }) => {

    const handleClick = useCallback((key, id) => {
        setFormData(prev => {
            if (key === "typeId") {
                return { ...initialFormData, typeId: id, categoryId: null, subCategoryId: null };

            }
            if (key === "categoryId") {
                return { ...initialFormData, typeId: prev?.typeId, categoryId: id, subCategoryId: null };
            }
            return { ...initialFormData, typeId: prev?.typeId, categoryId: prev?.categoryId, subCategoryId: id };
        });
    }, [setFormData]);

    const category = useMemo(() => {
        return (
            customerType?.find(e => e?.id === formData?.typeId)
                ?.customerCategories ?? []
        );
    }, [customerType, formData?.typeId]);

    const subcategory = useMemo(() => {
        return (
            category?.find(e => e?.id === formData?.categoryId)
                ?.customerSubcategories ?? []
        );
    }, [category, formData?.categoryId]);

    return (
        <AppView style={OnboardStyle.customerType}>
            <AppText style={[CommonStyle.primaryText, { fontSize: 18, marginBottom: 7 }]}>
                Type <AppText style={[CommonStyle.secondaryText, { fontSize: 18 }]}>(Select Any One)</AppText>
            </AppText>

            <RenderItem
                formKey="typeId"
                data={customerType}
                formData={formData}
                onPress={handleClick}
            />

            {!!category.length && (
                <AppView style={{ marginTop: 15 }}>
                    <AppText style={[CommonStyle.primaryText, { fontSize: 18, marginBottom: 7 }]}>
                        Category <AppText style={[CommonStyle.secondaryText, { fontSize: 18 }]}>(Select Any One)</AppText>
                    </AppText>

                    <RenderItem
                        formKey="categoryId"
                        data={category}
                        formData={formData}
                        onPress={handleClick}
                    />
                </AppView>
            )}

            {!!subcategory.length && (
                <AppView style={{ marginTop: 15 }}>
                    <AppText style={[CommonStyle.primaryText, { fontSize: 18, marginBottom: 7 }]}>
                        Sub Category
                    </AppText>

                    <RenderItem
                        formKey="subCategoryId"
                        data={subcategory}
                        formData={formData}
                        onPress={handleClick}
                    />
                </AppView>
            )}
        </AppView>
    );
};

export default CustomerType;
