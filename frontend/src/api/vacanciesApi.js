import axiosClient from './axiosClient';

export const vacanciesApi = {
    getAll: (params, config = {}) => axiosClient.get('/vacancies', { params, ...config }),
    getById: (id) => axiosClient.get(`/vacancies/${id}`),
    getFilters: () => axiosClient.get('/filters')
};
