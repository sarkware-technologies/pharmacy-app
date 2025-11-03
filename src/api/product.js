import apiClient from './apiClient';

// Product APIs
export const getProducts = async (page = 1, limit = 20, search = '') => {
    try {
        const data = {
            page,
            limit
        };
        
        if (search) {
            data.search = search;
        }
        
        const response = await apiClient.post('/catalog/products/search', data);
        return response.data;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

export const getProductById = async (productId) => {
    try {
        const response = await apiClient.get(`/catalog/products/${productId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching product details:', error);
        throw error;
    }
};

export const updateProductDiscount = async (productId, doctorDiscount, hospitalDiscount) => {
    try {
        const response = await apiClient.put(`/catalog/products/${productId}/discount`, {
            doctorDiscount,
            hospitalDiscount
        });
        return response.data;
    } catch (error) {
        console.error('Error updating product discount:', error);
        throw error;
    }
};

export const updateProductStatus = async (productId, isActive) => {
    try {
        const response = await apiClient.put(`/catalog/products/${productId}/status`, {
            isActive
        });
        return response.data;
    } catch (error) {
        console.error('Error updating product status:', error);
        throw error;
    }
};

export const bulkUpdateProductDiscounts = async (productIds, doctorDiscount, hospitalDiscount) => {
    try {
        const response = await apiClient.post('/catalog/products/bulk-update-discounts', {
            productIds,
            doctorDiscount,
            hospitalDiscount
        });
        return response.data;
    } catch (error) {
        console.error('Error bulk updating product discounts:', error);
        throw error;
    }
};