

export const orderBy = ["LIC20", "LIC21", "LIC20B", "LIC21B", "REG", "PRLIC"];
export const CUSTOMER_TYPE_MAP = {
    1: "PCM",
    2: "HOSP",
    3: "DOCT",
};

export const CUSTOMER_CATEGORY_MAP = {
    1: "OR",
    2: "OW",
    3: "RCW",
    4: "PRI",
    5: "GOV",
};

export const CUSTOMER_SUBCATEGORY_MAP = {
    1: "PCL",
    2: "PIH",
    3: "PGH",
};

export const getMetaById = (data) => ({
    type: CUSTOMER_TYPE_MAP[data?.typeId],
    category: CUSTOMER_CATEGORY_MAP[data?.categoryId],
    subCategory: CUSTOMER_SUBCATEGORY_MAP[data?.subCategoryId],
});
export const sortByLicenseCode = (data = []) => {
    const orderMap = orderBy.reduce((acc, code, index) => {
        acc[code] = index;
        return acc;
    }, {});

    return [...data].sort((a, b) => {
        const aOrder = orderMap[a.code] ?? Number.MAX_SAFE_INTEGER;
        const bOrder = orderMap[b.code] ?? Number.MAX_SAFE_INTEGER;
        return aOrder - bOrder;
    });
};


export const findLicense = (licence = [], licenceTypeId) => {
    return licence?.find((e) => e?.licenceTypeId == licenceTypeId)
}


export const findDocument = (document = [], docTypeId) => {
    return document?.find((e) => e?.docTypeId == docTypeId)
}

export const removeDocument = (documents = [], docTypeId) => {
    return documents.filter(
        (doc) => doc?.docTypeId != docTypeId
    );
};



export const initialFormData = {
    typeId: "",
    categoryId: "",
    subCategoryId: "",
    isMobileVerified: false,
    isEmailVerified: false,
    isPanVerified: false,
    isExisting: false,
    licenceDetails: {
        registrationDate: "",
        licence: [
        ]
    },
    customerDocs: [],
    isBuyer: true,
    customerGroupId: "",
    stationCode: "",
    generalDetails: {
        name: "",
        shortName: "",
        address1: "",
        address2: "",
        address3: "",
        address4: "",
        pincode: "",
        area: "",
        cityId: "",
        cityName: "",
        stateId: "",
        ownerName: "",
        clinicName: "",
        areaId: "",
        specialist: "",
        stateName: ""
    },
    mapping: {
    },
    securityDetails: {
        mobile: "",
        email: "",
        panNumber: "",
        gstNumber: "",
    },
    suggestedDistributors: [
        {
            distributorCode: "",
            distributorName: "",
            city: "",
            customerId: "",
        }
    ],
    isChildCustomer: false,
    customerId: "",
    stgCustomerId: "",
};


export const staticDOCcode = {
    ADDRESS_PROOF: 11,
    IMAGE: 1,
    PAN: 7,
    GST: 2
}



export const SELECTOR_ENTITY_CONFIG = {
    hospitals: {
        title: 'Hospital',
        entityType: 'hospitals',
        allowMultiple: false
    },

    doctors: {
        title: 'Doctor',
        entityType: 'doctors',
        allowMultiple: true,
        maxSelection: 4
    },

    pharmacy: {
        title: 'Pharmacy',
        entityType: 'pharmacy',
        allowMultiple: true
    },

    groupHospitals: {
        title: 'Hospital',
        entityType: 'groupHospitals',
        allowMultiple: false
    },

    linked_hospital: {
        title: 'Hospital',
        entityType: 'hospitals',
        allowMultiple: true
    },
    linked_hospital_child: {
        title: 'Pharmacy',
        entityType: 'pharmacy',
        allowMultiple: true
    },
};


