import AsyncStorage from '@react-native-async-storage/async-storage';
import { ErrorMessage } from '../components/view/error';
import { resetTo } from '../navigation/NavigationService';
import Toast from 'react-native-toast-message';
import { authAPI } from './auth';
import { saveToken } from '../redux/slices/authSlice';

export const BASE_URL = 'https://pharmsupply-dev-api.pharmconnect.com';

class ApiClient {
    constructor() {
        this.token = null;
        this.tokenPromise = null;
        this.refreshPromise = null;  // 🔥 Prevents multiple refresh requests
    }

    async getToken() {
        if (this.token) return this.token;
        if (this.tokenPromise) return this.tokenPromise;

        this.tokenPromise = AsyncStorage.getItem('authToken')
            .then(token => {
                this.token = token;
                this.tokenPromise = null;
                return token;
            })
            .catch(err => {
                console.error("Failed to load token:", err);
                this.tokenPromise = null;
                return null;
            });

        return this.tokenPromise;
    }

    async setToken(token) {
        this.token = token;
        if (token) await AsyncStorage.setItem("authToken", token);
        else await AsyncStorage.removeItem("authToken");
    }

    async clearCachedToken() {
        this.token = null;
        await AsyncStorage.removeItem("authToken");
        await AsyncStorage.removeItem("refreshToken");

        Toast.show({
            type: "error",
            text1: "Session Expired",
            text2: "Please log in again"
        });

        setTimeout(() => resetTo("Auth"), 1200);
    }

    // 🔥 AUTO REFRESH + returns new access token
    async refreshAccessToken() {
        if (this.refreshPromise) {
            return this.refreshPromise; // wait for the existing refresh request
        }

        this.refreshPromise = new Promise(async (resolve) => {
            try {
                const refreshToken = await AsyncStorage.getItem("refreshToken");

                if (!refreshToken) {
                    console.log("⚠️ No refresh token found");
                    resolve(null);
                    return;
                }

                console.log("🔄 Refreshing token…");

                // Call refresh-token API
                const response = await authAPI.refreshToken({
                    refreshToken,
                });

                const newToken = response.data?.token;
                const newRefresh = response.data?.refreshToken;

                if (newToken) {
                    // Save both tokens using your existing helper
                    await saveToken(response.data);

                    // Update in-memory token
                    this.token = newToken;

                    console.log("✅ Token refreshed successfully.");
                    resolve(newToken);
                } else {
                    console.log("❌ Refresh API did not return a token");
                    resolve(null);
                }
            } catch (err) {
                console.log("❌ Refresh failed:", err);
                resolve(null);
            } finally {
                this.refreshPromise = null; // allow next refresh call
            }
        });

        return this.refreshPromise;
    }


    // 🧨 MAIN REQUEST (with retry support)
    async request(endpoint, options = {}, retry = false) {
        const url = `${BASE_URL}${endpoint}`;
        const token = await this.getToken();
        const isFormData = options.body instanceof FormData;

        const config = {
            ...options,
            headers: {
                Accept: "*/*",
                ...(isFormData ? {} : { "Content-Type": "application/json" }),
                ...options.headers,
            }
        };

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // -----------------------------
        //       🔥 cURL LOGGING
        // -----------------------------
        const method = config.method || "GET";
        const headerStrings = Object.entries(config.headers || {})
            .map(([k, v]) => `-H '${k}: ${v}'`)
            .join(" ");

        const bodyString =
            config.body && !(config.body instanceof FormData)
                ? `--data '${config.body}'`
                : "";

        const curl = `curl -X ${method} ${headerStrings} ${bodyString} '${url}'`;

        console.log("%c💡 CURL:", "color:#ff9800;font-weight:bold;");
        console.log(curl);

        // -----------------------------
        //     🔥 REQUEST LOGGING
        // -----------------------------
        console.log("%c🚀 API REQUEST", "color:#00bcd4;font-weight:bold;", {
            url,
            method,
            headers: config.headers,
            body:
                config.body &&
                (() => {
                    try {
                        return JSON.parse(config.body);
                    } catch {
                        return config.body;
                    }
                })(),
        });

        // -----------------------------
        //          FETCH CALL
        // -----------------------------
        let responseText = "";
        let response;

        try {
            response = await fetch(url, config);
            responseText = await response.text();
        } catch (err) {
            throw new Error("Network Error");
        }

        let data = {};
        try {
            data = responseText ? JSON.parse(responseText) : {};
        } catch {
            data = { message: "Invalid JSON", raw: responseText };
        }

        // -----------------------------
        //       🔥 RESPONSE LOGGING
        // -----------------------------
        console.log("%c📦 API RESPONSE", "color:#4caf50;font-weight:bold;", {
            url,
            status: response.status,
            ok: response.ok,
            data,
        });

        // -----------------------------
        //     🔥 TOKEN EXPIRED HANDLING
        // -----------------------------
        if (response.status === 401 && !retry) {
            console.log("⚠️ 401 detected → refreshing token…");

            const newToken = await this.refreshAccessToken();

            if (newToken) {
                console.log("🔁 Retrying previous API:", endpoint);

                return this.request(endpoint, options, true);
            }

            console.log("❌ Refresh failed → logging out");
            // await this.clearCachedToken();
            throw new Error("Session expired");
        }

        // -----------------------------
        //     🔥 ANY OTHER ERROR
        // -----------------------------
        if (!response.ok || data?.success === false) {
            const error = new Error(data?.message || "API Error");
            error.status = response.status;
            error.response = data;

            if (![401, 200, 201, 400].includes(error.status)) {
                ErrorMessage(error);
            }

            throw error;
        }

        return data;
    }

    get(endpoint, params = {}) {
        const qs = Object.entries(params)
            .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
            .join("&");

        return this.request(qs ? `${endpoint}?${qs}` : endpoint, { method: "GET" });
    }

    post(endpoint, data) {
        return this.request(endpoint, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    put(endpoint, data) {
        return this.request(endpoint, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }

    patch(endpoint, data) {
        return this.request(endpoint, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    }

    delete(endpoint, data) {
        return this.request(endpoint, {
            method: "DELETE",
            body: JSON.stringify(data),
        });
    }
}

export default new ApiClient();
