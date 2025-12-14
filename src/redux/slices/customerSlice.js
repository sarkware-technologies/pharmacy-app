import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { customerAPI } from '../../api/customer';

// Async thunks
export const fetchCustomerTypes = createAsyncThunk(
  'customer/fetchTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await customerAPI.getCustomerTypes();           
      return response.data;
    } catch (error) {      
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCustomerStatuses = createAsyncThunk(
  'customer/fetchStatuses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await customerAPI.getCustomerStatuses();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCustomersList = createAsyncThunk(
  'customer/fetchList',
  async (params = {}, { rejectWithValue }) => {
    try {
      // Pass isStaging flag to the API
      const response = await customerAPI.getCustomersList({
        ...params,
        isStaging: params.isStaging || false // Add isStaging support
      });
      return {
        data: response.data,
        isLoadMore: params.isLoadMore || false
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch tab counts from API - Single API call
export const fetchTabCounts = createAsyncThunk(
  'customer/fetchTabCounts',
  async (_, { rejectWithValue }) => {
    try {
      const { customerAPI } = require('../../api/customer');
      
      const response = await customerAPI.getTabCounts();
      
      // API response structure: { success, statusCode, message, data: { allCount, ... } }
      // apiClient.get() returns axios response, so response.data is the API response body
      // response.data = { success, statusCode, message, data: { allCount, ... } }
      // response.data.data = { allCount, waitingForApprovalCount, ... }
      const countsData = response?.data || {};

      console.log('🔍 Tab counts data:', countsData);
      
      // Map API response fields to our tab count structure
      const counts = {
        all: countsData.allCount || 0,
        waitingForApproval: countsData.waitingForApprovalCount || 0,
        notOnboarded: countsData.notOnBoardCount || 0, // Note: API uses notOnBoardCount
        unverified: countsData.unverifiedCount || 0,
        rejected: countsData.rejectedCount || 0,
        doctorSupply: countsData.doctorSupplyCount || 0,
        draft: countsData.draftCount || 0
      };

      console.log('✅ TAB COUNTS FETCHED from API:', counts);
      
      return counts;
    } catch (error) {
      console.error('❌ Error fetching tab counts:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCustomerDetails = createAsyncThunk(
  'customer/fetchDetails',
  async (params, { rejectWithValue }) => {
    try {
      // Support both old format (string) and new format (object with customerId and isStaging)
      const customerId = typeof params === 'string' ? params : params?.customerId;
      const isStaging = typeof params === 'object' ? params?.isStaging || false : false;
      
      console.log('fetchCustomerDetails called with:', { customerId, isStaging });
      const response = await customerAPI.getCustomerDetails(customerId, isStaging);
      console.log('fetchCustomerDetails response:', response);
      return response.data;
    } catch (error) {
      console.error('fetchCustomerDetails error:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createCustomer = createAsyncThunk(
  'customer/create',
  async (customerData, { rejectWithValue }) => {
    try {
      const response = await customerAPI.createCustomer(customerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'customer/update',
  async ({ customerId, customerData }, { rejectWithValue }) => {
    try {
      const response = await customerAPI.updateCustomer(customerId, customerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  'customer/delete',
  async (customerId, { rejectWithValue }) => {
    try {
      await customerAPI.deleteCustomer(customerId);
      return { customerId };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCities = createAsyncThunk(
  'customer/fetchCities',
  async (stateId, { rejectWithValue }) => {
    try {
      const response = await customerAPI.getCities(stateId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchStates = createAsyncThunk(
  'customer/fetchStates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await customerAPI.getStates();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  // Lists
  customers: [],
  customerTypes: [],
  customerStatuses: [],
  cities: [],
  states: [],
  
  // Navigation flags
  shouldResetToAllTab: false,
  
  // Pagination
  currentPage: 1,
  totalPages: 1,
  totalCustomers: 0,
  limit: 10,
  hasMore: true, // NEW: Track if more pages available
  tabCounts: {
    all: 0,
    waitingForApproval: 0,
    notOnboarded: 0,
    unverified: 0,
    rejected: 0,
    doctorSupply: 0,
    draft: 0
  },
  
  // Filters
  filters: {
    searchText: '',
    typeCode: '',
    statusId: [],
    cityIds: [],
    categoryCode: '',
    subCategoryCode: ''
  },
  
  // Selected customer
  selectedCustomer: null,
  currentCustomerId: null, // NEW: Store current customer ID for LinkagedTab
  
  // Loading states
  listLoading: false,
  listLoadingMore: false, // NEW: Loading state for infinite scroll
  detailsLoading: false,
  typesLoading: false,
  statusesLoading: false,
  citiesLoading: false,
  statesLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  
  // Error states
  listError: null,
  detailsError: null,
  typesError: null,
  statusesError: null,
  citiesError: null,
  statesError: null,
  createError: null,
  updateError: null,
  deleteError: null,
  
  // Success flags
  createSuccess: false,
  updateSuccess: false,
  deleteSuccess: false
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1; // Reset to first page when filters change
      state.customers = []; // Clear existing customers when filters change
      state.hasMore = true; // Reset hasMore flag
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.currentPage = 1;
      state.customers = []; // Clear existing customers
      state.hasMore = true;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    incrementPage: (state) => {
      state.currentPage = state.currentPage + 1;
    },
    setLimit: (state, action) => {
      state.limit = action.payload;
      state.currentPage = 1; // Reset to first page when limit changes
      state.customers = []; // Clear existing customers
      state.hasMore = true;
    },
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null;
      state.currentCustomerId = null; // NEW: Clear current customer ID
      state.detailsError = null;
    },
    setCurrentCustomerId: (state, action) => {
      state.currentCustomerId = action.payload;
    },
    clearErrors: (state) => {
      state.listError = null;
      state.detailsError = null;
      state.typesError = null;
      state.statusesError = null;
      state.citiesError = null;
      state.statesError = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },
    clearSuccessFlags: (state) => {
      state.createSuccess = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
    },
    resetCustomersList: (state) => {
      state.customers = [];
      state.currentPage = 1;
      state.hasMore = true;
      state.listError = null;
      state.listLoadingMore = false;
      state.listLoading = false;
    },
    setShouldResetToAllTab: (state, action) => {
      state.shouldResetToAllTab = action.payload;
    },
    clearShouldResetToAllTab: (state) => {
      state.shouldResetToAllTab = false;
    },
    setTabCounts: (state, action) => {
      state.tabCounts = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Fetch Customer Types
    builder
      .addCase(fetchCustomerTypes.pending, (state) => {
        state.typesLoading = true;
        state.typesError = null;
      })
      .addCase(fetchCustomerTypes.fulfilled, (state, action) => {        
        state.typesLoading = false;
        state.typesError = null;
        state.customerTypes = action.payload.customerType || [];        
      })
      .addCase(fetchCustomerTypes.rejected, (state, action) => {
        state.typesLoading = false;
        state.typesError = action.payload?.message || action.error.message;
      });

    // Fetch Customer Statuses
    builder
      .addCase(fetchCustomerStatuses.pending, (state) => {
        state.statusesLoading = true;
        state.statusesError = null;
      })
      .addCase(fetchCustomerStatuses.fulfilled, (state, action) => {
        state.statusesLoading = false;
        state.customerStatuses = action.payload || [];
      })
      .addCase(fetchCustomerStatuses.rejected, (state, action) => {
        state.statusesLoading = false;
        state.statusesError = action.payload?.message || action.error.message;
      });

    // Fetch Customers List - UPDATED FOR INFINITE SCROLL
    builder
      .addCase(fetchCustomersList.pending, (state, action) => {
        const isLoadMore = action.meta.arg?.isLoadMore || false;
        if (isLoadMore) {
          state.listLoadingMore = true;
        } else {
          state.listLoading = true;
        }
        state.listError = null;
      })
      .addCase(fetchCustomersList.fulfilled, (state, action) => {
        const { data, isLoadMore } = action.payload;
        
        if (isLoadMore) {
          state.listLoadingMore = false;
        } else {
          state.listLoading = false;
        }
        
        const newCustomers = data.customers || [];
        
        if (isLoadMore) {
          // Append to existing customers for infinite scroll
          // Check for both customerId and stgCustomerId to handle staging customers
          const existingIds = new Set(state.customers.map(c => c.customerId || c.stgCustomerId));
          const uniqueNewCustomers = newCustomers.filter(c => !existingIds.has(c.customerId || c.stgCustomerId));
          state.customers = [...state.customers, ...uniqueNewCustomers];
        } else {
          // Replace customers for fresh fetch
          state.customers = newCustomers;
        }
        
        state.totalCustomers = data.total || 0;
        state.totalPages = Math.ceil(state.totalCustomers / state.limit);
        
        // Update currentPage for load more - increment after successful fetch
        if (isLoadMore) {
          state.currentPage = state.currentPage + 1;
        }
        
        // Check if there are more pages to load
        // hasMore is true if: we got a full page AND there are more records beyond what we've loaded
        const totalLoadedSoFar = state.customers.length;
        state.hasMore = newCustomers.length === state.limit && totalLoadedSoFar < state.totalCustomers;
        
        // Don't reset tabCounts here - they are fetched separately via fetchTabCounts
        // Keep existing tabCounts if they exist
      })
      .addCase(fetchCustomersList.rejected, (state, action) => {
        state.listLoading = false;
        state.listLoadingMore = false;
        state.listError = action.payload?.message || action.error.message;
        // Don't clear customers on error for load more
        if (!action.meta.arg?.isLoadMore) {
          state.customers = [];
        }
      });

    // Fetch Customer Details
    builder
      .addCase(fetchCustomerDetails.pending, (state) => {
        state.detailsLoading = true;
        state.detailsError = null;
      })
      .addCase(fetchCustomerDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedCustomer = action.payload;
      })
      .addCase(fetchCustomerDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.detailsError = action.payload?.message || action.error.message;
      });

    // Create Customer
    builder
      .addCase(createCustomer.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        state.createSuccess = false;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createSuccess = true;
        // Add the new customer to the list
        state.customers.unshift(action.payload);
        state.totalCustomers += 1;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload?.message || action.error.message;
      });

    // Update Customer
    builder
      .addCase(updateCustomer.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = true;
        // Update the customer in the list
        const index = state.customers.findIndex(c => c.customerId === action.payload.customerId);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        // Update selected customer if it's the same
        if (state.selectedCustomer?.customerId === action.payload.customerId) {
          state.selectedCustomer = action.payload;
        }
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload?.message || action.error.message;
      });

    // Delete Customer
    builder
      .addCase(deleteCustomer.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
        state.deleteSuccess = false;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteSuccess = true;
        // Remove the customer from the list
        state.customers = state.customers.filter(c => c.customerId !== action.payload.customerId);
        state.totalCustomers -= 1;
        // Clear selected customer if it was deleted
        if (state.selectedCustomer?.customerId === action.payload.customerId) {
          state.selectedCustomer = null;
        }
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload?.message || action.error.message;
      });

    // Fetch Cities
    builder
      .addCase(fetchCities.pending, (state) => {
        state.citiesLoading = true;
        state.citiesError = null;
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.citiesLoading = false;
        state.cities = action.payload || [];
      })
      .addCase(fetchCities.rejected, (state, action) => {
        state.citiesLoading = false;
        state.citiesError = action.payload?.message || action.error.message;
      });

    // Fetch States
    builder
      .addCase(fetchStates.pending, (state) => {
        state.statesLoading = true;
        state.statesError = null;
      })
      .addCase(fetchStates.fulfilled, (state, action) => {
        state.statesLoading = false;
        state.states = action.payload || [];
      })
      .addCase(fetchStates.rejected, (state, action) => {
        state.statesLoading = false;
        state.statesError = action.payload?.message || action.error.message;
      });

    // Fetch Tab Counts
    builder
      .addCase(fetchTabCounts.pending, (state) => {
        console.log('Fetching tab counts...');
      })
      .addCase(fetchTabCounts.fulfilled, (state, action) => {
        console.log('Tab counts fulfilled:', action.payload);
        state.tabCounts = action.payload || initialState.tabCounts;
      })
      .addCase(fetchTabCounts.rejected, (state, action) => {
        console.error('Tab counts rejected:', action.payload);
        // Keep existing tab counts on error
      });
  }
});

export const {
  setFilters,
  clearFilters,
  setCurrentPage,
  incrementPage,
  setLimit,
  clearSelectedCustomer,
  setCurrentCustomerId,
  clearErrors,
  clearSuccessFlags,
  resetCustomersList,
  setShouldResetToAllTab,
  clearShouldResetToAllTab,
  setTabCounts
} = customerSlice.actions;

// Selectors
export const selectCustomers = (state) => state.customer.customers;
export const selectCustomerTypes = (state) => state.customer.customerTypes;
export const selectCustomerStatuses = (state) => state.customer.customerStatuses;
export const selectFilters = (state) => state.customer.filters;
export const selectCurrentCustomerId = (state) => state.customer.currentCustomerId;
export const selectTabCounts = (state) => state.customer.tabCounts; 

export const selectPagination = (state) => ({
  currentPage: state.customer.currentPage,
  totalPages: state.customer.totalPages,
  totalCustomers: state.customer.totalCustomers,
  limit: state.customer.limit,
  hasMore: state.customer.hasMore
});
export const selectLoadingStates = (state) => ({
  listLoading: state.customer.listLoading,
  listLoadingMore: state.customer.listLoadingMore,
  detailsLoading: state.customer.detailsLoading,
  typesLoading: state.customer.typesLoading,
  statusesLoading: state.customer.statusesLoading
});

export default customerSlice.reducer;