export const converScheme = (validateScheme, typeId, categoryId, subCategoryId, licenceDetails, uploadDocument, isFromRegistration=true) => {
 
    const scheme = {};

    // ---------- GENERAL DETAILS ----------
    if (validateScheme?.generalDetails) {
        scheme.generalDetails = validateScheme.generalDetails
            .filter(
                (field) =>
                ((!Array.isArray(field?.validationRules) ||
                    field.validationRules.length > 0) || field.isMandatory)
            )
            .map((field) => ({
                ...field,
            }));
    }

    // ---------- DEFAULT (only stationCode) ----------

    if (validateScheme?.default) {
        scheme.default = validateScheme.default.filter((field) =>
            [
                'isMobileVerified',
                'isEmailVerified',
                'stationCode',
            
                 ...(isFromRegistration ? ['isBuyer'] : []),
                ...(uploadDocument ? ['isPanVerified'] : []),
            ].includes(field?.attributeKey)
        );

        if (uploadDocument) {
            scheme.customerDocs = [
                ...(scheme.customerDocs ?? []),
                ...validateScheme.default.filter(field =>
                    field?.typeId != 0
                ),
            ];
        }


    }

    // ---------- SECURITY DETAILS + CUSTOMER DOCS ----------
    if (validateScheme?.securityDetails) {
        const requiredKeys = ["mobile", "email", ...(uploadDocument ? ['panNumber'] : []), ...(uploadDocument ? ['gstNumber'] : []),];

        scheme.securityDetails = validateScheme.securityDetails.filter((e) =>
            requiredKeys.includes(e?.attributeKey)
        );
        // if (uploadDocument) {
        //     scheme.customerDocs = [
        //         ...(scheme.customerDocs ?? []),
        //         ...validateScheme.securityDetails.filter(
        //             (e) => !requiredKeys.includes(e?.attributeKey)
        //         ),
        //     ];
        // }
    }    // ---------- LICENCE DETAILS + CUSTOMER DOCS ----------



    if (licenceDetails && uploadDocument) {
        const customerDocs = [];


        const licenceDocs = licenceDetails.licence.map((licence) => {
            const docTypeId = licence?.docTypeId;

            const docObj = {
                docTypeId,
                documentName: licence?.code, // optional (UI only)
            };

            // ✅ find correct license group
            const matchedGroup =
                validateScheme?.licenseDetails?.license?.find(
                    (group) => group?.[0]?.typeId == docTypeId
                );

            // ✅ iterate fields directly (NO .fields)
            matchedGroup?.forEach((field) => {
                if (field?.attributeKey !== "isFileUploaded") {
                    docObj[field.attributeKey == 'registrationDate'? 'licenceValidUpto':field.attributeKey ] = field;
                } else {
                    customerDocs.push({
                        ...field,
                        fieldAttributeKey: docTypeId,
                        docTypeId,
                        documentName: licence?.code,
                    });
                }
            });

            return docObj;
        });

        scheme.licenceDetails = licenceDocs;

        scheme.customerDocs = [
            ...(scheme.customerDocs ?? []),
            ...customerDocs,
        ];
    }






    return scheme;
};


const validateValue = (value, field) => {
    const rules = field?.validationRules || [];
    const isBooleanField = field?.attributeType === "boolean";

    const isEmpty =
        value === undefined ||
        value === null ||
        value === "";

    for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];

        switch (rule.ruleType) {
            case "required":
                if (isBooleanField) {
                    if (value !== true) return rule.errorMessage;
                } else {
                    if (isEmpty) return rule.errorMessage;
                }
                break;

            case "custom":
                if (isBooleanField) {
                    if (value !== true) return rule.errorMessage;
                } else {
                    if (isEmpty) return rule.errorMessage;
                }
                break;

            case "minLength":
                if (!isEmpty && value.length < Number(rule.ruleValue)) {
                    return rule.errorMessage;
                }
                break;

            case "maxLength":
                if (!isEmpty && value.length > Number(rule.ruleValue)) {
                    return rule.errorMessage;
                }
                break;


            case "pattern":
                if (!isEmpty && !new RegExp(rule.ruleValue).test(value)) {
                    return rule.errorMessage;
                }
                break;

            case "email":
                if (
                    !isEmpty &&
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                ) {
                    return rule.errorMessage;
                }
                break;

            case "phone":
                if (!isEmpty && !/^[0-9]{10}$/.test(value)) {
                    return rule.errorMessage;
                }
                break;

            case "date":
                if (!isEmpty && isNaN(Date.parse(value))) {
                    return rule.errorMessage;
                }
                break;

            case "file":
                if (isEmpty) return rule.errorMessage;
                break;

            case "min":
                if (!isEmpty && Number(value) < Number(rule.ruleValue)) {
                    return rule.errorMessage;
                }
                break;

            case "gst":
                if (
                    !isEmpty &&
                    !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
                        value
                    )
                ) {
                    return "Invalid GST number";
                }
                break;

            default:
                break;
        }
    }

    // fallback mandatory (for non-boolean fields)
    if (field?.isMandatory && !isBooleanField && isEmpty) {
        return `${field.attributeName} is required`;
    }

    return null;
};



