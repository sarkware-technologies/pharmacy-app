import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  Modal,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../../styles/colors';
import { addToCart, clearCart } from '../../../redux/slices/orderSlice';
import Svg, { Path } from 'react-native-svg';
import { AddtoCart, IncreaseQTY, UploadProductMapping, UploadTemplateOrder } from '../../../api/orders';
import UnMapped from "../../../components/icons/Unmapping"
import SearchProductModal from "./SearchProductModal"
import CancelOrderModal from "./CancelOrderModal"
import Modals from './uploadConfirmationModals';
import { ErrorMessage } from '../../../components/view/error';
import Toast from 'react-native-toast-message';
import { AppText, AppInput } from "../../../components"
import BackButton from '../../../components/view/backButton';
import { Fonts } from '../../../utils/fontHelper';


const { UnmappedProductsModal } = Modals;

const ProductMapping = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [activeTab, setActiveTab] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [products, setProducts] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [productMapping, setProductMapping] = useState(false);
  const [mappingProduct, setMappingProduct] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProductId, setLoadingProductId] = useState(null);


  const hanldeMappingclicked = (item) => {
    setMappingProduct(item);
    setProductMapping(true)
  }


  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    const beforeRemove = (e) => {
      if (!showExitModal) {
        e.preventDefault();
        setShowExitModal(true);
      }
    };

    const unsubscribe = navigation.addListener('beforeRemove', beforeRemove);
    return unsubscribe;
  }, [navigation, showExitModal]);





  const { originalFile, templateFile, distributor, customer, isOCR } = route.params || {};
  const [selectedDistributor, setSelectedDistributor] = useState(distributor);
  const [selectedCustomer, setSelectedCustomer] = useState(customer);

  useEffect(() => {
    // Simulate product mapping process
    loadMappedProducts();
    setShowExitModal(false);
  }, []);

  const loadMappedProducts = async () => {

    try {
      setIsLoading(true);

      if (originalFile || templateFile) {
        const fileUpload = await UploadTemplateOrder(originalFile ?? templateFile, parseInt(selectedCustomer?.customerId), selectedDistributor?.id, "UPLOAD", isOCR);
        console.log(fileUpload, "Upload file response")
        if (fileUpload?.poFileProducts) {
          const updatedProducts = fileUpload.poFileProducts.map(element => ({
            ...element,
            isMapped: !!element.mappingData?.[0]?.mappedProductId ? 1 : 0,
            ...element.mappingData?.[0]
          }));

          setProducts(updatedProducts);
        }

      }
    }
    catch (e) {
      console.log(e)
      ErrorMessage(e);
    }
    finally {
      setIsLoading(false);
    }

  };

  const showToast = () => {
    Toast.show({
      type: 'error',
      text1: 'Not Found',
      text2: 'Product mapping is required.',
    });
  }

  const handleQuantityChange = async (item, type) => {
    if (!item) return;

    const updatedList = products.map((e) => {
      if (e.id !== item.id) return e;
      setLoadingProductId(item.id);

      let newQty = e.uploadedQty;

      if (type === 'plus') {
        newQty = e.uploadedQty + 1;
      } else if (type === 'minus') {
        newQty = e.uploadedQty > 1 ? e.uploadedQty - 1 : 1;
      }


      return {
        ...e,
        uploadedQty: newQty,
      };
    });

    setProducts(updatedList);
    try {
      const updatedItem = updatedList.find((p) => p.id === item.id);
      await IncreaseQTY(item?.cartId, item?.productId, updatedItem.uploadedQty);
    } catch (e) {
      console.log(e);
      ErrorMessage(e);
    } finally {
      setLoadingProductId(null); // Hide loader
    }
  };


  const handleProceedToCart = () => {
    const nonmapped = getFilteredProducts("Non-Mapped");

    if (nonmapped && nonmapped.length > 0) {
      setShowConfirmModal(true)
    }
    else {
      ProceedToCart();
    }
  };

  const ProceedToCart = async () => {
    try {

      setShowExitModal(true);
      setTimeout(() => {
        navigation.removeListener('beforeRemove');
        navigation.replace('Cart');
      }, 100);


      // const nonmapped = getFilteredProducts("Mapped");
      // const mappedProduct = nonmapped.map((product) => {
      //   return {
      //     cfaId: product?.cfaId ?? 0,
      //     customerId: selectedCustomer ? parseInt(selectedCustomer?.customerId) : undefined,
      //     distributorId: selectedCustomer ? selectedDistributor?.id : undefined,
      //     divisionId: product?.divisionId ?? 0,
      //     modifiedBy: product?.modifiedBy,
      //     createdBy: product?.createdBy,
      //     principalId: 1,
      //     productId: product?.productId,
      //     qty: product?.uploadedQty ? parseInt(product?.uploadedQty) : 1
      //   }
      // })

      // const addtocart = await AddtoCart(mappedProduct);

      // if (addtocart && addtocart.message != "Invalid product code") {
      //   setShowExitModal(true);
      //   setTimeout(() => {
      //     navigation.removeListener('beforeRemove');
      //     navigation.replace('Cart');
      //   }, 100);
      // }
      // else {
      //   setShowConfirmModal(false);
      //   Toast.show({
      //     type: 'error',
      //     text1: 'Failed to add',
      //     text2: addtocart.message,
      //   });
      // }
    }
    catch (e) {
      setShowConfirmModal(false);
      // ErrorMessage(e);
    }

  }


  const getFilteredProducts = (tab) => {
    let filteredList = products;
    if (tab === 'All') {
      filteredList = products;
    } else if (tab === 'Mapped') {
      filteredList = products.filter((e) => e?.isMapped == 1);
    } else if (tab === 'Non-Mapped') {
      filteredList = products.filter((e) => e?.isMapped == 0 || e?.isMapped == null);
    }
    if (searchText && tab == activeTab) {
      return filteredList.filter(product => {
        const search = (searchText || '').toLowerCase();
        const uploadedName = product?.uploadedProductName?.toLowerCase() || '';
        const productName = product?.productName?.toLowerCase() || '';

        return uploadedName.includes(search) || productName.includes(search);
      });
    }
    return filteredList;
  };

  const hanldeMapping = async (product) => {
    try {
      if (product) {
        const response = await UploadProductMapping({
          customerId: selectedCustomer?.customerId,
          lineId: mappingProduct.id,
          productId: product.productId,
          productCode: product.productCode,
          uploadedProductName: mappingProduct.uploadedProductName,
          packing: product.packing,
        })
        console.log(response, 98768)
        if (response && response.length > 0) {
          console.log(response[0])
          const list = products.map((e) => {
            const findItem = e.id === mappingProduct?.id;
            return findItem
              ? {
                ...e,
                productName: product?.productName,
                productCode: product?.productCode,
                isMapped: 1,
                mrp: product?.mrp,
                productId: product?.productId,
                ptr: product?.ptr,
                pts: product?.pts,
                packingType: product?.packingType,
                packing: product?.packing,
                hosptialMargin: product?.hosptialMargin,
                hospitalMargin: product?.hospitalMargin,
                doctorMargin: product?.doctorMargin,
                cfaId: product?.cfaId,
                divisionId: product?.divisionId,
                cartId: response[0]?.cartId ? parseInt(response[0]?.cartId) : null
              }
              : e;
          });
          console.log(list, 8678909876, product)
          setProducts(list);
          setProductMapping(false)
          setMappingProduct(null)
        }
        else {

        }

      }
    }
    catch (e) {
      ErrorMessage(e);
    }
  }



  const renderProduct = ({ item }) => {
    const quantity = item?.uploadedQty || 0;

    return (
      <View style={styles.productCard}>
        <View style={styles.productHeader}>
          <AppText style={styles.productName}>{item?.productName ?? '-'}</AppText>
        </View>
        <AppText style={styles.productId}>{item?.productCode ?? '-'}</AppText>

        <View style={styles.productInfo}>
          <View style={styles.infoRow}>
            <AppText style={styles.infoLabel}>Customer Product Title</AppText>
            {item.isMapped == 1 && (
              <AppText style={[styles.infoLabel, { textAlign: "right" }]}>Mapping</AppText>
            )}
          </View>
          <View style={styles.infoRow}>
            <AppText style={styles.infoValue}>{item.uploadedProductName}</AppText>
            {item.isMapped == 1 && (
              <TouchableOpacity onPress={() => hanldeMappingclicked(item)}>
                <AppText style={styles.changeLink}>Change ›</AppText>
              </TouchableOpacity>
            )}

          </View>
        </View>

        <View style={styles.productMetrics}>
          <View style={styles.metricItem}>
            <AppText style={styles.metricLabel}>PTH</AppText>
            <AppText style={styles.metricValue}>{item?.pth ? `₹ ${item?.pth}` : '-'}</AppText>
          </View>
          <View style={styles.metricItem}>
            <AppText style={styles.metricLabel}>MOQ</AppText>
            <AppText style={styles.metricValue}>{item.moq ?? '-'}</AppText>
          </View>
          <View style={styles.metricItem}>
            <AppText style={styles.metricLabel}>Exausted /Max Qty</AppText>
            <AppText style={[styles.metricValue, { textAlign: "right" }]}>{item.uploadedQty ?? 0}/{item.uploadedQty ?? 0}</AppText>
          </View>
        </View>

        <View style={styles.mappingStatus}>
          {item.isMapped == 1 ? (
            <>
              <Icon name="check-circle" size={20} color="#169560" />
              <AppText style={styles.mappedText}>Mapped</AppText>
            </>
          ) : (
            <View style={{ display: "flex", flexDirection: "column" }}>
              <TouchableOpacity onPress={() => hanldeMappingclicked(item)}>
                <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 2 }}>
                  <AppText style={{ color: "#F7941E", fontWeight: 700, fontSize: 12 }}>Find Product</AppText>
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
          )}
          <View style={styles.quantityControls}>
            <>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => item.isMapped != 1 ? showToast() : loadingProductId !== item.id ? handleQuantityChange(item, 'minus') : null}
              >
                <Icon name="remove" size={20} color={colors.primary} />
              </TouchableOpacity>
              <AppText style={styles.quantityText}>
                {loadingProductId === item.id ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  quantity
                )}

              </AppText>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => item.isMapped != 1 ? showToast() : loadingProductId !== item.id ? handleQuantityChange(item, 'plus') : null}
              >
                <Icon name="add" size={20} color={colors.primary} />
              </TouchableOpacity>
            </>
          </View>


        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      <View style={styles.header}>
        <BackButton />
        <AppText style={styles.headerTitle}>Create Order/Product Mapping</AppText>
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressStep}>
          <View style={[styles.stepCircle, styles.activeStep]}>
            <AppText style={styles.stepNumber}>
              <Svg width="11" height="8" viewBox="0 0 11 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <Path d="M10.0833 0.75L3.66667 7.16667L0.75 4.25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </AppText>
          </View>
          <AppText style={[styles.stepLabel, styles.activeStepLabel]}>Upload Order</AppText>
        </View>
        <View style={styles.progressLine} />
        <View style={styles.progressStep}>
          <View style={[styles.stepCircle, styles.inactiveStep]}>
            <AppText style={[styles.stepNumber, styles.inactiveStepNumber]}>2</AppText>
          </View>
          <AppText style={[styles.stepLabel, styles.inactiveStepLabel]}>Products Mapping</AppText>
        </View>
      </View>
      <View style={styles.mappingComplete}>
        <Icon name="check-circle" size={16} color="#169560" />
        <AppText style={styles.mappingCompleteText}>Mapping Complete</AppText>
      </View>

      <View style={{ flex: 1, padding: 15, backgroundColor: "#F6F6F6" }}>
        <View style={{ backgroundColor: "#FFF", borderRadius: 12, flex: 1, overflow: "hidden" }}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'All' && styles.activeTab]}
              onPress={() => setActiveTab('All')}
            >
              <AppText style={[styles.tabText, activeTab === 'All' && styles.activeTabText]}>
                All({getFilteredProducts("All")?.length})
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'Mapped' && styles.activeTab]}
              onPress={() => setActiveTab('Mapped')}
            >
              <AppText style={[styles.tabText, activeTab === 'Mapped' && styles.activeTabText]}>
                Mapped({getFilteredProducts("Mapped")?.length})
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'Non-Mapped' && styles.activeTab]}
              onPress={() => setActiveTab('Non-Mapped')}
            >
              <AppText style={[styles.tabText, activeTab === 'Non-Mapped' && styles.activeTabText]}>
                Non-Mapped({getFilteredProducts("Non-Mapped")?.length})
              </AppText>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Icon name="search" size={20} color="#999" />
              <AppInput
                style={styles.searchInput}
                placeholder="Search product name/code"
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor="#999"
              />
            </View>
            <TouchableOpacity style={styles.menuButton}>
              <Icon name="more-vert" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={getFilteredProducts(activeTab)}
            renderItem={renderProduct}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={() => (
              !isLoading ? (
                <View style={styles.emptyContainer}>
                  <Icon name="inventory" size={60} color="#ccc" />
                  <AppText style={styles.emptyTitle}>No Products Found</AppText>
                  <AppText style={styles.emptySubtitle}>
                    Try adjusting your filters or check back later.
                  </AppText>
                </View>
              ) : <View style={{ paddingVertical: 20, minHeight: 300, display: 'flex', alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" color="#FF6B00" />
              </View>
            )}
          />
          <View style={styles.proceedButtonContainer}>
            <TouchableOpacity
              style={styles.proceedButton}
              onPress={handleProceedToCart}
            >
              <AppText style={styles.proceedText}>Proceed to Cart</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <UnmappedProductsModal
        visible={showConfirmModal}
        message={`${getFilteredProducts("Non-Mapped")?.length} Products are Unmapped.\nStill would you like to Proceed?`}
        onClose={() => setShowConfirmModal(false)}
        onMapProducts={() => {
          setShowConfirmModal(false);
          console.log('Map Products clicked');
        }}
        onCheckout={async () => {
          ProceedToCart();
        }}
      />
      <CancelOrderModal
        visible={showExitModal && !showConfirmModal}
        onCancel={() => {
          setShowExitModal(false);
        }}
        onClose={() => {
          setTimeout(() => {
            navigation.removeListener('beforeRemove');
            navigation.goBack();
          }, 100);
        }}
      />

      <SearchProductModal
        onSelectProduct={hanldeMapping}
        visible={productMapping} onClose={() => {
          setProductMapping(false)
          setMappingProduct(null)
        }} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primaryText,
    textAlign: "center",
    width: "80%",
    marginLeft: 10
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 6,
    backgroundColor: '#fff',
    justifyContent: "space-between"
  },
  progressStep: {
    alignItems: "center",
    flexDirection: 'row',
    display: "flex",
    gap: 5
  },
  stepCircle: {
    width: 25,
    height: 25,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStep: {
    backgroundColor: "#169560",
    borderRadius: 16,
  },
  inactiveStep: {
    backgroundColor: '#F7941E',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  inactiveStepNumber: {
    color: '#FFF',
  },
  stepLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: 900
  },
  activeStepLabel: {
    color: '#169560',
    fontWeight: 700,
    fontSize: 16
  },
  inactiveStepLabel: {
    color: '#2B2B2B',
    fontWeight: 700,
    fontSize: 16

  },
  progressLine: {
    // flex: 1,
    height: 2,
    backgroundColor: '#909090',
    marginHorizontal: 12,
    width: 50
    // marginBottom: 24,
  },
  completedStep: {
    backgroundColor: '#169560',
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  stepLabel: {
    fontSize: 12,
    color: '#333',
  },
  completedStepLabel: {
    fontWeight: '600',
    color: '#169560',
  },
  mappingComplete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginBottom: 5
    // backgroundColor: '#E8F4EF',
  },
  mappingCompleteText: {
    fontSize: 12,
    color: '#169560',
    fontWeight: '700',
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: colors.secondaryText,
    fontFamily: Fonts.Regular
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: 700,

  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    // backgroundColor: '#F6F6F6',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 45,
    borderWidth: 1,
    borderColor: '#EDEDED'
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
    fontFamily: Fonts.Regular
  },
  menuButton: {
    width: 45,
    height: 45,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDEDED'
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 70,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EDEDED",
    paddingHorizontal: 4,
    paddingVertical: 15

  },
  productHeader: {
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryText,
  },
  productId: {
    fontSize: 11,
    color: colors.secondaryText,
    marginBottom: 12,
    fontFamily: Fonts.Regular
  },
  productInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  infoLabel: {
    flex: 1,
    fontSize: 11,
    color: colors.secondaryText,
    fontFamily: Fonts.Regular
  },
  infoValue: {
    fontSize: 13,
    color: colors.primaryText,
    fontWeight: '600',
    flex: 1,
  },
  changeLink: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    fontFamily: colors.Regular
  },
  productMetrics: {
    flexDirection: 'row',
    marginBottom: 12,
    justifyContent: "space-between",
    display: "flex"
  },
  metricItem: {
    // flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    color: colors.secondaryText,
    marginBottom: 2,
    fontFamily:Fonts.Regular
  },
  metricValue: {
    fontSize: 12,
    color: '#777777',
    fontWeight: '500',
  },
  mappingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mappedText: {
    fontSize: 14,
    color: '#169560',
    fontWeight: '600',
    marginLeft: 4,
    flex: 1,
  },
  notMappedText: {
    fontSize: 14,
    color: colors.error,
    fontWeight: '600',
    marginLeft: 4,
    flex: 1,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    minWidth: 40,
    textAlign: 'center',
  },
  proceedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
  },
  proceedButton: {
    bottom: 20,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    // alignItems: 'center',
  },
  proceedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: "center"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  modalIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalIconText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  commentContainer: {
    width: '100%',
    marginBottom: 20,
  },
  commentLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
});

export default ProductMapping;