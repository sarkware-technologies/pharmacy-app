import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,  
  TouchableOpacity,
  Animated,
  Alert,
  Keyboard,
  Dimensions,  
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import OTPInput from '../components/OTPInput';
import CustomButton from '../components/CustomButton';
import { colors } from '../styles/colors';
import { verifyOTP, resendOTP, clearError } from '../redux/slices/authSlice';
import SunLogo from '../components/icons/SunLogo';
import Back from '../components/icons/Back';
import Error from '../components/icons/Error';

const { width, height } = Dimensions.get('window');

const OTPScreen = () => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [verificationError, setVerificationError] = useState('');
  
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { isLoading, error, sessionId, phoneNumber, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  // Animation values
  const headerSlideAnim = useRef(new Animated.Value(-250)).current;
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const formTranslateAnim = useRef(new Animated.Value(0)).current;
  const initialFadeAnim = useRef(new Animated.Value(0)).current;
  const errorShakeAnim = useRef(new Animated.Value(0)).current;

  // Initial animations
  useEffect(() => {
    dispatch(clearError());
    setVerificationError('');
    
    Animated.parallel([
      Animated.timing(initialFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
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
    ]).start();
  }, []);

  // Keyboard handling
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        const keyboardHeight = event.endCoordinates.height;
        setKeyboardHeight(keyboardHeight);
        
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
        
        Animated.timing(formTranslateAnim, {
          toValue: -(keyboardHeight / 1.2),
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        
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
        
        Animated.timing(formTranslateAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Handle authentication success
  useEffect(() => {
    if (isAuthenticated) {
      Alert.alert('Success', 'Login successful!', [
        { text: 'OK', onPress: () => navigation.navigate('Home') },
      ]);
    }
  }, [isAuthenticated, navigation]);

  // Handle errors
  useEffect(() => {
    if (error) {
      setVerificationError('Invalid OTP. Please try again.');
      shakeError();
    }
  }, [error]);

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

  const handleVerify = () => {
    setVerificationError('');
    if (otp.length === 4) {
      dispatch(verifyOTP({ sessionId, otp }));
    } else {
      setVerificationError('Please enter a valid 4-digit OTP');
      shakeError();
    }
  };

  const handleResend = () => {
    dispatch(resendOTP({ sessionId }));
    setTimer(60);
    setCanResend(false);
    setOtp('');
    setVerificationError('');
  };

  const formatTimer = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')} Sec`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContainer}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Back />
        </TouchableOpacity>

        {/* Animated Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerFadeAnim,
              transform: [{ translateY: headerSlideAnim }],
            },
          ]}>
          
        </Animated.View>

        {/* Content */}
        <Animated.ScrollView 
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: keyboardHeight > 0 ? keyboardHeight / 2 : 40 }
          ]}
          style={[
            styles.scrollView,
            {
              transform: [{ translateY: formTranslateAnim }],
            }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}>
          
          <Animated.View
            style={[
              styles.contentWrapper,
              { opacity: initialFadeAnim },
            ]}>

              {/* Logo */}
              <Animated.View
                  style={[
                    styles.logoContainer                    
                  ]}>
                  <SunLogo />            
              </Animated.View>
            
            {/* OTP Form */}
            <View style={styles.formContainer}>
              <Text style={styles.title}>OTP Verification</Text>
              <Text style={styles.subtitle}>
                We have sent a verification code to{'\n'}
                <Text style={styles.phoneNumber}>{phoneNumber || 'your registered number'}</Text>
              </Text>

              <OTPInput value={otp} onChange={setOtp} length={4} />

              {/* Error Message */}
              {verificationError && (
                <Animated.View
                  style={[
                    styles.errorContainer,
                    { transform: [{ translateX: errorShakeAnim }] }
                  ]}>
                  <Error width={16} height={16} />
                  <Text style={styles.errorText}>{verificationError}</Text>
                </Animated.View>
              )}

              <Text style={styles.resendText}>Didn't get the code?</Text>
              
              <TouchableOpacity
                onPress={handleResend}
                disabled={!canResend || isLoading}>
                <Text style={[styles.resendButton, !canResend && styles.resendDisabled]}>
                  Resend Code {!canResend && (
                    <Text style={styles.timerText}>in {formatTimer()}</Text>
                  )}
                </Text>
              </TouchableOpacity>

              <View style={styles.buttonContainer}>
                <CustomButton
                  title="Verify"
                  onPress={handleVerify}
                  loading={isLoading}
                  disabled={otp.length !== 4}
                />
              </View>
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
  backButton: {
    width: 40,
    height: 40,    
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    marginLeft: 20,
    zIndex: 2,
  },
  header: {
    height: 100,   
    justifyContent: 'center',
    alignItems: 'center',    
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  illustrationContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 160,
    paddingHorizontal: 24,
  },
  contentWrapper: {
    flex: 1,
  },
  logoContainer: {
      alignItems: 'center',
      marginTop: 0,
      marginBottom: 20,
      zIndex: 2,
  },
  formContainer: {
    marginTop: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  phoneNumber: {
    fontWeight: 'bold',
    color: colors.text,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.errorBackground,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginLeft: 8,
  },
  resendText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  resendButton: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '500',
  },
  resendDisabled: {
    color: colors.gray,
  },
  timerText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default OTPScreen;