import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,        
    Platform,
    Keyboard,
    TouchableOpacity,
    Animated,
    Dimensions, 
    ScrollView,
    findNodeHandle,
    UIManager
} from 'react-native';

import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { colors } from '../styles/colors';
import { login, clearError } from '../redux/slices/authSlice';
import SunLogo from '../components/icons/SunLogo';
import LoginPic from '../components/icons/LoginPic';
import InputUser from '../components/icons/InputUser';
import InputLock from '../components/icons/InputLock';
import Error from '../components/icons/Error';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {

    const scrollViewRef = useRef(null);
    const [phoneOrEmail, setPhoneOrEmail] = useState('');
    const [password, setPassword] = useState('');  
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const { isLoading, error, sessionId } = useSelector((state) => state.auth);
    
    // Animation values
    const headerSlideAnim = useRef(new Animated.Value(-250)).current;
    const headerFadeAnim = useRef(new Animated.Value(0)).current;
    const formTranslateAnim = useRef(new Animated.Value(0)).current;
    const initialFadeAnim = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.5)).current;

    const [loginError, setLoginError] = useState('');
    const errorShakeAnim = useRef(new Animated.Value(0)).current;

    const shakeError = () => {
        Animated.sequence([
            Animated.timing(errorShakeAnim, {
                toValue: 10,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(errorShakeAnim, {
                toValue: -10,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(errorShakeAnim, {
                toValue: 10,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(errorShakeAnim, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    useEffect(() => {

        dispatch(clearError());
        
        Animated.parallel([
            // Initial fade in
            Animated.timing(initialFadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            // Header slide down and fade in
            Animated.parallel([
                Animated.spring(headerSlideAnim, {
                    toValue: 0,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.timing(headerFadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ]),
            // Logo scale
            Animated.spring(logoScale, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
            }),
        ]).start();

    }, []);


    useEffect(() => {
        const keyboardWillShow = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (event) => {
                const keyboardHeight = event.endCoordinates.height;
                setKeyboardHeight(keyboardHeight);
        
                // Animate header out with fade
                Animated.sequence([
                    Animated.parallel([
                        Animated.timing(headerFadeAnim, {
                            toValue: 0,
                            duration: 200,
                            useNativeDriver: true,
                        }),
                        Animated.timing(headerSlideAnim, {
                            toValue: -300,
                            duration: 250,
                            delay: 100,
                            useNativeDriver: true,
                        }),
                    ]),
                ]).start();
                
                // Scroll to show the entire form including the login button
                setTimeout(() => {
                    scrollViewRef.current?.scrollTo({
                        y: 200, // This will show logo, inputs, and login button
                        animated: true
                    });
                }, 300);
            }
        );

        const keyboardWillHide = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardHeight(0);
        
                // Animate header back
                Animated.parallel([
                    Animated.timing(headerSlideAnim, {
                        toValue: 0,
                        duration: 250,
                        useNativeDriver: true,
                    }),
                    Animated.timing(headerFadeAnim, {
                        toValue: 1,
                        duration: 300,
                        delay: 150,
                        useNativeDriver: true,
                    }),
                ]).start();
                
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

    useEffect(() => {
        if (error) {
            setLoginError('Invalid credentials. Please try again.');
            shakeError();
            setTimeout(() => setLoginError(null), 3000);
        }
    }, [error]);

    useEffect(() => {
        if (sessionId) {
            navigation.navigate('OTP');
        }
    }, [sessionId, navigation]);

    const scrollPosition = height < 700 ? 290 : 240; // Adjust for smaller screens

    setTimeout(() => {
        scrollViewRef.current?.scrollTo({
            y: scrollPosition,
            animated: true
        });
    }, 300);

    const handleLogin = () => {
        if (phoneOrEmail && password) {
            dispatch(login({ phoneOrEmail, password }));
        }
    };

    return (
        <View style={styles.container}>            

            <View style={styles.mainContainer}>
                {/* Animated Header */}
                <Animated.View
                    style={[
                      styles.header,
                      {
                        opacity: headerFadeAnim,
                        transform: [{ translateY: headerSlideAnim }],
                      },
                    ]}>
                    <View style={styles.illustrationContainer}>
                        <LoginPic />
                    </View>
                </Animated.View>

                {/* Content with dynamic bottom margin */}
                <Animated.ScrollView 
    ref={scrollViewRef}
    contentContainerStyle={[
        styles.scrollContent,
        { 
            paddingBottom: keyboardHeight > 0 ? keyboardHeight + 100 : 40, // Extra padding for button visibility
            minHeight: height + (keyboardHeight || 0)
        }
    ]}
    style={styles.scrollView}
    showsVerticalScrollIndicator={false}
    keyboardShouldPersistTaps="always"
    bounces={false}>
                
                    {/* Logo and Form */}
                    <Animated.View
                        style={[
                          styles.contentWrapper,
                          { opacity: initialFadeAnim },
                        ]}>
                      
                        {/* Logo */}
                        <Animated.View
                            style={[
                              styles.logoContainer,
                              { transform: [{ scale: logoScale }] },
                            ]}>
                            <SunLogo />            
                        </Animated.View>

                        {/* Login Form */}
                        <View style={styles.formContainer}>
                            <Text style={styles.title}>Login</Text>
                            <Text style={styles.subtitle}>
                              Enter your credentials to access account
                            </Text>

                            <View style={styles.inputsContainer}>

                                <CustomInput
                                  value={phoneOrEmail}
                                  onChangeText={setPhoneOrEmail}
                                  placeholder="Mobile number/Email address"
                                  icon={<InputUser />}
                                  keyboardType="default"
                                  autoCapitalize="none"
                                />

                                <CustomInput
                                  value={password}
                                  onChangeText={setPassword}
                                  placeholder="Password"
                                  icon={<InputLock />}
                                  secureTextEntry
                                />

                            </View>

                            {loginError && (
                                <Animated.View
                                  style={[
                                    styles.errorContainer,
                                    { transform: [{ translateX: errorShakeAnim }] }
                                  ]}>
                                    <Error width={16} height={16} />
                                    <Text style={styles.errorText}>{loginError}</Text>
                                </Animated.View>
                            )}

                            <CustomButton
                                title="Login"
                                onPress={handleLogin}
                                loading={isLoading}
                                disabled={!phoneOrEmail || !password}
                            />

                            <TouchableOpacity 
                                style={styles.forgotPassword}
                                onPress={() => navigation.navigate('ForgotPassword')}>
                                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                            </TouchableOpacity>
                          </View>
                      </Animated.View>
                </Animated.ScrollView>
            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    mainContainer: {
        flex: 1,
    },
    header: {
        height: 250,
        backgroundColor: colors.primary,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        justifyContent: 'flex-end',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
    },
    illustrationContainer: {
        width: width * 0.6,
        height: 240,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: -40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingTop: 280,
        paddingHorizontal: 24,        
    },
    contentWrapper: {
        flex: 1,
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 0,
        marginBottom: 10,
        zIndex: 2,
    },
    formContainer: {
        marginTop: 0,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 30,
    },
    inputsContainer: {
        marginBottom: 20,
    },
    errorText: {
        color: colors.error,
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 2        
    },
    forgotPassword: {
        alignItems: 'center',
        marginTop: 20,
    },
    forgotPasswordText: {
        color: colors.text,
        fontSize: 16,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FEE',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        gap: 5
    },
});

export default LoginScreen;