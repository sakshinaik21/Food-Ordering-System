import api from './api';

export const menuItemService = {
    getMenuItemsByRestaurant: async (restaurantId) => {
        const response = await api.get(`/menu-items/restaurant/${restaurantId}`);
        return response.data;
    },

    addMenuItem: async (restaurantId, menuItemData) => {
        const response = await api.post(`/menu-items/restaurant/${restaurantId}`, menuItemData);
        return response.data;
    },

    updateMenuItem: async (menuItemId, menuItemData) => {
        const response = await api.put(`/menu-items/${menuItemId}`, menuItemData);
        return response.data;
    },

    deleteMenuItem: async (menuItemId) => {
        await api.delete(`/menu-items/${menuItemId}`);
    },
};