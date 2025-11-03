import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import customerReducer from './slices/customerSlice';
import orderReducer from './slices/orderSlice';
import distributorReducer from './slices/distributorSlice';
import divisionReducer from './slices/divisionSlice';
import productReducer from './slices/productSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customer: customerReducer,
    orders: orderReducer,
    distributor: distributorReducer,
    division: divisionReducer,
    product: productReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    })
});