const setDeep = (obj, path, value) => {
    let current = obj;
    path.forEach((key, index) => {
        if (index === path.length - 1) {
            current[key] = value;
        } else {
            current[key] = current[key] || {};
            current = current[key];
        }
    });
};


export const validateForm = async (payload, scheme) => {
    const errors = {};

    /* ---------- GENERAL DETAILS ---------- */
    const generalFields = scheme?.generalDetails || [];

    generalFields.forEach((field) => {
        const value = payload?.generalDetails?.[field.attributeKey];
        const error = validateValue(value, field);

        if (error) {
            setDeep(errors, ["generalDetails", field.attributeKey], error);
        }
    });

    /* ---------- ROOT LEVEL (DEFAULT) ---------- */
    const defaultFields = scheme?.default || [];

    defaultFields.forEach((field) => {
        if (field.attributeKey != 'isBuyer') {
            const value = payload?.[field.attributeKey];
            const error = validateValue(value, field);

            if (error) {
                setDeep(errors, [field.attributeKey], error);
            }
        }
        else {
            if (!payload?.[field.attributeKey]) {
                if (!payload?.mapping?.pharmacy?.length != 0) {
                    setDeep(errors, [field.attributeKey], field?.validationRules?.[0]?.errorMessage);
                }
            }
        }
    });

    const securityFields = scheme?.securityDetails || [];

    securityFields.forEach((field) => {
        const value = payload?.securityDetails?.[field.attributeKey];
        const error = validateValue(value, field);
        if (error) {
            setDeep(errors, ["securityDetails", field.attributeKey], error);
        }
    });

    const customerDocsFields = scheme?.customerDocs || [];
    console.log(customerDocsFields, payload?.customerDocs, 238497239)
    customerDocsFields.forEach((field) => {
        // Only customer docs (skip license fields)
        const doc = payload?.customerDocs?.find(
            (e) => e?.docTypeId == field.typeId
        );
        if (doc) {
            console.log(field, 23834340279)
            console.log(doc?.fileName, 23840279)
        }
        const error = validateValue(doc?.fileName, field);
        if (error) {
            setDeep(errors, ["customerDocs", field.typeId], error);
        }
    });
    const licenseFields = scheme?.licenceDetails || [];
    licenseFields.forEach((docSchema) => {
        const licenceValue =
            payload?.licenceDetails?.licence?.find(
                (e) => e?.docTypeId == docSchema?.docTypeId
            );
        const localError = {};

        Object.entries(docSchema).forEach(([key, fieldConfig]) => {
            if (key === "docTypeId") return;

            const fieldValue = licenceValue?.[key] ?? null;

            const error = validateValue(fieldValue, fieldConfig);

            if (error) {
                localError[key] = error;
            }
        });

        if (Object.keys(localError).length) {
            setDeep(errors, ["licenceDetails", licenceValue?.docTypeId], localError);
        }
    });


    /* ---------- GLOBAL VALIDITY ---------- */
    const isValid = Object.keys(errors).length === 0;

    return {
        isValid,
        errors
    };
};


const cleanMapping = (arr = []) =>
    arr
        .filter(item => item?.id)
        .map(item => ({
            id: Number(item.id),
            customerName: item.customerName,
            cityName: item.cityName || 'N/A',
            isNew: Boolean(item.isNew),
            isProcessed: Boolean(item.isProcessed),
        }));

