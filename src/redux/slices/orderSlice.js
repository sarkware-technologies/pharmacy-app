import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orders: [],
  cart: [],
  selectedDistributor: null,
  loading: false,
  error: null
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action) => {
      state.orders = action.payload;
    },
    setSelectedDistributor: (state, action) => {
      state.selectedDistributor = action.payload;
    },
    setCartDetails: (state, action) => {
      state.cart = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});


export const {
  setOrders,
  setSelectedDistributor,
  setCartDetails,
  setLoading,
  setError
} = orderSlice.actions;

export default orderSlice.reducer;