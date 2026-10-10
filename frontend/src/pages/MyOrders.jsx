import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { orderService } from '../services/orderService';

function MyOrders() {
    const location = useLocation();
    const justPlacedOrderId = location.state?.justPlaced;

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancellingId, setCancellingId] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await orderService.getMyOrders();
                setOrders(data);
            } catch (err) {
                setError('Could not load your orders.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handleCancel = async (orderId) => {
        if (!window.confirm('Cancel this order? This cannot be undone.')) return;

        setCancellingId(orderId);
        setError('');

        try {
            const updated = await orderService.cancelOrder(orderId);
            setOrders(orders.map((o) => (o.id === orderId ? updated : o)));
        } catch (err) {
            const message = err.response?.data?.message || 'Could not cancel this order.';
            setError(message);
        } finally {
            setCancellingId(null);
        }
    };

    const statusColors = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        CONFIRMED: 'bg-blue-100 text-blue-800',
        PREPARING: 'bg-orange-100 text-orange-800',
        OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-800',
        DELIVERED: 'bg-green-100 text-green-800',
        CANCELLED: 'bg-red-100 text-red-800',
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <div className="max-w-3xl mx-auto px-6 py-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>

                {justPlacedOrderId && (
                    <div className="bg-green-100 text-green-800 px-4 py-3 rounded mb-6">
                        Order #{justPlacedOrderId} placed successfully!
                    </div>
                )}

                {loading && <p className="text-gray-500">Loading orders...</p>}

                {error && (
                    <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">{error}</div>
                )}

                {!loading && !error && orders.length === 0 && (
                    <p className="text-gray-500">You haven't placed any orders yet.</p>
                )}

                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-lg shadow-md p-5">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="font-semibold text-gray-800">{order.restaurantName}</h2>
                                <span
                                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                                        statusColors[order.status] || 'bg-gray-100 text-gray-700'
                                    }`}
                                >
                  {order.status.replace(/_/g, ' ')}
                </span>
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

                            <div className="border-t pt-3 flex items-center justify-between">
                                <div className="font-semibold text-gray-800">
                                    <span>Total: </span>
                                    <span>${order.totalAmount.toFixed(2)}</span>
                                </div>

                                {order.status === 'PENDING' && (
                                    <button
                                        onClick={() => handleCancel(order.id)}
                                        disabled={cancellingId === order.id}
                                        className="text-red-600 text-sm font-medium hover:underline disabled:opacity-50"
                                    >
                                        {cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MyOrders;