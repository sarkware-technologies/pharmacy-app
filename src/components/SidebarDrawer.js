import React, { useRef, useEffect, useState } from 'react';
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
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../styles/colors';
import { logout } from '../redux/slices/authSlice';

// Import your custom icons
import CloseCircle from './icons/CloseCircle';
import SunLogo from './icons/SunLogo';
import Phone from './icons/Phone';
import HomeIcon from './icons/menu/Home';
import PrincipalsIcon from './icons/menu/Principals';
import ProductsIcon from './icons/menu/Products';
import InvoicesIcon from './icons/menu/Invoices';
import ChargebackIcon from './icons/menu/Chargeback';
import NetRateIcon from './icons/menu/NetRate';
import DistributorsIcon from './icons/menu/Distributors';
import DivisionsIcon from './icons/menu/Divisions';
import FieldIcon from './icons/menu/Field';
import SalesIcon from './icons/menu/Sales';
import ReportsIcon from './icons/menu/Reports';
import SettingsIcon from './icons/menu/Settings';
import LogoutIcon from './icons/menu/Logout';
import ArrowDown from './icons/ArrowDown';
import ArrowUp from './icons/ArrowUp';

const { width } = Dimensions.get('window');

// Icon component mapping
const iconComponents = {
  home: HomeIcon,
  principals: PrincipalsIcon,
  products: ProductsIcon,
  invoices: InvoicesIcon,
  chargeback: ChargebackIcon,
  netrate: NetRateIcon,
  distributors: DistributorsIcon,
  divisions: DivisionsIcon,
  field: FieldIcon,
  sales: SalesIcon,
  reports: ReportsIcon,
  settings: SettingsIcon,
  logout: LogoutIcon,
};

// Menu configuration based on your JSON structure
const menuConfig = [
  {
    id: "home",
    label: "Home",
    icon: "home",
    route: "Home",
    secondary: [],
  },
  {
    id: "principals",
    label: "Principals",
    icon: "principals",
    secondary: [
      { id: "products", label: "Products", icon: "products", route: "Products" },
      { id: "distributors", label: "Distributors", icon: "distributors", route: "Distributors" },
      { id: "chargeback", label: "Chargeback", icon: "chargeback", route: "Chargeback" },
      { id: "netrate", label: "Net Rate", icon: "netrate", route: "NetRate" },
      { id: "divisions", label: "Divisions", icon: "divisions", route: "Divisions" },
      { id: "field", label: "Field", icon: "field", route: "Field" },
      { id: "invoices", label: "Invoices", icon: "invoices", route: "Invoices" }      
    ],
  },
  {
    id: "sales",
    label: "Sales",
    icon: "sales",
    route: "Sales",
    secondary: [],
  },
  {
    id: "reports",
    label: "Reports",
    icon: "reports",
    route: "Reports",
    secondary: [],
  },
  {
    id: "settings",
    label: "Settings",
    icon: "settings",
    route: "Settings",
    secondary: [],
  },
  {
    id: "logout",
    label: "Logout",
    icon: "logout",
    isLogout: true,
    secondary: [],
  }
];

