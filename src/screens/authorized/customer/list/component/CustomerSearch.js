import { TouchableOpacity } from "react-native";
import Search from '../../../../../components/icons/Search';
import Filter from '../../../../../components/icons/Filter';
import CalendarIcon from '../../../../../components/icons/Calendar';
import AppView from "../../../../../components/AppView";
import Liststyles from "../style/listStyle";
import { AppInput } from "../../../../../components";
import FilterModal from "../../../../../components/FilterModal";
import { useEffect, useState } from "react";
import Svg, { Path } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import DateRangePicker from "../../../../../components/view/dateRange"

const CustomerSearch = ({ handleApplyFilters, appliedFilter, setSearchText, searchText, handleFocus, filterConfig = { backButton: false, search: true, filter: true, calender: true }, backgroundColor = { searchBar: "#fff", searchContainer: '#F8F9FA' }, searchRef, selectedDate, setSelectedDate, }) => {

    const navigation = useNavigation();

    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [dateRangeVisible, setDateRangeVisible] = useState(false);
    return (
        <AppView style={Liststyles.searchContainer} marginTop={7} backgroundColor={backgroundColor?.searchContainer} >
            {filterConfig?.search && (
                <AppView paddingRight={filterConfig?.backButton ? 12 : 0} paddingHorizontal={!filterConfig?.backButton ? 12 : 0} style={Liststyles.searchBar} backgroundColor={backgroundColor?.searchBar}>
                    {!filterConfig?.backButton ? (
                        <Search color="#999" />
                    ) : (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: 1, paddingVertical: 10, paddingLeft: 18 }}>
                            <Svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <Path d="M6.625 1L1 6.625L6.625 12.25" stroke="#F7941E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </Svg>
                        </TouchableOpacity>
                    )}
                    <AppInput
                        ref={searchRef}
                        style={Liststyles.searchInput}
                        placeholder="Search customer name/code..."
                        value={searchText}
                        onChangeText={(text) => setSearchText?.(text)}
                        placeholderTextColor="#777777"
                        onPress={() => handleFocus?.()}
                        backgroundColor={backgroundColor?.searchBar}
                    />
                </AppView>
            )}
            {filterConfig?.filter && (
                <TouchableOpacity
                    style={Liststyles.searchFilterButton}
                    onPress={() => setFilterModalVisible(true)}
                >
                    <Filter color="#666" />
                </TouchableOpacity>
            )}
            {filterConfig?.calender && (

                <TouchableOpacity style={Liststyles.searchFilterButton} onPress={() => setDateRangeVisible(true)}>
                    <CalendarIcon />
                </TouchableOpacity>
            )}

            <FilterModal
                visible={filterModalVisible}
                onClose={() => setFilterModalVisible(false)}
                onApply={(val) => handleApplyFilters?.(val)}
                selected={appliedFilter}
            />
            {dateRangeVisible && (
                <DateRangePicker handleChange={(val) => setSelectedDate?.(val)} value={selectedDate} visible={dateRangeVisible} onClose={() => setDateRangeVisible(false)} />
            )}
        </AppView>
    )
}




export default CustomerSearch;
