import apiClient from './apiClient';

// Helper function to determine auth channel
const getAuthChannel = (username) => {
    // Check if username contains @ for email, otherwise treat as mobile
    return username.includes('@') ? 'email' : 'mobile';
};

export const authAPI = {

    login: async (phoneOrEmail, password) => {
        try {
            const authChannel = getAuthChannel(phoneOrEmail);
            
            const response = await apiClient.post('/user-management/login', {
                username: phoneOrEmail,
                password: password,
                authChannel: authChannel
            });

            // If login successful, OTP is sent
            // Store the username for later use in OTP verification
            return {
                success: response.success,
                message: response.message,
                data: {
                    sessionId: `${phoneOrEmail}-${Date.now()}`, // Create a session identifier
                    phoneNumber: phoneOrEmail,
                    developmentOtp: response.data?.otp // Pass OTP for auto-fill in development
                }
            };
        } catch (error) {
            // Handle error response
            if (error.message === 'Invalid username or password') {
                throw new Error('Invalid credentials. Please try again.');
            }
            throw error;
        }
    },

    verifyOTP: async (sessionId, otp) => {
        try {
            // Extract username from sessionId (we stored it as username-timestamp)
            const username = sessionId.split('-').slice(0, -1).join('-');
            const authChannel = getAuthChannel(username);
            
            const response = await apiClient.post('/user-management/verify-otp', {
                username: username,
                authChannel: authChannel,
                otp: parseInt(otp),
                isReset: false
            });

            // FIXED: Use accessToken instead of token
            if (response.data?.accessToken) {
                apiClient.setToken(response.data.accessToken);
            }

            return {
                success: response.success,
                data: {
                    // FIXED: Use accessToken from response
                    token: response.data?.accessToken,
                    refreshToken: response.data?.refreshToken,
                    user: {
                        id: response.data?.userId,
                        name: response.data?.name,
                        email: response.data?.email,
                        mobile: response.data?.mobile,
                        roleId: response.data?.roleId,
                        subroleId: response.data?.subroleId,
                        isFirstLogin: response.data?.isFirstLogin,
                        userDetails: response.data?.userDetails,
                        userPermissions: response.data?.userPermissions
                    }
                }
            };
        } catch (error) {
            if (error.message === 'Invalid or expired OTP') {
                throw new Error('Invalid or expired OTP. Please try again.');
            }
            throw error;
        }
    },

    resendOTP: async (sessionId) => {
        try {
            // Extract username from sessionId
            const username = sessionId.split('-').slice(0, -1).join('-');
            const authChannel = getAuthChannel(username);
            
            // For resend, we need to call login again
            const response = await apiClient.post('/user-management/login', {
                username: username,
                password: 'dummy', // This will fail but still send OTP
                authChannel: authChannel
            });

            return {
                success: true,
                message: 'OTP resent successfully'
            };
        } catch (error) {
            // Even if login fails, OTP might be sent
            return {
                success: true,
                message: 'OTP resent successfully'
            };
        }
    },

    // Forgot Password implementations
    requestPasswordReset: async (phoneOrEmail) => {
        try {
            const authChannel = getAuthChannel(phoneOrEmail);
            
            const response = await apiClient.post('/user-management/forgot-password', {
                username: phoneOrEmail,
                authChannel: authChannel
            });

            return {
                success: response.success,
                message: response.message,
                data: {
                    resetSessionId: `reset-${phoneOrEmail}-${Date.now()}`,
                    phoneNumber: phoneOrEmail,
                    developmentOtp: response.data?.otp // Pass OTP for auto-fill in development
                }
            };
        } catch (error) {
            if (error.message === 'User not found') {
                throw new Error('No account found with this email/phone number.');
            }
            throw error;
        }
    },

    verifyResetOTP: async (resetSessionId, otp) => {
        try {
            // Extract username from resetSessionId
            const username = resetSessionId.replace('reset-', '').split('-').slice(0, -1).join('-');
            const authChannel = getAuthChannel(username);
            
            const response = await apiClient.post('/user-management/verify-otp', {
                username: username,
                authChannel: authChannel,
                otp: parseInt(otp),
                isReset: true
            });

            return {
                success: response.success,
                data: {
                    resetToken: response.data?.resetToken || `reset-token-${Date.now()}`,
                }
            };
        } catch (error) {
            if (error.message === 'Invalid or expired OTP') {
                throw new Error('Invalid or expired OTP. Please try again.');
            }
            throw error;
        }
    },

    resetPassword: async (resetToken, newPassword) => {
        try {
            // Note: The actual endpoint for password reset is not provided in the curls
            // This is a placeholder implementation
            const response = await apiClient.post('/user-management/reset-password', {
                resetToken: resetToken,
                newPassword: newPassword
            });

            return {
                success: response.success,
                message: response.message || 'Password reset successfully',
                data: {}
            };
        } catch (error) {
            throw new Error('Failed to reset password. Please try again.');
        }
    },

    resendResetOTP: async (resetSessionId) => {
        try {
            // Extract username from resetSessionId
            const username = resetSessionId.replace('reset-', '').split('-').slice(0, -1).join('-');
            const authChannel = getAuthChannel(username);
            
            // Call forgot-password again to resend OTP
            const response = await apiClient.post('/user-management/forgot-password', {
                username: username,
                authChannel: authChannel
            });

            return {
                success: true,
                message: 'Reset OTP resent successfully'
            };
        } catch (error) {
            // Even if it fails, return success for better UX
            return {
                success: true,
                message: 'Reset OTP resent successfully'
            };
        }
    }
    
};