import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet, Dimensions, Text } from 'react-native';
import SunLogo from './icons/SunLogo'; // your SVG logo component

const { width } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
    const logoFade = useRef(new Animated.Value(0)).current;
    const welcomeFade = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;
    const loadingFade = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // animation flow: logo → welcome → progress bar → loading text → finish
        Animated.sequence([
            Animated.parallel([
                Animated.timing(logoFade, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(welcomeFade, {
                    toValue: 1,
                    duration: 500,
                    delay: 300,
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(progressAnim, {
                toValue: 1,
                duration: 500,
                easing: Easing.linear,
                useNativeDriver: false,
            }),
            Animated.timing(loadingFade, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start(() => {
            if (onFinish) {
                setTimeout(onFinish, 500); // small pause before navigating
            }
        });
    }, []);

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, width * 0.6],
    });

    return (
        <View style={styles.container}>
            {/* Logo */}
            <Animated.View style={{ opacity: logoFade }}>
                <SunLogo width={150} height={150} />
            </Animated.View>

            {/* Welcome message */}
            <Animated.View style={[styles.messageContainer, { opacity: welcomeFade }]}>
                <Text style={styles.welcomeText}>Welcome to Sun Pharma</Text>
            </Animated.View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <Animated.View
                    style={[
                        styles.progressBar,
                        {
                            width: progressWidth,
                        },
                    ]}
                />
            </View>

            {/* Loading message */}
            <Animated.View style={[styles.loadingContainer, { opacity: loadingFade }]}>
                <Text style={styles.loadingText}>Loading, please wait...</Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    messageContainer: {
        marginTop: 20,
    },
    welcomeText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#F7941E',
        letterSpacing: 0.5,
    },
    progressContainer: {
        width: width * 0.6,
        height: 6,
        backgroundColor: '#EFEFEF',
        borderRadius: 3,
        overflow: 'hidden',
        marginTop: 40,
    },
    progressBar: {
        height: 6,
        backgroundColor: '#F7941E',
        borderRadius: 3,
    },
    loadingContainer: {
        marginTop: 20,
    },
    loadingText: {
        fontSize: 15,
        color: '#666',
        fontWeight: '500',
        letterSpacing: 0.3,
    },
});
