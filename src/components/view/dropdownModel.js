import React from "react";
import {
    Modal,
    TouchableOpacity,
    View,
    StyleSheet,
    TextInput,
    ActivityIndicator,
} from "react-native";
import AppText from "../AppText";
import { colors } from "../../styles/colors";
import Icon from "react-native-vector-icons/MaterialIcons";
import { FlatList } from "react-native-gesture-handler";

const DropdownModal = ({
    visible,
    onClose,
    title,
    data,
    selectedId,
    selectedIds = [],
    onSelect,
    onMultiSelect,
    multiSelect = false,
    loading,
    searchValue,
    onSearchChange,
    enableSearch = false,
    emptyText = "No items available",
    enableSelectAll = false,
    onApply
}) => {
    const dataWithAll = data;

    /** Multi Select Toggle */
    const handleMultiToggle = (key) => {
        // SELECT ALL LOGIC
        if (key === "ALL") {
            const allKeys = data.map((i) => i.key);

            if (selectedIds.length === allKeys.length) {
                onMultiSelect?.([]); // UNSELECT ALL
            } else {
                onMultiSelect?.(allKeys); // SELECT ALL
            }
            return;
        }

        let updated;

        if (selectedIds.includes(key)) {
            updated = selectedIds.filter((id) => id !== key);
        } else {
            updated = [...selectedIds, key];
        }

        // If user manually deselects one → uncheck ALL
        if (enableSelectAll && selectedIds.length === data.length) {
            updated = updated.filter((id) => id !== "ALL");
        }

        onMultiSelect?.(updated);
    };

    const handleApply = () => {
        onClose?.();
        onApply?.();
    };

    /** Check if ALL is selected */
    const isAllSelected = selectedIds.length === data.length;

    return (
        <Modal visible={visible} transparent animationType="slide">
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={styles.modalContent}>
                    {/* HEADER */}
                    <View style={styles.modalHeader}>
                        <AppText style={styles.modalTitle}>{title}</AppText>
                        <TouchableOpacity onPress={onClose}>
                            <Icon name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {/* SEARCH */}
                    {enableSearch && (
                        <View style={styles.searchContainer}>
                            <Icon
                                name="search"
                                size={20}
                                color="#888"
                                style={{ marginRight: 8 }}
                            />
                            <TextInput
                                placeholder="Search..."
                                placeholderTextColor="#888"
                                value={searchValue}
                                onChangeText={onSearchChange}
                                style={styles.searchInput}
                            />
                        </View>
                    )}

                    {/* LIST */}
                    {loading ? (
                        <ActivityIndicator
                            size="large"
                            color={colors.primary}
                            style={styles.modalLoader}
                        />
                    ) : (
                        <FlatList
                            data={dataWithAll}
                            keyExtractor={(item) => item.key.toString()}
                            renderItem={({ item }) => {
                                const isSelected =
                                    item.key === "ALL"
                                        ? isAllSelected
                                        : selectedIds.includes(item.key);

                                return (
                                    <TouchableOpacity
                                        style={[
                                            styles.modalItem,
                                            isSelected && styles.modalItemSelected,
                                        ]}
                                        onPress={() => {
                                            if (multiSelect) {
                                                handleMultiToggle(item.key);
                                            } else {
                                                onSelect?.(item);
                                                onClose?.();
                                            }
                                        }}
                                    >
                                        <AppText
                                            style={[
                                                styles.modalItemText,
                                                isSelected && styles.modalItemTextSelected,
                                            ]}
                                        >
                                            {item.label}
                                        </AppText>

                                        {/* Checkbox UI */}
                                        {multiSelect ? (
                                            <Icon
                                                name={
                                                    isSelected
                                                        ? "check-box"
                                                        : "check-box-outline-blank"
                                                }
                                                size={24}
                                                color={
                                                    isSelected ? colors.primary : "#999"
                                                }
                                            />
                                        ) : (
                                            isSelected && (
                                                <Icon
                                                    name="check"
                                                    size={20}
                                                    color={colors.primary}
                                                />
                                            )
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
                            ListEmptyComponent={
                                <AppText style={styles.emptyText}>{emptyText}</AppText>
                            }
                            style={styles.modalList}
                        />
                    )}

                    {/* APPLY BUTTON */}
                    {multiSelect && (
                        <TouchableOpacity
                            style={styles.applyButton}
                            onPress={handleApply}
                        >
                            <AppText style={styles.applyButtonText}>Apply</AppText>
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "75%",
        paddingBottom: 10,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
    },

    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#DDD",
        borderRadius: 8,
        marginHorizontal: 16,
        marginTop: 10,
        marginBottom: 6,
        paddingHorizontal: 12,
        height: 42,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: "#333",
    },

    modalList: {
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    modalItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    modalItemSelected: {
        backgroundColor: "#FFF5ED",
    },
    modalItemText: {
        fontSize: 16,
        color: "#333",
        flex: 1,
    },
    modalItemTextSelected: {
        color: colors.primary,
        fontWeight: "500",
    },
    emptyText: {
        textAlign: "center",
        paddingVertical: 40,
        fontSize: 16,
        color: "#999",
    },

    applyButton: {
        backgroundColor: colors.primary,
        marginHorizontal: 16,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: "center",
        marginBottom: 12,
    },
    applyButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    modalLoader: {
        paddingVertical: 50,
        justifyContent: "center",
        alignItems: "center",
    },

});

export default DropdownModal;
