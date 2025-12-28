import { Modal, StyleSheet, TouchableOpacity, View, FlatList, ActivityIndicator } from "react-native";
import { AppInput, AppText } from "../../../../../components"
import { CloseIcon } from "../../../../../components/icons/pricingIcon";
import { Fonts } from "../../../../../utils/fontHelper";
import { useState, useEffect } from "react";
import Svg, { Circle, Path } from "react-native-svg";
import Button from "../../../../../components/Button"
import { colors } from "../../../../../styles/colors";
import CustomCheckbox from "../../../../../components/view/checkbox";
import CommonStyle from "../../../../../styles/styles";



const SelectDivision = ({
    visible,
    onClose,
    onSelectDivision,
    divisions = []
}) => {
    const [selectedDivisions, setSelectedDivisions] = useState(divisions);

    const toggleSelect = (division, action) => {
        // ✅ Select / Unselect ALL
        if (division === "all") {
            setSelectedDivisions(
                divisions.map((div) => ({
                    ...div,
                    isChecked: action,
                }))
            );
            return;
        }

        // ✅ Single division toggle
        setSelectedDivisions((prev = []) => {
            const index = prev.findIndex(
                (e) => e?.divisionId === division?.divisionId
            );

            // ➕ Not exists → ADD
            if (index === -1) {
                return [
                    ...prev,
                    {
                        ...division,
                        isChecked: action,
                    },
                ];
            }

            // 🔁 Exists → UPDATE
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                isChecked: action,
            };

            return updated;
        });
    };




    const renderDivisionItem = ({ item }) => {

        return (
            <View style={{ paddingHorizontal: 20, borderBottomColor: "#90909080", borderBottomWidth: 0.5 }}>
                <CustomCheckbox
                    checkboxStyle={{ marginTop: 3 }}
                    containerStyle={{ alignItems: "flex-start", paddingVertical: 14 }}
                    activeColor="#F7941E"
                    size={15}
                    borderWidth={2}
                    checked={item?.isChecked}
                    onChange={(e) => toggleSelect(item, e)}
                    checkIcon={
                        <Svg width="9" height="7" viewBox="0 0 9 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <Path d="M8.25 0.75L3.09375 5.90625L0.75 3.5625" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                    }
                    title={
                        <View style={[CommonStyle.SpaceBetween, { flexShrink: 1, paddingBottom: 10, justifyContent: "space-between", width: "100%" }]}>
                            <AppText style={styles.divisionName}>
                                {item?.divisionName}
                            </AppText>
                            <AppText style={styles.searchInput}>
                                {item?.divisionCode}
                            </AppText>
                        </View>
                    }
                /></View>
        );
    };


    const renderEmpty = () => {
        return (
            <View style={styles.emptyContainer}>
                <AppText style={styles.emptyText}>No divisions found</AppText>
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={() => onClose?.(false)}
        >
            <View style={styles.modalOverlay}>
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    activeOpacity={1}
                    onPress={() => onClose?.(false)}
                />

                <View style={styles.createOrderModalContent}>
                    {/* HEADER */}
                    <View style={[styles.overlayHeader]}>
                        <View style={styles.modalHeader}>
                            <AppText style={styles.modalTitle}>
                                Divisions
                            </AppText>
                            <TouchableOpacity onPress={() => onClose?.(false)}>
                                <CloseIcon />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* LIST */}
                    <FlatList
                        data={selectedDivisions}
                        renderItem={renderDivisionItem}
                        keyExtractor={(item, index) =>
                            (item.divisionId || index).toString()
                        }
                        onEndReachedThreshold={0.3}
                        ListEmptyComponent={renderEmpty}
                        ListHeaderComponent={() => {
                            return (
                                <>
                                    <View style={styles.flatheader}>
                                        <AppText style={styles.flatheaderText}>name</AppText>
                                        <AppText style={styles.flatheaderText}>Code</AppText>
                                    </View>
                                    <View style={{ paddingHorizontal: 20, borderBottomColor: "#90909080", borderBottomWidth: 0.5 }}>
                                        <CustomCheckbox
                                            checked={selectedDivisions?.every((e) => e.isChecked == true)}
                                            checkboxStyle={{ marginTop: 3 }}
                                            containerStyle={{ alignItems: "flex-start", paddingVertical: 14 }}
                                            activeColor="#F7941E"
                                            size={15}
                                            borderWidth={2}
                                            checkIcon={
                                                <Svg width="9" height="7" viewBox="0 0 9 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <Path d="M8.25 0.75L3.09375 5.90625L0.75 3.5625" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </Svg>
                                            }
                                            title={
                                                <View style={{ flexShrink: 1, paddingBottom: 10 }}>
                                                    <AppText style={styles.divisionName}>
                                                        All Divisions
                                                    </AppText>
                                                </View>
                                            }
                                            onChange={(e) => toggleSelect("all", e)}
                                        /></View>
                                </>
                            );
                        }}
                        contentContainerStyle={{
                            paddingTop: 60,
                            flexGrow: 1,
                        }}
                    />

                    {/* DONE (ONLY FOR MULTI SELECT) */}
                    {divisions?.length != 0 && (
                        <View style={{ marginHorizontal: 10 }}>
                            <Button
                                onPress={() => {
                                    onSelectDivision?.(selectedDivisions);
                                    onClose?.(false);
                                }}
                            >Done</Button>
                        </View>
                    )}

                </View>
            </View>
        </Modal>
    );
};

/* ✅ STYLES — UNCHANGED */
const styles = StyleSheet.create({
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
    },
    modalTitle: { fontSize: 18, fontWeight: "600", color: "#333" },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    createOrderModalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "80%",
        minHeight: "40%",
        overflow: "hidden",
        paddingBottom: 10,
    },
    overlayHeader: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        zIndex: 20,
        backgroundColor: "rgba(255,255,255,0.98)",
        borderBottomColor: colors.primaryText,
        borderBottomWidth: 0.5
    },

    searchInput: {
        fontSize: 14,
        color: "#777777",
        fontFamily: Fonts.Regular,
    },
    divisionItem: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginBottom: 2,
    },
    divisionItemActive: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginBottom: 2,
        backgroundColor: "#fef4e8",
    },
    divisionName: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.primaryText,
        fontFamily: Fonts.Bold,
        paddingLeft: 10,
    },


    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 14,
        color: "#999",
        fontFamily: Fonts.Regular,
    },
    flatheader: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: "#FBFBFB"
    },
    flatheaderText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.secondaryText,
        fontFamily: Fonts.Bold,
        paddingLeft: 10,
    }
});

export default SelectDivision; 