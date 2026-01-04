import { ScrollView, StyleSheet, View } from "react-native";
import Button from "../../../../components/Button";
import CustomModal from "../../../../components/view/customModal"
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppText } from "../../../../components";
import { colors } from "../../../../styles/colors";
import ModalWarning from "../../../../components/icons/modelWarning"
import CommonStyle from "../../../../styles/styles";
import { Fonts } from "../../../../utils/fontHelper";

const DiscountPreviousModal = ({ visible, onClose, onPress }) => {

    const List = [
        { labal: "No Change", value: "300" },
        { labal: "Fixed Rate", value: "20" },
        { labal: "Disc. On PTR", value: "25" },
        { labal: "Chatgeback", value: "30" },
        { labal: "Net rate", value: "15" },
        { labal: "WIth / Without MOQ", value: "80/100" },
    ]
    const DiscountList = [
        { labal: "Below 5%", value: "20" },
        { labal: "5%-10%", value: "20" },
        { labal: "10%-15%", value: "20" },
        { labal: "15%-20%", value: "20" },
        { labal: "20%-25%", value: "20" },
        { labal: "25%-30%", value: "20" },
    ]

    const renderCard = (item, i) => {
        return (
            <View key={item.labal + i} style={styles.discountCard}>
                <AppText
                    style={[
                        CommonStyle.secondaryText,
                        { color: colors.primaryText, fontSize: 11 },
                    ]}
                >
                    {item.labal}
                </AppText>
                <AppText style={[CommonStyle.primaryText, { fontSize: 16 }]}>
                    {item.value}
                </AppText>
            </View>
        );
    };

    return (
        <CustomModal
            onClose={onClose}
            visible={visible}
            footer={
                <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
                    <Button textStyle={CommonStyle.secondaryButtonText} style={[CommonStyle.secondaryButton, { width: "49%", paddingVertical: 15, }]} onPress={() => onPress?.("no")}>No</Button>
                    <Button style={{ width: "49%", paddingVertical: 15 }} onPress={() => onPress?.("yes")}>Yes</Button>
                </View>
            }
            footerStyle={{ borderTopWidth: 0 }}
            body={
                <View style={styles.bottomModalContainer}>
                    {/* Success Icon - Green with circles */}
                    <View style={styles.successIconContainer}>
                        <View style={styles.successCircleMiddle}>
                            <View style={styles.successCircleInner}>
                                <ModalWarning />
                            </View>
                        </View>
                    </View>

                    {/* Title */}
                    <AppText style={styles.successTitle}>Are you sure you want {'\n'} to submit the Rate Contract?</AppText>

                    {/* Message */}
                    <AppText style={[styles.successMessage]}>
                        Please review the below summary of
                        {'\n'} created rate contract
                    </AppText>
                    <ScrollView>
                        <View style={{ paddingHorizontal: 20, marginTop: 30 }}>
                            <View style={styles.gridContainer}>
                                {List.map((e, i) => renderCard(e, i))}
                            </View>

                            <AppText style={{ marginTop: 25, fontSize: 16, marginBottom: 10 }}>Discount (%)</AppText>

                            <View style={styles.gridContainer}>
                                {DiscountList.map((e, i) => renderCard(e, i))}
                            </View>
                        </View>

                    </ScrollView>
                </View>
            }
        />

    );
};


const styles = StyleSheet.create({


    // Success Modal Styles
    successIconContainer: {
        marginBottom: 10,
    },
    successCircleMiddle: {
        width: 80,
        height: 80,
        borderRadius: 48,
        backgroundColor: '#fff1f1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    successCircleInner: {
        width: 42,
        height: 42,
        borderRadius: 36,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#2B2B2B',
        marginBottom: 16,
        textAlign: "center"
    },
    successMessage: {
        fontSize: 16,
        color: colors.secondaryText,
        textAlign: 'center',
        fontFamily: Fonts.Regular,
        fontWeight: 400
    },
    goToOrdersButton: {
        width: '100%',
        paddingVertical: 11,
        borderRadius: 12,
        backgroundColor: '#F7941E',
        alignItems: 'center',
    },
    goToOrdersButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
    },
    bottomModalOverlay: {
        flex: 1,
        justifyContent: 'flex-end', // pushes content to bottom
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },

    bottomModalContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 35,
        paddingBottom: 25,
        width: '100%',
        alignItems: 'center',
    },

    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
        gap: 10, // RN 0.71+ (safe in modern setups)
    },

    discountCard: {
        backgroundColor: '#eef4f9',
        paddingVertical: 13,
        paddingHorizontal: 10,
        borderRadius: 12,
        gap: 7,
        width: '31%', // 👈 3 items per row
    },
});


export default DiscountPreviousModal;