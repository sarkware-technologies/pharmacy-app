import { StyleSheet } from "react-native";
import { colors } from "../../../../styles/colors";
import CommonStyle from "../../../../styles/styles";




const OnboardStyle = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 4,
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    saveDraftButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    saveDraftButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
    },
    scrollContent: {
        paddingBottom: 0,
    },
    customerType: {
        paddingVertical: 10,
        paddingHorizontal: 20,
    },

    customerTypeItem: {
        paddingVertical: 13,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: "#E3E3E3",
        borderRadius: 8
    },
    customerTypeItemActive: {
        borderWidth: 1,
        borderColor: "#F7941E",
        backgroundColor: "#F7941E1A"
    },
    customerTypeItemText: {
        ...CommonStyle.secondaryText,
        fontSize: 14
    },
    customerTypeItemActiveText: {
        ...CommonStyle.primaryText,
        color: "#2B2B2B"
    },
    accordionTitle: {
        borderLeftColor: "#F98700",
        borderLeftWidth: 4,
        paddingLeft: 15,
        fontSize: 20,
        marginLeft: 1
    },
    requiredIcon: {
        fontSize: 20,
        color: "#E84141"
    },
    rotateIcon: {
        transform: [{ rotate: "180deg" }],
    },
    accordionView: {
        paddingHorizontal: 20
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fbfbfb',
        padding: 16,
        paddingVertical: 14,
        borderRadius: 12,
    },
    switchLabel: {
        fontSize: 16,
        color: '#333',
    },
    switch: {
        width: 50,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#DDD',
        padding: 2,
        justifyContent: 'center',
    },
    switchActive: {
        backgroundColor: colors.primary,
    },
    switchThumb: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#fff',
    },
    switchThumbActive: {
        transform: [{ translateX: 20 }],
    },
    selectedItemChip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F5F5F6',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    selectedItemText: {
        fontSize: 13,
        color: '#333',
        fontWeight: '500',
        flex: 1,
    },
    chipText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },


    // Accordion Styles
    hospitalsContainer: {
        marginBottom: 16,
    },
    hospitalAccordion: {
        marginBottom: 12,
        borderRadius: 8,
        backgroundColor: '#F9F9F9',
        borderWidth: 1,
        borderColor: '#E8E8E8',
        overflow: 'hidden',
    },
    hospitalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 14,
        backgroundColor: '#FAFAFA',
    },
    hospitalHeaderContent: {
        flex: 1,
    },
    hospitalName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    hospitalHeaderActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    removeButton: {
        padding: 4,
    },
    chevron: {
        marginLeft: 8,
    },
    hospitalContent: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    pharmaciesSection: {
        marginBottom: 0,
    },
    pharmaciesLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: '#666',
        marginBottom: 10,
    },
    pharmaciesTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    pharmacyTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#F0F0F0',
        borderRadius: 16,
        gap: 6,
    },
    pharmacyTagText: {
        fontSize: 13,
        color: '#333',
        fontWeight: '500',
    },
    pharmacyTagRemove: {
        padding: 2,
    },
    addPharmacyLink: {
        padding: 0,
        margin: 0,
    },
    addPharmacyLinkText: {
        fontSize: 13,
        color: colors.primary,
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
});


export default OnboardStyle;