export const buildCreatePayload = (formData) => {
    const doctors = cleanMapping(formData.mapping?.doctors);
    const hospitals = cleanMapping(formData.mapping?.hospitals);
    const pharmacy = cleanMapping(formData.mapping?.pharmacy);
    const groupHospitals = cleanMapping(formData.mapping?.groupHospitals);


    return {
        typeId: formData.typeId,
        categoryId: formData.categoryId ?? 0,
        subCategoryId: formData.subCategoryId ?? 0,
        isBuyer: Boolean(formData.isBuyer),
        isExisting: Boolean(formData.isExisting),
        isChildCustomer: Boolean(formData.isChildCustomer),
        isMobileVerified: Boolean(formData.isMobileVerified),
        isEmailVerified: Boolean(formData.isEmailVerified),
        customerGroupId: formData.customerGroupId,
        stationCode: formData.stationCode,
        ...(formData.customerId
            ? { customerId: Number(formData.customerId) }
            : {}),
        ...(formData.stgCustomerId
            ? { stgCustomerId: Number(formData.stgCustomerId) }
            : {}),
        licenceDetails: {
            registrationDate: formData.licenceDetails?.registrationDate
                ? new Date(formData.licenceDetails.registrationDate)
                : null,

            licence: (formData.licenceDetails?.licence || [])
                .filter(l =>
                    l?.licenceNo &&                // must exist
                    l?.licenceValidUpto            // must exist
                )
                .map(l => ({
                    licenceTypeId: l.licenceTypeId,
                    licenceNo: l.licenceNo,
                    licenceValidUpto: new Date(l.licenceValidUpto),
                    ...(l.hospitalCode ? { hospitalCode: l.hospitalCode } : {}),
                })),
        },

        // ---------------- DOCUMENTS ----------------
        customerDocs: (formData.customerDocs || []).map(d => ({
            s3Path: d.s3Path,
            docTypeId: d.docTypeId,
            fileName: d.fileName,
            id: d.id,
        })),

        // ---------------- GENERAL DETAILS ----------------
        generalDetails: (() => {
            const { cityName, stateName, ...rest } =
                formData.generalDetails || {};

            return {
                ...rest,
                pincode: rest?.pincode ? Number(rest.pincode) : undefined,
            };
        })(),

        // ---------------- SECURITY DETAILS ----------------
        securityDetails: {
            mobile: formData.securityDetails.mobile,
            email: formData.securityDetails.email,
            panNumber: formData.securityDetails.panNumber,
            gstNumber:
                formData.securityDetails.gstNumber ||
                null,
        },

        // ---------------- OPTIONAL ----------------
        ...(
            doctors.length ||
                hospitals.length ||
                pharmacy.length ||
                groupHospitals.length
                ? {
                    mapping: {
                        ...(doctors.length ? { doctors } : {}),
                        ...(hospitals.length ? { hospitals } : {}),
                        ...(pharmacy.length ? { pharmacy } : {}),
                        ...(groupHospitals.length ? { groupHospitals } : {}),
                    },
                }
                : {}
        ),
        ...(formData.suggestedDistributors?.length
            ? {
                suggestedDistributors: formData.suggestedDistributors.filter(
                    d =>
                        d?.distributorCode ||
                        d?.distributorName ||
                        d?.city ||
                        d?.customerId
                ),
            }
            : {}),
    };
};




