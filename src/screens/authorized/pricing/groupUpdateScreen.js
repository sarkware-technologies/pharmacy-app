import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Modal,
    StatusBar,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../styles/colors';
import Filter from '../../../components/icons/Filter';
import { AppText, AppInput } from "../../../components"
import Button from '../../../components/Button';
import BackButton from '../../../components/view/backButton';
import CommonStyle from "../../../styles/styles"
import DownloadArrow from '../../../components/icons/downloadArrow';
import ProductCard from "./components/selectedProduct"
import SwappingIcon from "../../../components/icons/swappingIcon"
import Downarrow from '../../../components/icons/downArrow';
import { Fonts } from '../../../utils/fontHelper';
import Search from '../../../components/icons/Search';
import SearchBar from "./components/searchBar"
import RcItem from "./components/rcItem"
import CustomCheckbox from '../../../components/view/checkbox';
import ReloadIcon from "../../../components/icons/reloadIcon"
import QuickApproval from "./model/quickApproval"
import SuccessModal from "./model/successModal"
import DiscountModal from "./model/discountModal"
import DiscountPreviousModal from "./model/discountPreviousModal"
import LinkDistributorModal from "./model/linkedDistributors"
import { getRCFilter } from '../../../api/rate-contract';
import { getProductsByDistributorAndCustomer } from '../../../api/product';
import { SkeletonList } from '../../../components/SkeletonLoader';
import SelectRC from './model/selectRC';
import UpdateAll from "./components/updateAll"


const GroupUpdateScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const {
        selectProduct,
        selectProductOld,
        selectProductNew,
        selectedCustomers,
        groupType,
        rcAction,
    } = route.params || {};

    const [quickApproval, setQuickApproval] = useState(false);
    const [selectedCustomerList, setselectedCustomerList] = useState(selectedCustomers);
    const [showRCselection, setShowRCselection] = useState(false);
    const [specialPriceType, setSpecialPriceType] = useState([]);

    const [successModal, setSuccessModal] = useState(false);
    const [discountModal, setDiscountModal] = useState(false);
    const [linkDistributorModal, setLinkDistributorModal] = useState(false);
    const [discountPreviousModal, setDiscountPreviousModal] = useState(false);


    const [buldkUpdate, setBuldkUpdate] = useState({ specialType: {} });

    console.log(selectProduct, 34987893)
    console.log(selectedCustomers, 34987893)
    console.log(selectProductNew, 34987893)
    console.log(selectProductOld, 402389)
    const TITLE_MAP = {
        addNew: "Add Products",
        productSwapping: "Product Swapping",
        updateDiscount: "Discount Update",
        updateSupply: "Supply Mode Update",
        quotation: "Quotation",
    };

    const title = TITLE_MAP[groupType] || "No page found";

    const [rcFilter, setRcFilter] = useState(null);
    const [filter, setFilter] = useState(null);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [search, setSearch] = useState();

    const [rcList, setRcList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const getGroupDetails = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getRCFilter();
            setRcFilter(response);

            const specialPriceTypeId = response?.specialPriceType
                ?.find((e) => e?.priceType === "Discount on PTR")
                ?.id;

            if (specialPriceTypeId && title == "Product Swapping") {
                setFilter({ specialPriceTypeIds: [specialPriceTypeId] });
            }
        } catch (error) {
            setIsLoading(false);
            console.error("Error fetching RC filter:", error);
        }
    }, []);

    const getDistributorProduct = useCallback(async (pageNo, pageSize, filter, search) => {
        try {
            let productIds = [selectProduct?.productId];
            if (groupType == "Product Swapping") {
                productIds = [selectProductNew?.productId, selectProductOld?.productId]
            }

            const response = await getProductsByDistributorAndCustomer({
                pageNo,
                pageSize,
                specialPriceTypeIds: filter?.specialPriceTypeIds || [],
                search,
                productIds
            });
            const rcList = response?.rcDetails?.map((e) => {
                return {
                    customerName: e?.customerDetails?.customerName,
                    customerCode: e?.customerDetails?.customerCode,
                    cityName: e?.customerDetails?.cityName,
                    rateContractNum: e?.rateContractNum,
                    specialPriceTypeId: e?.specialPriceTypeId,
                    discount: e?.discount,
                    ptr: e?.productDetails?.ptr,
                    moq: "",
                    supplyModeId: e?.supplyModeId,
                    specialPriceType: e?.specialPriceType,
                    specialPrice: e?.specialPrice,
                    id: e?.id,
                    customerId: e?.customerId,
                    productId: e?.productId,
                    rateContractMasterId: e?.rateContractMasterId,
                    isActive: true
                }
            });
            setRcList(rcList)
            console.log("Distributor products:", response);
        } catch (error) {
            console.error("Error fetching distributor products:", error);
        }
        finally {
            setIsLoading(false);
        }
    }, []);


    useEffect(() => {
        getGroupDetails();
    }, [getGroupDetails]);

    useEffect(() => {
        const shouldFetch =
            title !== "Product Swapping" ||
            filter?.specialPriceTypeIds?.length;

        if (shouldFetch) {
            getDistributorProduct(page, limit, filter, search);
        }
    }, [title, filter, page, limit, getDistributorProduct, search]);

    const _fetchFixedPrice = () => {
        const specialPriceTypeId = rcFilter?.specialPriceType?.find((e) => e?.priceType === "Fixed Price")?.id;
        setFilter((prev) => {
            return { ...prev, ...{ specialPriceTypeIds: [specialPriceTypeId] } }
        });
    }
    const handleAction = (action, value) => {
        console.log(action, 2983742)
        if (action == "selectRc") {
            setShowRCselection(true)
        }

    }

    const handleUpdate = (action, value) => {
        setBuldkUpdate((prev) => ({
            ...prev,
            [action]: value,
        }));
    };


    useEffect(() => {
        if (!rcFilter?.specialPriceType?.length) return;

        const list = rcFilter.specialPriceType
            .map((e) => ({
                label: e.priceType,
                value: e.id,
            }))
            .sort((a, b) => a.value - b.value);

        const defaultItem = list.find(
            (e) => e.label === "Discount on PTR"
        );

        setSpecialPriceType(list);

        if (defaultItem) {
            setBuldkUpdate((prev) => ({
                ...prev,
                specialType: defaultItem,
            }));
        }
    }, [rcFilter]);

    const addProducts = (action) => {
        if (action == "yes") {

        }
        else {

        }

    }



    return (
        <>
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                <StatusBar backgroundColor="#fff" barStyle="dark-content" />
                <View style={styles.header}>
                    <View style={CommonStyle.SpaceBetween}>
                        <View style={[CommonStyle.SpaceBetween]}>
                            <BackButton />
                            <AppText style={CommonStyle.headerTitle}>{title}</AppText>
                            {groupType == 'productSwapping' && (
                                <Button style={{ paddingVertical: 4, paddingHorizontal: 7, backgroundColor: "#f7f1e8", borderRadius: 5 }} >
                                    <AppText style={{ fontSize: 12, color: '#AE7017' }}>DRAFT</AppText>
                                </Button>
                            )}
                        </View>
                        {groupType == 'addNew' && (
                            <DownloadArrow specialPriceType={specialPriceType} />
                        )}

                    </View>
                    {(groupType == 'productSwapping' || groupType == 'updateDiscount' || groupType == 'updateSupply' || groupType == 'quotation') && (
                        <View style={{ paddingVertical: 15, paddingBottom: 5 }}>
                            {groupType == 'productSwapping' && (
                                <View >
                                    <ProductCard product={selectProductOld} type="2" productLabel={"OLD PRODUCT"} />
                                    <View style={{ display: "flex", alignItems: "center", marginVertical: -7 }}>
                                        <SwappingIcon />
                                    </View>
                                    <ProductCard product={selectProductNew} type="2" productLabel={"NEW PRODUCT"} isSpecial={true} />
                                </View>
                            )}
                            {groupType == 'updateDiscount' && (
                                <ProductCard product={selectProduct} type="2" />

                            )}
                            {(groupType == 'updateSupply' || groupType == 'quotation') && (
                                <ProductCard product={selectProduct} type="3" />

                            )}
                        </View>
                    )}

                </View>
                {groupType == 'addNew' && (
                    <ProductCard product={selectProduct} type="1" customerList={selectedCustomerList} handleAction={handleAction} />
                )}

                {groupType == 'updateDiscount' && (
                    <UpdateAll specialPriceType={specialPriceType} handleAction={handleUpdate} value={buldkUpdate} />
                )}


                <ScrollView contentContainerStyle={{ paddingBottom: 80 }} style={styles.content} showsVerticalScrollIndicator={false}>
                    {isLoading ? <SkeletonList /> :

                        <View style={{ paddingBottom: 10 }}>
                            {title == "Add Products" && (
                                <View style={{ marginTop: 15 }}>
                                    <AppText style={[CommonStyle.primaryText, { fontSize: 16, fontWeight: 700, marginBottom: 7 }]}>RC's</AppText>
                                </View>
                            )}
                            <SearchBar />
                            <View style={[CommonStyle.SpaceBetween]}>
                                {title != "Add Products" && (
                                    <View style={{ paddingBottom: 10 }}>
                                        <CustomCheckbox activeColor="#F7941E" size={14} title={<AppText style={CommonStyle.primaryText}>All RC’s</AppText>} />
                                    </View>
                                )}
                                {title == "Product Swapping" && (
                                    <TouchableOpacity style={{ paddingBottom: 10 }} onPress={() => _fetchFixedPrice()}>
                                        <AppText style={{ color: "#F7941E", fontSize: 14 }}>Fetched Fixed Price</AppText>
                                    </TouchableOpacity>
                                )}

                            </View>
                            {rcList?.filter((e) => e?.isActive)?.map((e, i) =>
                                <RcItem
                                    product={e}
                                    multiSelect={groupType != 'addNew'}
                                    key={i + groupType}
                                    specialPriceType={specialPriceType}
                                    type={groupType == 'updateSupply' ? 2 : 1}
                                    setValue={(value) =>
                                        setRcList(prev =>
                                            prev.map(rc =>
                                                rc?.id === e?.id ? value : rc
                                            )
                                        )
                                    }
                                />)}

                            {rcList?.filter((e) => e?.isActive)?.length == 0 && !isLoading && (
                                <View style={{ alignItems: "center", marginTop: 100 }}>
                                    <AppText>RC List is Empty</AppText>
                                </View>
                            )}
                        </View>
                    }

                </ScrollView>

                {/* Submit Button */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.lastSavedRow}>
                        <ReloadIcon />
                        <AppText style={styles.lastSavedText}>Last saved 05/04/2025</AppText>
                    </TouchableOpacity>
                    <Button onPress={() => setQuickApproval(true)}>
                        {groupType == 'productSwapping' ? ("Swap & Submit") : 'Submit'}
                    </Button>

                </View>


                <QuickApproval visible={quickApproval} onClose={() => setQuickApproval(false)} />
                <SuccessModal visible={successModal} onClose={() => setSuccessModal(false)} onPress={() => setSuccessModal(false)} />
                <DiscountModal visible={discountModal} onClose={() => setDiscountModal(false)} onPress={() => setDiscountModal(false)} />
                <LinkDistributorModal visible={linkDistributorModal} onClose={() => setLinkDistributorModal(false)} onPress={() => setLinkDistributorModal(false)} />
                <DiscountPreviousModal onPress={(e) => addProducts(e)} visible={discountPreviousModal} onClose={() => setDiscountPreviousModal(false)} />

                <SelectRC selected={selectedCustomerList} onSelectCustomer={(e) => setselectedCustomerList(e)} visible={showRCselection} onClose={() => { setShowRCselection(false) }} />

            </SafeAreaView >
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 15,
        paddingTop: 15,
        backgroundColor: '#EDEDED',
    },
    header: {
        backgroundColor: colors.white,
        paddingHorizontal: 16,
        paddingVertical: 20,
        margin: -15,
        marginBottom: 15,
        paddingBottom: 10
    },
    content: {
        flex: 1,
        backgroundColor: "#EDEDED",
        paddingTop: 0,
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        padding: 16,
    },

    lastSavedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
        justifyContent: 'center'
    },
    lastSavedText: {
        fontSize: 11,
        color: colors.textSecondary,
    },
});

export default GroupUpdateScreen;