

const FIELD_META_LICENSE_DETAILS = {

    LIC20: [
        {
            type: "file",
            placeHolder: "Upload 20 license",
            required: true,
        },
        {
            type: "text",
            placeHolder: "Drug license number",
            required: true,
        },
        {
            type: "date",
            placeHolder: "Expiry date",
            required: true,
        },
    ],

    LIC21: [
        {
            type: "file",
            placeHolder: "Upload 21 license",
            required: true,
        },
        {
            type: "text",
            placeHolder: "Drug license number",
            required: true,
        },
        {
            type: "date",
            placeHolder: "Expiry date",
            required: true,
        },
    ],

    LIC20B: [
        {
            type: "file",
            placeHolder: "Upload 20B license",
            required: true,
        },
        {
            type: "text",
            placeHolder: "Drug license number",
            required: true,
        },
        {
            type: "data",
            placeHolder: "Expiry date",
            required: true,
        },
    ],

    LIC21B: [
        {
            type: "file",
            placeHolder: "Upload 21B license",
            required: true,
        },
        {
            type: "text",
            placeHolder: "Drug license number",
            required: true,
        },
        {
            type: "data",
            placeHolder: "Expiry date",
            required: true,
        },
    ],

    REG: (key) => [
        {
            type: "file",
            placeHolder: REGISTRATION_PLACEHOLDER[key].placeHolder,
            label: REGISTRATION_PLACEHOLDER[key].label,
            required: true,
        },
        {
            type: "text",
            placeHolder: "Drug license number",
            required: true,
        },
        {
            type: "data",
            placeHolder: "Expiry date",
            required: true,
        },
    ],

    PRLIC: [
        {
            type: "file",
            placeHolder: "Upload 21B license",
            required: true,
        },
        {
            type: "text",
            placeHolder: "Drug license number",
            required: true,
        },
        {
            type: "data",
            placeHolder: "Expiry date",
            required: true,
        },
    ],
};

const REGISTRATION_PLACEHOLDER = {
    category_4: {
        label_file: "Registration Certificate",
        placeHolder_file: "Upload registration certificate",
        label_text: "Registration Certificate",
        placeHolder_text: "Upload registration certificate",
        label_data: "Registration Certificate",
        placeHolder_data: "Upload registration certificate",
    },
    category_5: {
        label: "",
        placeHolder: "Upload Govt. Establishment Order",
    },
    type_3: {
        label: "Clinic Registration",
        placeHolder: "Upload Certificate",


    }

};

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
    mapping: {},
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
