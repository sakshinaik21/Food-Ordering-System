import api from './api';

export const orderService = {
    placeOrder: async (orderData) => {
        const response = await api.post('/orders', orderData);
        return response.data;
    },

    getMyOrders: async () => {
        const response = await api.get('/orders/my-orders');
        return response.data;
    },

    getOrdersByRestaurant: async (restaurantId) => {
        const response = await api.get(`/orders/restaurant/${restaurantId}`);
        return response.data;
    },

    updateOrderStatus: async (orderId, status) => {
        const response = await api.patch(`/orders/${orderId}/status`, { status });
        return response.data;
    },

    cancelOrder: async (orderId) => {
        const response = await api.patch(`/orders/${orderId}/cancel`);
        return response.data;
    },
};