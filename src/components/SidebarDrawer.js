import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { colors } from '../styles/colors';

const { width } = Dimensions.get('window');

const SidebarDrawer = ({ navigation }) => {
  const slideAnim = useRef(new Animated.Value(-width * 0.75)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 7,
        tension: 20,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const menuItems = [
    {
      id: 'home',
      icon: 'home-outline',
      title: 'Home',
      route: 'Home',
    },
    {
      id: 'principals',
      icon: 'git-network-outline',
      title: 'Principals',
      hasSubmenu: true,
      submenu: [],
    },
    {
      id: 'products',
      icon: 'cube-outline',
      title: 'Products',
      route: 'Products',
      isActive: true,
    },
    {
      id: 'distributors',
      icon: 'people-outline',
      title: 'Distributors',
      route: 'Distributors',
    },
    {
      id: 'chargeback',
      icon: 'trending-up-outline',
      title: 'Chargeback',
      route: 'Chargeback',
    },
    {
      id: 'netrate',
      icon: 'pulse-outline',
      title: 'Net Rate',
      route: 'NetRate',
    },
    {
      id: 'divisions',
      icon: 'grid-outline',
      title: 'Divisions',
      route: 'Divisions',
    },
    {
      id: 'field',
      icon: 'person-outline',
      title: 'Field',
      route: 'Field',
    },
    {
      id: 'invoices',
      icon: 'receipt-outline',
      title: 'Invoices',
      route: 'Invoices',
    },
    {
      id: 'sales',
      icon: 'cart-outline',
      title: 'Sales',
      route: 'Sales',
    },
    {
      id: 'reports',
      icon: 'document-text-outline',
      title: 'Reports',
      hasSubmenu: true,
      submenu: [],
    },
    {
      id: 'settings',
      icon: 'settings-outline',
      title: 'Settings',
      hasSubmenu: true,
      submenu: [],
    },
    {
      id: 'logout',
      icon: 'log-out-outline',
      title: 'Logout',
      isLogout: true,
    },
  ];

  const handleMenuPress = (item, index) => {
    const bounceAnim = new Animated.Value(1);
    
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (item.isLogout) {
        // Handle logout
        navigation.navigate('Login');
      } else if (item.route) {
        navigation.navigate(item.route);
        navigation.closeDrawer();
      }
    });
  };

  const renderMenuItem = (item, index) => {
    const itemAnim = useRef(new Animated.Value(0)).current;
    
    React.useEffect(() => {
      Animated.timing(itemAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        key={item.id}
        style={{
          opacity: itemAnim,
          transform: [
            {
              translateX: itemAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              }),
            },
          ],
        }}
      >
        <TouchableOpacity
          style={[
            styles.menuItem,
            item.isActive && styles.activeMenuItem,
            item.isLogout && styles.logoutItem,
          ]}
          onPress={() => handleMenuPress(item, index)}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemContent}>
            <Icon 
              name={item.icon} 
              size={24} 
              color={item.isActive ? colors.primary : '#4A4A4A'} 
            />
            <Text style={[
              styles.menuItemText,
              item.isActive && styles.activeMenuItemText,
              item.isLogout && styles.logoutText,
            ]}>
              {item.title}
            </Text>
          </View>
          {item.hasSubmenu && (
            <Icon 
              name="chevron-forward-outline" 
              size={20} 
              color="#999" 
            />
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              { translateX: slideAnim },
              { scale: scaleAnim },
            ],
            opacity: fadeAnim,
          },
        ]}
      >
        <StatusBar backgroundColor="#F5E6D3" barStyle="dark-content" />
        
        {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.closeDrawer()}
        >
          <Icon name="close" size={24} color="#333" />
        </TouchableOpacity>
        
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              transform: [
                {
                  rotate: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.logo}>
            <View style={[styles.logoCircle, { backgroundColor: colors.primary }]} />
            <View style={[styles.logoCircle, styles.logoCircle2]} />
          </View>
        </Animated.View>
        
        <Text style={styles.companyName}>Mahalxmi Distributors</Text>
        <View style={styles.phoneContainer}>
          <Icon name="call-outline" size={16} color="#666" />
          <Text style={styles.phoneText}>9080704010</Text>
        </View>
      </View>

      {/* Menu Items */}
      <ScrollView 
        style={styles.menuContainer}
        showsVerticalScrollIndicator={false}
      >
        {menuItems.map((item, index) => renderMenuItem(item, index))}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5E6D3',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5E6D3',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: '#F5E6D3',
    borderBottomWidth: 1,
    borderBottomColor: '#E0D0BD',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    position: 'absolute',
    opacity: 0.8,
  },
  logoCircle2: {
    backgroundColor: '#FFB366',
    transform: [{ translateX: 10 }, { translateY: -5 }],
  },
  companyName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  menuContainer: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginHorizontal: 16,
    marginBottom: 4,
    borderRadius: 12,
  },
  activeMenuItem: {
    backgroundColor: '#FFEACC',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    marginLeft: 16,
    fontSize: 16,
    color: '#4A4A4A',
    fontWeight: '500',
  },
  activeMenuItemText: {
    color: colors.primary,
    fontWeight: '600',
  },
  logoutItem: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0D0BD',
    paddingTop: 24,
  },
  logoutText: {
    color: '#666',
  },
});

export default SidebarDrawer;