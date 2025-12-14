import { StyleSheet, TouchableOpacity, View } from "react-native";
import { AppInput, AppText } from "../../../../components";
import Search from "../../../../components/icons/Search";
import Filter from "../../../../components/icons/Filter";
import Downarrow from "../../../../components/icons/downArrow";
import { Fonts } from "../../../../utils/fontHelper";

const SearchBar = () => {
    return (
        <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
                <Search color="#999" />
                <AppInput
                    style={styles.searchInput}
                    placeholder="Enter product code/name to add..."
                    // value={searchText}
                    // onChangeText={setSearchText}
                    placeholderTextColor="#777777"
                />
            </View>
            <TouchableOpacity
                style={styles.searchFilterButton}
            // onPress={() => setFilterVisible(true)}
            >
                <Filter color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.searchFilterButton}>
                <AppText> % <Downarrow /></AppText>
            </TouchableOpacity>
        </View>
    )
}



const styles = StyleSheet.create({
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 13,
        color: '#777777',
        fontFamily: Fonts.Regular,
        fontWeight: 400
    },
    searchContainer: {
        flexDirection: 'row',
        paddingBottom: 0,
        marginBottom: 15, 
        alignItems: 'center',
        gap: 12,
    },
    searchFilterButton: {
        padding: 16,
        borderRadius: 10,
        backgroundColor: '#fff'
    },

});



export default SearchBar;