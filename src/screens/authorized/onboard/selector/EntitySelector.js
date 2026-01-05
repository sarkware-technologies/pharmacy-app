import { useMemo, useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    StatusBar,
    Animated,
    FlatList,
    ActivityIndicator,
    Pressable,
} from 'react-native';
import { buildEntityPayload } from '../utils/buildEntityPayload'
import { colors } from '../../../../styles/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { customerAPI } from '../../../../api/customer';
import PhamacySearchNotFound from '../../../../components/icons/PhamacySearchNotFound';
import { AppText, AppInput } from "../../../../components"

const EntitySelector = ({ title, entityType, formData, onSelect, onClose, parentHospitalId = null, enableLocationFilter = true, allowMultiple = true }) => {

    const lastRequestedPageRef = useRef(1);
    const [searchText, setSearchText] = useState('');
    const [entitiesData, setEntitiesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadMore, setIsLoadMore] = useState(false);
    const [selectedItems, setSelectedItems] = useState(
        formData?.mapping?.entities?.[entityType] || []
    ); const [showStateDropdown, setShowStateDropdown] = useState(false);
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [statesList, setStatesList] = useState([]);
    const [citiesList, setCitiesList] = useState([]);
    const [statesLoading, setStatesLoading] = useState(false);
    const [citiesLoading, setCitiesLoading] = useState(false);

    const [selectedStates, setSelectedStates] = useState(() =>
        formData?.stateId
            ? [{ id: Number(stateId) }]
            : []
    );
    const [selectedCities, setSelectedCities] = useState(() =>
        formData?.cityId
            ? [{ id: Number(cityId) }]
            : []
    );


    const payload = useMemo(() => {
        return buildEntityPayload({
            selector: title,
            formData,
            page: 1,
            limit: 20,
            enableLocationFilter: enableLocationFilter
        });
    }, [title, formData]);

    const fetchEntities = async (pageNumber = 1, loadMore = false) => {
        try {
            loadMore ? setIsLoadMore(true) : setLoading(true);
            setError(null);

            const finalPayload = {
                ...payload,
                ...(enableLocationFilter && selectedStates.length
                    ? { stateIds: selectedStates.map(s => Number(s.id)) }
                    : {}),

                ...(enableLocationFilter && selectedCities.length
                    ? { cityIds: selectedCities.map(c => Number(c.id)) }
                    : {}),

                ...(searchText && { searchText }),
                page: pageNumber,
            };

            console.log('FINAL PAYLOAD 👉', finalPayload);

            const res = await customerAPI.getCustomersListMapping(finalPayload);
            const customers = res?.customers || [];

            console.log(res);


            const mapped = customers.map(c => ({
                id: c.customerId,
                name: c.customerName,
                code: c.customerCode || c.sapCode || c.customerId,
                city: c.cityName || 'N/A',
            }));

            setEntitiesData(prev =>
                pageNumber === 1 ? mapped : [...prev, ...mapped]
            );

            setHasMore(customers.length === 20);
            setPage(pageNumber);
        } catch (e) {
            setError(e.message || 'Failed to load');
        } finally {
            setLoading(false);
            setIsLoadMore(false);
        }
    };



    useEffect(() => {
        // Debounce the API call to avoid too many requests
        setPage(1);
        setHasMore(true);
        const timer = setTimeout(() => {
            fetchEntities(1);
        }, 300);

        return () => clearTimeout(timer);
    }, [selectedStates, selectedCities, searchText]);


    useEffect(() => {
        if (!enableLocationFilter) return;

        fetchStates();
        fetchCities();
    }, [enableLocationFilter]);



    const loadMoreEntities = () => {
        if (loading || isLoadMore || !hasMore) return;

        const nextPage = page + 1;

        // 🚫 Prevent duplicate calls for same page
        if (lastRequestedPageRef.current === nextPage) {
            return;
        }

        lastRequestedPageRef.current = nextPage;
        fetchEntities(nextPage, true);
    };

    const renderEntitiesData = ({ item }) => {
        const isSelected = selectedItems.some(entity => entity.id === item.id);

        return (
            <TouchableOpacity
                style={styles.entityItem}
                onPress={() => handleToggleEnity(item)}
                activeOpacity={0.7}
            >
                <View style={styles.checkboxContainer}>
                    {!allowMultiple ? (
                        // 🔘 RADIO
                       <View
                                     style={[
                                       styles.radioCircle,
                                       isSelected && styles.radioCircleSelected,
                                     ]}
                                   >
                                     {isSelected && <View style={styles.radioInner} />}
                                   </View>
                    ) : (
                        // ☑️ CHECKBOX
                        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                            {isSelected && <Icon name="check" size={16} color="#fff" />}
                        </View>
                    )}
                </View>

                <View style={styles.entityInfo}>
                    <AppText style={styles.entityName}>{item.name}</AppText>
                    <View style={styles.entityDetails}>
                        <AppText style={styles.entityCode}>{item.code}</AppText>
                        <AppText style={styles.entitySpeciality}>{item.speciality}</AppText>
                    </View>
                    <AppText style={styles.entityContact}>{item.mobile}</AppText>
                </View>

                <AppText style={styles.entityCity}>{item.city}</AppText>
            </TouchableOpacity>
        );
    };


    const handleStateToggle = (state) => {
        const isSelected = selectedStates.some(s => s.id === state.id);
        if (isSelected) {
            setSelectedStates(selectedStates.filter(s => s.id !== state.id));
        } else {
            setSelectedStates([...selectedStates, state]);
        }
    };

    const handleCityToggle = (city) => {
        const isSelected = selectedCities.some(c => c.id === city.id);
        if (isSelected) {
            setSelectedCities(selectedCities.filter(c => c.id !== city.id));
        } else {
            setSelectedCities([...selectedCities, city]);
        }
    };


    const MAX_SELECTION = 4;

    const handleToggleEnity = (entity) => {
        setSelectedItems(prevItems => {
            const isSelected = prevItems.some(item => item.id === entity.id);

            // 🔘 SINGLE SELECT (default)
            if (!allowMultiple) {
                if (isSelected) return prevItems;

                return [
                    {
                        ...entity,
                        isNew: false,
                    },
                ];
            }

            // ☑️ MULTI SELECT
            if (isSelected) {
                return prevItems.filter(item => item.id !== entity.id);
            }

            if (prevItems.length >= MAX_SELECTION) {
                return prevItems;
            }

            return [
                ...prevItems,
                {
                    ...entity,
                    isNew: false,
                },
            ];
        });
    };



    const fetchStates = async () => {
        try {
            setStatesLoading(true)
            const response = await customerAPI.getStatesList(1, 20);

            if (response?.data?.states && Array.isArray(response.data.states)) {
                // Transform state response
                const transformedStates = response.data.states.map(state => ({
                    id: state.id,
                    name: state.stateName,
                }));
                setStatesList(transformedStates);
            } else {
                setStatesList([]);
            }
        } catch (err) {
            setStatesList([]);
        } finally {
            setStatesLoading(false)
        }
    };



    const fetchCities = async () => {
        try {
            setCitiesLoading(true)
            const response = await customerAPI.getCities();

            if (response?.data?.cities && Array.isArray(response.data.cities)) {
                // Transform state response
                const transformedCities = response.data.cities.map(city => ({
                    id: city.id,
                    name: city.cityName,
                }));


                setCitiesList(transformedCities);
            } else {
                setCitiesList([]);
            }
        } catch (err) {
            setCitiesList([]);
        } finally {
            setCitiesLoading(false)
        }
    };
    const handleContinue = () => {
        if (onSelect) {
            console.log(entityType);
            console.log(selectedItems);


            onSelect(entityType, selectedItems, parentHospitalId);
        }
    };



    return (
        <SafeAreaView style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => onClose(null)}
                    style={styles.closeButton}
                >
                    <Icon name="close" size={24} color="#333" />
                </TouchableOpacity>
                <AppText style={styles.headerTitle}>Select {title}</AppText>
            </View>


            {enableLocationFilter && (
                <>
                    {/* Filter buttons */}
                    <View style={styles.filterContainer}>
                        <TouchableOpacity
                            style={styles.filterDropdown}
                            onPress={() => setShowStateDropdown(!showStateDropdown)}
                        >
                            <AppText style={styles.filterDropdownText}>
                                {selectedStates.length
                                    ? `${selectedStates.length} State`
                                    : 'Select State'}
                            </AppText>
                            <Icon
                                name={showStateDropdown ? 'keyboard-arrow-down' : 'keyboard-arrow-down'}
                                size={16}
                                color="#666"
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.filterDropdown}
                            onPress={() => setShowCityDropdown(!showCityDropdown)}
                        >
                            <AppText style={styles.filterDropdownText}>
                                {selectedCities.length
                                    ? `${selectedCities.length} City`
                                    : 'Select City'}
                            </AppText>
                            <Icon
                                name={showStateDropdown ? 'keyboar-arrow-up' : 'keyboard-arrow-down'}
                                size={16}
                                color="#666"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Overlay */}
                    {(showStateDropdown || showCityDropdown) && (
                        <Pressable
                            style={styles.overlay}
                            onPress={() => {
                                setShowStateDropdown(false);
                                setShowCityDropdown(false);
                            }}
                        />
                    )}

                    {/* State Dropdown */}
                    {showStateDropdown && (
                        <View style={[styles.dropdownMenu, styles.stateDropdownMenu]}>
                            {statesLoading ? (
                                <View style={styles.dropdownLoading}>
                                    <ActivityIndicator size="small" color={colors.primary} />
                                </View>
                            ) : statesList.length > 0 ? (
                                <ScrollView style={styles.dropdownScroll}>
                                    {statesList.map(state => {
                                        const isSelected = selectedStates.some(s => s.id === state.id);
                                        return (
                                            <TouchableOpacity
                                                key={state.id}
                                                style={styles.dropdownItem}
                                                onPress={() => handleStateToggle(state)}
                                            >
                                                <View
                                                    style={[
                                                        styles.checkboxSmall,
                                                        isSelected && styles.checkboxSmallSelected,
                                                    ]}
                                                >
                                                    {isSelected && (
                                                        <Icon name="check" size={14} color="#fff" />
                                                    )}
                                                </View>
                                                <AppText style={styles.dropdownItemText}>
                                                    {state.name}
                                                </AppText>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            ) : (
                                <View style={styles.dropdownEmptyContainer}>
                                    <AppText style={styles.dropdownEmptyText}>
                                        No states available
                                    </AppText>
                                </View>
                            )}
                        </View>
                    )}

                    {/* City Dropdown */}
                    {showCityDropdown && (
                        <View style={[styles.dropdownMenu, styles.cityDropdownMenu]}>
                            {citiesLoading ? (
                                <View style={styles.dropdownLoading}>
                                    <ActivityIndicator size="small" color={colors.primary} />
                                </View>
                            ) : citiesList.length > 0 ? (
                                <ScrollView style={styles.dropdownScroll}>
                                    {citiesList.map(city => {
                                        const isSelected = selectedCities.some(c => c.id === city.id);
                                        return (
                                            <TouchableOpacity
                                                key={city.id}
                                                style={styles.dropdownItem}
                                                onPress={() => handleCityToggle(city)}
                                            >
                                                <View
                                                    style={[
                                                        styles.checkboxSmall,
                                                        isSelected && styles.checkboxSmallSelected,
                                                    ]}
                                                >
                                                    {isSelected && (
                                                        <Icon name="check" size={14} color="#fff" />
                                                    )}
                                                </View>
                                                <AppText style={styles.dropdownItemText}>
                                                    {city.name}
                                                </AppText>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            ) : (
                                <View style={styles.dropdownEmptyContainer}>
                                    <AppText style={styles.dropdownEmptyText}>
                                        No cities available
                                    </AppText>
                                </View>
                            )}
                        </View>
                    )}
                </>
            )}




            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
                <AppInput
                    style={styles.searchInput}
                    placeholder="Search by entity name/code"
                    value={searchText}
                    onChangeText={setSearchText}
                    // onSubmitEditing={handleSearch}
                    placeholderTextColor="#777777"
                />

                <TouchableOpacity onPress={() => setSearchText('')}>
                    <Icon name="close" size={15} color="#999" style={styles.closeIcon} />
                </TouchableOpacity>
            </View>

            {/* Header Row */}
            {!loading && !error && entitiesData.length > 0 && (
                <View style={styles.headerRow}>
                    <View style={styles.headerRadioSpace} />
                    <AppText style={styles.headerText}>Name</AppText>
                    <AppText style={styles.headerCityText}>City</AppText>
                </View>
            )}

            {/* Entity List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <AppText style={styles.loadingText}>Loading entitys...</AppText>
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Icon name="alert-circle" size={40} color="#EF4444" />
                    <AppText style={styles.errorText}>Error loading entitys</AppText>
                    <AppText style={styles.errorSubText}>{error}</AppText>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={fetchEntities}
                    >
                        <AppText style={styles.retryButtonText}>Retry</AppText>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={entitiesData}
                    renderItem={renderEntitiesData}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={[
                        styles.listContent,
                        entitiesData.length === 0 && styles.emptyListContent,
                    ]}
                    showsVerticalScrollIndicator={false}

                    // 🔽 LOAD MORE
                    onEndReached={loadMoreEntities}
                    onEndReachedThreshold={0.4}

                    // 🔄 FOOTER LOADER
                    ListFooterComponent={
                        isLoadMore ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                        ) : null
                    }

                    // 🚫 EMPTY STATE (ONLY WHEN NOT LOADING)
                    ListEmptyComponent={
                        !loading && !isLoadMore ? (
                            <View style={styles.emptyContainer}>
                                <PhamacySearchNotFound width={40} height={40} color="#999" />
                                <AppText style={styles.emptyTitle}>{title} Not Found</AppText>
                                <AppText style={styles.emptySubtitle}>
                                    {title} not found. You can add a new {title} to continue
                                </AppText>
                                <TouchableOpacity
                                    style={styles.addNewPharmacyButtonEmpty}
                                // onPress={handleAddNewDoctor}
                                >
                                    <AppText style={styles.addNewPharmacyTextEmpty}>
                                        +Add New Doctor
                                    </AppText>
                                </TouchableOpacity>
                            </View>
                        ) : null
                    }
                />

            )}

            {/* Bottom Button */}
            {selectedItems.length > 0 && (
                <View style={styles.bottomContainer}>
                    <TouchableOpacity
                        style={styles.continueButton}
                        onPress={handleContinue}
                    >
                        <AppText style={styles.continueButtonText}>
                            Continue ({selectedItems.length} selected)
                        </AppText>
                    </TouchableOpacity>
                </View>
            )}
            {/* <AddNewDoctorModal
                visible={showAddDoctorModal}
                onClose={() => setShowAddDoctorModal(false)}
                onSubmit={handleDoctorSubmit}
            /> */}
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
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    closeButton: {
        padding: 4,
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9998,
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        gap: 12,
        zIndex: 100,
    },
    filterDropdown: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#999',
    },
    filterDropdownText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
        flex: 1,
    },
    dropdownMenu: {
        position: 'absolute',
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        maxHeight: 250,
        zIndex: 9999,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 20,
    },
    stateDropdownMenu: {
        top: 100,
        left: 16,
        right: 'auto',
        width: '45%',
    },
    cityDropdownMenu: {
        top: 100,
        right: 16,
        left: 'auto',
        width: '45%',
    },
    dropdownScroll: {
        maxHeight: 250,
    },
    dropdownLoading: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    checkboxSmall: {
        width: 18,
        height: 18,
        borderRadius: 3,
        borderWidth: 1.5,
        borderColor: '#DDD',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        backgroundColor: '#fff',
    },
    checkboxSmallSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    dropdownItemText: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    dropdownEmptyContainer: {
        paddingVertical: 20,
        paddingHorizontal: 12,
        alignItems: 'center',
    },
    dropdownEmptyText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',

        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: '#F8F8F8',
        marginHorizontal: 16,
        marginVertical: 12,
        borderRadius: 8,

    },
    searchIcon: {
        marginRight: 12,
    },
    closeIcon: {

        backgroundColor: '#EDEDED',
        borderRadius: 50,
        padding: 2
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    listContent: {
        paddingBottom: 100,
    },
    entityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    checkboxContainer: {
        marginRight: 12,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#DDD',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    entityInfo: {
        flex: 1,
    },
    entityName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    entityDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 8,
    },
    entityCode: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    entitySpeciality: {
        fontSize: 12,
        color: '#999',
    },
    entityContact: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    entityCity: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 14,
        color: '#666',
        marginTop: 12,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    errorText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#EF4444',
        marginTop: 12,
    },
    errorSubText: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 16,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: colors.primary,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },

    emptyText: {
        fontSize: 16,
        color: '#666',
        marginTop: 12,
    },
    noResultsContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    noResultsTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginTop: 16,
        marginBottom: 12,
    },
    noResultsText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    addNewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: 24,
    },
    addNewButtonText: {
        fontSize: 16,
        color: colors.primary,
        fontWeight: '500',
        marginLeft: 8,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    continueButton: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    continueButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#333',
        marginTop: 24,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 20,
    },
    addNewPharmacyButtonEmpty: {
        marginTop: 24,
        paddingVertical: 14,
        paddingHorizontal: 32,
        backgroundColor: '#fff',
        borderRadius: 24,
        borderWidth: 1.5,
        borderColor: colors.primary,
    },
    addNewPharmacyTextEmpty: {
        fontSize: 16,
        color: colors.primary,
        fontWeight: '600',
    },


    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#F8F8F8',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerRadioSpace: {
        width: 34,
        marginRight: 12,
    },
    headerText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#999',
    },
    headerCityText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#999',
        marginRight: 4,
    },
    optionalText: {
        fontSize: 18,
        fontWeight: '400',
        color: '#999',
    },
      radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#DDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
    radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
});

export default EntitySelector;