const ENTITY_TYPE_CODE = {
  hospitals: "HOSP",
  groupHospitals: "HOSP",
  doctors: "DOCT",
  pharmacy: "PCM",
};



export const buildEntityPayload = ({
  typeId,
  categoryId,
  subCategoryId,
  entity,
  customerGroupId,
  page = 1,
  limit = 20,
}) => {


  const payload = {
    typeCode: [ENTITY_TYPE_CODE[entity]],
    statusIds: [7, 2],
    page,
    limit,
  };

  if (typeId == 1) {
    payload.mappingFor = "PCM";
    if (customerGroupId) payload.customerGroupId = customerGroupId;
    return payload;
  }



  if (typeId == 2) {

    if (categoryId == 4) {

      if (subCategoryId == 1 || subCategoryId == 2) {
        if (entity == "groupHospitals") {
          payload.subCategoryCode = ["PGH"];
          payload.mappingFor = "HOSP";
          return payload;
        }

        if (entity == "pharmacy") {
          payload.mappingFor = "HOSP";
          payload.customerGroupId = customerGroupId;
          return payload;
        }
      }

      if (subCategoryId == 3) {
        if (entity == "hospitals") {
          payload.categoryCode = ["OR", "RCW", "OW", "PRI"];
          payload.mappingFor = "PGH";
          return payload;
        }

        if (entity == "pharmacy") {
          payload.mappingFor = "PGH";
          payload.customerGroupId = customerGroupId;
          return payload;
        }
      }
    }

    if (categoryId == 5) {
      payload.categoryCode = ["GOV"];
      payload.mappingFor = "GOV";
      return payload;
    }
  }

  if (typeId == 3) {
    if (entity == "hospitals") {
      payload.mappingFor = "HOSP";
      return payload;
    }

    if (entity == "pharmacy") {
      payload.mappingFor = "DOCT";
      payload.customerGroupId = customerGroupId;
      return payload;
    }
  }

  console.warn("Invalid payload combination", payload);
  return payload;
};
