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
