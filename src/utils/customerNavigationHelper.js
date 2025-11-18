/**
 * Helper utility to determine which registration screen to navigate to
 * based on customer type, category, and subcategory
 */

/**
 * Get the navigation screen name and params for editing a customer
 * @param {Object} customerData - Customer data from API
 * @returns {Object} - { screenName, params }
 */
export const getEditNavigationScreen = (customerData) => {
  const { typeId, categoryId, subCategoryId, customerType, customerCategory } = customerData;

  // Hospital Types
  if (typeId === 2) {
    // Private Hospital
    if (categoryId === 4) {
      return {
        screenName: 'PrivateRegistrationForm',
        params: {
          mode: 'edit',
          customerId: customerData.id,
          customerData: customerData,
        }
      };
    }
    // Group/Corporate Hospital
    else if (categoryId === 1) {
      return {
        screenName: 'GroupHospitalRegistrationForm',
        params: {
          mode: 'edit',
          customerId: customerData.id,
          customerData: customerData,
        }
      };
    }
    // Government Hospital
    else if (categoryId === 5) {
      return {
        screenName: 'GovtHospitalRegistrationForm',
        params: {
          mode: 'edit',
          customerId: customerData.id,
          customerData: customerData,
        }
      };
    }
  }

  // Pharmacy Types
  if (typeId === 1) {
    // Retail Pharmacy
    if (categoryId === 1) {
      return {
        screenName: 'PharmacyRetailerForm',
        params: {
          mode: 'edit',
          customerId: customerData.id,
          customerData: customerData,
        }
      };
    }
    // Wholesaler Pharmacy
    else if (categoryId === 2) {
      return {
        screenName: 'PharmacyWholesalerForm',
        params: {
          mode: 'edit',
          customerId: customerData.id,
          customerData: customerData,
        }
      };
    }
    // Retail Cum Wholesaler
    else if (categoryId === 3) {
      return {
        screenName: 'PharmacyWholesalerRetailerForm',
        params: {
          mode: 'edit',
          customerId: customerData.id,
          customerData: customerData,
        }
      };
    }
  }

  // Doctor Types
  if (typeId === 3) {
    return {
      screenName: 'DoctorRegistrationForm',
      params: {
        mode: 'edit',
        customerId: customerData.id,
        customerData: customerData,
      }
    };
  }

  // Default fallback
  console.warn('Unknown customer type/category combination:', { typeId, categoryId, subCategoryId });
  return null;
};

/**
 * Transform API customer data to form data structure
 * This ensures the edit form is properly populated
 * @param {Object} apiData - Raw API response data
 * @returns {Object} - Transformed form data
 */
export const transformCustomerDataForEdit = (apiData) => {
  const {
    id,
    typeId,
    categoryId,
    subCategoryId,
    customerCode,
    isBuyer,
    isEmailVerified,
    isMobileVerified,
    isExisting,
    securityDetails = {},
    groupDetails = {},
    generalDetails = {},
    licenceDetails = {},
    docType = [],
    suggestedDistributors = [],
    mapping = {}
  } = apiData;

  return {
    // Basic Info
    customerId: id,
    customerCode,
    typeId,
    categoryId,
    subCategoryId,
    isBuyer,
    isExisting,

    // Security Details
    mobile: securityDetails.mobile || '',
    email: securityDetails.email || '',
    panNumber: securityDetails.panNumber || '',
    gstNumber: securityDetails.gstNumber || '',
    isMobileVerified,
    isEmailVerified,

    // General Details
    name: generalDetails.customerName || '',
    shortName: generalDetails.shortName || '',
    address1: generalDetails.address1 || '',
    address2: generalDetails.address2 || '',
    address3: generalDetails.address3 || '',
    address4: generalDetails.address4 || '',
    pincode: generalDetails.pincode ? String(generalDetails.pincode) : '',
    area: generalDetails.area || '',
    cityId: generalDetails.cityId,
    cityName: generalDetails.cityName || '',
    stateId: generalDetails.stateId,
    stateName: generalDetails.stateName || '',
    ownerName: generalDetails.ownerName || '',
    clinicName: generalDetails.clinicName || '',
    specialist: generalDetails.specialist || '',

    // Group Details
    customerGroupId: groupDetails.customerGroupId,
    customerGroupName: groupDetails.customerGroupName || '',

    // License Details
    licences: licenceDetails.licence || [],

    // Documents
    documents: docType || [],

    // Suggested Distributors
    suggestedDistributors: suggestedDistributors || [],

    // Mapping
    hospitals: mapping.hospitals || [],
    doctors: mapping.doctors || [],
    pharmacies: mapping.pharmacy || [],
    groupHospitals: mapping.groupHospitals || [],
  };
};

