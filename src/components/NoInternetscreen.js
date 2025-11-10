import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function NoInternetScreen({ onRetry }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY }],
          alignItems: 'center',
        }}
      >
        {/* 🌐 SVG Illustration */}
        <Svg width={220} height={220} viewBox="0 0 220 220">
          {/* Cloud */}
          <Path
            d="M64 86c-12 0-22-9.7-22-21.7 0-11 8.2-20 19-20 1 0 3 0 4 0 4-12 15-20 28-20 14 0 26 10 29 24 1 0 3 0 4 0 9 0 16 8 16 17 0 9-7 16-16 16H64z"
            fill="#E6F0FF"
            transform="translate(25,40)"
          />
          {/* WiFi arcs */}
          <Path
            d="M60 140c30-30 80-30 110 0"
            stroke="#F7941E"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
            transform="translate(-10,-20)"
          />
          <Path
            d="M80 155c20-20 50-20 70 0"
            stroke="#F7941E"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
            strokeDasharray="5,6"
            transform="translate(-10,-20)"
          />
          <Path
            d="M95 168c10-10 30-10 40 0"
            stroke="#F7941E"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            transform="translate(-10,-20)"
          />
          {/* Cross mark */}
          <Line x1="110" y1="70" x2="140" y2="100" stroke="#FF4D4F" strokeWidth="6" strokeLinecap="round" />
          <Line x1="140" y1="70" x2="110" y2="100" stroke="#FF4D4F" strokeWidth="6" strokeLinecap="round" />
          {/* Device Base */}
          <Circle cx="110" cy="185" r="8" fill="#F7941E" />
        </Svg>

        {/* Text Section */}
        <Text style={styles.title}>No Internet Connection</Text>
        <Text style={styles.subtitle}>
          You’re currently offline. Please check your internet connection and try again.
        </Text>

        {/* Retry Button */}
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
    height,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 25,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#F7941E',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 40,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
