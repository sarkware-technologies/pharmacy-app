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
import FilterModal from '../../../components/FilterModal';
import { customerAPI } from '../../../api/customer';
import { FlatList } from 'react-native-gesture-handler';
import { AppText, AppInput } from "../../../components"
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../styles/colors';
import { Fonts } from '../../../utils/fontHelper';

// Icon Components
const CloseIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const FilterIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <Path d="M2 5h16M5 10h10M8 15h4" stroke="#FF8C00" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const SearchIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <Circle cx="9" cy="9" r="6" stroke="#999" strokeWidth="1.5" />
    <Path d="M13.5 13.5L17 17" stroke="#999" strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

const CustomerSelectionModal = ({ visible, onClose, onSelectCustomer, showFilter = false }) => {
  const [selectedFilters, setSelectedFilters] = useState({
    stateIds: [],
    cityIds: [],
  });
  useEffect(() => {
    console.log(987987987, Object.values(selectedFilters || {}).every((arr) => !arr || arr.length === 0))
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



  const handleSearchByFilters = () => {
    // setShowCustomerList(true);
    setShowFilterModal(true)
  };

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

  const handleApplyFilters = (filter) => {
    console.log(filter, 987429387)

    setSelectedFilters({
      stateIds: filter?.state ?? [],
      cityIds: filter?.city ?? [],
    });

    setShowFilterModal(false);
    setShowCustomerList(true);
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
        // statusIds: [2],
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
          {/* <StatusBar barStyle="dark-content" backgroundColor="#FFF" /> */}

          {!showCustomerList ? (
            // Initial screen with "Search by filters" button
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
              </View>

              {/* Search by filters button */}
              <View style={styles.content}>
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={handleSearchByFilters}
                >
                  <AppText style={styles.searchButtonText}>Search by filters</AppText>
                  <Svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <Path d="M16.1667 8.0725H5.87083M2.23667 8.0725H0.75M2.23667 8.0725C2.23667 7.59069 2.42806 7.12861 2.76876 6.78792C3.10945 6.44723 3.57152 6.25583 4.05333 6.25583C4.53514 6.25583 4.99722 6.44723 5.33791 6.78792C5.6786 7.12861 5.87 7.59069 5.87 8.0725C5.87 8.55431 5.6786 9.01639 5.33791 9.35708C4.99722 9.69777 4.53514 9.88917 4.05333 9.88917C3.57152 9.88917 3.10945 9.69777 2.76876 9.35708C2.42806 9.01639 2.23667 8.55431 2.23667 8.0725ZM16.1667 13.5783H11.3767M11.3767 13.5783C11.3767 14.0603 11.1848 14.5229 10.844 14.8636C10.5033 15.2044 10.0411 15.3958 9.55917 15.3958C9.07736 15.3958 8.61528 15.2036 8.27459 14.8629C7.9339 14.5222 7.7425 14.0601 7.7425 13.5783M11.3767 13.5783C11.3767 13.0964 11.1848 12.6346 10.844 12.2939C10.5033 11.9531 10.0411 11.7617 9.55917 11.7617C9.07736 11.7617 8.61528 11.9531 8.27459 12.2938C7.9339 12.6344 7.7425 13.0965 7.7425 13.5783M7.7425 13.5783H0.75M16.1667 2.56667H13.5792M9.945 2.56667H0.75M9.945 2.56667C9.945 2.08486 10.1364 1.62278 10.4771 1.28209C10.8178 0.941398 11.2799 0.75 11.7617 0.75C12.0002 0.75 12.2365 0.79699 12.4569 0.888286C12.6773 0.979582 12.8776 1.1134 13.0462 1.28209C13.2149 1.45078 13.3488 1.65105 13.44 1.87146C13.5313 2.09187 13.5783 2.3281 13.5783 2.56667C13.5783 2.80523 13.5313 3.04147 13.44 3.26187C13.3488 3.48228 13.2149 3.68255 13.0462 3.85124C12.8776 4.01994 12.6773 4.15375 12.4569 4.24505C12.2365 4.33634 12.0002 4.38333 11.7617 4.38333C11.2799 4.38333 10.8178 4.19193 10.4771 3.85124C10.1364 3.51055 9.945 3.04848 9.945 2.56667Z" stroke="#F7941E" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" />
                  </Svg>

                </TouchableOpacity>
              </View>
            </>
          ) : (
            // Customer list screen
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
                  {/* {selectedFilters?.contract > 0 && (
                  <TouchableOpacity style={styles.chip} onPress={() => setShowFilterModal(true)}>
                    <AppText style={styles.chipText}>{selectedFilters.contract}-Contract</AppText>
                    <Svg width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <Path d="M1.00198 0C0.111077 0 -0.335089 1.07714 0.294875 1.70711L2.88066 4.29289C3.27119 4.68342 3.90435 4.68342 4.29488 4.29289L6.88066 1.70711C7.51063 1.07714 7.06446 0 6.17355 0L1.00198 0Z" fill="#2B2B2B" />
                    </Svg>

                  </TouchableOpacity>
                )}

                {selectedFilters?.type !== '' && (
                  <TouchableOpacity style={styles.chip} onPress={() => setShowFilterModal(true)}>
                    <AppText style={styles.chipText}>{selectedFilters.type}</AppText>
                    <Svg width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <Path d="M1.00198 0C0.111077 0 -0.335089 1.07714 0.294875 1.70711L2.88066 4.29289C3.27119 4.68342 3.90435 4.68342 4.29488 4.29289L6.88066 1.70711C7.51063 1.07714 7.06446 0 6.17355 0L1.00198 0Z" fill="#2B2B2B" />
                    </Svg>

                  </TouchableOpacity>
                )} */}

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
                  <AppText style={styles.tableHeaderText}>Name</AppText>
                  <AppText style={styles.tableHeaderText}>City</AppText>
                </View>
              </View>

              {/* Customer list */}
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
          )}

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

export default CustomerSelectionModal;