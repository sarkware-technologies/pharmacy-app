import apiClient from './apiClient';

// Get list of distributors with pagination
export const getDistributors = async (page = 1, limit = 10, search = '') => {
    try {
        let endpoint = `/user-management/distributor/list?page=${page}&limit=${limit}`;
        if (search) {
            endpoint += `&search=${search}`;
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