/**
 * Handle onboard button click - Fetch customer data and navigate to edit screen
 * This is the most efficient way as it:
 * 1. Fetches data once from API
 * 2. Transforms it immediately
 * 3. Passes both raw and transformed data to form
 * 4. Form doesn't need to fetch again
 * 
 * @param {Object} navigation - React Navigation object
 * @param {String} customerId - Customer ID to fetch
 * @param {Boolean} isStaging - Whether this is from staging tab
 * @param {Function} customerAPI - Customer API instance
 * @param {Function} showToast - Toast notification function
 */
export const handleOnboardCustomer = async (navigation, customerId, isStaging, customerAPI, showToast) => {
  try {
    console.log('🎯 handleOnboardCustomer called with:', {
      customerId,
      isStaging,
      hasNavigation: !!navigation,
      hasCustomerAPI: !!customerAPI,
    });

    // Fetch customer details
    console.log('📡 Fetching customer details from API...');
    const response = await customerAPI.getCustomerDetails(customerId, isStaging);
    console.log('📥 API Response:', response.success ? 'Success' : 'Failed');

    if (response.success && response.data) {
      const customerData = response.data;
      console.log('✅ Customer data received:', {
        id: customerData.id,
        type: customerData.customerType,
        category: customerData.customerCategory,
        subCategory: customerData.customerSubcategory,
      });
      
      // Get navigation details
      const navigationDetails = getEditNavigationScreen(customerData);
      console.log('🧭 Navigation details:', navigationDetails);

      if (navigationDetails) {
        // Transform data for form - this makes it efficient as form receives pre-processed data
        console.log('🔄 Transforming customer data...');
        const transformedData = transformCustomerDataForEdit(customerData);
        console.log('✅ Data transformed. Preview:', {
          customerId: transformedData.customerId,
          name: transformedData.name,
          clinicName: transformedData.clinicName,
          mobile: transformedData.mobile,
          email: transformedData.email,
          address1: transformedData.address1,
        });

        // Prepare navigation params
        const navigationParams = {
          mode: 'edit',
          customerId: customerData.id,
          isStaging,
          isEditMode: true,
          // Pass raw customer data
          customerData: customerData,
          // Pass transformed data ready for form population
          editData: transformedData,
          // Pass type information for reference
          typeId: customerData.typeId,
          typeName: customerData.customerType,
          categoryId: customerData.categoryId,
          categoryName: customerData.customerCategory,
          subCategoryId: customerData.subCategoryId,
          subCategoryName: customerData.customerSubcategory,
        };

        console.log('🚀 Navigating to:', navigationDetails.screenName);
        console.log('📦 Navigation params keys:', Object.keys(navigationParams));

        // Navigate to edit screen with all necessary data
        navigation.navigate(navigationDetails.screenName, navigationParams);

        console.log('✅ Navigation completed successfully');

        // Show success toast
        setTimeout(() => {
          showToast?.({
            type: 'success',
            text1: 'Success',
            text2: 'Opening edit form...',
          });
        }, 100);
      } else {
        console.error('❌ Navigation details not found for customer type');
        showToast?.({
          type: 'error',
          text1: 'Navigation Error',
          text2: 'Could not determine the correct form for this customer type',
        });
      }
    } else {
      console.error('❌ API response was not successful:', response);
      showToast?.({
        type: 'error',
        text1: 'Error',
        text2: response.message || 'Failed to fetch customer details',
      });
    }
  } catch (error) {
    console.error('❌ Error handling onboard customer:', error);
    console.error('Error stack:', error.stack);
    showToast?.({
      type: 'error',
      text1: 'Error',
      text2: error.message || 'An error occurred while loading customer data',
    });
  }
};
