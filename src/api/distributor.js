import apiClient from './apiClient';

// Get list of distributors with pagination
export const getDistributors = async (page = 1, limit = 10, search = '', stationCode = '', divisionIds = []) => {
    try {
        let endpoint = `/user-management/distributor/list?page=${page}&limit=${limit}`;
        if (search) {
            endpoint += `&search=${search}`;
        }
        if (stationCode) {
            endpoint += `&stationCode=${stationCode}`;
        }

        if (divisionIds && divisionIds.length > 0) {
            divisionIds.forEach(divId => {
                endpoint += `&divisionIds=${divId}`;
            });
        }


        const response = await apiClient.get(endpoint);

        // Return the data in a consistent format
        return {
            distributors: response.data.distributors || [],
            page: response.data.page || page,
            limit: response.data.limit || limit,
            total: response.data.total || 0
        };
    } catch (error) {
        console.error('Error fetching distributors:', error);
        throw error;
    }
};

// Get customers list for specific distributor(s)
export const getDistributorCustomers = async (distributorIds, page = 1, limit = 10) => {
    try {
        const response = await apiClient.post('/user-management/customer/customers-list', {
            distributorIds: Array.isArray(distributorIds) ? distributorIds : [distributorIds],
            page,
            limit
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching distributor customers:', error);
        throw error;
    }
};

// Update distributor status
export const updateDistributorStatus = async (distributorId, status) => {
    try {
        const response = await apiClient.put(`/user-management/distributor/${distributorId}/status`, {
            status
        });
        return response.data;
    } catch (error) {
        console.error('Error updating distributor status:', error);
        throw error;
    }
};

// Invite distributor
export const inviteDistributor = async (distributorId) => {
    try {
        const response = await apiClient.post(`/user-management/distributor/${distributorId}/invite`, {});
        return response.data;
    } catch (error) {
        console.error('Error inviting distributor:', error);
        throw error;
    }
};

// Block/Unblock customer for distributor
export const updateCustomerStatus = async (customerId, distributorId, action) => {
    try {
        const response = await apiClient.put(`/user-management/customer/${customerId}/status`, {
            distributorId,
            action // 'block' or 'unblock'
        });
        return response.data;
    } catch (error) {
        console.error('Error updating customer status:', error);
        throw error;
    }
};

// Get preferred distributors list with division filters
export const getPreferredDistributors = async ({ page = 1, limit = 20, stationCode, divisionIds = [], stateIds = [], cityIds = [], search = "", type = '' }) => {
    try {
        let endpoint = `/user-management/distributor/list?page=${page}&limit=${limit}`;
        if (search) {
            endpoint += `&search=${search}`;
        }
        if (type) {
            endpoint += `&type=${type}`;
        }
        if (stationCode) {
            endpoint += `&stationCode=${stationCode}`;
        }

        // Add divisionIds as multiple query parameters
        // Each divisionId should be added as a separate query parameter: &divisionIds=143&divisionIds=183
        if (Array.isArray(divisionIds) && divisionIds.length > 0) {
            divisionIds.forEach(divisionId => {
                // Ensure divisionId is a valid string/number and not empty
                const id = String(divisionId).trim();
                if (id && id !== 'undefined' && id !== 'null') {
                    endpoint += `&divisionIds=${encodeURIComponent(id)}`;
                }
            });
        }
        if (Array.isArray(stateIds) && stateIds.length > 0) {
            stateIds.forEach(state => {
                // Ensure divisionId is a valid string/number and not empty
                const id = String(state).trim();
                if (id && id !== 'undefined' && id !== 'null') {
                    endpoint += `&stateIds=${encodeURIComponent(id)}`;
                }
            });
        }
        if (Array.isArray(cityIds) && cityIds.length > 0) {
            cityIds.forEach(city => {
                // Ensure divisionId is a valid string/number and not empty
                const id = String(city).trim();
                if (id && id !== 'undefined' && id !== 'null') {
                    endpoint += `&cityIds=${encodeURIComponent(id)}`;
                }
            });
        }

        const response = await apiClient.get(endpoint);

        // Return the data in a consistent format
        // API response structure: { success: true, data: { distributors: [], page: 1, limit: 20, total: 38 } }
        return {
            distributors: response.data?.data?.distributors || response.data?.distributors || [],
            page: response.data?.data?.page || response.data?.page || page,
            limit: response.data?.data?.limit || response.data?.limit || limit,
            total: response.data?.data?.total || response.data?.total || 0
        };
    } catch (error) {
        console.error('Error fetching preferred distributors:', error);
        throw error;
    }
};


export const getDistributorType = async (page = 1, limit = 100) => {
    try {
        const response = await apiClient.get(`/user-management/distributor/default-margin?page=${page}&limit=${limit}`);
        return response;
    } catch (error) {
        console.error('Error fetching distributors:', error);
        throw error;
    }
}

