// src/screens/authorized/registration/ClinicRegistrationForm.js

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../../../styles/colors';
import CustomInput from '../../../components/CustomInput';

const { width, height } = Dimensions.get('window');

// Mock data
const MOCK_AREAS = ['Vadgaonsheri', 'Kharadi', 'Viman Nagar', 'Kalyani Nagar', 'Koregaon Park'];
const MOCK_CITIES = ['Pune', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai'];
const MOCK_STATES = ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Gujarat'];

const ClinicRegistrationForm = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const scrollViewRef = useRef(null);
  const otpRefs = useRef({});
  
  // Form state
  const [formData, setFormData] = useState({
    // License Details
    licenseFileName: '',
    registrationNumber: '',
    registrationDate: '',
    licenseImageName: '',
    
    // General Details
    clinicName: '',
    shortName: '',
    address1: '',
    address2: '',
    address3: '',
    address4: '',
    pincode: '',
    area: '',
    city: '',
    state: '',
    
    // Security Details
    mobileNumber: '',
    emailAddress: '',
    panNumber: '',
    panImageName: '',
    gstNumber: '',
    gstFileName: '',
    
    // Mapping
    markAsBuyingEntity: false,
    selectedCategory: '',
    selectedHospital: null,
    selectedPharmacies: [],
    
    // Customer Group
    customerGroup: 'X',
    stockistSuggestion: '',
    distributorCode: '',
    stockistCity: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Dropdowns
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  
  // OTP states
  const [showOTP, setShowOTP] = useState({
    mobile: false,
    email: false,
    pan: false,
    gst: false,
  });
  const [otpValues, setOtpValues] = useState({
    mobile: ['', '', '', ''],
    email: ['', '', '', ''],
    pan: ['', '', '', ''],
    gst: ['', '', '', ''],
  });
  const [otpTimers, setOtpTimers] = useState({
    mobile: 30,
    email: 30,
    pan: 30,
    gst: 30,
  });
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0.25)).current;
  const otpSlideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    // Entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: currentStep / 4,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  // OTP Timer Effect
  useEffect(() => {
    const timers = {};
    
    Object.keys(otpTimers).forEach(key => {
      if (showOTP[key] && otpTimers[key] > 0) {
        timers[key] = setTimeout(() => {
          setOtpTimers(prev => ({
            ...prev,
            [key]: prev[key] - 1,
          }));
        }, 1000);
      }
    });
    
    return () => {
      Object.values(timers).forEach(timer => clearTimeout(timer));
    };
  }, [otpTimers, showOTP]);

  const handleVerify = (field) => {
    setShowOTP(prev => ({ ...prev, [field]: true }));
    setOtpTimers(prev => ({ ...prev, [field]: 30 }));
    
    // Animate OTP container
    Animated.spring(otpSlideAnim, {
      toValue: 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleOtpChange = (field, index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtpValues = { ...otpValues };
      newOtpValues[field][index] = value;
      setOtpValues(newOtpValues);
      
      // Auto focus next input
      if (value && index < 3) {
        const nextInput = otpRefs.current[`otp-${field}-${index + 1}`];
        if (nextInput) nextInput.focus();
      }
      
      // Check if OTP is complete
      if (newOtpValues[field].every(v => v)) {
        handleOtpVerification(field);
      }
    }
  };

  const handleOtpVerification = (field) => {
    const otp = otpValues[field].join('');
    if (otp === '1234') { // Mock verification
      Alert.alert('Success', `${field} verified successfully!`);
      setShowOTP(prev => ({ ...prev, [field]: false }));
      // Reset OTP values for this field
      setOtpValues(prev => ({
        ...prev,
        [field]: ['', '', '', '']
      }));
    } else {
      Alert.alert('Error', 'Invalid OTP. Please try again.');
    }
  };

  const handleResendOTP = (field) => {
    setOtpTimers(prev => ({ ...prev, [field]: 30 }));
    Alert.alert('OTP Sent', `New OTP sent for ${field} verification.`);
  };

  const validateStep = () => {
    const newErrors = {};
    
    switch (currentStep) {
      case 1: // License Details
        if (!formData.registrationNumber) {
          newErrors.registrationNumber = 'Registration number is required';
        }
        if (!formData.registrationDate) {
          newErrors.registrationDate = 'Registration date is required';
        }
        break;
      
      case 2: // General Details
        if (!formData.clinicName) {
          newErrors.clinicName = 'Clinic name is required';
        }
        if (!formData.address1) {
          newErrors.address1 = 'Address is required';
        }
        if (!formData.pincode || formData.pincode.length !== 6) {
          newErrors.pincode = 'Valid 6-digit pincode is required';
        }
        if (!formData.city) {
          newErrors.city = 'City is required';
        }
        if (!formData.state) {
          newErrors.state = 'State is required';
        }
        break;
      
      case 3: // Security Details
        if (!formData.mobileNumber || formData.mobileNumber.length !== 10) {
          newErrors.mobileNumber = 'Valid 10-digit mobile number is required';
        }
        if (!formData.emailAddress || !formData.emailAddress.includes('@')) {
          newErrors.emailAddress = 'Valid email address is required';
        }
        break;
      
      case 4: // Mapping
        // Optional validations
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep()) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
        scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
      } else {
        handleSubmit();
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to success page
      navigation.navigate('RegistrationSuccess', {
        customerCode: `HSP${Math.random().toString().substr(2, 5)}`,
      });
      
    } catch (error) {
      Alert.alert('Error', 'Failed to register clinic. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toLocaleDateString('en-IN');
      setFormData(prev => ({ ...prev, registrationDate: formattedDate }));
    }
  };

  const renderStepIndicator = () => {
    const steps = ['License', 'General', 'Security', 'Mapping'];
    
    return (
      <View style={styles.stepIndicatorContainer}>
        <View style={styles.stepIndicatorBar}>
          <Animated.View
            style={[
              styles.stepIndicatorProgress,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <View style={styles.stepLabelsContainer}>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepLabelWrapper}>
              <View style={[
                styles.stepDot,
                currentStep > index + 1 && styles.stepDotCompleted,
                currentStep === index + 1 && styles.stepDotActive,
              ]}>
                {currentStep > index + 1 ? (
                  <Icon name="checkmark" size={12} color="#fff" />
                ) : (
                  <Text style={[
                    styles.stepDotText,
                    currentStep === index + 1 && styles.stepDotTextActive,
                  ]}>
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text style={[
                styles.stepLabel,
                currentStep === index + 1 && styles.stepLabelActive,
              ]}>
                {step}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderOTPInput = (field) => {
    if (!showOTP[field]) return null;
    
    return (
      <Animated.View
        style={[
          styles.otpContainer,
          {
            transform: [{ translateY: otpSlideAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <Text style={styles.otpTitle}>Enter 4-digit OTP</Text>
        <View style={styles.otpInputContainer}>
          {[0, 1, 2, 3].map(index => (
            <TextInput
              key={index}
              ref={ref => otpRefs.current[`otp-${field}-${index}`] = ref}
              style={styles.otpInput}
              value={otpValues[field][index]}
              onChangeText={(value) => handleOtpChange(field, index, value)}
              keyboardType="numeric"
              maxLength={1}
            />
          ))}
        </View>
        <View style={styles.otpFooter}>
          <Text style={styles.otpTimer}>
            {otpTimers[field] > 0 ? `Resend in ${otpTimers[field]}s` : ''}
          </Text>
          {otpTimers[field] === 0 && (
            <TouchableOpacity onPress={() => handleResendOTP(field)}>
              <Text style={styles.resendText}>Resend OTP</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  };

  const renderLicenseDetails = () => (
    <Animated.View
      style={[
        styles.stepContent,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.stepTitle}>License Details*</Text>
      
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => Alert.alert('Upload', 'Document upload will be available soon')}
        activeOpacity={0.7}
      >
        <Icon name="cloud-upload-outline" size={24} color={colors.primary} />
        <Text style={styles.uploadButtonText}>
          {formData.licenseFileName || 'FilenameRegistrationcertifie.pdf'}
        </Text>
      </TouchableOpacity>

      <CustomInput
        placeholder="Hospital Registration Number"
        value={formData.registrationNumber}
        onChangeText={(text) => setFormData(prev => ({ ...prev, registrationNumber: text }))}
        error={errors.registrationNumber}
        autoCapitalize="characters"
      />

      <TouchableOpacity
        style={[styles.input, errors.registrationDate && styles.inputError]}
        onPress={() => setShowDatePicker(true)}
        activeOpacity={0.7}
      >
        <Text style={formData.registrationDate ? styles.inputText : styles.placeholderText}>
          {formData.registrationDate || 'Registration Date'}
        </Text>
        <Icon name="calendar-outline" size={20} color="#999" />
      </TouchableOpacity>
      {errors.registrationDate && (
        <Text style={styles.errorText}>{errors.registrationDate}</Text>
      )}

      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => Alert.alert('Upload', 'Image upload will be available soon')}
        activeOpacity={0.7}
      >
        <Icon name="image-outline" size={24} color={colors.primary} />
        <Text style={styles.uploadButtonText}>
          {formData.licenseImageName || 'courierimage.jpeg'}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </Animated.View>
  );

  const renderGeneralDetails = () => (
    <Animated.View
      style={[
        styles.stepContent,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.stepTitle}>General Details*</Text>
      
      <CustomInput
        placeholder="Hospital/Clinic Name"
        value={formData.clinicName}
        onChangeText={(text) => setFormData(prev => ({ ...prev, clinicName: text }))}
        error={errors.clinicName}
      />

      <CustomInput
        placeholder="Short Name"
        value={formData.shortName}
        onChangeText={(text) => setFormData(prev => ({ ...prev, shortName: text }))}
      />

      <CustomInput
        placeholder="Address 1"
        value={formData.address1}
        onChangeText={(text) => setFormData(prev => ({ ...prev, address1: text }))}
        error={errors.address1}
      />

      <CustomInput
        placeholder="Address 2"
        value={formData.address2}
        onChangeText={(text) => setFormData(prev => ({ ...prev, address2: text }))}
      />

      <CustomInput
        placeholder="Address 3"
        value={formData.address3}
        onChangeText={(text) => setFormData(prev => ({ ...prev, address3: text }))}
      />

      <CustomInput
        placeholder="Address 4"
        value={formData.address4}
        onChangeText={(text) => setFormData(prev => ({ ...prev, address4: text }))}
      />

      <CustomInput
        placeholder="Pincode"
        value={formData.pincode}
        onChangeText={(text) => setFormData(prev => ({ ...prev, pincode: text }))}
        keyboardType="numeric"
        maxLength={6}
        error={errors.pincode}
      />

      {/* Area Dropdown */}
      <TouchableOpacity
        style={[styles.input]}
        onPress={() => setShowAreaDropdown(!showAreaDropdown)}
        activeOpacity={0.7}
      >
        <Text style={formData.area ? styles.inputText : styles.placeholderText}>
          {formData.area || 'Area'}
        </Text>
        <Icon name="chevron-down" size={20} color="#999" />
      </TouchableOpacity>
      {showAreaDropdown && (
        <View style={styles.dropdown}>
          {MOCK_AREAS.map((area, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dropdownItem}
              onPress={() => {
                setFormData(prev => ({ ...prev, area }));
                setShowAreaDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>{area}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* City Dropdown */}
      <TouchableOpacity
        style={[styles.input, errors.city && styles.inputError]}
        onPress={() => setShowCityDropdown(!showCityDropdown)}
        activeOpacity={0.7}
      >
        <Text style={formData.city ? styles.inputText : styles.placeholderText}>
          {formData.city || 'City'}
        </Text>
        <Icon name="chevron-down" size={20} color="#999" />
      </TouchableOpacity>
      {showCityDropdown && (
        <View style={styles.dropdown}>
          {MOCK_CITIES.map((city, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dropdownItem}
              onPress={() => {
                setFormData(prev => ({ ...prev, city }));
                setShowCityDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>{city}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* State Dropdown */}
      <TouchableOpacity
        style={[styles.input, errors.state && styles.inputError]}
        onPress={() => setShowStateDropdown(!showStateDropdown)}
        activeOpacity={0.7}
      >
        <Text style={formData.state ? styles.inputText : styles.placeholderText}>
          {formData.state || 'State'}
        </Text>
        <Icon name="chevron-down" size={20} color="#999" />
      </TouchableOpacity>
      {showStateDropdown && (
        <View style={styles.dropdown}>
          {MOCK_STATES.map((state, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dropdownItem}
              onPress={() => {
                setFormData(prev => ({ ...prev, state }));
                setShowStateDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>{state}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Animated.View>
  );

  const renderSecurityDetails = () => (
    <Animated.View
      style={[
        styles.stepContent,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.stepTitle}>Security Details*</Text>
      
      {/* Mobile Number with Verify */}
      <View style={[styles.inputWithButton, errors.mobileNumber && styles.inputError]}>
        <Text style={styles.countryCode}>+91</Text>
        <TextInput
          style={styles.inputField}
          placeholder="Mobile Number"
          value={formData.mobileNumber}
          onChangeText={(text) => setFormData(prev => ({ ...prev, mobileNumber: text }))}
          keyboardType="phone-pad"
          maxLength={10}
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          style={styles.inlineVerifyButton}
          onPress={() => handleVerify('mobile')}
        >
          <Text style={styles.inlineVerifyText}>Verify</Text>
        </TouchableOpacity>
      </View>
      {errors.mobileNumber && (
        <Text style={styles.errorText}>{errors.mobileNumber}</Text>
      )}
      {renderOTPInput('mobile')}

      {/* Email Address with Verify */}
      <View style={[styles.inputWithButton, errors.emailAddress && styles.inputError]}>
        <TextInput
          style={[styles.inputField, { flex: 1 }]}
          placeholder="Email Address"
          value={formData.emailAddress}
          onChangeText={(text) => setFormData(prev => ({ ...prev, emailAddress: text }))}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          style={styles.inlineVerifyButton}
          onPress={() => handleVerify('email')}
        >
          <Text style={styles.inlineVerifyText}>Verify</Text>
        </TouchableOpacity>
      </View>
      {errors.emailAddress && (
        <Text style={styles.errorText}>{errors.emailAddress}</Text>
      )}
      {renderOTPInput('email')}

      {/* PAN Upload */}
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => Alert.alert('Upload', 'PAN upload will be available soon')}
        activeOpacity={0.7}
      >
        <Icon name="image-outline" size={24} color={colors.primary} />
        <Text style={styles.uploadButtonText}>
          {formData.panImageName || 'Upload PAN'}
        </Text>
      </TouchableOpacity>

      {/* PAN Number with Verify - No OTP, just API verification */}
      <View style={styles.inputWithButton}>
        <TextInput
          style={[styles.inputField, { flex: 1 }]}
          placeholder="PAN Number"
          value={formData.panNumber}
          onChangeText={(text) => setFormData(prev => ({ ...prev, panNumber: text.toUpperCase() }))}
          autoCapitalize="characters"
          maxLength={10}
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          style={styles.inlineVerifyButton}
          onPress={() => {
            // Direct API verification, no OTP
            Alert.alert('PAN Verification', 'PAN verified successfully!');
          }}
        >
          <Text style={styles.inlineVerifyText}>Verify</Text>
        </TouchableOpacity>
      </View>
      {errors.panNumber && (
        <Text style={styles.errorText}>{errors.panNumber}</Text>
      )}

      {/* Fetch GST from PAN Link */}
      <TouchableOpacity 
        style={styles.linkButton}
        onPress={() => {
          Alert.alert('Fetch GST', 'Fetching GST details from PAN...');
          // Here you would call API to fetch GST from PAN
          // and populate the GST dropdown options
        }}
      >
        <Text style={styles.linkText}>Fetch GST from PAN</Text>
      </TouchableOpacity>

      {/* GST Upload */}
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => Alert.alert('Upload', 'GST upload will be available soon')}
        activeOpacity={0.7}
      >
        <Icon name="document-outline" size={24} color={colors.primary} />
        <Text style={styles.uploadButtonText}>
          {formData.gstFileName || 'Upload GST'}
        </Text>
      </TouchableOpacity>

      {/* GST Dropdown Selector - Select from fetched GST numbers */}
      <TouchableOpacity
        style={[styles.input]}
        onPress={() => Alert.alert('GST Number', 'Select from GST numbers fetched from PAN')}
        activeOpacity={0.7}
      >
        <Text style={formData.gstNumber ? styles.inputText : styles.placeholderText}>
          {formData.gstNumber || 'GST Number'}
        </Text>
        <Icon name="chevron-down" size={20} color="#999" />
      </TouchableOpacity>
    </Animated.View>
  );

  const renderMapping = () => (
    <Animated.View
      style={[
        styles.stepContent,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.stepTitle}>Mapping</Text>
      
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Mark as buying entity</Text>
        <TouchableOpacity
          style={[
            styles.switch,
            formData.markAsBuyingEntity && styles.switchActive,
          ]}
          onPress={() => setFormData(prev => ({ 
            ...prev, 
            markAsBuyingEntity: !prev.markAsBuyingEntity 
          }))}
          activeOpacity={0.8}
        >
          <Animated.View
            style={[
              styles.switchThumb,
              formData.markAsBuyingEntity && styles.switchThumbActive,
            ]}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionLabel}>Select category <Text style={styles.optional}>(Optional)</Text></Text>
      
      <View style={styles.categoryOptions}>
        <TouchableOpacity
          style={[
            styles.radioButton,
            formData.selectedCategory === 'Group Corporate Hospital' && styles.radioButtonActive,
          ]}
          onPress={() => setFormData(prev => ({ 
            ...prev, 
            selectedCategory: 'Group Corporate Hospital' 
          }))}
          activeOpacity={0.7}
        >
          <View style={styles.radioOuter}>
            {formData.selectedCategory === 'Group Corporate Hospital' && (
              <View style={styles.radioInner} />
            )}
          </View>
          <Text style={styles.radioLabel}>Group Corporate Hospital</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.radioButton,
            formData.selectedCategory === 'Pharmacy' && styles.radioButtonActive,
          ]}
          onPress={() => setFormData(prev => ({ 
            ...prev, 
            selectedCategory: 'Pharmacy' 
          }))}
          activeOpacity={0.7}
        >
          <View style={styles.radioOuter}>
            {formData.selectedCategory === 'Pharmacy' && (
              <View style={styles.radioInner} />
            )}
          </View>
          <Text style={styles.radioLabel}>Pharmacy</Text>
        </TouchableOpacity>
      </View>

      {/* Group Hospital Selector - Show when Group Corporate Hospital is selected */}
      {formData.selectedCategory === 'Group Corporate Hospital' && (
        <>
          <TouchableOpacity
            style={styles.selectorInput}
            onPress={() => {
              navigation.navigate('HospitalSelector', {
                selectedHospitals: formData.selectedHospital ? [formData.selectedHospital] : [],
                onSelect: (hospitals) => {
                  // For single selection, take the first hospital
                  setFormData(prev => ({ ...prev, selectedHospital: hospitals[0] || null }));
                }
              });
            }}
            activeOpacity={0.7}
          >
            {formData.selectedHospital ? (
              <View style={styles.selectedItem}>
                <View>
                  <Text style={styles.selectedItemName}>{formData.selectedHospital.name}</Text>
                  <Text style={styles.selectedItemCode}>{formData.selectedHospital.code}</Text>
                </View>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    setFormData(prev => ({ ...prev, selectedHospital: null }));
                  }}
                >
                  <Icon name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.selectorPlaceholder}>Search hospital name/code</Text>
                <Icon name="search" size={20} color="#999" />
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.addNewLink}
            onPress={() => Alert.alert('Add Hospital', 'Navigate to add new group hospital')}
          >
            <Icon name="add" size={20} color={colors.primary} />
            <Text style={styles.addNewLinkText}>Add New Group Hospital</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Pharmacy Selector - Show when Pharmacy is selected */}
      {formData.selectedCategory === 'Pharmacy' && (
        <>
          <TouchableOpacity
            style={styles.selectorInput}
            onPress={() => {
              navigation.navigate('PharmacySelector', {
                selectedPharmacies: formData.selectedPharmacies,
                onSelect: (pharmacies) => {
                  setFormData(prev => ({ ...prev, selectedPharmacies: pharmacies }));
                }
              });
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.selectorPlaceholder}>Search pharmacy name/code</Text>
            <Icon name="search" size={20} color="#999" />
          </TouchableOpacity>
          
          {/* Selected Pharmacies List */}
          {formData.selectedPharmacies.map((pharmacy) => (
            <View key={pharmacy.id} style={styles.selectedPharmacyItem}>
              <View style={styles.pharmacyInfo}>
                <Text style={styles.pharmacyName}>{pharmacy.name}</Text>
                <Text style={styles.pharmacyCode}>{pharmacy.code}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setFormData(prev => ({
                    ...prev,
                    selectedPharmacies: prev.selectedPharmacies.filter(p => p.id !== pharmacy.id)
                  }));
                }}
              >
                <Icon name="close-circle" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ))}
          
          <TouchableOpacity 
            style={styles.addNewLink}
            onPress={() => Alert.alert('Add Pharmacy', 'Navigate to add new pharmacy')}
          >
            <Icon name="add" size={20} color={colors.primary} />
            <Text style={styles.addNewLinkText}>Add New Pharmacy</Text>
          </TouchableOpacity>
        </>
      )}

      <View style={styles.divider} />

      <Text style={styles.sectionLabel}>Customer group</Text>
      
      <View style={styles.customerGroupContainer}>
        {['X', 'Y', 'Doctor Supply', '10+50', '12+60'].map((group) => (
          <TouchableOpacity
            key={group}
            style={[
              styles.customerGroupButton,
              formData.customerGroup === group && styles.customerGroupButtonActive,
            ]}
            onPress={() => setFormData(prev => ({ ...prev, customerGroup: group }))}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.customerGroupButtonText,
              formData.customerGroup === group && styles.customerGroupButtonTextActive,
            ]}>
              {group}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Stockist Suggestions <Text style={styles.optional}>(Optional)</Text></Text>
      
      <CustomInput
        placeholder="Name of the Stockist"
        value={formData.stockistSuggestion}
        onChangeText={(text) => setFormData(prev => ({ ...prev, stockistSuggestion: text }))}
      />

      <CustomInput
        placeholder="Distributor Code"
        value={formData.distributorCode}
        onChangeText={(text) => setFormData(prev => ({ ...prev, distributorCode: text }))}
      />

      <CustomInput
        placeholder="City"
        value={formData.stockistCity}
        onChangeText={(text) => setFormData(prev => ({ ...prev, stockistCity: text }))}
      />

      <TouchableOpacity
        style={styles.addStockistButton}
        onPress={() => Alert.alert('Add Stockist', 'Stockist addition will be available soon')}
        activeOpacity={0.7}
      >
        <Icon name="add" size={20} color={colors.primary} />
        <Text style={styles.addStockistButtonText}>Add New Stockist</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderLicenseDetails();
      case 2:
        return renderGeneralDetails();
      case 3:
        return renderSecurityDetails();
      case 4:
        return renderMapping();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registration</Text>
      </View>

      <View style={styles.typeHeader}>
        <View style={styles.typeTag}>
          <Text style={styles.typeTagText}>Hospital</Text>
        </View>
        <Icon name="chevron-forward" size={16} color="#999" />
        <View style={styles.typeTag}>
          <Text style={styles.typeTagText}>Private</Text>
        </View>
        <Icon name="chevron-forward" size={16} color="#999" />
        <View style={[styles.typeTag, styles.typeTagActive]}>
          <Text style={[styles.typeTagText, styles.typeTagTextActive]}>Clinic</Text>
        </View>
      </View>

      {renderStepIndicator()}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {renderCurrentStep()}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={styles.backStepButton}
            onPress={handlePreviousStep}
            activeOpacity={0.7}
          >
            <Text style={styles.backStepButtonText}>Previous</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[
            styles.nextStepButton,
            currentStep === 1 && { flex: 1 },
          ]}
          onPress={handleNextStep}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.nextStepButtonText}>
              {currentStep === 4 ? 'Register' : 'Next'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  typeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  typeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    marginHorizontal: 4,
  },
  typeTagActive: {
    backgroundColor: '#FFF5ED',
  },
  typeTagText: {
    fontSize: 12,
    color: '#666',
  },
  typeTagTextActive: {
    color: colors.primary,
    fontWeight: '500',
  },
  stepIndicatorContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  stepIndicatorBar: {
    height: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  stepIndicatorProgress: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  stepLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  stepLabelWrapper: {
    alignItems: 'center',
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepDotActive: {
    backgroundColor: colors.primary,
  },
  stepDotCompleted: {
    backgroundColor: '#4CAF50',
  },
  stepDotText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  stepDotTextActive: {
    color: '#fff',
  },
  stepLabel: {
    fontSize: 11,
    color: '#999',
  },
  stepLabelActive: {
    color: colors.primary,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  stepContent: {
    paddingTop: 20,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.loginInputBorderColor,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  inputError: {
    borderColor: colors.error,
  },
  inputText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 4,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 16,
    marginBottom: 16,
    backgroundColor: '#FFF5ED',
  },
  uploadButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 8,
  },
  dropdown: {
    position: 'relative',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginTop: -10,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxHeight: 200,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  inputWithButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.loginInputBorderColor,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 10,
  },
  countryCode: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  inlineVerifyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFF5ED',
    borderRadius: 16,
  },
  inlineVerifyText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  otpContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    marginTop: -8,
  },
  otpTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  otpInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    backgroundColor: '#fff',
  },
  otpFooter: {
    alignItems: 'center',
  },
  otpTimer: {
    fontSize: 13,
    color: '#999',
  },
  resendText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#DDD',
    padding: 2,
    justifyContent: 'center',
  },
  switchActive: {
    backgroundColor: colors.primary,
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
  },
  switchThumbActive: {
    transform: [{ translateX: 20 }],
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  optional: {
    fontSize: 14,
    fontWeight: '400',
    color: '#999',
  },
  categoryOptions: {
    marginBottom: 20,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
  },
  customerGroupContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  customerGroupButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 20,
    backgroundColor: '#FAFAFA',
  },
  customerGroupButtonActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFF5ED',
  },
  customerGroupButtonText: {
    fontSize: 14,
    color: '#666',
  },
  customerGroupButtonTextActive: {
    color: colors.primary,
    fontWeight: '500',
  },
  addStockistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  addStockistButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
  linkButton: {
    paddingVertical: 8,
    marginBottom: 16,
    marginTop: -8,
  },
  linkText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  selectorInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.loginInputBorderColor,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  selectorPlaceholder: {
    fontSize: 16,
    color: '#999',
    flex: 1,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  selectedItemName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectedItemCode: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  selectedPharmacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 8,
  },
  pharmacyInfo: {
    flex: 1,
  },
  pharmacyName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  pharmacyCode: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  addNewLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 20,
  },
  addNewLinkText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 8,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  bottomNavigation: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 12,
  },
  backStepButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  backStepButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  nextStepButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  nextStepButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default ClinicRegistrationForm;