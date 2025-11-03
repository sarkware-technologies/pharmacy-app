import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    products: [],
    selectedProduct: null,
    loading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 20,
        total: 0
    },
    filters: {
        search: '',
        division: null,
        status: null
    },
    selectedProducts: [], // For bulk operations
    bulkEditMode: false
};

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        setProducts: (state, action) => {
            state.products = action.payload;
        },
        addProducts: (state, action) => {
            // For pagination - add more products to existing list
            state.products = [...state.products, ...action.payload];
        },
        setSelectedProduct: (state, action) => {
            state.selectedProduct = action.payload;
        },
        updateProduct: (state, action) => {
            const index = state.products.findIndex(p => p.productId === action.payload.productId);
            if (index !== -1) {
                state.products[index] = action.payload;
            }
            if (state.selectedProduct?.productId === action.payload.productId) {
                state.selectedProduct = action.payload;
            }
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setPagination: (state, action) => {
            state.pagination = { ...state.pagination, ...action.payload };
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        toggleProductSelection: (state, action) => {
            const productId = action.payload;
            const index = state.selectedProducts.indexOf(productId);
            if (index > -1) {
                state.selectedProducts.splice(index, 1);
            } else {
                state.selectedProducts.push(productId);
            }
        },
        selectAllProducts: (state) => {
            state.selectedProducts = state.products.map(p => p.productId);
        },
        deselectAllProducts: (state) => {
            state.selectedProducts = [];
        },
        setBulkEditMode: (state, action) => {
            state.bulkEditMode = action.payload;
            if (!action.payload) {
                state.selectedProducts = [];
            }
        },
        clearProductState: (state) => {
            return initialState;
        }
    }
});

export const {
    setProducts,
    addProducts,
    setSelectedProduct,
    updateProduct,
    setLoading,
    setError,
    setPagination,
    setFilters,
    toggleProductSelection,
    selectAllProducts,
    deselectAllProducts,
    setBulkEditMode,
    clearProductState
} = productSlice.actions;

export default productSlice.reducer;