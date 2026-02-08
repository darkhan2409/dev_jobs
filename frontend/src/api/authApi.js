import axiosClient from './axiosClient';

export const authApi = {
    login: (username, password) => {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        return axiosClient.post('/auth/token', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
    },
    register: (username, email, password) => axiosClient.post('/auth/register', { username, email, password }),
    getMe: () => axiosClient.get('/auth/me'),
    refresh: (refreshToken) => axiosClient.post('/auth/refresh', { refresh_token: refreshToken }),
    logout: (refreshToken) => axiosClient.post('/auth/logout', { refresh_token: refreshToken }),
    logoutAll: () => axiosClient.post('/auth/logout-all'),
    changePassword: (oldPassword, newPassword) =>
        axiosClient.post('/auth/change-password', { old_password: oldPassword, new_password: newPassword }),
    sendVerificationEmail: () => axiosClient.post('/auth/send-verification-email'),
    verifyEmail: (token) => axiosClient.post('/auth/verify-email', { token }),
    forgotPassword: (email) => axiosClient.post('/auth/forgot-password', { email }),
    resetPassword: (token, newPassword) =>
        axiosClient.post('/auth/reset-password', { token, new_password: newPassword }),
    getSessions: () => axiosClient.get('/auth/sessions'),
    revokeSession: (tokenId) => axiosClient.delete(`/auth/sessions/${tokenId}`),
    deleteAccount: (password) => axiosClient.delete('/auth/account', { data: { password } })
};
