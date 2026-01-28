import { colors } from "../../../../../styles/colors";
import { Fonts } from "../../../../../utils/fontHelper";

const { StyleSheet } = require("react-native");

const Liststyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'white',
    },
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginRight: 'auto',
        marginLeft: 10
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    createButton: {
        borderWidth: 1,
        borderColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    createButtonText: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: '600',
    },

    accordionCardG: {
        overflow: "hidden",
        backgroundColor: colors.white,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        paddingBottom: 20,
    },
    header: {
        paddingBottom: 0,
    },
    body: {
        flex: 1,
    },
    footer: {

    },
    tabText: {
        color: "#909090",
        fontSize: 16,
        fontFamily: Fonts.Regular,
        fontWeight: 400
    },
    tab: {
        paddingHorizontal: 6,
        paddingVertical: 10,
        marginLeft: 10,
    },
    activeTab: {
        borderBottomColor: "#F7941E",
        borderBottomWidth: 3
    },
    activeTabText: {
        color: "#F7941E",
        fontFamily: Fonts.Bold,
        fontWeight: 600
    },

    subTab: {
        borderWidth: 0.5,
        borderColor: "#909090",
        paddingVertical: 13,
        paddingHorizontal: 15,
        borderRadius: 10
    },

    subTabText: {
        fontSize: 16,
        fontWeight: "400",
        fontFamily: Fonts.Regular,
        color: "#777777",
    },
    activeSubTab: {
        borderColor: "#F7941E",
        backgroundColor: "#FFF4E8"
    },
    activeSubTabText: {
        color: colors.primaryText,
        fontFamily: Fonts.Bold,
        fontWeight: "600"
    },

    searchFilterButton: {
        padding: 16,
        borderRadius: 10,
        backgroundColor: '#fff'
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 15,
        color: '#777777',
        fontFamily: Fonts.Regular,
        fontWeight: 400
    },
    searchContainer: {
        flexDirection: 'row',
        paddingBottom: 0,
        // marginBottom: 15,
        alignItems: 'center',
        gap: 12,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyMessage: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },

});


export default Liststyles;