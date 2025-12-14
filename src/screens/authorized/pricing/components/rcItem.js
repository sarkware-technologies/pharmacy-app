import { StyleSheet, TouchableOpacity, View } from "react-native";
import AppText from "../../../../components/AppText"
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from "../../../../styles/colors";
import { Fonts } from "../../../../utils/fontHelper";
import CommonStyle from "../../../../styles/styles";
import DateIcon from "../../../../components/icons/date"
import { AppInput } from "../../../../components";
import Delete from "../../../../components/icons/Delete";
import Svg, { Path } from "react-native-svg";
import RadioOption from "../../../../components/view/RadioOption";
import CustomCheckbox from "../../../../components/view/checkbox";

const RcItem = ({ product = {}, type = 1 }) => {
    return (
        <View style={styles.productCard}>
            <View style={styles.productHeader}>
                <CustomCheckbox activeColor="#F7941E" size={14} title={<AppText style={styles.productName}>Agarwal Maternity General hospital</AppText>} />

            </View>
            <View style={styles.productHeader}>
                <AppText style={styles.productName}>Agarwal Maternity General hospital</AppText>
                <TouchableOpacity onPress={() => { }}>
                    <Svg width="13" height="15" viewBox="0 0 13 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <Path d="M11.5 2.83333L11.0867 9.51667C10.9813 11.224 10.9287 12.078 10.5 12.692C10.2884 12.9954 10.0159 13.2515 9.7 13.444C9.062 13.8333 8.20667 13.8333 6.496 13.8333C4.78267 13.8333 3.926 13.8333 3.28667 13.4433C2.97059 13.2505 2.69814 12.9939 2.48667 12.69C2.05867 12.0753 2.00667 11.22 1.904 9.51L1.5 2.83333M0.5 2.83333H12.5M9.204 2.83333L8.74867 1.89467C8.44667 1.27067 8.29533 0.959333 8.03467 0.764667C7.97676 0.721544 7.91545 0.683195 7.85133 0.65C7.56267 0.5 7.216 0.5 6.52333 0.5C5.81267 0.5 5.45733 0.5 5.16333 0.656C5.09834 0.690807 5.03635 0.730945 4.978 0.776C4.71467 0.978 4.56733 1.30133 4.27267 1.94733L3.86867 2.83333" stroke="#909090" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>

                </TouchableOpacity>
            </View>

            <View style={styles.productInfo}>
                <View style={styles.productCode}>
                    <Svg width="11" height="10" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <Path d="M7.16667 1.16667H12.5M7.16667 3.83333H10.5M7.16667 7.83333H12.5M7.16667 10.5H10.5M0.5 1.16667C0.5 0.989856 0.570238 0.820287 0.695262 0.695262C0.820286 0.570238 0.989856 0.5 1.16667 0.5H3.83333C4.01014 0.5 4.17971 0.570238 4.30474 0.695262C4.42976 0.820287 4.5 0.989856 4.5 1.16667V3.83333C4.5 4.01014 4.42976 4.17971 4.30474 4.30474C4.17971 4.42976 4.01014 4.5 3.83333 4.5H1.16667C0.989856 4.5 0.820286 4.42976 0.695262 4.30474C0.570238 4.17971 0.5 4.01014 0.5 3.83333V1.16667ZM0.5 7.83333C0.5 7.65652 0.570238 7.48695 0.695262 7.36193C0.820286 7.2369 0.989856 7.16667 1.16667 7.16667H3.83333C4.01014 7.16667 4.17971 7.2369 4.30474 7.36193C4.42976 7.48695 4.5 7.65652 4.5 7.83333V10.5C4.5 10.6768 4.42976 10.8464 4.30474 10.9714C4.17971 11.0964 4.01014 11.1667 3.83333 11.1667H1.16667C0.989856 11.1667 0.820286 11.0964 0.695262 10.9714C0.570238 10.8464 0.5 10.6768 0.5 10.5V7.83333Z" stroke="#909090" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                    <AppText style={styles.productcodeText}>2536</AppText>
                    <AppText style={styles.productcodeText}>|</AppText>
                    <AppText style={styles.productcodeText}>Pune</AppText>
                    <AppText style={styles.productcodeText}>|</AppText>
                    <AppText style={styles.productcodeText}>SUNRC_1 (Count: 500)</AppText>
                </View>
            </View>
            {type == 1 ? (
                <>

                    <View style={styles.productInputRow}>
                        <View style={styles.inputGroup}>
                            <AppText style={[styles.inputLabel]}>Special Price Type</AppText>
                            <TouchableOpacity style={styles.dropdown}>
                                <AppText style={styles.dropdownText}>Discount on PTR</AppText>
                                <Icon name="arrow-drop-down" size={20} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputGroupSmall}>
                            <AppText style={styles.inputLabel}>Discount (%)</AppText>
                            <View style={styles.discountInput}>
                                <AppInput
                                    style={styles.discountValue}
                                    value={product?.discount}
                                    editable={false}
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
                                    value={"60.20"}
                                    editable={true}
                                />
                            </View>
                        </View>
                        <View style={styles.inputGroupSmall}>
                            <AppText style={styles.inputLabel}>MOQ(Monthly)</AppText>
                            <View style={styles.discountInput}>
                                <AppInput
                                    style={styles.discountValue}
                                    value={product?.discount}
                                    editable={true}
                                />
                            </View>
                        </View>

                    </View>

                    <View style={styles.supplyModeOptions}>
                        <RadioOption label="Net Rate" selected />
                        <RadioOption label="Chargeback" />
                        <RadioOption label="Mixed" />
                    </View>
                </>

            ) : (
                <View >
                    <TouchableOpacity style={styles.dropdown}>
                        <AppText style={styles.dropdownText}>View Linked Distributors</AppText>
                        <Icon name="arrow-drop-down" size={20} color={colors.text} />
                    </TouchableOpacity>
                </View>
            )
            }



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
    moqInput: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 8,
        alignItems: 'center',
    },
    moqText: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    supplyModeRow: {
        flexDirection: 'row',
        gap: 24,
        marginTop: 4,
        marginBottom: 8,
    },
    supplyModeOptions: {
        flexDirection: 'row',
        gap: 24,
    },

});

export default RcItem;