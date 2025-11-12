import AsyncStorage from '@react-native-async-storage/async-storage';
import { ErrorMessage } from '../components/view/error';
import { DevSettings } from 'react-native';

export const BASE_URL = 'https://pharmsupply-dev-api.pharmconnect.com';

// Enable or disable logging globally
const ENABLE_API_LOGS = true;

class ApiClient {
    constructor() {
        this.token = null;
        this.tokenPromise = null;
    }

    // Load token from AsyncStorage (with caching)
    async getToken() {
        if (this.token) return this.token;
        if (this.tokenPromise) return this.tokenPromise;

        this.tokenPromise = AsyncStorage.getItem('authToken')
            .then(token => {
                this.token = token;
                this.tokenPromise = null;
                return token;
            })
            .catch(error => {
                console.error('Error loading token from AsyncStorage:', error);
                this.tokenPromise = null;
                return null;
            });

        return this.tokenPromise;
    }

    // Save or remove token
    async setToken(token) {
        this.token = token;
        if (token) await AsyncStorage.setItem('authToken', token);
        else await AsyncStorage.removeItem('authToken');
    }

    async clearCachedToken() {
        this.token = null;
        await AsyncStorage.removeItem('authToken');

        Toast.show({
            type: 'error',
            text1: 'Session Expired',
            text2: 'Please log in again.',
        });

        setTimeout(() => {
            DevSettings.reload();
        }, 1500);

    }

    async request(endpoint, options = {}) {
        const url = `${BASE_URL}${endpoint}`;
        const token = await this.getToken();
        const isFormData = options.body instanceof FormData;

        const config = {
            ...options,
            headers: {
                Accept: '*/*',
                ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
                ...options.headers,
            },


        };

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // --- Generate cURL command ---
        const method = config.method || 'GET';
        const headerStrings = Object.entries(config.headers || {})
            .map(([key, value]) => `-H '${key}: ${value}'`)
            .join(' ');
        const bodyString = config.body ? `--data '${config.body}'` : '';
        const curlCommand = `curl -X ${method} ${headerStrings} ${bodyString} '${url}'`;

        console.log('%c💡 CURL (copy for Postman / terminal):', 'color:#ff9800; font-weight:bold;');
        console.log(curlCommand);

        // --- Log full request ---
        console.log('%c🚀 API REQUEST', 'color:#00bcd4; font-weight:bold;', {
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

        try {
            const response = await fetch(url, config);
            const text = await response.text();
            let data;

            try {
                data = text ? JSON.parse(text) : {};
            } catch {
                data = { message: 'Invalid JSON response', raw: text, status: response?.status };
            }

            // --- Log response ---
            console.log('%c📦 API RESPONSE', 'color:#4caf50; font-weight:bold;', {
                url,
                status: response.status,
                ok: response.ok,
                data,
            });

            // --- Handle errors ---
            if (!response.ok || data?.success === false) {
                const errorInfo = {
                    endpoint,
                    url,
                    status: response.status,
                    message:
                        data?.message ||
                        data?.error ||
                        response.statusText ||
                        'API request failed',
                };


                // console.error('%c❌ API ERROR', 'color:#f44336; font-weight:bold;', errorInfo);

                if (response.status === 401) {
                    this.clearCachedToken();
                }

                const error = new Error(errorInfo.message);
                error.status = response.status;
                error.url = url;
                error.endpoint = endpoint;
                error.response = data;
                if (![401, 200, 201, 400].includes(error.status)) {
                    ErrorMessage(error);
                }
                throw error;
            }

            return data;
        } catch (error) {
            // console.error('%c🌐 NETWORK ERROR', 'color:#ff9800; font-weight:bold;', {
            //     url,
            //     message: error.message,
            //     stack: error.stack,
            // });
            throw error;
        }
    }


    get(endpoint, params = {}) {
        const queryString = Object.keys(params)
            .map(
                key =>
                    `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
            )
            .join('&');
        const urlWithParams = queryString
            ? `${endpoint}?${queryString}`
            : endpoint;

        return this.request(urlWithParams, { method: 'GET' });
    }

    post(endpoint, data, isFormData = false) {
        console.log(isFormData ? data : JSON.stringify(data), 9989898)
        return this.request(endpoint, {
            method: 'POST',
            body: isFormData ? data : JSON.stringify(data),

        });
    }

    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    delete(endpoint, data) {
        return this.request(endpoint, { method: 'DELETE', body: JSON.stringify(data), });
    }
}

export default new ApiClient();
