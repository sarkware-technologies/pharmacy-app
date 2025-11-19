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
import PrivateRegistrationForm from '../screens/authorized/registration/PrivateRegistration';
import DoctorRegistrationForm from '../screens/authorized/registration/DoctorRegistrationForm';
import GroupHospitalRegistrationForm from '../screens/authorized/registration/GroupHospitalRegistrationForm';
import GovtHospitalRegistrationForm from '../screens/authorized/registration/GovtHospitalRegistrationForm';
import RegistrationSuccess from '../screens/authorized/registration/RegistrationSuccess';
import HospitalSelector from '../screens/authorized/registration/HospitalSelector';
import DoctorSelector from '../screens/authorized/registration/DoctorSelector';
import PharmacySelector from '../screens/authorized/registration/PharmacySelector';
import PharmacyRetailerForm from '../screens/authorized/registration/PharmacyRetailer';
import PharmacyWholesalerForm from '../screens/authorized/registration/PharmacyWholesaler';
import PharmacyWholesalerRetailerForm from '../screens/authorized/registration/PharmacyWholesalerRetailer';

// Pricing Screens
import RateContractList from '../screens/authorized/pricing/RateContractList';
import CreateRateContract from '../screens/authorized/pricing/CreateRateContract';
import RateContractDetail from '../screens/authorized/pricing/RateContractDetail';

// Distributor Screens
import DistributorList from '../screens/authorized/distributor/DistributorList';
import DistributorDetail from '../screens/authorized/distributor/DistributorDetail';
import DistributorSearch from '../screens/authorized/distributor/DistributorSearch';
import DistributorGroupUpdate from '../screens/authorized/distributor/DistributorGroupUpdate';

import DivisionList from '../screens/authorized/division/DivisionList';
import DivisionDetail from '../screens/authorized/division/DivisionDetail';
import DivisionSearch from '../screens/authorized/division/DivisionSearch';
import DivisionGroupUpdate from '../screens/authorized/division/DivisionGroupUpdate';
import UpdateMaxDiscount from '../screens/authorized/division/UpdateMaxDiscount';
import CEOThresholdUpdate from '../screens/authorized/division/CEOThresholdUpdate';

import ProductList from '../screens/authorized/product/ProductList';
import ProductDetail from '../screens/authorized/product/ProductDetail';
import ProductSearch from '../screens/authorized/product/ProductSearch';
import ProductBulkEdit from '../screens/authorized/product/ProductBulkEdit';

// Chargeback Screens
import ChargebackListing from '../screens/authorized/chargeback/ChargebackListing';
import ClaimDetails from '../screens/authorized/chargeback/ClaimDetails';

// Netrack Screens
import NetRateListing from '../screens/authorized/netrate/NetRateListing';
import InvoiceDetails from '../screens/authorized/netrate/InvoiceDetails';

// Customer Screens
import CustomerSearch from '../screens/authorized/customer/CustomerSearch';

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

// Product Stack - WITHOUT bottom tabs (for sub-screens)
const ProductStack = () => (
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
              inputRange: [0, 1],
              outputRange: [0, 1],
            }),
          },
        };
      },
    }}
  >
    <Stack.Screen name="ProductListMain" component={ProductList} />
    <Stack.Screen name="ProductDetail" component={ProductDetail} />
    <Stack.Screen name="ProductSearch" component={ProductSearch} />
    <Stack.Screen name="ProductBulkEdit" component={ProductBulkEdit} />
  </Stack.Navigator>
);

// Distributor Stack - WITHOUT bottom tabs (for sub-screens)
const DistributorStack = () => (
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
              inputRange: [0, 1],
              outputRange: [0, 1],
            }),
          },
        };
      },
    }}
  >
    <Stack.Screen name="DistributorListMain" component={DistributorList} />
    <Stack.Screen name="DistributorDetail" component={DistributorDetail} />
    <Stack.Screen name="DistributorSearch" component={DistributorSearch} />
    <Stack.Screen name="DistributorGroupUpdate" component={DistributorGroupUpdate} />
  </Stack.Navigator>
);

