import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Session restoration on page load
    useEffect(() => {
        const restoreSession = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const response = await authApi.getMe();
                    setUser(response.data);
                    setupTokenRefresh();
                } catch {
                    // Token invalid or expired
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    sessionStorage.removeItem('refresh_token');
                    setUser(null);
                }
            }
            setIsLoading(false);
        };

        restoreSession();
    }, []);

    // Listen for 401 logout events from axiosClient
    useEffect(() => {
        const handleLogout = () => {
            setUser(null);
        };

        window.addEventListener('auth:logout', handleLogout);
        return () => window.removeEventListener('auth:logout', handleLogout);
    }, []);

    // Auto-refresh token logic
    const setupTokenRefresh = useCallback(() => {
        // Refresh token 2 minutes before expiration (access token is 15 min)
        const refreshInterval = setInterval(async () => {
            const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');

            if (refreshToken) {
                try {
                    const response = await authApi.refresh(refreshToken);
                    localStorage.setItem('access_token', response.data.access_token);

                    // Token Rotation: Save new refresh token if provided
                    if (response.data.refresh_token) {
                        const storage = localStorage.getItem('refresh_token')
                            ? localStorage
                            : sessionStorage;
                        storage.setItem('refresh_token', response.data.refresh_token);
                    }
                } catch (error) {
                    console.error('Token refresh failed:', error);
                    // Logout will be triggered by axios interceptor
                }
            }
        }, 13 * 60 * 1000); // 13 minutes

        return () => clearInterval(refreshInterval);
    }, []);

    const login = useCallback(async (email, password, rememberMe = false) => {
        const response = await authApi.login(email, password);

        const { access_token, refresh_token } = response.data;
        localStorage.setItem('access_token', access_token);

        // Store refresh token based on remember me preference
        if (rememberMe) {
            localStorage.setItem('refresh_token', refresh_token);
        } else {
            sessionStorage.setItem('refresh_token', refresh_token);
        }

        // Fetch user info
        const userResponse = await authApi.getMe();
        setUser(userResponse.data);

        // Setup auto-refresh
        setupTokenRefresh();

        return userResponse.data;
    }, [setupTokenRefresh]);

    const register = useCallback(async (username, email, password) => {
        const response = await authApi.register(username, email, password);
        return response.data;
    }, []);

    const logout = useCallback(async () => {
        const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');

        // Try to revoke refresh token on server
        if (refreshToken) {
            try {
                await authApi.logout(refreshToken);
            } catch (error) {
                console.error('Logout error:', error);
            }
        }

        // Clear local storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        sessionStorage.removeItem('refresh_token');
        setUser(null);
    }, []);

    const value = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        register
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
