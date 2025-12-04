// Mock data and API functions for Orders

import apiClient, { BASE_URL } from './apiClient';


// API functions (will be replaced with actual API calls)
export const getOrders = async ({ page = 1, limit = 10, search = '', status = 'All' } = {}) => {
  try {
    const data = {
      pageNo: page,
      limit
    };
    if (search) {
      data.searchText = search;
    }
    if (status && status !== "All") {
      switch (status) {
        case "Waiting for Confirmation":
          data.status = "PENDING APPROVAL";
          break;
        case "Hold":
          data.status = "HOLD";
          break;
        case "Track PO":
          data.status = "TRACKPO";
          break;
        default:
          break;
      }
    }

    const response = await apiClient.get('/orders/order/order-list', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const getDistributors = async (customerId) => {
  try {

    const response = await apiClient.get(`/user-management/customer/linked-distributor-division/${customerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Product APIs
export const getProducts = async ({ page = 1, limit = 20, search = '', customerIds, distributorIds }) => {
  try {
    const data = {
      pageNo: page,
      pageSize: limit
    };

    if (search) {
      data.search = search;
    }
    if (customerIds) {
      data.customerIds = customerIds;
    }
    if (distributorIds) {
      data.distributorIds = distributorIds;
    }

    const response = await apiClient.post('/rate-contract/rc/products-by-distributor-and-customer', data);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};



export const IncreaseQTY = async (id, productId, qty) => {
  try {
    const response = await apiClient.put(`/orders/cart/product-qty`, { id, productId, qty });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}



export const AddtoCart = async (cartItem) => {
  try {
    const cartProducts = cartItem;
    const response = await apiClient.post(`/orders/cart/add/product`, { cartProducts });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

export const DeleteCart = async (cartId) => {
  try {
    const response = await apiClient.delete(`/orders/cart/product`, { cartIds: cartId, isAll: true });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}


export const getCartDetails = async (cartId) => {
  try {
    const response = await apiClient.get(`/orders/cart/products`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

export const PlaceOrder = async (order) => {
  try {
    const response = await apiClient.post('/orders/order/create', order);
    return response;
  } catch (error) {
    console.error('Error placing order:', error);
    throw error;
  }
};


export const UploadTemplateOrder = async (orginal, template, customerId, distributorId, orderType, isOCR) => {
  try {
    const formData = new FormData();
    if (orginal) {
      formData.append('orderFile', {
        uri: Platform.OS === 'ios' ? orginal.uri.replace('file://', '') : orginal.uri,
        type: orginal.type || 'application/octet-stream',
        name: orginal.name || 'upload.xlsx',
      });
    }
    if (template) {
      formData.append('templateFile', {
        uri: Platform.OS === 'ios' ? template.uri.replace('file://', '') : template.uri,
        type: template.type || 'application/octet-stream',
        name: template.name || 'upload.xlsx',
      });

    }
    formData.append('customerId', String(customerId));
    formData.append('distributorId', String(distributorId));
    formData.append('orderType', String(orderType));
    formData.append('isOcr', isOCR ? 'true' : 'false');

    const response = await apiClient.post('/orders/upload-order', formData, true);
    return response.data;
  } catch (error) {
    console.error('🔥 CATCH ERROR:', error);
    throw error;
  }
};

export const UploadProductMapping = async (payload) => {
  try {
    const response = await apiClient.put(`/orders/upload-order/map-product`, payload);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}




export const OrderDetails = async (orderId) => {
  try {
    const response = await apiClient.get(`/orders/order/order-details/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}




export const DownloadTemplate = async () => {
  try {
    const response = await apiClient.get(`/orders/upload-order/template`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}


export const OrderAction = async (workflowInstance, body) => {
  try {
    const response = await apiClient.post(`/approval/workflow-actions/${workflowInstance}`, body);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}



