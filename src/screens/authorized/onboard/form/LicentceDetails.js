import { AppText } from "../../../../components";
import { TouchableOpacity, View } from "react-native";
import AccordionCard from "../../../../components/view/AccordionCard";
import FloatingInput from "../../../../components/form/floatingInput";
import FloatingDropdown from "../../../../components/form/floatingDropdown";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import OnboardStyle from "../style/onboardStyle";
import Downarrow from "../../../../components/icons/downArrow";
import CommonStyle from "../../../../styles/styles";
import { colors } from "../../../../styles/colors";
import FilePicker from "../../../../components/form/fileUpload"
import FloatingDatePicker from "../../../../components/form/floatingDatePicker"
import Svg, { Path } from "react-native-svg";
import AppView from "../../../../components/AppView";

import PanAndGST from "./panAndGst"
import { customerAPI } from "../../../../api/customer";
import { findDocument, findLicense, removeDocument, staticDOCcode } from "../utils/fieldMeta";


const RenderLicense = memo(
    ({
        title,
        titleFontSize = 16,
        isRequired,
        file,
        code,
        nin,
        date,
        officialLetter,
        info,
    }) => {
        return (
            <AppView>
                {title && (
                    <AppView style={[CommonStyle.SpaceBetween, { justifyContent: "flex-start" }]}>
                        <AppText fontSize={titleFontSize}>
                            {title}
                            {isRequired && (
                                <AppText color="#E84141" fontSize={titleFontSize}> *</AppText>
                            )}
                        </AppText>
                        {info &&
                            <TouchableOpacity style={{ paddingLeft: 10 }}>
                                <Svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <Path d="M6.66667 13.3333C2.98467 13.3333 0 10.3487 0 6.66667C0 2.98467 2.98467 0 6.66667 0C10.3487 0 13.3333 2.98467 13.3333 6.66667C13.3333 10.3487 10.3487 13.3333 6.66667 13.3333ZM6.66667 12C8.08115 12 9.43771 11.4381 10.4379 10.4379C11.4381 9.43771 12 8.08115 12 6.66667C12 5.25218 11.4381 3.89562 10.4379 2.89543C9.43771 1.89524 8.08115 1.33333 6.66667 1.33333C5.25218 1.33333 3.89562 1.89524 2.89543 2.89543C1.89524 3.89562 1.33333 5.25218 1.33333 6.66667C1.33333 8.08115 1.89524 9.43771 2.89543 10.4379C3.89562 11.4381 5.25218 12 6.66667 12ZM6.66667 5.33333C6.84348 5.33333 7.01305 5.40357 7.13807 5.5286C7.2631 5.65362 7.33333 5.82319 7.33333 6V9.33333C7.33333 9.51014 7.2631 9.67971 7.13807 9.80474C7.01305 9.92976 6.84348 10 6.66667 10C6.48986 10 6.32029 9.92976 6.19526 9.80474C6.07024 9.67971 6 9.51014 6 9.33333V6C6 5.82319 6.07024 5.65362 6.19526 5.5286C6.32029 5.40357 6.48986 5.33333 6.66667 5.33333ZM6.66667 4.66667C6.48986 4.66667 6.32029 4.59643 6.19526 4.4714C6.07024 4.34638 6 4.17681 6 4C6 3.82319 6.07024 3.65362 6.19526 3.5286C6.32029 3.40357 6.48986 3.33333 6.66667 3.33333C6.84348 3.33333 7.01305 3.40357 7.13807 3.5286C7.2631 3.65362 7.33333 3.82319 7.33333 4C7.33333 4.17681 7.2631 4.34638 7.13807 4.4714C7.01305 4.59643 6.84348 4.66667 6.66667 4.66667Z" fill="#777777" />
                                </Svg>
                            </TouchableOpacity>
                        }
                    </AppView>
                )}

                {file && (
                    <AppView>
                        <FilePicker {...file} />
                    </AppView>
                )}

                {code && (
                    <AppView>
                        <FloatingInput {...code} />
                    </AppView>
                )}

                {nin && (
                    <AppView>
                        <FloatingInput {...nin} />
                    </AppView>
                )}

                {date && (
                    <AppView>
                        <FloatingDatePicker {...date} />
                    </AppView>
                )}

                {officialLetter && (
                    <AppView>
                        <FilePicker {...officialLetter} />
                    </AppView>
                )}
            </AppView>
        );
    }
);




