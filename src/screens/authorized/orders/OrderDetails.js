import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { AppText, AppInput } from "../../../components"
import { colors } from '../../../styles/colors';
import { Fonts } from '../../../utils/fontHelper';
import Animated from 'react-native-reanimated';
import CustomCheckbox from '../../../components/view/checkbox';
import AddToCartWidget from "../../../components/addToCart"
import BackButton from "../../../components/view/backButton"
import { OrderDetails } from '../../../api/orders';
import { useNavigation, useRoute } from '@react-navigation/native';
import DropdownModal from "./../../../components/view/dropdownModel"

const ClockIcon = () => (
  <Svg width="23" height="20" viewBox="0 0 23 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <Path d="M5.32617 3.10938C9.31212 -0.703001 15.7798 -0.70318 19.7656 3.10938C23.7451 6.91599 23.7451 13.084 19.7656 16.8906C15.7798 20.7032 9.31212 20.703 5.32617 16.8906C5.17821 16.7491 5.09671 16.5594 5.09668 16.3643C5.09668 16.1691 5.17721 15.9785 5.3252 15.8369C5.47355 15.6954 5.67752 15.6152 5.8916 15.6152C6.10544 15.6152 6.30873 15.6957 6.45703 15.8369V15.8379C7.83397 17.1551 9.63536 17.9859 11.5664 18.1973C13.4976 18.4086 15.4476 17.9879 17.0986 17.0029C18.7497 16.0179 20.0056 14.5259 20.6592 12.7676C21.3128 11.009 21.3246 9.09001 20.6924 7.32422C20.0602 5.55869 18.8227 4.05218 17.1836 3.04883C15.5446 2.04558 13.5996 1.60311 11.666 1.79297C9.73242 1.98285 7.92117 2.79383 6.52832 4.0957C5.13525 5.39779 4.24315 7.11526 3.99902 8.96777L3.96094 9.25H5.22754C5.38726 9.24992 5.54263 9.29517 5.67383 9.37891C5.80495 9.46261 5.90497 9.58097 5.96387 9.7168C6.02257 9.8523 6.0384 10.0005 6.00879 10.1436C5.98644 10.2512 5.93901 10.3535 5.87012 10.4424L5.79492 10.5264L3.7041 12.5254L3.70312 12.5264C3.63017 12.5967 3.54235 12.6526 3.44531 12.6914C3.34822 12.7302 3.24354 12.7508 3.1377 12.751C3.03193 12.7512 2.92729 12.7318 2.83008 12.6934C2.73287 12.655 2.64555 12.5984 2.57227 12.5283L2.57031 12.5264L0.478516 10.5264C0.368286 10.4208 0.294466 10.2876 0.264648 10.1445C0.234891 10.0014 0.249939 9.85239 0.308594 9.7168C0.367399 9.58099 0.46859 9.46267 0.599609 9.37891C0.730538 9.29532 0.885518 9.25011 1.04492 9.25H2.36719L2.39062 9.02539C2.62256 6.78986 3.65867 4.69829 5.3252 3.10938H5.32617ZM11.5 5.25C11.7145 5.25 11.918 5.33167 12.0664 5.47363C12.2144 5.61523 12.2959 5.80478 12.2959 6V10.25H16.7275C16.942 10.25 17.1456 10.3317 17.2939 10.4736C17.4419 10.6152 17.5225 10.8048 17.5225 11C17.5225 11.1952 17.4419 11.3848 17.2939 11.5264C17.1456 11.6683 16.942 11.75 16.7275 11.75H11.5C11.2855 11.75 11.082 11.6683 10.9336 11.5264C10.7856 11.3848 10.7041 11.1952 10.7041 11V6C10.7041 5.80479 10.7856 5.61523 10.9336 5.47363C11.082 5.33167 11.2855 5.25001 11.5 5.25Z" fill="#2B2B2B" stroke="white" stroke-width="0.5" />
  </Svg>

);