export const buildDraftPayload = (formData, isExistingDraft = false) => {


    const doctors = cleanMapping(formData.mapping?.doctors);
    const hospitals = cleanMapping(formData.mapping?.hospitals);
    const pharmacy = cleanMapping(formData.mapping?.pharmacy);
    const groupHospitals = cleanMapping(formData.mapping?.groupHospitals);

    return {
        typeId: formData.typeId,
        categoryId: formData.categoryId ?? 0,
        subCategoryId: formData.subCategoryId ?? 0,

        ...(formData.customerId
            ? { customerId: Number(formData.customerId) }
            : {}),
        ...(formData.stgCustomerId
            ? { stgCustomerId: Number(formData.stgCustomerId) }
            : {}),

        isBuyer: Boolean(formData.isBuyer),
        isExisting: Boolean(formData.isExisting),
        isChildCustomer: Boolean(formData.isChildCustomer),
        isMobileVerified: Boolean(formData.isMobileVerified),
        isEmailVerified: Boolean(formData.isEmailVerified),

        ...(formData.customerGroupId
            ? { customerGroupId: formData.customerGroupId }
            : {}),

        ...(formData.stationCode
            ? { stationCode: formData.stationCode }
            : {}),

        ...(formData.licenceDetails?.licence?.some(
            l => l?.licenceNo
        )
            ? {
                licenceDetails: {
                    ...(formData.licenceDetails?.registrationDate && {
                        registrationDate: new Date(
                            formData.licenceDetails.registrationDate
                        ),
                    }),
                    licence: formData.licenceDetails.licence
                        .filter(l => l?.licenceNo)
                        .map(l => ({
                            ...(l.licenceTypeId && { licenceTypeId: l.licenceTypeId }),
                            ...(l.licenceNo && { licenceNo: l.licenceNo }),
                            ...(isExistingDraft && l.code && { code: l.code }),
                            ...(isExistingDraft && l.docTypeId && { docTypeId: l.docTypeId }),
                            ...(l.hospitalCode && { hospitalCode: l.hospitalCode }),
                            ...(l.licenceValidUpto && { licenceValidUpto: l.licenceValidUpto }),
                        })),
                },
            }
            : {}),


        ...(formData.customerDocs?.length
            ? {
                customerDocs: formData.customerDocs.map(d => ({
                    s3Path: d.s3Path,
                    docTypeId: d.docTypeId,
                    fileName: d.fileName,
                    id: d.id,
                })),
            }
            : {}),

        ...(Object.values(formData.generalDetails || {}).some(v => v)
            ? {
                generalDetails: {
                    ...(formData.generalDetails.name
                        ? { name: formData.generalDetails.name }
                        : {}),
                    ...(formData.generalDetails.address1
                        ? { address1: formData.generalDetails.address1 }
                        : {}),
                    ...(formData.generalDetails.address2
                        ? { address2: formData.generalDetails.address2 }
                        : {}),
                    ...(formData.generalDetails.address3
                        ? { address3: formData.generalDetails.address3 }
                        : {}),
                    ...(formData.generalDetails.address4
                        ? { address4: formData.generalDetails.address4 }
                        : {}),
                    ...(formData.generalDetails.pincode
                        ? { pincode: Number(formData.generalDetails.pincode) }
                        : {}),
                    ...(formData.generalDetails.cityId
                        ? { cityId: Number(formData.generalDetails.cityId) }
                        : {}),
                    ...(formData.generalDetails.stateId
                        ? { stateId: Number(formData.generalDetails.stateId) }
                        : {}),
                    ...(formData.generalDetails.areaId
                        ? { areaId: Number(formData.generalDetails.areaId) }
                        : {}),

                    ...(formData.generalDetails.clinicName && {
                        clinicName: formData.generalDetails.clinicName
                    }),

                    ...(formData.generalDetails.specialist && {
                        specialist: formData.generalDetails.specialist
                    }),

                    ...(formData.generalDetails.shortName && {
                        shortName: formData.generalDetails.shortName
                    }),

                    ...(formData.generalDetails.ownerName && {
                        ownerName: formData.generalDetails.ownerName
                    }),

                    ...(formData.generalDetails.area && {
                        area: formData.generalDetails.area
                    }),

                    ...(formData.generalDetails.area && {
                        area: formData.generalDetails.area
                    }),

                    ...(isExistingDraft && formData.generalDetails.cityName && {
                        cityName: formData.generalDetails.cityName
                    }),

                    ...(isExistingDraft && formData.generalDetails.stateName && {
                        stateName: formData.generalDetails.stateName
                    }),


                },
            }
            : {}),

        ...(Object.values(formData.securityDetails || {}).some(v => v)
            ? {
                securityDetails: {
                    ...(formData.securityDetails.mobile
                        ? { mobile: formData.securityDetails.mobile }
                        : {}),
                    ...(formData.securityDetails.email
                        ? { email: formData.securityDetails.email }
                        : {}),
                    ...(formData.securityDetails.panNumber
                        ? { panNumber: formData.securityDetails.panNumber }
                        : {}),
                    ...(formData.securityDetails.gstNumber
                        ? { gstNumber: formData.securityDetails.gstNumber }
                        : {}),
                },
            }
            : {}),

        ...(doctors.length ||
            hospitals.length ||
            pharmacy.length ||
            groupHospitals.length
            ? {
                mapping: {
                    ...(doctors.length ? { doctors } : {}),
                    ...(hospitals.length ? { hospitals } : {}),
                    ...(pharmacy.length ? { pharmacy } : {}),
                    ...(groupHospitals.length
                        ? { groupHospitals }
                        : {}),
                },
            }
            : {}),
        ...(formData.suggestedDistributors?.length
            ? {
                suggestedDistributors: formData.suggestedDistributors.filter(
                    d =>
                        d?.distributorCode ||
                        d?.distributorName ||
                        d?.city ||
                        d?.customerId
                ),
            }
            : {}),
    };
};

