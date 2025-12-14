import { StyleSheet, View } from "react-native";
import Button from "../../../../components/Button";
import CustomModal from "../../../../components/view/customModal"
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppText } from "../../../../components";
import { colors } from "../../../../styles/colors";

const SuccessModal = ({ visible, onClose, onPress }) => {

    return (
        <CustomModal
            onClose={onClose}
            visible={visible}
            footer={<Button onPress={() => onPress?.()}>Go to Pricing</Button>}
            footerStyle={{ borderTopWidth: 0 }}
            body={
                <View style={styles.bottomModalContainer}>
                    {/* Success Icon - Green with circles */}
                    <View style={styles.successIconContainer}>
                        <View style={styles.successCircleOuter}>
                            <View style={styles.successCircleMiddle}>
                                <View style={styles.successCircleInner}>
                                    <Icon name="check" size={30} color="#fff" />
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Title */}
                    <AppText style={styles.successTitle}>Rate Contract Submitted {'\n'}Successfully!</AppText>

                    {/* Message */}
                    <AppText style={[styles.successMessage, { color: "#1D1D22", fontWeight: 400 }]}>
                        Id: SUNRC_10
                    </AppText>
                </View>
            }
        />

    );
};


const styles = StyleSheet.create({


    // Success Modal Styles
    successIconContainer: {
        marginBottom: 32,
    },
    successCircleOuter: {
        width: 100,
        height: 100,
        borderRadius: 60,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    successCircleMiddle: {
        width: 76,
        height: 76,
        borderRadius: 48,
        backgroundColor: '#C8E6C9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    successCircleInner: {
        width: 42,
        height: 42,
        borderRadius: 36,
        backgroundColor: '#169560',
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
        fontSize: 14,
        color: colors.primaryText,
        textAlign: 'center',
        // marginBottom: 40,
        lineHeight: 26,
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
        paddingTop: 52,
        paddingBottom: 25,
        width: '100%',
        alignItems: 'center',
    },

});


export default SuccessModal