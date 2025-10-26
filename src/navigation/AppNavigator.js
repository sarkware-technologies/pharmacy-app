import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useSelector, useDispatch } from 'react-redux';
import { View, ActivityIndicator } from 'react-native';

// Auth Screens
import LoginScreen from '../screens/unauthorized/LoginScreen';
import OTPScreen from '../screens/unauthorized/OTPScreen';
import ForgotPasswordScreen from '../screens/unauthorized/ForgotPasswordScreen';
import ForgotPasswordOTPScreen from '../screens/unauthorized/ForgotPasswordOTPScreen';
import SetNewPasswordScreen from '../screens/unauthorized/SetNewPasswordScreen';
import PasswordSuccessScreen from '../screens/unauthorized/PasswordSuccessScreen';

// Registration Screens
import RegistrationType from '../screens/authorized/registration/RegistrationType';
import ClinicRegistrationForm from '../screens/authorized/registration/ClinicRegistrationForm';
import DoctorRegistrationForm from '../screens/authorized/registration/DoctorRegistrationForm';
import GroupHospitalRegistrationForm from '../screens/authorized/registration/GroupHospitalRegistrationForm';
import RegistrationSuccess from '../screens/authorized/registration/RegistrationSuccess';
import HospitalSelector from '../screens/authorized/registration/HospitalSelector';
import PharmacySelector from '../screens/authorized/registration/PharmacySelector';

// Main Navigation
import BottomTabNavigator from './BottomTabNavigator';

// Components
import SidebarDrawer from '../components/SidebarDrawer';

// Redux actions
import { checkAuthStatus } from '../redux/slices/authSlice';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Auth Stack
const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyleInterpolator: ({ current, layouts }) => {
        return {
          cardStyle: {
            transform: [
              {
                translateX: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [layouts.screen.width, 0],
                }),
              },
            ],
            opacity: current.progress.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 0.5, 1],
            }),
          },
        };
      },
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="OTP" component={OTPScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="ForgotPasswordOTP" component={ForgotPasswordOTPScreen} />
    <Stack.Screen name="SetNewPassword" component={SetNewPasswordScreen} />
    <Stack.Screen name="PasswordSuccess" component={PasswordSuccessScreen} />
  </Stack.Navigator>
);

// Main Stack (includes drawer and registration flows)
const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyleInterpolator: ({ current, layouts }) => {
        return {
          cardStyle: {
            transform: [
              {
                translateX: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [layouts.screen.width, 0],
                }),
              },
            ],
            opacity: current.progress.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 0.5, 1],
            }),
          },
        };
      },
    }}
  >
    <Stack.Screen name="DrawerMain" component={DrawerNavigator} />
    <Stack.Screen name="RegistrationType" component={RegistrationType} />
    <Stack.Screen name="ClinicRegistrationForm" component={ClinicRegistrationForm} />
    <Stack.Screen name="DoctorRegistrationForm" component={DoctorRegistrationForm} />
    <Stack.Screen name="GroupHospitalRegistrationForm" component={GroupHospitalRegistrationForm} />
    <Stack.Screen name="RegistrationSuccess" component={RegistrationSuccess} />
    <Stack.Screen name="HospitalSelector" component={HospitalSelector} />
    <Stack.Screen name="PharmacySelector" component={PharmacySelector} />
    {/* Add other registration forms here as you create them */}
    {/* <Stack.Screen name="PharmacyRegistrationForm" component={PharmacyRegistrationForm} /> */}
    {/* <Stack.Screen name="HospitalRegistrationForm" component={HospitalRegistrationForm} /> */}
  </Stack.Navigator>
);

// Drawer Navigator with Bottom Tabs
const DrawerNavigator = () => (
  <Drawer.Navigator
    drawerContent={(props) => <SidebarDrawer {...props} />}
    screenOptions={{
      headerShown: false,
      drawerStyle: {
        width: '75%',
        backgroundColor: 'transparent',
      },
      swipeEnabled: true,
      swipeEdgeWidth: 50,
      overlayColor: 'rgba(0, 0, 0, 0.5)',
      drawerType: 'slide',
    }}
  >
    <Drawer.Screen name="MainTabs" component={BottomTabNavigator} />
  </Drawer.Navigator>
);

// Loading Screen Component
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
    <ActivityIndicator size="large" color="#FF9A3E" />
  </View>
);

// Root Navigator
const AppNavigator = () => {
  const dispatch = useDispatch();
  
  // Get auth state from Redux
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  
  // Check auth status when app starts
  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);
  
  // Show loading screen while checking auth status
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : (
          <Stack.Screen name="Main" component={MainStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;