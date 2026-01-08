

export const orderBy = ["LIC20", "LIC21", "LIC20B", "LIC21B", "REG", "PRLIC"];

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
    isExisting: "",
    licenceDetails: {
        registrationDate: "",
        licence: [
        ]
    },
    customerDocs: [],
    isBuyer: "",
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
        stateId: "",
        ownerName: "",
        clinicName: "",
        areaId: "",
        specialist: ""
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
    isChildCustomer: "",
    customerId: "",
};


export const staticDOCcode = {
    ADDRESS_PROOF: 11,
    IMAGE: 1,
    PAN: 7,
    GST: 2
}



export const SELECTOR_ENTITY_CONFIG = {
    hospital: {
        title: 'Hospital',
        entityType: 'hospitals',
        allowMultiple: false
    },

    doctor: {
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

    group_hospital: {
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


export const converScheme = (validateScheme, typeId, categoryId, subCategoryId, licenceDetails) => {
    const scheme = {};

    // ---------- GENERAL DETAILS ----------
    if (validateScheme?.generalDetails) {
        scheme.generalDetails = validateScheme.generalDetails.filter((field) => {
            if (
                field?.attributeKey === "specialist" ||
                field?.attributeKey === "clinicName"
            ) {
                return typeId === 3; // show only when typeId = 3
            }
            return true;
        });
    }

    // ---------- DEFAULT (only stationCode) ----------

    if (validateScheme?.default) {
        scheme.default = validateScheme.default.filter(
            (field) => ['isMobileVerified', 'isEmailVerified', 'stationCode', 'isPanVerified'].includes(field?.fieldAttributeKey)
        );

        scheme.customerDocs = [
            ...(scheme.customerDocs ?? []),
            ...validateScheme.default.filter((field) => field?.attributeType == "file"),
        ];


    }

    // ---------- SECURITY DETAILS + CUSTOMER DOCS ----------
    if (validateScheme?.securityDetails) {
        const requiredKeys = ["mobile", "email", "panNumber", "gstNumber"];

        scheme.securityDetails = validateScheme.securityDetails.filter((e) =>
            requiredKeys.includes(e?.fieldAttributeKey)
        );

        scheme.customerDocs = [
            ...(scheme.customerDocs ?? []),
            ...validateScheme.securityDetails.filter(
                (e) => !requiredKeys.includes(e?.fieldAttributeKey)
            ),
        ];
    }

    // ---------- LICENCE DETAILS + CUSTOMER DOCS ----------
    if (licenceDetails?.licence?.length) {
        const customerDocs = [];

        const licenceDocs = licenceDetails.licence.map((licence) => {
            const docObj = { documentName: licence?.code };

            const matchedDoc =
                validateScheme?.licenseDetails?.license?.find(
                    (doc) => doc?.documentName === licence?.code
                );

            matchedDoc?.fields?.forEach((field) => {
                if (field?.attributeType !== "file") {
                    docObj[field.fieldAttributeKey] = field;
                } else {
                    customerDocs.push({
                        ...field,
                        fieldAttributeKey: licence?.docTypeId,
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


    console.log("scheme", scheme);
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
                // ✅ Boolean must be TRUE
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
        const value = payload?.generalDetails?.[field.fieldAttributeKey];
        const error = validateValue(value, field);

        if (error) {
            setDeep(errors, ["generalDetails", field.fieldAttributeKey], error);
        }
    });

    /* ---------- ROOT LEVEL (DEFAULT) ---------- */
    const defaultFields = scheme?.default || [];

    defaultFields.forEach((field) => {
        const value = payload?.[field.fieldAttributeKey];
        const error = validateValue(value, field);
        console.log(value, error, 2389236)

        if (error) {
            setDeep(errors, [field.fieldAttributeKey], error);
        }
    });

    const securityFields = scheme?.securityDetails || [];

    securityFields.forEach((field) => {
        const value = payload?.securityDetails?.[field.fieldAttributeKey];
        const error = validateValue(value, field);
        if (error) {
            setDeep(errors, ["securityDetails", field.fieldAttributeKey], error);
        }
    });

    const customerDocsFields = scheme?.customerDocs || [];

    customerDocsFields.forEach((field) => {
        const value = payload?.customerDocs?.find((e) => e?.docTypeId == field?.fieldAttributeKey);
        const error = validateValue(value, field);
        if (error) {
            setDeep(errors, ["customerDocs", field.fieldAttributeKey], error);
        }
    });


    const licenseFields = scheme?.licenceDetails || [];

    licenseFields.forEach((docSchema) => {
        const licenceValue =
            payload?.licenceDetails?.licence?.find(
                (e) => e?.code == docSchema?.documentName
            );
        const localError = {};

        Object.entries(docSchema).forEach(([key, fieldConfig]) => {
            if (key === "documentName") return;

            const fieldValue = licenceValue?.[key] ?? null;

            const error = validateValue(fieldValue, fieldConfig);

            if (error) {
                localError[key] = error;
            }
        });

        console.log(localError, docSchema, 2390482034)
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


