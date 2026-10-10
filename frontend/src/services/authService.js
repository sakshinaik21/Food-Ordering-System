import api from './api';

export const authService = {
    register: async (registerData) => {
        const response = await api.post('/auth/register', registerData);
        return response.data;
    },

    login: async (loginData) => {
        const response = await api.post('/auth/login', loginData);
        return response.data;
    },
};