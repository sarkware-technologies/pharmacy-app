import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../styles/colors';
import SunLogo from '../../components/icons/SunLogo';
import Shield from '../../components/icons/Shield';
import CheckCircle from '../../components/icons/CheckCircle';

const { width, height } = Dimensions.get('window');

const PasswordSuccessScreen = () => {
    const navigation = useNavigation();
    
    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0)).current;
    const shieldScale = useRef(new Animated.Value(0)).current;
    const checkScale = useRef(new Animated.Value(0)).current;
    const successTextFade = useRef(new Animated.Value(0)).current;
    const particleAnim1 = useRef(new Animated.Value(0)).current;
    const particleAnim2 = useRef(new Animated.Value(0)).current;
    const particleAnim3 = useRef(new Animated.Value(0)).current;
    const particleAnim4 = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
        // Sequential animations
        Animated.sequence([
            // Logo appears
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.spring(logoScale, {
                    toValue: 1,
                    friction: 8,
                    tension: 100,
                    useNativeDriver: true,
                }),
            ]),
            // Shield appears
            Animated.spring(shieldScale, {
                toValue: 1,
                friction: 7,
                tension: 80,
                useNativeDriver: true,
            }),
            // Check mark appears
            Animated.spring(checkScale, {
                toValue: 1,
                friction: 8,
                tension: 120,
                delay: 50,
                useNativeDriver: true,
            }),
            // Success text fades in
            Animated.timing(successTextFade, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();        
        
        // Particle animations (decorative elements)
        Animated.loop(
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(particleAnim1, {
                        toValue: 1,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(particleAnim1, {
                        toValue: 0,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.sequence([
                    Animated.timing(particleAnim2, {
                        toValue: 1,
                        duration: 2500,
                        delay: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(particleAnim2, {
                        toValue: 0,
                        duration: 2500,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.sequence([
                    Animated.timing(particleAnim3, {
                        toValue: 1,
                        duration: 3000,
                        delay: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(particleAnim3, {
                        toValue: 0,
                        duration: 3000,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.sequence([
                    Animated.timing(particleAnim4, {
                        toValue: 1,
                        duration: 2200,
                        delay: 1500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(particleAnim4, {
                        toValue: 0,
                        duration: 2200,
                        useNativeDriver: true,
                    }),
                ]),
            ])
        ).start();
        
        // Auto navigate to login after 3 seconds
        // const timer = setTimeout(() => {
        //     Animated.timing(fadeAnim, {
        //         toValue: 0,
        //         duration: 300,
        //         useNativeDriver: true,
        //     }).start(() => {
        //         navigation.navigate('Login');
        //     });
        // }, 5000);
        
        // return () => clearTimeout(timer);
    }, []);
    
    const renderParticle = (animValue, style, content) => (
        <Animated.View
            style={[
                styles.particle,
                style,
                {
                    opacity: animValue,
                    transform: [
                        {
                            translateY: animValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [20, -20]
                            })
                        },
                        {
                            scale: animValue.interpolate({
                                inputRange: [0, 0.5, 1],
                                outputRange: [0.5, 1.2, 0.5]
                            })
                        }
                    ]
                }
            ]}>
            <Text style={styles.particleText}>{content}</Text>
        </Animated.View>
    );
    
    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.content,
                    { opacity: fadeAnim }
                ]}>
                
                {/* Logo */}
                <Animated.View
                    style={[
                        styles.logoContainer,
                        { transform: [{ scale: logoScale }] }
                    ]}>
                    <SunLogo />
                </Animated.View>
                
                {/* Success Animation Container */}
                <View style={styles.successContainer}>
                    {/* Decorative Particles */}
                    {renderParticle(particleAnim1, { top: -10, left: -10 }, '△')}
                    {renderParticle(particleAnim2, { top: -5, right: -5 }, '○')}
                    {renderParticle(particleAnim3, { bottom: -10, left: 10 }, '+')}
                    {renderParticle(particleAnim4, { bottom: -5, right: 5 }, '×')}
                    
                    {/* Shield with layers */}
                    <Animated.View
                        style={[
                            styles.shieldContainer,
                            { transform: [{ scale: shieldScale }] }
                        ]}>
                        
                            <Shield color={colors.primary} />
                            
                           
                        
                    </Animated.View>
                </View>
                
                {/* Success Text */}
                <Animated.View
                    style={[
                        styles.textContainer,
                        { opacity: successTextFade }
                    ]}>
                    <Text style={styles.title}>Password Updated!</Text>
                    <Text style={styles.subtitle}>
                        You can login with updated{'\n'}password now!
                    </Text>
                </Animated.View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'start',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 24,
        marginTop: 100
    },
    logoContainer: {
        marginBottom: 40,        
    },
    successContainer: {
        width: 200,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    shieldContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    shieldGlow: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: colors.primary,
        opacity: 0.1,
    },
    shieldMiddle: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: colors.primary,
        opacity: 0.15,
    },
    shieldInner: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    particle: {
        position: 'absolute',
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    particleText: {
        fontSize: 20,
        color: colors.primary,
        opacity: 0.6,
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
});

export default PasswordSuccessScreen;