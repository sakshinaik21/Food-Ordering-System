import api from './api';

export const reviewService = {
    getReviewsByRestaurant: async (restaurantId) => {
        const response = await api.get(`/reviews/restaurant/${restaurantId}`);
        return response.data;
    },

    getRestaurantRating: async (restaurantId) => {
        const response = await api.get(`/reviews/restaurant/${restaurantId}/rating`);
        return response.data;
    },

    addReview: async (restaurantId, reviewData) => {
        const response = await api.post(`/reviews/restaurant/${restaurantId}`, reviewData);
        return response.data;
    },

    deleteReview: async (reviewId) => {
        await api.delete(`/reviews/${reviewId}`);
    },
};