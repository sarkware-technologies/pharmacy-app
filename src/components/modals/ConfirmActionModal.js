import React, { useState } from "react";
import {
    View,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ActivityIndicator,
    StyleSheet,
    Dimensions,
} from "react-native";
import { AppText, AppInput } from "..";
import CustomCheckbox from "../view/checkbox";
import Svg, { Path } from "react-native-svg";
import { colors } from "../../styles/colors";

const { width } = Dimensions.get("window");

const ConfirmActionModal = ({
    visible,
    onClose,
    onConfirm,
    title,
    confirmLabel = "Yes",
    confirmColor = colors.primary,
    showCheckbox = false,
    checkboxLabel = "I have verified all details and documents",
    requireComment = true,
    loading = false,
}) => {
    const [comment, setComment] = useState("");
    const [checked, setChecked] = useState(false);
    const [error, setError] = useState("");

    const handleConfirm = async () => {
        if (requireComment && !comment.trim()) {
            setError("Please enter a comment");
            return;
        }

        if (showCheckbox && !checked) {
            setError("Please confirm verification");
            return;
        }

        await onConfirm(comment);
        resetAndClose();
    };

    const resetAndClose = () => {
        setComment("");
        setChecked(false);
        setError("");
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <TouchableWithoutFeedback onPress={resetAndClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContainer}>
                            {/* Icon */}
                            <View style={styles.iconOuter(confirmColor)}>
                                <View style={styles.iconInner(confirmColor)}>
                                    <AppText style={styles.iconText}>!</AppText>
                                </View>
                            </View>

                            {/* Title */}
                            <AppText style={styles.title}>{title}</AppText>

                            {/* Comment */}
                            <View style={styles.inputContainer}>
                                <AppInput
                                    style={[styles.input, error && styles.inputError]}
                                    placeholder="Write your comment*"
                                    multiline
                                    value={comment}
                                    editable={!loading}
                                    onChangeText={(t) => {
                                        setComment(t);
                                        setError("");
                                    }}
                                    placeholderTextColor="#999"
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />

                                {showCheckbox && (
                                    <CustomCheckbox
                                        checked={checked}
                                        size={16}
                                        activeColor={confirmColor}
                                        title={<AppText>{checkboxLabel}</AppText>}
                                        onChange={() => !loading && setChecked(!checked)}
                                        checkIcon={
                                            <Svg width="9" height="7" viewBox="0 0 9 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <Path d="M8.25 0.75L3.09375 5.90625L0.75 3.5625" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </Svg>

                                        }
                                        containerStyle={{ marginTop: 20 }}
                                    />
                                )}

                                {error && <AppText style={styles.errorText}>{error}</AppText>}
                            </View>

                            {/* Buttons */}
                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={styles.cancelBtn}
                                    onPress={resetAndClose}
                                    disabled={loading}
                                >
                                    <AppText style={styles.cancelText}>No</AppText>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.confirmBtn,
                                        {
                                            backgroundColor:
                                                (showCheckbox ? checked : true) &&
                                                    comment &&
                                                    !loading
                                                    ? confirmColor
                                                    : "#D1D5DB",
                                        },
                                    ]}
                                    onPress={handleConfirm}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <AppText style={styles.confirmText}>
                                            {confirmLabel}
                                        </AppText>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContainer: {
        width,
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        paddingBottom: 40,
        alignItems: "center",
    },
    iconOuter: (color) => ({
        backgroundColor: `${color}1A`,
        padding: 20,
        borderRadius: 100,
        marginBottom: 20,
    }),
    iconInner: (color) => ({
        width: 49,
        height: 49,
        borderRadius: 32,
        backgroundColor: color,
        alignItems: "center",
        justifyContent: "center",
    }),
    iconText: { color: "#fff", fontSize: 32, fontWeight: "bold" },
    title: {
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 20,
    },
    inputContainer: { width: "100%", marginBottom: 24 },
    input: {
        minHeight: 100,
        backgroundColor: "#F3F4F6",
        borderRadius: 8,
        padding: 12,
    },
    inputError: { borderColor: "#EF4444", borderWidth: 1 },
    errorText: { color: "#EF4444", fontSize: 12, marginTop: 6 },
    buttonRow: { flexDirection: "row", gap: 12, width: "100%" },
    cancelBtn: {
        flex: 1,
        height: 48,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        justifyContent: "center",
        alignItems: "center",
    },
    cancelText: { color: "#6B7280", fontWeight: "600" },
    confirmBtn: {
        flex: 1,
        height: 48,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    confirmText: { color: "#fff", fontWeight: "600" },
});

export default ConfirmActionModal;
