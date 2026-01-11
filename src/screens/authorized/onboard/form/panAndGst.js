import { useEffect, useState } from "react";
import { customerAPI } from "../../../../api/customer";
import AppView from "../../../../components/AppView";
import FilePicker from "../../../../components/form/fileUpload";
import FloatingDropdown from "../../../../components/form/floatingDropdown";
import FloatingInput from "../../../../components/form/floatingInput";
import { findDocument, removeDocument, staticDOCcode } from "../utils/fieldMeta"
import { ActivityIndicator, TouchableOpacity } from "react-native";
import { AppText } from "../../../../components";
import { colors } from "../../../../styles/colors";
import OnboardStyle from "../style/onboardStyle";
import { ErrorMessage } from "../../../../components/view/error";

const PanAndGST = ({ setValue, formData, action, error }) => {

    const handleSetValue = (key, value) => {
        setValue?.((prev) => {
            return { ...prev, securityDetails: { ...prev?.securityDetails, [key]: value } }
        })
    }

    const [gstOptions, setGstOptions] = useState([]);


    const [uploading, setUploading] = useState({});
    const [verifyPan, setVerifyPan] = useState(false)


    const startUpload = (key) =>
        setUploading(p => ({ ...p, [key]: true }));

    const stopUpload = (key) =>
        setUploading(p => ({ ...p, [key]: false }));




    const handleFileUpload = async (file, type, docTypes) => {
        try {
            startUpload(type);
            const response = await customerAPI.documentUpload({
                file,
                docTypes,
                isStaging: true,
                isOcrRequired: true,
            });

            if (!response?.length) return;

            const uploadFile = response[0];
            if (type == 'pan') {
                handleSetValue("panNumber", uploadFile?.extractedData?.PANNumber)
                UpdateOCR(uploadFile?.verificationData);
            }

            const docObject = {
                s3Path: uploadFile?.s3Path,
                docTypeId: uploadFile?.docTypeId,
                fileName: uploadFile?.fileName,
                customerId: formData?.customerId ?? null,
                id: uploadFile?.id,
            };

            setValue?.((prev) => {
                const customerDocs = prev?.customerDocs ?? [];

                const existingIndex = customerDocs.findIndex(
                    (e) => e?.docTypeId == uploadFile?.docTypeId
                );

                let updatedDocs;

                if (existingIndex !== -1) {
                    // ✅ replace existing doc (immutable)
                    updatedDocs = customerDocs.map((doc, index) =>
                        index == existingIndex ? docObject : doc
                    );
                } else {
                    // ✅ add new doc
                    updatedDocs = [...customerDocs, docObject];
                }

                return {
                    ...prev,
                    customerDocs: updatedDocs,
                };
            });
        } catch (error) {
            console.log(error);
            if (error?.status == 400) {
                ErrorMessage(error);
            }
        }
        finally {
            stopUpload(type);
        }
    };


    const UpdateOCR = (verificationData) => {
        setGstOptions(verificationData?.gstByPan?.records?.map((e) => ({
            id: e?.gstin,
            name: e?.gstin,
        })));
    }


    const panVerfiy = async () => {
        try {
            setVerifyPan(true)
            const response = await customerAPI.documentVerify({ docTypeId: staticDOCcode.PAN, panNumber: formData?.securityDetails?.panNumber });
            setVerifyPan(false)
            UpdateOCR(response?.data?.verificationData);
            setValue?.((prev) => {
                return { ...prev, isPanVerified: true }
            })
        }
        catch (error) {
            console.log(error);
            if (error?.status == 400) {
                ErrorMessage(error);
            }
        }
        finally {
            setVerifyPan(false)
        }
    }

    const fineGST = findDocument(formData?.customerDocs, staticDOCcode.GST);
    const finePAN = findDocument(formData?.customerDocs, staticDOCcode.PAN);
    return (
        <AppView>
            <AppView >
                <FilePicker
                    uploadedFile={finePAN && {
                        name: finePAN?.fileName,
                        url: finePAN?.s3Path,
                        view: true,
                        remove: true,
                    }}
                    accept={[]}
                    onSelectFile={(file) => handleFileUpload(file, 'pan', staticDOCcode.PAN)}
                    isRequired={true} placeholder="Upload PAN"
                    isLoading={uploading?.['pan']}
                    handleDelete={() => {
                        setValue?.((prev) => {
                            return {
                                ...prev,
                                customerDocs: removeDocument(formData?.customerDocs, staticDOCcode.PAN),
                            };
                        });
                    }}
                    error={error?.customerDocs?.[7]}
                />
            </AppView>
            <AppView>
                <FloatingInput
                    error={error?.securityDetails?.panNumber ?? error?.isPanVerified}
                    disabled={formData?.isPanVerified}
                    disabledColor={"white"}
                    value={formData?.securityDetails?.panNumber} onChangeText={(text) => handleSetValue("panNumber", text)} label="PAN number" isRequired={true}
                    suffix={
                        verifyPan ?
                            <ActivityIndicator size="large" color={colors.primary} /> :
                            <TouchableOpacity
                                onPress={() => !formData?.isPanVerified && panVerfiy()}
                                style={{ paddingRight: 10 }}><AppText style={{ color: colors.primary }}>{formData?.isPanVerified ? 'Verified' : 'Verify'} {!formData?.isPanVerified && <AppText style={[OnboardStyle.requiredIcon, { fontSize: 14 }]}>*</AppText>}</AppText></TouchableOpacity>
                    }
                    maxLength={10} />
            </AppView>
            <AppView >
                <FilePicker
                    error={error?.securityDetails?.gstFile}
                    accept={[]}
                    uploadedFile={fineGST && {
                        name: fineGST?.fileName,
                        url: fineGST?.s3Path,
                        view: true,
                        remove: true,
                    }}
                    placeholder="Upload GST"
                    onSelectFile={(file) => handleFileUpload(file, 'gst', staticDOCcode.GST)}
                    isLoading={uploading?.['gst']}
                    handleDelete={() => {
                        setValue?.((prev) => {
                            return {
                                ...prev,
                                customerDocs: removeDocument(formData?.customerDocs, staticDOCcode.GST),
                            };
                        });
                    }}
                />
            </AppView>
            <AppView>
                <FloatingDropdown
                    error={error?.securityDetails?.gstNumber}
                    selected={formData?.securityDetails?.gstNumber}
                    label="GST number"
                    searchTitle="GST number"
                    onSelect={(e) => handleSetValue("gstNumber", e?.id)}
                    options={gstOptions}
                />
            </AppView>
        </AppView>

    )
}

export default PanAndGST;