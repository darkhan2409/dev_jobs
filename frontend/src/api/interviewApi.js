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
    getCareerGraph: () => axiosClient.get('/interview/career/graph'),
    getRoleClusters: () => axiosClient.get('/interview/career/clusters'),
    getNextSteps: (roleId) => axiosClient.get(`/interview/career/roles/${roleId}/next`),
    getRoleDetails: (roleId) => axiosClient.get(`/interview/roles/${roleId}`)
};
