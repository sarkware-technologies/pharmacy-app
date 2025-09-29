import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ phoneOrEmail, password }) => {
    const response = await authAPI.login(phoneOrEmail, password);
    // Include the phoneOrEmail in the response for display purposes
    return { ...response, phoneOrEmail };
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ sessionId, otp }) => {
    const response = await authAPI.verifyOTP(sessionId, otp);
    // Store token in AsyncStorage when OTP is verified successfully
    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    return response;
  }
);

export const resendOTP = createAsyncThunk(
  'auth/resendOTP',
  async (sessionId) => {
    const response = await authAPI.resendOTP(sessionId);
    return response;
  }
);

export const requestPasswordReset = createAsyncThunk(
  'auth/requestPasswordReset',
  async (mobileNumber) => {
    const response = await authAPI.requestPasswordReset(mobileNumber);
    return response;
  }
);

export const verifyResetOTP = createAsyncThunk(
  'auth/verifyResetOTP',
  async ({ resetSessionId, otp }) => {
    const response = await authAPI.verifyResetOTP(resetSessionId, otp);
    return response;
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ resetToken, newPassword }) => {
    const response = await authAPI.resetPassword(resetToken, newPassword);
    return response;
  }
);

export const resendResetOTP = createAsyncThunk(
  'auth/resendResetOTP',
  async (resetSessionId) => {
    const response = await authAPI.resendResetOTP(resetSessionId);
    return response;
  }
);

// Check if user is already logged in (on app start)
export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async () => {
    const token = await AsyncStorage.getItem('authToken');
    const userData = await AsyncStorage.getItem('userData');
    
    if (token && userData) {
      return {
        isAuthenticated: true,
        token,
        user: JSON.parse(userData),
      };
    }
    return { isAuthenticated: false };
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
    return {};
  }
);

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  sessionId: null,
  phoneOrEmail: null, // Added to store the login identifier
  resetSessionId: null,
  resetToken: null,
  loading: false,
  error: null,
  otpVerificationLoading: false,
  otpVerificationError: null,
  resetPasswordLoading: false,
  resetPasswordError: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.otpVerificationError = null;
      state.resetPasswordError = null;
    },
    clearSession: (state) => {
      state.sessionId = null;
      state.resetSessionId = null;
      state.resetToken = null;
      state.phoneOrEmail = null; // Clear phone/email when clearing session
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.sessionId = action.payload.data.sessionId;
        state.phoneOrEmail = action.payload.phoneOrEmail; // Store the phone/email
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Verify OTP
    builder
      .addCase(verifyOTP.pending, (state) => {
        state.otpVerificationLoading = true;
        state.otpVerificationError = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.otpVerificationLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.data.token;
        state.user = action.payload.data.user;
        state.sessionId = null; // Clear session after successful verification
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.otpVerificationLoading = false;
        state.otpVerificationError = action.error.message;
      });

    // Resend OTP
    builder
      .addCase(resendOTP.pending, (state) => {
        state.loading = true;
      })
      .addCase(resendOTP.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Request Password Reset
    builder
      .addCase(requestPasswordReset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state, action) => {
        state.loading = false;
        state.resetSessionId = action.payload.data.resetSessionId;
        state.phoneOrEmail = action.payload.data.phoneNumber; // Store for forgot password flow
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Verify Reset OTP
    builder
      .addCase(verifyResetOTP.pending, (state) => {
        state.otpVerificationLoading = true;
        state.otpVerificationError = null;
      })
      .addCase(verifyResetOTP.fulfilled, (state, action) => {
        state.otpVerificationLoading = false;
        state.resetToken = action.payload.data.resetToken;
        state.resetSessionId = null; // Clear session after successful verification
      })
      .addCase(verifyResetOTP.rejected, (state, action) => {
        state.otpVerificationLoading = false;
        state.otpVerificationError = action.error.message;
      });

    // Reset Password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.resetPasswordLoading = true;
        state.resetPasswordError = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.resetPasswordLoading = false;
        state.resetToken = null; // Clear reset token after successful password reset
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetPasswordLoading = false;
        state.resetPasswordError = action.error.message;
      });

    // Resend Reset OTP
    builder
      .addCase(resendResetOTP.pending, (state) => {
        state.loading = true;
      })
      .addCase(resendResetOTP.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resendResetOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Check Auth Status
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.token = action.payload.token || null;
        state.user = action.payload.user || null;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
      });

    // Logout
    builder
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.sessionId = null;
        state.phoneOrEmail = null; // Clear on logout
        state.resetSessionId = null;
        state.resetToken = null;
        state.error = null;
      });
  },
});

export const { clearError, clearSession } = authSlice.actions;
export default authSlice.reducer;