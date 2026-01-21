import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Keyboard
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { colors } from '../../styles/colors';
import SunLogo from '../../components/icons/SunLogo';
import InputUser from '../../components/icons/InputUser';
import { requestPasswordReset } from '../../redux/slices/authSlice';
import AppText from "../../components/AppText"
import { authAPI } from '../../api/auth';

const { width, height } = Dimensions.get('window');

// Responsive helpers
const isSmallScreen = height < 600;
const isMediumScreen = height >= 600 && height < 700;
const logoSize = isSmallScreen ? 60 : isMediumScreen ? 70 : 80;
const topPadding = isSmallScreen ? height * 0.05 : isMediumScreen ? height * 0.08 : height * 0.1;
const scrollOffset = isSmallScreen ? 30 : isMediumScreen ? 45 : 60;

const ForgotPasswordScreen = () => {
    const scrollViewRef = useRef(null);
    const [userName, setUserName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    const navigation = useNavigation();
    const dispatch = useDispatch();

    // Animation values
    const logoScale = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideUpAnim = useRef(new Animated.Value(50)).current;
    const buttonSlideAnim = useRef(new Animated.Value(100)).current;
    const backLinkOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Entrance animations
        Animated.parallel([
            Animated.spring(logoScale, {
                toValue: 1,
                friction: 4,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideUpAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(buttonSlideAnim, {
                toValue: 0,
                duration: 600,
                delay: 200,
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

                // Fade out the back link
                Animated.timing(backLinkOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }).start();

                // Scroll to show the form
                setTimeout(() => {
                    scrollViewRef.current?.scrollTo({
                        y: scrollOffset,
                        animated: true
                    });
                }, 100);
            }
        );

        const keyboardWillHide = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardHeight(0);

                // Fade in the back link
                Animated.timing(backLinkOpacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }).start();

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

    const isValidInput = (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const mobileRegex = /^[0-9]{10}$/;
        return emailRegex.test(value) || mobileRegex.test(value);
    };

    const handleGetOTP = async () => {
        if (!isValidInput(userName)) {
            // show error: "Enter valid email or mobile number"
            return;
        }
        setIsLoading(true);
        try {
            // ✅ WAIT for the thunk result
            const resultAction = await dispatch(
                requestPasswordReset(userName)
            );

            // ✅ Navigate ONLY if API succeeded
            if (requestPasswordReset.fulfilled.match(resultAction)) {

                navigation.navigate('ForgotPasswordOTP');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };



    const handleBackToLogin = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            navigation.goBack();
        });
    };

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={[
                    styles.scrollContainer,
                    {
                        paddingBottom: keyboardHeight > 0 ? keyboardHeight + 100 : 40,
                        minHeight: height + (keyboardHeight || 0),
                        paddingTop: topPadding
                    }
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                bounces={false}>

                <Animated.View
                    style={[
                        styles.contentWrapper,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideUpAnim }]
                        }
                    ]}>

                    {/* Logo */}
                    <Animated.View
                        style={[
                            styles.logoContainer,
                            { transform: [{ scale: logoScale }] }
                        ]}>
                        <SunLogo width={logoSize} height={logoSize} />
                    </Animated.View>

                    {/* Title */}
                    <AppText style={[styles.title, isSmallScreen && styles.titleSmall]}>
                        Forgot Password?
                    </AppText>
                    <AppText style={[styles.subtitle, isSmallScreen && styles.subtitleSmall]}>
                        Please enter registered mobile number,{'\n'}
                        we will send you a 4 digit code
                    </AppText>

                    {/* Input */}
                    <View style={[styles.inputContainer, isSmallScreen && styles.inputContainerSmall]}>
                        <CustomInput
                            value={userName}
                            onChangeText={setUserName}
                            placeholder="Mobile number or Email address"
                            icon={<InputUser />}
                            keyboardType="default"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Back to login link */}
                    <Animated.View
                        style={[
                            styles.backToLogin,
                            {
                                opacity: backLinkOpacity,
                                transform: [{
                                    translateY: backLinkOpacity.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [10, 0]
                                    })
                                }]
                            }
                        ]}
                        pointerEvents={keyboardHeight > 0 ? 'none' : 'auto'}>
                        <TouchableOpacity onPress={handleBackToLogin}>
                            <AppText style={styles.backToLoginText}>Back to login</AppText>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Get OTP Button */}
                    <Animated.View
                        style={[
                            styles.buttonContainer,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: buttonSlideAnim }],
                                marginBottom: keyboardHeight > 0 ? 30 : 0,
                                marginTop: keyboardHeight > 0 ? 20 : 'auto'
                            }
                        ]}>
                        <CustomButton
                            title="Get OTP"
                            onPress={handleGetOTP}
                            loading={isLoading}
                            disabled={!isValidInput(userName)}
                        />
                    </Animated.View>
                </Animated.View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    contentWrapper: {
        flex: 1,
        alignItems: 'center',
    },
    logoContainer: {
        marginBottom: isSmallScreen ? 20 : isMediumScreen ? 30 : 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 12,
    },
    titleSmall: {
        fontSize: 24,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
        paddingHorizontal: 10,
    },
    subtitleSmall: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 25,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 30,
    },
    inputContainerSmall: {
        marginBottom: 20,
    },
    backToLogin: {
        paddingVertical: 10,
    },
    backToLoginText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    buttonContainer: {
        width: '100%',
        marginTop: 'auto',
    },
});

export default ForgotPasswordScreen;