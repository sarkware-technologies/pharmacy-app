import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  divisions: [],
  selectedDivision: null,
  divisionProducts: [],
  divisionDistributors: [],
  divisionCustomers: [],
  divisionFieldEmployees: [],
  loading: false,
  productsLoading: false,
  distributorsLoading: false,
  customersLoading: false,
  fieldsLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0
  },
  productsPagination: {
    page: 1,
    limit: 10,
    total: 0
  },
  customersPagination: {
    page: 1,
    limit: 10,
    total: 0
  },
  filters: {
    search: '',
    status: null
  },
  activeTab: 'Details' // 'Details' or 'Linkaged'
};

const divisionSlice = createSlice({
  name: 'division',
  initialState,
  reducers: {
    setDivisions: (state, action) => {
      state.divisions = action.payload;
    },
    setSelectedDivision: (state, action) => {
      state.selectedDivision = action.payload;
    },
    setDivisionProducts: (state, action) => {
      state.divisionProducts = action.payload;
    },
    setDivisionDistributors: (state, action) => {
      state.divisionDistributors = action.payload;
    },
    setDivisionCustomers: (state, action) => {
      state.divisionCustomers = action.payload;
    },
    setDivisionFieldEmployees: (state, action) => {
      state.divisionFieldEmployees = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setProductsLoading: (state, action) => {
      state.productsLoading = action.payload;
    },
    setDistributorsLoading: (state, action) => {
      state.distributorsLoading = action.payload;
    },
    setCustomersLoading: (state, action) => {
      state.customersLoading = action.payload;
    },
    setFieldsLoading: (state, action) => {
      state.fieldsLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setProductsPagination: (state, action) => {
      state.productsPagination = { ...state.productsPagination, ...action.payload };
    },
    setCustomersPagination: (state, action) => {
      state.customersPagination = { ...state.customersPagination, ...action.payload };
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    clearDivisionData: (state) => {
      state.divisionProducts = [];
      state.divisionDistributors = [];
      state.divisionCustomers = [];
      state.divisionFieldEmployees = [];
      state.productsPagination = initialState.productsPagination;
      state.customersPagination = initialState.customersPagination;
    },
    resetDivisionState: () => initialState
  }
});

export const {
  setDivisions,
  setSelectedDivision,
  setDivisionProducts,
  setDivisionDistributors,
  setDivisionCustomers,
  setDivisionFieldEmployees,
  setLoading,
  setProductsLoading,
  setDistributorsLoading,
  setCustomersLoading,
  setFieldsLoading,
  setError,
  setPagination,
  setProductsPagination,
  setCustomersPagination,
  setFilters,
  setActiveTab,
  clearDivisionData,
  resetDivisionState
} = divisionSlice.actions;

export default divisionSlice.reducer;