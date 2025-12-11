import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { AppText } from "../../../../components"
const SearchIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <Circle cx="9" cy="9" r="6" stroke="#999" strokeWidth="1.5" />
        <Path d="M13.5 13.5L17 17" stroke="#999" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
);

const SelectRC = ({ visible, onClose, }) => {

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={() => onClose?.(false)}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => onClose?.(false)}
            >
                <View style={styles.createOrderModalContent}>
                    <View style={styles.modalHeader}>
                        <AppText style={styles.modalTitle}>Group Update</AppText>
                        <TouchableOpacity onPress={() => onClose?.(false)}>
                            <CloseIcon />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={styles.orderTypeOption}
                    // onPress={() => handleCreateOrder('manual')}
                    >
                        <AddProduct />
                        <AppText style={styles.orderTypeText}>Add New Product</AppText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.orderTypeOption}
                    // onPress={() => handleCreateOrder('upload')}
                    >
                        <ProductSwapping />

                        <AppText style={styles.orderTypeText}>Product Swapping</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.orderTypeOption}
                    // onPress={() => handleCreateOrder('upload')}
                    >
                        <UpdateDiscount />

                        <AppText style={styles.orderTypeText}>Update Discount</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.orderTypeOption}
                    // onPress={() => handleCreateOrder('upload')}
                    >
                        <UpdateSupplyMode />

                        <AppText style={styles.orderTypeText}>Update Supply Mode</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.orderTypeOption}
                    // onPress={() => handleCreateOrder('upload')}
                    >
                        <QuotationGeneration />

                        <AppText style={styles.orderTypeText}>Quotation Generation</AppText>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    )

}




const styles = StyleSheet.create({
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F7941E",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: "#F7941E",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    createOrderModalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 32,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
    orderTypeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        paddingLeft: 30
    },
    orderTypeText: { fontSize: 16, color: '#333', marginLeft: 20 },
});




export default SelectRC;