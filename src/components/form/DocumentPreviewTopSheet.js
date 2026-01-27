import React, { useState } from 'react';
import {
    View,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    StyleSheet,
    Dimensions,
    ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Pdf from 'react-native-pdf';

const { width, height } = Dimensions.get('window');

const isImage = (fileName = '') =>
    /\.(jpg|jpeg|png)$/i.test(fileName);
const isPdf = (fileName = '') => /\.pdf$/i.test(fileName);



const DocumentPreviewTopSheet = ({
    visible = false,
    onClose,
    uploadedFile,
    signedUrl,
    loading = false,
}) => {



    const [zoom, setZoom] = useState(1);
const [pdfLoading, setPdfLoading] = useState(true);

    if (!visible) return null;
    const isImageFile = isImage(uploadedFile?.name);
    const isPdfFile = isPdf(uploadedFile?.name);

    return (
        <View style={styles.wrapper}>

            {/* DOCUMENT VIEWPORT */}
          <View style={styles.viewport}>

    {(loading || pdfLoading) && (
        <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color="#333" />
        </View>
    )}

    {isPdfFile ? (
        <Pdf
            source={{ uri: signedUrl }}
            style={styles.pdf}
            trustAllCerts={false}
            enablePaging
            scale={zoom}
            onLoadStart={() => setPdfLoading(true)}
            onLoadComplete={() => setPdfLoading(false)}
            onError={(error) => {
                console.log(error);
                setPdfLoading(false);
            }}
             renderActivityIndicator={() => null}
        />
    ) : (
        !loading && (
            <ScrollView
                horizontal={false}
                showsVerticalScrollIndicator={false}
                bounces={false}
                contentContainerStyle={styles.scrollContent}
            >
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <Image
                        source={{ uri: signedUrl }}
                        style={[
                            styles.documentImage,
                            { height: height * 0.45 * zoom },
                        ]}
                        resizeMode="contain"
                        onLoadStart={() => setPdfLoading(true)}
                        onLoadEnd={() => setPdfLoading(false)}
                    />
                </ScrollView>
            </ScrollView>
        )
    )}

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
                            onPress={() => setZoom(z => Math.min(z + 0.25, 3))}
                        >
                            <Icon name="add" size={18} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.controlBtn}
                            onPress={() => setZoom(z => Math.max(z - 0.25, 1))}
                        >
                            <Icon name="remove" size={18} />
                        </TouchableOpacity>
                    </>
                )}


            </View>

        </View>
    );
};

export default DocumentPreviewTopSheet;
const styles = StyleSheet.create({
    wrapper: {
        marginHorizontal: 16,
        backgroundColor: '#C7CFD6',
        borderRadius: 22,
        padding: 14,
        marginBottom: 12,
        position: 'relative',

        elevation: 6,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
    },

    viewport: {
        borderRadius: 16,
        overflow: 'hidden',
        height: height * 0.45,
    },

    scrollContent: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100%',
    },
    documentImage: {
        height: '100%',
        aspectRatio: 0.75,
    },

    pdf: {
        flex: 1,
        width: '100%',
        height: height * 0.45,
         backgroundColor: '#C7CFD6',
        // backgroundColor: '#fff',
    },

    /* RIGHT FLOATING CONTROLS */
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
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
});
