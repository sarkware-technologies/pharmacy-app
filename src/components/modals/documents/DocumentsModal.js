import React from 'react';
import {
    View,
    Modal,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Text
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

// import { AppText } from '../../AppText';
import AppText from '../../AppText';
import CloseCircle from '../../icons/CloseCircle';
import { colors } from '../../../styles/colors';

import DocumentsList from './DocumentsList';
import AppToast from '../../AppToast';

const DocumentsModal = ({
    visible = false,
    onClose,
    loadingDocuments = false,
    customerDocuments = null,

    // 🔑 handlers from parent
    onPreview,
    onDownloadAll,
}) => {
    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            statusBarTranslucent
            onRequestClose={onClose}
        >
             <AppToast />
            <SafeAreaView style={styles.overlay}>
                {/* Background overlay */}
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    activeOpacity={1}
                    onPress={onClose}
                />

                {/* Bottom Sheet */}
                <View style={styles.sheet}>
                    {/* Header */}
                    <View style={styles.header}>
                        <AppText style={styles.title}>
                            Click to download documents
                        </AppText>

                        <TouchableOpacity onPress={onClose}>
                            <CloseCircle />
                        </TouchableOpacity>
                    </View>

                    {/* Body */}
                    {loadingDocuments ? (
                        <View style={styles.loader}>
                            <ActivityIndicator
                                size="large"
                                color={colors.primary}
                            />
                            <AppText style={styles.loaderText}>
                                Loading documents...
                            </AppText>
                        </View>
                    ) : (
                        <DocumentsList
                            customerDocuments={customerDocuments}
                            onPreview={onPreview}
                        />
                    )}

                    {/* Download All */}

                    {!loadingDocuments && <TouchableOpacity
                        style={styles.downloadAllBtn}
                        onPress={onDownloadAll}
                        activeOpacity={0.8}
                    >
                        <Icon
                            name="download-outline"
                            size={18}
                            color="#F97316"
                        />
                        <AppText style={styles.downloadAllText}>
                            Download All
                        </AppText>
                    </TouchableOpacity>}
                    
                </View>
            </SafeAreaView>
        </Modal>
    );
};

export default DocumentsModal;
const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },

    sheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 20,
        maxHeight: '85%',
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F1F1',
    },

    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },

    loader: {
        paddingVertical: 40,
        alignItems: 'center',
    },

    loaderText: {
        marginTop: 12,
        fontSize: 13,
        color: '#6B7280',
    },

    downloadAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginHorizontal: 16,
        marginTop: 12,
        paddingVertical: 14,
        borderRadius: 14,
      
    },

    downloadAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#F97316',
    },
});
