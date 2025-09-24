import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { colors } from '../styles/colors';

import Home from '../components/icons/Home';
import Customer from '../components/icons/Customer';
import Orders from '../components/icons/Orders';
import Pricing from '../components/icons/Pricing';
import More from '../components/icons/More';

// Import screens
import CustomerListScreen from '../screens/CustomerListScreen';
import CustomerDetailScreen from '../screens/CustomerDetailScreen';
import CustomerSearchScreen from '../screens/CustomerSearchScreen';

// Placeholder screens for other tabs
const HomeScreen = () => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>Home Screen</Text>
    <Text style={styles.placeholderSubtext}>Coming Soon</Text>
  </View>
);

const OrdersScreen = () => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>Orders Screen</Text>
    <Text style={styles.placeholderSubtext}>Coming Soon</Text>
  </View>
);

const PricingScreen = () => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>Pricing & Approvals</Text>
    <Text style={styles.placeholderSubtext}>Coming Soon</Text>
  </View>
);

// No separate MoreScreen needed - it opens the drawer

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Customer Stack Navigator
const CustomerStack = () => (
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
    <Stack.Screen name="CustomerList" component={CustomerListScreen} />
    <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen} />
    <Stack.Screen name="CustomerSearch" component={CustomerSearchScreen} />
  </Stack.Navigator>
);

// Custom Tab Bar Component
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const parentNavigation = useNavigation();
  
  return (
    <View style={[
      styles.tabBar,
      { paddingBottom: insets.bottom > 0 ? insets.bottom : 8 }
    ]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined
          ? options.tabBarLabel
          : options.title !== undefined
          ? options.title
          : route.name;

        // Don't highlight More tab as focused
        const isFocused = route.name === 'More' ? false : state.index === index;

        const onPress = () => {
          // Special handling for More tab
          if (route.name === 'More') {
            // Use DrawerActions to open drawer
            parentNavigation.dispatch(DrawerActions.openDrawer());
            return;
          }

          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const iconName = options.tabBarIcon({ focused: isFocused, color: isFocused ? colors.primary : '#999' });

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            {iconName}
            <Text style={[
              styles.tabLabel,
              { color: isFocused ? colors.primary : '#999' },
              isFocused && styles.activeTabLabel
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
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
        }}
      />
      <Tab.Screen 
        name="Orders" 
        component={OrdersScreen}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({ focused, color }) => (
            <Orders color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Pricing" 
        component={PricingScreen}
        options={{
          tabBarLabel: 'Pricing',
          tabBarIcon: ({ focused, color }) => (
            <Pricing color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="More" 
        component={CustomerStack} // Use CustomerStack as placeholder - drawer will open instead
        options={{
          tabBarLabel: 'More',
          tabBarIcon: ({ focused, color }) => (
            <More color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 8,
    // paddingBottom is now dynamic based on insets
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
    paddingVertical: 4,
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