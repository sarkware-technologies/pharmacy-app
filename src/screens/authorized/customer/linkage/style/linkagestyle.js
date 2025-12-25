import { colors } from "../../../../../styles/colors";
import { Fonts } from "../../../../../utils/fontHelper";

const { StyleSheet } = require("react-native");

const Linkagestyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        overflow: 'visible',
    },
    stickyTabsContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: "white",
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingRight: 16
    },
    topRightButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginLeft: 'auto',
        paddingRight: 8,
    },
    verifyButtonTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        borderRadius: 12,
        backgroundColor: colors.primary,
        gap: 6,
    },
    verifyButtonTopText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    rejectButtonTop: {
        width: 24,
        height: 24,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: '#2B2B2B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    subTabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingVertical: 8,
        maxHeight: 60,
        marginHorizontal: 16,
        marginTop: 10,
    },
    subTab: {
        // flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: '#909090',
        backgroundColor: 'transparent',
    },
    activeSubTab: {
        backgroundColor: '#FFF3E0',
        borderColor: '#FF6B00',
    },
    subTabText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#999',
        fontWeight: '400',
    },
    activeSubTabText: {
        color: '#000',
        fontWeight: '700',
    },
    disabledTab: {
        opacity: 0.5,
    },
    disabledTabText: {
        color: '#CCC',
    },
    tabContent: {
        flex: 1,

    },
    scrollContent: {
        flex: 1,
        overflow: 'visible',
    },
    scrollContentContainer: {
        paddingBottom: 100, // Add padding to ensure last item is visible above sticky button
    },
    distributorTabs: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 12,
    },
    distributorTab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    activeDistributorTab: {
        // No background color when active
    },
    distributorTabText: {
        fontSize: 14,
        color: '#999',
    },
    activeDistributorTabText: {
        color: '#FF6B00',
        fontWeight: '600',
    },
    suggestedSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    suggestedTitle: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    infoIcon: {
        marginLeft: 8,
    },
    // Preferred Distributors Selection Mode Styles
    preferredSelectionContainer: {
        flex: 1,
    },
    backToSelectionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    backToSelectionText: {
        fontSize: 14,
        color: '#FF6B00',
        marginLeft: 8,
        fontWeight: '500',
    },
    preferredFiltersRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 12,
    },
    preferredFilterDropdown: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#fff',
    },
    preferredFilterText: {
        fontSize: 14,
        color: '#666',
    },
    preferredSearchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        marginHorizontal: 20,
        marginBottom: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
    },
    preferredTableHeader: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 14,
        backgroundColor: '#FAFAFA',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#E5E5E5',
        alignItems: 'center',
    },
    preferredCheckboxHeader: {
        width: 40,
        alignItems: 'center',
    },
    preferredCheckboxPlaceholder: {
        width: 20,
        height: 20,
    },
    preferredHeaderText: {
        fontSize: 13,
        color: '#999',
        fontWeight: '400',
    },
    preferredListContainer: {
        flex: 1,
    },
    preferredDistributorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    preferredCheckboxContainer: {
        width: 40,
        alignItems: 'center',
    },
    preferredCheckbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    preferredCheckboxSelected: {
        backgroundColor: '#FF6B00',
        borderColor: '#FF6B00',
    },
    preferredDistributorName: {
        fontSize: 15,
        fontWeight: '400',
        color: '#333',
        marginBottom: 4,
    },
    preferredDistributorCode: {
        fontSize: 13,
        color: '#999',
    },
    preferredStockistType: {
        fontSize: 14,
        color: '#666',
    },
    preferredFooter: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
        backgroundColor: '#fff',
    },
    preferredContinueButton: {
        backgroundColor: '#FF6B00',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    preferredContinueButtonDisabled: {
        backgroundColor: '#FFB380',
        opacity: 0.5,
    },
    preferredContinueButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    linkDistributorsButtonContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
    },
    linkDistributorsButton: {
        backgroundColor: '#FF6B00',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    linkDistributorsButtonDisabled: {
        backgroundColor: '#FFB380',
        opacity: 0.5,
    },
    linkDistributorsButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    distributorCard: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    distributorHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    distributorName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    distributorInfo: {
        fontSize: 12,
        color: '#666',
        marginBottom: 12,
    },
    marginContainer: {
        alignItems: 'flex-end',
    },
    marginLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    marginInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 8,
    },
    marginInput: {
        width: 40,
        height: 32,
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
    },
    marginPercent: {
        fontSize: 14,
        color: '#666',
    },
    distributorActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    dropdownsRow: {
        flexDirection: 'row',
        flex: 1,
        gap: 8,
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        flex: 1,
    },
    dropdownText: {
        fontSize: 14,
        color: '#333',
    },
    removeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
    },
    removeText: {
        fontSize: 14,
        color: '#FF6B00',
        marginRight: 4,
    },
    rateTypeRow: {
        flexDirection: 'row',
        gap: 24,
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    radioSelected: {
        borderColor: '#FF6B00',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FF6B00',
    },
    radioText: {
        fontSize: 14,
        color: '#333',
    },
    addMoreButton: {
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    addMoreText: {
        fontSize: 14,
        color: '#FF6B00',
        fontWeight: '500',
    },
    linkButton: {
        backgroundColor: '#FF6B00',
        marginHorizontal: 20,
        marginVertical: 16,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    linkButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 8,
        alignItems: 'center',
    },
    filterIcon: {
        padding: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
    },
    filterDropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    filterText: {
        fontSize: 14,
        color: '#333',
        marginRight: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        marginHorizontal: 20,
        marginVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        height: 44,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        marginLeft: 8,
    },
    tableHeader: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 14,
        backgroundColor: '#FAFAFA',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    tableHeaderText: {
        fontSize: 13,
        color: '#999',
        fontWeight: '400',
    },
    distributorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        position: 'relative',
        zIndex: 1,
    },
    distributorRowWithDropdown: {
        zIndex: 10001,
        // elevation: 26,
    },
    distributorInfoColumn: {
        paddingRight: 12,
    },
    distributorRowName: {
        fontSize: 15,
        fontWeight: '400',
        color: '#333',
        marginBottom: 4,
    },
    distributorRowCode: {
        fontSize: 13,
        color: '#999',
    },
    supplyTypeColumn: {
        paddingHorizontal: 8,
        alignItems: 'center',
    },
    supplyTypeDropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
    },
    supplyTypeText: {
        fontSize: 14,
        color: '#666',
        marginRight: 4,
    },
    actionColumn: {
        alignItems: 'flex-end',
        paddingLeft: 8,
    },
    addButton: {
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    addButtonText: {
        fontSize: 15,
        color: '#FF6B00',
        fontWeight: '400',
    },
    divisionsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    divisionColumn: {
        flex: 1,
    },
    divisionColumnFullWidth: {
        flex: 1,
        width: '100%',
    },
    columnTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    columnHeader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        gap: 12,
    },
    assignText: {
        fontSize: 10,
        color: '#FF6B00',
        fontWeight: '600',
    },
    columnSubtitle: {
        fontSize: 12,
        color: '#666',
        marginBottom: 16,
    },
    divisionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    divisionName: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.primaryText,
        fontFamily: Fonts.Regular
    },
    divisionCode: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
        fontWeight: '400',
        color: colors.secondaryText,
        fontFamily: Fonts.Regular
    },
    blockButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    unblockButton: {
        borderColor: '#FF6B00',
        backgroundColor: '#FFF3E0',
    },
    blockText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#666',
    },
    unblockText: {
        color: '#FF6B00',
    },
    checkboxItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderRadius: 4,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#FF6B00',
        borderColor: '#FF6B00',
    },
    linkDivisionsButton: {
        backgroundColor: '#FF6B00',
        marginHorizontal: 20,
        marginTop: 32,
        marginBottom: 16,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    continueButton: {
        backgroundColor: '#FF6B00',
        marginHorizontal: 20,
        marginBottom: 16,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    // Sticky header for field tab
    fieldStickyHeader: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 14,
        backgroundColor: '#FAFAFA',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
        zIndex: 10,
        elevation: 2,
    },
    fieldHeaderText: {
        fontSize: 14,
        color: '#999',
        fontWeight: '500',
    },
    fieldHeaderName: {
        flex: 2,
    },
    fieldHeaderDivision: {
        flex: 1.5,
        textAlign: 'center',
    },
    fieldHeaderDesignation: {
        flex: 1.5,
        textAlign: 'right',
        paddingRight: 10,
    },
    // Scrollable content area
    fieldScrollContent: {
        flex: 1,
    },
    fieldScrollContentContainer: {
        paddingBottom: 20,
    },
    // Field row styles
    fieldRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        alignItems: 'center',
    },
    fieldNameColumn: {
        flex: 2,
    },
    fieldDivisionColumn: {
        flex: 1.5,
        alignItems: 'center',
    },
    fieldDesignationColumn: {
        flex: 1.5,
        alignItems: 'flex-end',
        paddingRight: 10,
    },
    employeeName: {
        fontSize: 15,
        fontWeight: '400',
        color: '#333',
        marginBottom: 4,
    },
    employeeCode: {
        fontSize: 13,
        color: '#999',
    },
    employeeDivision: {
        fontSize: 15,
        fontWeight: '400',
        color: '#333',
        marginBottom: 4,
        textAlign: 'center',
    },
    employeeDivisionCode: {
        fontSize: 13,
        color: '#999',
        textAlign: 'center',
    },
    employeeDesignation: {
        fontSize: 15,
        color: '#666',
        textAlign: 'right',
    },
    // Field skeleton styles
    fieldSkeletonContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    fieldSkeletonRow: {
        flexDirection: 'row',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        alignItems: 'center',
    },
    fieldSkeletonNameColumn: {
        flex: 2,
    },
    fieldSkeletonDivisionColumn: {
        flex: 1.5,
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    fieldSkeletonDesignationColumn: {
        flex: 1.5,
        alignItems: 'flex-end',
        paddingRight: 10,
    },
    fieldSkeletonName: {
        height: 16,
        width: '70%',
        backgroundColor: '#E5E5E5',
        borderRadius: 4,
        marginBottom: 8,
    },
    fieldSkeletonCode: {
        height: 12,
        width: '40%',
        backgroundColor: '#F0F0F0',
        borderRadius: 4,
    },
    fieldSkeletonDivision: {
        height: 16,
        width: '60%',
        backgroundColor: '#E5E5E5',
        borderRadius: 4,
        marginBottom: 8,
    },
    fieldSkeletonDivisionCode: {
        height: 12,
        width: '40%',
        backgroundColor: '#F0F0F0',
        borderRadius: 4,
    },
    fieldSkeletonDesignation: {
        height: 16,
        width: '80%',
        backgroundColor: '#E5E5E5',
        borderRadius: 4,
    },
    hierarchyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },


    hierarchyName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    hierarchyCode: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    // hierarchyActions: {
    //   flexDirection: 'row',
    //   alignItems: 'center',
    //   gap: 8,
    // },
    approveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF6B00',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    approveButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '500',
        marginLeft: 4,
    },

    parentHospitalCard: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    parentLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    parentTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    parentName: {
        fontSize: 14,
        color: '#333',
    },
    hierarchyTabs: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    hierarchyTab: {
        marginRight: 24,
        paddingBottom: 8,
    },
    activeHierarchyTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#FF6B00',
    },
    hierarchyTabText: {
        fontSize: 14,
        color: '#999',
    },
    activeHierarchyTabText: {
        color: '#FF6B00',
        fontWeight: '600',
    },
    hospitalCard: {
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        paddingBottom: 16,
        marginBottom: 16,
    },
    hospitalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    hospitalName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    hospitalCode: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    expandButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    expandText: {
        fontSize: 14,
        color: '#666',
    },
    linkedItemsContainer: {
        marginTop: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    divisionModalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        height: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    divisionModalHeader: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#F5F5F5',
    },
    divisionModalHeaderText: {
        flex: 1,
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    divisionModalList: {
        flex: 1,
    },
    divisionModalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    divisionModalItemWithCheckboxes: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    divisionModalItemMain: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    divisionModalName: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        marginLeft: 12,
    },
    divisionModalCode: {
        fontSize: 14,
        color: '#666',
        width: 80,
    },
    orgCodeCheckboxes: {
        flexDirection: 'row',
        marginLeft: 28,
    },
    orgCodeCheckboxItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    orgCodeText: {
        fontSize: 14,
        color: '#333',
    },
    // Dropdown menu styles
    dropdownWrapper: {
        position: 'relative',
        // flex: 1,
        zIndex: 10000,
        elevation: 20,
    },
    dropdownMenu: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 8,
        zIndex: 100010,
        elevation: 30,
        marginTop: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        backgroundColor: '#fff',
        borderRadius: 6,
        paddingVertical: 4,
        marginTop: 6,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },


    },
    dropdownMenuItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    dropdownMenuText: {
        fontSize: 14,
        color: '#333',
    },
    // Toast styles
    toastContainer: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        alignItems: 'center',
        zIndex: 9999,
    },
    toast: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        minWidth: 200,
        maxWidth: '90%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    toastSuccess: {
        backgroundColor: '#10B981',
    },
    toastError: {
        backgroundColor: '#EF4444',
    },
    toastText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    // Loading, error, and empty states
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingMoreContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    loadingMoreText: {
        marginLeft: 10,
        fontSize: 14,
        color: '#FF6B00',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    errorText: {
        marginTop: 12,
        fontSize: 14,
        fontWeight: '600',
        color: '#EF4444',
    },
    errorSubText: {
        marginTop: 4,
        fontSize: 12,
        color: '#999',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 14,
        color: '#999',
        textAlign: "center",

    },
    emptySubText: {
        marginTop: 4,
        fontSize: 12,
        color: '#999',
    },
    emptyDivisionContainer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    emptyDivisionText: {
        fontSize: 14,
        color: '#999',
    },
    editModeContainer: {
        flex: 1,
    },
    stickyButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
    },
    continueButtonDisabled: {
        opacity: 0.5,
    },
    addMoreSection: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        marginBottom: 80,
    },
    addMoreTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF6B00',
        marginBottom: 12,
    },
    addMoreSearchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        gap: 8,
        marginBottom: 16,
    },
    addMoreDistributorItem: {
        backgroundColor: '#F8F8F8',
        borderRadius: 8,
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    addMoreDistributorInfo: {
        flex: 1,
    },
    addMoreDistributorName: {
        fontSize: 15,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    addMoreDistributorCity: {
        fontSize: 13,
        color: '#999',
    },
    // Hierarchy section styles
    hierarchySection: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    hierarchySectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },

    // hierarchyInfo: {
    //   flex: 1,
    //   marginRight: 12,
    // },
    hierarchyName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    hierarchyCode: {
        fontSize: 12,
        color: '#999',
    },
    // hierarchyActions: {
    //   flexDirection: 'row',
    //   alignItems: 'center',
    //   gap: 8,
    // },
    approveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF6B00',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        gap: 4,
    },
    approveButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    rejectButton: {
        width: 20,
        height: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#2B2B2B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusBadge: {
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },

    // Hospital card styles (for expandable design)
    hospitalCard: {
        marginHorizontal: 12,
        marginVertical: 8,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        overflow: 'hidden',
    },
    hospitalCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    hospitalCardInfo: {
        flex: 1,
        marginRight: 12,
    },
    hospitalCardName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    hospitalCardCode: {
        fontSize: 12,
        color: '#999',
    },
    hospitalCardActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    expandableHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#F9F9F9',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    expandableContent: {
        flex: 1,
    },
    expandableText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    expandedContent: {
        backgroundColor: '#FAFAFA',
        paddingVertical: 8,
    },
    linkedItemsSection: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    linkedItemsTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginTop: 4,
    },
    linkedItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 8,
        marginBottom: 4,
        backgroundColor: '#fff',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    linkedItemInfo: {
        flex: 1,
        marginRight: 8,
    },
    linkedItemName: {
        fontSize: 12,
        fontWeight: '500',
        color: '#333',
        marginBottom: 2,
    },
    linkedItemCode: {
        fontSize: 11,
        color: '#999',
    },
    linkedItemActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    // Accordion styles (for group hospitals)
    accordionCard: {
        marginHorizontal: 12,
        marginVertical: 8,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        overflow: 'hidden',
    },
    accordionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    accordionHeaderInfo: {
        flex: 1,
        marginRight: 12,
    },
    accordionHospitalName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    accordionHospitalCode: {
        fontSize: 12,
        color: '#999',
        marginBottom: 8,
    },
    accordionTabsContainer: {
        flexDirection: 'row',
        marginTop: 8,
        gap: 12,
    },
    accordionTab: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeAccordionTab: {
        borderBottomColor: '#FF6B00',
    },
    accordionTabText: {
        fontSize: 12,
        color: '#999',
        fontWeight: '500',
    },
    activeAccordionTabText: {
        color: '#FF6B00',
        fontWeight: '600',
    },
    accordionHeaderActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    accordionContent: {
        backgroundColor: '#FAFAFA',
        paddingVertical: 12,
    },
    accordionItemsContainer: {
        paddingHorizontal: 12,
    },
    accordionItemsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingVertical: 8,
        backgroundColor: '#F0F0F0',
        borderRadius: 6,
        marginBottom: 8,
    },
    accordionItemsHeaderText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#666',
        flex: 1,
    },
    accordionItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 10,
        marginBottom: 8,
        backgroundColor: '#fff',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    accordionItemInfo: {
        flex: 1,
        marginRight: 8,
    },
    accordionItemName: {
        fontSize: 13,
        fontWeight: '500',
        color: '#333',
        marginBottom: 2,
    },
    accordionItemCode: {
        fontSize: 11,
        color: '#999',
    },
    accordionItemActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    emptyAccordionContent: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    emptyAccordionText: {
        fontSize: 12,
        color: '#999',
    },

    // Skeleton styles for distributor rows
    skeletonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    skeletonLeft: {
        flex: 1.5,
        paddingRight: 12,
    },
    skeletonMiddle: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    skeletonRight: {
        flex: 0.6,
        alignItems: 'flex-end',
    },
    skeletonTitle: {
        height: 16,
        width: '70%',
        backgroundColor: '#eee',
        borderRadius: 4,
        marginBottom: 8,
    },
    skeletonSubTitle: {
        height: 12,
        width: '40%',
        backgroundColor: '#f3f3f3',
        borderRadius: 4,
    },
    skeletonStatus: {
        height: 16,
        width: '50%',
        backgroundColor: '#f3f3f3',
        borderRadius: 4,
    },
    skeletonAddButton: {
        height: 20,
        width: 48,
        backgroundColor: '#ffece0',
        borderRadius: 4,
    },
    supplyTypeWrapper: {
        position: 'relative',
        overflow: 'visible',
        zIndex: 10000,
        elevation: 25,
    },

    supplyTypeDropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#D9D9D9',
        borderRadius: 8,
        minWidth: 120,
        zIndex: 51,
    },

    /* BASE DROPDOWN MENU (GLOBAL) */
    dropdownMenu: {
        position: 'absolute',
        top: 40, // ensures it drops below the button
        right: 0, // align to right always
        minWidth: 180,
        backgroundColor: '#fff',
        borderRadius: 8,
        overflow: 'visible',

        // FIX CLIPPING - High z-index to appear above other elements
        zIndex: 99999,
        elevation: 30,

        // Stronger shadow for visibility
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 8 },
    },

    /* DROPDOWN FOR SUPPLY TYPE (OVERRIDE SIZE/POSITION) */
    supplyDropdownMenu: {
        position: 'absolute',
        top: 42,
        right: -10,  // move slightly outward so it doesn't overlap text
        width: 200,
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 6,
        borderWidth: 0, // Ensure no border on dropdown container

        // FIX CLIPPING - Maximum z-index to appear above all elements
        overflow: 'visible',
        zIndex: 99999,
        elevation: 30,

        // Improve shadow for better visibility
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 8 },
    },

    dropdownMenuItem: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        backgroundColor: '#fff',

        // Increase tap area
        minHeight: 44,
        justifyContent: 'center',

        // Maximum z-index for touch detection
        zIndex: 99999,
        elevation: 30,
    },
    dropdownMenuItemLast: {
        borderBottomWidth: 0, // Remove border from last item
    },

    dropdownMenuText: {
        fontSize: 14,
        color: '#333',
        zIndex: 99999,
    },

    supplyTypeText: {
        fontSize: 14,
        color: '#333',
        marginRight: 6,
    },
    tabContentWrapper: {
        flex: 1,
        paddingTop: 60, // Same height as sticky tab bar (60 + 10 margin)
        overflow: 'visible', // Changed to visible to allow dropdown to overflow
    },


    headerWrapper: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: 10,
        marginTop: 10,
    },

    headerTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#2B2B2B",
        paddingBottom: 15,
        paddingLeft: 15
    },

    subHeaderWrapper: {
        flexDirection: "row",
        backgroundColor: "#FBFBFB",
        // paddingVertical: 8,
        paddingHorizontal: 16,
        // marginBottom:10


    },

    subHeaderText: {
        fontSize: 13,
        fontWeight: "500",
        color: "#777",
        paddingVertical: 10,
        paddingLeft: 15
    },

    columnsRow: {
        flexDirection: "row",
        paddingHorizontal: 16,
        // paddingTop: 14,
        marginTop: 20
    },

    divider: {
        width: 1,
        backgroundColor: "#9090903e",
        marginHorizontal: 12,


    },

    dividerinside: {
        width: 1,
        backgroundColor: "#9090903e",
        marginHorizontal: 12,
        marginTop: -20
    },

    /* Column widths based on screenshot */
    colRequested: {
        flex: 1,        // Medium width
        paddingRight: 6,
        // paddingTop:20
    },

    colOther: {
        flex: 1.3,      // WIDEST column (as per screenshot)
        paddingLeft: 6,
        paddingRight: 6,
        // paddingTop:20
    },
    unauthorizedContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    unauthorizedTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#EF4444',
        marginTop: 12,
        marginBottom: 8,
        textAlign: 'center',
    },
    unauthorizedMessage: {
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
    },

    colOpened: {
        flex: 1,        // Smallest column
        paddingLeft: 6,
        // paddingTop:20
    },

    /* Requested Rows */
    reqRow: {
        marginBottom: 20,
    },

    /* Other Rows */
    otherRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        gap: 10,
    },

    /* Opened Rows */
    openedRow: {

        borderBottomColor: "#D9DFE2",
        borderBottomWidth: 1,
        paddingBottom: 10,
        marginBottom: 10,


    },

    emptyText: {
        fontSize: 13,
        color: "#999",
        lineHeight: 18,
    },

    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: "#909090",
        marginRight: 12,
        justifyContent: "center",
        alignItems: "center",
    },

    checkboxSelected: {
        backgroundColor: "#FF8A00",
        borderColor: "#FF8A00",
    },

    blockButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: "#2B2B2B",
        borderRadius: 8,
        marginVertical: 5,
        alignSelf: "flex-start",
    },

    blockButtonDisabled: {
        opacity: 0.5,
    },

    unblockButton: {
        borderColor: "#EF4444",
        backgroundColor: "#FEE2E2",
    },

    blockText: {
        marginLeft: 6,
        fontSize: 12,
        color: "#2B2B2B",
    },

    unblockText: {
        color: "#EF4444",
    },

    subTabsWrapper: {
        marginTop: 0,
        height: 60,
        backgroundColor: '#fff',
        zIndex: 10,
    },

    /* CARD */
    linkedCard: {
        backgroundColor: '#FAFAFA',
        borderRadius: 14,
        padding: 16,
        marginBottom: 16,
        marginHorizontal: 16,
        overflow: 'visible',
        zIndex: 1,
    },

    /* TOP ROW */
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },

    name: {
        fontSize: 15,
        fontFamily: 'Lato-Bold',
        color: '#111827',
    },

    subText: {
        fontSize: 12.5,
        color: '#6B7280',
        marginTop: 3,
    },

    subTextLiked: {
        fontSize: 12.5,
        color: '#6B7280',
        marginTop: 3,
        marginBottom: 10
    },

    marginLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },

    /* MIDDLE ROW */
    middleRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 12,
        marginBottom: 10,
        justifyContent: "space-between"
    },

    middleRowDropdown: {
        flexDirection: 'row',
        gap: 12,
        zIndex: 1000,
    },

    orgCodeDropdownMenu: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginTop: 4,
        zIndex: 999999,
        elevation: 100,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 8 },
        borderWidth: 1,
        borderColor: '#E0E0E0',
        paddingVertical: 4,
        minWidth: 120,
    },

    allDivisionsDropdownMenu: {
        zIndex: 10002,
        elevation: 31,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 8 },
        maxHeight: 200,
    },

    dropdown: {
        height: 36,
        minWidth: 110,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
    },
    dropdownError: {
        borderColor: '#EF4444',
        borderWidth: 1.5,
    },
    dropdownMenuItemWithCheckbox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    checkboxContainer: {
        marginRight: 10,
    },
    checkbox: {
        width: 18,
        height: 18,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
    checkboxSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    dropdownError: {
        borderColor: '#EF4444',
        borderWidth: 1.5,
    },

    dropdownText: {
        fontSize: 14,
        color: '#111827',
    },
    dropdownMenuItemWithCheckbox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    checkboxContainer: {
        marginRight: 10,
    },
    checkbox: {
        width: 18,
        height: 18,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
    checkboxSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },

    marginBox: {
        height: 36,
        width: 72,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },

    marginInput: {
        width: 26,
        padding: 0,
        margin: 0,
        textAlign: 'center',
        fontSize: 14,
        color: '#111827',
    },

    percent: {
        fontSize: 13,
        color: '#6B7280',
        marginLeft: 4,
    },

    /* BOTTOM ROW */
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    radioRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },

    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 18,
        flex: 0,
    },

    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#9CA3AF',
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },

    radioSelected: {
        borderColor: '#F97316',
    },

    radioSelectedOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#F97316',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },

    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#F97316',
    },

    radioText: {
        fontSize: 13,
        color: '#111827',
    },

    radioDisabled: {
        fontSize: 13,
        color: '#9CA3AF',
    },

    removeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    removeText: {
        fontSize: 13,
        color: '#F97316',
        marginRight: 6,
    },

    /* FINISH */
    finishContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: '#FFFFFF',
    },

    finishBtn: {
        height: 48,
        backgroundColor: '#F97316',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },

    finishText: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
    },

    marginText: {
        fontSize: 12,
        color: "#777777"
    },

    hierarchyHeader: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#F9F9F9',
        borderRadius: 6,
        marginBottom: 8,

    },

    hierarchyHeaderLeft: {
        flex: 6.5,              // ✅ 70%
        fontSize: 12,
        fontWeight: '500',
        color: '#666',
    },

    hierarchyHeaderRight: {
        flex: 3,              // ✅ 30%
        fontSize: 12,
        fontWeight: '500',
        color: '#666',

    },

    hierarchyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },

    hierarchyInfo: {
        flex: 7,              // ✅ MUST MATCH HEADER LEFT
    },

    hierarchyActions: {
        flex: 3,              // ✅ MUST MATCH HEADER RIGHT
        alignItems: 'flex-end',
    },

    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,               // ✅ spacing without breaking layout
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8, // space between icon & text
    },

    statusText: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
    },

    approvedText: {
        color: '#16A34A', // green
    },

    rejectedText: {
        color: '#EF4444', // red
    },
    rejectedIconCircle: {
        width: 18,
        height: 18,
        borderRadius: 11,
        borderWidth: 1,
        borderColor: '#EF4444',
        alignItems: 'center',
        justifyContent: 'center',
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

    headerText: {
        fontSize: 16,
        fontWeight: "600",
    },

    body: {
        flex: 1,
    },

    bodyContent: {
        padding: 12,
        paddingTop: 0
    },

    footer: {

    },



});


export default Linkagestyles;