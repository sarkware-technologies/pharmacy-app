import { StyleSheet, TouchableOpacity, View } from "react-native";
import AppText from "../../../../components/AppText";
import Icon from "react-native-vector-icons/MaterialIcons";
import { colors } from "../../../../styles/colors";
import { Fonts } from "../../../../utils/fontHelper";
import CommonStyle from "../../../../styles/styles";
import DateIcon from "../../../../components/icons/date";
import { useState } from "react";
import RadioOption from "../../../../components/view/RadioOption"

const ProductCard = ({ type, productLabel = "SELECTED PRODUCT", isSpecial = false }) => {

    if (type == "1") return <Type1Card />;

    if (type == "2") return <Type2Card productLabel={productLabel} isSpecial={isSpecial} />;

    if (type == "3") return <Type3Card productLabel={productLabel} isSpecial={isSpecial} />;

    return null;
};

/* -------------------------------------------------------
   TYPE 1 CARD
------------------------------------------------------- */
const Type1Card = () => {
    return (
        <View style={styles.topSection}>
            {/* Product Info */}
            <View style={styles.customerSection}>
                <View style={{ marginBottom: 10, gap: 6 }}>
                    <AppText style={[CommonStyle.secondaryText, { fontSize: 12 }]}>Selected Product</AppText>
                    <AppText style={[CommonStyle.primaryText, { fontSize: 14, fontWeight: 500 }]}>
                        BRUFFEN 100MG 1X10 TAB
                    </AppText>
                </View>

                <AppText style={[CommonStyle.secondaryText, { fontSize: 12, marginBottom: 6 }]}>
                    Selected Customer/RC’s
                </AppText>

                <TouchableOpacity style={styles.customerDropdown}>
                    <AppText style={[CommonStyle.primaryText, { fontSize: 14, fontWeight: 500 }]}>
                        4 RC’s Selected
                    </AppText>
                    <Icon name="arrow-drop-down" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Date Section */}
            <DatePickerRow />

            {/* Supply Mode */}
            <SupplyMode />
        </View>
    );
};

/* -------------------------------------------------------
   TYPE 2 CARD
------------------------------------------------------- */
const Type2Card = ({ productLabel, isSpecial }) => {
    const [viewMore, setViewMore] = useState(false);

    return (
        <View
            style={[
                styles.topSection,
                { paddingBottom: 0 },
                isSpecial ? styles.specialBackground : styles.background,
            ]}
        >
            <View style={[styles.customerSection, { padding: 10 }]}>
                <Header productLabel={productLabel} />

                {/* PTS Row */}
                <InfoRow
                    leftItems={[
                        { label: "PTS:", value: "₹70.20" },
                        { label: "PTS:", value: "₹70.20" },
                        { label: "PTS:", value: "₹70.20" }
                    ]}
                    rightContent={
                        !viewMore && (
                            <TouchableOpacity onPress={() => setViewMore(true)}>
                                <AppText style={[CommonStyle.primaryText, { color: "#F7941E", fontSize: 11 }]}>
                                    View More
                                </AppText>
                            </TouchableOpacity>
                        )
                    }
                />

                {/* View More Block */}
                {viewMore && (
                    <>
                        <InfoRow
                            leftItems={[
                                { label: "COGS:", value: "₹70.20" },
                                { label: "GC %:", value: "0.20" },
                                { label: "GC% NRV:", value: "70.20" },
                                { label: "N. NRV:", value: "₹70.20" },
                            ]}
                        />

                        <InfoRow
                            leftItems={[
                                { label: "OLD GC %:", value: "70.20" },
                                { label: "GC% PTS:", value: "₹70.20" },
                            ]}
                            rightContent={
                                <TouchableOpacity onPress={() => setViewMore(false)}>
                                    <AppText style={[CommonStyle.primaryText, { color: "#F7941E", fontSize: 11 }]}>
                                        View Less
                                    </AppText>
                                </TouchableOpacity>
                            }
                        />
                    </>
                )}
            </View>
        </View>
    );
};

/* -------------------------------------------------------
   TYPE 3 CARD
------------------------------------------------------- */
const Type3Card = ({ productLabel, isSpecial }) => {
    return (
        <View
            style={[
                styles.topSection,
                { paddingBottom: 0 },
                isSpecial ? styles.specialBackground : styles.background,
            ]}
        >
            <View style={[styles.customerSection, CommonStyle.SpaceBetween, { alignItems: "flex-end", padding: 10 }]}>
                <View style={{ gap: 6 }}>
                    <AppText style={[CommonStyle.secondaryText, { fontSize: 11 }]}>
                        {productLabel}
                    </AppText>
                    <AppText style={[CommonStyle.primaryText, { fontSize: 13, fontWeight: 500 }]}>
                        BRUFFEN 100MG 1X10 TAB
                    </AppText>
                </View>

                <AppText style={[CommonStyle.secondaryText, { fontSize: 11 }]}>10106555</AppText>
            </View>
        </View>
    );
};

