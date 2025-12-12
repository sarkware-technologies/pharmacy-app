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
import CustomCheckbox from '../../../../components/view/checkbox';
import Button from '../../../../components/Button';

const SearchIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <Circle cx="9" cy="9" r="6" stroke="#999" strokeWidth="1.5" />
        <Path d="M13.5 13.5L17 17" stroke="#999" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
);

const SelectRC = ({ visible, onClose, onSelectCustomer, showContinue = false }) => {
    const [selectedFilters, setSelectedFilters] = useState({
        stateIds: [],
        cityIds: [],
    });
    useEffect(() => {
        if (visible) {
            setHasMore(true)
            setLoading(false)
            setSearchText('');
            setSelectedCustomers([])
            loadCustomers(1, searchText, selectedFilters);
        }
    }, [visible]);
    const [showFilterModal, setShowFilterModal] = useState(false);

    const [selectedCustomers, setSelectedCustomers] = useState([]);

    const toggleCustomerSelection = (customer) => {
        console.log(selectedCustomers, customer)
        const exists = selectedCustomers.find(
            c => c.customerId === customer.customerId
        );

        if (exists) {
            setSelectedCustomers(prev =>
                prev.filter(c => c.customerId !== customer.customerId)
            );
        } else {
            setSelectedCustomers(prev => [...prev, customer]);
        }
    };



    const [customers, setCustomers] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            setPage(1);
            setHasMore(true);
            setCustomers([]);
            loadCustomers(1, searchText, selectedFilters);
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchText]);


    const handleClose = () => {
        setSearchText('');
        onClose?.();
    };

    const handleApplyFilters = (filter) => {
        console.log(filter, 987429387)

        setSelectedFilters({
            stateIds: filter?.state ?? [],
            cityIds: filter?.city ?? [],
        });

        setShowFilterModal(false);
        setPage(1);
        setCustomers([]);
        setHasMore(true);
        loadCustomers(1, searchText, {
            stateIds: filter?.state ?? [],
            cityIds: filter?.city ?? [],
        });
    }


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
                    {/* <StatusBar barStyle="dark-content" backgroundColor="#FFF" /> */}
                    <>
                        {/* Header */}
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
                                <AppText style={styles.title}>Select Customer</AppText>
                            </View>

                            {/* Filter chips */}
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.filterChips}
                            >
                                <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
                                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <Path d="M17.7083 14.0002H7.41246M3.77829 14.0002H2.29163M3.77829 14.0002C3.77829 13.5184 3.96969 13.0563 4.31038 12.7157C4.65107 12.375 5.11315 12.1836 5.59496 12.1836C6.07677 12.1836 6.53885 12.375 6.87954 12.7157C7.22023 13.0563 7.41163 13.5184 7.41163 14.0002C7.41163 14.482 7.22023 14.9441 6.87954 15.2848C6.53885 15.6255 6.07677 15.8169 5.59496 15.8169C5.11315 15.8169 4.65107 15.6255 4.31038 15.2848C3.96969 14.9441 3.77829 14.482 3.77829 14.0002ZM17.7083 19.5061H12.9183M12.9183 19.5061C12.9183 19.988 12.7264 20.4506 12.3857 20.7914C12.0449 21.1321 11.5827 21.3236 11.1008 21.3236C10.619 21.3236 10.1569 21.1313 9.81621 20.7906C9.47552 20.45 9.28413 19.9879 9.28413 19.5061M12.9183 19.5061C12.9183 19.0241 12.7264 18.5624 12.3857 18.2216C12.0449 17.8808 11.5827 17.6894 11.1008 17.6894C10.619 17.6894 10.1569 17.8808 9.81621 18.2215C9.47552 18.5622 9.28413 19.0243 9.28413 19.5061M9.28413 19.5061H2.29163M17.7083 8.4944H15.1208M11.4866 8.4944H2.29163M11.4866 8.4944C11.4866 8.01259 11.678 7.55051 12.0187 7.20982C12.3594 6.86913 12.8215 6.67773 13.3033 6.67773C13.5419 6.67773 13.7781 6.72472 13.9985 6.81602C14.2189 6.90732 14.4192 7.04113 14.5879 7.20982C14.7566 7.37852 14.8904 7.57878 14.9817 7.79919C15.073 8.0196 15.12 8.25583 15.12 8.4944C15.12 8.73297 15.073 8.9692 14.9817 9.18961C14.8904 9.41002 14.7566 9.61028 14.5879 9.77898C14.4192 9.94767 14.2189 10.0815 13.9985 10.1728C13.7781 10.2641 13.5419 10.3111 13.3033 10.3111C12.8215 10.3111 12.3594 10.1197 12.0187 9.77898C11.678 9.43829 11.4866 8.97621 11.4866 8.4944Z" stroke="#2B2B2B" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" />
                                        <Circle cx="17" cy="7" r="6.25" fill="#FF7E00" stroke="white" strokeWidth="1.5" />
                                    </Svg>
                                </TouchableOpacity>

                                {selectedFilters.stateIds && selectedFilters.stateIds.length > 0 && (
                                    <TouchableOpacity style={styles.chip} onPress={() => setShowFilterModal(true)}>
                                        <AppText style={styles.chipText}>{selectedFilters?.stateIds.length} States</AppText>
                                        <Svg width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <Path d="M1.00198 0C0.111077 0 -0.335089 1.07714 0.294875 1.70711L2.88066 4.29289C3.27119 4.68342 3.90435 4.68342 4.29488 4.29289L6.88066 1.70711C7.51063 1.07714 7.06446 0 6.17355 0L1.00198 0Z" fill="#2B2B2B" />
                                        </Svg>
                                    </TouchableOpacity>
                                )}

                                {selectedFilters.cityIds && selectedFilters.cityIds.length > 0 && (
                                    <TouchableOpacity style={styles.chip} onPress={() => setShowFilterModal(true)}>
                                        <AppText style={styles.chipText}>{selectedFilters?.cityIds.length} Cities</AppText>
                                        <Svg width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <Path d="M1.00198 0C0.111077 0 -0.335089 1.07714 0.294875 1.70711L2.88066 4.29289C3.27119 4.68342 3.90435 4.68342 4.29488 4.29289L6.88066 1.70711C7.51063 1.07714 7.06446 0 6.17355 0L1.00198 0Z" fill="#2B2B2B" />
                                        </Svg>

                                    </TouchableOpacity>
                                )}

                            </ScrollView>

                            {/* Search input */}
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

                            {/* Table header */}
                            <View style={styles.tableHeader}>
                                <AppText style={styles.tableHeaderText}>Customer Name & Code</AppText>
                                <AppText style={styles.tableHeaderText}>RC Details</AppText>
                            </View>
                        </View>

                        {/* Customer list */}
                        <FlatList
                            data={customers}
                            keyExtractor={(item, index) => `${item.customerCode}-${index}`}
                            renderItem={({ item, index }) => (
                                <View style={{ paddingLeft: 15, paddingRight: 30 }}>
                                    <CustomCheckbox checkboxStyle={{ marginRight: 1 }} activeColor='#F7941E' key={index + "_checkbox"}
                                        checked={!!selectedCustomers.find(c => c.customerId === item.customerId)}
                                        onChange={() => toggleCustomerSelection(item)}
                                        title={
                                            <View
                                                style={styles.customerRow}
                                            >
                                                <View style={styles.customerInfo}>
                                                    <AppText style={styles.customerName}>{item.customerName}</AppText>
                                                    <AppText style={styles.customerId}>{item.customerCode}</AppText>
                                                </View>

                                                <View style={{ width: "40%", }}>
                                                    <AppText style={styles.customerCity}>{item.cityName}</AppText>
                                                    <AppText style={styles.customerCity}>
                                                        500  |  10/10/2030
                                                    </AppText>
                                                </View>
                                            </View>
                                        } />
                                </View>


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
                        {(showContinue || selectedCustomers.length) ? (
                            <View style={{ padding: 10 }}>
                                <Button onPress={() => {
                                    onSelectCustomer?.(selectedCustomers);
                                    onClose?.();
                                }}>Continue</Button>
                            </View>
                        ) : null}
                    </>

                    <FilterModal
                        visible={showFilterModal}
                        onClose={() => setShowFilterModal(false)}
                        onApply={(e) => { handleApplyFilters(e); }}
                        title='Search by filters'
                        sections={["state", "city"]}
                        selected={{
                            city: selectedFilters?.cityIds,
                            state: selectedFilters?.stateIds,
                        }}
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
        paddingHorizontal: 20,
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
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    customerInfo: {
        flex: 1,
        width: "60%"
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
        fontFamily: Fonts.Regular,
        textAlign: "right"
    },
});

export default SelectRC;