const LicenseDetails = ({ setValue, isAccordion = false, formData, action, licenseList, error }) => {
    const uniqueLicenses = licenseList.reduce((acc, cur) => {
        if (!acc.some(e => e.code === cur.code)) {
            acc.push({
                code: cur.code,
                docTypeId: cur.docTypeId,
                name: cur.name,
                licenceTypeId: cur.id,
            })
        }
        return acc
    }, [])

    const [toggle, setToggle] = useState("open");
    const [uploading, setUploading] = useState("");

    const handleToggle = useCallback(() => {
        setToggle(p => (p === "open" ? "close" : "open"));
    }, []);


    const licenseMap = useMemo(() => {
        return uniqueLicenses.reduce((acc, lic) => {
            acc[lic.code] = lic;
            return acc;
        }, {});
    }, [uniqueLicenses]);

    const handleFileUpload = useCallback(async (file, type, docTypes, isOcrRequired = true) => {
        try {
            setUploading(type);

            const response = await customerAPI.documentUpload({
                file,
                docTypes,
                isStaging: true,
                isOcrRequired,
            });

            if (!response?.length) return;

            const uploadFile = response[0];

            const docObject = {
                s3Path: uploadFile?.s3Path,
                docTypeId: uploadFile?.docTypeId,
                fileName: uploadFile?.fileName,
                customerId: formData?.customerId ?? null,
                id: uploadFile?.id,
            };

            // ✅ Always clone state
            let updatedForm = { ...formData };

            // ✅ OCR-based auto fill
            if (uploadFile?.docTypeId && uploadFile?.extractedData) {
                const extractedData = uploadFile.extractedData;

                // Licence number auto-fill
                if (extractedData?.LicenseNumber) {
                    updatedForm = updateValue(
                        extractedData.LicenseNumber,
                        type,
                        docTypes,
                        "licenceNo",
                        updatedForm
                    );
                }

                // Licence expiry date auto-fill (DD-MM-YYYY → YYYY-MM-DD)
                const rawDate =
                    updatedForm?.categoryId == 4
                        ? (extractedData?.RegistrationDate || extractedData?.ExpiryDate)
                        : extractedData?.ExpiryDate;

                if (rawDate) {
                    const [dd, mm, yyyy] = rawDate.split('-');

                    if (dd && mm && yyyy) {
                        updatedForm = updateValue(
                            `${yyyy}-${mm}-${dd}`,
                            type,
                            docTypes,
                            "licenceValidUpto",
                            updatedForm
                        );
                    }
                }


                const rawAddress =
                    extractedData?.address ||
                    extractedData?.PharmacyAddress ||
                    extractedData?.HospitalAddress ||
                    extractedData?.Address ||
                    null;



                let addressParts = null;

                if (rawAddress) {
                    const parts = rawAddress.split(',').map(p => p.trim()).filter(Boolean);

                    addressParts = {
                        address1: parts[0] || "",
                        address2: parts[1] || "",
                        address3: parts[2] || "",
                        address4: parts.slice(3).join(', ') || "",
                    };
                }


                // General details auto-fill (SAFE merge)
                updatedForm = {
                    ...updatedForm,
                    generalDetails: {
                        ...updatedForm?.generalDetails,
                        ...(extractedData?.PharmacyName || extractedData?.hospitalName || extractedData?.Name
                            ? {
                                name:
                                    extractedData.PharmacyName ??
                                    extractedData.hospitalName ??
                                    extractedData.Name,

                            }
                            : {}),
                        ...(extractedData?.Pincode ||extractedData?.pincode
                            ? { pincode: String(extractedData.Pincode) ??  String(extractedData.pincode)}
                            : {}),


                        ...(addressParts?.address1 && !updatedForm?.generalDetails?.address1
                            ? { address1: addressParts.address1.trim().slice(0, 40) }
                            : {}),

                        ...(addressParts?.address2 && !updatedForm?.generalDetails?.address2
                            ? { address2: addressParts.address2.trim().slice(0, 40) }
                            : {}),

                        ...(addressParts?.address3 && !updatedForm?.generalDetails?.address3
                            ? { address3: addressParts.address3.trim().slice(0, 60) }
                            : {}),

                        ...(addressParts?.address4 && !updatedForm?.generalDetails?.address4
                            ? { address4: addressParts.address4.trim().slice(0, 60) }
                            : {}),
                    },
                };
            }

            const customerDocs = updatedForm?.customerDocs ?? [];

            const existingIndex = customerDocs.findIndex(
                (e) => e?.docTypeId == uploadFile?.docTypeId
            );

            const updatedDocs =
                existingIndex !== -1
                    ? customerDocs.map((doc, idx) =>
                        idx === existingIndex ? docObject : doc
                    )
                    : [...customerDocs, docObject];

            setValue({
                ...updatedForm,
                customerDocs: updatedDocs,
            });

        } catch (error) {
            console.log(error);
            if (error?.status == 400) {
                ErrorMessage(error);
            }
        } finally {
            setUploading("");
        }
    }, [formData, licenseMap]);



    const updateValue = (value, type, docTypeId, key, currentForm = formData) => {
        const prevLicenceDetails = currentForm?.licenceDetails ?? {};
        const prevLicences = prevLicenceDetails?.licence ?? [];

        const licenseMeta = licenseMap?.[type];
        if (!licenseMeta) return currentForm;

        const licenceTypeId = licenseMeta.licenceTypeId;

        const existingIndex = prevLicences.findIndex(
            (l) => l.licenceTypeId == licenceTypeId
        );

        let updatedLicences;

        if (existingIndex > -1) {
            updatedLicences = prevLicences.map((l, idx) =>
                idx === existingIndex
                    ? { ...l, docTypeId, [key]: value }
                    : l
            );
        } else {
            updatedLicences = [
                ...prevLicences,
                { licenceTypeId, docTypeId, [key]: value },
            ];
        }

        return {
            ...currentForm,
            licenceDetails: {
                ...prevLicenceDetails,
                licence: updatedLicences,
            },
        };
    };


    const handleUpdate = (value, type, docTypeId, key) => {
        setValue(prev => updateValue(value, type, docTypeId, key, prev));
    };



    const getPlaceholder = useCallback(
        (type) => {
            const { typeId, categoryId, subCategoryId } = formData || {};

            if (type === "file") {
                if (typeId === 2 && categoryId === 4 && [1, 2, 3].includes(subCategoryId))
                    return "Upload registration certificate";
                if (typeId === 2 && categoryId === 5)
                    return "Upload Govt. Establishment Order";
                if (typeId === 3)
                    return "Upload certificate";
            }

            if (type === "code") {
                if (typeId === 2 && categoryId === 4 && [1, 2, 3].includes(subCategoryId))
                    return "Hospital Registration Number";
                if (typeId === 2 && categoryId === 5)
                    return "Hospital code";
                if (typeId === 3)
                    return "Clinic registration number";
            }
            if (type === "date") {
                if (typeId === 2 && categoryId === 4 && [1, 2, 3].includes(subCategoryId))
                    return "Registration date";
                if (typeId === 2 && categoryId === 5)
                    return "Legal Start date";
                if (typeId === 3)
                    return "Expiry date";
            }

            return "";
        },
        [formData]
    );




    const remove_Document = useCallback((docTypeId) => {
        setValue(prev => ({
            ...prev,
            customerDocs: removeDocument(prev?.customerDocs, docTypeId),
        }));
    }, [setValue]);


    const LICENSE_UI_CONFIG = useMemo(() => ({
        LIC20: {
            title: "20",
            filePlaceholder: "Upload 20 license",
            codeLabel: "Drug license number",
            dateLabel: "Expiry date",
            isRequired: true,
            info: true,
        },
        LIC21: {
            title: "21",
            filePlaceholder: "Upload 21 license",
            codeLabel: "Drug license number",
            dateLabel: "Expiry date",
            isRequired: true,
        },
        LIC20B: {
            title: "20B",
            filePlaceholder: "Upload 20B license",
            codeLabel: "Drug license number",
            dateLabel: "Expiry date",
            isRequired: true,
        },
        LIC21B: {
            title: "21B",
            filePlaceholder: "Upload 21B license",
            codeLabel: "Drug license number",
            dateLabel: "Expiry date",
            isRequired: true,
        },
        PRLIC: {
            title: "Practice license",
            filePlaceholder: "Upload",
            codeLabel: "Practice license number",
            dateLabel: "Expiry date",
            isRequired: true,
        },
    }), []);



    const prevLicenceDetails = formData?.licenceDetails ?? {};
    const license = prevLicenceDetails?.licence;
    const renderLicenseByCode = useCallback((code) => {
        const lic = licenseMap?.[code];
        const ui = LICENSE_UI_CONFIG[code];

        if (!lic || !ui) return null;

        const findData = findLicense(license, lic?.licenceTypeId);
        const findFile = findDocument(formData?.customerDocs, lic?.docTypeId);


        return (
            <RenderLicense
                key={code}
                titleFontSize={16}
                title={ui.title}
                isRequired={ui.isRequired}
                info={ui.info}
                file={{
                    placeholder: ui.filePlaceholder,
                    onSelectFile: (file) => handleFileUpload(file, lic.code, lic.docTypeId),
                    isRequired: ui.isRequired,
                    isLoading: uploading === lic.code,
                    uploadedFile: findFile && { name: findFile?.fileName, url: findFile?.s3Path, view: true, remove: true },
                    handleDelete: () => remove_Document(lic.docTypeId),
                    error: error?.customerDocs?.[lic.docTypeId]
                }}
                code={{
                    label: ui.codeLabel,
                    isRequired: ui.isRequired,
                    onChangeText: (text) => handleUpdate(text, lic.code, lic.docTypeId, 'licenceNo'),
                    value: findData?.licenceNo ?? '',
                    error: error?.licenceDetails?.[lic.docTypeId]?.licenceNo,
                }}
                date={{
                    label: ui.dateLabel,
                    isRequired: ui.isRequired,
                    onChange: (date) => handleUpdate(date, lic.code, lic.docTypeId, 'licenceValidUpto'),
                    value: findData?.licenceValidUpto ?? '',
                    error: error?.licenceDetails?.[lic.docTypeId]?.licenceValidUpto,
                }}
            />
        );
    }, [licenseMap, formData, uploading]);



    const findREG = licenseMap?.REG
        ? findDocument(formData?.customerDocs, licenseMap.REG.docTypeId)
        : null;
    const findADDRESS_PROOF = findDocument(formData?.customerDocs, staticDOCcode.ADDRESS_PROOF);
    const findIMAGE = findDocument(formData?.customerDocs, staticDOCcode.IMAGE);

    const LICENSE_CODES = ["LIC20", "LIC21", "LIC20B", "LIC21B", "PRLIC"];



    return (
        <AppView style={{ marginTop: 30 }}>
            <AccordionCard
                title={
                    <TouchableOpacity
                        onPress={isAccordion ? handleToggle : undefined}
                        activeOpacity={0.8}
                        style={[CommonStyle.SpaceBetween, { paddingRight: 20, paddingBottom: 10 }]}
                    >
                        <AppText style={OnboardStyle.accordionTitle}>License details <AppText style={OnboardStyle.requiredIcon}>*</AppText> </AppText>
                        {isAccordion && (
                            <AppView style={{
                                transform: [{ rotate: toggle === "close" ? "0deg" : "180deg" }],
                            }}>
                                <Downarrow />
                            </AppView>
                        )}

                    </TouchableOpacity>
                }
                insideToggle={false}
                onToggle={isAccordion ? toggle : undefined}
                isOpen={!isAccordion}
            >
                <AppView style={[OnboardStyle.accordionView, { gap: 15 }]} marginTop={10}>
                    {licenseMap?.REG && (
                        <RenderLicense
                            titleFontSize={16}
                            title={[2].includes(formData?.typeId) ? "" : "Clinic registration"}
                            isRequired
                            file={{
                                placeholder: getPlaceholder("file"),
                                onSelectFile: (file) =>
                                    handleFileUpload(file, "REG", licenseMap.REG.docTypeId),
                                isLoading: uploading === "REG",
                                uploadedFile: findREG && { name: findREG?.fileName, url: findREG?.s3Path, view: true, remove: true },
                                handleDelete: () => remove_Document(licenseMap.REG.docTypeId),
                                isRequired: true,
                                error: error?.customerDocs?.[licenseMap.REG.docTypeId]
                            }}
                            code={{
                                label: getPlaceholder("code"),
                                onChangeText: (text) => handleUpdate(text, licenseMap.REG.code, licenseMap.REG.docTypeId, [2].includes(formData?.typeId) && [5].includes(formData?.categoryId) ? 'hospitalCode' : "licenceNo"),
                                value: [2].includes(formData?.typeId) && [5].includes(formData?.categoryId) ? findLicense(license, licenseMap.REG?.licenceTypeId)?.hospitalCode : findLicense(license, licenseMap.REG?.licenceTypeId)?.licenceNo,
                                isRequired: true,
                                error: [2].includes(formData?.typeId) && [5].includes(formData?.categoryId) ? error?.licenceDetails?.[licenseMap.REG.docTypeId]?.hospitalCode : error?.licenceDetails?.[licenseMap.REG.docTypeId]?.licenceNo,
                            }}
                            date={{
                                label: getPlaceholder("date"),
                                onChange: (date) => handleUpdate(date, licenseMap.REG.code, licenseMap.REG.docTypeId, 'licenceValidUpto'),
                                isRequired: true,
                                value: findLicense(license, licenseMap.REG?.licenceTypeId)?.licenceValidUpto,
                                error: error?.licenceDetails?.[licenseMap.REG.docTypeId]?.licenceValidUpto,

                            }}
                            {...(
                                [2].includes(formData?.typeId) &&
                                    [5].includes(formData?.categoryId)
                                    ? {
                                        nin: {
                                            label: "NIN (National Identification Number)",
                                            onChangeText: (text) => handleUpdate(text, licenseMap.REG.code, licenseMap.REG.docTypeId, 'licenceNo'),
                                            isRequired: true,
                                            value: findLicense(license, licenseMap.REG?.licenceTypeId)?.licenceNo,
                                            error: error?.licenceDetails?.[licenseMap.REG.docTypeId]?.licenceNo,
                                        },
                                        officialLetter: {
                                            placeholder: "Official Letter on Dept. Letterhead",
                                            onSelectFile: (file) =>
                                                handleFileUpload(file, "officialLetter", staticDOCcode.IMAGE),
                                            isLoading: uploading === "officialLetter",
                                            uploadedFile: findIMAGE && { name: findIMAGE?.fileName, url: findIMAGE?.s3Path, view: true, remove: true },
                                            isRequired: true,
                                            handleDelete: () => remove_Document(staticDOCcode.IMAGE),
                                            error: error?.customerDocs?.[staticDOCcode.IMAGE]

                                        },
                                    }
                                    : {}
                            )}
                        />
                    )}
                    {LICENSE_CODES.map(renderLicenseByCode)}



                    {[3].includes(formData?.typeId) && (
                        <RenderLicense
                            titleFontSize={16}
                            title="Address proof"
                            isRequired
                            file={{
                                placeholder: "Upload Electricity/Telephone bill",
                                onSelectFile: (file) => handleFileUpload(file, "ADDRESS_PROOF", staticDOCcode.ADDRESS_PROOF, false),
                                isLoading: uploading == "ADDRESS_PROOF",
                                uploadedFile: findADDRESS_PROOF && { name: findADDRESS_PROOF?.fileName, url: findADDRESS_PROOF?.s3Path, view: true, remove: true },
                                isRequired: true,
                                handleDelete: () => remove_Document(staticDOCcode.ADDRESS_PROOF),
                                error: error?.customerDocs?.[staticDOCcode.ADDRESS_PROOF]
                            }}
                        />
                    )}
                    {[3].includes(formData?.typeId) && (
                        <RenderLicense
                            titleFontSize={16}
                            title="Clinic image"
                            isRequired
                            file={{
                                placeholder: "Upload License",
                                onSelectFile: (file) => handleFileUpload(file, "CLINIC_IMAGE", staticDOCcode.IMAGE, false),
                                isLoading: uploading == "CLINIC_IMAGE",
                                uploadedFile: findIMAGE && { name: findIMAGE?.fileName, url: findIMAGE?.s3Path, view: true, remove: true }, isRequired: true,
                                handleDelete: () => remove_Document(staticDOCcode.IMAGE),
                                error: error?.customerDocs?.[staticDOCcode.IMAGE]
                            }}
                        />
                    )}

                    {[1].includes(formData?.typeId) && [1, 2, 3].includes(formData?.categoryId) && (
                        <RenderLicense
                            titleFontSize={16}
                            title="Pharmacy Image"
                            isRequired
                            file={{
                                placeholder: "Upload",
                                onSelectFile: (file) => handleFileUpload(file, "PHARMACY_IMAGE", staticDOCcode.IMAGE, false),
                                isLoading: uploading == "PHARMACY_IMAGE",
                                uploadedFile: findIMAGE && { name: findIMAGE?.fileName, url: findIMAGE?.s3Path, view: true, remove: true },
                                isRequired: true,
                                handleDelete: () => remove_Document(staticDOCcode.IMAGE),
                                error: error?.customerDocs?.[staticDOCcode.IMAGE]
                            }}
                        />
                    )}
                    {[2,].includes(formData?.typeId) && [4,].includes(formData?.categoryId) && [1, 2, 3].includes(formData?.subCategoryId) && (
                        <RenderLicense
                            titleFontSize={16}
                            title="image"
                            isRequired
                            file={{
                                placeholder: "Upload",
                                onSelectFile: (file) => handleFileUpload(file, "IMAGE", staticDOCcode.IMAGE, false),
                                isLoading: uploading == "IMAGE",
                                uploadedFile: findIMAGE && { name: findIMAGE?.fileName, url: findIMAGE?.s3Path, view: true, remove: true },
                                isRequired: true,
                                handleDelete: () => remove_Document(staticDOCcode.IMAGE),
                                error: error?.customerDocs?.[staticDOCcode.IMAGE]

                            }}
                        />
                    )}

                    {action == 'onboard' && (
                        <PanAndGST formData={formData} setValue={setValue} action={action} />
                    )}


                </AppView>
            </AccordionCard>
        </AppView>
    );
};



export default LicenseDetails;