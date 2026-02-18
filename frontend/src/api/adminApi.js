import axiosClient from './axiosClient';

export const adminApi = {
    getAnalytics: (days = 7) =>
        axiosClient.get('/api/admin/analytics', { params: { days } }),

    getStats: () =>
        axiosClient.get('/api/admin/stats'),

    getUsers: () =>
        axiosClient.get('/api/admin/users'),
};
