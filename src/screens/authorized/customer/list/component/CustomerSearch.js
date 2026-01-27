import { TouchableOpacity } from "react-native";
import Search from '../../../../../components/icons/Search';
import Filter from '../../../../../components/icons/Filter';
import Calendar from '../../../../../components/icons/Calendar';
import AppView from "../../../../../components/AppView";
import Liststyles from "../style/listStyle";
import { AppInput } from "../../../../../components";
import FilterModal from "../../../../../components/FilterModal";
import { useState } from "react";


const CustomerSearch = ({ handleApplyFilters, appliedFilter, setSearchText, searchText }) => {

    const [filterModalVisible, setFilterModalVisible] = useState(false);
    return (
        <AppView style={Liststyles.searchContainer} marginTop={7}>
            <AppView style={Liststyles.searchBar}>
                <Search color="#999" />
                <AppInput
                    style={Liststyles.searchInput}
                    placeholder="Search customer name/code..."
                    value={searchText}
                    onChangeText={(text) => setSearchText?.(text)}
                    placeholderTextColor="#777777"
                />
            </AppView>
            <TouchableOpacity
                style={Liststyles.searchFilterButton}
                onPress={() => setFilterModalVisible(true)}
            >
                <Filter color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={Liststyles.searchFilterButton}>
                <Calendar />
            </TouchableOpacity>


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
