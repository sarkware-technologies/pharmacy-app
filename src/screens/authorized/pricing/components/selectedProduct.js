import { StyleSheet, TouchableOpacity, View } from "react-native";
import AppText from "../../../../components/AppText";
import Icon from "react-native-vector-icons/MaterialIcons";
import { colors } from "../../../../styles/colors";
import { Fonts } from "../../../../utils/fontHelper";
import CommonStyle from "../../../../styles/styles";
import DateIcon from "../../../../components/icons/date";
import { useState } from "react";
import RadioOption from "../../../../components/view/RadioOption"

const ProductCard = ({ type, productLabel = "SELECTED PRODUCT", isSpecial = false, product, customerList, handleAction, multiSelect }) => {

    if (type == "1") return <Type1Card product={product} customerList={customerList} handleAction={handleAction} />;

    if (type == "2") return <Type2Card product={product} productLabel={productLabel} isSpecial={isSpecial} handleAction={handleAction} multiSelect={multiSelect} />;

    if (type == "3") return <Type3Card product={product} productLabel={productLabel} isSpecial={isSpecial} handleAction={handleAction} />;

    return null;
};

/* -------------------------------------------------------
   TYPE 1 CARD
------------------------------------------------------- */
const Type1Card = ({ product, customerList, handleAction }) => {
    const rcCount = customerList?.length || 0;
    return (
        <View style={styles.topSection}>
            {/* Product Info */}
            <View style={styles.customerSection}>
                <View style={{ marginBottom: 0, gap: 6 }}>
                    <AppText style={[CommonStyle.secondaryText, { fontSize: 12 }]}>Selected Product</AppText>
                    <AppText style={[CommonStyle.primaryText, { fontSize: 14, fontWeight: 500 }]}>
                        {product?.productName}
                    </AppText>
                </View>
                {customerList && (
                    <View style={{ marginTop: 10 }}>
                        <AppText style={[CommonStyle.secondaryText, { fontSize: 12, marginBottom: 6 }]}>
                            Selected Customer/RC’s
                        </AppText>
                        <TouchableOpacity style={styles.customerDropdown} onPress={() => handleAction?.("selectRc")}>
                            <AppText style={[CommonStyle.primaryText, { fontSize: 14, fontWeight: 500 }]}>
                                {rcCount} {rcCount === 1 ? "RC" : "RC’s"} Selected
                            </AppText>
                            <Icon name="arrow-drop-down" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                )}
            </View>

            {/* Date Section */}
            <DatePickerRow handleAction={handleAction} />

            {/* Supply Mode */}
            <SupplyMode handleAction={handleAction} />
        </View>
    );
};

/* -------------------------------------------------------
   TYPE 2 CARD
------------------------------------------------------- */
const Type2Card = ({ productLabel, isSpecial, product, handleAction,multiSelect }) => {
    const [viewMore, setViewMore] = useState(false);
    console.log(product, 4982378)

    return (
        <View
            style={[
                styles.topSection,
                { paddingBottom: 0 },
                isSpecial ? styles.specialBackground : styles.background,
            ]}
        >
            <View style={[styles.customerSection, { padding: 10 }]}>
                <Header productLabel={productLabel} productName={product?.productName} productCode={product?.productCode} />

                {/* PTS Row */}
                <InfoRow
                    leftItems={[
                        { label: "PTS:", value: `₹${product?.pts ?? "-"}` },
                        { label: "PTR:", value: `₹${product?.ptr ?? "-"}` },
                        { label: "MRP:", value: `₹${product?.mrp ?? "-"}` }
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
const Type3Card = ({ productLabel, isSpecial, product, handleAction }) => {
    return (
        <View
            style={[
                styles.topSection,
                { paddingBottom: 0 },
                isSpecial ? styles.specialBackground : styles.background,
            ]}
        >
            <View style={[styles.customerSection, CommonStyle.SpaceBetween, { alignItems: "flex-end", padding: 10 }]}>
                <View style={{ gap: 6, maxWidth: "65%" }}>
                    <AppText style={[CommonStyle.secondaryText, { fontSize: 11 }]}>
                        {productLabel}
                    </AppText>
                    <AppText style={[CommonStyle.primaryText, { fontSize: 13, fontWeight: 500 }]}>
                        {product?.productName}
                    </AppText>
                </View>

                <AppText style={[CommonStyle.secondaryText, { fontSize: 11, maxWidth: "35%" }]}> {product?.productCode}</AppText>
            </View>
        </View>
    );
};

/* -------------------------------------------------------
   REUSABLE COMPONENTS
------------------------------------------------------- */

const Header = ({ productLabel, productName, productCode }) => (
    <View style={[CommonStyle.SpaceBetween, { alignItems: "flex-end" }]}>
        <View style={{ gap: 6, maxWidth: "65%" }}>
            <AppText style={[CommonStyle.secondaryText, { fontSize: 11 }]}>{productLabel}</AppText>
            <AppText style={[CommonStyle.primaryText, { fontSize: 13, fontWeight: 500 }]}>
                {productName}
            </AppText>
        </View>
        <View style={{ maxWidth: "35%" }}>
            <AppText style={[CommonStyle.secondaryText, { fontSize: 11 }]}>{productCode}</AppText>
        </View>
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

const DatePickerRow = ({ handleAction }) => (
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

const SupplyMode = ({ handleAction }) => {
    const [selected, setSelected] = useState("Net Rate")
    const handleSelect = (name) => {
        setSelected(name);
        handleAction?.("supllyMode", name);
    }
    return (
        <View style={styles.section}>
            <AppText style={[CommonStyle.secondaryText, { fontSize: 12, marginBottom: 10 }]}>
                Supply Mode
            </AppText>

            <View style={styles.supplyModeOptions}>
                <RadioOption label="Net Rate" selected={selected == "Net Rate"} onSelect={() => handleSelect("Net Rate")} />
                <RadioOption label="Chargeback" selected={selected == "Chargeback"} onSelect={() => handleSelect("Chargeback")} />
                <RadioOption label="Mixed" selected={selected == "Mixed"} onSelect={() => handleSelect("Mixed")} />
            </View>
        </View>
    )
};

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


