import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  StyleSheet,
  Dimensions
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

import { OrderPlaceSuccessModal } from "./orderConfirm";
import CustomerSelectionModal from './CustomerSelector';
import SelectDistributor from './SelectDistributor';
import Toast from 'react-native-toast-message';
import { setCartTotal } from '../../../redux/slices/orderSlice';
const Cart = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'upload'

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
      const response = await getCartDetails();

      const cartDetails = response?.cartDetails ?? [];
      setOrderSummery(response?.summary)
      if (cartDetails.length > 0) {
        if (load) {
          const count = cartDetails.reduce((acc, item) => acc + (item.products?.length ?? 0), 0);
          setCartDetails(cartDetails);
          dispatch(setCartTotal(count));
        }
      } else {
        if (load) {
          dispatch(setCartTotal(0));
          setCartDetails([]);
        }
      }
    } catch (error) {
      dispatch(setCartTotal(0));
      ErrorMessage(error);
    }
  };

  const handleDelete = async (product) => {
    try {

      const deleteCart = await DeleteCart([parseInt(product.id)]);
      if (deleteCart?.message == "Product deleted successfully.") {
        const list = cartDetails.map(item => ({
          ...item,
          products: item?.products?.filter(e => e.id !== product.id)
        }))
        console.log(list, 78908765)
        setCartDetails(list);
        getCartdetails()
      }

    }
    catch (error) {
      ErrorMessage(error);
    }
    finally {
      // getCartdetails();
    }

  }

  const handleQuantityChange = async (product, event) => {

    try {
      const minQTY = product?.packing ? parseInt(product?.packing) : 1
      const updateQTY = product?.qty + (event === 'plus' ? +minQTY : -minQTY);
      if (updateQTY > 0) {
        const increasesQTY = await IncreaseQTY(
          parseInt(product?.id),
          product?.productId,
          updateQTY
        );
        console.log(increasesQTY);
      }
      else {
        await handleDelete(product);
      }

    } catch (error) {
      ErrorMessage(error);
    }
    finally {
      getCartdetails();
    }

  };

  useEffect(() => {
    console.log(selectedCustomer, 89765478)
  }, [selectedCustomer])


  const SummaryCard = () => (
    <View style={styles.summaryCard}>
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>SKU Count</Text>
          <Text style={styles.summaryValue}>{orderSummery?.skuCount ?? 0}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Order Value</Text>
          <Text style={styles.summaryValue}>{formatCurrency(orderSummery?.totalOrderValue ?? 0)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel]}>(-) Discount</Text>
          <Text style={[styles.summaryValue, styles.greenText]}>{formatCurrency(orderSummery?.toalDiscount ?? 0)}</Text>
        </View>
      </View>
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>(=) Gross Ord Value</Text>
          <Text style={styles.summaryValue}>{formatCurrency(orderSummery?.grossOrderValue ?? 0)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>(+) Tax</Text>
          <Text style={styles.summaryValue}>{formatCurrency(orderSummery?.tax ?? 0)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel]}>(=) Net Ord Value</Text>
          <Text style={[styles.summaryValue, styles.orangeText]}>{formatCurrency(orderSummery?.netOrderValue ?? 0)}</Text>
        </View>
      </View>
    </View>
  );

  const TabSelector = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'manual' && styles.activeTab]}
        onPress={() => setActiveTab('manual')}
      >
        <Mappedorder />
        <Text style={[styles.tabText, activeTab === 'manual' && styles.activeTabText]}>
          Manual Order
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'upload' && styles.activeTab]}
        onPress={() => setActiveTab('upload')}
      >
        <IconFeather
          name="upload"
          size={18}
          color={activeTab === 'upload' ? '#FF6B00' : '#999'}
        />
        <Text style={[styles.tabText, activeTab === 'upload' && styles.activeTabText]}>
          Upload Order
        </Text>
      </TouchableOpacity>
    </View>
  );

  const ProductCard = ({ product }) => (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <Text style={styles.productName}>{product.productName}</Text>
        <Text style={styles.orderValue}>Order Value</Text>
      </View>
      <View style={styles.productSubHeader}>
        <Text style={styles.skuText}>{product.sku} | {product?.rcDetails?.supplyModeId}</Text>
        <Text style={styles.orderValueAmount}>{formatCurrency(product.orderAmount ?? 0)}</Text>
      </View>

      <View style={styles.productDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Customer Product</Text>
          <Text style={styles.detailLabel}>MOQ</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailValue}>{product.customerProduct ?? "-"}</Text>
          <Text style={styles.detailValue}>{product?.rcDetails?.maxOrderQty ?? '-'}</Text>
        </View>
      </View>

      <View style={styles.productMetrics}>
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>PTH</Text>
            <Text style={styles.metricValue}>{formatCurrency(product.pth ?? product.ptr ?? 0)}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Margin</Text>
            <Text style={styles.metricValue}>{formatCurrency(product.margin ?? 0)}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Tax(GST)</Text>
            <Text style={styles.metricValue}>₹ {product.taxGST ?? '-'}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Exausted /Max Qty</Text>
            <Text style={[styles.metricValue, { textAlign: "right" }]}>{product?.rcDetails?.maxOrderQty ?? '-'}/{product?.rcDetails?.maxOrderQty ?? '-'}</Text>
          </View>
        </View>
      </View>



      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {product.isMappingRequired ? (
          <View style={{ display: "flex", flexDirection: "column" }}>
            <TouchableOpacity >
              <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 2 }}>
                <Text style={{ color: "#F7941E", fontWeight: 700, fontSize: 14 }}>Find Product</Text>
                <Svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <Path fillRule="evenodd" clipRule="evenodd" d="M5.83333 11.6667C9.05508 11.6667 11.6667 9.05508 11.6667 5.83333C11.6667 2.61158 9.05508 0 5.83333 0C2.61158 0 0 2.61158 0 5.83333C0 9.05508 2.61158 11.6667 5.83333 11.6667ZM6.1075 3.77417C6.18953 3.69224 6.30073 3.64622 6.41667 3.64622C6.5326 3.64622 6.6438 3.69224 6.72583 3.77417L8.47583 5.52417C8.55776 5.6062 8.60378 5.7174 8.60378 5.83333C8.60378 5.94927 8.55776 6.06047 8.47583 6.1425L6.72583 7.8925C6.68578 7.93548 6.63748 7.96996 6.58381 7.99387C6.53015 8.01778 6.47221 8.03064 6.41347 8.03168C6.35473 8.03271 6.29638 8.02191 6.2419 7.9999C6.18742 7.9779 6.13794 7.94515 6.09639 7.9036C6.05485 7.86206 6.0221 7.81257 6.00009 7.7581C5.97809 7.70362 5.96728 7.64527 5.96832 7.58653C5.96936 7.52779 5.98222 7.46985 6.00613 7.41619C6.03004 7.36252 6.06452 7.31422 6.1075 7.27417L7.11083 6.27083H3.5C3.38397 6.27083 3.27269 6.22474 3.19064 6.14269C3.10859 6.06065 3.0625 5.94937 3.0625 5.83333C3.0625 5.7173 3.10859 5.60602 3.19064 5.52397C3.27269 5.44193 3.38397 5.39583 3.5 5.39583H7.11083L6.1075 4.3925C6.02557 4.31047 5.97955 4.19927 5.97955 4.08333C5.97955 3.9674 6.02557 3.8562 6.1075 3.77417Z" fill="#F7941E" />
                </Svg>
              </View>
            </TouchableOpacity>
            <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 5 }}>
              <UnMapped />
              <Text style={{ color: "#E85B49", fontSize: 10, fontWeight: 700 }}>Mapping Required</Text>
            </View>
          </View>
        ) : <View ></View>}
        <View style={styles.quantityControls}>
          <View style={styles.quantityBox}>
            {/* border: 1px solid #F7941E1A */}
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(product, 'minus')}
            >
              <Icon name="remove" size={20} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{product.qty}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(product, 'plus')}
            >
              <Icon name="add" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(product)}>
            <Delete />
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <IconMaterial name="chevron-left" size={30} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Cart</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}
      >
        {/* Summary Card */}
        <SummaryCard />

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <IconFeather name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
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
                    <Text style={styles.label}>Customer</Text>
                    <View style={styles.valueRow}>
                      <Text style={styles.valueText} numberOfLines={1}>
                        {selectedCustomer ? selectedCustomer.customerName : "All"}
                      </Text>
                      <Downarrow />
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.box} onPress={() => setShowSelectdistributor(true)}>
                    <Text style={styles.label}>Distributor</Text>
                    <View style={styles.valueRow}>
                      <Text style={styles.valueText} numberOfLines={1}>
                        {selectedDistributor ? selectedDistributor.name : "All"}
                      </Text>
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

            {/* Products based on active tab */}
            {activeTab === 'manual' && (
              <>
                {/* SELECTA Section for Manual Order */}
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleContainer}>
                    <View style={[styles.sectionIcon]}>
                      <VerticalText />
                    </View>
                    <Text style={[styles.sectionTitle, { color: '#4481B4', textDecorationColor: "#4481B4", textDecorationStyle: "solid", textDecorationLine: "underline" }]}>SELECTA</Text>
                  </View>
                  <Text>|</Text>
                  <View style={styles.sectionActions}>
                    <Text style={styles.skuCount}>SKU's</Text>
                    {/* <TouchableOpacity>
                      <IconFeather name="trash-2" size={18} color="#666" />
                    </TouchableOpacity> */}
                    <TouchableOpacity>
                      <IconMaterial name="keyboard-arrow-up" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>
                </View>
                {cartDetails?.map((cart, index) => cart.products.map((product, i) => <ProductCard key={index + '_' + i} product={product} />))}


                {/* <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleContainer}>
                    <View style={[styles.sectionIcon, { backgroundColor: '#E91E63' }]}>
                      <Icon name="currency-inr" size={16} color="#fff" />
                    </View>
                    <Text style={[styles.sectionTitle, { color: '#E91E63' }]}>IN CNS</Text>
                  </View>
                  <View style={styles.sectionActions}>
                    <Text style={styles.skuCount}>SKU's</Text>
                    <TouchableOpacity>
                      <IconFeather name="trash-2" size={18} color="#666" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <IconMaterial name="keyboard-arrow-up" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>
                </View>

                {mockData.manualOrderProducts
                  .filter(p => p.section === 'IN CNS')
                  .map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))} */}
              </>
            )}
            {activeTab === 'upload' && (
              <View style={{ height: 100, alignItems: "center", justifyContent: "center" }}>
                <Text>There are no items in your upload cart.</Text>
              </View>

            )}
            {/* {activeTab === 'upload' && (
              <>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleContainer}>
                    <View style={[styles.sectionIcon, { backgroundColor: '#4CAF50' }]}>
                      <Divview />
                    </View>
                    <Text style={[styles.sectionTitle, { color: '#4CAF50' }]}>SELECTA</Text>
                  </View>
                  <View style={styles.sectionActions}>
                    <Text style={styles.skuCount}>SKU's</Text>
                    <TouchableOpacity>
                      <IconFeather name="trash-2" size={18} color="#666" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <IconMaterial name="keyboard-arrow-up" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>
                </View>

                {mockData.uploadOrderProducts
                  .filter(p => p.section === 'SELECTA')
                  .map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}

                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleContainer}>
                    <View style={[styles.sectionIcon, { backgroundColor: '#E91E63' }]}>
                      <Icon name="currency-inr" size={16} color="#fff" />
                    </View>
                    <Text style={[styles.sectionTitle, { color: '#E91E63' }]}>IN CNS</Text>
                  </View>
                  <View style={styles.sectionActions}>
                    <Text style={styles.skuCount}>SKU's</Text>
                    <TouchableOpacity>
                      <IconFeather name="trash-2" size={18} color="#666" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <IconMaterial name="keyboard-arrow-up" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>
                </View>

                {mockData.uploadOrderProducts
                  .filter(p => p.section === 'IN CNS')
                  .map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
              </>
            )} */}

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
          setShowConfirm(false)
          // navigation.goBack()
          navigation.navigate('Orders');
          setPlacedOrders(0);
        }} />

      {/* Checkout Button */}
      <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
        <Text style={styles.checkoutButtonText}>Checkout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
