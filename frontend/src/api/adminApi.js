import axiosClient from './axiosClient';

export const adminApi = {
    getAnalytics: (days = 7) =>
        axiosClient.get('/admin/analytics', { params: { days } }),

    getStats: () =>
        axiosClient.get('/admin/stats'),

    getUsers: () =>
        axiosClient.get('/admin/users'),
};