// Division Stack - WITHOUT bottom tabs (for sub-screens)
const DivisionStack = () => (
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
              inputRange: [0, 1],
              outputRange: [0, 1],
            }),
          },
        };
      },
    }}
  >
    <Stack.Screen name="DivisionListMain" component={DivisionList} />
    <Stack.Screen name="DivisionDetail" component={DivisionDetail} />
    <Stack.Screen name="DivisionSearch" component={DivisionSearch} />
    <Stack.Screen name="DivisionGroupUpdate" component={DivisionGroupUpdate} />
    <Stack.Screen name="UpdateMaxDiscount" component={UpdateMaxDiscount} />
    <Stack.Screen name="CEOThresholdUpdate" component={CEOThresholdUpdate} />
  </Stack.Navigator>
);

// Chargeback Stack - WITHOUT bottom tabs (for sub-screens)
const ChargebackStack = () => (
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
              inputRange: [0, 1],
              outputRange: [0, 1],
            }),
          },
        };
      },
    }}
  >
    <Stack.Screen name="ChargebackListing" component={ChargebackListing} />
    <Stack.Screen name="ClaimDetails" component={ClaimDetails} />
  </Stack.Navigator>
);

// Netrate Stack - WITHOUT bottom tabs (for sub-screens)
const NetrateStack = () => (
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
              inputRange: [0, 1],
              outputRange: [0, 1],
            }),
          },
        };
      },
    }}
  >
    <Stack.Screen name="NetRateListing" component={NetRateListing} />
    <Stack.Screen name="InvoiceDetails" component={InvoiceDetails} />
  </Stack.Navigator>
);

// Customer Stack - WITHOUT bottom tabs (for search screen)
const CustomerStack = () => (
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
              inputRange: [0, 1],
              outputRange: [0, 1],
            }),
          },
        };
      },
    }}
  >
    <Stack.Screen name="CustomerSearchMain" component={CustomerSearch} />
  </Stack.Navigator>
);

// Main Stack (includes drawer and all navigation flows)
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
    {/* Main app with drawer and bottom tabs */}
    <Stack.Screen name="DrawerMain" component={DrawerNavigator} />

    {/* Registration Screens (no bottom tabs) */}
    <Stack.Screen name="RegistrationType" component={RegistrationType} />
    <Stack.Screen name="PrivateRegistrationForm" component={PrivateRegistrationForm} />
    <Stack.Screen name="DoctorRegistrationForm" component={DoctorRegistrationForm} />
    <Stack.Screen name="GroupHospitalRegistrationForm" component={GroupHospitalRegistrationForm} />
    <Stack.Screen name="GovtHospitalRegistrationForm" component={GovtHospitalRegistrationForm} />
    <Stack.Screen name="PharmacyRetailerForm" component={PharmacyRetailerForm} />
    <Stack.Screen name="PharmacyWholesalerForm" component={PharmacyWholesalerForm} />
    <Stack.Screen name="PharmacyWholesalerRetailerForm" component={PharmacyWholesalerRetailerForm} />
    <Stack.Screen name="RegistrationSuccess" component={RegistrationSuccess} />
    <Stack.Screen name="HospitalSelector" component={HospitalSelector} />
    <Stack.Screen name="DoctorSelector" component={DoctorSelector} />
    <Stack.Screen name="PharmacySelector" component={PharmacySelector} />
    {/* These are for the tab stacks - handled in BottomTabNavigator */}
    <Stack.Screen name="RateContractList" component={RateContractList} />
    <Stack.Screen name="CreateRateContract" component={CreateRateContract} />
    <Stack.Screen name="RateContractDetail" component={RateContractDetail} />
    {/* Product Stack - opens without bottom tabs */}
    <Stack.Screen name="ProductStack" component={ProductStack} />
    {/* Distributor Stack - opens without bottom tabs */}
    <Stack.Screen name="DistributorStack" component={DistributorStack} />
    {/* Division Stack - opens without bottom tabs */}
    <Stack.Screen name="DivisionStack" component={DivisionStack} />
    {/* Chargeback Stack - opens without bottom tabs */}
    <Stack.Screen name="ChargebackStack" component={ChargebackStack} />
    {/* Netrate Stack - opens without bottom tabs */}
    <Stack.Screen name="NetrateStack" component={NetrateStack} />
    {/* Customer Stack - opens without bottom tabs */}
    <Stack.Screen name="CustomerStack" component={CustomerStack} />
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
const AppNavigator = ({ navigationRef }) => {
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
    <NavigationContainer ref={navigationRef}>
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