const DownloadIcon = () => (
  <Svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <Path d="M0.75 12.254V13.25C0.75 14.0456 1.06607 14.8087 1.62868 15.3713C2.19129 15.9339 2.95435 16.25 3.75 16.25H13.75C14.5456 16.25 15.3087 15.9339 15.8713 15.3713C16.4339 14.8087 16.75 14.0456 16.75 13.25V12.25M8.75 0.75V11.75M8.75 11.75L12.25 8.25M8.75 11.75L5.25 8.25" stroke="#2B2B2B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  </Svg>

);

const ChevronUp = () => (
  <Svg width="20" height="29" viewBox="0 0 24 24" fill="none">
    <Path d="M18 15L12 9L6 15" stroke="#2B2B2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ChevronDown = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M6 9L12 15L18 9" stroke="#2B2B2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SearchIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <Circle cx="9" cy="9" r="6" stroke="#999" strokeWidth="1.5" />
    <Path d="M13.5 13.5L17 17" stroke="#999" strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

const EyeIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <Path d="M1 10C1 10 4 4 10 4C16 4 19 10 19 10C19 10 16 16 10 16C4 16 1 10 1 10Z" stroke="#FF8C00" strokeWidth="1.5" />
    <Circle cx="10" cy="10" r="3" stroke="#FF8C00" strokeWidth="1.5" />
  </Svg>
);

const CommentIcon = () => (
  <Svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <Path d="M9.5 0.5V1.83333M6.16667 0.5V1.83333M2.83333 0.5V1.83333M11.8333 5.83333C11.8333 3.63333 11.8333 2.53333 11.15 1.85C10.4667 1.16667 9.36667 1.16667 7.16667 1.16667H5.16667C2.96667 1.16667 1.86667 1.16667 1.18333 1.85C0.5 2.53333 0.5 3.63333 0.5 5.83333V9.16667C0.5 11.3667 0.5 12.4667 1.18333 13.15C1.86667 13.8333 2.96667 13.8333 5.16667 13.8333H7.16667M10.5 8.5V13.8333M13.1667 11.1667H7.83333M3.5 9.16667H6.16667M3.5 5.83333H8.83333" stroke="#2B2B2B" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>

);

