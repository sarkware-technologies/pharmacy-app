import React, { useRef, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    StyleSheet,
    Dimensions,
} from "react-native";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const DROPDOWN_HEIGHT = 260;

const CustomDropdown = ({
    data = [],
    value,
    onChange,
    children,
    multiple = false,
    dref
}) => {
    /* -------------------- Hooks -------------------- */
    const inputRef = dref ?? useRef(null);

    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState({
        openUp: false,
        top: 0,
        bottom: 0,
        left: 0,
        width: 0,
    });

    /* -------------------- Helpers -------------------- */
    const isSelected = (item) => {
        if (multiple) return Array.isArray(value) && value.includes(item.value);
        return value === item.value;
    };

    const openDropdown = () => {
        if (!inputRef.current) return;

        inputRef.current.measureInWindow((x, y, width, height) => {
            const spaceBelow = SCREEN_HEIGHT - (y + height);
            const openUp = spaceBelow < DROPDOWN_HEIGHT;

            setPosition({
                openUp,
                top: y + height + 6,
                bottom: SCREEN_HEIGHT - y + 6,
                left: x,
                width: width,
            });

            setVisible(true);
        });
    };

    const handleSelect = (item) => {
        if (multiple) {
            let updated = Array.isArray(value) ? [...value] : [];
            updated.includes(item.value)
                ? (updated = updated.filter((v) => v !== item.value))
                : updated.push(item.value);
            onChange(updated);
        } else {
            onChange(item.value);
            setVisible(false);
        }
    };

    /* -------------------- Render -------------------- */

    return (
        <>
            {/* Trigger */}
            <TouchableOpacity
                ref={inputRef}
                onPress={openDropdown}
                activeOpacity={0.8}
            >
                {children}
            </TouchableOpacity>


            {/* Dropdown */}
            <Modal visible={visible} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={() => setVisible(false)}
                >
                    <View
                        style={[
                            styles.dropdown,
                            {
                                left: position.left,
                                width: position.width,
                            },
                            position.openUp
                                ? { bottom: position.bottom }
                                : { top: position.top },
                        ]}
                    >
                        <FlatList
                            data={data}
                            keyExtractor={(item) => String(item.value)}
                            showsVerticalScrollIndicator
                            keyboardShouldPersistTaps="handled"
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.item,
                                        isSelected(item) && styles.selectedItem,
                                    ]}
                                    onPress={() => handleSelect(item)}
                                >
                                    <Text style={styles.itemText}>{item.label}</Text>
                                    {multiple ? (
                                        <Text style={styles.checkbox}>
                                            {isSelected(item) ? "☑" : "☐"}
                                        </Text>
                                    ) : (
                                        isSelected(item) && (
                                            <Text style={styles.checkbox}>✔</Text>
                                        )
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

export default CustomDropdown;
const styles = StyleSheet.create({
    input: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: "#D0D0D0",
        borderRadius: 8,
        backgroundColor: "#FFFFFF",
    },

    inputText: {
        flex: 1,
        fontSize: 14,
        color: "#333",
    },

    arrow: {
        marginLeft: 6,
        fontSize: 12,
        color: "#555",
    },

    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.05)",
    },

    dropdown: {
        position: "absolute",
        maxHeight: 240,
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E0E0E0",

        elevation: 8, // Android
        shadowColor: "#000", // iOS
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },

    item: {
        paddingVertical: 12,
        paddingHorizontal: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },

    selectedItem: {
        backgroundColor: "#F6F6F6",
    },

    itemText: {
        fontSize: 14,
        color: "#333",
    },

    checkbox: {
        fontSize: 16,
    },
});
