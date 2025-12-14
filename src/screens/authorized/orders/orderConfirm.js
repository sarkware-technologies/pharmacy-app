import React from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFeather from 'react-native-vector-icons/Feather';
import AppText from "../../../components/AppText"

const { width } = Dimensions.get('window');

// Order Cancel Confirmation Modal
export const OrderCancelModal = ({ visible, onClose, onConfirm }) => {
    const handleCancel = () => {
        onConfirm();
    };

    const handleGoBack = () => {
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContainer}>
                            {/* Alert Icon - Red/Pink */}
                            <View style={styles.iconContainer}>
                                <View style={styles.alertCircleRed}>
                                    <AppText style={styles.exclamationMark}>!</AppText>
                                </View>
                            </View>

                            {/* Title */}
                            <AppText style={styles.modalTitle}>
                                Are you sure you want to{'\n'}cancel the order?
                            </AppText>

                            {/* Buttons */}
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={styles.goBackButton}
                                    onPress={handleGoBack}
                                    activeOpacity={0.8}
                                >
                                    <AppText style={styles.goBackButtonText}>No, Go Back</AppText>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.cancelOrderButton}
                                    onPress={handleCancel}
                                    activeOpacity={0.8}
                                >
                                    <Icon name="close-circle-outline" size={20} color="#fff" />
                                    <AppText style={styles.cancelOrderButtonText}>Cancel</AppText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};
export const OrderPlaceSuccessModal = ({ visible, onClose, onGoToOrders,orderCount = 0 }) => {
    const handleGoToOrders = () => {
        onGoToOrders();
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.bottomModalOverlay}>
                    <TouchableWithoutFeedback>
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
                            <AppText style={styles.successTitle}>Congratulations!</AppText>

                            {/* Message */}
                            <AppText style={[styles.successMessage,{color:"#1D1D22",fontWeight:400}]}>
                                Your order has been successfully{'\n'}placed.
                            </AppText>
                            {/* Message */}
                            <AppText style={[styles.successMessage,{marginBottom:40,fontSize:14,color:"#1D1D22",fontWeight:700}]}>
                                {orderCount} Orders Created
                            </AppText>

                            {/* Go to Orders Button */}
                            <TouchableOpacity
                                style={styles.goToOrdersButton}
                                onPress={handleGoToOrders}
                                activeOpacity={0.8}
                            >
                                <AppText style={styles.goToOrdersButtonText}>Go to Orders</AppText>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};


const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 32,
        width: width * 0.85,
        maxWidth: 350,
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 32,
    },
    alertCircleRed: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#FF5252',
        justifyContent: 'center',
        alignItems: 'center',
    },
    exclamationMark: {
        fontSize: 40,
        color: 'white',
        fontWeight: 'bold',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#000',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 32,
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    goBackButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        backgroundColor: 'white',
        alignItems: 'center',
    },
    goBackButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    cancelOrderButton: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: '#FF5252',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    cancelOrderButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },

    // Success Modal Styles
    successModalContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 40,
        width: width * 0.85,
        maxWidth: 350,
        alignItems: 'center',
    },
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
    },
    successMessage: {
        fontSize: 16,
        color: '#666',
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
        padding: 32,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },

});

export default {
    // OrderCancelModal,
    OrderPlaceSuccessModal,
};