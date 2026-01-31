import { StyleSheet } from "react-native";
import { colors } from "../../../../../styles/colors";
import { Fonts } from "../../../../../utils/fontHelper";

const Customerstyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    // header: {
    //   flexDirection: 'row',
    //   alignItems: 'center',
    //   justifyContent: 'space-between',
    //   paddingHorizontal: 20,
    //   paddingVertical: 12,
    //   backgroundColor: '#fff',
    //   zIndex: 999
    // },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginRight: 'auto',
        marginLeft: 6,
        flex: 1,
        flexShrink: 1,

    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    approveHeaderButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: colors.primary,
    },
    approveHeaderButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    rejectHeaderButton: {
        padding: 6,
    },
    tabContainer: {
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: 0,
        paddingVertical: 8,
        borderBottomWidth: 1,
        alignItems: 'flex-end',
        borderBottomColor: '#E0E0E0',
        marginTop: -10,
        zIndex: 999
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderBottomWidth: 2,
        marginBottom: -8,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: colors.primary,
    },
    tabText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#999',
    },
    activeTabText: {
        color: colors.primary,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        paddingVertical: 0,
        paddingHorizontal: 20,
        backgroundColor: '#fff'
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginTop: 16,
        marginBottom: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 16,
        marginBottom: 12,
    },
    commentIconButton: {
        padding: 6,
    },
    card: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#90909033',
        paddingBottom: 10
    },
    infoRow: {
        marginBottom: 10
    },
    infoContent: {
        flex: 1,
        marginBottom: 5
    },
    infoLabel: {
        fontSize: 13,
        color: '#909090',
        marginBottom: 4,
    },
    customerGroupRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    changeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E67E22', // Darker orange border
        borderRadius: 10,
        paddingVertical: 4,
        paddingHorizontal: 10,
        gap: 4,
    },
    changeButtonText: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: '600',
    },
    // Customer Group Inline Edit Styles
    customerGroupEditContainer: {

        backgroundColor: "#fbfbfbr",
        padding: 20,

        borderRadius: 10
    },
    radioGroupContainer: {
        marginBottom: 0,
    },
    radioRow: {
        flexDirection: 'row',
        marginBottom: 12,
        gap: 30,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        flex: 1,
    },
    radioOptionFlex: {
        flex: 1,
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.primary,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioSelected: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary,
    },
    radioText: {
        fontSize: 14,
        color: '#333',
    },
    inlineModalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 0,
        maxWidth: "70%"
    },
    inlineDoneButton: {
        flex: 1,
        backgroundColor: colors.primary,
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inlineDoneButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    inlineCancelButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inlineCancelButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 14,
        color: '#777777',
        fontWeight: '500',
    },
    infoIcon: {
        marginLeft: 8,
    },
    rowContainer: {
        flexDirection: 'row',
        marginTop: -8,
    },
    halfRow: {
        flex: 1,
    },
    linkButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    linkText: {
        fontSize: 12,
        color: '#777777',


        flexShrink: 1,
        marginRight: 8,
    },
    fileLinkGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 1,
        maxWidth: "55%"
    },
    iconGroup: {
        flexDirection: 'row',
        // rowGap: 17,
        marginRight: 'auto',
        // width:50,
        alignItems: "center",
        gap: 4
    },
    licenseRow: {
        flexDirection: 'row',
    },
    licenseInfo: {
        width: '50%'
    },
    licenseExpiry: {
        marginLeft: 2,
    },
    uploadedFile: {
        // paddingHorizontal: 10,
    },
    uploadedFileLabel: {
        fontSize: 13,
        color: '#999',
        marginTop: 10
    },
    fileRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: "100%",
        gap: 10
    },
    fileName: {
        fontSize: 14,
        // width: '50%',
        color: '#777777',
        flexShrink: 1,
    },
    otherDetailRow: {
        flexDirection: 'row',
        justifyContent: "space-around",
        width: "100%",


    },
    otherDetailItem: {
        flex: 1,
        flexShrink: 1
    },
    valueWithIcons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: "100%",
        gap: 10
    },
    imageRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    imageName: {
        fontSize: 14,
        color: '#777777',
        flexShrink: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    documentModalContent: {
        overflow: 'hidden',
        // width: width * 0.9,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.primary,
    },
    documentImageContainer: {
        alignItems: 'center',
        paddingVertical: 40,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        marginBottom: 20,
        overflow: 'hidden',
        height: 300,
        justifyContent: 'center',
        width: '100%',
    },
    zoomableImageWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    dummyDocument: {
        alignItems: 'center',
    },
    documentName: {
        marginTop: 16,
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        paddingVertical: 14,
        borderRadius: 25,
    },
    downloadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 15,
    },
    rejectButton: {
        flex: 1,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#2B2B2B",
        backgroundColor: '#fff',
        gap: 5,
    },
    rejectButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: "#2B2B2B",
    },
    approveButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: colors.primary,
        gap: 8,
    },
    approveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    verifyButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: colors.primary,
        gap: 8,
    },
    verifyButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    sendBackButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.primary,
        backgroundColor: "#fff",
        gap: 5,
    },
    sendBackButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#fff',


        zIndex: 999
    },

    leftSection: {
        flex: 6,
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 0,
    },

    rightSection: {
        flex: 4,
        alignItems: 'flex-end',
    },

    backBtn: {
        marginRight: 8,
        paddingHorizontal:10,
        paddingVertical:5
    },

    logsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        borderWidth: 0.5,
        borderColor: "#2B2B2B",
        backgroundColor: '#fff',
        gap: 4,
        paddingVertical: 4,
        paddingHorizontal: 6
    },
    logsButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: "#2B2B2B",
    },
    topActionButtons: {

        flexDirection: "row",
        alignItems: "center",
        gap: 10
    },

    disabledButton: {

        opacity: 0.5

    },
    topApproveButton: {

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        borderRadius: 12,
        backgroundColor: colors.primary,
        gap: 10,
    },
    topApproveButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    topVerifyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        borderRadius: 12,
        backgroundColor: colors.primary,
        gap: 6,
    },
    topVerifyButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    topRejectButton: {
        width: 24,
        height: 24,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: '#2B2B2B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenPreviewContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenPreviewHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    fullScreenCloseButton: {
        alignSelf: 'flex-end',
        padding: 8,
    },
    imagePreviewTouchable: {
        width: '100%',
        height: '100%',
    },
    commentWrapper: {

        backgroundColor: "#F7941E1A",
        borderRadius: 100,
        padding: 10


    },
    stickyFooter: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        paddingTop: 0,
        paddingVertical: 12,
        // elevation: 10, // Android shadow
        // shadowColor: "#000", // iOS shadow
        // shadowOffset: { width: 0, height: -2 },
        // shadowOpacity: 0.1,
        // shadowRadius: 4,
    },

});


export default Customerstyles;