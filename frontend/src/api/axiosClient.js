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
        } catch {
            // Keep original if URL parsing fails.
        }
    }

    return trimmed;
};

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);
const REQUEST_TIMEOUT_MS = 15000;

const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
        'Content-Type': 'application/json',
    },
});

let refreshPromise = null;
let logoutDispatched = false;

const dispatchLogout = () => {
    if (logoutDispatched) return;
    logoutDispatched = true;
    window.dispatchEvent(new CustomEvent('auth:logout'));
    setTimeout(() => {
        logoutDispatched = false;
    }, 0);
};

const getStoredRefreshToken = () => (
    localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token')
);

const persistTokenPair = (accessToken, refreshToken) => {
    if (accessToken) {
        localStorage.setItem('access_token', accessToken);
    }

    if (!refreshToken) return;

    const storage = localStorage.getItem('refresh_token')
        ? localStorage
        : sessionStorage;
    storage.setItem('refresh_token', refreshToken);
};

const clearAuthStorage = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('refresh_token');
};

const isProtectedRequest = (requestConfig) => {
    const headers = requestConfig?.headers || {};
    return Boolean(headers.Authorization || headers.authorization);
};

export const refreshAccessTokenSingleFlight = async () => {
    if (refreshPromise) {
        return refreshPromise;
    }

    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) {
        clearAuthStorage();
        dispatchLogout();
        throw new Error('No refresh token available');
    }

    refreshPromise = (async () => {
        const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            { refresh_token: refreshToken },
            { timeout: REQUEST_TIMEOUT_MS }
        );

        const newAccessToken = response.data?.access_token;
        if (!newAccessToken) {
            throw new Error('Refresh endpoint did not return access token');
        }

        persistTokenPair(newAccessToken, response.data?.refresh_token);
        return newAccessToken;
    })();

    try {
        return await refreshPromise;
    } catch (error) {
        clearAuthStorage();
        dispatchLogout();
        throw error;
    } finally {
        refreshPromise = null;
    }
};

// Request interceptor - auto-inject Authorization header
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle 401 errors with single-flight refresh
axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401
            && originalRequest
            && !originalRequest._retry
            && !String(originalRequest.url || '').includes('/auth/refresh')
        ) {
            originalRequest._retry = true;

            try {
                const newAccessToken = await refreshAccessTokenSingleFlight();
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return axiosClient.request(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        if (
            error.response?.status === 403
            && originalRequest
            && isProtectedRequest(originalRequest)
        ) {
            clearAuthStorage();
            dispatchLogout();
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