/* -------------------------------------------------------
   REUSABLE COMPONENTS
------------------------------------------------------- */

const Header = ({ productLabel }) => (
    <View style={[CommonStyle.SpaceBetween, { alignItems: "flex-end" }]}>
        <View style={{ gap: 6 }}>
            <AppText style={[CommonStyle.secondaryText, { fontSize: 11 }]}>{productLabel}</AppText>
            <AppText style={[CommonStyle.primaryText, { fontSize: 13, fontWeight: 500 }]}>
                BRUFFEN 100MG 1X10 TAB
            </AppText>
        </View>

        <AppText style={[CommonStyle.secondaryText, { fontSize: 11 }]}>10106555</AppText>
    </View>
);

const InfoRow = ({ leftItems = [], rightContent = null }) => (
    <View style={[CommonStyle.SpaceBetween, { marginTop: 10 }]}>
        <View style={[CommonStyle.SpaceBetween, { gap: 15, flexWrap: "wrap" }]}>
            {leftItems.map((item, index) => (
                <View key={index} style={[CommonStyle.SpaceBetween, { gap: 1 }]}>
                    <AppText style={[CommonStyle.secondaryText, { fontSize: 11 }]}>{item.label}</AppText>
                    <AppText style={[CommonStyle.secondaryText, { fontSize: 11, color: colors.primaryText }]}>
                        {item.value}
                    </AppText>
                </View>
            ))}
        </View>

        {rightContent}
    </View>
);

/* --------------------------- DATE ROW --------------------------- */

const DatePickerRow = () => (
    <View style={styles.dateSection}>
        <DatePicker label="Start Date" />
        <DatePicker label="End Date" />
    </View>
);

const DatePicker = ({ label }) => (
    <View style={styles.dateGroup}>
        <AppText style={[CommonStyle.secondaryText, { fontSize: 12, marginBottom: 6 }]}>{label}</AppText>
        <TouchableOpacity style={styles.dateInput}>
            <AppText style={[CommonStyle.secondaryText, { fontSize: 14 }]}>Select</AppText>
            <DateIcon />
        </TouchableOpacity>
    </View>
);

/* --------------------------- SUPPLY MODE --------------------------- */

const SupplyMode = () => (
    <View style={styles.section}>
        <AppText style={[CommonStyle.secondaryText, { fontSize: 12, marginBottom: 10 }]}>
            Supply Mode
        </AppText>

        <View style={styles.supplyModeOptions}>
            <RadioOption label="Net Rate" selected />
            <RadioOption label="Chargeback" />
            <RadioOption label="Mixed" />
        </View>
    </View>
);

export default ProductCard;


const styles = StyleSheet.create({
    topSection: {
        borderRadius: 12,
        backgroundColor: 'white',
        paddingBottom: 15,
        paddingHorizontal: 5
    },
    customerSection: {
        padding: 16,
    },
    sectionLabel: {
        fontSize: 13,
        color: colors.textSecondary,
        marginBottom: 8,
    },
    customerDropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: colors.primaryText,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8
    },
    customerName: {
        fontSize: 15,
        color: colors.text,
    },

    dateSection: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 12,
    },
    dateGroup: {
        flex: 1,
    },
    dateInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "#F6F6F6"
    },
    dateText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    supplyModeOptions: {
        flexDirection: 'row',
        gap: 24,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    radio: {
        width: 14,
        height: 14,
        borderRadius: 9,
        borderWidth: 1,
        borderColor: "#909090",
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioSelected: {
        borderColor: "#F7941E",
    },
    radioSelectedText: {
        fontFamily: Fonts.Bold,
        fontWeight: 600,
        color: colors.primaryText
    },
    radioInner: {
        width: 7,
        height: 7,
        borderRadius: 5,
        backgroundColor: "#F7941E",
    },
    radioText: {
        fontSize: 13,
        color: colors.secondaryText,
        fontFamily: Fonts.Regular
    },
    section: {
        paddingHorizontal: 16,
        paddingVertical: 5,
        marginTop: 10
    },
    background: {
        backgroundColor: "#9090900D",
        borderWidth: 0.5,
        borderColor: "#909090"
    },
    specialBackground: {
        backgroundColor: "#F7941E0D",
        borderWidth: 0.5,
        borderColor: "#F7941E"
    }

})


