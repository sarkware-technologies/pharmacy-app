import { useEffect, useState } from "react";
import { customerAPI } from "../../../../api/customer";
import AppView from "../../../../components/AppView";
import TextButton from "../../../../components/view/textButton"
import FilePicker from "../../../../components/form/fileUpload";
import FloatingDropdown from "../../../../components/form/floatingDropdown";
import FloatingInput from "../../../../components/form/floatingInput";
import { findDocument, removeDocument, staticDOCcode } from "../utils/fieldMeta"
import { ActivityIndicator, TouchableOpacity } from "react-native";
import { AppText } from "../../../../components";
import { colors } from "../../../../styles/colors";
import OnboardStyle from "../style/onboardStyle";
import { ErrorMessage } from "../../../../components/view/error";
import FetchGst from '../../../../components/icons/FetchGst';
import { AppToastService } from '../../../../components/AppToast';

const PanAndGST = ({ setValue, formData, action, error, transferData, onPreview, closePreview, scheme }) => {

    const handleSetValue = (key, value, extra = {}) => {
        setValue?.(prev => {
            const prevPan = prev?.securityDetails?.panNumber;

            return {
                ...prev,
                securityDetails: {
                    ...prev?.securityDetails,
                    [key]: value,
                },
                ...(key === "panNumber" &&
                    prev?.isPanVerified &&
                    prevPan !== value && {
                    isPanVerified: false,
                }),
                ...extra,
            };
        });
    };


    const [gstOptions, setGstOptions] = useState([]);
    const [uploading, setUploading] = useState({});
    const [verifyPan, setVerifyPan] = useState(false)
    const [fetchGst, setFetchGst] = useState(false)

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

            if (response?.success) {
                AppToastService.show(response?.message, "success", "File Upload");


            }


            if (!response?.data?.length) return;

            const uploadFile = response?.data?.[0];

            if (uploadFile) {
                onPreview?.(uploadFile)
            }


            if (type === "pan") {
                // UpdateOCR(uploadFile?.verificationData);
                handleSetValue(
                    "panNumber",
                    uploadFile?.extractedData?.PANNumber

                );
                panVerfiy(uploadFile?.extractedData?.PANNumber)
            }


            if (type === "gst") {
                // UpdateOCR(uploadFile?.verificationData);
                handleSetValue(
                    "gstNumber",
                    uploadFile?.GSTNumber
                );



                if (uploadFile?.GSTNumber && uploadFile?.verificationData) {
                    setGstOptions(prev => [
                        ...prev,
                        {
                            id: uploadFile?.GSTNumber,
                            name: uploadFile?.GSTNumber,
                            status: uploadFile?.verificationData?.active ? 'Active' : 'Inactive',
                            type: uploadFile?.verificationData?.type,
                        },
                    ]);
                }
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
            status: e?.active ? 'Active' : 'Inactive',
            type: e?.type,

        })));
    }

    const panVerfiy = async (panNumber = null) => {
        try {
            setVerifyPan(true)
            const response = await customerAPI.documentVerify({ docTypeId: staticDOCcode.PAN, panNumber: panNumber ?? formData?.securityDetails?.panNumber });
            setVerifyPan(false)
            UpdateOCR(response?.verificationData);
            setValue?.(prev => ({
                ...prev,
                isPanVerified: true,
                securityDetails: {
                    ...prev?.securityDetails,
                    gstNumber: "",
                },
            }));
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
    const handleFetchGST = () => {
        if (!formData?.securityDetails?.panNumber) {
            AppToastService.show(
                "Enter PAN number to fetch GST",
                "warning",
                "PAN required"
            );
            return;
        }

        if (!formData?.isPanVerified) {
            AppToastService.show(
                "Verify PAN number to fetch GST",
                "warning",
                "PAN not verified"
            );
            return;
        }

        // ✅ Both conditions satisfied
        setFetchGst(true);
    };


    const fineGST = findDocument(formData?.customerDocs, staticDOCcode.GST);
    const finePAN = findDocument(formData?.customerDocs, staticDOCcode.PAN);

    const selectedGst = gstOptions?.find(
        e => e.id === formData?.securityDetails?.gstNumber
    );

    const isRequired = (attributeKey, key = "securityDetails") => {
        return !!scheme?.[key]?.find(
            (e) => e?.attributeKey === attributeKey
        )?.isMandatory;

    }


    useEffect(() => {
        setGstOptions(transferData?.gstOptions ?? [])
    }, [transferData?.gstOptions])


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
                    isRequired={isRequired("isPanUpload", 'customerDocs')}
                    placeholder="Upload PAN"
                    isLoading={uploading?.['pan']}
                    handleDelete={() => {
                        setValue?.((prev) => {
                            return {
                                ...prev,
                                customerDocs: removeDocument(formData?.customerDocs, staticDOCcode.PAN),
                            };
                        });
                        closePreview?.()
                    }}
                    error={error?.customerDocs?.[7]}
                    onPreview={onPreview}
                />
            </AppView>
            <AppView>
                <FloatingInput
                    error={error?.securityDetails?.panNumber ?? error?.isPanVerified}
                    // disabled={formData?.isPanVerified}
                    disabledColor={"white"}
                    value={formData?.securityDetails?.panNumber} onChangeText={(text) => {
                        handleSetValue("panNumber", text);
                        if (fetchGst) {
                            setFetchGst(false)
                        }
                    }} label="PAN number"
                    isRequired={isRequired("panNumber")}
                    suffix={
                        verifyPan ?
                            <ActivityIndicator size="large" color={colors.primary} /> :
                            <TouchableOpacity
                                onPress={() => !formData?.isPanVerified && panVerfiy()}
                                style={{ paddingRight: 10 }}><AppText style={{ color: colors.primary }}>{formData?.isPanVerified ? 'Verified' : 'Verify'} {(!formData?.isPanVerified && isRequired("panNumber")) && <AppText style={[OnboardStyle.requiredIcon, { fontSize: 14 }]}>*</AppText>}</AppText></TouchableOpacity>
                    }
                    maxLength={10} />


                {!fetchGst && <TouchableOpacity
                    onPress={handleFetchGST}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingBottom: 16
                    }}
                >
                    <FetchGst width={16} height={16} />
                    <AppText style={{ marginLeft: 2 }} color={colors.primary} fontWeight={600} >
                        Fetch GST from PAN
                    </AppText>
                </TouchableOpacity>}


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
                    isRequired={isRequired("isGstUpload", 'customerDocs')}
                    onSelectFile={(file) => handleFileUpload(file, 'gst', staticDOCcode.GST)}
                    isLoading={uploading?.['gst']}
                    handleDelete={() => {
                        setValue?.((prev) => {
                            return {
                                ...prev,
                                customerDocs: removeDocument(formData?.customerDocs, staticDOCcode.GST),
                            };
                        });
                        closePreview?.()
                    }}
                    onPreview={onPreview}
                />
            </AppView>
            <AppView>
                <FloatingDropdown
                    error={error?.securityDetails?.gstNumber}
                    selected={formData?.securityDetails?.gstNumber}
                    disabled={!fetchGst}
                    label="GST number"
                    searchTitle="GST number"
                    onSelect={(e) => handleSetValue("gstNumber", e?.id)}
                    options={gstOptions}
                    isRequired={isRequired("gstNumber")}
                />

                {selectedGst && (
                    <AppView style={{ marginTop: 4, marginLeft: 2 }}>

                        {selectedGst?.status && (
                            <AppText>
                                GST Status:{" "}
                                <AppText
                                    color={selectedGst.status.toLowerCase() === "active" ? "green" : "red"}
                                    fontWeight="400"
                                    fontFamily="normal"
                                >
                                    {selectedGst.status.charAt(0).toUpperCase() +
                                        selectedGst.status.slice(1)}
                                </AppText>
                            </AppText>
                        )}

                        {selectedGst?.type && (
                            <AppText style={{ marginTop: 4 }}>
                                GST Type:{" "}
                                <AppText fontFamily="normal" fontWeight="400">
                                    {selectedGst.type}
                                </AppText>
                            </AppText>
                        )}

                    </AppView>
                )}

            </AppView>
        </AppView>

    )
}

export default PanAndGST;