import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../styles/colors';

const { width } = Dimensions.get('window');

const RegistrationSuccess = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { customerCode, codeType } = route.params || { customerCode: 'HSP12345', codeType: 'Customer' };
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;
  const contentFadeAnim = useRef(new Animated.Value(0)).current;
  
  // Decorative elements animations
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Sequence of animations
    Animated.sequence([
      // First show the circle
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Then show the checkmark
      Animated.spring(checkAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      // Finally show the content
      Animated.timing(contentFadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Continuous animations for decorative elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
  const handleOkay = () => {
    navigation.navigate('DrawerMain', {
      screen: 'MainTabs',
      params: {
        screen: 'Customers',
        params: {
          screen: 'CustomerList'
        }
      }
    });
  };
  
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  const float = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });
  
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      <View style={styles.content}>
        {/* Logo/Icon at top */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.logoCircle}>
            <View style={styles.logoInnerCircle} />
          </View>
        </Animated.View>
        
        {/* Success Icon */}
        <Animated.View
          style={[
            styles.successIconContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.successCircle}>
            <Animated.View
              style={[
                styles.checkmarkContainer,
                {
                  opacity: checkAnim,
                  transform: [{ scale: checkAnim }],
                },
              ]}
            >
              <Icon name="checkmark" size={50} color="#fff" />
            </Animated.View>
          </View>
          
          {/* Decorative elements */}
          <View style={styles.decorativeElements}>
            <Animated.View 
              style={[
                styles.decorativeDot, 
                { 
                  top: -20, 
                  left: -30,
                  transform: [{ translateY: float }]
                }
              ]} 
            />
            <Animated.View 
              style={[
                styles.decorativePlus, 
                { 
                  top: -10, 
                  right: -25,
                  transform: [{ rotate: spin }]
                }
              ]}
            >
              <Text style={styles.plusText}>+</Text>
            </Animated.View>
            <Animated.View 
              style={[
                styles.decorativeCircle, 
                { 
                  bottom: -15, 
                  left: -25,
                  transform: [{ scale: checkAnim }]
                }
              ]} 
            />
            <Animated.View 
              style={[
                styles.decorativeCross, 
                { 
                  bottom: -20, 
                  right: -30,
                  transform: [{ rotate: spin }]
                }
              ]}
            >
              <Text style={styles.crossText}>×</Text>
            </Animated.View>
            <Animated.View 
              style={[
                styles.decorativeTriangle, 
                { 
                  top: 20, 
                  left: -40,
                  transform: [{ translateY: float }]
                }
              ]} 
            />
            <Animated.View 
              style={[
                styles.decorativeDot, 
                { 
                  bottom: 10, 
                  right: -40,
                  backgroundColor: '#87CEEB',
                  transform: [{ scale: checkAnim }]
                }
              ]} 
            />
          </View>
        </Animated.View>
        
        {/* Success Message */}
        <Animated.View
          style={[
            styles.messageContainer,
            {
              opacity: contentFadeAnim,
            },
          ]}
        >
          <Text style={styles.successTitle}>Successful!</Text>
          <Text style={styles.successMessage}>
            We have received your information,{'\n'}
            It will take upto 24 hours to approved, if we found{'\n'}
            any issue our team will get back to you
          </Text>
          <Text style={styles.customerCode}>{codeType || 'Customer'} Code: {customerCode}</Text>
        </Animated.View>
        
        {/* Spacer */}
        <View style={{ flex: 1 }} />
        
        {/* Okay Button */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: contentFadeAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.okayButton}
            onPress={handleOkay}
            activeOpacity={0.8}
          >
            <Text style={styles.okayButtonText}>Okay</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 60,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF5ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInnerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
  successIconContainer: {
    position: 'relative',
    marginBottom: 40,
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  checkmarkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  decorativeElements: {
    position: 'absolute',
    width: 140,
    height: 140,
  },
  decorativeDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
  },
  decorativePlus: {
    position: 'absolute',
  },
  plusText: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: 'bold',
  },
  decorativeCircle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#87CEEB',
    backgroundColor: 'transparent',
  },
  decorativeCross: {
    position: 'absolute',
  },
  crossText: {
    fontSize: 24,
    color: '#FF69B4',
    fontWeight: 'bold',
  },
  decorativeTriangle: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#98FB98',
  },
  messageContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  customerCode: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  buttonContainer: {
    width: '100%',
  },
  okayButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  okayButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
});

export default RegistrationSuccess;