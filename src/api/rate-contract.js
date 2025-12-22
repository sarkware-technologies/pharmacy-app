// Mock data and API functions for Orders

import apiClient, { BASE_URL } from './apiClient';

export const getPriceSummary = async (filters = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      searchText,
      statusId,
      fromDate,
      toDate,
      rcStartDate,
      rcEndDate,
      // sortBy = "createdDate",
      sortDirection = "ASC",
      productIds,
      customerIds,
      isExpired,
      isExpiredSoon,
      statusIds,
      supplyModeIds,
      specialPriceTypeIds,
    } = filters;

    // Build raw body
    const body = {
      searchText,
      statusId,
      fromDate,
      toDate,
      pageNo: page,
      pageSize: limit,
      rcStartDate,
      rcEndDate,
      // sortBy,
      sortDirection,
      productIds,
      customerIds,
      isExpired,
      isExpiredSoon,
      statusIds,
      supplyModeIds,
      specialPriceTypeIds,
    };

    // 🔥 Remove null, undefined, empty string, and empty array values
    const cleanedBody = Object.fromEntries(
      Object.entries(body).filter(([key, value]) => {
        if (value === null || value === undefined) return false;
        if (typeof value === "string" && value.trim() === "") return false;
        if (Array.isArray(value) && value.length === 0) return false;
        return true;
      })
    );

    const response = await apiClient.post(
      "/rate-contract/rc/summary",
      cleanedBody
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};



export const getRCStatus = async () => {
  try {
    const response = await apiClient.post(
      "/rate-contract/rc/status/count",
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getRCFilter = async () => {
  try {
    const response = await apiClient.get(
      "/rate-contract/rc/filter",
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};






