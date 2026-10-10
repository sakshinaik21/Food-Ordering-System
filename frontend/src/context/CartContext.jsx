import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [restaurantId, setRestaurantId] = useState(null);
    const [restaurantName, setRestaurantName] = useState(null);
    const [items, setItems] = useState([]); // [{ menuItemId, name, price, quantity }]

    const addItem = (menuItem, restaurant) => {
        // Enforce single-restaurant cart: switching restaurants clears the old cart
        if (restaurantId && restaurantId !== restaurant.id) {
            const confirmSwitch = window.confirm(
                `Your cart has items from ${restaurantName}. Start a new cart for ${restaurant.name}?`
            );
            if (!confirmSwitch) return;
            setItems([]);
        }

        setRestaurantId(restaurant.id);
        setRestaurantName(restaurant.name);

        setItems((prevItems) => {
            const existing = prevItems.find((i) => i.menuItemId === menuItem.id);
            if (existing) {
                return prevItems.map((i) =>
                    i.menuItemId === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [
                ...prevItems,
                { menuItemId: menuItem.id, name: menuItem.name, price: menuItem.price, quantity: 1 },
            ];
        });
    };

    const removeItem = (menuItemId) => {
        setItems((prevItems) => prevItems.filter((i) => i.menuItemId !== menuItemId));
    };

    const updateQuantity = (menuItemId, quantity) => {
        if (quantity <= 0) {
            removeItem(menuItemId);
            return;
        }
        setItems((prevItems) =>
            prevItems.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity } : i))
        );
    };

    const clearCart = () => {
        setItems([]);
        setRestaurantId(null);
        setRestaurantName(null);
    };

    const getTotal = () => {
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    const getItemCount = () => {
        return items.reduce((sum, item) => sum + item.quantity, 0);
    };

    const value = {
        restaurantId,
        restaurantName,
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}