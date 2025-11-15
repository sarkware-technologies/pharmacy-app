import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
} from 'react-native';

import { colors } from '../styles/colors';
import InputEyeClose from './icons/InputEyeClose';
import InputEyeOpen from './icons/InputEyeOpen';
import { AppText, AppInput } from "."

const CustomInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    icon,
    keyboardType,
    autoCapitalize,
    editable = true,
    mandatory = false,
    error = null,
    maxLength,
    style,
    ...props
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    // Floating label animation
    const floatingLabelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 5,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    useEffect(() => {
        // Update floating label when value changes
        if (value) {
            Animated.timing(floatingLabelAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: false,
            }).start();
        }
    }, [value]);

    // Handle focus/blur for floating label
    const handleFocus = () => {
        setIsFocused(true);
        Animated.timing(floatingLabelAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    const handleBlur = () => {
        setIsFocused(false);
        if (!value) {
            Animated.timing(floatingLabelAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }).start();
        }
    };

    // Create placeholder text with asterisk if mandatory
    const placeholderText = mandatory ? `${placeholder}*` : placeholder;

    // Animated styles for floating label (with asterisk if mandatory)
    const labelContainerStyle = {
        position: 'absolute',
        left: icon ? 44 : 16,
        top: floatingLabelAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [18, -10],
        }),
        backgroundColor: colors.white,
        paddingHorizontal: 4,
        zIndex: 1,
    };

    const labelTextStyle = {
        fontSize: floatingLabelAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [16, 12],
        }),
        color: floatingLabelAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [colors.gray, colors.primary],
        }),
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                },
                style,
            ]}>
            <View style={[
                styles.inputContainer,
                isFocused && styles.inputContainerFocused,
                error && styles.inputContainerError,
            ]}>
                <Animated.View style={labelContainerStyle} pointerEvents="none">
                    <Animated.Text style={labelTextStyle}>
                        {placeholder}
                        {mandatory && <AppText style={styles.asterisk}>*</AppText>}
                    </Animated.Text>
                </Animated.View>

                {icon && (<View style={styles.icon}>{icon}</View>)}

                <AppInput
                    style={[styles.input, icon && styles.inputWithIcon]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder=""
                    placeholderTextColor={colors.gray}
                    secureTextEntry={secureTextEntry && !showPassword}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    editable={editable}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    maxLength={maxLength}
                    {...props}
                />

                {secureTextEntry && (
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeIcon}>
                        {!showPassword ? <InputEyeClose /> : <InputEyeOpen />}
                    </TouchableOpacity>
                )}
            </View>
            {error && (
                <AppText style={styles.errorText}>{error}</AppText>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.loginInputBorderColor,
        paddingHorizontal: 16,
        height: 56,
        position: 'relative',
    },
    inputContainerFocused: {
        borderColor: colors.primary,
        borderWidth: 1.5,
    },
    inputContainerError: {
        borderColor: colors.error,
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: colors.text,
    },
    inputWithIcon: {
        paddingLeft: 0,
    },
    eyeIcon: {
        padding: 8
    },
    asterisk: {
        color: 'red',
        fontSize: 12,
    },
    errorText: {
        color: colors.error,
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
});

export default CustomInput;