export const updateFormData = (payload, action) => {

    const customerDocs =
        action == 'onboard'
            ? (payload?.customerDocs ?? []).map(e => ({
                s3Path: e?.s3Path,
                docTypeId: e?.docTypeId,
                fileName: e?.fileName,
                customerId: payload?.customerId,
                id: e?.id,
            }))
            : (payload?.docType ?? []).map(e => ({


                s3Path: e?.s3Path,
                docTypeId: Number(e?.doctypeId),
                fileName: e?.fileName,
                customerId: payload?.customerId,
                id: Number(e?.docId),
            }));



    return {
        typeId: payload?.typeId,
        categoryId: payload?.categoryId,
        subCategoryId: payload?.subCategoryId,
        isMobileVerified: payload?.isMobileVerified,
        isEmailVerified: payload?.isEmailVerified,
        isPanVerified: action == 'edit' ? true : false,
        isExisting: payload?.isExisting,
        licenceDetails: {
            registrationDate: payload?.licenceDetails?.registrationDate,
            licence: payload?.licenceDetails?.licence ?? [],
        },
        customerDocs,
        isBuyer: payload?.isBuyer,
        customerGroupId: payload?.customerGroupId,
        stationCode: payload?.stationCode,
        generalDetails: {
            name: payload?.generalDetails?.name ?? payload?.generalDetails?.customerName,
            shortName: payload?.generalDetails?.shortName,
            address1: payload?.generalDetails?.address1,
            address2: payload?.generalDetails?.address2,
            address3: payload?.generalDetails?.address3,
            address4: payload?.generalDetails?.address4,
            pincode: payload?.generalDetails?.pincode,
            area: payload?.generalDetails?.area,
            cityId: payload?.generalDetails?.cityId,
            stateId: payload?.generalDetails?.stateId,
            ownerName: payload?.generalDetails?.ownerName,
            clinicName: payload?.generalDetails?.clinicName,
            areaId: payload?.generalDetails?.areaId,
            specialist: payload?.generalDetails?.specialist,
            cityName: payload?.generalDetails?.cityName ?? ""
        },
        // mapping: {
        //     ...(payload?.mapping?.doctors?.length != 0 && { doctors: payload?.mapping?.doctors }),
        //     ...(payload?.mapping?.groupHospitals?.length != 0 && { groupHospitals: payload?.mapping?.groupHospitals }),
        //     ...((payload?.mapping?.hospitals?.length != 0 || payload?.mapping?.pharmacy?.length == 0) && { hospitals: payload?.mapping?.hospitals }),
        //     ...(payload?.mapping?.pharmacy?.length != 0 && { pharmacy: payload?.mapping?.pharmacy }),
        // },

        mapping: {
            ...(payload?.mapping?.doctors?.length != 0 && { doctors: payload?.mapping?.doctors }),
            ...(payload?.mapping?.groupHospitals?.length != 0 && { groupHospitals: payload?.mapping?.groupHospitals }),
            ...((payload?.mapping?.hospitals?.length != 0) && { hospitals: payload?.mapping?.hospitals }),
            ...(payload?.mapping?.pharmacy?.length != 0 && { pharmacy: payload?.mapping?.pharmacy }),
        },
        securityDetails: payload?.securityDetails,
        suggestedDistributors: payload?.suggestedDistributors,
        isChildCustomer: payload?.isChildCustomer,
        customerId: payload?.customerId,
        stgCustomerId: payload?.stgCustomerId,
    }

}


export function getChangedValues(original, updated) {

    function isObject(val) {
        return val && typeof val === "object" && !Array.isArray(val);
    }

    function normalize(value) {
        // Normalize object key order
        if (isObject(value)) {
            return Object.keys(value)
                .sort()
                .reduce((acc, key) => {
                    acc[key] = normalize(value[key]);
                    return acc;
                }, {});
        }

        // Normalize array order (by stable string representation)
        if (Array.isArray(value)) {
            return value
                .map(normalize)
                .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
        }

        return value;
    }

    function isEqual(a, b) {
        return JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));
    }

    function diff(orig, curr) {
        let hasChanges = false;
        const result = {};

        for (const key in curr) {
            const origVal = orig?.[key];
            const currVal = curr[key];

            // Arrays
            if (Array.isArray(currVal)) {
                if (!isEqual(origVal, currVal)) {
                    result[key] = currVal;
                    hasChanges = true;
                }
            }

            // Objects
            else if (isObject(currVal)) {
                const childChanged = diff(origVal || {}, currVal);

                if (childChanged !== null) {
                    result[key] = currVal; // return full object
                    hasChanges = true;
                }
            }

            // Primitive
            else {
                if (origVal !== currVal) {
                    result[key] = currVal;
                    hasChanges = true;
                }
            }
        }

        return hasChanges ? result : null;
    }

    return diff(original, updated) || {};
}
