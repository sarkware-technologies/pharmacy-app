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

    // Animated styles for floating label
    const labelStyle = {
        position: 'absolute',
        left: icon ? 44 : 16,
        top: floatingLabelAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [18, -10],
        }),
        fontSize: floatingLabelAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [16, 12],
        }),
        color: floatingLabelAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [colors.gray, colors.primary],
        }),
        backgroundColor: colors.white,
        paddingHorizontal: 4,
        zIndex: 1,
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                },
            ]}>
            <View style={[
                styles.inputContainer,
                isFocused && styles.inputContainerFocused
            ]}>
                <Animated.Text style={labelStyle}>
                    {placeholder}
                </Animated.Text>
                
                {icon && (<View style={styles.icon}>{icon}</View>)}
                
                <TextInput
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
                />
                
                {secureTextEntry && (
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeIcon}>
                        {!showPassword ? <InputEyeClose /> : <InputEyeOpen />}
                    </TouchableOpacity>
                )}
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
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
});

export default CustomInput;