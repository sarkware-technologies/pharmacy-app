/** FULL WORKING FILTER MODAL WITH BACKEND CITY FILTERING **/

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Keyboard,
  StyleSheet,
} from 'react-native';

import { useSelector, useDispatch } from 'react-redux';
import apiClient from '../api/apiClient';
import { customerAPI } from '../api/customer';
import { AppText, AppInput } from ".";
import CloseCircle from './icons/CloseCircle';
import ModalClose from './icons/modalClose';

import {
  selectCustomerTypes,
  selectCustomerStatuses,
  fetchCustomerTypes,
  fetchCustomerStatuses,
} from '../redux/slices/customerSlice';

import { SafeAreaView } from 'react-native-safe-area-context';
import CustomCheckbox from './view/checkbox';
import { Fonts } from '../utils/fontHelper';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../styles/colors';

const { height } = Dimensions.get('window');

const FilterModal = ({
  title = "Filters",
  visible,
  onClose,
  onApply,
  sections = ["customerGroup", "status", "category", "state", "city"],
  searchable = ["state", "city"],
  selected = {
    customerGroup: [],
    status: [],
    category: [],
    state: [],
    city: [],
  },
}) => {


  const dispatch = useDispatch();

  const customerTypes = useSelector(selectCustomerTypes) || [];
  const customerStatuses = useSelector(selectCustomerStatuses) || [];

  // Customer groups from API (for customerGroup filter)
  const [customerGroups, setCustomerGroups] = useState([]);
  const [loadingCustomerGroups, setLoadingCustomerGroups] = useState(false);

  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [activeSection, setActiveSection] = useState(sections && sections.length ? sections[0] : '');
  const [searchQuery, setSearchQuery] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const [filters, setFilters] = useState({
    customerGroup: selected?.customerGroup ?? [],
    status: selected?.status ?? [],
    category: selected?.category ?? [],
    state: selected?.state ?? [],
    city: selected?.city ?? [],
  });
  useEffect(() => {
    if (selected?.customerGroup?.length || selected?.status?.length || selected?.category?.length || selected?.state?.length || selected?.city?.length)
      setFilters({
        customerGroup: selected.customerGroup ?? [],
        status: selected.status ?? [],
        category: selected.category ?? [],
        state: selected.state ?? [],
        city: selected.city ?? [],
      });
  }, [selected]);


  const [states, setStates] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);

  /** FETCH STATES */
  const fetchStates = async () => {
    try {
      const res = await apiClient.get('/user-management/states?page=1&limit=50');
      if (res.data?.states) setStates(res.data.states);
    } catch (err) {
      console.error("States fetch error", err);
    }
  };

  /** FETCH CITIES BASED ON STATE IDs */
  const fetchCitiesByStates = async (stateIds) => {
    try {
      const res = await apiClient.get(
        `/user-management/cities?page=1&limit=500&stateIds=${stateIds.join(",")}`
      );
      if (res.data?.cities) setAvailableCities(res.data.cities);
    } catch (err) {
      console.error("City fetch error", err);
    }
  };


  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);


  /** FETCH CUSTOMER GROUPS FROM API */
  const fetchCustomerGroups = async () => {
    setLoadingCustomerGroups(true);
    try {
      const response = await customerAPI.getCustomerGroups();
      if (response.success && response.data) {
        setCustomerGroups(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching customer groups:', error);
    } finally {
      setLoadingCustomerGroups(false);
    }
  };

  /** INITIAL FETCH */
  useEffect(() => {
    dispatch(fetchCustomerTypes());
    dispatch(fetchCustomerStatuses());
    fetchStates();
    fetchCustomerGroups();
  }, [dispatch]);

  /** FETCH CITIES WHEN STATE CHANGES */
  useEffect(() => {
    if (filters.state.length > 0) {
      fetchCitiesByStates(filters.state);
    } else {
      setAvailableCities([]);
      setFilters(prev => ({ ...prev, city: [] }));
    }
  }, [filters.state]);

  /** OPEN & CLOSE ANIMATION */
  useEffect(() => {
    setActiveSection(sections && sections.length ? sections[0] : '')
    if (visible) {
      slideAnim.setValue(height);
      fadeAnim.setValue(0);

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      setSearchQuery('');
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(onClose);
  };

  /** FILTER DATA PROVIDER */
  const getFilterData = () => {
    switch (activeSection) {
      case 'customerGroup':
        return ['All', ...customerGroups.map(g => ({
          id: g?.customerGroupId,
          name: g.customerGroupName || g.name
        }))];

      case 'status':
        return ['All', ...customerStatuses.map(s => ({
          id: s?.id,
          name: s?.name
        }))];

      case 'category':
        return ['All', ...customerTypes.map(t => ({
          id: t?.code,
          name: t?.name
        }))];

      case 'state':
        return ['All', ...states.map(s => ({
          id: s.id,
          name: s.stateName
        }))];

      case 'city':
        return ['All', ...availableCities.map(c => ({
          id: c.id,
          name: c.cityName
        }))];

      default:
        return [];
    }
  };


  const rawList = getFilterData();

  const filteredData = rawList.filter(item => {
    const name = typeof item === "string" ? item : item.name;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const toggleFilter = (type, value) => {
    const optionValue = typeof value === "string" ? value : value.id;

    if (value === "All") {
      setFilters(prev => {
        if (type === "state") {
          const all = states.map(s => s.id);
          return { ...prev, state: prev.state.length === all.length ? [] : all };
        }

        if (type === "city") {
          const all = availableCities.map(c => c.id);
          return { ...prev, city: prev.city.length === all.length ? [] : all };
        }

        if (type === "customerGroup") {
          const all = customerGroups.map(g => g.customerGroupId);
          return { ...prev, customerGroup: prev.customerGroup.length === all.length ? [] : all };
        }

        if (type === "category") {
          const all = customerTypes.map(t => t.code);
          return { ...prev, category: prev.category.length === all.length ? [] : all };
        }

        if (type === "status") {
          const all = customerStatuses.map(s => s.id);
          return { ...prev, status: prev.status.length === all.length ? [] : all };
        }

        return prev;
      });
      return;
    }

    setFilters(prev => {
      const current = prev[type];
      const updated = current.includes(optionValue)
        ? current.filter(i => i !== optionValue)
        : [...current, optionValue];

      return { ...prev, [type]: updated };
    });
  };

  /** CLEAR FILTERS */
  const clearFilters = () => {
    setFilters({
      customerGroup: [],
      category: [],
      status: [],
      state: [],
      city: [],
    });
    onApply({
      customerGroup: [],
      category: [],
      status: [],
      state: [],
      city: [],
    });
    handleClose();

  };

  /** APPLY FILTERS */
  const applyFilters = () => {
    onApply(filters);
    handleClose();
  };

  const allSectionConfig = {
    customerGroup: { label: "Customer Group" },
    status: { label: "Status" },
    category: { label: "Category" },
    state: { label: "State" },
    city: { label: "City" },
  };

  const filterSections = sections.map((id) => ({
    id,
    label: allSectionConfig[id].label,
    hasSearch: searchable.includes(id),
  }));


  const currentSection = filterSections.find(s => s.id === activeSection);

  const isDisabledClear = Object.values(filters || {}).every(
    (arr) => !arr || arr.length === 0
  );


  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <TouchableOpacity style={styles.backgroundTouch} onPress={handleClose} />

          <Animated.View
            style={[
              styles.modalContent,
              {
                height: keyboardVisible ? "100%" : "90%",
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            {/* HEADER */}
            <View style={styles.modalHeader}>
              <AppText style={styles.modalTitle}>{title}</AppText>
              <TouchableOpacity onPress={handleClose}>
                <ModalClose />
              </TouchableOpacity>
            </View>

            <View style={styles.splitContainer}>
              {/* LEFT MENU */}
              <View style={styles.leftPanel}>
                <ScrollView>
                  {filterSections.map((section) => (
                    <TouchableOpacity
                      key={section.id}
                      style={[
                        styles.leftMenuItem,
                        activeSection === section.id && styles.leftMenuItemActive,
                      ]}
                      onPress={() => {
                        setActiveSection(section.id);
                        setSearchQuery('');
                      }}
                    >
                      <AppText
                        style={[
                          styles.leftMenuText,
                          activeSection === section.id && styles.leftMenuTextActive,
                        ]}
                      >
                        {section.label}{" "}
                        {filters[section.id].length > 0 && `(${filters[section.id].length})`}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.divider} />

              {/* RIGHT PANEL */}
              <View style={styles.rightPanel}>
                <View style={styles.rightContent}>

                  {/* SEARCH BAR */}
                  {currentSection?.hasSearch && (
                    <View style={styles.searchContainer}>
                      <Svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <Path d="M9.09533 9.11333L11.1487 11.1667M10.5 5.5C10.5 6.82608 9.97322 8.09785 9.03553 9.03553C8.09785 9.97322 6.82608 10.5 5.5 10.5C4.17392 10.5 2.90215 9.97322 1.96447 9.03553C1.02678 8.09785 0.5 6.82608 0.5 5.5C0.5 4.17392 1.02678 2.90215 1.96447 1.96447C2.90215 1.02678 4.17392 0.5 5.5 0.5C6.82608 0.5 8.09785 1.02678 9.03553 1.96447C9.97322 2.90215 10.5 4.17392 10.5 5.5Z" stroke="#777777" strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>

                      <AppInput
                        style={styles.searchInput}
                        placeholder={`Search ${currentSection.label.toLowerCase()}...`}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#999"
                      />

                      {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                          <CloseCircle width={16} height={16} />
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  {/* OPTIONS */}
                  {/* OPTIONS */}
                  <ScrollView style={styles.optionsList} keyboardShouldPersistTaps="handled">
                    {activeSection === "city" && filters.state.length === 0 ? (
                      <AppText style={styles.noResults}>Please select a state first</AppText>
                    ) : filteredData.length === 0 || rawList.length <= 1 ? (
                      // rawList.length <= 1 means only "All" exists (i.e. nothing to list)
                      <AppText style={styles.noResults}>No results found</AppText>
                    ) : (
                      <View style={{ gap: 16 }}>
                        {/*
        Only filter out "All" when rawList indicates the list is empty.
        Keep "All" when there are real items to select.
      */}
                        {filteredData
                          .filter(item => !(rawList.length <= 1 && item === "All"))
                          .map((item, index) => {
                            const val = typeof item === "string" ? item : item.id;
                            const label = typeof item === "string" ? item : item.name;

                            const isChecked =
                              label === "All"
                                ? (
                                  activeSection === "state"
                                    ? filters.state.length === states.length
                                    : activeSection === "city"
                                      ? filters.city.length === availableCities.length
                                      : activeSection === "customerGroup"
                                        ? filters.customerGroup.length === customerGroups.length
                                        : activeSection === "category"
                                          ? filters.category.length === customerTypes.length
                                          : filters[activeSection].length === (rawList.length - 1)
                                )
                                : filters[activeSection].includes(val);

                            return (
                              <CustomCheckbox
                                key={index}
                                checked={isChecked}
                                checkboxStyle={{ marginRight: 5 }}
                                size={16}
                                borderWidth={1}
                                activeColor="#F7941E"
                                checkIcon={
                                  <Svg width="9" height="7" viewBox="0 0 9 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <Path d="M8.25 0.75L3.09375 5.90625L0.75 3.5625" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </Svg>

                                }
                                title={
                                  <AppText
                                    style={[
                                      styles.checkboxStyle,
                                      styles.optionItem,
                                      isChecked && styles.activeText,
                                    ]}
                                  >
                                    {label}
                                  </AppText>
                                }
                                onChange={() => {
                                  Keyboard.dismiss();
                                  toggleFilter(activeSection, item);
                                }}
                              />
                            );
                          })}
                      </View>
                    )}
                  </ScrollView>


                </View>
              </View>
            </View>

            {/* FOOTER */}
            <View style={styles.modalFooter}>
              <TouchableOpacity disabled={isDisabledClear} style={[styles.clearButton, isDisabledClear && { opacity: 0.5 }]} onPress={clearFilters}>
                <AppText style={styles.clearButtonText}>Clear filter</AppText>
              </TouchableOpacity>

              <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                <AppText style={styles.applyButtonText}>Apply filter</AppText>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    </Modal>
  );
};


// KEEPING YOUR EXACT ORIGINAL STYLES - NOT CHANGING ANYTHING
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backgroundTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  splitContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  leftPanel: {
    width: '40%',
    backgroundColor: '#FAFAFA',
    paddingVertical: 8,
  },
  leftMenuItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  leftMenuItemActive: {
    backgroundColor: '#fef4e8',
    // borderLeftColor: colors.primary,
  },
  leftMenuText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '400',
    fontFamily: Fonts.Regular
  },
  leftMenuTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  divider: {
    width: 1,
    backgroundColor: '#F0F0F0',
  },
  rightPanel: {
    flex: 1,
    backgroundColor: '#fff',
  },
  rightContent: {
    flex: 1,
    paddingTop: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderColor: '#EDEDED',
    borderWidth: 1,

  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    color: colors.secondaryText,
    padding: 0,
    fontWeight: 400,
    fontFamily: Fonts.Regular
  },
  optionsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  optionItem: {
    paddingHorizontal: 4,
    width: "100%",
    justifyContent: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    flexWrap: 'wrap',
  },
  optionTextChecked: {
    color: colors.primary,
    fontWeight: '500',
  },
  noResults: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 20,
    fontSize: 14,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  checkboxStyle: {
    color: colors.secondaryText,
    fontWeight: 400,
    fontSize: 14,
    fontFamily: Fonts.Regular,
    width: "100%",

  },
  activeText: {
    color: colors.primaryText,
    fontWeight: 600,
    fontFamily: Fonts.Bold
  }
});

export default FilterModal;

