import { StyleSheet, TouchableOpacity, View } from "react-native";
import AppText from "../../../../components/AppText"
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from "../../../../styles/colors";
import { Fonts } from "../../../../utils/fontHelper";
import CommonStyle from "../../../../styles/styles";
import { AppInput } from "../../../../components";
import CustomDropdown from "../../../../components/view/customDropdown"

const UpdateAll = ({ value = { specialType: {} }, specialPriceType = [], handleAction }) => {

    return (
        <View style={styles.productCard}>
            <View style={styles.productHeader}>
                <AppText style={styles.productName}>UPDATE FOR ALL</AppText>
            </View>


            <View style={[styles.productInputRow, { marginTop: 10 }]}>
                <View style={styles.inputGroup}>
                    <AppText style={[styles.inputLabel]}>Special Price Type</AppText>
                    <CustomDropdown
                        data={specialPriceType}
                        value={value?.specialType?.value}
                        onChange={(e) => {
                            const selected = specialPriceType.find(
                                (s) => s.value === e
                            );
                            handleAction?.("specialType", selected);
                        }}
                    >
                        <View style={styles.dropdown}>
                            <AppText style={styles.dropdownText}>{value?.specialType?.label ?? "Discount on PTR"}</AppText>
                            <Icon name="arrow-drop-down" size={20} color={colors.text} />
                        </View>
                    </CustomDropdown>
                </View>

                <View style={styles.inputGroupSmall}>
                    <AppText style={styles.inputLabel}>Discount (%)</AppText>
                    <View style={styles.discountInput}>
                        <AppInput
                            style={styles.discountValue}
                            value={value?.discount}
                            onChangeText={(text) => handleAction?.("discount", text)}
                        />
                        <AppText style={styles.percentSign}>%</AppText>
                    </View>
                </View>
            </View>

            <View style={styles.productInputRow}>
                <View style={styles.inputGroup}>
                    <AppText style={styles.inputLabel}>Special Price</AppText>
                    <View style={styles.priceInputContainer}>
                        <AppText style={styles.rupeeSign}>₹</AppText>
                        <AppInput
                            style={styles.priceInput}
                            value={value?.price}
                            editable={true}
                            onChangeText={(text) => handleAction?.("price", text)}

                        />
                    </View>
                </View>
                <View style={styles.inputGroupSmall}>
                    <AppText style={styles.inputLabel}>MOQ(Monthly)</AppText>
                    <View style={styles.discountInput}>
                        <AppInput
                            style={styles.discountValue}
                            value={value?.discount}
                            editable={true}
                            onChangeText={(text) => handleAction?.("moq", text)}
                        />
                    </View>
                </View>
            </View>
        </View >
    )
}



const styles = StyleSheet.create({


    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    radio: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioSelected: {
        borderColor: colors.primary,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary,
    },
    radioText: {
        fontSize: 14,
        color: colors.secondaryText,
        fontWeight: 400,
        fontFamily: Fonts.Regular
    },
    radioTextActive: {
        fontSize: 14,
        color: colors.primaryText,
        fontWeight: 400,
        fontFamily: Fonts.Bold
    },

    productCard: {
        borderRadius: 12,
        padding: 16,
        paddingHorizontal: 20,
        marginBottom: 12,
        backgroundColor: colors.white,
    },
    productHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    productName: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
    },
    productInfo: {
        marginBottom: 12,
    },
    productCode: {
        fontSize: 12,
        color: colors.textSecondary,
        alignItems: "center",
        display: "flex",
        flexDirection: "row",
        gap: 5
    },
    productcodeText: {
        fontSize: 13,
        ...CommonStyle.secondaryText
    },
    productInputRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    inputGroup: {
        flex: 2,
    },
    inputGroupSmall: {
        flex: 1,
    },
    inputLabel: {
        fontSize: 11,
        color: colors.textSecondary,
        marginBottom: 4,
        ...CommonStyle.secondaryText
    },
    dropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    dropdownText: {
        fontSize: 13,
        color: colors.text,
        ...CommonStyle.secondaryText
    },
    discountInput: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    discountValue: {
        flex: 1,
        fontSize: 13,
        color: colors.text,
        padding: 0,
    },
    percentSign: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    priceInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    rupeeSign: {
        fontSize: 13,
        color: colors.textSecondary,
        marginRight: 4,
    },
    priceInput: {
        flex: 1,
        fontSize: 13,
        color: colors.text,
        padding: 0,
    },


});

export default UpdateAll;