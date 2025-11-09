import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  claims: [],
  pendingClaims: [],
  missedClaims: [],
  reassignedClaims: [],
  selectedClaim: null,
  selectedOrders: [],
  uploadedDocuments: {},
  filters: {
    search: '',
    dateRange: { start: null, end: null },
    status: 'all',
    spilType: 'SPIL', // SPIL or SPLL
    overdueStatus: 'Overdue', // Overdue or Due
  },
  loading: false,
  error: null,
};

const chargebackSlice = createSlice({
  name: 'chargeback',
  initialState,
  reducers: {
    setClaims: (state, action) => {
      state.claims = action.payload;
    },
    setPendingClaims: (state, action) => {
      state.pendingClaims = action.payload;
    },
    setMissedClaims: (state, action) => {
      state.missedClaims = action.payload;
    },
    setReassignedClaims: (state, action) => {
      state.reassignedClaims = action.payload;
    },
    setSelectedClaim: (state, action) => {
      state.selectedClaim = action.payload;
    },
    setSelectedOrders: (state, action) => {
      state.selectedOrders = action.payload;
    },
    toggleOrderSelection: (state, action) => {
      const orderId = action.payload;
      const index = state.selectedOrders.findIndex(id => id === orderId);
      if (index > -1) {
        state.selectedOrders.splice(index, 1);
      } else {
        state.selectedOrders.push(orderId);
      }
    },
    setUploadedDocument: (state, action) => {
      const { orderId, document } = action.payload;
      state.uploadedDocuments[orderId] = document;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    resetChargebackState: () => initialState,
  },
});

export const {
  setClaims,
  setPendingClaims,
  setMissedClaims,
  setReassignedClaims,
  setSelectedClaim,
  setSelectedOrders,
  toggleOrderSelection,
  setUploadedDocument,
  setFilters,
  setLoading,
  setError,
  resetChargebackState,
} = chargebackSlice.actions;

export default chargebackSlice.reducer;