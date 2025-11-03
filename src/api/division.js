import apiClient from './apiClient';

// Get divisions list with pagination
export const getDivisions = async (page = 1, limit = 10, search = '') => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search) {
      params.append('search', search);
    }
    
    const response = await apiClient.get(
      `/user-management/divisions/list?${params.toString()}`
    );
    
    console.log("response ", response.data);

    if (response.success) {
      return response.data;
    }
    throw new Error(response.data.message || 'Failed to fetch divisions');
  } catch (error) {
    console.error('Error fetching divisions:', error);
    throw error;
  }
};

// Get division products (Details tab)
export const getDivisionProducts = async (divisionId, page = 1, limit = 10) => {
  try {
    const response = await apiClient.post('/catalog/products/search', {
      page,
      limit,
      divisionIds: divisionId.toString()
    });
    
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch division products');
  } catch (error) {
    console.error('Error fetching division products:', error);
    throw error;
  }
};

// Get distributors by division (Linkaged - Distributors tab)
// This connects with the existing distributor API
export const getDistributorsByDivision = async (divisionId) => {
  try {
    const response = await apiClient.get(
      `/user-management/distributor/by-division?divisionId=${divisionId}`
    );
    
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch distributors');
  } catch (error) {
    console.error('Error fetching distributors by division:', error);
    throw error;
  }
};

// Get customers by division (Linkaged - Customers tab)
export const getCustomersByDivision = async (divisionIds, page = 1, limit = 10) => {
  try {
    const response = await apiClient.post('/user-management/customer/customers-list', {
      divisionIds: Array.isArray(divisionIds) ? divisionIds : [divisionIds],
      page,
      limit
    });
    
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch customers');
  } catch (error) {
    console.error('Error fetching customers by division:', error);
    throw error;
  }
};

// Get field employees (static data for now)
export const getFieldEmployees = async (divisionId) => {
  // Static data as requested
  return [
    { id: 1, name: 'Abhishek Suryawanshi', code: 'SUN12345', designation: 'Customer executive' },
    { id: 2, name: 'Akshay Pawar', code: 'SUN12345', designation: 'NSM' },
    { id: 3, name: 'Sachin Patil', code: 'SUN12345', designation: 'Field officer' },
    { id: 4, name: 'Rushikesh Mahajan', code: 'SUN12345', designation: 'ZSM' },
    { id: 5, name: 'Akshay Amanakar', code: 'SUN12345', designation: 'ASM' },
    { id: 6, name: 'Omkar Ankam', code: 'SUN12345', designation: 'Filed officer' },
    { id: 7, name: 'Vrushal Shinde', code: 'SUN12345', designation: 'Customer executive' },
  ];
};

// Update division margins (for group update)
export const updateDivisionMargins = async (divisionIds, doctorMargin, hospitalMargin) => {
  try {
    const response = await apiClient.put('/user-management/divisions/update-margins', {
      divisionIds,
      doctorMargin,
      hospitalMargin
    });
    
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update margins');
  } catch (error) {
    console.error('Error updating division margins:', error);
    throw error;
  }
};

// Update division status (for group update)
export const updateDivisionStatus = async (divisionIds, isActive) => {
  try {
    const response = await apiClient.put('/user-management/divisions/update-status', {
      divisionIds,
      isActive
    });
    
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update status');
  } catch (error) {
    console.error('Error updating division status:', error);
    throw error;
  }
};

// Update header division (for group update)
export const updateHeaderDivision = async (divisionIds, headerDivisionCode) => {
  try {
    const response = await apiClient.put('/user-management/divisions/update-header', {
      divisionIds,
      headerDivisionCode
    });
    
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update header division');
  } catch (error) {
    console.error('Error updating header division:', error);
    throw error;
  }
};