

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
            {
                licenceTypeId: 6,
                docTypeId: 10,
                licenceNo: "34534",
                licenceValidUpto: "2026-01-04T15:17:00.000Z",
            }
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


export const converScheme = (
    validateScheme,
    typeId,
    categoryId,
    subCategoryId
) => {
    const scheme = {};

    if (validateScheme?.generalDetails) {
        scheme.generalDetails = validateScheme.generalDetails.filter((field) => {
            if (
                field?.attributeKey === "specialist" ||
                field?.attributeKey === "clinicName"
            ) {
                return typeId === 3;
            }
            return true;
        })?.map((e) => ({ ...e, localKey: e?.attributeKey }));
    }

    if (validateScheme?.default) {
        scheme.default = validateScheme.default.filter((field) => field?.attributeKey === "stationCode")?.map((e) => ({ ...e, localKey: e?.attributeKey }));;
    }
    if (validateScheme?.securityDetails) {
        scheme.securityDetails = validateScheme.securityDetails.map((e) => {
            return e;
        })
    }

    console.log(scheme, 'scheme');
    return scheme;
};



const validateValue = (value, field) => {
    const rules = field?.validationRules || [];

    const isEmpty =
        value === undefined ||
        value === null ||
        value === "";

    for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];

        switch (rule.ruleType) {
            case "required":
                if (isEmpty) return rule.errorMessage;
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

    // fallback mandatory (when no rule provided)
    if (field?.isMandatory && isEmpty) {
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
        const value = payload?.generalDetails?.[field.localKey];
        const error = validateValue(value, field);

        if (error) {
            setDeep(errors, ["generalDetails", field.localKey], error);
        }
    });

    /* ---------- ROOT LEVEL (DEFAULT) ---------- */
    const defaultFields = scheme?.default || [];

    defaultFields.forEach((field) => {
        const value = payload?.[field.localKey];
        const error = validateValue(value, field);

        if (error) {
            setDeep(errors, [field.localKey], error);
        }
    });

    /* ---------- GLOBAL VALIDITY ---------- */
    const isValid = Object.keys(errors).length === 0;

    return {
        isValid,
        errors
    };
};


