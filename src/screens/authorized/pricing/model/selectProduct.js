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
import { customerAPI } from '../../../../api/customer';
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

const SelectProduct = ({ visible, onClose, onSelectCustomer, showFilter = false }) => {
    const [selectedFilters, setSelectedFilters] = useState({
        stateIds: [],
        cityIds: [],
    });
    useEffect(() => {
        if (visible) {
            setHasMore(true)
            setLoading(false)
            if (Object.values(selectedFilters || {}).every((arr) => !arr || arr.length === 0)) {
                setShowCustomerList(showFilter);
            }
            else {
                setShowCustomerList(true);
            }
            setSearchText('');
            loadCustomers(1, searchText, selectedFilters);
        }
    }, [visible]);
    const [showCustomerList, setShowCustomerList] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);

    const [selectedDivisions, setSelectedDivisions] = useState([]);


    const [customers, setCustomers] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (showCustomerList) {
                setPage(1);
                setHasMore(true);
                setCustomers([]);
                loadCustomers(1, searchText, selectedFilters);
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchText]);

    const handleCustomerSelect = (customer) => {
        if (onSelectCustomer) {
            onSelectCustomer(customer);
        }
        onClose();
    };

    const handleClose = () => {
        setShowCustomerList(false);
        setSearchText('');
        onClose();
    };


    const loadCustomers = async (currentPage = 1, query = '', filter) => {

        if (loading || !hasMore && currentPage != 1) return;
        setLoading(true);
        try {
            const response = await customerAPI.getCustomersList({
                page: currentPage,
                limit: 20,
                searchText: query,
                statusIds: [7],
                // typeCode: "DOCT"
                ...(filter?.cityIds?.length && { cityIds: filter?.cityIds }), ...(filter?.stateIds?.length && { stateIds: filter?.stateIds })
            });

            const newCustomers = response?.data?.customers || [];
            setCustomers(prev => currentPage === 1 ? newCustomers : [...prev, ...newCustomers]);

            // Handle pagination
            if (newCustomers.length == 0) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

        } catch (error) {
            console.error('Error fetching customers:', error);
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
                                <AppText style={styles.title}>Select Product</AppText>
                            </View>
                            <View style={{ paddingHorizontal: 20, paddingVertical: 5 }}>
                                <Button
                                    onPress={() => setShowFilterModal(true)}
                                    style={{ backgroundColor: "white", borderWidth: 0.5, borderColor: "#2B2B2B" }}
                                    title={
                                        <View style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            width: "100%",
                                            justifyContent: "space-between"
                                        }}>
                                            <AppText>
                                                {selectedDivisions.length === 0
                                                    ? "Select Division"
                                                    : selectedDivisions.length === 1
                                                        ? selectedDivisions[0]?.divisionName
                                                        : `${selectedDivisions.length} Divisions Selected`
                                                } 
                                            </AppText>

                                            <AppText><Downarrow /></AppText>
                                        </View>
                                    }
                                />
                            </View>

                            <View style={styles.searchContainer}>
                                <SearchIcon />
                                <AppInput
                                    style={styles.searchInput}
                                    placeholder="Search by customer name/code"
                                    placeholderTextColor="#777777"
                                    value={searchText}
                                    onChangeText={setSearchText}
                                />
                            </View>

                            <View style={styles.tableHeader}>
                                <AppText style={styles.tableHeaderText}>Name</AppText>
                                <AppText style={styles.tableHeaderText}>City</AppText>
                            </View>
                        </View>

                        <FlatList
                            data={customers}
                            keyExtractor={(item, index) => `${item.customerCode}-${index}`}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.customerRow}
                                    onPress={() => handleCustomerSelect(item)}
                                >
                                    <View style={styles.customerInfo}>
                                        <AppText style={styles.customerName}>{item.customerName}</AppText>
                                        <AppText style={styles.customerId}>{item.customerCode}</AppText>
                                    </View>
                                    <AppText style={styles.customerCity}>{item.cityName}</AppText>
                                </TouchableOpacity>
                            )}
                            onEndReachedThreshold={0.2}
                            onEndReached={() => {
                                if (!loading && hasMore) {
                                    const nextPage = page + 1;
                                    setPage(nextPage);
                                    loadCustomers(nextPage, searchText, selectedFilters);
                                }
                            }}
                            ListEmptyComponent={() =>
                                !loading ? (
                                    <View style={{ paddingTop: 50, alignItems: "center" }}>
                                        <AppText style={{ fontSize: 16, color: "#999" }}>
                                            No customers found
                                        </AppText>
                                    </View>
                                ) : null
                            }

                            ListFooterComponent={() =>
                                loading ? (
                                    <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                                        <AppText style={{ color: '#999' }}>Loading...</AppText>
                                    </View>
                                ) : !hasMore && customers.length > 20 ? (
                                    <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                                        <AppText style={{ color: '#999' }}>No more customers</AppText>
                                    </View>
                                ) : null
                            }
                        />
                    </>
                    <SelectDivision
                        multiSelect={true}
                        visible={showFilterModal}
                        onClose={() => setShowFilterModal(false)}
                        onSelectDivision={setSelectedDivisions}
                        showDone={selectedDivisions.length >0}
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
    customerInfo: {
        flex: 1,
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
});

export default SelectProduct;