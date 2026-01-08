import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Animated,
    StyleSheet,
} from "react-native";
import OnboardStyle from "../../screens/authorized/onboard/style/onboardStyle";
import AppText from "../AppText";
import AppInput from "../AppInput";
import { colors } from "../../styles/colors";
import AppView from "../AppView";

const FloatingInput = ({
    label,
    value,
    error,
    disabled = false,
    style,
    inputStyle,
    labelStyle = { fontSize: 14 },
    isRequired = false,
    suffix,
    prefix,
    disabledColor = "#f5f5f5",
    ...props
}) => {
    const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;
    const isFirstRender = useRef(true);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        Animated.timing(animatedValue, {
            toValue: value ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [value]);

    const onFocus = () => {
        if (disabled) return;
        setIsFocused(true);
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    const onBlur = () => {
        if (disabled) return;
        setIsFocused(false);
        if (!value) {
            Animated.timing(animatedValue, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }).start();
        }
    };

    const LocallabelStyle = {
        position: "absolute",
        left: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [16, 16],
        }),
        top: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [14, -10],
        }),
        color: disabled
            ? "#bdbdbd"
            : isFocused
                ? colors.primary   // 👈 focused label color
                : "#999",
        backgroundColor: "white",
        paddingLeft: 5,
        paddingRight: 0,
        zIndex: 99
    };

    return (
        <AppView marginVertical={10}>
            <View
                style={[
                    styles.container,
                    isFocused && !disabled && !error && styles.focusedContainer,
                    error && styles.errorContainer,
                    style,
                ]}
            >

                {prefix && (
                    <View style={{ paddingHorizontal: 5 }} >
                        {prefix}
                    </View>
                )}
                <View style={styles.input}>
                    <Animated.Text style={[LocallabelStyle, labelStyle]}>{label} {isRequired && (<AppText style={[OnboardStyle.requiredIcon, { fontSize: 12 }]}>*</AppText>)}  </Animated.Text>
                    <AppInput
                        value={value}
                        editable={!disabled}
                        selectTextOnFocus={!disabled}
                        style={[
                            styles.inputStyle,
                            disabled && { ...styles.disabledInput, backgroundColor: disabledColor },
                            error && !disabled && styles.errorInput,
                            inputStyle,
                        ]}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        {...props}
                    />
                </View>
                {suffix && (
                    <View style={{ paddingHorizontal: 5 }} >
                        {suffix}
                    </View>
                )}

            </View>
            {error && <AppText fontFamily="regular" style={{ marginTop: 5, paddingLeft: 15 }} fontWeight={400} color="red" >{error}</AppText>}

        </AppView>
    );
};

export default FloatingInput;


const styles = StyleSheet.create({
    container: {
        borderWidth: 1.5,
        borderColor: "#E3E3E3",
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center"
    },
    input: {
        paddingHorizontal: 16,
        fontSize: 16,
        color: "#000",
        flex: 1
    },
    errorInput: {
        borderColor: "#d32f2f",
    },
    disabledInput: {
        borderColor: "#e0e0e0",
        color: "#9e9e9e",
    },
    inputStyle: {
        paddingVertical: 17,

    },
    focusedContainer: {
        borderColor: colors.primary,
        borderWidth: 1.5,
        fontWeight: 600
    },
    errorContainer: {
        borderColor: "red",
        borderWidth: 1
    }
});

