import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

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
                    const response = await axiosClient.get('/auth/me');
                    setUser(response.data);
                } catch (error) {
                    // Token invalid or expired
                    localStorage.removeItem('access_token');
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

    const login = useCallback(async (email, password) => {
        // OAuth2 form expects username field
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const response = await axiosClient.post('/auth/token', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token } = response.data;
        localStorage.setItem('access_token', access_token);

        // Fetch user info
        const userResponse = await axiosClient.get('/auth/me');
        setUser(userResponse.data);

        return userResponse.data;
    }, []);

    const register = useCallback(async (email, password) => {
        const response = await axiosClient.post('/auth/register', {
            email,
            password
        });
        return response.data;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('access_token');
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
