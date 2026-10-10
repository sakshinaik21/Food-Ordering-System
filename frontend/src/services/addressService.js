import api from './api';

export const addressService = {
    getMyAddresses: async () => {
        const response = await api.get('/addresses/my-addresses');
        return response.data;
    },

    addAddress: async (addressData) => {
        const response = await api.post('/addresses', addressData);
        return response.data;
    },

    deleteAddress: async (addressId) => {
        await api.delete(`/addresses/${addressId}`);
    },
};