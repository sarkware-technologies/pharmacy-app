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
    // Retail Pharmacy (Only Retail - categoryId 1)
    if (categoryId === 1) {
      return {
        screenName: 'PharmacyRetailerForm',
        params: {
          mode: 'edit',
          customerId: customerData.id,
          customerData: customerData,
          typeId: 1,
          categoryId: 1,
          subCategoryId: 0,
        }
      };
    }
    // Wholesaler Pharmacy (Only Wholesaler - categoryId 2)
    else if (categoryId === 2) {
      return {
        screenName: 'PharmacyWholesalerForm',
        params: {
          mode: 'edit',
          customerId: customerData.id,
          customerData: customerData,
          typeId: 1,
          categoryId: 2,
          subCategoryId: 0,
        }
      };
    }
    // Retail Cum Wholesaler (categoryId 3)
    else if (categoryId === 3) {
      return {
        screenName: 'PharmacyWholesalerRetailerForm',
        params: {
          mode: 'edit',
          customerId: customerData.id,
          customerData: customerData,
          typeId: 1,
          categoryId: 3,
          subCategoryId: 0,
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
 * Handle onboard/edit button click - Navigate to appropriate screen
 * For NOT-ONBOARDED/PENDING: Navigate to OnboardCustomer screen
 * For APPROVED/ACTIVE: Navigate to the appropriate registration form for editing
 * 
 * @param {Object} navigation - React Navigation object
 * @param {String} customerId - Customer ID to fetch
 * @param {Boolean} isStaging - Whether this is from staging tab
 * @param {Function} customerAPI - Customer API instance (optional, for backward compatibility)
 * @param {Function} showToast - Toast notification function (optional, for backward compatibility)
 * @param {String} statusName - Customer status name (optional, for determining edit vs onboard)
 */
export const handleOnboardCustomer = async (navigation, customerId, isStaging, customerAPI, showToast, statusName) => {
  try {
    console.log('🎯 handleOnboardCustomer called with:', {
      customerId,
      isStaging,
      statusName,
      hasNavigation: !!navigation,
    });

    // If customerAPI is provided, fetch customer details first
    if (customerAPI) {
      console.log('📡 Fetching customer details from API...');
      const response = await customerAPI.getCustomerDetails(customerId, isStaging);
      console.log('📥 API Response:', response.success ? 'Success' : 'Failed');

      if (response.success && response.data) {
        const customerData = response.data;
        console.log('✅ Customer data received:', {
          id: customerData.id,
          type: customerData.customerType,
          category: customerData.customerCategory,
          statusId: customerData.statusId,
        });

        // Check if customer is approved/active (statusId 7 or statusName APPROVED/ACTIVE)
        const isApprovedOrActive = 
          customerData.statusId === '7' || 
          customerData.statusId === 7 ||
          customerData.statusName?.toLowerCase() === 'approved' ||
          customerData.statusName?.toLowerCase() === 'active' ||
          statusName?.toLowerCase() === 'approved' ||
          statusName?.toLowerCase() === 'active';

        if (isApprovedOrActive) {
          // For approved/active customers, navigate to edit form
          console.log('📝 Customer is approved/active - navigating to edit form');
          const editNavigation = getEditNavigationScreen(customerData);
          
          if (editNavigation && editNavigation.screenName) {
            console.log('✅ Navigating to:', editNavigation.screenName);
            navigation.navigate(editNavigation.screenName, {
              ...editNavigation.params,
              typeId: customerData.typeId,
              categoryId: customerData.categoryId,
              subCategoryId: customerData.subCategoryId || 0,
            });
            
            console.log('✅ Navigation to edit form completed successfully');
            
            // Show success toast
            setTimeout(() => {
              showToast?.({
                type: 'success',
                text1: 'Success',
                text2: 'Loading customer details for editing...',
              });
            }, 100);
          } else {
            console.warn('⚠️ No edit navigation found for customer type/category');
            showToast?.({
              type: 'error',
              text1: 'Error',
              text2: 'Cannot determine edit form for this customer type',
            });
          }
        } else {
          // For NOT-ONBOARDED/PENDING, navigate to OnboardCustomer screen
          console.log('📋 Customer is NOT-ONBOARDED/PENDING - navigating to OnboardCustomer');
          navigation.navigate('OnboardCustomer', {
            customerId: customerData.id,
            customerData: customerData,
            isStaging: isStaging,
          });

          console.log('✅ Navigation to OnboardCustomer completed successfully');

          // Show success toast
          setTimeout(() => {
            showToast?.({
              type: 'success',
              text1: 'Success',
              text2: 'Loading customer details...',
            });
          }, 100);
        }
      } else {
        console.error('❌ API response was not successful:', response);
        showToast?.({
          type: 'error',
          text1: 'Error',
          text2: response.message || 'Failed to fetch customer details',
        });
      }
    } else {
      // Direct navigation without API call (for when data is already available)
      // This case is less common, but if statusName is provided, use it
      const isApprovedOrActive = 
        statusName?.toLowerCase() === 'approved' ||
        statusName?.toLowerCase() === 'active';
      
      if (isApprovedOrActive) {
        console.warn('⚠️ Cannot navigate to edit form without customer data. Please provide customerAPI.');
        showToast?.({
          type: 'error',
          text1: 'Error',
          text2: 'Customer data required for editing',
        });
      } else {
        console.log('🚀 Navigating to OnboardCustomer without API call');
        navigation.navigate('OnboardCustomer', {
          customerId: customerId,
          isStaging: isStaging,
        });
      }
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
