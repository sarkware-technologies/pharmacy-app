import apiClient from './apiClient';

// Mock implementations for now
export const authAPI = {

    login: async (phoneOrEmail, password) => {

        // Mock API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'OTP sent successfully',
                    data: {
                        sessionId: 'mock-session-123',
                        phoneNumber: phoneOrEmail,
                    },
                });
            }, 1500);
        });

    },

    verifyOTP: async (sessionId, otp) => {
        
        // Mock API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (otp === '5395') {
                    resolve({
                        success: true,
                        data: {
                            token: 'mock-jwt-token-xyz',
                            user: {
                                id: '1',
                                name: 'John Doe',
                                email: 'john@pharmacy.com',
                                phone: '9080706050',
                            },
                        },
                    });
                } else {
                    reject(new Error('Invalid OTP'));
                }
            }, 1000);
        });

    },

    resendOTP: async (sessionId) => {

        // Mock API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'OTP resent successfully',
                });
            }, 800);
        });

    },

    // Forgot Password mock implementations
    requestPasswordReset: async (mobileNumber) => {

        // Mock API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'OTP sent for password reset',
                    data: {
                        resetSessionId: 'mock-reset-session-456',
                        phoneNumber: mobileNumber,
                    },
                });
            }, 1200);
        });

    },

    verifyResetOTP: async (resetSessionId, otp) => {

        // Mock API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (otp === '5395') {
                    resolve({
                        success: true,
                        data: {
                            resetToken: 'mock-reset-token-789',
                        },
                    });
                } else {
                    reject(new Error('Invalid OTP'));
                }
            }, 1000);
        });

    },

    resetPassword: async (resetToken, newPassword) => {

        // Mock API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simple validation for mock
                if (newPassword.length >= 8) {
                    resolve({
                        success: true,
                        message: 'Password reset successfully',
                        data: {},
                    });
                } else {
                    reject(new Error('Password does not meet requirements'));
                }
            }, 1200);
        });

    },

    resendResetOTP: async (resetSessionId) => {

        // Mock API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'Reset OTP resent successfully',
                });
            }, 800);
        });

    }
    
};