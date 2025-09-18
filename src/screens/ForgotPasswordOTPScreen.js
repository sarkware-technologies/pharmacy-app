import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    Keyboard,
    Platform,
    ScrollView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import OTPInput from '../components/OTPInput';
import CustomButton from '../components/CustomButton';
import { colors } from '../styles/colors';
import SunLogo from '../components/icons/SunLogo';
import ArrowLeft from '../components/icons/ArrowLeft';

const { width, height } = Dimensions.get('window');

const ForgotPasswordOTPScreen = () => {
    const scrollViewRef = useRef(null);
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(55);
    const [canResend, setCanResend] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    
    const navigation = useNavigation();
    const route = useRoute();
    const { mobileNumber } = route.params;
    
    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideUpAnim = useRef(new Animated.Value(30)).current;
    const logoRotate = useRef(new Animated.Value(0)).current;
    const countdownScale = useRef(new Animated.Value(1)).current;
    
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
            Animated.loop(
                Animated.timing(logoRotate, {
                    toValue: 1,
                    duration: 10000,
                    useNativeDriver: true,
                })
            ),
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
                        y: 100,
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
    
    // Countdown timer
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 0.1);
                
                // Pulse animation at specific intervals
                if (countdown % 1 === 0) {
                    Animated.sequence([
                        Animated.timing(countdownScale, {
                            toValue: 1.1,
                            duration: 100,
                            useNativeDriver: true,
                        }),
                        Animated.timing(countdownScale, {
                            toValue: 1,
                            duration: 100,
                            useNativeDriver: true,
                        }),
                    ]).start();
                }
            }, 100);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);
    
    const handleVerify = () => {
        if (otp.length === 4) {
            setIsLoading(true);
            Keyboard.dismiss();
            
            // Animate out
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start(() => {
                // Mock verification
                setTimeout(() => {
                    setIsLoading(false);
                    navigation.navigate('SetNewPassword');
                }, 500);
            });
        }
    };
    
    const handleResendCode = () => {
        if (canResend) {
            setCountdown(55);
            setCanResend(false);
            // Mock resend API call
            console.log('Resending OTP...');
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
    
    const logoSpin = logoRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });
    
    return (
        <View style={styles.container}>
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
            
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideUpAnim }]
                    }
                ]}>
                
                {/* Logo */}
                <Animated.View
                    style={[
                        styles.logoContainer,
                        { transform: [{ rotate: logoSpin }] }
                    ]}>
                    <SunLogo width={80} height={80} />
                </Animated.View>
                
                {/* Title */}
                <Text style={styles.title}>OTP Verification</Text>
                <Text style={styles.subtitle}>
                    We have sent a verification code to on your{'\n'}
                    registered mobile number
                </Text>
                
                {/* OTP Input */}
                <View style={styles.otpContainer}>
                    <OTPInput
                        value={otp}
                        onChange={setOtp}
                        autoFocus={true}
                    />
                </View>
                
                {/* Resend Section */}
                <View style={styles.resendContainer}>
                    <Text style={styles.resendText}>Didn't get the code?</Text>
                    <TouchableOpacity 
                        onPress={handleResendCode}
                        disabled={!canResend}>
                        <Animated.Text 
                            style={[
                                styles.resendButton,
                                !canResend && styles.resendDisabled,
                                { transform: [{ scale: countdownScale }] }
                            ]}>
                            Resend Code {!canResend && (
                                <Text style={styles.countdown}>
                                    in {Math.ceil(countdown / 10).toFixed(1)} Sec
                                </Text>
                            )}
                        </Animated.Text>
                    </TouchableOpacity>
                </View>
                
                {/* Verify Button */}
                <View style={styles.buttonContainer}>
                    <CustomButton
                        title="Verify"
                        onPress={handleVerify}
                        loading={isLoading}
                        disabled={otp.length !== 4}
                    />
                </View>
            </Animated.View>
        </View>
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
    content: {
        flex: 1,
        paddingHorizontal: 24,
        alignItems: 'center',
        paddingTop: 40,
    },
    logoContainer: {
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
    },
    otpContainer: {
        width: '100%',
        marginBottom: 40,
    },
    resendContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    resendText: {
        fontSize: 16,
        color: colors.textSecondary,
        marginBottom: 8,
    },
    resendButton: {
        fontSize: 16,
        color: colors.text,
        fontWeight: '600',
    },
    resendDisabled: {
        color: colors.textSecondary,
    },
    countdown: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    buttonContainer: {
        width: '100%',
        marginTop: 'auto',
        marginBottom: 40,
    },
});

export default ForgotPasswordOTPScreen;