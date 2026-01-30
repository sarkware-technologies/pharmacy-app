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
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../styles/colors';
import { logout } from '../redux/slices/authSlice';
import AppText from "./AppText"

// Import your custom icons
import CloseCircle from './icons/CloseCircle';
import SunLogo from './icons/SunLogo';
import SunLogoNew from "./icons/SunLogoNew"
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
import MyProfile from "./icons/menu/myProfile"
import ArrowUp from './icons/ArrowUp';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';
import CustomModal from './view/customModal';
import AppView from './AppView';
import { CloseIcon } from './icons/pricingIcon';

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
  myProfile: MyProfile
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
      { id: "products", label: "Products", icon: "products", route: "ProductList" },
      { id: "distributors", label: "Distributors", icon: "distributors", route: "DistributorList" },
      { id: "chargeback", label: "Chargeback", icon: "chargeback", route: "Chargeback" },
      { id: "netrate", label: "Net Rate", icon: "netrate", route: "NetRate" },
      { id: "divisions", label: "Divisions", icon: "divisions", route: "DivisionList" },
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
    id: "MyProfile",
    label: "My Profile",
    icon: "myProfile",
    route: "myProfile",
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

  const [myProfileDetails, setMyProfileDetails] = useState(false);


  const loggedInUser = useSelector(state => state?.auth?.user);

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
    const active = activeItem;
    // const bounceAnim = new Animated.Value(1);

    // Animated.sequence([
    //   Animated.timing(bounceAnim, {
    //     toValue: 0.95,
    //     duration: 100,
    //     useNativeDriver: true,
    //   }),
    //   Animated.spring(bounceAnim, {
    //     toValue: 1,
    //     friction: 3,
    //     tension: 40,
    //     useNativeDriver: true,
    //   }),
    // ]).start(() => {
    if (item.isLogout) {
      // Handle logout
      dispatch(logout());
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

      // Close drawer first
      navigation.closeDrawer();

      // Navigate after a small delay to ensure drawer closes smoothly
      setTimeout(() => {

        // Check the route and navigate accordingly
        switch (item.route) {
          // Tab routes - navigate to the tab
          case 'Home':
            navigation.navigate('Home');
            break;
          case 'Customers':
            navigation.navigate('Customers');
            break;
          case 'Orders':
            navigation.navigate('Orders');
            break;
          case 'Pricing':
            navigation.navigate('Pricing');
            break;

          // Product routes - navigate to ProductStack
          case 'myProfile':
            // First navigate to DynamicTab with params
            setActiveItem(active)
            setMyProfileDetails(true)
            break;


          // Product routes - navigate to ProductStack
          case 'ProductList':
            // First navigate to DynamicTab with params
            navigation.navigate('MainTabs', {
              screen: 'DynamicTab',
              params: { screen: 'ProductList' }
            });
            break;

          // Distributor routes - navigate to DistributorStack  
          case 'DistributorList':
            // First navigate to DynamicTab with params
            navigation.navigate('MainTabs', {
              screen: 'DynamicTab',
              params: { screen: 'DistributorList' }
            });
            break;

          // Division routes - navigate to DivisionStack
          case 'DivisionList':
            // First navigate to DynamicTab with params
            navigation.navigate('MainTabs', {
              screen: 'DynamicTab',
              params: { screen: 'DivisionList' }
            });
            break;

          // Chargeback routes - navigate to ChargebackStack
          case 'Chargeback':
            // First navigate to DynamicTab with params
            navigation.navigate('MainTabs', {
              screen: 'DynamicTab',
              params: { screen: 'ChargebackListing' }
            });
            break;

          // Chargeback routes - navigate to ChargebackStack
          case 'NetRate':
            // First navigate to DynamicTab with params
            navigation.navigate('MainTabs', {
              screen: 'DynamicTab',
              params: { screen: 'NetRateListing' }
            });
            break;

          // Other routes without bottom tabs
          case 'RegistrationType':
          case 'Sales':
          case 'Reports':
          case 'Settings':
          case 'Field':
          case 'Invoices':
            navigation.navigate(item.route);
            break;

          default:
            navigation.navigate(item.route);
            break;
        }
      }, 300);
    }
    // });
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
              <AppText style={[
                styles.submenuItemText,
                activeItem === subItem.id && styles.activeSubmenuItemText,
              ]}>
                {subItem.label}
              </AppText>
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
            <AppText style={[
              styles.menuItemText,
              isActive && styles.activeMenuItemText,
              isParentOfActive && styles.parentOfActiveMenuItemText,
              item.isLogout && styles.logoutText,
            ]}>
              {item.label}
            </AppText>
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

  const stationCode = loggedInUser?.userDetails?.stationCode ?? loggedInUser?.userDetails?.stationCodes;


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
              <SunLogoNew width={60} />
              {/* <SunLogo width={36} /> */}
            </View>
          </Animated.View>

          <AppText style={styles.companyName}>{loggedInUser?.name}</AppText>
          <View style={styles.phoneContainer}>
            <Svg width="11" height="15" viewBox="0 0 11 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <Path d="M8.625 0.5H2.375C1.33947 0.5 0.5 1.35473 0.5 2.40909V12.5909C0.5 13.6453 1.33947 14.5 2.375 14.5H8.625C9.66053 14.5 10.5 13.6453 10.5 12.5909V2.40909C10.5 1.35473 9.66053 0.5 8.625 0.5Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M4.5 11.5H6.5" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <AppText style={styles.phoneText}>+91{loggedInUser?.mobile}</AppText>
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

      <CustomModal
        minHeight={"100%"}
        maxHeight='100%'
        onClose={() => setMyProfileDetails(false)}
        visible={myProfileDetails}
        title={"Discount %"}
        headerStyle={{ borderBottomWidth: 0 }}
        customHeader={
          <AppView style={{ marginTop: 50 }}>
            <StatusBar backgroundColor="#F5E6D3" barStyle="dark-content" />
            <AppView flexDirection={"row"} alignItems={"center"} paddingHorizontal={20} gap={20}>
              <TouchableOpacity hitSlop={10} onPress={() => setMyProfileDetails(false)}>
                <CloseIcon />
              </TouchableOpacity>
              <AppText fontSize={24}>My Profile</AppText>
            </AppView>
          </AppView>
        }
        footer={
          <AppView marginBottom={50} justifyContent={"center"} flexDirection={"row"}>
            <TouchableOpacity onPress={() => dispatch(logout())} >
              <AppView flexDirection={"row"} gap={5}>
                <AppText>
                  <LogoutIcon color="#E84141" />
                </AppText>
                <AppText fontSize={18} color='#E84141'>Logout</AppText>
              </AppView>
            </TouchableOpacity>
          </AppView>
        }
        footerStyle={{ borderTopWidth: 0, paddingHorizontal: 20 }}
        body={
          <AppView>
            <AppView backgroundColor={"#FFF4E8"} paddingHorizontal={23} gap={10} paddingVertical={20} borderRadius={16} marginTop={10}>
              <AppText fontSize={24}>{loggedInUser?.name}</AppText>
              <AppView>
                <AppView flexDirection={"row"} gap={5}>
                  <Svg width="11" height="15" viewBox="0 0 11 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <Path d="M8.625 0.5H2.375C1.33947 0.5 0.5 1.35473 0.5 2.40909V12.5909C0.5 13.6453 1.33947 14.5 2.375 14.5H8.625C9.66053 14.5 10.5 13.6453 10.5 12.5909V2.40909C10.5 1.35473 9.66053 0.5 8.625 0.5Z" stroke="#909090" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M4.5 11.5H6.5" stroke="#909090" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                  <AppText fontSize={14} color='#909090' >Mobile</AppText>
                </AppView>
                <AppText marginTop={5} fontSize={16}>+91 {loggedInUser?.mobile}</AppText>
              </AppView>
            </AppView>
            <AppView marginTop={28}>
              <AppText fontSize={20} fontWeight={600} color='#2B2B2B'>
                Other Details
              </AppText>

              <AppView marginTop={15} borderColor={"#EDEDED"} borderWidth={1} paddingHorizontal={23} paddingVertical={20} borderRadius={16}>
                <AppView>
                  <AppView flexDirection={"row"} gap={6} alignItems={"center"}>
                    <Svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <G clipPath="url(#clip0_8141_2646)">
                        <Path d="M10.6673 4.0026C10.6673 2.74527 10.6673 2.11727 10.2767 1.7266C9.88598 1.33594 9.25798 1.33594 8.00065 1.33594C6.74332 1.33594 6.11532 1.33594 5.72465 1.7266C5.33398 2.11727 5.33398 2.74527 5.33398 4.0026M1.33398 9.33594C1.33398 6.82194 1.33398 5.5646 2.11532 4.78394C2.89665 4.00327 4.15332 4.0026 6.66732 4.0026H9.33398C11.848 4.0026 13.1053 4.0026 13.886 4.78394C14.6666 5.56527 14.6673 6.82194 14.6673 9.33594C14.6673 11.8499 14.6673 13.1073 13.886 13.8879C13.1046 14.6686 11.848 14.6693 9.33398 14.6693H6.66732C4.15332 14.6693 2.89598 14.6693 2.11532 13.8879C1.33465 13.1066 1.33398 11.8499 1.33398 9.33594Z" stroke="#909090" />
                        <Path d="M11.3346 6.0026C11.3346 6.17942 11.2644 6.34898 11.1394 6.47401C11.0143 6.59903 10.8448 6.66927 10.668 6.66927C10.4912 6.66927 10.3216 6.59903 10.1966 6.47401C10.0715 6.34898 10.0013 6.17942 10.0013 6.0026C10.0013 5.82579 10.0715 5.65622 10.1966 5.5312C10.3216 5.40618 10.4912 5.33594 10.668 5.33594C10.8448 5.33594 11.0143 5.40618 11.1394 5.5312C11.2644 5.65622 11.3346 5.82579 11.3346 6.0026ZM6.0013 6.0026C6.0013 6.17942 5.93106 6.34898 5.80604 6.47401C5.68102 6.59903 5.51145 6.66927 5.33464 6.66927C5.15782 6.66927 4.98826 6.59903 4.86323 6.47401C4.73821 6.34898 4.66797 6.17942 4.66797 6.0026C4.66797 5.82579 4.73821 5.65622 4.86323 5.5312C4.98826 5.40618 5.15782 5.33594 5.33464 5.33594C5.51145 5.33594 5.68102 5.40618 5.80604 5.5312C5.93106 5.65622 6.0013 5.82579 6.0013 6.0026Z" fill="#909090" />
                      </G>
                      <Defs>
                        <ClipPath id="clip0_8141_2646">
                          <Rect width="16" height="16" fill="white" />
                        </ClipPath>
                      </Defs>
                    </Svg>
                    <AppText color='#909090'>Designation</AppText>
                  </AppView>
                  <AppText marginTop={5} fontSize={16} marginLeft={22}>{loggedInUser?.subRoleName}</AppText>
                </AppView>
                <AppView flexDirection={"row"} justifyContent={"space-between"} alignItems={"center"} marginTop={20}>
                  <AppView width={"65%"}>
                    <AppView flexDirection={"row"} gap={6} alignItems={"center"}>
                      <Svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <Path d="M2.04629 2.00895C3.03983 1.03528 4.37749 0.493042 5.76857 0.500067C7.15966 0.507093 8.49177 1.06282 9.47543 2.04648C10.4591 3.03014 11.0148 4.36225 11.0218 5.75333C11.0289 7.14442 10.4866 8.48208 9.51295 9.47562L6.72229 12.2663C6.47225 12.5162 6.13317 12.6567 5.77962 12.6567C5.42607 12.6567 5.08699 12.5162 4.83695 12.2663L2.04629 9.47562C1.05621 8.48544 0.5 7.14254 0.5 5.74229C0.5 4.34204 1.05621 2.99913 2.04629 2.00895Z" stroke="#909090" strokeLinejoin="round" />
                        <Path d="M5.7793 7.74219C6.88387 7.74219 7.7793 6.84676 7.7793 5.74219C7.7793 4.63762 6.88387 3.74219 5.7793 3.74219C4.67473 3.74219 3.7793 4.63762 3.7793 5.74219C3.7793 6.84676 4.67473 7.74219 5.7793 7.74219Z" stroke="#909090" strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                      <AppText color='#909090'>State</AppText>
                    </AppView>
                    <AppText marginTop={5} fontSize={16} marginLeft={22}>{loggedInUser?.userDetails?.stateName?.[0]}</AppText>
                  </AppView>
                  <AppView width={"35%"}>
                    <AppView flexDirection={"row"} gap={6} alignItems={"center"}>
                      <Svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <Path d="M8.50065 4.5H5.83398C4.17932 4.5 3.83398 4.84533 3.83398 6.5V13.8333H10.5007V6.5C10.5007 4.84533 10.1553 4.5 8.50065 4.5Z" stroke="#909090" strokeLinejoin="round" />
                        <Path d="M6.5 7.1666H7.83333M6.5 9.1666H7.83333M6.5 11.1666H7.83333M13.1667 13.8333V4.62393C13.1667 3.8046 13.1667 3.39526 12.9673 3.0666C12.7687 2.73726 12.41 2.55393 11.6927 2.18793L8.798 0.709932C8.02467 0.315265 7.83333 0.454598 7.83333 1.31993V4.3026M1.16667 13.8333V7.83326C1.16667 7.28193 1.282 7.1666 1.83333 7.1666H3.83333M13.8333 13.8333H0.5" stroke="#909090" strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>

                      <AppText color='#909090'>City</AppText>
                    </AppView>
                    <AppText marginTop={5} fontSize={16} marginLeft={22}>{loggedInUser?.userDetails?.cityName?.[0]}</AppText>
                  </AppView>
                </AppView>
                <AppView marginTop={20}>
                  <AppView flexDirection={"row"} gap={6} alignItems={"center"}>
                    <Svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                    </Svg>
                    <AppText color='#909090'>Station Code</AppText>
                  </AppView>
                  {Array.isArray(stationCode) ? (
                    stationCode.map((e, i) => (
                      <AppText key={`${i}-${e}`} marginTop={5} fontSize={16} marginLeft={22}>
                        {e}
                      </AppText>
                    ))
                  ) : (
                    <AppText marginTop={5} fontSize={16} marginLeft={22}>
                      {stationCode}
                    </AppText>
                  )}
                </AppView>
                <AppView marginTop={20}>
                  <AppView flexDirection={"row"} gap={6} alignItems={"center"}>
                    <Svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <Path d="M13.3327 14.6719V11.3385C13.3327 10.0819 13.3327 9.45321 12.942 9.06254C12.5513 8.67188 11.9233 8.67188 10.666 8.67188L7.99935 14.6719L5.33268 8.67188C4.07535 8.67188 3.44735 8.67188 3.05668 9.06254C2.66602 9.45321 2.66602 10.0819 2.66602 11.3385V14.6719" stroke="#909090" strokeLinecap="round" strokeLinejoin="round" />
                      <Path d="M7.99935 10.0026L7.66602 12.6693L7.99935 13.6693L8.33268 12.6693L7.99935 10.0026ZM7.99935 10.0026L7.33268 8.66927H8.66602L7.99935 10.0026ZM10.3327 4.33594V3.66927C10.3327 3.05043 10.0868 2.45694 9.64926 2.01935C9.21168 1.58177 8.61819 1.33594 7.99935 1.33594C7.38051 1.33594 6.78702 1.58177 6.34943 2.01935C5.91185 2.45694 5.66602 3.05043 5.66602 3.66927V4.33594C5.66602 4.64236 5.72637 4.94577 5.84363 5.22887C5.96089 5.51196 6.13276 5.76918 6.34943 5.98585C6.5661 6.20252 6.82333 6.3744 7.10642 6.49166C7.38951 6.60892 7.69293 6.66927 7.99935 6.66927C8.30577 6.66927 8.60918 6.60892 8.89228 6.49166C9.17537 6.3744 9.43259 6.20252 9.64926 5.98585C9.86593 5.76918 10.0378 5.51196 10.1551 5.22887C10.2723 4.94577 10.3327 4.64236 10.3327 4.33594Z" stroke="#909090" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>

                    <AppText color='#909090'>Reports to</AppText>
                  </AppView>
                  <AppText marginTop={5} fontSize={16} marginLeft={22}>{loggedInUser?.userDetails?.reportToName}</AppText>
                </AppView>
              </AppView>
            </AppView>
            <AppView marginTop={28}>
              <AppText fontSize={20} fontWeight={600} color='#2B2B2B'>
                Division
              </AppText>
              <AppView gap={10} marginTop={15} borderColor={"#EDEDED"} borderWidth={1} paddingHorizontal={23} paddingVertical={20} borderRadius={16}>
                {loggedInUser?.userDetails?.divisionNames?.map((e, i) => <AppText key={i + e} fontSize={16}>{e}</AppText>)}
              </AppView>
            </AppView>
          </AppView>
        }
      />

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
    // marginBottom: 16,
  },
  logo: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    overflow: "hidden"
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