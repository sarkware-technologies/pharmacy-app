import React, { useEffect, useState } from 'react';
import {
    View,
    Modal,
    TouchableOpacity,
    Image,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Dimensions,
    Linking, Alert
} from 'react-native';
import AppText from '../../AppText';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {Platform } from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import Pdf from 'react-native-pdf';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppToast, { AppToastService } from '../../AppToast';


const { height } = Dimensions.get('window');

const isImage = (name = '') => /\.(jpg|jpeg|png)$/i.test(name);
const isPdf = (name = '') => /\.pdf$/i.test(name);

const DocumentPreviewModal = ({
    visible = false,
    onClose,
    document = null,
    signedUrl = null,
}) => {
    const [zoom, setZoom] = useState(1);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        if (!visible) {
            setZoom(1);
            setPdfLoading(false);
            setImageLoading(false);
        }
    }, [visible]);

    if (!visible || !document || !signedUrl) return null;

    const fileName = document?.fileName || document?.name || '';
    const isImageFile = isImage(fileName);
    const isPdfFile = isPdf(fileName);

    const showLoader =
        (isPdfFile && pdfLoading) || (isImageFile && imageLoading);

    const getMimeType = (extension) => {
        const mimeTypes = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'bmp': 'image/bmp',
            'webp': 'image/webp',
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'mp4': 'video/mp4',
            'mov': 'video/quicktime',
            'avi': 'video/x-msvideo',
            'mkv': 'video/x-matroska',
            '3gp': 'video/3gpp',
        };
        return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
    };
    const handleDownload = async (docInfo) => {
        if (isDownloading) {
            AppToastService.show('Download in progress', 'warning', 'Downloading')

            return;
        }

        try {
            setIsDownloading(true);

            if (!docInfo?.s3Path) {

                AppToastService.show('Document not available', 'error', 'Download Error')

                return;
            }

            // 1️⃣ Get signed URL


            if (!signedUrl) {


                AppToastService.show('Unable to fetch download link', 'error', 'Download Error')
                return;
            }

            // 2️⃣ File details
            const fileName = docInfo.fileName || docInfo.doctypeName || 'document';
            const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';

            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension);
            const isVideo = ['mp4', 'mov', 'avi', 'mkv', '3gp'].includes(fileExtension);

            const dirs = ReactNativeBlobUtil.fs.dirs;
            let downloadPath;

            if (Platform.OS === 'android') {
                if (isImage) downloadPath = dirs.PictureDir;
                else if (isVideo) downloadPath = dirs.MovieDir || dirs.DownloadDir;
                else downloadPath = dirs.DownloadDir;
            } else {
                downloadPath = dirs.DocumentDir;
            }

            const filePath = `${downloadPath}/${fileName}`;


            AppToastService.show('Downloading...', 'warning', 'Downloading')

            // 3️⃣ AUTO DOWNLOAD (Android Download Manager)
            await ReactNativeBlobUtil.config({
                addAndroidDownloads: {
                    useDownloadManager: true,
                    notification: true,
                    title: fileName,
                    description: 'Downloading file...',
                    mime: getMimeType(fileExtension),
                    mediaScannable: true,
                    path: filePath,
                },
            }).fetch('GET', signedUrl);


            AppToastService.show('Check notification / Downloads folder', 'success', 'Download started')
        } catch (error) {
            console.error('Download error:', error);


            AppToastService.show(error?.message || 'Something went wrong', 'error', 'Download failed')

        } finally {
            setIsDownloading(false);
        }
    };





    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <AppToast />
            <SafeAreaView style={styles.overlay}>
                <View style={styles.wrapper}>
                    {/* VIEWPORT */}
                    <View style={styles.viewport}>
                        {showLoader && (
                            <View style={styles.loaderOverlay}>
                                <ActivityIndicator size="large" color="#333" />
                            </View>
                        )}

                        {/* PDF */}
                        {isPdfFile && (
                            <Pdf
                                source={{ uri: signedUrl }}
                                style={styles.pdf}
                                trustAllCerts={false}
                                enablePaging
                                scale={zoom}
                                onLoadStart={() => setPdfLoading(true)}
                                onLoadComplete={() => setPdfLoading(false)}
                                onError={() => setPdfLoading(false)}
                                renderActivityIndicator={() => null}
                            />
                        )}

                        {/* IMAGE */}
                        {isImageFile && (
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                bounces={false}
                                contentContainerStyle={styles.scrollContent}
                            >
                                <Image
                                    key={signedUrl} // 🔑 force remount
                                    source={{ uri: signedUrl }}
                                    style={[
                                        styles.documentImage,
                                        { transform: [{ scale: zoom }] },
                                    ]}
                                    resizeMode="resize"
                                    onLoadStart={() => setImageLoading(true)}
                                    onLoadEnd={() => setImageLoading(false)}
                                    onError={() => setImageLoading(false)}
                                />
                            </ScrollView>
                        )}

                        <TouchableOpacity
                            style={styles.downloadAllBtn}
                            onPress={() => { handleDownload(document) }}
                            activeOpacity={0.8}
                        >
                            <Icon
                                name="download-outline"
                                size={18}
                                color="#F97316"
                            />
                            <AppText style={styles.downloadAllText}>
                                Download
                            </AppText>
                        </TouchableOpacity>
                    </View>

                    {/* FLOATING CONTROLS */}
                    <View style={styles.controls}>
                        <TouchableOpacity
                            style={styles.controlBtn}
                            onPress={() => {
                                setZoom(1);
                                onClose?.();
                            }}
                        >
                            <Icon name="close" size={18} />
                        </TouchableOpacity>

                        {isImageFile && (
                            <>
                                <TouchableOpacity
                                    style={styles.controlBtn}
                                    onPress={() =>
                                        setZoom(z => Math.min(z + 0.25, 3))
                                    }
                                >
                                    <Icon name="add" size={18} />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.controlBtn}
                                    onPress={() =>
                                        setZoom(z => Math.max(z - 0.25, 1))
                                    }
                                >
                                    <Icon name="remove" size={18} />
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

export default DocumentPreviewModal;
const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    wrapper: {
        marginHorizontal: 16,
        backgroundColor: '#C7CFD6',
        borderRadius: 22,
        padding: 14,
        width: '90%',
        elevation: 6,
    },

    viewport: {
        borderRadius: 16,
        overflow: 'hidden',
        height: height * 0.45,
        backgroundColor: '#C7CFD6',
    },

    loaderOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.15)',
    },

    scrollContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    documentImage: {
        width: '100%',
        height: '100%',
    },

    pdf: {
        flex: 1,
        width: '100%',
        backgroundColor: '#C7CFD6',
    },

    controls: {
        position: 'absolute',
        right: 20,
        top: 30,
        zIndex: 30,
    },

    controlBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        elevation: 4,
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
