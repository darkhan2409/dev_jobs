import axios from 'axios';

const normalizeApiBaseUrl = (rawApiUrl) => {
    if (!rawApiUrl) return '/api';

    const trimmed = rawApiUrl.trim().replace(/\/+$/, '');
    if (!trimmed || trimmed === '/') return '/api';

    if (/^https?:\/\//i.test(trimmed)) {
        try {
            const parsed = new URL(trimmed);
            if (!parsed.pathname || parsed.pathname === '/') {
                return `${trimmed}/api`;
            }
        } catch (_err) {
            // Keep original if URL parsing fails.
        }
    }

    return trimmed;
};

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - auto-inject Authorization header
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle 401 errors with auto-refresh
axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and we haven't retried yet, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');

            if (refreshToken) {
                try {
                    // Try to refresh the access token
                    const response = await axios.post(
                        `${API_BASE_URL}/auth/refresh`,
                        { refresh_token: refreshToken }
                    );

                    const newAccessToken = response.data.access_token;

                    // Update stored token
                    localStorage.setItem('access_token', newAccessToken);

                    // Token Rotation: Save new refresh token if provided
                    if (response.data.refresh_token) {
                        const storage = localStorage.getItem('refresh_token')
                            ? localStorage
                            : sessionStorage;
                        storage.setItem('refresh_token', response.data.refresh_token);
                    }

                    // Update the failed request's auth header and retry
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return axiosClient.request(originalRequest);

                } catch (refreshError) {
                    // Refresh failed - logout user
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    sessionStorage.removeItem('refresh_token');
                    window.dispatchEvent(new CustomEvent('auth:logout'));
                    return Promise.reject(refreshError);
                }
            } else {
                // No refresh token - logout
                localStorage.removeItem('access_token');
                window.dispatchEvent(new CustomEvent('auth:logout'));
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
