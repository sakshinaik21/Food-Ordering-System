import api from './api';

export const restaurantService = {
    getAllRestaurants: async () => {
        const response = await api.get('/restaurants');
        return response.data;
    },

    getRestaurantById: async (id) => {
        const response = await api.get(`/restaurants/${id}`);
        return response.data;
    },

    createRestaurant: async (restaurantData) => {
        const response = await api.post('/restaurants', restaurantData);
        return response.data;
    },

    getMyRestaurants: async () => {
        const response = await api.get('/restaurants/my-restaurants');
        return response.data;
    },

    updateRestaurant: async (id, restaurantData) => {
        const response = await api.put(`/restaurants/${id}`, restaurantData);
        return response.data;
    },

    deactivateRestaurant: async (id) => {
        await api.delete(`/restaurants/${id}`);
    },
};