const HistoryIcon = () => (
  <Svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <Path d="M6.40257 0.53908C6.41867 0.697356 6.37124 0.855544 6.27073 0.978861C6.17022 1.10218 6.02484 1.18053 5.86657 1.19668C4.88836 1.29841 3.95899 1.67522 3.18613 2.28345C2.41327 2.89167 1.82855 3.70642 1.49972 4.63331C1.17088 5.5602 1.11139 6.56128 1.32813 7.52059C1.54487 8.4799 2.02898 9.35817 2.72436 10.0537C3.41974 10.7491 4.29795 11.2334 5.25723 11.4502C6.2165 11.6671 7.2176 11.6078 8.14453 11.2791C9.07146 10.9503 9.8863 10.3657 10.4946 9.59297C11.103 8.8202 11.4799 7.89088 11.5818 6.91268C11.5887 6.83341 11.6113 6.75631 11.6483 6.68586C11.6852 6.61542 11.7359 6.55303 11.7972 6.50233C11.8585 6.45163 11.9293 6.41363 12.0054 6.39055C12.0816 6.36747 12.1616 6.35976 12.2407 6.36788C12.3199 6.37599 12.3966 6.39977 12.4665 6.43783C12.5364 6.47588 12.598 6.52746 12.6477 6.58955C12.6975 6.65164 12.7344 6.723 12.7563 6.79949C12.7782 6.87598 12.7847 6.95606 12.7754 7.03508C12.6504 8.23906 12.1868 9.38297 11.4383 10.3343C10.6898 11.2855 9.68709 12.0052 8.54631 12.41C7.40553 12.8147 6.17342 12.8879 4.99276 12.621C3.81209 12.3541 2.73123 11.7582 1.87541 10.9022C1.01959 10.0462 0.423867 8.96515 0.157273 7.78442C-0.109321 6.6037 -0.0358698 5.3716 0.369115 4.23092C0.774099 3.09023 1.49404 2.08766 2.44549 1.33939C3.39695 0.591116 4.54097 0.127782 5.74497 0.00308029C5.90325 -0.0130147 6.06144 0.0344087 6.18475 0.134923C6.30807 0.235436 6.38642 0.380811 6.40257 0.53908ZM7.21857 0.48628C7.23689 0.409552 7.27016 0.337189 7.31648 0.273333C7.3628 0.209477 7.42125 0.155382 7.4885 0.114142C7.55575 0.072902 7.63046 0.0453277 7.70838 0.0329969C7.78629 0.020666 7.86588 0.0238206 7.94257 0.0422803C8.24551 0.114814 8.53964 0.208147 8.82497 0.32228C8.96873 0.383942 9.08272 0.499307 9.14266 0.643792C9.2026 0.788277 9.20374 0.950457 9.14585 1.09577C9.08795 1.24109 8.97559 1.35805 8.83272 1.42173C8.68984 1.48541 8.52775 1.49077 8.38097 1.43668C8.14897 1.34441 7.90951 1.26868 7.66257 1.20948C7.50793 1.17229 7.37438 1.07523 7.29127 0.93962C7.20817 0.80401 7.18151 0.640951 7.21857 0.48628ZM12.457 3.95268C12.3981 3.8048 12.2829 3.68636 12.1367 3.62342C11.9905 3.56048 11.8253 3.5582 11.6774 3.61708C11.5295 3.67596 11.411 3.79117 11.3481 3.93738C11.2852 4.08358 11.2829 4.2488 11.3418 4.39668C11.434 4.62921 11.51 4.86868 11.5698 5.11508C11.6069 5.26986 11.704 5.40355 11.8397 5.48674C11.9069 5.52793 11.9815 5.55549 12.0594 5.56783C12.1372 5.58018 12.2167 5.57706 12.2934 5.55868C12.37 5.5403 12.4423 5.50699 12.506 5.46068C12.5698 5.41437 12.6238 5.35595 12.665 5.28875C12.7062 5.22156 12.7338 5.14691 12.7461 5.06907C12.7585 4.99123 12.7554 4.91172 12.737 4.83508C12.6651 4.53457 12.5715 4.23967 12.457 3.95268ZM9.83697 1.51428C9.94148 1.39432 10.0894 1.32077 10.2481 1.30982C10.4068 1.29887 10.5634 1.35141 10.6834 1.45588C10.9292 1.66975 11.158 1.90095 11.3698 2.14948C11.4729 2.27074 11.5236 2.42799 11.5108 2.58665C11.498 2.7453 11.4226 2.89236 11.3014 2.99548C11.1801 3.0986 11.0229 3.14932 10.8642 3.13649C10.7056 3.12367 10.5585 3.04834 10.4554 2.92708C10.2824 2.72523 10.0952 2.53595 9.89537 2.36068C9.77541 2.25617 9.70186 2.1083 9.69091 1.94957C9.67996 1.79085 9.7325 1.63427 9.83697 1.51428ZM6.40497 2.97348C6.40497 2.81435 6.34176 2.66174 6.22924 2.54922C6.11671 2.43669 5.9641 2.37348 5.80497 2.37348C5.64584 2.37348 5.49323 2.43669 5.38071 2.54922C5.26819 2.66174 5.20497 2.81435 5.20497 2.97348V6.97348C5.20497 7.30548 5.47377 7.57348 5.80497 7.57348H8.20497C8.3641 7.57348 8.51671 7.51027 8.62924 7.39774C8.74176 7.28522 8.80497 7.13261 8.80497 6.97348C8.80497 6.81435 8.74176 6.66174 8.62924 6.54922C8.51671 6.43669 8.3641 6.37348 8.20497 6.37348H6.40497V2.97348Z" fill="#E2C051" />
  </Svg>

);

const HoldIcon = () => (
  <Svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <Path d="M3.25 0.75H2.41667C1.49619 0.75 0.75 1.49619 0.75 2.41667V12.8333C0.75 13.7538 1.49619 14.5 2.41667 14.5H3.25C4.17047 14.5 4.91667 13.7538 4.91667 12.8333V2.41667C4.91667 1.49619 4.17047 0.75 3.25 0.75Z" stroke="#777777" strokeWidth="1.5" strokeLinejoin="round" />
    <Path d="M10.75 0.75H9.91667C8.99619 0.75 8.25 1.49619 8.25 2.41667V12.8333C8.25 13.7538 8.99619 14.5 9.91667 14.5H10.75C11.6705 14.5 12.4167 13.7538 12.4167 12.8333V2.41667C12.4167 1.49619 11.6705 0.75 10.75 0.75Z" stroke="#777777" strokeWidth="1.5" strokeLinejoin="round" />
  </Svg>

);


