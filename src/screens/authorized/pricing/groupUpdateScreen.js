import React, { useState } from 'react';
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


const GroupUpdateScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { selectProduct, selectProductOld, selectProductNew, selectedCustomers, groupType, rcAction } = route.params || {};

    const [quickApproval, setQuickApproval] = useState(false);
    const TITLE_MAP = {
        addNew: "Add Products",
        productSwapping: "Product Swapping",
        updateDiscount: "Discount Update",
        updateSupply: "Supply Mode Update",
        quotation: "Quotation",
    };

    const title = TITLE_MAP[groupType] || "No page found";



    return (
        <>
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                <View style={styles.header}>
                    <View style={CommonStyle.SpaceBetween}>
                        <View style={[CommonStyle.SpaceBetween]}>
                            <BackButton />
                            <AppText style={CommonStyle.headerTitle}>{title}</AppText>
                            <Button style={{ paddingVertical: 4, paddingHorizontal: 7, backgroundColor: "#f7f1e8", borderRadius: 5 }} >
                                <AppText style={{ fontSize: 12, color: '#AE7017' }}>DRAFT</AppText>
                            </Button>
                        </View>
                        <DownloadArrow />

                    </View>
                    {(groupType == 'productSwapping' || groupType == 'updateDiscount' || groupType == 'updateSupply' || groupType == 'quotation') && (
                        <View style={{ paddingVertical: 15 }}>
                            {groupType == 'productSwapping' && (
                                <View >
                                    <ProductCard type="2" productLabel={"OLD PRODUCT"} />
                                    <View style={{ display: "flex", alignItems: "center", marginVertical: -7 }}>
                                        <SwappingIcon />
                                    </View>
                                    <ProductCard type="2" productLabel={"NEW PRODUCT"} isSpecial={true} />
                                </View>
                            )}
                            {groupType == 'updateDiscount' && (
                                <ProductCard type="2" />

                            )}
                            {(groupType == 'updateSupply' || groupType == 'quotation') && (
                                <ProductCard type="3" />

                            )}
                        </View>
                    )}

                </View>
                {groupType == 'addNew' && (
                    <ProductCard type="1" />
                )}


                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <AppText style={[CommonStyle.primaryText, { fontSize: 16, fontWeight: 700, marginBottom: 7 }]}>RC's</AppText>
                    <SearchBar />
                    <View style={[{ paddingBottom: 10, }, CommonStyle.SpaceBetween]}>
                        <CustomCheckbox activeColor="#F7941E" size={14} title={<AppText style={CommonStyle.primaryText}>All RC’s</AppText>} />
                        <AppText style={{ color: "#F7941E", fontSize: 14 }}>Fetched Fixed Price</AppText>
                    </View>
                    <RcItem type={groupType == 'updateSupply' ? 2 : 1} />
                    <RcItem />
                    <RcItem />
                    <RcItem />
                    <RcItem />

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


                {/* <QuickApproval visible={quickApproval} onClose={() => setQuickApproval(false)} /> */}
                {/* <SuccessModal visible={quickApproval} onClose={() => setQuickApproval(false)} onPress={() => setQuickApproval(false)} /> */}
                {/* <DiscountModal visible={quickApproval} onClose={() => setQuickApproval(false)} onPress={() => setQuickApproval(false)} /> */}
                <LinkDistributorModal visible={quickApproval} onClose={() => setQuickApproval(false)} onPress={() => setQuickApproval(false)} />


            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        paddingTop: 0,
        backgroundColor: '#EDEDED',
    },
    header: {
        backgroundColor: colors.white,
        paddingHorizontal: 16,
        paddingVertical: 20,
        margin: -15,
        marginBottom: 15
    },
    content: {
        flex: 1,
        backgroundColor: "#EDEDED",
        paddingTop: 15
    },
    footer: {
        backgroundColor: colors.white,
        paddingHorizontal: 16,
        paddingVertical: 12,
        margin: -15,
        marginBottom: -40,
        marginTop: 5
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