const SidebarDrawer = ({ navigation }) => {
  const dispatch = useDispatch();
  const slideAnim = useRef(new Animated.Value(-width * 0.75)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  
  const [expandedMenus, setExpandedMenus] = useState({});
  const [activeItem, setActiveItem] = useState('home'); // Default active item should be home

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

  const handleMenuPress = (item, isSubmenu = false) => {
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
        dispatch(logout());
        navigation.navigate('Auth');
      } else if (item.secondary && item.secondary.length > 0 && !isSubmenu) {
        // Parent item with submenu - only expand/collapse
        setExpandedMenus(prev => {
          const newState = {};
          // If current submenu is open, close it; otherwise open it
          if (!prev[item.id]) {
            newState[item.id] = true;
          }
          return newState;
        });
      } else if (item.route) {
        // Item with route (either top-level without submenu or submenu item)
        setActiveItem(item.id);
        if (!isSubmenu) {
          // If it's a top-level item, close all submenus
          setExpandedMenus({});
        }
        navigation.navigate(item.route);
        navigation.closeDrawer();
      }
    });
  };

  const renderSubmenu = (submenuItems, parentId) => {
    const isExpanded = expandedMenus[parentId];
    const submenuHeight = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(submenuHeight, {
        toValue: isExpanded ? submenuItems.length * 56 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }, [isExpanded]);

    return (
      <Animated.View
        style={[
          styles.submenuContainer,
          {
            height: submenuHeight,
            opacity: isExpanded ? 1 : 0,
          }
        ]}
      >
        {submenuItems.map((subItem, index) => (
          <TouchableOpacity
            key={subItem.id}
            style={[
              styles.submenuItem,
              activeItem === subItem.id && styles.activeSubmenuItem,
            ]}
            onPress={() => handleMenuPress(subItem, true)}
            activeOpacity={0.7}
          >
            <View style={styles.submenuItemContent}>
              {(() => {
                const IconComponent = iconComponents[subItem.icon];
                if (IconComponent) {
                  return (<View style={styles.menuIconBox}><IconComponent color='#fff' /></View>);
                } else {
                  // Fallback to Ionicons if custom icon not available
                  return null
                }
              })()}
              <Text style={[
                styles.submenuItemText,
                activeItem === subItem.id && styles.activeSubmenuItemText,
              ]}>
                {subItem.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </Animated.View>
    );
  };

  const renderMenuItem = (item, index) => {
    const itemAnim = useRef(new Animated.Value(0)).current;
    const hasSubmenu = item.secondary && item.secondary.length > 0;
    const isExpanded = expandedMenus[item.id];
    
    // Determine if this item or any of its children are active
    let isActive = false;
    let isParentOfActive = false;
    
    if (hasSubmenu) {
      // For parent items, check if any child is active
      isParentOfActive = item.secondary.some(sub => sub.id === activeItem);
    } else {
      // For leaf items, check if this item is active
      isActive = activeItem === item.id;
    }
    
    useEffect(() => {
      Animated.timing(itemAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
      }).start();
    }, []);

    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(rotateAnim, {
        toValue: isExpanded ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, [isExpanded]);

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
            isActive && styles.activeMenuItem,
            isParentOfActive && styles.parentOfActiveMenuItem,
            item.isLogout && styles.logoutItem,
          ]}
          onPress={() => handleMenuPress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemContent}>
            {(() => {
              const IconComponent = iconComponents[item.icon];
              if (IconComponent) {
                return (<View style={styles.menuIconBox}><IconComponent color='#fff' /></View>);
              } else {
                // Fallback to Ionicons if custom icon not available
                return null
              }
            })()}
            <Text style={[
              styles.menuItemText,
              isActive && styles.activeMenuItemText,
              isParentOfActive && styles.parentOfActiveMenuItemText,
              item.isLogout && styles.logoutText,
            ]}>
              {item.label}
            </Text>
          </View>
          {hasSubmenu && (
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '180deg'],
                    }),
                  },
                ],
              }}
            >
              <ArrowDown />
            </Animated.View>
          )}
        </TouchableOpacity>
        
        {hasSubmenu && renderSubmenu(item.secondary, item.id)}
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
            <CloseCircle color='#fff' />
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
              <SunLogo width={36} />
            </View>
          </Animated.View>
          
          <Text style={styles.companyName}>Mahalxmi Distributors</Text>
          <View style={styles.phoneContainer}>
            <Phone color='#fff' />
            <Text style={styles.phoneText}>9080704010</Text>
          </View>
        </View>

        {/* Menu Items */}
        <ScrollView 
          style={styles.menuContainer}
          showsVerticalScrollIndicator={false}
        >
          {menuConfig.map((item, index) => renderMenuItem(item, index))}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#D4C5A7',
  },
  container: {
    flex: 1,
    backgroundColor: '#D4C5A7',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: '#D4C5A7',
    borderBottomWidth: 1,
    borderBottomColor: '#E0D0BD',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 60,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
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
    color: '#fff',
  },
  menuContainer: {
    flex: 1,
    paddingTop: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginHorizontal: 0
  },
  activeMenuItem: {
    backgroundColor: '#BDAE95',
  },
  parentOfActiveMenuItem: {
    backgroundColor: '#BDAE95',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconBox: {
    width: 26,
  },
  menuItemText: {
    marginLeft: 16,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  activeMenuItemText: {
    fontWeight: '600',
  },
  parentOfActiveMenuItemText: {
    fontWeight: '600',
  },
  submenuContainer: {
    overflow: 'hidden',
    backgroundColor: '#BDAE95',
    marginBottom: 4,
  },
  submenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    paddingLeft: 48,
    height: 56,
  },
  activeSubmenuItem: {
    backgroundColor: '#FFC067',
  },
  submenuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  submenuItemText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#fff',
    fontWeight: '400',
  },
  activeSubmenuItemText: {
    color: '#fff',
    fontWeight: '500',
  },
  logoutItem: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0D0BD',
    paddingTop: 24,
  },
  logoutText: {
    color: '#fff',
  },
});

export default SidebarDrawer;