import { TouchableOpacity } from "react-native";
import Search from '../../../../../components/icons/Search';
import Filter from '../../../../../components/icons/Filter';
import Calendar from '../../../../../components/icons/Calendar';
import AppView from "../../../../../components/AppView";
import Liststyles from "../style/listStyle";
import { AppInput } from "../../../../../components";
import FilterModal from "../../../../../components/FilterModal";
import { useEffect, useState } from "react";
import Svg, { Path } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";


const CustomerSearch = ({ handleApplyFilters, appliedFilter, setSearchText, searchText, handleFocus, filterConfig = { backButton: false, search: true, filter: true, calender: true }, backgroundColor = { searchBar: "#fff", searchContainer: '#F8F9FA' }, searchRef }) => {

    const navigation = useNavigation();


    const [filterModalVisible, setFilterModalVisible] = useState(false);
    return (
        <AppView style={Liststyles.searchContainer} marginTop={7} backgroundColor={backgroundColor?.searchContainer} >
            {filterConfig?.search && (
                <AppView style={Liststyles.searchBar} backgroundColor={backgroundColor?.searchBar}>
                    {!filterConfig?.backButton ? (
                        <Search color="#999" />
                    ) : (
                        <TouchableOpacity onPress={() => navigation.goBack()}>
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
                        onFocus={() => handleFocus?.()}
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
                <TouchableOpacity style={Liststyles.searchFilterButton}>
                    <Calendar />
                </TouchableOpacity>
            )}

            <FilterModal
                visible={filterModalVisible}
                onClose={() => setFilterModalVisible(false)}
                onApply={(val) => handleApplyFilters?.(val)}
                selected={appliedFilter}
            />

        </AppView>
    )
}




export default CustomerSearch;
