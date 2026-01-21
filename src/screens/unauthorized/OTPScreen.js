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
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import OTPInput from '../../components/OTPInput';
import CustomButton from '../../components/CustomButton';
import { colors } from '../../styles/colors';
import { verifyOTP, resendOTP, clearError, clearDevelopmentOtp } from '../../redux/slices/authSlice';
import SunLogo from '../../components/icons/SunLogo';
import Back from '../../components/icons/Back';
import Error from '../../components/icons/Error';
import AppText from "../../components/AppText"

const { width, height } = Dimensions.get('window');

const OTPScreen = () => {

  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [verificationError, setVerificationError] = useState('');
  const lastSubmittedOtp = useRef(null);
  
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { 
    sessionId, 
    phoneOrEmail, // Get phoneOrEmail from Redux state
    developmentOtp, // Get development OTP from Redux state
    isAuthenticated, 
    otpVerificationLoading, 
    otpVerificationError 
  } = useSelector((state) => state.auth);

  console.log(developmentOtp, 'developmentOtp');
  

  // Animation values
  const headerSlideAnim = useRef(new Animated.Value(-250)).current;
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const formTranslateAnim = useRef(new Animated.Value(0)).current;
  const initialFadeAnim = useRef(new Animated.Value(0)).current;
  const errorShakeAnim = useRef(new Animated.Value(0)).current;

  // Auto-fill OTP in development mode
  useEffect(() => {
    if (developmentOtp) {
      // Convert to string and auto-fill the OTP
      const otpString = developmentOtp.toString();
      setOtp(otpString);
      
      // Show a subtle notification that OTP was auto-filled
      if (__DEV__) {
        console.log('Development OTP auto-filled:', otpString);
      }
      
      // Clear the development OTP from Redux after using it
      // This prevents it from being auto-filled again if user navigates back
      setTimeout(() => {
        dispatch(clearDevelopmentOtp());
      }, 1000);
    }
  }, [developmentOtp, dispatch]);

  // Auto-submit when OTP is fully entered/auto-filled
  useEffect(() => {
    if (otp.length === 4 && !otpVerificationLoading && lastSubmittedOtp.current !== otp) {
      lastSubmittedOtp.current = otp;
      handleVerify();
    }
  }, [otp, otpVerificationLoading]);

  // Format phone number for display
  const formatPhoneOrEmail = (value) => {
    if (!value) return 'your registered number';
    
    // Check if it's an email
    if (value.includes('@')) {
      // Mask email: show first 3 chars + *** + domain
      const [localPart, domain] = value.split('@');
      if (localPart.length <= 3) {
        return `${localPart}***@${domain}`;
      }
      return `${localPart.substring(0, 3)}***@${domain}`;
    }
    
    // It's a phone number - format it
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 10) {
      // Indian format: +91 XXXXX XXXXX
      return `+91 ${cleaned.substring(0, 5)} ${cleaned.substring(5)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('91')) {
      // With country code
      return `+${cleaned.substring(0, 2)} ${cleaned.substring(2, 7)} ${cleaned.substring(7)}`;
    }
    
    // Return as is if format doesn't match
    return value;
  };

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

  // Keyboard handling - Simplified
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
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

  // Handle successful authentication
  useEffect(() => {
    if (isAuthenticated) {
      // Navigation will be handled automatically by AppNavigator
      // since it's listening to isAuthenticated state
      // Optionally, you can reset the navigation stack here
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    }
  }, [isAuthenticated, navigation]);
  
  // Handle OTP verification errors
  useEffect(() => {
    if (otpVerificationError) {
      setVerificationError(otpVerificationError);
      shakeError();
    }
  }, [otpVerificationError]);

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

  const handleVerify = async () => {
    if (otp.length === 4) {
      setVerificationError(''); // Clear any previous errors
      
      // Dispatch the verifyOTP action
      const resultAction = await dispatch(verifyOTP({ sessionId, otp }));
      
      // Check if the action was fulfilled
      if (verifyOTP.fulfilled.match(resultAction)) {
        // Success! The isAuthenticated state will be set to true in Redux
        // and AppNavigator will automatically switch to the Main stack
        console.log('OTP verified successfully');
      } else if (verifyOTP.rejected.match(resultAction)) {
        // Error handling is done via the otpVerificationError state
        console.log('OTP verification failed');
      }
    } else {
      setVerificationError('Please enter a valid 4-digit OTP');
      shakeError();
    }
  };

  const handleResend = () => {
    dispatch(resendOTP(sessionId));
    setTimer(60);
    setCanResend(false);
    setOtp('');
    lastSubmittedOtp.current = null;
    setVerificationError('');
    dispatch(clearError());
  };

  const formatTimer = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')} Sec`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.mainContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Back />
        </TouchableOpacity>

        {/* Content */}
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}>
          
          <Animated.View
            style={[
              styles.contentWrapper,
              { opacity: initialFadeAnim },
            ]}>

            {/* Logo - Hide when keyboard is visible */}
            {keyboardHeight === 0 && (
              <Animated.View
                style={[
                  styles.logoContainer,
                  {
                    opacity: headerFadeAnim,
                    transform: [{ translateY: headerSlideAnim }],
                  }
                ]}>
                <SunLogo />            
              </Animated.View>
            )}
            
            {/* OTP Form */}
            <View style={styles.formContainer}>
              <AppText style={[
                styles.title,
                keyboardHeight > 0 && styles.titleCompact
              ]}>OTP Verification</AppText>
              <AppText style={[
                styles.subtitle,
                keyboardHeight > 0 && styles.subtitleCompact
              ]}>
                We have sent a verification code to{'\n'}
                <AppText style={styles.phoneNumber}>{formatPhoneOrEmail(phoneOrEmail)}</AppText>
              </AppText>

              {/* Development Mode Indicator - Show when OTP is auto-filled */}
              {__DEV__ && developmentOtp && (
                <View style={styles.devModeIndicator}>
                  <AppText style={styles.devModeText}>📱 Dev Mode: OTP auto-filled</AppText>
                </View>
              )}

              <OTPInput value={otp} onChange={setOtp} length={4} />

              {/* Error Message */}
              {verificationError && (
                <Animated.View
                  style={[
                    styles.errorContainer,
                    { transform: [{ translateX: errorShakeAnim }] }
                  ]}>
                  <Error width={16} height={16} />
                  <AppText style={styles.errorText}>{verificationError}</AppText>
                </Animated.View>
              )}

              {/* Hide resend section when keyboard is visible to save space */}
              {keyboardHeight === 0 ? (
                <>
                  <AppText style={styles.resendText}>Didn't get the code?</AppText>
                  
                  <TouchableOpacity
                    onPress={handleResend}
                    disabled={!canResend || otpVerificationLoading}>
                    <AppText style={[styles.resendButton, !canResend && styles.resendDisabled]}>
                      Resend Code {!canResend && (
                        <AppText style={styles.timerText}>in {formatTimer()}</AppText>
                      )}
                    </AppText>
                  </TouchableOpacity>
                </>
              ) : (
                // Compact resend option when keyboard is visible
                <TouchableOpacity
                  onPress={handleResend}
                  disabled={!canResend || otpVerificationLoading}
                  style={{...styles.compactResend, marginBottom: (keyboardHeight > 0 ? -10 : 10), marginTop: (keyboardHeight > 0 ? -5 : 10)}}>
                  <AppText style={[styles.resendButtonCompact, !canResend && styles.resendDisabled]}>
                    {canResend ? 'Resend' : `Resend in ${formatTimer()}`}
                  </AppText>
                </TouchableOpacity>
              )}

              <View style={styles.buttonContainer}>
                <CustomButton
                  title="Verify"
                  onPress={handleVerify}
                  loading={otpVerificationLoading}
                  disabled={otp.length !== 4}
                />
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    marginTop: 10, // Reduced from 50 since SafeAreaView handles the top spacing
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
    paddingTop: 100,
    paddingHorizontal: 24,
    paddingBottom: 40,
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
  titleCompact: {
    fontSize: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  subtitleCompact: {
    fontSize: 14,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  phoneNumber: {
    fontWeight: 'bold',
    color: colors.text,
  },
  devModeIndicator: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 8,
    marginBottom: 15,
    alignSelf: 'center',
  },
  devModeText: {
    fontSize: 12,
    color: '#F57C00',
    fontWeight: '500',
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
  compactResend: {
    marginVertical: 10,
    alignItems: 'center',
  },
  resendButtonCompact: {
    fontSize: 14,
    color: colors.text,
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
    marginBottom: 20,
  },
});

export default OTPScreen;