const OrderDetailsScreen = () => {
  const route = useRoute()
  const [headerExpanded, setHeaderExpanded] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');


  const { orderId } = route.params || {};

  const [isLoading, setIsLoading] = useState(false);
  const [productList, setProductList] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [orderDetails, setOrderDetails] = useState();
  const [selectedDivision, setSelectedDivision] = useState({key:"All",value:"All Div"});
  const [showSelectDivisiton, setShowSelectDivisiton] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId])
  const fetchOrder = async () => {
    const response = await OrderDetails(orderId);
    if (response.orderData) {
      setOrderDetails(response.orderData);
      setProductList(response.orderData?.products);
      setDivisions(response.orderData?.distributorDetails?.[0]?.divisions || []);
    }
    console.log(response, 384975398)
  }

  const orderData = {
    orderNumber: 'SUNPH-10286',
    status: 'SUBMITTED',
    poNumber: 'PO_No_123',
    amount: '6,345.33',
    skus: 48,
    date: '14/01/2025 18:37:41',
    type: 'Net Rate',
    orderedBy: 'A A PHARMACEUTICALS',
    cfaName: 'SunPharma Limited',
    savings: '1,15,000',
    grossOrderValue: '1,15,000',
    tax: '36.15',
    invoiceItems: '0 of 3',
    invoiceValue: '0',
    supplyType: 'Net Rate',
    rateContractHolder: 'Columbia Asia',
    rateContractId: '10106555',
    rateContractLocation: 'Pune',
  };





  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton}>
            <BackButton />
          </TouchableOpacity>
          <AppText style={styles.orderNumber}>{orderDetails?.orderNo}</AppText>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton}>
              <ClockIcon />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <DownloadIcon />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.statusBadge}>
          <AppText style={[styles.statusText]}>{orderDetails?.statusName}</AppText>
        </View>

      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.orderSummary}>
          <View style={{ backgroundColor: '#FFF', paddingVertical: 16, paddingHorizontal: 12, paddingBottom: 20, borderRadius: 12 }}>
            <View style={styles.summaryRow}>
              <View>
                <AppText style={styles.poNumber}>{orderData.poNumber ?? '-'}</AppText>
                <AppText style={styles.dateText}>{orderDetails?.orderDate} | {orderData.orderType ?? '-'}</AppText>
              </View>
              <View style={styles.amountSection}>
                <AppText style={styles.amount}>₹ {orderDetails?.totalPrice}</AppText>
                <AppText style={styles.skuCount}>SKU's: {orderDetails?.skwCount ?? '-'}</AppText>
              </View>
            </View>

            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <AppText style={styles.detailLabel}>Ordered by</AppText>
                <AppText style={[styles.detailValue, styles.underlinedText]}>{orderDetails?.orderedBy ?? '-'}</AppText>
              </View>
              <View style={[styles.detailItem, styles.alignRight]}>
                <AppText style={styles.detailLabel}>CFA Name</AppText>
                <TouchableOpacity onPress={() => setHeaderExpanded(!headerExpanded)}>
                  <View style={styles.expandableValue}>
                    <AppText style={[styles.detailValue, styles.underlinedText]}>{orderDetails?.cfaName ?? '-'}</AppText>
                    {!headerExpanded && (
                      <Animated.View style={{ transform: [{ rotate: headerExpanded ? "180deg" : "0deg" }] }}>
                        <ChevronDown />
                      </Animated.View>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {headerExpanded && (
              <View style={styles.expandedContent}>
                <View style={styles.expandedRow}>
                  <View style={styles.expandedItem}>
                    <AppText style={styles.expandedLabel}>(-) Savings</AppText>
                    <AppText style={styles.expandedLabel}>Trade</AppText>
                  </View>
                  <View style={styles.expandedItem}>
                    <AppText style={styles.expandedLabel}>(=) Gross Order Value</AppText>
                    <AppText style={styles.expandedValue}>{orderDetails.orderValue ? `₹${orderDetails.orderValue}` : '-'}</AppText>
                  </View>
                  <View style={styles.expandedItem}>
                    <AppText style={[styles.expandedLabel, { textAlign: "right" }]}>(+) Tax</AppText>
                    <AppText style={[styles.expandedValue, { textAlign: "right" }]}> {orderDetails.tax ? `₹${orderDetails.tax}` : "-"}</AppText>
                  </View>
                </View>

                <View style={styles.expandedRow}>
                  <View style={styles.expandedItem}>
                    <AppText style={styles.expandedLabel}>Invoice Items</AppText>
                    <AppText style={styles.expandedValue}>{orderDetails.invoicedItem ?? '-'}</AppText>
                  </View>
                  <View style={styles.expandedItem}>
                    <AppText style={styles.expandedLabel}>Invoice Value</AppText>
                    <AppText style={styles.expandedValue}> {orderDetails?.invoicedValue ? `₹${orderDetails?.invoicedValue}` : "-"}</AppText>
                  </View>
                  <View style={styles.expandedItem}>
                    <AppText style={[styles.expandedLabel, { textAlign: "right" }]}>Supply Type</AppText>
                    <AppText style={[styles.expandedValue, { textAlign: "right" }]}>{orderDetails.supplyType ?? '-'}</AppText>
                  </View>
                </View>
                <View style={{ display: "flex", flexDirection: 'row', justifyContent: "space-between", alignItems: "flex-end" }}>
                  <View style={styles.contractHolder}>
                    <AppText style={styles.expandedLabel}>Rate Contract Holder</AppText>
                    <AppText style={styles.contractName}>{orderDetails?.rateContractHolder ?? '-'}</AppText>
                    <AppText style={styles.contractDetails}>{orderDetails?.rateContractId ?? '-'} | {orderDetails?.rateContractLocation ?? '-'}</AppText>
                  </View>
                  <TouchableOpacity onPress={() => setHeaderExpanded(!headerExpanded)}>
                    {headerExpanded && (
                      <Animated.View style={{ transform: [{ rotate: headerExpanded ? "180deg" : "0deg" }] }}>
                        <ChevronDown />
                      </Animated.View>
                    )}
                  </TouchableOpacity>
                </View>

              </View>
            )}
          </View>
        </View>


        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchIcon />
          <AppInput
            style={styles.searchInput}
            placeholder="Search & Add products to cart"
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Tabs */}
        <View style={{ padding: 14, paddingVertical: 10, paddingBottom: 0 }}>
          <View style={{ padding: 0, backgroundColor: "#ffffff", borderRadius: 12, overflow: "hidden", marginBottom: 80 }}>
            <View style={styles.tabContainer}>
              <View style={styles.tabs}>
                <TouchableOpacity onPress={() => setSelectedTab('all')} style={styles.tabButton}>
                  <AppText style={[styles.tabText, selectedTab === 'all' && styles.activeTab]}>All</AppText>
                  {selectedTab === 'all' && <View style={styles.tabIndicator} />}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedTab('multi')} style={styles.tabButton}>
                  <AppText style={[styles.tabText, selectedTab === 'multi' && styles.activeTab]}>Multi-Mapped</AppText>
                  {selectedTab === 'multi' && <View style={styles.tabIndicator} />}
                </TouchableOpacity>
              </View>
              <View style={styles.tabActions}>
                <TouchableOpacity style={styles.searchIconButton}>
                  <SearchIcon />
                </TouchableOpacity>
                <TouchableOpacity style={styles.divDropdown} onPress={() => setShowSelectDivisiton(true)}>
                  <AppText style={styles.divDropdownText}>
                    {selectedDivision?.value}
                    </AppText>
                  <Svg width="7" height="4" viewBox="0 0 7 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <Path d="M6.08684 0C6.53229 0 6.75537 0.538571 6.44039 0.853553L3.6475 3.64645C3.45224 3.84171 3.13565 3.84171 2.94039 3.64645L0.147498 0.853552C-0.167485 0.53857 0.0555997 0 0.501052 0H6.08684Z" fill="#2B2B2B" />
                  </Svg>
                </TouchableOpacity>
                <TouchableOpacity style={{ backgroundColor: "#fef4e8", padding: 5, borderRadius: 6 }}>
                  <Svg width="15" height="11" viewBox="0 0 15 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <Path d="M13.6293 4.62961C13.832 4.91361 13.9333 5.05628 13.9333 5.26628C13.9333 5.47694 13.832 5.61894 13.6293 5.90294C12.7186 7.18028 10.3926 9.93294 7.26664 9.93294C4.13998 9.93294 1.81464 7.17961 0.903976 5.90294C0.701309 5.61894 0.599976 5.47628 0.599976 5.26628C0.599976 5.05561 0.701309 4.91361 0.903976 4.62961C1.81464 3.35228 4.14064 0.599609 7.26664 0.599609C10.3933 0.599609 12.7186 3.35294 13.6293 4.62961Z" stroke="#F7941E" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M9.2666 5.2666C9.2666 4.73617 9.05589 4.22746 8.68082 3.85239C8.30574 3.47731 7.79703 3.2666 7.2666 3.2666C6.73617 3.2666 6.22746 3.47731 5.85239 3.85239C5.47731 4.22746 5.2666 4.73617 5.2666 5.2666C5.2666 5.79703 5.47731 6.30574 5.85239 6.68082C6.22746 7.05589 6.73617 7.2666 7.2666 7.2666C7.79703 7.2666 8.30574 7.05589 8.68082 6.68082C9.05589 6.30574 9.2666 5.79703 9.2666 5.2666Z" stroke="#F7941E" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>

                </TouchableOpacity>
              </View>
            </View>

            {/* Select All / Show Deleted */}
            <View style={styles.selectRow}>
              <CustomCheckbox checkboxStyle={{ borderWidth: 1 }} size={14} title={<AppText style={styles.selectAllText} >Select all</AppText>} />
              {/* <TouchableOpacity
                style={styles.showDeleted}
                onPress={() => setShowDeletedProducts(!showDeletedProducts)}
              >
                <View style={[styles.checkbox, showDeletedProducts && styles.checkboxChecked]} />
                <AppText style={styles.selectAllText}>Show Deleted Products</AppText>
              </TouchableOpacity> */}
            </View>

            {/* Product List */}
            <View style={styles.productList}>
              {productList.map((product, index) => (
                <View key={index} style={styles.productCard}>
                  <View style={styles.productHeader}>
                    <CustomCheckbox checkboxStyle={{ borderWidth: 1 }} size={14} title={
                      <AppText style={styles.productName}>{product?.productName ?? '-'}</AppText>
                    } />
                    <AppText style={styles.productCode}>{product?.productCode ?? '-'}</AppText>
                  </View>

                  <View style={styles.productDetails}>
                    <View style={styles.productDetailRow}>
                      <AppText style={styles.productLabel}>Customer Product</AppText>
                      <View style={styles.priceContainer}>
                        <AppText style={styles.productLabel}>Path</AppText>
                      </View>
                    </View>
                    <View style={styles.productDetailRow}>
                      <AppText style={styles.productDetailText}>{product?.customerProduct ?? '-'}</AppText>
                      <View style={styles.priceContainer}>
                        <AppText style={styles.productPrice}>₹ {product?.ptr}</AppText>
                      </View>
                    </View>
                  </View>

                  <View style={styles.productActions}>
                    <View style={styles.actionTabs}>
                      <View style={styles.actionTab}>
                        <AppText style={styles.actionTabLabel}>Mapping</AppText>
                        <TouchableOpacity>
                          <View style={{ display: "flex", alignItems: "center", gap: 5, flexDirection: "row" }}>
                            <AppText style={styles.changeText}>
                              Change
                            </AppText>

                            <Svg style={{ marginTop: 3 }} width="4" height="7" viewBox="0 0 4 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <Path d="M0.5 0.5L3.5 3.5L0.5 6.5" stroke="#F7941E" strokeLinecap="round" strokeLinejoin="round" />
                            </Svg>
                          </View>
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity style={styles.actionTab}>
                        <AppText style={styles.actionTabLabel}>Comment</AppText>
                        <CommentIcon />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionTab}>
                        <AppText style={styles.actionTabLabel}>Activity</AppText>
                        <HistoryIcon />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.quantityControls}>
                      <AddToCartWidget isInCart={true} quantity={product?.quantity} />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.holdButton}>
          <HoldIcon />
          <AppText style={styles.holdButtonText}>Hold</AppText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.rejectButton}>
          <Svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <Path d="M11.4333 11.4329L6.43331 6.43294M6.43331 11.4329L11.4333 6.43294M17.2666 8.93294C17.2666 4.33044 13.5358 0.599609 8.93331 0.599609C4.33081 0.599609 0.599976 4.33044 0.599976 8.93294C0.599976 13.5354 4.33081 17.2663 8.93331 17.2663C13.5358 17.2663 17.2666 13.5354 17.2666 8.93294Z" stroke="#F7941E" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>

          <AppText style={styles.rejectButtonText}>Reject</AppText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.approveButton}>
          <Svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <Path d="M14.3333 1L5.16667 10.1667L1 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>

          <AppText style={styles.approveButtonText}>Confirm</AppText>
        </TouchableOpacity>
      </View>


      <DropdownModal
        visible={showSelectDivisiton}
        data={[
          {
            key: "ALL",
            label: (
              <View style={styles.selectOption}>
                <AppText style={{ fontFamily: Fonts.Bold, fontSize: 14, color: colors.primaryText }}>
                  All Div
                </AppText>
              </View>
            ),
            value: "All Div"
          },
          ...divisions
            .filter((e) => e.divisionName)
            .map((e) => ({
              key: e.divisionId,
              label: (
                <View style={styles.selectOption}>
                  <AppText style={{ fontFamily: Fonts.Bold, fontSize: 14, color: colors.primaryText }}>
                    {e?.divisionName}
                  </AppText>
                  <AppText style={{ fontFamily: Fonts.Regular, fontSize: 12, color: colors.secondaryText }}>
                    {e.divisionCode}
                  </AppText>
                </View>
              ),
              value: e?.divisionName 
            })),
        ]}
        enableSelectAll={true}
        selectedIds={[(selectedDivision != "All" && selectedDivision != null) ? selectedDivision?.key : []]}
        onSelect={(e) => setSelectedDivision({ key: e?.key, value: e?.value })}
        title={"Select Divisions"}
        onClose={() => setShowSelectDivisiton(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  selectOption: {
    paddingHorizontal: 16,
    borderRadius: 10,
    overflow: "hidden"
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#FFF',
  },
  time: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  signal: {
    flexDirection: 'row',
    gap: 2,
    alignItems: 'flex-end',
  },
  bar: {
    width: 3,
    backgroundColor: '#000',
  },
  wifi: {
    marginLeft: 5,
  },
  battery: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 5,
  },
  batteryOuter: {
    width: 22,
    height: 11,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 2,
    padding: 1,
  },
  batteryInner: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 1,
  },
  batteryCap: {
    width: 1,
    height: 4,
    backgroundColor: '#000',
    marginLeft: 1,
  },
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 6
  },
  backButton: {
    padding: 4,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  statusBadge: {
    backgroundColor: '#4481B41A',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginLeft: 23,
    marginTop: -5
  },
  statusText: {
    color: '#4481B4',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
  },
  orderSummary: {
    padding: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  poNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryText,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 3
  },
  amountSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryText,
    marginBottom: 4,
  },
  skuCount: {
    fontSize: 12,
    color: colors.primaryText,
    fontFamily: Fonts.Regular
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    // flex: 1,
    width: "50%"
  },
  alignRight: {
    // alignItems: 'flex-end',
  },
  detailLabel: {
    fontSize: 12,
    color: colors.secondaryText,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 12,
    color: colors.secondaryText,
    fontWeight: '500',
  },
  underlinedText: {
    textDecorationLine: 'underline',
  },
  expandableValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "space-between",
    gap: 4,
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  expandedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  expandedItem: {
    // flex: 1,
    width: "33%"
  },
  expandedLabel: {
    fontSize: 12,
    color: colors.secondaryText,
    marginBottom: 4,
    fontFamily: Fonts.Regular

  },
  expandedValue: {
    fontSize: 12,
    color: colors.primaryText,
    fontWeight: '400',
    fontFamily: Fonts.Regular
  },
  contractHolder: {
    marginTop: 5,
  },
  contractName: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.primaryText,
    fontFamily: Fonts.Regular,
    marginTop: 4,
  },
  contractDetails: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 14,
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '7777774D',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    // paddingVertical: 10,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    // borderRadius:12,
  },
  tabs: {
    flexDirection: 'row',
    gap: 24,
    alignItems: "center"
  },
  tabButton: {
    position: 'relative',
  },
  tabText: {
    fontSize: 14,
    color: colors.secondaryText,
    paddingBottom: 8,
    fontFamily: Fonts.Regular,
    fontWeight: 400,
    // paddingBottom:20
  },
  activeTab: {
    color: '#F7941E',
    fontWeight: '700',
    fontFamily: Fonts.Bold
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#FF8C00',
  },
  tabActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 5
  },
  searchIconButton: {
    padding: 4,
  },
  divDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
    borderWidth: 0.5,
    borderColor: "#777777"
  },
  divDropdownText: {
    fontSize: 14,
    color: colors.primaryText,
  },
  selectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  showDeleted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#CCC',
    borderRadius: 4,
  },
  checkboxChecked: {
    backgroundColor: '#FF8C00',
    borderColor: '#FF8C00',
  },
  selectAllText: {
    fontSize: 14,
    color: '#777777',
    fontFamily: Fonts.Regular
  },
  productList: {
    // marginBottom: 100,
  },
  productCard: {
    backgroundColor: '#FFF',
    marginBottom: 1,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  productHeader: {
    flexDirection: "column",
    marginBottom: 12,

  },
  productCheckbox: {
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryText,
    marginBottom: 4,
  },
  productCode: {
    fontSize: 11,
    color: colors.secondaryText,
    fontWeight: 400,
    fontFamily: Fonts.Regular,
    paddingLeft: 23
  },
  productDetails: {
    marginBottom: 12,
  },
  productDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  productLabel: {
    fontSize: 11,
    color: colors.secondaryText,
    fontFamily: Fonts.Regular
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pthLabel: {
    fontSize: 12,
    color: '#999',
  },
  productDetailText: {
    fontSize: 13,
    color: colors.primaryText,
    fontFamily: Fonts.Regular

  },
  productPrice: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.primaryText,
    fontFamily: Fonts.Regular
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  actionTabs: {
    flexDirection: 'row',
    // gap: 16,
    width: "55%",
    justifyContent: "space-between",
    display: "flex"
  },
  actionTab: {
    // alignItems: 'center',
  },
  actionTabLabel: {
    fontSize: 10,
    color: colors.secondaryText,
    fontFamily: Fonts.Regular,
    marginBottom: 4,
  },
  changeText: {
    color: '#F7941E',
    fontSize: 13,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 16,
    width: "45%"
  },
  quantity: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
    minWidth: 40,
    textAlign: 'center',
  },
  deleteButton: {
    marginLeft: 8,
    padding: 4,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    // borderTopWidth: 1,
    // borderTopColor: '#E0E0E0',
  },
  holdButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CCC',
    gap: 8,
  },
  holdButtonText: {
    fontSize: 18,
    color: colors.secondaryText,
    fontWeight: '500',
    fontFamily: Fonts.Black
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF8C00',
    gap: 8,
  },
  rejectButtonText: {
    fontSize: 18,
    color: '#F7941E',
    fontWeight: '700',
    fontFamily: Fonts.Black
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FF8C00',
    gap: 8,
  },
  approveButtonText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: '700',
    fontFamily: Fonts.Black

  },
});

export default OrderDetailsScreen;
