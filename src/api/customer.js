import apiClient from './apiClient';

export const customerAPI = {

    // Get customer types (for filters)
    getCustomerTypes: async () => {
        try {
            const response = await apiClient.get('/user-management/customer/customer-type');
            return response;
        } catch (error) {
            console.error('Error fetching customer types:', error);
            throw error;
        }
    },

    // Get customer status options (for filters)
    getCustomerStatuses: async () => {
        try {
            const response = await apiClient.get('/user-management/customer/filter/customer-status');
            return response;
        } catch (error) {
            console.error('Error fetching customer statuses:', error);
            throw error;
        }
    },

    // Get customers list with pagination and filters
    // Modified to support both regular and staging endpoints
    getCustomersList: async ({
        page = 1,
        limit = 10,
        searchText = '',
        typeCode = [],
        statusCode = '',
        cityIds = [],
        categoryCode = [],
        subCategoryCode = [],
        statusIds = [],
        stateIds=[],
        isStaging = false, // NEW: Flag to determine which endpoint to use
        sortBy = '',
        sortDirection = 'ASC'
    } = {}) => {
        try {
            // Build request body with all required fields (matching curl format)
            const requestBody = {
                typeCode: Array.isArray(typeCode) ? typeCode : [],
                categoryCode: Array.isArray(categoryCode) ? categoryCode : [],
                subCategoryCode: Array.isArray(subCategoryCode) ? subCategoryCode : [],
                statusIds: Array.isArray(statusIds) ? statusIds : [],
                page,
                limit,
                sortBy: sortBy || '',
                sortDirection: sortDirection || 'ASC'
            };

            // Add optional filters only if they have values
            if (searchText) requestBody.searchText = searchText;
            if (statusCode) requestBody.statusCode = statusCode;
            if (cityIds && cityIds.length > 0) requestBody.cityIds = cityIds;
            if (stateIds && stateIds.length > 0) requestBody.stateIds = stateIds;

            // Use staging endpoint for staging requests, main endpoint otherwise
            const endpoint = isStaging 
                ? '/user-management/customer/customers-list/staging'
                : '/user-management/customer/customers-list';

            const response = await apiClient.post(endpoint, requestBody);
            return response;
        } catch (error) {
            console.error('Error fetching customers list:', error);
            throw error;
        }
    },


    // Get customer details by ID - UPDATED ENDPOINT
    getCustomerDetails: async (customerId, isStaging = false) => {
        try {
            // Add isStaging as query parameter
            const endpoint = `/user-management/customer/customer-by-id/${customerId}?isStaging=${isStaging}`;
            const response = await apiClient.get(endpoint);
            return response;
        } catch (error) {
            console.error('Error fetching customer details:', error);
            throw error;
        }
    },

    // Create new customer (for registration)
    createCustomer: async (customerData) => {
        try {
            const response = await apiClient.post('/user-management/customer/create', customerData);
            return response;
        } catch (error) {
            console.error('Error creating customer:', error);
            throw error;
        }
    },

    // Update customer
    updateCustomer: async (customerId, customerData) => {
        try {
            const response = await apiClient.put(`/user-management/customer/update/${customerId}`, customerData);
            return response;
        } catch (error) {
            console.error('Error updating customer:', error);
            throw error;
        }
    },

    // Delete customer
    deleteCustomer: async (customerId) => {
        try {
            const response = await apiClient.delete(`/user-management/customer/delete/${customerId}`);
            return response;
        } catch (error) {
            console.error('Error deleting customer:', error);
            throw error;
        }
    },

    // Get cities (for filters)
    getCities: async (stateId) => {
        try {
            const endpoint = stateId
                ? `/user-management/cities?stateId=${stateId}`
                : '/user-management/cities';
            const response = await apiClient.get(endpoint);
            return response;
        } catch (error) {
            console.error('Error fetching cities:', error);
            throw error;
        }
    },

    // Get states (for filters)
    getStates: async () => {
        try {
            const response = await apiClient.get('/user-management/states');
            return response;
        } catch (error) {
            console.error('Error fetching states:', error);
            throw error;
        }
    },

    // Get city, state, and area by pincode
    getCityByPin: async (pinCode) => {
        try {
            const response = await apiClient.get(`/user-management/customer/city-by-pin?pinCode=${pinCode}`);
            return response;
        } catch (error) {
            console.error('Error fetching city by pincode:', error);
            throw error;
        }
    },

    // Get customer groups (if needed)
    getCustomerGroups: async () => {
        try {
            const response = await apiClient.get('/user-management/customer/group');
            return response;
        } catch (error) {
            console.error('Error fetching customer groups:', error);
            throw error;
        }
    },

    // Get signed URL for document download/view
    getDocumentSignedUrl: async (s3Path) => {
        try {
            const response = await apiClient.get('/user-management/customer/download-doc?s3Path=' + s3Path);
            return response;
        } catch (error) {
            console.error('Error fetching document signed URL:', error);
            throw error;
        }
    },

    // Generate OTP for mobile or email verification (NEW)
    generateOTP: async (data) => {
        try {
            const response = await apiClient.post('/user-management/verification/generate-otp', data);
            return response;
        } catch (error) {
            console.error('Error generating OTP:', error);
            throw error;
        }
    },

    // Validate OTP (NEW)
    validateOTP: async (otp, data) => {
        try {
            const response = await apiClient.post(`/user-management/verification/validate-otp/${otp}`, data);
            return response;
        } catch (error) {
            console.error('Error validating OTP:', error);
            throw error;
        }
    },

    // Upload documents (NEW)
    uploadDocument: async (formData) => {
        try {
            const token = await apiClient.getToken();

            const response = await fetch('https://pharmsupply-dev-api.pharmconnect.com/user-management/customer/upload-docs?isStaging=false', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                    // Don't set Content-Type header - let fetch set it with boundary
                },
                body: formData,
            });

            const responseData = await response.json();
            return responseData;
        } catch (error) {
            console.error('Error uploading document:', error);
            throw error;
        }
    },

    // Get license types based on type, category and subcategory
    getLicenseTypes: async (typeId, categoryId, subCategoryId) => {
        try {
            const response = await apiClient.get(`/user-management/customer/licence-type?typeId=${typeId}&categoryId=${categoryId}&subCategoryId=${subCategoryId || 1}`);
            return response;
        } catch (error) {
            console.error('Error fetching license types:', error);
            throw error;
        }
    },

    // Workflow approval action (Approve/Reject customer)
    workflowAction: async (workflowId, actionData) => {
        try {
            const response = await apiClient.post(`/approval/workflow-actions/${Number(workflowId)}`, actionData);
            return response;
        } catch (error) {
            console.error('Error performing workflow action:', error);
            throw error;
        }
    },

    // Get hospitals list
    getHospitals: async () => {
        try {
            const response = await apiClient.get('/user-management/customer/hospitals');
            return response;
        } catch (error) {
            console.error('Error fetching hospitals:', error);
            throw error;
        }
    },

    // Get pharmacies list
    getPharmacies: async () => {
        try {
            const response = await apiClient.get('/user-management/customer/pharmacies');
            return response;
        } catch (error) {
            console.error('Error fetching pharmacies:', error);
            throw error;
        }
    },

    // Block/Unblock customer
    blockUnblockCustomer: async (customerIds, distributorId, isActive) => {
        try {
            const response = await apiClient.patch('/user-management/customer/block-unblock', {
                customerIds,
                distributorId,
                isActive
            });
            return response;
        } catch (error) {
            console.error('Error blocking/unblocking customer:', error);
            throw error;
        }
    },

    // Get company users (field team members)
    getCompanyUsers: async (page = 1, limit = 20) => {
        try {
            const response = await apiClient.get(`/user-management/company-user/list?page=${page}&limit=${limit}`);
            return response;
        } catch (error) {
            console.error('Error fetching company users:', error);
            throw error;
        }
    },

    // Get distributors list
    getDistributors: async (page = 1, limit = 20) => {
        try {
            const response = await apiClient.get(`/user-management/distributor/list?page=${page}&limit=${limit}`);
            return response;
        } catch (error) {
            console.error('Error fetching distributors:', error);
            throw error;
        }
    },

    // Get customer divisions
    getCustomerDivisions: async (customerId) => {
        try {
            const response = await apiClient.get(`/user-management/customer/divisions?customerId=${customerId}`);
            return response;
        } catch (error) {
            console.error('Error fetching customer divisions:', error);
            throw error;
        }
    },

    // Link divisions to customer
    linkDivisions: async (customerId, divisionsData) => {
        try {
            const response = await apiClient.put(`/user-management/customer/link-divisions/${customerId}`, divisionsData);
            return response;
        } catch (error) {
            console.error('Error linking divisions:', error);
            throw error;
        }
    },

    // Get all available divisions
    getAllDivisions: async () => {
        try {
            const response = await apiClient.get('/user-management/divisions/list');
            return response;
        } catch (error) {
            console.error('Error fetching all divisions:', error);
            throw error;
        }
    },

    // Get distributors list by division IDs
    getDistributorsList: async (page = 1, limit = 20, divisionIds = [], stateId = 0, cityId = 0) => {
        try {
            let url = `/user-management/distributor/list?page=${page}&limit=${limit}&stateId=${stateId}&cityId=${cityId}`;
            
            // Add division IDs to query params
            if (divisionIds && divisionIds.length > 0) {
                divisionIds.forEach(divId => {
                    url += `&divisionIds=${divId}`;
                });
            }
            
            const response = await apiClient.get(url);
            return response;
        } catch (error) {
            console.error('Error fetching distributors list:', error);
            throw error;
        }
    },

    // Get linked distributors and divisions for a customer
    getLinkedDistributorDivisions: async (customerId) => {
        try {
            const response = await apiClient.get(`/user-management/customer/linked-distributor-division/${customerId}`);
            return response;
        } catch (error) {
            console.error('Error fetching linked distributor divisions:', error);
            throw error;
        }
    },

    // Link distributor and divisions to customer
    linkDistributorDivisions: async (customerId, mappingsData) => {
        try {
            const response = await apiClient.put(`/user-management/customer/link-distributor-division/${customerId}`, mappingsData);
            return response;
        } catch (error) {
            console.error('Error linking distributor divisions:', error);
            throw error;
        }
    },

    // Get pharmacies list with optional filters
    getPharmaciesList: async (typeCode = ['PCM'], customerGroupId = 1, page = 1, limit = 20, stateIds = [], cityIds = [], searchText = '') => {
        try {
            const payload = {
                typeCode,
                customerGroupId,
                page,
                limit
            };
            
            // Add optional filters if provided
            if (stateIds && stateIds.length > 0) {
                payload.stateIds = stateIds;
            }
            if (cityIds && cityIds.length > 0) {
                payload.cityIds = cityIds;
            }
            if (searchText && searchText.trim().length > 0) {
                payload.searchText = searchText.trim();
            }
            
            const response = await apiClient.post('/user-management/customer/customers-list', payload);
            return response;
        } catch (error) {
            console.error('Error fetching pharmacies list:', error);
            throw error;
        }
    },

    // Get states list
    getStatesList: async (page = 1, limit = 20) => {
        try {
            const response = await apiClient.get(`/user-management/states?page=${page}&limit=${limit}`);
            return response;
        } catch (error) {
            console.error('Error fetching states list:', error);
            throw error;
        }
    },

    // Get cities list
    getCitiesList: async (page = 1, limit = 20) => {
        try {
            const response = await apiClient.get(`/user-management/cities?page=${page}&limit=${limit}`);
            return response;
        } catch (error) {
            console.error('Error fetching cities list:', error);
            throw error;
        }
    },

    // Get hospitals list with filters
    getHospitalsList: async (typeCode = ['HOSP'], customerGroupId = 4, page = 1, limit = 20, stateIds = [], cityIds = [], excludedStatusIds = [6, 10], categoryCode = ['PRI'], subCategoryCode = ['PCL', 'PIH'], searchText = '') => {
        try {
            const payload = {
                typeCode,
                customerGroupId,
                excludedStatusIds,
                categoryCode,
                subCategoryCode,
                page,
                limit
            };
            
            // Add optional filters if provided
            if (stateIds && stateIds.length > 0) {
                payload.stateIds = stateIds;
            }
            if (cityIds && cityIds.length > 0) {
                payload.cityIds = cityIds;
            }
            if (searchText && searchText.trim().length > 0) {
                payload.searchText = searchText.trim();
            }
            
            const response = await apiClient.post('/user-management/customer/customers-list', payload);
            return response;
        } catch (error) {
            console.error('Error fetching hospitals list:', error);
            throw error;
        }
    },

    // Get hospitals list for HospitalSelector - specific API for hospitals only
    getCustomersListHospitals: async (payload) => {
        try {
            const response = await apiClient.post('/user-management/customer/customers-list', payload);
            return response.data;
        } catch (error) {
            console.error('Error fetching hospitals list:', error);
            throw error;
        }
    },

     getCustomersListMappingHospitals: async (payload) => {
        try {
            const response = await apiClient.post('/user-management/customer/mapping-customer-list', payload);
            return response.data;
        } catch (error) {
            console.error('Error fetching hospitals list:', error);
            throw error;
        }
    },
    // Get doctors list with filters
    getDoctorsList: async (typeCode = ['DOCT'], customerGroupId = 1, page = 1, limit = 20, stateIds = [], cityIds = [], searchText = '') => {
        try {
            const payload = {
                typeCode,
                customerGroupId,
                page,
                limit
            };
            
            // Add optional filters if provided
            if (stateIds && stateIds.length > 0) {
                payload.stateIds = stateIds;
            }
            if (cityIds && cityIds.length > 0) {
                payload.cityIds = cityIds;
            }
            if (searchText && searchText.trim().length > 0) {
                payload.searchText = searchText.trim();
            }
            
            const response = await apiClient.post('/user-management/customer/customers-list', payload);
            return response;
        } catch (error) {
            console.error('Error fetching doctors list:', error);
            throw error;
        }
    },

    // NEW: Get tab counts for all tabs
    getTabCounts: async () => {
        try {
            // Fetch counts for each tab in parallel
            const [allResponse, stagingResponse] = await Promise.all([
                apiClient.post('/user-management/customer/customers-list', { page: 1, limit: 1 }),
                apiClient.post('/user-management/customer/customers-list/staging', { page: 1, limit: 1, statusIds: [5] })
            ]);

            // Extract totals from responses
            const allCount = allResponse.data?.data?.total || 0;
            const stagingCount = stagingResponse.data?.data?.total || 0;

            // Return counts mapped to tab names
            return {
                all: allCount,
                waitingForApproval: stagingCount,
                notOnboarded: stagingCount, // Same as waiting for approval (both use staging endpoint)
                unverified: 0, // Can be fetched separately if needed
                rejected: 0 // Can be fetched separately if needed
            };
            } catch (error) {
                console.error('Error fetching tab counts:', error);
                throw error;
            }
        },

    // Onboard customer (assign customer to distributor)
    onboardCustomer: async (payload, isStaging = false) => {
        try {
            const endpoint = isStaging 
                ? '/user-management/customer/onboard/staging'
                : '/user-management/customer/onboard';
            const response = await apiClient.post(endpoint, payload);
            return response;
        } catch (error) {
            console.error('Error onboarding customer:', error);
            throw error;
        }
    },

    // Get workflow progression for customers
    getWorkflowProgression: async (moduleRecordIds, moduleName = ['NEW_CUSTOMER_ONBOARDING', 'EXISTING_CUSTOMER_ONBOARDING']) => {
        try {
            const payload = {
                moduleRecordIds: Array.isArray(moduleRecordIds) ? moduleRecordIds : [moduleRecordIds],
                moduleName: Array.isArray(moduleName) ? moduleName : [moduleName]
            };
            const response = await apiClient.post('/approval/workflow-instances/batch/approver-progression', payload);
            return response;
        } catch (error) {
            console.error('Error fetching workflow progression:', error);
            throw error;
        }
    }

};