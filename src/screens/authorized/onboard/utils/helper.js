export const resolveCategoryLabel = ({
  typeId,
  categoryId,
  subCategoryId,
}) => {

    
  if (typeId == 3) return 'Doctor';

  if (categoryId == 5) return 'Govt';
  if (categoryId == 1) return 'Only Retail';
  if (categoryId == 2) return 'Only Wholesaler';
  if (categoryId == 3) return 'Retail Cum Wholesaler';

  if (categoryId == 4) {
    if (subCategoryId == 1) return 'Private - Clinic';
    if (subCategoryId == 2) return 'Private - Individual Hospital';
    if (subCategoryId == 3) return 'Private - Group Hospital / GBU';
    return 'Private';
  }

  return '';
};


export const getSelectedTypeByFormData = (formData) => {
  console.log("worknafuhsduif");
  
    const { typeId, categoryId, subCategoryId } = formData || {};

    // Type 3 → DOCT
    if (typeId == 3) {
        return 'DOCT';
    }

    // Type 1 → HOSP
    if (typeId == 1) {
        return 'HOSP';
    }

    // Type 2 cases
    if (typeId == 2) {
        // GOV
        if (categoryId === 5) {
            return 'GOV';
        }

        // Category 4 cases
        if (categoryId == 4) {
            if (subCategoryId == 3) {
                return 'PGH';
            }

            if ([1, 2].includes(subCategoryId)) {
                return 'HOSP';
            }
        }
    }

    return null; // fallback (important)
};
