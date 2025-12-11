import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import OrdersStack from '../navigation/OrdersStack';
import { colors } from '../styles/colors';
import AppText from "../components/AppText"

import Home from '../components/icons/menu/Home';
import Customer from '../components/icons/menu/Customer';
import Orders from '../components/icons/menu/Orders';
import Pricing from '../components/icons/menu/Pricing';
import More from '../components/icons/menu/More';

// Import screens
import CustomerList from '../screens/authorized/customer/CustomerList';
import CustomerDetail from '../screens/authorized/customer/CustomerDetail';
import CustomerSearch from '../screens/authorized/customer/CustomerSearch';

// Import Pricing screens
import RateContractList from '../screens/authorized/pricing/RateContractList';
import CreateRateContract from '../screens/authorized/pricing/CreateRateContract';
import RateContractDetail from '../screens/authorized/pricing/RateContractDetail';

// Import Product screens - only ProductList for the tab
import ProductList from '../screens/authorized/product/ProductList';

// Import Distributor screens - only DistributorList for the tab
import DistributorList from '../screens/authorized/distributor/DistributorList';

// Import Division screens - only DivisionList for the tab
import DivisionList from '../screens/authorized/division/DivisionList';

import ChargebackListing from '../screens/authorized/chargeback/ChargebackListing';

import NetRateListing from '../screens/authorized/netrate/NetRateListing';
import MoreMenu from "../components/MoreMenu"
import PermissionWrapper from '../utils/RBAC/permissionWrapper';
import PERMISSIONS from '../utils/RBAC/permissionENUM';

// Placeholder screens for other tabs
const HomeScreen = () => (
  <View style={styles.placeholder}>
    <AppText style={styles.placeholderText}>Home Screen</AppText>
    <AppText style={styles.placeholderSubtext}>Coming Soon</AppText>
  </View>
);

const OrdersScreen = () => (
  <View style={styles.placeholder}>
    <AppText style={styles.placeholderText}>Orders Screen</AppText>
    <AppText style={styles.placeholderSubtext}>Coming Soon</AppText>
  </View>
);

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Customer Stack Navigator
const CustomerStack = () => {
  return <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyleInterpolator: ({ current, next, layouts }) => {
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
    <Stack.Screen name="CustomerList" component={CustomerList} />
    <Stack.Screen
      name="CustomerDetail"
      component={CustomerDetail}
      options={{
        tabBarStyle: { display: 'none' }
      }}
    />
    <Stack.Screen name="CustomerSearch" component={CustomerSearch} />
  </Stack.Navigator>
};

// Pricing Stack Navigator
const PricingStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyleInterpolator: ({ current, next, layouts }) => {
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
    <Stack.Screen name="RateContractList" component={RateContractList} />
    <Stack.Screen name="CreateRateContract" component={CreateRateContract} />
    <Stack.Screen name="RateContractDetail" component={RateContractDetail} />
  </Stack.Navigator>
);

// Dynamic screen component based on route state
// This allows us to show ProductList, DistributorList, DivisionList, etc. with bottom tabs
const DynamicScreen = ({ route }) => {
  const screenName = route.params?.screen || 'Home';

  switch (screenName) {
    case 'ProductList':
      return <ProductList />;
    case 'DistributorList':
      return <DistributorList />;
    case 'DivisionList':
      return <DivisionList />;
    case 'ChargebackListing':
      return <ChargebackListing />;
    case 'NetRateListing':
      return <NetRateListing />
    default:
      return <HomeScreen />;
  }
};

// Custom Tab Bar Component
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const [showMore, setShowMore] = useState(false);
  const insets = useSafeAreaInsets();

  // Check if current route is CustomerDetail - if so, hide the tab bar
  const currentRoute = state.routes[state.index];
  const isCustomerDetailRoute = currentRoute?.state?.routes?.some(
    (route) => route.name === 'CustomerDetail'
  );

  if (isCustomerDetailRoute) {
    return null;
  }

  return (
    <>
      <View
        style={[
          styles.tabBar,
          { paddingBottom: insets.bottom > 0 ? insets.bottom : 8 },
        ]}
      >
        {state.routes
          .filter((route) => route.name !== 'DynamicTab')
          .map((route, index) => {
            const { options } = descriptors[route.key];
            const label = options.tabBarLabel ?? route.name;

            const isCurrentDynamicTab = state.routes[state.index]?.name === 'DynamicTab';

            const isFocused =
              route.name === 'More'
                ? showMore || isCurrentDynamicTab
                : state.index === state.routes.findIndex(
                  (r) => r.name === route.name
                );

            const onPress = () => {
              if (route.name === 'More') {
                setShowMore(true);
                return;
              }
              setShowMore(false);

              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const iconName = options.tabBarIcon({
              focused: isFocused,
              color: isFocused ? colors.primary : '#999',
            });

            return (
              <PermissionWrapper key={index} permission={options.permission}>
                <TouchableOpacity

                  onPress={onPress}
                  style={styles.tabItem}
                  activeOpacity={0.7}
                >
                  {isFocused && (
                    <View style={{ borderBottomColor: "#F7941E", borderBottomWidth: 4, width: "100%", position: "absolute", top: 0, borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}></View>
                  )}
                  {iconName}
                  <AppText
                    style={[
                      styles.tabLabel,
                      { color: isFocused ? colors.primary : '#999' },
                      isFocused && styles.activeTabLabel,
                    ]}
                  >
                    {label}
                  </AppText>
                </TouchableOpacity>
              </PermissionWrapper>
            );
          })}
      </View>

      {/* ✅ Add modal here */}
      <MoreMenu
        visible={showMore}
        onClose={() => setShowMore(false)}
        onSelect={(screenName) => {
          setShowMore(false);
          navigation.navigate('DynamicTab', { screen: screenName });
        }}
        activeScreen={
          state.routes[state.index]?.name === 'DynamicTab'
            ? state.routes[state.index]?.params?.screen
            : state.routes[state.index]?.name
        }
      />
    </>
  );
};

// Main Bottom Tab Navigator
const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <Home color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Customers"
        component={CustomerStack}
        options={{
          tabBarLabel: 'Customers',
          tabBarIcon: ({ focused, color }) => (
            <Customer color={color} />
          ),
          permission: [PERMISSIONS.ONBOARDING_LISTING_PAGE_ALL_PAGE_VIEW]
        }}

      />
      <Tab.Screen
        name="Orders"
        component={OrdersStack}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({ focused, color }) => (
            <Orders color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Pricing"
        component={PricingStack}
        options={{
          tabBarLabel: 'Pricing',
          tabBarIcon: ({ focused, color }) => (

            <Pricing color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="More"
        component={CustomerStack}
        options={{
          tabBarLabel: 'More',
          tabBarIcon: ({ focused, color }) => (
            <More color={color} />
          ),
        }}
      />
      {/* Hidden tab for dynamic screens */}
      <Tab.Screen
        name="DynamicTab"
        component={DynamicScreen}
        options={{
          tabBarButton: () => null, // Hide this tab from the tab bar
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 13,
    paddingVertical: 4,
    position: "relative",
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  activeTabLabel: {
    fontWeight: '500',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#666',
  },
});

export default BottomTabNavigator;