import React from 'react';
import {
    View,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ScrollView,
} from 'react-native';
import AppText from '../AppText';
import { CloseIcon } from '../icons/pricingIcon';

const CustomModal = ({
    visible = false,
    onClose,
    title,
    body,
    footer,
    viewStyle,
    customHeader,
    closeOnBackdrop = true,
    footerStyle,
    headerStyle,
    showClose = true,
    bodyScrollable = true
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            statusBarTranslucent
        >
            <TouchableWithoutFeedback
                disabled={!closeOnBackdrop}
                onPress={() => onClose?.()}
            >
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={[styles.container, viewStyle]}>

                            {/* Header */}
                            {customHeader ? (
                                customHeader
                            ) : (
                                title ? (
                                    <View style={[styles.header, headerStyle]}>
                                        <AppText style={styles.title}>{title}</AppText>
                                        {showClose && (
                                            <TouchableOpacity onPress={() => onClose?.()} hitSlop={10}>
                                                <CloseIcon />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ) : null
                            )}
                            {body && (
                                bodyScrollable ?
                                    <ScrollView
                                        contentContainerStyle={styles.bodyContent}
                                        showsVerticalScrollIndicator={false}
                                    >
                                        {body}
                                    </ScrollView> :
                                    body
                            )}

                            {footer && (
                                <View style={[styles.footer, footerStyle]}>
                                    {footer}
                                </View>
                            )}

                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '85%',
        overflow: 'hidden',
        flexDirection: 'column',
    },

    /* Fixed header */
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },

    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
    },

    /* Body uses remaining height */
    body: {
        flex: 1,
    },
    bodyContent: {
        padding: 16,
    },

    /* Fixed footer */
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
});

export default CustomModal;
