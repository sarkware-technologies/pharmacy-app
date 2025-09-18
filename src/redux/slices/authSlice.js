import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../api/auth';
import apiClient from '../../api/apiClient';

export const login = createAsyncThunk(
    'auth/login',
    async ({ phoneOrEmail, password }) => {
        const response = await authAPI.login(phoneOrEmail, password);
        return response.data;
    }
);

export const verifyOTP = createAsyncThunk(
    'auth/verifyOTP',
    async ({ sessionId, otp }) => {
        const response = await authAPI.verifyOTP(sessionId, otp);
        return response.data;
    }
);

export const resendOTP = createAsyncThunk(
    'auth/resendOTP',
    async ({ sessionId }) => {
        const response = await authAPI.resendOTP(sessionId);
        return response;
    }
);

// Forgot Password Actions
export const requestPasswordReset = createAsyncThunk(
    'auth/requestPasswordReset',
    async ({ mobileNumber }) => {
        const response = await authAPI.requestPasswordReset(mobileNumber);
        return response.data;
    }
);

export const verifyResetOTP = createAsyncThunk(
    'auth/verifyResetOTP',
    async ({ resetSessionId, otp }) => {
        const response = await authAPI.verifyResetOTP(resetSessionId, otp);
        return response.data;
    }
);

export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async ({ resetToken, newPassword }) => {
        const response = await authAPI.resetPassword(resetToken, newPassword);
        return response.data;
    }
);

export const resendResetOTP = createAsyncThunk(
    'auth/resendResetOTP',
    async ({ resetSessionId }) => {
        const response = await authAPI.resendResetOTP(resetSessionId);
        return response;
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        token: null,
        sessionId: null,
        phoneNumber: null,
        // Forgot Password states
        resetSessionId: null,
        resetToken: null,
        resetPhoneNumber: null,
        isLoading: false,
        error: null,
        isAuthenticated: false,
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.sessionId = null;
            state.phoneNumber = null;
            state.isAuthenticated = false;
            state.error = null;
            state.resetSessionId = null;
            state.resetToken = null;
            state.resetPhoneNumber = null;
            apiClient.setToken(null);
        },
        clearError: (state) => {
            state.error = null;
        },
        clearResetSession: (state) => {
            state.resetSessionId = null;
            state.resetToken = null;
            state.resetPhoneNumber = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
        // Login
        .addCase(login.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(login.fulfilled, (state, action) => {
            state.isLoading = false;            
            state.sessionId = action.payload.sessionId;
            state.phoneNumber = action.payload.phoneNumber;
        })
        .addCase(login.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.error.message;
        })
        // Verify OTP
        .addCase(verifyOTP.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(verifyOTP.fulfilled, (state, action) => {
            state.isLoading = false;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            apiClient.setToken(action.payload.token);
        })
        .addCase(verifyOTP.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.error.message;
        })
        // Resend OTP
        .addCase(resendOTP.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(resendOTP.fulfilled, (state) => {
            state.isLoading = false;
        })
        .addCase(resendOTP.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.error.message;
        })
        // Request Password Reset
        .addCase(requestPasswordReset.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(requestPasswordReset.fulfilled, (state, action) => {
            state.isLoading = false;
            state.resetSessionId = action.payload.resetSessionId;
            state.resetPhoneNumber = action.payload.phoneNumber;
        })
        .addCase(requestPasswordReset.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.error.message;
        })
        // Verify Reset OTP
        .addCase(verifyResetOTP.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(verifyResetOTP.fulfilled, (state, action) => {
            state.isLoading = false;
            state.resetToken = action.payload.resetToken;
        })
        .addCase(verifyResetOTP.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.error.message;
        })
        // Reset Password
        .addCase(resetPassword.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(resetPassword.fulfilled, (state) => {
            state.isLoading = false;
            // Clear reset session data after successful password reset
            state.resetSessionId = null;
            state.resetToken = null;
            state.resetPhoneNumber = null;
        })
        .addCase(resetPassword.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.error.message;
        })
        // Resend Reset OTP
        .addCase(resendResetOTP.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(resendResetOTP.fulfilled, (state) => {
            state.isLoading = false;
        })
        .addCase(resendResetOTP.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.error.message;
        });
    },
});

export const { logout, clearError, clearResetSession } = authSlice.actions;
export default authSlice.reducer;