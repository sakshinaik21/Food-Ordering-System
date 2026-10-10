import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { orderService } from '../services/orderService';

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

function OwnerOrders() {
    const { id: restaurantId } = useParams();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, [restaurantId]);

    const fetchOrders = async () => {
        try {
            const data = await orderService.getOrdersByRestaurant(restaurantId);
            setOrders(data);
        } catch (err) {
            setError('Could not load orders.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        try {
            const updated = await orderService.updateOrderStatus(orderId, newStatus);
            setOrders(orders.map((o) => (o.id === orderId ? updated : o)));
        } catch (err) {
            setError('Could not update order status.');
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <div className="max-w-3xl mx-auto px-6 py-8">
                <Link to="/owner/dashboard" className="text-blue-600 text-sm hover:underline">
                    ← Back to My Restaurants
                </Link>

                <h1 className="text-2xl font-bold text-gray-800 mt-3 mb-6">Orders</h1>

                {error && (
                    <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">{error}</div>
                )}

                {loading && <p className="text-gray-500">Loading...</p>}

                {!loading && orders.length === 0 && (
                    <p className="text-gray-500">No orders yet for this restaurant.</p>
                )}

                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-lg shadow-md p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-semibold text-gray-800">Order #{order.id}</span>
                                <select
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                    disabled={updatingId === order.id}
                                    className="text-sm border border-gray-300 rounded-md px-2 py-1"
                                >
                                    {STATUS_OPTIONS.map((status) => (
                                        <option key={status} value={status}>
                                            {status.replace(/_/g, ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <p className="text-gray-500 text-sm mb-3">
                                {new Date(order.placedAt).toLocaleString()}
                            </p>

                            <div className="space-y-1 mb-3">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm text-gray-600">
                    <span>
                      {item.menuItemName} × {item.quantity}
                    </span>
                                        <span>${item.subtotal.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-3 flex justify-between font-semibold text-gray-800">
                                <span>Total</span>
                                <span>${order.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default OwnerOrders;