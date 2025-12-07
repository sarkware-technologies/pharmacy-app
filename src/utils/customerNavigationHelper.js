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
  const { typeId, categoryId, subCategoryId, customerType, customerCategory, customerTypeCode, customerCategoryCode } = customerData;

  console.log('🔍 getEditNavigationScreen called with:', {
    typeId,
    categoryId,
    subCategoryId,
    customerType,
    customerCategory,
    customerTypeCode,
    customerCategoryCode,
    id: customerData.id,
  });

  // Convert typeId and categoryId to numbers if they're strings
  const numTypeId = typeof typeId === 'string' ? parseInt(typeId, 10) : typeId;
  const numCategoryId = typeof categoryId === 'string' ? parseInt(categoryId, 10) : categoryId;
  const numSubCategoryId = typeof subCategoryId === 'string' ? parseInt(subCategoryId, 10) : (subCategoryId || 0);

  // Hospital Types (typeId: 2)
  if (numTypeId === 2 || customerTypeCode === 'HOS') {
    // Private Hospital (categoryId: 4 or categoryCode: PRI)
    if (numCategoryId === 4 || customerCategoryCode === 'PRI') {
      console.log('✅ Matched: Private Hospital');
      return {
        screenName: 'PrivateRegistrationForm',
        params: {
          mode: 'edit',
          customerId: customerData.id,
          customerData: customerData,
        }
      };
    }
    // Group/Corporate Hospital (categoryId: 1 or categoryCode: GRP)
    else if (numCategoryId === 1 || customerCategoryCode === 'GRP') {
      console.log('✅ Matched: Group Hospital');
      return {
        screenName: 'GroupHospitalRegistrationForm',
        params: {
          mode: 'edit',
          customerId: customerData.id,
          customerData: customerData,
        }
      };
    }
    // Government Hospital (categoryId: 5 or categoryCode: GOV)
    else if (numCategoryId === 5 || customerCategoryCode === 'GOV') {
      console.log('✅ Matched: Government Hospital');
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

  // Pharmacy Types (typeId: 1)
  if (numTypeId === 1 || customerTypeCode === 'PCM') {
    // Retail Pharmacy (Only Retail - categoryId: 1 or categoryCode: OR)
    if (numCategoryId === 1 || customerCategoryCode === 'OR') {
      console.log('✅ Matched: Pharmacy Retailer');
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
    // Wholesaler Pharmacy (Only Wholesaler - categoryId: 2 or categoryCode: OW)
    else if (numCategoryId === 2 || customerCategoryCode === 'OW') {
      console.log('✅ Matched: Pharmacy Wholesaler');
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
    // Retail Cum Wholesaler (categoryId: 3 or categoryCode: RCW)
    else if (numCategoryId === 3 || customerCategoryCode === 'RCW') {
      console.log('✅ Matched: Pharmacy Wholesaler & Retailer');
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

  // Doctor Types (typeId: 3)
  if (numTypeId === 3 || customerTypeCode === 'DOC') {
    console.log('✅ Matched: Doctor');
    return {
      screenName: 'DoctorRegistrationForm',
      params: {
        mode: 'edit',
        customerId: customerData.id,
        customerData: customerData,
      }
    };
  }

  // Fallback: Try to match by customerType string
  if (customerType) {
    const typeLower = customerType.toLowerCase();
    const categoryLower = customerCategory?.toLowerCase() || '';
    
    console.log('🔄 Trying fallback matching by customerType string:', { typeLower, categoryLower });
    
    // Pharmacy matching
    if (typeLower.includes('pharmacy') || typeLower.includes('chemist') || typeLower.includes('medical store')) {
      if (categoryLower.includes('retail') && !categoryLower.includes('wholesaler')) {
        console.log('✅ Fallback matched: Pharmacy Retailer');
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
      } else if (categoryLower.includes('wholesaler') && !categoryLower.includes('retail')) {
        console.log('✅ Fallback matched: Pharmacy Wholesaler');
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
      } else if (categoryLower.includes('retail') && categoryLower.includes('wholesaler')) {
        console.log('✅ Fallback matched: Pharmacy Wholesaler & Retailer');
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
    
    // Hospital matching
    if (typeLower.includes('hospital')) {
      if (categoryLower.includes('private')) {
        console.log('✅ Fallback matched: Private Hospital');
        return {
          screenName: 'PrivateRegistrationForm',
          params: {
            mode: 'edit',
            customerId: customerData.id,
            customerData: customerData,
          }
        };
      } else if (categoryLower.includes('group') || categoryLower.includes('corporate')) {
        console.log('✅ Fallback matched: Group Hospital');
        return {
          screenName: 'GroupHospitalRegistrationForm',
          params: {
            mode: 'edit',
            customerId: customerData.id,
            customerData: customerData,
          }
        };
      } else if (categoryLower.includes('government') || categoryLower.includes('govt')) {
        console.log('✅ Fallback matched: Government Hospital');
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
    
    // Doctor matching
    if (typeLower.includes('doctor') || typeLower.includes('clinic')) {
      console.log('✅ Fallback matched: Doctor');
      return {
        screenName: 'DoctorRegistrationForm',
        params: {
          mode: 'edit',
          customerId: customerData.id,
          customerData: customerData,
        }
      };
    }
  }

  // If we still can't match, log warning but don't return null
  console.warn('⚠️ Unknown customer type/category combination:', { 
    typeId: numTypeId, 
    categoryId: numCategoryId, 
    subCategoryId: numSubCategoryId,
    customerType,
    customerCategory,
    customerTypeCode,
    customerCategoryCode,
  });
  
  // Don't return null - instead, default to PharmacyRetailerForm as a last resort
  // This ensures we always navigate to a registration form
  console.warn('⚠️ Defaulting to PharmacyRetailerForm as fallback');
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
      // For onboard mode, always use isStaging = false in API calls
      const useStagingForAPI = false;
      const response = await customerAPI.getCustomerDetails(customerId, useStagingForAPI);
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
            // Navigate to the screen - it's in MainStack, so we can navigate directly
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
          // For NOT-ONBOARDED/PENDING, navigate to the appropriate registration form with onboard mode
          console.log('📋 Customer is NOT-ONBOARDED/PENDING - navigating to registration form with onboard mode');
          const onboardNavigation = getEditNavigationScreen(customerData);
          
          if (onboardNavigation && onboardNavigation.screenName) {
            console.log('✅ Navigating to:', onboardNavigation.screenName, 'with onboard mode');
            
            // Prepare navigation params
            // For onboard mode, always set isStaging to false
            const navParams = {
              ...onboardNavigation.params,
              mode: 'onboard', // Set mode to 'onboard' instead of 'edit'
              typeId: customerData.typeId,
              categoryId: customerData.categoryId,
              subCategoryId: customerData.subCategoryId || 0,
              isStaging: false, // Always false for onboard mode
              customerId: customerData.id, // Ensure customerId is passed
              customerData: customerData, // Pass full customer data
            };
            
            console.log('📦 Navigation params:', navParams);
            console.log('🔍 Navigation object:', {
              hasNavigate: typeof navigation.navigate === 'function',
              hasGetParent: typeof navigation.getParent === 'function',
              screenName: onboardNavigation.screenName,
            });
            
            // Navigate to the screen - it's in MainStack, so we can navigate directly
            // The screen names are registered at the MainStack level
            // In React Navigation v5+, you can navigate to any screen in the navigation tree
            try {
              // Try direct navigation first (should work in React Navigation v5+)
              if (typeof navigation.navigate === 'function') {
                navigation.navigate(onboardNavigation.screenName, navParams);
                console.log('✅ Navigation to registration form with onboard mode completed successfully');
                
                // Show success toast
                setTimeout(() => {
                  showToast?.({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Loading customer details...',
                  });
                }, 100);
              } else {
                throw new Error('Navigation.navigate is not a function');
              }
            } catch (navError) {
              console.error('❌ Navigation error:', navError);
              console.error('Navigation error details:', {
                message: navError.message,
                stack: navError.stack,
                screenName: onboardNavigation.screenName,
                params: navParams,
              });
              
              // Try alternative navigation method using parent navigator
              try {
                if (navigation.getParent && typeof navigation.getParent === 'function') {
                  const parent = navigation.getParent();
                  if (parent && typeof parent.navigate === 'function') {
                    console.log('🔄 Trying parent navigator...');
                    parent.navigate(onboardNavigation.screenName, navParams);
                    console.log('✅ Parent navigation succeeded');
                    
                    setTimeout(() => {
                      showToast?.({
                        type: 'success',
                        text1: 'Success',
                        text2: 'Loading customer details...',
                      });
                    }, 100);
                  } else {
                    throw new Error('Parent navigator not available or navigate not a function');
                  }
                } else {
                  throw new Error('getParent not available on navigation object');
                }
              } catch (parentNavError) {
                console.error('❌ Parent navigation also failed:', parentNavError);
                showToast?.({
                  type: 'error',
                  text1: 'Navigation Error',
                  text2: `Failed to navigate to ${onboardNavigation.screenName}. ${parentNavError.message || 'Please try again.'}`,
                });
              }
            }
          } else {
            // This should never happen now since getEditNavigationScreen always returns a screen
            console.error('❌ No navigation found for customer type/category - this should not happen');
            console.error('Customer data:', customerData);
            showToast?.({
              type: 'error',
              text1: 'Error',
              text2: 'Unable to determine registration form for this customer type',
            });
          }
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
        console.warn('⚠️ Cannot navigate to registration form without customer data. Please provide customerAPI.');
        showToast?.({
          type: 'error',
          text1: 'Error',
          text2: 'Customer data required for onboarding',
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
