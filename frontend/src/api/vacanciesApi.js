import axiosClient from './axiosClient';

export const vacanciesApi = {
    getAll: (params) => axiosClient.get('/vacancies', { params }),
    getById: (id) => axiosClient.get(`/vacancies/${id}`),
    getFilters: () => axiosClient.get('/filters')
};
