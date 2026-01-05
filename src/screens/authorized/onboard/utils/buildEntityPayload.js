export const buildEntityPayload = ({
  selector,     // 'hospital' | 'doctor' | 'pharmacy'
  formData,     // full formData
  page = 1,
  limit = 20,
  enableLocationFilter
}) => {
  const ENTITY_TYPE_MAP = {
    Hospital: 'HOSP',
    Doctor: 'DOCT',
    Pharmacy: 'PCM',
  };

  const CATEGORY_CODE_MAP = {
    4: ['OR', 'RCW', 'OW', 'PRI'],
    5: ['GOV'],
  };

  const SUB_CATEGORY_CODE_MAP = {
    1: ['PGH'],
    2: ['PGH'],
  };

  console.log(selector, '');
  

  const entityType = ENTITY_TYPE_MAP[selector];

  const {
    typeId,
    categoryId,
    subCategoryId,
    customerGroupId,
    stateId,
    cityId,
  } = formData;

  let mappingFor = 'HOSP'; // safe default


  
  

  if (typeId == 1) {
    mappingFor = 'PCM';
  }

  if (typeId == 2) {
    if (categoryId == 4) {
      if (subCategoryId == 1 || subCategoryId == 2) {
        mappingFor = 'HOSP';
      }
      if (subCategoryId == 3) {
        mappingFor = 'PGH';
      }
    }

    if (categoryId == 5) {
      mappingFor = 'GOV';
    }
  }

  if (typeId == 3) {
    if (entityType == 'HOSP') mappingFor = 'HOSP';
    if (entityType == 'PCM') mappingFor = 'DOCT';
  }

  const payload = {
    typeCode: [entityType],
    statusIds: [7, 2],
    page,
    limit,
    mappingFor,
  };


  if(enableLocationFilter){
  if (stateId) payload.stateIds = [stateId];
  if (cityId) payload.cityIds = [cityId];
  }



  if (CATEGORY_CODE_MAP[categoryId]) {
    payload.categoryCode = CATEGORY_CODE_MAP[categoryId];
  }

  if (SUB_CATEGORY_CODE_MAP[subCategoryId]) {
    payload.subCategoryCode = SUB_CATEGORY_CODE_MAP[subCategoryId];
  }

  if (
    customerGroupId &&
    (entityType == 'PCM' || mappingFor == 'PCM' || mappingFor == 'DOCT')
  ) {
    payload.customerGroupId = customerGroupId;
  }

  return payload;
};
