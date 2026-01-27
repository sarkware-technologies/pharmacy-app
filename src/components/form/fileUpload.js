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
import DocumentPreviewModal from "../modals/DocumentPreviewModal"


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
    isLoading = false,
    error,
    onPreview
}) => {



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


    return (
        <AppView marginVertical={10}>
            <View>{
                uploadedFile != null ?
                    <View style={[styles.container, { borderWidth: 0, backgroundColor: "#F7941E0D" }]}>
                        <AppText style={[styles.text, { maxWidth: "75%" }]} numberOfLines={1} ellipsizeMode="tail" >
                            {uploadedFile?.name}
                        </AppText>
                        <View style={[CommonStyle.SpaceBetween, { gap: 15 }]}>
                            {uploadedFile?.view && (
                                <TouchableOpacity
                                     onPress={() => onPreview?.(uploadedFile)}
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
                                style={[styles.container, error && styles?.errorContainer, style, disabled && styles.disabled]}
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
                {/* <DocumentModal /> */}


                

            </View>
            {error && <AppText style={{ marginTop: 5, paddingLeft: 15 }} fontFamily="regular" fontWeight={400} color="red" >{error}</AppText>}
        </AppView>
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



    errorContainer: {
        borderColor: "red",
        borderWidth: 1.5,

    }
});
