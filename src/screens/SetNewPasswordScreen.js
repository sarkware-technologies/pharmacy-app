import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    ScrollView,
    Keyboard,
    Platform,
    KeyboardAvoidingView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { colors } from '../styles/colors';
import SunLogo from '../components/icons/SunLogo';
import InputLock from '../components/icons/InputLock';
import EyeOpen from '../components/icons/EyeOpen';
import EyeClosed from '../components/icons/EyeClosed';
import ArrowLeft from '../components/icons/ArrowLeft';
import CheckCircle from '../components/icons/CheckCircle';
import XCircle from '../components/icons/XCircle';

const { width, height } = Dimensions.get('window');

const SetNewPasswordScreen = () => {
    const scrollViewRef = useRef(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    
    const navigation = useNavigation();
    
    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideUpAnim = useRef(new Animated.Value(30)).current;
    const checkAnim1 = useRef(new Animated.Value(0)).current;
    const checkAnim2 = useRef(new Animated.Value(0)).current;
    const checkAnim3 = useRef(new Animated.Value(0)).current;
    const checkAnim4 = useRef(new Animated.Value(0)).current;
    
    // Password validation
    const validations = {
        minLength: password.length >= 8,
        hasUpperLowerNumber: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        noSpaces: password.length > 0 && !password.startsWith(' ') && !password.endsWith(' ')
    };
    
    useEffect(() => {
        // Entrance animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.spring(slideUpAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);
    
    // Keyboard handling
    useEffect(() => {
        const keyboardWillShow = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (event) => {
                const keyboardHeight = event.endCoordinates.height;
                setKeyboardHeight(keyboardHeight);
                
                // Scroll to show the form
                setTimeout(() => {
                    scrollViewRef.current?.scrollTo({
                        y: 150,
                        animated: true
                    });
                }, 100);
            }
        );

        const keyboardWillHide = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardHeight(0);
                
                // Scroll back to top
                scrollViewRef.current?.scrollTo({
                    y: 0,
                    animated: true
                });
            }
        );

        return () => {
            keyboardWillShow.remove();
            keyboardWillHide.remove();
        };
    }, []);
    
    // Animate validation checks
    useEffect(() => {
        Animated.timing(checkAnim1, {
            toValue: validations.minLength ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [validations.minLength]);
    
    useEffect(() => {
        Animated.timing(checkAnim2, {
            toValue: validations.hasUpperLowerNumber ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [validations.hasUpperLowerNumber]);
    
    useEffect(() => {
        Animated.timing(checkAnim3, {
            toValue: validations.hasSpecial ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [validations.hasSpecial]);
    
    useEffect(() => {
        Animated.timing(checkAnim4, {
            toValue: validations.noSpaces ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [validations.noSpaces]);
    
    const isFormValid = () => {
        return Object.values(validations).every(v => v === true) && 
               password === confirmPassword && 
               confirmPassword.length > 0;
    };
    
    const handleSubmit = () => {
        if (isFormValid()) {
            setIsLoading(true);
            
            // Animate out
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start(() => {
                // Mock API call
                setTimeout(() => {
                    setIsLoading(false);
                    navigation.navigate('PasswordSuccess');
                }, 500);
            });
        }
    };
    
    const handleBack = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            navigation.goBack();
        });
    };
    
    const ValidationItem = ({ isValid, text, animValue }) => (
        <View style={styles.validationItem}>
            <Animated.View
                style={[
                    styles.validationIcon,
                    {
                        opacity: animValue,
                        transform: [{
                            scale: animValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.5, 1]
                            })
                        }]
                    }
                ]}>
                {isValid ? (
                    <CheckCircle width={20} height={20} />
                ) : (
                    <XCircle width={20} height={20} />
                )}
            </Animated.View>
            <Text style={[
                styles.validationText,
                isValid && styles.validationTextValid
            ]}>
                {text}
            </Text>
        </View>
    );
    
    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            
            {/* Header */}
            <Animated.View 
                style={[
                    styles.header,
                    { opacity: fadeAnim }
                ]}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={handleBack}>
                    <ArrowLeft width={24} height={24} color={colors.text} />
                </TouchableOpacity>
            </Animated.View>
            
            <ScrollView 
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">
                
                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideUpAnim }]
                        }
                    ]}>
                    
                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <SunLogo width={80} height={80} />
                    </View>
                    
                    {/* Title */}
                    <Text style={styles.title}>Set New Password</Text>
                    
                    {/* Password Inputs */}
                    <View style={styles.inputsContainer}>
                        <CustomInput
                            value={password}
                            onChangeText={setPassword}
                            placeholder="New Password*"
                            icon={<InputLock />}
                            secureTextEntry={!showPassword}
                            rightIcon={
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    {showPassword ? 
                                        <EyeOpen width={20} height={20} color={colors.textSecondary} /> : 
                                        <EyeClosed width={20} height={20} color={colors.textSecondary} />
                                    }
                                </TouchableOpacity>
                            }
                        />
                        
                        <CustomInput
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Confirm New Password*"
                            icon={<InputLock />}
                            secureTextEntry={!showConfirmPassword}
                            rightIcon={
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    {showConfirmPassword ? 
                                        <EyeOpen width={20} height={20} color={colors.textSecondary} /> : 
                                        <EyeClosed width={20} height={20} color={colors.textSecondary} />
                                    }
                                </TouchableOpacity>
                            }
                        />
                    </View>
                    
                    {/* Validation Checklist */}
                    <View style={styles.validationContainer}>
                        <Text style={styles.validationTitle}>Your password must contain</Text>
                        
                        <ValidationItem
                            isValid={validations.minLength}
                            text="At least 8 letters"
                            animValue={checkAnim1}
                        />
                        
                        <ValidationItem
                            isValid={validations.hasUpperLowerNumber}
                            text="At least a number, an uppercase & a lowercase letter"
                            animValue={checkAnim2}
                        />
                        
                        <ValidationItem
                            isValid={validations.hasSpecial}
                            text="At least one special character (For ex: @, - , _ . .)"
                            animValue={checkAnim3}
                        />
                        
                        <ValidationItem
                            isValid={validations.noSpaces}
                            text="No space at the start or end"
                            animValue={checkAnim4}
                        />
                    </View>
                    
                    {/* Submit Button */}
                    <View style={styles.buttonContainer}>
                        <CustomButton
                            title="Submit"
                            onPress={handleSubmit}
                            loading={isLoading}
                            disabled={!isFormValid()}
                        />
                    </View>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    content: {
        flex: 1,
        alignItems: 'center',
    },
    logoContainer: {
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 30,
    },
    inputsContainer: {
        width: '100%',
        marginBottom: 30,
    },
    validationContainer: {
        width: '100%',
        marginBottom: 30,
    },
    validationTitle: {
        fontSize: 16,
        color: colors.text,
        marginBottom: 15,
        fontWeight: '500',
    },
    validationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    validationIcon: {
        marginRight: 10,
    },
    validationText: {
        fontSize: 14,
        color: colors.textSecondary,
        flex: 1,
    },
    validationTextValid: {
        color: colors.text,
    },
    buttonContainer: {
        width: '100%',
        marginTop: 'auto',
    },
});

export default SetNewPasswordScreen;