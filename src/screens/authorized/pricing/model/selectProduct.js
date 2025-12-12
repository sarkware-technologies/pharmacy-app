import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    StatusBar,
    StyleSheet,
    Modal,
    TouchableWithoutFeedback,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import FilterModal from '../../../../components/FilterModal';
import { getProducts } from '../../../../api/product';
import { FlatList } from 'react-native-gesture-handler';
import { AppText, AppInput } from "../../../../components"
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../../styles/colors';
import { Fonts } from '../../../../utils/fontHelper';
import SelectDivision from "./selectDivision"
import Button from '../../../../components/Button';
import Downarrow from '../../../../components/icons/downArrow';

const SearchIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <Circle cx="9" cy="9" r="6" stroke="#999" strokeWidth="1.5" />
        <Path d="M13.5 13.5L17 17" stroke="#999" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
);

const SelectProduct = ({ visible, onClose, onSelectProduct, selectedProduct, title = "Select Product", selectProductOld, selectDIV, onRcClick }) => {

    useEffect(() => {
        if (visible) {
            setHasMore(true)
            setLoading(false)
            setPage(1)
            setSearchText('');
            setSelectedDivisions(null);
            loadProducts(1, searchText, selectedDivisions ?? []);
        }
    }, [visible]);
    const [showFilterModal, setShowFilterModal] = useState(false);

    const [selectedDivisions, setSelectedDivisions] = useState(null);


    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            setPage(1);
            setHasMore(true);
            setProducts([]);
            loadProducts(1, searchText, selectedDivisions ?? []);
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchText]);

    useEffect(() => {
        if (selectedDivisions) {
            console.log(2390482938)
            const delayDebounce = setTimeout(() => {
                setPage(1);
                setHasMore(true);
                setProducts([]);
                loadProducts(1, searchText, selectedDivisions ?? []);
            }, 500);

            return () => clearTimeout(delayDebounce);
        }
    }, [selectedDivisions]);

    const handleProductSelect = (product) => {
        onSelectProduct?.(product);
    };

    const handleClose = () => {
        setSearchText('');
        onClose?.();
    };


    const loadProducts = async (currentPage = 1, query = '', divisions = []) => {

        if (loading || !hasMore && currentPage != 1) return;
        setLoading(true);
        try {
            const divisionIds = divisions?.length > 0 ? divisions.map(d => d.divisionId) : undefined;

            const response = await getProducts(
                currentPage,
                40,
                query,
                divisionIds, true
            );

            const newProducts = response?.products || [];
            setProducts(prev => currentPage === 1 ? newProducts : [...prev, ...newProducts]);


            if (newProducts.length == 0) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };



    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={handleClose}
        >
            <TouchableWithoutFeedback onPress={() => { }}>
                <SafeAreaView style={styles.container}>
                    <>
                        <View style={styles.header}>
                            <View style={styles.titleBar}>
                                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                                    <View>
                                        <Svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <Circle cx="11" cy="11" r="10.5" fill="white" stroke="#2B2B2B" />
                                            <Path d="M7.79474 7.79492L14.205 14.2052M7.79474 14.2052L14.205 7.79492" stroke="#2B2B2B" strokeLinecap="round" strokeLinejoin="round" />
                                        </Svg>
                                    </View>
                                </TouchableOpacity>
                                <AppText style={styles.title}>{title}</AppText>
                            </View>
                            {selectProductOld && (
                                <View style={{ backgroundColor: "#f9f9f9", flexDirection: "row", justifyContent: "space-between", marginHorizontal: 20, marginVertical: 10, padding: 10, borderRadius: 10, paddingVertical: 15 }}>
                                    <View style={{ gap: 7, maxWidth: "80%" }}>
                                        <AppText style={styles.secondaryText}>Selected Old Product</AppText>
                                        <AppText style={{ fontSize: 13, fontWeight: 600, color: colors.primaryText }}>{selectProductOld?.productName ?? '-'}</AppText>
                                        <AppText style={styles.secondaryText}>{selectProductOld?.productCode ?? '-'}</AppText>
                                    </View>
                                    <View style={{ gap: 10 }}>
                                        <AppText style={styles.secondaryText}>Division</AppText>
                                        <AppText style={{ fontSize: 13, fontWeight: 600, color: colors.primaryText }}>{selectProductOld?.division?.divisionName ?? '-'}</AppText>
                                    </View>

                                </View>
                            )}
                            <View style={{ paddingHorizontal: 20, paddingVertical: 5 }}>
                                <Button
                                    onPress={() => setShowFilterModal(true)}
                                    style={{ backgroundColor: "white", borderWidth: 0.5, borderColor: "#2B2B2B" }}
                                >
                                    <View style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        width: "100%",
                                        justifyContent: "space-between"
                                    }}>
                                        <AppText>
                                            {!selectedDivisions || selectedDivisions && selectedDivisions.length === 0
                                                ? "Select Division"
                                                : selectedDivisions.length === 1
                                                    ? selectedDivisions[0]?.divisionName
                                                    : `${selectedDivisions.length} Divisions Selected`
                                            }
                                        </AppText>

                                        <AppText><Downarrow /></AppText>
                                    </View>

                                </Button>
                            </View>

                            <View style={styles.searchContainer}>
                                <SearchIcon />
                                <AppInput
                                    style={styles.searchInput}
                                    placeholder="Search by product name/code"
                                    placeholderTextColor="#777777"
                                    value={searchText}
                                    onChangeText={setSearchText}
                                />
                            </View>

                            <View style={styles.tableHeader}>
                                <AppText style={styles.tableHeaderText}>Name & Code</AppText>
                                <AppText style={styles.tableHeaderText}>Division</AppText>
                            </View>
                        </View>

                        <FlatList
                            data={products}
                            keyExtractor={(item, index) => `${item.id || item.productId}-${index}`}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.customerRow, selectedProduct?.productId == item?.productId && styles.customerRowActive]}
                                    onPress={() => handleProductSelect(item)}
                                >
                                    <View style={styles.customerInfo}>
                                        <AppText style={styles.customerName}>{item.productName}</AppText>
                                        <AppText style={styles.customerId}>{item.productCode}</AppText>
                                    </View>
                                    <AppText style={styles.customerCity}>{item?.division?.divisionName || ''}</AppText>
                                </TouchableOpacity>
                            )}
                            onEndReachedThreshold={0.2}
                            onEndReached={() => {
                                if (!loading && hasMore) {
                                    const nextPage = page + 1;
                                    setPage(nextPage);
                                    loadProducts(nextPage, searchText, selectedDivisions ?? []);
                                }
                            }}
                            ListEmptyComponent={() =>
                                !loading ? (
                                    <View style={{ paddingTop: 50, alignItems: "center" }}>
                                        <AppText style={{ fontSize: 16, color: "#999" }}>
                                            No products found
                                        </AppText>
                                    </View>
                                ) : null
                            }

                            ListFooterComponent={() =>
                                loading ? (
                                    <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                                        <AppText style={{ color: '#999' }}>Loading...</AppText>
                                    </View>
                                ) : !hasMore && products.length > 20 ? (
                                    <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                                        <AppText style={{ color: '#999' }}>No more products</AppText>
                                    </View>
                                ) : null
                            }
                        />
                        {selectDIV && (
                            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 15, gap: 15 }}>
                                <Button disabled={!selectedProduct} onPress={() => onRcClick?.("select")} style={{ flex: 1, borderWidth: 1, borderColor: "#F7941E", backgroundColor: "white" }} textStyle={{ color: "#F7941E", fontSize: 14 }}>Select RC’s</Button>
                                <Button disabled={!selectedProduct} onPress={() => onRcClick?.("all")} style={{ flex: 1 }} textStyle={{ fontSize: 14 }}>Update For All RC’s</Button>
                            </View>
                        )}
                    </>
                    <SelectDivision
                        multiSelect={true}
                        visible={showFilterModal}
                        onClose={() => setShowFilterModal(false)}
                        onSelectDivision={setSelectedDivisions}
                        showDone={selectedDivisions && selectedDivisions.length > 0}
                    />
                </SafeAreaView>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    statusBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
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
    titleBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    closeButton: {
        padding: 8,
        marginRight: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: colors.primaryText,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    searchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#FF8C00',
        borderRadius: 15,
        paddingVertical: 16,
        paddingHorizontal: 24,
        gap: 12,
    },
    searchButtonText: {
        fontSize: 16,
        color: '#F7941E',
        fontWeight: '700',
    },
    filterChips: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    filterButton: {
        marginRight: 8,
    },
    filterIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FF8C00',
        alignItems: 'center',
        justifyContent: 'center',
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 6,
        paddingVertical: 8,
        paddingHorizontal: 16,
        gap: 6,
        borderWidth: 0.5,
        borderColor: "#777777"
    },
    chipText: {
        fontSize: 14,
        color: '#333',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginVertical: 12,
        paddingHorizontal: 16,
        paddingVertical: 6,
        backgroundColor: '#F8F8F8',
        borderRadius: 8,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#777777',
        fontFamily: Fonts.Regular
    },
    tableHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FAFAFA',
    },
    tableHeaderText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#777777',
    },
    customerList: {
        flex: 1,
    },
    customerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    customerRowActive: {
        backgroundColor: "#fef4e8",
    },
    customerInfo: {
        flex: 1,
        maxWidth: "80%"
    },
    customerName: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.primaryText,
        marginBottom: 4,
        fontFamily: Fonts.Regular
    },
    customerId: {
        fontSize: 12,
        color: colors.secondaryText,
        fontWeight: '400',

    },
    customerCity: {
        fontSize: 14,
        color: colors.primaryText,
        fontWeight: '400',
        marginBottom: 4,
        fontFamily: Fonts.Regular
    },
    secondaryText: {
        fontSize: 12, fontFamily: Fonts.Regular, color: colors.secondaryText
    }
});

export default SelectProduct;