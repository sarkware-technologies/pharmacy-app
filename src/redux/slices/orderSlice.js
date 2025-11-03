import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orders: [],
  currentOrder: null,
  cart: [],
  selectedDistributor: null,
  orderSummary: {
    skuCount: 0,
    totalOrderValue: 0,
    discount: 0,
    grossOrderValue: 0,
    tax: 0,
    netOrderValue: 0
  },
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
    addToCart: (state, action) => {
      const existingItem = state.cart.find(item => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity = action.payload.quantity;
      } else {
        state.cart.push(action.payload);
      }
      // Recalculate order summary
      state.orderSummary = calculateOrderSummary(state.cart);
    },
    updateCartItem: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.cart.find(item => item.id === id);
      if (item) {
        item.quantity = quantity;
        item.orderValue = quantity * item.pth;
      }
      state.orderSummary = calculateOrderSummary(state.cart);
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter(item => item.id !== action.payload);
      state.orderSummary = calculateOrderSummary(state.cart);
    },
    clearCart: (state) => {
      state.cart = [];
      state.selectedDistributor = null;
      state.orderSummary = initialState.orderSummary;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

// Helper function to calculate order summary
const calculateOrderSummary = (cart) => {
  const skuCount = cart.length;
  let totalOrderValue = 0;
  let discount = 0;
  let tax = 0;

  cart.forEach(item => {
    const itemTotal = item.quantity * item.pth;
    totalOrderValue += itemTotal;
    discount += (item.discount || 0) * item.quantity;
    // Assuming 10% GST for simplicity - this should come from product data
    tax += itemTotal * 0.1;
  });

  const grossOrderValue = totalOrderValue - discount;
  const netOrderValue = grossOrderValue + tax;

  return {
    skuCount,
    totalOrderValue: totalOrderValue.toFixed(2),
    discount: discount.toFixed(2),
    grossOrderValue: grossOrderValue.toFixed(2),
    tax: tax.toFixed(2),
    netOrderValue: netOrderValue.toFixed(2)
  };
};

export const { 
  setOrders, 
  setSelectedDistributor, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart,
  setLoading,
  setError
} = orderSlice.actions;

export default orderSlice.reducer;