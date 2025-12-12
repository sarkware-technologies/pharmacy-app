import apiClient from './apiClient';

// Product APIs
export const getProducts = async (page = 1, limit = 20, search = '', divisions, isExcludeCFA = false) => {
    try {
        const data = {
            page,
            limit,
            isExcludeCFA
        };

        if (search) {
            data.search = search;
        }
        if (divisions) {
            data.divisionIds = divisions;
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

export const getProductsByDistributorAndCustomer = async (
    pageNo = 1,
    pageSize = 10,
    search = "",
    customerIds = [],
    distributorIds = []
) => {
    try {
        const payload = {
            pageNo,
            pageSize,
        };

        if (customerIds?.length > 0) payload.customerIds = customerIds;
        if (distributorIds?.length > 0) payload.distributorIds = distributorIds;

        const trimmedSearch = search?.trim();
        if (trimmedSearch) payload.search = trimmedSearch;

        const response = await apiClient.post(
            "/rate-contract/rc/products-by-distributor-and-customer",
            payload
        );

        return response.data;
    } catch (error) {
        console.error(
            "Error fetching products by distributor and customer:",
            error
        );
        throw error;
    }
};


export const updateProductMargin = async (productMargin) => {
    try {
        const response = await apiClient.patch(
            '/catalog/products/margin',
            {
                productMargin
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating product margin:', error);
        throw error;
    }
};