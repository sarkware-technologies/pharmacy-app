/* -------------------- REGISTER FORMAT -------------------- */
const formatRegisterData = (data) => {
  if (!data) return data;

  let generalDetails = data.generalDetails;
  if (generalDetails) {
    const { stateName, cityName, ...rest } = generalDetails;
    generalDetails = rest;
  }

  let licenceDetails = data.licenceDetails;
  if (licenceDetails?.licence?.length) {
    licenceDetails = {
      ...licenceDetails,
      licence: licenceDetails.licence.map((lic) => {
        const { docTypeId, ...restLicence } = lic;
        return restLicence;
      }),
    };
  }

  return {
    ...data,
    generalDetails,
    licenceDetails,
  };
};

/* -------------------- MERGE OBJECTS -------------------- */
const mergeCustomerObjects = (base, changes) => {
  if (!changes) return base;

  const result = { ...base };

  Object.keys(changes).forEach((key) => {
    const baseVal = base?.[key];
    const changeVal = changes[key];

    if (
      baseVal &&
      changeVal &&
      typeof baseVal === "object" &&
      typeof changeVal === "object" &&
      !Array.isArray(baseVal) &&
      !Array.isArray(changeVal)
    ) {
      result[key] = mergeCustomerObjects(baseVal, changeVal);
    } else {
      result[key] = changeVal;
    }
  });

  return result;
};

/* -------------------- APPLY APPROVAL -------------------- */
const applyMappingApproval = (
  data,
  mapped,
  divisions,
  distributors,
  customerGroupId
) => {
  // ❗ structuredClone not supported in RN
  const finalData = JSON.parse(JSON.stringify(data));

  const mappingKeys = ["doctors", "pharmacy", "hospitals"];

  mappingKeys.forEach((key) => {
    const originalList = finalData?.mapping?.[key];
    const mappedList = mapped?.[key];

    if (!Array.isArray(originalList) || !Array.isArray(mappedList)) return;

    const approveMap = new Map(
      mappedList.map((item) => [item.id, item.isApproved])
    );

    finalData.mapping[key] = originalList.map((item) => {
      const mappedValue = approveMap.get(item.id);

      const updatedItem = {
        ...item,
        ...(mappedValue !== null && mappedValue !== undefined
          ? { isApproved: mappedValue, action: "APPROVE" }
          : {}),
      };

      if (key === "hospitals" && Array.isArray(item.pharmacy)) {
        const mappedHospital = mappedList.find((m) => m.id === item.id);

        if (mappedHospital?.pharmacy?.length) {
          const nestedApproveMap = new Map(
            mappedHospital.pharmacy.map((p) => [p.id, p.isApproved])
          );

          updatedItem.pharmacy = item.pharmacy.map((p) => {
            const mappedChildValue = nestedApproveMap.get(p.id);
            return {
              ...p,
              ...(mappedChildValue !== null &&
              mappedChildValue !== undefined
                ? { isApproved: mappedChildValue, action: "APPROVE" }
                : {}),
            };
          });
        }
      }

      return updatedItem;
    });
  });

  finalData.divisions = mergeUnique(data?.divisions, divisions, "divisionId");
  finalData.distributors = mergeUnique(
    data?.distributors,
    distributors,
    "id"
  );

  if (customerGroupId) {
    finalData.customerGroupId = customerGroupId;
  }

  return finalData;
};

/* -------------------- HELPERS -------------------- */
const mergeUnique = (original = [], extra = [], key) => {
  const map = new Map();

  [...original, ...extra].forEach((item) => {
    const id = item?.[key];
    if (id === undefined || id === null) return;
    map.set(id, { ...map.get(id), ...item });
  });

  return Array.from(map.values());
};

const transform = (item) => {
  const { isApproved, ...rest } = item;
  return {
    ...rest,
    ...(isApproved !== null && isApproved !== undefined
      ? { isApproved: isApproved === true }
      : {}),
  };
};

/* -------------------- FORMAT MAPPING -------------------- */
const mappingFormat = (mapping) => ({
  ...(mapping?.pharmacy && {
    pharmacy: mapping.pharmacy.map(transform),
  }),

  ...(mapping?.hospitals && {
    hospitals: mapping.hospitals.map((h) => ({
      ...transform(h),
      ...(h?.pharmacy && {
        pharmacy: h.pharmacy.map(transform),
      }),
    })),
  }),

  ...(mapping?.doctors && {
    doctors: mapping.doctors.map(transform),
  }),

  ...(mapping?.groupHospitals && {
    groupHospitals: mapping.groupHospitals.map(transform),
  }),
});

const NESTED_KEYS = [
  "doctors",
  "pharmacy",
  "hospitals",
  "groupHospitals",
];

/* -------------------- FIND -------------------- */
const findMappingById = (data, targetId) => {
  if (!data) return null;

  if (Array.isArray(data)) {
    for (const item of data) {
      const found = findMappingById(item, targetId);
      if (found) return found;
    }
    return null;
  }

  if (typeof data === "object" && data.id === targetId) {
    return data;
  }

  for (const key of NESTED_KEYS) {
    if (Array.isArray(data[key])) {
      const found = findMappingById(data[key], targetId);
      if (found) return found;
    }
  }

  return null;
};

/* -------------------- UPDATE -------------------- */
const findAndUpdateMapping = (data, targetId, update) => {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map((item) =>
      findAndUpdateMapping(item, targetId, update)
    );
  }

  if (typeof data === "object") {
    if (data.id === targetId) {
      return { ...data, ...update };
    }

    const updatedObj = { ...data };

    Object.keys(data).forEach((key) => {
      if (typeof data[key] === "object") {
        updatedObj[key] = findAndUpdateMapping(
          data[key],
          targetId,
          update
        );
      }
    });

    return updatedObj;
  }

  return data;
};

/* -------------------- VALIDATION -------------------- */
const isAllApprovedChecked = (data) => {
  if (!data) return true;

  if (Array.isArray(data)) {
    return data.every(isAllApprovedChecked);
  }

  if (typeof data === "object") {
    if ("id" in data && (data.isApproved === null || data.isApproved === undefined)) {
      return false;
    }

    for (const key of NESTED_KEYS) {
      if (Array.isArray(data[key])) {
        if (!isAllApprovedChecked(data[key])) return false;
      }
    }
  }

  return true;
};

/* -------------------- REMOVE KEYS -------------------- */
const removeKeyFromMapping = (data) => {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map(removeKeyFromMapping);
  }

  if (typeof data === "object") {
    let rest = data;

    if (data.isApproved === true) {
      const { isApproved, ...remaining } = data;
      rest = remaining;
    }

    NESTED_KEYS.forEach((key) => {
      if (Array.isArray(rest[key])) {
        rest = {
          ...rest,
          [key]: removeKeyFromMapping(rest[key]),
        };
      }
    });

    return rest;
  }

  return data;
};

/* -------------------- EXPORTS -------------------- */
export {
  formatRegisterData,
  mergeCustomerObjects,
  applyMappingApproval,
  mappingFormat,
  findMappingById,
  findAndUpdateMapping,
  isAllApprovedChecked,
  removeKeyFromMapping,
};
