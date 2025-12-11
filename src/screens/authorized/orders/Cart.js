import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  StyleSheet,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconFeather from 'react-native-vector-icons/Feather';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Downarrow from '../../../components/icons/downArrow';

import Mappedorder from "../../../components/icons/Manualorder"
import Filter from '../../../components/icons/Filter';
import Divview from "../../../components/icons/div"
const { width } = Dimensions.get('window');
import VerticalText from "./VerticalText"
import Delete from '../../../components/icons/Delete';
import { colors } from '../../../styles/colors';
import UnMapped from '../../../components/icons/Unmapping';
import Svg, { Path } from 'react-native-svg';
import { DeleteCart, getCartDetails, IncreaseQTY, PlaceOrder } from '../../../api/orders';
import ErrorMessage from "../../../components/view/error"
import FilterModal from '../../../components/FilterModal';
import AppText from "../../../components/AppText"

import { OrderPlaceSuccessModal } from "./orderConfirm";
import CustomerSelectionModal from './CustomerSelector';
import SelectDistributor from './SelectDistributor';
import Toast from 'react-native-toast-message';
import { setCartTotal } from '../../../redux/slices/orderSlice';
import { AppInput } from '../../../components';
const Cart = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('MANUAL'); // 'manual' or 'upload'

  const formatCurrency = (value) => {
    if (value === '-') return '-';
    return `₹ ${value.toLocaleString('en-IN')}`;
  };

  const [cartDetails, setCartDetails] = useState([]);
  const [orderSummery, setOrderSummery] = useState();

  const [showConfirm, setShowConfirm] = useState(false);
  const [placedOrders, setPlacedOrders] = useState(0);

  const [showDistributorselection, setShowSelectdistributor] = useState(false);
  const [showCustomerselection, setShowCustomerselection] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const [selectedDistributor, setSelectedDistributor] = useState();
  const [selectedCustomer, setSelectedCustomer] = useState();
  const [loadingProductId, setLoadingProductId] = useState(null);
  const [loading, setLoading] = useState(false);


  const handleCheckout = async () => {
    try {
      // Flatten and map in one go
      const cartItem = cartDetails?.flatMap(cart =>
        cart?.products?.map(product => ({
          cartId: Number(product.id),            // safer than parseInt for numeric conversion
          productId: product.productId,
          productCode: product.productCode
        })) || []                                // fallback if cart.products is undefined
      ) || [];

      const payload = { orders: cartItem };
      if (cartItem && cartItem.length == 0) {
        Toast.show({
          type: 'error',
          text1: 'Cart Empty',
          text2: 'Your cart is currently empty. Please add items to continue.',
        });
        return;
      }
      const response = await PlaceOrder(payload);
      if (response?.success) {
        setPlacedOrders(cartItem.length)
        setShowConfirm(true);
        getCartdetails();

      }
    }
    catch (error) {
       getCartdetails(false);
      ErrorMessage(error);
    }
  };


  useEffect(() => {
    setShowSelectdistributor(false);
    setShowCustomerselection(false);
    setShowFilter(false);
    getCartdetails();
  }, [])


  const getCartdetails = async (load = true) => {
    try {
      if (load) {
        setLoading(true);
      }
      const response = await getCartDetails();
      const cartDetails = response?.cartDetails ?? [];
      setOrderSummery(response?.summary)
      if (cartDetails.length > 0) {
        const count = cartDetails.reduce((acc, item) => acc + (item.products?.length ?? 0), 0);
        setCartDetails(cartDetails);
        dispatch(setCartTotal(count));
      } else {
        setCartDetails([]);
        dispatch(setCartTotal(0));
      }
    } catch (error) {
      dispatch(setCartTotal(0));
      ErrorMessage(error);
    }
    finally {
      setTimeout(() => {
        setLoading(false);
      }, 300)
    }
  };


  const handleDelete = async (products, isAll) => {
    try {
      const cartIds = products.map((e) => parseInt(e.id));
      setLoading(true);

      const deleteCart = await DeleteCart(cartIds, isAll);

      if (deleteCart?.message === "Product deleted successfully.") {
        const updatedList = cartDetails.map((item) => ({
          ...item,
          products: item?.products?.filter((e) => !cartIds.includes(e.id)),
        }));

        console.log(updatedList, "updated cart details");

        setCartDetails(updatedList);
        getCartdetails(false);
      }
    }
    catch (error) {
      ErrorMessage(error);
    }
    finally {
      setTimeout(() => {
        setLoading(false);
      }, 300)
      // getCartdetails();
    }

  }

  const handleQuantityChange = async (product, event) => {

    try {
      const minQTY = product?.packing ? parseInt(product?.packing) : 1
      const updateQTY = product?.qty + (event === 'plus' ? +minQTY : -minQTY);
      if (updateQTY > 0) {
        setLoadingProductId(product?.id)
        console.log(parseInt(product?.id),
          product?.productId,
          updateQTY, 987978)
        const increasesQTY = await IncreaseQTY(
          parseInt(product?.id),
          product?.productId,
          updateQTY
        );
        console.log(increasesQTY);
      }
      else {
        await handleDelete([product], false);
      }

    } catch (error) {
      ErrorMessage(error);
    }
    finally {
      getCartdetails(false);
      setLoadingProductId(null)
    }

  };

  useEffect(() => {
    console.log(selectedCustomer, 89765478)
  }, [selectedCustomer])


  const SummaryCard = () => (
    <View style={styles.summaryCard}>
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <AppText style={styles.summaryLabel}>SKU Count</AppText>
          <AppText style={styles.summaryValue}>{orderSummery?.skuCount ?? 0}</AppText>
        </View>
        <View style={styles.summaryItem}>
          <AppText style={styles.summaryLabel}>Total Order Value</AppText>
          <AppText style={styles.summaryValue}>{formatCurrency(orderSummery?.totalOrderValue ?? 0)}</AppText>
        </View>
        <View style={styles.summaryItem}>
          <AppText style={[styles.summaryLabel]}>(-) Discount</AppText>
          <AppText style={[styles.summaryValue, styles.greenText]}>{formatCurrency(orderSummery?.toalDiscount ?? 0)}</AppText>
        </View>
      </View>
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <AppText style={styles.summaryLabel}>(=) Gross Ord Value</AppText>
          <AppText style={styles.summaryValue}>{formatCurrency(orderSummery?.grossOrderValue ?? 0)}</AppText>
        </View>
        <View style={styles.summaryItem}>
          <AppText style={styles.summaryLabel}>(+) Tax</AppText>
          <AppText style={styles.summaryValue}>{formatCurrency(orderSummery?.tax ?? 0)}</AppText>
        </View>
        <View style={styles.summaryItem}>
          <AppText style={[styles.summaryLabel]}>(=) Net Ord Value</AppText>
          <AppText style={[styles.summaryValue, styles.orangeText]}>{formatCurrency(orderSummery?.netOrderValue ?? 0)}</AppText>
        </View>
      </View>
    </View>
  );

  const TabSelector = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'MANUAL' && styles.activeTab]}
        onPress={() => setActiveTab('MANUAL')}
      >
        <Mappedorder />
        <AppText style={[styles.tabText, activeTab === 'MANUAL' && styles.activeTabText]}>
          Manual Order
        </AppText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'UPLOAD' && styles.activeTab]}
        onPress={() => setActiveTab('UPLOAD')}
      >
        <IconFeather
          name="upload"
          size={18}
          color={activeTab === 'upload' ? '#FF6B00' : '#999'}
        />
        <AppText style={[styles.tabText, activeTab === 'UPLOAD' && styles.activeTabText]}>
          Upload Order
        </AppText>
      </TouchableOpacity>
    </View>
  );

  const ProductCard = ({ product }) => (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <AppText style={styles.productName}>{product.productName}</AppText>
        <AppText style={styles.orderValue}>Order Value</AppText>
      </View>
      <View style={styles.productSubHeader}>
        <AppText style={styles.skuText}>{product.sku} | {product?.rcDetails?.supplyModeId}</AppText>
        <AppText style={styles.orderValueAmount}>{formatCurrency(product.orderAmount ?? 0)}</AppText>
      </View>

      <View style={styles.productDetails}>
        <View style={styles.detailRow}>
          <AppText style={styles.detailLabel}>Customer Product</AppText>
          <AppText style={styles.detailLabel}>MOQ</AppText>
        </View>
        <View style={styles.detailRow}>
          <AppText style={styles.detailValue}>{product.customerProduct ?? "-"}</AppText>
          <AppText style={styles.detailValue}>{product?.rcDetails?.maxOrderQty ?? '-'}</AppText>
        </View>
      </View>

      <View style={styles.productMetrics}>
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <AppText style={styles.metricLabel}>PTH</AppText>
            <AppText style={styles.metricValue}>{formatCurrency(product.pth ?? product.ptr ?? 0)}</AppText>
          </View>
          <View style={styles.metricItem}>
            <AppText style={styles.metricLabel}>Margin</AppText>
            <AppText style={styles.metricValue}>{formatCurrency(product.margin ?? 0)}</AppText>
          </View>
          <View style={styles.metricItem}>
            <AppText style={styles.metricLabel}>Tax(GST)</AppText>
            <AppText style={styles.metricValue}>₹ {product.taxGST ?? '-'}</AppText>
          </View>
          <View style={styles.metricItem}>
            <AppText style={styles.metricLabel}>Exausted /Max Qty</AppText>
            <AppText style={[styles.metricValue, { textAlign: "right" }]}>{product?.rcDetails?.maxOrderQty ?? '-'}/{product?.rcDetails?.maxOrderQty ?? '-'}</AppText>
          </View>
        </View>
      </View>



      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {product.isMappingRequired ? (
          <View style={{ display: "flex", flexDirection: "column" }}>
            <TouchableOpacity >
              <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 2 }}>
                <AppText style={{ color: "#F7941E", fontWeight: 700, fontSize: 14 }}>Find Product</AppText>
                <Svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <Path fillRule="evenodd" clipRule="evenodd" d="M5.83333 11.6667C9.05508 11.6667 11.6667 9.05508 11.6667 5.83333C11.6667 2.61158 9.05508 0 5.83333 0C2.61158 0 0 2.61158 0 5.83333C0 9.05508 2.61158 11.6667 5.83333 11.6667ZM6.1075 3.77417C6.18953 3.69224 6.30073 3.64622 6.41667 3.64622C6.5326 3.64622 6.6438 3.69224 6.72583 3.77417L8.47583 5.52417C8.55776 5.6062 8.60378 5.7174 8.60378 5.83333C8.60378 5.94927 8.55776 6.06047 8.47583 6.1425L6.72583 7.8925C6.68578 7.93548 6.63748 7.96996 6.58381 7.99387C6.53015 8.01778 6.47221 8.03064 6.41347 8.03168C6.35473 8.03271 6.29638 8.02191 6.2419 7.9999C6.18742 7.9779 6.13794 7.94515 6.09639 7.9036C6.05485 7.86206 6.0221 7.81257 6.00009 7.7581C5.97809 7.70362 5.96728 7.64527 5.96832 7.58653C5.96936 7.52779 5.98222 7.46985 6.00613 7.41619C6.03004 7.36252 6.06452 7.31422 6.1075 7.27417L7.11083 6.27083H3.5C3.38397 6.27083 3.27269 6.22474 3.19064 6.14269C3.10859 6.06065 3.0625 5.94937 3.0625 5.83333C3.0625 5.7173 3.10859 5.60602 3.19064 5.52397C3.27269 5.44193 3.38397 5.39583 3.5 5.39583H7.11083L6.1075 4.3925C6.02557 4.31047 5.97955 4.19927 5.97955 4.08333C5.97955 3.9674 6.02557 3.8562 6.1075 3.77417Z" fill="#F7941E" />
                </Svg>
              </View>
            </TouchableOpacity>
            <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 5 }}>
              <UnMapped />
              <AppText style={{ color: "#E85B49", fontSize: 10, fontWeight: 700 }}>Mapping Required</AppText>
            </View>
          </View>
        ) : <View ></View>}
        <View style={styles.quantityControls}>
          <View style={styles.quantityBox}>
            {/* border: 1px solid #F7941E1A */}
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => loadingProductId !== product.id ? handleQuantityChange(product, 'minus') : null}
            >
              <Icon name="remove" size={20} color={colors.primary} />
            </TouchableOpacity>
            <AppText style={styles.quantityText}>
              {loadingProductId === product.id ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                product.qty
              )}

            </AppText>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => loadingProductId !== product.id ? handleQuantityChange(product, 'plus') : null}
            >
              <Icon name="add" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete([product], false)}>
            <Delete />
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <IconMaterial name="chevron-left" size={30} color="#000" />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>Your Cart</AppText>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}
      >
        {/* Summary Card */}
        <SummaryCard />

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <IconFeather name="search" size={20} color="#999" style={styles.searchIcon} />
          <AppInput
            style={styles.searchInput}
            placeholder="Search by PO number, SKU, Product title"
            placeholderTextColor="#999"
          />
        </View>
        <View style={styles.cartDetails}>
          <View style={styles.innercartDetails}>
            {/* Tab Selector */}
            <TabSelector />
            <View style={styles.filtersContainer}>
              <View style={styles.wrapper}>
                {/* Row for both boxes */}
                <View style={styles.row}>
                  <TouchableOpacity style={styles.box} onPress={() => setShowCustomerselection(true)}>
                    <AppText style={styles.label}>Customer</AppText>
                    <View style={styles.valueRow}>
                      <AppText style={styles.valueText} numberOfLines={1}>
                        {selectedCustomer ? selectedCustomer.customerName : "All"}
                      </AppText>
                      <Downarrow />
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.box} onPress={() => setShowSelectdistributor(true)} disabled={!selectedCustomer}>
                    <AppText style={styles.label}>Distributor</AppText>
                    <View style={styles.valueRow}>
                      <AppText style={styles.valueText} numberOfLines={1}>
                        {selectedDistributor ? selectedDistributor.name : "All"}
                      </AppText>
                      <Downarrow />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.filterStyle} onPress={() => setShowFilter(true)}>
                    <View >
                      <Filter />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {
              (() => {
                const filteredCarts = cartDetails.filter(
                  (cart) =>
                    cart.products?.length > 0 &&
                    cart.products.some((e) => e.orderType === activeTab)
                );

                if (filteredCarts.length === 0) {
                  return (
                    <View style={{ padding: 20, alignItems: "center" }}>
                      <AppText style={{ fontSize: 16, color: "#666" }}>
                        No products found
                      </AppText>
                    </View>
                  );
                }

                return filteredCarts.map((cart, index) => (
                  <View key={index}>
                    {/* Header */}
                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionTitleContainer}>
                        <View style={[styles.sectionIcon]}>
                          <VerticalText />
                        </View>
                        <AppText
                          style={[
                            styles.sectionTitle,
                            {
                              color: "#4481B4",
                              textDecorationColor: "#4481B4",
                              textDecorationStyle: "solid",
                              textDecorationLine: "underline",
                            },
                          ]}
                        >
                          {cart?.divisionName ?? '-'}
                        </AppText>
                      </View>
                      <AppText>|</AppText>
                      <View style={styles.sectionActions}>
                        <AppText style={styles.skuCount}>SKU's</AppText>
                        <TouchableOpacity onPress={() => handleDelete(cart.products, true)}>
                          <Svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <Path d="M6.50041 0.000312327C5.93625 -0.00881525 5.38724 0.182378 4.95171 0.539657C4.51618 0.896936 4.22256 1.39697 4.12342 1.95021H1.77336C1.71936 1.94112 1.66421 1.94112 1.61022 1.95021H0.489427C0.359623 1.95021 0.235135 2.00157 0.14335 2.09299C0.0515645 2.18441 0 2.3084 0 2.43768C0 2.56697 0.0515645 2.69096 0.14335 2.78238C0.235135 2.8738 0.359623 2.92516 0.489427 2.92516H1.22357L2.08822 11.3845C2.14722 11.8375 2.37209 12.2529 2.71968 12.551C3.06727 12.8491 3.51312 13.0088 3.9717 12.9996H9.02911C9.48714 13.008 9.93219 12.8479 10.2791 12.5499C10.626 12.2519 10.8504 11.8369 10.9093 11.3845L11.7764 2.92516H12.5106C12.6404 2.92516 12.7649 2.8738 12.8567 2.78238C12.9484 2.69096 13 2.56697 13 2.43768C13 2.3084 12.9484 2.18441 12.8567 2.09299C12.7649 2.00157 12.6404 1.95021 12.5106 1.95021H11.3947C11.3406 1.94201 11.2856 1.94201 11.2315 1.95021H8.87658C8.77747 1.39711 8.48396 0.897185 8.0486 0.539924C7.61324 0.182662 7.06443 -0.00862056 6.50041 0.000312327ZM6.50041 0.975261C6.79856 0.969038 7.09038 1.06132 7.33033 1.23769C7.57027 1.41407 7.74483 1.66461 7.82676 1.95021H5.17406C5.25598 1.66461 5.43054 1.41407 5.67049 1.23769C5.91043 1.06132 6.20226 0.969038 6.50041 0.975261ZM2.25871 2.92516H10.7421L9.8848 11.2935C9.85929 11.4995 9.75753 11.6886 9.59943 11.8238C9.44132 11.9591 9.23825 12.0307 9.02993 12.0247H3.9717C3.76343 12.0305 3.56046 11.9588 3.40239 11.8236C3.24433 11.6884 3.14252 11.4994 3.11684 11.2935L2.25871 2.92516ZM5.28989 4.54276C5.22394 4.54201 5.15849 4.55422 5.09729 4.57869C5.03608 4.60316 4.98032 4.63941 4.93319 4.68536C4.88607 4.73132 4.8485 4.78608 4.82265 4.84651C4.79679 4.90694 4.78316 4.97186 4.78252 5.03755V9.91229C4.78782 10.0448 4.8444 10.1702 4.94043 10.2621C5.03645 10.354 5.16446 10.4053 5.29764 10.4053C5.43082 10.4053 5.55883 10.354 5.65485 10.2621C5.75088 10.1702 5.80747 10.0448 5.81276 9.91229V5.03755C5.81345 4.97169 5.80039 4.90642 5.77441 4.84586C5.74844 4.7853 5.71011 4.73078 5.66186 4.68575C5.56132 4.59163 5.42785 4.54032 5.28989 4.54276ZM7.69379 4.54276C7.62785 4.54201 7.5624 4.55422 7.50119 4.57869C7.43998 4.60316 7.38422 4.63941 7.3371 4.68536C7.28997 4.73132 7.25241 4.78608 7.22655 4.84651C7.2007 4.90694 7.18706 4.97186 7.18642 5.03755V9.91229C7.19172 10.0448 7.24831 10.1702 7.34433 10.2621C7.44036 10.354 7.56837 10.4053 7.70154 10.4053C7.83472 10.4053 7.96273 10.354 8.05876 10.2621C8.15478 10.1702 8.21137 10.0448 8.21667 9.91229V5.03755C8.21735 4.97169 8.2043 4.90642 8.17832 4.84586C8.15234 4.7853 8.11401 4.73078 8.06576 4.68575C7.96542 4.59183 7.83147 4.54053 7.69379 4.54276Z" fill="#1D1D22" />
                          </Svg>
                        </TouchableOpacity>
                        <TouchableOpacity>
                          <IconMaterial name="keyboard-arrow-up" size={24} color="#666" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Products */}
                    {cart.products
                      .filter((e) => e.orderType === activeTab)
                      .map((product, i) => (
                        <ProductCard key={`${index}_${i}`} product={product} />
                      ))}
                  </View>
                ));
              })()
            }


            <View style={styles.bottomPadding} />
          </View>
        </View>
      </ScrollView>

      <CustomerSelectionModal onSelectCustomer={(e) => {
        setSelectedCustomer(e)
        setShowCustomerselection(false)
      }} visible={showCustomerselection} onClose={() => setShowCustomerselection(false)} />


      <SelectDistributor onSelect={(e) => {
        setSelectedDistributor(e)
        setShowSelectdistributor(false)
      }} visible={showDistributorselection} onClose={() => setShowSelectdistributor(false)} />

      <FilterModal visible={showFilter} onClose={() => setShowFilter(false)} onApply={() => setShowFilter(false)} />
      <OrderPlaceSuccessModal
        orderCount={placedOrders}
        visible={showConfirm}
        onClose={() => {
          setShowConfirm(false)
          setPlacedOrders(0);
        }}
        onGoToOrders={() => {
          console.log(8779878)
          setShowConfirm(false)
          navigation.goBack()
          navigation.navigate('Orders');
          setPlacedOrders(0);
        }} />

      {/* Checkout Button */}
      <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
        <AppText style={styles.checkoutButtonText}>Checkout</AppText>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },

  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginLeft: 8,
  },
  headerRight: {
    width: 30,
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#929292ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2B2B2B',
  },
  greenText: {
    color: '#4F9E52',
  },
  orangeText: {
    color: '#F39C26',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 3,
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 48,
    borderColor: "#7777774D",
    borderWidth: 1
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 10,
    backgroundColor: '#fff',
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 16,
    gap: 8,
  },
  activeTab: {
    borderBottomColor: '#F7941E',
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999',
  },
  activeTabText: {
    color: '#F7941E',
    fontWeight: '600',
  },
  dropdownsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  dropdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dropdownLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  dropdownValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-between',
    // paddingHorizontal: 16,
    // paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 10,
    backgroundColor: "#EFFBDA"
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    // borderRadius: 4,
    // justifyContent: 'center',
    // alignItems: 'center',
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    paddingVertical: 10
  },
  sectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  skuCount: {
    fontSize: 14,
    color: '#1D1D22',
    fontWeight: '700',
  },
  productCard: {
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  orderValue: {
    fontSize: 12,
    color: '#666',
  },
  productSubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  skuText: {
    fontSize: 12,
    color: '#666',
  },
  orderValueAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  productDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    // flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    // flex: 1,
  },
  productMetrics: {
    // borderTopWidth: 1,
    // borderTopColor: '#F0F0F0',
    paddingTop: 12,
    marginBottom: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    // flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 13,
    color: '#000',
    fontWeight: '500',
  },
  mappingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  mappingText: {
    fontSize: 14,
    color: '#FF6B00',
    fontWeight: '500',
    marginRight: 6,
  },
  closeIcon: {
    marginLeft: 4,
    marginRight: 8,
  },
  mappingRequired: {
    fontSize: 12,
    color: '#666',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    minWidth: 40,
    textAlign: 'center',
  },
  deleteButton: {
    padding: 8,
  },
  checkoutButton: {
    backgroundColor: '#FF6B00',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },
  cartDetails: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  innercartDetails: {
    backgroundColor: "#fff",
    borderRadius: 12
  },
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: "space-between",
    // paddingHorizontal: 16,
    // paddingVertical: 6,
    gap: 12,
    // backgroundColor: '#fff',
  },
  wrapper: {
    backgroundColor: "#FFFFFF",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 13,
    paddingVertical: 20,
    borderRadius: 12
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  box: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    position: "relative",
  },
  label: {
    position: "absolute",
    top: -10,
    left: 14,
    backgroundColor: "#fff",
    paddingHorizontal: 6,
    fontSize: 13,
    color: "#777",
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  valueText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#2B2B2B",
    fontWeight: 500
  },
  filterStyle: {
    borderWidth: 0.5,
    borderColor: "#2B2B2B",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 0,
    paddingHorizontal: 14,
    borderRadius: 8
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: "flex-end"
  },
  quantityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F7941E1A',
    padding: 3,
    borderRadius: 5
  },
  quantityButton: {
    width: 35,
    height: 35,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#feefdd"
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    minWidth: 40,
    textAlign: 'center',
  },
  deleteButton: {
    marginLeft: 8,
  },
});

export default Cart;
