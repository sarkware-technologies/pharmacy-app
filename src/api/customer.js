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
    getCustomersList: async ({
        page = 1,
        limit = 10,
        searchText = '',
        typeCode = '',
        statusCode = '',
        cityIds = [],
        categoryCode = '',
        subCategoryCode = ''
    } = {}) => {
        try {
            // Build request body dynamically
            const requestBody = {
                page,
                limit
            };

            // Add optional filters only if they have values
            if (searchText) requestBody.searchText = searchText;
            if (typeCode) requestBody.typeCode = typeCode;
            if (statusCode) requestBody.statusCode = statusCode;
            if (cityIds && cityIds.length > 0) requestBody.cityIds = cityIds;
            if (categoryCode) requestBody.categoryCode = categoryCode;
            if (subCategoryCode) requestBody.subCategoryCode = subCategoryCode;

            const response = await apiClient.post('/user-management/customer/customers-list', requestBody);
            return response;
        } catch (error) {
            console.error('Error fetching customers list:', error);
            throw error;
        }
    },

    // Get customer details by ID - UPDATED ENDPOINT
    getCustomerDetails: async (customerId) => {
        try {
            const response = await apiClient.get(`/user-management/customer/customer-by-id/${customerId}`);
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
                ? `/user-management/location/cities?stateId=${stateId}`
                : '/user-management/location/cities';
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
            const response = await apiClient.get('/user-management/location/states');
            return response;
        } catch (error) {
            console.error('Error fetching states:', error);
            throw error;
        }
    },

    // Get customer groups (if needed)
    getCustomerGroups: async () => {
        try {
            const response = await apiClient.get('/user-management/customer/groups');
            return response;
        } catch (error) {
            console.error('Error fetching customer groups:', error);
            throw error;
        }
    },

    // Get signed URL for document download/view
    getDocumentSignedUrl: async (s3Path) => {
        try {
            const response = await apiClient.get('/user-management/customer/download-doc?s3Path='+ s3Path);
            return response;
        } catch (error) {
            console.error('Error fetching document signed URL:', error);
            throw error;
        }
    }
};