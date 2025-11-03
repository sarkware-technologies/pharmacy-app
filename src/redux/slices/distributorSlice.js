import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    distributors: [],
    selectedDistributor: null,
    customers: [],
    loading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 20,  // Updated default limit to 20 for better infinite scrolling
        total: 0,
        totalPages: 0
    },
    filters: {
        search: '',
        status: 'all'
    }
};

const distributorSlice = createSlice({
    name: 'distributor',
    initialState,
    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setDistributors: (state, action) => {
            state.distributors = action.payload;
        },
        setSelectedDistributor: (state, action) => {
            state.selectedDistributor = action.payload;
        },
        setCustomers: (state, action) => {
            state.customers = action.payload;
        },
        updateDistributorInList: (state, action) => {
            const index = state.distributors.findIndex(d => d.id === action.payload.id);
            if (index !== -1) {
                state.distributors[index] = { ...state.distributors[index], ...action.payload };
            }
        },
        updateCustomerInList: (state, action) => {
            const index = state.customers.findIndex(c => c.customerId === action.payload.customerId);
            if (index !== -1) {
                state.customers[index] = { ...state.customers[index], ...action.payload };
            }
        },
        setPagination: (state, action) => {
            state.pagination = { 
                ...state.pagination, 
                ...action.payload,
                // Calculate total pages when total is updated
                totalPages: action.payload.total 
                    ? Math.ceil(action.payload.total / (action.payload.limit || state.pagination.limit))
                    : state.pagination.totalPages
            };
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        resetDistributorState: () => initialState
    }
});

export const {
    setLoading,
    setDistributors,
    setSelectedDistributor,
    setCustomers,
    updateDistributorInList,
    updateCustomerInList,
    setPagination,
    setFilters,
    setError,
    clearError,
    resetDistributorState
} = distributorSlice.actions;

export default distributorSlice.reducer;