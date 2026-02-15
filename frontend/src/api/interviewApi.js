import axiosClient from './axiosClient';

export const interviewApi = {
    getQuestions: () => axiosClient.get('/interview/questions'),

    startTest: () => axiosClient.post('/interview/start'),

    submitAnswer: (sessionId, questionId, answerOptionId) =>
        axiosClient.post(`/interview/answer/${sessionId}`, {
            question_id: questionId,
            answer_option_id: answerOptionId
        }),

    completeTest: (sessionId) =>
        axiosClient.post(`/interview/complete/${sessionId}`),

    // Career Pipeline Endpoints
    getRoleDetails: (roleId) => axiosClient.get(`/interview/roles/${roleId}`),
    getMarketData: (roleId) => axiosClient.get(`/vacancies/market-stats/${roleId}`),

    // Product Stages Endpoints
    getStageDetails: (stageId) => axiosClient.get(`/interview/stages/${stageId}`)
};
