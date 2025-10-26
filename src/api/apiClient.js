import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://pharmsupply-dev-api.pharmconnect.com';

class ApiClient {
    constructor() {
        this.token = null;
        this.tokenPromise = null; // To prevent multiple simultaneous token loads
    }

    // Load token from AsyncStorage (with caching)
    async getToken() {

        // If token is already loaded, return it
        if (this.token) {
            return this.token;
        }

        // If we're already loading the token, wait for that promise
        if (this.tokenPromise) {
            return this.tokenPromise;
        }

        // Load token from AsyncStorage
        this.tokenPromise = AsyncStorage.getItem('authToken')
        .then(token => {
            this.token = token;
            this.tokenPromise = null; // Clear the promise after loading
            return token;
        })
        .catch(error => {
            console.error('Error loading token from AsyncStorage:', error);
            this.tokenPromise = null;
            return null;
        });

        return this.tokenPromise;

    }

    // Set token (also saves to AsyncStorage)
    async setToken(token) {
        this.token = token;
        if (token) {
            await AsyncStorage.setItem('authToken', token);
        } else {
            await AsyncStorage.removeItem('authToken');
        }
    }

    // Clear token from memory (force reload from AsyncStorage next time)
    clearCachedToken() {
        this.token = null;
    }

    async request(endpoint, options = {}) {
        const url = `${BASE_URL}${endpoint}`;
        
        // Get token from AsyncStorage if needed
        const token = await this.getToken();
        
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Accept': '*/*',
                ...options.headers,
            },
        };

        // Add Authorization header only if token exists
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log the request
        // console.log('🚀 API Request:', {
        //     url,
        //     method: config.method || 'GET',
        //     headers: config.headers,
        //     body: config.body ? JSON.parse(config.body) : undefined
        // });

        try {
            
            const response = await fetch(url, config);
            const data = await response.json();

        // Log the response
        // console.log('✅ API Response:', {
        //     url,
        //     status: response.status,
        //     success: data.success,
        //     data: data
        // });

            // Check if the response is successful
            if (!response.ok || !data.success) {
                // If we get 401 Unauthorized, clear the cached token
                if (response.status === 401) {
                    this.clearCachedToken();
                    // Optionally, you can dispatch a logout action here
                    // or emit an event that the app can listen to
                }
                throw new Error(data.message || data.error || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

export default new ApiClient();