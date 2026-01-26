import { useMemo, useState, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { buildEntityPayload } from '../utils/buildEntityPayload'
import { colors } from '../../../../styles/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { customerAPI } from '../../../../api/customer';
import PhamacySearchNotFound from '../../../../components/icons/PhamacySearchNotFound';
import { AppText, AppInput } from "../../../../components"
import FilterModal from '../../../../components/FilterModal';
import FilterFilled from "../../../../components/icons/FilterFilled"
import XCircle from '../../../../components/icons/XCircle';
import Svg, { Path } from 'react-native-svg';

const EntitySelector = ({ title, entityType, formData, onSelect, onClose, parentHospitalId = null, enableLocationFilter = true, allowMultiple = true, maxSelection, onAddNew }) => {


    const [filterSections, setFilterSections] = useState([]);
    const lastRequestedPageRef = useRef(1);
    const [searchText, setSearchText] = useState('');
    const [entitiesData, setEntitiesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadMore, setIsLoadMore] = useState(false);
    const [selectedItems, setSelectedItems] = useState(() => {
        // CASE 1: Pharmacy inside Hospital
        if (parentHospitalId && entityType === 'pharmacy') {
            const hospital = formData?.mapping?.hospitals?.find(
                h => h.id == parentHospitalId
            );

            return (hospital?.pharmacy || []).map(item => ({
                ...item,
                isActive: item?.isActive ?? true,
            }));
        }

        // CASE 2: Normal flow
        return (formData?.mapping?.[entityType] || []).map(item => ({
            ...item,
            isActive: item?.isActive ?? true,
        }));
    });
    const activeItems = selectedItems.filter(item => item?.isActive);
    const [selectedStates, setSelectedStates] = useState(
        formData?.generalDetails?.stateId ? [{ id: Number(formData.generalDetails?.stateId) }] : []
    );
    const [selectedCities, setSelectedCities] = useState(() =>
        formData?.generalDetails?.cityId
            ? [{ id: Number(formData.generalDetails?.cityId) }]
            : []
    );

    const payload = useMemo(() => {
        return buildEntityPayload({
            typeId: formData?.typeId,
            categoryId: formData?.categoryId,
            subCategoryId: formData?.subCategoryId,
            entity: entityType,
            customerGroupId: formData?.customerGroupId,
            page: 1,
            limit: 20,
        });
    }, [formData, entityType]);

    useEffect(() => {
        // Debounce the API call to avoid too many requests
        setPage(1);
        setHasMore(true);
        const timer = setTimeout(() => {
            fetchEntities(1);
        }, 300);

        return () => clearTimeout(timer);
    }, [selectedStates, selectedCities, searchText]);

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

            const res = await customerAPI.getCustomersListMapping(finalPayload);
            const customers = res?.customers || [];

            const mapped = customers.map(c => ({
                id: c.stgCustomerId ?? c.customerId,
                customerName: c.customerName,
                cityName: c.cityName || 'N/A',
                isNew: !!c.stgCustomerId,
                allMandatoryDocsUploaded: c.allMandatoryDocsUploaded,

                ...(Array.isArray(c.pharmacy) && c.pharmacy.length
                    ? {
                        pharmacy: c.pharmacy.map(p => ({
                            id: p.stgCustomerId ?? p.customerId,
                            customerName: p.customerName,
                            cityName: p.cityName || 'N/A',
                            isNew: !!p.stgCustomerId,
                            allMandatoryDocsUploaded: p.allMandatoryDocsUploaded,
                        })),
                    }
                    : {}),
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


    const renderEntitiesData = ({ item }) => {
        const isSelected = selectedItems.some(
            entity => entity?.id == item?.id && entity?.isActive
        );
        return (
            <TouchableOpacity
                style={styles.entityItem}
                onPress={() => handleToggleEnity(item)}
                activeOpacity={0.7}
            >
                <View style={styles.checkboxContainer}>
                    {!allowMultiple ? (

                        <View
                            style={[
                                styles.radioCircle,
                                isSelected && styles.radioCircleSelected,
                            ]}
                        >
                            {isSelected && <View style={styles.radioInner} />}
                        </View>
                    ) : (

                        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                            {isSelected && <Icon name="check" size={16} color="#fff" />}
                        </View>
                    )}
                </View>

                <View style={styles.entityInfo}>
                    <AppText style={styles.entityName}>{item.customerName}</AppText>

                    {item?.customerCode &&
                        <View style={styles.entityDetails}>
                            <AppText style={styles.entityCode}>{item.customerCode}</AppText>
                        </View>
                    }

                </View>

                <AppText style={styles.entityCity}>{item.cityName}</AppText>
            </TouchableOpacity>
        );
    };

    const handleToggleEnity = (entity) => {
        setSelectedItems(prevItems => {
            const isSelected = prevItems.some(
                item => item?.id == entity?.id && item?.isActive
            );
            if (!allowMultiple) {
                return [
                    {
                        ...entity,
                        isActive: true
                    },
                ];
            }

            if (isSelected) {
                return prevItems.map(item =>
                    item?.id == entity?.id
                        ? { ...item, isActive: false }
                        : item
                );
            }

            const activeCount = prevItems.filter(item => item?.isActive).length;


            if (maxSelection && activeCount >= maxSelection) {
                return prevItems;
            }



            return [
                ...prevItems,
                {
                    ...entity,
                    isActive: true,
                },
            ];
        });
    };

    const handleContinue = () => {
        if (onSelect) {
            onSelect(entityType, selectedItems, parentHospitalId, allowMultiple);
        }
    };

    const handleReset = () => {
        setSelectedItems([])
    };

    return (
        <SafeAreaView style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => onClose(null)}
                    style={styles.closeButton}
                >
                    <XCircle color="#2b2b2b" />
                </TouchableOpacity>
                <AppText style={styles.headerTitle}>Select {title} <AppText style={styles.optionalText}>{maxSelection && <>(Max {maxSelection})</>}</AppText></AppText>

            </View>
            {enableLocationFilter && (
                <>
                    {/* Filter buttons */}
                    <View style={styles.filterContainer}>
                        {/* Filter Icon */}
                        <TouchableOpacity onPress={() => setFilterSections(["state", "city"])}
                            activeOpacity={0.8}>
                            <FilterFilled />

                        </TouchableOpacity>

                        {/* State Dropdown */}
                        <TouchableOpacity
                            style={styles.filterPill}
                            onPress={() => setFilterSections(["state", "city"])}
                            activeOpacity={0.8}
                        >
                            <AppText style={styles.filterText}>
                                {selectedStates.length
                                    ? `${selectedStates.length} States`
                                    : 'State'}
                            </AppText>
                            <Svg width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <Path d="M1.00198 0C0.111077 0 -0.335089 1.07714 0.294875 1.70711L2.88066 4.29289C3.27119 4.68342 3.90435 4.68342 4.29488 4.29289L6.88066 1.70711C7.51063 1.07714 7.06446 0 6.17355 0L1.00198 0Z" fill="#2B2B2B" />
                            </Svg>
                        </TouchableOpacity>

                        {/* City Dropdown */}
                        <TouchableOpacity
                            style={styles.filterPill}
                            onPress={() => setFilterSections(["city", "state"])}
                            activeOpacity={0.8}
                        >
                            <AppText style={styles.filterText}>
                                {selectedCities.length
                                    ? `${selectedCities.length} Cities`
                                    : 'City'}
                            </AppText>
                            <Svg width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <Path d="M1.00198 0C0.111077 0 -0.335089 1.07714 0.294875 1.70711L2.88066 4.29289C3.27119 4.68342 3.90435 4.68342 4.29488 4.29289L6.88066 1.70711C7.51063 1.07714 7.06446 0 6.17355 0L1.00198 0Z" fill="#2B2B2B" />
                            </Svg>
                        </TouchableOpacity>
                    </View>



                </>
            )}


            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
                <AppInput
                    style={styles.searchInput}
                    placeholder={`Search by ${title} name/code`}

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
                    keyExtractor={(item, index) => {
                        if (item?.stgCustomerId) {
                            return `stg-${item.stgCustomerId}`;
                        }

                        if (item?.customerId) {
                            return `main-${item.customerId}`;
                        }

                        // absolute fallback (should never hit, but prevents crash)
                        return `row-${index}`;
                    }}
                    contentContainerStyle={[styles.listContent]}
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

                                    {entityType != "groupHospitals" ? <>
                                        {title} not found. You can add a new {title} to continue
                                    </> : <>
                                        Hospital not found. You can add group hospital to continue. Else try to search different hospital
                                    </>}

                                </AppText>
                                <TouchableOpacity
                                    style={styles.addNewPharmacyButtonEmpty}
                                    onPress={() => {
                                        onAddNew?.(entityType, parentHospitalId);
                                        onClose?.()
                                    }}
                                >
                                    <AppText style={styles.addNewPharmacyTextEmpty}>
                                        +Add New {entityType != "groupHospitals" ? <>
                                            {title}
                                        </> : <>
                                            Group Hospital
                                        </>}
                                    </AppText>
                                </TouchableOpacity>
                            </View>
                        ) : null
                    }
                />

            )}

            {/* Bottom Button */}

            {entitiesData.length > 0 && <View style={styles.bottomContainer}>
                <View style={styles.bottomRow}>

                    {parentHospitalId && <TouchableOpacity
                        style={styles.resetButton}
                        onPress={() => {
                            onAddNew?.(entityType, parentHospitalId);
                            onClose?.()
                        }}
                    >
                        <AppText style={styles.resetButtonText}>
                            +Add New Pharmacy
                        </AppText>
                    </TouchableOpacity>

                    }
                    {activeItems.length > 0 && (
                        <>

                            {!parentHospitalId && <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                                <AppText style={styles.resetButtonText}>Reset</AppText>
                            </TouchableOpacity>
                            }



                            <TouchableOpacity
                                style={styles.continueButton}
                                onPress={handleContinue}
                            >
                                <AppText style={styles.continueButtonText}>
                                    Continue ({activeItems.length} selected)
                                </AppText>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>}





            <FilterModal visible={filterSections.length > 0}
                sections={filterSections}
                onClose={() => setFilterSections([])}
                selected={{
                    state: selectedStates.map(item => String(item.id)),
                    city: selectedCities.map(item => String(item.id)),
                }}
                onApply={(filters) => {
                    setSelectedStates(
                        (filters.state || []).map(id => ({ id: Number(id) }))
                    );

                    setSelectedCities(
                        (filters.city || []).map(id => ({ id: Number(id) }))
                    );

                    setFilterSections([]);
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

    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 6,
        backgroundColor: '#f8f8f8',
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
        fontSize: 15,
        color: '#777',
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
        backgroundColor: '#fbfbfb',
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
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 8,
        paddingTop: 20,
        gap: 10,
    },


    filterPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 40,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#DDD',
        backgroundColor: '#FFF',
        gap: 6,
    },

    filterText: {
        fontSize: 14,
        color: '#222',
        fontWeight: '500',
    },


    continueButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },


    resetButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#E58A28', // orange text
    },


    continueButton: {
        flex: 1,
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },

    resetButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E58A28',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },

    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,          // spacing handled here
    },


});

export default EntitySelector;