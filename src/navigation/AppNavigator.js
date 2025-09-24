import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import OTPScreen from '../screens/OTPScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ForgotPasswordOTPScreen from '../screens/ForgotPasswordOTPScreen';
import SetNewPasswordScreen from '../screens/SetNewPasswordScreen';
import PasswordSuccessScreen from '../screens/PasswordSuccessScreen';

// Main Navigation
import BottomTabNavigator from './BottomTabNavigator';

// Components
import SidebarDrawer from '../components/SidebarDrawer';

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

// Root Navigator
const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(true); // Set to true for testing
  
  // You can integrate with Redux here to check auth state
  // const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : (
          <Stack.Screen name="Main" component={DrawerNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;