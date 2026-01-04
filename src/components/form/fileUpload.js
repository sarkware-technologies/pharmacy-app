import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Alert, View, Modal, ActivityIndicator, Image, Dimensions } from 'react-native';
import { pick, types } from '@react-native-documents/picker';
import { AppText } from '..';
import Upload from '../icons/Upload';
import { colors } from '../../styles/colors';
import CloseCircle from '../icons/CloseCircle';
import EyeOpen from '../icons/EyeOpen';
import CommonStyle from '../../styles/styles';
import ModalClose from '../icons/modalClose';
import Icon from 'react-native-vector-icons/Ionicons';
import { customerAPI } from '../../api/customer';
import AppView from '../AppView';


const { width } = Dimensions.get('window');

const FilePicker = ({
    placeholder = 'Upload file',
    accept = ['pdf', 'jpg', 'jpeg', 'png'],
    maxSize = 15 * 1024 * 1024,
    disabled = false,
    isRequired = false,
    onSelectFile,
    style,
    uploadedFile,
    handleDelete,
    isLoading = false
}) => {

    const [signedUrl, setSignedUrl] = useState(null)
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [loadingDoc, setLoadingDoc] = useState(false);


    const validateFile = ({ name, size }) => {
        if (size && size > maxSize) {
            Alert.alert(
                'Invalid file',
                `File size must be less than ${maxSize / (1024 * 1024)}MB`
            );
            return false;
        }

        // ✅ allow all file types if accept is empty
        if (!accept || accept.length === 0) {
            return true;
        }

        const ext = name?.split('.').pop()?.toLowerCase();
        if (!accept.includes(ext)) {
            Alert.alert(
                'Invalid file',
                `Only ${accept.join(', ')} files are allowed`
            );
            return false;
        }

        return true;
    };


    const openFilePicker = async () => {
        if (disabled) return;

        try {
            const [doc] = await pick({
                type: [types.allFiles],
                allowMultiSelection: false,
            });

            const file = {
                uri: doc.uri,
                name: doc.name,
                type: doc.type || 'application/octet-stream',
                size: doc.size,
            };

            if (!validateFile(file)) return;

            onSelectFile?.(file);
        } catch (e) {
            // user cancelled → do nothing
        }
    };



    const handlePreview = async () => {
        if (!uploadedFile.url) return;

        setShowDocumentModal(true);
        setLoadingDoc(true);

        try {
            // Get signed URL for preview
            const response = await customerAPI.getDocumentSignedUrl(uploadedFile.url);

            if (response.success && response.data && response.data.signedUrl) {
                setSignedUrl(response.data.signedUrl);
            } else {
                throw new Error('Failed to get preview URL');
            }

        } catch (error) {
            console.error('Preview error:', error);
            Alert.alert('Preview Failed', 'Unable to preview file. Please try again.');
            setShowDocumentModal(false);
        } finally {
            setLoadingDoc(false);
        }
    };



    const closeModal = () => {
        setShowDocumentModal(false);
        setSignedUrl(null);
    };

    const DocumentModal = () => {
        return (
            <Modal
                visible={showDocumentModal}
                transparent
                animationType="fade"
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.documentModalContent}>
                        <View style={styles.modalHeader}>
                            <AppText style={styles.modalTitle}>
                                {uploadedFile?.name || 'DOCUMENT'}
                            </AppText>
                            <TouchableOpacity onPress={closeModal}>
                                <CloseCircle />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.documentImageContainer}>
                            {loadingDoc ? (
                                <ActivityIndicator size="large" color={colors.primary} />
                            ) : signedUrl && (uploadedFile?.name?.toLowerCase().endsWith('.jpg') ||
                                uploadedFile?.name?.toLowerCase().endsWith('.jpeg') ||
                                uploadedFile?.name?.toLowerCase().endsWith('.png')) ? (
                                <Image
                                    source={{ uri: signedUrl }}
                                    style={{ width: '100%', height: 300 }}
                                    resizeMode="contain"
                                />
                            ) : signedUrl ? (
                                <View style={styles.dummyDocument}>
                                    <Icon name="document-text" size={100} color="#999" />
                                    <AppText style={styles.documentName}>{uploadedFile?.name}</AppText>
                                    <TouchableOpacity
                                        style={styles.downloadButton}
                                        onPress={() => {
                                            // Open the signed URL in browser for download
                                            if (signedUrl) {
                                                require('react-native/Libraries/Linking/Linking').openURL(signedUrl);
                                            }
                                        }}
                                    >
                                        <Icon name="download-outline" size={20} color="#fff" />
                                        <AppText style={styles.downloadButtonText}>Download</AppText>
                                    </TouchableOpacity>
                                </View>
                            ) : null}
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };



    return (
        <View>{
            uploadedFile != null ?
                <View style={[styles.container, { borderWidth: 0, backgroundColor: "#F7941E0D" }]}>
                    <AppText style={[styles.text, { maxWidth: "75%" }]} numberOfLines={1} ellipsizeMode="tail" >
                        {uploadedFile?.name}
                    </AppText>
                    <View style={[CommonStyle.SpaceBetween, { gap: 15 }]}>
                        {uploadedFile?.view && (
                            <TouchableOpacity
                                onPress={handlePreview}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <EyeOpen color={colors.primary} />
                            </TouchableOpacity>
                        )}

                        {uploadedFile?.remove && (
                            <TouchableOpacity
                                onPress={() => handleDelete?.()}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <ModalClose width={20} />
                            </TouchableOpacity>
                        )}

                    </View>
                </View>
                : (
                    isLoading ?
                        <AppView style={[styles.container, { justifyContent: "center" }, style, disabled && styles.disabled]} gap={10} alignItems={"center"} flexDirection={"row"}>
                            <AppText>
                                Uploading...
                            </AppText>
                            <ActivityIndicator size="small" color="#F7941E" />
                        </AppView> :
                        <TouchableOpacity
                            style={[styles.container, style, disabled && styles.disabled]}
                            onPress={openFilePicker}
                            activeOpacity={0.7}
                        >
                            {isLoading ? <AppView>

                            </AppView> :
                                <AppView>

                                </AppView>
                            }
                            <AppText fontFamily='regular' style={styles.text}>
                                {placeholder}
                                {isRequired && <AppText style={styles.asterisk}> *</AppText>}
                            </AppText>
                            <Upload color={colors.primary} />
                        </TouchableOpacity>
                )
        }
            <DocumentModal />
        </View>
    );
};

export default FilePicker;

const styles = StyleSheet.create({
    container: {
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: colors.primary,
        borderRadius: 12,
        padding: 16,
        backgroundColor: '#FFF5ED',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
    },
    text: {
        fontSize: 14,
        color: colors.text,
        flex: 1,
    },
    asterisk: {
        color: 'red',
    },
    disabled: {
        opacity: 0.6,
    },


    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    documentModalContent: {
        width: width * 0.9,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        maxHeight: '80%',
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
        flex: 1,
        marginRight: 12,
    },
    documentImageContainer: {
        alignItems: 'center',
        paddingVertical: 40,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        marginBottom: 20,
        minHeight: 200,
        justifyContent: 'center',
    },
    dummyDocument: {
        alignItems: 'center',
    },
    documentName: {
        marginTop: 16,
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        marginTop: 20,
    },
    downloadButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
});
